#!/usr/bin/env python3
"""Resolve titles present only in the older D011/D166 role snapshots.

This source-backed audit records individual dispositions and narrowly scoped
role candidates. It does not mutate canonical role records, area routes, or the
learning graph.
"""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
SNAPSHOTS = {d: CAREER / "_audit" / "domains" / f"{d}.json" for d in ("D011", "D166")}
ROLE_PATH = CAREER / "role_library_v3_cleaned.json"
OUT_JSON = CAREER / "_audit" / "D011_D166_LEGACY_ROLE_SNAPSHOT_DISPOSITIONS_2026_10_23.json"
OUT_MD = CAREER / "_audit" / "D011_D166_LEGACY_ROLE_SNAPSHOT_DISPOSITIONS_2026_10_23.md"
TODAY = date.today().isoformat()

URLS = {
    "onet_accounting": "https://www.onetonline.org/link/details/13-2011.00",
    "onet_budget": "https://www.onetonline.org/link/summary/13-2031.00",
    "onet_tax": "https://www.onetonline.org/link/summary/13-2082.00",
    "onet_treasurer": "https://www.onetonline.org/link/details/11-3031.01",
    "onet_fraud": "https://www.onetonline.org/link/custom/13-2099.04",
    "onet_fundraisers": "https://www.onetonline.org/link/details/13-1131.00",
    "bankruptcy_us_courts": "https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-11-bankruptcy-basics",
    "dividend_esco_mirror": "https://altotrail.com/en/occupations/dividend-analyst/",
    "dividend_employer": "https://jobs.scotiabank.com/job/Bogota-Analyst-Capital-Markets%2C-Corporate-Actions-%26-Dividend-and-Coupon-Income-Processing-DC/606968017/",
    "onet_aerospace": "https://www.onetonline.org/link/summary/17-2011.00",
    "onet_automotive": "https://www.onetonline.org/link/details/17-2141.02",
    "onet_mechanical": "https://www.onetonline.org/link/summary/17-2141.00",
    "onet_industrial": "https://www.onetonline.org/link/summary/17-2112.00",
    "onet_manufacturing": "https://www.onetonline.org/link/summary/17-2112.03",
    "onet_robotics": "https://www.onetonline.org/link/details/17-2199.08",
    "onet_auto_service": "https://www.onetonline.org/link/details/49-3023.00",
    "onet_food_engineer": "https://www.onetonline.org/link/custom/19-1012.00",
    "onet_materials": "https://www.onetonline.org/link/summary/17-2131.00",
    "onet_packaging_manager": "https://www.onetonline.org/link/summary/11-3051.00",
    "esco_mechanical": "https://esco.ec.europa.eu/en/classification/occupation?uri=http%3A%2F%2Fdata.europa.eu%2Fesco%2Foccupation%2F579254cf-6d69-4889-9000-9c79dc568644",
    "tesla_robotaxi_manufacturing": "https://www.tesla.com/careers/search/job/286092?source=Indeed",
    "daimler_autonomous_powertrain": "https://jobsearch.daimlertruck.com/index.php?ac=jobad&id=425236",
    "nvidia_control_integration": "https://nvidia.wd5.myworkdayjobs.com/NvidiaExternalCareerSite/job/US-CA-Santa-Clara/Senior-Software-Control-Integration-Engineer---Autonomous-Vehicles_JR2025121",
    "mobileye_sensor_calibration": "https://careers.mobileye.com/jobs/sensor-calibration-engineer/3e08463f-6b23-40bb-996c-c61fe1ad5e10",
    "woven_sensor_calibration": "https://jobs.lever.co/woven-by-toyota/fce9aba6-af37-45c9-9263-503a9c01ef1b",
    "kodiak_calibration": "https://job-boards.greenhouse.io/kodiak/jobs/4297363009",
    "nvidia_vehicle_integration": "https://nvidia.wd5.myworkdayjobs.com/en-US/NvidiaExternalCareerSite/job/Korea-Seoul/Vehicle-Integration-Engineer--Autonomous-Vehicle-Test-Fleet_JR2020318",
    "mobileye_system_integrator": "https://careers.mobileye.com/jobs?department=integration-operation-engineering",
    "samhsa_grants_manager": "https://www.samhsa.gov/grants/grants-management",
}

