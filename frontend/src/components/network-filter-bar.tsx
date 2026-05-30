import { Search, Globe2, Network, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export type Lens = "globe" | "graph" | "list";

interface Props {
  topics: string[];
  topic: string;
  onTopic: (t: string) => void;
  query: string;
  onQuery: (q: string) => void;
  showSecond: boolean;
  onShowSecond: (v: boolean) => void;
  activeOnly: boolean;
  onActiveOnly: (v: boolean) => void;
  minTrust: number;
  onMinTrust: (v: number) => void;
  lens: Lens;
  onLens: (l: Lens) => void;
}

const LENSES: { id: Lens; label: string; icon: typeof Globe2 }[] = [
  { id: "globe", label: "Globe", icon: Globe2 },
  { id: "graph", label: "Graph", icon: Network },
  { id: "list", label: "List", icon: List },
];

export function NetworkFilterBar({
  topics,
  topic,
  onTopic,
  query,
  onQuery,
  showSecond,
  onShowSecond,
  activeOnly,
  onActiveOnly,
  minTrust,
  onMinTrust,
  lens,
  onLens,
}: Props) {
  return (
    <div className="rounded-2xl border bg-surface/60 backdrop-blur p-3 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name, city, role, topic…"
          className="pl-9 h-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => onTopic(t)}
            className={`px-2.5 py-1 rounded-full text-xs border transition ${
              topic === t
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={showSecond} onCheckedChange={onShowSecond} />
          <span>2nd degree</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={activeOnly} onCheckedChange={onActiveOnly} />
          <span>Active only</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Trust ≥</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minTrust}
            onChange={(e) => onMinTrust(Number(e.target.value))}
            className="accent-primary w-24"
          />
          <span className="tabular-nums w-7 text-right">{minTrust}</span>
        </label>
      </div>

      <div className="ml-auto flex items-center gap-0.5 rounded-lg border bg-background/60 p-0.5">
        {LENSES.map((l) => {
          const Icon = l.icon;
          const active = lens === l.id;
          return (
            <button
              key={l.id}
              onClick={() => onLens(l.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition ${
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
