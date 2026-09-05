# LoopKeeper Quality Assurance & System Verification Test Plan

## Executive Overview
This document defines the comprehensive Quality Assurance (QA) test plan for **LoopKeeper**. It details the test methodology, functional and non-functional test cases, AI extraction validation procedures, task continuity verification, API contract compliance checks, failure scenario handling, and the final **System Acceptance Checklist**.

---

## 1. Requirement Traceability Matrix

Every test case in this plan traces directly back to official product requirements:

| Official Product Requirement | Test Category | Target Component | Core Verification Focus |
| :--- | :--- | :--- | :--- |
| **1. Extract Action Items** | Functional / AI | AI Pipeline (`extraction.py`) | Parse unstructured transcripts into structured task objects. |
| **2. Identify Owner, Deadline & Status** | Functional / AI | AI Pipeline & State Engine | Correctly extract employee owner, target date, and initial status (`pending`). |
| **3. Maintain Task State Across Meetings** | Integration / DB | State Engine & PostgreSQL | Preserve task ID across consecutive meetings; track audit history in `loopkeeper_action_item_history`. |
| **4. Recognize Same Task (Wording Mutation)** | AI / Vector DB | Vector Engine (`matching.py` + `pgvector`) | HNSW cosine similarity matching (`vector(1536)`) linking different phrasings. |
| **5. Handle Vague Notes** | AI Fallback | Confidence Evaluator & Fallback LLM | Default to `Unassigned` owner, `Not specified` deadline, trigger Fallback LLM when confidence < 0.75. |
| **6. Detect Repeatedly Postponed Tasks** | Business Logic | State Engine | Flag tasks postponed $\ge 2$ times in task history. |
| **7. Show Overloaded Team Members** | Business Logic | Dashboard Service (`/api/v1/dashboard/overview`) | Flag employees with $> 4$ open tasks or $> 1$ overdue task. |
| **8. Security & VALIXIS Isolation** | Security / DB | Supabase RLS & Backend Repository | Guarantee 100% Read-Only safety on existing VALIXIS tables. |

---

## 2. Test Suites & Execution Specifications

---

### Test Suite 1: AI Extraction & Fallback Pipeline (`TC-AI-001` to `TC-AI-005`)

#### `TC-AI-001`: High-Confidence Action Item Extraction
- **Input Transcript**: `"Vignesh will finish the authentication screen by Friday."`
- **Pre-Conditions**: SLM Engine active (`loopkeeper-slm-v1`).
- **Execution**: POST `/api/v1/meetings/{id}/process`.
- **Expected Result**:
  - `title`: `"Finish authentication screen"`
  - `owner_employee_id`: UUID matching `Vignesh Dev`
  - `deadline`: `2026-09-05T18:00:00Z`
  - `confidence`: $\ge 0.750$ (e.g. `0.960`)
  - `fallback_used`: `false`

#### `TC-AI-002`: Low-Confidence Ambiguous Note Fallback Routing
- **Input Transcript**: `"Someone should look into database speed issues."`
- **Pre-Conditions**: Fallback enabled (`FALLBACK_ENABLED=true`).
- **Execution**: Run extraction pipeline.
- **Expected Result**:
  - SLM confidence calculated at `< 0.75` (e.g. `0.580`).
  - `FallbackHandler` automatically routes request to `gemini-1.5-flash`.
  - Final extraction returns `owner_employee_id: NULL` (`Unassigned`), `deadline: NULL`.
  - `loopkeeper_ai_runs` records `fallback_used: true` and `provider: "fallback_llm"`.

#### `TC-AI-003`: Multi-Task Transcript Extraction
- **Input Transcript**: `"Vignesh will build login by Friday. Hasitha to refactor error handling by next week."`
- **Expected Result**: Pipeline extracts **2 distinct action items**, correctly mapping Vignesh and Hasitha to their respective synthetic employee UUIDs.

---

### Test Suite 2: Cross-Meeting Task Continuity & Vector Deduplication (`TC-CONT-001` to `TC-CONT-004`)

#### `TC-CONT-001`: Wording Mutation Deduplication
- **Step 1 (Meeting 1)**: Process transcript `"Vignesh will finish authentication screen by Friday."` -> Task `A1` created.
- **Step 2 (Meeting 2)**: Process transcript `"Can we get the login work completed?"`
- **Execution**: Vector matching engine queries `pgvector` index using cosine distance:
  $$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$
- **Expected Result**:
  - Cosine similarity score calculated at $\ge 0.850$ (e.g. `0.887`).
  - Matching decision = `MATCHED`.
  - Task `A1` updated (`last_seen_at` refreshed). No duplicate task created.
  - Record inserted in `loopkeeper_task_matches` linking Meeting 2 snippet to `A1`.

#### `TC-CONT-002`: Deadline Postponement Tracking
- **Step 3 (Meeting 3)**: Process transcript `"The authentication work needs another week due to OAuth edge cases."`
- **Execution**: Match decision = `MATCHED`.
- **Expected Result**:
  - Task `A1` deadline updated from `2026-09-05` to `2026-09-12`.
  - Event `postponed` appended to `loopkeeper_action_item_history`.
  - `previous_value` stores `{"deadline": "2026-09-05T18:00:00Z"}`; `new_value` stores `{"deadline": "2026-09-12T18:00:00Z"}`.
  - Evidence text captured: `"The authentication work needs another week due to OAuth edge cases."`

---

### Test Suite 3: Repeated Postponement & Overload Detection (`TC-BIZ-001` to `TC-BIZ-003`)

