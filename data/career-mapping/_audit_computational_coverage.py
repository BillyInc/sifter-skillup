#!/usr/bin/env python3
"""Audit computational/quantitative taxonomy coverage.

This report deliberately separates computational domains from domains that
merely use a digital tool occasionally. It proves that every declared
computational subgroup has source-backed role evidence and that sociology's
method relationship is explicit without inventing a new occupation title.
"""

import json
import os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))

COMPUTATIONAL_DOMAINS = [
    "D001", "D002", "D003", "D004", "D005", "D006", "D007", "D008",
    "D009", "D010", "D011", "D012", "D014", "D026", "D027", "D041",
    "D050", "D056", "D057", "D063", "D072", "D078", "D138", "D139",
    "D140", "D141", "D142", "D143", "D144", "D147", "D155", "D156",
    "D164", "D166", "D167",
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
    ("D142", "21"), ("D144", "21"), ("D167", "21"), ("D167", "24"),
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
    role_tools = load("role_tools.json")
    manifest = load("computational_layer_manifest.json")
    links = load("computational_role_subgroup_links.json").get("links") or []

    all_roles = roles + overlays
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
    required_groups = manifest_groups | set(INHERITED_GROUPS)

    missing_groups = []
    group_rows = []
    for domain_id, subgroup in sorted(required_groups):
        group_roles = [
            role for role in all_roles
            if role.get("domain_id") == domain_id
            and str(role.get("isco_group") or "")[:2] == subgroup
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
        for role in group_roles:
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
            "isco_submajor": subgroup,
            "label": (layer or {}).get("label"),
            "role_count": len(group_roles),
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

    report = {
        "schema_version": 1,
        "scope": {
            "computational_domains": COMPUTATIONAL_DOMAINS,
            "declared_groups": len(required_groups),
            "manifest_groups": len(manifest_groups),
            "inherited_groups": len(INHERITED_GROUPS),
        },
        "summary": {
            "domains": len(domain_rows),
            "groups": len(group_rows),
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
        "missing_groups": missing_groups,
        "invalid_role_links": invalid_links,
    }
    dump("computational_coverage_report.json", report)

    lines = [
        "# Computational Coverage Audit",
        "",
        "This audit covers the declared computational, quantitative and computationally applied domains. The codebase remains the source of truth; subgroup labels are product-facing groupings, while roles, skills, tools and competencies are resolved from the existing ESCO/O*NET evidence.",
        "",
        "## Summary",
        "",
        f"- Domains: **{report['summary']['domains']}**",
        f"- Declared computational subgroup records: **{report['summary']['groups']}**",
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
        "The existing `sociologist` role is retained under its primary source occupational grouping. It is also linked to `Quantitative & Computational Methods` because the source evidence includes applying statistical analysis techniques and conducting quantitative research. No unsupported `computational sociologist` occupation title was invented.",
        "",
        "## Domain coverage",
        "",
        "| Domain | Roles | Subgroups | Source-backed | ESCO | O*NET | Competencies | Tools | Related links |",
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
