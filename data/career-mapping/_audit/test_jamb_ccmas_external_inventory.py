from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SPEC = spec_from_file_location(
    "external_inventory_builder",
    ROOT / "build_jamb_ccmas_external_audit_inventory_2026_09_26.py",
)
MODULE = module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


def test_explicit_custom_component_is_retained_without_selected_courses():
    custom, refs = MODULE.external_or_unanchored_parts(
        {
            "component_refs": [
                "Social Sciences::Sociology",
                "__custom__::Anthropology",
            ],
            "selected_courses": [],
        }
    )

    assert custom == []
    assert refs == ["__custom__::Anthropology"]


def test_missing_component_reference_is_unanchored_even_without_courses():
    custom, refs = MODULE.external_or_unanchored_parts(
        {"component_refs": [], "selected_courses": []}
    )

    assert custom == []
    assert refs == []
