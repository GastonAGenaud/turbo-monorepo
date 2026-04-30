"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@ggseeds/ui";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/ordenes", label: "Órdenes" },
  { href: "/usuarios", label: "Usuarios" },
  { href: "/imports", label: "ETL" },
  { href: "/audit", label: "Auditoría" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "https://ggseeds-storefront.vercel.app";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color:var(--bg)]/82 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 lg:px-8">
          <div className="glass-panel ambient-border rounded-[28px] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" aria-label="GG Seeds Admin — inicio" className="shrink-0">
                  <Image
                    src="/logo.png"
                    alt="GG Seeds"
                    width={220}
                    height={120}
                    priority
                    className="h-14 w-auto"
                  />
                </Link>
                <div className="space-y-2">
                  <p className="section-kicker">Control Room</p>
                  <p className="max-w-xl text-sm leading-6 text-[color:var(--muted)]">
                    Gestión centralizada de catálogo, órdenes, usuarios e importaciones.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="rounded-full px-5">
                  <a href={storefrontUrl} target="_blank" rel="noreferrer">
                    Ver storefront
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-full px-5"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>

            <nav className="mt-5 flex flex-wrap gap-2">
              {navigation.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Button
                    key={item.href}
                    asChild
                    size="sm"
                    variant={active ? "default" : "ghost"}
                    className={active ? "rounded-full px-4" : "rounded-full px-4 text-[color:var(--muted)] hover:text-[color:var(--fg)]"}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
