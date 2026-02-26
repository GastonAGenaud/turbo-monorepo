import { describe, expect, it } from "vitest";

import { inferStock, parsePrice } from "./utils";

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
});
