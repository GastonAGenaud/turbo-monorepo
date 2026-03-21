import { NextResponse } from "next/server";

import { checkRateLimit } from "@ggseeds/shared";

import { createCaptchaChallenge } from "../../../lib/captcha";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`captcha:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
  }

  const challenge = createCaptchaChallenge();
  return NextResponse.json(challenge, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
