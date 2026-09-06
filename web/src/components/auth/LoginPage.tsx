import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircleIcon,
  KeyIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ShieldAlertIcon,
  UsersIcon
} from '../common/Icons';

export const LoginPage: React.FC = () => {
  const { login, switchUser, employees } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Please enter your work email or username.');
      return;
    }
    const success = login(emailInput.trim(), passwordInput);
    if (!success) {
      setErrorMsg('Account not found. Please enter a valid team email or username.');
    } else {
      setErrorMsg('');
    }
  };

  const handleQuickSelect = (empId: string, email: string) => {
    setEmailInput(email);
    setPasswordInput('••••••••');
    switchUser(empId);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient Lighting & Tech Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-tech-grid opacity-25" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6 my-8 animate-fade-in text-center">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shadow-lg">
            <CheckCircleIcon size={15} className="text-cyan-400 animate-pulse" />
            <span>VALIXIS LOOPKEEPER IDENTITY PORTAL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Sign In to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">LoopKeeper</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Speech-to-Commitment SLM Engine • Role Scoping Enabled
          </p>
        </div>

        {/* Centered Login Box */}
        <div className="rounded-3xl bg-zinc-950/85 border border-white/[0.1] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 text-left">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <LockIcon size={16} className="text-indigo-400" />
              <span>Authentication Gateway</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sign in with your corporate email or select your team profile.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email or Username
              </label>
              <div className="relative">
                <KeyIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="nagasubhash55@gmail.com, Subhash, or Jyothsna"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <LockIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <ShieldAlertIcon size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 hover:from-indigo-500 hover:via-cyan-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Sign In to Portal</span>
              <ArrowRightIcon size={14} />
            </button>
          </form>

          {/* Quick Select Profile Pills */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <UsersIcon size={12} className="text-indigo-400" />
                <span>Quick Team Selector</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Click to sign in</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {employees.slice(0, 5).map(emp => (
                <button
                  key={emp.id}
                  onClick={() => handleQuickSelect(emp.id, emp.email)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1 ${
                    emp.is_manager
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:border-purple-400'
                      : 'bg-zinc-900 text-slate-300 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <span className="font-bold">{emp.name}</span>
                  {emp.is_manager && <span className="text-[9px] text-purple-400 font-mono">👑</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          VALIXIS RLS Role Security Enabled • Subhash & Jyothsna Managers
        </div>
      </div>
    </div>
  );
};
