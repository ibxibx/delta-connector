import csv, json, os

D = os.path.dirname(os.path.abspath(__file__))
prof_p = os.path.join(D, "user_profiles.csv")
feed_p = os.path.join(D, "qa_feed.csv")
ctx_p  = os.path.join(D, "answers_with_context.csv")

with open(prof_p, encoding="utf-8") as f: profiles = list(csv.DictReader(f))
with open(feed_p, encoding="utf-8") as f: feed = list(csv.DictReader(f))
with open(ctx_p, encoding="utf-8") as f: ctx = list(csv.DictReader(f))

# Full answer text lookup: (question, score) -> answer_content  (sphere disambiguates dup scores)
full = {}
for r in ctx:
    key = (r["question"].strip(), r["score"].strip(), r["sphere"].strip())
    full.setdefault(key, []).append(r["answer_content"].strip())

helpers = [p for p in profiles if p["role"] in ("champion", "mentor")]
def strengths(s):
    try: return json.loads(s)
    except Exception: return []

by_name = {}
out_helpers = []
for p in helpers:
    name = p["name"].strip()
    parts = name.split(" ")
    initials = (parts[0][:1] + (parts[-1][:1] if len(parts) > 1 else "")).upper()
    h = {
        "id": p["id"], "name": name, "initials": initials,
        "email": p["email"].strip(), "role": p["role"].strip(),
        "title": p["field"].strip(), "industry": p["industry"].strip(),
        "location": p["location"].strip(), "avatar": p["avatar_url"].strip(),
        "bio": p["bio"].strip(), "strengths": strengths(p["top_strengths"]),
        "yearsInCity": int(p["years_in_city"] or 0),
        "verified": p["verified"].strip().lower() == "true",
        "trustScore": float(p["score"] or 0), "helpfulness": float(p["helpfulness_score"] or 0),
        "foundersHelped": int(p["founders_helped"] or 0), "networkReach": int(p["network_reach"] or 0),
    }
    out_helpers.append(h); by_name[name] = h

# Group feed by question; attach full answer text by matching score within the question+sphere bucket.
from collections import OrderedDict
questions = OrderedDict()
used = {}
for r in feed:
    q = r["question"].strip()
    if q not in questions:
        questions[q] = {"question": q, "industry": r["industry"].strip(), "sphere": r["sphere"].strip(), "answers": []}
    if r["type"] == "answer":
        key = (q, r["score"].strip(), r["sphere"].strip())
        pool = full.get(key, [])
        idx = used.get(key, 0)
        text = pool[idx] if idx < len(pool) else (pool[0] if pool else r["content_preview"].strip())
        used[key] = idx + 1
        questions[q]["answers"].append({
            "name": r["name"].strip(), "role": r["role"].strip(),
            "text": text, "score": float(r["score"] or 0),
        })

print("helpers", len(out_helpers), "questions", len(questions))
json.dump({"helpers": out_helpers, "questions": list(questions.values())},
          open(os.path.join(D, "_data.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("wrote _data.json")
