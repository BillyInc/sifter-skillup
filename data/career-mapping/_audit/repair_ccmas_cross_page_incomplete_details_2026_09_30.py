"""Repair demonstrably truncated CCMAS course details from original PDFs.

Unlike a blank-only pass, this catches an existing outcome list that is an
exact prefix of the complete source list and a summary that is an exact text
prefix of the source's Course Contents. Course blocks may continue over a page
break, but always stop at the next course-code heading.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Any

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
AUDIT_DIR = ROOT / "_audit"
DEFAULT_PDF_DIR = Path.home() / "Downloads" / "ccmas original documents"
PDF_BY_FILE = {
    "computing.json": "Computing-CCMAS-2023-FINAL.pdf",
}
TARGETS = {
    ("computing.json", "ENT 312", "Venture Creation"),
    ("computing.json", "GST 111", "Communication in English"),
}
CODE_HEADER = re.compile(
    r"(?m)^\s*([A-Z]{2,10})\s*[:\-/]?\s*(\d{3,4})\s*[:\-–]"
)
LIST_ITEM = re.compile(r"(?m)^\s*(\d{1,2})\s*[.)]\s*(.+?)(?=^\s*\d{1,2}\s*[.)]\s*|\Z)", re.S)


def normalize(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def compact(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", normalize(value).casefold())


def normalized_text(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", normalize(value).casefold())


def code_key(value: str) -> str:
    return compact(value)


def strip_page_furniture(value: str) -> str:
    kept = []
    for line in value.splitlines():
        if re.match(r"^\s*(?:New\s*)?$", line, re.I):
            continue
        if re.match(r"^\s*(?:Computing|Law|Arts|Education|NUC)\s+\d+\s*$", line, re.I):
            continue
        if re.match(r"^\s*\d+\s*$", line):
            continue
        kept.append(line)
    return "\n".join(kept)


def extract_course(reader: PdfReader, code: str, title: str) -> dict[str, Any] | None:
    target = code_key(code)
    pages = [(page.extract_text(extraction_mode="layout") or "") for page in reader.pages]
    for page_index, page in enumerate(pages):
        for match in CODE_HEADER.finditer(page):
            if code_key(match.group(1) + match.group(2)) != target:
                continue
            header_tail = page[match.end() : match.end() + 220]
            title_match = re.search(r"([^\n(]{3,160})", header_tail)
            if not title_match:
                continue
            title_text = normalize(title_match.group(1))
            title_tokens = set(re.findall(r"[a-z0-9]+", title.casefold()))
            found_tokens = set(re.findall(r"[a-z0-9]+", title_text.casefold()))
            if not title_tokens or len(title_tokens & found_tokens) / len(title_tokens) < 0.65:
                continue

            pieces = [page[match.end() :]]
            pages_used = [page_index + 1]
            boundary_found = False
            for following_index in range(page_index, min(page_index + 3, len(pages))):
                segment = pieces[-1] if following_index == page_index else pages[following_index]
                next_header = CODE_HEADER.search(segment)
                if next_header:
                    pieces[-1] = segment[: next_header.start()]
                    boundary_found = True
                    break
                if following_index + 1 < min(page_index + 3, len(pages)):
                    if following_index + 1 != page_index:
                        pieces.append(pages[following_index + 1])
                        pages_used.append(following_index + 2)
            block = strip_page_furniture("\n".join(pieces))
            learning = re.search(r"\bLearning\s+Outcomes?\b", block, re.I)
            contents = re.search(r"\bCourse\s+Contents?\b", block, re.I)
            if not learning or not contents or contents.start() <= learning.end():
                continue
            outcomes_region = block[learning.end() : contents.start()]
            items = [normalize(item.group(2)).strip(" ;\n") for item in LIST_ITEM.finditer(outcomes_region)]
            items = [item for item in items if item]
            contents_region = normalize(block[contents.end() :])
            contents_region = re.sub(r"\s+", " ", contents_region).strip(" \n\t")
            if not items or len(contents_region) < 24:
                continue
            # Never promote text that appears to include a new course header or
            # a visibly corrupted OCR fragment.
            if re.search(r"\b[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\s*[:\-–]|ẹv\.?\s*tify|Ãƒ|�", contents_region, re.I):
                continue
            return {
                "title_in_pdf": title_text,
                "learning_outcomes": items,
                "content_summary": contents_region,
                "pdf_pages": pages_used,
                "next_course_boundary_found": boundary_found,
            }
    return None


def is_empty(value: Any) -> bool:
    return value is None or value == "" or (isinstance(value, str) and normalize(value).casefold() in {"-", "--", "---", "n/a", "none", "nil"})


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-dir", type=Path, default=DEFAULT_PDF_DIR)
    parser.add_argument("--out-prefix", type=Path, default=AUDIT_DIR / "ccmas_cross_page_incomplete_details_2026-09-30")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    docs: dict[str, dict[str, Any]] = {}
    readers = {name: PdfReader(str(args.pdf_dir / pdf_name)) for name, pdf_name in PDF_BY_FILE.items()}
    source_blocks = {
        (source_file, code, title): extract_course(readers[source_file], code, title)
        for source_file, code, title in TARGETS
    }
    changes: list[dict[str, Any]] = []
    dispositions: list[dict[str, Any]] = []

    for source_file, code, title in sorted(TARGETS):
        source = source_blocks[(source_file, code, title)]
        path = CCMAS_DIR / source_file
        document = docs.setdefault(source_file, json.loads(path.read_text(encoding="utf-8")))
        if not source:
            dispositions.append({"source_file": source_file, "code": code, "title": title, "status": "source_block_not_uniquely_extracted"})
            continue
        matched = 0
        for programme in document.get("programmes", []):
            for course in programme.get("courses", []):
                if code_key(course.get("code", "")) != code_key(code) or normalize(course.get("title")) != title:
                    continue
                matched += 1
                fields: list[dict[str, Any]] = []
                current_outcomes = course.get("skills_learned")
                target_outcomes = source["learning_outcomes"]
                if is_empty(current_outcomes):
                    fields.append({"field": "skills_learned", "before": current_outcomes, "after": target_outcomes, "reason": "blank_field_filled_from_exact_source_course_block"})
                elif isinstance(current_outcomes, list) and len(current_outcomes) < len(target_outcomes):
                    prefix = [normalized_text(item) for item in current_outcomes]
                    expected = [normalized_text(item) for item in target_outcomes[: len(current_outcomes)]]
                    if prefix == expected:
                        fields.append({"field": "skills_learned", "before": current_outcomes, "after": target_outcomes, "reason": "existing_outcomes_are_an_exact_source_list_prefix"})

                current_summary = course.get("content_summary")
                target_summary = source["content_summary"]
                if is_empty(current_summary):
                    fields.append({"field": "content_summary", "before": current_summary, "after": target_summary, "reason": "blank_field_filled_from_exact_source_course_block"})
                elif isinstance(current_summary, str):
                    current_compact = normalized_text(current_summary)
                    source_compact = normalized_text(target_summary)
                    if current_compact and len(current_compact) < len(source_compact) and source_compact.startswith(current_compact):
                        fields.append({"field": "content_summary", "before": current_summary, "after": target_summary, "reason": "existing_summary_is_an_exact_source_text_prefix"})
                if fields:
                    change = {
                        "source_file": source_file,
                        "programme": programme.get("name"),
                        "code": course.get("code"),
                        "title": course.get("title"),
                        "source_pdf": PDF_BY_FILE[source_file],
                        "source_pages": source["pdf_pages"],
                        "fields": fields,
                    }
                    changes.append(change)
                    for field in fields:
                        course[field["field"]] = field["after"]
        dispositions.append({"source_file": source_file, "code": code, "title": title, "matching_package_rows": matched, "source_pdf": PDF_BY_FILE[source_file], "source_pages": source["pdf_pages"], "source_outcome_count": len(source["learning_outcomes"]), "source_summary_chars": len(source["content_summary"])})

    if args.apply:
        for source_file, document in docs.items():
            (CCMAS_DIR / source_file).write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output = {
        "schema": "2026-09-30.ccmas-cross-page-incomplete-details.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "scope": "Only exact source-backed repairs for Computing CCMAS GST 111 and ENT 312, including cross-page Course Contents and outcome-prefix truncation.",
        "source_dispositions": dispositions,
        "changes": changes,
        "counts": {"source_course_blocks": len(source_blocks), "repair_rows": len(changes), "field_repairs": sum(len(c["fields"]) for c in changes)},
    }
    suffix = "_applied" if args.apply else "_dry_run"
    json_path = args.out_prefix.with_name(args.out_prefix.name + suffix + ".json")
    md_path = args.out_prefix.with_name(args.out_prefix.name + suffix + ".md")
    json_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md = ["# CCMAS cross-page and truncated-detail reconciliation", "", f"Status: `{output['status']}`", "", "## Source blocks", ""]
    md.extend(f"- {d['source_file']} · {d['code']} · {d.get('matching_package_rows', 0)} package rows · {d.get('source_pdf', 'source unavailable')} pp. {', '.join(map(str, d.get('source_pages', [])))} · {d.get('source_outcome_count', 0)} outcomes" for d in dispositions)
    md += ["", "## Repairs", ""]
    md.extend(f"- {c['programme']} · {c['code']} · {', '.join(f['field'] + ': ' + f['reason'] for f in c['fields'])}" for c in changes)
    md_path.write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "status": output["status"], "counts": output["counts"], "sources": dispositions}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
