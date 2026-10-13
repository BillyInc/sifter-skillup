import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_role_domain_and_role_specialization_are_independent_unverified_checks():
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    roles = inventory["role_mappings"]
    reviewed_keys = {
        row["role_key"]
        for row in read_json(AUDIT / "role_taxonomy_fit_review_2026_10_05.json")["role_reviews"]
    }
    current_role_domain_reviewed_keys = set()
    for row in read_json(AUDIT / "role_domain_link_reconciliation_2026_10_06.json")["changes"]:
        if row.get("excluded_current_link") and row.get("role_key"):
            current_role_domain_reviewed_keys.add(row["role_key"])
        if row.get("action") == "reclassify_exact" and row.get("target_status") == "added" and row.get("target_key"):
            current_role_domain_reviewed_keys.add(row["target_key"])
    # The 2026-10-06 role-domain reconciliation added 45 explicit target
    # links; the current merged source inventory therefore contains 3,964
    # mappings. The role/subgroup and role/domain fit assertions remain
    # independent of this count.
    assert len(roles) == 3964
    assert all(row["isco_membership_is_not_domain_fit_proof"] for row in roles)
    assert all(row["current_specialization_membership_is_not_domain_fit_proof"] for row in roles)
    assert all(row["isco_membership_is_not_specialization_fit_proof"] for row in roles)
    for row in roles:
        if row["role_key"] in reviewed_keys or row["role_key"] in current_role_domain_reviewed_keys:
            if row["role_key"] in current_role_domain_reviewed_keys:
                assert row["role_to_domain_fit_status"] != "not_individually_reviewed"
            if row["role_key"] in reviewed_keys:
                assert row["role_to_specialization_fit_status"] != "not_individually_reviewed"
        elif row["role_key"] not in reviewed_keys:
            assert row["role_to_specialization_fit_status"] == "not_individually_reviewed"


def test_d121_source_review_does_not_claim_role_assignments_or_academic_signoff():
    decision = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d121 = next(row for row in decision["domain_reviews"] if row["domain_id"] == "D121")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d121_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D121")

    assert d121["current_subgroup_record_count"] == 13
    assert d121["specialization_count"] == 5
    assert len(d121["specializations"]) == 5
    assert d121["external_academic_signoff_status"] == "not_obtained"
    assert "role" in " ".join(d121["boundary_notes"]).casefold()
    assert d121_inventory["visible_subgroup_count"] <= 13
    assert sum(
        row.get("data_state") != "excluded"
        for row in d121_inventory["all_subgroup_records"]
    ) == d121_inventory["visible_subgroup_count"]
    assert d121_inventory["reviewed_specialization_count_recommendation"] == 5
    assert d121_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"


def test_d001_specialization_recommendation_keeps_cross_domain_and_role_boundaries():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d001 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D001")
    assert d001["current_subgroup_record_count"] == 1
    assert d001["current_visible_specialization_count"] == 0
    assert d001["specialization_count"] == 6
    assert len(d001["specializations"]) == 6
    assert d001["external_academic_signoff_status"] == "not_obtained"
    assert "does not approve any of the 37 current role mappings" in " ".join(d001["boundary_notes"])
    assert any(row["source_id"] == "IEEE_SWEBOK_V4_TOPICS" for row in register["evidence_register"])


def test_d002_recommendation_is_data_scope_grounded_and_does_not_assign_roles():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d002 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D002")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d002_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D002")

    assert d002["current_subgroup_record_count"] == 1
    assert d002["current_visible_specialization_count"] == 0
    assert d002["specialization_count"] == 4
    assert len(d002["specializations"]) == 4
    assert d002["external_academic_signoff_status"] == "not_obtained"
    assert "does not approve any of the 25 current D002 role-to-domain mappings" in " ".join(d002["boundary_notes"])
    assert d002_inventory["reviewed_specialization_count_recommendation"] == 4
    assert d002_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
    assert {row["source_id"] for row in register["evidence_register"]} >= {
        "DAMA_DMBOK2R_DATA_MANAGEMENT_AREAS",
        "ACM_AIS_IS2020_DATA_INFORMATION_COMPETENCIES",
        "ACM_CSE_DATA_MANAGEMENT_KU_BETA_2023",
    }


