# LoopKeeper AI Dataset Documentation

## Overview
The LoopKeeper AI dataset provides synthetic meeting transcript snippets labeled with structured commitment and action-item extractions.

## Schema
Each dataset item follows this JSON schema:
```json
{
  "id": "string",
  "scenario": "string",
  "transcript": "string",
  "expected_action_items": [
    {
      "action": "string",
      "owner": "string | Unassigned",
      "deadline": "string | Not specified",
      "status": "pending | done | overdue | cancelled",
      "evidence": "string",
      "confidence": number
    }
  ]
}
```

## Covered Scenarios
- **A. Explicit commitments**: Direct task assignment with owner and deadline.
- **B. Missing owner**: Clear action item without an explicit owner (`Unassigned`).
- **C. Missing deadline**: Clear action item without a target deadline (`Not specified`).
- **D. Relative deadlines**: Dates specified relatively (e.g., "by Friday", "next Monday").
- **E. Completed tasks**: Mentions of completed work (`status: done`).
- **F. Cancelled tasks**: Mentions of abandoned/dropped tasks (`status: cancelled`).
- **G. Tentative non-commitments**: Brainstorming/hypothetical ideas that are NOT commitments (expects 0 action items).
- **H. Multiple action items**: Single transcript line containing multiple distinct tasks.
- **I. Wording variations**: Differently phrased commitments for the same underlying task.
- **J. Postponed deadlines**: Explicit deadline extension requests.
- **K. Repeated postponements**: Consecutive postponements across meetings.
- **L. Ambiguous ownership**: Vague owner statements.
- **M. Multi-party discussions**: Multiple speakers discussing task ownership.
- **N. Follow-up references**: Pronoun and contextual task references (e.g. "I'll finish that").

## Split Strategy
- `train.json`: 14 samples covering all core scenarios.
- `val.json`: 5 samples for validation evaluation.
- `test.json`: 5 samples for blind test evaluation.

## Methodology & Privacy
All examples are synthetically generated using realistic software engineering meeting scenarios. Zero PII or private corporate data is present.
