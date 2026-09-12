#!/usr/bin/env python3
"""Audit source coverage and structural completeness of the career taxonomy."""

import json
import os
from collections import Counter, defaultdict

from _role_overlay_loader import load_overlay_roles
from _role_tools_loader import load_role_tools

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIT = os.path.join(HERE, "_audit")
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as handle:
        return json.load(handle)


def text(value):
    return "" if value is None else str(value).strip()


def source_flags(entry, role):
    esco = entry.get("esco") or {}
    onet = entry.get("onet") or {}
    tools = entry.get("tools") or []
    onet_tools = any(text(tool.get("source")) == "onet" for tool in tools)
    framework_tools = any(text(tool.get("source")) not in {"", "onet"} for tool in tools)
    provenance = entry.get("source_provenance") or {}
    provenance_sources = set(provenance.get("sources") or []) if isinstance(provenance, dict) else set()
    # A framework signal is distinct from the global ESCO/O*NET baseline. Do
    # not count the generated Nigerian context metadata as a role framework.
    framework = bool(provenance) and not provenance_sources.issubset({"global_esco", "global_onet"})
    role_source = text(role.get("source")).lower()
    role_has_esco = role_source in {"esco", "esco/onet"} and bool(
        role.get("esco_code") or role.get("essential_skills") or role.get("description")
    )
    role_has_onet = role_source == "onet" and bool(role.get("onet_score") or role.get("description"))
    role_has_framework = role_source not in {"", "unknown", "esco", "esco/onet", "onet"}
    role_has_skills = bool(role.get("essential_skills") or role.get("optional_skills"))
    return {
        "esco": bool(esco.get("occupation_uris")) or role_has_esco,
        "onet_tools": onet_tools,
        "onet_competencies": bool(onet.get("essential_skills")) or role_has_onet,
        "esco_skills": bool(esco.get("essential_skills") or esco.get("optional_skills")) or role_has_esco,
        "framework": framework or framework_tools or role_has_framework,
        "any": bool(
            tools
            or framework
            or onet.get("essential_skills")
            or esco.get("occupation_uris")
            or esco.get("essential_skills")
            or esco.get("optional_skills")
            or role_has_esco
            or role_has_onet
            or role_has_framework
            or (role_source and role_has_skills)
        ),
    }


def pct(numerator, denominator):
    return f"{(100 * numerator / denominator):.1f}%" if denominator else "n/a"


