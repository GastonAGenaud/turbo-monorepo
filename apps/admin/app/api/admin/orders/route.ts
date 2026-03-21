import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@ggseeds/db";

import { writeAuditLog } from "../../../../lib/audit";
import { ensureAdminApi } from "../../../../lib/guard";
import { orderStatusSchema } from "../../../../lib/schemas";

export async function GET(request: Request) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: orders });
}

const patchSchema = orderStatusSchema.extend({ orderId: z.string().cuid() });

export async function PATCH(request: Request) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) {
    return guard.response;
  }

  try {
    const payload = patchSchema.parse(await request.json());

    const order = await db.order.findUnique({ where: { id: payload.orderId } });
    const previousStatus = order?.status;

    await db.order.update({
      where: { id: payload.orderId },
      data: { status: payload.status },
    });

    await writeAuditLog({
      userId: guard.userId,
      action: "ORDER_STATUS_CHANGE",
      entity: "Order",
      entityId: payload.orderId,
      metadata: { from: previousStatus, to: payload.status },
      ipAddress: guard.ip,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
}
