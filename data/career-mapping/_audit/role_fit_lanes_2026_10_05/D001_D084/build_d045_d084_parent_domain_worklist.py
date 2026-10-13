"""Build the exact pending role->parent-domain worklist for D045-D084.

The worklist joins checked-in occupational task evidence but never infers fit.
Previously completed D001 and D009-D044 artifacts are checked for overlap and
explicitly excluded from this lane. A saved D045-D084 decision report counts
only when its exact role-key set matches the canonical inventory for that
domain.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
INVENTORY = HERE / "D001_D084_inventory_and_triage.json"
OUTPUT = HERE / "D045_D084_parent_domain_review_worklist.json"
FIRST, LAST = 45, 84
ALLOWED = {"supported", "conditional", "unsupported", "unresolved"}


def digest(value: object) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def read_domain_decisions(domain_id: str) -> tuple[dict[str, dict], str | None]:
    path = HERE / f"{domain_id}_role_domain_fit_review_2026_10_05.json"
    if not path.exists():
        # Accept the earlier lane filename only if it is an exact domain report.
        path = HERE / f"{domain_id}_role_domain_fit_2026_10_05.json"
    if not path.exists():
        return {}, None
    artifact = json.loads(path.read_text(encoding="utf-8"))
    rows = artifact.get("decisions") or artifact.get("role_reviews") or []
    keys = [row.get("role_key") for row in rows]
    if len(keys) != len(set(keys)):
        raise ValueError(f"Duplicate role key in {path.name}")
    if any(row.get("domain_fit_status") not in ALLOWED for row in rows):
        raise ValueError(f"Invalid/missing parent-domain disposition in {path.name}")
    return {row["role_key"]: row for row in rows}, path.name


def build() -> dict:
    source = json.loads(INVENTORY.read_text(encoding="utf-8"))
    all_rows = source["records"]
    earlier_keys = {
        row["role_key"] for row in all_rows
        if int(row["domain_id"][1:]) == 1 or 9 <= int(row["domain_id"][1:]) <= 44
    }
    rows = sorted(
        (row for row in all_rows if FIRST <= int(row["domain_id"][1:]) <= LAST),
        key=lambda row: (int(row["domain_id"][1:]), row["role_key"].casefold(), row["role_key"]),
    )
    expected_by_domain: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        expected_by_domain[row["domain_id"]].add(row["role_key"])
    if any(expected_by_domain[d] & earlier_keys for d in expected_by_domain):
        raise ValueError("D045-D084 overlaps a completed D001 or D009-D044 mapping key")

    source_payloads: dict[str, dict] = {}
    mappings = []
    completed_keys: set[str] = set()
    domain_counts: Counter[str] = Counter()
    for domain_id in sorted(expected_by_domain, key=lambda x: int(x[1:])):
        decisions, artifact_name = read_domain_decisions(domain_id)
        expected = expected_by_domain[domain_id]
        if decisions and set(decisions) != expected:
            raise ValueError(f"{artifact_name} does not exactly cover {domain_id}: expected {len(expected)}, got {len(decisions)}")
        completed_keys.update(decisions)

    for row in rows:
        evidence = row.get("source_evidence") or {}
        refs = []
        esco_uri = evidence.get("esco_uri")
        if esco_uri:
            payload = {k: evidence.get(k) for k in (
                "esco_uri", "esco_label", "esco_code", "esco_isco_group",
                "esco_definition", "esco_alt_labels", "esco_essential_skills", "esco_optional_skills",
            ) if k in evidence}
            ref = f"ESCO:{esco_uri}@{digest(payload)[:16]}"
            source_payloads.setdefault(ref, {"source_type": "ESCO occupation profile", "stable_id": esco_uri, **payload})
            refs.append(ref)
        for profile in evidence.get("onet_task_profiles") or []:
            stable_id = str(profile.get("onet_soc_code") or "").strip() or f"unidentified:{row['role_key']}:{digest(profile)[:16]}"
            ref = f"ONET:{stable_id}@{digest(profile)[:16]}"
            source_payloads.setdefault(ref, {"source_type": "O*NET occupation/task profile", "stable_id": stable_id, **profile})
            refs.append(ref)
        for url in dict.fromkeys(str(x).strip() for x in row.get("evidence_source_urls", []) if str(x).strip()):
            payload = {"url": url}
            ref = f"URL:{url}@{digest(payload)[:16]}"
            source_payloads.setdefault(ref, {"source_type": "role source locator; task relevance must be verified", **payload})
            refs.append(ref)
        domain_id = row["domain_id"]
        decision_rows, report = read_domain_decisions(domain_id)
        decision = decision_rows.get(row["role_key"])
        mappings.append({
            "role_key": row["role_key"],
            "domain_id": domain_id,
            "domain_name": row["domain_name"],
            "parent_domain_scope": row.get("domain_scope") or "",
            "role_name": row.get("role_name") or "",
            "role_task_text": row.get("role_description") or "",
            "identity_source": row.get("identity_source") or "",
            "role_evidence_state": row.get("role_evidence_state") or "",
            "esco_code": row.get("esco_code") or "",
            "onet_occupation_codes": row.get("onet_occupation_codes") or [],
            "task_source_refs": list(dict.fromkeys(refs)),
            "review_status": "reviewed" if decision else "pending",
            "domain_fit_status": decision.get("domain_fit_status") if decision else None,
            "decision_artifact": report if decision else None,
        })
        domain_counts[domain_id] += 1

    return {
        "schema_version": 1,
        "scope": {"first_domain": "D045", "last_domain": "D084", "fit_level": "role tasks to parent domain only"},
        "generated_from": INVENTORY.name,
        "inventory_sha256": hashlib.sha256(INVENTORY.read_bytes()).hexdigest(),
        "excluded_completed_lanes": ["D001", "D009-D044"],
        "method": "Exact domain|role keys from the checked-in inventory. ESCO/O*NET task payloads and source locators are joined by stable ID plus content fingerprint; each role mapping receives an independent fit decision. Worklist generation does not classify fit. ISCO/subgroup, title similarity, and cross-domain repetition are not fit evidence.",
        "counts": {
            "domains_with_mappings": len(domain_counts),
            "role_mappings": len(mappings),
            "reviewed_role_mappings": len(completed_keys),
            "pending_role_mappings": len(mappings) - len(completed_keys),
            "unique_task_source_payloads": len(source_payloads),
            "mappings_without_any_joined_task_profile": sum(not x["task_source_refs"] for x in mappings),
        },
        "domain_counts": dict(sorted(domain_counts.items(), key=lambda kv: int(kv[0][1:]))),
        "source_payloads": source_payloads,
        "role_mappings": mappings,
    }


def main() -> None:
    result = build()
    keys = [row["role_key"] for row in result["role_mappings"]]
    if len(keys) != len(set(keys)):
        raise SystemExit("D045-D084 worklist has duplicate exact mapping keys")
    if any(row["domain_id"] == "D045" for row in result["role_mappings"]):
        raise SystemExit("D045 was expected to be empty; inspect source inventory")
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), **result["counts"], "domain_counts": result["domain_counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
