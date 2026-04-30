"use client";

import { useEffect, useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";

import { ProductImage } from "./product-image";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const validImages = images.filter(Boolean);
  const current = validImages[active] ?? validImages[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (zoomOpen && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!zoomOpen && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [zoomOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
      if (!zoomOpen) return;
      if (event.key === "ArrowRight") setActive((i) => (i + 1) % validImages.length);
      if (event.key === "ArrowLeft") setActive((i) => (i - 1 + validImages.length) % validImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="ambient-border relative aspect-square overflow-hidden rounded-[30px] border border-[var(--line)] bg-[color:var(--card-strong)]">
        <ProductImage src={null} alt={alt} className="object-cover" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label="Ampliar imagen"
        className="ambient-border group relative block aspect-square w-full overflow-hidden rounded-[30px] border border-[var(--line)] bg-[color:var(--card-strong)]"
      >
        <ProductImage src={current} alt={alt} priority className="object-cover" sizes="(max-width: 1024px) 100vw, 560px" />
        <span className="pointer-events-none absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>

      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {validImages.slice(0, 4).map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Ver imagen ${idx + 1} de ${alt}`}
              aria-pressed={idx === active}
              className={`relative aspect-square overflow-hidden rounded-2xl border bg-[color:var(--card)] transition-all duration-200 ${
                idx === active
                  ? "border-[color:var(--accent)] ring-2 ring-[color:var(--accent)]/30"
                  : "border-[var(--line)] hover:border-[color:var(--accent)]/40"
              }`}
            >
              <ProductImage src={img} alt={alt} className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setZoomOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setZoomOpen(false);
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-md"
      >
        {zoomOpen && (
          <div className="flex h-full w-full items-center justify-center p-4 sm:p-8">
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative h-full max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[20px]">
              <ProductImage src={current} alt={alt} sizes="100vw" className="object-contain" />
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
