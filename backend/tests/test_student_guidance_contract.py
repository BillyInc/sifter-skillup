from routes import student_pipeline_routes as spr
from routes import career_routes as cr
from services import report_gen


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, rows):
        self._rows = rows

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def execute(self):
        return _Result(self._rows)


class _Service:
    def __init__(self, rows):
        self._rows = rows

    def table(self, name):
        assert name == "career_context_items"
        return _Query(self._rows)


class _CareerQuery:
    def __init__(self, data):
        self.data = data

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def execute(self):
        return _Result(self.data)


class _CareerService:
    def __init__(self, rows, edges, path_targets=None):
        self.rows = rows
        self.edges = edges
        self.path_targets = path_targets or []

    def table(self, name):
        if name == "career_context_items":
            return _CareerQuery(self.rows)
        if name == "career_item_relationships":
            return _CareerQuery(self.edges)
        if name == "career_item_path_targets":
            return _CareerQuery(self.path_targets)
        raise AssertionError(name)


def _approved_context_row(**overrides):
    claims = {
        key: {"source_references": ["source-1"], "source_locators": ["section 1"]}
        for key in ("item_identity", "checkpoint_fit", "plain_meaning", "contextual_use")
    }
    return {
        "claim_review_state": "approved",
        "claim_evidence": {"claims": claims},
        "link_state": "linked",
        "link_url": "https://example.org/learn",
        "link_accessed_at": "2026-10-08",
        "link_source_reference": {"title": "Learning guide"},
        "link_evidence": {"destination_checked": True},
        **overrides,
    }


def test_student_context_items_require_https_learning_links_at_every_checkpoint():
    row = _approved_context_row(
        **{
            "guidance_owner": "domain",
            "data_state": "source_backed",
            "context_level": "domain",
            "context_key": "D001",
        }
    )

    assert cr._student_context_item_visible(row, "domain") is True
    assert cr._student_context_item_visible({**row, "link_url": "http://example.org/learn"}, "domain") is False


def test_domain_connection_inherits_only_exact_course_anchored_student_outcomes():
    outcomes = [
        {
            "outcomeId": "o-1",
            "courseCode": "SOC 101",
            "courseTitle": "Introduction to Sociology I",
            "sourceText": "Relate the basic analysis and description of social structure and dynamics of human society.",
            "studentText": "Explain how social structures shape people's lives.",
        },
        {
            "outcomeId": "o-2",
            "courseCode": "SOC 101",
            "courseTitle": "Introduction to Sociology I",
            "sourceText": "Describe an unrelated course outcome.",
            "studentText": "Describe an unrelated course outcome.",
        },
        {
            "outcomeId": "o-3",
            "courseCode": "SOC 102",
            "courseTitle": "Introduction to Anthropology",
            "sourceText": "Relate the basic analysis and description of social structure and dynamics of human society.",
            "studentText": "An outcome from a different course.",
        },
    ]
    evidence = [{
        "evidence": "relate the basic analysis and description of social structure and dynamics of human society",
        "course_identity": "SOC 101::Introduction to Sociology I",
        "course_title": "Introduction to Sociology I",
    }]

    matched = cr._programme_domain_outcomes(outcomes, evidence)

    assert [item["outcomeId"] for item in matched] == ["o-1"]
    assert matched[0]["studentText"] == "Explain how social structures shape people's lives."
    assert "sourceText" not in matched[0]


def test_sociology_programme_themes_are_narrative_fixed_curriculum_groups():
    themes = cr.d078_sociology_programme_themes()

    assert len(themes) == 14
    assert all(theme["selectionState"] == "fixed_programme_guidance_not_selectable" for theme in themes)
    assert all(theme["narration"] and theme["courseAnchors"] and theme["source"]["url"].startswith("https://") for theme in themes)
    assert sum(len(theme["courseCodes"]) for theme in themes) >= 34


