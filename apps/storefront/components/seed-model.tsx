"use client";

import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  GLB model loader — photoscanned bud from Sketchfab (CC-BY roiwizard) */
/* ------------------------------------------------------------------ */
function BudGLB() {
  const { scene } = useGLTF("/models/weed-bud.glb");
  const groupRef = useRef<THREE.Group>(null!);

  // Ensure all meshes cast/receive shadows and use correct side
  useMemo(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            m.side = THREE.FrontSide;
          });
        } else if (mesh.material) {
          (mesh.material as THREE.Material).side = THREE.FrontSide;
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.14;
    groupRef.current.rotation.x = Math.sin(t * 0.22) * 0.06;
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.06;
  });

  return (
    <group ref={groupRef} scale={1.0}>
      <primitive object={scene} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Procedural fallback — used when GLB is not yet placed              */
/* ------------------------------------------------------------------ */
function createBudGeometry() {
  const geo = new THREE.SphereGeometry(1, 128, 128);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const len = Math.sqrt(x * x + y * y + z * z);
    const nx = x / len, ny = y / len, nz = z / len;

    const bump =
      Math.sin(nx * 3.8 * Math.PI + 0.7) * Math.cos(ny * 3.8 * Math.PI + 1.2) * Math.sin(nz * 3.8 * Math.PI) * 0.22 +
      Math.sin(nx * 7.5 * Math.PI + 2.1) * Math.cos(nz * 7.5 * Math.PI + 0.5) * 0.10 +
      Math.cos(ny * 15 * Math.PI + 3.3) * Math.sin(nx * 15 * Math.PI + 1.8) * 0.04;

    const r = 1 + bump;
    pos.setXYZ(i, nx * r, ny * 1.18 * r, nz * r);
  }

  geo.computeVertexNormals();
  return geo;
}

function createDiffuseMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#192c09";
  ctx.fillRect(0, 0, 1024, 1024);

  for (let i = 0; i < 120; i++) {
    ctx.save();
    ctx.globalAlpha = 0.14 + Math.random() * 0.28;
    ctx.fillStyle = `hsl(${88 + Math.random() * 38},${38 + Math.random() * 28}%,${18 + Math.random() * 22}%)`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * 1024, Math.random() * 1024, 18 + Math.random() * 75, 12 + Math.random() * 55, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (let i = 0; i < 200; i++) {
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.random() * 0.45;
    ctx.strokeStyle = `hsl(${18 + Math.random() * 22},82%,${38 + Math.random() * 22}%)`;
    ctx.lineWidth = 0.8 + Math.random() * 2.8;
    ctx.lineCap = "round";
    const sx = Math.random() * 1024, sy = Math.random() * 1024;
    const ex = sx + (Math.random() - 0.5) * 90, ey = sy + (Math.random() - 0.5) * 90;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + (Math.random() - 0.5) * 55, sy + (Math.random() - 0.5) * 55, ex + (Math.random() - 0.5) * 45, ey + (Math.random() - 0.5) * 45, ex, ey);
    ctx.stroke();
    ctx.restore();
  }

  for (let i = 0; i < 22000; i++) {
    const v = 220 + Math.floor(Math.random() * 35);
    ctx.fillStyle = `rgba(${v},${v},${v - 10},${0.04 + Math.random() * 0.18})`;
    ctx.beginPath();
    ctx.arc(Math.random() * 1024, Math.random() * 1024, 0.4 + Math.random() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function TrichomeParticles() {
  const count = 600;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.05 + Math.random() * 0.22;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 1.18;
      pos[i * 3 + 2] = r * Math.cos(phi);
      const isPistil = Math.random() < 0.15;
      if (isPistil) { col[i*3]=0.9; col[i*3+1]=0.38; col[i*3+2]=0.05; }
      else { const v = 0.9 + Math.random() * 0.1; col[i*3]=v; col[i*3+1]=v; col[i*3+2]=v*0.96; }
    }
    return { positions: pos, colors: col };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.028} vertexColors transparent opacity={0.88} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function ProceduralBud() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(createBudGeometry, []);
  const diffuseMap = useMemo(createDiffuseMap, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.14;
    meshRef.current.rotation.x = Math.sin(t * 0.22) * 0.09;
    meshRef.current.position.y = Math.sin(t * 0.45) * 0.08;
    const breathe = 1 + Math.sin(t * 0.55) * 0.012;
    meshRef.current.scale.setScalar(0.78 * breathe);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(0.82 + Math.sin(t * 0.7) * 0.04);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.07 + Math.sin(t * 0.5) * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={glowRef} scale={0.82}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#1c7a2a" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      <mesh ref={meshRef} geometry={geometry} scale={0.78} rotation={[0.2, 0.4, 0.06]}>
        <meshPhysicalMaterial map={diffuseMap} roughness={0.72} metalness={0} clearcoat={0.18} clearcoatRoughness={0.55} color="#2a4a10" />
      </mesh>
      <group scale={0.78} rotation={[0.2, 0, 0.06]}>
        <TrichomeParticles />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Public export — tries GLB first, falls back to procedural          */
/* ------------------------------------------------------------------ */
export function SeedModel() {
  return (
    <Suspense fallback={<ProceduralBud />}>
      <BudGLB />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini decorative bud (always procedural — GLB too heavy for tiny)   */
/* ------------------------------------------------------------------ */
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
    meshRef.current.position.y = position[1] + Math.sin(t * 0.4 + rotationOffset) * 0.1;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} scale={scale} position={position} rotation={[0.2, rotationOffset, 0.1]}>
      <meshPhysicalMaterial map={diffuseMap} roughness={0.72} metalness={0} clearcoat={0.15} color="#2a4a10" />
    </mesh>
  );
}

// Preload for faster first render
useGLTF.preload("/models/weed-bud.glb");
