import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useApp } from '../../context/AppContext';
import { PostponementRadar } from '../insights/PostponementRadar';
import { AccountabilityGraph } from '../graph/AccountabilityGraph';
import { ExecutionDriftView } from './ExecutionDriftView';
import { TaskHistoryTimeline } from '../tasks/TaskHistoryTimeline';
import {
  ShieldAlertIcon,
  AlertTriangleIcon,
  NetworkIcon,
  HistoryIcon,
  SparklesIcon
} from '../common/Icons';

export type AccountabilitySubTab = 'drift' | 'radar' | 'graph' | 'timeline';

export const AccountabilityHub: React.FC = () => {
  const { route, navigateToAccountability } = useRouter();
  const { actionItems, dashboardOverview } = useApp();

  const queryTab = route.query.tab as AccountabilitySubTab | undefined;
  const [activeSubTab, setActiveSubTab] = useState<AccountabilitySubTab>(queryTab || 'drift');

  useEffect(() => {
    if (queryTab && ['drift', 'radar', 'graph', 'timeline'].includes(queryTab)) {
      setActiveSubTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tab: AccountabilitySubTab) => {
    setActiveSubTab(tab);
    navigateToAccountability(tab);
  };

  const postponedCount = dashboardOverview?.repeatedly_postponed_tasks || 0;

  // Aggregate all history events across action items for the global timeline
  const allHistoryEvents = actionItems.flatMap(a => {
    return (
      (a as any).history || [
        {
          id: `h-agg-${a.id}`,
          action_item_id: a.id,
          meeting_id: a.meeting_id,
          meeting_title: a.meeting_title || 'Meeting',
          event_type: a.status === 'done' ? 'completed' : a.postponement_count && a.postponement_count > 0 ? 'postponed' : 'created',
          evidence_text: a.source_text || `Extracted task: ${a.title}`,
          created_at: a.created_at
        }
      ]
    );
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Subtab Navigation Pills */}
      <div className="flex items-center justify-between gap-4 p-2 rounded-2xl glass-panel border border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-medium">
          {[
            {
              id: 'drift' as AccountabilitySubTab,
              label: 'Execution Drift Radar',
              icon: ShieldAlertIcon,
              badge: 'Critical'
            },
            {
              id: 'radar' as AccountabilitySubTab,
              label: 'Postponement Radar',
              icon: AlertTriangleIcon,
              badge: postponedCount > 0 ? `${postponedCount}` : undefined
            },
            {
              id: 'graph' as AccountabilitySubTab,
              label: 'Accountability Graph',
              icon: NetworkIcon
            },
            {
              id: 'timeline' as AccountabilitySubTab,
              label: 'Audit Evolution Timeline',
              icon: HistoryIcon
            }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400 pr-2">
          <SparklesIcon size={14} className="text-cyan-400" />
          <span>Cross-Meeting Verification Active</span>
        </div>
      </div>

      {/* Subtab Contents */}
      {activeSubTab === 'drift' && <ExecutionDriftView />}

      {activeSubTab === 'radar' && <PostponementRadar />}

      {activeSubTab === 'graph' && <AccountabilityGraph />}

      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel-elevated border border-indigo-500/30 space-y-3">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <HistoryIcon size={20} className="text-amber-400" />
              Global Cross-Meeting State Evolution Timeline
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
              Chronological state changes recorded by the LoopKeeper State Engine across all meetings. Tracks creation, deadline shifts, owner reassignments, and final verified completion.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-zinc-800">
            <TaskHistoryTimeline history={allHistoryEvents} />
          </div>
        </div>
      )}
    </div>
  );
};