def test_d085_specialization_set_is_source_grounded_without_inheriting_isco_role_fit():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d085 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D085")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d085_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D085")

    assert d085["current_subgroup_record_count"] == 1
    assert d085["current_visible_specialization_count"] == 0
    assert d085["specialization_count"] == 3
    assert {row["key"] for row in d085["specializations"]} == {
        "retail-sales-and-customer-experience",
        "retail-merchandising-and-category-management",
        "retail-store-and-omnichannel-operations",
    }
    assert d085["external_academic_signoff_status"] == "not_obtained"
    assert "does not approve any of the 70 current D085 role-to-domain mappings" in " ".join(d085["boundary_notes"])
    assert d085_inventory["reviewed_specialization_count_recommendation"] == 3
    assert d085_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
    source_ids = {source["source_id"] for source in register["evidence_register"]}
    assert {
        "APQC_RETAIL_PCF_611",
        "WORLDSKILLS_RETAIL_SALES_AND_WSOS",
        "ILO_COMMERCE_SECTOR_OVERVIEW",
    } <= source_ids


def test_d086_gaming_specializations_are_product_contexts_not_isco_buckets_or_role_approval():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d086 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D086")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d086_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D086")

    assert d086["current_subgroup_record_count"] == 4
    assert d086["current_visible_specialization_count"] == 4
    assert d086["specialization_count"] == 4
    assert {row["key"] for row in d086["specializations"]} == {
        "casino-and-venue-gaming-operations",
        "betting-and-wagering-operations",
        "lottery-bingo-and-draw-based-operations",
        "gaming-products-and-systems",
    }
    assert d086["external_academic_signoff_status"] == "not_obtained"
    assert "all 13 current d086 role-to-domain links" in " ".join(d086["criteria_disposition"].values()).casefold()
    assert d086_inventory["reviewed_specialization_count_recommendation"] == 4
    assert d086_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
    source_ids = {source["source_id"] for source in register["evidence_register"]}
    assert {"WLA_SECURITY_CONTROL_STANDARD_2024", "GLI_GLOBAL_GAMING_STANDARDS_CATALOGUE"} <= source_ids


def test_d113_recommendation_separates_materials_and_steam_plant_curricula():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d113 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D113")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d113_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D113")

    assert d113["current_subgroup_record_count"] == 2
    assert d113["current_visible_specialization_count"] == 0
    assert d113["specialization_count"] == 3
    assert len(d113["specializations"]) == 3
    assert d113["external_academic_signoff_status"] == "not_obtained"
    assert "does not approve any current D113 role" in " ".join(d113["boundary_notes"])
    assert d113_inventory["reviewed_specialization_count_recommendation"] == 3
    assert d113_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
    assert any(row["source_id"] == "ASME_BOILER_FIRED_EQUIPMENT_OPERATION_MAINTENANCE" for row in register["evidence_register"])


def test_d114_and_d115_sets_follow_domain_scope_and_do_not_approve_role_links():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    reviews = {row["domain_id"]: row for row in register["domain_reviews"]}
    expected = {"D114": 2, "D115": 2}
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    domains = {row["domain_id"]: row for row in inventory["domains"]}

    for domain_id, count in expected.items():
        review = reviews[domain_id]
        assert review["specialization_count"] == count
        assert len(review["specializations"]) == count
        assert review["external_academic_signoff_status"] == "not_obtained"
        assert review["current_visible_specialization_count"] == 0
        assert domains[domain_id]["reviewed_specialization_count_recommendation"] == count
        assert domains[domain_id]["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
        assert "current" in " ".join(review["boundary_notes"])

    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {"JHU_MECHANIZED_ASSEMBLY_COURSE", "RUTGERS_PACKAGING_ENGINEERING_CURRICULUM"} <= sources
    assert {"EU_ROAD_GOODS_PASSENGER_DRIVER_QUALIFICATION", "FMCSA_ENTRY_LEVEL_DRIVER_TRAINING_RULE"} <= sources


def test_d118_includes_crop_protection_confirmed_by_nigerian_curricula():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d118 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D118")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d118_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D118")

    assert d118["specialization_count"] == 3
    assert {row["key"] for row in d118["specializations"]} == {"crop-production", "crop-protection", "horticulture"}
    assert d118_inventory["reviewed_specialization_count_recommendation"] == 3
    source_ids = {source["source_id"] for source in register["evidence_register"]}
    assert {"NUC_AGRICULTURE_CCMAS_CROP_SCIENCE", "UNN_CROP_SCIENCE_UNDERGRAD_OPTIONS"} <= source_ids
    assert "does not approve any of the 23 current D118 role-to-domain mappings" in " ".join(d118["boundary_notes"])


