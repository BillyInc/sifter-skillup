"""Unit tests for structured subject-to-programme matching.

Regression: an option whose requirements consist ONLY of one_of groups
(no fixed "required" subjects) must count the selected subjects that
satisfied those groups in matchedSubjectCount, instead of reporting 0
and being mis-ranked.
"""

import asyncio

from routes import student_pipeline_routes as spr


class _FakeResult:
    def __init__(self, data):
        self.data = data


class _FakeQuery:
    def __init__(self, data):
        self._data = data

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def in_(self, *args, **kwargs):
        return self

    def contains(self, *args, **kwargs):
        if args and args[0] == "exam_types" and len(args) > 1:
            wanted = set(args[1] or [])
            self._data = [
                row for row in self._data
                if wanted.issubset(set(row.get("exam_types") or []))
            ]
        return self

    def ilike(self, *args, **kwargs):
        return self

    def order(self, *args, **kwargs):
        return self

    def limit(self, *args, **kwargs):
        return self

    def execute(self):
        return _FakeResult(self._data)


class _FakeSvc:
    def __init__(self, tables):
        self._tables = tables

    def table(self, name):
        if name == "subject_catalog" and name not in self._tables:
            subjects = {}
            for item in self._tables.get("programme_subject_option_items", []):
                catalog = item.get("subject_catalog") or {}
                if catalog.get("name"):
                    subjects[catalog["name"]] = {
                        "id": catalog.get("id") or _subject_id(catalog["name"]),
                        "name": catalog["name"],
                        "code": catalog.get("code"),
                    }
            return _FakeQuery(list(subjects.values()))
        if name == "programme_subject_rule_records" and name not in self._tables:
            # Existing matcher fixtures predate the deployment-authority gate;
            # synthesize the matching typed rows unless a test explicitly
            # supplies an empty/stale authority table.
            return _FakeQuery([
                {
                    "jamb_programme_id": option.get("jamb_programme_id"),
                    "requirement_id": option.get("requirement_id"),
                    "exam_type": option.get("exam_type"),
                    "rule_status": "matchable",
                    "source_text": option.get("source_text"),
                }
                for option in self._tables.get("programme_subject_options", [])
            ])
        rows = self._tables.get(name, [])
        if name == "subject_catalog":
            rows = [
                {**row, "id": row.get("id") or _subject_id(row.get("name"))}
                for row in rows
            ]
        return _FakeQuery(rows)


def _subject_id(name):
    return f"subject-{str(name or '').strip().lower().replace(' ', '-')}"


def _item(option_id, role, name, group_key=None, min_from_group=None, distinct_group_key=None):
    return {
        "option_id": option_id,
        "requirement_role": role,
        "group_key": group_key,
        "min_from_group": min_from_group,
        "distinct_group_key": distinct_group_key,
        "subject_catalog": {"id": _subject_id(name), "name": name, "code": name[:3].upper()},
    }


def test_jamb_detail_uses_registry_when_optional_detail_view_is_empty(monkeypatch):
    tables = {
        "v_jamb_programme_details": [],
        "jamb_programmes": [{
            "id": "jp1",
            "jamb_name": "Library Science",
            "jamb_faculty": "Education",
            "degree_type": "B.Sc.",
            "is_blend": False,
            "skills_technical": ["Research"],
            "skills_transferable": ["Communication"],
        }],
        "programme_subject_requirements": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))
    monkeypatch.setattr(spr, "_programme_context_items_for_student", lambda *args: [])
    monkeypatch.setattr(spr, "_programme_resources_for_student", lambda *args: [])

    response = asyncio.run(spr.get_jamb_programme("jp1"))

    assert response.data["status"] == "real"
    assert response.data["data"]["jambName"] == "Library Science"
    assert response.data["data"]["requirements"]["requirementStatus"] == "source_missing"


