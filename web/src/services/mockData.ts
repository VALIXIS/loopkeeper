import type { Employee, Meeting, ActionItem, ActionItemHistory, AIRunTelemetry } from '../types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Jyothsna (Lead Architect)',
    email: 'jyothsna@loopkeeper.io',
    role: 'Product Lead & Lead Architect',
    department: 'Engineering',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    is_manager: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Alice Johnson',
    email: 'alice.j@loopkeeper.io',
    role: 'Senior Backend Engineer',
    department: 'Platform',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Bob Smith',
    email: 'bob.smith@loopkeeper.io',
    role: 'Frontend & UI Specialist',
    department: 'Client Experience',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Charlie Lee',
    email: 'charlie.l@loopkeeper.io',
    role: 'AI & Inference Systems Engineer',
    department: 'Applied AI',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Diana Patel',
    email: 'diana.p@loopkeeper.io',
    role: 'Integration & QA Lead',
    department: 'Quality & Ops',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Priya Sharma',
    email: 'priya.s@loopkeeper.io',
    role: 'Senior Backend Engineer',
    department: 'Platform',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
    name: 'Jyothsna (Valixis)',
    email: 'jyothsna@valixis.com',
    role: 'Product Lead & Lead Architect',
    department: 'Engineering',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    is_manager: true
  },
  {
    id: '9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee',
    name: 'Subhash',
    email: 'official.valixis@gmail.com',
    role: 'Engineering Manager',
    department: 'Core Operations',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    is_manager: true
  },
  {
    id: 'e6cb8913-904a-4a7d-b507-ba1470665dc5',
    name: 'Adithya',
    email: 'adithya@valixis.com',
    role: 'Senior Platform Engineer',
    department: 'Core Engineering',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: 'a2b32605-343c-4ef4-9365-e219e8b21e20',
    name: 'Vaseem',
    email: 'vaseem@valixis.com',
    role: 'Senior Full Stack Engineer',
    department: 'Frontend & Mobile',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '8a18fff4-6236-4d54-a29a-eeb3c65dd646',
    name: 'Krishna',
    email: 'krishna@valixis.com',
    role: 'Backend & ML Engineer',
    department: 'AI Systems',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '5af2f8a8-a881-408a-8fdd-1fee384f1779',
    name: 'Vignesh',
    email: 'vignesh@valixis.com',
    role: 'Systems Engineer',
    department: 'Infrastructure',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  },
  {
    id: '39244951-87a5-44e6-801a-28cb3b1a0ed5',
    name: 'Hasitha',
    email: 'hasitha@valixis.com',
    role: 'Quality & Test Engineer',
    department: 'QA & Compliance',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    is_manager: false
  }
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1000000-0000-0000-0000-000000000001',
    title: 'Sprint 14 Architecture & AI Engine Kickoff',
    meeting_date: '2026-09-02T10:00:00Z',
    source: 'transcript',
    external_source_id: 'meet-arch-s14',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-02T10:30:00Z',
    action_item_count: 4,
    participants: [MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[1], MOCK_EMPLOYEES[2], MOCK_EMPLOYEES[3]]
  },
  {
    id: 'm1000000-0000-0000-0000-000000000002',
    title: 'VALIXIS Portal Integration & Database Boundary Sync',
    meeting_date: '2026-09-03T14:30:00Z',
    source: 'transcript',
    external_source_id: 'meet-valixis-sync',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: '2026-09-03T15:15:00Z',
    updated_at: '2026-09-03T15:15:00Z',
    action_item_count: 3,
    participants: [MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[1], MOCK_EMPLOYEES[4]]
  },
  {
    id: 'm1000000-0000-0000-0000-000000000003',
    title: 'Daily Standup - SLM Fallback & Authentication Blockers',
    meeting_date: '2026-09-04T09:30:00Z',
    source: 'transcript',
    external_source_id: 'meet-standup-0904',
    created_by: '22222222-2222-2222-2222-222222222222',
    created_at: '2026-09-04T10:00:00Z',
    updated_at: '2026-09-04T10:00:00Z',
    action_item_count: 4,
    participants: [MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[1], MOCK_EMPLOYEES[2], MOCK_EMPLOYEES[3], MOCK_EMPLOYEES[4]]
  },
  {
    id: 'm1000000-0000-0000-0000-000000000004',
    title: 'Release Readiness & Accountability Graph Review',
    meeting_date: '2026-09-05T08:00:00Z',
    source: 'transcript',
    external_source_id: 'meet-release-prep',
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: '2026-09-05T08:45:00Z',
    updated_at: '2026-09-05T08:45:00Z',
    action_item_count: 2,
    participants: [MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[2], MOCK_EMPLOYEES[3]]
  }
];