def test_d119_animal_production_areas_are_source_grounded_and_roles_unassigned():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d119 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D119")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d119_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D119")

    assert d119["specialization_count"] == 5
    assert {row["key"] for row in d119["specializations"]} == {
        "poultry-production",
        "ruminant-and-dairy-production",
        "pig-and-rabbit-production",
        "equine-production-and-management",
        "apiculture-and-insect-production",
    }
    assert d119["external_academic_signoff_status"] == "not_obtained"
    assert d119_inventory["reviewed_specialization_count_recommendation"] == 5
    assert d119_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
    assert "separate role audit records each of the 20" in " ".join(d119["boundary_notes"])
    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "FAO_GLOBAL_FARMER_FIELD_SCHOOL_LIVESTOCK_SYSTEMS",
        "ILO_ISCO08_LIVESTOCK_TASK_SCOPE",
        "NUC_AGRICULTURE_CCMAS_ANIMAL_SCIENCE",
        "UNN_ANIMAL_SCIENCE_PRODUCTION_COURSES",
    } <= sources


def test_d119_role_fit_checkpoint_accounts_for_all_roles_and_separates_both_fit_decisions():
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d119 = next(row for row in inventory["domains"] if row["domain_id"] == "D119")
    expected = {
        row["role_key"].split("|", 1)[1]
        for row in inventory["role_mappings"]
        if row["domain_id"] == "D119"
        and row["role_key"] not in {
            item["role_key"]
            for item in read_json(AUDIT / "reclassified_role_route_gates_2026_10_06.json")["changes"]
        }
    }
    checkpoint = (AUDIT / "local_taxonomy_role_fit_lane_D113_D168_2026_10_03.md").read_text(encoding="utf-8")
    domain_block = checkpoint.split("## D119 — Livestock, Poultry and Dairy Production", 1)[1]
    section = domain_block.split("### Role audit:", 1)[1].split("### D119 corrections", 1)[0]
    rows = [line for line in section.splitlines() if line.startswith("|") and "|---" not in line]
    parsed = [[cell.strip() for cell in line.strip("|").split("|")] for line in rows[1:]]
    assert len(expected) == 20
    assert {row[0] for row in parsed} == expected
    assert all(len(row) == 4 and row[1] and row[2] and row[3] for row in parsed)
    assert "**10** are supported" in domain_block
    assert "**5** are conditional" in domain_block
    assert "**5** are out of scope" in domain_block


def test_d119_fit_ledger_has_exact_role_coverage_and_separate_domain_specialization_statuses():
    ledger = read_json(AUDIT / "role_taxonomy_fit_review_2026_10_05.json")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    actual = {
        row["role_key"]: row
        for row in ledger["role_reviews"]
        if row["role_key"].startswith("D119|")
    }
    expected = {
        row["role_key"]
        for row in inventory["role_mappings"]
        if row["domain_id"] == "D119"
        and row["role_key"] not in {
            item["role_key"]
            for item in read_json(AUDIT / "reclassified_role_route_gates_2026_10_06.json")["changes"]
        }
    }
    assert len(actual) == 20
    assert set(actual) == expected
    assert sum(row["domain_fit_status"] == "supported" for row in actual.values()) == 10
    assert sum(row["domain_fit_status"] == "conditional" for row in actual.values()) == 5
    assert sum(row["domain_fit_status"] == "not_supported" for row in actual.values()) == 5
    assert all(row["basis"].strip() and row["source_refs"] for row in actual.values())
    assert all(row["specialization_fit_status"] for row in actual.values())
    assert {"FAO_GLOBAL_FARMER_FIELD_SCHOOL_LIVESTOCK_SYSTEMS", "ILO_ISCO08_LIVESTOCK_TASK_SCOPE"} <= set(ledger["source_refs"])
    checkpoint = (AUDIT / "local_taxonomy_role_fit_lane_D113_D168_2026_10_03.md").read_text(encoding="utf-8")
    domain_block = checkpoint.split("## D119 — Livestock, Poultry and Dairy Production", 1)[1]
    assert "dairy processing technician" in domain_block
    assert "fur animals breeder" in domain_block


