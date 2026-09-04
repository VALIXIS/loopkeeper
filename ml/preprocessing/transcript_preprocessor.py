import re
from typing import Dict, Any, Optional

class TranscriptPreprocessor:
    """Preprocesses raw transcript strings and formats dataset examples for model training and inference."""

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        # Remove extra whitespace while preserving linebreaks and basic punctuation
        lines = [line.strip() for line in text.splitlines()]
        cleaned = "\n".join([line for line in lines if line])
        # Replace multiple spaces with single space
        cleaned = re.sub(r'[ \t]+', ' ', cleaned)
        return cleaned.strip()

    @staticmethod
    def prepare_model_prompt(transcript: str) -> str:
        """Format input transcript into the instruction prompt expected by the SLM extraction model."""
        cleaned = TranscriptPreprocessor.clean_text(transcript)
        prompt = (
            "Extract all action items from the following meeting transcript into a structured format.\n"
            "If an owner is not mentioned, use 'Unassigned'. If a deadline is not mentioned, use 'Not specified'.\n\n"
            f"Transcript:\n{cleaned}\n\n"
            "Extracted Action Items:"
        )
        return prompt

    @staticmethod
    def validate_target_item(item: Dict[str, Any]) -> bool:
        """Validate if a dictionary adheres to the required Action Item target schema."""
        required_keys = {"action", "owner", "deadline", "status"}
        if not isinstance(item, dict):
            return False
        if not required_keys.issubset(item.keys()):
            return False
        if not item.get("action") or not isinstance(item["action"], str):
            return False
        if item["status"] not in {"pending", "done", "overdue", "cancelled"}:
            return False
        return True
