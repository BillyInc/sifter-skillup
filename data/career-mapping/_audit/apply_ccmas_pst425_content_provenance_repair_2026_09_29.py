"""Repair PST 425 footer/truncation/provenance; preserve its hours conflict."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
OUTCOME_BEFORE = "demonstrate skills in physiotherapy management of patients with psychiatric and psychological conditions. Allied Health Sciences  620                     New"
OUTCOME_AFTER = "demonstrate skills in physiotherapy management of patients with psychiatric and psychological conditions."
SUMMARY = (
    "Psychiatry and mental-health content includes psychiatric disorders, their prevalence and pathologies; anxiety "
    "including panic attacks, phobias and obsessive-compulsive behaviours; psychosomatic disorders including "
    "conversion disorder, hysterical paralysis and hypochondriasis; schizophrenia, bipolar disorder, perseveration, "
    "organic brain syndromes, neurosis, sexual disorders, transference and counter-transference. It also considers "
    "physiotherapy interventions and counselling for psychosomatic disorders, burnout in human-service work and its "
    "prevention, and psychological testing tools."
)
CONFLICT = (
    "NUC source-internal workload conflict: the Physiotherapy global course table (printed p. 588) gives LH 15 / "
    "PH 15; the PST 425 detailed heading (printed p. 619) gives LH 15 and states no PH. Existing local lh=15/ph=45 "
    "is retained pending source-owner clarification; the table's PH 15 is explicitly recorded but not substituted."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy global course table printed p. 588 "
    "(LH 15, PH 15), PST 425 detailed heading printed p. 619 (LH 15) and course contents printed p. 620. "
    "Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 425"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected exactly one PST 425 row; refusing ambiguous repair")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("title"), old.get("level"), old.get("units"), old.get("status")) != (
        "Psychiatry and Mental Health", 400, 2, "C"
    ):
        raise RuntimeError("PST 425 identity changed; refusing repair")
    if old.get("content_summary") == SUMMARY:
        if old.get("source_url") != URL or old.get("source_conflict_note") != CONFLICT:
            raise RuntimeError("PST 425 summary exists but its provenance/conflict annotation differs")
        return
    if len(old.get("content_summary", "")) != 400 or (old.get("lh"), old.get("ph")) != (15, 45):
        raise RuntimeError("PST 425 no longer matches the audited pre-repair content/hours state")
    outcomes = list(old.get("skills_learned", []))
    if len(outcomes) != 5 or outcomes[4] != OUTCOME_BEFORE:
        raise RuntimeError("PST 425 outcome/footer differs from source audit; refusing edit")
    outcomes[4] = OUTCOME_AFTER

    updated = dict(old)
    updated.update(
        {
            "skills_learned": outcomes,
            "content_summary": SUMMARY,
            "source_url": URL,
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
        if course.get("code") == "PST 425"
    )
    assert (row["lh"], row["ph"]) == (15, 45)
    assert row["skills_learned"][4] == OUTCOME_AFTER
    assert row["content_summary"] == SUMMARY
    assert "global course table" in row["source_conflict_note"] and "detailed heading" in row["source_conflict_note"]
    assert row["source_url"] == URL and row["source_accessed_on"] == "2026-09-29"
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Repaired PST 425 outcome footer, truncated content and provenance; preserved hours conflict.")


if __name__ == "__main__":
    main()
