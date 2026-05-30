# API Contract — Delta-Connector

Single source of truth between backend, knowledge graph, and Lovable frontend. Lock this first; everyone builds against it.

Base URL (local dev): `http://localhost:8000`

---

## POST /match

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
