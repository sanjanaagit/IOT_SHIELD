import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { Float, Grid, Html, Line, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { X, Activity } from 'lucide-react';

/* ─── DATA ─── */
interface DeviceNode {
  id: string;
  label: string;
  type: string;
  ip: string;
  mac: string;
  status: string;
  color: 'red' | 'green' | 'cyan';
  pos: [number, number, number];
  size: number;
  manufacturer: string;
  model: string;
  gateway: string;
  signal: string;
  rate: string;
  uptime: string;
}

const DEVICES: DeviceNode[] = [
  { id:'router',  label:'Router',      type:'Core Router',   ip:'192.168.1.1',  mac:'00:1A:2B:3C:4D:6A', status:'ONLINE',  color:'cyan',  pos:[0,0,0],           size:0.70, manufacturer:'NetGear',     model:'AX6000',     gateway:'WAN',          signal:'-30 dBm', rate:'1000 Mbps', uptime:'90d 2h'  },
  { id:'cam1',   label:'IP Camera',   type:'IP Camera',     ip:'192.168.1.10', mac:'00:1A:2B:3C:4D:5E', status:'THREAT',  color:'red',   pos:[-3.2,0.3,-2.0],   size:0.50, manufacturer:'SecureCam',   model:'IPX700',     gateway:'192.168.1.1',  signal:'-42 dBm', rate:'2.4 Mbps',  uptime:'15d 7h'  },
  { id:'therm',  label:'Thermostat',  type:'Thermostat',    ip:'192.168.1.13', mac:'00:1A:2B:3C:4D:5F', status:'ONLINE',  color:'cyan',  pos:[-3.8,0.0,1.6],    size:0.44, manufacturer:'ThermoSmart', model:'TS-3000',    gateway:'192.168.1.1',  signal:'-55 dBm', rate:'1.2 Mbps',  uptime:'30d 12h' },
  { id:'laptop', label:'Laptop',      type:'Laptop',        ip:'192.168.1.15', mac:'00:1A:2B:3C:4D:6B', status:'ONLINE',  color:'cyan',  pos:[-1.8,0.3,3.2],    size:0.50, manufacturer:'Dell',        model:'XPS 15',     gateway:'192.168.1.1',  signal:'-40 dBm', rate:'300 Mbps',  uptime:'1d 5h'   },
  { id:'gw',     label:'IoT Gateway', type:'IoT Gateway',   ip:'192.168.1.5',  mac:'00:1A:2B:3C:4D:6C', status:'HEALTHY', color:'green', pos:[3.2,0.2,-1.5],    size:0.54, manufacturer:'IoT Edge',    model:'GW-500',     gateway:'192.168.1.1',  signal:'-35 dBm', rate:'100 Mbps',  uptime:'45d 1h'  },
  { id:'bulb',   label:'Smart Bulb',  type:'Smart Bulb',    ip:'192.168.1.50', mac:'00:1A:2B:3C:4D:6D', status:'ONLINE',  color:'cyan',  pos:[2.5,0.3,2.2],     size:0.38, manufacturer:'Philips',     model:'Hue Color',  gateway:'192.168.1.5',  signal:'-60 dBm', rate:'0.5 Mbps',  uptime:'2d 12h'  },
  { id:'spk',    label:'Speaker',     type:'Smart Speaker', ip:'192.168.1.30', mac:'00:1A:2B:3C:4D:6E', status:'ONLINE',  color:'cyan',  pos:[3.6,0.1,0.6],     size:0.43, manufacturer:'Sonos',       model:'Era One',    gateway:'192.168.1.1',  signal:'-45 dBm', rate:'5 Mbps',    uptime:'10d 0h'  },
  { id:'snsr',   label:'Sensor',      type:'IoT Sensor',    ip:'192.168.1.14', mac:'00:1A:2B:3C:4D:6F', status:'HEALTHY', color:'green', pos:[1.5,0.2,3.8],     size:0.38, manufacturer:'Aqara',       model:'Temp-1',     gateway:'192.168.1.5',  signal:'-70 dBm', rate:'0.1 Mbps',  uptime:'120d 14h'},
];

const EDGES = [
  ['router','cam1'],['router','therm'],['router','laptop'],
  ['router','gw'],['router','spk'],
  ['gw','bulb'],['gw','snsr'],
];

/* ─── COLORS ─── */
const C = {
  red:   { hex:'#ef4444', emHex:'#7f1d1d', light:'#f87171' },
  green: { hex:'#10b981', emHex:'#064e3b', light:'#34d399' },
  cyan:  { hex:'#06b6d4', emHex:'#0e7490', light:'#67e8f9' },
};

/* ─── DEVICE BOX ─── */
function DeviceBox({ node, onClick, isSelected }: { node: DeviceNode; onClick: (n: DeviceNode) => void; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const col = C[node.color];
  const baseColor = useMemo(() => new THREE.Color(col.hex), [col.hex]);
  const emColor  = useMemo(() => new THREE.Color(col.emHex), [col.emHex]);

  const isMain = node.id === 'router';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * (isMain ? 0.4 : 0.2);
    }
  });

  return (
    <group position={node.pos}>
      <Float speed={isMain ? 1.5 : 2} rotationIntensity={0.08} floatIntensity={0.4}>
        <mesh
          ref={meshRef}
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(node); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        >
          <boxGeometry args={[node.size, node.size, node.size]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={emColor}
            emissiveIntensity={isSelected ? 2.5 : (isMain ? 2.0 : 1.2)}
            metalness={0.6}
            roughness={0.2}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Selection ring */}
        {isSelected && (
          <mesh>
            <torusGeometry args={[node.size * 0.85, 0.03, 16, 64]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={3} />
          </mesh>
        )}

        {/* Threat pulse ring */}
        {node.color === 'red' && (
          <ThreatPulse size={node.size} />
        )}

        {/* Per-device point light */}
        <pointLight color={col.light} intensity={isMain ? 3.0 : 1.5} distance={isMain ? 6 : 3} />

        {/* HTML Label */}
        <Html
          center
          position={[0, node.size * 0.8 + 0.2, 0]}
          distanceFactor={8}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              {node.label}
            </div>
            <div style={{ fontSize: 9, color: col.light, fontFamily: 'monospace', opacity: 0.8 }}>
              {node.ip}
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

/* ─── THREAT PULSE RING (animated) ─── */
function ThreatPulse({ size }: { size: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
    if (meshRef.current) {
      const s = size * (1.2 + t * 0.6);
      meshRef.current.scale.set(s, s, s);
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.6 - t * 0.5;
    }
  });
  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[1, 0.04, 16, 64]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} transparent opacity={0.6} />
    </mesh>
  );
}

