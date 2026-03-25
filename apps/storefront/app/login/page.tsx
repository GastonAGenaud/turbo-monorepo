import Link from "next/link";
import { buildWhatsAppUrl } from "@ggseeds/shared";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";

import { LoginForm } from "../../components/login-form";

export default function LoginPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-panel rounded-[30px] p-8">
        <p className="section-kicker">Acceso cliente</p>
        <h1 className="mt-3 font-serif-display text-5xl leading-none">Ingresá a tu colección.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--muted)]">
          Desde tu cuenta podés revisar pedidos, guardar tus datos y retomar la coordinación por WhatsApp sin perder el historial.
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--muted)]">
          Si todavía no querés ingresar, también podés comprar como invitado y hablar directo con nosotros.
        </p>
        <div className="mt-6">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-[var(--line)] px-5 py-3 text-sm font-medium text-[color:var(--fg)] transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]"
          >
            Hablar con GGseeds por WhatsApp
          </a>
        </div>
      </div>
      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle className="font-serif-display text-4xl">Ingresar</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            ¿No tenés cuenta? <Link href="/registro" className="text-[color:var(--accent)]">Registrate</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
