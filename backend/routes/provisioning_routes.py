# ============================================================
# Sifter LevelUp — Student Provisioning / Consent-Aware Roster
#
# The "school provisions a student account, prints a login card +
# career report, student later claims and owns it" model, plus
# consent-gated individual visibility for self-affiliated students.
#
# VISIBILITY RULE (enforced here, never on the client):
#   A student is INDIVIDUALLY visible to a school iff
#     (provisioned AND claim_state='unclaimed')  — school operates it
#     OR an ACTIVE student_consents row exists    — student agreed
#   Otherwise: counted in aggregates only (anonymous +1).
#
# PRIVACY:
#   - Uploaded documents are NEVER stored (handled transiently in
#     services/roster_extract.py). No documents table.
#   - Subjects/grades are NEVER stored. They ride in the generate-call
#     payload, seed the mapping inline, and are discarded. No academic
#     column exists on users or student_provision_drafts.
#
# Admin routes gated by Auth.require_admin. Student-side routes
# (claim/affiliate/consent) gated by Auth.get_current_user.
# ============================================================
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Response

from pydantic import BaseModel, Field

from auth import Auth
from database import db
from logger import log
from models import ResponseModel
from services.roster_extract import ImageInput, extract_rows
from services.report_gen import (
    ReportContext,
    build_report_docx,
    build_report_html,
    build_login_card_html,
)
from services.provisioning_reconcile import (
    merge_provisioned_into_student,
    normalize_stream,
    reconcile_school_merge_candidates,
)

router = APIRouter(prefix="/api/provisioning", tags=["provisioning"])

_SCHEMA = "skillup_dev"
_K_ANON_THRESHOLD = 5
_CLAIM_CODE_TTL_DAYS = 365
# Unambiguous alphabet for printed cards (no 0/O, 1/I/L).
_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
_CODE_LEN = 8
def _svc():
    return db.get_service_client().schema(_SCHEMA)


def _users():
    # users lives in the default (skillup_dev) schema — same client, no override.
    return db.get_service_client().table("users")


def _resolve_school_id(current_user: dict) -> Optional[str]:
    """The school the current admin/educator administers, via institution_members."""
    try:
        res = (
            _svc()
            .table("institution_members")
            .select("school_id")
            .eq("user_id", current_user["id"])
            .neq("seat_status", "revoked")
            .order("verified", desc=True)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0]["school_id"]
    except Exception as exc:  # noqa: BLE001
        log.warning("provisioning: active school lookup skipped", error=str(exc))
    try:
        res = (
            _svc()
            .table("institution_members")
            .select("school_id")
            .eq("user_id", current_user["id"])
            .order("verified", desc=True)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0]["school_id"]
    except Exception as exc:  # noqa: BLE001
        log.warning("provisioning: school lookup skipped", error=str(exc))
    return None


def _require_school(current_user: dict) -> str:
    school_id = _resolve_school_id(current_user)
    if not school_id:
        raise HTTPException(
            status_code=409,
            detail="Your account is not linked to a school yet. Complete institution verification first.",
        )
    return school_id


def _gen_claim_code() -> str:
    return "".join(secrets.choice(_CODE_ALPHABET) for _ in range(_CODE_LEN))


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _clean_stream(value: Optional[str]) -> Optional[str]:
    return normalize_stream(value)


_PROVISIONING_TYPES = {"ss1", "ss2", "ss3", "jamb"}


def _clean_student_type(value: Optional[str]) -> Optional[str]:
    value = (value or "").strip().lower()
    return value if value in _PROVISIONING_TYPES else None


def _provisioning_context(current_user: dict) -> tuple[str, str]:
    school_id = _resolve_school_id(current_user)
    if not school_id:
        raise HTTPException(status_code=409, detail="Your account is not linked to an organisation yet.")
    row = (_svc().table("schools").select("institution_type").eq("id", school_id).limit(1).execute().data or [None])[0]
    org_type = (row or {}).get("institution_type") or "secondary_school"
    if org_type == "university":
        raise HTTPException(status_code=403, detail="University admins do not create learner accounts here.")
    return school_id, org_type


def _validate_provisioning_type(value: Optional[str], org_type: str) -> str:
    student_type = _clean_student_type(value)
    if not student_type:
        raise HTTPException(status_code=400, detail="Choose the learner stage before creating an account.")
    if org_type in {"tutorial_centre", "jamb_cafe"} and student_type != "jamb":
        raise HTTPException(status_code=403, detail="This organisation can create JAMB learner accounts only.")
    if org_type == "secondary_school" and student_type == "jamb":
        raise HTTPException(status_code=403, detail="A secondary school can create SS1, SS2 or SS3 learner accounts only.")
    return student_type


# ─────────────────────────────────────────────────────────────
# Pydantic request/response models (snake_case, mirror the TS contract)
# ─────────────────────────────────────────────────────────────