def test_domain_receives_full_programme_themes_and_outcomes_without_inventing_transfer_matches():
    themes = cr.d078_sociology_programme_themes()
    selected = themes[0]
    first_code = selected["courseCodes"][0]
    connections = cr._programme_curriculum_theme_context(
        themes,
        [{"outcomeId": "SOC103:1", "courseCode": first_code, "studentText": "an outcome"}],
        [{"outcomeId": "SOC103:1", "courseCode": first_code, "courseTitle": "Course", "studentText": "an outcome", "sourceLocator": {"page": 1}}],
    )

    assert len(connections) == len(themes) == 14
    matched = next(item for item in connections if item["themeKey"] == selected["themeKey"])
    unmatched = next(item for item in connections if item["themeKey"] != selected["themeKey"])
    assert matched["matchedOutcomeIds"] == ["SOC103:1"]
    assert matched["matchedCourseCodes"] == [first_code]
    assert matched["directTransferEvidenceStatus"] == "matched"
    assert matched["narration"] == selected["narration"]
    assert len(matched["courseAnchors"]) == len(selected["courseAnchors"])
    assert [anchor["courseCode"] for anchor in matched["matchedCourseAnchors"]] == [first_code]
    assert matched["programmeOutcomes"][0]["studentText"] == "an outcome"
    assert matched["programmeOutcomes"][0]["sourceLocator"] == {"page": 1}
    assert unmatched["directTransferEvidenceStatus"] == "no_exact_match_in_current_transfer_record"
    assert "does not mean the theme is irrelevant" in unmatched["connectionExplanation"]


def test_sociology_to_social_sciences_transition_weaves_verified_transfer_into_plain_language():
    narrative = cr._programme_domain_transfer_narrative(
        "Sociology",
        "Social Sciences & Behavioural Research",
        [
            "relate the basic analysis and description of social structure and dynamics of human society",
            "define the basic terms and concepts of sociology, culture and the process of socialisation; and",
            "discuss the biological foundations of human behaviour",
        ],
    )

    assert "analysing social structures and the dynamics of society" in narrative
    assert "culture and socialisation" in narrative
    assert "human behaviour and how it is studied" in narrative
    assert "not the whole set of capabilities" in narrative


def test_programme_to_domain_handoff_distinguishes_inherited_learning_from_domain_additions():
    domain_name = "Social Sciences & Behavioural Research"
    handoff = cr._programme_domain_handoff_copy("Sociology", domain_name)

    assert "Sociology programme covers" in handoff["curriculumContextHeading"]
    assert handoff["domainAddsHeading"] == f"What {domain_name} adds"
    assert "shared domain foundations (the common starting path)" in handoff["domainAddsExplanation"]
    assert "optional useful edges" in handoff["domainAddsExplanation"]
    assert "does not claim that every employer requires every item" in handoff["domainAddsExplanation"]
    assert "programme already taught these additions" in handoff["domainAddsExplanation"]


def test_programme_domain_categories_have_distinct_student_facing_explanations():
    direct = cr._programme_domain_explanation("Sociology", "Social Sciences", "direct", [{"title": "Research Methods"}])
    functional = cr._programme_domain_explanation("Sociology", "Data Analysis", "functional", [{"title": "Research Methods"}])
    adjacent = cr._programme_domain_explanation("Sociology", "Software Engineering", "adjacent", [{"title": "Research Methods"}])

    assert "ideas and ways of working" in direct
    assert "used in some parts" in functional
    assert "step further" in adjacent
    assert "not a close match" in adjacent
    assert len({direct, functional, adjacent}) == 3


def test_domain_description_requires_exact_approved_claim_and_resolvable_sources():
    description = "Social Sciences & Behavioural Research studies people and society."
    source = {
        "title": "Official source",
        "shortLabel": "Official source · p. 1",
        "url": "https://example.org/source.pdf",
        "locator": "printed p. 1",
    }
    approved = {
        "description": description,
        "source_provenance": {
            "student_orientation": {
                "domainDescriptionEvidence": {
                    "reviewState": "approved",
                    "claim": description,
                    "sources": [source],
                }
            }
        },
    }

    visible, sources = cr._student_domain_description(approved)
    assert visible == description
    assert sources[0]["shortLabel"] == "Official source · p. 1"

    stale_copy = {**approved, "description": description + " Extra unsupported claim."}
    assert cr._student_domain_description(stale_copy) == (None, [])
    missing_citation = {
        **approved,
        "source_provenance": {
            "student_orientation": {
                "domainDescriptionEvidence": {
                    "reviewState": "approved",
                    "claim": description,
                    "sources": [{**source, "url": "http://example.org/source.pdf"}],
                }
            }
        },
    }
    assert cr._student_domain_description(missing_citation) == (None, [])


