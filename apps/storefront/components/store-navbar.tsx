"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { MessageCircle, Search, ShieldCheck, ShoppingBag } from "lucide-react";

import { buildWhatsAppUrl } from "@ggseeds/shared";
import { Button } from "@ggseeds/ui";

import { useCart } from "./cart-provider";
import { ThemeToggle } from "./theme-toggle";

export function StoreNavbar() {
  const { data } = useSession();
  const { items, lastAdded, openDrawer } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  // Bounce animation on cart icon when item is added
  const [bouncing, setBouncing] = useState(false);
  const prevLastAdded = useRef(0);

  useEffect(() => {
    if (lastAdded && lastAdded !== prevLastAdded.current) {
      prevLastAdded.current = lastAdded;
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 600);
      return () => clearTimeout(t);
    }
  }, [lastAdded]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color:var(--bg)]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[color:var(--bg)]/85">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
        <Link href="/" aria-label="GG Seeds — inicio" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="GG Seeds"
            width={224}
            height={224}
            priority
            sizes="(max-width: 768px) 56px, 80px"
            className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
          />
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

          {/* Cart button — opens drawer, bounce on add */}
          <Button
            size="sm"
            variant="ghost"
            onClick={openDrawer}
            aria-label={`Carrito con ${cartCount} items`}
            className="group relative px-2 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
          >
            <ShoppingBag
              className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
                bouncing ? "animate-[cartBounce_0.6s_ease-in-out]" : ""
              }`}
            />
            {cartCount > 0 && (
              <span
                className={`absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-black transition-transform duration-300 group-hover:scale-110 ${
                  bouncing ? "animate-[badgePop_0.6s_ease-in-out]" : ""
                }`}
              >
                {cartCount}
              </span>
            )}
          </Button>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="transition-all duration-300 hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-600 hover:shadow-[0_0_16px_rgba(37,211,102,0.18)] dark:hover:text-green-400"
          >
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Hablar por WhatsApp
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
