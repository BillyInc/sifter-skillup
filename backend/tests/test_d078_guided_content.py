import json
import runpy
import sys
from pathlib import Path

from d078_guided_content import (
    _d078_role_items_by_owner,
    d078_area_context_items,
    d078_area_tool_options,
    d078_domain_context_items,
    d078_guided_content,
    d078_role_context_items,
    merge_d078_context_items,
)

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "data" / "career-mapping"))
from _build_d078_guided_content_seed_2026_10_12 import records as d078_seed_records, sequence_relationships


def test_only_explicitly_dispositioned_d078_items_enter_runtime():
    data = d078_guided_content()
    assert data["approvedCount"] == 203
    assert len(data["domainItems"]) == 53
    assert sum(map(len, data["areaItems"].values())) == 150
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
        assert item["linkEvidence"].get("why_this_resource")
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
        assert isinstance(item["prerequisites"], list)
        assert all(isinstance(value, str) and value.strip() for value in item["prerequisites"])


def test_domain_tools_are_explicit_reviewed_items_with_context_and_learning_links():
    items = [item for item in d078_domain_context_items() if item["itemType"] == "tool"]
    # The generic domain CASEVO candidate is explicitly lane-held; its separate
    # Economics-area route is distinct and remains in that area's contract.
    assert len(items) == 17
    assert all(item["claimReviewState"] == "approved" for item in items)
    assert all(item["plainMeaning"] and item["contextualUse"] for item in items)
    assert all(item["linkUrl"].startswith("https://") and item["linkTitle"] for item in items)
    assert all(item["linkEvidence"].get("why_this_resource") for item in items)


def test_every_domain_and_area_item_carries_separate_programme_and_owning_layer_context():
    data = d078_guided_content()
    for item in data["domainItems"]:
        assert "Your Sociology programme gives you a starting point" in item["programmeContext"]
        assert "CCMAS" not in item["programmeContext"]
        assert "role-task" not in item["domainContext"].casefold()
        assert item["domainContext"]
    for rows in data["areaItems"].values():
        for item in rows:
            assert "Your Sociology programme gives you a starting point" in item["programmeContext"]
            assert "CCMAS" not in item["programmeContext"]
            assert "role-task" not in item["domainContext"].casefold()
            assert item["domainContext"]
            assert item["areaContext"]


