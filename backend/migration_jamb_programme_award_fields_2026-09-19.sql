-- Additive read-view patch for the student JAMB programme award fields.
-- Apply manually after migration_student_pipeline_live.sql. This preserves
-- the existing view column order and appends only source-backed fields.
BEGIN;

CREATE OR REPLACE VIEW skillup_dev.v_jamb_programme_details AS
SELECT
    jp.id AS jamb_programme_id,
    jp.jamb_name,
    jp.jamb_faculty,
    jp.degree_type,
    jp.is_blend,
    pm.programme_id,
    p.name AS canonical_programme_name,
    p.display_name,
    p.institution_type,
    p.discipline,
    pm.mapping_type,
    pm.mapping_note,
    pm.confidence,
    jp.skills_technical,
    jp.skills_transferable,
    jp.skills_components,
    p.qualification,
    p.duration_years
FROM skillup_dev.jamb_programmes jp
LEFT JOIN skillup_dev.programme_mapping pm ON pm.jamb_programme_id = jp.id
LEFT JOIN skillup_dev.programmes p ON p.id = pm.programme_id;

ALTER VIEW skillup_dev.v_jamb_programme_details SET (security_invoker = true);
COMMIT;
