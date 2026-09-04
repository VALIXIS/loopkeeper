from app.ai.interfaces import AIProvider
from app.ai.extraction import SLMProvider, FallbackLLMProvider
from app.ai.confidence import ConfidenceEvaluator
from app.schemas.ai import ExtractionResult
from app.core.config import settings
from app.core.logging import logger

class FallbackHandler:
    def __init__(self, slm_provider: AIProvider = None, fallback_provider: AIProvider = None, confidence_evaluator: ConfidenceEvaluator = None):
        self.slm_provider = slm_provider or SLMProvider()
        self.fallback_provider = fallback_provider or FallbackLLMProvider()
        self.evaluator = confidence_evaluator or ConfidenceEvaluator()

    def process(self, transcript: str) -> ExtractionResult:
        """Process transcript using SLM first, falling back to LLM if needed."""
        fallback_needed = False
        result = None

        try:
            result = self.slm_provider.extract_action_items(transcript)
            eval_confidence = self.evaluator.evaluate(result)
            result.confidence = eval_confidence

            if eval_confidence < settings.CONFIDENCE_THRESHOLD and settings.FALLBACK_ENABLED:
                logger.info(f"SLM confidence ({eval_confidence}) < threshold ({settings.CONFIDENCE_THRESHOLD}). Triggering Fallback LLM.")
                fallback_needed = True
        except Exception as e:
            logger.warning(f"SLM extraction error: {str(e)}. Triggering Fallback LLM.")
            fallback_needed = True

        if fallback_needed:
            result = self.fallback_provider.extract_action_items(transcript)
            eval_confidence = self.evaluator.evaluate(result)
            result.confidence = eval_confidence
            result.fallback_used = True

        return result
