from routes import student_pipeline_routes as spr
from routes import career_routes as cr


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
    def __init__(self, rows, edges):
        self.rows = rows
        self.edges = edges

    def table(self, name):
        if name == "career_context_items":
            return _CareerQuery(self.rows)
        if name == "career_item_relationships":
            return _CareerQuery(self.edges)
        raise AssertionError(name)


def test_jamb_context_items_require_programme_ownership_and_explicit_source_state():
    rows = [
        {
            "name": "Approved programme item",
            "guidance_owner": "programme",
            "data_state": "source_backed",
            "link_state": "no_link",
        },
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

    assert [item["name"] for item in visible] == ["Approved programme item"]
    assert visible[0]["guidanceOwner"] == "programme"
    assert visible[0]["dataState"] == "source_backed"


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


def test_context_items_keep_only_owned_edges_between_visible_items():
    rows = [
        {"context_level": "role", "context_key": "D078|sociologist", "item_type": "skill", "item_key": "evidence", "name": "Evidence reasoning", "guidance_owner": "role", "data_state": "source_backed", "prerequisites": ["Hidden target"], "related_items": ["Tool"]},
        {"context_level": "role", "context_key": "D078|sociologist", "item_type": "tool", "item_key": "tool", "name": "Tool", "guidance_owner": "role", "data_state": "source_backed"},
        {"context_level": "role", "context_key": "D078|sociologist", "item_type": "skill", "item_key": "hidden", "name": "Hidden target", "guidance_owner": "role", "data_state": "review_only"},
        {"context_level": "role", "context_key": "D078|sociologist", "item_type": "certification", "item_key": "unowned", "name": "Unowned", "guidance_owner": "domain", "data_state": "source_backed"},
    ]
    edges = [
        {"context_level": "role", "context_key": "D078|sociologist", "from_item_type": "skill", "from_item_key": "evidence", "to_item_type": "tool", "to_item_key": "tool", "to_name": "Tool", "relationship_type": "works_with", "relationship_status": "source_backed", "data_state": "source_backed", "guidance_owner": "role"},
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
