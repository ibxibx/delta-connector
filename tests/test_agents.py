"""Minimal test harness for the matcher agents.

No framework needed: run `python tests/test_agents.py` from the repo root.
Exits non-zero on first failure so it works in CI or a pre-commit hook.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from agents.champion_matcher import match_champions
from agents.mentor_matcher import match_mentors


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
