"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Tab {
  value: string;
  label: string;
  count?: number;
}

interface AdminTabsProps {
  param: string;
  tabs: Tab[];
  basePath: string;
}

export function AdminTabs({ param, tabs, basePath }: AdminTabsProps) {
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? tabs[0]?.value ?? "";

  return (
    <nav role="tablist" aria-label="Filtros" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab.value) {
          params.set(param, tab.value);
        } else {
          params.delete(param);
        }
        params.delete("page");
        const qs = params.toString();
        const href = qs ? `${basePath}?${qs}` : basePath;
        const active = current === tab.value;

        return (
          <Link
            key={tab.value || "all"}
            href={href}
            role="tab"
            aria-selected={active}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                : "border-[var(--line)] bg-white/5 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className="text-[10px] opacity-80">{tab.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
