import math
import re
import hashlib
import logging
from typing import List, Optional
import requests
from app.ai.interfaces import EmbeddingProvider
from app.core.config import settings

logger = logging.getLogger('app.ai.embeddings')

class SemanticEmbeddingProvider(EmbeddingProvider):
    def __init__(self, dimension: int = 1536):
        self._dim = dimension
        self.local_provider = SemanticDenseEmbeddingProvider(dimension=dimension)

    @property
    def dimension(self) -> int:
        return self._dim

    def generate_embedding(self, text: str) -> List[float]:
        if not text or not text.strip():
            return [0.0] * self._dim

        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
            try:
                url = f'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}'
                payload = {
                    'model': 'models/text-embedding-004',
                    'content': {'parts': [{'text': text}]}
                }
                resp = requests.post(url, json=payload, timeout=3.0)
                if resp.status_code == 200:
                    data = resp.json()
                    values = data.get('embedding', {}).get('values', [])
                    if values:
                        if len(values) < self._dim:
                            values = values + [0.0] * (self._dim - len(values))
                        elif len(values) > self._dim:
                            values = values[:self._dim]
                        norm = math.sqrt(sum(v * v for v in values))
                        if norm > 0:
                            values = [v / norm for v in values]
                        return values
            except Exception as e:
                logger.warning(f'Gemini Embedding API call failed: {e}')

        return self.local_provider.generate_embedding(text)


class SemanticDenseEmbeddingProvider(EmbeddingProvider):
    def __init__(self, dimension: int = 1536):
        self._dim = dimension
        self.concept_groups = [
            ['payment', 'pay', 'checkout', 'stripe', 'billing', 'transaction', 'gateway', 'api'],
            ['auth', 'authentication', 'login', 'oauth', 'token', 'jwt', 'security'],
            ['database', 'db', 'postgres', 'supabase', 'pool', 'timeout', 'sql', 'redis', 'cache'],
            ['frontend', 'ui', 'css', 'layout', 'screen', 'dashboard', 'settings'],
            ['backend', 'service', 'endpoint', 'microservice', 'parser', 'xml', 'json']
        ]

    @property
    def dimension(self) -> int:
        return self._dim

    def generate_embedding(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self._dim
        
        words = re.findall(r'\w+', text.lower())
        vec = [0.0] * self._dim
        
        for g_idx, group in enumerate(self.concept_groups):
            score = sum(1.0 for w in words if w in group)
            if score > 0:
                base_pos = (g_idx * 250) % self._dim
                for i in range(200):
                    vec[(base_pos + i) % self._dim] += score * math.sin((g_idx + 1) * (i + 1) * 0.1)

        for w_idx, word in enumerate(words):
            h = sum(ord(c) * (i + 1) for i, c in enumerate(word))
            for i in range(32):
                pos = (h + i * 47) % self._dim
                vec[pos] += math.cos(h + i * 0.2)

        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec


class DeterministicEmbeddingProvider(EmbeddingProvider):
    def __init__(self, dimension: int = 1536):
        self._dim = dimension

    @property
    def dimension(self) -> int:
        return self._dim

    def generate_embedding(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self._dim
        
        hash_bytes = hashlib.sha256(text.encode('utf-8')).digest()
        seed = int.from_bytes(hash_bytes[:4], 'big')
        
        vec = []
        for i in range(self._dim):
            val = math.sin(seed + i * 0.1)
            vec.append(val)
            
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
            
        return vec
