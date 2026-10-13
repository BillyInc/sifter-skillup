"""Build exact-key D072 geospatial-science role-to-parent-domain review."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
OUT_JSON = HERE / "D072_role_domain_fit_review_2026_10_05.json"
OUT_MD = HERE / "D072_role_domain_fit_review_2026_10_05.md"

USGS_MAPPING = "https://www.usgs.gov/mission-areas/geology-energy-minerals/science/geologic-mapping-and-foundational-science"
USGS_GGGSC = "https://www.usgs.gov/centers/gggsc/science/science-topics"
USGS_CEGIS = "https://www.usgs.gov/centers/cegis/science"
NOAA_HYDROGRAPHY = "https://oceanservice.noaa.gov/navigation/hydro/"
NOAA_HYDROGRAPHY_FACTS = "https://oceanservice.noaa.gov/facts/hydrography.html"
BLS_GEOGRAPHERS = "https://www.bls.gov/ooh/life-physical-and-social-science/geographers.htm"
BLS_HYDROLOGISTS = "https://www.bls.gov/ooh/life-physical-and-social-science/hydrologists.htm"
BLS_GEOTECHNICIANS = "https://www.bls.gov/ooh/life-physical-and-social-science/geological-and-petroleum-technicians.htm"
BLS_SURVEY_TECHS = "https://www.bls.gov/ooh/architecture-and-engineering/surveying-and-mapping-technicians.htm"

# Every key is a current worklist role name. A conditional disposition is used
# only where the described job can be geospatial without that being inherent.
DECISIONS = {
    "cadastral technician": ("supported", "The task explicitly converts survey measurements into cadastral maps showing property boundaries, ownership and land use; this is direct land measurement and mapping work.", None),
    "cartographer": ("supported", "The task creates maps from scientific information, measurements and mathematical notes, directly matching geospatial representation.", None),
    "environmental geologist": ("supported", "The task studies Earth materials and mineral-operation impacts, including land reclamation and pollution; it directly concerns Earth's land and resources.", None),
    "exploration geologist": ("supported", "The task prospects for and characterises mineral deposits and plans exploration, directly matching the domain's study and mapping of minerals and geology.", None),
    "geochemist": ("supported", "The task investigates chemical characteristics of minerals, rocks and soils and their interaction with hydrological systems, directly studying Earth materials and water.", None),
    "geographic information systems specialist": ("supported", "The task processes land and geospatial information into digital maps and geomodels, which is a core GIS function expressly named by the domain.", None),
    "geologist": ("supported", "The task studies Earth's materials, layers, minerals and geologic processes, directly within geoscience as stated in the domain scope.", None),
    "geophysicist": ("supported", "The task applies physical measurements, including seismic, gravity and electromagnetic methods, to determine Earth's structure and composition.", None),
    "hydrogeologist": ("supported", "The task studies groundwater distribution, quality and flow and protects ground and surface water, directly matching the domain's groundwater and Earth-systems scope.", None),
    "hydrographic surveyor": ("supported", "The task measures and maps marine environments and underwater topography; NOAA identifies hydrographic surveying as a primary method for obtaining hydrographic data.", None),
    "hydrologist": ("supported", "The task studies water quality, distribution, movement and sustainable use across Earth's water systems, directly matching the stated hydrology scope.", None),
    "land surveyor": ("supported", "The task measures positions and site features to create construction and land records, directly matching land surveying and spatial measurement.", None),
    "mine geologist": ("supported", "The task locates, quantifies and classifies mineral resources and their geologic structure, directly matching the domain's mineral and subsurface scope.", None),
    "mine surveyor": ("supported", "The task maintains mine plans and records physical mine progress and mineral production, a direct application of surveying and spatial measurement to mines.", None),
    "mineralogist": ("supported", "The task analyses mineral composition, structure and properties, directly studying the Earth's mineral materials.", None),
    "mud logger": ("conditional", "The supplied task analyses drilling fluids, hydrocarbon depth and lithology. Include under this domain only where the assignment creates, interprets or validates subsurface geological/spatial logs; drilling-fluid analysis by itself is not necessarily geospatial mapping.", "Require a documented geologic-log, lithology or spatial-data duty; do not infer GIS work from the occupation title or petroleum context."),
    "oceanographer": ("supported", "The task researches physical, chemical and biological features of oceans and seas, directly matching the domain's water and ocean-science scope.", None),
    "seismologist": ("supported", "The task studies tectonic movement, seismic waves and earthquakes, directly investigating Earth's structure and geophysical processes.", None),
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
    rows = [r for r in queue["role_mappings"] if r["domain_id"] == "D072"]
    by_name = {r["role_name"].casefold(): r for r in rows}
    if len(rows) != 18 or len(by_name) != 18 or set(by_name) != set(DECISIONS):
        raise SystemExit(f"D072 exact queue changed: {len(rows)} mappings; names={sorted(by_name)}")

    decisions = []
    for name, (status, basis, condition) in DECISIONS.items():
        row = by_name[name]
        refs = _source_urls(row["task_source_refs"])
        refs.extend([USGS_MAPPING, USGS_GGGSC, USGS_CEGIS, NOAA_HYDROGRAPHY,
                     NOAA_HYDROGRAPHY_FACTS, BLS_GEOGRAPHERS, BLS_HYDROLOGISTS,
                     BLS_GEOTECHNICIANS, BLS_SURVEY_TECHS])
        decisions.append({
            "role_key": row["role_key"], "role_name": row["role_name"],
            "domain_fit_status": status, "task_evidence": row["role_task_text"],
            "basis": basis, "conditional_scope": condition,
            "source_refs": list(dict.fromkeys(refs)),
            "source_limit": "ESCO/O*NET task profiles identify the mapped occupation tasks; USGS, NOAA and BLS sources corroborate the geoscience, mapping, hydrology, hydrography and survey boundaries. BLS is a US occupational reference and does not establish Nigerian or universal demand, regulation or licensing. The decision is a task-to-parent-domain fit only, not subgroup fit, role eligibility or a student-readiness claim.",
            "recommended_action": "retain_parent_domain_link_candidate" if status == "supported" else "retain_only_with_task_scope_condition",
        })

    counts = Counter(d["domain_fit_status"] for d in decisions)
    return {
        "schema_version": 1, "domain_id": "D072",
        "domain_name": "Geospatial Science and Geographic Information Systems",
        "scope": "D072 only; exact role-task fit against stored parent-domain scope. No subgroup or role-to-specialization decisions.",
        "domain_scope": rows[0]["parent_domain_scope"],
        "method": "Reviewed every exact D072 role key against the stored scope (measurement, mapping and study of land, water, minerals and Earth materials using surveying and GIS). Role tasks were considered individually; occupation membership, role title, ISCO/subgroup and cross-domain repetition are not fit evidence. USGS sources corroborate geologic mapping, geospatial analysis, geophysics, geochemistry and hydrology; NOAA corroborates hydrographic survey; BLS provides occupational boundary references. Mud logger remains conditional because its supplied task is subsurface logging, not inherently GIS or geospatial mapping.",
        "scope_sources": [USGS_MAPPING, USGS_GGGSC, USGS_CEGIS, NOAA_HYDROGRAPHY, NOAA_HYDROGRAPHY_FACTS, BLS_GEOGRAPHERS, BLS_HYDROLOGISTS, BLS_GEOTECHNICIANS, BLS_SURVEY_TECHS],
        "counts": {"reviewed_role_mappings": len(decisions), **{s: counts.get(s, 0) for s in ("supported", "conditional", "unsupported", "unresolved")}},
        "unresolved_fit_decisions": counts.get("unresolved", 0), "decisions": decisions,
        "canonical_changes": 0, "canonical_correction_ready": False,
        "correction_note": "Review artifact only. This report does not modify canonical domain/role data or assess subgroup/specialization fit.",
    }


def main() -> None:
    payload = build()
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts = payload["counts"]
    lines = ["# D072 — Geospatial Science and Geographic Information Systems: role-to-parent-domain fit", "",
             f"**Slice:** {counts['reviewed_role_mappings']}/18 exact mappings reviewed against supplied tasks and stored parent-domain scope. Canonical data unchanged.", "",
             "| Disposition | Count |", "|---|---:|",
             *[f"| {s.title()} | {counts[s]} |" for s in ("supported", "conditional", "unsupported", "unresolved")], "",
             "## Exact decisions", "", "| Role | Result | Task-based rationale |", "|---|---|---|"]
    lines.extend(f"| {d['role_name']} | {d['domain_fit_status']} | {d['basis']}" +
                 (f" **Condition:** {d['conditional_scope']}" if d["conditional_scope"] else "") + " |"
                 for d in payload["decisions"])
    lines.extend(["", "## Evidence and limits", "",
                  f"The [USGS geologic-mapping program]({USGS_MAPPING}) and [USGS Geology, Geophysics, and Geochemistry Science Center]({USGS_GGGSC}) cover mapping, geospatial analysis, hydrogeology, hydrology and Earth-material sciences; [USGS CEGIS]({USGS_CEGIS}) is its geospatial-science source. [NOAA hydrographic surveying]({NOAA_HYDROGRAPHY}) and [NOAA hydrography overview]({NOAA_HYDROGRAPHY_FACTS}) define marine measurement/mapping and bathymetric survey work. BLS occupational descriptions corroborate [GIS-connected geography and mapping occupations]({BLS_GEOGRAPHERS}), [hydrology]({BLS_HYDROLOGISTS}), [geological/hydrologic technicians]({BLS_GEOTECHNICIANS}) and [surveying/mapping technicians]({BLS_SURVEY_TECHS}). These sources support the domain boundary; they are not evidence of Nigerian demand or local licensure.",
                  "", "Mud logger is conditional: the current task text supports subsurface fluid, depth and lithology logging, but it does not establish that every such job performs GIS or produces spatial mapping. Keep the link only where the assignment includes geological-log or spatial-data work.",
                  "", f"- Exact queue coverage: {counts['reviewed_role_mappings']}/18; {counts['supported']} supported, {counts['conditional']} conditional, {counts['unsupported']} unsupported, {counts['unresolved']} unresolved.",
                  "- No canonical taxonomy or specialization files were edited."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(counts, sort_keys=True))


if __name__ == "__main__":
    main()
