import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { QuickIngestCard } from './QuickIngestCard';
import { OverloadedMembersCard } from './OverloadedMembersCard';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';
import { RecentActivityFeed } from './RecentActivityFeed';
import { useAuth } from '../../context/AuthContext';
import { SparklesIcon, NetworkIcon, CheckCircleIcon } from '../common/Icons';
import { useApp } from '../../context/AppContext';

interface DashboardViewProps {
  onOpenCreateMeeting: (presetIndex?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenCreateMeeting }) => {
  const { currentUser } = useAuth();
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Executive Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0e1424]/90 to-indigo-950/60 border border-white/[0.1] p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glow Flare */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
                <CheckCircleIcon size={13} className="text-emerald-400" />
                Live Engine Active
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Enterprise Accountability Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300">{currentUser.name}</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              LoopKeeper captures commitments from meeting transcripts and tracks them across consecutive meetings — detecting chronic postponements, evidence trails, and delivery outcomes after meetings end.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('graph')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-white/[0.1] shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98] hover:border-cyan-500/40"
            >
              <NetworkIcon size={16} className="text-cyan-400" />
              <span>Signature Graph</span>
            </button>
            <button
              onClick={() => onOpenCreateMeeting()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] border border-indigo-400/30"
            >
              <SparklesIcon size={15} />
              <span>Ingest & Process Transcript</span>
            </button>
          </div>
        </div>

        {/* Executive Quick Stats Ribbon */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/[0.04]">
            <span className="text-slate-400 font-medium block text-[11px]">Cross-Meeting Linking</span>
            <span className="text-white font-bold text-sm block mt-0.5">Vector-Matched</span>
            <span className="text-slate-400 font-mono text-[10px] block mt-0.5">Cosine Similarity Score</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/[0.04]">
            <span className="text-slate-400 font-medium block text-[11px]">Inference Speed</span>
            <span className="text-indigo-300 font-bold text-sm block mt-0.5">Sub-500ms Engine</span>
            <span className="text-indigo-400/80 font-mono text-[10px] block mt-0.5">Dual SLM + Fallback LLM</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/[0.04]">
            <span className="text-slate-400 font-medium block text-[11px]">Commitment Matching</span>
            <span className="text-emerald-300 font-bold text-sm block mt-0.5">Cross-Standup Sync</span>
            <span className="text-emerald-400/80 font-mono text-[10px] block mt-0.5">1536-dim Vector Cosine</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/[0.04]">
            <span className="text-slate-400 font-medium block text-[11px]">Enterprise Governance</span>
            <span className="text-cyan-300 font-bold text-sm block mt-0.5">VALIXIS Read-Only</span>
            <span className="text-cyan-400/80 font-mono text-[10px] block mt-0.5">RLS Security Enforced</span>
          </div>
        </div>
      </div>

      {/* Preset Ingest Bar */}
      <QuickIngestCard onOpenCreateMeeting={onOpenCreateMeeting} />

      {/* Primary 4 Metric Cards */}
      <MetricsGrid />

      {/* Secondary Intelligence Columns: Workload vs Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverloadedMembersCard />
        <UpcomingDeadlinesCard />
      </div>

      {/* Live Activity & AI Processing Telemetry Feed */}
      <RecentActivityFeed />
    </div>
  );
};
