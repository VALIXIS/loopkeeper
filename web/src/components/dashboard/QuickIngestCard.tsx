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
    <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
            <SparklesIcon size={20} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              Instant AI Transcript Pipeline Ingest
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm">
                1-Click Demo
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Ingest raw conversational transcripts to extract commitments, detect owner, and track state transitions.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateMeeting()}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 hover:border-zinc-600 transition-all shadow-md"
        >
          <FileTextIcon size={15} />
          <span>Custom Transcript Ingest</span>
        </button>
      </div>

      {/* Preset Buttons Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SAMPLE_TRANSCRIPTS.map((preset, index) => {
          const isProcessing = processingPreset === index;

          return (
            <div
              key={index}
              className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Preset #{index + 1}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {preset.content.split('\n').length} speaker turns
                  </span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 mt-1 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.content.split('\n')[0]}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickIngest(index)}
                  disabled={processingPreset !== null}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCwIcon size={13} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon size={12} className="fill-current" />
                      <span>Run AI Pipeline</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onOpenCreateMeeting(index)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs"
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
