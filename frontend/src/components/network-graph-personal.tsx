import { useEffect, useRef } from "react";

export type PersonalConnection = {
  id: string;
  name: string;
  initials: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  role: string;
  topics: string[];
  strength: number; // 0..1
  lastDays: number; // days since last interaction
  degree: 1 | 2;
  activeNow?: boolean;
};

interface Props {
  home: { city: string; lat: number; lng: number };
  connections: PersonalConnection[];
  highlightId?: string | null;
  onSelect?: (c: PersonalConnection) => void;
  onHover?: (id: string | null) => void;
}

type Node = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  isHome: boolean;
  data?: PersonalConnection;
};

/**
 * Personal trust graph rendered to canvas.
 * "You" sits at the center. 1st degree = solid links, 2nd degree = dotted.
 * Mirrors the API of NetworkGlobePersonal so the two lenses are interchangeable.
 */
export default function NetworkGraphPersonal({
  home,
  connections,
  highlightId,
  onSelect,
  onHover,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    nodes: Node[];
    hover: string | null;
    highlight: string | null;
    w: number;
    h: number;
    dpr: number;
  }>({ nodes: [], hover: null, highlight: null, w: 0, h: 0, dpr: 1 });

  // Keep highlight in ref so we don't tear down the animation
  useEffect(() => {
    stateRef.current.highlight = highlightId ?? null;
  }, [highlightId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    stateRef.current.dpr = dpr;

    const css = (name: string, fb: string) => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fb;
    };
    const colors = {
      primary: css("--primary", "#7c5cff"),
      accent: css("--accent-purple", "#c084fc"),
      success: css("--success", "#22c55e"),
      dim: "oklch(0.55 0.02 270)",
      border: css("--border", "#272a3a"),
      fg: css("--foreground", "#e6e6f0"),
    };

    const seed = () => {
      const { w, h } = stateRef.current;
      const cx = w / 2;
      const cy = h / 2;
      const homeNode: Node = {
        id: "__home",
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        r: 14,
        isHome: true,
      };
      const firsts = connections.filter((c) => c.degree === 1);
      const seconds = connections.filter((c) => c.degree === 2);

      const place = (list: PersonalConnection[], radius: number): Node[] =>
        list.map((c, i) => {
          const angle = (i / Math.max(1, list.length)) * Math.PI * 2;
          return {
            id: c.id,
            x: cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
            y: cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
            vx: 0,
            vy: 0,
            r: 5 + c.strength * 6,
            isHome: false,
            data: c,
          };
        });

      const minDim = Math.min(w, h);
      stateRef.current.nodes = [
        homeNode,
        ...place(firsts, minDim * 0.28),
        ...place(seconds, minDim * 0.44),
      ];
    };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      stateRef.current.w = r.width;
      stateRef.current.h = r.height;
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    let raf = 0;
    const step = () => {
      const s = stateRef.current;
      const { w, h, nodes } = s;
      const cx = w / 2;
      const cy = h / 2;

      // Forces
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (a.isHome) continue;
        // Pull toward ideal radius from center (1st: 28%, 2nd: 44%)
        const minDim = Math.min(w, h);
        const ideal = (a.data?.degree === 2 ? 0.44 : 0.28) * minDim;
        const dx = a.x - cx;
        const dy = a.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const diff = ideal - dist;
        a.vx += (dx / dist) * diff * 0.0025;
        a.vy += (dy / dist) * diff * 0.0025;

        // Mutual repulsion
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const b = nodes[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const d2 = ddx * ddx + ddy * ddy + 0.01;
          if (d2 < 8000) {
            const f = 120 / d2;
            a.vx += ddx * f * 0.02;
            a.vy += ddy * f * 0.02;
          }
        }

        a.vx *= 0.86;
        a.vy *= 0.86;
        if (!reduce) {
          a.x += a.vx;
          a.y += a.vy;
        }
      }

      // Draw
      ctx.clearRect(0, 0, w, h);
      const highlight = s.highlight ?? s.hover;
      const homeNode = nodes[0];

      // Edges: home -> each connection
      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.data) continue;
        const dimmed = highlight && highlight !== n.id;
        const isSecond = n.data.degree === 2;
        const baseColor = isSecond ? colors.dim : n.data.lastDays < 14 ? colors.accent : colors.primary;
        const alpha = dimmed ? 0.08 : 0.25 + n.data.strength * 0.55;

        ctx.strokeStyle = `color-mix(in oklab, ${baseColor} ${Math.round(alpha * 100)}%, transparent)`;
        ctx.lineWidth = dimmed ? 0.6 : 0.8 + n.data.strength * 1.6;
        if (isSecond) ctx.setLineDash([4, 5]);
        else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(homeNode.x, homeNode.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Nodes
      for (const n of nodes) {
        const dimmed = highlight && highlight !== n.id && !n.isHome;
        let color: string;
        if (n.isHome) color = colors.accent;
        else if (dimmed) color = colors.dim;
        else if (n.data?.activeNow) color = colors.success;
        else if (n.data?.degree === 2) color = colors.dim;
        else color = colors.primary;

        // halo
        if (!dimmed) {
          ctx.fillStyle = `color-mix(in oklab, ${color} 18%, transparent)`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        // ring
        ctx.strokeStyle = `color-mix(in oklab, ${colors.fg} ${dimmed ? 10 : 40}%, transparent)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // label (only home + highlighted + 1st degree if not dimmed)
        if (n.isHome || highlight === n.id || (!dimmed && n.data?.degree === 1 && n.data.strength > 0.7)) {
          ctx.fillStyle = colors.fg;
          ctx.font = `${n.isHome ? 600 : 500} 11px ui-sans-serif, system-ui, -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const label = n.isHome ? "You" : n.data?.name ?? "";
          ctx.fillText(label, n.x, n.y + n.r + 4);
        }
      }

      raf = requestAnimationFrame(step);
    };

    resize();
    raf = requestAnimationFrame(step);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pointer handling
    const hitTest = (clientX: number, clientY: number): Node | null => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const { nodes } = stateRef.current;
      // Topmost first
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = x - n.x;
        const dy = y - n.y;
        if (dx * dx + dy * dy <= (n.r + 4) * (n.r + 4)) return n;
      }
      return null;
    };

    const onMove = (e: PointerEvent) => {
      const n = hitTest(e.clientX, e.clientY);
      const id = n && !n.isHome ? n.id : null;
      if (stateRef.current.hover !== id) {
        stateRef.current.hover = id;
        canvas.style.cursor = id ? "pointer" : "default";
        onHover?.(id);
      }
    };
    const onLeave = () => {
      if (stateRef.current.hover !== null) {
        stateRef.current.hover = null;
        canvas.style.cursor = "default";
        onHover?.(null);
      }
    };
    const onClick = (e: PointerEvent) => {
      const n = hitTest(e.clientX, e.clientY);
      if (n && !n.isHome && n.data) onSelect?.(n.data);
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onClick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onClick);
    };
  }, [connections]);

  return (
    <div ref={wrapRef} className="w-full h-[560px] relative">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
