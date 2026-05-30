import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Check, MessageCircle, Bookmark, X, Sparkles, Send, ShieldCheck, ThumbsUp, MessageSquare, Database, Filter, BarChart3, MapPin, Mail, BadgeCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ask as askApi, answerFits, followUpDraft, type UiAnswer } from "@/lib/api/delta";
import { championForCategory, type Champion, ECO_QUESTIONS } from "@/lib/champions";
import { currentUser } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ask")({
  head: () => ({ meta: [{ title: "Ask & Discover — Delta Connector" }] }),
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    return { q: typeof search.q === "string" ? search.q : undefined };
  },
  component: Ask,
});

const agentSteps = [
  { icon: Database, label: "Retrieval", sub: "Searching previous answers" },
  { icon: Filter, label: "Category fit", sub: "Matching to your context" },
  { icon: ShieldCheck, label: "Trust check", sub: "Founder-validated responses" },
  { icon: BarChart3, label: "Ranking", sub: "Scoring by trust & helpfulness" },
];
const stages = agentSteps.map((s) => s.sub);

// A few real ecosystem questions to seed the demo (spread across domains).
const SUGGESTED = [
  "Which tax advisor in Berlin is good for VC-backed startups and handles DATEV?",
  "What is the fastest way to form a GmbH in Berlin as a non-German founder?",
  "Which Berlin VCs are actively investing in climatetech pre-seed rounds right now?",
  "We are looking for a technical co-founder with a background in energy systems in Berlin. Where should we be searching?",
].filter((s) => ECO_QUESTIONS.some((q) => q.question === s));

