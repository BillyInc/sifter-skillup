-- ============================================================
-- SIFTER LEVELUP — INSTITUTION-PROVISIONED STUDENTS
-- Schema: skillup_dev
-- Run AFTER supabase-schema.sql + migration_career_v2.sql
--   (also after institutions-schema.sql if that was ever applied —
--    this migration RETIRES its orphaned Model-A tables; see below).
-- ------------------------------------------------------------
-- Adds the "school provisions a student account, prints a login
-- card + career report, student later claims and owns it" model,
-- plus consent-gated individual visibility for self-affiliated
-- students.
--
-- SCHEMA RECONCILIATION (the pivotal decision)
-- --------------------------------------------
-- Two institution models existed in the repo:
--   * Model B (LIVE): skillup_dev.schools + institution_members,
--     queried by institutions_routes.py. This is authoritative.
--   * Model A (ORPHANED): institutions-schema.sql defined
--     organizations / organization_members / student_affiliations /
--     student_consents. ZERO Python ever read or wrote them.
-- We KEEP Model A's student-side tables (affiliations, consents) —
-- their shape is exactly what we need — but REPOINT them from
-- organizations(id) to the live schools(id), and RETIRE Model A's
-- duplicate organizations / organization_members (educator linkage
-- already lives in institution_members). Because the Model-A tables
-- carried zero rows, the drop-and-recreate is data-safe.
--
-- PRIVACY MODEL
-- -------------
--   * Individual visibility is DEFAULT-OFF. A student is individually
--     visible to a school ONLY IF (provisioned AND unclaimed) OR an
--     ACTIVE student_consents row exists. Otherwise: aggregate-only.
--   * Uploaded documents (attendance/result sheets) are NEVER stored.
--     There is deliberately no documents table here.
--   * Subjects/grades extracted from those documents are NEVER stored.
--     There is deliberately NO academic column on users or on
--     student_provision_drafts. Grades ride only in the transient
--     generate-call payload, are used to compute the mapping inline,
--     and are discarded. Only name, class, and the CHOSEN career
--     direction persist.
--
-- Idempotent: IF NOT EXISTS + ADD COLUMN IF NOT EXISTS.
-- ============================================================

-- ── 0. Retire the orphaned Model-A duplicates ────────────────
-- These carried ZERO rows and ZERO code references. student_affiliations
-- and student_consents are dropped here too so we can recreate them
-- repointed to schools(id) (Model A pointed them at organizations(id)).
-- Children first.
DROP TABLE IF EXISTS skillup_dev.student_consents      CASCADE;
DROP TABLE IF EXISTS skillup_dev.student_affiliations  CASCADE;
DROP TABLE IF EXISTS skillup_dev.organization_members  CASCADE;
DROP TABLE IF EXISTS skillup_dev.organizations         CASCADE;

-- ── 1. schools: public self-affiliation code + provider flag ─
-- school_code is the code students type to self-affiliate. It is
-- generated per school on demand; unique when present.
ALTER TABLE skillup_dev.schools
    ADD COLUMN IF NOT EXISTS school_code           TEXT;
ALTER TABLE skillup_dev.schools
    ADD COLUMN IF NOT EXISTS provider_session_only BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_school_code
    ON skillup_dev.schools(school_code) WHERE school_code IS NOT NULL;

