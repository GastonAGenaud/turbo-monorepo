import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ggseeds/ui";

import { AdminLoginForm } from "../../components/admin-login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:mt-16 lg:grid-cols-[1fr_440px]">
      <section className="glass-panel ambient-border hidden rounded-[32px] p-8 lg:block">
        <p className="section-kicker">Backoffice GGseeds</p>
        <div className="mt-6 space-y-5">
          <h1 className="font-serif-display text-6xl leading-[0.92] text-[color:var(--fg)]">
            Operación simple,
            <br />
            control total.
          </h1>
          <p className="max-w-xl text-base leading-8 text-[color:var(--muted)]">
            Administrá catálogo, importaciones y órdenes desde un panel único, diseñado para operación individual con foco en claridad y velocidad.
          </p>
          <div className="grid gap-3 pt-4 text-sm text-[color:var(--muted)] md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-white/5 p-4">
              <p className="section-kicker">Catálogo</p>
              <p className="mt-3 leading-6">CRUD manual e importado con preview de markup.</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/5 p-4">
              <p className="section-kicker">ETL</p>
              <p className="mt-3 leading-6">Runs, errores y refresh de imágenes desde el mismo panel.</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white/5 p-4">
              <p className="section-kicker">Órdenes</p>
              <p className="mt-3 leading-6">Seguimiento de estados y contacto directo con clientes.</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="glass-panel ambient-border rounded-[32px]">
        <CardHeader className="space-y-3 pb-2">
          <p className="section-kicker">Acceso seguro</p>
          <CardTitle className="font-serif-display text-4xl">Ingreso administrador</CardTitle>
          <CardDescription>
            Entrá con tu cuenta de admin para gestionar stock, precios, usuarios, órdenes y corridas ETL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
