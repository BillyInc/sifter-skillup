-- ============================================================
-- SIFTER SKILL_UP — Portfolio Hub Schema Additions
-- Run in your Supabase SQL editor AFTER the existing schema
-- ============================================================

-- PORTFOLIO PLATFORM ACCOUNTS
-- Stores each user's connected accounts on external platforms
CREATE TABLE IF NOT EXISTS sifter_dev.portfolio_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    platform_id     TEXT NOT NULL,                 -- e.g. 'linkedin', 'github', 'behance'
    username        TEXT NOT NULL DEFAULT '',
    profile_url     TEXT NOT NULL DEFAULT '',
    auth_method     TEXT NOT NULL DEFAULT 'manual', -- 'oauth' | 'manual' | 'auto_created' | 'token'
    access_token    TEXT,                           -- encrypted in production (use pgcrypto or KMS)
    refresh_token   TEXT,
    token_expiry    TIMESTAMPTZ,
    connected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform_id)
);
CREATE INDEX IF NOT EXISTS idx_portfolio_accounts_user ON sifter_dev.portfolio_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_accounts_platform ON sifter_dev.portfolio_accounts(platform_id);

-- PORTFOLIO ITEMS
-- Work that users have created and want to push to platforms
CREATE TABLE IF NOT EXISTS sifter_dev.portfolio_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    field_id    TEXT NOT NULL DEFAULT '',           -- maps to fields.ts field IDs
    type        TEXT NOT NULL DEFAULT 'project',    -- 'project' | 'writeup' | 'code' | 'design' | 'video' | 'certificate'
    tags        TEXT[] NOT NULL DEFAULT '{}',
    file_url    TEXT,                               -- optional uploaded file
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user ON sifter_dev.portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_field ON sifter_dev.portfolio_items(field_id);

-- PORTFOLIO PUSHES
-- Records each time a portfolio item was pushed to a platform
CREATE TABLE IF NOT EXISTS sifter_dev.portfolio_pushes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id     UUID NOT NULL REFERENCES sifter_dev.portfolio_items(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL,
    post_url    TEXT NOT NULL DEFAULT '',           -- URL of the created post/project on the platform
    pushed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(item_id, platform_id)                    -- one push per item per platform (update on re-push)
);
CREATE INDEX IF NOT EXISTS idx_portfolio_pushes_item ON sifter_dev.portfolio_pushes(item_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_pushes_user ON sifter_dev.portfolio_pushes(user_id);

-- OAUTH STATES
-- Short-lived PKCE state tokens for OAuth flows
CREATE TABLE IF NOT EXISTS sifter_dev.oauth_states (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state       TEXT NOT NULL UNIQUE,
    user_id     UUID NOT NULL REFERENCES sifter_dev.users(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes')
);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON sifter_dev.oauth_states(state);

-- Auto-clean expired OAuth states (requires pg_cron extension)
-- SELECT cron.schedule('clean-oauth-states', '*/5 * * * *',
--   'DELETE FROM sifter_dev.oauth_states WHERE expires_at < NOW()');

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE sifter_dev.portfolio_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.portfolio_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.portfolio_pushes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifter_dev.oauth_states       ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own portfolio data
CREATE POLICY "portfolio_accounts_self" ON sifter_dev.portfolio_accounts
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "portfolio_items_self" ON sifter_dev.portfolio_items
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "portfolio_pushes_self" ON sifter_dev.portfolio_pushes
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "oauth_states_self" ON sifter_dev.oauth_states
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Service role bypasses RLS (for backend routes using service_client)
-- No additional policy needed — service role always bypasses RLS in Supabase.

-- ─────────────────────────────────────────────────────────────
-- ENCRYPTION NOTE
-- ─────────────────────────────────────────────────────────────
-- In production, access_token and refresh_token in portfolio_accounts
-- should be encrypted at rest using pgcrypto or a KMS-managed key.
-- Example with pgcrypto:
--
--   UPDATE sifter_dev.portfolio_accounts
--   SET access_token = pgp_sym_encrypt(access_token, current_setting('app.encryption_key'))
--   WHERE access_token IS NOT NULL;
--
--   SELECT pgp_sym_decrypt(access_token::bytea, current_setting('app.encryption_key'))
--   FROM sifter_dev.portfolio_accounts WHERE user_id = $1 AND platform_id = $2;
