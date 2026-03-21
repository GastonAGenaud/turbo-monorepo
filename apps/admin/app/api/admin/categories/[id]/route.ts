import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

import { writeAuditLog } from "../../../../../lib/audit";
import { ensureAdminApi } from "../../../../../lib/guard";
import { categorySchema } from "../../../../../lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;

  try {
    const payload = categorySchema.parse(await request.json());
    await db.category.update({ where: { id, deletedAt: null }, data: payload });

    await writeAuditLog({
      userId: guard.userId,
      action: "UPDATE",
      entity: "Category",
      entityId: id,
      metadata: { name: payload.name },
      ipAddress: guard.ip,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await params;

  // Soft delete
  const category = await db.category.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    userId: guard.userId,
    action: "SOFT_DELETE",
    entity: "Category",
    entityId: id,
    metadata: { name: category.name },
    ipAddress: guard.ip,
  });

  return NextResponse.json({ ok: true });
}
