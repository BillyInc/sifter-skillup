# ============================================================
# Sifter LevelUp — User Feedback Routes (Phase 12)
#
# Backs the in-app ReviewModal (POST) and the admin Feedback
# Inbox (GET). Writes go to skillup_dev.user_feedback.
#
# Follows the career_routes.py house style: ResponseModel
# envelopes, db.get_service_client().schema("skillup_dev"),
# try/except with log.error, graceful degradation.
#
#   POST /api/feedback   — auth required; submit feedback
#   GET  /api/feedback   — internal staff only; recent feedback (Sifter-team inbox)
# ============================================================
from typing import Optional

from fastapi import APIRouter, Body, Depends

from auth import Auth
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

_SCHEMA = "skillup_dev"

# Whitelisted feedback kinds. Unknown types are still accepted (stored as-is)
# so the client can evolve without a backend deploy, but this documents intent.
_KNOWN_TYPES = {"review", "bug", "suggestion", "mapping", "general"}

# §6A.3 — the student categories, mirrored from the CHECK constraint in
# migration_feedback_storage.sql. Kept in sync deliberately: the DB is the
# enforcement point, this list is for a 400 with a useful message instead of a
# 500 from a constraint violation.
_STUDENT_CATEGORIES = {
    "mapping_wrong", "data_outdated", "bug", "confusing",
    "missing_info", "feature_request", "praise", "other",
}

# Account types that must supply a category (§6A.4: "category required for
# student submissions"). Admin/educator submissions carry their structure via
# the mapping-flag form (§6A.2) instead.
_STUDENT_ACCOUNT_TYPES = {"student"}


@router.post("", response_model=ResponseModel)
async def create_feedback(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Submit a piece of feedback (§6A.1 — outbound only, to the Sifter team).

    Body: {type, message, entityType?, entityId?, rating?, studentCategory?}.
    Inserts one row into skillup_dev.user_feedback and returns the created row.

    `studentCategory` is REQUIRED for student accounts: free text alone does not
    let the team aggregate what students are actually reporting on (§6A.3).
    """
    fb_type = body.get("type") or "general"
    message = body.get("message")
    category = body.get("studentCategory") or body.get("student_category")
    is_student = (current_user.get("account_type") or "student") in _STUDENT_ACCOUNT_TYPES

    # Validate BEFORE the try/except below — that block deliberately swallows
    # storage errors so a feedback write never breaks the client, and a bad
    # request must not be reported as a storage failure.
    if category is not None and category not in _STUDENT_CATEGORIES:
        return ResponseModel(
            success=False,
            message=(
                "Unknown feedback category. Expected one of: "
                + ", ".join(sorted(_STUDENT_CATEGORIES))
            ),
            data=None,
        )
    if is_student and not category:
        return ResponseModel(
            success=False,
            message="Please choose what your feedback is about before sending.",
            data=None,
        )

    try:
        rating = body.get("rating")
        # Coerce rating to a 1..5 smallint when present; drop anything invalid.
        rating_val: Optional[int] = None
        if rating is not None:
            try:
                rating_val = max(1, min(5, int(rating)))
            except (TypeError, ValueError):
                rating_val = None

        row = {
            "user_id": current_user["id"],
            "type": fb_type,
            "message": message,
            "entity_type": body.get("entityType"),
            "entity_id": body.get("entityId"),
            "rating": rating_val,
            "student_category": category,
        }
        res = (
            db.get_service_client()
            .schema(_SCHEMA)
            .table("user_feedback")
            .insert(row)
            .execute()
        )
        created = (res.data or [None])[0]
        log.info(
            "Feedback created",
            user_id=current_user["id"],
            type=fb_type,
            known_type=fb_type in _KNOWN_TYPES,
        )
        return ResponseModel(data=created, message="Feedback received.")
    except Exception as exc:  # noqa: BLE001 — never fail the client on a feedback write
        log.error("feedback create_feedback failed", error=str(exc))
        return ResponseModel(
            success=False,
            message="Could not save your feedback right now.",
            data=None,
        )


@router.get("", response_model=ResponseModel)
async def list_feedback(
    limit: int = 100,
    type: Optional[str] = None,
    current_user: dict = Depends(Auth.require_internal_staff),
):
    """Recent feedback for the internal inbox, newest first.

    Internal-staff-only (spec §7.8/§6A.4/§6A.5): the inbox is platform-wide
    with no organisation filter, so it is Sifter-team tooling. Institution,
    school, and tutorial-centre admins must NOT reach it — gated by
    Auth.require_internal_staff (users.is_internal_staff, default false).
    """
    try:
        query = (
            db.get_service_client()
            .schema(_SCHEMA)
            .table("user_feedback")
            .select("id, user_id, type, message, entity_type, entity_id, rating, created_at")
        )
        if type:
            query = query.eq("type", type)
        res = (
            query.order("created_at", desc=True)
            .limit(max(1, min(500, limit)))
            .execute()
        )
        items = [
            {
                "id": r["id"],
                "userId": r.get("user_id"),
                "type": r.get("type"),
                "message": r.get("message"),
                "entityType": r.get("entity_type"),
                "entityId": r.get("entity_id"),
                "rating": r.get("rating"),
                "createdAt": r.get("created_at"),
            }
            for r in (res.data or [])
        ]
        return ResponseModel(data=items)
    except Exception as exc:  # noqa: BLE001 — degrade to an empty inbox, not a 500
        log.error("feedback list_feedback failed", error=str(exc))
        return ResponseModel(
            success=False,
            message="The feedback inbox is temporarily unavailable.",
            data=[],
        )
