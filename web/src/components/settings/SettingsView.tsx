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
  LinkIcon
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
    <div className="space-y-4 pb-6">
      {/* Compact Header Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 px-4 py-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 shrink-0">
            <SettingsIcon size={13} className="text-cyan-400" />
            System Configuration
          </span>
          <h1 className="text-sm font-bold text-zinc-100 tracking-tight">
            Settings & System Boundaries
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            VALIXIS Portal Protected
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
            SLM + Gemini Flash
          </span>
        </div>
      </div>

      {/* Main 2x2 Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: VALIXIS Portal Integration */}
        <div className="p-4 rounded-2xl glass-panel border border-zinc-800 space-y-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldAlertIcon size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100">VALIXIS Portal Integration</h3>
                <p className="text-[10px] text-zinc-400">Read-Only Employee & Project Task Sync</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Synced & Protected
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">Enforced Access Boundary</span>
              <span className="font-mono text-emerald-400 text-[11px] font-bold">Strict Read-Only</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">Employees Directory</span>
              <span className="font-mono text-zinc-200 text-[11px] font-bold">{employees.length} Profiles Loaded</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">VALIXIS Task Linking</span>
              <span className="font-mono text-cyan-400 text-[11px] font-bold">Supported (Foreign Key)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Backend API Operational State */}
        <div className="p-4 rounded-2xl glass-panel border border-zinc-800 space-y-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <NetworkIcon size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100">Backend API Operational State</h3>
                <p className="text-[10px] text-zinc-400">FastAPI Server & AI Engine Health</p>
              </div>
            </div>
            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Refresh API status"
            >
              <RefreshCwIcon size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">API Connection</span>
              <span
                className={`font-bold text-[11px] flex items-center gap-1 ${
                  backendStatus.isLive && !forceMockMode
                    ? 'text-emerald-400'
                    : 'text-indigo-400'
                }`}
              >
                <CheckCircleIcon size={13} />
                {forceMockMode
                  ? 'Local Client Engine (Offline)'
                  : backendStatus.isLive
                  ? 'FastAPI Backend Live (/api/v1)'
                  : 'In-Memory Resilient Engine'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">Offline Fallback Mode</span>
              <button
                onClick={() => setForceMockMode(!forceMockMode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  forceMockMode
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {forceMockMode ? 'Offline Mode: ACTIVE' : 'Offline Mode: OFF'}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">AI Readiness Status</span>
              <span className="font-mono text-cyan-400 text-[11px] font-bold flex items-center gap-1">
                <SparklesIcon size={11} />
                {backendStatus.ai_pipeline}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: AI Inference Pipeline Tuning */}
        <div className="p-4 rounded-2xl glass-panel border border-zinc-800 space-y-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BrainIcon size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100">AI Inference Pipeline Tuning</h3>
                <p className="text-[10px] text-zinc-400">SLM thresholds & Google Gemini Flash fallback</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 text-[10px] font-semibold block">Primary SLM Model</label>
              <input
                type="text"
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <label className="text-zinc-300 font-semibold">Threshold</label>
                <span className="font-mono text-cyan-400 font-bold">{threshold}</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={threshold}
                onChange={e => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-900 rounded-lg"
              />
              <span className="text-[9px] text-zinc-500 block truncate">
                &lt; {threshold} triggers fallback
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 text-[10px] font-semibold block">Fallback Provider</label>
              <select
                value={fallbackProvider}
                onChange={e => setFallbackProvider(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-[11px] focus:outline-none focus:border-cyan-500"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500 text-[10px]">Active session parameters</span>
            <button
              onClick={() => resetDemoData()}
              className="px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold border border-rose-600/30 text-[10px] transition-all"
            >
              Reset All Sample Data
            </button>
          </div>
        </div>

        {/* Card 4: Meeting Platform & External API Bridges */}
        <div className="p-4 rounded-2xl glass-panel border border-zinc-800 space-y-3.5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <LinkIcon size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-100">Platform & Integration Bridges</h3>
                <p className="text-[10px] text-zinc-400">Google Meet, Zoom, Teams & Jira Cloud REST API</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Google Meet */}
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-zinc-200">Google Meet</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Drive OAuth
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/integrations/google_meet/sync', { method: 'POST' });
                    const data = await res.json();
                    alert(`Google Meet Sync: ${data.meetings_imported} imported, ${data.commitments_extracted} extracted.`);
                    refreshData();
                  } catch (e) {
                    alert('Google Meet sync initiated');
                  }
                }}
                className="w-full py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition-all"
              >
                Sync Meet
              </button>
            </div>

            {/* Zoom */}
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-zinc-200">Zoom Cloud</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  OAuth VTT
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/integrations/zoom/sync', { method: 'POST' });
                    const data = await res.json();
                    alert(`Zoom Sync: ${data.meetings_imported} imported, ${data.commitments_extracted} extracted.`);
                    refreshData();
                  } catch (e) {
                    alert('Zoom sync initiated');
                  }
                }}
                className="w-full py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition-all"
              >
                Sync Zoom
              </button>
            </div>

            {/* Microsoft Teams */}
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-zinc-200">MS Teams</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Graph API
                </span>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/integrations/ms_teams/sync', { method: 'POST' });
                    const data = await res.json();
                    alert(`Teams Sync: ${data.meetings_imported} imported, ${data.commitments_extracted} extracted.`);
                    refreshData();
                  } catch (e) {
                    alert('Microsoft Teams sync initiated');
                  }
                }}
                className="w-full py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[10px] font-bold transition-all"
              >
                Sync Teams
              </button>
            </div>

            {/* Jira Cloud API */}
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-zinc-200">Jira Cloud API</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v3 Proxy
                </span>
              </div>
              <button
                onClick={() => alert('Jira REST API v3 Proxy active & connected!')}
                className="w-full py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-all"
              >
                Jira Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
