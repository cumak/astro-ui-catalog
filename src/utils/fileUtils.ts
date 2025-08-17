import fs from "fs";
import path from "path";
import { Project, SourceFile } from "ts-morph";
import { SrcDir } from "./pathUtils.js";
/**
 * 指定ディレクトリ以下の全ての .astro ファイルを再帰的に取得
 * @param dir 検索するディレクトリ
 * @returns .astro ファイルのフルパスの配列
 */
export function getAllAstroFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return getAllAstroFiles(fullPath);
    if (entry.isFile() && fullPath.endsWith(".astro")) return [fullPath];
    return [];
  });
}

export const sharedProject = new Project({
  tsConfigFilePath: path.resolve(SrcDir, "../../tsconfig.json"),
  skipFileDependencyResolution: true,
  compilerOptions: {
    lib: ["esnext"],
  },
});

export function getSourceFileFromContent(content: string): SourceFile {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const code = frontmatterMatch ? frontmatterMatch[1] : content;
  const sourceFile = sharedProject.createSourceFile("temp.ts", code, { overwrite: true });
  return sourceFile;
}

// 軽量なフォールバック用プロジェクト（lib 指定あり）
export const fallbackProject = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    lib: ["ESNext", "DOM"],
  },
});
