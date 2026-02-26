"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@ggseeds/ui";

import { ThemeToggle } from "./theme-toggle";

export function StoreNavbar() {
  const { data } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color:var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          GG<span className="text-[color:var(--accent)]">seeds</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-[color:var(--muted)]">
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/carrito">Carrito</Link>
          {data?.user ? <Link href="/perfil">Perfil</Link> : <Link href="/login">Ingresar</Link>}
          {data?.user?.role === "ADMIN" ? <Link href="http://localhost:3001">Admin</Link> : null}
          {data?.user ? (
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Salir
            </Button>
          ) : null}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
