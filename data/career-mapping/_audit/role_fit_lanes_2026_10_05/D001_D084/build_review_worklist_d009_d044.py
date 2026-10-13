"""Build an exact, evidence-joined review queue for D009-D044.

This is retrieval/worklist automation only. It never assigns semantic fit.
Each role mapping remains an independent decision even when task-source
profiles can safely be shared by stable ESCO URI or O*NET-SOC code.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


HERE = Path(__file__).resolve().parent
INVENTORY = HERE / "D001_D084_inventory_and_triage.json"
OUTPUT = HERE / "D009_D044_parent_domain_review_worklist.json"
FIRST_DOMAIN = 9
LAST_DOMAIN = 44


def canonical_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def fingerprint(value: object) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def source_ref(kind: str, stable_id: str, payload: object) -> str:
    """Include a content digest so source revisions/conflicts cannot be merged silently."""
    return f"{kind}:{stable_id}@{fingerprint(payload)[:16]}"


def build() -> dict:
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    rows = [
        row for row in inventory["records"]
        if FIRST_DOMAIN <= int(row["domain_id"][1:]) <= LAST_DOMAIN
    ]
    rows.sort(key=lambda row: (int(row["domain_id"][1:]), row["role_key"].casefold(), row["role_key"]))

    keys = [row["role_key"] for row in rows]
    if len(keys) != len(set(keys)):
        raise ValueError("Duplicate role_key in exact source inventory queue")
    if any(not re.fullmatch(r"D\d{3}\|.+", key) for key in keys):
        raise ValueError("Malformed role_key in exact source inventory queue")

    sources: dict[str, dict] = {}
    source_ids: dict[tuple[str, str], set[str]] = defaultdict(set)
    worklist = []
    domain_counts: Counter[str] = Counter()
    decisions_by_key: dict[str, tuple[str, str]] = {}
    allowed = {"supported", "conditional", "unsupported", "unresolved"}
    for domain_number in range(FIRST_DOMAIN, LAST_DOMAIN + 1):
        domain_id = f"D{domain_number:03}"
        decision_path = HERE / f"{domain_id}_role_domain_fit_2026_10_05.json"
        if not decision_path.exists():
            continue
        decision_artifact = json.loads(decision_path.read_text(encoding="utf-8"))
        decision_rows = decision_artifact.get("decisions") or []
        decision_keys = [item.get("role_key") for item in decision_rows]
        inventory_keys = [row["role_key"] for row in rows if row["domain_id"] == domain_id]
        if len(decision_keys) != len(set(decision_keys)) or set(decision_keys) != set(inventory_keys) or len(decision_keys) != len(inventory_keys):
            raise ValueError(f"Saved {domain_id} decisions do not cover the exact inventory keys")
        if any(item.get("domain_fit_status") not in allowed for item in decision_rows):
            raise ValueError(f"Saved {domain_id} artifact contains a non-permitted disposition")
        for item in decision_rows:
            decisions_by_key[item["role_key"]] = (item["domain_fit_status"], decision_path.name)

    for row in rows:
        evidence = row.get("source_evidence") or {}
        refs: list[str] = []
        esco_uri = evidence.get("esco_uri")
        if esco_uri:
            # Keep task definition and ESCO identity data together; exclude
            # canonical matching flags because those describe our join, not ESCO.
            esco_payload = {
                field: evidence.get(field)
                for field in (
                    "esco_uri", "esco_label", "esco_code", "esco_isco_group",
                    "esco_definition", "esco_alt_labels", "esco_essential_skills",
                    "esco_optional_skills",
                )
                if field in evidence
            }
            ref = source_ref("ESCO", esco_uri, esco_payload)
            sources.setdefault(ref, {"source_type": "ESCO occupation profile", "stable_id": esco_uri, **esco_payload})
            source_ids[("ESCO", esco_uri)].add(ref)
            refs.append(ref)

        for onet in evidence.get("onet_task_profiles") or []:
            onet_code = str(onet.get("onet_soc_code") or "").strip()
            if not onet_code:
                # Do not merge unidentified task records.
                stable = f"unidentified:{row['role_key']}:{fingerprint(onet)[:16]}"
            else:
                stable = onet_code
            ref = source_ref("ONET", stable, onet)
            sources.setdefault(ref, {"source_type": "O*NET occupation/task profile", "stable_id": stable, **onet})
            source_ids[("ONET", stable)].add(ref)
            refs.append(ref)

        explicit_urls = list(dict.fromkeys(
            str(url).strip() for url in (row.get("evidence_source_urls") or []) if str(url).strip()
        ))
        # Keep lane/source citations even where no task profile is joined; a
        # trend source (e.g. WEF) must not be mistaken for role-task evidence.
        for url in explicit_urls:
            payload = {"url": url}
            ref = source_ref("URL", url, payload)
            sources.setdefault(ref, {"source_type": "source URL (role-task status must be checked)", **payload})
            refs.append(ref)

        prior_decision = decisions_by_key.get(row["role_key"])
        worklist.append({
            "role_key": row["role_key"],
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "parent_domain_scope": row.get("domain_scope") or "",
            "role_name": row.get("role_name") or "",
            "role_task_text": row.get("role_description") or "",
            "identity_source": row.get("identity_source") or "",
            "role_evidence_state": row.get("role_evidence_state") or "",
            "esco_code": row.get("esco_code") or "",
            "onet_occupation_codes": row.get("onet_occupation_codes") or [],
            "task_source_refs": list(dict.fromkeys(refs)),
            "review_status": "reviewed" if prior_decision else "not_reviewed_in_D009_D044_block",
            "domain_fit_status": prior_decision[0] if prior_decision else None,
            "decision_artifact": prior_decision[1] if prior_decision else None,
        })
        domain_counts[row["domain_id"]] += 1

    return {
        "schema_version": 1,
        "scope": {"first_domain": "D009", "last_domain": "D044", "fit_level": "role tasks to parent domain only"},
        "generated_from": INVENTORY.name,
        "inventory_sha256": hashlib.sha256(INVENTORY.read_bytes()).hexdigest(),
        "method": "Exact mappings from the checked-in D001-D084 inventory; task-source profiles joined by ESCO URI/O*NET-SOC code and content fingerprint. Identical source payloads are stored once and referenced by independent role keys. Conflicting payload versions retain distinct fingerprints. Worklist generation does not classify role/domain fit.",
        "counts": {"domains_in_range": 36, "domains_with_mappings": len(domain_counts), "role_mappings": len(worklist), "reviewed_role_mappings": len(decisions_by_key), "remaining_role_mappings": len(worklist) - len(decisions_by_key), "unique_task_source_payloads": len(sources)},
        "domain_counts": dict(sorted(domain_counts.items())),
        "source_payloads": sources,
        "role_mappings": worklist,
    }


def main() -> None:
    result = build()
    expected_keys = {
        row["role_key"] for row in json.loads(INVENTORY.read_text(encoding="utf-8"))["records"]
        if FIRST_DOMAIN <= int(row["domain_id"][1:]) <= LAST_DOMAIN
    }
    actual_keys = [row["role_key"] for row in result["role_mappings"]]
    if set(actual_keys) != expected_keys or len(actual_keys) != len(expected_keys):
        raise SystemExit("Worklist exact-key validation failed")
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), **result["counts"], "domain_counts": result["domain_counts"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
