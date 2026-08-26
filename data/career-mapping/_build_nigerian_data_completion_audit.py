"""Build the explicit completion audit for the Nigerian evidence population.

This report deliberately distinguishes:
* direct Nigerian role/subgroup evidence;
* inherited Nigerian domain/sector context; and
* global or remote evidence.

It is a completion-audit artifact, not a seed generator. SQL generation stays
closed until the exhaustive-search declaration is changed after review.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path


HERE = Path(__file__).resolve().parent
AUDIT_PATH = HERE / "nigerian_entity_extraction_audit_2026-08-25.json"
GATE_PATH = HERE / "NIGERIAN_ENTITY_POPULATION_GATE.json"
OUTPUT_JSON = HERE / "NIGERIAN_DATA_COMPLETION_AUDIT_2026-08-25.json"
OUTPUT_MD = HERE / "NIGERIAN_DATA_COMPLETION_AUDIT_2026-08-25.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def summarize(rows: list[dict]) -> dict:
    states = Counter((row.get("evidence") or {}).get("state") for row in rows)
    context = sum(bool((row.get("evidence") or {}).get("coverage", {}).get("domain_context_present")) for row in rows)
    global_rows = sum(bool((row.get("evidence") or {}).get("coverage", {}).get("global_evidence_present")) for row in rows)
    return {
        "total": len(rows),
        "source_backed": states.get("source_backed", 0),
        "context_only": states.get("context_only", 0),
        "no_direct_local_counterpart": states.get("no_direct_local_counterpart", 0),
        "domain_context_present": context,
        "global_evidence_present": global_rows,
    }


def main() -> None:
    audit = load(AUDIT_PATH)
    gate = load(GATE_PATH)
    domains = audit.get("domains") or []
    subgroups = audit.get("subgroups") or []
    roles = audit.get("roles") or []
    by_domain = defaultdict(lambda: {"roles": [], "subgroups": []})
    for row in roles:
        by_domain[str(row.get("domain_id"))]["roles"].append(row)
    for row in subgroups:
        by_domain[str(row.get("domain_id"))]["subgroups"].append(row)

    domain_rows = []
    for row in domains:
        did = str(row.get("entity_id"))
        role_rows = by_domain[did]["roles"]
        subgroup_rows = by_domain[did]["subgroups"]
        domain_rows.append({
            "domain_id": did,
            "name": row.get("name"),
            "domain_state": (row.get("evidence") or {}).get("state"),
            "role_summary": summarize(role_rows),
            "subgroup_summary": summarize(subgroup_rows),
            "domain_context_source_ids": sorted(set((row.get("evidence") or {}).get("domain_context_enrichment", {}).get("source_ids") or [])),
        })
    domain_rows.sort(key=lambda row: (-row["role_summary"]["no_direct_local_counterpart"], row["domain_id"]))

    payload = {
        "schema_version": "nigerian_data_completion_audit_v1",
        "generated_at": str(date.today()),
        "date_window": "2024-01-01 through 2026-08-25",
        "completion_status": "in_progress",
        "sql_regeneration_allowed": False,
        "exhaustive_search_declaration": False,
        "entity_summary": {
            "domains": summarize(domains),
            "subgroups": summarize(subgroups),
            "roles": summarize(roles),
            "all_entities": summarize(domains + subgroups + roles),
        },
        "integrity_gate": {
            "integrity_gate_passed": gate.get("integrity_gate_passed", False),
            "sql_regeneration_allowed": gate.get("sql_regeneration_allowed", False),
            "counts": gate.get("counts") or {},
        },
        "policy": {
            "direct_local_evidence": "An exact or defensible Nigerian role/subgroup profile match with item-level provenance.",
            "domain_context": "Separate Nigerian sector or domain evidence that can guide a role without claiming the item is role-specific.",
            "no_direct": "No exact match in the checked Nigerian profiles; never an absence claim. The row retains global evidence and domain context where available.",
            "sql": "Do not regenerate SQL while exhaustive_search_declaration is false, even when the integrity gate passes.",
        },
        "domains_ranked_by_unresolved_roles": domain_rows,
    }
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Nigerian data completion audit",
        "",
        "Status: **IN PROGRESS**",
        "",
        "This is the authoritative completion audit for the 2024-2026 Nigerian enrichment pass. It does not authorize SQL generation.",
        "",
        "## Entity coverage",
        "",
        "| Entity | Total | Direct Nigerian evidence | Nigerian context only | No direct checked match | Domain context | Global evidence |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for label, key in (("Domains", "domains"), ("Subgroups", "subgroups"), ("Roles", "roles"), ("All entities", "all_entities")):
        item = payload["entity_summary"][key]
        lines.append(f"| {label} | {item['total']:,} | {item['source_backed']:,} | {item['context_only']:,} | {item['no_direct_local_counterpart']:,} | {item['domain_context_present']:,} | {item['global_evidence_present']:,} |")
    lines.extend([
        "",
        "## Completion controls",
        "",
        f"- Integrity gate passed: **{'YES' if payload['integrity_gate']['integrity_gate_passed'] else 'NO'}**",
        "- Exhaustive 2024-2026 search declaration: **NO**",
        "- SQL regeneration allowed: **NO**",
        "- Direct local evidence and domain context are separate fields.",
        "- A no-direct row is not an absence claim; it remains explicitly limited and requires the final search declaration before completion.",
        "",
        "## Domains with the most unresolved exact-role matches",
        "",
        "| Domain | Unresolved roles | Total roles | Direct role evidence | Unresolved subgroups |",
        "|---|---:|---:|---:|---:|",
    ])
    for row in domain_rows[:40]:
        roles_summary = row["role_summary"]
        subgroup_summary = row["subgroup_summary"]
        lines.append(f"| {row['domain_id']} {row['name']} | {roles_summary['no_direct_local_counterpart']:,} | {roles_summary['total']:,} | {roles_summary['source_backed']:,} | {subgroup_summary['no_direct_local_counterpart']:,} |")
    OUTPUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["entity_summary"], indent=2))


if __name__ == "__main__":
    main()
