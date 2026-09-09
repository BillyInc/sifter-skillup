"""GET /api/career/search — the `skills` group after the v2 taxonomy sweep.

migration_career_v2.sql dropped `domain_bridge_skills`, `role_bridge_skills`
and `adjacent_prerequisites` and did not recreate them: v2 keeps the same
skills as JSONB on `domains.foundation_skills`,
`domain_subgroups.cluster_skills` and `domain_roles.essential_skills` /
`optional_skills`. The search route still queried the dropped tables through a
`safe_query` helper that swallowed the missing-relation error, so the group
returned `[]` for every query instead of failing.

These tests pin the replacement: the group is answered from the JSONB layers,
the pipe-joined string shape that most seeded role rows use is split into real
skills, and a missing relation is logged loudly rather than at debug.
"""

import asyncio
from unittest.mock import MagicMock, patch

import routes.career_routes as cr

DOMAINS = [
    {
        "id": "d1",
        "domain_key": "D001",
        "name": "Software Engineering",
        "cluster": "ICT",
        "foundation_skills": [
            {"skill": "computer programming", "prevalence": 0.4, "n": 9},
            {"skill": "software testing", "prevalence": 0.2, "n": 5},
        ],
    },
]
SUBGROUPS = [
    {
        "id": "s1",
        "domain_id": "d1",
        "label": "Application developers",
        "description": None,
        "cluster_skills": ["programming languages", "version control"],
    },
]
ROLES = [
    {
        "role_key": "D001|Backend Developer",
        "role_name": "Backend Developer",
        "domain_id": "d1",
        "tier": "entry",
        # The shape 4395 of 5093 seeded rows actually use.
        "essential_skills": "API design | database programming | testing",
        "optional_skills": ["container orchestration"],
    },
]


def _svc_with(domains=DOMAINS, subgroups=SUBGROUPS, roles=ROLES):
    def table(name):
        t = MagicMock()
        for method in ("select", "order", "eq", "ilike", "in_", "limit"):
            getattr(t, method).return_value = t
        payload = {
            "domains": domains,
            "domain_subgroups": subgroups,
            "domain_roles": roles,
        }.get(name, [])
        if isinstance(payload, BaseException):
            t.execute.side_effect = payload
        else:
            t.execute.return_value = MagicMock(data=payload)
        return t

    return MagicMock(table=table)


def _search(q, svc=None) -> dict:
    cr._reset_skill_index_cache()
    with patch.object(cr, "_svc", lambda: svc or _svc_with()):
        data = asyncio.run(cr.search_career(q=q)).data
    cr._reset_skill_index_cache()
    assert data is not None
    return data


class TestSearchSkillLayers:
    def test_domain_foundation_skill_is_searchable(self):
        skills = _search("programming")["data"]["skills"]
        names = {s["name"] for s in skills}
        assert "computer programming" in names
        hit = next(s for s in skills if s["name"] == "computer programming")
        assert hit["domainId"] == "D001"
        assert hit["domainName"] == "Software Engineering"
        assert hit["context"] == "Foundation skill"

    def test_subgroup_cluster_skill_is_searchable(self):
        skills = _search("version")["data"]["skills"]
        assert [s["name"] for s in skills] == ["version control"]
        assert skills[0]["context"] == "Sub-group skill — Application developers"

    def test_pipe_joined_role_skills_are_split_into_separate_skills(self):
        skills = _search("database")["data"]["skills"]
        assert [s["name"] for s in skills] == ["database programming"]
        assert skills[0]["context"] == "Role skill — Backend Developer"

    def test_optional_role_skills_are_labelled_as_optional(self):
        skills = _search("orchestration")["data"]["skills"]
        assert skills[0]["context"] == "Role skill (optional) — Backend Developer"

    def test_one_skill_name_cannot_flood_the_group(self):
        shared = [
            {
                "id": f"d{i}",
                "domain_key": f"D00{i}",
                "name": f"Domain {i}",
                "cluster": "ICT",
                "foundation_skills": [{"skill": "financial statements"}],
            }
            for i in range(1, 5)
        ]
        svc = _svc_with(domains=shared, subgroups=[], roles=[])
        skills = _search("financial", svc=svc)["data"]["skills"]
        assert len(skills) == cr._MAX_DOMAINS_PER_SKILL
        assert {s["domainId"] for s in skills} == {"D001", "D002"}

    def test_optional_groups_are_actually_executed(self):
        # `safe_query` used to read `.data` off the PostgREST request builder
        # without calling `.execute()`. That raised AttributeError into its own
        # except branch, so every optional group returned [] regardless of the
        # query. A populated sub-group here is the regression guard.
        data = _search("developers")["data"]
        assert [g["name"] for g in data["subgroups"]] == ["Application developers"]

    def test_no_match_returns_an_empty_group_not_an_error(self):
        assert _search("zzzzz")["data"]["skills"] == []

    def test_skill_layer_failure_does_not_break_the_whole_search(self):
        def boom(_svc):
            raise RuntimeError("skill index unavailable")

        with patch.object(cr, "_build_skill_index", boom):
            data = _search("programming")["data"]
        assert data["skills"] == []
        # The rest of the search still answers.
        assert [d["id"] for d in data["domains"]] == ["D001"]


class TestSkillTextSplitting:
    def test_pipe_joined_string_becomes_individual_skills(self):
        assert cr._skill_text("a | b | c") == ["a", "b", "c"]

    def test_semicolon_joined_string_becomes_individual_skills(self):
        assert cr._skill_text("laboratory safety; data logging") == [
            "laboratory safety",
            "data logging",
        ]

    def test_plain_string_is_unchanged(self):
        assert cr._skill_text("risk management") == ["risk management"]

    def test_list_and_dict_shapes_still_work(self):
        assert cr._skill_text(["x", {"skill": "y"}]) == ["x", "y"]

    def test_non_skill_shapes_are_dropped(self):
        assert cr._skill_text(None) == []
        assert cr._skill_text({"skill": "y"}) == []


class TestMissingRelationDetection:
    def test_postgrest_schema_cache_error_is_recognised(self):
        exc = Exception(
            "{'code': 'PGRST205', 'message': \"Could not find the table "
            "'skillup_dev.domain_bridge_skills' in the schema cache\"}"
        )
        assert cr._is_missing_relation(exc) is True

    def test_undefined_table_sqlstate_is_recognised(self):
        assert cr._is_missing_relation(Exception('42P01: relation "x" does not exist')) is True

    def test_an_ordinary_failure_is_not_a_missing_relation(self):
        assert cr._is_missing_relation(TimeoutError("connection timed out")) is False
