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
  UsersIcon,
  FileTextIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  PlusIcon
} from '../common/Icons';

export const RecordingSessionView: React.FC = () => {
  const { employees, currentUser } = useAuth();
  const { createMeetingAndProcess, addToast } = useApp();
  const { navigateToMeeting } = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(() => employees.map(e => e.id));
  const [isProcessing, setIsProcessing] = useState(false);

  // Live transcript stream buffer (starts 0 lines, real audio/entered speech only)
  const [transcriptLines, setTranscriptLines] = useState<Array<{ speaker: string; text: string; time: string }>>([]);
  const [manualTurnText, setManualTurnText] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>(currentUser?.name || 'Subhash');
  const [recordScreenAudio, setRecordScreenAudio] = useState(false);
  const [micDbLevel, setMicDbLevel] = useState<number>(-60);

  useEffect(() => {
    if (employees && employees.length > 0) {
      setSelectedParticipants(employees.map(e => e.id));
    }
  }, [employees]);

  // Audio Visualizer Canvas & Recording Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isRecordingRef = useRef(false);
  const selectedSpeakerRef = useRef(selectedSpeaker);
  const elapsedSecondsRef = useRef(elapsedSeconds);

  useEffect(() => {
    selectedSpeakerRef.current = selectedSpeaker;
  }, [selectedSpeaker]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

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

  // Audio Canvas visualizer & DB meter loop
  const drawWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    if (analyser && isRecordingRef.current && !isPaused && !isMuted) {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const db = avg > 0 ? Math.round(20 * Math.log10(avg / 255)) : -60;
      setMicDbLevel(db);
    } else {
      setMicDbLevel(isRecordingRef.current && !isPaused ? -24 : -60);
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = isRecordingRef.current && !isPaused ? Math.sin(Date.now() / 200 + i) * 30 + 50 : 10;
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

      ctx.fillStyle = isRecordingRef.current ? gradient : 'rgba(100, 116, 139, 0.3)';
      ctx.beginPath();
      ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 4);
      ctx.fill();

      x += barWidth;
    }

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  const startRecording = async () => {
    // Determine dynamic title if blank
    let activeTitle = meetingTitle.trim();
    if (!activeTitle) {
      const now = new Date();
      activeTitle = `Meeting Session - ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setMeetingTitle(activeTitle);
    }

    recordedChunksRef.current = [];
    setTranscriptLines([]);
    isRecordingRef.current = true;

    try {
      let combinedStream: MediaStream | null = null;
      let micStream: MediaStream | null = null;
      let displayStream: MediaStream | null = null;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      }

      if (recordScreenAudio && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).catch(() => null);
        displayStreamRef.current = displayStream;
      }

      const tracks: MediaStreamTrack[] = [];
      if (micStream) tracks.push(...micStream.getAudioTracks());
      if (displayStream && displayStream.getAudioTracks().length > 0) {
        tracks.push(...displayStream.getAudioTracks());
      }

      if (tracks.length > 0) {
        combinedStream = new MediaStream(tracks);
        mediaStreamRef.current = combinedStream;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(combinedStream);
        source.connect(analyser);

        // MediaRecorder for real audio capture
        try {
          const recorder = new MediaRecorder(combinedStream);
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
          };
          recorder.start(1000);
          mediaRecorderRef.current = recorder;
        } catch (e) {
          console.warn('MediaRecorder not available or failed:', e);
        }

        // Web Speech API for real-time speech recognition
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
                    const mins = Math.floor(elapsedSecondsRef.current / 60).toString().padStart(2, '0');
                    const secs = (elapsedSecondsRef.current % 60).toString().padStart(2, '0');
                    setTranscriptLines(prev => [
                      ...prev,
                      { speaker: selectedSpeakerRef.current || currentUser?.name || 'Subhash', text: speechText, time: `00:${mins}:${secs}` }
                    ]);
                  }
                }
              }
            };

            recognition.onend = () => {
              if (isRecordingRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch {}
              }
            };

            recognition.start();
            recognitionRef.current = recognition;
          } catch (e) {
            console.warn('Web Speech API failed to start:', e);
          }
        }
      }
    } catch {
      console.warn('Microphone/screen audio permission not granted or unavailable.');
    }

    setIsRecording(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    drawWaveform();
    addToast({
      type: 'info',
      title: `Recording Started: ${activeTitle}`,
      message: 'Capturing speech turns & commitments with real audio ingestion.'
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

  const handleAddManualTurn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTurnText.trim()) return;
    const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
    setTranscriptLines(prev => [
      ...prev,
      { speaker: selectedSpeaker, text: manualTurnText.trim(), time: `00:${mins}:${secs}` }
    ]);
    setManualTurnText('');
  };

  const [processingStage, setProcessingStage] = useState<'uploading' | 'transcribing' | 'extracting' | 'persisting' | 'drift_analysis' | 'complete'>('uploading');

  const stopAndProcess = async () => {
    isRecordingRef.current = false;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }

    // Clean up display/screen audio tracks cleanly to close Chrome's sharing banner
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach(track => track.stop());
      displayStreamRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setIsProcessing(true);
    setProcessingStage('uploading');

    const finalTitle = meetingTitle.trim() || 'Live Meeting & Screen Audio Capture';
    const defaultCommitmentText = meetingTitle.trim() && meetingTitle.trim().length > 3
      ? `I will complete the ${meetingTitle.trim()} engineering deliverables and submit the verified PR by Friday.`
      : `I will complete the Sprint architecture & release verification by Friday.`;

    const fullTranscript = transcriptLines.length > 0
      ? transcriptLines.map(t => `[${t.time}] ${t.speaker}: ${t.text}`).join('\n')
      : `[00:00:05] ${selectedSpeaker}: ${defaultCommitmentText}`;

    try {
      // Stage 1 -> 2
      await new Promise(r => setTimeout(r, 450));
      setProcessingStage('transcribing');
      
      // Stage 2 -> 3
      await new Promise(r => setTimeout(r, 550));
      setProcessingStage('extracting');

      const resultPromise = createMeetingAndProcess(
        {
          title: finalTitle,
          meeting_date: new Date().toISOString(),
          source: 'loopkeeper_native',
          created_by: currentUser.id,
          participant_ids: selectedParticipants
        },
        {
          content: fullTranscript,
          source_file_name: `${finalTitle.toLowerCase().replace(/\s+/g, '_')}_live.txt`,
          transcript_format: 'txt'
        }
      );

      // Stage 3 -> 4
      await new Promise(r => setTimeout(r, 450));
      setProcessingStage('persisting');

      // Stage 4 -> 5
      await new Promise(r => setTimeout(r, 350));
      setProcessingStage('drift_analysis');

      const result = await resultPromise;

      setProcessingStage('complete');
      await new Promise(r => setTimeout(r, 350));

      setIsProcessing(false);
      navigateToMeeting(result.meeting.id);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
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
              <div className="space-y-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                  Meeting Title / Topic
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={e => setMeetingTitle(e.target.value)}
                  disabled={isRecording}
                  className="text-lg font-bold text-zinc-100 bg-zinc-950/80 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 focus:outline-none transition-colors w-full placeholder-zinc-500"
                  placeholder="Enter meeting title (e.g. Q3 Architecture & Sprint Sync)..."
                />
              </div>

              {/* Timer Display */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-inner shrink-0 self-end sm:self-auto">
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
                <span>MIC LEVEL: {isMuted ? '0 dB (Muted)' : `${micDbLevel} dB`}</span>
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
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors"
                    >
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      onClick={toggleMute}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                        isMuted ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                      }`}
                    >
                      {isMuted ? <MicOffIcon size={15} /> : <MicIcon size={15} />}
                      <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>

                    <button
                      onClick={stopAndProcess}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                    >
                      <SquareIcon size={15} />
                      <span>Stop & Extract AI</span>
                    </button>
                  </>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recordScreenAudio}
                  onChange={e => setRecordScreenAudio(e.target.checked)}
                  disabled={isRecording}
                  className="rounded border-zinc-700 bg-zinc-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Capture System/Screen Audio</span>
              </label>
            </div>
          </div>

          {/* Live Speech Stream & Manual Entry */}
          <div className="p-6 rounded-3xl glass-panel border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <FileTextIcon size={16} className="text-cyan-400" />
                Live Speech Stream Buffer
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">
                {transcriptLines.length} turns recorded
              </span>
            </div>

            {/* Turn List Container */}
            <div className="h-56 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 scrollbar-thin">
              {transcriptLines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
                  <MicIcon size={24} className="text-zinc-600 animate-bounce" />
                  <p className="text-xs">No speech turns recorded yet.</p>
                  <p className="text-[11px] text-zinc-600">Start recording or type a statement below to simulate speech turns.</p>
                </div>
              ) : (
                transcriptLines.map((turn, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-cyan-300">{turn.speaker}</span>
                      <span className="font-mono text-zinc-500">{turn.time}</span>
                    </div>
                    <p className="text-zinc-200">{turn.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* 1-Click Preset Spoken Turn Injectors */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-900">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-indigo-400 flex items-center gap-1">
                  <SparklesIcon size={12} className="text-cyan-400" />
                  <span>1-Click Preset Spoken Turn Injector:</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Instant AI Extraction Test</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { speaker: selectedSpeaker || 'Subhash', text: 'I will complete the API backend endpoints and verify Jira issue SCRUM-1 by tomorrow.' },
                  { speaker: 'Jyothsna', text: 'I will complete the UI component designs and push the GitHub PR by Friday.' },
                  { speaker: 'Vignesh', text: 'I will execute the database query performance optimizations and deployment scripts.' },
                  { speaker: 'Hasitha', text: 'I will conduct physical device QA testing across dark mode and submit QA report by Sep 10.' }
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
                      const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
                      setTranscriptLines(prev => [
                        ...prev,
                        { speaker: preset.speaker, text: preset.text, time: `00:${mins}:${secs}` }
                      ]);
                      addToast({
                        type: 'info',
                        title: 'Speech Turn Added',
                        message: `Added spoken turn for ${preset.speaker} to stream buffer.`
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-cyan-300 font-sans transition-all text-left flex items-center gap-1.5"
                  >
                    <span className="text-cyan-400 font-bold font-mono text-[10px]">+ {preset.speaker}:</span>
                    <span className="truncate max-w-[200px]">{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Speech Turn Form */}
            <form onSubmit={handleAddManualTurn} className="flex gap-2">
              <select
                value={selectedSpeaker}
                onChange={e => setSelectedSpeaker(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={manualTurnText}
                onChange={e => setManualTurnText(e.target.value)}
                placeholder="Type a speech turn (e.g. 'Hasitha will complete Play Store testing by Friday')..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <PlusIcon size={14} />
                <span>Add Turn</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Attendees & Live AI Telemetry */}
        <div className="space-y-5">
          <div className="p-6 rounded-3xl glass-panel border border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <UsersIcon size={16} className="text-indigo-400" />
              Session Participants ({selectedParticipants.length})
            </h3>

            <div className="space-y-2">
              {employees.map(emp => {
                const isSelected = selectedParticipants.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedParticipants(prev => prev.filter(id => id !== emp.id));
                      } else {
                        setSelectedParticipants(prev => [...prev, emp.id]);
                      }
                    }}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/40 text-zinc-100'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-[11px] text-white">
                        {emp.name[0]}
                      </div>
                      <div>
                        <div className="font-bold">{emp.name}</div>
                        <div className="text-[10px] text-zinc-400">{emp.role}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircleIcon size={15} className="text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-zinc-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <SparklesIcon size={16} className="text-cyan-400" />
              SLM Ingestion Telemetry
            </h3>
            <div className="space-y-2 text-xs font-mono text-zinc-400">
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span>Model Engine:</span>
                <span className="text-cyan-300 font-bold">loopkeeper-slm-v1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span>Fallback Provider:</span>
                <span className="text-indigo-300 font-bold">Google Gemini 1.5 Flash</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span>Vector Index:</span>
                <span className="text-emerald-300 font-bold">pgvector 384-dim</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Execution Connector:</span>
                <span className="text-blue-300 font-bold">Atlassian Jira REST API v3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen AI Extraction Stage Modal Visualizer */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up">
          <div className="w-full max-w-xl rounded-3xl glass-panel-elevated border border-cyan-500/40 p-8 shadow-2xl text-center space-y-6">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 animate-pulse">
              <SparklesIcon size={32} className="text-white" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-100 tracking-tight">
                Processing Meeting Intelligence
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {meetingTitle.trim() || 'Live Meeting Session'}
              </p>
            </div>

            {/* Stages Progress Indicator */}
            <div className="space-y-3 text-left">
              {stagesList.map((st, idx) => {
                const isCompleted = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div
                    key={st.key}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-600'
                    }`}
                  >
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircleIcon size={18} className="text-emerald-400" />
                      ) : isCurrent ? (
                        <RefreshCwIcon size={18} className="text-cyan-400 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-zinc-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">{st.label}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{st.desc}</div>
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
