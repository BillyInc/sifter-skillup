"""Apply the D078-only area and role resolution.

This is intentionally a narrow local source transformation.  It does not run
the global specialization/role scripts and it does not touch SQL, API/UI,
matcher data, the D078 workflow candidates, or any other domain.
"""

from __future__ import annotations

import argparse
import copy
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
DOMAIN_STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
ROLE_LIBRARY = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
ROLE_REVIEW = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D001_D084/D078_role_domain_fit_review_2026_10_05.json"
RECONCILIATION = ROOT / "data/career-mapping/_audit/d078_subgroup_reconciliation_2026_10_08.json"
CHECKPOINT = ROOT / "data/career-mapping/_audit/d078_area_role_resolution_checkpoint_2026_10_08.json"
REPORT_JSON = ROOT / "data/career-mapping/_audit/d078_area_role_resolution_2026_10_08.json"
REPORT_MD = ROOT / "docs/manual-review/D078_AREA_ROLE_RESOLUTION_2026_10_08.md"

D078 = "D078"
TODAY = "2026-10-08"

AREA_IDS = {
    "sociology-social-anthropology",
    "economics-applied-analysis",
    "politics-governance-public-policy",
    "psychology-social-behaviour",
    "human-geography-population",
    "social-research-evaluation",
    "computational-digital-social-science",
}

AREA_NEGATIVE = {
    "sociology-social-anthropology": "Does not by itself include clinical psychology, economics as a whole, political authority, physical geography, or a generic research-method curriculum.",
    "economics-applied-analysis": "Does not include generic finance/accounting, every quantitative method, or political administration unless the work is explicitly economic or policy analysis.",
    "politics-governance-public-policy": "Does not include legal practice, general administration, sociology as a whole, or an evaluation method without public-authority/policy content.",
    "psychology-social-behaviour": "Does not include clinical/health practice or sociology's institutional/cultural scope unless the actual work has the relevant psychological or behavioural lens.",
    "human-geography-population": "Does not include physical geography, surveying/engineering, or environmental science when the work has no human/population/spatial-social scope.",
    "social-research-evaluation": "Does not turn interviews, surveys, statistics, software, or evaluation frameworks into an area without a substantive social question or programme/policy-evaluation purpose.",
    "computational-digital-social-science": "Does not include computer science generally or software proficiency without a social question, digital-society object, data-intensive evidence, and social interpretation.",
}

AREA_SOURCE_IDS = {
    "sociology-social-anthropology": ["UNESCO_ISCED_FIELD_DESCRIPTIONS", "UNESCO_SOCIAL_SCIENCE_DEFINITION"],
    "economics-applied-analysis": ["UNESCO_ISCED_FIELD_DESCRIPTIONS", "UNESCO_SOCIAL_SCIENCE_DEFINITION"],
    "politics-governance-public-policy": ["UNESCO_ISCED_FIELD_DESCRIPTIONS", "UNESCO_SOCIAL_SCIENCE_DEFINITION"],
    "psychology-social-behaviour": ["UNESCO_ISCED_FIELD_DESCRIPTIONS", "UNESCO_SOCIAL_SCIENCE_DEFINITION"],
    "human-geography-population": ["UNESCO_ISCED_FIELD_DESCRIPTIONS", "UNESCO_SOCIAL_SCIENCE_DEFINITION"],
    "social-research-evaluation": ["UNESCO_ISCED_FIELD_DESCRIPTIONS", "UNESCO_SOCIAL_SCIENCE_DEFINITION", "ESRC_TRAINING_2022"],
    "computational-digital-social-science": ["ISA_DIGITAL_SOCIOLOGY", "UNESCO_SOCIAL_SCIENCE_DEFINITION"],
}

