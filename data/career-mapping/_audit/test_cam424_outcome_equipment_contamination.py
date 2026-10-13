import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_cam424_contains_only_the_two_source_learning_outcomes():
    document = json.loads((ROOT / "ccmas" / "allied_health.json").read_text(encoding="utf-8"))
    programme = next(p for p in document["programmes"] if p["name"] == "Complementary and Alternative Medicine")
    course = next(c for c in programme["courses"] if c["code"] == "CAM 424")

    assert len(course["skills_learned"]) == 2
    assert "Microscopes" not in course["skills_learned"]
    assert course["source_accessed_on"] == "2026-09-26"
