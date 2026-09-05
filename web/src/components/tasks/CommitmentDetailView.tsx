import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
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
  FileTextIcon,
  ExternalLinkIcon
} from '../common/Icons';

export const CommitmentDetailView: React.FC = () => {
  const { route, navigateToMeeting, navigate } = useRouter();
  const { employees } = useAuth();
  const { updateTask } = useApp();

  const taskId = route.params.commitmentId;
  const [detail, setDetail] = useState<ActionItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!taskId) return;
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
  }, [taskId]);

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

  if (loading || !detail) {
    return (
      <div className="py-24 text-center space-y-4 animate-fade-in-up">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
        <div className="text-sm font-mono text-zinc-400">Loading commitment lifecycle, evidence, and history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
        <button
          onClick={() => navigate('/commitments')}
          className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-semibold"
        >
          <span>← Back to Commitments</span>
        </button>
        <span className="font-mono text-[11px] text-zinc-500">ID: {detail.id}</span>
      </div>

      {/* Top Header Card */}
      <div className="p-6 rounded-3xl glass-panel-elevated border border-indigo-500/30 space-y-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={detail.status} />
            <VerificationBadge confidence={detail.confidence} />
            <MatchDecisionBadge decision={detail.match_decision} />
            <PostponementBadge count={detail.postponement_count} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <ExternalLinkIcon size={12} />
              Jira: PAY-142
            </span>
          </div>

          <div className="flex items-center gap-2">
            {detail.status !== 'done' ? (
              <button
                onClick={() => handleQuickStatus('done')}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all shadow-sm"
              >
                <CheckCircleIcon size={14} />
                <span>Mark as Done</span>
              </button>
            ) : (
              <button
                onClick={() => handleQuickStatus('pending')}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
              >
                <ClockIcon size={14} />
                <span>Reopen Commitment</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Commitment Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Description & Context</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Assignee</label>
                <select
                  value={ownerId}
                  onChange={e => setOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-zinc-100">{detail.title}</h1>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
              {detail.description || 'Action item extracted from conversational meeting discussion.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <UsersIcon size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Owner & Assignee
                  </span>
                  <span className="text-sm font-semibold text-zinc-200">
                    {detail.owner_name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <ClockIcon size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Target Deadline
                  </span>
                  <span className="text-sm font-mono font-semibold text-zinc-200">
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

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <ConfidenceMeter score={detail.confidence} />
              </div>
            </div>

            {/* Verbatim Transcript Quote Anchor */}
            {detail.source_text && (
              <div className="p-5 rounded-3xl bg-zinc-950/90 border border-cyan-500/30 space-y-2 shadow-inner">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <SparklesIcon size={14} />
                  Verbatim Transcript Evidence Anchor
                </span>
                <div className="text-xs text-zinc-200 font-mono italic leading-relaxed flex items-start gap-2">
                  <span className="text-cyan-400 not-italic font-bold text-base">❝</span>
                  <span className="flex-1">{detail.source_text}</span>
                  <span className="text-cyan-400 not-italic font-bold text-base">❞</span>
                </div>
              </div>
            )}

            {/* Originating Meeting Card */}
            {detail.originating_meeting && (
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-zinc-400">
                  <FileTextIcon size={18} className="text-indigo-400" />
                  <span>Originating Meeting:</span>
                  <span className="font-bold text-zinc-200">
                    {detail.originating_meeting.title}
                  </span>
                </div>
                <button
                  onClick={() => navigateToMeeting(detail.originating_meeting!.id)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 group"
                >
                  <span>Open Full Transcript & Video</span>
                  <ArrowRightIcon size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cross-Meeting State Evolution Timeline */}
      <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <HistoryIcon size={18} className="text-amber-400" />
            Cross-Meeting State Evolution & Drift Audit
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            {detail.history?.length || 0} Audit Events
          </span>
        </div>

        <TaskHistoryTimeline history={detail.history || []} />
      </div>
    </div>
  );
};
