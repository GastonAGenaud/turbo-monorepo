"use client";

import { HeroAnimation } from "./hero-animation";

/**
 * Lightweight hero animation wrapper.
 * Uses pure CSS + SVG — zero JS runtime, no WebGL dependency, ~0KB bundle impact.
 */
export function Hero3D() {
  return <HeroAnimation />;
}
