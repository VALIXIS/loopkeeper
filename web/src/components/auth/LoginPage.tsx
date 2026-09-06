import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircleIcon,
  KeyIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  UsersIcon,
  SparklesIcon,
  ShieldAlertIcon
} from '../common/Icons';

export const LoginPage: React.FC = () => {
  const { login, switchUser } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Explicit demo credentials mapping
  const demoAccounts = [
    {
      id: '9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee',
      name: 'Subhash',
      email: 'nagasubhash55@gmail.com',
      password: 'subhash123',
      role: 'Engineering Manager & Core Lead',
      isManager: true,
      badge: '👑 MANAGER (FULL ACCESS)'
    },
    {
      id: '43e5d5fc-fc54-49bb-8faa-79018cf49348',
      name: 'Jyothsna',
      email: 'jyothsna@valixis.com',
      password: 'jyothsna123',
      role: 'Product & Architecture Lead (Manager)',
      isManager: true,
      badge: '👑 MANAGER (FULL ACCESS)'
    },
    {
      id: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
      name: 'VALIXIS',
      email: 'official.valixis@gmail.com',
      password: 'valixis123',
      role: 'Senior Systems Engineer',
      isManager: false,
      badge: '👤 EMPLOYEE (MY TASKS ONLY)'
    },
    {
      id: '5af2f8a8-a881-408a-8fdd-1fee384f1779',
      name: 'Vignesh',
      email: 'vignesh@valixis.com',
      password: 'vignesh123',
      role: 'Systems & App Developer',
      isManager: false,
      badge: '👤 EMPLOYEE (MY TASKS ONLY)'
    },
    {
      id: '39244951-87a5-44e6-801a-28cb3b1a0ed5',
      name: 'Hasitha',
      email: 'hasitha@valixis.com',
      password: 'hasitha123',
      role: 'QA & Compliance Lead',
      isManager: false,
      badge: '👤 EMPLOYEE (MY TASKS ONLY)'
    },
    {
      id: '8a18fff4-6236-4d54-a29a-eeb3c65dd646',
      name: 'Krishna',
      email: 'krishna@valixis.com',
      password: 'krishna123',
      role: 'Ad Implementation & Backend Engineer',
      isManager: false,
      badge: '👤 EMPLOYEE (MY TASKS ONLY)'
    }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Please enter your work email or username.');
      return;
    }
    const success = login(emailInput.trim(), passwordInput);
    if (!success) {
      setErrorMsg('Invalid email or username. Click any demo account below for 1-click login.');
    } else {
      setErrorMsg('');
    }
  };

  const handleAutoLogin = (acc: typeof demoAccounts[0]) => {
    setEmailInput(acc.email);
    setPasswordInput(acc.password);
    switchUser(acc.id);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Lighting & Tech Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-tech-grid opacity-25" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-6 my-8 animate-fade-in">
        {/* Top Branding Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shadow-lg">
            <CheckCircleIcon size={16} className="text-cyan-400 animate-pulse" />
            <span>VALIXIS LOOPKEEPER ENTERPRISE IDENTITY PORTAL v2.4</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Sign In to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">LoopKeeper</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
            Automated Speech-to-Commitment SLM System with Role-Based Scoping for Managers & Employees.
          </p>
        </div>

        {/* Main Grid: Login Box + Demo Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Login Form (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-zinc-950/80 border border-white/[0.1] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LockIcon size={18} className="text-indigo-400" />
                <span>Account Login</span>
              </h2>
              <p className="text-xs text-slate-400">
                Enter your credentials or click any demo account to auto-fill.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Corporate Email or Username
                </label>
                <div className="relative">
                  <KeyIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. nagasubhash55@gmail.com"
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
                    placeholder="Enter password (or demo pass)"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                <span>Enter Portal Session</span>
                <ArrowRightIcon size={14} />
              </button>
            </form>

            <div className="pt-4 border-t border-white/[0.08] text-center text-[11px] text-slate-500">
              VALIXIS RLS Role Security Enabled • Subhash & Jyothsna Managers
            </div>
          </div>

          {/* Right / Demo User Credentials Directory (7 cols) */}
          <div className="lg:col-span-7 space-y-3 text-left">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <UsersIcon size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-extrabold text-white tracking-wider uppercase">
                    Demo Credentials Directory
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click any profile below to 1-click auto-fill credentials and log in.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                6 PRE-CONFIGURED ACCOUNTS
              </span>
            </div>

            {/* Account List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => handleAutoLogin(acc)}
                  className={`group cursor-pointer p-3.5 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between space-y-2.5 shadow-lg ${
                    acc.isManager
                      ? 'bg-purple-950/30 border-purple-500/40 hover:border-purple-400'
                      : 'bg-zinc-900/60 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[170px] font-medium">
                        {acc.role}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${
                        acc.isManager
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}
                    >
                      {acc.isManager ? 'MANAGER' : 'EMPLOYEE'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/50 border border-white/[0.05] text-[11px] font-mono space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Email:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[140px]">{acc.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Pass:</span>
                      <span className="text-cyan-400 font-semibold">{acc.password}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                      acc.isManager
                        ? 'bg-purple-600/80 hover:bg-purple-600 text-white shadow-md'
                        : 'bg-indigo-600/80 hover:bg-indigo-600 text-white shadow-md'
                    }`}
                  >
                    <SparklesIcon size={12} />
                    <span>Auto-Fill & Log In ⚡</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
