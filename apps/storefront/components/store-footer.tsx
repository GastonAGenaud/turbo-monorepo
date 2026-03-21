import Link from "next/link";
import { Instagram, MessageCircle, Send } from "lucide-react";

import { ADMIN_WHATSAPP_DISPLAY, MANUAL_PAYMENT_COPY, SHIPPING_COPY, buildWhatsAppUrl } from "@ggseeds/shared";

export function StoreFooter() {
  return (
    <footer id="contacto" className="mt-24 border-t border-[var(--line)] bg-[color:var(--card)]/50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 text-sm md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:px-6 lg:px-8">
        <div className="space-y-5">
          <p className="text-lg font-semibold">
            GG<span className="text-[color:var(--accent)]">seeds</span>
          </p>
          <p className="max-w-sm leading-7 text-[color:var(--muted)]">
            Inspirados por la cultura de Amsterdam, curamos las mejores genéticas de Europa con despacho coordinado en Buenos Aires y todo el país.
          </p>
          <div className="flex gap-3 text-[color:var(--muted)]">
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] p-2 transition hover:text-[color:var(--accent)]">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] p-2 transition hover:text-[color:var(--accent)]">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] p-2 transition hover:text-[color:var(--accent)]">
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-semibold text-[color:var(--fg)]">Navegación</p>
          <div className="flex flex-col gap-3 text-[color:var(--muted)]">
            <Link href="/catalogo">Catálogo Completo</Link>
            <Link href="/#catalogo">Novedades</Link>
            <Link href="/#categorias">Categorías</Link>
            <Link href="/#nosotros">Guía de Colección</Link>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-semibold text-[color:var(--fg)]">Legal</p>
          <div className="space-y-3 text-[color:var(--muted)]">
            <p>Mayores de 18 años</p>
            <p>Uso para preservación genética</p>
            <p>{MANUAL_PAYMENT_COPY}</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-semibold text-[color:var(--fg)]">Contacto</p>
          <div className="space-y-3 text-[color:var(--muted)]">
            <p>Buenos Aires, Argentina (CABA)</p>
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="text-[color:var(--accent)]">
              {ADMIN_WHATSAPP_DISPLAY}
            </a>
            <p>{SHIPPING_COPY}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 border-t border-[var(--line)] px-4 py-5 text-xs text-[color:var(--muted)] md:px-6 lg:px-8">
        <p>© 2026 GGseeds. Todos los derechos reservados.</p>
        <p>Catálogo vivo con stock importado y atención directa por WhatsApp.</p>
      </div>
    </footer>
  );
}
