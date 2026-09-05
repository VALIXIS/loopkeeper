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
    <aside className="w-64 shrink-0 border-r border-white/[0.08] bg-[#07090e]/60 backdrop-blur-xl hidden md:flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 flex items-center justify-between">
            <span>Navigation</span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 via-indigo-600/20 to-cyan-600/10 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400" />
                  )}
                  <div className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={
                        isActive
                          ? 'text-cyan-400'
                          : 'text-slate-500 group-hover:text-slate-300 transition-colors'
                      }
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
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
            className="cursor-pointer p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-600/40 hover:border-rose-400/80 transition-all shadow-lg hover:shadow-rose-500/10 group"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangleIcon size={15} className="animate-pulse" />
              <span>{overdueCount} Overdue Commitment{overdueCount > 1 ? 's' : ''}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug group-hover:text-slate-300 transition-colors">
              Immediate attention required to prevent cross-sprint cascade.
            </p>
          </div>
        )}
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.07] text-[11px] text-slate-400 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Inference Core</span>
          <span className="font-mono text-cyan-400 text-[10px] font-bold">SLM v1.2 ONNX</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Vector Dedupe</span>
          <span className="font-mono text-emerald-400 text-[10px] font-bold">HNSW 1536</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">VALIXIS Mode</span>
          <span className="font-mono text-indigo-300 text-[10px] font-bold">Read-Only</span>
        </div>
      </div>
    </aside>
  );
};