def test_one_of_only_option_counts_group_matches(monkeypatch):
    tables = {
        "programme_subject_options": [
            {
                "id": "opt1",
                "jamb_programme_id": "jp1",
                "exam_type": "utme",
                "option_label": "A",
                "min_required": 2,
                "source_text": "Any two of Physics, Chemistry, Biology",
            }
        ],
        "programme_subject_option_items": [
            _item("opt1", "one_of", "Physics", group_key="g1", min_from_group=2),
            _item("opt1", "one_of", "Chemistry", group_key="g1", min_from_group=2),
            _item("opt1", "one_of", "Biology", group_key="g1", min_from_group=2),
        ],
        # Empty details view — output rows then carry only the score fields.
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    selected = {"physics", "chemistry", "english language"}
    out = spr._match_structured_subject_options(selected, limit=10)

    assert len(out) == 1
    row = out[0]
    assert row["jambProgrammeId"] == "jp1"
    # Previously 0: one_of matches were ignored entirely.
    assert row["matchedSubjectCount"] == 2
    # matchedSubjects echoes the CATALOGUE's canonical display name, not the
    # caller's input casing -- the selected set above is lowercase. Subject
    # names reach the UI directly, so "Chemistry" is the wanted form, as is
    # the alias mapping ("maths" -> "Mathematics", "accounting" ->
    # "Principles of Accounts").
    assert sorted(row["matchedSubjects"]) == ["Chemistry", "Physics"]
    # matchBasis names the exam basis that produced the match rather than the
    # old constant "structured", which no longer exists anywhere: it is now
    # "utme"/"olevel" (from exam_type, defaulting to utme), "combined", or
    # "text" for the unstructured fallback.
    assert row["matchBasis"] == "utme"


def test_required_and_one_of_matches_are_deduped(monkeypatch):
    tables = {
        "programme_subject_options": [
            {
                "id": "opt1",
                "jamb_programme_id": "jp1",
                "exam_type": "utme",
                "option_label": "A",
                # Mathematics is required and the group contributes one more
                # distinct subject; the duplicate Mathematics item must not
                # inflate this fixture to an impossible three-subject rule.
                "min_required": 2,
                "source_text": "Mathematics and any one of Physics, Chemistry",
            }
        ],
        "programme_subject_option_items": [
            _item("opt1", "required", "Mathematics"),
            # Mathematics also appears in a group: must not double-count.
            _item("opt1", "one_of", "Mathematics", group_key="g1", min_from_group=1),
            _item("opt1", "one_of", "Physics", group_key="g1", min_from_group=1),
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    selected = {"mathematics", "physics"}
    out = spr._match_structured_subject_options(selected, limit=10)

    assert len(out) == 1
    assert out[0]["matchedSubjectCount"] == 2
    assert out[0]["matchedSubjects"] == ["Mathematics", "Physics"]


def test_unsatisfied_one_of_group_still_excludes_option(monkeypatch):
    tables = {
        "programme_subject_options": [
            {
                "id": "opt1",
                "jamb_programme_id": "jp1",
                "exam_type": "utme",
                "option_label": "A",
                "min_required": 2,
                "source_text": "Any two of Physics, Chemistry, Biology",
            }
        ],
        "programme_subject_option_items": [
            _item("opt1", "one_of", "Physics", group_key="g1", min_from_group=2),
            _item("opt1", "one_of", "Chemistry", group_key="g1", min_from_group=2),
            _item("opt1", "one_of", "Biology", group_key="g1", min_from_group=2),
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    # Only one subject from the group; min_from_group is 2.
    out = spr._match_structured_subject_options({"physics"}, limit=10)
    assert out == []


def test_distinct_one_of_groups_cannot_reuse_one_subject(monkeypatch):
    tables = {
        "programme_subject_options": [
            {
                "id": "opt1",
                "jamb_programme_id": "jp1",
                "exam_type": "utme",
                "option_label": "A",
                "min_required": 3,
                "source_text": "Any two from Arts and one of History or Government",
            }
        ],
        "programme_subject_option_items": [
            _item("opt1", "one_of", "Literature", group_key="g1", min_from_group=2, distinct_group_key="d1"),
            _item("opt1", "one_of", "History", group_key="g1", min_from_group=2, distinct_group_key="d1"),
            _item("opt1", "one_of", "Government", group_key="g2", min_from_group=1, distinct_group_key="d1"),
            _item("opt1", "one_of", "History", group_key="g2", min_from_group=1, distinct_group_key="d1"),
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    # History alone cannot satisfy both groups. A third distinct subject is
    # required even though History appears in both source groups.
    assert spr._match_structured_subject_options({"literature", "history"}, limit=10) == []
    assert spr._match_structured_subject_options({"literature", "history", "government"}, limit=10)


def test_combined_match_requires_minimum_utme_and_olevel_subjects():
    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Physics, Chemistry",
            olevel_subjects="English Language, Mathematics, Physics, Chemistry",
            exam_type="combined",
        )
    )

    assert result.data["data"] == []
    assert "five O-level" in result.data["meta"]["notice"]

    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Physics",
            olevel_subjects="English Language, Mathematics, Physics, Chemistry, Biology",
            exam_type="combined",
        )
    )

    assert result.data["data"] == []
    assert "three other UTME" in result.data["meta"]["notice"]


def test_olevel_route_returns_programme_possibilities_without_utme(monkeypatch):
    def fake_structured(selected, limit, exam_type="utme", require_full=True):
        assert exam_type == "olevel"
        assert require_full is True
        return [{
            "jambProgrammeId": "jp1",
            "matchedSubjectCount": 5,
            "matchedSubjects": ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
            "missingSubjects": [],
            "requirementText": "Five credits including English Language, Mathematics, Physics, Chemistry and Biology",
            "matchBasis": "olevel",
        }]

    monkeypatch.setattr(spr, "_match_structured_subject_options", fake_structured)
    monkeypatch.setattr(spr, "_attach_school_context", lambda items, *_args: items)
    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="",
            olevel_subjects="English Language, Mathematics, Physics, Chemistry, Biology",
            exam_type="olevel",
        )
    )

    assert result.data["status"] == "real"
    assert result.data["data"][0]["jambProgrammeId"] == "jp1"
    assert result.data["data"][0]["matchBasis"] == "olevel"


def test_utme_and_combined_routes_require_use_of_english():
    for exam_type, olevel_subjects in (("utme", ""), ("combined", "English Language, Mathematics, Physics, Chemistry, Biology")):
        result = asyncio.run(
            spr.programmes_by_subjects(
                subjects="Mathematics, Physics, Chemistry, Biology",
                olevel_subjects=olevel_subjects,
                exam_type=exam_type,
            )
        )

        assert result.data["data"] == []
        assert "Use of English" in result.data["meta"]["notice"]


def test_stream_filters_subjects_but_keeps_cross_listed_rows(monkeypatch):
    monkeypatch.setattr(spr, "get_json", lambda _key: None)
    monkeypatch.setattr(spr, "set_json", lambda *args: None)
    monkeypatch.setattr(
        spr,
        "_svc",
        lambda: _FakeSvc(
            {
                "subject_catalog": [
                    {
                        "id": "science-subject",
                        "code": "PHY",
                        "name": "Physics",
                        "aliases": [],
                        "exam_types": ["utme", "olevel"],
                        "category": "science",
                        "stream_tags": ["science"],
                    },
                    {
                        "id": "cross-stream-subject",
                        "code": "ECON",
                        "name": "Economics",
                        "aliases": [],
                        "exam_types": ["utme", "olevel"],
                        "category": "social_science",
                        "stream_tags": ["commercial", "art"],
                    },
                ]
            }
        ),
    )

    result = asyncio.run(spr.list_subjects(q=None, stream="science", exam_type="utme"))
    names = [row["name"] for row in result.data["data"]]

    assert names == ["Physics"]


def test_technical_stream_filters_each_exam_layer_and_preserves_cross_listing(monkeypatch):
    monkeypatch.setattr(spr, "get_json", lambda _key: None)
    monkeypatch.setattr(spr, "set_json", lambda *args: None)
    monkeypatch.setattr(
        spr,
        "_svc",
        lambda: _FakeSvc({
            "subject_catalog": [
                {
                    "id": "technical-only",
                    "code": "TD",
                    "name": "Technical Drawing",
                    "aliases": [],
                    "exam_types": ["olevel"],
                    "category": "technical",
                    "stream_tags": ["science", "technical"],
                },
                {
                    "id": "technical-cross-listed",
                    "code": "HEC",
                    "name": "Home Economics",
                    "aliases": [],
                    "exam_types": ["utme", "olevel"],
                    "category": "technical",
                    "stream_tags": ["art", "science", "technical"],
                },
                {
                    "id": "science-only",
                    "code": "PHY",
                    "name": "Physics",
                    "aliases": [],
                    "exam_types": ["utme", "olevel"],
                    "category": "science",
                    "stream_tags": ["science"],
                },
            ]
        }),
    )

    olevel = asyncio.run(spr.list_subjects(q=None, stream="technical", exam_type="olevel"))
    utme = asyncio.run(spr.list_subjects(q=None, stream="technical", exam_type="utme"))

    assert [row["name"] for row in olevel.data["data"]] == [
        "Technical Drawing", "Home Economics"
    ]
    assert [row["name"] for row in utme.data["data"]] == ["Home Economics"]


def test_subject_list_includes_exam_layers_stream_groups_and_alias_search(monkeypatch):
    monkeypatch.setattr(spr, "get_json", lambda _key: None)
    monkeypatch.setattr(spr, "set_json", lambda *args: None)
    monkeypatch.setattr(
        spr,
        "_svc",
        lambda: _FakeSvc({
            "subject_catalog": [{
                "id": "civic",
                "code": "CIV",
                "name": "Civic Education",
                "aliases": ["Civics"],
                "exam_types": ["utme", "olevel"],
                "category": "general",
                "stream_tags": ["science", "commercial", "art"],
            }]
        }),
    )

    result = asyncio.run(spr.list_subjects(q="Civics", stream="arts", exam_type="utme"))

    assert [row["name"] for row in result.data["data"]] == ["Civic Education"]
    assert result.data["data"][0]["examTypes"] == ["utme", "olevel"]
    assert result.data["data"][0]["streams"] == ["science", "commercial", "arts"]


def test_programme_search_shape_keeps_requirements_for_detail_view():
    result = spr._jamb_detail_out(
        {
            "jamb_programme_id": "jp1",
            "jamb_name": "Business Administration",
            "jamb_faculty": "Management Sciences",
            "degree_type": "B.Sc.",
            "utme_subjects": "English, Mathematics",
            "olevel_requirement": "Five credits",
        }
    )

    assert result["jambName"] == "Business Administration"
    assert "utmeSubjects" not in result
    assert "olevelRequirement" not in result


def test_text_fallback_respects_requested_exam_layer(monkeypatch):
    tables = {
        "programme_subject_requirements": [
            {
                "jamb_programme_id": "jp1",
                "utme_subjects": "Physics and Mathematics",
                "olevel_requirement": "Five credits including Woodwork",
            }
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    assert spr._match_text_requirements({"woodwork"}, limit=10, exam_type="utme") == []
    assert spr._match_text_requirements({"woodwork"}, limit=10, exam_type="olevel")


def test_incomplete_structured_option_cannot_match_missing_named_olevel_subject(monkeypatch):
    # Regression for stale SQL that marked an option parsed but omitted a
    # named subject from programme_subject_option_items. The source text says
    # Economics is required; English + Mathematics alone must not pass.
    tables = {
        "programme_subject_options": [
            {
                "id": "opt1",
                "jamb_programme_id": "jp1",
                "exam_type": "olevel",
                "option_label": "5 credit passes",
                "min_required": 5,
                "source_text": "Five credit passes to include English Language, Mathematics and Economics plus any other two subjects.",
            }
        ],
        "programme_subject_option_items": [
            _item("opt1", "required", "English Language"),
            _item("opt1", "required", "Mathematics"),
        ],
        "subject_catalog": [
            {"name": "English Language", "code": "ENG"},
            {"name": "Mathematics", "code": "MATH"},
            {"name": "Economics", "code": "ECON"},
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    out = spr._match_structured_subject_options(
        {"english language", "mathematics", "agricultural science", "animal husbandry", "arabic"},
        limit=10,
        exam_type="olevel",
    )
    assert out == []


def test_olevel_any_other_subject_accepts_trade_subject(monkeypatch):
    tables = {
        "programme_subject_options": [{
            "id": "opt1",
            "jamb_programme_id": "jp1",
            "exam_type": "olevel",
            "option_label": "5 credit passes",
            "min_required": 5,
            "source_text": (
                "Five (5) SSC credit passes in English Language, Mathematics, "
                "Physics, Chemistry and any other subject."
            ),
        }],
        "programme_subject_option_items": [
            _item("opt1", "required", "English Language"),
            _item("opt1", "required", "Mathematics"),
            _item("opt1", "required", "Physics"),
            _item("opt1", "required", "Chemistry"),
            _item("opt1", "one_of", "Auto Mechanics", group_key="g1", min_from_group=1),
            _item("opt1", "one_of", "Catering Craft Practice", group_key="g1", min_from_group=1),
            _item("opt1", "one_of", "Woodwork", group_key="g1", min_from_group=1),
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    out = spr._match_structured_subject_options(
        {"english language", "mathematics", "physics", "chemistry", "auto mechanics"},
        limit=10,
        exam_type="olevel",
    )
    assert len(out) == 1
    assert "Auto Mechanics" in out[0]["matchedSubjects"]


def test_generic_olevel_scope_cannot_match_catalogue_as_exact_requirement(monkeypatch):
    # A parser must not turn an unresolved "relevant subjects" sentence into
    # permission for every remaining subject.
    names = ["English Language", "Mathematics"] + [f"Subject {i}" for i in range(25)]
    tables = {
        "programme_subject_options": [{
            "id": "opt1",
            "jamb_programme_id": "jp1",
            "exam_type": "olevel",
            "option_label": "5 credit passes",
            "min_required": 5,
            "source_text": "Five (5) SSC credit passes including English Language, Mathematics and any other relevant subjects.",
        }],
        "programme_subject_option_items": [
            _item("opt1", "required", "English Language"),
            _item("opt1", "required", "Mathematics"),
            *[_item("opt1", "one_of", name, group_key="g1", min_from_group=3) for name in names[2:]],
        ],
        "subject_catalog": [{"name": name, "code": name[:3].upper()} for name in names],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    assert spr._match_structured_subject_options(
        {"english language", "mathematics", "subject 1", "subject 2", "subject 3"},
        limit=10,
        exam_type="olevel",
    ) == []


def test_olevel_english_mathematics_only_scope_cannot_match_catalogue_as_exact_requirement(monkeypatch):
    # "Including English Language and Mathematics" does not identify the
    # remaining three credits. A generated whole-catalogue group must not turn
    # that incomplete evidence into an exact programme match.
    names = ["English Language", "Mathematics"] + [f"Subject {i}" for i in range(25)]
    tables = {
        "programme_subject_options": [{
            "id": "opt1",
            "jamb_programme_id": "jp1",
            "exam_type": "olevel",
            "option_label": "5 credit passes",
            "min_required": 5,
            "source_text": "Five (5) SSC credit passes including English Language and Mathematics.",
        }],
        "programme_subject_option_items": [
            _item("opt1", "required", "English Language"),
            _item("opt1", "required", "Mathematics"),
            *[_item("opt1", "one_of", name, group_key="g1", min_from_group=3) for name in names[2:]],
        ],
        "subject_catalog": [{"name": name, "code": name[:3].upper()} for name in names],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    assert spr._match_structured_subject_options(
        {"english language", "mathematics", "subject 1", "subject 2", "subject 3"},
        limit=10,
        exam_type="olevel",
    ) == []


def test_relevant_olevel_scope_cannot_turn_arabic_and_trade_subjects_into_a_match(monkeypatch):
    # This is the reported false-positive shape: the brochure names English
    # and Mathematics, then says "any other relevant subjects", while an old
    # parser seed expanded that unknown scope to the entire catalogue.
    names = [
        "English Language",
        "Mathematics",
        "Arabic",
        "Agricultural Science",
        "Animal Husbandry",
    ] + [f"Subject {i}" for i in range(25)]
    tables = {
        "programme_subject_options": [{
            "id": "opt1",
            "jamb_programme_id": "jp1",
            "exam_type": "olevel",
            "option_label": "5 credit passes",
            "min_required": 5,
            "source_text": "Five credit passes including English Language, Mathematics and any other relevant subjects.",
        }],
        "programme_subject_option_items": [
            _item("opt1", "required", "English Language"),
            _item("opt1", "required", "Mathematics"),
            *[_item("opt1", "one_of", name, group_key="g1", min_from_group=3) for name in names[2:]],
        ],
        "subject_catalog": [{"name": name, "code": name[:3].upper()} for name in names],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    assert spr._match_structured_subject_options(
        {"english language", "mathematics", "arabic", "agricultural science", "animal husbandry"},
        limit=10,
        exam_type="olevel",
    ) == []


def test_use_of_english_alias_is_canonicalized_for_utme():
    assert spr._canonical_subject_name("Use of English") == "English Language"
    assert spr._canonical_subject_name("use of english language") == "English Language"


def test_arabic_can_match_a_real_utme_rule_without_broad_olevel_inference(monkeypatch):
    tables = {
        "programme_subject_options": [{
            "id": "opt1",
            "jamb_programme_id": "jp1",
            "exam_type": "utme",
            "option_label": "Arabic, Literature and one other",
            "min_required": 3,
            "source_text": "Use of English, Arabic, Literature in English and one other relevant subject.",
        }],
        "programme_subject_option_items": [
            _item("opt1", "required", "English Language"),
            _item("opt1", "required", "Arabic"),
            _item("opt1", "required", "Literature in English"),
            _item("opt1", "one_of", "Government", group_key="g1", min_from_group=1),
            _item("opt1", "one_of", "History", group_key="g1", min_from_group=1),
        ],
        "subject_catalog": [
            {"name": name, "code": name[:3].upper()}
            for name in ["English Language", "Arabic", "Literature in English", "Government", "History"]
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    out = spr._match_structured_subject_options(
        {"english language", "arabic", "literature in english", "government"},
        limit=10,
        exam_type="utme",
    )
    assert [row["jambProgrammeId"] for row in out] == ["jp1"]
    assert "Arabic" in out[0]["matchedSubjects"]


def test_stale_options_without_typed_rule_authority_cannot_match(monkeypatch):
    tables = {
        "programme_subject_options": [
            {
                "id": "opt1",
                "jamb_programme_id": "jp1",
                "requirement_id": "req1",
                "exam_type": "utme",
                "option_label": "A",
                "min_required": 2,
                "source_text": "Physics and Mathematics",
            }
        ],
        "programme_subject_option_items": [
            _item("opt1", "required", "Physics"),
            _item("opt1", "required", "Mathematics"),
        ],
        "programme_subject_rule_records": [],
        "subject_catalog": [
            {"name": "Physics", "code": "PHY"},
            {"name": "Mathematics", "code": "MATH"},
        ],
        "v_jamb_programme_details": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    assert spr._match_structured_subject_options(
        {"physics", "mathematics"}, limit=10, exam_type="utme"
    ) == []


def test_subject_match_does_not_fallback_to_shared_text(monkeypatch):
    # Text overlap is useful for programme-detail reading, not for an exact
    # subject-match result. This prevents a common word such as English from
    # producing unrelated programmes when structured data is unavailable.
    monkeypatch.setattr(spr, "_match_structured_subject_options", lambda *args, **kwargs: [])
    monkeypatch.setattr(
        spr,
        "_match_text_requirements",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("text fallback must not run")),
    )
    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Physics, Chemistry",
            olevel_subjects="English Language, Mathematics, Physics, Chemistry, Biology",
            exam_type="combined",
        )
    )
    assert result.data["status"] == "real"
    assert result.data["data"] == []
    assert "exact structured subject match" in result.data["meta"]["notice"]


def test_combined_match_keeps_utme_result_and_reports_olevel_gap(monkeypatch):
    def fake_structured(selected, limit, exam_type="utme", require_full=True):
        if exam_type == "utme":
            return [{
                "jambProgrammeId": "jp1",
                "matchedSubjectCount": 4,
                "matchedSubjects": ["Use of English", "Mathematics", "Physics", "Chemistry"],
                "missingSubjects": [],
                "requirementText": "Use of English, Mathematics, Physics and Chemistry",
            }]
        return [{
            "jambProgrammeId": "jp1",
            "matchedSubjectCount": 4,
            "matchedSubjects": ["English Language", "Mathematics", "Physics", "Chemistry"],
            "missingSubjects": ["Biology"],
            "requirementText": "Five credits including English Language, Mathematics, Physics, Chemistry and Biology",
        }]

    monkeypatch.setattr(spr, "_match_structured_subject_options", fake_structured)
    monkeypatch.setattr(spr, "_attach_school_context", lambda items, *_args: items)
    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="Use of English, Mathematics, Physics, Chemistry",
            olevel_subjects="English Language, Mathematics, Physics, Chemistry, Economics",
            exam_type="combined",
        )
    )

    assert result.data["status"] == "real"
    row = result.data["data"][0]
    assert row["jambProgrammeId"] == "jp1"
    assert row["eligibilityStatus"] == "utme_match_olevel_gap"
    assert row["olevelMissingSubjects"] == ["Biology"]


def test_combined_match_marks_both_layers_eligible(monkeypatch):
    def fake_structured(selected, limit, exam_type="utme", require_full=True):
        return [{
            "jambProgrammeId": "jp1",
            "matchedSubjectCount": 4 if exam_type == "utme" else 5,
            "matchedSubjects": ["English Language", "Mathematics", "Arabic", "Government"]
            if exam_type == "utme"
            else ["English Language", "Arabic", "Government", "History", "Literature in English"],
            "missingSubjects": [],
            "requirementText": "Arabic and two Arts subjects; five O-level credits including English and Arabic",
        }]

    monkeypatch.setattr(spr, "_match_structured_subject_options", fake_structured)
    monkeypatch.setattr(spr, "_attach_school_context", lambda items, *_args: items)
    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Arabic, Government, History",
            olevel_subjects="English Language, Arabic, Government, History, Literature in English",
            exam_type="combined",
        )
    )

    assert result.data["status"] == "real"
    assert result.data["data"][0]["eligibilityStatus"] == "eligible"


def test_invalid_subject_exam_mode_does_not_default_to_utme():
    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Physics, Chemistry",
            olevel_subjects="",
            exam_type="not-an-exam-layer",
        )
    )

    assert result.data["data"] == []
    assert "UTME subjects" in result.data["meta"]["notice"]


def test_subject_match_keeps_all_university_offerings(monkeypatch):
    offerings = [
        {
            "school_id": f"school-{index}",
            "school_name": f"University {index}",
            "institution_type": "university",
            "jamb_programme_id": "jp1",
            "jamb_name": "Business Administration",
        }
        for index in range(15)
    ]
    monkeypatch.setattr(
        spr,
        "_svc",
        lambda: _FakeSvc(
            {
                "v_school_jamb_programmes": offerings,
                "schools": [],
                "school_programmes": [],
            }
        ),
    )

    rows = spr._attach_school_context([{"jambProgrammeId": "jp1"}])

    assert len(rows[0]["schoolOfferings"]) == 15
    assert rows[0]["schoolCount"] == 15


def test_subject_match_preserves_authoritative_school_identity(monkeypatch):
    monkeypatch.setattr(
        spr,
        "_svc",
        lambda: _FakeSvc(
            {
                "v_school_jamb_programmes": [{
                    "school_id": "school-1",
                    "school_name": "UOE",
                    "institution_type": "university",
                    "jamb_programme_id": "jp1",
                    "jamb_name": "Sociology",
                }],
                "schools": [{
                    "id": "school-1",
                    "name": "UOE",
                    "official_name": "University of Example",
                    "short_name": "UOE",
                    "address": "1 Main Road",
                }],
                "school_programmes": [],
            }
        ),
    )

    rows = spr._attach_school_context([{"jambProgrammeId": "jp1"}])
    offering = rows[0]["schoolOfferings"][0]

    assert offering["officialName"] == "University of Example"
    assert offering["shortName"] == "UOE"
    assert offering["address"] == "1 Main Road"


def test_verified_university_rule_can_add_a_discovery_match(monkeypatch):
    tables = {
        "school_programme_requirement_exceptions": [{"id": "ex1", "parse_status": "parsed"}],
        "school_programme_subject_options": [{
            "id": "local1",
            "exception_id": "ex1",
            "school_id": "s1",
            "jamb_programme_id": "jp1",
            "exam_type": "utme",
            "rule_scope": "full",
            "min_required": 3,
            "source_text": "Mathematics, Economics and Government",
        }],
        "school_programme_subject_option_items": [
            {"option_id": "local1", "requirement_role": "required", "subject_catalog": {"name": "Mathematics"}},
            {"option_id": "local1", "requirement_role": "required", "subject_catalog": {"name": "Economics"}},
            {"option_id": "local1", "requirement_role": "required", "subject_catalog": {"name": "Government"}},
        ],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    rows = spr._match_verified_school_subject_options(
        {"mathematics", "economics", "government", "english language"}, "utme"
    )

    assert rows[0]["jambProgrammeId"] == "jp1"
    assert rows[0]["matchBasis"] == "university_specific"
    assert rows[0]["universityMatchSchoolId"] == "s1"


def test_subject_route_surfaces_verified_university_alternative(monkeypatch):
    monkeypatch.setattr(spr, "_match_structured_subject_options", lambda *args, **kwargs: [])
    monkeypatch.setattr(
        spr,
        "_match_verified_school_subject_options",
        lambda selected, exam_type, school_id=None, limit=2000: [{
            "jambProgrammeId": "jp1",
            "matchedSubjectCount": 3,
            "matchedSubjects": ["Mathematics", "Economics", "Government"],
            "missingSubjects": [],
            "requirementText": "Mathematics, Economics and Government",
            "matchBasis": "university_specific",
            "universityMatchSchoolId": "s1",
        }] if exam_type == "utme" else [],
    )
    monkeypatch.setattr(spr, "_attach_school_context", lambda items, *_args: items)

    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Economics, Government",
            olevel_subjects="",
            exam_type="utme",
        )
    )

    assert result.data["status"] == "real"
    assert result.data["data"][0]["matchBasis"] == "university_specific"
    assert result.data["data"][0]["universitySpecificMatchSchoolIds"] == ["s1"]


def test_combined_university_alternatives_must_share_the_same_university(monkeypatch):
    monkeypatch.setattr(spr, "_match_structured_subject_options", lambda *args, **kwargs: [])

    def local_match(_selected, exam_type, school_id=None, limit=2000):
        return [{
            "jambProgrammeId": "jp1",
            "matchedSubjectCount": 4,
            "matchedSubjects": ["English Language", "Mathematics", "Physics", "Chemistry"],
            "missingSubjects": [],
            "requirementText": "University rule",
            "matchBasis": "university_specific",
            "universityMatchSchoolId": "s1" if exam_type == "utme" else "s2",
        }]

    monkeypatch.setattr(spr, "_match_verified_school_subject_options", local_match)
    monkeypatch.setattr(spr, "_attach_school_context", lambda items, *_args: items)

    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Physics, Chemistry",
            olevel_subjects="English Language, Mathematics, Physics, Chemistry, Biology",
            exam_type="combined",
        )
    )

    assert result.data["status"] == "real"
    assert result.data["data"] == []


def test_university_partial_or_unreviewed_rule_cannot_add_a_match(monkeypatch):
    tables = {
        "school_programme_requirement_exceptions": [{"id": "ex1", "parse_status": "needs_review"}],
        "school_programme_subject_options": [{
            "id": "local1",
            "exception_id": "ex1",
            "school_id": "s1",
            "jamb_programme_id": "jp1",
            "exam_type": "utme",
            "rule_scope": "partial",
            "min_required": 3,
            "source_text": "Mathematics, Economics and Government",
        }],
        "school_programme_subject_option_items": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))

    assert spr._match_verified_school_subject_options(
        {"mathematics", "economics", "government", "english language"}, "utme"
    ) == []


