import React from 'react';
import {
  BrainIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  SparklesIcon
} from '../common/Icons';

export interface PipelineStep {
  id: string;
  title: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  latency?: string;
  badge?: string;
}

interface AIPipelineVisualizerProps {
  steps: PipelineStep[];
  currentStepIndex: number;
  confidence?: number;
  modelUsed?: string;
  isProcessing?: boolean;
}

export const AIPipelineVisualizer: React.FC<AIPipelineVisualizerProps> = ({
  steps,
  currentStepIndex,
  confidence = 0.96,
  modelUsed = 'loopkeeper-slm-v1',
  isProcessing = false
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel-elevated border border-cyan-500/30 p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Background glow flare */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20">
            <BrainIcon size={22} className={isProcessing ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              LoopKeeper AI Pipeline Architecture
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30 animate-pulse">
                  <RefreshCwIcon size={12} className="animate-spin" /> Ingesting & Inferring
                </span>
              )}
            </h4>
            <p className="text-xs text-zinc-400">
              Dual-Inference SLM ➔ 1536-dim Embedding ➔ pgvector Deduplication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-indigo-300">
            Model: <strong className="text-zinc-200">{modelUsed}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-emerald-400 flex items-center gap-1">
            <SparklesIcon size={12} />
            Conf: <strong className="text-zinc-200">{Math.round(confidence * 100)}%</strong>
          </span>
        </div>
      </div>

      {/* Pipeline Steps Flow */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex && isProcessing;
          const isDone = idx < currentStepIndex || (step.status === 'completed' && !isProcessing);

          let icon = <CheckCircleIcon size={16} className="text-zinc-600" />;
          let bgClass = 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400';

          if (isDone) {
            icon = <CheckCircleIcon size={16} className="text-emerald-400" />;
            bgClass = 'bg-emerald-950/20 border-emerald-500/30 text-zinc-200 shadow-sm shadow-emerald-500/5';
          } else if (isActive) {
            icon = <RefreshCwIcon size={16} className="animate-spin text-cyan-400" />;
            bgClass = 'bg-indigo-950/50 border-cyan-400/60 text-white shadow-xl shadow-cyan-500/15 ring-2 ring-cyan-500/30 relative overflow-hidden';
          }

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-3 ${bgClass}`}
            >
              {isActive && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent animate-shimmer" />
              )}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{step.title}</span>
                    {step.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-zinc-900 border border-zinc-700 text-cyan-300 font-bold">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {step.latency && (
                <span className="text-[10px] font-mono text-cyan-400/90 font-bold shrink-0 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800">
                  {step.latency}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
