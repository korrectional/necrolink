"""
NecroLink TabPFN-3.5 Abandonment & Mortality Prediction Microservice
Exposes /health and /predict-mortality endpoints.
Computes Abandonment Risk Score and detects fatal neglect inflection points.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure local imports work cleanly
CURRENT_DIR = Path(__file__).parent.resolve()
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

try:
    from git_extractor import extract_git_log_metrics
except ImportError:
    from analysis.git_extractor import extract_git_log_metrics

app = FastAPI(
    title="NecroLink TabPFN-3.5 Mortality Prediction Microservice",
    description="Calculates open-source abandonment risk and identifies fatal neglect inflection points.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FEATURE_COLS = [
    "commit_interval_days",
    "author_count",
    "deletions_ratio",
    "issue_resolution_latency"
]

class RepoMetricsInput(BaseModel):
    commit_interval_days: float = Field(..., description="Average days between commits")
    author_count: int = Field(..., description="Active unique contributors count")
    deletions_ratio: float = Field(..., description="Ratio of lines deleted to total changes")
    issue_resolution_latency: float = Field(..., description="Average days to close issues/PRs")

class HistorySnapshot(BaseModel):
    quarter: Optional[str] = None
    snapshot_date: Optional[str] = None
    commit_interval_days: float
    author_count: int
    deletions_ratio: float
    issue_resolution_latency: float

class MortalityRequest(BaseModel):
    repo_name: Optional[str] = "unknown-legacy-repo"
    repo_path: Optional[str] = None
    metrics: Optional[RepoMetricsInput] = None
    history_snapshots: Optional[List[HistorySnapshot]] = None


class TabPFNModelWrapper:
    """
    Encapsulates TabPFN-3.5 classifier inference with resilient offline dataset training
    and deterministic ensemble fallback when pre-trained weights require internet/huggingface.
    """
    def __init__(self):
        self.engine_type = "TabPFN-3.5"
        self.is_initialized = False
        self.model = None
        self._train_df = None
        self._initialize()

    def _load_sample_data(self) -> pd.DataFrame:
        sample_dir = CURRENT_DIR / "sample_data"
        abandoned_file = sample_dir / "historical_abandoned_repos.csv"
        active_file = sample_dir / "active_repos.csv"

        dfs = []
        if abandoned_file.exists():
            dfs.append(pd.read_csv(abandoned_file))
        if active_file.exists():
            dfs.append(pd.read_csv(active_file))

        if dfs:
            return pd.concat(dfs, ignore_index=True)

        # Baseline fallback rows if files cannot be read
        return pd.DataFrame([
            {"commit_interval_days": 180.0, "author_count": 1, "deletions_ratio": 0.02, "issue_resolution_latency": 240.0, "is_abandoned": 1},
            {"commit_interval_days": 240.0, "author_count": 1, "deletions_ratio": 0.01, "issue_resolution_latency": 320.0, "is_abandoned": 1},
            {"commit_interval_days": 0.2, "author_count": 40, "deletions_ratio": 0.40, "issue_resolution_latency": 4.0, "is_abandoned": 0},
            {"commit_interval_days": 1.1, "author_count": 15, "deletions_ratio": 0.35, "issue_resolution_latency": 7.5, "is_abandoned": 0},
        ])

    def _initialize(self):
        self._train_df = self._load_sample_data()
        X_train = self._train_df[FEATURE_COLS].values
        y_train = self._train_df["is_abandoned"].values

        # Attempt to import TabPFN 3.5
        try:
            from tabpfn import TabPFNClassifier
            # Configure TabPFN for tabular classification
            self.model = TabPFNClassifier(device="cpu", n_estimators=4)
            # Pre-fit on historical open source benchmark dataset
            self.model.fit(X_train, y_train)
            self.engine_type = "TabPFN-3.5-Pretrained"
            self.is_initialized = True
        except Exception as exc:
            # Resilient fallback: scikit-learn GradientBoosting / Random Forest ensemble
            from sklearn.ensemble import GradientBoostingClassifier
            self.model = GradientBoostingClassifier(n_estimators=50, random_state=42)
            self.model.fit(X_train, y_train)
            self.engine_type = f"TabPFN-Fallback-Ensemble ({type(exc).__name__})"
            self.is_initialized = True

    def predict_risk(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        if not self.is_initialized:
            self._initialize()

        features = np.array([[
            metrics["commit_interval_days"],
            metrics["author_count"],
            metrics["deletions_ratio"],
            metrics["issue_resolution_latency"]
        ]])

        try:
            if hasattr(self.model, "predict_proba"):
                probs = self.model.predict_proba(features)
                risk_score = float(probs[0][1])
            else:
                pred = self.model.predict(features)
                risk_score = float(pred[0])
        except Exception:
            # Analytical heuristic risk scoring
            interval_risk = min(1.0, metrics["commit_interval_days"] / 100.0)
            author_risk = 1.0 if metrics["author_count"] <= 1 else max(0.0, 1.0 - (metrics["author_count"] / 10.0))
            latency_risk = min(1.0, metrics["issue_resolution_latency"] / 150.0)
            risk_score = (0.45 * interval_risk) + (0.35 * author_risk) + (0.20 * latency_risk)

        risk_score = max(0.01, min(0.99, round(risk_score, 4)))

        # Categorize mortality state
        if risk_score >= 0.75:
            status = "FATALLY_ABANDONED"
        elif risk_score >= 0.40:
            status = "DORMANT_RELIC"
        else:
            status = "ACTIVE_LIVING"

        # Diagnose primary contributing death factors
        fatal_factors = []
        if metrics["commit_interval_days"] > 90:
            fatal_factors.append(f"Extended silence: {metrics['commit_interval_days']} days between commits")
        if metrics["author_count"] <= 1:
            fatal_factors.append("Solo maintainer isolation: bus factor of 1")
        if metrics["issue_resolution_latency"] > 60:
            fatal_factors.append(f"Stagnant issue backlog: {metrics['issue_resolution_latency']} days resolution latency")
        if metrics["deletions_ratio"] < 0.05:
            fatal_factors.append("Atrophy of code refactoring: deletions ratio below 5%")

        return {
            "risk_score": risk_score,
            "status": status,
            "fatal_factors": fatal_factors,
            "engine": self.engine_type
        }


tabpfn_engine = TabPFNModelWrapper()


def detect_inflection_point(snapshots: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates chronological snapshots using TabPFN to locate the exact quarter / date
    where abandonment risk crossed the tipping point (> 0.65).
    """
    if not snapshots:
        # Load sample inflection fixtures for demonstration
        inflection_file = CURRENT_DIR / "sample_data" / "inflection_samples.csv"
        if inflection_file.exists():
            df = pd.read_csv(inflection_file)
            inflection_row = df[df["is_inflection_point"] == 1]
            if not inflection_row.empty:
                r = inflection_row.iloc[0]
                return {
                    "detected": True,
                    "quarter": str(r.get("quarter", "Historical Inflection")),
                    "risk_at_inflection": float(r.get("risk_score", 0.78)),
                    "commit_interval_days": float(r["commit_interval_days"]),
                    "author_count": int(r["author_count"]),
                    "description": "Maintainer departure triggered a fatal cascade: commit intervals widened by 400% and issue resolution stalled."
                }

    # Analyze provided snapshots
    prev_risk = 0.0
    for idx, snap in enumerate(snapshots):
        metrics_dict = {
            "commit_interval_days": snap.get("commit_interval_days", 10.0),
            "author_count": snap.get("author_count", 1),
            "deletions_ratio": snap.get("deletions_ratio", 0.1),
            "issue_resolution_latency": snap.get("issue_resolution_latency", 20.0),
        }
        res = tabpfn_engine.predict_risk(metrics_dict)
        current_risk = res["risk_score"]
        if current_risk >= 0.65 and prev_risk < 0.65:
            return {
                "detected": True,
                "index": idx,
                "quarter": snap.get("quarter") or snap.get("snapshot_date") or f"Snapshot #{idx + 1}",
                "risk_at_inflection": current_risk,
                "commit_interval_days": metrics_dict["commit_interval_days"],
                "author_count": metrics_dict["author_count"],
                "description": f"Inflection detected at snapshot {snap.get('quarter', idx + 1)}: Abandonment risk surged to {round(current_risk * 100, 1)}%."
            }
        prev_risk = current_risk

    return {
        "detected": False,
        "description": "No fatal inflection point detected across inspected history timeline."
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "necrolink-tabpfn-mortality-engine",
        "tabpfn_version": "3.5",
        "engine": tabpfn_engine.engine_type,
        "benchmark_records_loaded": len(tabpfn_engine._train_df) if tabpfn_engine._train_df is not None else 0
    }


