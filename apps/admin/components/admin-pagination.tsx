import Link from "next/link";

import { Button } from "@ggseeds/ui";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  /** e.g. "/productos" — current pathname; query is appended */
  basePath: string;
  /** Extra search params to preserve (e.g. q, source) */
  extraParams?: Record<string, string | undefined>;
}

function buildHref(basePath: string, page: number, extra?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value && value.trim()) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function AdminPagination({ page, totalPages, basePath, extraParams }: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-[color:var(--muted)]"
    >
      <p>
        Página <span className="font-medium text-[color:var(--fg)]">{page}</span> de{" "}
        <span className="font-medium text-[color:var(--fg)]">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="rounded-full px-4"
          disabled={page <= 1}
        >
          <Link
            href={buildHref(basePath, prevPage, extraParams)}
            aria-label="Página anterior"
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
          >
            ← Anterior
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="rounded-full px-4"
          disabled={page >= totalPages}
        >
          <Link
            href={buildHref(basePath, nextPage, extraParams)}
            aria-label="Página siguiente"
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
          >
            Siguiente →
          </Link>
        </Button>
      </div>
    </nav>
  );
}
