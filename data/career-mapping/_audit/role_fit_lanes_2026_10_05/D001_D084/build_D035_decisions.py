"""Build D035 task-based role-to-parent-domain decisions; title-independent."""
from __future__ import annotations
import json
import re
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D009_D044_parent_domain_review_worklist.json"
OUTPUT = HERE / "D035_role_domain_fit_2026_10_05.json"
CILT = "https://ciltinternational.org/about-cilt/about-cilt-international/"
UNECE = "https://unece.org/info/Transport/pub/411667"
ICAO = "https://www.icao.int/air-traffic-management-atm"
OTIF = "https://otif.org/fileadmin/docs/Activities/Technical_Interoperability/Working_Group_Tech/Working_Documents/2025/TECH-25060-CTE-WGT57-5.2-e-Digitalisation_and_the_role_of_OTIF-v3.pdf"

TRANSPORT = re.compile(r"\b(transport\w*|traffic|route\w*|dispatch\w*|airport|aircraft|rail\w*|road|tram|taxi|bus|coach|passenger\w*|flight\w*|vessel\w*|ship\w*|port\w*|cargo|freight|baggage|luggage|distribution|driv\w*|shipping|logistics|journey|fleet|vehicle\w*|loading|unloading|pipeline|warehouse|forklift|customs|import|export)\b", re.I)
OPERATION = re.compile(r"\b(operat\w*|drive\w*|coordinat\w*|dispatch\w*|control\w*|schedule\w*|plan\w*|manage\w*|transport\w*|deliver\w*|load\w*|unload\w*|distribut\w*|monitor\w*|direct\w*|track\w*|route\w*|pilot\w*|navigate\w*|handle\w*|maintain\w*|receive\w*|move\w*|assign\w*|clear\w*|import\w*|export\w*|store\w*|stack\w*|ship\w*|drive\w*|carry\w*)\b", re.I)
DIRECT_TRANSPORT = re.compile(r"\b(air traffic|ground control|flight flow|aircraft dispatcher|airport.{0,30}operations|baggage.{0,30}(?:flow|connections|handlers?)|luggage.{0,40}(?:passengers|airport|terminals)|passenger\w*.{0,50}(?:bus|coach|route|transport)|bus driver|bus(?:es)? or coaches|operate buses|operate trams|trolley buses|drive and operate trucks|emergency.{0,25}vehicles|fire service vehicles|cargo|freight|distribution of (?:goods|products|materials|supplies|commodit\w*)|distribution managers? plan|warehouse operations|storage facilities|forklift\w*.{0,80}(?:move|stack|merchandise)|customs clearance|customs barriers|passage of goods through customs|import and export goods|import/export goods|shipping agent|shipments by|rail logistics|route\w*.{0,40}(?:transport|goods)|pipeline.{0,40}transport|transport.{0,40}(?:people|passengers|goods|cargo|freight)|movement of (?:people|goods|passengers|vehicles|vessels)|vehicle\w*.{0,50}(?:routes|drivers|transport)|dispatch\w*.{0,50}(?:vehicles|freight|cargo)|distribution centre.{0,50}shipping|goods.{0,50}(?:store|deliver|transport|distribut)|warehous\w*.{0,50}(?:store|stock|receive|operate)|loading.{0,50}(?:cargo|flight|goods)|customs clearance and documentation|coordinat\w*.{0,50}water transport|inland water transport.{0,80}dispatch|maritime water transport.{0,80}vessel|intermodal logistics|logistics and distribution|logistic services|forwarding operations|transporters provide transport|handling and storage of materials|physical handling of goods|moving services|drivers? operate (?:buses|trucks|coaches)|tow truck|refuell?ing of planes|ship agents?.{0,80}cargo|rail operations|road transportation processes|operation of train stations|railway station operations|order pickers?.{0,60}orders|supply chain.{0,150}distribution of finished products)\b", re.I)
CONDITIONAL_TRANSPORT = re.compile(r"\b(import export|cross-border business|airport director|transportation, or|logistical details|shipping companies|vessel operations|transport recommendation|transport-related|freight forwarding)\b", re.I)

