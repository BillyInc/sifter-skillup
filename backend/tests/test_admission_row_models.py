"""Admission response models must accept the rows they are actually built from.

`admission_routes` constructs these as `Model(**row)` directly off a Supabase
result, so the input keys are snake_case while the fields are camelCase. Every
such construction raised ValidationError, the route caught it, and returned
`coming_soon("... temporarily unavailable.")`.

Four endpoints could therefore never succeed, with real rows behind them:

    /api/admission/snapshot          1 row   in admission_snapshot_version
    /api/admission/snapshot/history  1 row
    /api/admission/floor             2 rows  in national_jamb_floor
    /api/admission/competitiveness  20 rows  in course_competitiveness

The failure was invisible from the outside: "temporarily unavailable" reads as
a transient blip, and the catch-all `except Exception` meant nothing surfaced
that distinguished it from an empty table.

The row fixtures below are the real column sets from skillup_dev.
"""

import pytest

from models import (
    AdmissionSnapshotVersionOut,
    CourseCompetitivenessOut,
    JambFloorOut,
)

SNAPSHOT_ROW = {
    "id": "ea3ede91-68fa-53c5-ad22-4ce30ae5212b",
    "label": "2025/26 Cycle — compiled Jan 2025",
    "year": 2025,
    "compiled_at": "2026-07-17 20:58:47.450109+00",
    "compiler": "manual_import",
    "notes": "Coverage: 50 universities",
    "is_active": True,
}


class TestSnakeCaseRowsValidate:
    def test_snapshot_row_from_the_database_validates(self):
        out = AdmissionSnapshotVersionOut(**SNAPSHOT_ROW)
        assert out.compiledAt == SNAPSHOT_ROW["compiled_at"]
        assert out.isActive is True

    def test_serialises_as_camel_case_for_the_client(self):
        dumped = AdmissionSnapshotVersionOut(**SNAPSHOT_ROW).model_dump()
        # The wire format must not change: the app reads camelCase.
        assert "compiledAt" in dumped and "isActive" in dumped
        assert "compiled_at" not in dumped and "is_active" not in dumped

    def test_camel_case_input_still_works(self):
        # populate_by_name — anything already constructing with field names
        # must keep working.
        out = AdmissionSnapshotVersionOut(
            id="x", label="l", year=2025, compiledAt="t", isActive=False
        )
        assert out.isActive is False

    @pytest.mark.parametrize(
        "model, row",
        [
            # Exact column sets from skillup_dev — note NEITHER table has a
            # data_date column, which is why dataDate had to become optional.
            (
                JambFloorOut,
                {"year": 2025, "floor_score": 140, "context_note": "n",
                 "source_url": "u", "updated_at": "2025-01-01"},
            ),
            (
                CourseCompetitivenessOut,
                {"id": "c1", "broad_course": "Medicine", "year": 2025,
                 "applied": 100, "admitted": 10, "ratio": 0.1,
                 "source": "JAMB", "note": None},
            ),
        ],
    )
    def test_every_splatted_row_model_accepts_its_row(self, model, row):
        """Only the models the routes build with `Model(**row)`.

        /cutoffs and /formula construct their models field by field, so they
        are covered by their own routes rather than here.
        """
        model(**row)