export const MOCK_TRANSCRIPTS: Record<string, string> = {
  'm1000000-0000-0000-0000-000000000001': `[00:01:15] Jyothsna: Alright team, let's lock in our commitments for Sprint 14. Alice, can you finish the pgvector 1536-dim schema and HNSW indexes by Friday?
[00:01:34] Alice: Yes, I am on it. I'll have the schema migration SQL and HNSW index deployed by September 6th 5 PM.
[00:02:10] Jyothsna: Great. Bob, what about the mobile auth token refresh bug?
[00:02:22] Bob: I'm still debugging the JWT race condition. I will resolve the auth token refresh bug by September 4th.
[00:03:00] Charlie: On the AI side, I will complete the SLM provider fallback router and confidence scoring evaluator by September 5th.
[00:04:12] Jyothsna: Someone should also audit the VALIXIS read-only boundary to make sure no writes occur. Diana, could you handle that by Monday?
[00:04:30] Diana: Confirmed, I'll audit the VALIXIS RLS and table boundaries by Sept 8th.`,

  'm1000000-0000-0000-0000-000000000002': `[00:00:45] Jyothsna: Diana, how is the VALIXIS audit looking?
[00:01:02] Diana: The read-only check on employee and tasks tables is clean. I will finish documenting the audit report by September 7th.
[00:02:15] Alice: I noticed we need a safe mock repository fallback for local testing when Supabase is unreachable. I'll build the in-memory repository fallbacks by tomorrow evening.
[00:03:40] Jyothsna: Perfect. Let's make sure the backend tests pass with 100% vector cosine distance validation.`,

  'm1000000-0000-0000-0000-000000000003': `[00:01:00] Jyothsna: Morning standup. Bob, what is the status of the auth token refresh bug from Wednesday?
[00:01:18] Bob: Unfortunately I got pulled into the Vite UI bundle configuration, so I couldn't finish it yesterday. I need to postpone resolving the auth token refresh bug to September 7th.
[00:02:05] Jyothsna: Okay, this is the second time it's slipping. Please prioritize it. What about the web responsive navigation?
[00:02:20] Bob: I will finish the responsive sidebar navigation and executive dashboard by tonight.
[00:03:10] Charlie: The SLM provider pipeline is functioning, but latency was high. I need to optimize the ONNX runtime inference to get it under 250ms by September 8th.
[00:04:00] Alice: The pgvector HNSW index is completed and verified against sample embeddings.`,

  'm1000000-0000-0000-0000-000000000004': `[00:00:30] Jyothsna: Final stretch before release. Bob, how is the Accountability Graph visualization looking?
[00:00:50] Bob: The signature graph mapping Meetings to Commitments to Outcomes is interactive and smooth. I'll add the zoom controls by 2 PM today.
[00:01:30] Charlie: AI Fallback pipeline successfully triggers FallbackLLM whenever SLM confidence drops below 0.75.`
};

