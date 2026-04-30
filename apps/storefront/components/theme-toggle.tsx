"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@ggseeds/ui";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ggseeds-theme");
    const dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span aria-hidden="true" className="inline-flex h-9 w-9" />
    );
  }

  const label = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      onClick={() => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem("ggseeds-theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
      }}
      className="h-9 w-9 px-0 text-[color:var(--muted)] hover:text-[color:var(--accent)]"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
