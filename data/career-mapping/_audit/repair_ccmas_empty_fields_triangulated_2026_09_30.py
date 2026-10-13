"""Repair empty CCMAS course fields from the original PDFs.

This is a deterministic, source-only pass.  It searches the extracted text
from the original CCMAS PDFs using course-code hits, title-keyword hits and
page-bounded detail blocks.  A field is promoted only when the source evidence
for that field collapses to one compatible block.  It never invents text and
never overwrites a non-empty course field.
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

from pypdf import PdfReader

from extract_ccmas_course_detail_candidates_2026_09_29 import extract_page_candidate
from extract_ccmas_original_download_pdfs_2026_09_29 import SOURCE_FILES


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS_DIR = ROOT / "ccmas"
DEFAULT_TEXT_DIR = AUDIT / "ccmas_original_source_text_2026-09-29"
DEFAULT_PDF_DIR = Path.home() / "Downloads" / "ccmas original documents"
DEFAULT_OUT_PREFIX = AUDIT / "ccmas_empty_fields_triangulated_2026-09-30"

PLACEHOLDERS = {
    "", "-", "--", "---", "n/a", "na", "none", "not available",
    "not applicable", "nil", "tbc", "to be confirmed", "—", "â€”",
}
SECTION_MARKER = re.compile(
    r"\b(?:course\s+contents?|coursse\s+contents?|training\s+contents?)\b",
    re.I,
)
NEXT_SECTION = re.compile(
    r"\b(?:learning\s+outcomes?|course\s+contents?|coursse\s+contents?|training\s+contents?)\b",
    re.I,
)
CODE_TOKEN = re.compile(r"(?<![A-Z0-9])([A-Z]{2,10})\s*[:\-/]?\s*(\d{3,4})(?![A-Z0-9])", re.I)
CODE_PART = re.compile(r"[A-Za-z]{2,10}\s*\d{3,4}")

TITLE_ALIASES = {
    "agric": "agricultural",
    "agriculture": "agricultural",
    "mgmt": "management",
    "admin": "administration",
    "intro": "introduction",
    "tech": "technology",
    "org": "organization",
    "organis": "organization",
    "programme": "program",
    "programmes": "program",
}
STOPWORDS = {
    "a", "an", "and", "as", "at", "for", "in", "of", "on", "or", "the",
    "to", "with", "course", "studies", "study", "part", "i", "ii", "iii",
}


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\u00a0", " ")).strip()


def folded(value: Any) -> str:
    return clean(value).casefold()


def meaningful(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, list):
        return any(meaningful(item) for item in value)
    return folded(value) not in PLACEHOLDERS


def tokens(value: Any) -> set[str]:
    result: set[str] = set()
    for token in re.findall(r"[a-z0-9]+", folded(value)):
        token = TITLE_ALIASES.get(token, token)
        if len(token) > 2 and token not in STOPWORDS:
            result.add(token)
    return result


def compact_code(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", folded(value))


def code_parts(value: Any) -> list[str]:
    parts = [clean(match.group(0)) for match in CODE_PART.finditer(clean(value))]
    return parts or [clean(value)]


def title_score(expected: Any, candidate: Any) -> float:
    expected_tokens = tokens(expected)
    candidate_tokens = tokens(candidate)
    if not expected_tokens or not candidate_tokens:
        return 0.0
    return len(expected_tokens & candidate_tokens) / len(expected_tokens)


def parse_outcomes(value: Any) -> list[str]:
    text = clean(value)
    if not text:
        return []
    marker = SECTION_MARKER.search(text)
    if marker:
        text = text[: marker.start()].rstrip(" ;,.:")
    # The PDFs use 1., 1), 1: and occasionally a bare numbered list.
    matches = list(re.finditer(r"(?:^|\s)(\d{1,2})\s*[\.:\)]\s*", text))
    if not matches:
        # A few CCMAS blocks use ``1 State ... 2 Mention ...`` without list
        # punctuation. Require at least two markers so ordinary prose such as
        # ``2 Units`` is not mistaken for an outcome list.
        bare_matches = list(re.finditer(r"(?:^|\s)(\d{1,2})(?=\s+[A-Za-z])\s+", text))
        if len(bare_matches) >= 2:
            matches = bare_matches
    if not matches:
        return []
    result: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        item = clean(text[match.end() : end]).strip(" ;,\n")
        if item:
            result.append(item)
    return result


def split_candidate(candidate: dict[str, Any]) -> tuple[str, list[str]]:
    """Return source content and explicit learning outcomes from one block."""
    raw_outcomes = clean(candidate.get("outcomes_text"))
    raw_content = clean(candidate.get("content_text"))
    marker = SECTION_MARKER.search(raw_outcomes)
    if marker:
        raw_content = raw_outcomes[marker.end() :] + (" " + raw_content if raw_content else "")
        raw_outcomes = raw_outcomes[: marker.start()]
    if not raw_outcomes:
        block = clean(candidate.get("block_excerpt"))
        learning = re.search(r"\blearning\s+outcomes?\b", block, re.I)
        marker = SECTION_MARKER.search(block, learning.end() if learning else 0)
        if learning:
            outcomes_start = learning.end()
            outcomes_end = marker.start() if marker else len(block)
            raw_outcomes = block[outcomes_start:outcomes_end]
            if marker and not raw_content:
                raw_content = block[marker.end() :]
    if not raw_content:
        raw_block = clean(candidate.get("block_excerpt"))
        marker = SECTION_MARKER.search(raw_block)
        if marker:
            raw_content = raw_block[marker.end() :]
    raw_content = NEXT_SECTION.split(raw_content, maxsplit=1)[0].strip(" ;,.") if raw_content else ""
    # Page extraction often carries the next table heading into the detail
    # block. It is not course content and must not be promoted to students.
    raw_content = re.split(r"\b(?:\d{3,4}\s+LEVEL|TOTAL\s+\d+)\b", raw_content, maxsplit=1, flags=re.I)[0]
    raw_content = re.split(r"\b[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\s*(?:[-:]|[A-Z])", raw_content, maxsplit=1)[0]
    raw_content = raw_content.strip(" ;,.")
    outcomes = parse_outcomes(raw_outcomes)
    # A source block can contain an explicit outcome sentence without a
    # numbered list. Preserve it as one exact source item when it is real
    # prose, but reject headings such as "At the end ...:".
    if not outcomes and raw_outcomes and len(raw_outcomes) >= 50 and not raw_outcomes.endswith(":"):
        outcomes = [raw_outcomes]
    if any(re.search(r"\b(?:course\s+contents?|coursse\s+contents?|training\s+contents?)\b|\b\d{3,4}\s+level\b|(?:^|\s)[^\x00-\x7f]{1,3}\.\s*tify\b|Ã", item, re.I) for item in outcomes):
        outcomes = []
    return clean(raw_content), outcomes


def layout_segments(page: str, course: dict[str, Any], codes: list[str]) -> tuple[str, str] | None:
    """Extract only the matching course block, bounded by the next course header."""
    for code in codes:
        pattern = re.compile(r"(?<![A-Z0-9])" + r"\s*[:\-/]?\s*".join(re.escape(part) for part in clean(code).split()) + r"(?![A-Z0-9])", re.I)
        for match in pattern.finditer(page):
            next_header = re.search(r"(?m)^\s*[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\s*[:\-]", page[match.end() :])
            block_end = match.end() + next_header.start() if next_header else len(page)
            block = page[match.end() : block_end]
            window = block[:450]
            title = re.search(r"[^\n(]{3,180}", window)
            if not title or title_score(course.get("title"), title.group(0)) < 0.60:
                continue
            learning = re.search(r"\blearning\s+outcomes?\b", block, re.I)
            contents = SECTION_MARKER.search(block)
            if not learning and not contents:
                description = clean(block[title.end() :])
                if len(description) >= 24 and not CODE_TOKEN.search(description):
                    return "", description
                continue
            if learning and contents and contents.start() < learning.start():
                content_text = block[contents.end() : learning.start()].strip()
            else:
                content_text = block[contents.end() :].strip() if contents else ""
            body_start = learning.end() if learning else 0
            body_end = contents.start() if contents and contents.start() > body_start else len(block)
            body = block[body_start:body_end]
            numbered = list(re.finditer(r"(?m)^\s*\d{1,2}\s*[.)]\s*", body))
            if numbered:
                outcomes = body.strip()
                if re.search(r"ẹv\.?\s*tify|Ãƒ|�", outcomes, re.I):
                    outcomes = ""
                return outcomes, content_text
            outcomes = body.strip() if learning and len(clean(body)) >= 50 and not clean(body).endswith(":") else ""
            if re.search(r"ẹv\.?\s*tify|Ãƒ|�", outcomes, re.I):
                outcomes = ""
            return outcomes, content_text
    return None


def workload_compatible(course: dict[str, Any], candidate: dict[str, Any]) -> bool:
    workload = candidate.get("workload") or {}
    pairs = (("units", "units"), ("status", "status"), ("lh", "lecture_hours"), ("ph", "practical_hours"))
    for course_field, candidate_field in pairs:
        before = course.get(course_field)
        after = workload.get(candidate_field)
        if before is None or before == "" or after is None or after == "":
            continue
        if folded(before).replace("–", "-") != folded(after).replace("–", "-"):
            return False
    return True


def field_signature(value: Any) -> str:
    return folded(value)


def near_equivalent(left: str, right: str) -> bool:
    left_tokens, right_tokens = tokens(left), tokens(right)
    if not left_tokens or not right_tokens:
        return False
    overlap = len(left_tokens & right_tokens) / max(1, min(len(left_tokens), len(right_tokens)))
    return overlap >= 0.88


def collapse_values(values: list[tuple[str, dict[str, Any]]]) -> list[tuple[str, dict[str, Any]]]:
    groups: list[list[tuple[str, dict[str, Any]]]] = []
    for value, candidate in values:
        for group in groups:
            if field_signature(value) == field_signature(group[0][0]) or near_equivalent(value, group[0][0]):
                group.append((value, candidate))
                break
        else:
            groups.append([(value, candidate)])
    return [max(group, key=lambda item: len(clean(item[0]))) for group in groups]


def page_index(text_dir: Path) -> tuple[dict[str, list[str]], dict[str, dict[str, list[int]]]]:
    pages_by_file: dict[str, list[str]] = {}
    codes_by_file: dict[str, dict[str, list[int]]] = {}
    for path in sorted(text_dir.glob("*.txt")):
        pages = path.read_text(encoding="utf-8", errors="replace").split("\f")
        pages_by_file[path.stem] = pages
        index: dict[str, set[int]] = defaultdict(set)
        for page_index_value, page in enumerate(pages):
            for match in CODE_TOKEN.finditer(page):
                index[compact_code(match.group(1) + match.group(2))].add(page_index_value)
        codes_by_file[path.stem] = {key: sorted(values) for key, values in index.items()}
    return pages_by_file, codes_by_file


def candidate_key(candidate: dict[str, Any]) -> tuple[str, int, str]:
    return (
        clean(candidate.get("course_code")),
        int(candidate.get("extracted_page_ordinal") or 0),
        folded(candidate.get("title_candidate")),
    )


def scan_candidates(
    source_file: str,
    course: dict[str, Any],
    pages_by_file: dict[str, list[str]],
    codes_by_file: dict[str, dict[str, list[int]]],
    prior: list[dict[str, Any]],
    pdf_pages: dict[tuple[str, int], str],
) -> list[dict[str, Any]]:
    stem = Path(source_file).stem
    pages = pages_by_file.get(stem, [])
    code_index = codes_by_file.get(stem, {})
    candidates = [copy.deepcopy(item) for item in prior]
    title = clean(course.get("title"))
    for code in code_parts(course.get("code")):
        page_numbers = code_index.get(compact_code(code), [])
        # A malformed/slashed code can still be located by title keywords.
        if not page_numbers:
            page_numbers = [index for index, page in enumerate(pages) if title_score(title, page) >= 0.55]
        for page_number in page_numbers:
            page = pages[page_number]
            for item in extract_page_candidate(page, code, title):
                item["extracted_page_ordinal"] = page_number + 1
                item["triangulated_code"] = code
                candidates.append(item)
    for candidate in candidates:
        page_no = int(candidate.get("extracted_page_ordinal") or 0)
        layout_page = pdf_pages.get((source_file, page_no))
        if layout_page:
            segments = layout_segments(layout_page, course, code_parts(course.get("code")))
            if segments:
                candidate["outcomes_text"], candidate["content_text"] = segments
                candidate["layout_course_block_verified"] = True
            else:
                candidate["outcomes_text"] = ""
                candidate["content_text"] = ""
                candidate["block_excerpt"] = ""
                candidate["layout_course_block_verified"] = False
    unique: dict[tuple[str, int, str], dict[str, Any]] = {}
    for candidate in candidates:
        unique[candidate_key(candidate)] = candidate
    return list(unique.values())


def eligible_field_candidates(course: dict[str, Any], candidates: list[dict[str, Any]], field: str) -> list[tuple[str, dict[str, Any]]]:
    result: list[tuple[str, dict[str, Any]]] = []
    expected_title = course.get("title")
    allowed_codes = {compact_code(part) for part in code_parts(course.get("code"))}
    for candidate in candidates:
        candidate_codes = {compact_code(candidate.get("course_code")), compact_code(candidate.get("triangulated_code"))}
        if not allowed_codes.intersection(candidate_codes):
            continue
        score = title_score(expected_title, candidate.get("title_candidate"))
        if score < 0.60:
            continue
        if not workload_compatible(course, candidate):
            continue
        content, outcomes = split_candidate(candidate)
        value = content if field == "content_summary" else outcomes
        if field == "content_summary":
            if len(content) < 24 or content[-1:] not in ".!?;:)" or re.search(r"\b(?:course\s+contents?|coursse\s+contents?|training\s+contents?)\b|\b\d{3,4}\s+level\b|\b[A-Z]{2,10}\s*[:\-/]?\s*\d{3,4}\b", content, re.I):
                continue
        elif not outcomes:
            continue
        result.append((json.dumps(value, ensure_ascii=False) if isinstance(value, list) else value, candidate))
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--text-dir", type=Path, default=DEFAULT_TEXT_DIR)
    parser.add_argument("--pdf-dir", type=Path, default=DEFAULT_PDF_DIR)
    parser.add_argument("--out-prefix", type=Path, default=DEFAULT_OUT_PREFIX)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--rollback-previous", action="store_true", help="Restore only fields written by this script's prior applied ledger, if they still equal its recorded after-values.")
    args = parser.parse_args()

    if args.rollback_previous:
        applied_path = args.out_prefix.with_name(args.out_prefix.name + "_applied.json")
        applied = json.loads(applied_path.read_text(encoding="utf-8"))
        documents: dict[str, dict[str, Any]] = {}
        restored = Counter()
        conflicts: list[dict[str, Any]] = []
        for change in applied.get("changes", []):
            path = CCMAS_DIR / change["source_file"]
            document = documents.setdefault(change["source_file"], json.loads(path.read_text(encoding="utf-8")))
            programmes = [p for p in document.get("programmes", []) if clean(p.get("name")) == clean(change.get("programme"))]
            courses = [c for p in programmes for c in p.get("courses", []) if clean(c.get("code")) == clean(change.get("code"))]
            if len(programmes) != 1 or not courses:
                conflicts.append({"source_file": change["source_file"], "programme": change.get("programme"), "code": change.get("code"), "reason": "course_identity_not_found"})
                continue
            field_changes = change.get("fields", [])
            exact_courses = [course for course in courses if all(course.get(item["field"]) == item.get("after") for item in field_changes)]
            if len(exact_courses) != 1:
                conflicts.append({"source_file": change["source_file"], "programme": change.get("programme"), "code": change.get("code"), "reason": "changed_course_not_unique_by_written_values"})
                continue
            course = exact_courses[0]
            for field_change in field_changes:
                field = field_change["field"]
                if course.get(field) != field_change.get("after"):
                    conflicts.append({"source_file": change["source_file"], "programme": change.get("programme"), "code": change.get("code"), "field": field, "reason": "current_value_differs_from_our_written_value"})
                    continue
                before = field_change.get("before")
                if before is None:
                    course.pop(field, None)
                else:
                    course[field] = copy.deepcopy(before)
                restored[field] += 1
        for source_file, document in documents.items():
            (CCMAS_DIR / source_file).write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"restored_fields": dict(restored), "conflicts": conflicts, "source_files": len(documents)}, indent=2))
        return

    pages_by_file, codes_by_file = page_index(args.text_dir)
    pdf_readers: dict[str, PdfReader] = {}
    pdf_pages: dict[tuple[str, int], str] = {}
    documents: dict[str, dict[str, Any]] = {}
    rows: list[dict[str, Any]] = []
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        documents[path.name] = document
        for programme in document.get("programmes") or []:
            for course in programme.get("courses") or []:
                rows.append({"path": path, "source_file": path.name, "programme": clean(programme.get("name")), "course": course})

    course_key_counts = Counter((row["source_file"], row["programme"], clean(row["course"].get("code"))) for row in rows)

    prior_path = AUDIT / "ccmas_full_detail_reconciliation_original_2026-09-29-pass6_dry_run.json"
    prior = json.loads(prior_path.read_text(encoding="utf-8")) if prior_path.exists() else {"proposals": []}
    prior_by_key = {
        (str(item.get("source_key")), clean(item.get("course_code"))): list(item.get("ranked_candidates") or [])
        for item in prior.get("proposals") or []
    }

    # Preload original-PDF layout for every locally indexed code/title page of
    # an incomplete field, not only pages already present in an older queue.
    # This makes the current reconciliation exhaustive over the source text
    # index and lets the strict course-boundary parser validate each candidate.
    for row in rows:
        course = row["course"]
        if meaningful(course.get("content_summary")) and meaningful(course.get("skills_learned")):
            continue
        stem = Path(row["source_file"]).stem
        pages = pages_by_file.get(stem, [])
        code_index = codes_by_file.get(stem, {})
        candidate_page_numbers: set[int] = set()
        for code in code_parts(course.get("code")):
            candidate_page_numbers.update(code_index.get(compact_code(code), []))
        if not candidate_page_numbers:
            candidate_page_numbers.update(
                page_number
                for page_number, page in enumerate(pages)
                if title_score(course.get("title"), page) >= 0.55
            )
        pdf_name = SOURCE_FILES.get(row["source_file"])
        pdf_path = args.pdf_dir / pdf_name if pdf_name else None
        if not pdf_path or not pdf_path.exists():
            continue
        if row["source_file"] not in pdf_readers:
            pdf_readers[row["source_file"]] = PdfReader(str(pdf_path))
        reader = pdf_readers[row["source_file"]]
        for page_number in candidate_page_numbers:
            page_no = page_number + 1
            page_key = (row["source_file"], page_no)
            if page_key not in pdf_pages and page_no <= len(reader.pages):
                pdf_pages[page_key] = reader.pages[page_number].extract_text(extraction_mode="layout") or ""

    counters = Counter(rows_seen=len(rows), summary_empty_before=0, outcomes_empty_before=0)
    dispositions: Counter[str] = Counter()
    changes: list[dict[str, Any]] = []
    pending: set[Path] = set()
    rows_report: list[dict[str, Any]] = []

    for row in rows:
        course = row["course"]
        summary_empty = not meaningful(course.get("content_summary"))
        outcomes_empty = not meaningful(course.get("skills_learned"))
        if not summary_empty and not outcomes_empty:
            continue
        if summary_empty:
            counters["summary_empty_before"] += 1
        if outcomes_empty:
            counters["outcomes_empty_before"] += 1
        key = (f"{row['source_file']}::{row['programme']}", clean(course.get("code")))
        for proposal_candidate in prior_by_key.get(key, []):
            page_no = int(proposal_candidate.get("candidate", {}).get("extracted_page_ordinal") or 0)
            page_key = (row["source_file"], page_no)
            if page_no and page_key not in pdf_pages:
                pdf_name = SOURCE_FILES.get(row["source_file"])
                pdf_path = args.pdf_dir / pdf_name if pdf_name else None
                if pdf_path and pdf_path.exists():
                    if row["source_file"] not in pdf_readers:
                        pdf_readers[row["source_file"]] = PdfReader(str(pdf_path))
                    reader = pdf_readers[row["source_file"]]
                    if page_no <= len(reader.pages):
                        pdf_pages[page_key] = reader.pages[page_no - 1].extract_text(extraction_mode="layout") or ""
        candidates = scan_candidates(row["source_file"], course, pages_by_file, codes_by_file, prior_by_key.get(key, []), pdf_pages)
        row_report = {
            "source_file": row["source_file"],
            "programme": row["programme"],
            "code": course.get("code"),
            "title": course.get("title"),
            "candidate_count": len(candidates),
            "fields": {},
        }
        if course_key_counts[(row["source_file"], row["programme"], clean(course.get("code")))] != 1:
            for field, empty in (("content_summary", summary_empty), ("learning_outcomes", outcomes_empty)):
                if empty:
                    row_report["fields"][field] = {"disposition": "duplicate_course_identity_requires_package_row_review"}
                    counters[f"{field}_duplicate_course_identity"] += 1
            rows_report.append(row_report)
            continue
        field_values: dict[str, tuple[str, dict[str, Any]]] = {}
        for field, empty in (("content_summary", summary_empty), ("learning_outcomes", outcomes_empty)):
            if not empty:
                continue
            values = collapse_values(eligible_field_candidates(course, candidates, field))
            if len(values) == 1:
                value, candidate = values[0]
                parsed_value: Any = json.loads(value) if field == "learning_outcomes" else value
                field_values[field] = (value, candidate)
                row_report["fields"][field] = {
                    "disposition": "source_backed_unique_triangulated_candidate",
                    "page": candidate.get("extracted_page_ordinal"),
                    "value": parsed_value,
                }
                counters[f"{field}_repair_candidates"] += 1
            elif len(values) == 0:
                row_report["fields"][field] = {"disposition": "no_safe_triangulated_candidate"}
                counters[f"{field}_no_safe_candidate"] += 1
            else:
                row_report["fields"][field] = {"disposition": "multiple_distinct_triangulated_candidates", "candidate_values": len(values)}
                counters[f"{field}_multiple_candidates"] += 1

        if field_values:
            field_changes: list[dict[str, Any]] = []
            pages = []
            for field, (serialized, candidate) in field_values.items():
                after = json.loads(serialized) if field == "learning_outcomes" else serialized
                package_field = "skills_learned" if field == "learning_outcomes" else field
                before = copy.deepcopy(course.get(package_field))
                field_changes.append({"field": package_field, "before": before, "after": after})
                pages.append(candidate.get("extracted_page_ordinal"))
                if args.apply:
                    course[package_field] = after
            if not course.get("source_state"):
                field_changes.append({"field": "source_state", "before": None, "after": "source_reconciled_triangulated"})
                if args.apply:
                    course["source_state"] = "source_reconciled_triangulated"
            if not course.get("source_locator"):
                locator = f"Original CCMAS PDF; package {row['programme']}; course {clean(course.get('code'))}; extracted page(s) {', '.join(str(page) for page in pages if page)}"
                field_changes.append({"field": "source_locator", "before": None, "after": locator})
                if args.apply:
                    course["source_locator"] = locator
            changes.append({
                "source_file": row["source_file"],
                "programme": row["programme"],
                "code": course.get("code"),
                "title": course.get("title"),
                "source_pages": sorted({page for page in pages if page}),
                "fields": field_changes,
                "guard": "original PDF code hit + title-keyword hit + compatible workload + one field-specific source signature",
            })
            pending.add(row["path"])
        rows_report.append(row_report)

    if args.apply:
        for path in sorted(pending):
            path.write_text(json.dumps(documents[path.name], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    status = "applied" if args.apply else "dry_run"
    output = {
        "schema": "2026-09-30.ccmas-empty-fields-triangulated.v1",
        "generated_on": date.today().isoformat(),
        "status": status,
        "source_text_dir": str(args.text_dir),
        "counts": {**dict(counters), "source_rows_changed": len(changes), "source_field_changes": sum(len(item["fields"]) for item in changes)},
        "changes": changes,
        "rows": rows_report,
        "limits": [
            "Only blank/placeholder content_summary and skills_learned fields are eligible.",
            "Distinct source blocks are never guessed or merged; they remain in the report for review.",
            "This pass does not change JAMB component selection or downstream domain mappings.",
        ],
    }
    suffix = "_applied" if args.apply else "_dry_run"
    out_json = args.out_prefix.with_name(args.out_prefix.name + suffix + ".json")
    out_md = args.out_prefix.with_name(args.out_prefix.name + suffix + ".md")
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [f"# CCMAS empty-field triangulated repair — 2026-09-30", "", f"Status: `{status}`", "", "## Counts", ""]
    lines.extend(f"- **{name.replace('_', ' ')}:** {value}" for name, value in sorted(output["counts"].items()))
    lines += ["", "Repairs require original-PDF code, title, page and workload agreement plus a single field-specific source signature.", ""]
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": status, "counts": output["counts"]}, indent=2))


if __name__ == "__main__":
    main()
