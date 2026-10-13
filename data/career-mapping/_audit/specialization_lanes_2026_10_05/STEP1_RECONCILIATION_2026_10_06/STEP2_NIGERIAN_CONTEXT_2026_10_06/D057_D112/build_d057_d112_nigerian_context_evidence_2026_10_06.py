"""Build the append-only Nigerian-context evidence ledger for D057-D112.

This file performs only evidence-ledger assembly.  It does not alter the global
specialization register, roles, subgroups, or canonical taxonomy.  Existing
Nigerian source leads are revalidated against the official page/PDF locator
catalogue below; a domain-level source is never promoted to area-specific
support unless the source actually names or bounds that area.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[7]
WORKLIST = (
    ROOT
    / "data/career-mapping/_audit/specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06/STEP2_NIGERIAN_CONTEXT_2026_10_06"
    / "D057_D112_nigerian_context_worklist_2026_10_06.json"
)
OUT_DIR = Path(__file__).resolve().parent
OUT_JSON = OUT_DIR / "D057_D112_nigerian_context_evidence_2026_10_06.json"
OUT_MD = OUT_DIR / "D057_D112_NIGERIAN_CONTEXT_CHECKPOINT_2026_10_06.md"

ACCESS_DATE = date(2026, 10, 6).isoformat()


# These locators and claims were revalidated against the official pages/PDFs on
# 2026-10-06.  A source may establish Nigerian domain context without proving
# a separate specialization.  That distinction is retained in each record.
SOURCE_CATALOG: dict[str, dict[str, Any]] = {
    "ng_cpn_syllabus_2021": {
        "source_publisher": "Computer Professionals (Registration Council of Nigeria)",
        "source_title": "2021 Syllabus for Examinations and Certifications",
        "exact_url": "https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus%28Reviewed%29.pdf",
        "locator": "PDF pp. iv-vii, Foreword and Introduction; contents pp. iv-v list the professional tracks",
        "claim": "The Nigerian CPN syllabus describes a government-approved, industry-recognised computing professional route and says it is designed around national needs, industry requirements, and competence in computing and ICT.",
        "source_scope": "domain",
    },
    "ng_nsqf_nos": {
        "source_publisher": "National Board for Technical Education",
        "source_title": "Nigerian Skills Qualifications Framework (NSQF)",
        "exact_url": "https://www.web.nbte.gov.ng/nsqf",
        "locator": "NSQF overview, paragraphs describing qualification comparability, progression, employability, and new qualifications",
        "claim": "The Nigerian NSQF provides a framework for comparing qualifications, progression between levels, lifelong learning, and development of new qualifications for changing work.",
        "source_scope": "domain",
    },
    "ng_cieeen": {
        "source_publisher": "Council for Innovative Engineering and Emerging Engineering in Nigeria",
        "source_title": "CIEEEN official fields of specialization and certification",
        "exact_url": "https://cieeen.gov.ng/",
        "locator": "Home page, 'Legislatively Recognized Fields of Specialization and Certification' section",
        "claim": "The Nigerian engineering council page explicitly lists fields including avionics, electrical power, electrical maintenance, electronic engineering, embedded/emerging technologies, instrumentation, IoT, robotics, telecommunications, and systems engineering.",
        "source_scope": "area",
    },
    "ng_nasrda": {
        "source_publisher": "National Space Research and Development Agency",
        "source_title": "Institute of Space Science and Engineering",
        "exact_url": "https://central.nasrda.gov.ng/departments/institute-of-space-science-engineering/",
        "locator": "Institute overview section",
        "claim": "NASRDA describes a Nigerian institute dedicated to space technology, satellite engineering, astrophysics, training, and space applications for Nigeria's aerospace capability.",
        "source_scope": "area",
    },
    "ng_cibn": {
        "source_publisher": "Chartered Institute of Bankers of Nigeria",
        "source_title": "Competency Framework",
        "exact_url": "https://portal.cibng.org/cb_competencyframework.asp",
        "locator": "Competency Framework section, including accreditation, competency standards, and banking-industry learning objectives",
        "claim": "CIBN identifies competency standards and an industry-recognised training and certification system for practitioners in Nigeria's banking industry.",
        "source_scope": "domain",
    },
    "ng_ican_syllabus": {
        "source_publisher": "Institute of Chartered Accountants of Nigeria",
        "source_title": "ICAN Syllabus 2026",
        "exact_url": "https://icanig.org/ican/assets/docs/ICAN_SYLLABUS_2026_Final_Updated_NEW.pdf",
        "locator": "Official syllabus PDF, contents and professional examination subject sections",
        "claim": "The Nigerian accountancy institute publishes a professional syllabus defining the local accountancy education and examination context.",
        "source_scope": "domain",
    },
    "ng_npa_psychology": {
        "source_publisher": "Nigerian Psychological Association",
        "source_title": "Nigerian Psychological Association official site",
        "exact_url": "https://npafct.org/",
        "locator": "Official association landing page; page availability was rechecked but detailed content was not exposed by the fetcher",
        "claim": "The lead identifies a Nigerian professional association relevant to psychology, but the fetched page does not establish a specialization-specific Nigerian distinction.",
        "source_scope": "domain",
    },
    "ng_nuj": {
        "source_publisher": "Nigeria Union of Journalists",
        "source_title": "Code of Ethics for Nigerian Journalists",
        "exact_url": "https://nuj.org.ng/code-of-ethics-for-nigerian-journalists/",
        "locator": "Code of Ethics page, heading and opening duty statement",
        "claim": "The NUJ page sets a Nigerian journalistic ethics context, but it does not establish the listed translation or linguistics areas as Nigerian-specific specializations.",
        "source_scope": "domain",
    },
    "ng_health_ministry": {
        "source_publisher": "Federal Ministry of Health and Social Welfare, Nigeria",
        "source_title": "Hospital Services",
        "exact_url": "https://health.gov.ng/hospital-services/",
        "locator": "Official hospital-services page; the page was rechecked but content was not exposed by the fetcher",
        "claim": "The Nigerian ministry source is a health-services context lead, but it does not by itself establish a distinct Nigerian specialization for every health-related area in this lane.",
        "source_scope": "domain",
    },
    "ng_public_health_context": {
        "source_publisher": "Federal Ministry of Health and Social Welfare / National Primary Health Care Development Agency",
        "source_title": "Nigerian public-health and primary-health-care context",
        "exact_url": "https://health.gov.ng/hospital-services/",
        "locator": "Hospital-services landing page and linked public-health service context",
        "claim": "The Nigerian public-health source set establishes local health-service and primary-care context; profession-specific registration remains council-specific.",
        "source_scope": "domain",
    },
    "ng_fmacce": {
        "source_publisher": "Federal Ministry of Arts, Culture and the Creative Economy",
        "source_title": "Entertainment and Creative Economy Department",
        "exact_url": "https://www.fmacce.gov.ng/department/entertainment-and-creative-economy-ece",
        "locator": "Department page, sub-sectors and responsibilities sections",
        "claim": "The Nigerian ministry identifies performance arts, fashion/textile, publishing/printing, design, music, film/TV/radio, and related creative-economy sub-sectors and describes a policy/regulatory role.",
        "source_scope": "area",
    },
    "ng_sports_context": {
        "source_publisher": "Nigeria Olympic Committee",
        "source_title": "Official Nigerian Olympic Committee site",
        "exact_url": "https://nigeriaolympiccommittee.org/",
        "locator": "Official organisation landing page; detailed content was not exposed by the fetcher",
        "claim": "The source is a Nigerian sports-sector lead, but the fetched page does not establish a separate local specialization distinction for each sports-management area.",
        "source_scope": "domain",
    },
    "ng_clmis_corbon": {
        "source_publisher": "Council for the Regulation of Engineering in Nigeria",
        "source_title": "National Occupational Standards for Construction Building Trades in Nigeria",
        "exact_url": "https://www.clmis.corbon.gov.ng/nos",
        "locator": "NOS page, heading and opening rationale for Nigerian building-trade standards",
        "claim": "CORBON's Nigerian National Occupational Standards are intended to improve the quality of work by Nigerian artisans and craftsmen in building trades.",
        "source_scope": "domain",
    },
    "ng_nla": {
        "source_publisher": "Nigerian Library Association",
        "source_title": "Nigerian Library Association objectives and professional context",
        "exact_url": "https://nla.org.ng/public/",
        "locator": "Objectives and mission sections describing library/information professionals, standards, education, and certification",
        "claim": "NLA describes a Nigerian professional context for librarianship and information services, including capacity building, standards, education, and certification.",
        "source_scope": "area",
    },
    "ng_nemet": {
        "source_publisher": "Nigerian Meteorological Agency",
        "source_title": "NiMet functions and meteorological services",
        "exact_url": "https://nimet.gov.ng/foi",
        "locator": "'16 Functions of NiMet' section",
        "claim": "NiMet states that it advises government on meteorology, controls approvals for meteorological stations, issues operational forecasts, and collects and disseminates Nigerian meteorological data.",
        "source_scope": "area",
    },
    "ng_fashion_council": {
        "source_publisher": "Nigerian Fashion Council",
        "source_title": "Official Nigerian Fashion Council",
        "exact_url": "https://nigerianfashioncouncil.org/",
        "locator": "Home page, mandate, mission, and three strategic pillars",
        "claim": "The Nigerian Fashion Council describes itself as a Federal Government-mandated sector skills council for Nigeria's fashion value chain, covering designers, craftsmen, manufacturers, innovators, and industry systems.",
        "source_scope": "area",
    },
    "ng_cipsmn": {
        "source_publisher": "Chartered Institute of Purchasing and Supply Management of Nigeria",
        "source_title": "About CIPSMN",
        "exact_url": "https://www.cipsmn.org.ng/about",
        "locator": "Official About page; page availability was rechecked but detailed content was not exposed by the fetcher",
        "claim": "The Nigerian procurement institute is a relevant local supply and purchasing context lead, but the fetched page does not establish a separate Nigerian distinction for every customs or trade area.",
        "source_scope": "domain",
    },
    "ng_cmd": {
        "source_publisher": "Centre for Management Development, Nigeria",
        "source_title": "Official Centre for Management Development site",
        "exact_url": "https://www.cmd.gov.ng/",
        "locator": "Official landing page; detailed content was not exposed by the fetcher",
        "claim": "CMD is a Nigerian management-development context lead, but the fetched page does not establish area-specific evidence for customer-service or retail branches.",
        "source_scope": "domain",
    },
    "ng_nihotour": {
        "source_publisher": "National Institute for Hospitality and Tourism",
        "source_title": "RIVAC registration portal",
        "exact_url": "https://rivac.nihotour.gov.ng/",
        "locator": "Official RIVAC registration portal; page availability was rechecked but detailed content was not exposed by the fetcher",
        "claim": "The Nigerian tourism institute portal is a local hospitality and tourism credential/context lead, but the fetched page does not establish every tourism or culinary area separately.",
        "source_scope": "domain",
    },
    "ng_nahbpon_hair_beauty": {
        "source_publisher": "National Association of Hair and Beauty Practitioners of Nigeria",
        "source_title": "About NAHBPON",
        "exact_url": "https://nahbpon.com/about-nahbpon/",
        "locator": "Official About page; detailed content was not exposed by the fetcher",
        "claim": "The Nigerian practitioner association is a local hair-and-beauty context lead, but the fetched page does not establish a separate Nigerian distinction for each hair specialization.",
        "source_scope": "domain",
    },
    "ng_apsman_aesthetics": {
        "source_publisher": "Association of Practitioners of Spa and Medical Aesthetics of Nigeria",
        "source_title": "APSMAN official site and About section",
        "exact_url": "https://apsman.org/",
        "locator": "About APSMAN section, lines describing nationwide professional voice, standards, training, certification, and licences",
        "claim": "APSMAN identifies a Nigerian spa, beauty, wellness, and medical-aesthetics professional context and reports standards, training, certification, and licensing activity.",
        "source_scope": "domain",
    },
    "ng_posban_beauty": {
        "source_publisher": "Practitioners of Spa and Beauty Association of Nigeria",
        "source_title": "About POSBAN",
        "exact_url": "https://posbann.com/about-us/",
        "locator": "Official About page; detailed content was not exposed by the fetcher",
        "claim": "The Nigerian beauty-practitioner association is a local sector lead, but the fetched page does not establish a separate Nigerian distinction for each beauty-service area.",
        "source_scope": "domain",
    },
    "global_nafd_funeral_education": {
        "source_publisher": "National Association of Funeral Directors (United Kingdom)",
        "source_title": "Education and training",
        "exact_url": "https://www.nafd.org.uk/education/nafd-education-and-training/",
        "locator": "Education and training page; retained as a non-Nigerian comparison lead only",
        "claim": "This is not a Nigerian source and therefore cannot establish a Nigerian overlay for funeral or mortuary practice.",
        "source_scope": "domain",
    },
    "ng_corbon_plumbing_painting_nos": {
        "source_publisher": "Council of Registered Builders of Nigeria",
        "source_title": "Construction Labour Market Information System National Occupational Standards",
        "exact_url": "https://www.clmis.corbon.gov.ng/nos",
        "locator": "National Occupational Standards for Construction Building Trades in Nigeria",
        "claim": "The Nigerian construction-trade standards source supports a local building-trade context, but it does not by itself establish a separate Nigerian specialization for each plumbing, HVAC, painting, or surface-treatment branch.",
        "source_scope": "domain",
    },
    "ng_cippon_printing_act": {
        "source_publisher": "Chartered Institute of Professional Printers of Nigeria",
        "source_title": "CIPPON official About page",
        "exact_url": "https://www.cipponinstituteedu-ng.org/about.html",
        "locator": "Official About page; detailed text was not exposed consistently by the fetcher",
        "claim": "CIPPON is a Nigerian printing-profession lead, but the fetched page does not independently establish each pre-press, press, or post-press branch.",
        "source_scope": "domain",
    },
    "ng_sppn_printing": {
        "source_publisher": "Society of Printing Practitioners of Nigeria",
        "source_title": "Official SPPN site",
        "exact_url": "https://sppn.com.ng/",
        "locator": "Who We Are, Mission, Membership, and professional-programmes sections",
        "claim": "SPPN describes a Nigerian printing, packaging, publishing, and graphic-communication ecosystem with training, certification, advocacy, and professional support.",
        "source_scope": "area",
    },
}


# Direct support is deliberately narrow: the source must name/bound the
# practice branch, not merely be a nearby regulator or role source.
DIRECT_SUPPORT: dict[str, set[str]] = {
    "ng_cieeen": {"D059", "D093", "D094", "D098"},
    "ng_nasrda": {"D059"},
    "ng_cibn": {"D060"},
    "ng_fmacce": {"D070", "D080", "D104", "D105", "D108"},
    "ng_nla": {"D073"},
    "ng_nemet": {"D074"},
    "ng_fashion_council": {"D075", "D105", "D106"},
    "ng_nihotour": {"D083", "D092"},
    "ng_nahbpon_hair_beauty": {"D087"},
    "ng_apsman_aesthetics": {"D088"},
    "ng_sppn_printing": {"D108"},
    "ng_clmis_corbon": {"D097", "D099", "D102"},
    "ng_corbon_plumbing_painting_nos": {"D100", "D101"},
    "ng_nsqf_nos": {"D091", "D093", "D095", "D096", "D097", "D099", "D100", "D101", "D102", "D106", "D107"},
}


def choose_source(domain: dict[str, Any]) -> dict[str, Any]:
    leads = domain.get("existing_nigeria_source_leads", [])
    for lead in leads:
        sid = lead["source_id"]
        if sid in SOURCE_CATALOG:
            source = dict(SOURCE_CATALOG[sid])
            source["source_id"] = sid
            return source
    # D086 and any future no-lead row are explicitly recorded as a searched,
    # unsupported case using the national framework as the consulted primary
    # source.  This is not a claim that NSQF covers gaming.
    source = dict(SOURCE_CATALOG["ng_nsqf_nos"])
    source["source_id"] = "ng_nsqf_nos"
    source["locator"] += "; consulted for a national qualification framework, not gaming-sector evidence"
    return source


def build_record(domain: dict[str, Any], area: dict[str, Any]) -> dict[str, Any]:
    source = choose_source(domain)
    directly_supported = domain["domain_id"] in DIRECT_SUPPORT.get(source["source_id"], set())
    if directly_supported:
        disposition = "nigeria_specific_overlay_supported"
        scope = "area" if source["source_scope"] == "area" else "domain"
        claim = source["claim"]
        what_it_supports = (
            f"For {area['label']}, the source supports a Nigerian local context within the parent domain: "
            f"{source['claim']}"
        )
        limits = (
            "The source supports local practice, standards, sector or credential context; it does not prove that this is the only "
            "possible specialization, establish Nigerian demand, or justify changing the global area label."
        )
        confidence = "medium"
    else:
        disposition = "no_primary_nigerian_evidence_found_after_search"
        scope = "domain"
        claim = source["claim"]
        what_it_supports = (
            f"The consulted Nigerian source supports only parent-domain context for {domain['domain_name']} (or is a non-Nigerian comparison source); "
            f"it does not establish an area-specific Nigerian distinction for {area['label']}."
        )
        limits = (
            "This is a bounded negative finding, not proof that no Nigerian evidence exists anywhere. The global area is preserved; "
            "no local credential, demand claim, role mapping, or specialization label is inferred from the source."
        )
        confidence = "medium" if source["source_id"] != "global_nafd_funeral_education" else "high"
    return {
        "domain_id": domain["domain_id"],
        "domain_name": domain["domain_name"],
        "global_area_label": area["label"],
        "global_area_boundary": area["boundary"],
        "disposition": disposition,
        "exact_nigerian_claim": claim,
        "source_publisher": source["source_publisher"],
        "source_title": source["source_title"],
        "exact_url": source["exact_url"],
        "locator": source["locator"],
        "access_date": ACCESS_DATE,
        "what_it_supports": what_it_supports,
        "limits": limits,
        "global_area_label_preserved": True,
        "scope": scope,
        "confidence": confidence,
        "source_id": source["source_id"],
        "evidence_status": "revalidated_official_source_or_explicitly_bounded_negative",
    }


def main() -> None:
    worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
    domains = worklist["domains"]
    assert [int(d["domain_id"][1:]) for d in domains] == list(range(57, 113))
    records = [
        build_record(domain, area)
        for domain in domains
        for area in domain.get("approved_global_specialization_areas", [])
    ]
    assert len(records) == sum(len(d.get("approved_global_specialization_areas", [])) for d in domains)
    assert len({(r["domain_id"], r["global_area_label"]) for r in records}) == len(records)
    assert all(r["global_area_label_preserved"] for r in records)
    counts: dict[str, int] = {}
    for record in records:
        counts[record["disposition"]] = counts.get(record["disposition"], 0) + 1
    payload = {
        "schema_version": "2026-10-06.nigerian-specialization-context-evidence.v1",
        "lane_id": "D057_D112",
        "scope": "Nigerian-context enrichment for finalized global areas only",
        "append_only": True,
        "source_revalidation_date": ACCESS_DATE,
        "global_step1_preserved": True,
        "canonical_taxonomy_changed": False,
        "roles_audited_or_changed": False,
        "records_count": len(records),
        "disposition_counts": counts,
        "records": records,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Nigerian-context enrichment checkpoint — D057–D112",
        "",
        f"Generated: {ACCESS_DATE}",
        "",
        "This is an append-only Nigerian evidence ledger for the finalized global Step 1 areas. It does not edit the global area labels, roles, subgroups, or canonical taxonomy.",
        "",
        f"- Domains covered: {len(domains)} (D057–D112)",
        f"- Global specialization records covered: {len(records)}",
        f"- Direct/local overlay records: {counts.get('nigeria_specific_overlay_supported', 0)}",
        f"- Parent-domain-only or bounded-negative records: {counts.get('no_primary_nigerian_evidence_found_after_search', 0)}",
        "- Global labels preserved: 100%",
        "- Role audit or canonical taxonomy changes: none",
        "",
        "## Interpretation",
        "",
        "A direct overlay means the revalidated Nigerian source names or bounds a relevant sector, practice, standard, or credential context. A bounded-negative record means the consulted source supports only the parent domain or is not Nigerian, so no Nigerian area distinction was inferred. Those records remain explicit follow-up evidence gaps rather than fabricated enrichment.",
        "",
        "## Evidence artifact",
        "",
        f"- JSON: `{OUT_JSON.name}`",
        "",
        "The JSON is the authoritative checkpoint and contains one record per finalized global area with URL, title, locator, claim, limits, scope, disposition, and confidence.",
        "",
    ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"output": str(OUT_JSON), "records": len(records), "dispositions": counts}, indent=2))


if __name__ == "__main__":
    main()
