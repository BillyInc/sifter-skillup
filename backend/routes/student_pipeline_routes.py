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

from fastapi import APIRouter, Body, Depends, Query
from pydantic import BaseModel, Field

from auth import Auth
from database import db
from logger import log
from models import ResponseModel
from reference_cache import REFERENCE_TTL_SECONDS, SEARCH_TTL_SECONDS, clear_prefix, get_json, set_json

router = APIRouter(prefix="/api/student", tags=["student-pipeline"])

_SCHEMA = "skillup_dev"
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
        "math": "Mathematics",
        "maths": "Mathematics",
        "financial accounting": "Principles of Accounts",
        "accounting": "Principles of Accounts",
        "accounting/financial accounting": "Principles of Accounts",
        "book keeping": "Principles of Accounts",
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


class InstitutionRegisterIn(BaseModel):
    name: str
    institutionType: str


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
        if stream:
            # Containment filters can vary by PostgREST version. If unsupported,
            # the catch path falls back to a general subject list.
            query = query.contains("stream_tags", [stream.strip().lower()])
        if exam_type:
            query = query.contains("exam_types", [exam_type.strip().lower()])
        res = query.order("name").limit(80).execute()
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
        set_json(cache_key, items, REFERENCE_TTL_SECONDS)
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001
        log.warning("student subjects: list failed", error=str(exc))
        default = [
            "English Language", "Mathematics", "Biology", "Chemistry",
            "Physics", "Economics", "Government", "Literature in English",
            "Geography", "Commerce", "Accounting/Financial Accounting",
            "Further Mathematics", "Computer Studies",
        ]
        return ResponseModel(data=_fallback(
            [{"id": s, "code": None, "name": s, "aliases": [], "category": None, "streamTags": []} for s in default],
            "Subject catalog is not seeded yet; showing the default picker list.",
        ))


