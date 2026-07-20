@echo off
REM ============================================================
REM SIFTER LEVELUP — FULL SEED PIPELINE (run from repo root)
REM   RUN_PIPELINE.bat            -> runs data fixes + regenerates every seed
REM   RUN_PIPELINE.bat check      -> only row-counts the live Supabase tables
REM
REM After it finishes, apply the SQL files to Supabase yourself in the
REM printed order (SQL editor or psql). Nothing here touches the database.
REM ============================================================
setlocal
cd /d "%~dp0"

if "%1"=="check" goto :check

echo === Phase 0: live DB row counts (read-only) ==================
python backend\_check_db_state.py
if errorlevel 1 echo (DB check failed - continuing with offline generation)

echo.
echo === Phase 1a: fill 63 missing subgroup cluster_skills ========
python data\career-mapping\_fix_l2_subgroups.py || goto :fail

echo.
echo === Phase 1b: build role-level tools (L3T) ===================
python data\career-mapping\_build_role_tools.py || goto :fail

echo.
echo === Phase 1b2: tools leakage audit (cross-domain artifacts) ==
python data\career-mapping\_audit_tools_leakage.py || goto :fail

echo.
echo === Phase 1c: regenerate REAL ESCO skill URIs ================
python data\career-mapping\_regen_skill_uris.py || goto :fail

echo.
echo === Phase 3a: regenerate pilot seed (offerings + enrich) =====
python data\career-mapping\_gen_seed.py || goto :fail

echo.
echo === Phase 3b: regenerate career v2 seed (uni scope + L3T) ====
python data\career-mapping\_gen_career_seed.py || goto :fail

echo.
echo === Phase 3c: regenerate enrichment seed (real URIs) =========
python data\career-mapping\_gen_enrichment_seed.py || goto :fail

echo.
echo === Phase 2: derived demand baseline =========================
python data\career-mapping\_market_intelligence\gen_demand_baseline.py || goto :fail

echo.
echo === Phase 3d: parse subject requirements (SS3 match door) ====
python data\career-mapping\_parse_subject_options.py || goto :fail

echo.
echo ================================================================
echo DONE. Apply these to Supabase (SQL editor or psql) IN THIS ORDER.
echo.
echo *** WARNING: migration_career_v2.sql DROPS and recreates the ***
echo *** taxonomy tables. NEVER re-apply it after seeding unless  ***
echo *** you immediately re-apply migration_role_tools.sql +      ***
echo *** seed_career_v2.sql + seed_phase8_9_enrichment.sql +      ***
echo *** repair_demand_fkeys.sql afterwards.                      ***
echo.
echo Other migrations are idempotent - safe to re-run anytime.
echo   1. backend\migration_career_pilot.sql
echo   2. backend\migration_career_v2.sql
echo   3. backend\migration_enrichment_v1.sql
echo   4. backend\migration_admission_intelligence.sql
echo   5. backend\migration_student_pipeline_live.sql
echo   6. backend\migration_market_intelligence_v1.sql
echo   7. backend\migration_institution_team_access.sql
echo   8. backend\migration_role_tools.sql            (NEW - always run)
echo   8b. backend\migration_phase7_content.sql       (NEW - always run)
echo   9. backend\seed_career_pilot.sql
echo  10. backend\seed_career_v2.sql
echo  11. backend\seed_phase8_9_enrichment.sql
echo  12. backend\seed_subject_catalog.sql
echo  13. backend\seed_demand_baseline.sql
echo  14. backend\seed_subject_options.sql          (needs 9 + 12 first)
echo.
echo Then verify:  RUN_PIPELINE.bat check
echo ================================================================
goto :eof

:check
echo === Live DB row counts (read-only) ===========================
python backend\_check_db_state.py
echo.
echo === Seed verification (counts vs sources) ====================
python backend\_verify_seed.py
echo.
echo === TypeScript check (feedback enum fix) =====================
call npx tsc --noEmit
goto :eof

:fail
echo.
echo *** PIPELINE FAILED at the step above - fix and re-run. ***
exit /b 1
