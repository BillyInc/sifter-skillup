-- ============================================================
-- SIFTER LEVELUP — INSTITUTION TEAM ACCESS
-- Schema: skillup_dev
-- Run AFTER:
--   1. supabase-schema.sql
--   2. migration_career_pilot.sql
--   3. migration_career_v2.sql
--   4. migration_provisioning.sql
--
-- Purpose:
--   Lets one verified school/university/tutorial centre have multiple officials
--   with separate accounts and scoped roles. Nobody should share the owner's
--   login. Owners/admins invite counsellors, provisioning managers, data
--   viewers, HODs/deans, etc. into the same school dashboard.
--
-- Product decisions encoded here:
--   * users.account_type chooses the broad surface: student | educator |
--     institution_admin.
--   * institution_members is the authoritative org membership table.
--   * role controls what a member can do inside that organisation.
--   * invitations are separate from active seats and expire.
--   * this does not grant student PII; roster access remains consent-gated.
-- ============================================================

-- ── 1. Extend existing institution_members seats ─────────────
ALTER TABLE skillup_dev.institution_members
    ADD COLUMN IF NOT EXISTS seat_status TEXT NOT NULL DEFAULT 'active'
    CHECK (seat_status IN ('invited', 'active', 'suspended', 'revoked'));

ALTER TABLE skillup_dev.institution_members
    ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE skillup_dev.institution_members
    ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL;

ALTER TABLE skillup_dev.institution_members
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

ALTER TABLE skillup_dev.institution_members
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Older migration_career_v2.sql constrained role to educator/institution_admin.
-- Replace that with the roles used by the organisation profile + team screen.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'institution_members_role_check'
          AND conrelid = 'skillup_dev.institution_members'::regclass
    ) THEN
        ALTER TABLE skillup_dev.institution_members
            DROP CONSTRAINT institution_members_role_check;
    END IF;
END $$;

ALTER TABLE skillup_dev.institution_members
    ADD CONSTRAINT institution_members_role_check
    CHECK (
        role IN (
            'owner',
            'institution_admin',
            'admin',
            'educator',
            'counsellor',
            'course_advisor',
            'hod',
            'dean',
            'admissions_officer',
            'provisioning_manager',
            'data_viewer'
        )
    );

CREATE INDEX IF NOT EXISTS idx_institution_members_school_status
    ON skillup_dev.institution_members(school_id, seat_status);
CREATE INDEX IF NOT EXISTS idx_institution_members_role
    ON skillup_dev.institution_members(role);

-- ── 2. Pending official invitations ──────────────────────────
CREATE TABLE IF NOT EXISTS skillup_dev.institution_member_invites (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id      UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    invited_email  TEXT NOT NULL,
    role           TEXT NOT NULL DEFAULT 'counsellor'
                   CHECK (
                    role IN (
                        'owner',
                        'institution_admin',
                        'admin',
                        'educator',
                        'counsellor',
                        'course_advisor',
                        'hod',
                        'dean',
                        'admissions_officer',
                        'provisioning_manager',
                        'data_viewer'
                    )
                   ),
    status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    invited_by     UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    accepted_by    UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    expires_at     TIMESTAMPTZ,
    accepted_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, invited_email, status)
);
CREATE INDEX IF NOT EXISTS idx_member_invites_school
    ON skillup_dev.institution_member_invites(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_invites_email_status
    ON skillup_dev.institution_member_invites(lower(invited_email), status);

-- ── 3. RLS stance ────────────────────────────────────────────
-- FastAPI uses the service-role client and enforces application-level auth.
-- Direct Supabase reads/writes stay closed until explicit policies are added.
ALTER TABLE skillup_dev.institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.institution_member_invites ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE skillup_dev.institution_members FROM anon, authenticated;
REVOKE ALL ON TABLE skillup_dev.institution_member_invites FROM anon, authenticated;

-- ============================================================
-- END migration_institution_team_access.sql
-- ============================================================
