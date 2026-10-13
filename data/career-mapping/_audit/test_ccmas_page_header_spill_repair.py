import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_page_header_repair_log_is_narrow_and_deferred_rows_remain_explicit():
    log = json.loads(
        (ROOT / "_audit" / "ccmas_page_header_spill_repair_2026-09-26.json").read_text(
            encoding="utf-8"
        )
    )

    assert log["changed_count"] == 41
    assert set(log["deferred_codes"]) == {
        "DTH 527",
        "OCT 525",
        "OPT 203",
        "OPT 698",
        "POT 317",
        "CHM 107",
    }


def test_repaired_content_no_longer_contains_the_document_header_marker():
    log = json.loads(
        (ROOT / "_audit" / "ccmas_page_header_spill_repair_2026-09-26.json").read_text(
            encoding="utf-8"
        )
    )
    for item in log["changed"]:
        document = json.loads(
            (ROOT / "ccmas" / item["source_file"]).read_text(encoding="utf-8")
        )
        programme = next(p for p in document["programmes"] if p["name"] == item["programme"])
        course = next(c for c in programme["courses"] if c["code"] == item["code"])
        assert " New" not in (course.get("content_summary") or "")
        assert course["source_url"].startswith("https://www.nuc.edu.ng/")
        assert course["source_accessed_on"] == "2026-09-26"
