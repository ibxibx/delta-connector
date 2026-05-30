// Delta Connector backend API + mappers to the shapes the screens render.
// Keeps screens nearly unchanged: backend fields are mapped here, once.
import { api } from "../api";

// ---- /ask ----
export type BackendAnswer = {
  id: string;
  matched_id: string;
  match_score: number;
  question_text: string;
  answer_summary: string;
  category: string;        // comma-joined categories
  stage_fit: string;
  helpfulness_count: number;
  trust_evidence: string;
  reasons: string[];
  next_action: string;
};

// Shape the Ask screen renders (mirrors the old mock `Answer` closely).
export type UiAnswer = {
  id: string;            // matched_id (used for /answer-fits)
  question: string;      // the original question this answer responded to
  answer: string;
  categories: string[];
  stageFit: string[];
  helpfulFor: number;
  fitConfirmations: number;
  matchPct: number;      // relevance/match score as a percentage (not helpfulness)
  trustEvidence: string;
  reasons: string[];
  providerAnonymized: string;
};

function mapAnswer(a: BackendAnswer): UiAnswer {
  const cats = a.category.split(",").map((c) => c.trim()).filter(Boolean);
  return {
    id: a.matched_id,
    question: a.question_text || (a.answer_summary.slice(0, 60) + (a.answer_summary.length > 60 ? "…" : "")),
    answer: a.answer_summary,
    categories: cats,
    stageFit: [a.stage_fit],
    helpfulFor: a.helpfulness_count,
    fitConfirmations: 0, // backend doesn't return this on /ask; updated via /answer-fits
    matchPct: Math.round(a.match_score * 100),
    trustEvidence: a.trust_evidence,
    reasons: a.reasons,
    providerAnonymized: `Verified ${cats[0] ?? ""} contributor`.trim(),
  };
}

export async function ask(query: string, profile?: { stage?: string; industry?: string }) {
  const res = await api.post<{ answers: BackendAnswer[]; post_publicly_available: boolean }>(
    "/ask",
    { query, profile: profile ?? {} }
  );
  return {
    answers: res.answers.map(mapAnswer),
    postPubliclyAvailable: res.post_publicly_available,
  };
}

// ---- /answer-fits ----
export async function answerFits(answerId: string) {
  return api.post<{ status: string; fit_confirmations: number; helpfulness_count: number }>(
    "/answer-fits",
    { answer_id: answerId }
  );
}

// ---- /follow-up-draft ----
export async function followUpDraft(input: {
  answerSummary: string;
  question: string;
  askerName?: string;
  consentOk: boolean;
}) {
  return api.post<{ status: string; draft: string | null; message: string; next_action: string }>(
    "/follow-up-draft",
    {
      answer_summary: input.answerSummary,
      question: input.question,
      asker_name: input.askerName ?? "",
      consent_ok: input.consentOk,
    }
  );
}

// ---- /metrics ----
export type BackendMetrics = {
  actor_id: string;
  found: boolean;
  trust_score: number;
  trust_level: string;
  metrics: Record<string, number>;
  public_badge_eligible: boolean;
  private: boolean;
  coach_tip: string;
};

export async function getMetrics(actorId: string) {
  return api.get<BackendMetrics>(`/metrics?actor_id=${encodeURIComponent(actorId)}`);
}
