"""Repair the no-structured-original-source CCMAS outcome queue.

This is a deliberately narrow, append-only pass.  It starts from the current
131 rows whose outcomes are empty and whose original-PDF reconciliation class
is ``no_structured_original_source_candidate``.  It searches the extracted
text of the original CCMAS PDFs with layout-tolerant anchors, but promotes a
field only when one bounded course block is uniquely identified by the course
code/title and contains the field itself.  A curriculum table row, a nearby
generic outcomes section, or an ambiguous title is never treated as a course
detail block.

The output ledger covers every target row.  Rows without a safe candidate are
explicitly classified as source-absent or unresolved; no prose is invented.
Only target CCMAS JSON rows may be changed when ``--apply`` is supplied.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS_DIR = ROOT / "ccmas"
TEXT_DIR = AUDIT / "ccmas_original_source_text_2026-09-29"
REPORT = AUDIT / "ccmas_source_reconciliation_report_2026-09-29.json"
OUT_PREFIX = AUDIT / "ccmas_no_structured_outcome_repair_2026-09-30"


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\u00a0", " ")).strip()


def fold(value: Any) -> str:
    return clean(value).casefold()


def compact_code(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", fold(value))


def blank(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return not clean(value) or fold(value) in {"-", "--", "n/a", "na", "none", "nil"}
    if isinstance(value, list):
        return not any(clean(item) for item in value)
    return False


def title_tokens(title: Any) -> list[str]:
    text = clean(title)
    if not text or text.startswith("["):
        return []
    # Keep short but semantically important title tokens such as ``I``,
    # ``II`` and ``IT``.  Dropping them would turn ``Research Project II``
    # into the broad ``Research Project`` and could attach a generic block to
    # the wrong course.
    return [token for token in re.findall(r"[A-Za-z0-9]+", text.casefold()) if len(token) > 1]


def flexible_title_pattern(title: Any) -> re.Pattern[str] | None:
    tokens = title_tokens(title)
    if not tokens:
        return None
    # Require the complete title token sequence, allowing PDF line wrapping
    # and punctuation between words.  This avoids broad keyword matching.
    return re.compile(r"\s*[^A-Za-z0-9\n]{0,8}\s*".join(map(re.escape, tokens)), re.I)


def code_pattern(code: Any) -> re.Pattern[str] | None:
    raw = clean(code)
    if not re.search(r"[A-Za-z]", raw) or not re.search(r"\d", raw):
        return None
    parts = re.findall(r"[A-Za-z]+|\d+", raw)
    if len(parts) < 2:
        return None
    return re.compile(
        r"(?<![A-Za-z0-9])"
        + r"\s*[:\-/]?\s*".join(map(re.escape, parts))
        + r"(?![A-Za-z0-9])",
        re.I,
    )


def parse_outcomes(text: str) -> list[str]:
    body = clean(text)
    if not body:
        return []
    marks = list(re.finditer(r"(?:^|\s)(\d{1,2})\s*[\.\)]\s+", body))
    if not marks:
        return []
    values: list[str] = []
    for index, mark in enumerate(marks):
        end = marks[index + 1].start() if index + 1 < len(marks) else len(body)
        value = clean(body[mark.end() : end]).strip(" ;,")
        # Reject page spill and obvious next-section material.
        value = re.split(r"\b(?:Course Contents?|Course Outline|References|Recommended Texts?)\b", value, maxsplit=1, flags=re.I)[0].strip(" ;,")
        if len(value) >= 12:
            values.append(value)
    return values


def parse_content(text: str) -> str | None:
    value = clean(text).strip(" ;,")
    return value if len(value) >= 24 else None


def page_lines(page: str, offset: int) -> tuple[int, str]:
    line = page.count("\n", 0, offset) + 1
    start = page.rfind("\n", 0, offset) + 1
    end = page.find("\n", offset)
    return line, page[start : end if end >= 0 else len(page)]


def extract_layout_candidates(page: str, code: str, title: str) -> list[dict[str, Any]]:
    """Find only blocks with a tight code/title/workload/outcome anchor."""
    code_re = code_pattern(code)
    title_re = flexible_title_pattern(title)
    if not code_re or not title_re:
        return []
    code_hits = list(code_re.finditer(page))
    title_hits = list(title_re.finditer(page))
    candidates: list[dict[str, Any]] = []
    seen: set[tuple[int, str]] = set()

    for code_hit in code_hits:
        # A detail header must contain the full title close to the code.  A
        # catalogue table followed by a generic section is intentionally too
        # far away and therefore cannot be promoted.
        nearby_end = min(len(page), code_hit.end() + 1800)
        nearby = page[code_hit.end() : nearby_end]
        title_match = title_re.search(nearby)
        if not title_match:
            continue
        title_end = code_hit.end() + title_match.end()
        workload = re.search(
            r"\(\s*\d+\s*Units?\b[^\n]{0,100}\b(?:LH|PH)\s*\d+",
            page[title_end : min(len(page), title_end + 450)],
            re.I,
        )
        if not workload:
            continue
        # A detail block's workload must follow the matched title closely.
        # This excludes catalogue tables whose next parenthesised workload
        # belongs to a later generic course section.
        if workload.start() > 180:
            continue
        between_title_and_workload = page[title_end : title_end + workload.start()]
        if re.search(r"\b[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\b", between_title_and_workload):
            # Another catalogue course header intervenes; the workload is
            # not this course's detail annotation.
            continue
        header_end = title_end + workload.end()
        outcome_header = re.search(r"\bLearning\s+Outcomes?\b", page[header_end : min(len(page), header_end + 7000)], re.I)
        if not outcome_header:
            continue
        outcomes_start = header_end + outcome_header.end()
        before_outcomes = page[header_end:outcomes_start]
        if re.search(r"\b[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\b", before_outcomes):
            # The outcome heading belongs to a later course block, not to the
            # code/title pair that opened this candidate.
            continue
        # Catalogue tables are commonly followed by the document-wide
        # ``Course Contents and Learning Outcomes`` section.  That generic
        # heading is not evidence for the preceding table row.  In a bounded
        # course block, Learning Outcomes comes before Course Contents.
        between_header_and_outcomes = page[header_end : outcomes_start]
        if re.search(r"\bCourse\s+Contents?\b", between_header_and_outcomes, re.I):
            continue
        content_header = re.search(r"\bCourse\s+Contents?\b", page[outcomes_start : min(len(page), outcomes_start + 14000)], re.I)
        if not content_header:
            continue
        content_start = outcomes_start + content_header.start()
        next_header = re.search(
            r"\n\s*(?:[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}|Course\s+Contents?|Learning\s+Outcomes?|References|Recommended\s+Texts?)\b",
            page[content_start + content_header.end() : min(len(page), content_start + content_header.end() + 14000)],
            re.I,
        )
        content_end = content_start + content_header.end() + (next_header.start() if next_header else 12000)
        outcome_text = page[outcomes_start:content_start]
        content_text = page[content_start + content_header.end() : min(len(page), content_end)]
        outcomes = parse_outcomes(outcome_text)
        content = parse_content(content_text)
        if not outcomes and not content:
            continue
        line, line_text = page_lines(page, code_hit.start())
        signature = (line, "|".join(fold(item) for item in outcomes), fold(content))
        if signature in seen:
            continue
        seen.add(signature)
        candidates.append(
            {
                "line": line,
                "line_text": clean(line_text),
                "outcomes": outcomes,
                "content_summary": content,
                "excerpt": clean(page[code_hit.start() : min(len(page), content_end)])[:2500],
                "anchor": "exact course code and complete title within one bounded PDF page block",
            }
        )
    return candidates


def source_path(source_file: str) -> Path:
    return TEXT_DIR / f"{Path(source_file).stem}.txt"


def load_rows() -> tuple[list[dict[str, Any]], dict[tuple[str, str, str], dict[str, Any]], dict[Path, dict[str, Any]]]:
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    targets = [
        row for row in report["course_rows"]
        if row.get("outcomes_empty")
        and row.get("outcomes_source_class") == "no_structured_original_source_candidate"
    ]
    documents: dict[Path, dict[str, Any]] = {}
    lookup: dict[tuple[str, str, str], dict[str, Any]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        documents[path] = document
        for programme in document.get("programmes") or []:
            programme_name = clean(programme.get("name"))
            for course in programme.get("courses") or []:
                key = (path.name, programme_name, compact_code(course.get("code")))
                lookup[key] = course
    return targets, lookup, documents


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    targets, lookup, documents = load_rows()
    pages_cache: dict[Path, list[str]] = {}
    ledger: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    counters = Counter()
    pending_files: set[Path] = set()

    for target in targets:
        key = (target["source_file"], target["programme"], compact_code(target["code"]))
        course = lookup.get(key)
        text_path = source_path(target["source_file"])
        raw = text_path.read_text(encoding="utf-8", errors="replace") if text_path.exists() else ""
        pages = pages_cache.setdefault(text_path, raw.split("\f"))
        code_re = code_pattern(target["code"])
        title_re = flexible_title_pattern(target.get("title"))
        code_hits = sum(len(list(code_re.finditer(page))) for page in pages) if code_re else 0
        title_hits = sum(len(list(title_re.finditer(page))) for page in pages) if title_re else 0
        candidates: list[dict[str, Any]] = []
        for page_number, page in enumerate(pages, start=1):
            if not page.strip():
                continue
            for candidate in extract_layout_candidates(page, target["code"], target.get("title") or ""):
                candidate["page"] = page_number
                candidates.append(candidate)

        signatures = {
            json.dumps({"outcomes": c["outcomes"], "content": c["content_summary"]}, ensure_ascii=False, sort_keys=True)
            for c in candidates
        }
        unique = len(signatures) == 1 and len(candidates) == 1
        field_changes: list[dict[str, Any]] = []
        disposition = "source_absent_no_bounded_detail_block"
        reason = "The original PDF text contains no uniquely bounded code/title/workload/outcomes-content block."
        selected = candidates[0] if unique else None
        if selected and course:
            if blank(course.get("skills_learned")) and selected["outcomes"]:
                field_changes.append({"field": "skills_learned", "before": copy.deepcopy(course.get("skills_learned") or []), "after": selected["outcomes"]})
            if blank(course.get("content_summary")) and selected.get("content_summary"):
                field_changes.append({"field": "content_summary", "before": course.get("content_summary"), "after": selected["content_summary"]})
            if field_changes:
                disposition = "repaired_unique_bounded_original_source_block"
                reason = "Exactly one bounded original-PDF block matched the complete course code and title and supplied the repaired field(s)."
                if not course.get("source_state"):
                    field_changes.append({"field": "source_state", "before": None, "after": "source_reconciled"})
                if not course.get("source_locator"):
                    field_changes.append({"field": "source_locator", "before": None, "after": f"Original CCMAS PDF page {selected['page']}; exact course block for {target['code']}"})
                change = {
                    "source_file": target["source_file"], "programme": target["programme"], "code": target["code"], "title": target.get("title"),
                    "page": selected["page"], "fields": field_changes,
                    "guard": "single bounded code/title/workload/outcomes-content block; blank-only repair",
                }
                changes.append(change)
                if args.apply:
                    for item in field_changes:
                        course[item["field"]] = copy.deepcopy(item["after"])
                    pending_files.add(CCMAS_DIR / target["source_file"])
            else:
                disposition = "source_block_found_but_no_target_field_needed"
                reason = "A unique block was found, but it supplied no currently blank target field."
        elif candidates:
            disposition = "unresolved_multiple_or_conflicting_layout_blocks"
            reason = "The tolerant scan found multiple non-equivalent bounded blocks; no automatic choice is safe."

        counters[disposition] += 1
        ledger.append({
            "source_file": target["source_file"], "programme": target["programme"], "code": target["code"], "title": target.get("title"),
            "code_hit_count": code_hits, "title_hit_count": title_hits, "bounded_candidate_count": len(candidates),
            "candidate_pages": [c["page"] for c in candidates], "disposition": disposition, "reason": reason,
            "candidates": candidates[:5],
        })

    if args.apply:
        for path in sorted(pending_files):
            path.write_text(json.dumps(documents[path], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    output = {
        "schema": "2026-09-30.ccmas-no-structured-outcome-repair.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "scope": {"target_rows": len(targets), "source_documents": len(documents), "original_text_dir": str(TEXT_DIR.relative_to(ROOT))},
        "counts": dict(sorted(counters.items())),
        "changes": changes,
        "ledger": ledger,
        "limits": [
            "Only the 131 current no_structured_original_source_candidate empty-outcome rows are in scope.",
            "A source table row or generic nearby outcomes section is not a bounded course detail block.",
            "Rows without a uniquely supported original block remain explicitly source-absent or unresolved; no text is invented.",
        ],
    }
    suffix = "_applied" if args.apply else "_dry_run"
    out_json = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".json")
    out_md = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".md")
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = [
        "# CCMAS no-structured-source outcome repair — 2026-09-30", "", f"Status: `{output['status']}`", "",
        "## Scope", "", f"- Target rows: **{len(targets)}**", f"- Original source text directory: `{TEXT_DIR.relative_to(ROOT)}`", "",
        "## Dispositions", "",
    ]
    md.extend(f"- `{name}`: **{value}**" for name, value in sorted(counters.items()))
    md += ["", "The JSON ledger contains every target row, source hit counts, bounded candidates, and the reason for each disposition.", ""]
    out_md.write_text("\n".join(md), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": output["status"], "counts": dict(sorted(counters.items())), "changes": len(changes)}, indent=2))


if __name__ == "__main__":
    main()
