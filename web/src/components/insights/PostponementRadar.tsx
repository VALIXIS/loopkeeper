import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PostponementBadge, VerificationBadge } from '../common/Badge';
import {
  AlertTriangleIcon,
  UsersIcon,
  ArrowRightIcon,
  ShieldAlertIcon,
  SparklesIcon,
  ClockIcon
} from '../common/Icons';

export const PostponementRadar: React.FC = () => {
  const { actionItems, navigateToTask } = useApp();

  const postponedItems = actionItems.filter(a => (a.postponement_count || 0) >= 1);
  const chronicItems = actionItems.filter(a => (a.postponement_count || 0) >= 2);

  return (
    <div className="space-y-6 pb-12">
      {/* Sleek Compact Header Bar */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-amber-500/30 dark:border-amber-500/40 p-4 sm:px-5 sm:py-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm shrink-0">
            <AlertTriangleIcon size={14} className="animate-pulse text-amber-600 dark:text-amber-400" />
            Chronic Slippage Radar
          </span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Repeated Postponement Radar
          </h1>
        </div>
        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
          Automatically flagging commitments delayed 2+ times across consecutive meetings.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel-elevated border border-rose-500/30 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase font-semibold block tracking-wider">
              Chronic Postponements (≥2x)
            </span>
            <ShieldAlertIcon size={18} className="text-rose-400" />
          </div>
          <span className="text-3xl font-black font-mono text-rose-400 mt-2 block">
            {chronicItems.length}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block">
            Immediate managerial review recommended
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel-elevated border border-amber-500/30 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase font-semibold block tracking-wider">
              Single Slippage (1x)
            </span>
            <AlertTriangleIcon size={18} className="text-amber-400" />
          </div>
          <span className="text-3xl font-black font-mono text-amber-300 mt-2 block">
            {postponedItems.length - chronicItems.length}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block">
            Under active deadline monitoring
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel-elevated border border-cyan-500/30 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase font-semibold block tracking-wider">
              Audit State Events
            </span>
            <SparklesIcon size={18} className="text-cyan-400" />
          </div>
          <span className="text-3xl font-black font-mono text-cyan-400 mt-2 block">
            {postponedItems.reduce((acc, curr) => acc + (curr.postponement_count || 0), 0)}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block">
            Verified with transcript evidence snippets
          </span>
        </div>
      </div>

      {/* Chronic Slippage List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <ShieldAlertIcon size={18} className="text-rose-400" />
          Flagged High-Risk Deliverables ({postponedItems.length})
        </h3>

        <div className="space-y-3">
          {postponedItems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl glass-panel border border-zinc-800 text-zinc-400 text-xs">
              No tasks have suffered postponements yet. Team execution velocity is on schedule!
            </div>
          ) : (
            postponedItems.map(item => {
              const isChronic = (item.postponement_count || 0) >= 2;

              return (
                <div
                  key={item.id}
                  onClick={() => navigateToTask(item.id)}
                  className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isChronic
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400 hover:shadow-rose-500/10 hover:-translate-y-0.5'
                      : 'glass-panel border-amber-600/30 hover:border-amber-500 hover:shadow-amber-500/10 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <PostponementBadge count={item.postponement_count} />
                      <StatusBadge status={item.status} size="sm" />
                      <VerificationBadge confidence={item.confidence} />
                    </div>

                    <h4 className="text-base font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>

                    {item.source_text && (
                      <div className="text-xs text-zinc-300 font-mono italic bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 leading-relaxed flex items-start gap-2">
                        <span className="text-amber-400 not-italic font-bold">❝</span>
                        <span className="flex-1">{item.source_text}</span>
                        <span className="text-amber-400 not-italic font-bold">❞</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1.5 text-zinc-300 font-semibold bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800">
                        <UsersIcon size={12} className="text-cyan-400" />
                        {item.owner_name}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-zinc-400 flex items-center gap-1">
                        <ClockIcon size={12} />
                        Target: {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'None'}
                      </span>
                      {item.meeting_title && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400 font-medium">
                            {item.meeting_title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center md:flex-col items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase block font-bold tracking-wider">
                        Slippage Index
                      </span>
                      <span
                        className={`text-sm font-mono font-bold ${
                          isChronic ? 'text-rose-400' : 'text-amber-300'
                        }`}
                      >
                        Level {item.postponement_count} Risk
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Inspect Audit Trail</span>
                      <ArrowRightIcon size={14} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