@router.get("/jamb-programmes", response_model=ResponseModel)
async def search_jamb_programmes(q: Optional[str] = Query(None), limit: int = Query(30)):
    try:
        svc = _svc()
        cache_key = (q or "").strip().lower()
        cache_key = f"student:jamb-programmes:{cache_key}:{min(limit, 80)}"
        cached = get_json(cache_key)
        if isinstance(cached, list):
            return ResponseModel(data=_real(cached[: min(limit, 80)]))
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
        items = [_jamb_detail_out(r) for r in (res.data or [])]
        # Keep the JAMB programme identity separate from school-specific
        # offerings, but expose enough context in typeahead to explain why a
        # search such as "Nursing" can lead to different names by university.
        try:
            jamb_ids = [item["jambProgrammeId"] for item in items if item.get("jambProgrammeId")]
            offering_rows = (
                svc.table("v_school_jamb_programmes")
                .select("jamb_programme_id, school_name")
                .in_("jamb_programme_id", jamb_ids)
                .limit(2000)
                .execute()
            ).data or []
            schools_by_jamb: dict[str, list[str]] = {}
            for row in offering_rows:
                jid = row.get("jamb_programme_id")
                school = (row.get("school_name") or "").strip()
                if jid and school and school not in schools_by_jamb.setdefault(jid, []):
                    schools_by_jamb[jid].append(school)
            for item in items:
                names = schools_by_jamb.get(item.get("jambProgrammeId"), [])
                item["schoolNames"] = names[:3]
                item["schoolCount"] = len(names)
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
                .select("utme_subjects, olevel_requirement, direct_entry, parse_status")
                .eq("jamb_programme_id", jamb_programme_id)
                .limit(1)
                .execute()
            )
            if req.data:
                r = req.data[0]
                out["requirements"] = {
                    "utmeSubjects": r.get("utme_subjects"),
                    "olevelRequirement": r.get("olevel_requirement"),
                    "directEntry": r.get("direct_entry"),
                    "parseStatus": r.get("parse_status"),
                    "variesByInstitution": r.get("parse_status") == "needs_review",
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
        domains = [
            {
                "domainId": r.get("domain_key"),
                "domainName": r.get("domain_name"),
                "cluster": r.get("cluster"),
                "matchType": r.get("match_type") or "adjacent",
                "eliteFlag": bool(r.get("elite_domain")),
            }
            for r in (res.data or [])
        ]
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
    allowed = {"secondary_school", "tutorial_centre", "university", "polytechnic"}
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
            .select("id, name, institution_type")
            .ilike("name", name)
            .eq("institution_type", institution_type)
            .limit(1)
            .execute()
        ).data or []
        row = existing[0] if existing else None
        created = False
        if not row:
            row = (
                svc.table("schools")
                .insert({"name": name, "institution_type": institution_type, "ibass_verified": False})
                .execute()
            ).data[0]
            created = True
            clear_prefix("admission:")
            clear_prefix("student:")
        return ResponseModel(
            data=_real({
                "id": row.get("id"),
                "name": row.get("name") or name,
                "institutionType": row.get("institution_type") or institution_type,
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
async def get_school_programmes(school_id: str, q: Optional[str] = Query(None)):
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
        cache_key = f"student:school-programmes:{school_id}:{query_text}"
        cached = get_json(cache_key)
        if isinstance(cached, list):
            return ResponseModel(data=_real(cached))
        svc = _svc()
        query = (
            svc.table("v_school_jamb_programmes")
            .select("*")
            .eq("school_id", school_id)
        )
        if q and q.strip():
            query = query.ilike("jamb_name", f"%{q.strip()}%")
        res = query.order("jamb_name").limit(400).execute()
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
                    "utmeSubjects": r.get("utme_subjects"),
                    "olevelRequirement": r.get("olevel_requirement"),
                    "directEntry": r.get("direct_entry"),
                    # Preview only — this list runs to 400 rows.
                    **_skills_out(sk, full=False),
                }
            )
        set_json(cache_key, items, SEARCH_TTL_SECONDS if query_text else REFERENCE_TTL_SECONDS)
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001
        log.error("student school programmes failed", error=str(exc))
        return ResponseModel(
            data=_coming_soon("This institution's course list is temporarily unavailable.")
        )


@router.get("/jamb-programmes/{jamb_programme_id}/schools", response_model=ResponseModel)
async def get_jamb_programme_schools(jamb_programme_id: str, year: Optional[int] = Query(None)):
    try:
        svc = _svc()
        target_year = year
        if not target_year:
            snap = (
                svc.table("admission_snapshot_version")
                .select("year")
                .eq("is_active", True)
                .limit(1)
                .execute()
            )
            if snap.data:
                target_year = int(snap.data[0]["year"])
        query = (
            svc.table("v_cutoffs_by_jamb_programme")
            .select("*")
            .eq("jamb_programme_id", jamb_programme_id)
        )
        if target_year:
            query = query.eq("year", target_year)
        res = query.order("school_name").limit(200).execute()
        # NOTE: per-school requirement columns on v_school_jamb_programmes
        # (utme_subjects / olevel_requirement / direct_entry) are 100% NULL —
        # programme-level requirements live in programme_subject_requirements
        # and are served by GET /jamb-programmes/{id}. No schoolRequirements
        # block is attached here.
        items = [_cutoff_out(r) for r in (res.data or [])]
        if not items:
            offerings = (
                svc.table("v_school_jamb_programmes")
                .select("*")
                .eq("jamb_programme_id", jamb_programme_id)
                .order("school_name")
                .limit(200)
                .execute()
            )
            items = [
                {
                    "schoolId": r.get("school_id"),
                    "schoolName": r.get("school_name"),
                    "institutionType": r.get("institution_type"),
                    "jambProgrammeId": r.get("jamb_programme_id"),
                    "jambName": r.get("jamb_name"),
                    "programmeId": r.get("programme_id"),
                    "programmeName": r.get("canonical_programme_name"),
                    "year": target_year,
                    "aggregateCutoff": None,
                    "jambCutoff": None,
                    "form": None,
                    "sourceUrl": None,
                }
                for r in (offerings.data or [])
            ]
            return ResponseModel(data=_fallback(items, "No admission rows found yet; showing schools offering the programme."))
        return ResponseModel(data=_real(items))
    except Exception as exc:  # noqa: BLE001
        log.error("student jamb schools failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Schools and admission rows are temporarily unavailable."))


def _cutoff_out(r: dict) -> dict:
    return {
        "id": r.get("id"),
        "schoolId": r.get("school_id"),
        "schoolName": r.get("school_name"),
        "institutionType": r.get("institution_type"),
        "jambProgrammeId": r.get("jamb_programme_id"),
        "jambName": r.get("jamb_name"),
        "programmeId": r.get("programme_id"),
        "programmeName": r.get("canonical_programme_name"),
        "year": r.get("year"),
        "aggregateCutoff": None,
        "jambCutoff": None,
        "form": r.get("form"),
        "sourceUrl": r.get("source_url"),
        "verifiedAt": r.get("verified_at"),
        "dataDate": r.get("created_at"),
    }


