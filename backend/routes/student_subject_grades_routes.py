# ============================================================
# Sifter - Student-entered O-level grades (self-reported, versioned)
#
# Append-only: every change inserts a NEW version row; earlier rows are only
# marked superseded, never edited or deleted. Every read/write is filtered by
# the authenticated user's id (the table has RLS with no policies).
#
# Rollout safety: backend/migration_student_subject_grade_sets_2026-11-19.sql is
# PROPOSED and may not be applied yet. While the table is missing both endpoints
# answer 200 with ``supported: false`` and never persist anything (no 500).
# No UTME score is captured: no thresholds exist in the data.
# ============================================================
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import Auth
from database import db
from logger import log
from models import ResponseModel
from services.olevel_grades import MAX_GRADE_ENTRIES, OLEVEL_GRADE_SCALE

router = APIRouter(prefix="/api/student", tags=["student-subject-grades"])

_SCHEMA = "skillup_dev"
_TABLE = "student_subject_grade_sets"
EXAM_BODIES = ("waec", "neco", "other")
MAX_VERSIONS_LISTED = 20
_MISSING_TABLE_MARKERS = ("42p01", "pgrst205", "does not exist", "schema cache", "could not find the table")


class SubjectGradesIn(BaseModel):
    exam_body: str = Field("waec", description="waec | neco | other")
    # { "<subject code or name>": "A1".."F9" }
    grades: dict[str, str] = Field(default_factory=dict)


def _svc():
    return db.get_service_client().schema(_SCHEMA)


def _real(data: Any, notice: Optional[str] = None) -> dict:
    return {"status": "real", "data": data, "meta": ({"notice": notice} if notice else None)}


def _unsupported(notice: str) -> dict:
    return {
        "status": "coming_soon",
        "data": {"supported": False, "current": None, "versions": []},
        "meta": {"notice": notice},
    }


def _is_missing_table(exc: Exception) -> bool:
    text = f"{getattr(exc, 'code', '')} {exc}".lower()
    return "42p01" in text or "pgrst205" in text or (
        _TABLE in text and any(marker in text for marker in _MISSING_TABLE_MARKERS)
    )


def _out(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "version": row.get("version"),
        "examBody": row.get("exam_body"),
        "grades": row.get("grades") or {},
        "selfReported": row.get("self_reported", True),
        "createdAt": row.get("created_at"),
        "supersededAt": row.get("superseded_at"),
    }


def _catalog_codes() -> tuple[dict[str, str], dict[str, str]]:
    """Return (code -> code, lowercase name -> code) from the subject catalogue."""
    rows = _svc().table("subject_catalog").select("name, code").limit(300).execute().data or []
    by_code = {str(r["code"]).upper(): str(r["code"]).upper() for r in rows if r.get("code")}
    by_name = {
        str(r["name"]).strip().lower(): str(r["code"]).upper()
        for r in rows if r.get("name") and r.get("code")
    }
    return by_code, by_name


def validate_grades(raw: dict[str, str]) -> dict[str, str]:
    """Resolve keys to catalogue codes and validate grade values.

    Raises HTTPException(422) naming every unknown subject or invalid grade; an
    unknown entry is rejected, never silently dropped.
    """
    if len(raw) > MAX_GRADE_ENTRIES:
        raise HTTPException(status_code=422, detail=f"At most {MAX_GRADE_ENTRIES} subject grades can be saved.")
    by_code, by_name = _catalog_codes()
    resolved: dict[str, str] = {}
    problems: list[str] = []
    for key, value in raw.items():
        text = str(key).strip()
        code = by_code.get(text.upper()) or by_name.get(text.lower())
        grade = str(value).strip().upper() if isinstance(value, str) else ""
        if code is None:
            problems.append(f"unknown subject '{text[:40]}'")
        elif grade not in OLEVEL_GRADE_SCALE:
            problems.append(f"invalid grade for {code} (use {OLEVEL_GRADE_SCALE[0]} to {OLEVEL_GRADE_SCALE[-1]})")
        else:
            resolved[code] = grade
    if problems:
        raise HTTPException(status_code=422, detail="; ".join(problems))
    return resolved


def _fetch_sets(user_id: str) -> list[dict]:
    return (
        _svc().table(_TABLE).select("*").eq("user_id", user_id)
        .order("version", desc=True).limit(MAX_VERSIONS_LISTED).execute().data or []
    )


def _subject_names() -> dict[str, str]:
    """code -> display name, so the client can show saved grades by subject name."""
    try:
        rows = _svc().table("subject_catalog").select("name, code").limit(300).execute().data or []
    except Exception:  # noqa: BLE001  (labels are optional)
        return {}
    return {str(r["code"]).upper(): r["name"] for r in rows if r.get("code") and r.get("name")}


def _view(rows: list[dict]) -> dict:
    current = next((r for r in rows if not r.get("superseded_at")), None)
    return {
        "supported": True,
        "subjectNames": _subject_names(),
        "current": _out(current) if current else None,
        "versions": [_out(r) for r in rows],
    }


@router.get("/subject-grades", response_model=ResponseModel)
async def get_subject_grades(current_user: dict = Depends(Auth.get_current_user)):
    try:
        return ResponseModel(data=_real(_view(_fetch_sets(current_user["id"]))))
    except Exception as exc:  # noqa: BLE001
        if _is_missing_table(exc):
            return ResponseModel(data=_unsupported("Saving grades is not available yet."))
        log.error("student subject grades get failed", error=str(exc))
        return ResponseModel(data=_unsupported("Saved grades are temporarily unavailable."))


@router.post("/subject-grades", response_model=ResponseModel)
async def save_subject_grades(
    payload: SubjectGradesIn = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    exam_body = (payload.exam_body or "").strip().lower()
    if exam_body not in EXAM_BODIES:
        raise HTTPException(status_code=422, detail="exam_body must be one of: waec, neco, other.")
    try:
        grades = validate_grades(payload.grades)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001  (catalogue unreadable: fail closed, no persistence)
        log.error("student subject grades catalogue failed", error=str(exc))
        return ResponseModel(data=_unsupported("Saved grades are temporarily unavailable."))

    user_id = current_user["id"]
    try:
        rows = _fetch_sets(user_id)
        current = next((r for r in rows if not r.get("superseded_at")), None)
        if current and current.get("exam_body") == exam_body and (current.get("grades") or {}) == grades:
            view = _view(rows)
            view["created"] = False
            return ResponseModel(data=_real(view, "Your grades are unchanged."))
        if not current and not grades:
            view = _view(rows)
            view["created"] = False
            return ResponseModel(data=_real(view))
        next_version = max((int(r.get("version") or 0) for r in rows), default=0) + 1
        now = datetime.now(timezone.utc).isoformat()
        inserted = (
            _svc().table(_TABLE).insert({
                "user_id": user_id,
                "version": next_version,
                "exam_body": exam_body,
                "grades": grades,
                "self_reported": True,
                "created_at": now,
            }).execute().data or []
        )
        if not inserted:
            raise RuntimeError("grade set insert returned no row")
        # Supersede earlier current rows only after the new version exists, so a
        # failure here can never leave the student without a current set.
        (
            _svc().table(_TABLE).update({"superseded_at": now})
            .eq("user_id", user_id).is_("superseded_at", "null").lt("version", next_version).execute()
        )
        view = _view(_fetch_sets(user_id))
        view["created"] = True
        return ResponseModel(data=_real(view))
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        if _is_missing_table(exc):
            return ResponseModel(data=_unsupported("Saving grades is not available yet. Your grades were not stored."))
        log.error("student subject grades save failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not save your grades. Please try again.")
