# Lovable Prompts — Delta Connector frontend

Copy-paste prompts for building the eight screens in Lovable, wired to the real backend.
Use them in order. Each names the exact endpoint and JSON shape so Lovable generates the right
fetch calls and renders the right fields.

## Before you start (paste this first as the project setup prompt)

```
Build a modern, responsive web app called "Delta Connector — the agentic trust layer for Berlin's
startup ecosystem." Use React + Tailwind. Design: clean, premium, founder-facing SaaS; indigo accent
(#6366f1), soft cards with rounded-2xl corners, generous whitespace, subtle shadows. Fully responsive
(mobile + desktop). Add smooth entrance fade-ins on cards and hover glow/scale on interactive elements.

The app talks to a backend API. Set a single config constant API_BASE (default "http://localhost:8000")
and use it for all fetch calls. All requests are JSON. Do not build auth or a database yet — use
local React state and the endpoints described in later prompts.

Top-level nav: Home, Ask, My Profile, Recommend, Graph, Dashboard.

Brand assets (in the repo under pics/) — the frontend uses the TRANSPARENT versions so the logo sits
cleanly on any background: use "delta-connector-logo-transparent.png" (full logo, wordmark + triangle)
for the landing hero and any large title placement; use "delta-triangle-logo-transparent.png" (triangle
mark only) for the nav bar logo and the browser favicon/tab icon. Keep the triangle small and crisp in the nav.
```

> Brand assets (frontend uses transparent PNGs): full logo `pics/delta-connector-logo-transparent.png`,
> triangle mark `pics/delta-triangle-logo-transparent.png`. (The non-transparent `delta-connector-logo.png`
> is used for the README header only.) In Lovable, upload both transparent images to the project assets.

> Backend base URL: `http://localhost:8000`. If the backend runs elsewhere, change `API_BASE`.

---

## Screen 1 — Landing page

```
Build the landing page. Centered hero:
- The full logo (delta-connector-logo-transparent.png) centered at the top, then headline "Delta Connector",
  subhead "The agentic trust network for Berlin's startup ecosystem."
- One sentence: "No founder should need the right private WhatsApp group to know whom to ask, who to
  trust, or what to do next."
- Primary CTA button "Join the network" → navigates to the Signup/Profile screen.
- Secondary CTA "Ask a question" → navigates to the Ask screen.
Add a subtle animated background and a cursor-following glow highlight over the hero section.
Keep it responsive and elegant. No backend calls on this screen.
```
> For the cursor glow, if Lovable's version isn't smooth, drop in `frontend/fallback-components/CursorHighlight.jsx`.

---

## Screen 2 — Signup / Profile

```
Build a "Create your profile" screen with a form (local state only, no backend):
Fields:
- name (text), email (text)
- stakeholder type (dropdown): Founder, Ex-Founder, Investor, Lawyer, Tax Advisor, Accountant, Mentor,
  Accelerator, Coworking Space, Public Institution, Corporate Partner, Recruiter, Relocation/Housing Partner, Other
- labels (multi-select, same list — a user can have several)
- company stage (dropdown): pre-incorporation, pre-seed, seed, growth
- industry (text), founder context (text)
- current needs (multi-select chips): Legal, Tax/Admin, Funding, Housing, Workspace, Visa/Relocation,
  Talent/Hiring, Co-Founder, Product/Tech, Sales/GTM, Public Funding, Mentoring, Community
- can-help-with (same chip list)
- visibility (dropdown): Private, Network-only, Public
On submit, store the profile in app state (we'll use stage + industry later when asking questions) and
navigate to the Ask screen. Show a success toast "Profile created."
```

---

## Screen 3 — Ask & Discover  (CORE DEMO SCREEN — endpoint: POST /ask)

