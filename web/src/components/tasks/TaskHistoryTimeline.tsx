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
      <div className="py-8 text-center text-xs text-zinc-500 rounded-xl bg-zinc-950 border border-zinc-800">
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
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'postponed':
        return {
          icon: <AlertTriangleIcon size={14} className="text-rose-400" />,
          title: 'Commitment Postponed',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        };
      case 'deadline_changed':
        return {
          icon: <ClockIcon size={14} className="text-amber-400" />,
          title: 'Deadline Shifted',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        };
      case 'owner_changed':
        return {
          icon: <UsersIcon size={14} className="text-indigo-400" />,
          title: 'Ownership Reassigned',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        };
      case 'created':
      default:
        return {
          icon: <GitCommitIcon size={14} className="text-cyan-400" />,
          title: 'Initial AI Extraction',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
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
            <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-zinc-950 border-2 border-zinc-700 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
              {meta.icon}
            </div>

            {/* Event Card */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.badgeBg}`}>
                    {meta.title}
                  </span>
                  {event.meeting_title && (
                    <span className="text-xs text-zinc-400 font-medium">
                      in {event.meeting_title}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-zinc-500">{formattedDate}</span>
              </div>

              {/* Evidence Snippet */}
              {event.evidence_text && (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-sans italic leading-relaxed">
                  "{event.evidence_text}"
                </div>
              )}

              {/* Delta Comparison */}
              {event.previous_value && event.new_value && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                  <span className="text-rose-400/80 line-through">
                    {JSON.stringify(event.previous_value)}
                  </span>
                  <span>➔</span>
                  <span className="text-emerald-400">{JSON.stringify(event.new_value)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
