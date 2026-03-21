import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";

import { RegisterForm } from "../../components/register-form";

export default function RegisterPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-panel rounded-[30px] p-8">
        <p className="section-kicker">Registro seguro</p>
        <h1 className="mt-3 font-serif-display text-5xl leading-none">Creá tu cuenta GGseeds.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-[color:var(--muted)]">
          Vas a poder guardar tus datos, ver pedidos y continuar el flujo de compra con coordinación directa. Incluimos captcha y controles básicos para reducir altas automáticas.
        </p>
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
