#!/usr/bin/env python3
"""Audit source-backed domain and subgroup tool leakage.

The audit compares full detailed O*NET-SOC codes. It also applies the explicit
health-context rule for medical software: O*NET lists those products for many
generic management and accounting occupations because of workplace context,
so they must not become tools of unrelated Sifter domains.
"""

import csv
import json
import os
import re
from collections import defaultdict

from _role_tools_loader import load_role_tools

HERE = os.path.dirname(os.path.abspath(__file__))
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}
MEDICAL_TOOLS = {"epic systems", "meditech software"}
MIN_DOMAIN_ROLES = 5
MIN_SUBGROUP_ROLES = 3
FLOOR_DISTINCTIVE = 3
ONET_SKILLS = os.path.join(HERE, "_source_extracts", "onet_30_3", "Software Skills.txt")


def text(value):
    return "" if value is None else str(value).strip()


def norm(value):
    return re.sub(r"\s+", " ", text(value).lower()).strip()


def soc(value):
    value = text(value).replace(" ", "")
    match = re.fullmatch(r"(\d{2}-\d{4})(?:\.(\d{2}))?", value)
    return f"{match.group(1)}.{match.group(2) or '00'}" if match else ""


def health_adjacent(meta):
    value = f"{text(meta.get('domain_name'))} {text(meta.get('cluster'))}".lower()
    return any(word in value for word in (
        "health", "medical", "medicine", "nursing", "pharmacy", "biomedical",
        "radiation", "radiography", "neuroscience", "therapy", "psychology",
        "paramedical", "wellness", "clinical",
    ))


def main():
    role_tools = load_role_tools()
    domain_tools = json.load(open(os.path.join(HERE, "domain_tools.json"), encoding="utf-8"))
    roles = json.load(open(os.path.join(HERE, "role_library_v3_cleaned.json"), encoding="utf-8"))
    meta = json.load(open(os.path.join(HERE, "domain_meta.json"), encoding="utf-8"))

    tool_socs = defaultdict(set)
    with open(ONET_SKILLS, encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            name = norm(row.get("Workplace Example"))
            code = soc(row.get("O*NET-SOC Code"))
            if name and code:
                tool_socs[name].add(code)

    role_submajor = {}
    for role in roles:
        key = f"{role.get('domain_id')}|{role.get('role_name')}"
        role_submajor[key] = text(role.get("isco_group"))[:2]

    domain_socs = defaultdict(set)
    domain_count = defaultdict(int)
    subgroup_socs = defaultdict(set)
    subgroup_count = defaultdict(int)
    for role_key, entry in role_tools.items():
        if role_key == "_meta":
            continue
        domain_id = role_key.split("|", 1)[0]
        if domain_id in HIDDEN:
            continue
        codes = {soc(code) for code in entry.get("socs", []) if soc(code)}
        if not codes:
            continue
        domain_socs[domain_id].update(codes)
        domain_count[domain_id] += 1
        subgroup = role_submajor.get(role_key)
        if subgroup:
            subgroup_socs[(domain_id, subgroup)].update(codes)
            subgroup_count[(domain_id, subgroup)] += 1

    drops = []
    evaluated_domains = 0
    evaluated_subgroups = 0
    flagged_scopes = 0
    report_rows = []

    def audit_scope(domain_id, subgroup, entries, reference_socs, matched_roles, minimum):
        nonlocal evaluated_domains, evaluated_subgroups, flagged_scopes
        if matched_roles < minimum:
            return
        if subgroup is None:
            evaluated_domains += 1
        else:
            evaluated_subgroups += 1
        scope_name = f"{domain_id}" if subgroup is None else f"{domain_id} subgroup {subgroup}"
        flagged = []
        for tool in entries:
            name = norm(tool.get("tool"))
            if not name:
                continue
            reason = None
            if name in MEDICAL_TOOLS and not health_adjacent(meta.get(domain_id, {})):
                reason = "health_context_only"
            elif tool_socs.get(name) and not (tool_socs[name] & reference_socs):
                reason = "no_exact_detailed_soc_overlap"
            if reason:
                flagged.append((tool.get("tool"), reason))
        if not flagged:
            return
        flagged_scopes += 1
        distinctive_count = len(entries)
        for name, reason in flagged:
            # Context-only medical tools are always removed. Other leakage is
            # floored so a thin domain is never reduced below three tools.
            if reason == "health_context_only" or distinctive_count - sum(1 for item in drops if item["domain"] == domain_id and item.get("isco_submajor") == subgroup) > FLOOR_DISTINCTIVE:
                drops.append({"domain": domain_id, "isco_submajor": subgroup, "scope": "subgroup" if subgroup else "domain", "tool": name, "reason": reason})
        report_rows.append({"scope": scope_name, "matched_roles": matched_roles, "flagged": flagged})

    for domain_id, value in domain_tools.items():
        if domain_id == "_meta" or domain_id in HIDDEN:
            continue
        audit_scope(domain_id, None, value.get("distinctive_tools", []), domain_socs.get(domain_id, set()), domain_count.get(domain_id, 0), MIN_DOMAIN_ROLES)
        for subgroup, subgroup_tools in (value.get("subgroup_tools") or {}).items():
            subgroup = str(subgroup)
            audit_scope(domain_id, subgroup, subgroup_tools.get("distinctive", []), subgroup_socs.get((domain_id, subgroup), set()), subgroup_count.get((domain_id, subgroup), 0), MIN_SUBGROUP_ROLES)

    upstream_report_path = os.path.join(HERE, "_audit", "source_backed_layer_report.json")
    upstream_removed = 0
    if os.path.exists(upstream_report_path):
        upstream_removed = int(json.load(open(upstream_report_path, encoding="utf-8")).get("medical_tool_rows_removed", 0))

    os.makedirs(os.path.join(HERE, "_audit"), exist_ok=True)
    with open(os.path.join(HERE, "_audit", "tools_leakage_drop.json"), "w", encoding="utf-8") as handle:
        json.dump(drops, handle, ensure_ascii=False, indent=1)
        handle.write("\n")

    lines = [
        "# Tools Leakage Audit",
        "",
        "O*NET comparisons use the full detailed O*NET-SOC code. Medical software is additionally restricted to health-adjacent domains because its O*NET rows include workplace-context matches for otherwise generic occupations.",
        "",
        f"**Evaluated domain scopes:** {evaluated_domains}",
        f"**Evaluated subgroup scopes:** {evaluated_subgroups}",
        f"**Flagged scopes:** {flagged_scopes}",
        f"**Dropped after this audit:** {len(drops)}",
        f"**Removed by the source-layer health-context guard before this audit:** {upstream_removed}",
        "",
        f"Hidden domains excluded: {', '.join(sorted(HIDDEN))}.",
        "",
    ]
    for row in sorted(report_rows, key=lambda item: item["scope"]):
        lines.append(f"## {row['scope']} ({row['matched_roles']} exact-SOC roles)")
        for name, reason in row["flagged"]:
            action = "DROP" if any(item["domain"] == row["scope"].split()[0] and item["tool"] == name for item in drops) else "KEEP (floor)"
            lines.append(f"- {action} {name} [{reason}]")
        lines.append("")
    with open(os.path.join(HERE, "_audit", "tools_leakage_report.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))
    print(f"evaluated domain scopes: {evaluated_domains} | subgroup scopes: {evaluated_subgroups} | flagged: {flagged_scopes} | dropped: {len(drops)} | upstream removed: {upstream_removed}")


if __name__ == "__main__":
    main()
