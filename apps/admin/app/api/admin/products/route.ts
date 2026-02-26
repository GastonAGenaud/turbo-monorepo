import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";
import { applyMarkup, productMutationSchema } from "@ggseeds/shared";

import { ensureAdminApi } from "../../../../lib/guard";

export async function GET() {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const products = await db.product.findMany({
    include: { category: true, sourceMeta: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: products.map((product) => ({
      ...product,
      basePrice: Number(product.basePrice),
      finalPrice: Number(product.finalPrice),
      markupPercent: Number(product.markupPercent),
    })),
  });
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = productMutationSchema.parse(await request.json());

    const product = await db.product.create({
      data: {
        sku: payload.sku,
        slug: payload.slug,
        name: payload.name,
        brand: payload.brand,
        description: payload.description,
        images: payload.images,
        basePrice: payload.basePrice,
        markupPercent: payload.markupPercent,
        finalPrice: applyMarkup(payload.basePrice, payload.markupPercent),
        stock: payload.stock,
        stockStatus: payload.stockStatus,
        categoryId: payload.categoryId,
        tags: payload.tags,
        isActive: payload.isActive,
        source: payload.source,
      },
    });

    return NextResponse.json({ ok: true, productId: product.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear producto" },
      { status: 400 },
    );
  }
}
