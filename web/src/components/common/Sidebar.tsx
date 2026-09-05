import React from 'react';
import { useApp } from '../../context/AppContext';
import type { NavigationTab } from '../../context/AppContext';
import {
  GaugeIcon,
  CalendarIcon,
  CheckSquareIcon,
  AlertTriangleIcon,
  UsersIcon,
  NetworkIcon,
  BrainIcon,
  SettingsIcon
} from './Icons';

interface SidebarItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, dashboardOverview, actionItems } = useApp();

  const overdueCount = dashboardOverview?.overdue_tasks || 0;
  const postponedCount = dashboardOverview?.repeatedly_postponed_tasks || 0;
  const openCount = actionItems.filter(a => a.status === 'pending').length;

  const items: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: GaugeIcon
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: CalendarIcon
    },
    {
      id: 'tasks',
      label: 'Commitments',
      icon: CheckSquareIcon,
      badge: openCount,
      badgeColor: 'bg-zinc-800 text-zinc-300'
    },
    {
      id: 'radar',
      label: 'Postponement Radar',
      icon: AlertTriangleIcon,
      badge: postponedCount > 0 ? postponedCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'workload',
      label: 'Team Workload',
      icon: UsersIcon
    },
    {
      id: 'graph',
      label: 'Accountability Graph',
      icon: NetworkIcon
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: BrainIcon
    },
    {
      id: 'settings',
      label: 'Settings & Integrations',
      icon: SettingsIcon
    }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/60 hidden md:flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {items.map(item => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (activeTab === 'meeting-detail' && item.id === 'meetings') ||
                (activeTab === 'task-detail' && item.id === 'tasks');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/25 to-cyan-600/15 text-white border border-indigo-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-cyan-400'
                          : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'
                      }
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.badgeColor || 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {overdueCount > 0 && (
          <div
            onClick={() => setActiveTab('tasks')}
            className="cursor-pointer p-3.5 rounded-xl bg-gradient-to-br from-rose-950/40 to-zinc-900 border border-rose-600/30 hover:border-rose-500/60 transition-all shadow-lg"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangleIcon size={16} />
              <span>{overdueCount} Overdue Commitment{overdueCount > 1 ? 's' : ''}</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
              Immediate attention required to prevent cross-sprint cascade.
            </p>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine Model</span>
          <span className="font-mono text-cyan-400 text-[10px]">SLM v1.2</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Vector Index</span>
          <span className="font-mono text-emerald-400 text-[10px]">HNSW 1536</span>
        </div>
        <div className="flex items-center justify-between">
          <span>VALIXIS Mode</span>
          <span className="font-mono text-indigo-300 text-[10px]">Read-Only</span>
        </div>
      </div>
    </aside>
  );
};
