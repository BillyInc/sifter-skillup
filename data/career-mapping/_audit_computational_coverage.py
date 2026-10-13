#!/usr/bin/env python3
"""Audit computational/quantitative taxonomy coverage.

This report separates named computational domains from domains that merely
use a digital tool occasionally. It checks declared subgroup records and
explicit, evidence-backed role links. ISCO subgroup membership is never used
to infer that a role fits a computational specialization or its parent domain.
"""

import json
import os
from collections import Counter

from _role_tools_loader import load_role_tools

HERE = os.path.dirname(os.path.abspath(__file__))

COMPUTATIONAL_DOMAINS = [
    "D001", "D002", "D003", "D004", "D005", "D006", "D007", "D008",
    "D009", "D010", "D011", "D012", "D014", "D026", "D027", "D041",
    "D050", "D056", "D057", "D063", "D072", "D078", "D138", "D139",
    "D140", "D141", "D142", "D143", "D144", "D147", "D155", "D156",
    "D145", "D164", "D166", "D167",
]

# Existing source-backed groups that predate the additive manifest. Keeping
# this list explicit makes the audit independent of the generated output.
INHERITED_GROUPS = [
    ("D001", "25"), ("D002", "25"), ("D003", "25"),
    ("D004", "12"), ("D004", "25"), ("D005", "25"), ("D005", "35"),
    ("D006", "21"), ("D006", "25"), ("D009", "21"),
    ("D010", "21"), ("D011", "21"), ("D012", "25"), ("D012", "33"),
    ("D014", "21"), ("D041", "21"), ("D056", "25"), ("D063", "26"),
    ("D078", "21"), ("D078", "26"), ("D140", "21"), ("D140", "31"),
    ("D141", "21"), ("D141", "24"), ("D141", "25"), ("D141", "31"),
    ("D142", "21"), ("D144", "21"), ("D145", "21"), ("D167", "21"), ("D167", "24"),
    ("D167", "25"), ("D167", "35"),
]


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as handle:
        return json.load(handle)


