"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button, Input, Label } from "@ggseeds/ui";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-5"
      action={async (formData) => {
        setLoading(true);
        setError(null);

        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        setLoading(false);

        if (result?.error) {
          setError("Credenciales inválidas");
          return;
        }

        router.push("/");
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-2 h-11 rounded-2xl bg-black/20" />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required className="mt-2 h-11 rounded-2xl bg-black/20" />
      </div>
      <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar al admin"}
      </Button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
