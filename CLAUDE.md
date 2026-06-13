# CLAUDE.md — Delta Connector

Project context for Claude Code sessions in this repo. Read `.claude/skills/engineering-discipline.md` and follow it: state assumptions, simplest solution, surgical changes, goal-driven execution.

## What this is
The agentic trust layer for Berlin's startup ecosystem — a peer-validated network where founders find trusted answers, people, and resources, and where good answers become reusable knowledge that compounds. Full spec: `prd/product_requirements_document.md`. Key decisions summarized in `README.md`. Endpoint shapes (source of truth): `docs/API_CONTRACT.md`.

Two core flows (the demo): (1) join → profile → optionally recommend 1–8 people → see private trust metrics; (2) ask a question → get matched previous trusted answers with anonymized trust evidence → mark as fitting / request follow-up / post publicly.

## Architecture (from the PRD)
- **Data model** (PRD §18, use these field names exactly): Actor, FounderProfile, RecommendationReceipt, Answer, Question, GraphEdge, MatchResult.
- **Agent layer** (PRD §19.4): MVP is one orchestrated LLM prompt with structured outputs. Modes: Answer Retrieval, Matching, Question Routing, Metric Coach, Outreach, Insight. No workflow engine for the hackathon.
- **Trust score** (PRD §16.4): founder validations 25%, impact 20%, answer helpfulness 20%, category fit 15%, stage/context fit 10%, recency 5%, confirmation 5%.
- **Stack** (PRD §19): React (Next.js/Lovable) + Tailwind, React Flow/Cytoscape for the graph; Supabase (Auth + Postgres + pgvector) for the real build. In-memory/seed JSON is an acceptable hackathon stand-in — mark it clearly.

## Current repo state (important)
The `backend/` code currently implements an earlier, simpler champion/mentor matcher (`app.py`, `agents/champion_matcher.py`, `agents/mentor_matcher.py`, `data/seed.json`). It runs and `tests/test_agents.py` passes, but it does **not** yet implement the PRD data model or the two core flows. Migrating the backend to the PRD design (Actor/Answer/Question model + the Ask & Discover flow) is the main open build task.

## Safety-critical rules (PRD §17.4, §20 — enforce in code, never relax)
- Never expose unconfirmed / non-opted-in invitees in any graph or match output.
- Never send a message or reveal a recommender/answer-provider identity without the consent/visibility checks.
- Investor payment must never affect ranking or trust score.
These are architectural constraints, not features. Designs that can violate them are wrong by construction.

## Subagents (`.claude/agents/`)
- `task-planner` — next tasks per person with verifiable checks; consults `architect` on design-implicated requests.
- `architect` — advisory, read-only; system design + tradeoffs + build sequencing.
- `test-engineer` — tests against PRD acceptance criteria; privacy + forbidden-action rules are must-pass.
- `backend-coder` — API, data model, orchestration, trust score; stays within the API contract.
- `frontend-coder` — the eight build-plan screens; thin client over the API.

## How to run
```
cd backend
pip install -r requirements.txt
uvicorn app:app --reload      # http://localhost:8000, docs at /docs
python ../tests/test_agents.py
```

## Conventions
- Match existing style. The API contract is the source of truth — change it only by team agreement, and update `docs/API_CONTRACT.md` in the same commit.
- Run the tests before committing backend changes; for new endpoints, add coverage (the `test-engineer` agent derives checks from PRD acceptance criteria).
- Keep commits surgical — every changed line should trace to the request.
- Stay within MVP scope (PRD §13); flag PRD §12 Non-Goals rather than building them.

## Team
Nicolai — data model + trust-graph core. Ian — backend + agent orchestration. Lauritz — frontend (Lovable) + demo + seed data.
