import os
import json
import logging
from typing import Dict, Any, List
from ml.preprocessing.transcript_preprocessor import TranscriptPreprocessor

logger = logging.getLogger("ml.inference")

class SLMInferenceWrapper:
    def __init__(self, model_dir: str = "ml/models"):
        self.model_dir = model_dir
        self.model_weights = self._load_model_artifacts()

    def _load_model_artifacts(self) -> Dict[str, Any]:
        path = os.path.join(self.model_dir, "slm_weights.json")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    logger.info(f"Loaded specialized SLM model weights from {path}")
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Error loading model artifacts: {e}. Falling back to default inference.")
        else:
            logger.info(f"No custom model artifact found at {path}. Using base inference engine.")
        return {}

    def predict(self, transcript_text: str) -> List[Dict[str, Any]]:
        """Run specialized SLM model inference on transcript text."""
        clean_text = TranscriptPreprocessor.clean_text(transcript_text)
        if not clean_text:
            return []

        # Utilize preprocessing to format model prompt
        prompt = TranscriptPreprocessor.prepare_model_prompt(clean_text)

        # Import backend SLMProvider logic
        from app.ai.extraction import SLMProvider
        provider = SLMProvider()
        result = provider.extract_action_items(clean_text)

        output_items = []
        for item in result.action_items:
            item_dict = {
                "action": item.title,
                "owner": item.owner_name,
                "deadline": item.deadline,
                "status": item.status,
                "evidence": item.source_text,
                "confidence": item.confidence
            }
            if TranscriptPreprocessor.validate_target_item(item_dict):
                output_items.append(item_dict)

        return output_items
