import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { TaskStatus, ActionItem } from '../../types';
import { StatusBadge, PostponementBadge, VerificationBadge, MatchDecisionBadge } from '../common/Badge';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import {
  CheckSquareIcon,
  SearchIcon,
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  ArrowRightIcon,
  SparklesIcon,
  TrashIcon
} from '../common/Icons';

interface ActionItemListProps {
  onSelectTask: (taskId: string) => void;
  defaultFilter?: 'all' | 'pending' | 'overdue' | 'done' | 'postponed';
}

export const ActionItemList: React.FC<ActionItemListProps> = ({
  onSelectTask,
  defaultFilter = 'all'
}) => {
  const { actionItems, updateTask, deleteTask } = useApp();
  const { employees, isManager, currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>(defaultFilter);
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = actionItems.filter(item => {
    // Employee Task Scoping (Employees only see their own tasks)
    if (!isManager) {
      const isMine =
        item.owner_employee_id === currentUser.id ||
        item.owner_name?.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
        (item as any).assigned_to?.toLowerCase().trim() === currentUser.name.toLowerCase().trim();
      if (!isMine) return false;
    }

    // Status filter
    if (statusFilter === 'postponed') {
      if ((item.postponement_count || 0) < 1) return false;
    } else if (statusFilter !== 'all') {
      if (item.status !== statusFilter) return false;
    }

    // Owner filter (Managers only)
    if (isManager && ownerFilter !== 'all' && item.owner_employee_id !== ownerFilter) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchOwner = item.owner_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchOwner) return false;
    }

    return true;
  });

  const handleToggleDone = async (e: React.MouseEvent, item: ActionItem) => {
    e.stopPropagation();
    const newStatus: TaskStatus = item.status === 'done' ? 'pending' : 'done';
    await updateTask(item.id, { status: newStatus });
  };

  const handleDeleteTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this commitment?')) {
      await deleteTask(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CheckSquareIcon size={24} className="text-cyan-400" />
            Meeting Commitments
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cross-meeting extracted commitments with vector deduplication, ownership, and state tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl glass-panel text-xs font-mono text-zinc-300 border border-zinc-800 flex items-center gap-2">
            <SparklesIcon size={14} className="text-cyan-400" />
            Active Commitments: <strong className="text-cyan-400">{actionItems.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-zinc-800 space-y-4 shadow-lg">
        {/* Top filter row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-medium">
            {[
              { id: 'all', label: 'All Commitments' },
              { id: 'pending', label: 'In Progress' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'done', label: 'Completed' },
              { id: 'postponed', label: 'Postponed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Owner Filter (Managers) vs Scoped Badge (Employees) */}
          <div className="flex items-center gap-2">
            {isManager ? (
              <>
                <UsersIcon size={14} className="text-zinc-400" />
                <select
                  value={ownerFilter}
                  onChange={e => setOwnerFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="all">All Team Assignees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300">
                <UsersIcon size={14} className="text-cyan-400" />
                <span>My Scoped Tasks ({currentUser.name})</span>
              </div>
            )}
          </div>
        </div>

        {/* Search row */}
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search commitments by keyword, assignee, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 rounded-2xl glass-panel border border-zinc-800 text-zinc-400 text-xs">
            No commitments match the active filters.
          </div>
        ) : (
          filteredItems.map(item => {
            const isDone = item.status === 'done';
            const deadlineDate = item.deadline ? new Date(item.deadline) : null;
            const formattedDeadline = deadlineDate
              ? deadlineDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Unspecified';

            return (
              <div
                key={item.id}
                onClick={() => onSelectTask(item.id)}
                className={`group cursor-pointer rounded-2xl p-5 border transition-all duration-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-0.5 ${
                  isDone
                    ? 'bg-zinc-950/60 border-zinc-800/80 opacity-75 hover:opacity-100'
                    : item.status === 'overdue'
                    ? 'bg-rose-950/20 border-rose-600/40 hover:border-rose-500 hover:shadow-rose-500/10'
                    : 'glass-panel border-zinc-800 hover:border-cyan-500/50 hover:shadow-cyan-500/10'
                }`}
              >
                {/* Checkbox and Main Info */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={e => handleToggleDone(e, item)}
                    className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/40'
                        : 'border-zinc-600 hover:border-cyan-400 bg-zinc-950'
                    }`}
                    title={isDone ? 'Mark in progress' : 'Mark completed'}
                  >
                    {isDone && <CheckCircleIcon size={14} className="fill-current" />}
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} size="sm" />
                      <VerificationBadge confidence={item.confidence} />
                      <MatchDecisionBadge decision={item.match_decision} />
                      <PostponementBadge count={item.postponement_count} />
                    </div>

                    <h3
                      className={`text-sm font-bold transition-colors ${
                        isDone
                          ? 'line-through text-zinc-500'
                          : 'text-zinc-100 group-hover:text-cyan-300'
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                      <span className="flex items-center gap-1.5 text-zinc-300 font-medium bg-zinc-900/70 px-2 py-0.5 rounded-md border border-zinc-800">
                        <UsersIcon size={12} className="text-cyan-400" />
                        {item.owner_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-zinc-400">
                        <ClockIcon size={12} />
                        {formattedDeadline}
                      </span>
                      {item.meeting_title && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400 font-medium">
                            {item.meeting_title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Metrics & CTA */}
                <div className="flex items-center md:flex-col items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-28">
                      <ConfidenceMeter score={item.confidence} size="sm" />
                    </div>
                    <button
                      onClick={e => handleDeleteTask(e, item.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete commitment"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Audit & Details</span>
                    <ArrowRightIcon size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
