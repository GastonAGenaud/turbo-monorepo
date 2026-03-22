"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 120;

/**
 * Orbiting particles that float around the hero seed —
 * tiny glowing specks that give the scene depth and magic.
 */
export function SeedParticles() {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, speeds, offsets } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const spd = new Float32Array(PARTICLE_COUNT);
    const off = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute in a shell around origin
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.0 + Math.random() * 1.8;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6; // flatten Y
      pos[i * 3 + 2] = r * Math.cos(phi);

      spd[i] = 0.15 + Math.random() * 0.35;
      off[i] = Math.random() * Math.PI * 2;
    }

    return { positions: pos, speeds: spd, offsets: off };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const baseX = positions[i * 3]!;
      const baseY = positions[i * 3 + 1]!;
      const baseZ = positions[i * 3 + 2]!;
      const s = speeds[i]!;
      const o = offsets[i]!;

      // Orbital drift
      const angle = t * s + o;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      posAttr.setXYZ(
        i,
        baseX * cos - baseZ * sin,
        baseY + Math.sin(t * s * 0.7 + o) * 0.15,
        baseX * sin + baseZ * cos,
      );
    }
    posAttr.needsUpdate = true;

    // Gentle overall rotation
    pointsRef.current.rotation.y = t * 0.04;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.025}
        color="#1ce6b3"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Larger, fewer "dust" particles with warm glow — adds organic feel.
 */
export function WarmDust() {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 40;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.rotation.y = t * 0.02;
    pointsRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#ffe8c0"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
