import { load } from "cheerio";
import pLimit from "p-limit";

import type { ImportedProduct, ProductAttributes } from "@ggseeds/shared";
import { logger } from "@ggseeds/shared";

import { scraperConfig } from "../config";
import { fetchHtml } from "../http";
import { canScrape } from "../robots";
import {
  availabilityToStock,
  extractJsonLdProducts,
  extractXmlLocs,
  limitCollection,
  pickJsonLdImages,
  pickJsonLdNumber,
  pickJsonLdText,
  pickOffer,
} from "../site-utils";
import { inferStock, mergeImageCandidates, normalizeDescription, normalizeImageUrl, parsePrice, toExternalId } from "../utils";

const SOURCE_URL = "https://merlingrow.com";
const SITEMAP_INDEX_URL = `${SOURCE_URL}/sitemap_index.xml`;

const SELECTORS = {
  name: ["h1.product_title", "h1.entry-title", "h1"],
  price: ["p.price", ".price", "span.woocommerce-Price-amount"],
  shortDescription: [".woocommerce-product-details__short-description", ".product-short-description"],
  description: [".woocommerce-product-details__short-description", ".entry-content", ".product-description"],
  longDescription: [
    ".woocommerce-Tabs-panel--description",
    "#tab-description",
    ".product-description-long",
    ".entry-content .product_meta + *",
  ],
  additionalInfo: [
    ".woocommerce-Tabs-panel--additional_information",
    "#tab-additional_information",
    ".product-additional-info",
  ],
  images: ['meta[property="og:image"]', ".wcgs-slider-image-tag", ".woocommerce-product-gallery__image img", "img.wp-post-image"],
  stock: [".stock", ".availability", "body"],
  categories: [".posted_in a", ".product_meta .posted_in a"],
  tags: [".tagged_as a", ".product_meta .tagged_as a"],
  attributes: [
    ".woocommerce-product-attributes",
    ".product_meta",
    "table.woocommerce-product-attributes",
    ".product-attributes",
  ],
};

const GENERIC_CATEGORIES = new Set([
  "todos",
  "autoflorecientes",
  "fotoperiodicas",
  "fotoperiodica",
  "feminizadas",
  "feminizada",
  "regulares",
  "regular",
  "mix",
  "thc",
  "cbd",
  "banco",
  "principalmente-indica",
  "principalmente-sativa",
  "hibrido",
  "hibrida",
  "hibridas",
  "grandes-packs-x50",
  // Categories the storefront filtered out as non-brand labels:
  "ofertas",
  "sin-categorizar",
  "croppers",
]);

const ATTRIBUTE_PATTERNS: Record<keyof ProductAttributes, RegExp[]> = {
  genetics: [/gen[eé]tica/i, /tipo/i, /variedad/i, /genetics/i],
  flowering: [/floraci[oó]n/i, /flowering/i, /ciclo/i, /harvest/i, /cosecha/i],
  thcContent: [/thc/i],
  cbdContent: [/cbd/i],
  yield: [/rendimiento/i, /yield/i, /producci[oó]n/i, /harvest.*gram/i],
  height: [/altura/i, /height/i, /tama[nñ]o/i],
  effect: [/efecto/i, /effect/i],
  flavor: [/sabor/i, /flavor/i, /aroma/i, /terpeno/i],
  seedCount: [/semillas/i, /seeds?\s*(per|por|x)/i, /pack/i, /unidades/i],
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

function pickFirstHtml($: ReturnType<typeof load>, selectors: string[]): string | null {
  for (const selector of selectors) {
    const html = $(selector).first().html()?.trim();
    if (html) {
      return html;
    }
  }
  return null;
}

function pickImages($: ReturnType<typeof load>, selectors: string[], pageUrl: string): string[] {
  const images: string[] = [];
  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const src = normalizeImageUrl(
        $(el).attr("src") ??
        $(el).attr("content") ??
        $(el).attr("data-image") ??
        $(el).attr("data-large_image"),
        pageUrl,
      );
      if (src) {
        images.push(src);
      }
    });
    if (images.length > 0) {
      break;
    }
  }
  return mergeImageCandidates(images, [], pageUrl);
}

export function extractMerlinImagesFromHtml(html: string, pageUrl: string): string[] {
  const $ = load(html);
  const productJsonLd = extractJsonLdProducts(html)[0] ?? null;
  return mergeImageCandidates(
    pickImages($, SELECTORS.images, pageUrl),
    productJsonLd ? pickJsonLdImages(productJsonLd) : [],
    pageUrl,
  );
}

function pickTexts($: ReturnType<typeof load>, selectors: string[]): string[] {
  const values = new Set<string>();

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const value = $(el).text().trim();
      if (value) {
        values.add(value);
      }
    });

    if (values.size > 0) {
      break;
    }
  }

  return [...values];
}

function inferBrand(categories: string[]): string | null {
  for (const category of categories) {
    const normalized = category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    if (!GENERIC_CATEGORIES.has(normalized)) {
      return category;
    }
  }

  return null;
}

