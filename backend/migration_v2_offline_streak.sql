-- ============================================================
-- Sifter Skill_Up — Server-authoritative streak advance
-- Run AFTER migration_v2_atomic.sql and migration_v2_offline_idempotency.sql
-- Wrapped in a transaction so partial failure leaves no orphans.
--
-- WHY THIS EXISTS
-- ---------------
-- `_handle_streak_check` in services/offline_sync.py computed the streak in
-- Python from a CLIENT-SUPPLIED date (`body["date"]`), then wrote streak,
-- last_played and points back in one UPDATE built from a stale SELECT. Three
-- consequences:
--
--   1. The client chose the date the streak was computed from, so it could
--      fabricate a qualifying one-day gap and inflate its streak arbitrarily.
--   2. The bonus was derived from the CURRENT streak value rather than from
--      whether the streak advanced, so replaying a same-day check paid the
--      full bonus again — unbounded with a fresh queue-item id per replay.
--   3. points were read-modify-written outside the XP cap machinery, losing
--      concurrent updates and bypassing daily_xp_caps entirely.
--
-- `touch_user_streak` (migration_v2_atomic.sql) already fixes (1) by using
-- CURRENT_DATE under a row lock, but it does not tell the caller WHETHER the
-- streak advanced — which is exactly the fact needed to decide whether a bonus
-- is owed. This function is that one, plus a JSONB shape consistent with
-- try_award_offline_xp_idem. `touch_user_streak` is left in place untouched
-- for its existing online callers.
--
-- Points are deliberately NOT touched here: the bonus is paid by
-- try_award_offline_xp_idem, keyed on (user, endpoint, streak day), so it is
-- capped and earnable at most once per streak-day.
--
-- STATUS: applied to the DEV database (billy / igvizqgbrxmdtyaujbxu, schema
-- skillup_dev) on 2026-08-02 as migration `v2_offline_streak`. NOT yet applied
-- to prod (vkgfw) — that has to happen before this branch's code is deployed
-- there, or the offline streak endpoint fails.
-- ============================================================
BEGIN;

-- ─────────────────────────────────────────────────────────────
-- Atomic streak advance, server-side date, with an `advanced` flag.
--
-- Returns JSONB:
--   {"streak": N, "last_played": "YYYY-MM-DD",
--    "advanced": true|false, "previous_last_played": "YYYY-MM-DD"|null}
--
-- advanced = false  → last_played was already today; the caller must NOT pay a
--                     streak bonus (this is the replay case).
-- advanced = true   → last_played moved to a new day; streak is the new value
--                     and the caller may pay STREAK_BONUS[streak - 1] once,
--                     idempotently keyed on last_played.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION skillup_dev.touch_user_streak_v2(
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_today    DATE := CURRENT_DATE;
    v_streak   INTEGER;
    v_last     DATE;
    v_advanced BOOLEAN;
BEGIN
    -- FOR UPDATE serialises concurrent drains of the same user, so two devices
    -- draining at once cannot both observe "yesterday" and each add one.
    SELECT u.streak, u.last_played INTO v_streak, v_last
      FROM skillup_dev.users u
     WHERE u.id = p_user_id
       FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'touch_user_streak_v2: no such user %', p_user_id;
    END IF;

    v_streak := COALESCE(v_streak, 0);

    IF v_last = v_today THEN
        -- Already counted today. Nothing moves, nothing is owed.
        v_advanced := false;
        v_streak   := GREATEST(v_streak, 1);
    ELSIF v_last = v_today - 1 THEN     -- date - int stays DATE; INTERVAL would
                                        -- promote both sides to TIMESTAMP
        v_advanced := true;
        v_streak   := v_streak + 1;
    ELSE
        -- Gap of 2+ days, or last_played is NULL on a legacy row. (In the
        -- current schema last_played is NOT NULL DEFAULT CURRENT_DATE, so a
        -- brand-new user takes the same-day branch above and is not owed a
        -- bonus for the day they signed up.)
        v_advanced := true;
        v_streak   := 1;
    END IF;

    IF v_advanced THEN
        UPDATE skillup_dev.users
           SET streak      = v_streak,
               last_played = v_today
         WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object(
        'streak',               v_streak,
        'last_played',          v_today,
        'advanced',             v_advanced,
        'previous_last_played', v_last
    );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '';

COMMIT;
