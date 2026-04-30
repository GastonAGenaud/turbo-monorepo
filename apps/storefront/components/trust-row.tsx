import { MessageCircle, RefreshCw, Truck, UserCheck } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Envíos a CABA y todo el país", subtitle: "Coordinados según zona" },
  { icon: MessageCircle, title: "100% por WhatsApp", subtitle: "Pago, envío y seguimiento" },
  { icon: RefreshCw, title: "Stock actualizado a diario", subtitle: "Catálogo vivo importado de los bancos" },
  { icon: UserCheck, title: "Atención humana", subtitle: "Te responde una persona, no un bot" },
];

export function TrustRow() {
  return (
    <section
      aria-label="Beneficios de comprar en GGseeds"
      className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-[color:var(--card)]/60 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:px-8"
    >
      {ITEMS.map(({ icon: Icon, title, subtitle }) => (
        <div key={title} className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white/5 text-[color:var(--accent)]">
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-[color:var(--fg)]">{title}</p>
            <p className="text-xs leading-5 text-[color:var(--muted)]">{subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
