import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";

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


function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function NetworkGlobePersonal({ home, connections, highlightId, onSelect, onHover }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 600, h: 560 });
  const [colors, setColors] = useState({
    primary: "#7c5cff",
    accent: "#c084fc",
    success: "#22c55e",
    dim: "#475569",
  });

  useEffect(() => {
    setColors({
      primary: cssVar("--primary", "#7c5cff"),
      accent: cssVar("--accent-purple", "#c084fc"),
      success: cssVar("--success", "#22c55e"),
      dim: "#475569",
    });
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(320, r.width), h: Math.max(420, Math.min(720, r.width * 0.68)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    g.pointOfView({ lat: home.lat, lng: home.lng, altitude: 2.0 }, 0);
    const controls = g.controls?.();
    if (controls) {
      controls.autoRotate = !reduce && !highlightId;
      controls.autoRotateSpeed = 0.25;
      controls.enableZoom = true;
    }
  }, [size, home.lat, home.lng, highlightId]);

  const arcs = useMemo(() => {
    return connections.map((c) => {
      const dimmed = highlightId && highlightId !== c.id;
      const baseColor = c.degree === 2 ? colors.dim : c.lastDays < 14 ? colors.accent : colors.primary;
      return {
        startLat: home.lat,
        startLng: home.lng,
        endLat: c.lat,
        endLng: c.lng,
        color: dimmed ? `${colors.dim}` : baseColor,
        stroke: dimmed ? 0.15 : 0.25 + c.strength * 0.6,
        dashTime: Math.max(800, 4200 - c.strength * 3200),
        dashGap: c.degree === 2 ? 6 : 2,
        id: c.id,
        label: `${c.name} · ${c.city}`,
      };
    });
  }, [connections, home, highlightId, colors]);

  const points = useMemo(
    () => [
      {
        id: "__home",
        name: "You",
        city: home.city,
        role: "Home base",
        topics: [],
        lat: home.lat,
        lng: home.lng,
        isHome: true,
        strength: 1,
        lastDays: 0,
        degree: 1 as const,
      },
      ...connections.map((c) => ({ ...c, isHome: false })),
    ],
    [connections, home],
  );

  return (
    <div ref={wrapRef} className="w-full">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor={colors.primary}
        atmosphereAltitude={0.16}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        arcsData={arcs}
        arcColor={"color" as any}
        arcStroke={"stroke" as any}
        arcAltitudeAutoScale={0.42}
        arcDashLength={0.45}
        arcDashGap={"dashGap" as any}
        arcDashInitialGap={() => Math.random() * 4}
        arcDashAnimateTime={"dashTime" as any}
        arcLabel={"label" as any}
        pointsData={points}
        pointLat={"lat" as any}
        pointLng={"lng" as any}
        pointAltitude={(d: any) => (d.isHome ? 0.05 : 0.015 + (d.strength ?? 0.2) * 0.04)}
        pointRadius={(d: any) =>
          d.isHome ? 0.7 : (highlightId === d.id ? 0.7 : 0.3 + (d.strength ?? 0.2) * 0.35)
        }
        pointColor={(d: any) => {
          if (d.isHome) return colors.accent;
          if (highlightId && highlightId !== d.id) return colors.dim;
          if (d.activeNow) return colors.success;
          if (d.degree === 2) return colors.dim;
          return colors.primary;
        }}
        pointLabel={(d: any) =>
          `<div style="background:rgba(10,10,20,0.95);border:1px solid ${colors.primary};padding:8px 12px;border-radius:10px;font:500 12px ui-sans-serif,system-ui;color:#fff;max-width:240px">
            <div style="font-weight:600">${d.name}${d.isHome ? " · You" : ""}</div>
            <div style="opacity:.75;font-size:11px;margin-top:2px">${d.role}${d.city ? " · " + d.city : ""}</div>
            ${!d.isHome ? `<div style="opacity:.6;font-size:11px;margin-top:4px">Trust ${Math.round((d.strength ?? 0) * 100)} · last seen ${d.lastDays}d ago${d.degree === 2 ? " · 2nd degree" : ""}</div>` : ""}
          </div>`
        }
        onPointClick={(d: any) => {
          if (!d.isHome && onSelect) onSelect(d);
        }}
        onPointHover={(d: any) => {
          if (onHover) onHover(d && !d.isHome ? d.id : null);
        }}

      />
    </div>
  );
}
