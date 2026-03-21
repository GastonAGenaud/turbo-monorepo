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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/12 bg-[#0b0e13]/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,163,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(124,92,255,0.12),transparent_40%)]" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#1ce6b3]/20 bg-[#1ce6b3]/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#6df3cf]">
            <AlertTriangle className="h-4 w-4" />
            Descargo legal
          </div>

          <div className="space-y-4">
            <h2 className="font-serif-display text-4xl text-white md:text-5xl">Ingreso solo para mayores de 18 años.</h2>
            <p className="max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              GGseeds comercializa semillas legales únicamente para coleccionismo y preservación genética. No promovemos usos contrarios a la normativa vigente. {MANUAL_PAYMENT_COPY}
            </p>
            <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 md:grid-cols-2">
              <p>{SHIPPING_COPY}</p>
              <p>
                Atención directa por WhatsApp: <a className="text-[#6df3cf]" href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">{ADMIN_WHATSAPP_DISPLAY}</a>
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#14f2b2] px-6 py-3 text-sm font-semibold text-[#07110d] transition hover:brightness-110"
            >
              Soy mayor de edad
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://www.google.com"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
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
