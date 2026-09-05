import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PostponementBadge } from '../common/Badge';
import {
  ArrowRightIcon,
  ActivityIcon,
  ClockIcon,
  SparklesIcon,
  RefreshCwIcon,
  CheckCircleIcon
} from '../common/Icons';

export const WorkloadDashboard: React.FC = () => {
  const { actionItems, updateTask, navigateToTask, addToast } = useApp();
  const { employees } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceResult, setRebalanceResult] = useState<{
    reassignedCount: number;
    fromName: string;
    toName: string;
  } | null>(null);

  const memberTasks = selectedMemberId
    ? actionItems.filter(a => a.owner_employee_id === selectedMemberId)
    : [];

  const selectedMember = employees.find(e => e.id === selectedMemberId);

  // Identify overloaded members
  const overloadedMembers = employees.filter(emp => {
    const empItems = actionItems.filter(a => a.owner_employee_id === emp.id);
    const openCount = empItems.filter(a => a.status === 'pending').length;
    const overdueCount = empItems.filter(a => a.status === 'overdue').length;
    return openCount >= 3 || overdueCount >= 1;
  });

  const availableMembers = employees.filter(emp => {
    const empItems = actionItems.filter(a => a.owner_employee_id === emp.id);
    const openCount = empItems.filter(a => a.status === 'pending').length;
    const overdueCount = empItems.filter(a => a.status === 'overdue').length;
    return openCount <= 1 && overdueCount === 0;
  });

  const handleRunAiRebalancer = async () => {
    if (overloadedMembers.length === 0) {
      addToast({
        type: 'info',
        title: 'Workload Optimal',
        message: 'All team members are operating within balanced cognitive capacity limits.'
      });
      return;
    }

    setIsRebalancing(true);
    setRebalanceResult(null);

    const sourceMember = overloadedMembers[0];
    const targetMember = availableMembers[0] || employees.find(e => e.id !== sourceMember.id);

    // Find pending tasks assigned to overloaded member
    const reassignableTasks = actionItems.filter(
      a => a.owner_employee_id === sourceMember.id && a.status === 'pending'
    );

    setTimeout(async () => {
      let count = 0;
      if (targetMember && reassignableTasks.length > 0) {
        // Reassign up to 2 tasks
        const tasksToMove = reassignableTasks.slice(0, 2);
        for (const t of tasksToMove) {
          await updateTask(t.id, {
            owner_employee_id: targetMember.id
          });
          count++;
        }
      }

      setIsRebalancing(false);
      if (count > 0 && targetMember) {
        setRebalanceResult({
          reassignedCount: count,
          fromName: sourceMember.name,
          toName: targetMember.name
        });
        addToast({
          type: 'success',
          title: 'AI Workload Rebalancing Complete',
          message: `Reallocated ${count} task(s) from ${sourceMember.name} ➔ ${targetMember.name}. Capacity index restored to normal.`
        });
      } else {
        addToast({
          type: 'info',
          title: 'Workload Analyzed',
          message: 'No pending tasks required reallocation.'
        });
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Sleek Compact Header Bar */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-cyan-500/30 p-4 sm:px-5 sm:py-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm shrink-0">
            <ActivityIcon size={14} className="text-cyan-600 dark:text-cyan-400" />
            Live Capacity Radar
          </span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Team Workload & Cognitive Capacity
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAiRebalancer}
            disabled={isRebalancing}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isRebalancing ? (
              <RefreshCwIcon size={13} className="animate-spin text-cyan-300" />
            ) : (
              <SparklesIcon size={13} className="text-amber-300" />
            )}
            <span>AI Workload Rebalancer</span>
          </button>
        </div>
      </div>

      {/* AI Rebalance Result Alert */}
      {rebalanceResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-md animate-fade-in-up">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon size={18} className="text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Automated Reallocation Complete: </span>
              Moved {rebalanceResult.reassignedCount} pending task(s) from <span className="font-bold text-rose-300">{rebalanceResult.fromName}</span> to <span className="font-bold text-cyan-300">{rebalanceResult.toName}</span> to prevent team burnout.
            </div>
          </div>
          <button
            onClick={() => setRebalanceResult(null)}
            className="text-[11px] font-bold text-zinc-400 hover:text-zinc-200"
          >
            Dismiss
          </button>
        </div>
      )}

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
                  ? 'bg-indigo-900/10 dark:bg-indigo-950/40 border-cyan-500 ring-2 ring-cyan-500/40 shadow-cyan-500/20'
                  : isOverloaded
                  ? 'glass-panel border-amber-600/40 hover:border-amber-400 hover:shadow-amber-500/10'
                  : 'glass-panel border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-cyan-500/5'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-bold text-base ring-2 ring-slate-300 dark:ring-zinc-700 group-hover:ring-cyan-400 transition-all shadow-md shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      {isOverloaded && (
                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center animate-ping" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{emp.role}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      workloadScore >= 8 || overdueCount >= 2
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 animate-pulse'
                        : workloadScore >= 5 || overdueCount >= 1
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
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
                <div className="mt-4 p-3 rounded-xl bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">Workload Index</span>
                    <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400">{workloadScore} / 10.0</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-zinc-800">
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
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-200 dark:border-zinc-800">
                <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-900">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Active</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{openCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-900">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Overdue</span>
                  <span
                    className={`font-mono font-bold ${
                      overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {overdueCount}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-900">
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Done</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drilldown Drawer for Selected Member */}
      {selectedMember && (
        <div className="p-6 rounded-3xl glass-panel-elevated border border-cyan-500/40 space-y-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-bold text-sm ring-2 ring-cyan-400 shadow-md shrink-0">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  Assigned Commitments for {selectedMember.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {memberTasks.length} total tasks tracked across all meetings
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMemberId(null)}
              className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Close Drilldown
            </button>
          </div>

          <div className="space-y-2.5">
            {memberTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-zinc-500">
                No active commitments assigned to this member.
              </div>
            ) : (
              memberTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => navigateToTask(task.id)}
                  className="group cursor-pointer p-3.5 rounded-xl bg-slate-100/90 dark:bg-zinc-950/90 border border-slate-200 dark:border-zinc-800 hover:border-cyan-500/50 flex items-center justify-between gap-4 transition-all hover:-translate-x-0.5"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.status} size="sm" />
                      <PostponementBadge count={task.postponement_count} />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                      {task.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                      <ClockIcon size={12} />
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'No date'}
                    </span>
                    <ArrowRightIcon size={14} className="text-cyan-500 dark:text-cyan-400 group-hover:translate-x-1 transition-transform" />
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
