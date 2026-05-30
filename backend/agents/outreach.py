"""Outreach Agent (PRD §17.2) — follow-up draft.

After a user marks an answer as fitting and requests a follow-up, this drafts a
short, polite message to the answer provider. The user must approve before anything
is sent (PRD §17.4: the agent never sends messages or reveals identity on its own).

Drafting here is a deterministic template as a hackathon stand-in; the real build
swaps in an LLM call (Opus) for natural phrasing. The consent/visibility gate is the
part that matters and is enforced regardless of how the text is generated.
"""
from __future__ import annotations


def draft_follow_up(answer_summary: str, question: str = "", asker_name: str = "",
                    consent_ok: bool = False) -> dict:
    """Return a drafted follow-up the user can approve/edit before sending.

    consent_ok must be True (the provider has opted into being contacted for this
    interaction). If not, we return no draft and no identity — only a path to request consent.
    """
    if not consent_ok:
        return {
            "status": "consent_required",
            "draft": None,
            "message": "The answer provider hasn't opted into a follow-up yet. "
                       "We can send them a consent request without revealing your details.",
            "next_action": "request_consent",
        }

    greeting = "Hi," if not asker_name else f"Hi, I'm {asker_name}."
    topic = question.strip() or "the topic you helped with"
    draft = (
        f"{greeting}\n\n"
        f"Your answer on {topic} was exactly what I needed — thank you. "
        f"I'd love a short follow-up to go a level deeper on my specific situation. "
        f"Would you be open to a 15-minute call or a few messages this week?\n\n"
        f"Thanks so much."
    )
    return {
        "status": "drafted",
        "draft": draft,
        "message": "Draft ready. Review and edit before sending — nothing is sent until you approve.",
        "next_action": "approve_to_send",
    }
