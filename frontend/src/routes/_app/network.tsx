import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Globe2, Users, Activity, Sparkles, X, MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NetworkFilterBar, type Lens } from "@/components/network-filter-bar";
import NetworkGraphPersonal, { type PersonalConnection } from "@/components/network-graph-personal";

type NetworkSearch = {
  lens: Lens;
  topic: string;
  q: string;
  second: boolean;
  active: boolean;
  minTrust: number;
  id?: string;
};

export const Route = createFileRoute("/_app/network")({
  validateSearch: (search: Record<string, unknown>): NetworkSearch => {
    const lens = search.lens === "list" ? "list" : "graph";
    return {
      lens,
      topic: typeof search.topic === "string" ? search.topic : "All",
      q: typeof search.q === "string" ? search.q : "",
      second: search.second === undefined ? true : Boolean(search.second),
      active: Boolean(search.active),
      minTrust: typeof search.minTrust === "number" ? search.minTrust : 0,
      id: typeof search.id === "string" ? search.id : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "My Network — Delta Connector" },
      { name: "description", content: "Your trusted connections — graph and list, one workspace." },
    ],
  }),
  component: NetworkPage,
});

const HOME = { city: "Berlin", lat: 52.52, lng: 13.405 };

const CONNECTIONS: PersonalConnection[] = [
  { id: "alex", name: "Alex Weber", initials: "AW", city: "Berlin", country: "DE", lat: 52.52, lng: 13.41, role: "Tax Advisor", topics: ["Tax/Admin", "Funding"], strength: 0.92, lastDays: 3, degree: 1, activeNow: true },
  { id: "anna", name: "Anna Roth", initials: "AR", city: "Berlin", country: "DE", lat: 52.50, lng: 13.39, role: "Startup Lawyer", topics: ["Legal"], strength: 0.95, lastDays: 1, degree: 1, activeNow: true },
  { id: "lukas", name: "Lukas Vogel", initials: "LV", city: "Munich", country: "DE", lat: 48.137, lng: 11.575, role: "Angel Investor", topics: ["Funding", "GTM"], strength: 0.74, lastDays: 9, degree: 1 },
  { id: "sarah", name: "Sarah Kim", initials: "SK", city: "London", country: "UK", lat: 51.51, lng: -0.13, role: "Recruiter", topics: ["Talent/Hiring"], strength: 0.68, lastDays: 22, degree: 1 },
  { id: "marco", name: "Marco Silva", initials: "MS", city: "Lisbon", country: "PT", lat: 38.72, lng: -9.14, role: "Founder · B2B SaaS", topics: ["GTM"], strength: 0.55, lastDays: 41, degree: 1 },
  { id: "noa", name: "Noa Levi", initials: "NL", city: "Tel Aviv", country: "IL", lat: 32.08, lng: 34.78, role: "Operator · AI", topics: ["Product", "AI"], strength: 0.81, lastDays: 6, degree: 1, activeNow: true },
  { id: "kenji", name: "Kenji Tanaka", initials: "KT", city: "Tokyo", country: "JP", lat: 35.68, lng: 139.65, role: "Investor", topics: ["Funding"], strength: 0.42, lastDays: 88, degree: 1 },
  { id: "priya", name: "Priya Rao", initials: "PR", city: "Bangalore", country: "IN", lat: 12.97, lng: 77.59, role: "Founder · DevTools", topics: ["Engineering"], strength: 0.63, lastDays: 14, degree: 1 },
  { id: "carlos", name: "Carlos Mendes", initials: "CM", city: "São Paulo", country: "BR", lat: -23.55, lng: -46.63, role: "Mentor", topics: ["GTM", "LATAM"], strength: 0.5, lastDays: 33, degree: 1 },
  { id: "ada", name: "Ada Okafor", initials: "AO", city: "Lagos", country: "NG", lat: 6.52, lng: 3.38, role: "Founder · Fintech", topics: ["Payments"], strength: 0.46, lastDays: 27, degree: 1 },
  { id: "ethan", name: "Ethan Cole", initials: "EC", city: "New York", country: "US", lat: 40.71, lng: -74.0, role: "VC Associate", topics: ["Funding"], strength: 0.77, lastDays: 5, degree: 1, activeNow: true },
  { id: "lena", name: "Lena Park", initials: "LP", city: "San Francisco", country: "US", lat: 37.77, lng: -122.42, role: "Founder · AI Infra", topics: ["AI", "Engineering"], strength: 0.71, lastDays: 11, degree: 1 },
  { id: "f1", name: "Maya Wong", initials: "MW", city: "Singapore", country: "SG", lat: 1.35, lng: 103.82, role: "Investor (via Ethan)", topics: ["Funding"], strength: 0.35, lastDays: 0, degree: 2 },
  { id: "f2", name: "Hugo Bernard", initials: "HB", city: "Paris", country: "FR", lat: 48.85, lng: 2.35, role: "Lawyer (via Anna)", topics: ["Legal"], strength: 0.3, lastDays: 0, degree: 2 },
  { id: "f3", name: "Yuki Sato", initials: "YS", city: "Seoul", country: "KR", lat: 37.57, lng: 126.98, role: "Operator (via Kenji)", topics: ["Product"], strength: 0.28, lastDays: 0, degree: 2 },
  { id: "f4", name: "Aiden Walsh", initials: "AW2", city: "Toronto", country: "CA", lat: 43.65, lng: -79.38, role: "Founder (via Lena)", topics: ["AI"], strength: 0.32, lastDays: 0, degree: 2 },
  { id: "f5", name: "Sofia Russo", initials: "SR", city: "Amsterdam", country: "NL", lat: 52.37, lng: 4.9, role: "Operator (via Anna)", topics: ["GTM"], strength: 0.34, lastDays: 0, degree: 2 },
];

