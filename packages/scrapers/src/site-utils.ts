import { load } from "cheerio";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

function normalizeType(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function visitJsonLdNode(node: unknown, matches: JsonObject[]) {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      visitJsonLdNode(item, matches);
    }
    return;
  }

  if (!isObject(node)) {
    return;
  }

  const types = normalizeType(node["@type"]);
  if (types.includes("Product")) {
    matches.push(node);
  }

  if (node["@graph"]) {
    visitJsonLdNode(node["@graph"], matches);
  }
}

export function extractXmlLocs(xml: string): string[] {
  const $ = load(xml, { xmlMode: true });
  return $("loc")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);
}

export function extractJsonLdProducts(html: string): JsonObject[] {
  const $ = load(html);
  const matches: JsonObject[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()?.trim();
    if (!raw) {
      return;
    }

    try {
      visitJsonLdNode(JSON.parse(raw), matches);
    } catch {
      // Some storefronts emit invalid JSON-LD fragments. Ignore and continue.
    }
  });

  return matches;
}

export function pickJsonLdText(node: JsonObject, key: string): string | null {
  const value = node[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function pickJsonLdNumber(node: JsonObject, key: string): number | null {
  const value = node[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

export function pickJsonLdImages(node: JsonObject): string[] {
  const value = node.image;

  if (typeof value === "string" && value.startsWith("http")) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .filter((item) => item.startsWith("http"))
      .slice(0, 5);
  }

  return [];
}

export function pickOffer(node: JsonObject): JsonObject | null {
  const offers = node.offers;

  if (Array.isArray(offers)) {
    const first = offers.find(isObject);
    return first ?? null;
  }

  return isObject(offers) ? offers : null;
}

export function availabilityToStock(availability: string | null | undefined): {
  stock: number | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
} {
  if (!availability) {
    return { stock: null, stockStatus: "UNKNOWN" };
  }

  const lower = availability.toLowerCase();

  if (lower.includes("instock") || lower.includes("in_stock")) {
    return { stock: null, stockStatus: "IN_STOCK" };
  }

  if (lower.includes("outofstock") || lower.includes("out_of_stock")) {
    return { stock: 0, stockStatus: "OUT_OF_STOCK" };
  }

  return { stock: null, stockStatus: "UNKNOWN" };
}

export function limitCollection<T>(items: T[], limit: number | null): T[] {
  if (!limit || limit <= 0) {
    return items;
  }

  return items.slice(0, limit);
}
