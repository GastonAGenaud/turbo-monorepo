"use client";

/**
 * Hero animation — pure CSS + inline SVG.
 * Zero JS runtime cost, GPU-accelerated, ~0KB bundle impact.
 * Replaces Three.js (~600KB) for max performance.
 */
export function HeroAnimation() {
  return (
    <div className="hero-anim-root" aria-hidden="true">
      {/* Ambient glow orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Main leaf */}
      <div className="leaf-wrap leaf-main">
        <CannabisLeafSVG opacity={1} />
      </div>

      {/* Ghost leaves */}
      <div className="leaf-wrap leaf-ghost-1">
        <CannabisLeafSVG opacity={0.12} />
      </div>
      <div className="leaf-wrap leaf-ghost-2">
        <CannabisLeafSVG opacity={0.07} />
      </div>

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <span key={p.id} className="particle" style={p.style as React.CSSProperties} />
      ))}

      <style>{CSS}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cannabis leaf SVG (simplified 7-blade silhouette)                  */
/* ------------------------------------------------------------------ */
function CannabisLeafSVG({ opacity }: { opacity: number }) {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", opacity }}
    >
      {/* Stem */}
      <path d="M100 210 Q98 170 100 140" stroke="var(--leaf-stroke)" strokeWidth="3.5" strokeLinecap="round" />

      {/* Center blade */}
      <path
        d="M100 140 Q80 110 72 68 Q90 88 100 80 Q110 88 128 68 Q120 110 100 140Z"
        fill="var(--leaf-fill)"
        stroke="var(--leaf-stroke)"
        strokeWidth="1"
      />
      {/* Left-1 blade */}
      <path
        d="M95 128 Q62 112 38 82 Q62 90 72 78 Q82 98 95 108Z"
        fill="var(--leaf-fill)"
        stroke="var(--leaf-stroke)"
        strokeWidth="1"
      />
      {/* Right-1 blade */}
      <path
        d="M105 128 Q138 112 162 82 Q138 90 128 78 Q118 98 105 108Z"
        fill="var(--leaf-fill)"
        stroke="var(--leaf-stroke)"
        strokeWidth="1"
      />
      {/* Left-2 blade */}
      <path
        d="M90 138 Q52 130 24 108 Q52 108 62 94 Q76 118 90 122Z"
        fill="var(--leaf-fill)"
        stroke="var(--leaf-stroke)"
        strokeWidth="1"
      />
      {/* Right-2 blade */}
      <path
        d="M110 138 Q148 130 176 108 Q148 108 138 94 Q124 118 110 122Z"
        fill="var(--leaf-fill)"
        stroke="var(--leaf-stroke)"
        strokeWidth="1"
      />
      {/* Left-3 blade */}
      <path
        d="M88 150 Q50 152 20 140 Q46 132 56 118 Q72 142 88 144Z"
        fill="var(--leaf-fill)"
        stroke="var(--leaf-stroke)"
        strokeWidth="1"
      />
      {/* Right-3 blade */}
      <path
        d="M112 150 Q150 152 180 140 Q154 132 144 118 Q128 142 112 144Z"
        fill="var(--leaf-fill)"
        stroke="var(--leaf-stroke)"
        strokeWidth="1"
      />

      {/* Vein lines */}
      <path d="M100 140 L100 80" stroke="var(--leaf-vein)" strokeWidth="0.8" opacity="0.6" />
      <path d="M95 128 L60 84" stroke="var(--leaf-vein)" strokeWidth="0.7" opacity="0.5" />
      <path d="M105 128 L140 84" stroke="var(--leaf-vein)" strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Particles                                                          */
/* ------------------------------------------------------------------ */
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  style: {
    "--x": `${10 + Math.floor(((i * 137.5) % 80))}%`,
    "--delay": `${(i * 0.41) % 4}s`,
    "--dur": `${3.5 + (i % 5) * 0.7}s`,
    "--size": `${3 + (i % 4) * 2}px`,
    "--opacity": `${0.3 + (i % 3) * 0.2}`,
    left: `${10 + Math.floor(((i * 137.5) % 80))}%`,
    bottom: `${5 + Math.floor(((i * 79.3) % 60))}%`,
  },
}));

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const CSS = `
  .hero-anim-root {
    position: relative;
    width: 100%;
    height: 540px;
    overflow: hidden;
    background: transparent;
    --leaf-fill: color-mix(in srgb, var(--accent, #0bc38f) 55%, #1a3a10 45%);
    --leaf-stroke: color-mix(in srgb, var(--accent, #0bc38f) 70%, transparent 30%);
    --leaf-vein: color-mix(in srgb, var(--accent, #0bc38f) 40%, white 60%);
  }

  /* Glow orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: orbPulse 6s ease-in-out infinite alternate;
  }
  .orb-1 {
    width: 360px; height: 360px;
    background: color-mix(in srgb, var(--accent, #0bc38f) 22%, transparent 78%);
    top: -60px; right: -40px;
    animation-delay: 0s;
  }
  .orb-2 {
    width: 280px; height: 280px;
    background: color-mix(in srgb, #3b82f6 12%, transparent 88%);
    bottom: -40px; left: 5%;
    animation-delay: -2s;
  }
  .orb-3 {
    width: 200px; height: 200px;
    background: color-mix(in srgb, var(--accent, #0bc38f) 18%, transparent 82%);
    top: 40%; left: 40%;
    animation-delay: -4s;
  }

  /* Leaves */
  .leaf-wrap {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .leaf-main {
    width: 280px; height: 308px;
    top: 50%; right: 8%;
    transform: translateY(-50%);
    animation: leafFloat 5s ease-in-out infinite, leafRotate 18s ease-in-out infinite;
    filter: drop-shadow(0 0 28px color-mix(in srgb, var(--accent, #0bc38f) 45%, transparent 55%));
  }
  .leaf-ghost-1 {
    width: 180px; height: 198px;
    top: 12%; right: 28%;
    animation: leafFloat 7s ease-in-out infinite reverse, leafRotateSlow 24s linear infinite;
  }
  .leaf-ghost-2 {
    width: 130px; height: 143px;
    bottom: 8%; right: 18%;
    animation: leafFloat 6s ease-in-out infinite, leafRotateSlow 30s linear infinite reverse;
  }

  /* Particles */
  .particle {
    position: absolute;
    width: var(--size, 4px);
    height: var(--size, 4px);
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent, #0bc38f) 70%, white 30%);
    opacity: var(--opacity, 0.4);
    animation: particleRise var(--dur, 4s) ease-in var(--delay, 0s) infinite;
  }

  /* Keyframes */
  @keyframes orbPulse {
    from { transform: scale(1) translate(0, 0); opacity: 0.7; }
    to   { transform: scale(1.18) translate(12px, -14px); opacity: 1; }
  }
  @keyframes leafFloat {
    0%, 100% { transform: translateY(-50%) translateY(0px); }
    50%       { transform: translateY(-50%) translateY(-18px); }
  }
  @keyframes leafRotate {
    0%   { filter: drop-shadow(0 0 28px color-mix(in srgb, var(--accent, #0bc38f) 45%, transparent 55%)) rotate(-3deg); }
    50%  { filter: drop-shadow(0 0 44px color-mix(in srgb, var(--accent, #0bc38f) 65%, transparent 35%)) rotate(3deg); }
    100% { filter: drop-shadow(0 0 28px color-mix(in srgb, var(--accent, #0bc38f) 45%, transparent 55%)) rotate(-3deg); }
  }
  @keyframes leafRotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes particleRise {
    0%   { transform: translateY(0) scale(1);    opacity: var(--opacity, 0.4); }
    80%  { transform: translateY(-120px) scale(0.6); opacity: calc(var(--opacity, 0.4) * 0.5); }
    100% { transform: translateY(-150px) scale(0); opacity: 0; }
  }

  /* Dark mode tweaks */
  @media (prefers-color-scheme: dark) {
    .hero-anim-root {
      --leaf-fill: color-mix(in srgb, var(--accent, #0bc38f) 50%, #0d2b0d 50%);
    }
  }

  /* Reduced motion: freeze everything */
  @media (prefers-reduced-motion: reduce) {
    .orb, .leaf-wrap, .particle {
      animation: none !important;
    }
    .leaf-main { transform: translateY(-50%); }
  }
`;
