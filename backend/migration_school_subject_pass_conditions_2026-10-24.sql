-- Persist explicit O-level pass-only conditions for university-scoped subject rules.
-- Apply after migration_career_pilot.sql and before regenerating/applying
-- seed_career_pilot.sql. Existing options receive an empty array.
ALTER TABLE skillup_dev.school_programme_subject_options
    ADD COLUMN IF NOT EXISTS pass_required_codes JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'school_programme_subject_options_pass_required_codes_array'
          AND conrelid = 'skillup_dev.school_programme_subject_options'::regclass
    ) THEN
        ALTER TABLE skillup_dev.school_programme_subject_options
            ADD CONSTRAINT school_programme_subject_options_pass_required_codes_array
            CHECK (jsonb_typeof(pass_required_codes) = 'array') NOT VALID;
    END IF;
END $$;

ALTER TABLE skillup_dev.school_programme_subject_options
    VALIDATE CONSTRAINT school_programme_subject_options_pass_required_codes_array;
