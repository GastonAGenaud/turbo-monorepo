"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, XCircle } from "lucide-react";

import { ADMIN_WHATSAPP_DISPLAY, MANUAL_PAYMENT_COPY, SHIPPING_COPY, buildWhatsAppUrl } from "@ggseeds/shared";

const STORAGE_KEY = "ggseeds-legal-accepted-v1";

export function LegalNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem(STORAGE_KEY) === "yes";
    setOpen(!accepted);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[color:var(--bg)]/75 backdrop-blur-md" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-[var(--line)] bg-[color:var(--card-strong)] p-8 shadow-[var(--shadow)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(124,92,255,0.08),transparent_40%)]" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[color:var(--accent)]/20 bg-[color:var(--accent)]/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">
            <AlertTriangle className="h-4 w-4" />
            Descargo legal
          </div>

          <div className="space-y-4">
            <h2 className="font-serif-display text-4xl text-[color:var(--fg)] md:text-5xl">Ingreso solo para mayores de 18 años.</h2>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)] md:text-base">
              GGseeds comercializa semillas legales únicamente para coleccionismo y preservación genética. No promovemos usos contrarios a la normativa vigente. {MANUAL_PAYMENT_COPY}
            </p>
            <div className="grid gap-3 rounded-[24px] border border-[var(--line)] bg-[color:var(--bg-soft)] p-5 text-sm text-[color:var(--muted)] md:grid-cols-2">
              <p>{SHIPPING_COPY}</p>
              <p>
                Atención directa por WhatsApp: <a className="text-[color:var(--accent)]" href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">{ADMIN_WHATSAPP_DISPLAY}</a>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={() => {
                window.localStorage.setItem(STORAGE_KEY, "yes");
                setOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_22px_color-mix(in_srgb,var(--accent)_40%,transparent)] hover:scale-[1.02] active:scale-[0.97]"
            >
              Soy mayor de edad
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://www.google.com"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[color:var(--card)] px-6 py-3 text-sm font-medium text-[color:var(--fg)] transition-all duration-200 hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/8 hover:text-[color:var(--accent)]"
            >
              Salir del sitio
              <XCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
