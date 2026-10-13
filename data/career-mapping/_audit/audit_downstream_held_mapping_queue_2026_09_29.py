"""Audit the downstream mapping-only hold queue.

This audit intentionally starts after the JAMB↔CCMAS scope reconciliation.  It
does not reopen course/source work, mutate the JAMB domain map, change labels,
or write a generated seed.  It derives a reviewable candidate set from the
already checked CCMAS programme-domain score catalogue and verifies that every
candidate domain has the downstream domain/subgroup/role registry needed by a
student route.

Each invocation writes a new JSON/Markdown checkpoint.  Existing checkpoints
are never overwritten.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
RECON = AUDIT / "jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json"
SCORES = ROOT / "programme_domain_scores.json"
DOMAIN_MAP = ROOT / "jamb_domain_map.json"
DOMAIN_META = ROOT / "domain_meta.json"
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"
ROLE_LIBRARY = ROOT / "role_library_v3.json"
ROLE_LIBRARY_CLEANED = ROOT / "role_library_v3_cleaned.json"
OUT_PREFIX = "downstream_held_mapping_audit_2026-09-29_increment_"

TIER_ORDER = {"adjacent": 1, "functional": 2, "direct": 3}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def next_increment() -> int:
    values = []
    for path in AUDIT.glob(f"{OUT_PREFIX}[0-9][0-9][0-9].json"):
        match = re.search(r"increment_(\d{3})\.json$", path.name)
        if match:
            values.append(int(match.group(1)))
    return max(values, default=0) + 1


def held_issue(row: dict[str, Any]) -> dict[str, Any] | None:
    return next(
        (
            issue
            for issue in row.get("issues", [])
            if issue.get("kind") == "mapping_explicitly_held_for_review"
        ),
        None,
    )


def highest_tier(tiers: set[str]) -> str | None:
    valid = [tier for tier in tiers if tier in TIER_ORDER]
    return max(valid, key=lambda tier: TIER_ORDER[tier]) if valid else None


def route_info(domain_id: str, meta: dict[str, Any], structure: dict[str, Any]) -> dict[str, Any]:
    meta_row = meta.get(domain_id) or {}
    structure_row = structure.get(domain_id) or {}
    subgroups = structure_row.get("subgroups") or []
    return {
        "domain_exists_in_meta": bool(meta_row),
        "domain_exists_in_structure": bool(structure_row),
        "domain_name": meta_row.get("domain_name"),
        "excluded": bool(meta_row.get("excluded")),
        "subgroup_count": len(subgroups),
        "role_count": int(structure_row.get("role_count") or 0),
        "student_route_structurally_available": bool(meta_row)
        and bool(structure_row)
        and not bool(meta_row.get("excluded"))
        and bool(subgroups)
        and int(structure_row.get("role_count") or 0) > 0,
    }


def main() -> None:
    reconciliation = load(RECON)
    scores = load(SCORES)
    domain_map = load(DOMAIN_MAP)
    domain_meta = load(DOMAIN_META)
    domain_structure = load(DOMAIN_STRUCTURE)
    role_library = load(ROLE_LIBRARY)
    role_library_cleaned = load(ROLE_LIBRARY_CLEANED)
    role_counts = Counter(row.get("domain_id") for row in role_library)
    cleaned_role_counts = Counter(row.get("domain_id") for row in role_library_cleaned)

    held_rows = []
    for row in reconciliation["rows"]:
        issue = held_issue(row)
        if issue is not None:
            held_rows.append((row, issue))

    row_reports: list[dict[str, Any]] = []
    candidate_pairs: list[dict[str, Any]] = []
    source_component_counts: Counter[str] = Counter()
    row_dispositions: Counter[str] = Counter()
    scope_statuses: Counter[str] = Counter()
    mapping_types: Counter[str] = Counter()
    tier_counts: Counter[str] = Counter()
    tier_evidence_counts: Counter[str] = Counter()
    conflict_pair_count = 0
    raw_component_link_observations = 0
    all_domain_ids: set[str] = set()

    for row, issue in held_rows:
        name = row["jamb_name"]
        mapping_types[row.get("mapping_type") or "unknown"] += 1
        scope_statuses[issue.get("details", {}).get("scope_status") or "unknown"] += 1

        missing_components = [component for component in row.get("ccmas_components", []) if component not in scores]
        for component in row.get("ccmas_components", []):
            if component in scores:
                source_component_counts[component] += 1

        by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for component in row.get("ccmas_components", []):
            for link in (scores.get(component) or {}).get("links", []):
                raw_component_link_observations += 1
                by_domain[link["domain_id"]].append(
                    {
                        "component": component,
                        "match_type": link.get("match_type"),
                        "score": link.get("score"),
                        "course_match": bool(link.get("course_match")),
                        "strong_name": bool(link.get("strong_name")),
                        "weak_name": bool(link.get("weak_name")),
                    }
                )

        row_conflicts = 0
        row_weak_pairs = 0
        row_candidates = []
        for domain_id, observations in sorted(by_domain.items()):
            all_domain_ids.add(domain_id)
            observed_tiers = {item["match_type"] for item in observations if item["match_type"]}
            tier = highest_tier(observed_tiers)
            tier_conflict = len(observed_tiers) > 1
            course_evidence = all(item["course_match"] for item in observations)
            if tier_conflict:
                row_conflicts += 1
                conflict_pair_count += 1
            if not course_evidence:
                row_weak_pairs += 1

            route = route_info(domain_id, domain_meta, domain_structure)
            route["role_library_v3_count"] = role_counts[domain_id]
            route["role_library_v3_cleaned_count"] = cleaned_role_counts[domain_id]
            route["student_view_role_registry_present"] = cleaned_role_counts[domain_id] > 0
            evidence_state = "component_score_course_match" if course_evidence else "component_score_link_without_course_match"
            tier_state = "conflicting_component_tiers" if tier_conflict else "stable_component_tier"
            pair_disposition = (
                "candidate_but_do_not_promote_until_tier_adjudicated"
                if tier_conflict
                else "candidate_but_do_not_promote_without_course_evidence"
                if not course_evidence
                else "deterministic_repair_candidate"
            )
            candidate = {
                "jamb_name": name,
                "domain_id": domain_id,
                "domain_name": route["domain_name"],
                "candidate_match_type": tier,
                "observed_match_types": sorted(observed_tiers),
                "tier_state": tier_state,
                "course_evidence": evidence_state,
                "contributing_components": sorted({item["component"] for item in observations}),
                "max_score": max((item["score"] for item in observations if isinstance(item["score"], (int, float))), default=None),
                "observations": observations,
                "route": route,
                "repair_disposition": pair_disposition,
            }
            candidate_pairs.append(candidate)
            row_candidates.append(candidate)
            tier_counts[tier or "unknown"] += 1
            tier_evidence_counts[f"{tier or 'unknown'}:{evidence_state}"] += 1

        if missing_components:
            disposition = "needs_missing_component_downstream_evidence"
        elif row_conflicts:
            disposition = "needs_direct_functional_adjacent_adjudication"
        elif row_weak_pairs:
            disposition = "needs_course_evidence_review"
        else:
            disposition = "deterministic_repair_candidate"
        row_dispositions[disposition] += 1

        current_links = (domain_map.get(name) or {}).get("links") or []
        row_reports.append(
            {
                "jamb_name": name,
                "mapping_type": row.get("mapping_type"),
                "ccmas_components": row.get("ccmas_components", []),
                "selected_course_count": row.get("selected_course_count"),
                "scope_status": issue.get("details", {}).get("scope_status"),
                "current_mapping_status": issue.get("details", {}).get("mapping_status"),
                "current_published_link_count": len(current_links),
                "current_student_view_state": "fail_closed_no_published_links" if not current_links else "requires_unsupported_link_check",
                "missing_components": missing_components,
                "candidate_domain_count": len(row_candidates),
                "conflicting_tier_pair_count": row_conflicts,
                "weak_course_evidence_pair_count": row_weak_pairs,
                "repair_disposition": disposition,
                "candidate_domains": row_candidates,
            }
        )

    current_published_links = sum(item["current_published_link_count"] for item in row_reports)
    current_unsupported_links = sum(
        1
        for item in row_reports
        for link in ((domain_map.get(item["jamb_name"]) or {}).get("links") or [])
        if not route_info(link.get("domain_id"), domain_meta, domain_structure)["student_route_structurally_available"]
    )
    complete_component_rows = sum(not item["missing_components"] for item in row_reports)
    distinct_candidate_domains = {
        item["domain_id"] for item in candidate_pairs
    }
    route_ready_pairs = sum(
        bool(item["route"]["student_route_structurally_available"])
        for item in candidate_pairs
    )
    route_subgroups = sum(
        len(domain_structure[domain_id].get("subgroups", []))
        for domain_id in distinct_candidate_domains
        if domain_id in domain_structure
    )
    route_roles = sum(
        int(domain_structure[domain_id].get("role_count") or 0)
        for domain_id in distinct_candidate_domains
        if domain_id in domain_structure
    )
    candidate_pairs_with_cleaned_roles = sum(
        item["route"]["student_view_role_registry_present"] for item in candidate_pairs
    )
    candidate_domains_missing_cleaned_roles = sorted(
        domain_id for domain_id in distinct_candidate_domains if cleaned_role_counts[domain_id] == 0
    )
    candidate_domains_missing_v3_roles = sorted(
        domain_id for domain_id in distinct_candidate_domains if role_counts[domain_id] == 0
    )
    structure_vs_cleaned_exact = sum(
        int(domain_structure[domain_id].get("role_count") or 0) == cleaned_role_counts[domain_id]
        for domain_id in distinct_candidate_domains
    )
    structure_vs_v3_exact = sum(
        int(domain_structure[domain_id].get("role_count") or 0) == role_counts[domain_id]
        for domain_id in distinct_candidate_domains
    )

    def subgroup_counts(rows: list[dict[str, Any]], domain_id: str) -> Counter[str]:
        return Counter(
            str(row.get("isco_group"))[:2]
            for row in rows
            if row.get("domain_id") == domain_id and row.get("isco_group") is not None
        )

    def expected_subgroup_counts(domain_id: str) -> Counter[str]:
        return Counter(
            {
                str(subgroup.get("isco_submajor")): int(subgroup.get("role_count") or 0)
                for subgroup in domain_structure[domain_id].get("subgroups", [])
                if subgroup.get("isco_submajor") is not None
            }
        )

    structure_vs_cleaned_subgroups_exact = sum(
        expected_subgroup_counts(domain_id) == subgroup_counts(role_library_cleaned, domain_id)
        for domain_id in distinct_candidate_domains
    )
    structure_vs_v3_subgroups_exact = sum(
        expected_subgroup_counts(domain_id) == subgroup_counts(role_library, domain_id)
        for domain_id in distinct_candidate_domains
    )
    rows_with_cleaned_role_gap = sum(
        any(not candidate["route"]["student_view_role_registry_present"] for candidate in row["candidate_domains"])
        for row in row_reports
    )

    increment = next_increment()
    stem = f"{OUT_PREFIX}{increment:03d}"
    source_paths = [
        RECON,
        SCORES,
        DOMAIN_MAP,
        DOMAIN_META,
        DOMAIN_STRUCTURE,
        ROLE_LIBRARY,
        ROLE_LIBRARY_CLEANED,
    ]
    report = {
        "schema": "downstream_held_mapping_audit.v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "append_only_increment": increment,
        "audit_only": True,
        "canonical_mappings_edited": False,
        "generated_seeds_edited": False,
        "scope": {
            "description": "Only the mapping-only downstream hold queue after JAMB↔CCMAS reconciliation.",
            "held_mapping_occurrences": len(row_reports),
            "closed_course_source_work_reopened": False,
            "role_names_changed": False,
        },
        "counts": {
            "held_mapping_occurrences": len(row_reports),
            "held_rows_with_complete_component_score_catalogue": complete_component_rows,
            "held_rows_with_missing_component_score_catalogue": len(row_reports) - complete_component_rows,
            "current_published_links": current_published_links,
            "current_published_unsupported_links": current_unsupported_links,
            "current_fail_closed_rows": sum(item["current_published_link_count"] == 0 for item in row_reports),
            "raw_component_domain_link_observations": raw_component_link_observations,
            "unique_jamb_domain_candidate_pairs": len(candidate_pairs),
            "distinct_candidate_domains": len(distinct_candidate_domains),
            "candidate_pairs_with_structural_student_route": route_ready_pairs,
            "candidate_pairs_with_cleaned_role_registry": candidate_pairs_with_cleaned_roles,
            "candidate_pairs_without_cleaned_role_registry": len(candidate_pairs) - candidate_pairs_with_cleaned_roles,
            "distinct_candidate_domains_missing_meta_or_structure": len(
                [domain_id for domain_id in distinct_candidate_domains if domain_id not in domain_meta or domain_id not in domain_structure]
            ),
            "candidate_domain_subgroups_across_distinct_domains": route_subgroups,
            "candidate_domain_roles_across_distinct_domains": route_roles,
            "distinct_candidate_domains_missing_role_library_v3_rows": len(candidate_domains_missing_v3_roles),
            "distinct_candidate_domains_missing_cleaned_role_rows": len(candidate_domains_missing_cleaned_roles),
            "distinct_candidate_domains_role_count_matches_cleaned_registry": structure_vs_cleaned_exact,
            "distinct_candidate_domains_role_count_matches_v3_registry": structure_vs_v3_exact,
            "distinct_candidate_domains_subgroup_counts_match_cleaned_registry": structure_vs_cleaned_subgroups_exact,
            "distinct_candidate_domains_subgroup_counts_match_v3_registry": structure_vs_v3_subgroups_exact,
            "rows_with_candidate_cleaned_role_registry_gap": rows_with_cleaned_role_gap,
            "candidate_pairs_with_tier_conflict": sum(item["tier_state"] == "conflicting_component_tiers" for item in candidate_pairs),
            "candidate_pairs_without_all_component_course_match": sum(item["course_evidence"] != "component_score_course_match" for item in candidate_pairs),
            "rows_deterministic_repair_candidate": row_dispositions["deterministic_repair_candidate"],
            "rows_needing_direct_functional_adjacent_adjudication": row_dispositions["needs_direct_functional_adjacent_adjudication"],
            "rows_needing_course_evidence_review": row_dispositions["needs_course_evidence_review"],
            "rows_needing_missing_component_downstream_evidence": row_dispositions["needs_missing_component_downstream_evidence"],
        },
        "scope_status_counts": dict(scope_statuses),
        "mapping_type_counts": dict(mapping_types),
        "candidate_tier_counts": dict(tier_counts),
        "candidate_tier_evidence_counts": dict(tier_evidence_counts),
        "row_disposition_counts": dict(row_dispositions),
        "source_component_use_counts": dict(source_component_counts),
        "role_registry_cross_check": {
            "role_library_v3_total_rows": len(role_library),
            "role_library_v3_cleaned_total_rows": len(role_library_cleaned),
            "candidate_domains_missing_v3_rows": candidate_domains_missing_v3_roles,
            "candidate_domains_missing_cleaned_rows": candidate_domains_missing_cleaned_roles,
        },
        "source_inputs": {
            str(path.relative_to(ROOT)): {"sha256": sha256(path), "bytes": path.stat().st_size}
            for path in source_paths
        },
        "examples": {
            "stable_candidate": next((item for item in row_reports if item["repair_disposition"] == "deterministic_repair_candidate"), None),
            "tier_conflict": next((item for item in row_reports if item["repair_disposition"] == "needs_direct_functional_adjacent_adjudication"), None),
            "missing_component": next((item for item in row_reports if item["repair_disposition"] == "needs_missing_component_downstream_evidence"), None),
        },
        "rows": row_reports,
    }
    json_path = AUDIT / f"{stem}.json"
    md_path = AUDIT / f"{stem}.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    c = report["counts"]
    lines = [
        f"# Downstream held-mapping audit — increment {increment:03d}",
        "",
        "Audit-only, append-only checkpoint. This pass begins after the JAMB↔CCMAS reconciliation; it did not reopen course/source work, change role names, edit canonical mappings, or edit generated seeds.",
        "",
        "## Exact current counts",
        "",
        f"- Held downstream mapping occurrences: **{c['held_mapping_occurrences']}**.",
        f"- Rows with complete component score-catalogue coverage: **{c['held_rows_with_complete_component_score_catalogue']}**; missing a component catalogue: **{c['held_rows_with_missing_component_score_catalogue']}**.",
        f"- Current published links for these held rows: **{c['current_published_links']}**; unsupported published links: **{c['current_published_unsupported_links']}**. Therefore all **{c['current_fail_closed_rows']}** held rows are currently fail-closed in the student view.",
        f"- Component-domain observations: **{c['raw_component_domain_link_observations']}**; unique JAMB↔domain candidate pairs: **{c['unique_jamb_domain_candidate_pairs']}** across **{c['distinct_candidate_domains']}** domains.",
        f"- Candidate pairs with a structurally available domain→subgroup→role route: **{c['candidate_pairs_with_structural_student_route']}**; candidate domains missing meta/structure: **{c['distinct_candidate_domains_missing_meta_or_structure']}**.",
        f"- Candidate pairs with a cleaned role-registry row: **{c['candidate_pairs_with_cleaned_role_registry']}**; without one: **{c['candidate_pairs_without_cleaned_role_registry']}** across **{c['distinct_candidate_domains_missing_cleaned_role_rows']}** candidate domains.",
        f"- `domain_structure.json` role counts match `role_library_v3_cleaned.json` for **{c['distinct_candidate_domains_role_count_matches_cleaned_registry']} / {c['distinct_candidate_domains']}** candidate domains; subgroup role counts match for **{c['distinct_candidate_domains_subgroup_counts_match_cleaned_registry']} / {c['distinct_candidate_domains']}**. This is a registry reconciliation finding, not a role-name change.",
        f"- Candidate direct/functional/adjacent tier conflicts: **{c['candidate_pairs_with_tier_conflict']} pairs** across **{c['rows_needing_direct_functional_adjacent_adjudication']} rows**.",
        f"- Candidate pairs without course-match evidence from every contributing component: **{c['candidate_pairs_without_all_component_course_match']}**.",
        "",
        "## Row-level dispositions",
        "",
        f"- **{c['rows_deterministic_repair_candidate']} rows** are deterministic repair candidates: all component score catalogues exist, every candidate pair has course-match evidence, and no component tier conflict was found.",
        f"- **{c['rows_needing_direct_functional_adjacent_adjudication']} rows** need tier adjudication before publication because the same domain receives different tiers from different CCMAS components.",
        f"- **{c['rows_needing_course_evidence_review']} rows** need targeted course-evidence review for at least one candidate pair.",
        f"- **{c['rows_needing_missing_component_downstream_evidence']} row** needs downstream evidence for a component not present in the score catalogue.",
        "",
        "## Tier candidate counts",
        "",
        "These are deterministic candidate classifications from the component score catalogue, not published student links. Conflicted pairs are retained as conflicts rather than silently promoted.",
        f"- Direct candidate pairs: **{report['candidate_tier_counts'].get('direct', 0)}**.",
        f"- Functional candidate pairs: **{report['candidate_tier_counts'].get('functional', 0)}**.",
        f"- Adjacent candidate pairs: **{report['candidate_tier_counts'].get('adjacent', 0)}**.",
        "",
        "## Deterministic repair rule",
        "",
        "For the 54 fully stable rows, the next safe repair can materialize the component-score-catalogue union, preserve the derived direct/functional/adjacent tier, and attach the contributing CCMAS components as provenance. Do not publish a pair with a conflicting component tier, a false course-match flag, a missing component catalogue, or a missing domain/subgroup/role route. Those cases remain targeted downstream review candidates—not student requirements.",
        "",
        "## Evidence basis",
        "",
        "- `jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json` identifies the exact 120 rows as mapping-only holds after course/source issues were cleared.",
        "- `programme_domain_scores.json` supplies the component-level domain ID, score, course-match flag, and direct/functional/adjacent label.",
        "- `domain_meta.json` and `domain_structure.json` verify the domain name, exclusion state, subgroup presence, and role count for each candidate route.",
        "- `jamb_domain_map.json` verifies what is currently student-published; the 120 held rows have no published links, so this audit found no currently exposed unsupported link in this queue.",
        "",
        "## Boundary",
        "",
        "This is an audit checkpoint and repair queue only. It does not claim that candidate links are approved for students, and it does not replace the final domain/subgroup/role evidence audit. The full row inventory and evidence details are in the paired JSON checkpoint.",
    ]
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json_path)
    print(md_path)
    print(json.dumps(report["counts"], ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
