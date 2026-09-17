import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ─── 1. True 3D Cyber Security Shield (Exact Match to Reference Image) ─── */
function MedievalCyberShield() {
  const shieldRef = useRef<THREE.Group>(null!);
  const innerPaneRef = useRef<THREE.Mesh>(null!);
  const glowBeamRef = useRef<THREE.PointLight>(null!);

  // Precise Outer Shield Silhouette (Pointed Tip, Curved Upper Shoulders, Top Apex)
  const outerShieldShape = useMemo(() => {
    const s = new THREE.Shape();
    // Top center apex
    s.moveTo(0, 1.35);
    // Upper slope to right shoulder
    s.lineTo(0.55, 1.25);
    s.bezierCurveTo(0.85, 1.15, 0.98, 0.95, 0.98, 0.7);
    // Right side vertical body
    s.lineTo(0.98, 0.15);
    // Lower curve tapering to sharp bottom tip
    s.bezierCurveTo(0.98, -0.55, 0.52, -1.05, 0, -1.45);
    // Left lower curve
    s.bezierCurveTo(-0.52, -1.05, -0.98, -0.55, -0.98, 0.15);
    // Left side vertical body
    s.lineTo(-0.98, 0.7);
    s.bezierCurveTo(-0.98, 0.95, -0.85, 1.15, -0.55, 1.25);
    s.lineTo(0, 1.35);
    return s;
  }, []);

  // Inner Shield Recessed Pane Silhouette
  const innerShieldShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.18);
    s.lineTo(0.42, 1.1);
    s.bezierCurveTo(0.75, 1.02, 0.82, 0.82, 0.82, 0.6);
    s.lineTo(0.82, 0.12);
    s.bezierCurveTo(0.82, -0.45, 0.42, -0.88, 0, -1.22);
    s.bezierCurveTo(-0.42, -0.88, -0.82, -0.45, -0.82, 0.12);
    s.lineTo(-0.82, 0.6);
    s.bezierCurveTo(-0.82, 0.82, -0.75, 1.02, -0.42, 1.1);
    s.lineTo(0, 1.18);
    return s;
  }, []);

  const outerExtrudeSettings = useMemo(() => ({
    depth: 0.16,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  }), []);

  const innerExtrudeSettings = useMemo(() => ({
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 3/4 cinematic angle with gentle hover
    if (shieldRef.current) {
      shieldRef.current.rotation.y = 0.28 + Math.sin(t * 0.5) * 0.08;
      shieldRef.current.position.y = 0.52 + Math.sin(t * 1.3) * 0.05;
    }
    if (innerPaneRef.current) {
      const pulse = 1.6 + Math.sin(t * 2.0) * 0.4;
      (innerPaneRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
    if (glowBeamRef.current) {
      glowBeamRef.current.intensity = 4.5 + Math.sin(t * 2.5) * 1.2;
    }
  });

  return (
    <group ref={shieldRef} position={[0, 0.52, 0]}>
      {/* 1. Outer Beveled Translucent Dark Blue Glass Rim */}
      <mesh castShadow receiveShadow position={[0, 0, -0.08]}>
        <extrudeGeometry args={[outerShieldShape, outerExtrudeSettings]} />
        <meshStandardMaterial
          color="#0369a1"
          emissive="#0284c7"
          emissiveIntensity={0.8}
          metalness={0.85}
          roughness={0.12}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* 2. Thin Glowing Cyan Outline around the Shield Rim */}
      <lineSegments position={[0, 0, 0.1]}>
        <edgesGeometry args={[new THREE.ExtrudeGeometry(outerShieldShape, outerExtrudeSettings)]} />
        <lineBasicMaterial color="#00f0ff" linewidth={1.5} transparent opacity={0.85} />
      </lineSegments>

      {/* 3. Inner Recessed Holographic Glass Pane */}
      <mesh ref={innerPaneRef} position={[0, 0, 0.04]}>
        <extrudeGeometry args={[innerShieldShape, innerExtrudeSettings]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#00b4d8"
          emissiveIntensity={1.6}
          metalness={0.25}
          roughness={0.06}
          transparent
          opacity={0.72}
        />
      </mesh>

      {/* 4. Subtle Inner Spine Crease & Lateral Ribs (Matching Reference) */}
      <mesh position={[0, 0.02, 0.12]}>
        <boxGeometry args={[0.025, 1.8, 0.025]} />
        <meshStandardMaterial color="#ffffff" emissive="#00e5ff" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[0, 0.3, 0.12]}>
        <boxGeometry args={[0.9, 0.025, 0.025]} />
        <meshStandardMaterial color="#ffffff" emissive="#00e5ff" emissiveIntensity={2.5} />
      </mesh>

      {/* Internal Volumetric Blue Glow */}
      <pointLight ref={glowBeamRef} color="#00e5ff" intensity={4.5} distance={3.8} position={[0, 0.2, 0.4]} />
      <pointLight color="#1d4ed8" intensity={3.0} distance={5.0} position={[0, -0.4, -0.3]} />
    </group>
  );
}

/* ─── 2. Cylindrical Sci-Fi SOC Pedestal (Exact Match to Reference Image) ─── */
function SciFiPedestal() {
  const midRingRef = useRef<THREE.Mesh>(null!);
  const topRingRef = useRef<THREE.Mesh>(null!);

  // Glowing Telemetry Decal on Base Rim
  const runesTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, 512, 64);
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('cg 4139 • SEC-SHIELD • CORE-LOCK • 100% SECURE', 16, 42);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    return tex;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (midRingRef.current) midRingRef.current.rotation.z = t * 0.25;
    if (topRingRef.current) topRingRef.current.rotation.z = -t * 0.4;
  });

  return (
    <group position={[0, -1.35, 0]}>
      {/* Tier 1: Wide Low Base Plinth with Telemetry */}
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[2.0, 2.15, 0.22, 64]} />
        <meshStandardMaterial
          color="#040814"
          emissive="#021426"
          emissiveIntensity={0.35}
          metalness={0.94}
          roughness={0.16}
          map={runesTexture}
        />
      </mesh>

      {/* Tier 2: Stepped Metallic Cylinder Drum with Horizontal Groove */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.65, 1.8, 0.24, 64]} />
        <meshStandardMaterial
          color="#061224"
          emissive="#023059"
          emissiveIntensity={0.28}
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>

      {/* Tier 3: Top Platform Collar */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.35, 1.45, 0.14, 64]} />
        <meshStandardMaterial
          color="#081830"
          emissive="#00e5ff"
          emissiveIntensity={0.32}
          metalness={0.86}
          roughness={0.22}
        />
      </mesh>

      {/* Glowing Cyan Edge Ring on Base Tier */}
      <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.02, 0.024, 16, 96]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.2} />
      </mesh>

      {/* Glowing Cyan Groove Ring on Middle Tier */}
      <mesh ref={midRingRef} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.68, 0.022, 16, 96]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.8} />
      </mesh>

      {/* Concentric Glowing Cyan Rings on Top Platform */}
      <mesh ref={topRingRef} position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.22, 0.02, 16, 64]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={4.0} />
      </mesh>

      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.016, 16, 48]} />
        <meshStandardMaterial color="#60a5fa" emissive="#00e5ff" emissiveIntensity={3.2} />
      </mesh>

      {/* Central Illuminated Cyan Projector Lens Emitter */}
      <mesh position={[0, 0.155, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.025, 32]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={5.0}
        />
      </mesh>

      {/* Upward Projecting Light Beam into Shield Tip */}
      <pointLight position={[0, 0.45, 0]} color="#00e5ff" intensity={6.5} distance={3.8} />
    </group>
  );
}

/* ─── 3. Subtle Ambient Sparks (Small, Floating Cyber Aura) ─── */
function SubtleAmbientSparks() {
  const sparksRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (sparksRef.current) {
      sparksRef.current.rotation.y = -state.clock.elapsedTime * 0.08;
    }
  });

  const sparks = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 1.7 + (i % 3) * 0.3;
      const y = ((i % 5) - 2) * 0.45;
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number];
    });
  }, []);

  return (
    <group ref={sparksRef}>
      {sparks.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── 4. Main Exported 3D Scene (Correct 3/4 Cinematic Composition) ─── */
export const ShieldScene: React.FC = () => {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <Canvas
        camera={{ position: [0.65, 0.85, 4.8], fov: 38, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight color="#02091a" intensity={0.7} />
        <directionalLight position={[5, 8, 5]} color="#0284c7" intensity={1.1} />
        <directionalLight position={[-4, -1, -3]} color="#38bdf8" intensity={0.4} />

        <MedievalCyberShield />
        <SciFiPedestal />
        <SubtleAmbientSparks />

        <fog attach="fog" color="#01030a" near={6} far={15} />
      </Canvas>
    </div>
  );
};
