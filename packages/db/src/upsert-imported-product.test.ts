import { describe, expect, it } from "vitest";

import { applyMarkup } from "@ggseeds/shared";

describe("upsert helper", () => {
  it("uses 15% by default", () => {
    expect(applyMarkup(20000, 15)).toBe(23000);
  });
});