def test_selected_university_full_rule_overrides_national_match(monkeypatch):
    tables = {
        "v_school_jamb_programmes": [{
            "school_id": "s1",
            "institution_type": "university",
            "jamb_programme_id": "jp1",
        }],
        "school_programme_requirement_exceptions": [{"id": "ex1", "parse_status": "parsed"}],
        "school_programme_subject_options": [{
            "id": "local1",
            "exception_id": "ex1",
            "school_id": "s1",
            "jamb_programme_id": "jp1",
            "exam_type": "utme",
            "rule_scope": "full",
            "min_required": 3,
            "source_text": "Physics, Chemistry and Biology",
        }],
        "school_programme_subject_option_items": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))
    monkeypatch.setattr(spr, "_match_structured_subject_options", lambda *args, **kwargs: [{
        "jambProgrammeId": "jp1",
        "matchedSubjectCount": 4,
        "matchedSubjects": ["English Language", "Mathematics", "Economics", "Government"],
        "missingSubjects": [],
    }])
    monkeypatch.setattr(spr, "_match_verified_school_subject_options", lambda *args, **kwargs: [])
    monkeypatch.setattr(spr, "_attach_school_context", lambda items, *args: items)

    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Economics, Government",
            olevel_subjects="",
            exam_type="utme",
            school_id="s1",
        )
    )

    assert result.data["status"] == "real"
    assert result.data["data"] == []


