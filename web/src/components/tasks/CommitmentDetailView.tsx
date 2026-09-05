import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { ActionItemDetail, TaskStatus, TaskComment } from '../../types';
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
  ExternalLinkIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  NetworkIcon
} from '../common/Icons';

export const CommitmentDetailView: React.FC = () => {
  const { route, navigateToMeeting, navigate } = useRouter();
  const { employees, currentUser } = useAuth();
  const { updateTask, addToast } = useApp();

  const taskId = route.params.commitmentId;
  const [detail, setDetail] = useState<ActionItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // GitHub POW Simulation state
  const [isSimulatingPow, setIsSimulatingPow] = useState(false);
  const [simulatedPow, setSimulatedPow] = useState<{
    repository: string;
    pr_number: number;
    pr_title: string;
    pr_url: string;
    author: string;
    similarity_score: number;
    resolution_method: string;
  } | null>(null);

  // Comments & Risk Notes state
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'warning' | 'instruction'>('comment');

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
        setComments(data.comments || []);

        if (data.proof_of_work && data.proof_of_work.length > 0) {
          const firstPow = data.proof_of_work[0];
          setSimulatedPow({
            repository: firstPow.repository || 'metspy9069/loopkeeper',
            pr_number: firstPow.pr_number || 42,
            pr_title: firstPow.pr_title || `Fix ${data.title.toLowerCase()} implementation`,
            pr_url: firstPow.pr_url || 'https://github.com/metspy9069/loopkeeper/pull/42',
            author: firstPow.author_login || 'Subhash',
            similarity_score: firstPow.similarity_score || 0.914,
            resolution_method: firstPow.resolution_method || 'vector_similarity'
          });
        }
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

  const handleSimulateGitHubPow = async () => {
    if (!taskId || !detail) return;
    setIsSimulatingPow(true);

    setTimeout(async () => {
      const powData = {
        repository: 'metspy9069/loopkeeper',
        pr_number: 42,
        pr_title: `fix(core): ${detail.title.toLowerCase()} implementation & stability patch`,
        pr_url: 'https://github.com/metspy9069/loopkeeper/pull/42',
        author: currentUser?.name || 'Subhash',
        similarity_score: 0.914,
        resolution_method: 'vector_similarity'
      };

      setSimulatedPow(powData);
      await updateTask(taskId, { status: 'done' });
      const refreshed = await api.getActionItemDetail(taskId);
      setDetail(refreshed);
      setStatus('done');
      setIsSimulatingPow(false);

      addToast({
        type: 'success',
        title: 'GitHub PR Webhook Processed',
        message: `Task matched via Vector AI (0.914 similarity) and automatically transitioned to DONE!`
      });
    }, 1000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !newCommentText.trim()) return;
    try {
      const added = await api.addComment(
        taskId,
        currentUser?.name || 'Subhash',
        newCommentText.trim(),
        commentType
      );
      setComments(prev => [...prev, added]);
      setNewCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !detail) {
    return (
      <div className="py-20 text-center space-y-3 animate-fade-in-up">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <div className="text-xs font-mono text-zinc-400">Loading commitment lifecycle, evidence, and history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12 text-slate-900 dark:text-zinc-100 max-w-6xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
        <button
          onClick={() => navigate('/commitments')}
          className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 font-semibold text-[11px]"
        >
          <span>← Back to Commitments</span>
        </button>
        <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-500">ID: {detail.id}</span>
      </div>

      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel-elevated border border-indigo-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={detail.status} />
            <VerificationBadge confidence={detail.confidence} />
            <MatchDecisionBadge decision={detail.match_decision} />
            <PostponementBadge count={detail.postponement_count} />

            {simulatedPow && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircleIcon size={12} className="text-emerald-600 dark:text-emerald-400" />
                Proof of Work Verified (PR #{simulatedPow.pr_number})
              </span>
            )}

            {detail.jira_issue_key || (detail as any).jira_key || detail.matched_valixis_task_id ? (
              <a
                href={detail.jira_issue_url || `https://loopkeeper.atlassian.net/browse/${detail.jira_issue_key || (detail as any).jira_key || `LOOP-${detail.matched_valixis_task_id?.slice(0, 6).toUpperCase()}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/40 flex items-center gap-1 transition-all"
                title="View issue in Atlassian Jira Cloud"
              >
                <ExternalLinkIcon size={11} />
                <span>Jira: {detail.jira_issue_key || (detail as any).jira_key || `LOOP-${detail.matched_valixis_task_id?.slice(0, 6).toUpperCase()}`} ↗</span>
              </a>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const jiraRes = await api.createJiraIssue(detail.id, 'LOOP');
                    setDetail(prev => prev ? ({ ...prev, jira_issue_key: jiraRes.jira_issue_key, jira_issue_url: jiraRes.jira_issue_url, jira_status: jiraRes.jira_status }) : null);
                    addToast({
                      type: 'success',
                      title: 'Jira Issue Created',
                      message: `Linked commitment to ${jiraRes.jira_issue_key} in Atlassian Jira Cloud.`
                    });
                  } catch (err: any) {
                    addToast({ type: 'error', title: 'Jira Error', message: err?.message || 'Failed to create Jira issue.' });
                  }
                }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-200/80 dark:bg-zinc-800/60 hover:bg-blue-500/20 border border-slate-300 dark:border-zinc-700/60 transition-all flex items-center gap-1"
                title="Click to create & link Jira issue"
              >
                <ExternalLinkIcon size={11} />
                <span>+ Create Jira Issue</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {detail.status !== 'done' ? (
              <button
                onClick={() => handleQuickStatus('done')}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all shadow-sm"
              >
                <CheckCircleIcon size={13} />
                <span>Mark as Done</span>
              </button>
            ) : (
              <button
                onClick={() => handleQuickStatus('pending')}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 text-xs font-bold transition-all"
              >
                <ClockIcon size={13} />
                <span>Reopen Commitment</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-slate-300 dark:border-zinc-700 transition-all"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3.5 p-4 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Commitment Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Description & Context</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Assignee</label>
                <select
                  value={ownerId}
                  onChange={e => setOwnerId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Target Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="pending">In Progress (Pending)</option>
                  <option value="done">Completed (Done)</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium hover:bg-slate-300 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100">{detail.title}</h1>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-4xl">
              {detail.description || 'Action item extracted from conversational meeting discussion.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <UsersIcon size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-wider block">
                    Owner & Assignee
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {detail.owner_name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ClockIcon size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase font-bold tracking-wider block">
                    Target Deadline
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200">
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

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
                <ConfidenceMeter score={detail.confidence} size="sm" />
              </div>
            </div>

            {/* Verbatim Transcript Quote Anchor */}
            {detail.source_text && (
              <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-zinc-950/90 border border-cyan-500/30 space-y-1.5 shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <SparklesIcon size={13} />
                  Verbatim Transcript Evidence Anchor
                </span>
                <div className="text-xs text-slate-800 dark:text-zinc-200 font-mono italic leading-relaxed flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400 not-italic font-bold text-sm">❝</span>
                  <span className="flex-1 text-[11px]">{detail.source_text}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 not-italic font-bold text-sm">❞</span>
                </div>
              </div>
            )}

            {/* GitHub Proof of Work Demonstration Card */}
            <div className="p-4 rounded-2xl glass-panel border border-emerald-500/40 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    <NetworkIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      GitHub Proof-of-Work (Auto-Completion Engine)
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      Webhook PR listener & 384-dim Vector AI semantic resolution
                    </p>
                  </div>
                </div>

                {!simulatedPow ? (
                  <button
                    onClick={handleSimulateGitHubPow}
                    disabled={isSimulatingPow}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {isSimulatingPow ? (
                      <RefreshCwIcon size={13} className="animate-spin" />
                    ) : (
                      <ExternalLinkIcon size={13} />
                    )}
                    <span>Simulate GitHub PR Webhook</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shrink-0 shadow-sm">
                    <CheckCircleIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Auto-Resolved via GitHub PR #{simulatedPow.pr_number}
                  </span>
                )}
              </div>

              {simulatedPow && (
                <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-zinc-950/90 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs font-mono text-slate-700 dark:text-zinc-300">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] border-b border-slate-200 dark:border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-zinc-500">PR:</span>
                      <a
                        href={simulatedPow.pr_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
                      >
                        {simulatedPow.repository}#{simulatedPow.pr_number}
                        <ExternalLinkIcon size={11} />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-zinc-500">Vector AI Score:</span>
                      <span className="text-emerald-600 dark:text-emerald-300 font-bold">
                        {(simulatedPow.similarity_score * 100).toFixed(1)}% Cosine Similarity
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-zinc-300 italic">
                    "{simulatedPow.pr_title}"
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 flex justify-between">
                    <span>Author: {simulatedPow.author}</span>
                    <span>Resolution: {simulatedPow.resolution_method}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Originating Meeting Card */}
            {detail.originating_meeting && (
              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                  <FileTextIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[11px]">Originating Meeting:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                    {detail.originating_meeting.title}
                  </span>
                </div>
                <button
                  onClick={() => navigateToMeeting(detail.originating_meeting!.id)}
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 group"
                >
                  <span>Open Full Transcript & Video</span>
                  <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Comments, Execution Notes & Risk Warnings */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquareIcon size={18} className="text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Task Notes, Instructions & Delay Warnings
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              {comments.length}
            </span>
          </div>

          {detail.postponement_count && detail.postponement_count > 0 ? (
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <AlertTriangleIcon size={12} />
              Postponed {detail.postponement_count}x — Warning Escalated
            </span>
          ) : null}
        </div>

        {/* Comments List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-500 italic bg-slate-100/60 dark:bg-zinc-950/40 rounded-xl border border-slate-200 dark:border-zinc-800/50">
              No notes or delay warnings posted yet. Add instructions or delay warnings below.
            </div>
          ) : (
            comments.map(c => (
              <div
                key={c.id}
                className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                  c.type === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-800 dark:text-rose-200'
                    : c.type === 'instruction'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-800 dark:text-cyan-200'
                    : 'bg-slate-100 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs">{c.author_name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                      c.type === 'warning'
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                        : c.type === 'instruction'
                        ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}>
                      {c.type === 'warning' ? '⚠️ Risk Warning' : c.type === 'instruction' ? '🛠️ Execution Note' : '💬 Comment'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300">{c.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={commentType}
              onChange={e => setCommentType(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="comment">💬 Comment</option>
              <option value="instruction">🛠️ Execution Instruction</option>
              <option value="warning">⚠️ Warning / Delay Alert</option>
            </select>
            <input
              type="text"
              placeholder="Add instructions, delay warnings, or notes on how to do this task..."
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0"
            >
              Add Note
            </button>
          </div>
        </form>
      </div>

      {/* Cross-Meeting State Evolution Timeline */}
      <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <HistoryIcon size={16} className="text-amber-500 dark:text-amber-400" />
            Cross-Meeting State Evolution & Drift Audit
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">
            {detail.history?.length || 0} Audit Events
          </span>
        </div>

        <TaskHistoryTimeline history={detail.history || []} />
      </div>
    </div>
  );
};
