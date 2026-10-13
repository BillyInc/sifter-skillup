#!/usr/bin/env python3
"""Build a disjoint, reproducible D085-D168 unresolved role-fit queue.

This script is triage only: exact source/task duplicates reduce repeat retrieval,
never domain-fit judgments. It does not edit canonical taxonomy or shared outputs.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[5]
DEFAULT_INVENTORY = ROOT / "data/career-mapping/_audit/domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
DEFAULT_D119_LEDGER = ROOT / "data/career-mapping/_audit/role_taxonomy_fit_review_2026_10_05.json"
DEFAULT_ESCO_CACHE = ROOT / "data/career-mapping/taxonomies/esco_occupations.json"
LANE_DIR = Path(__file__).resolve().parent


def canonical(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def task_signature(row: dict[str, Any]) -> str:
    payload = {
        "role_description": " ".join((row.get("role_description") or "").split()),
        "esco_occupation_uris": sorted(row.get("esco_occupation_uris") or []),
        "evidence_source_urls": sorted(row.get("evidence_source_urls") or []),
    }
    return hashlib.sha256(canonical(payload).encode("utf-8")).hexdigest()


def build(inventory_path: Path, d119_ledger_path: Path, esco_cache_path: Path) -> dict[str, Any]:
    inventory = json.loads(inventory_path.read_text(encoding="utf-8"))
    esco_cache = json.loads(esco_cache_path.read_text(encoding="utf-8"))
    lane_rows = [
        row for row in inventory["role_mappings"]
        if 85 <= int(row["domain_id"][1:]) <= 168 and row["domain_id"] != "D119"
    ]
    unresolved = [
        row for row in lane_rows
        if row.get("role_to_domain_fit_status") == "not_individually_reviewed"
    ]

    by_signature: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_uri: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in unresolved:
        by_signature[task_signature(row)].append(row)
        for uri in sorted(set(row.get("esco_occupation_uris") or [])):
            by_uri[uri].append(row)

    repeated_signatures = [
        rows for rows in by_signature.values() if len(rows) > 1
    ]
    repeated_uris = [rows for rows in by_uri.values() if len(rows) > 1]

    d119_rows = [row for row in inventory["role_mappings"] if row["domain_id"] == "D119"]
    d119_ledger = json.loads(d119_ledger_path.read_text(encoding="utf-8"))["role_reviews"]
    d119_by_key = {row["role_key"]: row for row in d119_rows}
    d119_mismatches = []
    for decision in d119_ledger:
        canonical_row = d119_by_key.get(decision["role_key"])
        expected_path_status = "excluded" if decision.get("student_path_disposition") == "exclude_from_D119_student_path" else "active"
        actual = None if canonical_row is None else {
            "domain_fit_status": canonical_row.get("role_to_domain_fit_status"),
            "specialization_fit_status": canonical_row.get("role_to_specialization_fit_status"),
            "specialization_key": canonical_row.get("reviewed_specialization_key"),
            "student_path_status": canonical_row.get("student_path_status"),
            "basis": canonical_row.get("role_fit_review_basis"),
            "source_refs": canonical_row.get("role_fit_review_source_refs") or [],
        }
        expected = {
            "domain_fit_status": decision.get("domain_fit_status"),
            "specialization_fit_status": decision.get("specialization_fit_status"),
            "specialization_key": decision.get("specialization_key"),
            "student_path_status": expected_path_status,
            "basis": decision.get("basis"),
            "source_refs": decision.get("source_refs") or [],
        }
        if actual != expected:
            d119_mismatches.append({"role_key": decision["role_key"], "expected": expected, "actual": actual})
    d119_missing_ledger_keys = sorted(set(d119_by_key) - {row["role_key"] for row in d119_ledger})
    d119_extra_ledger_keys = sorted({row["role_key"] for row in d119_ledger} - set(d119_by_key))

    def compact(row: dict[str, Any]) -> dict[str, Any]:
        return {
            "role_key": row.get("role_key"),
            "domain_id": row.get("domain_id"),
            "domain_name": row.get("domain_name"),
            "domain_scope": row.get("domain_scope"),
            "role_name": row.get("role_name"),
            "role_description": row.get("role_description"),
            "esco_code": row.get("esco_code"),
            "esco_occupation_uris": row.get("esco_occupation_uris") or [],
            "evidence_source_urls": row.get("evidence_source_urls") or [],
            "onet_occupation_codes": row.get("onet_occupation_codes") or [],
            "role_to_domain_fit_status": row.get("role_to_domain_fit_status"),
            "student_path_status": row.get("student_path_status"),
            "current_specialization_membership_not_fit_evidence": True,
        }

    missing_esco = [row for row in unresolved if not row.get("esco_occupation_uris")]
    uri_join_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in unresolved:
        for uri in sorted(set(row.get("esco_occupation_uris") or [])):
            profile = esco_cache.get(uri)
            inventory_text = " ".join((row.get("role_description") or "").split())
            source_text = " ".join((profile.get("definition") or "").split()) if profile else ""
            if not profile:
                text_relation = "profile_missing"
            elif inventory_text == source_text:
                text_relation = "exact"
            elif inventory_text and source_text.startswith(inventory_text):
                text_relation = "inventory_is_source_prefix_possible_truncation"
            elif source_text and inventory_text.startswith(source_text):
                text_relation = "source_is_inventory_prefix_possible_extension"
            elif difflib.SequenceMatcher(None, inventory_text.casefold(), source_text.casefold()).ratio() >= 0.92:
                text_relation = "near_match_requires_review"
            else:
                text_relation = "material_text_difference_requires_review"
            uri_join_rows[uri].append({
                "role_key": row["role_key"],
                "domain_id": row["domain_id"],
                "role_name": row["role_name"],
                "inventory_description": row.get("role_description"),
                "inventory_esco_code": row.get("esco_code"),
                "esco_cache_profile_found": profile is not None,
                "esco_label": profile.get("label") if profile else None,
                "esco_code": profile.get("code") if profile else None,
                "esco_definition": profile.get("definition") if profile else None,
                "inventory_description_matches_esco_definition": bool(profile) and " ".join((row.get("role_description") or "").split()) == " ".join((profile.get("definition") or "").split()),
                "description_text_relation": text_relation,
                "description_similarity_ratio": difflib.SequenceMatcher(None, inventory_text.casefold(), source_text.casefold()).ratio() if profile else None,
                "inventory_name_matches_esco_label": bool(profile) and (row.get("role_name") or "").casefold() == (profile.get("label") or "").casefold(),
            })
    joined_rows = [entry for values in uri_join_rows.values() for entry in values]
    source_join_counts = {
        "unresolved_rows_with_uri_join_attempt": len({entry["role_key"] for entry in joined_rows}),
        "uri_joined_mapping_rows": len(joined_rows),
        "uri_join_rows_profile_found": sum(entry["esco_cache_profile_found"] for entry in joined_rows),
        "uri_join_rows_profile_missing": sum(not entry["esco_cache_profile_found"] for entry in joined_rows),
        "joined_rows_description_exact_match": sum(entry["inventory_description_matches_esco_definition"] for entry in joined_rows),
        "joined_rows_description_mismatch": sum(entry["esco_cache_profile_found"] and not entry["inventory_description_matches_esco_definition"] for entry in joined_rows),
        "joined_rows_name_matches_label": sum(entry["inventory_name_matches_esco_label"] for entry in joined_rows),
        "joined_rows_name_differs_from_label": sum(entry["esco_cache_profile_found"] and not entry["inventory_name_matches_esco_label"] for entry in joined_rows),
        "joined_rows_description_text_relation_counts": dict(Counter(entry["description_text_relation"] for entry in joined_rows)),
    }
    uri_multiple_task_versions = []
    for uri, rows in sorted(by_uri.items()):
        task_versions = {task_signature(row) for row in rows}
        if len(task_versions) > 1:
            uri_multiple_task_versions.append({
                "esco_uri": uri,
                "task_version_count": len(task_versions),
                "rows": [compact(row) for row in rows],
                "triage": "same ESCO URI has differing stored task/source content; inspect each record",
            })

    return {
        "schema_version": "1.0",
        "inventory_path": str(inventory_path),
        "d119_fit_ledger_path": str(d119_ledger_path),
        "esco_cache_path": str(esco_cache_path),
        "lane": {"domain_id_min": "D085", "domain_id_max": "D168"},
        "policy": {
            "unresolved_status": "not_individually_reviewed",
            "already_dispositioned_rows_preserved": True,
            "exact_duplicates_reduce_source_retrieval_only": True,
            "fit_decision_must_be_independent_per_role_key_and_parent_domain": True,
            "isco_subgroup_esco_family_title_similarity_and_frequency_are_not_fit_evidence": True,
        },
        "counts": {
            "lane_mappings_total": len(lane_rows),
            "lane_mappings_previously_dispositioned": len(lane_rows) - len(unresolved),
            "unresolved_mappings": len(unresolved),
            "unresolved_domains_with_mappings": len({row["domain_id"] for row in unresolved}),
            "unresolved_distinct_role_keys": len({row["role_key"] for row in unresolved}),
            "unresolved_distinct_role_names": len({row["role_name"] for row in unresolved}),
            "unresolved_without_esco_uri": len(missing_esco),
            "unresolved_with_esco_uri": len(unresolved) - len(missing_esco),
            "unique_esco_uri_vectors_including_missing": len({tuple(row.get("esco_occupation_uris") or []) for row in unresolved}),
            "repeated_exact_task_and_uri_clusters": len(repeated_signatures),
            "rows_in_repeated_exact_task_and_uri_clusters": sum(map(len, repeated_signatures)),
            "repeated_uri_clusters": len(repeated_uris),
            "rows_in_repeated_uri_clusters": sum(map(len, repeated_uris)),
            "uri_clusters_with_differing_task_or_source_content": len(uri_multiple_task_versions),
            "d119_canonical_mappings_preserved_outside_lane": len(d119_rows),
            "d119_ledger_rows": len(d119_ledger),
            "d119_role_key_decision_matches": len(d119_ledger) - len(d119_mismatches),
            "d119_role_key_decision_mismatches": len(d119_mismatches) + len(d119_missing_ledger_keys) + len(d119_extra_ledger_keys),
            "whole_catalogue_canonical_mappings": len(inventory["role_mappings"]),
            "whole_catalogue_without_explicit_semantic_review_status": sum(not row.get("explicit_semantic_review_status") for row in inventory["role_mappings"]),
            "whole_catalogue_explicit_semantic_status_counts": dict(Counter(row.get("explicit_semantic_review_status") or "not_recorded" for row in inventory["role_mappings"])),
            "whole_catalogue_role_to_domain_fit_status_counts": dict(Counter(row.get("role_to_domain_fit_status") or "not_recorded" for row in inventory["role_mappings"])),
            **source_join_counts,
        },
        "unresolved_rows": [compact(row) for row in sorted(unresolved, key=lambda x: (x["domain_id"], x["role_name"], x["role_key"]))],
        "repeated_exact_task_and_uri_clusters": [
            {
                "signature": task_signature(rows[0]),
                "role_description": rows[0].get("role_description"),
                "esco_occupation_uris": rows[0].get("esco_occupation_uris") or [],
                "evidence_source_urls": rows[0].get("evidence_source_urls") or [],
                "mappings": [{"role_key": row["role_key"], "domain_id": row["domain_id"], "domain_name": row["domain_name"], "domain_scope": row["domain_scope"]} for row in sorted(rows, key=lambda x: (x["domain_id"], x["role_key"]))],
                "triage": "retrieve shared exact task source once; independently assess each listed parent-domain scope",
            }
            for rows in sorted(repeated_signatures, key=lambda values: task_signature(values[0]))
        ],
        "repeated_uri_clusters": [
            {
                "esco_uri": uri,
                "mappings": [{"role_key": row["role_key"], "domain_id": row["domain_id"], "domain_name": row["domain_name"], "domain_scope": row["domain_scope"], "role_description": row.get("role_description")} for row in sorted(rows, key=lambda x: (x["domain_id"], x["role_key"]))],
                "triage": "retrieve linked profile once, verify stored task version, then decide fit per parent domain",
            }
            for uri, rows in sorted(by_uri.items()) if len(rows) > 1
        ],
        "uri_multiple_task_versions": uri_multiple_task_versions,
        "d119_reconciliation": {
            "preserve_without_reaudit": True,
            "mismatches": d119_mismatches,
            "canonical_keys_missing_from_ledger": d119_missing_ledger_keys,
            "ledger_keys_missing_from_canonical_inventory": d119_extra_ledger_keys,
        },
        "exact_esco_uri_joins": joined_rows,
        "source_gap_rows": [compact(row) for row in sorted(missing_esco, key=lambda x: (x["domain_id"], x["role_name"], x["role_key"]))],
        "repair_contract": {
            "canonical_edits_enabled": False,
            "promotion_requires": ["specific role_key", "expected prior state", "one of the four allowed dispositions", "task/domain rationale", "direct source URL and locator", "what source supports", "limitations"],
            "conditional_or_unresolved_student_effect": "remain explicitly review-gated until a supported path is established",
            "unsupported_student_effect": "exclude only that role-to-domain path; preserve occupation identity and record rationale",
        },
    }


def write_markdown(payload: dict[str, Any], out_path: Path) -> None:
    c = payload["counts"]
    lines = [
        "# D085–D168 role-fit deterministic queue",
        "",
        f"Generated from `{payload['inventory_path']}`.",
        "",
        "## Baseline and exact-source triage",
        "",
        f"- Lane mappings: **{c['lane_mappings_total']}**; previously dispositioned (preserve): **{c['lane_mappings_previously_dispositioned']}**.",
        f"- Unresolved mappings: **{c['unresolved_mappings']}** across **{c['unresolved_domains_with_mappings']}** domains and **{c['unresolved_distinct_role_names']}** distinct role names.",
        f"- No stored ESCO URI: **{c['unresolved_without_esco_uri']}**; at least one stored ESCO URI: **{c['unresolved_with_esco_uri']}**.",
        f"- Exact repeated task+URI clusters: **{c['repeated_exact_task_and_uri_clusters']}**, containing **{c['rows_in_repeated_exact_task_and_uri_clusters']}** mapping rows.",
        f"- Repeated URI clusters: **{c['repeated_uri_clusters']}**, containing **{c['rows_in_repeated_uri_clusters']}** rows; URI clusters with differing stored task/source content: **{c['uri_clusters_with_differing_task_or_source_content']}**.",
        f"- D119 preserved outside this lane: **{c['d119_canonical_mappings_preserved_outside_lane']}** canonical mappings; fit-ledger rows **{c['d119_ledger_rows']}**; role-key decision matches **{c['d119_role_key_decision_matches']}**; mismatches **{c['d119_role_key_decision_mismatches']}**.",
        f"- Whole catalogue: **{c['whole_catalogue_canonical_mappings']}** canonical mappings; explicit semantic-status field absent on **{c['whole_catalogue_without_explicit_semantic_review_status']}**; field counts `{canonical(c['whole_catalogue_explicit_semantic_status_counts'])}`.",
        f"- Whole-catalogue role-to-domain fit-field counts: `{canonical(c['whole_catalogue_role_to_domain_fit_status_counts'])}`.",
        f"- Exact URI join to local ESCO occupations cache: **{c['uri_joined_mapping_rows']}** rows attempted; profiles found **{c['uri_join_rows_profile_found']}**, missing **{c['uri_join_rows_profile_missing']}**; stored descriptions exact **{c['joined_rows_description_exact_match']}**, mismatched **{c['joined_rows_description_mismatch']}**; names equal ESCO labels **{c['joined_rows_name_matches_label']}**, differing **{c['joined_rows_name_differs_from_label']}**.",
        f"- Description mismatch triage: `{canonical(c['joined_rows_description_text_relation_counts'])}`.",
        "",
        "Repeated sources may be fetched once, but each mapping still requires its own task-versus-domain decision. No canonical data is changed by this queue builder.",
        "",
        "## Exact-task/URI repeat clusters",
        "",
        "| Cluster signature | Mapping rows | Domain-role mappings | Source URI |",
        "|---|---:|---|---|",
    ]
    for group in payload["repeated_exact_task_and_uri_clusters"]:
        keys = ", ".join(f"{m['domain_id']} {m['role_key'].split('|',1)[-1]}" for m in group["mappings"])
        uri = (group["esco_occupation_uris"] or [""])[0]
        lines.append(f"| `{group['signature'][:12]}` | {len(group['mappings'])} | {keys} | {uri} |")
    lines.extend(["", "## Missing-ESCO-URI rows", "", "| Domain | Role | Other source URLs / occupational IDs |", "|---|---|---|"])
    for row in payload["source_gap_rows"]:
        refs = "; ".join(row["evidence_source_urls"] + row["onet_occupation_codes"])
        lines.append(f"| {row['domain_id']} | {row['role_name']} | {refs or 'No stored alternate locator'} |")
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", type=Path, default=DEFAULT_INVENTORY)
    parser.add_argument("--d119-ledger", type=Path, default=DEFAULT_D119_LEDGER)
    parser.add_argument("--esco-cache", type=Path, default=DEFAULT_ESCO_CACHE)
    parser.add_argument("--out-dir", type=Path, default=LANE_DIR)
    args = parser.parse_args()
    payload = build(args.inventory, args.d119_ledger, args.esco_cache)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    json_path = args.out_dir / "D085_D168_role_fit_queue_2026_10_05.json"
    md_path = args.out_dir / "D085_D168_role_fit_queue_2026_10_05.md"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_markdown(payload, md_path)
    print(json.dumps({"counts": payload["counts"], "json": str(json_path), "markdown": str(md_path)}, indent=2))


if __name__ == "__main__":
    main()
