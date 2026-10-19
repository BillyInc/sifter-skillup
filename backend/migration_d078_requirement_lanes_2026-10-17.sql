-- D078 requirement-lane metadata for route-scoped compulsory foundations,
-- selectable useful edges, and non-cumulative alternatives.
-- Apply after contextual-item/path-target schema and the D078 role-item table.
-- This is additive and does not promote student display or apply SQL seeds.

BEGIN;

ALTER TABLE skillup_dev.career_context_items
    ADD COLUMN IF NOT EXISTS requirement_scope JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE skillup_dev.career_item_path_targets
    ADD COLUMN IF NOT EXISTS requirement_scope JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE skillup_dev.d078_role_item_contracts
    ADD COLUMN IF NOT EXISTS requirement_lane TEXT,
    ADD COLUMN IF NOT EXISTS requirement_condition TEXT,
    ADD COLUMN IF NOT EXISTS requirement_rationale TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'd078_role_item_requirement_lane_check'
          AND conrelid = 'skillup_dev.d078_role_item_contracts'::regclass
    ) THEN
        ALTER TABLE skillup_dev.d078_role_item_contracts
            ADD CONSTRAINT d078_role_item_requirement_lane_check
            CHECK (requirement_lane IS NULL OR requirement_lane IN (
                'needed', 'conditional', 'useful_optional',
                'choose_one_alternative', 'unapproved'
            ));
    END IF;
END $$;

COMMENT ON COLUMN skillup_dev.career_context_items.requirement_scope IS
    'Structured route/task scope for whether an item is needed, useful, optional, or part of an alternative set. The base requirement_level is not broadened to routes outside this scope.';
COMMENT ON COLUMN skillup_dev.career_item_path_targets.requirement_scope IS
    'Condition and learner-choice behavior for the source item’s applicability to this area/role path; path targets do not create prerequisites.';
COMMENT ON COLUMN skillup_dev.d078_role_item_contracts.requirement_lane IS
    'Item-context requirement disposition; independent from legacy priority_snapshot and student_display_approved.';
COMMENT ON COLUMN skillup_dev.d078_role_item_contracts.requirement_condition IS
    'Task/route condition for the role-item lane; not a role-fit or ownership decision.';
COMMENT ON COLUMN skillup_dev.d078_role_item_contracts.requirement_rationale IS
    'Reason the role-item lane applies, retained for staff audit and learner-path assembly.';

COMMIT;
