from app.schemas.ai import ExtractionResult, ExtractedActionItem

class ConfidenceEvaluator:
    def evaluate(self, result: ExtractionResult) -> float:
        """
        Evaluate overall extraction confidence score.
        Criteria:
        - Presence of action items
        - Owner clarity (penalty if generic/unassigned)
        - Deadline clarity (penalty if missing/vague)
        - Provider intrinsic confidence
        """
        if not result.action_items:
            return 0.5 # Neutral if no action items found

        total_score = 0.0
        for item in result.action_items:
            item_score = 1.0
            if item.owner_name == "Unassigned":
                item_score -= 0.15
            if item.deadline == "Not specified":
                item_score -= 0.15
            if item.confidence < 0.8:
                item_score -= 0.1
            total_score += max(0.2, item_score)

        avg_score = total_score / len(result.action_items)
        # Weight with provider intrinsic confidence
        final_confidence = round(0.7 * avg_score + 0.3 * result.confidence, 3)
        return final_confidence