SOURCES = {
    "D011_ACCOUNTING": {
        "urls": [URLS["onet_accounting"]],
        "finding": "O*NET 13-2011.00 describes accounting records, statements, reporting standards, reconciliations, audit findings, internal controls and tax compliance. It is a general accounting/audit occupation, not quantitative financial pricing, market-risk modeling, or systematic investment work.",
    },
    "D011_BUDGET": {
        "urls": [URLS["onet_budget"]],
        "finding": "O*NET 13-2031.00 covers fiscal allocation, operating budgets, cost analysis, program resources, budget controls and cost-benefit analysis. Cost Analyst is among its reported titles. These tasks concern organizational/program budgets, not the three D011 area boundaries.",
    },
    "D011_TAX": {
        "urls": [URLS["onet_tax"]],
        "finding": "O*NET 13-2082.00 explicitly lists Tax Advisor among reported titles and describes tax return preparation, tax law, deductions, tax calculations and client tax planning.",
    },
    "D011_TREASURY_CONTROL": {
        "urls": [URLS["onet_treasurer"]],
        "finding": "O*NET 11-3031.01 covers organization-level cash, reserves, budgeting, financial statements, investment of surpluses, accounting controls, procurement, tax and staff supervision. The role is corporate treasury/control rather than quantitative market modeling or financial engineering.",
    },
    "D011_FRAUD": {
        "urls": [URLS["onet_fraud"]],
        "finding": "O*NET 13-2099.04 describes evidence gathering, interviews, reporting and fraud investigation/prevention. Related task records include examining financial data for irregularities and designing fraud-detection tools; this is fraud examination/analytics, not quantitative finance unless a distinct financial-modeling assignment is evidenced.",
    },
    "D011_BANKRUPTCY": {
        "urls": [URLS["bankruptcy_us_courts"]],
        "finding": "U.S. Courts describes bankruptcy trustee duties as administering/reorganizing an estate, accounting for property, reviewing claims and court reporting. This is insolvency administration, not an area in D011.",
    },
    "D011_DIVIDEND": {
        "urls": [URLS["dividend_esco_mirror"], URLS["dividend_employer"]],
        "finding": "The snapshot's aliases include dividend clerk and dividend/coupon analyst. An ESCO-derived profile describes dividend calculation, recordkeeping and payment work, while a current Scotiabank capital-markets posting describes corporate-actions processing, reconciliations, exception queues and payment readiness. Neither supports a D011 quantitative investment route by title alone. A separately documented role that forecasts dividends, values securities and builds a systematic equity strategy could support the systematic-investment area, but it is a different, task-qualified role identity.",
    },
    "D011_FUNDRAISING": {
        "urls": [URLS["samhsa_grants_manager"], URLS["onet_fundraisers"]],
        "finding": "SAMHSA defines a Grant Management Officer's work as business management, review/negotiation/award/administration, compliance interpretation and authorizing grant expenditure. O*NET Fundraisers covers donor solicitation and funding proposals. Grant administration is not quantitative finance or financial engineering.",
    },
    "D166_AUTONOMY_ROBOTICS": {
        "urls": [URLS["onet_robotics"]],
        "finding": "O*NET 17-2199.08 lists Automation Engineer and Autonomous Vehicle Design Engineer among reported titles. Its task list explicitly includes interpreting sensor signals, designing automatic vehicle control/autonomous-vehicle systems and advanced sensing/computer vision, integrating robotics and evaluating prototypes. This establishes a conditional D166 role fit when the person's assignment is the road-vehicle ADS stack.",
    },
    "D166_AERODYNAMICS": {
        "urls": [URLS["onet_automotive"], URLS["nvidia_control_integration"]],
        "finding": "O*NET 17-2141.02 includes aerodynamics among automotive systems an Automotive Engineer may design or analyze. NVIDIA's AV control-integration posting links vehicle dynamics to trajectory tracking, control tuning and integration. This supports aerodynamics only when the work models road-vehicle behavior for an ADS control/dynamics assignment; generic aerodynamic work and aerospace aerodynamics do not establish D166 fit.",
    },
    "D166_AEROSPACE": {
        "urls": [URLS["onet_aerospace"]],
        "finding": "O*NET 17-2011.00 describes aircraft, missiles and spacecraft engineering. Its autonomous-systems task explicitly concerns uncrewed aerospace vehicles; it does not establish a road self-driving route.",
    },
    "D166_POWERTRAIN": {
        "urls": [URLS["daimler_autonomous_powertrain"], URLS["nvidia_control_integration"]],
        "finding": "Daimler Truck's Autonomous Powertrain System Engineer posting covers powertrain requirements, ECU/software/hardware integration, validation, release readiness and autonomous vehicle programs. NVIDIA's AV control-integration posting connects vehicle dynamics/control and actuation. The source-backed D166 role is an autonomous powertrain systems/integration assignment; the generic Engine Designer title is not equivalent and should not be a separate route unless that condition is met. Current Powertrain Engineer is the closer canonical role family.",
    },
    "D166_MECHANICAL": {
        "urls": [URLS["onet_mechanical"], URLS["onet_automotive"], URLS["esco_mechanical"]],
        "finding": "O*NET describes broad mechanical/automotive design, operation and maintenance; ESCO places several snapshot titles (including equipment, fluid-power, HVAC, engine, precision, rotating-equipment, tooling and welding specialisms) under the broad Mechanical Engineer concept. These classifications establish mechanical-engineering identity, not an ADS-area route. Require a specific road-ADS subsystem task before routing.",
    },
    "D166_MATERIALS": {
        "urls": [URLS["onet_materials"]],
        "finding": "O*NET 17-2131.00 describes materials engineering work such as evaluating materials, developing processing methods, and supervising testing or fabrication. This may include surface/material treatment, but does not establish a road-ADS subsystem task or fit within a current D166 area by itself.",
    },
    "D166_INDUSTRIAL": {
        "urls": [URLS["onet_industrial"], URLS["onet_manufacturing"]],
        "finding": "O*NET describes industrial/manufacturing engineering as production systems, process improvement, quality, tooling, costs, layout and manufacturing. Tesla's Cybercab manufacturing posting shows such work can support an autonomous vehicle product launch, but the work remains manufacturing-process work; none of the current eight D166 areas is manufacturing.",
    },
    "D166_MAINTENANCE": {
        "urls": [URLS["onet_auto_service"]],
        "finding": "O*NET 49-3023.00 describes routine automotive diagnosis, repair, adjustment and maintenance. It does not describe ADS engineering, validation, calibration or integration. Fleet-maintenance work would need a separately evidenced ADS subsystem assignment and a matching area.",
    },
    "D166_FOOD": {
        "urls": [URLS["onet_food_engineer"]],
        "finding": "O*NET 19-1012.00 lists Food Engineer as a reported title and describes food processing, preservation, packaging, storage and distribution. This work is in the food production context, not road-vehicle ADS.",
    },
    "D166_PACKAGING": {
        "urls": [URLS["onet_packaging_manager"]],
        "finding": "O*NET 11-3051.00 describes Industrial Production Managers as coordinating production activities, product standards, work procedures, inventory, staffing and manufacturing systems. This supports a manufacturing role, not an ADS function in the current eight areas.",
    },
}

