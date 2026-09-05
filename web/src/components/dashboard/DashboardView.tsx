import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { OverloadedMembersCard } from './OverloadedMembersCard';
import { UpcomingDeadlinesCard } from './UpcomingDeadlinesCard';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  SparklesIcon,
  CheckCircleIcon,
  RadioIcon,
  ShieldAlertIcon,
  CalendarIcon,
  ArrowRightIcon,
  ExternalLinkIcon
} from '../common/Icons';

interface DashboardViewProps {
  onOpenCreateMeeting: (presetIndex?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenCreateMeeting }) => {
  const { navigate, navigateToAccountability } = useRouter();
  const { currentUser } = useAuth();
  const [showAiDetails, setShowAiDetails] = React.useState(false);
  const [showDriftDetails, setShowDriftDetails] = React.useState(false);

  return (
    <div className="space-y-5 pb-10 animate-fade-in-up">
      {/* Executive Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1424]/90 to-indigo-950/70 border border-white/[0.1] p-5 shadow-lg overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <CheckCircleIcon size={12} className="text-cyan-400" />
                LoopKeeper Core Engine Active
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Google Meet, Zoom & Jira Sync
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300">{currentUser.name}.</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Live team execution evidence, active commitments, and execution drift status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/recording')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-white/[0.1] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RadioIcon size={14} className="text-rose-400 animate-pulse" />
              <span>Start Meeting</span>
            </button>
            <button
              onClick={() => onOpenCreateMeeting()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/30"
            >
              <CalendarIcon size={14} />
              <span>Schedule</span>
            </button>
            <button
              onClick={() => onOpenCreateMeeting()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <SparklesIcon size={14} />
              <span>Add Transcript</span>
            </button>
          </div>
        </div>
      </div>

      {/* Minimized Execution Drift Command Center Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/30 p-4 shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
              <ShieldAlertIcon size={16} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs font-bold text-white tracking-tight">Execution Drift Command Center</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  1 DRIFT DETECTED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                <strong className="text-slate-200 font-semibold">Stripe Webhook Replay</strong>: Meeting claim <span className="text-emerald-400 font-medium">"Done"</span> vs Jira status <span className="text-rose-300 font-mono font-semibold">To Do (SCRUM-1)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowDriftDetails(!showDriftDetails)}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/[0.08] transition-colors"
            >
              {showDriftDetails ? 'Hide Quote ▲' : 'Inspect Quote ▼'}
            </button>
            <button
              onClick={() => navigate('/integrations')}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1 font-semibold"
            >
              <span>Verify Jira</span>
              <ExternalLinkIcon size={11} />
            </button>
            <button
              onClick={() => navigateToAccountability('drift')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-all"
            >
              <span>Drift Radar</span>
              <ArrowRightIcon size={12} />
            </button>
          </div>
        </div>

        {/* Collapsible Quote & Details */}
        {showDriftDetails && (
          <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
              <span>Evidence Quote</span>
              <span className="text-rose-300 font-semibold">Contradiction Flagged</span>
            </div>
            <p className="text-xs text-slate-300 italic bg-slate-950/80 p-2.5 rounded-xl border border-white/[0.06] font-mono">
              "Jyothsna: Payment API implementation is completely finished and verified on local."
            </p>
          </div>
        )}
      </div>

      {/* Commitments at Risk & Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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



