#!/usr/bin/env python3
"""Classify unresolved JAMB subject wording by exact source-cell evidence.

This does not widen a national rule.  It separates exact, parseable IBASS
offering variants from contaminated/shared cells and genuinely vague wording,
retaining the source cell and locator for institution/programme reconciliation.
"""

from __future__ import annotations

import json
import glob
import re
import sys
from functools import lru_cache
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
QUEUE = CAREER / "_audit" / "jamb_unresolved_subject_pools_2026_10_08.json"
SOURCE_RULES = CAREER / "_audit" / "jamb_brochure_source_rules_2026-08-19.json"
OUTPUT = CAREER / "_audit" / "jamb_subject_scoped_resolution_2026_10_08.json"
OFFERING_FILES = sorted((CAREER / "jamb").glob("*_offerings.json"))
sys.path.insert(0, str(CAREER))

import _jamb_source_rules as source_rules  # noqa: E402
from _parse_subject_options import (  # noqa: E402
    ARTS,
    SOCIAL,
    OLEVEL_CODES,
    olevel_parts_are_matchable,
    parse_olevel,
    parse_utme,
)
from _parse_local_subject_exceptions import parse_local_exception  # noqa: E402


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def _normalize_evidence_text(value: str | None) -> str:
    """Ignore PDF spacing/punctuation artefacts, never word order/content."""
    return re.sub(r"[^a-z0-9]", "", str(value or "").casefold().replace("�", ""))


def _parse(text: str, exam_type: str):
    return parse_olevel(text) if exam_type == "olevel" else parse_utme(text)


@lru_cache(maxsize=2048)
def _title_pattern(name: str) -> re.Pattern[str]:
    tokens = re.findall(r"[A-Za-z0-9]+", name)
    return re.compile(
        r"(?<![A-Z0-9])" + r"[\s\-_/&,\.]*".join(map(re.escape, tokens))
        + r"(?![A-Z0-9])",
        re.I,
    )


@lru_cache(maxsize=1)
def _known_code_patterns(known_codes: frozenset[str]):
    patterns = []
    for code in sorted(known_codes, key=lambda value: (-len(value), value)):
        tokens = re.findall(r"[A-Za-z0-9]+", code)
        if not tokens:
            continue
        pattern = (
            r"(?<![A-Z0-9])"
            + r"[\s\-_/&,\.]*".join(map(re.escape, tokens))
            + r"(?![A-Z0-9])"
        )
        patterns.append((code, re.compile(pattern, re.I)))
    return tuple(patterns)


def _official_pdf_url(source_file: str | None) -> str | None:
    if not source_file:
        return None
    stem = re.sub(r"\.pdf$", "", source_file, flags=re.I).casefold()
    category = {
        "administration": "admin",
        "agriculture": "agriculture",
        "arts _ humanities": "arts",
        "arts & humanities": "arts",
        "engineering _ enviromental _ technology": "engineering",
        "engineering _ environmental _ technology": "engineering",
        "education": "education",
        "law": "law",
        "medical _ pharmaceutical _ health science": "medical",
        "sciences": "sciences",
        "social management science": "social-sciences",
    }.get(stem)
    return (
        f"https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-{category}.pdf"
        if category
        else None
    )


@lru_cache(maxsize=1)
def _official_text_pages():
    """Return extracted official IBASS PDF pages with stable PDF locators."""
    text_root = CAREER / "_jamb_txt"
    text_to_pdf = {
        "administration": "Administration.pdf",
        "agriculture": "Agriculture.pdf",
        "arts_hum": "Arts & Humanities.pdf",
        "engineering": "Engineering _ Environmental _ Technology.pdf",
        "education": "Education.pdf",
        "law": "Law.pdf",
        "medical": "Medical _ Pharmaceutical _ Health Science.pdf",
        "sciences": "Sciences.pdf",
        "social management science": "Social Management Science.pdf",
    }
    pages = []
    for path in sorted(text_root.glob("*.txt")):
        pdf_name = text_to_pdf.get(path.stem.casefold())
        if not pdf_name:
            continue
        text = path.read_text(encoding="cp1252", errors="replace")
        for page_number, page_text in enumerate(text.split("\f"), start=1):
            pages.append({
                "source_file": pdf_name,
                "pdf_page": page_number,
                "text": page_text,
                "normalized_text": _normalize_evidence_text(page_text),
            })
    return tuple(pages)


@lru_cache(maxsize=1)
def _official_page_lookup():
    """Map stable source locators directly to extracted pages for O(1) lookup."""
    return {
        (page["source_file"], int(page["pdf_page"])): page
        for page in _official_text_pages()
    }


@lru_cache(maxsize=1)
def _source_page_index():
    """Index PDF pages directly from exact programme/institution source cells."""
    report = json.loads(SOURCE_RULES.read_text(encoding="utf-8"))
    known_names, known_codes = _catalogue()
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    targets = {
        (str(row.get("jamb_programme")), str(row.get("exam_type"))): row
        for row in queue.get("rows") or []
        if row.get("jamb_programme") and row.get("exam_type")
    }
    indexed = defaultdict(set)
    for row in report.get("rows") or []:
        name = str(row.get("jamb_name") or "")
        layer = str(row.get("layer") or "")
        if not name or (name, layer) not in targets:
            continue
        for wrapper in row.get("source_variants") or []:
            variant = wrapper.get("source_variant") or {}
            source = variant.get("source") or {}
            if variant.get("status") not in {"exact", "inherited_shared"}:
                continue
            cell = _clean(source.get("course_cell"))
            source_file = source.get("source_file")
            page_number = source.get("pdf_page")
            if not source_file or page_number is None:
                continue
            if not _exact_course_identity(name, cell, known_names)[0]:
                continue
            matched_codes = _institution_codes_for_identity(
                name, cell, known_names, known_codes,
                set(targets[(name, layer)].get("offering_institutions") or []),
            )
            for code in matched_codes:
                indexed[(name, code)].add((str(source_file), int(page_number)))
    return {key: tuple(sorted(value)) for key, value in indexed.items()}


