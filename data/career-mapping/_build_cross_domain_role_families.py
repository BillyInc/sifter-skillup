#!/usr/bin/env python3
"""Build source-backed role families that can be explored from more than one domain.

The existing domain_roles table keeps a domain-scoped role row because that is
what the current API and programme scoring use. This artifact adds the missing
cross-domain relationship without copying skills or pretending that a role is
locally in demand. Exact ESCO occupation URIs create the broad family layer;
curated source-backed families in the registry add cases where the role family
is expressed through aliases rather than one ESCO title.
"""

import json
import os
import re
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as handle:
        return json.load(handle)


def text(value):
    return "" if value is None else str(value).strip()


def norm(value):
    return re.sub(r"[^a-z0-9]+", " ", text(value).lower()).strip()


def unique(values):
    result = []
    seen = set()
    for value in values:
        value = text(value)
        key = norm(value)
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(value)
    return result


def alias_values(value):
    if isinstance(value, list):
        return value
    if value is None:
        return []
    return [value] if text(value).lower() != "nan" else []


def resolved_nigerian_context(domain_ids, meta, registry):
    catalog = registry.get("source_catalog") or {}
    source_ids = []
    for domain_id in domain_ids:
        domain = meta.get(domain_id) or {}
        ids = list(registry.get("default_sources") or [])
        ids.extend((registry.get("cluster_sources") or {}).get(domain.get("cluster", ""), []))
        ids.extend((registry.get("domain_overrides") or {}).get(domain_id, []))
        for source_id in ids:
            if source_id not in source_ids and (catalog.get(source_id) or {}).get("region") == "nigeria":
                source_ids.append(source_id)
    return {
        "scope": "domain_context",
        "source_ids": source_ids,
        "evidence_limit": "Local context and terminology only; not role-level Nigerian demand, salary or licensing proof.",
        "salary": "excluded",
    } if source_ids else {}


def family_from_uri(uri, role_keys, role_by_key, meta, registry):
    roles = [role_by_key[key] for key in role_keys]
    domain_ids = sorted({text(role.get("domain_id")) for role in roles if text(role.get("domain_id")) not in HIDDEN})
    if len(domain_ids) < 2:
        return None
    names = Counter(text(role.get("role_name")) for role in roles if text(role.get("role_name")))
    canonical = sorted(names.items(), key=lambda item: (-item[1], len(item[0]), item[0].lower()))[0][0]
    aliases = []
    for role in roles:
        aliases.extend([role.get("role_name"), *alias_values(role.get("also_known_as"))])
    return {
        "family_key": f"esco|{uri}",
        "canonical_name": canonical,
        "primary_domain_key": None,
        "domain_links": [
            {"domain_key": domain_id, "relationship": "shared_taxonomy", "role_keys": sorted(key for key in role_keys if role_by_key[key].get("domain_id") == domain_id)}
            for domain_id in domain_ids
        ],
        "members": sorted((
            {"role_key": key, "domain_key": text(role_by_key[key].get("domain_id")), "match_basis": "exact_esco_occupation_uri"}
            for key in role_keys
            if text(role_by_key[key].get("domain_id")) not in HIDDEN
        ), key=lambda item: item["role_key"]),
        "aliases": unique(aliases),
        "source_confidence": "high",
        "data_state": "source_backed",
        "source_provenance": {
            "sources": ["global_esco"],
            "evidence": "The same exact ESCO occupation URI resolves to role rows in multiple domains.",
            "mapping_method": "exact_esco_occupation_uri",
        },
        "nigerian_context": resolved_nigerian_context(domain_ids, meta, registry),
    }


def main():
    roles = load("role_library_v3_cleaned.json")
    overlay_path = os.path.join(HERE, "emerging_role_overlays.json")
    if os.path.exists(overlay_path):
        roles.extend(load("emerging_role_overlays.json").get("roles") or [])
    role_by_key = {}
    for role in roles:
        domain_id = text(role.get("domain_id"))
        role_name = text(role.get("role_name"))
        if domain_id and role_name and domain_id not in HIDDEN:
            role_by_key[f"{domain_id}|{role_name}"] = role
    role_tools = load("role_tools.json")
    meta = load("domain_meta.json")
    registry = load("domain_role_source_registry.json")

    by_uri = defaultdict(list)
    for role_key in role_by_key:
        for uri in (role_tools.get(role_key, {}).get("esco", {}) or {}).get("occupation_uris") or []:
            if text(uri):
                by_uri[text(uri)].append(role_key)

    families = [
        family
        for uri, role_keys in sorted(by_uri.items())
        if (family := family_from_uri(uri, sorted(set(role_keys)), role_by_key, meta, registry))
    ]

    policy = registry.get("cross_domain_role_policy") or {}
    for family_key, family in (policy.items() if isinstance(policy, dict) else []):
        if family_key in {"canonical_role_rule", "primary_domain_rule"} or not isinstance(family, dict):
            continue
        domain_ids = unique([family.get("primary_domain_id"), *(family.get("secondary_domain_ids") or [])])
        domain_ids = [domain_id for domain_id in domain_ids if domain_id in meta and domain_id not in HIDDEN]
        if len(domain_ids) < 2:
            continue
        aliases = unique(family.get("aliases") or [])
        alias_keys = {norm(alias) for alias in aliases}
        members = []
        for role_key, role in role_by_key.items():
            role_aliases = {norm(role.get("role_name")), *(norm(value) for value in alias_values(role.get("also_known_as")))}
            if role_aliases & alias_keys:
                members.append({"role_key": role_key, "domain_key": text(role.get("domain_id")), "match_basis": "source_role_alias"})
        families.append({
            "family_key": f"registry|{family_key}",
            "canonical_name": family.get("canonical_role_family") or family_key,
            "primary_domain_key": family.get("primary_domain_id"),
            "domain_links": [
                {"domain_key": domain_id, "relationship": "primary" if domain_id == family.get("primary_domain_id") else "secondary", "role_keys": sorted(item["role_key"] for item in members if item["domain_key"] == domain_id)}
                for domain_id in domain_ids
            ],
            "members": sorted(members, key=lambda item: item["role_key"]),
            "aliases": aliases,
            "source_confidence": "medium",
            "data_state": "source_backed",
            "source_provenance": {
                "sources": unique([*(family.get("global_sources") or []), *(family.get("nigeria_sources") or [])]),
                "evidence": family.get("notes"),
                "mapping_method": "registry_role_family_policy",
            },
            "nigerian_context": {
                "scope": "role_family_context",
                "source_ids": [source_id for source_id in family.get("nigeria_sources") or [] if source_id in (registry.get("source_catalog") or {})],
                "evidence_limit": "Local context and terminology only; not role-level Nigerian demand, salary or licensing proof.",
                "salary": "excluded",
            },
        })

    output = {
        "schema_version": 1,
        "purpose": "Canonical cross-domain role families and source-backed domain links.",
        "policy": policy,
        "family_count": len(families),
        "families": families,
    }
    path = os.path.join(HERE, "cross_domain_role_families.json")
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(output, handle, ensure_ascii=False, indent=1)
        handle.write("\n")
    print(json.dumps({
        "families": len(families),
        "members": sum(len(item["members"]) for item in families),
        "registry_families": sum(item["family_key"].startswith("registry|") for item in families),
        "esco_families": sum(item["family_key"].startswith("esco|") for item in families),
        "output": path,
    }, indent=2))


if __name__ == "__main__":
    main()
