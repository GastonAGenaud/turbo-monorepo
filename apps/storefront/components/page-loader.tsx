"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out after page is ready
    const onLoad = () => {
      setFading(true);
      setTimeout(() => setVisible(false), 500);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      // Fallback: hide after 4s regardless
      const t = setTimeout(onLoad, 4000);
      return () => {
        window.removeEventListener("load", onLoad);
        clearTimeout(t);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-[color:var(--bg)] transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Spinning seed icon */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Outer ring */}
        <svg
          className="absolute inset-0 animate-spin"
          viewBox="0 0 64 64"
          fill="none"
          style={{ animationDuration: "1.2s" }}
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="url(#spinGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="140"
            strokeDashoffset="100"
          />
          <defs>
            <linearGradient id="spinGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Logo center */}
        <span className="font-serif-display text-lg text-[color:var(--fg)]">
          GG<span className="text-[color:var(--accent)]">s</span>
        </span>
      </div>

      <div className="space-y-1 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-[color:var(--accent)]">
          Cargando
        </p>
        <p className="text-xs text-[color:var(--muted)]">
          Genéticas premium para coleccionistas
        </p>
      </div>
    </div>
  );
}