class DraftInput(BaseModel):
    full_name: Optional[str] = None
    student_class: Optional[str] = None
    stream: Optional[str] = None
    student_type: Optional[str] = None
    guardian_consent: bool = False
    guardian_name: Optional[str] = None


class DraftImportRequest(BaseModel):
    """Bulk upload of one or more document pages for vision pre-fill, and/or a
    set of manually-entered draft rows. Both feed the same review grid."""
    images: List[ImageInput] = Field(default_factory=list)
    manual_rows: List[DraftInput] = Field(default_factory=list)
    stream: Optional[str] = None
    student_type: Optional[str] = None


class DraftRow(BaseModel):
    id: str
    full_name: Optional[str] = None
    student_class: Optional[str] = None
    stream: Optional[str] = None
    student_type: Optional[str] = None
    needs_review: bool = True
    guardian_consent: bool = False
    guardian_name: Optional[str] = None
    status: str = "draft"


class DirectionInput(BaseModel):
    """The career direction the student/educator picked, from the (in-memory)
    mapping. Only this — not the grades it was derived from — is persisted."""
    domain_key: Optional[str] = None
    role_key: Optional[str] = None
    programme_id: Optional[str] = None


class GenerateItem(BaseModel):
    draft_id: str
    # Transient: subjects seed the mapping inline at generate time, never stored.
    subjects: List[str] = Field(default_factory=list)
    chosen_direction: Optional[DirectionInput] = None
    student_type: Optional[str] = None


class GenerateRequest(BaseModel):
    items: List[GenerateItem]


class GuidanceUpdate(BaseModel):
    """The direction an administrator selected with a learner."""

    chosen_direction: DirectionInput


class GeneratedStudent(BaseModel):
    user_id: str
    full_name: str
    student_class: Optional[str] = None
    stream: Optional[str] = None
    student_type: Optional[str] = None
    claim_code: str
    claim_expires_at: Optional[str] = None
    guidance_complete: bool = False


class RosterStudent(BaseModel):
    user_id: str
    full_name: Optional[str] = None
    student_class: Optional[str] = None
    stream: Optional[str] = None
    provenance: str            # 'self' | 'provisioned'
    claim_state: Optional[str] = None  # 'unclaimed' | 'claimed' | None (self)
    visible: bool = True       # individually visible under the rule
    has_consent: bool = False
    guidance_complete: bool = False


class RosterResponse(BaseModel):
    students: List[RosterStudent]
    total_affiliated: int      # everyone linked to the school
    aggregate_only: int        # counted but not individually visible
    shared_with_you: int       # individually visible


class MergeCandidate(BaseModel):
    id: str
    provisioned_user_id: Optional[str] = None
    student_user_id: Optional[str] = None
    provisioned_name: Optional[str] = None
    student_name: Optional[str] = None
    student_class: Optional[str] = None
    stream: Optional[str] = None
    match_type: str
    confidence: float = 0.0
    evidence: dict[str, Any] = Field(default_factory=dict)
    status: str = "pending"
    created_at: Optional[str] = None


def _merge_candidate_out(row: dict) -> dict:
    provisioned = row.get("provisioned_snapshot") or {}
    student = row.get("real_snapshot") or {}
    if not isinstance(provisioned, dict):
        provisioned = {}
    if not isinstance(student, dict):
        student = {}
    return MergeCandidate(
        id=row["id"],
        provisioned_user_id=row.get("provisioned_student_id") or provisioned.get("id"),
        student_user_id=row.get("real_student_id") or student.get("id"),
        provisioned_name=provisioned.get("username"),
        student_name=student.get("username"),
        student_class=provisioned.get("student_class") or student.get("student_class"),
        stream=_clean_stream(provisioned.get("stream") or student.get("stream")),
        match_type=row.get("match_reason") or row.get("match_key") or "deterministic",
        confidence=float(row.get("confidence") or 0.0),
        evidence=row.get("evidence") if isinstance(row.get("evidence"), dict) else {},
        status=row.get("status") or "pending",
        created_at=row.get("created_at"),
    ).model_dump()


# ─────────────────────────────────────────────────────────────
# 1. Import → drafts (bulk vision pre-fill + manual), admin-gated
# ─────────────────────────────────────────────────────────────

