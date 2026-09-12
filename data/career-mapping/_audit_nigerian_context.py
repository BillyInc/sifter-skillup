#!/usr/bin/env python3
"""Audit local overlays separately from generic Nigerian provenance."""

import json
import os
import re
from collections import Counter, defaultdict

from _role_tools_loader import load_role_tools

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIT = os.path.join(HERE, "_audit")
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}
ENRICHMENT_KEYS = ("role_names", "skills", "tools", "competencies", "certifications", "regulatory_requirements")


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as handle:
        return json.load(handle)


def context_is_valid(context):
    if not isinstance(context, dict):
        return False
    return (
        bool(context.get("source_ids"))
        and bool(context.get("source_summaries"))
        and context.get("salary") == "excluded"
        and context.get("demand") == "not_claimed"
        and context.get("licensing") == "not_claimed"
    )


def normalized(value):
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def enrichment_count(context, key="actual_enrichment"):
    value = context.get(key) or {}
    return sum(len(value.get(name) or []) for name in ENRICHMENT_KEYS)


def enrichment_has_duplicate_names(context, key="actual_enrichment"):
    value = context.get(key) or {}
    for category in ENRICHMENT_KEYS:
        names = [normalized(item.get("name")) for item in value.get(category) or [] if isinstance(item, dict)]
        if len(names) != len(set(names)):
            return True
    return False


def enrichment_items_have_evidence(context, key="actual_enrichment"):
    value = context.get(key) or {}
    for category in ENRICHMENT_KEYS:
        for item in value.get(category) or []:
            if not isinstance(item, dict) or not item.get("name") or not item.get("source_ids"):
                return False
            if not item.get("evidence") and not item.get("evidence_sources"):
                return False
    return True


def summarize_entity(entity, *, entity_id, label=None):
    context = entity.get("nigerian_context") or {}
    actual = enrichment_count(context)
    global_count = enrichment_count(context, "global_enrichment")
    return {
        "id": entity_id,
        "label": label,
        "context_valid": context_is_valid(context),
        "actual_enrichment_items": actual,
        "global_enrichment_items": global_count,
        "local_counterpart_status": context.get("local_counterpart_status"),
        "has_local_enrichment": actual > 0,
        "has_global_enrichment": global_count > 0,
        "duplicate_actual_names": enrichment_has_duplicate_names(context),
        "actual_items_have_evidence": enrichment_items_have_evidence(context),
        "source_availability": context.get("source_availability") or {},
    }


