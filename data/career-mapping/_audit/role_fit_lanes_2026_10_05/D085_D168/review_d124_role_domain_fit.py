"""Exact-key D124 role-to-parent-domain audit report generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D124_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D124_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain lane queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D124 role_key and task description for every decision.", "supports": "The recorded duties for each specific mapping.", "limit": "Local task profiles are not an independent occupational authority."},
    "WHO_PRIMARY_HEALTH_CARE": {"publisher": "World Health Organization", "url": "https://www.who.int/health-topics/primary-health-care", "locator": "Primary health care overview: integrated services, prevention, treatment, rehabilitation and care close to communities.", "supports": "Global concept of community-oriented primary care and community health service scope.", "limit": "System-level definition, not a precise occupational task taxonomy."},
    "WHO_COMMUNITY_HEALTH_WORKERS": {"publisher": "World Health Organization", "url": "https://www.who.int/publications/i/item/9789241550369", "locator": "Guideline on health policy and system support to optimize community health worker programmes.", "supports": "Community health workers as part of interprofessional primary-care teams, with roles integrated in local health systems.", "limit": "WHO notes CHW roles vary by country and setting; does not establish identical scope everywhere."},
    "ILO_ISCO08_HEALTH_SUPPORT": {"publisher": "International Labour Organization", "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf", "locator": "ISCO-08 Unit Group 5321 and related health-support task descriptions: personal care under health-professional supervision, hospital orderly work, and sterilizing medical/surgical equipment.", "supports": "International occupational context for nursing assistants, hospital-portering and sterile-equipment support tasks.", "limit": "Classification is corroboration only; each role decision is based on its exact task description compared with the stated D124 scope."},
}

DECISIONS = {
    "Endoscopy Technicians": ("conditional", "Provides sterile-field and equipment support to clinicians and may collect specimens, which overlaps hospital-care support; however, the specific endoscopy-procedure setting is specialized and not clearly a frontline community-health function."),
    "Healthcare Support Workers, All Other": ("unresolved", "The task description is only a residual category and gives no specific patient-care, community-health, specimen-collection, optical or sterilization duty to compare."),
    "Massage Therapists": ("unsupported_for_domain", "Provides therapeutic massage and musculoskeletal assessment; the stated task is a distinct therapy service, not the D124 frontline/community support activities."),
    "Medical Equipment Preparers": ("supported", "Prepares, sterilizes, installs and cleans healthcare equipment, directly matching the domain's sterilization and health-facility support scope."),
    "Medical Transcriptionists": ("unsupported_for_domain", "Transcribes and edits clinicians' records; this administrative documentation task is not the described community/frontline care, patient support or listed technical service."),
    "Opticians, Dispensing": ("supported", "Measures, fits and adapts prescribed lenses/frames and assists with contact-lens care, explicitly matching the parent description's optician/spectacle-fitting service."),
    "Speech-Language Pathology Assistants": ("unsupported_for_domain", "Implements speech-language disorder assessment/treatment plans under a speech pathologist; this is a distinct allied-therapy service not named or established by the D124 scope."),
    "community health worker": ("supported", "Provides health advice, prevention programmes and maternal/nutritional support to communities, directly matching community health extension; WHO confirms CHWs' primary-care role while noting local variation."),
    "first aid instructor": ("conditional", "Teaches first-aid skills relevant to frontline health response, but the stated task is instruction rather than delivery of community or patient care."),
    "healthcare assistant": ("supported", "Provides physical and psychological support to patients within clinical-care teams, matching the parent scope's assistance with patient care."),
    "home care aide": ("supported", "Provides daily personal assistance to people affected by illness, ageing or disability in their homes, directly matching the stated home-care service setting."),
    "hospital porter": ("supported", "Transports patients within hospitals, matching the parent scope's explicit hospital-porter pathway."),
    "nurse assistant": ("supported", "Provides basic patient care under nursing direction, including feeding, bathing, dressing and moving patients; direct fit to assisting nurses with patient care."),
    "optical technician": ("supported", "Fabricates, repairs and fits prescription eyewear components, matching the stated optical-technician/spectacle-support pathway."),
    "optician": ("supported", "Fits spectacles, contact lenses and other vision-correction devices, expressly within the parent description's optician service."),
    "phlebotomist": ("supported", "Collects and transports patient blood specimens for laboratory analysis, directly matching the parent scope's blood-sample collection."),
    "sterile services technician": ("supported", "Decontaminates, sterilizes, reassembles and repackages medical devices, directly matching the parent scope's equipment sterilization."),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D124"]
    actual = {row["role_name"] for row in rows}
    if len(rows) != len(actual) or actual != set(DECISIONS):
        raise SystemExit(f"D124 exact-key mismatch: missing={sorted(actual-set(DECISIONS))}; extra={sorted(set(DECISIONS)-actual)}")
    decisions = []
    for row in sorted(rows, key=lambda value: value["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        refs = ["QUEUE_TASK_PROFILE"]
        if fit != "unresolved":
            refs.extend(["WHO_PRIMARY_HEALTH_CARE", "ILO_ISCO08_HEALTH_SUPPORT"])
            if row["role_name"] == "community health worker":
                refs.append("WHO_COMMUNITY_HEALTH_WORKERS")
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    counts = Counter(item["domain_fit"] for item in decisions)
    payload = {"schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(), "domain_id": "D124", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"], "method": "Compare each exact task with the parent description's frontline/community care, patient support, blood collection, optical service, sterilization, and home/hospital support. WHO primary-care guidance supplies broad system context; ILO occupational descriptions are corroboration, not proof based on classification. Conditional means related support or education tasks are plausible but not clearly frontline care; unresolved means the residual task gives no specific duty.", "counts": {"mappings_reviewed": len(decisions), "supported": counts["supported"], "conditional": counts["conditional"], "unsupported_for_domain": counts["unsupported_for_domain"], "unresolved": counts["unresolved"]}, "decisions": decisions, "sources": SOURCES, "notes": ["All exact D124 role keys were checked against the lane queue; task text is retained verbatim for audit.", "The parent itself explicitly includes opticians/optical technicians, sterilization, phlebotomy, nurse assistance, home care and hospital portering; these fits follow those concrete scope elements.", "Endoscopy support and first-aid instruction are conditional because they are clinically adjacent but not clearly the frontline/community-care work described.", "Community-health worker role definitions vary by country and programme; no specific national scope is inferred.", "No role-to-specialization assignment, student-visibility decision or canonical taxonomy/mapping change is made."]}
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D124 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{payload['counts']['supported']}**", f"- Conditional: **{payload['counts']['conditional']}**", f"- Unsupported for this parent: **{payload['counts']['unsupported_for_domain']}**", f"- Unresolved: **{payload['counts']['unresolved']}**", "", "| Exact role key | Task description | Fit | Why |", "|---|---|---|---|"]
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
