import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[color:var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="font-semibold tracking-wide">
            GG<span className="text-[color:var(--accent)]">admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-[color:var(--muted)]">
            <Link href="/">Dashboard</Link>
            <Link href="/productos">Productos</Link>
            <Link href="/categorias">Categorías</Link>
            <Link href="/ordenes">Órdenes</Link>
            <Link href="/usuarios">Usuarios</Link>
            <Link href="/imports">Imports</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