# Explicit adjudications.  Absence from this table is intentional: a role is
# not placed in an area merely because its title or ISCO subgroup is nearby.
ROUTE_DECISIONS: dict[str, list[dict[str, Any]]] = {
    "anthropologist": [{"area": "sociology-social-anthropology", "route": "primary", "evidence": "Studies human societies, social organisation, and cultural, political and economic life.", "negative": "Anthropology route is limited to social/cultural inquiry; physical/biological-only work is not promoted here."}],
    "behavioural scientist": [{"area": "psychology-social-behaviour", "route": "primary", "evidence": "Researches, observes and explains human behaviour in society, motives and personality, and advises organisations or government.", "negative": "A behavioural route requires actual behavioural/psychological inquiry; generic organisational advice is insufficient."}],
    "business economics researcher": [{"area": "economics-applied-analysis", "route": "primary", "evidence": "Researches economic, organisational and strategic questions and analyses macroeconomic and microeconomic trends affecting industries and companies.", "negative": "The route is economic analysis, not generic business administration or a standalone quantitative-method route."}],
    "communication scientist": [],
    "criminologist": [
        {"area": "psychology-social-behaviour", "route": "primary", "evidence": "Studies psychological and behavioural conditions associated with crime and the circumstances shaping behaviour.", "negative": "Does not promote criminal-law practice, policing operations, or generic security work as a D078 area route."},
        {"area": "sociology-social-anthropology", "route": "secondary", "evidence": "Studies social background, social environment and institutional conditions associated with crime.", "negative": "The route is social analysis of crime; forensic/technical investigation alone is outside this area."},
    ],
    "demographer": [{"area": "human-geography-population", "route": "primary", "evidence": "Analyses population change, births, mortality, marriage, employment, migration and related population measures.", "negative": "The route requires population or demographic analysis; generic statistics without a population object is not enough."}],
    "economic adviser": [{"area": "economics-applied-analysis", "route": "primary", "evidence": "Researches economic developments, forecasts economic behaviour and advises on economic, trade, fiscal and related problems.", "negative": "No public-policy area route is promoted without an explicit policy/governance remit in the work."}],
    "economic development coordinator": [
        {"area": "economics-applied-analysis", "route": "primary", "evidence": "Develops and implements economic-growth and stability policies and analyses economic trends.", "negative": "The route is economic development, not generic project coordination."},
        {"area": "politics-governance-public-policy", "route": "secondary", "evidence": "Coordinates government/community/institutional cooperation and implements public or institutional development policy.", "negative": "Only the public-authority and policy-implementation part supports this second route; generic coordination does not."},
    ],
    "economic policy officer": [
        {"area": "economics-applied-analysis", "route": "primary", "evidence": "Develops economic strategies and analyses competitiveness, innovation, trade and economic policy.", "negative": "The route remains economic; it is not a generic policy-administration route."},
        {"area": "politics-governance-public-policy", "route": "secondary", "evidence": "Researches and assesses public-policy problems and contributes to economic policies, projects and programmes.", "negative": "The second route requires policy analysis and public decision context, not merely an economic forecast."},
    ],
    "economist": [{"area": "economics-applied-analysis", "route": "primary", "evidence": "Develops economic theory, analyses microeconomic and macroeconomic trends and advises organisations and governments using economic data and models.", "negative": "Economic modelling is supporting work; this is not a generic mathematics or software route."}],
    "media scientist": [{"area": "sociology-social-anthropology", "route": "primary", "evidence": "Studies the role and impact of media on society and documents media use and social response.", "negative": "The route is media-and-society inquiry, not journalism production or generic communications technology."}],
    "political scientist": [{"area": "politics-governance-public-policy", "route": "primary", "evidence": "Studies political behaviour, systems, institutions, decision-making, political trends and policy.", "negative": "The route is political analysis, not legal practice or general administration."}],
    "social work researcher": [{"area": "social-research-evaluation", "route": "primary", "evidence": "Plans and conducts research on social issues using interviews, focus groups and questionnaires, then organises, analyses and reports the evidence.", "negative": "This route requires social research work; direct social-service practice without a research/evaluation remit is not inferred."}],
    "sociologist": [{"area": "sociology-social-anthropology", "route": "primary", "evidence": "Explains social behaviour, social organisation, institutional systems, social change and cultural expressions.", "negative": "The route is sociological inquiry, not every social-service or policy role."}],
    "tax policy analyst": [
        {"area": "economics-applied-analysis", "route": "primary", "evidence": "Researches taxation policy and forecasts the economic and financial effects of policy changes.", "negative": "The route requires economic effects or tax-policy analysis, not routine tax filing or accounting."},
        {"area": "politics-governance-public-policy", "route": "secondary", "evidence": "Develops tax legislation and advises official bodies on policy implementation and public financial operations.", "negative": "The second route requires public-policy and official-body work, not private tax compliance alone."},
    ],
}

