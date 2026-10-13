"""Build a lane-local JAMB occurrence reconciliation ledger from Gate 1 artifacts.

This is an audit artifact generator only. It does not modify source mappings,
curriculum scopes, course JSON, SQL, or seeds.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
DISCOVERY = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
TEXT_SEARCH = AUDIT / "jamb_ccmas_local_source_text_search_2026-09-28.json"
OUT = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_005_jamb_occurrence_reconciliation.json"
CARRIED_FORWARD = {
    "a5edd843e2f91232": {
        "disposition": "confirmed_match_carried_forward",
        "source_url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
        "printed_locator": "p. 48, Administration degree-awarding institutions table: ACCOUNTING AND FINANCE — BCU",
        "evidence_reference": "jamb_curriculum_scopes_2026-08-17.json — Accounting and Finance scope_evidence",
    },
    "edb439100ecfa68a": {
        "disposition": "confirmed_match_carried_forward",
        "source_url": "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
        "printed_locator": "p. 576, Social Sciences degree-awarding institutions table: ACCOUNTING AND FINANCE — FEDOTUOKE",
        "evidence_reference": "jamb_curriculum_scopes_2026-08-17.json — Accounting and Finance scope_evidence",
    },
}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    discovery = load(DISCOVERY)
    text_search = load(TEXT_SEARCH)
    text_by_id = {row["occurrence_id"]: row for row in text_search["jamb_occurrences"]}
    assigned = [row for row in discovery["jamb_identities"] if row["canonical_order"] <= 140]

    identities = []
    for identity in assigned:
        order = identity["canonical_order"]
        if order <= 60:
            prior = {
                "scope": "individual bounded identity/source-text windows",
                "references": [
                    "jamb_offering_source_context_incremental_checkpoint_2026-09-26_005.md (001-020)",
                    "jamb_offering_source_context_incremental_checkpoint_2026-09-26_006.md (021-040)",
                    "jamb_offering_source_context_incremental_checkpoint_2026-09-26_007.md (041-060)",
                ],
                "limit": "These record local extracted-text windows and catalogue joins; they do not uniformly establish visual exact-cell PDF verification.",
            }
        elif order <= 80:
            prior = {
                "scope": "catalogue/inventory scan; 061-080 structural scan noted in aggregate",
                "references": ["jamb_offering_source_context_aggregate_checkpoint_2026-09-26_final.md"],
                "limit": "No exact per-occurrence PDF-cell closure credited by this reconciliation.",
            }
        else:
            prior = {
                "scope": "catalogue-level source-audit inventory only",
                "references": [
                    "jamb_offering_source_context_aggregate_checkpoint_2026-09-26_final.md",
                    "jamb_brochure_source_audit_2026-08-17.json",
                ],
                "limit": "A catalogue match/source hit is not an exact awarder-cell and continuation-boundary check.",
            }

        occurrences = []
        for source in identity["source_occurrences"]:
            text = text_by_id.get(source["occurrence_id"], {})
            carried = CARRIED_FORWARD.get(source["occurrence_id"])
            lane_disposition = (
                carried["disposition"]
                if carried
                else "existing_pdf_flag_locator_requires_source_pointer_audit"
                if source["verified_against_pdf"] and source["pdf_table_locator"]
                else "prior_checkpoint_join_required"
            )
            occurrences.append(
                {
                    "occurrence_id": source["occurrence_id"],
                    "source_title": source["jamb_name"],
                    "source_faculty": source["source_faculty"],
                    "parsed_file": source["parsed_file"],
                    "parsed_ordinal": source["ordinal"],
                    "awarder_codes_current": source["institutions"],
                    "official_brochure_url": source["brochure_source_url"],
                    "current_explicit_pdf_flag": source["verified_against_pdf"],
                    "current_pdf_locator": source["pdf_table_locator"],
                    "current_verification_date": source["verification_date"],
                    "prior_inventory_id_match_method": source["prior_inventory_link_method"],
                    "local_text_locator_file": text.get("local_text_file"),
                    "local_text_candidate_hit_count": text.get("exact_title_candidate_hit_count", 0),
                    "source_disposition_in_this_lane": lane_disposition,
                    "carried_forward_source_evidence": carried,
                    "required_exact_source_fields": [
                        "exact source title", "complete awarder cell", "source faculty/table context",
                        "continuation boundary", "official PDF URL", "printed page/table locator",
                        "item-specific access date", "current-row comparison",
                    ],
                }
            )
        identities.append(
            {
                "canonical_order": order,
                "canonical_name": identity["jamb_name"],
                "source_occurrence_count": len(occurrences),
                "prior_coverage": prior,
                "source_occurrences": occurrences,
            }
        )

    orphan_rows = []
    for orphan in discovery["orphan_source_occurrences"]:
        source = orphan
        text = text_by_id.get(source.get("occurrence_id")) or next(
            (
                row
                for row in text_search["jamb_occurrences"]
                if row["source_name"] == source["jamb_name"]
                and row["source_faculty"] == source["source_faculty"]
            ),
            {},
        )
        orphan_rows.append(
            {
                "source_title": source["jamb_name"],
                "canonical_name_candidate": "Sociology and Anthroplogy",
                "occurrence_id": source["occurrence_id"],
                "source_faculty": source["source_faculty"],
                "parsed_file": source["parsed_file"],
                "parsed_ordinal": source["ordinal"],
                "awarder_codes_current": source["institutions"],
                "official_brochure_url": source["brochure_source_url"],
                "local_text_locator_file": text.get("local_text_file"),
                "local_text_candidate_hit_count": text.get("exact_title_candidate_hit_count", 0),
                "source_disposition_in_this_lane": "prior_checkpoint_join_required",
            }
        )

    result = {
        "schema": "2026-09-28.jamb-source-audit-lane-1-occurrence-reconciliation.v1",
        "generated_on": "2026-09-28",
        "status": "coverage_reconciled_source_adjudication_open",
        "lane": 1,
        "scope": {
            "canonical_identity_orders": "001-140",
            "canonical_identities": len(identities),
            "canonical_linked_occurrences": sum(row["source_occurrence_count"] for row in identities),
            "orphan_occurrences_assigned_to_lane": len(orphan_rows),
            "primary_source_required": "official JAMB faculty brochure PDF per distinct occurrence",
        },
        "prior_coverage_sources": [
            "jamb_offering_source_context_incremental_checkpoint_2026-09-26_005.md",
            "jamb_offering_source_context_incremental_checkpoint_2026-09-26_006.md",
            "jamb_offering_source_context_incremental_checkpoint_2026-09-26_007.md",
            "jamb_offering_source_context_aggregate_checkpoint_2026-09-26_final.md",
            "jamb_source_repair_lane_a_incremental_checkpoint_2026-09-28_*.md",
            "jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_*.md",
            "jamb_sciences_lane_c_checkpoint_2026-09-28_*.md",
            "jamb_brochure_source_audit_2026-08-17.json",
        ],
        "coverage_limit": "Prior catalogue hits, source-extract windows, row flags, and search snippets are retained as leads/previous evidence; they are not silently promoted to visual exact-cell closure. Checkpoint-specific decisions outside a row's exact occurrence remain non-credit.",
        "identities": identities,
        "orphan_source_occurrences": orphan_rows,
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "counts": result["scope"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
