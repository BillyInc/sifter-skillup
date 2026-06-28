# ============================================================
# Sifter LevelUp — Interview Mode Routes v2
# Deterministic scoring. Zero AI dependency.
# /api/interview/start  POST
# /api/interview/answer POST
# /api/interview/{id}/result GET
#
# WHAT CHANGED FROM v1:
#   — interview_questions table now populated with real content
#   — Per-answer scoring is deterministic (keyword + number extraction)
#   — Result endpoint scores all answers and returns per-answer breakdown
#   — No fallback to generic 5 questions — fails clearly if track not found
#   — Supports Navigator, Cairo Builder, and Ecosystem tracks
# ============================================================

import re
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import Auth
from config import settings
from database import db
from logger import log
from models import ResponseModel

router = APIRouter(prefix="/api/interview", tags=["interview"])


# ─── Models ────────────────────────────────────────────────────────────────────

class InterviewStart(BaseModel):
    track_id:  str
    level:     str   # 'junior' | 'intermediate' | 'senior'
    topic:     Optional[str] = None


class InterviewAnswer(BaseModel):
    interview_id: str
    question_id:  str
    answer:       str
    time_taken_s: Optional[int] = None


# ─── Deterministic answer scorer ──────────────────────────────────────────────

NUM_PATTERN = re.compile(
    r'\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)([%MKB])?'
)


def extract_numbers(text: str) -> list:
    """Extract numeric values from text, normalising % and M/K/B suffixes."""
    results = []
    for m in NUM_PATTERN.finditer(text):
        try:
            val = float(m.group(1).replace(',', ''))
            suffix = m.group(2) or ''
            if suffix == 'M': val *= 1_000_000
            elif suffix == 'K': val *= 1_000
            elif suffix == 'B': val *= 1_000_000_000
            if suffix == '%':
                results.append(val)
                results.append(val / 100)
            else:
                results.append(val)
        except ValueError:
            pass
    return results


def numbers_match(a: float, b: float, tol: float = 0.02) -> bool:
    """Check if two numbers match within tolerance."""
    if b == 0:
        return abs(a) < 0.001
    return abs(a - b) / max(abs(b), 0.0001) <= tol


CALCULATION_PATTERN = re.compile(r'[×x\*]\s*[\d.%$]+\s*=\s*[\d.,]+', re.IGNORECASE)
RATIO_PATTERN = re.compile(r'\$?[\d.,]+\s*/\s*\$?[\d.,]+\s*=\s*[\d.]+%?')

# Domain keywords for Starknet/DeFi content
DOMAIN_KEYWORDS = {
    'utilisation': ['utilisation', 'utilization', 'utilization rate'],
    'health_factor': ['health factor', 'hf', 'h.f.'],
    'liquidation': ['liquidat'],
    'cairo': ['felt252', 'u256', 'contractaddress', 'storage', 'snforge'],
    'zk': ['stark proof', 'validity proof', 'zero-knowledge', 'prover'],
    'governance': ['governance', 'voting', 'proposal', 'quorum'],
    'amm': ['xy=k', 'constant product', 'impermanent loss', 'price impact'],
    'tokenomics': ['fdv', 'vesting', 'emission', 'supply', 'dilution'],
    'oracle': ['oracle', 'pragma', 'price feed'],
    'sei': ['checks-effects', 'cei', 'reentrancy'],
}


def classify_criterion(criterion: str) -> str:
    """Classify a scoring criterion as calculation / number_match / keyword / self_assess."""
    if CALCULATION_PATTERN.search(criterion) or RATIO_PATTERN.search(criterion):
        return 'calculation'
    nums = [n for n in extract_numbers(criterion) if n > 1]
    if nums and re.search(r'\d+\.?\d*%|\$[\d,]+|[\d,]{4,}', criterion):
        return 'number_match'
    lower = criterion.lower()
    if any(kw in lower for kws in DOMAIN_KEYWORDS.values() for kw in kws):
        return 'keyword'
    return 'self_assess'


