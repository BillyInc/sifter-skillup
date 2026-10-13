"""Materialize manually adjudicated D016 role-to-parent-domain decisions."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D016_role_domain_fit_2026_10_05.json"

# Status and role-specific rationale; this is not an ISCO-based classifier.
RULINGS = {
    "battery maintenance technician": ("conditional", "The source describes maintaining production equipment used to manufacture batteries, not maintaining battery electrical systems themselves. Include only where the equipment duties concern electrical/electronic production systems."),
    "battery manufacturing technician": ("supported", "The role tests and packages battery cells, packs and systems against quality/performance requirements, directly matching D016's battery/electrical equipment scope."),
    "battery simulation engineer": ("supported", "The profile models and simulates battery and battery-system performance, directly within D016's battery engineering scope."),
    "battery system engineer": ("supported", "The role designs, tests and develops battery systems and energy-storage solutions, a direct D016 example."),
    "calibration technician": ("supported", "The source directly tests and calibrates electrical/electronic equipment using technical drawings and procedures."),
    "computer hardware engineer": ("supported", "The role designs, develops, prototypes and tests computer hardware and electronic components such as circuit boards and modems."),
    "electric power generation engineer": ("supported", "The role designs and develops electrical-power generation systems and improves existing generation systems."),
    "electrical engineer": ("supported", "The profile designs/develops electrical systems and equipment for energy transmission, generation and distribution."),
    "electrical engineering technician": ("supported", "The role performs technical design, testing, manufacturing and operational support for electrical devices and facilities."),
    "electrical equipment production supervisor": ("conditional", "The role directs production and quality of electrical equipment, but is primarily production supervision rather than engineering design/testing; fit is limited to technical supervision of electrical-equipment manufacture."),
    "electromagnetic engineer": ("supported", "The role designs electromagnetic systems and devices, including magnets used in motors and medical equipment, which are electrical/electronic components."),
    "electromechanical engineer": ("conditional", "The profile designs machinery combining electrical and mechanical technologies; D016 fit is specifically the electrical systems/circuits side, while the broader mechanical remit is cross-domain."),
    "electromechanical engineering technician": ("conditional", "The role builds, installs, tests and maintains electromechanical equipment; include on D016 where the electrical circuits/control/equipment work is substantive, not solely mechanical maintenance."),
    "electronics engineer": ("supported", "The role researches, designs and develops electronic systems, circuits and semiconductor devices, directly within D016."),
    "Electrotechnology Engineers": ("unresolved", "The record is a WEF Future of Jobs trend label without an occupational task description; the trend category cannot establish electrical-engineering fit."),
    "hydropower technician": ("conditional", "The profile installs and maintains hydropower-plant systems and assists turbine construction, but does not specify whether the duties concern electrical generators/control systems or mechanical turbines; electrical plant work must be confirmed."),
    "instrumentation engineer": ("conditional", "The profile designs equipment to monitor/control manufacturing processes; fit depends on electrical/electronic instrumentation and sensor-system duties, not generic process-control work alone."),
    "integrated circuit design engineer": ("supported", "The role designs integrated-circuit layouts using electronics-engineering principles, directly matching D016's circuits/electronics scope."),
    "medical device engineer": ("conditional", "The profile designs and develops broad medical-technical systems and equipment; include in D016 where the work concerns electrical/electronic devices or systems such as pacemakers and imaging equipment."),
    "microelectronics designer": ("supported", "The role designs microelectronic systems and circuits across package-to-chip levels, a direct D016 electronics fit."),
    "microelectronics engineer": ("supported", "The role designs, develops and supervises production of microprocessors and integrated circuits, directly within D016."),
    "microelectronics materials engineer": ("conditional", "The role develops materials for microelectronics/MEMS and applies them in devices; this is a materials-specialist role at the electronics boundary, not general electrical-system engineering."),
    "microelectronics smart manufacturing engineer": ("conditional", "The profile plans and supervises smart manufacturing of electronic devices; D016 fit is limited to the electronics manufacturing systems/engineering remit, not generic factory automation."),
    "microsystem engineer": ("conditional", "The role designs MEMS integrated into mechanical, optical, acoustic and electronic products; fit is where the electrical/electronic microsystem work is central."),
    "mine electrical engineer": ("supported", "The role procures, installs and maintains mining electrical equipment using electrical/electronic principles."),
    "optoelectronic engineer": ("supported", "The profile designs electronic/optical devices such as sensors, photodiodes and LEDs, directly within D016's electronics and sensor scope."),
    "power distribution engineer": ("supported", "The role designs and operates electrical distribution facilities and optimizes delivery of power to consumers."),
    "power electronics engineer": ("supported", "The role designs and tests circuits for power-electronic systems, directly matching D016."),
    "predictive maintenance expert": ("conditional", "The role analyzes sensor data from many kinds of assets to predict maintenance needs; include only when electrical/electronic equipment or power systems are the target assets."),
    "Radio Frequency Identification Device Specialists": ("supported", "O*NET describes designing and implementing RFID systems, a direct application of radio-frequency/electronic systems engineering."),
    "satellite engineer": ("conditional", "The role develops, tests and manufactures satellite systems across software, command/control and other disciplines; D016 fit requires electrical power, electronics, communications hardware or sensor-system tasks."),
    "sensor engineer": ("supported", "The role designs and develops sensors and sensor-equipped products, directly matching D016's sensor scope."),
    "smart home engineer": ("conditional", "The role integrates and tests connected building systems across HVAC, lighting, irrigation and security; include where electrical devices, sensors, controls or power systems are substantive, not for the entire building-services remit."),
    "substation engineer": ("supported", "The profile designs medium/high-voltage substations for electrical generation, transmission and distribution, directly within D016."),
    "System Engineers": ("unresolved", "The WEF trend record provides a broad title and growth category, not a task profile. It cannot establish whether the role is electrical engineering rather than systems engineering in another discipline."),
}


def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"):
        return ref[len("ESCO:"):].split("@", 1)[0]
    if ref.startswith("ONET:"):
        return "https://www.onetonline.org/link/summary/" + ref[len("ONET:"):].split("@", 1)[0]
    if ref.startswith("URL:"):
        return ref[len("URL:"):].split("@", 1)[0]
    return None


def main() -> None:
    worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [row for row in worklist["role_mappings"] if row["domain_id"] == "D016"]
    if len(rows) != 35 or {row["role_name"] for row in rows} != set(RULINGS):
        raise SystemExit("D016 exact queue changed; refresh and adjudicate every role key before generating")
    decisions = []
    for row in rows:
        status, basis = RULINGS[row["role_name"]]
        refs = list(dict.fromkeys(url for ref in row["task_source_refs"] if (url := source_url(ref))))
        if row["role_evidence_state"] == "unsourced" and not refs:
            refs = ["https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/"]
        if not refs:
            raise SystemExit(f"No source ref joined for {row['role_key']}")
        decisions.append({
            "role_key": row["role_key"],
            "domain_fit_status": status,
            "task_evidence": row["role_task_text"],
            "basis": basis,
            "source_refs": refs,
            "source_limit": "Task evidence is copied from the lane's cited ESCO/O*NET occupation payload. These profiles describe representative tasks, not every employer's work; O*NET is US-based. WEF is only trend provenance. Conditional decisions require the electrical/electronic task context stated in the rationale.",
        })
    counts = Counter(row["domain_fit_status"] for row in decisions)
    artifact = {
        "schema_version": 1,
        "domain_id": "D016",
        "domain_name": rows[0]["domain_name"],
        "scope": "D016 only; role-task fit to the parent-domain description. No role-to-specialization/subgroup decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Compare exact tasks with D016's electrical systems, power generation/transmission/distribution, circuits/electronics, batteries, sensors and electrical-equipment testing/calibration/maintenance boundary. Supported requires direct electrical/electronic work. Conditional means a multidisciplinary or sector-neutral role qualifies only for the electrical/electronic part specified in its rationale. Unresolved means source task evidence is absent. Do not infer fit from title, ISCO/ESCO family or subgroup membership.",
        "source_limit_policy": "ESCO/O*NET task profiles are representative occupational evidence; O*NET is US-sourced. WEF trend labels do not define work tasks. COREN registration text in the domain description is Nigeria-specific and was not used as a global role-fit criterion. This is not a licensing assessment.",
        "counts": {"reviewed_role_mappings": len(decisions), **{status: counts.get(status, 0) for status in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(artifact, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": artifact["counts"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
