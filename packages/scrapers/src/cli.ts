import { ProductSource } from "@ggseeds/db";

import { runAllImports, runImport } from "./run-import";

async function main() {
  const target = process.argv[2] ?? "all";

  if (target === "all") {
    const result = await runAllImports();
    console.log(result);
    return;
  }

  if (target === "merlin") {
    const result = await runImport(ProductSource.MERLINGROW);
    console.log(result);
    return;
  }

  if (target === "dutch") {
    const result = await runImport(ProductSource.DUTCHPASSION);
    console.log(result);
    return;
  }

  throw new Error("Uso: pnpm --filter @ggseeds/scrapers import [all|merlin|dutch]");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
