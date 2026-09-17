import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Database,
  ShieldAlert,
  Activity,
  FileSpreadsheet,
  Settings as SettingsIcon,
  CircleDot,
  Microscope,
  Wifi,
  Shield,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { SystemStatus, Dataset, MLModel } from '../types';

/* ═══════════════════════════════════════════════════
    PAGE ORDER — all 7 sections in camera travel order
═══════════════════════════════════════════════════ */
export const PAGE_ORDER = [
  'dashboard',   // 01
  'detection',   // 02
  'dataset',     // 03
  'anomaly',     // 04
  'performance', // 05
  'reports',     // 06
  'settings',    // 07
];

/* ─── PAGE META ─── */
const PAGE_META: Record<string, { title: string; desc: string; idx: string }> = {
  dashboard:   { title: 'Network Topology',                 desc: 'Live 3D view of your IoT device network and real-time security status.',        idx: '01' },
  detection:   { title: 'Threat Detection Engine',          desc: 'Execute ML inference pipelines and classify live network traffic.',              idx: '02' },
  dataset:     { title: 'Dataset Analysis & Preprocessing', desc: 'Upload, inspect, validate and clean network traffic capture files.',             idx: '03' },
  anomaly:     { title: 'Anomaly Analysis',                 desc: 'Isolation Forest unsupervised anomaly detection and deviation scoring.',         idx: '04' },
  performance: { title: 'Model Performance & Analytics',    desc: 'Accuracy metrics, confusion matrix, ROC curves and feature importance.',         idx: '05' },
  reports:     { title: 'Security Reports',                 desc: 'Generate, download and review executive-level incident response reports.',       idx: '06' },
  settings:    { title: 'Platform Settings',                desc: 'System configuration, integrations, security controls and admin accounts.',      idx: '07' },
  explain:     { title: 'Threat Explainability',            desc: 'Per-record feature contribution analysis and AI classification reasoning.',       idx: 'EX' },
};

/* ─── NAV ITEMS ─── */
const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'detection',   label: 'Threat Detection',  icon: ShieldAlert },
  { id: 'dataset',     label: 'Dataset Analysis',  icon: Database },
  { id: 'anomaly',     label: 'Anomaly Analysis',  icon: CircleDot },
  { id: 'performance', label: 'Model Performance', icon: Activity },
  { id: 'reports',     label: 'Security Reports',  icon: FileSpreadsheet },
  { id: 'settings',    label: 'Settings',          icon: SettingsIcon },
  { id: 'explain',     label: 'Explainability',    icon: Microscope },
];

