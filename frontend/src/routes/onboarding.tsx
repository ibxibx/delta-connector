import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Delta Connector" }] }),
  component: Onboarding,
});

const stakeholderTypes = ["Founder","Ex-Founder","Investor","Lawyer","Tax Advisor","Accountant","Mentor","Accelerator","Coworking Space","Public Institution","Corporate Partner","Recruiter","Relocation / Housing Partner","Other Helper"];
const stages = ["Idea","Pre-incorporation","Pre-seed","Seed","Series A+","Scaling"];
const industries = ["AI SaaS","FinTech","ClimateTech","DeepTech","HealthTech","Marketplace","Consumer","Other"];
const needs = ["Visa","Housing","Anmeldung","GmbH setup","Tax advisor","Lawyer","Funding","Co-founder","Coworking","Hiring","Product","First customers"];
const helps = ["AI product","Pitch feedback","Fundraising","Legal intro","Tax intro","Hiring","Community","Product strategy","GTM"];

type Rec = { id: string; name: string; email: string; category: string; impact: number; strength: string };

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [labels, setLabels] = useState<string[]>(["Founder"]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["Tax advisor","Funding"]);
  const [selectedHelps, setSelectedHelps] = useState<string[]>(["AI product","Pitch feedback"]);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [showRec, setShowRec] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-md gradient-agentic grid place-items-center text-white"><Sparkles className="size-4" /></div>
            <span className="font-semibold">Delta Connector</span>
          </Link>
          <div className="text-xs text-muted-foreground">Step {step} of 4</div>
        </div>
        <div className="h-1 bg-elevated">
          <div className="h-1 gradient-agentic transition-all" style={{ width: `${(step/4)*100}%` }} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === 1 && (
          <Card className="p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Tell us who you are</h1>
            <p className="text-sm text-muted-foreground mt-1">We use this to route trusted answers and people to you.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Name"><Input defaultValue="Maya Chen" /></Field>
              <Field label="Email"><Input defaultValue="maya@example.com" /></Field>
              <Field label="Location"><Input defaultValue="Berlin" /></Field>
              <Field label="Preferred language">
                <Select defaultValue="en">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-6">
              <Label className="text-sm">Stakeholder type <span className="text-muted-foreground font-normal">(multi-select)</span></Label>
              <ChipGroup options={stakeholderTypes} selected={labels} onChange={setLabels} />
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Your startup context</h1>
            <p className="text-sm text-muted-foreground mt-1">Helps us tune answer relevance and stage fit.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Company stage">
                <Select defaultValue="Pre-seed"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Industry">
                <Select defaultValue="AI SaaS"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{industries.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <div className="mt-6">
              <Label className="text-sm">Current needs</Label>
              <ChipGroup options={needs} selected={selectedNeeds} onChange={setSelectedNeeds} />
            </div>
            <div className="mt-6">
              <Label className="text-sm">Can help with</Label>
              <ChipGroup options={helps} selected={selectedHelps} onChange={setSelectedHelps} />
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Contribute to the graph</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Optional but powerful: recommend 1–8 people who genuinely helped you or could help other founders.
              They only become visible after they confirm and opt in.
            </p>

            <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              <Lock className="size-4 text-primary shrink-0 mt-0.5" />
              <span>Private until confirmed. Recommender identities are anonymized by default.</span>
            </div>

            <div className="mt-6 space-y-3">
              {recs.map((r) => (
                <Card key={r.id} className="p-4 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-elevated grid place-items-center text-xs font-semibold">{r.name.split(" ").map(s=>s[0]).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.category} · Impact {r.impact}/5 · {r.strength}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]"><Lock className="size-3 mr-1" /> Pending invite</Badge>
                  <Button size="icon" variant="ghost" onClick={() => setRecs(recs.filter(x => x.id !== r.id))}><X className="size-4" /></Button>
                </Card>
              ))}
            </div>

            {showRec ? (
              <RecommendationForm
                onCancel={() => setShowRec(false)}
                onAdd={(r) => { setRecs([...recs, { ...r, id: crypto.randomUUID() }]); setShowRec(false); }}
              />
            ) : (
              <Button variant="outline" className="mt-4 w-full" onClick={() => setShowRec(true)} disabled={recs.length >= 8}>
                <Plus className="size-4" /> Add recommendation
              </Button>
            )}
          </Card>
        )}

        {step === 4 && (
          <Card className="p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Your starting dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Here's what you'll see when you enter the network.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Trust Score" value="72" />
              <Metric label="Contribution" value="58" />
              <Metric label="Network Reach" value="1,248" />
              <Metric label="Categories" value="7 / 16" />
            </div>
            <div className="mt-6 rounded-md border bg-elevated p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Suggested next actions</div>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="size-4 text-success" /> Ask your first question in Ask & Discover</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-success" /> Follow up with one of your recommended people</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-success" /> Complete your visibility settings</li>
              </ul>
            </div>
          </Card>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < 4 ? (
            <Button className="bg-primary hover:bg-primary-hover" onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button className="bg-primary hover:bg-primary-hover" onClick={() => nav({ to: "/home" })}>
              Enter the network <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-sm">{label}</Label><div className="mt-1.5">{children}</div></div>;
}

function ChipGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(active ? selected.filter(s => s !== opt) : [...selected, opt])}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border hover:border-primary/40"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-surface p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function RecommendationForm({ onAdd, onCancel }: { onAdd: (r: Omit<Rec, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Tax/Admin");
  const [impact, setImpact] = useState(4);
  const [strength, setStrength] = useState("Good");
  return (
    <Card className="p-5 mt-4 border-primary/30">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Person name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Weber" /></Field>
        <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" /></Field>
        <Field label="Help category">
          <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Tax/Admin","Legal","Funding","Hiring","Product","Community","GTM"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Recommendation strength">
          <Select value={strength} onValueChange={setStrength}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Light","Good","Strong"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <div className="mt-3">
        <Field label="How did this person help?"><Textarea placeholder="They guided us through GmbH setup and DATEV..." rows={2} /></Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Label className="text-sm">Impact</Label>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setImpact(n)} className={`size-7 rounded-full text-xs ${impact >= n ? "bg-primary text-white" : "bg-elevated text-muted-foreground"}`}>{n}</button>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button className="bg-primary hover:bg-primary-hover" disabled={!name} onClick={() => onAdd({ name, email, category, impact, strength })}>Add recommendation</Button>
      </div>
    </Card>
  );
}