def test_d120_fisheries_areas_use_nigerian_curriculum_and_do_not_approve_roles():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d120 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D120")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d120_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D120")

    assert d120["specialization_count"] == 6
    assert len(d120["specializations"]) == 6
    assert d120["external_academic_signoff_status"] == "not_obtained"
    assert d120_inventory["reviewed_specialization_count_recommendation"] == 6
    assert d120_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
    assert "does not approve any of the 20 current D120 role-to-domain mappings" in " ".join(d120["boundary_notes"])
    source_ids = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "NUC_AGRICULTURE_CCMAS_FISHERIES",
        "OAUSTECH_FISHERIES_POSTGRAD_SPECIALIZATIONS",
        "UDUS_FISHERIES_UNDERGRAD_CURRICULUM",
        "FAO_CODE_FISH_FISHERY_PRODUCTS_AQUACULTURE",
    } <= source_ids
    assert "must not be presented as six compulsory undergraduate majors" in " ".join(d120["uncertainties"])


def test_d122_laboratory_specializations_use_global_scope_with_nigerian_context():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d122 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D122")
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d122_inventory = next(row for row in inventory["domains"] if row["domain_id"] == "D122")

    assert d122["specialization_count"] == 6
    assert {row["key"] for row in d122["specializations"]} == {
        "clinical-chemistry-and-chemical-pathology",
        "haematology-and-transfusion-science",
        "medical-microbiology-and-parasitology",
        "histopathology-and-cytology",
        "immunology-and-serology",
        "molecular-diagnostics-and-genetics",
    }
    assert d122["external_academic_signoff_status"] == "not_obtained"
    assert d122["root_label_recommendation"]["recommended_student_facing_label"] == "Medical Laboratory Science"
    assert d122_inventory["reviewed_specialization_count_recommendation"] == 6
    assert d122_inventory["specialization_implementation_status"] == "pending_independent_specialization_ids_and_generator_support"
    assert "does not approve any of the 20 current D122 role-to-domain mappings" in " ".join(d122["boundary_notes"])
    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "IFCC_LABORATORY_MEDICINE_CURRICULUM_PHASE1",
        "WHO_PATHOLOGY_LAB_MEDICINE_SCOPE",
        "MLSCN_FOREIGN_GRADUATE_GUIDELINES_CORE_DISCIPLINES",
        "UNN_MEDICAL_LAB_SCIENCE_SPECIALIZATION",
        "OOU_BMLS_CORE_DISCIPLINES",
        "ELIZADE_BMLS_DISCIPLINES",
    } <= sources
    assert "global domain taxonomy" in d122["geographic_scope_note"].lower()
    assert "do not set the global structure" in d122["decision"]