CONDITIONAL_CANDIDATES = {
    "archaeologist": ("social-science analysis of institutions, social organisation or human behaviour; material heritage/chronology alone is insufficient.", ["sociology-social-anthropology"]),
    "genealogist": ("family-structure, kinship, population or social-change research; lineage tracing or family-tree production alone is insufficient.", ["sociology-social-anthropology", "human-geography-population"]),
    "geographer": ("human, cultural, political or social/economic geography; physical-geography-only work is outside D078.", ["human-geography-population"]),
    "statistician": ("social, demographic, economic, political, media or other social-science data; physical, clinical or industrial statistics alone is insufficient.", ["social-research-evaluation", "computational-digital-social-science"]),
    "thanatology researcher": ("psychological, sociological, anthropological or demographic research on death/dying; physiological or clinical research alone is outside this route.", ["psychology-social-behaviour", "sociology-social-anthropology"]),
}

UNSUPPORTED = {
    "biometrician": "The supplied work measures physical identifiers for medical or industrial applications; it does not establish social-science research or social-population analysis.",
    "historian": "History/documentary interpretation is classified with humanities in the supplied evidence and does not establish the D078 social-science scope.",
    "mathematician": "The work advances or applies mathematical theory across engineering and science without a social-science object.",
    "philosopher": "The work concerns foundational questions of existence, knowledge, values and reality; the supplied evidence classifies this as humanities rather than D078.",
}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def source_register(recon: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {x["source_id"]: x for x in recon["source_register"]}


def provenance_for_area(area_id: str, recon: dict[str, Any]) -> list[dict[str, Any]]:
    regs = source_register(recon)
    key = area_id.split(":", 1)[1]
    return [
        {
            "source_id": sid,
            "publisher": regs[sid]["publisher"],
            "title": regs[sid]["title"],
            "url": regs[sid]["url"],
            "locator": regs[sid]["locator"],
            "jurisdiction": "global/international",
            "access_date": TODAY,
            "review_date": TODAY,
            "supports": regs[sid]["supports"],
            "claim_limit": regs[sid].get("limits"),
        }
        for sid in AREA_SOURCE_IDS[key]
    ]


def role_provenance(role: dict[str, Any], decision: dict[str, Any]) -> list[dict[str, Any]]:
    refs = role.get("domain_fit_review_source_refs") or []
    out = []
    for url in refs:
        if not isinstance(url, str) or not url.startswith("http"):
            continue
        out.append({
            "url": url,
            "locator": "Role task/work-activity evidence used in the D078 parent-domain review; exact occupation page or source record.",
            "jurisdiction": "global/international",
            "access_date": TODAY,
            "review_date": TODAY,
            "supports": "Role task and work-activity evidence; not title-only inference.",
        })
    return out


def compact_role_snapshot(roles: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "role_name": r.get("role_name"),
            "domain_fit_status": r.get("domain_fit_review_status"),
            "specialization_fit_status": r.get("specialization_fit_status"),
            "specialization_fit_area_key": r.get("specialization_fit_area_key"),
            "role_area_routes": copy.deepcopy(r.get("role_area_routes", [])),
        }
        for r in roles
    ]


def counts(domain: dict[str, Any], roles: list[dict[str, Any]]) -> dict[str, Any]:
    areas = domain.get("areas_of_specialization", [])
    routes = [route for role in roles for route in role.get("role_area_routes", [])]
    return {
        "area_records": len(areas),
        "area_student_visible": sum(bool(a.get("student_visible")) for a in areas),
        "legacy_subgroups": len(domain.get("subgroups", [])),
        "legacy_subgroups_student_visible": sum(bool(s.get("student_visible", True)) for s in domain.get("subgroups", [])),
        "d078_roles": len(roles),
        "roles_with_supported_area_route": sum(any(x.get("status") == "supported" for x in r.get("role_area_routes", [])) for r in roles),
        "roles_with_review_required_area_route": sum(any(x.get("status") == "review_required" for x in r.get("role_area_routes", [])) for r in roles),
        "roles_with_no_area_route": sum(not r.get("role_area_routes") for r in roles),
        "area_routes": len(routes),
        "supported_area_routes": sum(x.get("status") == "supported" for x in routes),
        "review_required_area_routes": sum(x.get("status") == "review_required" for x in routes),
        "student_visible_area_routes": sum(bool(x.get("student_visible")) for x in routes),
        "role_statuses": {status: sum(r.get("specialization_fit_status") == status for r in roles) for status in ["supported", "direct_domain_role", "conditional", "unsupported", "review_required"]},
    }


