# CLAUDE.md — Delta-Connector

Project context for Claude Code sessions in this repo. Read `.claude/skills/engineering-discipline.md` and follow it.

## What this is
The connective layer for Berlin's startup ecosystem. A multi-agent backend surfaces **champions** (top experts, via a knowledge graph) and **mentors** (relevant by industry/sphere/tenure) to founders who arrive without a network. See `README.md` for the full framing and `docs/API_CONTRACT.md` for endpoint shapes (the source of truth).

## Architecture
- `backend/app.py` — FastAPI orchestrator. Routes a need to one or both matcher agents and composes the response.
- `backend/agents/champion_matcher.py` — queries the knowledge graph for best-fit experts + strengths.
- `backend/agents/mentor_matcher.py` — ranks mentors by industry match + years in the city.
- `backend/data/seed.json` — demo data.

The orchestrator coordinates the two matcher agents in parallel. Keep each agent a single focused unit; don't over-engineer the orchestration layer.

## How to run
```
cd backend
pip install -r requirements.txt
uvicorn app:app --reload   # http://localhost:8000, docs at /docs
```

## Conventions
- Match the existing style. The API contract is fixed — change it only by team agreement, and update `docs/API_CONTRACT.md` in the same commit.
- Run `python tests/test_agents.py` before committing backend changes.
- Keep PRs/commits surgical (see the skill).

## Team
Nicolai — graph + data model. Ian — backend + agents. Lauritz — frontend (Lovable) + demo + seed data.
