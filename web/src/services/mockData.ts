import type { Employee, Meeting, ActionItem, ActionItemHistory, AIRunTelemetry } from '../types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee',
    name: 'Subhash',
    email: 'nagasubhash55@gmail.com',
    role: 'Engineering Manager & Core Lead',
    department: 'Engineering',
    is_manager: true
  },
  {
    id: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
    name: 'VALIXIS',
    email: 'official.valixis@gmail.com',
    role: 'Founder & Technical Director',
    department: 'Executive',
    is_manager: true
  },
  {
    id: '5af2f8a8-a881-408a-8fdd-1fee384f1779',
    name: 'Vignesh',
    email: 'vignesh@valixis.com',
    role: 'Systems & App Developer',
    department: 'Core Engineering',
    is_manager: false
  },
  {
    id: '43e5d5fc-fc54-49bb-8faa-79018cf49348',
    name: 'Jyothsna',
    email: 'jyothsna@valixis.com',
    role: 'Product & Architecture Lead',
    department: 'Engineering',
    is_manager: false
  },
  {
    id: '39244951-87a5-44e6-801a-28cb3b1a0ed5',
    name: 'Hasitha',
    email: 'hasitha@valixis.com',
    role: 'QA & App Testing Lead',
    department: 'QA & Compliance',
    is_manager: false
  },
  {
    id: '8a18fff4-6236-4d54-a29a-eeb3c65dd646',
    name: 'Krishna',
    email: 'krishna@valixis.com',
    role: 'Ad Implementation & Backend Engineer',
    department: 'Monetization & Analytics',
    is_manager: false
  },
  {
    id: '7b98a000-0000-0000-0000-000000000007',
    name: 'Adithya',
    email: 'adithya@valixis.com',
    role: 'Database & Vector Search Engineer',
    department: 'Backend & Infrastructure',
    is_manager: false
  },
  {
    id: '7b98a000-0000-0000-0000-000000000008',
    name: 'Vaseem',
    email: 'vaseem@valixis.com',
    role: 'UI & Frontend Graph Developer',
    department: 'Frontend Engineering',
    is_manager: false
  }
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm-real-2026-08-23',
    title: 'Work Report - Gemini AI Models & Operational Workflows',
    meeting_date: '2026-08-23T20:00:00Z',
    source: 'transcript',
    external_source_id: 'meet-workreport-0823',
    created_by: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
    created_at: '2026-08-23T20:45:00Z',
    updated_at: '2026-08-23T20:45:00Z',
    action_item_count: 5,
    participants: [MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[1], MOCK_EMPLOYEES[2], MOCK_EMPLOYEES[3], MOCK_EMPLOYEES[4], MOCK_EMPLOYEES[5]]
  },
  {
    id: 'm-real-2026-08-26',
    title: 'Work Report - Resume App, Firebase Auth & Release Timeline',
    meeting_date: '2026-08-26T20:00:00Z',
    source: 'transcript',
    external_source_id: 'meet-workreport-0826',
    created_by: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
    created_at: '2026-08-26T20:45:00Z',
    updated_at: '2026-08-26T20:45:00Z',
    action_item_count: 4,
    participants: [MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[1], MOCK_EMPLOYEES[2], MOCK_EMPLOYEES[3], MOCK_EMPLOYEES[4]]
  },
  {
    id: 'm-real-2026-08-30',
    title: 'Work Report - Technical Workflow Reset & 6:30 PM PR Mandate',
    meeting_date: '2026-08-30T18:30:00Z',
    source: 'transcript',
    external_source_id: 'meet-workreport-0830',
    created_by: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
    created_at: '2026-08-30T19:00:00Z',
    updated_at: '2026-08-30T19:00:00Z',
    action_item_count: 3,
    participants: [MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[1], MOCK_EMPLOYEES[2], MOCK_EMPLOYEES[5]]
  },
  {
    id: 'm-real-2026-09-02',
    title: 'Sprint 14 Architecture Kickoff & HNSW Indexing Sync',
    meeting_date: '2026-09-02T10:00:00Z',
    source: 'transcript',
    external_source_id: 'meet-sprint14-0902',
    created_by: '43e5d5fc-fc54-49bb-8faa-79018cf49348',
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-02T10:30:00Z',
    action_item_count: 2,
    participants: [MOCK_EMPLOYEES[6], MOCK_EMPLOYEES[0], MOCK_EMPLOYEES[3], MOCK_EMPLOYEES[7]]
  },
  {
    id: 'm-real-2026-09-04',
    title: 'AI Model Benchmarking & Fallback Telemetry Sync',
    meeting_date: '2026-09-04T14:30:00Z',
    source: 'transcript',
    external_source_id: 'meet-telemetry-0904',
    created_by: '8a18fff4-6236-4d54-a29a-eeb3c65dd646',
    created_at: '2026-09-04T15:00:00Z',
    updated_at: '2026-09-04T15:00:00Z',
    action_item_count: 1,
    participants: [MOCK_EMPLOYEES[5], MOCK_EMPLOYEES[1], MOCK_EMPLOYEES[4], MOCK_EMPLOYEES[0]]
  },
  {
    id: 'm-real-2026-09-05',
    title: 'Payment Gateway & Ad Monetization Readiness Review',
    meeting_date: '2026-09-05T16:00:00Z',
    source: 'transcript',
    external_source_id: 'meet-monetization-0905',
    created_by: '39244951-87a5-44e6-801a-28cb3b1a0ed5',
    created_at: '2026-09-05T16:30:00Z',
    updated_at: '2026-09-05T16:30:00Z',
    action_item_count: 1,
    participants: [MOCK_EMPLOYEES[4], MOCK_EMPLOYEES[5], MOCK_EMPLOYEES[2], MOCK_EMPLOYEES[0]]
  }
];

