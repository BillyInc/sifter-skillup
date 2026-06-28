# ============================================================
# Sifter LevelUp — Interview Mode Routes
# /api/interview/start  POST
# /api/interview/answer POST
# /api/interview/{id}/result GET
# ============================================================
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import Auth
from database import db
from logger import log
from models import (
    InterviewAnswerRequest,
    InterviewStartRequest,
    ResponseModel,
)

router = APIRouter(prefix="/api/interview", tags=["interview"])

# Reject /answer if the session was started more than this long ago
_SESSION_TIMEOUT = timedelta(minutes=30)

# Field-name prefixes/keys that must never leak to the client in /result
_SENSITIVE_FIELD_PREFIXES = ("expected_", "rubric", "answer_key")


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _now_utc().isoformat()


def _strip_sensitive(obj: Any) -> Any:
    """Recursively drop rubric / expected / answer_key fields from question payloads."""
    if isinstance(obj, dict):
        return {
            k: _strip_sensitive(v)
            for k, v in obj.items()
            if not any(k.startswith(p) or k == p for p in _SENSITIVE_FIELD_PREFIXES)
        }
    if isinstance(obj, list):
        return [_strip_sensitive(item) for item in obj]
    return obj


def _parse_started_at(raw: Optional[str]) -> Optional[datetime]:
    if not raw:
        return None
    try:
        # Postgres may return "...+00:00" or "...Z"
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return None


@router.post("/start", response_model=ResponseModel)
async def start_interview(
    body: InterviewStartRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Begin an interview session. Returns the first question.
    Interview questions are pulled from the track's question bank.
    AI scoring happens per-answer via /api/ai/score.
    """
    session_id = str(uuid.uuid4())

    # Fetch question bank for this track + level
    questions = db.get_service_client() \
        .table("interview_questions") \
        .select("*") \
        .eq("track_id", body.track_id) \
        .eq("level", body.level) \
        .limit(10) \
        .execute()

    if not questions.data:
        question_bank = _default_questions(body.track_id, body.level)
    else:
        question_bank = questions.data

    # Store session (full bank including any rubric/expected fields kept server-side)
    db.get_service_client().table("interview_sessions").insert({
        "id":         session_id,
        "user_id":    current_user["id"],
        "track_id":   body.track_id,
        "level":      body.level,
        "questions":  question_bank,
        "answers":    [],
        "status":     "in_progress",
        "started_at": _now_iso(),
    }).execute()

    log.info("Interview started", user_id=current_user["id"], track=body.track_id, level=body.level)

    first_question = _strip_sensitive(question_bank[0]) if question_bank else None
    return ResponseModel(data={
        "id":           session_id,
        "track_id":     body.track_id,
        "level":        body.level,
        "status":       "in_progress",
        "question_count": len(question_bank),
        "current_question": first_question,
    })


@router.post("/answer", response_model=ResponseModel)
async def submit_answer(
    body: InterviewAnswerRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Submit an answer and get the next question."""
    session = db.get_service_client() \
        .table("interview_sessions") \
        .select("*") \
        .eq("id", body.interview_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not session.data:
        raise HTTPException(404, "Interview session not found")

    s = session.data[0]
    if s["status"] != "in_progress":
        raise HTTPException(400, "Interview already completed")

    # 30-minute session timeout
    started_at = _parse_started_at(s.get("started_at"))
    if started_at and _now_utc() - started_at > _SESSION_TIMEOUT:
        db.get_service_client().table("interview_sessions").update({
            "status": "expired",
        }).eq("id", body.interview_id).execute()
        raise HTTPException(410, "Interview session expired")

    questions = s.get("questions", []) or []
    answers = s.get("answers", []) or []

    # Validate question_index is within bounds and matches expected progress
    if body.question_index < 0 or body.question_index >= len(questions):
        raise HTTPException(400, "question_index out of range")
    if body.question_index != len(answers):
        raise HTTPException(
            400,
            f"unexpected question_index {body.question_index}; expected {len(answers)}",
        )

    answers.append({
        "question_index": body.question_index,
        "answer":         body.answer,
        "answered_at":    _now_iso(),
    })

    answered_count = len(answers)
    status = "completed" if answered_count >= len(questions) else "in_progress"
    next_question = (
        _strip_sensitive(questions[answered_count])
        if answered_count < len(questions)
        else None
    )

    db.get_service_client().table("interview_sessions").update({
        "answers": answers,
        "status":  status,
        **({"completed_at": _now_iso()} if status == "completed" else {}),
    }).eq("id", body.interview_id).execute()

    return ResponseModel(data={
        "interview_id":  body.interview_id,
        "answers_count": answered_count,
        "status":        status,
        "next_question": next_question,
        "is_complete":   status == "completed",
    })


@router.get("/{interview_id}/result", response_model=ResponseModel)
async def get_result(
    interview_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Get the final result of a completed interview session."""
    session = db.get_service_client() \
        .table("interview_sessions") \
        .select("*") \
        .eq("id", interview_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not session.data:
        raise HTTPException(404, "Interview session not found")

    s = session.data[0]
    answers = s.get("answers", []) or []
    questions = s.get("questions", []) or []

    # Basic scoring: completion percentage
    completion = len(answers) / max(len(questions), 1)
    score = round(completion * 100)

    # Strip rubric / expected_answers from any question payload before returning
    safe_questions = _strip_sensitive(questions)

    return ResponseModel(data={
        "interview_id":    interview_id,
        "track_id":        s["track_id"],
        "level":           s["level"],
        "score":           score,
        "answers_count":   len(answers),
        "questions_count": len(questions),
        "questions":       safe_questions,
        "status":          s["status"],
        "started_at":      s.get("started_at"),
        "completed_at":    s.get("completed_at"),
        "note": "Per-answer AI scoring available via POST /api/ai/score",
    })


def _default_questions(track_id: str, level: str) -> list:
    """Fallback question bank if DB table is empty."""
    return [
        {"id": "q1", "question": f"Describe your understanding of {track_id} fundamentals.", "type": "open"},
        {"id": "q2", "question": "Walk me through a complex problem you solved recently.", "type": "open"},
        {"id": "q3", "question": "What tools do you use daily in this role?", "type": "open"},
        {"id": "q4", "question": "How do you approach risk management?", "type": "open"},
        {"id": "q5", "question": "Where do you see this field in 5 years?", "type": "open"},
    ]
