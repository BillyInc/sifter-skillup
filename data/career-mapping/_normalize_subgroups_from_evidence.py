"""Normalize the subgroup display layer from canonical role evidence.

This deliberately does not promote a subgroup to a domain. Promotion requires
an independent domain evidence bundle and is audited separately. Here we only
repair the presentation layer using the approved ISCO/sub-major rule.
"""

from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
STRUCTURE_PATH = ROOT / "domain_structure.json"
ROLE_LIBRARY_PATH = ROOT / "role_library_v3_cleaned.json"
TAXONOMY_PATH = ROOT / "taxonomies" / "esco_isco_groups.json"
REPORT_PATH = ROOT / "_audit" / "subgroup_normalization_2026-08-17.json"
BACKUP_PATH = STRUCTURE_PATH.with_suffix(".json.pre_subgroup_normalization.bak")

# Source-approved direction clusters from the attached definition. D022 is
# intentionally treated as P1 after the independent role audit: its four
# sub-majors represent materially different mining work directions.
P1 = {"D009", "D010", "D022", "D028", "D031", "D034", "D035", "D036", "D042", "D047", "D048", "D052", "D053", "D071", "D107"}
P2 = {"D011", "D013", "D039", "D062", "D064", "D077", "D158"}
P3 = {"D016", "D017", "D018", "D019", "D020", "D021", "D023", "D024"}
PLACEHOLDER_LABEL = re.compile(r"^D\d{3}\s+\d{2}$", re.I)
PLACEHOLDER_DESCRIPTION = {"source-backed activities within this domain.", "source backed activities within this domain."}


def text(value: object) -> str:
    return str(value or "").strip()


def norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text(value).lower()).strip()


def source_names(role: dict) -> set[str]:
    provenance = role.get("source_provenance") or {}
    values = set(provenance.get("sources") or []) if isinstance(provenance, dict) else set()
    source = text(role.get("source")).lower()
    if source in {"esco", "esco/onet"}:
        values.add("global_esco")
    elif source == "onet":
        values.add("global_onet")
    elif source == "wef":
        values.add("global_wef")
    elif source:
        values.add(source.replace(" ", "_"))
    return values


def role_key(role: dict) -> str:
    return f"{role.get('domain_id')}|{role.get('role_name')}"


def load_roles() -> list[dict]:
    roles = json.loads(ROLE_LIBRARY_PATH.read_text(encoding="utf-8"))
    for filename in ("emerging_role_overlays.json", "thin_domain_role_overlays.json"):
        path = ROOT / filename
        if path.exists():
            roles.extend(json.loads(path.read_text(encoding="utf-8")).get("roles") or [])
    by_key = {}
    for role in roles:
        by_key[role_key(role)] = role
    return list(by_key.values())


def skill_list(role: dict) -> list[str]:
    values = role.get("essential_skills") or []
    if isinstance(values, str):
        values = [item.strip() for item in values.split("|")]
    if not isinstance(values, list):
        return []
    return [text(item) for item in values if text(item)]


def choose_skills(existing: list, roles: list[dict], foundation: set[str]) -> tuple[list[str], list[str]]:
    counts = Counter()
    labels: dict[str, str] = {}
    for role in roles:
        seen = set()
        for skill in skill_list(role):
            key = norm(skill)
            if not key or key in seen:
                continue
            seen.add(key)
            counts[key] += 1
            labels.setdefault(key, skill)

    n = max(len(roles), 1)
    # A subgroup skill must be a directional delta, not a domain foundation
    # duplicate. At least two roles or a 20% prevalence supports a derived row;
    # the fallback keeps a small evidence-backed group explainable.
    derived = [key for key, count in counts.most_common() if key not in foundation and (count >= 2 or count / n >= 0.20)]
    if len(derived) < 3:
        derived = [key for key, count in counts.most_common() if key not in foundation][:3]

    existing_values = []
    for value in existing or []:
        label = text(value)
        key = norm(label)
        if key and key not in foundation and key not in {norm(item) for item in existing_values}:
            existing_values.append(label)

    # Source-derived role skills lead; curated/source-backed existing skills
    # supplement them when they are not duplicates.
    chosen = [labels[key] for key in derived]
    chosen.extend(value for value in existing_values if norm(value) not in {norm(item) for item in chosen})
    return chosen[:12], sorted(set(source for role in roles for source in source_names(role)))


