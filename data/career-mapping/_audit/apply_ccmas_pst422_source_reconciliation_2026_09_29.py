"""Apply the source-confirmed PST 422 curriculum corrections with provenance."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
SOURCE_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
SUMMARY = (
    "Clinical rotation in neurological physiotherapy: take patient histories; perform physical examinations and "
    "relevant assessments; reason clinically; plan, coordinate, deliver and evaluate care for neurological "
    "conditions such as stroke, Parkinson's disease, diabetes mellitus and Guillain-Barre syndrome. Respect "
    "patient rights and confidentiality; communicate treatment goals and plans and set goals. Treatment approaches "
    "include proprioceptive neuromuscular facilitation, neurodevelopmental/Bobath techniques, motor-control and "
    "motor-learning approaches, and compensation."
)
CONFLICT = (
    "Source wording retained verbatim: learning outcome 3 refers to communicating treatment goals and plans with "
    "patients with orthopaedic conditions inside the PST 422 Neurology rotation. This appears inconsistent with "
    "the course context, but no correction is inferred; seek NUC clarification."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy global course table printed p. 588 "
    "(PST 422, 2 units, C, LH dash, PH 90) and detailed PST 422 block printed p. 618 "
    "(four learning outcomes and course contents). Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 422"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected one PST 422 row; refusing ambiguous reconciliation")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Physiotherapy Clinical Rotation in Neurology-I", 400, 2, "C"
    ):
        raise RuntimeError("PST 422 identity changed; refusing reconciliation")
    if old.get("ph") == 90 and old.get("content_summary") == SUMMARY:
        if old.get("source_url") != SOURCE_URL or old.get("source_conflict_note") != CONFLICT:
            raise RuntimeError("PST 422 appears reconciled but provenance/conflict annotation differs")
        return
    if old.get("ph") is not None or len(old.get("content_summary", "")) != 400:
        raise RuntimeError("PST 422 differs from the audited pre-reconciliation state")
    outcomes = old.get("skills_learned", [])
    if len(outcomes) != 4 or "orthopaedic conditions" not in outcomes[2]:
        raise RuntimeError("PST 422 outcomes changed; refusing conflict annotation")

    updated = dict(old)
    updated.update(
        {
            "ph": 90,
            "content_summary": SUMMARY,
            "source_url": SOURCE_URL,
            "source_locator": LOCATOR,
            "source_accessed_on": "2026-09-29",
            "source_conflict_note": CONFLICT,
        }
    )
    indent_start = text.rfind("\n", 0, start) + 1
    indent = text[indent_start:start]
    lines = json.dumps(updated, ensure_ascii=False, indent=1).splitlines()
    replacement = lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])
    rewritten = text[:start] + replacement + text[start + end :]
    parsed = json.loads(rewritten)
    row = next(
        course
        for programme in parsed["programmes"]
        if programme["name"] == "Physiotherapy"
        for course in programme["courses"]
        if course.get("code") == "PST 422"
    )
    assert row["ph"] == 90 and len(row["skills_learned"]) == 4
    assert row["content_summary"] == SUMMARY
    assert "orthopaedic conditions" in row["skills_learned"][2]
    assert row["source_url"] == SOURCE_URL and row["source_conflict_note"] == CONFLICT
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Reconciled PST 422 PH, truncated content and provenance; preserved the NUC wording conflict.")


if __name__ == "__main__":
    main()
