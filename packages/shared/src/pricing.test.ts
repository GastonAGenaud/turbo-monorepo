import { describe, expect, it } from "vitest";

import { applyMarkup, clampMarkup } from "./pricing";

describe("pricing", () => {
  it("applies 15% markup with 2 decimals", () => {
    expect(applyMarkup(100, 15)).toBe(115);
    expect(applyMarkup(99.99, 15)).toBe(114.99);
  });

  it("clamps markup boundaries", () => {
    expect(clampMarkup(-5)).toBe(0);
    expect(clampMarkup(250)).toBe(200);
    expect(clampMarkup(15)).toBe(15);
  });
});
