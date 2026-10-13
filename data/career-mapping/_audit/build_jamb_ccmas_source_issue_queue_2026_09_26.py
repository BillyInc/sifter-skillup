"""Build the next append-only JAMB/CCMAS source-phase issue queue.

This builder deliberately reads the current ledgers and writes audit artifacts
only.  It does not edit JAMB sources, CCMAS packages, mappings, scopes, seeds,
SQL, UI, or downstream taxonomy data.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


AUDIT = Path(__file__).resolve().parent
ROOT = AUDIT.parent
ACCESS_DATE = "2026-09-26"
OUT_JSON = AUDIT / "jamb_ccmas_source_issue_queue_2026-09-26_001.json"
OUT_MD = AUDIT / "jamb_ccmas_source_issue_queue_2026-09-26_001.md"

CCMAS_INDEX_URL = "https://www.nuc.edu.ng/ccmas/"
JAMB_URLS = {
    "Administration": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
    "Agriculture": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf",
    "Arts and Humanities": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "Arts": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    "Engineering/Technology": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "Engineering and Technology": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    "Medical/Pharmaceutical/Health": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf",
    "Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    "Social/Management Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
    "Social Sciences": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
    "Law": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def source_url_by_file() -> dict[str, str]:
    """Use only direct URLs already present in the checked-in source data.

    If a package has no embedded direct URL, the NUC publication index is used
    as a locator to the discipline download rather than inventing a filename.
    """

    result: dict[str, str] = {}
    for path in sorted((ROOT / "ccmas").glob("*.json")):
        document = read_json(path)
        for package in document.get("programmes", []):
            for course in package.get("courses", []):
                url = course.get("source_url")
                if url:
                    result[path.name] = url
                    break
            if path.name in result:
                break
        result.setdefault(path.name, CCMAS_INDEX_URL)
    return result


def package_course_index() -> dict[tuple[str, str], dict]:
    index: dict[tuple[str, str], dict] = {}
    for path in sorted((ROOT / "ccmas").glob("*.json")):
        document = read_json(path)
        for package in document.get("programmes", []):
            for course in package.get("courses", []):
                item = dict(course)
                item["source_file"] = path.name
                item["source_ccmas_programme"] = package.get("name")
                index[(path.name, str(course.get("code")))] = item
    return index


def fallback_course_evidence(course: dict, urls: dict[str, str]) -> dict:
    source_file = course.get("source_ccmas_file")
    source_url = course.get("source_url") or urls.get(source_file, CCMAS_INDEX_URL)
    locator = course.get("source_locator")
    if not locator:
        locator = (
            f"{source_file or 'unknown CCMAS file'} → "
            f"{course.get('source_ccmas_programme') or 'unknown package'} → "
            f"course code {course.get('code')!s}"
        )
    return {
        "url": source_url,
        "locator": locator,
        "accessed_on": course.get("source_accessed_on") or ACCESS_DATE,
        "source_url_verified_in_row": bool(course.get("source_url")),
    }


def offering_evidence(identity: dict) -> list[dict]:
    result = []
    for occurrence in identity.get("source_offerings", []):
        faculty = occurrence.get("source_faculty") or identity.get("mapping_faculty")
        url = occurrence.get("official_source_url") or JAMB_URLS.get(faculty)
        locator = occurrence.get("pdf_table_locator")
        if not locator:
            locator = (
                f"{occurrence.get('source_file')} → "
                f"parsed row ordinal {occurrence.get('parsed_row_ordinal')} → "
                f"{occurrence.get('source_jamb_name')}"
            )
        result.append(
            {
                "occurrence_id": occurrence.get("occurrence_id"),
                "source_faculty": faculty,
                "source_file": occurrence.get("source_file"),
                "url": url,
                "locator": locator,
                "accessed_on": occurrence.get("verification_date") or ACCESS_DATE,
                "exact_pdf_verified": bool(occurrence.get("offering_row_verified_against_pdf")),
                "institution_tokens_as_parsed": occurrence.get("institution_tokens_as_parsed", []),
            }
        )
    return result


def scope_evidence(scope: dict) -> list[dict]:
    return [
        {
            "url": item.get("url"),
            "locator": item.get("locator"),
            "accessed_on": item.get("accessed_on") or ACCESS_DATE,
            "authority": item.get("authority"),
            "supports": item.get("supports"),
        }
        for item in scope.get("scope_evidence", [])
    ]


def course_locators(scope: dict, urls: dict[str, str]) -> list[dict]:
    result = []
    for course in scope.get("selected_courses", []):
        citation_complete = all(
            course.get(field)
            for field in ("source_url", "source_locator", "source_accessed_on")
        )
        evidence = fallback_course_evidence(course, urls)
        result.append(
            {
                "code": course.get("code"),
                "title": course.get("title"),
                "source_file": course.get("source_ccmas_file"),
                "source_package": course.get("source_ccmas_programme"),
                "citation_complete": citation_complete,
                "evidence": evidence,
            }
        )
    return result


def add_issue(issues: list[dict], identity: dict | None, issue_type: str, status: str, severity: str, title: str, recommendation: str, evidence: list[dict], affected: dict | None = None) -> str:
    issue_id = f"SRC-{len(issues) + 1:05d}"
    issue = {
        "issue_id": issue_id,
        "status": status,
        "severity": severity,
        "issue_type": issue_type,
        "title": title,
        "canonical_order": identity.get("canonical_order") if identity else None,
        "jamb_name": identity.get("jamb_name") if identity else None,
        "recommendation": recommendation,
        "evidence": evidence,
    }
    if affected:
        issue["affected_records"] = affected
    issues.append(issue)
    return issue_id


def build() -> dict:
    inventory = read_json(AUDIT / "jamb_anomaly_inventory_2026-09-26.json")
    scopes = read_json(AUDIT / "jamb_curriculum_scopes_2026-08-17.json")["rows"]
    offerings = read_json(AUDIT / "jamb_offering_context_inventory_2026-09-25.json")["identities"]
    anomalies = read_json(AUDIT / "ccmas_extraction_anomaly_inventory_2026-09-26.json")
    external = read_json(AUDIT / "jamb_ccmas_external_audit_inventory_2026-09-26.json")
    urls = source_url_by_file()
    course_index = package_course_index()
    scopes_by_name = {row["jamb_name"]: row for row in scopes}
    offerings_by_name = {row["jamb_name"]: row for row in offerings}
    external_by_name = {row["jamb_name"]: row for row in external.get("external_or_unanchored_scope_rows", [])}

    issues: list[dict] = []
    identity_rows: list[dict] = []

    for inv in sorted(inventory["rows"], key=lambda item: item["canonical_order"]):
        name = inv["jamb_name"]
        scope = scopes_by_name[name]
        offering = offerings_by_name[name]
        evidence = scope_evidence(scope)
        offering_refs = offering_evidence(offering)
        if not evidence:
            evidence = offering_refs
        course_records = course_locators(scope, urls)
        identity_issue_ids: list[str] = []

        if not scope.get("scope_evidence"):
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "scope_evidence_missing",
                    "confirmed_gap",
                    "high",
                    "Scope has no itemized JAMB/CCMAS evidence bundle",
                    "Attach the exact JAMB offering locator and the selected CCMAS or external component/course evidence before closure; do not promote from the name-keyed mapping alone.",
                    offering_refs,
                    {"component_refs": scope.get("component_refs", []), "selected_course_count": len(scope.get("selected_courses", []))},
                )
            )

        if any(not ref.get("exact_pdf_verified") for ref in offering_refs):
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "offering_context_unverified",
                    "confirmed_gap",
                    "high",
                    "At least one source offering cell is not PDF-verified",
                    "Verify each institution/faculty occurrence against the exact JAMB table cell and preserve distinct occurrences; do not collapse same-name offerings.",
                    offering_refs,
                    {"source_offering_count": len(offering_refs), "distinct_faculties": offering.get("distinct_source_faculties", [])},
                )
            )

        incomplete = [record for record in course_records if not record["citation_complete"]]
        if incomplete:
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "selected_course_citation_incomplete",
                    "confirmed_gap",
                    "high",
                    "Selected CCMAS/external course records lack complete item-level citation triples",
                    "Populate a source URL, exact package/course locator, and access date for every selected course; keep the row out of confirmed student scope until checked.",
                    [item["evidence"] for item in incomplete],
                    {"selected_course_count": len(course_records), "incomplete_count": len(incomplete), "course_locators": incomplete},
                )
            )

        if any(gap in inv.get("evidence_gaps", []) for gap in ("selected_ccmas_content_missing_or_placeholder", "selected_ccmas_outcomes_missing", "selected_ccmas_units_missing")):
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "selected_course_content_or_outcome_gap",
                    "confirmed_gap",
                    "high",
                    "Selected source rows have missing/placeholder content, outcomes, or units",
                    "Compare each affected course against the authoritative NUC CCMAS page and recover only source-authored content/outcomes; do not infer missing prose.",
                    [item["evidence"] for item in course_records if not item["citation_complete"]] or evidence,
                    {"evidence_gaps": inv.get("evidence_gaps", []), "affected_course_locators": course_records},
                )
            )

        if scope.get("unrepresented_facets"):
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "named_facet_unrepresented",
                    "confirmed_gap",
                    "critical",
                    "A substantive title facet is not represented in the selected scope",
                    "Find the matching CCMAS component or authoritative provider-specific external curriculum, then verify its courses/outcomes before considering any combined scope complete.",
                    evidence or offering_refs,
                    {"unrepresented_facets": scope.get("unrepresented_facets"), "component_refs": scope.get("component_refs", [])},
                )
            )

        if len(scope.get("component_refs", [])) > 1 and not scope.get("selected_courses"):
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "combined_scope_zero_courses",
                    "confirmed_gap",
                    "critical",
                    "Combined scope declares multiple components but selects no courses",
                    "Build a bounded component-by-component evidence bundle; do not infer a union from the title or mark the programme unavailable solely because the local scope is empty.",
                    evidence or offering_refs,
                    {"component_refs": scope.get("component_refs", [])},
                )
            )

        if "review_required" in scope.get("scope_status", ""):
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "scope_semantic_review_required",
                    "candidate",
                    "medium",
                    "Current scope remains review-required",
                    "Reconcile the exact offering context, each named component, selected courses/outcomes, and supported student-facing status; a review label is not evidence of correctness.",
                    evidence or offering_refs,
                    {"scope_status": scope.get("scope_status"), "scope_reason": scope.get("scope_reason")},
                )
            )

        if scope.get("scope_status", "").startswith("external") or not scope.get("component_refs") or external_by_name.get(name):
            custom_courses = external_by_name.get(name, {}).get("custom_or_unanchored_courses", [])
            external_evidence = [
                {
                    "url": course.get("source_url"),
                    "locator": course.get("source_locator") or f"external/custom course {course.get('code')} — {course.get('title')}",
                    "accessed_on": ACCESS_DATE,
                }
                for course in custom_courses
            ]
            if not external_evidence:
                external_evidence = evidence or offering_refs
            identity_issue_ids.append(
                add_issue(
                    issues,
                    inv,
                    "external_or_custom_evidence_contract",
                    "confirmed_gap" if not custom_courses else "candidate",
                    "high",
                    "External/custom curriculum evidence is not fully item-cited",
                    "For every external/custom course, retain an authoritative item-specific URL, locator, access date, provider/programme context, and limits of applicability; do not treat a custom scope as a CCMAS degree anchor.",
                    external_evidence,
                    {"custom_course_count": len(custom_courses), "component_refs": scope.get("component_refs", [])},
                )
            )

        identity_rows.append(
            {
                "canonical_order": inv["canonical_order"],
                "jamb_name": name,
                "scope_status": scope.get("scope_status"),
                "component_refs": scope.get("component_refs", []),
                "selected_course_count": len(scope.get("selected_courses", [])),
                "source_offering_count": offering.get("source_offering_count", 0),
                "issue_ids": identity_issue_ids,
                "identity_state": "open" if identity_issue_ids else "no_current_issue_detected",
            }
        )

    catalogue_candidates: list[dict] = []
    closed_source_repeats = {
        ("allied_health.json", "Dental Technology", "DNT 309"),
        ("allied_health.json", "Dental Therapy", "DTH 521"),
        ("basic_medical.json", "Human Anatomy", "ANA 341"),
    }
    for candidate in anomalies.get("candidates", {}).get("exact_duplicate_outcome_course_rows", []):
        key = (candidate.get("source_file"), candidate.get("programme"), candidate.get("code"))
        if key in closed_source_repeats:
            state = "classified_source_repeat_no_repair"
            recommendation = "Keep the repeated outcome because the official source review classified it as source-authored; do not deduplicate student content without changing the source meaning."
        else:
            state = "candidate"
            recommendation = "Compare the complete course block against the original NUC PDF and classify source repeat versus extractor duplication before any repair."
        url = urls.get(candidate.get("source_file"), CCMAS_INDEX_URL)
        catalogue_candidates.append(
            {
                "issue_type": "duplicate_outcome_text",
                "status": state,
                "severity": "medium" if state == "candidate" else "informational",
                "title": f"{candidate.get('source_file')} → {candidate.get('programme')} → {candidate.get('code')}",
                "evidence": [{"url": url, "locator": f"CCMAS package {candidate.get('programme')}, course {candidate.get('code')} ({candidate.get('title')})", "accessed_on": ACCESS_DATE}],
                "details": candidate.get("repeated_outcomes", []),
                "recommendation": recommendation,
            }
        )
    for candidate in anomalies.get("candidates", {}).get("page_header_spill", []):
        url = urls.get(candidate.get("source_file"), CCMAS_INDEX_URL)
        catalogue_candidates.append(
            {
                "issue_type": "page_header_spill_candidate",
                "status": "candidate",
                "severity": "high",
                "title": f"{candidate.get('source_file')} → {candidate.get('programme')} → {candidate.get('code')}",
                "evidence": [{"url": url, "locator": f"CCMAS package {candidate.get('programme')}, course {candidate.get('code')} ({candidate.get('title')}); contaminated excerpt retained in anomaly inventory", "accessed_on": ACCESS_DATE}],
                "details": {"content_excerpt": candidate.get("content_excerpt")},
                "recommendation": "Compare the exact NUC printed page and repair only the confirmed boundary spill; preserve legitimate equipment or next-course text when source-authored.",
            }
        )
    for candidate in anomalies.get("candidates", {}).get("empty_content_summary", []):
        url = urls.get(candidate.get("source_file"), CCMAS_INDEX_URL)
        catalogue_candidates.append(
            {
                "issue_type": "empty_or_placeholder_content_candidate",
                "status": "candidate",
                "severity": "medium",
                "title": f"{candidate.get('source_file')} → {candidate.get('programme')} → {candidate.get('code')}",
                "evidence": [{"url": url, "locator": f"CCMAS package {candidate.get('programme')}, course {candidate.get('code')} ({candidate.get('title')}); local extracted record has no narrative summary", "accessed_on": ACCESS_DATE}],
                "recommendation": "Check the original NUC course block. Classify placements/projects/attachments with no prose separately from parser omissions; recover only source-authored content and outcomes.",
            }
        )

    counts = Counter(issue["status"] for issue in issues)
    catalogue_counts = Counter(item["status"] for item in catalogue_candidates)
    return {
        "schema_version": 1,
        "audit_date": ACCESS_DATE,
        "status": "open_source_phase",
        "purpose": "All-420 JAMB identity and all-237 CCMAS source-phase issue queue with evidence bundles; no downstream taxonomy work.",
        "scope": {
            "canonical_jamb_identities": len(identity_rows),
            "ccmas_programme_packages": 237,
            "ccmas_course_records": 9854,
            "identity_rows_with_open_issues": sum(row["identity_state"] == "open" for row in identity_rows),
            "identity_rows_without_current_issue_detected": sum(row["identity_state"] != "open" for row in identity_rows),
        },
        "issue_counts": dict(sorted(counts.items())),
        "catalogue_candidate_counts": dict(sorted(catalogue_counts.items())),
        "closure_contract": "No identity closes until its exact JAMB offering context, every substantive title component, selected course/outcome fidelity, item-level source URL/locator/access date, and student-facing status are all verified. Candidate anomaly queues are not proof of defects. Downstream domain/subgroup/role audit remains deferred.",
        "closed_work_not_reopened": [
            "French Arts CCMAS anchor correction",
            "Film and Video Studies Social/Management source occurrence addition",
            "CCMAS page-header repairs already recorded in the local fix log",
            "CAM 424 equipment spill repair",
            "DTS 498 and CSC 432 cross-reference repair",
            "replacement-character normalization classified as encoding-only",
        ],
        "identity_rows": identity_rows,
        "issues": issues,
        "catalogue_candidates": catalogue_candidates,
        "source_artifacts": {
            "jamb_anomaly_inventory": "_audit/jamb_anomaly_inventory_2026-09-26.json",
            "jamb_scope_ledger": "_audit/jamb_curriculum_scopes_2026-08-17.json",
            "offering_inventory": "_audit/jamb_offering_context_inventory_2026-09-25.json",
            "ccmas_anomaly_inventory": "_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json",
        },
        "writes": {
            "shared_source_files_edited": False,
            "shared_mapping_files_edited": False,
            "scope_or_seed_files_edited": False,
            "downstream_domain_subgroup_role_files_edited": False,
            "sql_or_ui_files_edited": False,
        },
    }


def write_markdown(report: dict) -> None:
    lines = [
        "# JAMB–CCMAS source issue queue — 2026-09-26 (001)",
        "",
        "Status: **open source phase**. This append-only checkpoint covers all 420 JAMB identities and the current 237-package CCMAS anomaly queue. It does not edit shared source/mapping files or downstream taxonomy data.",
        "",
        "## Scope",
        "",
    ]
    for key, value in report["scope"].items():
        lines.append(f"- `{key}`: **{value}**")
    lines += [
        "",
        "## Issue counts",
        "",
    ]
    for key, value in report["issue_counts"].items():
        lines.append(f"- identity `{key}`: **{value}**")
    for key, value in report["catalogue_candidate_counts"].items():
        lines.append(f"- catalogue `{key}`: **{value}**")
    lines += [
        "",
        "The JSON queue contains evidence URL, locator, access date, affected course locators, confirmed-gap versus candidate state, and repair recommendation for each recorded issue. Existing closed local repairs are listed but not reopened.",
        "",
        "## Source-phase closure rule",
        "",
        report["closure_contract"],
        "",
        "Downstream domain, subgroup, role, and role-naming audits remain deferred.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    report = build()
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_markdown(report)
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "scope": report["scope"], "issue_counts": report["issue_counts"], "catalogue_candidate_counts": report["catalogue_candidate_counts"]}, indent=2))


if __name__ == "__main__":
    main()
