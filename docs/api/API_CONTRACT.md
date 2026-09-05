# LoopKeeper Backend REST API Contract

Base URL: `/api/v1`

---

## 1. Health Endpoints

### `GET /api/v1/health`
Check backend operational status and AI engine readiness.
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "service": "LoopKeeper Backend API",
    "ai_pipeline": "ready"
  }
  ```

---

## 2. Meeting Endpoints

### `POST /api/v1/meetings`
Create a new meeting record.
- **Request Body (`MeetingCreate`)**:
  ```json
  {
    "title": "Sprint Sync Meeting",
    "meeting_date": "2026-09-05T10:00:00Z",
    "source": "transcript",
    "external_source_id": "meet-12345",
    "created_by": "11111111-1111-1111-1111-111111111111",
    "participant_ids": ["22222222-2222-2222-2222-222222222222"]
  }
  ```
- **Response `201 Created` (`MeetingResponse`)**

### `POST /api/v1/meetings/{meeting_id}/transcript`
Attach meeting transcript text for processing.
- **Request Body (`TranscriptCreate`)**:
  ```json
  {
    "content": "Action Item: Alice to fix login authentication bug by Friday.",
    "source_file_name": "transcript.vtt",
    "transcript_format": "vtt"
  }
  ```
- **Response `201 Created` (`TranscriptResponse`)**

### `POST /api/v1/meetings/{meeting_id}/process`
Trigger the AI extraction and task matching pipeline on the meeting's transcript.
- **Response `200 OK` (`List[ActionItemResponse]`)**

### `GET /api/v1/meetings`
List all recorded meetings.
- **Response `200 OK` (`List[MeetingResponse]`)**

### `GET /api/v1/meetings/{meeting_id}`
Retrieve detailed meeting record including transcript, participants, and extracted action items.
- **Response `200 OK` (`MeetingDetailResponse`)**

---

## 3. Action Item Endpoints

### `GET /api/v1/action-items`
Query action items with optional filters (`meeting_id`, `owner_employee_id`, `status`).
- **Response `200 OK` (`List[ActionItemResponse]`)**

### `GET /api/v1/action-items/{id}`
Get full detail for an action item including state transition history.
- **Response `200 OK` (`ActionItemDetailResponse`)**

### `PATCH /api/v1/action-items/{id}`
Update status, deadline, owner, title, or description of an action item.
- **Response `200 OK` (`ActionItemResponse`)**

---

## 4. Dashboard Endpoints

### `GET /api/v1/dashboard/overview`
Get overall system task health metrics.
- **Response `200 OK` (`DashboardOverviewResponse`)**

---

## 5. Google Drive Integration Endpoints

### `GET /api/v1/integrations/google-drive/auth-url`
Get server-side Google OAuth 2.0 authorization URL.
- **Response `200 OK`**:
  ```json
  {
    "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "scopes": ["https://www.googleapis.com/auth/drive.readonly"],
    "redirect_uri": "http://localhost:8000/api/v1/integrations/google-drive/callback"
  }
  ```

### `GET /api/v1/integrations/google-drive/status`
Check Google Drive OAuth configuration status.
- **Response `200 OK`**:
  ```json
  {
    "integration": "Google Drive Transcript Ingestion",
    "configured": false,
    "client_id_present": false,
    "scopes": ["https://www.googleapis.com/auth/drive.readonly"],
    "redirect_uri": "http://localhost:8000/api/v1/integrations/google-drive/callback"
  }
  ```

### `POST /api/v1/integrations/google-drive/sync`
Trigger Google Drive transcript discovery, duplicate filtering, ingestion, and AI pipeline processing.
- **Query Parameters**: `folder_id` (optional string)
- **Response `200 OK` (`GoogleDriveSyncResponse`)**:
  ```json
  {
    "sync_started_at": "2026-09-05T00:50:00Z",
    "sync_completed_at": "2026-09-05T00:50:05Z",
    "files_discovered": 2,
    "files_ingested": 2,
    "duplicates_skipped": 0,
    "failed_count": 0,
    "ingested_meeting_ids": ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"],
    "errors": []
  }
  ```

### `POST /api/v1/integrations/google-drive/demo-sync`
Run demo ingestion using synthetic Google Meet export transcripts.
- **Response `200 OK`**
