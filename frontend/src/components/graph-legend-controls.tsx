import { useState } from "react";
import { Pause, Play, Eye, EyeOff, Info, Users, Link2, Activity, Zap } from "lucide-react";

export interface GraphControlsState {
  paused: boolean;
  showPulses: boolean;
  showLabels: boolean;
}

interface GraphLegendControlsProps {
  controls: GraphControlsState;
  onChange: (next: GraphControlsState) => void;
}

export function GraphLegendControls({ controls, onChange }: GraphLegendControlsProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = (key: keyof GraphControlsState) =>
    onChange({ ...controls, [key]: !controls[key] });

  return (
    <div className="pointer-events-auto select-none">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 rounded-xl border bg-surface/80 backdrop-blur px-3 py-2 text-xs font-medium text-foreground shadow-sm hover:bg-elevated transition"
        aria-expanded={expanded}
        aria-label="Toggle graph legend"
      >
        <Info className="size-3.5 text-primary" />
        <span>Network map</span>
        <span className="ml-1 text-[10px] text-muted-foreground">
          {expanded ? "Hide" : "Explain"}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 w-64 rounded-2xl border bg-surface/90 backdrop-blur-md p-4 shadow-xl animate-fade-in">
          {/* Legend items */}
          <div className="space-y-3">
            <LegendItem
              icon={<MemberDot />}
              title="Member"
              description="A founder, operator, or advisor in the network."
            />
            <LegendItem
              icon={<HubDot />}
              title="Hub"
              description="Highly connected — bridges multiple circles."
            />
            <LegendItem
              icon={<LinkIcon />}
              title="Trust link"
              description="A validated intro, shared answer, or mutual vouch."
            />
            <LegendItem
              icon={<PulseIcon active={controls.showPulses} />}
              title="Trust pulse"
              description="Anonymized signal of recent helpful activity."
            />
          </div>

          {/* Divider */}
          <div className="my-3 h-px bg-border" />

          {/* Controls */}
          <div className="flex items-center justify-between">
            <ControlToggle
              label={controls.paused ? "Resume" : "Pause"}
              icon={controls.paused ? Play : Pause}
              active={controls.paused}
              onClick={() => toggle("paused")}
            />
            <ControlToggle
              label="Pulses"
              icon={controls.showPulses ? Eye : EyeOff}
              active={controls.showPulses}
              onClick={() => toggle("showPulses")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-xs font-semibold text-foreground">{title}</div>
        <div className="text-[11px] text-muted-foreground leading-snug">{description}</div>
      </div>
    </div>
  );
}

function ControlToggle({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Pause;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition border ${
        active
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-elevated"
      }`}
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}

/* Mini visual icons for legend */ 
function MemberDot() {
  return (
    <div className="relative">
      <div className="size-2.5 rounded-full bg-primary" />
      <div className="absolute inset-0 size-2.5 rounded-full bg-primary/20 animate-ping" />
    </div>
  );
}

function HubDot() {
  return (
    <div className="relative">
      <div className="size-3.5 rounded-full bg-accent-purple" />
      <div className="absolute -inset-1 rounded-full border border-accent-purple/30" />
    </div>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" className="text-primary/60">
      <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="2" cy="5" r="1.5" fill="var(--color-primary)" />
      <circle cx="14" cy="5" r="1.5" fill="var(--color-accent-purple)" />
    </svg>
  );
}

function PulseIcon({ active }: { active: boolean }) {
  return (
    <div className="relative size-3.5 flex items-center justify-center">
      <Activity className={`size-3 ${active ? "text-success" : "text-muted-foreground/40"}`} />
      {active && (
        <span className="absolute inline-flex size-full rounded-full bg-success/30 animate-ping" />
      )}
    </div>
  );
}