/* ─── EDGE PARTICLES (animated along connection line) ─── */
function EdgeParticles({ from, to, color }: { from: [number,number,number]; to: [number,number,number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.5) % 1;
    meshRef.current.position.lerpVectors(
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
      t
    );
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
    </mesh>
  );
}

/* ─── SCENE (inner) ─── */
function TopoScene({ selected, onSelect }: { selected: DeviceNode | null; onSelect: (n: DeviceNode | null) => void }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight color="#010a1e" intensity={0.8} />
      <directionalLight position={[5, 10, 5]} color="#0f3460" intensity={0.5} />
      <pointLight position={[0, 8, 0]} color="#06b6d4" intensity={2.5} distance={20} />
      <pointLight position={[-5, 3, -5]} color="#3b82f6" intensity={1.5} distance={15} />
      <pointLight position={[5, 3, 5]}  color="#7c3aed" intensity={1.0} distance={12} />

      {/* Grid floor */}
      <Grid
        args={[22, 22]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#0e4a6e"
        sectionSize={4}
        sectionThickness={0.8}
        sectionColor="#0891b2"
        fadeDistance={14}
        fadeStrength={2}
        followCamera={false}
        position={[0, -0.6, 0]}
      />

      {/* Edges */}
      {EDGES.map(([s, t], i) => {
        const src = DEVICES.find(d => d.id === s)!;
        const tgt = DEVICES.find(d => d.id === t)!;
        const edgeColor = tgt.color === 'red' ? '#ef4444' : tgt.color === 'green' ? '#10b981' : '#06b6d4';
        return (
          <group key={i}>
            <Line
              points={[src.pos, tgt.pos]}
              color={edgeColor}
              lineWidth={1.2}
              transparent
              opacity={0.35}
            />
            <EdgeParticles
              from={[...src.pos] as [number,number,number]}
              to={[...tgt.pos] as [number,number,number]}
              color={edgeColor}
            />
          </group>
        );
      })}

      {/* Device nodes */}
      {DEVICES.map(node => (
        <DeviceBox
          key={node.id}
          node={node}
          onClick={onSelect}
          isSelected={selected?.id === node.id}
        />
      ))}

      {/* Background atmosphere fog */}
      <fog attach="fog" color="#01030a" near={12} far={22} />
    </>
  );
}

