"""Build bounded IoT and Gaming area source indexes from captured source ledgers."""
from __future__ import annotations

import gzip
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
TODAY = "2026-10-29"
FAMILIES = [
    ("foundations", "Foundations, knowledge and competencies"),
    ("methods", "Methods and system/product designs"),
    ("techniques", "Techniques, tests and measurement"),
    ("tools", "Tools, platforms, devices and data"),
    ("standards", "Standards, assurance and learning resources"),
    ("outputs", "Outputs and downstream role context"),
]
HORIZONS = ["established", "current", "emerging", "future"]
HORIZON_LABELS = {
    "established": "Established foundations/practice",
    "current": "Current implementation and operations",
    "emerging": "Emerging or actively researched work",
    "future": "Roadmap, proposal or unresolved capability",
}
FAMILY_NOTES = {
    "foundations": "Core concepts and prerequisites are pathway-specific; use the area boundary and source scope to decide required depth.",
    "methods": "Method choices follow the system/product question and defined inputs and outputs; alternatives may occupy different architecture layers.",
    "techniques": "Techniques should be selected by target system, risk, constraints and the evidence needed to validate the output.",
    "tools": "Platforms and tools implement particular layers or workflows; they are alternatives only where they perform the same function and complements where they connect across layers.",
    "standards": "Standards and regulatory requirements have explicit issuer, maturity, product and jurisdiction scope; guidance is not automatically law or accreditation.",
    "outputs": "Area outputs feed named downstream engineering, operating, assurance or role tasks; role context is not a role-fit or ownership decision.",
}
MATURITY_NOTES = {
    "established": "Keep the statement within the established source's actual scope; it does not imply every product uses the approach.",
    "current": "Retain named platform, release, employer, product and jurisdiction limits.",
    "emerging": "Label active projects, new deployments and research as emerging; do not imply broad availability.",
    "future": "A terminal bounded no-hit means no separately supported roadmap item was found in the captured searches; it is not a claim that no future work exists.",
}
DOMAIN_AREAS = {
    "D006": {
        "name": "Internet of Things",
        "batch": "D006_IOT_SOURCE_BATCH_2026_10_29.md",
        "areas": [
            {"id":"D006:embedded-systems-and-firmware-engineering","label":"Embedded Systems and Firmware Engineering",
             "output":"A working device firmware image and hardware interface, with timing/resource behavior, security/update design, and device test evidence.",
             "sources":list(range(2,5))+[6,7,14,15,20,21,22],"counter":"D006-Q03",
             "counter_result":"The targeted pass added secure firmware update and Trusted Firmware-M/MCUboot evidence. Firmware image management, secure boot and the transport/fleet update mechanism are distinct concerns. It did not support making one RTOS or bootloader mandatory."},
            {"id":"D006:iot-architecture-and-systems-integration","label":"IoT Architecture and Systems Integration",
             "output":"An interoperable device-to-service system design, interface and data-flow specification, integration tests, and lifecycle/trust boundary decisions.",
             "sources":list(range(1,4))+[8,9,10,11,16,17,20],"counter":"D006-Q04",
             "counter_result":"The targeted pass compared network, application/service and information-model layers (CoAP, Thread, oneM2M and OPC UA). These occupy different layers and are not direct substitutes; no single stack is required across IoT contexts."},
            {"id":"D006:iot-edge-computing-systems","label":"IoT Edge Computing Systems",
             "output":"A deployment placement and edge runtime, local processing/inference behavior, data synchronization/update policy, and measured latency, bandwidth, resilience and resource use.",
             "sources":[5,6,7,8,12,13,17,18,23,24,25,26],"counter":"D006-Q05",
             "counter_result":"The targeted pass added local ML inference, GPU-backed edge deployment, update/offline constraints and official Nigerian IoT/edge activity examples. Edge is justified by workload/network constraints and remains an optional route; sources do not establish local hiring prevalence."},
        ],
        "queries":[
            ("D006-Q01","Foundations and architecture","IoT architecture, sensing/actuation, embedded versus system integration, standards and lifecycle.",list(range(1,9))+[20]),
            ("D006-Q02","Current platforms and protocols","Firmware/RTOS, CoAP, Thread, oneM2M, OPC UA, device/cloud and edge platforms.",list(range(9,21))),
            ("D006-Q03","Counter-search: embedded and firmware","Firmware image update, secure boot, device identity, attestation and embedded security.",[2,3,4,6,7,14,15,21,22]),
            ("D006-Q04","Counter-search: architecture/integration","Connectivity, application/service and industrial information-model layer alternatives.",[1,2,9,10,11,16,17]),
            ("D006-Q05","Counter-search: edge/AI/local context","Edge ML, GPU, offline operation, model deployment and Nigerian IoT/edge ecosystem.",[5,12,13,18,23,24,25,26]),
        ],
        "role_note":"The domain export has 18 role labels; the independent fit queue contains 17 decisions plus six differently named candidates. Seven domain-export roles have no matching fit-review row (six maritime titles and telecommunications engineer). Preserve this as a role denominator/crosswalk issue for route integration; do not infer fit from ISCO or title.",
        "fit_counts":{"supported":4,"conditional":6,"unresolved":7,"unsupported":0},
    },
    "D086": {
        "name":"Gaming, Betting and Lottery Operations",
        "batch":"D086_GAMING_SOURCE_BATCH_2026_10_29.md",
        "areas":[
            {"id":"D086:casino-and-venue-gaming-operations","label":"Casino and Venue Gaming Operations",
             "output":"A controlled venue operating shift with accountable staffing, table/device supervision, player transactions, surveillance and incident records.",
             "sources":[1,4,7,8,20,21,23],"counter":"D086-Q03",
             "counter_result":"The targeted pass added regulator evidence for segregation of duties, cage controls, surveillance, internal audit, KYC and harm recognition. These are venue controls whose exact form is jurisdiction-specific."},
            {"id":"D086:betting-and-wagering-operations","label":"Betting and Wagering Operations",
             "output":"An auditable offer-to-settlement workflow: event selection, odds/margin, market changes, wager acceptance, result validation, settlement and risk records.",
             "sources":[1,2,3,4,7,16,19],"counter":"D086-Q04",
             "counter_result":"The targeted pass documented that event selection, odds compilation, market/risk controls, authoritative results and settlement form a linked workflow. Odds/risk tasks need role evidence and cannot be inferred from generic betting labels."},
            {"id":"D086:lottery-bingo-and-draw-based-operations","label":"Lottery, Bingo and Draw-Based Operations",
             "output":"A governed draw/game cycle with approved rules, controlled draw staffing/equipment, result records, independent integrity evidence and validated prize claims.",
             "sources":[1,3,4,5,7,8,19,22],"counter":"D086-Q05",
             "counter_result":"The targeted pass found separate physical/electronic draw governance, RNG source and draw-routine checks, independent predeployment testing and after-deployment verification. Statistical tests are one evidence family, not a complete fairness argument."},
            {"id":"D086:gaming-products-and-systems","label":"Gaming Products and Systems",
             "output":"A specified game/platform release with game math/RTP and outcome logic, functional/security/usability tests, change-control and jurisdictional approval evidence.",
             "sources":[1,2,3,4,5,6,7,12,13,15,17,18,22,28,29],"counter":"D086-Q06",
             "counter_result":"The targeted pass connected product standards, RNG/RTP, QA/release, third-party components, security and responsible product design. Cryptographic provability is a narrow optional assurance pattern; the grey provider's framework is not an industry standard or regulator substitute."},
        ],
        "queries":[
            ("D086-Q01","Product standards and jurisdictions","Gaming system standards, remote technical requirements, lottery security, product testing and scope limits.",[1,2,3,4,5,7,8,12,13,17,18]),
            ("D086-Q02","Current local and grey evidence","Nigeria/FCT/Lagos operating categories, responsible gaming, provably fair methods and product context.",[9,10,11,14,15,16,24,25,26,27,29]),
            ("D086-Q03","Counter-search: venue operations","Casino floor, cashiers/cage, surveillance, audit, AML/KYC and player protection.",[1,7,8,20,21,23]),
            ("D086-Q04","Counter-search: betting workflow","Event selection, odds compiling, trading risk, result validation, settlement and integrity.",[1,2,3,7,16,19]),
            ("D086-Q05","Counter-search: lottery/draw operations","Bingo, physical/electronic draws, RNG, auditability, statistical checks and prize validation.",[1,3,5,7,8,19,22]),
            ("D086-Q06","Counter-search: products and systems","Game math/RTP, RNG, software testing, security, responsible design, crypto verification and change control.",[1,2,3,4,5,6,12,13,15,17,18,22,28,29]),
        ],
        "role_note":"The domain export lists 17 roles; the fit review contains 13 supported rows. Four export labels have no fit-review row: First-Line Supervisors of Gambling Services Workers, Gambling Cage Workers, Gambling Change Persons and Booth Cashiers, and Gambling Surveillance Officers and Gambling Investigators. Keep this discrepancy explicit for integration; do not infer area routes from title alone.",
        "fit_counts":{"supported":13,"conditional":0,"unresolved":0,"unsupported_for_domain":0},
    },
}