export const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    meeting_id: 'm1000000-0000-0000-0000-000000000001',
    meeting_title: 'Sprint 14 Architecture & AI Engine Kickoff',
    title: 'Deploy pgvector 1536-dim schema and HNSW indexes',
    description: 'Create PostgreSQL migration with vector(1536) and cosine distance HNSW index for deduplication.',
    owner_employee_id: '22222222-2222-2222-2222-222222222222',
    owner_name: 'Alice Johnson',
    deadline: '2026-09-06T17:00:00Z',
    status: 'done',
    confidence: 0.98,
    source_text: "Alice: Yes, I am on it. I'll have the schema migration SQL and HNSW index deployed by September 6th 5 PM.",
    first_seen_at: '2026-09-02T10:30:00Z',
    last_seen_at: '2026-09-04T10:00:00Z',
    completed_at: '2026-09-04T10:00:00Z',
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-04T10:00:00Z',
    postponement_count: 0,
    match_decision: 'matched',
    match_reason: 'Exact semantic match with Sprint 14 DB milestone (Score: 0.982).'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    meeting_id: 'm1000000-0000-0000-0000-000000000001',
    meeting_title: 'Sprint 14 Architecture & AI Engine Kickoff',
    title: 'Resolve mobile auth token refresh bug & JWT race condition',
    description: 'Fix token rotation and concurrency race condition causing logout during active sessions.',
    owner_employee_id: '33333333-3333-3333-3333-333333333333',
    owner_name: 'Bob Smith',
    deadline: '2026-09-07T18:00:00Z',
    status: 'overdue',
    confidence: 0.94,
    source_text: "Bob: I need to postpone resolving the auth token refresh bug to September 7th.",
    first_seen_at: '2026-09-02T10:30:00Z',
    last_seen_at: '2026-09-04T10:00:00Z',
    completed_at: null,
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-04T10:00:00Z',
    postponement_count: 2,
    match_decision: 'matched',
    match_reason: 'Matched recurring commitment from Kickoff meeting (Similarity: 0.945).'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    meeting_id: 'm1000000-0000-0000-0000-000000000001',
    meeting_title: 'Sprint 14 Architecture & AI Engine Kickoff',
    title: 'Build SLM provider fallback router and confidence scoring evaluator',
    description: 'Implement dual inference pipeline routing extractions to fallback LLM when confidence < 0.75.',
    owner_employee_id: '44444444-4444-4444-4444-444444444444',
    owner_name: 'Charlie Lee',
    deadline: '2026-09-05T20:00:00Z',
    status: 'done',
    confidence: 0.96,
    source_text: "Charlie: I will complete the SLM provider fallback router and confidence scoring evaluator by September 5th.",
    first_seen_at: '2026-09-02T10:30:00Z',
    last_seen_at: '2026-09-05T08:45:00Z',
    completed_at: '2026-09-05T08:45:00Z',
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-05T08:45:00Z',
    postponement_count: 0,
    match_decision: 'new',
    match_reason: 'New core AI infrastructure task created.'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004',
    meeting_id: 'm1000000-0000-0000-0000-000000000001',
    meeting_title: 'Sprint 14 Architecture & AI Engine Kickoff',
    title: 'Audit VALIXIS RLS and table boundaries for read-only compliance',
    description: 'Ensure no INSERT/UPDATE/DELETE operations touch VALIXIS portal tables.',
    owner_employee_id: '55555555-5555-5555-5555-555555555555',
    owner_name: 'Diana Patel',
    deadline: '2026-09-08T18:00:00Z',
    status: 'pending',
    confidence: 0.91,
    source_text: "Diana: Confirmed, I'll audit the VALIXIS RLS and table boundaries by Sept 8th.",
    first_seen_at: '2026-09-02T10:30:00Z',
    last_seen_at: '2026-09-03T15:15:00Z',
    completed_at: null,
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-03T15:15:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000005',
    meeting_id: 'm1000000-0000-0000-0000-000000000002',
    meeting_title: 'VALIXIS Portal Integration & Database Boundary Sync',
    title: 'Implement in-memory repository fallbacks for local stability',
    description: 'Ensure zero-crash operation even without active database connection.',
    owner_employee_id: '22222222-2222-2222-2222-222222222222',
    owner_name: 'Alice Johnson',
    deadline: '2026-09-05T18:00:00Z',
    status: 'done',
    confidence: 0.95,
    source_text: "Alice: I'll build the in-memory repository fallbacks by tomorrow evening.",
    first_seen_at: '2026-09-03T15:15:00Z',
    last_seen_at: '2026-09-04T10:00:00Z',
    completed_at: '2026-09-04T18:00:00Z',
    created_at: '2026-09-03T15:15:00Z',
    updated_at: '2026-09-04T18:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000006',
    meeting_id: 'm1000000-0000-0000-0000-000000000003',
    meeting_title: 'Daily Standup - SLM Fallback & Authentication Blockers',
    title: 'Build executive web dashboard and responsive navigation',
    description: 'Implement desktop-first executive UI with live metrics, AI status, and mobile drawer.',
    owner_employee_id: '33333333-3333-3333-3333-333333333333',
    owner_name: 'Bob Smith',
    deadline: '2026-09-05T23:59:00Z',
    status: 'pending',
    confidence: 0.97,
    source_text: "Bob: I will finish the responsive sidebar navigation and executive dashboard by tonight.",
    first_seen_at: '2026-09-04T10:00:00Z',
    last_seen_at: '2026-09-05T08:45:00Z',
    completed_at: null,
    created_at: '2026-09-04T10:00:00Z',
    updated_at: '2026-09-04T10:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000007',
    meeting_id: 'm1000000-0000-0000-0000-000000000003',
    meeting_title: 'Daily Standup - SLM Fallback & Authentication Blockers',
    title: 'Optimize ONNX runtime SLM inference latency to < 250ms',
    description: 'Quantize weights and cache recurring embeddings to guarantee real-time transcript parsing.',
    owner_employee_id: '44444444-4444-4444-4444-444444444444',
    owner_name: 'Charlie Lee',
    deadline: '2026-09-08T17:00:00Z',
    status: 'pending',
    confidence: 0.88,
    source_text: "Charlie: I need to optimize the ONNX runtime inference to get it under 250ms by September 8th.",
    first_seen_at: '2026-09-04T10:00:00Z',
    last_seen_at: '2026-09-04T10:00:00Z',
    completed_at: null,
    created_at: '2026-09-04T10:00:00Z',
    updated_at: '2026-09-04T10:00:00Z',
    postponement_count: 1,
    match_decision: 'new'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000008',
    meeting_id: 'm1000000-0000-0000-0000-000000000004',
    meeting_title: 'Release Readiness & Accountability Graph Review',
    title: 'Finalize interactive Accountability Graph with zoom & pan controls',
    description: 'Complete signature flow diagram from meeting commitment to verified outcome.',
    owner_employee_id: '33333333-3333-3333-3333-333333333333',
    owner_name: 'Bob Smith',
    deadline: '2026-09-05T14:00:00Z',
    status: 'pending',
    confidence: 0.99,
    source_text: "Bob: The signature graph mapping Meetings to Commitments to Outcomes is interactive and smooth. I'll add the zoom controls by 2 PM today.",
    first_seen_at: '2026-09-05T08:45:00Z',
    last_seen_at: '2026-09-05T08:45:00Z',
    completed_at: null,
    created_at: '2026-09-05T08:45:00Z',
    updated_at: '2026-09-05T08:45:00Z',
    postponement_count: 0,
    match_decision: 'new'
  }
];

