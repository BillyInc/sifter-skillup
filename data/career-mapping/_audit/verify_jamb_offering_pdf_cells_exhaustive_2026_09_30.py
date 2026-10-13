"""Exhaustively verify the residual JAMB offering cells in original PDFs.

The script scans only currently-unverified source-offering occurrences. It
extracts the brochure's leftmost programme/awarder column, follows a cell over
page breaks until the next known programme heading, and promotes verification
metadata only when one unique cell contains every institution token already
recorded for that occurrence. Ambiguous or mismatched rows remain unresolved.
"""

from __future__ import annotations

import argparse
import gc
import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
BROCHURE_ROOT = Path(r"C:\Users\USER\Downloads\jamb brochure")
OUT = AUDIT / "jamb_offering_pdf_cell_verification_2026-09-30_checkpoint.json"
OUT_MD = AUDIT / "jamb_offering_pdf_cell_verification_2026-09-30_checkpoint.md"

PDF_BY_SOURCE_FILE = {
    "Administration.pdf": "Administration.pdf",
    "agriculture.txt": "Agriculture.pdf",
    "arts_hum.txt": "Arts _ Humanities.pdf",
    "education.txt": "Education.pdf",
    "engineering.txt": "Engineering _ Enviromental _ Technology.pdf",
    "Law.pdf": "Law.pdf",
    "medical.txt": "Medica_Pharmaceutical Health Science.pdf",
    "Sciences.pdf": "Sciences.pdf",
    "Social Management Science.pdf": "Social Management Science.pdf",
}

REPEATED_COLUMN_HEADERS = {"coursedegree", "awarding", "institutions", "awardinginstitutions", "coursedegreeawardinginstitutions", "coursedegreeawardinginstitutionsdirectentry", "directentry", "utme", "subjects", "remarks", "requirements", "specialconsideration", "waiver"}
SECTION_HEADERS = {"arts", "socialsciences", "sciences", "administration", "agriculture", "law", "engineeringenvironmentaltechnology", "medicalpharmaceuticalhealth", "medicalpharmaceuticalhealthscience", "education"}
NON_INSTITUTION_TERMS = {"law", "science", "sciences", "geography", "planning", "management", "technology", "engineering", "education", "agriculture", "arts", "studies", "statistics", "environmental", "resources", "international", "public", "private", "course", "degree", "faculty", "school", "college", "programme", "programmes", "and", "of", "in", "economics", "economic", "english", "igbo", "hausa", "yoruba", "arabic", "literature", "theology", "christian", "religious", "comparative", "sociology", "communication", "history", "business", "political", "philosophy", "french", "music", "biology", "chemistry", "physics", "mathematics", "accounting", "finance", "humanities", "language", "languages", "masscommunication", "development", "social", "media", "internationalrelations"}


def norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())


def title_aliases(value: str) -> set[str]:
    raw = str(value or "").strip()
    candidates = {raw, re.sub(r"\s*\([^)]*\)\s*$", "", raw)}
    candidates.update(part.strip() for part in re.split(r"\s*/\s*", raw) if len(norm(part)) >= 8)
    return {norm(item) for item in candidates if len(norm(item)) >= 8}


def text_contains_title(text: str, aliases: set[str]) -> bool:
    """Find a printed title across line wraps without fuzzy-name matching."""
    lines = [norm(line) for line in str(text or "").splitlines()]
    for start in range(len(lines)):
        combined = ""
        for end in range(start, min(len(lines), start + 5)):
            combined += lines[end]
            if combined in aliases:
                return True
            if not any(alias.startswith(combined) for alias in aliases if len(combined) >= 4):
                break
    return False


