"""Create the reviewed disposition ledger for every Nigerian entity row.

The ledger closes the distinction between an unresolved evidence state and an
unreviewed row.  ``not_found_in_checked_nigerian_evidence`` is deliberately
not an absence claim: it records the sources and profile layer that were
checked, with a trigger for future review when new Nigerian evidence appears.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


HERE = Path(__file__).resolve().parent
AUDIT_PATH = HERE / "nigerian_entity_extraction_audit_2026-08-25.json"
OUTPUT_JSON = HERE / "nigerian_entity_review_ledger_2026-08-25.json"
OUTPUT_MD = HERE / "NIGERIAN_ENTITY_REVIEW_LEDGER_2026-08-25.md"


def disposition(entity: dict) -> tuple[str, str, bool]:
    evidence = entity.get("evidence") or {}
    state = evidence.get("state")
    if state == "source_backed":
        return "local_evidence_found", "matched_checked_nigerian_profile", False
    if state == "context_only":
        return "nigerian_context_only", "checked_nigerian_context_without_entity_item_match", True
    if state == "no_direct_local_counterpart":
        if evidence.get("local_profile_ids"):
            return "not_found_in_checked_nigerian_evidence", "checked_nigerian_role_or_subgroup_profiles_without_match", True
        return "not_found_in_checked_nigerian_evidence", "checked_registered_nigerian_sources_without_entity_profile_match", True
    if state == "reviewed_global_only_no_direct_local_counterpart":
        return "reviewed_global_only_no_direct_local_counterpart", "reviewed_checked_sources_and_retained_global_role_without_local_counterpart_claim", False
    return "requires_pipeline_review", "unexpected_or_pending_evidence_state", True


def main() -> None:
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    entities = audit.get("domains", []) + audit.get("subgroups", []) + audit.get("roles", [])
    rows = []
    counts = Counter()
    for entity in entities:
        evidence = entity.get("evidence") or {}
        status, method, follow_up = disposition(entity)
        row = {
            "entity_type": entity.get("entity_type"),
            "entity_id": entity.get("entity_id"),
            "domain_id": entity.get("domain_id") or entity.get("entity_id"),
            "name": entity.get("name"),
            "reviewed_at": str(date.today()),
            "review_complete": status != "requires_pipeline_review",
            "review_status": status,
            "review_method": method,
            "checked_local_source_ids": list(evidence.get("source_ids") or []),
            "checked_local_profile_ids": list(evidence.get("local_profile_ids") or []),
            "local_item_evidence_status": "found" if status == "local_evidence_found" else "not_established",
            "domain_context_status": "available" if (evidence.get("coverage") or {}).get("domain_context_present") else "not_established",
            "domain_context_source_ids": list((evidence.get("domain_context_enrichment") or {}).get("source_ids") or []),
            "domain_context_item_counts": dict((evidence.get("coverage") or {}).get("domain_context_item_counts") or {}),
            "local_demand_signal_status": (evidence.get("local_demand_signals") or {}).get("status", "not_established"),
            "global_evidence_kept_separate": bool(evidence.get("global_enrichment") or evidence.get("global_taxonomy")),
            "follow_up_required": follow_up,
            "absence_claim": False,
            "limitation": (
                "This row was not matched in the currently checked Nigerian evidence. "
                "That does not prove the occupation or activity is absent in Nigeria; "
                "the row should be reconsidered when new local sources, vacancies, "
                "professional records or institutional evidence are added."
                if status == "not_found_in_checked_nigerian_evidence"
                else "Disposition is limited to the evidence scope recorded on this row."
            ),
        }
        rows.append(row)
        counts[f"{entity['entity_type']}_{status}"] += 1
        counts["review_complete" if row["review_complete"] else "review_incomplete"] += 1

    expected = {(row["entity_type"], row["entity_id"]) for row in entities}
    observed = {(row["entity_type"], row["entity_id"]) for row in rows}
    payload = {
        "schema_version": "nigerian_entity_review_ledger_v1",
        "generated_at": str(date.today()),
        "purpose": "Reviewed evidence disposition for every domain, subgroup and role supporting seed regeneration.",
        "policy": {
            "not_found_meaning": "No match in currently checked Nigerian evidence; never a proof-of-absence claim.",
            "global_separation": "Global and remote evidence remains separate and cannot satisfy Nigerian evidence.",
            "follow_up": "Rows marked follow_up_required remain discoverable and should be revisited when local evidence changes.",
        },
        "counts": dict(sorted(counts.items())),
        "coverage": {
            "audit_entity_rows": len(expected),
            "ledger_rows": len(observed),
            "missing_rows": len(expected - observed),
            "unexpected_rows": len(observed - expected),
            "all_rows_reviewed": expected == observed and all(row["review_complete"] for row in rows),
        },
        "rows": rows,
    }
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    by_type = []
    for entity_type in ("domain", "subgroup", "role"):
        total = sum(row["entity_type"] == entity_type for row in rows)
        not_found = sum(row["entity_type"] == entity_type and row["review_status"] == "not_found_in_checked_nigerian_evidence" for row in rows)
        context = sum(row["entity_type"] == entity_type and row["review_status"] == "nigerian_context_only" for row in rows)
        backed = sum(row["entity_type"] == entity_type and row["review_status"] == "local_evidence_found" for row in rows)
        by_type.append(f"| {entity_type} | {total:,} | {backed:,} | {context:,} | {not_found:,} |")
    OUTPUT_MD.write_text(
        "# Nigerian entity review ledger\n\n"
        "This ledger records a disposition for every visible domain, subgroup and role. "
        "`not_found_in_checked_nigerian_evidence` means that no match was found in the "
        "currently checked Nigerian sources and profiles; it is not a claim that the "
        "occupation does not exist in Nigeria.\n\n"
        "## Coverage\n\n"
        f"- Audit rows: **{len(expected):,}**\n"
        f"- Ledger rows: **{len(observed):,}**\n"
        f"- Missing rows: **{len(expected - observed):,}**\n"
        f"- Unexpected rows: **{len(observed - expected):,}**\n"
        f"- All rows reviewed: **{'YES' if payload['coverage']['all_rows_reviewed'] else 'NO'}**\n\n"
        "| Entity | Total | Local evidence found | Nigerian context only | Not found in checked Nigerian evidence |\n"
        "|---|---:|---:|---:|---:|\n"
        + "\n".join(by_type)
        + "\n\n"
        "The JSON ledger contains the full row-level source IDs, profile IDs, demand-signal status, limitations and follow-up trigger.\n",
        encoding="utf-8",
    )
    print(json.dumps(payload["coverage"], indent=2))
    if not payload["coverage"]["all_rows_reviewed"]:
        raise SystemExit("Nigerian entity review ledger is incomplete")


if __name__ == "__main__":
    main()
