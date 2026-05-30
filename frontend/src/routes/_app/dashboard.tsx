import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Sparkles } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from "recharts";
import { radarData } from "@/lib/mock-data";
import { getMetrics, type BackendMetrics } from "@/lib/api/delta";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Delta Connector" }] }),
  component: Dashboard,
});

const locked = [
  { name: "Highly trusted for AI Product", req: "Trust 80+, 8 validations, 3 independent clusters" },
  { name: "Bridge Builder", req: "Connect 3+ ecosystem clusters" },
];

function Dashboard() {
  // actor_001 = Marco (newcomer); actor_002 = established member (demo contrast)
  const [actorId, setActorId] = useState("actor_001");
  const [data, setData] = useState<BackendMetrics | null>(null);

  useEffect(() => {
    let live = true;
    getMetrics(actorId).then((m) => { if (live) setData(m); }).catch(() => {});
    return () => { live = false; };
  }, [actorId]);

  const metricCards = data?.found
    ? Object.entries(data.metrics).map(([label, value]) => ({ label, value: String(value), sub: "" }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your private trust metrics and how to grow them.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={actorId === "actor_001" ? "default" : "outline"} size="sm" onClick={() => setActorId("actor_001")}>Marco (new)</Button>
          <Button variant={actorId === "actor_002" ? "default" : "outline"} size="sm" onClick={() => setActorId("actor_002")}>Established member</Button>
        </div>
      </div>

      {data?.found && (
        <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Trust score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight">{data.trust_score}</span>
              <span className="text-sm text-muted-foreground">/ 100 · {data.trust_level}</span>
            </div>
          </div>
          <Badge variant="outline" className="gap-1"><Lock className="size-3" /> Private to you</Badge>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricCards.map((m) => (
          <Card key={m.label} className="p-4 hover-glow">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tracking-tight">{m.value}</span>
              <span className="text-xs text-muted-foreground">{m.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your position in the ecosystem</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="dim" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-7 rounded-md gradient-agentic grid place-items-center text-white"><Sparkles className="size-3.5" /></div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Improve your metrics</h2>
          </div>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
              <span>{data?.coach_tip ?? "Loading your next step…"}</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Public badges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data?.public_badge_eligible && (
            <div className="rounded-2xl border bg-elevated p-4">
              <Badge className="bg-success/10 text-success border-success/20">Unlocked</Badge>
              <div className="mt-2 font-medium text-sm">Public category authority</div>
              <div className="text-xs text-muted-foreground mt-1">Trust {data.trust_score}+ · opted in</div>
            </div>
          )}
          {locked.map((b) => (
            <div key={b.name} className="rounded-2xl border border-dashed p-4 bg-surface">
              <Badge variant="outline" className="gap-1"><Lock className="size-3" /> Locked</Badge>
              <div className="mt-2 font-medium text-sm">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-1">Requirement: {b.req}</div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4 rounded-xl">Manage badge visibility</Button>
      </Card>
    </div>
  );
}