def test_programme_theme_guidance_requires_exact_claim_locators_and_a_verified_learning_link():
    required_claims = (
        "item_identity", "checkpoint_fit", "plain_meaning", "contextual_use", "expected_output"
    )
    row = {
        "selection_state": "fixed_programme_guidance_not_selectable",
        "learning_url": "https://learn.example.org/research",
        "learning_verified_on": "2026-10-08",
        "learning_label": "Open the lesson",
        "learning_source_reference": {
            "title": "Research lesson", "url": "https://learn.example.org/research"
        },
        "claim_evidence": {
            "claims": {key: ["curriculum:printed_page"] for key in required_claims}
        },
        "claim_sources": [{
            "id": "curriculum",
            "url": "https://example.org/curriculum.pdf",
            "locators": {"printed_page": "printed p. 334"},
        }],
        "limitations": ["Optional support; not a curriculum requirement."],
    }

    assert cr._student_programme_theme_guidance_visible(row) is True
    assert cr._student_programme_theme_guidance_visible({**row, "learning_url": "http://learn.example.org/research"}) is False
    assert cr._student_programme_theme_guidance_visible({**row, "selection_state": "selectable_extra"}) is False
    assert cr._student_programme_theme_guidance_visible({
        **row,
        "claim_evidence": {"claims": {**row["claim_evidence"]["claims"], "expected_output": ["curriculum:missing"]}},
    }) is False


def test_programme_theme_relationship_requires_exact_source_locator_and_verified_learning_link():
    row = {
        "theme_key": "research",
        "relationship_key": "question_guides_method",
        "from_item_key": "research_question",
        "from_title": "Research question",
        "to_item_key": "method_choice",
        "to_title": "Choose a research method",
        "relationship_type": "supports",
        "learner_explanation": "Choose a method that can provide the information needed to answer the question.",
        "selection_state": "fixed_programme_guidance_not_selectable",
        "learning_url": "https://learn.example.org/research",
        "learning_verified_on": "2026-10-08",
        "learning_label": "Explore research methods",
        "learning_source_reference": {"title": "Research methods", "url": "https://learn.example.org/research"},
        "relationship_evidence": ["curriculum:research_methods"],
        "claim_sources": [{"id": "curriculum", "locators": {"research_methods": "printed p. 334"}}],
        "limitations": ["Method choice depends on the research question."],
    }
    assert cr._student_programme_theme_relationship_visible(row) is True
    assert cr._student_programme_theme_relationship_visible({**row, "learning_url": "http://learn.example.org/research"}) is False
    assert cr._student_programme_theme_relationship_visible({
        **row, "relationship_evidence": ["curriculum:missing_locator"]
    }) is False
    assert cr._student_programme_theme_relationship_visible({
        **row, "selection_state": "selectable_extra"
    }) is False


def test_jamb_context_items_require_programme_ownership_and_explicit_source_state():
    rows = [
        _approved_context_row(**{
            "name": "Reviewed programme item",
            "guidance_owner": "programme",
            "data_state": "source_backed",
            "context_level": "programme",
            "context_key": "programme-1",
        }),
        {"name": "No learning link", "guidance_owner": "programme", "data_state": "source_backed", "link_state": "no_link"},
        {
            "name": "Role aggregate",
            "guidance_owner": "role_aggregated",
            "data_state": "source_backed",
        },
        {
            "name": "Review item",
            "guidance_owner": "programme",
            "data_state": "review_only",
        },
        {
            "name": "Unclassified legacy item",
            "guidance_owner": "programme",
        },
        {
            "name": "Candidate review item",
            "guidance_owner": "programme",
            "data_state": "source_backed",
            "link_state": "review_required",
        },
        {
            "name": "Wrong context item",
            "guidance_owner": "domain",
            "data_state": "source_backed",
        },
    ]

    visible = spr._programme_context_items_for_student(_Service(rows), "programme-1")

    assert [item["name"] for item in visible] == ["Reviewed programme item"]
    assert visible[0]["guidanceOwner"] == "programme"
    assert visible[0]["dataState"] == "source_backed"
    assert visible[0]["claimReviewState"] == "approved"
    assert visible[0]["linkState"] == "linked"


