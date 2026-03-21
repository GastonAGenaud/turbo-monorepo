import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";
import { applyMarkup, productMutationSchema } from "@ggseeds/shared";

import { writeAuditLog, extractIp } from "../../../../lib/audit";
import { ensureAdminApi } from "../../../../lib/guard";

export async function GET(request: Request) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  const products = await db.product.findMany({
    where: { deletedAt: null },
    include: { category: true, sourceMeta: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: products.map((product: any) => ({
      ...product,
      basePrice: Number(product.basePrice),
      finalPrice: Number(product.finalPrice),
      markupPercent: Number(product.markupPercent),
    })),
  });
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi(request);
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

    await writeAuditLog({
      userId: guard.userId,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      metadata: { name: payload.name, sku: payload.sku },
      ipAddress: guard.ip,
    });

    return NextResponse.json({ ok: true, productId: product.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear producto" },
      { status: 400 },
    );
  }
}