@lru_cache(maxsize=1024)
def _exact_note_page_locators(name, note, institution_code, known_names):
    """Locate a verbatim waiver note beside its programme and institution.

    A page hit is evidence only. The caller still checks exam-layer parsing
    and whether the note expresses a complete subject rule.
    """
    normalized_note = _normalize_evidence_text(note)
    programme_pattern = _title_pattern(str(name))
    code_pattern = _title_pattern(str(institution_code))
    if not normalized_note:
        return []
    page_index = _source_page_index()
    candidate_locators = set(
        page_index.get((str(name), str(institution_code)), ())
    )
    if not candidate_locators:
        return []
    # Programme + institution source-row indexing avoids rescanning every
    # brochure page for each waiver. Exact note text is checked only against
    # the source-located pages for this offering.
    page_lookup = _official_page_lookup()
    candidate_pages = [
        page_lookup[locator]
        for locator in sorted(candidate_locators)
        if locator in page_lookup
    ]
    locators = []
    for page in candidate_pages:
        if normalized_note not in page["normalized_text"]:
            continue
        if not programme_pattern.search(page["text"]):
            continue
        if not code_pattern.search(page["text"]):
            continue
        source_file = page["source_file"]
        locators.append({
            "source_file": source_file,
            "pdf_page": page["pdf_page"],
            "source_url": _official_pdf_url(source_file),
            "evidence_basis": "exact note, standalone programme title, and institution token on same official IBASS PDF page",
        })
    return locators


def _catalogue() -> tuple[set[str], set[str]]:
    names = set()
    institutions = set()
    for path in OFFERING_FILES:
        data = json.loads(path.read_text(encoding="utf-8"))
        for programme in data.get("programmes", []):
            if programme.get("jamb_name"):
                names.add(str(programme["jamb_name"]).strip())
            institutions.update(
                str(code).strip()
                for code in programme.get("institutions", [])
                if str(code).strip()
            )
            for waiver in programme.get("institution_waivers", []):
                institutions.update(
                    str(code).strip()
                    for code in (waiver.get("institutions") or [])
                    if str(code).strip()
                )
                if waiver.get("institution"):
                    institutions.add(str(waiver["institution"]).strip())
    return names, institutions


def _offering_codes_in_cell(cell: str, known_codes: set[str]) -> list[str]:
    return sorted(
        code
        for code, pattern in _known_code_patterns(frozenset(known_codes))
        if pattern.search(cell)
    )


_SOURCE_TITLE_ALIASES = {
    # The official Arts PDF extraction spells the neighbouring canonical
    # programme "Sociology and Anthropology" as "Sociology and Anthropolgy".
    # Use it only as a title boundary/locator alias.
    "sociology and anthropology": (
        re.compile(r"\bSOCIOLOGY\s*AND\s*ANTHROPOLGY\b", re.I),
    ),
}


def _programme_title_spans(name: str, cell: str):
    spans = [match.span() for match in _title_pattern(name).finditer(cell)]
    for pattern in _SOURCE_TITLE_ALIASES.get(str(name).casefold(), ()):
        spans.extend(match.span() for match in pattern.finditer(cell))
    return sorted(set(spans))


def _exact_course_identity(name: str, cell: str, known_names: set[str]) -> tuple[bool, str]:
    """Require a distinct catalogue title, not a substring of a compound title.

    A cell that names multiple catalogue programmes is held because the
    extracted table cell alone does not establish which institution codes
    belong to which title.
    """
    target_spans = _programme_title_spans(name, cell)
    if not target_spans:
        return False, "course_cell_does_not_match_canonical_programme"
    all_title_spans = []
    for candidate in known_names:
        for span in _programme_title_spans(candidate, cell):
            all_title_spans.append((candidate, span))

    def is_embedded(candidate: str, span: tuple[int, int]) -> bool:
        start, end = span
        return any(
            other.lower() != candidate.lower()
            and len(other) > len(candidate)
            and other_start <= start
            and end <= other_end
            for other, (other_start, other_end) in all_title_spans
        )

    standalone = []
    for span in target_spans:
        start, end = span
        if is_embedded(name, span):
            continue
        # Table extraction also places programme options in the same cell,
        # e.g. "offers the course as Mathematics/Integrated Science". That
        # mention is not proof of a standalone Mathematics offering.
        prefix = cell[:start]
        suffix = cell[end:]
        open_paren = prefix.rfind("(")
        close_paren = prefix.rfind(")")
        in_parentheses = open_paren > close_paren
        slash_compound = re.match(r"\s*/\s*[A-Za-z]", suffix)
        if in_parentheses or slash_compound:
            continue
        standalone.append(span)
    if not standalone:
        return False, "programme_name_only_embedded_in_compound_title"
    return True, ""


