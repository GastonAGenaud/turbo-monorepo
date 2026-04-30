"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  ariaLabel = "Cantidad",
}: QuantityStepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-[var(--line)] bg-transparent">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        aria-label={`Disminuir ${ariaLabel.toLowerCase()}`}
        className="flex h-9 w-9 items-center justify-center rounded-l-full text-[color:var(--fg)] transition-colors hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[color:var(--fg)]"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) {
            onChange(Math.min(max, Math.max(min, Math.trunc(next))));
          }
        }}
        aria-label={ariaLabel}
        className="w-10 bg-transparent text-center text-sm font-medium tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        aria-label={`Aumentar ${ariaLabel.toLowerCase()}`}
        className="flex h-9 w-9 items-center justify-center rounded-r-full text-[color:var(--fg)] transition-colors hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[color:var(--fg)]"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
