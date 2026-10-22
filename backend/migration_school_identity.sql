-- School identity and affiliation-code hardening.
-- Safe to run after migration_provisioning.sql. Existing registry rows remain
-- readable; new admin claims must supply an address in the API.

ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS school_code TEXT;
-- Student-facing offering cards may show a source-backed long name together
-- with its verified acronym. These values must come from an authoritative
-- institution registry or official source; never derive a university name
-- from an acronym in application code.
ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS official_name TEXT;
ALTER TABLE skillup_dev.schools ADD COLUMN IF NOT EXISTS short_name TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_schools_school_code
  ON skillup_dev.schools (school_code)
  WHERE school_code IS NOT NULL AND school_code <> '';

CREATE INDEX IF NOT EXISTS idx_schools_name_address
  ON skillup_dev.schools (institution_type, lower(name), lower(address));
