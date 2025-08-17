export function evalLiteral(code: string): any {
  // JSON 互換なリテラルのみ評価
  if (/^(['"]).*\1$/.test(code)) return code.slice(1, -1); // string literal
  if (/^\d+(\.\d+)?$/.test(code)) return Number(code);
  if (code === "true") return true;
  if (code === "false") return false;
  if (code === "null") return null;
  throw new Error("Unsupported literal: " + code);
}
