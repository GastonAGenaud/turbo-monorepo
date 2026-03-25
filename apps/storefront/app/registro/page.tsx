import Link from "next/link";
import { buildWhatsAppUrl } from "@ggseeds/shared";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";

import { RegisterForm } from "../../components/register-form";

export default function RegisterPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-panel rounded-[30px] p-8">
        <p className="section-kicker">Registro seguro</p>
        <h1 className="mt-3 font-serif-display text-5xl leading-none">Creá tu cuenta GGseeds.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--muted)]">
          Guardá tus datos, seguí tus pedidos y retomá compras sin volver a empezar. El registro es corto y tiene verificación básica para cuidar el canal.
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--muted)]">
          Si preferís no crear cuenta, también podés comprar como invitado y coordinar todo por WhatsApp.
        </p>
        <div className="mt-6">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-[var(--line)] px-5 py-3 text-sm font-medium text-[color:var(--fg)] transition hover:border-[color:var(--accent)]/40 hover:text-[color:var(--accent)]"
          >
            Prefiero resolverlo por WhatsApp
          </a>
        </div>
      </div>
      <Card className="surface-panel rounded-[30px]">
        <CardHeader>
          <CardTitle className="font-serif-display text-4xl">Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            ¿Ya tenés cuenta? <Link href="/login" className="text-[color:var(--accent)]">Ingresá</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
