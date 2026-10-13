"""Reconcile student-facing subgroup paths to the current canonical roles.

Subgroups remain in the source ledger when excluded so their prior evidence is
preserved, but only supported, non-empty subgroup paths are seeded to students.
Role rows without an eligible subgroup remain directly under their domain.
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
sys.path.insert(0, str(ROOT))
from _role_overlay_loader import load_overlay_roles  # noqa: E402
from _role_subgroup_route import effective_subgroup_code  # noqa: E402

STRUCTURE = ROOT / "domain_structure.json"
META = ROOT / "domain_meta.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
REPORT = AUDIT / "subgroup_role_contract_repairs_2026_10_03.json"
REPORT_MD = AUDIT / "subgroup_role_contract_repairs_2026_10_03.md"

P1 = {"D009", "D010", "D022", "D028", "D031", "D034", "D035", "D036", "D042", "D047", "D048", "D052", "D053", "D071", "D107"}
P2 = {"D011", "D013", "D039", "D062", "D064", "D077", "D158"}
P3 = {"D016", "D017", "D018", "D019", "D020", "D021", "D022", "D023", "D024"}
# The Sociology worked example explicitly supports both D078 paths, even
# though this domain does not meet the general volume threshold.
EXPLICIT_SUBGROUP_DOMAINS = {"D078"}

SUBGROUP_LABELS = {
    ("D078", "21"): "Social Data & Quantitative Methods",
    ("D078", "26"): "Social, Cultural & Economic Research",
}

SUBGROUP_DESCRIPTIONS = {
    ("D078", "21"): "Use statistical and computational methods to study social questions, population patterns, and relationships. Choose methods to fit the research question, evidence, and ethical limits; not every path requires programming.",
    ("D078", "26"): "Study people, institutions, policy, culture, and economic life through structured research and interpretation of evidence.",
    ("D084", "33"): "Handle the practical business records behind payroll and bookkeeping, including financial transactions, account entries, and routine calculations.",
    ("D084", "43"): "Record and check the figures used in payroll and bookkeeping, such as wages, account totals, invoices, and other numerical business records.",
    ("D091", "23"): "Teach driving knowledge and safe vehicle operation, plan instruction, and assess how learners apply those skills.",
    ("D091", "51"): "Provide the customer-facing and practical services connected with driving instruction, including learner support and safe service delivery.",
    ("D105", "73"): "Design, make, decorate, repair, or finish handcrafted and printed products, using artistic judgement together with practical production skills.",
    ("D123", "22"): "Use professional health knowledge to interpret medical images, support diagnosis, and guide safe imaging practice.",
    ("D123", "32"): "Carry out the technical imaging tasks that support diagnosis, including preparing equipment and patients, producing images, and following safety procedures.",
    ("D126", "22"): "Apply professional health knowledge to assess people and provide care within the recognised complementary, alternative, or traditional health practice.",
    ("D126", "32"): "Provide practical and technical support for assessment and care within the recognised complementary, alternative, or traditional health practice.",
    ("D132", "21"): "Research and apply scientific and engineering knowledge to understand space, celestial objects, and the systems used to explore them.",
    ("D132", "31"): "Support space-science and exploration work by operating, checking, and maintaining technical equipment and systems.",
}

ROLE_DISPLAY_NAMES_D078 = {
    "mathematician": "Mathematician",
    "statistician": "Statistician",
    "biometrician": "Biometrician (Specialist Statistician)",
    "demographer": "Demographer",
    "criminologist": "Criminologist",
    "historian": "Historian",
    "sociologist": "Sociologist",
    "business economics researcher": "Business Economics Researcher",
    "media scientist": "Media Researcher",
    "archaeologist": "Archaeologist",
    "economic policy officer": "Economic Policy Officer",
    "social work researcher": "Social Work Researcher",
    "behavioural scientist": "Behavioural Scientist",
    "political scientist": "Political Scientist",
    "economic adviser": "Economic Adviser",
    "genealogist": "Genealogist",
    "communication scientist": "Communication Researcher",
    "thanatology researcher": "Death and Dying Researcher",
    "economist": "Economist",
    "economic development coordinator": "Economic Development Coordinator",
    "anthropologist": "Anthropologist",
    "tax policy analyst": "Tax Policy Analyst",
    "geographer": "Geographer",
    "philosopher": "Philosopher",
}

ROLE_PATH_EXCLUSIONS = {
    "D078|biometrician": "The source occupation is focused on biometric or biological measurements, particularly medical or industrial applications. Its ISCO statistical subgroup does not establish a Social Sciences domain fit; no social-science-specific evidence was found. Preserve the source row for audit, but exclude this D078 role path from student data.",
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def canonical_roles() -> list[dict]:
    roles = read_json(ROLE_LIBRARY) + load_overlay_roles()
    by_key = {}
    for role in roles:
        key = f"{role.get('domain_id')}|{role.get('role_name')}"
        if key.strip("|"):
            by_key[key] = role
    return list(by_key.values())


def clustered(domain_id: str, role_count: int, submajors: set[str]) -> bool:
    if domain_id in EXPLICIT_SUBGROUP_DOMAINS:
        return bool(submajors)
    if domain_id in P3 and domain_id != "D022":
        return False
    if domain_id in P1 or domain_id in P2:
        return bool(submajors)
    return len(submajors) > 2 or (role_count > 50 and len(submajors) > 1)


def normalized_skill(value: object) -> str:
    return " ".join(str(value or "").strip().casefold().split())


def main() -> None:
    structure = read_json(STRUCTURE)
    meta = read_json(META)
    roles = canonical_roles()
    role_display_updates = []
    source_data_changed = False
    source_roles = read_json(ROLE_LIBRARY)
    for role in source_roles:
        role_key = f"{role.get('domain_id')}|{role.get('role_name')}"
        display_name = ROLE_DISPLAY_NAMES_D078.get(str(role.get("role_name") or "")) if role.get("domain_id") == "D078" else None
        if display_name and role.get("student_display_name") != display_name:
            role["student_display_name"] = display_name
            role_display_updates.append({"role_name": role.get("role_name"), "student_display_name": display_name})
            source_data_changed = True
        exclusion = ROLE_PATH_EXCLUSIONS.get(role_key)
        if exclusion and (role.get("student_path_status") != "excluded" or role.get("student_path_exclusion_reason") != exclusion):
            role["student_path_status"] = "excluded"
            role["student_path_exclusion_reason"] = exclusion
            source_data_changed = True
    if source_data_changed:
        ROLE_LIBRARY.write_text(json.dumps(source_roles, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        roles = canonical_roles()
    student_roles = [role for role in roles if str(role.get("student_path_status") or "active").casefold() != "excluded"]
    roles_by_domain: dict[str, list[dict]] = {}
    by_subgroup: Counter[tuple[str, str]] = Counter()
    for role in student_roles:
        domain_id = str(role.get("domain_id") or "")
        if not domain_id:
            continue
        roles_by_domain.setdefault(domain_id, []).append(role)
        subgroup_code = effective_subgroup_code(role)
        if subgroup_code:
            by_subgroup[(domain_id, subgroup_code)] += 1

    excluded = []
    activated = []
    count_updates = 0
    description_updates = []
    label_updates = []
    removed_foundation_duplicates = []
    for domain_id, domain in structure.items():
        domain_roles = roles_by_domain.get(domain_id, [])
        submajors = {
            effective_subgroup_code(role)
            for role in domain_roles
            if effective_subgroup_code(role)
        }
        show_subgroups = clustered(domain_id, len(domain_roles), submajors)
        if domain.get("role_count") != len(domain_roles):
            count_updates += 1
            domain["role_count"] = len(domain_roles)
        domain_foundation = {
            normalized_skill(item.get("skill"))
            for item in domain.get("foundation_skills") or []
            if isinstance(item, dict) and normalized_skill(item.get("skill"))
        }
        for subgroup in domain.get("subgroups") or []:
            code = str(subgroup.get("isco_submajor") or "")
            count = by_subgroup[(domain_id, code)]
            if subgroup.get("role_count") != count:
                count_updates += 1
                subgroup["role_count"] = count
            description = SUBGROUP_DESCRIPTIONS.get((domain_id, code))
            if description and subgroup.get("description") != description:
                subgroup["description"] = description
                description_updates.append({"domain_id": domain_id, "isco_submajor": code})
            label = SUBGROUP_LABELS.get((domain_id, code))
            if label and subgroup.get("label") != label:
                subgroup["label"] = label
                label_updates.append({"domain_id": domain_id, "isco_submajor": code, "label": label})
            original_skills = subgroup.get("cluster_skills") or []
            retained_skills = [skill for skill in original_skills if normalized_skill(skill) not in domain_foundation]
            removed = [skill for skill in original_skills if normalized_skill(skill) in domain_foundation]
            if removed:
                subgroup["cluster_skills"] = retained_skills
                removed_foundation_duplicates.extend({"domain_id": domain_id, "isco_submajor": code, "skill": skill} for skill in removed)
            if not show_subgroups or count == 0:
                reason = "no_current_canonical_roles" if count == 0 else "domain_uses_direct_domain_to_role_path_per_subgroup_contract"
                subgroup["data_state"] = "excluded"
                subgroup["student_visibility_reason"] = reason
                excluded.append({"domain_id": domain_id, "isco_submajor": code, "role_count": count, "reason": reason})
            else:
                if subgroup.get("data_state") == "excluded" and subgroup.get("student_visibility_reason") in {
                    "no_current_canonical_roles",
                    "domain_uses_direct_domain_to_role_path_per_subgroup_contract",
                }:
                    subgroup.pop("data_state", None)
                    subgroup.pop("student_visibility_reason", None)
                activated.append({"domain_id": domain_id, "isco_submajor": code, "role_count": count})

    # Validate every role path against the exact current subgroup contract.
    role_path_errors = []
    for role in student_roles:
        domain_id = str(role.get("domain_id") or "")
        if domain_id not in meta:
            role_path_errors.append({"role_key": f"{domain_id}|{role.get('role_name')}", "error": "unknown_domain"})
            continue
        code = str(role.get("isco_group") or "").strip()
        subgroup_code = effective_subgroup_code(role) or ""
        subgroup = next((row for row in (structure.get(domain_id, {}).get("subgroups") or []) if str(row.get("isco_submajor")) == subgroup_code), None)
        domain_role_count = len(roles_by_domain.get(domain_id, []))
        submajors = {
            effective_subgroup_code(item)
            for item in roles_by_domain.get(domain_id, [])
            if effective_subgroup_code(item)
        }
        uses_subgroups = clustered(domain_id, domain_role_count, submajors)
        if uses_subgroups and subgroup and subgroup.get("data_state") != "excluded":
            continue
        if uses_subgroups and subgroup_code and not subgroup:
            role_path_errors.append({"role_key": f"{domain_id}|{role.get('role_name')}", "error": "missing_supported_subgroup", "isco_group": code})

    STRUCTURE.write_text(json.dumps(structure, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    report = {
        "schema_version": "2026-10-03.subgroup-role-contract-repairs.v1",
        "canonical_role_count": len(roles),
        "student_role_count": len(student_roles),
        "excluded_student_role_mappings": [
            {"role_key": key, "reason": reason}
            for key, reason in sorted(ROLE_PATH_EXCLUSIONS.items())
        ],
        "domain_count": len(meta),
        "domains_with_role_rows": len(roles_by_domain),
        "domain_and_subgroup_role_count_fields_reconciled": count_updates,
        "active_subgroups": len(activated),
        "excluded_subgroups": len(excluded),
        "student_facing_description_repairs": description_updates,
        "student_facing_subgroup_label_repairs": label_updates,
        "student_facing_role_name_repairs": role_display_updates,
        "duplicate_subgroup_foundation_skills_removed": len(removed_foundation_duplicates),
        "removed_duplicate_skill_rows": removed_foundation_duplicates,
        "role_path_errors": role_path_errors,
        "excluded_subgroup_records": excluded,
        "active_subgroup_records": activated,
        "policy": "Subgroups are shown only when the approved domain-clustering rule applies and current canonical role membership exists. Excluded records and their source evidence remain in the local ledger; role rows without an active subgroup stay direct under their domain.",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Subgroup and role-path reconciliation — 2026-10-03",
        "",
        "This local repair uses the same role merge as the career seed and the current subgroup contract. It does not alter domain names, role identities, or ISCO/ESCO/O*NET source records.",
        "",
        "## Reconciled result",
        "",
        f"- Canonical merged roles: **{len(roles):,}** across **{len(meta)}** domains.",
        f"- Student-visible role mappings after domain-context exclusions: **{len(student_roles):,}**.",
        f"- Active student subgroup paths: **{len(activated):,}**.",
        f"- Excluded subgroup paths preserved in the source ledger: **{len(excluded):,}**.",
        f"- Domain/subgroup role-count fields reconciled: **{count_updates:,}** on first run.",
        f"- Duplicate subgroup skills already represented at the domain foundation were removed from subgroup-specific lists: **{len(removed_foundation_duplicates):,}**; full removed-value ledger is in the JSON report.",
        f"- Student-facing subgroup explanations refined from reviewed domain context: **{len(description_updates):,}**.",
        f"- Role paths without a valid domain/subgroup-or-direct route: **{len(role_path_errors):,}**.",
        "",
        "A subgroup is student-visible only when its domain qualifies for clustering and the current canonical role catalogue contains at least one role in that exact ISCO sub-major. Otherwise the subgroup remains tagged `excluded` for audit, and its roles are served directly from the domain when the seed is regenerated. No role is assigned to a different subgroup to force a card.",
        "",
        "## Excluded subgroup records",
        "",
    ]
    for row in excluded:
        lines.append(f"- `{row['domain_id']}` / ISCO `{row['isco_submajor']}` — {row['role_count']} current role(s); `{row['reason']}`.")
    lines.extend([
        "",
        "## Remaining evidence limits",
        "",
        f"The structural audit leaves **{len(role_path_errors)}** invalid role paths. **{sum(1 for row in roles if not row.get('isco_group'))}** role records have no ISCO code; they remain direct domain-to-role paths rather than receiving an invented subgroup. **{sum(1 for domain in structure.values() for subgroup in (domain.get('subgroups') or []) if subgroup.get('data_state') != 'excluded' and not (subgroup.get('cluster_skills') or []))}** active subgroup skill lists are empty after removing repeated domain-foundation items; no skill was invented to fill those lists.",
        "",
        "## D078 Social Sciences review",
        "",
        "The Sociology worked example explicitly supports two D078 branches, so both remain visible. The queried `biometrician` row is excluded from D078 student routes: ISCO 2120 establishes a statistical occupational family, but the role description centers on biometric/biological measurement, and no social-science-specific role evidence establishes its domain fit. The original source row and exclusion rationale remain internal; the role is not silently reclassified into another domain.",
        "",
        "",
        "This updates local source data and seed-generation behavior only. It does not regenerate or apply SQL.",
    ])
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in (
        "canonical_role_count", "domain_count", "domains_with_role_rows",
        "domain_and_subgroup_role_count_fields_reconciled", "active_subgroups",
        "excluded_subgroups", "role_path_errors",
    )}, indent=2))


if __name__ == "__main__":
    main()
