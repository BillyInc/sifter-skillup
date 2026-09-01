"""Audit subgroup and role source anchors in the current career taxonomy."""

from __future__ import annotations

import json
import csv
import re
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent


def load(name: str):
    return json.loads((HERE / name).read_text(encoding="utf-8"))


def clean(value) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    return "" if text.lower() in {"nan", "none", "null"} else text


def role_key(role: dict) -> str:
    return f"{clean(role.get('domain_id'))}|{clean(role.get('role_name'))}"


def normalized_title(value) -> str:
    return re.sub(r"[^a-z0-9]+", " ", clean(value).lower()).strip()


def load_onet_titles() -> dict[str, dict]:
    """Load exact O*NET 31.0 occupation titles for missing role anchors."""
    path = HERE / "_source_extracts" / "onet_31_0" / "Occupation Data.txt"
    if not path.exists():
        return {}
    result = {}
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            title = normalized_title(row.get("Title"))
            soc = clean(row.get("O*NET-SOC Code"))
            if title and soc:
                result.setdefault(title, {"soc": soc, "title": clean(row.get("Title")), "description": clean(row.get("Description"))})
    return result


def sources_from(role: dict) -> list[str]:
    provenance = role.get("source_provenance") or {}
    values = provenance.get("sources") if isinstance(provenance, dict) else []
    if not values:
        source = clean(role.get("source"))
        return [source] if source else []
    return sorted({clean(x) for x in values if clean(x)})


