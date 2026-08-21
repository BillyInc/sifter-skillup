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
        return _FakeQuery(self._tables.get(name, []))


def _item(option_id, role, name, group_key=None, min_from_group=None, distinct_group_key=None):
    return {
        "option_id": option_id,
        "requirement_role": role,
        "group_key": group_key,
        "min_from_group": min_from_group,
        "distinct_group_key": distinct_group_key,
        "subject_catalog": {"name": name, "code": name[:3].upper()},
    }


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
                "min_required": 3,
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


def test_stream_reorders_but_does_not_hide_subjects(monkeypatch):
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
                        "category": "science",
                        "stream_tags": ["science"],
                    },
                    {
                        "id": "cross-stream-subject",
                        "code": "ECON",
                        "name": "Economics",
                        "aliases": [],
                        "category": "social_science",
                        "stream_tags": ["commercial", "art"],
                    },
                ]
            }
        ),
    )

    result = asyncio.run(spr.list_subjects(q=None, stream="science", exam_type="utme"))
    names = [row["name"] for row in result.data["data"]]

    assert names == ["Physics", "Economics"]


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
