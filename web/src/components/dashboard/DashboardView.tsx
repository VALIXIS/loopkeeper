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
    <div className="space-y-6 pb-12">
      {/* 10-Second Demo Executive Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/70 border border-zinc-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircleIcon size={13} className="text-emerald-400" />
                Live Engine Ready
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                LoopKeeper Enterprise Overview
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{currentUser.name}</span>
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              LoopKeeper captures commitments from meeting transcripts and tracks them across consecutive meetings — detecting chronic postponements, evidence trails, and delivery outcomes after meetings end.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('graph')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold border border-zinc-700 shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <NetworkIcon size={16} className="text-cyan-400" />
              <span>Signature Graph</span>
            </button>
            <button
              onClick={() => onOpenCreateMeeting()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <SparklesIcon size={16} />
              <span>Ingest & Process Transcript</span>
            </button>
          </div>
        </div>

        {/* Executive Quick Stats Ribbon */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 font-medium block">Cross-Meeting Linking</span>
            <span className="text-zinc-100 font-bold text-sm block">Vector-Matched</span>
            <span className="text-zinc-500 font-mono text-[10px] block mt-0.5">Cosine Vector Match</span>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block">Inference Speed</span>
            <span className="text-indigo-300 font-bold text-sm block">Sub-500ms Engine</span>
            <span className="text-indigo-400/80 font-mono text-[10px] block mt-0.5">Dual SLM + LLM Fallback</span>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block">Commitment Matching</span>
            <span className="text-emerald-300 font-bold text-sm block">Cross-Standup Sync</span>
            <span className="text-emerald-400/80 font-mono text-[10px] block mt-0.5">HNSW 1536-dim Vector</span>
          </div>
          <div>
            <span className="text-zinc-400 font-medium block">Enterprise Governance</span>
            <span className="text-cyan-300 font-bold text-sm block">VALIXIS Read-Only</span>
            <span className="text-cyan-400/80 font-mono text-[10px] block mt-0.5">RLS Security Enforced</span>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Ingest Preset Bar */}
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
