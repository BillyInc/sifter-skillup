"""
boss_routes.py
Sifter LevelUp — Boss Mode Routes

Routes:
  POST  /api/boss/start          — begin a boss session (Phase 1 or Phase 2)
  POST  /api/boss/answer         — submit one task answer, score it immediately
  GET   /api/boss/{session_id}   — get full session with all answers and results
  POST  /api/boss/{session_id}/complete  — finalise session, award XP and badge

Schema: skillup_dev

Tables used:
  skillup_dev.boss_sessions     — session records
  skillup_dev.boss_answers      — per-task answers with scoring
  skillup_dev.user_badges       — badge awards on completion
  skillup_dev.xp_events         — XP awards on completion
"""

import random
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
from utils.deterministic_score import score_response, extract_criteria_from_task

router = APIRouter(prefix="/api/boss", tags=["boss"])
boss_router = router


# ─── Models ────────────────────────────────────────────────────────────────────

class BossStartRequest(BaseModel):
    lab_id: str
    track_id: str
    phase: int                      # 1 or 2
    task_pool: List[str]           # Phase 1: list of task strings
    draw_count: int                # how many to draw (Phase 1: 8-10)
    pass_threshold: float          # 0.7 or 0.8
    hints_enabled: bool
    # Phase 2 specific:
    scenario: Optional[str] = None
    scoring_criteria: Optional[List[str]] = None
    attempt_number: Optional[int] = 1


class BossAnswerRequest(BaseModel):
    session_id: str
    task_index: int
    task_text: str                 # echoed back from client for verification
    answer: str
    # Optional explicit criteria (Phase 2 has authored criteria)
    scoring_criteria: Optional[List[str]] = None


class BossCompleteRequest(BaseModel):
    session_id: str


# ─── Seeded draw ─────────────────────────────────────────────────────────────

def seeded_draw(pool: List[str], count: int, seed: int) -> List[Dict]:
    """Draw `count` items from pool using a deterministic seed."""
    indexed = [{'text': t, 'original_index': i} for i, t in enumerate(pool)]
    # Seeded Fisher-Yates using Python's seeded Random
    rng = random.Random(seed)
    rng.shuffle(indexed)
    return indexed[:min(count, len(indexed))]


# ─── Routes ────────────────────────────────────────────────────────────────────

