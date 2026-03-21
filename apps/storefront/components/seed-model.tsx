"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function SeedModel() {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Elongate along Y axis
      y *= 1.45;

      // Taper: pointed bottom, rounded top
      const t = (y + 1.45) / 2.9; // 0=bottom, 1=top
      const taper = 0.55 + 0.45 * Math.sin(t * Math.PI);
      x *= taper;
      z *= taper;

      // Flatten slightly on one side for the natural seam ridge
      if (z > 0) z *= 0.88;

      // Subtle organic surface noise for imperfection
      const noise =
        Math.sin(x * 9 + y * 6) * 0.012 + Math.cos(z * 8 + y * 4) * 0.009;
      x += noise * taper;
      z += noise * taper;

      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Diffuse texture: dark brown base with tiger-stripe pattern
  const diffuseMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;

    // Base: dark espresso brown
    ctx.fillStyle = "#2e1d0e";
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle radial gradient for depth variation
    const radial = ctx.createRadialGradient(512, 512, 80, 512, 512, 520);
    radial.addColorStop(0, "rgba(80,50,22,0.35)");
    radial.addColorStop(1, "rgba(10,5,2,0.45)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1024, 1024);

    // Tiger stripes — wavy vertical bands
    for (let i = 0; i < 55; i++) {
      ctx.save();
      ctx.globalAlpha = 0.1 + Math.random() * 0.22;
      const hue = 22 + Math.random() * 16;
      const sat = 38 + Math.random() * 22;
      const lum = 28 + Math.random() * 22;
      ctx.strokeStyle = `hsl(${hue},${sat}%,${lum}%)`;
      ctx.lineWidth = 1.5 + Math.random() * 7;
      ctx.beginPath();
      const sx = Math.random() * 1024;
      ctx.moveTo(sx, 0);
      for (let yy = 0; yy <= 1024; yy += 16) {
        ctx.lineTo(sx + Math.sin(yy * 0.012 + i * 1.3) * 28, yy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Speckle noise for organic grain
    for (let i = 0; i < 7000; i++) {
      const r = 55 + Math.random() * 60;
      const g = 30 + Math.random() * 35;
      const b = 8 + Math.random() * 20;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.12 + Math.random() * 0.22})`;
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      const ps = 1 + Math.random() * 3.5;
      ctx.fillRect(px, py, ps, ps);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Roughness map: vary glossiness across surface
  const roughnessMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    // Base: mid roughness ~0.5
    ctx.fillStyle = "#818181";
    ctx.fillRect(0, 0, 512, 512);
    // Smoother patches along the stripes
    for (let i = 0; i < 280; i++) {
      const alpha = Math.random() * 0.35;
      ctx.fillStyle = `rgba(${120 + Math.floor(Math.random() * 40)},${120 + Math.floor(Math.random() * 40)},${120 + Math.floor(Math.random() * 40)},${alpha})`;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        Math.random() * 512,
        4 + Math.random() * 18,
        2 + Math.random() * 8,
        Math.random() * Math.PI,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Normal map: subtle micro-surface detail
  const normalMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    // Flat normal = rgb(128,128,255)
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      const dr = Math.floor((Math.random() - 0.5) * 24);
      const dg = Math.floor((Math.random() - 0.5) * 24);
      ctx.fillStyle = `rgb(${128 + dr},${128 + dg},255)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * 512,
        Math.random() * 512,
        1 + Math.random() * 4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.14;
    meshRef.current.rotation.x = Math.sin(t * 0.28) * 0.09;
    meshRef.current.position.y = Math.sin(t * 0.48) * 0.07;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} scale={0.72} rotation={[0.28, 0, 0.08]}>
      <meshPhysicalMaterial
        map={diffuseMap}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.35, 0.35)}
        roughnessMap={roughnessMap}
        roughness={0.52}
        metalness={0.04}
        clearcoat={0.32}
        clearcoatRoughness={0.38}
        envMapIntensity={0.65}
        color="#4a2e14"
      />
    </mesh>
  );
}
