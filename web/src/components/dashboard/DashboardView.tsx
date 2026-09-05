import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { QuickIngestCard } from './QuickIngestCard';
import { OverloadedMembersCard } from './OverloadedMembersCard';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';
import { useRouter } from '../../context/RouterContext';
import {
  SparklesIcon,
  CheckCircleIcon,
  RadioIcon,
  ShieldAlertIcon,
  AlertTriangleIcon,
  CalendarIcon,
  ArrowRightIcon,
  ExternalLinkIcon
} from '../common/Icons';

interface DashboardViewProps {
  onOpenCreateMeeting: (presetIndex?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenCreateMeeting }) => {
  const { navigate, navigateToAccountability } = useRouter();
  const [showAiDetails, setShowAiDetails] = React.useState(false);

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Executive Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0e1424]/90 to-indigo-950/60 border border-white/[0.1] p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl space-y-4">
        {/* Glow Flare */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
                <CheckCircleIcon size={13} className="text-cyan-400" />
                LoopKeeper Core Engine Active
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Real Google Meet, Zoom & Xero Sync
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Keep meetings <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300">accountable.</span>
            </h1>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              LoopKeeper connects spoken commitments from <strong className="text-cyan-300 font-semibold">Google Meet & Zoom</strong> with actual execution evidence in <strong className="text-indigo-300 font-semibold">Jira & Xero</strong> to detect Execution Drift.
            </p>

            {/* Product Pipeline Flow */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">Meeting</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">Commitment</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">Evidence</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-indigo-300">Jira & Xero</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-950/40 border border-rose-500/40 text-rose-300 font-bold">Execution Drift</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/recording')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-white/[0.1] shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98] hover:border-cyan-500/40"
            >
              <RadioIcon size={15} className="text-rose-400 animate-pulse" />
              <span>Start Meeting</span>
            </button>
            <button
              onClick={() => onOpenCreateMeeting()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98] border border-indigo-400/30"
            >
              <CalendarIcon size={15} />
              <span>Schedule Meeting</span>
            </button>
            <button
              onClick={() => onOpenCreateMeeting()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] border border-indigo-400/30"
            >
              <SparklesIcon size={15} />
              <span>Add Transcript</span>
            </button>
          </div>
        </div>
      </div>


      {/* Hero Execution Drift Command Banner (Hero Feature Spotlight) */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/40 p-6 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              <ShieldAlertIcon size={18} />
            </span>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                Execution Drift Command Center
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  HERO INNOVATION
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Someone said this was done in the meeting. The execution system says it isn't.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateToAccountability('drift')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shrink-0"
          >
            <span>View Full Drift Radar</span>
            <ArrowRightIcon size={13} />
          </button>
        </div>

        {/* Live Drift Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/80 p-5 rounded-2xl border border-white/[0.06]">
          {/* Item & Evidence */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">
              Tracked Commitment & Evidence Quote
            </span>
            <h3 className="text-sm font-bold text-white leading-snug">
              Stripe Webhook Replay & Payment API Idempotency Ledger
            </h3>
            <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-white/[0.06] font-mono">
              "Jyothsna: Payment API implementation is completely finished and verified on local."
            </p>
          </div>

          {/* Claim vs Jira Discrepancy */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">
              Discrepancy Breakdown
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-white/[0.04]">
                <span className="text-slate-400">Meeting Claim:</span>
                <span className="font-bold text-emerald-400">Claimed Done</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                <span className="text-slate-400">Live Jira Status:</span>
                <span className="font-mono font-bold text-rose-300">To Do (SCRUM-1)</span>
              </div>
            </div>
          </div>

          {/* Outcome Status */}
          <div className="flex flex-col justify-between items-start md:items-end space-y-2 pt-2 md:pt-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">
              LoopKeeper Outcome
            </span>
            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-md">
              <AlertTriangleIcon size={14} className="text-rose-400 animate-pulse" />
              <span>DRIFT DETECTED</span>
            </span>
            <button
              onClick={() => navigate('/integrations')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Verify Jira Sync</span>
              <ExternalLinkIcon size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Continuity Lifecycle Visualization */}
      <div className="p-6 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CalendarIcon size={15} className="text-cyan-400" />
            Cross-Meeting Continuity Lifecycle
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            Lifecycle Across Standups
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold block">1. MEETING 1</span>
            <h4 className="font-bold text-white text-xs">Commitment Created</h4>
            <p className="text-[11px] text-slate-400">Payment API assigned to Jyothsna due Wed.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-amber-300 font-bold block">2. MEETING 2</span>
            <h4 className="font-bold text-white text-xs">Deadline Postponed</h4>
            <p className="text-[11px] text-slate-400">Postponed 1x due to DB schema migration.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block">3. MEETING 3</span>
            <h4 className="font-bold text-white text-xs">Verbal Done Claimed</h4>
            <p className="text-[11px] text-slate-400">Speaker claimed "Finished and verified".</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-1">
            <span className="text-[10px] font-mono text-indigo-300 font-bold block">4. JIRA TRACKER</span>
            <h4 className="font-bold text-white text-xs">Actual Status: To Do</h4>
            <p className="text-[11px] text-slate-400">Issue SCRUM-1 is still unassigned & To Do.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-1">
            <span className="text-[10px] font-mono text-rose-300 font-bold block">5. LOOPKEEPER</span>
            <h4 className="font-bold text-rose-300 text-xs">Execution Drift</h4>
            <p className="text-[11px] text-slate-300 font-bold">Contradiction Flagged</p>
          </div>
        </div>
      </div>

      {/* Quick Ingest Sequence Presets */}
      <QuickIngestCard onOpenCreateMeeting={onOpenCreateMeeting} />

      {/* Commitments at Risk & Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverloadedMembersCard />
        <UpcomingDeadlinesCard />
      </div>

      {/* Collapsible AI & System Details Drawer */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-4 transition-all">
        <button
          onClick={() => setShowAiDetails(!showAiDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <SparklesIcon size={15} className="text-cyan-400" />
            <span>AI & System Details (Metrics, SLM Confidence, Vector Models)</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            {showAiDetails ? 'Hide Details ▲' : 'Show Details ▼'}
          </span>
        </button>
        {showAiDetails && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] animate-fade-in">
            <MetricsGrid />
          </div>
        )}
      </div>
    </div>
  );
};



