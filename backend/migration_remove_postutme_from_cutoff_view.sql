-- ============================================================
-- SIFTER LEVELUP — REMOVE POST-UTME FROM CUTOFF VIEW (spec §12.1 hardening)
-- Schema: skillup_dev
--
-- Post-UTME is removed from the platform UI. The base-table column
-- programme_school_cutoff.postutme_cutoff STAYS (data preservation,
-- UI-suppressed: not displayed), but the API reads this view with
-- select("*"), so dropping the column here guarantees it can never
-- reach a payload again.
--
-- Postgres cannot drop a view column via CREATE OR REPLACE — the view
-- must be dropped and recreated.
-- ============================================================

DROP VIEW IF EXISTS skillup_dev.v_cutoffs_by_jamb_programme;

CREATE VIEW skillup_dev.v_cutoffs_by_jamb_programme AS
SELECT
    psc.id,
    COALESCE(psc.jamb_programme_id, pm.jamb_programme_id) AS jamb_programme_id,
    jp.jamb_name,
    psc.programme_id,
    p.name AS canonical_programme_name,
    psc.school_id,
    s.name AS school_name,
    s.institution_type,
    psc.year,
    psc.aggregate_cutoff,
    psc.jamb_cutoff,
    -- postutme_cutoff intentionally omitted (UI-suppressed: not displayed)
    psc.form,
    psc.source_url,
    psc.verified_at,
    psc.created_at
FROM skillup_dev.programme_school_cutoff psc
LEFT JOIN skillup_dev.programme_mapping pm ON pm.programme_id = psc.programme_id
LEFT JOIN skillup_dev.jamb_programmes jp ON jp.id = COALESCE(psc.jamb_programme_id, pm.jamb_programme_id)
LEFT JOIN skillup_dev.programmes p ON p.id = psc.programme_id
JOIN skillup_dev.schools s ON s.id = psc.school_id;
ALTER VIEW skillup_dev.v_cutoffs_by_jamb_programme SET (security_invoker = true);
