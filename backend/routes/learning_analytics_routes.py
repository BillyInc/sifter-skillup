"""Consent-gated selection capture and aggregate learning-interest reads."""
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth import Auth
from database import db
from models import ResponseModel
from legal_versions import analytics_consent_is_current

router = APIRouter(prefix="/api/analytics/learning-interest", tags=["learning analytics"])
_SCHEMA = "skillup_dev"
_ENTITY_TYPES = {
    "programme", "institution", "domain", "area", "role", "method", "research_design",
    "skill", "competency", "knowledge", "method_item", "tool",
    "certification", "other_learning_item",
}
_SCHOOL_ROLES = {"owner", "institution_admin", "admin", "dean", "hod", "counsellor"}
_ANALYTICS_SCHEMA_ERROR_CODES = {"PGRST202", "PGRST204", "PGRST205", "42P01", "42703", "42883"}
_ANALYTICS_SETUP_MESSAGE = (
    "Learner-interest analytics is not ready yet. The database updates may be missing "
    "or the schema cache may need refreshing. Ask the system administrator to complete "
    "the analytics setup, then try again."
)


class LearningInterestEvent(BaseModel):
    event_id: UUID = Field(default_factory=uuid4)
    action: Literal["selection_added", "selection_removed", "selection_copied"]
    entity_type: str = Field(min_length=1, max_length=40)
    entity_id: str = Field(min_length=1, max_length=240)
    entity_label: str = Field(min_length=1, max_length=180)
    learner_stage: Optional[str] = Field(default=None, max_length=40)
    programme_id: Optional[str] = Field(default=None, max_length=180)
    institution_id: Optional[str] = Field(default=None, max_length=180)
    domain_id: Optional[str] = Field(default=None, max_length=100)
    area_id: Optional[str] = Field(default=None, max_length=180)
    role_id: Optional[str] = Field(default=None, max_length=180)
    route_label: str = Field(default="", max_length=420)
    selection_scope_id: Optional[str] = Field(default=None, min_length=1, max_length=500)
    method_ids: list[str] = Field(default_factory=list, max_length=30)
    design_ids: list[str] = Field(default_factory=list, max_length=30)


def _has_analytics_consent(user: dict) -> bool:
    return analytics_consent_is_current(user)


def _service():
    return db.get_service_client().schema(_SCHEMA)


def _analytics_rpc(function_name: str, parameters: dict):
    """Return aggregate analytics or a clear setup response for missing schema.

    The global API handler intentionally hides unexpected provider failures.
    Translate only known missing-function/table/column responses here so an
    unapplied analytics migration is distinguishable from a generic outage.
    """
    try:
        return _service().rpc(function_name, parameters).execute().data
    except Exception as exc:
        if getattr(exc, "code", None) in _ANALYTICS_SCHEMA_ERROR_CODES:
            raise HTTPException(status_code=503, detail=_ANALYTICS_SETUP_MESSAGE) from exc
        raise


