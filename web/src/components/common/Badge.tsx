import React from 'react';
import type { TaskStatus, MatchDecisionType } from '../../types';
import { CheckCircleIcon, AlertTriangleIcon, ClockIcon, XIcon, SparklesIcon, ShieldAlertIcon } from './Icons';

export const StatusBadge: React.FC<{ status: TaskStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'done':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}>
          <CheckCircleIcon size={12} className="text-emerald-400" />
          Completed
        </span>
      );
    case 'overdue':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <AlertTriangleIcon size={12} className="text-rose-400" />
          Overdue
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-zinc-500/15 text-zinc-400 border border-zinc-500/30 ${sizeClasses}`}>
          <XIcon size={12} className="text-zinc-400" />
          Cancelled
        </span>
      );
    case 'pending':
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          <ClockIcon size={12} className="text-amber-400" />
          In Progress
        </span>
      );
  }
};

export const PostponementBadge: React.FC<{ count?: number }> = ({ count = 0 }) => {
  if (count <= 0) return null;

  const isSevere = count >= 2;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md border ${
        isSevere
          ? 'bg-rose-950/70 text-rose-300 border-rose-600/50 shadow-sm shadow-rose-900/40 animate-pulse'
          : 'bg-amber-950/60 text-amber-300 border-amber-600/40'
      }`}
      title={`This task has been postponed or deadline changed ${count} times.`}
    >
      <AlertTriangleIcon size={12} className={isSevere ? 'text-rose-400' : 'text-amber-400'} />
      {count}x Postponed
    </span>
  );
};

export const MatchDecisionBadge: React.FC<{ decision?: MatchDecisionType }> = ({ decision = 'new' }) => {
  switch (decision) {
    case 'matched':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          <SparklesIcon size={12} className="text-indigo-400" />
          Matched Previous
        </span>
      );
    case 'uncertain':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <ShieldAlertIcon size={12} className="text-amber-400" />
          Uncertain (Review)
        </span>
      );
    case 'new':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
          New Commitment
        </span>
      );
  }
};

export const VerificationBadge: React.FC<{ isVerified?: boolean; confidence: number }> = ({
  isVerified = false,
  confidence
}) => {
  if (isVerified || confidence >= 0.95) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
        <CheckCircleIcon size={11} className="text-emerald-400" />
        Verified
      </span>
    );
  }

  if (confidence < 0.75) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-amber-950/50 text-amber-300 border border-amber-500/30">
        <AlertTriangleIcon size={11} className="text-amber-400" />
        AI Extracted (Uncertain)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
      <SparklesIcon size={11} className="text-cyan-400" />
      AI Inferred
    </span>
  );
};
