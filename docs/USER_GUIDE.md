# LoopKeeper End-User Product Guide

> **From Meeting Promises to Completed Work.**

LoopKeeper is an AI-powered meeting accountability platform that transforms unstructured meeting conversations into tracked, persistent action items. It bridges meeting promises with organizational execution by automatically detecting action items, matching related tasks across consecutive meetings, and tracking deadline postponements and team workload.

---

## Table of Contents
1. [System Architecture & Startup](#1-system-architecture--startup)
2. [Connecting Frontends to Backend API](#2-connecting-frontends-to-backend-api)
3. [Creating Meetings & Ingesting Transcripts](#3-creating-meetings--ingesting-transcripts)
4. [Running AI Processing & Action Item Extraction](#4-running-ai-processing--action-item-extraction)
5. [Action Item Intelligence & Audit History](#5-action-item-intelligence--audit-history)
6. [Confidence Scoring & AI Fallback Routing](#6-confidence-scoring--ai-fallback-routing)
7. [Executive Dashboard & Team Workload](#7-executive-dashboard--team-workload)
8. [Postponement Radar & Accountability Graph](#8-postponement-radar--accountability-graph)
9. [Google Drive Automatic Transcript Ingestion](#9-google-drive-automatic-transcript-ingestion)
10. [VALIXIS Portal Data Integration](#10-valixis-portal-data-integration)
11. [Capabilities & Boundaries (What LoopKeeper Infer vs Cannot Infer)](#11-capabilities--boundaries)

---

## 1. System Architecture & Startup

LoopKeeper consists of three components:
- **Backend API**: Python FastAPI with `pgvector` semantic matching, lightweight SLM classifier, and fallback LLM integration.
- **Web Portal**: React, Vite, Tailwind CSS, TypeScript executive dashboard.
- **Mobile Application**: Flutter cross-platform mobile client for iOS and Android.

### Starting the Backend API
Run from the repository root directory:
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload
```
Health Check Verification:
- `http://127.0.0.1:8001/health`
- `http://127.0.0.1:8001/api/v1/health`

### Starting the Web Portal
Run from the `web/` directory:
```powershell
cd web
npm run dev
```
Access the web portal at `http://localhost:5173`.

### Starting the Mobile Application
Run from the `mobile/` directory:
```powershell
cd mobile
flutter run
```

---

## 2. Connecting Frontends to Backend API

The web portal connects to the backend via `VITE_API_URL`. Configure `web/.env.local`:
```env
VITE_API_URL=http://127.0.0.1:8001/api/v1
```

The mobile app connects via `defaultBaseUrl` in `session_storage.dart` pointing to `http://10.0.2.2:8001/api/v1` for Android emulators or `http://localhost:8001/api/v1` for desktop/iOS simulators.

---

## 3. Creating Meetings & Ingesting Transcripts

1. Click **+ New Meeting** in the top navigation bar or **Ingest Transcript** on the Dashboard.
2. Enter Meeting Title (e.g. `Sprint 14 Planning`) and set date/time.
3. Paste or upload the raw meeting transcript text into the **Transcript Content** field.
4. Click **Run AI Pipeline & Ingest Transcript**.

---

## 4. Running AI Processing & Action Item Extraction

Upon ingestion, LoopKeeper executes a 6-stage pipeline:
1. **Input Ingestion & Sanitization**: Strips VTT/TXT formatting artifacts.
2. **SLM Extraction Pipeline**: Evaluates commitment likelihood using `MultiTaskSLMClassifier`.
3. **Confidence Evaluation**: Checks model confidence against `0.75` threshold; routes to Fallback LLM if needed.
4. **Vector Embedding**: Generates 1536-dimensional dense vector embeddings.
5. **pgvector Similarity Matching**: Compares embedding against existing task history to detect continuation of previously discussed tasks.
6. **State Machine Audit**: Logs history events (`CREATED`, `POSTPONED`, `COMPLETED`) in audit log.

---

## 5. Action Item Intelligence & Audit History

Click any Action Item card to open **Action Item Intelligence & Timeline**:
- **Owner & Assignee**: Extracted employee owner mapped to VALIXIS directory.
- **Deadline**: Target completion date (e.g., `Friday`, `2026-09-12`).
- **Status**: `Pending`, `Done`, `Overdue`, `Cancelled`.
- **Audit Trail**: Chronological event log tracking exact wording changes and deadline movement across consecutive meetings.
- **Repeated Postponement Flag**: Automatically highlights tasks postponed $\ge 2$ times with a high-risk warning.

---

## 6. Confidence Scoring & AI Fallback Routing

- High-confidence extractions ($\ge 0.75$) use the ultra-fast local SLM model (< 20ms latency).
- Ambiguous, vague, or complex multi-clause statements route dynamically to Google Gemini API (`gemini-1.5-flash` / `text-embedding-004`).
- Offline local operation uses `HeuristicDenseEmbeddingProvider` to maintain vector similarity matching when external LLM endpoints are unavailable.

---

## 7. Executive Dashboard & Team Workload

- **Overview Cards**: Displays real open, overdue, completed, and postponed task counts.
- **Overloaded Members**: Identifies team members with $> 4$ open tasks or $> 1$ overdue task.
- **Upcoming Deadlines**: Chronological timeline of imminent team commitments.

---

## 8. Postponement Radar & Accountability Graph

- **Postponement Radar**: Surfaces chronic task slipping trends grouped by owner and department.
- **Accountability Graph**: Interactive time-series DAG connecting Meetings $\rightarrow$ Commitments $\rightarrow$ Owners $\rightarrow$ Deadlines $\rightarrow$ Outcomes across time.

---

## 9. Google Drive Automatic Transcript Ingestion

LoopKeeper integrates with Google Drive to automatically discover and ingest Google Meet transcript exports:
- Endpoint `POST /api/v1/integrations/google-drive/sync` scans configured Drive folders.
- Automatic idempotency prevents duplicate meeting creation or duplicate task creation on re-sync.

---

## 10. VALIXIS Portal Data Integration

- LoopKeeper queries the VALIXIS Portal directory (`public.employees`) in **Read-Only** mode via `ValixisRepository`.
- LoopKeeper never mutates or writes to VALIXIS tables.
- Employee profiles (`name`, `email`, `role`, `department`) are referenced via read-only foreign keys.

---

## 11. Capabilities & Boundaries

### What LoopKeeper Infer & Tracks
- Identifies commitments, deadlines, and owners from spoken meeting transcripts.
- Links recurring tasks across meetings even when wording changes (e.g. *"payment API"* $\rightarrow$ *"checkout backend"*).
- Records explicit deadline extensions and calculates postponement frequency.
- Evaluates individual and team workload bottleneck risks.

### What LoopKeeper Cannot Infer
- Does not infer implicit commitments when no spoken or written intent exists in transcripts.
- Does not modify external project management or VALIXIS portal records automatically.
- Does not guess unstated deadlines; unstated deadlines default to `Not specified`.