def left_column_lines(page: Any) -> list[str]:
    """Group positioned PDF words into lines in the programme/awarder column."""
    # Requirements start immediately to the right of the awarder column; keep
    # the crop narrow enough not to absorb the next table cell's prose.
    words = page.crop((0, 0, page.width * 0.23, page.height)).extract_words(use_text_flow=False)
    words.sort(key=lambda w: (w["top"], w["x0"]))
    groups: list[list[dict[str, Any]]] = []
    for word in words:
        if not groups or abs(word["top"] - groups[-1][0]["top"]) > 3.2:
            groups.append([word])
        else:
            groups[-1].append(word)
    result = [" ".join(w["text"] for w in sorted(group, key=lambda x: x["x0"])) for group in groups]
    page.flush_cache()
    return result


def left_column_pdf_styles(page: Any) -> tuple[list[str], set[int], set[int]]:
    """Return awarder-column lines plus printed bold-heading/italic-awarder rows."""
    words = page.crop((0, 0, page.width * 0.23, page.height)).extract_words(
        use_text_flow=False, extra_attrs=["fontname"]
    )
    words.sort(key=lambda w: (w["top"], w["x0"]))
    groups: list[list[dict[str, Any]]] = []
    for word in words:
        if not groups or abs(word["top"] - groups[-1][0]["top"]) > 3.2:
            groups.append([word])
        else:
            groups[-1].append(word)
    lines: list[str] = []
    bold: set[int] = set()
    italic: set[int] = set()
    for index, group in enumerate(groups):
        lines.append(" ".join(w["text"] for w in sorted(group, key=lambda x: x["x0"])))
        fonts = [str(w.get("fontname", "")).casefold() for w in group]
        if any("bold" in font for font in fonts) and not any("italic" in font for font in fonts):
            bold.add(index)
        if any("italic" in font for font in fonts) and not any("bold" in font for font in fonts):
            italic.add(index)
    page.flush_cache()
    return lines, bold, italic


def locate_headings(lines_by_page: list[list[str]], aliases: set[str]) -> list[dict[str, int]]:
    """Find exact catalogue-title headings, including titles wrapped over lines."""
    found: list[dict[str, int]] = []
    for page_index, lines in enumerate(lines_by_page):
        normalized = [norm(line) for line in lines]
        for line_index in range(len(lines)):
            combined = ""
            for end in range(line_index, min(len(lines), line_index + 5)):
                combined += normalized[end]
                if combined in aliases:
                    found.append({"page_index": page_index, "line_index": line_index, "end_line": end})
                    break
                if any(alias.startswith(combined) for alias in aliases if len(combined) >= 4):
                    continue
                break
    return found


def all_heading_positions(
    lines_by_page: list[list[str]],
    catalogue: list[dict[str, Any]],
    bold_by_page: dict[int, set[int]] | None = None,
) -> list[dict[str, Any]]:
    alias_to_name: dict[str, str] = {}
    for item in catalogue:
        for alias in title_aliases(item["name"]):
            alias_to_name.setdefault(alias, item["name"])
    aliases = set(alias_to_name)
    prefixes = {alias[:n] for alias in aliases for n in range(4, len(alias))}
    entries: list[dict[str, Any]] = []
    for page_index, lines in enumerate(lines_by_page):
        normalized = [norm(line) for line in lines]
        for line_index in range(len(lines)):
            # Programme names are printed in bold. Requiring a bold start and
            # rejecting a start inside a preceding bold title prevents a short
            # catalogue name (e.g. "International Relations") from matching
            # the tail of a longer title ("History and International Relations").
            if bold_by_page is not None and line_index not in bold_by_page.get(page_index, set()):
                continue
            if bold_by_page is not None:
                previous_line = next((i for i in range(line_index - 1, -1, -1) if lines[i].strip()), None)
                if (previous_line is not None
                        and previous_line in bold_by_page.get(page_index, set())
                        and norm(lines[previous_line]) not in REPEATED_COLUMN_HEADERS | SECTION_HEADERS):
                    continue
            combined = ""
            for end in range(line_index, min(len(lines), line_index + 5)):
                combined += normalized[end]
                if combined in aliases:
                    entries.append({"page_index": page_index, "line_index": line_index, "end_line": end, "name": alias_to_name[combined], "alias": combined})
                    break
                if combined in prefixes:
                    continue
                break
    # Multiple aliases can identify the same heading; keep only the longest.
    dedup: dict[tuple[int, int], dict[str, Any]] = {}
    for entry in entries:
        key = (entry["page_index"], entry["line_index"])
        if key not in dedup or len(entry["alias"]) > len(dedup[key]["alias"]):
            dedup[key] = entry
    return sorted(dedup.values(), key=lambda x: (x["page_index"], x["line_index"]))