/* ─── AMBIENT PARTICLES (memoised) ─── */
const PARTICLE_POSITIONS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 5) % 100}%`,
  top: `${(i * 61 + 10) % 92}%`,
  delay: `${((i * 1.4) % 8).toFixed(1)}s`,
  duration: `${(9 + (i * 1.9) % 8).toFixed(1)}s`,
  w: i % 3 === 0 ? 2.5 : i % 3 === 1 ? 2 : 1.5,
  color: i % 4 === 0 ? '#06b6d4' : i % 4 === 1 ? '#3b82f6' : i % 4 === 2 ? '#0ea5e9' : '#22d3ee',
}));

/* ─── PROPS ─── */
interface LayoutProps {
  activePage: string;
  setActivePage: (page: string) => void;
  systemStatus: SystemStatus | null;
  selectedDataset: Dataset | null;
  selectedModel: MLModel | null;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activePage,
  setActivePage,
  systemStatus,
  selectedDataset,
  selectedModel,
  children,
}) => {

  /* ── Directional slide animation ── */
  const prevPageRef = useRef<string>(activePage);
  const [slideClass, setSlideClass] = useState<'scene-enter-right' | 'scene-enter-left'>('scene-enter-right');

  useEffect(() => {
    if (prevPageRef.current === activePage) return;
    const prevIdx = PAGE_ORDER.indexOf(prevPageRef.current);
    const currIdx = PAGE_ORDER.indexOf(activePage);
    // Default to right when page not in ordered list (e.g. 'explain')
    setSlideClass(currIdx >= prevIdx ? 'scene-enter-right' : 'scene-enter-left');
    prevPageRef.current = activePage;
  }, [activePage]);

  /* ── Stable refs for event handlers ── */
  const mainRef = useRef<HTMLElement>(null);
  const activePageRef = useRef(activePage);
  const setActivePageRef = useRef(setActivePage);
  useEffect(() => { activePageRef.current = activePage; }, [activePage]);
  useEffect(() => { setActivePageRef.current = setActivePage; }, [setActivePage]);

  /* ── Wheel navigation (boundary-aware) ── */
  // Only navigates between pages when:
  //   (a) cursor is NOT inside a vertically-scrollable element, OR
  //   (b) that scrollable element is already at its scroll boundary
  const wheelCooldown = useRef(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 25) return; // ignore tiny jitter

    // Walk up from event target to find scrollable containers
    let el = e.target as HTMLElement | null;
    let shouldNavigate = true;

    while (el && el !== mainRef.current) {
      const s = window.getComputedStyle(el);
      const overflowY = s.overflowY;
      if ((overflowY === 'scroll' || overflowY === 'auto') && el.scrollHeight > el.clientHeight + 2) {
        // Found an inner scrollable element
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
        const atTop = el.scrollTop <= 2;
        if (delta > 0 && !atBottom) { shouldNavigate = false; break; }
        if (delta < 0 && !atTop)    { shouldNavigate = false; break; }
        // At boundary → fall through and navigate
        break;
      }
      el = el.parentElement;
    }

    if (!shouldNavigate) return;
    if (wheelCooldown.current) return;
    wheelCooldown.current = true;
    setTimeout(() => { wheelCooldown.current = false; }, 700);

    e.preventDefault();

    const curr = PAGE_ORDER.indexOf(activePageRef.current);
    if (delta > 0 && curr < PAGE_ORDER.length - 1) {
      setActivePageRef.current(PAGE_ORDER[curr + 1]);
    } else if (delta < 0 && curr > 0) {
      setActivePageRef.current(PAGE_ORDER[curr - 1]);
    }
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const curr = PAGE_ORDER.indexOf(activePageRef.current);
      if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && curr < PAGE_ORDER.length - 1) {
        setActivePageRef.current(PAGE_ORDER[curr + 1]);
      }
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && curr > 0) {
        setActivePageRef.current(PAGE_ORDER[curr - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── Computed values ── */
  const meta = PAGE_META[activePage] ?? PAGE_META['dashboard'];
  const currIdx = PAGE_ORDER.indexOf(activePage);
  const prevPage = currIdx > 0 ? PAGE_ORDER[currIdx - 1] : null;
  const nextPage = currIdx < PAGE_ORDER.length - 1 ? PAGE_ORDER[currIdx + 1] : null;

  /* ── Memoised particles ── */
  const particles = useMemo(() =>
    PARTICLE_POSITIONS.map(p => (
      <div
        key={p.id}
        className="particle"
        style={{
          left: p.left, top: p.top,
          width: p.w, height: p.w,
          background: p.color,
          boxShadow: `0 0 4px ${p.color}`,
          animationDelay: p.delay,
          animationDuration: p.duration,
        }}
      />
    )), []
  );

  /* ── System status rows ── */
  const statuses = [
    { label: 'API',       ok: systemStatus?.api?.status === 'Operational',                                                              txt: systemStatus?.api?.status },
    { label: 'ML ENGINE', ok: systemStatus?.ml_engine?.status === 'Ready' || systemStatus?.ml_engine?.status === 'Operational',        txt: systemStatus?.ml_engine?.status },
    { label: 'DETECTION', ok: systemStatus?.detection_engine?.status === 'Ready',                                                       txt: systemStatus?.detection_engine?.status },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#01030a]">

      {/* ════════ SIDEBAR ════════ */}
      <aside
        className="flex flex-col w-56 shrink-0 z-30"
        style={{
          background: 'rgba(2, 5, 16, 0.97)',
          borderRight: '1px solid rgba(6, 182, 212, 0.09)',
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 30px rgba(6,182,212,0.04)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom:'1px solid rgba(6,182,212,0.08)' }}>
          <div
            className="relative w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.25)', boxShadow:'0 0 12px rgba(6,182,212,0.12)' }}
          >
            <Shield size={16} className="text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow:'0 0 6px #10b981' }} />
          </div>
          <div>
            <h1 className="font-bold text-[13px] tracking-widest text-white uppercase">IOTShield</h1>
            <p className="text-[9px] text-cyan-600 font-mono tracking-wider">THREAT PLATFORM</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive ? 'nav-active font-semibold' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.025]'
                }`}
              >
                <Icon size={14} className={`shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                <span className="text-[12px]">{label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow:'0 0 6px #06b6d4' }} />}
              </button>
            );
          })}
        </nav>

        {/* Status */}
        <div className="p-4 space-y-2" style={{ borderTop:'1px solid rgba(6,182,212,0.08)' }}>
          {statuses.map(({ label, ok, txt }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-slate-700 tracking-widest">{label}</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse-subtle ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ boxShadow: ok ? '0 0 5px #10b981' : '0 0 5px #ef4444' }} />
                <span className={`text-[9px] font-mono ${ok ? 'text-emerald-500' : 'text-rose-400'}`}>{txt || '…'}</span>
              </div>
            </div>
          ))}
          <p className="text-[9px] text-slate-800 font-mono text-center pt-1">IOTShield v2.0.0</p>
        </div>
      </aside>

      {/* ════════ MAIN FRAME ════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="flex justify-between items-center h-12 px-5 shrink-0 z-20"
          style={{ background:'rgba(1,4,14,0.93)', borderBottom:'1px solid rgba(6,182,212,0.09)', backdropFilter:'blur(16px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-px h-7" style={{ background:'linear-gradient(to bottom,transparent,#06b6d4,transparent)' }} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-white tracking-wide">{meta.title}</h2>
                <span className="section-crumb hidden md:inline">{meta.idx} / 07</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-0.5 hidden md:block">{meta.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
              <Wifi size={9} className="text-emerald-400" />
              <span className="text-[9px] text-emerald-400 font-mono font-bold tracking-widest">LIVE</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px]"
              style={{ background:'rgba(6,182,212,0.03)', border:'1px solid rgba(6,182,212,0.09)' }}>
              <span className="text-slate-600 font-mono uppercase text-[8px]">Model:</span>
              <span className="text-slate-300">{selectedModel?.algorithm ?? 'None'}</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px]"
              style={{ background:'rgba(6,182,212,0.03)', border:'1px solid rgba(6,182,212,0.09)' }}>
              <span className="text-slate-600 font-mono uppercase text-[8px]">Dataset:</span>
              <span className="text-slate-300 truncate max-w-[90px]">{selectedDataset?.name ?? 'None'}</span>
            </div>

            <div className="flex items-center gap-2 ml-1 pl-3" style={{ borderLeft:'1px solid rgba(30,41,59,0.5)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                style={{ background:'linear-gradient(135deg,#0e7490,#1d4ed8)', border:'1px solid rgba(6,182,212,0.3)', boxShadow:'0 0 10px rgba(6,182,212,0.12)' }}>
                OP
              </div>
              <div className="hidden md:block">
                <p className="text-[11px] font-semibold text-slate-300 leading-none">Operator</p>
                <p className="text-[9px] text-slate-700 font-mono mt-0.5">Analyst</p>
              </div>
            </div>
          </div>
        </header>

        {/* ════ 3D SCENE VIEWPORT ════ */}
        <main
          ref={mainRef}
          className="flex-1 overflow-hidden relative"
          style={{ background:'#01030a', perspective:'1800px', perspectiveOrigin:'50% 40%' }}
        >
          {/* Ambient environment layer */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 grid-floor opacity-[0.15]" />
            {particles}
            <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 60% 50% at 20% 50%,rgba(6,182,212,0.04) 0%,transparent 65%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background:'linear-gradient(90deg,transparent,rgba(6,182,212,0.25),transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background:'linear-gradient(90deg,transparent,rgba(6,182,212,0.12),transparent)' }} />
          </div>

          {/* Page content — keyed so the animation re-fires on every navigation */}
          <div
            key={activePage}
            className={`relative z-10 h-full overflow-y-auto ${slideClass}`}
          >
            <div className="p-5 min-h-full">{children}</div>
          </div>

          {/* ─ Section navigation arrows (bottom-right) ─ */}
          <div className="absolute bottom-4 right-5 z-30 flex items-center gap-2">
            {prevPage && (
              <button
                onClick={() => setActivePage(prevPage)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors text-[10px] font-mono"
                style={{ background:'rgba(6,182,212,0.04)', border:'1px solid rgba(6,182,212,0.1)' }}
              >
                <ChevronLeft size={12} />
                <span className="hidden lg:inline">{PAGE_META[prevPage]?.title}</span>
              </button>
            )}
            {nextPage && (
              <button
                onClick={() => setActivePage(nextPage)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors text-[10px] font-mono"
                style={{ background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.14)' }}
              >
                <span className="hidden lg:inline">{PAGE_META[nextPage]?.title}</span>
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          {/* ─ Section dot progress bar (bottom-center) ─ */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {PAGE_ORDER.map((p) => {
              const isActive = activePage === p;
              return (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  title={PAGE_META[p]?.title}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? 22 : 6,
                    height: 6,
                    background: isActive ? '#06b6d4' : 'rgba(6,182,212,0.18)',
                    boxShadow: isActive ? '0 0 8px #06b6d4' : 'none',
                  }}
                />
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
