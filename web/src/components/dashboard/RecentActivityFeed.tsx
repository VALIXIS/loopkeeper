import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityIcon, BrainIcon, SparklesIcon, GitCommitIcon } from '../common/Icons';

export const RecentActivityFeed: React.FC = () => {
  const { dashboardOverview, navigateToMeeting } = useApp();

  const recentRuns = dashboardOverview?.recent_ai_runs || [];
  const recentMeetings = dashboardOverview?.recent_meetings || [];

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-inner">
            <ActivityIcon size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live AI Telemetry & Processing Feed</h3>
            <p className="text-[11px] text-slate-400">SLM inference runs, latency & fallback routing</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          Inference Engine Active
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Recent AI Inference Telemetry */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
            <BrainIcon size={13} className="text-indigo-400" />
            <span>AI Execution Telemetry</span>
          </div>

          <div className="space-y-2">
            {recentRuns.length === 0 ? (
              <div className="text-xs text-slate-500 py-4">No AI telemetry runs recorded yet.</div>
            ) : (
              recentRuns.map(run => {
                const isFallback = run.fallback_used || run.provider === 'fallback_llm';
                return (
                  <div
                    key={run.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          isFallback
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        <SparklesIcon size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <span>{run.model_name}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold ${
                              isFallback ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {isFallback ? 'Fallback LLM' : 'Specialized SLM'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1 font-mono">
                          <span className="text-cyan-400">{run.latency_ms}ms</span>
                          <span>•</span>
                          <span className="text-emerald-400">{Math.round(run.confidence * 100)}% confidence</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Ingested Meetings Stream */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
            <GitCommitIcon size={13} className="text-cyan-400" />
            <span>Recent Synced Meetings</span>
          </div>

          <div className="space-y-2">
            {recentMeetings.map(meeting => (
              <div
                key={meeting.id}
                onClick={() => navigateToMeeting(meeting.id)}
                className="group cursor-pointer p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/70 border border-white/[0.06] hover:border-cyan-500/40 transition-all flex items-center justify-between shadow-sm"
              >
                <div className="truncate pr-2">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                    {meeting.title}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                    <span className="font-mono">{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">
                      {meeting.action_item_count || 0} extracted commitments
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono font-semibold shrink-0 border border-white/[0.06]">
                  {meeting.source}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