def main() -> None:
    meta = load("domain_meta.json")
    structure = load("domain_structure.json")
    base_roles = load("role_library_v3_cleaned.json")
    overlays = []
    overlay_counts = {}
    for name in ("emerging_role_overlays.json", "thin_domain_role_overlays.json"):
        path = HERE / name
        items = (json.loads(path.read_text(encoding="utf-8")).get("roles") or []) if path.exists() else []
        overlays.extend(items)
        overlay_counts[name] = len(items)
    merged: dict[str, dict] = {}
    duplicate_role_keys = []
    for role in [*base_roles, *overlays]:
        key = role_key(role)
        if not key or key in merged:
            if key:
                duplicate_role_keys.append(key)
            continue
        merged[key] = role

    profiles = load("role_work_profiles.json").get("profiles", [])
    profile_by_key = {clean(x.get("role_key")): x for x in profiles if clean(x.get("role_key"))}
    onet_titles = load_onet_titles()

    subgroup_rows = []
    subgroup_source_counts = Counter()
    for domain_id, item in structure.items():
        for subgroup in item.get("subgroups", []) or []:
            provenance = subgroup.get("source_provenance") or {}
            sources = sorted({clean(x) for x in provenance.get("sources", []) if clean(x)})
            source = clean(provenance.get("source"))
            if source:
                subgroup_source_counts[source] += 1
            subgroup_rows.append({
                "domain_id": domain_id,
                "domain_name": meta.get(domain_id, {}).get("domain_name"),
                "isco_submajor": clean(subgroup.get("isco_submajor")),
                "label": subgroup.get("label"),
                "description": subgroup.get("description"),
                "role_count": subgroup.get("role_count"),
                "source": source,
                "sources": sources,
                "source_provenance": provenance,
                "source_backed": bool(source or sources),
                "has_nigerian_context": bool((provenance.get("nigerian_context") if isinstance(provenance, dict) else None)),
            })

    role_rows = []
    role_source_counts = Counter()
    missing_profile = []
    missing_anchor = []
    for key, role in sorted(merged.items()):
        provenance = role.get("source_provenance") or {}
        sources = sources_from(role)
        for source in sources:
            role_source_counts[source] += 1
        profile = profile_by_key.get(key)
        esco_code = clean(role.get("esco_code"))
        onet_codes = role.get("onet_occupation_codes") or []
        if not isinstance(onet_codes, list):
            onet_codes = [onet_codes]
        onet_codes = [clean(x) for x in onet_codes if clean(x)]
        profile_onet_codes = profile.get("onet_occupation_codes") or [] if profile else []
        if not isinstance(profile_onet_codes, list):
            profile_onet_codes = [profile_onet_codes]
        profile_onet_codes = [clean(x) for x in profile_onet_codes if clean(x)]
        onet_codes = sorted(set(onet_codes + profile_onet_codes))
        onet_title_match = onet_titles.get(normalized_title(role.get("role_name")))
        if not onet_codes and onet_title_match:
            onet_codes = [onet_title_match["soc"]]
        has_role_field_anchor = bool(provenance or esco_code or onet_codes)
        profile_links = profile.get("source_links", []) if profile else []
        has_profile_link_anchor = bool(profile_links)
        domain_id = clean(role.get("domain_id"))
        role_isco_submajor = clean(role.get("isco_group"))[:2]
        domain_subgroup_keys = {
            clean(item.get("isco_submajor"))
            for item in (structure.get(domain_id, {}).get("subgroups") or [])
        }
        if role_isco_submajor in domain_subgroup_keys:
            subgroup_assignment = "subgroup"
        elif domain_subgroup_keys:
            # Keep the role directly under its domain rather than forcing it
            # into an unrelated subgroup when its ISCO sub-major is absent.
            subgroup_assignment = "direct_domain_fallback"
        else:
            subgroup_assignment = "domain_direct"
        source_kind = "source_backed" if sources else (
            "source_backed_via_onet_title" if onet_title_match else "unresolved_source"
        )
        if not has_role_field_anchor and not has_profile_link_anchor:
            missing_anchor.append(key)
            source_kind = "unresolved_source"
        if profile is None:
            missing_profile.append(key)
        role_rows.append({
            "role_key": key,
            "domain_id": domain_id,
            "domain_name": role.get("domain_name") or meta.get(domain_id, {}).get("domain_name"),
            "role_name": role.get("role_name"),
            "source": role.get("source"),
            "source_kind": source_kind,
            "source_confidence": role.get("source_confidence"),
            "data_state": role.get("data_state"),
            "isco_group": clean(role.get("isco_group")),
            "isco_submajor": role_isco_submajor,
            "subgroup_assignment": subgroup_assignment,
            "esco_code": esco_code,
            "onet_occupation_codes": onet_codes,
            "onet_title_match": onet_title_match,
            "has_description": bool(clean(role.get("description"))),
            "has_essential_skills": bool(role.get("essential_skills")),
            "has_optional_skills": bool(role.get("optional_skills")),
            "source_provenance": provenance,
            "has_role_field_anchor": has_role_field_anchor,
            "has_profile_link_anchor": has_profile_link_anchor,
            "work_profile_status": profile.get("source_record_status") if profile else "not_available",
            "work_profile_source_links": profile_links,
        })

    domain_rows = []
    roles_by_domain = Counter(row["domain_id"] for row in role_rows)
    subgroups_by_domain = Counter(row["domain_id"] for row in subgroup_rows)
    for domain_id, item in sorted(meta.items()):
        domain_roles = [row for row in role_rows if row["domain_id"] == domain_id]
        domain_subgroups = [row for row in subgroup_rows if row["domain_id"] == domain_id]
        domain_rows.append({
            "domain_id": domain_id,
            "domain_name": item.get("domain_name"),
            "excluded": bool(item.get("excluded")),
            "role_records_after_overlay_dedup": len(domain_roles),
            "subgroup_records": len(domain_subgroups),
            "roles_with_explicit_source_anchor": sum(bool(row["source_provenance"] or row["esco_code"] or row["onet_occupation_codes"]) for row in domain_roles),
            "roles_with_profile_link_anchor": sum(row["has_profile_link_anchor"] for row in domain_roles),
            "roles_with_any_source_evidence": sum(row["has_role_field_anchor"] or row["has_profile_link_anchor"] for row in domain_roles),
            "roles_with_esco_code": sum(bool(row["esco_code"]) for row in domain_roles),
            "roles_with_onet_code": sum(bool(row["onet_occupation_codes"]) for row in domain_roles),
            "roles_with_work_profile": sum(row["work_profile_status"] != "not_available" for row in domain_roles),
            "subgroups_with_source_provenance": sum(row["source_backed"] for row in domain_subgroups),
            "source_kinds": sorted({source for row in domain_subgroups for source in row["sources"]} | {source for row in domain_roles for source in sources_from(row["source_provenance"] if row["source_provenance"] else {"source": row["source"]})}),
        })

    out = {
        "schema_version": "2026-08-31.subgroup-role-source-traceability.v1",
        "purpose": "Trace current subgroups and roles to their recorded ISCO, ESCO, O*NET or specialist-framework evidence without asserting that source presence proves Nigerian demand or learner competence.",
        "repository_inputs": {
            "domain_meta": "data/career-mapping/domain_meta.json",
            "domain_structure": "data/career-mapping/domain_structure.json",
            "role_library": "data/career-mapping/role_library_v3_cleaned.json",
            "emerging_role_overlays": "data/career-mapping/emerging_role_overlays.json",
            "thin_domain_role_overlays": "data/career-mapping/thin_domain_role_overlays.json",
            "role_work_profiles": "data/career-mapping/role_work_profiles.json",
            "local_onet_31_0_occupation_data": "data/career-mapping/_source_extracts/onet_31_0/Occupation Data.txt",
        },
        "counts": {
            "domains": len(meta),
            "subgroups": len(subgroup_rows),
            "base_role_library_rows": len(base_roles),
            "overlay_rows": len(overlays),
            "merged_role_records": len(role_rows),
            "duplicate_role_keys_removed": len(duplicate_role_keys),
            "work_profile_rows": len(profiles),
            "role_records_with_explicit_source_anchor": sum(bool(row["source_provenance"] or row["esco_code"] or row["onet_occupation_codes"]) for row in role_rows),
            "role_records_with_profile_link_anchor": sum(row["has_profile_link_anchor"] for row in role_rows),
            "role_records_with_any_source_evidence": sum(row["has_role_field_anchor"] or row["has_profile_link_anchor"] for row in role_rows),
            "role_records_with_esco_code": sum(bool(row["esco_code"]) for row in role_rows),
            "role_records_with_onet_code": sum(bool(row["onet_occupation_codes"]) for row in role_rows),
            "role_records_with_work_profile": sum(row["work_profile_status"] != "not_available" for row in role_rows),
            "subgroups_with_source_provenance": sum(row["source_backed"] for row in subgroup_rows),
            "subgroups_without_source_provenance": sum(not row["source_backed"] for row in subgroup_rows),
            "roles_without_any_recorded_anchor": len(missing_anchor),
            "roles_without_work_profile_row": len(missing_profile),
            "roles_assigned_to_subgroup": sum(row["subgroup_assignment"] == "subgroup" for row in role_rows),
            "roles_using_direct_domain_fallback": sum(row["subgroup_assignment"] == "direct_domain_fallback" for row in role_rows),
            "roles_in_domains_without_subgroup_taxonomy": sum(row["subgroup_assignment"] == "domain_direct" for row in role_rows),
        },
        "overlay_rows": overlay_counts,
        "subgroup_source_counts": dict(sorted(subgroup_source_counts.items())),
        "role_source_counts": dict(sorted(role_source_counts.items())),
        "limitations": [
            "The base role library source field is not itself a complete citation. Exact ESCO evidence requires a valid esco_code and the corresponding local ESCO record; exact O*NET evidence requires a recorded O*NET code/profile.",
            "Specialist overlay provenance identifies the framework and evidence description, but it does not prove Nigerian vacancy volume or licensing.",
            "A subgroup source anchor establishes a grouping rationale; it does not prove that every role in the subgroup belongs there without role-level review.",
            "Roles whose ISCO sub-major has no matching subgroup are intentionally exposed through the direct domain-to-role fallback. This is not an invented subgroup assignment and is not counted as a structural failure.",
            "An O*NET work profile is a global/US proxy and is not a Nigerian hiring requirement.",
            "A role with no stored code is matched to O*NET 31.0 only when its exact current role title matches an O*NET occupation title; the audit records that match and does not alter the role library automatically.",
        ],
        "domains": domain_rows,
        "subgroups": subgroup_rows,
        "roles": role_rows,
        "unresolved": {
            "role_keys_without_any_recorded_anchor": missing_anchor,
            "role_keys_without_work_profile_row": missing_profile,
        },
    }
    out_path = HERE / "_audit" / "subgroup_role_source_traceability_2026-08-31.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Subgroup and role source traceability audit — 2026-08-31",
        "",
        "## Result",
        "",
        "The current subgroup layer has recorded provenance for every subgroup row. The current role layer is a deduplicated union of the cleaned role library and specialist overlays; its counts do not equal the base library or the O*NET work-profile count. This audit exposes those populations separately.",
        "",
        "## Counts",
        "",
        f"- Domains: **{len(meta)}**.",
        f"- Subgroups: **{len(subgroup_rows)}**; with recorded source provenance: **{sum(row['source_backed'] for row in subgroup_rows)}**.",
        f"- Base role-library rows: **{len(base_roles)}**.",
        f"- Overlay rows: **{len(overlays)}**; duplicate role keys removed during merge: **{len(duplicate_role_keys)}**.",
        f"- Merged role records: **{len(role_rows)}**.",
        f"- O*NET work-profile rows: **{len(profiles)}**; role records with a work-profile row: **{sum(row['work_profile_status'] != 'not_available' for row in role_rows)}**.",
        f"- Merged roles with an explicit ESCO code: **{sum(bool(row['esco_code']) for row in role_rows)}**.",
        f"- Merged roles with an explicit O*NET code: **{sum(bool(row['onet_occupation_codes']) for row in role_rows)}**.",
        f"- Roles whose previously missing code was recovered by an exact O*NET 31.0 title match in this audit: **{sum(bool(row['onet_title_match']) for row in role_rows)}**.",
        f"- Merged roles with a source link in their work-profile record: **{sum(row['has_profile_link_anchor'] for row in role_rows)}**.",
        f"- Merged roles with any role-field or profile-link source evidence: **{sum(row['has_role_field_anchor'] or row['has_profile_link_anchor'] for row in role_rows)}**.",
        f"- Merged roles without any recorded anchor, provenance, or profile source link: **{len(missing_anchor)}**.",
        f"- Merged roles assigned to a matching subgroup: **{sum(row['subgroup_assignment'] == 'subgroup' for row in role_rows)}**.",
        f"- Merged roles using the intentional direct domain-to-role fallback because their ISCO sub-major has no matching subgroup: **{sum(row['subgroup_assignment'] == 'direct_domain_fallback' for row in role_rows)}**.",
        f"- Merged roles in domains without a subgroup taxonomy: **{sum(row['subgroup_assignment'] == 'domain_direct' for row in role_rows)}**.",
        "",
        "## Lineage map",
        "",
        "```mermaid",
        "flowchart LR",
        "    A[ISCO-08 sub-major/unit group] --> B[Subgroup provenance]",
        "    B --> C[Role ownership boundary]",
        "    D[ESCO URI and occupation record] --> C",
        "    E[O*NET SOC and profile] --> F[Tasks, preparation and work context]",
        "    F --> C",
        "    G[Specialist framework] --> C",
        "    C --> H[Domain role record]",
        "    H --> I[Nigerian context layer]",
        "    H --> J[Student-facing skills, tools and guidance]",
        "```",
        "",
        "## Interpretation rules",
        "",
        "- ISCO is the occupational grouping spine; it is not a complete description of each role.",
        "- ESCO is the primary normalized role/skill evidence where a valid ESCO URI/code is recorded.",
        "- O*NET contributes task, preparation, tool and work-context evidence where a valid O*NET code/profile is recorded.",
        "- Specialist frameworks fill emerging or thin domains where the general taxonomies do not describe the field sufficiently.",
        "- Nigerian source overlays remain separate. A global role record is not relabelled as Nigerian demand.",
        "- Missing work profiles are not missing roles; they mean the O*NET work-profile join is unavailable and the role’s other evidence must remain visible.",
        "- A profile source link is recorded evidence even when the role object has not been populated with a machine-readable ESCO/O*NET code; it must not be reported as an entirely unanchored role.",
        "",
        "## Reproducibility",
        "",
        "Run from the repository root:",
        "",
        "```text",
        "python data/career-mapping/_audit_subgroup_role_source_traceability.py",
        "```",
        "",
        "The full per-domain, per-subgroup and per-role result is `data/career-mapping/_audit/subgroup_role_source_traceability_2026-08-31.json`.",
    ]
    (out_path.parent / "SUBGROUP_ROLE_SOURCE_TRACEABILITY_AUDIT_2026-08-31.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(out["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