export const MOCK_HISTORY: Record<string, ActionItemHistory[]> = {
  'a1000000-0000-0000-0000-000000000001': [
    {
      id: 'h1',
      action_item_id: 'a1000000-0000-0000-0000-000000000001',
      meeting_id: 'm1000000-0000-0000-0000-000000000001',
      meeting_title: 'Sprint 14 Architecture Kickoff',
      event_type: 'created',
      new_value: { status: 'pending', deadline: '2026-09-06T17:00:00Z', owner: 'Alice Johnson' },
      evidence_text: "Alice: I'll have the schema migration SQL and HNSW index deployed by September 6th 5 PM.",
      created_at: '2026-09-02T10:30:00Z'
    },
    {
      id: 'h2',
      action_item_id: 'a1000000-0000-0000-0000-000000000001',
      meeting_id: 'm1000000-0000-0000-0000-000000000003',
      meeting_title: 'Daily Standup',
      event_type: 'completed',
      previous_value: { status: 'pending' },
      new_value: { status: 'done' },
      evidence_text: "Alice: The pgvector HNSW index is completed and verified against sample embeddings.",
      created_at: '2026-09-04T10:00:00Z'
    }
  ],
  'a1000000-0000-0000-0000-000000000002': [
    {
      id: 'h3',
      action_item_id: 'a1000000-0000-0000-0000-000000000002',
      meeting_id: 'm1000000-0000-0000-0000-000000000001',
      meeting_title: 'Sprint 14 Architecture Kickoff',
      event_type: 'created',
      new_value: { status: 'pending', deadline: '2026-09-04T17:00:00Z', owner: 'Bob Smith' },
      evidence_text: "Bob: I will resolve the auth token refresh bug by September 4th.",
      created_at: '2026-09-02T10:30:00Z'
    },
    {
      id: 'h4',
      action_item_id: 'a1000000-0000-0000-0000-000000000002',
      meeting_id: 'm1000000-0000-0000-0000-000000000003',
      meeting_title: 'Daily Standup',
      event_type: 'deadline_changed',
      previous_value: { deadline: '2026-09-04T17:00:00Z' },
      new_value: { deadline: '2026-09-07T18:00:00Z' },
      evidence_text: "Bob: I need to postpone resolving the auth token refresh bug to September 7th.",
      created_at: '2026-09-04T10:00:00Z'
    },
    {
      id: 'h5',
      action_item_id: 'a1000000-0000-0000-0000-000000000002',
      meeting_id: 'm1000000-0000-0000-0000-000000000003',
      meeting_title: 'Daily Standup',
      event_type: 'postponed',
      previous_value: { postponement_count: 1 },
      new_value: { postponement_count: 2 },
      evidence_text: "Jyothsna: Okay, this is the second time it's slipping. Please prioritize it.",
      created_at: '2026-09-04T10:00:00Z'
    }
  ]
};

