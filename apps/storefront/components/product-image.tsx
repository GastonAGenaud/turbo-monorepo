"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackClassName?: string;
  fallbackLabel?: string;
}

export function ProductImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  fallbackClassName = "flex h-full items-center justify-center bg-zinc-900 text-xs text-zinc-500",
  fallbackLabel = "Sin imagen",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (!src || hasError) {
    return <div className={fallbackClassName}>{fallbackLabel}</div>;
  }

  // Cloudflare-fronted hosts that block Vercel's image optimizer with 502.
  const bypassOptimization = /(?:^|\.)dutch-passion\.ar$/.test(new URL(src, "https://x").hostname);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={75}
      unoptimized={bypassOptimization}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
