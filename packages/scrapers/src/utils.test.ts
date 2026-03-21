import { describe, expect, it } from "vitest";

import { inferStock, mergeImageCandidates, normalizeImageUrl, parsePrice } from "./utils";

describe("scraper utils", () => {
  it("parses price strings", () => {
    expect(parsePrice("$ 12.500")).toBe(12500);
    expect(parsePrice("ARS 9,99")).toBe(9.99);
  });

  it("infers stock states", () => {
    expect(inferStock("Sin stock").stockStatus).toBe("OUT_OF_STOCK");
    expect(inferStock("En stock").stockStatus).toBe("IN_STOCK");
    expect(inferStock("Consultar").stockStatus).toBe("UNKNOWN");
  });

  it("normalizes image urls against the page url", () => {
    expect(normalizeImageUrl("//cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
    expect(normalizeImageUrl("/media/product.jpg", "https://shop.example.com/product")).toBe(
      "https://shop.example.com/media/product.jpg",
    );
    expect(normalizeImageUrl("data:image/png;base64,abc")).toBeNull();
  });

  it("merges and deduplicates image candidates", () => {
    expect(
      mergeImageCandidates(
        ["https://shop.example.com/image.jpg?w=800", "/image.jpg?w=1200"],
        ["https://shop.example.com/image.jpg?w=400", "https://shop.example.com/other.jpg"],
        "https://shop.example.com/product",
      ),
    ).toEqual(["https://shop.example.com/image.jpg?w=800", "https://shop.example.com/other.jpg"]);
  });
});
