"""Build exact-key D082 customer-service role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D082_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D082_role_domain_fit_review_2026_10_05.md"
BLS_RECEPTION = "https://www.bls.gov/ooh/office-and-administrative-support/receptionists.htm"
BLS_CUSTOMER = "https://www.bls.gov/ooh/Office-and-Administrative-Support/Customer-service-representatives.htm"
BLS_INFO = "https://www.bls.gov/ooh/office-and-administrative-support/information-clerks.htm"
BLS_DISPATCH = "https://www.bls.gov/ooh/office-and-administrative-support/police-fire-and-ambulance-dispatchers.htm"
BLS_CONCIERGE = "https://www.bls.gov/ooh/personal-care-and-service/concierges.htm"
BLS_MEDICAL = "https://www.bls.gov/ors/factsheet/medical-secretaries-and-administrative-assistants.htm"

DECISIONS = {
    "camping ground operative": ("supported", "The supplied task explicitly includes customer care at a campsite, an in-person service assignment in the defined customer-service scope."),
    "customer contact centre information clerk": ("supported", "The task answers customer inquiries by phone/email and provides information about services, directly matching contact-centre customer support."),
    "customer service representative": ("supported", "The task handles customer complaints, satisfaction information and service recovery, directly matching customer-service work."),
    "emergency medical dispatcher": ("supported", "The task receives emergency calls, gathers location/incident details and dispatches ambulance or paramedic resources, directly matching emergency call handling and dispatch."),
    "front line medical receptionist": ("supported", "The task greets/checks in patients, collects notes and schedules appointments, directly matching medical reception and patient-facing service."),
    "hospitality establishment receptionist": ("supported", "The task is the first guest contact, handles bookings/payments and provides information, directly matching reception and customer service."),
    "hotel concierge": ("supported", "The task provides information and personalised assistance to hotel guests, directly matching the customer-support scope."),
    "live chat operator": ("supported", "The task responds to customer requests in real time through online service channels, directly matching digital contact-centre support."),
    "market research interviewer": ("unsupported", "The task collects customer opinions/preferences for market research. Research data collection is not customer support, reception or contact-centre service resolution."),
    "medical administrative assistant": ("supported", "The task schedules appointments, handles correspondence and answers patient queries, directly matching healthcare customer/patient administration."),
    "medical practice manager": ("conditional", "The task manages a practice's staff and daily operations; the supplied description does not establish that the manager personally performs patient-facing service or contact-centre work.", "Retain only where the role includes substantive front-desk, patient-service or contact-centre responsibility; general practice operations management alone is insufficient."),
    "medical transcriptionist": ("unsupported", "The task transcribes and formats clinician dictation into records. It supports documentation but does not establish customer/patient contact or service handling."),
    "night auditor": ("supported", "The task includes night-time guest care and front-desk activities; the additional bookkeeping does not negate its direct hospitality-service function."),
    "receptionist": ("supported", "The task answers calls, greets visitors, provides information and directs people, directly matching the domain's reception and service scope."),
    "survey enumerator": ("unsupported", "The task conducts interviews and records survey responses for data collection; it is not customer-service support or complaint resolution."),
    "telephone switchboard operator": ("supported", "The task routes telephone connections and answers customer inquiries/service-problem reports, directly matching phone-based service and information handling."),
    "veterinary receptionist": ("supported", "The task schedules appointments and receives clients in a veterinary practice, directly matching reception and customer service."),
}


def _urls(refs: list[str]) -> list[str]:
    urls = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            urls.append(url)
    return list(dict.fromkeys(urls))


def build() -> dict:
    q = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in q["role_mappings"] if r["domain_id"] == "D082"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    choices = {n.casefold(): (n, *v) for n, v in DECISIONS.items()}
    if len(rows) != 17 or len(by_name) != 17 or set(by_name) != set(choices):
        raise SystemExit(f"D082 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    sources = [BLS_RECEPTION, BLS_CUSTOMER, BLS_INFO, BLS_DISPATCH, BLS_CONCIERGE, BLS_MEDICAL]
    decisions = []
    for folded, (name, status, basis, *_extra) in choices.items():
        row = by_name[folded]
        refs = _urls(row["task_source_refs"])
        refs.extend(sources)
        condition = ("Include only if the role includes substantive front-desk, patient-service or contact-centre responsibility; general practice operations management alone is insufficient."
                     if status == "conditional" else None)
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"],
                          "domain_fit_status": status, "task_evidence": row["role_task_text"],
                          "basis": basis, "conditional_scope": condition,
                          "source_refs": list(dict.fromkeys(refs)),
                          "source_limit": "BLS sources corroborate service/administrative task boundaries in the US occupational system; ESCO/O*NET/local task text identifies each mapped task. They do not establish Nigerian demand or local professional requirements. Parent-domain fit only; no subgroup/specialization assessment.",
                          "recommended_action": "retain_parent_domain_link_candidate" if status == "supported" else ("remove_parent_domain_link_candidate" if status == "unsupported" else "retain_only_with_task_scope_condition")})
    c = Counter(d["domain_fit_status"] for d in decisions)
    return {"schema_version": 1, "domain_id": "D082", "domain_name": "Customer Service and Contact Centre Operations",
            "scope": "D082 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
            "domain_scope": rows[0]["parent_domain_scope"],
            "method": "Compared the exact role tasks to helping customers by phone, digital channel, reception desk or service counter, resolving inquiries/complaints, providing information and dispatching emergency calls. Research interviewing, transcription and generic operations management are not treated as customer service merely because they involve people or records; a manager is conditional on substantive service duties.",
            "scope_sources": sources,
            "counts": {"reviewed_role_mappings": len(decisions), **{s: c.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
            "unresolved_fit_decisions": c.get("unresolved", 0), "decisions": decisions,
            "canonical_changes": 0, "canonical_correction_ready": False,
            "correction_note": "Review artifact only. No canonical taxonomy or specialization data was edited."}


def main() -> None:
    p = build()
    OUT_JSON.write_text(json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = p["counts"]
    lines = ["# D082 — Customer Service and Contact Centre Operations: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/17 exact mappings reviewed against supplied tasks and stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|", *[f"| {s.title()} | {c[s]} |" for s in ("supported", "conditional", "unsupported", "unresolved")],
             "", "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" for d in p["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"BLS profiles define [receptionist]({BLS_RECEPTION}) work (calls, visitors, information and appointments), [customer-service representative]({BLS_CUSTOMER}) work (questions, complaints and service channels), [information clerk]({BLS_INFO}) duties, [public-safety dispatch]({BLS_DISPATCH}), [concierge]({BLS_CONCIERGE}) support, and [medical administrative support]({BLS_MEDICAL}). These are task-boundary references, not Nigerian demand or licensing claims.",
                  "", "Market research interviews and survey enumeration collect research data rather than provide service; medical transcription is record production; medical-practice management is conditional on actual frontline service duties.",
                  "", f"- Exact queue coverage: {c['reviewed_role_mappings']}/17; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.", "- Canonical taxonomy files were not edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
