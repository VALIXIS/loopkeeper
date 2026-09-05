import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquareIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  HistoryIcon,
  ArrowRightIcon
} from '../common/Icons';

export const MetricsGrid: React.FC = () => {
  const { dashboardOverview, setActiveTab } = useApp();

  const totalOpen = dashboardOverview?.total_open_tasks || 0;
  const overdue = dashboardOverview?.overdue_tasks || 0;
  const completed = dashboardOverview?.completed_tasks || 0;
  const postponed = dashboardOverview?.repeatedly_postponed_tasks || 0;

  const totalAll = totalOpen + overdue + completed;
  const completionRate = totalAll > 0 ? Math.round((completed / totalAll) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Open Tasks Card */}
      <div
        onClick={() => setActiveTab('tasks')}
        className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-5 border border-zinc-800 hover:border-indigo-500/50 transition-all duration-200 shadow-lg hover:shadow-indigo-500/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
            Active Commitments
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <CheckSquareIcon size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-zinc-100 font-mono">
            {totalOpen}
          </span>
          <span className="text-xs text-zinc-400">commitments</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-indigo-400 font-medium">
          <span>View all in pipeline</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 2. Overdue Tasks Card */}
      <div
        onClick={() => setActiveTab('tasks')}
        className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-5 border transition-all duration-200 shadow-lg ${
          overdue > 0
            ? 'border-rose-600/40 hover:border-rose-500 hover:shadow-rose-500/20'
            : 'border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
            Overdue Commitments
          </span>
          <div
            className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${
              overdue > 0
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            <AlertTriangleIcon size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span
            className={`text-3xl font-black tracking-tight font-mono ${
              overdue > 0 ? 'text-rose-400' : 'text-zinc-100'
            }`}
          >
            {overdue}
          </span>
          <span className="text-xs text-zinc-400">slipping</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-rose-400 font-medium">
          <span>{overdue > 0 ? 'Action required immediately' : 'Zero overdue items'}</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 3. Completed Tasks Card */}
      <div
        onClick={() => setActiveTab('tasks')}
        className="group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-5 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-200 shadow-lg hover:shadow-emerald-500/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
            Completed Commitments
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <CheckCircleIcon size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-emerald-400 font-mono">
            {completed}
          </span>
          <span className="text-xs text-zinc-400">({completionRate}% rate)</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 font-medium">
          <span>Verified deliverable rate</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 4. Repeatedly Postponed Card */}
      <div
        onClick={() => setActiveTab('radar')}
        className={`group cursor-pointer relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-5 border transition-all duration-200 shadow-lg ${
          postponed > 0
            ? 'border-amber-600/40 hover:border-amber-500 hover:shadow-amber-500/20'
            : 'border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
            Postponement Radar
          </span>
          <div
            className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${
              postponed > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            <HistoryIcon size={18} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span
            className={`text-3xl font-black tracking-tight font-mono ${
              postponed > 0 ? 'text-amber-300' : 'text-zinc-100'
            }`}
          >
            {postponed}
          </span>
          <span className="text-xs text-zinc-400">delayed ≥ 2 times</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-amber-300 font-medium">
          <span>View Chronic Slippage Radar</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
