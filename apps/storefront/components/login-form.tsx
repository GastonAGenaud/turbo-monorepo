"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button, Input, Label } from "@ggseeds/ui";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        setError(null);
        setLoading(true);

        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        setLoading(false);

        if (result?.error) {
          setError("No pudimos validar esos datos. Revisalos o escribinos por WhatsApp si necesitás ayuda.");
          return;
        }

        router.push("/");
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="tu@email.com" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" placeholder="Tu contraseña" autoComplete="current-password" required />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando..." : "Entrar a mi cuenta"}
      </Button>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
