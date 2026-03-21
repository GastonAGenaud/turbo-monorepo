"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { MessageCircle, Search, ShieldCheck, ShoppingBag } from "lucide-react";

import { buildWhatsAppUrl } from "@ggseeds/shared";
import { Button } from "@ggseeds/ui";

import { useCart } from "./cart-provider";
import { ThemeToggle } from "./theme-toggle";

export function StoreNavbar() {
  const { data } = useSession();
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color:var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          GG<span className="text-[color:var(--accent)]">seeds</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Button asChild size="sm" variant="ghost" className="text-[color:var(--muted)] hover:text-[color:var(--fg)]">
            <Link href="/catalogo">Catálogo</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-[color:var(--muted)] hover:text-[color:var(--fg)]">
            <Link href="/#nosotros">Nosotros</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-[color:var(--muted)] hover:text-[color:var(--fg)]">
            <Link href="/#contacto">Contacto</Link>
          </Button>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="ghost" className="px-2 text-[color:var(--muted)] hover:text-[color:var(--fg)]">
            <Link href="/catalogo" aria-label="Buscar en catálogo">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="relative px-2 text-[color:var(--muted)] hover:text-[color:var(--fg)]">
            <Link href="/carrito" aria-label={`Carrito con ${cartCount} items`}>
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-[#07110d]">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          {data?.user ? (
            <Button asChild size="sm" variant="ghost">
              <Link href="/perfil">Perfil</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Ingresar</Link>
            </Button>
          )}
          {data?.user?.role === "ADMIN" && adminUrl ? (
            <Button asChild size="sm" variant="outline">
              <Link href={adminUrl}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Panel admin
              </Link>
            </Button>
          ) : null}
          {data?.user ? (
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Salir
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
