import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const currentDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(currentDir, "../../../.env") });
config();

import { refreshImportedImages } from "./refresh-images";

async function main() {
  const target = (process.argv[2] ?? "all").toLowerCase();
  const limitArg = Number(process.argv[3] ?? "");
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : undefined;

  if (target === "all") {
    console.log(await refreshImportedImages("ALL", limit));
    return;
  }

  if (target === "merlin") {
    console.log(await refreshImportedImages("MERLINGROW", limit));
    return;
  }

  if (target === "dutch") {
    console.log(await refreshImportedImages("DUTCHPASSION", limit));
    return;
  }

  throw new Error("Uso: pnpm --filter @ggseeds/scrapers refresh-images [all|merlin|dutch] [limit]");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