def test_role_learning_selection_is_bounded_and_uses_reviewed_selection():
    role = {
        "essential_skills": ["raw duty one", "raw duty two"],
        "optional_skills": ["raw incidental"],
        "source_provenance": {
            "student_skill_selection": {
                "selectedEssential": ["Evidence reasoning", "Evidence reasoning", *[f"Need {n}" for n in range(20)]],
                "selectedOptional": ["Evidence reasoning", "Optional one", *[f"Later {n}" for n in range(10)]],
            }
        },
    }

    essential, optional = cr._student_role_skill_lists(role)

    assert len(essential) == 12
    assert len(optional) == 5
    assert essential[0] == "Evidence reasoning"
    assert "Evidence reasoning" not in optional
    assert "raw duty one" not in essential


def test_context_items_keep_only_owned_edges_with_sources_and_learner_explanations():
    rows = [
        _approved_context_row(**{"context_level": "role", "context_key": "D078|sociologist", "item_type": "skill", "item_key": "evidence", "name": "Evidence reasoning", "guidance_owner": "role", "data_state": "source_backed", "prerequisites": ["Hidden target"], "related_items": ["Tool"]}),
        _approved_context_row(**{"context_level": "role", "context_key": "D078|sociologist", "item_type": "tool", "item_key": "tool", "name": "Tool", "guidance_owner": "role", "data_state": "source_backed"}),
        {"context_level": "role", "context_key": "D078|sociologist", "item_type": "skill", "item_key": "hidden", "name": "Hidden target", "guidance_owner": "role", "data_state": "review_only"},
        {"context_level": "role", "context_key": "D078|sociologist", "item_type": "certification", "item_key": "unowned", "name": "Unowned", "guidance_owner": "domain", "data_state": "source_backed"},
    ]
    edges = [
        {"context_level": "role", "context_key": "D078|sociologist", "from_item_type": "skill", "from_item_key": "evidence", "to_item_type": "tool", "to_item_key": "tool", "to_name": "Tool", "relationship_type": "works_with", "relationship_status": "source_backed", "learner_explanation": "Use the tool to organize the evidence produced by this skill.", "source_references": [{"title": "Relationship source", "url": "https://example.org/relationship"}], "data_state": "source_backed", "guidance_owner": "role", "sequence_approved": False, "sequence_policy": "workflow", "sequence_condition": "Only when the selected task includes this tool.", "sequence_scope": {"domainIds": ["D078"]}},
        {"context_level": "role", "context_key": "D078|sociologist", "from_item_type": "skill", "from_item_key": "evidence", "to_item_type": "tool", "to_item_key": "tool", "to_name": "Tool", "relationship_type": "complements", "relationship_status": "source_backed", "learner_explanation": "This explanation has no direct evidence link.", "source_references": [], "data_state": "source_backed", "guidance_owner": "role"},
        {"context_level": "role", "context_key": "D078|sociologist", "from_item_type": "skill", "from_item_key": "evidence", "to_item_type": "tool", "to_item_key": "tool", "to_name": "Tool", "relationship_type": "complements", "relationship_status": "source_backed", "source_references": [{"title": "Source without explanation", "url": "https://example.org/no-rationale"}], "data_state": "source_backed", "guidance_owner": "role"},
        {"context_level": "role", "context_key": "D078|sociologist", "from_item_type": "skill", "from_item_key": "evidence", "to_item_type": "skill", "to_item_key": "hidden", "to_name": "Hidden target", "relationship_type": "builds_on", "relationship_status": "source_backed", "data_state": "source_backed", "guidance_owner": "role"},
        {"context_level": "role", "context_key": "D078|sociologist", "from_item_type": "skill", "from_item_key": "evidence", "to_item_type": "tool", "to_item_key": "tool", "to_name": "Tool", "relationship_type": "not_established", "relationship_status": "not_established", "data_state": "not_established", "guidance_owner": "role"},
    ]

    visible = cr._career_context_items(
        _CareerService(rows, edges),
        context_level="role",
        context_key="D078|sociologist",
    )

    assert [item["name"] for item in visible] == ["Evidence reasoning", "Tool"]
    assert visible[0]["relatedItems"] == ["Tool"]
    assert visible[0]["prerequisites"] == []
    assert visible[0]["relationships"][0]["relationshipStatus"] == "source_backed"
    assert visible[0]["relationships"][0]["learnerExplanation"] == "Use the tool to organize the evidence produced by this skill."
    assert visible[0]["relationships"][0]["sourceReferences"] == [{"title": "Relationship source", "url": "https://example.org/relationship"}]
    assert visible[0]["relationships"][0]["sequenceApproved"] is False
    assert visible[0]["relationships"][0]["sequencePolicy"] == "workflow"
    assert visible[0]["relationships"][0]["sequenceCondition"] == "Only when the selected task includes this tool."
    assert visible[0]["relationships"][0]["sequenceScope"] == {"domainIds": ["D078"]}
    assert len(visible[0]["relationships"]) == 1