def _institution_codes_for_identity(
    name: str,
    cell: str,
    known_names: set[str],
    known_codes: set[str],
    allowed_codes: set[str],
) -> list[str]:
    """Read only institution tokens in the course-cell segment after a title.

    Some extracted IBASS cells contain several programme/institution pairs.
    Their institutions are associated by position: title, its awarding-code
    run, then the next distinct programme title. A repeated short title also
    terminates the prior run (e.g. Sociology followed by Sociology and X).
    """
    spans = _programme_title_spans(name, cell)
    valid_targets = []
    for start, end in spans:
        prefix = cell[:start]
        suffix = cell[end:]
        open_paren = prefix.rfind("(")
        close_paren = prefix.rfind(")")
        option_mention = open_paren > close_paren and bool(
            re.search(r"(?:course\s*as|options?\s*in|offered\s*as)\s*$", prefix, re.I)
        )
        if option_mention or re.match(r"\s*/\s*[A-Za-z]", suffix):
            continue
        if any(
            other.lower() != name.lower()
            and len(other) > len(name)
            and (match := _title_pattern(other).search(cell))
            and match.start() <= start
            and end <= match.end()
            for other in known_names
        ):
            continue
        valid_targets.append((start, end))

    associated = set()
    for index, (_start, end) in enumerate(valid_targets):
        next_title_starts = [start for start, _end in valid_targets[index + 1 :]]
        for other in known_names:
            if other.lower() == name.lower() or len(other) <= 3:
                continue
            for other_start, other_end in _programme_title_spans(other, cell):
                if other_start < end:
                    continue
                if not any(
                    longer.lower() != other.lower()
                    and len(longer) > len(other)
                    and any(
                        larger_start <= other_start and other_end <= larger_end
                        for larger_start, larger_end in _programme_title_spans(longer, cell)
                    )
                    for longer in known_names
                ):
                    next_title_starts.append(other_start)
            for alias_pattern in _SOURCE_TITLE_ALIASES.get(str(other).casefold(), ()):
                alias_match = alias_pattern.search(cell, end)
                if alias_match:
                    next_title_starts.append(alias_match.start())
        cutoff = min(next_title_starts, default=len(cell))
        segment = cell[end:cutoff]
        associated.update(set(_offering_codes_in_cell(segment, known_codes)) & allowed_codes)
    return sorted(associated)


def _rule_json(parsed, exam_type: str):
    if exam_type == "olevel":
        minimum, parts = parsed
        return {
            "examType": exam_type,
            "creditMinimum": minimum,
            "parts": [list(part) for part in parts],
        }
    if isinstance(parsed, tuple):
        return {"examType": exam_type, "crossReference": parsed[1]}
    return {"examType": exam_type, "parts": [list(part) for part in parsed]}


def _declared_olevel_credit_total(text: str) -> int | None:
    number_words = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9,
    }
    match = re.search(
        r"\b(one|two|three|four|five|six|seven|eight|nine|\d+)\b"
        r"\s*(?:\(\s*(\d+)\s*\))?[^.;]{0,36}?"
        r"(?:SSC|SSCE|O['’]?\s*Level)[^.;]{0,24}?\b(?:credit|credits|passes)",
        text,
        re.I,
    )
    if not match:
        return None
    if match.group(2):
        return int(match.group(2))
    value = match.group(1).casefold()
    return int(value) if value.isdigit() else number_words.get(value)


def _exact_unrestricted_olevel_remainder_is_matchable(text, parsed) -> bool:
    """Allow only source-explicit inclusions with genuinely unqualified slots.

    A fixed total such as five credits "including English and Economics" names
    the required subjects but puts no condition on the remaining credits. The
    parser represents those slots as a catalogue-wide O'Level choice. Do not
    apply this to "relevant/suitable" wording, category-limited remainders,
    extra pass requirements, or text without an explicit inclusion clause.
    """
    if not parsed or not isinstance(parsed, tuple) or len(parsed) != 2:
        return False
    minimum, parts = parsed
    if not isinstance(minimum, int) or not re.search(
        r"\b(?:including|to\s+include)\b", str(text or ""), re.I
    ):
        return False
    if re.search(
        r"\b(?:relevant|suitable|appropriate|related|cognate|pertinent)\b|"
        r"\bshares?\s+(?:the\s+)?block\b|"
        r"\b(?:plus|and)\s+(?:at\s+least\s+)?(?:an?\s+)?O['’]?\s*Level\s+pass\b|"
        r"\bpass\s+in\s+[A-Za-z]",
        str(text or ""),
        re.I,
    ):
        return False
    required_codes = {
        part[1] for part in parts if part[0] == "required"
    }
    broad_catalogue_remainder = set(OLEVEL_CODES) - required_codes
    broad = [
        part for part in parts
        if len(part) >= 3 and part[0] == "one_of"
        and set(part[2]) == broad_catalogue_remainder
    ]
    if len(broad) != 1:
        return False
    constrained_slots = sum(
        1 if part[0] == "required" else int(part[1])
        for part in parts if part not in broad
    )
    return int(broad[0][1]) == minimum - constrained_slots