def score_criterion_deterministic(criterion: str, answer: str) -> Dict[str, Any]:
    """Score a single criterion against a user answer deterministically."""
    ctype = classify_criterion(criterion)
    answer_nums = extract_numbers(answer)

    if ctype == 'calculation':
        # Extract the result after "="
        m = re.search(r'=\s*(\$?[\d,]+\.?\d*%?)\s*$', criterion)
        if m:
            raw = m.group(1).replace('$', '').replace(',', '')
            is_pct = raw.endswith('%')
            try:
                expected = float(raw.replace('%', ''))
                tol = 0.015 if is_pct else 0.01
                matched = any(numbers_match(n, expected, tol) for n in answer_nums)
                if is_pct:
                    matched = matched or any(numbers_match(n, expected / 100, tol) for n in answer_nums)
                return {
                    'criterion': criterion,
                    'passed': matched,
                    'feedback': f'✓ Correct ({expected}{"%" if is_pct else ""})' if matched
                               else f'✗ Expected {expected}{"%" if is_pct else ""}. Check your calculation.',
                    'type': 'calculation',
                }
            except ValueError:
                pass

    if ctype in ('calculation', 'number_match'):
        crit_nums = [n for n in extract_numbers(criterion) if n > 0.001]
        sig_nums = sorted([n for n in crit_nums if n > 1], reverse=True)
        if sig_nums:
            target = sig_nums[0]
            tol = 0.02 if target > 1000 else 0.05
            matched = any(numbers_match(n, target, tol) for n in answer_nums)
            return {
                'criterion': criterion,
                'passed': matched,
                'feedback': f'✓ Value {target} found.' if matched
                           else f'✗ Include the value {target} in your answer.',
                'type': 'number_match',
            }

    if ctype == 'keyword':
        lower = answer.lower()
        crit_lower = criterion.lower()
        required = [kw for kws in DOMAIN_KEYWORDS.values() for kw in kws if kw in crit_lower]
        if not required:
            # Fall through to self_assess
            pass
        else:
            found = [kw for kw in required if kw.lower() in lower]
            passed = len(found) >= max(1, int(len(required) * 0.6))
            return {
                'criterion': criterion,
                'passed': passed,
                'feedback': f'✓ Concepts addressed: {", ".join(found[:3])}.' if passed
                           else f'✗ Address: {", ".join(required[:3])}.',
                'type': 'keyword',
            }

    # self_assess — check minimum quality signals
    word_count = len(answer.split())
    has_numbers = bool(answer_nums)
    has_specifics = bool(re.search(r'[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+|0x[0-9a-fA-F]+|\d+\.\d+', answer))
    quality_signals = sum([
        word_count >= 40,
        has_numbers,
        has_specifics,
        len(answer) >= 200,
    ])
    passed = quality_signals >= 2
    return {
        'criterion': criterion,
        'passed': passed,
        'feedback': '✓ Sufficient detail in response.' if passed
                   else '✗ Response needs more specific detail. Include numbers and named concepts.',
        'type': 'self_assess',
    }


def score_answer(answer: str, scoring_criteria: list) -> Dict[str, Any]:
    """Score a full answer against all criteria."""
    if not scoring_criteria:
        # No criteria — basic quality check
        word_count = len(answer.split())
        passed = word_count >= 30
        return {
            'criteriaResults': [{'criterion': 'Minimum response quality', 'passed': passed,
                                 'feedback': f'Word count: {word_count}', 'type': 'quality'}],
            'score': 1 if passed else 0,
            'total': 1,
            'passed': passed,
        }

    results = [score_criterion_deterministic(c, answer) for c in scoring_criteria]
    score = sum(1 for r in results if r['passed'])
    total = len(results)
    return {
        'criteriaResults': results,
        'score': score,
        'total': total,
        'passed': score / total >= 0.6 if total > 0 else False,
    }


# ─── Routes ────────────────────────────────────────────────────────────────────

