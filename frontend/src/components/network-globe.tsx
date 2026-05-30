import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";

type Hub = { city: string; country: string; lat: number; lng: number; members: number };

const BERLIN = { city: "Berlin", country: "DE", lat: 52.52, lng: 13.405, members: 1284 };

const HUBS: Hub[] = [
  { city: "London", country: "UK", lat: 51.5074, lng: -0.1278, members: 412 },
  { city: "Paris", country: "FR", lat: 48.8566, lng: 2.3522, members: 287 },
  { city: "Amsterdam", country: "NL", lat: 52.3676, lng: 4.9041, members: 198 },
  { city: "Stockholm", country: "SE", lat: 59.3293, lng: 18.0686, members: 156 },
  { city: "Lisbon", country: "PT", lat: 38.7223, lng: -9.1393, members: 132 },
  { city: "Zurich", country: "CH", lat: 47.3769, lng: 8.5417, members: 121 },
  { city: "Tallinn", country: "EE", lat: 59.437, lng: 24.7536, members: 89 },
  { city: "New York", country: "US", lat: 40.7128, lng: -74.006, members: 524 },
  { city: "San Francisco", country: "US", lat: 37.7749, lng: -122.4194, members: 487 },
  { city: "Toronto", country: "CA", lat: 43.6532, lng: -79.3832, members: 174 },
  { city: "Austin", country: "US", lat: 30.2672, lng: -97.7431, members: 142 },
  { city: "São Paulo", country: "BR", lat: -23.5505, lng: -46.6333, members: 168 },
  { city: "Mexico City", country: "MX", lat: 19.4326, lng: -99.1332, members: 96 },
  { city: "Tel Aviv", country: "IL", lat: 32.0853, lng: 34.7818, members: 263 },
  { city: "Dubai", country: "AE", lat: 25.2048, lng: 55.2708, members: 187 },
  { city: "Lagos", country: "NG", lat: 6.5244, lng: 3.3792, members: 134 },
  { city: "Nairobi", country: "KE", lat: -1.2921, lng: 36.8219, members: 88 },
  { city: "Cape Town", country: "ZA", lat: -33.9249, lng: 18.4241, members: 102 },
  { city: "Bangalore", country: "IN", lat: 12.9716, lng: 77.5946, members: 312 },
  { city: "Singapore", country: "SG", lat: 1.3521, lng: 103.8198, members: 234 },
  { city: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503, members: 198 },
  { city: "Seoul", country: "KR", lat: 37.5665, lng: 126.978, members: 147 },
  { city: "Sydney", country: "AU", lat: -33.8688, lng: 151.2093, members: 156 },
  { city: "Hong Kong", country: "HK", lat: 22.3193, lng: 114.1694, members: 178 },
];

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export default function NetworkGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 600, h: 520 });
  const [colors, setColors] = useState({
    primary: "#7c5cff",
    accent: "#c084fc",
    atmosphere: "#7c5cff",
  });

  useEffect(() => {
    setColors({
      primary: cssVar("--primary", "#7c5cff"),
      accent: cssVar("--accent-purple", "#c084fc"),
      atmosphere: cssVar("--primary", "#7c5cff"),
    });
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(320, r.width), h: Math.max(360, Math.min(640, r.width * 0.62)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    g.pointOfView({ lat: 30, lng: 10, altitude: 2.2 }, 0);
    const controls = g.controls?.();
    if (controls) {
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.35;
      controls.enableZoom = false;
    }
  }, [size]);

  const arcs = useMemo(
    () =>
      HUBS.map((h, i) => ({
        startLat: BERLIN.lat,
        startLng: BERLIN.lng,
        endLat: h.lat,
        endLng: h.lng,
        color: i % 3 === 0 ? colors.accent : colors.primary,
        label: `Berlin → ${h.city}`,
      })),
    [colors],
  );

  const points = useMemo(
    () => [
      { ...BERLIN, isHome: true },
      ...HUBS.map((h) => ({ ...h, isHome: false })),
    ],
    [],
  );

  return (
    <div ref={wrapRef} className="w-full">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor={colors.atmosphere}
        atmosphereAltitude={0.18}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        arcsData={arcs}
        arcColor={"color" as any}
        arcAltitudeAutoScale={0.4}
        arcStroke={0.4}
        arcDashLength={0.5}
        arcDashGap={2}
        arcDashInitialGap={() => Math.random() * 4}
        arcDashAnimateTime={2600}
        arcLabel={"label" as any}
        pointsData={points}
        pointLat={"lat" as any}
        pointLng={"lng" as any}
        pointAltitude={(d: any) => (d.isHome ? 0.04 : 0.01)}
        pointRadius={(d: any) => (d.isHome ? 0.55 : 0.28)}
        pointColor={(d: any) => (d.isHome ? colors.accent : colors.primary)}
        pointLabel={(d: any) =>
          `<div style="background:rgba(10,10,20,0.92);border:1px solid ${colors.primary};padding:6px 10px;border-radius:8px;font:500 12px ui-sans-serif,system-ui;color:#fff">
            <div style="font-weight:600">${d.city}${d.isHome ? " · HQ" : ""}</div>
            <div style="opacity:.7;font-size:11px">${d.members.toLocaleString()} members</div>
          </div>`
        }
      />
    </div>
  );
}