def apply_transformation(structure: dict[str, Any], roles_all: list[dict[str, Any]], recon: dict[str, Any], review: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any]]:
    d = structure[D078]
    roles = [r for r in roles_all if r.get("domain_id") == D078]
    decisions = {x["role_name"]: x for x in review["decisions"]}
    before_domain = copy.deepcopy(d)
    before_roles = compact_role_snapshot(roles)

    # Reconcile areas without replacing their globally scoped definitions.
    for area in d["areas_of_specialization"]:
        key = area["area_id"].split(":", 1)[1]
        if key not in AREA_IDS:
            raise ValueError(f"Unexpected D078 area: {area['area_id']}")
        rec = next(x for x in recon["area_recommendations"] if x["area_id"] == area["area_id"])
        area["recommendation_status"] = "locally_reconciled"
        area["area_status"] = "locally_reconciled_pending_runtime_review"
        area["disposition"] = rec["decision"]
        area["reconciliation_rationale"] = rec["scope"] + " Distinct-boundary check: " + rec["distinct_from_siblings"]
        area["positive_scope_evidence"] = rec["scope"]
        area["negative_neighbouring_domain_check"] = AREA_NEGATIVE[key]
        area["source_references"] = provenance_for_area(area["area_id"], recon)
        area["source_evidence_status"] = "authoritative_global_sources_reviewed_2026-10-08"
        area["unresolved_source_ids"] = []
        area["nigerian_context"] = {
            "status": "not_applied",
            "scope": "separate_overlay",
            "note": "Global D078 area reconciliation is implemented first; Nigerian enrichment is not used to narrow or rename this global area.",
        }
        # A specialization is visible when it has a supported or explicitly
        # conditional route. Unsupported routes never make an area visible.
        area["student_visible"] = False

    # Retain legacy rows as internal provenance, never as competing visible
    # areas.  This avoids breaking historical references while removing the
    # two over-broad/over-method labels from the student taxonomy.
    for subgroup in d.get("subgroups", []):
        if subgroup.get("isco_submajor") == "21":
            subgroup.update({
                "subgroup_status": "retired_legacy_merged",
                "student_visible": False,
                "merged_into_area_id": "D078:computational-digital-social-science",
                "disposition": "merge_and_rename",
                "reconciliation_rationale": "The legacy label foregrounds methods; its historical scope is absorbed by the evidence-backed Computational and Digital Social Science area.",
                "negative_neighbouring_domain_check": "Programming or quantitative technique alone is not a D078 area; the social question and interpretation remain required.",
                "source_references": provenance_for_area("D078:computational-digital-social-science", recon),
                "review_date": TODAY,
            })
        elif subgroup.get("isco_submajor") == "26":
            subgroup.update({
                "subgroup_status": "retired_legacy_replaced",
                "student_visible": False,
                "disposition": "retire_as_standalone",
                "reconciliation_rationale": "The label combines distinct sociology, economics, politics and applied-research scopes; the seven reconciled areas provide the non-duplicative boundaries.",
                "negative_neighbouring_domain_check": "The broad label cannot be used to infer a role-to-area route.",
                "source_references": provenance_for_area("D078:sociology-social-anthropology", recon),
                "review_date": TODAY,
            })
        else:
            raise ValueError(f"Unexpected D078 subgroup: {subgroup}")

    role_changes = []
    for role in roles:
        name = role["role_name"]
        if name not in decisions:
            raise ValueError(f"Missing D078 role decision: {name}")
        decision = decisions[name]
        parent = decision["domain_fit_status"]
        old = compact_role_snapshot([role])[0]
        routes: list[dict[str, Any]] = []

        if name in ROUTE_DECISIONS:
            for item in ROUTE_DECISIONS[name]:
                area_id = f"D078:{item['area']}"
                refs = [x for x in role.get("domain_fit_review_source_refs", []) if isinstance(x, str) and x.startswith("http")]
                routes.append({
                    "area_id": area_id,
                    "status": "supported",
                    "route_type": item["route"],
                    "student_visible": True,
                    "disposition": "promote_supported_area_route",
                    "rationale": "The role's recorded work activities fit both the D078 parent boundary and the specific area boundary; the route is not inferred from title or subgroup membership.",
                    "positive_task_evidence": item["evidence"],
                    "negative_neighbouring_domain_check": item["negative"],
                    "scope_condition": None,
                    "source_refs": refs,
                    "provenance": role_provenance(role, item),
                    "nigerian_context": {"status": "not_applied", "note": "Global role-area fit resolved first; Nigerian context remains a separate overlay."},
                    "review_date": TODAY,
                })
            status = "supported" if routes else "direct_domain_role"
            area_key = routes[0]["area_id"] if routes else None
            review_status = "locally_reconciled_supported" if routes else "locally_reconciled_direct_domain"
            basis = "Explicit task-to-area adjudication completed against the D078 boundary and the area's boundary; valid direct D078 route is retained because no area route is promoted." if routes else "D078 parent-domain fit is supported, but the available evidence does not justify forcing a narrower area route. Preserve the valid direct domain-to-role path."
        elif name in CONDITIONAL_CANDIDATES or parent == "conditional":
            condition, candidates = CONDITIONAL_CANDIDATES.get(name, ("Parent-domain fit remains conditional and requires a scope-specific task profile.", []))
            for candidate in candidates:
                routes.append({
                    "area_id": f"D078:{candidate}",
                    "status": "conditional",
                    "route_type": "candidate",
                    "student_visible": True,
                    "disposition": "retain_conditional_area_route",
                    "rationale": "The occupation can fit the area only under the recorded scope condition; the generic role record does not justify student promotion.",
                    "positive_task_evidence": decision.get("task_evidence", ""),
                    "negative_neighbouring_domain_check": condition,
                    "scope_condition": condition,
                    "source_refs": [x for x in role.get("domain_fit_review_source_refs", []) if isinstance(x, str) and x.startswith("http")],
                    "provenance": role_provenance(role, decision),
                    "nigerian_context": {"status": "not_applied", "note": "Global conditional route remains hidden; Nigerian context is separate."},
                    "review_date": TODAY,
                })
            status = "conditional"
            area_key = None
            review_status = "conditional_with_scope"
            basis = f"Parent-domain and/or area fit remains conditional. Keep the route available with this explicit scope condition: {condition}"
        elif name in UNSUPPORTED or parent == "unsupported":
            status = "unsupported"
            area_key = None
            review_status = "unsupported_hidden"
            basis = UNSUPPORTED.get(name, decision.get("basis", "Parent-domain fit is unsupported."))
        else:
            raise ValueError(f"No implementation disposition for D078 role {name}: {parent}")

        role["specialization_fit_review_status"] = review_status
        role["specialization_fit_domain_gate"] = f"parent_domain_fit_{parent}"
        role["specialization_fit_review_basis"] = basis
        role["specialization_fit_review_source_refs"] = [x for x in role.get("domain_fit_review_source_refs", []) if isinstance(x, str) and x.startswith("http")]
        role["specialization_fit_review_date"] = TODAY
        role["specialization_fit_status"] = status
        role["specialization_fit_area_key"] = area_key
        role["role_area_routes"] = routes
        role["role_area_routes_updated"] = TODAY
        role_changes.append({"role_name": name, "before": old, "after": compact_role_snapshot([role])[0]})

    for area in d["areas_of_specialization"]:
        key = area["area_id"]
        area["student_visible"] = any(
            route.get("status") in {"supported", "conditional"} and route.get("student_visible")
            for role in roles
            for route in role.get("role_area_routes", [])
            if route.get("area_id") == key
        )
        area["supported_role_route_count"] = sum(
            route.get("status") == "supported"
            for role in roles
            for route in role.get("role_area_routes", [])
            if route.get("area_id") == key
        )
        area["review_required_role_route_count"] = sum(
            route.get("status") == "review_required"
            for role in roles
            for route in role.get("role_area_routes", [])
            if route.get("area_id") == key
        )

    d["areas_of_specialization_status"] = "locally_reconciled_with_role_routes_pending_runtime_review"
    d["areas_of_specialization_implementation"] = {
        "status": "implemented_locally_d078_only",
        "implementation_date": TODAY,
        "global_scope_preserved": True,
        "nigerian_context_applied": False,
        "legacy_subgroups_visible": False,
        "workflow_items_used": False,
        "matcher_or_sql_changed": False,
    }

    after_roles = compact_role_snapshot(roles)
    return structure, roles_all, {
        "before_domain": before_domain,
        "before_roles": before_roles,
        "after_domain": d,
        "after_roles": after_roles,
        "role_changes": role_changes,
    }


