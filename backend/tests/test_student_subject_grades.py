"""Tests for the versioned, authenticated O-level grade store (fake-DB style)."""

import asyncio

import pytest
from fastapi import HTTPException

from routes import student_subject_grades_routes as ssg

CATALOG = [
    {"name": "English Language", "code": "ENG"},
    {"name": "Mathematics", "code": "MATH"},
    {"name": "Government", "code": "GOV"},
]


class _Res:
    def __init__(self, data):
        self.data = data


class _Q:
    def __init__(self, db, name):
        self.db, self.name = db, name
        self.filters, self.op, self.payload = [], "select", None
        self._order = None

    def select(self, *_a, **_k):
        return self

    def limit(self, *_a, **_k):
        return self

    def eq(self, k, v):
        self.filters.append((k, "eq", v))
        return self

    def lt(self, k, v):
        self.filters.append((k, "lt", v))
        return self

    def is_(self, k, v):
        self.filters.append((k, "is", v))
        return self

    def order(self, k, desc=False):
        self._order = (k, desc)
        return self

    def insert(self, row):
        self.op, self.payload = "insert", row
        return self

    def update(self, row):
        self.op, self.payload = "update", row
        return self

    def _match(self, row):
        for k, kind, v in self.filters:
            if kind == "eq" and row.get(k) != v:
                return False
            if kind == "lt" and not (row.get(k) < v):
                return False
            if kind == "is" and v == "null" and row.get(k) is not None:
                return False
        return True

    def execute(self):
        if self.db.missing and self.name == ssg._TABLE:
            raise RuntimeError('relation "skillup_dev.student_subject_grade_sets" does not exist (42P01)')
        rows = self.db.tables.setdefault(self.name, [])
        if self.op == "insert":
            row = {"id": f"id{len(rows)+1}", "superseded_at": None, **self.payload}
            if any(r["user_id"] == row["user_id"] and r["version"] == row["version"] for r in rows):
                raise RuntimeError("duplicate key")
            rows.append(row)
            return _Res([row])
        if self.op == "update":
            hit = [r for r in rows if self._match(r)]
            for r in hit:
                r.update(self.payload)
            return _Res(hit)
        out = [r for r in rows if self._match(r)]
        if self._order:
            out.sort(key=lambda r: r[self._order[0]], reverse=self._order[1])
        return _Res(out)


class _Db:
    def __init__(self, missing=False):
        self.tables = {"subject_catalog": list(CATALOG)}
        self.missing = missing

    def table(self, name): return _Q(self, name)


@pytest.fixture
def db(monkeypatch):
    fake = _Db()
    monkeypatch.setattr(ssg, "_svc", lambda: fake)
    return fake


def _save(grades, user="u1", exam="waec"):
    return asyncio.run(ssg.save_subject_grades(ssg.SubjectGradesIn(exam_body=exam, grades=grades), {"id": user})).data


def _get(user="u1"):
    return asyncio.run(ssg.get_subject_grades({"id": user})).data


def test_save_creates_versions_and_supersedes_previous(db):
    first = _save({"mathematics": "C4", "ENG": "b3"})
    assert first["status"] == "real"
    assert first["data"]["current"]["version"] == 1
    assert first["data"]["current"]["grades"] == {"MATH": "C4", "ENG": "B3"}
    second = _save({"MATH": "A1"}, exam="neco")
    cur = second["data"]["current"]
    assert cur["version"] == 2 and cur["examBody"] == "neco" and second["data"]["created"] is True
    versions = {v["version"]: v for v in second["data"]["versions"]}
    assert versions[1]["supersededAt"] and versions[1]["grades"] == {"MATH": "C4", "ENG": "B3"}
    assert versions[2]["supersededAt"] is None
    assert len(db.tables[ssg._TABLE]) == 2  # nothing deleted or overwritten


def test_unchanged_grades_do_not_create_a_version(db):
    _save({"MATH": "C4"})
    again = _save({"Mathematics": "c4"})
    assert again["data"]["created"] is False and len(db.tables[ssg._TABLE]) == 1


def test_clearing_creates_an_empty_current_version(db):
    _save({"MATH": "C4"})
    cleared = _save({})
    assert cleared["data"]["current"]["grades"] == {} and cleared["data"]["current"]["version"] == 2


@pytest.mark.parametrize("grades", [{"MATH": "G1"}, {"Basket Weaving": "A1"}, {"MATH": "A1", "ENG": ""}])
def test_unknown_subject_or_grade_is_rejected_not_dropped(db, grades):
    with pytest.raises(HTTPException) as err:
        _save(grades)
    assert err.value.status_code == 422
    assert db.tables.get(ssg._TABLE, []) == []


def test_bad_exam_body_and_too_many_entries_rejected(db):
    with pytest.raises(HTTPException) as err:
        _save({"MATH": "A1"}, exam="jamb")
    assert err.value.status_code == 422
    many = {f"S{i}": "A1" for i in range(ssg.MAX_GRADE_ENTRIES + 1)}
    with pytest.raises(HTTPException):
        _save(many)


def test_users_are_isolated(db):
    _save({"MATH": "A1"}, user="u1")
    assert _get("u2")["data"]["current"] is None
    assert _get("u1")["data"]["current"]["grades"] == {"MATH": "A1"}
    _save({"MATH": "F9"}, user="u2")
    assert _get("u1")["data"]["current"]["grades"] == {"MATH": "A1"}


def test_get_empty_state(db):
    out = _get()
    assert out["status"] == "real" and out["data"]["current"] is None and out["data"]["versions"] == []
    assert out["data"]["supported"] is True and out["data"]["subjectNames"]["MATH"] == "Mathematics"


def test_missing_table_is_unsupported_not_500(db):
    db.missing = True
    got = _get()
    assert got["status"] == "coming_soon" and got["data"]["supported"] is False
    saved = _save({"MATH": "A1"})
    assert saved["status"] == "coming_soon" and saved["data"]["supported"] is False
