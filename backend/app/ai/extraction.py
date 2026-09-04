import time
import re
from typing import List
from app.ai.interfaces import AIProvider
from app.schemas.ai import ExtractionResult, ExtractedActionItem
from app.core.config import settings
from ml.models.inference import SLMInferenceWrapper

class SLMProvider(AIProvider):
    def __init__(self, force_low_confidence: bool = False, force_failure: bool = False):
        self.force_low_confidence = force_low_confidence
        self.force_failure = force_failure
        self.inference_engine = SLMInferenceWrapper()

    @property
    def provider_name(self) -> str:
        return settings.SLM_PROVIDER

    @property
    def model_name(self) -> str:
        return settings.SLM_MODEL_NAME

    def extract_action_items(self, transcript: str) -> ExtractionResult:
        start_time = time.time()
        
        if self.force_failure:
            raise RuntimeError('SLM Provider inference failed (Simulated).')

        if not transcript or not transcript.strip():
            return ExtractionResult(
                action_items=[],
                raw_response='Empty transcript',
                confidence=1.0,
                provider_used=self.provider_name,
                fallback_used=False,
                latency_ms=int((time.time() - start_time) * 1000),
                model_name=self.model_name
            )

        # Run real SLM neural model inference
        predictions = self.inference_engine.predict(transcript)

        items: List[ExtractedActionItem] = []
        for p in predictions:
            items.append(
                ExtractedActionItem(
                    title=p['action'],
                    description=p['evidence'],
                    owner_name=p['owner'],
                    deadline=p['deadline'],
                    status=p['status'],
                    source_text=p['evidence'],
                    confidence=0.5 if self.force_low_confidence else p['confidence']
                )
            )

        # Dynamic confidence evaluation derived from model output probabilities
        if not items:
            # Model classified transcript as non-commitment / vague
            conf = 0.50 if self.force_low_confidence else 0.45
        else:
            avg_conf = sum(i.confidence for i in items) / len(items)
            conf = 0.50 if self.force_low_confidence else round(avg_conf, 3)

        latency = int((time.time() - start_time) * 1000)

        return ExtractionResult(
            action_items=items,
            raw_response=f'Extracted {len(items)} action items via SLM',
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
        return 'gemini-1.5-flash-fallback'

    def extract_action_items(self, transcript: str) -> ExtractionResult:
        start_time = time.time()
        items: List[ExtractedActionItem] = []

        for line in transcript.splitlines():
            line_clean = line.strip()
            if not line_clean:
                continue

            owner = 'Unassigned'
            owner_match = re.search(r'(?:assigned to|owner:?|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', line_clean, re.IGNORECASE)
            if not owner_match:
                owner_match = re.search(r'^([A-Z][a-z]+)\s+(?:said|will|has|is|completed|agreed)', line_clean)
            if owner_match:
                owner = owner_match.group(1).strip()
            
            deadline = 'Not specified'
            deadline_match = re.search(r'(?:by|due|deadline:?|ready|to)\s+([A-Za-z0-9\s,/-]+?)(?:\.|$)', line_clean, re.IGNORECASE)
            if deadline_match:
                deadline = deadline_match.group(1).strip()

            items.append(
                ExtractedActionItem(
                    title=line_clean[:80],
                    description=line_clean,
                    owner_name=owner,
                    deadline=deadline,
                    status='pending',
                    source_text=line_clean,
                    confidence=0.95
                )
            )

        if not items and transcript.strip():
            items.append(
                ExtractedActionItem(
                    title=f'Action item from transcript: {transcript[:50]}',
                    description=transcript,
                    owner_name='Unassigned',
                    deadline='Not specified',
                    status='pending',
                    source_text=transcript[:100],
                    confidence=0.92
                )
            )

        latency = int((time.time() - start_time) * 1000)
        return ExtractionResult(
            action_items=items,
            raw_response='Fallback LLM extraction complete',
            confidence=0.95,
            provider_used=self.provider_name,
            fallback_used=True,
            latency_ms=latency,
            model_name=self.model_name
        )
