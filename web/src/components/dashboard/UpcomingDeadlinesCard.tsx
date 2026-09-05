import React from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../context/RouterContext';
import { ClockIcon, CalendarIcon, ArrowRightIcon } from '../common/Icons';
import { PostponementBadge, VerificationBadge } from '../common/Badge';

export const UpcomingDeadlinesCard: React.FC = () => {
  const { dashboardOverview } = useApp();
  const { navigate, navigateToCommitment } = useRouter();

  const deadlines = dashboardOverview?.upcoming_deadlines || [];

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-white/[0.08] p-4 shadow-lg flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <CalendarIcon size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Upcoming Deadlines</h3>
              <p className="text-[10px] text-slate-400">Target commitments by proximity</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/commitments')}
            className="text-xs text-indigo-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group transition-colors"
          >
            <span>All Items</span>
            <ArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* List of deadlines */}
        <div className="mt-3 space-y-2">
          {deadlines.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
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
                  onClick={() => navigateToCommitment(item.id)}
                  className="group cursor-pointer p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/70 border border-white/[0.06] hover:border-slate-700 transition-all flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {item.title}
                    </div>
                    <VerificationBadge confidence={item.confidence} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-slate-300 font-medium">{item.owner_name}</span>
                    <div className="flex items-center gap-2">
                      <PostponementBadge count={item.postponement_count} />
                      <span
                        className={`flex items-center gap-1 font-mono text-[10px] ${
                          isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        <ClockIcon size={10} />
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
    </div>
  );
};
