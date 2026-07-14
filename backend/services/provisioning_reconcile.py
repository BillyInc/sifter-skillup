"""
Provisioning reconciliation helpers.

Creates deterministic merge candidates between school-provisioned shells and
real student accounts, then reuses the same merge transfer for claim-code and
admin-confirm flows.
"""
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from database import db
from logger import log

_SCHEMA = "skillup_dev"
_CANDIDATE_STATUSES_TO_SKIP = {"confirmed", "dismissed"}


def _svc():
    return db.get_service_client().schema(_SCHEMA)


def _users():
    return db.get_service_client().table("users")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_stream(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    clean = str(value).strip().lower()
    return clean if clean in {"science", "art", "commercial"} else None


def normalize_email(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    clean = str(value).strip().lower()
    return clean or None


def normalize_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    digits = re.sub(r"\D+", "", str(value))
    return digits or None


def normalize_name(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    clean = re.sub(r"[^a-z0-9]+", " ", str(value).strip().lower())
    clean = " ".join(clean.split())
    return clean or None


def _chunked(values: list[str], size: int = 500):
    for idx in range(0, len(values), size):
        yield values[idx:idx + size]


def _student_snapshot(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "username": row.get("username"),
        "email": row.get("email"),
        "phone": row.get("phone"),
        "student_class": row.get("student_class"),
        "stream": row.get("stream"),
    }


def _match(provisioned: dict, real: dict) -> Optional[dict]:
    prov_phone = normalize_phone(provisioned.get("phone"))
    real_phone = normalize_phone(real.get("phone"))
    if prov_phone and real_phone and prov_phone == real_phone:
        return {
            "match_key": f"phone:{prov_phone}",
            "match_reason": "exact_phone",
            "confidence": 1.0,
        }

    prov_email = normalize_email(provisioned.get("email"))
    real_email = normalize_email(real.get("email"))
    if prov_email and real_email and prov_email == real_email:
        return {
            "match_key": f"email:{prov_email}",
            "match_reason": "exact_email",
            "confidence": 1.0,
        }

    prov_name = normalize_name(provisioned.get("username"))
    real_name = normalize_name(real.get("username"))
    if not prov_name or prov_name != real_name:
        return None

    prov_class = normalize_name(provisioned.get("student_class"))
    real_class = normalize_name(real.get("student_class"))
    prov_stream = normalize_stream(provisioned.get("stream"))
    real_stream = normalize_stream(real.get("stream"))
    class_match = bool(prov_class and real_class and prov_class == real_class)
    stream_match = bool(prov_stream and real_stream and prov_stream == real_stream)

    reason = "exact_name"
    confidence = 0.75
    if class_match and stream_match:
        reason = "exact_name_class_stream"
        confidence = 0.92
    elif class_match:
        reason = "exact_name_class"
        confidence = 0.86
    elif stream_match:
        reason = "exact_name_stream"
        confidence = 0.82

    return {
        "match_key": f"name:{prov_name}|class:{prov_class or ''}|stream:{prov_stream or ''}",
        "match_reason": reason,
        "confidence": confidence,
    }


def create_or_reuse_merge_candidate(
    *,
    school_id: str,
    provisioned_student: dict,
    real_student: dict,
    match: dict,
    created_by: Optional[str] = None,
) -> Optional[dict]:
    """Create one pending candidate unless this pair already has a decision."""
    provisioned_id = provisioned_student["id"]
    real_id = real_student["id"]
    existing = _svc().table("student_merge_candidates").select("*").eq(
        "school_id", school_id
    ).eq("provisioned_student_id", provisioned_id).eq(
        "real_student_id", real_id
    ).limit(1).execute()
    row = (existing.data or [None])[0]
    if row:
        if row.get("status") in _CANDIDATE_STATUSES_TO_SKIP:
            return None
        return row

    payload = {
        "id": str(uuid.uuid4()),
        "school_id": school_id,
        "provisioned_student_id": provisioned_id,
        "real_student_id": real_id,
        "status": "pending",
        "match_key": match["match_key"],
        "match_reason": match["match_reason"],
        "confidence": match["confidence"],
        "created_by": created_by,
        "provisioned_snapshot": _student_snapshot(provisioned_student),
        "real_snapshot": _student_snapshot(real_student),
        "evidence": {
            "deterministic": True,
            "match_reason": match["match_reason"],
        },
    }
    try:
        inserted = _svc().table("student_merge_candidates").insert(payload).execute()
        return (inserted.data or [payload])[0]
    except Exception as exc:  # noqa: BLE001
        log.warning(
            "provisioning reconcile: candidate insert skipped",
            school_id=school_id,
            provisioned_student_id=provisioned_id,
            real_student_id=real_id,
            error=str(exc),
        )
        return None


def reconcile_school_merge_candidates(
    school_id: str,
    *,
    created_by: Optional[str] = None,
    limit: int = 2000,
) -> dict:
    """Find deterministic school-local duplicates and create pending candidates."""
    provisioned = _users().select(
        "id, username, email, phone, student_class, stream, claim_state, provenance, provisioning_school_id"
    ).eq("provisioning_school_id", school_id).eq("provenance", "provisioned").eq(
        "claim_state", "unclaimed"
    ).limit(limit).execute().data or []

    affiliations = _svc().table("student_affiliations").select(
        "student_id"
    ).eq("school_id", school_id).limit(limit).execute().data or []
    affiliated_ids = sorted({
        a["student_id"] for a in affiliations
        if a.get("student_id") and a["student_id"] not in {p["id"] for p in provisioned}
    })

    real_students: list[dict] = []
    for chunk in _chunked(affiliated_ids):
        rows = _users().select(
            "id, username, email, phone, student_class, stream, claim_state, provenance"
        ).in_("id", chunk).execute().data or []
        real_students.extend([
            r for r in rows
            if not (r.get("provenance") == "provisioned" and r.get("claim_state") == "unclaimed")
        ])

    created = reused = 0
    candidates: list[dict] = []
    for prov in provisioned:
        for real in real_students:
            match = _match(prov, real)
            if not match:
                continue
            candidate = create_or_reuse_merge_candidate(
                school_id=school_id,
                provisioned_student=prov,
                real_student=real,
                match=match,
                created_by=created_by,
            )
            if not candidate:
                continue
            candidates.append(candidate)
            if candidate.get("created_at"):
                reused += 1
            else:
                created += 1

    return {
        "school_id": school_id,
        "created_or_reused": len(candidates),
        "created": created,
        "reused": reused,
    }


def reconcile_all_schools(limit_schools: int = 200) -> dict:
    schools = _svc().table("schools").select("id").limit(limit_schools).execute().data or []
    totals = {"schools": 0, "created_or_reused": 0}
    for school in schools:
        school_id = school.get("id")
        if not school_id:
            continue
        result = reconcile_school_merge_candidates(school_id)
        totals["schools"] += 1
        totals["created_or_reused"] += result["created_or_reused"]
    return totals


def merge_provisioned_into_student(
    *,
    provisioned_student_id: str,
    real_student_id: str,
    school_id: str,
    phone: Optional[str] = None,
    email: Optional[str] = None,
) -> dict:
    """Move useful provisioned data to the real student, then retire the shell."""
    pres = _users().select(
        "student_class, stream, chosen_direction, guardian_consent_at"
    ).eq("id", provisioned_student_id).limit(1).execute()
    provisioned = (pres.data or [{}])[0]

    updates = {"last_login": _now()}
    for field in ("student_class", "stream", "chosen_direction", "guardian_consent_at"):
        if provisioned.get(field):
            updates[field] = provisioned[field]
    if phone:
        updates["phone"] = phone.strip()
    if email:
        updates["email"] = email.strip().lower()

    _users().update(updates).eq("id", real_student_id).execute()

    _svc().table("student_affiliations").upsert({
        "id": str(uuid.uuid4()),
        "student_id": real_student_id,
        "school_id": school_id,
        "source": "provisioned",
        "self_reported": False,
    }, on_conflict="student_id,school_id").execute()
    _svc().table("student_affiliations").delete().eq(
        "student_id", provisioned_student_id
    ).eq("school_id", school_id).execute()

    _svc().table("claim_codes").update({"revoked_at": _now()}).eq(
        "student_id", provisioned_student_id
    ).is_("redeemed_at", "null").is_("revoked_at", "null").execute()
    _users().delete().eq("id", provisioned_student_id).execute()

    return {
        "provisioned_student_id": provisioned_student_id,
        "real_student_id": real_student_id,
        "school_id": school_id,
        "transferred_fields": sorted(k for k in updates if k != "last_login"),
    }
