import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PostponementBadge } from '../common/Badge';
import {
  ArrowRightIcon,
  ActivityIcon,
  ClockIcon
} from '../common/Icons';

export const WorkloadDashboard: React.FC = () => {
  const { actionItems, navigateToTask } = useApp();
  const { employees } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const memberTasks = selectedMemberId
    ? actionItems.filter(a => a.owner_employee_id === selectedMemberId)
    : [];

  const selectedMember = employees.find(e => e.id === selectedMemberId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
            <ActivityIcon size={14} className="text-cyan-400" />
            Live Capacity Radar
          </span>
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
            Distributed Execution Balancer
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
          Team Workload & Cognitive Capacity
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Real-time cognitive load index, overdue task ratios, and bottleneck detection across engineering, design, and architecture leads.
        </p>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => {
          const empItems = actionItems.filter(a => a.owner_employee_id === emp.id);
          const openCount = empItems.filter(a => a.status === 'pending').length;
          const overdueCount = empItems.filter(a => a.status === 'overdue').length;
          const completedCount = empItems.filter(a => a.status === 'done').length;
          const postponedCount = empItems.filter(a => (a.postponement_count || 0) >= 2).length;

          const workloadScore = Number((openCount * 1.5 + overdueCount * 3.0 + postponedCount * 2.0).toFixed(1));
          const isOverloaded = workloadScore >= 5 || overdueCount >= 1;
          const isSelected = selectedMemberId === emp.id;

          return (
            <div
              key={emp.id}
              onClick={() => setSelectedMemberId(isSelected ? null : emp.id)}
              className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 shadow-lg flex flex-col justify-between gap-4 hover:-translate-y-0.5 ${
                isSelected
                  ? 'bg-indigo-950/40 border-cyan-400 ring-2 ring-cyan-500/40 shadow-cyan-500/20'
                  : isOverloaded
                  ? 'glass-panel border-amber-600/40 hover:border-amber-400 hover:shadow-amber-500/10'
                  : 'glass-panel border-zinc-800 hover:border-zinc-700 hover:shadow-cyan-500/5'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={emp.avatar_url}
                        alt={emp.name}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-cyan-400 transition-all shadow-md"
                      />
                      {isOverloaded && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-500 rounded-full border-2 border-zinc-950 flex items-center justify-center animate-ping" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-medium">{emp.role}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      workloadScore >= 8 || overdueCount >= 2
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : workloadScore >= 5 || overdueCount >= 1
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {workloadScore >= 8 || overdueCount >= 2
                      ? 'Critical'
                      : workloadScore >= 5 || overdueCount >= 1
                      ? 'High Load'
                      : 'Balanced'}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="mt-4 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Workload Index</span>
                    <span className="font-mono font-bold text-cyan-400">{workloadScore} / 10.0</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        workloadScore >= 7
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-sm shadow-rose-500/50'
                          : workloadScore >= 4
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, workloadScore * 10)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task Counters Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-zinc-800">
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-900">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Active</span>
                  <span className="font-mono font-bold text-zinc-200">{openCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-900">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Overdue</span>
                  <span
                    className={`font-mono font-bold ${
                      overdueCount > 0 ? 'text-rose-400' : 'text-zinc-400'
                    }`}
                  >
                    {overdueCount}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-900">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Done</span>
                  <span className="font-mono font-bold text-emerald-400">{completedCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drilldown Drawer for Selected Member */}
      {selectedMember && (
        <div className="p-6 rounded-3xl glass-panel-elevated border border-cyan-500/40 space-y-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <img
                src={selectedMember.avatar_url}
                alt={selectedMember.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-400 shadow-md"
              />
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  Assigned Commitments for {selectedMember.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  {memberTasks.length} total tasks tracked across all meetings
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMemberId(null)}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Close Drilldown
            </button>
          </div>

          <div className="space-y-2.5">
            {memberTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                No active commitments assigned to this member.
              </div>
            ) : (
              memberTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => navigateToTask(task.id)}
                  className="group cursor-pointer p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 hover:border-cyan-500/50 flex items-center justify-between gap-4 transition-all hover:-translate-x-0.5"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.status} size="sm" />
                      <PostponementBadge count={task.postponement_count} />
                    </div>
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300 transition-colors">
                      {task.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                      <ClockIcon size={12} />
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'No date'}
                    </span>
                    <ArrowRightIcon size={14} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
