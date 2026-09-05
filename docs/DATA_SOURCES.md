# LoopKeeper — Data Sources & Privacy Inventory

This document defines the complete data architecture, data sources, privacy constraints, and dataset classifications for the **LoopKeeper** platform.

---

## 1. Data Inventory & Classification Matrix

| Data Source | Description / Scope | Production vs Demo | Access Mode | Stored in LoopKeeper? | PII / Privacy Safeguards |
|:---|:---|:---|:---|:---|:---|
| **VALIXIS Employees** (public.employees) | Live employee profiles (names, emails, roles) from VALIXIS Portal. | **Production Data** | **Read-Only** (SQL queries) | **No** (Queried dynamically via GET /api/v1/employees) | No passkeys or auth secrets accessed. |
| **VALIXIS Tasks** (public.tasks) | Engineering task backlog items (titles, objectives, deadlines, priorities). | **Production Data** | **Read-Only** (SQL queries) | **No** (Referenced via UUID in loopkeeper_task_matches) | Sanitized title matching. |
| **VALIXIS Assignments** (public.task_assignments) | Task assignment mapping (	ask_id, employee_id, status). | **Production Data** | **Read-Only** (SQL queries) | **No** (Referenced dynamically) | Strictly read-only isolation. |
| **VALIXIS Submissions** (public.submissions) | Task submission records & review statuses from managers. | **Production Data** | **Read-Only** (SQL queries) | **No** | Metadata only. |
| **Google Drive Transcripts** | Google Meet transcripts ingested via Google Drive API. | **Production Data** | **Read-Only Ingestion** | **Yes** (loopkeeper_transcripts table) | Ingested via OAuth 2.0 user-authorized scope (drive.readonly). |
| **Synthetic Test Transcripts** | Controlled 3-meeting continuity regression test cases (Priya payment API scenario). | **Demo / Test Data** | **In-Memory / Fixture** | **Yes** (Controlled baseline fixtures) | Simulated names & non-sensitive mock context. |
| **Training Datasets** (ml/datasets/train.json, al.json, 	est.json) | Sentence-level commitment extraction training examples (30 total examples). | **Test / ML Data** | **Offline File** | **Local File** | 100% synthetic, synthetic names, no real user PII. |
| **VALIXIS Task Derived Dataset** (ml/datasets/valixis_task_derived.json) | Auxiliary dataset (17 records) derived from real assigned VALIXIS tasks for vocabulary & entity matching. | **Derived Benchmark Data** | **Offline File** | **Local File** | Excludes passwords/secrets; contains public task titles & names. |

---

## 2. Storage Boundaries & Non-Persistence Guarantees

### **What is Stored in LoopKeeper (loopkeeper_* Schema)**
- **Meetings**: Meeting metadata (id, 	itle, meeting_date, created_by, source).
- **Transcripts**: Full text of ingested meeting transcripts (loopkeeper_transcripts).
- **Action Items**: Extracted commitments, owners, deadlines, status, postponement count (loopkeeper_action_items).
- **Action Item History**: Audit trail of status changes, deadline postponements, evidence snippets (loopkeeper_action_item_history).
- **Task Matches**: Cross-references linking meeting action items to VALIXIS tasks (loopkeeper_task_matches).
- **AI Run Telemetry**: Telemetry logs (model_name, provider, confidence, latency_ms, allback_used).

### **What is NEVER Copied or Stored in LoopKeeper**
- **Authentication Credentials**: User passwords, password hashes, auth tokens, service role keys.
- **Full VALIXIS Tables**: The VALIXIS database schema (employees, 	asks, 	ask_assignments, submissions) is **never duplicated** into LoopKeeper.
- **External Private Data**: Personal device files outside designated Google Drive meeting transcript folders.

---

## 3. Data Flow & Integration Pipeline

`
[ VALIXIS Portal Database ] (Read-Only)
   ├── public.employees  ──> GET /api/v1/employees ──> LoopKeeper Web / Mobile UI
   └── public.tasks      ──> ValixisRepository     ──> Task Matching & Workload Index

[ Ingestion Pipeline ]
   ├── Google Drive API  ──> POST /api/v1/meetings/{id}/transcript ──> LoopKeeper DB
   └── Manual Upload     ──> Text Parser / Ingest

[ AI Processing Engine ]
   ├── Input Transcript ──> SLM Sentence Classifier (MultiTaskSLMClassifier)
   ├── Extraction Guard ──> Excludes non-person component nouns (e.g. Google Drive, Docker)
   ├── High Confidence  ──> Direct Action Item Extraction
   └── Low Confidence   ──> Fallback LLM / Heuristic Parser
`

---

## 4. Security & Compliance Checklist

- [x] **Strict Read-Only Access**: All queries to public.employees and public.tasks use SELECT statements.
- [x] **No Mutating SQL**: No INSERT, UPDATE, DELETE, ALTER, or DROP statements targeting VALIXIS tables.
- [x] **Zero Credential Exposure**: SUPABASE_SERVICE_ROLE_KEY is kept server-side in backend environment variables and never exposed to the Web or Mobile clients.
- [x] **PII Anonymization**: Machine learning training datasets (ml/datasets/*.json) contain zero real user private data.