/* ─── DEVICE DETAIL PANEL (HTML overlay) ─── */
function DevicePanel({ node, onClose }: { node: DeviceNode; onClose: () => void }) {
  const col = C[node.color];
  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-40 flex flex-col animate-fadeUp"
      style={{
        width: 330,
        background: 'rgba(2,6,18,0.97)',
        backdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(6,182,212,0.12)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid rgba(6,182,212,0.1)' }}>
        <div>
          <h3 className="text-[13px] font-bold text-white flex items-center gap-2">
            {node.label}
            <span className="w-2 h-2 rounded-full" style={{ background: col.hex, boxShadow: `0 0 6px ${col.hex}` }} />
          </h3>
          <p className="text-[10px] text-slate-500 font-mono">{node.ip} · {node.status}</p>
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[['Type', node.type],['IP', node.ip],['MAC', node.mac],['Manufacturer', node.manufacturer],['Model', node.model],['Gateway', node.gateway]].map(([k,v]) => (
            <div key={k}>
              <p className="text-[8px] text-slate-700 uppercase tracking-widest font-mono">{k}</p>
              <p className="text-[11px] text-slate-200 font-mono mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { k:'Signal', v:node.signal, c:'text-cyan-400' },
            { k:'Data Rate', v:node.rate, c:'text-white' },
            { k:'Uptime', v:node.uptime, c:'text-slate-200' },
            { k:'Status', v:node.status, c: node.color === 'red' ? 'text-red-400' : 'text-emerald-400' },
          ].map(({ k, v, c }) => (
            <div key={k} className="p-3 rounded-lg" style={{ background:'rgba(6,182,212,0.04)', border:'1px solid rgba(6,182,212,0.08)' }}>
              <p className="text-[8px] text-slate-700 uppercase tracking-widest">{k}</p>
              <p className={`text-[13px] font-bold mt-0.5 ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono mb-3 flex items-center gap-1.5">
            <Activity size={10} className="text-cyan-600" /> Recent Events
          </p>
          <div className="space-y-2">
            {[
              { msg:'Telemetry synced', time:'2m ago', c:'bg-cyan-500' },
              { msg:'Security scan passed', time:'1h ago', c:'bg-emerald-500' },
              ...(node.color === 'red' ? [{ msg:'Anomalous traffic detected', time:'2h ago', c:'bg-red-500' }] : []),
              { msg:'Firmware OK', time:'4h ago', c:'bg-slate-600' },
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${ev.c}`} />
                <div>
                  <p className="text-[11px] text-slate-300">{ev.msg}</p>
                  <p className="text-[9px] text-slate-600">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex gap-2.5" style={{ borderTop:'1px solid rgba(6,182,212,0.08)' }}>
        <button className="flex-1 py-2 text-[11px] font-bold text-white rounded-lg" style={{ background:'linear-gradient(90deg,#0e7490,#1e40af)', boxShadow:'0 4px 14px rgba(6,182,212,0.2)' }}>
          View Logs
        </button>
        <button className="flex-1 py-2 text-[11px] font-bold text-slate-300 rounded-lg border border-slate-800 hover:bg-slate-800/40 transition-colors">
          Isolate Node
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN EXPORT ─── */
interface NetworkTopologyProps {
  analytics: { malicious_count?: number } | null;
}

export const NetworkTopology3D: React.FC<NetworkTopologyProps> = ({ analytics }) => {
  const [selected, setSelected] = useState<DeviceNode | null>(null);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: 'calc(100vh - 7rem)',
        background: '#01030a',
        border: '1px solid rgba(6,182,212,0.1)',
      }}
    >
      {/* Stats header */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 z-20"
        style={{ background:'rgba(1,4,14,0.8)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(6,182,212,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-white tracking-wider">NETWORK TOPOLOGY</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-mono text-cyan-400" style={{ background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.15)' }}>
            {DEVICES.length} NODES
          </span>
        </div>
        <div className="flex items-center gap-5">
          {[
            { label:'NODES',    val:DEVICES.length,                      color:'text-white' },
            { label:'EDGES',    val:EDGES.length,                        color:'text-cyan-400' },
            { label:'THREATS',  val:analytics?.malicious_count ?? 1,     color:'text-red-400' },
            { label:'TRANSFER', val:'24.5 MB/s',                         color:'text-white' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">{s.label}</p>
              <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg" style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
            <span className="text-xl font-bold text-emerald-400" style={{ lineHeight:1 }}>98</span>
            <span className="text-[8px] text-emerald-500 font-mono tracking-widest">EXCELLENT</span>
          </div>
        </div>
      </div>

      {/* Three.js canvas */}
      <Canvas
        camera={{ position: [0, 7, 12], fov: 52, near: 0.1, far: 50 }}
        style={{ position:'absolute', inset:0, background:'transparent' }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <TopoScene selected={selected} onSelect={(n) => setSelected(n?.id === selected?.id ? null : n)} />
      </Canvas>

      {/* Device detail panel */}
      {selected && <DevicePanel node={selected} onClose={() => setSelected(null)} />}

      {/* Bottom metrics */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center gap-10 py-3"
        style={{ background:'rgba(1,3,12,0.85)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(6,182,212,0.07)' }}
      >
        {[
          { label:'THREATS BLOCKED', val:'128',      sub:'+12% / 24h', c:'text-white'   },
          { label:'DATA ANALYZED',   val:'2.45 TB',  sub:'+18% / 24h', c:'text-cyan-400'},
          { label:'DEVICES SECURED', val:'32 / 40',  sub:'+8% / month',c:'text-white'   },
          { label:'UPTIME',          val:'99.9%',    sub:'↑ This Month',c:'text-emerald-400'},
        ].map(m => (
          <div key={m.label} className="text-center">
            <p className="text-[8px] text-slate-700 uppercase tracking-widest font-mono">{m.label}</p>
            <p className={`text-[16px] font-bold mt-0.5 ${m.c}`}>{m.val}</p>
            <p className="text-[9px] text-emerald-600 font-mono">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
