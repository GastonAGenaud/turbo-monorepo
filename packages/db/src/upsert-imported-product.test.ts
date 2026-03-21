import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    category: {
      upsert: vi.fn(),
    },
    productSourceMeta: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("./client", () => ({
  db: mockDb,
}));

import { upsertImportedProduct } from "./upsert-imported-product";

describe("upsertImportedProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves current images when the importer returns none", async () => {
    mockDb.productSourceMeta.findUnique.mockResolvedValue({
      id: "meta_1",
      product: {
        id: "prod_1",
        images: ["https://existing.example.com/image.jpg"],
      },
    });

    await upsertImportedProduct(
      {
        source: "MERLINGROW",
        externalId: "external-1",
        sourceUrl: "https://shop.example.com/product-1",
        name: "Producto importado",
        images: [],
        basePrice: 100,
        stock: null,
        stockStatus: "IN_STOCK",
        tags: ["importado"],
      },
      15,
    );

    expect(mockDb.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          images: ["https://existing.example.com/image.jpg"],
        }),
      }),
    );
  });

  it("replaces images when the importer resolves valid ones", async () => {
    mockDb.productSourceMeta.findUnique.mockResolvedValue({
      id: "meta_1",
      product: {
        id: "prod_1",
        images: ["https://existing.example.com/image.jpg"],
      },
    });

    await upsertImportedProduct(
      {
        source: "DUTCHPASSION",
        externalId: "external-2",
        sourceUrl: "https://shop.example.com/product-2",
        name: "Producto importado",
        images: ["https://new.example.com/image.jpg"],
        basePrice: 100,
        stock: null,
        stockStatus: "IN_STOCK",
        tags: ["importado"],
      },
      15,
    );

    expect(mockDb.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          images: ["https://new.example.com/image.jpg"],
        }),
      }),
    );
  });
});
