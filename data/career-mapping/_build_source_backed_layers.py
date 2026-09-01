#!/usr/bin/env python3
"""Annotate domain/subgroup tools and publish layer-level provenance.

This pass does not inherit a role's tools or certifications into a domain or
subgroup. It only annotates existing domain-owned/subgroup-owned rows with
their source metadata and records which source-backed role evidence supports
the existing skill lists.
"""

import csv
import json
import math
import os
import re
from collections import Counter, defaultdict

from _nigerian_context import resolved_nigerian_context
from _role_overlay_loader import load_overlay_roles

HERE = os.path.dirname(os.path.abspath(__file__))
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}
MEDICAL_TOOLS = {"epic systems", "meditech software"}
TOOL_SOURCE = os.path.join(HERE, "_source_extracts", "onet_31_0", "Software Skills.txt")
DOMAIN_TOOLS = os.path.join(HERE, "domain_tools.json")
DOMAIN_META = os.path.join(HERE, "domain_meta.json")
DOMAIN_STRUCTURE = os.path.join(HERE, "domain_structure.json")
DOMAIN_SOURCE_REGISTRY = os.path.join(HERE, "domain_role_source_registry.json")
ROLE_LIBRARY = os.path.join(HERE, "role_library_v3_cleaned.json")
EMERGING_OVERLAY = os.path.join(HERE, "emerging_role_overlays.json")
ROLE_TOOLS = os.path.join(HERE, "role_tools.json")
GROUP_LAYERS = os.path.join(HERE, "emerging_group_layers.json")
REPORT_JSON = os.path.join(HERE, "_audit", "source_backed_layer_report.json")
REPORT_MD = os.path.join(HERE, "_audit", "source_backed_layer_report.md")
SKILL_JSON = os.path.join(HERE, "domain_skill_provenance.json")


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def missing(value):
    return value is None or (isinstance(value, float) and math.isnan(value))


def text(value):
    return "" if missing(value) else str(value).strip()


def norm(value):
    return re.sub(r"[^a-z0-9]+", " ", text(value).lower()).strip()


def skill_values(value):
    if isinstance(value, list):
        return [text(item) for item in value if text(item)]
    return [part.strip() for part in text(value).split("|") if part.strip()]


def health_adjacent(meta):
    value = f"{text(meta.get('domain_name'))} {text(meta.get('cluster'))}".lower()
    return any(word in value for word in (
        "health", "medical", "medicine", "nursing", "pharmacy", "biomedical",
        "radiation", "radiography", "neuroscience", "therapy", "psychology",
        "paramedical", "wellness", "clinical",
    ))


def confidence(sources):
    sources = set(sources)
    if sources == {"esco"} or sources == {"onet"}:
        return "high"
    if sources == {"esco", "onet"}:
        return "high"
    if sources:
        return "medium"
    return "unsourced"


def add_skill_evidence(bucket, skill, source):
    key = norm(skill)
    if not key:
        return
    item = bucket.setdefault(key, {"label": skill, "role_count": 0, "sources": Counter()})
    item["role_count"] += 1
    item["sources"][source] += 1


def finalize_skill_map(bucket):
    output = {}
    for key, item in bucket.items():
        sources = sorted(item["sources"])
        output[key] = {
            "label": item["label"],
            "role_count": item["role_count"],
            "sources": sources,
            "source_confidence": confidence(sources),
            "data_state": "source_backed" if sources else "unsourced",
        }
    return output


