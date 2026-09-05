import os
import json
import math
import random
import logging
from typing import List, Dict, Any
from ml.preprocessing.transcript_preprocessor import TranscriptPreprocessor
from ml.models.slm_model import MultiTaskSLMClassifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('ml.training')

class SLMTrainer:
    def __init__(self, data_dir: str = 'ml/datasets', output_dir: str = 'ml/models'):
        self.data_dir = data_dir
        self.output_dir = output_dir
        self.model = MultiTaskSLMClassifier()

    def load_dataset(self, split: str) -> List[Dict[str, Any]]:
        path = os.path.join(self.data_dir, f'{split}.json')
        if not os.path.exists(path):
            raise FileNotFoundError(f'Dataset split not found: {path}')
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def train(self, epochs: int = 3, lr: float = 1e-2, seed: int = 42) -> Dict[str, Any]:
        random.seed(seed)
        logger.info(f'Starting SLM training with seed={seed}, epochs={epochs}, lr={lr}...')

        train_data = self.load_dataset('train')
        val_data = self.load_dataset('val')

        logger.info(f'Loaded {len(train_data)} train samples, {len(val_data)} validation samples.')

        all_transcripts = [s.get('transcript') or s.get('text', '') for s in train_data] + [s.get('transcript') or s.get('text', '') for s in val_data]
        self.model.build_vocab(all_transcripts)

        for epoch in range(1, epochs + 1):
            total_loss = 0.0
            random.shuffle(train_data)
            
            for sample in train_data:
                transcript = sample.get('transcript') or sample.get('text', '')
                expected_items = sample.get('expected_action_items', [])
                
                is_commitment = 1.0 if (expected_items or sample.get('label') == 1) else 0.0
                target_status = expected_items[0]['status'] if expected_items else sample.get('status', 'pending')
                target_status_idx = MultiTaskSLMClassifier.INV_STATUS.get(target_status, 0)

                vec = self.model.text_to_vector(transcript)
                pred_commit_prob = self.model.predict_commitment(transcript)

                eps = 1e-7
                commit_loss = -(is_commitment * math.log(max(eps, pred_commit_prob)) + (1.0 - is_commitment) * math.log(max(eps, 1.0 - pred_commit_prob)))
                
                grad_commit = (pred_commit_prob - is_commitment)
                self.model.b_commit -= lr * grad_commit
                for i in range(len(self.model.vocab)):
                    if vec[i] > 0:
                        self.model.W_commit[i] -= lr * grad_commit * vec[i]

                status_name, status_prob = self.model.predict_status(transcript)
                for c in range(4):
                    target_val = 1.0 if c == target_status_idx else 0.0
                    grad_s = (status_prob - target_val)
                    self.model.b_status[c] -= lr * grad_s
                    for i in range(len(self.model.vocab)):
                        if vec[i] > 0:
                            self.model.W_status[c][i] -= lr * grad_s * vec[i]

                total_loss += commit_loss

            avg_loss = total_loss / max(1, len(train_data))
            logger.info(f'Epoch {epoch}/{epochs} - Training Loss: {avg_loss:.4f}')

        os.makedirs(self.output_dir, exist_ok=True)
        model_artifact_path = os.path.join(self.output_dir, 'slm_weights.json')

        model_params = self.model.save_model()

        checkpoint_data = {
            'model_name': 'loopkeeper-slm-v1',
            'epochs': epochs,
            'learning_rate': lr,
            'seed': seed,
            'num_training_samples': len(train_data),
            'status': 'trained',
            'num_parameters': len(self.model.vocab) * 5 + 5,
            'vocab_size': len(self.model.vocab),
            'model_params': model_params
        }

        with open(model_artifact_path, 'w', encoding='utf-8') as f:
            json.dump(checkpoint_data, f, indent=2)

        logger.info(f'Training completed successfully. Real weights saved to {model_artifact_path}')
        return checkpoint_data

if __name__ == '__main__':
    trainer = SLMTrainer()
    trainer.train(epochs=3, lr=1e-2)