@router.post("/start", response_model=ResponseModel)
async def start_interview(
    body: InterviewStart,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Begin an interview session. Returns the first question.
    Fetches track-specific questions from Supabase (see interview_questions_seed.sql).
    """
    session_id = str(uuid.uuid4())

    # Fetch question bank
    questions_result = db.get_service_client() \
        .table("interview_questions") \
        .select("*") \
        .eq("track_id", body.track_id) \
        .eq("level", body.level) \
        .limit(10) \
        .execute()

    if not questions_result.data:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No interview questions found for track '{body.track_id}' at level '{body.level}'. "
                "Run interview_questions_seed.sql in Supabase to populate the question bank."
            )
        )

    question_bank = questions_result.data

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
        "id":               session_id,
        "track_id":         body.track_id,
        "level":            body.level,
        "status":           "in_progress",
        "question_count":   len(question_bank),
        "current_question": {
            "id":       question_bank[0]["id"],
            "question": question_bank[0]["question"],
            "type":     question_bank[0].get("type", "open"),
        },
    })


@router.post("/answer", response_model=ResponseModel)
async def submit_answer(
    body: InterviewAnswer,
    current_user: dict = Depends(Auth.get_current_user),
):
    """Submit an answer, score it deterministically, and get the next question."""
    session_result = db.get_service_client() \
        .table("interview_sessions") \
        .select("*") \
        .eq("id", body.interview_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not session_result.data:
        raise HTTPException(404, "Interview session not found")

    s = session_result.data[0]
    if s["status"] != "in_progress":
        raise HTTPException(400, "Interview already completed")

    questions = s.get("questions", [])

    # Find the question being answered
    current_q = next((q for q in questions if q["id"] == body.question_id), None)
    if not current_q:
        raise HTTPException(400, f"Question {body.question_id} not found in session")

    # Score this answer deterministically
    criteria = current_q.get("scoring_criteria") or []
    # scoring_criteria may be stored as JSON string in Supabase
    if isinstance(criteria, str):
        import json
        try:
            criteria = json.loads(criteria)
        except Exception:
            criteria = [criteria]

    scoring = score_answer(body.answer, criteria)

    answers = s.get("answers", [])
    answers.append({
        "question_id":    body.question_id,
        "answer":         body.answer,
        "time_taken_s":   body.time_taken_s,
        "answered_at":    datetime.utcnow().isoformat(),
        "score":          scoring["score"],
        "total":          scoring["total"],
        "passed":         scoring["passed"],
        "criteria_results": scoring["criteriaResults"],
    })

    answered_count = len(answers)
    status = "completed" if answered_count >= len(questions) else "in_progress"
    next_q = questions[answered_count] if answered_count < len(questions) else None

    db.get_service_client().table("interview_sessions").update({
        "answers": answers,
        "status":  status,
        **({
            "completed_at": datetime.utcnow().isoformat()
        } if status == "completed" else {}),
    }).eq("id", body.interview_id).execute()

    return ResponseModel(data={
        "interview_id":   body.interview_id,
        "answers_count":  answered_count,
        "status":         status,
        "is_complete":    status == "completed",
        "this_answer": {
            "passed":           scoring["passed"],
            "score":            scoring["score"],
            "total":            scoring["total"],
            "criteria_results": scoring["criteriaResults"],
        },
        "next_question": {
            "id":       next_q["id"],
            "question": next_q["question"],
            "type":     next_q.get("type", "open"),
        } if next_q else None,
    })


@router.get("/{interview_id}/result", response_model=ResponseModel)
async def get_result(
    interview_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Get the final result of a completed interview.
    Returns per-question scoring, overall pass/fail, and XP earned.
    """
    session_result = db.get_service_client() \
        .table("interview_sessions") \
        .select("*") \
        .eq("id", interview_id) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not session_result.data:
        raise HTTPException(404, "Interview session not found")

    s = session_result.data[0]
    answers = s.get("answers", [])
    questions = s.get("questions", [])

    # Per-question results (already scored during submission)
    question_results = []
    total_criteria_passed = 0
    total_criteria = 0
    questions_passed = 0

    for i, q in enumerate(questions):
        if i < len(answers):
            a = answers[i]
            q_passed = a.get("passed", False)
            q_score = a.get("score", 0)
            q_total = a.get("total", 1)
            if q_passed:
                questions_passed += 1
            total_criteria_passed += q_score
            total_criteria += q_total
            question_results.append({
                "question_id":    q["id"],
                "question":       q["question"],
                "answer":         a["answer"],
                "passed":         q_passed,
                "score":          q_score,
                "total":          q_total,
                "criteria_results": a.get("criteria_results", []),
            })
        else:
            # Unanswered question
            question_results.append({
                "question_id": q["id"],
                "question":    q["question"],
                "answer":      "(not answered)",
                "passed":      False,
                "score":       0,
                "total":       len(q.get("scoring_criteria") or [1]),
            })

    # Overall pass: must pass ≥ 60% of questions
    pass_threshold = 0.6
    overall_passed = (questions_passed / max(len(questions), 1)) >= pass_threshold
    pct = total_criteria_passed / max(total_criteria, 1)
    xp_earned = round((pct * 500) / 50) * 50 if overall_passed else 0

    # Update session with final scoring
    db.get_service_client().table("interview_sessions").update({
        "overall_passed": overall_passed,
        "questions_passed": questions_passed,
        "xp_earned": xp_earned,
    }).eq("id", interview_id).execute()

    log.info(
        "Interview result computed",
        user_id=current_user["id"],
        track=s["track_id"],
        passed=overall_passed,
        questions_passed=questions_passed,
        total=len(questions),
    )

    return ResponseModel(data={
        "interview_id":       interview_id,
        "track_id":           s["track_id"],
        "level":              s["level"],
        "overall_passed":     overall_passed,
        "questions_passed":   questions_passed,
        "questions_total":    len(questions),
        "pass_threshold":     f"{int(pass_threshold * 100)}%",
        "xp_earned":          xp_earned,
        "question_results":   question_results,
        "started_at":         s.get("started_at"),
        "completed_at":       s.get("completed_at"),
        "status":             s["status"],
    })
