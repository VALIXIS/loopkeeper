import React from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../context/RouterContext';
import {
  GaugeIcon,
  CalendarIcon,
  CheckSquareIcon,
  ShieldAlertIcon,
  SettingsIcon,
  NetworkIcon

} from './Icons';

import { useAuth } from '../../context/AuthContext';

interface SidebarItem {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { actionItems } = useApp();
  const { isManager, currentUser } = useAuth();
  const { route, navigate } = useRouter();

  const userItems = isManager
    ? actionItems
    : actionItems.filter(item =>
        item.owner_employee_id === currentUser.id ||
        item.owner_name?.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
        (item as any).assigned_to?.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
      );

  const overdueCount = userItems.filter(a => a.status === 'overdue').length;
  const postponedCount = userItems.filter(a => (a.postponement_count || 0) > 0).length;
  const openCount = userItems.filter(a => a.status === 'pending' || (a.status as string) === 'in_progress').length;

  const items: SidebarItem[] = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'Home',
      icon: GaugeIcon
    },
    {
      id: 'meetings',
      path: '/meetings',
      label: 'Meetings',
      icon: CalendarIcon
    },
    {
      id: 'commitments',
      path: '/commitments',
      label: 'Commitments',
      icon: CheckSquareIcon,
      badge: openCount,
      badgeColor: 'bg-zinc-800 text-zinc-300'
    },
    {
      id: 'accountability',
      path: '/accountability',
      label: 'Accountability',
      icon: ShieldAlertIcon,
      badge: postponedCount > 0 ? postponedCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'integrations',
      path: '/integrations',
      label: 'Integrations',
      icon: NetworkIcon
    },
    {
      id: 'settings',
      path: '/settings',
      label: 'Settings',
      icon: SettingsIcon
    }
  ];


  return (
    <aside className="w-64 shrink-0 border-r border-white/[0.08] bg-[#07090e]/60 backdrop-blur-xl hidden md:flex flex-col justify-between p-4 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 flex items-center justify-between">
            <span>Core Navigation</span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
          </div>
          <nav className="space-y-1">
            {items.map(item => {
              const Icon = item.icon;
              const isActive =
                route.path === item.id ||
                (item.id === 'meetings' && route.path === 'meeting-detail') ||
                (item.id === 'commitments' && route.path === 'commitment-detail');

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
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
            onClick={() => navigate('/commitments')}
            className="cursor-pointer p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-600/40 hover:border-rose-400/80 transition-all shadow-lg hover:shadow-rose-500/10 group"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <ShieldAlertIcon size={15} className="animate-pulse" />
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
          <span className="text-slate-400">Execution Engine</span>
          <span className="font-mono text-cyan-400 text-[10px] font-bold">Active Verification</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Jira Integration</span>
          <span className="font-mono text-emerald-400 text-[10px] font-bold">REST API v3 Proxy</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Data Boundary</span>
          <span className="font-mono text-indigo-300 text-[10px] font-bold">Read-Only Enforced</span>
        </div>
      </div>
    </aside>
  );
};

