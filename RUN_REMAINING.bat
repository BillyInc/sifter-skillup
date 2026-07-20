@echo off
REM ============================================================
REM RUN_REMAINING.bat — the manual completion chain (2026-07-20)
REM Runs everything still pending EXCEPT API data fetching.
REM Run from repo root:  .\RUN_REMAINING.bat
REM ============================================================
setlocal
cd /d "%~dp0"

echo === 1/6: tools leakage audit ================================
python data\career-mapping\_audit_tools_leakage.py || goto :fail

echo.
echo === 2/6: subject parser (cross-ref + typo extension) ========
python data\career-mapping\_parse_subject_options.py || goto :fail

echo.
echo === 3/6: regenerate v2 seed (leakage DELETEs + drop-list) ===
python data\career-mapping\_gen_career_seed.py || goto :fail

echo.
echo === 4/6: regenerate enrichment seed (cutoff backfill fix) ===
python data\career-mapping\_gen_enrichment_seed.py || goto :fail

echo.
echo === 5/6: TypeScript check (Phase-7 wiring) ==================
call npx tsc --noEmit || goto :fail

echo.
echo === 6/6: live DB verification ===============================
python backend\_verify_seed.py
echo (failures above are EXPECTED until you re-apply the SQL below)

echo.
echo ================================================================
echo DONE. Now re-apply these 4 files to Supabase (psql) IN ORDER:
echo   1. backend\seed_career_v2.sql          (leakage cleanup + tools)
echo   2. backend\seed_phase8_9_enrichment.sql (cutoff backfill fix)
echo   3. backend\seed_subject_options.sql     (better parse coverage)
echo   4. backend\repair_demand_fkeys.sql      (if not applied yet)
echo Then run:  python backend\_verify_seed.py   (expect all PASS)
echo ================================================================
goto :eof

:fail
echo *** FAILED at the step above - paste the output to Claude. ***
exit /b 1
