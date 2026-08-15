#!/usr/bin/env python3
"""Reconcile structure counts and subgroups for source-backed overlays."""

import json
import os
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROLE_LIBRARY = os.path.join(HERE, "role_library_v3_cleaned.json")
OVERLAY = os.path.join(HERE, "emerging_role_overlays.json")
GROUP_LAYERS = os.path.join(HERE, "emerging_group_layers.json")
STRUCTURE = os.path.join(HERE, "domain_structure.json")
DOMAIN_TOOLS = os.path.join(HERE, "domain_tools.json")
COMPUTATIONAL_MANIFEST = os.path.join(HERE, "computational_layer_manifest.json")

SUBGROUP_LABELS = {
    ("D140", "21"): ("Robotics Engineering & Automation", "Design and develop robotic, automation and control systems."),
    ("D140", "31"): ("Robotics Technicians & Precision Systems", "Maintain, test and support robotic and precision systems."),
    ("D141", "21"): ("Quantum Hardware & Sensing", "Build and operate quantum hardware, sensors and control systems."),
    ("D141", "24"): ("Quantum Applications, Policy & Standards", "Translate quantum technology into applications, policy and responsible use."),
    ("D141", "25"): ("Quantum Software & Algorithms", "Build quantum software, algorithms and error-correction methods."),
    ("D141", "31"): ("Quantum Technology Operations", "Operate, maintain and calibrate quantum technology equipment."),
    ("D070", "26"): ("Performers & Creative Directors", "Create, rehearse and lead artistic work for live performance."),
    ("D070", "34"): ("Stage & Production Crew", "Coordinate and operate the technical and production systems behind live shows."),
    ("D167", "35"): ("XR Technical Support Specialists", "Help people use immersive hardware and software reliably."),
    ("D167", "24"): ("XR Innovation & Solution Architecture", "Translate needs into workable immersive technology solutions."),
    ("D168", "12"): ("Esports Operations & Management", "Coordinate the business and operational side of esports."),
    ("D168", "24"): ("Esports Community & Partnerships", "Grow audiences, communities and commercial relationships."),
    ("D168", "26"): ("Esports Broadcast & Content Production", "Create and deliver esports broadcast and editorial content."),
    ("D168", "33"): ("Esports Team & Player Management", "Support teams and players through organised competition."),
    ("D168", "34"): ("Competitive Performance & Analysis", "Develop performance, coaching and fair competition."),
    ("D009", "21"): ("Applied Statistics & Computational Modelling", "Use mathematics, statistics and research design to turn data into evidence."),
    ("D010", "21"): ("Statistics & Computational Modelling", "Analyse organisational data, model patterns and support better decisions."),
    ("D011", "21"): ("Quantitative Finance & Statistical Modelling", "Use mathematics, statistics and data to understand financial risk and markets."),
    ("D014", "21"): ("Actuarial & Quantitative Modelling", "Use probability, statistics and modelling to understand uncertainty and risk."),
    ("D041", "21"): ("Quantitative & Experimental Science", "Combine scientific investigation with measurement, modelling and research data."),
    ("D063", "26"): ("Economic Research & Quantitative Policy", "Use economic evidence, statistics and models to explain markets and policy choices."),
    ("D078", "21"): ("Quantitative & Computational Methods", "Use data, statistics and computation to study people, populations and society."),
    ("D078", "26"): ("Social & Economic Research", "Study social behaviour, institutions and economic life through structured research."),
    ("D142", "21"): ("Computational Biology & Bioinformatics", "Use programming, data and life-science methods to study biological systems."),
    ("D001", "25"): ("Software Development & Systems Engineering", "Build, test and maintain software systems and applications."),
    ("D002", "25"): ("Data Platform & Pipeline Engineering", "Build reliable systems that collect, organise and move data."),
    ("D003", "25"): ("Machine Learning & Computational Intelligence", "Build computational models that learn from data and support decisions."),
    ("D004", "25"): ("Cyber Defence & Security Engineering", "Protect systems, investigate incidents and test security controls."),
    ("D004", "12"): ("Cybersecurity Leadership & Governance", "Set security direction, manage risk and coordinate protective work."),
    ("D005", "25"): ("Cloud Infrastructure & DevOps", "Design, deploy and automate reliable cloud systems."),
    ("D005", "35"): ("Cloud Technical Support", "Keep cloud services working and help resolve technical issues."),
    ("D006", "25"): ("IoT Software & Systems", "Connect software, devices and data into working IoT systems."),
    ("D006", "21"): ("IoT Engineering & Sensing", "Design the engineering and sensing systems behind connected devices."),
    ("D012", "25"): ("FinTech Software & Systems", "Build secure software and data systems for financial services."),
    ("D012", "33"): ("FinTech Operations & Products", "Support the systems, processes and products that deliver financial services."),
    ("D056", "25"): ("Blockchain Software & Protocols", "Build and maintain distributed-ledger software, protocols and applications."),
    ("D144", "21"): ("Climate Modelling & Atmospheric Science", "Use observations, statistics and models to understand climate and weather."),
}


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def dump(path, value):
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=1)
        handle.write("\n")


