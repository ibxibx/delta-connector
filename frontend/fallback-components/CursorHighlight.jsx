import { useState, useRef, useCallback } from "react";

/**
 * CursorHighlight — a soft radial glow that follows the cursor inside its container.
 * Drop-in fallback for the "cursor screen highlight responsiveness" effect when
 * Lovable's generated version isn't right.
 *
 * Usage:
 *   <CursorHighlight className="min-h-screen">
 *     ...your content...
 *   </CursorHighlight>
 *
 * The glow is pointer-events:none so it never blocks clicks underneath.
 */
export default function CursorHighlight({
  children,
  className = "",
  color = "rgba(99, 102, 241, 0.15)", // indigo, tweak to brand
  size = 400,
}) {
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: pos.x - size / 2,
          top: pos.y - size / 2,
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: active ? 1 : 0,
          transition: "opacity 200ms ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