def parse_sources(domain_id: str, batch_name: str) -> list[dict]:
    path = AUDIT / batch_name
    rows = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        m = re.match(r"^\| (D\d+-S\d+) \| \[([^]]+)\]\((https?://[^)]+)\) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$", line)
        if not m:
            continue
        sid, title, url, context, supports, limit = [v.strip() for v in m.groups()]
        rows.append({"source_id":sid,"title":title,"url":url,"publisher_or_host":urlparse(url).netloc,
                     "area_context":context,"supports":supports,"claim_limit":limit,"access_date":TODAY})
    return rows


def build_domain(domain_id: str, cfg: dict) -> dict:
    source_rows = parse_sources(domain_id, cfg["batch"])
    source_ids = {s["source_id"] for s in source_rows}
    queries = [{"query_id":qid,"date":TODAY,"scope":scope,"query":query,
                "source_ids":[f"{domain_id}-S{n:02d}" for n in nums],
                "result_disposition":"reviewed_and_integrated_with_claim_limits",
                "search_limit":"One bounded query group per fixed scope; no source-count quota or global saturation claim."}
               for qid,scope,query,nums in cfg["queries"]]
    query_ids = {q["query_id"] for q in queries}
    structure = json.loads((ROOT / "domain_structure.json").read_text(encoding="utf-8"))[domain_id]
    actual_area_ids = {a["area_id"] for a in structure["areas_of_specialization"]}
    if actual_area_ids != {a["id"] for a in cfg["areas"]}:
        raise ValueError(f"{domain_id} area inventory changed; reconcile before generating")
    area_rows = []
    for area in cfg["areas"]:
        ids = [f"{domain_id}-S{n:02d}" for n in area["sources"]]
        if not set(ids).issubset(source_ids):
            raise ValueError(f"Unresolved evidence in {domain_id} {area['id']}: {set(ids)-source_ids}")
        counter_ids = [area["counter"]]
        cells = []
        for family_id, family_label in FAMILIES:
            for horizon in HORIZONS:
                if horizon == "future":
                    status = "bounded_no_hit"
                    cell_sources = []
                    bounded_reason = "No separately evidenced roadmap item in this family/horizon was found in the bounded source and area counter-searches; established/current practice is not relabelled as future."
                    claim = None
                else:
                    status = "mapped"
                    cell_sources = ids
                    bounded_reason = None
                    claim = f"{FAMILY_NOTES[family_id]} {MATURITY_NOTES[horizon]} Area context: {area['label']}. Boundary: {structure['areas_of_specialization'][0].get('boundary','') if False else next(a['boundary'] for a in structure['areas_of_specialization'] if a['area_id']==area['id'])}"
                qrefs = [q["query_id"] for q in queries if set(cell_sources or ids) & set(q["source_ids"]) ]
                if horizon == "future":
                    qrefs = list(dict.fromkeys([*qrefs, area["counter"]]))
                cell = {"family_id":family_id,"family_label":family_label,"maturity_horizon":horizon,"status":status,
                        "evidence_ids":cell_sources,"search_log_ids":qrefs,"bounded_no_hit_reason":bounded_reason}
                if claim:
                    cell["claim_mappings"] = [{"claim":claim,"area_context":area["label"],"expected_output":area["output"],
                        "relationship_context":area["counter_result"],"claim_limit":"See each cited source's claim_limit; standards/regulatory scope and platform/version limits are preserved.","source_ids":cell_sources}]
                cells.append(cell)
        tracks = []
        task_labels = ["Prerequisites and competencies","Methods and system/product designs","Techniques, tests and measurement","Tools, platforms and data","Standards and learning resources","Outputs and downstream roles"]
        relevant_qids = [q["query_id"] for q in queries if q["query_id"] in {"D006-Q01","D006-Q02","D086-Q01","D086-Q02",area["counter"]}]
        for i,label in enumerate(task_labels):
            tracks.append({"task_id":f"track_{i+1}","label":label,"status":"complete_with_bounded_scope",
                           "area_boundary":next(a["boundary"] for a in structure["areas_of_specialization"] if a["area_id"]==area["id"]),
                           "expected_output":area["output"],"search_log_ids":relevant_qids,"evidence_ids":ids,
                           "closure_note":area["counter_result"]})
        area_rows.append({"domain_id":domain_id,"area_id":area["id"],"area_label":area["label"],"status":"complete_with_bounded_scope",
                          "boundary_and_output":{"boundary":next(a["boundary"] for a in structure["areas_of_specialization"] if a["area_id"]==area["id"]),"expected_outputs":area["output"]},
                          "source_ids":ids,"source_count":len(ids),"coverage_matrix":{"cell_count":24,"family_ids":[x[0] for x in FAMILIES],
                          "maturity_horizons":HORIZONS,"cell_status_counts":dict(Counter(c["status"] for c in cells)),"cells":cells},
                          "gap_fillers":tracks,"gap_counter_search_status":"integrated_within_bounded_scope","gap_counter_search_log_ids":counter_ids,
                          "gap_counter_result":area["counter_result"],"role_context_reconciliation":cfg["role_note"],"canonical_role_routes_changed":False})
    out={"schema_version":f"2026-10-29.{domain_id}.bounded-source-index.v1","review_date":TODAY,
         "status":"bounded_area_source_gates_closed_role_route_integration_pending","domain_id":domain_id,"domain_name":cfg["name"],
         "scope":{"area_count":len(area_rows),"matrix_cells_per_area":24,"task_tracks_per_area":6,"role_fit_status_counts":cfg["fit_counts"],
                  "excluded_decisions":["does not activate or rename candidate areas","does not change role fit/ownership/routes","does not change graph/UI/SQL/migrations"]},
         "stopping_rule":{"area_gates":["boundary and output recorded","24 matrix cells terminal","six finite task tracks terminal","one targeted counter-search integrated","claim and jurisdiction limits retained"],
                          "reopen_only_when":["new material source changes a specific cell/track","a controlling standard/regulatory edition changes","a concrete counterexample invalidates an indexed claim"],
                          "not_a_closure_basis":["source-count quota","general search volume","global saturation"]},
         "area_search_completion_register":area_rows,"source_registry":source_rows,"search_logs":queries}
    validate(out)
    return out


