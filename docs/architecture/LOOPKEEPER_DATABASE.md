# LoopKeeper Database Architecture & Schema Documentation

## 1. Overview
The LoopKeeper database schema is deployed alongside the existing VALIXIS Portal schema on Supabase PostgreSQL. LoopKeeper introduces 7 specialized tables (prefixed with `loopkeeper_`) to manage meeting transcripts, AI-extracted action items, historical event tracking, semantic vector matching, AI inference runs, and meeting participation.

Existing VALIXIS tables (`employees`, `tasks`, `task_assignments`, `submissions`, `audit_logs`) remain untouched and are treated as **Read-Only** by LoopKeeper.

---

## 2. Schema Specification

### 2.1 `loopkeeper_meetings`
Stores metadata regarding ingested meetings.
- `id` (UUID, PK): Unique meeting identifier.
- `title` (TEXT, NOT NULL): Title of the meeting.
- `meeting_date` (TIMESTAMPTZ, DEFAULT `now()`): Date and time of the meeting.
- `source` (TEXT, DEFAULT `'transcript'`): Meeting source (e.g., transcript upload, Google Meet).
- `external_source_id` (TEXT, NULL): External calendar/meet ID.
- `created_by` (UUID, NULL, FK -> `public.employees(id)`): User who uploaded/created the meeting.
- `created_at` (TIMESTAMPTZ, DEFAULT `now()`)
- `updated_at` (TIMESTAMPTZ, DEFAULT `now()`)

### 2.2 `loopkeeper_transcripts`
Stores raw and formatted meeting transcripts.
- `id` (UUID, PK): Unique transcript identifier.
- `meeting_id` (UUID, FK -> `loopkeeper_meetings(id)` ON DELETE CASCADE): Associated meeting.
- `content` (TEXT, NOT NULL): Ingested transcript text.
- `source_file_name` (TEXT, NULL): Name of uploaded file.
- `transcript_format` (TEXT, NULL): Format identifier (e.g., vtt, txt, json).
- `created_at` (TIMESTAMPTZ, DEFAULT `now()`)

### 2.3 `loopkeeper_action_items`
Core table for tracking meeting action items and semantic embeddings.
- `id` (UUID, PK): Unique action item identifier.
- `meeting_id` (UUID, FK -> `loopkeeper_meetings(id)` ON DELETE CASCADE): Meeting where the task originated.
- `title` (TEXT, NOT NULL): Extracted action item title.
- `description` (TEXT, NULL): Detailed description or context.
- `owner_employee_id` (UUID, NULL, FK -> `public.employees(id)`): Assigned employee.
- `deadline` (TIMESTAMPTZ, NULL): Target completion deadline.
- `status` (TEXT, CHECK IN ('pending', 'done', 'overdue', 'cancelled')): Task status.
- `confidence` (NUMERIC(4,3), DEFAULT 1.000): Extraction confidence score.
- `source_text` (TEXT, NULL): Exact excerpt from transcript.
- `embedding` (VECTOR(1536), NULL): High-dimensional semantic vector embedding.
- `first_seen_at` (TIMESTAMPTZ, DEFAULT `now()`): Initial detection timestamp.
- `last_seen_at` (TIMESTAMPTZ, DEFAULT `now()`): Most recent meeting occurrence.
- `completed_at` (TIMESTAMPTZ, NULL): Completion timestamp.
- `created_at` / `updated_at` (TIMESTAMPTZ)

### 2.4 `loopkeeper_action_item_history`
Audit log tracking state changes across meetings.
- `id` (UUID, PK)
- `action_item_id` (UUID, FK -> `loopkeeper_action_items(id)` ON DELETE CASCADE)
- `meeting_id` (UUID, FK -> `loopkeeper_meetings(id)` ON DELETE CASCADE)
- `event_type` (TEXT, CHECK IN ('created', 'updated', 'deadline_changed', 'owner_changed', 'status_changed', 'postponed', 'completed', 'reopened'))
- `previous_value` (JSONB, NULL): State prior to change.
- `new_value` (JSONB, NULL): State after change.
- `evidence_text` (TEXT, NULL): Transcript snippet justifying change.
- `created_at` (TIMESTAMPTZ)

