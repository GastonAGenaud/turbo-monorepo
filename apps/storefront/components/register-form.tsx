"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Label } from "@ggseeds/ui";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      action={async (formData) => {
        setLoading(true);
        setError(null);

        const payload = {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        };

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setLoading(false);

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          setError(body?.error ?? "No se pudo crear la cuenta");
          return;
        }

        router.push("/login?registered=1");
      }}
    >
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando..." : "Crear cuenta"}
      </Button>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
