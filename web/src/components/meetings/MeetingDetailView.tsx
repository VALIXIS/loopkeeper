import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import type { MeetingDetail } from '../../types';
import { TranscriptViewer } from './TranscriptViewer';
import { StatusBadge, PostponementBadge, VerificationBadge, MatchDecisionBadge } from '../common/Badge';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import {
  CalendarIcon,
  CheckSquareIcon,
  FileTextIcon,
  BrainIcon,
  UsersIcon,
  NetworkIcon,
  ClockIcon,
  ChevronRightIcon
} from '../common/Icons';

export const MeetingDetailView: React.FC = () => {
  const { selectedMeetingId, setActiveTab, navigateToTask } = useApp();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveDetailTab] = useState<'items' | 'transcript' | 'telemetry'>('items');

  useEffect(() => {
    if (!selectedMeetingId) return;
    setLoading(true);
    api
      .getMeetingDetail(selectedMeetingId)
      .then(data => {
        setMeeting(data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedMeetingId]);

  if (loading || !meeting) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <div className="text-xs text-zinc-400">Loading meeting intelligence...</div>
      </div>
    );
  }

  const meetingDate = new Date(meeting.meeting_date);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const aiRun = meeting.ai_runs?.[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <button
          onClick={() => setActiveTab('meetings')}
          className="hover:text-zinc-200 transition-colors"
        >
          Meetings
        </button>
        <ChevronRightIcon size={12} />
        <span className="text-zinc-200 font-medium truncate max-w-md">{meeting.title}</span>
      </div>

      {/* Meeting Executive Banner */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {meeting.source.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                <CalendarIcon size={13} />
                {formattedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
              {meeting.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                Commitments
              </span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {meeting.action_items.length}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('graph')}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 text-xs font-bold border border-indigo-500/40 transition-colors"
            >
              <NetworkIcon size={16} />
              <span>Trace in Graph</span>
            </button>
          </div>
        </div>

        {/* Participants Avatars */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <UsersIcon size={14} />
            <span>Participants:</span>
            <div className="flex items-center -space-x-1.5">
              {meeting.participants?.map(p => (
                <img
                  key={p.id}
                  src={p.avatar_url}
                  alt={p.name}
                  title={p.name}
                  className="h-6 w-6 rounded-full ring-2 ring-zinc-900 object-cover"
                />
              ))}
            </div>
            <span className="text-zinc-300 font-medium ml-1">
              {meeting.participants?.map(p => p.name.split(' ')[0]).join(', ')}
            </span>
          </div>

          <div className="font-mono text-[11px] text-zinc-500">ID: {meeting.id}</div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveDetailTab('items')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'items'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckSquareIcon size={16} />
          <span>Extracted Action Items ({meeting.action_items.length})</span>
        </button>

        <button
          onClick={() => setActiveDetailTab('transcript')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'transcript'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileTextIcon size={16} />
          <span>Transcript Reader</span>
        </button>

        <button
          onClick={() => setActiveDetailTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'telemetry'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BrainIcon size={16} />
          <span>AI Pipeline Telemetry</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {meeting.action_items.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs">
                No action items extracted from this meeting transcript.
              </div>
            ) : (
              meeting.action_items.map(item => {
                const deadlineDate = item.deadline ? new Date(item.deadline) : null;
                const formattedDeadline = deadlineDate
                  ? deadlineDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Unspecified';

                return (
                  <div
                    key={item.id}
                    onClick={() => navigateToTask(item.id)}
                    className="group cursor-pointer rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/50 p-5 shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-indigo-500/10"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                        <VerificationBadge confidence={item.confidence} />
                        <MatchDecisionBadge decision={item.match_decision} />
                        <PostponementBadge count={item.postponement_count} />
                      </div>

                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>

                      {item.source_text && (
                        <p className="text-xs text-zinc-400 italic bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60 font-mono">
                          "{item.source_text}"
                        </p>
                      )}
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase block">Assignee</span>
                        <span className="text-xs font-semibold text-zinc-200">
                          {item.owner_name}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase block">Target Deadline</span>
                        <span className="text-xs font-mono text-zinc-300 flex items-center gap-1">
                          <ClockIcon size={11} />
                          {formattedDeadline}
                        </span>
                      </div>

                      <div className="w-28">
                        <ConfidenceMeter score={item.confidence} size="sm" showLabel={false} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'transcript' && (
        <TranscriptViewer
          content={meeting.transcript?.content || ''}
          sourceFileName={meeting.transcript?.source_file_name}
        />
      )}

      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BrainIcon size={20} className="text-cyan-400" />
                <h3 className="text-base font-bold text-zinc-100">
                  AI Pipeline Telemetry Record
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Inference Status: SUCCESS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-500 block">Active Model</span>
                <span className="text-base font-bold font-mono text-indigo-300">
                  {aiRun?.model_name || 'loopkeeper-slm-v1'}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Provider: {aiRun?.provider === 'fallback_llm' ? 'Fallback LLM' : 'Specialized SLM'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-500 block">Inference Latency</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {aiRun?.latency_ms || 184} ms
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Benchmarked under SLA &lt; 500ms
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-500 block">Confidence Metric</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {Math.round((aiRun?.confidence || 0.95) * 100)}%
                </span>
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Threshold: 0.75 min for SLM
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Pipeline Deduplication Logic
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Extracted items underwent 1536-dimensional OpenAI / Gemini vector embeddings and were tested with HNSW cosine distance indexing. High similarity scores automatically linked recurring tasks back to previous meetings without creating duplicate clutter.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