```
Build the "Ask & Discover" screen — the most important screen.

A large question input with placeholder "Ask anything about building in Berlin…" and an "Ask" button.
On submit, POST to `${API_BASE}/ask` with JSON:
  { "query": <the input>, "profile": { "stage": <profile.stage or "">, "industry": <profile.industry or ""> } }

While waiting, show a short "agents working" loading state with 2-3 cycling messages like
"Searching previous answers…", "Checking trust evidence…", "Ranking matches…".

The response shape is:
{
  "query": "...",
  "answers": [
    {
      "id": "match_answer_001",
      "matched_id": "answer_001",
      "match_score": 0.99,
      "answer_summary": "For a VC-backed GmbH, choose a tax advisor with DATEV...",
      "category": "Tax/Admin",
      "stage_fit": "pre-seed",
      "helpfulness_count": 12,
      "trust_evidence": "Helpful for 12 founders. Verified in Tax/Admin by 8 founders.",
      "reasons": ["Strong Tax/Admin category match", "Similar question answered before"],
      "next_action": "Mark as fitting or request follow-up"
    }
  ],
  "post_publicly_available": true
}

Render each item in answers[] as a card (fade in with a small stagger):
- answer_summary as the main text
- a category pill and the stage_fit
- trust_evidence in muted text
- "Helpful for {helpfulness_count} founders"
- match_score as a thin confidence bar (0–1 → 0–100%)
- the reasons[] as small bullet chips
- two buttons: "This answer fits" and "Request follow-up"
On hover, the card glows/flashes softly.

If answers[] is empty, show a "No answer fits yet" state with a "Post my question publicly" button
(only when post_publicly_available is true) → navigates to the Public Question screen.

"This answer fits" → POST `${API_BASE}/answer-fits` with { "answer_id": <matched_id> }.
Response: { "status":"recorded", "fit_confirmations": 9, "helpfulness_count": 13 }.
On success, update that card's helpfulness count live and show a toast "Saved — this helps the next founder."

"Request follow-up" → open the Follow-up screen/modal, passing this answer's summary and the asked question.
```
> The answer card is ideal for `frontend-components/AnimatedAnswerCard.jsx` if you want the hover/entrance polish prebuilt.

---

## Screen 4 — Follow-up draft  (endpoint: POST /follow-up-draft)

```
Build a follow-up modal/screen. It receives the answer summary and the original question from the
Ask screen.

First show a consent gate: a line "Request a follow-up with the person who gave this answer" and a
button "Request follow-up". On click, POST `${API_BASE}/follow-up-draft` with:
  { "answer_summary": <summary>, "question": <question>, "asker_name": <profile.name or "">, "consent_ok": true }

(For the demo, send consent_ok: true. The backend returns a drafted message only when consent is given.)

Response when drafted:
  { "status":"drafted", "draft":"Hi, I'm Maya...", "message":"Draft ready...", "next_action":"approve_to_send" }
Response when not:
  { "status":"consent_required", "draft":null, "message":"...", "next_action":"request_consent" }

If status is "drafted": show the draft in an editable textarea, the message hint below it, and an
"Approve & send" button (for the demo this just shows a success toast "Message sent" — do not actually
send anything). Make it explicit that nothing is sent until the user approves.
If status is "consent_required": show the message and a "Request consent" button (demo: toast only).
```

---

## Screen 5 — Optional recommendations  (local state only)

```
Build a "Recommend people who helped you" screen. Show a prominent note:
"Recommended people only appear after they confirm and opt in."

Allow adding 1 to 8 recommendations. Each recommendation form row:
- name, email, stakeholder label (dropdown), help category (dropdown: Legal, Tax/Admin, Funding,
  Housing, Workspace, Visa/Relocation, Mentoring, Community), how they helped (text),
  founder stage context (dropdown), would-recommend (toggle), optional warning (text).
Store in app state. After adding, show each as a card marked "Pending — invisible until they opt in"
with a muted/locked style. Do NOT show these as confirmed network members anywhere.
Submit button shows a toast "Invitations queued" (no backend yet).
```

