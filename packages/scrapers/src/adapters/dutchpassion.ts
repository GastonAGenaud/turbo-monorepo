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

const SOURCE_URL = "http://dutch-passion.ar";
const SITEMAP_URL = "https://dutch-passion.ar/sitemap/dpargentina.xml";

const SELECTORS = {
  name: ["h1.product_title", "h1.entry-title", "h1"],
  price: ['meta[property="product:price:amount"]', ".price", "span.price"],
  shortDescription: [".product-short-description", ".short-description", '[itemprop="description"]'],
  description: [".product-description", ".product.attribute.description", '[itemprop="description"]'],
  longDescription: [
    ".product-info-description",
    ".product-description-long",
    "#description .value",
    ".product-info-main .description",
  ],
  images: ['meta[property="og:image"]', ".fotorama__stage img", ".product.media img"],
  stock: [".stock", ".availability", "body"],
  breadcrumbs: [".breadcrumbs a", "nav.breadcrumbs a"],
  attributes: [
    ".product-info-main .product-attributes",
    "table.additional-attributes",
    ".product.attribute",
    ".product-specs",
    ".product-data-table",
  ],
};

const ATTRIBUTE_PATTERNS: Record<keyof ProductAttributes, RegExp[]> = {
  genetics: [/gen[eé]tica/i, /tipo/i, /variedad/i, /genetics/i, /type/i],
  flowering: [/floraci[oó]n/i, /flowering/i, /ciclo/i, /harvest/i, /cosecha/i],
  thcContent: [/thc/i],
  cbdContent: [/cbd/i],
  yield: [/rendimiento/i, /yield/i, /producci[oó]n/i],
  height: [/altura/i, /height/i, /tama[nñ]o/i],
  effect: [/efecto/i, /effect/i],
  flavor: [/sabor/i, /flavor/i, /aroma/i, /terpeno/i, /terpene/i],
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
      const src = normalizeImageUrl($(el).attr("src") ?? $(el).attr("content"), pageUrl);
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

export function extractDutchPassionImagesFromHtml(html: string, pageUrl: string): string[] {
  const $ = load(html);
  const productJsonLd = extractJsonLdProducts(html)[0] ?? null;
  return mergeImageCandidates(
    pickImages($, SELECTORS.images, pageUrl),
    productJsonLd ? pickJsonLdImages(productJsonLd) : [],
    pageUrl,
  );
}

function pickCategory($: ReturnType<typeof load>): string | null {
  const breadcrumbs = SELECTORS.breadcrumbs
    .flatMap((selector) =>
      $(selector)
        .map((_, el) => $(el).text().trim())
        .get(),
    )
    .filter(Boolean);

  return breadcrumbs.find((item) => item !== "Inicio" && item !== "Home" && item !== "Dutch Passion Argentina") ?? null;
}

function extractAttributes($: ReturnType<typeof load>): ProductAttributes {
  const attrs: ProductAttributes = {};

  // Extract from product attribute tables
  $("table.additional-attributes tr, .product-attributes tr, .product-data-table tr").each((_, row) => {
    const label = $(row).find("th, td:first-child").text().trim().toLowerCase();
    const value = $(row).find("td:last-child, td.data").text().trim();

    if (!label || !value) return;

    for (const [key, patterns] of Object.entries(ATTRIBUTE_PATTERNS)) {
      if (patterns.some((pattern) => pattern.test(label))) {
        attrs[key as keyof ProductAttributes] = value;
        break;
      }
    }
  });

  // Extract from .product.attribute divs (Magento-style)
  $(".product.attribute").each((_, el) => {
    const label = $(el).find(".type, .label").text().trim().toLowerCase();
    const value = $(el).find(".value").text().trim();

    if (!label || !value) return;

    for (const [key, patterns] of Object.entries(ATTRIBUTE_PATTERNS)) {
      if (patterns.some((pattern) => pattern.test(label))) {
        attrs[key as keyof ProductAttributes] = value;
        break;
      }
    }
  });

  // Extract from description text
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

    const geneticsMatch = descriptionText.match(/(?:indica|sativa|h[ií]brida?|ruderalis)[\s/]*(?:\d+%)?/i);
    if (geneticsMatch && !attrs.genetics) {
      attrs.genetics = geneticsMatch[0].trim();
    }
  }

  return attrs;
}

async function getCatalogLinks(): Promise<string[]> {
  const cfg = scraperConfig();
  if (!(await canScrape(SITEMAP_URL))) {
    logger.warn({ source: "DUTCHPASSION" }, "Robots bloquea el sitemap de Dutch Passion");
    return [];
  }

  let xml = "";
  try {
    xml = await fetchHtml(SITEMAP_URL);
  } catch (error) {
    logger.error({ source: "DUTCHPASSION", error }, "No se pudo cargar el sitemap de Dutch Passion");
    return [];
  }

  const links = new Set<string>();

  for (const productUrl of extractXmlLocs(xml)) {
    try {
      const parsed = new URL(productUrl);
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      const isProduct =
        parsed.hostname.includes("dutch-passion.ar") &&
        pathSegments[0] === "semillas-de-cannabis" &&
        pathSegments.length >= 2;

      if (isProduct) {
        links.add(productUrl);
      }
    } catch {
      // ignore invalid URLs
    }

    if (cfg.maxProducts && links.size >= cfg.maxProducts) {
      break;
    }
  }

  return limitCollection([...links], cfg.maxProducts);
}

export async function scrapeDutchPassion(): Promise<ImportedProduct[]> {
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
            parsePrice($('meta[property="product:price:amount"]').attr("content") ?? pickFirstText($, SELECTORS.price));

          if (!name || !price) {
            logger.warn({ url }, "Producto descartado por datos incompletos");
            return;
          }

          const stockFromLd = availabilityToStock(offer ? pickJsonLdText(offer, "availability") : null);
          const stockFromMarkup = inferStock(pickFirstText($, SELECTORS.stock));
          const { stock, stockStatus } =
            stockFromLd.stockStatus !== "UNKNOWN" ? stockFromLd : stockFromMarkup;

          const shortDescHtml = pickFirstHtml($, SELECTORS.shortDescription);
          const longDescHtml = pickFirstHtml($, SELECTORS.longDescription);
          const attributes = extractAttributes($);

          products.push({
            source: "DUTCHPASSION",
            externalId: toExternalId(url),
            sourceUrl: url,
            name,
            brand: "Dutch Passion",
            description: normalizeDescription(shortDescHtml ?? (productJsonLd ? pickJsonLdText(productJsonLd, "description") : null)),
            longDescription: normalizeDescription(longDescHtml),
            images: extractDutchPassionImagesFromHtml(html, url),
            categoryName: pickCategory($),
            basePrice: price,
            stock,
            stockStatus,
            tags: ["importado", "dutchpassion"],
            attributes: Object.keys(attributes).length > 0 ? attributes : null,
          });
        } catch (error) {
          logger.error({ error, url }, "Error al parsear producto Dutch Passion");
        }
      }),
    ),
  );

  return products;
}
