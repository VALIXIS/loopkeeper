import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircleIcon, AlertTriangleIcon, SparklesIcon, XIcon } from './Icons';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        let borderClass = 'border-emerald-500/40 bg-zinc-900/95 text-emerald-300';
        let IconComponent = CheckCircleIcon;

        if (toast.type === 'error') {
          borderClass = 'border-rose-500/40 bg-zinc-900/95 text-rose-300';
          IconComponent = AlertTriangleIcon;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40 bg-zinc-900/95 text-amber-300';
          IconComponent = AlertTriangleIcon;
        } else if (toast.type === 'info') {
          borderClass = 'border-cyan-500/40 bg-zinc-900/95 text-cyan-300';
          IconComponent = SparklesIcon;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            <div className="mt-0.5 shrink-0">
              <IconComponent size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-zinc-100">{toast.title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
