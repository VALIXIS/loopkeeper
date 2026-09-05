import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarIcon, SearchIcon, PlusIcon, ArrowRightIcon, UsersIcon, SparklesIcon, TrashIcon } from '../common/Icons';

interface MeetingListProps {
  onOpenCreateMeeting: (presetIndex?: number) => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({ onOpenCreateMeeting }) => {
  const { meetings, navigateToMeeting, deleteMeeting } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this meeting recording?')) {
      setDeletingId(id);
      await deleteMeeting(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarIcon size={22} className="text-cyan-400" />
            Meeting Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ingested meeting transcripts, extracted commitments & deduplicated task histories
          </p>
        </div>

        <button
          onClick={() => onOpenCreateMeeting()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
        >
          <PlusIcon size={15} />
          <span>New Meeting Ingest</span>
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl glass-panel border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search meetings by title or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        <div className="text-xs text-zinc-400 font-medium hidden sm:block">
          Showing <span className="font-bold text-zinc-200 font-mono">{filteredMeetings.length}</span> recorded meetings
        </div>
      </div>

      {/* Meetings Stacked List (One below another) */}
      <div className="flex flex-col gap-3">
        {filteredMeetings.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-mono">
            No meetings found matching "{searchQuery}".
          </div>
        ) : (
          filteredMeetings.map(meeting => {
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
                className="group cursor-pointer rounded-2xl glass-panel border border-zinc-800 hover:border-cyan-500/50 p-4 shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-cyan-500/10 hover:-translate-y-0.5"
              >
                {/* Left Metadata & Title */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
                      {meeting.source.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 shrink-0">
                      <CalendarIcon size={12} className="text-zinc-500" />
                      {formattedDate}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1 shrink-0">
                      • <UsersIcon size={12} className="text-cyan-400" />
                      {meeting.participants?.length || 4} attendees
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors truncate">
                    {meeting.title}
                  </h3>
                </div>

                {/* Right Actions & Badges */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-950/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                    <SparklesIcon size={12} />
                    {meeting.action_item_count || 0} Commitments
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>View Details</span>
                      <ArrowRightIcon size={13} />
                    </div>

                    <button
                      type="button"
                      onClick={e => handleDelete(e, meeting.id)}
                      disabled={deletingId === meeting.id}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all ml-1"
                      title="Delete this meeting recording"
                    >
                      <TrashIcon size={14} className={deletingId === meeting.id ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
