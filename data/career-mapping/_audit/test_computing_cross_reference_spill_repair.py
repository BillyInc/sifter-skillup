import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_cross_reference_markers_are_not_published_as_course_content():
    document = json.loads((ROOT / "ccmas" / "computing.json").read_text(encoding="utf-8"))
    targets = {
        ("Data Science", "DTS 498"),
        ("Information and Communication Technology", "CSC 432"),
    }
    found = set()
    for programme in document["programmes"]:
        for course in programme["courses"]:
            if (programme["name"], course["code"]) in targets:
                found.add((programme["name"], course["code"]))
                assert "[SEE CS" not in (course.get("content_summary") or "")
                assert course["source_url"].startswith("https://www.nuc.edu.ng/")
                assert course["source_accessed_on"] == "2026-09-26"
    assert found == targets