function Ask() {
  const { q: incomingQ } = Route.useSearch();
  const [q, setQ] = useState(incomingQ || "Which tax advisor is good for a VC-backed GmbH in Berlin?");
  const [phase, setPhase] = useState<"idle" | "processing" | "results">("idle");
  const [stageIdx, setStageIdx] = useState(0);
  const [fitted, setFitted] = useState<Record<string, boolean>>({});
  const [followupOpen, setFollowupOpen] = useState<string | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [results, setResults] = useState<UiAnswer[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  // animate the staged loading messages while the request is in flight
  useEffect(() => {
    if (phase !== "processing") return;
    setStageIdx(0);
    const ivs: ReturnType<typeof setTimeout>[] = [];
    stages.forEach((_, i) => ivs.push(setTimeout(() => setStageIdx(i), i * 600)));
    return () => ivs.forEach(clearTimeout);
  }, [phase]);

  const submit = async (queryText?: string) => {
    const query = (queryText ?? q).trim();
    if (!query) return;
    setPhase("processing");
    try {
      const { answers: got } = await askApi(query, { stage: "pre-seed", industry: "saas" });
      // keep the loading visible long enough for the agent pipeline to read
      await new Promise((r) => setTimeout(r, 1600));
      setResults(got);
      setCounts(Object.fromEntries(got.map((a) => [a.id, a.helpfulFor])));
      setPhase("results");
      if (got.length === 0) toast("No previous answers fit — you can post publicly.");
    } catch (e) {
      setPhase("idle");
      toast.error("Couldn't reach the answer service", { description: String(e) });
    }
  };

  // If we arrived from the Home ask box (?q=...), run that search automatically.
  useEffect(() => {
    if (incomingQ && incomingQ.trim()) {
      setQ(incomingQ);
      submit(incomingQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQ]);

  const markFits = async (a: UiAnswer) => {
    setFitted((f) => ({ ...f, [a.id]: true }));
    try {
      const res = await answerFits(a.id);
      setCounts((c) => ({ ...c, [a.id]: res.helpfulness_count }));
      toast.success("Answer saved to your workspace", { description: "This also improves the answer's helpfulness score." });
    } catch (e) {
      toast.error("Couldn't record that", { description: String(e) });
    }
  };

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
          <div className="relative flex-1 rounded-md border border-input field-glow transition">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} className="border-0 pl-9 h-11 focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Ask something like: Which tax advisor is good for a VC-backed GmbH in Berlin?" />
          </div>
          <Button className="h-11 bg-primary hover:bg-primary-hover transition active:scale-95" onClick={() => submit()}>
            <Sparkles className="size-4" /> Find trusted answers
          </Button>
        </div>
        {phase === "processing" && <AgentPipeline stageIdx={stageIdx} />}
        {phase === "idle" && SUGGESTED.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Try:</span>
            {SUGGESTED.map((sug) => (
              <button
                key={sug}
                onClick={() => { setQ(sug); submit(sug); }}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
              >
                {sug.length > 54 ? sug.slice(0, 52) + "…" : sug}
              </button>
            ))}
          </div>
        )}
      </Card>

      {phase === "results" && (
        <>
          <div className="text-xs text-muted-foreground">Showing {results.length} suggested answer{results.length === 1 ? "" : "s"} · ranked by trust & helpfulness</div>
          <div className="space-y-4">
            {results.map((a) => {
              const isFitted = fitted[a.id];
              return (
                <Card key={a.id} className="interactive p-5 animate-fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{a.question}</h3>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {a.categories.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                        {a.stageFit.some((s) => s && s.toLowerCase() !== "any") && (
                          <Badge variant="outline" className="text-[10px]">Stage fit: {a.stageFit.filter((s) => s.toLowerCase() !== "any").join(", ")}</Badge>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20 shrink-0">{a.matchPct}% match</Badge>
                  </div>
                  {/* When the answer fits, the long answer text shrinks to the
                      left and the champion's full profile appears on the right. */}
                  <div className={isFitted ? "mt-3 grid gap-5 md:grid-cols-[1fr_300px]" : "mt-3"}>
                    <div className="min-w-0 transition-all duration-300">
                      <p className="text-sm text-foreground/90 leading-relaxed">{a.answer}</p>

                      <div className="mt-4 rounded-md bg-elevated p-3 grid sm:grid-cols-3 gap-3 text-xs">
                        <Evidence icon={<ThumbsUp className="size-3.5" />} label={`Helpful for ${counts[a.id] ?? a.helpfulFor} founders`} />
                        <Evidence icon={<ShieldCheck className="size-3.5" />} label={a.trustEvidence} />
                        <Evidence icon={<Check className="size-3.5" />} label={a.reasons[0] ?? `Verified ${a.categories[0]}`} />
                      </div>
                    </div>

                    {isFitted && <ChampionPanel champion={championForCategory(a.categories[0] ?? a.question)} question={q} />}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {!isFitted && (
                        <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent-purple grid place-items-center text-white text-[10px] font-semibold">
                          ?
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {isFitted ? "Verified provider revealed →" : "Provider hidden until you confirm fit"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {isFitted ? "Connect directly from their profile" : a.providerAnonymized}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!isFitted ? (
                        <>
                          <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={() => markFits(a)}>
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

          <Card className="interactive p-5 border-dashed">
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

      <FollowupModal
        answer={results.find((a) => a.id === followupOpen) ?? null}
        onClose={() => setFollowupOpen(null)}
      />
      <PostPublicModal open={postOpen} onClose={() => setPostOpen(false)} question={q} />
    </div>
  );
}

function Evidence({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-1.5 text-muted-foreground">{icon} <span>{label}</span></div>;
}

function ChampionPanel({ champion, question }: { champion: Champion | undefined; question: string }) {
  if (!champion) return null;
  const c = champion;
  const subject = encodeURIComponent(`Delta Connector — follow-up on: ${question.slice(0, 60)}`);
  const body = encodeURIComponent(
    `Hi ${c.name.split(" ")[0]},\n\nI found your answer on Delta Connector really helpful and would love to follow up.\n\nMy question was: "${question}"\n\nThanks!\n${currentUser.name}`,
  );
  const mailto = `mailto:${c.email}?subject=${subject}&body=${body}`;

  return (
    <aside className="animate-fade-in rounded-2xl border bg-surface/70 p-4 md:border-l md:bg-transparent md:pl-5">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={c.avatar}
            alt={c.name}
            className="size-20 rounded-full object-cover ring-2 ring-primary/20"
            loading="lazy"
          />
          {c.verified && (
            <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-primary text-white ring-2 ring-surface">
              <BadgeCheck className="size-3.5" />
            </span>
          )}
        </div>
        <div className="mt-3 font-semibold leading-tight">{c.name}</div>
        <div className="mt-0.5 text-xs text-primary font-medium capitalize">{c.role} · {c.title}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" /> {c.location}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-4">{c.bio}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {c.strengths.slice(0, 4).map((s) => (
          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Trust" value={Math.round(c.trustScore)} />
        <Stat label="Helped" value={c.foundersHelped} icon={<Users className="size-3" />} />
        <Stat label="Reach" value={c.networkReach >= 1000 ? `${(c.networkReach / 1000).toFixed(1)}k` : c.networkReach} />
      </div>

      <div className="mt-4 space-y-2">
        <Button asChild size="sm" className="w-full bg-primary hover:bg-primary-hover">
          <a href={mailto}><Mail className="size-3.5" /> Connect</a>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => toast.success(`Message request sent to ${c.name}`, { description: "They'll be notified and can accept to start a conversation." })}
        >
          <MessageCircle className="size-3.5" /> Send a message
        </Button>
      </div>
    </aside>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-background/60 py-2">
      <div className="flex items-center justify-center gap-1 text-sm font-semibold tabular-nums">{icon}{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function AgentPipeline({ stageIdx }: { stageIdx: number }) {
  return (
    <div className="mt-4 rounded-xl border bg-elevated/70 p-4 animate-fade-in">
      <div className="flex items-center gap-2 text-xs font-medium text-primary">
        <Sparkles className="size-3.5 animate-pulse" />
        Agents working on your question…
      </div>

      {/* Scanning bar */}
      <div className="agent-scan relative mt-3 h-1 overflow-hidden rounded-full bg-primary/10" />

      {/* Agent nodes connected by animated flow lines */}
      <div className="mt-4 flex items-stretch justify-between gap-1">
        {agentSteps.map((step, i) => {
          const done = i < stageIdx;
          const active = i === stageIdx;
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`grid size-11 place-items-center rounded-2xl border transition-all duration-300 ${
                    done
                      ? "border-success/30 bg-success/10 text-success"
                      : active
                      ? "border-primary/40 bg-primary/10 text-primary pulse-ring scale-110"
                      : "border-border bg-surface text-muted-foreground/40"
                  }`}
                >
                  {done ? <Check className="size-5" /> : <Icon className="size-5" />}
                </div>
                <div className={`mt-2 text-[11px] font-medium transition-colors ${done || active ? "text-foreground" : "text-muted-foreground/40"}`}>
                  {step.label}
                </div>
                <div className={`text-[10px] leading-tight transition-colors ${active ? "text-muted-foreground" : "text-transparent"} h-3`}>
                  {active ? step.sub : ""}
                </div>
              </div>
              {i < agentSteps.length - 1 && (
                <svg width="28" height="8" viewBox="0 0 28 8" className="shrink-0 -mt-6">
                  <line
                    x1="0" y1="4" x2="28" y2="4"
                    className={i < stageIdx ? "flow-line" : ""}
                    stroke={i < stageIdx ? "var(--color-primary)" : "var(--color-border)"}
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Live equalizer to convey active computation */}
      <div className="mt-4 flex items-end justify-center gap-1 h-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
          <span
            key={n}
            className="agent-bar w-1 rounded-full bg-primary/50"
            style={{ height: "100%", animationDelay: `${n * 0.09}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function FollowupModal({ answer, onClose }: { answer: UiAnswer | null; onClose: () => void }) {
  const open = !!answer;
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState<"loading" | "drafted" | "consent_required">("loading");
  const [notice, setNotice] = useState("");

  // Fetch a real consent-gated draft from the Outreach agent when opened.
  useEffect(() => {
    if (!answer) return;
    setStatus("loading");
    setMsg("");
    setNotice("");
    let cancelled = false;
    (async () => {
      try {
        const res = await followUpDraft({
          answerSummary: answer.answer,
          question: answer.question,
          askerName: currentUser.name.split(" ")[0],
          consentOk: true, // user reached this modal by confirming the answer fits
        });
        if (cancelled) return;
        if (res.status === "drafted" && res.draft) {
          setStatus("drafted");
          setMsg(res.draft);
        } else {
          setStatus("consent_required");
          setNotice(res.message);
        }
      } catch (e) {
        if (cancelled) return;
        setStatus("consent_required");
        setNotice("Couldn't reach the outreach service.");
        toast.error("Couldn't draft a follow-up", { description: String(e) });
      }
    })();
    return () => { cancelled = true; };
  }, [answer]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request follow-up</DialogTitle>
          <DialogDescription>Your profile and question context will be shared only after you approve.</DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-elevated p-3 text-xs space-y-1">
          <div><span className="text-muted-foreground">Context:</span> Pre-Seed · AI SaaS · Non-EU Founder · Berlin</div>
          <div><span className="text-muted-foreground">Related answer:</span> {answer?.question ?? ""}</div>
        </div>
        {status === "loading" && <div className="text-xs text-muted-foreground py-4">Drafting your follow-up…</div>}
        {status === "consent_required" && (
          <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">{notice}</div>
        )}
        {status === "drafted" && <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={6} />}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {status === "consent_required" ? (
            <Button className="bg-primary hover:bg-primary-hover" onClick={() => { toast.success("Consent request sent — no details shared yet"); onClose(); }}>
              <Send className="size-4" /> Request consent
            </Button>
          ) : (
            <Button className="bg-primary hover:bg-primary-hover" disabled={status !== "drafted"} onClick={() => { toast.success("Follow-up request sent"); onClose(); }}>
              <Send className="size-4" /> Send request
            </Button>
          )}
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
