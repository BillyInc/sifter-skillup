# ============================================================
# Sifter — Student live pipeline routes
#
# Privacy stance:
#   - No DOB collection.
#   - No grades/documents stored.
#   - School affiliation is weak until code/provisioning verified.
#   - Educator visibility remains consent/provisioning gated elsewhere.
# ============================================================
from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field

from auth import Auth
from database import db
from logger import log
from models import ResponseModel
from reference_cache import REFERENCE_TTL_SECONDS, SEARCH_TTL_SECONDS, clear_prefix, get_json, set_json
from services.guidance_report import resolve_guidance_report_context
from services.report_gen import ReportContext, build_report_docx, build_report_html

router = APIRouter(prefix="/api/student", tags=["student-pipeline"])

_SCHEMA = "skillup_dev"
MAX_EARLY_OLEVEL_SUBJECTS = 6
MAX_UTME_SUBJECTS = 4
_SUBJECT_MATCH_AUTHORITY_STATE = "unknown"
CAREER_REPORT_EXPORTS_ENABLED = True


def _require_career_report_exports_enabled() -> None:
    if not CAREER_REPORT_EXPORTS_ENABLED:
        raise HTTPException(
            status_code=410,
            detail="Career report export is disabled. Review and save your guidance inside Sifter LevelUp.",
        )


def _svc():
    return db.get_service_client().schema(_SCHEMA)


def _users():
    return db.get_service_client().table("users")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _real(data: Any, notice: Optional[str] = None) -> dict:
    return {
        "status": "real",
        "data": data,
        "meta": ({"notice": notice} if notice else None),
    }


def _fallback(data: Any, notice: str) -> dict:
    return {
        "status": "fallback",
        "data": data,
        "meta": {"notice": notice, "verification": "inferred"},
    }


def _coming_soon(notice: str) -> dict:
    return {"status": "coming_soon", "data": None, "meta": {"notice": notice}}


def _clean_text(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _student_programme_name(value: Any) -> Optional[str]:
    """Return the exact JAMB/source name for student-facing output.

    Programme identity is source data, not presentation copy. A slash, acronym,
    qualifier, or university-specific wording must remain intact because two
    source rows can represent different JAMB names. In particular, do not turn
    ``Library Science`` into ``Library and Information Science`` (or vice versa)
    and do not shorten labels such as ``Nursing/Nursing Science``.
    """
    raw = _clean_text(value)
    if not raw:
        return None
    return raw


def _requirement_status(parse_status: Any, *texts: Any) -> str:
    """Classify requirement evidence without turning missing text into a rule.

    ``complete`` means the national row is explicitly marked parsed and has
    usable text. ``review_only`` keeps source text browseable while preventing
    it from being treated as an executable eligibility rule. ``source_missing``
    is reserved for rows with no usable requirement text at all.
    """
    has_text = any(_clean_text(value) for value in texts)
    status = str(parse_status or "").strip().lower()
    if status == "parsed" and has_text:
        return "complete"
    if status in {"unparsed", "needs_review", "inherited_shared"} or has_text:
        return "review_only"
    return "source_missing"


def _source_evidence_out(rows: list[dict]) -> list[dict]:
    """Return source locations as evidence, never as eligibility rules."""
    out = []
    for row in rows:
        out.append({
            "layer": row.get("layer"),
            "sourceFile": row.get("source_file"),
            "page": row.get("pdf_page"),
            "tableRow": row.get("table_row"),
            "sourceStatus": row.get("source_status"),
            "resolution": row.get("resolution"),
            "text": row.get("requirement_text") or row.get("course_cell") or row.get("waiver_cell"),
            "sourceLabel": row.get("source_label"),
        })
    return out


def _offering_requirement_status(
    *,
    utme: Any,
    olevel: Any,
    exceptions: list[dict],
    local_options: list[dict],
) -> tuple[str, str]:
    """Classify one university offering's local requirement evidence."""
    if any(row.get("parseStatus") == "needs_review" for row in exceptions):
        return "review_only", "This university's requirement wording still needs confirmation."
    if local_options:
        if any(option.get("rule_scope") == "full" for option in local_options):
            return "complete", "A structured university-specific rule is recorded."
        return "review_only", "A university-specific condition is recorded, but it is not a complete rule."
    if _clean_text(utme) or _clean_text(olevel):
        return "review_only", "The university requirement text is recorded but has not been fully structured."
    return "review_only", "University-specific requirements have not been recorded yet."


def _clean_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for item in value:
        text = _clean_text(item)
        if not text:
            continue
        key = text.lower()
        if key not in seen:
            out.append(text)
            seen.add(key)
    return out


def _normalise_subject(value: str) -> str:
    value = value.strip().lower()
    value = value.replace("&", "and")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def _canonical_subject_name(value: str) -> str:
    lower = _normalise_subject(value)
    aliases = {
        "english": "English Language",
        "use of english": "English Language",
        "use of english language": "English Language",
        "math": "Mathematics",
        "maths": "Mathematics",
        "agric science": "Agricultural Science",
        "financial accounting": "Principles of Accounts",
        "accounting": "Principles of Accounts",
        "accounting/financial accounting": "Principles of Accounts",
        "book keeping": "Principles of Accounts",
        "bookkeeping": "Principles of Accounts",
        "general wood work": "Woodwork",
        "general metal work": "Metalwork",
        "building engineering drawing": "Technical Drawing",
        "basic catering and food services": "Catering Craft Practice",
        "fine arts": "Fine Art",
        "literature": "Literature in English",
        "lit in english": "Literature in English",
        "computer": "Computer Studies",
        "computer science": "Computer Studies",
        "crs": "Christian Religious Studies",
        "crk": "Christian Religious Studies",
        "irs": "Islamic Religious Studies",
        "irk": "Islamic Religious Studies",
    }
    return aliases.get(lower, value.strip())


def _normalise_stream(value: Optional[str]) -> Optional[str]:
    stream = (value or "").strip().lower()
    if stream == "arts":
        return "art"
    return stream if stream in {"science", "commercial", "art"} else None


def _resolve_subject_catalog(subjects: list[str]) -> dict[str, dict]:
    """Map normalized chosen subject names to subject_catalog rows when seeded."""
    if not subjects:
        return {}
    try:
        names = [_canonical_subject_name(s) for s in subjects]
        # Fetch a broad active catalog. Subject list is small; this avoids fragile
        # PostgREST OR syntax for alias arrays and keeps matching deterministic.
        res = (
            _svc()
            .table("subject_catalog")
            .select("id, code, name, aliases, category, stream_tags")
            .eq("active", True)
            .limit(300)
            .execute()
        )
        chosen = {_normalise_subject(n) for n in names}
        matched: dict[str, dict] = {}
        for row in res.data or []:
            keys = {_normalise_subject(row.get("name") or "")}
            for alias in row.get("aliases") or []:
                keys.add(_normalise_subject(str(alias)))
            hit = keys.intersection(chosen)
            if hit:
                for key in hit:
                    matched[key] = row
        return matched
    except Exception as exc:  # noqa: BLE001
        log.warning("student subjects: catalog match skipped", error=str(exc))
        return {}


def _profile_out(row: dict, subject_rows: Optional[list[dict]] = None) -> dict:
    raw = row.get("raw_profile") or {}
    return {
        "id": row.get("id"),
        "userId": row.get("user_id"),
        "userType": row.get("user_type"),
        "ssDoor": row.get("ss_door"),
        "ssClass": row.get("ss_class"),
        "stream": row.get("stream"),
        "exploreIntent": row.get("explore_intent") or [],
        "preferredInstitutionType": row.get("preferred_institution_type"),
        "preferredSchoolId": row.get("preferred_school_id"),
        "preferredSchool": row.get("preferred_school_name"),
        "schoolName": row.get("preferred_school_name"),
        "secondarySchoolId": raw.get("secondarySchoolId"),
        "secondarySchoolName": raw.get("secondarySchoolName"),
        "jambPrepMode": raw.get("jambPrepMode"),
        "tutorialCentreId": raw.get("tutorialCentreId"),
        "tutorialCentreName": raw.get("tutorialCentreName"),
        "intendedJambProgrammeId": row.get("intended_jamb_programme_id"),
        "intendedProgrammeId": row.get("intended_programme_id"),
        "intendedProgramme": row.get("intended_programme_name"),
        "programmeName": row.get("intended_programme_name"),
        "priorFieldDomainKey": row.get("prior_field_domain_key"),
        "regions": row.get("work_regions") or [],
        "workTypes": row.get("work_types") or [],
        "notifications": row.get("notification_prefs") or {},
        "jambSubjects": [
            s.get("subject_name_snapshot")
            for s in (subject_rows or [])
            if s.get("choice_type") in ("strongest", "utme", "preferred")
        ],
        "olevelSubjects": [
            s.get("subject_name_snapshot")
            for s in (subject_rows or [])
            if s.get("choice_type") == "olevel"
        ],
        "completedAt": row.get("completed_at"),
    }


class StartingPointIn(BaseModel):
    userType: str
    institutionType: Optional[str] = None
    schoolName: Optional[str] = None
    programmeName: Optional[str] = None
    discipline: Optional[str] = None
    yearOfStudy: Optional[str] = None
    secondarySchoolId: Optional[str] = None
    secondarySchoolName: Optional[str] = None
    jambPrepMode: Optional[str] = None
    tutorialCentreId: Optional[str] = None
    tutorialCentreName: Optional[str] = None
    ssDoor: Optional[str] = None
    ssClass: Optional[str] = None
    stream: Optional[str] = None
    exploreIntent: list[str] = Field(default_factory=list)
    jambSubjects: list[str] = Field(default_factory=list)
    olevelSubjects: list[str] = Field(default_factory=list)
    preferredInstitutionType: Optional[str] = None
    preferredSchoolId: Optional[str] = None
    preferredSchool: Optional[str] = None
    intendedJambProgrammeId: Optional[str] = None
    intendedProgrammeId: Optional[str] = None
    intendedProgramme: Optional[str] = None
    priorFieldDomainKey: Optional[str] = None
    regions: list[str] = Field(default_factory=list)
    workTypes: list[str] = Field(default_factory=list)
    notifications: dict[str, Any] = Field(default_factory=dict)


class GuidanceReportPathIn(BaseModel):
    """The selected branches of one Student's guidance journey.

    The path stores source identifiers plus display snapshots. Detailed source
    records are resolved when a report is rendered, so the report does not
    duplicate the catalogue or silently include unselected branches.
    """

    source: str = "explore"
    path: dict[str, Any] = Field(default_factory=dict)


class InstitutionRegisterIn(BaseModel):
    name: str
    institutionType: str
    address: Optional[str] = None


def _admission_resolution_complete(payload: StartingPointIn) -> bool:
    if payload.userType not in ("jamb", "ss3_secondary", "senior_secondary"):
        return True
    programme = (
        _clean_text(payload.intendedJambProgrammeId)
        or _clean_text(payload.intendedProgrammeId)
        or _clean_text(payload.intendedProgramme)
        or _clean_text(payload.programmeName)
    )
    school = (
        _clean_text(payload.preferredSchoolId)
        or _clean_text(payload.preferredSchool)
    )
    return bool(programme and school)


def _upsert_secondary_school_affiliation(svc, user_id: str, payload: StartingPointIn) -> None:
    school_id = _clean_text(payload.secondarySchoolId)
    if not school_id or payload.userType not in ("ss3_secondary", "senior_secondary"):
        return
    try:
        svc.table("student_affiliations").upsert({
            "id": str(uuid.uuid4()),
            "student_id": user_id,
            "school_id": school_id,
            "source": "self_reported",
            "self_reported": True,
        }, on_conflict="student_id,school_id").execute()
    except Exception as exc:  # noqa: BLE001
        log.warning("student secondary school affiliation skipped", error=str(exc))


def _record_admission_pathway_choice(svc, user_id: str, starting_id: str, payload: StartingPointIn) -> None:
    school_id = _clean_text(payload.preferredSchoolId)
    jamb_programme_id = _clean_text(payload.intendedJambProgrammeId)
    if not school_id or not jamb_programme_id:
        return
    try:
        svc.table("student_pathway_choices").update({"status": "replaced"}).eq(
            "user_id", user_id
        ).eq("source", "onboarding").in_("stage", ["programme", "school"]).eq(
            "status", "active"
        ).execute()
        svc.table("student_pathway_choices").insert({
            "user_id": user_id,
            "starting_point_id": starting_id,
            "stage": "school",
            "school_id": school_id,
            "jamb_programme_id": jamb_programme_id,
            "programme_id": _clean_text(payload.intendedProgrammeId),
            "source": "onboarding",
            "status": "active",
            "evidence": {
                "selectionStatus": "programme_and_university_resolved",
                "domainResolved": False,
            },
        }).execute()
    except Exception as exc:  # noqa: BLE001
        log.warning("student admission pathway choice skipped", error=str(exc))


@router.get("/starting-point", response_model=ResponseModel)
async def get_starting_point(current_user: dict = Depends(Auth.get_current_user)):
    try:
        res = (
            _svc()
            .table("student_starting_points")
            .select("*")
            .eq("user_id", current_user["id"])
            .limit(1)
            .execute()
        )
        if not res.data:
            return ResponseModel(data=_real(None))
        row = res.data[0]
        subjects = (
            _svc()
            .table("student_subject_choices")
            .select("subject_name_snapshot, choice_type, rank")
            .eq("starting_point_id", row["id"])
            .order("rank")
            .execute()
        )
        return ResponseModel(data=_real(_profile_out(row, subjects.data or [])))
    except Exception as exc:  # noqa: BLE001
        log.error("student starting-point get failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Starting point is temporarily unavailable."))