-- ── 2. users: provisioning + claim lifecycle ─────────────────
-- Provisioned students ARE real users rows from birth (so they can be
-- owned later). provenance distinguishes how the row was born; a
-- provisioned row stays 'unclaimed' — school-operated, editable — until
-- the student redeems a claim code, at which point it flips 'claimed'
-- and the student owns it. guardian_consent_at is captured at enrolment
-- for minors (the provisioning form's tick + name).
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS provenance             TEXT NOT NULL DEFAULT 'self';  -- 'self' | 'provisioned'
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS provisioning_school_id UUID REFERENCES skillup_dev.schools(id) ON DELETE SET NULL;
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS claim_state            TEXT;  -- NULL for self; 'unclaimed' | 'claimed' for provisioned
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS student_class          TEXT;  -- e.g. 'SS2' — identity, NOT academic record
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS stream                 TEXT;  -- 'science'|'art'|'commercial' (SS enrollment stream) — identity, not a grade
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS chosen_direction        JSONB; -- the picked career direction {domain_key, role_key, programme_id}
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS phone                  TEXT;  -- claim identity (phone-first for Nigeria/WhatsApp)
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS guardian_consent_at    TIMESTAMPTZ;
-- account_type gates admin surfaces (Auth.require_admin reads it) and is already
-- assumed by institutions_routes.py; it was never added by an earlier migration.
-- Add it here so provisioning's admin routes resolve. 'student' | 'educator' |
-- 'institution_admin'; legacy rows remain 'pending' until a persona is chosen.
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS account_type           TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS account_type_selected_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_provisioning_school
    ON skillup_dev.users(provisioning_school_id) WHERE provisioning_school_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone
    ON skillup_dev.users(phone) WHERE phone IS NOT NULL;

-- ── 3. student_affiliations (repointed to schools) ───────────
-- Unified student→school link for BOTH paths. source distinguishes
-- how the link was formed. Powers aggregate attribution always;
-- individual visibility is governed separately by student_consents
-- (self-affiliated) or by the provisioned+unclaimed state (provisioned).
CREATE TABLE IF NOT EXISTS skillup_dev.student_affiliations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     UUID NOT NULL REFERENCES skillup_dev.users(id)   ON DELETE CASCADE,
    school_id      UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    source         TEXT NOT NULL DEFAULT 'school_code',  -- 'school_code' | 'provisioned'
    self_reported  BOOLEAN NOT NULL DEFAULT true,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, school_id)
);
CREATE INDEX IF NOT EXISTS idx_affiliations_school  ON skillup_dev.student_affiliations(school_id);
CREATE INDEX IF NOT EXISTS idx_affiliations_student ON skillup_dev.student_affiliations(student_id);

-- ── 4. student_consents (repointed to schools) — the gate ────
-- Per-(student, school, scope) consent to INDIVIDUAL visibility.
-- Active iff granted_at IS NOT NULL AND revoked_at IS NULL. Revocable:
-- set revoked_at to collapse the student back into aggregate-only.
-- Per-school by construction (consent to one school ≠ another).
CREATE TABLE IF NOT EXISTS skillup_dev.student_consents (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     UUID NOT NULL REFERENCES skillup_dev.users(id)   ON DELETE CASCADE,
    school_id      UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    scope          TEXT NOT NULL DEFAULT 'progress',  -- progress|contact|full
    granted_by     TEXT NOT NULL DEFAULT 'self',      -- self|guardian
    granted_at     TIMESTAMPTZ,
    revoked_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, school_id, scope)
);
CREATE INDEX IF NOT EXISTS idx_consents_school  ON skillup_dev.student_consents(school_id);
CREATE INDEX IF NOT EXISTS idx_consents_student ON skillup_dev.student_consents(student_id);
CREATE INDEX IF NOT EXISTS idx_consents_active
    ON skillup_dev.student_consents(school_id, student_id)
    WHERE granted_at IS NOT NULL AND revoked_at IS NULL;

