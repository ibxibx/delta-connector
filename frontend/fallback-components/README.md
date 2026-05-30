# Fallback Components

Ready-to-drop React components for the interactions Lovable tends to struggle with. Use these
only when Lovable's generated version isn't right after one focused re-prompt (see the frontend
interaction strategy in `docs/IMPLEMENTATION_PLAN.md`). Each is self-contained with a clean prop
interface, so swapping one in doesn't touch the rest of the app.

## Components

- **`CursorHighlight.jsx`** — soft radial glow that follows the cursor inside its container.
  No dependencies. Wrap any section: `<CursorHighlight className="min-h-screen">…</CursorHighlight>`.
- **`TrustGraph.jsx`** — interactive trust graph with draggable nodes, animated edges, and
  hover-highlight. Requires `npm i reactflow`. Renders confirmed/opted-in actors only (PRD §20).
- **`AnimatedAnswerCard.jsx`** — answer card with entrance fade-in and hover flash/glow.
  Pure Tailwind/CSS, no dependencies. Shows anonymized trust evidence before identity reveal.

## How to use in a Lovable project

1. Lovable generates the screen first. If a custom interaction disappoints, copy the matching
   component file into the Lovable project's `src/components/`.
2. Replace Lovable's element with the component, passing the props shown in each file's header.
3. For `TrustGraph`, run `npm i reactflow` in the Lovable project.

## Decision rule (from the plan)
- Responsive layout, hover flashes, color/scale transitions, entrance animations → let Lovable do it.
- Cursor-following highlight and the moving/interactive graph → use these fallbacks; don't burn prompts.
- Time-box: one focused Lovable attempt (~15 min) per custom effect, then switch to the fallback.

These are intentionally minimal per the engineering-discipline skill — no theming system, no config
beyond the props each effect needs. Tweak colors inline to match the brand.
