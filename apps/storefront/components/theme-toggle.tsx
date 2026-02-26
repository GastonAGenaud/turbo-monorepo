"use client";

import { useEffect, useState } from "react";

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
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem("ggseeds-theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {isDark ? "Modo claro" : "Modo oscuro"}
    </Button>
  );
}