def test_specialization_decisions_are_source_traceable_and_not_misrepresented_as_approval():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    method = register["audit_method"]
    criteria = {row["id"] for row in method["decision_criteria"]}
    assert criteria == {
        "S1_PARENT_DOMAIN_FIT",
        "S2_RECOGNIZED_AREA",
        "S3_DISTINCT_BOUNDARIES",
        "S4_SET_COVERAGE_AND_COUNT",
        "S5_STUDENT_FACING_CLARITY",
        "S6_ROLE_SEPARATION",
    }

    sources = {row["source_id"]: row for row in register["evidence_register"]}
    assert len(sources) == len(register["evidence_register"])
    for source in sources.values():
        for field in ("publisher", "source_type", "title", "url", "access_date", "locator", "claim_supported", "claim_limit"):
            assert source[field].strip(), f"Missing {field} for {source.get('source_id')}"

    assert register["external_academic_signoff"].startswith("not_requested_or_obtained")
    for decision in register["domain_reviews"]:
        assert set(decision["criteria_disposition"]) == criteria
        assert decision["external_academic_signoff_status"] == "not_obtained"
        used_sources = {
            source_id
            for specialization in decision["specializations"]
            for source_id in specialization["source_ids"]
        }
        if not decision["specializations"]:
            used_sources.update(decision.get("scope_review_source_ids", []))
        assert used_sources <= sources.keys()
        assert len({sources[source_id]["url"] for source_id in used_sources}) >= 2
        for specialization in decision["specializations"]:
            assert specialization["key"].strip()
            assert specialization["label"].strip()
            assert specialization["description"].strip()
            assert specialization["source_support"].strip()
            assert specialization["sources"]
            assert set(specialization["source_ids"]) <= sources.keys()


def test_recent_agriculture_and_health_reviews_are_not_nigeria_only():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    reviews = {row["domain_id"]: row for row in register["domain_reviews"]}
    global_sources = {
        "D118": {"FAO_GLOBAL_CROP_CLASSIFICATION_WCA2030", "IPPC_INTERNATIONAL_PLANT_HEALTH_STANDARDS"},
        "D119": {"FAO_GLOBAL_LIVESTOCK_SYSTEMS", "WOAH_TERRESTRIAL_PRODUCTION_SYSTEMS"},
        "D120": {"FAO_AQUACULTURE_TRAINING_CURRICULUM", "FAO_CODE_FISH_FISHERY_PRODUCTS_AQUACULTURE"},
        "D122": {"IFCC_LABORATORY_MEDICINE_CURRICULUM_PHASE1", "WHO_PATHOLOGY_LAB_MEDICINE_SCOPE"},
        "D123": {"ASRT_MEDICAL_IMAGING_PRACTICE_STANDARDS_2025", "EFRS_EUROPEAN_RADIOGRAPHER_PRACTICE_SCOPE"},
    }
    for domain_id, required_sources in global_sources.items():
        review = reviews[domain_id]
        assert "global domain taxonomy" in review["geographic_scope_note"].lower()
        cited = {source_id for spec in review["specializations"] for source_id in spec["source_ids"]}
        assert required_sources <= cited

    assert "Nigeria-specific" in reviews["D118"]["geographic_scope_note"]
    assert "Nigeria-specific" in reviews["D119"]["geographic_scope_note"]
    assert "Nigeria-specific" in reviews["D120"]["geographic_scope_note"]


def test_d116_role_fit_checkpoint_covers_each_role_and_keeps_both_fit_decisions_separate():
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d116 = next(row for row in inventory["domains"] if row["domain_id"] == "D116")
    expected = {
        row["role_key"].split("|", 1)[1]
        for row in inventory["role_mappings"]
        if row["domain_id"] == "D116"
    }
    checkpoint = (AUDIT / "local_taxonomy_role_fit_lane_D113_D168_2026_10_03.md").read_text(encoding="utf-8")
    section = checkpoint.split("### Individual role audit", 1)[1].split("### Required correction", 1)[0]
    rows = [line for line in section.splitlines() if line.startswith("|") and "|---" not in line]
    role_rows = rows[1:]
    parsed = [line.strip("|").split("|") for line in role_rows]
    parsed = [[cell.strip() for cell in row] for row in parsed]
    actual = {row[0] for row in parsed}

    assert len(expected) == 20
    assert actual == expected
    assert all(len(row) == 4 for row in parsed)
    assert all(row[1] and row[2] and row[3] for row in parsed)
    assert all("supported" in row[1].lower() or "not supported" in row[1].lower() or "provisional" in row[1].lower() for row in parsed)


