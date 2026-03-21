"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, Suspense, useEffect, useState } from "react";

import { AMSTERDAM_HERO_IMAGE } from "../lib/brand";

const HeroSeedScene = dynamic(() => import("./hero-seed-scene"), {
  ssr: false,
});

const Fallback = () => (
  <img
    src={AMSTERDAM_HERO_IMAGE}
    alt="Paisaje editorial de inspiración Amsterdam para GGseeds"
    className="w-full object-cover"
    style={{ height: "540px" }}
    referrerPolicy="no-referrer"
  />
);

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <Fallback />;
    return this.props.children;
  }
}

export function Hero3D() {
  const [shouldRender3D, setShouldRender3D] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) setShouldRender3D(false);
  }, []);

  if (!shouldRender3D) return <Fallback />;

  return (
    <SceneErrorBoundary>
      <Suspense
        fallback={
          <div className="w-full bg-[color:var(--card-strong)]" style={{ height: "540px" }} />
        }
      >
        <HeroSeedScene />
      </Suspense>
    </SceneErrorBoundary>
  );
}
