"""Exact-key D127 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D127_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D127_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D127 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "UNESCO_ECCE_SCOPE": {"publisher": "UNESCO", "url": "https://www.unesco.org/en/early-childhood-education/need-know", "locator": "Early childhood care and education scope, birth through early childhood, holistic and inclusive pre-primary education, developmentally appropriate pedagogy, links to health/nutrition/social services.", "supports": "Global education-sector definition and scope for early-childhood care and education.", "limit": "Age cutoffs and entry into primary school vary by context; this audit follows the D127 parent scope, not a universal age boundary."},
    "ILO_ISCO_EARLY_CHILDHOOD_TASKS": {"publisher": "International Labour Organization", "url": "https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40dgreports/%40stat/documents/publication/wcms_896661.pdf", "locator": "ISCO-08 interpretive guidance section 2.4.2: early-childhood educators plan, organize and conduct educational/play activities for children below primary-school age; child-care workers provide care and supervision; teachers' aides assist teaching staff.", "supports": "International task distinction among early-childhood education, child care and teaching assistance.", "limit": "Classification is corroboration only; decisions use actual task descriptions and the D127 parent scope."},
}

DECISIONS = {
    "Childcare Workers": ("supported", "Provides direct care and supervision of children in schools, homes and childcare institutions, matching the parent’s childcare scope."),
    "Education Administrators, Kindergarten through Secondary": ("conditional", "The role spans kindergarten through secondary administration, but its task does not establish that this particular post manages early-childhood or pre-primary provision."),
    "Education and Childcare Administrators, Preschool and Daycare": ("supported", "Directly manages preschool/daycare education and care services, within the exact D127 scope."),
    "Farmworkers and Laborers, Crop, Nursery, and Greenhouse": ("unsupported_for_domain", "Performs crop and nursery production; the word nursery here means plant cultivation, not nursery/early-childhood education or childcare."),
    "Kindergarten Teachers, Except Special Education": ("supported", "Teaches academic and social skills at kindergarten level, an explicit early-years teaching task."),
    "Preschool Teachers, Except Special Education": ("supported", "Teaches preschool-aged children through activities supporting social, physical and intellectual growth; direct fit."),
    "au pair": ("supported", "Provides in-home childcare for a host family; direct fit to the parent’s private-home childcare setting."),
    "babysitter": ("supported", "Provides short-term direct childcare, play supervision and age-appropriate daily care in the family home."),
    "child care coordinator": ("supported", "Organizes childcare programmes and activities and maintains children's safety; direct fit to childcare service coordination."),
    "child care social worker": ("conditional", "Provides child/family welfare, protection and placement services, but the task does not specify early-childhood age or nursery/pre-primary work."),
    "child care worker": ("supported", "Provides children's basic care and supervised play in preschools, day-care settings, agencies or homes; direct fit."),
    "child day care centre manager": ("supported", "Leads a childcare facility and its staff; the exact setting and operational remit are within the parent scope."),
    "child day care worker": ("supported", "Provides daytime care to children in a childcare setting, directly matching D127."),
    "early years special educational needs teacher": ("supported", "Delivers adapted instruction to young children with disabilities at kindergarten level, within inclusive early-childhood education."),
    "early years teacher": ("supported", "Plans and delivers early-years instruction and play that develops young children's social and intellectual skills."),
    "early years teaching assistant": ("supported", "Assists early-years teachers with instruction, classroom supervision and daily schedules; direct early-years educational support."),
    "nanny": ("supported", "Provides in-home childcare, daily routines and age-appropriate play for children; direct fit to the parent’s home-care setting."),
    "nursery school head teacher": ("supported", "Manages nursery/kindergarten operations, staff, admissions and age-appropriate curriculum; direct fit."),
    "residential childcare worker": ("supported", "Provides care and developmental support to children in a residential setting. The task names children but not age; because the parent explicitly includes childcare and child development, retain as supported for the childcare function, not as an assertion that every post serves preschool-age children."),
    "special educational needs assistant": ("conditional", "Supports disabled students' personal and instructional needs, but the task gives no age/early-years setting; fit depends on assignment to early-childhood provision."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D127"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D127 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE"]
        if fit != "unresolved":
            refs.extend(["UNESCO_ECCE_SCOPE", "ILO_ISCO_EARLY_CHILDHOOD_TASKS"])
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D127", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare actual duties with early-childhood care, childcare, preschool/nursery education and development. UNESCO gives global ECCE framing; ILO distinguishes early-childhood educational work, childcare supervision and teaching assistance. A role title, ISCO group or overlapping child-related language is not sufficient. Conditional means child-facing work is real but early-years context is not established.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All exact D127 role keys were checked against the queue, and task descriptions are retained verbatim.", "The crop/nursery/greenhouse farmworker is excluded: nursery refers to plant production, not childcare.", "Secondary-inclusive education administration and age-unspecified child welfare/special-needs assistance remain conditional unless an early-years assignment is documented.", "Age ranges and school-entry boundaries vary between systems; this fit review does not impose a single global legal cutoff.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D127 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
