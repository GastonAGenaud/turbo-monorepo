"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ---------- Cannabis bud geometry — bumpy, nodular, organic ---------- */
function createBudGeometry() {
  const geo = new THREE.SphereGeometry(1, 128, 128);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const len = Math.sqrt(x * x + y * y + z * z);
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    // Multi-octave bumps — simulate cannabis calyx clusters
    const f1 = 3.8, f2 = 7.5, f3 = 15.0;
    const a1 = 0.22, a2 = 0.10, a3 = 0.04;

    const bump =
      Math.sin(nx * f1 * Math.PI + 0.7) *
        Math.cos(ny * f1 * Math.PI + 1.2) *
        Math.sin(nz * f1 * Math.PI) *
        a1 +
      Math.sin(nx * f2 * Math.PI + 2.1) *
        Math.cos(nz * f2 * Math.PI + 0.5) *
        a2 +
      Math.cos(ny * f3 * Math.PI + 3.3) *
        Math.sin(nx * f3 * Math.PI + 1.8) *
        a3;

    // Gentle vertical elongation (natural bud silhouette)
    const elongY = 1.18;
    const r = 1 + bump;
    pos.setXYZ(i, nx * r, ny * elongY * r, nz * r);
  }

  geo.computeVertexNormals();
  return geo;
}

