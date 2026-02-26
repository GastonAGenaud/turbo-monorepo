import { NextResponse } from "next/server";

import { runAllImports } from "@ggseeds/scrapers";
import { checkRateLimit } from "@ggseeds/shared";

async function handleCron(request: Request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "");
  const allowedToken = process.env.IMPORT_CRON_TOKEN ?? process.env.CRON_SECRET;

  if (!auth || !allowedToken || auth !== allowedToken) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "cron";
  if (!checkRateLimit(`cron-import:${ip}`, 3, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const result = await runAllImports();
  return NextResponse.json({ ok: true, result });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
