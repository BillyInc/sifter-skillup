"""Extract only the unresolved exact-key parent-domain decisions from lane artifacts."""
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
LANES = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05"
INVENTORY = ROOT / "data/career-mapping/_audit/domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
STATUS_FIELDS = ("domain_fit_status", "domain_fit", "role_to_domain_fit_status", "fit_status")


def visit(value, source, found):
    if isinstance(value, dict):
        key = value.get("role_key")
        if key:
            status = next((value.get(field) for field in STATUS_FIELDS if value.get(field) is not None), None)
            if status == "unresolved":
                found[str(key)].append({"artifact": source.relative_to(LANES).as_posix(), "record": value})
        for child in value.values():
            visit(child, source, found)
    elif isinstance(value, list):
        for child in value:
            visit(child, source, found)


def main():
    found = defaultdict(list)
    for path in LANES.rglob("*.json"):
        try:
            visit(json.loads(path.read_text(encoding="utf-8")), path, found)
        except (OSError, json.JSONDecodeError, UnicodeDecodeError):
            continue
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    canonical = {row["role_key"]: row for row in inventory["role_mappings"]}
    rows = []
    for key, artifacts in sorted(found.items()):
        # Prefer the record with the most populated decision/evidence fields.
        artifact = max(
            artifacts,
            key=lambda item: sum(bool(item["record"].get(field)) for field in (
                "task_evidence", "role_description", "basis", "rationale", "source_refs", "evidence_source_urls"
            )),
        )
        row = canonical.get(key)
        if row is None:
            raise SystemExit(f"Unresolved key is absent from the 3,919-key inventory: {key}")
        rows.append({
            "role_key": key,
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "domain_scope": row["domain_scope"],
            "role_name": row["role_name"],
            "role_description": row.get("role_description", ""),
            "identity_source": row.get("identity_source"),
            "role_evidence_state": row.get("role_evidence_state"),
            "esco_occupation_uris": row.get("esco_occupation_uris", []),
            "onet_occupation_codes": row.get("onet_occupation_codes", []),
            "existing_evidence_source_urls": row.get("evidence_source_urls", []),
            "prior_fit_status": "unresolved",
            "prior_review_artifact": artifact["artifact"],
            "prior_review_record": artifact["record"],
            "all_unresolved_artifact_paths": sorted({item["artifact"] for item in artifacts}),
            "new_disposition": None,
            "task_evidence_verified": None,
            "rationale": None,
            "source_refs": [],
            "source_limits": None,
            "jurisdiction": "global_only; no Nigeria-specific search or claims in this phase",
        })
    if len(rows) != 44 or len({row["role_key"] for row in rows}) != 44:
        raise SystemExit(f"Expected 44 unique unresolved exact keys; extracted {len(rows)}")
    result = {
        "schema_version": "1.0",
        "scope": "Only the 44 exact role_key decisions with unresolved dispositions in the current 3,919-key review artifacts.",
        "method": "Scan review JSON artifacts for exact unresolved status, deduplicate by role_key, then join each key to the current 3,919-row inventory. Resolved rows are not imported as work items.",
        "canonical_edits": False,
        "global_only": True,
        "unresolved_rows": rows,
    }
    (OUT / "unresolved_44_parent_fit_register.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Exact unresolved role→parent-domain residual: 44 keys", "",
        "Extracted from the current exact-key review artifacts and reconciled against the 3,919-key role inventory.",
        "This is a task-evidence disposition queue, not a new canonical mapping file. Resolved keys are excluded; no subgroup membership is used as fit evidence.",
        "", f"- Exact unresolved keys: **{len(rows)}**", "- Canonical mapping edits: **none**",
        "- Jurisdiction: **global-only** (no Nigerian context in this phase)",
        "", "| Domain | Role key | Current role evidence | New disposition |", "|---|---|---|---|",
    ]
    for row in rows:
        evidence = row["role_description"].replace("|", "\\|").replace("\n", " ")[:260] or "No specific task profile in canonical inventory"
        lines.append(f"| {row['domain_id']} {row['domain_name']} | `{row['role_key']}` | {evidence} | Pending |")
    lines += ["", "## Resume rule", "", "Work in small exact-key batches; preserve unresolved when authoritative task evidence is insufficient. Each disposition must include task evidence, rationale, source URL(s), source limits, and one of supported / conditional / unsupported / unresolved."]
    (OUT / "unresolved_44_parent_fit_checkpoint.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"exact_unresolved_keys": len(rows), "unique": len({row['role_key'] for row in rows}), "output": str(OUT)}))


if __name__ == "__main__":
    main()
