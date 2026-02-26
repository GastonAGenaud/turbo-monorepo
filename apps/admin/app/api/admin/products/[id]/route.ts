import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";
import { applyMarkup, productMutationSchema } from "@ggseeds/shared";

import { ensureAdminApi } from "../../../../../lib/guard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;

  try {
    const payload = productMutationSchema.parse(await request.json());

    await db.product.update({
      where: { id },
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar" },
      { status: 400 },
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
