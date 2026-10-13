import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_domain_map_scope_preserves_canonical_course_scope_and_review_qualifications():
    domain_map = json.loads((ROOT / "jamb_domain_map.json").read_text(encoding="utf-8"))
    canonical = json.loads((ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json").read_text(encoding="utf-8"))
    canonical_by_name = {row["jamb_name"]: row for row in canonical["rows"]}
    assert len(domain_map) == 420
    assert set(domain_map) == set(canonical_by_name)
    for name, row in domain_map.items():
        expected = canonical_by_name[name]
        assert row["ccmas_components"] == expected["component_refs"]
        assert row["inheritance_type"] == expected["inheritance_type"]
        actual_scope = row["curriculum_scope"]
        canonical_scope = expected["curriculum_scope"]
        # Later source review may add explanatory notes/facet qualifications
        # without changing the selected CCMAS course set. Keep the canonical
        # course identity and status fields exact; do not discard those
        # source-specific review additions just to satisfy this older fixture.
        review_extensions = {
            "note",
            "facet_qualifications",
            "external_component_qualifications",
        }
        for key, value in canonical_scope.items():
            if key not in review_extensions:
                assert actual_scope.get(key) == value
        assert set(actual_scope.get("selected_course_codes") or []) == set(
            canonical_scope.get("selected_course_codes") or []
        )
