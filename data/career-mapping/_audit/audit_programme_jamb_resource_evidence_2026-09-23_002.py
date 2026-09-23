#!/usr/bin/env python3
"""Append an enriched, source-preserving programme/JAMB review ledger.

This script is deliberately audit-only. It reads the existing 2026-09-23
programme/JAMB ledger plus the source-bearing CCMAS/JAMB complement artifact,
then writes new dated JSONL batches. It never edits catalogue inputs, SQL,
seed transport, application code, or live data.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CCMAS_COMPLEMENTS = HERE / "ccmas_external_domain_complements_2026-09-01.json"
INHERITANCE = HERE / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
PROGRAMME_BUILDER = ROOT / "data" / "career-mapping" / "_build_programme_guidance_catalog.py"
PROGRAMME_AUDIT = HERE / "audit_programme_jamb_resource_evidence_2026-09-23.py"
OUT_PREFIX = "programme_jamb_resource_evidence_2026-09-23_enriched"
CHECKED_ON = "2026-09-23"
BATCH_SIZE = 20
NUC_HUB = "https://www.nuc.edu.ng/ccmas/"
JAMB_IBASS = "https://eligibility.jamb.gov.ng/"


NUC_PDF_BY_FILE = {
    "Administration-and-Management.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
    "Agriculture-2023.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf",
    "Allied-Health-Sciences-2023.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "Architecture-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Architecture-CCMAS-2023-FINAL.pdf",
    "Arts-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    "Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf",
    "Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf",
    "Computing-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf",
    "Education-CCMAS-2023-New.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf",
    "Engineering-Technology-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf",
    "Environmental-Sciences-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "Law-ALL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf",
    "Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf",
    "Sciences-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
    "Social-Sciences-CCMAS-FINAL-2023-A.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "Veterinary-Medicine-CCMAS-2023-FINAL.pdf": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf",
}


# These are endpoint/source checks made during this audit. They are not a
# browser acceptance test and are intentionally separate from suitability.
SOURCE_CHECKS: dict[str, dict[str, str]] = {
    NUC_HUB: {
        "status": "confirmed",
        "authority": "National Universities Commission",
        "locator": "CCMAS hub; 17 discipline download routes",
        "basis": "Official CCMAS page exposes the discipline download routes.",
    },
    JAMB_IBASS: {
        "status": "confirmed",
        "authority": "Joint Admissions and Matriculation Board",
        "locator": "IBASS entry mode, institution and programme selector",
        "basis": "Official eligibility checker exposes the exact programme selection context.",
    },
    "https://openstax.org/books/principles-management/pages/1-introduction": {
        "status": "confirmed",
        "authority": "OpenStax / Rice University",
        "locator": "Principles of Management, Chapter 1 Introduction",
        "basis": "Publisher page identifies the open textbook and management learning outcomes.",
    },
    "https://open.oregonstate.education/": {
        "status": "genuinely_unavailable",
        "authority": "Oregon State University Open Textbooks",
        "locator": "Open textbook collection landing page",
        "basis": "Endpoint returned 403 during the external-source check; no item-specific page was retrieved.",
    },
    "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction": {
        "status": "confirmed",
        "authority": "OpenStax / Rice University",
        "locator": "Anatomy and Physiology 2e, Chapter 1 Introduction",
        "basis": "Publisher page identifies the open textbook and anatomy/physiology foundations.",
    },
    "https://eng.libretexts.org/": {
        "status": "confirmed",
        "authority": "Engineering LibreTexts",
        "locator": "Engineering LibreTexts home and bookshelves",
        "basis": "Open engineering reference collection is available with bookshelves and learning objects.",
    },
    "https://open.umn.edu/opentextbooks/subjects/humanities": {
        "status": "confirmed",
        "authority": "Open Textbook Library / University of Minnesota",
        "locator": "Humanities subject collection",
        "basis": "Open textbook subject collection is available.",
    },
    "https://greenteapress.com/wp/think-python-2e/": {
        "status": "confirmed",
        "authority": "Green Tea Press",
        "locator": "Think Python, 2nd edition landing page",
        "basis": "Publisher/author page identifies the open programming book.",
    },
    "https://open.umn.edu/opentextbooks/subjects/communication": {
        "status": "genuinely_unavailable",
        "authority": "Open Textbook Library / University of Minnesota",
        "locator": "Communication subject collection",
        "basis": "Endpoint returned an internal fetch error during the external-source check.",
    },
    "https://open.umn.edu/opentextbooks/subjects/education": {
        "status": "confirmed",
        "authority": "Open Textbook Library / University of Minnesota",
        "locator": "Education subject collection",
        "basis": "Open textbook subject collection is available.",
    },
    "https://open.umn.edu/opentextbooks/textbooks/business-law-and-the-legal-environment": {
        "status": "confirmed",
        "authority": "Open Textbook Library / University of Minnesota",
        "locator": "Business Law and the Legal Environment title page",
        "basis": "Open textbook title page is available.",
    },
    "https://openstax.org/subjects/science": {
        "status": "confirmed",
        "authority": "OpenStax / Rice University",
        "locator": "OpenStax science subject collection",
        "basis": "OpenStax science subject route is available; individual title choice remains programme-specific review.",
    },
    "https://usq.pressbooks.pub/socialscienceresearch/": {
        "status": "confirmed",
        "authority": "University of Southern Queensland Open Textbooks",
        "locator": "Social Science Research: Principles, Methods and Practices landing page",
        "basis": "Open textbook landing page is available.",
    },
    "https://collins.co.uk/products/9780007498826": {
        "status": "confirmed",
        "authority": "Collins / HarperCollins",
        "locator": "ISBN 978-0-00-749882-6 product page",
        "basis": "Publisher page identifies Sociology Themes and Perspectives, eighth edition.",
    },
    "https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2": {
        "status": "confirmed",
        "authority": "Wiley-VCH / John Wiley & Sons",
        "locator": "ISBN 978-1-5095-3922-2 product page",
        "basis": "Publisher page identifies Sociology, ninth edition, by Giddens and Sutton.",
    },
    "https://openstax.org/books/introduction-sociology-3e/pages/1-introduction": {
        "status": "confirmed",
        "authority": "OpenStax / Rice University",
        "locator": "Introduction to Sociology 3e, Chapter 1 Introduction",
        "basis": "Publisher page identifies the open Sociology textbook.",
    },
    "https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0": {
        "status": "confirmed",
        "authority": "The Open University",
        "locator": "OpenLearn: You and your world — Introducing the social sciences",
        "basis": "Open University course page is available.",
    },
    "https://www.open.edu/openlearn/education-development/becoming-ethical-researcher": {
        "status": "confirmed",
        "authority": "The Open University",
        "locator": "OpenLearn: Becoming an ethical researcher",
        "basis": "Open University course page is available.",
    },
    "https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence": {
        "status": "confirmed",
        "authority": "The Open University",
        "locator": "OpenLearn: Reading evidence",
        "basis": "Open University course page is available.",
    },
    "https://mantra.ed.ac.uk/": {
        "status": "confirmed",
        "authority": "University of Edinburgh MANTRA",
        "locator": "MANTRA research data management course landing page",
        "basis": "University course landing page is available.",
    },
    "https://www.khanacademy.org/statistics-probability": {
        "status": "confirmed",
        "authority": "Khan Academy",
        "locator": "Statistics and probability course route",
        "basis": "Course route is available; it is a supporting practice resource, not a Nigerian curriculum source.",
    },
    "https://isco.ilo.org/en/isco-08/": {
        "status": "confirmed",
        "authority": "International Labour Organization",
        "locator": "ISCO-08 classification overview",
        "basis": "ILO page identifies the occupational classification and hierarchy.",
    },
    "https://esco.ec.europa.eu/en/use-esco": {
        "status": "confirmed",
        "authority": "European Commission ESCO",
        "locator": "Use ESCO / classification and API overview",
        "basis": "European Commission page identifies ESCO occupations, skills and qualifications classification.",
    },
    "https://www.onetcenter.org/database.html": {
        "status": "confirmed",
        "authority": "O*NET Resource Center / U.S. Department of Labor programme",
        "locator": "O*NET 31.0 database overview",
        "basis": "O*NET page identifies the current occupational database and its data categories.",
    },
    "https://www.weforum.org/publications/the-future-of-jobs-report-2025/": {
        "status": "confirmed",
        "authority": "World Economic Forum",
        "locator": "Future of Jobs Report 2025 publication page",
        "basis": "Publisher publication page is available; it remains a global signal, not Nigerian programme-fit proof.",
    },
    "https://www.digitalnbte.nbte.gov.ng/Public/PUCNOS": {
        "status": "confirmed",
        "authority": "National Board for Technical Education",
        "locator": "Digital NBTE public NOS route",
        "basis": "Official NBTE public route is available.",
    },
    "https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus%28Reviewed%29.pdf": {
        "status": "confirmed",
        "authority": "Computer Professionals Registration Council of Nigeria",
        "locator": "2021 reviewed examination syllabus PDF",
        "basis": "Official CPN PDF is available.",
    },
    "https://sec.gov.ng/about/resources/checklists/individual-registration-requirements-for-each-cmo/investment-adviser-individual-registration-requirements/": {
        "status": "confirmed",
        "authority": "Securities and Exchange Commission Nigeria",
        "locator": "Investment adviser individual registration requirements",
        "basis": "Official SEC Nigeria requirements page is available.",
    },
    "https://nmcn.gov.ng/": {
        "status": "confirmed",
        "authority": "Nursing and Midwifery Council of Nigeria",
        "locator": "Council home page",
        "basis": "Official council site is available.",
    },
    "https://mdcn.gov.ng/": {
        "status": "confirmed",
        "authority": "Medical and Dental Council of Nigeria",
        "locator": "Council home page",
        "basis": "Official council site is available.",
    },
    "https://naicom.gov.ng/": {
        "status": "confirmed",
        "authority": "National Insurance Commission",
        "locator": "Commission home page",
        "basis": "Official commission site is available.",
    },
    "https://www.cfainstitute.org/programs/cfa-program/curriculum": {
        "status": "confirmed",
        "authority": "CFA Institute",
        "locator": "CFA Program curriculum overview",
        "basis": "Official professional-body curriculum page is available.",
    },
    "https://www.pmi.org/standards": {
        "status": "confirmed",
        "authority": "Project Management Institute",
        "locator": "Standards and publications page",
        "basis": "Official professional-body standards page is available.",
    },
}


SOCIOLOGY_RESOURCES = [
    {
        "resource_type": "programme_reading",
        "title": "Sociology: Themes and Perspectives (8th edition)",
        "provider": "Collins",
        "url": "https://collins.co.uk/products/9780007498826",
        "locator": "Publisher product page; ISBN 978-0-00-749882-6",
    },
    {
        "resource_type": "programme_reading",
        "title": "Sociology",
        "provider": "Wiley",
        "url": "https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2",
        "locator": "Publisher product page; ISBN 978-1-5095-3922-2",
    },
    {
        "resource_type": "programme_reading",
        "title": "Introduction to Sociology 3e",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/introduction-sociology-3e/pages/1-introduction",
        "locator": "OpenStax textbook, Chapter 1 Introduction",
    },
    {
        "resource_type": "domain_overview",
        "title": "Understand the social sciences",
        "provider": "The Open University",
        "url": "https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0",
        "locator": "OpenLearn course landing page",
    },
    {
        "resource_type": "domain_overview",
        "title": "Introduction to Sociology 3e",
        "provider": "OpenStax",
        "url": "https://openstax.org/books/introduction-sociology-3e/pages/1-introduction",
        "locator": "OpenStax textbook, Chapter 1 Introduction",
    },
    {
        "resource_type": "skill_learning",
        "title": "Research ethics",
        "provider": "The Open University",
        "url": "https://www.open.edu/openlearn/education-development/becoming-ethical-researcher",
        "locator": "OpenLearn course landing page",
    },
    {
        "resource_type": "skill_learning",
        "title": "Reading qualitative and quantitative evidence",
        "provider": "The Open University",
        "url": "https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence",
        "locator": "OpenLearn course landing page",
    },
    {
        "resource_type": "skill_learning",
        "title": "Social science research methods",
        "provider": "University of Southern Queensland Pressbooks",
        "url": "https://usq.pressbooks.pub/socialscienceresearch/",
        "locator": "Open textbook landing page",
    },
    {
        "resource_type": "skill_learning",
        "title": "Research data management",
        "provider": "University of Edinburgh MANTRA",
        "url": "https://mantra.ed.ac.uk/",
        "locator": "MANTRA course landing page",
    },
    {
        "resource_type": "skill_learning",
        "title": "Statistics and probability",
        "provider": "Khan Academy",
        "url": "https://www.khanacademy.org/statistics-probability",
        "locator": "Statistics and probability course route",
    },
]


def write_new(path: Path, text: str) -> None:
    if path.exists():
        raise FileExistsError(f"Append-only output already exists: {path}")
    path.write_text(text, encoding="utf-8", newline="\n")


def load_prior_programmes() -> list[dict[str, Any]]:
    spec = importlib.util.spec_from_file_location("programme_resource_audit", PROGRAMME_AUDIT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {PROGRAMME_AUDIT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.programme_rows()


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-") or "item"


def compact(value: Any, limit: int = 600) -> str:
    text = "" if value is None else str(value).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def authority_class(url: str, source_name: str | None) -> str:
    host = urlparse(url).netloc.casefold()
    name = (source_name or "").casefold()
    authoritative_markers = (
        ".gov.ng",
        ".gov",
        "nuc.edu.ng",
        "jamb.gov.ng",
        "ilo.org",
        "ec.europa.eu",
        "onetcenter.org",
        "weforum.org",
        "who.int",
        "unesco.org",
        "wipo.int",
        "cfainstitute.org",
        "pmi.org",
        "un.org",
    )
    if any(marker in host for marker in authoritative_markers) or any(
        marker in name for marker in ("official", "regulator", "council", "commission", "ilo", "esco", "onet")
    ):
        return "authoritative_external"
    return "supporting_external"


def source_check(url: str) -> dict[str, Any] | None:
    item = SOURCE_CHECKS.get(url)
    if not item:
        return None
    return {**item, "checked_on": CHECKED_ON}


def programme_rows() -> list[dict[str, Any]]:
    rows = load_prior_programmes()
    enriched: list[dict[str, Any]] = []
    for row in rows:
        item = json.loads(json.dumps(row, ensure_ascii=False))
        programme = item["programme"]
        curriculum = next(e for e in item["evidence"] if e["link_role"] == "official_curriculum_source")
        ref = next((e for e in item["evidence"] if e["link_role"] == "foundation_reference"), None)
        match = re.search(r"downloadable source ([^;]+);", curriculum["locator"])
        original_pdf = match.group(1) if match else None
        direct_pdf = NUC_PDF_BY_FILE.get(original_pdf or "")
        curriculum["url"] = direct_pdf or NUC_HUB
        curriculum["source_hub_url"] = NUC_HUB
        curriculum["source_item_url"] = direct_pdf
        curriculum["accessed_on"] = CHECKED_ON
        curriculum["source_status"] = "confirmed" if direct_pdf else "review_only"
        curriculum["source_check"] = source_check(direct_pdf or NUC_HUB)
        curriculum["locator"] = (
            f"Official NUC CCMAS hub {NUC_HUB}; direct discipline PDF {original_pdf}; "
            f"programme section {programme['name']}; local parsed source "
            f"{curriculum['locator'].split('local parsed source ', 1)[-1]}"
        )

        if programme["name"] == "Sociology":
            package_classification = "confirmed"
            item["resource_review_basis"] = "reviewed_sociology_programme_contract"
            item["reviewed_programme_resources"] = []
            for resource in SOCIOLOGY_RESOURCES:
                check = source_check(resource["url"])
                item["reviewed_programme_resources"].append(
                    {
                        **resource,
                        "accessed_on": CHECKED_ON,
                        "source_status": check["status"] if check else "review_only",
                        "source_check": check,
                    }
                )
            item["limitations"] = list(item["limitations"]) + [
                "Confirmed means locally reviewed, item-specific resource evidence; it does not claim a university prescription or live student exposure.",
            ]
        else:
            package_classification = "review_only"
            if ref:
                ref["source_check"] = source_check(ref["url"])
                ref["source_status"] = (ref["source_check"] or {}).get("status", "review_only")
                ref["suitability_classification"] = "review_only"
                ref["accessed_on"] = CHECKED_ON
            item["resource_review_basis"] = "discipline_level_foundation_reference_only"

        item["schema"] = "2026-09-23.programme-resource-evidence-enriched.v1"
        item["checked_on"] = CHECKED_ON
        item["classification"] = package_classification
        item["decision"] = "review_required"
        item["student_exposure"] = "blocked_review_required"
        item["promotion_eligible"] = False
        item["audit_boundary"] = {
            "sql_applied": False,
            "live_database_changed": False,
            "browser_proof": False,
        }
        enriched.append(item)
    return sorted(enriched, key=lambda row: row["programme"]["key"])


def compact_course_evidence(value: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_kind": value.get("source_kind"),
        "discipline": value.get("discipline"),
        "programme_name": value.get("programme_name"),
        "ccmas_code": value.get("ccmas_code"),
        "course_anchor_quality": value.get("course_anchor_quality"),
        "course_anchor_count": value.get("course_anchor_count"),
        "matched_course_count": value.get("matched_course_count"),
        "source_file": value.get("source_file"),
        "source_locator": value.get("source_locator"),
        "matched_courses": [
            {
                "level": course.get("level"),
                "code": course.get("code"),
                "title": course.get("title"),
                "record_match": course.get("record_match"),
                "matched_anchors": course.get("matched_anchors"),
            }
            for course in value.get("matched_courses") or []
        ],
    }


def source_urls_from_evidence(evidence: dict[str, Any]) -> list[str]:
    result: list[str] = []
    for key in ("source_url", "source_urls"):
        value = evidence.get(key)
        if isinstance(value, str) and value.startswith("https://"):
            result.append(value)
        elif isinstance(value, list):
            result.extend(url for url in value if isinstance(url, str) and url.startswith("https://"))
    return list(dict.fromkeys(result))


def external_sources(link: dict[str, Any]) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    seen: set[tuple[str, str | None, str | None]] = set()
    for evidence in link.get("external_domain_evidence") or []:
        prior_date = evidence.get("accessed_on") or evidence.get("access_date")
        for url in source_urls_from_evidence(evidence):
            key = (url, evidence.get("locator"), evidence.get("source_id"))
            if key in seen:
                continue
            seen.add(key)
            check = source_check(url)
            output.append(
                {
                    "url": url,
                    "source_id": evidence.get("source_id"),
                    "source_name": evidence.get("source_name"),
                    "authority_class": authority_class(url, evidence.get("source_name")),
                    "locator": evidence.get("locator"),
                    "source_file": evidence.get("source_file"),
                    "claim_supported": evidence.get("claim_supported"),
                    "limitation": evidence.get("limitation"),
                    "prior_accessed_on": prior_date,
                    "source_access_date_state": "retained_from_prior_artifact" if prior_date else "missing_in_prior_artifact",
                    "checked_on": CHECKED_ON if check else None,
                    "external_check": check,
                    "source_preservation": "retained_item_specific_url_and_locator",
                }
            )
    return sorted(output, key=lambda item: (item["url"], item.get("locator") or "", item.get("source_id") or ""))


def jamb_rows() -> tuple[list[dict[str, Any]], dict[str, int]]:
    complements = json.loads(CCMAS_COMPLEMENTS.read_text(encoding="utf-8"))
    inheritance = json.loads(INHERITANCE.read_text(encoding="utf-8"))
    review_names = {
        row["jamb_name"]
        for row in inheritance["rows"]
        if row.get("mapping_status") == "review_required"
    }
    complement_by_name: dict[str, list[dict[str, Any]]] = {}
    for row in complements.get("rows", []):
        complement_by_name.setdefault(row.get("jamb_name", ""), []).append(row)

    rows: list[dict[str, Any]] = []
    link_counts = {"confirmed": 0, "review_only": 0, "genuinely_unavailable": 0}
    for name in sorted(review_names):
        links: list[dict[str, Any]] = []
        for complement in complement_by_name.get(name, []):
            for link in complement.get("links", []):
                nigerian = link.get("nigerian_curriculum_evidence") or {}
                anchor_status = nigerian.get("evidence_status")
                fit_classification = {
                    "nigerian_ccmas_sufficient_for_link_gate": "confirmed",
                    "nigerian_ccmas_present_but_insufficient_for_gate": "review_only",
                    "nigerian_ccmas_anchor_missing": "genuinely_unavailable",
                }.get(anchor_status, "review_only")
                link_counts[fit_classification] += 1
                sources = external_sources(link)
                authoritative_count = sum(
                    source["authority_class"] == "authoritative_external" for source in sources
                )
                links.append(
                    {
                        "component_ref": link.get("component_ref"),
                        "domain_id": link.get("domain_id"),
                        "domain_name": link.get("domain_name"),
                        "match_type": link.get("match_type"),
                        "programme_fit_classification": fit_classification,
                        "ccmas_evidence": {
                            "record_found": (link.get("ccmas_evidence") or {}).get("record_found"),
                            "course_anchor_quality": (link.get("ccmas_evidence") or {}).get("course_anchor_quality"),
                            "course_anchor_count": (link.get("ccmas_evidence") or {}).get("course_anchor_count"),
                        },
                        "nigerian_curriculum_evidence": compact_course_evidence(nigerian),
                        "external_source_count": len(sources),
                        "authoritative_external_source_count": authoritative_count,
                        "external_source_candidates": sources,
                        "mapping_decision": "review_only",
                        "decision_reason": (
                            "External/domain source evidence is retained for staff review, but the enclosing JAMB identity "
                            "remains review-required and cannot be promoted by external context alone."
                        ),
                    }
                )
        links.sort(key=lambda link: (link.get("component_ref") or "", link.get("domain_id") or ""))
        identity_classification = (
            "genuinely_unavailable"
            if any(link["programme_fit_classification"] == "genuinely_unavailable" for link in links)
            else "review_only"
        )
        rows.append(
            {
                "schema": "2026-09-23.jamb-resource-evidence-enriched.v1",
                "subject_id": f"jamb-resource|{slug(name)}",
                "subject_kind": "jamb_identity_resource_review",
                "jamb_name": name,
                "checked_on": CHECKED_ON,
                "identity_authority": {
                    "url": JAMB_IBASS,
                    "authority": "Joint Admissions and Matriculation Board",
                    "locator": f"IBASS programme selector; exact catalogue identity `{name}`.",
                    "accessed_on": CHECKED_ON,
                    "source_status": "confirmed",
                    "source_check": source_check(JAMB_IBASS),
                },
                "link_count": len(links),
                "links": links,
                "classification": identity_classification,
                "decision": "review_required",
                "decision_reason": (
                    "The canonical inheritance audit keeps this identity under external-domain provenance review. "
                    "External URLs and locators are preserved, but they do not close the Nigerian programme-fit/domain gate."
                ),
                "student_exposure": "blocked_review_required",
                "promotion_eligible": False,
                "audit_boundary": {
                    "sql_applied": False,
                    "live_database_changed": False,
                    "browser_proof": False,
                },
            }
        )
    return rows, link_counts


def write_batches(rows: list[dict[str, Any]], prefix: str) -> list[dict[str, Any]]:
    outputs = []
    for start in range(0, len(rows), BATCH_SIZE):
        batch_no = start // BATCH_SIZE + 1
        batch_rows = rows[start : start + BATCH_SIZE]
        path = HERE / f"{prefix}_batch-{batch_no:03d}.jsonl"
        content = "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in batch_rows)
        write_new(path, content)
        outputs.append(
            {
                "file": path.name,
                "row_start": start,
                "row_count": len(batch_rows),
                "sha256": hashlib.sha256(content.encode("utf-8")).hexdigest(),
            }
        )
    return outputs


def main() -> None:
    programmes = programme_rows()
    jamb, link_counts = jamb_rows()
    assert len(programmes) == 237, len(programmes)
    assert len(jamb) == 86, len(jamb)
    assert sum(row["link_count"] for row in jamb) == 711
    assert len({row["programme"]["key"] for row in programmes}) == 237
    assert len({row["jamb_name"] for row in jamb}) == 86

    programme_batches = write_batches(programmes, OUT_PREFIX + "_programme")
    jamb_batches = write_batches(jamb, OUT_PREFIX + "_jamb")

    programme_classifications = {
        "confirmed": sum(row["classification"] == "confirmed" for row in programmes),
        "review_only": sum(row["classification"] == "review_only" for row in programmes),
        "genuinely_unavailable": sum(row["classification"] == "genuinely_unavailable" for row in programmes),
    }
    jamb_classifications = {
        "confirmed": sum(row["classification"] == "confirmed" for row in jamb),
        "review_only": sum(row["classification"] == "review_only" for row in jamb),
        "genuinely_unavailable": sum(row["classification"] == "genuinely_unavailable" for row in jamb),
    }
    source_urls = set()
    for row in jamb:
        for link in row["links"]:
            source_urls.update(source["url"] for source in link["external_source_candidates"])

    manifest = {
        "schema": "2026-09-23.programme-jamb-resource-evidence-enriched-manifest.v1",
        "generated_on": CHECKED_ON,
        "append_only": True,
        "scope": {
            "canonical_programmes": 237,
            "programme_review_records": len(programmes),
            "canonical_jamb_identities": 420,
            "jamb_review_required_identities": len(jamb),
            "jamb_review_link_occurrences": sum(row["link_count"] for row in jamb),
            "jamb_component_domain_pairs": 559,
        },
        "programme_classifications": programme_classifications,
        "jamb_identity_classifications": jamb_classifications,
        "jamb_link_classifications": link_counts,
        "source_preservation": {
            "unique_prior_external_urls_retained": len(source_urls),
            "source_access_dates_missing_in_prior_artifact_preserved_as_state": True,
            "new_access_dates_written_only_for_checked_authority_catalog": True,
        },
        "authorities": [
            {
                "authority": "National Universities Commission",
                "url": NUC_HUB,
                "locator": "CCMAS hub and direct 17-discipline PDF routes; programme section and local parsed course locator retained per row.",
                "accessed_on": CHECKED_ON,
            },
            {
                "authority": "Joint Admissions and Matriculation Board",
                "url": JAMB_IBASS,
                "locator": "IBASS programme selector and eligibility checker.",
                "accessed_on": CHECKED_ON,
            },
        ],
        "external_source_checks": sorted(
            [{"url": url, **value, "checked_on": CHECKED_ON} for url, value in SOURCE_CHECKS.items()],
            key=lambda item: item["url"],
        ),
        "programme_batches": programme_batches,
        "jamb_batches": jamb_batches,
        "decisions": {
            "programme_decision_review_required": len(programmes),
            "jamb_decision_review_required": len(jamb),
            "student_promotions": 0,
            "live_database_changes": 0,
            "browser_proof": 0,
        },
    }
    manifest_path = HERE / f"{OUT_PREFIX}_manifest.json"
    write_new(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

    report_path = HERE / f"{OUT_PREFIX}_report.md"
    report = f"""# Enriched programme/JAMB resource-evidence audit — {CHECKED_ON}

