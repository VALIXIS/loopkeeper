import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from '../../context/RouterContext';
import { UserProfileModal } from './UserProfileModal';
import {
  BrainIcon,
  SparklesIcon,
  PlusIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  RadioIcon,
  XIcon
} from './Icons';

interface NavbarProps {
  onOpenCreateMeeting: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateMeeting }) => {
  const { currentUser, isManager } = useAuth();
  const { backendStatus, forceMockMode, setForceMockMode } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { navigate } = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showAiInspector, setShowAiInspector] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 w-full">
        {/* Left Branding */}
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
              <BrainIcon size={20} className="text-cyan-400 animate-pulse-glow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                LOOPKEEPER
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAiInspector(true);
                }}
                className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30 tracking-wider hover:bg-indigo-500/30 transition-all flex items-center gap-1 shadow-sm"
                title="Inspect AI Engine & Model Telemetry"
              >
                <SparklesIcon size={10} className="text-cyan-300" />
                <span>AI ENGINE</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              From Spoken Commitments to Verified Deliverables
            </p>
          </div>
        </div>

        {/* Right Controls & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Backend Status Pill */}
          <div
            onClick={() => setShowAiInspector(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08] text-xs shadow-inner cursor-pointer hover:border-cyan-500/40 transition-all"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendStatus.isLive && !forceMockMode
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-ping'
                  : 'bg-indigo-400'
              }`}
            />
            <span className="text-slate-300 font-medium text-[11px]">
              {forceMockMode
                ? 'Offline Resilient'
                : backendStatus.isLive
                ? 'FastAPI Live'
                : 'Local SLM Engine'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setForceMockMode(!forceMockMode);
              }}
              className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors ml-1 font-mono underline"
              title="Toggle between Live API and offline fallback engine"
            >
              ({forceMockMode ? 'Connect Live' : 'Use Local'})
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/[0.08] hover:border-cyan-500/40 transition-all hover:shadow-md"
            title="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>

          {/* Quick Record Navigation */}
          <button
            onClick={() => navigate('/recording')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all"
          >
            <RadioIcon size={14} className="text-rose-500 animate-pulse" />
            <span>Record</span>
          </button>

          {/* New Ingestion Button */}
          <button
            onClick={onOpenCreateMeeting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/30"
          >
            <PlusIcon size={15} />
            <span className="hidden sm:inline">Ingest Meeting</span>
            <SparklesIcon size={12} className="text-cyan-200" />
          </button>

          {/* Current Logged User Profile Button (Opens User Profile Modal) */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] hover:border-indigo-500/50 transition-all cursor-pointer shadow-md"
            title="Click to view logged-in user profile & data"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs ring-1 ring-cyan-500/50 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                {currentUser.name}
                {isManager && (
                  <span className="text-[10px] text-purple-400 font-bold font-mono">(Lead)</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {currentUser.role}
              </div>
            </div>
            <ChevronDownIcon size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* AI Telemetry & Model Inspector Modal */}
      {showAiInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated border border-indigo-500/40 p-6 shadow-2xl space-y-5 text-left text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md">
                  <BrainIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    LoopKeeper AI Engine Telemetry
                  </h3>
                  <p className="text-xs text-zinc-400">Live Model & Vector Index Inspector</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiInspector(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Primary SLM Model:</span>
                  <span className="text-cyan-300 font-bold">loopkeeper-slm-v1 (1.2.0)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Extraction Latency:</span>
                  <span className="text-emerald-300 font-bold">168ms (Low-Cost Local)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fallback LLM Provider:</span>
                  <span className="text-indigo-300 font-bold">Google Gemini 1.5 Flash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Confidence Threshold:</span>
                  <span className="text-amber-300 font-bold">0.85 (Auto-Fallback Active)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vector Database:</span>
                  <span className="text-cyan-300 font-bold">PostgreSQL pgvector (384-dim)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Deduplication Metric:</span>
                  <span className="text-emerald-300 font-bold">Cosine Similarity (0.82 Threshold)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">GitHub Proof-of-Work:</span>
                  <span className="text-emerald-400 font-bold">Webhook Listener Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Jira Integration API:</span>
                  <span className="text-blue-300 font-bold">Atlassian REST API v3 Proxy</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2">
              <SparklesIcon size={16} className="text-cyan-400 shrink-0" />
              <span>Hybrid AI Pipeline: 90% processed via fast local SLM, backed by Google Gemini for 100% reliability.</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowAiInspector(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-md"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
