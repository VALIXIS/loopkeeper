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

  const lines = content.split('\n').filter(l => l.trim().length > 0);

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
    return 'text-zinc-300 bg-zinc-800 border-zinc-700';
  };

  return (
    <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-xl flex flex-col h-full">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-zinc-800 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <FileTextIcon size={18} className="text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-200">
            {sourceFileName || 'Meeting Transcript'}
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5"
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
      <div className="p-4 space-y-3 overflow-y-auto max-h-[550px] font-sans">
        {lines.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
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
                className={`p-3 rounded-xl border transition-all ${
                  isHighlighted
                    ? 'bg-indigo-950/60 border-cyan-500/70 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500'
                    : isActionTurn
                    ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                    : 'bg-zinc-950/40 border-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    {speaker ? (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getSpeakerColor(
                          speaker
                        )}`}
                      >
                        {speaker}
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">Unknown Speaker</span>
                    )}

                    {isActionTurn && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-semibold bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-500/30">
                        <SparklesIcon size={10} /> Action Turn
                      </span>
                    )}
                  </div>

                  {timestamp && (
                    <span className="text-[10px] font-mono text-zinc-500">{timestamp}</span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed pl-1">{speechText}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
