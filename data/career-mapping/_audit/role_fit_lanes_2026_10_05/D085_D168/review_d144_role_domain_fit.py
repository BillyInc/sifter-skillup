import json
from collections import Counter
from datetime import date
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE / "D144_role_domain_fit_review_2026_10_05.json"
OUT_MD = LANE / "D144_role_domain_fit_review_2026_10_05.md"

SOURCES = {
    "QUEUE_TASK_PROFILE": {"publisher": "Checked-in role/domain audit queue", "url": "D085_D168_role_fit_queue_2026_10_05.json", "locator": "Exact D144 role_key and task text for all mappings.", "supports": "The atmospheric, climate, meteorological, hydrological and geological tasks assessed.", "limit": "The queue is the audited record, not independent evidence of each occupation's full scope."},
    "NOAA_METEOROLOGY": {"publisher": "U.S. National Oceanic and Atmospheric Administration (NOAA), National Weather Service", "url": "https://www.noaa.gov/careers/meteorology", "locator": "Meteorology definition and forecaster/technician duties: observing and analyzing weather data, forecasts, warnings and collection of meteorological data.", "supports": "Meteorologists, forecasters and weather technicians' tasks.", "limit": "U.S. agency examples corroborate duties but do not establish jurisdiction-specific qualification rules globally."},
    "WMO_CLIMATE_AND_HYDROLOGY": {"publisher": "World Meteorological Organization (WMO)", "url": "https://etrp.wmo.int/pluginfile.php/17116/mod_resource/content/1/WMO%20N%C2%B01083%20-%202015%20Edition.pdf", "locator": "Meteorology/hydrology education and training guide, climatology section: long-term atmospheric behaviour and integration with ocean and hydrology data for climate analysis.", "supports": "D144's explicit climate, oceanography and hydrology scope.", "limit": "Education framework defines discipline content, not a job-mapping rule."},
    "USGS_HYDROLOGIC_TECHNICIAN": {"publisher": "U.S. Geological Survey (USGS)", "url": "https://www.usgs.gov/human-capital/hydrologic-technician-gs-1316", "locator": "Hydrologic technician assignments: install/maintain instruments, collect ground/surface water data, measure stream discharge, observe groundwater and sample water.", "supports": "Hydrologic technician work that supplies hydrology and water-pattern data.", "limit": "Federal job-series examples are U.S.-specific and cited only for task content."},
}

S = "supported"
C = "conditional"
U = "unsupported_for_domain"

