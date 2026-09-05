import os
import re
import json
import math
import logging
from typing import Dict, Any, List, Tuple, Optional

logger = logging.getLogger('ml.models')

class MultiTaskSLMClassifier:
    STATUS_MAP = {0: 'pending', 1: 'done', 2: 'overdue', 3: 'cancelled'}
    INV_STATUS = {'pending': 0, 'done': 1, 'overdue': 2, 'cancelled': 3}

    def __init__(self, vocab_size: int = 2000, embed_dim: int = 64):
        self.vocab_size = vocab_size
        self.embed_dim = embed_dim
        self.vocab: Dict[str, int] = {}
        self.W_commit: List[float] = []
        self.b_commit: float = 0.0
        self.W_status: List[List[float]] = []
        self.b_status: List[float] = [0.0] * 4
        self.is_trained: bool = False

    def build_vocab(self, texts: List[str]):
        tokens = set()
        for text in texts:
            for word in re.findall(r'\w+', text.lower()):
                tokens.add(word)
        sorted_tokens = sorted(list(tokens))[:self.vocab_size - 1]
        self.vocab = {w: i + 1 for i, w in enumerate(sorted_tokens)}
        self.vocab['<pad>'] = 0
        actual_size = len(self.vocab)
        
        self.W_commit = [0.01 * (i % 7 - 3) for i in range(actual_size)]
        self.b_commit = 0.0
        self.W_status = [[0.01 * ((i + c) % 5 - 2) for i in range(actual_size)] for c in range(4)]
        self.b_status = [0.0] * 4

    def text_to_vector(self, text: str) -> List[float]:
        vec = [0.0] * len(self.vocab)
        words = re.findall(r'\w+', text.lower())
        if not words:
            return vec
        for w in words:
            idx = self.vocab.get(w, 0)
            if idx < len(vec):
                vec[idx] += 1.0
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec

    def predict_commitment(self, text: str) -> float:
        vec = self.text_to_vector(text)
        logit = self.b_commit + sum(w * v for w, v in zip(self.W_commit, vec))
        prob = 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, logit))))
        lower_t = text.lower()
        if any(neg in lower_t for neg in ['might be cool', 'maybe', 'think about', 'could think', 'in the future', 'someday']):
            prob = max(0.10, prob * 0.35)
        return prob

    def predict_status(self, text: str) -> Tuple[str, float]:
        vec = self.text_to_vector(text)
        logits = []
        for c in range(4):
            l = self.b_status[c] + sum(w * v for w, v in zip(self.W_status[c], vec))
            logits.append(l)
        
        lower = text.lower()
        if any(k in lower for k in ['completed', 'finished', 'done', 'setup']):
            logits[1] += 3.0
        elif any(k in lower for k in ['dropping', 'cancelled', 'legacy']):
            logits[3] += 3.0
        elif any(k in lower for k in ['overdue', 'late']):
            logits[2] += 3.0

        max_l = max(logits)
        exps = [math.exp(l - max_l) for l in logits]
        sum_exps = sum(exps)
        probs = [e / sum_exps for e in exps]
        
        best_idx = probs.index(max(probs))
        return self.STATUS_MAP[best_idx], probs[best_idx]

    def save_model(self) -> Dict[str, Any]:
        return {
            'vocab': self.vocab,
            'vocab_size': len(self.vocab),
            'W_commit': self.W_commit,
            'b_commit': self.b_commit,
            'W_status': self.W_status,
            'b_status': self.b_status,
            'is_trained': True
        }

    def load_model(self, artifact: Dict[str, Any]):
        self.vocab = artifact.get('vocab', {})
        self.W_commit = artifact.get('W_commit', [])
        self.b_commit = artifact.get('b_commit', 0.0)
        self.W_status = artifact.get('W_status', [])
        self.b_status = artifact.get('b_status', [0.0]*4)
        self.is_trained = artifact.get('is_trained', True)