def main():
    tools = load(DOMAIN_TOOLS)
    meta = load(DOMAIN_META)
    source_registry = load(DOMAIN_SOURCE_REGISTRY) if os.path.exists(DOMAIN_SOURCE_REGISTRY) else {}
    structure = load(DOMAIN_STRUCTURE)
    roles = load(ROLE_LIBRARY)
    roles.extend(load_overlay_roles())
    role_tools = load(ROLE_TOOLS)
    group_layers = load(GROUP_LAYERS) if os.path.exists(GROUP_LAYERS) else {"domains": {}, "subgroups": []}
    group_layers_by_key = {
        (text(item.get("domain_id")), text(item.get("isco_submajor"))): item
        for item in group_layers.get("subgroups") or []
    }

    # One normalized O*NET tool name can have one or more official categories;
    # retain all categories rather than guessing from the product name.
    onet_categories = defaultdict(list)
    with open(TOOL_SOURCE, encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            name = norm(row.get("Workplace Example"))
            category = text(row.get("Element Name"))
            if not name or not category:
                continue
            value = {"element_name": category, "element_id": text(row.get("Element ID"))}
            if value not in onet_categories[name]:
                onet_categories[name].append(value)

    def annotate(tool, domain_id):
        output = dict(tool)
        categories = onet_categories.get(norm(tool.get("tool")), [])
        if categories:
            output["element_name"] = categories[0]["element_name"]
            output["element_id"] = categories[0]["element_id"] or None
            output["source"] = output.get("source") or "onet"
            output["source_confidence"] = "high"
            output["data_state"] = "source_backed"
            output["provenance"] = {"source": "onet_31_0_software_skills", "element_names": [item["element_name"] for item in categories]}
        elif output.get("source"):
            output["element_name"] = None
            output["element_id"] = None
            output["source_confidence"] = "medium"
            output["data_state"] = "source_backed"
            output["provenance"] = {"source": output.get("source")}
        else:
            output["element_name"] = None
            output["element_id"] = None
            output["source_confidence"] = "unsourced"
            output["data_state"] = "unsourced"
            output["provenance"] = {}
        return output

    removed = []
    annotated_count = 0
    for domain_id, domain in list(tools.items()):
        if domain_id == "_meta" or domain_id in HIDDEN:
            continue

        def keep(tool, scope, subgroup=None):
            name = norm(tool.get("tool"))
            if name in MEDICAL_TOOLS and not health_adjacent(meta.get(domain_id, {})):
                removed.append({"domain": domain_id, "subgroup": subgroup, "scope": scope, "tool": tool.get("tool"), "reason": "health_context_only"})
                return False
            return True

        for group_name in ("distinctive_tools", "common_tools"):
            values = []
            for tool in domain.get(group_name, []):
                if keep(tool, "domain"):
                    values.append(annotate(tool, domain_id))
                    annotated_count += 1
            domain[group_name] = values
        for subgroup, subgroup_tools in (domain.get("subgroup_tools") or {}).items():
            for group_name in ("distinctive", "common"):
                values = []
                for tool in subgroup_tools.get(group_name, []):
                    if keep(tool, "subgroup", str(subgroup)):
                        values.append(annotate(tool, domain_id))
                        annotated_count += 1
                subgroup_tools[group_name] = values

    with open(DOMAIN_TOOLS, "w", encoding="utf-8") as handle:
        json.dump(tools, handle, ensure_ascii=False, indent=1)
        handle.write("\n")

    # Build provenance for the existing domain and subgroup skill layers from
    # exact role ownership. A role's source is evidence; it is not copied into
    # the domain/subgroup payload as if the lower layer owned the record.
    roles_by_domain = defaultdict(list)
    for role in roles:
        roles_by_domain[text(role.get("domain_id"))].append(role)
    skill_provenance = {}
    domain_rows = []
    for domain_id, domain_meta in meta.items():
        if domain_id in HIDDEN:
            continue
        domain_roles = roles_by_domain.get(domain_id, [])
        domain_skill_bucket = {}
        subgroup_buckets = defaultdict(dict)
        counts = Counter()
        for role in domain_roles:
            key = f"{domain_id}|{text(role.get('role_name'))}"
            entry = role_tools.get(key, {})
            esco = entry.get("esco") or {}
            if esco.get("occupation_uris"):
                counts["roles_with_esco"] += 1
            has_onet_tools = any(text(tool.get("source")) == "onet" for tool in entry.get("tools") or [])
            provenance = entry.get("source_provenance") or {}
            provenance_sources = set(provenance.get("sources") or []) if isinstance(provenance, dict) else set()
            # Exact O*NET title joins also carry provenance, but they are not
            # specialist framework overlays. Keep those signals separate.
            has_framework_signal = bool(provenance) and not provenance_sources.issubset({"global_esco", "global_onet"})
            if has_onet_tools:
                counts["roles_with_onet_tools"] += 1
            if has_framework_signal:
                counts["roles_with_framework_signal"] += 1
            onet = entry.get("onet") or {}
            if entry.get("tools") or onet.get("essential_skills") or esco.get("essential_skills") or esco.get("optional_skills") or has_framework_signal:
                counts["roles_with_any_source_signal"] += 1
            # A framework overlay owns the displayed role skill list even when
            # the title also happens to resolve to an ESCO occupation. Keep
            # that provenance distinct from supplemental ESCO/O*NET signals.
            role_source = "framework" if has_framework_signal else ("esco" if esco.get("occupation_uris") else ("onet" if onet.get("essential_skills") or has_onet_tools else "unsourced"))
            for skill in skill_values(role.get("essential_skills")):
                add_skill_evidence(domain_skill_bucket, skill, role_source)
                subgroup = text(role.get("isco_group"))[:2]
                if subgroup:
                    add_skill_evidence(subgroup_buckets[subgroup], skill, role_source)
            for competency in onet.get("essential_skills") or []:
                skill = text(competency.get("element_name"))
                if not skill:
                    continue
                add_skill_evidence(domain_skill_bucket, skill, "onet")
                subgroup = text(role.get("isco_group"))[:2]
                if subgroup:
                    add_skill_evidence(subgroup_buckets[subgroup], skill, "onet")

        direct_domain_layer = (group_layers.get("domains") or {}).get(domain_id) or {}
        for skill in direct_domain_layer.get("skills") or []:
            add_skill_evidence(domain_skill_bucket, skill, direct_domain_layer.get("source") or "framework")
        for subgroup_id, layer in group_layers_by_key.items():
            if subgroup_id[0] != domain_id:
                continue
            for skill in layer.get("skills") or []:
                add_skill_evidence(subgroup_buckets[subgroup_id[1]], skill, layer.get("source") or "framework")
        domain_structure = structure.get(domain_id, {})
        nigerian_context = resolved_nigerian_context(domain_id, domain_meta, source_registry)
        subgroup_rows = {}
        for subgroup in domain_structure.get("subgroups", []):
            subgroup_id = text(subgroup.get("isco_submajor"))
            subgroup_label = subgroup.get("label")
            subgroup_rows[subgroup_id] = {
                "label": subgroup.get("label"),
                "skills": finalize_skill_map(subgroup_buckets.get(subgroup_id, {})),
                "data_state": "source_backed" if subgroup_buckets.get(subgroup_id) else "partial",
                "source_confidence": confidence({source for value in subgroup_buckets.get(subgroup_id, {}).values() for source in value["sources"]}),
                "nigerian_context": resolved_nigerian_context(
                    domain_id,
                    domain_meta,
                    source_registry,
                    scope="subgroup_context",
                    subgroup_label=subgroup_label,
                ),
            }
        layer_sources = {source for value in domain_skill_bucket.values() for source in value["sources"]}
        row = {
            "domain_id": domain_id,
            "domain_name": domain_meta.get("domain_name"),
            "role_count": len(domain_roles),
            "roles_with_esco": counts["roles_with_esco"],
            "roles_with_onet_tools": counts["roles_with_onet_tools"],
            "roles_with_framework_signal": counts["roles_with_framework_signal"],
            "roles_with_any_source_signal": counts["roles_with_any_source_signal"],
            "source_confidence": confidence(layer_sources),
            "data_state": "source_backed" if layer_sources else "partial",
            "foundation_skills": finalize_skill_map(domain_skill_bucket),
            "nigerian_context": nigerian_context,
            "subgroups": subgroup_rows,
        }
        skill_provenance[domain_id] = row
        domain_rows.append(row)

    report = {
        "schema_version": 1,
        "hidden_domains_excluded": sorted(HIDDEN),
        "domains_evaluated": len(domain_rows),
        "tool_rows_annotated": annotated_count,
        "medical_tool_rows_removed": len(removed),
        "removed_medical_tool_rows": removed,
        "roles_keyed": len({f"{r.get('domain_id')}|{r.get('role_name')}" for r in roles}),
        "roles_with_tool_or_skill_signal": sum(1 for value in role_tools.values() if isinstance(value, dict) and (value.get("tools") or value.get("source_provenance") or (value.get("onet") or {}).get("essential_skills") or (value.get("esco") or {}).get("essential_skills") or (value.get("esco") or {}).get("optional_skills"))),
        "roles_with_framework_signal": sum(
            1
            for value in role_tools.values()
            if isinstance(value, dict)
            and isinstance(value.get("source_provenance"), dict)
            and not set(value.get("source_provenance", {}).get("sources") or []).issubset({"global_esco", "global_onet"})
        ),
        "domains": sorted(domain_rows, key=lambda item: item["domain_id"]),
    }
    os.makedirs(os.path.dirname(REPORT_JSON), exist_ok=True)
    with open(REPORT_JSON, "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=1)
        handle.write("\n")
    with open(SKILL_JSON, "w", encoding="utf-8") as handle:
        json.dump(skill_provenance, handle, ensure_ascii=False, indent=1)
        handle.write("\n")

    lines = [
        "# Source-backed career layer report",
        "",
        f"Domains evaluated: **{len(domain_rows)}** (hidden domains excluded: {', '.join(sorted(HIDDEN))})",
        f"Domain/subgroup tool rows annotated: **{annotated_count}**",
        f"Medical-context tool rows removed from non-health domains: **{len(removed)}**",
        f"Roles with any source signal (ESCO, O*NET or specialist framework): **{report['roles_with_tool_or_skill_signal']} / {report['roles_keyed']}**",
        f"Roles with specialist framework provenance: **{report['roles_with_framework_signal']} / {report['roles_keyed']}**",
        "",
        "Role evidence remains role-owned. Domain and subgroup rows are only annotated with provenance and are not populated by copying role tools or certifications.",
        "",
        "## Domain coverage",
        "",
        "| Domain | Roles | ESCO | O*NET tools | Framework | Any signal | State |",
        "|---|---:|---:|---:|---:|---:|---|",
    ]
    for row in sorted(domain_rows, key=lambda item: item["domain_id"]):
        lines.append(f"| {row['domain_id']} {row['domain_name']} | {row['role_count']} | {row['roles_with_esco']} | {row['roles_with_onet_tools']} | {row['roles_with_framework_signal']} | {row['roles_with_any_source_signal']} | {row['data_state']} / {row['source_confidence']} |")
    if removed:
        lines.extend(["", "## Removed medical-context leakage", ""])
        for item in removed:
            lines.append(f"- {item['domain']} {item['scope']} {item['tool']}")
    with open(REPORT_MD, "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines) + "\n")
    print(json.dumps({
        "domains_evaluated": len(domain_rows),
        "tool_rows_annotated": annotated_count,
        "medical_tool_rows_removed": len(removed),
        "roles_with_signal": report["roles_with_tool_or_skill_signal"],
        "roles_with_framework_signal": report["roles_with_framework_signal"],
    }, indent=2))


if __name__ == "__main__":
    main()
