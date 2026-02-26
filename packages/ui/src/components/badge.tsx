import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
      warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
      danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
      outline: "bg-transparent text-zinc-300 border border-zinc-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