---

## Screen 6 — Trust graph  (use the fallback component)

```
Build a "Trust graph" screen that visualizes confirmed network members and their relationships.
IMPORTANT: only show confirmed, opted-in people. Never render pending invitees as nodes.

Use an interactive graph: draggable nodes, animated edges, and hover-highlight (node scales and glows
on hover). Nodes are colored by stakeholder type. Below the graph, add category filter chips.

Seed it with sample confirmed data for the demo (about 8 nodes: a founder in the center connected to a
lawyer, tax advisor, mentor, investor, coworking space; with edges labeled by help category).
```
> Strongly prefer the prebuilt `frontend/fallback-components/TrustGraph.jsx` (React Flow) here — pass it
> `nodes` (id, label, type, confirmed) and `edges` (id, source, target, category). Run `npm i reactflow`.
> This is the screen Lovable is least reliable on; don't burn prompts fighting it.

---

## Screen 7 — Personal metrics dashboard  (endpoint: GET /metrics)

```
Build a "My dashboard" screen. On load, GET `${API_BASE}/metrics?actor_id=actor_001`
(use actor_001 for the demo persona; we can make this dynamic later).

Response:
{
  "actor_id":"actor_001", "found":true,
  "trust_score":19, "trust_level":"Unverified",
  "metrics":{
    "Contribution Score":3, "Helpfulness Score":0, "Answer Helpfulness":0,
    "Category Authority":20, "Network Reach":4, "Recommendation Quality":0, "Follow-Up Value":0
  },
  "public_badge_eligible":false, "private":true,
  "coach_tip":"You're 7 founder validation(s) from full verification — ask founders you've helped to confirm."
}

Render:
- A large circular trust-score gauge (0–100) with the trust_level label under it.
- A grid of metric cards, one per key in metrics{} (label + value), with subtle entrance animation.
- The coach_tip in a highlighted "Next step" callout box.
- A small "Private to you" badge (because private is true).
- If public_badge_eligible is true, show a celebratory "Public category badge unlocked" banner; otherwise hide it.

Add a demo toggle/button "View as established member" that instead fetches actor_id=actor_002
(that profile returns trust_score 92, level "Ecosystem authority", public_badge_eligible true) so we can
show the contrast live in the pitch.
```

---

## Screen 8 — Public question fallback  (local state only)

```
Build a "Post your question publicly" screen, reached when no answer fits.
Pre-fill the question text from the Ask screen. Add a category dropdown (Legal, Tax/Admin, Funding,
Housing, Workspace, Visa/Relocation, Mentoring, Community) and a visibility note
"Visible to relevant verified members." A "Post publicly" button stores it in app state and shows a
toast "Posted — trusted members can now answer." (No backend yet.)
```

---

## Wiring summary (the 5 live endpoints)

| Screen | Method + endpoint | Sends | Renders |
| --- | --- | --- | --- |
| Ask & Discover | POST `/ask` | query, profile{stage,industry} | answers[] cards |
| Mark fits | POST `/answer-fits` | answer_id | updated helpfulness |
| Follow-up | POST `/follow-up-draft` | answer_summary, question, asker_name, consent_ok | draft (consent-gated) |
| Dashboard | GET `/metrics?actor_id=` | actor_id | trust score + metrics + coach tip |
| (legacy) | POST `/match` | query, profile, want | champions/mentors — not in the core demo |

Screens 2, 5, 8 are local state only for the hackathon (under Path A, Supabase handles their persistence later).

## Tips
- Build screens 1–3 and 7 first — that's the demo spine (land → ask → see answer → mark fits → dashboard moves).
- For the cursor glow (Screen 1) and the graph (Screen 6), use the fallback components rather than re-prompting.
- Keep API_BASE in one place so you can point it at a deployed backend later.
- For the "agents working live" feel, keep the loading states on /ask and /follow-up-draft visible for ~1s minimum.
```
