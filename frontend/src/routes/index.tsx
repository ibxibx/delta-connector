import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, Check, MessageCircle, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NetworkGlobeSection } from "@/components/network-globe-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Delta Connector — The agentic trust network for Berlin's startup ecosystem" },
      { name: "description", content: "Connect to the people you need, connect, and succeed faster. Berlin's peer-validated, agentic, privacy-first founder network." },
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
      <NetworkGlobeSection />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/delta-triangle-logo-transparent.png"
            alt="Delta Connector"
            className="size-8 object-contain"
          />
          <span className="font-semibold tracking-tight">Delta Connector</span>
        </Link>
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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Browsers can defer autoplay; force playback once the element is mounted.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay, { once: true });
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  return (
    <section className="relative isolate overflow-hidden min-h-[calc(100vh-4rem)]">
      {/* Looping hero background video, faded ~50% into the page background */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src="/hero-background.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-background) 50%, transparent) 0%, color-mix(in srgb, var(--color-background) 80%, transparent) 55%, var(--color-background) 100%)",
        }}
      />
      <div className="absolute inset-0 z-[1] opacity-[0.06]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-foreground) 1px, transparent 0)",
        backgroundSize: "24px 24px",
      }} />
      <div className="relative z-[2] max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge variant="outline" className="mb-5 gap-1.5 border-primary/20 bg-primary/5 text-primary">
            <Sparkles className="size-3" /> Built for Berlin's founder ecosystem
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight">
            Connect to the people you need.{" "}
            <span className="block text-gradient-agentic">Succeed faster.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            The connective layer for Berlin's startup ecosystem — turning the trusted advice
            buried in WhatsApp groups into searchable, peer-sourced knowledge, so the next
            founder starts ahead of the last.
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
            <div className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Privacy-first by design</div>
            <div className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Peer-validated</div>
            <div className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Compounding value</div>
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
