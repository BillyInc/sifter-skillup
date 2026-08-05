# ============================================================
# Sifter LevelUp — Admission Intelligence Routes (Phase 8)
# Read-only public endpoints for SS → University admission data
# ============================================================

from typing import Any, List, Optional, Literal
from datetime import date

from fastapi import APIRouter, Query

from database import db
from logger import log
from models import ResponseModel, JambFloorOut, ProgrammeSchoolCutoffOut, SchoolAggregateFormulaOut, CourseCompetitivenessOut, AdmissionSnapshotVersionOut, AdmissionInsightOut

_SCHEMA = "skillup_dev"
router = APIRouter(prefix="/api/admission", tags=["admission"])


def _coming_soon(notice: Optional[str] = None) -> dict:
    return {"status": "coming_soon", "data": None, "meta": ({"notice": notice} if notice else None)}


def _fallback(data: Any, notice: str, data_date: str, sources: List[str] = None) -> dict:
    return {
        "status": "fallback",
        "data": data,
        "meta": {"notice": notice, "dataDate": data_date, "sources": sources or [], "verification": "inferred"},
    }


def _real(data: Any, notice: Optional[str] = None, data_date: Optional[str] = None, sources: List[str] = None) -> dict:
    return {
        "status": "real",
        "data": data,
        "meta": {"notice": notice, "dataDate": data_date, "sources": sources or [], "verification": "verified"} if (notice or data_date or sources) else None,
    }


def _active_snapshot_year(svc) -> Optional[int]:
    """Get the active snapshot year, or latest available year."""
    res = svc.table("admission_snapshot_version").select("year, is_active").order("year", desc=True).limit(1).execute()
    if res.data:
        return res.data[0]["year"]
    # Fallback: check if any cutoffs exist
    res = svc.table("programme_school_cutoff").select("year").order("year", desc=True).limit(1).execute()
    if res.data:
        return res.data[0]["year"]
    return None


# ── 1. Active Snapshot ────────────────────────────────────────

@router.get("/snapshot", response_model=ResponseModel)
async def get_active_snapshot():
    """Current active admission snapshot version."""
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        res = svc.table("admission_snapshot_version").select("*").eq("is_active", True).limit(1).execute()
        if not res.data:
            # No active snapshot — check if any exists
            any_res = svc.table("admission_snapshot_version").select("*").order("year", desc=True).limit(1).execute()
            if any_res.data:
                return ResponseModel(data=_fallback(
                    AdmissionSnapshotVersionOut(**any_res.data[0]).model_dump(),
                    notice="No active snapshot set. Showing latest available.",
                    data_date=any_res.data[0]["compiled_at"],
                ))
            return ResponseModel(data=_coming_soon("Admission data not yet compiled for any year."))
        return ResponseModel(data=_real(AdmissionSnapshotVersionOut(**res.data[0]).model_dump()))
    except Exception as exc:
        log.error("admission get_snapshot failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Snapshot temporarily unavailable."))


@router.get("/snapshot/history", response_model=ResponseModel)
async def get_snapshot_history():
    """All admission snapshot versions (for admin/history view)."""
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        res = svc.table("admission_snapshot_version").select("*").order("year", desc=True).execute()
        return ResponseModel(data=_real([AdmissionSnapshotVersionOut(**r).model_dump() for r in (res.data or [])]))
    except Exception as exc:
        log.error("admission snapshot_history failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Snapshot history unavailable."))


# ── 2. National JAMB Floor ────────────────────────────────────

@router.get("/floor", response_model=ResponseModel)
async def get_jamb_floor(year: Optional[int] = Query(None)):
    """National JAMB minimum floor score (university)."""
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        target_year = year or _active_snapshot_year(svc)
        if not target_year:
            return ResponseModel(data=_coming_soon("No admission data year available."))

        res = svc.table("national_jamb_floor").select("*").eq("year", target_year).limit(1).execute()
        if not res.data:
            return ResponseModel(data=_fallback(
                {"year": target_year, "floorScore": 150, "contextNote": "Default university floor (indicative)"},
                notice=f"Floor for {target_year} not published; showing default.",
                data_date=str(date.today()),
            ))
        return ResponseModel(data=_real(JambFloorOut(**res.data[0]).model_dump()))
    except Exception as exc:
        log.error("admission get_floor failed", error=str(exc))
        return ResponseModel(data=_coming_soon("JAMB floor temporarily unavailable."))


