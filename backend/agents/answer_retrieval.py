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

_ANSWERS = json.loads((Path(__file__).parent.parent / "data" / "answers.json").read_text(encoding="utf-8"))["answers"]

# light keyword -> category hints so a plain question maps to help categories
_CATEGORY_HINTS = {
    "tax": "Tax/Admin", "datev": "Tax/Admin", "accountant": "Tax/Admin", "advisor": "Tax/Admin",
    "lawyer": "Legal", "gmbh": "Legal", "incorporation": "Legal", "notary": "Legal",
    "visa": "Visa/Relocation", "anmeldung": "Visa/Relocation", "relocation": "Visa/Relocation",
    "housing": "Housing", "flat": "Housing", "apartment": "Housing",
    "funding": "Funding", "investor": "Funding", "angel": "Funding", "raise": "Funding", "seed": "Funding",
    "coworking": "Workspace", "workspace": "Workspace", "desk": "Workspace",
}


def _detect_categories(query: str) -> set[str]:
    q = query.lower()
    return {cat for kw, cat in _CATEGORY_HINTS.items() if kw in q}


def retrieve_answers(query: str, profile: dict | None = None, limit: int = 3) -> list[dict]:
    """Return ranked MatchResult cards for previous answers. Confirmed providers only."""
    profile = profile or {}
    q = (query or "").lower()
    q_tokens = {t for t in q.split() if len(t) > 3}
    detected = _detect_categories(query)
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
            score += 0.45
            reasons.append(f"Strong {', '.join(sorted(cat_overlap))} category match")

        text_hits = sum(1 for t in q_tokens if t in a["answer_text"].lower())
        if text_hits:
            score += min(0.10 * text_hits, 0.30)
            reasons.append("Similar question answered before")

        if stage and stage in a["stage_context"].lower():
            score += 0.15
            reasons.append(f"Relevant to {a['stage_context']}")

        # helpfulness as a tiebreaker, lightly weighted
        score += min(a["helpfulness_count"] / 100.0, 0.10)
        if a["helpfulness_count"] >= 10:
            reasons.append(f"Helpful for {a['helpfulness_count']} founders")

        if score <= 0:
            continue

        results.append({
            "id": f"match_{a['id']}",
            "matched_type": "answer",
            "matched_id": a["id"],
            "match_score": round(min(score, 0.99), 2),
            "answer_summary": a["answer_text"],
            "category": ", ".join(a["help_categories"]),
            "stage_fit": a["stage_context"],
            "helpfulness_count": a["helpfulness_count"],
            "trust_evidence": a["trust_evidence"],  # anonymized; no provider identity
            "reasons": reasons,
            "next_action": "Mark as fitting or request follow-up",
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:limit]
