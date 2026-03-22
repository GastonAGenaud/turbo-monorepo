"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, Suspense, useEffect, useState } from "react";

const FloatingSeedsScene = dynamic(() => import("./floating-seeds-scene"), {
  ssr: false,
});

class SeedErrorBoundary extends Component<
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
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function FloatingSeeds() {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Detect WebGL availability before mounting Canvas to avoid async error loops.
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");
    const noWebGL = !gl;

    if (prefersReduced || noWebGL) setShouldRender(false);
  }, []);

  if (!shouldRender) return null;

  return (
    <SeedErrorBoundary>
      <Suspense fallback={null}>
        <FloatingSeedsScene />
      </Suspense>
    </SeedErrorBoundary>
  );
}
