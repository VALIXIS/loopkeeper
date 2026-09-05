import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  NetworkIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  ShieldAlertIcon,
  SparklesIcon,
  XIcon
} from '../common/Icons';

interface IntegrationItem {
  id: string;
  name: string;
  category: 'Meeting Provider' | 'Issue Tracker & Execution' | 'Storage & Transcripts';
  description: string;
  iconBg: string;
  iconText: string;
  status: 'connected' | 'not_connected' | 'needs_auth' | 'syncing' | 'error';
  lastSynced?: string;
  features: string[];
  externalUrl?: string;
}

export const IntegrationsView: React.FC = () => {
  const { addToast } = useApp();

  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: 'jira',
      name: 'Atlassian Jira Software',
      category: 'Issue Tracker & Execution',
      description: 'Bi-directional issue verification. Detects execution drift when meeting statements conflict with actual Jira issue status (e.g. PAY-142).',
      iconBg: 'bg-blue-600',
      iconText: 'Jira',
      status: 'connected',
      lastSynced: 'Just now',
      features: ['Execution drift detection', 'Commitment ➔ Issue key linking', 'Sprint backlog alignment', 'Read-Only safe queries'],
      externalUrl: 'https://atlassian.net'
    },
    {
      id: 'google-meet',
      name: 'Google Meet',
      category: 'Meeting Provider',
      description: 'Direct ingestion from Google Meet recordings and Google Drive transcript attachments.',
      iconBg: 'bg-emerald-600',
      iconText: 'Meet',
      status: 'connected',
      lastSynced: '14 minutes ago',
      features: ['Google Drive transcript sync', 'Calendar event auto-tagging', 'Speaker diaritization ingest'],
      externalUrl: 'https://meet.google.com'
    },
    {
      id: 'ms-teams',
      name: 'Microsoft Teams',
      category: 'Meeting Provider',
      description: 'Enterprise tenant sync via Microsoft Graph API for channel and scheduled standup meetings.',
      iconBg: 'bg-indigo-600',
      iconText: 'Teams',
      status: 'needs_auth',
      features: ['Tenant Graph API webhook', 'Channel meeting transcript sync', 'Azure AD enterprise isolation'],
      externalUrl: 'https://teams.microsoft.com'
    },
    {
      id: 'zoom',
      name: 'Zoom Video Communications',
      category: 'Meeting Provider',
      description: 'Cloud recording webhook integration. Automatically triggers LoopKeeper SLM extraction upon meeting conclusion.',
      iconBg: 'bg-cyan-600',
      iconText: 'Zoom',
      status: 'not_connected',
      features: ['Cloud recording webhook', 'VTT subtitle parsing', 'Auto-invite LoopKeeper AI'],
      externalUrl: 'https://zoom.us'
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleToggleConnect = (item: IntegrationItem) => {
    if (item.status === 'connected') {
      setIntegrations(prev =>
        prev.map(i => (i.id === item.id ? { ...i, status: 'not_connected', lastSynced: undefined } : i))
      );
      addToast({
        type: 'info',
        title: `${item.name} Disconnected`,
        message: `Integration removed from active synchronization.`
      });
    } else {
      setSelectedIntegration(item);
    }
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    setIntegrations(prev =>
      prev.map(i =>
        i.id === selectedIntegration.id
          ? { ...i, status: 'connected', lastSynced: 'Just now' }
          : i
      )
    );

    addToast({
      type: 'success',
      title: `${selectedIntegration.name} Connected`,
      message: `Successfully verified API credentials and synchronized workspace.`
    });

    setSelectedIntegration(null);
    setApiKeyInput('');
  };

  const handleTriggerSync = (item: IntegrationItem) => {
    setSyncingId(item.id);
    setIntegrations(prev =>
      prev.map(i => (i.id === item.id ? { ...i, status: 'syncing' } : i))
    );

    setTimeout(() => {
      setSyncingId(null);
      setIntegrations(prev =>
        prev.map(i => (i.id === item.id ? { ...i, status: 'connected', lastSynced: 'Just now' } : i))
      );
      addToast({
        type: 'success',
        title: `${item.name} Synchronized`,
        message: `Verified and refreshed latest cross-tool data.`
      });
    }, 1200);
  };

  const getStatusBadge = (status: IntegrationItem['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircleIcon size={13} />
            <span>Connected</span>
          </span>
        );
      case 'syncing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
            <RefreshCwIcon size={13} className="animate-spin" />
            <span>Syncing</span>
          </span>
        );
      case 'needs_auth':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangleIcon size={13} />
            <span>Needs Auth</span>
          </span>
        );
      case 'error':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <AlertTriangleIcon size={13} />
            <span>Connection Error</span>
          </span>
        );
      case 'not_connected':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
            Not Connected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5 shadow-sm">
            <NetworkIcon size={14} className="text-cyan-400" />
            Ecosystem Integrations
          </span>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
            Zero Data Leakage • Read-Only Boundary
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
          Integrations & Execution Bridges
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Connect LoopKeeper to your team's communication platforms and issue trackers. LoopKeeper compares verbal meeting commitments against Jira execution evidence to detect drift.
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(item => {
          const isConnected = item.status === 'connected';

          return (
            <div
              key={item.id}
              className={`p-6 rounded-3xl glass-panel-elevated border transition-all duration-200 shadow-xl flex flex-col justify-between gap-5 ${
                isConnected
                  ? 'border-indigo-500/40 hover:border-indigo-500/70 hover:shadow-indigo-500/10'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`h-11 w-11 rounded-2xl ${item.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0`}>
                      {item.iconText}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                        {item.name}
                        {item.externalUrl && (
                          <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-cyan-400 transition-colors"
                            title="Visit provider"
                          >
                            <ExternalLinkIcon size={13} />
                          </a>
                        )}
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-400 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {getStatusBadge(item.status)}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Features List */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                    Supported Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-950/80 text-zinc-400 border border-zinc-800 flex items-center gap-1"
                      >
                        <CheckCircleIcon size={10} className="text-cyan-400" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono text-[11px]">
                  {item.lastSynced ? `Synced: ${item.lastSynced}` : 'Status: Offline'}
                </span>

                <div className="flex items-center gap-2">
                  {isConnected && (
                    <button
                      onClick={() => handleTriggerSync(item)}
                      disabled={syncingId === item.id}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCwIcon size={12} className={syncingId === item.id ? 'animate-spin text-cyan-400' : ''} />
                      <span>Sync Now</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleConnect(item)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isConnected
                        ? 'bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30'
                        : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect Bridge'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Boundary Notice */}
      <div className="p-5 rounded-3xl glass-panel border border-zinc-800 flex items-start gap-4 shadow-lg">
        <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
          <ShieldAlertIcon size={22} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            Read-Only Principle & Boundary Isolation
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            LoopKeeper communicates with external meeting providers and Jira via strictly scoped read-only OAuth tokens. LoopKeeper never mutates or overrides external issues without explicit user approval.
          </p>
        </div>
      </div>

      {/* Setup / Auth Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated border border-indigo-500/40 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-xl ${selectedIntegration.iconBg} text-white flex items-center justify-center font-bold text-xs`}>
                  {selectedIntegration.iconText}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Authorize {selectedIntegration.name}
                  </h3>
                  <p className="text-xs text-zinc-400">Configure OAuth 2.0 / API Token bridge</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold block">
                  Integration Endpoint / Domain URL
                </label>
                <input
                  type="text"
                  required
                  defaultValue={selectedIntegration.externalUrl || 'https://workspace.atlassian.net'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold block">
                  API Token / OAuth Client Key
                </label>
                <input
                  type="password"
                  required
                  placeholder="lk_sec_live_948275928374..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Keys are stored exclusively in secure encrypted session storage.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-400 text-[11px] flex items-center gap-2">
                <SparklesIcon size={14} className="text-cyan-400 shrink-0" />
                <span>Enables automatic cross-referencing of commitments against external execution records.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedIntegration(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  Verify & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
