"""Build exact-key D074 occupational-health-and-safety role review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D074_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D074_role_domain_fit_review_2026_10_05.md"

ILO_OSH = "https://www.ilo.org/topics-and-sectors/safety-and-health-work/occupational-safety-and-health-management-systems"
ILO_GUIDELINES = "https://www.ilo.org/publications/guidelines-occupational-safety-and-health-management-systems-ilo-osh-2001"
OSHA_HAZARDS = "https://www.osha.gov/safeandsound/safety-and-health-programs/find-and-fix-hazards"
OSHA_INSPECTIONS = "https://www.osha.gov/sites/default/files/publications/FACTSHEET-INSPECTIONS.pdf"

DECISIONS = {
    "aviation safety officer": ("conditional", "The supplied task develops safety procedures for aviation-company operations and directs personnel in safeguards. Aviation operational/flight safety is not automatically occupational H&S.", "Retain only when the assignment concerns worker hazards, workplace safety procedures or occupational compliance; flight/aircraft operational safety alone is insufficient."),
    "construction safety inspector": ("supported", "The task inspects construction workplaces, identifies hazards and checks compliance with health-and-safety rules, directly matching workplace risk inspection." , None),
    "environmental health inspector": ("conditional", "The task enforces environmental and public-health legislation across varied organisations; it may overlap workplace hygiene and exposure controls but is broader than occupational safety.", "Retain only for assigned workplace health, hygiene, exposure or worker-protection duties; environmental/public-health inspection alone is not enough."),
    "food regulatory advisor": ("conditional", "The task advises and audits food-industry regulatory compliance, quality and safety. Food regulation primarily protects products and consumers and does not necessarily concern worker OHS.", "Retain only where the actual remit addresses worker safety, occupational exposure or workplace hygiene hazards; product/consumer regulation alone is insufficient."),
    "food safety inspector": ("conditional", "The task inspects food processing and official food controls. This may overlap workplace hygiene but the described purpose is food/process safety, not necessarily worker OHS.", "Retain only where inspections include worker hazards, occupational hygiene or workplace safety duties; food-product compliance alone is insufficient."),
    "hazardous materials inspector": ("supported", "The task checks facilities handling hazardous materials against health-and-safety rules, investigates violations and reviews emergency/risk plans, directly matching workplace hazard control." , None),
    "hazardous waste inspector": ("conditional", "The task enforces waste-disposal rules and inspects industrial handling equipment; environmental compliance is clear, while worker-exposure protection is not assured by the task text.", "Retain where inspection covers worker exposure, safe handling or workplace hazard controls; waste-disposal/environmental compliance alone is insufficient."),
    "health and safety engineer": ("supported", "The task designs safety measures and programs through engineering and assesses workplace/facility risks, directly matching prevention and control of occupational hazards." , None),
    "Health and Safety Engineers, Except Mining Safety Engineers and Inspectors": ("supported", "The task applies engineering, industrial-process and health-and-safety knowledge to prevent worksite or product hazards; the worksite-safety component directly fits." , None),
    "health and safety inspector": ("supported", "The task inspects workplace implementation of labour standards and safety/health policies and advises on compliance, directly matching occupational oversight." , None),
    "health and safety officer": ("supported", "The task assesses workplace risk, interviews employees and implements safer work environments; the supplied healthcare examples also include infection-prevention duties for facility workers." , None),
    "healthcare inspector": ("conditional", "The task inspects patient care, facility processes and infection control. Healthcare quality and patient safety are not automatically occupational health and safety for workers.", "Retain only when the assigned inspection covers worker infection exposure, occupational hazards or employee-protection controls; patient-care compliance alone is insufficient."),
    "industrial waste inspector": ("conditional", "The task inspects industrial waste practices and environmental compliance. It is relevant to OHS only where workers' exposure or safe handling is part of the inspection remit.", "Retain only for worker exposure, hazardous handling or workplace risk duties; environmental waste compliance alone is insufficient."),
    "mine health and safety engineer": ("supported", "The task develops systems to prevent mine-worker injury and illness and reduce workplace risks, directly matching occupational health and safety." , None),
    "mine safety officer": ("supported", "The task manages mine-site H&S systems, records accidents and assesses worker risks, directly matching occupational safety in a high-hazard workplace." , None),
    "Mining and Geological Engineers, Including Mining Safety Engineers": ("conditional", "The task bundle covers subsurface surveys, extraction design and may include inspections and mine-safety programmes; the parent occupational category is broader than OHS.", "Retain as an OHS path only for assignments explicitly designing, inspecting or coordinating mine-safety programmes; general mining/geological engineering alone is not an OHS fit."),
    "occupational health and safety inspector": ("supported", "The task audits workplaces, investigates work accidents and checks employee compliance with safety and health requirements, directly matching the domain." , None),
    "Occupational Health and Safety Specialists": ("supported", "The task evaluates work environments and controls or prevents injury/illness from chemical, physical, biological and ergonomic hazards, directly matching the domain." , None),
    "Occupational Health and Safety Technicians": ("supported", "The task collects workplace exposure data and implements/evaluates programmes to limit worker chemical, physical, biological and ergonomic risks, directly matching the domain." , None),
    "transport health and safety inspector": ("conditional", "The task spans safety/security in transport and mentions risks to company, staff and customers; it may concern operational/customer security rather than occupational hazards.", "Retain only for worker safety, workplace hazards or occupational compliance in a transport employer; passenger/customer security or transport-system operational safety alone is insufficient."),
}


def _source_urls(refs: list[str]) -> list[str]:
    urls: list[str] = []
    for ref in refs:
        source, value = ref.split(":", 1)
        url = value.split("@", 1)[0]
        if source == "ONET" and not url.startswith(("http://", "https://")):
            url = f"https://www.onetonline.org/link/summary/{url}"
        if url.startswith(("http://", "https://")):
            urls.append(url)
    return list(dict.fromkeys(urls))


def build() -> dict:
    queue = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D074"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    decisions_by_name = {name.casefold(): (name, *decision) for name, decision in DECISIONS.items()}
    if len(rows) != 20 or len(by_name) != 20 or set(by_name) != set(decisions_by_name):
        raise SystemExit(f"D074 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")
    sources = [ILO_OSH, ILO_GUIDELINES, OSHA_HAZARDS, OSHA_INSPECTIONS]
    decisions = []
    for folded, (name, status, basis, condition) in decisions_by_name.items():
        row = by_name[folded]
        refs = _source_urls(row["task_source_refs"])
        refs.extend(sources)
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ILO and OSHA sources define occupational hazards, worker protection, risk control and workplace inspection boundaries. ESCO/O*NET identify each mapped task profile. Sources are not evidence of Nigerian demand or universal legal authority; national laws and regulated scopes differ. This review assesses parent-domain task fit only.",
            "recommended_action": "retain_parent_domain_link_candidate" if status == "supported" else "retain_only_with_task_scope_condition",
        })
    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1, "domain_id": "D074", "domain_name": "Occupational Health and Safety",
        "scope": "D074 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed all exact D074 role tasks against preventing work-related injury/illness, identifying workplace hazards, assessing and controlling risk, implementing H&S systems and enforcing workplace requirements. Public/product/environmental/transport safety were not assumed to mean worker OHS; those mappings are conditional on the described worker/workplace assignment. ILO and OSHA references ground the international occupational-safety boundary; they do not establish local law or demand.",
        "scope_sources": sources,
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Review artifact only. No canonical taxonomy or specialization data was edited.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    c = payload["counts"]
    lines = ["# D074 — Occupational Health and Safety: role-to-parent-domain fit", "",
             f"**Slice:** {c['reviewed_role_mappings']}/20 exact mappings reviewed against supplied tasks and stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|",
             *[f"| {s.title()} | {c[s]} |" for s in ("supported", "conditional", "unsupported", "unresolved")],
             "", "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" +
                 (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |"
                 for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"The [ILO occupational-safety systems guidance]({ILO_OSH}) defines workplace hazard identification, risk assessment/control and worker protection; [ILO-OSH 2001]({ILO_GUIDELINES}) describes organizational OSH systems. [OSHA's hazard-control guidance]({OSHA_HAZARDS}) and [inspection fact sheet]({OSHA_INSPECTIONS}) provide official examples of workplace hazard identification and compliance inspection. These sources support the general OHS boundary, not country-specific legal conclusions.",
                  "", "Cross-sector roles are conditional when their task could concern product, environmental, patient, transport-system or public safety rather than worker protection. The specified work assignment must establish the OHS link.",
                  "", f"- Exact queue coverage: {c['reviewed_role_mappings']}/20; {c['supported']} supported, {c['conditional']} conditional, {c['unsupported']} unsupported, {c['unresolved']} unresolved.",
                  "- No canonical taxonomy or specialization files were edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(c, sort_keys=True))


if __name__ == "__main__":
    main()
