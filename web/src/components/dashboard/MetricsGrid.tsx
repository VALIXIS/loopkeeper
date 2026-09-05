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
        className="group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-900/80 p-5 border border-white/[0.08] hover:border-indigo-500/60 transition-all duration-200 shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Active Commitments
          </span>
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 group-hover:scale-110 transition-transform shadow-inner">
            <CheckSquareIcon size={17} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-white font-mono">
            {totalOpen}
          </span>
          <span className="text-xs text-slate-400 font-medium">in flight</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-indigo-400 font-semibold pt-3 border-t border-white/[0.04]">
          <span>View all in pipeline</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 2. Overdue Tasks Card */}
      <div
        onClick={() => setActiveTab('tasks')}
        className={`group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-900/80 p-5 border transition-all duration-200 shadow-xl hover:-translate-y-1 backdrop-blur-xl ${
          overdue > 0
            ? 'border-rose-500/50 hover:border-rose-400 hover:shadow-rose-500/15 bg-gradient-to-br from-rose-950/20 to-slate-900/90'
            : 'border-white/[0.08] hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Overdue Commitments
          </span>
          <div
            className={`p-2.5 rounded-2xl border group-hover:scale-110 transition-transform shadow-inner ${
              overdue > 0
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            <AlertTriangleIcon size={17} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span
            className={`text-3xl font-black tracking-tight font-mono ${
              overdue > 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {overdue}
          </span>
          <span className="text-xs text-slate-400 font-medium">slipping</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-rose-400 font-semibold pt-3 border-t border-white/[0.04]">
          <span>{overdue > 0 ? 'Immediate action required' : 'Zero overdue items'}</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 3. Completed Tasks Card */}
      <div
        onClick={() => setActiveTab('tasks')}
        className="group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-900/80 p-5 border border-white/[0.08] hover:border-emerald-500/60 transition-all duration-200 shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Completed Outcomes
          </span>
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 group-hover:scale-110 transition-transform shadow-inner">
            <CheckCircleIcon size={17} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-emerald-400 font-mono">
            {completed}
          </span>
          <span className="text-xs text-slate-400 font-medium font-mono">({completionRate}% rate)</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-emerald-400 font-semibold pt-3 border-t border-white/[0.04]">
          <span>Verified deliverable rate</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 4. Repeatedly Postponed Card */}
      <div
        onClick={() => setActiveTab('radar')}
        className={`group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-900/80 p-5 border transition-all duration-200 shadow-xl hover:-translate-y-1 backdrop-blur-xl ${
          postponed > 0
            ? 'border-amber-500/50 hover:border-amber-400 hover:shadow-amber-500/15 bg-gradient-to-br from-amber-950/20 to-slate-900/90'
            : 'border-white/[0.08] hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Postponement Radar
          </span>
          <div
            className={`p-2.5 rounded-2xl border group-hover:scale-110 transition-transform shadow-inner ${
              postponed > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            <HistoryIcon size={17} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span
            className={`text-3xl font-black tracking-tight font-mono ${
              postponed > 0 ? 'text-amber-300' : 'text-white'
            }`}
          >
            {postponed}
          </span>
          <span className="text-xs text-slate-400 font-medium">delayed ≥ 2 times</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-amber-300 font-semibold pt-3 border-t border-white/[0.04]">
          <span>View Chronic Slippage Radar</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
