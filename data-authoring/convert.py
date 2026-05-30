"""Convert answers.csv (Lauritz's authoring) -> backend/data/answers.json.

Run from this folder:  python convert.py
Validates every row and refuses to write a broken file — it lists the bad rows instead.
"""
from __future__ import annotations
import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
CSV_IN = HERE / "answers.csv"
JSON_OUT = HERE.parent / "backend" / "data" / "answers.json"

CATEGORIES = {
    "Legal", "Tax/Admin", "Funding", "Housing", "Workspace", "Visa/Relocation",
    "Talent/Hiring", "Co-Founder", "Product/Tech", "Sales/GTM", "Public Funding",
    "Mentoring", "Community", "Customer Access", "Corporate Pilot", "Personal Support",
}
STAGES = {"arriving", "pre-incorporation", "pre-seed", "seed", "growth", "any"}


def _to_int(val, field, row_no, errors):
    try:
        return int(str(val).strip() or 0)
    except ValueError:
        errors.append(f"row {row_no}: '{field}' must be a number, got '{val}'")
        return 0


def main():
    if not CSV_IN.exists():
        print(f"ERROR: {CSV_IN.name} not found. Export your sheet as 'answers.csv' into this folder.")
        sys.exit(1)

    rows = list(csv.DictReader(CSV_IN.open(encoding="utf-8-sig")))
    if not rows:
        print("ERROR: answers.csv has no data rows.")
        sys.exit(1)

    errors = []
    answers = []
    for i, r in enumerate(rows, start=2):  # row 2 = first data row (row 1 = header)
        text = (r.get("answer_text") or "").strip()
        cats_raw = (r.get("help_categories") or "").strip()
        stage = (r.get("stage_context") or "").strip()
        trust = (r.get("trust_evidence") or "").strip()

        if not text:
            errors.append(f"row {i}: answer_text is empty")
        cats = [c.strip() for c in cats_raw.split("|") if c.strip()]
        if not cats:
            errors.append(f"row {i}: help_categories is empty")
        for c in cats:
            if c not in CATEGORIES:
                errors.append(f"row {i}: unknown category '{c}' (check spelling/case)")
        if stage not in STAGES:
            errors.append(f"row {i}: unknown stage_context '{stage}'")
        if not trust:
            errors.append(f"row {i}: trust_evidence is empty")

        helpful = _to_int(r.get("helpfulness_count"), "helpfulness_count", i, errors)
        fits = _to_int(r.get("fit_confirmations"), "fit_confirmations", i, errors)
        follow = _to_int(r.get("follow_up_requests", 0), "follow_up_requests", i, errors)
        if fits > helpful:
            errors.append(f"row {i}: fit_confirmations ({fits}) > helpfulness_count ({helpful})")

        confirmed = str(r.get("provider_confirmed", "TRUE")).strip().upper() != "FALSE"

        answers.append({
            "id": f"answer_{i-1:03d}",
            "answer_text": text,
            "answer_provider_id": f"actor_{(i % 20) + 1:03d}",  # spread across sample providers
            "help_categories": cats,
            "stage_context": stage,
            "helpfulness_count": helpful,
            "fit_confirmations": fits,
            "follow_up_requests": follow,
            "trust_evidence": trust,
            "provider_confirmed": confirmed,
            "visibility": "network_only",
        })

    if errors:
        print(f"FOUND {len(errors)} problem(s) — fix these rows, nothing was written:\n")
        for e in errors:
            print("  -", e)
        sys.exit(1)

    out = {"answers": answers, "_note": "Generated from data-authoring/answers.csv by convert.py."}
    JSON_OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"OK: wrote {len(answers)} answers to {JSON_OUT}")
    print("Run the backend tests to confirm: python ../tests/test_agents.py")


if __name__ == "__main__":
    main()
