# LoopKeeper Master Backend & Data Architecture

## Executive Overview
**LoopKeeper** is an AI-powered Meeting Accountability Engine engineered to process unstructured meeting transcripts and recordings, extract actionable task commitments, track task continuity across consecutive meetings, detect repeated postponements, identify team overload, and detect execution drift against external systems (e.g. Jira).

This document serves as the authoritative backend specification for production deployments, API contracts, AI inference pipelines, platform connectors, database models, and deployment readiness.

---

## 1. System Architecture Map

```
┌─────────────────────────┐          ┌─────────────────────────┐
│     React Web Client    │          │   Flutter Mobile Client │
└────────────┬────────────┘          └────────────┬────────────┘
             │                                    │
             └──────────────────┬─────────────────┘
                                │ REST API (/api/v1)
                                ▼
         ┌───────────────────────────────────────────────┐
         │         FastAPI Backend Application           │
         │   (App, Routers, Middlewares, Auth Service)   │
         └───────┬──────────────┬──────────────┬─────────┘
                 │              │              │
                 ▼              ▼              ▼
     ┌──────────────────┐ ┌──────────┐ ┌───────────────┐
     │   AI Pipeline    │ │ Services │ │  Connectors   │
     │  - SLM Engine    │ │ - Auth   │ │ - Google Meet │
     │  - Gemini LLM    │ │ - State  │ │ - MS Teams    │
     │  - Matching      │ │ - Drift  │ │ - Zoom        │
     │  - Training      │ │ - Record │ │ - Jira        │
     └─────────┬────────┘ └────┬─────┘ └───────┬───────┘
               │               │               │
               └───────────────┼───────────────┘
                               ▼
        ┌──────────────────────────────────────────────┐
        │        Supabase PostgreSQL Database          │
        │   - Read-Only VALIXIS: employees, tasks      │
        │   - LoopKeeper: meetings, action_items,      │
        │     history, matches, ai_runs, recordings    │
        │   - pgvector HNSW 1536-dim embeddings        │
        └──────────────────────────────────────────────┘
```

---

## 2. Supabase PostgreSQL Database Foundation

LoopKeeper connects directly to the authorized VALIXIS Supabase PostgreSQL database using SQLAlchemy connection pooling (`pool_size=10`, `max_overflow=20`).

### 2.1 Schema Boundaries
- **VALIXIS Schema (`public.employees`, `public.tasks`)**: Treated as **100% Read-Only**. LoopKeeper resolves employee assignees and task categories without modifying core VALIXIS records.
- **LoopKeeper Persistent Tables**:
  1. `loopkeeper_meetings`: Meeting metadata and calendar source references.
  2. `loopkeeper_transcripts`: Raw transcript content and formatting.
  3. `loopkeeper_action_items`: Commitment records, status, deadlines, and vector embeddings.
  4. `loopkeeper_action_item_history`: Audit trail for state transitions (`created`, `updated`, `deadline_changed`, `owner_changed`, `status_changed`, `postponed`, `completed`).
  5. `loopkeeper_task_matches`: AI deduplication decisions and cosine similarity scores.
  6. `loopkeeper_ai_runs`: Telemetry logs storing provider, model name, confidence, and latency.
  7. `loopkeeper_meeting_participants`: Junction table linking employees to meetings.
  8. `loopkeeper_recordings`: Audio/video meeting recording file metadata and transcription status.
  9. `loopkeeper_integrations`: Provider connection states (`google_meet`, `ms_teams`, `zoom`, `jira`).
  10. `loopkeeper_jira_links`: Permanent mapping between commitments and Jira issue keys.
  11. `loopkeeper_execution_drift`: Recorded execution discrepancies between meeting statements and Jira statuses.

---

## 3. Comprehensive REST API Contract

Base Path: `/api/v1`

| Endpoint Path | Method | Purpose | Response Schema |
| :--- | :--- | :--- | :--- |
| `/health` | GET | Operational health check & readiness. | `{"status": "ok", "service": "LoopKeeper API", "ai_pipeline": "ready"}` |
| `/auth/login` | POST | Authenticate user via Supabase Auth. | `AuthResponse` (`access_token`, `user`) |
| `/auth/me` | GET | Retrieve authenticated user profile. | User profile JSON |
| `/users` | GET | List employees from VALIXIS schema. | `List[User]` |
| `/meetings` | POST / GET | Create meeting or list meetings. | `MeetingResponse` / `List[MeetingResponse]` |
| `/meetings/{id}` | GET | Retrieve detailed meeting view. | `MeetingDetailResponse` |
| `/meetings/{id}/transcript` | POST | Attach raw transcript text. | `TranscriptResponse` |
| `/meetings/{id}/process` | POST | Trigger AI extraction & task matching. | `List[ActionItemResponse]` |
| `/action-items` or `/commitments` | GET | Query action items with filters. | `List[ActionItemResponse]` |
| `/action-items/{id}` | GET / PATCH | View lifecycle history or update task. | `ActionItemDetailResponse` / `ActionItemResponse` |
| `/accountability/insights` | GET | System-wide workload & risk metrics. | `DashboardOverviewResponse` |
| `/accountability/execution-drift/{id}` | GET | Analyze meeting vs Jira drift. | Execution drift analysis object |
| `/integrations` | GET | Status of platform connectors. | List of provider status objects |
| `/jira/issue` | POST | Link commitment to new Jira issue. | Jira issue link record |
| `/recordings/start` | POST | Initialize native recording session. | Recording session object |
| `/recordings/upload` | POST | Upload audio recording file. | Upload metadata object |
| `/recordings/{id}/transcribe` | POST | Generate transcript from recording. | Transcript object |

