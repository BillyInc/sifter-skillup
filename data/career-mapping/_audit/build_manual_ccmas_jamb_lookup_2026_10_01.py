"""Build a deduplicated manual source-lookup sheet from current audit ledgers."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INVENTORY = AUDIT / "ccmas_remaining_blank_details_by_pdf_2026-09-30.json"
JAMB_CHECKPOINT = AUDIT / "jamb_offering_pdf_cell_verification_2026-09-30_checkpoint.json"
OUTPUT = ROOT.parents[1] / "docs" / "manual-review" / "CCMAS_BLANK_DETAILS_AND_JAMB_LOOKUP_2026-10-01.md"


def norm(value: Any) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", str(value or "").casefold()))


def esc(value: Any) -> str:
    return str(value or "").replace("|", "\\|").replace("\n", " ").strip()


def main() -> None:
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    jamb = json.loads(JAMB_CHECKPOINT.read_text(encoding="utf-8"))

    grouped: dict[tuple[str, str], dict[str, Any]] = {}
    occurrence_counts = defaultdict(int)
    for source_file, source in inventory["source_files"].items():
        pdf = source.get("source_pdf", source_file)
        for row in source.get("remaining", []):
            code, title = row.get("course_code", ""), row.get("course_title", "")
            key = (norm(code), norm(title))
            item = grouped.setdefault(key, {
                "code": code,
                "title": title,
                "codes": set(),
                "titles": set(),
                "programmes": set(),
                "pdfs": set(),
                "fields": set(),
                "pages": set(),
                "statuses": set(),
            })
            item["codes"].add(code)
            item["titles"].add(title)
            item["programmes"].add(row.get("programme", ""))
            item["pdfs"].add(pdf)
            item["fields"].add(row.get("blank_field", ""))
            occurrence_counts[row.get("blank_field", "")] += 1
            item["statuses"].add(row.get("candidate_status", ""))
            bounds = row.get("programme_pdf_page_range")
            if bounds:
                item["pages"].add(f"programme section pp. {bounds[0]}–{bounds[1]}")
            for candidate in row.get("source_block_candidates", []):
                start, end = candidate.get("page_start"), candidate.get("page_end")
                if start and end:
                    item["pages"].add(f"candidate pp. {start}–{end}")

    by_code = sorted(grouped.values(), key=lambda x: (norm(x["code"]), norm(x["title"])))
    missing_summary = sum("content_summary" in x["fields"] for x in by_code)
    missing_outcomes = sum("skills_learned" in x["fields"] for x in by_code)

    lines = [
        "# Manual CCMAS source lookup and JAMB offering verification",
        "",
        "Generated from the current local audit ledgers on 2026-10-01. Search the named original PDF(s), then paste the exact source text and printed/PDF page locator into the relevant fields below. Do not paraphrase or infer missing source text.",
        "",
        "## Current CCMAS residuals",
        "",
        f"- Blank-summary occurrences: **{occurrence_counts['content_summary']}**; deduplicated by normalized course code + title: **{missing_summary} course identities**.",
        f"- Blank-outcome occurrences: **{occurrence_counts['skills_learned']}**; deduplicated by normalized course code + title: **{missing_outcomes} course identities**.",
        f"- Combined deduplicated course identities needing at least one field: **{len(by_code)}**.",
        "- Repeated course identities across programmes/PDFs are consolidated below; all programme and PDF contexts are retained.",
        "",
        "For each course, fill only the fields listed as missing. Include the exact PDF filename and printed page number (and PDF viewer page if different). If the source truly has no such section, write `not present in source` and identify the pages checked.",
        "",
        "## Deduplicated CCMAS course lookup list",
        "",
    ]

    for index, item in enumerate(by_code, 1):
        fields = []
        if "content_summary" in item["fields"]:
            fields.append("course contents / summary")
        if "skills_learned" in item["fields"]:
            fields.append("learning outcomes")
        codes = " / ".join(sorted(item["codes"], key=norm))
        titles = " / ".join(sorted(item["titles"], key=norm))
        lines.extend([
            f"### {index}. {esc(codes)} — {esc(titles)}",
            "",
            f"- Missing: {', '.join(fields)}",
            f"- Programme(s): {', '.join(sorted((p for p in item['programmes'] if p), key=norm))}",
            f"- Original CCMAS PDF(s): {', '.join(sorted(item['pdfs'], key=norm))}",
            f"- Locator hints: {', '.join(sorted(item['pages'])) or 'no reliable candidate page yet; search by course code/title'}",
            f"- Current source-match states: {', '.join(sorted(s for s in item['statuses'] if s))}",
        ])
        if "content_summary" in item["fields"]:
            lines.extend(["- Exact `Course Contents` text (paste here):", "  > ", "- Printed/PDF page(s):", ""])
        if "skills_learned" in item["fields"]:
            lines.extend(["- Exact `Learning Outcomes` text (paste here):", "  > ", "- Printed/PDF page(s):", ""])

    lines.extend([
        "## JAMB offering/source residuals",
        "",
        f"The checkpoint contains **{jamb.get('target_count', len(jamb.get('rows', [])))} offering occurrences**. It is a dry run: candidate source cells are not yet written into the JAMB ledgers. Keep all occurrences distinct; a JAMB name can occur in multiple source PDFs/institution contexts.",
        "",
        "For each entry, search the specified original JAMB brochure PDF. Paste the exact programme heading and full institution/awarder cell, with PDF page(s). Do not infer a roster from a similarly named programme or another university.",
        "",
        "| # | JAMB programme name | Source brochure PDF | Checkpoint status | Candidate page(s) / heading |",
        "|---:|---|---|---|---|",
    ])
    for index, row in enumerate(jamb.get("rows", []), 1):
        candidate_hints = []
        for candidate in row.get("candidate_cells", []):
            pages = candidate.get("pages", [])
            heading = candidate.get("programme_heading", "")
            if pages or heading:
                candidate_hints.append(
                    (f"pp. {', '.join(map(str, pages))}" if pages else "")
                    + (f" — {heading}" if heading else "")
                )
        hint = "; ".join(candidate_hints) if candidate_hints else "none located; search PDF by programme name"
        lines.append(
            f"| {index} | {esc(row.get('jamb_name'))} | {esc(Path(row.get('original_pdf', '')).name or row.get('source_file'))} | {esc(row.get('status'))} | {esc(hint)} |"
        )
    lines.extend([
        "",
        "### JAMB manual transcription area",
        "",
        "Paste each verified programme-cell transcription below, identifying the table heading, PDF page(s), and institution names/codes exactly as printed. If a programme heading cannot be found, record the search terms and pages/section reviewed.",
        "",
    ])
    for row in jamb.get("rows", []):
        lines.extend([
            f"#### {esc(row.get('jamb_name'))} — {esc(Path(row.get('original_pdf', '')).name)}",
            f"- Occurrence ID: `{row.get('occurrence_id', '')}`; current status: `{row.get('status', '')}`",
            "- PDF page(s) checked:",
            "- Exact programme heading / awarder-cell text:",
            "- Institution roster as printed:",
            "",
        ])

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "output": str(OUTPUT),
        "ccmas_unique_course_identities": len(by_code),
        "unique_identities_missing_summary": missing_summary,
        "unique_identities_missing_outcomes": missing_outcomes,
        "summary_occurrences": occurrence_counts["content_summary"],
        "outcome_occurrences": occurrence_counts["skills_learned"],
        "jamb_occurrences": len(jamb.get("rows", [])),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
