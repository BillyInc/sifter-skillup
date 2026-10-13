import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from _build_jamb_curriculum_scopes import external_registry, resolve_full_component_courses, source_registry, supported_links
from reconcile_jamb_ccmas_domain_mapping_2026_09_29 import custom_component_source_evidence


def _anchor(code: str, title: str) -> dict:
    return {"code": code, "title": title, "course_identity": f"{code}::{title}", "matched_anchors": []}


def test_direct_link_requires_two_distinct_scoped_course_anchors():
    parent = {"component": {"links": [{"domain_id": "D001", "match_type": "direct"}]}}
    evidence = {
        "component::D001": {
            "review_required": False,
            "course_anchors": [
                {**_anchor("CSC 101", "Programming I"), "matched_anchors": ["algorithms", "software architecture"]},
                {**_anchor("CSC 201", "Programming II"), "matched_anchors": ["algorithms", "software architecture"]},
            ],
            "transferable_evidence": [],
        }
    }
    one = [{"code": "CSC 101", "title": "Programming I"}]
    two = one + [{"code": "CSC 201", "title": "Programming II"}]

    assert supported_links("component", one, parent, evidence) == []
    result = supported_links("component", two, parent, evidence)
    assert len(result) == 1
    assert result[0]["scope_anchor_gate"]["distinct_source_course_anchors"] == 2
    assert result[0]["scope_anchor_gate"]["repeated_specific_anchor_families"] == ["algorithms", "softwarearchitecture"]


def test_two_generic_course_matches_do_not_qualify_a_direct_link():
    parent = {"component": {"links": [{"domain_id": "D001", "match_type": "direct"}]}}
    evidence = {
        "component::D001": {
            "review_required": False,
            "course_anchors": [
                {**_anchor("GEN 101", "Introduction I"), "matched_anchors": ["management", "development"]},
                {**_anchor("GEN 201", "Introduction II"), "matched_anchors": ["management", "development"]},
            ],
            "transferable_evidence": [],
        }
    }
    selected = [
        {"code": "GEN 101", "title": "Introduction I"},
        {"code": "GEN 201", "title": "Introduction II"},
    ]

    assert supported_links("component", selected, parent, evidence) == []


def test_adjacent_link_requires_scoped_transferable_evidence():
    parent = {"component": {"links": [{"domain_id": "D002", "match_type": "adjacent"}]}}
    evidence = {
        "component::D002": {
            "review_required": False,
            "course_anchors": [{**_anchor("CSC 101", "Programming I"), "matched_anchors": ["algorithms"]}],
            "transferable_evidence": [{"course_identity": "CSC 201::Research Methods"}],
        }
    }
    selected_without_transfer = [{"code": "CSC 101", "title": "Programming I"}]
    selected_with_transfer = selected_without_transfer + [{"code": "CSC 201", "title": "Research Methods"}]

    assert supported_links("component", selected_without_transfer, parent, evidence) == []
    result = supported_links("component", selected_with_transfer, parent, evidence)
    assert len(result) == 1
    assert result[0]["scope_anchor_gate"]["transferable_evidence_anchors"] == 1


def test_declared_repo_external_components_resolve_from_bundles_and_ccmas_sources():
    programmes = source_registry()
    externals = external_registry()
    for name in (
        "Intelligence and Security Studies",
        "Social Justice",
        "Anthropology",
        "Portuguese",
        "Sport Science",
        "Sport Management (Education)",
    ):
        courses, result = resolve_full_component_courses(
            f"__custom__::{name}", programmes, externals
        )
        assert result["status"] == "resolved", (name, result)
        assert courses, name
        assert result.get("source_evidence"), name
    intelligence, _ = resolve_full_component_courses(
        "__custom__::Intelligence and Security Studies", programmes, externals
    )
    assert all(course.get("source_ccmas_file") for course in intelligence)
    assert all(course.get("content_summary") or course.get("skills_learned") for course in intelligence)


def test_custom_component_source_is_recorded_once_at_component_level():
    scope = {
        "selected_courses": [{"code": "PRT 101", "title": "Portuguese I"}],
        "source_context": {"components": [{
            "component_ref": "__custom__::Portuguese",
            "status": "resolved",
            "source_evidence": [{"url": "https://example.org/curriculum.pdf", "role": "programme curriculum"}],
        }]},
    }
    result = custom_component_source_evidence(scope, ["__custom__::Portuguese"])
    assert result is not None
    assert result["selected_course_count"] == 1