DISPOSITIONS = {
    "D011": {
        "accountant": ("exclude_from_D011", "Account preparation and reporting are not one of pricing/financial engineering, quantitative financial risk modeling, or systematic investment/trading; the cross-domain role-family ledger places this role in accounting-related domains." , "D011_ACCOUNTING"),
        "accounting analyst": ("exclude_from_D011", "Accounting systems, accounts, reconciliation and reporting do not establish quantitative financial modeling or investment research; the role-family ledger places it in accounting-related domains.", "D011_ACCOUNTING"),
        "audit supervisor": ("exclude_from_D011", "Supervising general financial/accounting audits is outside the D011 area boundaries. A specialist model-validation/audit role would require its own task record.", "D011_ACCOUNTING"),
        "bankruptcy trustee": ("exclude_from_D011", "The role administers insolvency estates, creditor claims and court processes; it belongs with insolvency/legal-financial work, not D011.", "D011_BANKRUPTCY"),
        "budget analyst": ("exclude_from_D011", "Program/organizational budget analysis does not fit market-risk modeling, instrument pricing, or systematic investment/trading.", "D011_BUDGET"),
        "cost analyst": ("exclude_from_D011", "The snapshot aliases include cost accountant and cost/budget analyst; O*NET groups Cost Analyst under budget analysis. Product/program costing is not financial-instrument pricing.", "D011_BUDGET"),
        "dividend analyst": ("exclude_from_D011_legacy_identity; require a distinct task-qualified role for investment work", "Snapshot aliases and current employer evidence primarily indicate dividend/coupon processing and accounting. The ESCO-derived record also mentions stock valuation/forecasting, so the title is ambiguous. Keep this old identity out of D011; route a separately evidenced dividend-yield researcher/quantitative equity analyst only when the actual job forecasts/value securities and develops investment strategies.", "D011_DIVIDEND"),
        "financial auditor": ("exclude_from_D011", "General financial statement, compliance and control audits are not the same work as quantitative model validation; the legacy aliases are general auditor/internal auditor.", "D011_ACCOUNTING"),
        "financial controller": ("exclude_from_D011", "Corporate finance control, accounting, budgeting, cash management and financial reporting do not establish one of the D011 specialization area tasks.", "D011_TREASURY_CONTROL"),
        "financial fraud examiner": ("exclude_from_D011", "Fraud investigation and evidence gathering may analyze financial data, but that does not equal quantitative market/investment modeling. A fraud-analytics role would require a distinct assigned task and area record.", "D011_FRAUD"),
        "grants management officer": ("exclude_from_D011", "Grant administration involves grant review, award, financial administration and compliance, not the D011 areas.", "D011_FUNDRAISING"),
        "public finance accountant": ("exclude_from_D011", "Public-sector accounting and treasury/budget administration do not establish quantitative financial engineering or market/investment modeling.", "D011_ACCOUNTING"),
        "tax advisor": ("exclude_from_D011", "Tax law interpretation, return preparation and client tax planning are separate from the D011 specialization areas.", "D011_TAX"),
    },
    "D166": {
        "aerodynamics engineer": ("exclude_from_D166_as_standalone; current automotive-engineer route covers only a specific ADS condition", "Generic aerodynamics is not an autonomous-driving function. Where a road-vehicle aerodynamic model is explicitly used by an ADS vehicle-dynamics/control team, it can support Vehicle Control and Dynamics; use the existing Automotive Engineer route unless a distinct AV aerodynamics role record and task source are established.", "D166_AERODYNAMICS"),
        "aerospace engineer": ("exclude_from_D166", "Uncrewed aerospace autonomy is not road-vehicle self-driving. D166's current area taxonomy is road-vehicle ADS and provides no aerospace area.", "D166_AEROSPACE"),
        "automation engineer": ("conditional_retain_candidate_for_D166", "Retain only when the assigned work designs road-vehicle ADS/AV systems. O*NET directly includes this reported title under Robotics Engineers and lists autonomous-vehicle design, automatic vehicle control, advanced sensing, sensor-data processing, computer vision and robotic-system integration. Candidate area routes: sensing/calibration, perception, automated-driving planning (only path-planning work), vehicle control/dynamics, and vehicle interface/system integration as the specific task warrants; no blanket route to all areas.", "D166_AUTONOMY_ROBOTICS"),
        "engine designer": ("exclude_as_standalone; covered only by conditional powertrain-systems route", "Engine design alone is vehicle/powertrain engineering. Retain in D166 only when the assignment develops/integrates autonomous-vehicle powertrain controls or interfaces; the current Powertrain Engineer role is the closer canonical role. Do not turn generic engine design into an ADS route.", "D166_POWERTRAIN"),
        "equipment engineer": ("exclude_from_D166_on_current_evidence", "Generic equipment design, installation or maintenance does not identify an ADS subsystem or any current D166 area; an exact road-ADS system task would be needed for a conditional route.", "D166_MECHANICAL"),
        "fluid power engineer": ("exclude_from_D166_on_current_evidence", "General fluid-power/hydraulic design is not enough to establish an autonomous-driving route. No source found in this pass connects this role identity to ADS steer/brake actuation; the role should not be placed without that task-specific source.", "D166_MECHANICAL"),
        "food and beverage packaging technologist": ("exclude_from_D166", "Food/beverage packaging technology has no road-ADS task or area fit in the source record.", "D166_FOOD"),
        "food production engineer": ("exclude_from_D166", "Food production engineering has no road-ADS task or area fit in the source record.", "D166_FOOD"),
        "heating, ventilation, air conditioning engineer": ("exclude_from_D166_on_current_evidence", "Building HVAC is outside road-ADS subsystem work. The snapshot aliases describe HVAC project/site/service engineering; no vehicle thermal-management or ADS task is present.", "D166_MECHANICAL"),
        "industrial engineer": ("exclude_from_D166", "Industrial production systems and manufacturing flow do not fit the eight current D166 areas.", "D166_INDUSTRIAL"),
        "industrial tool design engineer": ("exclude_from_D166", "Industrial tool and manufacturing-equipment design is outside the current D166 areas.", "D166_INDUSTRIAL"),
        "maintenance and repair engineer": ("exclude_from_D166", "The aliases point to manufacturing, production, mechanical and equipment maintenance. General vehicle maintenance is not ADS engineering, validation or sensor calibration.", "D166_MAINTENANCE"),
        "manufacturing engineer": ("exclude_from_D166", "Manufacturing-process work can support production of an autonomous vehicle but does not fit a current D166 technical area. Tesla's Cybercab posting verifies product adjacency, not area fit.", "D166_INDUSTRIAL"),
        "packaging production manager": ("exclude_from_D166", "Packaging production management is not an ADS system function and no D166 area supports it.", "D166_PACKAGING"),
        "precision engineer": ("exclude_from_D166_as_named; add separate sensor-calibration role candidate", "General precision engineering is not equivalent to AV sensor calibration. Direct AV employer evidence identifies Sensor Calibration Engineer as a distinct role working on camera/LiDAR/radar/IMU calibration, calibration error models and downstream perception/localization/control. Record that exact role candidate separately for the D166 sensing/calibration area.", "D166_MECHANICAL"),
        "process engineer": ("exclude_from_D166", "Snapshot aliases focus on battery materials, manufacturing systems, process technology and industrial quality. That production/process context does not fit the current D166 areas.", "D166_INDUSTRIAL"),
        "production engineer": ("exclude_from_D166", "Production engineering and manufacturing support do not fit the current D166 areas.", "D166_INDUSTRIAL"),
        "rotating equipment engineer": ("exclude_from_D166_on_current_evidence", "Rotating-equipment engineering principally concerns machinery, turbines and industrial/power equipment; no road-ADS subsystem task or area route is evidenced.", "D166_MECHANICAL"),
        "surface engineer": ("exclude_from_D166_on_current_evidence", "Surface engineering/corrosion/material treatment falls under materials engineering but does not fit a current ADS subsystem area based on the role snapshot or sources reviewed.", "D166_MATERIALS"),
        "tooling engineer": ("exclude_from_D166", "Manufacturing tooling, fixtures and machine-tool work are outside current D166 areas, even when performed on an autonomous-vehicle production line.", "D166_INDUSTRIAL"),
        "welding engineer": ("exclude_from_D166", "Welding process/design/inspection is manufacturing work and is not a task within the current D166 area set.", "D166_INDUSTRIAL"),
    },
}

