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
- **Response `201 Created` (`MeetingResponse`)**:
  ```json
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "title": "Sprint Sync Meeting",
    "meeting_date": "2026-09-05T10:00:00Z",
    "source": "transcript",
    "external_source_id": "meet-12345",
    "created_by": "11111111-1111-1111-1111-111111111111",
    "created_at": "2026-09-05T10:00:00Z",
    "updated_at": "2026-09-05T10:00:00Z"
  }
  ```

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
Query action items with optional filters.
- **Query Parameters**:
  - `meeting_id` (UUID, optional)
  - `owner_employee_id` (UUID, optional)
  - `status` (`pending`, `done`, `overdue`, `cancelled`, optional)
- **Response `200 OK` (`List[ActionItemResponse]`)**

### `GET /api/v1/action-items/{id}`
Get full detail for an action item including state transition history.
- **Response `200 OK` (`ActionItemDetailResponse`)**

### `PATCH /api/v1/action-items/{id}`
Update status, deadline, owner, title, or description of an action item.
- **Request Body (`ActionItemUpdate`)**:
  ```json
  {
    "status": "done",
    "deadline": "2026-09-10T18:00:00Z"
  }
  ```
- **Response `200 OK` (`ActionItemResponse`)**

---

## 4. Dashboard Endpoints

### `GET /api/v1/dashboard/overview`
Get overall system task health metrics.
- **Response `200 OK` (`DashboardOverviewResponse`)**:
  ```json
  {
    "total_open_tasks": 5,
    "overdue_tasks": 1,
    "completed_tasks": 12,
    "repeatedly_postponed_tasks": 2,
    "overloaded_members": [
      {
        "employee_id": "22222222-2222-2222-2222-222222222222",
        "employee_name": "Bob Smith",
        "open_task_count": 4,
        "overdue_task_count": 1
      }
    ],
    "upcoming_deadlines": []
  }
  ```
