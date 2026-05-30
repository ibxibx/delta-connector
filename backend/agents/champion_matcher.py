"""Champion-matcher agent.

Given a need, queries the knowledge graph (seed data for now) and returns the
best-matching champions with their top strengths. In production the keyword
match is replaced by a knowledge-graph traversal + embedding similarity.
"""
from __future__ import annotations
import json
from pathlib import Path

_DATA = json.loads((Path(__file__).parent.parent / "data" / "seed.json").read_text(encoding="utf-8"))


def match_champions(query: str, profile: dict | None = None, limit: int = 3) -> list[dict]:
    q = (query or "").lower()
    scored = []
    for c in _DATA["champions"]:
        haystack = (c["field"] + " " + " ".join(c["top_strengths"])).lower()
        hits = sum(1 for token in set(q.split()) if len(token) > 3 and token in haystack)
        if hits:
            score = min(0.6 + 0.12 * hits, 0.99)
            scored.append({
                "id": c["id"],
                "name": c["name"],
                "field": c["field"],
                "top_strengths": c["top_strengths"],
                "match_reason": f"Top champion in {c['field']}",
                "score": round(score, 2),
            })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:limit]
