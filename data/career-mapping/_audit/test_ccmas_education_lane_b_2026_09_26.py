import json
from pathlib import Path

from repair_ccmas_education_lane_b_2026_09_26 import SOURCE_PATH, SOURCE_URL, validate


def test_education_lane_b_repaired_records():
    document = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    validate(document)
    assert all(
        item.get("source_url") == SOURCE_URL
        for item in _find(document, {"LIS 215", "LIS 216", "LIS 222", "SED 101"})
    )


def _find(value, codes):
    found = []
    if isinstance(value, dict):
        if value.get("code") in codes:
            found.append(value)
        for child in value.values():
            found.extend(_find(child, codes))
    elif isinstance(value, list):
        for child in value:
            found.extend(_find(child, codes))
    return found
