# Data Authoring Kit — for Lauritz (120 Q&A mock data)

Everything you need to author the 120 answers so they drop straight into the backend with zero
reformatting. Author in the CSV template, run the converter, commit the output. Done.

## TL;DR
1. Open `answers_template.csv` (or copy it into Google Sheets).
2. Fill one row per answer — 120 rows. Keep the header row exactly as-is.
3. Export/download as CSV named `answers.csv` into this folder.
4. Run: `python convert.py` (from this folder).
5. It writes `../backend/data/answers.json` and tells you if any row is invalid.
6. Commit. The `/ask` endpoint now serves your 120 answers.

---

## The fields (one row = one answer)

| Column | Required | What it is | Example |
| --- | --- | --- | --- |
| `answer_text` | yes | The actual advice, 1–3 sentences, specific and useful | "For a VC-backed GmbH, choose a tax advisor with DATEV, payroll, and investor-reporting experience." |
| `help_categories` | yes | One or more, pipe-separated, from the category list below | `Tax/Admin` or `Legal\|Visa/Relocation` |
| `stage_context` | yes | Which founder stage this fits (see list) | `pre-seed` |
| `helpfulness_count` | yes | How many founders it helped (a number; drives ranking + trust) | `12` |
| `fit_confirmations` | yes | How many marked it as fitting (a number, ≤ helpfulness_count) | `8` |
| `follow_up_requests` | no | Times a follow-up was requested (number, default 0) | `3` |
| `trust_evidence` | yes | Short anonymized trust line shown on the card — NO names | "Helpful for 12 founders. Verified in Tax/Admin." |
| `provider_confirmed` | no | `TRUE`/`FALSE` — only TRUE answers ever show (default TRUE) | `TRUE` |

Notes:
- `id` and `answer_provider_id` are generated automatically — don't add them.
- **No real names or identities** in `trust_evidence` (privacy rule: anonymized trust first).
- Keep `fit_confirmations` ≤ `helpfulness_count` (the converter warns if not).

### Allowed `help_categories` (use these exact spellings, pipe-separated for multiple)
Legal · Tax/Admin · Funding · Housing · Workspace · Visa/Relocation · Talent/Hiring · Co-Founder ·
Product/Tech · Sales/GTM · Public Funding · Mentoring · Community · Customer Access · Corporate Pilot · Personal Support

### Allowed `stage_context`
arriving · pre-incorporation · pre-seed · seed · growth · any

---

## Coverage tip (so /ask finds them)
Aim to spread the 120 across categories and stages, weighted toward the demo persona's needs:
Tax/Admin, Legal, Visa/Relocation, Housing, Funding, Workspace. The Maya demo asks about a
"tax advisor for a VC-backed GmbH" — make sure several strong Tax/Admin + pre-seed answers exist.

## Questions to base answers on
You can also keep a `questions.csv` for realism, but only the answers feed `/ask`. If you want
questions linked, add a `question_text` column to the answers CSV and we'll wire it — ask Ian.
