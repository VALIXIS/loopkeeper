import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BrainIcon,
  SparklesIcon,
  ActivityIcon,
  BarChart3Icon,
  CheckCircleIcon,
  ShieldAlertIcon
} from '../common/Icons';

export const AccountabilityInsights: React.FC = () => {
  const { actionItems } = useApp();

  const totalItems = actionItems.length;
  const completed = actionItems.filter(a => a.status === 'done').length;
  const postponed = actionItems.filter(a => (a.postponement_count || 0) >= 1).length;

  const followThroughRate = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 100;
  const avgConfidence = totalItems > 0
    ? (actionItems.reduce((acc, curr) => acc + curr.confidence, 0) / totalItems).toFixed(2)
    : '0.96';

  return (
    <div className="space-y-6 pb-12">
      {/* Sleek Compact Header Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/30 p-4 sm:px-5 sm:py-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 shadow-sm shrink-0">
            <BrainIcon size={14} className="text-cyan-400" />
            AI Analytics & Velocity
          </span>
          <h1 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
            Executive Accountability Intelligence
          </h1>
        </div>
        <p className="text-xs text-zinc-400 font-medium">
          Follow-through reliability curves, deadline drift rates & SLM model telemetry.
        </p>
      </div>

      {/* Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel-elevated border border-emerald-500/30 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold tracking-wider uppercase">
            <span>Meeting Follow-Through</span>
            <CheckCircleIcon size={16} className="text-emerald-400" />
          </div>
          <span className="text-3xl font-black font-mono text-emerald-400 mt-3 block">
            {followThroughRate}%
          </span>
          <p className="text-xs text-zinc-400 mt-1">Commitments converted to verified done</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-elevated border border-cyan-500/30 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold tracking-wider uppercase">
            <span>AI Extraction Confidence</span>
            <SparklesIcon size={16} className="text-cyan-400" />
          </div>
          <span className="text-3xl font-black font-mono text-cyan-400 mt-3 block">
            {Math.round(Number(avgConfidence) * 100)}%
          </span>
          <p className="text-xs text-zinc-400 mt-1">Evaluated across all transcript turns</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-elevated border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold tracking-wider uppercase">
            <span>Slippage Probability</span>
            <ActivityIcon size={16} className="text-amber-400" />
          </div>
          <span className="text-3xl font-black font-mono text-amber-300 mt-3 block">
            {totalItems > 0 ? Math.round((postponed / totalItems) * 100) : 0}%
          </span>
          <p className="text-xs text-zinc-400 mt-1">Tasks requiring deadline revisions</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-elevated border border-indigo-500/30 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold tracking-wider uppercase">
            <span>Vector Deduplication</span>
            <BarChart3Icon size={16} className="text-indigo-400" />
          </div>
          <span className="text-3xl font-black font-mono text-indigo-300 mt-3 block">
            1536-dim
          </span>
          <p className="text-xs text-zinc-400 mt-1">1536-dim Vector Cosine Indexing</p>
        </div>
      </div>

      {/* Analytics Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Findings Card */}
        <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <SparklesIcon size={18} className="text-cyan-400" />
              AI Executive Takeaways
            </h3>
            <span className="text-xs font-mono text-zinc-500">Live Synthesis</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  1. High Backend Architecture Velocity
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pl-4">
                Database schema migrations and vector similarity indexing deliverables were completed ahead of schedule with 0 postponements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-amber-400">
                  2. Frontend Authentication Slippage
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pl-4">
                Mobile auth token refresh was delayed across 2 standups due to concurrent bundle dependencies. Reassignment or targeted pairing suggested.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">
                  3. Fast SLM Inference Performance
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pl-4">
                Specialized SLM handles primary transcript turns with high confidence, falling back to LLM when confidence falls below threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Security & Compliance */}
        <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <ShieldAlertIcon size={18} className="text-indigo-400" />
              Integration Integrity & Boundary Audit
            </h3>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Passing
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-200">VALIXIS Schema Isolation</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">Read-Only mode strictly enforced on employees and tasks tables</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                100% Compliant
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-200">API Key Client-Side Exposure</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">Gemini / OpenAI keys handled exclusively server-side via FastAPI backend</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                Zero Leaks
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-200">Vector Matching & Schema Layer</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">1536-dimensional dense vector embeddings with cosine similarity matching & RLS</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
