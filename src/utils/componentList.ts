import { getAllAstroFiles } from "./fileUtils.js";
import path from "path";
import { OUTPUT_DIR } from "../../config.js";
import { SrcDir } from "./pathUtils.js";

const outputComponentDir = OUTPUT_DIR;

/**
 * コンポーネントのリンクリストオブジェクトを生成
 * @param astroFiles .astroファイルのフルパスの配列
 * @returns リンクオブジェクトの配列
 */
export function createLinkListObjArr(astroFiles?: string[]): {
  href: string;
  name: string;
}[] {
  if (!astroFiles) {
    astroFiles = getAllAstroFiles(SrcDir);
  }
  const links = [];

  for (const fullPath of astroFiles) {
    const relativePath = path.relative(SrcDir, fullPath).replace(/\.astro$/, "");
    const name = relativePath;
    const href = `/${outputComponentDir}/${relativePath}`;

    links.push({
      href,
      name,
    });
  }
  return links;
}