@router.post("/starting-point", response_model=ResponseModel)
async def save_starting_point(
    payload: StartingPointIn = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Persist the student's onboarding state server-side.

    This stores selected subjects but not grades, documents, or DOB.
    """
    user_id = current_user["id"]
    try:
        svc = _svc()
        now = _now()
        preferred_type = _clean_text(payload.preferredInstitutionType or payload.institutionType)
        if payload.userType in {"jamb", "ss3_secondary"}:
            preferred_type = "university" if (
                _clean_text(payload.preferredSchoolId) or _clean_text(payload.preferredSchool)
            ) else None
        profile_payload = {
            "user_id": user_id,
            "user_type": payload.userType,
            "ss_door": _clean_text(payload.ssDoor),
            "ss_class": _clean_text(payload.ssClass),
            "stream": _clean_text(payload.stream),
            "explore_intent": _clean_list(payload.exploreIntent),
            # Score bands are not school-specific admission requirements. Keep
            # the nullable column for compatibility, but do not collect or
            # persist a guessed band from onboarding.
            "jamb_score_band": None,
            "preferred_institution_type": preferred_type,
            "preferred_school_id": _clean_text(payload.preferredSchoolId),
            "preferred_school_name": _clean_text(payload.preferredSchool or payload.schoolName),
            "intended_jamb_programme_id": _clean_text(payload.intendedJambProgrammeId),
            "intended_programme_id": _clean_text(payload.intendedProgrammeId),
            "intended_programme_name": _clean_text(payload.intendedProgramme or payload.programmeName),
            "prior_field_domain_key": _clean_text(payload.priorFieldDomainKey),
            "work_regions": _clean_list(payload.regions),
            "work_types": _clean_list(payload.workTypes),
            "notification_prefs": payload.notifications or {},
            "raw_profile": payload.model_dump(),
            # Starting-point setup is onboarding. Programme/university
            # resolution continues in Discovery and must not keep the account
            # behind the auth/onboarding route guard.
            "completed_at": now,
            "updated_at": now,
        }
        existing = (
            svc.table("student_starting_points")
            .select("id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            starting_id = existing.data[0]["id"]
            res = (
                svc.table("student_starting_points")
                .update(profile_payload)
                .eq("id", starting_id)
                .execute()
            )
            svc.table("student_subject_choices").delete().eq(
                "starting_point_id", starting_id
            ).execute()
        else:
            starting_id = str(uuid.uuid4())
            res = (
                svc.table("student_starting_points")
                .insert({"id": starting_id, **profile_payload})
                .execute()
            )

        catalog = _resolve_subject_catalog(payload.jambSubjects + payload.olevelSubjects)
        subject_rows = []
        for idx, subject in enumerate(_clean_list(payload.jambSubjects)):
            canonical = _canonical_subject_name(subject)
            match = catalog.get(_normalise_subject(canonical))
            subject_rows.append({
                "starting_point_id": starting_id,
                "user_id": user_id,
                "subject_id": match.get("id") if match else None,
                "subject_name_snapshot": canonical,
                "choice_type": "utme",
                "rank": idx + 1,
                "self_reported": True,
            })
        for idx, subject in enumerate(_clean_list(payload.olevelSubjects)):
            canonical = _canonical_subject_name(subject)
            match = catalog.get(_normalise_subject(canonical))
            subject_rows.append({
                "starting_point_id": starting_id,
                "user_id": user_id,
                "subject_id": match.get("id") if match else None,
                "subject_name_snapshot": canonical,
                "choice_type": "olevel",
                "rank": idx + 1,
                "self_reported": True,
            })
        if subject_rows:
            svc.table("student_subject_choices").insert(subject_rows).execute()

        _upsert_secondary_school_affiliation(svc, user_id, payload)
        admission_complete = _admission_resolution_complete(payload)
        if admission_complete:
            _record_admission_pathway_choice(svc, user_id, starting_id, payload)
        _users().update({"onboarding_completed": True}).eq("id", user_id).execute()
        row = (res.data or [{}])[0]
        return ResponseModel(data=_real(_profile_out(row, subject_rows)))
    except Exception as exc:  # noqa: BLE001
        log.error("student starting-point save failed", error=str(exc))
        return ResponseModel(success=False, message="Could not save starting point.", data=None)


def _path_snapshot(path: dict[str, Any]) -> dict[str, Any]:
    """Keep report context plus the safe account-scoped resume checkpoint.

    The guided selector writes its current stage beside the selected path so a
    student can leave and return without losing their place. Only the small
    checkpoint vocabulary is retained; arbitrary client payloads are dropped.
    """
    allowed_single = {
        "academicContext", "subjects", "programme", "university", "requirements",
        "discoveryDoor", "notes",
    }
    allowed_lists = {"domains", "subgroups", "roles"}
    out: dict[str, Any] = {}
    for key in allowed_single:
        value = path.get(key)
        if value is not None:
            out[key] = value
    for key in allowed_lists:
        value = path.get(key)
        if isinstance(value, list):
            out[key] = [item for item in value if isinstance(item, dict)]
    resume = path.get("resume")
    if isinstance(resume, dict):
        checkpoint = {
            key: resume[key]
            for key in ("stage", "status", "mode")
            if isinstance(resume.get(key), str) and resume[key].strip()
        }
        if checkpoint:
            out["resume"] = checkpoint
    return out


@router.get("/guidance-path", response_model=ResponseModel)
async def get_guidance_path(current_user: dict = Depends(Auth.get_current_user)):
    """Return the Student's current selected guidance branches."""
    try:
        res = (
            _svc().table("guidance_report_paths").select("*")
            .eq("student_id", current_user["id"]).limit(1).execute()
        )
        row = (res.data or [None])[0]
        if not row:
            return ResponseModel(data=_real(None))
        return ResponseModel(data=_real({
            "id": row.get("id"),
            "studentId": row.get("student_id"),
            "source": row.get("source"),
            "path": row.get("path") or {},
            "updatedAt": row.get("updated_at"),
        }))
    except Exception as exc:  # noqa: BLE001
        log.error("student guidance path get failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Your saved guidance path is temporarily unavailable."))