export const MOCK_TRANSCRIPTS: Record<string, string> = {
  'm-real-2026-08-23': `[00:00:45] VALIXIS: Welcome team. Let's review last week's work and plan for the upcoming week. Great job moving to ChatGPT prompt generation independently. Work submission deadline is strictly 10:00 PM or 10:30 PM max.
[00:02:58] VALIXIS: Everyone must download and continuously test our application. Hasitha and team will run 3-day and 2-day structured testing to catch dark mode issues before Play Store builds.
[00:06:03] VALIXIS: I will complete the transition to Google Gemini AI models tonight (100-million token capacity for PDF split/merge and image processing) so testing can begin tomorrow.
[00:08:38] Vignesh: I propose we pursue dual application development simultaneously since operational capacity is ready. We will clone master branch repository structures.
[00:14:01] VALIXIS: Client project lifecycle will be 5 phases (UI, UX, Backend, Login, Home). Development starts only after initial client payment.
[00:18:34] VALIXIS: Core team members will be designated as Managing Directors and board members with 10% equity profit share once formal registration is complete.`,

  'm-real-2026-08-26': `[00:09:23] VALIXIS: The new web resume application includes interactive AI chat, PDF splitting/compression, and free automatic ATS scoring for users using Gemini models.
[00:14:29] VALIXIS: User login is configured via Firebase Google authentication. Subhash and Vignesh, upload pull request URLs to the portal starting tomorrow.
[00:18:49] VALIXIS: Team members are allowed to work ahead if pull requests remain clean. Master branch cloning and ChatGPT prompt workflows must be followed strictly.
[00:22:17] VALIXIS: Two applications including the fitness platform will launch within 14 days with notifications and ad monetization.
[00:27:50] Hasitha: Final testing of the application build will be completed by Saturday before proceeding.`,

  'm-real-2026-08-30': `[00:02:27] VALIXIS: Recent PR submissions contained URL handling and merge conflict errors. We reset invalid contributions. Subhash, ensure all code is verified for functionality before submission.
[00:13:18] VALIXIS: The team must take full ownership of code merging, application creation, and Play Store publishing while I focus on client acquisition.
[00:24:03] VALIXIS: Mandated daily 6:30 PM deadline for all pull request submissions to ensure synchronization and prevent merge conflicts.
[00:30:00] Krishna: Clarified daily task progression from Day 3 to Day 7. Directory structures will follow established master workflows.`,

  'm-real-2026-09-02': `[00:01:00] Jyothsna: Welcome team. Let's assign core technical deliverables for Sprint 14.
[00:01:25] Adithya: I will deploy the PostgreSQL schema migration and HNSW vector index by September 6th 5 PM.
[00:02:10] Vaseem: I will complete the interactive graph node animations and zoom controls by tomorrow afternoon.
[00:03:00] Subhash: Ensure all database changes pass zero-downtime migration scripts before staging deployment.`,

  'm-real-2026-09-04': `[00:00:30] VALIXIS: Today's sync focuses on AI extraction accuracy across our SLM and Fallback LLM pipelines.
[00:01:10] Krishna: I will benchmark SLM extraction vs Fallback LLM across 50 simulated transcripts by Sept 7th at 8 PM.
[00:02:00] Hasitha: QA test cases will cover edge cases for missing timestamp metadata in audio ingestion.`,

  'm-real-2026-09-05': `[00:00:45] Subhash: Let's review the monetization pipeline and payment webhook integration.
[00:01:10] Hasitha: Hasitha will complete the payment API verification and webhook validation by Friday Sept 8th.
[00:02:00] Vignesh: AdMob unit IDs and banner placement components are already integrated in master.`
};

