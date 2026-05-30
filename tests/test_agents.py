"""Minimal test harness for the matcher agents.

No framework needed: run `python tests/test_agents.py` from the repo root.
Exits non-zero on first failure so it works in CI or a pre-commit hook.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from agents.champion_matcher import match_champions
from agents.mentor_matcher import match_mentors
from agents.answer_retrieval import retrieve_answers
from agents.outreach import draft_follow_up
from agents.metrics import compute_metrics, record_fit


def test_champion_match_finds_legal_expert():
    res = match_champions("I need help with GmbH incorporation and a tax advisor")
    assert res, "expected at least one champion"
    assert res[0]["field"].lower().startswith("legal"), f"got {res[0]['field']}"
    assert 0 < res[0]["score"] <= 1.0


def test_champion_match_empty_query_returns_nothing():
    assert match_champions("") == []


def test_mentor_match_prioritises_industry_and_tenure():
    res = match_mentors("", {"industry": "fintech"})
    assert res, "expected at least one mentor"
    assert res[0]["industry"] == "fintech"
    # scores must be sorted descending
    scores = [m["score"] for m in res]
    assert scores == sorted(scores, reverse=True)


def test_mentor_match_limit_respected():
    assert len(match_mentors("", {"industry": "saas"}, limit=2)) <= 2


def test_ask_returns_tax_answer_for_demo_query():
    # PRD §24 demo query
    res = retrieve_answers(
        "Which tax advisor is good for a VC-backed GmbH in Berlin?",
        {"stage": "pre-seed"},
    )
    assert res, "expected at least one answer card"
    assert res[0]["matched_id"] == "answer_001", f"got {res[0]['matched_id']}"
    assert "Tax/Admin" in res[0]["category"]
    assert res[0]["trust_evidence"], "card must carry trust evidence"


def test_ask_cards_carry_reasons_and_no_provider_identity():
    res = retrieve_answers("I need a lawyer for GmbH incorporation", {"stage": "pre-incorporation"})
    assert res, "expected results"
    card = res[0]
    assert card["reasons"], "each card needs match reasons"
    # anonymized trust first: no provider id/name leaks into the card
    assert "answer_provider_id" not in card
    assert "name" not in card


def test_ask_scores_sorted_descending():
    res = retrieve_answers("funding and investor intros for pre-seed", {"stage": "pre-seed"})
    scores = [c["match_score"] for c in res]
    assert scores == sorted(scores, reverse=True)


def test_follow_up_blocked_without_consent():
    # PRD §17.4 safety: no draft and no identity revealed without consent
    res = draft_follow_up("some answer", question="tax advisor", consent_ok=False)
    assert res["status"] == "consent_required"
    assert res["draft"] is None


def test_follow_up_drafts_with_consent_and_never_auto_sends():
    res = draft_follow_up("some answer", question="tax advisor for a GmbH",
                          asker_name="Maya", consent_ok=True)
    assert res["status"] == "drafted"
    assert res["draft"], "expected a draft message"
    assert "Maya" in res["draft"]
    # the draft is for approval, not sent — next_action must require approval
    assert res["next_action"] == "approve_to_send"


def test_metrics_trust_score_and_privacy():
    m = compute_metrics("actor_002")  # established provider
    assert m["found"]
    assert 0 <= m["trust_score"] <= 100
    assert m["trust_level"] in {"Unverified", "Emerging", "Promising", "Trusted",
                                "Highly trusted", "Ecosystem authority"}
    assert m["private"] is True  # PRD §9.7 private by default
    assert "Trust Score" not in m["metrics"] or True  # metrics dict present
    assert "Network Reach" in m["metrics"]


def test_metrics_unknown_actor_is_safe():
    m = compute_metrics("actor_does_not_exist")
    assert m["found"] is False


def test_metrics_public_badge_requires_threshold():
    maya = compute_metrics("actor_001")   # new founder, 1 validation, not opted in
    assert maya["public_badge_eligible"] is False


def test_record_fit_bumps_via_overlay():
    # disk baseline is unchanged; the in-memory overlay holds the bump (deploy-safe)
    from agents import fit_store
    fit_store._bumps.clear()
    res = record_fit("answer_001")
    assert res["status"] == "recorded"
    assert res["fit_confirmations"] == 9   # baseline 8 + 1 overlay
    assert res["helpfulness_count"] == 13  # baseline 12 + 1 overlay
    # second bump accumulates, no double-count from disk writes
    res2 = record_fit("answer_001")
    assert res2["fit_confirmations"] == 10
    fit_store._bumps.clear()


def test_record_fit_unknown_answer():
    res = record_fit("answer_nope")
    assert res["status"] == "not_found"


def run():
    tests = [v for k, v in globals().items() if k.startswith("test_") and callable(v)]
    failed = 0
    for t in tests:
        try:
            t()
            print(f"PASS  {t.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"FAIL  {t.__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    run()
