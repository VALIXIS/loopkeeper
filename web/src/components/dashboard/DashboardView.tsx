import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { QuickIngestCard } from './QuickIngestCard';
import { OverloadedMembersCard } from './OverloadedMembersCard';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import {
  SparklesIcon,
  NetworkIcon,
  CheckCircleIcon,
  RadioIcon,
  ShieldAlertIcon,
  AlertTriangleIcon,
  CalendarIcon,
  ArrowRightIcon
} from '../common/Icons';

interface DashboardViewProps {
  onOpenCreateMeeting: (presetIndex?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenCreateMeeting }) => {
  const { currentUser } = useAuth();
  const { navigate, navigateToAccountability } = useRouter();

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
                Executive Accountability Intelligence
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
              onClick={() => navigate('/recording')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-white/[0.1] shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98] hover:border-cyan-500/40"
            >
              <RadioIcon size={15} className="text-rose-400 animate-pulse" />
              <span>Record Live</span>
            </button>
            <button
              onClick={() => navigateToAccountability('graph')}
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
              <span>Ingest Transcript</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Executive Accountability Pillars: What Happened? What Needs Attention? What is Going Wrong? */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: What Happened? */}
        <div
          onClick={() => navigate('/meetings')}
          className="cursor-pointer p-5 rounded-3xl glass-panel-elevated border border-indigo-500/30 hover:border-indigo-500/60 shadow-lg transition-all hover:-translate-y-0.5 group flex flex-col justify-between gap-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <CalendarIcon size={14} />
                1. What Happened?
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Recap</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
              Ingested Meetings & Extracted Promises
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full speaker-tagged transcript archives, automatic owner assignment, and verbatim evidence snippets.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-cyan-400 font-semibold">
            <span>Review Meetings</span>
            <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: What Needs Attention? */}
        <div
          onClick={() => navigate('/commitments')}
          className="cursor-pointer p-5 rounded-3xl glass-panel-elevated border border-amber-500/30 hover:border-amber-500/60 shadow-lg transition-all hover:-translate-y-0.5 group flex flex-col justify-between gap-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <AlertTriangleIcon size={14} />
                2. What Needs Attention?
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Deadlines</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
              Upcoming Deadlines & Workload Peaks
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Active commitments due this sprint and single slippage warnings under active monitoring.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-amber-400 font-semibold">
            <span>Inspect Commitments</span>
            <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: What is Going Wrong? */}
        <div
          onClick={() => navigateToAccountability('drift')}
          className="cursor-pointer p-5 rounded-3xl glass-panel-elevated border border-rose-500/30 hover:border-rose-500/60 shadow-lg transition-all hover:-translate-y-0.5 group flex flex-col justify-between gap-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ShieldAlertIcon size={14} className="animate-pulse" />
                3. What is Going Wrong?
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-bold">Execution Drift</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-rose-300 transition-colors">
              Chronic Postponements & Jira Drift
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Items postponed across 2+ standups and verbal claims conflicting with Jira / external tracker states.
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-rose-400 font-semibold">
            <span>View Drift Radar</span>
            <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
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
    </div>
  );
};

