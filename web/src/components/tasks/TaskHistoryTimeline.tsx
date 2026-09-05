import React from 'react';
import type { ActionItemHistory } from '../../types';
import {
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  UsersIcon,
  GitCommitIcon
} from '../common/Icons';

interface TaskHistoryTimelineProps {
  history: ActionItemHistory[];
}

export const TaskHistoryTimeline: React.FC<TaskHistoryTimelineProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-zinc-400 font-mono rounded-2xl glass-panel border border-zinc-800">
        No state transition history events recorded yet.
      </div>
    );
  }

  const getEventMeta = (eventType: string) => {
    switch (eventType) {
      case 'completed':
        return {
          icon: <CheckCircleIcon size={14} className="text-emerald-400" />,
          title: 'Marked Completed',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
        };
      case 'postponed':
        return {
          icon: <AlertTriangleIcon size={14} className="text-rose-400" />,
          title: 'Commitment Postponed',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
        };
      case 'deadline_changed':
        return {
          icon: <ClockIcon size={14} className="text-amber-400" />,
          title: 'Deadline Shifted',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
        };
      case 'owner_changed':
        return {
          icon: <UsersIcon size={14} className="text-indigo-400" />,
          title: 'Ownership Reassigned',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/20'
        };
      case 'created':
      default:
        return {
          icon: <GitCommitIcon size={14} className="text-cyan-400" />,
          title: 'Initial AI Extraction',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
        };
    }
  };

  return (
    <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/50 before:via-indigo-500/30 before:to-zinc-800">
      {history.map(event => {
        const meta = getEventMeta(event.event_type);
        const eventDate = new Date(event.created_at);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });

        return (
          <div key={event.id} className="relative group">
            {/* Dot Node */}
            <div className="absolute -left-7 top-1 h-6 w-6 rounded-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-700 flex items-center justify-center group-hover:border-cyan-400 group-hover:scale-110 transition-all shadow-md">
              {meta.icon}
            </div>

            {/* Event Card */}
            <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-zinc-800 space-y-2.5 hover:border-cyan-500/40 transition-all shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeBg}`}>
                    {meta.title}
                  </span>
                  {event.meeting_title && (
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                      in {event.meeting_title}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">{formattedDate}</span>
              </div>

              {/* Evidence Snippet */}
              {event.evidence_text && (
                <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-zinc-950/90 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300 font-mono italic leading-relaxed flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400 not-italic font-bold">❝</span>
                  <span className="flex-1">{event.evidence_text}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 not-italic font-bold">❞</span>
                </div>
              )}

              {/* Delta Comparison */}
              {event.previous_value && event.new_value && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono pt-1">
                  <span className="text-slate-500 dark:text-zinc-500">State Transition:</span>
                  <span className="text-rose-600 dark:text-rose-400/90 line-through bg-rose-500/10 dark:bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/20">
                    {typeof event.previous_value === 'object' ? JSON.stringify(event.previous_value) : String(event.previous_value)}
                  </span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">➔</span>
                  <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    {typeof event.new_value === 'object' ? JSON.stringify(event.new_value) : String(event.new_value)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