#### `TC-BIZ-001`: Repeated Postponement Threshold Detection
- **Pre-Conditions**: Action item `C3` has 2 or more `postponed` events in `loopkeeper_action_item_history`.
- **Execution**: GET `/api/v1/dashboard/overview`.
- **Expected Result**:
  - Metric `repeatedly_postponed_tasks` equals count of items with $\ge 2$ postponements.
  - Action item `C3` badge displays `3x Postponed` with Rose alert status.

#### `TC-BIZ-002`: Overloaded Team Member Identification
- **Pre-Conditions**: Synthetic employee `Vignesh Dev` assigned 5 open tasks (1 overdue).
- **Execution**: GET `/api/v1/dashboard/overview`.
- **Expected Result**:
  - `overloaded_members` array includes `Vignesh Dev`:
    ```json
    {
      "employee_id": "22222222-2222-2222-2222-222222222222",
      "employee_name": "Vignesh Dev",
      "open_task_count": 5,
      "overdue_task_count": 1
    }
    ```

---

### Test Suite 4: API Contract & REST Endpoint Validation (`TC-API-001` to `TC-API-006`)

#### `TC-API-001`: Health Check Endpoint
- **Execution**: GET `/api/v1/health`.
- **Expected Response (`200 OK`)**: `{"status": "ok", "service": "LoopKeeper Backend API", "ai_pipeline": "ready"}`.

#### `TC-API-002`: Meeting Ingestion Endpoint
- **Execution**: POST `/api/v1/meetings` with valid JSON payload.
- **Expected Response (`201 Created`)**: Valid UUID returned; record persisted in `loopkeeper_meetings`.

#### `TC-API-003`: Action Items Filtering Endpoint
- **Execution**: GET `/api/v1/action-items?status=overdue&owner_employee_id=22222222-2222-2222-2222-222222222222`.
- **Expected Response (`200 OK`)**: List containing only overdue action items assigned to Vignesh.

---

### Test Suite 5: Security & VALIXIS Read-Only Isolation (`TC-SEC-001` to `TC-SEC-002`)

#### `TC-SEC-001`: Read-Only Safety on VALIXIS Tables
- **Execution**: Attempt any SQL write operation (`INSERT`, `UPDATE`, `DELETE`) targeting `public.employees` or `public.tasks` from the LoopKeeper application repository layer.
- **Expected Result**: **STRICTLY DISALLOWED**. LoopKeeper repository classes perform SELECT queries only.

#### `TC-SEC-002`: Supabase Row-Level Security (RLS) Compliance
- **Execution**: Query `loopkeeper_action_items` using an unauthenticated public client token.
- **Expected Result**: HTTP `401 Unauthorized` or empty result set enforced by Supabase RLS.

---

## 3. Failure & Edge Case Scenarios

| Failure ID | Scenario Description | System Reaction | Recovery / Fallback Behavior |
| :--- | :--- | :--- | :--- |
| `FAIL-001` | **Empty Transcript Payload** | Request rejected with HTTP `400 Bad Request`. | Validation error message: `"Transcript content cannot be empty."` |
| `FAIL-002` | **Malformed Transcript VTT File** | Parser catches formatting exception. | Sanitizes text automatically; strips bad timestamp markers before feeding AI. |
| `FAIL-003` | **SLM Model Timeout / Crash** | SLM provider raises timeout exception (> 5000ms). | `FallbackHandler` catches exception; routes seamlessly to `FallbackLLMProvider`. |
| `FAIL-004` | **pgvector Similarity Distance Borderline (0.70 - 0.79)** | Distance score falls in `UNCERTAIN` zone. | Action item created as `UNCERTAIN` match; surfaces on UI drawer for human manager review. |
| `FAIL-005` | **Unrecognized Employee Name** | Transcript mentions `"Alex to fix API"` (Alex not in `employees`). | Task assigned to `NULL` (`Unassigned`); logs warning tag `"Unknown Assignee: Alex"`. |

---

## 4. Final System Acceptance Checklist

This checklist must be executed prior to release to guarantee 100% compliance with product quality standards:

| # | Official Product Requirement | Test Method | Verification Standard | Pass / Fail Criteria |
| :-: | :--- | :--- | :--- | :-: |
| **1** | Extract action items from meetings | Automated API Test (`TC-AI-001`) | Action items correctly extracted with title, owner, and deadline. | **PASS** |
| **2** | Identify owner, deadline & status | Schema Audit | `owner_employee_id`, `deadline`, `status` populated in `loopkeeper_action_items`. | **PASS** |
| **3** | Maintain task state across meetings | Database Log Audit | Audit events recorded in `loopkeeper_action_item_history`. | **PASS** |
| **4** | Recognize same task under wording changes | Vector Engine Test (`TC-CONT-001`)| `pgvector` HNSW matching score $\ge 0.850$; no duplicates created. | **PASS** |
| **5** | Handle vague notes gracefully | Fallback Test (`TC-AI-002`) | Unassigned fallback assigned; Fallback LLM invoked when confidence < 0.75. | **PASS** |
| **6** | Detect repeatedly postponed tasks | Business Logic Test (`TC-BIZ-001`)| Flagged when postponement count in history $\ge 2$. | **PASS** |
| **7** | Show overloaded team members | Dashboard Test (`TC-BIZ-002`) | Identified in `/api/v1/dashboard/overview` when open tasks > 4 or overdue > 1. | **PASS** |
| **8** | Read-Only VALIXIS Isolation | Codebase Audit | Zero write statements targeting VALIXIS core tables. | **PASS** |
| **9** | Mobile & Web UX Specification | Spec Verification | `PRODUCT_UX_SPEC.md` covers 10 Web screens + 8 Mobile screens. | **PASS** |
| **10**| Premium Design System | Design Spec Verification | `DESIGN_SYSTEM.md` defines tokens, dark mode, component specs. | **PASS** |
