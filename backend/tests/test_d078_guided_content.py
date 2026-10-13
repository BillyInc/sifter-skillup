import json
from pathlib import Path

from d078_guided_content import (
    d078_area_context_items,
    d078_domain_context_items,
    d078_guided_content,
    merge_d078_context_items,
)


def test_only_explicitly_dispositioned_d078_items_enter_runtime():
    data = d078_guided_content()
    assert data["approvedCount"] == 190
    assert len(data["domainItems"]) == 52
    assert sum(map(len, data["areaItems"].values())) == 138
    assert set(data["areaItems"]) == {
        "D078:human-geography-population",
        "D078:social-research-evaluation",
        "D078:computational-digital-social-science",
        "D078:economics-applied-analysis",
        "D078:sociology-social-anthropology",
        "D078:politics-governance-public-policy",
        "D078:psychology-social-behaviour",
    }
    assert all(item["claimReviewState"] == "approved" for item in data["domainItems"])
    assert all(item["claimReviewState"] == "approved" for rows in data["areaItems"].values() for item in rows)
    assert all(item["guidanceOwner"] == item["contextLevel"] for item in data["domainItems"])
    assert all(item["guidanceOwner"] == item["contextLevel"] for rows in data["areaItems"].values() for item in rows)


def test_each_promoted_item_has_source_claims_and_a_learning_destination():
    data = d078_guided_content()
    items = data["domainItems"] + [item for rows in data["areaItems"].values() for item in rows]
    required_claims = {"item_identity", "checkpoint_fit", "plain_meaning", "contextual_use"}
    for item in items:
        assert item["dataState"] == "source_backed"
        assert item["linkState"] == "linked"
        assert item["linkUrl"].startswith("https://")
        assert item["linkTitle"]
        assert item["linkEvidence"].get("locator")
        assert item["linkAccessedAt"]
        assert (item.get("linkSourceReference") or {}).get("source_id") or (item.get("linkSourceReference") or {}).get("id")
        assert (item.get("linkSourceReference") or {}).get("url", "").startswith("https://")
        assert (item.get("linkSourceReference") or {}).get("locator")
        assert item["linkAccess"]
        assert item["requirementReason"]
        assert item["plainMeaning"]
        assert item["contextualUse"]
        assert item["guidanceOwner"] == item["contextLevel"]
        assert item["sourceReferences"]
        assert item["sourceLocators"]
        assert all(isinstance(locator, dict) for locator in item["sourceLocators"])
        claims = item["claimEvidence"]["claims"]
        assert required_claims <= claims.keys()
        assert all(claims[key]["source_references"] and claims[key]["source_locators"] for key in required_claims)
        source_ids = {ref.get("id") for ref in item["sourceReferences"]}
        source_ids.update(locator.get("sourceId") for locator in item["sourceLocators"] if locator.get("sourceId"))
        link_source_id = (item.get("linkSourceReference") or {}).get("id") or (item.get("linkSourceReference") or {}).get("source_id")
        if link_source_id:
            source_ids.add(link_source_id)
        assert source_ids
        assert all(locator.get("sourceId") and locator.get("url", "").startswith("https://") for locator in item["sourceLocators"])
        if item["expectedOutput"]:
            assert claims["expected_output"]["source_references"]
            assert claims["expected_output"]["source_locators"]
        else:
            assert item["evidenceLimitations"]
        assert item["prerequisites"] == []  # no plain-text audit note is an approved dependency


def test_guidance_items_are_an_explicit_scoped_tranche_not_whole_graph_approval():
    data = d078_guided_content()
    assert data["approvedCount"] == 190
    assert len(data["domainItems"]) == 52
    assert sum(len(rows) for rows in data["areaItems"].values()) == 138
    assert set(data["areaItems"]) == {
        "D078:human-geography-population",
        "D078:social-research-evaluation",
        "D078:computational-digital-social-science",
        "D078:economics-applied-analysis",
        "D078:sociology-social-anthropology",
        "D078:politics-governance-public-policy",
        "D078:psychology-social-behaviour",
    }


def test_casevo_and_predictive_text_are_narrowly_scoped_not_globally_held():
    rows = d078_area_context_items("D078:computational-digital-social-science")
    casevo = next(item for item in rows if item["itemKey"].endswith(":mesa-or-casevo"))
    predictive = next(item for item in rows if item["itemKey"].endswith(":predictive-text-modeling"))
    assert casevo["claimReviewState"] == "approved"
    assert any("paid usage" in note for note in casevo["evidenceLimitations"])
    assert predictive["claimReviewState"] == "approved"
    assert any("AfriSenti sentiment-classification" in note for note in predictive["evidenceLimitations"])
    assert any("not validate other constructs" in note for note in predictive["evidenceLimitations"])


