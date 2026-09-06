import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  RadioIcon
} from './Icons';

interface NavbarProps {
  onOpenCreateMeeting: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateMeeting }) => {
  const { currentUser, isManager } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { navigate } = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
              <span
                className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30 tracking-wider flex items-center gap-1 shadow-sm"
                title="AI Engine Active"
              >
                <SparklesIcon size={10} className="text-cyan-300" />
                <span>AI ENGINE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              From Spoken Commitments to Verified Deliverables
            </p>
          </div>
        </div>

        {/* Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
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
    </header>
  );
};

export default Navbar;
