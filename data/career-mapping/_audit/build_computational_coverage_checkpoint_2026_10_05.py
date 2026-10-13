"""Build an auditable full-catalogue computational-coverage checkpoint."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
OUT_JSON = AUDIT / "computational_coverage_checkpoint_2026_10_05.json"
OUT_MD = AUDIT / "COMPUTATIONAL_COVERAGE_CHECKPOINT_2026-10-05.md"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> dict:
    meta = read(ROOT / "domain_meta.json")
    structure = read(ROOT / "domain_structure.json")
    emerging = read(ROOT / "emerging_group_layers.json")
    raw = read(AUDIT / "computational_taxonomy_candidates_2026_10_05.json")
    triage = read(AUDIT / "computational_candidate_triage_2026_10_05.json")
    coverage = read(AUDIT / "computational_coverage_report.json")
    source_review = read(AUDIT / "computational_external_source_review_2026_10_05.json")
    case_dispositions = read(AUDIT / "computational_method_signal_domain_dispositions_2026_10_05.json")

    raw_domains = raw["domains"]
    triage_domains = triage["domains"]
    method_signal_rows = [row for row in triage_domains if row["triage_tier"] == "review_computational_methods_and_role_use_cases"]
    hit_source_types = Counter(hit["source_type"] for row in raw_domains for hit in row.get("hits", []))
    source_type_domain_counts = {
        source_type: sum(any(hit["source_type"] == source_type for hit in row.get("hits", [])) for row in raw_domains)
        for source_type in sorted(hit_source_types)
    }
    domain_count = len(meta)
    no_signal_count = triage["counts"]["domains_by_tier"]["no_specific_signal_after_triage"]
    triage_emitted = len(triage_domains)
    subgroup_count = sum(len(row.get("subgroups", [])) for row in structure.values())
    method_domains = set(coverage["scope"]["computational_domains"])

    counts = {
        "catalogue_domains": domain_count,
        "raw_scan_domains": len(raw_domains),
        "domains_with_any_raw_keyword_hit": raw["summary"]["domains_with_lexical_hits"],
        "declared_method_or_computational_domains_in_manifest_plus_historical_pairs": raw["summary"]["domains_with_declared_computational_layers"],
        "raw_hit_domains_outside_declared_layer_set": raw["summary"]["unrepresented_lexical_candidate_domains"],
        "raw_source_field_hits": raw["summary"]["candidate_hits_total"],
        "triaged_candidate_domains": triage_emitted,
        "triage_no_specific_signal_domains": no_signal_count,
        "triage_partition_total": triage_emitted + no_signal_count,
        "triage_method_or_role_task_signal_domains": triage["counts"]["domains_by_tier"]["review_computational_methods_and_role_use_cases"],
        "method_signal_domains_already_in_declared_layer_set": sum(row["declared_computational_layer"] for row in method_signal_rows),
        "method_signal_domains_outside_declared_layer_set": sum(not row["declared_computational_layer"] for row in method_signal_rows),
        "method_signal_domains_with_direct_and_role_task_signals": sum(bool(row["direct_scope_signals"]) and bool(row["role_task_signals"]) for row in method_signal_rows),
        "method_signal_domains_with_role_task_only": sum(not row["direct_scope_signals"] and bool(row["role_task_signals"]) for row in method_signal_rows),
        "triage_occupational_aggregate_only_domains": triage["counts"]["domains_by_tier"]["low_confidence_occupational_aggregate_only"],
        "named_computational_field_candidates": triage["counts"]["domains_by_tier"]["research_named_specialization_candidate"],
        "direct_domain_or_declared_layer_signal_domains": triage["counts"]["additional_metrics"]["domains_with_direct_scope_text_signal"],
        "role_task_signal_domains": triage["counts"]["additional_metrics"]["domains_with_role_task_signal"],
        "unique_role_task_candidate_rows": triage["counts"]["additional_metrics"]["unique_role_task_rows"],
        "base_domain_subgroup_records_scanned": subgroup_count,
        "emerging_subgroup_layer_records_scanned": len(emerging.get("subgroups", [])),
        "declared_computational_layer_domains_in_coverage_audit": coverage["summary"]["domains"],
        "declared_computational_method_group_records": coverage["summary"]["groups"],
        "coverage_audit_roles_in_declared_domains": coverage["summary"]["roles"],
        "coverage_audit_roles_with_esco": coverage["summary"]["roles_with_esco"],
        "coverage_audit_roles_with_onet": coverage["summary"]["roles_with_onet"],
        "coverage_audit_roles_source_backed": coverage["summary"]["roles_source_backed"],
        "explicit_role_method_links_only": coverage["summary"]["related_role_links"],
        "manifest_groups_without_explicit_role_method_link": coverage["summary"]["groups_without_explicit_role_method_link"],
        "invalid_explicit_role_links": coverage["summary"]["invalid_role_links"],
        "manifest_groups_missing_source_layer": coverage["summary"]["groups_missing_source_layer"],
        "externally_reviewed_candidate_dispositions": len(source_review["candidate_dispositions"]),
        "external_primary_and_professional_sources": len(source_review["sources"]),
        "method_signal_domains_case_dispositioned": case_dispositions["counts"]["method_task_signal_domains_classified"],
        "method_signal_role_task_rows_without_exact_local_role_title_match": case_dispositions["counts"]["role_task_rows_without_exact_local_role_title_match"],
    }
    if counts["triage_partition_total"] != domain_count or counts["raw_scan_domains"] != domain_count:
        raise ValueError("The raw and triage outputs no longer cover exactly the current domain catalogue")
    if counts["explicit_role_method_links_only"] != 4 or counts["invalid_explicit_role_links"] != 0:
        raise ValueError("The explicit role-method link coverage changed; inspect before updating this checkpoint")

    result = {
        "schema_version": "2026-10-05.computational-coverage-checkpoint.v1",
        "generated_by": Path(__file__).name,
        "inputs": [
            "domain_meta.json", "domain_structure.json", "emerging_group_layers.json",
            "computational_layer_manifest.json", "computational_method_evidence.json",
            "computational_role_subgroup_links.json",
            "_audit/computational_taxonomy_candidates_2026_10_05.json",
            "_audit/computational_candidate_triage_2026_10_05.json",
            "_audit/computational_coverage_report.json",
            "_audit/computational_external_source_review_2026_10_05.json",
            "_audit/computational_method_signal_domain_dispositions_2026_10_05.json",
        ],
        "counts": counts,
        "raw_hit_source_types": dict(sorted(hit_source_types.items())),
        "domains_with_hits_by_source_type": source_type_domain_counts,
        "triage_tiers": triage["counts"]["domains_by_tier"],
        "field_specific_phrase_occurrences": raw["summary"]["candidate_hits_by_category"],
        "external_candidate_dispositions": source_review["candidate_dispositions"],
        "interpretation": {
            "full_catalogue": "The exact current 168 domain IDs were scanned across domain metadata, base/emerging subgroup text, role-task descriptions and role competency evidence. Keyword hits are leads, not fit decisions.",
            "false_positive_guard": "Generic computer use, standard statistics, digital tools, ESCO/O*NET skill aggregates, and ISCO subgroup membership do not alone establish a computational specialization or role-parent fit.",
            "subgroups": "Current ISCO-coded subgroup aggregates are not treated as student-facing areas of specialization. The manifest's method-group keys are evidence anchors, not proof of the correct specialization taxonomy/count.",
            "roles": "Only explicit context-specific role-method links are counted; no role titles are invented and no inferred ISCO membership is promoted.",
            "candidate_limits": "A zero lexical signal means only that this defined vocabulary did not match current text; it does not prove that the domain has no computational methods.",
        },
        "unresolved": [
            "The 73 method/task-signal domains now have a durable case-level disposition in computational_method_signal_domain_dispositions_2026_10_05.json: 21 direct-scope/existing-layer cases, 10 already-declared-layer task-only cases and 42 role-task-only cases. This classifies scan findings; it does not close the independent role-to-domain audit.",
            "Four D139/D140 task-signal titles have no exact local role-title match (gameplay programmer, technical artist, game environment artist, robotics engineer). They remain explicitly unmatched rather than being assigned to similar role records.",
            "The one external named-field candidate outside the current declared layer set is D065 computational linguistics; external field recognition is established, but local D065 role/domain fit remains unproven.",
            "D041/D132/D135 computational-physics and scientific-computing signals need exact role-parent fit reconciliation; no role reassignment is authorized in this lane.",
            "D022 CFD and D017/D018/D138 computational-mechanics signals remain task/method candidates; source recognition does not validate current local role placement.",
            "38 of 39 manifest method-group records have no explicit role-method link. This is a coverage fact, not an automatic defect; role-to-specialization linkage waits for the specialization and role-domain audits.",
            "No external academic-body sign-off has been obtained, and no canonical taxonomy was edited.",
        ],
        "tests_expected": [
            "test_computational_coverage_checkpoint_2026_10_05.py",
            "test_computational_domain_coverage_reconciliation_2026_10_05.py",
            "python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091",
        ],
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Catalogue-wide computational coverage checkpoint — 2026-10-05", "",
        "This checkpoint supplements (does not replace or repeat) the completed deterministic candidate scan and explicit-link audit. It joins their current outputs to the external-source dispositions and records what the counts do—and do not—prove.",
        "", "## Exact coverage counts", "", "| Measure | Count |", "|---|---:|"]
    for key, value in counts.items():
        lines.append(f"| `{key}` | {value} |")
    lines.extend(["", "## How evidence was separated", "",
                  "- Domain-root text, subgroup/specialization text, role task text, and role occupational competency text are kept as distinct evidence layers.",
                  "- The lexical inventory produced 1,486 hits: role competencies 877, role tasks 459, base subgroup text 81, emerging subgroup text 28, domain-root text 24, and emerging domain-layer text 17. Many hits are repeated aggregate skills or general tools.",
                  "- Those hits occurred in 121 domains; the existing triage emits 107 candidate/follow-up domains and 61 no-specific-signal domains, exactly partitioning the 168-domain catalogue. The independent raw scan's 87 “outside declared layer” figure is a lexical-unrepresented count, not 87 validated missing specializations.",
                  "- 325 role-task rows are candidate signals across 74 domains. The ESCO/O*NET/ISCO aggregate-only tier is kept separate and never establishes parent-domain fit.",
                  f"- Within the 73 method/task-signal queue, {counts['method_signal_domains_already_in_declared_layer_set']} are already in the declared layer set and {counts['method_signal_domains_outside_declared_layer_set']} are not. The latter are review leads, not missing-specialization findings. {counts['method_signal_domains_with_direct_and_role_task_signals']} have both domain/layer and role-task signals; {counts['method_signal_domains_with_role_task_only']} are role-task-only.",
                  "- The existing method-link audit covers 39 manifest groups across 36 domains and 620 local role records. It found 4 explicit role-method links, 38 groups without one, 0 invalid explicit links and 0 missing source layers. No link is inferred from ISCO.",
                  "- There are 557 current base subgroup records and 76 emerging subgroup-layer records. These are inspected as candidate text inventories—not accepted as the correct student specialization taxonomy.",
                  "", "## Externally checked field/method candidates", "",
                  "| Candidate | Evidence-based disposition |", "|---|---|"])
    for item in source_review["candidate_dispositions"]:
        domains = item.get("domain_ids", [item.get("domain_id")])
        lines.append(f"| `{item['candidate_id']}` ({', '.join(x for x in domains if x)}) | `{item['disposition']}` — {item['next_action']} |")
    lines.extend(["", "## Primary/global source set", ""])
    for source in source_review["sources"]:
        lines.append(f"- [{source['publisher']}: {source['title']}]({source['url']}) — {source['supports']} Claim limit: {source['does_not_support']}")
    lines.extend(["", "## Remaining exact work", ""])
    for item in result["unresolved"]:
        lines.append(f"- {item}")
    lines.extend(["", "## Reproduction", "",
                  "```powershell",
                  "python data/career-mapping/_audit/triage_computational_candidate_hits_2026_10_05.py",
                  "python data/career-mapping/_audit/audit_computational_taxonomy_candidates_2026_10_05.py",
                  "python data/career-mapping/_audit_computational_coverage.py",
                  "python data/career-mapping/_audit/classify_computational_method_signal_domains_2026_10_05.py",
                  "python data/career-mapping/_audit/build_computational_coverage_checkpoint_2026_10_05.py",
                  "python -m pytest -q data/career-mapping/_audit/test_computational_domain_coverage_reconciliation_2026_10_05.py data/career-mapping/_audit/test_computational_coverage_checkpoint_2026_10_05.py",
                  "```", "",
                  "No writes were made to `domain_structure.json`, `role_library_v3*.json`, subgroup scripts/reports, or role-to-domain files. The field review is an audit result, not academic-body sign-off.", ""])
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    return result


if __name__ == "__main__":
    print(json.dumps(main()["counts"], ensure_ascii=False, indent=2))
