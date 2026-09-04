import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityIcon, BrainIcon, SparklesIcon, GitCommitIcon } from '../common/Icons';

export const RecentActivityFeed: React.FC = () => {
  const { dashboardOverview, navigateToMeeting } = useApp();

  const recentRuns = dashboardOverview?.recent_ai_runs || [];
  const recentMeetings = dashboardOverview?.recent_meetings || [];

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ActivityIcon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Live AI Telemetry & Processing Feed</h3>
            <p className="text-[11px] text-zinc-400">SLM inference runs, latency & fallback routing</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Inference Engine Active
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Recent AI Inference Telemetry */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <BrainIcon size={13} />
            <span>AI Execution Telemetry</span>
          </div>

          <div className="space-y-2">
            {recentRuns.length === 0 ? (
              <div className="text-xs text-zinc-500 py-4">No AI telemetry runs recorded yet.</div>
            ) : (
              recentRuns.map(run => {
                const isFallback = run.fallback_used || run.provider === 'fallback_llm';
                return (
                  <div
                    key={run.id}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isFallback
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        <SparklesIcon size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                          <span>{run.model_name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              isFallback ? 'bg-amber-950 text-amber-300' : 'bg-indigo-950 text-indigo-300'
                            }`}
                          >
                            {isFallback ? 'Fallback LLM' : 'Specialized SLM'}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>Latency: {run.latency_ms}ms</span>
                          <span>•</span>
                          <span>Confidence: {Math.round(run.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Ingested Meetings Stream */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <GitCommitIcon size={13} />
            <span>Recent Synced Meetings</span>
          </div>

          <div className="space-y-2">
            {recentMeetings.map(meeting => (
              <div
                key={meeting.id}
                onClick={() => navigateToMeeting(meeting.id)}
                className="group cursor-pointer p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 transition-colors truncate">
                    {meeting.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>{new Date(meeting.meeting_date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-medium">
                      {meeting.action_item_count || 0} extracted commitments
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono shrink-0">
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
