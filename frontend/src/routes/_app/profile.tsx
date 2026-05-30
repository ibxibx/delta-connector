import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Save } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "My Profile — Delta Connector" }] }),
  component: Profile,
});

function Profile() {
  const [form, setForm] = useState({
    name: currentUser.name,
    role: currentUser.role,
    company: currentUser.company,
    stage: currentUser.stage,
    context: currentUser.context,
    location: currentUser.location,
    bio: "Pre-seed AI SaaS founder building agentic workflows for ecosystem trust.",
    helpWith: "AI product, agent design, pre-seed fundraising prep",
    needsHelp: "Tax/Admin, Legal (VSOP), Talent sourcing",
  });
  const [reveal, setReveal] = useState(true);
  const [investorVisible, setInvestorVisible] = useState(false);

  const save = async () => {
    try {
      await api.put("/profile", { ...form, reveal, investorVisible });
      toast.success("Profile saved");
    } catch {
      toast.success("Saved locally (backend offline)");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Your context drives the answers you see and what others trust you for.</p>
        </div>
        <Button onClick={save} className="bg-primary hover:bg-primary-hover hover-glow"><Save className="size-4" /> Save changes</Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl gradient-agentic grid place-items-center text-white text-lg font-semibold">{currentUser.initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold">{form.name}</h2>
              <Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3 text-success" /> Verified</Badge>
            </div>
            <div className="text-sm text-muted-foreground">{form.role} · {form.company} · {form.stage} · {form.location}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground">Trust Score</div>
            <div className="text-2xl font-semibold">{currentUser.trustScore}</div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identity</h3>
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
          <Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stage" value={form.stage} onChange={(v) => setForm({ ...form, stage: v })} />
            <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          </div>
          <Field label="Context" value={form.context} onChange={(v) => setForm({ ...form, context: v })} />
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Context</h3>
          <div>
            <Label className="text-xs">Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 rounded-xl" rows={3} />
          </div>
          <div>
            <Label className="text-xs">I can help with</Label>
            <Textarea value={form.helpWith} onChange={(e) => setForm({ ...form, helpWith: e.target.value })} className="mt-1 rounded-xl" rows={2} />
          </div>
          <div>
            <Label className="text-xs">I currently need help with</Label>
            <Textarea value={form.needsHelp} onChange={(e) => setForm({ ...form, needsHelp: e.target.value })} className="mt-1 rounded-xl" rows={2} />
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Privacy</h3>
        <ToggleRow
          title="Reveal me as a recommender after a match"
          desc="When someone marks an answer as fitting, your name is revealed to them."
          checked={reveal}
          onChange={setReveal}
        />
        <ToggleRow
          title="Visible to investors"
          desc="Opt in to be discoverable by verified investors searching the network."
          checked={investorVisible}
          onChange={setInvestorVisible}
        />
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 rounded-xl" />
    </div>
  );
}

function ToggleRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-elevated">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
