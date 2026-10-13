import importlib.util
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUILDER_PATH = ROOT / "_build_jamb_curriculum_scopes.py"
SPEC = importlib.util.spec_from_file_location("jamb_scope_builder", BUILDER_PATH)
BUILDER = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(BUILDER)


def test_political_science_international_law_diplomacy_scope_is_explicit_and_held():
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override, = [
        entry
        for entry in override_doc["overrides"]
        if entry["jamb_name"] == "Political Science / International Law and Diplomacy"
    ]
    canonical = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )
    row = next(
        row
        for row in canonical["rows"]
        if row["jamb_name"] == override["jamb_name"]
    )

    selected = BUILDER.resolve_manual_scope_courses(
        override, row["component_refs"], BUILDER.source_registry()
    )

    assert [course["code"] for course in selected] == [
        "POL 205", "POL 309", "POL 405", "POL 406",
        "IRS 303", "IRS 304", "IRS 305",
    ]
    assert {course["source_ccmas_programme"] for course in selected} == {
        "Political Science", "International Relations"
    }
    assert all(course.get("content_summary") for course in selected)
    assert all(course.get("skills_learned") for course in selected)
    assert override["scope_status"] == "partial_scope_review_required"
    assert override["scope_approval"] == "pending_review"
    assert override["domain_links"] == []
    assert override["downstream_remapping"].startswith("deferred_")
    assert all(entry.get("url") and entry.get("locator") and entry.get("accessed_on") for entry in override["source_evidence"])


def test_manual_scope_override_rejects_undeclared_component():
    override = {
        "jamb_name": "test",
        "component_courses": [
            {"component_ref": "Social Sciences::Economics", "course_codes": ["ECO 101"]}
        ],
    }
    try:
        BUILDER.resolve_manual_scope_courses(
            override, ["Social Sciences::Political Science"], BUILDER.source_registry()
        )
    except ValueError as error:
        assert "not declared" in str(error)
    else:
        raise AssertionError("undeclared component was accepted")


def test_scope_builder_emits_manual_combined_scope_without_downstream_links(tmp_path, monkeypatch):
    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)

    BUILDER.main()

    generated = json.loads(output_path.read_text(encoding="utf-8"))
    row = next(
        row
        for row in generated["rows"]
        if row["jamb_name"] == "Political Science / International Law and Diplomacy"
    )
    assert row["scope_selection_method"] == "manual_ccmas_course_outcome_scope"
    assert row["scope_status"] == "partial_scope_review_required"
    assert row["scope_approval"] == "pending_review"
    assert row["source_context"]["institution_code"] == "BABCOCK"
    assert len(row["selected_courses"]) == 7
    assert all(course["scope_facet"] for course in row["selected_courses"])
    assert row["domain_links"] == []
    assert len(row["scope_evidence"]) == 3


def test_portuguese_english_uses_english_ccmas_plus_oau_portuguese_reference(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override = next(item for item in override_doc["overrides"] if item["jamb_name"] == "Portuguese/English")
    canonical = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )
    canonical_row = next(item for item in canonical["rows"] if item["jamb_name"] == "Portuguese/English")

    selected = BUILDER.resolve_manual_scope_courses(
        override, canonical_row["component_refs"], BUILDER.source_registry(), BUILDER.external_registry()
    )
    assert canonical_row["component_refs"] == [
        "Arts::English Language and Literature", "__custom__::Portuguese"
    ]
    assert [item["code"] for item in selected] == [
        "ENG 101", "ENG 102", "ENG 103", "ENG 201", "LIT 104", "LIT 105", "LIT 106",
        "PRT 101", "PRT 103", "PRT 105", "PRT 102", "PRT 106", "PRT 108", "PRT 110",
        "PRT 201", "PRT 203", "PRT 202", "PRT 204", "PRT 301", "PRT 303", "PRT 305",
        "PRT 307", "PRT 309", "PRT 311", "PRT 401", "PRT 403", "PRT 411", "PRT 402", "PRT 404"
    ]
    assert {item["source_ccmas_programme"] for item in selected if item.get("source_ccmas_programme")} == {"English Language and Literature"}
    assert {item["source_external_programme"] for item in selected if item.get("source_external_programme")} == {"Portuguese"}
    assert override["domain_links"] == []
    assert override["unrepresented_facets"] == []
    assert override["external_component_qualifications"][0]["status"] == "external_reference_not_lasu_schedule"
    assert all(source.get("url") and source.get("locator") and source.get("accessed_on") for source in override["source_evidence"])

    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(item for item in generated["rows"] if item["jamb_name"] == "Portuguese/English")
    assert scope["domain_links"] == []
    assert len(scope["selected_courses"]) == 29
    assert all(course["content_summary"] and course["learning_outcomes"] for course in scope["selected_courses"])
    assert scope["unrepresented_facets"] == []
    assert {course["source_external_programme"] for course in scope["selected_courses"] if course.get("source_external_programme")} == {"Portuguese"}


