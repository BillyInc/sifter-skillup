import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCIENCES = ROOT / "_jamb_txt" / "Sciences.txt"
OFFERINGS = ROOT / "jamb" / "sciences_offerings.json"


def test_pure_applied_mathematics_locator_points_to_the_exact_jamb_awarder_cell():
    data = json.loads(OFFERINGS.read_text(encoding="utf-8"))
    row = next(p for p in data["programmes"] if p["jamb_name"] == "Pure and Applied Mathematics")
    assert row["institutions"] == ["BENIN", "LAUTECH", "PHC", "PAUL"]
    assert row["source_locator"] == "Sciences.txt:8004-8022 (exact programme cell and awarding-institution block)"

    lines = SCIENCES.read_text(encoding="cp1252").split(chr(10))
    cited = "\n".join(lines[8003:8022])
    assert "PURE AND APPLIED" in cited
    assert "MATHEMATICS" in cited
    for institution in ("BENIN", "LAUTECH", "PHC", "PAUL"):
        assert institution in cited


def test_official_jamb_index_name_is_not_mistaken_for_an_awarder_cell():
    text = SCIENCES.read_text(encoding="utf-8", errors="replace")
    index_lines = [line for line in text.splitlines() if "Pure/Applied Mathematics" in line]
    assert len(index_lines) == 1
    assert "132" in index_lines[0]
    assert "BENIN" not in index_lines[0] and "LAUTECH" not in index_lines[0]


def test_checkpoint_026_supersedes_the_false_locator_defect_from_checkpoint_021():
    correction = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_026.json").read_text(encoding="utf-8")
    )
    assert correction["source_observations"][0]["disposition"] == "confirmed_match_exact_cell"
    assert "checkpoint 021" in correction["source_observations"][0]["note"].lower()
