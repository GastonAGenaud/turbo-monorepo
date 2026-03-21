import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { db } from "@ggseeds/db";
import { checkRateLimit, registerSchema } from "@ggseeds/shared";
import { verifyCaptchaChallenge } from "../../../lib/captcha";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`register:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  try {
    const payload = registerSchema.parse(await request.json());
    const email = payload.email.toLowerCase();

    if (payload.website?.trim()) {
      return NextResponse.json({ error: "No se pudo validar el registro" }, { status: 400 });
    }

    if (!verifyCaptchaChallenge(payload.captchaToken, payload.captchaAnswer)) {
      return NextResponse.json({ error: "Captcha inválido o vencido" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    await db.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            name: payload.name,
          },
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }
}