def test_insurance_actuarial_identity_keeps_both_ccmas_components_without_parent_link_inheritance():
    import importlib.util

    audit_path = ROOT / "_audit_ccmas_jamb_inheritance.py"
    spec = importlib.util.spec_from_file_location("jamb_inheritance_audit", audit_path)
    audit = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(audit)
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    secondary = audit.secondary_components()
    components, _ = audit.component_rows(
        mapping["mappings"], *audit.programme_registry(), secondary
    )
    row_components = components["Insurance and Actuarial Science"]
    assert {(item["discipline"], item["name"]) for item in row_components} == {
        ("Administration and Management", "Insurance"),
        ("Administration and Management", "Actuarial Science"),
    }

    canonical = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )
    row = next(item for item in canonical["rows"] if item["jamb_name"] == "Insurance and Actuarial Science")
    assert row["inheritance_type"] == "combined_ccmas_curriculum"
    assert row["mapping_status"] == "review_required"
    assert row["domain_links"] == []

    active = json.loads((ROOT / "jamb_domain_map.json").read_text(encoding="utf-8"))
    assert active["Insurance and Actuarial Science"]["links"] == []


def test_insurance_actuarial_scope_preserves_course_level_source_locators(tmp_path, monkeypatch):
    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)

    BUILDER.main()

    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(
        row for row in generated["rows"]
        if row["jamb_name"] == "Insurance and Actuarial Science"
    )
    assert len(scope["selected_courses"]) == 67
    assert scope["scope_status"] == "combined_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []

    actuarial_intro = next(
        course for course in scope["selected_courses"]
        if course["source_ccmas_programme"] == "Actuarial Science"
        and course["code"] == "ACS 101"
    )
    assert actuarial_intro["source_url"] == "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"
    assert "printed p. 58" in actuarial_intro["source_locator"]
    assert actuarial_intro["source_accessed_on"] == "2026-09-26"

    insurance_course = next(
        course for course in scope["selected_courses"]
        if course["source_ccmas_programme"] == "Insurance"
        and course["code"] == "INS 101"
    )
    assert insurance_course["source_url"] == "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"
    assert "printed pp. 307–330" in insurance_course["source_locator"]
    assert "INS 101 — Introduction to Insurance" in insurance_course["source_locator"]
    assert insurance_course["source_accessed_on"] == "2026-09-26"


