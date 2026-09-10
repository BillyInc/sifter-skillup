-- Make the university -> faculty -> programme flow use the same source of truth.
--
-- The original view did not expose jamb_faculty, even though the faculty
-- endpoint read it from jamb_programmes. That made the faculty picker
-- decorative: selecting a faculty could not narrow the programme typeahead.
-- Append the column so PostgreSQL can replace the existing view without
-- attempting to reorder or rename existing view columns.

BEGIN;

CREATE OR REPLACE VIEW skillup_dev.v_school_jamb_programmes AS
SELECT
    sp.id AS school_programme_id,
    sp.school_id,
    s.name AS school_name,
    s.institution_type,
    sp.jamb_programme_id,
    jp.jamb_name,
    pm.programme_id,
    p.name AS canonical_programme_name,
    sp.utme_subjects,
    sp.olevel_requirement,
    sp.direct_entry,
    sp.remarks,
    jp.jamb_faculty
FROM skillup_dev.school_programmes sp
JOIN skillup_dev.schools s ON s.id = sp.school_id
JOIN skillup_dev.jamb_programmes jp ON jp.id = sp.jamb_programme_id
LEFT JOIN skillup_dev.programme_mapping pm ON pm.jamb_programme_id = jp.id
LEFT JOIN skillup_dev.programmes p ON p.id = pm.programme_id;

ALTER VIEW skillup_dev.v_school_jamb_programmes SET (security_invoker = true);

COMMIT;
