# API Contract — Delta-Connector

Single source of truth between backend, knowledge graph, and Lovable frontend. Lock this first; everyone builds against it.

Base URL (local dev): `http://localhost:8000`

---

## POST /ask  (PRD Core Flow 2 — Ask & Discover)

The demo-critical endpoint. A founder asks a question; the answer-retrieval agent returns ranked
previous answers as MatchResult cards with anonymized trust evidence. If none fit, the client offers
"post publicly". Provider identity is never included (revealed later only under consent rules).

**Request**
```json
{
  "query": "Which tax advisor is good for a VC-backed GmbH in Berlin?",
  "profile": { "stage": "pre-seed", "industry": "AI SaaS" }
}
```

**Response**
```json
{
  "query": "Which tax advisor is good for a VC-backed GmbH in Berlin?",
  "answers": [
    {
      "id": "match_answer_001",
      "matched_type": "answer",
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
```

Frontend maps each `answers[]` item directly onto `AnimatedAnswerCard` (summary, category, stage_fit,
helpfulness_count, trust_evidence). `match_score` renders as a confidence bar.

---

## POST /follow-up-draft  (PRD Outreach Agent — consent-gated)

After a user marks an answer as fitting and requests a follow-up, the agent drafts a message to the
provider. **Consent-gated**: returns a draft only when `consent_ok` is true; otherwise returns a
consent-request path and reveals nothing. The agent never sends — the user approves first (PRD §17.4).

**Request**
```json
{
  "answer_summary": "For a VC-backed GmbH, choose a tax advisor with DATEV...",
  "question": "tax advisor for a VC-backed GmbH",
  "asker_name": "Maya",
  "consent_ok": true
}
```

**Response (consent given)**
```json
{
  "status": "drafted",
  "draft": "Hi, I'm Maya.\n\nYour answer on ... was exactly what I needed ...",
  "message": "Draft ready. Review and edit before sending — nothing is sent until you approve.",
  "next_action": "approve_to_send"
}
```

**Response (no consent)**
```json
{
  "status": "consent_required",
  "draft": null,
  "message": "The answer provider hasn't opted into a follow-up yet. We can send a consent request without revealing your details.",
  "next_action": "request_consent"
}
```

---

## POST /match  (legacy matcher — champions/mentors)

The core endpoint. A newcomer describes a need; the orchestrator routes it to the champion-matcher and/or mentor-matcher agents and returns ranked results.

**Request**
```json
{
  "query": "I need help with German GmbH incorporation and a tax advisor",
  "profile": {
    "name": "Ava",
    "industry": "fintech",
    "stage": "pre-incorporation",
    "new_to_berlin": true,
    "months_in_city": 1
  },
  "want": ["champions", "mentors"]
}
```

**Response**
```json
{
  "champions": [
    {
      "id": "c_012",
      "name": "Dr. Lena Vogt",
      "field": "Legal / GmbH formation",
      "top_strengths": ["incorporation", "cap tables", "founder agreements"],
      "match_reason": "Top-ranked champion in GmbH incorporation",
      "score": 0.94
    }
  ],
  "mentors": [
    {
      "id": "m_044",
      "name": "Tomas Berg",
      "industry": "fintech",
      "years_in_berlin": 7,
      "relevance": "Founded a fintech GmbH in Berlin; mentored 4 founders",
      "score": 0.88
    }
  ]
}
```

---

## GET /champions?field=...

Direct graph lookup. Returns champions for a field with their top strengths.

## GET /mentors?industry=...&min_years=...

Direct mentor lookup, filtered by industry and minimum tenure in the city.

## POST /contribute

Pay-it-forward. A founder adds a validated recommendation (the mechanic that makes the knowledge base compound over time).

**Request**
```json
{
  "resource_type": "lawyer",
  "name": "Dr. Lena Vogt",
  "field": "GmbH formation",
  "endorsed_by": "founder_id_or_name",
  "note": "Handled our incorporation in 2 weeks"
}
```

**Response**: `{ "status": "added", "id": "c_013" }`

---

### Notes for the frontend (Lovable)
- Treat `score` as a 0–1 confidence; render as a bar or percentage.
- For the "agents working live" feel: call `/match`, show a brief per-agent progress state, then render results as they resolve.
- Mock these exact shapes first so the frontend isn't blocked on the backend.
