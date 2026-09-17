import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function ChipCore() {
  const chipRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (chipRef.current) {
      chipRef.current.rotation.y = t * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.6;
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      <Float speed={2} rotationIntensity={0.08} floatIntensity={0.25}>
        {/* Central Microchip / Data Processor */}
        <mesh ref={chipRef}>
          <boxGeometry args={[0.9, 0.25, 0.9]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#00e5ff"
            emissiveIntensity={1.2}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Chip Inner Core */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Outer Orbit Scan Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.75, 0.018, 16, 32]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3} />
        </mesh>

        {/* Core point light */}
        <pointLight color="#00e5ff" intensity={3} distance={3} />
      </Float>

      {/* Cyber Base */}
      <group position={[0, -0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[1.0, 1.15, 0.1, 32]} />
          <meshStandardMaterial color="#050b14" emissive="#021426" emissiveIntensity={0.3} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.02, 0.015, 16, 32]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
        </mesh>
      </group>
    </group>
  );
}

export const Microchip3D: React.FC = () => {
  return (
    <div className="w-full h-full relative" style={{ minHeight: 120 }}>
      <Canvas
        camera={{ position: [0, 1.2, 2.8], fov: 40, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <ambientLight color="#02091a" intensity={0.8} />
        <directionalLight position={[3, 5, 3]} color="#0284c7" intensity={0.8} />
        <ChipCore />
        <fog attach="fog" color="#01030a" near={4} far={10} />
      </Canvas>
    </div>
  );
};
