# ============================================================
# Sifter LevelUp — Admission Intelligence Routes (Phase 8)
# Read-only public endpoints for SS → University admission data
# ============================================================

import re
from typing import Any, List, Optional, Literal
from fastapi import APIRouter, Query

from database import db
from logger import log
from models import ResponseModel, JambFloorOut, ProgrammeSchoolCutoffOut, SchoolAggregateFormulaOut, CourseCompetitivenessOut, AdmissionSnapshotVersionOut, AdmissionInsightOut
from reference_cache import REFERENCE_TTL_SECONDS, SEARCH_TTL_SECONDS, get_json, set_json

_SCHEMA = "skillup_dev"
router = APIRouter(prefix="/api/admission", tags=["admission"])

UNIVERSITY_DISPLAY_NAMES = {
    "unilag": "University of Lagos",
    "lagos": "University of Lagos",
    "lasu": "Lagos State University",
    "ui": "University of Ibadan",
    "abu": "Ahmadu Bello University",
    "unn": "University of Nigeria, Nsukka",
    "oau": "Obafemi Awolowo University",
    "uniben": "University of Benin",
    "uniport": "University of Port Harcourt",
    "unical": "University of Calabar",
    "unilorin": "University of Ilorin",
    "unijos": "University of Jos",
    "futo": "Federal University of Technology, Owerri",
    "futa": "Federal University of Technology, Akure",
    "abuad": "Afe Babalola University",
    "covenant": "Covenant University",
}


def _university_display_name(value: str) -> str:
    raw = (value or "").strip()
    return UNIVERSITY_DISPLAY_NAMES.get(raw.lower(), raw)
def _search_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").lower())