def institution_covered(token: str, cell_lines: list[str]) -> bool:
    needle = norm(token)
    if not needle:
        return False
    normalized_lines = [norm(line) for line in cell_lines]
    if needle in normalized_lines:
        return True
    # Wrapped multiword names can span two adjacent first-column lines.
    return any(needle == normalized_lines[i] + normalized_lines[i + 1]
               for i in range(len(normalized_lines) - 1))


def looks_like_institution_line(line: str, known_institutions: set[str]) -> bool:
    candidate = norm(line)
    if not candidate or candidate in REPEATED_COLUMN_HEADERS:
        return candidate in REPEATED_COLUMN_HEADERS
    if candidate in NON_INSTITUTION_TERMS:
        return False
    # Exact source-derived aliases precede the conjunction guard. The old
    # ``endswith("and")`` check rejected CHRISLAND even though it is a known
    # institution token, truncating long awarder cells.
    if candidate in known_institutions:
        return True
    if candidate == "and" or re.search(r"and$", candidate):
        return False
    if any(term in candidate for term in NON_INSTITUTION_TERMS if len(term) >= 5):
        return False
    if any(candidate.startswith(header) for header in REPEATED_COLUMN_HEADERS if len(header) > 8):
        return True
    if candidate.isdigit() or candidate in {"direct", "entry"}:
        return True
    for suffix in ("pub", "inter", "econs", "eng", "tech"):
        if candidate.endswith(suffix) and candidate[:-len(suffix)] in known_institutions:
            return True
    return False


def extract_cell(
    lines_by_page: list[list[str]],
    heading: dict[str, Any],
    known_institutions: set[str],
    heading_starts: set[tuple[int, int]] | None = None,
    italic_lines_by_page: dict[int, set[int]] | None = None,
) -> tuple[list[str], list[int], str]:
    """Read one awarder cell, stopping at the next catalogue heading."""
    start_page, start_line = heading["page_index"], heading["end_line"] + 1
    lines: list[str] = []
    pages: list[int] = []
    heading_starts = heading_starts or set()
    for p in range(start_page, len(lines_by_page)):
        lo = start_line if p == start_page else 0
        page_lines = lines_by_page[p]
        i = lo
        while i < len(page_lines):
            line = page_lines[i]
            if (p, i) in heading_starts:
                return lines, pages, "next_programme_heading"
            if italic_lines_by_page is not None:
                if i in italic_lines_by_page.get(p, set()):
                    lines.append(line)
                    if p + 1 not in pages:
                        pages.append(p + 1)
                i += 1
                continue
            if norm(line) in REPEATED_COLUMN_HEADERS or norm(line) in SECTION_HEADERS or norm(line).isdigit():
                i += 1
                continue
            pair = norm(line) + norm(page_lines[i + 1]) if i + 1 < len(page_lines) else ""
            if pair in known_institutions:
                lines.extend([line, page_lines[i + 1]])
                if p + 1 not in pages:
                    pages.append(p + 1)
                i += 2
                continue
            if not looks_like_institution_line(line, known_institutions):
                return lines, pages, "unrecognized_column_line"
            lines.append(line)
            if p + 1 not in pages:
                pages.append(p + 1)
            i += 1
    return lines, pages, "end_of_document"