@router.put("/guidance-path", response_model=ResponseModel)
async def save_guidance_path(
    payload: GuidanceReportPathIn = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Persist the selected branches used by the Student's eventual report."""
    source = payload.source if payload.source in {"self", "onboarding", "explore"} else "explore"
    snapshot = _path_snapshot(payload.path)
    if not snapshot:
        return ResponseModel(success=False, message="Choose a guidance path before saving.", data=None)
    try:
        now = _now()
        res = _svc().table("guidance_report_paths").upsert({
            "student_id": current_user["id"],
            "created_by": current_user["id"],
            "source": source,
            "path": snapshot,
            "updated_at": now,
        }, on_conflict="student_id").execute()
        row = (res.data or [{}])[0]
        return ResponseModel(data=_real({
            "id": row.get("id"),
            "studentId": current_user["id"],
            "source": source,
            "path": snapshot,
            "updatedAt": now,
        }))
    except Exception as exc:  # noqa: BLE001
        log.error("student guidance path save failed", error=str(exc))
        return ResponseModel(success=False, message="Could not save this guidance path yet.", data=None)


def _current_guidance_report_context(current_user: dict) -> ReportContext:
    user_row = (_users().select(
        "id, username, student_class, stream, provisioning_school_id"
    ).eq("id", current_user["id"]).limit(1).execute().data or [None])[0]
    user = user_row or current_user
    path_row = (_svc().table("guidance_report_paths").select("path, source, updated_at")
                .eq("student_id", current_user["id"]).limit(1).execute().data or [None])[0]
    full_path = resolve_guidance_report_context(_svc(), user, path_row)
    programme = full_path.get("programme") or {}
    university = full_path.get("university") or {}
    if not programme.get("name") or not university.get("name"):
        raise HTTPException(
            status_code=409,
            detail="Choose a programme and university before printing your report.",
        )
    academic = full_path.get("academicContext") or {}
    return ReportContext(
        student_name=full_path.get("studentName") or "Student",
        student_class=academic.get("class"),
        stream=academic.get("stream"),
        school_name=academic.get("schoolName"),
        programme_name=programme.get("name"),
        full_path=full_path,
        generated_on=_now()[:10],
    )


@router.get("/report.html")
async def get_my_guidance_report_html(
    current_user: dict = Depends(Auth.get_current_user),
):
    """Authenticated Student report; print-to-PDF is handled by the browser."""
    _require_career_report_exports_enabled()
    try:
        ctx = _current_guidance_report_context(current_user)
        return Response(content=build_report_html(ctx), media_type="text/html")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("student guidance report html failed", error=str(exc))
        raise HTTPException(status_code=503, detail="Your report is temporarily unavailable.")


@router.get("/report.docx")
async def get_my_guidance_report_docx(
    current_user: dict = Depends(Auth.get_current_user),
):
    """Authenticated Student report as an editable document."""
    _require_career_report_exports_enabled()
    try:
        ctx = _current_guidance_report_context(current_user)
        safe = (ctx.student_name or "student").replace(" ", "_")[:40]
        return Response(
            content=build_report_docx(ctx),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="guidance_report_{safe}.docx"'},
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        log.error("student guidance report docx failed", error=str(exc))
        raise HTTPException(status_code=503, detail="Your report is temporarily unavailable.")


@router.get("/subjects", response_model=ResponseModel)
async def list_subjects(
    q: Optional[str] = Query(None),
    stream: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
):
    try:
        cache_key = "student:subjects:" + ":".join([
            (q or "").strip().lower(),
            (stream or "").strip().lower(),
            (exam_type or "").strip().lower(),
        ])
        cached = get_json(cache_key)
        if isinstance(cached, list):
            return ResponseModel(data=_real(cached))
        query = (
            _svc()
            .table("subject_catalog")
            .select("id, code, name, aliases, category, stream_tags")
            .eq("active", True)
        )
        if q:
            query = query.ilike("name", f"%{q.strip()}%")
        normalized_stream = _normalise_stream(stream)
        # Stream is a relevance/order hint, not an eligibility filter. The
        # picker must still expose every valid JAMB/O-level subject for the
        # selected stream, including subjects outside its usual cluster.
        if exam_type:
            query = query.contains("exam_types", [exam_type.strip().lower()])
        # Return the complete active catalogue for the requested exam type.
        # Stream tags only affect ordering; they must never hide valid subjects
        # that a Student may need to choose.
        res = query.order("name").execute()
        items = [
            {
                "id": r["id"],
                "code": r.get("code"),
                "name": r.get("name"),
                "aliases": r.get("aliases") or [],
                "category": r.get("category"),
                "streamTags": r.get("stream_tags") or [],
            }
            for r in (res.data or [])
        ]
        if normalized_stream and items:
            items.sort(key=lambda item: (
                0 if normalized_stream in (item.get("streamTags") or []) else 1,
                item.get("name") or "",
            ))
        set_json(cache_key, items, REFERENCE_TTL_SECONDS)
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001
        log.warning("student subjects: list failed", error=str(exc))
        # Never manufacture a subject list when the catalogue is unavailable.
        # A fabricated list makes stream-aware JAMB/O-level guidance look
        # authoritative and can silently change eligibility decisions.
        return ResponseModel(
            data=_real([], "The subject catalogue is temporarily unavailable. Please try again.")
        )


@router.get("/jamb-programmes", response_model=ResponseModel)
async def search_jamb_programmes(q: Optional[str] = Query(None), limit: int = Query(30)):
    try:
        svc = _svc()
        cache_key = (q or "").strip().lower()
        cache_key = f"student:jamb-programmes:{cache_key}:{min(limit, 80)}"
        cached = get_json(cache_key)
        if isinstance(cached, list):
            return ResponseModel(data=_real(cached[: min(limit, 80)]))
        try:
            if q and q.strip():
                like = f"%{q.strip()}%"
                res = (
                    svc.table("v_jamb_programme_details")
                    .select("*")
                    .or_(f"jamb_name.ilike.{like},canonical_programme_name.ilike.{like}")
                    .order("jamb_name")
                    .limit(min(limit, 80))
                    .execute()
                )
            else:
                res = (
                    svc.table("v_jamb_programme_details")
                    .select("*")
                    .order("jamb_name")
                    .limit(min(limit, 80))
                    .execute()
                )
        except Exception as exc:
            # Keep JAMB onboarding searchable when the optional detail view is
            # absent or stale. The direct registry still contains the official
            # JAMB programme names; school-specific requirements load later.
            log.warning("student jamb programme detail view skipped", error=str(exc))
            direct = svc.table("jamb_programmes").select(
                "id, jamb_name, jamb_faculty, degree_type, is_blend"
            )
            if q and q.strip():
                direct = direct.ilike("jamb_name", f"%{q.strip()}%")
            res = direct.order("jamb_name").limit(min(limit, 80)).execute()
        items = [_jamb_detail_out(r) for r in (res.data or [])]
        # Keep each JAMB programme identity as its own result. The attached
        # rows are university offerings for that exact identity; a genuinely
        # different JAMB name must have a different jamb_programme_id and will
        # therefore appear as a separate result rather than a nested variant.
        try:
            jamb_ids = [item["jambProgrammeId"] for item in items if item.get("jambProgrammeId")]
            # A typeahead page can contain many JAMB IDs and a single database
            # row limit would silently drop universities for the later IDs.
            # Batch the IDs so every offering for every returned programme is
            # loaded before the UI takes its three-name preview.
            offering_rows: list[dict] = []
            for start in range(0, len(jamb_ids), 5):
                offering_rows.extend(
                    (
                        svc.table("v_school_jamb_programmes")
                        .select("school_id, jamb_programme_id, school_name, jamb_name")
                        .in_("jamb_programme_id", jamb_ids[start : start + 5])
                        .limit(2000)
                        .execute()
                    ).data
                    or []
                )
            schools_by_jamb: dict[str, list[str]] = {}
            offerings_by_jamb: dict[str, list[dict[str, str]]] = {}
            for row in offering_rows:
                jid = row.get("jamb_programme_id")
                school = (row.get("school_name") or "").strip()
                if jid and school and school not in schools_by_jamb.setdefault(jid, []):
                    schools_by_jamb[jid].append(school)
                source_name = _clean_text(row.get("jamb_name"))
                if jid and school and source_name:
                    offering = {
                        "schoolName": school,
                        "programmeName": source_name,
                        "studentName": _student_programme_name(source_name) or source_name,
                    }
                    existing = offerings_by_jamb.setdefault(jid, [])
                    if offering not in existing:
                        existing.append(offering)
            preview_school_ids = list({row.get("school_id") for row in offering_rows if row.get("school_id")})
            preview_locations: dict[str, dict] = {}
            if preview_school_ids:
                try:
                    preview_location_rows = (
                        svc.table("schools")
                        .select("id, address, city, state, country")
                        .in_("id", preview_school_ids)
                        .execute()
                    ).data or []
                    preview_locations = {str(row.get("id")): row for row in preview_location_rows}
                except Exception as location_exc:  # noqa: BLE001
                    log.debug("programme search school address enrichment unavailable", error=str(location_exc))
            for jid, offerings in offerings_by_jamb.items():
                source_rows = [row for row in offering_rows if row.get("jamb_programme_id") == jid]
                for offering in offerings:
                    source = next(
                        (
                            row for row in source_rows
                            if row.get("school_name") == offering.get("schoolName")
                        ),
                        None,
                    ) or {}
                    location = preview_locations.get(str(source.get("school_id"))) or {}
                    offering.update({
                        "schoolId": source.get("school_id"),
                        "address": location.get("address"),
                        "city": location.get("city"),
                        "state": location.get("state"),
                        "country": location.get("country"),
                    })
            for item in items:
                jid = item.get("jambProgrammeId")
                names = schools_by_jamb.get(jid, [])
                item["schoolNames"] = names[:3]
                item["schoolCount"] = len(names)
                item["schoolOfferings"] = offerings_by_jamb.get(jid, [])
        except Exception as exc:  # noqa: BLE001
            log.warning("student programme school context skipped", error=str(exc))
        set_json(cache_key, items, SEARCH_TTL_SECONDS)
        return ResponseModel(data=_real(items[: min(limit, 80)]))
    except Exception as exc:  # noqa: BLE001
        log.error("student jamb-programme search failed", error=str(exc))
        return ResponseModel(data=_coming_soon("JAMB programme search is temporarily unavailable."))


@router.get("/jamb-programmes/{jamb_programme_id}", response_model=ResponseModel)
async def get_jamb_programme(jamb_programme_id: str):
    try:
        svc = _svc()
        res = (
            svc
            .table("v_jamb_programme_details")
            .select("*")
            .eq("jamb_programme_id", jamb_programme_id)
            .limit(1)
            .execute()
        )
        if not res.data:
            return ResponseModel(data=_real(None, "JAMB programme not found."))
        out = _jamb_detail_out(res.data[0], full=True)
        # Requirements block: general brochure text + parse status. Programmes whose
        # requirement is institution-variant prose (parse_status = needs_review)
        # surface it as "requirements vary by institution" info, not a gap.
        try:
            req = (
                svc.table("programme_subject_requirements")
                .select("utme_subjects, olevel_requirement, parse_status, parsed_at")
                .eq("jamb_programme_id", jamb_programme_id)
                .limit(1)
                .execute()
            )
            if req.data:
                r = req.data[0]
                source_rows = []
                try:
                    source_rows = (
                        svc.table("jamb_programme_requirement_sources")
                        .select(
                            "layer, source_file, pdf_page, table_row, source_status, "
                            "resolution, requirement_text, course_cell, waiver_cell, source_label"
                        )
                        .eq("jamb_programme_id", jamb_programme_id)
                        .order("layer")
                        .order("pdf_page")
                        .order("table_row")
                        .execute()
                    ).data or []
                    source_rows = [
                        row for row in source_rows
                        if row.get("layer") != "direct_entry"
                    ]
                except Exception as source_exc:  # noqa: BLE001
                    log.debug("jamb requirement source evidence unavailable", error=str(source_exc))
                source_statuses = {str(row.get("source_status") or "").lower() for row in source_rows}
                requirement_status = _requirement_status(
                    r.get("parse_status"),
                    r.get("utme_subjects"),
                    r.get("olevel_requirement"),
                )
                if {"source_blank", "source_row_not_found"} & source_statuses:
                    requirement_status = "source_missing"
                elif "inherited_shared" in source_statuses and requirement_status == "complete":
                    requirement_status = "review_only"
                out["requirements"] = {
                    "utmeSubjects": r.get("utme_subjects"),
                    "olevelRequirement": r.get("olevel_requirement"),
                    "parseStatus": r.get("parse_status"),
                    "variesByInstitution": r.get("parse_status") == "needs_review",
                    "requirementStatus": requirement_status,
                    "parsedAt": r.get("parsed_at"),
                    "sourceEvidence": _source_evidence_out(source_rows),
                }
            else:
                out["requirements"] = {
                    "utmeSubjects": None,
                    "olevelRequirement": None,
                    "parseStatus": None,
                    "variesByInstitution": False,
                    "requirementStatus": "source_missing",
                    "parsedAt": None,
                    "sourceEvidence": [],
                }
        except Exception as exc:  # noqa: BLE001
            log.warning("jamb requirements lookup skipped", error=str(exc))
        return ResponseModel(data=_real(out))
    except Exception as exc:  # noqa: BLE001
        log.error("student jamb-programme detail failed", error=str(exc))
        return ResponseModel(data=_coming_soon("JAMB programme detail is temporarily unavailable."))


def _skill_list(value: Any) -> list[str]:
    """A JSONB text[] from the skills profile, defensively flattened."""
    if not isinstance(value, list):
        return []
    return [s.strip() for s in value if isinstance(s, str) and s.strip()]


# How many outcomes a LIST row carries. The card renders three and a count, so
# shipping the whole profile per row is pure waste: MBBS alone has 1560
# technical outcomes, and one university's 81-course list weighed 2.0 MB and
# took 3.5s. Detail responses still carry the full profile — that is the screen
# that displays it.
SKILLS_PREVIEW_MAX = 3


def _skills_out(r: dict, *, full: bool) -> dict:
    """The skills half of a programme payload.

    `skillsCount` is always the TRUE total, never the length of what was sent.
    The teaser reads "+N more" off it, so a count derived from a truncated
    preview would quietly understate every long profile.
    """
    technical = _skill_list(r.get("skills_technical"))
    transferable = _skill_list(r.get("skills_transferable"))
    return {
        "skillsTechnical": technical if full else technical[:SKILLS_PREVIEW_MAX],
        "skillsTransferable": transferable if full else transferable[:SKILLS_PREVIEW_MAX],
        "skillsTechnicalCount": len(technical),
        "skillsTransferableCount": len(transferable),
        "skillsCount": len(technical) + len(transferable),
        "skillsTruncated": not full,
    }


def _jamb_detail_out(r: dict, *, full: bool = False) -> dict:
    """Shape a JAMB programme for the student surface.

    The student's identifier is the JAMB NAME — what their school calls the
    course. CCMAS is the mapping substrate underneath it: it is how a JAMB name
    resolves to domains and roles, and it is not something a student needs to
    read. `canonicalProgrammeName`, `discipline`, `mappingType`, `mappingNote`
    and `confidence` are therefore no longer emitted here; the mapping still
    happens, it just stops being presented as a curriculum fact.

    What replaces it is the thing a student actually asked: what this degree
    teaches. `skillsTechnical` is derived from the CCMAS course learning
    outcomes, `skillsTransferable` from the employability and 21st-century
    skill lists.

    `full` is False for list rows — see SKILLS_PREVIEW_MAX.
    """
    return {
        "id": r.get("jamb_programme_id"),
        "jambProgrammeId": r.get("jamb_programme_id"),
        "jambName": r.get("jamb_name"),
        "studentName": _student_programme_name(r.get("jamb_name")),
        "jambFaculty": r.get("jamb_faculty"),
        "degreeType": r.get("degree_type"),
        "isBlend": bool(r.get("is_blend")),
        # Kept: the id is needed to fetch schools/domains/requirements, and
        # institutionType drives which registry a result belongs to. Neither is
        # CCMAS vocabulary shown to the student.
        "programmeId": r.get("programme_id"),
        "institutionType": r.get("institution_type"),
        **_skills_out(r, full=full),
    }


@router.get("/jamb-programmes/{jamb_programme_id}/domains", response_model=ResponseModel)
async def get_jamb_programme_domains(jamb_programme_id: str):
    try:
        res = (
            _svc()
            .table("v_jamb_programme_domain_paths")
            .select("*")
            .eq("jamb_programme_id", jamb_programme_id)
            .execute()
        )
        domains = []
        for r in (res.data or []):
            # An unclassified link is not evidence of an adjacent relationship.
            # Keep the matcher fail-closed instead of silently turning missing
            # data into a user-facing false positive.
            match_type = str(r.get("match_type") or "").strip().lower()
            if match_type not in {"direct", "functional", "adjacent"}:
                continue
            domains.append(
                {
                    "domainId": r.get("domain_key"),
                    "domainName": r.get("domain_name"),
                    "cluster": r.get("cluster"),
                    "matchType": match_type,
                    "eliteFlag": bool(r.get("elite_domain")),
                }
            )
        return ResponseModel(data=_real({"jambProgrammeId": jamb_programme_id, "domains": domains}))
    except Exception as exc:  # noqa: BLE001
        log.error("student jamb domains failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Domain paths are temporarily unavailable."))


@router.post("/schools/register", response_model=ResponseModel)
async def register_school(
    payload: InstitutionRegisterIn = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    """Add a user-reported institution when the registry has no match.

    The row is intentionally unverified. It gives the next student a stable
    record to select, while admin verification and school affiliation remain
    separate workflows.
    """
    name = _clean_text(payload.name)
    institution_type = _clean_text(payload.institutionType)
    # The current product scope is universities, secondary schools and the
    # two JAMB provider types. Do not let hidden higher-institution options
    # re-enter the registry through this free-text registration endpoint.
    allowed = {"secondary_school", "tutorial_centre", "university", "jamb_cafe"}
    if len(name) < 2 or institution_type not in allowed:
        return ResponseModel(
            success=False,
            message="Enter a valid institution name and type.",
            data=None,
        )
    try:
        svc = _svc()
        existing = (
            svc.table("schools")
            .select("id, name, institution_type, address, city, state, country")
            .ilike("name", name)
            .eq("institution_type", institution_type)
            .limit(1)
            .execute()
        ).data or []
        row = existing[0] if existing else None
        created = False
        address = _clean_text(payload.address)
        if not row:
            row = (
                svc.table("schools")
                .insert({
                    "name": name,
                    "institution_type": institution_type,
                    "address": address or None,
                    "ibass_verified": False,
                })
                .execute()
            ).data[0]
            created = True
        elif address and not _clean_text(row.get("address")):
            svc.table("schools").update({"address": address}).eq("id", row.get("id")).execute()
            row["address"] = address
            clear_prefix("admission:")
            clear_prefix("student:")
        return ResponseModel(
            data=_real({
                "id": row.get("id"),
                "name": row.get("name") or name,
                "institutionType": row.get("institution_type") or institution_type,
                "address": row.get("address"),
                "created": created,
            }),
            message="Institution added to the registry." if created else "Existing institution found.",
        )
    except Exception as exc:  # noqa: BLE001
        log.error("student institution registration failed", user_id=current_user["id"], error=str(exc))
        return ResponseModel(
            success=False,
            message="We could not add that institution right now. Please try again.",
            data=None,
        )


@router.get("/schools/{school_id}/faculties", response_model=ResponseModel)
async def get_school_faculties(school_id: str):
    """Return faculty names present in the university's JAMB offerings."""
    try:
        cache_key = f"student:school-faculties:{school_id}"
        cached = get_json(cache_key)
        if isinstance(cached, list):
            return ResponseModel(data=_real(cached))
        svc = _svc()
        school_rows = (
            svc.table("school_programmes")
            .select("jamb_programme_id")
            .eq("school_id", school_id)
            .limit(1000)
            .execute()
        ).data or []
        jamb_ids = list({r.get("jamb_programme_id") for r in school_rows if r.get("jamb_programme_id")})
        if not jamb_ids:
            return ResponseModel(data=_real([]))
        rows = (
            svc.table("jamb_programmes")
            .select("jamb_faculty")
            .in_("id", jamb_ids)
            .limit(1000)
            .execute()
        ).data or []
        names = sorted({str(r.get("jamb_faculty")).strip() for r in rows if r.get("jamb_faculty") and str(r.get("jamb_faculty")).strip()})
        items = [{"name": name, "value": name} for name in names]
        set_json(cache_key, items, REFERENCE_TTL_SECONDS)
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001
        log.warning("student school faculties lookup failed", school_id=school_id, error=str(exc))
        return ResponseModel(data=_coming_soon("Faculty data is not available for this university."))


@router.get("/schools/{school_id}/programmes", response_model=ResponseModel)
async def get_school_programmes(
    school_id: str,
    q: Optional[str] = Query(None),
    faculty: Optional[str] = Query(None),
):
    """The courses a given university actually offers, by JAMB name.

    The entry point for a student who is ALREADY ENROLLED. They do not need the
    national picker — they know their university and their course, so they name
    the school and pick their course off its list. `v_school_jamb_programmes`
    covers all 778 schools (7,888 offerings).

    A second read attaches the skills profile: the offerings view carries the
    JAMB name but not `skills_technical` / `skills_transferable`, and those are
    the point of the row.
    """
    try:
        query_text = (q or "").strip().lower()
        faculty_text = (faculty or "").strip()
        cache_key = f"student:school-programmes:{school_id}:{faculty_text.lower()}:{query_text}"
        cached = get_json(cache_key)
        if isinstance(cached, list):
            return ResponseModel(data=_real(cached))
        svc = _svc()
        faculty_jamb_ids: list[str] = []
        if faculty_text:
            # The older live offerings view does not expose jamb_faculty. Resolve
            # the faculty against the source programme table, then filter the
            # offerings by programme id. This works before and after the view is
            # rebuilt with the faculty column.
            faculty_rows = (
                svc.table("jamb_programmes")
                .select("id")
                .eq("jamb_faculty", faculty_text)
                .limit(2000)
                .execute()
            ).data or []
            faculty_jamb_ids = [
                str(row.get("id"))
                for row in faculty_rows
                if row.get("id")
            ]
            if not faculty_jamb_ids:
                return ResponseModel(data=_real([]))
        query = (
            svc.table("v_school_jamb_programmes")
            .select("*")
            .eq("school_id", school_id)
        )
        if q and q.strip():
            query = query.ilike("jamb_name", f"%{q.strip()}%")
        if faculty_jamb_ids:
            query = query.in_("jamb_programme_id", faculty_jamb_ids)
        # This is the complete course list for the selected institution, not a
        # typeahead preview. Do not silently hide valid offerings behind a
        # small arbitrary cap; the q/faculty filters remain available for large
        # catalogues.
        res = query.order("jamb_name").limit(2000).execute()
        rows = res.data or []
        if not rows:
            return ResponseModel(
                data=_real([], "No course list recorded for this institution yet.")
            )

        skills_by_id: dict[str, dict] = {}
        jamb_ids = list({r["jamb_programme_id"] for r in rows if r.get("jamb_programme_id")})
        if jamb_ids:
            try:
                sk = (
                    svc.table("jamb_programmes")
                    .select("id, skills_technical, skills_transferable")
                    .in_("id", jamb_ids)
                    .execute()
                )
                skills_by_id = {r["id"]: r for r in (sk.data or [])}
            except Exception as exc:  # noqa: BLE001
                # Degrade to names only rather than failing the whole list.
                log.warning("school programme skills lookup skipped", error=str(exc))

        items = []
        for r in rows:
            sk = skills_by_id.get(r.get("jamb_programme_id")) or {}
            items.append(
                {
                    "schoolId": r.get("school_id"),
                    "schoolName": r.get("school_name"),
                    "institutionType": r.get("institution_type"),
                    "jambProgrammeId": r.get("jamb_programme_id"),
                    # The name THIS school uses. Deliberately not the CCMAS
                    # canonical name, which the view also carries.
                    "jambName": r.get("jamb_name"),
                    "studentName": _student_programme_name(r.get("jamb_name")),
                    "utmeSubjects": r.get("utme_subjects"),
                    "olevelRequirement": r.get("olevel_requirement"),
                    # Preview only — this list runs to 400 rows.
                    **_skills_out(sk, full=False),
                }
            )
        items = _attach_school_details(items)
        set_json(cache_key, items, SEARCH_TTL_SECONDS if query_text else REFERENCE_TTL_SECONDS)
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001
        log.error("student school programmes failed", error=str(exc))
        return ResponseModel(
            data=_coming_soon("This institution's course list is temporarily unavailable.")
        )


@router.get("/jamb-programmes/{jamb_programme_id}/schools", response_model=ResponseModel)
async def get_jamb_programme_schools(jamb_programme_id: str, year: Optional[int] = Query(None)):
    """Return recorded university offerings for one JAMB programme.

    Legacy admission-cycle data is deliberately not part of this student-facing
    route. Incomplete cycle data must not decide which universities appear or
    be presented as programme guidance.
    ``year`` remains accepted for URL compatibility but is intentionally ignored.
    """
    try:
        svc = _svc()
        offerings = (
            svc.table("v_school_jamb_programmes")
            .select("*")
            .eq("jamb_programme_id", jamb_programme_id)
            .order("school_name")
            .limit(2000)
            .execute()
        )
        offering_items = [
            {
                "schoolId": r.get("school_id"),
                "schoolName": r.get("school_name"),
                "institutionType": r.get("institution_type"),
                "jambProgrammeId": r.get("jamb_programme_id"),
                "jambName": r.get("jamb_name"),
                "studentName": _student_programme_name(r.get("jamb_name")),
                "programmeId": r.get("programme_id"),
                # The user-facing programme identity is the exact JAMB name
                # from this offering row. CCMAS/canonical fields remain
                # internal mapping substrate and must not replace it.
                "programmeName": r.get("jamb_name"),
            }
            for r in (offerings.data or [])
        ]
        offering_items.sort(key=lambda item: str(item.get("schoolName") or "").casefold())
        enriched = _attach_school_details(offering_items)
        return ResponseModel(data=_real(enriched, "Showing recorded university offerings and their requirements." if enriched else "No university offering is recorded for this programme yet."))
    except Exception as exc:  # noqa: BLE001
        log.error("student jamb university offerings failed", error=str(exc))
        return ResponseModel(data=_coming_soon("University offerings are temporarily unavailable."))


def _evaluate_school_subject_option(option: dict, item_rows: list[dict], selected_norm: set[str]) -> dict:
    """Evaluate one parsed university-scoped rule without changing national matching."""
    if not item_rows and option.get("condition_text"):
        # A condition-only local note (for example a waiver, exclusion, grade
        # condition, or sitting rule) is intentionally not treated as passed
        # by an empty matcher.  The exact source remains visible for manual
        # confirmation, but it cannot manufacture university eligibility.
        return {
            "passes": False,
            "matchedSubjects": [],
            "missingSubjects": [str(option.get("condition_text"))],
        }
    required = []
    grouped: dict[str, list[dict]] = {}
    group_min: dict[str, int] = {}
    group_distinct: dict[str, str] = {}
    for row in item_rows:
        catalog = row.get("subject_catalog") or {}
        name = catalog.get("name") or ""
        norm = _normalise_subject(name)
        if row.get("requirement_role") == "required":
            required.append({"name": name, "norm": norm})
        elif row.get("group_key"):
            key = str(row["group_key"])
            grouped.setdefault(key, []).append({"name": name, "norm": norm})
            group_min[key] = int(row.get("min_from_group") or 1)
            if row.get("distinct_group_key"):
                group_distinct[key] = str(row["distinct_group_key"])

    missing = [row["name"] for row in required if row["norm"] and row["norm"] not in selected_norm]
    distinct_scopes: dict[str, list[tuple[str, list[dict]]]] = {}
    for key, names in grouped.items():
        scope = group_distinct.get(key)
        if scope:
            distinct_scopes.setdefault(scope, []).append((key, names))
            continue
        count = sum(1 for row in names if row["norm"] in selected_norm)
        if count < group_min.get(key, 1):
            missing.append(
                f"{group_min.get(key, 1) - count} from: "
                + ", ".join(row["name"] for row in names if row["name"])
            )
    for scope_groups in distinct_scopes.values():
        specs = [
            (group_min.get(key, 1), {row["norm"] for row in names if row["norm"]})
            for key, names in scope_groups
        ]
        matched_distinct = _max_distinct_group_matches(specs, selected_norm)
        needed = sum(minimum for minimum, _codes in specs)
        if matched_distinct < needed:
            missing.append(
                f"{needed - matched_distinct} distinct subject(s) from: "
                + ", ".join(
                    row["name"] for _key, names in scope_groups for row in names if row["name"]
                )
            )

    minimum_required = int(option.get("min_required") or 0)
    exam_type = str(option.get("exam_type") or "")
    minimum_gap = max(0, minimum_required - len(selected_norm)) if exam_type == "olevel" else 0
    if minimum_gap:
        missing.append(f"{minimum_gap} more O-level subject(s)")
    return {
        "passes": not missing,
        "matchedSubjects": list(dict.fromkeys(
            [row["name"] for row in required if row["norm"] in selected_norm]
            + [row["name"] for names in grouped.values() for row in names if row["norm"] in selected_norm]
        )),
        "missingSubjects": list(dict.fromkeys(missing)),
    }


def _attach_school_details(
    items: list[dict],
    utme_selected: set[str] | None = None,
    olevel_selected: set[str] | None = None,
) -> list[dict]:
    """Attach address and school-scoped requirement notes to offerings.

    National JAMB requirements identify the programme first. The
    ``school_programmes`` row is then used for the selected university's own
    note or exception; it does not rewrite the national rule or downstream
    CCMAS/domain/role mapping.
    """
    school_ids = list(dict.fromkeys(str(i.get("schoolId")) for i in items if i.get("schoolId")))
    if not school_ids:
        return items
    svc = _svc()
    locations: dict[str, dict] = {}
    try:
        rows = (
            svc.table("schools")
            .select("id, address, city, state, country")
            .in_("id", school_ids)
            .execute()
        ).data or []
        locations = {str(r.get("id")): r for r in rows}
    except Exception as exc:  # noqa: BLE001
        log.debug("school location enrichment unavailable", error=str(exc))

    overrides: dict[tuple[str, str], dict] = {}
    try:
        rows = (
            svc.table("school_programmes")
            .select("id, school_id, jamb_programme_id, utme_subjects, olevel_requirement, remarks")
            .in_("school_id", school_ids)
            .execute()
        ).data or []
        overrides = {
            (str(r.get("school_id")), str(r.get("jamb_programme_id"))): r
            for r in rows
            if r.get("school_id") and r.get("jamb_programme_id")
        }
    except Exception as exc:  # noqa: BLE001
        log.debug("school-specific requirement enrichment unavailable", error=str(exc))

    local_options_by_pair: dict[tuple[str, str], list[dict]] = {}
    local_items_by_option: dict[str, list[dict]] = {}
    try:
        local_options = (
            svc.table("school_programme_subject_options")
            .select(
                "id, exception_id, school_programme_id, school_id, jamb_programme_id, "
                "exam_type, rule_scope, option_label, min_required, source_text, condition_text"
            )
            .in_("school_id", school_ids)
            .execute()
        ).data or []
        for option in local_options:
            key = (str(option.get("school_id")), str(option.get("jamb_programme_id")))
            local_options_by_pair.setdefault(key, []).append(option)
        option_ids = [row.get("id") for row in local_options if row.get("id")]
        if option_ids:
            local_items = (
                svc.table("school_programme_subject_option_items")
                .select(
                    "option_id, requirement_role, group_key, min_from_group, distinct_group_key, "
                    "subject_catalog(name, code)"
                )
                .in_("option_id", option_ids)
                .execute()
            ).data or []
            for row in local_items:
                local_items_by_option.setdefault(str(row.get("option_id")), []).append(row)
    except Exception as exc:  # noqa: BLE001
        # The raw exception table remains useful on a database that has not yet
        # received the structured local-rule migration.
        log.debug("structured university subject rules unavailable", error=str(exc))

    exceptions_by_pair: dict[tuple[str, str], list[dict]] = {}
    try:
        exception_rows = (
            svc.table("school_programme_requirement_exceptions")
            .select(
                "school_id, jamb_programme_id, exam_type, requirement_text, "
                "source_file, source_label, parse_status"
            )
            .in_("school_id", school_ids)
            .execute()
        ).data or []
        for row in exception_rows:
            key = (str(row.get("school_id")), str(row.get("jamb_programme_id")))
            exceptions_by_pair.setdefault(key, []).append(
                {
                    "examType": row.get("exam_type"),
                    "text": row.get("requirement_text"),
                    "sourceFile": row.get("source_file"),
                    "sourceLabel": row.get("source_label"),
                    "parseStatus": row.get("parse_status") or "needs_review",
                }
            )
    except Exception as exc:  # noqa: BLE001
        # Older databases may not have the evidence table yet. Keep the
        # offering usable, but do not pretend that exception evidence was read.
        log.debug("school-specific requirement evidence unavailable", error=str(exc))

    for item in items:
        sid = str(item.get("schoolId")) if item.get("schoolId") else ""
        location = locations.get(sid) or {}
        for key in ("address", "city", "state", "country"):
            if location.get(key) is not None:
                item[key] = location.get(key)
        jid = str(item.get("jambProgrammeId")) if item.get("jambProgrammeId") else ""
        override = overrides.get((sid, jid)) or {}
        item["universityUtmeSubjects"] = override.get("utme_subjects")
        item["universityOlevelRequirement"] = override.get("olevel_requirement")
        item["universityNote"] = override.get("remarks")
        # Direct Entry evidence remains stored for a future polytechnic route,
        # but is not exposed through current university/student responses.
        exception_rows = [
            row for row in exceptions_by_pair.get((sid, jid), [])
            if row.get("examType") != "direct_entry"
        ]
        local_options = [
            option for option in local_options_by_pair.get((sid, jid), [])
            if option.get("exam_type") != "direct_entry"
        ]
        item["universityRequirementExceptions"] = exception_rows
        local_status = "none"
        if any(row.get("parseStatus") == "needs_review" for row in exception_rows):
            local_status = "needs_confirmation"
        elif local_options:
            selected_by_exam = {"utme": utme_selected, "olevel": olevel_selected}
            evaluated = []
            for option in local_options:
                selected = selected_by_exam.get(str(option.get("exam_type") or ""))
                if selected is not None:
                    evaluated.append((option, _evaluate_school_subject_option(
                        option, local_items_by_option.get(str(option.get("id")), []), selected
                    )))
            if not evaluated:
                local_status = "structured"
            elif any(result[1]["passes"] and result[0].get("rule_scope") == "full" for result in evaluated):
                local_status = "eligible_local_rule"
            elif any(result[1]["passes"] for result in evaluated):
                local_status = "local_condition_met"
            elif any(option.get("rule_scope") == "full" for option, _result in evaluated):
                local_status = "local_rule_gap"
            else:
                local_status = "local_condition_gap"
        elif exception_rows:
            local_status = "structured" if any(
                row.get("parseStatus") == "parsed" for row in exception_rows
            ) else "none"
        item["universityExceptionStatus"] = local_status
        item["universityEligibilityStatus"] = local_status
        item["universityStructuredSubjectRules"] = [
            {
                "examType": option.get("exam_type"),
                "scope": option.get("rule_scope"),
                "text": option.get("source_text"),
                "minimumRequired": option.get("min_required"),
                "conditionText": option.get("condition_text"),
            }
            for option in local_options
        ]
        requirement_status, requirement_notice = _offering_requirement_status(
            utme=item.get("universityUtmeSubjects"),
            olevel=item.get("universityOlevelRequirement"),
            exceptions=exception_rows,
            local_options=local_options,
        )
        item["universityRequirementStatus"] = requirement_status
        item["universityRequirementNotice"] = requirement_notice
        item["hasUniversityException"] = bool(
            override.get("remarks")
            or override.get("utme_subjects")
            or override.get("olevel_requirement")
            or exception_rows
        )
    return items


@router.get("/programmes/by-subjects", response_model=ResponseModel)
async def programmes_by_subjects(
    subjects: str = Query(""),
    olevel_subjects: str = Query(""),
    exam_type: str = Query("combined"),
    stream: Optional[str] = Query(None),
    # The selector must return every matching programme. The UI can paginate or
    # progressively render the result list, but the API must not silently hide
    # valid matches behind the old 40/80-item cap.
    limit: int = Query(2000),
):
    global _SUBJECT_MATCH_AUTHORITY_STATE
    _SUBJECT_MATCH_AUTHORITY_STATE = "unknown"
    # FastAPI supplies a plain int during request handling, while direct
    # callers/tests see the Query object used as the default.
    match_limit = limit if isinstance(limit, int) else 2000
    exam = (exam_type or "combined").strip().lower()
    if exam not in {"utme", "olevel", "combined"}:
        return ResponseModel(
            data=_real([], "Choose UTME subjects, O-level subjects, or both before matching programmes.")
        )
    utme_selected = [_canonical_subject_name(s) for s in subjects.split(",") if s.strip()]
    olevel_selected = [_canonical_subject_name(s) for s in olevel_subjects.split(",") if s.strip()]
    if exam == "olevel" and not olevel_selected:
        olevel_selected = utme_selected
        utme_selected = []
    utme_norm = {_normalise_subject(s) for s in utme_selected}
    olevel_norm = {_normalise_subject(s) for s in olevel_selected}
    selected_norm = utme_norm | olevel_norm
    if not selected_norm:
        return ResponseModel(data=_real([]))
    if exam == "olevel" and len(olevel_norm) < 5:
        return ResponseModel(
            data=_real(
                [],
                "Choose at least five O-level subjects before checking programme fit.",
            )
        )
    if exam == "olevel" and len(olevel_norm) > MAX_EARLY_OLEVEL_SUBJECTS:
        return ResponseModel(
            data=_real(
                [],
                f"Choose no more than {MAX_EARLY_OLEVEL_SUBJECTS} O-level subjects for this check. Remove the extras before continuing.",
            )
        )
    if exam == "combined" and len(utme_norm) < 4:
        return ResponseModel(
            data=_real(
                [],
                "Choose Use of English and three other UTME subjects before matching programmes.",
            )
        )
    if exam in {"utme", "combined"} and "english language" not in utme_norm:
        return ResponseModel(
            data=_real(
                [],
                "UTME must include Use of English plus three other subjects before matching programmes.",
            )
        )
    if exam == "combined" and len(utme_norm) > MAX_UTME_SUBJECTS:
        return ResponseModel(
            data=_real([], "UTME uses exactly 4 subjects. Remove the extra subject before continuing.")
        )
    if exam == "utme" and utme_norm and len(utme_norm) < 4:
        return ResponseModel(
            data=_real(
                [],
                "Choose Use of English and three other UTME subjects before matching programmes.",
            )
        )
    if exam == "utme" and len(utme_norm) > MAX_UTME_SUBJECTS:
        return ResponseModel(
            data=_real([], "UTME uses exactly 4 subjects. Remove the extra subject before continuing.")
        )
    if exam == "combined" and len(olevel_norm) < 5:
        return ResponseModel(
            data=_real(
                [],
                "Choose at least five O-level subjects so we can check the programme requirement, not only the UTME gate.",
            )
        )
    if exam == "combined" and len(olevel_norm) > MAX_EARLY_OLEVEL_SUBJECTS:
        return ResponseModel(
            data=_real(
                [],
                f"Choose no more than {MAX_EARLY_OLEVEL_SUBJECTS} O-level subjects for this check. Remove the extras before continuing.",
            )
        )

    try:
        if exam == "olevel":
            structured = _match_structured_subject_options(
                olevel_norm,
                limit=min(match_limit, 2000),
                exam_type="olevel",
                require_full=True,
            )
        elif utme_norm and olevel_norm:
            utme_matches = _match_structured_subject_options(
                utme_norm,
                limit=min(match_limit, 2000),
                exam_type="utme",
                require_full=True,
            )
            olevel_matches = _match_structured_subject_options(
                olevel_norm,
                limit=min(match_limit, 400),
                exam_type="olevel",
                require_full=False,
            )
            olevel_by_id = {m.get("jambProgrammeId"): m for m in olevel_matches}
            structured = []
            for match in utme_matches:
                jid = match.get("jambProgrammeId")
                olevel = olevel_by_id.get(jid)
                if olevel:
                    status = "eligible" if not olevel.get("missingSubjects") else "utme_match_olevel_gap"
                    structured.append({
                        **match,
                        "olevelMatchedSubjectCount": olevel.get("matchedSubjectCount", 0),
                        "olevelMatchedSubjects": olevel.get("matchedSubjects", []),
                        "olevelMissingSubjects": olevel.get("missingSubjects", []),
                        "olevelRequirementText": olevel.get("requirementText"),
                        "eligibilityStatus": status,
                        "matchBasis": "combined",
                    })
                else:
                    structured.append({
                        **match,
                        "olevelMatchedSubjectCount": 0,
                        "olevelMatchedSubjects": [],
                        "olevelMissingSubjects": [],
                        "eligibilityStatus": "utme_match_olevel_unparsed",
                        "matchBasis": "combined",
                    })
            structured = structured[: min(match_limit, 2000)]
        else:
            structured = _match_structured_subject_options(
                utme_norm,
                limit=min(match_limit, 2000),
                exam_type="utme",
                require_full=True,
            )
        if _SUBJECT_MATCH_AUTHORITY_STATE == "unavailable":
            return ResponseModel(
                data=_coming_soon(
                    "Subject matching is unavailable because the structured subject rules are not fully deployed or are under review. You can still browse programmes by name, compare university offerings and read each university's requirements; try subject matching again after the subject data is updated."
                )
            )
        if structured:
            return ResponseModel(data=_real(_attach_school_context(structured, utme_norm, olevel_norm)))

        # A subject-match result is an eligibility-shaped surface.  Do not turn
        # a shared word in an unparsed brochure sentence into a programme match:
        # "English Language" alone must not make every five-credit programme a
        # result.  Unparsed source text remains available on programme detail,
        # where it is labelled as source text and review status.
        notice = (
            "No exact structured subject match was found. Some brochure requirements "
            "still need review and are not shown as matches here. You can browse programmes by name or compare university offerings instead."
        )
        return ResponseModel(data=_real([], notice))
    except Exception as exc:  # noqa: BLE001
        log.error("student subject programme match failed", error=str(exc))
        return ResponseModel(
            data=_coming_soon(
                "Subject matching is temporarily unavailable. You can still browse programmes by name, compare university offerings and read university requirements."
            )
        )


def _match_structured_subject_options(
    selected_norm: set[str],
    limit: int,
    exam_type: str = "utme",
    require_full: bool = True,
) -> list[dict]:
    global _SUBJECT_MATCH_AUTHORITY_STATE
    svc = _svc()
    options = (
        svc.table("programme_subject_options")
        .select("id, jamb_programme_id, requirement_id, exam_type, option_label, min_required, source_text")
        .eq("exam_type", exam_type)
        .limit(2000)
        .execute()
    )
    option_rows = options.data or []
    if not option_rows:
        _SUBJECT_MATCH_AUTHORITY_STATE = "unavailable"
        return []
    # The typed rule layer is the deployment authority for the national
    # matcher. An older database may still contain option rows from a previous
    # parser run; accepting them without the corresponding current rule record
    # can reintroduce a programme/subject mismatch. Fail closed until the two
    # generated seeds have been applied together.
    try:
        typed_rule_rows = (
            svc.table("programme_subject_rule_records")
            .select("jamb_programme_id, requirement_id, exam_type, rule_status, source_text")
            .in_("jamb_programme_id", list({row.get("jamb_programme_id") for row in option_rows if row.get("jamb_programme_id")}))
            .eq("exam_type", exam_type)
            .limit(2000)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        log.warning("typed subject rule authority unavailable; refusing national matches", error=str(exc))
        _SUBJECT_MATCH_AUTHORITY_STATE = "unavailable"
        return []
    typed_by_programme = {
        (str(row.get("jamb_programme_id")), str(row.get("exam_type"))): row
        for row in typed_rule_rows
    }
    if not typed_by_programme:
        _SUBJECT_MATCH_AUTHORITY_STATE = "unavailable"
        return []

    def source_fingerprint(value: Any) -> str:
        text = re.sub(r"\s+", " ", str(value or "")).strip()
        # The option generator records a resolved cross-reference in the
        # executable source text; the typed record retains the original source
        # sentence. Compare the shared source portion, not that annotation.
        return re.sub(r"\s+\[resolved:\s*as in [^\]]+\]\s*$", "", text, flags=re.I)

    trusted_options = []
    for option in option_rows:
        typed = typed_by_programme.get((str(option.get("jamb_programme_id")), exam_type))
        if not typed or typed.get("rule_status") not in {"matchable", "cross_reference"}:
            continue
        if str(option.get("requirement_id") or "") != str(typed.get("requirement_id") or ""):
            continue
        if source_fingerprint(option.get("source_text")) != source_fingerprint(typed.get("source_text")):
            continue
        trusted_options.append(option)
    option_rows = trusted_options
    if not option_rows:
        _SUBJECT_MATCH_AUTHORITY_STATE = "unavailable"
        return []
    # The seed is generated from the brochure parser, but old environments may
    # still contain an option row whose item list predates a parser correction.
    # Keep the matcher safe in that state by comparing each option's source text
    # with the canonical subject catalogue.  An explicitly named subject that
    # is absent from the option items means the option is incomplete and cannot
    # be treated as an exact match.
    try:
        catalog_rows = (
            svc.table("subject_catalog")
            .select("name, code")
            .limit(300)
            .execute()
        ).data or []
    except Exception as exc:  # noqa: BLE001
        # An unavailable catalogue must make the option review stricter,
        # never broader. The generated SQL remains the primary source.
        log.warning("subject option completeness check unavailable", error=str(exc))
        _SUBJECT_MATCH_AUTHORITY_STATE = "unavailable"
        return []
    if not catalog_rows:
        _SUBJECT_MATCH_AUTHORITY_STATE = "unavailable"
        return []
    _SUBJECT_MATCH_AUTHORITY_STATE = "ready"
    catalog_subjects = [
        {
            "name": row.get("name") or "",
            "norm": _normalise_subject(row.get("name") or ""),
        }
        for row in catalog_rows
        if _normalise_subject(row.get("name") or "")
    ]
    option_ids = [r["id"] for r in option_rows]
    item_rows = (
        svc.table("programme_subject_option_items")
        .select("option_id, requirement_role, group_key, min_from_group, distinct_group_key, subject_catalog(name, code)")
        .in_("option_id", option_ids[:2000])
        .execute()
    ).data or []
    by_option: dict[str, list[dict]] = {}
    for item in item_rows:
        by_option.setdefault(item["option_id"], []).append(item)

    scored: dict[str, dict] = {}
    for opt in option_rows:
        items = by_option.get(opt["id"], [])
        if not items:
            continue
        required = [
            {
                "name": (i.get("subject_catalog") or {}).get("name") or "",
                "norm": _normalise_subject((i.get("subject_catalog") or {}).get("name") or ""),
            }
            for i in items
            if i.get("requirement_role") == "required"
        ]
        required = [s for s in required if s["norm"]]
        item_subject_norms = {
            _normalise_subject((i.get("subject_catalog") or {}).get("name") or "")
            for i in items
        }
        source_for_subjects = re.split(
            r"\s+(?:for|in)\s+(?:nbc|ntc|nabteb|tc\s*ii|technic(?:al)?\s+certificate)\s+"
            r"(?:holders?|candidates?)?\b",
            str(opt.get("source_text") or ""),
            maxsplit=1,
            flags=re.I,
        )[0]
        source_norm = _normalise_subject(source_for_subjects)
        source_subjects = [
            subject
            for subject in catalog_subjects
            if subject["norm"]
            and re.search(rf"(?<![a-z0-9]){re.escape(subject['norm'])}(?![a-z0-9])", source_norm)
        ]
        # Prefer the longest catalogue names when a catalogue contains both a
        # short label and its expanded form.  This keeps the evidence list
        # stable without changing the actual matching rules.
        source_subjects = [
            subject
            for subject in source_subjects
            if not any(
                other["norm"] != subject["norm"]
                and subject["norm"] in other["norm"]
                for other in source_subjects
            )
        ]
        unrepresented_source_subjects = [
            subject["name"]
            for subject in source_subjects
            if subject["norm"] not in item_subject_norms
        ]
        if unrepresented_source_subjects:
            continue
        missing_required = [s["name"] for s in required if s["norm"] not in selected_norm]
        min_required = int(opt.get("min_required") or 0)
        # UTME options describe the named JAMB combination itself (the UI also
        # gates the student's four-subject selection, including English). O-level
        # options additionally carry the total credit-pass minimum, so that
        # minimum must be enforced here rather than inferred from named items.
        minimum_gap = max(0, min_required - len(selected_norm)) if exam_type == "olevel" else 0
        if require_full and (missing_required or minimum_gap):
            continue
        grouped: dict[str, list[dict]] = {}
        group_min: dict[str, int] = {}
        group_distinct: dict[str, str] = {}
        for i in items:
            if i.get("requirement_role") != "one_of" or not i.get("group_key"):
                continue
            key = i["group_key"]
            name = (i.get("subject_catalog") or {}).get("name") or ""
            grouped.setdefault(key, []).append({
                "name": name,
                "norm": _normalise_subject(name),
            })
            group_min[key] = int(i.get("min_from_group") or 1)
            if i.get("distinct_group_key"):
                group_distinct[key] = str(i["distinct_group_key"])

        # A generic brochure sentence such as "five credits including English
        # and Mathematics" is not enough evidence to decide which three other
        # O-level subjects are relevant. Older generated seeds represented that
        # missing scope as a one-of group containing almost the whole subject
        # catalogue, which made combinations such as Agriculture + Animal
        # Husbandry + Arabic appear as exact Social Work/Library Science
        # matches. Keep the offering visible in programme search, but fail
        # closed for eligibility matching until the source supplies the actual
        # subject scope.
        broad_group = any(len(names) >= 20 for names in grouped.values())
        source_lower = str(opt.get("source_text") or "").lower()
        # A national rule can be followed by a separate NBC/NTC/TC-II
        # condition. The condition may use "relevant subjects" even when the
        # ordinary applicant rule explicitly says "any other subject". Scope
        # the fail-closed guard to the ordinary rule, matching the parser.
        source_scope_text = re.split(
            r"\s+(?:for|in)\s+(?:nbc|ntc|nabteb|tc\s*ii|technic(?:al)?\s+certificate)\s+"
            r"(?:holders?|candidates?)?\b",
            source_lower,
            maxsplit=1,
            flags=re.I,
        )[0]
        # A broad catalogue group is safe only when the source explicitly
        # permits any remaining subject. Words such as “relevant”, “suitable”
        # or “appropriate” are an unresolved subject scope: the parser cannot
        # know which subjects are relevant to that programme. Treating the
        # whole catalogue as executable creates false positives (for example
        # Arabic + Agriculture + Animal Husbandry appearing to qualify for an
        # unrelated programme). Keep those rows available to name/university
        # search and require source review before eligibility matching.
        unresolved_scope = re.search(
            r"\b(?:relevant|suitable|appropriate|related|cognate|pertinent)\b|"
            r"\bshares?\s+(?:the\s+)?block\b",
            source_scope_text,
        )
        generic_olevel_scope = exam_type == "olevel" and broad_group and bool(unresolved_scope)
        if generic_olevel_scope:
            continue
        # A stale or hand-edited SQL seed can retain only the named items while
        # leaving the option's credit/combination minimum unchanged. Such a row
        # is not an exact rule and must never match in either full or partial
        # mode. Use one minimum per group, not one per item row.
        represented_capacity = len(required) + sum(group_min.values())
        if min_required and represented_capacity < min_required:
            continue
        failed_group = False
        missing_groups: list[str] = []
        distinct_scopes: dict[str, list[tuple[str, list[dict]]]] = {}
        for key, names in grouped.items():
            scope = group_distinct.get(key)
            if scope:
                distinct_scopes.setdefault(scope, []).append((key, names))
                continue
            count = len([n for n in names if n["norm"] in selected_norm])
            if count < group_min.get(key, 1):
                needed = group_min.get(key, 1) - count
                options_text = ", ".join(n["name"] for n in names if n["name"])
                missing_groups.append(f"{needed} from: {options_text}")
                if require_full:
                    failed_group = True
                    break
        if not failed_group:
            for scope_groups in distinct_scopes.values():
                specs = [
                    (
                        group_min.get(key, 1),
                        {n["norm"] for n in names if n["norm"]},
                    )
                    for key, names in scope_groups
                ]
                count = _max_distinct_group_matches(specs, selected_norm)
                needed_total = sum(minimum for minimum, _codes in specs)
                if count < needed_total:
                    needed = needed_total - count
                    options_text = ", ".join(
                        n["name"]
                        for _key, names in scope_groups
                        for n in names
                        if n["name"]
                    )
                    missing_groups.append(f"{needed} distinct subject{'s' if needed != 1 else ''} from: {options_text}")
                    if require_full:
                        failed_group = True
                        break
        if failed_group:
            continue
        # Matched = the option's required subjects the student actually selected
        # (normalized names, mirroring _match_text_requirements' `hits`),
        # plus the selected subjects that satisfied each one_of group.
        matched_subjects = [s["name"] for s in required if s["norm"] in selected_norm]
        matched_subjects.extend(
            subject["name"]
            for subject in source_subjects
            if subject["norm"] in selected_norm
        )
        for names in grouped.values():
            matched_subjects.extend(n["name"] for n in names if n["norm"] in selected_norm)
        matched_subjects = list(dict.fromkeys(matched_subjects))
        matched_count = len(matched_subjects)
        missing_subjects = list(dict.fromkeys([*missing_required, *missing_groups]))
        missing_subjects.extend(
            subject
            for subject in unrepresented_source_subjects
            if _normalise_subject(subject) not in selected_norm
        )
        if minimum_gap:
            missing_subjects.append(
                f"{minimum_gap} more {exam_type.upper()} subject{'s' if minimum_gap != 1 else ''}"
            )
        if not require_full and matched_count == 0:
            continue
        entry = scored.get(opt["jamb_programme_id"])
        if not entry or matched_count > entry["matchedSubjectCount"]:
            scored[opt["jamb_programme_id"]] = {
                "jambProgrammeId": opt["jamb_programme_id"],
                "matchedSubjectCount": matched_count,
                "matchedSubjects": matched_subjects,
                "missingSubjects": missing_subjects,
                "minimumRequired": min_required,
                "minimumGap": minimum_gap,
                "requirementText": opt.get("source_text"),
                "matchBasis": exam_type,
            }

    if not scored:
        return []
    details = _jamb_details_for_ids(list(scored.keys()))
    out = []
    for jid, score in scored.items():
        detail = details.get(jid, {})
        out.append({**score, **detail})
    out.sort(key=lambda x: (-int(x.get("matchedSubjectCount") or 0), x.get("jambName") or ""))
    return out[:limit]


def _max_distinct_group_matches(
    groups: list[tuple[int, set[str]]],
    selected_norm: set[str],
) -> int:
    """Maximum distinct subject assignment across related one-of groups.

    A brochure can require, for example, two subjects from a broad category
    and one additional subject from a narrower category.  Counting each group
    independently lets one selected subject satisfy both groups.  This small
    bipartite matching calculation keeps the groups exact while remaining
    cheap for the subject picker.
    """
    slots: list[set[str]] = []
    for minimum, codes in groups:
        candidates = set(codes) & selected_norm
        slots.extend([candidates] * max(0, int(minimum)))
    matched: dict[str, int] = {}

    def augment(slot_index: int, visited: set[str]) -> bool:
        for subject in slots[slot_index]:
            if subject in visited:
                continue
            visited.add(subject)
            previous = matched.get(subject)
            if previous is None or augment(previous, visited):
                matched[subject] = slot_index
                return True
        return False

    total = 0
    for slot_index in range(len(slots)):
        if augment(slot_index, set()):
            total += 1
    return total


def _match_text_requirements(
    selected_norm: set[str],
    limit: int,
    exam_type: str = "combined",
) -> list[dict]:
    svc = _svc()
    rows = (
        svc.table("programme_subject_requirements")
        .select("jamb_programme_id, utme_subjects, olevel_requirement")
        .limit(2000)
        .execute()
    ).data or []
    scored: dict[str, dict] = {}
    for row in rows:
        if exam_type == "utme":
            text = row.get("utme_subjects") or ""
        elif exam_type == "olevel":
            text = row.get("olevel_requirement") or ""
        else:
            text = f"{row.get('utme_subjects') or ''} {row.get('olevel_requirement') or ''}"
        norm_text = _normalise_subject(text)
        hits = [s for s in selected_norm if s and s in norm_text]
        if not hits:
            continue
        jid = row.get("jamb_programme_id")
        if not jid:
            continue
        current = scored.get(jid)
        if not current or len(hits) > current["matchedSubjectCount"]:
            scored[jid] = {
                "jambProgrammeId": jid,
                "matchedSubjectCount": len(hits),
                "matchedSubjects": hits,
                "requirementText": row.get("utme_subjects") or row.get("olevel_requirement"),
                "matchBasis": "text",
            }
    details = _jamb_details_for_ids(list(scored.keys()))
    out = [{**score, **details.get(jid, {})} for jid, score in scored.items()]
    out.sort(key=lambda x: (-int(x.get("matchedSubjectCount") or 0), x.get("jambName") or ""))
    return out[:limit]


def _jamb_details_for_ids(ids: list[str]) -> dict[str, dict]:
    if not ids:
        return {}
    rows = (
        _svc()
        .table("v_jamb_programme_details")
        .select("*")
        .in_("jamb_programme_id", ids)
        .execute()
    ).data or []
    return {r["jamb_programme_id"]: _jamb_detail_out(r) for r in rows}


def _attach_school_context(
    items: list[dict],
    utme_selected: set[str] | None = None,
    olevel_selected: set[str] | None = None,
) -> list[dict]:
    """Attach every university offering to subject-match rows.

    Subject matching produces one national JAMB-programme result per
    jamb_programme_id. That is not a university admission decision, but hiding
    the offering list until after a programme is opened makes the result
    difficult to evaluate. Return the universities attached to that exact
    identity; the frontend may preview them, while the user still picks a
    specific university before guidance is finalized.
    """
    ids = [item.get("jambProgrammeId") for item in items if item.get("jambProgrammeId")]
    if not ids:
        return items
    try:
        svc = _svc()
        # A broad subject selection can match many programmes. Query small
        # programme-ID batches so the database row limit cannot truncate the
        # university offerings for the tail of the result set.
        rows: list[dict] = []
        unique_ids = list(dict.fromkeys(ids))
        for start in range(0, len(unique_ids), 5):
            rows.extend(
                (
                    svc.table("v_school_jamb_programmes")
                    .select("school_id, school_name, institution_type, jamb_programme_id, jamb_name")
                    .in_("jamb_programme_id", unique_ids[start : start + 5])
                    .limit(2000)
                    .execute()
                ).data
                or []
            )
        school_detail_rows = _attach_school_details([
            {
                "schoolId": row.get("school_id"),
                "schoolName": row.get("school_name"),
                "institutionType": row.get("institution_type"),
                "jambProgrammeId": row.get("jamb_programme_id"),
                "jambName": row.get("jamb_name"),
            }
            for row in rows
        ], utme_selected, olevel_selected)
        school_details = {
            (str(row.get("schoolId")), str(row.get("jambProgrammeId"))): row
            for row in school_detail_rows
        }
        school_ids = list({row.get("school_id") for row in rows if row.get("school_id")})
        locations: dict[str, dict] = {}
        if school_ids:
            try:
                location_rows = (
                    svc.table("schools")
                    .select("id, address, city, state, country")
                    .in_("id", school_ids)
                    .execute()
                ).data or []
                locations = {str(row.get("id")): row for row in location_rows}
            except Exception as location_exc:  # noqa: BLE001
                log.debug("subject match school address enrichment unavailable", error=str(location_exc))
        by_jamb: dict[str, list[dict]] = {}
        for row in rows:
            jid = row.get("jamb_programme_id")
            school_name = (row.get("school_name") or "").strip()
            if not jid or not school_name:
                continue
            location = locations.get(str(row.get("school_id"))) or {}
            offering = {
                "schoolId": row.get("school_id"),
                "schoolName": school_name,
                "institutionType": row.get("institution_type"),
                "programmeName": row.get("jamb_name") or "",
                "studentName": _student_programme_name(row.get("jamb_name")) or row.get("jamb_name"),
                "address": location.get("address"),
                "city": location.get("city"),
                "state": location.get("state"),
                "country": location.get("country"),
            }
            school_detail = school_details.get((str(row.get("school_id")), str(jid))) or {}
            offering.update({
                "universityUtmeSubjects": school_detail.get("universityUtmeSubjects"),
                "universityOlevelRequirement": school_detail.get("universityOlevelRequirement"),
                "universityNote": school_detail.get("universityNote"),
                "hasUniversityException": school_detail.get("hasUniversityException", False),
                "universityExceptionStatus": school_detail.get("universityExceptionStatus", "none"),
                "universityEligibilityStatus": school_detail.get("universityEligibilityStatus", "none"),
                "universityRequirementStatus": school_detail.get("universityRequirementStatus", "source_missing"),
                "universityRequirementNotice": school_detail.get("universityRequirementNotice"),
                "universityRequirementExceptions": school_detail.get("universityRequirementExceptions", []),
                "universityStructuredSubjectRules": school_detail.get("universityStructuredSubjectRules", []),
            })
            existing = by_jamb.setdefault(jid, [])
            if offering not in existing:
                existing.append(offering)
        for item in items:
            offerings = by_jamb.get(item.get("jambProgrammeId"), [])
            # Keep all offerings in the payload. The frontend may render a
            # short preview, but the API must not make the remaining
            # universities undiscoverable.
            item["schoolOfferings"] = offerings
            item["schoolNames"] = list(dict.fromkeys(row["schoolName"] for row in offerings))[:3]
            item["schoolCount"] = len(offerings)
        return items
    except Exception as exc:  # noqa: BLE001
        log.debug("subject match university context unavailable", error=str(exc))
        return items


class SchoolCodeIn(BaseModel):
    code: str


@router.post("/affiliations/school-code", response_model=ResponseModel)
async def affiliate_with_school_code(
    payload: SchoolCodeIn = Body(...),
    current_user: dict = Depends(Auth.get_current_user),
):
    code = payload.code.strip().upper().replace(" ", "")
    if not code:
        return ResponseModel(success=False, message="School code is required.", data=None)
    try:
        svc = _svc()
        school = (
            svc.table("schools")
            .select("id, name, institution_type, provider_session_only")
            .eq("school_code", code)
            .limit(1)
            .execute()
        )
        if not school.data:
            return ResponseModel(success=False, message="Invalid or inactive school code.", data=None)
        s = school.data[0]
        existing = (
            svc.table("student_affiliations")
            .select("*")
            .eq("student_id", current_user["id"])
            .eq("school_id", s["id"])
            .limit(1)
            .execute()
        )
        if existing.data:
            row = existing.data[0]
        else:
            row = (
                svc.table("student_affiliations")
                .insert({
                    "student_id": current_user["id"],
                    "school_id": s["id"],
                    "source": "school_code",
                    "self_reported": False,
                })
                .execute()
            ).data[0]
        return ResponseModel(data=_real({
            "id": row.get("id"),
            "schoolId": s["id"],
            "schoolName": s.get("name"),
            "institutionType": s.get("institution_type"),
            "providerSessionOnly": bool(s.get("provider_session_only")),
            "verificationLevel": "code_verified",
        }))
    except Exception as exc:  # noqa: BLE001
        log.error("student school-code affiliate failed", error=str(exc))
        return ResponseModel(success=False, message="Could not affiliate with that school.", data=None)


@router.get("/affiliations/me", response_model=ResponseModel)
async def my_affiliations(current_user: dict = Depends(Auth.get_current_user)):
    try:
        rows = (
            _svc()
            .table("student_affiliations")
            .select("id, source, self_reported, created_at, schools(id, name, institution_type, provider_session_only)")
            .eq("student_id", current_user["id"])
            .execute()
        ).data or []
        out = []
        for row in rows:
            school = row.get("schools") or {}
            out.append({
                "id": row.get("id"),
                "schoolId": school.get("id"),
                "schoolName": school.get("name"),
                "institutionType": school.get("institution_type"),
                "providerSessionOnly": bool(school.get("provider_session_only")),
                "source": row.get("source"),
                "verificationLevel": "self_reported" if row.get("self_reported") else "code_verified",
                "createdAt": row.get("created_at"),
            })
        return ResponseModel(data=_real(out))
    except Exception as exc:  # noqa: BLE001
        log.error("student affiliations list failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Affiliations are temporarily unavailable."))
