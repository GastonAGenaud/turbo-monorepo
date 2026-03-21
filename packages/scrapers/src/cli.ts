import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import type { ProductSource } from "@ggseeds/shared";

const currentDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(currentDir, "../../../.env") });
config();

import { runAllImports, runImport } from "./run-import";

const SOURCES = {
  MERLINGROW: "MERLINGROW",
  DUTCHPASSION: "DUTCHPASSION",
} as const satisfies Record<Exclude<ProductSource, "MANUAL">, Exclude<ProductSource, "MANUAL">>;

async function main() {
  const target = process.argv[2] ?? "all";

  if (target === "all") {
    const result = await runAllImports();
    console.log(result);
    return;
  }

  if (target === "merlin") {
    const result = await runImport(SOURCES.MERLINGROW);
    console.log(result);
    return;
  }

  if (target === "dutch") {
    const result = await runImport(SOURCES.DUTCHPASSION);
    console.log(result);
    return;
  }

  throw new Error("Uso: pnpm --filter @ggseeds/scrapers import [all|merlin|dutch]");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