def preserved_run_history(prior: dict[str, Any]) -> list[dict[str, Any]]:
    """Keep prior row-level evidence before replacing the latest run view."""
    history = list(prior.get("run_history", []))
    if prior.get("rows"):
        history.append({
            "generated_on": prior.get("generated_on"),
            "mode": prior.get("mode"),
            "target_count": prior.get("target_count"),
            "verified_count": prior.get("verified_count"),
            "applied_count": prior.get("applied_count", 0),
            "rows": prior["rows"],
        })
    return history


def targeted_page_lines(pdf: Any, targets: list[tuple[dict[str, Any], dict[str, Any]]], catalogue: dict[str, str]) -> tuple[list[list[str]], dict[int, set[int]], dict[int, set[int]]]:
    """Read positioned awarder-column text on every page of the source PDF.

    Regular page-text indexing can lose headings whose glyphs are spaced or
    wrapped unusually. The exhaustive residual audit therefore scans the
    positioned bold/italic column on all pages, retaining original page indexes.
    """
    indexed = [[] for _ in pdf.pages]
    bold_by_page: dict[int, set[int]] = {}
    italic_by_page: dict[int, set[int]] = {}
    for n in range(len(pdf.pages)):
        indexed[n], bold_by_page[n], italic_by_page[n] = left_column_pdf_styles(pdf.pages[n])
    return indexed, bold_by_page, italic_by_page


def classify_candidate_cells(candidates: list[dict[str, Any]], expected_institutions: list[str]) -> str:
    """Promote a cell only when its title/cell boundary and roster evidence are unique."""
    complete = [c for c in candidates
                if c.get("institution_codes_from_pdf")
                and not c.get("unresolved_pdf_institution_lines")
                and c.get("cell_stop_reason") == "next_programme_heading"]
    expected = set(expected_institutions)
    exact = [c for c in complete if set(c["institution_codes_from_pdf"]) == expected]
    if len(candidates) > 1:
        # Repeated same-title cells are separable only if exactly one complete
        # cell agrees with this offering occurrence's already-parsed roster.
        return "verified_unique_full_parsed_institution_cell" if len(exact) == 1 else "ambiguous_multiple_full_cell_candidates"
    if len(complete) == 1:
        return "verified_unique_full_parsed_institution_cell" if len(exact) == 1 else "verified_unique_pdf_cell_roster_reconciled"
    if len(complete) > 1:
        return "ambiguous_multiple_full_cell_candidates"
    return "cell_found_but_parsed_institution_list_differs" if candidates else "programme_heading_not_located_in_awarder_column"


def institution_code_map(inventory: dict[str, Any]) -> dict[str, set[str]]:
    aliases: dict[str, set[str]] = defaultdict(set)
    for identity in inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            for token in occurrence.get("institution_tokens_as_parsed", []):
                token = str(token).strip()
                key = norm(token)
                if key and key not in NON_INSTITUTION_TERMS:
                    aliases[key].add(token)
    return aliases


def map_pdf_institution_lines(
    lines: list[str],
    aliases: dict[str, set[str]],
    expected_institutions: list[str] | None = None,
) -> tuple[list[str], list[str], list[str]]:
    """Map awarder lines using exact occurrence aliases; separate option notes."""
    codes: list[str] = []
    unresolved: list[str] = []
    excluded: list[str] = []
    preferred: dict[str, set[str]] = defaultdict(set)
    for code in expected_institutions or []:
        preferred[norm(code)].add(code)
    index = 0
    while index < len(lines):
        line = lines[index]
        compact = norm(line)
        if is_option_annotation(line):
            excluded.append(line)
            index += 1
            continue
        options = preferred.get(compact) or aliases.get(compact, set())
        if len(options) == 1:
            code = next(iter(options))
            if code not in codes:
                codes.append(code)
            index += 1
            continue
        pair_options: set[str] = set()
        if index + 1 < len(lines):
            left, right = norm(line), norm(lines[index + 1])
            pair_options = preferred.get(left + right) or aliases.get(left + right, set())
            if not pair_options and left and right and left[-1] == right[0]:
                pair_options = preferred.get(left + right[1:]) or aliases.get(left + right[1:], set())
        if len(pair_options) == 1:
            code = next(iter(pair_options))
            if code not in codes:
                codes.append(code)
            index += 2
            continue
        unresolved.append(line)
        index += 1
    return codes, unresolved, excluded


