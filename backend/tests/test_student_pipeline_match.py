"""Unit tests for structured subject-to-programme matching.

Regression: an option whose requirements consist ONLY of one_of groups
(no fixed "required" subjects) must count the selected subjects that
satisfied those groups in matchedSubjectCount, instead of reporting 0
and being mis-ranked.
"""

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

    def limit(self, *args, **kwargs):
        return self

    def execute(self):
        return _FakeResult(self._data)


class _FakeSvc:
    def __init__(self, tables):
        self._tables = tables

    def table(self, name):
        return _FakeQuery(self._tables.get(name, []))


def _item(option_id, role, name, group_key=None, min_from_group=None):
    return {
        "option_id": option_id,
        "requirement_role": role,
        "group_key": group_key,
        "min_from_group": min_from_group,
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