export const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'a-real-001',
    meeting_id: 'm-real-2026-08-23',
    meeting_title: 'Work Report - Gemini AI Models & Operational Workflows',
    title: 'Transition AI Infrastructure to Google Gemini Models (100M Token Capacity)',
    description: 'Implement Google Gemini model integration to optimize application performance, token capacity, and image/PDF operations.',
    owner_employee_id: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
    owner_name: 'VALIXIS',
    deadline: '2026-08-24T05:00:00Z',
    status: 'done',
    confidence: 0.98,
    source_text: "VALIXIS: I will complete the transition to Google Gemini AI models tonight so testing can begin tomorrow.",
    first_seen_at: '2026-08-23T20:45:00Z',
    last_seen_at: '2026-08-24T10:00:00Z',
    completed_at: '2026-08-24T10:00:00Z',
    created_at: '2026-08-23T20:45:00Z',
    updated_at: '2026-08-24T10:00:00Z',
    postponement_count: 0,
    match_decision: 'new',
    match_reason: 'Core Gemini AI infrastructure transition.'
  },
  {
    id: 'a-real-002',
    meeting_id: 'm-real-2026-08-23',
    meeting_title: 'Work Report - Gemini AI Models & Operational Workflows',
    title: 'Mandated Daily Work Submission Deadline (10:00 PM / 10:30 PM Max)',
    description: 'Strict daily work submission protocol to prevent delayed processing.',
    owner_employee_id: '9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee',
    owner_name: 'Subhash',
    deadline: '2026-08-24T22:00:00Z',
    status: 'done',
    confidence: 0.97,
    source_text: "VALIXIS: Work submission deadline is strictly 10:00 PM or 10:30 PM max.",
    first_seen_at: '2026-08-23T20:45:00Z',
    last_seen_at: '2026-08-24T22:00:00Z',
    completed_at: '2026-08-24T22:00:00Z',
    created_at: '2026-08-23T20:45:00Z',
    updated_at: '2026-08-24T22:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-003',
    meeting_id: 'm-real-2026-08-23',
    meeting_title: 'Work Report - Gemini AI Models & Operational Workflows',
    title: 'Dual Application Development & Master Branch Clone Protocol',
    description: 'Pursue simultaneous dual application development cloning master branch repository structure.',
    owner_employee_id: '5af2f8a8-a881-408a-8fdd-1fee384f1779',
    owner_name: 'Vignesh',
    deadline: '2026-08-25T18:00:00Z',
    status: 'done',
    confidence: 0.95,
    source_text: "Vignesh: I propose we pursue dual application development simultaneously. We will clone master branch repository structures.",
    first_seen_at: '2026-08-23T20:45:00Z',
    last_seen_at: '2026-08-26T20:00:00Z',
    completed_at: '2026-08-25T18:00:00Z',
    created_at: '2026-08-23T20:45:00Z',
    updated_at: '2026-08-25T18:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-004',
    meeting_id: 'm-real-2026-08-26',
    meeting_title: 'Work Report - Resume App, Firebase Auth & Release Timeline',
    title: 'Deploy Resume Builder Free ATS Scoring & PDF Compression',
    description: 'Free ATS score generator and PDF splitting/compression using Gemini models.',
    owner_employee_id: '43e5d5fc-fc54-49bb-8faa-79018cf49349',
    owner_name: 'VALIXIS',
    deadline: '2026-08-28T18:00:00Z',
    status: 'done',
    confidence: 0.96,
    source_text: "VALIXIS: The new web resume application includes interactive AI chat, PDF splitting/compression, and free automatic ATS scoring.",
    first_seen_at: '2026-08-26T20:00:00Z',
    last_seen_at: '2026-08-28T18:00:00Z',
    completed_at: '2026-08-28T18:00:00Z',
    created_at: '2026-08-26T20:00:00Z',
    updated_at: '2026-08-28T18:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-005',
    meeting_id: 'm-real-2026-08-26',
    meeting_title: 'Work Report - Resume App, Firebase Auth & Release Timeline',
    title: 'Configure Firebase Google Auth & Portal PR Tracking',
    description: 'Firebase Google login integration and pull request link upload portal tracking.',
    owner_employee_id: '9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee',
    owner_name: 'Subhash',
    deadline: '2026-08-28T18:00:00Z',
    status: 'done',
    confidence: 0.94,
    source_text: "VALIXIS: User login is configured via Firebase Google authentication. Subhash and Vignesh, upload pull request URLs to the portal.",
    first_seen_at: '2026-08-26T20:00:00Z',
    last_seen_at: '2026-08-28T18:00:00Z',
    completed_at: '2026-08-28T18:00:00Z',
    created_at: '2026-08-26T20:00:00Z',
    updated_at: '2026-08-28T18:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-006',
    meeting_id: 'm-real-2026-08-26',
    meeting_title: 'Work Report - Resume App, Firebase Auth & Release Timeline',
    title: 'Conduct Full Application Build Testing & Dark Mode Quality Check',
    description: 'Comprehensive application build testing across team devices to catch dark mode bugs before Play Store release.',
    owner_employee_id: '39244951-87a5-44e6-801a-28cb3b1a0ed5',
    owner_name: 'Hasitha',
    deadline: '2026-09-05T18:00:00Z',
    status: 'overdue',
    confidence: 0.93,
    source_text: "Hasitha: Final testing of the application build will be completed by Saturday before proceeding.",
    first_seen_at: '2026-08-23T20:45:00Z',
    last_seen_at: '2026-08-30T18:30:00Z',
    completed_at: null,
    created_at: '2026-08-23T20:45:00Z',
    updated_at: '2026-08-30T18:30:00Z',
    postponement_count: 1,
    match_decision: 'matched',
    match_reason: 'Postponed 1x from Aug 29 to Sep 5 due to dark mode stability fixes.'
  },
  {
    id: 'a-real-007',
    meeting_id: 'm-real-2026-08-30',
    meeting_title: 'Work Report - Technical Workflow Reset & 6:30 PM PR Mandate',
    title: 'Strict Daily 6:30 PM PR Submission Mandate & Conflict Resolution',
    description: 'Mandated daily 6:30 PM pull request submission protocol to prevent merge conflicts.',
    owner_employee_id: '9e1060b0-3f08-4fe3-bbb9-0f7a68b13bee',
    owner_name: 'Subhash',
    deadline: '2026-09-06T18:30:00Z',
    status: 'pending',
    confidence: 0.97,
    source_text: "VALIXIS: Mandated daily 6:30 PM deadline for all pull request submissions to ensure synchronization and prevent merge conflicts.",
    first_seen_at: '2026-08-30T18:30:00Z',
    last_seen_at: '2026-09-05T20:00:00Z',
    completed_at: null,
    created_at: '2026-08-30T18:30:00Z',
    updated_at: '2026-09-05T20:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-008',
    meeting_id: 'm-real-2026-08-30',
    meeting_title: 'Work Report - Technical Workflow Reset & 6:30 PM PR Mandate',
    title: 'Independent Play Store Publishing & Quality Assurance Lifecycle',
    description: 'Team ownership of code merging, application creation, and Play Store publishing.',
    owner_employee_id: '5af2f8a8-a881-408a-8fdd-1fee384f1779',
    owner_name: 'Vignesh',
    deadline: '2026-09-10T18:00:00Z',
    status: 'pending',
    confidence: 0.95,
    source_text: "VALIXIS: The team must take full ownership of code merging, application creation, and Play Store publishing.",
    first_seen_at: '2026-08-30T18:30:00Z',
    last_seen_at: '2026-08-30T18:30:00Z',
    completed_at: null,
    created_at: '2026-08-30T18:30:00Z',
    updated_at: '2026-08-30T18:30:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-009',
    meeting_id: 'm-real-2026-09-02',
    meeting_title: 'Sprint 14 Architecture Kickoff & HNSW Indexing Sync',
    title: 'Deploy PostgreSQL Schema Migration & pgvector HNSW Index',
    description: 'Execute vector index migration for fast similarity search across 1536-dim embeddings.',
    owner_employee_id: '7b98a000-0000-0000-0000-000000000007',
    owner_name: 'Adithya',
    deadline: '2026-09-06T17:00:00Z',
    status: 'pending',
    confidence: 0.96,
    source_text: "Adithya: I will deploy the PostgreSQL schema migration and HNSW vector index by September 6th 5 PM.",
    first_seen_at: '2026-09-02T10:30:00Z',
    last_seen_at: '2026-09-05T20:00:00Z',
    completed_at: null,
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-05T20:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-010',
    meeting_id: 'm-real-2026-09-02',
    meeting_title: 'Sprint 14 Architecture Kickoff & HNSW Indexing Sync',
    title: 'Build Interactive Graph Node Animations & Zoom Controls',
    description: 'Implement canvas rendering optimizations and node layout animations in graph view.',
    owner_employee_id: '7b98a000-0000-0000-0000-000000000008',
    owner_name: 'Vaseem',
    deadline: '2026-09-05T17:00:00Z',
    status: 'pending',
    confidence: 0.94,
    source_text: "Vaseem: I will complete the interactive graph node animations and zoom controls by tomorrow afternoon.",
    first_seen_at: '2026-09-02T10:30:00Z',
    last_seen_at: '2026-09-05T20:00:00Z',
    completed_at: null,
    created_at: '2026-09-02T10:30:00Z',
    updated_at: '2026-09-05T20:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-011',
    meeting_id: 'm-real-2026-09-04',
    meeting_title: 'AI Model Benchmarking & Fallback Telemetry Sync',
    title: 'Benchmark SLM vs Fallback LLM Extraction Across 50 Transcripts',
    description: 'Evaluate confidence scoring and latency tradeoffs between local SLM and fallback models.',
    owner_employee_id: '8a18fff4-6236-4d54-a29a-eeb3c65dd646',
    owner_name: 'Krishna',
    deadline: '2026-09-07T20:00:00Z',
    status: 'pending',
    confidence: 0.95,
    source_text: "Krishna: I will benchmark SLM extraction vs Fallback LLM across 50 simulated transcripts by Sept 7th at 8 PM.",
    first_seen_at: '2026-09-04T15:00:00Z',
    last_seen_at: '2026-09-05T20:00:00Z',
    completed_at: null,
    created_at: '2026-09-04T15:00:00Z',
    updated_at: '2026-09-05T20:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  },
  {
    id: 'a-real-012',
    meeting_id: 'm-real-2026-09-05',
    meeting_title: 'Payment Gateway & Ad Monetization Readiness Review',
    title: 'Complete Payment API Verification & Webhook Validation',
    description: 'Verify payment gateway callback triggers and automated receipt generation.',
    owner_employee_id: '39244951-87a5-44e6-801a-28cb3b1a0ed5',
    owner_name: 'Hasitha',
    deadline: '2026-09-08T18:00:00Z',
    status: 'pending',
    confidence: 0.93,
    source_text: "Hasitha: Hasitha will complete the payment API verification and webhook validation by Friday Sept 8th.",
    first_seen_at: '2026-09-05T16:30:00Z',
    last_seen_at: '2026-09-05T20:00:00Z',
    completed_at: null,
    created_at: '2026-09-05T16:30:00Z',
    updated_at: '2026-09-05T20:00:00Z',
    postponement_count: 0,
    match_decision: 'new'
  }
];

