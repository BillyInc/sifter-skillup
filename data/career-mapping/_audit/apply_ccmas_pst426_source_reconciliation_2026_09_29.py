"""Reconcile PST 426 title, footer, summary and provenance; hold hour conflict."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "ccmas" / "allied_health.json"
URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"
OLD_OUTCOME = "demonstrate skills in managing and evaluating patients with musculoskeletal and neurological conditions commonly seen in physiotherapy. 500 Level"
NEW_OUTCOME = "demonstrate skills in managing and evaluating patients with musculoskeletal and neurological conditions commonly seen in physiotherapy."
TITLE = "Clinical Practice I (Neurophysiotherapy and Musculoskeletal)"
SUMMARY = (
    "Externally moderated professional clinical examination of practical skills in neurological and "
    "musculoskeletal physiotherapy. It assesses competencies developed in PST 412 (Musculoskeletal Injuries and "
    "Rehabilitation), PST 413 (clinical rotation in orthopaedics and traumatology), PST 421 (Neurological "
    "Physiotherapy I) and PST 422 (clinical rotation in neurology). Candidates demonstrate history-taking, "
    "physical examination and assessment, clinical reasoning and judgment, communication of treatment goals and "
    "plans, and management and evaluation of patients with musculoskeletal and neurological conditions."
)
CONFLICT = (
    "NUC source-internal workload conflict: the Physiotherapy global course table (printed p. 588) gives LH and "
    "PH as dashes, and its note at pp. 588-589 describes the externally moderated professional exam; the detailed "
    "PST 426 heading (printed p. 620) states PH 45. Existing local lh=null/ph=null is retained pending clarification."
)
LOCATOR = (
    "NUC Allied Health Sciences CCMAS 2023, Physiotherapy 400-level global course table printed p. 588 and "
    "adjacent PST 426* note printed pp. 588-589; detailed PST 426 block printed p. 620. Accessed 2026-09-29."
)


def main() -> None:
    text = TARGET.read_text(encoding="utf-8")
    marker = '"code": "PST 426"'
    if text.count(marker) != 1:
        raise RuntimeError("Expected one PST 426 row; refusing ambiguous repair")
    start = text.rfind("{", 0, text.index(marker))
    old, end = json.JSONDecoder().raw_decode(text[start:])
    if (old.get("level"), old.get("units"), old.get("status")) != (400, 1, "C"):
        raise RuntimeError("PST 426 course identity/load changed; refusing repair")
    if old.get("title") == TITLE and old.get("content_summary") == SUMMARY:
        if old.get("source_conflict_note") != CONFLICT or old.get("source_url") != URL:
            raise RuntimeError("PST 426 appears repaired but source conflict/provenance differs")
        return
    if old.get("title") != "Clinical Practice I" or old.get("content_summary") is not None:
        raise RuntimeError("PST 426 differs from audited pre-repair title/summary")
    if (old.get("lh"), old.get("ph")) != (None, None):
        raise RuntimeError("PST 426 hours changed; re-audit the source conflict before repair")
    outcomes = list(old.get("skills_learned", []))
    if len(outcomes) != 4 or outcomes[3] != OLD_OUTCOME:
        raise RuntimeError("PST 426 outcomes differ from audited extraction spill")
    outcomes[3] = NEW_OUTCOME

    updated = dict(old)
    updated.update(
        {
            "title": TITLE,
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
        if course.get("code") == "PST 426"
    )
    assert row["title"] == TITLE and (row["lh"], row["ph"]) == (None, None)
    assert row["skills_learned"][3] == NEW_OUTCOME and row["content_summary"] == SUMMARY
    assert row["source_url"] == URL and row["source_conflict_note"] == CONFLICT
    TARGET.write_text(rewritten, encoding="utf-8")
    print("Reconciled PST 426 title, outcome spill, summary and provenance; retained hour conflict.")


if __name__ == "__main__":
    main()
