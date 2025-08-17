import fs from "fs";
import path from "path";
import type { Type as TsMorphType, SourceFile, InterfaceDeclaration } from "ts-morph";
import { SrcDir, resolveTsPath } from "./pathUtils.js";
import { sharedProject, fallbackProject } from "./fileUtils.js";

/**
 * Propsの型定義をテキスト形式で抽出
 * @param content コンポーネントのコード
 * @returns Propsの型定義をHTMLエスケープしたテキスト
 */
const extractPropsText = (sourceFile: SourceFile, _interfaceDec?: InterfaceDeclaration): string => {
  const interfaceDec = _interfaceDec || sourceFile.getInterface("Props");
  if (!interfaceDec) return "";

  // 初期: Props インターフェースの文字列
  let textCode: string[] = [interfaceDec.getText()];

  for (const prop of interfaceDec.getProperties()) {
    const type = prop.getType();

    // 再帰で string[] を返す
    const ret = addToTextCode(sourceFile, type);
    textCode.push(...ret); // ネストなしでマージ
  }

  const textCodeStr = textCode
    .filter((one): one is string => typeof one === "string") // 念のため
    .map(convertTextCode)
    .join("<br>"); // 改行を <br> に変換

  return textCodeStr;
};

function convertTextCode(textCode?: string): string {
  if (typeof textCode !== "string") return "";
  return textCode
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/ {2}/g, "&nbsp;&nbsp;") // 2スペースをnbspで維持
    .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;") // タブもスペースに
    .replace(/\n/g, "<br>")
    .replace(/{/g, "&#123;")
    .replace(/}/g, "&#125;");
}

// textCode を受け取らず、毎回 string[] を返す形に統一
function addToTextCode(sourceFile: SourceFile, type: TsMorphType): string[] {
  const addText: string[] = [];

  // インポートされた型の場合
  const result = extractImportedTypeBody(sourceFile, type.getText());
  if (result?.importType) {
    addText.push(result.importType as string);
  }

  // オブジェクト型の場合
  if (type.isObject()) {
    for (const prop of type.getProperties()) {
      const decl = prop.getDeclarations()[0];
      if (!decl) continue;
      const propType = prop.getTypeAtLocation(decl);
      const innerText = addToTextCode(sourceFile, propType);
      addText.push(...innerText);
    }
  }

  // ユニオン型の場合
  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes();
    for (const unionType of unionTypes) {
      const unionText = addToTextCode(sourceFile, unionType);
      addText.push(...unionText);
    }
  }

  return addText;
}

function resolveWithFallback(type: TsMorphType, fallbackText?: string): TsMorphType {
  if ((type.getText() === "any" || type.isUndefined()) && fallbackText) {
    const tempFile = fallbackProject.createSourceFile("temp.ts", `const temp: ${fallbackText} = null as any;`, {
      overwrite: true,
    });
    const varDecl = tempFile.getVariableDeclarationOrThrow("temp");
    return varDecl.getType();
  }
  return type;
}

/**
 * 型に応じたダミー値を生成
 * @param type 型情報
 * @param sourceFile 型がimportされたファイル（必要な場合）
 * @returns ダミー値
 */
