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
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-zinc-950 border border-indigo-500/40 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5">
              <SparklesIcon size={14} />
              Signature Architectural Feature
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Zoom In"
            >
              <ZoomInIcon size={16} />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOutIcon size={16} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Reset View"
            >
              <Maximize2Icon size={16} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-3">
          <NetworkIcon size={28} className="text-cyan-400" />
          The Accountability Graph
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          The signature visual map designed by Jyothsna. Traces conversational commitments from the originating meeting through assignment, deadline evolutions, consecutive standup revisions, and final delivery outcomes.
        </p>

        {/* Legend */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-zinc-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Meeting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Commitment
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400" /> Owner
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Deadline / Changes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Outcome
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs">Filter by Owner:</span>
            <select
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
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
        className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 overflow-x-auto shadow-2xl relative"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {/* Step Columns Headers */}
        <div className="min-w-[1000px] grid grid-cols-6 gap-4 pb-4 border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 text-center">
          <div className="flex items-center justify-center gap-1 text-indigo-400">
            <CalendarIcon size={14} />
            <span>1. Meeting</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-cyan-400">
            <SparklesIcon size={14} />
            <span>2. Commitment</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-purple-400">
            <UsersIcon size={14} />
            <span>3. Owner</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-400">
            <ClockIcon size={14} />
            <span>4. Deadline</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-rose-400">
            <AlertTriangleIcon size={14} />
            <span>5. Changes & Drift</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-emerald-400">
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
                className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-300 grid grid-cols-6 gap-3 items-center ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 border-cyan-500/80 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                {/* 1. Meeting Node */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-indigo-500/30 text-left space-y-1">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold block truncate">
                    {origin?.source.toUpperCase() || 'MEETING'}
                  </span>
                  <div className="text-xs font-bold text-zinc-200 truncate" title={origin?.title}>
                    {origin?.title || item.meeting_title || 'Meeting'}
                  </div>
                  <span className="text-[10px] text-zinc-500 block font-mono">
                    {origin ? new Date(origin.meeting_date).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* 2. Commitment Node */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-cyan-500/30 text-left space-y-1">
                  <div className="text-xs font-bold text-zinc-100 line-clamp-2" title={item.title}>
                    {item.title}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono block">
                    {Math.round(item.confidence * 100)}% Conf
                  </span>
                </div>

                {/* 3. Owner Node */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-purple-500/30 text-center space-y-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center mx-auto">
                    {item.owner_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 truncate">
                    {item.owner_name}
                  </div>
                </div>

                {/* 4. Deadline Node */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Target</span>
                  <div className="text-xs font-mono font-bold text-amber-300">
                    {item.deadline
                      ? new Date(item.deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'None'}
                  </div>
                </div>

                {/* 5. Changes & Drift Node */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  {hasPostponement ? (
                    <div className="space-y-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 block">
                        {item.postponement_count}x Postponed
                      </span>
                      <span className="text-[10px] text-zinc-500 block">Deadline Drifted</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 block">
                        No Slippage
                      </span>
                      <span className="text-[10px] text-zinc-500 block">On Initial Schedule</span>
                    </div>
                  )}
                </div>

                {/* 6. Outcome Node */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-1">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isOverdue
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isDone ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'IN PROGRESS'}
                  </span>
                  <span className="text-[10px] text-zinc-500 block font-mono">
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
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <SparklesIcon size={18} className="text-cyan-400" />
              <h3 className="text-base font-bold text-zinc-100">
                Path Inspection: "{selectedItem.title}"
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateToTask(selectedItem.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <span>Full Audit Timeline</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Originating Meeting</span>
              <span className="text-zinc-200 font-bold block mt-1">
                {originMeeting?.title || selectedItem.meeting_title || 'Meeting'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Responsible Owner</span>
              <span className="text-zinc-200 font-bold block mt-1">
                {selectedItem.owner_name}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Deduplication Matching</span>
              <span className="text-cyan-400 font-bold block mt-1">
                {selectedItem.match_reason || 'Identified as new commitment'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block">Postponement History</span>
              <span
                className={`font-bold block mt-1 ${
                  (selectedItem.postponement_count || 0) >= 2 ? 'text-rose-400' : 'text-emerald-400'
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
