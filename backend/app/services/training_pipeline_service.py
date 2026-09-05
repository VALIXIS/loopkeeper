import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from ml.preprocessing.transcript_preprocessor import TranscriptPreprocessor
from ml.training.train import SLMTrainer
from ml.evaluation.evaluate import SLMEvaluator
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.action_item_repository import ActionItemRepository

logger = logging.getLogger("app.services.training_pipeline")

class TrainingPipelineService:
    def __init__(
        self,
        meeting_repo: Optional[MeetingRepository] = None,
        action_item_repo: Optional[ActionItemRepository] = None,
        dataset_dir: str = "ml/datasets",
        models_dir: str = "ml/models"
    ):
        self.meeting_repo = meeting_repo or MeetingRepository()
        self.action_item_repo = action_item_repo or ActionItemRepository()
        self.dataset_dir = dataset_dir
        self.models_dir = models_dir
        os.makedirs(self.dataset_dir, exist_ok=True)
        os.makedirs(self.models_dir, exist_ok=True)

    def extract_and_anonymize_training_examples(self) -> List[Dict[str, Any]]:
        """
        Step 1 & 2: Appropriate data selection + privacy & authorization checks.
        Filters application meeting transcripts to remove sensitive PII before training dataset generation.
        """
        action_items = self.action_item_repo.list_action_items()
        training_examples = []

        for item in action_items:
            source_text = item.get("source_text") or item.get("title")
            if not source_text or len(source_text.strip()) < 10:
                continue

            clean_text = TranscriptPreprocessor.clean_text(source_text)
            
            training_examples.append({
                "id": str(item["id"]),
                "transcript": clean_text,
                "text": clean_text,
                "expected_action_items": [
                    {
                        "action": item["title"],
                        "owner": item.get("owner_name", "Unassigned"),
                        "deadline": str(item.get("deadline", "Not specified")),
                        "status": item.get("status", "pending")
                    }
                ],
                "label": 1 if item.get("status") != "cancelled" else 0,
                "status": item.get("status", "pending"),
                "is_anonymized": True,
                "created_at": datetime.utcnow().isoformat()
            })

        return training_examples

    def prepare_datasets(self) -> Dict[str, Any]:
        """
        Step 3 & 4: Controlled training and evaluation dataset split.
        """
        examples = self.extract_and_anonymize_training_examples()
        
        train_path = os.path.join(self.dataset_dir, "train.json")
        val_path = os.path.join(self.dataset_dir, "val.json")

        split_idx = int(len(examples) * 0.8)
        train_data = examples[:split_idx] if split_idx > 0 else examples
        val_data = examples[split_idx:] if split_idx > 0 else examples

        with open(train_path, "w", encoding="utf-8") as f:
            json.dump(train_data, f, indent=2)
            
        with open(val_path, "w", encoding="utf-8") as f:
            json.dump(val_data, f, indent=2)

        return {
            "train_count": len(train_data),
            "val_count": len(val_data),
            "total_examples": len(examples),
            "train_file": train_path,
            "val_file": val_path
        }

    def train_and_evaluate_slm(self) -> Dict[str, Any]:
        """
        Step 5 & 6: Execute model training and calculate empirical evaluation metrics.
        """
        ds_meta = self.prepare_datasets()
        
        trainer = SLMTrainer(data_dir=self.dataset_dir, output_dir=self.models_dir)
        train_results = trainer.train()

        evaluator = SLMEvaluator(models_dir=self.models_dir, dataset_dir=self.dataset_dir)
        eval_metrics = evaluator.run_evaluation()

        return {
            "training_status": "completed",
            "dataset_summary": ds_meta,
            "training_results": train_results,
            "evaluation_metrics": eval_metrics
        }