DECISIONS = {
    "Atmospheric and Space Scientists": (S, "Analyzes atmospheric phenomena and meteorological observations to prepare reports and forecasts; direct atmospheric/weather science.", ["QUEUE_TASK_PROFILE", "NOAA_METEOROLOGY", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "Atmospheric, Earth, Marine, and Space Sciences Teachers, Postsecondary": (C, "Teaches physical sciences that may include atmospheric, earth or marine science, but the generic record does not establish a climate/meteorology teaching or research assignment.", ["QUEUE_TASK_PROFILE", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "Climate Change Policy Analysts": (C, "Researches climate policy and recommends climate-related actions; this applies climate knowledge, but the listed task is policy analysis rather than climate observation/modeling or meteorological science.", ["QUEUE_TASK_PROFILE", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "Geological Technicians, Except Hydrologic Technicians": (U, "Collects geological exploration/production measurements for mineral, gas, coal or petroleum resources; the task is not the climate, weather or hydrology work in this parent scope.", ["QUEUE_TASK_PROFILE"]),
    "Geoscientists, Except Hydrologists and Geographers": (C, "Studies Earth's physical structure and may include atmosphere/ocean forces, but the stated core is broad geology/exploration and does not establish climate-science or meteorology work.", ["QUEUE_TASK_PROFILE", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "Hydrologic Technicians": (S, "Collects and processes ground/surface-water circulation, flow and water-quality data for hydrology; these are direct supporting measurements for the domain's stated water-pattern analysis.", ["QUEUE_TASK_PROFILE", "USGS_HYDROLOGIC_TECHNICIAN", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "Hydrologists": (S, "Studies surface/groundwater distribution and circulation, precipitation and water movement through the hydrologic cycle; explicit domain scope.", ["QUEUE_TASK_PROFILE", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "aviation meteorologist": (S, "Observes, analyzes and forecasts weather at airports and advises pilots/operators; direct applied meteorology.", ["QUEUE_TASK_PROFILE", "NOAA_METEOROLOGY"]),
    "climatologist": (S, "Analyzes historical weather and long-term climate trends and forecasts climate patterns; direct climatology.", ["QUEUE_TASK_PROFILE", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "hydrologist": (S, "Studies water quality, distribution and sustainable water supply; direct hydrology as named in the domain scope.", ["QUEUE_TASK_PROFILE", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "meteorologist": (S, "Measures and predicts weather/climate processes, develops forecast models/instruments and analyzes meteorological data; direct domain work.", ["QUEUE_TASK_PROFILE", "NOAA_METEOROLOGY", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "meteorology technician": (S, "Collects meteorological observations with specialized instruments and supports forecasting operations; direct technical work supporting weather science.", ["QUEUE_TASK_PROFILE", "NOAA_METEOROLOGY"]),
    "oceanographer": (S, "Studies physical, chemical and geological properties of oceans; the domain scope explicitly includes ocean patterns and climate interactions.", ["QUEUE_TASK_PROFILE", "WMO_CLIMATE_AND_HYDROLOGY"]),
    "weather forecaster": (S, "Uses meteorological data to predict and communicate weather conditions; direct operational meteorology.", ["QUEUE_TASK_PROFILE", "NOAA_METEOROLOGY"]),
}


def main() -> None:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    rows = [row for row in queue["unresolved_rows"] if row["domain_id"] == "D144"]
    names = [row["role_name"] for row in rows]
    if len(rows) != 14 or len(names) != len(set(names)) or set(names) != set(DECISIONS):
        raise SystemExit(f"D144 exact queue mismatch: queued={sorted(names)} decided={sorted(DECISIONS)}")
    decisions = []
    for row in sorted(rows, key=lambda item: item["role_key"]):
        fit, rationale, refs = DECISIONS[row["role_name"]]
        decisions.append({"role_key": row["role_key"], "role_name": row["role_name"], "task_evidence": row["role_description"], "esco_uri": (row.get("esco_occupation_uris") or [None])[0], "onet_codes": row.get("onet_occupation_codes", []), "domain_fit": fit, "rationale": rationale, "source_refs": refs})
    tally = Counter(item["domain_fit"] for item in decisions)
    payload = {
        "schema_version": "2026-10-05.role-domain-fit-lane.v1", "audit_date": date.today().isoformat(),
        "domain_id": "D144", "domain_name": rows[0]["domain_name"], "scope": rows[0]["domain_scope"],
        "method": "Compare recorded duties with atmospheric science, weather forecasting, climatology, hydrology and ocean patterns stated in the parent scope. Direct observation, analysis, forecasting or hydrologic data collection is supported. Climate-policy, broad teaching/geoscience roles are conditional where a relevant assignment is not specified. Geological resource-exploration work is outside this parent scope. Subgroup membership is not used as proof.",
        "counts": {"mappings_reviewed": len(decisions), "supported": tally[S], "conditional": tally[C], "unsupported_for_domain": tally[U], "unresolved": tally["unresolved"]},
        "decisions": decisions, "sources": SOURCES,
        "notes": ["All 14 exact D144 queue roles were compared to their task descriptions.", "NOAA, WMO and USGS sources corroborate occupational/discipline tasks; they do not impose country-specific credentials on this taxonomy.", "No role-to-specialization assignment, student-path recommendation or canonical mapping/taxonomy change is made."],
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# D144 role-to-parent-domain fit review — 2026-10-05", "", f"Scope: {payload['scope']}", "", f"- Exact queued roles reviewed: **{len(decisions)}**", f"- Supported: **{tally[S]}**", f"- Conditional: **{tally[C]}**", f"- Unsupported for this parent: **{tally[U]}**", f"- Unresolved: **{tally['unresolved']}**", "", "| Exact role key | Recorded task evidence | Parent fit | Reason |", "|---|---|---|---|"]
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
