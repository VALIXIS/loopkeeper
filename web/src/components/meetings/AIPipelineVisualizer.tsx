import React from 'react';
import {
  BrainIcon,
  CheckCircleIcon,
  RefreshCwIcon
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
    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <BrainIcon size={20} className={isProcessing ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              LoopKeeper AI Pipeline Architecture
              {isProcessing && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 font-semibold animate-pulse">
                  <RefreshCwIcon size={12} className="animate-spin" /> In Progress
                </span>
              )}
            </h4>
            <p className="text-xs text-zinc-400">
              Dual-Inference SLM ➔ 1536-dim Embedding ➔ Vector Cosine Deduplication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-300">
            Model: <strong className="text-zinc-200">{modelUsed}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">
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
          let bgClass = 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400';

          if (isDone) {
            icon = <CheckCircleIcon size={16} className="text-emerald-400" />;
            bgClass = 'bg-emerald-950/20 border-emerald-500/30 text-zinc-200';
          } else if (isActive) {
            icon = <RefreshCwIcon size={16} className="animate-spin text-cyan-400" />;
            bgClass = 'bg-indigo-950/40 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30';
          }

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start justify-between gap-3 ${bgClass}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{step.title}</span>
                    {step.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-300">
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
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">
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
