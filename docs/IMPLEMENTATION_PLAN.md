# Implementation Plan — Delta Connector (hackathon MVP)

Scope: deliver the PRD §24 Demo Scenario end to end. Frontend is **Lovable**. Backend is the
existing FastAPI service, migrated toward the PRD data model only as far as the demo needs.

This plan follows the engineering-discipline skill: build the demo-critical path first, simplest
thing that satisfies the acceptance criteria, defer everything in PRD §12 Non-Goals.

---

## 0. The one decision that shapes everything: where does data + auth live?

> **Current ruling: see [ADR 0001](decisions/0001-seed-files-now-supabase-next.md).** The demo runs on
> seed files (the backend already does); Supabase is the Phase-1 target adopted right after the
> hackathon. The Path A/B discussion below is the original framing and remains the post-demo plan.

Lovable generates a React app and integrates most cleanly with **Supabase** (its native backend)
or with a **clean REST API over HTTP**. Two viable paths:

**Path A — Lovable + Supabase own data/auth; Python backend is the agent service.**
Lovable handles signup, profile, recommendations, and reads/writes Supabase directly. Our FastAPI
service exposes only the AI endpoints (ask/match, follow-up draft, metric coaching) and reads the
same data. Fastest for the CRUD-heavy screens; the agent work stays in Python where it belongs.

**Path B — FastAPI owns everything; Lovable is a pure presentation layer.**
Lovable calls our REST API for every screen. Full control, one source of truth, but we hand-build
all CRUD + auth under time pressure.

**Recommendation: Path A.** It plays to Lovable's strengths (CRUD/auth/forms generated for free),
keeps our scarce build time on the differentiator (the agent + trust logic), and the demo doesn't
need custom auth flows. Tradeoff: two data touch-points (Supabase + Python) must agree on the
schema — mitigated by defining the tables once, up front, as the contract. If Supabase setup
stalls, fall back to Path B with in-memory seed data (the current backend already does this).

> Confirm Path A before Phase 1. The rest of the plan assumes it.

---

## 1. Workstreams and ownership

- **Nicolai** — data model + trust-graph: Supabase schema (Actor, FounderProfile, RecommendationReceipt,
  Answer, Question, GraphEdge), seed it with realistic Berlin data, trust-score function.
- **Ian** — backend agent service: Ask & Discover endpoint, answer retrieval, match scoring,
  follow-up draft, metric coach. Consult `architect` before locking the agent I/O shape.
- **Lauritz** — Lovable frontend: the eight screens (PRD §23), wired to Supabase for CRUD and to
  the agent API for AI. Build against mocked agent responses first.

---

## 2. Phased build

### Phase 0 — Lock contracts (all, ~30 min)
- [ ] Decide Path A. → verify: everyone agrees data lives in Supabase.
- [ ] Define the Supabase tables from PRD §18 (exact field names). → verify: schema written down, shared.
- [ ] Update `docs/API_CONTRACT.md` with the agent endpoints (`/ask`, `/follow-up-draft`, `/metrics`).
      → verify: request/response JSON for each, committed.
- [ ] Lauritz mocks those three responses in Lovable. → verify: UI renders from mock data.

### Phase 1 — Parallel foundations (~2 hrs)
- **Nicolai** → Supabase project + tables + seed rows (Maya persona + ~10 actors, ~6 answers with
  trust evidence). verify: a question row + matching answer row exist for the demo query.
- **Ian** → `/ask`: take a question + profile, retrieve candidate answers (keyword/semantic over
  seed answers), score and return MatchResult cards with reasons + trust evidence. verify:
  the PRD demo query returns the tax-advisor answer card with trust evidence.
- **Lauritz** → Landing + Signup/Profile + Ask & Discover screens against mocks. verify: Maya can
  fill a profile and see answer cards (mocked).

### Phase 2 — Integration (~1.5 hrs)
- [ ] Lauritz swaps mocked `/ask` for the real endpoint. verify: real answer card renders for the demo query.
- [ ] "This answer fits" writes a fit confirmation; "Request follow-up" calls `/follow-up-draft`.
      verify: clicking fit updates the answer's helpfulness; follow-up returns a drafted message the user approves.
