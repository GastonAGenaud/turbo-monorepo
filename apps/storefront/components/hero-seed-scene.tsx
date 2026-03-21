"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";

import { SeedModel } from "./seed-model";

export default function HeroSeedScene() {
  return (
    <div className="pointer-events-none w-full" style={{ height: "540px" }}>
      <Canvas
        camera={{ position: [0, 0.25, 3.6], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        {/* Studio lighting — no external network requests */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 8, 3]} intensity={1.8} />
        <directionalLight position={[-3, 4, -2]} intensity={0.6} color="#a8c8ff" />
        <directionalLight position={[0, -4, 4]} intensity={0.3} color="#ffe8c0" />
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

        <SeedModel />

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
