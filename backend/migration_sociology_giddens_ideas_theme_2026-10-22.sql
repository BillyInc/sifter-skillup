-- Add the verified edition-specific Giddens/Sutton association to Ideas and
-- foundations. This is additive and scoped to the exact existing Sociology
-- programme reading (9th edition, ISBN 978-1-5095-3922-2).
-- Apply after migration_guidance_ownership_and_sociology_resources_2026-09-11.sql.
BEGIN;

DO $$
DECLARE
    updated_rows integer;
BEGIN
    UPDATE skillup_dev.career_learning_resources AS r
    SET source_provenance = COALESCE(r.source_provenance, '{}'::jsonb) || jsonb_build_object(
        'theme_keys', jsonb_build_array('ideas'),
        'theme_descriptions', jsonb_build_object(
            'ideas', 'The 9th-edition contents identify chapter 3 as “Theories and Perspectives.” Use it as optional support for comparing sociological explanations introduced under Ideas and foundations; it is not a prescribed course reading or coverage of every theme outcome.'
        ),
        'theme_urls', jsonb_build_object(
            'ideas', 'https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2'
        ),
        'theme_rationales', jsonb_build_object(
            'ideas', 'Wiley’s product page for ISBN 978-1-5095-3922-2 identifies the 9th edition and lists chapter 3, “Theories and Perspectives.” This edition-specific locator supports an Ideas and foundations association without borrowing the 10th edition’s contents or claiming a university prescription.'
        ),
        'theme_evidence', jsonb_build_array(jsonb_build_object(
            'theme_key', 'ideas',
            'authority', 'Wiley / Polity Books',
            'url', 'https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2',
            'locator', '9th edition; ISBN 978-1-5095-3922-2; Chapter 3: Theories and Perspectives',
            'checked_on', '2026-10-22',
            'supports', 'Optional reference association with the Ideas and foundations theme.'
        )),
        'source_checked_on', '2026-10-22'
    )
    WHERE r.ownership_scope = 'programme'
      AND lower(r.target_name) = 'sociology'
      AND r.source_provenance ->> 'guidance_layer' = 'sociology_programme_v1'
      AND r.source_provenance ->> 'isbn' = '978-1-5095-3922-2';

    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    IF updated_rows <> 1 THEN
        RAISE EXCEPTION
            'Expected exactly one Sociology Giddens/Sutton 9th-edition resource row; updated % rows. Check the base migration and ISBN before retrying.',
            updated_rows;
    END IF;
END $$;

COMMIT;
