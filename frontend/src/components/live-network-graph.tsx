import { useEffect, useRef } from "react";

interface LiveNetworkGraphProps {
  className?: string;
  paused?: boolean;
  showPulses?: boolean;
}

/**
 * Ambient force-directed trust graph rendered to canvas.
 * Lightweight (no deps), respects prefers-reduced-motion, DPR-aware.
 */
export function LiveNetworkGraph({
  className = "",
  paused = false,
  showPulses = true,
}: LiveNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const showPulsesRef = useRef(showPulses);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { showPulsesRef.current = showPulses; }, [showPulses]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; vx: number; vy: number; r: number; pulse: number; hub: boolean };
    let nodes: Node[] = [];
    let edges: [number, number][] = [];
    let w = 0, h = 0;
    let raf = 0;

    const css = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const primary = css("--primary") || "oklch(0.585 0.214 277)";
    const accent = css("--accent-purple") || "oklch(0.54 0.27 295)";

    const seed = () => {
      const count = Math.max(18, Math.min(34, Math.floor((w * h) / 42000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.6 + Math.random() * 2.4,
        pulse: Math.random() * Math.PI * 2,
        hub: i % 7 === 0,
      }));
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        const links = 1 + Math.floor(Math.random() * 2);
        for (let k = 0; k < links; k++) {
          const j = (i + 1 + Math.floor(Math.random() * 4)) % nodes.length;
          if (i !== j) edges.push([i, j]);
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (_t: number) => {
      ctx.clearRect(0, 0, w, h);
      const isPaused = pausedRef.current;
      const showPulses = showPulsesRef.current;

      // soft mutual repulsion + drift
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy + 0.01;
          if (d2 < 18000) {
            const f = 6 / d2;
            a.vx -= dx * f; a.vy -= dy * f;
            b.vx += dx * f; b.vy += dy * f;
          }
        }
        // gentle center pull
        a.vx += (w / 2 - a.x) * 0.00002;
        a.vy += (h / 2 - a.y) * 0.00002;
        a.vx *= 0.985; a.vy *= 0.985;
        if (!reduce && !isPaused) { a.x += a.vx; a.y += a.vy; }
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
      }

      // edges
      for (const [i, j] of edges) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 260) continue;
        const alpha = Math.max(0, 1 - dist / 260) * 0.22;
        ctx.strokeStyle = `color-mix(in oklab, ${primary} ${Math.round(alpha * 100)}%, transparent)`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // nodes
      for (const n of nodes) {
        if (!isPaused) n.pulse += 0.02;
        const glow = showPulses ? 0.6 + Math.sin(n.pulse) * 0.4 : 0.6;
        const color = n.hub ? accent : primary;
        ctx.fillStyle = `color-mix(in oklab, ${color} ${Math.round(60 + glow * 30)}%, transparent)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (n.hub ? 1.4 : 0), 0, Math.PI * 2);
        ctx.fill();
        // halo
        if (showPulses) {
          ctx.fillStyle = `color-mix(in oklab, ${color} ${Math.round(8 + glow * 8)}%, transparent)`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, (n.r + 4) * (n.hub ? 2 : 1.4), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none w-full h-full ${className}`}
    />
  );
}