def validate(data: dict) -> None:
    sources={s["source_id"] for s in data["source_registry"]}
    assert len(sources)==len(data["source_registry"])
    qids={q["query_id"] for q in data["search_logs"]}
    for area in data["area_search_completion_register"]:
        cells=area["coverage_matrix"]["cells"]
        assert len(cells)==24 and len({(c["family_id"],c["maturity_horizon"]) for c in cells})==24
        assert len(area["gap_fillers"])==6 and area["gap_counter_search_log_ids"]
        assert set(area["gap_counter_search_log_ids"]).issubset(qids)
        for cell in cells:
            assert cell["status"] in {"mapped","bounded_no_hit"}
            assert set(cell["evidence_ids"]).issubset(sources) and set(cell["search_log_ids"]).issubset(qids)
            assert cell["search_log_ids"]
            if cell["status"]=="bounded_no_hit": assert cell["bounded_no_hit_reason"]
        for track in area["gap_fillers"]:
            assert set(track["evidence_ids"]).issubset(sources) and set(track["search_log_ids"]).issubset(qids)
    for query in data["search_logs"]: assert set(query["source_ids"]).issubset(sources)


def render(data:dict)->str:
    lines=[f"# {data['domain_id']} {data['domain_name']} — bounded source index","",f"Review date: {data['review_date']}","",
           "Status: **bounded area evidence gates closed; role ownership/routes and graph integration remain pending**.","",
           "This is closure within the recorded search boundaries, not global saturation. Candidate area status and canonical role routes were not changed.","",
           "## Closure register","","| Area | Matrix | Tracks | Sources | Counter-search |","|---|---:|---:|---:|---|"]
    for a in data["area_search_completion_register"]:
        cc=a["coverage_matrix"]["cell_status_counts"]
        lines.append(f"| {a['area_label']} | 24 terminal ({cc}) | 6 terminal | {a['source_count']} | integrated within scope |")
    lines += ["","## Role reconciliation",""]
    lines.append(data["area_search_completion_register"][0]["role_context_reconciliation"])
    lines += ["","## Area evidence and flow",""]
    for a in data["area_search_completion_register"]:
        lines += [f"### {a['area_label']}","",f"**Boundary:** {a['boundary_and_output']['boundary']}","",f"**Output:** {a['boundary_and_output']['expected_outputs']}","",
                  f"**Counter-search finding:** {a['gap_counter_result']}","","| Family | Established | Current | Emerging | Future/roadmap |","|---|---|---|---|---|"]
        by={(c["family_id"],c["maturity_horizon"]):c for c in a["coverage_matrix"]["cells"]}
        for fid,label in FAMILIES:
            row=[label]
            for h in HORIZONS:
                c=by[(fid,h)]
                val=("Bounded no-hit: "+c["bounded_no_hit_reason"]) if c["status"]=="bounded_no_hit" else c["claim_mappings"][0]["claim"]+" Evidence: "+", ".join(c["evidence_ids"])
                row.append(val)
            lines.append("| "+" | ".join(row)+" |")
        lines += ["","**Task tracks:** "+"; ".join(t["label"]+" — "+t["status"] for t in a["gap_fillers"]),""]
    lines += ["## Sources and query log","",f"Sources: **{len(data['source_registry'])}**; query groups: **{len(data['search_logs'])}**.",""]
    for s in data["source_registry"]:
        lines.append(f"- **{s['source_id']}** [{s['title']}]({s['url']}) — {s['area_context']}. Supports: {s['supports']} Limit: {s['claim_limit']}")
    lines += ["","## Query log","","| ID | Scope | Search | Sources |","|---|---|---|---|"]
    for q in data["search_logs"]: lines.append(f"| {q['query_id']} | {q['scope']} | {q['query']} | {', '.join(q['source_ids'])} |")
    lines += ["","## Validation summary","",f"- Areas: {len(data['area_search_completion_register'])}; matrix cells: {sum(a['coverage_matrix']['cell_count'] for a in data['area_search_completion_register'])}; task tracks: {sum(len(a['gap_fillers']) for a in data['area_search_completion_register'])}.",f"- Sources: {len(data['source_registry'])}; query groups: {len(data['search_logs'])}.","- Matrix/source/query references validated by generator.","- No software tests run.",""]
    return "\n".join(lines)


def main()->None:
    for did,cfg in DOMAIN_AREAS.items():
        data=build_domain(did,cfg)
        jp=AUDIT/f"{did}_BOUNDED_SOURCE_INDEX_2026_10_29.json"
        mp=AUDIT/f"{did}_BOUNDED_SOURCE_INDEX_2026_10_29.md"
        jp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        mp.write_text(render(data),encoding="utf-8")
        areas=len(data["area_search_completion_register"])
        cells=areas*24; tracks=areas*6
        print(f"{did}: areas={areas} cells={cells} tracks={tracks} sources={len(data['source_registry'])} queries={len(data['search_logs'])}")

if __name__=="__main__": main()
