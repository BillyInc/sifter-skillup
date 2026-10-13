"""Exact-key D130 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D130_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D130_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D130 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "ILO_PRIVATE_EMPLOYMENT_AGENCIES": {"publisher": "International Labour Organization", "url": "https://www.ilo.org/resource/other/c181-private-employment-agencies-convention-1997", "locator": "Convention No. 181, Article 1: private employment-agency services include matching job offers and applications and other jobseeking services; workers includes jobseekers.", "supports": "International scope for recruitment/placement, job matching and jobseeker-support services.", "limit": "Convention scope is legal/institutional context and does not determine each role's fit by itself."},
    "ILO_PUBLIC_EMPLOYMENT_SERVICE": {"publisher": "International Labour Organization", "url": "https://www.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:12100:0::NO::P12100_INSTRUMENT_ID:312233", "locator": "Employment Service Convention No. 88, public employment-service responsibilities and cooperation with private employment agencies.", "supports": "Global institutional context for public employment services and labour-market matching.", "limit": "International convention obligations depend on ratification and national implementation; used here for occupational context, not legal advice."},
    "ILO_ISCO_HR_TASKS": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Group 1212 Human Resource Managers: personnel policies and recruitment/training/promotion procedures; medical/employment-service and recruitment manager examples in related definitions.", "supports": "Recruitment as a recognizable component of some HR roles, while distinguishing the broader HR remit.", "limit": "A broad HR title does not prove recruitment duties; each disposition follows the actual task text."},
}

DECISIONS = {
    "Human Resources Assistants, Except Payroll and Timekeeping": ("conditional", "Maintains personnel and employment records, but the task does not state recruiting, screening, candidate placement or jobseeker services. It fits only where the role's actual assignment includes recruitment administration."),
    "Human Resources Managers": ("conditional", "Coordinates broad HR activities without specifying recruitment or candidate matching. The D130 parent is recruitment/employment services, so the generic HR management task is not enough for unconditional fit."),
    "Human Resources Specialists": ("supported", "Explicitly recruits, screens, interviews and places candidates; direct recruitment function."),
    "employer branding specialist": ("supported", "Builds and promotes the employer brand to attract job candidates; directly supports candidate attraction/recruitment."),
    "employment agent": ("supported", "Matches jobseekers to vacancies and advises on job search; direct employment-service work."),
    "employment and vocational integration consultant": ("supported", "Guides jobseekers to jobs/training, prepares CVs and interviews, and advises on job search; direct employment-support service."),
    "employment programme coordinator": ("conditional", "Develops and coordinates employment-policy/programme initiatives addressing unemployment, but the task does not specify operating a job-placement or recruitment service."),
    "employment services manager": ("supported", "Leads recruiters and employment-service operations to achieve hiring targets; direct domain management."),
    "employment support worker": ("supported", "Helps unemployed and job-seeking clients prepare CVs, find vacancies, contact employers and prepare for interviews; direct employment service."),
    "executive search consultant": ("supported", "Identifies and recruits senior executives for client organizations; direct specialist recruitment."),
    "human resources assistant": ("supported", "Screens CVs and prepares recruitment processes/communications; direct recruitment administration."),
    "human resources manager": ("supported", "Explicitly develops and manages recruiting, interviewing and selection processes, alongside broader HR functions."),
    "human resources officer": ("supported", "Advertises vacancies, recruits, interviews and shortlists candidates, including agency liaison; direct recruitment work."),
    "public employment service manager": ("supported", "Manages a public employment agency whose staff place jobseekers and provide occupational guidance; direct employment-service leadership."),
    "recruitment consultant": ("supported", "Matches candidates to client vacancies across permanent, contract and temporary placements; direct fit."),
    "talent acquisition manager": ("supported", "Manages recruitment processes, interviews and candidate sourcing; direct talent-acquisition leadership."),
    "talent acquisition specialist": ("supported", "Sources, attracts and hires candidates through the full recruitment lifecycle; direct fit."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D130"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D130 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": ["QUEUE_TASK_PROFILE", "ILO_PRIVATE_EMPLOYMENT_AGENCIES", "ILO_PUBLIC_EMPLOYMENT_SERVICE", "ILO_ISCO_HR_TASKS"]})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D130", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare duties with job matching, recruitment, candidate attraction/selection, jobseeker support, employment guidance and employment-service operations. ILO employment-service conventions and ISCO task definitions provide international context. Generic HR work is not treated as recruitment unless the role task establishes that link.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All exact D130 role keys and tasks were checked against the lane queue.", "Three broad/general records are conditional because the task does not establish recruitment or job matching: HR assistant (records-only profile), generic HR manager, and employment-programme policy coordinator.", "The HR roles with explicit recruitment/sourcing duties are supported; broad role family membership is not used as a substitute for task evidence.", "This is occupational-domain fit, not labour-law compliance or professional certification review.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D130 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
