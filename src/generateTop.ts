import fs from "fs";
import path from "path";
import { topPageHtmlTemplate } from "../templates/top-page-html.js";
import { createLinkListObjArr } from "./utils/componentList.js";
import { outputDir } from "./utils/pathUtils.js";

const indexFile = path.join(outputDir, "index.astro");

export async function generateTopPage(astroFiles: string[]) {
  const links = createLinkListObjArr(astroFiles);

  const indexContent = await topPageHtmlTemplate({
    links,
  });
  fs.writeFileSync(indexFile, indexContent, { encoding: "utf-8" });
}
