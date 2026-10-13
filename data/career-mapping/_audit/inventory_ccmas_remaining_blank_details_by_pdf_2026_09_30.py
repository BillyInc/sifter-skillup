"""Itemize blank CCMAS course summaries/outcomes by verified original PDF.

Read-only inventory. For each empty field, it records the source PDF, exact
course identity, inferred programme section, and code+title-matched source
blocks/pages so subsequent extraction can be targeted and checked.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
REPAIR_SCRIPT = HERE / "repair_all_ccmas_empty_details_from_original_pdfs_2026_09_30.py"
SPEC = importlib.util.spec_from_file_location("ccmas_original_repair", REPAIR_SCRIPT)
assert SPEC and SPEC.loader
repair = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(repair)

ROOT = repair.ROOT
CCMAS_DIR = repair.CCMAS_DIR
AUDIT_DIR = repair.AUDIT_DIR
MANIFEST_PATH = repair.SOURCE_MANIFEST
DEFAULT_OUT = AUDIT_DIR / "ccmas_remaining_blank_details_by_pdf_2026-09-30"


def is_blank(value: Any) -> bool:
    return repair.value_is_empty(value)


def build_inventory(pdf_dir: Path) -> dict[str, Any]:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    by_source: dict[str, dict[str, Any]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        source_file = path.name
        pages, source_status = repair.verified_source_pages(source_file, pdf_dir, manifest)
        blocks = repair.course_blocks(pages) if pages else []
        by_code: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for block in blocks:
            if block["page_end"] - block["page_start"] < 5:
                by_code[repair.key_code(block["code"])].append(block)
        bounds_by_programme = repair.programme_page_ranges(source_file, document)
        pdf_name = repair.SOURCE_FILES.get(source_file)
        entries: list[dict[str, Any]] = []
        counts: Counter[str] = Counter()
        for programme in document.get("programmes", []):
            programme_name = repair.clean(programme.get("name"))
            bounds = bounds_by_programme.get(programme_name)
            for course in programme.get("courses", []):
                code = repair.clean(course.get("code"))
                title = repair.clean(course.get("title"))
                for field, source_field in (("content_summary", "content_summary"), ("skills_learned", "learning_outcomes")):
                    if not is_blank(course.get(field)):
                        continue
                    counts[field] += 1
                    candidates = repair.matching_course_blocks(
                        title,
                        by_code.get(repair.key_code(code), []),
                    )
                    in_range = [
                        b for b in candidates
                        if bounds and b["page_end"] >= bounds[0] and b["page_start"] <= bounds[1]
                    ]
                    preferred = in_range or candidates
                    blocks_found = []
                    for block in preferred:
                        parsed = repair.parse_block(block)
                        extracted = parsed[source_field]
                        blocks_found.append({
                            "page_start": block["page_start"],
                            "page_end": block["page_end"],
                            "matched_title": block["title"],
                            "inside_programme_range": bool(in_range and block in in_range),
                            "has_learning_outcomes": bool(parsed["learning_outcomes"]),
                            "has_content_summary": bool(parsed["content_summary"]),
                            "candidate_value_present": bool(extracted),
                            "candidate_excerpt": extracted[:500] if isinstance(extracted, str) else extracted[:5],
                        })
                    entries.append({
                        "programme": programme_name,
                        "course_code": code,
                        "course_title": title,
                        "blank_field": field,
                        "programme_pdf_page_range": list(bounds) if bounds else None,
                        "candidate_status": (
                            "unique_in_programme_range" if len(in_range) == 1
                            else "multiple_in_programme_range" if len(in_range) > 1
                            else "candidate_outside_or_without_programme_range" if candidates
                            else "no_exact_code_title_block"
                        ),
                        "source_block_candidates": blocks_found,
                    })
        by_source[source_file] = {
            "source_pdf": pdf_name,
            "source_status": source_status.get("status"),
            "pdf_sha256": source_status.get("pdf_sha256"),
            "page_count": source_status.get("page_count"),
            "counts": dict(counts),
            "remaining": entries,
        }
    totals = Counter()
    for source in by_source.values():
        totals.update(source["counts"])
    return {
        "schema": "2026-09-30.ccmas-blank-details-by-original-pdf.v1",
        "status": "read_only_inventory",
        "source_manifest": str(MANIFEST_PATH),
        "counts": dict(totals),
        "source_files": by_source,
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# CCMAS remaining blank details, grouped by original PDF",
        "",
        "Read-only inventory. Candidate pages are ranked against the exact course code/title and the programme's bounded PDF section where available. A candidate is not promoted unless it is source- and context-checked.",
        "",
        "## Remaining totals",
        "",
        f"- Blank content summaries: **{report['counts'].get('content_summary', 0)}**",
        f"- Blank learning-outcome arrays: **{report['counts'].get('skills_learned', 0)}**",
        "",
    ]
    for source_file, source in report["source_files"].items():
        entries = source["remaining"]
        if not entries:
            continue
        summary_n = source["counts"].get("content_summary", 0)
        outcomes_n = source["counts"].get("skills_learned", 0)
        lines.extend([
            f"## {source['source_pdf']} (`{source_file}`)",
            "",
            f"Source check: `{source['source_status']}`; {source_n(source)} pages. Remaining: {summary_n} summaries, {outcomes_n} outcomes.",
            "",
            "| Programme | Course | Blank field | Programme pages | Candidate status | Source pages / extracted sections |",
            "|---|---|---|---:|---|---|",
        ])
        for item in entries:
            course = f"{item['course_code']} — {item['course_title']}"
            field = "summary" if item["blank_field"] == "content_summary" else "outcomes"
            pages = "–" if not item["programme_pdf_page_range"] else f"{item['programme_pdf_page_range'][0]}–{item['programme_pdf_page_range'][1]}"
            candidates = "; ".join(
                f"p. {b['page_start']}–{b['page_end']} (LO={'yes' if b['has_learning_outcomes'] else 'no'}, contents={'yes' if b['has_content_summary'] else 'no'})"
                for b in item["source_block_candidates"]
            ) or "no exact code/title block found"
            lines.append(f"| {item['programme']} | {course} | {field} | {pages} | {item['candidate_status']} | {candidates} |")
        lines.append("")
    lines.extend([
        "## Use of this inventory",
        "",
        "A missing parser candidate is not evidence that the CCMAS source lacks the field. Search the named original PDF by course code/title, include page continuations, and stop the course block at the next course-code heading. The `inside_programme_range` flag distinguishes repeated generic courses from the occurrence belonging to the displayed programme.",
        "",
    ])
    return "\n".join(lines)


def source_n(source: dict[str, Any]) -> int:
    return int(source.get("page_count") or 0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-dir", type=Path, default=repair.DEFAULT_PDF_DIR)
    parser.add_argument("--out-prefix", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()
    report = build_inventory(args.pdf_dir)
    json_path = args.out_prefix.with_name(args.out_prefix.name + ".json")
    md_path = args.out_prefix.with_name(args.out_prefix.name + ".md")
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "counts": report["counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
