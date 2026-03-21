"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

import { AMSTERDAM_HERO_IMAGE } from "../lib/brand";

const HeroSeedScene = dynamic(() => import("./hero-seed-scene"), {
  ssr: false,
});

export function Hero3D() {
  const [shouldRender3D, setShouldRender3D] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) setShouldRender3D(false);
  }, []);

  if (!shouldRender3D) {
    return (
      <img
        src={AMSTERDAM_HERO_IMAGE}
        alt="Paisaje editorial de inspiración Amsterdam para GGseeds"
        className="h-full min-h-[540px] w-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-full min-h-[540px] w-full bg-[color:var(--card-strong)]" />
      }
    >
      <HeroSeedScene />
    </Suspense>
  );
}
