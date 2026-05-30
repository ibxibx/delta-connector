# ADR 0001 — Seed-file backend for the demo; Supabase as the Phase-1 target

Status: **Accepted** (hackathon scope)
Date: 2026-05-30
Context owner: Ian (backend) · raised by Lauritz (proposed Supabase restructure)

## Context

Lauritz proposed migrating the backend to a layered Supabase architecture: a `db/` Supabase
client, `models/` Pydantic schemas, `routers/` route modules, `.env` secrets, async agents
querying Postgres, and RLS policies. This is a sound **production** design and matches the PRD
§19 "real build" stack (Supabase Auth + Postgres + pgvector).

It surfaced mid-build, while:
- the backend already implements the **PRD Ask & Discover flow** — `/ask`, `/answer-fits`,
  `/follow-up-draft`, `/metrics` — retrieving from seed files (`answers.json`, `activity.json`),
  with 14 passing tests and a working Render deploy config;
- Nicolai is building the **Lovable frontend against those exact endpoints** (`docs/LOVABLE_PROMPTS.md`);
- Lauritz is authoring **120 answers** that flow into `answers.json` via `data-authoring/convert.py`.

## Decision

**Keep the seed-file backend for the demo. Do not restructure now.** Adopt Lauritz's Supabase
architecture immediately after the hackathon as the first Phase-1 (private beta) task.

The current endpoints are **frozen** for the rest of the build so the frontend stays stable.

## Why

1. **The working loop is already PRD-shaped and deployable.** The demo path (ask → see trusted
   answer → mark fits → follow-up draft → dashboard) works end-to-end on seed files and deploys to
   Render as-is. Migrating now rebuilds working code under the clock.
2. **It would re-plan around the retired model.** The proposal centers on `champion_matcher` /
   `mentor_matcher` as the core agents; the team already moved to the PRD Answer/Question model.
   The five frozen endpoints — not the matchers — are what the Lovable prompts call.
3. **Mid-build schema churn breaks the frontend.** If endpoint shapes shift while Nicolai wires
   the UI, his screens break. Freezing the contract is the cheapest way to protect parallel work.
4. **Engineering-discipline skill:** don't refactor what isn't broken under time pressure; the
   `db/`/`models/`/`routers/` reshuffle adds no demo capability today.

## Alternatives considered

- **Full Supabase migration now (Lauritz's proposal as-is):** correct end state, wrong timing.
  Cost: stand up project + schema, migrate 120 answers, rewrite agents to query Postgres, handle
  auth + RLS, all while the frontend is being wired. High risk of late-stage breakage. → deferred to Phase 1.
- **Partial pull-forward — persistence only:** if the demo needs data to survive a backend restart
  (e.g. the fit-counter on stage), move *just* the answers + fit count to Supabase and leave the
  rest on seed files. Smaller than the full restructure. → adopt **only if** the trigger below is true.

## Trigger that changes this decision

**Does the demo need data to persist across a backend restart, or is one continuous session fine?**
- One continuous session is fine → stay fully on seed files (current plan). The in-memory fit
  overlay (`agents/fit_store.py`) already makes the "number goes up" beat work on Render's
  ephemeral host; it only resets on restart.
- Must survive a restart → pull forward the persistence-only alternative above; not the full restructure.

## Phase-1 follow-up (post-hackathon, adopt Lauritz's design)

His layout becomes the migration target: `db/supabase_client.py` (shared client, service-role key
server-side), `models/schemas.py` (Pydantic matching `API_CONTRACT.md`), `routers/`, `.env` for
secrets, async agents over Postgres + pgvector for semantic answer retrieval, and RLS policies for
the frontend's direct anon-key access. The frozen endpoint shapes carry over unchanged, so the
swap is internal — the frontend doesn't notice.

## One correction for the record

The proposal describes `app.py` running the matchers in parallel and writing Q&A back to Supabase.
The current orchestrator already runs the PRD agents, and the demo's write-back is the in-memory
fit overlay. So parts of that step describe work that exists in a different shape, not missing work.
