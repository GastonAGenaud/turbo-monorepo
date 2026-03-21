import { db } from "./client";
import { applyMarkup } from "@ggseeds/shared";
import type { ImportedProduct } from "@ggseeds/shared";

export async function upsertImportedProduct(
  imported: ImportedProduct,
  markupPercent: number,
): Promise<"created" | "updated"> {
  const finalPrice = applyMarkup(imported.basePrice, markupPercent);

  const category = imported.categoryName
    ? await db.category.upsert({
        where: {
          slug: imported.categoryName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-"),
        },
        update: {
          name: imported.categoryName,
        },
        create: {
          name: imported.categoryName,
          slug: imported.categoryName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-"),
        },
      })
    : null;

  const existingMeta = await db.productSourceMeta.findUnique({
    where: {
      source_externalId: {
        source: imported.source as any,
        externalId: imported.externalId,
      },
    },
    include: { product: true },
  });

  const basePayload = {
    name: imported.name,
    brand: imported.brand ?? null,
    description: imported.description ?? null,
    longDescription: imported.longDescription ?? null,
    attributes: imported.attributes ? JSON.parse(JSON.stringify(imported.attributes)) : undefined,
    images: imported.images.length > 0 ? imported.images : (existingMeta?.product.images ?? []),
    basePrice: imported.basePrice,
    markupPercent,
    finalPrice,
    stock: imported.stock,
    stockStatus: imported.stockStatus,
    tags: imported.tags,
    source: imported.source as any,
    categoryId: category?.id ?? null,
    isActive: true,
  } as const;

  if (existingMeta?.product) {
    await db.product.update({
      where: { id: existingMeta.product.id },
      data: basePayload,
    });

    await db.productSourceMeta.update({
      where: { id: existingMeta.id },
      data: {
        sourceUrl: imported.sourceUrl,
        lastImportedAt: new Date(),
      },
    });

    return "updated";
  }

  const slugSeed = imported.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120);

  await db.product.create({
    data: {
      ...basePayload,
      sku: `${imported.source}-${imported.externalId}`.slice(0, 100),
      slug: `${slugSeed}-${Math.random().toString(36).slice(2, 7)}`,
      sourceMeta: {
        create: {
          source: imported.source as any,
          externalId: imported.externalId,
          sourceUrl: imported.sourceUrl,
          lastImportedAt: new Date(),
        },
      },
    },
  });

  return "created";
}
