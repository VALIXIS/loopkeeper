# LoopKeeper Round 2 — Complete Product & Setup Guide

This document provides the definitive end-to-end setup and operation guide for **LoopKeeper** prepared for the IEEE GENESIS 2026 Round 2 Elimination Evaluation.

---

## 1. Architecture Overview

LoopKeeper is an AI-powered conversational accountability engine. It extracts verbal commitments from meeting recordings/transcripts, tracks their continuity across consecutive meetings, and verifies them against execution evidence (Atlassian Jira Software) to detect **Execution Drift**.

```
[ Meeting Audio / Transcript ] ➔ [ Gemini STT + Dual SLM ] ➔ [ State Engine (Postgres DB) ]
                                                                      │
                                                                      ▼
[ Jury UI / Mobile / Web ] ◄── [ Execution Drift Engine ] ◄── [ Jira Cloud API Proxy ]
```

---

## 2. Environment Setup & Configuration

Copy `.env.example` to `.env` or set environment variables in your deployment environment:

```env
# Production Environment & Security
ENV=production
DEBUG=false
SECRET_KEY=loopkeeper_sec_key_prod_round2_genesis2026
JWT_SECRET=loopkeeper_jwt_secret_genesis2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration (PostgreSQL default, in-memory fallback available)
DATABASE_URL=postgresql://loopkeeper:loopkeeper_pass@localhost:5432/loopkeeper_db

# Multimodal Audio & SLM Engine
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Atlassian Jira Cloud Integration (Configurable via UI or env)
JIRA_DOMAIN=https://your-domain.atlassian.net
JIRA_EMAIL=lead@loopkeeper.ai
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_PROJECT_KEY=LOOP

# Meeting Provider Connectors
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
MS_TEAMS_CLIENT_ID=your_ms_teams_client_id
MS_TEAMS_CLIENT_SECRET=your_ms_teams_client_secret
```

---

## 3. Quickstart & Service Launch Commands

### 3.1 Backend Service (FastAPI)

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate | On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Health Endpoint: `GET http://localhost:8000/health`
- Swagger OpenAPI Specs: `http://localhost:8000/docs`

### 3.2 Web Application (Vite + React + Tailwind)

```bash
cd web
npm install
npm run dev
```
- Local Web Server: `http://localhost:5173`
- Production Build Check: `npm run build`

### 3.3 Mobile Application (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```
- Analyzer Check: `flutter analyze`
- Unit/Widget Tests: `flutter test`

---

## 4. Feature Configuration & API Documentation

### 4.1 Real Jira Cloud Proxy Endpoints

LoopKeeper proxies requests through a secure server-side proxy so API tokens are never exposed to the client.

- **Configure Credentials**: `POST /jira/config`
  ```json
  {
    "jira_domain": "https://loopkeeper.atlassian.net",
    "jira_email": "lead@loopkeeper.ai",
    "jira_api_token": "ATATT...",
    "project_key": "LOOP"
  }
  ```
- **Test Connection**: `POST /jira/test-connection`
- **List Projects**: `GET /jira/projects`
- **Link Action Item to Jira Issue**: `POST /jira/link`
  ```json
  {
    "action_item_id": "a-12345",
    "jira_issue_key": "LOOP-101",
    "jira_status": "In Progress"
  }
  ```
- **Sync Issue Status**: `POST /jira/sync/{action_item_id}`

### 4.2 Meeting Provider OAuth Connectors

Meeting provider connectors allow workspace integration with Google Meet, Microsoft Teams, and Zoom:

- **Initiate Connection**: `POST /integrations/{provider_id}/connect` (`google-meet`, `ms-teams`, `zoom`)
- **Disconnect**: `POST /integrations/{provider_id}/disconnect`
- **Sync Provider**: `POST /integrations/{provider_id}/sync`

### 4.3 Multimodal Gemini Speech-to-Text Pipeline

Audio recorded in the web studio or mobile app is transcribed using the `TranscriptionService`:

- Powered by `gemini-1.5-flash` audio processing with structured fallback.
- Accepts raw audio formats (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`).
- Multi-stage pipeline progress: `uploading` ➔ `transcribing` ➔ `extracting` ➔ `persisting` ➔ `drift_analysis`.

### 4.4 Execution Truth Layer & Health Score

Evaluates commitment health on a 0–100 scale:

- **Health Status Categories**:
  - `Healthy` (Score 80–100): On track with matching execution evidence.
  - `At Risk` (Score 60–79): Approaching deadline or single postponement.
  - `Drifting` (Score 40–59): Postponed 2+ times or status mismatch with Jira.
  - `Critical` (Score 0–39): Overdue or verbal completion claim contradicted by Jira 'To Do' status.
- **Endpoint**: `GET /accountability/health/{action_item_id}`
- **Execution Drift Endpoint**: `GET /accountability/execution-drift/{action_item_id}`

---

## 5. End-to-End Jury Verification Flow

To demonstrate the full LoopKeeper lifecycle to hackathon judges:

1. **Start Backend**: Launch `uvicorn app.main:app` on port 8000.
2. **Open Web Dashboard**: Navigate to `http://localhost:5173`.
3. **Configure Integrations**: Open the **Integrations** tab, click **Connect Bridge** on Atlassian Jira, enter domain and credentials, click **Test Connection**, then **Verify & Connect**.
4. **Record Meeting**: Go to **Recording Studio**, record a live session or simulate turns (e.g. *"Alice will finalize the pgvector cosine distance indexing by Friday"*). Click **Stop & Extract AI Commitments**.
5. **View Multi-Stage Pipeline**: Observe the 5-stage live status indicator overlay.
6. **Dual-Pane Evidence Viewer**: Open the newly created meeting. Select a commitment to highlight its exact quote in the transcript.
7. **Execution Drift Verification**: Open an action item linked to Jira (e.g. `LOOP-101`) where the verbal status is "Done" but Jira is "In Progress". View the flagged **Execution Drift Alert** and health degradation.

---

## 6. Verification Status

| Component | Status | Command | Result |
|-----------|--------|---------|--------|
| Backend Pytest | **PASS** | `pytest` | 51/51 passed |
| Web Build | **PASS** | `npm run build` | 0 errors |
| Flutter Analyze | **PASS** | `flutter analyze` | 0 issues |
| Flutter Test | **PASS** | `flutter test` | 11/11 passed |

*Prepared for IEEE GENESIS 2026 Hackathon — Round 2.*
