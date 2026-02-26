import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@ggseeds/ui";

import { LoginForm } from "../../components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="border-[var(--line)] bg-[color:var(--card)]">
        <CardHeader>
          <CardTitle>Ingresar</CardTitle>
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