def _safe_exact_variant(row, source_row, variant, known_names, known_codes):
    """Return an exact scoped candidate or a reason it must remain hidden."""
    source_variant = variant.get("source_variant") or {}
    source = source_variant.get("source") or {}
    text = _clean(source_variant.get("text"))
    cell = _clean(source.get("course_cell"))
    if source_variant.get("status") != "exact":
        return None, "not_exact_source_status"
    if not text or not cell:
        return None, "missing_exact_text_or_course_cell"
    if len(text) > 260:
        return None, "contaminated_or_compound_source_text"
    if re.search(r"\b(?:UTME\s+SUBJECTS?|DIRECT\s+ENTRY)\b", text, re.I):
        return None, "mixed_exam_or_direct_entry_text"
    identity_ok, identity_reason = _exact_course_identity(
        row["jamb_programme"], cell, known_names
    )
    if not identity_ok:
        return None, identity_reason
    if row["exam_type"] == "olevel" and not re.match(
        r"^(?:five|six|four|three|two|one|7|6|5|4|3|2|1)\b", text, re.I
    ):
        return None, "olevel_cell_has_no_explicit_credit_total"
    parsed = _parse(text, row["exam_type"])
    parsed_by_local_exception = False
    if parsed is None or (isinstance(parsed, tuple) and parsed[0] == "ref"):
        # The legacy parser intentionally rejects some exact brochure syntax
        # that the local-exception parser can encode (e.g. a named subject
        # plus exactly one other Arts subject). Permit only a complete,
        # layer-explicit rule from this exact source variant; never use the
        # fallback to interpret a bare relevance qualifier or open remainder.
        local = parse_local_exception(
            ("O'LEVEL: " if row["exam_type"] == "olevel" else "UTME SUBJECTS: ")
            + text
        )
        if (
            local.get("status") != "parsed"
            or local.get("exam_type") != row["exam_type"]
            or local.get("rule_scope") != "full"
        ):
            return None, "exact_cell_not_executable"
        if row["exam_type"] == "olevel":
            minimum = local.get("min_required")
            declared_minimum = _declared_olevel_credit_total(text)
            if (
                not isinstance(minimum, int)
                or declared_minimum is None
                or minimum < declared_minimum
            ):
                return None, "exact_cell_rule_not_fully_executable"
            # A single exact source cell may contain multiple qualifications
            # or programme variants. Do not silently let the local parser
            # keep just the first rule. Five-or-six credits is one alternative
            # minimum and remains safe as a lower-bound matcher rule.
            credit_mentions = re.findall(
                r"\b(?:one|two|three|four|five|six|seven|eight|nine|\d+)\b"
                r"\s*(?:\(\s*\d+\s*\))?[^.;]{0,28}?"
                r"(?:SSC|SSCE|O['â€™]?\s*Level)[^.;]{0,20}?\b(?:credit|credits|passes)",
                text,
                re.I,
            )
            if len(credit_mentions) > 1 and not re.search(
                r"\bfive\s*\(\s*5\s*\)\s*(?:or|/|and)\s*six\s*\(\s*6\s*\)",
                text,
                re.I,
            ):
                return None, "exact_cell_rule_not_fully_executable"
            parsed = (minimum, local.get("parts") or [])
        else:
            parsed = local.get("parts") or []
        parsed_by_local_exception = True
    if row["exam_type"] == "olevel" and not olevel_parts_are_matchable(text, parsed):
        if not _exact_unrestricted_olevel_remainder_is_matchable(text, parsed):
            return None, "exact_cell_rule_not_fully_executable"
    queue_codes = set(row.get("offering_institutions") or [])
    matched_codes = _institution_codes_for_identity(
        row["jamb_programme"], cell, known_names, known_codes, queue_codes
    )
    if not matched_codes:
        return None, "exact_cell_has_no_matched_institution_codes"
    candidate = {
        "scope": "institution_programme_offering",
        "jamb_programme": row["jamb_programme"],
        "exam_type": row["exam_type"],
        "raw_source_text": text,
        "parsed_rule": _rule_json(parsed, row["exam_type"]),
        "source_url": source_row.get("source_url") or row.get("source_url"),
        "source_locator": {
            key: source.get(key)
            for key in ("source_file", "pdf_page", "table_row", "course_cell")
            if source.get(key) is not None
        },
        "institution_codes": matched_codes,
        "source_accessed_date": "2026-10-08",
    }
    if parsed_by_local_exception:
        candidate["parser_basis"] = "strict_full_local_exception_fallback"
    return candidate, None


def _sociology_arts_continuation_candidates():
    """Resolve PLASU's exact O-level exception from the Sociology row on IBASS p.125.

    Federal Kashere's separately printed O-level and UTME clauses are already
    reconciled from its source-linked waiver records by the general resolver.
    """
    source_file = "Arts _ Humanities.pdf"
    source_url = _official_pdf_url(source_file)
    pages = _official_page_lookup()
    # The extracted page index uses an ampersand in this display filename;
    # source audit locators retain the original underscore spelling.
    page_125 = pages.get(("Arts & Humanities.pdf", 125), {}).get("normalized_text", "")
    if not all(fragment in page_125 for fragment in (
        "plasurequiresolevelcreditpassesin",
        "englishlanguageandthree3socialsciencesorartssubjects",
        "passinmathematics",
    )):
        return []
    course_cell = (
        "SOCIOLOGY COVENANT EVANGEL FED-KASHERE PLASU SALEM "
        "SOCIOLOGYAND ANTHROPOLGY FED-OTUOKE"
    )
    arts_social_pool = sorted(set(ARTS + SOCIAL) & set(OLEVEL_CODES))
    candidates = []
    plasu_note = (
        "PLASU requires O Level credit passes in English Language and three "
        "Social Sciences or Arts subjects, plus at least an O Level pass in Mathematics."
    )
    for programme_path in sorted(glob.glob(str(CAREER / "jamb" / "*_offerings.json"))):
        package = json.loads(Path(programme_path).read_text(encoding="utf-8"))
        for programme in package.get("programmes", []):
            if programme.get("jamb_name") != "Sociology":
                continue
            if not any(
                str(waiver.get("institution") or "").upper() == "PLASU"
                and "three (3) social sciences or arts subjects" in _clean(waiver.get("note")).lower()
                for waiver in programme.get("institution_waivers") or []
            ):
                continue
            candidates.append({
                "scope": "institution_programme_offering",
                "jamb_programme": "Sociology",
                "exam_type": "olevel",
                "raw_source_text": plasu_note,
                "parsed_rule": {
                    "examType": "olevel",
                    "creditMinimum": 4,
                    "parts": [
                        ["required", "ENG"],
                        ["one_of", 3, arts_social_pool, "olevel_distinct_credit_subjects"],
                    ],
                    "passRequiredCodes": ["MATH"],
                },
                "source_url": source_url,
                "source_locator": {
                    "source_file": source_file,
                    "pdf_page": 125,
                    "table_row": 5,
                    "course_cell": course_cell,
                    "evidence_text": plasu_note,
                    "locator_basis": "PLASU's institution-specific O-level condition is printed in the official IBASS Sociology row.",
                },
                "institution_codes": ["PLASU"],
                "source_accessed_date": "2026-10-24",
                "evidence_kind": "exact_sociology_arts_row_institution_waiver",
                "national_promotion": False,
            })
            break

    return candidates