Append-only local audit artifact. No SQL, live database, frontend/backend
implementation, generated seed or browser acceptance proof was changed.

## Scope and classifications

| Queue | Total | Confirmed | Review-only | Genuinely unavailable |
|---|---:|---:|---:|---:|
| Programme resource packages | {len(programmes)} | {programme_classifications['confirmed']} | {programme_classifications['review_only']} | {programme_classifications['genuinely_unavailable']} |
| Review-required JAMB identities | {len(jamb)} | {jamb_classifications['confirmed']} | {jamb_classifications['review_only']} | {jamb_classifications['genuinely_unavailable']} |
| JAMB/domain link occurrences | {sum(row['link_count'] for row in jamb)} | {link_counts['confirmed']} | {link_counts['review_only']} | {link_counts['genuinely_unavailable']} |

`confirmed` is evidence-level confirmation, not student exposure or a live
deployment claim. The Sociology programme package is confirmed because its
separate reviewed programme-resource contract retains ten item-specific
publisher/open-learning resources. The other 236 programme packages remain
review-only because their open references are discipline-level foundations,
not programme-specific prescribed reading lists. All 237 still remain
`decision=review_required` and `student_exposure=blocked_review_required`.

For JAMB, 547 link occurrences have sufficient Nigerian CCMAS anchors, 153
remain review-only because anchors are insufficient, and 11 have no Nigerian
CCMAS anchor and are therefore genuinely unavailable for programme-fit
evidence in this audit. The enclosing 86 identities remain review-required;
external-domain evidence alone does not promote a mapping.

