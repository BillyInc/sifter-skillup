"""Second-pass deterministic extraction for CCMAS blank/placeholder summaries.

The first reconciliation used the structured course-detail queue.  This pass
re-scans every affected row against the original extracted CCMAS PDF pages and
tries the available source patterns directly: code/title headers, workload
headers, bounded programme sections, Learning Outcomes blocks, and Course
Contents/Content blocks.  It writes only a unique, workload-compatible,
source-bounded content block; everything else receives an explicit reason.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from extract_ccmas_course_detail_candidates_2026_09_29 import (
    SOURCE_TEXT,
    build_page_code_index,
    extract_page_candidate,
)
from reconcile_ccmas_ambiguous_detail_candidates_2026_09_29 import programme_page_ranges


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE_DIR = ROOT / "ccmas"
OUT_PREFIX = AUDIT / "ccmas_summary_pattern_second_pass_2026-09-30"

PLACEHOLDERS = {"", "-", "--", "---", "n/a", "na", "none", "not available", "not applicable", "nil", "tbc", "to be confirmed", "â€”", "—"}


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\u00a0", " ")).strip()


def fold(value: Any) -> str:
    return clean(value).casefold()


def blank(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return fold(value) in PLACEHOLDERS
    return False


def code_key(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value or "").casefold())


def tokens(value: Any) -> set[str]:
    return {item for item in re.findall(r"[a-z0-9]+", fold(value)) if len(item) > 2}


def salvage(value: Any) -> str:
    text = clean(value)
    cut = len(text)
    for marker in (r"\bCourse Code\s+Course title\b", r"\bTotal\s+\d+(?:\.\d+)?\b", r"\b\d{3}\s+Level\b"):
        match = re.search(marker, text, re.I)
        if match:
            cut = min(cut, match.start())
    return text[:cut].rstrip(" ;,\n")


def usable(value: Any) -> bool:
    text = salvage(value)
    return len(text) >= 24 and text[0].isupper() and text[-1] in ".!?;:)"


def parse_outcomes(value: Any) -> list[str]:
    text = clean(value)
    matches = list(re.finditer(r"(?:^|\s)(\d+)\.\s*", text))
    result: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        item = re.sub(r"\s+", " ", text[match.end() : end]).strip(" ;,\n")
        if item:
            result.append(item)
    return result


def workload_matches(course: dict[str, Any], candidate: dict[str, Any]) -> bool:
    workload = candidate.get("workload") or {}
    checks = (("units", "units"), ("status", "status"), ("lh", "lecture_hours"), ("ph", "practical_hours"))
    seen = 0
    for source_field, candidate_field in checks:
        source = course.get(source_field)
        if source is None:
            continue
        candidate_value = workload.get(candidate_field)
        if candidate_value is None:
            return False
        seen += 1
        if str(source).strip().casefold() != str(candidate_value).strip().casefold():
            return False
    return seen > 0


def signature(candidate: dict[str, Any]) -> tuple[str, str, str, str]:
    workload = candidate.get("workload") or {}
    return (
        fold(candidate.get("title_candidate")),
        fold(candidate.get("content_text")),
        fold(candidate.get("outcomes_text")),
        repr((workload.get("units"), workload.get("status"), workload.get("lecture_hours"), workload.get("practical_hours"))),
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    pages_cache: dict[str, list[str]] = {}
    index_cache: dict[str, dict[str, list[int]]] = {}
    ranges_cache: dict[str, dict[str, tuple[int, int]]] = {}
    rows: list[dict[str, Any]] = []
    documents: dict[Path, dict[str, Any]] = {}
    for source_path in sorted(SOURCE_DIR.glob("*.json")):
        document = json.loads(source_path.read_text(encoding="utf-8"))
        documents[source_path] = document
        for programme in document.get("programmes") or []:
            for course in programme.get("courses") or []:
                if not blank(course.get("content_summary")):
                    continue
                rows.append({
                    "source_path": source_path,
                    "source_file": source_path.name,
                    "programme": clean(programme.get("name")),
                    "code": clean(course.get("code")),
                    "title": clean(course.get("title")),
                    "course": course,
                })

    counters = Counter()
    dispositions: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    pending_files: set[Path] = set()

    for row in rows:
        source_file = row["source_file"]
        text_path = SOURCE_TEXT.get(source_file, AUDIT / "ccmas_original_source_text_2026-09-29" / f"{Path(source_file).stem}.txt")
        if str(text_path) not in pages_cache:
            raw = text_path.read_text(encoding="utf-8", errors="replace") if text_path.exists() else ""
            pages_cache[str(text_path)] = raw.split("\f")
            index_cache[str(text_path)] = build_page_code_index(pages_cache[str(text_path)])
        pages = pages_cache[str(text_path)]
        code_pages = index_cache[str(text_path)].get(code_key(row["code"]), [])
        if not code_pages:
            dispositions.append({**{key: row[key] for key in ("source_file", "programme", "code", "title")}, "disposition": "no_code_page_hit", "candidate_count": 0})
            counters["no_code_page_hit"] += 1
            continue

        if source_file not in ranges_cache:
            ranges_cache[source_file] = programme_page_ranges(source_file)
        bounds = ranges_cache[source_file].get(row["programme"])
        candidates: list[dict[str, Any]] = []
        for page_index in code_pages:
            page = pages[page_index]
            for candidate in extract_page_candidate(page, row["code"], row["title"]):
                candidate = dict(candidate)
                candidate["page"] = page_index + 1
                candidate["in_programme_bounds"] = bool(bounds and bounds[0] <= page_index + 1 <= bounds[1])
                candidate["salvaged_content"] = salvage(candidate.get("content_text"))
                candidate["title_overlap"] = round(len(tokens(candidate.get("title_candidate")) & tokens(row["title"])) / max(1, len(tokens(row["title"]))), 6)
                candidate["workload_matches"] = workload_matches(row["course"], candidate)
                candidates.append(candidate)

        unique: dict[tuple[str, str, str, str], dict[str, Any]] = {}
        for candidate in candidates:
            unique.setdefault(signature(candidate), candidate)
        candidates = list(unique.values())
        content_candidates = [item for item in candidates if usable(item.get("salvaged_content")) and item.get("title_overlap", 0) >= 0.75 and item.get("workload_matches")]
        bounded = [item for item in content_candidates if item.get("in_programme_bounds")]
        eligible = bounded if len(bounded) == 1 else content_candidates if len(content_candidates) == 1 and not bounds else []
        if len(eligible) == 1:
            selected = eligible[0]
            after = selected["salvaged_content"]
            change = {
                "source_file": source_file, "programme": row["programme"], "code": row["code"], "title": row["title"],
                "page": selected["page"], "pattern": "code_title_workload_learning_outcomes_course_contents",
                "before": row["course"].get("content_summary"), "after": after,
                "guard": "unique source-page candidate, programme-bounded when bounds are available, title/workload compatible",
            }
            changes.append(change)
            counters["unique_content_repair_candidate"] += 1
            dispositions.append({**{key: row[key] for key in ("source_file", "programme", "code", "title")}, "disposition": "unique_content_repair_candidate", "candidate_count": len(candidates), "page": selected["page"]})
            if args.apply:
                row["course"]["content_summary"] = after
                row["course"]["source_state"] = row["course"].get("source_state") or "source_reconciled"
                row["course"]["source_locator"] = row["course"].get("source_locator") or f"Original CCMAS PDF package section: {row['programme']}; course code {row['code']}"
                pending_files.add(row["source_path"])
        elif candidates:
            disposition = "ambiguous_or_unsafe_pattern_match"
            if not content_candidates:
                disposition = "code_or_header_hit_without_usable_content"
            elif bounds and not bounded:
                disposition = "content_candidate_outside_programme_bounds"
            counters[disposition] += 1
            dispositions.append({**{key: row[key] for key in ("source_file", "programme", "code", "title")}, "disposition": disposition, "candidate_count": len(candidates), "content_candidate_count": len(content_candidates), "bounded_candidate_count": len(bounded), "pages": sorted({item["page"] for item in candidates})[:20]})
        else:
            counters["no_structured_pattern_match"] += 1
            dispositions.append({**{key: row[key] for key in ("source_file", "programme", "code", "title")}, "disposition": "no_structured_pattern_match", "candidate_count": 0})

    if args.apply:
        for path in sorted(pending_files):
            path.write_text(json.dumps(documents[path], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    output = {
        "schema": "2026-09-30.ccmas-summary-pattern-second-pass.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "scope": {"affected_summary_rows_scanned": len(rows), "source_files": len(documents)},
        "counts": dict(counters),
        "dispositions": dispositions,
        "changes": changes,
        "patterns_checked": ["exact course-code page index", "code/title header", "workload annotation", "programme page bounds", "Learning Outcomes block", "Course Contents/Content block", "next-course/table-boundary trimming"],
        "rule": "Only a unique source candidate with compatible title/workload and a bounded programme page context is eligible for promotion; otherwise the row remains explicitly classified.",
    }
    suffix = "_applied" if args.apply else "_dry_run"
    out_json = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".json")
    out_md = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".md")
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_md.write_text("\n".join([
        "# CCMAS summary second-pass pattern extraction — 2026-09-30", "", f"Status: `{output['status']}`", "",
        f"Affected summary rows scanned: **{len(rows)}**", "", "## Dispositions", "",
        *[f"- **{name.replace('_', ' ')}:** {value}" for name, value in sorted(counters.items())], "",
        "The JSON ledger contains every scanned row and the exact source patterns examined.", "",
    ]), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": output["status"], "counts": dict(counters), "changes": len(changes)}, indent=2))


if __name__ == "__main__":
    main()
