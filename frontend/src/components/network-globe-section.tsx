import { lazy, Suspense, useEffect, useState } from "react";
import { Globe2 } from "lucide-react";

const NetworkGlobe = lazy(() => import("./network-globe"));

export function NetworkGlobeSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative px-6 py-24 border-t bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/70 px-3 py-1 text-xs text-primary mb-4">
            <Globe2 className="size-3.5" /> Global reach
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
            Rooted in Berlin.{" "}
            <span className="text-gradient-agentic">Connected worldwide.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            1,284 verified members in Berlin have made trusted introductions across 24 startup hubs.
            Each arc is a real path a question has traveled.
          </p>
        </div>

        <div className="relative rounded-3xl border bg-[#05060d] overflow-hidden shadow-2xl shadow-primary/10">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/60 z-10" />
          <div className="min-h-[420px] grid place-items-center">
            {mounted ? (
              <Suspense fallback={<GlobeSkeleton />}>
                <NetworkGlobe />
              </Suspense>
            ) : (
              <GlobeSkeleton />
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Legend dot="bg-accent-purple" label="Berlin HQ · 1,284 members" />
          <Legend dot="bg-primary" label="Partner hub" />
          <Legend dot="bg-primary/40" label="Animated arc = active introduction" />
        </div>
      </div>
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function GlobeSkeleton() {
  return (
    <div className="w-full aspect-[16/10] grid place-items-center text-muted-foreground/60 text-sm animate-pulse">
      Loading globe…
    </div>
  );
}
