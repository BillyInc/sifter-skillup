-- Surface the programme skills profile on the JAMB programme view.
--
-- `jamb_programmes.skills_technical` / `.skills_transferable` are the
-- per-programme answer to "what does this degree actually teach you". They are
-- built by data/career-mapping/_aggregate_skills.py from the CCMAS course
-- learning outcomes (technical = union of every course's outcomes;
-- transferable = employability + 21st-century skills), then projected onto
-- JAMB names, with `skills_components` carrying the per-component split for
-- blended names.
--
-- 382 of 420 JAMB names carry a technical list and 368 a transferable one, and
-- until now NOTHING read them: not the API, not the app. The view that every
-- student-facing JAMB lookup goes through simply did not select the columns.
--
-- Adding them here rather than at each call site keeps one definition of what
-- a "JAMB programme" is.
--
-- NOTE: CREATE OR REPLACE VIEW may only APPEND columns — Postgres rejects any
-- reorder with "cannot change name of view column". The three skills columns
-- therefore go at the END of the existing list, not next to is_blend.

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
    jp.skills_components
FROM skillup_dev.jamb_programmes jp
    LEFT JOIN skillup_dev.programme_mapping pm ON pm.jamb_programme_id = jp.id
    LEFT JOIN skillup_dev.programmes p ON p.id = pm.programme_id;