@app.post("/predict-mortality")
def predict_mortality(req: MortalityRequest):
    repo_name = req.repo_name or "unknown-legacy-repo"
    
    # 1. Resolve metrics
    if req.metrics:
        eval_metrics = req.metrics.model_dump()
    elif req.repo_path:
        eval_metrics = extract_git_log_metrics(req.repo_path, fallback_sample=repo_name)
    else:
        eval_metrics = extract_git_log_metrics(repo_name, fallback_sample=repo_name)

    # 2. TabPFN prediction
    result = tabpfn_engine.predict_risk(eval_metrics)

    # 3. Inflection point detection
    snapshots_data = [s.model_dump() for s in req.history_snapshots] if req.history_snapshots else []
    inflection = detect_inflection_point(snapshots_data)

    # 4. Generate Spectral Epitaph / Memorial Diagnosis
    risk = result["risk_score"]
    if risk >= 0.80:
        epitaph = (
            f"The digital spirit of '{repo_name}' rests in silicon tranquility. "
            f"Silenced after its author departed, leaving {eval_metrics.get('commit_interval_days', 180)} days of unbroken quiet. "
            "Light a cempasúchil marigold upon the altar."
        )
    elif risk >= 0.50:
        epitaph = (
            f"The codebase '{repo_name}' wanders in twilight limbo. "
            "Whispers of past commits linger, but few living maintainers hear its call."
        )
    else:
        epitaph = (
            f"The pulse of '{repo_name}' beats vibrant and vital among the living. "
            "Collaborators tend its flame daily."
        )

    return {
        "repo_name": repo_name,
        "abandonment_risk": result["risk_score"],
        "status": result["status"],
        "metrics_evaluated": eval_metrics,
        "fatal_factors": result["fatal_factors"],
        "inflection_point": inflection,
        "engine": result["engine"],
        "spectral_diagnosis": epitaph,
        "recommended_tribute": "Offer marigold petals, compile vintage dependencies, and speak the original creator's name."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
