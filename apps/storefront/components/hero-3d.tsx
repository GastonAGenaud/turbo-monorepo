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

    // Detect WebGL availability synchronously before mounting the Canvas.
    // When the browser sandboxes/disables the GPU (GL_VENDOR = Disabled),
    // getContext("webgl") returns null and we fall back to the static image
    // instead of letting R3F spin in an infinite async error loop.
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");
    const noWebGL = !gl;

    if (prefersReduced || noWebGL) setShouldRender3D(false);
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
