import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D148_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D148_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {
        "publisher": "Checked-in role/domain audit queue",
        "url": "D085_D168_role_fit_queue_2026_10_05.json",
        "locator": "Exact D148 role_key, parent scope and stored task descriptions.",
        "supports": "The specific recorded duties evaluated for each D148 mapping.",
        "limit": "This is the record under audit, not an independent verification of an occupation's complete scope.",
    },
    "IOGP_OFFSHORE_SUBSEA_CONTEXT": {
        "publisher": "International Association of Oil & Gas Producers (IOGP)",
        "url": "https://www.iogp.org/bookstore/wp-content/uploads/sites/2/woocommerce_uploads/2017/01/543.pdf",
        "locator": "Offshore operations discussion: exploration/appraisal/development drilling, subsea completions, offshore production platforms, subsea tie-ins and simultaneous drilling/production over a field life.",
        "supports": "The domain boundary between offshore/subsea petroleum field development and generic onshore or downstream work.",
        "limit": "Technical environmental report, not an occupational scope or licensing standard.",
    },
    "IMCA_ROV_RECOMMENDED_PRACTICE": {
        "publisher": "International Marine Contractors Association (IMCA)",
        "url": "https://www.imca-int.com/resources/technical-library/document/60d8d35a-c55b-ee11-8def-6045bdd2c0c0/",
        "locator": "Recommended Practice IMCA R 004, revision 6 (February 2024): safe and efficient ROV use in offshore operations, including tasks, equipment, operations and personnel responsibilities.",
        "supports": "The offshore subsea/ROV component of the parent domain's scope.",
        "limit": "Industry recommended practice; it does not define every role in this domain or local competence/licensing rules.",
    },
    "ONET_PETROLEUM_ENGINEERS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/17-2171.00",
        "locator": "Petroleum Engineer task profile: oil/gas extraction and production methods, drilling, well modification, production monitoring and equipment.",
        "supports": "The petroleum/drilling production task family and why generic onshore/offshore roles require context review.",
        "limit": "U.S. occupational profile; it does not establish that a given record is specifically offshore or subsea.",
    },
    "IOGP_INDUSTRY_STANDARDS": {
        "publisher": "International Association of Oil & Gas Producers (IOGP)",
        "url": "https://www.iogp.org/workstreams/engineering/standards/standards-solution/",
        "locator": "Standards listing includes drilling/production equipment and design/operation of subsea production systems and subsea wellhead/tree equipment.",
        "supports": "The technical distinction between subsea production system work and unrelated manufacturing or building HVAC duties.",
        "limit": "Standards catalogue demonstrates technical subject scope, not role-level fit on its own.",
    },
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "drilling engineer": (C, "Develops and supervises oil/gas well drilling, but the recorded role is explicitly employed on land or offshore. It fits the petroleum work family, yet this parent is offshore/subsea-specific and the record does not establish an offshore assignment.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT", "ONET_PETROLEUM_ENGINEERS"]),
    "equipment engineer": (C, "Designs and maintains machinery in manufacturing facilities. Offshore production equipment could be relevant, but the actual record is generic manufacturing machinery and does not establish offshore or subsea work.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT", "IOGP_INDUSTRY_STANDARDS"]),
    "fluid power engineer": (C, "Designs and services fluid-power equipment in manufacturing processes. Hydraulic/fluid-power equipment may be used offshore, but the recorded task is not tied to oil/gas, offshore platforms or subsea systems.", ["QUEUE_TASK_PROFILE", "IOGP_INDUSTRY_STANDARDS"]),
    "gas processing plant control room operator": (S, "Monitors gas-processing plant processes from a control room and changes process variables. The parent scope expressly includes operators running gas plants; this is direct plant operations, though the record does not itself say offshore.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "gas processing plant operator": (U, "The recorded task is operating a gas-distribution plant, maintaining pipeline pressure and distributing gas to utilities/consumers. That is downstream distribution, not offshore/subsea production or the parent-described gas-processing-plant control operation.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "geotechnician": (U, "The record describes rock/soil sample testing and explicitly refers to mine geotechnicians and underground openings. It does not establish offshore petroleum geotechnical, well or subsea work.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "heating, ventilation, air conditioning engineer": (U, "Designs HVAC&R for residences, offices and commercial/manufacturing buildings. This is building-services engineering, not offshore/subsea oil-and-gas production engineering.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "liquid fuel engineer": (C, "Evaluates extraction sites and develops methods for extracting petroleum and other liquid fuels. Petroleum extraction overlaps the domain, but the task includes multiple fuels and does not identify offshore/subsea operations.", ["QUEUE_TASK_PROFILE", "ONET_PETROLEUM_ENGINEERS", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "maintenance and repair engineer": (C, "Optimizes and maintains equipment, procedures and infrastructure generically. Offshore maintenance could fit, but the exact task record does not identify oil/gas assets or an offshore/subsea setting.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "mechanical engineer": (C, "Designs and oversees mechanical products and systems across fabrication, operation, installation and repair. Offshore production equipment is a possible application, but the task is cross-sector and gives no petroleum/offshore context.", ["QUEUE_TASK_PROFILE", "IOGP_INDUSTRY_STANDARDS"]),
    "oil refinery control room operator": (S, "Monitors refinery processes and changes operating variables from the refinery control room; the parent expressly includes refinery operators.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "petroleum engineer": (C, "Evaluates oil/gas fields and designs extraction methods, directly matching petroleum engineering. The recorded description does not distinguish offshore/subsea from onshore fields, so fit to this narrower parent is conditional on the actual work setting.", ["QUEUE_TASK_PROFILE", "ONET_PETROLEUM_ENGINEERS", "IOGP_OFFSHORE_SUBSEA_CONTEXT", "IOGP_INDUSTRY_STANDARDS"]),
    "petroleum pump system operator": (S, "Maintains pump circulation and monitors oil/product flow in refinery pipes and automated control rooms; refinery operations are explicitly included in the parent scope.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "production engineer": (C, "Evaluates production performance and optimizes production systems generically. Offshore oil/gas production is plausible, but the task text does not identify petroleum or subsea assets.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT", "IOGP_INDUSTRY_STANDARDS"]),
    "refinery shift manager": (S, "Supervises staff and manages plant/equipment, production and safety at an oil refinery, a facility expressly included in the parent description.", ["QUEUE_TASK_PROFILE", "IOGP_OFFSHORE_SUBSEA_CONTEXT"]),
    "rotating equipment engineer": (C, "Designs and specifies rotating equipment and supports its installation. Rotating equipment is used in offshore production systems, but this task record does not identify oil/gas or offshore assets.", ["QUEUE_TASK_PROFILE", "IOGP_INDUSTRY_STANDARDS"]),
    "surface engineer": (U, "Develops manufacturing surface-treatment processes to reduce wear/corrosion on bulk materials and workpieces. The record is materials/manufacturing-focused, not offshore asset integrity or subsea production.", ["QUEUE_TASK_PROFILE", "IOGP_INDUSTRY_STANDARDS"]),
    "welding engineer": (C, "Develops welding methods/equipment and quality-control procedures. Offshore structures and subsea equipment require welding, but the exact record is general and does not establish petroleum/offshore projects.", ["QUEUE_TASK_PROFILE", "IOGP_INDUSTRY_STANDARDS"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D148"]
    names = [row["role_name"] for row in rows]
    if not rows or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D148 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "task_evidence": row["role_description"],
            "esco_uri": (row.get("esco_occupation_uris") or [None])[0],
            "onet_codes": row.get("onet_occupation_codes", []),
            "domain_fit": fit, "rationale": rationale, "source_refs": refs,
        })
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1",
        "audit_date": date.today().isoformat(),
        "domain_id": "D148", "domain_name": rows[0]["domain_name"],
        "scope": rows[0]["domain_scope"],
        "method": "Assess each task against offshore/subsea oil-and-gas field development, drilling, subsea production equipment, and the parent-explicit refinery/gas-plant operating roles. Generic occupations are conditional unless their task record establishes this setting; do not equate downstream gas distribution with offshore production or generic manufacturing/building work with subsea engineering.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": [
            "All exact D148 queued roles were assessed using their recorded tasks; titles and subgroup membership are not proof of fit.",
            "The parent description explicitly includes refinery and gas-plant operators, so those named processing operations are assessed as supported even though the broader domain foregrounds offshore/subsea work.",
            "General petroleum engineering/drilling is conditional where the role may be onshore or offshore; specific employer/project context is needed to confirm this offshore/subsea parent.",
            "Some queue task descriptions are truncated; conclusions are limited to the available text and no missing duty was inferred.",
            "No role-to-specialization assignment, student-path recommendation or canonical taxonomy/mapping change is made.",
        ],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D148 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
    for item in decisions:
        task = item["task_evidence"].replace("|", "\\|").replace("\n", " ")
        reason = item["rationale"].replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{item['role_key']}` | {task} | {item['domain_fit']} | {reason} |")
    lines.extend(["", "## Sources and limitations", ""])
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}:** [{source['url']}]({source['url']}). {source['locator']} Supports: {source['supports']} Limit: {source['limit']}")
    lines.extend(["", "## Audit notes", ""])
    lines.extend(f"- {note}" for note in payload["notes"])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
