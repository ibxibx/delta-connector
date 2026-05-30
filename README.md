# Delta-Connector

**The connective tissue of Berlin's startup ecosystem** — a persistent, trusted layer of structured, peer-sourced knowledge that founders can access at any point in their journey.

## The Problem

At every stage of building a company in Berlin, founders rely on word of mouth to find what they need — the right lawyer, accountant, co-founder, housing. That knowledge exists but lives in informal networks, WhatsApp groups, and the heads of founders who've been through it. It is not structured, not searchable, and not accessible to anyone arriving without an existing network. The ecosystem has the infrastructure (coworking, legal experts, housing, investors) but without a connective layer, that infrastructure is effectively invisible to the people who need it most. Every founder starts from scratch.

## The Goal

Build the connective layer. Peer-sourced intelligence that improves as more founders contribute. Success = the next founder arriving in Berlin has a meaningfully better starting point than the one before.

## Approach

Two intelligence sources, surfaced by a multi-agent backend:

- **Champions** — top experts in specific fields, detected via a knowledge graph that maps people to their strongest domains (building on Nicolai's *Champions Academy* concept).
- **Mentors** — people with relevant experience by industry, sphere, or length of time in the city, available to guide newcomers.

## Architecture

```
Knowledge Graph (champions + strengths)  ──┐
Mentor data (industry, sphere, tenure)   ──┤
                                            ▼
                 Multi-agent backend (orchestrator)
                 ├── champion-matcher agent
                 └── mentor-matcher agent
                                            ▼
                 Clean JSON API (the contract)
                                            ▼
                 Lovable frontend (dashboard, live agent feel)
```

**Design rule:** Lovable owns only the frontend — fetch endpoints, render components, poll/stream for updates. All business logic and agent orchestration live in our backend. The API contract is the single source of truth between backend, graph, and frontend; lock it early so the three workstreams can't drift.

## Team & Roles

- **Nicolai** — foundation: repo scaffolding, environment, knowledge-graph core (champion detection + top strengths).
- **Ian** — backend + multi-agent orchestration (champion-matcher, mentor-matcher, orchestrator).
- **Lauritz** — demo narrative, seed data quality, Lovable frontend against the mocked API contract.

## Status

Scaffold created. See `docs/API_CONTRACT.md` for endpoint shapes and `docs/PLAN.md` for the build timeline.