def main() -> None:
    structure = json.loads(STRUCTURE_PATH.read_text(encoding="utf-8"))
    taxonomy = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    roles = load_roles()
    roles_by_domain: dict[str, list[dict]] = defaultdict(list)
    roles_by_group: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for role in roles:
        domain_id = text(role.get("domain_id"))
        subgroup = text(role.get("isco_group"))[:2]
        roles_by_domain[domain_id].append(role)
        if subgroup:
            roles_by_group[(domain_id, subgroup)].append(role)

    report = {
        "schema_version": 1,
        "policy": {
            "cluster_trigger": "explicit P1/P2, or more than two sub-majors, or more than 50 roles with at least two sub-majors",
            "priority3": sorted(P3),
            "d022_resolution": "P1: four independent mining work directions",
            "skill_rule": "subgroup skills are source-derived deltas from domain foundation skills",
            "promotion_gate": {
                "required_proof": [
                    "independent source-backed domain definition",
                    "distinct foundation-skill evidence",
                    "clear role boundary that is not only a seniority split",
                    "reviewed CCMAS programme-to-domain mapping impact",
                ],
                "downstream_impact": "A subgroup promoted to a top-level domain increases the domain count and requires a fresh CCMAS programme-domain mapping pass, including direct/functional/adjacent tiers.",
                "role_demand_ordering": "deferred; no role-demand dataset is available",
            },
        },
        "domains_flattened": [],
        "domains_clustered": [],
        "groups_created": [],
        "groups_removed": [],
        "placeholder_labels_repaired": [],
        "skill_deltas": [],
        "empty_delta_groups": [],
    }

    BACKUP_PATH.write_text(STRUCTURE_PATH.read_text(encoding="utf-8"), encoding="utf-8")

    for domain_id, domain in structure.items():
        domain_roles = roles_by_domain.get(domain_id, [])
        observed = sorted({text(role.get("isco_group"))[:2] for role in domain_roles if text(role.get("isco_group"))[:2]})
        role_count = len(domain_roles)
        should_cluster = (
            domain_id in P1
            or domain_id in P2
            or (domain_id not in P3 and len(observed) > 2)
            or (domain_id not in P3 and role_count > 50 and len(observed) > 1)
        )
        if not should_cluster:
            if domain.get("subgroups"):
                report["domains_flattened"].append({"domain_id": domain_id, "removed_groups": [text(item.get("isco_submajor")) for item in domain.get("subgroups") or []]})
            domain["subgroups"] = []
            domain["has_subgroups"] = False
            domain["role_count"] = role_count
            continue

        report["domains_clustered"].append({"domain_id": domain_id, "role_count": role_count, "submajors": observed})
        old_groups = {text(item.get("isco_submajor")): item for item in domain.get("subgroups") or []}
        foundation = {norm(item.get("skill")) for item in domain.get("foundation_skills") or [] if isinstance(item, dict) and norm(item.get("skill"))}
        new_groups = []
        for display_order, subgroup_id in enumerate(observed, start=1):
            roles_in_group = roles_by_group[(domain_id, subgroup_id)]
            old = old_groups.get(subgroup_id) or {}
            tax = taxonomy.get(subgroup_id) or {}
            label = text(old.get("label"))
            if not label or PLACEHOLDER_LABEL.match(label):
                label = text(tax.get("label")) or f"{text(domain.get('domain_name'))} career direction {subgroup_id}"
                report["placeholder_labels_repaired"].append({"domain_id": domain_id, "isco_submajor": subgroup_id, "label": label})
            description = text(old.get("description"))
            if not description or norm(description) in {norm(item) for item in PLACEHOLDER_DESCRIPTION}:
                description = text(tax.get("description")) or f"Roles in the {label} occupational grouping."
            cluster_skills, role_sources = choose_skills(old.get("cluster_skills") or [], roles_in_group, foundation)
            if not cluster_skills:
                report["empty_delta_groups"].append({"domain_id": domain_id, "isco_submajor": subgroup_id, "role_count": len(roles_in_group)})
            old_provenance = old.get("source_provenance") or {}
            provenance = dict(old_provenance) if isinstance(old_provenance, dict) else {}
            provenance.setdefault("source", "isco_submajor_derived")
            provenance["sources"] = sorted(set(provenance.get("sources") or []) | set(role_sources) | {"global_esco"})
            provenance["ownership"] = "subgroup"
            provenance["mapping_method"] = "canonical_role_library_isco_submajor"
            provenance["evidence_role_count"] = len(roles_in_group)
            subgroup = {
                "isco_submajor": subgroup_id,
                "label": label,
                "role_count": len(roles_in_group),
                "cluster_skills": cluster_skills,
                "description": description,
                "raw_isco_label": text(tax.get("label")) or text(old.get("raw_isco_label")) or "Source-backed ISCO sub-major grouping",
                "source_provenance": provenance,
                "display_order": display_order,
            }
            new_groups.append(subgroup)
            report["skill_deltas"].append({"domain_id": domain_id, "isco_submajor": subgroup_id, "skills": cluster_skills, "role_sources": role_sources})
        domain["subgroups"] = new_groups
        domain["has_subgroups"] = bool(new_groups)
        domain["role_count"] = role_count
        # Keep domain foundation skills source-backed, unique, and ordered by
        # prevalence. No role skill is deleted here; only duplicate display
        # entries are removed.
        foundation_rows = {}
        for item in domain.get("foundation_skills") or []:
            if not isinstance(item, dict) or not norm(item.get("skill")):
                continue
            key = norm(item.get("skill"))
            previous = foundation_rows.get(key)
            if previous is None or float(item.get("prevalence") or 0) > float(previous.get("prevalence") or 0):
                foundation_rows[key] = item
        domain["foundation_skills"] = sorted(foundation_rows.values(), key=lambda item: (-float(item.get("prevalence") or 0), norm(item.get("skill"))))

    STRUCTURE_PATH.write_text(json.dumps(structure, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    report["summary"] = {
        "canonical_roles": len(roles),
        "domains": len(structure),
        "domains_flattened": len(report["domains_flattened"]),
        "domains_clustered": len(report["domains_clustered"]),
        "groups_created_or_rebuilt": sum(len(item["submajors"]) for item in report["domains_clustered"]),
        "placeholder_labels_repaired": len(report["placeholder_labels_repaired"]),
        "empty_delta_groups": len(report["empty_delta_groups"]),
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    print(f"Backup: {BACKUP_PATH.name}")


if __name__ == "__main__":
    main()
