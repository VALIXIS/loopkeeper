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
    <div className="rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950 border border-indigo-500/30 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative Glow Orb */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner">
            <SparklesIcon size={20} className="text-cyan-400 animate-pulse-glow" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2.5">
              Instant AI Transcript Ingest & Extraction
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm font-mono tracking-wide">
                Preset Ingest
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingest raw conversational transcripts to extract commitments, resolve assignees, and evaluate multi-meeting continuity.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateMeeting()}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] hover:border-slate-600 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <FileTextIcon size={14} className="text-cyan-400" />
          <span>Custom Transcript Ingest</span>
        </button>
      </div>

      {/* Preset Buttons Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {SAMPLE_TRANSCRIPTS.map((preset, index) => {
          const isProcessing = processingPreset === index;
          const sequencePhases = [
            'Meeting 1 of 3 • Initial Commitments',
            'Meeting 2 of 3 • Revisions & Postponement',
            'Meeting 3 of 3 • Delivery & Verification'
          ];

          return (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] hover:border-indigo-500/60 transition-all duration-200 flex flex-col justify-between gap-3.5 group hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                    {sequencePhases[index] || `Sample ${index + 1}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/[0.04]">
                    {preset.content.split('\n').length} turns
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 mt-2 line-clamp-2 group-hover:text-cyan-300 transition-colors leading-snug">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                  {preset.content.split('\n')[0]}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]">
                <button
                  onClick={() => handleQuickIngest(index)}
                  disabled={processingPreset !== null}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/30"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCwIcon size={13} className="animate-spin text-cyan-200" />
                      <span>Processing AI Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon size={12} className="fill-current text-cyan-300" />
                      <span>Run AI Pipeline</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onOpenCreateMeeting(index)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/[0.08] text-xs transition-colors"
                  title="Inspect and edit transcript before ingestion"
                >
                  <FileTextIcon size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