const generateDummyValue = (type: TsMorphType, sourceFile?: SourceFile): any => {
  const correctedType = resolveWithFallback(type, type.getText());

  // 原始型の処理
  if (correctedType.isString()) return "dummy string";
  if (correctedType.isBoolean()) return false;
  if (correctedType.isNumber()) return 0;

  // カスタム処理: 特定の型名に基づくダミー
  const typeText = correctedType.getText();

  // Union 型 (null | undefined を除外)
  if (correctedType.isUnion()) {
    const values = correctedType.getUnionTypes().filter((t) => !t.isUndefined() && !t.isNull());
    let firstType = values[0];
    // 最初と末尾のクオーテーションを削除してから文字列を返す
    if (firstType.getText().startsWith('"') && firstType.getText().endsWith('"')) {
      return firstType.getText().slice(1, -1);
    }
    return generateDummyValue(firstType, sourceFile);
  }

  // 配列型
  if (correctedType.isArray() || typeText.trim().endsWith("[]")) {
    const arrType = correctedType.getArrayElementType();

    // ★ arrType が Object（Record型など）かどうかで分岐
    if (arrType?.isObject() && !arrType.isString() && !arrType.isNumber() && !arrType.isBoolean()) {
      const obj: Record<string, any> = {};
      for (const p of arrType.getProperties()) {
        const decls = p.getDeclarations();
        if (decls.length > 0) {
          if (isImageMetadataImport(p.getTypeAtLocation(decls[0]).getText())) {
            obj[p.getName()] = "__imageMeta";
          } else {
            obj[p.getName()] = generateDummyValue(p.getTypeAtLocation(decls[0]), sourceFile);
          }
        }
      }
      return [obj];
    } else {
      // プリミティブ配列（string[], number[]など）はこちら
      if (isImageMetadataImport(typeText)) {
        return ["__imageMeta"];
      }
      const dummyItem = arrType ? generateDummyValue(arrType, sourceFile) : "array dummy";
      return [dummyItem];
    }
  }

  // オブジェクト型（インターフェース、型エイリアス、リテラルなど）
  if (correctedType.isObject()) {
    const obj: Record<string, any> = {};
    // imageMetadata はobjectになっているのでここでチェック
    if (isImageMetadataImport(typeText)) {
      return "__imageMeta";
    }
    for (const p of correctedType.getProperties()) {
      const decls = p.getDeclarations();
      if (decls.length === 0) continue;
      const propType = p.getTypeAtLocation(decls[0]);
      if (isImageMetadataImport(propType.getText())) {
        obj[p.getName()] = "__imageMeta";
      } else {
        obj[p.getName()] = generateDummyValue(resolveWithFallback(propType, propType.getText()), sourceFile);
      }
    }
    return obj;
  }

  if (isImageMetadataImport(typeText)) {
    return "__imageMeta";
  }

  // 未知の型
  return "errordummy";
};

const isImageMetadataImport = (typeText: string): boolean => {
  return typeText.startsWith("import(") && typeText.trim().endsWith(").ImageMetadata");
};

type ExtractImportedTypeBodyResult = {
  importType: Record<string, any> | string;
};

const extractImportedTypeBody = (
  sourceFile: SourceFile,
  typeName: string,
  getDummy?: boolean
): ExtractImportedTypeBodyResult | null => {
  let realTypeName = typeName;
  let importPath: string | null = null;

  // 🔍 `import(...)` 形式からパース
  const matched = typeName.match(/^import\(["'](.+?)["']\)\.(\w+)$/);
  if (matched) {
    importPath = matched[1];
    realTypeName = matched[2];
  } else {
    // 通常のインポートを検索
    const typeImport = sourceFile.getImportDeclarations().find((imp) => {
      return imp.getNamedImports().some((ni) => ni.getName() === realTypeName);
    });

    if (!typeImport) return null;

    importPath = typeImport.getModuleSpecifierValue();
  }

  if (!importPath) return null;

  // tsconfig.jsonのパス解決
  const tsconfigPath = path.resolve(SrcDir, "../../tsconfig.json");
  let absPath = resolveTsPath(tsconfigPath, importPath);
  if (!absPath.endsWith(".ts") && !absPath.endsWith(".tsx") && !absPath.endsWith(".d.ts")) {
    absPath += ".ts";
  }

  if (!fs.existsSync(absPath)) {
    // .ts ではなく .d.ts の可能性を試す
    const dtsPath = absPath.replace(/\.ts$/, ".d.ts");
    if (fs.existsSync(dtsPath)) {
      absPath = dtsPath;
    } else {
      console.warn(`File not found: ${absPath}`);
      return null;
    }
  }

  const importedFile = sharedProject.addSourceFileAtPath(absPath);

  // interface または type alias を探す
  const interfaceDec = importedFile.getInterface(realTypeName);
  const typeAliasDec = importedFile.getTypeAlias(realTypeName);

  if (interfaceDec) {
    if (getDummy) {
      const obj: Record<string, any> = {};
      for (const prop of interfaceDec.getProperties()) {
        obj[prop.getName()] = generateDummyValue(prop.getType(), sourceFile);
      }
      return { importType: obj };
    } else {
      return { importType: extractPropsText(importedFile, interfaceDec) };
    }
  }

  if (typeAliasDec) {
    return { importType: typeAliasDec.getText() };
  }

  console.warn(`⚠️ Type "${realTypeName}" not found in ${absPath}`);
  return null;
};

export { extractPropsText, generateDummyValue, extractImportedTypeBody };
