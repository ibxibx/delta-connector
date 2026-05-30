import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { graphNodes, graphEdges, nodeColor, stakeholders } from "@/lib/mock-data";
import { Filter, MessageCircle, UserPlus, BookmarkPlus } from "lucide-react";

export const Route = createFileRoute("/_app/graph")({
  head: () => ({ meta: [{ title: "My Graph — Delta Connector" }] }),
  component: GraphPage,
});

function GraphPage() {
  const [selected, setSelected] = useState<string>("alex");
  const node = graphNodes.find((n) => n.id === selected);
  const stk = stakeholders.find((s) => s.id === selected);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Graph</h1>
          <p className="text-sm text-muted-foreground mt-1">Confirmed, opted-in connections only. Pending invitees are never public.</p>
        </div>
        <Button variant="outline" size="sm"><Filter className="size-4" /> Filters</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-2 min-h-[480px] relative overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-[480px]" preserveAspectRatio="xMidYMid meet">
            {graphEdges.map((e, i) => {
              const a = graphNodes.find((n) => n.id === e.from)!;
              const b = graphNodes.find((n) => n.id === e.to)!;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-border)" strokeWidth="0.3" strokeDasharray={e.kind === "Recommended" ? "" : "1,1"} />;
            })}
            {graphNodes.map((n) => (
              <g key={n.id} onClick={() => n.id !== "you" && setSelected(n.id)} className="cursor-pointer">
                <circle cx={n.x} cy={n.y} r={n.id === "you" ? 5.5 : 4} fill={nodeColor[n.type]} stroke={selected === n.id ? "var(--color-foreground)" : "var(--color-surface)"} strokeWidth="0.6" />
                <text x={n.x} y={n.y + 9} textAnchor="middle" fontSize="2.4" fill="var(--color-foreground)" fontWeight="600">{n.name}</text>
                <text x={n.x} y={n.y + 11.8} textAnchor="middle" fontSize="1.9" fill="var(--color-muted-foreground)">{n.role}</text>
              </g>
            ))}
          </svg>

          <div className="absolute bottom-3 left-3 right-3 rounded-md border bg-surface/95 backdrop-blur p-2.5 flex flex-wrap gap-3 text-[11px]">
            {Object.entries(nodeColor).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: v }} />{k}</div>
            ))}
            <div className="flex items-center gap-1.5 ml-auto"><span className="w-4 h-px bg-foreground" /> Recommended</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-px border-t border-dashed border-foreground" /> Other relation</div>
          </div>
        </Card>

        <Card className="p-5">
          {node && stk ? (
            <>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full grid place-items-center text-white font-semibold" style={{ background: nodeColor[node.type] }}>
                  {stk.initials}
                </div>
                <div>
                  <div className="font-semibold">{stk.name}</div>
                  <div className="text-xs text-muted-foreground">{stk.labels.join(" · ")}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <KV label="Trust Score" value={stk.trustScore.toString()} />
                <KV label="Helpful for" value={`${stk.helpfulFor} founders`} />
                <KV label="Rating" value={`${stk.rating} / 5`} />
                <KV label="Type" value={node.type} />
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1.5">Category authority</div>
                <div className="flex flex-wrap gap-1.5">{stk.categories.map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1.5">Best for</div>
                <p className="text-sm">{stk.bestFor}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary-hover"><UserPlus className="size-3.5" /> Request intro</Button>
                <Button size="sm" variant="outline"><MessageCircle className="size-3.5" /> Ask follow-up</Button>
                <Button size="sm" variant="ghost" className="col-span-2"><BookmarkPlus className="size-3.5" /> Save to workspace</Button>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Select a node to inspect.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-elevated p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
