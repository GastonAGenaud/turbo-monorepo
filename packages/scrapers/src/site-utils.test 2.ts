import { describe, expect, it } from "vitest";

import { availabilityToStock, extractJsonLdProducts, extractXmlLocs } from "./site-utils";

describe("site utils", () => {
  it("extracts locs from sitemap xml", () => {
    const xml = `<?xml version="1.0"?><urlset><url><loc>https://example.com/a</loc></url><url><loc>https://example.com/b</loc></url></urlset>`;
    expect(extractXmlLocs(xml)).toEqual(["https://example.com/a", "https://example.com/b"]);
  });

  it("extracts product nodes from json-ld", () => {
    const html = `
      <script type="application/ld+json">
        {"@context":"https://schema.org","@graph":[{"@type":"BreadcrumbList"},{"@type":"Product","name":"Test","offers":{"price":"123.45"}}]}
      </script>
    `;

    const products = extractJsonLdProducts(html);
    expect(products).toHaveLength(1);
    expect(products[0]?.name).toBe("Test");
  });

  it("maps availability urls to stock status", () => {
    expect(availabilityToStock("https://schema.org/InStock").stockStatus).toBe("IN_STOCK");
    expect(availabilityToStock("https://schema.org/OutOfStock").stockStatus).toBe("OUT_OF_STOCK");
  });
});
