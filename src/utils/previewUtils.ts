import { SourceFile, Node } from "ts-morph";
import { generateDummyValue } from "./propsUtils.js";
import { evalLiteral } from "./helper.js";

export const extractDefaultPropsForPreview = (sourceFile: SourceFile): Record<string, any> => {
  const result: Record<string, any> = {};

  const interfaceDec = sourceFile.getInterface("Props");
  if (!interfaceDec) return result;

  // 1. Props interface から必須のプロパティを処理
  for (const prop of interfaceDec.getProperties()) {
    if (prop.hasQuestionToken()) continue;

    const name = prop.getName();
    const type = prop.getType();

    result[name] = generateDummyValue(type, sourceFile);
  }

  // 2. Astro.props から分割代入によるデフォルト値の抽出
  const defaultOverrides: Record<string, any> = {};

  sourceFile.getVariableDeclarations().forEach((decl) => {
    const nameNode = decl.getNameNode();

    if (Node.isObjectBindingPattern(nameNode)) {
      nameNode.getElements().forEach((el) => {
        const name = el.getName();
        const defaultValue = el.getInitializer();
        if (defaultValue) {
          try {
            defaultOverrides[name] = evalLiteral(defaultValue.getText());
          } catch {
            defaultOverrides[name] = defaultValue.getText(); // fallback
          }
        }
      });
    }
  });

  // 3. デフォルト値で result を上書き（Props に存在する場合のみ）
  for (const key of Object.keys(defaultOverrides)) {
    if (key in result) {
      result[key] = defaultOverrides[key];
    }
  }

  return result;
};

export function getPreview(
  errorProps: string[],
  propsStr: string = "",
  slotContent: string = "",
  name: string = "Component"
) {
  const openingTag = `<${name}Component${propsStr ? ` ${propsStr}` : ""}>`;
  const closingTag = `</${name}Component>`;
  if (errorProps && errorProps.length > 0) {
    return `<div class="error">Props ${errorProps.join(", ")} が特殊なため、プレビューを表示できませんでした</div>`;
  } else {
    return slotContent.trim() === "" ? `<${name}Component ${propsStr} />` : `${openingTag}${slotContent}${closingTag}`;
  }
}

export function extractSlotContent(content: string): string {
  return content.includes("<slot") ? "<p>ここにスロットの中身が入ります</p>" : "";
}

export function createPropsArr(defaults: Record<string, any>) {
  const objectPropsArr: { key: string; value: string }[] = [];
  const simplePropsArr: string[] = [];
  let needsSampleImgImportBoolean = false;
  for (const obj of Object.entries(defaults)) {
    const { objectProps, simpleProps, needsSampleImgImport } = createPropsValue(obj);
    if (objectProps.length > 0) {
      objectPropsArr.push(...objectProps);
    }
    if (simpleProps.length > 0) {
      simplePropsArr.push(...simpleProps);
    }
    if (needsSampleImgImport) {
      needsSampleImgImportBoolean = needsSampleImgImport;
    }
  }
  return {
    objectPropsArr,
    simplePropsArr,
    needsSampleImgImportBoolean,
  };
}

function createPropsValue(obj: [string, any]) {
  const objectProps: { key: string; value: string }[] = [];
  const simpleProps: string[] = [];
  const [key, value] = obj;
  let needsSampleImgImport = false;

  const replaceImageMeta = (val: any): any => {
    if (Array.isArray(val)) {
      return val.map(replaceImageMeta);
    } else if (val && typeof val === "object") {
      const newObj: Record<string, any> = {};
      for (const k in val) {
        newObj[k] = replaceImageMeta(val[k]);
      }
      return newObj;
    } else if (val === "__imageMeta") {
      needsSampleImgImport = true;
      return "sampleImg";
    }
    return val;
  };

  const replacedValue = replaceImageMeta(value);

  if (Array.isArray(replacedValue)) {
    const arrStr = JSON.stringify(replacedValue, null, 2).replace(/"sampleImg"/g, "sampleImg");
    objectProps.push({ key, value: arrStr });
    simpleProps.push(`${key}={${key}}`);
  } else if (replacedValue && typeof replacedValue === "object") {
    const objStr = JSON.stringify(replacedValue, null, 2).replace(/"sampleImg"/g, "sampleImg");
    objectProps.push({ key, value: objStr });
    simpleProps.push(`${key}={${key}}`);
  } else if (replacedValue === "sampleImg") {
    needsSampleImgImport = true;
    simpleProps.push(`${key}={sampleImg}`);
  } else if (typeof replacedValue === "string") {
    simpleProps.push(`${key}="${replacedValue}"`);
  } else {
    simpleProps.push(`${key}={${JSON.stringify(replacedValue)}}`);
  }

  return { objectProps, simpleProps, needsSampleImgImport };
}
