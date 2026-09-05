import React from 'react';

interface ConfidenceMeterProps {
  score: number; // 0.0 to 1.0
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  showLabel = true,
  size = 'md'
}) => {
  const percentage = Math.round(score * 100);

  let colorClass = 'bg-emerald-500';
  let textClass = 'text-emerald-400';
  let badgeText = 'High Confidence';

  if (score < 0.75) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-400';
    badgeText = 'Needs Review';
  } else if (score < 0.90) {
    colorClass = 'bg-cyan-500';
    textClass = 'text-cyan-400';
    badgeText = 'Confident';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="flex flex-col gap-1 min-w-[100px]" title={`AI Confidence Score: ${percentage}% (${badgeText})`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400">AI Confidence</span>
          <span className={`font-mono font-semibold ${textClass}`}>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50 ${heightClass}`}>
        <div
          className={`${heightClass} ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
