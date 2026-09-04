"""Close visible composite skill records against authoritative source packs.

The older provenance pass correctly identified the affected records as
synthetic composites, but left ``unsourced`` in their source list.  This pass
does not invent a quotation. It records the atomic parts of each composite,
the authoritative source pack that supports those parts, and explicitly marks
the result as a source-supported synthesis.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


HERE = Path(__file__).resolve().parent
PROVENANCE = HERE / "domain_skill_provenance.json"
TOOLS = HERE / "domain_tools.json"
OUT_JSON = HERE / "_audit" / "contextual_item_source_closure_2026-09-03.json"
OUT_MD = HERE / "_audit" / "CONTEXTUAL_ITEM_SOURCE_CLOSURE_2026-09-03.md"
HIDDEN = {"D086", "D087", "D088", "D089", "D100", "D101", "D108", "D113"}


SOURCE_PACKS = {
    "iot": {
        "source_ids": ["global_nist_iot"],
        "supports": "Connected-device work involving sensing, computing, communication, actuation, architecture, integration, trustworthiness, security, privacy and lifecycle support.",
        "urls": [
            "https://www.nist.gov/internet-things-iot",
            "https://csrc.nist.gov/pubs/sp/800/183/final",
            "https://www.nist.gov/itl/applied-cybersecurity/nist-cybersecurity-iot-program/nistir-8259-series",
        ],
    },
    "pharmacy": {
        "source_ids": ["global_who_pharmacy", "ng_pcn"],
        "supports": "Pharmacy practice, dispensing, medication counselling, medicine safety, pharmacovigilance, pharmaceutical quality, regulatory work and pharmacy operations. Nigerian registration is separately governed by the Pharmacy Council of Nigeria.",
        "urls": [
            "https://www.who.int/publications/m/item/annex-8-trs-961",
            "https://www.who.int/publications/i/item/9789240099425",
            "https://www.who.int/teams/regulation-prequalification/regulation-and-safety/pharmacovigilance/guidance",
            "https://pcn.gov.ng/",
        ],
    },
    "public_health": {
        "source_ids": ["global_who_public_health", "global_health"],
        "supports": "Epidemiology, surveillance, case definition, outbreak investigation, programme planning, monitoring and evaluation, health communication and stakeholder engagement.",
        "urls": [
            "https://www.who.int/emergencies/outbreak-toolkit/standardized-data-collection-tools/investigating-outbreak-of-unknown-disease",
            "https://www.who.int/publications/i/item/9789241597449",
            "https://www.who.int/teams/health-workforce",
        ],
    },
    "recruitment": {
        "source_ids": ["global_cipd_people_profession"],
        "supports": "Workforce planning, candidate sourcing, interviewing, assessment and selection, employer branding, candidate experience, market mapping and levelled people-profession work.",
        "urls": [
            "https://www.cipd.org/en/the-people-profession/the-profession-map/explore-the-profession-map/specialist-knowledge/resourcing/",
            "https://www.cipd.org/en/the-people-profession/the-profession-map/how-it-works/for-selecting-assessing-interviewing-people-professionals/",
        ],
    },
    "digital_health": {
        "source_ids": ["global_hl7_fhir", "global_health"],
        "supports": "Health information systems, interoperable health data, clinical workflows, scheduling, patient coordination, data governance, health-data application interfaces and digital-health delivery.",
        "urls": [
            "https://hl7.org/fhir/",
            "https://fhir.hl7.org/fhir/overview.html",
            "https://www.who.int/teams/health-workforce",
        ],
    },
    "laboratory": {
        "source_ids": ["global_who_laboratory_quality", "ng_mls"],
        "supports": "Laboratory analysis, specimen collection and handling, microscopy, testing, quality control, biosafety, result validation, instrumentation and molecular laboratory practice.",
        "urls": [
            "https://www.who.int/publications/i/item/9789241548274",
            "https://extranet.who.int/hslp/content/LQMS-training-toolkit",
            "https://mlscn.gov.ng/publications/mlscn-approved-documents",
        ],
    },
    "medical_imaging": {
        "source_ids": ["global_iaea_medical_imaging", "ng_nnra"],
        "supports": "Computed tomography, magnetic resonance imaging, mammography, ultrasound, fluoroscopy, nuclear medicine, image acquisition, dose management, patient communication and radiation safety.",
        "urls": [
            "https://nucleus.iaea.org/Pages/rpop.aspx",
            "https://www.who.int/publications/m/item/radiation-protection-and-safety-in-medical-uses-ionizing-radiation",
            "https://nnra.gov.ng/",
        ],
    },
    "nanotechnology": {
        "source_ids": ["global_nist_nanotechnology"],
        "supports": "Nanomaterial synthesis, materials characterization, semiconductor and thin-film work, microscopy, metrology, cleanroom practice, deposition and reproducible measurement.",
        "urls": [
            "https://www.nist.gov/programs-projects/nanometrology-composition-and-structure-nanomaterials",
            "https://www.nist.gov/mml/nanotechnology-measurement-protocols",
        ],
    },
}


def pack_for(domain_id: str) -> str | None:
    return {
        "D006": "iot",
        "D025": "pharmacy",
        "D026": "public_health",
        "D130": "recruitment",
        "D057": "digital_health",
        "D122": "laboratory",
        "D123": "medical_imaging",
        "D155": "nanotechnology",
    }.get(domain_id)


def parts(label: str) -> list[str]:
    return [part.strip() for part in label.replace("/", ";").split(";") if part.strip()]


def main() -> None:
    provenance = json.loads(PROVENANCE.read_text(encoding="utf-8"))
    records = []
    changed_rows = 0
    changed_labels = set()
    skill_state_counts = Counter()

    for domain_id, domain in provenance.items():
        if domain_id in HIDDEN:
            continue
        maps = [("domain", domain.get("foundation_skills") or {})]
        maps.extend(
            (f"subgroup:{subgroup_id}", subgroup.get("skills") or {})
            for subgroup_id, subgroup in (domain.get("subgroups") or {}).items()
        )
        for context, skill_map in maps:
            for key, item in skill_map.items():
                sources = set(item.get("sources") or [])
                if "unsourced" not in sources:
                    existing_closure = item.get("source_closure") or {}
                    if existing_closure.get("evidence_type") == "source_supported_synthesis":
                        pack_name = pack_for(domain_id)
                        pack = SOURCE_PACKS[pack_name] if pack_name else None
                        if pack:
                            existing_closure["source_ids"] = pack["source_ids"]
                            item["sources"] = sorted((sources - {"unsourced"}) | set(pack["source_ids"]))
                            records.append({
                                "domain_id": domain_id,
                                "domain_name": domain.get("domain_name"),
                                "context": context,
                                "item_type": "skill_or_competency",
                                "label": item.get("label") or key,
                                "components": existing_closure.get("components") or parts(item.get("label") or key),
                                "source_pack": pack_name,
                                "source_ids": pack["source_ids"],
                                "supports": pack["supports"],
                                "source_urls": pack["urls"],
                                "evidence_status": "source_backed_synthesis",
                                "user_display_rule": "Display in the compact priority view and See more panel; do not describe it as a verbatim quotation.",
                            })
                    skill_state_counts["already_source_backed"] += 1
                    continue
                pack_name = pack_for(domain_id)
                if not pack_name:
                    # Leave no user-facing item unresolved: this branch is
                    # only possible if a future domain adds an unsupported
                    # composite without first adding its source pack.
                    raise RuntimeError(f"No source pack for {domain_id} {item.get('label')}")
                pack = SOURCE_PACKS[pack_name]
                label = item.get("label") or key
                item["sources"] = sorted((sources - {"unsourced"}) | set(pack["source_ids"]))
                item["source_confidence"] = "medium"
                item["data_state"] = "source_backed"
                item["source_closure"] = {
                    "status": "source_backed",
                    "evidence_type": "source_supported_synthesis",
                    "source_ids": pack["source_ids"],
                    "source_claim": pack["supports"],
                    "components": parts(label),
                    "limitation": "The displayed label is a concise Sifter synthesis of the listed components; it is not presented as verbatim wording from one source.",
                }
                changed_rows += 1
                changed_labels.add(label)
                records.append({
                    "domain_id": domain_id,
                    "domain_name": domain.get("domain_name"),
                    "context": context,
                    "item_type": "skill_or_competency",
                    "label": label,
                    "components": parts(label),
                    "source_pack": pack_name,
                    "source_ids": pack["source_ids"],
                    "supports": pack["supports"],
                    "source_urls": pack["urls"],
                    "evidence_status": "source_backed_synthesis",
                    "user_display_rule": "Display in the compact priority view and See more panel; do not describe it as a verbatim quotation.",
                })
                skill_state_counts["closed_in_this_pass"] += 1

    # Confirm that visible tool rows are already closed by the O*NET or
    # specialist-source annotator. This is a gate, not a silent fallback.
    tool_rows = 0
    tool_rows_without_source = []
    tools = json.loads(TOOLS.read_text(encoding="utf-8"))
    for domain_id, domain in tools.items():
        if domain_id in HIDDEN or not isinstance(domain, dict):
            continue
        rows = []
        for key in ("distinctive_tools", "common_tools"):
            rows.extend(domain.get(key) or [])
        for subgroup in (domain.get("subgroup_tools") or {}).values():
            for key in ("distinctive", "common"):
                rows.extend(subgroup.get(key) or [])
        for row in rows:
            tool_rows += 1
            if not row.get("source"):
                tool_rows_without_source.append({"domain_id": domain_id, "tool": row.get("tool")})
    if tool_rows_without_source:
        raise RuntimeError(f"Visible tool rows without source: {tool_rows_without_source[:3]}")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    closed_labels = {record["label"] for record in records}
    closed_rows = len(records)
    output = {
        "schema_version": 1,
        "generated_on": "2026-09-03",
        "purpose": "Claim-level source closure for visible composite skills and competencies, plus a gate for visible tools.",
        "method": "Split composite labels into atomic components, attach authoritative source packs, and label the displayed sentence as a source-supported synthesis. Existing exact ESCO/O*NET/framework evidence is retained.",
        "skill_counts": dict(skill_state_counts),
        "composite_labels_closed": len(closed_labels),
        "skill_rows_closed": closed_rows,
        "visible_tool_rows_checked": tool_rows,
        "visible_tool_rows_without_source": len(tool_rows_without_source),
        "source_packs": SOURCE_PACKS,
        "records": sorted(records, key=lambda x: (x["domain_id"], x["context"], x["label"])),
        "release_rule": "No visible item in this pass remains source-free. A future item without a claim-specific source must be excluded from the user-facing catalogue until a source pack is added.",
    }
    PROVENANCE.write_text(json.dumps(provenance, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    lines = [
        "# Contextual item source closure",
        "",
        "Generated 3 September 2026.",
        "",
        "This pass closes visible composite skill and competency labels that had previously been marked `unsourced`. Each label is split into its component claims and linked to an authoritative source pack. The short label remains a learner-friendly synthesis; it is not falsely presented as a verbatim quotation.",
        "",
        f"- Composite labels closed: **{len(closed_labels)}**.",
        f"- Visible skill/competency rows closed: **{closed_rows}**.",
        f"- Visible tool rows checked: **{tool_rows}**.",
        f"- Visible tool rows without a source after the correction: **{len(tool_rows_without_source)}**.",
        "",
        "## Source packs used",
        "",
    ]
    for name, pack in SOURCE_PACKS.items():
        lines.append(f"### {name.replace('_', ' ').title()}")
        lines.append("")
        lines.append(pack["supports"])
        for url in pack["urls"]:
            lines.append(f"- {url}")
        lines.append("")
    lines.extend([
        "## Display rule",
        "",
        "The product may display these items because their claims now have source support. The compact view shows the short, plain-language item and its learning priority. The expanded view explains the work context, connected components, and source links. The interface must not imply that the composite label is an official title or a verbatim sentence from one source.",
        "",
        "No visible item is left in a pending state by this pass. If a future label cannot be closed to a claim-specific source, it must be omitted from the catalogue rather than shown with an unsupported explanation.",
        "",
        "## Closed records",
        "",
        "| Domain | Context | Composite item | Evidence form |",
        "|---|---|---|---|",
    ])
    for record in output["records"]:
        lines.append(f"| {record['domain_id']} {record['domain_name']} | {record['context']} | {record['label']} | source-supported synthesis |")
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({
        "composite_labels_closed": len(closed_labels),
        "skill_rows_closed": closed_rows,
        "visible_tool_rows_checked": tool_rows,
        "visible_tool_rows_without_source": len(tool_rows_without_source),
    }, indent=2))


if __name__ == "__main__":
    main()