def _is_university_search_match(query: str, name: str) -> tuple[bool, int]:
    """Match full names, abbreviations, and shortened university searches.

    A subsequence match handles common Nigerian shorthand without maintaining a
    brittle alias table: `unilag` matches University of Lagos and `lasu`
    matches Lagos State University. Full name/location matches rank first.
    """
    q = _search_key(query)
    n = _search_key(name)
    if not q:
        return True, 0
    if q in n:
        return True, 0 if n.startswith(q) else 1
    aliases = {
        "unilag": "universityoflagos",
        "lasu": "lagosstateuniversity",
        "ui": "universityofibadan",
        "abu": "ahmadu bellouniversity",
        "unn": "universityofnigeria",
        "oau": "obafemiawolowo university",
        "uniben": "universityofbenin",
    }
    alias_target = aliases.get(q)
    if alias_target and alias_target.replace(" ", "") in n:
        return True, 1
    # A long non-alias query should match the name or a location token, not an
    # arbitrary character subsequence. That was making `lagos` match unrelated
    # records such as religious subjects.
    if len(q) > 4:
        return False, 99
    pos = 0
    for char in q:
        pos = n.find(char, pos)
        if pos < 0:
            return False, 99
        pos += 1
    return True, 2


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
            return ResponseModel(data=_coming_soon(f"Universal JAMB floor for {target_year} is not published in this dataset yet."))
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
            return ResponseModel(data=_coming_soon("Choose a programme or university before viewing admission cycle data."))

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
            notice = f"No admission cycle rows found for {target_year} with the selected filters."
        return ResponseModel(data=_real(items, notice=notice, sources=["school_portal", "jamb_brochure", "news"]))
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
            return ResponseModel(data=_coming_soon(f"No aggregate formula published for this university in {target_year}."))
        r = res.data[0]
        # `created_at` is NOT a column on school_aggregate_formula — reading it
        # raised KeyError on every row, so this endpoint always answered
        # "Formula temporarily unavailable" despite 17 rows being present.
        # `schools` is also None (not {}) when the embed misses, so .get(...)
        # with a {} default still returned None and then threw on .get("name").
        school = r.get("schools") or {}
        return ResponseModel(data=_real(SchoolAggregateFormulaOut(
            id=r["id"],
            schoolId=r["school_id"],
            schoolName=school.get("name") or "Unknown",
            year=r["year"],
            jambWeight=float(r["jamb_weight"]),
            olevelWeight=float(r["olevel_weight"]),
            description=r.get("description"),
            sourceUrl=r.get("source_url"),
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

        res = (
            svc.table("course_competitiveness")
            .select("*")
            .eq("year", target_year)
            .order("broad_course")
            .execute()
        )
        rows = res.data or []

        # Match in BOTH directions. Callers pass the student's JAMB name
        # ("Medicine and Surgery (Human Medicine)") while this table holds the
        # BROAD course ("Medicine"), so the old `broad_course ilike %q%` could
        # never match — the needle was longer than the haystack. The table is
        # ~20 rows per year, so filtering here costs nothing.
        if broad_course:
            needle = broad_course.strip().lower()
            rows = [
                r
                for r in rows
                if (bc := (r.get("broad_course") or "").strip().lower())
                and (bc in needle or needle in bc)
            ]

        items = [CourseCompetitivenessOut(**r).model_dump() for r in rows]
        notice = None
        if not items:
            notice = f"No competitiveness data for {target_year}."
        return ResponseModel(data=_real(items, notice=notice, sources=["JAMB_annual_report", "NBS"]))
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
async def search_schools(
    q: Optional[str] = Query(None),
    limit: int = Query(20),
    institution_type: Optional[str] = Query(None),
):
    """Typeahead over known schools, filtered to universities by default.

    Used by onboarding school pickers. Returns a lightweight list
    [{id, name, institutionType}] and accepts free-text fallback client-side.
    """
    try:
        svc = db.get_service_client().schema(_SCHEMA)
        selected_type = institution_type or "university"
        query_text = (q or "").strip().lower()
        result_key = f"admission:schools:v4:{selected_type}:{query_text}:{min(limit, 50)}"
        cached_items = get_json(result_key)
        if isinstance(cached_items, list) and cached_items:
            return ResponseModel(data=_real(cached_items))
        query = svc.table("schools").select("id, name, institution_type, address, city, state, country").eq("institution_type", selected_type)
        if selected_type == "university" and q:
            # Use the indexed name search first. Loading the entire university
            # registry for every keystroke made typeahead time out on populated
            # projects. The bounded registry is only needed for abbreviations.
            rows = query.ilike("name", f"%{q}%").order("name").limit(min(limit, 50)).execute().data or []
            registry_key = "admission:university-registry:v4"
            registry = get_json(registry_key)
            if not isinstance(registry, list):
                registry = svc.table("schools").select("id, name, institution_type, address, city, state, country").eq(
                    "institution_type", selected_type
                ).order("name").limit(1200).execute().data or []
                set_json(registry_key, registry, REFERENCE_TTL_SECONDS)
            # Merge the fast SQL matches with the bounded registry so a place
            # query such as `lagos` can return LASU and UNILAG, while an alias
            # query such as `unilag` can resolve to the official display name.
            rows = list({str(row.get("id")): row for row in [*rows, *registry]}.values())
            # Search both the stored code and its user-facing official name.
            ranked = [
                (rank, row)
                for row in rows
                for matched, rank in [
                    _is_university_search_match(q, row.get("name") or ""),
                    _is_university_search_match(q, _university_display_name(row.get("name") or "")),
                ]
                if matched
            ]
            rows = [row for _, row in sorted(
                {id(row): (rank, row) for rank, row in ranked}.values(),
                key=lambda item: (item[0], _university_display_name(item[1].get("name") or "").lower()),
            )]
        else:
            if q:
                query = query.ilike("name", f"%{q}%")
            rows = query.order("name").limit(min(limit, 50)).execute().data or []
        items = [
            {
                "id": r["id"],
                "name": _university_display_name(r["name"]) if selected_type == "university" else r["name"],
                "institutionType": r.get("institution_type") or "university",
                "address": r.get("address"),
                "city": r.get("city"),
                "state": r.get("state"),
                "country": r.get("country"),
            }
            for r in rows[: min(limit, 50)]
        ]
        set_json(result_key, items, SEARCH_TTL_SECONDS)
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
        # Typeahead is a registry lookup. Admission snapshot/cut-off data is a
        # detail concern and must never make programme names unsearchable.
        query = svc.table("programmes").select("id, name, discipline, institution_type")
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
            if (r.get("institution_type") or "university") == "university"
        ]
        return ResponseModel(data=_real(items))
    except Exception as exc:
        log.error("admission search_programmes failed", error=str(exc))
        return ResponseModel(data=_coming_soon("Programme search temporarily unavailable."))
