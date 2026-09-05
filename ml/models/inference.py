import os
import re
import json
import logging
from typing import Dict, Any, List
from ml.preprocessing.transcript_preprocessor import TranscriptPreprocessor
from ml.models.slm_model import MultiTaskSLMClassifier

logger = logging.getLogger('ml.inference')

class SLMInferenceWrapper:
    def __init__(self, model_dir: str = 'ml/models'):
        self.model_dir = model_dir
        self.model = MultiTaskSLMClassifier()
        self.model_weights = self._load_model_artifacts()

    def _load_model_artifacts(self) -> Dict[str, Any]:
        path = os.path.join(self.model_dir, 'slm_weights.json')
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if 'model_params' in data:
                        self.model.load_model(data['model_params'])
                        logger.info(f'Loaded trained SLM neural model parameters from {path}')
                        return data
            except Exception as e:
                logger.warning(f'Error loading model artifacts: {e}')
        logger.info('No custom trained model artifact found. Using baseline model weights.')
        return {}

    def predict(self, transcript_text: str) -> List[Dict[str, Any]]:
        clean_text = TranscriptPreprocessor.clean_text(transcript_text)
        if not clean_text:
            return []

        commit_prob = self.model.predict_commitment(clean_text)
        
        if commit_prob < 0.40:
            logger.info(f'SLM predicted low commitment probability ({commit_prob:.2f}).')
            return []

        status_name, status_prob = self.model.predict_status(clean_text)

        output_items = []
        lines = clean_text.splitlines()
        for line in lines:
            line_clean = line.strip()
            if not line_clean:
                continue

            line_commit = self.model.predict_commitment(line_clean)
            if line_commit < 0.35:
                continue

            owner = 'Unassigned'
            owner_match = re.search(r'(?i:assigned to|owner:?|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', line_clean)
            if not owner_match:
                owner_match = re.search(r'(?:^|,\s*|\b)([A-Z][a-z]+)\s+(?:said|will|has|is|completed|agreed)', line_clean)
            if owner_match:
                cand = owner_match.group(1).strip()
                if cand.lower() not in ["google drive", "api", "oauth", "postgres", "postgresql", "docker", "github", "database"]:
                    owner = cand

            deadline = 'Not specified'
            deadline_match = re.search(r'(?:by|due|deadline:?|move to|pushing to|before)\s+([A-Za-z0-9\s/-]+?)(?:\s+(?:for|assigned\s+to|owner:?|said|will|has|is|completed|agreed)|[\.,]|$)', line_clean, re.IGNORECASE)
            if deadline_match:
                deadline = deadline_match.group(1).strip()
                deadline = re.sub(r'^(?:to\s+)+', '', deadline, flags=re.IGNORECASE).strip()

            item_dict = {
                'action': line_clean[:80],
                'owner': owner,
                'deadline': deadline,
                'status': status_name,
                'evidence': line_clean,
                'confidence': round(commit_prob * status_prob, 3)
            }
            if TranscriptPreprocessor.validate_target_item(item_dict):
                output_items.append(item_dict)

        return output_items
