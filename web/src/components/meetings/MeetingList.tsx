import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarIcon, SearchIcon, PlusIcon, ArrowRightIcon, UsersIcon, SparklesIcon } from '../common/Icons';

interface MeetingListProps {
  onOpenCreateMeeting: (presetIndex?: number) => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({ onOpenCreateMeeting }) => {
  const { meetings, navigateToMeeting } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarIcon size={24} className="text-cyan-400" />
            Meeting Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ingested meeting transcripts, extracted commitments & deduplicated task histories
          </p>
        </div>

        <button
          onClick={() => onOpenCreateMeeting()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
        >
          <PlusIcon size={16} />
          <span>New Meeting Ingest</span>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search meetings by title or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        <div className="text-xs text-zinc-400 font-medium">
          Showing <span className="font-bold text-zinc-200 font-mono">{filteredMeetings.length}</span> recorded meetings
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeetings.map(meeting => {
          const meetingDate = new Date(meeting.meeting_date);
          const formattedDate = meetingDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div
              key={meeting.id}
              onClick={() => navigateToMeeting(meeting.id)}
              className="group cursor-pointer rounded-2xl glass-panel border border-zinc-800 hover:border-cyan-500/50 p-5 shadow-lg transition-all duration-200 flex flex-col justify-between gap-4 hover:shadow-cyan-500/10 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {meeting.source.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {formattedDate}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <SparklesIcon size={12} />
                    {meeting.action_item_count || 0} Commitments
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors mt-3">
                  {meeting.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <UsersIcon size={14} className="text-cyan-400" />
                  <span>{meeting.participants?.length || 4} participants</span>
                </div>

                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>View Details & Transcript</span>
                  <ArrowRightIcon size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
