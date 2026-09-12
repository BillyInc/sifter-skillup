#!/usr/bin/env python3
"""Build source-backed computational subgroup and cross-subgroup mappings.

The role library is the source of role titles and evidence. This script only
adds product-facing subgroup labels and derives subgroup skills/tools from the
existing ESCO/O*NET evidence; it does not invent occupation titles or claims of
Nigerian demand.
"""

import json
import os
from collections import Counter

from _role_overlay_loader import load_overlay_roles
from _role_tools_loader import load_role_tools

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = os.path.join(HERE, "computational_layer_manifest.json")
ROLES = os.path.join(HERE, "role_library_v3_cleaned.json")
LAYERS = os.path.join(HERE, "emerging_group_layers.json")
LINKS = os.path.join(HERE, "computational_role_subgroup_links.json")
METHOD_EVIDENCE = os.path.join(HERE, "computational_method_evidence.json")
ESCO_SKILLS = os.path.join(os.path.dirname(os.path.dirname(HERE)), "docs", "esco_occupations_skills.json")
CASEVO_LEARNING_SOURCE = os.path.join(
    os.path.dirname(os.path.dirname(HERE)),
    "src", "data", "tracks", "starknet_ecosystem", "builder", "builderLessons.ts",
)


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def dump(path, value):
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=1, allow_nan=False)
        handle.write("\n")


def norm(value):
    return " ".join(str(value or "").lower().split())


def exact_skills(group_roles, role_tools):
    counts = Counter()
    for role in group_roles:
        key = f"{role['domain_id']}|{role['role_name']}"
        source = role_tools.get(key) or {}
        esco = source.get("esco") or {}
        values = list(esco.get("essential_skills") or [])
        if not values:
            values = [part.strip() for part in str(role.get("essential_skills") or "").split("|")]
        for value in values:
            if norm(value) and norm(value) != "nan":
                counts[str(value).strip()] += 1
    return [value for value, _ in counts.most_common(10)]


def exact_tools(group_roles, role_tools):
    counts = Counter()
    for role in group_roles:
        key = f"{role['domain_id']}|{role['role_name']}"
        for item in (role_tools.get(key) or {}).get("tools") or []:
            value = str(item.get("tool") or "").strip()
            if value:
                counts[value] += 1
    return [value for value, _ in counts.most_common(10)]


def source_evidence(role, role_tools):
    key = role.get("role_key") or f"{role.get('domain_id')}|{role.get('role_name')}"
    source = role_tools.get(key) or {}
    esco = source.get("esco") or {}
    values = set(norm(x) for x in (esco.get("essential_skills") or []))
    values.update(norm(x) for x in (esco.get("optional_skills") or []))
    values.update(norm(x) for x in str(role.get("essential_skills") or "").split("|"))
    values.update(norm(x) for x in str(role.get("optional_skills") or "").split("|"))
    return values


def load_esco_skill_catalog():
    if not os.path.exists(ESCO_SKILLS):
        return {}
    payload = load(ESCO_SKILLS)
    return {
        norm(item.get("preferred_label")): item
        for item in payload.get("skills") or []
        if norm(item.get("preferred_label"))
    }


def repository_learning_evidence(requested):
    """Return learning-only evidence without promoting it into career data."""
    if norm(requested) != "casevo" or not os.path.exists(CASEVO_LEARNING_SOURCE):
        return []
    with open(CASEVO_LEARNING_SOURCE, encoding="utf-8") as handle:
        lines = [str(index + 1) for index, line in enumerate(handle) if "casevo" in line.lower()]
    return [{"path": os.path.relpath(CASEVO_LEARNING_SOURCE, os.path.dirname(os.path.dirname(HERE))), "lines": lines}]


