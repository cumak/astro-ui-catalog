/**
 * コンポーネントのコードから説明を抽出
 * @param code コンポーネントのコード
 * @returns 説明文またはnull
 */
export function extractDescription(code: string): string | null {
  const frontmatterMatch = code.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return null;
  const frontmatter = frontmatterMatch[1];

  // 行コメント形式の @description を探す
  const lineDescMatch = frontmatter.match(/\/\/\s*@description:? (.+)/i);
  if (lineDescMatch) return lineDescMatch[1].trim();

  // ブロックコメント内の @description を探す（複数行に対応）
  const blockCommentDescMatch = frontmatter.match(/\/\*\*[\s\S]*?@description:? (.+?)(?:\r?\n|\*\/)/i);
  if (blockCommentDescMatch) return blockCommentDescMatch[1].trim();

  return null;
}
