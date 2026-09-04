import time
import re
from typing import List
from app.ai.interfaces import AIProvider
from app.schemas.ai import ExtractionResult, ExtractedActionItem
from app.core.config import settings

class SLMProvider(AIProvider):
    def __init__(self, force_low_confidence: bool = False, force_failure: bool = False):
        self.force_low_confidence = force_low_confidence
        self.force_failure = force_failure

    @property
    def provider_name(self) -> str:
        return settings.SLM_PROVIDER

    @property
    def model_name(self) -> str:
        return settings.SLM_MODEL_NAME

    def extract_action_items(self, transcript: str) -> ExtractionResult:
        start_time = time.time()
        
        if self.force_failure:
            raise RuntimeError("SLM Provider inference failed (Simulated).")

        if not transcript or not transcript.strip():
            return ExtractionResult(
                action_items=[],
                raw_response="Empty transcript",
                confidence=1.0,
                provider_used=self.provider_name,
                fallback_used=False,
                latency_ms=int((time.time() - start_time) * 1000),
                model_name=self.model_name
            )

        items: List[ExtractedActionItem] = []
        lines = transcript.splitlines()

        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                continue
            
            # Match common action item patterns like "Action Item: ...", "TODO: ...", "- [ ] ...", or sentences containing "will do", "assigned to"
            if any(keyword in line_clean.lower() for keyword in ["action item", "todo", "will", "needs to", "assigned to", "by tomorrow", "by Friday"]):
                # Extract owner
                owner = "Unassigned"
                owner_match = re.search(r'(?:assigned to|owner:?|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', line_clean, re.IGNORECASE)
                if owner_match:
                    owner = owner_match.group(1).strip()
                
                # Extract deadline
                deadline = "Not specified"
                deadline_match = re.search(r'(?:by|due|deadline:?)\s+([A-Za-z0-9\s,/-]+?)(?:\.|$)', line_clean, re.IGNORECASE)
                if deadline_match:
                    deadline = deadline_match.group(1).strip()

                items.append(
                    ExtractedActionItem(
                        title=line_clean[:80],
                        description=line_clean,
                        owner_name=owner,
                        deadline=deadline,
                        status="pending",
                        source_text=line_clean,
                        confidence=0.6 if self.force_low_confidence else 0.9
                    )
                )

        # Default fallback if no specific keywords matched
        if not items and len(transcript.strip()) > 0:
            items.append(
                ExtractedActionItem(
                    title=f"Review transcript notes: {transcript.strip()[:50]}",
                    description=transcript.strip(),
                    owner_name="Unassigned",
                    deadline="Not specified",
                    status="pending",
                    source_text=transcript.strip()[:100],
                    confidence=0.5 if self.force_low_confidence else 0.85
                )
            )

        conf = 0.5 if self.force_low_confidence else 0.88
        latency = int((time.time() - start_time) * 1000)

        return ExtractionResult(
            action_items=items,
            raw_response=f"Extracted {len(items)} action items",
            confidence=conf,
            provider_used=self.provider_name,
            fallback_used=False,
            latency_ms=latency,
            model_name=self.model_name
        )


class FallbackLLMProvider(AIProvider):
    @property
    def provider_name(self) -> str:
        return settings.FALLBACK_PROVIDER

    @property
    def model_name(self) -> str:
        return "gemini-1.5-flash-fallback"

    def extract_action_items(self, transcript: str) -> ExtractionResult:
        start_time = time.time()
        items: List[ExtractedActionItem] = []

        for line in transcript.splitlines():
            line_clean = line.strip()
            if not line_clean:
                continue

            owner = "Unassigned"
            owner_match = re.search(r'(?:assigned to|owner:?|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', line_clean, re.IGNORECASE)
            if owner_match:
                owner = owner_match.group(1).strip()
            
            deadline = "Not specified"
            deadline_match = re.search(r'(?:by|due|deadline:?)\s+([A-Za-z0-9\s,/-]+?)(?:\.|$)', line_clean, re.IGNORECASE)
            if deadline_match:
                deadline = deadline_match.group(1).strip()

            items.append(
                ExtractedActionItem(
                    title=line_clean[:80],
                    description=line_clean,
                    owner_name=owner,
                    deadline=deadline,
                    status="pending",
                    source_text=line_clean,
                    confidence=0.95
                )
            )

        if not items and transcript.strip():
            items.append(
                ExtractedActionItem(
                    title=f"Action item from transcript: {transcript[:50]}",
                    description=transcript,
                    owner_name="Unassigned",
                    deadline="Not specified",
                    status="pending",
                    source_text=transcript[:100],
                    confidence=0.92
                )
            )

        latency = int((time.time() - start_time) * 1000)
        return ExtractionResult(
            action_items=items,
            raw_response="Fallback LLM extraction complete",
            confidence=0.95,
            provider_used=self.provider_name,
            fallback_used=True,
            latency_ms=latency,
            model_name=self.model_name
        )
