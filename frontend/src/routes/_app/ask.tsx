import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Check, MessageCircle, Bookmark, X, Sparkles, Send, ShieldCheck, ThumbsUp, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { answers, stakeholders } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ask")({
  head: () => ({ meta: [{ title: "Ask & Discover — Delta Connector" }] }),
  component: Ask,
});

const stages = ["Searching previous answers…", "Checking category fit…", "Looking for founder-validated responses…", "Ranking by trust and helpfulness…"];

function Ask() {
  const [q, setQ] = useState("Which tax advisor is good for a VC-backed GmbH in Berlin?");
  const [phase, setPhase] = useState<"idle" | "processing" | "results">("idle");
  const [stageIdx, setStageIdx] = useState(0);
  const [fitted, setFitted] = useState<Record<string, boolean>>({});
  const [followupOpen, setFollowupOpen] = useState<string | null>(null);
  const [postOpen, setPostOpen] = useState(false);

  useEffect(() => {
    if (phase !== "processing") return;
    setStageIdx(0);
    const ivs: ReturnType<typeof setTimeout>[] = [];
    stages.forEach((_, i) => ivs.push(setTimeout(() => setStageIdx(i), i * 450)));
    ivs.push(setTimeout(() => setPhase("results"), stages.length * 450 + 150));
    return () => ivs.forEach(clearTimeout);
  }, [phase]);

  const submit = () => setPhase("processing");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ask & Discover</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Before you post publicly, Delta Connector searches previous trusted answers from the ecosystem.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-11" placeholder="Ask something like: Which tax advisor is good for a VC-backed GmbH in Berlin?" />
          </div>
          <Button className="h-11 bg-primary hover:bg-primary-hover" onClick={submit}>
            <Sparkles className="size-4" /> Find trusted answers
          </Button>
        </div>
        {phase === "processing" && (
          <div className="mt-4 rounded-md border bg-elevated p-3">
            {stages.map((s, i) => (
              <div key={s} className={`flex items-center gap-2 text-xs py-1 transition ${i <= stageIdx ? "text-foreground" : "text-muted-foreground/40"}`}>
                {i < stageIdx ? <Check className="size-3.5 text-success" /> : i === stageIdx ? <Sparkles className="size-3.5 text-primary animate-pulse" /> : <span className="size-3.5 rounded-full border" />}
                {s}
              </div>
            ))}
          </div>
        )}
      </Card>

      {phase === "results" && (
        <>
          <div className="text-xs text-muted-foreground">Showing 3 suggested answers · ranked by trust & helpfulness</div>
          <div className="space-y-4">
            {answers.map((a) => {
              const provider = stakeholders.find((s) => s.id === a.providerId)!;
              const isFitted = fitted[a.id];
              return (
                <Card key={a.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{a.question.replace("?", "")}</h3>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {a.categories.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                        <Badge variant="outline" className="text-[10px]">Stage fit: {a.stageFit.join(", ")}</Badge>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20 shrink-0">{a.helpfulnessPct}% Helpful</Badge>
                  </div>
                  <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{a.answer}</p>

                  <div className="mt-4 rounded-md bg-elevated p-3 grid sm:grid-cols-3 gap-3 text-xs">
                    <Evidence icon={<ThumbsUp className="size-3.5" />} label={`Helpful for ${a.helpfulFor} founders`} />
                    <Evidence icon={<Check className="size-3.5" />} label={`${a.fitConfirmations} fit confirmations`} />
                    <Evidence icon={<ShieldCheck className="size-3.5" />} label={`Verified ${a.categories[0]} contributor`} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent-purple grid place-items-center text-white text-[10px] font-semibold">
                        {isFitted ? provider.initials : "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {isFitted ? provider.name : "Provider hidden until you confirm fit"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {isFitted ? `${provider.labels[0]} · Opted into follow-ups` : a.providerAnonymized}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!isFitted ? (
                        <>
                          <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={() => { setFitted({ ...fitted, [a.id]: true }); toast.success("Answer saved to your workspace", { description: "This also improves the answer's helpfulness score." }); }}>
                            <Check className="size-3.5" /> This answer fits
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => toast("Saved")}><Bookmark className="size-3.5" /> Save</Button>
                          <Button size="sm" variant="ghost" className="text-muted-foreground"><X className="size-3.5" /> Not relevant</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setFollowupOpen(a.id)}>
                            <MessageCircle className="size-3.5" /> Request follow-up
                          </Button>
                          <Button size="sm" variant="ghost"><Bookmark className="size-3.5" /> Saved</Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-5 border-dashed">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">None of these fit?</div>
                <div className="text-sm text-muted-foreground">Post your question publicly to trusted people in matching categories.</div>
              </div>
              <Button variant="outline" onClick={() => setPostOpen(true)}>
                <MessageSquare className="size-4" /> Post publicly
              </Button>
            </div>
          </Card>
        </>
      )}

      <FollowupModal open={!!followupOpen} onClose={() => setFollowupOpen(null)} />
      <PostPublicModal open={postOpen} onClose={() => setPostOpen(false)} question={q} />
    </div>
  );
}

function Evidence({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-1.5 text-muted-foreground">{icon} <span>{label}</span></div>;
}

function FollowupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msg, setMsg] = useState(
    "Hi Alex, I found your answer about tax advisors for VC-backed GmbHs helpful. I'm building an AI SaaS company in Berlin and preparing for pre-seed. Could I ask one short follow-up about DATEV, payroll, and investor reporting setup?"
  );
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request follow-up</DialogTitle>
          <DialogDescription>Your profile and question context will be shared only after you approve.</DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-elevated p-3 text-xs space-y-1">
          <div><span className="text-muted-foreground">Context:</span> Pre-Seed · AI SaaS · Non-EU Founder · Berlin</div>
          <div><span className="text-muted-foreground">Related answer:</span> Startup-ready tax advisor for a VC-backed GmbH</div>
        </div>
        <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={6} />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary-hover" onClick={() => { toast.success("Follow-up request sent"); onClose(); }}>
            <Send className="size-4" /> Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PostPublicModal({ open, onClose, question }: { open: boolean; onClose: () => void; question: string }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Post your question publicly</DialogTitle>
          <DialogDescription>Routed to trusted people in matching categories.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input defaultValue={question} />
          <Textarea placeholder="Add context: stage, situation, what you've tried…" rows={4} />
          <div className="flex flex-wrap gap-1.5">
            {["Tax/Admin","Legal","Founder Operations"].map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
          </div>
          <div className="text-xs text-muted-foreground">
            Visibility: <span className="text-foreground">Network public</span> · Anonymous to community
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary-hover" onClick={() => { toast.success("Question routed to trusted people in Tax/Admin, Legal, and Founder Operations"); onClose(); }}>
            Post question to network
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
