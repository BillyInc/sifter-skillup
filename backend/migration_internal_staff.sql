-- ============================================================
-- SIFTER LEVELUP — INTERNAL STAFF FLAG (spec §7.8/§6A.4/§6A.5)
-- Schema: skillup_dev
-- Additive migration: adds users.is_internal_staff, the gate for
-- Sifter-team-only tooling (e.g. GET /api/feedback inbox).
-- NOTE: the spec text says `profiles`, but this codebase's auth
-- layer loads the current user from skillup_dev.users
-- (auth.py get_current_user), so the column lives there.
-- Defaults false: nobody gains access until explicitly granted.
-- Idempotent: safe to re-run (IF NOT EXISTS everywhere).
-- ============================================================

-- ── 1. COLUMN: users.is_internal_staff ──────────────────────────────
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS is_internal_staff BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- END migration_internal_staff.sql
-- ============================================================
