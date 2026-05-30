import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight, Check, MessageCircle, Send, Search, Network, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Delta Connector — The agentic trust network for Berlin's startup ecosystem" },
      { name: "description", content: "Find trusted startup answers, people, and resources in Berlin before asking another WhatsApp group. Peer-validated, agentic, privacy-first." },
      { property: "og:title", content: "Delta Connector" },
      { property: "og:description", content: "The agentic trust network for Berlin's startup ecosystem." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ValueCards />
      <HowItWorks />
      <Differentiators />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md gradient-agentic grid place-items-center text-white">
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Delta Connector</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#product" className="hover:text-foreground">Product</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#graph" className="hover:text-foreground">Trust Graph</a>
          <a href="#stakeholders" className="hover:text-foreground">For Stakeholders</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/home">View Demo</Link></Button>
          <Button asChild size="sm" className="bg-primary hover:bg-primary-hover">
            <Link to="/onboarding">Join Network</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-[0.06]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-foreground) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }} />
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge variant="outline" className="mb-5 gap-1.5 border-primary/20 bg-primary/5 text-primary">
            <Sparkles className="size-3" /> Built for Berlin's founder ecosystem
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Find trusted startup answers, people, and resources{" "}
            <span className="text-gradient-agentic">before asking another WhatsApp group.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Delta Connector turns Berlin's hidden founder knowledge into a searchable,
            peer-validated ecosystem graph.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-hover">
              <Link to="/onboarding">Join the network <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#demo">Ask a demo question</a>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Shield className="size-3.5" /> Privacy-first by design</div>
            <div className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Peer-validated</div>
            <div className="flex items-center gap-1.5"><TrendingUp className="size-3.5" /> Compounding value</div>
          </div>
        </div>
        <HeroDemo />
      </div>
    </section>
  );
}

function HeroDemo() {
  const [stage, setStage] = useState<"ask" | "results" | "fitted" | "followup">("ask");
  return (
    <div id="demo" className="relative">
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-accent-purple/10 rounded-3xl blur-2xl -z-10" />
      <Card className="overflow-hidden border-border shadow-xl">
        <div className="border-b bg-elevated px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/50" />
            <span className="size-2.5 rounded-full bg-warning/60" />
            <span className="size-2.5 rounded-full bg-success/60" />
          </div>
          <div className="ml-3 text-xs text-muted-foreground font-mono">delta-connector.app / ask</div>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Ask & Discover</div>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 rounded-md border bg-surface text-sm">
              Which tax advisor is good for a VC-backed GmbH in Berlin?
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary-hover" onClick={() => setStage("results")}>
              <Search className="size-4" />
            </Button>
          </div>

          {stage === "ask" && (
            <div className="text-xs text-muted-foreground italic">Click search to see suggested answers…</div>
          )}

          {stage !== "ask" && (
            <Card className="p-4 border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium">Startup-ready tax advisor for a VC-backed GmbH</div>
                <Badge className="bg-success/10 text-success border-success/20 shrink-0">92% Helpful</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                Choose a tax advisor who understands DATEV, payroll, investor reporting, and financing rounds.
                Avoid generalists without startup experience.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px]">Helpful for 12 founders</Badge>
                <Badge variant="secondary" className="text-[10px]">Pre-Seed · Seed fit</Badge>
                <Badge variant="secondary" className="text-[10px]">Tax/Admin authority</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <div className="text-xs text-muted-foreground">
                  {stage === "fitted" || stage === "followup"
                    ? "Provided by Alex Weber (opted into follow-ups)"
                    : "Provided by Verified Tax/Admin Contributor"}
                </div>
                <div className="flex gap-2">
                  {stage === "results" && (
                    <Button size="sm" className="h-8 bg-success hover:bg-success/90 text-white" onClick={() => setStage("fitted")}>
                      <Check className="size-3.5" /> This answer fits
                    </Button>
                  )}
                  {stage === "fitted" && (
                    <Button size="sm" variant="outline" className="h-8" onClick={() => setStage("followup")}>
                      <MessageCircle className="size-3.5" /> Request follow-up
                    </Button>
                  )}
                  {stage === "followup" && (
                    <Badge className="bg-primary/10 text-primary border-primary/20"><Send className="size-3 mr-1" /> Follow-up sent</Badge>
                  )}
                </div>
              </div>
            </Card>
          )}

          {stage !== "ask" && (
            <div className="text-xs text-center text-muted-foreground">
              None of these fit? <button className="text-primary hover:underline">Post your question publicly →</button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function ValueCards() {
  const items = [
    { icon: Search, title: "Ask better questions", desc: "Get previous trusted answers before posting publicly." },
    { icon: Network, title: "Find trusted people", desc: "See peer-validated providers, mentors, investors, and ecosystem nodes." },
    { icon: TrendingUp, title: "Grow the ecosystem", desc: "Every answer, validation, and recommendation improves the next founder's starting point." },
  ];
  return (
    <section id="product" className="border-t bg-elevated/50">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <Card key={it.title} className="p-6 bg-surface">
            <div className="size-10 rounded-md gradient-agentic grid place-items-center text-white mb-4">
              <it.icon className="size-5" />
            </div>
            <h3 className="text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, t: "Sign up", d: "Create profile & select role" },
    { n: 2, t: "Tell us about you", d: "Your startup stage, needs, context" },
    { n: 3, t: "Recommend 3–8 people", d: "Who helped you or could help others" },
    { n: 4, t: "Invitations sent", d: "They're invited to join the network" },
    { n: 5, t: "Enter the network", d: "Access graph, insights, resources" },
  ];
  return (
    <section id="how" className="border-t">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-3">Flow 1 — Give Before You Get</Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Join, contribute, build trust.</h2>
          <p className="mt-3 text-muted-foreground">Every contribution makes the next founder's journey easier.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-5 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="size-9 rounded-full gradient-agentic text-white grid place-items-center font-semibold text-sm">{s.n}</div>
              <div className="mt-3 font-medium text-sm">{s.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiators() {
  const items = [
    { t: "Give Before You Get", d: "Access by contributing real value" },
    { t: "Trust over Hype", d: "Peer-validated, context-rich recommendations" },
    { t: "Agentic by Design", d: "AI helps you find, act and connect" },
    { t: "Multi-Stakeholder", d: "Founders, providers, investors, institutions" },
    { t: "Actionable Insights", d: "Personal metrics and improvement tips" },
    { t: "Privacy First", d: "You control your data and visibility" },
  ];
  return (
    <section id="graph" className="bg-navy text-navy-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-navy-foreground/60">Key differentiators</div>
        <div className="mt-6 grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          {items.map((i) => (
            <div key={i.t}>
              <div className="font-medium text-sm">{i.t}</div>
              <div className="mt-1 text-xs text-navy-foreground/60">{i.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="stakeholders" className="border-t">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded gradient-agentic" />
          <span>© 2025 Delta Connector — Berlin's founder graph</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">For Stakeholders</a>
          <Link to="/onboarding" className="text-primary hover:underline">Join the network</Link>
        </div>
      </div>
    </footer>
  );
}
