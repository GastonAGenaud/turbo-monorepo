"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@ggseeds/ui";

type ImportAction = "IMPORT" | "REFRESH_IMAGES";
type ImportSource = "MERLINGROW" | "DUTCHPASSION" | "ALL";

export function ImportActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runImport(source: ImportSource, action: ImportAction) {
    const currentTask = `${action}:${source}`;
    setLoading(currentTask);
    setMessage(null);

    const response = await fetch("/api/admin/imports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source, action }),
    });

    const body = await response.json().catch(() => null);
    setLoading(null);

    if (!response.ok) {
      setMessage(body?.error ?? "Error ejecutando import");
      return;
    }

    if (body?.mode === "ecs" && body?.taskArn) {
      const taskId = String(body.taskArn).split("/").at(-1);
      setMessage(`${action === "REFRESH_IMAGES" ? "Refresh de imágenes" : "Import"} enviado a AWS ECS (${source}): ${taskId}`);
    } else if (body?.mode === "inline" && body?.result) {
      if (action === "IMPORT" && source === "ALL" && body.result.merlin && body.result.dutch) {
        setMessage(
          `Import inline OK. Merlin: +${body.result.merlin.created}/${body.result.merlin.updated}. Dutch: +${body.result.dutch.created}/${body.result.dutch.updated}.`,
        );
      } else if (action === "REFRESH_IMAGES") {
        setMessage(
          `Refresh inline OK (${source}): revisados ${body.result.checked ?? 0}, actualizados ${body.result.updated ?? 0}, salteados ${body.result.skipped ?? 0}, fallidos ${body.result.failed ?? 0}.`,
        );
      } else {
        setMessage(
          `Import inline OK (${source}): creados ${body.result.created ?? 0}, actualizados ${body.result.updated ?? 0}, fallidos ${body.result.failed ?? 0}.`,
        );
      }
    } else {
      setMessage(`${action === "REFRESH_IMAGES" ? "Refresh de imágenes" : "Import"} ejecutado: ${source}`);
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">ETL de catálogo</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => runImport("MERLINGROW", "IMPORT")} disabled={Boolean(loading)}>
            {loading === "IMPORT:MERLINGROW" ? "Importando..." : "Importar/Actualizar MerlinGrow"}
          </Button>
          <Button onClick={() => runImport("DUTCHPASSION", "IMPORT")} disabled={Boolean(loading)}>
            {loading === "IMPORT:DUTCHPASSION" ? "Importando..." : "Importar/Actualizar Dutch Passion"}
          </Button>
          <Button variant="outline" onClick={() => runImport("ALL", "IMPORT")} disabled={Boolean(loading)}>
            {loading === "IMPORT:ALL" ? "Importando..." : "Importar todo"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">Mantenimiento de imágenes</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => runImport("MERLINGROW", "REFRESH_IMAGES")} disabled={Boolean(loading)}>
            {loading === "REFRESH_IMAGES:MERLINGROW" ? "Refrescando..." : "Refrescar imágenes MerlinGrow"}
          </Button>
          <Button variant="secondary" onClick={() => runImport("DUTCHPASSION", "REFRESH_IMAGES")} disabled={Boolean(loading)}>
            {loading === "REFRESH_IMAGES:DUTCHPASSION" ? "Refrescando..." : "Refrescar imágenes Dutch Passion"}
          </Button>
          <Button variant="outline" onClick={() => runImport("ALL", "REFRESH_IMAGES")} disabled={Boolean(loading)}>
            {loading === "REFRESH_IMAGES:ALL" ? "Refrescando..." : "Refrescar todas las imágenes"}
          </Button>
        </div>
      </div>
      {message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            message.includes("OK") || message.includes("Task enviada")
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
