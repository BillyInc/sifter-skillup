"""Focused contract checks for the admin programme downstream ledger."""

from routes.institutions_routes import (
    ProgrammeCurriculumEvidence,
    ProgrammeResourceEvidence,
    _admin_evidence_state,
    _optional_rows,
)


def test_optional_evidence_layer_is_unavailable_not_fatal():
    def missing_table():
        raise RuntimeError("relation does not exist")

    assert _optional_rows(missing_table) == []


def test_admin_evidence_states_keep_relationship_and_link_gates_explicit():
    assert _admin_evidence_state(
        {
            "item_type": "relationship",
            "guidance_owner": "domain",
            "context_level": "domain",
            "relationship_status": "source_backed",
            "data_state": "source_backed",
        },
        "domain",
    ) == "verified"
    assert _admin_evidence_state(
        {"guidance_owner": "domain", "link_state": "no_link"}, "domain"
    ) == "no_link"
    assert _admin_evidence_state(
        {"guidance_owner": "role_aggregated"}, "role"
    ) == "audit_only"
    assert _admin_evidence_state(
        {"guidance_owner": "role", "data_state": "review_required"}, "role"
    ) == "review_required"


def test_admin_models_preserve_structured_provenance_and_traceability():
    resource = ProgrammeResourceEvidence(
        name="builds_on",
        kind="relationship",
        source="domain",
        state="bridge",
        context_key="D078",
        programme_key="programme-1",
        guidance_owner="domain",
        evidence_state="verified",
        source_locator={"document": "ccmas.pdf", "page": 12},
        source_references=[{"url": "https://example.test/source"}],
        source_locators=[{"page": 12}],
        link_state="no_link",
        no_link_reason="No item-specific learning link is recorded.",
        relationship_type="builds_on",
        relationship_status="source_backed",
        from_item_type="skill",
        to_item_type="tool",
        to_item_key="tool:survey-tool",
        to_name="Survey tool",
    )
    assert resource.source_locator["page"] == 12
    assert resource.relationship_status == "source_backed"
    assert resource.link_state == "no_link"

    curriculum = ProgrammeCurriculumEvidence(
        course_code="SOC 101",
        course_title="Introduction to Sociology",
        source_text="Original CCMAS outcome",
        student_text="Understand social institutions",
        source_locator={"file": "ccmas.pdf", "page": 4},
        student_display=True,
        data_state="source_backed",
    )
    assert curriculum.source_locator["file"] == "ccmas.pdf"
    assert curriculum.student_display is True
