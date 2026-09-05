import React from 'react';
import { useApp } from '../../context/AppContext';
import { UsersIcon, AlertTriangleIcon, ArrowRightIcon } from '../common/Icons';

export const OverloadedMembersCard: React.FC = () => {
  const { dashboardOverview, setActiveTab } = useApp();

  const members = dashboardOverview?.overloaded_members || [];

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-white/[0.08] p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
              <UsersIcon size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Team Workload & Capacity</h3>
              <p className="text-[11px] text-slate-400">Calculated cognitive load & slippage risk</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('workload')}
            className="text-xs text-indigo-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group transition-colors"
          >
            <span>Full Grid</span>
            <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Member Cards */}
        <div className="mt-4 space-y-2.5">
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
                className="group cursor-pointer flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/70 border border-white/[0.06] hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                    {member.employee_name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {member.employee_name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{member.open_task_count} active commitments</span>
                      {member.overdue_task_count > 0 && (
                        <span className="text-rose-400 font-semibold flex items-center gap-0.5 font-mono">
                          <AlertTriangleIcon size={10} />
                          {member.overdue_task_count} overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                    {statusText}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {member.workload_score || 0}
                    </span>
                    <span className="text-[9px] text-slate-500 block">score</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between font-mono">
        <span>AI Engine recalculates risk index dynamically</span>
        <span className="text-cyan-400">Real-time</span>
      </div>
    </div>
  );
};
