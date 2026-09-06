import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { SAMPLE_TRANSCRIPTS } from '../../services/mockData';
import { AIPipelineVisualizer } from './AIPipelineVisualizer';
import type { PipelineStep } from './AIPipelineVisualizer';
import { useRouter } from '../../context/RouterContext';
import { SparklesIcon, PlayIcon, CalendarIcon, UsersIcon, FileTextIcon, RadioIcon, ExternalLinkIcon } from '../common/Icons';



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
  const { createMeetingAndProcess, navigateToMeeting, addToast } = useApp();
  const { navigate } = useRouter();

  const [modalTab, setModalTab] = useState<'schedule' | 'ingest' | 'record'>('schedule');
  const [selectedProvider, setSelectedProvider] = useState<'google_meet' | 'zoom' | 'ms_teams'>('google_meet');
  const [createdJoinUrl, setCreatedJoinUrl] = useState<string | null>(null);
  const [createdPasscode, setCreatedPasscode] = useState<string | null>(null);

  // In-Modal Recording Studio state
  const [isModalRecording, setIsModalRecording] = useState(false);
  const [modalElapsedSeconds, setModalElapsedSeconds] = useState(0);
  const [modalRecordScreenAudio, setModalRecordScreenAudio] = useState(false);
  const [modalTranscriptLines, setModalTranscriptLines] = useState<Array<{ speaker: string; text: string; time: string }>>([]);
  const [modalTurnInput, setModalTurnInput] = useState('');
  const [modalSpeaker, setModalSpeaker] = useState(currentUser?.name || 'Subhash');

  const modalMediaStreamRef = React.useRef<MediaStream | null>(null);
  const modalMediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const modalRecordedChunksRef = React.useRef<Blob[]>([]);
  const modalRecognitionRef = React.useRef<any>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isModalRecording) {
      interval = setInterval(() => {
        setModalElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isModalRecording]);

  const startModalRecording = async () => {
    modalRecordedChunksRef.current = [];
    setModalTranscriptLines([]);
    try {
      let micStream: MediaStream | null = null;
      let displayStream: MediaStream | null = null;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      }

      if (modalRecordScreenAudio && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).catch(() => null);
      }

      const tracks: MediaStreamTrack[] = [];
      if (micStream) tracks.push(...micStream.getAudioTracks());
      if (displayStream && displayStream.getAudioTracks().length > 0) {
        tracks.push(...displayStream.getAudioTracks());
      }

      if (tracks.length > 0) {
        const combined = new MediaStream(tracks);
        modalMediaStreamRef.current = combined;
        try {
          const recorder = new MediaRecorder(combined);
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) modalRecordedChunksRef.current.push(e.data);
          };
          recorder.start(1000);
          modalMediaRecorderRef.current = recorder;
        } catch {}

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.onresult = (event: any) => {
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  const speechText = event.results[i][0].transcript.trim();
                  if (speechText) {
                    const mins = Math.floor(modalElapsedSeconds / 60).toString().padStart(2, '0');
                    const secs = (modalElapsedSeconds % 60).toString().padStart(2, '0');
                    setModalTranscriptLines(prev => [
                      ...prev,
                      { speaker: modalSpeaker || currentUser?.name || 'Subhash', text: speechText, time: `00:${mins}:${secs}` }
                    ]);
                  }
                }
              }
            };
            recognition.start();
            modalRecognitionRef.current = recognition;
          } catch {}
        }
      }
    } catch {}

    setIsModalRecording(true);
    setModalElapsedSeconds(0);
  };

  const stopModalRecordingAndProcess = async () => {
    if (modalRecognitionRef.current) {
      try { modalRecognitionRef.current.stop(); } catch {}
    }
    if (modalMediaRecorderRef.current && modalMediaRecorderRef.current.state !== 'inactive') {
      try { modalMediaRecorderRef.current.stop(); } catch {}
    }
    if (modalMediaStreamRef.current) {
      modalMediaStreamRef.current.getTracks().forEach(track => track.stop());
      modalMediaStreamRef.current = null;
    }
    setIsModalRecording(false);

    const fullTranscript = modalTranscriptLines.length > 0
      ? modalTranscriptLines.map(t => `[${t.time}] ${t.speaker}: ${t.text}`).join('\n')
      : `[00:00:05] ${currentUser?.name || 'Subhash'}: Live meeting session completed with audio recording stream.`;

    const meetingTitleToUse = title.trim() || 'Live Meeting & Screen Audio Capture';

    setIsProcessing(true);
    setCurrentStepIndex(0);

    try {
      const result = await createMeetingAndProcess(
        {
          title: meetingTitleToUse,
          meeting_date: new Date().toISOString(),
          source: 'loopkeeper_native',
          created_by: currentUser.id,
          participant_ids: selectedParticipants
        },
        {
          content: fullTranscript,
          source_file_name: `${meetingTitleToUse.toLowerCase().replace(/\s+/g, '_')}_live.txt`,
          transcript_format: 'txt'
        },
        (stepIndex) => {
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

  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 16));
  const [transcriptContent, setTranscriptContent] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([currentUser.id]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<PipelineStep[]>(DEFAULT_PIPELINE_STEPS);


  useEffect(() => {
    if (isOpen) {
      if (initialPresetIndex !== undefined && SAMPLE_TRANSCRIPTS[initialPresetIndex]) {
        setModalTab('ingest');
        const preset = SAMPLE_TRANSCRIPTS[initialPresetIndex];
        setTitle(preset.title);
        setTranscriptContent(preset.content);
      } else {
        setTitle('');
        setTranscriptContent('');
        setModalTab('schedule');
      }
      if (employees.length > 0) {
        setSelectedParticipants(employees.map(e => e.id));
      }
      setCreatedJoinUrl(null);
      setCreatedPasscode(null);
      setSteps(DEFAULT_PIPELINE_STEPS);
      setIsProcessing(false);
      setCurrentStepIndex(0);
    }
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
    setCreatedPasscode(null);
    try {
      let joinUrl = '';
      if (selectedProvider === 'google_meet') {
        joinUrl = 'https://meet.google.com/new';
      } else if (selectedProvider === 'zoom') {
        const id = Math.floor(1000000000 + Math.random() * 9000000000);
        const pwd = 'lk' + Math.floor(1000 + Math.random() * 9000);
        joinUrl = `https://zoom.us/j/${id}?pwd=${pwd}`;
        setCreatedPasscode(pwd);
      } else {
        const teamsMeetingId = Math.random().toString(36).substring(2, 10);
        joinUrl = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${teamsMeetingId}%40thread.v2/0?context=%7b%22Tid%22%3a%22loopkeeper-enterprise-tenant%22%7d`;
      }
      setCreatedJoinUrl(joinUrl);

      const invitedEmployees = employees.filter(e => selectedParticipants.includes(e.id));
      const participantNames = invitedEmployees.map(e => e.name).join(', ');
      addToast({
        type: 'success',
        title: 'Meeting Invite & Sync Dispatched',
        message: `Dispatched invite & commitment sync to ${participantNames || 'selected employees'} via Slack Bot & LoopKeeper Inbox.`
      });
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
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-zinc-800 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => { setModalTab('schedule'); setCreatedJoinUrl(null); setCreatedPasscode(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            modalTab === 'schedule'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
              : 'bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          Schedule Meeting (Google Meet / Zoom / Teams)
        </button>
        <button
          type="button"
          onClick={() => { setModalTab('record'); setCreatedJoinUrl(null); setCreatedPasscode(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            modalTab === 'record'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
              : 'bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <RadioIcon size={14} className={modalTab === 'record' ? 'animate-pulse' : 'text-rose-500 dark:text-rose-400'} />
          <span>Live Screen & Audio Recorder</span>
        </button>
        <button
          type="button"
          onClick={() => { setModalTab('ingest'); setCreatedJoinUrl(null); setCreatedPasscode(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            modalTab === 'ingest'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
              : 'bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          Ingest Transcript & SLM Extraction
        </button>
      </div>

      {createdJoinUrl ? (
        <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-cyan-500/40 text-center space-y-4 animate-fade-in">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-xl">
            ✓
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Meeting Link Generated</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            Your {selectedProvider === 'google_meet' ? 'Google Meet' : selectedProvider === 'zoom' ? 'Zoom' : 'Microsoft Teams'} space is ready.
          </p>

          {/* Recommended In-App Studio Box */}
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/40 text-left space-y-2 max-w-lg mx-auto">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center gap-1.5">
                <RadioIcon size={14} className="text-rose-500 dark:text-rose-400 animate-pulse" />
                <span>Recommended: In-App LoopKeeper Meeting Studio</span>
              </span>
              <span className="text-[10px] font-mono bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-200">Built-in AI</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300">
              Launch the built-in meeting room with live microphone recording, real-time waveform visualization, and instant AI commitment extraction.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 font-mono text-xs text-cyan-700 dark:text-cyan-300 select-all overflow-x-auto max-w-lg mx-auto">
            {createdJoinUrl}
          </div>

          {createdPasscode && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono max-w-lg mx-auto flex items-center justify-between px-4">
              <span>Zoom Meeting Passcode: <strong className="font-bold text-slate-900 dark:text-white select-all">{createdPasscode}</strong></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-sans">✓ Auto-Embedded in URL</span>
            </div>
          )}

          {/* Participant Notifications Dispatched List */}
          <div className="p-3.5 rounded-xl bg-slate-200/60 dark:bg-zinc-950/80 border border-slate-300 dark:border-zinc-800 text-left space-y-2 max-w-lg mx-auto">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <UsersIcon size={14} className="text-indigo-500" />
                <span>Participant Notifications Dispatched ({selectedParticipants.length})</span>
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Slack & Inbox Active
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {employees.filter(e => selectedParticipants.includes(e.id)).map(e => (
                <div key={e.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{e.name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">📩 Sent</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const invitedNames = employees.filter(e => selectedParticipants.includes(e.id)).map(e => e.name).join(', ');
                const messageText = `📅 Meeting Invite: ${title || 'LoopKeeper Scheduled Sync'}\n🔗 Join URL: ${createdJoinUrl}${createdPasscode ? `\n🔑 Passcode: ${createdPasscode}` : ''}\n👥 Attendees: ${invitedNames}\n⚡ Sent via LoopKeeper Auto-Commitment Engine`;
                navigator.clipboard.writeText(messageText);
                addToast({
                  type: 'info',
                  title: 'Invite Message Copied',
                  message: 'Formatted meeting invite copied to clipboard!'
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs shadow transition-all flex items-center gap-1.5"
            >
              <span>📋 Copy Invite Message</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/recording');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <RadioIcon size={14} className="text-rose-200 animate-pulse" />
              <span>Launch In-App Studio ↗</span>
            </button>

            {selectedProvider === 'google_meet' ? (
              <a
                href={createdJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                title="Start a real live Google Meet call in Google Meet"
              >
                <span>Start Live Google Meet ↗</span>
                <ExternalLinkIcon size={12} />
              </a>
            ) : selectedProvider === 'zoom' ? (
              <a
                href={createdJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                title="Open Zoom meeting join link directly"
              >
                <span>Open Zoom Meeting Link ↗</span>
                <ExternalLinkIcon size={12} />
              </a>
            ) : (
              <a
                href={createdJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-white/[0.08] transition-all flex items-center gap-1.5"
              >
                <span>Open Platform Link</span>
                <ExternalLinkIcon size={12} />
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      ) : isProcessing ? (

        <div className="py-4 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center justify-center gap-2">
              <SparklesIcon size={20} className="text-cyan-600 dark:text-cyan-400 animate-spin" />
              Processing "{title}"
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
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
      ) : modalTab === 'record' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Live Google Meet Sync & Commitments"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!isModalRecording ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalRecordScreenAudio(!modalRecordScreenAudio)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        modalRecordScreenAudio
                          ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 border-slate-300 dark:border-zinc-800'
                      }`}
                    >
                      <SparklesIcon size={13} className={modalRecordScreenAudio ? 'text-cyan-600 dark:text-cyan-400' : ''} />
                      <span>{modalRecordScreenAudio ? 'Screen Sound On' : '+ Screen Sound'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={startModalRecording}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
                    >
                      <RadioIcon size={14} className="animate-pulse" />
                      <span>Start Recording</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={stopModalRecordingAndProcess}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    <SparklesIcon size={14} className="animate-spin text-cyan-300" />
                    <span>Stop & Extract AI Commitments ({modalElapsedSeconds}s)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Turn Input & Stream */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-zinc-300 flex items-center gap-1.5">
                <FileTextIcon size={14} className="text-cyan-600 dark:text-cyan-400" />
                Live Speech Stream ({modalTranscriptLines.length} turns)
              </span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-500">
                {isModalRecording ? 'REC ACTIVE' : 'READY'}
              </span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800">
              <select
                value={modalSpeaker}
                onChange={e => setModalSpeaker(e.target.value)}
                className="bg-slate-200 dark:bg-zinc-900 text-xs font-bold text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 focus:outline-none shrink-0"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.name}>{e.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={modalTurnInput}
                onChange={e => setModalTurnInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && modalTurnInput.trim()) {
                    e.preventDefault();
                    const mins = Math.floor(modalElapsedSeconds / 60).toString().padStart(2, '0');
                    const secs = (modalElapsedSeconds % 60).toString().padStart(2, '0');
                    setModalTranscriptLines(prev => [
                      ...prev,
                      { speaker: modalSpeaker, text: modalTurnInput.trim(), time: `00:${mins}:${secs}` }
                    ]);
                    setModalTurnInput('');
                  }
                }}
                placeholder="Speak or type turn into live meeting stream..."
                className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none px-1"
              />

              <button
                type="button"
                onClick={() => {
                  if (modalTurnInput.trim()) {
                    const mins = Math.floor(modalElapsedSeconds / 60).toString().padStart(2, '0');
                    const secs = (modalElapsedSeconds % 60).toString().padStart(2, '0');
                    setModalTranscriptLines(prev => [
                      ...prev,
                      { speaker: modalSpeaker, text: modalTurnInput.trim(), time: `00:${mins}:${secs}` }
                    ]);
                    setModalTurnInput('');
                  }
                }}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 transition-colors"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {modalTranscriptLines.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-slate-500 dark:text-zinc-500">
                  0 initial preset lines. Start recording or type live spoken turns above.
                </div>
              ) : (
                modalTranscriptLines.map((turn, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">{turn.speaker}</span>
                      <span className="font-mono text-slate-500 dark:text-zinc-500">{turn.time}</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-zinc-300 font-mono">"{turn.text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={stopModalRecordingAndProcess}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-cyan-500 hover:from-rose-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg transition-all"
            >
              Extract & Launch AI Pipeline
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {modalTab === 'schedule' ? (
            <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Select Meeting Platform *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'google_meet', name: 'Google Meet', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
                  { id: 'zoom', name: 'Zoom Video', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300' },
                  { id: 'ms_teams', name: 'Microsoft Teams', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' }
                ].map(prov => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setSelectedProvider(prov.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      selectedProvider === prov.id
                        ? `${prov.color} ring-2 ring-cyan-400`
                        : 'border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-400 hover:border-slate-400'
                    }`}
                  >
                    {prov.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <SparklesIcon size={14} className="text-cyan-600 dark:text-cyan-400" />
                  <span>Multi-Meeting Continuity Sequence Presets</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">1-Click Load</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_TRANSCRIPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadPreset(idx)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-950/80 hover:bg-slate-200 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-300 text-xs font-semibold border border-slate-200 dark:border-zinc-800 hover:border-cyan-500/40 transition-all text-left truncate flex items-center gap-2 group"
                  >
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
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
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileTextIcon size={14} className="text-cyan-600 dark:text-cyan-400" />
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Sprint 15 Architecture & Delivery Review"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <CalendarIcon size={14} className="text-cyan-600 dark:text-cyan-400" />
                Meeting Timestamp
              </label>
              <input
                type="datetime-local"
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <UsersIcon size={14} className="text-cyan-600 dark:text-cyan-400" />
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
                        ? 'bg-indigo-500/15 dark:bg-indigo-600/30 border-cyan-500/60 text-cyan-700 dark:text-cyan-200 shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-950/80 border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] shrink-0">
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
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Meeting Transcript Text *
                </label>
                <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                  Accepts speaker tags like [00:01:15] Adithya: ...
                </span>
              </div>
              <textarea
                required={modalTab === 'ingest'}
                rows={6}
                value={transcriptContent}
                onChange={e => setTranscriptContent(e.target.value)}
                placeholder={`[00:01:00] Jyothsna: Let's review commitments for tomorrow.\n[00:01:20] Adithya: I will deploy the pgvector migration by Friday 5 PM.\n[00:02:00] Vignesh: I will resolve the auth token refresh bug by tomorrow.`}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 leading-relaxed transition-all"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
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

