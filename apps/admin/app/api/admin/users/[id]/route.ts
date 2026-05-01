import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@ggseeds/db";

import { writeAuditLog } from "../../../../../lib/audit";
import { ensureAdminApi } from "../../../../../lib/guard";
import { userResetPasswordSchema, userRoleSchema } from "../../../../../lib/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await ensureAdminApi(request);
  if (!guard.ok) return guard.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if ("role" in body) {
    const parsed = userRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }
    // Don't let the last admin demote themselves.
    if (target.id === guard.userId && target.role === "ADMIN" && parsed.data.role !== "ADMIN") {
      const otherAdmins = await db.user.count({ where: { role: "ADMIN", id: { not: target.id } } });
      if (otherAdmins === 0) {
        return NextResponse.json(
          { error: "No podés quitarte el rol ADMIN siendo el único administrador." },
          { status: 400 },
        );
      }
    }
    await db.user.update({ where: { id }, data: { role: parsed.data.role } });
    await writeAuditLog({
      userId: guard.userId,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      metadata: { field: "role", from: target.role, to: parsed.data.role, email: target.email },
      ipAddress: guard.ip,
    });
    return NextResponse.json({ ok: true });
  }

  if ("password" in body) {
    const parsed = userResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "La contraseña debe tener entre 8 y 72 caracteres." },
        { status: 400 },
      );
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await db.user.update({
      where: { id },
      data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
    });
    await writeAuditLog({
      userId: guard.userId,
      action: "UPDATE",
      entity: "User",
      entityId: id,
      metadata: { field: "passwordHash", reset: true, email: target.email },
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

  if (id === guard.userId) {
    return NextResponse.json(
      { error: "No podés eliminar tu propio usuario mientras estás logueado." },
      { status: 400 },
    );
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const otherAdmins = await db.user.count({ where: { role: "ADMIN", id: { not: target.id } } });
    if (otherAdmins === 0) {
      return NextResponse.json(
        { error: "No podés eliminar al último ADMIN del sistema." },
        { status: 400 },
      );
    }
  }

  await db.user.delete({ where: { id } });

  await writeAuditLog({
    userId: guard.userId,
    action: "DELETE",
    entity: "User",
    entityId: id,
    metadata: { email: target.email, role: target.role },
    ipAddress: guard.ip,
  });

  return NextResponse.json({ ok: true });
}