def _existing_local_waiver_evidence(queue_rows, report, known_names, known_codes):
    """Audit already-parsed local waiver notes against exact IBASS offering cells.

    This does not change their rule. It only supplies a precise brochure row
    when the same exact programme/institution cell is present in the source
    ledger; notes without such a locator are reported separately.
    """
    targets = {(r["jamb_programme"], r["exam_type"]): r for r in queue_rows}
    exact_source_by_name_code = defaultdict(list)
    seen_cells = set()
    for source_row in report.get("rows") or []:
        name = source_row.get("jamb_name")
        if not name or not any((name, layer) in targets for layer in ("utme", "olevel")):
            continue
        for wrapper in source_row.get("source_variants") or []:
            variant = wrapper.get("source_variant") or {}
            source = variant.get("source") or {}
            cell = _clean(source.get("course_cell"))
            waiver_cell = _clean(wrapper.get("waiver_cell"))
            if variant.get("status") != "exact" or not cell or not waiver_cell:
                continue
            cell_key = (name, source.get("source_file"), source.get("pdf_page"), source.get("table_row"), cell)
            if cell_key in seen_cells:
                continue
            seen_cells.add(cell_key)
            identity_ok, _ = _exact_course_identity(name, cell, known_names)
            if not identity_ok:
                continue
            scoped_codes = _institution_codes_for_identity(
                name, cell, known_names, known_codes, known_codes
            )
            locator = {
                "source_file": source.get("source_file"),
                "pdf_page": source.get("pdf_page"),
                "table_row": source.get("table_row"),
                "course_cell": cell,
                "source_url": source_row.get("source_url") or _official_pdf_url(source.get("source_file")),
                "waiver_cell": waiver_cell,
                "source_status": variant.get("status"),
                "source_institution_codes": scoped_codes,
            }
            for code in scoped_codes:
                exact_source_by_name_code[(name, code)].append(locator)

    evidence = []
    for path in sorted(glob.glob(str(CAREER / "jamb" / "*_offerings.json"))):
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        for programme in data.get("programmes", []):
            name = programme.get("jamb_name")
            for waiver in programme.get("institution_waivers", []):
                note = _clean(waiver.get("note"))
                parsed = parse_local_exception(note)
                exam_type = parsed.get("exam_type")
                if parsed.get("status") != "parsed" or (name, exam_type) not in targets:
                    continue
                codes = waiver.get("institutions") or (
                    [waiver["institution"]] if waiver.get("institution") else []
                )
                for code in codes:
                    locators = {
                        json.dumps(loc, sort_keys=True): loc
                        for loc in exact_source_by_name_code.get((name, str(code)), [])
                    }
                    note_normalized = _normalize_evidence_text(note)
                    exact_text_match = bool(note_normalized) and any(
                        note_normalized in _normalize_evidence_text(loc.get("waiver_cell"))
                        for loc in locators.values()
                    )
                    page_locators = _exact_note_page_locators(
                        name, note, str(code), frozenset(known_names)
                    )
                    for locator in page_locators:
                        locators[json.dumps(locator, sort_keys=True)] = locator
                    exact_page_match = bool(page_locators)
                    note_codes = set(_offering_codes_in_cell(note, known_codes))
                    source_codes = set().union(*(
                        set(loc.get("source_institution_codes") or [])
                        for loc in locators.values()
                    )) if locators else set()
                    institution_scope_match = (
                        str(code) in note_codes
                        or (not note_codes and (
                            source_codes == {str(code)} or exact_page_match
                        ))
                    )
                    if (exact_text_match or exact_page_match) and institution_scope_match:
                        link_status = "exact_requirement_text_and_institution_scope"
                    elif locators:
                        link_status = "course_cell_only_requirement_not_verified"
                    else:
                        link_status = "no_exact_source_cell_locator"
                    evidence.append({
                        "jamb_programme": name,
                        "exam_type": exam_type,
                        "institution_code": str(code),
                        "raw_note": note,
                        "parsed_rule": {
                            "examType": exam_type,
                            "ruleScope": parsed.get("rule_scope"),
                            "minimumRequired": parsed.get("min_required"),
                            "parts": [list(part) for part in parsed.get("parts", [])],
                        },
                        "source_accessed_date": "2026-10-08",
                        "source_link_status": link_status,
                        "source_exam_type_from_note": parsed.get("exam_type"),
                        "source_rule_scope_from_note": parsed.get("rule_scope"),
                        "source_note_text_verified": exact_text_match or exact_page_match,
                        "source_url": next((
                            loc.get("source_url") or _official_pdf_url(loc.get("source_file"))
                            for loc in locators.values()
                            if loc.get("source_file")
                        ), None),
                        "source_locators": [
                            {
                                **loc,
                                "source_url": loc.get("source_url") or _official_pdf_url(loc.get("source_file")),
                            }
                            for loc in locators.values()
                        ],
                    })
    return evidence