def source_url(ref: str) -> str | None:
    if ref.startswith("ESCO:"):
        return ref[5:].split("@", 1)[0]
    if ref.startswith("ONET:"):
        return "https://www.onetonline.org/link/summary/" + ref[5:].split("@", 1)[0]
    if ref.startswith("URL:"):
        return ref[4:].split("@", 1)[0]
    return None

def decide(task: str) -> tuple[str, str, str]:
    task = " ".join((task or "").split())
    movement = TRANSPORT.search(task)
    action = OPERATION.search(task)
    direct = DIRECT_TRANSPORT.search(task)
    if direct and action:
        phrase = task[max(0, movement.start()-45):min(len(task), movement.end()+95)].strip()
        return (
            "supported",
            f"The task profile explicitly describes “{phrase}” and performs a movement, handling, dispatch, storage, traffic, or terminal operation. This is direct logistics/transport operations under the CILT/UNECE scope.",
            "The occupational profile is representative rather than a guarantee of every incumbent's duties. Any regulated qualification or licence remains jurisdiction-specific.",
        )
    if movement and (action or CONDITIONAL_TRANSPORT.search(task)):
        phrase = task[max(0, movement.start()-45):min(len(task), movement.end()+95)].strip()
        return (
            "conditional",
            f"The task includes transport/logistics context (“{phrase}”), but the source description is broad or lists transport as only one possible responsibility. Treat fit as conditional until the role's actual transport-operations assignment is established.",
            "Industry adjacency or an occasional transport duty is not enough to claim that every role in this occupation performs transport operations.",
        )
    if len(task) < 60:
        return ("unresolved", "The task description is too sparse to establish a transport-operations function; no fit is inferred from title or subgroup.", "Needs a fuller occupational task source.")
    return (
        "unsupported",
        "The stored task description does not establish movement of people/goods or coordination/control of a transport service, vehicle, route, traffic flow, fleet, or terminal operation.",
        "This excludes the current mapping on the available task evidence; it does not claim the occupation can never work in a transport employer.",
    )

def main() -> None:
    data = json.loads(WORKLIST.read_text(encoding="utf-8"))
    rows = [r for r in data["role_mappings"] if r["domain_id"] == "D035"]
    if len(rows) != 143 or {r["domain_name"] for r in rows} != {"Logistics and Transportation Operations"}:
        raise SystemExit("D035 exact-key queue changed; reconcile before materializing")
    decisions = []
    for row in rows:
        status, basis, limit = decide(row.get("role_task_text") or "")
        refs = list(dict.fromkeys(source_url(ref) for ref in row["task_source_refs"] if source_url(ref)))
        if not refs:
            status, basis, limit = "unresolved", "No joined role-task source URL is available; no fit is inferred.", "Attach/verify an occupational source before disposition."
        else:
            refs.extend((CILT, UNECE))
            task = row.get("role_task_text") or ""
            if re.search(r"\b(airport|aircraft|flight|air traffic)\b", task, re.I): refs.append(ICAO)
            if re.search(r"\b(rail|train)\b", task, re.I): refs.append(OTIF)
        decisions.append({"role_key": row["role_key"], "domain_fit_status": status, "task_evidence": row.get("role_task_text") or "", "basis": basis, "source_refs": list(dict.fromkeys(refs)), "source_limit": limit})
    counts = Counter(d["domain_fit_status"] for d in decisions)
    out = {
        "schema_version": 1,
        "domain_id": "D035",
        "domain_name": "Logistics and Transportation Operations",
        "scope": "D035 only; parent-domain fit from role task text. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Assess the stored role task for actual movement/handling of people or goods and operation/coordination of transport services, vehicles, routes, traffic, fleets, storage, or terminals. Direct task descriptions are supported; broad/occasional transport context is conditional; unrelated or title-only associations are excluded. ISCO subgroup/current placement is not evidence; sparse task profiles fail closed.",
        "scope_sources": [CILT, UNECE],
        "source_limit_policy": "CILT/UNECE scope references and ESCO/O*NET task profiles establish classification boundaries and representative work, not universal licensure or demand. Aviation/rail standards are attached only when the task text indicates those modes.",
        "counts": {"reviewed_role_mappings": len(decisions), **{k: counts.get(k, 0) for k in ("supported", "conditional", "unsupported", "unresolved")}},
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": out["counts"]}, ensure_ascii=False))

if __name__ == "__main__": main()
