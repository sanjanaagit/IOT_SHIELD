import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Grid } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Isometric Device Node on Pedestal ─── */
function NodePedestalUnit({ 
  position, 
  color, 
  emissive, 
  isThreat, 
  speed = 1.0, 
  label 
}: { 
  position: [number, number, number]; 
  color: string; 
  emissive: string; 
  isThreat: boolean; 
  speed?: number; 
  label: string; 
}) {
  const boxRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (boxRef.current) {
      boxRef.current.rotation.y = t * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.6;
    }
  });

  return (
    <group position={position}>
      {/* Floating Device Block */}
      <Float speed={1.8} rotationIntensity={0.08} floatIntensity={0.3}>
        <mesh ref={boxRef} position={[0, 0.45, 0]}>
          <boxGeometry args={[0.65, 0.65, 0.65]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={isThreat ? 2.5 : 1.4}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Scan / Pulse Ring */}
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.55, 0.02, 16, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
        </mesh>

        {/* Local Point Light */}
        <pointLight color={color} intensity={isThreat ? 3.5 : 2.0} distance={3.5} />
      </Float>

      {/* Futuristic Pedestal Base */}
      <group position={[0, -0.4, 0]}>
        {/* Pedestal Tier 1 */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.9, 1.05, 0.12, 32]} />
          <meshStandardMaterial color="#050b14" emissive="#021426" emissiveIntensity={0.2} metalness={0.9} roughness={0.25} />
        </mesh>

        {/* Pedestal Tier 2 */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.75, 0.85, 0.12, 32]} />
          <meshStandardMaterial color="#081426" emissive={emissive} emissiveIntensity={0.3} metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Outer Glowing Ring */}
        <mesh ref={ringRef} position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.92, 0.018, 16, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.8} />
        </mesh>

        {/* Inner Glowing Ring */}
        <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.65, 0.015, 16, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Multi-Pedestal Array Scene ─── */
export const ThreatPedestal3D: React.FC<{ threatActive?: boolean }> = ({ threatActive = true }) => {
  return (
    <div className="w-full h-full relative" style={{ minHeight: 220 }}>
      <Canvas
        camera={{ position: [0, 3.2, 5.8], fov: 42, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <ambientLight color="#02091a" intensity={0.6} />
        <directionalLight position={[4, 8, 5]} color="#0284c7" intensity={0.7} />
        <directionalLight position={[-4, -2, -3]} color="#38bdf8" intensity={0.4} />

        {/* 4 Pedestal Nodes array matching reference image */}
        {/* Node 1: Left Cyan Node */}
        <NodePedestalUnit
          position={[-2.4, 0, -0.6]}
          color="#06b6d4"
          emissive="#0891b2"
          isThreat={false}
          speed={0.9}
          label="Sensor Node"
        />

        {/* Node 2: Center-Left Active Threat Pedestal (Red / Critical) */}
        <NodePedestalUnit
          position={[-0.8, 0, 0.8]}
          color={threatActive ? "#ef4444" : "#06b6d4"}
          emissive={threatActive ? "#dc2626" : "#0891b2"}
          isThreat={threatActive}
          speed={1.4}
          label="Isolated Target"
        />

        {/* Node 3: Center-Right Cyan Gateway Node */}
        <NodePedestalUnit
          position={[0.9, 0, 0.2]}
          color="#38bdf8"
          emissive="#0284c7"
          isThreat={false}
          speed={1.1}
          label="IoT Gateway"
        />

        {/* Node 4: Right Cyan Edge Node */}
        <NodePedestalUnit
          position={[2.5, 0, -0.7]}
          color="#06b6d4"
          emissive="#0891b2"
          isThreat={false}
          speed={0.8}
          label="Relay Hub"
        />

        {/* Floor Grid */}
        <Grid
          args={[14, 14]}
          cellSize={0.8}
          cellThickness={0.3}
          cellColor="#0e4a6e"
          sectionSize={3.2}
          sectionThickness={0.6}
          sectionColor="#0284c7"
          fadeDistance={9}
          fadeStrength={2}
          position={[0, -0.6, 0]}
        />

        <fog attach="fog" color="#01030a" near={7} far={16} />
      </Canvas>
    </div>
  );
};
