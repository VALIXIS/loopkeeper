export type TaskStatus = 'pending' | 'done' | 'overdue' | 'cancelled';

export type HistoryEventType =
  | 'created'
  | 'updated'
  | 'deadline_changed'
  | 'owner_changed'
  | 'status_changed'
  | 'postponed'
  | 'completed'
  | 'reopened';

export type MatchDecisionType = 'matched' | 'new' | 'uncertain';

export type AIProviderType = 'slm' | 'fallback_llm';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  is_manager: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  source: string;
  external_source_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  action_item_count?: number;
  participants?: Employee[];
}

export interface MeetingCreate {
  title: string;
  meeting_date?: string;
  source?: string;
  external_source_id?: string;
  created_by?: string;
  participant_ids?: string[];
}

export interface Transcript {
  id: string;
  meeting_id: string;
  content: string;
  source_file_name?: string | null;
  transcript_format?: string | null;
  created_at: string;
}

export interface TranscriptCreate {
  content: string;
  source_file_name?: string;
  transcript_format?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_name: string;
  text: string;
  type: 'comment' | 'warning' | 'instruction';
  created_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string | null;
  owner_employee_id?: string | null;
  owner_name?: string;
  deadline?: string | null;
  status: TaskStatus;
  confidence: number;
  source_text?: string | null;
  first_seen_at: string;
  last_seen_at: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  postponement_count?: number;
  meeting_title?: string;
  match_decision?: MatchDecisionType;
  match_reason?: string;
  matched_valixis_task_id?: string | null;
  comments?: TaskComment[];
}

export interface ActionItemCreate {
  meeting_id: string;
  title: string;
  description?: string;
  owner_employee_id?: string;
  deadline?: string;
  status?: TaskStatus;
  confidence?: number;
  source_text?: string;
}

export interface ActionItemUpdate {
  title?: string;
  description?: string;
  owner_employee_id?: string;
  deadline?: string;
  status?: TaskStatus;
}

export interface ActionItemHistory {
  id: string;
  action_item_id: string;
  meeting_id: string;
  meeting_title?: string;
  event_type: HistoryEventType;
  previous_value?: any;
  new_value?: any;
  evidence_text?: string | null;
  created_at: string;
}

export interface ProofOfWork {
  id: string;
  action_item_id: string;
  provider: string;
  external_event_type: string;
  external_event_id: string;
  repository: string;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  author_login: string;
  author_email?: string | null;
  resolution_method: 'explicit_key' | 'vector_similarity';
  similarity_score?: number | null;
  evidence_text: string;
  created_at: string;
}

export interface ActionItemDetail extends ActionItem {
  history: ActionItemHistory[];
  proof_of_work?: ProofOfWork[];
  originating_meeting?: Meeting;
  consecutive_meetings?: Meeting[];
}


export interface MeetingDetail extends Meeting {
  transcript?: Transcript | null;
  action_items: ActionItem[];
  participant_ids: string[];
  ai_runs?: AIRunTelemetry[];
}

export interface OverloadedMember {
  employee_id: string;
  employee_name: string;
  open_task_count: number;
  overdue_task_count: number;
  repeatedly_postponed_count?: number;
  workload_score?: number;
  status?: 'critical' | 'high' | 'medium' | 'balanced';
}

export interface DashboardOverview {
  total_open_tasks: number;
  overdue_tasks: number;
  completed_tasks: number;
  repeatedly_postponed_tasks: number;
  overloaded_members: OverloadedMember[];
  upcoming_deadlines: ActionItem[];
  recent_meetings?: Meeting[];
  recent_ai_runs?: AIRunTelemetry[];
}

export interface AIRunTelemetry {
  id: string;
  meeting_id?: string | null;
  action_item_id?: string | null;
  model_name: string;
  model_version?: string | null;
  provider: AIProviderType;
  input_hash?: string | null;
  confidence: number;
  latency_ms: number;
  success: boolean;
  fallback_used: boolean;
  created_at: string;
}

export interface PipelineProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  details?: string;
  latency?: number;
}

export interface GraphNode {
  id: string;
  type: 'meeting' | 'commitment' | 'owner' | 'deadline' | 'change' | 'outcome';
  label: string;
  subtitle?: string;
  status?: TaskStatus | 'active' | 'warning' | 'done';
  confidence?: number;
  data?: any;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'solid' | 'dashed' | 'animated';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