export const MOCK_HISTORY: Record<string, ActionItemHistory[]> = {
  'a-real-006': [
    {
      id: 'hr-1',
      action_item_id: 'a-real-006',
      meeting_id: 'm-real-2026-08-23',
      meeting_title: 'Work Report - Gemini AI Models & Operational Workflows',
      event_type: 'created',
      new_value: { status: 'pending', deadline: '2026-08-29T18:00:00Z', owner: 'Hasitha' },
      evidence_text: "VALIXIS: Hasitha and team will run structured testing to catch dark mode issues before Play Store builds.",
      created_at: '2026-08-23T20:45:00Z'
    },
    {
      id: 'hr-2',
      action_item_id: 'a-real-006',
      meeting_id: 'm-real-2026-08-26',
      meeting_title: 'Work Report - Resume App & Firebase Auth',
      event_type: 'deadline_changed',
      previous_value: { deadline: '2026-08-29T18:00:00Z' },
      new_value: { deadline: '2026-09-05T18:00:00Z' },
      evidence_text: "Hasitha: Final testing of the application build will be completed by Saturday before proceeding.",
      created_at: '2026-08-26T20:00:00Z'
    }
  ]
};

export const MOCK_AI_RUNS: AIRunTelemetry[] = [
  {
    id: 'rr-1',
    meeting_id: 'm-real-2026-08-23',
    model_name: 'gemini-1.5-flash',
    model_version: '2.0.0',
    provider: 'fallback_llm',
    confidence: 0.98,
    latency_ms: 210,
    success: true,
    fallback_used: false,
    created_at: '2026-08-23T20:45:15Z'
  },
  {
    id: 'rr-2',
    meeting_id: 'm-real-2026-08-26',
    model_name: 'gemini-1.5-flash',
    model_version: '2.0.0',
    provider: 'fallback_llm',
    confidence: 0.96,
    latency_ms: 195,
    success: true,
    fallback_used: false,
    created_at: '2026-08-26T20:45:20Z'
  },
  {
    id: 'rr-3',
    meeting_id: 'm-real-2026-08-30',
    model_name: 'gemini-1.5-flash',
    model_version: '2.0.0',
    provider: 'fallback_llm',
    confidence: 0.97,
    latency_ms: 205,
    success: true,
    fallback_used: false,
    created_at: '2026-08-30T19:00:30Z'
  },
  {
    id: 'rr-4',
    meeting_id: 'm-real-2026-09-02',
    model_name: 'loopkeeper-slm-v1',
    model_version: '1.2.0',
    provider: 'slm',
    confidence: 0.95,
    latency_ms: 180,
    success: true,
    fallback_used: false,
    created_at: '2026-09-02T10:30:15Z'
  },
  {
    id: 'rr-5',
    meeting_id: 'm-real-2026-09-04',
    model_name: 'gemini-1.5-flash',
    model_version: '2.0.0',
    provider: 'fallback_llm',
    confidence: 0.95,
    latency_ms: 215,
    success: true,
    fallback_used: true,
    created_at: '2026-09-04T15:00:20Z'
  },
  {
    id: 'rr-6',
    meeting_id: 'm-real-2026-09-05',
    model_name: 'loopkeeper-slm-v1',
    model_version: '1.2.0',
    provider: 'slm',
    confidence: 0.94,
    latency_ms: 190,
    success: true,
    fallback_used: false,
    created_at: '2026-09-05T16:30:15Z'
  }
];

