-- SIFTER LEVELUP — EVERGREEN CERTIFICATION LIFECYCLE
-- Additive migration. Run after migration_career_v2.sql and
-- migration_enrichment_v1.sql. It does not delete old credentials when an
-- issuer pauses or replaces an exam.

ALTER TABLE skillup_dev.domain_certifications
    ADD COLUMN IF NOT EXISTS credential_type TEXT NOT NULL DEFAULT 'certification_or_qualification'
        CHECK (credential_type IN (
            'certification_or_qualification',
            'professional_registration_or_licence',
            'membership_or_accreditation',
            'training_or_course'
        )),
    ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'active'
        CHECK (availability_status IN ('active', 'temporarily_unavailable', 'retired', 'superseded')),
    ADD COLUMN IF NOT EXISTS current_recommendation BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS retain_in_catalogue BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS reopen_possible BOOLEAN,
    ADD COLUMN IF NOT EXISTS availability_note TEXT,
    ADD COLUMN IF NOT EXISTS status_source_url TEXT,
    ADD COLUMN IF NOT EXISTS status_checked_at DATE,
    ADD COLUMN IF NOT EXISTS replacement_name TEXT,
    ADD COLUMN IF NOT EXISTS replacement_url TEXT;

-- Role-owned credentials use the same lifecycle contract. This keeps a
-- role-level copy from being shown as current when its issuer route changes.
ALTER TABLE IF EXISTS skillup_dev.role_certifications
    ADD COLUMN IF NOT EXISTS official_url TEXT,
    ADD COLUMN IF NOT EXISTS credential_type TEXT NOT NULL DEFAULT 'certification_or_qualification'
        CHECK (credential_type IN (
            'certification_or_qualification',
            'professional_registration_or_licence',
            'membership_or_accreditation',
            'training_or_course'
        )),
    ADD COLUMN IF NOT EXISTS availability_status TEXT NOT NULL DEFAULT 'active'
        CHECK (availability_status IN ('active', 'temporarily_unavailable', 'retired', 'superseded')),
    ADD COLUMN IF NOT EXISTS current_recommendation BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS retain_in_catalogue BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS reopen_possible BOOLEAN,
    ADD COLUMN IF NOT EXISTS availability_note TEXT,
    ADD COLUMN IF NOT EXISTS status_source_url TEXT,
    ADD COLUMN IF NOT EXISTS status_checked_at DATE,
    ADD COLUMN IF NOT EXISTS replacement_name TEXT,
    ADD COLUMN IF NOT EXISTS replacement_url TEXT;

CREATE INDEX IF NOT EXISTS idx_domain_certs_availability
    ON skillup_dev.domain_certifications(availability_status, current_recommendation);