def test_mathematics_with_computer_science_uses_both_full_ccmas_components_and_stays_held(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override = next(
        item for item in override_doc["overrides"]
        if item["jamb_name"] == "Mathematics with Computer Science"
    )

    audit_path = ROOT / "_audit_ccmas_jamb_inheritance.py"
    spec = importlib.util.spec_from_file_location("jamb_inheritance_audit_math_cs", audit_path)
    audit = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(audit)
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    components, _ = audit.component_rows(
        mapping["mappings"], *audit.programme_registry(), audit.secondary_components()
    )
    component_refs = {
        f"{item['discipline']}::{item['name']}"
        for item in components["Mathematics with Computer Science"]
    }
    assert component_refs == {"Sciences::Mathematics", "Computing::Computer Science"}

    selected = BUILDER.resolve_manual_scope_courses(
        override, sorted(component_refs), BUILDER.source_registry()
    )
    assert {item["source_ccmas_programme"] for item in selected} == {"Mathematics", "Computer Science"}
    assert len(selected) == 39 + 38
    assert {item["source_ccmas_file"] for item in selected} == {"sciences.json", "computing.json"}
    assert all(item.get("code") and item.get("title") for item in selected)
    assert override["scope_status"] == "combined_scope_review_required"
    assert override["scope_approval"] == "pending_review"
    assert override["domain_links"] == []
    assert all(source.get("url") and source.get("locator") and source.get("accessed_on") for source in override["source_evidence"])

    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(item for item in generated["rows"] if item["jamb_name"] == override["jamb_name"])
    assert len(scope["selected_courses"]) == 77
    assert scope["scope_status"] == "combined_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
    assert len(scope["selected_courses"]) == len(selected)


def test_industrial_mathematics_and_computer_science_uses_both_full_ccmas_components_and_stays_held(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override = next(
        item for item in override_doc["overrides"]
        if item["jamb_name"] == "Industrial Mathematics and Computer Science"
    )

    audit_path = ROOT / "_audit_ccmas_jamb_inheritance.py"
    spec = importlib.util.spec_from_file_location("jamb_inheritance_audit_industrial_math_cs", audit_path)
    audit = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(audit)
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    components, _ = audit.component_rows(
        mapping["mappings"], *audit.programme_registry(), audit.secondary_components()
    )
    component_refs = {
        f"{item['discipline']}::{item['name']}"
        for item in components[override["jamb_name"]]
    }
    assert component_refs == {
        "Sciences::Industrial Mathematics",
        "Computing::Computer Science",
    }

    selected = BUILDER.resolve_manual_scope_courses(
        override, sorted(component_refs), BUILDER.source_registry()
    )
    assert {item["source_ccmas_programme"] for item in selected} == {
        "Industrial Mathematics", "Computer Science"
    }
    assert len(selected) == 34 + 38
    assert {item["source_ccmas_file"] for item in selected} == {
        "sciences.json", "computing.json"
    }
    assert all(item.get("code") and item.get("title") for item in selected)
    assert override["scope_status"] == "combined_scope_review_required"
    assert override["scope_approval"] == "pending_review"
    assert override["domain_links"] == []
    assert all(source.get("url") and source.get("locator") and source.get("accessed_on") for source in override["source_evidence"])

    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(item for item in generated["rows"] if item["jamb_name"] == override["jamb_name"])
    assert scope["scope_status"] == "combined_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
    assert len(scope["selected_courses"]) == len(selected)
    assert all(item.get("source_url") and item.get("source_locator") for item in scope["selected_courses"])
    assert all(
        item.get("source_url") and item.get("source_locator") and item.get("source_accessed_on")
        for item in scope["selected_courses"]
    )
    assert sum(
        item["source_ccmas_programme"] == "Computer Science" and not item.get("content_summary")
        for item in scope["selected_courses"]
    ) == 38


def test_computer_science_with_economics_uses_both_full_ccmas_components_and_stays_held(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override = next(
        item for item in override_doc["overrides"]
        if item["jamb_name"] == "COMPUTER SCIENCE WITH ECONOMICS"
    )

    audit_path = ROOT / "_audit_ccmas_jamb_inheritance.py"
    spec = importlib.util.spec_from_file_location("jamb_inheritance_audit_cs_econ", audit_path)
    audit = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(audit)
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    components, _ = audit.component_rows(
        mapping["mappings"], *audit.programme_registry(), audit.secondary_components()
    )
    component_refs = {
        f"{item['discipline']}::{item['name']}"
        for item in components["COMPUTER SCIENCE WITH ECONOMICS"]
    }
    assert component_refs == {"Computing::Computer Science", "Social Sciences::Economics"}

    selected = BUILDER.resolve_manual_scope_courses(
        override, sorted(component_refs), BUILDER.source_registry()
    )
    assert {item["source_ccmas_programme"] for item in selected} == {
        "Computer Science", "Economics"
    }
    assert len(selected) > 70
    assert override["scope_status"] == "combined_scope_review_required"
    assert override["scope_approval"] == "pending_review"
    assert override["domain_links"] == []
    assert all(
        source.get("url") and source.get("locator") and source.get("accessed_on")
        for source in override["source_evidence"]
    )

    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(
        item for item in generated["rows"]
        if item["jamb_name"] == override["jamb_name"]
    )
    assert scope["scope_status"] == "combined_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
    assert len(scope["selected_courses"]) == len(selected)
    assert {item["source_ccmas_programme"] for item in scope["selected_courses"]} == {
        "Computer Science", "Economics"
    }


def test_physics_blends_preserve_each_named_ccmas_facet_without_publishing_links(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    expected = {
        "Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics)": {
            "Industrial Physics", "Physics with Electronics"
        },
        "Industrial Physics with Applied Geophysics": {
            "Industrial Physics", "Applied Geophysics"
        },
        "Industrial Physics with Electronics and IT Application": {
            "Industrial Physics", "Physics with Electronics"
        },
    }
    overrides = {item["jamb_name"]: item for item in override_doc["overrides"]}
    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    rows = {item["jamb_name"]: item for item in generated["rows"]}

    for jamb_name, programmes in expected.items():
        override = overrides[jamb_name]
        scope = rows[jamb_name]
        if jamb_name == "Industrial Physics with Electronics and IT Application":
            assert override["scope_status"] == "combined_scope_reviewed"
            assert override["scope_approval"] == "reviewed"
            assert override["unrepresented_facets"] == []
            assert override["facet_qualifications"][0]["status"] == "embedded_option_confirmed_not_separate_curriculum"
            assert scope["scope_status"] == "combined_scope_reviewed"
            assert scope["scope_approval"] == "reviewed"
            assert scope["unrepresented_facets"] == []
        else:
            assert override["scope_status"] == "combined_scope_review_required"
            assert override["scope_approval"] == "pending_review"
            assert scope["scope_status"] == "combined_scope_review_required"
            assert scope["scope_approval"] == "pending_review"
        assert override["domain_links"] == []
        assert scope["domain_links"] == []
        assert {course["source_ccmas_programme"] for course in scope["selected_courses"]} == programmes
        assert all(course.get("scope_facet") for course in scope["selected_courses"])


def test_chemistry_and_industrial_chemistry_keeps_both_full_ccmas_packages_held(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override = next(
        item for item in override_doc["overrides"]
        if item["jamb_name"] == "Chemistry and Industrial Chemistry"
    )
    audit_path = ROOT / "_audit_ccmas_jamb_inheritance.py"
    spec = importlib.util.spec_from_file_location("jamb_inheritance_audit_chemistry_blend", audit_path)
    audit = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(audit)
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    components, _ = audit.component_rows(
        mapping["mappings"], *audit.programme_registry(), audit.secondary_components()
    )
    component_refs = {
        f"{item['discipline']}::{item['name']}"
        for item in components["Chemistry and Industrial Chemistry"]
    }
    assert component_refs == {"Sciences::Chemistry", "Sciences::Industrial Chemistry"}

    selected = BUILDER.resolve_manual_scope_courses(
        override, sorted(component_refs), BUILDER.source_registry()
    )
    assert len(selected) == 84
    assert {item["source_ccmas_programme"] for item in selected} == {
        "Chemistry", "Industrial Chemistry"
    }
    assert override["scope_status"] == "combined_scope_review_required"
    assert override["scope_approval"] == "pending_review"
    assert override["domain_links"] == []
    assert override["context"]["institution_codes"] == ["ABSU", "IGBINEDION"]
    assert all(
        source.get("url") and source.get("locator") and source.get("accessed_on")
        for source in override["source_evidence"]
    )

    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(
        item for item in generated["rows"]
        if item["jamb_name"] == "Chemistry and Industrial Chemistry"
    )
    assert len(scope["selected_courses"]) == 84
    assert scope["scope_status"] == "combined_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
    assert scope["source_context"]["institution_codes"] == ["ABSU", "IGBINEDION"]


def test_political_science_defence_studies_uses_political_science_ccmas_only_and_stays_held(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override = next(
        item for item in override_doc["overrides"]
        if item["jamb_name"] == "Political Science and Defence Studies"
    )
    audit_path = ROOT / "_audit_ccmas_jamb_inheritance.py"
    spec = importlib.util.spec_from_file_location("jamb_inheritance_audit_political_defence", audit_path)
    audit = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(audit)
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    components, _ = audit.component_rows(
        mapping["mappings"], *audit.programme_registry(), audit.secondary_components()
    )
    refs = {
        f"{item['discipline']}::{item['name']}"
        for item in components["Political Science and Defence Studies"]
    }
    assert refs == {"Social Sciences::Political Science"}

    selected = BUILDER.resolve_manual_scope_courses(
        override, sorted(refs), BUILDER.source_registry()
    )
    assert {item["source_ccmas_programme"] for item in selected} == {"Political Science"}
    by_code = {item["code"]: item for item in selected}
    assert by_code["POL 401"]["title"] == "Civil-Military Relations"
    assert by_code["POL 403"]["title"] == "Contemporary Defence and Strategic Studies"
    assert override["context"]["institution_code"] == "NDA"
    assert override["scope_status"] == "full_scope_review_required"
    assert override["scope_approval"] == "pending_review"
    assert override["domain_links"] == []

    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(
        item for item in generated["rows"]
        if item["jamb_name"] == "Political Science and Defence Studies"
    )
    assert scope["scope_status"] == "full_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
    assert {item["source_ccmas_programme"] for item in scope["selected_courses"]} == {
        "Political Science"
    }


def test_ich_400_topic_list_is_not_misrepresented_as_learning_outcomes():
    source = json.loads((ROOT / "ccmas" / "sciences.json").read_text(encoding="utf-8"))
    industrial_chemistry = next(
        programme for programme in source["programmes"]
        if programme["code"] == "ICH"
    )
    seminar = next(course for course in industrial_chemistry["courses"] if course["code"] == "ICH 400")
    assert seminar["skills_learned"] == []
    assert "source_topics_only_no_explicit_learning_outcomes" in seminar["flags"]
    assert "research-proposal writing" in seminar["content_summary"]


def test_accounting_and_finance_preserves_two_jamb_contexts_and_both_ccmas_components(tmp_path, monkeypatch):
    override_doc = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_manual_scope_overrides_2026-09-25.json").read_text(
            encoding="utf-8"
        )
    )
    override = next(
        item for item in override_doc["overrides"]
        if item["jamb_name"] == "Accounting and Finance"
    )
    assert {
        (item["faculty"], item["institution_code"])
        for item in override["source_contexts"]
    } == {
        ("Administration", "BCU"),
        ("Social Sciences", "FEDOTUOKE"),
    }
    fedotuoke_context = next(
        item for item in override["source_contexts"]
        if item["institution_code"] == "FEDOTUOKE"
    )
    assert "p. 576" in fedotuoke_context["jamb_locator"]

    audit_path = ROOT / "_audit_ccmas_jamb_inheritance.py"
    spec = importlib.util.spec_from_file_location("jamb_inheritance_audit_accounting_finance", audit_path)
    audit = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(audit)
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    components, _ = audit.component_rows(
        mapping["mappings"], *audit.programme_registry(), audit.secondary_components()
    )
    assert {(item["discipline"], item["code"]) for item in components["Accounting and Finance"]} == {
        ("Administration and Management", "FIN"),
        ("Administration and Management", "ACC"),
    }

    canonical = json.loads(
        (ROOT / "_audit" / "jamb_ccmas_inheritance_canonical_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )
    canonical_row = next(
        item for item in canonical["rows"]
        if item["jamb_name"] == "Accounting and Finance"
    )
    assert canonical_row["inheritance_type"] == "combined_ccmas_curriculum"
    assert canonical_row["mapping_status"] == "review_required"
    assert canonical_row["domain_links"] == []
    assert canonical_row["component_refs"] == [
        "Administration and Management::Finance / Banking and Finance",
        "Administration and Management::Accounting",
    ]

    output_path = tmp_path / "scopes.json"
    monkeypatch.setattr(BUILDER, "OUTPUT", output_path)
    BUILDER.main()
    generated = json.loads(output_path.read_text(encoding="utf-8"))
    scope = next(item for item in generated["rows"] if item["jamb_name"] == "Accounting and Finance")
    assert scope["scope_status"] == "combined_scope_review_required"
    assert scope["scope_approval"] == "pending_review"
    assert scope["domain_links"] == []
    assert {(item["faculty"], item["institution_code"]) for item in scope["source_contexts"]} == {
        ("Administration", "BCU"),
        ("Social Sciences", "FEDOTUOKE"),
    }
    assert len(scope["selected_courses"]) == 65
    assert {item["source_ccmas_programme"] for item in scope["selected_courses"]} == {
        "Accounting", "Finance / Banking and Finance"
    }
    assert all(
        item.get("source_url")
        and item.get("source_locator")
        and item.get("source_accessed_on") == "2026-09-28"
        for item in scope["selected_courses"]
    )

    acc_project = next(
        item for item in scope["selected_courses"]
        if item["source_ccmas_programme"] == "Accounting" and item["code"] == "ACC 490"
    )
    assert not acc_project.get("learning_outcomes")
    assert "no course-specific outcomes/content" in override["scope_reason"]
    assert "source-fidelity enrichment pass" in override["scope_reason"]


def test_african_and_asian_studies_uses_igbo_chinese_options_and_only_translation_path():
    mapping = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))
    row = next(item for item in mapping["mappings"] if item["jamb_name"] == "African and Asian Studies")
    assert row["ccmas_code"] == "IGB"

    aggregate = (ROOT / "_aggregate_jamb_nuance.py").read_text(encoding="utf-8")
    assert '"African and Asian Studies": [("Arts", "CHS")]' in aggregate
    assert "African and Asian Studies" in BUILDER.FULL_COMPONENT_SCOPE_ALIASES

    links = BUILDER.MANUAL_SCOPE_DOMAIN_LINKS["African and Asian Studies"]
    assert len(links) == 1
    assert links[0]["domain_id"] == "D065"
    assert set(links[0]["scope_course_codes"]) == {"IGB 307", "CHS 203", "CHS 303"}


def test_environmental_science_and_technology_is_closed_without_fabricated_curriculum():
    disposition = BUILDER.EXTERNAL_SCOPE_VERIFIED_NO_CURRICULUM["Environmental Science and Technology"]
    assert "exact award" in disposition["reason"]
    assert len(disposition["evidence"]) >= 2
    assert all(item.get("url") and item.get("locator") for item in disposition["evidence"])
