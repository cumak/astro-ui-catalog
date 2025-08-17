import { renameSync, existsSync } from "fs";
import { OUTPUT_DIR, catalogCoreFolderName } from "../config.js";
import main from "./generateCatalog.js";
import { astroProjectDir } from "./utils/pathUtils.js";

const ORIGINAL_PATH = `${astroProjectDir}src/pages/${OUTPUT_DIR}`;
const TEMP_PATH = `${astroProjectDir}src/pages/_${OUTPUT_DIR}`;

export const markerFile = `${ORIGINAL_PATH}/.generated-by-catalog-${catalogCoreFolderName}_v1`;

async function start() {
  try {
    if (existsSync(ORIGINAL_PATH)) {
      if (existsSync(markerFile)) {
        // 安全に削除 or 上書き可能
        console.log("🆗 Detected generated folder. Removing for regeneration...");
      } else {
        throw new Error(
          `❌ Directory '${ORIGINAL_PATH}' exists but was not generated.\n` +
            `Aborting to prevent accidental overwrite.\n\n` +
            `👉 If this directory is not meant to be overwritten, please change the OUTPUT_DIR setting.`
        );
      }
    }

    if (existsSync(ORIGINAL_PATH)) {
      console.log(`🔁 Moving catalog-ui to _${OUTPUT_DIR}...`);
      renameSync(ORIGINAL_PATH, TEMP_PATH);
    }

    console.log("📦 Running generateCatalog.ts...");
    await main();

    console.log(`🔁 Moving _${OUTPUT_DIR} back to ${OUTPUT_DIR}...`);
    renameSync(TEMP_PATH, ORIGINAL_PATH);

    console.log("✅ Catalog generation complete!");
  } catch (err) {
    console.error("❌ Error during catalog generation:", err);

    // エラー発生時、元に戻せる場合は戻す
    if (existsSync(TEMP_PATH) && !existsSync(ORIGINAL_PATH)) {
      try {
        renameSync(TEMP_PATH, ORIGINAL_PATH);
        console.log(`↩️ Rollback: _catalog-ui moved back to ${OUTPUT_DIR}`);
      } catch (rollbackErr) {
        console.error("⚠️ Rollback failed:", rollbackErr);
      }
    }

    process.exit(1);
  }
}

export default start;