class TestRoutesReturnRealData:
    """End-to-end at the route layer.

    Model-level tests would not have caught /formula, which builds its model
    field by field and failed on a `created_at` key the table does not have.
    Each of these answered `coming_soon("... temporarily unavailable.")` before.
    """

    SNAP = [dict(SNAPSHOT_ROW)]
    FLOOR = [{"year": 2025, "floor_score": 140, "context_note": "n",
              "source_url": "u", "updated_at": "2025-01-01"}]
    COMP = [{"id": "c1", "broad_course": "Medicine", "year": 2025, "applied": 100,
             "admitted": 10, "ratio": 0.1, "source": "JAMB", "note": None}]
    FORM = [{"id": "f1", "school_id": "s1", "year": 2025, "jamb_weight": 50.0,
             "postutme_weight": 20.0, "olevel_weight": 30.0, "description": "d",
             "source_url": "u", "schools": {"name": "LAGOS"}}]

    def _client(self, form_rows=None):
        from unittest.mock import MagicMock

        rows = {
            "admission_snapshot_version": self.SNAP,
            "national_jamb_floor": self.FLOOR,
            "course_competitiveness": self.COMP,
            "school_aggregate_formula": self.FORM if form_rows is None else form_rows,
        }

        def table(name):
            t = MagicMock()
            for m in ("select", "eq", "order", "limit", "ilike"):
                getattr(t, m).return_value = t
            t.execute.return_value = MagicMock(data=rows.get(name, []))
            return t

        svc = MagicMock()
        svc.table = table
        client = MagicMock()
        client.schema.return_value = svc
        return client

    @pytest.mark.parametrize(
        "name",
        ["snapshot", "history", "floor", "competitiveness", "formula"],
    )
    def test_route_returns_real_not_temporarily_unavailable(self, name, monkeypatch):
        import asyncio
        import routes.admission_routes as ar

        monkeypatch.setattr(ar.db, "get_service_client", lambda: self._client())
        coro = {
            "snapshot": lambda: ar.get_active_snapshot(),
            "history": lambda: ar.get_snapshot_history(),
            "floor": lambda: ar.get_jamb_floor(),
            "competitiveness": lambda: ar.get_competitiveness(),
            "formula": lambda: ar.get_school_formula(school_id="s1"),
        }[name]()
        out = asyncio.run(coro).data
        assert out["status"] == "real", (name, out.get("meta"))

    def test_formula_survives_a_missing_school_embed(self, monkeypatch):
        # PostgREST returns schools: None when the embed misses; .get("schools", {})
        # returns that None and then throws on .get("name").
        import asyncio
        import routes.admission_routes as ar

        row = dict(self.FORM[0], schools=None)
        monkeypatch.setattr(ar.db, "get_service_client", lambda: self._client([row]))
        out = asyncio.run(ar.get_school_formula(school_id="s1")).data
        assert out["status"] == "real"
        assert out["data"]["schoolName"] == "Unknown"


class TestCompetitivenessMatching:
    """The caller's course name and the stored one are different vocabularies.

    AdmissionInsightScreen passes the student's JAMB name — "Medicine and
    Surgery (Human Medicine)" — while course_competitiveness stores the BROAD
    course, "Medicine". `broad_course ilike %needle%` could never match: the
    needle was longer than the haystack. The section then sat on "Loading
    competitiveness..." forever, because a real-but-empty result rendered the
    same as a pending one.
    """

    ROWS = [
        {"id": "1", "broad_course": "Medicine", "year": 2025, "applied": 100,
         "admitted": 10, "ratio": 0.1, "source": "JAMB", "note": None},
        {"id": "2", "broad_course": "Law", "year": 2025, "applied": 50,
         "admitted": 10, "ratio": 0.2, "source": "JAMB", "note": None},
        {"id": "3", "broad_course": "Computer Science", "year": 2025,
         "applied": 80, "admitted": 20, "ratio": 0.25, "source": "JAMB",
         "note": None},
    ]

    def _call(self, broad_course, monkeypatch):
        import asyncio
        from unittest.mock import MagicMock
        import routes.admission_routes as ar

        def table(name):
            t = MagicMock()
            for m in ("select", "eq", "order", "limit", "ilike"):
                getattr(t, m).return_value = t
            t.execute.return_value = MagicMock(
                data=self.ROWS if name == "course_competitiveness"
                else [dict(SNAPSHOT_ROW)]
            )
            return t

        svc = MagicMock()
        svc.table = table
        client = MagicMock()
        client.schema.return_value = svc
        monkeypatch.setattr(ar.db, "get_service_client", lambda: client)
        out = asyncio.run(
            ar.get_competitiveness(year=2025, broad_course=broad_course)
        ).data
        return [i["broadCourse"] for i in out["data"]]

    def test_jamb_name_finds_its_broad_course(self, monkeypatch):
        got = self._call("Medicine and Surgery (Human Medicine)", monkeypatch)
        assert got == ["Medicine"]

    def test_exact_broad_course_still_matches(self, monkeypatch):
        assert self._call("Medicine", monkeypatch) == ["Medicine"]

    def test_partial_broad_course_still_matches(self, monkeypatch):
        # The original direction — needle shorter than the stored value.
        assert self._call("Computer", monkeypatch) == ["Computer Science"]

    def test_unrelated_course_matches_nothing(self, monkeypatch):
        assert self._call("Fine Art", monkeypatch) == []

    def test_no_filter_returns_everything(self, monkeypatch):
        assert len(self._call(None, monkeypatch)) == 3
