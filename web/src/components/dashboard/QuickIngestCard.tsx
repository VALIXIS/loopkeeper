import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_TRANSCRIPTS } from '../../services/mockData';
import { SparklesIcon, PlayIcon, FileTextIcon, RefreshCwIcon } from '../common/Icons';

interface QuickIngestCardProps {
  onOpenCreateMeeting: (presetIndex?: number) => void;
}

export const QuickIngestCard: React.FC<QuickIngestCardProps> = ({ onOpenCreateMeeting }) => {
  const { createMeetingAndProcess, navigateToMeeting } = useApp();
  const [processingPreset, setProcessingPreset] = useState<number | null>(null);

  const handleQuickIngest = async (index: number) => {
    const preset = SAMPLE_TRANSCRIPTS[index];
    setProcessingPreset(index);
    try {
      const result = await createMeetingAndProcess(
        {
          title: preset.title,
          meeting_date: preset.date,
          source: 'transcript'
        },
        {
          content: preset.content,
          source_file_name: `${preset.title.toLowerCase().replace(/\s+/g, '_')}.txt`,
          transcript_format: 'txt'
        }
      );
      navigateToMeeting(result.meeting.id);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingPreset(null);
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-indigo-500/30 dark:border-indigo-500/40 p-4 shadow-lg relative overflow-hidden backdrop-blur-xl space-y-3">
      {/* Decorative Glow Orb */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
            <SparklesIcon size={16} className="text-cyan-600 dark:text-cyan-400 animate-pulse-glow" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Instant AI Transcript Ingest & Extraction
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-mono">
                Preset Ingest
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Select a sample standup transcript to run extraction and drift detection.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateMeeting()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] transition-all"
        >
          <FileTextIcon size={13} className="text-cyan-400" />
          <span>Custom Ingest</span>
        </button>
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SAMPLE_TRANSCRIPTS.map((preset, index) => {
          const isProcessing = processingPreset === index;
          const sequencePhases = [
            '1 • Commitments',
            '2 • Revisions',
            '3 • Delivery'
          ];

          return (
            <div
              key={index}
              className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.08] hover:border-indigo-500/60 transition-all flex flex-col justify-between gap-2 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                    {sequencePhases[index] || `Sample ${index + 1}`}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-white/[0.04]">
                    {preset.content.split('\n').length} turns
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 mt-1 truncate group-hover:text-cyan-300 transition-colors">
                  {preset.title}
                </h4>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
                <button
                  onClick={() => handleQuickIngest(index)}
                  disabled={processingPreset !== null}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50 border border-indigo-400/30"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCwIcon size={12} className="animate-spin text-cyan-200" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon size={11} className="fill-current text-cyan-300" />
                      <span>Run Pipeline</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onOpenCreateMeeting(index)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.08] text-xs transition-colors"
                  title="Inspect transcript"
                >
                  <FileTextIcon size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
