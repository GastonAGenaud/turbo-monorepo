"use client";

import { useState } from "react";

import { Button } from "@ggseeds/ui";

export function ImportActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runImport(source: "MERLINGROW" | "DUTCHPASSION" | "ALL") {
    setLoading(source);
    setMessage(null);

    const response = await fetch("/api/admin/imports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source }),
    });

    const body = await response.json().catch(() => null);
    setLoading(null);

    if (!response.ok) {
      setMessage(body?.error ?? "Error ejecutando import");
      return;
    }

    setMessage(`Import ejecutado: ${source}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => runImport("MERLINGROW")} disabled={Boolean(loading)}>
          {loading === "MERLINGROW" ? "Importando..." : "Importar/Actualizar MerlinGrow"}
        </Button>
        <Button onClick={() => runImport("DUTCHPASSION")} disabled={Boolean(loading)}>
          {loading === "DUTCHPASSION" ? "Importando..." : "Importar/Actualizar Dutch Passion"}
        </Button>
        <Button variant="outline" onClick={() => runImport("ALL")} disabled={Boolean(loading)}>
          {loading === "ALL" ? "Importando..." : "Importar todo"}
        </Button>
      </div>
      {message ? <p className="text-sm text-[color:var(--muted)]">{message}</p> : null}
    </div>
  );
}
