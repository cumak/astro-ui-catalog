import { catalogCoreFolderName } from "../config.js";

type TopPageHtml = {
  links: { name: string; href: string }[];
};

const isCatalogDev = process.env.CATALOG_DEV === "true";

export async function topPageHtmlTemplate({ links }: TopPageHtml): Promise<string> {
  return `---
${!isCatalogDev && `import '/node_modules/${catalogCoreFolderName}/dist/styles/top-style.css'`}
---
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width" />
<link href="https://fonts.googleapis.com/css2?family=Fira+Code&display=swap" rel="stylesheet">
<title>Astro UI Components Catalog</title>
</head>
<body>
<section class="ctTopList">
<h1 class="ctTopList-title">Hello! Astro UI Components Catalog</h1>
<ul class="ctTopList-links">
${links.map((link) => `<li><a href="${link.href}/">${link.name}</a></li>`).join("\n")}
</ul>
</section>
</body></html>

${
  isCatalogDev
    ? `}
<style lang="scss">
@use '/node_modules/${catalogCoreFolderName}/src/styles/top-style' as *;
</style>
`
    : ""
}
`;
}
