import os
import pytest
from uuid import uuid4
from ml.preprocessing.transcript_preprocessor import TranscriptPreprocessor
from ml.training.train import SLMTrainer
from ml.evaluation.evaluate import SLMEvaluator
from ml.models.inference import SLMInferenceWrapper
from app.ai.extraction import SLMProvider
from app.ai.fallback import FallbackHandler
from app.services.state_engine import StateEngine
from app.repositories.action_item_repository import ActionItemRepository

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(REPO_ROOT, "ml", "datasets")
MODELS_DIR = os.path.join(REPO_ROOT, "ml", "models")
EVAL_DIR = os.path.join(REPO_ROOT, "ml", "evaluation")

def test_transcript_preprocessor_cleaning():
    raw = '   Action Item:   Rahul to review   PR.   \n\n  '
    cleaned = TranscriptPreprocessor.clean_text(raw)
    assert cleaned == 'Action Item: Rahul to review PR.'

def test_preprocessor_target_validation():
    valid_item = {'action': 'Fix bug', 'owner': 'Rahul', 'deadline': 'Friday', 'status': 'pending'}
    assert TranscriptPreprocessor.validate_target_item(valid_item) is True
    invalid_item = {'action': '', 'owner': 'Rahul'}
    assert TranscriptPreprocessor.validate_target_item(invalid_item) is False

def test_slm_trainer_pipeline():
    trainer = SLMTrainer(data_dir=DATA_DIR, output_dir=MODELS_DIR)
    res = trainer.train(epochs=2, seed=42)
    assert res['status'] == 'trained'
    assert res['num_parameters'] > 0
    assert 'model_params' in res

def test_slm_evaluator_metrics():
    evaluator = SLMEvaluator(data_dir=DATA_DIR, output_dir=EVAL_DIR)
    res = evaluator.evaluate(split='test')
    assert 'metrics' in res
    assert res['metrics']['json_validity_rate'] > 0.8
    assert res['metrics']['action_extraction_f1'] >= 0.0

def test_inference_wrapper():
    wrapper = SLMInferenceWrapper()
    predictions = wrapper.predict('Action Item: Priya will finish payment API by Friday.')
    assert isinstance(predictions, list)
    if len(predictions) > 0:
        assert predictions[0]['owner'] in ['Priya', 'Unassigned']

def test_fallback_routing_on_low_confidence():
    low_conf_slm = SLMProvider(force_low_confidence=True)
    handler = FallbackHandler(slm_provider=low_conf_slm)
    res = handler.process('Action Item: Rahul to deploy build.')
    assert res.fallback_used is True

def test_demo_mode_execution():
    from scripts.demo_pipeline import run_loopkeeper_demo
    run_loopkeeper_demo()