# ── 3. Programme × School Cut-offs ────────────────────────────

@router.get("/cutoffs", response_model=ResponseModel)
async def get_cutoffs(
    school_id: Optional[str] = None,
    programme_id: Optional[str] = None,
    year: Optional[int] = None,
    form: Optional[Literal["UTME", "DE"]] = None,
):
    """Cut-offs for university programmes. At least one filter required."""
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        target_year = year or _active_snapshot_year(svc)
        if not target_year:
            return ResponseModel(data=_coming_soon("No admission data year available."))

        if not school_id and not programme_id:
            return ResponseModel(data=_fallback(
                [],
                notice="Provide school_id or programme_id to query cut-offs.",
                data_date=str(date.today()),
            ))

        query = (
            svc.table("programme_school_cutoff")
            .select("*, schools(name), programmes(name)")
            .eq("year", target_year)
        )
        if school_id:
            query = query.eq("school_id", school_id)
        if programme_id:
            query = query.eq("programme_id", programme_id)
        if form:
            query = query.eq("form", form)

        res = query.order("schools(name)").limit(200).execute()
        items = []
        for r in (res.data or []):
            items.append(ProgrammeSchoolCutoffOut(
                id=r["id"],
                schoolId=r["school_id"],
                schoolName=r.get("schools", {}).get("name") or "Unknown",
                programmeId=r["programme_id"],
                programmeName=r.get("programmes", {}).get("name") or "Unknown",
                year=r["year"],
                aggregateCutoff=r.get("aggregate_cutoff"),
                jambCutoff=r.get("jamb_cutoff"),
                form=r["form"],
                sourceUrl=r["source_url"],
                verifiedAt=r.get("verified_at"),
                dataDate=r["created_at"],
            ).model_dump())

        notice = None
        if not items:
            notice = f"No cut-offs found for {target_year} with given filters."
        return ResponseModel(data=_real(items, notice=notice, data_date=str(date.today()), sources=["school_portal", "jamb_brochure", "news"]))
    except Exception as exc:
        log.error("admission get_cutoffs failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Cut-offs temporarily unavailable."))


# ── 4. School Aggregate Formula ──────────────────────────────

@router.get("/formula", response_model=ResponseModel)
async def get_school_formula(school_id: str, year: Optional[int] = None):
    """How a university calculates aggregate (JAMB% + O'level%)."""
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        target_year = year or _active_snapshot_year(svc)
        if not target_year:
            return ResponseModel(data=_coming_soon("No admission data year available."))

        res = svc.table("school_aggregate_formula").select("*, schools(name)").eq("school_id", school_id).eq("year", target_year).limit(1).execute()
        if not res.data:
            return ResponseModel(data=_fallback(
                None,
                notice=f"No aggregate formula published for this school in {target_year}.",
                data_date=str(date.today()),
            ))
        r = res.data[0]
        return ResponseModel(data=_real(SchoolAggregateFormulaOut(
            id=r["id"],
            schoolId=r["school_id"],
            schoolName=r.get("schools", {}).get("name") or "Unknown",
            year=r["year"],
            jambWeight=float(r["jamb_weight"]),
            olevelWeight=float(r["olevel_weight"]),
            description=r.get("description"),
            sourceUrl=r.get("source_url"),
            dataDate=r["created_at"],
        ).model_dump()))
    except Exception as exc:
        log.error("admission get_formula failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Formula temporarily unavailable."))


# ── 5. Course Competitiveness (National, Faculty-Level) ──────

@router.get("/competitiveness", response_model=ResponseModel)
async def get_competitiveness(year: Optional[int] = None, broad_course: Optional[str] = None):
    """National broad-course competitiveness (e.g., Medicine ~1:5). Faculty-level only."""
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        target_year = year or _active_snapshot_year(svc)
        if not target_year:
            return ResponseModel(data=_coming_soon("No admission data year available."))

        query = svc.table("course_competitiveness").select("*").eq("year", target_year)
        if broad_course:
            query = query.ilike("broad_course", f"%{broad_course}%")
        res = query.order("broad_course").execute()

        items = [CourseCompetitivenessOut(**r).model_dump() for r in (res.data or [])]
        notice = None
        if not items:
            notice = f"No competitiveness data for {target_year}."
        return ResponseModel(data=_real(items, notice=notice, data_date=str(date.today()), sources=["JAMB_annual_report", "NBS"]))
    except Exception as exc:
        log.error("admission get_competitiveness failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Competitiveness temporarily unavailable."))