function extractAttributes($: ReturnType<typeof load>): ProductAttributes {
  const attrs: ProductAttributes = {};

  // Extract from WooCommerce attribute tables
  $("table.woocommerce-product-attributes tr, .product-attributes tr").each((_, row) => {
    const label = $(row).find("th, td:first-child").text().trim().toLowerCase();
    const value = $(row).find("td:last-child, td.woocommerce-product-attributes-item__value").text().trim();

    if (!label || !value) return;

    for (const [key, patterns] of Object.entries(ATTRIBUTE_PATTERNS)) {
      if (patterns.some((pattern) => pattern.test(label))) {
        attrs[key as keyof ProductAttributes] = value;
        break;
      }
    }
  });

  // Also try to extract from description text patterns
  const descriptionText = pickFirstText($, SELECTORS.description);
  if (descriptionText) {
    const thcMatch = descriptionText.match(/THC[:\s]*(\d+[\-–]?\d*\s*%?)/i);
    const thcValue = thcMatch?.[1];
    if (thcValue && !attrs.thcContent) {
      attrs.thcContent = thcValue.trim();
    }

    const cbdMatch = descriptionText.match(/CBD[:\s]*(\d+[\-–]?\d*\s*%?)/i);
    const cbdValue = cbdMatch?.[1];
    if (cbdValue && !attrs.cbdContent) {
      attrs.cbdContent = cbdValue.trim();
    }

    const flowerMatch = descriptionText.match(/floraci[oó]n[:\s]*([\d]+[\-–]?\d*\s*(?:d[ií]as|semanas|weeks|days)?)/i);
    const flowerValue = flowerMatch?.[1];
    if (flowerValue && !attrs.flowering) {
      attrs.flowering = flowerValue.trim();
    }
  }

  return attrs;
}

async function getCatalogLinks(): Promise<string[]> {
  const cfg = scraperConfig();
  if (!(await canScrape(SITEMAP_INDEX_URL))) {
    logger.warn({ source: "MERLINGROW" }, "Robots bloquea el sitemap de MerlinGrow");
    return [];
  }

  let sitemapIndex = "";
  try {
    sitemapIndex = await fetchHtml(SITEMAP_INDEX_URL);
  } catch (error) {
    logger.error({ source: "MERLINGROW", error }, "No se pudo cargar el sitemap index de MerlinGrow");
    return [];
  }

  const productSitemaps = extractXmlLocs(sitemapIndex).filter((url) => url.includes("/product-sitemap"));
  const links = new Set<string>();

  for (const sitemapUrl of productSitemaps) {
    if (!(await canScrape(sitemapUrl))) {
      logger.warn({ sitemapUrl }, "Robots bloquea un sitemap de MerlinGrow");
      continue;
    }

    try {
      const xml = await fetchHtml(sitemapUrl);
      for (const productUrl of extractXmlLocs(xml)) {
        if (!productUrl.startsWith(`${SOURCE_URL}/semillas-de-cannabis/`)) {
          continue;
        }

        links.add(productUrl);
      }
    } catch (error) {
      logger.error({ sitemapUrl, error }, "No se pudo procesar un sitemap de MerlinGrow");
    }

    if (cfg.maxProducts && links.size >= cfg.maxProducts) {
      break;
    }
  }

  return limitCollection([...links], cfg.maxProducts);
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
          const productJsonLd = extractJsonLdProducts(html)[0] ?? null;
          const offer = productJsonLd ? pickOffer(productJsonLd) : null;

          const name = pickFirstText($, SELECTORS.name) || (productJsonLd ? pickJsonLdText(productJsonLd, "name") : "");
          const price =
            (offer ? pickJsonLdNumber(offer, "price") : null) ??
            parsePrice(pickFirstText($, SELECTORS.price));

          if (!name || !price) {
            logger.warn({ url }, "Producto descartado por datos incompletos");
            return;
          }

          const stockFromLd = availabilityToStock(offer ? pickJsonLdText(offer, "availability") : null);
          const stockFromMarkup = inferStock(
            $('meta[property="product:availability"]').attr("content") ?? pickFirstText($, SELECTORS.stock),
          );
          const { stock, stockStatus } =
            stockFromLd.stockStatus !== "UNKNOWN" ? stockFromLd : stockFromMarkup;

          const shortDescHtml = pickFirstHtml($, SELECTORS.shortDescription);
          const longDescHtml = pickFirstHtml($, SELECTORS.longDescription);
          const categories = pickTexts($, SELECTORS.categories);
          const tags = pickTexts($, SELECTORS.tags);
          const brand = inferBrand(categories);
          const categoryName = categories.find((value) => value !== brand) ?? categories[0] ?? null;
          const images = extractMerlinImagesFromHtml(html, url);
          const attributes = extractAttributes($);

          products.push({
            source: "MERLINGROW",
            externalId: toExternalId(url),
            sourceUrl: url,
            name,
            brand,
            description: normalizeDescription(shortDescHtml ?? (productJsonLd ? pickJsonLdText(productJsonLd, "description") : null)),
            longDescription: normalizeDescription(longDescHtml),
            images,
            categoryName,
            basePrice: price,
            stock,
            stockStatus,
            tags: ["importado", "merlingrow", ...tags].slice(0, 10),
            attributes: Object.keys(attributes).length > 0 ? attributes : null,
          });
        } catch (error) {
          logger.error({ error, url }, "Error al parsear producto MerlinGrow");
        }
      }),
    ),
  );

  return products;
}
