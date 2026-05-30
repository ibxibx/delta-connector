"""Mentor-matcher agent.

Ranks mentors by relevance to the newcomer's profile: industry match plus
length of experience in the city. Newcomers benefit from mentors with both
domain fit and local tenure.
"""
from __future__ import annotations
import json
from pathlib import Path

_DATA = json.loads((Path(__file__).parent.parent / "data" / "seed.json").read_text(encoding="utf-8"))


def match_mentors(query: str, profile: dict | None = None, limit: int = 3) -> list[dict]:
    profile = profile or {}
    industry = (profile.get("industry") or "").lower()
    scored = []
    for m in _DATA["mentors"]:
        score = 0.4
        if industry and industry == m["industry"].lower():
            score += 0.35
        # tenure bonus, capped
        score += min(m["years_in_berlin"] / 10.0, 0.25)
        scored.append({
            "id": m["id"],
            "name": m["name"],
            "industry": m["industry"],
            "years_in_berlin": m["years_in_berlin"],
            "relevance": m["note"],
            "score": round(min(score, 0.99), 2),
        })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]
