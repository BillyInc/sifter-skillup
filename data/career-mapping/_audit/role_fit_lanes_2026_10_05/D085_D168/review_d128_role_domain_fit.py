"""Exact-key D128 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D128_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D128_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D128 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "IFSW_GLOBAL_DEFINITION": {"publisher": "International Federation of Social Workers (IFSW)", "url": "https://www.ifsw.org/what-is-social-work/global-definition-of-social-work/", "locator": "Global definition and commentary: social change/development, social cohesion, empowerment, vulnerable groups, human rights and well-being at individual, family, group, community and societal levels.", "supports": "International professional scope for social work and community/social welfare practice.", "limit": "The definition is a profession-wide framework, not a credential or jurisdiction-specific scope-of-practice law."},
    "ILO_ISCO08_SOCIAL_WORK": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Group 3412 and related social-work task definitions: assessing needs, linking clients to housing/day care/community resources, crisis intervention, youth/social-service programmes and monitoring interventions.", "supports": "International task context for social-work associate functions and social assistance programmes.", "limit": "Classification is corroboration only; exact tasks, not group membership, determine the audit disposition."},
}

DECISIONS = {
    "adult community care worker": ("supported", "Assesses adults with impairments or recovering conditions and coordinates community care so they can live safely and independently; direct community social-support work."),
    "child care social worker": ("supported", "Supports children and families, protects children from abuse/neglect and arranges foster/adoption services; direct child and family welfare."),
    "child care worker": ("supported", "Provides children's basic care and supervision in homes and childcare settings; direct child/family support within the broad social-welfare remit."),
    "child day care worker": ("supported", "Provides daytime care and social support to children and families, matching the domain's child/youth and social-service scope."),
    "community development officer": ("supported", "Assesses community needs, plans quality-of-life improvements and mobilizes resources; direct community development work."),
    "community development social worker": ("supported", "Organizes and supports communities experiencing social/economic disadvantage to address inequality and build local capacity; direct fit."),
    "community social worker": ("supported", "Supports excluded or disadvantaged groups, addresses integration barriers and advocates with public bodies; direct social-welfare practice."),
    "consultant social worker": ("supported", "Improves social-work and social-care practice through service development, policy, training and research; direct professional-domain function."),
    "criminal justice social worker": ("supported", "Works with offenders, victims and communities on risk reduction, rehabilitation, reintegration and support; direct social-welfare work with vulnerable groups."),
    "crisis situation social worker": ("supported", "Assesses risk and provides emergency support and stabilization to people in crisis; direct social-service and protection work."),
    "elderly home manager": ("supported", "Leads residential elder-care services and staff for people needing support due to ageing; directly matches social-care service management."),
    "foster care support worker": ("supported", "Supports protection and placement of abused children in suitable foster families; direct child-welfare and safeguarding work."),
    "gerontology social worker": ("supported", "Assesses older people's psychosocial needs and connects them and their families with community resources; direct social work with a vulnerable population."),
    "hospital social worker": ("supported", "Counsels patients/families on illness-related psychosocial and financial issues and coordinates discharge/support; social-work function in a hospital setting."),
    "mental health social worker": ("supported", "Provides counselling, advocacy, crisis intervention and recovery support to people with mental-health or substance-use challenges; direct social-welfare practice."),
    "migrant social worker": ("supported", "Guides migrants through integration, rights, eligibility and service referrals, and advocates with employers; direct community inclusion and welfare work."),
    "public housing manager": ("supported", "Identifies social-housing needs, allocates resources and develops housing policy for people in need; directly within social welfare and public-housing services."),
    "social services manager": ("supported", "Leads staff and resources delivering social services under relevant policies and legislation; direct domain management."),
    "youth centre manager": ("supported", "Runs youth/children's residential or community services, counselling and care programmes; direct youth-service management."),
    "youth programme director": ("supported", "Develops youth well-being programmes and coordinates education, recreation and counselling partners; direct youth-services work."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D128"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D128 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "IFSW_GLOBAL_DEFINITION", "ILO_ISCO08_SOCIAL_WORK"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D128", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare each task with social welfare, community development, child/family protection, vulnerable-population support, housing/social services and youth services. IFSW professional scope and ILO task definitions corroborate the boundary; classifications, titles and current placement alone do not establish fit.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All exact D128 role keys and task descriptions were checked against the lane queue.", "The parent scope is broad: it includes vulnerable adults, children/families, community work, elderly residential care, public housing, youth services and social-service management. Each reviewed task has a concrete connection to one of these elements.", "Hospital setting does not by itself negate social-work fit where the actual task is psychosocial support, advocacy and care coordination.", "This is a taxonomy-fit audit, not a professional licensing, qualification or service-quality determination.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D128 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        why = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {why} |")
    lines += ["", "## Sources and limits", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
