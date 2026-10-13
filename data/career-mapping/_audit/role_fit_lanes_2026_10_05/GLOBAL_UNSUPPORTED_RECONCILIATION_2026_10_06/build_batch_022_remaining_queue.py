"""Build the remaining unsupported exact-key role-to-domain disposition batch.

This is an audit artifact builder only.  It reuses the saved, per-domain
task/domain reviews and the D119 reconciliation ledger; it does not infer fit
from ISCO, subgroup membership, title similarity, or a duplicate title.  It
does not edit canonical taxonomy, role libraries, subgroup scripts, or seeds.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
LANES = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05"
QUEUE_PATH = (
    LANES
    / "GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06"
    / "unsupported_exact_key_review_queue_2026_10_06.json"
)
OUT_JSON = HERE / "batch_022_remaining_d085_d168_recommendations.json"
OUT_MD = HERE / "batch_022_checkpoint.md"
INVENTORY_PATH = ROOT / "data/career-mapping/_audit/domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
ROLE_FIT_DIR = LANES / "D085_D168"
D119_LEDGER = ROOT / "data/career-mapping/_audit/role_taxonomy_fit_review_2026_10_05.json"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def normalise_refs(value: Any) -> list[str]:
    """Keep source identity without pretending a source object is a URL."""
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if isinstance(item, str) and item.strip():
            result.append(item.strip())
        elif isinstance(item, dict):
            url = str(item.get("url", "")).strip()
            if url:
                result.append(url)
            else:
                authority = str(item.get("authority", "")).strip()
                locator = str(item.get("locator", "")).strip()
                if authority or locator:
                    result.append(" / ".join(part for part in (authority, locator) if part))
    return sorted(set(result))


def index_lane_reviews() -> tuple[dict[str, tuple[str, dict[str, Any]]], dict[str, tuple[str, dict[str, Any]]]]:
    decisions: dict[str, tuple[str, dict[str, Any]]] = {}
    proposals: dict[str, tuple[str, dict[str, Any]]] = {}
    for path in sorted(ROLE_FIT_DIR.glob("*_role_domain_fit_review_2026_10_05.json")):
        doc = load(path)
        for row in doc.get("decisions", []):
            key = row.get("role_key")
            if key:
                if key in decisions:
                    raise AssertionError(f"duplicate lane decision for {key}")
                enriched = dict(row)
                enriched["_review_scope"] = doc.get("scope", "") or doc.get("domain_name", "")
                decisions[key] = (path.name, enriched)
        for row in doc.get("correction_proposals", []):
            key = row.get("role_key")
            if key:
                proposals[key] = (path.name, row)

    # D085 kept its explicit decisions in a differently named file.
    d085_path = ROLE_FIT_DIR / "D085_role_fit_decisions_2026_10_05.json"
    for row in load(d085_path).get("decisions", []):
        key = row.get("role_key")
        if key:
            enriched = dict(row)
            enriched["_review_scope"] = load(d085_path).get("summary", {}).get("scope", "")
            decisions[key] = (d085_path.name, enriched)

    # D119 is intentionally maintained as a separate source-backed ledger.
    for row in load(D119_LEDGER).get("role_reviews", []):
        key = row.get("role_key")
        if key:
            enriched = dict(row)
            enriched["_review_scope"] = load(D119_LEDGER).get("scope", "")
            decisions[key] = (D119_LEDGER.name, enriched)
    return decisions, proposals


def prior_global_keys() -> set[str]:
    keys: set[str] = set()
    for path in HERE.glob("batch_*_*.json"):
        if path.name == OUT_JSON.name:
            continue
        doc = load(path)
        keys.update(row["role_key"] for row in doc.get("decisions", []) if row.get("role_key"))
    return keys


def peer_context(
    queue_row: dict[str, Any],
    inventory_by_key: dict[str, dict[str, Any]],
    prior_by_key: dict[str, dict[str, Any]],
    lane_by_key: dict[str, tuple[str, dict[str, Any]]],
) -> list[dict[str, Any]]:
    context: list[dict[str, Any]] = []
    for peer_key in queue_row.get("other_domain_exact_keys_same_normalized_title", []):
        peer = inventory_by_key.get(peer_key, {})
        if peer_key in prior_by_key:
            peer_status = prior_by_key[peer_key].get("recommendation")
        elif peer_key in lane_by_key:
            peer_row = lane_by_key[peer_key][1]
            peer_status = peer_row.get("domain_fit") or peer_row.get("domain_fit_status")
        else:
            peer_status = peer.get("role_to_domain_fit_status") or "not_reviewed_in_this_batch"
        context.append(
            {
                "role_key": peer_key,
                "domain_id": peer.get("domain_id"),
                "domain_name": peer.get("domain_name"),
                "record_present": bool(peer),
                "saved_status_context": peer_status,
                "used_as_fit_proof": False,
            }
        )
    return context


def build() -> dict[str, Any]:
    queue = load(QUEUE_PATH)["queue"]
    inventory = load(INVENTORY_PATH)["role_mappings"]
    inventory_by_key = {row["role_key"]: row for row in inventory}
    if len(inventory_by_key) != len(inventory):
        raise AssertionError("duplicate canonical inventory exact key")

    prior_keys = prior_global_keys()
    remaining = [row for row in queue if row["role_key"] not in prior_keys]
    if len(queue) != 543 or len(prior_keys) != 307 or len(remaining) != 236:
        raise AssertionError(
            f"unexpected queue arithmetic: queue={len(queue)} prior={len(prior_keys)} remaining={len(remaining)}"
        )

    lane_by_key, proposals = index_lane_reviews()
    prior_by_key: dict[str, dict[str, Any]] = {}
    for path in HERE.glob("batch_*_*.json"):
        if path.name == OUT_JSON.name:
            continue
        for row in load(path).get("decisions", []):
            if row.get("role_key"):
                prior_by_key[row["role_key"]] = row

    decisions: list[dict[str, Any]] = []
    for queue_row in sorted(remaining, key=lambda row: row["role_key"]):
        key = queue_row["role_key"]
        inventory_row = inventory_by_key.get(key)
        if not inventory_row:
            raise AssertionError(f"remaining key absent from inventory: {key}")
        lane_file, evidence = lane_by_key.get(key, ("", {}))
        proposal = proposals.get(key, ("", {}))[1]
        status = (
            evidence.get("domain_fit")
            or evidence.get("domain_fit_status")
            or evidence.get("role_to_domain_fit_status")
        )
        task_evidence = (
            evidence.get("task_evidence")
            or (queue_row.get("prior_task_evidence") or [None])[0]
            or inventory_row.get("role_description")
        )
        rationale = (
            evidence.get("rationale")
            or evidence.get("basis")
            or (queue_row.get("prior_rationale") or [None])[0]
        )
        if not task_evidence or not rationale or not status:
            raise AssertionError(f"incomplete saved evidence for {key}")

        target_domain = proposal.get("candidate_transfer_domain")
        alternative_key = None
        action = "remove_link_only"
        if target_domain:
            candidate = f"{target_domain}|{inventory_row['role_name']}"
            # A reclassification is safe only when the exact source-backed role
            # record already exists under the proposed destination.
            if candidate in inventory_by_key:
                action = "reclassify_exact"
                alternative_key = candidate
            else:
                action = "unresolved"

        source_refs = normalise_refs(evidence.get("source_refs"))
        source_refs.extend(normalise_refs(queue_row.get("prior_source_refs")))
        source_refs = sorted(set(source_refs))
        if not source_refs:
            raise AssertionError(f"no source references for {key}")

        decisions.append(
            {
                "role_key": key,
                "domain_id": inventory_row["domain_id"],
                "domain_name": inventory_row["domain_name"],
                "domain_scope": evidence.get("_review_scope") or inventory_row.get("domain_scope", ""),
                "role_name": inventory_row["role_name"],
                "role_description": inventory_row.get("role_description", ""),
                "task_evidence": task_evidence,
                "saved_fit_status": status,
                "action": action,
                "alternative_exact_key": alternative_key,
                "rationale": rationale,
                "evidence_refs": source_refs,
                "evidence_artifact": lane_file or queue_row.get("decision_artifacts", []),
                "cross_domain_peer_context": peer_context(queue_row, inventory_by_key, prior_by_key, lane_by_key),
                "cross_domain_title_matches_used_as_fit_proof": False,
                "isco_or_subgroup_used_as_fit_proof": False,
                "role_to_specialization_or_subgroup_decision": False,
                "canonical_changes_applied": False,
            }
        )

    counts = Counter(row["action"] for row in decisions)
    by_domain = Counter(row["domain_id"] for row in decisions)
    doc = {
        "schema_version": "2026-10-06.unsupported-role-link-review-batch.v1",
        "batch": 22,
        "date": "2026-10-06",
        "scope": "The 236 unsupported exact role-to-domain keys remaining after global unsupported batches 001-021; parent-domain fit only.",
        "jurisdiction": "global_only",
        "method": "Reuse saved per-domain task/domain reviews and the D119 reconciliation ledger; inspect same-title cross-domain records only as context. No ISCO/subgroup/title inference.",
        "queue": "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json",
        "prior_batches": "GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06/batches 001-021",
        "canonical_changes_applied": False,
        "counts": {
            "queue_total": len(queue),
            "prior_global_unique_keys": len(prior_keys),
            "remaining_decisions": len(decisions),
            "by_action": dict(sorted(counts.items())),
            "by_saved_fit_status": dict(sorted(Counter(row["saved_fit_status"] for row in decisions).items())),
            "by_domain": dict(sorted(by_domain.items())),
            "with_cross_domain_context": sum(bool(row["cross_domain_peer_context"]) for row in decisions),
            "cross_domain_context_records": sum(len(row["cross_domain_peer_context"]) for row in decisions),
        },
        "action_vocabulary": {
            "remove_link_only": "Remove only the current exact parent-domain link; preserve the role/source record and any independently supported links.",
            "reclassify_exact": "Propose the same source-backed role under the explicitly evidenced exact destination key; canonical data is unchanged in this artifact.",
            "preserve_exclude": "Retain provenance while excluding the current edge from student-facing output when evidence is not sufficient for deletion or reassignment.",
            "unresolved": "Evidence remains insufficient or contradictory; no link action is safe.",
        },
        "decisions": decisions,
    }
    OUT_JSON.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md = f"""# Unsupported role→domain reconciliation — batch 022