const TOPICS = ["All", "Funding", "Legal", "Tax/Admin", "Talent/Hiring", "GTM", "Product", "AI", "Engineering"];

function NetworkPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/network" });
  const [hoverId, setHoverId] = useState<string | null>(null);

  const setSearch = (patch: Partial<NetworkSearch>) =>
    navigate({ search: (prev: NetworkSearch) => ({ ...prev, ...patch }), replace: true });

  const filtered = useMemo(() => {
    const q = search.q.trim().toLowerCase();
    return CONNECTIONS.filter((c) => {
      if (!search.second && c.degree === 2) return false;
      if (search.active && !c.activeNow) return false;
      if (search.topic !== "All" && !c.topics.includes(search.topic)) return false;
      if (c.strength * 100 < search.minTrust) return false;
      if (q && !`${c.name} ${c.city} ${c.role} ${c.topics.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search.q, search.second, search.active, search.topic, search.minTrust]);

  const selected = search.id ? CONNECTIONS.find((c) => c.id === search.id) ?? null : null;
  const activeCount = filtered.filter((c) => c.activeNow).length;
  const cityCount = new Set(filtered.map((c) => c.city)).size;

  const onSelect = (c: PersonalConnection) => setSearch({ id: c.id });
  const onClose = () => setSearch({ id: undefined });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-primary mb-2">
            <Globe2 className="size-3.5" /> Your network · one workspace
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            People you can <span className="text-gradient-agentic">actually reach</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Two lenses on the same trust paths — see <em>how</em> you're connected, or <em>who</em> can help.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Stat icon={Users} label="Connections" value={filtered.length} />
          <Stat icon={Globe2} label="Cities" value={cityCount} />
          <Stat icon={Activity} label="Active now" value={activeCount} accent />
        </div>
      </header>

      <NetworkFilterBar
        topics={TOPICS}
        topic={search.topic}
        onTopic={(t) => setSearch({ topic: t })}
        query={search.q}
        onQuery={(q) => setSearch({ q })}
        showSecond={search.second}
        onShowSecond={(v) => setSearch({ second: v })}
        activeOnly={search.active}
        onActiveOnly={(v) => setSearch({ active: v })}
        minTrust={search.minTrust}
        onMinTrust={(v) => setSearch({ minTrust: v })}
        lens={search.lens}
        onLens={(l) => setSearch({ lens: l })}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Lens */}
        <div className={`relative rounded-3xl border overflow-hidden shadow-2xl shadow-primary/10 ${search.lens === "list" ? "bg-surface/60" : "bg-[#05060d]"}`}>
          {search.lens === "graph" && (
            <div className="absolute top-3 left-3 z-10 rounded-xl border border-white/10 bg-black/50 backdrop-blur px-3 py-2 text-[11px] text-white/80 space-y-1">
              <LegendRow color="bg-accent-purple" label="You · Berlin" />
              <LegendRow color="bg-primary" label="1st degree" />
              <LegendRow color="bg-success" label="Active now" />
              <LegendRow color="bg-slate-500" label="2nd degree (via intro)" />
            </div>
          )}

          {search.lens === "graph" && (
            <NetworkGraphPersonal
              home={HOME}
              connections={filtered}
              highlightId={hoverId ?? search.id ?? null}
              onSelect={onSelect}
              onHover={setHoverId}
            />
          )}

          {search.lens === "list" && (
            <div className="p-3 max-h-[640px] overflow-y-auto">
              <ConnectionList
                connections={filtered}
                dense={false}
                highlightId={hoverId ?? search.id ?? null}
                onHover={setHoverId}
                onSelect={(id) => setSearch({ id })}
              />
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="rounded-3xl border bg-surface/60 backdrop-blur p-3 flex flex-col max-h-[640px]">
          {selected ? (
            <ConnectionDetail connection={selected} onClose={onClose} />
          ) : (
            <ConnectionList
              connections={filtered}
              dense
              highlightId={hoverId}
              onHover={setHoverId}
              onSelect={(id) => setSearch({ id })}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`size-8 rounded-lg grid place-items-center ${accent ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`}>
        <Icon className="size-4" />
      </div>
      <div className="leading-tight">
        <div className="text-lg font-semibold">{value}</div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function ConnectionList({
  connections,
  dense,
  highlightId,
  onHover,
  onSelect,
}: {
  connections: PersonalConnection[];
  dense: boolean;
  highlightId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div className="px-2 py-1 text-xs text-muted-foreground flex items-center justify-between">
        <span>{connections.length} connections</span>
        <span>Sorted by trust</span>
      </div>
      <div className={`mt-1 space-y-1 pr-1 ${dense ? "overflow-y-auto flex-1" : ""}`}>
        {[...connections]
          .sort((a, b) => b.strength - a.strength)
          .map((c) => {
            const highlighted = highlightId === c.id;
            return (
              <button
                key={c.id}
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(c.id)}
                className={`w-full text-left rounded-xl p-2 border transition flex items-center gap-3 ${
                  highlighted
                    ? "bg-primary/10 border-primary/40"
                    : "border-transparent hover:bg-primary/5 hover:border-primary/20"
                }`}
              >
                <div className={`size-9 rounded-full grid place-items-center text-xs font-semibold text-white ${c.degree === 2 ? "bg-slate-500" : "bg-gradient-to-br from-primary to-accent-purple"}`}>
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {c.name}
                    {c.activeNow && <span className="size-1.5 rounded-full bg-success animate-pulse" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {c.role} · {c.city}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  {Math.round(c.strength * 100)}
                </div>
              </button>
            );
          })}
        {connections.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">
            No connections match these filters.
          </div>
        )}
      </div>
    </>
  );
}

function ConnectionDetail({ connection, onClose }: { connection: PersonalConnection; onClose: () => void }) {
  const c = connection;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`size-12 rounded-full grid place-items-center text-sm font-semibold text-white ${c.degree === 2 ? "bg-slate-500" : "bg-gradient-to-br from-primary to-accent-purple"}`}>
            {c.initials}
          </div>
          <div>
            <div className="font-semibold flex items-center gap-2">
              {c.name}
              {c.activeNow && <Badge variant="secondary" className="bg-success/15 text-success border-success/30 text-[10px]">Active</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">{c.role} · {c.city}, {c.country}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
        <Mini label="Trust" value={`${Math.round(c.strength * 100)}`} />
        <Mini label="Last seen" value={c.lastDays === 0 ? "—" : `${c.lastDays}d`} />
        <Mini label="Degree" value={c.degree === 1 ? "1st" : "2nd"} />
      </div>

      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Helps with</div>
      <div className="flex flex-wrap gap-1 mb-4">
        {c.topics.length ? c.topics.map((t) => (
          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
        )) : <span className="text-xs text-muted-foreground">No tagged topics yet.</span>}
      </div>

      <div className="mt-auto space-y-2">
        {c.degree === 2 ? (
          <Button className="w-full bg-primary hover:bg-primary-hover">
            <UserPlus className="size-4" /> Request intro
          </Button>
        ) : (
          <Button className="w-full bg-primary hover:bg-primary-hover">
            <MessageCircle className="size-4" /> Send a message
          </Button>
        )}
        <Button variant="outline" className="w-full">
          <Sparkles className="size-4" /> Ask the network about {c.topics[0] ?? "this person"}
        </Button>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/60 py-2">
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