def test_economics_sequence_endpoints_are_individually_promoted_with_scoped_links():
    rows = d078_area_context_items("D078:economics-applied-analysis")
    by_key = {item["itemKey"]: item for item in rows}
    assert {
        "D078-ECON-APPLIED-ECONOMETRICS",
        "D078-ECON-CAUSAL-ML",
        "D078-ECON-AGENT-BASED-MODELING",
        "D078-ECON-CASEVO-LLM-SIM",
    } <= by_key.keys()
    assert "docs.doubleml.org/tutorial" in by_key["D078-ECON-CAUSAL-ML"]["linkUrl"]
    assert by_key["D078-ECON-CASEVO-LLM-SIM"]["linkUrl"] == "https://github.com/rgCASS/casevo"
    assert by_key["D078-ECON-CAUSAL-ML"]["linkEvidence"]["supports"]
    assert by_key["D078-ECON-CASEVO-LLM-SIM"]["linkEvidence"]["supports"]
    assert any("licence" in note.casefold() for note in by_key["D078-ECON-CASEVO-LLM-SIM"]["evidenceLimitations"])
    assert all(item["contextKey"] == "D078:economics-applied-analysis" for item in by_key.values())


def test_master_reconciliation_uses_only_final_approval_states():
    root = Path(__file__).resolve().parents[2]
    master_path = root / "data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json"
    master = json.loads(master_path.read_text(encoding="utf-8"))
    assert master["coverage"]["domain_items"] == 53
    assert master["coverage"]["area_items"] == 144
    assert master["coverage"]["current_areas"] == 7
    assert master["coverage"]["role_item_records_carried_forward"] == 173
    statuses = [row["disposition"]["approval_status"] for row in master["domain_items"]]
    statuses += [item["disposition"]["approval_status"] for area in master["areas"] for item in area["items"]]
    assert set(statuses) <= {"approved", "unapproved"}
    assert statuses.count("approved") == 196
    assert statuses.count("unapproved") == 1
    assert master["coverage"]["domain_claim_reviews_finalized"] == 53
    assert master["coverage"]["programme_themes"] == 14
    assert master["coverage"]["programme_theme_claim_records"] == 3
    assert len(master["programme_themes"]) == 14
    assert master["validation"]["all_programme_themes_have_narration_course_evidence_and_resource_coverage"] is True
    assert master["validation"]["programme_themes_are_distinct_from_claim_record_count"] is True
    assert all(theme["approval_status"] == "approved" for theme in master["programme_themes"])
    assert all(theme["courseAnchors"] and theme["narration"] for theme in master["programme_themes"])
    assert master["coverage"]["strict_learning_dependencies"] == 3
    assert master["coverage"]["area_order_dispositions"] == 27
    assert master["sequence_direction_review"]["record_count"] == 19
    assert {row["approval_status"] for row in master["sequence_direction_review"]["records"]} == {"approved"}
    aliases = [item for area in master["areas"] for item in area["items"] if item["disposition"].get("learner_display_mode") == "consolidated_alias"]
    assert len(aliases) == 6
    assert all(item["disposition"]["approval_status"] == "approved" and item["disposition"].get("canonical_item_id") for item in aliases)


def test_global_only_evidence_does_not_block_domain_approval():
    data = d078_guided_content()
    global_items = [item for item in data["domainItems"] if item["geographicScope"] == "global"]
    assert global_items
    assert all(item["claimReviewState"] == "approved" for item in global_items)


def test_promotion_gate_uses_current_master_and_does_not_treat_hidden_graph_as_hidden_api():
    root = Path(__file__).resolve().parents[2]
    gate_path = root / "data/career-mapping/_audit/D078_STUDENT_PROMOTION_GATE_2026_10_10.json"
    gate = json.loads(gate_path.read_text(encoding="utf-8"))
    assert gate["current_master"]["programme_themes"] == 14
    assert gate["current_master"]["programme_theme_claim_records"] == 3
    assert gate["current_master"]["runtime_approved_items"] == 190
    assert gate["checks"]["approved_runtime_content_contracts_passed"] is True
    assert gate["checks"]["all_item_dispositions_final"] is True
    assert gate["runtime_api"]["approved_items_merged_into_domain_detail_response"] is True
    assert gate["authoritative_master_graph"]["edges"] == 3801
    assert gate["checks"]["implementation_ui_gate_passed"] is False
    assert gate["checks"]["explicit_student_facing_approval"] is False
    assert gate["promotion_allowed"] is False


def test_runtime_merge_preserves_unrelated_items_and_promotes_explicit_identity():
    promoted = d078_domain_context_items()
    existing = [{"itemType": "skill", "itemKey": "legacy-existing", "name": "Existing"}]
    merged = merge_d078_context_items(existing, promoted)
    assert any(item["itemKey"] == "legacy-existing" for item in merged)
    assert all(any(row["itemKey"] == item["itemKey"] for row in merged) for item in promoted)
    replacement = {**promoted[0], "name": "Locally reviewed replacement"}
    merged_again = merge_d078_context_items([promoted[0]], [replacement])
    assert len(merged_again) == 1
    assert merged_again[0]["name"] == "Locally reviewed replacement"
