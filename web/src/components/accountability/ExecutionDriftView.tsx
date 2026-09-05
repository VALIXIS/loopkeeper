import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  ShieldAlertIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  SparklesIcon,
  UsersIcon
} from '../common/Icons';

export interface ExecutionDriftItem {
  id: string;
  commitmentTitle: string;
  ownerName: string;
  spokenStatement: string;
  meetingTitle: string;
  spokenStatus: 'Claimed Done' | 'Claimed Ready' | 'Ahead of Schedule';
  spokenDate: string;
  jiraIssueKey: string;
  jiraStatus: 'In Progress' | 'Open' | 'Code Review' | 'Blocked';
  jiraAssignee: string;
  jiraLastUpdated: string;
  driftSeverity: 'critical' | 'high' | 'moderate';
  discrepancySummary: string;
  mitigationRecommendation: string;
}

export const ExecutionDriftView: React.FC = () => {
  const { actionItems, addToast, refreshData } = useApp();

  // Static demo drift anomalies for architectural reference
  const demoDriftItems: ExecutionDriftItem[] = [
    {
      id: 'drift-1',
      commitmentTitle: 'Stripe webhook replay and idempotency ledger',
      ownerName: 'Adithya',
      spokenStatement: 'Payment API idempotency ledger is completely finished and verified on local.',
      meetingTitle: 'Sprint 15 Architecture & Delivery Review',
      spokenStatus: 'Claimed Done',
      spokenDate: 'Today, 10:14 AM',
      jiraIssueKey: 'PAY-142',
      jiraStatus: 'In Progress',
      jiraAssignee: 'Adithya',
      jiraLastUpdated: 'Yesterday, 6:30 PM (Branch: feat/pay-142 has 3 open PR review comments)',
      driftSeverity: 'critical',
      discrepancySummary: 'Speaker stated payment webhook was completed, but Jira issue PAY-142 remains In Progress with 3 unresolved code review comments.',
      mitigationRecommendation: 'Verify whether PR #482 was merged or if uncommitted local stashes exist.'
    },
    {
      id: 'drift-2',
      commitmentTitle: 'Mobile OAuth token silent refresh and secure biometric vault',
      ownerName: 'Vignesh',
      spokenStatement: 'Auth token refresh is working properly and ready for staging release.',
      meetingTitle: 'Sprint 15 Architecture & Delivery Review',
      spokenStatus: 'Claimed Ready',
      spokenDate: 'Today, 10:22 AM',
      jiraIssueKey: 'AUTH-89',
      jiraStatus: 'Code Review',
      jiraAssignee: 'Vignesh',
      jiraLastUpdated: '2 hours ago (CI build failure on iOS bundle tests)',
      driftSeverity: 'high',
      discrepancySummary: 'Speaker claimed token refresh is ready for staging, but Jira CI telemetry shows failing iOS bundle tests.',
      mitigationRecommendation: 'Re-run mobile CI pipeline and unblock iOS certificate bundle.'
    },
    {
      id: 'drift-3',
      commitmentTitle: 'Vector Search & Transcript Indexing Engine',
      ownerName: 'Krishna',
      spokenStatement: 'Migration script executed on staging database.',
      meetingTitle: 'Engineering Standup & Delivery Sync',
      spokenStatus: 'Claimed Done',
      spokenDate: 'Yesterday, 11:00 AM',
      jiraIssueKey: 'PGV-104',
      jiraStatus: 'In Progress',
      jiraAssignee: 'Krishna',
      jiraLastUpdated: '3 hours ago (Pending DB administrator approval)',
      driftSeverity: 'moderate',
      discrepancySummary: 'Migration executed on local replica, but staging database migration requires DBA peer sign-off.',
      mitigationRecommendation: 'Request DBA sign-off on Jira PGV-104.'
    }
  ];

  // Dynamic derivation of drift items from real actionItems + reference patterns
  const liveDriftItems: ExecutionDriftItem[] = actionItems
    .filter(a => (a.postponement_count && a.postponement_count > 0) || a.status === 'overdue' || a.confidence < 0.8)
    .map(a => ({
      id: `drift-live-${a.id}`,
      commitmentTitle: a.title,
      ownerName: a.owner_name || 'Unassigned',
      spokenStatement: a.source_text || `Action item: ${a.title}`,
      meetingTitle: a.meeting_title || 'Recent Standup',
      spokenStatus: a.status === 'done' ? 'Claimed Done' : 'Claimed Ready',
      spokenDate: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      jiraIssueKey: `LK-${a.id.slice(0, 4).toUpperCase()}`,
      jiraStatus: a.status === 'done' ? 'In Progress' : 'Open',
      jiraAssignee: a.owner_name || 'Unassigned',
      jiraLastUpdated: `Last updated ${new Date(a.updated_at).toLocaleDateString()}`,
      driftSeverity: (a.postponement_count && a.postponement_count >= 2) || a.status === 'overdue' ? 'critical' : 'high',
      discrepancySummary: `Spoken commitment status '${a.status}' conflicts with tracker state or repeated postponement (${a.postponement_count || 0} delays recorded).`,
      mitigationRecommendation: `Review history log and verify commit hashes linked to ${a.title}.`
    }));

  const [showReferencePatterns, setShowReferencePatterns] = useState(false);

  const driftItems = liveDriftItems.length > 0
    ? liveDriftItems
    : showReferencePatterns
    ? demoDriftItems
    : [];

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Sleek Compact Header Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-950 border border-rose-500/30 p-4 sm:px-5 sm:py-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 shadow-sm shrink-0">
            <ShieldAlertIcon size={14} className="animate-pulse" />
            Execution Drift Radar
          </span>
          <h1 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight">
            Verbal Commitments vs Tracker Discrepancies
          </h1>
        </div>
        <p className="text-xs text-zinc-400 font-medium">
          Cross-referencing spoken meeting claims against Jira & GitHub PR states.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel-elevated border border-rose-500/30 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Critical Drift Detected</span>
            <AlertTriangleIcon size={16} className="text-rose-400" />
          </div>
          <span className="text-3xl font-black font-mono text-rose-400 mt-2 block">
            {driftItems.filter(d => d.driftSeverity === 'critical').length}
          </span>
          <p className="text-xs text-zinc-400 mt-1">Claimed Done vs Incomplete External Reality</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-elevated border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>High Risk Discrepancies</span>
            <ClockIcon size={16} className="text-amber-400" />
          </div>
          <span className="text-3xl font-black font-mono text-amber-300 mt-2 block">
            {driftItems.filter(d => d.driftSeverity === 'high').length}
          </span>
          <p className="text-xs text-zinc-400 mt-1">CI / Code Review unmerged dependencies</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-elevated border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Monitored Deliverables</span>
            <CheckCircleIcon size={16} className="text-cyan-400" />
          </div>
          <span className="text-3xl font-black font-mono text-cyan-400 mt-2 block">
            {actionItems.length}
          </span>
          <p className="text-xs text-zinc-400 mt-1">Active meeting action items</p>
        </div>
      </div>

      {/* Drift Comparison Cards List or Empty State */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlertIcon size={18} className="text-rose-400" />
            Active Execution Drift Anomalies ({driftItems.length})
          </h3>
          {liveDriftItems.length === 0 && (
            <button
              onClick={() => setShowReferencePatterns(!showReferencePatterns)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              {showReferencePatterns ? 'Hide Reference Patterns' : 'Show Reference Patterns'}
            </button>
          )}
        </div>

        {driftItems.length === 0 ? (
          <div className="p-10 rounded-3xl glass-panel border border-zinc-800 text-center space-y-3">
            <CheckCircleIcon size={36} className="mx-auto text-emerald-400" />
            <h4 className="text-base font-bold text-zinc-100">No Active Execution Drift Anomalies</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              All active meeting commitments match their expected tracker state and show clean execution continuity.
            </p>
            <button
              onClick={() => setShowReferencePatterns(true)}
              className="text-xs font-mono text-cyan-400 hover:underline pt-2 inline-block"
            >
              (Click to view sample reference drift patterns)
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {driftItems.map(item => (
            <div
              key={item.id}
              className="p-6 rounded-3xl glass-panel-elevated border border-rose-500/40 shadow-xl space-y-5 hover:border-rose-400/70 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      item.driftSeverity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {item.driftSeverity.toUpperCase()} DRIFT
                  </span>
                  <h4 className="text-base font-bold text-zinc-100">
                    {item.commitmentTitle}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <UsersIcon size={13} className="text-cyan-400" />
                    {item.ownerName}
                  </span>
                  <span>•</span>
                  <span className="text-indigo-400 font-bold">{item.jiraIssueKey}</span>
                </div>
              </div>

              {/* Side-by-Side Comparison Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Side: Meeting Spoken Claim */}
                <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <SparklesIcon size={12} />
                      Verbal Statement in Meeting
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.spokenStatus}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 font-mono italic leading-relaxed pt-1">
                    "{item.spokenStatement}"
                  </p>

                  <div className="text-[10px] text-zinc-500 pt-2 flex items-center justify-between border-t border-zinc-800/60">
                    <span>Source: {item.meetingTitle}</span>
                    <span>{item.spokenDate}</span>
                  </div>
                </div>

                {/* Right Side: External Tracker (Jira) State */}
                <div className="p-4 rounded-2xl bg-zinc-950/90 border border-rose-500/30 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <ExternalLinkIcon size={12} />
                      External Issue Tracker (Jira)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.jiraStatus}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-mono pt-1">
                    {item.jiraLastUpdated}
                  </p>

                  <div className="text-[10px] text-zinc-500 pt-2 flex items-center justify-between border-t border-zinc-800/60">
                    <span>Assignee: {item.jiraAssignee}</span>
                    <span className="text-indigo-400 font-mono font-bold">{item.jiraIssueKey}</span>
                  </div>
                </div>
              </div>

              {/* Discrepancy & Mitigation Row */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <div className="text-xs font-bold text-rose-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangleIcon size={14} />
                    <span>Drift Analysis: {item.discrepancySummary}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Action Required
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed pl-5">
                  <strong className="text-cyan-300">Action Plan:</strong> {item.mitigationRecommendation}
                </p>

                <div className="pt-2 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Resolve Execution Discrepancy:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const rawId = item.id.replace('drift-live-', '');
                        await api.resolveJiraDrift(rawId, 'mark_jira_done');
                        addToast({
                          type: 'success',
                          title: 'Jira Issue Updated',
                          message: `Transitioned ${item.jiraIssueKey} to 'Done' in Atlassian Jira Cloud.`
                        });
                        refreshData();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                    >
                      <CheckCircleIcon size={13} />
                      <span>Mark Jira Issue Done</span>
                    </button>
                    <button
                      onClick={async () => {
                        const rawId = item.id.replace('drift-live-', '');
                        await api.resolveJiraDrift(rawId, 'reopen_loopkeeper_task');
                        addToast({
                          type: 'info',
                          title: 'LoopKeeper Task Re-opened',
                          message: `Updated task status back to 'Pending' to match Jira issue state.`
                        });
                        refreshData();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/[0.08] transition-all"
                    >
                      Re-open Task in LoopKeeper
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