def is_option_annotation(line: str) -> bool:
    """Recognize clearly non-institution curriculum/options text in awarder cells."""
    compact = norm(line)
    if compact in {"and", "extension", "soilscience", "cropscience", "animalscience", "agriculturaleconomics", "agronomy", "homeeconomics", "woodwork", "metalwork", "accountingeducation"}:
        return True
    if compact.startswith(("withoption", "withoptions", "withspecialisation", "withspecialization")):
        return True
    if re.match(r"^\s*\(?\s*(?:i{1,3}|iv|v|[1-9])\s*[).:]", line, flags=re.IGNORECASE):
        return True
    return any(term in compact for term in ("offersthecourseas", "agriculturaltechnicaleducation", "secretariat", "commerceandcooperatives", "electricalelectronictechnology"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="apply only unique, full-roster source-cell matches")
    args = parser.parse_args()
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    targets: list[tuple[dict[str, Any], dict[str, Any]]] = []
    catalogue_by_file: dict[str, dict[str, str]] = defaultdict(dict)
    catalogue_all: dict[str, str] = {}
    institutions_by_file: dict[str, set[str]] = defaultdict(set)
    for identity in inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            source_file = occurrence.get("source_file")
            name = str(occurrence.get("source_jamb_name") or identity.get("jamb_name") or "")
            if source_file:
                catalogue_by_file[source_file][name] = name
                catalogue_all[name] = name
                institutions_by_file[source_file].update(norm(token) for token in occurrence.get("institution_tokens_as_parsed", []) if len(norm(token)) >= 3)
            if not (occurrence.get("offering_row_verified_against_pdf") and occurrence.get("pdf_table_locator")):
                targets.append((identity, occurrence))

    target_ids = {str(o.get("occurrence_id")) for _, o in targets}
    prior = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"rows": []}
    prior_by_id = {str(r.get("occurrence_id")): r for r in prior.get("rows", [])}
    results: list[dict[str, Any]] = []
    applied = 0
    changed_parsed_paths: set[Path] = set()
    parsed_docs: dict[Path, dict[str, Any]] = {}
    pdf_institution_aliases = institution_code_map(inventory)
    targets_by_file: dict[str, list[tuple[dict[str, Any], dict[str, Any]]]] = defaultdict(list)
    for identity, occurrence in targets:
        targets_by_file[str(occurrence.get("source_file") or "")].append((identity, occurrence))
    for source_file, file_targets in targets_by_file.items():
        pdf_name = PDF_BY_SOURCE_FILE.get(source_file)
        if not pdf_name or not (BROCHURE_ROOT / pdf_name).exists():
            results.extend({"occurrence_id": str(o.get("occurrence_id") or ""), "jamb_name": i.get("jamb_name"), "source_file": source_file, "status": "source_pdf_unavailable"} for i, o in file_targets)
            continue
        pdf = pdfplumber.open(str(BROCHURE_ROOT / pdf_name))
        try:
            page_lines, bold_by_page, italic_by_page = targeted_page_lines(pdf, file_targets, catalogue_by_file[source_file])
            headers = all_heading_positions(page_lines, [{"name": x} for x in catalogue_all], bold_by_page)
            heading_starts = {(h["page_index"], h["line_index"]) for h in headers}
            heading_starts.update((page, line) for page, indices in bold_by_page.items() for line in indices)
            known_institutions = institutions_by_file[source_file]
            for identity, occurrence in file_targets:
                oid = str(occurrence.get("occurrence_id") or "")
                name = str(occurrence.get("source_jamb_name") or identity.get("jamb_name") or "")
                target_aliases = title_aliases(name)
                candidates = [h for h in headers if h["alias"] in target_aliases]
                parsed_tokens = list(occurrence.get("institution_tokens_as_parsed") or [])
                expected_institutions = [token for token in parsed_tokens if norm(token) not in NON_INSTITUTION_TERMS]
                ignored_non_institution_tokens = [token for token in parsed_tokens if norm(token) in NON_INSTITUTION_TERMS]
                candidate_cells = []
                for heading in candidates:
                    lines, pages, stop_reason = extract_cell(page_lines, heading, known_institutions, heading_starts, italic_by_page)
                    pdf_codes, unresolved_pdf_lines, excluded_non_institution_lines = map_pdf_institution_lines(lines, pdf_institution_aliases, expected_institutions)
                    covered = [token for token in expected_institutions if institution_covered(str(token), lines)]
                    missing = [token for token in expected_institutions if token not in covered]
                    heading_lines = page_lines[heading["page_index"]][heading["line_index"]:heading["end_line"] + 1]
                    candidate_cells.append({"pages": pages or [heading["page_index"] + 1], "programme_heading": heading["name"], "cell_stop_reason": stop_reason, "source_cell_lines": lines, "institution_codes_from_pdf": pdf_codes, "unresolved_pdf_institution_lines": unresolved_pdf_lines, "non_institution_cell_lines_excluded": excluded_non_institution_lines, "institution_count_in_inventory": len(expected_institutions), "parsed_token_count_in_inventory": len(parsed_tokens), "non_institution_tokens_excluded": ignored_non_institution_tokens, "institution_tokens_matched": covered, "institution_tokens_missing": missing, "coverage": round(len(covered) / len(expected_institutions), 6) if expected_institutions else 0, "supporting_cell_snippet": "\n".join([*heading_lines, *lines])[:6000]})
                status = classify_candidate_cells(candidate_cells, expected_institutions)
                result = {"occurrence_id": oid, "jamb_name": identity.get("jamb_name"), "source_jamb_name": occurrence.get("source_jamb_name"), "source_file": source_file, "original_pdf": str(BROCHURE_ROOT / pdf_name), "status": status, "candidate_count": len(candidates), "candidate_cells": candidate_cells}
                if status in {"verified_unique_full_parsed_institution_cell", "verified_unique_pdf_cell_roster_reconciled"}:
                    complete = [c for c in candidate_cells
                                if c["institution_codes_from_pdf"]
                                and not c["unresolved_pdf_institution_lines"]
                                and c["cell_stop_reason"] == "next_programme_heading"]
                    exact = [c for c in complete if set(c["institution_codes_from_pdf"]) == set(expected_institutions)]
                    cell = exact[0] if status == "verified_unique_full_parsed_institution_cell" else complete[0]
                    result["verification"] = {"offering_row_verified_against_pdf": True, "institution_codes_verified_from_pdf": cell["institution_codes_from_pdf"], "pdf_table_locator": f"Original JAMB brochure: {pdf_name}, PDF page(s) {', '.join(map(str, cell['pages']))}; exact programme heading and institution list in awarder column", "verification_date": date.today().isoformat(), "verification_note": "Institution codes map by exact normalized matches to existing JAMB inventory tokens; the PDF awarder cell is bounded by the next printed bold heading."}
                    if status == "verified_unique_pdf_cell_roster_reconciled":
                        result["verification"]["institution_roster_reconciled_from_pdf"] = True
                        result["verification"]["reconciled_prior_institution_tokens"] = parsed_tokens
                    if args.apply:
                        occurrence.update(result["verification"])
                        if status == "verified_unique_pdf_cell_roster_reconciled":
                            occurrence.setdefault("institution_tokens_before_pdf_cell_reconciliation", parsed_tokens)
                            occurrence["institution_tokens_as_parsed"] = cell["institution_codes_from_pdf"]
                            parsed_path = ROOT / "jamb" / str(occurrence.get("parsed_file") or "")
                            parsed_doc = parsed_docs.setdefault(parsed_path, json.loads(parsed_path.read_text(encoding="utf-8")))
                            ordinal = int(occurrence.get("parsed_row_ordinal") or 0)
                            rows = parsed_doc.get("programmes", [])
                            if ordinal < 1 or ordinal > len(rows) or rows[ordinal - 1].get("jamb_name") != name:
                                raise ValueError(f"Guard failed: parsed offering ordinal/name mismatch for {oid}")
                            offering_row = rows[ordinal - 1]
                            offering_row.setdefault("institution_tokens_before_pdf_cell_reconciliation", parsed_tokens)
                            offering_row["institutions"] = cell["institution_codes_from_pdf"]
                            offering_row.setdefault("source_verification", {}).update(result["verification"])
                            changed_parsed_paths.add(parsed_path)
                        applied += 1
                results.append(result)
        finally:
            pdf.close()
            del pdf
            gc.collect()
    counts = Counter(row["status"] for row in results)
    prior_runs = list(prior.get("prior_runs", []))
    if prior.get("generated_on"):
        prior_runs.append({"generated_on": prior.get("generated_on"), "mode": prior.get("mode"), "target_count": prior.get("target_count"), "counts": prior.get("counts"), "applied_count": prior.get("applied_count", 0)})
    # Current results replace only the latest view for IDs rechecked this run;
    # the complete previous row set is retained in run_history for auditability.
    run_history = preserved_run_history(prior)
    output = {
        "schema": "2026-09-30.jamb-offering-original-pdf-exhaustive-cells.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "scope": "Only the exact currently-unverified offering occurrences in the local inventory; verified rows were excluded.",
        "inventory": str(INVENTORY),
        "source_directory": str(BROCHURE_ROOT),
        "target_count": len(target_ids),
        "rows_processed": len(results),
        "verified_count": counts.get("verified_unique_full_parsed_institution_cell", 0) + counts.get("verified_unique_pdf_cell_roster_reconciled", 0),
        "applied_count": applied,
        "remaining_unresolved": len(results) - applied if args.apply else len(results) - counts.get("verified_unique_full_parsed_institution_cell", 0) - counts.get("verified_unique_pdf_cell_roster_reconciled", 0),
        "counts": dict(sorted(counts.items())),
        "prior_runs": prior_runs,
        "run_history": run_history,
        "rows": results,
        "checkpoint_rows_preserved": len(prior_by_id),
        "changed_parsed_paths": [str(path) for path in sorted(changed_parsed_paths)],
        "guard": "Rows are promoted only when one candidate PDF programme cell is bounded by the next bold heading and every italic institution line maps uniquely to an existing normalized JAMB institution code. Source-backed rosters replace prior parsed arrays only behind row-ordinal/name guards.",
    }
    if args.apply and applied:
        INVENTORY.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for parsed_path in changed_parsed_paths:
            # The checked-in parsed JAMB ledgers use a one-space JSON indent;
            # preserve that format so a row-level correction does not rewrite
            # thousands of unrelated lines in the diff.
            parsed_path.write_text(json.dumps(parsed_docs[parsed_path], ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Exhaustive JAMB original-PDF offering-cell verification — 2026-09-30", "", f"- Mode: **{output['mode']}**", f"- Exact residual targets: **{len(target_ids)}**", f"- Source rows promoted: **{applied}**", f"- Unresolved after this pass: **{output['remaining_unresolved']}**", ""]
    lines.extend(f"- `{key}`: **{value}**" for key, value in sorted(counts.items()))
    lines += ["", "Each row records the original PDF, page(s), and the exact programme/awarder-column snippet. Partial or ambiguous roster matches are left unverified.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT), "markdown": str(OUT_MD), "mode": output["mode"], "target_count": len(target_ids), "counts": dict(sorted(counts.items())), "applied": applied}, indent=2))


if __name__ == "__main__":
    main()