@router.post("/start", response_model=ResponseModel)
async def start_boss_session(
    body: BossStartRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Start a Phase 1 or Phase 2 boss session.

    Phase 1: draws tasks from pool using seeded shuffle
    Phase 2: creates session with the authored scenario + scoring_criteria
    """
    session_id = str(uuid.uuid4())

    if body.phase == 1:
        # Draw tasks
        seed = sum(ord(c) for c in body.lab_id) + (body.attempt_number or 1) * 997
        drawn = seeded_draw(body.task_pool, body.draw_count, seed)
        tasks = [{'index': i, 'text': t['text'], 'original_index': t['original_index']} for i, t in enumerate(drawn)]
        session_data = {
            'id': session_id,
            'user_id': current_user['id'],
            'lab_id': body.lab_id,
            'track_id': body.track_id,
            'phase': 1,
            'tasks': tasks,
            'answers': [],
            'pass_threshold': body.pass_threshold,
            'hints_enabled': body.hints_enabled,
            'attempt_number': body.attempt_number or 1,
            'status': 'in_progress',
            'started_at': datetime.utcnow().isoformat(),
        }
        first_task = tasks[0] if tasks else None
        response_data = {
            'session_id': session_id,
            'phase': 1,
            'task_count': len(tasks),
            'current_task': first_task,
            'pass_threshold': body.pass_threshold,
            'hints_enabled': body.hints_enabled,
        }

    elif body.phase == 2:
        if not body.scenario or not body.scoring_criteria:
            raise HTTPException(400, "Phase 2 requires scenario and scoring_criteria")
        session_data = {
            'id': session_id,
            'user_id': current_user['id'],
            'lab_id': body.lab_id,
            'track_id': body.track_id,
            'phase': 2,
            'scenario': body.scenario,
            'scoring_criteria': body.scoring_criteria,
            'answers': [],
            'pass_threshold': body.pass_threshold,
            'hints_enabled': False,
            'attempt_number': body.attempt_number or 1,
            'status': 'in_progress',
            'started_at': datetime.utcnow().isoformat(),
        }
        response_data = {
            'session_id': session_id,
            'phase': 2,
            'scenario': body.scenario,
            'criteria_count': len(body.scoring_criteria),
            'pass_threshold': body.pass_threshold,
        }
    else:
        raise HTTPException(400, f"Invalid phase: {body.phase}. Must be 1 or 2.")

    # Store session in Supabase
    db.get_service_client() \
        .schema('skillup_dev') \
        .table('boss_sessions') \
        .insert(session_data) \
        .execute()

    log.info(
        'Boss session started',
        user_id=current_user['id'],
        lab_id=body.lab_id,
        phase=body.phase,
        session_id=session_id,
    )

    return ResponseModel(data=response_data)


@router.post("/answer", response_model=ResponseModel)
async def submit_boss_answer(
    body: BossAnswerRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Submit an answer to one boss task. Score it deterministically on receipt.
    Returns immediate scoring result so user sees feedback before next task.
    """
    session_result = db.get_service_client() \
        .schema('skillup_dev') \
        .table('boss_sessions') \
        .select('*') \
        .eq('id', body.session_id) \
        .eq('user_id', current_user['id']) \
        .execute()

    if not session_result.data:
        raise HTTPException(404, "Boss session not found")

    session = session_result.data[0]
    if session['status'] != 'in_progress':
        raise HTTPException(400, "Boss session already completed")

    # Determine criteria
    if body.scoring_criteria:
        criteria = body.scoring_criteria
    elif session['phase'] == 2:
        criteria = session.get('scoring_criteria', [])
    else:
        # Phase 1: extract criteria from the task text
        criteria = extract_criteria_from_task(body.task_text)

    # Score immediately
    scoring = score_response(body.answer, criteria)

    # For Phase 1: auto-pass self_assess criteria if response has sufficient length
    if session['phase'] == 1:
        word_count = len(body.answer.split())
        has_numbers = bool(re.search(r'\d', body.answer))
        quality_ok = word_count >= 15 and has_numbers
        updated_results = []
        for cr in scoring['criteriaResults']:
            if cr['type'] == 'self_assess' and quality_ok:
                updated_results.append({**cr, 'passed': True, 'feedback': '✓ Response demonstrates engagement with the task.'})
            else:
                updated_results.append(cr)
        scoring['criteriaResults'] = updated_results
        scoring['score'] = sum(1 for r in updated_results if r['passed'])
        task_pct = scoring['score'] / scoring['total'] if scoring['total'] > 0 else 0
        scoring['passed'] = task_pct >= 0.6

    # Store answer
    answer_record = {
        'session_id': body.session_id,
        'task_index': body.task_index,
        'task_text': body.task_text[:500],  # truncate for storage
        'answer': body.answer,
        'criteria': criteria,
        'score': scoring['score'],
        'total': scoring['total'],
        'passed': scoring['passed'],
        'criteria_results': scoring['criteriaResults'],
        'answered_at': datetime.utcnow().isoformat(),
    }

    answers = session.get('answers', [])
    answers.append(answer_record)

    # Determine if session is complete
    phase = session['phase']
    tasks = session.get('tasks', [])
    is_complete = (phase == 2) or (len(answers) >= len(tasks))
    new_status = 'completed' if is_complete else 'in_progress'

    # Determine next task for Phase 1
    next_task = None
    if not is_complete and tasks and len(answers) < len(tasks):
        next_task = tasks[len(answers)]

    db.get_service_client() \
        .schema('skillup_dev') \
        .table('boss_sessions') \
        .update({
            'answers': answers,
            'status': new_status,
            **({'completed_at': datetime.utcnow().isoformat()} if is_complete else {}),
        }) \
        .eq('id', body.session_id) \
        .execute()

    return ResponseModel(data={
        'session_id': body.session_id,
        'task_index': body.task_index,
        'is_complete': is_complete,
        'this_answer': {
            'passed': scoring['passed'],
            'score': scoring['score'],
            'total': scoring['total'],
            'criteria_results': scoring['criteriaResults'],
            'overall_feedback': scoring['overallFeedback'],
        },
        'next_task': next_task,
        'answers_submitted': len(answers),
    })


@router.get("/{session_id}", response_model=ResponseModel)
async def get_boss_session(
    session_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Get full session data including all answers and per-task results.
    Used by the summary screen after all tasks are complete.
    """
    session_result = db.get_service_client() \
        .schema('skillup_dev') \
        .table('boss_sessions') \
        .select('*') \
        .eq('id', session_id) \
        .eq('user_id', current_user['id']) \
        .execute()

    if not session_result.data:
        raise HTTPException(404, "Boss session not found")

    session = session_result.data[0]
    answers = session.get('answers', [])
    tasks = session.get('tasks', [])
    pass_threshold = session.get('pass_threshold', 0.7)

    # Compute summary
    if session['phase'] == 1:
        tasks_passed = sum(1 for a in answers if a.get('passed', False))
        total_tasks = len(tasks)
        overall_passed = (tasks_passed / total_tasks) >= pass_threshold if total_tasks > 0 else False
        xp_earned = 200 if overall_passed else 0
    else:
        # Phase 2: single scenario, check criteria score
        last_answer = answers[-1] if answers else {}
        criteria_score = last_answer.get('score', 0)
        criteria_total = last_answer.get('total', 1)
        overall_passed = (criteria_score / criteria_total) >= pass_threshold if criteria_total > 0 else False
        tasks_passed = 1 if overall_passed else 0
        total_tasks = 1
        xp_earned = 500 if overall_passed else 0

    return ResponseModel(data={
        'session_id': session_id,
        'lab_id': session['lab_id'],
        'track_id': session['track_id'],
        'phase': session['phase'],
        'status': session['status'],
        'overall_passed': overall_passed,
        'tasks_passed': tasks_passed,
        'tasks_total': total_tasks,
        'pass_threshold': pass_threshold,
        'xp_earned': xp_earned,
        'answers': answers,
        'started_at': session.get('started_at'),
        'completed_at': session.get('completed_at'),
    })


@router.post("/{session_id}/complete", response_model=ResponseModel)
async def complete_boss_session(
    session_id: str,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Finalise a completed boss session.
    Awards XP and badge if passed. Records portfolio push eligibility.
    """
    session_result = db.get_service_client() \
        .schema('skillup_dev') \
        .table('boss_sessions') \
        .select('*') \
        .eq('id', session_id) \
        .eq('user_id', current_user['id']) \
        .execute()

    if not session_result.data:
        raise HTTPException(404, "Boss session not found")

    session = session_result.data[0]

    if session['status'] not in ('completed', 'in_progress'):
        raise HTTPException(400, "Session cannot be completed in its current state")

    answers = session.get('answers', [])
    tasks = session.get('tasks', [])
    pass_threshold = session.get('pass_threshold', 0.7)
    phase = session['phase']

    # Calculate pass
    if phase == 1:
        tasks_passed = sum(1 for a in answers if a.get('passed', False))
        total_tasks = len(tasks)
        overall_passed = (tasks_passed / total_tasks) >= pass_threshold if total_tasks > 0 else False
        xp = 200 if overall_passed else 50
    else:
        last_answer = answers[-1] if answers else {}
        criteria_score = last_answer.get('score', 0)
        criteria_total = last_answer.get('total', 1)
        overall_passed = (criteria_score / criteria_total) >= pass_threshold if criteria_total > 0 else False
        xp = 500 if overall_passed else 100

    # Update session
    db.get_service_client() \
        .schema('skillup_dev') \
        .table('boss_sessions') \
        .update({
            'status': 'completed',
            'overall_passed': overall_passed,
            'xp_earned': xp,
            'completed_at': datetime.utcnow().isoformat(),
        }) \
        .eq('id', session_id) \
        .execute()

    # Award XP
    if xp > 0:
        db.get_service_client() \
            .schema('skillup_dev') \
            .table('xp_events') \
            .insert({
                'id': str(uuid.uuid4()),
                'user_id': current_user['id'],
                'event_type': f'boss_phase{phase}_{"pass" if overall_passed else "attempt"}',
                'xp_delta': xp,
                'metadata': {
                    'lab_id': session['lab_id'],
                    'track_id': session['track_id'],
                    'session_id': session_id,
                    'phase': phase,
                },
                'created_at': datetime.utcnow().isoformat(),
            }) \
            .execute()

    # Award badge on Phase 2 pass
    if overall_passed and phase == 2:
        badge_id = f"{session['lab_id']}-phase2-certified"
        try:
            db.get_service_client() \
                .schema('skillup_dev') \
                .table('user_badges') \
                .insert({
                    'id': str(uuid.uuid4()),
                    'user_id': current_user['id'],
                    'badge_id': badge_id,
                    'awarded_at': datetime.utcnow().isoformat(),
                    'source': 'boss_phase2',
                    'source_id': session_id,
                }) \
                .execute()
        except Exception:
            pass  # Badge may already exist (duplicate protection)

    log.info(
        'Boss session completed',
        user_id=current_user['id'],
        lab_id=session['lab_id'],
        phase=phase,
        passed=overall_passed,
        xp=xp,
    )

    return ResponseModel(data={
        'session_id': session_id,
        'overall_passed': overall_passed,
        'xp_earned': xp,
        'phase2_unlocked': overall_passed and phase == 1,
        'portfolio_push_eligible': overall_passed and phase == 2,
        'badge_awarded': overall_passed and phase == 2,
    })
