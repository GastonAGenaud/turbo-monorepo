"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";

import { SeedModel } from "./seed-model";

export default function HeroSeedScene() {
  return (
    <div className="pointer-events-none h-full min-h-[540px] w-full">
      <Canvas
        camera={{ position: [0, 0.25, 3.6], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        {/* Studio lighting for hyperrealism */}
        <ambientLight intensity={0.18} />
        <directionalLight position={[5, 8, 3]} intensity={1.3} castShadow />
        <directionalLight position={[-3, 4, -2]} intensity={0.45} color="#a8c8ff" />
        <spotLight
          position={[0, 6, 1]}
          intensity={0.55}
          angle={0.38}
          penumbra={0.85}
          castShadow
        />
        <spotLight
          position={[-4, 2, 4]}
          intensity={0.22}
          angle={0.5}
          penumbra={1}
          color="#ffe8c0"
        />

        {/* HDRI environment for physically correct reflections */}
        <Environment preset="studio" environmentIntensity={0.52} />

        <SeedModel />

        <ContactShadows
          position={[0, -0.92, 0]}
          opacity={0.38}
          scale={4}
          blur={2.8}
          color="#000000"
        />
      </Canvas>
    </div>
  );
}
