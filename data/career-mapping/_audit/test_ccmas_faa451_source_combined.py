import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = Path(__file__).with_name("repair_ccmas_faa451_source_combined_2026_09_26.py")
spec = importlib.util.spec_from_file_location("repair_ccmas_faa451", SCRIPT)
repair = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(repair)


def test_faa451_preserves_combined_source_header_and_exact_four_outcomes():
    document = json.loads((ROOT / "ccmas" / "environmental_sciences.json").read_text(encoding="utf-8"))
    course = repair.find_course(document)
    repair.validate_course(course)
    assert len(course["skills_learned"]) == 4
    assert not any("art education" in outcome.lower() for outcome in course["skills_learned"])


def test_faa451_repair_is_bounded_to_the_combined_course_block():
    document = json.loads((ROOT / "ccmas" / "environmental_sciences.json").read_text(encoding="utf-8"))
    course = repair.find_course(document)
    assert course["title"] == "and FAA 442: Draughtsmanship"
    assert course["source_aliases"] == ["FAA 442"]
    assert "removed appended FAE 311 and FAE 321 outcomes" in course["source_locator"]
    assert course["content_summary"].startswith("This course is a continuation in the rendering of forms")
