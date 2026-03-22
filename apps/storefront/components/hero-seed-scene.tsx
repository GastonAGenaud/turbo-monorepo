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
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        {/* Studio lighting — enhanced with accent tones */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 8, 3]} intensity={1.8} />
        <directionalLight position={[-3, 4, -2]} intensity={0.6} color="#a8c8ff" />
        <directionalLight position={[0, -4, 4]} intensity={0.3} color="#ffe8c0" />

        {/* Accent rim light — green tint from the brand color */}
        <spotLight
          position={[-3, 2, -2]}
          intensity={0.5}
          angle={0.6}
          penumbra={1}
          color="#0bc38f"
        />
        <spotLight
          position={[0, 6, 1]}
          intensity={0.7}
          angle={0.38}
          penumbra={0.85}
        />
        <spotLight
          position={[-4, 2, 4]}
          intensity={0.3}
          angle={0.5}
          penumbra={1}
          color="#ffe8c0"
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
