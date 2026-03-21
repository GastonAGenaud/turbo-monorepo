"use client";

import { RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Label } from "@ggseeds/ui";

type CaptchaChallenge = {
  prompt: string;
  token: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);

  async function loadCaptcha() {
    setCaptchaLoading(true);
    const response = await fetch("/api/captcha", { cache: "no-store" });
    const body = await response.json().catch(() => null);
    setCaptchaLoading(false);

    if (!response.ok || !body?.prompt || !body?.token) {
      setCaptcha(null);
      setError("No se pudo cargar el captcha. Probá nuevamente.");
      return;
    }

    setCaptcha(body);
  }

  useEffect(() => {
    void loadCaptcha();
  }, []);

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
          captchaAnswer: String(formData.get("captchaAnswer") ?? ""),
          captchaToken: captcha?.token ?? "",
          website: String(formData.get("website") ?? ""),
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
          await loadCaptcha();
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

      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden opacity-0">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="rounded-[24px] border border-[var(--line)] bg-white/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-[color:var(--accent)]" />
              Verificación humana
            </p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {captchaLoading ? "Generando desafío..." : captcha?.prompt ?? "No se pudo generar el captcha."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadCaptcha()}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] transition hover:text-[color:var(--fg)]"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Nuevo
          </button>
        </div>

        <div className="mt-4">
          <Label htmlFor="captchaAnswer">Tu respuesta</Label>
          <Input id="captchaAnswer" name="captchaAnswer" inputMode="numeric" required />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={loading || captchaLoading || !captcha}>
        {loading ? "Creando..." : "Crear cuenta"}
      </Button>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
