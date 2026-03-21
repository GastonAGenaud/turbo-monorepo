import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--accent)] text-black hover:brightness-110 hover:shadow-[0_0_22px_color-mix(in_srgb,var(--accent)_40%,transparent)] hover:scale-[1.02]",
        secondary:
          "bg-[color:var(--accent)]/15 text-[color:var(--accent)] hover:bg-[color:var(--accent)]/25 hover:shadow-[0_0_14px_color-mix(in_srgb,var(--accent)_20%,transparent)]",
        outline:
          "border border-[var(--line)] bg-[color:var(--card)] text-[color:var(--fg)] hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/8 hover:text-[color:var(--accent)]",
        ghost:
          "text-[color:var(--fg)] hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)]",
        destructive: "bg-rose-600 text-white hover:bg-rose-500 hover:shadow-[0_0_14px_rgba(225,29,72,0.35)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
