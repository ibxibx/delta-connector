import { useEffect, useState } from "react";

/**
 * AnimatedAnswerCard — answer card with entrance fade-in and a flash/glow on hover.
 * Pure CSS transitions, no dependencies. Fallback for the Ask & Discover answer cards.
 *
 * PRD: show anonymized trust evidence before any identity reveal (§9.5, §20).
 *
 * Props:
 *   answer: { summary, category, stageFit, helpfulnessCount, trustEvidence }
 *   onFits, onFollowUp: () => void
 *   delay: ms entrance stagger
 */
export default function AnimatedAnswerCard({ answer, onFits, onFollowUp, delay = 0 }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white p-5
        transition-all duration-300 ease-out
        hover:border-indigo-300 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]
        ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
    >
      {/* flash overlay on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
          group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-br from-indigo-50 to-transparent"
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5">{answer.category}</span>
          <span className="text-slate-400">{answer.stageFit}</span>
        </div>
        <p className="mt-2 text-sm text-slate-800">{answer.summary}</p>
        <p className="mt-3 text-xs text-slate-500">{answer.trustEvidence}</p>
        <div className="mt-1 text-xs text-slate-400">
          Helpful for {answer.helpfulnessCount} founders
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onFits}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white
              transition-transform hover:scale-105 active:scale-95"
          >
            This answer fits
          </button>
          <button
            onClick={onFollowUp}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold
              text-slate-700 transition-colors hover:bg-slate-50"
          >
            Request follow-up
          </button>
        </div>
      </div>
    </div>
  );
}