@router.get("/programmes/by-subjects", response_model=ResponseModel)
async def programmes_by_subjects(
    subjects: str = Query(""),
    olevel_subjects: str = Query(""),
    exam_type: str = Query("combined"),
    stream: Optional[str] = Query(None),
    limit: int = Query(40),
):
    exam = (exam_type or "combined").strip().lower()
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
    if exam != "olevel" and utme_norm and len(utme_norm) < 4:
        return ResponseModel(
            data=_real(
                [],
                "Choose Use of English and three other UTME subjects before matching programmes.",
            )
        )

    try:
        if exam == "olevel":
            structured = _match_structured_subject_options(
                olevel_norm,
                limit=min(limit, 80),
                exam_type="olevel",
                require_full=True,
            )
        elif utme_norm and olevel_norm:
            utme_matches = _match_structured_subject_options(
                utme_norm,
                limit=200,
                exam_type="utme",
                require_full=True,
            )
            olevel_matches = _match_structured_subject_options(
                olevel_norm,
                limit=400,
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
            structured = structured[: min(limit, 80)]
        else:
            structured = _match_structured_subject_options(
                utme_norm,
                limit=min(limit, 80),
                exam_type="utme",
                require_full=True,
            )
        if structured:
            return ResponseModel(data=_real(structured))
        fallback = _match_text_requirements(selected_norm, limit=min(limit, 80))
        notice = "Some requirements need review, so these are possible matches from the published requirement text. Confirm the programme details before deciding."
        return ResponseModel(data=_fallback(fallback, notice))
    except Exception as exc:  # noqa: BLE001
        log.error("student subject programme match failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Subject-to-programme matching is temporarily unavailable."))


def _match_structured_subject_options(
    selected_norm: set[str],
    limit: int,
    exam_type: str = "utme",
    require_full: bool = True,
) -> list[dict]:
    svc = _svc()
    options = (
        svc.table("programme_subject_options")
        .select("id, jamb_programme_id, exam_type, option_label, min_required, source_text")
        .eq("exam_type", exam_type)
        .limit(2000)
        .execute()
    )
    option_rows = options.data or []
    if not option_rows:
        return []
    option_ids = [r["id"] for r in option_rows]
    item_rows = (
        svc.table("programme_subject_option_items")
        .select("option_id, requirement_role, group_key, min_from_group, subject_catalog(name, code)")
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
        missing_required = [s["name"] for s in required if s["norm"] not in selected_norm]
        if require_full and missing_required:
            continue
        grouped: dict[str, list[dict]] = {}
        group_min: dict[str, int] = {}
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
        failed_group = False
        missing_groups: list[str] = []
        for key, names in grouped.items():
            count = len([n for n in names if n["norm"] in selected_norm])
            if count < group_min.get(key, 1):
                needed = group_min.get(key, 1) - count
                options_text = ", ".join(n["name"] for n in names if n["name"])
                missing_groups.append(f"{needed} from: {options_text}")
                if require_full:
                    failed_group = True
                    break
        if failed_group:
            continue
        # Matched = the option's required subjects the student actually selected
        # (normalized names, mirroring _match_text_requirements' `hits`),
        # plus the selected subjects that satisfied each one_of group.
        matched_subjects = [s["name"] for s in required if s["norm"] in selected_norm]
        for names in grouped.values():
            matched_subjects.extend(n["name"] for n in names if n["norm"] in selected_norm)
        matched_subjects = list(dict.fromkeys(matched_subjects))
        matched_count = len(matched_subjects)
        missing_subjects = list(dict.fromkeys([*missing_required, *missing_groups]))
        if not require_full and matched_count == 0:
            continue
        entry = scored.get(opt["jamb_programme_id"])
        if not entry or matched_count > entry["matchedSubjectCount"]:
            scored[opt["jamb_programme_id"]] = {
                "jambProgrammeId": opt["jamb_programme_id"],
                "matchedSubjectCount": matched_count,
                "matchedSubjects": matched_subjects,
                "missingSubjects": missing_subjects,
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


def _match_text_requirements(selected_norm: set[str], limit: int) -> list[dict]:
    svc = _svc()
    rows = (
        svc.table("programme_subject_requirements")
        .select("jamb_programme_id, utme_subjects, olevel_requirement")
        .limit(2000)
        .execute()
    ).data or []
    scored: dict[str, dict] = {}
    for row in rows:
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
