-- ============================================================
-- SIFTER LEVELUP — repair demand-metric FK constraints
-- Schema: skillup_dev.  Idempotent.
--
-- migration_career_v2.sql intentionally DROPs and recreates the taxonomy
-- tables. If it is (re-)applied after data exists, the CASCADE also drops
-- the FK constraints that domain/role demand metrics hold on domains(id)
-- (the rows survive — the tables are outside the drop list — but the
-- constraints vanish). Run this AFTER re-applying seed_career_v2.sql so
-- every domain_id resolves again.
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'skillup_dev'
          AND t.relname = 'domain_demand_metrics'
          AND c.contype = 'f'
    ) THEN
        -- clear any dangling refs first (defensive; seed should have restored all)
        DELETE FROM skillup_dev.domain_demand_metrics dm
        WHERE NOT EXISTS (SELECT 1 FROM skillup_dev.domains d WHERE d.id = dm.domain_id);
        ALTER TABLE skillup_dev.domain_demand_metrics
            ADD CONSTRAINT domain_demand_metrics_domain_id_fkey
            FOREIGN KEY (domain_id) REFERENCES skillup_dev.domains(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'skillup_dev'
          AND t.relname = 'role_demand_metrics'
          AND c.contype = 'f'
    ) THEN
        UPDATE skillup_dev.role_demand_metrics rm SET domain_id = NULL
        WHERE domain_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM skillup_dev.domains d WHERE d.id = rm.domain_id);
        ALTER TABLE skillup_dev.role_demand_metrics
            ADD CONSTRAINT role_demand_metrics_domain_id_fkey
            FOREIGN KEY (domain_id) REFERENCES skillup_dev.domains(id) ON DELETE SET NULL;
    END IF;
END $$;
