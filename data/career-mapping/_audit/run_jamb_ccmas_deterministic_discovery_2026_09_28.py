"""Exhaustively scan local JAMB/CCMAS records for deterministic discovery leads.

This is a local-data consistency and candidate-discovery pass, not source
verification. It never edits product data and never promotes a record. Any
finding that requires judging an official JAMB/NUC or external source remains
explicitly marked as a source-review candidate.
"""

from __future__ import annotations

import json
import hashlib
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
JAMB_DIR = ROOT / "jamb"
CCMAS_DIR = ROOT / "ccmas"
MAPPING_PATH = ROOT / "programme_mapping.json"
SCOPE_PATH = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
OFFERING_CONTEXT_PATH = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
ORIGINAL_SOURCE_REVIEW_PATH = AUDIT / "ccmas_original_source_review_2026-09-18.json"
OPEN_ADJUDICATION_PATH = AUDIT / "ccmas_open_anomaly_adjudication_2026-09-26_002.json"
EMPTY_RECONCILIATION_PATH = AUDIT / "ccmas_empty_summary_source_review_reconciliation_2026-09-26_001.json"
OUT_JSON = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
OUT_MD = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.md"

PLACEHOLDER_CONTENT = {"", "-", "--", "---", "—", "–", "n/a", "na"}
COMPOUND_TOKEN = re.compile(r"\b(and|with)\b|[&/]")
JAMB_BROCHURE_URLS = {
    "administration": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
    "agriculture": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf",
    "arts and humanities": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "education": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf",
    "engineering/technology": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "engineering/environmental/technology": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "law": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
    "medical/pharmaceutical/health": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf",
    "sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    "social/management sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
}