- [ ] Optional recommendation flow writes a RecommendationReceipt (status pending_invite, invisible).
      verify: recommended person does NOT appear in graph/match output (safety rule).
- [ ] Metrics dashboard reads `/metrics`. verify: Maya's dashboard shows Trust/Helpfulness/Reach.

### Phase 3 — Demo polish + buffer (~1 hr, do not skip)
- [ ] Graph view shows confirmed nodes only (React Flow/Cytoscape), pending invitees hidden. verify: no pending node visible.
- [ ] Run the full PRD §24 flow twice. verify: Maya joins → asks → sees answer → marks fit →
      follow-up draft → dashboard updates, with no dead ends.
- [ ] Fallback recording/screenshots in case live agent calls are slow on stage.
- [ ] One-line novelty: peer-validated trust graph feeding agentic answer reuse.

---

## 3. Endpoints to add (agent service)

| Endpoint | Purpose | Demo-critical |
| --- | --- | --- |
| `POST /ask` | Question + profile → ranked previous answers (MatchResult cards w/ trust evidence) | Yes |
| `POST /follow-up-draft` | Answer + user → drafted follow-up message (user approves before send) | Yes |
| `GET /metrics?actor_id=` | Private metrics for the dashboard | Yes |
| `POST /question` (public post) | Fallback when no answer fits | If time |

All must honor the safety rules: no unconfirmed invitees in output, no identity reveal without
consent, no message sent without approval, no paid ranking.

---

## 4. What we are NOT building (PRD §12)
Payments, marketplace, public leaderboard, cold outreach, social feed, full messaging, autonomous
booking, visible nodes for unconfirmed invitees. If a task drifts here, the task-planner flags it.

---

## 5. Lovable-specific notes
- Let Lovable generate signup/profile/recommendation forms and Supabase wiring — don't hand-code these.
- Keep all matching, trust scoring, and consent logic in the Python agent service. Lovable fetches and renders.
- For the "agents working live" feel: call `/ask`, show a brief per-agent progress state, render cards as they resolve.
- Watch the known Lovable risks: complex custom animations and prompt-induced regressions. Keep the
  custom surface small; if Lovable fights a bespoke graph view, drop in a React Flow component manually.

## 6. Frontend interaction strategy (responsive + animation)

Target effects: responsive design, moving graphics, cursor screen-highlight responsiveness,
flashing/glowing areas on hover, entrance animations.

**Don't treat this as Lovable-vs-build-our-own.** Decide per effect, by regression risk:

| Effect | Build with | Why |
| --- | --- | --- |
| Responsive layout | Lovable | Its core strength |
| Hover flash/glow, color/scale transitions | Lovable | Tailwind + CSS, low risk |
| Page/card entrance animations | Lovable | Framer Motion, low risk |
| Cursor-following screen highlight | **Fallback component** | ~30 lines; not worth prompt churn |
| Moving/interactive trust graph | **Fallback component** | Custom + live-data + continuous interaction = Lovable's weak spot, and it's the visual centerpiece |

**Make it safe with component isolation.** Keep every fancy interaction in a self-contained component
with a clean prop interface (`<TrustGraph data={…} />`, `<CursorHighlight>`, `<AnimatedAnswerCard>`).
Then Lovable can try first, and any disappointing component gets swapped for a hand-built one without
touching the rest of the app — component-by-component fallback, no all-or-nothing fork.

**Ready-to-drop fallbacks already in the repo:** `frontend/fallback-components/` contains
`CursorHighlight.jsx`, `TrustGraph.jsx` (React Flow), and `AnimatedAnswerCard.jsx`, with a README on
how to drop them into the Lovable project. The graph and cursor highlight are best built from these
directly rather than via Lovable prompts.

**Time-box the decision:** one focused Lovable attempt (~15 min) per custom effect; if one re-prompt
doesn't fix it, switch that component to the fallback and move on. The trap is the third+ re-prompt.
