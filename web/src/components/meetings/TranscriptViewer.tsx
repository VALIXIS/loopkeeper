import React, { useState } from 'react';
import { SearchIcon, FileTextIcon, SparklesIcon, CheckIcon } from '../common/Icons';

interface TranscriptViewerProps {
  content: string;
  sourceFileName?: string | null;
  highlightText?: string | null;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  content,
  sourceFileName,
  highlightText
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const highlightedRef = React.useRef<HTMLDivElement>(null);

  const lines = content.split('\n').filter(l => l.trim().length > 0);

  // Auto-scroll to highlighted evidence
  React.useEffect(() => {
    if (highlightText && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [highlightText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSpeakerColor = (speaker: string) => {
    const s = speaker.toLowerCase();
    if (s.includes('jyothsna')) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (s.includes('alice')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (s.includes('bob')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (s.includes('charlie')) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (s.includes('diana')) return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    if (s.includes('priya')) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    return 'text-slate-300 bg-slate-800 border-slate-700';
  };

  return (
    <div className="rounded-3xl bg-slate-950/90 border border-white/[0.08] overflow-hidden shadow-2xl flex flex-col h-full backdrop-blur-xl">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/[0.08] bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <FileTextIcon size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              {sourceFileName || 'Meeting Transcript Stream'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">({lines.length} speech turns indexed)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <SearchIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 font-sans"
            />
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-white/[0.08] transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <CheckIcon size={13} className="text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <span>Copy Raw</span>
            )}
          </button>
        </div>
      </div>

      {/* Transcript Body */}
      <div ref={containerRef} className="p-4 space-y-3 overflow-y-auto max-h-[550px] font-sans scroll-smooth">
        {lines.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No transcript text available for this meeting.
          </div>
        ) : (
          lines.map((line, idx) => {
            // Check if matches search
            if (searchQuery && !line.toLowerCase().includes(searchQuery.toLowerCase())) {
              return null;
            }

            // Check if matches highlight snippet
            const isHighlighted =
              highlightText &&
              (line.toLowerCase().includes(highlightText.toLowerCase()) ||
                highlightText.toLowerCase().includes(line.toLowerCase().substring(0, 30)));

            // Extract timestamp & speaker
            const timeMatch = line.match(/^\[(.*?)\]/);
            const timestamp = timeMatch ? timeMatch[1] : null;

            let restOfLine = timeMatch ? line.substring(timeMatch[0].length).trim() : line;
            const speakerMatch = restOfLine.match(/^([^:]+):/);
            const speaker = speakerMatch ? speakerMatch[1].trim() : null;
            const speechText = speakerMatch
              ? restOfLine.substring(speakerMatch[0].length).trim()
              : restOfLine;

            const isActionTurn =
              speechText.toLowerCase().includes('will') ||
              speechText.toLowerCase().includes('need to') ||
              speechText.toLowerCase().includes('finish') ||
              speechText.toLowerCase().includes('deploy');

            return (
              <div
                key={idx}
                ref={isHighlighted ? highlightedRef : undefined}
                className={`p-3.5 rounded-2xl border transition-all duration-300 relative ${
                  isHighlighted
                    ? 'bg-indigo-950/70 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/60 scale-[1.01]'
                    : isActionTurn
                    ? 'bg-slate-900/60 border-white/[0.08] hover:border-slate-600'
                    : 'bg-slate-950/40 border-white/[0.04]'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-cyan-400 shadow-lg shadow-cyan-400/80" />
                )}

                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    {speaker ? (
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border font-mono ${getSpeakerColor(
                          speaker
                        )}`}
                      >
                        {speaker}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Unknown Speaker</span>
                    )}

                    {isActionTurn && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        <SparklesIcon size={10} /> Action Turn
                      </span>
                    )}

                    {isHighlighted && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40 animate-pulse">
                        ● VERIFIED EVIDENCE ANCHOR
                      </span>
                    )}
                  </div>

                  {timestamp && (
                    <span className="text-[10px] font-mono text-slate-500">{timestamp}</span>
                  )}
                </div>

                <p className={`text-xs leading-relaxed pl-1 ${isHighlighted ? 'text-white font-medium' : 'text-slate-300'}`}>
                  {speechText}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
