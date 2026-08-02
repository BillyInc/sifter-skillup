-- ============================================================
-- Sifter Skill_Up — Offline-sync idempotency + atomic level progress
-- Run AFTER migration_v2.sql and migration_v2_atomic.sql
-- Wrapped in a transaction so partial failure leaves no orphans.
--
-- WHY THIS EXISTS
-- ---------------
-- `try_award_offline_xp(p_user_id, p_request, p_max)` grants XP atomically
-- with respect to the daily cap, but it has no idempotency key. The caller
-- (services/offline_sync.py) recorded the "this queue item was applied"
-- marker in `sync_log` as a SEPARATE statement AFTER the grant committed.
-- Any failure in that window (process crash, network blip, a raising insert
-- into xp_events) left XP granted but no ledger row, so the client's retry of
-- the same queue item was seen as brand new and the XP was granted a second
-- time. Two concurrent drains of the same item raced the same way (TOCTOU).
--
-- The fix: move the `sync_log` insert INSIDE the same function/transaction as
-- the points update. The UNIQUE(item_id, user_id) constraint then becomes the
-- authoritative, race-free "exactly once" gate — a losing INSERT means the
-- grant already happened, and we return 0 without touching points.
--
-- NOTE: this file is intentionally NOT applied by the change author. Apply it
-- with the same process used for the other migration_*.sql files.
-- ============================================================
BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. Idempotent, capped offline XP grant
--
-- p_item_id is the idempotency key. It is NOT required to be the client's
-- queue-item UUID: for events that represent a real, non-repeatable domain
-- fact (completing level N) the caller passes a server-derived natural key
-- (uuid5 of user_id + endpoint + level), so a client that mints a fresh queue
-- UUID cannot replay the event.
--
-- Returns JSONB so the caller can distinguish the three outcomes that all
-- previously collapsed to "0":
--   {"granted": N,  "already_applied": false, "capped": false}  → paid N
--   {"granted": 0,  "already_applied": true,  "capped": false}  → duplicate,
--        already paid earlier; caller should report success, not retry
--   {"granted": 0,  "already_applied": false, "capped": true}   → daily cap
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION skillup_dev.try_award_offline_xp_idem(
    p_user_id  UUID,
    p_item_id  TEXT,
    p_endpoint TEXT,
    p_request  INTEGER,
    p_max      INTEGER DEFAULT 5000
) RETURNS JSONB AS $$
DECLARE
    v_current  INTEGER;
    v_grant    INTEGER;
    v_inserted INTEGER;
    v_points   INTEGER;
BEGIN
    IF p_item_id IS NULL OR length(p_item_id) = 0 THEN
        RAISE EXCEPTION 'try_award_offline_xp_idem requires a non-empty p_item_id';
    END IF;

    -- ── The idempotency gate ──────────────────────────────────
    -- Claim the ledger row FIRST, in this same transaction. If another drain
    -- (or an earlier attempt of this one) already claimed it, ON CONFLICT DO
    -- NOTHING inserts zero rows and we bail out without granting anything.
    -- Because the row and the points update commit together, there is no
    -- window in which XP is paid but the ledger is missing.
    INSERT INTO skillup_dev.sync_log(item_id, user_id, endpoint)
        VALUES (p_item_id, p_user_id, COALESCE(p_endpoint, 'unknown'))
        ON CONFLICT (item_id, user_id) DO NOTHING;
    GET DIAGNOSTICS v_inserted = ROW_COUNT;

    IF v_inserted = 0 THEN
        SELECT points INTO v_points FROM skillup_dev.users WHERE id = p_user_id;
        RETURN jsonb_build_object(
            'granted', 0, 'already_applied', true, 'capped', false,
            'new_points', COALESCE(v_points, 0)
        );
    END IF;

    -- A zero/negative request still consumes the idempotency key above: the
    -- item is genuinely "applied", it just pays nothing.
    IF p_request IS NULL OR p_request <= 0 THEN
        SELECT points INTO v_points FROM skillup_dev.users WHERE id = p_user_id;
        RETURN jsonb_build_object(
            'granted', 0, 'already_applied', false, 'capped', false,
            'new_points', COALESCE(v_points, 0)
        );
    END IF;

    -- ── Daily cap check + grant (unchanged semantics) ─────────
    INSERT INTO skillup_dev.daily_xp_caps(user_id, cap_date, xp_offline)
        VALUES (p_user_id, CURRENT_DATE, 0)
        ON CONFLICT (user_id, cap_date) DO NOTHING;

    SELECT xp_offline INTO v_current
      FROM skillup_dev.daily_xp_caps
     WHERE user_id = p_user_id AND cap_date = CURRENT_DATE
       FOR UPDATE;

    v_grant := LEAST(p_request, GREATEST(p_max - v_current, 0));

    IF v_grant > 0 THEN
        UPDATE skillup_dev.daily_xp_caps
           SET xp_offline = v_current + v_grant
         WHERE user_id = p_user_id AND cap_date = CURRENT_DATE;

        UPDATE skillup_dev.users
           SET points = points + v_grant
         WHERE id = p_user_id
        RETURNING points INTO v_points;
    ELSE
        -- Capped. Release the idempotency key so a later drain (tomorrow, or
        -- after the cap resets) can still pay for this item; the caller
        -- reports REJECTED and the client drops it, but we must not leave a
        -- ledger row claiming we paid when we did not.
        DELETE FROM skillup_dev.sync_log
         WHERE item_id = p_item_id AND user_id = p_user_id;
        SELECT points INTO v_points FROM skillup_dev.users WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object(
        'granted', v_grant,
        'already_applied', false,
        'capped', (v_grant = 0),
        'new_points', COALESCE(v_points, 0)
    );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '';


-- ─────────────────────────────────────────────────────────────
-- 2. Atomic level-progress append
--
-- Replaces the read-modify-write in _handle_complete_level, which read
-- completed_levels/perfect_levels from a request-scoped user snapshot,
-- appended in Python and wrote the whole array back — so two concurrent
-- drains each clobbered the other's level.
--
-- Both arrays are TEXT[] (see supabase-schema.sql). The CASE guards keep the
-- append set-like, so calling this repeatedly is harmless.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION skillup_dev.append_user_level_progress(
    p_user_id    UUID,
    p_level      TEXT,
    p_perfect    BOOLEAN DEFAULT false,
    p_next_level INTEGER DEFAULT NULL,
    p_track      TEXT    DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_points        INTEGER;
    v_current_level INTEGER;
BEGIN
    UPDATE skillup_dev.users
       SET completed_levels = CASE
               WHEN completed_levels @> ARRAY[p_level]
                   THEN completed_levels
               ELSE array_append(completed_levels, p_level)
           END,
           perfect_levels = CASE
               WHEN p_perfect AND NOT (perfect_levels @> ARRAY[p_level])
                   THEN array_append(perfect_levels, p_level)
               ELSE perfect_levels
           END,
           current_level = GREATEST(current_level, COALESCE(p_next_level, current_level)),
           active_track  = COALESCE(p_track, active_track)
     WHERE id = p_user_id
    RETURNING points, current_level INTO v_points, v_current_level;

    RETURN jsonb_build_object(
        'new_points',    COALESCE(v_points, 0),
        'current_level', COALESCE(v_current_level, 1)
    );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '';


-- Duplicate-safe lookups of the natural keys written by the RPC above.
CREATE INDEX IF NOT EXISTS idx_sync_log_item_user
    ON skillup_dev.sync_log(item_id, user_id);

COMMIT;
