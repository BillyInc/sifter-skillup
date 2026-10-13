"""Inventory structural CCMAS extraction anomalies for source-by-source review.

This scanner creates candidate evidence only; it does not alter source data or
classify a candidate as incorrect without checking the cited NUC curriculum.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "ccmas"
OUTPUT = Path(__file__).resolve().parent / "ccmas_extraction_anomaly_inventory_2026-09-26.json"
PAGE_HEADER = re.compile(
    r"(?:Allied Health Sciences|Computing|Social Sciences|Administration|Education|"
    r"Agriculture|Arts|Engineering|Sciences)\s{1,}\d{2,4}\s+New\b",
    re.IGNORECASE,
)


def main() -> None:
    courses: list[dict] = []
    programme_count = 0
    for source in sorted(SOURCE_DIR.glob("*.json")):
        document = json.loads(source.read_text(encoding="utf-8"))
        for programme in document.get("programmes", []):
            programme_count += 1
            for course in programme.get("courses", []):
                courses.append(
                    {
                        "source_file": source.name,
                        "programme": programme.get("name"),
                        "code": course.get("code"),
                        "title": course.get("title"),
                        "course": course,
                    }
                )

    empty_content = []
    duplicate_outcomes = []
    page_header_spill = []
    unresolved_crossrefs = []
    replacement_character = []
    for row in courses:
        course = row["course"]
        identity = {k: row[k] for k in ("source_file", "programme", "code", "title")}
        content = course.get("content_summary") or ""
        outcomes = course.get("skills_learned") or []
        if not content.strip() or content.strip() in {"---", "—", "-"}:
            empty_content.append(identity)
        counts = Counter(outcomes)
        repeated = [{"outcome": text, "count": count} for text, count in counts.items() if count > 1]
        if repeated:
            duplicate_outcomes.append({**identity, "repeated_outcomes": repeated})
        if PAGE_HEADER.search(content):
            page_header_spill.append({**identity, "content_excerpt": content[:500]})
        if "[SEE " in content or "Identical content at pages" in content:
            unresolved_crossrefs.append({**identity, "content_excerpt": content[:500]})
        if "\ufffd" in content or any("\ufffd" in outcome for outcome in outcomes):
            replacement_character.append({**identity, "content_excerpt": content[:500]})

    report = {
        "schema_version": 1,
        "audit_date": "2026-09-26",
        "method": "Deterministic scan of all parsed CCMAS package/course rows; source review required before defect classification.",
        "scope": {"source_files": len(list(SOURCE_DIR.glob("*.json"))), "programmes": programme_count, "course_records": len(courses)},
        "candidate_counts": {
            "empty_content_summary": len(empty_content),
            "exact_duplicate_outcome_course_rows": len(duplicate_outcomes),
            "page_header_spill": len(page_header_spill),
            "unresolved_cross_reference_text": len(unresolved_crossrefs),
            "replacement_character_text": len(replacement_character),
        },
        "classification_warning": "These are anomaly candidates, not confirmed errors. Empty content can be correct where the source provides no description; repeated outcomes can be intentional; a cross-reference may be valid only if its target is preserved; text artifacts require direct source comparison.",
        "candidates": {
            "empty_content_summary": empty_content,
            "exact_duplicate_outcome_course_rows": duplicate_outcomes,
            "page_header_spill": page_header_spill,
            "unresolved_cross_reference_text": unresolved_crossrefs,
            "replacement_character_text": replacement_character,
        },
    }
    OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "scope": report["scope"], "candidate_counts": report["candidate_counts"]}, indent=2))


if __name__ == "__main__":
    main()