NEW_ROLE_CANDIDATES = [
    {
        "role_title": "Sensor Calibration Engineer",
        "domain_id": "D166",
        "candidate_areas": ["D166:vehicle-sensing-and-sensor-calibration", "D166:perception-and-scene-understanding", "D166:localization-and-vehicle-state-estimation"],
        "route_condition": "Role assignment develops, validates, or maintains calibration for sensors used by road ADS and produces calibrated transforms/error models consumed by the named downstream stack.",
        "source_urls": [URLS["mobileye_sensor_calibration"], URLS["woven_sensor_calibration"], URLS["kodiak_calibration"]],
        "evidence_summary": "Mobileye describes intrinsic/extrinsic and spatiotemporal calibration for cameras, LiDAR, IMU and other sensors, calibration pipelines, error analysis, and outputs used by perception/localization/control. Woven by Toyota describes an AD/ADAS Sensor & Calibration subteam and data validation pipelines. Kodiak describes autonomous-truck calibration linked to localization, mapping, perception, hardware and vehicle-fleet validation.",
        "disposition": "source_backed_role_candidate_for_canonical_route_review",
    },
    {
        "role_title": "Autonomous Powertrain System Engineer",
        "domain_id": "D166",
        "candidate_areas": ["D166:vehicle-control-and-dynamics", "D166:vehicle-interface-and-system-integration"],
        "route_condition": "Role assignment owns autonomous/advanced vehicle powertrain requirements, ECU/software/hardware integration, validation, or release readiness.",
        "source_urls": [URLS["daimler_autonomous_powertrain"]],
        "evidence_summary": "Daimler Truck's current posting explicitly names this role and gives autonomous-program powertrain integration, validation, ECU compatibility, system readiness and release tasks.",
        "disposition": "source_backed_role_candidate_for_canonical_route_review",
    },
    {
        "role_title": "Autonomous Vehicle System Integration Engineer",
        "domain_id": "D166",
        "candidate_areas": ["D166:vehicle-interface-and-system-integration", "D166:ads-safety-verification-and-validation"],
        "route_condition": "Role assignment integrates road-vehicle ADS hardware/software, sensor networks, control interfaces or fleet test systems, and validates end-to-end system behavior.",
        "source_urls": [URLS["nvidia_vehicle_integration"], URLS["mobileye_system_integrator"]],
        "evidence_summary": "NVIDIA's Vehicle Integration Engineer posting covers integration of AV subsystems into vehicle E/E architecture, cross-stack debug, test-fleet build/sign-off and component validation. Mobileye lists Autonomous Vehicle System Integrator work in hardware/software bring-up, sensor/computing/network integration and system validation.",
        "disposition": "source_backed_role_candidate_for_canonical_route_review",
    },
]


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(text).casefold()).strip()


