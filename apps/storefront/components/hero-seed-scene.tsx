"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";

import { SeedModel } from "./seed-model";
import { SeedParticles, WarmDust } from "./seed-particles";

export default function HeroSeedScene() {
  return (
    <div className="pointer-events-none w-full" style={{ height: "540px" }}>
      <Canvas
        camera={{ position: [0, 0.25, 3.6], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, failIfMajorPerformanceCaveat: false }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          // If the renderer somehow initialised but GL is broken, bail out.
          if (!gl.getContext()) throw new Error("WebGL context unavailable");
        }}
      >
        {/* Studio lighting tuned for cannabis bud — green + natural white */}
        <ambientLight intensity={0.30} color="#d8f0d0" />
        <directionalLight position={[4, 9, 3]} intensity={2.2} color="#f5fff0" />
        <directionalLight position={[-3, 3, -2]} intensity={0.55} color="#c8e8ff" />
        <directionalLight position={[0, -3, 4]} intensity={0.22} color="#e0ffd8" />

        {/* Brand green accent rim — enhances trichome sparkle */}
        <spotLight
          position={[-2, 3, -3]}
          intensity={0.65}
          angle={0.55}
          penumbra={1}
          color="#1ce6b3"
        />
        {/* Warm top light — makes pistils pop orange */}
        <spotLight
          position={[2, 7, 1]}
          intensity={0.9}
          angle={0.38}
          penumbra={0.9}
          color="#fff8e0"
        />
        {/* Subtle side fill — depth on bud clusters */}
        <spotLight
          position={[-4, 1, 3]}
          intensity={0.28}
          angle={0.55}
          penumbra={1}
          color="#a8d8a0"
        />

        {/* Main 3D cannabis seed */}
        <SeedModel />

        {/* Orbiting accent particles */}
        <SeedParticles />

        {/* Warm floating dust */}
        <WarmDust />

        <ContactShadows
          position={[0, -0.92, 0]}
          opacity={0.35}
          scale={4}
          blur={2.5}
        />
      </Canvas>
    </div>
  );
}
