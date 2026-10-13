import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from repair_ccmas_get204_shared_content_2026_09_29 import EXPECTED_TITLE, NEW_SUMMARY, SOURCE_URL


ROOT = Path(__file__).resolve().parents[1]
ENGINEERING = ROOT / "ccmas" / "engineering.json"


def _get204_rows():
    data = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    return [
        (programme["name"], course)
        for programme in data["programmes"]
        for course in programme["courses"]
        if course.get("code") == "GET 204"
    ]


def test_all_shared_get204_rows_have_full_content_and_exact_source_locator():
    rows = _get204_rows()
    assert len(rows) == 32
    for programme_name, course in rows:
        assert course["title"] == EXPECTED_TITLE, programme_name
        assert (course["units"], course["status"], course["lh"], course["ph"]) == _EXPECTED_SCHEDULES.get(
            programme_name, (2, "C", 15, 45)
        )
        assert course["content_summary"] == NEW_SUMMARY
        assert len(course["content_summary"]) > 400
        assert all(topic in course["content_summary"] for topic in ("foundry and casting", "heat treatment", "CNC", "energy conservation"))
        assert course["source_url"] == SOURCE_URL
        assert "printed pp. 1173-1174" in course["source_locator"]
        assert "corrected" in course["source_locator"]
        assert "metadata is preserved unchanged" in course["source_locator"]
        assert "six learning outcomes" in course["source_locator"]
        assert course["source_accessed_on"] == "2026-09-29"


_EXPECTED_SCHEDULES = {
    "CHEMICAL ENGINEERING": (2, "C", 90, None),
    "ELECTRICAL ENGINEERING": (2, "E", 15, 45),
    "FOOD ENGINEERING": (2, "C", None, 90),
    "MECHATRONICS ENGINEERING": (2, "C", 45, None),
    "MATERIALS ENGINEERING": (2, "C", 30, 45),
    "RAILWAY ENGINEERING": (2, "C", None, 45),
}


def test_get204_outcomes_are_preserved_across_all_shared_copies():
    rows = _get204_rows()
    assert len({tuple(course["skills_learned"]) for _, course in rows}) == 1
    assert len(rows[0][1]["skills_learned"]) == 6
