"""Reconcile blank/incomplete CCMAS course details against the original PDFs.

The script indexes each original subject PDF once, forms course blocks from an
exact course-code header through the next course header (including page-break
continuations), then matches by both code and title. It fills only empty fields
or exact source prefixes; conflicting or weak matches are recorded, not guessed.
"""

from __future__ import annotations

import argparse
from difflib import SequenceMatcher
import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from extract_ccmas_original_download_pdfs_2026_09_29 import SOURCE_FILES


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
AUDIT_DIR = ROOT / "_audit"
DEFAULT_PDF_DIR = Path.home() / "Downloads" / "ccmas original documents"
SOURCE_MANIFEST = AUDIT_DIR / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
# CCMAS headings vary: ``ENT 312:``, ``ENT: 312 –`` and bare
# ``DTS 304 Data Management I`` all occur in the original PDFs.
HEADER = re.compile(
    r"(?m)^[ \t]*([A-Z]{2,10})[ \t]*[:\-/]?[ \t]*(\d{3,4})(?:/[A-Z]{2,10}(?:[ \t]*\d{3,4})?)?(?:[ \t]*[.:\-\u2013\u2014][ \t]*|[ \t]+(?=[A-Z]))"
)
COURSE_CODE_TOKEN = re.compile(r"(?<![A-Za-z0-9])([A-Z]{2,10})[ \t]*[:\-/]?[ \t]*([0-9]{3,4}[a-z]?)(?![A-Za-z0-9])", re.I)
GROUPED_CODE_HEADING = re.compile(
    r"(?m)^[ \t]*(?P<codes>(?:[A-Z]{2,10}[ \t]*[:\-/]?[ \t]*[0-9]{3,4}[a-z]?[ \t]*(?:,[ \t]*|/[ \t]*|&[ \t]*|\band\b[ \t]*)){1,}"
    r"[A-Z]{2,10}[ \t]*[:\-/]?[ \t]*[0-9]{3,4}[a-z]?)[ \t]*$",
    re.I,
)
INLINE_COURSE_HEADING = re.compile(
    r"(?<![A-Za-z0-9])(?:[A-Z]{2,10})[ \t]*[:\-/]?[ \t]*[0-9O]{3,4}[a-z]?"
    r"(?:/(?:[A-Z]{2,10}[ \t]*)?[0-9O]{3,4}[a-z]?)?"
    r"[ \t]*(?:[.:\-\u2013\u2014][ \t]*|[ \t]+(?=[A-Z]))"
    r"[A-Z][^\n]{2,220}?(?=\(\s*\d+(?:\.\d+)?\s*Units?\b)",
    re.I,
)
WORKLOAD = re.compile(r"\(\s*\d+(?:\.\d+)?\s*Units?\b", re.I)
# CCMAS page extraction contains OCR/typo variants such as ``Cours Contents``
# and ``Coursse Contents``. They are still the section boundary between the
# outcomes and the next course code, so recognize them instead of dropping the
# course's summary.
CONTENTS = re.compile(r"\bCour(?:se|s|sse)\s+Contents?\b", re.I)
LEARNING = re.compile(r"\bLearning\s+[O0C]utcomes?\b", re.I)
LIST_MARKER = re.compile(r"(?m)^\s*(\d{1,2})\s*[.)]\s*")
UNHEADED_EXPECTATION = re.compile(
    r"\b(?:the\s+)?(?:students?|learners?)\s+"
    r"(?:(?:are|is|will\s+be|should\s+be)\s+)?"
    r"(?:expected|required|able)\s+to\b"
    r"[^.!?:;]{1,700}[.!?:;]?",
    re.I,
)
PLACEHOLDERS = {"", "-", "--", "---", "n/a", "na", "none", "not available", "not applicable", "nil", "tbc", "to be confirmed"}
TITLE_STOP = {"a", "an", "and", "as", "at", "for", "from", "in", "of", "on", "or", "the", "to", "with", "i", "ii", "iii", "iv"}
ALWAYS_COMPARE = {
    ("computing.json", "ENT 312", "Venture Creation"),
    ("computing.json", "GST 111", "Communication in English"),
}


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\u00a0", " ")).strip()


