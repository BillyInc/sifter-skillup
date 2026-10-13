"""Second deterministic pass over CCMAS rows with no structured source block.

The first pass uses the checked-in pypdf text corpus.  This pass deliberately
uses a different extraction path (pdfplumber) and the PDF's common layout
variants: normal reading order, layout-preserving text, word-line rebuilding,
wrapped headers, colon/no-colon headers, and blocks spanning an adjacent PDF
page.  It remains narrowly scoped to the current no-structured empty-outcome
queue and only promotes one unique code/title-anchored outcome block.
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

import pdfplumber

from repair_ccmas_no_structured_outcomes_2026_09_30 import (
    CCMAS_DIR,
    REPORT,
    ROOT,
    TEXT_DIR,
    blank,
    clean,
    code_pattern,
    compact_code,
    flexible_title_pattern,
    parse_content,
    parse_outcomes,
)


AUDIT = ROOT / "_audit"
MANIFEST = AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
OUT_PREFIX = AUDIT / "ccmas_no_structured_layout_variants_2026-09-30"


def word_lines(page: Any) -> str:
    words = page.extract_words(use_text_flow=True, keep_blank_chars=False) or []
    rows: dict[tuple[int, int], list[dict[str, Any]]] = {}
    for word in words:
        key = (round(float(word.get("top", 0)) / 2), round(float(word.get("bottom", 0)) / 2))
        rows.setdefault(key, []).append(word)
    lines: list[str] = []
    for _, values in sorted(rows.items()):
        values.sort(key=lambda item: float(item.get("x0", 0)))
        lines.append(" ".join(str(item.get("text") or "") for item in values))
    return "\n".join(lines)


def header_gap_ok(text: str, start: int, end: int) -> bool:
    gap = text[start:end]
    if len(gap) > 220:
        return False
    # A different course row between the title and workload means the
    # workload belongs to the catalogue table, not to this detail header.
    return not re.search(r"(?m)^\s*[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\b", gap)


def extract_outcome_only_candidates(text: str, code: str, title: str) -> list[dict[str, Any]]:
    """Extract a bounded block even when the source omits Course Contents."""
    code_re = code_pattern(code)
    title_re = flexible_title_pattern(title)
    if not code_re or not title_re:
        return []
    results: list[dict[str, Any]] = []
    seen: set[tuple[int, tuple[str, ...]]] = set()
    next_course = re.compile(r"\n\s*[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\b", re.I)
    for code_hit in code_re.finditer(text):
        title_match = title_re.search(text, code_hit.end(), min(len(text), code_hit.end() + 1000))
        if not title_match:
            continue
        workload = re.search(
            r"\(\s*\d+\s*Units?\b[^\n]{0,100}\b(?:LH|PH)\s*\d+",
            text,
            re.I,
            pos=title_match.end(),
        )
        if not workload or workload.start() - title_match.end() > 220:
            continue
        if not header_gap_ok(text, title_match.end(), workload.start()):
            continue
        after_workload = workload.end()
        outcome_header = re.search(r"\bLearning\s+Outcomes?\b", text[after_workload : min(len(text), after_workload + 5000)], re.I)
        if not outcome_header:
            continue
        outcome_start = after_workload + outcome_header.end()
        content_match = re.search(r"\bCourse\s+Contents?\b", text[outcome_start : min(len(text), outcome_start + 10000)], re.I)
        next_outcome = re.search(r"\bLearning\s+Outcomes?\b", text[outcome_start + 1 : min(len(text), outcome_start + 12000)], re.I)
        next_course_match = next_course.search(text, outcome_start)
        boundaries = [value for value in (
            outcome_start + content_match.start() if content_match else None,
            outcome_start + 1 + next_outcome.start() if next_outcome else None,
            next_course_match.start() if next_course_match else None,
            min(len(text), outcome_start + 10000),
        ) if value is not None and value > outcome_start]
        outcome_end = min(boundaries) if boundaries else len(text)
        outcomes = parse_outcomes(text[outcome_start:outcome_end])
        if not outcomes:
            continue
        content = None
        if content_match:
            content_start = outcome_start + content_match.end()
            content_end = min(len(text), content_start + 12000)
            next_block = next_course.search(text, content_start)
            if next_block:
                content_end = min(content_end, next_block.start())
            content = parse_content(text[content_start:content_end])
        signature = (code_hit.start(), tuple(item.casefold() for item in outcomes))
        if signature in seen:
            continue
        seen.add(signature)
        results.append({
            "outcomes": outcomes,
            "content_summary": content,
            "excerpt": clean(text[code_hit.start() : min(len(text), outcome_end + 1200)])[:2500],
            "anchor": "pdfplumber code/title/workload/outcomes block; Course Contents optional",
        })
    return results


def load_targets() -> tuple[list[dict[str, Any]], dict[tuple[str, str, str], dict[str, Any]], dict[Path, dict[str, Any]]]:
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
                lookup[(path.name, programme_name, compact_code(course.get("code")))] = course
    return targets, lookup, documents


def indexed_page_numbers(targets: list[dict[str, Any]], source_file: str) -> list[int]:
    """Use the existing original-text page index to bound PDF layout work.

    Every candidate page is expanded by one page on either side so a detail
    header, outcomes, or contents block split by a PDF page boundary is still
    considered.  A target with no code/title hit remains explicitly
    unresolvable rather than causing a whole-document fuzzy search.
    """
    path = TEXT_DIR / f"{Path(source_file).stem}.txt"
    if not path.exists():
        return []
    pages = path.read_text(encoding="utf-8", errors="replace").split("\f")
    numbers: set[int] = set()
    for target in targets:
        code_re = code_pattern(target.get("code"))
        title_re = flexible_title_pattern(target.get("title"))
        for index, page in enumerate(pages, start=1):
            if (code_re and code_re.search(page)) or (title_re and title_re.search(page)):
                numbers.update({max(1, index - 1), index, min(len(pages), index + 1)})
    return sorted(numbers)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    targets, lookup, documents = load_targets()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    pdfs = {item["source_file"]: Path(item["original_pdf"]) for item in manifest["source_documents"]}
    page_variants: dict[str, list[tuple[int, str, str]]] = {}
    counters = Counter()
    ledger: list[dict[str, Any]] = []
    changes: list[dict[str, Any]] = []
    pending_files: set[Path] = set()

    source_files = sorted({row["source_file"] for row in targets})
    indexed_pages: dict[str, list[int]] = {
        source_file: indexed_page_numbers(targets, source_file) for source_file in source_files
    }
    for source_file in source_files:
        pdf_path = pdfs.get(source_file)
        variants: list[tuple[int, str, str]] = []
        if pdf_path and pdf_path.exists():
            with pdfplumber.open(str(pdf_path)) as pdf:
                for index in indexed_pages.get(source_file, []):
                    if index > len(pdf.pages):
                        continue
                    page = pdf.pages[index - 1]
                    reading = page.extract_text(x_tolerance=2, y_tolerance=3) or ""
                    layout = page.extract_text(x_tolerance=1, y_tolerance=2, layout=True) or ""
                    texts = {"reading": reading, "layout": layout}
                    # Coordinate reconstruction is the expensive variant. It
                    # is needed only on pages that visibly contain a detail
                    # section; indexed table-only/adjacent pages still get
                    # both text-layout forms and remain covered.
                    if re.search(r"\bLearning\s+Outcomes?|\bCourse\s+Contents?\b", reading + "\n" + layout, re.I):
                        texts["word_lines"] = word_lines(page)
                    for mode, text in texts.items():
                        if text.strip():
                            variants.append((index, mode, text))
        page_variants[source_file] = variants

    for target in targets:
        key = (target["source_file"], target["programme"], compact_code(target["code"]))
        course = lookup.get(key)
        source_variants = page_variants.get(target["source_file"], [])
        candidates: list[dict[str, Any]] = []
        for page, mode, text in source_variants:
            for candidate in extract_outcome_only_candidates(text, target["code"], target.get("title") or ""):
                candidate = copy.deepcopy(candidate)
                candidate.update({"page": page, "mode": mode})
                candidates.append(candidate)
        signatures = {
            json.dumps({"outcomes": item["outcomes"], "content": item.get("content_summary")}, ensure_ascii=False, sort_keys=True)
            for item in candidates
        }
        # The same source block appears in multiple extraction modes; collapse
        # only exact semantic duplicates, never merely similar blocks.
        unique_by_signature: dict[str, dict[str, Any]] = {}
        for candidate in candidates:
            signature = json.dumps({"outcomes": candidate["outcomes"], "content": candidate.get("content_summary")}, ensure_ascii=False, sort_keys=True)
            unique_by_signature.setdefault(signature, candidate)
        unique = list(unique_by_signature.values())
        disposition = "source_absent_no_bounded_detail_block"
        reason = "All PDF layout variants contained no uniquely bounded code/title/workload/outcomes block."
        selected = unique[0] if len(unique) == 1 else None
        field_changes: list[dict[str, Any]] = []
        if selected and course:
            if blank(course.get("skills_learned")) and selected["outcomes"]:
                field_changes.append({"field": "skills_learned", "before": copy.deepcopy(course.get("skills_learned") or []), "after": selected["outcomes"]})
            if blank(course.get("content_summary")) and selected.get("content_summary"):
                field_changes.append({"field": "content_summary", "before": course.get("content_summary"), "after": selected["content_summary"]})
            if field_changes:
                disposition = "repaired_unique_layout_variant_block"
                reason = "Exactly one semantic candidate survived all pdfplumber layout variants."
                if not course.get("source_state"):
                    field_changes.append({"field": "source_state", "before": None, "after": "source_reconciled"})
                if not course.get("source_locator"):
                    field_changes.append({"field": "source_locator", "before": None, "after": f"Original CCMAS PDF page {selected['page']}; pdfplumber {selected['mode']} bounded block for {target['code']}"})
                changes.append({"source_file": target["source_file"], "programme": target["programme"], "code": target["code"], "title": target.get("title"), "page": selected["page"], "mode": selected["mode"], "fields": field_changes, "guard": "unique semantic candidate across all extraction layouts; blank-only repair"})
                if args.apply:
                    for item in field_changes:
                        course[item["field"]] = copy.deepcopy(item["after"])
                    pending_files.add(CCMAS_DIR / target["source_file"])
            else:
                disposition = "source_block_found_but_no_target_field_needed"
                reason = "A unique source block was found, but no in-scope target field was blank."
        elif len(unique) > 1:
            disposition = "unresolved_multiple_layout_candidates"
            reason = "Different semantic blocks survived the layout variants; automatic selection is unsafe."
        counters[disposition] += 1
        ledger.append({
            "source_file": target["source_file"], "programme": target["programme"], "code": target["code"], "title": target.get("title"),
            "semantic_candidate_count": len(unique), "candidate_pages": sorted({item["page"] for item in candidates}),
            "candidate_modes": sorted({item["mode"] for item in candidates}), "disposition": disposition, "reason": reason,
            "candidates": unique[:5],
        })

    if args.apply:
        for path in sorted(pending_files):
            path.write_text(json.dumps(documents[path], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output = {
        "schema": "2026-09-30.ccmas-no-structured-layout-variants.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "scope": {"target_rows": len(targets), "source_files": source_files, "pdf_extraction": "pdfplumber reading/layout/word_lines"},
        "counts": dict(sorted(counters.items())), "changes": changes, "ledger": ledger,
        "limits": [
            "Only current no_structured_original_source_candidate empty-outcome rows are in scope.",
            "Different semantic candidates are never collapsed merely because they share a course code or title.",
            "No text is invented when the original source does not expose a bounded block.",
        ],
    }
    suffix = "_applied" if args.apply else "_dry_run"
    out_json = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".json")
    out_md = OUT_PREFIX.with_name(OUT_PREFIX.name + suffix + ".md")
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = ["# CCMAS no-structured layout-variant repair — 2026-09-30", "", f"Status: `{output['status']}`", "", "## Counts", ""]
    md.extend(f"- `{name}`: **{value}**" for name, value in sorted(counters.items()))
    md += ["", "The JSON ledger records every target row and every semantic candidate surviving the alternative PDF extraction modes.", ""]
    out_md.write_text("\n".join(md), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": output["status"], "counts": dict(sorted(counters.items())), "changes": len(changes)}, indent=2))


if __name__ == "__main__":
    main()
