import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";

import { writeAuditLog } from "../../../../../lib/audit";
import { ensureAdminApi } from "../../../../../lib/guard";
import { orderArchiveSchema, orderStatusSchema } from "../../../../../lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // Two payload shapes are accepted: { status } and { archived }.
  if ("status" in body) {
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    const previous = await db.order.findUnique({ where: { id }, select: { status: true } });
    await db.order.update({ where: { id }, data: { status: parsed.data.status } });
    await writeAuditLog({
      userId: guard.userId,
      action: "ORDER_STATUS_CHANGE",
      entity: "Order",
      entityId: id,
      metadata: { from: previous?.status, to: parsed.data.status },
      ipAddress: guard.ip,
    });
    return NextResponse.json({ ok: true });
  }

  if ("archived" in body) {
    const parsed = orderArchiveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    await db.order.update({
      where: { id },
      data: { archivedAt: parsed.data.archived ? new Date() : null },
    });
    await writeAuditLog({
      userId: guard.userId,
      action: parsed.data.archived ? "SOFT_DELETE" : "RESTORE",
      entity: "Order",
      entityId: id,
      ipAddress: guard.ip,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true, status: true, fullName: true, total: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  await db.$transaction([
    db.orderItem.deleteMany({ where: { orderId: id } }),
    db.order.delete({ where: { id } }),
  ]);

  await writeAuditLog({
    userId: guard.userId,
    action: "DELETE",
    entity: "Order",
    entityId: id,
    metadata: { status: order.status, fullName: order.fullName, total: String(order.total) },
    ipAddress: guard.ip,
  });

  return NextResponse.json({ ok: true });
}