def test_conditional_sequence_relationship_can_reference_an_inherited_domain_item():
    area_key = "D078:economics-applied-analysis"
    rows = [
        _approved_context_row(**{
            "context_level": "subgroup", "context_key": area_key, "domain_key": "D078",
            "item_type": "method", "item_key": "econometrics", "name": "Applied econometrics",
            "guidance_owner": "subgroup", "data_state": "source_backed",
        }),
        _approved_context_row(**{
            "context_level": "domain", "context_key": "D078", "domain_key": "D078",
            "item_type": "method", "item_key": "statistics", "name": "Introductory statistics",
            "guidance_owner": "domain", "data_state": "source_backed",
        }),
    ]
    edge = {
        "context_level": "subgroup", "context_key": area_key, "domain_key": "D078",
        "from_item_type": "method", "from_item_key": "econometrics",
        "to_context_level": "domain", "to_context_key": "D078",
        "to_item_type": "method", "to_item_key": "statistics", "to_name": "Introductory statistics",
        "relationship_type": "builds_on", "relationship_status": "source_backed",
        "learner_explanation": "Review statistical foundations first if they are new to you.",
        "source_references": [{"url": "https://example.org/econometrics-syllabus"}],
        "data_state": "source_backed", "guidance_owner": "subgroup",
        "sequence_approved": True, "sequence_policy": "conditional_prerequisite",
        "sequence_condition": "Only when you have not already studied comparable statistics.",
        "sequence_scope": {"domainIds": ["D078"], "areaIds": [area_key]},
    }

    visible = cr._career_context_items(
        _CareerService(rows, [edge]), context_level="subgroup", context_key=area_key
    )

    assert len(visible) == 1
    relationship = visible[0]["relationships"][0]
    assert relationship["toContextLevel"] == "domain"
    assert relationship["toContextKey"] == "D078"
    assert relationship["toItemKey"] == "statistics"
    assert relationship["sequencePolicy"] == "conditional_prerequisite"


