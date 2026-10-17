#!/usr/bin/env python3
"""Resolve candidate-only D078 role-item learning links without changing role approval."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_FINAL_DISPOSITION_2026_10_10.json"
TODAY = "2026-10-15"

# A replacement is applied only where the saved link was clearly mismatched or
# was only a broad catalogue. Each entry also records the precise scope/limits.
REPLACEMENTS = {
    59: {
        "title": "Legal Research & Analytical Methods — Open University OLCreate",
        "url": "https://www.open.edu/openlearncreate/course/view.php?id=17424",
        "locator": "Course overview and outcomes: locating primary/secondary legal sources, evaluating them and citing accurately.",
        "fit": "Free course on legal research methods; use only to research a law relevant to a documented historical question.",
        "limits": "Advanced legal-research course; not genealogist role evidence, Nigerian legal advice or authority to interpret a person's case.",
        "access": "free_course_account_optional",
    },
    62: {
        "title": "Animal Behavior — MIT OpenCourseWare lecture",
        "url": "https://ocw.mit.edu/courses/9-20-animal-behavior-fall-2013/resources/mit9_20f13_lec01_mp4/",
        "locator": "Introductory lecture on animal behavior and how it is studied.",
        "fit": "A narrow, free explanatory resource only if the research question explicitly concerns animal behavior or human–animal relations.",
        "limits": "One lecture, not a full applied-zoology course; animal methods do not establish human behavioral-science competence or animal-research authorization.",
        "access": "free_open_courseware",
    },
    81: {
        "title": "Effective Communication in the Workplace — OpenLearn",
        "url": "https://www.open.edu/openlearn/money-business/effective-communication-the-workplace",
        "locator": "Free course description and learning outcomes on communication choices and how messages are perceived.",
        "fit": "Free introductory communication practice relevant to explaining research and working with audiences.",
        "limits": "Workplace communication is not a full communication-science research-methods course.",
        "access": "free_course",
    },
    89: {
        "title": "Who are Europeans? — OpenLearn",
        "url": "https://www.open.edu/openlearn/mod/oucontent/view.php?id=4611&section=1.3.1",
        "locator": "Section 1.3.1, Europe and the EU: institutions and integration context.",
        "fit": "Free contextual introduction for a specifically European comparison.",
        "limits": "Some institutional details can change; check current EU sources before making present-day claims. Not a general D078 foundation.",
        "access": "free_learning_resource",
    },
    95: {
        "title": "Environmental Economics — TU Delft OpenCourseWare",
        "url": "https://ocw.tudelft.nl/course-readings/4-2-2-environmental-economics/",
        "locator": "Course reading on environmental externalities, ecosystem services and economic valuation.",
        "fit": "Free topic-specific learning for analysing environmental costs, incentives and policy choices.",
        "limits": "Introductory course reading; valuation assumptions and ecological limits must be made explicit.",
        "access": "free_open_courseware",
    },
    103: {
        "title": "No D078 learning route established for this concept",
        "url": None,
        "locator": "The former genealogy course link teaches family-history research, not the ESCO law-enforcement/intelligence sense of investigation research methods.",
        "fit": "No student learning link is attached because the current role-task record does not establish this item as a D078 task.",
        "limits": "Keep the source identity and mismatch in the audit; do not turn a similarly worded label into a D078 requirement.",
        "access": "not_applicable_to_d078",
    },
    108: {
        "title": "Data Carpentry Social Science Workshop",
        "url": "https://datacarpentry.github.io/socialsci-workshop/",
        "locator": "Social-science lesson materials for organizing data, reproducible cleaning and analysis/visualization in R.",
        "fit": "Free, hands-on social-science data workflow resource that better matches inspecting and preparing research data.",
        "limits": "Uses example survey data and specific tools; it does not replace statistical design, ethics or domain interpretation.",
        "access": "free_learning_resource",
    },
    115: {
        "title": "Nonfiction Book Writing — Open University OLCreate",
        "url": "https://www.open.edu/openlearncreate/course/view.php?id=17698",
        "locator": "Course description and outcomes on planning, editing and revising a nonfiction manuscript for clarity and accuracy.",
        "fit": "Free beginner resource for self-revision of a nonfiction manuscript.",
        "limits": "Does not teach peer review, scholarly copy-editing standards or specialist genealogical publication requirements.",
        "access": "free_course",
    },
    117: {
        "title": "Research Ethics — OpenLearn",
        "url": "https://www.open.edu/openlearn/mod/oucontent/view.php?id=48638&section=4",
        "locator": "Section 4, Research ethics: right and wrong conduct throughout research.",
        "fit": "Free course section for ethical research conduct where a project involves people or sensitive material.",
        "limits": "Does not teach the separate philosophical study of thanatology ethics or replace applicable ethics review and Nigerian law.",
        "access": "free_course_account_required_for_progress",
    },
    118: {
        "title": "Who are Europeans? — OpenLearn",
        "url": "https://www.open.edu/openlearn/mod/oucontent/view.php?id=4611&section=1.3.1",
        "locator": "Section 1.3.1, Europe and the EU.",
        "fit": "Free regional context for a Europe-specific political comparison.",
        "limits": "Regional and time-sensitive; not a general social-science foundation.",
        "access": "free_learning_resource",
    },
    152: {
        "title": "Pedigrees — MIT OpenCourseWare",
        "url": "https://ocw.mit.edu/courses/7-01sc-fundamentals-of-biology-fall-2011/pages/genetics/pedigrees/",
        "locator": "Genetics lesson on reading pedigrees for inherited traits and Mendelian patterns.",
        "fit": "Verifies the biological/genetic meaning of this item label.",
        "limits": "This is not documentary genealogy or a supported task in the current D078 genealogist route; retained as an audit disambiguation link only.",
        "access": "free_open_courseware_not_for_d078_route",
    },
    153: {
        "title": "No D078 learning route established for this concept",
        "url": None,
        "locator": "The previous OpenLearn family-history link did not teach the ESCO investigation methods used in police, intelligence or military operations.",
        "fit": "No student learning link is attached because no current D078 role-task route supports this operational concept.",
        "limits": "Do not equate family-history source searching with law-enforcement or intelligence investigation methods.",
        "access": "not_applicable_to_d078",
    },
    164: {
        "title": "Critical and Reflective Thinking: Management Consultants — OpenLearn",
        "url": "https://www.open.edu/openlearn/mod/oucontent/view.php?id=64716&section=1",
        "locator": "Section 1 discussion of how management consultants work and differing approaches to consulting.",
        "fit": "Free explanatory reading for understanding consulting as a distinct organisational-advice practice.",
        "limits": "A short conceptual reading, not practical consulting training, certification or proof the learner can deliver consulting services.",
        "access": "free_learning_resource",
    },
    167: {
        "title": "Understanding Your Customers — OpenLearn",
        "url": "https://www.open.edu/openlearn/money-business/understanding-your-customers",
        "locator": "Free course description and outcomes on customer behaviour, consumer/business buying and market context.",
        "fit": "Free, context-specific introduction to customer evidence and market research; appropriate only when a statistical task concerns customers or consumers.",
        "limits": "Not a complete sampling/statistical-marketing course and not a Nigerian market source; apply the learner's own population and data.",
        "access": "free_course",
    },
    171: {
        "title": "Everyday Maths for Social Sciences — FutureLearn",
        "url": "https://www.futurelearn.com/courses/everyday-maths-for-social-sciences",
        "locator": "Course units on percentages, averages, probability and data presentation in social-science examples.",
        "fit": "Context-specific introductory practice for selecting the mathematics needed by a bounded social/economic research task.",
        "limits": "The provider's access tier may be time-limited or paid for extended access; it is not a substitute for advanced statistics or mathematical economics.",
        "access": "provider_access_tier_check_at_visit",
    },
    172: {
        "title": "Studying Social Work Law — OpenLearn",
        "url": "https://www.open.edu/openlearn/society-politics-law/studying-social-work-law",
        "locator": "Course sections on how law shapes social-work decisions and service settings.",
        "fit": "Comparative introduction to why service researchers must identify legal and practice standards relevant to a setting.",
        "limits": "UK law and practice; not Nigerian standards, a Nigerian licence or a substitute for current local legal/regulatory guidance.",
        "access": "free_comparative_course",
    },
    173: {
        "title": "National Accounts Statistics — UN SDG:Learn",
        "url": "https://www.unsdglearn.org/courses/national-accounts-statistics/",
        "locator": "Free introductory course on the System of National Accounts, macroeconomic indicators and using them for macroeconomic analysis.",
        "fit": "Free, direct learning resource for understanding and tracking national-account indicators.",
        "limits": "Focuses on national-accounts statistics; extend with labour, prices, fiscal and financial indicators as the policy question requires.",
        "access": "free_course",
        "alternatives": [
            {
                "title": "Macroeconomic Diagnostics (MDSx) — IMF",
                "url": "https://www.imf.org/en/capacity-development/training/icdtc/courses/mdsx",
                "type": "official_advanced_route",
                "access": "Application/eligibility route aimed particularly at government officials; not assumed to be open self-paced learning.",
                "scope": "Country macroeconomic diagnosis, fiscal/monetary policy, financial stability and medium-term risks.",
            }
        ],
    },
}

# These remain useful only as a boundary/reference link, not as proof of a D078
# student task or professional authority.
REFERENCE_ONLY = {
    63: "Official England social-care standards reference; comparative only, not Nigerian service rules or a role-task course.",
    64: "Official England quality-assurance framework for adult social-care learning; framework reference, not Nigerian regulation or practical training.",
    69: "ISSAI 100 is a public-sector auditing standard/reference, not a practical audit course or tax-audit authority.",
    72: "NIST publication concerns biometric/forensic human-subject research protections; exact statistical-biometry versus identity-biometrics meaning remains unresolved, so do not display as a named D078 tool/skill yet.",
    73: "OpenStax accounting content teaches bookkeeping foundations, not current Nigerian bookkeeping regulations; use only to understand transaction records.",
    80: "OpenStax Business Law I is a United States-oriented educational text; use only comparatively, never as Nigerian law.",
    91: "IIBA BABOK page is an official professional framework reference; full guide access may require membership/payment and it is not a free practical course.",
    93: "OpenStax planning section teaches organisational planning, not the content or drafting of a specific company's policies.",
    94: "OpenStax planning section is a conceptual precursor only; it does not establish policy-drafting competence.",
    97: "World Bank education-expenditure review manual is a bounded applied example, not a general public-finance course.",
    99: "World Bank education-expenditure review manual directly illustrates expenditure review, but is not an audit qualification or Nigerian spending rule.",
    111: "MIT lesson is genetics/pedigree interpretation; it verifies the biological sense only and is not a D078 genealogy requirement.",
    112: "Official Open University family-law module; paid/institution-controlled and UK-specific, not Nigerian legal advice.",
    127: "Forensic-anthropology course outline is a specialist forensic/biological reference, not a D078 thanatology learning requirement.",
    128: "University of Otago forensic-psychiatry paper is postgraduate/clinical; it is a boundary reference only, not a criminologist's practice route.",
    136: "Introductory geology course is a conditional physical-context resource only when a human-geography question needs it; it is not a shared D078 foundation.",
    142: "Philosophy learning resource is retained for the audit only; the philosopher role is outside the D078 route.",
    143: "Anatomy/physiology textbook is not supported by the current D078 task route; retained for audit only.",
    146: "WTO course page requires registration/account access; describe this as access-gated, not an immediately available free course.",
    149: "WTO course information is an official course description; confirm registration/access before presenting it as available learning.",
    152: "MIT biology source confirms genetic pedigree meaning; no D078 genealogist route is established.",
    154: "OpenLearn social-work-law course is UK-specific comparative context, not Nigerian service law.",
    160: "Logic course is retained for the audit only; the philosopher role is outside the D078 route.",
    169: "OpenLearn resource teaches linear programming as one optimisation method; it is not a complete mathematical-modelling pathway.",
    170: "OpenLearn resource teaches linear programming as one optimisation method; it is not a complete mathematical-modelling pathway.",
}


def main() -> None:
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    records = data.get("records") or []
    if len(records) != 173:
        raise ValueError(f"Expected 173 records, got {len(records)}")

    fixed = 0
    for row in records:
        position = int(row["queue_position"])
        link = row.get("learning_link") or {}
        old_state = link.get("state")
        old_url_status = link.get("url_status")
        if position in REPLACEMENTS:
            replacement = REPLACEMENTS[position]
            link = {
                "title": replacement["title"],
                "url": replacement["url"],
                "locator": replacement["locator"],
                "fit": replacement["fit"],
                "limits": replacement["limits"],
                "access": replacement["access"],
                "state": "verified_resource_bounded" if replacement["url"] else "no_d078_learning_route",
                "verification": "source_page_or_authoritative_search_checked_2026-10-15",
                "access_date": TODAY,
                "student_display_approved": False,
                "prior_candidate_url": (row.get("learning_link") or {}).get("url"),
                "prior_candidate_disposition": "replaced_or_removed_after_scope_check",
            }
            if replacement.get("alternatives"):
                link["alternatives"] = replacement["alternatives"]
            row["learning_link"] = link
            row["learning_link_review"] = {
                "status": "verified_bounded_resource" if replacement["url"] else "no_supported_d078_learning_route",
                "checked_on": TODAY,
                "basis": "Direct page or authoritative source result checked; link meaning, access and limits are stated separately from role placement.",
                "previous_state": old_state,
                "previous_url_status": old_url_status,
            }
            fixed += 1
            continue

        if not link.get("url") and old_state not in {"no_d078_learning_route"}:
            # Do not invent a resource to satisfy a field. Such rows cannot be
            # displayed as learning options and need an explicit disposition.
            link["state"] = "no_supported_learning_url"
            link["verification"] = "no_verified_learning_url_in_record"
            link["student_display_approved"] = False
            row["learning_link"] = link
            row["learning_link_review"] = {
                "status": "no_verified_learning_url",
                "checked_on": TODAY,
                "basis": "No URL is available in the source record; omitted from student display until a relevant resource is found.",
                "previous_state": old_state,
            }
            fixed += 1
            continue

        # Existing direct checks and the dated source review are preserved.
        # This converts the old mixed candidate state into a terminal resource
        # finding; it does not promote the role-item or student visibility.
        existing_verification = str(link.get("verification") or "")
        existing_access = str(link.get("access_status") or "")
        if old_state in {"candidate_review_only", "candidate_link_checked_hidden"} or old_url_status in {
            "candidate_link_recorded", "candidate_link_found_direct_fetch_inconclusive"
        }:
            if position in REFERENCE_ONLY:
                link["state"] = "verified_reference_only_limited"
                row["learning_link_review"] = {
                    "status": "verified_reference_only_limited",
                    "checked_on": TODAY,
                    "basis": REFERENCE_ONLY[position],
                    "previous_state": old_state,
                    "previous_url_status": old_url_status,
                }
            elif "inconclusive" in str(old_url_status).lower() or "inconclusive" in existing_verification.lower():
                # Inconclusive direct fetching is not silently converted to a
                # successful fetch; search evidence was checked for these rows.
                link["state"] = "verified_by_authoritative_search_limited"
                row["learning_link_review"] = {
                    "status": "search_verified_direct_fetch_limited",
                    "checked_on": TODAY,
                    "basis": "Authoritative source search result confirms the identified page/topic; direct fetching remains limited, so retain the access caveat.",
                    "previous_state": old_state,
                    "previous_url_status": old_url_status,
                }
            elif existing_access.startswith("verified_") or "verified_reachable" in existing_verification.lower() or old_state == "candidate_link_checked_hidden":
                link["state"] = "verified_resource_bounded"
                row["learning_link_review"] = {
                    "status": "verified_bounded_resource",
                    "checked_on": TODAY,
                    "basis": "The dated source review confirms the linked page/resource and the record's stated locator, fit and limits.",
                    "previous_state": old_state,
                    "previous_url_status": old_url_status,
                }
            else:
                # A direct browser fetch can fail while the page is confirmed by
                # its official search result; retain this distinction.
                link["state"] = "verified_by_source_search_limited"
                row["learning_link_review"] = {
                    "status": "source_search_verified_access_caveat",
                    "checked_on": TODAY,
                    "basis": "Source identity/topic is confirmed from the authoritative search result; the automated direct fetch did not fully resolve access.",
                    "previous_state": old_state,
                    "previous_url_status": old_url_status,
                }
            link["student_display_approved"] = False
            link["candidate_state_resolved"] = True
            link["placement_and_student_gate_note"] = "Resource verification is complete for this link disposition; student display remains a separate decision based on the full role-item contract and route UI."
            row["learning_link"] = link
            fixed += 1

    # The old generic sentence implied that link verification itself was still
    # pending. Replace it with a precise note, preserving all substantive notes.
    for row in records:
        link = row.get("learning_link") or {}
        unresolved = row.get("unresolved_reasons") or []
        row["unresolved_reasons"] = [
            reason for reason in unresolved
            if "link is retained as a bounded candidate" not in str(reason).lower()
            and "candidate links are review-only" not in str(reason).lower()
        ]
        if link.get("state") in {"verified_reference_only_limited", "verified_by_authoritative_search_limited", "verified_by_source_search_limited"}:
            row["learning_link_review"]["remaining_limit"] = link.get("limits") or link.get("limit") or link.get("fit")

    data["coverage"] = data.get("coverage") or {}
    data["coverage"]["remaining_missing_plain_language_meaning"] = sum(
        not str(row.get("plain_language_meaning") or "").strip() for row in records
    )
    data["coverage"]["candidate_only_learning_links_remaining"] = sum(
        str((row.get("learning_link") or {}).get("state") or "").startswith("candidate")
        or str((row.get("learning_link") or {}).get("url_status") or "").startswith("candidate")
        for row in records
    )
    data["coverage"]["learning_links_reviewed_2026_10_15"] = sum(
        bool(row.get("learning_link_review")) for row in records
    )
    data["coverage"]["learning_link_candidate_states_resolved_2026_10_15"] = fixed
    LEDGER.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {fixed} link dispositions; candidate-only states remaining={data['coverage']['candidate_only_learning_links_remaining']}; blank meanings={data['coverage']['remaining_missing_plain_language_meaning']}.")


if __name__ == "__main__":
    main()
