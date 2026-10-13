"""Regression tests for fail-closed JAMB/CCMAS materialization."""

from __future__ import annotations

import json
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import _materialize_jamb_domain_map_from_canonical as materializer  # noqa: E402


def test_nursing_ccmas_excludes_same_code_courses_owned_by_other_programmes() -> None:
    career = HERE.parent
    source = json.loads(
        (career / "ccmas/allied_health.json").read_text(encoding="utf-8")
    )
    nursing = next(
        programme
        for programme in source["programmes"]
        if programme["name"] == "Nursing Sciences"
    )
    by_code: dict[str, list[str]] = {}
    for course in nursing["courses"]:
        if course.get("code") in {"NSC 201", "NSC 314"}:
            by_code.setdefault(course["code"], []).append(course["title"])

    assert by_code == {
        "NSC 201": ["Foundations of Professional Nursing Practice I"],
        "NSC 314": ["Mental Health and Psychiatric Nursing I"],
    }


def test_fwm_408_title_matches_its_nuc_forest_products_content() -> None:
    career = HERE.parent
    source = json.loads(
        (career / "ccmas/agricultural_science.json").read_text(encoding="utf-8")
    )
    programme = next(
        row
        for row in source["programmes"]
        if row["name"] == "Forest Resources and Wildlife Management"
    )
    course = next(row for row in programme["courses"] if row["code"] == "FWM 408")

    assert course["title"] == "Forest Products Harvesting, Processing and Utilization"
    assert "timber harvesting" in course["content_summary"]
    assert any("harvesting of forest products" in outcome for outcome in course["skills_learned"])


def test_mathematics_mth399_and_mth404_have_source_content_without_invented_outcomes() -> None:
    career = HERE.parent
    source = json.loads(
        (career / "ccmas/sciences.json").read_text(encoding="utf-8")
    )
    programme = next(
        row for row in source["programmes"] if row["name"] == "Mathematics"
    )
    courses = {row["code"]: row for row in programme["courses"]}

    for code in ("MTH 399", "MTH 404"):
        course = courses[code]
        assert course["content_summary"]
        assert course["skills_learned"] == []
        assert course["source_url"].endswith("Sciences-CCMAS-2023-FINAL.pdf")
        assert course["source_locator"]
        assert course["source_accessed_on"] == "2026-09-26"


def test_cybersecurity_course_extraction_matches_nuc_and_has_item_citations() -> None:
    career = HERE.parent
    document = json.loads((career / "ccmas/computing.json").read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p["name"] == "Cybersecurity")
    courses = {row["code"]: row for row in package["courses"]}
    cyb201, cyb498 = courses["CYB 201"], courses["CYB 498"]

    assert len(cyb201["skills_learned"]) == 6
    assert len(set(cyb201["skills_learned"])) == 6
    assert "pp. 69-70" in cyb201["source_locator"]
    assert len(cyb498["skills_learned"]) == 4
    assert all("understand the basic definition" not in text for text in cyb498["skills_learned"])
    assert "Continuation of CYB 497" in cyb498["content_summary"]
    assert "printed CCMAS pp. 85-86" in cyb498["source_locator"]
    for row in (cyb201, cyb498):
        assert row["source_url"].endswith("Computing-CCMAS-2023-FINAL.pdf")
        assert row["source_accessed_on"] == "2026-09-26"


def test_physiotherapy_pst421_has_complete_source_course_record() -> None:
    career = HERE.parent
    document = json.loads((career / "ccmas/allied_health.json").read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p["name"] == "Physiotherapy")
    course = next(row for row in package["courses"] if row["code"] == "PST 421")

    assert course["units"] == 2 and course["lh"] == 30 and course["ph"] == 0
    assert len(course["skills_learned"]) == 6
    assert course["skills_learned"][-1].endswith("course contents.")
    assert "Allied Health Sciences" not in course["content_summary"]
    assert "neurological assessment" in course["content_summary"]
    assert "printed pp. 619-620" in course["source_locator"]
    assert course["source_url"].endswith("Allied-Health-Sciences-2023.pdf")
    assert course["source_accessed_on"] == "2026-09-26"


