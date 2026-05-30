"""Orchestrator + FastAPI app.

Routes an incoming need to the champion-matcher and/or mentor-matcher agents
and composes the response per the API contract (docs/API_CONTRACT.md).
"""
from __future__ import annotations
import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.champion_matcher import match_champions
from agents.mentor_matcher import match_mentors
from agents.answer_retrieval import retrieve_answers
from agents.outreach import draft_follow_up

app = FastAPI(title="Delta-Connector API")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

_DATA_PATH = Path(__file__).parent / "data" / "seed.json"


class MatchRequest(BaseModel):
    query: str = ""
    profile: dict | None = None
    want: list[str] = ["champions", "mentors"]


class AskRequest(BaseModel):
    query: str = ""
    profile: dict | None = None


@app.post("/ask")
def ask(req: AskRequest):
    """Ask & Discover (PRD Core Flow 2): return previous trusted answers as
    MatchResult cards with anonymized trust evidence. If none fit, the client
    offers 'post publicly'."""
    answers = retrieve_answers(req.query, req.profile)
    return {
        "query": req.query,
        "answers": answers,
        "post_publicly_available": True,
    }


class FollowUpRequest(BaseModel):
    answer_summary: str = ""
    question: str = ""
    asker_name: str = ""
    consent_ok: bool = False


@app.post("/follow-up-draft")
def follow_up_draft(req: FollowUpRequest):
    """Draft a follow-up message to the answer provider (PRD Outreach Agent).
    Returns a draft only when consent_ok is True; never sends. The user approves
    before anything is sent (PRD §17.4)."""
    return draft_follow_up(
        answer_summary=req.answer_summary,
        question=req.question,
        asker_name=req.asker_name,
        consent_ok=req.consent_ok,
    )


@app.post("/match")
def match(req: MatchRequest):
    out = {}
    if "champions" in req.want:
        out["champions"] = match_champions(req.query, req.profile)
    if "mentors" in req.want:
        out["mentors"] = match_mentors(req.query, req.profile)
    return out


@app.get("/champions")
def champions(field: str = ""):
    return {"champions": match_champions(field)}


@app.get("/mentors")
def mentors(industry: str = "", min_years: int = 0):
    profile = {"industry": industry}
    results = [m for m in match_mentors("", profile, limit=10) if m["years_in_berlin"] >= min_years]
    return {"mentors": results}


@app.post("/contribute")
def contribute(item: dict):
    data = json.loads(_DATA_PATH.read_text(encoding="utf-8"))
    new_id = f"c_{len(data['champions']) + 1:03d}"
    data["champions"].append({
        "id": new_id,
        "name": item.get("name", ""),
        "field": item.get("field", ""),
        "top_strengths": [item.get("field", "")],
    })
    _DATA_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return {"status": "added", "id": new_id}


@app.get("/")
def health():
    return {"status": "ok", "service": "delta-connector"}
