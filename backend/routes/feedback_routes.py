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
#   GET  /api/feedback   — auth required; recent feedback (admin inbox)
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


@router.post("", response_model=ResponseModel)
async def create_feedback(
    body: dict = Body(default_factory=dict),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Submit a piece of feedback.

    Body: {type, message, entityType?, entityId?, rating?}. Inserts one row
    into skillup_dev.user_feedback and returns the created row envelope.
    """
    try:
        fb_type = body.get("type") or "general"
        message = body.get("message")
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
    current_user: dict = Depends(Auth.require_admin),
):
    """Recent feedback for the admin inbox, newest first.

    Admin-only: restricted to institution admins and educators via
    Auth.require_admin (students must not read the inbox).
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
