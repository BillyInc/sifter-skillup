"""Build a complete original-document -> CCMAS -> JAMB crosswalk.

The crosswalk is intentionally catalogue-wide.  It maps each original CCMAS
PDF to every parsed package and course row, then joins those rows to the JAMB
identities and selected course snapshots that reference them.  It is a
deterministic inventory and source-routing artifact; it does not promote a
candidate or infer a combined curriculum from a display title.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS_DIR = ROOT / "ccmas"
DISCOVERY = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
MANIFEST = AUDIT / "ccmas_original_pdf_extraction_manifest_2026-09-29.json"
DETAILS = AUDIT / "ccmas_full_course_detail_candidates_original_2026-09-29-pass3.json"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
JAMB_CELL_REPORT = AUDIT / "jamb_offering_original_pdf_cell_verification_2026-09-29.json"
OUT_JSON = AUDIT / "ccmas_original_document_crosswalk_2026-09-29.json"
OUT_MD = AUDIT / "ccmas_original_document_crosswalk_2026-09-29.md"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(str(value or "").split()).casefold()


def compact(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", norm(value))


def ref_key(value: str) -> str:
    return "::".join(part.strip() for part in value.split("::", 1))


def package_matches_ref(package_key: str, component_ref: str) -> bool:
    """Match ``Discipline::Programme`` refs to ``discipline.json::Programme``."""
    package_source, package_programme = package_key.split("::", 1)
    ref_source, ref_programme = component_ref.split("::", 1)
    source_aliases = {
        "administration_management": "Administration and Management",
        "agricultural_science": "Agricultural Sciences",
        "agricultural_science_singular": "Agricultural Science",
        "allied_health": "Allied Health Sciences",
        "basic_medical": "Basic Medical Sciences",
        "communication_media": "Communication and Media Studies",
        "environmental_sciences": "Environmental Sciences",
        "medicine_dentistry": "Medicine and Dentistry",
        "pharmacy": "Pharmacy and Pharmaceutical Sciences",
        "social_sciences": "Social Sciences",
        "veterinary": "Veterinary Medicine",
    }
    source_stem = Path(package_source).stem
    source_label = source_aliases.get(source_stem, source_stem)
    source_matches = norm(source_label) == norm(ref_source)
    if not source_matches and source_stem == "agricultural_science":
        source_matches = norm("Agricultural Science") == norm(ref_source)
    return source_matches and norm(package_programme) == norm(ref_programme)


def main() -> None:
    discovery = load(DISCOVERY)
    manifest = load(MANIFEST)
    details = load(DETAILS)
    scopes = load(SCOPES)
    jamb_cell_report = load(JAMB_CELL_REPORT) if JAMB_CELL_REPORT.exists() else {"rows": []}
    jamb_cell_by_id = {row.get("occurrence_id"): row for row in jamb_cell_report.get("rows", [])}

    packages: dict[str, dict[str, Any]] = {}
    package_order: list[str] = []
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = load(path)
        source_file = path.name
        for programme in document.get("programmes", []):
            key = f"{source_file}::{programme.get('name', '')}"
            packages[key] = {
                "source_file": source_file,
                "discipline": document.get("discipline"),
                "programme": programme.get("name"),
                "course_count": len(programme.get("courses", [])),
                "course_codes": [course.get("code") for course in programme.get("courses", [])],
            }
            package_order.append(key)

    source_metadata = {
        item["source_file"]: item
        for item in manifest.get("source_documents", [])
    }
    package_discovery = {
        f"{item['source_file']}::{item['programme']}": item
        for item in discovery.get("ccmas_packages", [])
    }
    detail_records = details.get("course_record_queue", [])

    # Source candidate pages/states are indexed once, then reused for every
    # JAMB occurrence that points to the same package/course record.
    detail_index: dict[tuple[str, str], dict[str, Any]] = {}
    for record in detail_records:
        key = (record["source_key"], norm(record["course_code"]))
        candidate = record.get("automated_detail_candidates") or {}
        pages = sorted({
            item.get("extracted_page_ordinal")
            for item in candidate.get("candidates", [])
            if item.get("extracted_page_ordinal") is not None
        })
        detail_index[key] = {
            "candidate_state": candidate.get("state"),
            "candidate_count": candidate.get("candidate_count", 0),
            "candidate_pages": pages,
            "candidate_rule": candidate.get("rule"),
        }

    # Resolve JAMB component refs to exact package keys.  A component ref is
    # source/package provenance, not proof that every course in the package is
    # selected; selected course rows are counted separately below.
    jamb_by_package: dict[str, set[str]] = defaultdict(set)
    jamb_identity_rows: list[dict[str, Any]] = []
    jamb_offering_occurrences: list[dict[str, Any]] = []
    component_ref_unresolved: list[dict[str, Any]] = []
    external_component_refs: list[dict[str, Any]] = []
    course_jamb_names: dict[tuple[str, str], set[str]] = defaultdict(set)
    course_jamb_occurrences: Counter[tuple[str, str]] = Counter()
    package_jamb_occurrences: Counter[str] = Counter()
    package_jamb_selected_courses: Counter[str] = Counter()
    external_jamb_course_counts: Counter[str] = Counter()

    for identity in discovery.get("jamb_identities", []):
        jamb_name = identity.get("jamb_name")
        resolved_refs: list[str] = []
        unresolved_refs: list[str] = []
        for ref in identity.get("component_refs", []):
            matches = [key for key in packages if "::" in ref and package_matches_ref(key, ref)]
            if len(matches) == 1:
                resolved_refs.append(matches[0])
                jamb_by_package[matches[0]].add(jamb_name)
            else:
                unresolved_refs.append(ref)
        if unresolved_refs:
            external_refs = [ref for ref in unresolved_refs if ref.startswith("__custom__::")]
            unresolved_refs = [ref for ref in unresolved_refs if not ref.startswith("__custom__::")]
            if external_refs:
                external_component_refs.append({"jamb_name": jamb_name, "refs": external_refs})
            if unresolved_refs:
                component_ref_unresolved.append({"jamb_name": jamb_name, "refs": unresolved_refs})

        selected_count = 0
        external_count = 0
        selected_packages: set[str] = set()
        for course in identity.get("selected_courses", []):
            selected_count += 1
            source_file = course.get("source_ccmas_file")
            programme = course.get("source_ccmas_programme")
            code = norm(course.get("code"))
            if source_file and programme:
                package_key = f"{source_file}::{programme}"
                if package_key in packages:
                    selected_packages.add(package_key)
                    package_jamb_selected_courses[package_key] += 1
                    course_key = (package_key, code)
                    course_jamb_names[course_key].add(jamb_name)
                    course_jamb_occurrences[course_key] += 1
                else:
                    external_count += 1
            else:
                external_count += 1
        external_jamb_course_counts[jamb_name] = external_count
        occurrences = identity.get("source_occurrences", [])
        for occurrence in occurrences:
            jamb_offering_occurrences.append({
                "occurrence_id": occurrence.get("occurrence_id"),
                "jamb_name": jamb_name,
                "canonical_identity_name": occurrence.get("canonical_identity_name", jamb_name),
                "source_file": occurrence.get("source_file"),
                "parsed_file": occurrence.get("parsed_file"),
                "source_faculty": occurrence.get("source_faculty"),
                "brochure_source_url": occurrence.get("brochure_source_url") or occurrence.get("official_source_url"),
                "ordinal": occurrence.get("ordinal"),
                "institution_count": len(occurrence.get("institutions", [])),
                "verified_against_pdf": occurrence.get("verified_against_pdf"),
                "pdf_table_locator": occurrence.get("pdf_table_locator"),
                "verification_date": occurrence.get("verification_date"),
                "source_evidence_state": occurrence.get("source_evidence_state"),
                "source_context_status": occurrence.get("source_context_status"),
                "original_pdf_cell_candidate_state": jamb_cell_by_id.get(occurrence.get("occurrence_id"), {}).get("state"),
                "original_pdf_cell_candidate_pages": jamb_cell_by_id.get(occurrence.get("occurrence_id"), {}).get("same_page_candidates", []),
                "resolved_component_packages": sorted(resolved_refs),
            })
        for occurrence in occurrences:
            for package_key in resolved_refs:
                package_jamb_occurrences[package_key] += 1 / max(1, len(resolved_refs))
        jamb_identity_rows.append({
            "canonical_order": identity.get("canonical_order"),
            "jamb_name": jamb_name,
            "source_occurrence_count": identity.get("source_occurrence_count", 0),
            "component_refs": identity.get("component_refs", []),
            "resolved_component_packages": sorted(resolved_refs),
            "unresolved_component_refs": unresolved_refs,
            "selected_course_count": selected_count,
            "external_or_custom_course_count": external_count,
            "selected_ccmas_packages": sorted(selected_packages),
        })

    course_rows: list[dict[str, Any]] = []
    for package_key in package_order:
        package = packages[package_key]
        source_file = package["source_file"]
        programme = package["programme"]
        document_meta = source_metadata.get(source_file, {})
        for code in package["course_codes"]:
            key = (package_key, norm(code))
            detail = detail_index.get(key, {})
            course_rows.append({
                "source_file": source_file,
                "official_pdf": document_meta.get("original_pdf"),
                "official_pdf_sha256": document_meta.get("original_pdf_sha256"),
                "programme": programme,
                "package_key": package_key,
                "course_code": code,
                "source_page_candidates": detail.get("candidate_pages", []),
                "source_candidate_state": detail.get("candidate_state"),
                "source_candidate_count": detail.get("candidate_count", 0),
                "jamb_identity_count": len(course_jamb_names.get(key, set())),
                "jamb_identities": sorted(course_jamb_names.get(key, set())),
                "jamb_selected_occurrence_count": course_jamb_occurrences.get(key, 0),
            })

    source_rows: list[dict[str, Any]] = []
    for source_file, metadata in sorted(source_metadata.items()):
        package_keys = [key for key in package_order if key.startswith(f"{source_file}::")]
        source_courses = [row for row in course_rows if row["source_file"] == source_file]
        source_rows.append({
            "source_file": source_file,
            "original_pdf": metadata.get("original_pdf"),
            "sha256": metadata.get("original_pdf_sha256"),
            "page_count": metadata.get("page_count"),
            "extracted_text_file": metadata.get("extracted_text_file"),
            "package_count": len(package_keys),
            "course_row_count": len(source_courses),
            "packages_with_jamb_links": sum(bool(jamb_by_package.get(key)) for key in package_keys),
            "jamb_occurrence_count": round(sum(package_jamb_occurrences.get(key, 0) for key in package_keys), 6),
            "selected_course_occurrence_count": sum(row["jamb_selected_occurrence_count"] for row in source_courses),
            "packages": [
                {
                    **packages[key],
                    "jamb_identities": sorted(jamb_by_package.get(key, set())),
                    "jamb_occurrence_count": round(package_jamb_occurrences.get(key, 0), 6),
                    "selected_course_occurrence_count": package_jamb_selected_courses.get(key, 0),
                    "discovery_course_count": package_discovery.get(key, {}).get("course_count"),
                    "discovery_locator_status": package_discovery.get(key, {}).get("source_locator_status"),
                }
                for key in package_keys
            ],
        })

    jamb_documents: list[dict[str, Any]] = []
    jamb_document_groups: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for occurrence in jamb_offering_occurrences:
        jamb_document_groups[
            (
                occurrence.get("source_file") or "",
                occurrence.get("parsed_file") or "",
                occurrence.get("brochure_source_url") or "",
            )
        ].append(occurrence)
    for (source_file, parsed_file, brochure_url), occurrences in sorted(jamb_document_groups.items()):
        jamb_documents.append({
            "source_file": source_file,
            "parsed_file": parsed_file,
            "official_source_url": brochure_url,
            "offering_occurrence_count": len(occurrences),
            "canonical_identity_count": len({row["canonical_identity_name"] for row in occurrences}),
            "pdf_verified_occurrence_count": sum(bool(row["verified_against_pdf"]) for row in occurrences),
            "source_text_located_occurrence_count": sum(row.get("source_evidence_state") == "source_text_located" for row in occurrences),
            "pending_exact_pdf_cell_count": sum(not bool(row["verified_against_pdf"]) for row in occurrences),
            "original_pdf_cell_candidate_counts": dict(sorted(Counter(
                row.get("original_pdf_cell_candidate_state") or "not_scanned"
                for row in occurrences
            ).items())),
            "jamb_names": sorted({row["jamb_name"] for row in occurrences}),
        })

    state_counts = Counter(row.get("source_candidate_state") for row in course_rows)
    coverage_counts = Counter(
        "jamb_linked" if row["jamb_identity_count"] else "not_referenced_by_current_jamb_scope"
        for row in course_rows
    )
    counts = {
        "original_source_documents": len(source_rows),
        "jamb_source_documents": len(jamb_documents),
        "jamb_offering_occurrences": len(jamb_offering_occurrences),
        "ccmas_programme_packages": len(packages),
        "ccmas_course_rows": len(course_rows),
        "canonical_jamb_identities": len(jamb_identity_rows),
        "jamb_identities_with_resolved_component_package": sum(bool(row["resolved_component_packages"]) for row in jamb_identity_rows),
        "jamb_identities_with_unresolved_component_ref": sum(bool(row["unresolved_component_refs"]) for row in jamb_identity_rows),
        "jamb_identities_without_ccmas_component": sum(not row["component_refs"] for row in jamb_identity_rows),
        "course_rows_linked_to_jamb_scopes": coverage_counts["jamb_linked"],
        "course_rows_not_referenced_by_current_jamb_scope": coverage_counts["not_referenced_by_current_jamb_scope"],
        "selected_ccmas_course_occurrences": sum(course_jamb_occurrences.values()),
        "selected_external_or_custom_course_occurrences": sum(external_jamb_course_counts.values()),
        "course_rows_by_source_candidate_state": dict(sorted((str(k), v) for k, v in state_counts.items())),
    }
    expected = {
        "original_source_documents": 17,
        "jamb_source_documents": 9,
        "jamb_offering_occurrences": 443,
        "ccmas_programme_packages": 237,
        "ccmas_course_rows": 9854,
        "canonical_jamb_identities": 420,
    }
    invariants = {
        key: {"expected": value, "actual": counts[key], "passed": counts[key] == value}
        for key, value in expected.items()
    }
    status = "complete_catalogue_crosswalk_ready" if all(item["passed"] for item in invariants.values()) else "crosswalk_count_mismatch"
    output = {
        "schema": "2026-09-29.ccmas-original-document-crosswalk.v1",
        "generated_on": date.today().isoformat(),
        "status": status,
        "scope": "CCMAS↔JAMB only; downstream domain/subgroup/role mappings are intentionally excluded",
        "counts": counts,
        "invariants": invariants,
        "source_documents": source_rows,
        "jamb_source_documents": jamb_documents,
        "jamb_offering_occurrences": jamb_offering_occurrences,
        "jamb_identities": jamb_identity_rows,
        "course_rows": course_rows,
        "unresolved_component_refs": component_ref_unresolved,
        "external_component_refs": external_component_refs,
        "rules": [
            "The original CCMAS PDF is the source document for its mapped discipline packages.",
            "A JAMB component reference identifies a package; it does not imply that every package course was selected.",
            "Selected course rows are joined independently by source package and course code.",
            "Combined titles are not expanded unless their component package references or selected course evidence says so.",
            "Course candidate states are evidence-routing states, not automatic approval claims.",
            "JAMB identities without a CCMAS component remain in scope for external-resource handling and are not unavailable by default.",
        ],
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# CCMAS original-document crosswalk — 2026-09-29",
        "",
        f"Status: `{status}`",
        "",
        "This is the catalogue-wide deterministic routing map for the CCMAS↔JAMB layer. Downstream domain/subgroup/role mapping is intentionally excluded.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in counts.items())
    lines += ["", "## Invariants", ""]
    lines.extend(f"- **{key}:** {item['actual']} / {item['expected']} — {'PASS' if item['passed'] else 'REVIEW'}" for key, item in invariants.items())
    lines += ["", "## Source documents", ""]
    for source in source_rows:
        lines.extend([
            f"### `{source['source_file']}`",
            "",
            f"- PDF: `{source['original_pdf']}`",
            f"- SHA-256: `{source['sha256']}`",
            f"- Pages: {source['page_count']}; packages: {source['package_count']}; course rows: {source['course_row_count']}",
            f"- JAMB-linked packages: {source['packages_with_jamb_links']}; selected course occurrences: {source['selected_course_occurrence_count']}",
            "",
        ])
    lines += ["## JAMB source documents", ""]
    for source in jamb_documents:
        lines.extend([
            f"### `{source['source_file']}`",
            "",
            f"- Parsed ledger: `{source['parsed_file']}`",
            f"- Official source: {source['official_source_url']}",
            f"- Offering occurrences: {source['offering_occurrence_count']}; canonical identities: {source['canonical_identity_count']}",
            f"- Explicit PDF-verified: {source['pdf_verified_occurrence_count']}; exact PDF-cell pending: {source['pending_exact_pdf_cell_count']}",
            "",
        ])
    lines += ["## Processing rule", "", "Process one original PDF at a time, then one `(package, course code)` record at a time. Reuse is permitted only for identical source blocks after the representative is source-verified. The crosswalk itself does not promote ambiguous records.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "status": status, "counts": counts}, indent=2))


if __name__ == "__main__":
    main()
