# LoopKeeper Demonstration Data Plan & Privacy Audit

## Executive Overview
This document specifies the synthetic dataset, realistic organizational setup, demonstration scenarios, privacy protection boundaries, and executable SQL seed scripts required to demonstrate the full lifecycle of **LoopKeeper** during system evaluation.

---

## 1. VALIXIS Portal Integration & Privacy Audit

### 1.1 Data Audit Summary
An audit of the VALIXIS Portal database schema was conducted to determine how data can be safely utilized without exposing proprietary or private employee information.

| Table Name | VALIXIS Schema | Usage in LoopKeeper Demo | Privacy Protection Rule |
| :--- | :--- | :--- | :--- |
| `public.employees` | Read-Only | Reused as foreign key targets for action item assignees. | All names, emails, and phone numbers in demo datasets are **100% synthetic/anonymized**. |
| `public.tasks` | Read-Only | Reused for optional cross-linking (`matched_valixis_task_id`). | No direct mutations to VALIXIS tasks. Synthetic task definitions only. |
| `public.task_assignments`| Read-Only | Audit reference for employee workload mapping. | Read-only queries; no writes. |
| `public.submissions` | Read-Only | Audit reference. | Not accessed during demo. |
| `public.audit_logs` | Read-Only | Audit reference. | Not accessed during demo. |

### 1.2 Privacy Protection Directives
1. **ZERO Real Credentials**: No real passwords, API keys, JWT tokens, or internal credentials are saved in seed files or repository scripts.
2. **Synthetic Employee Roster**: All employee profiles use synthetic names (e.g. Vignesh Dev, Hasitha Tech, Jyothsna Lead, Rahul PM, Priya QA) and generic test email addresses (`vignesh@apexfintech.demo`).
3. **Anonymized Transcripts**: All meeting transcripts represent simulated software sprint discussions for a fictitious organization ("Apex FinTech Solutions").

---

## 2. Synthetic Organizational Dataset Setup

### 2.1 Fictitious Organization: Apex FinTech Solutions
- **Domain**: Core Banking & Authentication Platform.
- **Sprint Duration**: 2-Week Sprint Cycle (Sprint 44: Aug 25 - Sept 8, 2026).
- **Target Projects**:
  - `PRJ-01`: OAuth2 Authentication Module.
  - `PRJ-02`: Real-time Payment Gateway Integration.
  - `PRJ-03`: PostgreSQL Database Indexing & Performance.

### 2.2 Synthetic Employee Roster (`public.employees`)

| Employee ID (UUID) | Full Name | Email | Role | Department | Capacity Limit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `11111111-1111-1111-1111-111111111111` | Rahul PM | `rahul@apexfintech.demo` | manager | Product Management | 3 Tasks |
| `22222222-2222-2222-2222-222222222222` | Vignesh Dev | `vignesh@apexfintech.demo` | employee | Frontend Engineering | 3 Tasks |
| `33333333-3333-3333-3333-333333333333` | Hasitha Tech | `hasitha@apexfintech.demo` | employee | Backend Engineering | 3 Tasks |
| `44444444-4444-4444-4444-444444444444` | Jyothsna Lead| `jyothsna@apexfintech.demo` | manager | Design & QA | 4 Tasks |
| `55555555-5555-5555-5555-555555555555` | Priya QA | `priya@apexfintech.demo` | employee | Quality Assurance | 3 Tasks |

---

## 3. Core Demonstration Scenarios

---

### Scenario A: Cross-Meeting Task Continuity & Wording Mutation

#### Meeting 1 (Sprint Planning - Sept 1, 2026)
- **Transcript Excerpt**:
  > *"Rahul PM: Alright team, let's lock down our Sprint commitments. Vignesh, can you take full ownership of the authentication screen? We need it ready for integration by Friday."*  
  > *"Vignesh Dev: Sure Rahul, Vignesh will finish the authentication screen by Friday."*
- **LoopKeeper Action**:
  - Extracted Task Title: `"Finish authentication screen"`
  - Owner: `Vignesh Dev` (`22222222-2222-2222-2222-222222222222`)
  - Deadline: `2026-09-05T18:00:00Z` (Friday)
  - Status: `pending`
  - Confidence Score: `0.960`
  - Action Item ID: `a1111111-1111-1111-1111-111111111111`

