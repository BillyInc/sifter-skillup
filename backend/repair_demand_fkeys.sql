-- ============================================================
-- repair_demand_fkeys.sql  (recovery — not part of the normal pipeline)
-- Restores the foreign-key constraints from the demand / source tables to the
-- taxonomy that were CASCADE-dropped when migration_career_v2.sql re-ran
-- (`DROP TABLE skillup_dev.domains CASCADE`). The demand tables themselves
-- survived (created with CREATE TABLE IF NOT EXISTS, so never recreated), but
-- their FKs to domains(id) went with the dropped parent.
--
-- Idempotent. MUST run AFTER seed_career_v2.sql so domains(id) rows exist.
--
-- NOTE: role_demand_metrics.role_id is TEXT (role_key), NOT a FK — roles live in
-- a JSONB/seed, not a PK table — so there is deliberately no role_id constraint.
-- ============================================================
SET search_path TO skillup_dev;
BEGIN;

-- Defensive: null-out any orphaned domain_id on the SET NULL table so the
-- constraint validates cleanly (expected: 0 rows).
UPDATE skillup_dev.role_demand_metrics r SET domain_id = NULL
WHERE r.domain_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM skillup_dev.domains d WHERE d.id = r.domain_id);

-- domain_demand_metrics.domain_id -> domains(id)  (NOT NULL, ON DELETE CASCADE)
ALTER TABLE skillup_dev.domain_demand_metrics
    DROP CONSTRAINT IF EXISTS domain_demand_metrics_domain_id_fkey;
ALTER TABLE skillup_dev.domain_demand_metrics
    ADD CONSTRAINT domain_demand_metrics_domain_id_fkey
    FOREIGN KEY (domain_id) REFERENCES skillup_dev.domains(id) ON DELETE CASCADE;

-- role_demand_metrics.domain_id -> domains(id)  (nullable, ON DELETE SET NULL)
ALTER TABLE skillup_dev.role_demand_metrics
    DROP CONSTRAINT IF EXISTS role_demand_metrics_domain_id_fkey;
ALTER TABLE skillup_dev.role_demand_metrics
    ADD CONSTRAINT role_demand_metrics_domain_id_fkey
    FOREIGN KEY (domain_id) REFERENCES skillup_dev.domains(id) ON DELETE SET NULL;

-- domain_source_registry.domain_id -> domains(id)  (nullable, ON DELETE CASCADE)
ALTER TABLE skillup_dev.domain_source_registry
    DROP CONSTRAINT IF EXISTS domain_source_registry_domain_id_fkey;
ALTER TABLE skillup_dev.domain_source_registry
    ADD CONSTRAINT domain_source_registry_domain_id_fkey
    FOREIGN KEY (domain_id) REFERENCES skillup_dev.domains(id) ON DELETE CASCADE;

COMMIT;
