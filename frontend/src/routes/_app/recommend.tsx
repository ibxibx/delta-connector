import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lock, Check, X, Plus, Sparkles } from "lucide-react";
import { initialRecommendations, receivedRecommendations } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recommend")({
  head: () => ({ meta: [{ title: "Recommend — Delta Connector" }] }),
  component: Recommend,
});

const categories = ["Tax/Admin", "Legal", "Funding", "Talent/Hiring", "Workspace", "Mentoring", "AI Product", "Visa", "GTM"];

function Recommend() {
  const [given, setGiven] = useState(initialRecommendations);
  const [form, setForm] = useState({ name: "", category: "Tax/Admin", impact: "5", why: "" });

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Add a name first");
    const payload = { name: form.name, category: form.category, impact: Number(form.impact), why: form.why };
    try {
      await api.post("/recommendations", payload);
    } catch {
      /* offline ok */
    }
    setGiven([
      { id: `r${Date.now()}`, name: form.name, category: form.category, impact: Number(form.impact), status: "Pending invite", visibility: "Private" },
      ...given,
    ]);
    setForm({ name: "", category: "Tax/Admin", impact: "5", why: "" });
    toast.success("Recommendation added — invite sent privately");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recommend</h1>
        <p className="text-sm text-muted-foreground mt-1">Help the network grow trust. Recommend people who've actually helped you.</p>
      </div>

      <Card className="p-6 hover-glow">
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-md gradient-agentic grid place-items-center text-white"><Sparkles className="size-3.5" /></div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Add a recommendation</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Who are you recommending?</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (or email if they're not on Delta yet)" className="mt-1 rounded-xl" />
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full h-9 rounded-xl border bg-surface px-3 text-sm">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Impact (1–5)</Label>
            <Input type="number" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="mt-1 rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Why are they great? (private, helps matching)</Label>
            <Textarea value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} placeholder="e.g. Saved us 2 months on GmbH setup, deeply understands VSOP for German startups…" rows={3} className="mt-1 rounded-xl" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Lock className="size-3" /> Pending invitees stay private until they confirm and opt in.</div>
          <Button onClick={submit} className="bg-primary hover:bg-primary-hover hover-glow"><Plus className="size-4" /> Send recommendation</Button>
        </div>
      </Card>

      <Tabs defaultValue="given">
        <TabsList>
          <TabsTrigger value="given">Given ({given.length})</TabsTrigger>
          <TabsTrigger value="received">Received ({receivedRecommendations.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({given.filter((g) => g.status === "Pending invite").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="given" className="mt-4 space-y-3">
          {given.map((r) => (
            <Card key={r.id} className="p-4 flex items-center gap-3 hover-glow">
              <div className="size-10 rounded-2xl bg-elevated grid place-items-center text-xs font-semibold">{r.name.split(" ").map((s) => s[0]).join("")}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.category} · Impact {r.impact}/5 · {r.visibility}</div>
              </div>
              <Badge className={r.status === "Confirmed" ? "bg-success/10 text-success border-success/20" : ""} variant={r.status === "Confirmed" ? "default" : "outline"}>{r.status}</Badge>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="received" className="mt-4 space-y-3">
          {receivedRecommendations.map((r) => (
            <Card key={r.id} className="p-4 hover-glow">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium text-sm">{r.from} · <span className="text-muted-foreground font-normal">{r.category}</span></div>
                  <div className="text-sm mt-1">{r.help}</div>
                  <div className="text-xs text-muted-foreground mt-1">Impact {r.impact}/5</div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={() => toast.success("Accepted")}><Check className="size-3.5" /> Accept</Button>
                  <Button size="sm" variant="ghost"><X className="size-3.5" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {given.filter((g) => g.status === "Pending invite").map((r) => (
            <Card key={r.id} className="p-4 flex items-center justify-between hover-glow">
              <div>
                <div className="font-medium text-sm">{r.name} · <span className="text-muted-foreground font-normal">{r.category}</span></div>
                <div className="text-xs text-muted-foreground mt-1">Invitation sent · awaiting opt-in</div>
              </div>
              <Button size="sm" variant="outline">Resend invite</Button>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
