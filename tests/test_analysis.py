"""
Automated Test Suite for NecroLink TabPFN-3.5 Mortality Prediction Microservice
Validates /health, /predict-mortality, inflection point detection, and Git metrics extraction.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).parent.parent.resolve()
sys.path.insert(0, str(ROOT_DIR / "analysis"))
sys.path.insert(0, str(ROOT_DIR))

from analysis.app import app, tabpfn_engine, detect_inflection_point
from analysis.git_extractor import extract_git_log_metrics, parse_git_log_output

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint reports online status and TabPFN engine."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "necrolink-tabpfn-mortality-engine"
    assert "tabpfn_version" in data
    assert "engine" in data


def test_predict_mortality_abandoned_repo():
    """Verify high abandonment risk score for neglected legacy repository."""
    payload = {
        "repo_name": "unix-v6-legacy",
        "metrics": {
            "commit_interval_days": 210.0,
            "author_count": 1,
            "deletions_ratio": 0.02,
            "issue_resolution_latency": 300.0
        }
    }
    response = client.post("/predict-mortality", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["repo_name"] == "unix-v6-legacy"
    assert data["abandonment_risk"] >= 0.70
    assert data["status"] == "FATALLY_ABANDONED"
    assert len(data["fatal_factors"]) > 0
    assert "spectral_diagnosis" in data
    assert "recommended_tribute" in data


def test_predict_mortality_active_repo():
    """Verify low abandonment risk score for actively maintained repository."""
    payload = {
        "repo_name": "neovim-lua-v3",
        "metrics": {
            "commit_interval_days": 0.4,
            "author_count": 45,
            "deletions_ratio": 0.42,
            "issue_resolution_latency": 4.5
        }
    }
    response = client.post("/predict-mortality", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["abandonment_risk"] < 0.40
    assert data["status"] == "ACTIVE_LIVING"


def test_inflection_point_detection():
    """Verify inflection point detection over chronological snapshots."""
    snapshots = [
        {"quarter": "2019-Q1", "commit_interval_days": 2.0, "author_count": 8, "deletions_ratio": 0.35, "issue_resolution_latency": 10.0},
        {"quarter": "2019-Q2", "commit_interval_days": 5.0, "author_count": 6, "deletions_ratio": 0.30, "issue_resolution_latency": 15.0},
        {"quarter": "2019-Q3", "commit_interval_days": 15.0, "author_count": 3, "deletions_ratio": 0.15, "issue_resolution_latency": 45.0},
        {"quarter": "2019-Q4", "commit_interval_days": 85.0, "author_count": 1, "deletions_ratio": 0.05, "issue_resolution_latency": 160.0},
    ]
    payload = {
        "repo_name": "forgotten-dsp-filter",
        "history_snapshots": snapshots
    }
    response = client.post("/predict-mortality", json=payload)
    assert response.status_code == 200
    data = response.json()
    inflection = data["inflection_point"]
    assert inflection["detected"] is True
    assert "2019-Q4" in inflection["quarter"]


def test_git_extractor_synthetic_fallback():
    """Verify git log extractor yields deterministic metrics when offline."""
    metrics = extract_git_log_metrics("historical_abandoned_repos/unix-v6-legacy")
    assert "commit_interval_days" in metrics
    assert "author_count" in metrics
    assert "deletions_ratio" in metrics
    assert "issue_resolution_latency" in metrics
    assert metrics["author_count"] >= 1


def test_git_log_parser_format():
    """Verify git log parser computes valid ratios from shortstat text."""
    sample_log = """
COMMIT|abc1234|2023-01-01T12:00:00+00:00|Linus
 2 files changed, 20 insertions(+), 5 deletions(-)
COMMIT|def5678|2023-01-10T12:00:00+00:00|Ada
 1 file changed, 10 insertions(+), 15 deletions(-)
"""
    result = parse_git_log_output(sample_log)
    assert result["total_commits"] == 2
    assert result["author_count"] == 2
    assert result["commit_interval_days"] == 9.0
    assert result["deletions_ratio"] > 0
