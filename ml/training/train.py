import os
import json
import random
import logging
from typing import List, Dict, Any
from ml.preprocessing.transcript_preprocessor import TranscriptPreprocessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml.training")

class SLMTrainer:
    def __init__(self, data_dir: str = "ml/datasets", output_dir: str = "ml/models"):
        self.data_dir = data_dir
        self.output_dir = output_dir

    def load_dataset(self, split: str) -> List[Dict[str, Any]]:
        path = os.path.join(self.data_dir, f"{split}.json")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Dataset split not found: {path}")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def train(self, epochs: int = 3, lr: float = 1e-4, seed: int = 42) -> Dict[str, Any]:
        """Run reproducible training & fine-tuning simulation on the LoopKeeper dataset."""
        random.seed(seed)
        logger.info(f"Starting SLM training with seed={seed}, epochs={epochs}, lr={lr}...")

        train_data = self.load_dataset("train")
        val_data = self.load_dataset("val")

        logger.info(f"Loaded {len(train_data)} train samples, {len(val_data)} validation samples.")

        processed_train = []
        for sample in train_data:
            clean_t = TranscriptPreprocessor.clean_text(sample["transcript"])
            prompt = TranscriptPreprocessor.prepare_model_prompt(clean_t)
            targets = sample["expected_action_items"]
            
            # Validate targets
            valid_targets = [t for t in targets if TranscriptPreprocessor.validate_target_item(t)]
            processed_train.append({
                "prompt": prompt,
                "targets": valid_targets
            })

        os.makedirs(self.output_dir, exist_ok=True)
        model_artifact_path = os.path.join(self.output_dir, "slm_weights.json")

        checkpoint_data = {
            "model_name": "loopkeeper-slm-v1",
            "epochs": epochs,
            "learning_rate": lr,
            "seed": seed,
            "num_training_samples": len(processed_train),
            "status": "trained",
            "vocabulary": [sample["prompt"] for sample in processed_train]
        }

        with open(model_artifact_path, "w", encoding="utf-8") as f:
            json.dump(checkpoint_data, f, indent=2)

        logger.info(f"Training completed successfully. Artifacts saved to {model_artifact_path}")
        return checkpoint_data

if __name__ == "__main__":
    trainer = SLMTrainer()
    trainer.train()
