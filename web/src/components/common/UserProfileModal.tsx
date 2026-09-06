import React from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CheckSquareIcon, LogOutIcon } from './Icons';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isManager, logout } = useAuth();
  const { actionItems } = useApp();

  const myTasksCount = actionItems.filter(
    item =>
      item.owner_employee_id === currentUser.id ||
      item.owner_name?.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      (item as any).assigned_to?.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
  ).length;

  const handleSignOut = () => {
    onClose();
    logout();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile & Session Information" maxWidth="md">
      <div className="space-y-5 text-left py-1 font-sans">
        {/* User Header Profile Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-xl shadow-lg ring-2 ring-cyan-400/40 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white truncate">{currentUser.name}</h2>
              <span
                className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                  isManager
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}
              >
                {isManager ? '👑 MANAGER' : '👤 EMPLOYEE'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate">{currentUser.role}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{currentUser.email}</p>
          </div>
        </div>

        {/* Detailed User Data Breakdown */}
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Department</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.department || 'Engineering'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-slate-400 font-medium">System Access Level</span>
            <span className={`font-semibold font-mono text-[11px] ${isManager ? 'text-purple-600 dark:text-purple-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
              {isManager ? 'Full Team Oversight & Analytics' : 'Scoped Personal Commitments'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-zinc-800/80">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <CheckSquareIcon size={14} className="text-indigo-500" />
              <span>Assigned Active Commitments</span>
            </span>
            <span className="font-extrabold font-mono text-indigo-600 dark:text-indigo-400">{myTasksCount} Active</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Security Policy</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">VALIXIS RLS Active</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            Close
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <LogOutIcon size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
