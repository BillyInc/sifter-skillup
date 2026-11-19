-- ============================================================
-- PROPOSED, NOT APPLIED.
-- My World collections (slice 1): named collections of saved items.
--
-- Prepared for manual review and application by the owner. It must run after
-- skillup_dev.users and skillup_dev.saved_items exist
-- (migration_career_v2.sql, migration_saved_resource_support.sql).
--
-- Design rules
--   * saved_items stays the single canonical per-user reference. A collection
--     only links to it, so one saved item can sit in several collections
--     without duplicating any record.
--   * Deleting a collection, or removing an item from a collection, deletes
--     only the join row. It never deletes the saved item and never touches a
--     canonical programme, role or task item.
--   * Deleting a saved item (existing DELETE /api/career/saved/{id}) cascades
--     its collection memberships, which is the intended behaviour.
--   * Deleting the user row cascades collections and memberships. The soft
--     account delete in main.py also purges them explicitly.
--   * Additive and idempotent: safe to re-run. No seed data. No starter
--     collection is created here; starters are offered by the API and only
--     created when the student chooses one.
--   * Ownership is enforced in FastAPI (service-role client). RLS is enabled
--     with no client policies and anon/authenticated grants are revoked, so
--     direct client access is denied.
-- ============================================================
BEGIN;

SET search_path TO skillup_dev, public;

CREATE TABLE IF NOT EXISTS skillup_dev.collections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
    kind        TEXT NOT NULL DEFAULT 'custom' CHECK (kind IN ('custom', 'starter', 'pathway')),
    starter_key TEXT,
    sort_index  INTEGER NOT NULL DEFAULT 0,
    archived_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Names are unique per student, ignoring case, among non-archived collections.
CREATE UNIQUE INDEX IF NOT EXISTS uq_collections_user_name
    ON skillup_dev.collections (user_id, lower(name))
    WHERE archived_at IS NULL;
-- A starter suggestion can be accepted once per student.
CREATE UNIQUE INDEX IF NOT EXISTS uq_collections_user_starter
    ON skillup_dev.collections (user_id, starter_key)
    WHERE starter_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collections_user
    ON skillup_dev.collections (user_id, sort_index, created_at);

CREATE TABLE IF NOT EXISTS skillup_dev.collection_items (
    collection_id UUID NOT NULL REFERENCES skillup_dev.collections(id) ON DELETE CASCADE,
    saved_item_id UUID NOT NULL REFERENCES skillup_dev.saved_items(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL DEFAULT 0,
    note          TEXT CHECK (note IS NULL OR char_length(note) <= 500),
    added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (collection_id, saved_item_id)
);
CREATE INDEX IF NOT EXISTS idx_collection_items_order
    ON skillup_dev.collection_items (collection_id, position);
CREATE INDEX IF NOT EXISTS idx_collection_items_saved
    ON skillup_dev.collection_items (saved_item_id);

-- Where the student saved the item from (programme page, role page, ...).
-- Nullable and not written by slice 1; reserved for pathway/source-context
-- slices. Additive: existing rows and clients are unaffected.
ALTER TABLE skillup_dev.saved_items
    ADD COLUMN IF NOT EXISTS source_context JSONB;

ALTER TABLE skillup_dev.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.collection_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE skillup_dev.collections FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.collection_items FROM anon, authenticated;

COMMIT;

-- ============================================================
-- END migration_my_world_collections_2026-11-19.sql
-- Post-apply checks (read-only):
--   SELECT count(*) FROM skillup_dev.collections;       -- expect 0 on first apply
--   SELECT count(*) FROM skillup_dev.collection_items;  -- expect 0 on first apply
--   SELECT column_name FROM information_schema.columns
--    WHERE table_schema='skillup_dev' AND table_name='saved_items'
--      AND column_name='source_context';
-- ============================================================