def test_physiotherapy_pst423_has_no_page_header_and_source_load() -> None:
    career = HERE.parent
    document = json.loads((career / "ccmas/allied_health.json").read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p["name"] == "Physiotherapy")
    course = next(row for row in package["courses"] if row["code"] == "PST 423")

    assert course["units"] == 1 and course["status"] == "C"
    assert course["lh"] == 0 and course["ph"] == 45
    assert course["content_summary"].startswith("Seminar presentation on health care issues")
    assert "Allied Health Sciences" not in course["content_summary"]
    assert "public and private financing" in course["content_summary"]
    assert "printed p. 619" in course["source_locator"]


def test_film_fip211_has_three_source_outcomes_and_no_page_spill() -> None:
    career = HERE.parent
    document = json.loads((career / "ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p["name"] == "Film Production")
    course = next(row for row in package["courses"] if row["code"] == "FIP 211")

    assert course["units"] == 2 and course["status"] == "C"
    assert course["lh"] == 0 and course["ph"] == 90
    assert len(course["skills_learned"]) == 3
    assert len(set(course["skills_learned"])) == 3
    assert course["content_summary"].startswith("The class is split into groups")
    assert "New Arts" not in course["content_summary"]
    assert "printed pp. 254-255" in course["source_locator"]


def test_physiotherapy_excludes_speech_language_pst503_course() -> None:
    career = HERE.parent
    document = json.loads((career / "ccmas/allied_health.json").read_text(encoding="utf-8"))
    package = next(p for p in document["programmes"] if p["name"] == "Physiotherapy")
    assert not any(row["code"] == "PST 503" for row in package["courses"])


def test_common_islamic_law_overlay_excludes_unsupported_domain_claims() -> None:
    overlay_path = HERE / "ccmas_nigerian_reviewed_links_2026-09-01.json"
    overlay = json.loads(overlay_path.read_text(encoding="utf-8"))
    row = next(item for item in overlay["rows"] if item["jamb_name"] == "Common and Islamic Law")

    published = {
        link["domain_id"]
        for link in row["links"]
        if link.get("publish_in_reviewed_map")
    }
    assert published == {"D037"}
    for domain_id in ("D163", "D078", "D151", "D150"):
        link = next(item for item in row["links"] if item["domain_id"] == domain_id)
        assert link["publish_in_reviewed_map"] is False
        assert link["disposition"] == "removed_unsupported_candidate"
        assert link["reason"]


def test_accounting_and_finance_keeps_faculty_contexts_distinct_and_fail_closed() -> None:
    career = HERE.parent
    admin = json.loads(
        (career / "jamb/administration_offerings.json").read_text(encoding="utf-8")
    )
    social = json.loads(
        (career / "jamb/social_management_offerings.json").read_text(encoding="utf-8")
    )
    admin_row = next(
        row for row in admin["programmes"] if row["jamb_name"] == "Accounting and Finance"
    )
    social_row = next(
        row for row in social["programmes"] if row["jamb_name"] == "Accounting and Finance"
    )
    assert admin_row["institutions"] == ["BCU"]
    assert social_row["institutions"] == ["FEDOTUOKE"]

    inventory = json.loads(
        (HERE / "jamb_offering_context_inventory_2026-09-25.json").read_text(encoding="utf-8")
    )
    identity = next(
        row for row in inventory["identities"] if row["jamb_name"] == "Accounting and Finance"
    )
    assert identity["distinct_source_faculties"] == [
        "Administration",
        "Social/Management Sciences",
    ]

    active_map = json.loads(
        (career / "jamb_domain_map.json").read_text(encoding="utf-8")
    )
    mapped = active_map["Accounting and Finance"]
    assert mapped["mapping_status"] == "review_required"
    assert mapped["links"] == []


def test_family_consumer_sciences_fcs_431_is_the_verified_ccmas_course_not_a_placeholder() -> None:
    source = json.loads(
        (HERE.parent / "ccmas/agricultural_science.json").read_text(encoding="utf-8")
    )
    family_sciences = next(
        row for row in source["programmes"]
        if row["name"] == "Family and Consumer Sciences"
    )
    course = next(row for row in family_sciences["courses"] if row["code"] == "FCS 431")

    assert course["title"] == "Advanced Resource Management"
    assert course["units"] == 2
    assert course["lh"] == 30
    assert len(course["skills_learned"]) == 4
    assert "money, time, energy" in course["content_summary"]
    assert "NOT FOUND IN DOCUMENT" not in course["title"]


def test_demography_and_social_statistics_course_codes_titles_and_content_match_nuc_ccmas() -> None:
    source = json.loads(
        (HERE.parent / "ccmas/social_sciences.json").read_text(encoding="utf-8")
    )
    programme = next(
        row for row in source["programmes"]
        if row["name"] == "Demography and Social Statistics"
    )
    courses = {course["code"]: course for course in programme["courses"]}

    assert courses["DSS 101"]["title"] == "Introduction to Population Studies and Demography"
    assert courses["DSS 102"]["title"] == "Introduction to Demography and Social Statistics"
    assert courses["DSS 103"]["title"] == "Mathematics for Social Scientists I (Algebra and Trigonometry)"
    assert courses["DSS 104"]["title"] == "Mathematics for Social Scientists II (Vectors: Geometry and Dynamics)"
    for code in ("DSS 101", "DSS 102", "DSS 103", "DSS 104"):
        assert courses[code]["units"] == 2
        assert courses[code]["lh"] == 30
        assert courses[code]["content_summary"]
        assert courses[code]["source_url"].startswith("https://www.nuc.edu.ng/")
        assert "printed p." in courses[code]["source_locator"]
        assert courses[code]["source_accessed_on"] == "2026-09-26"

    assert "51" not in courses["DSS 103"]["skills_learned"]
    assert "Social Sciences" not in courses["DSS 103"]["skills_learned"]


def test_classics_missing_course_outcomes_and_truncated_content_are_restored_from_ccmas() -> None:
    source = json.loads(
        (HERE.parent / "ccmas/arts.json").read_text(encoding="utf-8")
    )
    classics = next(row for row in source["programmes"] if row["code"] == "CLG")
    courses = {row["code"]: row for row in classics["courses"]}

    assert courses["CLC 201"]["title"] == "Greek and Roman Epic Poetry, Homer, Vergil and Apollonius"
    assert courses["CLC 201"]["units"] == 2
    assert courses["CLC 201"]["lh"] == 30
    for code in ("CLC 201", "CLC 203", "CLC 204", "CLC 206"):
        assert courses[code]["skills_learned"]
    assert "technologies used to establish and grow an enterprise" in courses["CLC 206"]["content_summary"]
    assert not courses["CLC 206"]["content_summary"].endswith("emplo")


def test_political_science_defence_courses_have_only_their_verified_ccmas_evidence() -> None:
    source = json.loads(
        (HERE.parent / "ccmas/social_sciences.json").read_text(encoding="utf-8")
    )
    political_science = next(
        row for row in source["programmes"] if row["code"] == "POL"
    )
    courses = {row["code"]: row for row in political_science["courses"]}

    assert "development administration" not in " ".join(courses["POL 401"]["skills_learned"]).lower()
    assert "civilian control of the military" in " ".join(courses["POL 401"]["skills_learned"]).lower()
    assert "Historical background of development administration" not in courses["POL 401"]["content_summary"]
    assert courses["POL 403"]["skills_learned"]
    assert not courses["POL 403"]["content_summary"].endswith("---")

    development_studies = next(
        row for row in source["programmes"] if row["name"] == "Development Studies"
    )
    development_course = next(
        row for row in development_studies["courses"] if row["code"] == "POL 401"
    )
    assert development_course["title"] == "Development Administration"
    assert len(development_course["skills_learned"]) == 3
    assert "civil-military" not in development_course["content_summary"].lower()


def test_unverified_combined_scope_cannot_be_reopened_by_legacy_overlay() -> None:
    canonical = {
        "rows": [
            {
                "jamb_name": "Example blended programme",
                "component_refs": ["Arts::History", "Social Sciences::International Relations"],
                "inheritance_type": "combined_ccmas_curriculum",
                "mapping_status": "review_required",
                "status_reason": "Verify selected courses and offering-specific links.",
                "domain_links": [],
                "candidate_ccmas_domain_links": [{"domain_id": "D001"}],
                "curriculum_scope": {
                    "status": "combined_scope_review_required",
                    "approval": "pending_review",
                    "selected_course_count": 0,
                },
            }
        ]
    }
    review = {
        "rows": [
            {
                "jamb_name": "Example blended programme",
                "component_ref": "Arts::History",
                "status_before": "review_required",
                "links": [
                    {
                        "domain_id": "D001",
                        "publish_in_reviewed_map": True,
                        "disposition": "certified_nigerian_curriculum_link",
                    }
                ],
            }
        ]
    }

    output, counts = materializer.materialize_rows(canonical, review, {})

    row = output["Example blended programme"]
    assert row["mapping_status"] == "review_required"
    assert row["links"] == []
    assert counts["nigerian_review_rows"] == 0


def test_review_overlay_with_non_candidate_link_quarantines_the_whole_row() -> None:
    canonical = {
        "rows": [
            {
                "jamb_name": "Example Law programme",
                "component_refs": ["Law::Example Law"],
                "inheritance_type": "single_ccmas_full_curriculum",
                "mapping_status": "ready",
                "status_reason": "Full CCMAS match.",
                "domain_links": [{"domain_id": "D037", "match_type": "direct"}],
                "candidate_ccmas_domain_links": [{"domain_id": "D037", "match_type": "direct"}],
                "curriculum_scope": {"status": "full", "approval": "not_applicable"},
            }
        ]
    }
    review = {
        "rows": [
            {
                "jamb_name": "Example Law programme",
                "component_ref": "Law::Example Law",
                "status_before": "review_required",
                "links": [
                    {"domain_id": "D037", "publish_in_reviewed_map": True},
                    {
                        "domain_id": "D163",
                        "domain_name": "Intellectual Property Law, Patents",
                        "publish_in_reviewed_map": True,
                        "reviewed_match_type": "adjacent",
                        "disposition": "resolved_nigerian_bridge_link",
                        "nigerian_curriculum_courses": [
                            {
                                "code": "LAW 101",
                                "title": "English for Legal Writing",
                                "source_file": "law.json",
                                "source_locator": "law.json#course:LAW 101",
                            }
                        ],
                        "nigerian_professional_context": {
                            "source_ids": ["ip-context"],
                            "profiles": [
                                {
                                    "role_patterns": ["intellectual property consultant"],
                                    "source_records": [
                                        {
                                            "source_id": "ip-context",
                                            "name": "Official IP guidance",
                                            "urls": ["https://example.gov/ip"],
                                            "accessed_on": "2026-09-25",
                                        }
                                    ],
                                }
                            ],
                        },
                    },
                ],
            }
        ]
    }

    output, counts = materializer.materialize_rows(canonical, review, {})

    row = output["Example Law programme"]
    assert row["mapping_status"] == "review_required"
    assert row["links"] == []
    assert "absent from the canonical candidate set" in row["status_reason"]
    assert counts["nigerian_review_rows"] == 0
    assert counts["nigerian_review_conflict_rows"] == 1
    assert counts["nigerian_review_conflict_links"] == 1
    assert counts["nigerian_review_conflicts"] == [
        {
            "jamb_name": "Example Law programme",
            "component_ref": "Law::Example Law",
            "missing_domain_ids": ["D163"],
        }
    ]
    details = materializer.review_conflict_details(
        counts["nigerian_review_conflicts"],
        canonical,
        review,
        {"D163": {"domain_name": "Intellectual Property Law, Patents"}},
    )
    missing_link = details[0]["missing_links"][0]
    assert missing_link["domain_id"] == "D163"
    assert missing_link["curriculum_courses"][0]["code"] == "LAW 101"
    assert missing_link["destination_role_patterns"] == ["intellectual property consultant"]
    assert missing_link["destination_source_records"][0]["accessed_on"] == "2026-09-25"
