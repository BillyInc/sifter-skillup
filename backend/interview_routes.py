# ============================================================
# Sifter Skill_Up — Interview Mode Routes
# /api/interview/start  POST
# /api/interview/answer POST
# /api/interview/{id}/result GET
# ============================================================
import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/interview", tags=["interview"])


class InterviewStart(BaseModel):
    track_id:  str
    level:     str   # 'junior' | 'intermediate' | 'senior'
    topic:     Optional[str] = None

class InterviewAnswer(BaseModel):
    interview_id: str
    question_id:  str
    answer:       str
    time_taken_s: Optional[int] = None


@router.post("/start", response_model=ResponseModel)
async def start_interview(
    body: InterviewStart,
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
        # Fallback: generate a generic set if no questions in DB yet
        question_bank = _default_questions(body.track_id, body.level)
    else:
        question_bank = questions.data

    # Store session
    db.get_service_client().table("interview_sessions").insert({
        "id":           session_id,
        "user_id":      current_user["id"],
        "track_id":     body.track_id,
        "level":        body.level,
        "questions":    question_bank,
        "answers":      [],
        "status":       "in_progress",
        "started_at":   datetime.utcnow().isoformat(),
    }).execute()

    log.info("Interview started", user_id=current_user["id"], track=body.track_id, level=body.level)

    return ResponseModel(data={
        "id":           session_id,
        "track_id":     body.track_id,
        "level":        body.level,
        "status":       "in_progress",
        "question_count": len(question_bank),
        "current_question": question_bank[0] if question_bank else None,
    })


@router.post("/answer", response_model=ResponseModel)
async def submit_answer(
    body: InterviewAnswer,
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

    answers = s.get("answers", [])
    answers.append({
        "question_id": body.question_id,
        "answer":      body.answer,
        "time_taken_s": body.time_taken_s,
        "answered_at": datetime.utcnow().isoformat(),
    })

    questions = s.get("questions", [])
    answered_count = len(answers)

    # Determine if interview is complete
    status = "completed" if answered_count >= len(questions) else "in_progress"
    next_question = questions[answered_count] if answered_count < len(questions) else None

    db.get_service_client().table("interview_sessions").update({
        "answers": answers,
        "status":  status,
        **({"completed_at": datetime.utcnow().isoformat()} if status == "completed" else {}),
    }).eq("id", body.interview_id).execute()

    return ResponseModel(data={
        "interview_id":   body.interview_id,
        "answers_count":  answered_count,
        "status":         status,
        "next_question":  next_question,
        "is_complete":    status == "completed",
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
    answers = s.get("answers", [])
    questions = s.get("questions", [])

    # Basic scoring: completion percentage
    completion = len(answers) / max(len(questions), 1)
    score = round(completion * 100)

    return ResponseModel(data={
        "interview_id":   interview_id,
        "track_id":       s["track_id"],
        "level":          s["level"],
        "score":          score,
        "answers_count":  len(answers),
        "questions_count": len(questions),
        "status":         s["status"],
        "started_at":     s.get("started_at"),
        "completed_at":   s.get("completed_at"),
        # Full AI scoring happens client-side via /api/ai/score per answer
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
