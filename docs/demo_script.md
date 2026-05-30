# Delta Connector — Live Demo Script (2:00)

## What we're showing

> **Delta Connector is an agentic trust network for Berlin's startup ecosystem.**
>
> It helps founders and ecosystem stakeholders find trusted answers, people, services, and resources without depending on private WhatsApp groups or hidden informal networks.
>
> **Core idea.** Berlin already has the infrastructure: lawyers, tax advisors, investors, coworking spaces, accelerators, mentors, public institutions, and experienced founders. But that knowledge is hard to access.
>
> Delta Connector makes this hidden knowledge **structured, searchable, reusable, and trusted.**

The two minutes below are how we prove that on a single screen, with one founder, in three clicks.

---

**Persona on stage:** Marco Bianchi · non-EU AI/SaaS founder · pre-seed · arriving Berlin in 6 weeks.
**Why this cut?** Two minutes is too tight for onboarding *and* the magic. We skip onboarding and open mid-flow: Marco is already in. We spend the budget on the three screens that make judges go "oh."

---

## Pre-flight (run T-60s, before you walk on)

| ✔ | Check |
|---|---|
| ☐ | Backend up: `http://127.0.0.1:8000/docs` returns 200. |
| ☐ | Frontend up: `http://localhost:8080/home` renders the Home cards. |
| ☐ | Browser zoom = 110% (judges in the back row will thank you). |
| ☐ | Open **4 tabs in this order**: `/home`, `/ask`, `/network`, `/dashboard`. Focus the `/home` tab. |
| ☐ | On `/network`, default lens = **Globe**, filter = **All topics**. (Reset if you've poked at it.) |
| ☐ | On `/dashboard`, persona toggle = **Marco (new)**. |
| ☐ | Sidebar collapsed so the page content is wider. |
| ☐ | Close every other window. Slack notifications off. |
| ☐ | Have this script on your phone or a printed half-page. **Do not read it on stage** — glance only. |

**Question text you'll type** (copy it into clipboard so you don't fumble):

> Which tax advisor is good for a VC-backed GmbH in Berlin?

---

## The script (2:00 total)

### Beat 1 — Open frame  (0:00 → 0:08, 8s)

**Screen:** `/home` — Marco's name and "Trust Score" visible in the sidebar.

**Say:**

> "This is Marco — non-EU founder, pre-seed AI SaaS, lands in Berlin in six weeks. He's just joined the network. Watch what happens when he asks his first real question."

**Click:** sidebar → **Ask**.

---

### Beat 2 — Ask & Discover  (0:08 → 1:10, 62s) — THE CENTERPIECE

**Screen:** `/ask` with empty input.

**Type** (or paste): `Which tax advisor is good for a VC-backed GmbH in Berlin?` → press Enter.

**Say** (while typing):

> "Most networks would route this to a public thread and make Marco wait. Ours checks the network's existing trusted answers first."

**Screen:** result cards render. Top card carries the trust evidence chips.

**Point at the top card.** Say:

> "Top result: rated helpful by [N] founders, strong stage fit, category authority in Tax/Admin. That's not a like count — it's the trust score. Validations weighted 25%, impact 20%, helpfulness 20%, fit 15% — straight from our spec."

**Click:** the **This answer fits** button on the top card.

**Say:**

> "When Marco marks this as fitting, two things happen. The answer provider's helpfulness score goes up. And — only because the provider opted in — the follow-up path opens."

**Click:** **Request follow-up** on the same card.

**Screen:** follow-up modal appears with "Your profile and question context will be shared only after you approve."

**Say:**

> "Notice the consent line. The agent drafts the outreach. The provider's identity never leaks until both sides agree. Privacy isn't a setting — it's structural."

**Click:** modal **Cancel** (or close).

---

### Beat 3 — My Network (globe)  (1:10 → 1:40, 30s)

**Click:** sidebar → **My Network**.

**Screen:** globe spins, dots pulse.

**Say:**

> "Here's Marco's actual trust reach — every dot is a real connection, animated arcs are introductions. First degree solid, second degree dotted."

**Click:** a topic chip (try **Funding** or **Legal**).

**Say:**

> "Filter by topic — instantly see who in his network is trusted *for this exact problem*."

**Hover** over a second-degree node (the smaller, dotted-line ones).

**Say:**

> "Second-degree contacts surface as *introducible* — never as exposed identities. That's the PRD rule, enforced in the rendering."

---

### Beat 4 — Dashboard  (1:40 → 1:58, 18s)

**Click:** sidebar → **Dashboard**.

**Screen:** Marco's metrics, with the persona toggle at the top.

**Say:**

> "Private metrics. Marco's trust score, helpfulness, where he's strong. The seven weights you saw are spelled out — and computed in code."

**Click:** persona toggle → **Established member**.

**Say:**

> "Same math, different person — proves it's not hard-coded."

---

### Beat 5 — Handoff  (1:58 → 2:00, 2s)

**Click:** sidebar → **Ask** (leaves judges on the magic screen for Q&A backdrop).

**Say:**

> "Every answer Marco marks as fitting becomes a better starting point for the next founder. That's the whole product."

**[End demo. Return to slide 5 — "Why this lasts."]**

---

## If something breaks (rehearse these)

| What broke | What to say (keep moving) |
|---|---|
| Ask returns 0 results | "The retrieval is live — let me show the path with the second example." Click any of the seeded sample questions on the page. |
| Globe loads slowly | "While the globe renders — three lenses on this page: globe for *where*, graph for *how*, list for *who*. Same data, three lenses." |
| Wrong tab / lost place | "Let me reset." `Ctrl+L`, type `localhost:8080/ask`, Enter. **Don't apologize twice.** |
| Backend 500 on follow-up | "The consent gate is what matters here — the API would draft the message and wait for Marco's approval. Moving on." |
| Total freeze | Close laptop lid, reopen. While it wakes: "While my machine wakes up — Delta Connector is the agentic trust layer for Berlin's startup ecosystem. Three principles: trust-unlocked, privacy-by-construction, compounding." Then resume from `/ask`. |

---

## Tight time discipline

- **Don't type the question slowly.** Paste it. Type-while-talking always overruns.
- **Don't read the trust-evidence chips out loud.** Point and say "this is the trust evidence." Judges read fast.
- **Don't tour the sidebar.** Each click is a sentence — anything else burns budget.
- **Don't apologize for the seed data.** Say "Marco's network" as if it's real. It is, for the demo.
- **If you're at 1:30 and still on Ask, skip the Dashboard.** Globe + handoff is enough; the deck covered the trust math.

---

## One-line cold open (if the slide deck didn't run)

> "Delta Connector — the agentic trust layer for Berlin's startup ecosystem. Two minutes, one founder, three screens. Go."