def _exact_scoped_waiver_candidates(queue_rows, known_names, linked_evidence=()):
    """Convert only exact, full, layer-explicit IBASS waiver rules to candidates."""
    targets = {
        (row["jamb_programme"], row["exam_type"]): row for row in queue_rows
    }
    candidates_by_row = defaultdict(list)
    for path in sorted(glob.glob(str(CAREER / "jamb" / "*_offerings.json"))):
        package = json.loads(Path(path).read_text(encoding="utf-8"))
        for programme in package.get("programmes", []):
            name = programme.get("jamb_name")
            if not name:
                continue
            programme_targets = [
                layer for target_name, layer in targets if target_name == name
            ]
            if not programme_targets:
                continue
            for note_row in programme.get("institution_waivers") or []:
                note = _clean(note_row.get("note"))
                raw_codes = note_row.get("institutions") or note_row.get("institution")
                codes = raw_codes if isinstance(raw_codes, list) else [raw_codes]
                for code in codes:
                    if not code:
                        continue
                    locators = _exact_note_page_locators(
                        name, note, str(code), frozenset(known_names)
                    )
                    if not locators:
                        continue
                    # Explicit O'Level credit language wins over an incidental
                    # reference to UTME entry requirements in the same sentence.
                    if re.search(r"(?:O['’]?\s*Level|SSCE|SSC credit|credit passes)", note, re.I):
                        note_layer = "olevel"
                    elif re.search(r"UTME\s+SUBJECTS?|UTME\s+(?:requires|accepts)", note, re.I):
                        note_layer = "utme"
                    else:
                        continue
                    if note_layer not in programme_targets:
                        continue
                    marker = "O'LEVEL: " if note_layer == "olevel" else "UTME SUBJECTS: "
                    parsed = parse_local_exception(marker + note)
                    if (
                        parsed.get("status") != "parsed"
                        or parsed.get("exam_type") != note_layer
                        or parsed.get("rule_scope") != "full"
                    ):
                        continue
                    if note_layer == "olevel":
                        declared_minimum = _declared_olevel_credit_total(note)
                        if (
                            declared_minimum is None
                            or parsed.get("min_required", 0) < declared_minimum
                        ) and not re.search(
                            r"\b(?:five|six|four|three|two|one|7|6|5|4|3|2|1)\b.{0,24}\b(?:SSC|SSCE|credit\s+passes|O['’]?\s*Level)",
                            note,
                            re.I,
                        ):
                            continue
                        parsed_olevel = (parsed["min_required"], parsed["parts"])
                        if not olevel_parts_are_matchable(note, parsed_olevel) and not _exact_unrestricted_olevel_remainder_is_matchable(note, parsed_olevel):
                            continue
                        national_minimum = _declared_olevel_credit_total(
                            targets[(name, note_layer)].get("source_text", "")
                        )
                        if national_minimum and parsed["min_required"] < national_minimum:
                            # A two-credit clause is often a subset restriction,
                            # not a replacement for the national five-credit
                            # requirement. Keep it out of the complete matcher
                            # rule until the source explicitly states otherwise.
                            continue
                    locator = locators[0]
                    candidates_by_row[(name, note_layer)].append({
                        "scope": "institution_programme_offering",
                        "jamb_programme": name,
                        "exam_type": note_layer,
                        "raw_source_text": note,
                        "parsed_rule": {
                            "examType": note_layer,
                            "ruleScope": parsed["rule_scope"],
                            "minimumRequired": parsed["min_required"],
                            "parts": [list(part) for part in parsed["parts"]],
                        },
                        "source_url": locator["source_url"],
                        "source_locator": {
                            "source_file": locator["source_file"],
                            "pdf_page": locator["pdf_page"],
                            "evidence_text": note,
                            "locator_basis": locator["evidence_basis"],
                        },
                        "institution_codes": [str(code)],
                        "source_accessed_date": "2026-10-08",
                        "evidence_kind": "exact_institution_waiver_text",
                        "national_promotion": False,
                    })

    # Some exact waiver notes are embedded in the source-rule ledger's
    # `waiver_cell` rather than appearing as a standalone PDF text run. When
    # the waiver text exactly matches that source cell, and the same source
    # row independently identifies the programme and institution, retain the
    # parsed rule at that offering scope. This is not an OCR/fuzzy match.
    for evidence in linked_evidence:
        name = evidence.get("jamb_programme")
        layer = evidence.get("exam_type")
        key = (name, layer)
        if (
            evidence.get("source_link_status")
            != "exact_requirement_text_and_institution_scope"
            or key not in targets
            or evidence.get("source_rule_scope_from_note") != "full"
        ):
            continue
        note = _clean(evidence.get("raw_note"))
        parsed = parse_local_exception(
            ("O'LEVEL: " if layer == "olevel" else "UTME SUBJECTS: ") + note
        )
        if (
            parsed.get("status") != "parsed"
            or parsed.get("exam_type") != layer
            or parsed.get("rule_scope") != "full"
        ):
            continue
        if layer == "olevel":
            parsed_olevel = (parsed["min_required"], parsed["parts"])
            if not olevel_parts_are_matchable(note, parsed_olevel) and not _exact_unrestricted_olevel_remainder_is_matchable(note, parsed_olevel):
                continue
            national_minimum = _declared_olevel_credit_total(
                targets[key].get("source_text", "")
            )
            if national_minimum and parsed["min_required"] < national_minimum:
                continue
        locators = [
            locator for locator in evidence.get("source_locators", [])
            if locator.get("source_file") and locator.get("pdf_page") is not None
        ]
        if not locators:
            continue
        locator = locators[0]
        source_url = evidence.get("source_url") or locator.get("source_url")
        candidates_by_row[key].append({
            "scope": "institution_programme_offering",
            "jamb_programme": name,
            "exam_type": layer,
            "raw_source_text": note,
            "parsed_rule": {
                "examType": layer,
                "ruleScope": parsed["rule_scope"],
                "minimumRequired": parsed["min_required"],
                "parts": [list(part) for part in parsed["parts"]],
            },
            "source_url": source_url,
            "source_locator": {
                "source_file": locator.get("source_file"),
                "pdf_page": locator.get("pdf_page"),
                "table_row": locator.get("table_row"),
                "evidence_text": note,
                "locator_basis": "exact waiver text matches source-rule waiver cell; title and institution share the source row",
            },
            "institution_codes": [str(evidence["institution_code"])],
            "source_accessed_date": evidence.get("source_accessed_date") or "2026-10-08",
            "evidence_kind": "exact_waiver_cell_text_and_institution_scope",
            "national_promotion": False,
        })

    # A duplicate note may occur in multiple extracted rows/pages. Preserve
    # distinct evidence, but do not let duplicate identical rules create a
    # false conflict for the same university/programme.
    result = {}
    for key, candidates in candidates_by_row.items():
        unique = {}
        for candidate in candidates:
            dedupe_key = (
                tuple(candidate["institution_codes"]),
                json.dumps(candidate["parsed_rule"], sort_keys=True),
            )
            existing = unique.get(dedupe_key)
            if existing is None:
                unique[dedupe_key] = candidate
            else:
                existing["duplicate_source_locators"] = existing.get(
                    "duplicate_source_locators", []
                ) + [candidate["source_locator"]]
        result[key] = list(unique.values())
    return result


