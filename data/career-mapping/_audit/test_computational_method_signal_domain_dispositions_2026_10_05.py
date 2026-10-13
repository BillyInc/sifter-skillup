import json
import subprocess
import sys
from pathlib import Path


HERE = Path(__file__).parent
OUTPUT = HERE / "computational_method_signal_domain_dispositions_2026_10_05.json"


def test_all_73_method_signal_domains_have_case_dispositions_and_exact_partition():
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    counts = data["counts"]
    assert counts["method_task_signal_domains_classified"] == 73
    assert counts["declared_layer_with_direct_scope_evidence"] == 21
    assert counts["declared_layer_but_only_role_task_signals"] == 10
    assert counts["no_declared_layer_and_only_role_task_signals"] == 42
    assert sum(counts["classification_counts"].values()) == 73
    assert len({row["domain_id"] for row in data["domains"]}) == 73


def test_role_task_evidence_has_sources_or_explicit_unmatched_disposition():
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    unmatched = {
        (row["domain_id"], row["role_title"])
        for row in data["unmatched_role_task_titles"]
    }
    assert unmatched == {
        ("D139", "gameplay programmer"),
        ("D139", "technical artist"),
        ("D139", "game environment artist"),
    }
    for domain in data["domains"]:
        for task in domain["role_task_evidence"]:
            matched = task["matched_role_source_records"]
            assert bool(matched) == ((domain["domain_id"], task["role_title_from_task_signal"]) not in unmatched)
            assert task["role_fit_inferred"] is False
            assert all(
                row["matched_title_basis"] in {"canonical_title", "explicit_also_known_as"}
                for row in matched
            )


def test_explicit_robotics_engineer_alias_matches_mechatronics_record_without_fit_inference():
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    d140 = next(row for row in data["domains"] if row["domain_id"] == "D140")
    task = next(row for row in d140["role_task_evidence"] if row["role_title_from_task_signal"] == "robotics engineer")
    assert len(task["matched_role_source_records"]) == 1
    match = task["matched_role_source_records"][0]
    assert match["role_name"] == "mechatronics engineer"
    assert match["matched_title_basis"] == "explicit_also_known_as"
    assert task["role_fit_inferred"] is False


def test_computational_disposition_does_not_write_canonical_taxonomy_or_roles():
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    assert data["canonical_taxonomy_written"] is False
    assert all(row["canonical_taxonomy_change"] is False for row in data["domains"])
    assert all(row["role_domain_or_role_specialization_change"] == "not_assessed_in_this_lane" for row in data["domains"])
