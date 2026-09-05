import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { ActionItemDetail, TaskStatus } from '../../types';
import { TaskHistoryTimeline } from './TaskHistoryTimeline';
import { StatusBadge, PostponementBadge, VerificationBadge, MatchDecisionBadge } from '../common/Badge';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import {
  CheckCircleIcon,
  ClockIcon,
  HistoryIcon,
  UsersIcon,
  SparklesIcon,
  ArrowRightIcon,
  FileTextIcon
} from '../common/Icons';

interface ActionItemDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActionItemDetailModal: React.FC<ActionItemDetailModalProps> = ({
  taskId,
  isOpen,
  onClose
}) => {
  const { employees } = useAuth();
  const { updateTask, navigateToMeeting } = useApp();

  const [detail, setDetail] = useState<ActionItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!taskId || !isOpen) return;
    setLoading(true);
    api
      .getActionItemDetail(taskId)
      .then(data => {
        setDetail(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setOwnerId(data.owner_employee_id || '');
        setDeadline(
          data.deadline ? new Date(data.deadline).toISOString().slice(0, 16) : ''
        );
        setStatus(data.status);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [taskId, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !detail) return;
    setSaving(true);
    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        owner_employee_id: ownerId || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        status
      });
      const refreshed = await api.getActionItemDetail(taskId);
      setDetail(refreshed);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (newStatus: TaskStatus) => {
    if (!taskId || !detail) return;
    setSaving(true);
    try {
      await updateTask(taskId, { status: newStatus });
      const refreshed = await api.getActionItemDetail(taskId);
      setDetail(refreshed);
      setStatus(newStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commitment Intelligence & Timeline"
      subtitle={detail ? `Originating Meeting: ${detail.originating_meeting?.title || detail.meeting_title || 'Meeting'}` : ''}
      maxWidth="4xl"
    >
      {loading || !detail ? (
        <div className="py-16 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <div className="text-xs text-zinc-400 font-mono">Loading task timeline and vector match data...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Status & Controls Header */}
          <div className="p-4 rounded-2xl glass-panel border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              <VerificationBadge confidence={detail.confidence} />
              <MatchDecisionBadge decision={detail.match_decision} />
              <PostponementBadge count={detail.postponement_count} />
            </div>

            <div className="flex items-center gap-2">
              {detail.status !== 'done' ? (
                <button
                  onClick={() => handleQuickStatus('done')}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-colors shadow-sm shadow-emerald-500/20"
                >
                  <CheckCircleIcon size={14} />
                  <span>Mark as Done</span>
                </button>
              ) : (
                <button
                  onClick={() => handleQuickStatus('pending')}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
                >
                  <ClockIcon size={14} />
                  <span>Reopen Task</span>
                </button>
              )}

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Details'}
              </button>
            </div>
          </div>

          {/* Form or View Section */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Commitment Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Description & Context</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Assignee</label>
                  <select
                    value={ownerId}
                    onChange={e => setOwnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Target Deadline</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="pending">In Progress (Pending)</option>
                    <option value="done">Completed (Done)</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Commitment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-100">{detail.title}</h2>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {detail.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <UsersIcon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold tracking-wider">
                      Assignee
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {detail.owner_name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <ClockIcon size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold tracking-wider">
                      Target Deadline
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-200">
                      {detail.deadline
                        ? new Date(detail.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <ConfidenceMeter score={detail.confidence} />
                </div>
              </div>

              {detail.source_text && (
                <div className="p-4 rounded-2xl bg-zinc-950/90 border border-cyan-500/30 space-y-1.5 shadow-inner">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <SparklesIcon size={12} />
                    Verbatim Transcript Evidence Anchor
                  </span>
                  <div className="text-xs text-zinc-200 font-mono italic leading-relaxed flex items-start gap-2">
                    <span className="text-cyan-400 not-italic font-bold">❝</span>
                    <span className="flex-1">{detail.source_text}</span>
                    <span className="text-cyan-400 not-italic font-bold">❞</span>
                  </div>
                </div>
              )}

              {detail.originating_meeting && (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <FileTextIcon size={16} className="text-indigo-400" />
                    <span>Originating Meeting:</span>
                    <span className="font-semibold text-zinc-200">
                      {detail.originating_meeting.title}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigateToMeeting(detail.originating_meeting!.id);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group"
                  >
                    <span>View Meeting</span>
                    <ArrowRightIcon size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Audit History Timeline */}
          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <HistoryIcon size={16} className="text-amber-400" />
                Cross-Meeting State Evolution Timeline
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {detail.history?.length || 0} events logged
              </span>
            </div>

            <TaskHistoryTimeline history={detail.history || []} />
          </div>
        </div>
      )}
    </Modal>
  );
};