@router.post("/drafts", response_model=ResponseModel)
async def create_drafts(
    payload: DraftImportRequest = Body(default_factory=DraftImportRequest),
    current_user: dict = Depends(Auth.require_admin),
):
    """Stage draft rows for the review grid. Vision pre-fill from uploaded pages
    (transient — images discarded here) plus any manual rows. Nothing is minted;
    the educator corrects and confirms before /generate."""
    school_id, org_type = _provisioning_context(current_user)

    rows: List[dict] = []
    batch_stream = _clean_stream(payload.stream)
    # Vision pre-fill (best-effort; empty on failure → manual entry).
    extracted = await extract_rows(payload.images)
    for r in extracted:
        rows.append({
            "full_name": r.full_name,
            "student_class": r.student_class,
            "stream": batch_stream,
            "student_type": _clean_student_type(payload.student_type),
            "needs_review": True,
        })
    # Manual rows are confirmed-by-typing → needs_review reflects completeness.
    for m in payload.manual_rows:
        rows.append({
            "full_name": m.full_name,
            "student_class": m.student_class,
            "stream": _clean_stream(m.stream) or batch_stream,
            "student_type": _clean_student_type(m.student_type) or _clean_student_type(payload.student_type),
            "needs_review": not bool(m.full_name),
            "guardian_consent": m.guardian_consent,
            "guardian_name": m.guardian_name,
        })

    if not rows:
        return ResponseModel(
            data=[],
            message="No rows could be read. Add students manually in the grid.",
        )

    to_insert = [{
        "id": str(uuid.uuid4()),
        "school_id": school_id,
        "created_by": current_user["id"],
        "full_name": r.get("full_name"),
        "student_class": r.get("student_class"),
        "stream": r.get("stream"),
        "student_type": r.get("student_type"),
        "needs_review": r.get("needs_review", True),
        "guardian_consent": r.get("guardian_consent", False),
        "guardian_name": r.get("guardian_name"),
        "status": "draft",
    } for r in rows]

    try:
        res = _svc().table("student_provision_drafts").insert(to_insert).execute()
        out = [DraftRow(**d).model_dump() for d in (res.data or [])]
        return ResponseModel(
            data=out,
            message=f"{len(out)} draft(s) staged. Review and correct before creating accounts.",
        )
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: draft insert failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not stage drafts.")


@router.get("/drafts", response_model=ResponseModel)
async def list_drafts(current_user: dict = Depends(Auth.require_admin)):
    """The review grid: all still-draft rows for the admin's school."""
    school_id = _require_school(current_user)
    try:
        res = _svc().table("student_provision_drafts").select(
            "id, full_name, student_class, stream, student_type, needs_review, guardian_consent, guardian_name, status"
        ).eq("school_id", school_id).eq("status", "draft").order(
            "created_at", desc=False
        ).limit(2000).execute()
        return ResponseModel(data=[DraftRow(**d).model_dump() for d in (res.data or [])])
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: list drafts failed", error=str(exc))
        return ResponseModel(data=[])


@router.patch("/drafts/{draft_id}", response_model=ResponseModel)
async def update_draft(
    draft_id: str,
    payload: DraftInput = Body(...),
    current_user: dict = Depends(Auth.require_admin),
):
    """Correct/confirm a draft in the review grid (the assisted-correction step)."""
    school_id, org_type = _provisioning_context(current_user)
    student_type = _validate_provisioning_type(payload.student_type, org_type)
    updates = {
        "full_name": payload.full_name,
        "student_class": payload.student_class,
        "stream": _clean_stream(payload.stream),
        "student_type": student_type,
        "guardian_consent": payload.guardian_consent,
        "guardian_name": payload.guardian_name,
        "needs_review": not bool(payload.full_name),
        "updated_at": _now(),
    }
    try:
        res = _svc().table("student_provision_drafts").update(updates).eq(
            "id", draft_id
        ).eq("school_id", school_id).eq("status", "draft").execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Draft not found or already generated.")
        return ResponseModel(data=DraftRow(**res.data[0]).model_dump())
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: draft update failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not update draft.")


# ─────────────────────────────────────────────────────────────
# 2. Generate accounts from selected drafts, admin-gated
# ─────────────────────────────────────────────────────────────