Date: 2026-10-06  
Scope: the **236** exact keys left after prior global batches 001–021. This is a parent-domain audit only; it does not audit role→subgroup or role→specialization links.

## Exact result

| Result | Count |
|---|---:|
| Unsupported queue total | {len(queue)} |
| Already dispositioned in batches 001–021 | {len(prior_keys)} |
| This batch | {len(decisions)} |
| `remove_link_only` | {counts.get('remove_link_only', 0)} |
| `reclassify_exact` | {counts.get('reclassify_exact', 0)} |
| `preserve_exclude` | {counts.get('preserve_exclude', 0)} |
| `unresolved` | {counts.get('unresolved', 0)} |

The one exact reclassification candidate is `D152|conservation scientist` → `D121|conservation scientist`. The source task record is the same in both records and explicitly describes forest, park, wildlife-habitat and biodiversity work; this is not a title-only move. The remaining rows have saved task/domain evidence supporting removal of the current parent edge, including the six records sourced from the separate D119 ledger.

## Evidence and safeguards

- Every decision retains the saved task evidence, the current parent-domain scope, source references and the originating review artifact.
- Same-title records in other domains are recorded as **context only**. They never prove fit or destination.
- ISCO group, subgroup membership and role title were not used as fit evidence.
- No role→subgroup or role→specialization decision is made here.
- No canonical domain structure, role library, subgroup script, or seed file was edited.

## Verification

```text
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06/build_batch_022_remaining_queue.py
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_022_remaining_queue
```

The focused tests assert exact queue arithmetic, one-time coverage, saved evidence on every row, the explicit D152→D121 transfer, and the no-ISCO/no-subgroup/no-canonical-edit invariants.
"""
    OUT_MD.write_text(md, encoding="utf-8")
    print(json.dumps(doc["counts"], ensure_ascii=False, indent=2))
    print(f"wrote {OUT_JSON}")
    print(f"wrote {OUT_MD}")
    return doc


if __name__ == "__main__":
    build()
