"""Focused contract tests for the skills-discovery matcher.

These tests deliberately exercise the route function with a small in-memory
service mock.  They cover the public contract without requiring a live
Supabase project or changing the matcher implementation.
"""

import asyncio
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

import routes.career_routes as cr


DOMAIN_ID = "domain-1"
DOMAIN_KEY = "D001"
SUBGROUP_ID = "subgroup-1"


class _FakeQuery:
    """Small PostgREST-shaped query mock supporting the route's read calls."""

    def __init__(self, rows):
        self._rows = list(rows)
        self._limit = None
        self._range = None
        self._ilike = []
        self._in = []
        self._eq = []
        self._like = []

    def select(self, *_args, **_kwargs):
        return self

    def limit(self, value):
        self._limit = value
        return self

    def range(self, start, end):
        self._range = (start, end)
        return self

    def ilike(self, field, pattern):
        self._ilike.append((field, pattern))
        return self

    def in_(self, field, values):
        self._in.append((field, set(values)))
        return self

    def eq(self, field, value):
        self._eq.append((field, value))
        return self

    def like(self, field, pattern):
        self._like.append((field, pattern))
        return self

    def execute(self):
        rows = self._rows
        for field, value in self._eq:
            rows = [row for row in rows if row.get(field) == value]
        for field, values in self._in:
            rows = [row for row in rows if row.get(field) in values]
        for field, pattern in self._ilike:
            needle = pattern.replace("%", "").casefold()
            rows = [
                row for row in rows
                if needle in str(row.get(field) or "").casefold()
            ]
        for field, pattern in self._like:
            prefix = pattern.rstrip("%")
            rows = [
                row for row in rows
                if str(row.get(field) or "").startswith(prefix)
            ]
        if self._range is not None:
            start, end = self._range
            rows = rows[start:end + 1]
        elif self._limit is not None:
            rows = rows[:self._limit]
        return MagicMock(data=rows)


def _service_mock(*, roles=None, context_rows=None):
    roles = roles if roles is not None else [_role("role-1", "Python Analyst")]
    context_rows = context_rows if context_rows is not None else [_python_competency()]
    tables = {
        "domains": [{
            "id": DOMAIN_ID,
            "domain_key": DOMAIN_KEY,
            "name": "Autonomous Systems",
            "cluster": "Engineering",
            "description": "Builds intelligent machines and software.",
            "institution_type": "university",
            "foundation_skills": ["Python"],
            "foundation_skill_sources": [],
        }],
        "domain_roles": roles,
        "domain_subgroups": [{
            "id": SUBGROUP_ID,
            "domain_id": DOMAIN_ID,
            "label": "Autonomous Vehicle Systems",
            "cluster_skills": ["Python"],
            "skill_sources": [],
        }],
        "domain_tools": [],
        "domain_certifications": [],
        "career_context_items": context_rows,
    }

    def table(name):
        return _FakeQuery(tables.get(name, []))

    return MagicMock(table=table)


def _role(key, name):
    return {
        "role_key": key,
        "role_name": name,
        "domain_id": DOMAIN_ID,
        "subgroup_id": SUBGROUP_ID,
        "essential_skills": ["Python"],
        "optional_skills": [],
        "tier": "entry",
        "data_state": "source_backed",
        "source_provenance": {},
    }


def _python_competency(**overrides):
    row = {
        "context_level": "domain",
        "context_key": DOMAIN_KEY,
        "domain_key": DOMAIN_KEY,
        "item_type": "competency",
        "item_key": "competency-python",
        "name": "Python",
        "plain_meaning": "Write and understand Python code.",
        "contextual_use": "Use it to prototype autonomous systems.",
        "expected_output": "A working Python prototype.",
        "priority": "build_next",
        "priority_reason": "Python is used throughout this route.",
        "source_references": [{"url": "https://example.test/python"}],
        "geographic_scope": "global",
        "guidance_owner": "domain",
        "data_state": "source_backed",
    }
    row.update(overrides)
    return row


def _discover(*, service, **kwargs):
    params = {
        "match": "both",
        "intent": "learned",
        "category": None,
        "item_type": None,
        "user_type": None,
        "admin_type": None,
    }
    params.update(kwargs)
    with patch.object(cr, "_svc", lambda: service):
        return asyncio.run(cr.discover_by_skills(**params))


def test_audience_scope_is_explicit_for_secondary_and_tutorial_guidance():
    service = _service_mock()

    secondary = _discover(
        service=service,
        skills="Python",
        user_type="ss2",
        admin_type="secondary_school",
    )
    secondary_data = secondary.data["data"]
    assert secondary_data["adminType"] == "secondary_school"
    assert secondary_data["userType"] == "ss2"
    assert secondary_data["allowedUserTypes"] == ["ss1", "ss2", "ss3"]
    assert secondary_data["streamRequired"] is True
    assert secondary_data["audience"] == "school_guidance"

    tutorial = _discover(
        service=service,
        skills="Python",
        user_type="jamb",
        admin_type="tutorial_centre",
    )
    tutorial_data = tutorial.data["data"]
    assert tutorial_data["allowedUserTypes"] == ["jamb"]
    assert tutorial_data["streamOptions"] == []
    assert tutorial_data["streamRequired"] is False
    assert tutorial_data["audience"] == "provider_guidance"

    with pytest.raises(HTTPException) as exc_info:
        _discover(
            service=service,
            skills="Python",
            user_type="undergraduate",
            admin_type="secondary_school",
        )
    assert exc_info.value.status_code == 400
    assert "ss1, ss2, ss3" in str(exc_info.value.detail)


def test_secondary_admin_can_match_one_or_more_selected_stages():
    service = _service_mock()
    response = _discover(
        service=service,
        skills="Python",
        user_type=["ss1", "ss3"],
        admin_type="secondary_school",
    )
    data = response.data["data"]
    assert data["userType"] is None
    assert data["userTypes"] == ["ss1", "ss3"]
    assert data["allowedUserTypes"] == ["ss1", "ss2", "ss3"]


def test_context_competency_matching_has_first_class_source_backed_shape():
    review_only = _python_competency(
        item_key="review-python",
        plain_meaning="Do not expose this review row.",
        guidance_owner="role",
    )
    service = _service_mock(context_rows=[_python_competency(), review_only])

    response = _discover(service=service, skills="Python")

    assert response.data["status"] == "real"
    competencies = response.data["data"]["competencies"]
    assert len(competencies) == 1
    assert competencies[0] == {
        "name": "Python",
        "domainId": DOMAIN_KEY,
        "domainName": "Autonomous Systems",
        "contextLevel": "domain",
        "contextKey": DOMAIN_KEY,
        "plainMeaning": "Write and understand Python code.",
        "contextualUse": "Use it to prototype autonomous systems.",
        "expectedOutput": "A working Python prototype.",
        "matchedSkills": ["Python"],
        "matchScore": 1.0,
        "matchLabel": "Direct match",
        "sourceReferences": [{"url": "https://example.test/python"}],
        "geographicScope": "global",
    }


def test_response_contract_keeps_all_connected_paths_not_only_eight():
    roles = [_role(f"role-{index}", f"Python Route {index:02d}") for index in range(1, 10)]
    service = _service_mock(roles=roles)

    response = _discover(service=service, skills="Python")
    data = response.data["data"]

    assert "competencies" in data
    assert len(data["paths"]) == 9
    assert {path["roleKey"] for path in data["paths"]} == {
        f"role-{index}" for index in range(1, 10)
    }
