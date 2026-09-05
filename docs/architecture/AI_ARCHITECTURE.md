# LoopKeeper AI Architecture & Pipeline Specification

## 1. Executive Overview
The LoopKeeper AI Engine processes meeting transcripts to extract structured action items, determine task owners and deadlines, track task state transitions across consecutive meetings, detect repeatedly postponed tasks, and flag overloaded team members.

The architecture strictly decouples application business logic from AI inference providers, allowing seamless experimentation with specialized Small Language Models (SLMs) without disturbing core backend APIs.

---

## 2. End-to-End AI Pipeline Flow

```
Meeting Transcript Text
        │
        ▼
1. Preprocessing & Input Sanitization
        │
        ▼
2. Action Item Extraction (SLM Provider)
        │
        ├──────────── Confidence < 0.75 or SLM Error? ────┐
        │                                                 ▼
        │                                  Fallback LLM Provider
        ▼                                                 │
3. Confidence Evaluation & Validation <───────────────────┘
   - Default owner -> "Unassigned"
   - Default deadline -> "Not specified"
        │
        ▼
4. Embedding Generation (1536-Dimension Vector)
        │
        ▼
5. Task Matching Engine (Semantic Vector Similarity + Contextual Rules)
        │
        ├── MATCHED   ──> Update existing task & log meeting history event
        ├── NEW       ──> Create new action item & log match decision
        └── UNCERTAIN ──> Flag for human review
        │
        ▼
6. Telemetry & AI Run Logging (`loopkeeper_ai_runs`)
```

---

## 3. Provider Abstraction Architecture

### `AIProvider` Interface
LoopKeeper defines a clean abstraction for inference models:
- **`SLMProvider`**: Default lightweight specialized Small Language Model.
- **`FallbackLLMProvider`**: Commercial LLM API (e.g. Gemini 1.5 Flash / OpenAI) triggered when SLM confidence drops below the configured threshold (0.75).

### Configuration (`app/core/config.py`)
- `SLM_MODEL_NAME`: `loopkeeper-slm-v1`
- `CONFIDENCE_THRESHOLD`: `0.75`
- `FALLBACK_ENABLED`: `true`
- `MAX_INPUT_LENGTH`: `8192`
- `EMBEDDING_MODEL_NAME`: `text-embedding-3-small`
- `EMBEDDING_DIMENSION`: `1536`

---

## 4. Confidence Evaluation & Fallback Mechanism
- The `ConfidenceEvaluator` rates extractions on a 0.0 – 1.0 scale based on:
  1. Structural completeness.
  2. Owner clarity (penalized if generic).
  3. Deadline specificity.
  4. Provider intrinsic score.
- If confidence score < `0.75`, the `FallbackHandler` routes the input to the `FallbackLLMProvider`.
- Every inference run is recorded in `loopkeeper_ai_runs` storing model name, provider, latency, confidence, fallback flag, and input hash.

---

## 5. Embedding Model & Vector Matching Strategy
- **Selected Model**: `text-embedding-3-small` (or Gemini `text-embedding-004` format).
- **Dimension**: **1536**. Matches the PostgreSQL `pgvector` definition (`vector(1536)`) established in `001_loopkeeper_schema.sql`.
- **Matching Engine**: Combines HNSW cosine vector similarity search with contextual heuristics:
  - Title word overlap boost.
  - Owner alignment boost/penalty.
  - Decision Outputs: `MATCHED`, `NEW`, or `UNCERTAIN`.

---

## 6. State Machine & Task History
Supported states: `pending`, `done`, `overdue`, `cancelled`.
Supported events: `created`, `updated`, `deadline_changed`, `owner_changed`, `status_changed`, `postponed`, `completed`, `reopened`.
- **Repeated Postponement Detection**: A task is flagged as repeatedly postponed when `postponed` or `deadline_changed` events occur **2 or more times** in `loopkeeper_action_item_history`.

---

## 7. VALIXIS Integration Boundary
- LoopKeeper reads employee profiles (`employees`) and existing system tasks (`tasks`) from VALIXIS in a **strict Read-Only mode**.
- No write operations, schema modifications, or RLS policy changes are permitted on VALIXIS tables.
- All credentials remain server-side; API keys are never exposed to frontend clients.
