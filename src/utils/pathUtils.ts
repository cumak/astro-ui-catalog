import fs from "fs";
import path from "path";
import * as tsconfigPaths from "tsconfig-paths";
import { parse } from "jsonc-parser";
import { OUTPUT_DIR, ASTRO_PROJECT_DIR, SRC_DIR, catalogCoreFolderName } from "../../config.js";

export const astroProjectDir = path.resolve(__dirname, ASTRO_PROJECT_DIR, "../") + "/";
export const SrcDir = path.resolve(`${astroProjectDir}/${SRC_DIR}`);
export const sampleImgPath = path.resolve(
  `${astroProjectDir}node_modules/${catalogCoreFolderName}/src/img/dummy-img.png`
);

export const outputComponentDir = path.join(OUTPUT_DIR);
export const outputDir = `${astroProjectDir}src/pages/_${outputComponentDir}/`;

export function pascalCase(str: string) {
  return str.replace(/(^\w|-\w)/g, (m) => m.replace("-", "").toUpperCase());
}

/**
 * tsconfig.jsonのパス解決を行う
 * @param tsconfigPath tsconfig.jsonのパス
 * @param importPath インポートパス
 * @returns 解決された絶対パス
 */
export function resolveTsPath(tsconfigPath: string, importPath: string): string {
  const tsconfigDir = path.dirname(tsconfigPath);
  const raw = fs.readFileSync(tsconfigPath, "utf-8");

  // JSONC（コメントや末尾カンマ付きJSON）を安全にパース
  const tsconfig = parse(raw);

  const baseUrl = path.resolve(tsconfigDir, tsconfig.compilerOptions?.baseUrl || ".");

  const matchPath = tsconfigPaths.createMatchPath(baseUrl, tsconfig.compilerOptions?.paths || {});

  const resolved = matchPath(importPath, undefined, undefined, [".ts", ".tsx", ".js", ".jsx"]);

  return resolved ? path.resolve(tsconfigDir, resolved) : path.resolve(baseUrl, importPath + ".ts");
}
