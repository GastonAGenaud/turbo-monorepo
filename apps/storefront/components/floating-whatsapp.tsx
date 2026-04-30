"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@ggseeds/shared";

export function FloatingWhatsapp() {
  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2">
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_24px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_32px_rgba(37,211,102,0.55)]"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25" />
        <MessageCircle className="relative h-6 w-6 fill-white" />

        {/* Tooltip */}
        <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-full border border-[var(--line)] bg-[color:var(--card-strong)] px-3 py-1.5 text-xs font-medium text-[color:var(--fg)] opacity-0 shadow-[var(--shadow)] transition-opacity duration-200 group-hover:opacity-100">
          Hablemos por WhatsApp
        </span>
      </a>
    </div>
  );
}
