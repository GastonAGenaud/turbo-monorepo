import { db } from "@ggseeds/db";
import { logger } from "@ggseeds/shared";
import type { ProductSource } from "@ggseeds/shared";

import { extractDutchPassionImagesFromHtml } from "./adapters/dutchpassion";
import { extractMerlinImagesFromHtml } from "./adapters/merlingrow";
import { fetchHtml } from "./http";

export type RefreshableSource = Exclude<ProductSource, "MANUAL">;

type RefreshImagesResult = {
  source: RefreshableSource | "ALL";
  checked: number;
  updated: number;
  skipped: number;
  failed: number;
};

const EXTRACTORS: Record<RefreshableSource, (html: string, pageUrl: string) => string[]> = {
  MERLINGROW: extractMerlinImagesFromHtml,
  DUTCHPASSION: extractDutchPassionImagesFromHtml,
};

function sameImages(left: string[], right: string[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export async function refreshImportedImages(source: RefreshableSource | "ALL", limit?: number): Promise<RefreshImagesResult> {
  const products = await db.product.findMany({
    where: {
      source: source === "ALL" ? { in: ["MERLINGROW", "DUTCHPASSION"] } : (source as any),
      sourceMeta: { isNot: null },
    },
    include: {
      sourceMeta: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    try {
      const sourceUrl = product.sourceMeta?.sourceUrl;
      if (!sourceUrl) {
        skipped += 1;
        continue;
      }

      const extractor = EXTRACTORS[product.source as RefreshableSource];
      if (!extractor) {
        skipped += 1;
        continue;
      }

      const html = await fetchHtml(sourceUrl);
      const nextImages = extractor(html, sourceUrl);

      if (nextImages.length === 0 || sameImages(product.images, nextImages)) {
        skipped += 1;
        continue;
      }

      await db.product.update({
        where: { id: product.id },
        data: {
          images: nextImages,
        },
      });

      updated += 1;
    } catch (error) {
      failed += 1;
      logger.error(
        {
          productId: product.id,
          slug: product.slug,
          source: product.source,
          error,
        },
        "No se pudieron refrescar las imagenes del producto importado",
      );
    }
  }

  const result = {
    source,
    checked: products.length,
    updated,
    skipped,
    failed,
  };

  logger.info(result, "Refresh de imagenes finalizado");
  return result;
}
