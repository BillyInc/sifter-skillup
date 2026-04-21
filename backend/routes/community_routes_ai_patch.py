"""
community_routes_ai_patch.py

Patch for the /api/ai/score endpoint in community_routes.py.

CHANGE: Replaces the Anthropic Claude call with deterministic scoring.
No ANTHROPIC_API_KEY needed. No hallucination risk.

TO APPLY:
  In community_routes.py, find the score_simulator function
  (decorated with @ai_router.post("/api/ai/score")) and replace
  the entire function body with the one below.

  Also add at the top of community_routes.py:
    from deterministic_score import score_response as _det_score

The endpoint contract is unchanged — same request/response shape.
Existing clients (JudgmentRenderer, SimulatorShared.scoreWithClaude)
continue to work with zero client-side changes.
"""

# ── REPLACEMENT FUNCTION ──────────────────────────────────────────────────────
# Replace the existing score_simulator function body in community_routes.py:

REPLACEMENT_FUNCTION = '''
from deterministic_score import score_response as _det_score

@ai_router.post("/api/ai/score", response_model=ResponseModel)
async def score_simulator(
    body: AIScoreRequest,
    current_user: dict = Depends(Auth.get_current_user),
):
    """
    Deterministic simulator scoring. Zero AI API dependency.
    Scores user responses against criteria using number matching,
    keyword extraction, and calculation checking.

    Request/response contract unchanged from the AI version.
    """
    # Input sanitisation (same as before)
    scenario      = body.scenario[:4000]
    user_response = body.userResponse[:3000]
    criteria      = [c[:300] for c in (body.criteria or [])[:20]]

    if not criteria:
        raise HTTPException(400, "criteria must not be empty")

    result = _det_score(user_response, criteria)

    # Shape the response to match the existing ScoringResult interface
    # that the frontend expects
    return ResponseModel(data={
        "criteriaResults": [
            {
                "criterion": r["criterion"],
                "passed":    r["passed"],
                "feedback":  r["feedback"],
            }
            for r in result["criteriaResults"]
        ],
        "overallFeedback": result["overallFeedback"],
        "score":           result["score"],
        "total":           result["total"],
        "xpEarned":        result["xpEarned"],
    })
'''

# ── main.py PATCH ─────────────────────────────────────────────────────────────
# Add these lines to main.py after the existing interview_routes include:

MAIN_PY_ADDITIONS = '''
from boss_routes import router as boss_router
app.include_router(boss_router)
'''

# ── WHAT TO VERIFY AFTER APPLYING ────────────────────────────────────────────
VERIFICATION = """
After applying this patch:

1. Verify the score endpoint works without ANTHROPIC_API_KEY:
   curl -X POST /api/ai/score \\
     -H "Authorization: Bearer [jwt]" \\
     -H "Content-Type: application/json" \\
     -d '{
       "scenario": "A pool has $10M deposited and $8M borrowed.",
       "criteria": ["Utilisation: $8M/$10M = 80%"],
       "userResponse": "The utilisation rate is 80%."
     }'

   Expected: {"data": {"criteriaResults": [{"passed": true, ...}], "score": 1, "total": 1, ...}}
   This should work WITHOUT setting ANTHROPIC_API_KEY in environment.

2. Verify boss routes:
   POST /api/boss/start  — should create a session
   POST /api/boss/answer — should score and return result
   GET  /api/boss/{id}   — should return session with answers

3. Verify interview routes:
   POST /api/interview/start  — should return questions from skillup_dev.interview_questions
   (Run interview_questions_seed.sql first)
"""

if __name__ == "__main__":
    print(REPLACEMENT_FUNCTION)
    print("\n\n# Add to main.py:")
    print(MAIN_PY_ADDITIONS)
    print(VERIFICATION)
