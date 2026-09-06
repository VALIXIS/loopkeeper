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

        # Run SLM model inference
        predictions = self.inference_engine.predict(transcript)

        items: List[ExtractedActionItem] = []
        for p in predictions:
            status_val = p.get('status', 'pending')
            # Ensure status defaults to pending if model produces invalid status
            if status_val not in ['pending', 'done', 'overdue', 'cancelled']:
                status_val = 'pending'
            items.append(
                ExtractedActionItem(
                    title=p['action'],
                    description=p['evidence'],
                    owner_name=p['owner'],
                    deadline=p['deadline'],
                    status=status_val,
                    source_text=p['evidence'],
                    confidence=0.5 if self.force_low_confidence else p['confidence']
                )
            )

        # If model returned no items or invalid items, perform heuristic rule extraction
        if not items:
            lines = transcript.splitlines()
            for line in lines:
                line_clean = line.strip()
                if not line_clean:
                    continue
                lower = line_clean.lower()
                if any(k in lower for k in ["todo", "action item", "will finish", "will complete", "i will", "i'll", "i commit", "assigned to", "deliver", "fix", "refactor", "complete", "responsible for", "going to"]):
                    owner = "Unassigned"
                    owner_match = re.search(r'(?i:assigned to|owner:?|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', line_clean)
                    if not owner_match:
                        owner_match = re.search(r'(?:^|,\s*|\b)([A-Z][a-z]+)\s+(?:said|will|has|is|completed|agreed)', line_clean)
                    if owner_match:
                        cand = owner_match.group(1).strip()
                        if cand.lower() not in ["google drive", "api", "oauth", "postgres", "postgresql", "docker", "github", "database"]:
                            owner = cand

                    deadline = "Not specified"
                    deadline_match = re.search(r'(?:by|due|deadline:?|move to|pushing to|before)\s+([A-Za-z0-9\s/-]+?)(?:\s+(?:for|assigned\s+to|owner:?|said|will|has|is|completed|agreed)|[\.,]|$)', line_clean, re.IGNORECASE)
                    if deadline_match:
                        deadline = deadline_match.group(1).strip()

                    status_val = "pending"
                    if any(k in lower for k in ["completed", "finished", "done"]):
                        status_val = "done"
                    elif any(k in lower for k in ["cancelled", "abandoned", "dropped"]):
                        status_val = "cancelled"

                    items.append(
                        ExtractedActionItem(
                            title=line_clean[:80],
                            description=line_clean,
                            owner_name=owner,
                            deadline=deadline,
                            status=status_val,
                            source_text=line_clean,
                            confidence=0.50 if self.force_low_confidence else 0.85
                        )
                    )

        if not items:
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
        if getattr(settings, "GEMINI_API_KEY", "") and getattr(settings, "GEMINI_API_KEY", "").strip():
            return "gemini"
        return settings.FALLBACK_PROVIDER

    @property
    def model_name(self) -> str:
        if getattr(settings, "GEMINI_API_KEY", "") and getattr(settings, "GEMINI_API_KEY", "").strip():
            return "gemini-1.5-flash"
        return "local-rule-fallback"

    def extract_action_items(self, transcript: str) -> ExtractionResult:
        start_time = time.time()
        import requests
        import json
        
        if getattr(settings, "GEMINI_API_KEY", "") and getattr(settings, "GEMINI_API_KEY", "").strip():
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={getattr(settings, 'GEMINI_API_KEY', '')}"
                prompt = (
                    "Extract action items from transcript. Respond ONLY with a JSON array of objects: "
                    "[{\"action\": \"...\", \"owner\": \"...\", \"deadline\": \"...\", \"status\": \"pending\"}].\n"
                    f"Transcript: {transcript}"
                )
                payload = {"contents": [{"parts": [{"text": prompt}]}]}
                resp = requests.post(url, json=payload, timeout=5.0)
                if resp.status_code == 200:
                    text_resp = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                    match = re.search(r"\[.*\]", text_resp, re.DOTALL)
                    if match:
                        parsed = json.loads(match.group(0))
                        items = []
                        for obj in parsed:
                            items.append(ExtractedActionItem(
                                title=obj.get("action", transcript[:50]),
                                description=transcript,
                                owner_name=obj.get("owner", "Unassigned"),
                                deadline=obj.get("deadline", "Not specified"),
                                status=obj.get("status", "pending"),
                                source_text=transcript,
                                confidence=0.95
                            ))
                        return ExtractionResult(
                            action_items=items,
                            raw_response="Gemini LLM extraction complete",
                            confidence=0.95,
                            provider_used="gemini",
                            fallback_used=True,
                            latency_ms=int((time.time() - start_time) * 1000),
                            model_name="gemini-1.5-flash"
                        )
            except Exception:
                pass

        items: List[ExtractedActionItem] = []
        clauses = []
        for line in transcript.splitlines():
            line_clean = line.strip()
            if not line_clean:
                continue
            if " and " in line_clean:
                parts = line_clean.split(" and ")
                clauses.extend([p.strip() for p in parts if p.strip()])
            else:
                clauses.append(line_clean)

        for clause in clauses:
            owner = "Unassigned"
            owner_match = re.search(r'(?i:assigned to|owner:?|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', clause)
            if not owner_match:
                owner_match = re.search(r'(?:^|,\s*|\b)([A-Z][a-z]+)\s+(?:said|will|has|is|completed|agreed)', clause)
            if owner_match:
                cand = owner_match.group(1).strip()
                if cand.lower() not in ["google drive", "api", "oauth", "postgres", "postgresql", "docker", "github", "database"]:
                    owner = cand
            
            deadline = "Not specified"
            deadline_match = re.search(r'(?:by|due|deadline:?|move\s+(?:it\s+)?to|pushing\s+to|push\s+to|before)\s+([A-Za-z0-9\s/-]+?)(?:\s+(?:for|assigned\s+to|owner:?|said|will|has|is|completed|agreed)|[\.,]|$)', clause, re.IGNORECASE)
            if deadline_match:
                deadline = deadline_match.group(1).strip()
                deadline = re.sub(r'^(?:to\s+)+', '', deadline, flags=re.IGNORECASE).strip()

            status = "pending"
            clause_lower = clause.lower()
            if any(k in clause_lower for k in ["completed", "finished", "done"]):
                status = "done"
            elif any(k in clause_lower for k in ["abandoning", "cancelled", "dropped"]):
                status = "cancelled"

            items.append(
                ExtractedActionItem(
                    title=clause[:80],
                    description=clause,
                    owner_name=owner,
                    deadline=deadline,
                    status=status,
                    source_text=clause,
                    confidence=0.88
                )
            )

        latency = int((time.time() - start_time) * 1000)
        return ExtractionResult(
            action_items=items,
            raw_response="Local rule fallback extraction complete",
            confidence=0.88,
            provider_used=self.provider_name,
            fallback_used=True,
            latency_ms=latency,
            model_name=self.model_name
        )
