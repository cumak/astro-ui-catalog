// Astroプロジェクトルート（相対パス）
const ASTRO_PROJECT_DIR = `../../`;
// コンポーネントのソースコードが格納されているディレクトリ（AstroProjectルートからのパス）
const SRC_DIR = `src/components`;

// コンポーネントのソースコードをビルドした後の出力先ディレクトリ（AstroProjectのpages/以下）
const OUTPUT_DIR = "catalog-ui";

// コンポーネントより上位でimportしたいるスタイルシートのパスと、scriptタグのパスを指定
// 例）Layoutでimportしているcss / <style>で定義しているスタイルシートのパスなど
const ADD_CODE = {
  importStyle: ["@styles/style.scss"],
  // scriptTag: [],
  moduleScript: ["/src/js/app"],
};

const catalogCoreFolderName = "astro-ui-catalog";

const previewActualProps = {
  enable: true, // true: 実際のプロジェクト内のpropsを使用, false: ダミーpropsを使用
  exclude: ["Pagination"] // 除外するprops名の配列（どうしてもエラーになるものなど）
}

module.exports = {
  ASTRO_PROJECT_DIR,
  SRC_DIR,
  OUTPUT_DIR,
  ADD_CODE,
  catalogCoreFolderName,
  previewActualProps,
}