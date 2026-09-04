# Architecture

## System Overview
LoopKeeper is designed as a premium full-stack product connecting meeting notes/transcripts to persistent task accountability.

## Component Architectures
- **Web → Backend → Database:** The React web app communicates with the FastAPI backend via REST. The backend manages state in a PostgreSQL database.
- **Mobile → Backend → Database:** The Flutter mobile app uses the same REST APIs as the web app to ensure consistent data and state.
- **AI/SLM → Fallback LLM:** A small language model (SLM) is used primarily for task extraction and semantic matching. If the SLM fails or encounters high ambiguity, the system falls back to an LLM API.
- **Meeting Transcript → AI → Task State Pipeline:** Transcripts are ingested, passed to the AI layer to extract owner, deadline, and status, and matched semantically (using pgvector) against existing tasks to maintain continuity even when wording changes.

## Integration Boundaries
- **VALIXIS Portal Integration:** Clearly defined API endpoints will be used for VALIXIS Portal integration.
- **Future Google Drive/Meet Integration:** External integrations must use authorized APIs. No hacky workarounds for integrations.

## Separation of Concerns
There is a strict separation between AI inference and application logic. The backend acts as the orchestrator, while the ML/AI layer is a decoupled service or module.