def test_student_explanation_context_avoids_internal_curriculum_and_role_task_acronyms():
    root = Path(__file__).resolve().parents[2]
    graph = json.loads((root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    roles = [node["label"] for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"]
    data = d078_guided_content()
    items = list(data["domainItems"])
    for rows in data["areaItems"].values():
        items.extend(rows)
    for role in roles:
        items.extend(d078_role_context_items(f"D078|{role}"))
    learner_fields = ("plainMeaning", "contextualUse", "expectedOutput", "programmeContext", "domainContext", "areaContext", "roleContext")
    for item in items:
        copy = " ".join(str(item.get(field) or "") for field in learner_fields).casefold()
        assert "ccmas" not in copy
        assert "esco" not in copy
        assert "role-task" not in copy
        assert "d078" not in copy
        assert "d064" not in copy
        assert "\ufffd" not in copy
        assert "â" not in copy
        assert "current area route" not in copy
        assert "foundation placement" not in copy
        assert "single occurrence" not in copy
        assert "not independently rechecked" not in copy


def test_task_linked_area_tools_are_individual_optional_cards_not_grouped_checklists():
    data = d078_guided_content()
    human_geo = [item for item in data["areaItems"]["D078:human-geography-population"] if item["itemType"] == "tool"]
    social_behaviour = [item for item in data["areaItems"]["D078:psychology-social-behaviour"] if item["itemType"] == "tool"]
    assert {item["name"] for item in human_geo} == {"QGIS for a human-geography spatial workflow", "GeoDa", "GeoPandas", "PySAL esda", "ArcGIS Spatial Analyst"}
    assert {item["name"] for item in social_behaviour} == {"NVivo", "Taguette", "R", "Python", "SPSS", "Stata", "LimeSurvey", "PsyToolkit", "PsychoPy", "OpenSesame"}
    for item in human_geo + social_behaviour:
        assert item["requirementLevel"] == "optional"
        assert item["requirementReason"] and "optional" in item["requirementReason"].casefold()
        assert item["guidanceOwner"] == "subgroup"
        assert item["sourceReferences"] and item["sourceLocators"]
        assert item["claimReviewState"] == "approved"
        assert item["linkUrl"].startswith("https://")
        assert item["linkEvidence"]["why_this_resource"]
        assert all(edge["sequenceApproved"] is False for edge in item["relationships"])
    assert all(item["useCaseKey"] == "D078:human-geography-population:spatial-analysis-method" for item in human_geo[1:])
    psycho = next(item for item in social_behaviour if item["name"] == "PsychoPy")
    opensesame = next(item for item in social_behaviour if item["name"] == "OpenSesame")
    assert any(edge["relationshipType"] == "alternative" and edge["toItemKey"] == opensesame["itemKey"] for edge in psycho["relationships"])


def test_casevo_area_copy_explains_the_model_in_student_language_and_bounds_its_claims():
    item = next(
        item for item in d078_area_context_items("D078:sociology-social-anthropology")
        if item["itemKey"] == "SOC-A2"
    )
    meaning = item["plainMeaning"].casefold()
    use = item["contextualUse"].casefold()
    assert "computer simulations" in meaning
    assert "agents" in meaning and "interaction network" in meaning
    assert "large language model (llm)" in meaning
    assert "optional" in item["requirementReason"].casefold()
    assert "not a step every learner must take" in item["requirementReason"].casefold()
    full_explanation = " ".join([meaning, use, *item["evidenceLimitations"]]).casefold()
    assert "simulated responses are not real people" in full_explanation
    assert item["requirementLevel"] == "optional"


def test_every_area_item_explains_its_specific_area_fit_and_task_not_generic_placeholder_copy():
    data = d078_guided_content()
    for area_id, rows in data["areaItems"].items():
        for item in rows:
            use = item["contextualUse"]
            assert "D078 area-level addition or route-specific option" not in use
            assert item["plainMeaning"].strip()
            assert item["guidanceOwner"] == "subgroup"
            assert item["domainContext"].strip()
            assert item["areaContext"].strip()
            assert item["requirementReason"].strip()
            assert "task:" not in use.casefold()
            assert "guardrail:" not in use.casefold()
            assert all(note.casefold() not in {"state", "label", "explanation"} for note in item["evidenceLimitations"])
            if item["itemKey"].startswith("D078:"):
                assert len(use) >= 40
                assert "adds focused learning beyond the shared Social Sciences foundation" not in use


def test_casevo_explanation_is_not_reused_as_generic_area_copy():
    data = d078_guided_content()
    items = [item for rows in data["areaItems"].values() for item in rows]
    casevo = [item for item in items if "casevo" in item["name"].casefold()]
    other_items = [item for item in items if item not in casevo]
    assert casevo
    assert all("casevo" not in " ".join(str(item.get(field) or "") for field in [
        "plainMeaning", "contextualUse", "areaContext", "expectedOutput",
    ]).casefold() for item in other_items)


def test_short_area_and_role_definitions_are_expanded_with_item_specific_explanations():
    data = d078_guided_content()
    area_items = [item for rows in data["areaItems"].values() for item in rows]
    area_ids = {
        "D078-HG-TOOL-GEODA", "D078-HG-TOOL-GEOPANDAS",
        "D078-HG-TOOL-ARCGIS-SPATIAL-ANALYST", "D078-A03-knowledge-institutions-policy",
        "D078-A04-TOOL-LIMESURVEY", "D078-A04-TOOL-PSYTOOLKIT",
        "D078-A04-TOOL-PSYCHOPY", "D078-A04-TOOL-OPENSESAME",
    }
    expanded_area = {item["itemKey"]: item for item in area_items if item["itemKey"] in area_ids}
    assert expanded_area.keys() == area_ids
    assert all(len(item["plainMeaning"]) >= 140 for item in expanded_area.values())

    graph = json.loads((Path(__file__).resolve().parents[2] / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    roles = [node for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"]
    role_items = [item for node in roles for item in d078_role_context_items(f"D078|{node['label']}")]
    role_ids = {
        "ESCO-SKILL-4bc7fcff-54a5-4ff0-8f5e-a7c2479b522c",
        "ESCO-SKILL-c33dd5ae-ae72-49d7-8dcf-8bc72e59fe78",
        "ESCO-SKILL-b011c8b4-76e1-4bbc-8bb9-1d205e7b618a",
        "ESCO-SKILL-918f5211-b99f-4b29-9a34-6e475583ef55",
        "ESCO-SKILL-2be39143-3cf8-4b02-af8f-99e3dfb2fc24",
        "ESCO-SKILL-d63c2bad-817d-4116-b4d8-b927cb01212d",
        "ESCO-SKILL-0aa02c52-077d-45f8-8c2d-7132c11ac16e",
        "ESCO-SKILL-2ff405ec-f59c-4a7b-84b6-9776a49582c4",
    }
    expanded_role = {item["itemKey"]: item for item in role_items if item["itemKey"] in role_ids}
    assert expanded_role.keys() == role_ids
    assert all(len(item["plainMeaning"]) >= 140 for item in expanded_role.values())


def test_copy_review_fixes_cover_all_94_previously_flagged_item_contexts():
    root = Path(__file__).resolve().parents[2]
    audit = runpy.run_path(str(root / "data/career-mapping/_audit/audit_d078_student_explanation_copy_2026_10_17.py"))["build_audit"]()
    assert audit["visible_payload_counts"] == {
        "programme_themes": 14,
        "domain_items": 53,
        "area_items": 150,
        "role_items": 202,
    }
    assert audit["finding_count"] == 0
    assert audit["human_review_required"] is True
    assert audit["auto_approval"] is False

    data = d078_guided_content()
    network = next(
        item for item in data["areaItems"]["D078:computational-digital-social-science"]
        if item["itemKey"] == "D078:computational-digital-social-science:networkx-or-gephi"
    )
    assert "entities" in network["plainMeaning"] and "relationships" in network["plainMeaning"]
    assert "does not prove why" in network["plainMeaning"]

    role_interviews = [
        item
        for owner in ("anthropologist", "genealogist", "media scientist", "sociologist")
        for item in d078_role_context_items(f"D078|{owner}")
        if item["name"] == "Interview techniques"
    ]
    assert len(role_interviews) == 4
    assert all("one interview does not represent everyone" in item["contextualUse"] for item in role_interviews)


def test_approved_role_items_are_materialized_per_current_role_with_complete_student_contracts():
    root = Path(__file__).resolve().parents[2]
    graph = json.loads((root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    roles = [node for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"]
    assert len(roles) == 19
    role_items = {
        node["label"]: d078_role_context_items(f"D078|{node['label']}")
        for node in roles
    }
    assert all(role_items.values())
    assert sum(len(items) for items in role_items.values()) == 297
    # Stable ESCO identity deduplicates repeated concepts within each role;
    # the same item can still appear under multiple role contexts.
    assert all(len({item["itemKey"] for item in items}) == len(items) for items in role_items.values())
    assert len({item["itemKey"] for items in role_items.values() for item in items}) == 160
    required_claims = {"item_identity", "checkpoint_fit", "plain_meaning", "contextual_use", "expected_output", "priority"}
    for role_name, items in role_items.items():
        for item in items:
            assert item["contextLevel"] == item["guidanceOwner"] == "role"
            assert item["contextKey"].casefold() == f"d078|{role_name}".casefold()
            assert item["name"][:1].isupper()
            assert item["plainMeaning"] and item["contextualUse"] and item["expectedOutput"], (role_name, item["name"], item["contextualUse"])
            assert item["prerequisites"] and item["complements"] and item["validAlternatives"]
            assert item["programmeContext"] and item["domainContext"] and item["areaContext"] and item["roleContext"]
            assert item["linkState"] == "linked" and item["linkUrl"].startswith("https://")
            assert item["linkSourceReference"]["locator"] and item["linkEvidence"]["why_this_resource"]
            assert all(candidate["url"].startswith("https://") for candidate in item["additionalLearningLinks"])
            assert item["sourceReferences"] and item["sourceLocators"]
            assert all(locator.get("sourceId") and locator.get("url", "").startswith("https://") for locator in item["sourceLocators"])
            assert required_claims <= item["claimEvidence"]["claims"].keys()
            assert all(item["claimEvidence"]["claims"][claim]["source_references"] and item["claimEvidence"]["claims"][claim]["source_locators"] for claim in required_claims)
    visible_names = {item["name"].casefold() for items in role_items.values() for item in items}
    assert "history of philosophy" not in visible_names
    assert "logic" not in visible_names
    assert "investigation research methods" not in visible_names
    # Source-level false flags predate item review; the approved master
    # decision, current role owner, and resolved link determine this output.
    assert any(item["name"] == "History" for item in role_items["sociologist"])


def test_role_item_definitions_do_not_leak_source_uri_prefixes_into_student_copy():
    items = d078_role_context_items("D078|genealogist")
    family_history = next(item for item in items if item["name"].casefold() == "research family histories")
    assert "ESCO URI" not in family_history["plainMeaning"]
    assert "http://" not in family_history["plainMeaning"]
    assert "researching a family's history" in family_history["plainMeaning"].casefold()
    # Source identity remains available separately for staff/source review.
    assert family_history["sourceReferences"]


def test_role_explanations_translate_internal_review_terms_into_learner_language():
    root = Path(__file__).resolve().parents[2]
    graph = json.loads((root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    roles = [node["label"] for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"]
    assert len(roles) == 19
    items = [item for role in roles for item in d078_role_context_items(f"D078|{role}")]
    learner_fields = ("plainMeaning", "contextualUse", "expectedOutput", "requirementReason")
    display_copy = " ".join(
        str(item.get(field) or "")
        for item in items
        for field in learner_fields
    ).casefold()
    assert "task family" not in display_copy
    assert "no d078 placement" not in display_copy

    priority_note = next(
        item for item in d078_role_context_items("D078|social work researcher")
        if item["name"] == "Meet standards of practice in social services"
    )["evidenceLimitations"]
    assert all("candidate only" not in note.casefold() for note in priority_note)
    assert any("does not make this a shared foundation" in note.casefold() for note in priority_note)

    pedigree = next(item for item in d078_role_context_items("D078|genealogist") if item["name"].casefold() == "interpret pedigree charts")
    assert "biological inheritance" in pedigree["plainMeaning"]
    assert "only if a specific project involves genetics" in pedigree["contextualUse"]
    assert "most genealogy work does not require it" in pedigree["contextualUse"]
    assert "privacy safeguards" in pedigree["contextualUse"]


def test_role_task_explanations_do_not_show_staff_adjudication_language():
    root = Path(__file__).resolve().parents[2]
    graph = json.loads((root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    roles = [node["label"] for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"]
    items = [item for role in roles for item in d078_role_context_items(f"D078|{role}")]
    learner_copy = " ".join(
        str(item.get(field) or "")
        for item in items
        for field in ("contextualUse", "expectedOutput")
    ).casefold()
    for staff_phrase in (
        "research candidate", "role label", "source/profile", "role-task inventory",
        "does not adjudicate role fit", "d064 placement", "inventory says essential",
        "essential priority unsubstantiated", "likely cross-field false match",
        "external sources reviewed",
    ):
        assert staff_phrase not in learner_copy

    zoology = next(item for item in d078_role_context_items("D078|behavioural scientist") if item["name"] == "Applied zoology")
    assert zoology["requirementLevel"] == "useful"
    assert "not normally part of social or behavioural science" in zoology["contextualUse"]
    assert "optional interdisciplinary learning edge" in zoology["contextualUse"]
    assert "relevant biological expertise" in zoology["contextualUse"]
    assert "not needed" in zoology["contextualUse"]
    assert "different from studying human behaviour" in zoology["plainMeaning"]

    legislation = next(item for item in d078_role_context_items("D078|genealogist") if item["name"] == "Analyse legislation")
    assert "historical context" in legislation["contextualUse"]
    assert "not a general genealogist duty" in legislation["contextualUse"]


def test_flagged_area_explanations_keep_use_and_practice_output_distinct():
    data = d078_guided_content()
    items = {
        item["itemKey"]: item
        for rows in data["areaItems"].values()
        for item in rows
    }
    assert all(
        not str(item.get("expectedOutput") or "").strip()
        or str(item.get("expectedOutput")).strip().casefold() != str(item.get("contextualUse") or "").strip().casefold()
        for item in items.values()
    )
    economics_ids = (
        "D078-ECON-ECONOMIC-REASONING", "D078-ECON-MEASUREMENT",
        "D078-ECON-UNCERTAINTY-COMMUNICATION", "D078-ECON-R-PYTHON-ANALYSIS",
        "D078-ECON-REPRODUCIBLE-RESEARCH", "D078-ECON-CAUSAL-EVALUATION",
        "D078-ECON-LLM-EVIDENCE-SYNTHESIS", "D078-ECON-FORECASTING-UNCERTAINTY",
        "D078-ECON-ALTERNATIVE-DATA-NOWCAST", "D078-ECON-DISTRIBUTIONAL-ANALYSIS",
        "D078-ECON-NIGERIA-MICRODATA", "D078-ECON-NATIONAL-ACCOUNTS-MEASUREMENT",
        "D078-ECON-LABOUR-STATISTICS", "D078-ECON-PUBLIC-FINANCE-STATISTICS",
        "ECON-A1", "ECON-C2", "ECON-A2", "ECON-C3",
    )
    sociology_ids = (
        "D078-SOC-QUESTION-DESIGN", "D078-SOC-THEORY-CONTEXT",
        "D078-SOC-ETHICS-REFLEXIVITY", "D078-SOC-ETHNOGRAPHIC-FIELDWORK",
        "D078-SOC-INTERVIEW-FOCUSGROUP", "D078-SOC-KOBO-SURVEY-FIELD",
        "D078-SOC-THEMATIC-ANALYSIS", "D078-SOC-CAQDAS-TAGUETTE-NVIVO",
        "D078-SOC-LLM-ASSISTED-CODING", "D078-SOC-SECONDARY-QUAL-ANALYSIS",
        "D078-SOC-DOCUMENT-ANALYSIS", "D078-SOC-SURVEY-DESIGN",
        "D078-SOC-SURVEY-ANALYSIS-R", "D078-SOC-AI-SURVEY-QUESTION-DRAFTING",
        "D078-SOC-DIGITAL-TRACE-ETHICS", "D078-SOC-SOCIAL-NETWORK-ANALYSIS",
        "D078-SOC-QUANT-TEXT-R", "D078-SOC-LLM-SYNTHETIC-PILOT",
        "SOC-C2", "SOC-T1", "SOC-S1", "SOC-A1", "SOC-C3", "SOC-M3",
        "SOC-A2", "SOC-M4", "SOC-C4",
    )
    for item_key in (*economics_ids, *sociology_ids, "ECON-K1", "ECON-S1", "ECON-C1", "SOC-M1", "SOC-T2"):
        item = items[item_key]
        assert item["contextualUse"]
        assert item["expectedOutput"]
        assert item["contextualUse"].casefold() != item["expectedOutput"].casefold()

    assert "assumptions" in items["D078-ECON-ECONOMIC-REASONING"]["expectedOutput"]
    assert "classification vintage" in items["D078-ECON-NATIONAL-ACCOUNTS-MEASUREMENT"]["expectedOutput"]
    assert "not official statistics" in items["D078-ECON-ALTERNATIVE-DATA-NOWCAST"]["expectedOutput"]
    assert "dataset/study identifier" in items["D078-ECON-NIGERIA-MICRODATA"]["expectedOutput"]
    assert "real-person testing" in items["D078-SOC-LLM-SYNTHETIC-PILOT"]["expectedOutput"]
    assert "simulated rather than real-world evidence" in items["SOC-A2"]["expectedOutput"]
    assert "privacy" in items["D078-SOC-ETHNOGRAPHIC-FIELDWORK"]["contextualUse"]
    assert "unit or denominator" in items["ECON-K1"]["expectedOutput"]
    assert "missing data" in items["ECON-S1"]["expectedOutput"]
    assert "cannot" in items["ECON-C1"]["expectedOutput"]
    assert "consent and privacy" in items["SOC-M1"]["contextualUse"]
    assert "interaction rules" in items["SOC-T2"]["expectedOutput"]


def test_role_cards_separate_task_use_from_deliverable_without_repeating_the_same_copy():
    graph = json.loads((Path(__file__).resolve().parents[2] / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    roles = [node["label"] for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"]
    role_items = [item for role in roles for item in d078_role_context_items(f"D078|{role}")]
    with_output = [item for item in role_items if item.get("expectedOutput")]
    assert with_output, "Expected reviewed role records to provide learner-facing deliverables"
    for item in with_output:
        use = item["contextualUse"].strip()
        output = item["expectedOutput"].strip()
        assert use.casefold() != output.casefold(), item["name"]
        assert not output.casefold().startswith(("output:", "a defensible output is", "output should")), item["name"]
        assert "Current role-task records:" not in use
        assert "Current role-task records:" not in output


def test_role_item_explanations_distinguish_the_concept_from_its_role_use():
    role_items_by_owner = _d078_role_items_by_owner()
    items = [item for role in sorted(role_items_by_owner) for item in role_items_by_owner[role]]

    # Repeated definitions and uses were making the expanded cards feel like
    # duplicated/raw task records. Keep the distinction in the display copy;
    # this test does not change the item inventory or role assignments.
    assert len(items) == 202
    duplicates = [
        (item["contextKey"], item["name"])
        for item in items
        if item["plainMeaning"].strip().casefold() == item["contextualUse"].strip().casefold()
    ]
    assert not duplicates, duplicates
    for item in items:
        context_fields = [
            item[field]
            for field in ("programmeContext", "domainContext", "areaContext", "roleContext")
        ]
        assert all(item["name"].casefold() in context.casefold() for context in context_fields)
        assert len({context.casefold() for context in context_fields}) == len(context_fields)
        assert "includes many questions and kinds of work" not in item["domainContext"]

    osteology = next(
        item for item in d078_role_context_items("D078|archaeologist")
        if item["name"].casefold() == "osteology"
    )
    assert osteology["plainMeaning"].startswith("Osteology is the study of bones")
    assert "location, layer and association" in osteology["contextualUse"]

    company_policy = next(
        item for item in d078_role_context_items("D078|tax policy analyst")
        if item["name"].casefold() == "company policies"
    )
    assert "written rules or procedures" in company_policy["plainMeaning"]
    assert "does not name a company or policy" in company_policy["contextualUse"]


def test_role_item_outputs_do_not_use_a_repeated_generic_fallback():
    generic = "the reviewed record does not establish one specific work product"
    owners = _d078_role_items_by_owner()
    role_items = [(role, item) for role, items in owners.items() for item in items]
    assert len(role_items) == 202
    assert all(item.get("expectedOutput") for _, item in role_items)
    assert not [
        (role, item["name"])
        for role, item in role_items
        if generic in str(item.get("expectedOutput", "")).casefold()
    ]

    company_policy = next(
        item for item in owners["D078|economic adviser"]
        if item["name"].casefold() == "company policies"
    )
    assert "named employer policy" in company_policy["expectedOutput"].casefold()
    assert "no specific policy output to assume" in company_policy["expectedOutput"].casefold()

    transcript = next(
        item for item in owners["D078|genealogist"]
        if item["name"].casefold() == "transcription methods"
    )
    assert "faithful transcript" in transcript["expectedOutput"].casefold()
    assert "uncertain readings marked" in transcript["expectedOutput"].casefold()


def test_short_domain_narration_is_expanded_as_explanation_not_word_padding():
    items = {item["itemKey"]: item for item in d078_domain_context_items()}
    expected = {
        "reliability_validity_and_uncertainty": ("reliability asks", "validity asks", "uncertainty"),
        "pilot_and_cognitive_pretesting": ("small number of people", "confusing wording", "cannot by itself prove"),
        "discourse_and_conversation_analysis": ("turn-taking", "setting", "private intention"),
        "participatory_and_action_research": ("people affected", "who can influence", "ethical review"),
        "experiments_quasi_experiments_and_causal_inference": ("without it", "randomized experiment", "does not establish cause"),
        "psychometrics_and_scale_construction": ("cannot be observed directly", "consistent", "every population"),
        "stata_quantitative_social_science_workflow": ("repeatable workflow", "research question", "does not select a sound method"),
    }
    for key, phrases in expected.items():
        narration = items[key]["contextualUse"].casefold()
        assert len(narration.split()) >= 35
        assert all(phrase in narration for phrase in phrases)


def test_area_narration_explains_digital_trace_and_spss_context():
    items = {
        item["itemKey"]: item
        for rows in d078_guided_content()["areaItems"].values()
        for item in rows
    }
    digital_trace = items["D078:computational-digital-social-science:digital-trace-construct-and-sampling"]["contextualUse"].casefold()
    spss = items["D078:social-research-evaluation:spss-quantitative-tool"]["contextualUse"].casefold()
    assert "platform, people and time period" in digital_trace
    assert "neutral sample of society" in digital_trace
    assert "quantitative procedure" in spss
    assert "cannot choose the right research question" in spss

    esda = next(
        item for item in items.values()
        if item["name"].casefold() == "pysal esda"
    )
    assert len(esda["plainMeaning"].split()) >= 25
    assert "spatial pattern, not its cause" in esda["plainMeaning"]


def test_area_work_products_are_displayed_when_the_reviewed_task_already_names_them():
    items = {
        item["itemKey"]: item
        for rows in d078_guided_content()["areaItems"].values()
        for item in rows
    }
    expected_ids = {
        "D078-ECON-APPLIED-ECONOMETRICS", "D078-ECON-CAUSAL-ML",
        "D078-ECON-AGENT-BASED-MODELING", "D078-ECON-CASEVO-LLM-SIM",
        "D078-A34-A03-method-ria", "D078-A34-A03-competency-options-impact-analysis",
        "D078-A34-A03-knowledge-regulatory-policy-cycle", "D078-A34-A03-method-participation-design",
        "D078-A34-A03-competency-inclusion-response-accountability", "D078-A34-A03-method-community-scorecard",
        "D078-A34-A03-skill-public-evidence-tracking", "D078-A34-A03-tool-budget-imonitor",
        "D078-A34-A04-method-conflict-analysis", "D078-A34-A04-competency-conflict-sensitivity",
        "D078-A34-A04-method-behavioural-insights-cycle", "D078-A34-A04-competency-contextual-intervention-evaluation",
    }
    assert expected_ids <= items.keys()
    for item_id in expected_ids:
        item = items[item_id]
        assert item["expectedOutput"]
        assert item["expectedOutput"].casefold() != item["contextualUse"].casefold()
        assert len(item["expectedOutput"].split()) >= 18


def test_repeated_role_tool_definitions_explain_the_tool_and_its_limit():
    root = Path(__file__).resolve().parents[2]
    graph = json.loads((root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    roles = [node["label"] for node in graph["nodes"] if node.get("kind") == "role" and node.get("domain_id") == "D078"]
    items = [item for role in roles for item in d078_role_context_items(f"D078|{role}") if item["itemType"] == "tool"]
    definitions = {
        "microsoft excel": ("rows and columns", "verify formulas", "does not decide"),
        "gephi": ("nodes", "edges", "does not prove"),
        "zotero": ("publication details", "inserting citations", "does not confirm"),
        "transkribus": ("handwriting-recognition", "scanned historical documents", "check important passages"),
        "opensesame": ("behavioural experiments", "responses", "measure"),
    }
    found = {name: False for name in definitions}
    for item in items:
        name = item["name"].casefold()
        if name not in definitions:
            continue
        found[name] = True
        meaning = item["plainMeaning"].casefold()
        assert len(meaning.split()) >= 30
        assert all(phrase in meaning for phrase in definitions[name])
    assert all(found.values())


def test_approved_domain_relationships_are_sent_to_the_student_ui_as_advisory_connections():
    data = d078_guided_content()
    by_name = {item["name"]: item for item in data["domainItems"]}
    python_item = by_name["Python"]
    connections = python_item["relationships"]
    assert connections
    assert all(edge["relationshipStatus"] == "source_backed" for edge in connections)
    assert all(edge["reviewedContractRelationship"] is True for edge in connections)
    assert all(edge["learnerExplanation"] for edge in connections)
    assert all(edge["sequenceApproved"] is False for edge in connections)
    assert any(edge["toName"] == "Jupyter" and edge["relationshipType"] == "complements" for edge in connections)


def test_casevo_domain_explanation_defines_specialist_terms_for_a_new_learner():
    raw_domain_item = next(item for item in d078_guided_content()["domainItems"] if item["itemKey"] == "d078-casevo-tool")
    assert raw_domain_item["requirementScope"]["lane"] == "unapproved"
    assert raw_domain_item not in d078_domain_context_items()
    casevo = raw_domain_item
    economics_casevo = next(item for item in d078_area_context_items("D078:economics-applied-analysis") if "casevo" in item["itemKey"].casefold())
    assert economics_casevo["contextLevel"] == "subgroup"
    meaning = casevo["plainMeaning"].casefold()
    assert "agent" in meaning and "follows rules written by the researcher" in meaning
    assert "network is a map" in meaning
    assert "llm, an ai system that generates text from prompts" in meaning
    assert "not evidence of what real people did" in meaning
    assert "does not replace interviews, surveys, observation" in meaning
    assert casevo["prerequisites"]
    assert all("abm" not in note.casefold() and len(note.split()) >= 12 for note in casevo["prerequisites"])
    api_edge = next(edge for edge in casevo["relationships"] if "ai text-generation service" in edge["toName"].casefold())
    assert "api" in api_edge["learnerExplanation"].casefold()
    assert "outside ai provider" in api_edge["learnerExplanation"].casefold()


def test_selected_d078_role_route_inherits_only_its_area_owned_reviewed_tool_options():
    sociology_tools = d078_area_tool_options("D078:sociology-social-anthropology")
    geography_tools = d078_area_tool_options("D078:human-geography-population")
    assert sociology_tools and geography_tools
    assert all(item["contextLevel"] == "subgroup" and item["guidanceOwner"] == "subgroup" for item in sociology_tools + geography_tools)
    assert all(item["claimReviewState"] == "approved" and item["linkUrl"].startswith("https://") for item in sociology_tools + geography_tools)
    assert {item["name"] for item in geography_tools} >= {"GeoDa", "GeoPandas", "PySAL esda"}
    assert not d078_area_tool_options("D078:retired-legacy-area")


def test_every_reconciled_d078_role_has_five_distinct_optional_source_linked_tool_choices():
    artifact = json.loads((Path(__file__).resolve().parents[2] / "data/career-mapping/_audit/D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json").read_text(encoding="utf-8"))
    roles = sorted({row["role_name"] for row in artifact["routes"]})
    assert len(roles) == 19
    for role in roles:
        items = d078_role_context_items(f"D078|{role}")
        tools = [item for item in items if item["itemType"] == "tool"]
        assert len(tools) >= 5
        assert len({item["canonicalToolId"] for item in tools}) >= 5
        for item in tools:
            assert item["requirementLevel"] == "optional"
            assert item["guidanceOwner"] == item["contextLevel"] == "role"
            assert item["programmeContext"] and item["domainContext"] and item["areaContext"] and item["roleContext"]
            assert "Sociology programme" in item["programmeContext"]
            assert "not presented as something taught in your Sociology courses" in item["programmeContext"]
            assert "human interpretation" in item["domainContext"]
            assert not item["areaContext"].startswith("Route-specific use across:")
            assert role.casefold() in item["roleContext"].casefold()
            assert item["roleContext"] != item["contextualUse"]
            assert item["claimReviewState"] == "approved" and item["linkUrl"].startswith("https://")
            assert item["plainMeaning"] and item["contextualUse"] and item["expectedOutput"]
            assert "For example, you might use" in item["contextualUse"]
            assert "small, documented example" in item["expectedOutput"]
            assert "work product that supports" not in item["expectedOutput"].casefold()
            assert item["name"] in item["expectedOutput"]
            assert item["prerequisites"] and item["validAlternatives"] and item["evidenceLimitations"]
            assert item["linkEvidence"]["why_this_resource"]
            assert any(edge["relationshipType"] == "supports" and edge.get("toItemKey", "").startswith("role-task:d078:") for edge in item["relationships"])
            assert all(edge["relationshipType"] in {"supports", "alternative"} for edge in item["relationships"])
            assert all(edge.get("toItemKey") and edge["learnerExplanation"] for edge in item["relationships"])
            assert all(edge["sequenceApproved"] is False for edge in item["relationships"])


def test_requirement_lanes_do_not_infer_compulsory_status_from_item_type_or_legacy_priority():
    data = d078_guided_content()
    domain = data["domainItems"]
    area = [item for rows in data["areaItems"].values() for item in rows]
    roles = [item for owner in _d078_role_items_by_owner() for item in d078_role_context_items(owner)]

    # The reconciled D078 handoff makes the three shared foundations the
    # compulsory domain spine; later route additions remain non-blocking.
    shared_keys = {"d078-research-question-design", "d078-evaluate-evidence-and-limits", "d078-communicate-evidence"}
    shared = [item for item in domain if item["itemKey"] in shared_keys]
    assert shared and all(item["requirementLevel"] == "needed" for item in shared)
    non_foundation_domain = [item for item in domain if item not in shared]
    assert all(item["requirementLevel"] in {"useful", "optional"} for item in non_foundation_domain + area + roles)

    # The same item type can appear in either area lane; item type alone does
    # not decide whether the learner should treat it as optional.
    assert any(item["itemType"] == "tool" and item["requirementLevel"] == "useful" for item in area)
    assert any(item["itemType"] == "method" and item["requirementLevel"] == "optional" for item in area)

    # Role `essential` snapshots are historical priority labels, not proof of
    # a universal or route-compulsory learning requirement.
    assert all("marks this as essential" not in item.get("requirementReason", "") for item in roles)
    assert all(item["requirementLevel"] != "needed" for item in roles)


def test_three_approved_sequence_relationships_are_attached_with_route_scope_without_auto_add():
    data = d078_guided_content()
    items = data["domainItems"] + [item for rows in data["areaItems"].values() for item in rows]
    sequence_edges = [
        (item, edge)
        for item in items
        for edge in item.get("relationships", [])
        if edge.get("sequencePolicy") == "conditional_prerequisite"
    ]
    assert len(sequence_edges) == 3
    assert all(item["requirementLevel"] != "needed" for item, _ in sequence_edges)
    assert all(edge["sequenceApproved"] is True for _, edge in sequence_edges)
    assert all(edge["sequenceScope"]["areaIds"] == ["D078:economics-applied-analysis"] for _, edge in sequence_edges)
    assert all(edge["sequenceCondition"] and edge["learnerExplanation"] for _, edge in sequence_edges)
    assert all(edge["sourceReferences"] and all(ref["url"].startswith("https://") for ref in edge["sourceReferences"]) for _, edge in sequence_edges)


def test_d078_seed_persists_exactly_three_source_backed_conditional_sequence_edges():
    edges = sequence_relationships(d078_seed_records())
    assert len(edges) == 3
    assert all(edge["sequence_approved"] is True for edge in edges)
    assert all(edge["context_level"] == "subgroup" for edge in edges)
    assert all(edge["context_key"] == "D078:economics-applied-analysis" for edge in edges)
    assert all(edge["sequence_scope"]["areaIds"] == [edge["context_key"]] for edge in edges)
    assert all(edge["sequence_scope"]["domainIds"] == ["D078"] for edge in edges)
    assert all(edge["sequence_condition"] and edge["learner_explanation"] for edge in edges)
    assert all(edge["source_references"] and all(ref["url"].startswith("https://") for ref in edge["source_references"]) for edge in edges)


def test_role_tool_graph_integration_is_complete_optional_and_deduplicated():
    root = Path(__file__).resolve().parents[2]
    graph = json.loads((root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json").read_text(encoding="utf-8-sig"))
    integration = graph["role_tool_integration"]
    edges = [edge for edge in graph["edges"] if edge.get("relationship") == "role_to_tool_option"]
    assert integration["role_count"] == 19
    assert integration["role_tool_route_count"] == len(edges) == 95
    assert integration["distinct_canonical_tools"] == 28
    assert integration["role_task_context_nodes"] == 19
    assert integration["explicit_relationship_edges"]["tool_supports_role_task"] == 95
    assert all(edge["status"] == "approved_optional_route_tool" and edge["student_visible"] is True for edge in edges)
    assert all(edge["sequence_approved"] is False and edge["route_context"]["requirement_level"] == "optional" for edge in edges)
    assert len({(edge["source"], edge["target"]) for edge in edges}) == len(edges)
    task_edges = [edge for edge in graph["edges"] if edge.get("relationship") == "tool_supports_role_task"]
    alternative_edges = [edge for edge in graph["edges"] if edge.get("relationship") == "tool_alternative_for_role_task"]
    node_ids = {node["id"] for node in graph["nodes"]}
    assert len(task_edges) == 95 and all(edge["target"] in node_ids and edge["source"] in node_ids for edge in task_edges)
    assert alternative_edges and all(edge["target"] in node_ids and edge["source"] in node_ids for edge in alternative_edges)
    assert all(edge["sequence_approved"] is False and edge["student_visible"] is True for edge in task_edges + alternative_edges)
    role_tools = d078_role_context_items("D078|geographer")
    inherited_area_tools = d078_area_tool_options("D078:human-geography-population", {
        item["canonicalToolId"] for item in role_tools if item["itemType"] == "tool"
    })
    assert not {item.get("canonicalToolId") for item in inherited_area_tools} & {
        item["canonicalToolId"] for item in role_tools if item["itemType"] == "tool"
    }


def test_political_science_report_is_not_misrepresented_as_a_general_d078_learning_link():
    data = d078_guided_content()
    visible_sources = [source for item in data["domainItems"] for source in item["sourceReferences"]]
    assert not any("rethinking political science education" in str(source.get("title") or "").casefold() for source in visible_sources)
    # It remains in claim-level provenance for staff review; it is simply not
    # presented as a general Social Sciences learning resource to learners.
    audit_claim_sources = [
        source
        for item in data["domainItems"]
        for claim in item["claimEvidence"]["claims"].values()
        for source in claim.get("source_references", [])
    ]
    assert any("rethinking political science education" in str(source.get("title") or "").casefold() for source in audit_claim_sources)


def test_guidance_items_are_an_explicit_scoped_tranche_not_whole_graph_approval():
    data = d078_guided_content()
    assert data["approvedCount"] == 203
    assert len(data["domainItems"]) == 53
    assert sum(len(rows) for rows in data["areaItems"].values()) == 150
    assert set(data["areaItems"]) == {
        "D078:human-geography-population",
        "D078:social-research-evaluation",
        "D078:computational-digital-social-science",
        "D078:economics-applied-analysis",
        "D078:sociology-social-anthropology",
        "D078:politics-governance-public-policy",
        "D078:psychology-social-behaviour",
    }


def test_researched_area_tools_are_individual_optional_task_linked_contracts():
    data = d078_guided_content()
    options = [
        item
        for rows in data["areaItems"].values()
        for item in rows
        if item["itemKey"].startswith(("D078-HG-TOOL-", "D078-A04-TOOL-"))
    ]
    expected = {
        "D078-HG-TOOL-GEODA", "D078-HG-TOOL-GEOPANDAS",
        "D078-HG-TOOL-PYSAL-ESDA", "D078-HG-TOOL-ARCGIS-SPATIAL-ANALYST",
        "D078-A04-TOOL-NVIVO", "D078-A04-TOOL-TAGUETTE", "D078-A04-TOOL-R",
        "D078-A04-TOOL-PYTHON", "D078-A04-TOOL-SPSS", "D078-A04-TOOL-STATA",
        "D078-A04-TOOL-LIMESURVEY", "D078-A04-TOOL-PSYTOOLKIT",
        "D078-A04-TOOL-PSYCHOPY", "D078-A04-TOOL-OPENSESAME",
    }
    assert {item["itemKey"] for item in options} == expected
    assert len(options) == 14
    for item in options:
        assert item["itemType"] == "tool"
        assert item["requirementLevel"] == "optional"
        assert item["useCaseKey"]
        assert item["plainMeaning"] and item["contextualUse"] and item["expectedOutput"]
        assert item["prerequisites"] and item["relationships"] and item["evidenceLimitations"]
        assert item["linkUrl"].startswith("https://")
        assert item["linkEvidence"]["why_this_resource"]
        assert any(ref.get("url", "").startswith("https://") for ref in item["sourceReferences"])
    psycho = next(item for item in options if item["itemKey"] == "D078-A04-TOOL-PSYCHOPY")
    opensesame = next(item for item in options if item["itemKey"] == "D078-A04-TOOL-OPENSESAME")
    assert any(edge["relationshipType"] == "alternative" and edge["toItemKey"] == opensesame["itemKey"] for edge in psycho["relationships"])
    assert any(edge["relationshipType"] == "alternative" and edge["toItemKey"] == psycho["itemKey"] for edge in opensesame["relationships"])
    assert all(edge["sequenceApproved"] is False for item in options for edge in item["relationships"])


def test_researched_area_tools_are_integrated_into_current_hidden_graph():
    root = Path(__file__).resolve().parents[2]
    graph_path = root / "data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json"
    graph = json.loads(graph_path.read_text(encoding="utf-8"))
    options = [node for node in graph["nodes"] if node.get("kind") == "area_tool_option"]
    assert len(options) == 14
    option_ids = {node["id"] for node in options}
    assert all(not node.get("student_visible") and not node.get("sequence_approved") for node in options)
    assert all(node.get("source_record", {}).get("linkUrl", "").startswith("https://") for node in options)
    assert all(any(edge.get("target") == node["id"] and edge.get("relationship") == "area_to_tool_option" for edge in graph["edges"]) for node in options)
    assert all(any(edge.get("target") == node["id"] and edge.get("relationship") == "supports" for edge in graph["edges"]) for node in options)
    route_edges = [edge for edge in graph["edges"] if edge.get("relationship") == "area_tool_option_carried_into_role_view"]
    assert route_edges
    assert all(edge.get("display_only") is True and edge.get("sequence_approved") is False and not edge.get("student_visible") for edge in route_edges)
    tool_area_by_id = {node["id"]: node["area_id"] for node in options}
    area_node_by_key = {node.get("area_id"): node["id"] for node in graph["nodes"] if node.get("kind") == "area_of_specialization"}
    assert all(tool_area_by_id[edge["source"]] == edge["selected_area_id"] for edge in route_edges)
    assert all(any(route.get("source") == area_node_by_key[edge["selected_area_id"]] and route.get("target") == edge["target"] and route.get("relationship") == "area_to_role" for route in graph["edges"]) for edge in route_edges)
    assert graph["area_tool_option_integration"]["area_count_unchanged"] == 7
    assert graph["area_tool_option_integration"]["selected_area_role_view_edges_are_display_only"] is True
    assert graph["student_visible"] is False
    assert not any(edge.get("sequence_approved") for edge in graph["edges"] if edge.get("target") in option_ids)


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
    assert statuses.count("approved") == 197
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
    assert gate["current_master"]["runtime_approved_items"] == 203
    assert gate["current_master"]["domain_decisions"] == {"approved": 53, "unapproved": 1}
    assert gate["current_master"]["area_decisions"] == {"approved": 144}
    assert gate["student_verification_checks"]["domain_runtime_contains_only_finally_approved_items"] is True
    assert gate["checks"]["approved_runtime_content_contracts_passed"] is True
    assert gate["checks"]["all_item_dispositions_final"] is True
    assert gate["student_verification_ready"] is True
    assert gate["student_verification_checks"]["learning_items_remain_unreleased"] is True
    assert gate["student_verification_checks"]["complete_route_inventory"] is True
    assert gate["student_verification_checks"]["role_handoff_fully_dispositioned_without_reopening_fit"] is True
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