def test_domain_items_expose_only_evidenced_downstream_path_targets():
    rows = [
        _approved_context_row(**{"context_level": "domain", "context_key": "D001", "domain_key": "D001", "item_type": "tool", "item_key": "python", "name": "Python", "guidance_owner": "domain", "data_state": "source_backed"}),
        _approved_context_row(**{"context_level": "domain", "context_key": "D001", "domain_key": "D001", "item_type": "tool", "item_key": "generic", "name": "Generic tool", "guidance_owner": "domain", "data_state": "source_backed"}),
    ]
    target = {
        "context_level": "domain", "context_key": "D001", "domain_key": "D001",
        "from_item_type": "tool", "from_item_key": "python", "target_level": "subgroup",
        "target_key": "D001|quantitative-finance", "target_label": "Quantitative Finance",
        "use_case_key": "data-analysis", "requirement_level": "useful",
        "path_reason": "Supports data analysis used in this specialization.",
        "relationship_status": "source_backed", "data_state": "source_backed",
        "guidance_owner": "domain", "source_ids": ["src-1"],
        "source_references": [{"title": "Primary source", "url": "https://example.org/source"}],
        "evidence_limitations": ["Not sufficient by itself."],
    }
    targets = [
        target,
        {**target, "from_item_key": "generic", "target_key": "unsupported", "guidance_owner": "review_only"},
        {**target, "target_key": "unverified", "relationship_status": "review_required", "data_state": "review_required"},
        {**target, "target_key": "no-source", "source_ids": [], "source_references": []},
    ]

    visible = cr._career_context_items(
        _CareerService(rows, [], targets), context_level="domain", context_key="D001"
    )

    assert len(visible) == 2
    python_item = next(item for item in visible if item["itemKey"] == "python")
    assert python_item["pathTargets"] == [{
        "targetLevel": "subgroup", "targetKey": "D001|quantitative-finance",
        "targetLabel": "Quantitative Finance", "useCaseKey": "data-analysis",
        "requirementLevel": "useful", "requirementScope": {},
        "pathReason": "Supports data analysis used in this specialization.",
        "relationshipStatus": "source_backed", "sourceIds": ["src-1"],
        "sourceReferences": [{"title": "Primary source", "url": "https://example.org/source"}],
        "evidenceLimitations": ["Not sufficient by itself."],
    }]
    assert next(item for item in visible if item["itemKey"] == "generic")["pathTargets"] == []


def test_context_item_contract_separates_theme_requirement_and_learning_order():
    item = cr._context_item({
        "context_level": "subgroup", "context_key": "D001|quantitative-finance", "domain_key": "D001",
        "item_type": "tool", "item_key": "python", "name": "Python",
        "theme_key": "programming", "theme_label": "Programming",
        "use_case_key": "data-analysis", "requirement_level": "useful",
        "requirement_reason": "Useful for the selected analysis route.",
        "priority": "start_here", "guidance_owner": "domain",
    })

    assert item["themeLabel"] == "Programming"
    assert item["useCaseKey"] == "data-analysis"
    assert item["requirementLevel"] == "useful"
    assert item["priority"] == "start_here"
    assert item["learningOrder"] == "start_here"

    domain_item = cr._context_item({
        "context_level": "domain", "context_key": "D001", "domain_key": "D001",
        "item_type": "tool", "item_key": "python", "name": "Python",
        "priority": "start_here", "priority_reason": "Legacy ordering must not leak to the domain layer.",
    })
    assert domain_item["priority"] is None
    assert domain_item["learningOrder"] is None
    assert domain_item["priorityReason"] is None


def test_saved_learning_report_renders_item_source_and_locator():
    rendered = report_gen._learning_plan_html({
        "learningPlanSnapshot": {
            "stacks": [{
                "route": {"domainId": "D078"},
                "selectedIds": ["domain:D078:tool:python"],
                "itemSummaries": [{
                    "id": "domain:D078:tool:python",
                    "name": "Python",
                    "layer": "domain",
                    "sourceReferences": [{
                        "id": "esrc", "title": "ESRC research training guide",
                        "url": "https://example.org/esrc",
                    }],
                    "sourceLocators": [{
                        "sourceId": "esrc", "locator": "Section 2.1, pages 4–5",
                    }],
                }],
            }],
        },
    })

    assert "Evidence for this item" in rendered
    assert 'href=\'https://example.org/esrc\'' in rendered
    assert "ESRC research training guide" in rendered
    assert "Section 2.1, pages 4–5" in rendered


def test_saved_learning_report_uses_dependency_checked_route_order():
    rendered = report_gen._learning_plan_html({
        "learningPlanSnapshot": {
            "stacks": [{
                "route": {"programmeId": "sociology", "domainId": "D078"},
                # The selection set intentionally differs from the saved order.
                "selectedIds": ["area:practice", "domain:foundation"],
                "order": ["domain:foundation", "area:practice"],
                "itemSummaries": [
                    {"id": "area:practice", "name": "Area practice", "layer": "area"},
                    {"id": "domain:foundation", "name": "Shared foundation", "layer": "domain"},
                ],
            }],
        },
    })

    assert rendered.index("Step 1 · Domain:") < rendered.index("Step 2 · Area:")
    assert rendered.index("Shared foundation") < rendered.index("Area practice")
    assert "they do not make every item in one layer a prerequisite" in rendered
