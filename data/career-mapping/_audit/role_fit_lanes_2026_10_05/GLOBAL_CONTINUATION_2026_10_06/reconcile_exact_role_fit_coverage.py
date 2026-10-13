"""Reconcile exact role->parent-domain decisions without touching canonical data.

Only per-domain review artifacts and the separately handled D119 ledger are
decision sources. Queues, lane summaries, prior residual extracts, and this
continuation folder are deliberately excluded to avoid counting snapshots as
fresh decisions.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
LANES = AUDIT / "role_fit_lanes_2026_10_05"
OUT = Path(__file__).resolve().parent
INVENTORY = AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
D119 = AUDIT / "role_taxonomy_fit_review_2026_10_05.json"
STATUS_FIELDS = (
    "domain_fit_status",
    "domain_fit",
    "role_to_domain_fit_status",
    "fit_status",
)
STATUS_NORMALIZATION = {
    "supported_for_domain": "supported",
    "conditional_for_domain": "conditional",
    "unsupported_for_domain": "unsupported",
    "not_supported": "unsupported",
}
RESOLVED = {"supported", "conditional", "unsupported"}
UNRESOLVED = {"unresolved", "not_reviewed", "not_individually_reviewed", "pending"}


def iter_decisions(value):
    if isinstance(value, dict):
        if value.get("role_key"):
            status = next((value.get(field) for field in STATUS_FIELDS if value.get(field) is not None), None)
            yield value, status
        for child in value.values():
            yield from iter_decisions(child)
    elif isinstance(value, list):
        for child in value:
            yield from iter_decisions(child)


def decision_files():
    for lane in (LANES / "D001_D084", LANES / "D085_D168"):
        for path in sorted(lane.glob("D*.json")):
            # Only domain-keyed decisions; exclude summaries, queues and residual snapshots.
            if "role_domain_fit" not in path.name and "role_fit_decisions" not in path.name and "reviewed_decisions" not in path.name:
                continue
            yield path
    if D119.exists():
        yield D119


def continuation_decisions():
    for path in sorted(OUT.glob("role_domain_fit_dispositions_increment_*.json")):
        yield path


def main():
    canonical_doc = json.loads(INVENTORY.read_text(encoding="utf-8"))
    canonical_rows = canonical_doc["role_mappings"]
    canonical = {row["role_key"]: row for row in canonical_rows}
    if len(canonical) != len(canonical_rows):
        raise SystemExit("Canonical inventory has duplicate exact role keys")

    evidence = defaultdict(list)
    files_seen = []
    for path in decision_files():
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            continue
        rel = path.relative_to(LANES).as_posix() if path.is_relative_to(LANES) else path.relative_to(AUDIT).as_posix()
        records = list(iter_decisions(doc))
        if not records:
            continue
        files_seen.append(rel)
        for record, status in records:
            key = str(record["role_key"])
            evidence[key].append({"artifact": rel, "status": status, "record": record})

    for path in continuation_decisions():
        doc = json.loads(path.read_text(encoding="utf-8"))
        rel = path.relative_to(LANES).as_posix()
        for record in doc.get("decisions", []):
            evidence[str(record["role_key"])].append({
                "artifact": rel,
                "status": record.get("domain_fit_status"),
                "record": record,
            })

    unknown_keys = sorted(set(evidence) - set(canonical))
    if unknown_keys:
        raise SystemExit(f"Review artifacts contain {len(unknown_keys)} noncanonical keys: {unknown_keys[:10]}")

    rows = []
    status_counts = Counter()
    conflicts = []
    for key, canonical_row in canonical.items():
        records = evidence.get(key, [])
        statuses = {
            STATUS_NORMALIZATION.get(str(item["status"]).strip().lower(), str(item["status"]).strip().lower())
            for item in records if item["status"] is not None
        }
        terminal = statuses & RESOLVED
        unresolved = statuses & UNRESOLVED
        continuation_records = [r for r in records if "GLOBAL_CONTINUATION_2026_10_06/role_domain_fit_dispositions_increment_" in r["artifact"]]
        continuation_statuses = {
            STATUS_NORMALIZATION.get(str(r["status"]).strip().lower(), str(r["status"]).strip().lower())
            for r in continuation_records if r["status"] is not None
        }
        if len(continuation_statuses) > 1:
            conflicts.append({"role_key": key, "statuses": sorted(continuation_statuses), "artifacts": sorted({r["artifact"] for r in continuation_records})})
            current = "conflicting_review_status"
        elif continuation_statuses:
            current = next(iter(continuation_statuses))
        elif len(terminal) > 1:
            conflicts.append({"role_key": key, "statuses": sorted(terminal), "artifacts": sorted({r["artifact"] for r in records})})
            current = "conflicting_review_status"
        elif terminal:
            current = next(iter(terminal))
        elif "unresolved" in unresolved:
            current = "unresolved"
        elif unresolved:
            current = "not_individually_reviewed"
        else:
            current = "no_exact_decision_found"
        status_counts[current] += 1
        if current in {"unresolved", "no_exact_decision_found", "conflicting_review_status"}:
            # Keep only decision-bearing evidence to avoid embedding bulky nested snapshots.
            compact = [{"artifact": item["artifact"], "status": item["status"]} for item in records]
            rows.append({
                "role_key": key,
                "domain_id": canonical_row["domain_id"],
                "domain_name": canonical_row["domain_name"],
                "role_name": canonical_row["role_name"],
                "role_description": canonical_row.get("role_description", ""),
                "recomputed_status": current,
                "decision_artifacts": compact,
            })

    result = {
        "schema_version": "1.0",
        "scope": "Exact role-to-parent-domain mapping reconciliation only; global sources; no canonical edits; role-to-specialization excluded.",
        "canonical_inventory": INVENTORY.relative_to(ROOT).as_posix(),
        "canonical_exact_role_keys": len(canonical),
        "review_artifacts_scanned": sorted(files_seen),
        "continuation_increment_files": sorted(path.relative_to(LANES).as_posix() for path in continuation_decisions()),
        "distinct_reviewed_exact_keys": len(evidence),
        "status_counts_over_canonical_keys": dict(sorted(status_counts.items())),
        "conflicting_terminal_statuses": conflicts,
        "remaining_rows": rows,
        "canonical_edits": False,
        "jurisdiction": "global_only",
        "notes": [
            "A role key is not considered resolved from ISCO/ESCO subgroup membership, title similarity, or a specialization proposal.",
            "Lane summaries and prior unresolved extracts are not treated as decisions.",
            "This report is a coverage reconciliation; source research and dispositions follow in separate increments.",
        ],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / "exact_role_fit_coverage_2026_10_06.json"
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "canonical_exact_role_keys": len(canonical),
        "distinct_reviewed_exact_keys": len(evidence),
        "status_counts_over_canonical_keys": dict(sorted(status_counts.items())),
        "remaining_rows": len(rows),
        "status_conflicts": len(conflicts),
        "output": target.as_posix(),
    }, indent=2))


if __name__ == "__main__":
    main()
