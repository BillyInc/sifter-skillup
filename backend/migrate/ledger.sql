-- ============================================================
-- PROPOSED, NOT APPLIED
-- Migration ledger table (bootstrap for `python -m migrate apply`).
-- Schema: skillup_dev
--
-- The runner executes this file itself, as its own transaction, the first time
-- `apply --apply` runs against a database with no ledger (and only then; it is
-- idempotent). Nothing here has been run against any database. Applying it by
-- hand in the SQL Editor is equivalent.
-- ============================================================
BEGIN;

CREATE TABLE IF NOT EXISTS skillup_dev.schema_migrations (
  id               TEXT PRIMARY KEY,
  checksum         TEXT NOT NULL,
  kind             TEXT NOT NULL DEFAULT 'applied' CHECK (kind IN ('applied', 'baseline')),
  applied_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  operator         TEXT,
  preflight_sha256 TEXT,
  approval_ref     TEXT,
  runner_version   TEXT,
  duration_ms      INTEGER
);

ALTER TABLE skillup_dev.schema_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE skillup_dev.schema_migrations FROM anon, authenticated;

COMMIT;
