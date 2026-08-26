"""Validate the Nigerian entity population before career-seed regeneration.

This gate allows explicit, reviewed gaps. It does not require a fabricated
Nigerian skill or credential for every global occupation. It does require every
entity row to have a reviewed disposition, clean local provenance, separated
global evidence and no pending pipeline state.
"""

from __future__ import annotations

import json
from pathlib import Path

from _nigerian_context import EXHAUSTIVE_SEARCH_DECLARATION, OVERLAY_SOURCES


HERE = Path(__file__).resolve().parent
AUDIT_PATH = HERE / "nigerian_entity_extraction_audit_2026-08-25.json"
LEDGER_PATH = HERE / "nigerian_entity_review_ledger_2026-08-25.json"
REGISTRY_PATH = HERE / "domain_role_source_registry.json"
OUTPUT_JSON = HERE / "NIGERIAN_ENTITY_POPULATION_GATE.json"
OUTPUT_MD = HERE / "NIGERIAN_ENTITY_POPULATION_GATE.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    audit = load(AUDIT_PATH)
    ledger = load(LEDGER_PATH)
    registry = load(REGISTRY_PATH)
    catalog = registry.get("source_catalog") or {}
    audit_entities = audit.get("domains", []) + audit.get("subgroups", []) + audit.get("roles", [])
    audit_keys = {(row.get("entity_type"), row.get("entity_id")) for row in audit_entities}
    ledger_rows = ledger.get("rows", [])
    ledger_keys = {(row.get("entity_type"), row.get("entity_id")) for row in ledger_rows}

    local_provenance_errors = []
    missing_item_provenance = []
    invalid_states = []
    missing_global = []
    missing_domain_context = []
    domain_context_provenance_errors = []
    domain_context_provenance_missing = []
    missing_search_records = []
    premature_negative_labels = []
    for entity in audit_entities:
        key = (entity.get("entity_type"), entity.get("entity_id"))
        evidence = entity.get("evidence") or {}
        state = evidence.get("state")
        if state not in {"source_backed", "context_only", "no_direct_local_counterpart"}:
            invalid_states.append(key)
        if not evidence.get("coverage", {}).get("global_evidence_present"):
            missing_global.append(key)
        if not evidence.get("coverage", {}).get("domain_context_present"):
            missing_domain_context.append(key)
        search = evidence.get("evidence_search") or {}
        if not search.get("query_terms") or not search.get("checked_nigerian_source_ids") or not search.get("source_layers_checked"):
            missing_search_records.append(key)
        if not search.get("exhaustive_search_declaration"):
            for field, disposition in (evidence.get("priority_metadata", {}).get("field_status") or {}).items():
                if disposition.get("nigeria") == "not_established_after_extensive_search":
                    premature_negative_labels.append((key, field))
        for field in ("skills", "tools", "competencies", "certifications", "regulatory_requirements"):
            for item in (evidence.get("actual_enrichment") or {}).get(field) or []:
                source_ids = item.get("source_ids") or []
                if not source_ids:
                    missing_item_provenance.append((key, field, item.get("name")))
                for source_id in source_ids:
                    source = catalog.get(source_id) or {}
                    # Overlay-only sources are named ng_* and are checked by
                    # the resolver; registry sources must still declare Nigeria.
                    if source and source.get("region") not in {"nigeria", "NG", "Nigeria"}:
                        local_provenance_errors.append((key, field, item.get("name"), source_id, source.get("region")))
            for item in (evidence.get("domain_context_enrichment") or {}).get(field) or []:
                source_ids = item.get("source_ids") or []
                if not source_ids:
                    domain_context_provenance_missing.append((key, field, item.get("name")))
                for source_id in source_ids:
                    source = catalog.get(source_id) or OVERLAY_SOURCES.get(source_id) or {}
                    if source and source.get("region") not in {"nigeria", "NG", "Nigeria"}:
                        domain_context_provenance_errors.append((key, field, item.get("name"), source_id, source.get("region")))

    checks = {
        "audit_and_ledger_keys_reconcile": audit_keys == ledger_keys,
        "every_row_has_complete_review_disposition": bool(ledger.get("coverage", {}).get("all_rows_reviewed")) and not any(not row.get("review_complete") for row in ledger_rows),
        "no_pending_or_unexpected_entity_states": not invalid_states,
        "every_entity_has_global_or_derived_global_evidence": not missing_global,
        "every_entity_has_separate_nigerian_domain_context_or_explicit_gap": not missing_domain_context,
        "all_local_items_have_source_provenance": not missing_item_provenance,
        "local_items_do_not_use_declared_non_nigerian_sources": not local_provenance_errors,
        "all_domain_context_items_have_source_provenance": not domain_context_provenance_missing,
        "domain_context_items_do_not_use_declared_non_nigerian_sources": not domain_context_provenance_errors,
        "no_absence_claim_is_recorded": all(not row.get("absence_claim") for row in ledger_rows),
        "every_entity_has_bounded_search_record": not missing_search_records,
        "no_final_negative_label_before_exhaustive_search": not premature_negative_labels,
    }
    integrity_gate_passed = all(checks.values())
    unresolved_rows = sum(
        (entity.get("evidence") or {}).get("state") in {"context_only", "no_direct_local_counterpart"}
        for entity in audit_entities
    )
    # This validator proves evidence integrity and safe separation. It does
    # not, by itself, prove that the requested exhaustive 2024-2026 search is
    # finished. Keep SQL generation explicitly closed until the completion
    # declaration is made after that separate audit.
    exhaustive_search_completed = EXHAUSTIVE_SEARCH_DECLARATION
    allowed = integrity_gate_passed and exhaustive_search_completed
    report = {
        "schema_version": "nigerian_entity_population_gate_v1",
        "integrity_gate_passed": integrity_gate_passed,
        "sql_regeneration_allowed": allowed,
        "completion_status": "complete" if allowed else "in_progress",
        "checks": checks,
        "counts": {
            "audit_entities": len(audit_keys),
            "ledger_entities": len(ledger_keys),
            "review_follow_up_rows": sum(bool(row.get("follow_up_required")) for row in ledger_rows),
            "local_provenance_errors": len(local_provenance_errors),
            "missing_item_provenance": len(missing_item_provenance),
            "invalid_states": len(invalid_states),
            "missing_global": len(missing_global),
            "missing_domain_context": len(missing_domain_context),
            "domain_context_provenance_errors": len(domain_context_provenance_errors),
            "domain_context_provenance_missing": len(domain_context_provenance_missing),
            "missing_search_records": len(missing_search_records),
            "premature_negative_labels": len(premature_negative_labels),
            "unresolved_context_or_no_direct_rows": unresolved_rows,
        },
        "completion_blocker": None if allowed else "The exhaustive 2024-2026 enrichment declaration has not been completed. Integrity checks may pass while SQL generation remains closed.",
        "limitation": "Integrity passing means every row has a reviewed evidence disposition, separate Nigerian domain context, and provenance-safe separation. It does not mean every occupation has an exact Nigerian role match or Nigerian demand evidence.",
    }
    OUTPUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Nigerian entity population gate",
        "",
        f"SQL regeneration allowed: **{'YES' if allowed else 'NO'}**",
        "",
        "| Check | Result |",
        "|---|---|",
    ]
    for name, passed in checks.items():
        lines.append(f"| {name} | {'PASS' if passed else 'BLOCKED'} |")
    lines.extend([
        "",
        f"- Audit entities: **{len(audit_keys):,}**",
        f"- Ledger entities: **{len(ledger_keys):,}**",
        f"- Rows with follow-up trigger: **{report['counts']['review_follow_up_rows']:,}**",
        "",
        report["limitation"],
    ])
    OUTPUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    if not allowed:
        raise SystemExit("Nigerian entity population gate is blocked")


if __name__ == "__main__":
    main()
