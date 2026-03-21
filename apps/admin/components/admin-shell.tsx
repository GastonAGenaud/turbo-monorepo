"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import { Button } from "@ggseeds/ui";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[color:var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <Link href="/" className="font-semibold tracking-wide">
            GG<span className="text-[color:var(--accent)]">admin</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
            <Button asChild size="sm" variant="ghost">
              <Link href="/">Dashboard</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/productos">Productos</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/categorias">Categorías</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/ordenes">Órdenes</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/usuarios">Usuarios</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/imports">Imports</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/audit">Auditoría</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
