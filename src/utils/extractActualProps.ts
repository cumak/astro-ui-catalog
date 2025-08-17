import { getAllAstroFiles } from "./fileUtils.js";
import path from "path";
import fs from "fs";
import { SrcDir, astroProjectDir } from "./pathUtils.js";

/**
 * 引用符と入れ子構造を考慮してコンポーネントの属性を抽出する
 * @param content ファイル内容
 * @param startIndex コンポーネント名の後の位置
 * @param componentName コンポーネント名（デバッグ用）
 * @returns 属性文字列
 */
function extractAttributesFromTag(content: string, startIndex: number, componentName: string): string | null {
  let i = startIndex;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let braceDepth = 0;
  let angleDepth = 0;
  let attributesEnd = -1;

  while (i < content.length) {
    const char = content[i];

    // 引用符の処理
    if (!inDoubleQuote && char === "'") {
      inSingleQuote = !inSingleQuote;
    } else if (!inSingleQuote && char === '"') {
      inDoubleQuote = !inDoubleQuote;
    }
    // 引用符内でない場合の処理
    else if (!inSingleQuote && !inDoubleQuote) {
      if (char === "{") {
        braceDepth++;
      } else if (char === "}") {
        braceDepth--;
      } else if (char === "<") {
        angleDepth++;
      } else if (char === ">") {
        if (angleDepth > 0) {
          angleDepth--;
        } else {
          // 最外層の>に到達：コンポーネントタグの終了
          attributesEnd = i;
          break;
        }
      } else if (char === "/" && content[i + 1] === ">" && braceDepth === 0) {
        // 自己閉じタグの場合
        attributesEnd = i;
        break;
      }
    }

    i++;
  }

  if (attributesEnd === -1) {
    return null;
  }

  const attributes = content.substring(startIndex, attributesEnd).trim();
  return attributes;
}

/**
 * ファイルのフロントマターからインポート文を抽出
 * @param content ファイル内容
 * @returns インポート文の配列
 */
function extractImportsFromFile(content: string): string[] {
  const imports: string[] = [];
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const importRegex = /import\s+([^;]+);/g;
    let match;

    while ((match = importRegex.exec(frontmatter)) !== null) {
      imports.push(`import ${match[1]};`);
    }
  }

  return imports;
}

export interface ExtractedPropsResult {
  attributes: string;
  imports: string[];
}

/**
 * 指定されたコンポーネント名の実際の使用例から属性文字列とインポート文を抽出する
 * @param componentName コンポーネント名
 * @returns 属性文字列とインポート文、または見つからない場合はnull
 */
export function extractActualProps(componentName: string): string | null;
export function extractActualProps(componentName: string, includeImports: true): ExtractedPropsResult | null;
export function extractActualProps(
  componentName: string,
  includeImports?: boolean
): string | ExtractedPropsResult | null {
  const astroFiles = getAllAstroFiles(path.join(astroProjectDir, "src", "pages"));

  for (const filePath of astroFiles) {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // コンポーネントの開始タグを検索
    const componentPattern = `<${componentName}`;
    let searchIndex = 0;

    while (true) {
      const tagIndex = fileContent.indexOf(componentPattern, searchIndex);
      if (tagIndex === -1) break;

      const afterComponentName = tagIndex + componentPattern.length;
      const nextChar = fileContent[afterComponentName];

      // コンポーネント名の後が空白または属性の開始でない場合はスキップ
      if (nextChar && !/[\s>\/]/.test(nextChar)) {
        searchIndex = afterComponentName;
        continue;
      }

      // 空白をスキップして属性の開始位置を見つける
      let attributesStart = afterComponentName;
      while (attributesStart < fileContent.length && /\s/.test(fileContent[attributesStart])) {
        attributesStart++;
      }

      // 属性を抽出
      const attributes = extractAttributesFromTag(fileContent, attributesStart, componentName);
      if (attributes) {
        if (includeImports) {
          // ファイル内のすべてのインポート文を取得
          const imports = extractImportsFromFile(fileContent);

          return { attributes, imports };
        } else {
          return attributes;
        }
      }

      searchIndex = afterComponentName;
    }
  }

  return null;
}