---

## 4. Honest AI Pipeline & Architecture

### 4.1 AI Engine Specification
- **SLM Model Architecture (`loopkeeper-slm-v1`)**:
  - `MultiTaskSLMClassifier`: Custom lightweight multi-task linear/logistic classifier trained on term frequency token vectors.
  - Produces dual outputs: Commitment Probability $P(\text{commit})$ and Task Status distribution over `[pending, done, overdue, cancelled]`.
  - **No False Claims**: The SLM is explicitly a multi-task linear/logistic classifier, NOT a transformer model. Accuracy metrics reflect empirical evaluation (`ml/evaluation/results.json`).
- **Confidence Evaluation & Thresholding**:
  - Dynamic score calculated based on structural completeness, owner assignment, deadline specificity, and model probability.
  - If confidence $< 0.750$, `FallbackHandler` automatically routes input to `FallbackLLMProvider` (`gemini-1.5-flash`).
- **Vector Embeddings & Task Matching (`TaskMatchingEngine`)**:
  - Fixed **1536-dimensional** vector embeddings (`text-embedding-004` or heuristic dense fallback).
  - Cosine similarity matching combined with keyword overlap and owner alignment heuristics.
  - Match Decisions: `MATCHED` ($\ge 0.820$), `UNCERTAIN` ($0.550 - 0.819$), `NEW` ($< 0.550$).

---

## 5. Controlled AI Data & Training Pipeline

```
Application Meeting Transcripts
               │
               ▼
1. Data Selection & Privacy Audit (Strip PII & credentials)
               │
               ▼
2. Commitment & Status Data Labeling
               │
               ▼
3. Controlled Dataset Split (`train.json` / `val.json`)
               │
               ▼
4. SLMTrainer Execution (`ml/training/train.py`)
               │
               ▼
5. Empirical Evaluation (`ml/evaluation/evaluate.py`)
               │
               ▼
6. Model Weights Artifact Saved (`ml/models/slm_weights.json`)
```

---

## 6. Meeting Platform Connector Architecture

LoopKeeper implements a `MeetingProvider` abstract connector layer with honest connection status reporting:

1. **`GoogleMeetProvider`**: Uses Google OAuth client and Drive API to list and ingest `.vtt`/`.txt` transcripts. Returns `is_connected: true` when `GOOGLE_CLIENT_ID` is present.
2. **`MicrosoftTeamsProvider`**: Wraps Microsoft Graph API credentials. Returns `"Not connected. Microsoft Graph API client credentials not configured."` when credentials are missing.
3. **`ZoomProvider`**: Wraps Zoom Server-to-Server OAuth credentials. Returns `"Not connected. Zoom Server-to-Server OAuth credentials not configured."` when credentials are missing.

---

## 7. Execution Drift Engine

Our core differentiator compares statements made during meetings against external execution evidence (e.g. Atlassian Jira Cloud or GitHub PRs).

### Drift Classification States:
- **`aligned`**: Meeting statement claims task is completed, and linked Jira issue status is `Done`.
- **`execution_drift`**: Meeting statement claims task is completed ("Payment API is finished"), but linked Jira issue status remains `In Progress` or `To Do`.
- **`execution_evidence_present`**: Task is pending, but linked Jira issue is actively `In Progress`.
- **`insufficient_evidence`**: No linked external system issue found to compare meeting statement against.

---

## 8. Deployment & Environment Configuration

### Required Environment Variables
```env
# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
SUPABASE_URL=https://qbvlzhjnqrwsoyvpomyt.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Providers
GEMINI_API_KEY=your_gemini_api_key

# External Platform Connectors (Optional / Honest Status)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MS_TEAMS_CLIENT_ID=
ZOOM_CLIENT_ID=
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@domain.com
JIRA_API_TOKEN=your_jira_api_token
```

### Server Launch Command
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
