import json
from pathlib import Path


REVIEW = json.loads(
    Path(__file__)
    .with_name("D053_D056_global_specialization_review_2026_10_06.json")
    .read_text(encoding="utf-8")
)


def test_review_is_global_only_and_does_not_change_canonical_data():
    assert REVIEW["regional_context"] == "deferred; global review only"
    assert REVIEW["canonical_edits"] is False
    assert REVIEW["role_to_specialization_assignments"] == 0


def test_candidate_sets_are_not_counted_from_old_groups():
    assert [d["domain_id"] for d in REVIEW["domains"]] == ["D053", "D054", "D055", "D056"]
    assert [len(d["candidate_specializations"]) for d in REVIEW["domains"]] == [4, 7, 9, 5]
    assert "global_four_area_internal_recommendation_supported" in REVIEW["domains"][0]["candidate_count_status"]
    assert "global_seven_area_internal_recommendation_source_supported" in REVIEW["domains"][1]["candidate_count_status"]
    assert all("provisional" in d["candidate_count_status"] for d in REVIEW["domains"][2:])


def test_d053_four_area_recommendation_is_source_supported_but_not_a_universal_standard():
    d053 = REVIEW["domains"][0]
    labels = [row["label"] for row in d053["candidate_specializations"]]
    assert labels == [
        "Accommodation and Guest Operations",
        "Food, Beverage and Culinary Operations",
        "Travel, Tourism and Visitor Services",
        "Hospitality Events and Meetings",
    ]
    assert REVIEW["sources"]["IOH_GLOBAL_ACCREDITATION"]["publisher"] == "Institute of Hospitality"
    assert REVIEW["sources"]["UNWTO_AHLEI_CURRICULUM"]["publisher"].startswith("UN Tourism Digital Library")
    assert "not a binding global subgroup taxonomy" in REVIEW["sources"]["IOH_GLOBAL_ACCREDITATION"]["limit"]
    assert d053["current_state"]["active_role_mappings"] == 0
    assert "role-path activation pending" in d053["next_disposition"]


def test_d054_seven_area_set_matches_explicit_root_scope_without_claiming_external_count_authority():
    d054 = REVIEW["domains"][1]
    assert len(d054["candidate_specializations"]) == 7
    assert "refinery control rooms" in d054["parent_domain_fit_disposition"]
    assert "no parent split is recommended" in d054["parent_domain_fit_disposition"]
    assert "neither prescribes seven subgroups" in d054["count_rationale"]
    assert REVIEW["sources"]["EI_GLOBAL_VALUE_CHAIN"]["publisher"] == "Energy Institute"
    assert d054["current_state"]["active_role_mappings"] == 0
    assert "role-path activation pending" in d054["next_disposition"]


def test_d055_separates_distinct_professional_practice_candidates_without_claiming_a_fixed_standard():
    d055 = REVIEW["domains"][2]
    labels = [row["label"] for row in d055["candidate_specializations"]]
    assert len(labels) == 9
    assert "Separation and Purification Engineering" in labels
    assert "Materials and Particle Process Engineering" in labels
    assert "Biochemical and Bioprocess Engineering" in labels
    assert "Food and Bioproduct Process Engineering" in labels
    assert "Pharmaceutical Process Engineering" in labels
    assert "Energy and Low-Carbon Process Engineering" in labels
    assert "Environmental, Water and Clean Process Engineering" in labels
    assert "not an endorsed universal subgroup count" in d055["count_rationale"]
    assert d055["current_state"]["active_role_mappings"] == 3


def test_d056_five_candidate_boundaries_have_independent_standards_and_implementation_evidence():
    d056 = REVIEW["domains"][3]
    labels = [row["label"] for row in d056["candidate_specializations"]]
    assert labels == [
        "Distributed-Ledger Protocols and Infrastructure",
        "Smart Contracts and Decentralized Applications",
        "DLT Security, Privacy and Digital Identity",
        "DLT Interoperability and Integration",
        "Permissioned and Consortium DLT Systems",
    ]
    assert REVIEW["sources"]["ISO_TC307"]["publisher"] == "International Organization for Standardization"
    assert REVIEW["sources"]["IEEE_BDLSC"]["publisher"].startswith("IEEE Computer Society")
    assert REVIEW["sources"]["HYPERLEDGER_FABRIC_DOCS"]["supports"].startswith("Permissioned consortium networks")
    assert "not a direct copy" in d056["count_rationale"]
    assert "distinct practice path" in d056["count_rationale"]


def test_empty_role_populations_are_not_mistaken_for_complete_student_paths():
    d053, d054, d055, d056 = REVIEW["domains"]
    assert d053["current_state"]["active_role_mappings"] == 0
    assert d054["current_state"]["active_role_mappings"] == 0
    assert d055["current_state"]["active_role_mappings"] == 3
    assert d056["current_state"]["active_role_mappings"] == 25
    assert "Role coverage must be independently closed" in " ".join(REVIEW["limitations"])


def test_every_candidate_has_a_boundary_and_resolvable_global_source_reference():
    source_ids = set(REVIEW["sources"])
    for domain in REVIEW["domains"]:
        for candidate in domain["candidate_specializations"]:
            assert candidate["label"]
            assert candidate["boundary"]
            assert candidate["source_ids"]
            assert set(candidate["source_ids"]).issubset(source_ids)


def test_computational_or_cross_cutting_topics_are_not_auto_promoted_to_subgroups():
    d054, d055 = REVIEW["domains"][1:3]
    assert "digital/data methods" in d054["cross_cutting_not_automatic_subgroups"]
    assert "computational modelling" in d055["cross_cutting_not_automatic_subgroups"]


def test_oil_and_gas_value_chain_has_independent_global_source_support():
    d054 = REVIEW["domains"][1]
    assert REVIEW["sources"]["EI_GLOBAL_VALUE_CHAIN"]["publisher"] == "Energy Institute"
    candidates = {row["key"]: row for row in d054["candidate_specializations"]}
    assert "EI_GLOBAL_VALUE_CHAIN" in candidates["midstream-gas-processing-transport-and-storage"]["source_ids"]
    assert "EI_GLOBAL_VALUE_CHAIN" in candidates["refining-and-petroleum-processing"]["source_ids"]