def test_d117_role_fit_checkpoint_accounts_for_all_roles_separately_from_isco_groups():
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d117 = next(row for row in inventory["domains"] if row["domain_id"] == "D117")
    expected = {
        key.split("|", 1)[1]
        for subgroup in d117["all_subgroup_records"]
        for key in subgroup["current_member_role_keys_unverified"]
    }
    checkpoint = (AUDIT / "local_taxonomy_role_fit_lane_D113_D168_2026_10_03.md").read_text(encoding="utf-8")
    domain_block = checkpoint.split("## D117 — Railway", 1)[1]
    section = checkpoint.split("### Individual role audit")[2].split("### Required correction", 1)[0]
    rows = [line for line in section.splitlines() if line.startswith("|") and "|---" not in line]
    parsed = [[cell.strip() for cell in line.strip("|").split("|")] for line in rows[1:]]

    # The semantic route correction keeps rail switchperson under D117 but
    # removes the unsupported subgroup path; it is now a direct domain→role
    # route rather than a member of the inherited ISCO subgroup.
    subgroup_rows = [row for row in parsed if row[0] != "rail switchperson"]
    assert len(expected) == 19
    assert {row[0] for row in subgroup_rows} == expected
    assert any(row[0] == "rail switchperson" and "direct domain" in row[1].casefold() for row in parsed)
    assert all(len(row) == 4 and row[1] and row[2] and row[3] for row in parsed)
    assert "not eight reviewed student specializations" in domain_block
    assert "candidate set of **four**" in domain_block
    assert "**10** fit the described railway operations/freight scope directly; **10** are conditional" in domain_block


def test_d118_role_fit_checkpoint_covers_all_crop_and_horticulture_roles():
    inventory = read_json(AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json")
    d118 = next(row for row in inventory["domains"] if row["domain_id"] == "D118")
    expected = {
        key.split("|", 1)[1]
        for subgroup in d118["all_subgroup_records"]
        for key in subgroup["current_member_role_keys_unverified"]
    }
    checkpoint = (AUDIT / "local_taxonomy_role_fit_lane_D113_D168_2026_10_03.md").read_text(encoding="utf-8")
    domain_block = checkpoint.split("## D118 — Crop Production and Horticulture", 1)[1]
    section = checkpoint.split("### Individual role audit")[3].split("### Required correction", 1)[0]
    rows = [line for line in section.splitlines() if line.startswith("|") and "|---" not in line]
    parsed = [[cell.strip() for cell in line.strip("|").split("|")] for line in rows[1:]]

    assert len(expected) == 23
    assert {row[0] for row in parsed} == expected
    assert all(len(row) == 4 and row[1] and row[2] and row[3] for row in parsed)
    assert "candidate set is **three** areas" in domain_block
    assert "**18** are supported" in domain_block
    assert "vineyard cellar master" in domain_block


def test_three_requested_domain_display_labels_are_canonical():
    meta = read_json(ROOT / "domain_meta.json")
    assert meta["D086"]["domain_name"] == "Gaming, Betting and Lottery Operations"
    assert meta["D108"]["domain_name"] == "Printing Technology, Pre-press and Print Finishing"
    assert meta["D113"]["domain_name"] == "Glass, Ceramics, Building Materials and Boiler Plant Operations"


def test_d087_specialization_recommendation_uses_global_task_sources_without_approving_roles():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d087 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D087")
    assert d087["specialization_count"] == 3
    assert {row["key"] for row in d087["specializations"]} == {
        "barbering-and-facial-hair-grooming",
        "haircutting-styling-and-colour-services",
        "wigs-extensions-and-hair-replacement",
    }
    assert d087["external_academic_signoff_status"] == "not_obtained"
    assert "No role is approved" in d087["criteria_disposition"]["S6_ROLE_SEPARATION"]
    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "WORLDSKILLS_HAIRDRESSING_WS2024",
        "ONET_BARBERS_39_5011",
        "UK_NOS_HAIR_COLOUR_LIGHTEN_SKAHDBR5",
        "UK_NOS_PERFORMER_WIGS_EXTENSIONS_SKSHWMP10",
    } <= sources


