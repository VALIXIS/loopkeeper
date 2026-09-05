import React from 'react';
import { useApp } from '../../context/AppContext';
import { ClockIcon, CalendarIcon, ArrowRightIcon } from '../common/Icons';
import { PostponementBadge, VerificationBadge } from '../common/Badge';

export const UpcomingDeadlinesCard: React.FC = () => {
  const { dashboardOverview, navigateToTask, setActiveTab } = useApp();

  const deadlines = dashboardOverview?.upcoming_deadlines || [];

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Upcoming Deadlines</h3>
              <p className="text-[11px] text-zinc-400">Target commitments ordered by proximity</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group"
          >
            <span>All Items</span>
            <ArrowRightIcon size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* List of deadlines */}
        <div className="mt-4 space-y-2.5">
          {deadlines.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
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
                  className="group cursor-pointer p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {item.title}
                    </div>
                    <VerificationBadge confidence={item.confidence} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                    <span className="text-zinc-300 font-medium">{item.owner_name}</span>
                    <div className="flex items-center gap-2">
                      <PostponementBadge count={item.postponement_count} />
                      <span
                        className={`flex items-center gap-1 font-mono text-[10px] ${
                          isOverdue ? 'text-rose-400 font-bold' : 'text-zinc-400'
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

      <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400">
        Continuous calendar tracking linked with pgvector deduplication.
      </div>
    </div>
  );
};
