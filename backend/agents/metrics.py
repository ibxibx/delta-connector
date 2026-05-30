"""Metric Coach Agent (PRD §15.10, §16) — personal metrics + trust score.

Computes a user's private metrics from their contributions (recommendations,
answers, validations, follow-ups) and the MVP trust-score formula (PRD §16.4).
Metrics are private by default (PRD §9.7); public badges are a separate threshold.

Stand-in: reads activity from a seed file. Real build reads from the data layer.
"""
from __future__ import annotations
import json
from pathlib import Path

_ACTIVITY = json.loads(
    (Path(__file__).parent.parent / "data" / "activity.json").read_text(encoding="utf-8")
)

# PRD §16.4 MVP trust-score weights
_WEIGHTS = {
    "founder_validations": 0.25,
    "impact_score": 0.20,
    "answer_helpfulness": 0.20,
    "category_fit": 0.15,
    "stage_context_fit": 0.10,
    "recency": 0.05,
    "confirmation_status": 0.05,
}


def _level(score: int) -> str:
    if score >= 90: return "Ecosystem authority"
    if score >= 80: return "Highly trusted"
    if score >= 70: return "Trusted"
    if score >= 60: return "Promising"
    if score >= 40: return "Emerging"
    return "Unverified"


def compute_metrics(actor_id: str) -> dict:
    """Return private metrics + trust score for an actor. PRD §15.10 + §16."""
    a = _ACTIVITY.get(actor_id)
    if a is None:
        return {"actor_id": actor_id, "found": False, "message": "No activity yet."}

    # normalize each signal to 0-1, then weight (PRD §16.4)
    signals = {
        "founder_validations": min(a["founder_validations"] / 8.0, 1.0),  # 8 = full validation
        "impact_score": min(a["avg_impact_score"] / 5.0, 1.0),
        "answer_helpfulness": min(a["answer_helpfulness"] / 20.0, 1.0),
        "category_fit": min(a["category_fit"], 1.0),
        "stage_context_fit": min(a["stage_context_fit"], 1.0),
        "recency": min(a["recency"], 1.0),
        "confirmation_status": 1.0 if a["confirmed"] else 0.0,
    }
    trust_score = round(sum(signals[k] * _WEIGHTS[k] for k in _WEIGHTS) * 100)

    return {
        "actor_id": actor_id,
        "found": True,
        "trust_score": trust_score,
        "trust_level": _level(trust_score),
        "metrics": {
            "Contribution Score": a["recommendations_made"] + a["answers_given"],
            "Helpfulness Score": a["answer_helpfulness"],
            "Answer Helpfulness": a["answer_helpfulness"],
            "Category Authority": round(a["category_fit"] * 100),
            "Network Reach": a["network_reach"],
            "Recommendation Quality": round(a["avg_impact_score"], 1),
            "Follow-Up Value": a["follow_up_requests_received"],
        },
        # PRD §15.11 public badge threshold: >=80 + >=8 validations + opt-in
        "public_badge_eligible": trust_score >= 80 and a["founder_validations"] >= 8 and a["public_opt_in"],
        "private": True,  # PRD §9.7 metrics private by default
        "coach_tip": _coach_tip(a, trust_score),
    }


def _coach_tip(a: dict, score: int) -> str:
    if a["founder_validations"] < 8:
        need = 8 - a["founder_validations"]
        return f"You're {need} founder validation(s) from full verification — ask founders you've helped to confirm."
    if not a["public_opt_in"] and score >= 80:
        return "You qualify for a public category badge. Opt in to make it visible."
    if a["answers_given"] == 0:
        return "Answer a question in your strongest category to start building answer helpfulness."
    return "Strong standing. Keep contributing answers to grow category authority."


def record_fit(answer_id: str) -> dict:
    """A user marked an answer as fitting: bump fit + helpfulness (PRD §15.5).
    The disk file holds the baseline; an in-memory overlay holds this session's
    bumps so the demo works on ephemeral/read-only hosts and never double-counts."""
    from agents import fit_store
    path = Path(__file__).parent.parent / "data" / "answers.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    for ans in data["answers"]:
        if ans["id"] == answer_id:
            bumps = fit_store.bump(answer_id)  # session bumps for this answer
            return {
                "status": "recorded",
                "answer_id": answer_id,
                "fit_confirmations": ans["fit_confirmations"] + bumps,
                "helpfulness_count": ans["helpfulness_count"] + bumps,
            }
    return {"status": "not_found", "answer_id": answer_id}
