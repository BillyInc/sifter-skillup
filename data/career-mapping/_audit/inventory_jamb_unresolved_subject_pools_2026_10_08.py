#!/usr/bin/env python3
"""Build a reproducible queue of unresolved JAMB subject-pool wording.

This is an inventory only: it does not infer subject pools or change seeds.
Each row preserves the source text, affected institution list, and existing
institution-specific source notes so a reviewer can resolve the proper scope.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
OUTPUT = CAREER / "_audit" / "jamb_unresolved_subject_pools_2026_10_08.json"
sys.path.insert(0, str(CAREER))

import _gen_subject_rule_records as rule_records  # noqa: E402


TARGET_WORDING = re.compile(
    r"\b(?:relevant|suitable|appropriate|related|cognate|pertinent)\b|"
    r"\bany\s+other\b|\bincluding\b|\bto\s+include\b",
    re.IGNORECASE,
)


def main() -> int:
    programmes = rule_records.load_programmes()
    parsed_rules = rule_records.resolve_contextual_rules(programmes)
    queue = []
    for name, programme in sorted(programmes.items()):
        for exam_type, field in (
            ("utme", "utme_subjects"),
            ("olevel", "olevel_requirement"),
        ):
            value = programme.get(field)
            source_text = rule_records.as_text(value)
            if not source_text:
                continue
            compiled = rule_records.source_rule(
                source_text,
                exam_type,
                parsed_override=parsed_rules[name].get(exam_type),
            )
            if compiled["rule_status"] in {"matchable", "cross_reference"}:
                continue
            if not TARGET_WORDING.search(source_text):
                continue
            notes = []
            for waiver in programme.get("institution_waivers") or []:
                note = rule_records.as_text(waiver.get("note"))
                if TARGET_WORDING.search(note):
                    notes.append(
                        {
                            "institution": waiver.get("institution")
                            or waiver.get("institutions"),
                            "note": note,
                            "source_file": waiver.get("source_file"),
                            "source_url": waiver.get("source_url"),
                            "source_locator": waiver.get("source_label"),
                        }
                    )
            queue.append(
                {
                    "jamb_programme": name,
                    "exam_type": exam_type,
                    "source_text": source_text,
                    "source_url": programme.get("source_url")
                    or "https://ibass.jamb.gov.ng/brochure-by-programme",
                    "source_locator": programme.get("source_locator"),
                    "offering_institutions": programme.get("institutions") or [],
                    "qualifier_or_pool_mentions": sorted(
                        {match.group(0).lower() for match in TARGET_WORDING.finditer(source_text)}
                    ),
                    "institution_scoped_source_notes": notes,
                }
            )

    payload = {
        "generated_by": str(Path(__file__).relative_to(ROOT)).replace("\\", "/"),
        "scope": "Unparsed O'Level/UTME source rows containing relevant/suitable/including/any-other wording",
        "row_count": len(queue),
        "unique_wording_count": len({row["source_text"].casefold() for row in queue}),
        "rows": queue,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Unresolved wording rows: {payload['row_count']}")
    print(f"Unique source-text variants: {payload['unique_wording_count']}")
    print(f"-> {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