@router.post("/generate", response_model=ResponseModel)
async def generate_accounts(
    payload: GenerateRequest = Body(...),
    current_user: dict = Depends(Auth.require_admin),
):
    """Mint provisioned student accounts + claim codes for the SELECTED drafts.

    New user-insert path (distinct from main.py._create_user): provenance
    'provisioned', claim_state 'unclaimed'. Subjects arriving in the payload seed
    the chosen direction inline and are then discarded — never written.
    """
    school_id, org_type = _provisioning_context(current_user)
    if not payload.items:
        raise HTTPException(status_code=400, detail="No drafts selected.")

    draft_ids = [i.draft_id for i in payload.items]
    try:
        dres = _svc().table("student_provision_drafts").select(
            "id, full_name, student_class, stream, student_type, guardian_consent, guardian_name, status"
        ).in_("id", draft_ids).eq("school_id", school_id).execute()
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: draft fetch for generate failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not load selected drafts.")

    drafts_by_id = {d["id"]: d for d in (dres.data or [])}
    items_by_draft = {i.draft_id: i for i in payload.items}
    generated: List[GeneratedStudent] = []
    failed_count = 0

    for draft_id, draft in drafts_by_id.items():
        if draft.get("status") != "draft":
            continue
        name = (draft.get("full_name") or "").strip()
        if not name:
            continue  # never mint an unnamed account
        item = items_by_draft.get(draft_id)
        student_type = _validate_provisioning_type(
            (item.student_type if item else None) or draft.get("student_type"),
            org_type,
        )
        direction = None
        if item and item.chosen_direction:
            direction = item.chosen_direction.model_dump(exclude_none=True) or None
        # NB: item.subjects is intentionally NOT persisted.

        user_id = str(uuid.uuid4())
        guardian_at = _now() if draft.get("guardian_consent") else None
        user_payload = {
            "id": user_id,
            "username": name,
            "auth_provider": "provisioned",
            "account_type": "student",
            "provenance": "provisioned",
            "provisioning_school_id": school_id,
            "claim_state": "unclaimed",
            "student_class": draft.get("student_class"),
            "stream": _clean_stream(draft.get("stream")),
            "provisioned_user_type": student_type,
            "chosen_direction": direction,
            "guardian_consent_at": guardian_at,
            "points": 0,
            "streak": 0,
            "current_level": 1,
            "completed_levels": [],
            "perfect_levels": [],
            "python_chapters_completed": [],
            "onboarding_completed": False,
            "created_at": _now(),
            "last_login": _now(),
        }
        try:
            _users().insert(user_payload).execute()
            # Unified affiliation link (source distinguishes the path).
            _svc().table("student_affiliations").insert({
                "id": str(uuid.uuid4()),
                "student_id": user_id,
                "school_id": school_id,
                "source": "provisioned",
                "self_reported": False,
            }).execute()
            code = _gen_claim_code()
            expires = (datetime.now(timezone.utc) + timedelta(days=_CLAIM_CODE_TTL_DAYS)).isoformat()
            _svc().table("claim_codes").insert({
                "id": str(uuid.uuid4()),
                "code": code,
                "student_id": user_id,
                "school_id": school_id,
                "expires_at": expires,
            }).execute()
            _svc().table("student_provision_drafts").update({
                "status": "generated",
                "generated_user_id": user_id,
                "updated_at": _now(),
            }).eq("id", draft_id).execute()
            generated.append(GeneratedStudent(
                user_id=user_id, full_name=name,
                student_class=draft.get("student_class"),
                stream=_clean_stream(draft.get("stream")),
                student_type=student_type,
                claim_code=code, claim_expires_at=expires,
                guidance_complete=bool(direction),
            ))
        except Exception as exc:  # noqa: BLE001
            failed_count += 1
            log.error("provisioning: account generate failed", draft_id=draft_id, error=str(exc))
            # The account, affiliation, claim code and draft status are created
            # through separate Supabase requests. If a later request fails, do
            # not leave a half-created learner that never appears in the admin
            # result. This UUID was generated in this loop, so cleanup cannot
            # affect an existing account.
            try:
                _svc().table("claim_codes").delete().eq("student_id", user_id).execute()
                _svc().table("student_affiliations").delete().eq("student_id", user_id).eq(
                    "school_id", school_id
                ).execute()
                _users().delete().eq("id", user_id).execute()
            except Exception as cleanup_exc:  # noqa: BLE001
                log.error(
                    "provisioning: failed to clean up partial account",
                    user_id=user_id,
                    error=str(cleanup_exc),
                )
            continue

    if not generated and failed_count:
        return ResponseModel(
            success=False,
            data=None,
            message=(
                "No learner accounts were created. Apply the provisioning schema "
                "patch, then try again."
            ),
        )

    return ResponseModel(
        data=[g.model_dump() for g in generated],
        message=(
            f"{len(generated)} account(s) created. Print or share the login cards."
            + (f" {failed_count} row(s) could not be created." if failed_count else "")
        ),
    )