export const SAMPLE_TRANSCRIPTS = [
  {
    title: 'Work Report - Gemini AI Models & Operational Workflows',
    date: '2026-08-23T20:00:00Z',
    content: `[00:00:45] VALIXIS: Welcome team. Work submission deadline is strictly 10:00 PM or 10:30 PM max.
[00:02:58] VALIXIS: Everyone must download and test our application. Hasitha will run testing to catch dark mode issues.
[00:06:03] VALIXIS: I will complete the transition to Google Gemini AI models tonight (100-million token capacity for PDF split/merge).
[00:08:38] Vignesh: I propose we pursue dual application development simultaneously, cloning master branch repository structures.`
  },
  {
    title: 'Work Report - Resume App & Firebase Auth Integration',
    date: '2026-08-26T20:00:00Z',
    content: `[00:09:23] VALIXIS: The new web resume application includes interactive AI chat, PDF splitting/compression, and free automatic ATS scoring using Gemini models.
[00:14:29] VALIXIS: User login is configured via Firebase Google authentication. Subhash and Vignesh, upload pull request URLs to the portal.
[00:22:17] VALIXIS: Two applications including the fitness platform will launch within 14 days with notifications and ad monetization.
[00:27:50] Hasitha: Final testing of the application build will be completed by Saturday before proceeding.`
  },
  {
    title: 'Work Report - Technical Workflow Reset & 6:30 PM PR Mandate',
    date: '2026-08-30T18:30:00Z',
    content: `[00:02:27] VALIXIS: Recent PR submissions contained URL handling errors. Subhash, ensure all code is verified before submission.
[00:13:18] VALIXIS: The team must take full ownership of code merging, application creation, and Play Store publishing.
[00:24:03] VALIXIS: Mandated daily 6:30 PM deadline for all pull request submissions to ensure synchronization and prevent merge conflicts.`
  },
  {
    title: 'Sprint 14 Architecture Kickoff & HNSW Indexing Sync',
    date: '2026-09-02T10:00:00Z',
    content: `[00:01:00] Jyothsna: Welcome team. Let's assign core technical deliverables for Sprint 14.
[00:01:25] Adithya: I will deploy the PostgreSQL schema migration and HNSW vector index by September 6th 5 PM.
[00:02:10] Vaseem: I will complete the interactive graph node animations and zoom controls by tomorrow afternoon.`
  }
];
