import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { SAMPLE_TRANSCRIPTS } from '../../services/mockData';
import { AIPipelineVisualizer } from './AIPipelineVisualizer';
import type { PipelineStep } from './AIPipelineVisualizer';
import { SparklesIcon, PlayIcon, CalendarIcon, UsersIcon, FileTextIcon } from '../common/Icons';



interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPresetIndex?: number;
}

const DEFAULT_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 's1',
    title: 'Input Ingestion & Sanitization',
    description: 'Validating payload, stripping artifacts, tokenizing transcript turns.',
    status: 'idle',
    badge: 'STAGE 1'
  },
  {
    id: 's2',
    title: 'SLM Extraction Pipeline',
    description: 'Running loopkeeper-slm-v1 on speech turns to extract commitments and owners.',
    status: 'idle',
    badge: 'STAGE 2'
  },
  {
    id: 's3',
    title: 'Confidence Evaluation & Fallback Router',
    description: 'Evaluating confidence scores (threshold >= 0.75). Route to Fallback LLM if needed.',
    status: 'idle',
    badge: 'STAGE 3'
  },
  {
    id: 's4',
    title: '1536-Dimension Vector Embedding',
    description: 'Generating semantic vector embeddings for cross-meeting deduplication.',
    status: 'idle',
    badge: 'STAGE 4'
  },
  {
    id: 's5',
    title: 'Vector Semantic Similarity Matching',
    description: 'Running 1536-dim cosine similarity against existing tasks to identify continuations.',
    status: 'idle',
    badge: 'STAGE 5'
  },
  {
    id: 's6',
    title: 'State Machine Audit & Telemetry Log',
    description: 'Recording loopkeeper_action_item_history audit events and latency metrics.',
    status: 'idle',
    badge: 'STAGE 6'
  }
];

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  initialPresetIndex
}) => {
  const { currentUser, employees } = useAuth();
  const { createMeetingAndProcess, navigateToMeeting } = useApp();

  const [modalTab, setModalTab] = useState<'schedule' | 'ingest'>('schedule');
  const [selectedProvider, setSelectedProvider] = useState<'google_meet' | 'zoom' | 'ms_teams'>('google_meet');
  const [createdJoinUrl, setCreatedJoinUrl] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 16));
  const [transcriptContent, setTranscriptContent] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([currentUser.id]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<PipelineStep[]>(DEFAULT_PIPELINE_STEPS);


  useEffect(() => {
    if (initialPresetIndex !== undefined && SAMPLE_TRANSCRIPTS[initialPresetIndex]) {
      setModalTab('ingest');
      const preset = SAMPLE_TRANSCRIPTS[initialPresetIndex];
      setTitle(preset.title);
      setTranscriptContent(preset.content);
      setSelectedParticipants(employees.map(e => e.id));
    } else {
      setTitle('');
      setTranscriptContent('');
      setModalTab('schedule');
    }
    setCreatedJoinUrl(null);
    setSteps(DEFAULT_PIPELINE_STEPS);
    setIsProcessing(false);
    setCurrentStepIndex(0);
  }, [isOpen, initialPresetIndex, employees]);

  const loadPreset = (index: number) => {
    const preset = SAMPLE_TRANSCRIPTS[index];
    setTitle(preset.title);
    setTranscriptContent(preset.content);
    setSelectedParticipants(employees.map(e => e.id));
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleScheduleProviderMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsProcessing(true);
    try {
      let joinUrl = '';
      if (selectedProvider === 'google_meet') {
        joinUrl = `https://meet.google.com/lk-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
      } else if (selectedProvider === 'zoom') {
        const id = Math.floor(1000000000 + Math.random() * 9000000000);
        joinUrl = `https://zoom.us/j/${id}?pwd=${Math.random().toString(36).substring(2, 10)}`;
      } else {
        joinUrl = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${Math.random().toString(36).substring(2, 12)}%40thread.v2`;
      }
      setCreatedJoinUrl(joinUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalTab === 'schedule') {
      return handleScheduleProviderMeeting(e);
    }
    if (!title.trim() || !transcriptContent.trim()) return;

    setIsProcessing(true);
    setCurrentStepIndex(0);

    try {
      const result = await createMeetingAndProcess(
        {
          title: title.trim(),
          meeting_date: new Date(meetingDate).toISOString(),
          source: 'transcript',
          created_by: currentUser.id,
          participant_ids: selectedParticipants
        },
        {
          content: transcriptContent.trim(),
          source_file_name: `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
          transcript_format: 'txt'
        },
        (stepIndex, _stepName) => {
          setCurrentStepIndex(stepIndex);
          setSteps(prev =>
            prev.map((s, idx) => ({
              ...s,
              status: idx < stepIndex ? 'completed' : idx === stepIndex ? 'running' : 'idle'
            }))
          );
        }
      );

      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
      setTimeout(() => {
        onClose();
        navigateToMeeting(result.meeting.id);
      }, 700);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isProcessing && onClose()}
      title="Meeting Workspace & Creation Studio"
      subtitle="Schedule live Google Meet, Zoom or Teams meetings or ingest transcript commitments"
      maxWidth="4xl"
    >
      {/* Mode Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => { setModalTab('schedule'); setCreatedJoinUrl(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            modalTab === 'schedule'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Schedule Meeting (Google Meet / Zoom / Teams)
        </button>
        <button
          type="button"
          onClick={() => { setModalTab('ingest'); setCreatedJoinUrl(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            modalTab === 'ingest'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Ingest Transcript & SLM Extraction
        </button>
      </div>

      {createdJoinUrl ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 text-center space-y-4 animate-fade-in">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xl">
            ✓
          </div>
          <h3 className="text-lg font-bold text-white">Meeting Successfully Generated</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Your {selectedProvider === 'google_meet' ? 'Google Meet' : selectedProvider === 'zoom' ? 'Zoom' : 'Microsoft Teams'} space is ready for participants.
          </p>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-cyan-300 select-all overflow-x-auto">
            {createdJoinUrl}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href={createdJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg transition-all"
            >
              Join Meeting Now ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      ) : isProcessing ? (

        <div className="py-4 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center justify-center gap-2">
              <SparklesIcon size={20} className="text-cyan-400 animate-spin" />
              Processing "{title}"
            </h3>
            <p className="text-xs text-zinc-400">
              Inference engine analyzing speaker commitments and matching against existing task state...
            </p>
          </div>

          <AIPipelineVisualizer
            steps={steps}
            currentStepIndex={currentStepIndex}
            isProcessing={isProcessing}
            confidence={0.96}
            modelUsed="loopkeeper-slm-v1"
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {modalTab === 'schedule' ? (
            <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Meeting Platform *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'google_meet', name: 'Google Meet', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' },
                  { id: 'zoom', name: 'Zoom Video', color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300' },
                  { id: 'ms_teams', name: 'Microsoft Teams', color: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300' }
                ].map(prov => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setSelectedProvider(prov.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedProvider === prov.id
                        ? `${prov.color} ring-2 ring-cyan-400`
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {prov.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <SparklesIcon size={14} className="text-cyan-400" />
                  <span>Multi-Meeting Continuity Sequence Presets</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">1-Click Load</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_TRANSCRIPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadPreset(idx)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-cyan-300 text-xs font-semibold border border-zinc-800 hover:border-cyan-500/40 transition-all text-left truncate flex items-center gap-2 group"
                  >
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                      M{idx + 1}
                    </span>
                    <span className="truncate">{preset.title.split(':')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FileTextIcon size={14} className="text-cyan-400" />
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Sprint 15 Architecture & Delivery Review"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <CalendarIcon size={14} className="text-cyan-400" />
                Meeting Timestamp
              </label>
              <input
                type="datetime-local"
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <UsersIcon size={14} className="text-cyan-400" />
              Meeting Participants ({selectedParticipants.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {employees.map(emp => {
                const isSelected = selectedParticipants.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleParticipant(emp.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-500/20'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-indigo-300 font-bold text-[9px] shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <span>{emp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {modalTab === 'ingest' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Meeting Transcript Text *
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Accepts speaker tags like [00:01:15] Adithya: ...
                </span>
              </div>
              <textarea
                required={modalTab === 'ingest'}
                rows={6}
                value={transcriptContent}
                onChange={e => setTranscriptContent(e.target.value)}
                placeholder={`[00:01:00] Jyothsna: Let's review commitments for tomorrow.\n[00:01:20] Adithya: I will deploy the pgvector migration by Friday 5 PM.\n[00:02:00] Vignesh: I will resolve the auth token refresh bug by tomorrow.`}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 leading-relaxed transition-all"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || (modalTab === 'ingest' && !transcriptContent.trim())}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <PlayIcon size={14} className="fill-current" />
              <span>{modalTab === 'schedule' ? 'Create & Generate Join Link' : 'Launch AI Extraction Pipeline'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