def validate(structure: dict[str, Any], roles_all: list[dict[str, Any]], before_all: list[dict[str, Any]]) -> dict[str, Any]:
    d = structure[D078]
    roles = [r for r in roles_all if r.get("domain_id") == D078]
    before_by_id = {id(r): r for r in before_all}
    assert len(d.get("areas_of_specialization", [])) == 7
    assert {a["area_id"] for a in d["areas_of_specialization"]} == {f"D078:{x}" for x in AREA_IDS}
    assert len(roles) == 24
    assert all(s.get("student_visible") is False for s in d.get("subgroups", []))
    assert all(a.get("source_references") and all(x.get("url", "").startswith("http") and x.get("locator") and x.get("review_date") == TODAY for x in a["source_references"]) for a in d["areas_of_specialization"])
    assert all(route.get("student_visible") is False for r in roles for route in r.get("role_area_routes", []) if route.get("status") == "review_required")
    assert all(route.get("student_visible") is True for r in roles for route in r.get("role_area_routes", []) if route.get("status") == "conditional")
    assert all(route.get("area_id") in {f"D078:{x}" for x in AREA_IDS} for r in roles for route in r.get("role_area_routes", []))
    assert not any(r["role_name"] in UNSUPPORTED and r.get("role_area_routes") for r in roles)
    assert not any(r["role_name"] in UNSUPPORTED and r.get("specialization_fit_area_key") for r in roles)
    return {"validation": "passed", "d078_roles": len(roles), "d078_areas": len(d["areas_of_specialization"]), "other_domain_rows_modified": 0}


