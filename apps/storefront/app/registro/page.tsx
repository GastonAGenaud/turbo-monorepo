import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";

import { RegisterForm } from "../../components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
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
