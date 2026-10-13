"""Extract structured CCMAS course-detail candidates from official PDF text.

The parser is intentionally conservative: it emits candidate headers,
workload, outcome and content blocks for comparison, but does not mutate the
CCMAS JSON. A candidate is not proof until its programme context is confirmed.
"""

from __future__ import annotations

import json
import argparse
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
QUEUE = AUDIT / "jamb_ccmas_source_locator_enriched_queue_2026-09-29.json"
TEXT_DIR = AUDIT / "ccmas_source_text_2026-09-29"
OUT_JSON = AUDIT / "jamb_ccmas_course_detail_candidates_2026-09-29.json"
OUT_MD = AUDIT / "jamb_ccmas_course_detail_candidates_2026-09-29.md"

SOURCE_TEXT = {
    "administration_management.json": TEXT_DIR / "administration_management.txt",
    "agricultural_science.json": TEXT_DIR / "agricultural_science.txt",
    "allied_health.json": ROOT / "_pdftxt" / "allied_health.txt",
    "architecture.json": ROOT / "_pdftxt" / "architecture.txt",
    "arts.json": ROOT / "_pdftxt" / "arts.txt",
    "basic_medical.json": ROOT / "_pdftxt" / "basic_medical.txt",
    "communication_media.json": ROOT / "_ccmas_txt" / "comm.txt",
    "computing.json": ROOT / "_ccmas_txt" / "computing.txt",
    "education.json": ROOT / "_pdftxt" / "education.txt",
    "engineering.json": ROOT / "_ccmas_txt" / "engineering.txt",
    "environmental_sciences.json": ROOT / "_pdftxt" / "environmental_sciences.txt",
    "law.json": TEXT_DIR / "law.txt",
    "medicine_dentistry.json": TEXT_DIR / "medicine_dentistry.txt",
    "pharmacy.json": ROOT / "_pdftxt" / "pharmacy.txt",
    "sciences.json": ROOT / "_ccmas_txt" / "sciences.txt",
    "social_sciences.json": TEXT_DIR / "social_sciences.txt",
    "veterinary.json": ROOT / "_pdftxt" / "veterinary.txt",
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def code_pattern(code: str) -> re.Pattern[str]:
    parts = norm(code).split()
    # Official CCMAS text alternates between ``ECO 205`` and ``ECO: 205``.
    # Treat the punctuation as presentation noise while retaining the
    # word-boundary guards.
    return re.compile(r"(?<![A-Z0-9])" + r"\s*[:\-]?\s*".join(re.escape(part) for part in parts) + r"(?![A-Z0-9])", re.I)


def compact_code(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value or "").casefold())


def build_page_code_index(pages: list[str]) -> dict[str, list[int]]:
    """Index likely CCMAS course-code pages before detailed extraction.

    The former full-catalogue mode called the structured extractor against every
    page for every course. Indexing first preserves the same extractor rules
    while avoiding an O(courses * pages) scan.
    """
    index: dict[str, set[int]] = {}
    pattern = re.compile(r"(?<![A-Z0-9])([A-Z]{2,10})\s*[:\-/]?\s*(\d{3,4})(?![A-Z0-9])", re.I)
    for page_index, page in enumerate(pages):
        for match in pattern.finditer(page):
            key = compact_code(match.group(1) + match.group(2))
            if key:
                index.setdefault(key, set()).add(page_index)
    return {key: sorted(values) for key, values in index.items()}


