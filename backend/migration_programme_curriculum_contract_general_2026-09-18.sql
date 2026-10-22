-- Generalise the clean programme curriculum contract beyond Sociology.
--
-- Apply after migration_sociology_curriculum_contract_2026-09-17.sql when that
-- contract exists. This is additive and deliberately does not rewrite any
-- curriculum rows. Sociology keeps its reviewed display groups; future
-- programme contracts may use source-derived groups or programme_core.

BEGIN;

DO $$
BEGIN
    IF to_regclass('skillup_dev.programme_curriculum_outcomes') IS NOT NULL THEN
        ALTER TABLE skillup_dev.programme_curriculum_outcomes
            DROP CONSTRAINT IF EXISTS programme_curriculum_outcomes_display_group_check;

        ALTER TABLE skillup_dev.programme_curriculum_outcomes
            ALTER COLUMN display_group SET DEFAULT 'programme_core';

        COMMENT ON COLUMN skillup_dev.programme_curriculum_outcomes.display_group IS
            'Source-derived presentation group. programme_core is the honest generic fallback; Sociology labels remain valid for the reviewed slice.';
    END IF;
END $$;

COMMIT;
