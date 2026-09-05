import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  BrainIcon,
  SparklesIcon,
  RefreshCwIcon,
  PlusIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from './Icons';

interface NavbarProps {
  onOpenCreateMeeting: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateMeeting }) => {
  const { currentUser, employees, switchUser } = useAuth();
  const { backendStatus, forceMockMode, setForceMockMode, refreshData, loading, theme, toggleTheme } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
              <BrainIcon size={20} className="text-cyan-400 animate-pulse-glow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                LOOPKEEPER
              </span>
              <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30 tracking-wider">
                AI ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              From Meeting Promises to Completed Work
            </p>
          </div>
        </div>

        {/* Right Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Backend Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08] text-xs shadow-inner">
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
                : 'Local Engine'}
            </span>
            <button
              onClick={() => setForceMockMode(!forceMockMode)}
              className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors ml-1 font-mono underline"
              title="Toggle between Live API and offline fallback engine"
            >
              ({forceMockMode ? 'Connect Live' : 'Use Local'})
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/[0.08] hover:border-indigo-500/40 transition-all disabled:opacity-50 hover:shadow-md"
            title="Refresh application data"
          >
            <RefreshCwIcon size={15} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/[0.08] hover:border-indigo-500/40 transition-all hover:shadow-md"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? (
              <SunIcon size={15} className="text-amber-400" />
            ) : (
              <MoonIcon size={15} className="text-indigo-400" />
            )}
          </button>

          {/* Quick Ingest Button */}
          <button
            onClick={onOpenCreateMeeting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/30"
          >
            <PlusIcon size={15} />
            <span className="hidden sm:inline">Ingest Meeting</span>
            <SparklesIcon size={12} className="text-cyan-200" />
          </button>

          {/* Persona / User Selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] hover:border-slate-700 transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs ring-1 ring-cyan-500/50 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  {currentUser.name}
                  {currentUser.is_manager && (
                    <span className="text-[10px] text-emerald-400 font-normal">(Lead)</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDownIcon size={14} className="text-slate-400" />
            </button>

            {/* Persona Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-fade-in-up"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Switch Active User</span>
                  <span className="text-cyan-400 font-mono">VALIXIS RLS</span>
                </div>
                <div className="mt-1 space-y-1 max-h-64 overflow-y-auto">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => switchUser(emp.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        emp.id === currentUser.id
                          ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 shadow-inner'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-slate-200 font-bold text-[10px] ring-1 ring-white/10 shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 truncate">
                        <div className="font-medium flex items-center justify-between">
                          {emp.name}
                          {emp.is_manager && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Manager
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{emp.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