# Preserve the canonical local identity while reconciling the source's
# corrected spelling. This is a source-name alias, not a second programme and
# not a downstream mapping change.
SOURCE_NAME_ALIASES = {
    "Sociology and Anthropology": "Sociology and Anthroplogy",
}
CCMAS_SOURCE_URLS = {
    "administration_management.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
    "agricultural_science.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf",
    "allied_health.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "architecture.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Architecture-CCMAS-2023-FINAL.pdf",
    "arts.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    "basic_medical.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "communication_media.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "computing.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
    "education.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
    "engineering.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "environmental_sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "law.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf",
    "medicine_dentistry.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "pharmacy.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
    "social_sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "veterinary.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def course_key(source_file: Any, programme: Any, code: Any, title: Any = None) -> tuple[str, str, str, str]:
    return (norm(source_file), norm(programme), norm(code), norm(title))


def load_checkpoint_indexes() -> dict[str, dict]:
    """Load saved course-level source decisions without treating them as current source truth."""
    original = read_json(ORIGINAL_SOURCE_REVIEW_PATH)
    adjudication = read_json(OPEN_ADJUDICATION_PATH)
    empty = read_json(EMPTY_RECONCILIATION_PATH)
    original_index: dict[tuple, list[dict]] = defaultdict(list)
    for row in original.get("courseRows", []):
        key = course_key(row.get("sourceFile"), row.get("programme"), row.get("courseCode"), row.get("courseTitle"))
        original_index[key].append({"checkpoint": "ccmas_original_source_review_2026-09-18", **row})
    adjudication_index: dict[tuple, list[dict]] = defaultdict(list)
    for row in adjudication.get("adjudications", []):
        key = course_key(row.get("source_file"), row.get("programme"), row.get("code"), row.get("current_title"))
        adjudication_index[key].append({"checkpoint": "ccmas_open_anomaly_adjudication_2026-09-26_002", **row})
    reconciliation_index: dict[tuple, list[dict]] = defaultdict(list)
    for row in empty.get("reviewed_rows", []):
        key = course_key(row.get("source_file"), row.get("programme"), row.get("code"))
        reconciliation_index[key].append({"checkpoint": "ccmas_empty_summary_source_review_reconciliation_2026-09-26_001", **row})
    for row in empty.get("resolved_content_summaries", []):
        key = course_key(row.get("source_file"), row.get("programme"), row.get("code"))
        reconciliation_index[key].append({"checkpoint": "ccmas_empty_summary_source_review_reconciliation_2026-09-26_001", **row})
    original_base: dict[tuple, list[dict]] = defaultdict(list)
    for key, rows in original_index.items():
        original_base[key[:3]].extend(rows)
    adjudication_base: dict[tuple, list[dict]] = defaultdict(list)
    for key, rows in adjudication_index.items():
        adjudication_base[key[:3]].extend(rows)
    reconciliation_base: dict[tuple, list[dict]] = defaultdict(list)
    for key, rows in reconciliation_index.items():
        reconciliation_base[key[:3]].extend(rows)
    return {
        "original": original_index,
        "original_by_base": original_base,
        "adjudication": adjudication_index,
        "adjudication_by_base": adjudication_base,
        "reconciliation": reconciliation_index,
        "reconciliation_by_base": reconciliation_base,
        "source_review_meta": original.get("summary", {}),
        "adjudication_meta": adjudication.get("scope", {}),
        "reconciliation_meta": empty.get("scope", {}),
    }


def package_registry() -> tuple[list[dict], dict[tuple[str, str], dict], dict[tuple[str, str, str], list[dict]]]:
    packages: list[dict] = []
    by_file_name: dict[tuple[str, str], dict] = {}
    courses: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = read_json(path)
        for package in document.get("programmes", []):
            row = {"source_file": path.name, "discipline": document.get("discipline"), **package}
            packages.append(row)
            key = (path.name, norm(package.get("name")))
            if key in by_file_name:
                raise ValueError(f"Duplicate CCMAS package identity in {path.name}: {package.get('name')}")
            by_file_name[key] = row
            for course in package.get("courses", []):
                courses[(path.name, norm(package.get("name")), norm(course.get("code")))].append(course)
    return packages, by_file_name, courses


def occurrence_signature(parsed_file: Any, name: Any, faculty: Any, institutions: Any) -> tuple:
    return (norm(parsed_file), norm(name), norm(faculty), tuple(sorted(norm(value) for value in (institutions or []))))


def occurrence_context_key(parsed_file: Any, name: Any, faculty: Any) -> tuple:
    return (norm(parsed_file), norm(name), norm(faculty))


def resolve_course_source_row(selected: dict[str, Any], source_rows: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Resolve duplicate package codes using the selected row's identity fields.

    Some CCMAS packages reuse a course code for different titles or levels.
    A code-only lookup is therefore too strict: when the selected snapshot's
    exact title or workload identifies one source row, that is a deterministic
    resolution and should not remain an ambiguity finding.
    """
    if len(source_rows) <= 1:
        return source_rows[0] if source_rows else None
    selected_title = norm(selected.get("title"))
    title_matches = [row for row in source_rows if norm(row.get("title")) == selected_title and selected_title]
    if len(title_matches) == 1:
        return title_matches[0]
    candidates = title_matches if title_matches else list(source_rows)
    selected_outcomes = selected.get("learning_outcomes") or []
    if len(candidates) > 1 and selected_outcomes:
        outcome_matches = [
            row for row in candidates
            if row.get("skills_learned") and row.get("skills_learned") == selected_outcomes
        ]
        if len(outcome_matches) == 1:
            return outcome_matches[0]
        if outcome_matches:
            populated_content_matches = [row for row in outcome_matches if norm(row.get("content_summary"))]
            if len(populated_content_matches) == 1:
                return populated_content_matches[0]
            candidates = outcome_matches
    selected_content = norm(selected.get("content_summary"))
    if len(candidates) > 1 and selected_content:
        content_matches = [
            row for row in candidates
            if norm(row.get("content_summary")) == selected_content
        ]
        if len(content_matches) == 1:
            return content_matches[0]
        if content_matches:
            candidates = content_matches
    if len(candidates) > 1:
        # A package can repeat one course for multiple pathway rows. If the
        # substantive course identity is identical and only pathway metadata
        # differs, the selected curriculum does not have a remaining source
        # ambiguity.
        semantic_fields = ("title", "units", "status", "lh", "ph", "content_summary", "skills_learned")
        semantic_signatures = {
            json.dumps({field: row.get(field) for field in semantic_fields}, ensure_ascii=False, sort_keys=True)
            for row in candidates
        }
        if len(semantic_signatures) == 1:
            return candidates[0]
    workload_fields = (
        ("units", "units"),
        ("status", "status"),
        ("lecture_hours", "lh"),
        ("practical_hours", "ph"),
    )
    for selected_field, source_field in workload_fields:
        value = selected.get(selected_field)
        if value is None:
            continue
        filtered = [row for row in candidates if norm(row.get(source_field)) == norm(value)]
        if filtered:
            candidates = filtered
    return candidates[0] if len(candidates) == 1 else None


def surplus_rows(rows: list[dict], own: Counter, other: Counter, signature_fn) -> list[dict]:
    remaining = own - other
    surplus = []
    for row in rows:
        key = signature_fn(row)
        if remaining[key] > 0:
            surplus.append(row)
            remaining[key] -= 1
    return surplus


def offering_rows(
    inventory_by_occurrence: dict[tuple[str, int, str], dict],
    inventory_by_signature: dict[tuple, list[dict]],
) -> tuple[dict[str, list[dict]], list[dict], list[str]]:
    rows: dict[str, list[dict]] = defaultdict(list)
    all_rows: list[dict] = []
    files: list[str] = []
    used_inventory_ids: set[str] = set()
    for path in sorted(JAMB_DIR.glob("*_offerings.json")):
        document = read_json(path)
        files.append(path.name)
        for ordinal, offering in enumerate(document.get("programmes", []), 1):
            name = offering.get("jamb_name")
            if not name:
                continue
            source_faculty = document.get("faculty")
            inventory_row = inventory_by_occurrence.get((path.name, ordinal, str(name)), {})
            link_method = "exact_file_ordinal_and_spelling" if inventory_row else None
            if not inventory_row:
                candidates = inventory_by_signature.get(occurrence_signature(path.name, name, source_faculty, offering.get("institutions")), [])
                unused = [row for row in candidates if not row.get("occurrence_id") or row.get("occurrence_id") not in used_inventory_ids]
                if len(unused) == 1:
                    inventory_row = unused[0]
                    link_method = "unique_file_name_faculty_institution_signature"
            occurrence_id = inventory_row.get("occurrence_id")
            if occurrence_id:
                used_inventory_ids.add(occurrence_id)
            verification = offering.get("source_verification") or {}
            # The current offering inventory is the authoritative local
            # reconciliation of row-level PDF evidence.  Older parsed offering
            # files may not carry the optional source_verification overlay, so
            # do not discard a verified inventory row merely because that
            # legacy overlay is absent.
            verified_against_pdf = bool(
                verification.get("verified_against_pdf")
                or inventory_row.get("offering_row_verified_against_pdf")
            )
            pdf_table_locator = (
                verification.get("pdf_table_locator")
                or inventory_row.get("pdf_table_locator")
                or offering.get("source_locator")
            )
            official_source_url = (
                verification.get("official_source_url")
                or inventory_row.get("official_source_url")
                or offering.get("source_url")
            )
            verification_date = (
                verification.get("verification_date")
                or inventory_row.get("verification_date")
                or offering.get("source_accessed_on")
            )
            source_metadata_complete = bool(
                official_source_url and pdf_table_locator and verification_date
            )
            source_evidence_state = (
                "pdf_verified"
                if verified_against_pdf and source_metadata_complete
                else "source_text_located"
                if source_metadata_complete
                else "metadata_missing"
            )
            occurrence = {
                "jamb_name": name,
                "canonical_identity_name": SOURCE_NAME_ALIASES.get(str(name), str(name)),
                "source_file": document.get("source") or path.name,
                "parsed_file": path.name,
                "source_faculty": source_faculty,
                "brochure_source_url": JAMB_BROCHURE_URLS.get(norm(source_faculty)),
                "ordinal": ordinal,
                "institutions": offering.get("institutions") or [],
                "verified_against_pdf": verified_against_pdf,
                "pdf_table_locator": pdf_table_locator,
                "official_source_url": official_source_url,
                "verification_date": verification_date,
                "source_metadata_complete": source_metadata_complete,
                "source_evidence_state": source_evidence_state,
                "source_context_status": offering.get("source_context_status"),
                "occurrence_id": inventory_row.get("occurrence_id"),
                "prior_inventory_link_method": link_method,
                "institution_codes_verified_from_pdf": inventory_row.get("institution_codes_verified_from_pdf", []),
                "requirements_available_in_record": inventory_row.get("requirements_available_in_record"),
                "verification_note": inventory_row.get("verification_note"),
                "prior_inventory_pdf_table_locator": inventory_row.get("pdf_table_locator"),
                "prior_inventory_official_source_url": inventory_row.get("official_source_url"),
            }
            all_rows.append(occurrence)
            rows[occurrence["canonical_identity_name"]].append(occurrence)
    return rows, all_rows, files


def evidence_findings(name: str, scope: dict, contexts: list[dict], package_by_key: dict, course_index: dict) -> list[dict]:
    findings: list[dict] = []

    def add(kind: str, status: str, detail: str, **extra: Any) -> None:
        findings.append({"finding": kind, "classification": status, "detail": detail, **extra})

    if not contexts:
        add("canonical_identity_without_parsed_offering", "candidate_needs_source_reconciliation",
            "No exact-name occurrence exists in the parsed offering ledgers; check aliases, unparsed source rows, and the official JAMB catalogue.")
    for occurrence in contexts:
        if occurrence["source_context_status"] == "evidence_hold":
            add("offering_context_held", "source_review_open", "Offering occurrence is explicitly held pending source adjudication.",
                source_file=occurrence["parsed_file"], source_faculty=occurrence["source_faculty"], ordinal=occurrence["ordinal"])
        if not occurrence.get("source_metadata_complete"):
            add("offering_source_metadata_incomplete", "source_review_open", "Offering occurrence lacks one or more of the official URL, source locator, or access date.",
                source_file=occurrence["parsed_file"], source_faculty=occurrence["source_faculty"], ordinal=occurrence["ordinal"])
        elif not occurrence.get("verified_against_pdf"):
            add("offering_pdf_cell_verification_pending", "targeted_pdf_cell_review", "Official URL, local source-text locator, and access date are present; independent verification of the exact brochure table cell is still pending.",
                source_file=occurrence["parsed_file"], source_faculty=occurrence["source_faculty"], ordinal=occurrence["ordinal"])

    scope_type = scope.get("inheritance_type")
    components = scope.get("component_refs") or []
    selected = scope.get("selected_courses") or []
    if COMPOUND_TOKEN.search(name):
        add("compound_display_name_candidate", "candidate_requires_semantic_review",
            "Programme wording contains a conjunction, slash, or ampersand; this is a discovery lead only, not proof of multiple curricula.")
    if scope_type in {"partial_curriculum_scope", "combined_ccmas_curriculum", "combined_curriculum_scope"} and not components:
        add("scoped_mapping_without_component_reference", "confirmed_internal_inconsistency", "Scope is marked partial/combined but declares no curriculum component.")
    if components and not selected:
        add("component_scope_without_selected_courses", "candidate_scope_incomplete",
            "At least one curriculum component is declared but no course rows are selected.", component_refs=components)
    if scope.get("unrepresented_facets"):
        add("explicitly_unrepresented_programme_facets", "candidate_scope_incomplete",
            "The scope records named facets that are not represented.", facets=scope["unrepresented_facets"])

    declared_sources = set()
    for component in components:
        discipline, sep, programme = str(component).partition("::")
        if not sep or component.startswith("__custom__::"):
            continue
        declared_sources.add(norm(programme))
        matching = [p for p in package_by_key.values() if norm(p.get("name")) == norm(programme)]
        discipline_matching = [p for p in matching if norm(p.get("discipline")) == norm(discipline)]
        if discipline_matching:
            matching = discipline_matching
        if not matching:
            add("declared_ccmas_component_not_found", "confirmed_internal_inconsistency",
                "Declared CCMAS component does not resolve to any local package by exact programme name.", component_ref=component)
        elif len(matching) > 1:
            add("declared_ccmas_component_ambiguous", "candidate_needs_component_disambiguation",
                "Declared component title occurs in multiple source packages; discipline/file context must disambiguate it.", component_ref=component,
                matching_files=sorted(p["source_file"] for p in matching))

    used_components: set[str] = set()
    for course in selected:
        source_file = course.get("source_ccmas_file")
        programme = course.get("source_ccmas_programme")
        code = course.get("code")
        if not source_file or not programme:
            if not course.get("source_url") or not course.get("source_locator") or not course.get("source_accessed_on"):
                add("external_or_custom_course_without_complete_locator", "candidate_source_evidence_incomplete",
                    "A non-CCMAS selected course lacks a URL, locator, or access date.", course_code=code, course_title=course.get("title"))
            continue
        used_components.add(norm(programme))
        package_key = (str(source_file), norm(programme))
        package = package_by_key.get(package_key)
        if package is None:
            add("selected_course_component_not_found", "confirmed_internal_inconsistency",
                "Selected course points to a source file/programme pair that does not resolve locally.", source_file=source_file,
                source_programme=programme, course_code=code)
            continue
        source_rows = course_index.get((str(source_file), norm(programme), norm(code)), [])
        if not source_rows:
            add("selected_course_code_not_found_in_component", "confirmed_internal_inconsistency",
                "Selected course code does not exist in its declared local CCMAS component.", source_file=source_file,
                source_programme=programme, course_code=code, course_title=course.get("title"))
            continue
        source = resolve_course_source_row(course, source_rows)
        if source is None and len(source_rows) > 1:
            add("selected_course_code_ambiguous_in_component", "candidate_course_identity_ambiguous",
                "Course code has multiple occurrences in the declared package; source occurrence must be resolved.", source_file=source_file,
                source_programme=programme, course_code=code, source_titles=[r.get("title") for r in source_rows])
            continue
        drift = {}
        checks = {
            "title": (course.get("title"), source.get("title")),
            "units": (course.get("units"), source.get("units")),
            "status": (course.get("status"), source.get("status")),
            "lecture_hours": (course.get("lecture_hours"), source.get("lh")),
            "practical_hours": (course.get("practical_hours"), source.get("ph")),
            "learning_outcomes": (course.get("learning_outcomes"), source.get("skills_learned")),
            "content_summary": (course.get("content_summary"), source.get("content_summary")),
        }
        for field, (selected_value, source_value) in checks.items():
            if field in {"title", "status"}:
                same = norm(selected_value) == norm(source_value)
            else:
                same = selected_value == source_value
            if not same:
                drift[field] = {"selected": selected_value, "local_component": source_value}
        if drift:
            add("selected_course_differs_from_declared_local_component", "confirmed_internal_inconsistency",
                "Selected scope record disagrees with the current declared local CCMAS row; this establishes internal drift, not which side matches the NUC source.",
                source_file=source_file, source_programme=programme, course_code=code, fields=drift)

    for component in components:
        if component.startswith("__custom__::"):
            continue
        programme = component.partition("::")[2]
        if norm(programme) not in used_components:
            add("declared_component_has_no_selected_course_facet", "candidate_scope_incomplete",
                "A declared CCMAS component contributes no selected course rows.", component_ref=component)

    for field in ("source_url", "source_locator", "source_accessed_on"):
        missing = [row.get("code") for row in selected if not row.get(field)]
        if missing:
            add("selected_course_source_citation_incomplete", "candidate_source_evidence_incomplete",
                f"Selected CCMAS course rows lack {field}.", missing_course_count=len(missing), course_codes=missing)
    return findings


def main() -> None:
    mappings_doc = read_json(MAPPING_PATH)
    mappings = mappings_doc.get("mappings", [])
    scopes_doc = read_json(SCOPE_PATH)
    scopes = scopes_doc.get("rows", [])
    offering_inventory = read_json(OFFERING_CONTEXT_PATH)
    inventory_by_occurrence = {}
    for identity in offering_inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            occurrence_key = (
                str(occurrence.get("parsed_file")),
                int(occurrence.get("parsed_row_ordinal") or 0),
                str(occurrence.get("source_jamb_name")),
            )
            inventory_by_occurrence[occurrence_key] = occurrence
    inventory_by_signature: dict[tuple, list[dict]] = defaultdict(list)
    for identity in offering_inventory.get("identities", []):
        for occurrence in identity.get("source_offerings", []):
            signature = occurrence_signature(
                occurrence.get("parsed_file"), occurrence.get("source_jamb_name"),
                occurrence.get("source_faculty"), occurrence.get("institution_tokens_as_parsed"),
            )
            inventory_by_signature[signature].append(occurrence)
    source_offerings, all_source_offerings, jamb_files = offering_rows(inventory_by_occurrence, inventory_by_signature)
    packages, package_by_key, course_index = package_registry()
    checkpoints = load_checkpoint_indexes()

    mapping_by_name = {str(row.get("jamb_name")): row for row in mappings}
    scope_by_name = {str(row.get("jamb_name")): row for row in scopes}
    inventory_by_name = {str(row.get("jamb_name")): row for row in offering_inventory.get("identities", [])}
    all_jamb_keys = set(mapping_by_name)
    all_scope_keys = set(scope_by_name)
    if len(mappings) != 420 or len(scopes) != 420 or len(mapping_by_name) != 420:
        raise SystemExit(f"Expected 420 distinct canonical mapping/scope rows; got mappings={len(mappings)}, scopes={len(scopes)}, exact_unique_mappings={len(mapping_by_name)}")
    if all_jamb_keys != all_scope_keys:
        raise SystemExit("Canonical mappings and curriculum scopes do not have identical normalized identity sets")

    jamb_results = []
    occurrence_total = 0
    canonical_occurrence_verified = 0
    for order, mapping in enumerate(mappings, 1):
        key = norm(mapping.get("jamb_name"))
        name = mapping["jamb_name"]
        scope = scope_by_name[name]
        # Exact spelling is intentional: case-only JAMB identity variants must
        # not silently share an offering context. Those collisions are queued.
        contexts = source_offerings.get(name, [])
        occurrence_total += len(contexts)
        canonical_occurrence_verified += sum(c["verified_against_pdf"] and bool(c["pdf_table_locator"]) for c in contexts)
        jamb_results.append({
            "canonical_order": order,
            "jamb_name": name,
            "source_occurrence_count": len(contexts),
            "source_occurrences": contexts,
            "component_refs": scope.get("component_refs", []),
            "selected_course_count": len(scope.get("selected_courses") or []),
            "selected_courses": scope.get("selected_courses") or [],
            "findings": evidence_findings(name, scope, contexts, package_by_key, course_index),
        })

    ccmas_results = []
    ccmas_counts = Counter()
    global_course_codes: dict[str, list[dict]] = defaultdict(list)
    all_ccmas_course_rows: list[dict] = []
    source_review_match_count = 0
    source_adjudication_match_count = 0
    reconciliation_match_count = 0
    for package_index, package in enumerate(packages, 1):
        courses = package.get("courses", [])
        code_groups: dict[str, list[dict]] = defaultdict(list)
        for course in courses:
            code_groups[norm(course.get("code"))].append(course)
        findings = []
        empty_summaries = []
        empty_outcomes = []
        duplicate_codes = []
        for course_ordinal, course in enumerate(courses, 1):
            code = course.get("code")
            title = course.get("title")
            base_key = course_key(package["source_file"], package.get("name"), code)
            exact_key = course_key(package["source_file"], package.get("name"), code, title)
            prior_original = checkpoints["original"].get(exact_key, [])
            prior_adjudications = checkpoints["adjudication"].get(exact_key, [])
            original_code_candidates = [row for row in checkpoints["original_by_base"].get(base_key, []) if norm(row.get("courseTitle")) != norm(title)]
            adjudication_code_candidates = [row for row in checkpoints["adjudication_by_base"].get(base_key, []) if norm(row.get("current_title")) != norm(title)]
            prior_reconciliation = checkpoints["reconciliation_by_base"].get(base_key, [])
            material = {
                "source_file": package["source_file"],
                "discipline": package.get("discipline"),
                "programme": package.get("name"),
                "course_ordinal": course_ordinal,
                "record_id": f"{package['source_file']}::{package.get('name')}::{course_ordinal:04d}",
                "code": code,
                "title": title,
                "units": course.get("units"),
                "status": course.get("status"),
                "lecture_hours": course.get("lh"),
                "practical_hours": course.get("ph"),
                "content_summary": course.get("content_summary"),
                "learning_outcomes": course.get("skills_learned") or [],
                "source_url": course.get("source_url"),
                "source_locator": course.get("source_locator"),
                "source_accessed_on": course.get("source_accessed_on"),
                "prior_original_source_review": prior_original,
                "prior_source_adjudications": prior_adjudications,
                "prior_empty_summary_reconciliations": prior_reconciliation,
                "prior_checkpoint_same_code_title_mismatch_candidates": original_code_candidates + adjudication_code_candidates,
            }
            fingerprint_fields = {
                key: material[key]
                for key in ("source_file", "programme", "course_ordinal", "code", "title", "units", "status", "lecture_hours", "practical_hours", "content_summary", "learning_outcomes", "source_url", "source_locator", "source_accessed_on")
            }
            material["record_fingerprint_sha256"] = hashlib.sha256(
                json.dumps(fingerprint_fields, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
            ).hexdigest()
            all_ccmas_course_rows.append(material)
            source_review_match_count += bool(prior_original)
            source_adjudication_match_count += bool(prior_adjudications)
            reconciliation_match_count += bool(prior_reconciliation)
            if code:
                global_course_codes[norm(code)].append({
                    "source_file": package["source_file"],
                    "programme": package.get("name"),
                    "course_ordinal": course_ordinal,
                    "record_id": material["record_id"],
                    "code": code,
                    "title": title,
                    "units": course.get("units"),
                    "status": course.get("status"),
                    "lecture_hours": course.get("lh"),
                    "practical_hours": course.get("ph"),
                    "content_summary": course.get("content_summary"),
                    "learning_outcomes": course.get("skills_learned") or [],
                })
            if norm(course.get("content_summary")) in PLACEHOLDER_CONTENT:
                empty_summaries.append({"code": code, "title": title})
            if not course.get("skills_learned"):
                empty_outcomes.append({"code": code, "title": title})
        for code_key, occurrences in code_groups.items():
            if code_key and len(occurrences) > 1:
                duplicate_codes.append({"code": occurrences[0].get("code"), "titles": [r.get("title") for r in occurrences], "count": len(occurrences)})
        repeated_outcome_rows = []
        for course_ordinal, course in enumerate(courses, 1):
            repeated_outcomes = [text for text, count in Counter(course.get("skills_learned") or []).items() if text and count > 1]
            if repeated_outcomes:
                repeated_outcome_rows.append({"course_ordinal": course_ordinal, "code": course.get("code"), "title": course.get("title"), "repeated_outcomes": repeated_outcomes})
        if repeated_outcome_rows:
            findings.append({"finding": "repeated_outcome_text_within_course", "classification": "candidate_source_authorship_or_extraction_review", "count": len(repeated_outcome_rows), "courses": repeated_outcome_rows})
        if empty_summaries:
            findings.append({"finding": "empty_or_placeholder_content_summary", "classification": "candidate_needs_nuc_source_check", "count": len(empty_summaries), "courses": empty_summaries})
        if empty_outcomes:
            findings.append({"finding": "empty_learning_outcomes", "classification": "candidate_needs_nuc_source_check", "count": len(empty_outcomes), "courses": empty_outcomes})
        if duplicate_codes:
            findings.append({"finding": "duplicate_course_code_within_package", "classification": "candidate_course_identity_review", "count": len(duplicate_codes), "groups": duplicate_codes})
        for finding in findings:
            ccmas_counts[finding["finding"]] += finding["count"]
        ccmas_results.append({
            "package_index": package_index,
            "source_file": package["source_file"],
            "discipline": package.get("discipline"),
            "programme": package.get("name"),
            "official_source_url": CCMAS_SOURCE_URLS.get(package["source_file"]),
            "source_locator_status": "exact package/course locators require source adjudication",
            "course_count": len(courses),
            "findings": findings,
        })

    cross_package_code_candidates = []
    cross_package_material_variance = []
    for code, occurrences in sorted(global_course_codes.items()):
        packages_for_code = {(row["source_file"], norm(row["programme"])) for row in occurrences}
        titles = {norm(row.get("title")) for row in occurrences}
        if len(packages_for_code) < 2:
            continue
        material_fields = ("title", "units", "status", "lecture_hours", "practical_hours", "content_summary", "learning_outcomes")
        field_values = {
            field: sorted({
                json.dumps(row.get(field), ensure_ascii=False, sort_keys=True)
                for row in occurrences
            })
            for field in material_fields
        }
        varying_fields = [field for field, values in field_values.items() if len(values) > 1]
        if varying_fields:
            cross_package_material_variance.append({
                "course_code": occurrences[0]["code"],
                "package_count": len(packages_for_code),
                "varying_fields": varying_fields,
                "field_values": {field: field_values[field] for field in varying_fields},
                "occurrences": occurrences,
                "classification": "candidate_cross_package_course_identity_or_source_variance",
                "note": "Common course codes may legitimately differ by programme context; compare the exact CCMAS source before classifying or copying details.",
            })
        if len(titles) < 2:
            continue
        detail_signatures: dict[tuple, list[dict]] = defaultdict(list)
        for row in occurrences:
            signature = (
                norm(row.get("content_summary")),
                tuple(norm(x) for x in row.get("learning_outcomes", [])),
            )
            if signature != ("", ()):
                detail_signatures[signature].append(row)
        reused_details = [group for group in detail_signatures.values() if len({norm(row.get("title")) for row in group}) > 1]
        cross_package_code_candidates.append({
            "course_code": occurrences[0]["code"],
            "package_count": len(packages_for_code),
            "distinct_title_count": len(titles),
            "same_detail_with_different_titles_candidate": bool(reused_details),
            "reused_detail_groups": reused_details,
            "occurrences": occurrences,
            "classification": "candidate_cross_package_identity_or_extraction_review",
            "note": "Course codes can be reused legitimately. This is a review queue, not a defect classification.",
        })

    jamb_finding_counts = Counter(f["finding"] for row in jamb_results for f in row["findings"])
    jamb_class_counts = Counter(f["classification"] for row in jamb_results for f in row["findings"])
    identities_with_findings = sum(bool(row["findings"]) for row in jamb_results)
    distinct_source_names = {
        str(occurrence.get("jamb_name"))
        for occurrence in all_source_offerings
    }
    normalized_canonical = {norm(name) for name in all_jamb_keys}
    normalized_source_names = {norm(name) for name in distinct_source_names}
    source_names_without_canonical = sorted(
        name for name in distinct_source_names
        if norm(SOURCE_NAME_ALIASES.get(name, name)) not in normalized_canonical
    )
    canonical_without_exact_source = sorted(
        name for name in all_jamb_keys
        if name not in distinct_source_names
        and name not in SOURCE_NAME_ALIASES.values()
    )
    canonical_without_normalized_source = sorted(
        name for name in all_jamb_keys
        if norm(name) not in normalized_source_names
        and name not in SOURCE_NAME_ALIASES.values()
    )
    orphan_source_occurrences = [
        occurrence for occurrence in all_source_offerings
        if norm(occurrence.get("canonical_identity_name") or occurrence["jamb_name"]) not in normalized_canonical
    ]
    current_occurrence_signatures = Counter(occurrence_context_key(
        occurrence.get("parsed_file"), occurrence.get("jamb_name"), occurrence.get("source_faculty")
    ) for occurrence in all_source_offerings)
    inventory_occurrences = [
        occurrence
        for identity in offering_inventory.get("identities", [])
        for occurrence in identity.get("source_offerings", [])
    ]
    inventory_occurrence_signatures = Counter(occurrence_context_key(
        occurrence.get("parsed_file"), occurrence.get("source_jamb_name"), occurrence.get("source_faculty")
    ) for occurrence in inventory_occurrences)
    current_only_occurrences = surplus_rows(
        all_source_offerings,
        current_occurrence_signatures,
        inventory_occurrence_signatures,
        lambda row: occurrence_context_key(row.get("parsed_file"), row.get("jamb_name"), row.get("source_faculty")),
    )
    inventory_only_occurrences = surplus_rows(
        inventory_occurrences,
        inventory_occurrence_signatures,
        current_occurrence_signatures,
        lambda row: occurrence_context_key(row.get("parsed_file"), row.get("source_jamb_name"), row.get("source_faculty")),
    )
    inventory_by_id = {row.get("occurrence_id"): row for row in inventory_occurrences if row.get("occurrence_id")}
    institution_roster_differences = []
    for current in all_source_offerings:
        prior = inventory_by_id.get(current.get("occurrence_id"))
        if not prior:
            continue
        old_institutions = sorted(norm(value) for value in prior.get("institution_tokens_as_parsed", []))
        current_institutions = sorted(norm(value) for value in current.get("institutions", []))
        if old_institutions != current_institutions:
            institution_roster_differences.append({
                "occurrence_id": current["occurrence_id"],
                "jamb_name": current["jamb_name"],
                "source_faculty": current["source_faculty"],
                "prior_institutions": prior.get("institution_tokens_as_parsed", []),
                "current_institutions": current.get("institutions", []),
            })
    all_occurrence_verified = sum(
        occurrence["verified_against_pdf"] and bool(occurrence["pdf_table_locator"])
        for occurrence in all_source_offerings
    )
    all_occurrence_metadata_complete = sum(
        occurrence.get("source_metadata_complete", False)
        for occurrence in all_source_offerings
    )
    all_occurrence_pdf_cell_pending = sum(
        occurrence.get("source_metadata_complete", False)
        and not occurrence.get("verified_against_pdf", False)
        for occurrence in all_source_offerings
    )
    current_course_exact_keys = {
        course_key(row["source_file"], row["programme"], row["code"], row["title"])
        for row in all_ccmas_course_rows
    }
    current_course_base_keys = {key[:3] for key in current_course_exact_keys}
    original_checkpoint_rows = [row for rows in checkpoints["original"].values() for row in rows]
    adjudication_checkpoint_rows = [row for rows in checkpoints["adjudication"].values() for row in rows]
    original_unmatched = [
        row for row in original_checkpoint_rows
        if course_key(row.get("sourceFile"), row.get("programme"), row.get("courseCode"))[:3] not in current_course_base_keys
    ]
    original_title_mismatch = [
        row for row in original_checkpoint_rows
        if course_key(row.get("sourceFile"), row.get("programme"), row.get("courseCode"))[:3] in current_course_base_keys
        and course_key(row.get("sourceFile"), row.get("programme"), row.get("courseCode"), row.get("courseTitle")) not in current_course_exact_keys
    ]
    adjudication_unmatched = [
        row for row in adjudication_checkpoint_rows
        if course_key(row.get("source_file"), row.get("programme"), row.get("code"))[:3] not in current_course_base_keys
    ]
    adjudication_title_mismatch = [
        row for row in adjudication_checkpoint_rows
        if course_key(row.get("source_file"), row.get("programme"), row.get("code"))[:3] in current_course_base_keys
        and course_key(row.get("source_file"), row.get("programme"), row.get("code"), row.get("current_title")) not in current_course_exact_keys
    ]
    checkpoint_join_summary = {
        "original_source_review": {
            "checkpoint_rows": sum(len(rows) for rows in checkpoints["original"].values()),
            "exactly_joined_rows": sum(key in current_course_exact_keys for key in checkpoints["original"] for _ in checkpoints["original"][key]),
            "same_code_title_changed_rows": sum(
                len(rows) for key, rows in checkpoints["original"].items()
                if key[:3] in current_course_base_keys and key not in current_course_exact_keys
            ),
            "unmatched_rows": sum(
                len(rows) for key, rows in checkpoints["original"].items()
                if key[:3] not in current_course_base_keys
            ),
            "unmatched_checkpoint_records": original_unmatched,
            "title_mismatch_checkpoint_records": original_title_mismatch,
        },
        "open_anomaly_adjudications": {
            "checkpoint_rows": sum(len(rows) for rows in checkpoints["adjudication"].values()),
            "exactly_joined_rows": sum(key in current_course_exact_keys for key in checkpoints["adjudication"] for _ in checkpoints["adjudication"][key]),
            "same_code_title_changed_rows": sum(
                len(rows) for key, rows in checkpoints["adjudication"].items()
                if key[:3] in current_course_base_keys and key not in current_course_exact_keys
            ),
            "unmatched_rows": sum(
                len(rows) for key, rows in checkpoints["adjudication"].items()
                if key[:3] not in current_course_base_keys
            ),
            "unmatched_checkpoint_records": adjudication_unmatched,
            "title_mismatch_checkpoint_records": adjudication_title_mismatch,
        },
        "empty_summary_reconciliation": {
            "checkpoint_rows": sum(len(rows) for rows in checkpoints["reconciliation"].values()),
            "exact_code_joined_rows": sum(key[:3] in current_course_base_keys for key, rows in checkpoints["reconciliation"].items() for _ in rows),
            "unmatched_rows": sum(len(rows) for key, rows in checkpoints["reconciliation"].items() if key[:3] not in current_course_base_keys),
        },
    }
    inventory_names_without_source = sorted(
        row.get("jamb_name") for key, row in inventory_by_name.items()
        if row.get("source_offering_count", 0) == 0
    )
    report = {
        "schema": "2026-09-28.jamb-ccmas-deterministic-discovery.v1",
        "generated_on": date.today().isoformat(),
        "status": "deterministic_discovery_complete_source_metadata_reconciled_exact_pdf_cell_review_open",
        "purpose": "Exhaustively enumerate all local JAMB identity/offering and CCMAS package/course records; detect deterministic internal inconsistencies and source-review candidates. This script does not certify source truth or edit product data.",
        "counts": {
            "jamb_canonical_identities": len(jamb_results),
            "jamb_identities_with_any_discovery_findings": identities_with_findings,
            "jamb_parsed_source_files": len(jamb_files),
            "jamb_parsed_offering_occurrences": occurrence_total,
            "jamb_all_parsed_offering_occurrences": len(all_source_offerings),
            "jamb_orphan_source_occurrences": len(orphan_source_occurrences),
            "jamb_occurrences_linked_to_canonical_with_explicit_pdf_flag_and_locator": canonical_occurrence_verified,
            "jamb_all_occurrences_with_explicit_pdf_flag_and_locator": all_occurrence_verified,
            "jamb_occurrences_with_complete_source_metadata": all_occurrence_metadata_complete,
            "jamb_occurrences_pending_exact_pdf_cell_verification": all_occurrence_pdf_cell_pending,
            "jamb_occurrences_without_complete_source_metadata": len(all_source_offerings) - all_occurrence_metadata_complete,
            "jamb_occurrences_without_faculty_brochure_url": sum(not occurrence.get("brochure_source_url") for occurrence in all_source_offerings),
            "jamb_occurrences_without_stable_inventory_id": sum(not occurrence.get("occurrence_id") for occurrence in all_source_offerings),
            "jamb_occurrences_matched_to_stable_inventory_id": sum(bool(occurrence.get("occurrence_id")) for occurrence in all_source_offerings),
            "jamb_current_occurrences_not_in_older_inventory_signature": len(current_only_occurrences),
            "jamb_older_inventory_occurrences_not_in_current_files": len(inventory_only_occurrences),
            "jamb_occurrences_with_institution_roster_drift_vs_inventory": len(institution_roster_differences),
            "jamb_selected_course_records": sum(row["selected_course_count"] for row in jamb_results),
            "jamb_selected_ccmas_course_records": sum(bool(course.get("source_ccmas_programme")) for row in jamb_results for course in row["selected_courses"]),
            "jamb_selected_external_or_custom_course_records": sum(not course.get("source_ccmas_programme") for row in jamb_results for course in row["selected_courses"]),
            "parsed_source_names_without_canonical_identity": len(source_names_without_canonical),
            "canonical_identities_without_exact_spelling_in_parsed_ledgers": len(canonical_without_exact_source),
            "canonical_identities_without_any_normalized_parsed_occurrence": len(canonical_without_normalized_source),
            "ccmas_source_files": len(list(CCMAS_DIR.glob("*.json"))),
            "ccmas_programme_packages": len(packages),
            "ccmas_course_rows": sum(row["course_count"] for row in ccmas_results),
            "ccmas_packages_with_structural_candidates": sum(bool(row["findings"]) for row in ccmas_results),
        },
        "jamb_finding_counts_by_type": dict(sorted(jamb_finding_counts.items())),
        "jamb_finding_counts_by_classification_nonexclusive": dict(sorted(jamb_class_counts.items())),
        "ccmas_structural_candidate_counts_by_type_nonexclusive": dict(sorted(ccmas_counts.items())),
        "ccmas_cross_package_course_code_candidate_count": len(cross_package_code_candidates),
        "ccmas_cross_package_same_detail_candidate_count": sum(item["same_detail_with_different_titles_candidate"] for item in cross_package_code_candidates),
        "ccmas_cross_package_material_variance_candidate_count": len(cross_package_material_variance),
        "ccmas_course_rows_with_original_review_checkpoint": source_review_match_count,
        "ccmas_course_rows_with_source_adjudication_checkpoint": source_adjudication_match_count,
        "ccmas_course_rows_with_empty_summary_reconciliation_checkpoint": reconciliation_match_count,
        "ccmas_prior_checkpoint_rows_not_joined": sum(item["unmatched_rows"] for item in checkpoint_join_summary.values()),
        "known_inventory_reconciliation": {
            "older_offering_inventory_canonical_identities_without_parsed_occurrence": inventory_names_without_source,
            "current_canonical_names_without_exact_source_spelling": canonical_without_exact_source,
            "current_canonical_names_without_normalized_source_match": canonical_without_normalized_source,
            "current_parsed_source_names_without_canonical_identity": source_names_without_canonical,
            "unmatched_source_occurrences_retained_in_full": len(orphan_source_occurrences),
            "source_name_aliases_reconciled": SOURCE_NAME_ALIASES,
            "warning": "The 2026-09-25 inventory is shown only for comparison; current offering rows above are read directly. Differences need reconciliation, not automatic deletion or identity creation.",
        },
        "ccmas_checkpoint_reconciliation": checkpoint_join_summary,
        "orphan_source_occurrences": orphan_source_occurrences,
        "jamb_current_only_occurrences": current_only_occurrences,
        "jamb_older_inventory_only_occurrences": inventory_only_occurrences,
        "jamb_institution_roster_differences_vs_inventory": institution_roster_differences,
        "classification_contract": {
            "confirmed_internal_inconsistency": "Two current local artifacts contradict each other or a declared local reference cannot resolve. This confirms local inconsistency, not which value matches the external primary source.",
            "candidate_*": "Automated discovery lead requiring human/source review; not a confirmed error.",
            "source_review_open": "An explicit primary-source verification/locator is absent or the row is held. This is not an assertion that the source is unavailable.",
            "targeted_pdf_cell_review": "The official source URL, local source-text locator, and access date are present, but the exact PDF awarder-cell verification has not been independently recorded.",
            "not_covered_by_script": "Original PDF table semantics, completeness of OCR/parser extraction, external curriculum equivalence, substantive facet interpretation, and programme-to-domain correctness require source adjudication.",
        },
        "casefold_name_collisions": [
            {"normalized_name": key, "canonical_spellings": sorted(row["jamb_name"] for row in jamb_results if norm(row["jamb_name"]) == key)}
            for key, count in Counter(norm(row["jamb_name"]) for row in jamb_results).items() if count > 1
        ],
        "jamb_identities": jamb_results,
        "ccmas_packages": ccmas_results,
        "ccmas_course_rows": all_ccmas_course_rows,
        "ccmas_cross_package_course_code_candidates": cross_package_code_candidates,
        "ccmas_cross_package_material_variance_candidates": cross_package_material_variance,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB–CCMAS deterministic discovery report",
        "",
        f"Generated: {report['generated_on']}",
        "",
        "This reproducible scan enumerates every current local identity/package and compares linked records. It is exhaustive for deterministic checks implemented here, but it is **not** an exhaustive authoritative-source audit.",
        "",
        "## Coverage counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["counts"].items() if not isinstance(value, list))
    lines += ["", "## JAMB finding types (nonexclusive)", ""]
    lines.extend(f"- `{key}`: {value}" for key, value in report["jamb_finding_counts_by_type"].items())
    lines += ["", "## CCMAS structural candidate types (nonexclusive)", ""]
    lines.extend(f"- `{key}`: {value}" for key, value in report["ccmas_structural_candidate_counts_by_type_nonexclusive"].items())
    lines += [
        "",
        "## Cross-package course-code candidates",
        "",
        f"- Course-code groups used in multiple packages with different titles: **{report['ccmas_cross_package_course_code_candidate_count']}**.",
        f"- Groups where course details/outcomes are reused under different titles: **{report['ccmas_cross_package_same_detail_candidate_count']}**.",
        "- These are candidates for checking course ownership and extraction contamination; repeated codes may be legitimate and are not auto-corrected.",
    ]
    checkpoint = report["ccmas_checkpoint_reconciliation"]
    lines += [
        "",
        "## Prior source-checkpoint reconciliation",
        "",
        f"- Original source-review rows: {checkpoint['original_source_review']['checkpoint_rows']} total; {checkpoint['original_source_review']['exactly_joined_rows']} exact course joins; {checkpoint['original_source_review']['same_code_title_changed_rows']} same-code/title changes; {checkpoint['original_source_review']['unmatched_rows']} unmatched (explicitly listed in JSON).",
        f"- Open anomaly-adjudication rows: {checkpoint['open_anomaly_adjudications']['checkpoint_rows']} total; {checkpoint['open_anomaly_adjudications']['exactly_joined_rows']} exact joins; {checkpoint['open_anomaly_adjudications']['same_code_title_changed_rows']} same-code/title changes.",
        f"- Empty-summary reconciliation rows: {checkpoint['empty_summary_reconciliation']['checkpoint_rows']} joined at exact package/course-code level.",
        f"- Stable IDs absent from the current JAMB occurrence rows: {report['counts']['jamb_occurrences_without_stable_inventory_id']}.",
        "- Same-code/title changes and unmatched records are carried forward for adjudication rather than dropped or auto-closed.",
    ]
    lines += [
        "",
        "## Interpretation",
        "",
        "Source-metadata and verification are separate: a row can have an official URL, local text locator, and access date while still awaiting exact PDF awarder-cell verification. The pending count is not a missing-link count.",
        "",
        "Counts are nonexclusive; one identity/course may have multiple findings. Structural empties and duplicate course codes are candidates until compared to the exact NUC page. A local cross-ledger mismatch is a confirmed internal inconsistency, but source evidence decides the correct repair. JAMB source contexts remain occurrence-level and are never merged by display name.",
        "",
        "The JSON report contains all 420 identity rows, every parsed JAMB occurrence including source spellings without a canonical identity, stable prior occurrence IDs where available, all 237 CCMAS packages, per-package candidate lists, and the local cross-ledger findings. Use the range fields as a work queue; after source adjudication, add evidence-backed decisions to the separate confirmed-findings register.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": report["counts"], "jamb_findings": report["jamb_finding_counts_by_type"], "ccmas_candidates": report["ccmas_structural_candidate_counts_by_type_nonexclusive"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
