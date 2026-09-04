import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PostponementBadge, VerificationBadge } from '../common/Badge';
import {
  AlertTriangleIcon,
  UsersIcon,
  ArrowRightIcon,
  ShieldAlertIcon
} from '../common/Icons';

export const PostponementRadar: React.FC = () => {
  const { actionItems, navigateToTask } = useApp();

  const postponedItems = actionItems.filter(a => (a.postponement_count || 0) >= 1);
  const chronicItems = actionItems.filter(a => (a.postponement_count || 0) >= 2);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <AlertTriangleIcon size={14} />
            Chronic Slippage Detection
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
          Repeated Postponement Radar
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          LoopKeeper automatically flags action items that have suffered 2 or more deadline shifts or postponements across consecutive meetings. This detects systemic delivery bottlenecks before deadlines pass.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <span className="text-xs text-zinc-500 uppercase font-semibold block">
            Chronic Postponements (≥2x)
          </span>
          <span className="text-3xl font-bold font-mono text-rose-400 mt-2 block">
            {chronicItems.length}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block">
            Immediate managerial review recommended
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <span className="text-xs text-zinc-500 uppercase font-semibold block">
            Single Slippage (1x)
          </span>
          <span className="text-3xl font-bold font-mono text-amber-300 mt-2 block">
            {postponedItems.length - chronicItems.length}
          </span>
          <span className="text-xs text-zinc-400 mt-1 block">
            Under active deadline monitoring
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <span className="text-xs text-zinc-500 uppercase font-semibold block">
            Audit State Events
          </span>
          <span className="text-3xl font-bold font-mono text-cyan-400 mt-2 block">
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
          Flagged High-Risk Deliverables
        </h3>

        <div className="space-y-3">
          {postponedItems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs">
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
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400 hover:shadow-rose-500/10'
                      : 'bg-zinc-900/90 border-amber-600/30 hover:border-amber-500'
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
                      <p className="text-xs text-zinc-300 font-mono italic bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 leading-relaxed">
                        "{item.source_text}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                        <UsersIcon size={13} />
                        {item.owner_name}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-zinc-400">
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
                      <span className="text-[10px] text-zinc-500 uppercase block font-bold">
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

                    <div className="flex items-center gap-1 text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
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
