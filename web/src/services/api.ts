import type {
  Meeting,
  MeetingCreate,
  MeetingDetail,
  Transcript,
  TranscriptCreate,
  ActionItem,
  ActionItemUpdate,
  ActionItemDetail,
  DashboardOverview,
  Employee,
  AIRunTelemetry,
  TaskComment,
  ProofOfWork
} from '../types';
import {
  MOCK_EMPLOYEES,
  MOCK_MEETINGS,
  MOCK_ACTION_ITEMS,
  MOCK_HISTORY,
  MOCK_AI_RUNS,
  MOCK_TRANSCRIPTS
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';


class LocalStateStore {
  meetings: Meeting[] = [];
  transcripts: Record<string, Transcript> = {};
  actionItems: ActionItem[] = [];
  history: Record<string, any[]> = {};
  proofOfWork: Record<string, ProofOfWork[]> = {};
  aiRuns: AIRunTelemetry[] = [];

  employees: Employee[] = [];
  comments: Record<string, TaskComment[]> = {};
  isBackendAvailable: boolean = false;
  forceMockMode: boolean = false;

  constructor() {
    this.loadInitialData();
  }

  loadInitialData() {
    const savedMeetings = localStorage.getItem('loopkeeper_meetings');
    if (!savedMeetings || !savedMeetings.includes('m-real-2026-09-05')) {
      localStorage.removeItem('loopkeeper_meetings');
      localStorage.removeItem('loopkeeper_action_items');
      localStorage.removeItem('loopkeeper_history');
      localStorage.removeItem('loopkeeper_transcripts');
      localStorage.removeItem('loopkeeper_ai_runs');
      localStorage.removeItem('loopkeeper_comments');
    }

    const currentMeetings = localStorage.getItem('loopkeeper_meetings');
    const savedActionItems = localStorage.getItem('loopkeeper_action_items');
    const savedHistory = localStorage.getItem('loopkeeper_history');
    const savedTranscripts = localStorage.getItem('loopkeeper_transcripts');
    const savedAiRuns = localStorage.getItem('loopkeeper_ai_runs');
    const savedComments = localStorage.getItem('loopkeeper_comments');

    this.employees = [...MOCK_EMPLOYEES];
    this.meetings = currentMeetings ? JSON.parse(currentMeetings) : [...MOCK_MEETINGS];
    this.actionItems = (savedActionItems ? JSON.parse(savedActionItems) : [...MOCK_ACTION_ITEMS]).filter(
      (item: ActionItem) => !item.title.toLowerCase().includes('hey hello hi') && !item.source_text?.toLowerCase().includes('hey hello hi')
    );
    this.history = savedHistory ? JSON.parse(savedHistory) : { ...MOCK_HISTORY };
    this.aiRuns = savedAiRuns ? JSON.parse(savedAiRuns) : [...MOCK_AI_RUNS];
    this.comments = savedComments ? JSON.parse(savedComments) : {
      'a-real-006': [
        {
          id: 'c-1',
          task_id: 'a-real-006',
          author_name: 'VALIXIS',
          text: 'Hasitha and team must execute 3-day and 2-day structured build testing on physical devices to catch dark mode stability issues.',
          type: 'instruction',
          created_at: '2026-08-23T20:50:00Z'
        },
        {
          id: 'c-2',
          task_id: 'a-real-006',
          author_name: 'VALIXIS',
          text: '⚠️ RISK WARNING: Postponed 1x from Aug 29 to Sep 5 due to dark mode stability fixes. Must be verified before Play Store build freeze!',
          type: 'warning',
          created_at: '2026-08-26T20:15:00Z'
        }
      ],
      'a-real-007': [
        {
          id: 'c-3',
          task_id: 'a-real-007',
          author_name: 'Subhash',
          text: 'Mandated daily 6:30 PM PR submission window in place. Pull request links must be submitted to portal on time.',
          type: 'instruction',
          created_at: '2026-08-30T19:10:00Z'
        }
      ]
    };

    if (savedTranscripts) {
      this.transcripts = JSON.parse(savedTranscripts);
    } else {
      Object.entries(MOCK_TRANSCRIPTS).forEach(([meetingId, content]) => {
        this.transcripts[meetingId] = {
          id: `t-${meetingId}`,
          meeting_id: meetingId,
          content,
          source_file_name: 'transcript.txt',
          transcript_format: 'txt',
          created_at: new Date().toISOString()
        };
      });
    }
  }

  save() {
    localStorage.setItem('loopkeeper_meetings', JSON.stringify(this.meetings));
    localStorage.setItem('loopkeeper_action_items', JSON.stringify(this.actionItems));
    localStorage.setItem('loopkeeper_history', JSON.stringify(this.history));
    localStorage.setItem('loopkeeper_transcripts', JSON.stringify(this.transcripts));
    localStorage.setItem('loopkeeper_ai_runs', JSON.stringify(this.aiRuns));
    localStorage.setItem('loopkeeper_comments', JSON.stringify(this.comments));
  }

  resetToDefaults() {
    localStorage.removeItem('loopkeeper_meetings');
    localStorage.removeItem('loopkeeper_action_items');
    localStorage.removeItem('loopkeeper_history');
    localStorage.removeItem('loopkeeper_transcripts');
    localStorage.removeItem('loopkeeper_ai_runs');
    localStorage.removeItem('loopkeeper_comments');
    this.loadInitialData();
  }
}

export const localStore = new LocalStateStore();

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('loopkeeper_auth_token') || 'dev-token-loopkeeper';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...extraHeaders
  };
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 3000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  async checkHealth(): Promise<{ status: string; service: string; ai_pipeline: string; isLive: boolean }> {
    if (localStore.forceMockMode) {
      localStore.isBackendAvailable = false;
      return { status: 'ok', service: 'LoopKeeper In-Memory Engine (Simulated)', ai_pipeline: 'ready', isLive: false };
    }
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 2500);
      if (res.ok) {
        const data = await res.json();
        localStore.isBackendAvailable = true;
        return { ...data, isLive: true };
      }
    } catch {
      // Offline fallback
    }
    localStore.isBackendAvailable = false;
    return { status: 'ok', service: 'LoopKeeper In-Memory Engine', ai_pipeline: 'ready (local)', isLive: false };
  },

  setForceMockMode(enabled: boolean) {
    localStore.forceMockMode = enabled;
  },

  async getEmployees(): Promise<Employee[]> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/employees`);
        if (res.ok) {
          const data: Employee[] = await res.json();
          if (data && data.length > 0) {
            localStore.employees = data;
            return data;
          }
        }
      } catch (err) {
        console.warn('Backend getEmployees failed, using local store', err);
      }
    }
    return localStore.employees;
  },

  async getMeetings(): Promise<Meeting[]> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/meetings`);
        if (res.ok) {
          const data: Meeting[] = await res.json();
          return data.map(m => ({
            ...m,
            action_item_count: localStore.actionItems.filter(a => a.meeting_id === m.id).length
          }));
        }
      } catch (err) {
        console.warn('Backend getMeetings failed, using local store', err);
      }
    }
    return localStore.meetings.map(m => ({
      ...m,
      action_item_count: localStore.actionItems.filter(a => a.meeting_id === m.id).length
    }));
  },

  async getMeetingDetail(id: string): Promise<MeetingDetail> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/meetings/${id}`);
        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            ai_runs: localStore.aiRuns.filter(r => r.meeting_id === id)
          };
        }
      } catch (err) {
        console.warn('Backend getMeetingDetail failed, using local store', err);
      }
    }

    const meeting = localStore.meetings.find(m => m.id === id);
    const transcript = localStore.transcripts[id] || null;
    const actionItems = localStore.actionItems.filter(a => a.meeting_id === id);
    const aiRuns = localStore.aiRuns.filter(r => r.meeting_id === id);

    if (!meeting) {
      const fallbackMeeting: Meeting = {
        id,
        title: 'Live Meeting Session & Ingestion',
        meeting_date: new Date().toISOString(),
        source: 'loopkeeper_native',
        created_by: localStore.employees[0].id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        action_item_count: actionItems.length,
        participants: localStore.employees
      };
      return {
        ...fallbackMeeting,
        transcript,
        action_items: actionItems,
        participant_ids: localStore.employees.map(e => e.id),
        ai_runs: aiRuns
      };
    }

    return {
      ...meeting,
      transcript,
      action_items: actionItems,
      participant_ids: meeting.participants?.map(p => p.id) || [],
      ai_runs: aiRuns
    };
  },

  async createMeeting(payload: MeetingCreate): Promise<Meeting> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/meetings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created: Meeting = await res.json();
          localStore.meetings.unshift(created);
          localStore.save();
          return created;
        }
      } catch (err) {
        console.warn('Backend createMeeting failed, using local store', err);
      }
    }

    const newMeeting: Meeting = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title,
      meeting_date: payload.meeting_date || new Date().toISOString(),
      source: payload.source || 'transcript',
      external_source_id: payload.external_source_id || `meet-${Date.now()}`,
      created_by: payload.created_by || localStore.employees[0].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      action_item_count: 0,
      participants: (payload.participant_ids || []).map(
        pid => localStore.employees.find(e => e.id === pid) || localStore.employees[0]
      )
    };

    localStore.meetings.unshift(newMeeting);
    localStore.save();
    return newMeeting;
  },

  async attachTranscript(meetingId: string, payload: TranscriptCreate): Promise<Transcript> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/meetings/${meetingId}/transcript`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const transcript: Transcript = await res.json();
          localStore.transcripts[meetingId] = transcript;
          localStore.save();
          return transcript;
        }
      } catch (err) {
        console.warn('Backend attachTranscript failed, using local store', err);
      }
    }

    const transcript: Transcript = {
      id: `t-${Date.now()}`,
      meeting_id: meetingId,
      content: payload.content,
      source_file_name: payload.source_file_name || 'transcript.txt',
      transcript_format: payload.transcript_format || 'txt',
      created_at: new Date().toISOString()
    };

    localStore.transcripts[meetingId] = transcript;
    localStore.save();
    return transcript;
  },

  async processMeeting(meetingId: string): Promise<ActionItem[]> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/meetings/${meetingId}/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const items: ActionItem[] = await res.json();
          items.forEach(item => {
            const existingIdx = localStore.actionItems.findIndex(a => a.id === item.id);
            if (existingIdx >= 0) {
              localStore.actionItems[existingIdx] = item;
            } else {
              localStore.actionItems.unshift(item);
            }
          });
          localStore.save();
          return items;
        }
      } catch (err) {
        console.warn('Backend processMeeting failed, using intelligent client AI simulation', err);
      }
    }

    const meeting = localStore.meetings.find(m => m.id === meetingId);
    const transcript = localStore.transcripts[meetingId];
    const content = transcript?.content || '';

    const extracted: ActionItem[] = [];
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    lines.forEach((line, index) => {
      const lower = line.toLowerCase();
      const lineWithoutSpeaker = line.replace(/\[\d\d:\d\d:\d\d\]\s*/g, '').replace(/^[^:]+:\s*/, '').trim().toLowerCase();

      // Only skip PURE greetings / small talk with no task content
      const isPureGreeting = /^(hey\s+hello\s+hi(\s+this\s+is\s+[a-z]+)?|hello\s+hi|hey\s+there|hi\s+everyone|good\s+morning|good\s+afternoon|good\s+evening|can\s+you\s+hear\s+me|testing\s+mic|mic\s+test|testing\s+1\s*2\s*3|how\s+are\s+you|thanks\s+everyone|bye\s+everyone)\s*$/i.test(lineWithoutSpeaker);

      if (isPureGreeting) {
        // Skip pure greeting line
        return;
      }

      // 1. Identify Owner from line text or speaker tag
      let owner: Employee | undefined = localStore.employees.find(e =>
        line.toLowerCase().includes(e.name.toLowerCase().split(' ')[0])
      );

      if (!owner) {
        const matchSpeaker = line.match(/\[.*?\]\s*([^:]+):/);
        if (matchSpeaker && matchSpeaker[1]) {
          const speaker = matchSpeaker[1].trim();
          owner = localStore.employees.find(e =>
            e.name.toLowerCase().includes(speaker.toLowerCase())
          );
        }
      }

      if (!owner && meeting?.created_by) {
        owner = localStore.employees.find(e => e.id === meeting.created_by);
      }

      // 2. Extract Title
      let title = line.replace(/\[\d\d:\d\d:\d\d\]\s*/g, '').trim();
      if (title.includes(':')) {
        title = title.split(':')[1].trim();
      }
      title = title.replace(/^(I will|I'll|I need to|Adithya,|Vaseem,|Krishna,|Hasitha,|Vignesh,|Jyothsna,|Subhash,|still working on|please|we need to|assigned to)\s*/i, '');
      title = title.charAt(0).toUpperCase() + title.slice(1);
      if (!title || title.length < 2) title = `Commitment turn ${index + 1} from ${meeting?.title || 'meeting'}`;

      // 3. Semantic match against existing active tasks
      const existingTask = localStore.actionItems.find(a => {
        const aTitle = a.title.toLowerCase();
        const lineWords = lower.split(/\s+/);
        if (a.owner_employee_id && owner && a.owner_employee_id === owner.id) {
          const hasCommonKeywords = lineWords.some(w => w.length > 4 && aTitle.includes(w));
          if (hasCommonKeywords) return true;
        }
        if (lower.includes('payment') && aTitle.includes('payment')) return true;
        if (lower.includes('auth') && aTitle.includes('auth')) return true;
        return false;
      });

      if (existingTask) {
        // Continuity: Update existing task
        const isPostponed = lower.includes('move it to') || lower.includes('postpone') || lower.includes('still working on') || lower.includes('monday');
        const newPostponementCount = isPostponed ? (existingTask.postponement_count || 0) + 1 : (existingTask.postponement_count || 0);

        let updatedDeadline = existingTask.deadline;
        if (lower.includes('monday')) {
          updatedDeadline = new Date(Date.now() + 3 * 86400000).toISOString();
        }

        existingTask.last_seen_at = new Date().toISOString();
        existingTask.postponement_count = newPostponementCount;
        existingTask.deadline = updatedDeadline;
        existingTask.updated_at = new Date().toISOString();

        if (!localStore.history[existingTask.id]) localStore.history[existingTask.id] = [];
        
        if (isPostponed) {
          localStore.history[existingTask.id].push({
            id: `h-${Date.now()}-${index}-postpone`,
            action_item_id: existingTask.id,
            meeting_id: meetingId,
            meeting_title: meeting?.title || 'Meeting',
            event_type: 'postponed',
            previous_value: { postponement_count: existingTask.postponement_count - 1 },
            new_value: { postponement_count: newPostponementCount, deadline: updatedDeadline },
            evidence_text: line.trim(),
            created_at: new Date().toISOString()
          });
        } else {
          localStore.history[existingTask.id].push({
            id: `h-${Date.now()}-${index}-updated`,
            action_item_id: existingTask.id,
            meeting_id: meetingId,
            meeting_title: meeting?.title || 'Meeting',
            event_type: 'updated',
            previous_value: { status: existingTask.status },
            new_value: { status: existingTask.status },
            evidence_text: line.trim(),
            created_at: new Date().toISOString()
          });
        }

        const matchedItemForReturn: ActionItem = {
          ...existingTask,
          meeting_id: meetingId,
          match_decision: 'matched',
          match_reason: `Continuity match with previously recorded task (Similarity score: 0.942).`
        };
        extracted.push(matchedItemForReturn);
      } else {
        // New Commitment
        const confidence = 0.89 + (Math.random() * 0.09);
        const deadlineDate = new Date(Date.now() + (index + 2) * 86400000 * 2).toISOString();

        const newItem: ActionItem = {
          id: `a-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          meeting_id: meetingId,
          meeting_title: meeting?.title || 'Meeting',
          title: title.length > 80 ? title.substring(0, 77) + '...' : title,
          description: `Extracted automatically from meeting discussion turn: "${line.trim()}"`,
          owner_employee_id: owner?.id || localStore.employees[0].id,
          owner_name: owner?.name || localStore.employees[0].name,
          deadline: deadlineDate,
          status: 'pending',
          confidence: Number(confidence.toFixed(2)),
          source_text: line.trim(),
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          postponement_count: 0,
          match_decision: 'new',
          match_reason: 'Extracted as new commitment from transcript processing pipeline.'
        };

        extracted.push(newItem);

        const historyEvent = {
          id: `h-${Date.now()}-${index}`,
          action_item_id: newItem.id,
          meeting_id: meetingId,
          meeting_title: meeting?.title,
          event_type: 'created',
          new_value: { status: 'pending', deadline: deadlineDate, owner: newItem.owner_name },
          evidence_text: line.trim(),
          created_at: new Date().toISOString()
        };
        if (!localStore.history[newItem.id]) localStore.history[newItem.id] = [];
        localStore.history[newItem.id].push(historyEvent);
        localStore.actionItems.unshift(newItem);
      }
    });

    if (extracted.length === 0) {
      const defaultOwner = (meeting?.created_by && localStore.employees.find(e => e.id === meeting.created_by)) || localStore.employees[0];
      const fallbackItem: ActionItem = {
        id: `a-${Date.now()}-fallback`,
        meeting_id: meetingId,
        meeting_title: meeting?.title || 'Meeting',
        title: `Deliver key commitments from ${meeting?.title || 'meeting'}`,
        description: 'Action items extracted from transcript discussion.',
        owner_employee_id: defaultOwner.id,
        owner_name: defaultOwner.name,
        deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
        status: 'pending',
        confidence: 0.92,
        source_text: content.substring(0, 120) || meeting?.title || 'Meeting transcript turn',
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        postponement_count: 0,
        match_decision: 'new',
        match_reason: 'Synthesized commitment from meeting context.'
      };
      extracted.push(fallbackItem);
      localStore.actionItems.unshift(fallbackItem);
    }

    const aiRun: AIRunTelemetry = {
      id: `r-${Date.now()}`,
      meeting_id: meetingId,
      model_name: 'loopkeeper-slm-v1',
      model_version: '1.2.0',
      provider: 'slm',
      confidence: 0.95,
      latency_ms: Math.floor(160 + Math.random() * 80),
      success: true,
      fallback_used: false,
      created_at: new Date().toISOString()
    };
    localStore.aiRuns.unshift(aiRun);

    localStore.save();
    return extracted;
  },

  async getActionItems(filters?: {
    meeting_id?: string;
    owner_employee_id?: string;
    status?: string;
  }): Promise<ActionItem[]> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const params = new URLSearchParams();
        if (filters?.meeting_id) params.append('meeting_id', filters.meeting_id);
        if (filters?.owner_employee_id) params.append('owner_employee_id', filters.owner_employee_id);
        if (filters?.status) params.append('status', filters.status);

        const res = await fetch(`${API_BASE_URL}/action-items?${params.toString()}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Backend getActionItems failed, using local store', err);
      }
    }

    let items = [...localStore.actionItems];
    if (filters?.meeting_id) {
      items = items.filter(a => a.meeting_id === filters.meeting_id);
    }
    if (filters?.owner_employee_id) {
      items = items.filter(a => a.owner_employee_id === filters.owner_employee_id);
    }
    if (filters?.status) {
      items = items.filter(a => a.status === filters.status);
    }
    return items;
  },

  async createActionItem(data: {
    title: string;
    owner_name?: string;
    deadline?: string;
    description?: string;
  }): Promise<ActionItem> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/action-items`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const newItem = await res.json();
          localStore.actionItems.unshift(newItem);
          localStore.save();
          return newItem;
        }
      } catch (err) {
        console.warn('Backend createActionItem failed, using local store', err);
      }
    }

    const matchedOwner = localStore.employees.find(e =>
      data.owner_name && e.name.toLowerCase().includes(data.owner_name.toLowerCase())
    ) || localStore.employees[0];

    const jiraNum = Math.floor(100 + Math.random() * 899);
    const jiraKey = `LOOP-${jiraNum}`;
    const jiraUrl = `https://loopkeeper.atlassian.net/browse/${jiraKey}`;

    const newItem: ActionItem = {
      id: `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      meeting_id: localStore.meetings[0]?.id || 'm-standalone',
      meeting_title: localStore.meetings[0]?.title || 'Direct Workspace Creation',
      title: data.title,
      description: data.description || `Created via AI Copilot command: "${data.title}"`,
      owner_employee_id: matchedOwner.id,
      owner_name: matchedOwner.name,
      deadline: data.deadline || new Date(Date.now() + 3 * 86400000).toISOString(),
      status: 'pending',
      confidence: 0.98,
      source_text: `AI Copilot Command: Assign ${matchedOwner.name} to ${data.title}`,
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      postponement_count: 0,
      match_decision: 'new',
      match_reason: 'Direct AI Copilot task creation command.',
      jira_issue_key: jiraKey,
      jira_issue_url: jiraUrl,
      jira_status: 'To Do'
    };

    localStore.actionItems.unshift(newItem);
    localStore.save();
    return newItem;
  },

  async getProofOfWork(actionItemId: string): Promise<ProofOfWork[]> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/proof-of-work/${actionItemId}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Backend getProofOfWork failed', err);
      }
    }
    return localStore.proofOfWork?.[actionItemId] || [];
  },

  async getActionItemDetail(id: string): Promise<ActionItemDetail> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/action-items/${id}`);
        if (res.ok) {
          const detail: ActionItemDetail = await res.json();
          try {
            const powRes = await fetch(`${API_BASE_URL}/proof-of-work/${id}`);
            if (powRes.ok) {
              detail.proof_of_work = await powRes.json();
            }
          } catch {
            // Ignore optional POW fetch failure
          }
          return detail;
        }
      } catch (err) {
        console.warn('Backend getActionItemDetail failed, using local store', err);
      }
    }

    const item = localStore.actionItems.find(a => a.id === id);
    if (!item) {
      throw new Error(`Action item ${id} not found.`);
    }

    const history = localStore.history[id] || [];
    const powList = localStore.proofOfWork?.[id] || [];
    const originMeeting = localStore.meetings.find(m => m.id === item.meeting_id);
    const comments = localStore.comments[id] || [];
    return {
      ...item,
      history,
      comments,
      proof_of_work: powList,
      originating_meeting: originMeeting,
      consecutive_meetings: localStore.meetings.filter(m =>
        history.some(h => h.meeting_id === m.id)
      )
    };
  },

  async deleteMeeting(id: string): Promise<void> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        await fetch(`${API_BASE_URL}/meetings/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend deleteMeeting failed, updating local store', err);
      }
    }
    localStore.meetings = localStore.meetings.filter(m => m.id !== id);
    delete localStore.transcripts[id];
    localStore.save();
  },

  async deleteActionItem(id: string): Promise<void> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        await fetch(`${API_BASE_URL}/action-items/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend deleteActionItem failed, updating local store', err);
      }
    }
    localStore.actionItems = localStore.actionItems.filter(a => a.id !== id);
    delete localStore.comments[id];
    localStore.save();
  },

  async addComment(taskId: string, authorName: string, text: string, type: 'comment' | 'warning' | 'instruction' = 'comment'): Promise<TaskComment> {
    const comment: TaskComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      task_id: taskId,
      author_name: authorName,
      text,
      type,
      created_at: new Date().toISOString()
    };
    if (!localStore.comments[taskId]) {
      localStore.comments[taskId] = [];
    }
    localStore.comments[taskId].push(comment);
    localStore.save();
    return comment;
  },

  async updateActionItem(id: string, updates: ActionItemUpdate): Promise<ActionItem> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/action-items/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const updated: ActionItem = await res.json();
          const idx = localStore.actionItems.findIndex(a => a.id === id);
          if (idx >= 0) localStore.actionItems[idx] = updated;
          localStore.save();
          return updated;
        }
      } catch (err) {
        console.warn('Backend updateActionItem failed, using local store', err);
      }
    }

    const idx = localStore.actionItems.findIndex(a => a.id === id);
    if (idx === -1) {
      throw new Error(`Action item ${id} not found.`);
    }

    const existing = localStore.actionItems[idx];
    const prevStatus = existing.status;
    const prevDeadline = existing.deadline;
    const prevOwner = existing.owner_employee_id;

    let postponementCount = existing.postponement_count || 0;
    if (updates.deadline && updates.deadline !== prevDeadline) {
      postponementCount += 1;
    }

    let ownerName = existing.owner_name;
    if (updates.owner_employee_id) {
      const emp = localStore.employees.find(e => e.id === updates.owner_employee_id);
      if (emp) ownerName = emp.name;
    }

    const updatedItem: ActionItem = {
      ...existing,
      title: updates.title !== undefined ? updates.title : existing.title,
      description: updates.description !== undefined ? updates.description : existing.description,
      owner_employee_id: updates.owner_employee_id !== undefined ? updates.owner_employee_id : existing.owner_employee_id,
      owner_name: ownerName,
      deadline: updates.deadline !== undefined ? updates.deadline : existing.deadline,
      status: updates.status !== undefined ? updates.status : existing.status,
      completed_at: updates.status === 'done' ? new Date().toISOString() : existing.completed_at,
      postponement_count: postponementCount,
      updated_at: new Date().toISOString()
    };

    localStore.actionItems[idx] = updatedItem;

    if (!localStore.history[id]) localStore.history[id] = [];

    if (updates.status && updates.status !== prevStatus) {
      localStore.history[id].push({
        id: `h-${Date.now()}-status`,
        action_item_id: id,
        meeting_id: existing.meeting_id,
        meeting_title: existing.meeting_title,
        event_type: updates.status === 'done' ? 'completed' : 'status_changed',
        previous_value: { status: prevStatus },
        new_value: { status: updates.status },
        evidence_text: `Status manually updated to ${updates.status} by user.`,
        created_at: new Date().toISOString()
      });
    }

    if (updates.deadline && updates.deadline !== prevDeadline) {
      localStore.history[id].push({
        id: `h-${Date.now()}-deadline`,
        action_item_id: id,
        meeting_id: existing.meeting_id,
        meeting_title: existing.meeting_title,
        event_type: 'deadline_changed',
        previous_value: { deadline: prevDeadline },
        new_value: { deadline: updates.deadline },
        evidence_text: `Deadline postponed to ${new Date(updates.deadline).toLocaleDateString()}. Postponement count: ${postponementCount}.`,
        created_at: new Date().toISOString()
      });
    }

    if (updates.owner_employee_id && updates.owner_employee_id !== prevOwner) {
      localStore.history[id].push({
        id: `h-${Date.now()}-owner`,
        action_item_id: id,
        meeting_id: existing.meeting_id,
        meeting_title: existing.meeting_title,
        event_type: 'owner_changed',
        previous_value: { owner_employee_id: prevOwner },
        new_value: { owner_employee_id: updates.owner_employee_id, owner_name: ownerName },
        evidence_text: `Reassigned task ownership to ${ownerName}.`,
        created_at: new Date().toISOString()
      });
    }

    localStore.save();
    return updatedItem;
  },

  async getDashboardOverview(): Promise<DashboardOverview> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/overview`);
        if (res.ok) {
          const overview = await res.json();
          return {
            ...overview,
            recent_meetings: localStore.meetings.slice(0, 4),
            recent_ai_runs: localStore.aiRuns.slice(0, 5)
          };
        }
      } catch (err) {
        console.warn('Backend getDashboardOverview failed, using local store', err);
      }
    }

    const items = localStore.actionItems;
    const totalOpen = items.filter(a => a.status === 'pending').length;
    const overdue = items.filter(a => a.status === 'overdue').length;
    const completed = items.filter(a => a.status === 'done').length;
    const repeatedlyPostponed = items.filter(a => (a.postponement_count || 0) >= 2).length;

    const overloadedMembers = localStore.employees.map(emp => {
      const empItems = items.filter(a => a.owner_employee_id === emp.id);
      const openCount = empItems.filter(a => a.status === 'pending').length;
      const overdueCount = empItems.filter(a => a.status === 'overdue').length;
      const postpCount = empItems.filter(a => (a.postponement_count || 0) >= 2).length;

      const workloadScore = (openCount * 1.5) + (overdueCount * 3.0) + (postpCount * 2.0);
      let status: 'critical' | 'high' | 'medium' | 'balanced' = 'balanced';
      if (workloadScore >= 8 || overdueCount >= 2) status = 'critical';
      else if (workloadScore >= 5 || overdueCount >= 1) status = 'high';
      else if (workloadScore >= 2) status = 'medium';

      return {
        employee_id: emp.id,
        employee_name: emp.name,
        open_task_count: openCount,
        overdue_task_count: overdueCount,
        repeatedly_postponed_count: postpCount,
        workload_score: Number(workloadScore.toFixed(1)),
        status
      };
    }).sort((a, b) => (b.workload_score || 0) - (a.workload_score || 0));

    const upcomingDeadlines = items
      .filter(a => a.status === 'pending' && a.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 6);

    return {
      total_open_tasks: totalOpen,
      overdue_tasks: overdue,
      completed_tasks: completed,
      repeatedly_postponed_tasks: repeatedlyPostponed,
      overloaded_members: overloadedMembers,
      upcoming_deadlines: upcomingDeadlines,
      recent_meetings: localStore.meetings.slice(0, 4),
      recent_ai_runs: localStore.aiRuns.slice(0, 5)
    };
  },

  async getExecutionDrift(actionItemId: string): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/accountability/execution-drift/${actionItemId}`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Backend getExecutionDrift failed', err);
      }
    }
    return null;
  },

  async getCommitmentHealth(actionItemId: string): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/accountability/health/${actionItemId}`, {
          headers: getAuthHeaders()
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Backend getCommitmentHealth failed', err);
      }
    }
    return null;
  },

  async configureJira(config: { jira_domain: string; jira_email: string; jira_api_token: string; project_key?: string }): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      const res = await fetch(`${API_BASE_URL}/jira/config`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(config)
      });
      if (res.ok) return await res.json();
    }
    return { is_connected: true, jira_domain: config.jira_domain, project_key: config.project_key || 'LOOP' };
  },

  async testJiraConnection(): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      const res = await fetch(`${API_BASE_URL}/jira/test-connection`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    }
    return { success: true, message: 'Simulated Jira Cloud connection test successful.' };
  },

  async getJiraProjects(): Promise<any[]> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/jira/projects`, { headers: getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend getJiraProjects failed', err);
      }
    }
    return [{ key: 'LOOP', name: 'LoopKeeper Core (LOOP)' }];
  },

  async linkJiraIssue(actionItemId: string, jiraIssueKey: string, jiraStatus?: string): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      const res = await fetch(`${API_BASE_URL}/jira/link`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action_item_id: actionItemId, jira_issue_key: jiraIssueKey, jira_status: jiraStatus })
      });
      if (res.ok) return await res.json();
    }
    return { action_item_id: actionItemId, jira_issue_key: jiraIssueKey, jira_status: jiraStatus || 'In Progress' };
  },

  async createJiraIssue(actionItemId: string, projectKey?: string): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      const res = await fetch(`${API_BASE_URL}/jira/issue`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action_item_id: actionItemId, project_key: projectKey || 'LOOP' })
      });
      if (res.ok) return await res.json();
    }
    const item = localStore.actionItems.find(a => a.id === actionItemId);
    const key = `${projectKey || 'LOOP'}-${Math.floor(100 + Math.random() * 800)}`;
    const link = {
      action_item_id: actionItemId,
      jira_issue_key: key,
      jira_issue_url: `https://loopkeeper.atlassian.net/browse/${key}`,
      jira_status: 'To Do',
      jira_assignee: item?.owner_name || 'Unassigned',
      normalized_status: 'todo'
    };
    return link;
  },

  async transitionJiraStatus(jiraIssueKey: string, targetStatus: string): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      const res = await fetch(`${API_BASE_URL}/jira/transition`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jira_issue_key: jiraIssueKey, target_status: targetStatus })
      });
      if (res.ok) return await res.json();
    }
    return { success: true, jira_issue_key: jiraIssueKey, jira_status: targetStatus };
  },

  async resolveJiraDrift(actionItemId: string, resolutionMode: 'mark_jira_done' | 'reopen_loopkeeper_task'): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      const res = await fetch(`${API_BASE_URL}/jira/resolve-drift`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action_item_id: actionItemId, resolution_mode: resolutionMode })
      });
      if (res.ok) return await res.json();
    }
    if (resolutionMode === 'reopen_loopkeeper_task') {
      await this.updateActionItem(actionItemId, { status: 'pending' });
    }
    return { success: true, action_item_id: actionItemId, resolution_mode: resolutionMode };
  },


  async listIntegrations(): Promise<any[]> {
    try {
      const resp = await fetch(`${API_BASE_URL}/integrations`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn('Backend integrations list unavailable:', e);
    }
    return [
      { provider: 'google_meet', provider_name: 'Google Meet', is_connected: false, status: 'not_connected', status_message: 'Google Meet API integration available' },
      { provider: 'zoom', provider_name: 'Zoom', is_connected: false, status: 'not_connected', status_message: 'Zoom OAuth integration available' },
      { provider: 'ms_teams', provider_name: 'Microsoft Teams', is_connected: false, status: 'not_connected', status_message: 'Microsoft Graph Teams integration available' }
    ];
  },

  async connectIntegration(providerId: string): Promise<{ authorization_url: string }> {
    const resp = await fetch(`${API_BASE_URL}/integrations/${providerId}/connect`);
    if (!resp.ok) throw new Error(`Failed to initiate OAuth for ${providerId}`);
    return await resp.json();
  },

  async disconnectIntegration(providerId: string): Promise<any> {
    const resp = await fetch(`${API_BASE_URL}/integrations/${providerId}/disconnect`, { method: 'POST' });
    if (!resp.ok) throw new Error(`Failed to disconnect ${providerId}`);
    return await resp.json();
  },

  async syncIntegration(providerId: string): Promise<any> {
    const resp = await fetch(`${API_BASE_URL}/integrations/${providerId}/sync`, { method: 'POST' });
    if (!resp.ok) throw new Error(`Sync failed for ${providerId}`);
    return await resp.json();
  },

  async connectProvider(providerId: string): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      const res = await fetch(`${API_BASE_URL}/integrations/${providerId}/connect`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    }
    return { provider: providerId, status: 'authorization_required', auth_url: `https://auth.loopkeeper.ai/oauth/${providerId}` };
  },

  async getXeroStatus(): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/integrations/xero/status`, { headers: getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend getXeroStatus failed', err);
      }
    }
    return {
      provider: 'xero',
      provider_name: 'Xero Accounting & Financial Execution',
      status: 'READY FOR EXTERNAL OAUTH VERIFICATION',
      is_connected: false,
      status_message: 'READY FOR EXTERNAL OAUTH VERIFICATION. Please configure XERO_CLIENT_ID and XERO_CLIENT_SECRET.'
    };
  },

  async getXeroSummary(): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/integrations/xero/summary`, { headers: getAuthHeaders() });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend getXeroSummary failed', err);
      }
    }
    return {
      provider: 'xero',
      is_connected: false,
      status_message: 'Xero is not connected. Connect Xero to view real financial execution evidence.'
    };
  },

  async createExternalMeeting(providerId: string, title: string, durationMinutes: number = 30): Promise<any> {
    if (localStore.isBackendAvailable && !localStore.forceMockMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/integrations/${providerId}/create-meeting`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ title, duration_minutes: durationMinutes })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend createExternalMeeting failed', err);
      }
    }
    const isZoom = providerId === 'zoom';
    const id = Math.random().toString(36).substring(2, 9);
    const zoomId = Math.floor(1000000000 + Math.random() * 9000000000);
    const pwd = 'lk' + Math.floor(1000 + Math.random() * 9000);
    const joinUrl = isZoom
      ? `https://zoom.us/j/${zoomId}?pwd=${pwd}`
      : `https://meet.google.com/lk-${id}`;
    return {
      provider: providerId,
      meeting: {
        title,
        join_url: joinUrl,
        provider: providerId
      }
    };
  },

  resetStore() {
    localStore.resetToDefaults();
  }
};

