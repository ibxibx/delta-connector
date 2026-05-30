"""In-memory fit-confirmation overlay.

Deploy-safe counter for /answer-fits bumps. The disk file (answers.json) holds the
baseline; this overlay holds bumps made during the running session, so the demo's
"watch the number go up" works even on hosts with an ephemeral or read-only filesystem.
Resets on process restart, which is fine for a hackathon demo.
"""
from __future__ import annotations

_bumps: dict[str, int] = {}


def bump(answer_id: str) -> int:
    """Increment and return the total bumps for this answer this session."""
    _bumps[answer_id] = _bumps.get(answer_id, 0) + 1
    return _bumps[answer_id]


def get(answer_id: str) -> int:
    """Bumps recorded this session for this answer (0 if none)."""
    return _bumps.get(answer_id, 0)
