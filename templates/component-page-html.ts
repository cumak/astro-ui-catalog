import { catalogCoreFolderName, SRC_DIR } from "../config.js";

type ComponentPageHtmlTemplate = {
  relativePath: string;
  name: string;
  description: string | null;
  links: { name: string; href: string }[];
  propText: string;
  preview: string; // HTML文字列
  usage: string;
  sampleImgImport: string; // 画像のインポート文字列
  importFiles?: string; // import文のHTML文字列
  scriptImports?: string; // scriptタグのHTML文字列
  moduleScriptImports?: string; // モジュールスクリプトのインポート文字列
  variablesBlock: string;
};

const isCatalogDev = process.env.CATALOG_DEV === "true";

export async function componentPageHtmlTemplate({
  relativePath,
  name,
  description,
  links,
  propText,
  preview, // HTML文字列
  usage,
  sampleImgImport, // 画像のインポート文字列
  importFiles, // import文のHTML文字列
  scriptImports, // scriptタグのHTML文字列
  moduleScriptImports, // モジュールスクリプトのインポート文字列
  variablesBlock,
}: ComponentPageHtmlTemplate): Promise<string> {
  const importCss = isCatalogDev
    ? `import '/node_modules/${catalogCoreFolderName}/src/styles/catalog-style.scss';`
    : "";
  const uiScript = isCatalogDev
    ? `<script>
import '/node_modules/${catalogCoreFolderName}/src/ui/uiEntry.js'
</script>`
    : `<script type="module" src="/node_modules/${catalogCoreFolderName}/dist/ui/uiEntry.js" is:inline></script>
`;

  return `---
import ${name}Component from "${SRC_DIR}/${relativePath}";
${importFiles}
${importCss}
${!isCatalogDev && `import '/node_modules/${catalogCoreFolderName}/dist/styles/catalog-style.css'`}
${sampleImgImport && sampleImgImport}
const currentPath = Astro.url.pathname;
${variablesBlock}
---
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width" />
<link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet">
${scriptImports && scriptImports}
<title>${name} - Astro UI Components Catalog</title>
</head>
<body>
<div class="ctGridWrapper js-ctGridWrapper">
  <div class="ctSideButtons">
    <button class="ctSideButtons-item" id="ctSidebarToggle">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="mdi-fullscreen" width="24" height="24" viewBox="0 0 24 24"><path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" /></svg>
    </button>
  </div>
  <header class="ctHeader">
    <h1 class="ctHeader-title">${name}</h1>
    ${description ? `<div class="ctDescription">${description}</div>` : ""}
  </header>
  <aside class="ctSidebar js-ctSidebar">
    <ul class="ctSidebar-componentNavi js-ctSidebarNavi">
      ${links
        .map(
          (link) =>
            `<li><a href="${link.href}/" class={\`\${currentPath === '${link.href}/' ? 'active' : ''}\`}>${link.name}</a></li>`
        )
        .join("\n")}
    </ul>
  </aside>
  <main class="ctCatalogMain">
    <section>
      ${preview}
    </section>
    <div class="ctCatalogMain-arrows">
      <button class="ctCatalogMain-arrows-btn is-left js-arrowPrev"><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M5 12l4 4" /><path d="M5 12l4 -4" /></svg></button>
      <button class="ctCatalogMain-arrows-btn is-right js-arrowNext"><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M13 18l6 -6" /><path d="M13 6l6 6" /></svg></button>
    </div>
  </main>
  <aside class="ctSidebarRight">
    <section class="ctProps" id="props">
      <h2 class="ctTitle">Props</h2>
      <div class="ctPropsCode">
        <code>${propText}</code>
      </div>
    </section>
  </aside>
  <footer class="ctFooter">
    <section>
      <code>${usage}</code>
    </section>
  </footer>
</div>

</body></html>
${uiScript}

<script>
${moduleScriptImports && moduleScriptImports}
</script>
`;
}