# ── 6. Admission Insight for JAMB-name → Domain flow (Phase 6 integration) ──

@router.get("/jamb/{jamb_name:path}/insight", response_model=ResponseModel)
async def jamb_admission_insight(jamb_name: str):
    """
    Given a JAMB name, check if any of its mapped programmes have cut-off data.
    Used by career/jamb/{name}/domains to add admissionInsight badge.
    """
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        target_year = _active_snapshot_year(svc)
        if not target_year:
            return ResponseModel(data=_real(AdmissionInsightOut(hasCutoffData=False, year=0, label="No admission data compiled", programmeCount=0).model_dump()))

        # Find programmes matching this JAMB name pattern
        prog_res = svc.table("programmes").select("id").ilike("name", f"%{jamb_name}%").execute()
        prog_ids = [p["id"] for p in (prog_res.data or [])]

        if not prog_ids:
            return ResponseModel(data=_real(AdmissionInsightOut(hasCutoffData=False, year=target_year, label="No matching programmes", programmeCount=0).model_dump()))

        cutoff_res = svc.table("programme_school_cutoff").select("programme_id", count="exact").eq("year", target_year).in_("programme_id", prog_ids).execute()
        count = cutoff_res.count if hasattr(cutoff_res, "count") and cutoff_res.count is not None else len(cutoff_res.data or [])

        return ResponseModel(data=_real(AdmissionInsightOut(
            hasCutoffData=count > 0,
            year=target_year,
            label=f"{count} programme(s) with {target_year} cut-off data" if count else f"No {target_year} cut-off data yet",
            programmeCount=count,
        ).model_dump()))
    except Exception as exc:
        log.error("admission jamb_insight failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Admission insight unavailable."))


# ── 7. School / programme search (onboarding pickers) ─────────

@router.get("/schools", response_model=ResponseModel)
async def search_schools(q: Optional[str] = Query(None), limit: int = Query(20)):
    """Typeahead over universities that have admission data.

    Used by JambSetupForm's "preferred school" picker. Returns a lightweight
    list [{id, name, institutionType}] filtered to `university` scope (Phase 8).
    """
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        query = (
            svc.table("schools")
            .select("id, name, institution_type")
            .eq("institution_type", "university")
        )
        if q:
            query = query.ilike("name", f"%{q}%")
        res = query.order("name").limit(min(limit, 50)).execute()
        items = [
            {
                "id": r["id"],
                "name": r["name"],
                "institutionType": r.get("institution_type") or "university",
            }
            for r in (res.data or [])
        ]
        return ResponseModel(data=_real(items))
    except Exception as exc:
        log.error("admission search_schools failed", error=str(exc))
        return ResponseModel(data=_coming_soon("School search temporarily unavailable."))


@router.get("/programmes", response_model=ResponseModel)
async def search_admission_programmes(q: Optional[str] = Query(None), limit: int = Query(20)):
    """Typeahead over programmes that have published cut-offs in the active year.

    Used by the onboarding "intended programme" picker so students only see
    programmes we can actually show admission data for.
    """
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        target_year = _active_snapshot_year(svc)
        prog_ids: Optional[list] = None
        if target_year:
            cut_res = (
                svc.table("programme_school_cutoff")
                .select("programme_id")
                .eq("year", target_year)
                .execute()
            )
            prog_ids = list({r["programme_id"] for r in (cut_res.data or [])})

        query = svc.table("programmes").select("id, name, discipline, institution_type")
        if prog_ids is not None and prog_ids:
            query = query.in_("id", prog_ids)
        if q:
            query = query.ilike("name", f"%{q}%")
        res = query.order("name").limit(min(limit, 50)).execute()
        items = [
            {
                "id": r["id"],
                "name": r["name"],
                "discipline": r.get("discipline"),
                "institutionType": r.get("institution_type") or "university",
            }
            for r in (res.data or [])
        ]
        return ResponseModel(data=_real(items))
    except Exception as exc:
        log.error("admission search_programmes failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Programme search temporarily unavailable."))