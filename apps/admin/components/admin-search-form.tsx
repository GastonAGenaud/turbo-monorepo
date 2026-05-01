"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

interface AdminSearchFormProps {
  /** Defaults to "q" */
  param?: string;
  placeholder?: string;
  /** Defaults to current pathname */
  basePath?: string;
}

export function AdminSearchForm({
  param = "q",
  placeholder = "Buscar…",
  basePath,
}: AdminSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get(param) ?? "");

  function navigate(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue.trim()) {
      params.set(param, nextValue.trim());
    } else {
      params.delete(param);
    }
    params.delete("page");
    const path = basePath ?? window.location.pathname;
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${path}?${qs}` : path));
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(value);
      }}
      className="relative flex max-w-md items-center gap-2"
    >
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[color:var(--muted)]" />
      <input
        type="search"
        name={param}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-full border border-[var(--line)] bg-black/20 py-2 pl-9 pr-9 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            navigate("");
          }}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[color:var(--muted)] hover:text-[color:var(--fg)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {isPending ? <span className="sr-only">Buscando…</span> : null}
    </form>
  );
}
