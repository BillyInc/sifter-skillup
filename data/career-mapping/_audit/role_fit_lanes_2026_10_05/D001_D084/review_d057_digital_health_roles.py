"""Build the exact-key D057 Digital Health parent-domain role review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D057_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D057_role_domain_fit_review_2026_10_05.md"

WHO_SCOPE = "https://www.who.int/europe/health-topics/digital-health"
WHO_CLASSIFICATION = "https://www.who.int/publications/i/item/9789240081949"
WHO_TELEMEDICINE = "https://www.who.int/publications/i/item/9789240059184"
ONET_HIT = "https://www.onetonline.org/link/details/15-1211.01"
ONET_HITM = "https://www.onetonline.org/link/details/29-9021.00"
ONET_RECORDS = "https://www.onetonline.org/link/details/29-2072.00"
AHIMA_HIM = "https://www.ahima.org/certification-careers/certifications-overview/career-tools/career-pages/health-information-101/"

SUPPORTED = {
    "clinical coder": "The task is clinical-record interpretation and health classification coding, directly within the domain's stated patient-record and coding work.",
    "clinical informatics manager": "The task leads information systems used in medical institutions and applies clinical knowledge to improve services; it directly matches health informatics.",
    "Health Informatics Specialists": "The O*NET task profile explicitly designs, develops, modifies, and implements computerized healthcare systems.",
    "medical records clerk": "The task manages patient records and transfers information into electronic templates, directly matching health-information work.",
    "medical records manager": "The task manages and secures medical-record operations and patient data, directly matching health-information management.",
    "Medical Records Specialists": "The O*NET task profile compiles and maintains patient records and classifies/codes diagnoses and procedures.",
    "picture archiving and communication systems administrator": "The task administers a clinical imaging information system and manages access to digital medical images.",
}

CONDITIONAL = {
    "digital health product manager": "The described work fits digital-health product development, but this exact role/task profile has no occupational source in the local record. Keep conditional until a reliable employer or professional source validates the role and healthcare-specific remit.",
    "electronic health records specialist": "EHR implementation fits the domain, but the exact title/task profile has no source locator in the local record. Keep conditional until a reliable occupational or professional source validates this role profile.",
    "health informatics specialist": "The task is directly relevant, but this unsourced lowercase record overlaps the separately sourced O*NET Health Informatics Specialists entry. Keep conditional pending identity/source reconciliation; do not count it as a distinct established occupation yet.",
    "healthcare institution manager": "The current duties describe general hospital and care-facility operations, not digital health or informatics. Include only where the actual post owns health-information systems or digital transformation; otherwise it belongs outside this domain.",
    "mHealth developer": "The described mobile-health application work fits the domain, but this exact occupational title/task profile lacks a source locator. Keep conditional pending a reliable occupational/employer source validating the role profile.",
    "telemedicine coordinator": "Remote-care coordination fits the domain, but this exact occupational title/task profile lacks a source locator. Keep conditional pending a reliable source validating the role title and duties.",
}

UNSUPPORTED = {
    "waiting list coordinator": "The supplied task is waiting-list and operating-room scheduling/resource coordination. It does not establish digital-health, health-information, or telemedicine duties; routine healthcare setting alone is insufficient for this domain.",
}


def source_urls(refs: list[str]) -> list[str]:
    urls = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        urls.append(url)
    return list(dict.fromkeys(urls))


def main() -> None:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D057"]
    by_name = {r["role_name"]: r for r in rows}
    expected = set(SUPPORTED) | set(CONDITIONAL) | set(UNSUPPORTED)
    if len(rows) != 14 or len(by_name) != 14 or set(by_name) != expected:
        raise SystemExit(f"D057 exact queue changed: {len(rows)} rows; keys={sorted(by_name)}")

    decisions = []
    for name, row in sorted(by_name.items()):
        if name in SUPPORTED:
            status, basis, condition, action = "supported", SUPPORTED[name], None, "retain_parent_domain_link_candidate"
        elif name in CONDITIONAL:
            status, basis, condition, action = "conditional", CONDITIONAL[name], CONDITIONAL[name], "do_not_present_as_confirmed_D057_role_until_condition_is_met"
        else:
            status, basis, condition, action = "unsupported", UNSUPPORTED[name], None, "remove_D057_parent_domain_link_candidate_after_cross_lane_reconciliation"

        refs = source_urls(row["task_source_refs"])
        refs.extend([WHO_SCOPE, WHO_CLASSIFICATION])
        if name in {"telemedicine coordinator", "picture archiving and communication systems administrator"}:
            refs.append(WHO_TELEMEDICINE)
        if name in {"Health Informatics Specialists", "clinical informatics manager", "health informatics specialist", "electronic health records specialist"}:
            refs.extend([ONET_HIT, ONET_HITM])
        if name in {"clinical coder", "medical records clerk", "medical records manager", "Medical Records Specialists"}:
            refs.extend([ONET_RECORDS, AHIMA_HIM])
        refs = list(dict.fromkeys(refs))
        decisions.append({
            "role_key": row["role_key"],
            "role_name": name,
            "domain_fit_status": status,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "conditional_scope": condition,
            "source_refs": refs,
            "source_limit": "WHO sources define the digital-health boundary and intervention/system categories; they do not certify individual job titles. O*NET and AHIMA corroborate relevant health-informatics and records tasks where cited. Conditional entries remain unconfirmed until their exact role profile or remit is sourced. No subgroup membership or title similarity was used to infer fit.",
            "recommended_action": action,
        })

    counts = Counter(d["domain_fit_status"] for d in decisions)
    payload = {
        "schema_version": 1,
        "domain_id": "D057",
        "domain_name": "Digital Health and Health Technology",
        "scope": "D057 only; exact role-task fit against the stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed every exact D057 key in the regenerated D045-D084 queue. Compared the role's task text to the stored domain scope and checked authoritative WHO digital-health classifications plus O*NET/AHIMA occupational task sources where relevant. ISCO/subgroup, title similarity, and cross-domain repetition were not used as fit evidence.",
        "scope_sources": [WHO_SCOPE, WHO_CLASSIFICATION, WHO_TELEMEDICINE],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": 0,
        "conditional_source_or_identity_cases": len(CONDITIONAL),
        "decisions": decisions,
        "canonical_changes": 0,
        "canonical_correction_ready": False,
        "correction_note": "Seven task profiles are supported for D057; six need role-source/identity or digital-health remit qualification; waiting-list coordination lacks digital-health tasks. Candidate removal/qualification recommendations are not applied to shared canonical data while this role lane is active.",
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D057 — Digital Health and Health Technology: role-to-parent fit", "",
        "**Slice:** 14/14 exact role mappings reviewed against role-task text and the parent-domain scope. No subgroup or role-to-specialization decisions; canonical mappings unchanged.", "",
        "| Disposition | Count |", "|---|---:|",
        f"| Supported | {counts['supported']} |", f"| Conditional | {counts['conditional']} |",
        f"| Unsupported | {counts['unsupported']} |", "| Unresolved fit decisions | 0 |", "",
        "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']} |" for d in decisions)
    lines.extend([
        "", "## Evidence and limits", "",
        f"[WHO digital health overview]({WHO_SCOPE}) defines digital health as development/use of digital technologies to improve health and includes health information systems and telemedicine. [WHO CDISAH classification]({WHO_CLASSIFICATION}) catalogs digital-health interventions and services, including electronic records and telehealth systems. [WHO telemedicine implementation guide]({WHO_TELEMEDICINE}) supports telemedicine as a digital-health service area.",
        f"[O*NET Health Informatics Specialists]({ONET_HIT}), [O*NET Health Information Technologists and Medical Registrars]({ONET_HITM}), [O*NET Medical Records Specialists]({ONET_RECORDS}), and [AHIMA health-information overview]({AHIMA_HIM}) corroborate the records, coding, computerized-system, and health-information-management task families.",
        "", "WHO domain classifications do not validate an individual job title. The six conditional records therefore remain non-confirmed student paths until the exact role identity/task profile is evidenced or the role remit is explicitly limited to digital health. General hospital work is not automatically digital health.",
        "", "## Validation", "", "- Exact queue-key coverage: 14/14; 7 supported, 6 conditional, 1 unsupported.",
        "- Every decision records role task text, rationale, evidence URLs, and source limitations.",
        "- No shared canonical JSON or subgroup/specialization artifact changed.",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(payload["counts"], sort_keys=True))


if __name__ == "__main__":
    main()
