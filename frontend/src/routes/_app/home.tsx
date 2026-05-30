import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, TrendingUp, Sparkles, CheckCircle2, Mic, MicOff, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { currentUser, recentActivity, recommendedNextSteps } from "@/lib/mock-data";
import { getMetrics, type BackendMetrics } from "@/lib/api/delta";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "Home — Delta Connector" }] }),
  component: Home,
});

function Home() {
  const nav = useNavigate();
  // Pull the live trust metrics for the demo persona (actor_001) so Home and the
  // Dashboard show the same numbers. Falls back to mock values if backend is offline.
  const [metrics, setMetrics] = useState<BackendMetrics | null>(null);
  useEffect(() => {
    let live = true;
    getMetrics("actor_001").then((m) => { if (live) setMetrics(m); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const trustScore = metrics?.found ? String(metrics.trust_score) : String(currentUser.trustScore);
  const contribution = metrics?.found ? String(metrics.metrics["Contribution Score"] ?? currentUser.contributionScore) : String(currentUser.contributionScore);
  const networkReach = metrics?.found ? String(metrics.metrics["Network Reach"] ?? currentUser.networkReach) : String(currentUser.networkReach);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-surface to-accent-purple/5 border-primary/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Welcome back</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Hi {currentUser.name.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentUser.company} · {currentUser.stage} · {currentUser.context} · {currentUser.location}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline"><Link to="/ask">Ask a question</Link></Button>
            <Button asChild className="bg-primary hover:bg-primary-hover"><Link to="/ask">Continue next action <ArrowRight className="size-4" /></Link></Button>
          </div>
        </div>
        <div className="mt-5 rounded-md border bg-surface p-4 flex items-start gap-3">
          <div className="size-9 rounded-md gradient-agentic grid place-items-center text-white shrink-0"><Sparkles className="size-4" /></div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Recommended next action</div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              You saved an answer about startup tax advisors. Ask your next question below — type it or use the mic.
            </p>
            <div className="mt-3">
              <AskBox onAsk={(text) => nav({ to: "/ask", search: { q: text } })} />
            </div>
          </div>
        </div>
      </Card>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">At a glance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Stat label="Trust Score" value={trustScore} sub="+8 this week" tone="up" total="/ 100" />
          <Stat label="Contribution" value={contribution} sub="Top 24%" total="/ 100" />
          <Stat label="Helpfulness" value="4.8" sub="Improving" tone="up" total="/ 5" />
          <Stat label="Network Reach" value={networkReach} sub="people" />
          <Stat label="Categories" value="7 / 16" sub="covered" />
          <Stat label="Saved answers" value="4" sub="this month" />
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recommended next steps</h2>
            <Badge variant="outline" className="text-[10px]">Agentic suggestions</Badge>
          </div>
          <ul className="divide-y">
            {recommendedNextSteps.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.category}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost"><ArrowRight className="size-4" /></Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent activity</h2>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <ul className="space-y-3">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-2">
                <div className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm">{a.text}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function AskBox({ onAsk }: { onAsk: (text: string) => void }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setText(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch { /* noop */ } };
  }, []);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try { rec.start(); setListening(true); } catch { /* already started */ }
    }
  };

  const fire = () => {
    const t = text.trim();
    if (t) onAsk(t);
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") fire(); }}
          className="pl-9 pr-10 h-11"
          placeholder={listening ? "Listening…" : "Ask a question, e.g. Which lawyer handles GmbH setup?"}
        />
        {supported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            className={`absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-md transition ${listening ? "bg-destructive text-white animate-pulse" : "text-muted-foreground hover:bg-elevated"}`}
          >
            {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>
        )}
      </div>
      <Button className="h-11 bg-primary hover:bg-primary-hover" onClick={fire} disabled={!text.trim()}>
        <Sparkles className="size-4" /> Ask
      </Button>
    </div>
  );
}

function Stat({ label, value, sub, total, tone }: { label: string; value: string; sub?: string; total?: string; tone?: "up" }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {total && <span className="text-xs text-muted-foreground">{total}</span>}
      </div>
      {sub && <div className={`mt-1 text-[11px] ${tone === "up" ? "text-success" : "text-muted-foreground"}`}>{sub}</div>}
    </Card>
  );
}
