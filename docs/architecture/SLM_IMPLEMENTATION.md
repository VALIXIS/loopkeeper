# LoopKeeper Specialized SLM Implementation Specification

## 1. Overview & Objective
LoopKeeper utilizes a hybrid AI architecture combining a specialized Multi-Task Small Language Model (SLM) for structured action-item extraction, high-dimensional vector embeddings (pgvector) for semantic task matching across meetings, a deterministic State Engine for task history tracking, and a Fallback LLM Provider for handling ambiguous cases.

## 2. Model Selection & Strategy
- Architecture: Multi-Task Lightweight Neural Classifier & Entity Span Predictor (MultiTaskSLMClassifier).
- Parameter Optimization: SGD / AdamW gradient parameter updates for commitment probability and multi-class status classification.
- Model Checkpoints: Trained neural parameters saved to ml/models/slm_weights.json and ml/models/slm_model.bin.
- Runtime Requirements: CPU-bound, ultra-fast inference (< 20ms latency).

## 3. Dataset Design & Schema
Located at ml/datasets/:
- train.json: 20 curated samples covering Scenarios A through N.
- val.json: 5 validation samples.
- test.json: 5 blind evaluation samples.

## 4. Preprocessing, Training & Evaluation

### Preprocessing (ml/preprocessing/transcript_preprocessor.py)
- Normalizes whitespace while preserving temporal expressions and speaker information.
- Formats input transcripts into standardized model prompts.
- Validates target JSON schema.

### Training Pipeline (ml/training/train.py)
- Supervised fine-tuning loop (seed=42, epochs=3, lr=1e-2).
- Optimizes weights W_commit and W_status with cross-entropy loss reduction.
- Checkpoints saved to ml/models/slm_weights.json and ml/models/slm_model.bin.

### Evaluation Pipeline (ml/evaluation/evaluate.py)
- Evaluates real trained SLM predictions across test split (ml/evaluation/results.json).
- Measured Metrics:
  - Action Extraction F1 Score: 0.6667
  - Owner Extraction Accuracy: 0.4000
  - Deadline Extraction Accuracy: 0.2000
  - Status Classification Accuracy: 0.4000
  - JSON Format Validity Rate: 1.0000

## 5. Dynamic Confidence Routing & Fallback
- SLMInferenceWrapper computes model-derived confidence based on commitment probability and status prediction logit distributions.
- If commitment probability < 0.75 or if transcript contains non-commitments/vague statements, FallbackHandler seamlessly routes the request to FallbackLLMProvider (fallback_used=True).
