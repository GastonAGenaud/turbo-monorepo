import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { db } from "@ggseeds/db";

import { authOptions } from "../../../lib/auth";

const schema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(32).optional(),
  addressLine1: z.string().max(180).optional(),
  addressLine2: z.string().max(180).optional(),
  city: z.string().max(120).optional(),
  postalCode: z.string().max(12).optional(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = schema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const profile = await db.profile.upsert({
    where: { userId: session.user.id },
    update: payload.data,
    create: {
      userId: session.user.id,
      ...payload.data,
    },
  });

  return NextResponse.json({ ok: true, profile });
}