def dump(name, value):
    with open(os.path.join(HERE, "_audit", name), "w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2, allow_nan=False)
        handle.write("\n")


def norm(value):
    return " ".join(str(value or "").lower().split())


def main():
    meta = load("domain_meta.json")
    structure = load("domain_structure.json")
    layers = load("emerging_group_layers.json")
    roles = load("role_library_v3_cleaned.json")
    overlays = load("emerging_role_overlays.json").get("roles") or []
    role_tools = load_role_tools()
    manifest = load("computational_layer_manifest.json")
    links = load("computational_role_subgroup_links.json").get("links") or []
    residual_resolution = load("_audit/computational_residual_resolution_2026_10_06.json")

    # Mirror the career seed's last-write-wins source merge and respect explicit
    # domain-context exclusions; an excluded mapping remains in source audit
    # history but is not student-facing computational coverage.
    by_role_key = {}
    for role in roles + overlays:
        by_role_key[f"{role.get('domain_id')}|{role.get('role_name')}"] = role
    all_roles = [
        role for role in by_role_key.values()
        if str(role.get("student_path_status") or "active").casefold() != "excluded"
    ]
    roles_by_domain = {}
    for role in all_roles:
        roles_by_domain.setdefault(role.get("domain_id"), []).append(role)
    layer_by_group = {
        (str(row.get("domain_id")), str(row.get("isco_submajor"))): row
        for row in layers.get("subgroups") or []
    }
    manifest_groups = {
        (str(row.get("domain_id")), str(row.get("isco_submajor")))
        for row in manifest.get("groups") or []
    }
    # Only explicitly curated manifest groups are treated as computational
    # specialization claims. Historical ISCO-derived pairs remain visible as
    # an audit queue, but are not promoted to domain-owned groups or role links.
    required_groups = manifest_groups

    missing_groups = []
    group_rows = []
    for domain_id, subgroup in sorted(required_groups):
        explicit_links = [
            link for link in links
            if link.get("domain_id") == domain_id
            and str(link.get("subgroup_isco_submajor") or "") == subgroup
        ]
        linked_roles = [
            role for role in all_roles
            if f"{role.get('domain_id')}|{role.get('role_name')}" in {link.get("role_key") for link in explicit_links}
        ]
        layer = layer_by_group.get((domain_id, subgroup))
        if not layer:
            missing_groups.append(f"{domain_id}/{subgroup}")
        source_role_count = 0
        source_backed_role_count = 0
        esco_role_count = 0
        onet_role_count = 0
        tool_role_count = 0
        competency_role_count = 0
        for role in linked_roles:
            key = f"{role.get('domain_id')}|{role.get('role_name')}"
            evidence = role_tools.get(key) or {}
            esco = evidence.get("esco") or {}
            onet = evidence.get("onet") or {}
            if evidence.get("source") or esco.get("occupation_uris") or onet.get("essential_skills"):
                source_role_count += 1
            if evidence.get("data_state") == "source_backed":
                source_backed_role_count += 1
            if esco.get("occupation_uris"):
                esco_role_count += 1
            if onet.get("occupation_codes"):
                onet_role_count += 1
            if evidence.get("tools"):
                tool_role_count += 1
            if onet.get("essential_skills"):
                competency_role_count += 1
        group_rows.append({
            "domain_id": domain_id,
            "domain_name": (meta.get(domain_id) or {}).get("domain_name"),
            "legacy_subgroup_key": subgroup,
            "label": (layer or {}).get("label"),
            "explicit_method_link_role_count": len(linked_roles),
            "role_fit_source": "computational_role_subgroup_links.json; no ISCO-derived membership inference",
            "roles_with_source_evidence": source_role_count,
            "roles_source_backed": source_backed_role_count,
            "roles_with_esco": esco_role_count,
            "roles_with_onet": onet_role_count,
            "roles_with_source_tools": tool_role_count,
            "roles_with_onet_competencies": competency_role_count,
            "group_skills": len((layer or {}).get("skills") or []),
            "group_tools": len((layer or {}).get("tools") or []),
            "source_ids": (layer or {}).get("source_ids") or [],
        })

    domain_rows = []
    for domain_id in COMPUTATIONAL_DOMAINS:
        domain_roles = roles_by_domain.get(domain_id, [])
        source_roles = []
        for role in domain_roles:
            key = f"{role.get('domain_id')}|{role.get('role_name')}"
            evidence = role_tools.get(key) or {}
            esco = evidence.get("esco") or {}
            onet = evidence.get("onet") or {}
            source_roles.append({
                "role": role.get("role_name"),
                "source_backed": evidence.get("data_state") == "source_backed",
                "esco": bool(esco.get("occupation_uris")),
                "onet": bool(onet.get("occupation_codes")),
                "competencies": bool(onet.get("essential_skills")),
                "tools": bool(evidence.get("tools")),
            })
        domain_rows.append({
            "domain_id": domain_id,
            "domain_name": (meta.get(domain_id) or {}).get("domain_name"),
            "role_count": len(domain_roles),
            "subgroup_count": len((structure.get(domain_id) or {}).get("subgroups") or []),
            "roles_with_esco": sum(row["esco"] for row in source_roles),
            "roles_source_backed": sum(row["source_backed"] for row in source_roles),
            "roles_with_onet": sum(row["onet"] for row in source_roles),
            "roles_with_competencies": sum(row["competencies"] for row in source_roles),
            "roles_with_tools": sum(row["tools"] for row in source_roles),
            "related_computational_role_links": sum(
                1 for link in links if link.get("domain_id") == domain_id
            ),
        })

    # The role-link evidence must be present in the source-backed role record.
    invalid_links = []
    for link in links:
        role = next((r for r in all_roles if f"{r.get('domain_id')}|{r.get('role_name')}" == link.get("role_key")), None)
        evidence = role_tools.get(link.get("role_key"), {}) if role else {}
        esco = evidence.get("esco") or {}
        available = {norm(item) for item in (esco.get("essential_skills") or [])}
        available.update(norm(item) for item in (esco.get("optional_skills") or []))
        missing = [skill for skill in link.get("evidence_skills") or [] if norm(skill) not in available]
        if not role or missing:
            invalid_links.append({"role_key": link.get("role_key"), "missing_evidence": missing})

    residual_by_group = {
        str(row.get("group_key")): row
        for row in residual_resolution.get("method_group_dispositions", [])
        if row.get("group_key")
    }
    for row in group_rows:
        group_key = f"{row['domain_id']}|{row['legacy_subgroup_key']}"
        disposition = residual_by_group.get(group_key)
        row["reviewed_no_link_disposition"] = (
            disposition.get("exact_disposition")
            if disposition and row["explicit_method_link_role_count"] == 0
            else None
        )
        row["no_link_reason"] = disposition.get("reason") if row["reviewed_no_link_disposition"] else None
        row["no_link_next_gate"] = disposition.get("next_gate") if row["reviewed_no_link_disposition"] else None
    groups_without_link = [row for row in group_rows if row["explicit_method_link_role_count"] == 0]
    reviewed_no_link_groups = [row for row in groups_without_link if row["reviewed_no_link_disposition"]]

    report = {
        "schema_version": 1,
        "scope": {
            "computational_domains": COMPUTATIONAL_DOMAINS,
            "declared_manifest_groups": len(required_groups),
            "manifest_groups": len(manifest_groups),
            "historical_isco_pairs_not_treated_as_specializations": len(INHERITED_GROUPS),
        },
        "summary": {
            "domains": len(domain_rows),
            "groups": len(group_rows),
            "groups_missing_source_layer": len(missing_groups),
            "groups_without_explicit_role_method_link": len(groups_without_link),
            "groups_without_role_link_with_reviewed_no_link_disposition": len(reviewed_no_link_groups),
            "groups_without_role_link_missing_disposition": len(groups_without_link) - len(reviewed_no_link_groups),
            "unmatched_local_role_titles_pending_review": len(residual_resolution.get("unmatched_exact_titles", [])),
            "roles": sum(row["role_count"] for row in domain_rows),
            "roles_with_esco": sum(row["roles_with_esco"] for row in domain_rows),
            "roles_source_backed": sum(row["roles_source_backed"] for row in domain_rows),
            "roles_with_onet": sum(row["roles_with_onet"] for row in domain_rows),
            "roles_with_competencies": sum(row["roles_with_competencies"] for row in domain_rows),
            "roles_with_tools": sum(row["roles_with_tools"] for row in domain_rows),
            "related_role_links": len(links),
            "missing_groups": len(missing_groups),
            "invalid_role_links": len(invalid_links),
        },
        "domains": domain_rows,
        "groups": group_rows,
        "computational_residual_resolution": {
            "source": "computational_residual_resolution_2026_10_06.json",
            "no_link_group_dispositions": residual_resolution.get("method_group_dispositions", []),
            "unmatched_local_role_titles": residual_resolution.get("unmatched_exact_titles", []),
            "canonical_taxonomy_written": residual_resolution.get("canonical_taxonomy_written"),
        },
        "missing_groups": missing_groups,
        "invalid_role_links": invalid_links,
    }
    dump("computational_coverage_report.json", report)

    lines = [
        "# Computational Coverage Audit",
        "",
        "This audit covers declared computational/quantitative domains and method groups. It reports evidence coverage, not universal job requirements or academic sign-off. A role appears in a subgroup only through an explicit context-specific link; ISCO membership is not used to infer that link or parent-domain fit.",
        "",
        "## Summary",
        "",
        f"- Domains: **{report['summary']['domains']}**",
        f"- Declared computational subgroup records: **{report['summary']['groups']}**",
        f"- Groups missing their source layer: **{report['summary']['groups_missing_source_layer']}**",
        f"- Groups without an explicit role-method link (raw count): **{report['summary']['groups_without_explicit_role_method_link']}**",
        f"- Of those, groups explicitly reviewed as ‘do not add or infer a role link’: **{report['summary']['groups_without_role_link_with_reviewed_no_link_disposition']}**",
        f"- Groups without a role link and without a recorded disposition: **{report['summary']['groups_without_role_link_missing_disposition']}**",
        f"- Unmatched local role titles retained for independent role review: **{report['summary']['unmatched_local_role_titles_pending_review']}**",
        f"- Role records in scope: **{report['summary']['roles']}**",
        f"- Roles with ESCO occupation evidence: **{report['summary']['roles_with_esco']}**",
        f"- Roles marked source-backed (ESCO/O*NET/framework evidence): **{report['summary']['roles_source_backed']}**",
        f"- Roles with O*NET occupation evidence: **{report['summary']['roles_with_onet']}**",
        f"- Roles with O*NET competency evidence: **{report['summary']['roles_with_competencies']}**",
        f"- Roles with source-backed tools: **{report['summary']['roles_with_tools']}**",
        f"- Explicit cross-subgroup method links: **{report['summary']['related_role_links']}**",
        f"- Missing subgroup layers: **{report['summary']['missing_groups']}**",
        f"- Invalid role-link evidence records: **{report['summary']['invalid_role_links']}**",
        "",
        "## Sociology decision",
        "",
        "The D078 group is labelled `Computational and Quantitative Social Research`. Role-to-domain fit remains independently audited. Only roles named in `computational_role_subgroup_links.json` receive explicit method links, each based on listed task-skill evidence; no `computational sociologist` occupation title is invented. The methods are optional and question-dependent, not universal requirements.",
        "",
        "## Domain coverage",
        "",
        "| Domain | Role records present (fit not implied) | Current subgroup records | Source-backed records | ESCO | O*NET | Competencies | Tools | Explicit method links |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for row in domain_rows:
        lines.append(
            f"| {row['domain_id']} {row['domain_name']} | {row['role_count']} | {row['subgroup_count']} | {row['roles_source_backed']} | {row['roles_with_esco']} | {row['roles_with_onet']} | {row['roles_with_competencies']} | {row['roles_with_tools']} | {row['related_computational_role_links']} |"
        )
    if missing_groups:
        lines.extend(["", "## Missing groups", ""] + [f"- `{item}`" for item in missing_groups])
    if invalid_links:
        lines.extend(["", "## Invalid related-role evidence", ""] + [f"- `{item['role_key']}`: {', '.join(item['missing_evidence'])}" for item in invalid_links])
    lines.extend([
        "",
        "A domain can still have computationally enabled roles outside this declared scope. Those are retained in their existing domain role records and are not relabelled as computational domains merely because they use a digital tool.",
        "",
    ])
    with open(os.path.join(HERE, "_audit", "COMPUTATIONAL_COVERAGE_REPORT.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    print(json.dumps(report["summary"], indent=2))


if __name__ == "__main__":
    main()