#### Meeting 2 (Mid-Week Standup - Sept 3, 2026)
- **Transcript Excerpt**:
  > *"Rahul PM: Quick check-in on progress. Can we get the login work completed on schedule?"*  
  > *"Vignesh Dev: Yes, I am actively building out the components today. Still targeting Friday."*
- **LoopKeeper Action**:
  - SLM extracts input: `"get login work completed"`
  - Semantic Matching Engine compares vector embeddings (`text-embedding-3-small` / 1536-dim):
    - Similarity Score between *"Finish authentication screen"* and *"get login work completed"*: **`0.8870`**
  - Decision: **`MATCHED`**
  - Result: Does NOT create a duplicate task. Updates existing task `last_seen_at` to `2026-09-03T10:00:00Z` and logs a match record in `loopkeeper_task_matches`.

#### Meeting 3 (Sprint Review & Retrospective - Sept 5, 2026)
- **Transcript Excerpt**:
  > *"Rahul PM: What's the status of the authentication flow?"*  
  > *"Vignesh Dev: The core OAuth integration ran into edge cases with token refresh. The authentication work needs another week."*
- **LoopKeeper Action**:
  - SLM extracts input: `"authentication work needs another week"`
  - Vector Similarity Score: **`0.9420`** (Matched to `a1111111-1111-1111-1111-111111111111`).
  - System Action:
    - Target deadline automatically updated from `2026-09-05` to `2026-09-12T18:00:00Z`.
    - Status set to `pending` with `deadline_changed` and `postponed` events.
    - Postponement count incremented to `1x`.
    - Logged in `loopkeeper_action_item_history` with evidence text.

---

### Scenario B: Ambiguous / Vague Note & Low-Confidence Fallback

#### Meeting 1 (Architecture Sync - Sept 2, 2026)
- **Transcript Excerpt**:
  > *"Hasitha Tech: Someone should really look into the database speed issues when we run heavy queries."*
- **LoopKeeper Action**:
  - SLM Extraction Result:
    - Title: `"Look into database speed issues"`
    - Owner: `NULL` (`Unassigned`)
    - Deadline: `NULL` (`Not specified`)
    - Provider Score: `0.580` (Below `0.75` threshold)
  - Fallback Pipeline Triggered:
    - `FallbackHandler` invokes `FallbackLLMProvider` (`gemini-1.5-flash`).
    - Telemetry logged in `loopkeeper_ai_runs` with `fallback_used: true`, `confidence: 0.620`.
  - Task created with `Unassigned` owner and flagged on Manager Dashboard with a warning banner: *"Low Confidence Task — Manager Review Required"*.

---

### Scenario C: Repeated Postponement & High Accountability Risk Flagging

#### Task Track Record: "Refactor API Error Handling"
- **Action Item ID**: `c3333333-3333-3333-3333-333333333333`
- **Owner**: `Hasitha Tech` (`33333333-3333-3333-3333-333333333333`)
- **Lifecycle History across 3 Sprint Meetings**:
  1. **Meeting 1 (Aug 15)**: Created with deadline `Aug 22`.
  2. **Meeting 2 (Aug 22)**: Postponed to `Aug 29` ("Pushed due to payment gateway hotfix").
  3. **Meeting 3 (Aug 29)**: Postponed to `Sept 5` ("Delayed waiting for security audit").
  4. **Meeting 4 (Sept 5)**: Postponed again to `Sept 12` ("Delayed due to high priority ticket").
- **LoopKeeper Automated Detection**:
  - `loopkeeper_action_item_history` contains **3 postponed events** for this single action item ID.
  - State Engine flags task as **`Repeatedly Postponed (3x)`**.
  - Surfaces on Accountability Insights page with a pulsing Rose warning icon (`#EF4444`) and tags the item as **High Organizational Risk**.

---

### Scenario D: Team Member Overload Identification

#### Employee Capacity Audit: Vignesh Dev
- **Max Recommended Capacity**: 3 active open tasks.
- **Assigned Active Action Items**:
  1. Task 1: "Finish authentication screen" (Deadline: Sept 12 - Postponed).
  2. Task 2: "Build User Profile Modal" (Deadline: Sept 4 - **OVERDUE**).
  3. Task 3: "Fix CSS layout bug in navbar" (Deadline: Sept 6).
  4. Task 4: "Implement dark mode toggle" (Deadline: Sept 7).
  5. Task 5: "Write E2E test cases for login" (Deadline: Sept 9).