def _scope_conflicting_institutions(candidates):
    """Mark only institutions with competing rules; disjoint routes are valid."""
    conflicts = [set() for _ in candidates]
    for left_index, left in enumerate(candidates):
        left_codes = set(left.get("institution_codes") or [])
        for right_index in range(left_index + 1, len(candidates)):
            right_codes = set(candidates[right_index].get("institution_codes") or [])
            overlap = left_codes & right_codes
            if overlap:
                conflicts[left_index].update(overlap)
                conflicts[right_index].update(overlap)
    for candidate, conflicting_codes in zip(candidates, conflicts):
        if conflicting_codes:
            candidate["conflicting_institution_codes"] = sorted(conflicting_codes)
        else:
            candidate.pop("conflicting_institution_codes", None)
    return "scoped_conflict" if any(conflicts) else "scoped_exact"


def main() -> int:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    report = json.loads(SOURCE_RULES.read_text(encoding="utf-8"))
    known_names, known_codes = _catalogue()
    source_rows = defaultdict(list)
    for source_row in report.get("rows") or []:
        source_rows[(source_row.get("jamb_name"), source_row.get("layer"))].append(source_row)

    queue_rows = list(queue.get("rows") or [])
    queue_keys = {
        (row.get("jamb_programme"), row.get("exam_type"))
        for row in queue_rows
    }
    # The canonical Sociology baseline parses successfully, so the older
    # unresolved-wording queue does not contain its exact Arts-brochure
    # O'level variation. Include that exact offering variant explicitly.
    sociology_olevel_key = ("Sociology", "olevel")
    sociology_arts_locator = ("Arts _ Humanities.pdf", 125, 5)
    if sociology_olevel_key not in queue_keys:
        sociology_programme = None
        sociology_arts_institutions = []
        sociology_arts_url = None
        for path in sorted(glob.glob(str(CAREER / "jamb" / "*_offerings.json"))):
            package = json.loads(Path(path).read_text(encoding="utf-8"))
            for programme in package.get("programmes", []):
                if programme.get("jamb_name") != "Sociology":
                    continue
                if path.endswith("arts_hum_offerings.json") and programme.get("institutions"):
                    sociology_arts_institutions = list(programme["institutions"])
                    sociology_arts_url = programme.get("source_url")
                if not sociology_programme or (
                    programme.get("olevel_requirement")
                    and not sociology_programme.get("olevel_requirement")
                ):
                    sociology_programme = programme
        matching_variant = any(
            source_row.get("jamb_name") == "Sociology"
            and source_row.get("layer") == "olevel"
            and any(
                (variant.get("source_variant") or {}).get("status") == "exact"
                and (
                    (variant.get("source_variant") or {}).get("source") or {}
                ).get("source_file") == sociology_arts_locator[0]
                and (
                    (variant.get("source_variant") or {}).get("source") or {}
                ).get("pdf_page") == sociology_arts_locator[1]
                and (
                    (variant.get("source_variant") or {}).get("source") or {}
                ).get("table_row") == sociology_arts_locator[2]
                for variant in source_row.get("source_variants") or []
            )
            for source_row in report.get("rows") or []
        )
        if sociology_programme and matching_variant:
            queue_rows.append({
                "jamb_programme": "Sociology",
                "exam_type": "olevel",
                "source_text": sociology_programme.get("olevel_requirement"),
                "source_url": sociology_arts_url or sociology_programme.get("source_url"),
                "source_locator": sociology_programme.get("source_locator"),
                "offering_institutions": [
                    code for code in (
                        sociology_arts_institutions
                        or sociology_programme.get("institutions")
                        or []
                    )
                    if code not in {"PLASU", "FED-KASHERE"}
                ],
                "_source_variant_locator_allowlist": [sociology_arts_locator],
            })

    resolved = []
    residual = []
    rejection_counts = Counter()
    for row in queue_rows:
        candidates = []
        row_reasons = Counter()
        for source_row in source_rows.get((row["jamb_programme"], row["exam_type"]), []):
            for variant in source_row.get("source_variants") or []:
                allowed_locators = row.get("_source_variant_locator_allowlist")
                variant_source = (variant.get("source_variant") or {}).get("source") or {}
                if allowed_locators and (
                    variant_source.get("source_file"),
                    variant_source.get("pdf_page"),
                    variant_source.get("table_row"),
                ) not in {tuple(locator) for locator in allowed_locators}:
                    continue
                candidate, reason = _safe_exact_variant(
                    row, source_row, variant, known_names, known_codes
                )
                if candidate:
                    candidates.append(candidate)
                else:
                    row_reasons[reason] += 1
        if (row["jamb_programme"], row["exam_type"]) == ("Sociology", "olevel"):
            candidates.extend(_sociology_arts_continuation_candidates())
        # Deduplicate identical executable rules while preserving every source
        # locator. Conflicting exact cells remain scoped-conflict, never national.
        unique_rules = {}
        for candidate in candidates:
            rule_key = json.dumps(candidate["parsed_rule"], sort_keys=True)
            existing = unique_rules.get(rule_key)
            if existing is None:
                unique_rules[rule_key] = candidate
                continue
            existing["institution_codes"] = sorted(
                set(existing.get("institution_codes") or [])
                | set(candidate.get("institution_codes") or [])
            )
            locators = existing.setdefault("source_locators", [existing["source_locator"]])
            if candidate.get("source_locator") not in locators:
                locators.append(candidate["source_locator"])
            if candidate.get("parser_basis"):
                existing["parser_basis"] = candidate["parser_basis"]
        if unique_rules:
            candidates = list(unique_rules.values())
            status = _scope_conflicting_institutions(candidates)
            resolved.append({
                **{key: row.get(key) for key in (
                    "jamb_programme", "exam_type", "source_text", "source_url",
                    "source_locator", "offering_institutions",
                )},
                "resolution_status": status,
                "candidates": candidates,
                "national_promotion": False,
            })
        else:
            reason = row_reasons.most_common(1)[0][0] if row_reasons else "no_source_variant"
            rejection_counts[reason] += 1
            residual.append({**row, "residual_reason": reason})

    local_waivers = _existing_local_waiver_evidence(
        queue_rows, report, known_names, known_codes
    )
    waiver_candidates = _exact_scoped_waiver_candidates(
        queue_rows, known_names, local_waivers
    )
    queue_by_key = {
        (row["jamb_programme"], row["exam_type"]): row
        for row in queue_rows
    }
    resolved_keys = {(row["jamb_programme"], row["exam_type"]) for row in resolved}
    residual_by_key = {
        (row["jamb_programme"], row["exam_type"]): row for row in residual
    }
    for key, candidates in waiver_candidates.items():
        if not candidates:
            continue
        wrapper = next((row for row in resolved if (row["jamb_programme"], row["exam_type"]) == key), None)
        if wrapper is None:
            wrapper = {
                **{field: queue_by_key[key].get(field) for field in (
                    "jamb_programme", "exam_type", "source_text", "source_url",
                    "source_locator", "offering_institutions",
                )},
                "resolution_status": "scoped_exact",
                "candidates": [],
                "national_promotion": False,
            }
            resolved.append(wrapper)
            resolved_keys.add(key)
            residual_by_key.pop(key, None)
        existing_rule_keys = {
            (
                tuple(candidate.get("institution_codes") or []),
                json.dumps(candidate.get("parsed_rule"), sort_keys=True),
            )
            for candidate in wrapper["candidates"]
        }
        for candidate in candidates:
            rule_key = (
                tuple(candidate["institution_codes"]),
                json.dumps(candidate["parsed_rule"], sort_keys=True),
            )
            if rule_key not in existing_rule_keys:
                wrapper["candidates"].append(candidate)
                existing_rule_keys.add(rule_key)
        wrapper["resolution_sources"] = sorted({
            *(wrapper.get("resolution_sources") or []),
            "exact_institution_waiver_text",
        })
        wrapper["national_promotion"] = False
    residual = list(residual_by_key.values())
    linked_local = [
        row for row in local_waivers
        if row["source_link_status"] == "exact_requirement_text_and_institution_scope"
    ]
    payload = {
        "generated_by": str(Path(__file__).relative_to(ROOT)).replace("\\", "/"),
        "scope": "Exact IBASS source-cell resolution for unresolved wording plus the explicitly included matchable Sociology O'level offering variant",
        "national_promotion_policy": "never promote offering_variant evidence into a national rule",
        "counts": {
            "input_rows": len(queue_rows),
            "scoped_exact_rows": sum(r["resolution_status"] == "scoped_exact" for r in resolved),
            "scoped_conflict_rows": sum(r["resolution_status"] == "scoped_conflict" for r in resolved),
            "residual_rows": len(residual),
            "residual_by_reason": dict(rejection_counts),
            "existing_parsed_local_waiver_rows": len(local_waivers),
            "existing_local_waiver_programme_layer_rows": len({
                (row["jamb_programme"], row["exam_type"]) for row in local_waivers
            }),
            "existing_local_waiver_exact_source_linked_rows": len(linked_local),
            "existing_local_waiver_exact_pdf_text_page_rows": sum(
                row.get("source_note_text_verified", False) for row in local_waivers
            ),
            "exact_layered_executable_waiver_rows_added": sum(
                len(candidates) for candidates in waiver_candidates.values()
            ),
            "exact_waiver_programme_layer_rows_added": len(waiver_candidates),
            "existing_local_waiver_layer_mismatch_rows": sum(
                row.get("source_exam_type_from_note") != row.get("exam_type")
                for row in local_waivers
                if row.get("source_exam_type_from_note")
            ),
            "existing_local_waiver_course_cell_only_unverified_rows": sum(
                row["source_link_status"] == "course_cell_only_requirement_not_verified"
                for row in local_waivers
            ),
            "existing_local_waiver_without_exact_source_link_rows": sum(
                row["source_link_status"] == "no_exact_source_cell_locator"
                for row in local_waivers
            ),
        },
        "resolved_scoped_rows": resolved,
        "residual_rows": residual,
        "existing_local_waiver_evidence": local_waivers,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], indent=2))
    print(f"-> {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
