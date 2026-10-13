import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_011_physio_pst313_contexts.json"
CCMAS = ROOT / "data/career-mapping/ccmas/allied_health.json"


def test_pst313_course_contexts_are_not_collapsed_by_code():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["package_index"] == 38
    assert evidence["scope"]["local_package"] == "Physiotherapy"
    contexts = {row["programme_owner"]: row for row in evidence["source_contexts"]}
    assert set(contexts) == {
        "B.Aud Audiology",
        "DPT Physiotherapy",
        "B.SLT Speech-Language Therapy",
    }
    assert contexts["B.Aud Audiology"]["source_global_table"]["units"] == 1
    assert contexts["DPT Physiotherapy"]["source_global_table"]["units"] == 2
    assert contexts["B.SLT Speech-Language Therapy"]["source_global_table"]["units"] == 2


def test_local_physio_pst313_rows_match_their_separate_source_contexts():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    programmes = json.loads(CCMAS.read_text(encoding="utf-8"))["programmes"]
    physio = next(row for row in programmes if row["name"] == "Physiotherapy")
    rows = [row for row in physio["courses"] if row.get("code") == "PST 313"]
    assert len(rows) == 3
    by_title = {row["title"]: row for row in rows}
    for context in evidence["source_contexts"]:
        local = context["local_row_in_physio_package"]
        row = by_title[local["title"]]
        assert row["units"] == local["units"]
        assert row["status"] == local["status"]
        assert row["lh"] == local["lecture_hours"]
        assert row["ph"] == local["practical_hours"]
        assert len(row["skills_learned"]) == local["outcome_count"]
        assert len(row["content_summary"]) == local["summary_length"] == 400


def test_dpt_row_is_distinguished_from_two_wrong_owner_rows_and_conflict_retained():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    contexts = {row["programme_owner"]: row for row in evidence["source_contexts"]}
    assert contexts["DPT Physiotherapy"]["disposition"] == "source_conflict"
    assert contexts["DPT Physiotherapy"]["local_row_in_physio_package"]["title"].endswith("Currents II")
    assert contexts["B.Aud Audiology"]["disposition"] == "confirmed_defect"
    assert contexts["B.SLT Speech-Language Therapy"]["disposition"] == "confirmed_defect"
    assert evidence["package_status"]["completion_credit"] is False
    assert evidence["product_data_edited"] is False
