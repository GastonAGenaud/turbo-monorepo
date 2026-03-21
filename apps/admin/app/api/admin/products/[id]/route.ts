import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";
import { applyMarkup, productMutationSchema } from "@ggseeds/shared";

import { writeAuditLog, extractIp } from "../../../../../lib/audit";
import { ensureAdminApi } from "../../../../../lib/guard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;

  try {
    const payload = productMutationSchema.parse(await request.json());

    await db.product.update({
      where: { id, deletedAt: null },
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

    await writeAuditLog({
      userId: guard.userId,
      action: "UPDATE",
      entity: "Product",
      entityId: id,
      metadata: { name: payload.name, sku: payload.sku },
      ipAddress: guard.ip,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;

  // Soft delete en lugar de hard delete
  const product = await db.product.update({
    where: { id, deletedAt: null },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "SOFT_DELETE",
    entity: "Product",
    entityId: id,
    metadata: { name: product.name, sku: product.sku },
    ipAddress: guard.ip,
  });

  return NextResponse.json({ ok: true });
}
