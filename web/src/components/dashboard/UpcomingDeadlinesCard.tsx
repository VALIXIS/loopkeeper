import React from 'react';
import { useApp } from '../../context/AppContext';
import { ClockIcon, CalendarIcon, ArrowRightIcon } from '../common/Icons';
import { PostponementBadge, VerificationBadge } from '../common/Badge';

export const UpcomingDeadlinesCard: React.FC = () => {
  const { dashboardOverview, navigateToTask, setActiveTab } = useApp();

  const deadlines = dashboardOverview?.upcoming_deadlines || [];

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner">
              <CalendarIcon size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upcoming Deadlines</h3>
              <p className="text-[11px] text-slate-400">Target commitments ordered by proximity</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs text-indigo-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group transition-colors"
          >
            <span>All Items</span>
            <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* List of deadlines */}
        <div className="mt-4 space-y-2.5">
          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No pending deadlines scheduled.
            </div>
          ) : (
            deadlines.slice(0, 4).map(item => {
              const deadlineDate = item.deadline ? new Date(item.deadline) : null;
              const formattedDate = deadlineDate
                ? deadlineDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                : 'No date';

              const isOverdue = deadlineDate && deadlineDate.getTime() < Date.now();

              return (
                <div
                  key={item.id}
                  onClick={() => navigateToTask(item.id)}
                  className="group cursor-pointer p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/70 border border-white/[0.06] hover:border-slate-700 transition-all flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {item.title}
                    </div>
                    <VerificationBadge confidence={item.confidence} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                    <span className="text-slate-300 font-medium">{item.owner_name}</span>
                    <div className="flex items-center gap-2">
                      <PostponementBadge count={item.postponement_count} />
                      <span
                        className={`flex items-center gap-1 font-mono text-[10px] ${
                          isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        <ClockIcon size={11} />
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/[0.06] text-[11px] text-slate-400 font-mono">
        Consecutive standup sync with pgvector 1536-dim embeddings.
      </div>
    </div>
  );
};
