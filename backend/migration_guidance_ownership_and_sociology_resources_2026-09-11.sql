-- Source-grounded guidance ownership and Sociology review slice.
-- Run after migration_career_v2.sql, migration_source_backed_career_layers.sql,
-- migration_career_resources_v1.sql, and
-- migration_contextual_career_items.sql,
-- migration_guidance_programme_reading_and_market_scope_2026-09-12.sql.
--
-- This is additive and intentionally scoped to the reviewed Sociology/D078
-- slice. It makes ownership explicit instead of inferring domain guidance
-- from role aggregation.

BEGIN;

ALTER TABLE skillup_dev.career_learning_resources
    ADD COLUMN IF NOT EXISTS programme_id UUID
        REFERENCES skillup_dev.programmes(id) ON DELETE CASCADE;

ALTER TABLE skillup_dev.career_learning_resources
    ADD COLUMN IF NOT EXISTS ownership_scope TEXT
        CHECK (ownership_scope IN ('programme', 'domain', 'subgroup', 'role', 'audit_only')),
    ADD COLUMN IF NOT EXISTS review_status TEXT
        CHECK (review_status IN ('approved_guidance_v1', 'review_only', 'unverified'));

ALTER TABLE skillup_dev.domain_tools
    ADD COLUMN IF NOT EXISTS guidance_owner TEXT
        CHECK (guidance_owner IN ('domain', 'subgroup', 'role', 'role_aggregated', 'review_only'));

-- Existing D078 domain rows came from role aggregation. Preserve them for
-- audit/admin use, but label them so they cannot be mistaken for domain-owned
-- student guidance.
UPDATE skillup_dev.domain_tools t
SET guidance_owner = 'role_aggregated'
FROM skillup_dev.domains d
WHERE t.domain_id = d.id
  AND d.domain_key = 'D078'
  AND t.scope IN ('domain', 'subgroup')
  AND t.guidance_owner IS NULL;

-- The domain description is the short orientation shown before the staged
-- learning sequence. The structured orientation stays in provenance so the
-- taxonomy table remains compatible with older clients.
UPDATE skillup_dev.domains
SET description = 'Social Sciences help us understand how people live together, how communities and institutions work, and how societies change.',
    source_provenance = COALESCE(source_provenance, '{}'::jsonb) || jsonb_build_object(
        'student_orientation', jsonb_build_object(
            'whatItStudies', 'Social Sciences study people, groups, communities, institutions, culture and social change.',
            'questions', jsonb_build_array(
                'How are societies organised?',
                'How do families, institutions and communities shape people’s lives?',
                'Why do inequality, crime and other social problems develop?',
                'How does society change?',
                'How can research and evidence help explain social life?'
            ),
            'whatPeopleDo', 'People in this field ask questions about social life, gather and assess evidence, compare communities or institutions, and communicate what their findings mean.',
            'whereProgrammeFits', 'Sociology is one programme within Social Sciences. Its curriculum focuses on people, groups, institutions, culture, social problems, social change and research.',
            'relatedProgrammes', jsonb_build_array('Anthropology', 'Criminology', 'Economics', 'Geography', 'Political Science', 'Psychology', 'Sociology')
        )
    )
WHERE domain_key = 'D078';

-- Keep the programme overview useful even before a university is selected.
ALTER TABLE skillup_dev.programmes
    ADD COLUMN IF NOT EXISTS description TEXT;

UPDATE skillup_dev.programmes
SET description = 'Sociology studies how people live together, how groups and institutions are organised, how cultures develop and how societies change.'
WHERE lower(name) = 'sociology'
  AND (description IS NULL OR btrim(description) = '');

CREATE INDEX IF NOT EXISTS idx_career_resources_programme
    ON skillup_dev.career_learning_resources(programme_id, resource_type);

CREATE TABLE IF NOT EXISTS skillup_dev.career_guidance_foundations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id        UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    stage            TEXT NOT NULL CHECK (stage IN (
        'start_here',
        'build_next',
        'choose_area',
        'prepare_for_role'
    )),
    item_name        TEXT NOT NULL,
    priority_reason  TEXT NOT NULL,
    evidence_note    TEXT NOT NULL,
    resource_url     TEXT CHECK (resource_url IS NULL OR resource_url ~ '^https://'),
    display_order    INTEGER NOT NULL DEFAULT 0,
    source_confidence TEXT NOT NULL DEFAULT 'high',
    data_state       TEXT NOT NULL DEFAULT 'source_backed',
    source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(domain_id, item_name)
);