@router.post("/students/{user_id}/regenerate-code", response_model=ResponseModel)
async def regenerate_code(
    user_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """Invalidate the current claim code and issue a new one (lost-card path).
    Allowed only while the account is still unclaimed."""
    school_id = _require_school(current_user)
    try:
        ures = _users().select("id, claim_state, provisioning_school_id").eq(
            "id", user_id
        ).limit(1).execute()
        u = (ures.data or [None])[0]
        if not u or u.get("provisioning_school_id") != school_id:
            raise HTTPException(status_code=404, detail="Student not found for your school.")
        if u.get("claim_state") != "unclaimed":
            raise HTTPException(status_code=409, detail="Account already claimed — code cannot be reissued.")
        # Revoke live codes, issue a fresh one.
        _svc().table("claim_codes").update({"revoked_at": _now()}).eq(
            "student_id", user_id
        ).is_("redeemed_at", "null").is_("revoked_at", "null").execute()
        code = _gen_claim_code()
        expires = (datetime.now(timezone.utc) + timedelta(days=_CLAIM_CODE_TTL_DAYS)).isoformat()
        _svc().table("claim_codes").insert({
            "id": str(uuid.uuid4()),
            "code": code, "student_id": user_id, "school_id": school_id,
            "expires_at": expires,
        }).execute()
        return ResponseModel(data={"user_id": user_id, "claim_code": code, "claim_expires_at": expires})
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: regenerate code failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not reissue code.")


# ─────────────────────────────────────────────────────────────
# 3. Consent-aware roster, admin-gated
# ─────────────────────────────────────────────────────────────

@router.get("/roster", response_model=ResponseModel)
async def get_roster(current_user: dict = Depends(Auth.require_admin)):
    """The unified roster with the visibility rule applied server-side.

    Returns individually-visible students (provisioned+unclaimed, or consented)
    plus the counts that make the aggregate-only cohort legible:
    "142 affiliated · 118 aggregate-only · 24 shared with you".
    """
    school_id = _require_school(current_user)
    try:
        # All affiliations for this school.
        aff = _svc().table("student_affiliations").select(
            "student_id, source"
        ).eq("school_id", school_id).limit(20000).execute().data or []
        student_ids = [a["student_id"] for a in aff]
        total_affiliated = len(student_ids)
        if not student_ids:
            return ResponseModel(data=RosterResponse(
                students=[], total_affiliated=0, aggregate_only=0, shared_with_you=0,
            ).model_dump())

        # Active consents for this school.
        cons = _svc().table("student_consents").select("student_id").eq(
            "school_id", school_id
        ).is_("revoked_at", "null").not_.is_("granted_at", "null").execute().data or []
        consented = {c["student_id"] for c in cons}

        # User rows (name/class/provenance/claim_state) for the affiliated set.
        # Chunk the IN() to stay within query limits.
        users_by_id: dict = {}
        for i in range(0, len(student_ids), 500):
            chunk = student_ids[i:i + 500]
            ures = _users().select(
                "id, username, student_class, stream, provenance, claim_state, chosen_direction"
            ).in_("id", chunk).execute().data or []
            for u in ures:
                users_by_id[u["id"]] = u

        students: List[RosterStudent] = []
        shared = 0
        for sid in student_ids:
            u = users_by_id.get(sid, {})
            provisioned_unclaimed = (
                u.get("provenance") == "provisioned" and u.get("claim_state") == "unclaimed"
            )
            has_consent = sid in consented
            visible = provisioned_unclaimed or has_consent
            if not visible:
                continue  # aggregate-only: never emit the row
            shared += 1
            students.append(RosterStudent(
                user_id=sid,
                full_name=u.get("username"),
                student_class=u.get("student_class"),
                stream=u.get("stream"),
                provenance=u.get("provenance") or "self",
                claim_state=u.get("claim_state"),
                visible=True,
                has_consent=has_consent,
                guidance_complete=bool(u.get("chosen_direction")),
            ))

        return ResponseModel(data=RosterResponse(
            students=students,
            total_affiliated=total_affiliated,
            aggregate_only=total_affiliated - shared,
            shared_with_you=shared,
        ).model_dump())
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: roster failed", error=str(exc))
        return ResponseModel(data=RosterResponse(
            students=[], total_affiliated=0, aggregate_only=0, shared_with_you=0,
        ).model_dump())


# ─────────────────────────────────────────────────────────────
# 3b. Admin-reviewed merge candidates
# ─────────────────────────────────────────────────────────────

@router.get("/merge-candidates", response_model=ResponseModel)
async def list_merge_candidates(
    status: str = "pending",
    current_user: dict = Depends(Auth.require_admin),
):
    """List deterministic duplicate candidates for the admin's school.

    Pending lists run the exact-match reconciler first so newly affiliated
    students surface without waiting for the periodic worker.
    """
    status = (status or "pending").strip().lower()
    if status not in {"pending", "confirmed", "dismissed", "all"}:
        raise HTTPException(status_code=400, detail="Unsupported merge candidate status.")

    school_id = _require_school(current_user)
    try:
        if status in {"pending", "all"}:
            reconcile_school_merge_candidates(school_id, created_by=current_user["id"])

        query = _svc().table("student_merge_candidates").select("*").eq(
            "school_id", school_id
        )
        if status != "all":
            query = query.eq("status", status)
        rows = query.order("created_at", desc=True).limit(500).execute().data or []
        return ResponseModel(data=[_merge_candidate_out(r) for r in rows])
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: list merge candidates failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not load merge candidates.")


@router.post("/merge-candidates/{candidate_id}/confirm", response_model=ResponseModel)
async def confirm_merge_candidate(
    candidate_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """Confirm a pending candidate and merge the provisioned shell into the real account."""
    school_id = _require_school(current_user)
    try:
        res = _svc().table("student_merge_candidates").select("*").eq(
            "id", candidate_id
        ).eq("school_id", school_id).limit(1).execute()
        candidate = (res.data or [None])[0]
        if not candidate:
            raise HTTPException(status_code=404, detail="Merge candidate not found.")
        if candidate.get("status") != "pending":
            raise HTTPException(status_code=409, detail="Merge candidate is no longer pending.")

        provisioned_id = candidate.get("provisioned_student_id")
        real_id = candidate.get("real_student_id")
        if not provisioned_id or not real_id:
            raise HTTPException(status_code=409, detail="Merge candidate is missing a student account.")

        result = merge_provisioned_into_student(
            provisioned_student_id=provisioned_id,
            real_student_id=real_id,
            school_id=school_id,
        )
        _svc().table("student_merge_candidates").update({
            "status": "confirmed",
            "confirmed_by": current_user["id"],
            "confirmed_at": _now(),
            "updated_at": _now(),
        }).eq("id", candidate_id).execute()
        return ResponseModel(data=result, message="Student accounts merged.")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: confirm merge candidate failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not confirm merge candidate.")


@router.post("/merge-candidates/{candidate_id}/dismiss", response_model=ResponseModel)
async def dismiss_merge_candidate(
    candidate_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """Dismiss a pending candidate so deterministic sweeps do not recreate it."""
    school_id = _require_school(current_user)
    try:
        res = _svc().table("student_merge_candidates").update({
            "status": "dismissed",
            "dismissed_by": current_user["id"],
            "dismissed_at": _now(),
            "updated_at": _now(),
        }).eq("id", candidate_id).eq("school_id", school_id).eq(
            "status", "pending"
        ).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Pending merge candidate not found.")
        return ResponseModel(data={"dismissed": True}, message="Merge candidate dismissed.")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: dismiss merge candidate failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not dismiss merge candidate.")


# ─────────────────────────────────────────────────────────────
# 4. Student-side: claim (with automatic merge), affiliate, consent
# ─────────────────────────────────────────────────────────────

class ClaimRequest(BaseModel):
    code: str
    # Login identity to attach so the student can sign in again from any device.
    # Either phone or email works (equal weight); at least one is required when
    # the account has no other durable credential yet.
    phone: Optional[str] = None
    email: Optional[str] = None


@router.post("/students/claim", response_model=ResponseModel)
async def claim_account(
    payload: ClaimRequest = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Redeem a printed claim code → own the account.

    AUTOMATIC RECONCILIATION (deterministic branch): the caller is an existing
    (self-signed-up) account redeeming a provisioned code. Rather than leave two
    rows, we MERGE — the provisioned row's school-owned context transfers to the
    caller, the provisioned row is retired, and the claim closes. Zero school
    effort. (Fuzzy/background matching lives in the Celery reconciler.)
    """
    code = (payload.code or "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Claim code is required.")
    try:
        cres = _svc().table("claim_codes").select(
            "id, student_id, school_id, expires_at"
        ).eq("code", code).is_("redeemed_at", "null").is_(
            "revoked_at", "null"
        ).limit(1).execute()
        cc = (cres.data or [None])[0]
        if not cc:
            raise HTTPException(status_code=404, detail="Invalid or already-used code.")
        if cc.get("expires_at") and cc["expires_at"] < _now():
            raise HTTPException(status_code=410, detail="This code has expired. Ask your school to reissue it.")

        provisioned_id = cc["student_id"]
        school_id = cc["school_id"]
        caller_id = current_user["id"]

        if caller_id == provisioned_id:
            # Normal claim: the caller IS the provisioned account (first login via
            # code). The shell has no durable credential yet, so require one
            # (phone or email, equal weight) — otherwise the student could never
            # sign back in.
            has_identity = bool((payload.phone or "").strip() or (payload.email or "").strip())
            already_has = bool(current_user.get("phone") or current_user.get("email"))
            if not has_identity and not already_has:
                raise HTTPException(
                    status_code=400,
                    detail="Add a phone number or email so you can sign in again later.",
                )
            updates = {"claim_state": "claimed", "last_login": _now()}
            if payload.phone:
                updates["phone"] = payload.phone.strip()
            if payload.email:
                updates["email"] = payload.email.strip().lower()
            _users().update(updates).eq("id", provisioned_id).execute()
        else:
            # MERGE: an existing self-account redeems the provisioned code. Move the
            # provisioned row's school context onto the caller, retire the provisioned row.
            merge_provisioned_into_student(
                provisioned_student_id=provisioned_id,
                real_student_id=caller_id,
                school_id=school_id,
                phone=payload.phone,
                email=payload.email,
            )

        _svc().table("claim_codes").update(
            {"redeemed_at": _now()}
        ).eq("id", cc["id"]).execute()

        return ResponseModel(
            data={"claimed": True, "school_id": school_id},
            message="Account claimed. It's yours now.",
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: claim failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not claim the account.")


class AffiliateRequest(BaseModel):
    school_code: str


@router.post("/students/affiliate", response_model=ResponseModel)
async def affiliate(
    payload: AffiliateRequest = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Self-affiliate via a school code. Creates an aggregate-only link and
    PROMPTS for consent — it does NOT expose the student individually."""
    code = (payload.school_code or "").strip()
    if not code:
        raise HTTPException(status_code=400, detail="School code is required.")
    try:
        sres = _svc().table("schools").select("id, name, address, city, state, country").eq(
            "school_code", code
        ).limit(1).execute()
        school = (sres.data or [None])[0]
        if not school:
            raise HTTPException(status_code=404, detail="No school matches that code.")
        _svc().table("student_affiliations").upsert({
            "id": str(uuid.uuid4()),
            "student_id": current_user["id"],
            "school_id": school["id"],
            "source": "school_code",
            "self_reported": True,
        }, on_conflict="student_id,school_id").execute()
        return ResponseModel(
            data={
                "school_id": school["id"],
                "school_name": school.get("name"),
                "school_address": school.get("address"),
                "consent_required": True,
            },
            message=f"You're linked to {school.get('name')}. "
                    "Choose whether to share your individual progress with them.",
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: affiliate failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not affiliate.")


class ConsentRequest(BaseModel):
    school_id: str
    scope: str = "progress"  # progress | contact | full


@router.post("/students/consent", response_model=ResponseModel)
async def grant_consent(
    payload: ConsentRequest = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Grant individual visibility to a school (per-school, revocable)."""
    try:
        _svc().table("student_consents").upsert({
            "id": str(uuid.uuid4()),
            "student_id": current_user["id"],
            "school_id": payload.school_id,
            "scope": payload.scope,
            "granted_by": "self",
            "granted_at": _now(),
            "revoked_at": None,
        }, on_conflict="student_id,school_id,scope").execute()
        return ResponseModel(data={"granted": True}, message="Sharing enabled. You can revoke this anytime.")
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: consent grant failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not record consent.")


@router.delete("/students/consent", response_model=ResponseModel)
async def revoke_consent(
    payload: ConsentRequest = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Revoke individual visibility — the student collapses back to aggregate-only."""
    try:
        _svc().table("student_consents").update({"revoked_at": _now()}).eq(
            "student_id", current_user["id"]
        ).eq("school_id", payload.school_id).eq("scope", payload.scope).execute()
        return ResponseModel(data={"revoked": True}, message="Sharing turned off.")
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: consent revoke failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not revoke consent.")


# ─────────────────────────────────────────────────────────────
# 5. Career report + login card (server-side, admin-gated)
#
# Assembles from REAL taxonomy only. No demand/salary numbers (still
# coming_soon), so every line is honest today.
# ─────────────────────────────────────────────────────────────

def _resolve_report_context(user: dict, school_name: Optional[str], generated_on: str) -> ReportContext:
    """Build a ReportContext from the student's chosen_direction + taxonomy.

    Reads domain (foundation_skills, description), its roles, and the chosen
    programme. Every field degrades gracefully to None/empty — never invents.
    """
    direction = user.get("chosen_direction") or {}
    domain_key = direction.get("domain_key")
    role_key = direction.get("role_key")
    programme_id = direction.get("programme_id")

    domain_name = domain_description = None
    foundation_skills: List[str] = []
    roles: List[str] = []
    programme_name = None

    try:
        if domain_key:
            dres = _svc().table("domains").select(
                "id, domain_key, name, description, foundation_skills"
            ).eq("domain_key", domain_key).limit(1).execute()
            dom = (dres.data or [None])[0]
            if dom:
                domain_name = dom.get("name")
                domain_description = dom.get("description")
                for s in (dom.get("foundation_skills") or [])[:12]:
                    label = s.get("skill") if isinstance(s, dict) else str(s)
                    if label:
                        foundation_skills.append(label)
                # Roles reachable from this domain.
                rres = _svc().table("domain_roles").select("role_name").eq(
                    "domain_id", dom["id"]
                ).limit(12).execute()
                roles = [r["role_name"] for r in (rres.data or []) if r.get("role_name")]
        # If a specific role was chosen, surface it first.
        if role_key:
            rr = _svc().table("domain_roles").select("role_name").eq(
                "role_key", role_key
            ).limit(1).execute()
            rn = (rr.data or [{}])[0].get("role_name")
            if rn:
                roles = [rn] + [r for r in roles if r != rn]
        if programme_id:
            pres = _svc().table("programmes").select("name").eq(
                "id", programme_id
            ).limit(1).execute()
            programme_name = (pres.data or [{}])[0].get("name")
    except Exception as exc:  # noqa: BLE001
        log.warning("provisioning: report taxonomy read partial", error=str(exc))

    return ReportContext(
        student_name=user.get("username") or "Student",
        student_class=user.get("student_class"),
        stream=user.get("stream"),
        school_name=school_name,
        domain_name=domain_name,
        domain_description=domain_description,
        foundation_skills=foundation_skills,
        roles=roles,
        programme_name=programme_name,
        generated_on=generated_on,
    )


def _load_school_student(user_id: str, school_id: str) -> dict:
    """Fetch a student that belongs to the admin's school; 404 otherwise."""
    ures = _users().select(
        "id, username, student_class, stream, chosen_direction, provisioning_school_id"
    ).eq("id", user_id).limit(1).execute()
    u = (ures.data or [None])[0]
    if not u:
        raise HTTPException(status_code=404, detail="Student not found.")
    # The student must be affiliated with (or provisioned by) this school.
    if u.get("provisioning_school_id") != school_id:
        aff = _svc().table("student_affiliations").select("student_id").eq(
            "student_id", user_id
        ).eq("school_id", school_id).limit(1).execute()
        if not aff.data:
            raise HTTPException(status_code=404, detail="Student not found for your school.")
    return u


def _require_guided_student(user: dict) -> dict:
    if not user.get("chosen_direction"):
        raise HTTPException(
            status_code=409,
            detail="Complete learner guidance before printing a report.",
        )
    return user


def _school_name(school_id: str) -> Optional[str]:
    try:
        s = _svc().table("schools").select("name").eq("id", school_id).limit(1).execute()
        return (s.data or [{}])[0].get("name")
    except Exception:  # noqa: BLE001
        return None


@router.patch("/students/{user_id}/guidance", response_model=ResponseModel)
async def save_student_guidance(
    user_id: str,
    payload: GuidanceUpdate = Body(...),
    current_user: dict = Depends(Auth.require_admin),
):
    """Save the learner's selected direction before a report can be printed.

    The administrator may guide a provisioned learner before the learner claims
    the account. Only the direction is persisted; subjects and grades remain
    transient inputs and are never copied into the account.
    """
    school_id = _require_school(current_user)
    direction = payload.chosen_direction.model_dump(exclude_none=True)
    if not direction:
        raise HTTPException(status_code=400, detail="Choose a programme or career direction first.")
    _load_school_student(user_id, school_id)
    try:
        result = (
            _users()
            .update({"chosen_direction": direction})
            .eq("id", user_id)
            .select("id, chosen_direction")
            .execute()
        )
        if not result.data:
            raise RuntimeError("learner guidance update matched no account")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("provisioning: learner guidance save failed", error=str(exc))
        raise HTTPException(status_code=500, detail="Could not save learner guidance.")
    return ResponseModel(
        data={
            "user_id": user_id,
            "chosen_direction": direction,
            "guidance_complete": True,
        },
    )


@router.get("/students/{user_id}/report.docx")
async def get_report_docx(
    user_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """Editable .docx career report — shareable to email/WhatsApp."""
    school_id = _require_school(current_user)
    u = _require_guided_student(_load_school_student(user_id, school_id))
    ctx = _resolve_report_context(u, _school_name(school_id), _now()[:10])
    data = build_report_docx(ctx)
    safe = (ctx.student_name or "student").replace(" ", "_")[:40]
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="career_report_{safe}.docx"'},
    )


@router.get("/students/{user_id}/report.html")
async def get_report_html(
    user_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """HTML career report — print-to-PDF in any browser."""
    school_id = _require_school(current_user)
    u = _require_guided_student(_load_school_student(user_id, school_id))
    ctx = _resolve_report_context(u, _school_name(school_id), _now()[:10])
    return Response(content=build_report_html(ctx), media_type="text/html")


@router.get("/students/{user_id}/login-card.html")
async def get_login_card(
    user_id: str,
    current_user: dict = Depends(Auth.require_admin),
):
    """The detachable login card carrying the live claim code (unclaimed only)."""
    school_id = _require_school(current_user)
    u = _load_school_student(user_id, school_id)
    cres = _svc().table("claim_codes").select("code").eq(
        "student_id", user_id
    ).is_("redeemed_at", "null").is_("revoked_at", "null").order(
        "created_at", desc=True
    ).limit(1).execute()
    cc = (cres.data or [None])[0]
    if not cc:
        raise HTTPException(status_code=409, detail="No active claim code — the account is already claimed.")
    card = build_login_card_html(
        student_name=u.get("username") or "Student",
        claim_code=cc["code"],
        school_name=_school_name(school_id),
        student_class=u.get("student_class"),
        stream=u.get("stream"),
    )
    return Response(content=card, media_type="text/html")
