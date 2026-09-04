import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  BrainIcon,
  SparklesIcon,
  RefreshCwIcon,
  PlusIcon,
  ChevronDownIcon
} from './Icons';

interface NavbarProps {
  onOpenCreateMeeting: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateMeeting }) => {
  const { currentUser, employees, switchUser } = useAuth();
  const { backendStatus, forceMockMode, setForceMockMode, refreshData, loading } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <BrainIcon size={22} className="text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-zinc-100 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text">
                LOOPKEEPER
              </span>
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/40">
                AI ENGINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
              From Meeting Promises to Completed Work
            </p>
          </div>
        </div>

        {/* Right Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Backend Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                backendStatus.isLive && !forceMockMode
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-ping'
                  : 'bg-indigo-400'
              }`}
            />
            <span className="text-zinc-300 font-medium">
              {forceMockMode
                ? 'Offline Engine'
                : backendStatus.isLive
                ? 'FastAPI Live'
                : 'Local Engine'}
            </span>
            <button
              onClick={() => setForceMockMode(!forceMockMode)}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 underline ml-1"
              title="Toggle between Live API and offline fallback engine"
            >
              ({forceMockMode ? 'Connect Live' : 'Use Local'})
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50"
            title="Refresh application data"
          >
            <RefreshCwIcon size={16} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>

          {/* Quick Ingest Button */}
          <button
            onClick={onOpenCreateMeeting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Ingest Meeting</span>
            <SparklesIcon size={13} className="text-cyan-200" />
          </button>

          {/* Persona / User Selector */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all"
            >
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-cyan-500/50"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                  {currentUser.name}
                  {currentUser.is_manager && (
                    <span className="text-[10px] text-emerald-400 font-normal">(Lead)</span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDownIcon size={14} className="text-zinc-400" />
            </button>

            {/* Persona Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  Switch Active User
                </div>
                <div className="mt-1 space-y-1">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => switchUser(emp.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                        emp.id === currentUser.id
                          ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                      }`}
                    >
                      <img
                        src={emp.avatar_url}
                        alt={emp.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <div className="flex-1 truncate">
                        <div className="font-medium flex items-center justify-between">
                          {emp.name}
                          {emp.is_manager && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              Manager
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">{emp.role}</div>
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