@router.post("/event", response_model=ResponseModel)
async def capture_learning_interest(
    event: LearningInterestEvent,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Store only explicit selection changes after analytics opt-in."""
    if not _has_analytics_consent(current_user):
        return ResponseModel(data={"tracked": False, "reason": "analytics_opt_out"})
    if event.entity_type not in _ENTITY_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported learning selection type.")
    route_context = {
        "stage": event.learner_stage,
        "programme": event.programme_id,
        "institution": event.institution_id,
        "domain": event.domain_id,
        "area": event.area_id,
        "role": event.role_id,
        "methods": sorted(set(event.method_ids)),
        "designs": sorted(set(event.design_ids)),
    }
    route_key = hashlib.sha256(
        json.dumps(route_context, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    selection_scope = event.selection_scope_id or json.dumps({
        "stage": event.learner_stage,
        "programme": event.programme_id,
        "institution": event.institution_id,
        "domain": event.domain_id,
        "area": event.area_id,
        "role": event.role_id,
    }, sort_keys=True, separators=(",", ":"))
    selection_scope_key = hashlib.sha256(selection_scope.encode("utf-8")).hexdigest()
    row = {
        "event_id": str(event.event_id), "user_id": current_user["id"],
        "event_type": event.action, "entity_type": event.entity_type,
        "entity_id": event.entity_id, "entity_label": event.entity_label.strip(),
        "learner_stage": event.learner_stage, "programme_id": event.programme_id,
        "institution_id": event.institution_id,
        "domain_id": event.domain_id, "area_id": event.area_id, "role_id": event.role_id,
        "method_ids": sorted(set(event.method_ids)), "design_ids": sorted(set(event.design_ids)),
        "route_key": route_key, "selection_scope_key": selection_scope_key,
        "route_label": event.route_label,
    }
    _service().table("learning_interest_events").upsert(
        row, on_conflict="event_id", ignore_duplicates=True
    ).execute()
    return ResponseModel(data={"tracked": True})


async def _aggregate(
    *, since: datetime, until: datetime, school_id: Optional[str],
    entity_type: Optional[str], domain_id: Optional[str], area_id: Optional[str],
    programme_id: Optional[str], institution_id: Optional[str],
    role_id: Optional[str], method_id: Optional[str], design_id: Optional[str],
    learner_stage: Optional[str], state: Optional[str] = None,
    item_type: Optional[str] = None, item_id: Optional[str] = None,
    affiliation_school_id: Optional[str] = None,
):
    if entity_type and entity_type not in _ENTITY_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported filter type.")
    return _analytics_rpc("get_learning_interest_analytics", {
        "p_since": since.isoformat(), "p_until": until.isoformat(),
        "p_school_id": school_id,
        "p_entity_type": entity_type, "p_domain_id": domain_id,
        "p_area_id": area_id, "p_learner_stage": learner_stage,
        "p_programme_id": programme_id, "p_institution_id": institution_id,
        "p_role_id": role_id, "p_method_id": method_id, "p_design_id": design_id,
        "p_state": state, "p_item_type": item_type, "p_item_id": item_id,
        "p_affiliation_school_id": affiliation_school_id,
    })


def _is_missing_seat_status(exc: Exception) -> bool:
    text = str(exc).lower()
    return "seat_status" in text and any(
        marker in text for marker in ("column", "schema cache", "does not exist", "not found")
    )


def _verified_school_memberships(user_id: str) -> list[dict]:
    # Analytics scope needs an ACTIVE seat. Pending claims ('invited'), suspended
    # and revoked seats never count, even when their verified flag is set. Only a
    # schema that has no seat_status column at all falls back to the older lookup.
    try:
        memberships = (_service().table("institution_members").select("school_id, role, seat_status, verified")
                       .eq("user_id", user_id).eq("seat_status", "active")
                       .order("verified", desc=True).limit(100).execute().data or [])
    except Exception as exc:  # noqa: BLE001
        if not _is_missing_seat_status(exc):
            raise
        memberships = (_service().table("institution_members").select("school_id, role, verified")
                       .eq("user_id", user_id)
                       .order("verified", desc=True).limit(100).execute().data or [])
    school_ids = list(dict.fromkeys(
        str(row["school_id"]) for row in memberships
        if row.get("role") in _SCHOOL_ROLES and row.get("school_id")
        and row.get("verified") is True and row.get("seat_status") in (None, "active")
    ))
    if not school_ids:
        return []
    schools = (_service().table("schools").select("id, name, official_name, institution_type")
               .in_("id", school_ids).execute().data or [])
    by_id = {str(row["id"]): row for row in schools if row.get("id")}
    return [{
        "school_id": school_id,
        "school_name": (by_id.get(school_id, {}).get("official_name")
                        or by_id.get(school_id, {}).get("name") or "Institution"),
        "institution_type": by_id.get(school_id, {}).get("institution_type") or "institution",
    } for school_id in school_ids if school_id in by_id]


def _verified_school_id(user_id: str, requested_school_id: Optional[str] = None) -> Optional[str]:
    memberships = _verified_school_memberships(user_id)
    if requested_school_id:
        requested = str(requested_school_id)
        if any(row["school_id"] == requested for row in memberships):
            return requested
        raise HTTPException(status_code=403, detail="You do not have verified analytics access to that institution.")
    if not memberships:
        return None
    if len(memberships) > 1:
        raise HTTPException(status_code=422, detail="Choose an institution to view its analytics.")
    return memberships[0]["school_id"]


@router.get("/schools", response_model=ResponseModel)
async def learning_interest_school_options(current_user: dict = Depends(Auth.require_admin)):
    """List only verified institution scopes the current admin may analyse."""
    memberships = _verified_school_memberships(current_user["id"])
    if not memberships:
        raise HTTPException(status_code=403, detail="Verified school-owner analytics access is required.")
    return ResponseModel(data={"schools": memberships})


@router.get("/options", response_model=ResponseModel)
async def learning_interest_filter_options(
    q: str = Query(min_length=2, max_length=100),
    days: int = Query(default=365, ge=7, le=365),
    filter_type: Optional[str] = None,
    school_id: Optional[UUID] = None,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Return searchable labels only for the caller's authorized analytics scope."""
    if filter_type and filter_type not in (_ENTITY_TYPES | {"learner_stage", "state", "affiliation_school", "route_pattern"}):
        raise HTTPException(status_code=422, detail="Unsupported filter type.")

    if current_user.get("is_internal_staff") is not True:
        await Auth.require_admin(current_user)
        resolved_school_id = _verified_school_id(current_user["id"], str(school_id) if school_id else None)
        if not resolved_school_id:
            raise HTTPException(status_code=403, detail="Verified school-owner analytics access is required.")
    else:
        resolved_school_id = None

    until = datetime.now(timezone.utc)
    options = _analytics_rpc("get_learning_interest_filter_options", {
        "p_since": (until - timedelta(days=days)).isoformat(),
        "p_until": until.isoformat(),
        "p_school_id": resolved_school_id,
        "p_query": q.strip(),
        "p_filter_type": filter_type,
    })
    return ResponseModel(data=options)


@router.get("", response_model=ResponseModel)
async def platform_learning_interest(
    days: int = Query(default=30, ge=7, le=365),
    entity_type: Optional[str] = None,
    domain_id: Optional[str] = None,
    area_id: Optional[str] = None,
    programme_id: Optional[str] = None,
    institution_id: Optional[str] = None,
    role_id: Optional[str] = None,
    method_id: Optional[str] = None,
    design_id: Optional[str] = None,
    learner_stage: Optional[str] = None,
    state: Optional[str] = None,
    item_type: Optional[str] = None,
    item_id: Optional[str] = None,
    affiliation_school_id: Optional[UUID] = None,
    current_user: dict = Depends(Auth.require_internal_staff),
):
    until = datetime.now(timezone.utc)
    data = await _aggregate(since=until - timedelta(days=days), until=until,
                            school_id=None, entity_type=entity_type, domain_id=domain_id,
                            area_id=area_id, programme_id=programme_id,
                            institution_id=institution_id, role_id=role_id,
                            method_id=method_id, design_id=design_id,
                            learner_stage=learner_stage, state=state,
                            item_type=item_type, item_id=item_id,
                            affiliation_school_id=str(affiliation_school_id) if affiliation_school_id else None)
    return ResponseModel(data=data)


@router.get("/school", response_model=ResponseModel)
async def school_learning_interest(
    days: int = Query(default=30, ge=7, le=365),
    school_id: Optional[UUID] = None,
    entity_type: Optional[str] = None,
    domain_id: Optional[str] = None,
    area_id: Optional[str] = None,
    programme_id: Optional[str] = None,
    institution_id: Optional[str] = None,
    role_id: Optional[str] = None,
    method_id: Optional[str] = None,
    design_id: Optional[str] = None,
    learner_stage: Optional[str] = None,
    state: Optional[str] = None,
    item_type: Optional[str] = None,
    item_id: Optional[str] = None,
    affiliation_school_id: Optional[UUID] = None,
    current_user: dict = Depends(Auth.require_admin),
):
    resolved_school_id = _verified_school_id(current_user["id"], str(school_id) if school_id else None)
    if not resolved_school_id:
        raise HTTPException(status_code=403, detail="Verified school-owner analytics access is required.")
    until = datetime.now(timezone.utc)
    data = await _aggregate(since=until - timedelta(days=days), until=until,
                            school_id=resolved_school_id, entity_type=entity_type,
                            domain_id=domain_id, area_id=area_id, programme_id=programme_id,
                            institution_id=institution_id, role_id=role_id,
                            method_id=method_id, design_id=design_id,
                            learner_stage=learner_stage, state=state,
                            item_type=item_type, item_id=item_id,
                            affiliation_school_id=str(affiliation_school_id) if affiliation_school_id else None)
    return ResponseModel(data=data)
