"""Regression coverage for verified named-component scope gaps."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NAME = "COMPUTER SCIENCE WITH ECONOMICS"


def test_computer_science_with_economics_is_not_published_from_cs_only_scope() -> None:
    scopes = json.loads(
        (ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )
    scope = next(row for row in scopes["rows"] if row["jamb_name"] == NAME)

    assert scope["component_refs"] == [
        "Computing::Computer Science",
        "Social Sciences::Economics",
    ]
    assert len(scope["selected_courses"]) == 76
    assert sum(
        row.get("source_ccmas_programme") == "Computer Science"
        for row in scope["selected_courses"]
    ) == 38
    assert sum(
        row.get("source_ccmas_programme") == "Economics"
        for row in scope["selected_courses"]
    ) == 38
    assert all(
        all(row.get(field) for field in ("source_url", "source_locator", "source_accessed_on"))
        for row in scope["selected_courses"]
    )
    assert scope["scope_status"] == "combined_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
    assert "Economics" in scope["scope_reason"]

    active = json.loads((ROOT / "jamb_domain_map.json").read_text(encoding="utf-8"))
    assert active[NAME]["mapping_status"] == "review_required"
    assert active[NAME]["links"] == []


def test_selected_ccmas_scope_carries_source_units_status_and_contact_hours() -> None:
    career = ROOT
    scopes = json.loads(
        (ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )
    scope = next(row for row in scopes["rows"] if row["jamb_name"] == NAME)
    sources = {
        "Computer Science": json.loads(
            (career / "ccmas/computing.json").read_text(encoding="utf-8")
        ),
        "Economics": json.loads(
            (career / "ccmas/social_sciences.json").read_text(encoding="utf-8")
        ),
    }
    packages = {
        name: next(p for p in document["programmes"] if p["name"] == name)
        for name, document in sources.items()
    }
    source_courses = {
        (programme, course["code"], course["title"]): course
        for programme, package in packages.items()
        for course in package["courses"]
    }

    for course in scope["selected_courses"]:
        source = source_courses[
            (
                course["source_ccmas_programme"],
                course["code"],
                course["title"],
            )
        ]
        assert course["units"] == source.get("units")
        assert course["status"] == source.get("status")
        assert course["lecture_hours"] == source.get("lh")
        assert course["practical_hours"] == source.get("ph")


def test_french_uses_the_exact_arts_ccmas_package_not_legacy_custom_rows() -> None:
    scopes = json.loads(
        (ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )
    scope = next(row for row in scopes["rows"] if row["jamb_name"] == "French")

    assert scope["component_refs"] == ["Arts::Modern European Languages B.A (French)"]
    assert scope["scope_selection_method"] == "manual_ccmas_course_outcome_scope"
    assert len(scope["selected_courses"]) == 40
    assert {row["source_ccmas_programme"] for row in scope["selected_courses"]} == {
        "Modern European Languages B.A (French)"
    }
    assert scope["scope_status"] == "full_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
