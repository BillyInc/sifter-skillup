"""Attach deterministic PDF locator candidates to the unique repair queue.

This enriches the repair queue without changing canonical data. A code/title
hit is a locator candidate, not proof that the source row's content, outcomes,
or mapping is correct.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
QUEUE = AUDIT / "jamb_ccmas_targeted_repair_queue_2026-09-29.json"
TEXT_SEARCH = AUDIT / "jamb_ccmas_local_source_text_search_2026-09-28.json"
OUT_JSON = AUDIT / "jamb_ccmas_source_locator_enriched_queue_2026-09-29.json"
OUT_MD = AUDIT / "jamb_ccmas_source_locator_enriched_queue_2026-09-29.md"


def norm_code(value: Any) -> str:
    return " ".join(str(value or "").upper().split())


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    queue = load(QUEUE)
    text_search = load(TEXT_SEARCH)
    locator_index: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for package in text_search.get("ccmas_packages", []):
        source_key = f"{package['source_file']}::{package['programme']}"
        for course in package.get("courses", []):
            locator_index.setdefault((source_key, norm_code(course.get("course_code"))), []).append(course)

    enriched: list[dict[str, Any]] = []
    states = Counter()
    for record in queue["course_record_queue"]:
        key = (record["source_key"], norm_code(record["course_code"]))
        candidates = locator_index.get(key, [])
        if any(item.get("title_exactly_present_on_code_hit_page") for item in candidates):
            state = "code_title_same_page_candidate"
        elif any(item.get("code_hit_count_in_local_extract", 0) for item in candidates):
            state = "code_hit_without_same_page_title_candidate"
        else:
            state = "code_not_located_in_extracted_source"
        states[state] += 1
        item = dict(record)
        item["automated_source_locator"] = {
            "state": state,
            "candidate_pages": sorted(
                {
                    page
                    for candidate in candidates
                    for page in candidate.get("title_code_cohit_pages", [])
                }
            ),
            "code_hit_pages": sorted(
                {
                    page
                    for candidate in candidates
                    for page in candidate.get("code_hit_pages_in_local_extract", [])
                }
            ),
            "candidate_snippets": [
                snippet
                for candidate in candidates
                for snippet in candidate.get("candidate_code_hit_snippets", [])[:5]
            ][:10],
            "candidate_count": len(candidates),
            "rule": "locator candidate only; source context and field-level correctness still require review",
        }
        enriched.append(item)

    output = {
        "schema": "2026-09-29.jamb-ccmas-source-locator-enriched-queue.v1",
        "generated_on": date.today().isoformat(),
        "status": "automated_locator_enrichment_complete_source_adjudication_open",
        "counts": {
            "unique_course_records": len(enriched),
            **{f"locator:{key}": value for key, value in sorted(states.items())},
        },
        "course_record_queue": enriched,
        "rule": "Use the candidate page/snippet to accelerate source review. Never promote a row or repair content/outcomes solely because a code and title co-occur on a page.",
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB–CCMAS source-locator enriched queue — 2026-09-29",
        "",
        "This is an automated locator pass over the deduplicated repair queue. It does not certify source correctness.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in output["counts"].items())
    lines += [
        "",
        "## Interpretation",
        "",
        "A same-page code/title candidate is a useful locator for the official PDF, but it does not prove the content, outcomes, workload, or JAMB component mapping. Those fields remain source-adjudication work.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": output["counts"]}, indent=2))


if __name__ == "__main__":
    main()
