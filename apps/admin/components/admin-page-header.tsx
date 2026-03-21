import type { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="section-kicker">{eyebrow}</p>
        <div className="space-y-2">
          <h1 className="font-serif-display text-4xl leading-[0.95] text-[color:var(--fg)] md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)] md:text-base">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
