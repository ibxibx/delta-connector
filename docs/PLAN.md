# Build Plan — 5.5 hours to submit

## Phase 0 — Align (30 min, all together)
Lock the demo story (the exact 90-second flow shown to judges), the API contract (done — see API_CONTRACT.md), and ownership. Build only what the demo touches.

## Phase 1 — Parallel foundations (~2 hrs)
- **Nicolai**: repo + scaffolding + knowledge-graph core producing real "champion in field X, strengths Y" output against seed data. Env, keys, deploy target.
- **Ian**: backend + orchestration. champion-matcher (graph query → best experts), mentor-matcher (profile → ranked mentors by relevance + tenure), orchestrator routing a need to one or both. Keep each agent a single well-prompted call; don't over-engineer.
- **Lauritz**: demo narrative + realistic Berlin seed data + Lovable frontend against the **mocked** contract so he's never blocked.

## Phase 2 — Integration (~1.5 hrs)
Swap Lovable's mocks for real endpoints. This is where time disappears — protect it. Get ONE full path working end to end (newcomer asks → agents match → dashboard shows champions + mentors) before adding anything else.

## Phase 3 — Polish + buffer (last ~1 hr, do not skip)
Freeze features. Rehearse the demo twice. Have a fallback (recorded clip / screenshots) if live agents are slow. Prep the one-liner: the knowledge-graph-driven champion detection feeding live agent matching is the novelty.

## Delegation principle
By reversibility: Nicolai owns the hardest-to-change thing (graph + data model), Ian owns the brain (agents), Lauritz owns the fast-iterating things (frontend, story, data). Minimizes blocking.

## Lovable verdict
Realistic as a thin frontend over our API. Risk is complex custom animations / prompt-induced regressions — mitigated by keeping all logic in the backend and Lovable only consuming endpoints.
