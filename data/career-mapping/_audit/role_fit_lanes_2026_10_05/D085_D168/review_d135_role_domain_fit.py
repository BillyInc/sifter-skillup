"""Exact-queue D135 role-to-parent-domain fit review generator."""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D135_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D135_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D135 role_key and stored task description for each mapping.", "supports": "The tasks evaluated against nuclear engineering and radiation-science scope.", "limit": "Stored task descriptions are not an independent occupational authority."},
    "ESCO_TASK_PROFILE": {"publisher": "European Commission, ESCO", "url": "https://esco.ec.europa.eu/en/classification/occupation_main", "locator": "Exact role-specific ESCO URI is retained in each applicable decision.", "supports": "Task descriptions for nuclear engineering, radiation protection, nuclear medicine and other named occupations.", "limit": "ESCO is task evidence, not an automatic parent-domain decision."},
    "IAEA_NUCLEAR_POWER_PERSONNEL": {"publisher": "International Atomic Energy Agency (IAEA)", "url": "https://nucleus.iaea.org/sites/nss-oui/Published%20Collections/m_fde4d85d-85f9-41d0-9d21-b8e4794ce8f8/m_fde4d85d-85f9-41d0-9d21-b8e4794ce8f8__3_0.Html", "locator": "IAEA Safety Guide on recruitment, qualification and training of nuclear power plant personnel; covers reactor operators, engineers, nuclear-science knowledge and safety roles.", "supports": "Nuclear-power plant operational and engineering task context.", "limit": "Guidance for nuclear-power personnel is not a universal job-title taxonomy or national licensing rule."},
    "IAEA_RADIATION_PROTECTION": {"publisher": "International Atomic Energy Agency (IAEA)", "url": "https://nucleus.iaea.org/sites/nss-oui/Published%20Chunks/m_7a123624-a9ed-40b7-842f-6fd2f3dc37a0/c_effa3774-ff96-484d-9240-9871f047c044__1_0.Html", "locator": "IAEA guidance on building competence in radiation protection: radiation-protection officers supervise facility safety and may work in nuclear installations, radiotherapy and nuclear medicine.", "supports": "Facility radiation-protection tasks in nuclear and medical settings.", "limit": "Training/appointment requirements vary by practice and national regulator."},
    "IAEA_NUCLEAR_MEDICINE": {"publisher": "International Atomic Energy Agency (IAEA)", "url": "https://www-pub.iaea.org/MTCD/Publications/PDF/P1861_web.pdf", "locator": "IAEA Human Health Series guidance describes the nuclear-medicine technologist's role and radiopharmacy/radiopharmaceutical preparation in nuclear-medicine practice.", "supports": "Clinical nuclear-medicine and radiopharmaceutical task context.", "limit": "Clinical professional scopes and credential rules are jurisdiction-specific; this citation supports domain context only."},
}

DECISIONS = {
    "Nuclear Engineers": ("supported", "Applies nuclear-science principles to nuclear-energy release/control and nuclear-waste problems; direct nuclear-engineering work."),
    "Nuclear Medicine Technologists": ("supported", "Prepares, administers and measures radioactive isotopes for therapeutic, diagnostic and tracer studies; direct medical radiation/nuclear-medicine work."),
    "Nuclear Monitoring Technicians": ("supported", "Tests samples for nuclear-experiment outcomes and contamination of people, facilities and the environment; direct radiation/nuclear monitoring."),
    "Nuclear Power Reactor Operators": ("supported", "Controls reactor operations, adjusts controls, logs conditions and responds to abnormalities; direct nuclear-energy operations."),
    "Nuclear Technicians": ("supported", "Supports nuclear scientists/engineers in laboratories and power generation and may monitor radiation; direct nuclear-science work."),
    "Radiation Therapists": ("supported", "Plans and delivers prescribed radiation therapy and supports dosimetry/tumour localization; direct clinical radiation-science work."),
    "clinical perfusion scientist": ("unsupported_for_domain", "Operates heart-lung equipment during surgery; the task is clinical perfusion, not nuclear engineering or radiation science."),
    "nuclear engineer": ("supported", "Designs engineering equipment and processes for nuclear plants and develops risk solutions; direct nuclear-plant engineering."),
    "nuclear medicine radiographer": ("supported", "Performs nuclear-medicine examinations and treatment using imaging equipment and radiopharmaceuticals; direct nuclear-medicine work."),
    "nuclear reactor operator": ("supported", "Controls nuclear power-plant reactors, reactivity, startup and abnormal conditions; direct nuclear operations."),
    "nuclear technician": ("supported", "Assists physicists/engineers in nuclear laboratories and power plants, maintains equipment and measures radiation; direct nuclear-science work."),
    "physicist": ("conditional", "Studies physical phenomena across many possible specialties. Nuclear physics/radiation science fits, but the recorded generic task does not identify that specialty."),
    "radiation protection officer": ("supported", "Develops and oversees radiation-safety measures and compliance in nuclear plants/facilities; direct radiation-protection work."),
    "radiation protection technician": ("supported", "Measures radiation in facilities and implements controls to prevent exposure/contamination; direct radiation-protection work."),
    "radiation therapist": ("supported", "Delivers prescribed radiotherapy and supports treatment planning/patient care; direct clinical radiation science."),
}


def source_refs(role_name: str) -> list[str]:
    refs = ["QUEUE_TASK_PROFILE", "ESCO_TASK_PROFILE"]
    if role_name in {"Nuclear Engineers", "Nuclear Power Reactor Operators", "nuclear engineer", "nuclear reactor operator", "Nuclear Technicians", "nuclear technician"}:
        refs.append("IAEA_NUCLEAR_POWER_PERSONNEL")
    if "Radiation" in role_name or role_name.startswith("radiation") or role_name in {"Nuclear Monitoring Technicians", "Nuclear Medicine Technologists", "nuclear medicine radiographer", "Nuclear Technicians", "nuclear technician"}:
        refs.append("IAEA_RADIATION_PROTECTION")
    if role_name in {"Nuclear Medicine Technologists", "nuclear medicine radiographer", "Radiation Therapists", "radiation therapist"}:
        refs.append("IAEA_NUCLEAR_MEDICINE")
    return refs


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D135"]
    names = [row["role_name"] for row in rows]
    if len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D135 exact role-name mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": source_refs(row["role_name"])})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D135", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare tasks with nuclear energy/plant engineering and operation, nuclear/radiation monitoring, radiation safety, nuclear medicine and radiotherapy. A generic physicist is conditional without a stated nuclear/space-radiation specialty. Clinical work is not classified as nuclear merely because it uses complex equipment; actual radiation/nuclear tasks must be explicit.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally["supported"], "conditional": tally["conditional"], "unsupported_for_domain": tally["unsupported_for_domain"], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 15 D135 queue entries were checked against their actual task descriptions; neither titles nor subgroup membership establish fit.", "IAEA nuclear-power, radiation-protection and nuclear-medicine sources corroborate the role contexts; specific licensing/credential requirements remain outside this taxonomy audit.", "No role-to-specialization assignment, student-path recommendation or canonical mapping change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D135 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally['supported']}**", f"- Conditional: **{tally['conditional']}**", f"- Unsupported for this parent: **{tally['unsupported_for_domain']}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines += ["", "## Sources and limitations", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Audit notes", ""] + [f"- {note}" for note in payload["notes"]]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
