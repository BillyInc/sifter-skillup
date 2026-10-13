"""Attach a bounded set of externally verified area-specific sources.

This is an additive, idempotent repair. It does not change area definitions,
visibility, role routes, or Nigerian-context fields. Each source is linked only
to the area whose boundary it directly supports; the claim limits prevent an
occupational standard from being misrepresented as prescribing Sifter's full
specialization taxonomy.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STRUCTURE = ROOT / "domain_structure.json"
REPORT = ROOT / "_audit" / "ADDITIONAL_AREA_SOURCE_REPAIRS_2026_10_07.json"

ILO = {
    "source_id": "ILO_ISCO08_VOL1_2012",
    "publisher": "International Labour Organization",
    "title": "International Standard Classification of Occupations: ISCO-08, Volume 1",
    "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
    "claim_limit": "ISCO-08 is a global occupational classification, not a prescription of this product's specialization count or curriculum. The cited unit-group tasks corroborate the practice boundary only.",
    "geographic_scope": "Global occupational classification",
}

WHO = {
    "source_id": "WHO_CLASSIFYING_HEALTH_WORKERS_2019",
    "publisher": "World Health Organization",
    "title": "Classifying health workers: mapping occupations to the international standard classification",
    "url": "https://www.who.int/publications/m/item/classifying-health-workers",
    "claim_limit": "WHO's occupational groupings support distinctions among medical practice areas, not Sifter's complete taxonomy or any jurisdiction's scope-of-practice rules.",
    "geographic_scope": "International health-workforce classification",
}

ASRT = {
    "source_id": "ASRT_IMAGING_PRACTICE_STANDARDS",
    "publisher": "American Society of Radiologic Technologists",
    "title": "The ASRT Practice Standards for Medical Imaging and Radiation Therapy",
    "url": "https://www.asrt.org/main/standards-and-regulations/professional-practice/practice-standards-online",
    "claim_limit": "Professional practice standards from a US organization; legal scope, titles and credential rules vary by jurisdiction.",
    "geographic_scope": "Professional standards; jurisdiction-specific limits noted by publisher",
}

UIC = {
    "source_id": "UIC_RAIL_SYSTEM_AND_STANDARDISATION",
    "publisher": "International Union of Railways (UIC)",
    "title": "Rail System and Standardisation",
    "url": "https://css.uic.org/rail-system/",
    "claim_limit": "UIC describes railway system components and technical interfaces; this does not establish a complete academic or occupational taxonomy.",
    "geographic_scope": "International railway sector",
}

FAO = {
    "source_id": "FAO_HORTICULTURE_CROP_MANAGEMENT",
    "publisher": "Food and Agriculture Organization of the United Nations",
    "title": "Technical factsheets to manage horticulture crops",
    "url": "https://www.fao.org/plant-production-protection/resources/publications/technical-factsheets-series-on-horticulture-crops-management",
    "claim_limit": "FAO supports horticultural production as a coherent crop-production practice; it does not prescribe local licensing or this product's specialization structure.",
    "geographic_scope": "International agricultural guidance",
}


def ref(source: dict, locator: str, supports: str) -> dict:
    return {
        **source,
        "locator": locator,
        "supports": supports,
        "source_artifact_locator": None,
    }


REPAIRS: dict[str, dict] = {
    "D022:mine-operations-safety-and-closure": ref(
        ILO,
        "ISCO-08 Unit Group 8111, Mining and mineral processing plant operators; compare the mine-safety and environmental-control tasks described in the group definition.",
        "Mining operations combine extraction/plant work with mining-specific safety and environmental controls, supporting a distinct operations practice boundary.",
    ),
    "D023:generalist-and-primary-care": ref(
        WHO,
        "2019 mapping, ISCO 2211 Generalist medical practitioners; description of generalist diagnostic, treatment and referral responsibilities.",
        "Generalist medical practice is distinguished from specialist medical practice and supports first-contact, continuing-care scope.",
    ),
    "D023:child-and-adolescent-medicine": ref(
        WHO,
        "2019 mapping, specialist medical practitioners: paediatrics and related specialties; definition focuses on infants, children and adolescents.",
        "Child and adolescent medical practice is identified as a patient-age/life-stage specialty grouping.",
    ),
    "D023:mental-and-behavioural-medicine": ref(
        WHO,
        "2019 mapping, specialist medical practitioners: psychiatric specialties and related branches; definition covers mental illness and behavioural disorders.",
        "Psychiatric/mental and behavioural medical practice is distinguished as a specialty grouping.",
    ),
    "D023:diagnostic-and-laboratory-medicine": ref(
        WHO,
        "2019 mapping, specialist medical practitioners: medical specialties include pathology, radiology, haematology and related diagnostic specialties.",
        "Physician diagnostic specialties are distinct from non-physician technical delivery occupations, consistent with this area's stated boundary.",
    ),
    "D023:preventive-and-occupational-medicine": ref(
        WHO,
        "2019 mapping, specialist medical practitioners: medical group of specialties includes occupational medicine; see also preventive-medicine specialist examples.",
        "Preventive and occupational medicine are represented as medical practice specialties, distinct from general population-health programme roles.",
    ),
    "D099:brick-and-block-masonry": ref(
        ILO,
        "ISCO-08 Unit Group 7112, Bricklayers and related workers: laying bricks and building blocks to construct or repair walls and structures.",
        "Brick and block masonry has a distinct construction task profile within building trades.",
    ),
    "D099:tiling-and-architectural-surface-installation": ref(
        ILO,
        "ISCO-08 Unit Group 7122, Floor layers and tile setters.",
        "Floor and wall tile setting is classified as a distinct building-finishing trade, supporting a separate surface-installation practice boundary.",
    ),
    "D099:plastering-rendering-and-drywall-systems": ref(
        ILO,
        "ISCO-08 Unit Group 7123, Plasterers: applying plaster and similar materials to interior/exterior surfaces.",
        "Plastering is a distinct finishing trade, separable from masonry and tile-setting tasks.",
    ),
    "D100:plumbing-water-supply-and-drainage": ref(
        ILO,
        "ISCO-08 Unit Group 7126, Plumbers and pipe fitters: installing, maintaining and repairing plumbing and pipe systems.",
        "Water-supply and drainage installation/maintenance is a defined plumbing trade practice.",
    ),
    "D100:heating-and-hot-water-systems": ref(
        ILO,
        "ISCO-08 Unit Group 7127, Air conditioning and refrigeration mechanics; see tasks for installing and maintaining heating and hot-water equipment where included in system work.",
        "Heating and hot-water systems require dedicated building-services installation and maintenance work; local licensing boundaries are not implied.",
    ),
    "D100:refrigeration-air-conditioning-and-ventilation": ref(
        ILO,
        "ISCO-08 Unit Group 7127, Air conditioning and refrigeration mechanics.",
        "Refrigeration and air-conditioning systems form a distinct building-services technical practice.",
    ),
    "D102:site-carpentry-and-structural-timber": ref(
        ILO,
        "ISCO-08 Unit Group 7115, Carpenters and joiners: constructing, erecting, installing and repairing structures and fittings, including structural timber work.",
        "Site carpentry and structural timber work is grounded in a distinct construction-trade task family.",
    ),
    "D102:joinery-and-fitted-woodwork": ref(
        ILO,
        "ISCO-08 Unit Group 7115, Carpenters and joiners; tasks include fitting and installing wood components and fixtures.",
        "Joinery and fitted woodwork has a defined installation/fit-out task profile within the broader carpentry trade.",
    ),
    "D102:furniture-and-wood-product-manufacturing": ref(
        ILO,
        "ISCO-08 Unit Group 7522, Cabinet-makers and related workers; tasks cover making and repairing furniture and related products.",
        "Furniture and wood-product making is distinguished from site carpentry by its product-manufacturing task profile.",
    ),
    "D106:garment-design-pattern-development-and-fitting": ref(
        ILO,
        "ISCO-08 Unit Group 7532, Garment and related pattern-makers and cutters.",
        "Pattern development and garment cutting are defined apparel-production tasks supporting this design/pattern practice boundary.",
    ),
    "D106:tailoring-and-custom-garment-construction": ref(
        ILO,
        "ISCO-08 Unit Group 7531, Tailors, dressmakers, furriers and hatters.",
        "Tailoring and custom garment construction is identified as a distinct garment-trade task family.",
    ),
    "D106:apparel-production-and-sewing-operations": ref(
        ILO,
        "ISCO-08 Unit Group 7533, Sewing, embroidery and related workers.",
        "Sewing and apparel assembly operations are occupationally distinguishable from garment design/pattern and custom tailoring tasks.",
    ),
    "D107:footwear-design-construction-and-repair": ref(
        ILO,
        "ISCO-08 Unit Group 7536, Shoemakers and related workers.",
        "Footwear making and repair have a defined occupational task family within leather and garment trades.",
    ),
    "D107:leather-goods-saddlery-and-accessories": ref(
        ILO,
        "ISCO-08 Unit Group 7536, Shoemakers and related workers; compare listed leather-goods and related craft tasks in the unit-group definition.",
        "Leather-goods and saddlery craft work is related to, but distinguishable from, footwear production by its products and tasks.",
    ),
    "D108:pre-press-and-print-file-preparation": ref(
        ILO,
        "ISCO-08 Unit Group 7321, Pre-press technicians; preparation and processing of text/images for printing.",
        "Pre-press file preparation is a distinct print-production stage with its own technical tasks.",
    ),
    "D108:press-operations-and-print-production": ref(
        ILO,
        "ISCO-08 Unit Group 7322, Printers; setting up and operating printing presses and related equipment.",
        "Press operation is a distinct production stage, separable from pre-press and post-press finishing.",
    ),
    "D108:post-press-binding-and-finishing": ref(
        ILO,
        "ISCO-08 Unit Group 7323, Print finishing and binding workers.",
        "Binding and print finishing form a distinct post-press task family.",
    ),
    "D111:fibre-preparation-and-spinning": ref(
        ILO,
        "ISCO-08 Unit Group 8151, Fibre-preparing, spinning and winding machine operators.",
        "Fibre preparation and spinning are a defined textile-production practice stage.",
    ),
    "D111:fabric-formation": ref(
        ILO,
        "ISCO-08 Unit Group 8152, Weaving and knitting machine operators.",
        "Weaving and knitting are defined fabric-formation processes, distinct from fibre preparation and textile finishing.",
    ),
    "D112:timber-and-engineered-wood-processing": ref(
        ILO,
        "ISCO-08 Unit Group 8172, Wood processing plant operators.",
        "Industrial wood processing is a defined production task family distinct from site carpentry and joinery installation.",
    ),
    "D116:earthmoving-and-excavation-plant-operations": ref(
        ILO,
        "ISCO-08 Unit Group 8342, Earthmoving and related plant operators.",
        "Operating earthmoving plant is a defined mobile-equipment occupation/practice family.",
    ),
    "D116:road-construction-and-ground-compaction-plant-operations": ref(
        ILO,
        "ISCO-08 Unit Group 8342, Earthmoving and related plant operators; the group includes operating machinery used in road construction and ground work.",
        "Road-construction and compaction plant operation is a distinct equipment-use context within mobile plant work.",
    ),
    "D117:rail-infrastructure-and-track-systems": ref(
        UIC,
        "Rail System page: infrastructure subsystem and interfaces between infrastructure, rolling stock and track/structure sectors.",
        "Rail infrastructure and track are distinct interacting components of the railway system.",
    ),
    "D117:rail-traction-power-and-energy-systems": ref(
        UIC,
        "Rail System page and UIC high-speed railway energy design guidance: traction power supply, substations, overhead contact lines and electric power systems.",
        "Traction power and railway energy systems form a distinct railway technical subsystem.",
    ),
    "D117:rail-signalling-train-control-and-communications": ref(
        UIC,
        "UIC signalling and management systems guidance: signalling and train-control systems prevent train collisions and coordinate traffic; Rail System page on system interfaces.",
        "Signalling, train control and railway communications form a distinct safety-critical railway subsystem.",
    ),
    "D118:horticultural-production": ref(
        FAO,
        "FAO horticulture crop-management factsheets: cultivation-system design, crop management, yield, quality and sustainable-resource considerations.",
        "Horticultural crop production is a coherent agricultural practice area with crop-specific production and management tasks.",
    ),
    "D123:computed-tomography": ref(
        ASRT,
        "Definition and discipline-specific scope sections: Computed Tomography technologists perform CT procedures, acquire/analyse data, and follow patient-safety and radiation-safety standards.",
        "Computed tomography has a distinct imaging practice and competence profile within medical imaging.",
    ),
    "D123:magnetic-resonance-imaging": ref(
        ASRT,
        "Definition and discipline-specific scope sections: Magnetic Resonance technologists perform MR procedures, apply MR safety and select pulse sequences.",
        "Magnetic resonance imaging has a distinct modality-specific practice and safety profile within medical imaging.",
    ),
}


def main() -> None:
    structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
    seen: set[str] = set()
    applied: list[dict] = []
    missing: list[str] = []
    for key, source in REPAIRS.items():
        domain_id, _ = key.split(":", 1)
        area = next((x for x in structure[domain_id].get("areas_of_specialization", []) if x.get("area_id") == key), None)
        if area is None:
            missing.append(key)
            continue
        refs = area.setdefault("source_references", [])
        source_key = (source["source_id"], source["url"], source["locator"])
        if any((x.get("source_id"), x.get("url"), x.get("locator")) == source_key for x in refs):
            seen.add(key)
            continue
        refs.append(source)
        area["source_ids"] = sorted(set(area.get("source_ids") or []) | {source["source_id"]})
        area["source_evidence_status"] = "source_linked"
        area["area_evidence_link_check"] = {
            **(area.get("area_evidence_link_check") or {}),
            "checked_against_catalog_and_captured_review_sources": True,
            "supplemented_with_verified_external_primary_source": True,
            "source_ids": sorted(set((area.get("area_evidence_link_check") or {}).get("source_ids", [])) | {source["source_id"]}),
        }
        applied.append({"area_id": key, "source_id": source["source_id"], "url": source["url"], "locator": source["locator"]})
    if missing:
        raise ValueError(f"Missing canonical areas: {missing}")
    STRUCTURE.write_text(json.dumps(structure, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = {
        "schema_version": "2026-10-07.additional-area-source-repairs.v1",
        "status": "applied_idempotently",
        "scope": "35 directly source-supported area records; no labels, boundaries, student visibility, or route fields changed",
        "counts": {"source_supported_area_records": len(REPAIRS), "new_area_source_links_applied": len(applied), "already_present": len(seen)},
        "applied": applied,
        "policy": "Sources corroborate the named area boundary; claim limits explicitly state that sources do not prescribe the overall taxonomy or local regulation.",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["counts"], indent=2))


if __name__ == "__main__":
    main()
