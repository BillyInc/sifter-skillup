"""Build an exact-key work queue for the previously reviewed unsupported links.

This is a read-only audit builder. It does not edit canonical mappings and does
not treat an unsupported label as independent proof that a role is misplaced.
"""
from __future__ import annotations

import importlib.util
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
AUDIT = HERE.parents[1]
LANES = AUDIT / "role_fit_lanes_2026_10_05"
INVENTORY = AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
PRIOR_RECONCILER = LANES / "GLOBAL_CONTINUATION_2026_10_06" / "reconcile_exact_role_fit_coverage.py"
STATUS_MAP = {"unsupported_for_domain": "unsupported", "not_supported": "unsupported"}


def load_prior_module():
    spec = importlib.util.spec_from_file_location("prior_role_fit_reconciler", PRIOR_RECONCILER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def norm_name(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).casefold()
    return re.sub(r"[^\w]+", " ", value, flags=re.UNICODE).strip()


def records_for_key(prior, files):
    result = defaultdict(list)
    for path in files:
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            continue
        if path.is_relative_to(LANES):
            artifact = path.relative_to(LANES).as_posix()
        else:
            artifact = path.relative_to(AUDIT).as_posix()
        for record, status in prior.iter_decisions(doc):
            if status is None:
                continue
            raw = str(status).strip().casefold()
            normalized = STATUS_MAP.get(raw, raw)
            result[str(record["role_key"])].append({
                "artifact": artifact,
                "raw_status": str(status),
                "normalized_status": normalized,
                "record": record,
            })
    return result


def main():
    prior = load_prior_module()
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    canonical_rows = inventory["role_mappings"]
    canonical = {row["role_key"]: row for row in canonical_rows}
    if len(canonical) != len(canonical_rows):
        raise SystemExit("Duplicate exact role keys in canonical inventory")

    files = list(prior.decision_files())
    for path in prior.continuation_decisions():
        files.append(path)
    evidence = records_for_key(prior, files)

    # Resolve statuses using the same exact-key precedence as the completed audit:
    # continuation decisions supersede old lane snapshots, otherwise terminal
    # statuses must agree. Any disagreement is reported instead of hidden.
    unsupported = []
    conflicts = []
    final_statuses = {}
    for key, row in canonical.items():
        decisions = evidence.get(key, [])
        cont = [d for d in decisions if d["artifact"].startswith("GLOBAL_CONTINUATION_2026_10_06/")]
        pool = cont if cont else decisions
        terminal = {d["normalized_status"] for d in pool if d["normalized_status"] in {"supported", "conditional", "unsupported"}}
        if len(terminal) > 1:
            conflicts.append({"role_key": key, "statuses": sorted(terminal), "artifacts": sorted({d["artifact"] for d in pool})})
            continue
        status = next(iter(terminal), None)
        final_statuses[key] = status
        if status != "unsupported":
            continue
        chosen = [d for d in pool if d["normalized_status"] == "unsupported"]
        task_evidence = sorted({str(d["record"].get("task_evidence", "")).strip() for d in chosen if str(d["record"].get("task_evidence", "")).strip()})
        rationales = sorted({str(d["record"].get("rationale", d["record"].get("basis", ""))).strip() for d in chosen if str(d["record"].get("rationale", d["record"].get("basis", ""))).strip()})
        source_refs = sorted({str(ref) for d in chosen for ref in (d["record"].get("source_refs") or []) if str(ref).strip()})
        unsupported.append({
            "role_key": key,
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "role_name": row["role_name"],
            "role_description": row.get("role_description", ""),
            "prior_task_evidence": task_evidence,
            "prior_rationale": rationales,
            "prior_source_refs": source_refs,
            "decision_artifacts": sorted({d["artifact"] for d in chosen}),
            "other_domain_exact_keys_same_normalized_title": [],
            "safe_action": "pending_manual_review",
            "action_rationale": "Do not treat the prior unsupported status alone as a confirmed factual error; review task evidence and cross-domain links.",
            "source_backed_alternative_exact_key": None,
        })

    # Build exact normalized-title cross-domain index for investigation only.
    by_title = defaultdict(list)
    for key, row in canonical.items():
        by_title[norm_name(row["role_name"])].append(key)
    for record in unsupported:
        peers = [key for key in by_title[norm_name(record["role_name"])] if key != record["role_key"] and key.split("|", 1)[0] != record["domain_id"]]
        record["other_domain_exact_keys_same_normalized_title"] = sorted(peers)

    if len(unsupported) != 543:
        raise SystemExit(f"Expected 543 unsupported exact keys from current audit; found {len(unsupported)}")
    if conflicts:
        raise SystemExit(f"Found {len(conflicts)} conflicting role-domain statuses")

    status_by_key = final_statuses
    alt_statuses = Counter()
    for record in unsupported:
        for peer in record["other_domain_exact_keys_same_normalized_title"]:
            alt_statuses[status_by_key.get(peer, "no_decision")] += 1

    result = {
        "schema_version": "2026-10-06.unsupported-role-link-review-queue.v1",
        "scope": "543 unsupported exact role-to-parent-domain links only; assess safe per-link action; global sources; no canonical edits; role-to-specialization excluded.",
        "canonical_inventory": "data/career-mapping/_audit/domain_subgroup_role_taxonomy_inventory_2026_10_03.json",
        "unsupported_exact_keys": len(unsupported),
        "status_conflicts": len(conflicts),
        "cross_domain_same_normalized_title_key_count": sum(bool(r["other_domain_exact_keys_same_normalized_title"]) for r in unsupported),
        "cross_domain_peer_status_counts": dict(sorted(alt_statuses.items())),
        "action_vocabulary": {
            "remove_link_only": "Remove only this exact parent-domain link from student mapping; keep the role/source record and any other parent links.",
            "reclassify_exact": "Propose a specific alternative parent link only if the existing source evidence identifies the same role tasks and proves that exact alternative domain; title equality alone is insufficient.",
            "preserve_exclude": "Preserve the source record; exclude/hold this current link from student-facing use while retaining it for provenance/review.",
            "unresolved": "Task/domain evidence is too weak, generic, contradictory, or incomplete to choose a safe link action.",
        },
        "queue": sorted(unsupported, key=lambda row: row["role_key"]),
    }
    target = HERE / "unsupported_exact_key_review_queue_2026_10_06.json"
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "unsupported_exact_keys": len(unsupported),
        "status_conflicts": len(conflicts),
        "same_title_cross_domain_keys": result["cross_domain_same_normalized_title_key_count"],
        "cross_domain_peer_status_counts": result["cross_domain_peer_status_counts"],
        "rows_with_no_task_evidence": sum(not row["prior_task_evidence"] for row in unsupported),
        "rows_with_no_rationale": sum(not row["prior_rationale"] for row in unsupported),
        "rows_with_no_source_refs": sum(not row["prior_source_refs"] for row in unsupported),
        "output": target.as_posix(),
    }, indent=2))


if __name__ == "__main__":
    main()
