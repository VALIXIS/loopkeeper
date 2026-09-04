# Google Drive Transcript Ingestion Pipeline

## 1. Overview & Architecture
LoopKeeper integrates with Google Drive to discover, ingest, and process Google Meet export transcripts through the core AI Engine.

```
Google Meet
    ↓ (Export Transcript)
Google Drive
    ↓ (Discovery & Download)
GoogleDriveIngestionService
    ├─ Idempotency Check (File ID & Content Hash Duplicate Filter)
    ├─ GoogleMeetTranscriptParser (VTT / TXT Speaker Attribution)
    └─ Speaker Participant Matcher (READ-ONLY VALIXIS Employees)
    ↓
Meeting Creation (`loopkeeper_meetings`)
    ↓
AI Pipeline Orchestrator (SLM / Fallback LLM / pgvector Semantic Matching)
    ↓
Persistent Task Accountability State
```

---

## 2. Google Cloud Setup & OAuth Configuration

### Required Scopes (Minimum Privilege)
- `https://www.googleapis.com/auth/drive.readonly`

### Environment Variables (`backend/.env`)
```bash
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/integrations/google-drive/callback
GOOGLE_DRIVE_FOLDER_ID=optional-folder-id-filter
```

> **Security Note**: All Google API keys, client secrets, and access tokens are kept strictly server-side. No Google credentials are ever exposed to client frontends or committed to source control.

---

## 3. Duplicate Protection & Idempotency
To prevent creating duplicate meetings and action items during repeated sync calls:
- Unique External Source ID stored in `loopkeeper_meetings`: `gdrive_{file_id}`
- Transcript Content Hashing (SHA-256): `hash_{sha256}`
- If a file ID or content hash is already registered in LoopKeeper, the ingestion service skips it without re-processing.

---

## 4. Speaker Preservation & VALIXIS Employee Matching
The parser preserves speaker attribution (e.g. `[10:32] Rahul: "..."`).
- Extracted speaker names are resolved against the **Read-Only** VALIXIS `employees` table.
- Confidently matched speakers are linked as meeting participants (`loopkeeper_meeting_participants`).
- Unresolved speakers are preserved under their original raw name without guessing identity.

---

## 5. Endpoints & API Usage

- `GET /api/v1/integrations/google-drive/auth-url`: Returns OAuth authorization URL.
- `GET /api/v1/integrations/google-drive/status`: Returns integration status & scope config.
- `POST /api/v1/integrations/google-drive/sync`: Triggers Google Drive transcript discovery & sync.
- `POST /api/v1/integrations/google-drive/demo-sync`: Triggers deterministic Hackathon Demo ingestion using synthetic transcripts.

---

## 6. Hackathon Demo Mode
Run the deterministic demo via:
```bash
POST /api/v1/integrations/google-drive/demo-sync
```
Or command line:
```bash
python scripts/demo_pipeline.py
```
This ingests synthetic transcript files from `demo_data/google_drive/` simulating multi-meeting task continuity, same-task recognition, deadline postponements, and history auditing without requiring live Google Cloud OAuth credentials.
