import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import reconcile_jamb_ccmas_domain_mapping_2026_09_29 as reconciliation  # noqa: E402


def test_component_and_selected_course_mismatch_is_reported():
    discovery = {
        "programme_mapping": {"X": {"jamb_name": "X", "mapping_type": "B_granular", "ccmas_code": "ACC"}},
    }
    assert reconciliation.norm("  Financial   Accounting ") == "financial accounting"
    assert reconciliation.code_norm("acc 101") == "ACC 101"


def test_course_signature_uses_source_field_names():
    source = {"title": "Taxation I", "units": 3, "status": "C", "lh": 30, "ph": 45, "content_summary": "Tax", "learning_outcomes": ["Explain"]}
    selected = {"title": "Taxation I", "units": 3, "status": "C", "lecture_hours": 30, "practical_hours": 45, "content_summary": "Tax", "learning_outcomes": ["Explain"]}
    assert reconciliation.course_signature(source) == reconciliation.selected_course_signature(selected)


def test_custom_component_requires_complete_item_source_triple():
    scope = {
        "selected_courses": [
            {
                "code": "ANT 101",
                "source_kind": "external_curriculum",
                "source_url": "https://example.test/anthropology",
                "source_locator": "Anthropology course list â†’ ANT 101",
                "source_accessed_on": "2026-09-29",
            }
        ]
    }
    evidence = reconciliation.custom_component_source_evidence(scope, ["__custom__::Anthropology"])
    assert evidence is not None
    assert evidence["selected_course_count"] == 1

    scope["selected_courses"][0]["source_locator"] = ""
    assert reconciliation.custom_component_source_evidence(scope, ["__custom__::Anthropology"]) is None
