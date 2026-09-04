import React from 'react';
import { useApp } from '../../context/AppContext';
import { UsersIcon, AlertTriangleIcon, ArrowRightIcon } from '../common/Icons';

export const OverloadedMembersCard: React.FC = () => {
  const { dashboardOverview, setActiveTab } = useApp();

  const members = dashboardOverview?.overloaded_members || [];

  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UsersIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Team Workload & Capacity</h3>
              <p className="text-[11px] text-zinc-400">Calculated cognitive load & slippage risk</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('workload')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group"
          >
            <span>Full Grid</span>
            <ArrowRightIcon size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Member Cards */}
        <div className="mt-4 space-y-3">
          {members.slice(0, 4).map(member => {
            let statusBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            let statusText = 'Balanced';

            if (member.status === 'critical' || member.overdue_task_count >= 2) {
              statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
              statusText = 'Critical Overload';
            } else if (member.status === 'high' || member.overdue_task_count >= 1) {
              statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              statusText = 'High Load';
            } else if (member.open_task_count >= 3) {
              statusBadge = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
              statusText = 'Moderate';
            }

            return (
              <div
                key={member.employee_id}
                onClick={() => setActiveTab('workload')}
                className="group cursor-pointer flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                    {member.employee_name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 truncate">
                      {member.employee_name}
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>{member.open_task_count} active tasks</span>
                      {member.overdue_task_count > 0 && (
                        <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                          <AlertTriangleIcon size={10} />
                          {member.overdue_task_count} overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                    {statusText}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {member.workload_score || 0}
                    </span>
                    <span className="text-[9px] text-zinc-500 block">score</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>AI Engine recalculates risk index after each transcript sync.</span>
      </div>
    </div>
  );
};