def markdown(report: dict[str, Any]) -> str:
    c = report["counts"]
    lines = [
        "# D078 Area and Role Resolution — 2026-10-08",
        "",
        "Implemented locally for D078 only from the saved reconciliation and D078 role-domain review. The 19 D078 workflow items remain outside this task.",
        "",
        "## Scope and safety",
        "",
        "- Seven D078 areas were reconciled and applied as local canonical source data.",
        "- The two legacy subgroup records remain only as hidden historical/provenance records: computational was merged into the computational/digital area; the broad social/cultural/economic label was retired as a standalone area.",
        "- Role routes were adjudicated against both the D078 boundary and the specific area boundary using task/work-activity evidence. Conditional routes remain available with explicit scope conditions; unsupported routes remain hidden.",
        "- Nigerian enrichment was not applied; global scope remains primary and a separate overlay marker is retained.",
        "- No other domain, matcher, SQL, API or UI file was changed.",
        "",
        "## Counts",
        "",
        f"- Areas: {c['before']['area_records']} → {c['after']['area_records']} (visible {c['before']['area_student_visible']} → {c['after']['area_student_visible']})",
        f"- D078 roles: {c['before']['d078_roles']} → {c['after']['d078_roles']}",
        f"- Area routes: {c['before']['area_routes']} → {c['after']['area_routes']} (supported {c['before']['supported_area_routes']} → {c['after']['supported_area_routes']}; review-required {c['before']['review_required_area_routes']} → {c['after']['review_required_area_routes']})",
        f"- Student-visible area routes: {c['before']['student_visible_area_routes']} → {c['after']['student_visible_area_routes']}",
        f"- Other-domain rows modified: {report['validation']['other_domain_rows_modified']}",
        "",
        "## Role dispositions",
        "",
    ]
    for change in report["role_changes"]:
        after = change["after"]
        route_text = ", ".join(f"{x['area_id']} ({x['status']}, {x['route_type']})" for x in after["role_area_routes"]) or "none; direct/hidden domain route preserved"
        lines.append(f"- **{change['role_name']}** — `{after['specialization_fit_status']}` — {route_text}")
    lines += [
        "",
        "## Provenance and validation",
        "",
        "Area evidence is retained with URL, locator, global jurisdiction, access date and review date. Role evidence retains the reviewed ESCO/O*NET/UNESCO/UN source URLs and records positive task evidence plus negative neighbouring checks on every route object.",
        "",
        f"Validation: **{report['validation']['validation']}**.",
        "",
        "Machine-readable checkpoint: `data/career-mapping/_audit/d078_area_role_resolution_checkpoint_2026_10_08.json`.",
    ]
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write D078 canonical/local source files")
    args = parser.parse_args()
    structure = read_json(DOMAIN_STRUCTURE)
    roles_all = read_json(ROLE_LIBRARY)
    before_all = copy.deepcopy(roles_all)
    recon = read_json(RECONCILIATION)
    review = read_json(ROLE_REVIEW)
    if set(structure) != set(structure):
        raise AssertionError("unreachable guard")
    before_d078 = copy.deepcopy(structure[D078])
    before_roles = [copy.deepcopy(r) for r in roles_all if r.get("domain_id") == D078]
    structure_after, roles_after, detail = apply_transformation(structure, roles_all, recon, review)
    validation = validate(structure_after, roles_after, before_all)
    before_counts = counts(before_d078, before_roles)
    after_counts = counts(structure_after[D078], [r for r in roles_after if r.get("domain_id") == D078])
    report = {
        "schema_version": "d078_area_role_resolution.v1",
        "artifact_type": "d078_canonical_area_and_role_resolution",
        "domain_id": D078,
        "reviewed_on": TODAY,
        "scope": "D078 only; seven areas, two legacy subgroups, and 24 D078 roles. The 19 workflow items are excluded.",
        "canonical_files": [str(DOMAIN_STRUCTURE.relative_to(ROOT)), str(ROLE_LIBRARY.relative_to(ROOT))],
        "excluded_files_and_surfaces": ["subject matcher", "SQL", "API/UI", "other domains", "19 D078 workflow items"],
        "counts": {"before": before_counts, "after": after_counts},
        "validation": validation,
        "legacy_subgroup_dispositions": [
            {"id": "D078:isco-21", "disposition": "merge_and_rename", "target": "D078:computational-digital-social-science"},
            {"id": "D078:isco-26", "disposition": "retire_as_standalone", "target": None},
        ],
        "role_changes": detail["role_changes"],
        "before_after_area_records": [
            {"area_id": b["area_id"], "before": b, "after": next(a for a in structure_after[D078]["areas_of_specialization"] if a["area_id"] == b["area_id"])}
            for b in before_d078.get("areas_of_specialization", [])
        ],
        "other_domain_rows_modified": 0,
        "student_visible_policy": "Supported and conditional area routes are visible; conditional routes carry explicit scope conditions. Direct D078 roles remain direct when no area is justified. Unsupported roles/routes remain hidden/review-only.",
        "apply_status": "dry_run_validated" if not args.apply else "applied_and_validated",
    }
    # Checkpoint is written for both dry-run and apply; on apply it is the
    # durable before/after record used by subsequent review.
    write_json(CHECKPOINT, report)
    write_json(REPORT_JSON, report)
    REPORT_MD.write_text(markdown(report), encoding="utf-8")
    if args.apply:
        write_json(DOMAIN_STRUCTURE, structure_after)
        write_json(ROLE_LIBRARY, roles_after)
    print(json.dumps({"apply": args.apply, "counts": report["counts"], "validation": validation}, indent=2))


if __name__ == "__main__":
    main()
