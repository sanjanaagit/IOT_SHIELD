import React, { Suspense } from 'react';
import { NetworkTopology3D } from '../components/3d/NetworkTopology3D';
import { DashboardAnalytics } from '../types';

interface DashboardProps {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  refreshData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-slate-900 border-t-cyan-500 animate-spin" />
        <p className="text-slate-600 font-mono text-[10px] tracking-widest animate-pulse-subtle">ACQUIRING TELEMETRY…</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-900 border-t-cyan-500 animate-spin" />
      </div>
    }>
      <NetworkTopology3D analytics={analytics} />
    </Suspense>
  );
};
