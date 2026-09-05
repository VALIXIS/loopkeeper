import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  NetworkIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  ZoomInIcon,
  ZoomOutIcon,
  Maximize2Icon,
  ArrowRightIcon
} from '../common/Icons';

export const AccountabilityGraph: React.FC = () => {
  const { actionItems, meetings, navigateToTask } = useApp();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(actionItems[0]?.id || null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterOwner, setFilterOwner] = useState<string>('all');

  const filteredItems = actionItems.filter(item => {
    if (filterOwner !== 'all' && item.owner_name !== filterOwner) return false;
    return true;
  });

  const selectedItem = actionItems.find(a => a.id === selectedTaskId) || actionItems[0];
  const originMeeting = meetings.find(m => m.id === selectedItem?.meeting_id);

  const ownersList = Array.from(new Set(actionItems.map(a => a.owner_name).filter(Boolean)));

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Sleek Compact Header Bar */}
      <div className="rounded-2xl glass-panel border border-indigo-500/40 p-4 sm:px-5 sm:py-3.5 shadow-lg space-y-3 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5 font-mono shrink-0">
              <NetworkIcon size={14} className="text-cyan-300" />
              Accountability Graph
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Cross-Meeting Node Lineage & Commitment Evolution
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.3))}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/[0.08] transition-colors shadow-sm"
              title="Zoom In"
            >
              <ZoomInIcon size={15} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.75))}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/[0.08] transition-colors shadow-sm"
              title="Zoom Out"
            >
              <ZoomOutIcon size={15} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/[0.08] transition-colors shadow-sm"
              title="Reset View"
            >
              <Maximize2Icon size={15} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs relative z-10">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" /> 1. Meeting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" /> 2. Commitment
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" /> 3. Owner
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" /> 4. Deadline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" /> 5. Drift
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" /> 6. Outcome
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 text-xs">Filter Assignee:</span>
            <select
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/[0.1] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
            >
              <option value="all">All Assignees</option>
              {ownersList.map(name => (
                <option key={name} value={name!}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div
        className="rounded-3xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200 dark:border-white/[0.08] p-6 overflow-x-auto shadow-2xl relative backdrop-blur-xl transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {/* Step Columns Headers */}
        <div className="min-w-[1000px] grid grid-cols-6 gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center font-mono">
          <div className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon size={14} />
            <span>1. Meeting</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-cyan-600 dark:text-cyan-400">
            <SparklesIcon size={14} />
            <span>2. Commitment</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-purple-600 dark:text-purple-400">
            <UsersIcon size={14} />
            <span>3. Owner</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
            <ClockIcon size={14} />
            <span>4. Deadline</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400">
            <AlertTriangleIcon size={14} />
            <span>5. Drift</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon size={14} />
            <span>6. Outcome</span>
          </div>
        </div>

        {/* Graph Rows */}
        <div className="min-w-[1000px] space-y-4 pt-6">
          {filteredItems.map(item => {
            const isSelected = item.id === selectedTaskId;
            const origin = meetings.find(m => m.id === item.meeting_id);
            const isDone = item.status === 'done';
            const isOverdue = item.status === 'overdue';
            const hasPostponement = (item.postponement_count || 0) > 0;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedTaskId(item.id)}
                className={`group cursor-pointer rounded-2xl p-3.5 border transition-all duration-300 grid grid-cols-6 gap-3 items-center relative ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-gradient-to-r dark:from-indigo-950/70 dark:via-slate-900/90 dark:to-slate-900 border-cyan-500 ring-2 ring-cyan-500/40 shadow-xl shadow-cyan-500/15 scale-[1.01]'
                    : 'glass-panel border-slate-200 dark:border-white/[0.06] hover:bg-slate-200/50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* 1. Meeting Node */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-indigo-500/30 text-left space-y-1 shadow-inner">
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold block truncate">
                    {origin?.source.toUpperCase() || 'MEETING'}
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate" title={origin?.title}>
                    {origin?.title || item.meeting_title || 'Meeting'}
                  </div>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {origin ? new Date(origin.meeting_date).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* 2. Commitment Node */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-cyan-500/30 text-left space-y-1 shadow-inner">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2" title={item.title}>
                    {item.title}
                  </div>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono block">
                    {Math.round(item.confidence * 100)}% Conf
                  </span>
                </div>

                {/* 3. Owner Node */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-purple-500/30 text-center space-y-1 shadow-inner">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center mx-auto shadow-sm">
                    {item.owner_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                    {item.owner_name}
                  </div>
                </div>

                {/* 4. Deadline Node */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-amber-500/30 text-center space-y-1 shadow-inner">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Target</span>
                  <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                    {item.deadline
                      ? new Date(item.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'None'}
                  </div>
                </div>

                {/* 5. Changes & Drift Node */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-white/[0.08] text-center space-y-1 shadow-inner">
                  {hasPostponement ? (
                    <div className="space-y-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 block font-mono">
                        {item.postponement_count}x Postponed
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Deadline Drifted</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 block font-mono">
                        No Slippage
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">On Schedule</span>
                    </div>
                  )}
                </div>

                {/* 6. Outcome Node */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-white/[0.08] text-center space-y-1 shadow-inner">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block font-mono ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                        : isOverdue
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isDone ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'IN PROGRESS'}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {isDone ? 'Verified Done' : 'Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedItem && (
        <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-2xl backdrop-blur-xl animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <SparklesIcon size={18} className="text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Path Inspection: "{selectedItem.title}"
              </h3>
            </div>

            <button
              onClick={() => navigateToTask(selectedItem.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Full Audit Timeline</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Originating Meeting</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold block mt-1">
                {originMeeting?.title || selectedItem.meeting_title || 'Meeting'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Responsible Owner</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold block mt-1">
                {selectedItem.owner_name}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Deduplication Matching</span>
              <span className="text-cyan-700 dark:text-cyan-400 font-bold block mt-1 font-mono">
                {selectedItem.match_reason || 'Identified as new commitment'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold text-[11px]">Postponement History</span>
              <span
                className={`font-bold block mt-1 font-mono ${
                  (selectedItem.postponement_count || 0) >= 2 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {(selectedItem.postponement_count || 0)} Recorded Slippage Events
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
