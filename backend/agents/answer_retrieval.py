"""Answer Retrieval Agent (PRD §17.2).

Given a founder question + profile, retrieves previous answers, scores them by
relevance, and returns MatchResult cards (PRD §18.7) with reasons and anonymized
trust evidence — the smart-FAQ behavior from Core Flow 2.

Scoring here is keyword + category + stage matching as a hackathon stand-in.
The real build replaces retrieval with pgvector semantic search (see IMPLEMENTATION_PLAN.md).
"""
from __future__ import annotations
import json
from pathlib import Path

from agents import fit_store

_ANSWERS = json.loads((Path(__file__).parent.parent / "data" / "answers.json").read_text(encoding="utf-8"))["answers"]

# Industry/sphere keywords present in the dataset's help_categories.
_INDUSTRY_KEYWORDS = {
    "climatetech": "climatetech", "climate": "climatetech",
    "deeptech": "deeptech", "deep tech": "deeptech",
    "edtech": "edtech", "education": "edtech",
    "fintech": "fintech", "finance": "fintech",
    "healthtech": "healthtech", "health": "healthtech",
    "marketplace": "marketplace",
    "mobility": "mobility",
    "proptech": "proptech", "property": "proptech", "real estate": "proptech",
    "saas": "saas",
    "future-of-work": "future-of-work", "future of work": "future-of-work",
    "b2b": "B2B", "b2c": "B2C",
}


def _detect_categories(query: str) -> set[str]:
    q = query.lower()
    return {cat for kw, cat in _INDUSTRY_KEYWORDS.items() if kw in q}


def retrieve_answers(query: str, profile: dict | None = None, limit: int = 3) -> list[dict]:
    """Return ranked MatchResult cards for previous answers. Confirmed providers only."""
    profile = profile or {}
    q = (query or "").lower()
    q_tokens = {t for t in q.split() if len(t) > 3}
    detected = _detect_categories(query)
    # also let the profile's industry steer matching
    detected |= _detect_categories((profile.get("industry") or ""))
    stage = (profile.get("company_stage") or profile.get("stage") or "").lower()

    results = []
    for a in _ANSWERS:
        # PRD safety: never surface an answer whose provider hasn't confirmed/opted in
        if not a.get("provider_confirmed", False):
            continue

        reasons = []
        score = 0.0

        cat_overlap = detected & set(a["help_categories"])
        if cat_overlap:
            score += 0.35
            reasons.append(f"Strong {', '.join(sorted(cat_overlap))} match")

        # question-text overlap is the strongest signal in this dataset
        stored_q = (a.get("question_text") or "").lower()
        q_hits = sum(1 for t in q_tokens if t in stored_q)
        if q_hits:
            score += min(0.12 * q_hits, 0.40)
            reasons.append("Similar question answered before")

        text_hits = sum(1 for t in q_tokens if t in a["answer_text"].lower())
        if text_hits:
            score += min(0.08 * text_hits, 0.20)
            if "Similar question answered before" not in reasons:
                reasons.append("Relevant to your question")

        if stage and stage in a["stage_context"].lower() and a["stage_context"] != "any":
            score += 0.10
            reasons.append(f"Relevant to {a['stage_context']}")

        # helpfulness as a tiebreaker, lightly weighted. Apply the session
        # fit_store overlay so re-queries reflect /answer-fits bumps (matches
        # what record_fit returns and what the card optimistically shows).
        helpfulness_count = a["helpfulness_count"] + fit_store.get(a["id"])
        score += min(helpfulness_count / 100.0, 0.10)
        if helpfulness_count >= 10:
            reasons.append(f"Helpful for {helpfulness_count} founders")

        if score <= 0:
            continue

        results.append({
            "id": f"match_{a['id']}",
            "matched_type": "answer",
            "matched_id": a["id"],
            "match_score": round(min(score, 0.99), 2),
            "question_text": a.get("question_text", ""),
            "answer_summary": a["answer_text"],
            "category": ", ".join(a["help_categories"]),
            "stage_fit": a["stage_context"],
            "helpfulness_count": helpfulness_count,
            "trust_evidence": a["trust_evidence"],  # anonymized; no provider identity
            "reasons": reasons,
            "next_action": "Mark as fitting or request follow-up",
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:limit]
