import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"


def test_lane_2_german_package_checkpoint_matches_current_local_source():
    source = json.loads((ROOT / "data/career-mapping/ccmas/arts.json").read_text(encoding="utf-8"))
    package = next(p for p in source["programmes"] if p["name"] == "Modern European Languages B.A (German)")
    levels = Counter(str(c["level"]) for c in package["courses"])
    by_code = {c["code"]: c for c in package["courses"]}

    assert len(package["courses"]) == 41
    assert levels == {"100": 10, "200": 14, "300": 11, "400": 6}
    assert by_code["GST 112"]["title"] == "Nigerian Peoples and Cultures"
    assert "GER 407" not in by_code
    # The 2026-09-28 local repair pass has since restored source-backed
    # summaries. Keep this historical checkpoint test aligned with current
    # truth while preserving that GER 407 is still absent pending repair.
    assert by_code["GER 101"]["content_summary"]
    assert by_code["GER 103"]["content_summary"]


def test_lane_2_checkpoint_records_source_conflicts_without_silent_repair():
    historical = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_003.json").read_text(encoding="utf-8")
    )
    current = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_005.json").read_text(encoding="utf-8")
    )
    assert historical["scope"]["ccmas_package_index"] == 80
    assert historical["progress"]["package_fully_audited"] is False
    assert "jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_003.json" in current["corrects_and_supersedes"]
    assert current["progress"]["confirmed_defects_package_080"] == 5
    assert current["progress"]["source_conflicts_package_080"] == 5
    dispositions = current["final_disposition_for_package_080"]
    gst112 = next(x for x in dispositions["source_conflicts"] if x["id"] == "L2-P080-C-001")
    assert gst112["local"] == "GST 112"
    assert "local matches the detailed course block" in gst112["disposition"]
    ger407 = next(x for x in dispositions["confirmed_defects"] if x["id"] == "L2-P080-D-005")
    assert ger407["course"].startswith("GER 407")