def main():
    roles = json.loads(ROLE_PATH.read_text(encoding="utf-8"))
    current = {d: {norm(r.get("role_name")) for r in roles if r.get("domain_id") == d} for d in ("D011", "D166")}
    unrelated_food_packaging_titles = {
        d: sorted(name for name in current[d] if "food" in name or "packag" in name)
        for d in ("D011", "D166")
    }
    rows = {d: [] for d in ("D011", "D166")}
    source_registry = {}
    for d in ("D011", "D166"):
        snapshot = json.loads(SNAPSHOTS[d].read_text(encoding="utf-8"))
        decisions = {norm(k): v for k, v in DISPOSITIONS[d].items()}
        legacy = [r for r in snapshot.get("roles", []) if norm(r.get("role")) not in current[d]]
        for r in legacy:
            title = r.get("role", "")
            decision = decisions.get(norm(title))
            if decision is None:
                raise SystemExit(f"Missing title disposition: {d}|{title}")
            status, reason, source_key = decision
            source = SOURCES[source_key]
            rows[d].append({
                "legacy_role_title": title,
                "legacy_isco_code": str(r.get("isco", "")),
                "legacy_aliases": r.get("aka"),
                "current_role_name_match": False,
                "disposition": status,
                "decision": reason,
                "source_key": source_key,
                "source_urls": source["urls"],
                "source_finding": source["finding"],
                "current_canonical_route_added": False,
            })
            for url in source["urls"]:
                source_registry[url] = {"url": url, "source_key": source_key, "source_finding": source["finding"]}
    if len(rows["D011"]) != 13 or len(rows["D166"]) != 21:
        raise SystemExit(f"Unexpected unmatched-title denominator: D011={len(rows['D011'])}, D166={len(rows['D166'])}")
    payload = {
        "schema_version": "2026-10-23.D011-D166-legacy-role-snapshot-dispositions.v1",
        "review_date": TODAY,
        "status": "title_dispositions_complete_for_snapshot_mismatches; canonical_role_updates_not_applied",
        "objective": "Determine why every role title in older D011 and D166 snapshots is absent from current canonical role records, using external task evidence and the current domain area boundaries.",
        "authority_and_scope": {
            "canonical_role_source": "role_library_v3_cleaned.json",
            "historical_role_sources": [str(p.relative_to(ROOT)).replace("\\", "/") for p in SNAPSHOTS.values()],
            "method": "Compare normalized title identity, inspect title aliases, source-backed domain/area boundaries, official occupational task profiles, and relevant current industry roles. Titles remain out of active routes unless a task-specific route meets both the domain and an existing area boundary.",
            "no_role_data_mutation": "This audit resolves historical title mismatches and records source-backed route candidates. It does not change the current canonical role library or area routes.",
        },
        "counts": {
            "D011": {"historical_snapshot": 36, "current_canonical": 28, "name_matches": 23, "unmatched_titles_disposed": len(rows["D011"])},
            "D166": {"historical_snapshot": 30, "current_canonical": 9, "name_matches": 9, "unmatched_titles_disposed": len(rows["D166"])},
        },
        "disposition_rule": "A title is not retained merely because the general occupation operates in finance, engineering, manufacturing, or autonomous technology. Keep it only where source-backed tasks fit the domain and at least one existing area. Use explicit task conditions for broad occupations. Do not turn product-adjacency or sector employment into an area route.",
        "dispositions": rows,
        "new_role_candidates_discovered": NEW_ROLE_CANDIDATES,
        "source_registry": list(source_registry.values()),
        "validation": {
            "all_unmatched_legacy_titles_have_dispositions": True,
            "unmatched_legacy_titles_total": sum(len(v) for v in rows.values()),
            "no_unmatched_title_added_to_canonical_routes": all(not r["current_canonical_route_added"] for values in rows.values() for r in values),
            "conditional_role_candidate_is_task_gated": next(r for r in rows["D166"] if r["legacy_role_title"] == "automation engineer")["disposition"] == "conditional_retain_candidate_for_D166",
            "all_new_candidates_have_sources": all(bool(x["source_urls"]) for x in NEW_ROLE_CANDIDATES),
            "no_food_or_packaging_roles_in_current_D011_or_D166_canonical_library": not any(unrelated_food_packaging_titles.values()),
            "current_D011_D166_food_packaging_role_name_matches": unrelated_food_packaging_titles,
        },
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D011/D166 historical role-title dispositions",
        "",
        f"**Reviewed:** {TODAY}",
        "**Status:** All unmatched historical titles have a disposition; source saturation for the wider domain index remains in progress.",
        "**Scope:** Historical snapshot identities and evidence-backed route decisions only. No canonical role or route data was changed.",
        "**Clarification:** Food and packaging titles below are legacy D166 snapshot entries being explicitly excluded. They are not D011 or D166 canonical roles or recommended student routes; the current canonical role library contains no D011/D166 role title matching food or packaging.",
        "",
        "## Counts",
        "",
        "| Domain | Historical titles | Current canonical titles | Exact normalized matches | Unmatched titles resolved |",
        "| --- | ---: | ---: | ---: | ---: |",
        f"| D011 | 36 | 28 | 23 | {len(rows['D011'])} |",
        f"| D166 | 30 | 9 | 9 | {len(rows['D166'])} |",
        "",
        "## Disposition rule",
        "",
        payload["disposition_rule"],
        "",
    ]
    for d in ("D011", "D166"):
        lines += [f"## {d}", "", "| Historical title | Disposition | Evidence-based decision | Source(s) |", "| --- | --- | --- | --- |"]
        for r in rows[d]:
            links = "; ".join(f"[{u.split('/')[2]}]({u})" for u in r["source_urls"])
            lines.append(f"| {r['legacy_role_title']} | `{r['disposition']}` | {r['decision']} **Evidence:** {r['source_finding']} | {links} |")
        lines.append("")
    lines += ["## Newly source-backed D166 role candidates", "", "These are findings from resolving the old titles; they are recorded for the next canonical role/area reconciliation and have not been inserted into student routes.", ""]
    for r in NEW_ROLE_CANDIDATES:
        links = "; ".join(f"[{u.split('/')[2]}]({u})" for u in r["source_urls"])
        lines.append(f"- **{r['role_title']}** — candidate areas: {', '.join(r['candidate_areas'])}. Condition: {r['route_condition']} Evidence: {r['evidence_summary']} Sources: {links}.")
    lines += ["", "## Current limitations", "", "The historical snapshot title issue is resolved in this audit. The broader D011/D166 source index remains in progress: current canonical-role reference URLs still need exhaustive claim-level inspection, and domain/area/method source saturation is not claimed.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"written": [str(OUT_JSON.relative_to(ROOT)), str(OUT_MD.relative_to(ROOT))], "counts": payload["counts"], "candidate_role_count": len(NEW_ROLE_CANDIDATES), "validation": payload["validation"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
