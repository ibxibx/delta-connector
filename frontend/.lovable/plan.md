
# Delta Connector — Frontend Prototype Plan

A polished, interactive SaaS prototype for Berlin's agentic startup trust network. Mock data only, structured for later Supabase wiring.

## Scope

**Public**
- Landing page — hero, value props, embedded demo of Flow 2 (ask → suggested answers → mark fits / follow-up / post publicly)

**Onboarding** (4-step wizard)
1. Identity & stakeholder type
2. Startup context, needs, can-help
3. Recommend 1–8 people (cards list)
4. Starting dashboard preview

**App shell** (left sidebar + top bar with global search, notifications, "Add recommendation", avatar)
1. Home — welcome, next action, at-a-glance metrics, recent activity, recommended next steps
2. Ask & Discover — question input, simulated agent processing states, suggested answer cards with trust evidence, "This answer fits" success, follow-up modal, "Post publicly" fallback
3. My Graph — SVG/card-based ego graph (confirmed opt-in nodes only), legend, filters, right-side inspector panel
4. My Metrics — metric cards, Recharts radar, improvement suggestions, locked/unlocked badges
5. Recommendations — tabs: Given / Received / Pending Invites / Validation Requests
6. Stakeholders — searchable directory with trust-first cards
7. Public Questions — tabs, question cards, answer composer
8. Settings — visibility, recommender reveal, investor visibility, badges, data control

## Design System

Tokens defined in `src/styles.css` (HSL/oklch semantic tokens matching the spec palette: SaaS light surface, navy `#07111F` accents, primary blue `#2563EB`, purple `#7C3AED`, success/warning/risk). Subtle blue→purple gradient utility for agentic AI surfaces. Inter font. Cards, badges, compact tables, restrained motion. Shadcn variants extended (no raw color classes in components).

## Tech

- Existing TanStack Start template — file-based routes under `src/routes/`
- `_app` layout route renders sidebar + top bar with `<Outlet />`; nested routes for each section
- Shared mock data in `src/lib/mock-data.ts` (typed)
- Local React state for interactions (mark fits, send follow-up, add recommendation, toggle settings)
- Recharts for radar/metric trends; custom SVG for graph visualization (no react-flow dependency needed)
- Lucide icons, shadcn/ui primitives already present

## Routes

```
src/routes/
  index.tsx                     # Landing
  onboarding.tsx                # 4-step wizard (local step state)
  _app.tsx                      # Sidebar+topbar layout
  _app/home.tsx
  _app/ask.tsx
  _app/graph.tsx
  _app/metrics.tsx
  _app/recommendations.tsx
  _app/stakeholders.tsx
  _app/questions.tsx
  _app/settings.tsx
```

## Interactions implemented
- Submit question → staged "Searching…/Checking…/Ranking…" states → results
- "This answer fits" → success toast + reveal provider (consent rule) + Ask follow-up
- Follow-up modal with pre-drafted message, edit, send
- "None of these fit" → public question composer
- Add recommendation → pending private card
- Graph node select → inspector with actions
- Settings toggles persist in component state
- Sidebar nav with active states

## Privacy callouts surfaced in UI
Pending invitees invisible in graph, anonymized recommenders, opt-in follow-ups, investor opt-in, badge thresholds, "payment never influences ranking" footer note in Stakeholders.

## Out of scope (hackathon)
Real auth, backend persistence, real AI calls, real graph DB. Structured so server functions + Supabase can replace mock data later.

## Deliverable
Open app → Landing with embedded Flow 2 demo → "Join the network" → Onboarding → Home dashboard. All 9 app sections navigable and interactive with the listed flows.