def key_code(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", clean(value).casefold())


def words(value: Any) -> set[str]:
    return {w for w in re.findall(r"[a-z0-9]+", clean(value).casefold()) if len(w) > 1 and w not in TITLE_STOP}


def title_identity(value: Any) -> str:
    """Normalize punctuation and stop-word variants of the same course title."""
    return " ".join(w for w in re.findall(r"[a-z0-9]+", clean(value).casefold()) if len(w) > 1 and w not in TITLE_STOP)


def title_match(expected: str, found: str) -> float:
    a, b = words(expected), words(found)
    if not a or not b:
        return 0.0
    overlap = len(a & b)
    # Require both coverage of the expected title and precision of the source
    # heading. This rejects catalogue-table rows whose trailing units/hours or
    # neighbouring columns were mistakenly absorbed into the title.
    return min(overlap / len(a), overlap / len(b))


def matching_course_blocks(title: str, blocks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Prefer exact title-token matches before considering fuzzy candidates.

    CCMAS PDFs often repeat generic course codes across packages, and OCR or
    nearby headings can produce plausible-but-wrong fuzzy title matches. If an
    exact title match exists, it is stronger evidence than those fuzzy hits.
    Keep every exact occurrence so repeated source versions can still be
    reconciled conservatively by the caller.
    """
    scored = [(title_match(title, block["title"]), block) for block in blocks]
    exact = [block for score, block in scored if score >= 0.98]
    if exact:
        return exact
    return [block for score, block in scored if score >= 0.65]


def exact_title_course_blocks(title: str, blocks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Long blocks require an exact title, not a plausible fuzzy table hit."""
    return [block for block in blocks if title_match(title, block["title"]) >= 0.98]


def course_identity(source_file: str, programme: str, course: dict[str, Any]) -> tuple[str, str, str, str]:
    """A repeated course code is not a duplicate identity when its title differs."""
    return (
        source_file,
        programme,
        key_code(course.get("code")),
        title_identity(course.get("title")),
    )


def compact_text(value: Any) -> str:
    return re.sub(r"[^a-z0-9]", "", clean(value).casefold())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verified_source_pages(source_file: str, pdf_dir: Path, manifest: dict[str, Any]) -> tuple[list[str], dict[str, Any]]:
    entry = next((item for item in manifest.get("source_documents", []) if item.get("source_file") == source_file), None)
    pdf_name = SOURCE_FILES.get(source_file)
    pdf_path = pdf_dir / pdf_name if pdf_name else None
    if not entry or not pdf_path or not pdf_path.exists():
        return [], {"status": "original_pdf_or_manifest_entry_missing"}
    if sha256(pdf_path) != entry.get("original_pdf_sha256"):
        return [], {"status": "original_pdf_checksum_mismatch", "pdf": str(pdf_path)}
    text_path = ROOT / Path(entry.get("extracted_text_file", ""))
    if not text_path.exists() or sha256(text_path) != entry.get("extracted_text_sha256"):
        return [], {"status": "page_text_missing_or_checksum_mismatch", "pdf": str(pdf_path)}
    pages = text_path.read_text(encoding="utf-8").split("\f")
    page_count = int(entry.get("page_count") or 0)
    if len(pages) < page_count:
        pages.extend([""] * (page_count - len(pages)))
    elif len(pages) > page_count:
        pages = pages[:page_count]
    return pages, {
        "status": "original_pdf_and_page_text_checksums_verified",
        "pdf": str(pdf_path),
        "pdf_sha256": entry["original_pdf_sha256"],
        "page_count": page_count,
        "text_sha256": entry["extracted_text_sha256"],
    }


def programme_page_ranges(source_file: str, document: dict[str, Any]) -> dict[str, tuple[int, int]]:
    """Find each programme's bounded source section from its explicit Overview heading."""
    text_path = AUDIT_DIR / "ccmas_original_source_text_2026-09-29" / f"{Path(source_file).stem}.txt"
    if not text_path.exists():
        return {}
    pages = text_path.read_text(encoding="utf-8", errors="replace").split("\f")
    headings: list[tuple[int, str]] = []
    for ordinal, page in enumerate(pages, 1):
        flattened = " ".join(page.split())
        for match in re.finditer(
            r"(?:(?:B\.?\s*(?:Sc|A|Eng|Tech)\.?|LL\.?\s*B\.?)\s+"
            r"(?P<title>.{3,120}?)\s+Overview\b)",
            flattened,
            re.I,
        ):
            headings.append((ordinal, match.group("title")))
    starts: list[tuple[int, str]] = []
    for programme in document.get("programmes", []):
        name = clean(programme.get("name"))
        expected = words(name)
        matches = [
            (len(expected & words(title)) / len(expected), page, title)
            for page, title in headings
            if expected and len(expected & words(title)) / len(expected) >= 0.80
        ]
        if not matches and source_file == "law.json" and name.casefold() == "law":
            matches = [(1.0, page, title) for page, title in headings if words(title) == {"degree"}]
        if matches:
            _, page, _ = max(matches)
            starts.append((page, name))
    starts.sort()
    ranges = {}
    for index, (start, name) in enumerate(starts):
        end = starts[index + 1][0] - 1 if index + 1 < len(starts) else len(pages)
        if end >= start:
            ranges[name] = (start, end)
    return ranges


def restrict_candidates_to_programme_range(
    candidates: list[dict[str, Any]], bounds: tuple[int, int] | None
) -> list[dict[str, Any]]:
    """Prefer exact course blocks inside the named programme's PDF section."""
    if not bounds:
        return candidates
    scoped = [
        candidate for candidate in candidates
        if candidate["page_end"] >= bounds[0] and candidate["page_start"] <= bounds[1]
    ]
    return scoped or candidates


def page_for_offset(offset: int, page_starts: list[int]) -> int:
    lo, hi = 0, len(page_starts)
    while lo + 1 < hi:
        mid = (lo + hi) // 2
        if page_starts[mid] <= offset:
            lo = mid
        else:
            hi = mid
    return lo + 1


def course_blocks(pages: list[str]) -> list[dict[str, Any]]:
    starts: list[int] = []
    parts: list[str] = []
    cursor = 0
    for page in pages:
        starts.append(cursor)
        parts.append(page)
        cursor += len(page) + 3
    full_text = "\n\f\n".join(parts)
    headers = list(HEADER.finditer(full_text))
    blocks: list[dict[str, Any]] = []
    for index, match in enumerate(headers):
        tail = full_text[match.end() : match.end() + 320]
        workload = WORKLOAD.search(tail)
        title_raw = tail[: workload.start()] if workload else tail.split("\n", 1)[0]
        title = clean(title_raw).strip(" :–-\t")
        if len(title) < 3 or len(title) > 220:
            continue
        block_end = headers[index + 1].start() if index + 1 < len(headers) else len(full_text)
        block_start_page = page_for_offset(match.start(), starts)
        # Do not attribute a following page to this course when it contains
        # only page furniture/level headings before the next course header.
        block_body = full_text[match.end() : block_end]
        last_content_page = block_start_page
        for page_offset, page_fragment in enumerate(block_body.split("\f")):
            if clean(strip_page_furniture(page_fragment)):
                last_content_page = block_start_page + page_offset
        blocks.append({
            "code": clean(match.group(1) + " " + match.group(2)),
            "title": title,
            "source_order": index,
            "page_start": block_start_page,
            "page_end": last_content_page,
            "text": block_body,
        })
    for index, block in enumerate(blocks):
        previous = blocks[index - 1] if index else None
        following = blocks[index + 1] if index + 1 < len(blocks) else None
        block["previous_code"] = previous["code"] if previous else None
        block["previous_title"] = previous["title"] if previous else None
        block["next_code"] = following["code"] if following else None
        block["next_title"] = following["title"] if following else None
    return blocks


def strip_page_furniture(value: str) -> str:
    output = []
    for line in value.splitlines():
        line = re.sub(
            r"^\s*(?:Allied Health Sciences|Engineering and Technology|Environmental Sciences|Social Sciences|Administration and Management Sciences|Computing|Agricultural Science|Sciences|Arts|Education|Law|Pharmacy|Medicine and Dentistry|Architecture|Veterinary Medicine)\s+\d{1,4}\s+",
            "",
            line,
            flags=re.I,
        )
        if re.match(r"^\s*(?:New\s*)?$", line, re.I):
            continue
        if re.match(
            r"^\s*(?:Agricultural Science|Allied Health Sciences|Architecture|Arts|Computing|Education|Engineering(?: and Technology)?|Environmental Sciences|Law|Medicine and Dentistry|Pharmacy|Sciences|Social Sciences|Veterinary Medicine)\s*$",
            line,
            re.I,
        ):
            continue
        if re.match(r"^\s*(?:Global\s+Course\s+Structure|Course\s+Structure|Minimum\s+Academic\s+Standards)\s*$", line, re.I):
            continue
        if re.match(r"^\s*(?:100|200|300|400|500|600)\s*[- ]Level(?:\b.*)?$", line, re.I):
            continue
        if re.match(r"^\s*\d{3}\s+Level(?:\s+Courses?)?\s*$", line, re.I):
            continue
        if re.match(r"^\s*Course\s+Code\s+Course\s+Title\s+Units?\b.*$", line, re.I):
            continue
        if re.match(r"^\s*(?:Computing|Law|Arts|Education|NUC|Engineering|Sciences|Pharmacy|Medicine|Agriculture|Veterinary|Architecture|Environmental|Social|Allied)\s+\d+\s*$", line, re.I):
            continue
        if re.match(r"^\s*\d+\s*$", line):
            continue
        output.append(line)
    return "\n".join(output)


def parse_block(block: dict[str, Any]) -> dict[str, Any]:
    text = strip_page_furniture(block["text"])
    learning = LEARNING.search(text)
    contents = CONTENTS.search(text)
    outcomes: list[str] = []
    summary = ""

    if learning:
        outcome_end = contents.start() if contents and contents.start() > learning.end() else len(text)
        region = text[learning.end() : outcome_end]
        markers = list(LIST_MARKER.finditer(region))
        if markers and int(markers[0].group(1)) == 1:
            expected_number = 1
            for i, marker in enumerate(markers):
                number = int(marker.group(1))
                if number != expected_number:
                    break
                end = markers[i + 1].start() if i + 1 < len(markers) else len(region)
                item = clean(region[marker.end() : end]).strip(" ;\n")
                if not item:
                    break
                outcomes.append(item)
                expected_number += 1
        elif not markers:
            # Some source entries use a singular, unnumbered learning outcome
            # (and OCR occasionally reads the O in Outcomes as C or 0).
            prose = clean(strip_page_furniture(region)).strip(" :;\n")
            if len(words(prose)) >= 6 and not re.match(
                r"^(?:at\s+the\s+end|students?\s+should\s+be\s+able\s+to)\b.*:?$",
                prose,
                re.I,
            ):
                outcomes.append(prose)
        # Reject outcomes with obvious OCR damage or spillover into another course.
        if any(re.search(r"ẹv\.?\s*tify|Ãƒ|�", item) or HEADER.search(item) for item in outcomes):
            outcomes = []

    if contents:
        summary_lines = []
        for line in text[contents.end() :].splitlines():
            if re.match(
                r"^\s*(?:Global\s+Course\s+Structure|Course\s+Structure|Minimum\s+Academic\s+Standards|Graduation\s+Requirements|Admission\s+Requirements|Course\s+Code\b|Course\s+Title\b|Course\s+Contents?\b|(?:100|200|300|400|500|600)\s*[- ]Level\b|Equipment\b|Library\b|Classrooms?\b|Laboratories\b|Workshops\b|Offices\b|Facilities\b|Staff[- ]Student\b|B\.?\s*Sc\.?\b.*\bOverview\b|Programme\s+Overview\b)",
                line,
                re.I,
            ):
                break
            summary_lines.append(line)
        summary = clean(strip_page_furniture("\n".join(summary_lines)))
        # PDF text extraction occasionally joins the next course heading onto
        # the end of a contents paragraph. Detect that heading by its course
        # code + title + unit-workload shape, even when it is not line-anchored.
        embedded_heading = INLINE_COURSE_HEADING.search(summary)
        if embedded_heading:
            summary = summary[: embedded_heading.start()].rstrip(" .;,:-")
        summary = re.sub(r"\s+", " ", summary).strip(" \t\n")
        if re.search(r"ẹv\.?\s*tify|Ãƒ|�", summary) or HEADER.search(summary):
            summary = ""

    # Some source courses use an explicit expectation sentence instead of a
    # ``Learning Outcomes`` heading/list (e.g. practical exercises and project
    # courses). Preserve only those verbatim, bounded expectation statements;
    # do not convert the whole contents paragraph into invented outcomes.
    if not outcomes:
        for match in UNHEADED_EXPECTATION.finditer(text):
            statement = clean(match.group(0)).strip(" :;\n")
            if len(words(statement)) >= 5 and not any(
                compact_text(statement) == compact_text(existing) for existing in outcomes
            ):
                outcomes.append(statement)

    if not contents:
        # Some CCMAS courses have descriptive prose but no literal
        # "Course Contents" label (for example CRD 307). Retain that source
        # prose as the summary, excluding the repeated heading/workload and
        # any outcomes section.
        body = text
        workload = WORKLOAD.search(body)
        if workload:
            close = body.find(")", workload.start())
            if close >= 0:
                body = body[close + 1 :]
        body = re.sub(r"^\s*" + re.escape(block["title"]) + r"\s*", "", body, flags=re.I)
        if learning:
            body = body[: learning.start()]
        body = strip_page_furniture(body)
        embedded_heading = INLINE_COURSE_HEADING.search(body)
        if embedded_heading:
            body = body[: embedded_heading.start()]
        body = clean(body).strip(" :;,.\t\n")
        body = re.sub(r"\b\d{3}\s+Level\s+Courses?\b.*$", "", body, flags=re.I).strip(" :;,.\t\n")
        if len(words(body)) >= 8 and not re.search(r"\b(?:Units?\s+[A-Z]|Course\s+Code|Course\s+Title|Status\s+LH)\b", body, re.I):
            summary = body

    return {"learning_outcomes": outcomes, "content_summary": summary}


def parse_grouped_outcome_blocks(pages: list[str]) -> dict[str, list[dict[str, Any]]]:
    """Index outcomes explicitly shared by a source heading listing course codes.

    Some CCMAS sections place one outcomes list under a comma-separated code
    heading (for example ``POT 303, POT 305, POT 306``), then give each course
    its own contents block. Attach that list only to the course codes named in
    the group heading and retain its source page range.
    """
    starts: list[int] = []
    parts: list[str] = []
    cursor = 0
    for page in pages:
        starts.append(cursor)
        parts.append(page)
        cursor += len(page) + 3
    full_text = "\n\f\n".join(parts)
    individual_headers = list(HEADER.finditer(full_text))
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for heading in GROUPED_CODE_HEADING.finditer(full_text):
        codes = [key_code(" ".join(match.groups())) for match in COURSE_CODE_TOKEN.finditer(heading.group("codes"))]
        if len(codes) < 2:
            continue
        next_header = next((match for match in individual_headers if match.start() > heading.end()), None)
        end = next_header.start() if next_header else len(full_text)
        region = full_text[heading.end():end]
        learning = LEARNING.search(region)
        if not learning:
            continue
        contents = CONTENTS.search(region, learning.end())
        outcomes_region = region[learning.end():contents.start() if contents else len(region)]
        parsed = parse_numbered_outcomes(outcomes_region)
        if not parsed:
            prose = clean(strip_page_furniture(outcomes_region)).strip(" :;\n")
            if len(words(prose)) >= 6 and not re.match(r"^(?:at\s+the\s+end|students?\s+should\s+be\s+able\s+to)\b.*:?$", prose, re.I):
                parsed = [prose]
        if not parsed:
            continue
        page_start = page_for_offset(heading.start(), starts)
        page_end = page_for_offset(heading.end() + learning.end() + len(outcomes_region), starts)
        candidate = {
            "codes": codes,
            "learning_outcomes": parsed,
            "page_start": page_start,
            "page_end": max(page_start, page_end),
            "source_order": heading.start(),
        }
        for code in codes:
            grouped[code].append(candidate)
    return grouped


def parse_numbered_outcomes(region: str) -> list[str]:
    markers = list(LIST_MARKER.finditer(region))
    outcomes: list[str] = []
    if markers and int(markers[0].group(1)) == 1:
        expected_number = 1
        for index, marker in enumerate(markers):
            if int(marker.group(1)) != expected_number:
                break
            end = markers[index + 1].start() if index + 1 < len(markers) else len(region)
            item = clean(region[marker.end():end]).strip(" ;\n")
            if not item:
                break
            outcomes.append(item)
            expected_number += 1
    return outcomes


def value_is_empty(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, list):
        return not value or all(clean(item).casefold() in PLACEHOLDERS for item in value)
    return clean(value).casefold() in PLACEHOLDERS


def repair_for_current(current: Any, source: Any, field: str) -> tuple[bool, str]:
    if value_is_empty(current):
        return True, "blank_or_placeholder"
    if field == "skills_learned" and isinstance(current, list) and isinstance(source, list) and len(current) < len(source):
        pairs = zip(current, source[: len(current)])
        if all(
            SequenceMatcher(None, compact_text(old), compact_text(new)).ratio() >= 0.82
            and len(words(old) & words(new)) / max(1, len(words(old) | words(new))) >= 0.78
            for old, new in pairs
        ):
            return True, "existing_items_are_exact_source_prefix"
    if field == "content_summary" and isinstance(current, str) and isinstance(source, str):
        old, full = compact_text(current), compact_text(source)
        if old and len(old) < len(full) and full.startswith(old):
            return True, "existing_summary_is_exact_source_prefix"
    return False, "existing_nonempty_value_not_a_proven_source_prefix"


def longest_source_consensus(
    candidates: list[tuple[Any, dict[str, Any]]], field: str
) -> tuple[Any, dict[str, Any]] | None:
    """Choose a longer repeated source block only when all variants prefix it."""
    if not candidates:
        return None
    def size(item: tuple[Any, dict[str, Any]]) -> int:
        value = item[0]
        return len(value) if isinstance(value, (str, list)) else 0
    longest = max(candidates, key=size)
    full = longest[0]
    for value, _ in candidates:
        if field == "content_summary":
            short, long = compact_text(value), compact_text(full)
            if short and not long.startswith(short):
                return None
        elif field == "skills_learned":
            if not isinstance(value, list) or not isinstance(full, list) or len(value) > len(full):
                return None
            for old, new in zip(value, full[: len(value)]):
                similarity = SequenceMatcher(None, compact_text(old), compact_text(new)).ratio()
                overlap = len(words(old) & words(new)) / max(1, len(words(old) | words(new)))
                if similarity < 0.82 or overlap < 0.78:
                    return None
        else:
            return None
    return longest


def unique_candidate_between_programme_anchors(
    candidates: list[dict[str, Any]], anchors: list[tuple[int, int]], course_index: int
) -> dict[str, Any] | None:
    """Return a source block only when exact adjacent-course anchors isolate it."""
    previous = [source_order for index, source_order in anchors if index < course_index]
    following = [source_order for index, source_order in anchors if index > course_index]
    lower = max(previous) if previous else None
    upper = min(following) if following else None
    bounded = [
        candidate for candidate in candidates
        if (lower is None or candidate["source_order"] > lower)
        and (upper is None or candidate["source_order"] < upper)
    ]
    return bounded[0] if len(bounded) == 1 else None


def unique_candidate_by_source_neighbors(
    candidates: list[dict[str, Any]], previous_course: dict[str, Any] | None,
    next_course: dict[str, Any] | None,
) -> dict[str, Any] | None:
    """Select only a uniquely best block adjacent to exact package neighbors."""
    scored = []
    for candidate in candidates:
        score = 0
        if previous_course and key_code(previous_course.get("code")) == key_code(candidate.get("previous_code")) and title_match(clean(previous_course.get("title")), clean(candidate.get("previous_title"))) >= 0.98:
            score += 1
        if next_course and key_code(next_course.get("code")) == key_code(candidate.get("next_code")) and title_match(clean(next_course.get("title")), clean(candidate.get("next_title"))) >= 0.98:
            score += 1
        scored.append((score, candidate))
    if not scored:
        return None
    best = max(score for score, _ in scored)
    winners = [candidate for score, candidate in scored if score == best]
    return winners[0] if best > 0 and len(winners) == 1 else None


def unique_ordered_candidate_assignments(
    candidate_sets: list[list[dict[str, Any]]],
) -> list[dict[str, Any] | None]:
    """Find source blocks forced by a strict, order-preserving package match."""
    if not candidate_sets:
        return []
    forward: list[list[dict[str, Any]]] = []
    for index, candidates in enumerate(candidate_sets):
        viable = [
            candidate for candidate in candidates
            if index == 0 or any(previous["source_order"] < candidate["source_order"] for previous in forward[index - 1])
        ]
        if not viable:
            return [None] * len(candidate_sets)
        forward.append(viable)
    backward: list[list[dict[str, Any]]] = [[] for _ in candidate_sets]
    for index in range(len(candidate_sets) - 1, -1, -1):
        candidates = candidate_sets[index]
        viable = [
            candidate for candidate in candidates
            if index == len(candidate_sets) - 1 or any(candidate["source_order"] < following["source_order"] for following in backward[index + 1])
        ]
        if not viable:
            return [None] * len(candidate_sets)
        backward[index] = viable
    assignments = []
    for index, candidates in enumerate(candidate_sets):
        viable = [
            candidate for candidate in candidates
            if candidate in forward[index] and candidate in backward[index]
        ]
        assignments.append(viable[0] if len(viable) == 1 else None)
    return assignments


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-dir", type=Path, default=DEFAULT_PDF_DIR)
    parser.add_argument("--out-prefix", type=Path, default=AUDIT_DIR / "ccmas_all_empty_details_original_pdf_repair_2026-09-30")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))

    docs: dict[str, dict[str, Any]] = {}
    rows: list[dict[str, Any]] = []
    all_occurrences: dict[tuple[str, str, str], set[int]] = defaultdict(set)
    programme_ranges: dict[str, dict[str, tuple[int, int]]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        docs[path.name] = document
        programme_ranges[path.name] = programme_page_ranges(path.name, document)
        for programme_index, programme in enumerate(document.get("programmes", [])):
            for course_index, course in enumerate(programme.get("courses", [])):
                identity = (path.name, key_code(course.get("code")), title_identity(course.get("title")))
                all_occurrences[identity].add(programme_index)
                # Include every course so source-exact prefixes can be detected
                # even when a field is non-empty but visibly truncated.
                rows.append({"source_file": path.name, "programme": clean(programme.get("name")), "programme_index": programme_index, "course_index": course_index, "course": course})

    required_by_file: dict[str, set[tuple[str, str]]] = defaultdict(set)
    for row in rows:
        required_by_file[row["source_file"]].add((clean(row["course"].get("code")), clean(row["course"].get("title"))))

    source_matches: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    grouped_outcomes_by_file: dict[str, dict[str, list[dict[str, Any]]]] = {}
    pdf_status: dict[str, Any] = {}
    for source_file, targets in sorted(required_by_file.items()):
        pdf_name = SOURCE_FILES.get(source_file)
        pages, status = verified_source_pages(source_file, args.pdf_dir, manifest)
        pdf_status[source_file] = status
        if not pages:
            continue
        grouped_outcomes_by_file[source_file] = parse_grouped_outcome_blocks(pages)
        blocks = course_blocks(pages)
        blocks_by_code: dict[str, list[dict[str, Any]]] = defaultdict(list)
        long_blocks_by_code: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for block in blocks:
            if block["page_end"] - block["page_start"] < 5:
                blocks_by_code[key_code(block["code"])].append(block)
            else:
                # Longer source blocks are considered only for an exact title
                # match below; fuzzy matches from a schedule row must never
                # pull in pages of unrelated programme/equipment material.
                long_blocks_by_code[key_code(block["code"])].append(block)
        for code, title in targets:
            matches = matching_course_blocks(title, blocks_by_code.get(key_code(code), []))
            if not matches:
                matches = exact_title_course_blocks(title, long_blocks_by_code.get(key_code(code), []))
            for block in matches:
                detail = parse_block(block)
                if detail["learning_outcomes"] or detail["content_summary"]:
                    source_matches[(source_file, code, title)].append({**block, **detail, "pdf": pdf_name})

    counts: Counter[str] = Counter(rows_seen=len(rows), summary_empty_before=sum(value_is_empty(r["course"].get("content_summary")) for r in rows), outcomes_empty_before=sum(value_is_empty(r["course"].get("skills_learned")) for r in rows))
    changes: list[dict[str, Any]] = []
    row_results: list[dict[str, Any]] = []
    identity_counts = Counter(course_identity(r["source_file"], r["programme"], r["course"]) for r in rows)

    # Repeated common courses (e.g. FAC 301) can have several valid source
    # blocks, one inside each programme section. Resolve a block only when the
    # same programme has unique course-code/title anchors immediately before
    # and after it in both the package order and PDF source order.
    programme_rows: dict[tuple[str, int], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        programme_rows[(row["source_file"], row["programme_index"])].append(row)
    programme_anchors: dict[tuple[str, int], list[tuple[int, int]]] = {}
    programme_order_selections: dict[tuple[str, int, int], dict[str, Any]] = {}
    for programme_key, package_rows in programme_rows.items():
        anchors = []
        sequence_rows = []
        sequence_candidates = []
        for row in package_rows:
            identity = (row["source_file"], clean(row["course"].get("code")), clean(row["course"].get("title")))
            matches = source_matches.get(identity, [])
            if len(matches) == 1 and title_match(clean(row["course"].get("title")), matches[0]["title"]) >= 0.98:
                anchors.append((row["course_index"], matches[0]["source_order"]))
            exact_matches = [candidate for candidate in matches if title_match(clean(row["course"].get("title")), candidate["title"]) >= 0.98]
            if exact_matches:
                sequence_rows.append(row)
                sequence_candidates.append(exact_matches)
        anchors.sort()
        if all(left[1] < right[1] for left, right in zip(anchors, anchors[1:])):
            programme_anchors[programme_key] = anchors
            assignments = unique_ordered_candidate_assignments(sequence_candidates)
            for row, assignment in zip(sequence_rows, assignments):
                if assignment:
                    programme_order_selections[(row["source_file"], row["programme_index"], row["course_index"])] = assignment

    for row in rows:
        source_file, programme, course = row["source_file"], row["programme"], row["course"]
        code, title = clean(course.get("code")), clean(course.get("title"))
        candidates = source_matches.get((source_file, code, title), [])
        context_selected_order: int | None = None
        context_selection_method: str | None = None
        bounds = programme_ranges.get(source_file, {}).get(programme)
        if bounds and candidates:
            scoped_candidates = [
                candidate for candidate in candidates
                if candidate["page_end"] >= bounds[0] and candidate["page_start"] <= bounds[1]
            ]
            if scoped_candidates:
                if len(scoped_candidates) < len(candidates):
                    context_selection_method = "programme_overview_page_range"
                candidates = scoped_candidates
            else:
                # A same-code/title block elsewhere in the discipline PDF is
                # not evidence for this programme if its own bounded section
                # contains no matching course occurrence.
                candidates = []
                context_selection_method = "course_block_outside_programme_range"
        programme_indexes = sorted(all_occurrences.get((source_file, key_code(code), title_identity(title)), set()))
        if len(candidates) > 1 and len(candidates) == len(programme_indexes) and len(programme_indexes) > 1:
            # Align the complete repeated course sequence across package-title
            # spelling variants such as "and" versus "&".
            candidates = [sorted(candidates, key=lambda candidate: candidate["source_order"])[programme_indexes.index(row["programme_index"])]]
            context_selected_order = candidates[0]["source_order"]
            context_selection_method = "complete_programme_occurrence_sequence"
        if len(candidates) > 1:
            contextual = programme_order_selections.get((source_file, row["programme_index"], row["course_index"]))
            if contextual:
                context_selection_method = "unique_package_order_alignment"
            if contextual is None:
                anchors = programme_anchors.get((source_file, row["programme_index"]), [])
                contextual = unique_candidate_between_programme_anchors(candidates, anchors, row["course_index"])
                if contextual:
                    context_selection_method = "unique_block_between_programme_course_anchors"
            if contextual is None:
                package_courses = programme_rows[(source_file, row["programme_index"])]
                course_index = row["course_index"]
                previous_course = package_courses[course_index - 1]["course"] if course_index > 0 else None
                next_course = package_courses[course_index + 1]["course"] if course_index + 1 < len(package_courses) else None
                contextual = unique_candidate_by_source_neighbors(candidates, previous_course, next_course)
                if contextual:
                    context_selection_method = "unique_immediate_source_course_neighbors"
            if contextual:
                candidates = [contextual]
                context_selected_order = contextual["source_order"]
        if len(candidates) == len(programme_indexes) and len(programme_indexes) > 1:
            # Repeated generic course codes (e.g. GST 111 / ENT 312) have one
            # source block inside each programme's CCMAS chapter. Match the
            # n-th package occurrence to the n-th source occurrence, retaining
            # that programme-specific page locator instead of borrowing the
            # first same-named block from the PDF.
            candidate_index = programme_indexes.index(row["programme_index"])
            candidates = [candidates[candidate_index]]
        selected_source = candidates[0] if len(candidates) == 1 else None
        result: dict[str, Any] = {"source_file": source_file, "programme": programme, "code": code, "title": title, "fields": {}}
        if identity_counts[course_identity(source_file, programme, course)] > 1:
            result["disposition"] = "duplicate_course_identity_requires_row_review"
            counts["duplicate_course_identity"] += 1
            row_results.append(result)
            continue
        if not candidates:
            result["disposition"] = pdf_status.get(source_file, "no_source_candidate")
            counts["no_matching_source_block"] += 1
            row_results.append(result)
            continue

        for output_field, source_field in (("content_summary", "content_summary"), ("skills_learned", "learning_outcomes")):
            current = course.get(output_field)
            if not value_is_empty(current) and not (output_field == "skills_learned" and isinstance(current, list)) and not (output_field == "content_summary" and isinstance(current, str)):
                continue
            candidate_values = {}
            for candidate in candidates:
                value = candidate[source_field]
                if value:
                    signature = compact_text(json.dumps(value, ensure_ascii=False) if isinstance(value, list) else value)
                    candidate_values.setdefault(signature, (value, candidate))
            grouped_candidate = None
            if output_field == "skills_learned" and not candidate_values and value_is_empty(current):
                group_candidates = grouped_outcomes_by_file.get(source_file, {}).get(key_code(code), [])
                if bounds:
                    group_candidates = [
                        candidate for candidate in group_candidates
                        if candidate["page_end"] >= bounds[0] and candidate["page_start"] <= bounds[1]
                    ]
                grouped_values = {
                    compact_text(json.dumps(candidate["learning_outcomes"], ensure_ascii=False)): candidate
                    for candidate in group_candidates
                }
                if len(grouped_values) == 1:
                    grouped_candidate = next(iter(grouped_values.values()))
                    candidate_values = {
                        compact_text(json.dumps(grouped_candidate["learning_outcomes"], ensure_ascii=False)):
                        (grouped_candidate["learning_outcomes"], grouped_candidate)
                    }
            if len(candidate_values) != 1:
                consensus = longest_source_consensus(list(candidate_values.values()), output_field)
                if consensus:
                    candidate_values = {"longest_verified_source_consensus": consensus}
                else:
                    if value_is_empty(current):
                        result["fields"][output_field] = {"disposition": "source_candidates_conflict" if candidate_values else "source_section_not_found", "candidate_count": len(candidate_values)}
                        if candidate_values:
                            result["fields"][output_field]["candidate_sources"] = [
                                {
                                    "source_title": candidate["title"],
                                    "pdf_pages": list(range(candidate["page_start"], candidate["page_end"] + 1)),
                                    "value": value if isinstance(value, list) else value[:500],
                                }
                                for value, candidate in candidate_values.values()
                            ]
                        result["fields"][output_field]["source_block_count"] = len(candidates)
                        result["fields"][output_field]["expected_programme_occurrences"] = len(programme_indexes)
                        result["fields"][output_field]["programme_occurrence_index"] = programme_indexes.index(row["programme_index"])
                        counts[f"{output_field}_source_conflict_or_absent"] += 1
                    continue
            source_value, candidate = next(iter(candidate_values.values()))
            eligible, reason = repair_for_current(current, source_value, output_field)
            if not eligible:
                if value_is_empty(current):
                    result["fields"][output_field] = {"disposition": reason}
                continue
            result["fields"][output_field] = {
                "disposition": "source_prefix_completed" if reason != "blank_or_placeholder" else "source_empty_field_filled",
                "before": current,
                "after": source_value,
                "source_pdf": candidate.get("pdf", SOURCE_FILES.get(source_file)),
                "pdf_pages": list(range(candidate["page_start"], candidate["page_end"] + 1)),
                "matched_source_title": candidate.get("title", f"shared outcomes for {', '.join(candidate.get('codes', []))}"),
                "source_match_method": (
                    "explicit_grouped_course_code_header"
                    if grouped_candidate
                    else "unique_course_match" if context_selected_order is None else context_selection_method
                ),
            }

        locator_update: dict[str, Any] | None = None
        if selected_source and clean(course.get("source_locator", "")).startswith("Original CCMAS PDF; package "):
            pdf_pages = list(range(selected_source["page_start"], selected_source["page_end"] + 1))
            exact_locator = f"Original CCMAS PDF; package {programme}; course {code}; {selected_source['pdf']} pp. {', '.join(map(str, pdf_pages))}"
            if course.get("source_locator") != exact_locator:
                locator_update = {"field": "source_locator", "before": course.get("source_locator"), "after": exact_locator, "reason": "programme_specific_source_page_corrected"}

        proposed = [f for f, v in result["fields"].items() if v.get("disposition") in {"source_prefix_completed", "source_empty_field_filled"}]
        if proposed or locator_update:
            change = {"source_file": source_file, "programme": programme, "code": code, "title": title, "fields": []}
            for output_field in proposed:
                evidence = result["fields"][output_field]
                change["fields"].append({"field": output_field, "before": evidence["before"], "after": evidence["after"], "reason": evidence["disposition"], "source_pdf": evidence["source_pdf"], "pdf_pages": evidence["pdf_pages"], "matched_source_title": evidence["matched_source_title"], "source_match_method": evidence["source_match_method"]})
                if args.apply:
                    course[output_field] = evidence["after"]
            if locator_update:
                change["fields"].append(locator_update)
                if args.apply:
                    course["source_locator"] = locator_update["after"]
            if not course.get("source_state"):
                change["fields"].append({"field": "source_state", "before": None, "after": "source_reconciled_original_pdf", "reason": "source_provenance"})
                if args.apply:
                    course["source_state"] = "source_reconciled_original_pdf"
            if not course.get("source_locator") and not locator_update:
                locators = sorted({f"{v['source_pdf']} pp. {', '.join(map(str, v['pdf_pages']))}" for v in result["fields"].values() if "source_pdf" in v})
                locator = f"Original CCMAS source: {programme}; {code}; " + "; ".join(locators)
                change["fields"].append({"field": "source_locator", "before": None, "after": locator, "reason": "source_provenance"})
                if args.apply:
                    course["source_locator"] = locator
            changes.append(change)
            counts["source_rows_repaired"] += 1
            counts["source_detail_fields_repaired"] += len(proposed)
        row_results.append(result)

    if args.apply:
        for source_file, document in docs.items():
            if any(c["source_file"] == source_file for c in changes):
                (CCMAS_DIR / source_file).write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    output = {
        "schema": "2026-09-30.ccmas-original-pdf-empty-and-truncated-details.v1",
        "generated_on": date.today().isoformat(),
        "status": "applied" if args.apply else "dry_run",
        "counts": dict(counts),
        "pdf_status": pdf_status,
        "changes": changes,
        "rows": row_results,
        "rules": [
            "Each original PDF is parsed once; source sections are bounded by the next course-code header and can continue over page breaks.",
            "Course code and title must both match; conflicting source blocks are not guessed.",
            "Only empty/placeholder fields or existing exact source prefixes are changed.",
            "Non-empty values that do not prove to be prefixes are left unchanged for separate reconciliation.",
        ],
    }
    suffix = "_applied" if args.apply else "_dry_run"
    json_path = args.out_prefix.with_name(args.out_prefix.name + suffix + ".json")
    md_path = args.out_prefix.with_name(args.out_prefix.name + suffix + ".md")
    json_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# CCMAS original-PDF detail reconciliation", "", f"Status: `{output['status']}`", "", "## Counts", ""]
    lines.extend(f"- **{k.replace('_', ' ')}:** {v}" for k, v in sorted(counts.items()))
    lines += ["", "## Source PDFs", ""]
    lines.extend(f"- `{name}`: {status.get('status')} · {status.get('page_count', 0)} pages" for name, status in sorted(pdf_status.items()))
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "status": output["status"], "counts": dict(counts), "pdf_status": pdf_status}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