/* ---------- Diffuse texture — deep forest green with orange pistils + trichomes ---------- */
function createDiffuseMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // Base: deep forest green
  ctx.fillStyle = "#192c09";
  ctx.fillRect(0, 0, 1024, 1024);

  // Lighter green calyx patches
  for (let i = 0; i < 120; i++) {
    ctx.save();
    ctx.globalAlpha = 0.14 + Math.random() * 0.28;
    const hue = 88 + Math.random() * 38;
    const sat = 38 + Math.random() * 28;
    const lum = 18 + Math.random() * 22;
    ctx.fillStyle = `hsl(${hue},${sat}%,${lum}%)`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * 1024,
      Math.random() * 1024,
      18 + Math.random() * 75,
      12 + Math.random() * 55,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  // Purple-blue genetic undertones (some strains have purple hues)
  for (let i = 0; i < 30; i++) {
    ctx.save();
    ctx.globalAlpha = 0.06 + Math.random() * 0.12;
    ctx.fillStyle = `hsl(${260 + Math.random() * 30},40%,${20 + Math.random() * 15}%)`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * 1024,
      Math.random() * 1024,
      30 + Math.random() * 100,
      20 + Math.random() * 70,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  // Orange/rust pistil hairs — curvy organic strands
  for (let i = 0; i < 200; i++) {
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.random() * 0.45;
    const hue = 18 + Math.random() * 22;
    const lum = 38 + Math.random() * 22;
    ctx.strokeStyle = `hsl(${hue},82%,${lum}%)`;
    ctx.lineWidth = 0.8 + Math.random() * 2.8;
    ctx.lineCap = "round";

    const sx = Math.random() * 1024;
    const sy = Math.random() * 1024;
    const ex = sx + (Math.random() - 0.5) * 90;
    const ey = sy + (Math.random() - 0.5) * 90;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx + (Math.random() - 0.5) * 55,
      sy + (Math.random() - 0.5) * 55,
      ex + (Math.random() - 0.5) * 45,
      ey + (Math.random() - 0.5) * 45,
      ex,
      ey,
    );
    ctx.stroke();
    ctx.restore();
  }

  // White trichome crystal coating — dense micro-dots
  for (let i = 0; i < 22000; i++) {
    const alpha = 0.04 + Math.random() * 0.18;
    // Slight warmth in trichomes (cream/white)
    const brightness = 220 + Math.floor(Math.random() * 35);
    ctx.fillStyle = `rgba(${brightness},${brightness},${brightness - 10},${alpha})`;
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const pr = 0.4 + Math.random() * 1.8;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Larger glinting trichome heads
  for (let i = 0; i < 400; i++) {
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.random() * 0.55;
    ctx.fillStyle = `rgba(255,252,245,${0.5 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 1024, Math.random() * 1024, 1.2 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/* ---------- Roughness map — trichome peaks are slightly glossy ---------- */
function createRoughnessMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // High roughness base (matte green bud surface)
  ctx.fillStyle = "#999999";
  ctx.fillRect(0, 0, 512, 512);

  // Slightly smoother patches (trichome heads catch light)
  for (let i = 0; i < 500; i++) {
    ctx.save();
    ctx.globalAlpha = Math.random() * 0.45;
    const v = 60 + Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  return new THREE.CanvasTexture(canvas);
}

/* ---------- Normal map — surface micro-bumps ---------- */
function createNormalMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 2000; i++) {
    const dr = Math.floor((Math.random() - 0.5) * 40);
    const dg = Math.floor((Math.random() - 0.5) * 40);
    ctx.fillStyle = `rgb(${128 + dr},${128 + dg},255)`;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, 0.8 + Math.random() * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

/* ---------- Trichome stalk particles — tiny stalks around the bud ---------- */
function TrichomeParticles() {
  const count = 600;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute on sphere surface + slight outward offset
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.05 + Math.random() * 0.22;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 1.18;
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Mostly white/cream, some orange (pistils)
      const isPistil = Math.random() < 0.15;
      if (isPistil) {
        // Orange pistil tip
        col[i * 3] = 0.85 + Math.random() * 0.15;
        col[i * 3 + 1] = 0.35 + Math.random() * 0.25;
        col[i * 3 + 2] = 0.05;
      } else {
        // White/cream trichome
        const v = 0.88 + Math.random() * 0.12;
        col[i * 3] = v;
        col[i * 3 + 1] = v;
        col[i * 3 + 2] = v * 0.96;
      }
    }

    return { positions: pos, colors: col };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ========== Main Hero Bud ========== */
export function SeedModel() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(createBudGeometry, []);
  const diffuseMap = useMemo(createDiffuseMap, []);
  const roughnessMap = useMemo(createRoughnessMap, []);
  const normalMap = useMemo(createNormalMap, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow Y rotation — showcase the bud from all angles
    meshRef.current.rotation.y = t * 0.14;
    meshRef.current.rotation.x = Math.sin(t * 0.22) * 0.09;

    // Subtle floating bob
    meshRef.current.position.y = Math.sin(t * 0.45) * 0.08;

    // Breathing scale
    const breathe = 1 + Math.sin(t * 0.55) * 0.012;
    meshRef.current.scale.setScalar(0.78 * breathe);

    // Pulsing green glow
    if (glowRef.current) {
      const gs = 0.82 + Math.sin(t * 0.7) * 0.04;
      glowRef.current.scale.setScalar(gs);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.07 + Math.sin(t * 0.5) * 0.03;
    }
  });

  return (
    <group>
      {/* Soft green ambient glow behind the bud */}
      <mesh ref={glowRef} scale={0.82}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial
          color="#1c7a2a"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main cannabis bud */}
      <mesh ref={meshRef} geometry={geometry} scale={0.78} rotation={[0.2, 0.4, 0.06]}>
        <meshPhysicalMaterial
          map={diffuseMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.55, 0.55)}
          roughnessMap={roughnessMap}
          roughness={0.72}
          metalness={0.0}
          clearcoat={0.18}
          clearcoatRoughness={0.55}
          envMapIntensity={0.5}
          color="#2a4a10"
        />
      </mesh>

      {/* Trichome + pistil particles around the bud */}
      <group scale={0.78} rotation={[0.2, 0, 0.06]}>
        <TrichomeParticles />
      </group>
    </group>
  );
}

/* ========== Mini floating bud for decorative sections ========== */
export function MiniSeed({
  position = [0, 0, 0] as [number, number, number],
  scale = 0.3,
  speed = 1,
  rotationOffset = 0,
}: {
  position?: [number, number, number];
  scale?: number;
  speed?: number;
  rotationOffset?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(createBudGeometry, []);
  const diffuseMap = useMemo(createDiffuseMap, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;

    meshRef.current.rotation.y = t * 0.2 + rotationOffset;
    meshRef.current.rotation.x = Math.sin(t * 0.3 + rotationOffset) * 0.12;
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.4 + rotationOffset) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={scale}
      position={position}
      rotation={[0.2, rotationOffset, 0.1]}
    >
      <meshPhysicalMaterial
        map={diffuseMap}
        roughness={0.72}
        metalness={0.0}
        clearcoat={0.15}
        clearcoatRoughness={0.55}
        envMapIntensity={0.4}
        color="#2a4a10"
      />
    </mesh>
  );
}