CREATE INDEX IF NOT EXISTS idx_guidance_foundations_domain_stage
    ON skillup_dev.career_guidance_foundations(domain_id, stage, display_order);

COMMENT ON TABLE skillup_dev.career_guidance_foundations IS
    'Domain-owned staged learning sequence. Role prevalence must not be used as a domain foundation.';

-- Re-running this migration replaces only the rows owned by this migration.
DELETE FROM skillup_dev.career_guidance_foundations
WHERE domain_id IN (
    SELECT id FROM skillup_dev.domains WHERE domain_key = 'D078'
);

INSERT INTO skillup_dev.career_guidance_foundations
    (domain_id, stage, item_name, priority_reason, evidence_note, resource_url,
     display_order, source_confidence, data_state, source_provenance)
SELECT
    d.id,
    rows.stage,
    rows.item_name,
    rows.priority_reason,
    rows.evidence_note,
    rows.resource_url,
    rows.display_order,
    'high',
    'source_backed',
    jsonb_build_object(
        'guidance_layer', 'social_sciences_domain_v1',
        'ownership', 'domain_owned',
        'programme_evidence', 'Sociology CCMAS curriculum',
        'domain_key', 'D078'
    )
FROM skillup_dev.domains d
CROSS JOIN (VALUES
    ('start_here', 'Understand people, groups and institutions',
     'Start here because the domain and Sociology curriculum both begin with people, groups, institutions and social life.',
     'Supported by Sociology outcomes on social structure, culture, socialisation, family, institutions and communities.',
     'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0', 1),
    ('build_next', 'Ask clear questions about social life',
     'Build this next because research begins by turning curiosity about society into a clear question.',
     'Supported by Sociology research-methods outcomes on research questions, proposals and feasible projects.',
     'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-4.2', 2),
    ('build_next', 'Learn how evidence is gathered and evaluated',
     'Build this before analysis because a conclusion depends on how evidence was collected, organised and judged.',
     'Supported by Sociology outcomes on data collection, qualitative and quantitative evidence, research integrity and source evaluation.',
     'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 3),
    ('build_next', 'Use appropriate research methods',
     'Build this after the question and evidence foundation because method choice depends on what you are trying to find out.',
     'Supported by SOC 302, SOC 301 and SSC 401 outcomes on research design, methods, statistics, ethics and project work.',
     'https://usq.pressbooks.pub/socialscienceresearch/', 4),
    ('build_next', 'Analyse and communicate findings',
     'Build this after gathering evidence because the work must be interpreted and explained clearly, with limits and uncertainty.',
     'Supported by Sociology outcomes on analysis, reports, presentations, essays and communicating sociological research.',
     'https://fhsu.pressbooks.pub/socialresearch/front-matter/introduction/', 5),
    ('choose_area', 'Choose a specialised area',
     'Choose an area only after understanding the shared foundation; an area adds methods and capabilities rather than replacing it.',
     'Supported by the two current D078 subgroup records: Social & Economic Research and Computational Social Science & Quantitative Methods.',
     NULL, 6)
) AS rows(stage, item_name, priority_reason, evidence_note, resource_url, display_order)
WHERE d.domain_key = 'D078';

-- Mark the reviewed records so the API can distinguish them from broad
-- imported references and role-aggregated resource rows. Scope the delete by
-- this migration's provenance labels; never remove an unrelated reviewed row.
DELETE FROM skillup_dev.career_learning_resources
WHERE source_provenance ->> 'guidance_layer' IN (
    'sociology_programme_v1',
    'social_sciences_domain_v1',
    'computational_social_science_v1',
    'statistician_role_v1'
);

-- Programme-owned resources: the canonical Sociology programme gets links
-- for its curriculum, research, evidence and statistics foundations.
WITH parent AS (
    SELECT id
    FROM skillup_dev.programmes
    WHERE lower(name) = 'sociology'
    ORDER BY id
    LIMIT 1
)
INSERT INTO skillup_dev.career_learning_resources
    (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type,
     target_name, provider, region, access_type, delivery, url, source_url,
     description, source_confidence, data_state, source_provenance)
SELECT
    gen_random_uuid(), parent.id, NULL, NULL, NULL, 'programme', 'approved_guidance_v1', rows.resource_type,
    rows.target_name, rows.provider, 'global',
    CASE WHEN rows.delivery LIKE 'publisher reference%' THEN 'paid' ELSE 'free' END,
    rows.delivery,
    rows.url, rows.url, rows.description, 'high', 'source_backed',
    jsonb_build_object('review_status', 'approved_guidance_v1', 'ownership', 'programme_owned', 'programme', 'Sociology', 'guidance_layer', 'sociology_programme_v1')
FROM parent
CROSS JOIN (VALUES
    ('programme_reading', 'Sociology: Themes and Perspectives (8th edition)', 'Collins', 'publisher reference; paid or library access', 'https://collins.co.uk/products/9780007498826', 'A recognised Sociology reference text by Michael Haralambos and Martin Holborn. The catalogue does not claim it is a universal required text; use a legal library or publisher copy.'),
    ('programme_reading', 'Sociology', 'Wiley', 'publisher reference; paid or library access', 'https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2', 'Anthony Giddens Sociology reference text. Use it as a supporting theory and contemporary-society reference, not as a universal admission or course requirement.'),
    ('programme_reading', 'Introduction to Sociology 3e', 'OpenStax', 'free open textbook', 'https://openstax.org/books/introduction-sociology-3e/pages/1-introduction', 'A legal, openly licensed free textbook for introductory concepts, theories, culture, institutions, research methods and social change.'),
    ('domain_overview', 'Understand the social sciences', 'The Open University', 'free introductory course', 'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0', 'A first orientation to the social sciences, their questions and real-world examples.'),
    ('domain_overview', 'Introduction to Sociology 3e', 'OpenStax', 'free open textbook', 'https://openstax.org/books/introduction-sociology-3e/pages/1-introduction', 'An open introductory Sociology text covering concepts, theories, culture, institutions and social change.'),
    ('skill_learning', 'Research ethics', 'The Open University', 'free course', 'https://www.open.edu/openlearn/education-development/becoming-ethical-researcher', 'A free course on ethical planning, conduct and reporting of research involving people.'),
    ('skill_learning', 'Reading qualitative and quantitative evidence', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 'A free course on presenting, organising and interpreting qualitative and quantitative evidence.'),
    ('skill_learning', 'Social science research methods', 'University of Southern Queensland Pressbooks', 'free open textbook', 'https://usq.pressbooks.pub/socialscienceresearch/', 'An open text covering the research process, design, measurement, sampling and survey research.'),
    ('skill_learning', 'Research data management', 'University of Edinburgh MANTRA', 'free self-paced course', 'https://mantra.ed.ac.uk/', 'A free course on planning, organising, documenting, safeguarding and sharing research data.'),
    ('skill_learning', 'Statistics and probability', 'Khan Academy', 'free guided practice', 'https://www.khanacademy.org/statistics-probability', 'Free guided statistics and probability practice for building the quantitative foundation.')
) AS rows(resource_type, target_name, provider, delivery, url, description);

-- Domain-owned orientation and foundation resources.
WITH parent AS (
    SELECT id FROM skillup_dev.domains WHERE domain_key = 'D078'
)
INSERT INTO skillup_dev.career_learning_resources
    (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type,
     target_name, provider, region, access_type, delivery, url, source_url,
     description, source_confidence, data_state, source_provenance)
SELECT
    gen_random_uuid(), NULL, parent.id, NULL, NULL, 'domain', 'approved_guidance_v1', rows.resource_type,
    rows.target_name, rows.provider, 'global', 'free', rows.delivery,
    rows.url, rows.url, rows.description, 'high', 'source_backed',
    jsonb_build_object('review_status', 'approved_guidance_v1', 'ownership', 'domain_owned', 'domain_key', 'D078', 'guidance_layer', 'social_sciences_domain_v1')
FROM parent
CROSS JOIN (VALUES
    ('domain_overview', 'Understand Social Sciences', 'The Open University', 'free introductory course', 'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0', 'Start with what Social Sciences studies and the kinds of questions it asks.'),
    ('skill_learning', 'Ask social-science questions', 'The Open University', 'free course section', 'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-4.1', 'Examples of empirical, policy, ethical and philosophical social-science questions.'),
    ('skill_learning', 'Ask good research questions', 'The Open University', 'free interactive course section', 'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-4.2', 'Practice making questions clear, focused and researchable.'),
    ('skill_learning', 'Read social-science evidence', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 'Learn how qualitative and quantitative evidence can be presented and interpreted.'),
    ('skill_learning', 'Research ethics', 'The Open University', 'free course', 'https://www.open.edu/openlearn/education-development/becoming-ethical-researcher', 'Understand ethical decisions when research involves people.'),
    ('skill_learning', 'Social science research', 'University of Southern Queensland Pressbooks', 'free open textbook', 'https://usq.pressbooks.pub/socialscienceresearch/', 'Follow the research process from design through data collection and analysis.'),
    ('skill_learning', 'Research data management', 'University of Edinburgh MANTRA', 'free self-paced course', 'https://mantra.ed.ac.uk/', 'Learn to organise, document, protect and share research data.'),
    ('skill_learning', 'OpenIntro Statistics', 'OpenIntro', 'free open textbook and activities', 'https://www.openintro.org/book/os/', 'Use an open statistics text, datasets and activities when quantitative work is appropriate.'),
    ('skill_learning', 'research design', 'University of Southern Queensland Pressbooks', 'free open textbook', 'https://usq.pressbooks.pub/socialscienceresearch/', 'Use this open research-methods text to understand how a social question becomes a study design.'),
    ('skill_learning', 'evidence review', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 'Learn how to read, organise and interpret evidence before drawing a conclusion.'),
    ('skill_learning', 'scientific communication', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 'Use this evidence-reading material as a starting point for explaining findings clearly.'),
    ('skill_learning', 'formulate research questions', 'The Open University', 'free interactive course section', 'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-4.2', 'Practise turning an interest in society into a clear, focused and researchable question.'),
    ('skill_learning', 'evaluate evidence', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 'Learn to examine evidence and consider what it can and cannot show.'),
    ('skill_learning', 'document and communicate findings', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 'Use this as a foundation for presenting evidence and findings with appropriate care.')
) AS rows(resource_type, target_name, provider, delivery, url, description);

-- Computational Social Science subgroup resources. These are options, not a
-- mandatory software stack and not a claim that the subgroup has one course.
WITH parent AS (
    SELECT sg.id
    FROM skillup_dev.domain_subgroups sg
    JOIN skillup_dev.domains d ON d.id = sg.domain_id
    WHERE d.domain_key = 'D078'
      AND sg.label = 'Computational Social Science & Quantitative Methods'
)
INSERT INTO skillup_dev.career_learning_resources
    (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type,
     target_name, provider, region, access_type, delivery, url, source_url,
     description, source_confidence, data_state, source_provenance)
SELECT
    gen_random_uuid(), NULL, NULL, parent.id, NULL, 'subgroup', 'approved_guidance_v1', rows.resource_type,
    rows.target_name, rows.provider, 'global', 'free', rows.delivery,
    rows.url, rows.url, rows.description, 'high', 'source_backed',
    jsonb_build_object('review_status', 'approved_guidance_v1', 'ownership', 'subgroup_owned', 'domain_key', 'D078', 'guidance_layer', 'computational_social_science_v1')
FROM parent
CROSS JOIN (VALUES
    ('skill_learning', 'Social-science research methods', 'University of Southern Queensland Pressbooks', 'free open textbook', 'https://usq.pressbooks.pub/socialscienceresearch/', 'Broad research-methods foundation; not a subgroup-specific catalogue.'),
    ('skill_learning', 'Research Data MANTRA', 'University of Edinburgh', 'free self-paced course', 'https://mantra.ed.ac.uk/', 'Research data planning, organisation, metadata, security and sharing.'),
    ('skill_learning', 'Spreadsheets for social scientists', 'Data Carpentries', 'free lesson', 'https://datacarpentry.github.io/spreadsheets-socialsci/', 'Data organisation, quality checks and spreadsheet workflows; Excel is one option, not the only one.'),
    ('skill_learning', 'R for social scientists', 'Data Carpentries', 'free lesson', 'https://datacarpentry.github.io/r-socialsci/', 'Beginner R workflows for importing, cleaning, summarising and plotting social-science data.'),
    ('skill_learning', 'Python for social scientists', 'Data Carpentries', 'free alpha lesson', 'https://datacarpentry.github.io/python-socialsci/', 'Python, Pandas, visualisation and SQLite; the lesson is explicitly alpha.'),
    ('skill_learning', 'SQL for social scientists', 'Data Carpentries', 'free alpha lesson', 'https://datacarpentry.github.io/sql-socialsci/', 'SQL for working with structured data; the lesson is explicitly alpha.'),
    ('skill_learning', 'Interactive SQL practice', 'SQLBolt', 'free interactive lessons', 'https://sqlbolt.com/', 'Browser-based SQL practice covering queries, joins and aggregates.'),
    ('skill_learning', 'OpenIntro Statistics', 'OpenIntro', 'free open textbook and activities', 'https://www.openintro.org/book/os/', 'Statistics text, datasets and activities.'),
    ('skill_learning', 'Introduction to Social Network Methods', 'University of California, Riverside', 'free online textbook', 'https://faculty.ucr.edu/~hanneman/nettext/C0_Preface.html', 'Undergraduate introduction to social-network concepts and methods.'),
    ('tool_learning', 'Python documentation and tutorial', 'Python Software Foundation', 'official documentation', 'https://www.python.org/about/gettingstarted/', 'Python is one possible computational tool; it is not a requirement for every Social Sciences route.'),
    ('tool_learning', 'R for Data Science', 'Hadley Wickham and Garrett Grolemund', 'free online book', 'https://r4ds.hadley.nz/', 'A free R data-workflow book covering import, transformation, visualisation and reproducible work.'),
    ('tool_learning', 'SAS Programming 1: Essentials', 'SAS', 'free self-paced course', 'https://www.sas.com/sas/training/forms/roles/sas-programming-course.html', 'A free SAS programming course; SAS is one option among several.'),
    ('tool_learning', 'Stata tutorials and webinars', 'Stata', 'free tutorials and webinars', 'https://www.stata.com/learn/', 'Official free tutorials and webinars; not presented as a complete course.'),
    ('tool_learning', 'Apache Spark documentation', 'Apache Spark', 'official documentation and quick starts', 'https://spark.apache.org/documentation', 'Documentation for larger-scale processing; only relevant when the project needs it.'),
    ('tool_learning', 'Power BI fundamentals', 'Microsoft Learn', 'free learning module', 'https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/', 'A free beginner visualisation module; Power BI is one reporting option.'),
    ('tool_learning', 'ArcGIS lessons', 'Esri', 'free public lessons', 'https://learn.arcgis.com/en/', 'Public lessons for spatial research; some product tutorials may require access to ArcGIS.')
) AS rows(resource_type, target_name, provider, delivery, url, description);

-- Statistician role resources. Keep these at role level: they explain role
-- preparation and must not be promoted to the whole Social Sciences domain.
WITH parent AS (
    SELECT r.id
    FROM skillup_dev.domain_roles r
    WHERE r.role_key = 'D078|statistician'
)
INSERT INTO skillup_dev.career_learning_resources
    (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type,
     target_name, provider, region, access_type, delivery, url, source_url,
     description, source_confidence, data_state, source_provenance)
SELECT
    gen_random_uuid(), NULL, NULL, NULL, parent.id, 'role', 'approved_guidance_v1', rows.resource_type,
    rows.target_name, rows.provider, 'global', 'free', rows.delivery,
    rows.url, rows.url, rows.description, 'high', 'source_backed',
    jsonb_build_object('review_status', 'approved_guidance_v1', 'ownership', 'role_owned', 'role_key', 'D078|statistician', 'guidance_layer', 'statistician_role_v1')
FROM parent
CROSS JOIN (VALUES
    ('role_reference', 'Statistician occupation reference', 'ESCO', 'public occupation reference', 'https://esco.ec.europa.eu/en/classification/occupation?text=statistician', 'Reference for what the occupation involves; not a course or employment guarantee.'),
    ('skill_learning', 'OpenIntro Statistics', 'OpenIntro', 'free open textbook and activities', 'https://www.openintro.org/book/os/', 'Build the statistics foundation before choosing a software package.'),
    ('skill_learning', 'Statistics and probability practice', 'Khan Academy', 'free guided practice', 'https://www.khanacademy.org/statistics-probability', 'Guided practice for statistics and probability.'),
    ('skill_learning', 'Python for social scientists', 'Data Carpentries', 'free alpha lesson', 'https://datacarpentry.github.io/python-socialsci/', 'One option for reproducible data work; explicitly alpha.'),
    ('skill_learning', 'R for social scientists', 'Data Carpentries', 'free lesson', 'https://datacarpentry.github.io/r-socialsci/', 'One option for importing, cleaning and analysing data in R.'),
    ('skill_learning', 'Getting started with SPSS', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/getting-started-spss/content-section-0', 'A free SPSS introduction; SPSS is an option, not a universal requirement.'),
    ('skill_learning', 'SAS Programming 1: Essentials', 'SAS', 'free self-paced course', 'https://www.sas.com/sas/training/forms/roles/sas-programming-course.html', 'A free SAS programming option.'),
    ('tool_learning', 'Stata tutorials and webinars', 'Stata', 'free tutorials and webinars', 'https://www.stata.com/learn/', 'Official Stata tutorials and webinars.'),
    ('skill_learning', 'Introduction to Social Network Methods', 'University of California, Riverside', 'free online textbook', 'https://faculty.ucr.edu/~hanneman/nettext/C0_Preface.html', 'A later specialisation option for network analysis.'),
    ('tool_learning', 'Power BI fundamentals', 'Microsoft Learn', 'free learning module', 'https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/', 'One reporting and visualisation option for communicating results.'),
    ('tool_learning', 'R for Data Science', 'Hadley Wickham and Garrett Grolemund', 'free online book', 'https://r4ds.hadley.nz/', 'A deeper R workflow option for reproducible analysis.')
) AS rows(resource_type, target_name, provider, delivery, url, description);

-- Programme-owned context cards. These explain how the recorded Sociology
-- curriculum capabilities fit together before the student follows a domain.
-- Haralambos/Holborn and Giddens are lawful publisher/library references;
-- OpenStax is the free open-text alternative. None is presented as a
-- universal required text for every Nigerian university.
WITH parent AS (
    SELECT id FROM skillup_dev.programmes
    WHERE lower(name) = 'sociology'
    ORDER BY id
    LIMIT 1
)
INSERT INTO skillup_dev.career_context_items
    (context_level, context_key, domain_key, item_type, item_key, name,
     plain_meaning, contextual_use, expected_output, priority, priority_reason,
     prerequisites, related_items, source_ids, source_references, source_locators,
     geographic_scope, evidence_limitations, evidence_type, source_confidence,
     data_state, guidance_owner, verified_at)
SELECT
    'programme', parent.id::text, 'D078', rows.item_type, rows.item_key, rows.name,
    rows.plain_meaning, rows.contextual_use, rows.expected_output, rows.priority,
    rows.priority_reason, rows.prerequisites::jsonb, rows.related_items::jsonb,
    rows.source_ids::text[], rows.source_references::jsonb, rows.source_locators::jsonb,
    rows.geographic_scope, rows.evidence_limitations::jsonb, 'source_supported_synthesis',
    'high', 'source_backed', 'programme', '2026-09-12'
FROM parent
CROSS JOIN (VALUES
    ('skill', 'understand-people-groups-and-institutions', 'Understand people, groups and institutions',
     'Sociology studies how people live together and how groups, institutions and cultures shape social life.',
     'This is the programme foundation. It comes from the introductory Sociology, Anthropology, Psychology, Family and Nigerian Society courses.',
     'A clear explanation of a social pattern, group, institution or community.', 'start_here',
     'Start here because the CCMAS Sociology curriculum begins with society, culture, socialisation, groups and institutions.',
     '[]', '["Learn sociological ideas and theories", "Understand Nigerian and African societies"]',
     '{ccmas_sociology,openstax_sociology}',
     '[{"id":"openstax_sociology","title":"OpenStax Introduction to Sociology 3e","url":"https://openstax.org/books/introduction-sociology-3e/pages/1-introduction","region":"global","evidenceType":"free_open_textbook"}]',
     '[{"courseCodes":["SOC 101","SOC 102","SOC 103","SOC 104","SOC 203","SOC 206"]}]', 'global',
     '["The curriculum record shows what the programme is designed to teach; it does not mean the student already has the capability."]'),
    ('skill', 'sociological-ideas-and-theories', 'Learn sociological ideas and theories',
     'This covers the concepts and theories used to explain social order, change, inequality, family, institutions and development.',
     'The programme moves from introductory concepts into classical and contemporary ways of explaining society.',
     'A reasoned explanation that connects a social issue to an appropriate concept or theory.', 'build_next',
     'Build this after the foundation because the CCMAS record places social thought and theory after introductory Sociology.',
     '["Understand people, groups and institutions"]', '["Understand Nigerian and African societies", "Ask sociological questions"]',
     '{ccmas_sociology,openstax_sociology,haralambos_holborn,giddens_sociology}',
     '[{"id":"openstax_sociology","title":"OpenStax Introduction to Sociology 3e","url":"https://openstax.org/books/introduction-sociology-3e/pages/1-introduction","region":"global","evidenceType":"free_open_textbook"},{"id":"haralambos_holborn","title":"Sociology: Themes and Perspectives (8th edition)","url":"https://collins.co.uk/products/9780007498826","region":"global","evidenceType":"publisher_reference"},{"id":"giddens_sociology","title":"Sociology by Anthony Giddens","url":"https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2","region":"global","evidenceType":"publisher_reference"}]',
     '[{"courseCodes":["SOC 101","SOC 105","SOC 106","SOC 201","SOC 202","SOC 203"]}]', 'global',
     '["Haralambos/Holborn and Giddens are reference books, not confirmed universal course requirements or free books."]'),
    ('skill', 'understand-nigerian-and-african-societies', 'Understand Nigerian and African societies',
     'This is the study of Nigerian and African cultures, institutions, political structures, social diversity and social change in context.',
     'The programme uses Nigerian and African examples so that social ideas are not treated as if they only describe another country.',
     'A context-aware comparison or explanation that identifies the evidence and setting being discussed.', 'build_next',
     'Build this because Nigerian and African society courses are explicit parts of the Sociology curriculum.',
     '["Understand people, groups and institutions"]', '["Learn sociological ideas and theories", "Study social problems and change"]',
     '{ccmas_sociology,openstax_sociology,niser}',
     '[{"id":"openstax_sociology","title":"OpenStax Introduction to Sociology 3e","url":"https://openstax.org/books/introduction-sociology-3e/pages/1-introduction","region":"global","evidenceType":"free_open_textbook"},{"id":"niser","title":"Nigerian Institute of Social and Economic Research","url":"https://niser.gov.ng/","region":"nigeria","evidenceType":"nigerian_research_context"}]',
     '[{"courseCodes":["GST 112","SOC 103","SOC 206","SOC 403"]}]', 'nigeria_to_global',
     '["The linked NISER site is research context, not a substitute for the full CCMAS course or a professional licence."]'),
    ('competency', 'ask-sociological-questions', 'Ask sociological questions',
     'This means turning curiosity about society into a clear question that can be investigated responsibly.',
     'Research Methods I and II, social research and project courses place questions before methods and conclusions.',
     'A focused research question and a defensible plan for answering it.', 'build_next',
     'Build this before collecting data because a method is only useful when it answers a clear question.',
     '["Learn sociological ideas and theories"]', '["Gather and evaluate evidence", "Use research methods"]',
     '{ccmas_sociology,openlearn_questions,usq_social_research}',
     '[{"id":"openlearn_questions","title":"Asking good questions","url":"https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-4.2","region":"global","evidenceType":"free_course_section"},{"id":"usq_social_research","title":"Social Science Research: Principles, Methods and Practices","url":"https://usq.pressbooks.pub/socialscienceresearch/","region":"global","evidenceType":"free_open_textbook"}]',
     '[{"courseCodes":["SSC 302","SOC 301","SSC 401","SOC 408"]}]', 'global',
     '["The resources teach research foundations; they do not replace supervision, ethics review or a university research project."]'),
    ('competency', 'gather-and-evaluate-evidence', 'Gather and evaluate evidence',
     'This covers finding, collecting, organising and judging information before using it to support a conclusion.',
     'Sociology records qualitative and quantitative methods, data collection, research integrity, source evaluation and evidence interpretation.',
     'An organised evidence set with a clear explanation of its limits and quality.', 'build_next',
     'Build this before analysis because the quality and context of evidence affect what can responsibly be concluded.',
     '["Ask sociological questions"]', '["Use research methods", "Analyse and communicate findings"]',
     '{ccmas_sociology,openlearn_evidence,mantra}',
     '[{"id":"openlearn_evidence","title":"Reading evidence","url":"https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence","region":"global","evidenceType":"free_course"},{"id":"mantra","title":"Research Data MANTRA","url":"https://mantra.ed.ac.uk/","region":"global","evidenceType":"free_self_paced_course"}]',
     '[{"courseCodes":["SOC 105","SOC 301","SSC 302","SSC 401","SOC 408"]}]', 'global',
     '["A source being linked does not make every claim in it true; students still need to assess evidence and limitations."]'),
    ('skill', 'use-research-methods-and-statistics', 'Use research methods and statistics',
     'This means choosing and applying qualitative, quantitative or mixed methods to investigate a social question.',
     'The CCMAS record includes research design, data collection, statistics, ethics, proposal writing and research reports.',
     'A research design, analysed dataset or report that explains the method used.', 'build_next',
     'Build this after the question and evidence foundation because method choice depends on the problem being investigated.',
     '["Ask sociological questions", "Gather and evaluate evidence"]', '["Analyse and communicate findings", "Computational Social Science & Quantitative Methods"]',
     '{ccmas_sociology,usq_social_research,openintro_statistics}',
     '[{"id":"usq_social_research","title":"Social Science Research: Principles, Methods and Practices","url":"https://usq.pressbooks.pub/socialscienceresearch/","region":"global","evidenceType":"free_open_textbook"},{"id":"openintro_statistics","title":"OpenIntro Statistics","url":"https://www.openintro.org/book/os/","region":"global","evidenceType":"free_open_textbook"}]',
     '[{"courseCodes":["SOC 301","SSC 302","SSC 401","SOC 408"]}]', 'global',
     '["Statistics is part of the programme record, but not every Sociology route requires advanced quantitative specialisation."]'),
    ('skill', 'communicate-findings', 'Analyse and communicate findings',
     'This means interpreting evidence and explaining the result clearly in writing, speech, presentation or report form.',
     'The programme outcomes include research papers, reports, essays, presentations and communication to different audiences.',
     'A clear report, presentation or argument that states the evidence, interpretation and limitations.', 'useful_later',
     'This follows investigation and analysis because communication should reflect what the evidence can actually support.',
     '["Gather and evaluate evidence", "Use research methods and statistics"]', '["Work ethically with people and evidence"]',
     '{ccmas_sociology,openstax_sociology,openlearn_evidence}',
     '[{"id":"openstax_sociology","title":"OpenStax Introduction to Sociology 3e","url":"https://openstax.org/books/introduction-sociology-3e/pages/1-introduction","region":"global","evidenceType":"free_open_textbook"},{"id":"openlearn_evidence","title":"Reading evidence","url":"https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence","region":"global","evidenceType":"free_course"}]',
     '[{"courseCodes":["GST 111","SOC 408"],"outcomeGroup":"communication and research reporting"}]', 'global',
     '["Good communication does not turn a limited study into a universal conclusion."]'),
    ('competency', 'work-ethically-with-people-and-evidence', 'Work ethically with people and evidence',
     'This means protecting people, treating information responsibly and explaining uncertainty rather than overstating a result.',
     'The curriculum records research integrity, ethics in social research, objectivity and responsible data collection.',
     'An ethically planned study, consent-aware data process or report that states limitations.', 'useful_later',
     'Ethics becomes essential when the research involves people, personal information or sensitive community issues.',
     '["Ask sociological questions", "Gather and evaluate evidence"]', '["Research data management", "Communicate findings"]',
     '{ccmas_sociology,openlearn_ethics,mantra}',
     '[{"id":"openlearn_ethics","title":"Becoming an ethical researcher","url":"https://www.open.edu/openlearn/education-development/becoming-ethical-researcher","region":"global","evidenceType":"free_course"},{"id":"mantra","title":"Research Data MANTRA","url":"https://mantra.ed.ac.uk/","region":"global","evidenceType":"free_self_paced_course"}]',
     '[{"courseCodes":["SOC 301","SSC 302","SSC 401","SOC 408"]}]', 'global',
     '["This is an educational and research-ethics pointer, not legal advice or a substitute for an institution''s ethics process."]'),
    ('skill', 'use-computers-and-find-information', 'Use computers and find information',
     'This covers computer applications, online information retrieval and digital handling of sociological information.',
     'SSC 202 records computer applications, information processing and the use of search engines to find online resources.',
     'A traceable search, organised file or computer-supported research task.', 'useful_later',
     'This appears after the core social and research foundation because technology supports the work rather than defining Sociology by itself.',
     '["Gather and evaluate evidence"]', '["Research data management", "Use research methods and statistics"]',
     '{ccmas_sociology,mantra}',
     '[{"id":"mantra","title":"Research Data MANTRA","url":"https://mantra.ed.ac.uk/","region":"global","evidenceType":"free_self_paced_course"}]',
     '[{"courseCodes":["SSC 202"]}]', 'global',
     '["The curriculum does not establish one required software brand; tools should be chosen for the task and available access."]')
) AS rows(item_type, item_key, name, plain_meaning, contextual_use, expected_output, priority, priority_reason, prerequisites, related_items, source_ids, source_references, source_locators, geographic_scope, evidence_limitations)
ON CONFLICT (context_level, context_key, item_type, item_key) DO UPDATE SET
    domain_key = EXCLUDED.domain_key,
    name = EXCLUDED.name,
    plain_meaning = EXCLUDED.plain_meaning,
    contextual_use = EXCLUDED.contextual_use,
    expected_output = EXCLUDED.expected_output,
    priority = EXCLUDED.priority,
    priority_reason = EXCLUDED.priority_reason,
    prerequisites = EXCLUDED.prerequisites,
    related_items = EXCLUDED.related_items,
    source_ids = EXCLUDED.source_ids,
    source_references = EXCLUDED.source_references,
    source_locators = EXCLUDED.source_locators,
    geographic_scope = EXCLUDED.geographic_scope,
    evidence_limitations = EXCLUDED.evidence_limitations,
    verified_at = EXCLUDED.verified_at;

COMMIT;