-- ── 5. student_provision_drafts — the pre-mint staging grid ──
-- The assisted-import review grid. Rows land here from a bulk upload
-- (vision pre-fill) OR manual/paste entry, the educator corrects them,
-- selects which to activate, then generate mints accounts. Deliberately
-- NO academic columns: subjects/grades are transient and never stored.
CREATE TABLE IF NOT EXISTS skillup_dev.student_provision_drafts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id         UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    created_by        UUID NOT NULL REFERENCES skillup_dev.users(id)   ON DELETE CASCADE,  -- the educator
    full_name         TEXT,          -- may be NULL/uncertain until the educator confirms
    student_class     TEXT,          -- e.g. 'SS2' — identity, not academic record
    stream            TEXT,          -- 'science'|'art'|'commercial' (SS stream) — set per-batch, editable per-row
    needs_review      BOOLEAN NOT NULL DEFAULT true,   -- true while any field is unconfirmed
    guardian_consent  BOOLEAN NOT NULL DEFAULT false,  -- the enrolment-form tick for minors
    guardian_name     TEXT,
    status            TEXT NOT NULL DEFAULT 'draft',   -- 'draft' | 'generated' | 'discarded'
    generated_user_id UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE skillup_dev.student_provision_drafts
    ADD COLUMN IF NOT EXISTS stream TEXT;
CREATE INDEX IF NOT EXISTS idx_drafts_school ON skillup_dev.student_provision_drafts(school_id, status);

-- ── 6. student_merge_candidates — admin-confirm recovery ─────
-- Background reconciliation proposes likely duplicates between an unclaimed
-- school-provisioned shell and a self/claimed student account. Admins confirm
-- or dismiss; dismissed rows persist so the same pair does not reappear.
CREATE TABLE IF NOT EXISTS skillup_dev.student_merge_candidates (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id              UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    provisioned_student_id UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    real_student_id        UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    status                 TEXT NOT NULL DEFAULT 'pending', -- pending|confirmed|dismissed
    match_key              TEXT NOT NULL,
    match_reason           TEXT NOT NULL,
    confidence             NUMERIC NOT NULL DEFAULT 0,
    evidence               JSONB NOT NULL DEFAULT '{}'::jsonb,
    provisioned_snapshot   JSONB NOT NULL DEFAULT '{}'::jsonb,
    real_snapshot          JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by             UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    confirmed_by           UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    dismissed_by           UUID REFERENCES skillup_dev.users(id) ON DELETE SET NULL,
    confirmed_at           TIMESTAMPTZ,
    dismissed_at           TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(school_id, provisioned_student_id, real_student_id)
);
CREATE INDEX IF NOT EXISTS idx_merge_candidates_school_status
    ON skillup_dev.student_merge_candidates(school_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merge_candidates_provisioned
    ON skillup_dev.student_merge_candidates(provisioned_student_id);
CREATE INDEX IF NOT EXISTS idx_merge_candidates_real
    ON skillup_dev.student_merge_candidates(real_student_id);

-- ── 7. claim_codes — single-use, regenerable ─────────────────
-- Printed on the detachable login card. Redeeming converts the
-- provisioned account to student-owned. Regenerating a code invalidates
-- the prior one (revoked_at) — satisfies "editable/regenerable until
-- claimed" and lets a lost card be reissued.
CREATE TABLE IF NOT EXISTS skillup_dev.claim_codes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         TEXT NOT NULL,
    student_id   UUID NOT NULL REFERENCES skillup_dev.users(id)   ON DELETE CASCADE,
    school_id    UUID NOT NULL REFERENCES skillup_dev.schools(id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ,
    redeemed_at  TIMESTAMPTZ,
    revoked_at   TIMESTAMPTZ,   -- set when regenerated/superseded
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- A code is unique among the codes that are still live (not redeemed,
-- not revoked) so lookups on redemption are unambiguous.
CREATE UNIQUE INDEX IF NOT EXISTS uq_claim_codes_live
    ON skillup_dev.claim_codes(code)
    WHERE redeemed_at IS NULL AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_claim_codes_student ON skillup_dev.claim_codes(student_id);

-- ── 8. Row Level Security ────────────────────────────────────
-- Server uses the service-role client (bypasses RLS). Enable RLS so
-- anon/auth direct access is denied by default; policies land with the
-- broader institutional RLS pass.
ALTER TABLE skillup_dev.student_affiliations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_consents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_provision_drafts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_merge_candidates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.claim_codes               ENABLE ROW LEVEL SECURITY;