### 2.5 `loopkeeper_task_matches`
Records AI deduplication and task continuity decisions.
- `id` (UUID, PK)
- `action_item_id` (UUID, FK -> `loopkeeper_action_items(id)` ON DELETE CASCADE)
- `matched_action_item_id` (UUID, NULL, FK -> `loopkeeper_action_items(id)` ON DELETE SET NULL)
- `matched_valixis_task_id` (UUID, NULL, FK -> `public.tasks(id)` ON DELETE SET NULL)
- `similarity_score` (NUMERIC(5,4), NULL): Cosine similarity score.
- `ai_confidence` (NUMERIC(4,3), NULL)
- `match_reason` (TEXT, NULL): Explanation of match.
- `decision` (TEXT, CHECK IN ('matched', 'new', 'uncertain'))
- `created_at` (TIMESTAMPTZ)

### 2.6 `loopkeeper_ai_runs`
Telemetry and evaluation table for AI inferences.
- `id` (UUID, PK)
- `meeting_id` (UUID, NULL, FK -> `loopkeeper_meetings(id)`)
- `action_item_id` (UUID, NULL, FK -> `loopkeeper_action_items(id)`)
- `model_name` (TEXT, NOT NULL)
- `model_version` (TEXT, NULL)
- `provider` (TEXT, CHECK IN ('slm', 'fallback_llm'))
- `input_hash` (TEXT, NULL)
- `confidence` (NUMERIC(4,3), NULL)
- `latency_ms` (INTEGER, NULL)
- `success` (BOOLEAN, DEFAULT true)
- `fallback_used` (BOOLEAN, DEFAULT false)
- `created_at` (TIMESTAMPTZ)

### 2.7 `loopkeeper_meeting_participants`
Junction table linking employees to meetings.
- `id` (UUID, PK)
- `meeting_id` (UUID, FK -> `loopkeeper_meetings(id)` ON DELETE CASCADE)
- `employee_id` (UUID, FK -> `public.employees(id)` ON DELETE CASCADE)
- `created_at` (TIMESTAMPTZ)
- UNIQUE (`meeting_id`, `employee_id`)

---

## 3. Relationships & VALIXIS Integration Boundary
- **Employees Integration**: `loopkeeper_meetings.created_by`, `loopkeeper_action_items.owner_employee_id`, and `loopkeeper_meeting_participants.employee_id` reference `public.employees(id)`.
- **VALIXIS Task Integration**: `loopkeeper_task_matches.matched_valixis_task_id` references `public.tasks(id)` for linking extracted meeting items to existing project tasks.
- **Data Safety**: No VALIXIS tables are modified or written to directly by the core LoopKeeper engine.

---

## 4. Vector Strategy & Semantic Matching
- **Extension**: `pgvector` enabled via `CREATE EXTENSION IF NOT EXISTS vector;`.
- **Dimension Standard**: Fixed at **1536 dimensions** to support industry standard embeddings (`text-embedding-3-small` / Gemini `text-embedding-004` output format).
- **Index**: HNSW (Hierarchical Navigable Small World) index configured for cosine similarity:
  ```sql
  CREATE INDEX idx_loopkeeper_action_items_embedding 
  ON public.loopkeeper_action_items 
  USING hnsw (embedding vector_cosine_ops);
  ```

---

## 5. Security & Row Level Security (RLS)
- **RLS Status**: Enabled on all 7 `loopkeeper_*` tables.
- **Access Policies**:
  - **Managers**: Inherit full CRUD permissions using existing VALIXIS `is_manager()` function.
  - **Employees / Authenticated Users**: Can access meetings they created or participated in, and action items they own or are associated with.
- **Server-Side Security**: The LoopKeeper FastAPI backend communicates via Supabase's `service_role` key when orchestrating AI pipelines, safely bypassing RLS server-side without exposing privileged credentials to frontend clients.

---

## 6. Migration Instructions
The SQL migration file is stored in the repository at [`backend/001_loopkeeper_schema.sql`](file:///c:/Users/nagas/Documents/HACKATHONS/GENESIS/loopkeeper/backend/001_loopkeeper_schema.sql).

To apply the migration manually to any environment:
```bash
psql $DATABASE_URL -f backend/001_loopkeeper_schema.sql
```
Or via Supabase CLI / SQL Editor.
