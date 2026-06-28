-- ============================================================
-- SIFTER LEVELUP — INSTITUTIONAL / ADMINISTRATOR SCHEMA
-- Schema: skillup_dev
-- Run this in your Supabase SQL editor AFTER supabase-schema.sql.
--
-- This migration adds the institutional (educator / institution-admin)
-- side. It only ADDS objects — it never alters existing tables except to
-- add the backward-compatible `account_type` column to users.
--
-- PRIVACY MODEL
-- -------------
-- Institutional Intelligence is AGGREGATE only. The roster of an
-- institution's students is NEVER exposed by an API endpoint. The link
-- between a student and an organisation (student_affiliations) is
-- SELF-REPORTED via a school code and powers attribution + aggregate
-- analytics only. Individual student visibility is CONSENT-GATED: it
-- stays aggregate-only until a row exists in student_consents with
-- granted_by = 'guardian' (for minors). Affiliation counts surfaced to
-- educators are k-anonymised (suppressed below a threshold).
-- ============================================================

-- ── USERS: account type (backward-compatible) ────────────────
-- 'student' | 'educator' | 'institution_admin'. Existing rows default
-- to 'student' so nothing about the current student experience changes.
ALTER TABLE skillup_dev.users
    ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'student';

-- ── ORGANIZATIONS ────────────────────────────────────────────
-- An institution an educator represents. Registry anchors vary by type
-- (JAMB/NUC for universities, MoE approval for secondary schools, CAC
-- for centres/cafés). `school_code` is the public code students use to
-- self-affiliate. `provider_session_only` is true for tutorial centres
-- and JAMB cafés (provider/session only — they never hold a roster).
CREATE TABLE IF NOT EXISTS skillup_dev.organizations (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type                  TEXT NOT NULL,        -- secondary_school | university | tutorial_centre | jamb_cafe
    name                  TEXT NOT NULL,
    jamb_code             TEXT,                 -- JAMB/CAPS institution code (universities)
    nuc_code              TEXT,                 -- NUC accreditation (universities)
    moe_approval_no       TEXT,                 -- state Ministry of Education approval (secondary schools)
    cac_no                TEXT,                 -- CAC business registration (centres/cafés)
    state                 TEXT,
    school_code           TEXT UNIQUE,          -- public code students use to self-affiliate
    verification_status   TEXT NOT NULL DEFAULT 'unverified',  -- unverified|claimed|pending|verified|rejected
    verification_method   TEXT,                 -- email_domain|document_upload|cac_registration|registry_match|manual
    provider_session_only BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_organizations_school_code ON skillup_dev.organizations(school_code);
CREATE INDEX IF NOT EXISTS idx_organizations_type        ON skillup_dev.organizations(type);

-- ── ORGANIZATION MEMBERS ─────────────────────────────────────
-- Links an educator/admin user to an organisation with a role/seat.
CREATE TABLE IF NOT EXISTS skillup_dev.organization_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES skillup_dev.organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'owner',  -- owner|counsellor|course_advisor|hod|dean
    seat_status     TEXT NOT NULL DEFAULT 'invited', -- invited|active|suspended
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON skillup_dev.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org  ON skillup_dev.organization_members(organization_id);

-- ── STUDENT AFFILIATIONS (self-reported) ─────────────────────
-- A SELF-REPORTED link from a student to an org via the school code.
-- Powers attribution + aggregate analytics ONLY — never individual
-- visibility. source is always 'school_code' in this phase.
CREATE TABLE IF NOT EXISTS skillup_dev.student_affiliations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES skillup_dev.organizations(id) ON DELETE CASCADE,
    source          TEXT NOT NULL DEFAULT 'school_code',
    self_reported   BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, organization_id)
);
CREATE INDEX IF NOT EXISTS idx_affiliations_org     ON skillup_dev.student_affiliations(organization_id);
CREATE INDEX IF NOT EXISTS idx_affiliations_student ON skillup_dev.student_affiliations(student_id);

-- ── STUDENT CONSENTS (the gate) ──────────────────────────────
-- The consent that would unlock individual visibility. Built but kept
-- gated: analytics stay AGGREGATE-ONLY until a row here records
-- granted_by = 'guardian' (for minors). No endpoint reads individual
-- rows in this phase regardless.
CREATE TABLE IF NOT EXISTS skillup_dev.student_consents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES skillup_dev.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES skillup_dev.organizations(id) ON DELETE CASCADE,
    scope           TEXT NOT NULL DEFAULT 'progress',  -- progress|contact|full
    granted_by      TEXT NOT NULL DEFAULT 'self',      -- self|guardian
    granted_at      TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, organization_id, scope)
);
CREATE INDEX IF NOT EXISTS idx_consents_org     ON skillup_dev.student_consents(organization_id);
CREATE INDEX IF NOT EXISTS idx_consents_student ON skillup_dev.student_consents(student_id);

-- ── Row Level Security ───────────────────────────────────────
-- Server uses the service-role client (bypasses RLS). RLS is enabled
-- to deny anon/auth direct access by default; policies are added with
-- the institutional rollout once access patterns are finalised.
ALTER TABLE skillup_dev.organizations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.organization_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_affiliations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE skillup_dev.student_consents      ENABLE ROW LEVEL SECURITY;
