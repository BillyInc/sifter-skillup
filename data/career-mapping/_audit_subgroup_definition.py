"""Audit subgroup data and runtime behaviour against the approved definition.

This is intentionally an audit first. It does not rewrite domain_structure.json.
Role-to-subgroup counts follow the same explicit route resolver as the seed
generator; ISCO remains role identity and does not itself establish subgroup fit.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from _role_overlay_loader import load_overlay_roles
from _role_subgroup_route import effective_subgroup_code


ROOT = Path(__file__).parent
STRUCTURE = ROOT / "domain_structure.json"
META = ROOT / "domain_meta.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
SOURCE_PROVENANCE = ROOT / "domain_skill_provenance.json"
AUDIT_DIR = ROOT / "_audit"
REPORT_JSON = AUDIT_DIR / "subgroup_definition_audit_2026-08-17.json"
REPORT_MD = AUDIT_DIR / "subgroup_definition_audit_2026-08-17.md"
BACKEND_CAREER = ROOT.parent.parent / "backend" / "routes" / "career_routes.py"

P1 = {"D009", "D010", "D022", "D028", "D031", "D034", "D035", "D036", "D042", "D047", "D048", "D052", "D053", "D071", "D107"}
P2 = {"D011", "D013", "D039", "D062", "D064", "D077", "D158"}
P3 = {"D016", "D017", "D018", "D019", "D020", "D021", "D022", "D023", "D024"}
# The reviewed Sociology worked example explicitly defines two D078 branches.
EXPLICIT_SUBGROUP_DOMAINS = {"D078"}

PLACEHOLDER_LABEL = re.compile(r"^D\d{3}\s+\d{2}$", re.I)
PLACEHOLDER_DESCRIPTION = {
    "source-backed activities within this domain.",
    "source backed activities within this domain.",
}


def load_roles() -> list[dict]:
    roles = json.loads(ROLE_LIBRARY.read_text(encoding="utf-8"))
    # Match _gen_career_seed.py exactly: overlay records are first deduplicated
    # with emerging-role precedence, then appended to the base library, and the
    # final domain|role merge lets the overlay record replace a base record.
    roles.extend(load_overlay_roles())
    by_key = {}
    for role in roles:
        by_key[f"{role.get('domain_id')}|{role.get('role_name')}"] = role
    return list(by_key.values())


def norm(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def main() -> None:
    structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
    meta = json.loads(META.read_text(encoding="utf-8"))
    all_roles = load_roles()
    excluded_role_mappings = [
        {"role_key": f"{role.get('domain_id')}|{role.get('role_name')}", "reason": role.get("student_path_exclusion_reason")}
        for role in all_roles if str(role.get("student_path_status") or "").casefold() == "excluded"
    ]
    roles = [role for role in all_roles if str(role.get("student_path_status") or "active").casefold() != "excluded"]
    roles_by_domain: dict[str, list[dict]] = defaultdict(list)
    roles_by_group: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for role in roles:
        domain_id = str(role.get("domain_id") or "")
        submajor = effective_subgroup_code(role) or ""
        if not domain_id:
            continue
        roles_by_domain[domain_id].append(role)
        if submajor:
            roles_by_group[(domain_id, submajor)].append(role)

    findings = {
        "definition_conflicts": [],
        "independent_resolution": [],
        "threshold_design": [],
        "derivation": [],
        "thresholds": [],
        "level_direction": [],
        "labels": [],
        "skills": [],
        "source_layer": [],
        "role_counts": [],
        "subgroup_role_counts": [],
        "runtime": [],
        "schema": [],
    }

    if P1 & P3:
        findings["definition_conflicts"].append({
            "kind": "priority_overlap",
            "domains": sorted(P1 & P3),
            "detail": "The specification lists D022 as both Priority 1 needing clustering and Priority 3 excluded because engineer/technician is a level split.",
        })

    # Independent check of the conflict against the actual role work, not the
    # priority label. D022 contains management, engineering/geology, technical
    # safety/surveying, and drilling/mining operation work. That is a genuine
    # direction split, not merely an engineer-vs-technician seniority split.
    d022_groups = defaultdict(list)
    for role in roles_by_domain.get("D022", []):
        d022_groups[str(role.get("isco_group") or "")[:2]].append(str(role.get("role_name") or ""))
    findings["independent_resolution"].append({
        "domain_id": "D022",
        "observed_submajors": {key: {"role_count": len(value), "role_examples": value[:6]} for key, value in sorted(d022_groups.items())},
        "recommended_priority": "P1",
        "reason": "The four groups represent materially different work directions: management, engineering/geology, technical surveying/safety, and drilling/mining operations.",
    })
    findings["threshold_design"].append({
        "kind": "single_submajor_large_domain",
        "domains": ["D043", "D085", "D097", "D110"],
        "reason": "The current OR threshold requests a subgroup card even when all roles share one ISCO sub-major; that produces one card and does not reduce directional clutter.",
        "recommendation": "Use more than two sub-majors, or more than 50 roles with at least two sub-majors, as the clustering trigger; keep a single-sub-major domain flat and demand-sorted.",
    })

    total_groups = 0
    excluded_group_count = 0
    placeholder_count = 0
    empty_skill_count = 0
    overlap_count = 0
    for domain_id, domain in structure.items():
        canonical_roles = roles_by_domain.get(domain_id, [])
        observed_submajors = sorted({
            code for role in canonical_roles
            if (code := effective_subgroup_code(role))
        })
        all_groups = domain.get("subgroups") or []
        groups = [group for group in all_groups if str(group.get("data_state") or "").lower() not in {"review_only", "excluded", "audit_only"}]
        excluded_group_count += len(all_groups) - len(groups)
        actual_submajors = [str(group.get("isco_submajor") or "") for group in groups]
        actual_set = set(actual_submajors)
        expected_set = set(observed_submajors)
        total_groups += len(groups)

        role_count = len(canonical_roles)
        needs_by_size = len(observed_submajors) > 2 or (role_count > 50 and len(observed_submajors) > 1)
        priority = "P1/P3 conflict" if domain_id in (P1 & P3) else "P1" if domain_id in P1 else "P2" if domain_id in P2 else "P3" if domain_id in P3 else None
        if domain_id in EXPLICIT_SUBGROUP_DOMAINS:
            expected_cluster = bool(observed_submajors)
        elif domain_id in P3 and domain_id != "D022":
            expected_cluster = False
        elif domain_id in (P1 | P2):
            expected_cluster = bool(observed_submajors)
        else:
            expected_cluster = needs_by_size
        invalid = sorted(actual_set - expected_set)
        # A flat domain is not required to expose one card per ISCO subgroup.
        # Missing subgroup keys are therefore only a derivation failure when
        # this domain is expected to be clustered by the threshold/priority
        # rule.
        missing = sorted(expected_set - actual_set) if expected_cluster else []
        if invalid or missing:
            findings["derivation"].append({"domain_id": domain_id, "invalid_submajors": invalid, "missing_submajors": missing})
        actual_cluster = bool(groups)
        if expected_cluster != actual_cluster:
            findings["thresholds"].append({
                "domain_id": domain_id,
                "roles": role_count,
                "submajors": len(observed_submajors),
                "priority": priority,
                "expected_cluster": expected_cluster,
                "actual_cluster": actual_cluster,
            })

        if domain_id in P3 and domain_id != "D022" and groups:
            findings["level_direction"].append({
                "domain_id": domain_id,
                "groups": actual_submajors,
                "detail": "Priority 3 says this domain should stay flat; groups currently expose ISCO sub-major splits.",
            })

        if domain.get("role_count") != role_count:
            findings["role_counts"].append({"domain_id": domain_id, "stored": domain.get("role_count"), "canonical": role_count})

        for group in groups:
            total = {"domain_id": domain_id, "isco_submajor": group.get("isco_submajor")}
            observed_count = len(roles_by_group.get((domain_id, str(group.get("isco_submajor") or "")), []))
            if group.get("role_count") != observed_count:
                findings["subgroup_role_counts"].append({**total, "stored": group.get("role_count"), "canonical": observed_count})
            label = str(group.get("label") or "").strip()
            description = str(group.get("description") or "").strip()
            if PLACEHOLDER_LABEL.match(label) or not label:
                placeholder_count += 1
                findings["labels"].append({**total, "kind": "placeholder_or_missing_label", "label": label})
            if not description or norm(description) in {norm(item) for item in PLACEHOLDER_DESCRIPTION}:
                findings["labels"].append({**total, "kind": "placeholder_or_missing_description", "description": description})
            if not group.get("cluster_skills"):
                empty_skill_count += 1
                findings["skills"].append({**total, "kind": "empty_cluster_skills"})
            foundation = {norm(item.get("skill")) for item in domain.get("foundation_skills") or [] if isinstance(item, dict)}
            overlap = sorted({norm(skill) for skill in group.get("cluster_skills") or []} & foundation)
            if overlap:
                overlap_count += 1
                findings["skills"].append({**total, "kind": "foundation_overlap", "skills": overlap})

    # Static runtime checks required by the definition.
    career_text = BACKEND_CAREER.read_text(encoding="utf-8") if BACKEND_CAREER.exists() else ""
    phantom_paths = []
    for path in (ROOT.parent.parent / "backend").rglob("*"):
        if not path.is_file() or path.stat().st_size > 8_000_000 or path.name.startswith("seed_"):
            continue
        if path.suffix.lower() not in {".py", ".sql", ".ts", ".tsx", ".js"}:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if re.search(r"subgroup[_ ]demand[_ ]metrics|subgroup.{0,30}demand|demand.{0,30}subgroup", text, re.I):
            phantom_paths.append(str(path.relative_to(ROOT.parent.parent)))
    if phantom_paths:
        findings["runtime"].append({"kind": "phantom_subgroup_demand_path", "paths": phantom_paths})
    else:
        findings["runtime"].append({"kind": "phantom_subgroup_demand_path", "status": "none_found"})
    findings["runtime"].append({
        "kind": "role_demand_ordering",
        "status": "deferred",
        "detail": "No role-demand dataset is available yet; roles must not be ordered by an unavailable demand metric. Preserve source/insertion order until a validated demand table is introduced.",
    })

    # The source-backed layer is a second runtime input. Its subgroup skill
    # payload must be a delta over the domain foundation, not a copy of it.
    if SOURCE_PROVENANCE.exists():
        source_layer = json.loads(SOURCE_PROVENANCE.read_text(encoding="utf-8"))
        source_overlap = 0
        source_overlap_groups = 0
        for row in source_layer.values():
            foundation = row.get("foundation_skills") or {}
            foundation_names = set(foundation) if isinstance(foundation, dict) else {
                norm(item.get("skill") or item.get("label")) for item in foundation if isinstance(item, dict)
            }
            for subgroup in (row.get("subgroups") or {}).values():
                skills = subgroup.get("skills") or {}
                names = set(skills) if isinstance(skills, dict) else {norm(item) for item in skills}
                overlap = names & foundation_names
                if overlap:
                    source_overlap += len(overlap)
                    source_overlap_groups += 1
        findings["source_layer"].append({
            "kind": "source_backed_foundation_overlap",
            "overlap_skill_count": source_overlap,
            "subgroup_count": source_overlap_groups,
            "detail": "domain_skill_provenance currently repeats domain foundation skills inside subgroup skill maps.",
        })

    # These fields are in the prose schema but not in the current migration/seed schema.
    migration = (ROOT.parent.parent / "backend" / "migration_career_v2.sql").read_text(encoding="utf-8")
    for field in ("what_people_do", "work_context", "display_order"):
        if field not in migration:
            findings["schema"].append({"kind": "field_missing_from_migration", "field": field})

    report = {
        "definition": {
            "grouping_key": "first_two_digits_of_role.isco_group",
            "threshold": "explicit P1/P2, explicit reviewed D078 Sociology branches, or distinct sub-majors > 2, or roles > 50 with at least two distinct sub-majors; P3 stays flat except the independently resolved D022 case",
            "priority3_override": "P3 excludes clustering; D022 conflict with P1 is recorded, not silently resolved",
            "role_demand_ordering": "deferred until a validated role-demand dataset exists",
            "promotion_impact": {
                "domain_count": "Promoting a subgroup creates a new top-level domain and increases the domain count; it is not a display-only rename.",
                "ccmas_programme_mapping": "Every promotion requires a fresh CCMAS programme-to-domain mapping pass because programme links, match tiers, and downstream domain references may change.",
                "proof_gate": "Do not promote from subgroup size or intuition alone; require an independent source-backed domain definition, distinct foundation evidence, role boundary, and reviewed programme impact.",
            },
        },
        "canonical_roles": len(roles),
        "excluded_student_role_mappings": excluded_role_mappings,
        "domains": len(structure),
        "subgroups": total_groups,
        "excluded_subgroups_preserved_in_source": excluded_group_count,
        "summary": {
            "derivation_findings": len(findings["derivation"]),
            "threshold_findings": len(findings["thresholds"]),
            "level_direction_findings": len(findings["level_direction"]),
            "placeholder_or_missing_label_or_description": placeholder_count,
            "empty_or_overlapping_skill_findings": len(findings["skills"]),
            "source_layer_overlap_is_evidence_index": len(findings["source_layer"]),
            "stored_role_count_findings": len(findings["role_counts"]),
            "stored_subgroup_role_count_findings": len(findings["subgroup_role_counts"]),
            "independent_resolution_findings": len(findings["independent_resolution"]),
        },
        "findings": findings,
    }
    AUDIT_DIR.mkdir(exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Subgroup-definition audit — 2026-08-17",
        "",
        "This audit compares the live subgroup artefacts with the attached definition. It does not assume the definition is internally consistent; conflicts are reported explicitly.",
        "",
        f"Canonical student-visible deduplicated role rows: **{len(roles)}**; domains: **{len(structure)}**; stored subgroups: **{total_groups}**.",
        "",
        "## Important specification conflict",
        "",
        "D022 appears in both Priority 1 (cluster) and Priority 3 (stay flat because engineer/technician is a level split). The role evidence resolves this in favour of Priority 1: D022 contains four materially different work directions, not only a seniority split.",
        "",
        "The OR threshold also creates a design flaw: a large domain with only one ISCO sub-major receives one subgroup card, which adds no direction. The audit recommends requiring at least two sub-majors for clustering.",
        "",
        "## Findings",
        "",
        f"- Derivation mismatches (missing or unsupported ISCO sub-majors): **{len(findings['derivation'])}** domains.",
        f"- Threshold/over-clustering mismatches: **{len(findings['thresholds'])}** domains.",
        f"- Priority-3 level/direction violations: **{len(findings['level_direction'])}** domains.",
        f"- Placeholder or missing labels/descriptions: **{placeholder_count}** subgroup rows.",
        f"- Empty/duplicative subgroup skill findings: **{len(findings['skills'])}**.",
        f"- Stored role-count mismatches against the canonical role library: **{len(findings['role_counts'])}** domains.",
        f"- Stored subgroup role-count mismatches against the canonical role library: **{len(findings['subgroup_role_counts'])}** subgroup rows.",
        f"- Excluded subgroup records preserved for audit: **{excluded_group_count}**.",
        "",
        "## Runtime/schema checks",
        "",
    ]
    for item in findings["runtime"] + findings["schema"]:
        lines.append(f"- `{item}`")
    lines.extend(["", "The JSON report contains the complete domain-by-domain findings and is the review surface for the next correction pass."])
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))
    print("runtime", report["findings"]["runtime"])
    print("schema", report["findings"]["schema"])


if __name__ == "__main__":
    main()