def text(value):
    return "" if value is None else str(value).strip()


def skill_values(value):
    if isinstance(value, list):
        return [text(item) for item in value if text(item)]
    return [part.strip() for part in text(value).split("|") if part.strip()]


def norm(value):
    return " ".join(text(value).lower().split())


def main():
    base_roles = load(ROLE_LIBRARY)
    overlay = load(OVERLAY)
    computational_manifest = load(COMPUTATIONAL_MANIFEST) if os.path.exists(COMPUTATIONAL_MANIFEST) else {}
    computational_labels = {
        (text(group.get("domain_id")), text(group.get("isco_submajor"))): (
            text(group.get("label")), text(group.get("description"))
        )
        for group in computational_manifest.get("groups") or []
        if text(group.get("domain_id")) and text(group.get("isco_submajor"))
    }
    labels = {**SUBGROUP_LABELS, **computational_labels}
    group_layers = load(GROUP_LAYERS) if os.path.exists(GROUP_LAYERS) else {"domains": {}, "subgroups": []}
    structure = load(STRUCTURE)
    overlay_roles = overlay.get("roles") or []
    changed_domains = sorted(
        {text(role.get("domain_id")) for role in overlay_roles if text(role.get("domain_id"))}
        | {text(domain_id) for domain_id in (group_layers.get("domains") or {}) if text(domain_id)}
        | {text(layer.get("domain_id")) for layer in group_layers.get("subgroups") or [] if text(layer.get("domain_id"))}
    )
    all_roles = base_roles + overlay_roles

    roles_by_domain = defaultdict(list)
    for role in all_roles:
        domain_id = text(role.get("domain_id"))
        if domain_id in changed_domains:
            roles_by_domain[domain_id].append(role)

    for domain_id in changed_domains:
        domain = structure.setdefault(domain_id, {})
        existing = {text(item.get("isco_submajor")): item for item in domain.get("subgroups") or []}
        counts = Counter(text(role.get("isco_group"))[:2] for role in roles_by_domain[domain_id] if text(role.get("isco_group")))
        for subgroup_id, count in counts.items():
            if subgroup_id not in existing:
                label, description = labels.get(
                    (domain_id, subgroup_id),
                    (f"{domain.get('domain_name', domain_id)} {subgroup_id}", "Source-backed activities within this domain."),
                )
                item = {
                    "isco_submajor": subgroup_id,
                    "label": label,
                    "role_count": count,
                    "cluster_skills": [],
                    "description": description,
                    "raw_isco_label": "Source-backed occupational grouping",
                }
                domain.setdefault("subgroups", []).append(item)
                existing[subgroup_id] = item
            elif (domain_id, subgroup_id) in labels:
                existing[subgroup_id]["label"] = labels[(domain_id, subgroup_id)][0]
                existing[subgroup_id]["description"] = labels[(domain_id, subgroup_id)][1]
            existing[subgroup_id]["role_count"] = count

        domain["subgroups"] = sorted(domain.get("subgroups") or [], key=lambda item: text(item.get("isco_submajor")))
        domain["has_subgroups"] = bool(domain["subgroups"])
        domain["role_count"] = len(roles_by_domain[domain_id])

        # Add source-backed overlay skills to the existing field-level list while
        # preserving the existing structure-owned skills and their weights.
        current = {text(item.get("skill")).lower(): item for item in domain.get("foundation_skills") or [] if text(item.get("skill"))}
        skill_counts = Counter()
        for role in roles_by_domain[domain_id]:
            for skill in skill_values(role.get("essential_skills")):
                skill_counts[skill.lower()] += 1
        total = len(roles_by_domain[domain_id]) or 1
        for skill_key, count in skill_counts.items():
            if skill_key not in current:
                current[skill_key] = {"skill": skill_key, "prevalence": round(count / total, 4), "n": count}
        domain["foundation_skills"] = sorted(current.values(), key=lambda item: (-float(item.get("prevalence") or 0), text(item.get("skill")).lower()))[:30]

    # Add subgroup-owned source-backed skills without inheriting role skills.
    for layer in group_layers.get("subgroups") or []:
        domain_id = text(layer.get("domain_id"))
        subgroup_id = text(layer.get("isco_submajor"))
        subgroup = next(
            (item for item in (structure.get(domain_id, {}).get("subgroups") or []) if text(item.get("isco_submajor")) == subgroup_id),
            None,
        )
        if not subgroup:
            continue
        existing_skills = {norm(skill) for skill in subgroup.get("cluster_skills") or []}
        for skill in layer.get("skills") or []:
            if norm(skill) and norm(skill) not in existing_skills:
                subgroup.setdefault("cluster_skills", []).append(skill)
                existing_skills.add(norm(skill))
        subgroup["source_provenance"] = {
            "source": layer.get("source"),
            "sources": layer.get("source_ids") or [layer.get("source")],
            "ownership": "subgroup",
            "nigerian_context": {
                "source_ids": [source for source in layer.get("source_ids") or [] if str(source).startswith("ng_")],
                "evidence_limit": "Local context and terminology only; not role-level Nigerian demand, salary or licensing proof.",
                "salary": "excluded",
            },
        }

    dump(STRUCTURE, structure)

    # Domain and subgroup tools are owned at those levels. These rows are not
    # copied from roles; the overlay supplies the source-backed ownership.
    domain_tools = load(DOMAIN_TOOLS)
    layers_by_domain = group_layers.get("domains") or {}
    for domain_id, layer in layers_by_domain.items():
        domain = domain_tools.setdefault(domain_id, {})
        domain.setdefault("distinctive_tools", [])
        domain.setdefault("common_tools", [])
        existing = {norm(item.get("tool")) for group in ("distinctive_tools", "common_tools") for item in domain.get(group, [])}
        for tool in layer.get("tools") or []:
            name = text(tool)
            if not name or norm(name) in existing:
                continue
            domain["distinctive_tools"].append({
                "tool": name,
                "role_freq": None,
                "score": None,
                "hot": False,
                "in_demand": False,
                "domain_spread": None,
                "group": "distinctive",
                "source": layer.get("source"),
                "source_confidence": "medium",
                "data_state": "source_backed",
                "provenance": {
                    "source": layer.get("source"),
                    "sources": layer.get("source_ids") or [layer.get("source")],
                    "ownership": "domain",
                    "nigerian_context": {
                        "source_ids": [source for source in layer.get("source_ids") or [] if str(source).startswith("ng_")],
                        "evidence_limit": "Local context and terminology only; not role-level Nigerian demand, salary or licensing proof.",
                        "salary": "excluded",
                    },
                },
            })
            existing.add(norm(name))
    for layer in group_layers.get("subgroups") or []:
        domain_id = text(layer.get("domain_id"))
        subgroup_id = text(layer.get("isco_submajor"))
        domain = domain_tools.setdefault(domain_id, {})
        subgroup_tools = domain.setdefault("subgroup_tools", {}).setdefault(subgroup_id, {"distinctive": [], "common": []})
        existing = {norm(item.get("tool")) for group in ("distinctive", "common") for item in subgroup_tools.get(group, [])}
        for tool in layer.get("tools") or []:
            name = text(tool)
            if not name or norm(name) in existing:
                continue
            subgroup_tools["distinctive"].append({
                "tool": name,
                "role_freq": None,
                "score": None,
                "hot": False,
                "in_demand": False,
                "domain_spread": None,
                "group": "distinctive",
                "source": layer.get("source"),
                "source_confidence": "medium",
                "data_state": "source_backed",
                "provenance": {"source": layer.get("source"), "ownership": "subgroup"},
            })
            existing.add(norm(name))
    dump(DOMAIN_TOOLS, domain_tools)
    print(json.dumps({
        "domains_updated": changed_domains,
        "overlay_roles": len(overlay_roles),
        "role_counts": {domain_id: len(roles_by_domain[domain_id]) for domain_id in changed_domains},
        "subgroup_counts": {domain_id: len(structure.get(domain_id, {}).get("subgroups") or []) for domain_id in changed_domains},
    }, indent=2))


if __name__ == "__main__":
    main()