- **LoopKeeper Overload Detection Engine**:
  - Open Task Count = `5` (> 3 capacity threshold).
  - Overdue Task Count = `1` (> 0 threshold).
  - Endpoint `/api/v1/dashboard/overview` automatically adds Vignesh to `overloaded_members`:
    ```json
    {
      "employee_id": "22222222-2222-2222-2222-222222222222",
      "employee_name": "Vignesh Dev",
      "open_task_count": 5,
      "overdue_task_count": 1
    }
    ```
  - Visualized on Team Workload page as a red capacity bar (166% load).

---

## 4. Complete Executable SQL Demo Seed Script

To populate Supabase PostgreSQL with the realistic demonstration dataset, run the following SQL script:

```sql
-- =============================================================================
-- LOOPKEEPER SYNTHETIC DEMONSTRATION DATA SEED SCRIPT
-- =============================================================================

BEGIN;

-- 1. Insert Synthetic Employees into public.employees (if not existing)
INSERT INTO public.employees (id, auth_id, name, email, role, department)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-0000-0000-0000-111111111111', 'Rahul PM', 'rahul@apexfintech.demo', 'manager', 'Product Management'),
  ('22222222-2222-2222-2222-222222222222', '22222222-0000-0000-0000-222222222222', 'Vignesh Dev', 'vignesh@apexfintech.demo', 'employee', 'Engineering'),
  ('33333333-3333-3333-3333-333333333333', '33333333-0000-0000-0000-333333333333', 'Hasitha Tech', 'hasitha@apexfintech.demo', 'employee', 'Engineering'),
  ('44444444-4444-4444-4444-444444444444', '44444444-0000-0000-0000-444444444444', 'Jyothsna Lead', 'jyothsna@apexfintech.demo', 'manager', 'QA & Design'),
  ('55555555-5555-5555-5555-555555555555', '55555555-0000-0000-0000-555555555555', 'Priya QA', 'priya@apexfintech.demo', 'employee', 'Quality Assurance')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 2. Insert Meetings
INSERT INTO public.loopkeeper_meetings (id, title, meeting_date, source, external_source_id, created_by)
VALUES
  ('m1111111-1111-1111-1111-111111111111', 'Sprint 44 Planning Meeting', '2026-09-01T10:00:00Z', 'transcript', 'meet-sprint44-01', '11111111-1111-1111-1111-111111111111'),
  ('m2222222-2222-2222-2222-222222222222', 'Mid-Week Engineering Standup', '2026-09-03T10:00:00Z', 'transcript', 'meet-sprint44-02', '11111111-1111-1111-1111-111111111111'),
  ('m3333333-3333-3333-3333-333333333333', 'Sprint 44 Review & Sync', '2026-09-05T10:00:00Z', 'transcript', 'meet-sprint44-03', '11111111-1111-1111-1111-111111111111');

-- 3. Insert Meeting Transcripts
INSERT INTO public.loopkeeper_transcripts (id, meeting_id, content, source_file_name, transcript_format)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', 'Rahul PM: Vignesh will finish the authentication screen by Friday. Hasitha will refactor API error handling by Aug 22.', 'sprint_planning_sept01.txt', 'txt'),
  ('t2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 'Rahul PM: Can we get the login work completed? Someone should look into database speed issues.', 'standup_sept03.txt', 'txt'),
  ('t3333333-3333-3333-3333-333333333333', 'm3333333-3333-3333-3333-333333333333', 'Vignesh Dev: The authentication work needs another week due to OAuth edge cases. Hasitha Tech: Error handling pushed again.', 'sprint_review_sept05.txt', 'txt');

-- 4. Insert Action Items
INSERT INTO public.loopkeeper_action_items 
  (id, meeting_id, title, description, owner_employee_id, deadline, status, confidence, source_text, first_seen_at, last_seen_at)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'm1111111-1111-1111-1111-111111111111',
    'Finish authentication screen',
    'Build OAuth login screen components and state handlers',
    '22222222-2222-2222-2222-222222222222',
    '2026-09-12T18:00:00Z', -- Postponed to Sept 12
    'pending',
    0.960,
    'Vignesh will finish the authentication screen by Friday.',
    '2026-09-01T10:00:00Z',
    '2026-09-05T10:00:00Z'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'm1111111-1111-1111-1111-111111111111',
    'Build User Profile Modal',
    'Implement profile management modal with avatar upload',
    '22222222-2222-2222-2222-222222222222',
    '2026-09-04T18:00:00Z', -- Overdue
    'overdue',
    0.910,
    'Vignesh to deliver profile modal by Sept 4',
    '2026-09-01T10:00:00Z',
    '2026-09-01T10:00:00Z'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'm1111111-1111-1111-1111-111111111111',
    'Refactor API Error Handling',
    'Standardize JSON exception payloads across FastAPI endpoints',
    '33333333-3333-3333-3333-333333333333',
    '2026-09-12T18:00:00Z', -- Repeatedly postponed 3x
    'pending',
    0.940,
    'Hasitha will refactor API error handling',
    '2026-08-15T10:00:00Z',
    '2026-09-05T10:00:00Z'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'm2222222-2222-2222-2222-222222222222',
    'Look into database speed issues',
    'Investigate slow PostgreSQL query logs during peak load',
    NULL, -- Ambiguous unassigned
    NULL,
    'pending',
    0.620,
    'Someone should look into database speed issues',
    '2026-09-03T10:00:00Z',
    '2026-09-03T10:00:00Z'
  );

-- 5. Insert Task History Events (Audit Log)
INSERT INTO public.loopkeeper_action_item_history
  (id, action_item_id, meeting_id, event_type, previous_value, new_value, evidence_text)
VALUES
  (
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'm1111111-1111-1111-1111-111111111111',
    'created',
    NULL,
    '{"title": "Finish authentication screen", "deadline": "2026-09-05T18:00:00Z", "owner": "Vignesh Dev"}'::jsonb,
    'Vignesh will finish the authentication screen by Friday.'
  ),
  (
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'm3333333-3333-3333-3333-333333333333',
    'postponed',
    '{"deadline": "2026-09-05T18:00:00Z"}'::jsonb,
    '{"deadline": "2026-09-12T18:00:00Z"}'::jsonb,
    'The authentication work needs another week due to OAuth edge cases.'
  ),
  -- Postponements for Task C3 (3x postponed)
  (
    gen_random_uuid(),
    'c3333333-3333-3333-3333-333333333333',
    'm1111111-1111-1111-1111-111111111111',
    'postponed',
    '{"deadline": "2026-08-22T18:00:00Z"}'::jsonb,
    '{"deadline": "2026-08-29T18:00:00Z"}'::jsonb,
    'Pushed due to payment gateway hotfix'
  ),
  (
    gen_random_uuid(),
    'c3333333-3333-3333-3333-333333333333',
    'm2222222-2222-2222-2222-222222222222',
    'postponed',
    '{"deadline": "2026-08-29T18:00:00Z"}'::jsonb,
    '{"deadline": "2026-09-05T18:00:00Z"}'::jsonb,
    'Delayed waiting for security audit'
  ),
  (
    gen_random_uuid(),
    'c3333333-3333-3333-3333-333333333333',
    'm3333333-3333-3333-3333-333333333333',
    'postponed',
    '{"deadline": "2026-09-05T18:00:00Z"}'::jsonb,
    '{"deadline": "2026-09-12T18:00:00Z"}'::jsonb,
    'Error handling pushed again due to high priority ticket'
  );

-- 6. Insert AI Task Match Decisions
INSERT INTO public.loopkeeper_task_matches
  (id, action_item_id, matched_action_item_id, similarity_score, ai_confidence, match_reason, decision)
VALUES
  (
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    0.8870,
    0.920,
    'High semantic similarity between "authentication screen" and "login work" with identical owner context',
    'matched'
  ),
  (
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    0.9420,
    0.960,
    'Matched "authentication work needs another week" to existing task a1111111 with deadline adjustment',
    'matched'
  );

-- 7. Insert Telemetry Runs
INSERT INTO public.loopkeeper_ai_runs
  (id, meeting_id, action_item_id, model_name, provider, confidence, latency_ms, success, fallback_used)
VALUES
  (gen_random_uuid(), 'm1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'loopkeeper-slm-v1', 'slm', 0.960, 142, true, false),
  (gen_random_uuid(), 'm2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'gemini-1.5-flash', 'fallback_llm', 0.620, 480, true, true);

COMMIT;
```
