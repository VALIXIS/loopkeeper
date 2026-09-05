import React from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../context/RouterContext';
import { UsersIcon, AlertTriangleIcon, ArrowRightIcon } from '../common/Icons';

export const OverloadedMembersCard: React.FC = () => {
  const { dashboardOverview } = useApp();
  const { navigate } = useRouter();

  const members = dashboardOverview?.overloaded_members || [];

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-white/[0.08] p-4 shadow-lg flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <UsersIcon size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Team Workload & Risk</h3>
              <p className="text-[10px] text-slate-400">Cognitive load & slippage risk</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/workload')}
            className="text-xs text-indigo-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group transition-colors"
          >
            <span>Full Grid</span>
            <ArrowRightIcon size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Member Cards */}
        <div className="mt-3 space-y-2">
          {members.slice(0, 4).map(member => {
            let statusBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            let statusText = 'Balanced';

            if (member.status === 'critical' || member.overdue_task_count >= 2) {
              statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
              statusText = 'Critical';
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
                onClick={() => navigate('/workload')}
                className="group cursor-pointer flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/70 border border-white/[0.06] hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm">
                    {member.employee_name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {member.employee_name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{member.open_task_count} active</span>
                      {member.overdue_task_count > 0 && (
                        <span className="text-rose-400 font-semibold flex items-center gap-0.5 font-mono">
                          <AlertTriangleIcon size={10} />
                          {member.overdue_task_count} overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusBadge}`}>
                    {statusText}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {member.workload_score || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
