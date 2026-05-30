import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Delta Connector" }] }),
  component: Onboarding,
});

const stakeholderTypes = ["Founder","Ex-Founder","Investor","Lawyer","Tax Advisor","Accountant","Mentor","Accelerator","Coworking Space","Public Institution","Corporate Partner","Recruiter","Relocation / Housing Partner","Other Helper"];
const mainProfiles = ["Software Developer","Data Scientist","Designer","Product Manager","Founder / CEO","Marketing / Growth","Sales / BD","Operations","Researcher","Other"];
const stages = ["Idea","Pre-incorporation","Pre-seed","Seed","Series A+","Scaling"];
const industries = ["AI SaaS","FinTech","ClimateTech","DeepTech","HealthTech","Marketplace","Consumer","Other"];
const needs = ["Visa","Housing","Anmeldung","GmbH setup","Tax advisor","Lawyer","Funding","Co-founder","Coworking","Hiring","Product","First customers"];
const helps = ["AI product","Pitch feedback","Fundraising","Legal intro","Tax intro","Hiring","Community","Product strategy","GTM"];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [labels, setLabels] = useState<string[]>(["Founder"]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["Tax advisor","Funding"]);
  const [selectedHelps, setSelectedHelps] = useState<string[]>(["AI product","Pitch feedback"]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-md gradient-agentic grid place-items-center text-white"><Sparkles className="size-4" /></div>
            <span className="font-semibold">Delta Connector</span>
          </Link>
          <div className="text-xs text-muted-foreground">Step {step} of 2</div>
        </div>
        <div className="h-1 bg-elevated">
          <div className="h-1 gradient-agentic transition-all" style={{ width: `${(step/2)*100}%` }} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === 1 && (
          <Card className="p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Tell us who you are</h1>
            <p className="text-sm text-muted-foreground mt-1">We use this to route trusted answers and people to you.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Name"><Input defaultValue="Marco Bianchi" className="h-11 text-base font-semibold" /></Field>
              <Field label="Email"><Input defaultValue="marco@example.com" className="h-11 text-base font-semibold" /></Field>
              <Field label="Location"><Input defaultValue="Berlin" className="h-11 text-base font-semibold" /></Field>
              <Field label="Preferred language">
                <Select defaultValue="en">
                  <SelectTrigger className="h-11 text-base font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Citizenship(s)"><Input defaultValue="Italian" placeholder="e.g. Italian, German" className="h-11 text-base font-semibold" /></Field>
              <Field label="Main profile">
                <Select defaultValue="Software Developer">
                  <SelectTrigger className="h-11 text-base font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent>{mainProfiles.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
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

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < 2 ? (
            <Button className="bg-primary hover:bg-primary-hover" onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button className="bg-primary hover:bg-primary-hover" onClick={() => nav({ to: "/dashboard" })}>
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
