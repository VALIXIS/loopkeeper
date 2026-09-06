import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlertIcon, CheckCircleIcon, KeyIcon, ArrowRightIcon } from './Icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { employees, switchUser, currentUser } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectAccount = (empId: string) => {
    switchUser(empId);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    const found = employees.find(
      e => e.email.toLowerCase() === emailInput.trim().toLowerCase() ||
           e.name.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (found) {
      switchUser(found.id);
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('User not found. Try one of the quick profile buttons below.');
    }
  };

  const managers = employees.filter(e => e.is_manager || e.role?.toLowerCase().includes('manager'));
  const teamEmployees = employees.filter(e => !e.is_manager && !e.role?.toLowerCase().includes('manager'));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="VALIXIS Portal - LoopKeeper Auth" maxWidth="xl">
      <div className="space-y-5 py-1 text-left">
        {/* Portal Header Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900/90 to-cyan-900/60 border border-indigo-500/30 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlertIcon size={18} className="text-cyan-400" />
                <span className="font-mono text-xs font-extrabold text-cyan-300 tracking-wider">
                  VALIXIS IDENTITY & ROLE PORTAL
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Select User Profile & Session</h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Managers hold full team oversight. Employees access their scoped task view.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE SESSION
              </span>
            </div>
          </div>
        </div>

        {/* Custom Email Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3 p-4 rounded-xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800">
          <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <KeyIcon size={14} className="text-indigo-500" />
            <span>Login with Corporate Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Email or Username</label>
              <input
                type="text"
                placeholder="e.g. nagasubhash55@gmail.com or Subhash"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {errorMsg && <p className="text-xs font-semibold text-rose-500">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Authenticate & Log In</span>
            <ArrowRightIcon size={13} />
          </button>
        </form>

        {/* 1-Click Quick Profile Switcher */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
            <span>Quick 1-Click Profile Switcher</span>
            <span className="text-[10px] text-slate-500 font-normal">Click any user to test their view</span>
          </div>

          {/* Managers Section */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-extrabold font-mono text-purple-600 dark:text-purple-400 flex items-center gap-1 uppercase tracking-wider">
              <span>👑 Managers (Full Portal Access)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {managers.map(m => {
                const isActive = m.id === currentUser.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectAccount(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-purple-600/15 border-purple-500 text-purple-900 dark:text-purple-100 shadow-md ring-2 ring-purple-500/40'
                        : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-purple-400 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{m.name}</span>
                        <span className="text-[9px] font-mono font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md">
                          MANAGER
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{m.role}</span>
                    </div>
                    {isActive ? (
                      <CheckCircleIcon size={16} className="text-purple-500 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 shrink-0">Switch ↗</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employees Section */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] font-extrabold font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1 uppercase tracking-wider">
              <span>👤 Employees (Scoped Task View Only)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teamEmployees.map(e => {
                const isActive = e.id === currentUser.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => handleSelectAccount(e.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-cyan-600/15 border-cyan-500 text-cyan-900 dark:text-cyan-100 shadow-md ring-2 ring-cyan-500/40'
                        : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-cyan-400 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{e.name}</span>
                        <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded-md">
                          EMPLOYEE
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{e.role}</span>
                    </div>
                    {isActive ? (
                      <CheckCircleIcon size={16} className="text-cyan-500 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 shrink-0">Switch ↗</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