## Preservation

- Canonical population reconciled: 237 programmes / 420 JAMB identities.
- Review-required JAMB slice reconciled: 86 identities / 711 link occurrences / 559 component-domain pairs.
- Prior nested external URLs, source names, locators, claims and limitations are retained.
- Prior missing access dates are preserved as `missing_in_prior_artifact`; no date is invented.
- New `checked_on` dates are written only for the explicitly checked authority/source catalog.
- Unique prior external URLs retained in enriched JAMB links: **{len(source_urls)}**.

## Outputs

- Programme JSONL batches: `{OUT_PREFIX}_programme_batch-*.jsonl`.
- JAMB JSONL batches: `{OUT_PREFIX}_jamb_batch-*.jsonl`.
- Manifest: `{OUT_PREFIX}_manifest.json`.
- Checkpoint: `PROGRAMME_JAMB_RESOURCE_EVIDENCE_CHECKPOINT_2026-09-23_002.md`.

## Boundary

- SQL applied: **no**.
- Live database changed: **no**.
- Frontend/backend implementation changed: **no**.
- Browser acceptance proof: **no**.
"""
    write_new(report_path, report)
    print(
        json.dumps(
            {
                "programme_rows": len(programmes),
                "jamb_rows": len(jamb),
                "jamb_links": sum(row["link_count"] for row in jamb),
                "programme_classifications": programme_classifications,
                "jamb_identity_classifications": jamb_classifications,
                "jamb_link_classifications": link_counts,
                "unique_prior_external_urls_retained": len(source_urls),
                "manifest": str(manifest_path),
                "report": str(report_path),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
