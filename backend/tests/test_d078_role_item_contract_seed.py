import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "data/career-mapping/_build_d078_role_item_contract_seed_2026_10_15.py"
SPEC = importlib.util.spec_from_file_location("d078_role_contract_seed", SCRIPT)
SEED = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(SEED)


def test_all_173_role_contracts_are_persisted_with_explicit_disposition_and_owners():
    rows = SEED.records()
    assert len(rows) == 173
    assert sum(row["approval_status"] == "approved" for row, _ in rows) == 171
    assert sum(row["approval_status"] == "unapproved" for row, _ in rows) == 2
    assert sum(len(owners) for _, owners in rows) == 224
    assert sum(not owners for _, owners in rows) == 5
    assert {row["queue_position"] for row, owners in rows if not owners} == {55, 81, 116, 142, 160}
    assert all(row.get("task_output") and row.get("evidence") and row.get("learning_link") for row, _ in rows)
    assert all(row.get("plain_language_meaning", "").strip() for row, _ in rows)
    assert all(row.get("learning_link_review") for row, _ in rows)
    assert all(not str((row.get("learning_link") or {}).get("state", "")).startswith("candidate") for row, _ in rows)
    assert all(not str((row.get("learning_link") or {}).get("url_status", "")).startswith("candidate") for row, _ in rows)


def test_generated_seed_preserves_contract_and_marks_only_eligible_role_cards():
    sql = SEED.build()
    assert "INSERT INTO skillup_dev.d078_role_item_contracts" in sql
    assert "student_display_approved" in sql
    rows = SEED.records()
    eligible = [(row, owners) for row, owners in rows if SEED.student_display_gate(row, owners)[0]]
    assert len(eligible) == 166
    assert sum(not SEED.student_display_gate(row, owners)[0] for row, owners in rows) == 7
    assert "approved_role_card_eligible" in sql
    assert "no_current_role_owner" in sql
    assert "no_supported_d078_learning_route" in sql
    assert "EXCLUDED.student_display_approved" in sql
    assert "staff/backend-only under RLS" in sql
    assert "contract_payload" in sql
    assert "valid_alternatives" in sql
    assert "learning_link" in sql
    assert "learning_link_review" in sql
    assert "role_owner_keys" in sql
    assert "ON CONFLICT (queue_position) DO UPDATE" in sql


def test_generated_seed_projects_approved_role_cards_to_student_context_catalogue():
    sql = SEED.build()
    cards = SEED._role_context_cards()
    assert len(cards) == 202
    assert len({(card["contextKey"], card["itemType"], card["itemKey"]) for card in cards}) == 202
    assert all(card["contextLevel"] == "role" for card in cards)
    assert all(card["guidanceOwner"] == "role" for card in cards)
    assert all(card["claimReviewState"] == "approved" for card in cards)
    assert all(card["linkState"] == "linked" for card in cards)
    assert all(card["linkUrl"].startswith("https://") for card in cards)
    assert all(card["programmeContext"] and card["domainContext"] and card["areaContext"] and card["roleContext"] for card in cards)
    assert all(card["plainMeaning"] and card["contextualUse"] and card["expectedOutput"] for card in cards)
    assert "INSERT INTO skillup_dev.career_context_items" in sql
    assert "studentDisplayContract" in sql
    assert "career_context_items is the student read surface" in sql


def test_contract_payload_retains_all_record_fields_without_losing_unapproved_reasons():
    rows = SEED.records()
    assert all("original_unresolved_reasons" in row for row, _ in rows)
    assert all("remaining_review_notes" in row for row, _ in rows)
    assert sum(SEED.student_display_gate(row, owners)[0] for row, owners in rows) == 166
    assert all(SEED.student_display_gate(row, owners)[0] is False for row, owners in rows if row["queue_position"] in {55, 81, 103, 116, 142, 153, 160})
    eligible_row = next(row for row, owners in rows if SEED.student_display_gate(row, owners)[0]).copy()
    eligible_row["student_display_approved"] = False  # simulate stale historical gate
    eligible_row["student_visibility"] = "review_required"
    payload = SEED.current_contract_payload(eligible_row, True, "approved_role_card_eligible")
    assert payload["student_display_approved"] is True
    assert payload["historical_gate_values"]["student_display_approved"] is False
    assert payload["historical_gate_values"]["role_task_relationship_verified"] is False
    assert "role_task_relationship_verified" not in payload
    assert payload["historical_gate_values_are_audit_only"] is True
    assert payload["student_display_eligibility_basis"]["current_routed_role_owner"] is True


def test_rebuilt_graph_uses_current_master_dispositions_without_global_release():
    graph_path = ROOT / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
    graph = json.loads(graph_path.read_text(encoding="utf-8-sig"))
    graph_nodes = {
        int(node["queue_position"]): node
        for node in graph["nodes"]
        if node.get("kind") == "role_item_candidate"
    }
    rows = SEED.records()
    assert set(graph_nodes) == {row["queue_position"] for row, _ in rows}
    for row, owners in rows:
        node = graph_nodes[row["queue_position"]]
        eligible, reason = SEED.student_display_gate(row, owners)
        assert node["approval_status"] == row["approval_status"]
        assert node["student_display_approved"] is eligible
        assert node["student_display_eligibility_reason"] == reason
        assert node["student_visible"] is False  # per-item eligibility is not global release
        assert "role_task_relationship_verified" not in node["role_item_reconciliation"]
        assert node["role_item_reconciliation"]["historical_gate_values"]["role_task_relationship_verified"] is False

    assert graph["validation"]["approved_role_item_records"] == 171
    assert graph["validation"]["hidden_role_item_records_excluded"] == 2
    assert graph["validation"]["role_item_current_card_eligible_records"] == 166
    assert graph["validation"]["reconciled_role_item_owner_edges"] == 224
    assert graph["validation"]["role_item_owner_edges_match_current_master"] is True
    assert graph["validation"]["historical_role_item_gate_flags_are_non_blocking_audit_only"] is True
    assert graph["student_visible"] is False
