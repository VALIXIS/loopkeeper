from abc import ABC, abstractmethod
from typing import List
from app.schemas.ai import ExtractionResult

class AIProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    @abstractmethod
    def extract_action_items(self, transcript: str) -> ExtractionResult:
        """Extract structured action items from transcript text."""
        pass

class EmbeddingProvider(ABC):
    @property
    @abstractmethod
    def dimension(self) -> int:
        pass

    @abstractmethod
    def generate_embedding(self, text: str) -> List[float]:
        """Generate vector embedding for a given text string."""
        pass
