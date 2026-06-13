"""Convert Lauritz's Supabase export -> backend/data/answers.json.

Input columns (from the Supabase snippet):
  answer_id, question, industry, sphere, agent_source, answer_content, score

This is a SEPARATE converter from convert.py because the Supabase export has a
different shape than the CSV template. Run from this folder:
  python convert_supabase.py

Mapping decisions (kept explicit, not hidden):
  - answer_content      -> answer_text
  - industry + sphere   -> help_categories  (so /ask can match on them)
  - score (4.2-5.0)     -> helpfulness_count + fit_confirmations (scaled) and trust_evidence
  - agent_source        -> trust_evidence framing (champion vs mentor)
  - question            -> question_text (bonus context; backend may show it)
  - stage_context       -> "any"  (the data is not stage-specific; don't fake a stage)
  - provider_confirmed  -> true   (curated answers)
"""
from __future__ import annotations
import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
CSV_IN = HERE / "answers_with_context.csv"
JSON_OUT = HERE.parent / "backend" / "data" / "answers.json"


def main():
    if not CSV_IN.exists():
        print(f"ERROR: '{CSV_IN.name}' not found in this folder.")
        sys.exit(1)

    rows = list(csv.DictReader(CSV_IN.open(encoding="utf-8-sig")))
    if not rows:
        print("ERROR: file has no data rows.")
        sys.exit(1)

    answers = []
    errors = []
    for i, r in enumerate(rows, start=2):
        text = (r.get("answer_content") or "").strip()
        industry = (r.get("industry") or "").strip()
        sphere = (r.get("sphere") or "").strip()
        agent = (r.get("agent_source") or "").strip()
        question = (r.get("question") or "").strip()
        raw_id = (r.get("answer_id") or "").strip()

        if not text:
            errors.append(f"row {i}: answer_content empty")
            continue

        try:
            score = float(r.get("score") or 0)
        except ValueError:
            errors.append(f"row {i}: score not a number ('{r.get('score')}')")
            score = 0.0

        # score (4.2-5.0) -> helpfulness 6..24, fit ~ 2/3 of that
        helpfulness = round(6 + (score - 4.0) * 18)
        fits = round(helpfulness * 0.66)

        categories = [c for c in (industry, sphere) if c]

        if agent == "champion_matcher":
            evidence = f"Top-expert answer · score {score:.1f}/5 · helpful for {helpfulness} founders"
        elif agent == "mentor_matcher":
            evidence = f"Mentor with relevant experience · score {score:.1f}/5 · helpful for {helpfulness} founders"
        else:
            evidence = f"Score {score:.1f}/5 · helpful for {helpfulness} founders"

        answers.append({
            "id": f"answer_{i-1:03d}",
            "answer_text": text,
            "answer_provider_id": raw_id[:8] or f"actor_{i:03d}",
            "question_text": question,
            "help_categories": categories,
            "stage_context": "any",
            "helpfulness_count": helpfulness,
            "fit_confirmations": fits,
            "follow_up_requests": 0,
            "trust_evidence": evidence,
            "provider_confirmed": True,
            "visibility": "network_only",
            "agent_source": agent,
        })

    if errors:
        print(f"FOUND {len(errors)} problem(s) — nothing written:")
        for e in errors:
            print("  -", e)
        sys.exit(1)

    out = {"answers": answers, "_note": "Generated from Supabase export by convert_supabase.py."}
    JSON_OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"OK: wrote {len(answers)} answers to {JSON_OUT}")


if __name__ == "__main__":
    main()
