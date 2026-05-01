"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Shield, ShieldOff, Trash2 } from "lucide-react";

import { Button } from "@ggseeds/ui";

interface UserCardProps {
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
    createdAt: string;
    profileName: string | null;
    ordersCount: number;
  };
  /** ID of the current admin so the UI hides destructive actions on self. */
  currentUserId: string;
}

function generatePassword(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  for (const byte of bytes) {
    out += alphabet[byte % alphabet.length];
  }
  return out;
}

export function UserCard({ user, currentUserId }: UserCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const isSelf = user.id === currentUserId;
  const isAdmin = user.role === "ADMIN";

  async function patchUser(payload: Record<string, unknown>) {
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "No se pudo aplicar el cambio.");
      return false;
    }
    return true;
  }

  async function toggleRole() {
    const next = isAdmin ? "CUSTOMER" : "ADMIN";
    const ok = await patchUser({ role: next });
    if (ok) startTransition(() => router.refresh());
  }

  async function resetPassword() {
    setGeneratedPassword(null);
    const password = generatePassword();
    if (!confirm(`Vas a generar una contraseña temporal nueva para ${user.email}. Asegurate de copiarla; no se puede recuperar después. ¿Continuar?`)) {
      return;
    }
    const ok = await patchUser({ password });
    if (ok) {
      setGeneratedPassword(password);
      startTransition(() => router.refresh());
    }
  }

  async function destroy() {
    if (!confirm(`¿Eliminar al usuario ${user.email}? Esta acción borra sus pedidos archivados pero NO los activos. No se puede deshacer.`)) {
      return;
    }
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "No se pudo eliminar.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className={`rounded-[20px] border border-[var(--line)] bg-white/5 p-4 text-sm ${isAdmin ? "ring-1 ring-[color:var(--accent)]/30" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-[color:var(--fg)]">
            {user.email}
            {isSelf ? <span className="ml-2 rounded-full border border-[color:var(--accent)] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--accent)]">vos</span> : null}
          </p>
          <p className="text-xs text-[color:var(--muted)]">
            {user.profileName ?? "Sin perfil"} · {user.ordersCount} {user.ordersCount === 1 ? "orden" : "órdenes"}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${isAdmin ? "border-[color:var(--accent)] text-[color:var(--accent)]" : "border-[var(--line)] text-[color:var(--muted)]"}`}>
          {isAdmin ? <Shield className="h-3 w-3" /> : null}
          {isAdmin ? "Admin" : "Cliente"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={isPending}
          onClick={toggleRole}
        >
          {isAdmin ? <ShieldOff className="mr-2 h-3.5 w-3.5" /> : <Shield className="mr-2 h-3.5 w-3.5" />}
          {isAdmin ? "Quitar admin" : "Hacer admin"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={isPending}
          onClick={resetPassword}
        >
          <KeyRound className="mr-2 h-3.5 w-3.5" />
          Resetear contraseña
        </Button>
        {!isSelf ? (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-red-400 hover:text-red-300"
            disabled={isPending}
            onClick={destroy}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Eliminar
          </Button>
        ) : null}
      </div>

      {generatedPassword ? (
        <div className="mt-3 rounded-[12px] border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 p-3 text-xs">
          <p className="font-medium text-[color:var(--accent)]">Contraseña temporal generada</p>
          <p className="mt-1 break-all font-mono text-[color:var(--fg)]">{generatedPassword}</p>
          <p className="mt-1 text-[color:var(--muted)]">Copiala y compartila al usuario por un canal seguro. No se va a volver a mostrar.</p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(generatedPassword)}
            className="mt-2 rounded-full border border-[color:var(--accent)]/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/15"
          >
            Copiar
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
