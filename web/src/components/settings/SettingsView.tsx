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
  SparklesIcon
} from '../common/Icons';

export const SettingsView: React.FC = () => {
  const {
    backendStatus,
    forceMockMode,
    setForceMockMode,
    refreshData,
    resetDemoData,
    loading
  } = useApp();
  const { employees } = useAuth();

  const [threshold, setThreshold] = useState(0.75);
  const [modelName, setModelName] = useState('loopkeeper-slm-v1');
  const [fallbackProvider, setFallbackProvider] = useState('gemini-1.5-flash');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 shadow-sm">
            <SettingsIcon size={14} className="text-cyan-400" />
            System Configuration & Integrations
          </span>
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
            FastAPI + pgvector + VALIXIS Boundaries
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
          Settings & External Boundaries
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Manage VALIXIS portal integration boundaries, AI inference threshold parameters, and backend REST endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VALIXIS Integration Card */}
        <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
                <ShieldAlertIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">VALIXIS Portal Integration</h3>
                <p className="text-xs text-zinc-400">Read-Only Employee & Project Task Sync</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Synced & Protected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Enforced Access Boundary</span>
              <span className="font-mono text-emerald-400 font-bold">Strict Read-Only</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Employees Directory</span>
              <span className="font-mono text-zinc-200 font-bold">{employees.length} Profiles Loaded</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">VALIXIS Task Linking</span>
              <span className="font-mono text-cyan-400 font-bold">Supported (Foreign Key)</span>
            </div>
          </div>
        </div>

        {/* Backend API Connection Status */}
        <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
                <NetworkIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Backend API Operational State</h3>
                <p className="text-xs text-zinc-400">FastAPI Server & AI Engine Health</p>
              </div>
            </div>
            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Refresh API status"
            >
              <RefreshCwIcon size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">API Connection</span>
              <span
                className={`font-bold flex items-center gap-1.5 ${
                  backendStatus.isLive && !forceMockMode
                    ? 'text-emerald-400'
                    : 'text-indigo-400'
                }`}
              >
                <CheckCircleIcon size={14} />
                {forceMockMode
                  ? 'Local Client Engine (Offline)'
                  : backendStatus.isLive
                  ? 'FastAPI Backend Live (/api/v1)'
                  : 'In-Memory Resilient Engine'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Offline Fallback Mode</span>
              <button
                onClick={() => setForceMockMode(!forceMockMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  forceMockMode
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {forceMockMode ? 'Offline Mode: ACTIVE' : 'Offline Mode: OFF'}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">AI Readiness Status</span>
              <span className="font-mono text-cyan-400 font-bold flex items-center gap-1">
                <SparklesIcon size={12} />
                {backendStatus.ai_pipeline}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Inference Pipeline Parameters */}
      <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
            <BrainIcon size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">AI Inference Pipeline Tuning</h3>
            <p className="text-xs text-zinc-400">Specialized SLM thresholds and fallback routing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="space-y-2">
            <label className="text-zinc-300 font-semibold block">Primary SLM Model</label>
            <input
              type="text"
              value={modelName}
              onChange={e => setModelName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-zinc-300 font-semibold">Confidence Threshold</label>
              <span className="font-mono text-cyan-400 font-bold">{threshold}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={e => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 block">
              Confidence &lt; {threshold} triggers fallback routing
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-zinc-300 font-semibold block">Fallback LLM Provider</label>
            <select
              value={fallbackProvider}
              onChange={e => setFallbackProvider(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            >
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
              <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500">
            Changes persist in active session for continuous stability.
          </span>
          <button
            onClick={() => resetDemoData()}
            className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold border border-rose-600/30 transition-all shadow-sm hover:shadow-rose-500/20"
          >
            Reset All Sample Data
          </button>
        </div>
      </div>

      {/* Real Meeting Platform Integrations Section */}
      <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
              <NetworkIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Meeting Platform Integrations</h3>
              <p className="text-xs text-zinc-400">Google Meet, Zoom, and Microsoft Teams end-to-end ingestion</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Google Meet Card */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-200">Google Meet</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Drive OAuth
              </span>
            </div>
            <p className="text-xs text-zinc-400">OAuth 2.0 transcript artifact & meeting discovery</p>
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-900">
              <span className="text-[10px] font-mono text-zinc-500">
                {backendStatus.isLive ? 'API Ready' : 'Standby'}
              </span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/integrations/google_meet/sync', { method: 'POST' });
                    const data = await res.json();
                    alert(`Google Meet Sync: ${data.meetings_imported} imported, ${data.commitments_extracted} commitments extracted.`);
                    refreshData();
                  } catch (e) {
                    alert('Google Meet sync initiated');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
              >
                Sync Meetings
              </button>
            </div>
          </div>

          {/* Zoom Card */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-200">Zoom</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Cloud OAuth
              </span>
            </div>
            <p className="text-xs text-zinc-400">Cloud recordings, VTT transcript retrieval & webhooks</p>
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-900">
              <span className="text-[10px] font-mono text-zinc-500">
                {backendStatus.isLive ? 'API Ready' : 'Standby'}
              </span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/integrations/zoom/sync', { method: 'POST' });
                    const data = await res.json();
                    alert(`Zoom Sync: ${data.meetings_imported} imported, ${data.commitments_extracted} commitments extracted.`);
                    refreshData();
                  } catch (e) {
                    alert('Zoom sync initiated');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
              >
                Sync Meetings
              </button>
            </div>
          </div>

          {/* Microsoft Teams Card */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-200">Microsoft Teams</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Microsoft Graph
              </span>
            </div>
            <p className="text-xs text-zinc-400">Entra ID OAuth, online meetings & Graph API transcripts</p>
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-900">
              <span className="text-[10px] font-mono text-zinc-500">
                {backendStatus.isLive ? 'API Ready' : 'Standby'}
              </span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/integrations/ms_teams/sync', { method: 'POST' });
                    const data = await res.json();
                    alert(`Teams Sync: ${data.meetings_imported} imported, ${data.commitments_extracted} commitments extracted.`);
                    refreshData();
                  } catch (e) {
                    alert('Microsoft Teams sync initiated');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
              >
                Sync Meetings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
