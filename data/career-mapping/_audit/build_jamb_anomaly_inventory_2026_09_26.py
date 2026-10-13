"""Build the catalogue-wide JAMB anomaly inventory.

This is a deterministic inventory layer over the canonical 420 identities,
offering-context ledger and generated scope contract. It deliberately records
evidence gaps and review candidates separately from confirmed defects; it does
not promote, remove or silently rewrite any mapping.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
OUT_JSON = AUDIT / "jamb_anomaly_inventory_2026-09-26.json"
OUT_MD = AUDIT / "jamb_anomaly_inventory_2026-09-26.md"


def nonempty(value: object) -> bool:
    return value is not None and value != "" and value != []


def main() -> None:
    scopes = json.loads((AUDIT / "jamb_curriculum_scopes_2026-08-17.json").read_text(encoding="utf-8"))[
        "rows"
    ]
    offering_doc = json.loads(
        (AUDIT / "jamb_offering_context_inventory_2026-09-25.json").read_text(encoding="utf-8")
    )
    offerings = {row["jamb_name"]: row for row in offering_doc["identities"]}
    rows: list[dict] = []
    for scope in scopes:
        name = scope["jamb_name"]
        offering = offerings.get(name, {})
        occurrences = offering.get("source_offerings", [])
        selected = scope.get("selected_courses", [])
        selected_ccmas = [row for row in selected if row.get("source_ccmas_programme")]
        citations_complete = [
            row
            for row in selected
            if all(nonempty(row.get(field)) for field in ("source_url", "source_locator", "source_accessed_on"))
        ]
        flags: list[str] = []
        evidence_gaps: list[str] = []
        if not occurrences:
            flags.append("no_offering_occurrence")
        if occurrences and not all(row.get("offering_row_verified_against_pdf") for row in occurrences):
            evidence_gaps.append("offering_cell_not_pdf_verified")
        if len(offering.get("distinct_source_faculties", [])) > 1:
            flags.append("multiple_source_faculties_preserve_contexts")
        if offering.get("mapping_faculty") and offering.get("mapping_faculty") not in offering.get("distinct_source_faculties", []):
            flags.append("mapping_faculty_absent_from_parsed_source_faculties")
        if scope.get("inheritance_type") in {"partial_curriculum_scope", "combined_curriculum_scope"}:
            if not scope.get("component_refs"):
                flags.append("partial_or_combined_without_component_refs")
            if not selected:
                flags.append("partial_or_combined_without_selected_courses")
        if len(scope.get("component_refs", [])) > 1 and not selected:
            flags.append("multiple_components_but_zero_selected_courses")
        if scope.get("unrepresented_facets"):
            flags.append("unrepresented_named_facets")
        if selected and len(citations_complete) != len(selected):
            evidence_gaps.append("selected_course_citation_incomplete")
        if selected_ccmas and any(row.get("units") is None for row in selected_ccmas):
            evidence_gaps.append("selected_ccmas_units_missing")
        if selected_ccmas and any(not row.get("content_summary") or row.get("content_summary") in {"---", "—", "-"} for row in selected_ccmas):
            evidence_gaps.append("selected_ccmas_content_missing_or_placeholder")
        if selected_ccmas and any(not row.get("learning_outcomes") for row in selected_ccmas):
            evidence_gaps.append("selected_ccmas_outcomes_missing")
        if scope.get("domain_links") and scope.get("scope_approval") not in {"reviewed", "not_applicable"}:
            flags.append("domain_links_present_while_scope_not_approved")
        if scope.get("scope_status") in {"partial_scope_review_required", "combined_scope_review_required", "full_scope_review_required"}:
            evidence_gaps.append("scope_review_required")
        rows.append(
            {
                "canonical_order": offering.get("canonical_order"),
                "jamb_name": name,
                "mapping_faculty": offering.get("mapping_faculty"),
                "mapping_type": offering.get("mapping_type"),
                "source_offering_count": len(occurrences),
                "distinct_source_faculties": offering.get("distinct_source_faculties", []),
                "source_occurrence_ids": [row.get("occurrence_id") for row in occurrences],
                "scope_status": scope.get("scope_status"),
                "scope_approval": scope.get("scope_approval"),
                "inheritance_type": scope.get("inheritance_type"),
                "component_refs": scope.get("component_refs", []),
                "selected_course_count": len(selected),
                "selected_ccmas_course_count": len(selected_ccmas),
                "selected_course_citations_complete": len(citations_complete),
                "selected_course_citations_missing": len(selected) - len(citations_complete),
                "flags": sorted(set(flags)),
                "evidence_gaps": sorted(set(evidence_gaps)),
                "unrepresented_facets": scope.get("unrepresented_facets", []),
            }
        )

    range_artifacts = sorted(
        path.name
        for path in AUDIT.glob("jamb_ccmas_*rows_*.md")
        if "inventory" not in path.name
    )
    counts = {
        "canonical_identities": len(rows),
        "identities_with_any_flags": sum(bool(row["flags"]) for row in rows),
        "identities_with_evidence_gaps": sum(bool(row["evidence_gaps"]) for row in rows),
        "no_offering_occurrence": sum("no_offering_occurrence" in row["flags"] for row in rows),
        "unverified_offering_context": sum("offering_cell_not_pdf_verified" in row["evidence_gaps"] for row in rows),
        "multiple_source_faculty_contexts": sum("multiple_source_faculties_preserve_contexts" in row["flags"] for row in rows),
        "partial_or_combined_zero_course_scopes": sum("partial_or_combined_without_selected_courses" in row["flags"] for row in rows),
        "unrepresented_facet_rows": sum("unrepresented_named_facets" in row["flags"] for row in rows),
        "scope_review_required": sum("scope_review_required" in row["evidence_gaps"] for row in rows),
        "selected_course_citation_gap_rows": sum("selected_course_citation_incomplete" in row["evidence_gaps"] for row in rows),
        "domain_links_with_unapproved_scope": sum("domain_links_present_while_scope_not_approved" in row["flags"] for row in rows),
    }
    report = {
        "schema_version": 1,
        "audit_date": "2026-09-26",
        "status": "complete_deterministic_inventory_open_semantic_review",
        "scope": "All 420 canonical JAMB identities; distinct source offering occurrences; generated curriculum scopes and selected-course evidence.",
        "source_artifacts": [
            "jamb_offering_context_inventory_2026-09-25.json",
            "jamb_curriculum_scopes_2026-08-17.json",
            "jamb_ccmas_mapping_quality_2026-09-24/",
            "jamb_ccmas_local_fix_log_2026-09-26.md",
        ],
        "counts": counts,
        "classification_contract": {
            "flags": "Deterministically observable mapping/scope conditions requiring correction or explicit adjudication.",
            "evidence_gaps": "Missing or incomplete proof; not a claim that the curriculum or offering is wrong.",
            "not_done": "This inventory does not itself verify every JAMB PDF cell, every course against NUC text, external curriculum equivalence, or downstream domain status. Those require source adjudication and are intentionally left open.",
        },
        "existing_range_artifacts_seen": range_artifacts,
        "rows": rows,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    flag_counts = Counter(flag for row in rows for flag in row["flags"])
    gap_counts = Counter(gap for row in rows for gap in row["evidence_gaps"])
    lines = [
        "# JAMB anomaly inventory — 2026-09-26",
        "",
        "Status: complete deterministic inventory for all 420 canonical identities; semantic source adjudication remains open.",
        "",
        "This inventory does not treat a missing citation as a wrong curriculum, or a review label as proof. It records every identity and separates deterministic flags from evidence gaps.",
        "",
        "## Catalogue counts",
        "",
    ]
    lines += [f"- `{key}`: **{value}**" for key, value in counts.items()]
    lines += ["", "## Flag counts", ""] + [f"- `{key}`: **{value}**" for key, value in sorted(flag_counts.items())]
    lines += ["", "## Evidence-gap counts", ""] + [f"- `{key}`: **{value}**" for key, value in sorted(gap_counts.items())]
    lines += [
        "",
        "## Interpretation",
        "",
        "The JSON contains one row for each of the 420 identities, including identities with no deterministic flag. Existing range checkpoint filenames are listed in the JSON. This is the saved catalogue-wide inventory requested by the audit; it is not a claim that all source searches or semantic fixes are complete.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": counts}, indent=2))


if __name__ == "__main__":
    main()
