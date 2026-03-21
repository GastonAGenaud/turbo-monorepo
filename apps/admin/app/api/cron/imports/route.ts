import { NextResponse } from "next/server";

import { checkRateLimit } from "@ggseeds/shared";

import { executeImport } from "../../../../lib/import-execution";

function isAuthorized(request: Request): boolean {
  // Vercel cron: verificar header oficial (más seguro que Bearer token solo)
  const vercelCronSecret = process.env.CRON_SECRET;
  const vercelAuthHeader = request.headers.get("authorization")?.replace("Bearer ", "");

  if (vercelCronSecret && vercelAuthHeader === vercelCronSecret) {
    return true;
  }

  // Fallback: token propio para entornos fuera de Vercel
  const importToken = process.env.IMPORT_CRON_TOKEN;
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");

  if (importToken && authHeader === importToken) {
    return true;
  }

  return false;
}

async function handleCron(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "cron";
  if (!checkRateLimit(`cron-import:${ip}`, 3, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const result = await executeImport("ALL", "IMPORT");
  return NextResponse.json({ ok: true, result });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