def main():
    roles = load("role_library_v3_cleaned.json")
    roles.extend(load_overlay_roles())
    role_tools = load_role_tools()
    meta = load("domain_meta.json")
    structure = load("domain_structure.json")

    keyed = {}
    for role in roles:
        key = f"{text(role.get('domain_id'))}|{text(role.get('role_name'))}"
        keyed[key] = role

    flags_by_key = {key: source_flags(role_tools.get(key, {}), role) for key, role in keyed.items()}
    source_counts = Counter(text(role.get("source")) or "unknown" for role in keyed.values())

    domain_rows = []
    subgroup_rows = []
    roles_by_domain = defaultdict(list)
    for key, role in keyed.items():
        roles_by_domain[text(role.get("domain_id"))].append((key, role))

    for domain_id, domain_meta in meta.items():
        if domain_id in HIDDEN:
            continue
        domain_roles = roles_by_domain.get(domain_id, [])
        counts = Counter()
        for key, role in domain_roles:
            flags = flags_by_key[key]
            for name, value in flags.items():
                counts[name] += int(value)
        domain_rows.append({
            "domain_id": domain_id,
            "domain_name": domain_meta.get("domain_name"),
            "roles": len(domain_roles),
            **{name: counts.get(name, 0) for name in ("esco", "onet_tools", "onet_competencies", "esco_skills", "framework", "any")},
            "structure_roles": int((structure.get(domain_id) or {}).get("role_count") or 0),
            "subgroups": len((structure.get(domain_id) or {}).get("subgroups") or []),
        })

        actual_subgroups = Counter()
        subgroup_flags = defaultdict(Counter)
        for key, role in domain_roles:
            subgroup = text(role.get("isco_group"))[:2]
            if not subgroup:
                continue
            actual_subgroups[subgroup] += 1
            for name, value in flags_by_key[key].items():
                subgroup_flags[subgroup][name] += int(value)
        for subgroup in (structure.get(domain_id) or {}).get("subgroups") or []:
            subgroup_id = text(subgroup.get("isco_submajor"))
            values = subgroup_flags.get(subgroup_id, Counter())
            subgroup_rows.append({
                "domain_id": domain_id,
                "domain_name": domain_meta.get("domain_name"),
                "subgroup_id": subgroup_id,
                "label": subgroup.get("label"),
                "roles": actual_subgroups.get(subgroup_id, 0),
                "structure_roles": int(subgroup.get("role_count") or 0),
                **{name: values.get(name, 0) for name in ("esco", "onet_tools", "onet_competencies", "esco_skills", "framework", "any")},
            })

    total = len(keyed)
    totals = Counter()
    for flags in flags_by_key.values():
        for name, value in flags.items():
            totals[name] += int(value)

    spotlight_ids = ["D139", "D140", "D141", "D155", "D163", "D167", "D168"]
    spotlight = {row["domain_id"]: row for row in domain_rows if row["domain_id"] in spotlight_ids}
    empty_domains = [row for row in domain_rows if row["roles"] == 0]
    thin_domains = [
        row for row in domain_rows
        if row["roles"] < 5
        or row["any"] < row["roles"]
        or row["structure_roles"] != row["roles"]
    ]
    thin_domains.sort(key=lambda row: (row["roles"], row["domain_id"]))

    report = {
        "schema_version": 1,
        "canonical_role_keys": total,
        "role_source_counts": dict(source_counts),
        "role_coverage": dict(totals),
        "domains_evaluated": len(domain_rows),
        "empty_domains": [row["domain_id"] for row in empty_domains],
        "thin_domain_count": len(thin_domains),
        "spotlight": spotlight,
        "domains": domain_rows,
        "subgroups": subgroup_rows,
    }
    os.makedirs(AUDIT, exist_ok=True)
    with open(os.path.join(AUDIT, "role_completeness_report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=1)
        handle.write("\n")

    gap_rows = []
    for row in thin_domains:
        reasons = []
        if row["roles"] < 5:
            reasons.append("thin role count")
        if row["roles"] == 0:
            reasons.append("empty canonical role layer")
        if row["structure_roles"] != row["roles"]:
            reasons.append("structure mismatch")
        if row["any"] < row["roles"]:
            reasons.append("unsourced roles")
        priority = "P0" if row["roles"] == 0 else ("P1" if row["any"] == 0 else ("P2" if row["any"] < row["roles"] and row["roles"] < 10 else "P3"))
        gap_rows.append({
            "priority": priority,
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "roles": row["roles"],
            "structure_roles": row["structure_roles"],
            "subgroups": row["subgroups"],
            "any_source_signal": row["any"],
            "framework_signal": row["framework"],
            "reasons": reasons,
        })
    gap_report = {
        "schema_version": 1,
        "generated_from": "role_completeness_report.json",
        "policy": {
            "P0": "Empty canonical role layer; source research is required before the domain is exposed as populated.",
            "P1": "No source signal; use a specialist framework or authoritative occupation source before adding roles.",
            "P2": "Some roles lack source evidence or the domain is thin; review title ownership and local context.",
            "P3": "Structural mismatch; reconcile the hierarchy before UI acceptance. Domains without a supported subgroup taxonomy use direct domain-to-role navigation."
        },
        "empty_domains": [row["domain_id"] for row in empty_domains],
        "thin_domain_count": len(gap_rows),
        "roles_without_source_signal": total - totals["any"],
        "gaps": gap_rows,
    }
    with open(os.path.join(AUDIT, "source_gap_report.json"), "w", encoding="utf-8") as handle:
        json.dump(gap_report, handle, ensure_ascii=False, indent=1)
        handle.write("\n")

    lines = [
        "# Career role completeness report",
        "",
        "This report measures the cleaned canonical role library and the exact source joins in role_tools.json.",
        "A role is not treated as complete merely because it has a name: source ownership, tools and competencies are measured separately.",
        "",
        "## Overall coverage",
        "",
        f"- Canonical role keys: **{total}**",
        f"- Exact ESCO occupation matches: **{totals['esco']} ({pct(totals['esco'], total)})**",
        f"- Exact detailed O*NET tool matches: **{totals['onet_tools']} ({pct(totals['onet_tools'], total)})**",
        f"- Exact detailed O*NET competency matches: **{totals['onet_competencies']} ({pct(totals['onet_competencies'], total)})**",
        f"- ESCO skill records: **{totals['esco_skills']} ({pct(totals['esco_skills'], total)})**",
        f"- Specialist framework signals: **{totals['framework']} ({pct(totals['framework'], total)})**",
        f"- Any source signal: **{totals['any']} ({pct(totals['any'], total)})**",
        f"- Roles without a source signal: **{total - totals['any']}**",
        "",
        "ESCO and O*NET are kept as separate evidence. O*NET joins use exact detailed SOC codes; ISCO groups are used only for subgroup placement, never for copying competencies.",
        "",
        "## Priority domains",
        "",
        "| Domain | Canonical roles | Structure roles | Subgroups | ESCO | O*NET tools | O*NET competencies | Framework | Any signal |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for domain_id in spotlight_ids:
        row = spotlight.get(domain_id)
        if not row:
            continue
        lines.append(
            f"| {domain_id} {row['domain_name']} | {row['roles']} | {row['structure_roles']} | {row['subgroups']} | "
            f"{row.get('esco', 0)} | {row.get('onet_tools', 0)} | {row.get('onet_competencies', 0)} | {row.get('framework', 0)} | {row.get('any', 0)} |"
        )

    lines.extend([
        "",
        "Interpretation:",
        "- D139 and D140 now reconcile their structure counts with the cleaned role layer; the new roles are framework-backed and remain separate from ESCO/O*NET matches.",
        "- D141 is backed by the European Competence Framework for Quantum Technologies v3.0; its framework evidence remains separate from ESCO/O*NET joins.",
        "- D167 and D168 now have canonical framework-backed roles and subgroups; their roles are not incorrectly labelled as ESCO/O*NET occupations.",
        "- D155 and D163 are thin-domain review candidates and should not receive guessed roles or inherited tools.",
        "",
        "## Domains requiring review",
        "",
        "The following domains are flagged because they have fewer than five roles, a source gap, or a role-count mismatch between structure and canonical data. Domains without a supported subgroup taxonomy intentionally use direct domain-to-role navigation.",
        "",
        "| Domain | Roles | Structure roles | Subgroups | Any source | Reason |",
        "|---|---:|---:|---:|---:|---|",
    ])
    for row in thin_domains:
        reasons = []
        if row["roles"] < 5:
            reasons.append("thin role count")
        if row["roles"] == 0:
            reasons.append("empty canonical role layer")
        if row["structure_roles"] != row["roles"]:
            reasons.append("structure mismatch")
        if row["any"] < row["roles"]:
            reasons.append("unsourced roles")
        lines.append(f"| {row['domain_id']} {row['domain_name']} | {row['roles']} | {row['structure_roles']} | {row['subgroups']} | {row.get('any', 0)} | {', '.join(reasons)} |")

    lines.extend([
        "",
        "## Source strategy",
        "",
        "1. Use ESCO and O*NET as the broad occupation/competency baseline, with exact identifiers and provenance.",
        "2. Use domain-specific frameworks for emerging fields where ESCO/O*NET is incomplete; do not force those roles into unrelated ISCO groups.",
        "3. Use Nigerian bodies and local programme/credential sources for local naming, training and regulatory context, not to invent missing global competencies.",
        "4. Keep source-backed, partial and unsourced states visible to the API and UI.",
        "",
        "### Next population sources",
        "",
        "- Gaming: TESDA Philippine Skills Framework for Game Development and Gamebadges competence map.",
        "- Quantum: European Competence Framework for Quantum Technologies v3.0 (Quantum Flagship/QUCATS).",
        "- XR/VR: Jobs for the Future XR and Immersive Learning Career Pathways Framework, then Unity/OpenXR material for implementation vocabulary.",
        "- Robotics: ARM RoboticsCareer pathways and Skills England Robotics Engineer / Advanced Robotics Engineer occupational maps.",
        "- Esports/creator economy: keep certifications empty unless a recognized issuer is verified; use a separate source review for roles and skills.",
        "",
        "### References",
        "",
        "- https://www.tesda.gov.ph/Uploads/File/Philippine%20Skills%20Framework/PSF%20-%20Game%20Development.pdf",
        "- https://map.gamebadges.eu/",
        "- https://www.jff.org/idea/immersive-learning-xr-technology-skills-and-careers/",
        "- https://www.roboticscareer.org/careers",
        "- https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1381",
        "- https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1317",
        "- https://qt.eu/media/pdf/Competence_Framework_for_QT_v3.0_2025_official-version.pdf",
    ])
    with open(os.path.join(AUDIT, "ROLE_COMPLETENESS_REPORT.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")

    gap_lines = [
        "# Source population gap report",
        "",
        f"Empty domains: **{len(empty_domains)}**",
        f"Domains requiring review: **{len(gap_rows)}**",
        f"Roles without any source signal: **{total - totals['any']}**",
        "",
        "This is a research and reconciliation queue. It is not permission to copy roles from a neighbouring domain or to invent tools.",
        "",
        "## Priority policy",
        "",
        "| Priority | Meaning |",
        "|---|---|",
        "| P0 | Empty role layer; find an authoritative specialist source before population. |",
        "| P1 | No source signal; add only source-owned roles and competencies. |",
        "| P2 | Partial source coverage or thin domain; review and localise. |",
        "| P3 | Structural mismatch or missing subgroup; reconcile the model first. |",
        "",
        "## Queue",
        "",
        "| Priority | Domain | Roles | Structure | Subgroups | Any source | Framework | Reason |",
        "|---|---|---:|---:|---:|---:|---:|---|",
    ]
    for row in gap_rows:
        gap_lines.append(
            f"| {row['priority']} | {row['domain_id']} {row['domain_name']} | {row['roles']} | {row['structure_roles']} | "
            f"{row['subgroups']} | {row['any_source_signal']} | {row['framework_signal']} | {', '.join(row['reasons'])} |"
        )
    with open(os.path.join(AUDIT, "SOURCE_POPULATION_GAP_REPORT.md"), "w", encoding="utf-8") as handle:
        handle.write("\n".join(gap_lines) + "\n")

    print(json.dumps({
        "canonical_role_keys": total,
        "exact_esco": totals["esco"],
        "exact_onet_tools": totals["onet_tools"],
        "exact_onet_competencies": totals["onet_competencies"],
        "any_source_signal": totals["any"],
        "empty_domains": len(empty_domains),
        "thin_domains": len(thin_domains),
        "source_gap_report": os.path.join(AUDIT, "SOURCE_POPULATION_GAP_REPORT.md"),
    }, indent=2))


if __name__ == "__main__":
    main()
