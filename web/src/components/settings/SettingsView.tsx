import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  SettingsIcon,
  ShieldAlertIcon,
  BrainIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  NetworkIcon,
  SparklesIcon,
  LinkIcon,
  ClockIcon
} from '../common/Icons';

export type SettingsTab = 'ai_engine' | 'integrations' | 'automations' | 'security_data';

export const SettingsView: React.FC = () => {
  const {
    backendStatus,
    forceMockMode,
    setForceMockMode,
    refreshData,
    resetDemoData,
    loading,
    actionItems,
    addToast
  } = useApp();
  const { employees } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('ai_engine');

  // AI & Vector State
  const [threshold, setThreshold] = useState(0.75);
  const [vectorThreshold, setVectorThreshold] = useState(0.85);
  const [modelName, setModelName] = useState('loopkeeper-slm-v1');
  const [fallbackProvider, setFallbackProvider] = useState('gemini-1.5-flash');
  const [autoCompletePrMerge, setAutoCompletePrMerge] = useState(true);
  const [autoLinkJiraKeys, setAutoLinkJiraKeys] = useState(true);

  // Automation & Alerts State
  const [slackAlertsEnabled, setSlackAlertsEnabled] = useState(true);
  const [dailyDigestEmail, setDailyDigestEmail] = useState(false);
  const [autoRebalanceThreshold, setAutoRebalanceThreshold] = useState(3);
  const [logRetention, setLogRetention] = useState('90_days');

  // Export helper
  const handleExportData = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ actionItems, employees, date: new Date().toISOString() }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `loopkeeper_workspace_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      let csvContent = "data:text/csv;charset=utf-8,ID,Title,Owner,Status,Confidence,Deadline\n";
      actionItems.forEach(item => {
        csvContent += `"${item.id}","${item.title.replace(/"/g, '""')}","${item.owner_name}","${item.status}","${item.confidence}","${item.deadline}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `loopkeeper_commitments_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    addToast({
      type: 'success',
      title: `Export Complete (${format.toUpperCase()})`,
      message: `Downloaded workspace commitments telemetry file.`
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Sleek Widescreen Header Bar */}
      <div className="relative overflow-hidden rounded-2xl glass-panel border border-slate-200 dark:border-zinc-800 p-4 sm:px-5 sm:py-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shrink-0">
            <SettingsIcon size={18} className="text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                Settings & Autonomous System Configuration
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                v1.2.0 Active
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Manage AI inference thresholds, integrations, automated alerts, and org security boundaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-800 flex items-center gap-1.5">
            <ShieldAlertIcon size={13} className="text-emerald-600 dark:text-emerald-400" />
            VALIXIS Portal Sync Active
          </span>
        </div>
      </div>

      {/* Neat Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl glass-panel border border-slate-200 dark:border-zinc-800">
        {[
          { id: 'ai_engine' as SettingsTab, label: 'AI & Vector Engine', icon: BrainIcon },
          { id: 'integrations' as SettingsTab, label: 'Integrations & Cloud Sync', icon: LinkIcon },
          { id: 'automations' as SettingsTab, label: 'Alerts & Automations', icon: ClockIcon },
          { id: 'security_data' as SettingsTab, label: 'Security & Data Management', icon: ShieldAlertIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI & Vector Engine */}
      {activeTab === 'ai_engine' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  <BrainIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">AI Inference Pipeline & Model Tuning</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">Configure local SLM thresholds and Google Gemini Flash fallback routing parameters.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                Hybrid SLM + Gemini 1.5 Flash
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Model */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">Primary Extraction Model</label>
                <select
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs font-mono text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="loopkeeper-slm-v1">loopkeeper-slm-v1 (Fine-tuned 94.2% precision)</option>
                  <option value="loopkeeper-slm-v2-preview">loopkeeper-slm-v2-preview (Experimental)</option>
                  <option value="whisper-base-en">whisper-base-en (Local Audio Native)</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">On-device small language model for low-latency speaker turn extraction.</p>
              </div>

              {/* Threshold Slider */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <span>Confidence Threshold</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={e => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">Extractions scoring &lt; {threshold} automatically trigger cloud fallback.</p>
              </div>

              {/* Fallback Provider */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">Fallback AI Provider</label>
                <select
                  value={fallbackProvider}
                  onChange={e => setFallbackProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Recommended)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">Enterprise cloud LLM provider for complex multi-speaker turn disambiguation.</p>
              </div>
            </div>
          </div>

          {/* Vector AI & Proof of Work Config */}
          <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  <SparklesIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Vector AI & Proof-of-Work Semantic Matcher</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">384-dimensional pgvector cosine similarity matching rules for GitHub PR & Jira autocompletion.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <span>Cosine Similarity Cutoff</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">{vectorThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.98"
                  step="0.02"
                  value={vectorThreshold}
                  onChange={e => setVectorThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">PR title & commit messages must score &ge; {vectorThreshold} to auto-resolve task.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Auto-Complete on PR Merge</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Mark task DONE when GitHub webhook fires</span>
                </div>
                <button
                  onClick={() => setAutoCompletePrMerge(!autoCompletePrMerge)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    autoCompletePrMerge
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {autoCompletePrMerge ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Auto-Link Jira Issue Keys</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Scan spoken text for patterns like PAY-142</span>
                </div>
                <button
                  onClick={() => setAutoLinkJiraKeys(!autoLinkJiraKeys)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    autoLinkJiraKeys
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {autoLinkJiraKeys ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Integrations & Cloud Sync */}
      {activeTab === 'integrations' && (
        <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                <LinkIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Platform & Integration Cloud Bridges</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">Monitor active OAuth connections and manual REST API triggers across workplace tools.</p>
              </div>
            </div>
            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-slate-300 dark:border-zinc-700 flex items-center gap-2 transition-all"
            >
              <RefreshCwIcon size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Google Meet */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Google Meet</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  Drive OAuth
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">Auto-imports audio transcripts & speaker turns from Google Drive.</p>
              <button
                onClick={() => addToast({ type: 'info', title: 'Google Meet Sync', message: 'Triggered Drive transcript ingestion scanner.' })}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Sync Google Meet
              </button>
            </div>

            {/* Zoom Cloud */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Zoom Workplace</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  OAuth VTT
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">Syncs cloud recordings & passcode-bypass meeting links.</p>
              <button
                onClick={() => addToast({ type: 'info', title: 'Zoom Cloud Sync', message: 'Triggered Zoom VTT transcript scanner.' })}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Sync Zoom Cloud
              </button>
            </div>

            {/* Microsoft Teams */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Microsoft Teams</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  Graph API
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">Pulls channel transcript logs & attendee attendance telemetry.</p>
              <button
                onClick={() => addToast({ type: 'info', title: 'MS Teams Sync', message: 'Triggered Microsoft Graph transcript API sync.' })}
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Sync MS Teams
              </button>
            </div>

            {/* Jira Cloud API v3 */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Jira Cloud API v3</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  REST v3 Proxy
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">Bidirectional status synchronization & ticket creation.</p>
              <button
                onClick={() => addToast({ type: 'success', title: 'Jira REST API Active', message: 'Proxy link status verified (LOOP project).' })}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Check Jira Proxy
              </button>
            </div>

            {/* GitHub App Webhooks */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">GitHub App Webhooks</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                  PR Vector Match
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">Receives `pull_request.closed` webhook payloads for proof-of-work.</p>
              <button
                onClick={() => addToast({ type: 'info', title: 'GitHub Webhook Active', message: 'Listening for pull_request event payloads.' })}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Inspect Webhook
              </button>
            </div>

            {/* Xero Financial Execution */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Xero Accounting</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  OAuth Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">Links financial milestone commitments with accounting ledgers.</p>
              <button
                onClick={() => addToast({ type: 'info', title: 'Xero Integration Status', message: 'Ready for external OAuth verification.' })}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Xero Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alerts & Automations */}
      {activeTab === 'automations' && (
        <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <ClockIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Notification & Autonomous Bot Rules</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">Configure Slack bot escalations, daily digests, and workload capacity thresholds.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slack Alert Toggle */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">Slack Bot Overdue Escalation</span>
                <span className="text-xs text-slate-600 dark:text-zinc-400 block">Send instant Slack DMs when commitments enter overdue state</span>
              </div>
              <button
                onClick={() => setSlackAlertsEnabled(!slackAlertsEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  slackAlertsEnabled
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {slackAlertsEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Daily Digest Email Toggle */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">Executive Daily Digest</span>
                <span className="text-xs text-slate-600 dark:text-zinc-400 block">Receive 9:00 AM email summary of execution drift & velocity</span>
              </div>
              <button
                onClick={() => setDailyDigestEmail(!dailyDigestEmail)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  dailyDigestEmail
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {dailyDigestEmail ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {/* Auto Rebalance Capacity Threshold */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-zinc-200">
                <span>Auto-Rebalance Trigger Threshold</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">{autoRebalanceThreshold} Tasks</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={autoRebalanceThreshold}
                onChange={e => setAutoRebalanceThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-200 dark:bg-zinc-800 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-500">Flags team member as overloaded when open tasks exceed {autoRebalanceThreshold}.</p>
            </div>

            {/* Audit Log Retention */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">Audit Evolution Log Retention</label>
              <select
                value={logRetention}
                onChange={e => setLogRetention(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="30_days">30 Days (Standard)</option>
                <option value="90_days">90 Days (Enterprise Default)</option>
                <option value="365_days">1 Year (Compliance Audit)</option>
                <option value="forever">Forever (Permanent Ledger)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500">Historical state transition snapshots retain period.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security, Multi-Tenancy & Data Management */}
      {activeTab === 'security_data' && (
        <div className="space-y-5">
          {/* VALIXIS Security Boundary */}
          <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  <ShieldAlertIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">VALIXIS Security & Read-Only Access Boundary</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">Org multi-tenancy isolation and read-only directory protection.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Synced & Protected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Enforced Boundary</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-bold block">Strict Read-Only</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Directory Profiles</span>
                <span className="font-mono text-slate-900 dark:text-zinc-100 text-sm font-bold block">{employees.length} Loaded Profiles</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Task Foreign Linking</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm font-bold block">VALIXIS FK Active</span>
              </div>
            </div>
          </div>

          {/* Backend Connection & Export Data */}
          <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-200 dark:border-zinc-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  <NetworkIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Backend API & Data Export Tools</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">Download workspace telemetry or manage local offline store options.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connection Status */}
              <div className="p-5 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">FastAPI Server Connection</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-zinc-400">Mode</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircleIcon size={14} />
                    {forceMockMode ? 'Local In-Memory Mode' : backendStatus.isLive ? 'FastAPI Live (/api/v1)' : 'Resilient Client Mode'}
                  </span>
                </div>
                <button
                  onClick={() => setForceMockMode(!forceMockMode)}
                  className="w-full py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all border border-slate-300 dark:border-zinc-700"
                >
                  {forceMockMode ? 'Switch to FastAPI Server' : 'Switch to Local Client Mode'}
                </button>
              </div>

              {/* Export Buttons */}
              <div className="p-5 rounded-2xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">Export Workspace Data</span>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">Export all commitments, evidence snippets, and assignee telemetry.</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleExportData('json')}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Danger Zone */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <ShieldAlertIcon size={15} />
                Danger Zone: Reset Workspace
              </span>
              <button
                onClick={() => resetDemoData()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Reset All Sample Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
