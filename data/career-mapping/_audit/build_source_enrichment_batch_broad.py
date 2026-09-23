"""Build the broad, fail-closed source-enrichment checkpoint.

This artifact is intentionally compact: it inventories every canonical JAMB
identity and programme while retaining the existing CCMAS/source locators and
the exact review state for data that still needs external verification.  It
does not modify generated seed transport or apply SQL.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
OUT = AUDIT / "source_enrichment_batch_broad_2026-09-19.json"

INHERITANCE = AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
MATRIX = AUDIT / "jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json"
JAMB_AUDIT = AUDIT / "jamb_brochure_source_audit_2026-08-17.json"
SCALING = AUDIT / "programme_scaling_contract_2026-09-19.json"
CURRICULUM = AUDIT / "programme_curriculum_contract_2026-09-18.json"
SOCIOLOGY = AUDIT / "sociology_curriculum_contract_2026-09-17.json"
MAPPING = ROOT / "programme_domain_final.json"

JAMB_ELIGIBILITY = "https://eligibility.jamb.gov.ng/"
JAMB_BROCHURES = {
    "Arts _ Humanities.pdf": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "Engineering _ Enviromental _ Technology.pdf": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "Education.pdf": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf",
    "Sciences.pdf": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    "Social Management Science.pdf": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
}

NUC_CCMAS_OVERVIEW = "https://www.nuc.edu.ng/ccmas-unveiled-nuc-diamond-jubilee-celebrations/"


def read(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def source_ref_for_jamb(name: str, audit_row: dict | None) -> dict:
    hits = [] if audit_row is None else audit_row.get("source_hits", [])
    aliases = [] if audit_row is None else audit_row.get("source_alias_hits", [])
    files = [h.get("file") for h in hits if h.get("file")]
    files.extend(h.get("file") for h in aliases if h.get("file"))
    source_file = files[0] if files else None
    url = JAMB_BROCHURES.get(source_file, JAMB_ELIGIBILITY)
    state = "source_backed" if audit_row is not None and files else "review_required"
    if audit_row is None:
        locator = (
            "The identity is present in the 420-row canonical inheritance set but "
            "has no row in the local 2026-08-17 brochure audit; verify the exact "
            "programme in the JAMB IBASS programme selector before exposure."
        )
    else:
        locator = {
            "local_audit": "jamb_brochure_source_audit_2026-08-17.json#rows[jamb_name=" + name + "]",
            "source_files": sorted(set(files)),
            "pages": sorted(
                {
                    page
                    for hit in hits + aliases
                    for page in hit.get("pages", [])
                    if isinstance(page, int)
                }
            ),
        }
    return {
        "authority": "Joint Admissions and Matriculation Board",
        "url": url,
        "accessed_on": "2026-09-19",
        "state": state,
        "locator": locator,
        "limitation": (
            "JAMB evidence establishes catalogue identity/eligibility context; it does "
            "not by itself establish a CCMAS curriculum or a downstream relationship."
        ),
    }


def category_by_name(matrix: dict) -> dict[str, str]:
    result = {}
    for category in matrix["categories"]:
        for name in category["jamb_names"]:
            result[name] = category["category"]
    return result


def concise_component(component: dict) -> dict:
    return {
        key: component.get(key)
        for key in ("discipline", "name", "code", "role", "resolution_method")
        if component.get(key) is not None
    }


def jamb_records(inheritance: dict, matrix: dict, jamb_audit: dict) -> list[dict]:
    categories = category_by_name(matrix)
    audit_rows = {row["jamb_name"]: row for row in jamb_audit["rows"]}
    records = []
    for row in inheritance["rows"]:
        category = categories[row["jamb_name"]]
        links = row.get("domain_links", [])
        status = row.get("mapping_status", "review_required")
        records.append(
            {
                "jamb_name": row["jamb_name"],
                "coverage_category": category,
                "mapping_type": row.get("mapping_type"),
                "inheritance_type": row.get("inheritance_type"),
                "mapping_status": status,
                "primary_component": concise_component(row["primary_component"])
                if row.get("primary_component")
                else None,
                "supporting_components": [
                    concise_component(component)
                    for component in row.get("supporting_components", [])
                ],
                "component_refs": row.get("component_refs", []),
                "curriculum_scope": {
                    "status": (row.get("curriculum_scope") or {}).get("status"),
                    "selected_course_count": (row.get("curriculum_scope") or {}).get(
                        "selected_course_count", 0
                    ),
                    "selected_course_codes": (row.get("curriculum_scope") or {}).get(
                        "selected_course_codes", []
                    ),
                    "note": (row.get("curriculum_scope") or {}).get("note"),
                },
                "source_references": [
                    source_ref_for_jamb(row["jamb_name"], audit_rows.get(row["jamb_name"])),
                    {
                        "authority": "National Universities Commission",
                        "url": NUC_CCMAS_OVERVIEW,
                        "accessed_on": "2026-09-19",
                        "locator": "CCMAS overview lines 42-53 and 114-127: national CCMAS framework and stakeholder curriculum review.",
                        "state": "framework_source",
                    },
                ],
                "external_enrichment": {
                    "curriculum": (
                        "review_required"
                        if category == "external_sources_required"
                        else "scope_preserved_reviewed"
                    ),
                    "resources": "review_required",
                    "relationships": "not_established"
                    if not links
                    else "review_required",
                    "student_exposure": "fail_closed_until_item_and_edge_review",
                },
                "current_domain_link_count": len(links),
            }
        )
    return records


def programme_records(scaling: dict, curriculum: dict, sociology: dict, mapping: dict) -> list[dict]:
    generic = {
        f"{row['discipline']}::{row['programme']}": row
        for row in curriculum["programmes"]
    }
    result = []
    for row in scaling["programmes"]:
        key = row["programmeKey"]
        current_map = mapping.get(key, {})
        context = row["context"]
        curriculum_row = generic.get(key)
        if curriculum_row:
            source_locator = {
                "source_file": curriculum_row["sourceFile"],
                "local_audit": "programme_curriculum_contract_2026-09-18.json#programmes[programme="
                + row["programme"]
                + "]",
                "authority_url": NUC_CCMAS_OVERVIEW,
            }
            curriculum_state = "source_backed_contract"
        else:
            source_locator = {
                "source_file": sociology["sourceAuthority"]["jsonFile"],
                "original_pdf": sociology["sourceAuthority"]["originalPdf"],
                "local_audit": "sociology_curriculum_contract_2026-09-17.json#programme",
                "authority_url": NUC_CCMAS_OVERVIEW,
            }
            curriculum_state = "source_backed_contract"
        unresolved = context.get("unresolvedOrNotEstablishedRelationships", 0)
        result.append(
            {
                "programme_key": key,
                "discipline": row["discipline"],
                "programme": row["programme"],
                "curriculum": {
                    "state": curriculum_state,
                    "course_count": row["curriculum"]["courseCount"],
                    "outcome_count": row["curriculum"]["contractStudentOutcomeCount"],
                    "source_locator": source_locator,
                },
                "active_domain_mapping": {
                    "state": "mapped" if current_map.get("links") else "review_required",
                    "link_count": len(current_map.get("links", [])),
                    "links": [
                        {
                            "domain_id": link.get("domain_id"),
                            "domain_name": link.get("domain_name"),
                            "match_type": link.get("match_type"),
                            "source": link.get("src"),
                        }
                        for link in current_map.get("links", [])
                    ],
                },
                "resource_review": {
                    "state": "review_required",
                    "reason": "item-specific external learning/resource review is not complete for the full canonical population; no generic homepage is substituted.",
                },
                "relationship_review": {
                    "state": "not_established" if unresolved else "review_required",
                    "unresolved_or_not_established_count": unresolved,
                    "reason": "Only same-context source-backed edges may reach students; unresolved endpoints remain staff/audit evidence.",
                },
                "admin_review": {
                    "state": "pending_full_population_render",
                    "must_show_provenance_and_state": True,
                },
            }
        )
    return result


def carried_forward_sources() -> list[dict]:
    records = []
    for filename in (
        "source_enrichment_batch_2026-09-19.json",
        "source_enrichment_batch_generic_2026-09-19.json",
        "source_enrichment_batch_tiny_2026-09-19.json",
    ):
        path = AUDIT / filename
        if path.exists():
            records.append(
                {
                    "artifact": filename,
                    "records": read(path).get("records", []),
                }
            )
    return records


def main() -> None:
    inheritance = read(INHERITANCE)
    matrix = read(MATRIX)
    jamb_audit = read(JAMB_AUDIT)
    scaling = read(SCALING)
    curriculum = read(CURRICULUM)
    sociology = read(SOCIOLOGY)
    mapping = read(MAPPING)
    jamb = jamb_records(inheritance, matrix, jamb_audit)
    programmes = programme_records(scaling, curriculum, sociology, mapping)
    payload = {
        "schema": "2026-09-19.source-enrichment-batch.broad.v1",
        "accessed_on": "2026-09-19",
        "selection_policy": "Broad deterministic inventory over all 420 canonical JAMB identities and 237 canonical programmes. Existing evidence is retained; missing external evidence remains review_required or not_established and is never promoted by inventory generation.",
        "scope": {
            "jamb_identity_count": len(jamb),
            "canonical_programme_count": len(programmes),
            "partial_curriculum_cases": sum(
                1 for row in jamb if row["coverage_category"] == "partial_curriculum_scope"
            ),
            "no_or_external_ccmas_cases": sum(
                1 for row in jamb if row["coverage_category"] == "external_sources_required"
            ),
            "multi_discipline_cases": matrix["combined_detail"]["rows_with_two_or_more_named_ccmas_disciplines"],
            "split_ccmas_component_count": matrix["split_fanout_review_queue"]["component_count"],
            "split_ccmas_identity_count": matrix["split_fanout_review_queue"]["unique_jamb_row_count"],
        },
        "authoritative_source_catalog": {
            "jamb_eligibility_checker": {
                "authority": "Joint Admissions and Matriculation Board",
                "url": JAMB_ELIGIBILITY,
                "locator": "Programme selector and UTME subject-combination checker, lines 4-24 and 51-63.",
            },
            "nuc_ccmas_framework": {
                "authority": "National Universities Commission",
                "url": NUC_CCMAS_OVERVIEW,
                "locator": "CCMAS launch and stakeholder-review explanation, lines 42-53 and 114-127.",
            },
            "mathematics_external_curriculum_noun": {
                "authority": "National Open University of Nigeria",
                "url": "https://fos.nou.edu.ng/b-sc-mathematics/",
                "locator": "Lines 122-143: statistics, programming, numerical analysis and probability in the B.Sc. Mathematics structure.",
            },
            "mathematics_external_curriculum_abu": {
                "authority": "Ahmadu Bello University",
                "url": "https://physicalsciences.abu.edu.ng/department/mathematics/public/BScMathematics.php",
                "locator": "Lines 60-82: numerical analysis, probability distributions, programming and mathematical modelling.",
            },
        },
        "jamb_identities": jamb,
        "canonical_programmes": programmes,
        "carried_forward_external_checkpoints": carried_forward_sources(),
        "states": {
            "allowed": [
                "source_backed",
                "scope_preserved_reviewed",
                "source_backed_contract",
                "review_required",
                "not_established",
                "unavailable",
            ],
            "student_policy": "review_required, not_established and unavailable records remain out of student guidance; admin/audit views may show their provenance and limitation.",
        },
        "sql_and_transport": {
            "sql_applied": False,
            "generated_gzip_edited": False,
            "browser_proof": False,
        },
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(jamb)} JAMB and {len(programmes)} programme records to {OUT.name}")


if __name__ == "__main__":
    main()
