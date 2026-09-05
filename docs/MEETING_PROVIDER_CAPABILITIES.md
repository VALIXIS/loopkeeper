# LoopKeeper Meeting Platform Capability Matrix

This matrix documents the end-to-end integration capabilities for **Google Meet**, **Zoom**, and **Microsoft Teams** in LoopKeeper's AI meeting accountability engine.

| Capability | Google Meet | Zoom | Microsoft Teams |
| :--- | :---: | :---: | :---: |
| **OAuth 2.0 Auth Flow** | `Supported` | `Supported` | `Supported` |
| **Encrypted Token Storage** | `Supported` | `Supported` | `Supported` |
| **Meeting Metadata** | `Supported` | `Supported` | `Supported` |
| **Participants** | `Supported` | `Supported` | `Supported` |
| **Recording Discovery** | `Supported` | `Supported` | `Supported` |
| **Transcript Retrieval** | `Supported` | `Supported` | `Supported` |
| **Ingestion Pipeline** | `Supported` | `Supported` | `Supported` |
| **Duplicate Protection** | `Supported` | `Supported` | `Supported` |
| **Webhook / Events** | `N/A` | `Supported` (HMAC SHA-256) | `Supported` |
| **Admin Consent State Detection** | `N/A` | `N/A` | `Supported` (AADSTS65001) |

---

## Connector Details

### 1. Google Meet / Google Drive Connector
- **OAuth Endpoint**: `https://accounts.google.com/o/oauth2/v2/auth`
- **Token Endpoint**: `https://oauth2.googleapis.com/token`
- **Required Scopes**: `https://www.googleapis.com/auth/drive.readonly`, `https://www.googleapis.com/auth/calendar.readonly`, `https://www.googleapis.com/auth/userinfo.email`
- **Artifact Discovery**: Reads `.vtt` and `.txt` transcript artifacts from Google Drive folder (`GOOGLE_DRIVE_FOLDER_ID`).
- **Duplicate Key**: `google_meet_{file_id}`

### 2. Zoom Connector
- **OAuth Endpoint**: `https://zoom.us/oauth/authorize`
- **Token Endpoint**: `https://zoom.us/oauth/token` (HTTP Basic Auth)
- **Capabilities**: `meeting:read`, `recording:read`, `user:read`
- **Webhook Endpoint**: `/api/v1/integrations/zoom/webhook` (HMAC SHA-256 header verification using `ZOOM_WEBHOOK_SECRET_TOKEN`)
- **Duplicate Key**: `zoom_{meeting_id}`

### 3. Microsoft Teams Connector
- **OAuth / Entra ID Endpoint**: `https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize`
- **Token Endpoint**: `https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token`
- **Scopes**: `OnlineMeetings.Read`, `CallTranscripts.Read.All`, `User.Read`, `offline_access`
- **Admin Consent Handling**: Detects `AADSTS65001` error response and flags status as `admin_consent_required`.
- **Duplicate Key**: `ms_teams_{meeting_id}`
