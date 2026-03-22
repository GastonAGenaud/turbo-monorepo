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
        {/* Studio lighting tuned for Californian Orange warm amber palette */}
        <ambientLight intensity={0.22} />
        <directionalLight position={[5, 8, 3]} intensity={1.9} color="#fff5e8" />
        <directionalLight position={[-3, 4, -2]} intensity={0.55} color="#b8d4ff" />
        <directionalLight position={[0, -4, 4]} intensity={0.28} color="#ffd4a0" />

        {/* Accent rim light — brand green tint */}
        <spotLight
          position={[-3, 2, -2]}
          intensity={0.5}
          angle={0.6}
          penumbra={1}
          color="#0bc38f"
        />
        <spotLight
          position={[2, 6, 2]}
          intensity={0.8}
          angle={0.36}
          penumbra={0.8}
          color="#ffcc88"
        />
        <spotLight
          position={[-4, 2, 4]}
          intensity={0.32}
          angle={0.5}
          penumbra={1}
          color="#ffe0b0"
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