def test_d088_specialization_recommendation_distinguishes_beauty_practice_areas_and_keeps_role_review_separate():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d088 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D088")
    assert d088["specialization_count"] == 6
    assert len({row["key"] for row in d088["specializations"]}) == 6
    assert d088["external_academic_signoff_status"] == "not_obtained"
    assert "All 12 D088 role-to-domain links must first be reviewed" in d088["criteria_disposition"]["S6_ROLE_SEPARATION"]
    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "WORLDSKILLS_BEAUTY_THERAPY_WS2024",
        "CIDESCO_INTERNATIONAL_QUALIFICATION_PORTFOLIO",
        "CIDESCO_SPA_THERAPY_DIPLOMA",
        "UK_NOS_FACIAL_SKINCARE_SKABBR2",
        "UK_NOS_BODY_MASSAGE_SKABT16",
    } <= sources


def test_d089_specialization_recommendation_covers_funeral_mortuary_and_disposition_functions():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d089 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D089")
    assert d089["specialization_count"] == 3
    assert {row["key"] for row in d089["specializations"]} == {
        "funeral-arrangement-and-ceremony-direction",
        "mortuary-care-embalming-and-restorative-presentation",
        "cemetery-crematory-and-disposition-operations",
    }
    assert d089["external_academic_signoff_status"] == "not_obtained"
    assert "All four D089 role-to-domain links must first be assessed" in d089["criteria_disposition"]["S6_ROLE_SEPARATION"]
    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "FIAT_IFTA_GLOBAL_FUNERAL_PROFESSION",
        "SKILLS_ENGLAND_FUNERAL_DIRECTOR_OCC0584",
        "SKILLS_ENGLAND_EMBALMER_OCC0890",
        "ABFSE_FUNERAL_SERVICE_EDUCATION_SCOPE",
        "ICCFA_CREMATION_GUIDELINES",
    } <= sources


def test_d090_specialization_recommendation_flags_parent_scope_and_does_not_validate_roles():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d090 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D090")
    assert d090["specialization_count"] == 4
    assert len({row["key"] for row in d090["specializations"]}) == 4
    assert d090["external_academic_signoff_status"] == "not_obtained"
    assert "All 15 D090 role-to-domain links must first be compared" in d090["criteria_disposition"]["S6_ROLE_SEPARATION"]
    assert any("no current parent-domain scope description" in note for note in d090["uncertainties"])
    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "AKC_NATIONAL_DOG_GROOMING_EDUCATIONAL_STANDARDS",
        "IAABC_JOINT_ANIMAL_TRAINING_STANDARDS",
        "EUROPEAN_ZOOKEEPER_COMPETENCY_FRAMEWORK",
        "GFAS_SANCTUARY_CARE_STANDARDS",
        "UK_NOS_GROOM_ANIMALS_LANANC19",
    } <= sources


def test_d091_specialization_set_separates_road_vehicle_instruction_and_flags_maritime_scope():
    register = read_json(AUDIT / "domain_specialization_review_2026_10_03.json")
    d091 = next(row for row in register["domain_reviews"] if row["domain_id"] == "D091")
    assert d091["current_subgroup_record_count"] == 2
    assert d091["specialization_count"] == 4
    assert {row["key"] for row in d091["specializations"]} == {
        "car-and-light-vehicle-instruction",
        "motorcycle-and-moped-rider-instruction",
        "commercial-goods-vehicle-instruction",
        "bus-coach-and-passenger-vehicle-instruction",
    }
    assert d091["external_academic_signoff_status"] == "not_obtained"
    assert "All six D091 role records" in d091["criteria_disposition"]["S6_ROLE_SEPARATION"]
    assert "vessel steering" in " ".join(d091["boundary_notes"]).casefold()
    sources = {row["source_id"] for row in register["evidence_register"]}
    assert {
        "UNECE_1968_ROAD_TRAFFIC_VEHICLE_CATEGORIES",
        "DVSA_NATIONAL_DRIVER_RIDER_TRAINING_STANDARD",
        "AU_TRAINING_GOV_MOTOR_VEHICLE_DRIVER_TRAINING_QUALIFICATION",
        "FMCSA_ENTRY_LEVEL_DRIVER_TRAINING_CDL_CLASSES",
        "DVSA_NATIONAL_STANDARDS_DRIVING_RIDING_COLLECTION",
        "IMO_STCW_INTERNATIONAL_SEAFARER_COMPETENCE",
    } <= sources
