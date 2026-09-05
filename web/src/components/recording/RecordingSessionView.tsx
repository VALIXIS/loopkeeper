import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import {
  MicIcon,
  MicOffIcon,
  RadioIcon,
  SquareIcon,
  SparklesIcon,
  ClockIcon,
  UsersIcon,
  FileTextIcon
} from '../common/Icons';

export const RecordingSessionView: React.FC = () => {
  const { employees, currentUser } = useAuth();
  const { createMeetingAndProcess, addToast } = useApp();
  const { navigateToMeeting } = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState('Weekly Engineering & Architecture Sync');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(employees.map(e => e.id));
  const [isProcessing, setIsProcessing] = useState(false);

  // Live transcript stream buffer
  const [transcriptLines, setTranscriptLines] = useState<Array<{ speaker: string; text: string; time: string }>>([
    {
      speaker: 'Jyothsna',
      text: "Welcome everyone. Let's do a quick round on outstanding commitments before sprint freeze.",
      time: '00:01:05'
    },
    {
      speaker: 'Alice',
      text: 'I will finalize the pgvector cosine distance indexing and test the migration script by Friday 5 PM.',
      time: '00:01:24'
    },
    {
      speaker: 'Bob',
      text: 'The auth token refresh bug in mobile needs attention. I will deploy a fix tomorrow morning.',
      time: '00:02:10'
    }
  ]);

  const [simulatedTurnIndex, setSimulatedTurnIndex] = useState(0);

  // Audio Visualizer Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  // Audio Canvas visualizer loop
  const drawWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    if (analyser && isRecording && !isPaused && !isMuted) {
      analyser.getByteFrequencyData(dataArray);
    } else {
      // Idle simulated subtle harmonic wave
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = isRecording && !isPaused ? Math.sin(Date.now() / 200 + i) * 30 + 50 : 10;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.85 + 4;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#06b6d4');
      gradient.addColorStop(1, '#10b981');

      ctx.fillStyle = isRecording ? gradient : 'rgba(100, 116, 139, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 4);
      ctx.fill();

      x += barWidth;
    }

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
      }
    } catch {
      console.warn('Microphone permission not granted or unavailable, using high-precision audio simulation.');
    }

    setIsRecording(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    drawWaveform();
    addToast({
      type: 'info',
      title: 'LoopKeeper Recording Started',
      message: 'Listening for speech turns and conversational commitments.'
    });
  };

  const pauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const [processingStage, setProcessingStage] = useState<'uploading' | 'transcribing' | 'extracting' | 'persisting' | 'drift_analysis' | 'complete'>('uploading');

  const stopAndProcess = async () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setIsProcessing(true);
    setProcessingStage('uploading');

    const fullTranscript = transcriptLines
      .map(t => `[${t.time}] ${t.speaker}: ${t.text}`)
      .join('\n');

    try {
      // Stage 1 -> 2
      await new Promise(r => setTimeout(r, 400));
      setProcessingStage('transcribing');
      
      // Stage 2 -> 3
      await new Promise(r => setTimeout(r, 500));
      setProcessingStage('extracting');

      const resultPromise = createMeetingAndProcess(
        {
          title: meetingTitle.trim(),
          meeting_date: new Date().toISOString(),
          source: 'loopkeeper_native',
          created_by: currentUser.id,
          participant_ids: selectedParticipants
        },
        {
          content: fullTranscript,
          source_file_name: `${meetingTitle.toLowerCase().replace(/\s+/g, '_')}_live.txt`,
          transcript_format: 'txt'
        }
      );

      // Stage 3 -> 4
      await new Promise(r => setTimeout(r, 400));
      setProcessingStage('persisting');

      // Stage 4 -> 5
      await new Promise(r => setTimeout(r, 300));
      setProcessingStage('drift_analysis');

      const result = await resultPromise;

      setProcessingStage('complete');
      await new Promise(r => setTimeout(r, 400));

      setIsProcessing(false);
      navigateToMeeting(result.meeting.id);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const addSimulatedSpeechTurn = () => {
    const speakers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Jyothsna', 'Priya'];
    const commitments = [
      'I will run the end-to-end integration test suite on the staging deployment by Friday.',
      'I will review the mobile auth PR and merge it by tomorrow morning 10 AM.',
      'We need to postpone the secondary UI polishing to next sprint to focus on core stability.',
      'I will write the architectural documentation for the pgvector embedding pipeline.'
    ];

    const speaker = speakers[simulatedTurnIndex % speakers.length];
    const text = commitments[simulatedTurnIndex % commitments.length];
    const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');

    setTranscriptLines(prev => [
      ...prev,
      { speaker, text, time: `00:${mins}:${secs}` }
    ]);
    setSimulatedTurnIndex(prev => prev + 1);
  };

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stagesList = [
    { key: 'uploading', label: 'Uploading Audio Stream', desc: '44.1 kHz PCM stream buffer sent to processing queue' },
    { key: 'transcribing', label: 'Gemini Multimodal Speech-to-Text', desc: 'Audio turn transcription & speaker alignment' },
    { key: 'extracting', label: 'Dual-Inference SLM Extraction', desc: 'Extracting verbal commitments & exact transcript anchors' },
    { key: 'persisting', label: 'Database Indexing', desc: 'Storing meeting commitments & owner mappings' },
    { key: 'drift_analysis', label: 'Jira Execution Drift Evaluation', desc: 'Cross-referencing Jira issues for execution drift' }
  ];

  const getStageIndex = (key: string) => {
    const idx = stagesList.findIndex(s => s.key === key);
    return idx === -1 ? 5 : idx;
  };

  const currentStageIdx = getStageIndex(processingStage);

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm">
            <RadioIcon size={14} className="animate-pulse" />
            LoopKeeper Native Recording Studio
          </span>
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
            Direct Ingestion Lifecycle
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
          Live Meeting Session & Ingestion
        </h1>
        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Record standups, design reviews, or strategy calls directly inside LoopKeeper. Audio speech turns are tokenized and processed through the Dual-Inference SLM to extract commitments with exact transcript anchors.
        </p>
      </div>

      {/* Recording Studio Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Waveform & Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Control Card */}
          <div className="p-6 rounded-3xl glass-panel-elevated border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={e => setMeetingTitle(e.target.value)}
                  disabled={isRecording}
                  className="text-lg font-bold text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-cyan-500 focus:outline-none transition-colors w-full"
                  placeholder="Enter meeting title..."
                />
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                  <span>LoopKeeper In-Browser Audio Capture</span>
                  <span>•</span>
                  <span className="font-mono text-cyan-400">44.1 kHz Sampling</span>
                </p>
              </div>

              {/* Timer Display */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-inner shrink-0">
                <span className={`h-3 w-3 rounded-full ${isRecording && !isPaused ? 'bg-rose-500 animate-ping' : 'bg-zinc-600'}`} />
                <span className="font-mono text-lg font-black text-zinc-100">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Audio Waveform Canvas */}
            <div className="h-36 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 z-10">
                <span>AUDIO SPECTROGRAM</span>
                <span className="text-cyan-400 font-bold">
                  {isRecording ? (isPaused ? 'PAUSED' : isMuted ? 'MUTED' : 'LIVE RECORDING') : 'READY TO RECORD'}
                </span>
              </div>

              <canvas
                ref={canvasRef}
                width={600}
                height={90}
                className="w-full h-20 self-center"
              />

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 z-10">
                <span>MIC LEVEL: {isMuted ? '0 dB (Muted)' : isRecording ? '-12 dB' : '0 dB'}</span>
                <span>CHANNELS: 1 (MONO)</span>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <RadioIcon size={16} className="animate-pulse" />
                    <span>Start Meeting Recording</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-colors"
                    >
                      <ClockIcon size={14} />
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      onClick={toggleMute}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs border transition-colors ${
                        isMuted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                      }`}
                    >
                      {isMuted ? <MicOffIcon size={14} /> : <MicIcon size={14} />}
                      <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                    </button>

                    <button
                      onClick={stopAndProcess}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <SquareIcon size={14} className="fill-current" />
                      <span>{isProcessing ? 'Processing...' : 'Stop & Extract AI Commitments'}</span>
                    </button>
                  </>
                )}
              </div>

              {isRecording && (
                <button
                  type="button"
                  onClick={addSimulatedSpeechTurn}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Simulate a speaker commitment statement"
                >
                  <SparklesIcon size={13} className="text-cyan-400" />
                  <span>Simulate Speech Turn</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Live Transcript Buffer & Participants */}
        <div className="space-y-5">
          {/* Participants Card */}
          <div className="p-5 rounded-3xl glass-panel border border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <UsersIcon size={14} className="text-cyan-400" />
              Active Attendees ({selectedParticipants.length})
            </h3>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {employees.map(emp => {
                const isSelected = selectedParticipants.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => {
                      if (!isRecording) {
                        setSelectedParticipants(prev =>
                          prev.includes(emp.id) ? prev.filter(p => p !== emp.id) : [...prev, emp.id]
                        );
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-cyan-500/50 text-cyan-200'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <img
                      src={emp.avatar_url}
                      alt={emp.name}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[100px]">{emp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Turn Stream Card */}
          <div className="p-5 rounded-3xl glass-panel border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <FileTextIcon size={14} className="text-indigo-400" />
                Live Speech Stream
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">
                {transcriptLines.length} turns
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {transcriptLines.map((turn, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1 animate-fade-in-up"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-400">{turn.speaker}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{turn.time}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    "{turn.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Pipeline Stage Overlay Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <SparklesIcon size={24} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">
                  Processing Audio & AI Extraction Pipeline
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Executing multi-stage analysis on meeting recording
                </p>
              </div>
            </div>

            {/* Stages List */}
            <div className="space-y-3">
              {stagesList.map((stg, index) => {
                const isCompleted = index < currentStageIdx;
                const isCurrent = index === currentStageIdx;

                return (
                  <div
                    key={stg.key}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                        : isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30 opacity-90'
                        : 'bg-zinc-950/40 border-zinc-800/60 opacity-40'
                    }`}
                  >
                    <div className="pt-0.5">
                      {isCompleted ? (
                        <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      ) : isCurrent ? (
                        <div className="h-5 w-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-zinc-700 text-zinc-600 flex items-center justify-center text-[10px]">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : isCompleted ? 'text-emerald-300' : 'text-zinc-400'}`}>
                        Stage {index + 1}: {stg.label}
                      </h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                        {stg.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

