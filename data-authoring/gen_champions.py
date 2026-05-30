import json, os

D = r"C:\Users\damya\Projects\Delta-Connector\data-authoring"
OUT = r"C:\Users\damya\Projects\Delta-Connector\frontend\src\lib\champions.ts"
data = json.load(open(os.path.join(D, "_data.json"), encoding="utf-8"))
helpers = data["helpers"]
questions = data["questions"]
by_name = {h["name"]: h for h in helpers}

def s(v): return json.dumps(v, ensure_ascii=False)

L = []
L.append("// AUTO-GENERATED from Supabase exports (user profiles + Q&A feed + answer context).")
L.append("// Champions & mentors who answer founder questions across Berlin's ecosystem.")
L.append("// Regenerate via data-authoring/gen_champions.py")
L.append("")
L.append("export type Champion = {")
for fld, ty in [("id","string"),("name","string"),("initials","string"),("email","string"),
                ("role",'"champion" | "mentor"'),("title","string"),("industry","string"),
                ("location","string"),("avatar","string"),("bio","string"),("strengths","string[]"),
                ("yearsInCity","number"),("verified","boolean"),("trustScore","number"),
                ("helpfulness","number"),("foundersHelped","number"),("networkReach","number")]:
    L.append(f"  {fld}: {ty};")
L.append("};")
L.append("")
L.append("export type ChampionAnswer = {")
L.append("  championId: string | null; // null = peer founder answer")
L.append("  authorName: string;")
L.append("  role: string;")
L.append("  text: string;")
L.append("  score: number;")
L.append("};")
L.append("")
L.append("export type EcoQuestion = {")
L.append("  id: string;")
L.append("  question: string;")
L.append("  industry: string;")
L.append("  sphere: string;")
L.append("  answers: ChampionAnswer[];")
L.append("};")
L.append("")
L.append("export const CHAMPIONS: Champion[] = [")
for h in helpers:
    L.append("  {")
    L.append(f"    id: {s(h['id'])},")
    L.append(f"    name: {s(h['name'])},")
    L.append(f"    initials: {s(h['initials'])},")
    L.append(f"    email: {s(h['email'])},")
    L.append(f"    role: {s(h['role'])},")
    L.append(f"    title: {s(h['title'])},")
    L.append(f"    industry: {s(h['industry'])},")
    L.append(f"    location: {s(h['location'])},")
    L.append(f"    avatar: {s(h['avatar'])},")
    L.append(f"    bio: {s(h['bio'])},")
    L.append(f"    strengths: {s(h['strengths'])},")
    L.append(f"    yearsInCity: {h['yearsInCity']},")
    L.append(f"    verified: {'true' if h['verified'] else 'false'},")
    L.append(f"    trustScore: {h['trustScore']},")
    L.append(f"    helpfulness: {h['helpfulness']},")
    L.append(f"    foundersHelped: {h['foundersHelped']},")
    L.append(f"    networkReach: {h['networkReach']},")
    L.append("  },")
L.append("];")
L.append("")
L.append("export const ECO_QUESTIONS: EcoQuestion[] = [")
for i, q in enumerate(questions):
    L.append("  {")
    L.append(f"    id: {s('q%02d' % (i+1))},")
    L.append(f"    question: {s(q['question'])},")
    L.append(f"    industry: {s(q['industry'])},")
    L.append(f"    sphere: {s(q['sphere'])},")
    L.append("    answers: [")
    for a in q["answers"]:
        h = by_name.get(a["name"])
        cid = s(h["id"]) if h else "null"
        L.append("      {")
        L.append(f"        championId: {cid},")
        L.append(f"        authorName: {s(a['name'])},")
        L.append(f"        role: {s(a['role'])},")
        L.append(f"        text: {s(a['text'])},")
        L.append(f"        score: {a['score']},")
        L.append("      },")
    L.append("    ],")
    L.append("  },")
L.append("];")
L.append("")
L.append("export const championById = (id: string | null | undefined): Champion | undefined =>")
L.append("  id ? CHAMPIONS.find((c) => c.id === id) : undefined;")
L.append("")
L.append("// Resolve the best champion to surface for a given answer/category context.")
L.append("export function championForCategory(category: string): Champion | undefined {")
L.append("  const q = category.toLowerCase();")
L.append("  const scored = CHAMPIONS.map((c) => {")
L.append("    const hay = (c.title + ' ' + c.industry + ' ' + c.strengths.join(' ')).toLowerCase();")
L.append("    let score = 0;")
L.append("    for (const w of q.split(/[^a-z]+/).filter(Boolean)) if (hay.includes(w)) score += 1;")
L.append("    return { c, score };")
L.append("  }).sort((a, b) => b.score - a.score || b.c.trustScore - a.c.trustScore);")
L.append("  return scored[0]?.score ? scored[0].c : undefined;")
L.append("}")
L.append("")

open(OUT, "w", encoding="utf-8").write("\n".join(L))
print("wrote", OUT, "lines", len(L))
