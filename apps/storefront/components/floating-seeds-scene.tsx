"use client";

import { Canvas } from "@react-three/fiber";
import { MiniSeed } from "./seed-model";

/**
 * A lightweight 3D scene showing several mini cannabis seeds
 * floating gently — used as a decorative background for featured sections.
 */
export default function FloatingSeedsScene() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-40">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#a8c8ff" />

        {/* Scattered mini seeds */}
        <MiniSeed position={[-2.2, 0.8, -1]} scale={0.18} speed={0.7} rotationOffset={0} />
        <MiniSeed position={[2.0, -0.5, -0.5]} scale={0.22} speed={0.9} rotationOffset={2.1} />
        <MiniSeed position={[-0.8, -1.0, 0]} scale={0.15} speed={1.1} rotationOffset={4.2} />
        <MiniSeed position={[1.5, 1.2, -1.2]} scale={0.2} speed={0.6} rotationOffset={1.0} />
        <MiniSeed position={[-1.8, -0.3, 0.5]} scale={0.12} speed={1.3} rotationOffset={3.5} />
        <MiniSeed position={[0.5, 0.6, -0.8]} scale={0.16} speed={0.8} rotationOffset={5.0} />
      </Canvas>
    </div>
  );
}
