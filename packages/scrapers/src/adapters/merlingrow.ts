import { load } from "cheerio";
import pLimit from "p-limit";

import type { ImportedProduct } from "@ggseeds/shared";
import { logger } from "@ggseeds/shared";

import { scraperConfig } from "../config";
import { fetchHtml } from "../http";
import { getRenderedHtml } from "../playwright-client";
import { canScrape } from "../robots";
import { inferStock, normalizeDescription, parsePrice, toExternalId } from "../utils";

const SOURCE_URL = "https://merlingrow.com";

const SELECTORS = {
  productLinks: ["a.product-item-link", "a.woocommerce-LoopProduct-link", "a[href*='/producto/']"],
  name: ["h1.product_title", "h1.entry-title", "h1"],
  price: ["p.price", ".price", "span.woocommerce-Price-amount"],
  description: [".woocommerce-product-details__short-description", ".entry-content", ".product-description"],
  images: [".woocommerce-product-gallery__image img", "img.wp-post-image", ".product img"],
  stock: [".stock", ".availability", "body"],
};

function pickFirstText($: ReturnType<typeof load>, selectors: string[]): string {
  for (const selector of selectors) {
    const value = $(selector).first().text().trim();
    if (value) {
      return value;
    }
  }
  return "";
}

function pickImages($: ReturnType<typeof load>, selectors: string[]): string[] {
  const images = new Set<string>();
  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr("src")?.trim();
      if (src && src.startsWith("http")) {
        images.add(src);
      }
    });
    if (images.size > 0) {
      break;
    }
  }
  return [...images].slice(0, 5);
}

async function getCatalogLinks(): Promise<string[]> {
  const catalogUrl = `${SOURCE_URL}/shop`;
  if (!(await canScrape(catalogUrl))) {
    logger.warn({ source: "MERLINGROW" }, "Robots bloquea el catálogo de MerlinGrow");
    return [];
  }

  const html = await getRenderedHtml(catalogUrl);
  const $ = load(html);
  const links = new Set<string>();

  for (const selector of SELECTORS.productLinks) {
    $(selector).each((_, el) => {
      const href = $(el).attr("href");
      if (href?.startsWith("http")) {
        links.add(href);
      }
    });
    if (links.size > 0) {
      break;
    }
  }

  return [...links];
}

export async function scrapeMerlinGrow(): Promise<ImportedProduct[]> {
  const cfg = scraperConfig();
  const limit = pLimit(cfg.concurrency);
  const productLinks = await getCatalogLinks();
  const products: ImportedProduct[] = [];

  await Promise.all(
    productLinks.map((url) =>
      limit(async () => {
        try {
          if (!(await canScrape(url))) {
            logger.warn({ url }, "URL de producto bloqueada por robots");
            return;
          }

          const html = await fetchHtml(url);
          const $ = load(html);

          const name = pickFirstText($, SELECTORS.name);
          const priceRaw = pickFirstText($, SELECTORS.price);
          const price = parsePrice(priceRaw);

          if (!name || !price) {
            logger.warn({ url }, "Producto descartado por datos incompletos");
            return;
          }

          const stockRaw = pickFirstText($, SELECTORS.stock);
          const { stock, stockStatus } = inferStock(stockRaw);

          const descriptionHtml = SELECTORS.description
            .map((selector) => $(selector).first().html())
            .find(Boolean);

          products.push({
            source: "MERLINGROW",
            externalId: toExternalId(url),
            sourceUrl: url,
            name,
            brand: "Merlin Grow",
            description: normalizeDescription(descriptionHtml),
            images: pickImages($, SELECTORS.images),
            categoryName: null,
            basePrice: price,
            stock,
            stockStatus,
            tags: ["importado", "merlingrow"],
          });
        } catch (error) {
          logger.error({ error, url }, "Error al parsear producto MerlinGrow");
        }
      }),
    ),
  );

  return products;
}