def test_selected_university_limits_offerings_to_that_university(monkeypatch):
    tables = {
        "v_school_jamb_programmes": [
            {"school_id": "s1", "institution_type": "university", "jamb_programme_id": "jp1"},
            {"school_id": "s2", "institution_type": "university", "jamb_programme_id": "jp1"},
        ],
        "schools": [],
        "school_programmes": [],
    }
    monkeypatch.setattr(spr, "_svc", lambda: _FakeSvc(tables))
    monkeypatch.setattr(spr, "_match_structured_subject_options", lambda *args, **kwargs: [{
        "jambProgrammeId": "jp1",
        "matchedSubjectCount": 4,
        "matchedSubjects": ["English Language", "Mathematics", "Physics", "Chemistry"],
        "missingSubjects": [],
    }])
    monkeypatch.setattr(spr, "_match_verified_school_subject_options", lambda *args, **kwargs: [])

    captured = {}

    def attach(items, *args):
        captured["selectedSchoolId"] = args[2]
        return items

    monkeypatch.setattr(spr, "_attach_school_context", attach)
    result = asyncio.run(
        spr.programmes_by_subjects(
            subjects="English Language, Mathematics, Physics, Chemistry",
            olevel_subjects="",
            exam_type="utme",
            school_id="s1",
        )
    )

    assert result.data["status"] == "real"
    assert captured["selectedSchoolId"] == "s1"