def main():
    provenance = load("domain_skill_provenance.json")
    role_tools = load_role_tools()
    meta = load("domain_meta.json")

    visible_domains = {domain_id for domain_id in provenance if domain_id not in HIDDEN}
    domain_rows = []
    subgroup_rows = []
    for domain_id in sorted(visible_domains):
        domain = provenance[domain_id]
        domain_rows.append(summarize_entity(domain, entity_id=domain_id, label=domain.get("domain_name")))
        for subgroup_id, subgroup in (domain.get("subgroups") or {}).items():
            subgroup = subgroup if isinstance(subgroup, dict) else {}
            subgroup_rows.append(summarize_entity(
                subgroup,
                entity_id=f"{domain_id}|{subgroup_id}",
                label=subgroup.get("label"),
            ))

    role_rows = []
    for role_key, role in role_tools.items():
        if "|" not in role_key or not isinstance(role, dict):
            continue
        domain_id = role_key.split("|", 1)[0]
        if domain_id in HIDDEN:
            continue
        role_rows.append(summarize_entity(role, entity_id=role_key))

    all_rows = domain_rows + subgroup_rows + role_rows
    availability = Counter()
    for row in all_rows:
        for source_id, status in row["source_availability"].items():
            availability[f"{source_id}:{status}"] += 1

    status_by_domain = defaultdict(Counter)
    for row in role_rows:
        domain_id = row["id"].split("|", 1)[0]
        status_by_domain[domain_id][row["local_counterpart_status"] or "unknown"] += 1

    invalid = [row for row in all_rows if not row["context_valid"] or row["duplicate_actual_names"] or not row["actual_items_have_evidence"]]
    no_local_domains = [row for row in domain_rows if not row["has_local_enrichment"]]
    no_local_subgroups = [row for row in subgroup_rows if not row["has_local_enrichment"]]
    no_local_roles = [row for row in role_rows if not row["has_local_enrichment"]]

    report = {
        "schema_version": 2,
        "policy": {
            "meaning": "Nigerian context combines broad source provenance with actual local professional overlays only where evidence was checked.",
            "global_separation": "Global frameworks are stored under global_enrichment and are never counted as Nigerian enrichment.",
            "not_claimed": ["salary", "role-level demand", "automatic licensing eligibility"],
            "missing_counterpart": "no_direct_local_counterpart is an audited gap, not an invented title.",
            "hidden_domains_excluded": sorted(HIDDEN),
        },
        "coverage": {
            "visible_domains": len(domain_rows),
            "domains_with_valid_context": sum(row["context_valid"] for row in domain_rows),
            "domains_with_actual_local_enrichment": sum(row["has_local_enrichment"] for row in domain_rows),
            "domains_with_global_enrichment": sum(row["has_global_enrichment"] for row in domain_rows),
            "subgroups": len(subgroup_rows),
            "subgroups_with_valid_context": sum(row["context_valid"] for row in subgroup_rows),
            "subgroups_with_actual_local_enrichment": sum(row["has_local_enrichment"] for row in subgroup_rows),
            "subgroups_with_global_enrichment": sum(row["has_global_enrichment"] for row in subgroup_rows),
            "role_context_entries": len(role_rows),
            "roles_with_valid_context": sum(row["context_valid"] for row in role_rows),
            "roles_with_actual_local_enrichment": sum(row["has_local_enrichment"] for row in role_rows),
            "roles_with_global_enrichment": sum(row["has_global_enrichment"] for row in role_rows),
            "roles_with_no_local_enrichment": len(no_local_roles),
        },
        "source_availability_counts": dict(sorted(availability.items())),
        "role_status_by_domain": {domain_id: dict(sorted(counts.items())) for domain_id, counts in sorted(status_by_domain.items())},
        "gaps": {
            "domains_without_actual_local_enrichment": no_local_domains,
            "subgroups_without_actual_local_enrichment": no_local_subgroups,
            "roles_without_actual_local_enrichment": no_local_roles,
        },
        "invalid": invalid,
        "source_registry_domains": len(meta),
    }

    os.makedirs(AUDIT, exist_ok=True)
    with open(os.path.join(AUDIT, "nigerian_context_coverage.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=1)
        handle.write("\n")

    coverage = report["coverage"]
    lines = [
        "# Nigerian and global professional enrichment coverage",
        "",
        "This audit separates broad Nigerian provenance from actual local professional overlays and global framework enrichment.",
        "A local gap is reported rather than filled with an invented Nigerian counterpart.",
        "",
        "## Coverage",
        "",
        f"- Visible domains with valid context: **{coverage['domains_with_valid_context']}/{coverage['visible_domains']}**",
        f"- Domains with actual local enrichment: **{coverage['domains_with_actual_local_enrichment']}/{coverage['visible_domains']}**",
        f"- Domains with global enrichment: **{coverage['domains_with_global_enrichment']}/{coverage['visible_domains']}**",
        f"- Subgroups with valid context: **{coverage['subgroups_with_valid_context']}/{coverage['subgroups']}**",
        f"- Subgroups with actual local enrichment: **{coverage['subgroups_with_actual_local_enrichment']}/{coverage['subgroups']}**",
        f"- Role context entries with valid context: **{coverage['roles_with_valid_context']}/{coverage['role_context_entries']}**",
        f"- Roles with actual local enrichment: **{coverage['roles_with_actual_local_enrichment']}/{coverage['role_context_entries']}**",
        f"- Roles with global enrichment: **{coverage['roles_with_global_enrichment']}/{coverage['role_context_entries']}**",
        f"- Roles without actual local enrichment: **{coverage['roles_with_no_local_enrichment']}**",
        "",
        "## Interpretation",
        "",
        "Actual local enrichment means the entity has at least one source-backed local skill, tool, competency, credential, regulation or role title. Generic registry context is not counted.",
        "Global CFA, GARP and RICS records are intentionally stored separately and cannot satisfy the Nigerian enrichment count.",
        "`source_backed_role_family` means the canonical role matched a documented local role family. It is not an assertion that the exact canonical title is a regulated Nigerian title.",
        "`no_direct_local_counterpart` is a review queue. It must not be filled by copying a global title or by inventing a local credential.",
        "",
        "## Source availability",
        "",
        "| Source and status | Entity references |",
        "|---|---:|",
    ]
    for key, count in sorted(availability.items()):
        lines.append(f"| {key} | {count} |")
    lines.extend([
        "",
        f"Invalid records: {len(invalid)}. Any invalid record is a data-pipeline failure.",
        "",
        "The gaps listed in `nigerian_context_coverage.json` are the authoritative queue for the next source review.",
        "",
    ])
    with open(os.path.join(AUDIT, "NIGERIAN_CONTEXT_COVERAGE_REPORT.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))

    print(json.dumps(report["coverage"], indent=2))
    if invalid:
        raise SystemExit("Nigerian/global enrichment audit has invalid records")


if __name__ == "__main__":
    main()
