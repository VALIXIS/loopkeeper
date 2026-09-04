import math
import hashlib
from typing import List
from app.ai.interfaces import EmbeddingProvider
from app.core.config import settings

class DeterministicEmbeddingProvider(EmbeddingProvider):
    def __init__(self, dimension: int = 1536):
        self._dim = dimension

    @property
    def dimension(self) -> int:
        return self._dim

    def generate_embedding(self, text: str) -> List[float]:
        """Generate a deterministic normalized 1536-dimensional embedding vector from input text."""
        if not text:
            return [0.0] * self._dim
        
        # Seed pseudo-random vector generation using SHA-256 hash of string
        hash_bytes = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(hash_bytes[:4], "big")
        
        vec = []
        for i in range(self._dim):
            val = math.sin(seed + i * 0.1)
            vec.append(val)
            
        # Normalize vector to unit length
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
            
        return vec
