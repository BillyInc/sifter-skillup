"""Classify remaining review-state tokens without silently promoting evidence."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "_audit"
OUT_JSON = AUDIT / "review_state_dispositions_2026-09-01.json"
OUT_MD = AUDIT / "REVIEW_STATE_DISPOSITIONS_2026-09-01.md"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    records = []

    brochure = load(AUDIT / "jamb_brochure_source_rules_2026-08-19.json")
    for row in brochure.get("rows", []):
        resolution = row.get("resolution")
        if resolution == "resolved_from_source_variants":
            disposition = "source_variant_resolved"
        elif resolution == "multiple_source_variants_preserved":
            disposition = "multiple_source_variants_preserved_for_university_specific_display"
        else:
            disposition = "no_source_candidate_explicitly_preserved"
        records.append({
            "queue": "jamb_brochure_source_rules",
            "record": f"{row.get('jamb_name')}::{row.get('layer')}",
            "observed_state": row.get("catalogue_state"),
            "observed_resolution": resolution,
            "disposition": disposition,
            "source_evidence": "source_variants with PDF file/page/table-row locators are retained in the source-rule artifact",
            "publish_policy": "Use resolved text or show preserved institution-specific variants; never merge conflicting variants silently.",
        })

    domain_defs = load(AUDIT / "_domain_defs_table.json")
    for row in domain_defs:
        if len(row) < 4 or row[3] != "PARTIAL":
            continue
        records.append({
            "queue": "domain_definition_coverage",
            "record": row[0],
            "observed_state": "partial",
            "disposition": "intentional_partial_source_definition",
            "source_evidence": "supplied domain-definition library record",
            "publish_policy": "Expose only the source-backed detail recorded for the domain; do not fill missing fields from inference.",
        })

    cluster_map = load(AUDIT / "cluster_map.json")
    for cluster, rows in cluster_map.items():
        for row in rows:
            if row.get("coverage") != "PARTIAL":
                continue
            records.append({
                "queue": "domain_cluster_coverage",
                "record": row.get("domain_id"),
                "cluster": cluster,
                "observed_state": "partial",
                "disposition": "intentional_partial_source_definition",
                "source_evidence": "supplied domain-definition library cluster record",
                "publish_policy": "Retain the partial marker and show only supported detail.",
            })

    context = load(AUDIT / "nigerian_context_coverage.json")
    for row in context.get("gaps", {}).get("subgroups_without_actual_local_enrichment", []):
        records.append({
            "queue": "nigerian_subgroup_context",
            "record": row.get("id"),
            "label": row.get("label"),
            "observed_state": row.get("local_counterpart_status"),
            "disposition": "explicit_no_direct_nigerian_subgroup_counterpart",
            "source_evidence": "checked Nigerian source availability is retained on the gap record",
            "publish_policy": "Show the global/ISCO subgroup identity and domain/role Nigerian context separately; do not invent a Nigerian subgroup title or claim direct local demand.",
        })
    for row in context.get("gaps", {}).get("roles_without_actual_local_enrichment", []):
        records.append({
            "queue": "nigerian_role_context",
            "record": row.get("id"),
            "label": row.get("label"),
            "observed_state": row.get("local_counterpart_status"),
            "disposition": "explicit_no_direct_nigerian_role_counterpart",
            "source_evidence": "checked Nigerian source availability is retained on the gap record",
            "publish_policy": "Do not convert global role evidence into a Nigerian demand or qualification claim.",
        })

    ledger = load(ROOT / "nigerian_entity_review_ledger_2026-08-25.json")
    for row in ledger.get("rows", []):
        state = row.get("local_item_evidence_status")
        if state != "not_established":
            continue
        review_status = row.get("review_status")
        if review_status == "nigerian_context_only":
            disposition = "nigerian_context_only_no_item_level_counterpart"
        elif review_status == "reviewed_global_only_no_direct_local_counterpart":
            disposition = "global_only_no_direct_nigerian_counterpart"
        else:
            disposition = "reviewed_no_item_level_nigerian_evidence"
        records.append({
            "queue": "nigerian_entity_review_ledger",
            "record": row.get("entity_id"),
            "entity_type": row.get("entity_type"),
            "label": row.get("name"),
            "observed_state": state,
            "review_status": review_status,
            "disposition": disposition,
            "source_evidence": "row is review_complete and preserves checked local/global source IDs and limitations",
            "publish_policy": "Keep the limitation explicit; do not imply local item-level evidence where none was found.",
            "follow_up_required": bool(row.get("follow_up_required")),
        })

    wef = load(AUDIT / "wef_role_normalization_2026-09-01.json")
    for row in wef.get("labels", []):
        if row.get("disposition"):
            records.append({
                "queue": "wef_role_normalization",
                "record": row.get("wef_label"),
                "observed_state": row.get("match_status"),
                "disposition": row.get("disposition"),
                "source_evidence": "WEF 2025 label and category are preserved in the normalization artifact",
                "publish_policy": "Only unique canonical matches attach to roles; ambiguous/unmatched labels remain WEF signals and create no role or programme link.",
            })

    fresh = load(ROOT / "nigerian_fresh_web_enrichment_2026-08-26.json")
    for profile in fresh.get("profiles", []):
        for item_type in ("certifications", "regulatory_requirements"):
            for item in profile.get(item_type, []) or []:
                if item.get("level") == "not_established" or item.get("priority") == "not_established":
                    records.append({
                        "queue": "nigerian_fresh_web_enrichment",
                        "record": f"{profile.get('id')}::{item_type}::{item.get('name')}",
                        "observed_state": "not_established",
                        "disposition": "explicit_unavailable_nigerian_requirement_evidence",
                        "source_evidence": item.get("evidence"),
                        "publish_policy": "Show the absence as an evidence limitation; do not invent a Nigerian certificate or licence.",
                    })

    counts = Counter(row["disposition"] for row in records)
    out = {
        "schema_version": "2026-09-01.review-state-dispositions.v1",
        "purpose": "Make every inventoried review-state token explicit as resolved, intentionally partial, source-variant-preserved, unavailable, or a bounded no-counterpart state without inventing evidence.",
        "source_boundary": "A disposition is not the same as Nigerian market demand, licensure, programme qualification, or a complete source taxonomy.",
        "summary": {
            "records_dispositioned": len(records),
            "disposition_counts": dict(counts),
            "follow_up_required_records": sum(bool(row.get("follow_up_required")) for row in records),
        },
        "records": records,
    }
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Review-state dispositions — 2026-09-01",
        "",
        "Every record in this artifact has an explicit treatment. A no-counterpart or unavailable state is not converted into a Nigerian claim; it is shown with its limitation and publish policy.",
        "",
        f"- Records dispositioned: **{len(records)}**.",
        f"- Records still marked for follow-up by their source ledger: **{out['summary']['follow_up_required_records']}**.",
        "",
        "| Disposition | Count |",
        "|---|---:|",
    ]
    for key, value in sorted(counts.items()):
        lines.append(f"| `{key}` | {value} |")
    lines += [
        "",
        "## Reproducibility",
        "",
        "```text",
        "python data/career-mapping/_audit_review_state_dispositions.py",
        "```",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