def main():
    manifest = load(MANIFEST)
    roles = load(ROLES)
    roles.extend(load_overlay_roles())
    role_tools = load_role_tools()
    layers = load(LAYERS)
    esco_skill_catalog = load_esco_skill_catalog()
    layers.setdefault("schema_version", 1)
    layers.setdefault("domains", {})
    existing = {
        (str(item.get("domain_id")), str(item.get("isco_submajor"))): item
        for item in layers.get("subgroups") or []
    }

    built = []
    for group in manifest.get("groups") or []:
        domain_id = str(group["domain_id"])
        subgroup = str(group["isco_submajor"])
        group_roles = [
            role for role in roles
            if role.get("domain_id") == domain_id
            and str(role.get("isco_group") or "")[:2] == subgroup
        ]
        if not group_roles:
            raise SystemExit(f"No source-backed roles found for {domain_id}/{subgroup}")
        item = dict(existing.get((domain_id, subgroup)) or {})
        item.update({
            "domain_id": domain_id,
            "isco_submajor": subgroup,
            "source": "global_esco",
            "source_ids": group.get("source_ids") or ["global_esco", "global_onet"],
            "skills": exact_skills(group_roles, role_tools),
            "tools": exact_tools(group_roles, role_tools),
        })
        existing[(domain_id, subgroup)] = item
        built.append({"domain_id": domain_id, "isco_submajor": subgroup, "role_count": len(group_roles)})

    method_records = []
    role_index = {
        f"{role.get('domain_id')}|{role.get('role_name')}": role
        for role in roles
    }
    for method in manifest.get("method_evidence") or []:
        method_name = str(method.get("name") or "").strip()
        catalog_item = esco_skill_catalog.get(norm(method_name))
        if not catalog_item:
            raise SystemExit(f"Requested source skill is not in ESCO catalog: {method_name}")
        evidence_roles = []
        for role_key in method.get("evidence_roles") or []:
            role = role_index.get(role_key)
            if not role:
                raise SystemExit(f"Method evidence role is missing: {role_key}")
            if norm(method_name) not in source_evidence(role, role_tools):
                raise SystemExit(f"Method evidence missing for {role_key}: {method_name}")
            evidence_roles.append(role_key)
        for target in method.get("targets") or []:
            key = (str(target.get("domain_id")), str(target.get("isco_submajor")))
            layer = existing.get(key)
            if not layer:
                raise SystemExit(f"Method target subgroup is missing: {key[0]}/{key[1]}")
            if method_name not in layer.setdefault("skills", []):
                layer["skills"].append(method_name)
            method_records.append({
                "name": method_name,
                "domain_id": key[0],
                "isco_submajor": key[1],
                "skill_type": catalog_item.get("skill_type") or "unspecified",
                "esco_id": catalog_item.get("esco_id"),
                "description": catalog_item.get("description"),
                "evidence_roles": evidence_roles,
                "source": "global_esco",
                "data_state": "source_backed",
            })

    requested_status = []
    all_role_evidence = {
        key: source_evidence(role, role_tools)
        for key, role in role_index.items()
    }
    for requested in manifest.get("requested_method_audit") or []:
        key = norm(requested)
        role_matches = sorted(role_key for role_key, evidence in all_role_evidence.items() if key in evidence)
        learning_evidence = repository_learning_evidence(requested)
        requested_status.append({
            "requested": requested,
            "esco_skill": esco_skill_catalog.get(key, {}).get("esco_id"),
            "skill_type": esco_skill_catalog.get(key, {}).get("skill_type"),
            "mapped_role_count": len(role_matches),
            "mapped_roles": role_matches,
            "repository_learning_evidence": learning_evidence,
            "status": (
                "source_backed" if role_matches
                else ("learning_content_only" if learning_evidence else "not_mapped")
            ),
        })

    layers["subgroups"] = sorted(existing.values(), key=lambda item: (str(item.get("domain_id")), str(item.get("isco_submajor"))))

    role_index = {
        f"{role['domain_id']}|{role['role_name']}": role for role in roles
    }
    links = []
    for link in manifest.get("related_role_links") or []:
        role_key = link["role_key"]
        role = role_index.get(role_key)
        if not role:
            raise SystemExit(f"Related computational role is missing: {role_key}")
        evidence = source_evidence(role, role_tools)
        missing = [skill for skill in link.get("evidence_skills") or [] if norm(skill) not in evidence]
        if missing:
            raise SystemExit(f"Evidence missing for {role_key}: {', '.join(missing)}")
        links.append({
            "role_key": role_key,
            "domain_id": role["domain_id"],
            "subgroup_isco_submajor": str(link["subgroup_isco_submajor"]),
            "relationship": link.get("relationship") or "related",
            "evidence_skills": link.get("evidence_skills") or [],
            "source_provenance": {
                "sources": ["global_esco", "global_onet"],
                "evidence_limit": "Related method mapping only; the role keeps its primary source occupational subgroup.",
            },
        })

    dump(LAYERS, layers)
    dump(LINKS, {"schema_version": 1, "links": links})
    dump(METHOD_EVIDENCE, {
        "schema_version": 1,
        "source": "global_esco",
        "methods": method_records,
        "requested_method_audit": requested_status,
        "interpretation": {
            "knowledge_vs_competence": "ESCO labels social network analysis and game theory as knowledge. They must not be presented as demonstrated user competence; role evidence says the occupation uses or requires the knowledge.",
            "tools_vs_competence": "Python libraries are recorded as source-backed tools where named. Tool association does not prove that every role has proficiency in the library.",
            "learning_content_vs_career_evidence": "CASEVO is mentioned in the SkillUp Starknet learning curriculum as an optional grant-proposal framework. It is not a Career Intelligence role competency or source-backed method mapping.",
        },
    })
    print(json.dumps({"groups_built": built, "related_role_links": len(links), "method_records": len(method_records), "requested_method_audit": requested_status}, indent=2))


if __name__ == "__main__":
    main()
