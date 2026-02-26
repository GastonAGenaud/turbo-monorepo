import { plainTextFromHtml } from "@ggseeds/shared";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parsePrice(raw: string): number | null {
  const cleaned = raw
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  const value = Number(cleaned);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }

  return value;
}

export function inferStock(text: string): { stock: number | null; stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN" } {
  const lower = text.toLowerCase();
  if (lower.includes("sin stock") || lower.includes("agotado") || lower.includes("out of stock")) {
    return { stock: 0, stockStatus: "OUT_OF_STOCK" };
  }

  const qty = lower.match(/(\d+)\s*(unidades|stock|disponibles)/);
  if (qty?.[1]) {
    return { stock: Number(qty[1]), stockStatus: Number(qty[1]) > 0 ? "IN_STOCK" : "OUT_OF_STOCK" };
  }

  if (lower.includes("en stock") || lower.includes("disponible") || lower.includes("in stock")) {
    return { stock: null, stockStatus: "IN_STOCK" };
  }

  return { stock: null, stockStatus: "UNKNOWN" };
}

export function normalizeDescription(html: string | null | undefined): string {
  return plainTextFromHtml(html);
}

export function toExternalId(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+|\/+$/g, "") || parsed.hostname;
  } catch {
    return url;
  }
}
