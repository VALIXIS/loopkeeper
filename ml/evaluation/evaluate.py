import os
import json
import logging
from typing import List, Dict, Any
from ml.preprocessing.transcript_preprocessor import TranscriptPreprocessor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml.evaluation")

class SLMEvaluator:
    def __init__(self, data_dir: str = "ml/datasets", output_dir: str = "ml/evaluation"):
        self.data_dir = data_dir
        self.output_dir = output_dir

    def load_dataset(self, split: str) -> List[Dict[str, Any]]:
        path = os.path.join(self.data_dir, f"{split}.json")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def evaluate(self, split: str = "test") -> Dict[str, Any]:
        dataset = self.load_dataset(split)
        
        total_samples = len(dataset)
        total_expected_items = 0
        total_predicted_items = 0
        correct_extractions = 0
        correct_owners = 0
        correct_deadlines = 0
        correct_statuses = 0
        valid_json_count = 0

        # Import backend SLMProvider to evaluate live inference pipeline
        from app.ai.extraction import SLMProvider
        slm = SLMProvider()

        failure_cases = []

        for sample in dataset:
            transcript = sample["transcript"]
            expected = sample["expected_action_items"]
            total_expected_items += len(expected)

            # Preprocess & run model inference
            clean_t = TranscriptPreprocessor.clean_text(transcript)
            result = slm.extract_action_items(clean_t)
            predicted = result.action_items
            total_predicted_items += len(predicted)

            # JSON validity check
            json_valid = True
            for item in predicted:
                item_dict = item.dict()
                if not TranscriptPreprocessor.validate_target_item({
                    "action": item_dict["title"],
                    "owner": item_dict["owner_name"],
                    "deadline": item_dict["deadline"],
                    "status": item_dict["status"]
                }):
                    json_valid = False

            if json_valid:
                valid_json_count += 1

            # Match predictions against expected
            matched_indices = set()
            for exp in expected:
                matched = False
                for idx, pred in enumerate(predicted):
                    if idx in matched_indices:
                        continue
                    # Flexible text matching
                    if exp["action"].lower() in pred.title.lower() or pred.title.lower() in exp["action"].lower():
                        correct_extractions += 1
                        matched = True
                        matched_indices.add(idx)

                        if exp["owner"].lower() == pred.owner_name.lower():
                            correct_owners += 1
                        if exp["deadline"].lower() == pred.deadline.lower():
                            correct_deadlines += 1
                        if exp["status"].lower() == pred.status.lower():
                            correct_statuses += 1
                        break
                
                if not matched and len(expected) > 0:
                    failure_cases.append({
                        "sample_id": sample["id"],
                        "transcript": transcript,
                        "expected": exp["action"],
                        "reason": "Extraction mismatch or non-commitment misclassification"
                    })

        # Calculate metrics
        precision = correct_extractions / total_predicted_items if total_predicted_items > 0 else 1.0
        recall = correct_extractions / total_expected_items if total_expected_items > 0 else 1.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        owner_acc = correct_owners / total_expected_items if total_expected_items > 0 else 1.0
        deadline_acc = correct_deadlines / total_expected_items if total_expected_items > 0 else 1.0
        status_acc = correct_statuses / total_expected_items if total_expected_items > 0 else 1.0
        json_validity_rate = valid_json_count / total_samples if total_samples > 0 else 1.0

        results = {
            "dataset_split": split,
            "total_samples": total_samples,
            "metrics": {
                "action_extraction_precision": round(precision, 4),
                "action_extraction_recall": round(recall, 4),
                "action_extraction_f1": round(f1, 4),
                "owner_extraction_accuracy": round(owner_acc, 4),
                "deadline_extraction_accuracy": round(deadline_acc, 4),
                "status_classification_accuracy": round(status_acc, 4),
                "json_validity_rate": round(json_validity_rate, 4)
            },
            "failure_cases": failure_cases[:3]
        }

        os.makedirs(self.output_dir, exist_ok=True)
        results_file = os.path.join(self.output_dir, "results.json")
        with open(results_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)

        logger.info(f"Evaluation finished. Results saved to {results_file}")
        return results

if __name__ == "__main__":
    evaluator = SLMEvaluator()
    results = evaluator.evaluate("test")
    print(json.dumps(results, indent=2))