export const MOCK_AI_RUNS: AIRunTelemetry[] = [
  {
    id: 'r1',
    meeting_id: 'm1000000-0000-0000-0000-000000000001',
    model_name: 'loopkeeper-slm-v1',
    model_version: '1.2.0',
    provider: 'slm',
    confidence: 0.94,
    latency_ms: 184,
    success: true,
    fallback_used: false,
    created_at: '2026-09-02T10:30:15Z'
  },
  {
    id: 'r2',
    meeting_id: 'm1000000-0000-0000-0000-000000000002',
    model_name: 'loopkeeper-slm-v1',
    model_version: '1.2.0',
    provider: 'slm',
    confidence: 0.91,
    latency_ms: 198,
    success: true,
    fallback_used: false,
    created_at: '2026-09-03T15:15:20Z'
  },
  {
    id: 'r3',
    meeting_id: 'm1000000-0000-0000-0000-000000000003',
    model_name: 'gemini-1.5-flash',
    model_version: 'fallback-v1',
    provider: 'fallback_llm',
    confidence: 0.96,
    latency_ms: 412,
    success: true,
    fallback_used: true,
    created_at: '2026-09-04T10:00:30Z'
  }
];

export const SAMPLE_TRANSCRIPTS = [
  {
    title: 'Sprint Planning & Feature Ownership',
    date: '2026-09-05T11:00:00Z',
    content: `[00:01:00] Jyothsna: Welcome everyone. Let's assign key deliverables for the next sprint.
[00:01:25] Alice: I will build the FastAPI REST router for export reporting by Saturday 6 PM.
[00:02:10] Bob: I'll complete the interactive graph node animations and zoom controls by tomorrow afternoon.
[00:03:00] Charlie: I will benchmark SLM extraction vs Fallback LLM across 50 simulated transcripts by Sept 6th at 8 PM.
[00:03:45] Diana: I will create 10 automated test suites verifying state machine transitions by Sept 7th.`
  },
  {
    title: 'Emergency Incident: pgvector Cosine Distance Discrepancy',
    date: '2026-09-05T15:00:00Z',
    content: `[00:00:30] Jyothsna: Emergency sync. We noticed slight drift in cosine distance thresholding for ambiguous task titles.
[00:01:10] Charlie: I noticed that short titles under 4 words need a title-word overlap heuristic boost. I will deploy the hybrid HNSW + token overlap ranker by 7 PM today.
[00:02:00] Alice: I will verify the PostgreSQL connection pooling parameters to prevent timeout spikes by 8 PM.`
  },
  {
    title: 'Payment Integration & API Continuity Sync',
    date: '2026-09-05T16:30:00Z',
    content: `[00:00:45] Jyothsna: Let's check in on the core platform components. Priya, what is the status of the payment API?
[00:01:10] Priya: Priya will complete the payment API by Friday.
[00:02:00] Alice: Backend webhook handlers for payment notifications are in place.`
  }
];