def extract_page_candidate(page: str, code: str, expected_title: str) -> list[dict[str, Any]]:
    pattern = code_pattern(code)
    code_matches = list(pattern.finditer(page))
    if not code_matches:
        return []
    next_header = re.compile(r"\n\s*[A-Z]{2,8}\s*[- ]?\s*\d{3}\s*:", re.I)
    results: list[dict[str, Any]] = []
    seen_starts: set[int] = set()

    def add_candidate(start: int, code_end: int, opening: int, code_text: str) -> None:
        if start in seen_starts:
            return
        if opening < 0:
            return
        header_text = page[code_end:opening].strip(" :\n\t")
        if not header_text or len(header_text) > 180 or re.search(r"learning outcomes|course contents", header_text, re.I):
            return
        workload_window = page[opening : min(len(page), opening + 260)]
        workload = re.search(
            r"\(\s*(?P<units>\d+)\s*Units?\s+(?P<status>[A-Z])\s*:\s*LH\s*(?P<lh>\d+|[-–])"
            r"(?:\s*[,;]?\s*PH\s*(?P<ph>\d+|[-–]))?",
            workload_window,
            re.I,
        )
        # A valid CCMAS detail may be practical-only (for example
        # ``(6 Units C: PH 270)``). The main expression historically required
        # LH, so recover these forms without relaxing the title/code guards.
        if not workload:
            workload = re.search(
                r"\(\s*(?P<units>\d+)\s*Units?\s+(?P<status>[A-Z])\s*:\s*"
                r"(?:(?:LH\s*(?P<lh>\d+|[-\u2013]))\s*[,;]?\s*)?"
                r"PH\s*(?P<ph>\d+|[-\u2013])",
                workload_window,
                re.I,
            )
        if not workload:
            # Some blocks omit the status letter and use lecture hours only,
            # e.g. ``(2 Units: LH 30)``. Preserve the source workload already
            # held in the CCMAS record when that one field is absent.
            workload = re.search(
                r"\(\s*(?P<units>\d+)\s*Units?\s+(?P<status>[A-Z])?\s*:\s*"
                r"(?=(?:LH|PH)\b)"
                r"(?:(?:LH\s*(?P<lh>\d+|[-\u2013]))\s*[,;]?\s*)?"
                r"(?:PH\s*(?P<ph>\d+|[-\u2013]))?",
                workload_window,
                re.I,
            )
        boundary = next_header.search(page, opening + 1)
        end = boundary.start() if boundary else min(len(page), opening + 12000)
        block = page[start:end]
        outcome_match = re.search(
            r"Learning\s+Outcomes?(?P<body>.*?)(?=Course\s+Contents?|$)",
            block,
            re.I | re.S,
        )
        content_match = re.search(r"Course\s+Contents?(?P<body>.*)$", block, re.I | re.S)
        workload_lh = workload.groupdict().get("lh") if workload else None
        workload_ph = workload.groupdict().get("ph") if workload else None
        candidate = {
            "course_code": norm(code_text),
            "title_candidate": norm(header_text),
            "expected_title": norm(expected_title),
            "title_tokens_in_candidate": all(
                token.casefold() in norm(header_text).casefold()
                for token in norm(expected_title).split()
                if len(token) > 2
            ),
            "workload": {
                "units": int(workload.group("units")) if workload else None,
                "status": workload.group("status").upper() if workload else None,
                "lecture_hours": int(workload_lh) if workload_lh and workload_lh.isdigit() else None,
                "practical_hours": int(workload_ph) if workload_ph and workload_ph.isdigit() else None,
                "raw": norm(workload.group(0)) if workload else None,
            },
            "outcomes_text": norm(outcome_match.group("body"))[:12000] if outcome_match else None,
            "content_text": norm(content_match.group("body"))[:12000] if content_match else None,
            "block_excerpt": norm(block)[:1600],
        }
        results.append(candidate)
        seen_starts.add(start)

    # The official text uses both ``CODE: Title`` and ``CODE Title``.  The
    # earlier extractor only accepted the colon form, which created a large
    # artificial no-candidate queue.  Accept the no-colon form only when a
    # real workload annotation follows the title, avoiding ordinary table rows.
    for match in code_matches:
        start = match.start()
        colon = page.find(":", start, start + 80)
        line_end = page.find("\n", start, min(len(page), start + 220))
        first_opening = page.find("(", match.end(), match.end() + 700)
        # A colon inside ``(… C: PH …)`` is a workload separator, not a
        # ``CODE: Title`` delimiter. Only take the colon branch when it comes
        # before the first workload opening parenthesis.
        if colon >= 0 and first_opening >= 0 and colon < first_opening and (line_end < 0 or colon < line_end):
            # Prefer a workload parenthesis on the same header line. A later
            # parenthesis in the outcome prose must not swallow the title.
            line_slice_end = line_end if line_end >= 0 else colon + 700
            line_workload = re.search(r"\(\s*\d+\s*Units?\b", page[colon:line_slice_end], re.I)
            line_opening = colon + line_workload.start() if line_workload else -1
            if line_opening >= 0:
                add_candidate(start, colon + 1, line_opening, page[start:colon])
                continue
            # Some official blocks place the workload in the preceding table
            # and begin the detailed block as ``CODE: Title`` with no inline
            # ``(… Units …)``. Keep the outcomes/content evidence and let the
            # guarded reconciler retain the already verified workload.
            if line_end > colon:
                add_candidate(start, colon + 1, line_end, page[start:colon])
                continue
        workload_marker = re.search(r"\(\s*\d+\s*Units?\b", page[match.end() : match.end() + 700], re.I)
        opening = match.end() + workload_marker.start() if workload_marker else -1
        if opening < 0:
            continue
        workload_window = page[opening : min(len(page), opening + 260)]
        if not re.search(r"\(\s*\d+\s*Units?\b", workload_window, re.I):
            continue
        add_candidate(start, match.end(), opening, page[start:match.end()])
    return results


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--queue", type=Path, default=QUEUE)
    parser.add_argument("--out-json", type=Path, default=OUT_JSON)
    parser.add_argument("--out-md", type=Path, default=OUT_MD)
    parser.add_argument("--source-text-dir", type=Path, default=None)
    parser.add_argument(
        "--all-ccmas",
        action="store_true",
        help="Enumerate all current CCMAS package/course rows instead of only the targeted JAMB repair queue.",
    )
    args = parser.parse_args()
    if args.all_ccmas:
        full_rows: list[dict[str, Any]] = []
        for source_path in sorted((ROOT / "ccmas").glob("*.json")):
            package = load(source_path)
            for programme in package.get("programmes", []):
                source_key = f"{source_path.name}::{programme.get('name')}"
                for course in programme.get("courses", []):
                    full_rows.append(
                        {
                            "source_key": source_key,
                            "course_code": course.get("code"),
                            "jamb_names": [],
                            "fields": [
                                "title", "units", "status", "lecture_hours",
                                "practical_hours", "content_summary", "learning_outcomes",
                            ],
                            "source_snapshot": {
                                "title": course.get("title"),
                                "units": course.get("units"),
                                "status": course.get("status"),
                                "lecture_hours": course.get("lh"),
                                "practical_hours": course.get("ph"),
                                "content_summary": course.get("content_summary"),
                                "learning_outcomes": course.get("skills_learned") or [],
                                "source_url": course.get("source_url"),
                                "source_locator": course.get("source_locator"),
                            },
                            "selected_snapshot": {},
                        }
                    )
        queue = {"course_record_queue": full_rows}
    else:
        queue = load(args.queue)
    page_cache: dict[str, list[str]] = {}
    page_code_indexes: dict[str, dict[str, list[int]]] = {}
    records: list[dict[str, Any]] = []
    states = Counter()
    for record in queue["course_record_queue"]:
        source_file = record["source_key"].split("::", 1)[0]
        text_path = (
            args.source_text_dir / f"{Path(source_file).stem}.txt"
            if args.source_text_dir
            else SOURCE_TEXT.get(source_file, TEXT_DIR / (Path(source_file).stem + ".txt"))
        )
        text_key = str(text_path)
        if text_key not in page_cache:
            raw = text_path.read_text(encoding="utf-8", errors="replace") if text_path.exists() else ""
            page_cache[text_key] = raw.split("\f")
            page_code_indexes[text_key] = build_page_code_index(page_cache[text_key])
        pages = page_cache[text_key]
        candidates: list[dict[str, Any]] = []
        candidate_page_indexes = page_code_indexes[text_key].get(compact_code(record["course_code"]))
        # Retain a conservative fallback for unusual source codes that do not
        # fit the catalogue's standard LETTERS + 3/4-digit form.
        if candidate_page_indexes is None:
            candidate_page_indexes = list(range(len(pages)))
        for page_index in candidate_page_indexes:
            ordinal = page_index + 1
            page = pages[page_index]
            if not page.strip():
                continue
            for candidate in extract_page_candidate(page, record["course_code"], record.get("source_snapshot", {}).get("title", "")):
                candidate["extracted_page_ordinal"] = ordinal
                candidates.append(candidate)
        exact = [item for item in candidates if item["title_tokens_in_candidate"]]
        workload = [item for item in exact if item["workload"]["units"] is not None]
        outcomes = [item for item in exact if item["outcomes_text"]]
        content = [item for item in exact if item["content_text"]]
        signatures = {
            json.dumps(
                {
                    "title_candidate": item.get("title_candidate"),
                    "workload": item.get("workload"),
                    "outcomes_text": item.get("outcomes_text"),
                    "content_text": item.get("content_text"),
                },
                ensure_ascii=False,
                sort_keys=True,
            )
            for item in exact
        }
        if len(exact) == 1 and len(workload) == 1:
            state = "one_exact_detail_candidate"
        elif exact and len(signatures) == 1 and workload and outcomes:
            state = "one_exact_equivalent_detail_candidate"
        elif exact:
            state = "multiple_exact_detail_candidates_context_review"
        elif candidates:
            state = "code_detail_candidate_title_mismatch"
        else:
            state = "no_structured_detail_candidate"
        states[state] += 1
        item = dict(record)
        item["automated_detail_candidates"] = {
            "state": state,
            "candidate_count": len(candidates),
            "exact_title_candidate_count": len(exact),
            "workload_candidate_count": len(workload),
            "outcome_candidate_count": len(outcomes),
            "content_candidate_count": len(content),
            "candidates": exact[:6] if exact else candidates[:6],
            "rule": "candidate extraction only; confirm exact programme context before repair",
        }
        records.append(item)

    counts = {"unique_course_records": len(records), **{f"state:{key}": value for key, value in sorted(states.items())}}
    output = {
        "schema": "2026-09-29.jamb-ccmas-course-detail-candidates.v1",
        "generated_on": date.today().isoformat(),
        "status": "automated_course_detail_candidate_extraction_complete",
        "counts": counts,
        "course_record_queue": records,
        "limits": [
            "The PDF may repeat a course across programme tables; multiple candidates require context review.",
            "An extracted workload/outcome/content block is not automatically the correct package mapping.",
            "No canonical CCMAS or JAMB mapping file is changed by this script.",
        ],
    }
    args.out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# CCMAS course-detail candidates — 2026-09-29",
        "",
        "Automated extraction of structured course-detail blocks from the retrieved official CCMAS PDF text.",
        "These are candidates for guarded comparison, not automatic repairs.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in counts.items())
    lines += ["", "## Limits", ""] + [f"- {item}" for item in output["limits"]] + [""]
    args.out_md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(args.out_json), "markdown": str(args.out_md), "counts": counts}, indent=2))


if __name__ == "__main__":
    main()
