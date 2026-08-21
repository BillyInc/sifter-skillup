"""Add the 2026-08-17 internet-audit evidence without generating SQL.

This is deliberately limited to source and body-audit artifacts. It does not
touch the career resource population or any SQL generator.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def load(name: str):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def dump(name: str, value) -> None:
    (ROOT / name).write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


NEW_SOURCES = [
    {
        "source_id": "ng_nahbpon_hair_beauty",
        "name": "National Association of Hair and Beauty Practitioners of Nigeria",
        "url": "https://nahbpon.com/about-nahbpon/",
        "source_class": "professional_association_and_sector_skills_context",
        "verified_claims": [
            "The association describes itself as a Nigerian hair and beauty practitioners body.",
            "It states that it works to promote standards, professional development and sanitation in the sector.",
        ],
        "skills": [
            "hairdressing and barbering practice",
            "beauty-service hygiene and sanitation",
            "client service and salon professionalism",
        ],
        "competencies": [
            "deliver hair and beauty services safely",
            "follow sector standards and professional conduct",
        ],
        "certifications": [],
        "domain_signal": "hairdressing, barbering and beauty services",
        "covered_body_ids": [],
    },
    {
        "source_id": "ng_apsman_aesthetics",
        "name": "Association of Practitioners of Spa and Medical Aesthetics of Nigeria",
        "url": "https://apsman.org/",
        "source_class": "professional_association_and_training_context",
        "verified_claims": [
            "APSMAN describes itself as a Nigerian professional organisation for spa and medical aesthetics practitioners.",
            "It reports training, certification and licensing activity for members; this is not treated as a statutory medical licence.",
        ],
        "skills": [
            "spa and wellness practice",
            "aesthetic treatment practice",
            "hygiene and client safety",
        ],
        "competencies": [
            "deliver treatments within professional scope",
            "apply hygiene, safety and ethical practice",
        ],
        "certifications": ["APSMAN training and certification routes"],
        "domain_signal": "beauty therapy, spa and medical aesthetics",
        "covered_body_ids": [],
    },
    {
        "source_id": "ng_posban_beauty",
        "name": "Practitioners of Spa and Beauty Association of Nigeria",
        "url": "https://posbann.com/about-us/",
        "source_class": "professional_association_and_sector_skills_context",
        "verified_claims": [
            "POSBAN describes a Nigerian association for spa, hair and beauty practitioners.",
            "Its published rules reference training, qualification, sanitation and practice standards; membership is not treated as a statutory licence.",
        ],
        "skills": [
            "hair and beauty service delivery",
            "salon and spa hygiene",
            "beauty business operations",
        ],
        "competencies": [
            "maintain safe salon and spa practice",
            "apply professional and business standards",
        ],
        "certifications": ["POSBAN membership and training routes"],
        "domain_signal": "hairdressing, barbering, beauty therapy and aesthetics",
        "covered_body_ids": [],
    },
    {
        "source_id": "ng_corbon_plumbing_painting_nos",
        "name": "Council of Registered Builders of Nigeria, Construction Labour Market Information System",
        "url": "https://www.clmis.corbon.gov.ng/nos",
        "secondary_url": "https://www.corbon.gov.ng/resources/PLUMBING%20IN%20CONSTRUCTION.pdf",
        "source_class": "national_occupational_standard_and_trade_regulator",
        "verified_claims": [
            "CORBON publishes National Occupational Standards for construction trades in Nigeria.",
            "The published trade set includes plumbing in construction and painting and decoration.",
        ],
        "skills": [
            "plumbing installation and maintenance",
            "pipe fitting and leak prevention",
            "painting and decoration",
            "construction safety and work quality",
        ],
        "competencies": [
            "install and maintain building plumbing systems",
            "prepare, estimate and execute painting and decoration work",
            "meet occupational performance criteria and evidence requirements",
        ],
        "certifications": ["National Occupational Standards and National Skills Qualification routes"],
        "domain_signal": "plumbing, pipefitting, painting and decorating",
        "covered_body_ids": ["ng_corbon", "ng_nbte"],
    },
    {
        "source_id": "ng_cippon_printing_act",
        "name": "Chartered Institute of Professional Printers of Nigeria",
        "url": "https://www.cipponinstituteedu-ng.org/about.html",
        "secondary_url": "https://placng.org/lawsofnigeria/print.php?sn=111",
        "source_class": "statutory_professional_body_and_exam_context",
        "verified_claims": [
            "CIPPON describes a Nigerian statutory institute for regulating and administering printing practice.",
            "The governing Act provides for registration, approved qualifications and professional standards for printing practitioners.",
        ],
        "skills": [
            "printing production and press operations",
            "pre-press file preparation and plate production",
            "print quality and production workflow",
        ],
        "competencies": [
            "prepare and manage print production work",
            "apply professional printing standards",
            "work within registration and practice requirements",
        ],
        "certifications": ["CIPPON professional registration and membership categories"],
        "domain_signal": "printing technology, pre-press and print production",
        "covered_body_ids": ["ng_nbte"],
    },
    {
        "source_id": "ng_sppn_printing",
        "name": "Society of Printing Practitioners of Nigeria",
        "url": "https://sppn.com.ng/",
        "source_class": "professional_association_and_training_context",
        "verified_claims": [
            "SPPN describes a Nigerian printing professional body covering printing, packaging, publishing and graphic communication.",
            "It advertises training, certification, professional support and membership activity.",
        ],
        "skills": [
            "printing and packaging production",
            "graphic communication workflows",
            "print technology and quality practice",
        ],
        "competencies": [
            "operate within print production workflows",
            "apply quality and professional practice standards",
        ],
        "certifications": ["SPPN training and certification programmes"],
        "domain_signal": "printing technology, pre-press and packaging",
        "covered_body_ids": [],
    },
    {
        "source_id": "ng_son_building_materials",
        "name": "Standards Organisation of Nigeria, Product Certification",
        "url": "https://www.son.gov.ng/son-product-certification/",
        "secondary_url": "https://son.gov.ng/mancapservice/",
        "source_class": "national_standards_and_product_certification_regulator",
        "verified_claims": [
            "SON publishes Nigerian standards and product conformity and certification schemes.",
            "The source covers materials, products, laboratories and quality assurance; it does not create an individual craft licence.",
        ],
        "skills": [
            "materials quality assurance",
            "product conformity assessment",
            "testing, inspection and standards compliance",
        ],
        "competencies": [
            "interpret and apply relevant Nigerian Industrial Standards",
            "document product and material conformity",
            "support quality control and certification processes",
        ],
        "certifications": ["MANCAP product certification", "SON conformity assessment routes"],
        "domain_signal": "glass, ceramics, building materials and manufacturing quality",
        "covered_body_ids": ["ng_rmrdc"],
    },
    {
        "source_id": "ng_bumpan_building_materials",
        "name": "Building Materials Producers Association of Nigeria",
        "url": "https://bumpanng.com/",
        "source_class": "sector_association_and_industry_context",
        "verified_claims": [
            "BUMPAN describes a Nigerian association representing building-material producers.",
            "It provides sector advocacy and industry context; it is not treated as a personal professional licensing body.",
        ],
        "skills": [
            "building-material production",
            "manufacturing quality and compliance",
            "industry and supplier coordination",
        ],
        "competencies": [
            "work with building-material production standards",
            "coordinate production and sector stakeholders",
        ],
        "certifications": [],
        "domain_signal": "building materials, manufacturing and construction supply",
        "covered_body_ids": [],
    },
    {
        "source_id": "ng_niob_building_materials",
        "name": "Nigerian Institute of Building",
        "url": "https://niobnat.org/",
        "source_class": "professional_association_and_built_environment_context",
        "verified_claims": [
            "NIOB describes a Nigerian professional organisation for the building profession.",
            "Its public material references built-environment practice and building-material standards work.",
        ],
        "skills": [
            "building construction practice",
            "materials and construction standards",
            "site and quality coordination",
        ],
        "competencies": [
            "apply building and materials standards",
            "coordinate construction quality and practice",
        ],
        "certifications": ["NIOB professional membership routes"],
        "domain_signal": "building materials and construction practice",
        "covered_body_ids": ["ng_corbon"],
    },
    {
        "source_id": "global_nafd_funeral_education",
        "name": "National Association of Funeral Directors Education",
        "url": "https://www.nafd.org.uk/education/nafd-education-and-training/",
        "source_class": "international_professional_body_and_training_context",
        "verified_claims": [
            "NAFD publishes a funeral-service education framework with entry, operational and funeral-directing routes.",
            "This is international learning and role evidence only; it is not a Nigerian licence or Nigerian regulator.",
        ],
        "skills": [
            "funeral service operations",
            "arrangement and family support",
            "funeral directing and professional conduct",
        ],
        "competencies": [
            "support families through funeral arrangements",
            "manage funeral-service operations ethically",
            "progress through structured funeral-service training",
        ],
        "certifications": ["NAFD funeral-service education and DipFD routes"],
        "domain_signal": "funeral services and funeral directing",
        "covered_body_ids": [],
    },
]


def apply_body_catalog() -> None:
    data = load("nigerian_professional_body_audit.json")
    catalog = {row["body_id"]: row for row in data["body_catalog"]}
    catalog.update(
        {
            "ng_nahbpon": {
                "body_id": "ng_nahbpon",
                "name": "National Association of Hair and Beauty Practitioners of Nigeria",
                "body_type": "professional_association",
                "url": "https://nahbpon.com/about-nahbpon/",
            },
            "ng_apsman": {
                "body_id": "ng_apsman",
                "name": "Association of Practitioners of Spa and Medical Aesthetics of Nigeria",
                "body_type": "professional_association",
                "url": "https://apsman.org/",
            },
            "ng_posban": {
                "body_id": "ng_posban",
                "name": "Practitioners of Spa and Beauty Association of Nigeria",
                "body_type": "professional_association",
                "url": "https://posbann.com/about-us/",
            },
            "ng_cippon": {
                "body_id": "ng_cippon",
                "name": "Chartered Institute of Professional Printers of Nigeria",
                "body_type": "statutory_professional_body",
                "url": "https://www.cipponinstituteedu-ng.org/about.html",
            },
            "ng_sppn": {
                "body_id": "ng_sppn",
                "name": "Society of Printing Practitioners of Nigeria",
                "body_type": "professional_association",
                "url": "https://sppn.com.ng/",
            },
            "ng_bumpan": {
                "body_id": "ng_bumpan",
                "name": "Building Materials Producers Association of Nigeria",
                "body_type": "sector_association",
                "url": "https://bumpanng.com/",
            },
        }
    )
    data["body_catalog"] = sorted(catalog.values(), key=lambda row: row["body_id"])

    by_domain = {row["domain_id"]: row for row in data["domains"]}
    additions = {
        "D087": ["ng_nahbpon"],
        "D088": ["ng_apsman", "ng_posban"],
        "D108": ["ng_cippon", "ng_sppn"],
        "D113": ["ng_bumpan"],
    }
    for domain_id, body_ids in additions.items():
        row = by_domain[domain_id]
        existing = {body["body_id"] for body in row.get("nigerian_bodies", [])}
        for body_id in body_ids:
            if body_id in existing:
                continue
            body = catalog[body_id]
            row.setdefault("nigerian_bodies", []).append(
                {
                    "body_id": body_id,
                    "name": body["name"],
                    "body_type": body["body_type"],
                    "url": body["url"],
                }
            )
        row["audit_note"] = (
            "Focused internet audit added direct sector evidence. "
            "Statutory, professional-association and sector-context signals remain separate."
        )
    by_domain["D089"]["audit_note"] = (
        "Focused search found international funeral-service education evidence but no verified "
        "Nigerian statutory funeral regulator or national professional body. Keep local claims limited."
    )
    data["audit_updates"] = {
        "new_direct_source_records": len(NEW_SOURCES),
        "new_nigerian_body_records": 6,
        "local_body_gap_requires_limited_copy": ["D089"],
        "sql_generated": False,
    }
    dump("nigerian_professional_body_audit.json", data)


def apply_web_audit() -> None:
    data = load("nigerian_web_source_evidence_audit.json")
    source_ids = {row["source_id"] for row in data["verified_sources"]}
    for source in NEW_SOURCES:
        if source["source_id"] not in source_ids:
            data["verified_sources"].append(source)
    data["source_log"].extend(
        {"topic": source["domain_signal"], "url": source["url"]}
        for source in NEW_SOURCES
        if not any(item.get("url") == source["url"] for item in data["source_log"])
    )
    coverage = {row["domain_id"]: row for row in data["domain_coverage"]}
    mapping = {
        "D087": ["ng_nahbpon_hair_beauty"],
        "D088": ["ng_apsman_aesthetics", "ng_posban_beauty"],
        "D089": ["global_nafd_funeral_education"],
        "D100": ["ng_corbon_plumbing_painting_nos"],
        "D101": ["ng_corbon_plumbing_painting_nos"],
        "D108": ["ng_cippon_printing_act", "ng_sppn_printing"],
        "D113": ["ng_son_building_materials", "ng_bumpan_building_materials", "ng_niob_building_materials"],
    }
    supplemental_hidden = {
        "D087": "Hairdressing, Barbering",
        "D088": "Beauty Therapy, Aesthetics",
        "D089": "Funeral",
        "D100": "Plumbing, Pipefitting",
        "D101": "Painting, Decorating",
        "D108": "Printing Technology, Pre-press",
        "D113": "Glass, Ceramics, Building Materials",
    }
    for domain_id, ids in mapping.items():
        row = coverage.get(domain_id)
        if row is None:
            row = {
                "domain_id": domain_id,
                "domain_name": supplemental_hidden[domain_id],
                "body_audit_class": "supplemental_hidden_domain",
                "nigerian_body_count": 0,
                "verified_web_anchor_ids": [],
                "verified_web_anchor_count": 0,
                "status": "supplemental_hidden_domain",
                "thin_gap": False,
            }
            data.setdefault("supplemental_hidden_domain_coverage", []).append(row)
        anchors = list(dict.fromkeys(row.get("verified_web_anchor_ids", []) + ids))
        row["verified_web_anchor_ids"] = anchors
        row["verified_web_anchor_count"] = len(anchors)
        row["status"] = "web_anchor_available"
        row["thin_gap"] = domain_id == "D089"
        if domain_id == "D089":
            row["status"] = "international_anchor_only_local_body_unverified"
    data["supplemental_hidden_domain_coverage"] = sorted(
        data.get("supplemental_hidden_domain_coverage", []),
        key=lambda row: row["domain_id"],
    )
    data["coverage_summary"].update(
        {
            "verified_anchor_sources": len(data["verified_sources"]),
            "new_direct_source_records_2026_08_17": len(NEW_SOURCES),
            "domains_with_verified_web_anchor": sum(
                1 for row in coverage.values() if row.get("verified_web_anchor_ids")
            ),
            "domains_with_international_only_anchor": 1,
            "domains_with_local_body_gap_requiring_limited_copy": ["D089"],
            "supplemental_hidden_domains_audited": len(supplemental_hidden),
        }
    )
    data["audit_updates"] = {
        "source_records_added": len(NEW_SOURCES),
        "direct_search_completed_for_previously_unassigned_domains": 7,
        "sql_generated": False,
    }
    dump("nigerian_web_source_evidence_audit.json", data)


if __name__ == "__main__":
    apply_body_catalog()
    apply_web_audit()
    print("Updated Nigerian body and web-audit artifacts; SQL was not generated.")
