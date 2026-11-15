-- Generated from migration_guidance_ownership_and_sociology_resources_2026-09-11.sql.
-- Reconciles Sociology's exact theme-linked programme readings without replaying
-- the broader, insert-only migration. Safe to run repeatedly as one transaction.
BEGIN;

CREATE TEMP TABLE _sociology_theme_resource_seed
ON COMMIT DROP AS
SELECT * FROM skillup_dev.career_learning_resources WITH NO DATA;

WITH parent AS (
    SELECT id
    FROM skillup_dev.programmes
    WHERE lower(name) = 'sociology'
    ORDER BY id
    LIMIT 1
)
INSERT INTO _sociology_theme_resource_seed
    (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type,
     target_name, provider, region, access_type, delivery, url, source_url,
     description, source_confidence, data_state, source_provenance)
SELECT
    gen_random_uuid(), parent.id, NULL, NULL, NULL, 'programme', 'approved_guidance_v1', rows.resource_type,
    rows.target_name, rows.provider, CASE WHEN rows.provider = 'National Open University of Nigeria' THEN 'nigeria' ELSE 'global' END,
    CASE WHEN rows.delivery LIKE 'publisher reference%' THEN 'paid' ELSE 'free' END,
    rows.delivery,
    rows.url, rows.url, rows.description, 'high', 'source_backed',
    jsonb_build_object(
        'review_status', 'approved_guidance_v1',
        'ownership', 'programme_owned',
        'programme', 'Sociology',
        'guidance_layer', 'sociology_programme_v1',
        'theme_keys', CASE rows.target_name
            WHEN 'Sociology: Themes and Perspectives (8th edition)' THEN '["people", "ideas", "research", "social_issues", "governance"]'::jsonb
            WHEN 'Sociology' THEN '["ideas"]'::jsonb
            WHEN 'Introduction to Sociology 3e' THEN '["core", "people", "ideas", "research", "social_change", "social_issues", "governance"]'::jsonb
            WHEN 'Introduction to Sociology (NOUN courseware)' THEN '["people", "ideas", "social_change"]'::jsonb
            WHEN 'Research Methodology (NOUN Development Studies courseware)' THEN '["research"]'::jsonb
            WHEN 'Social Science Statistics (NOUN courseware)' THEN '["research"]'::jsonb
            WHEN 'Essay and report writing skills: reports (OpenLearn)' THEN '["shared_communication"]'::jsonb
            WHEN 'Nigerian Peoples and Culture (NOUN courseware)' THEN '["shared_nigerian_culture", "african_societies"]'::jsonb
            WHEN 'Analysis, argument and critical thinking (OpenLearn)' THEN '["shared_philosophy"]'::jsonb
            WHEN 'Principles and practices of peace education (OpenLearn)' THEN '["shared_peace_conflict"]'::jsonb
            WHEN 'History of Conflicts in Nigeria (NOUN courseware)' THEN '["shared_peace_conflict"]'::jsonb
            WHEN 'The History of African Development (AEHN open textbook)' THEN '["african_societies"]'::jsonb
            WHEN 'Production Systems in Pre-colonial Africa (AEHN, Chapter 3)' THEN '["african_societies"]'::jsonb
            WHEN 'African Demographics (AEHN, Chapter 8)' THEN '["african_societies"]'::jsonb
            WHEN 'Growing Cities: Urbanization in Africa (AEHN, Chapter 14)' THEN '["african_societies"]'::jsonb
            WHEN 'Entrepreneurship – from ideas to reality (OpenLearn)' THEN '["shared_enterprise"]'::jsonb
            WHEN 'Introducing computing and IT (OpenLearn)' THEN '["technology"]'::jsonb
            WHEN 'An introduction to social work (OpenLearn)' THEN '["applied_practice"]'::jsonb
            ELSE '[]'::jsonb
        END,
        'theme_descriptions', CASE rows.target_name
            WHEN 'Sociology: Themes and Perspectives (8th edition)' THEN jsonb_build_object(
                'people', 'The publisher contents list chapters on family (chapter 8), culture/socialisation/identity (chapter 11), and age/life course (chapter 13). Use relevant chapters as optional reference, not as a required reading sequence.',
                'ideas', 'The publisher contents list sociological theory as chapter 15. Use it to compare theoretical explanations introduced in the programme.',
                'research', 'The publisher contents list methodology as chapter 14. Use it as an optional reference on research methods; it does not replace the programme research sequence.',
                'social_issues', 'The publisher contents list chapters on stratification/class/inequality (chapter 1), sex and gender (chapter 2), poverty/social exclusion/welfare (chapter 4), and crime/deviance (chapter 6). These chapters support selected topics, not every social issue in the theme.',
                'governance', 'The publisher contents list power, politics and the state as chapter 9. Use it as a reference for those concepts; it is not a Nigeria-specific account of governance.'
            )
            WHEN 'Sociology' THEN jsonb_build_object(
                'ideas', 'The 9th-edition contents identify chapter 3 as “Theories and Perspectives.” Use it as optional support for comparing sociological explanations introduced under Ideas and foundations; it is not a prescribed course reading or coverage of every theme outcome.'
            )
            WHEN 'Introduction to Sociology 3e' THEN jsonb_build_object(
                'core', 'A free introductory textbook for building a first understanding of Sociology.',
                'people', 'Sections 3.1 (culture), 5.3 (socialisation) and 6.1 (groups) introduce related concepts. Examples in this U.S.-published text are not a substitute for Nigerian or African course material.',
                'ideas', 'Section 1.3 introduces functionalism, conflict theory and symbolic interactionism as ways to explain social life.',
                'research', 'Sections 2.1 and 2.2 introduce sociological research, evidence quality, research design and common methods. Treat this as supplementary, not the programme syllabus.',
                'social_change', 'Section 21.3 introduces social change and its causes; it is a general overview, not a Nigeria-specific development account.',
                'social_issues', 'Sections 9.1 (stratification), 12.2 (gender inequality) and 7.3 (crime and law) provide examples for selected topics. Several examples are U.S.-centred.',
                'governance', 'Section 17.1 introduces power and authority. Use it for basic concepts, not as a description of Nigerian government or political institutions.'
            )
            WHEN 'Introduction to Sociology (NOUN courseware)' THEN jsonb_build_object(
                'people', 'The courseware contents identify family and marriage (printed pp. 8–15), society and culture (pp. 16–21), socialisation (pp. 22–25), and social organisations/groups (pp. 50–65). Optional older NOUN courseware, not a national prescription.',
                'ideas', 'The course guide states its introductory scope and methods (guide pp. 1–2); Module 1, Unit 1 introduces the definition, origin, scope and methods of Sociology (printed pp. 1–7). Optional older NOUN courseware, not a replacement for the current CCMAS curriculum.',
                'social_change', 'Module 4, Unit 5 is Social Change (printed pp. 93–96). This is a NOUN course reference, not the full programme treatment of development.'
            )
            WHEN 'Research Methodology (NOUN Development Studies courseware)' THEN jsonb_build_object(
                'research', 'The 2024 NOUN Development Studies course guide covers research design, quantitative and qualitative methods, data collection, ethics and reporting (guide pp. iv–vi; Module 1 begins at printed p. 1, fieldwork/data collection at p. 27, analysis at p. 58, and reports/proposals at p. 68). Optional cross-programme material, not a Sociology course requirement.'
            )
            WHEN 'Social Science Statistics (NOUN courseware)' THEN jsonb_build_object(
                'research', 'The 2022 NOUN course guide is explicitly for social-science students. Relevant units include data collection/presentation (printed p. 43), sampling (p. 65), hypothesis testing (p. 79), correlation (p. 97) and regression (p. 105). Optional statistics practice, not a Sociology course requirement.'
            )
            WHEN 'Essay and report writing skills: reports (OpenLearn)' THEN jsonb_build_object(
                'shared_communication', 'OpenLearn section 4.2 explains the purpose and structure of reports. It supports the report-writing part of this shared course; it does not cover all English, reading, speaking or listening outcomes.'
            )
            WHEN 'Nigerian Peoples and Culture (NOUN courseware)' THEN jsonb_build_object(
                'shared_nigerian_culture', 'The course guide and study units introduce Nigerian peoples, culture areas and the evolution of Nigeria as a political unit (course guide pp. iv–vi; study units begin at printed p. 1). This is NOUN courseware, not a requirement common to all universities.',
                'african_societies', 'Use the Nigeria-specific units on peoples and culture areas as local examples only. The course does not cover all African societies and is not a substitute for the programme’s broader African-society material.'
            )
            WHEN 'Analysis, argument and critical thinking (OpenLearn)' THEN jsonb_build_object(
                'shared_philosophy', 'Section 8 practises examining claims, reasons and evidence using an everyday example. It supports the reasoning component; it is not a complete philosophy or formal-logic course.'
            )
            WHEN 'Principles and practices of peace education (OpenLearn)' THEN jsonb_build_object(
                'shared_peace_conflict', 'This free introductory course covers peace education, relationships and constructive approaches to conflict, especially in educational and community settings. It is not a full peace-and-conflict-studies course or Nigeria-specific conflict analysis.'
            )
            WHEN 'History of Conflicts in Nigeria (NOUN courseware)' THEN jsonb_build_object(
                'shared_peace_conflict', 'NOUN Modules 1 and 4 introduce concepts of conflict and peace and discuss Nigerian historical examples (printed pp. 1–20 and 60–83). This is Nigeria-specific institutional courseware, not a current conflict assessment or a universal requirement.'
            )
            WHEN 'The History of African Development (AEHN open textbook)' THEN jsonb_build_object(
                'african_societies', 'This open textbook approaches African societies through historical development. Selected chapters discuss pre-colonial production systems, population and urbanisation; they are examples, not complete coverage of the continent.'
            )
            WHEN 'Production Systems in Pre-colonial Africa (AEHN, Chapter 3)' THEN jsonb_build_object(
                'african_societies', 'Chapter 3 discusses pre-colonial African production systems and economic development. Use it as one historical example, not a general account of all African societies.'
            )
            WHEN 'African Demographics (AEHN, Chapter 8)' THEN jsonb_build_object(
                'african_societies', 'Chapter 8 discusses African population size, growth and links to social and political change. These historical/contextual examples do not replace current Nigerian demographic data.'
            )
            WHEN 'Growing Cities: Urbanization in Africa (AEHN, Chapter 14)' THEN jsonb_build_object(
                'african_societies', 'Chapter 14 explains African urban growth in historical and global perspective and discusses drivers and welfare consequences. It is a selected regional account, not a complete contemporary survey.'
            )
            WHEN 'Entrepreneurship – from ideas to reality (OpenLearn)' THEN jsonb_build_object(
                'shared_enterprise', 'The free course includes sessions on finding and testing ideas, developing a business model, funding and planning. Use relevant sessions as optional support; it is not a university course requirement or a guarantee of business success.'
            )
            WHEN 'Introducing computing and IT (OpenLearn)' THEN jsonb_build_object(
                'technology', 'This introductory course covers the information society (section 1.3), digital participation, online safety and computer data storage. It supports general digital context, not training in a specific office-software brand.'
            )
            WHEN 'An introduction to social work (OpenLearn)' THEN jsonb_build_object(
                'applied_practice', 'This introductory resource explains social work in its own professional and national context. It is optional background only; its UK examples and practice framework do not establish Nigerian qualification, licensing or employment requirements.'
            )
            ELSE '{}'::jsonb
        END,
        'theme_urls', CASE rows.target_name
            WHEN 'Sociology: Themes and Perspectives (8th edition)' THEN jsonb_build_object(
                'people', 'https://collins.co.uk/products/9780007498826',
                'ideas', 'https://collins.co.uk/products/9780007498826',
                'research', 'https://collins.co.uk/products/9780007498826',
                'social_issues', 'https://collins.co.uk/products/9780007498826',
                'governance', 'https://collins.co.uk/products/9780007498826'
            )
            WHEN 'Sociology' THEN jsonb_build_object(
                'ideas', 'https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2'
            )
            WHEN 'Introduction to Sociology 3e' THEN jsonb_build_object(
                'core', 'https://openstax.org/books/introduction-sociology-3e/pages/1-introduction',
                'people', 'https://openstax.org/books/introduction-sociology-3e/pages/3-1-what-is-culture',
                'ideas', 'https://openstax.org/books/introduction-sociology-3e/pages/1-3-theoretical-perspectives-in-sociology',
                'research', 'https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods',
                'social_change', 'https://openstax.org/books/introduction-sociology-3e/pages/21-3-social-change',
                'social_issues', 'https://openstax.org/books/introduction-sociology-3e/pages/9-1-what-is-social-stratification',
                'governance', 'https://openstax.org/books/introduction-sociology-3e/pages/17-1-power-and-authority'
            )
            WHEN 'Nigerian Peoples and Culture (NOUN courseware)' THEN jsonb_build_object(
                'shared_nigerian_culture', 'https://nou.edu.ng/coursewarecontent/GST%20201%20%20NIGERIAN%20PEOPLES%20AND%20CULTURE.pdf',
                'african_societies', 'https://nou.edu.ng/coursewarecontent/GST%20201%20%20NIGERIAN%20PEOPLES%20AND%20CULTURE.pdf'
            )
            WHEN 'Essay and report writing skills: reports (OpenLearn)' THEN jsonb_build_object(
                'shared_communication', 'https://www.open.edu/openlearn/mod/oucontent/view.php?id=4398&section=4.2'
            )
            WHEN 'Analysis, argument and critical thinking (OpenLearn)' THEN jsonb_build_object(
                'shared_philosophy', 'https://www.open.edu/openlearn/education-development/extending-and-developing-your-thinking-skills/content-section-8'
            )
            WHEN 'Principles and practices of peace education (OpenLearn)' THEN jsonb_build_object(
                'shared_peace_conflict', 'https://www.open.edu/openlearn/education-development/principles-and-practices-peace-education'
            )
            WHEN 'History of Conflicts in Nigeria (NOUN courseware)' THEN jsonb_build_object(
                'shared_peace_conflict', 'https://nou.edu.ng/coursewarecontent/PCR331%20HISTORY%20OF%20CONFLICTS%20IN%20NIGERIA.pdf'
            )
            WHEN 'The History of African Development (AEHN open textbook)' THEN jsonb_build_object(
                'african_societies', 'https://www.aehnetwork.org/textbook/'
            )
            WHEN 'Production Systems in Pre-colonial Africa (AEHN, Chapter 3)' THEN jsonb_build_object(
                'african_societies', 'https://www.aehnetwork.org/textbook/production-systems-in-pre-colonial-africa/'
            )
            WHEN 'African Demographics (AEHN, Chapter 8)' THEN jsonb_build_object(
                'african_societies', 'https://www.aehnetwork.org/textbook/how-many-people-are-too-many-people/'
            )
            WHEN 'Growing Cities: Urbanization in Africa (AEHN, Chapter 14)' THEN jsonb_build_object(
                'african_societies', 'https://www.aehnetwork.org/textbook/growing-cities-urbanization-in-africa/'
            )
            WHEN 'Entrepreneurship – from ideas to reality (OpenLearn)' THEN jsonb_build_object(
                'shared_enterprise', 'https://www.open.edu/openlearn/money-business/entrepreneurship-ideas-reality?active-tab=content-tab'
            )
            WHEN 'Introducing computing and IT (OpenLearn)' THEN jsonb_build_object(
                'technology', 'https://www.open.edu/openlearn/digital-computing/introducing-computing-and-it/content-section-1.3'
            )
            WHEN 'An introduction to social work (OpenLearn)' THEN jsonb_build_object(
                'applied_practice', 'https://www.open.edu/openlearn/health-sports-psychology/social-care-social-work/an-introduction-social-work/content-section-0?active-tab=content-tab'
            )
            ELSE '{}'::jsonb
        END,
        'access_terms_note', CASE
            WHEN rows.provider = 'National Open University of Nigeria'
                THEN 'NOUN states that e-Courseware is for educational use and prohibits commercial or financial use other than educational.'
            ELSE NULL
        END,
        'reading_scope', CASE
            WHEN rows.provider = 'National Open University of Nigeria' THEN 'nigerian_courseware_reference'
            WHEN rows.delivery LIKE 'publisher reference%' THEN 'recommended_reference'
            ELSE 'free_foundation_reference'
        END,
        'theme_rationales', CASE rows.target_name
            WHEN 'Sociology' THEN jsonb_build_object(
                'ideas', 'Wiley’s product page for ISBN 978-1-5095-3922-2 identifies the 9th edition and lists chapter 3, “Theories and Perspectives.” This edition-specific locator supports an Ideas and foundations association without borrowing the 10th edition’s contents or claiming a university prescription.'
            )
            ELSE '{}'::jsonb
        END,
        'theme_evidence', CASE rows.target_name
            WHEN 'Sociology' THEN jsonb_build_array(jsonb_build_object(
                'theme_key', 'ideas',
                'authority', 'Wiley / Polity Books',
                'url', 'https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2',
                'locator', '9th edition; ISBN 978-1-5095-3922-2; Chapter 3: Theories and Perspectives',
                'checked_on', '2026-10-22',
                'supports', 'Optional reference association with the Ideas and foundations theme.'
            ))
            ELSE '[]'::jsonb
        END,
        'source_checked_on', CASE WHEN rows.target_name = 'Sociology' THEN '2026-10-22' ELSE '2026-10-08' END,
        'authors', CASE rows.target_name
            WHEN 'Sociology: Themes and Perspectives (8th edition)' THEN 'Michael Haralambos and Martin Holborn'
            WHEN 'Sociology' THEN 'Anthony Giddens and Philip W. Sutton'
            WHEN 'Introduction to Sociology (NOUN courseware)' THEN 'Solomon Ojo (course developer/writer)'
            ELSE NULL
        END,
        'edition', CASE rows.target_name
            WHEN 'Sociology: Themes and Perspectives (8th edition)' THEN '8th edition'
            WHEN 'Sociology' THEN '9th edition'
            ELSE NULL
        END,
        'publication_year', CASE rows.target_name
            WHEN 'Sociology: Themes and Perspectives (8th edition)' THEN '2013'
            WHEN 'Sociology' THEN '2021'
            WHEN 'Introduction to Sociology (NOUN courseware)' THEN '2008; first printed 2004'
            ELSE NULL
        END,
        'isbn', CASE rows.target_name
            WHEN 'Sociology: Themes and Perspectives (8th edition)' THEN '978-0-00-749882-6'
            WHEN 'Sociology' THEN '978-1-5095-3922-2'
            WHEN 'Introduction to Sociology (NOUN courseware)' THEN '978-058-348-3'
            ELSE NULL
        END
    )
FROM parent
CROSS JOIN (VALUES
    ('programme_reading', 'Sociology: Themes and Perspectives (8th edition)', 'Collins', 'publisher reference; paid or library access', 'https://collins.co.uk/products/9780007498826', 'A recognised Sociology reference text by Michael Haralambos and Martin Holborn. The catalogue does not claim it is a universal required text; use a legal library or publisher copy.'),
    ('programme_reading', 'Sociology', 'Wiley', 'publisher reference; paid or library access', 'https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2', 'Anthony Giddens Sociology reference text. Use it as a supporting theory and contemporary-society reference, not as a universal admission or course requirement.'),
    ('programme_reading', 'Introduction to Sociology 3e', 'OpenStax', 'free open textbook', 'https://openstax.org/books/introduction-sociology-3e/pages/1-introduction', 'A legal, openly licensed free textbook for introductory concepts, theories, culture, institutions, research methods and social change.'),
    ('programme_reading', 'Introduction to Sociology (NOUN courseware)', 'National Open University of Nigeria', 'NOUN courseware; educational-use terms apply', 'https://nou.edu.ng/coursewarecontent/CSS111%20INTRODUCTION%20%20TO%20SOCIOLOGY.pdf', 'NOUN courseware (published 2008; first printed 2004) covering foundational Sociology topics. Use it as an optional institution-specific reference, not a current national prescription; follow NOUN''s stated use terms.'),
    ('programme_reading', 'Research Methodology (NOUN Development Studies courseware)', 'National Open University of Nigeria', 'NOUN courseware; educational-use terms apply', 'https://www.nou.edu.ng/coursewarecontent/DES%20311.pdf', 'The 2024 NOUN Development Studies courseware covers research design, quantitative and qualitative methods, data collection, analysis, ethics and reports. Optional cross-programme methods support, not a Sociology curriculum requirement.'),
    ('programme_reading', 'Social Science Statistics (NOUN courseware)', 'National Open University of Nigeria', 'NOUN courseware; educational-use terms apply', 'https://nou.edu.ng/coursewarecontent/FSS%20211%20SOCIAL%20SCIENCE%20STATISTICS.pdf', 'The 2022 NOUN courseware teaches social-science statistics, including data presentation, sampling, hypothesis testing, correlation and regression. Optional statistics practice, not a Sociology programme requirement.'),
    ('programme_reading', 'Essay and report writing skills: reports (OpenLearn)', 'The Open University', 'free open learning section', 'https://www.open.edu/openlearn/mod/oucontent/view.php?id=4398&section=4.2', 'Section 4.2 explains what reports are for and how clear report structure helps a reader. It supports the report-writing portion of GST 111 only; it does not cover all communication outcomes.'),
    ('programme_reading', 'Nigerian Peoples and Culture (NOUN courseware)', 'National Open University of Nigeria', 'NOUN courseware; educational-use terms apply', 'https://nou.edu.ng/coursewarecontent/GST%20201%20%20NIGERIAN%20PEOPLES%20AND%20CULTURE.pdf', 'NOUN course guide pp. iv–vi and study units introduce Nigerian peoples, culture areas and national development. A Nigeria-specific optional reference, not a universal Nigerian university requirement or a survey of all African societies.'),
    ('programme_reading', 'Analysis, argument and critical thinking (OpenLearn)', 'The Open University', 'free open learning section', 'https://www.open.edu/openlearn/education-development/extending-and-developing-your-thinking-skills/content-section-8', 'Section 8 introduces analysis, arguments, reasons and evidence through an everyday example. It supports reasoning practice, not the full philosophy curriculum.'),
    ('programme_reading', 'Principles and practices of peace education (OpenLearn)', 'The Open University', 'free introductory course; educational/community peace context', 'https://www.open.edu/openlearn/education-development/principles-and-practices-peace-education', 'A free introductory course on peace education, relationships and constructive approaches to conflict in educational/community settings. It is not a full peace-and-conflict-studies course or Nigeria-specific conflict analysis.'),
    ('programme_reading', 'History of Conflicts in Nigeria (NOUN courseware)', 'National Open University of Nigeria', 'NOUN courseware; educational-use terms apply', 'https://nou.edu.ng/coursewarecontent/PCR331%20HISTORY%20OF%20CONFLICTS%20IN%20NIGERIA.pdf', 'Modules 1 and 4 cover conflict concepts, peace, and historical Nigerian examples (printed pp. 1–20 and 60–83). Optional Nigeria-specific courseware, not a current conflict assessment or a universal requirement.'),
    ('programme_reading', 'The History of African Development (AEHN open textbook)', 'African Economic History Network', 'free open textbook', 'https://www.aehnetwork.org/textbook/', 'An open textbook for African university learners and teachers, with historical-development chapters. Selected chapters support examples about African societies; it is not comprehensive coverage of all African societies.'),
    ('programme_reading', 'Production Systems in Pre-colonial Africa (AEHN, Chapter 3)', 'African Economic History Network', 'free open textbook chapter', 'https://www.aehnetwork.org/textbook/production-systems-in-pre-colonial-africa/', 'Chapter 3 discusses pre-colonial African production systems and economic development; use it as a selected historical example.'),
    ('programme_reading', 'African Demographics (AEHN, Chapter 8)', 'African Economic History Network', 'free open textbook chapter', 'https://www.aehnetwork.org/textbook/how-many-people-are-too-many-people/', 'Chapter 8 discusses African population size, growth and social/political change; it is not a source for current Nigerian demographic estimates.'),
    ('programme_reading', 'Growing Cities: Urbanization in Africa (AEHN, Chapter 14)', 'African Economic History Network', 'free open textbook chapter', 'https://www.aehnetwork.org/textbook/growing-cities-urbanization-in-africa/', 'Chapter 14 explains African urban growth in historical and global perspective; use it as a selected regional account, not a complete contemporary survey.'),
    ('programme_reading', 'Entrepreneurship – from ideas to reality (OpenLearn)', 'The Open University', 'free open course', 'https://www.open.edu/openlearn/money-business/entrepreneurship-ideas-reality?active-tab=content-tab', 'A 24-hour optional course with sessions on idea generation, opportunity testing, business models and venture planning. It is supplementary to the shared entrepreneurship courses.'),
    ('programme_reading', 'Introducing computing and IT (OpenLearn)', 'The Open University', 'free open course', 'https://www.open.edu/openlearn/digital-computing/introducing-computing-and-it/content-section-1.3', 'An introductory course on digital life, information society, online safety and computing concepts. It provides context, not training in a particular office-software brand.'),
    ('programme_reading', 'An introduction to social work (OpenLearn)', 'The Open University', 'free open course; UK practice context', 'https://www.open.edu/openlearn/health-sports-psychology/social-care-social-work/an-introduction-social-work/content-section-0?active-tab=content-tab', 'An optional introductory resource for the applied social-work part of the theme. Its professional examples are UK-scoped and do not define Nigerian qualification or licensing requirements.'),
    ('domain_overview', 'Understand the social sciences', 'The Open University', 'free introductory course', 'https://www.open.edu/openlearn/society-politics-law/you-and-your-world-introducing-the-social-sciences/content-section-0', 'A first orientation to the social sciences, their questions and real-world examples.'),
    ('domain_overview', 'Introduction to Sociology 3e', 'OpenStax', 'free open textbook', 'https://openstax.org/books/introduction-sociology-3e/pages/1-introduction', 'An open introductory Sociology text covering concepts, theories, culture, institutions and social change.'),
    ('skill_learning', 'Research ethics', 'The Open University', 'free course', 'https://www.open.edu/openlearn/education-development/becoming-ethical-researcher', 'A free course on ethical planning, conduct and reporting of research involving people.'),
    ('skill_learning', 'Reading qualitative and quantitative evidence', 'The Open University', 'free course', 'https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence', 'A free course on presenting, organising and interpreting qualitative and quantitative evidence.'),
    ('skill_learning', 'Social science research methods', 'University of Southern Queensland Pressbooks', 'free open textbook', 'https://usq.pressbooks.pub/socialscienceresearch/', 'An open text covering the research process, design, measurement, sampling and survey research.'),
    ('skill_learning', 'Research data management', 'University of Edinburgh MANTRA', 'free self-paced course', 'https://mantra.ed.ac.uk/', 'A free course on planning, organising, documenting, safeguarding and sharing research data.'),
    ('skill_learning', 'Statistics and probability', 'Khan Academy', 'free guided practice', 'https://www.khanacademy.org/statistics-probability', 'Free guided statistics and probability practice for building the quantitative foundation.')
) AS rows(resource_type, target_name, provider, delivery, url, description)
WHERE rows.resource_type = 'programme_reading';

DO $$
DECLARE
    seeded_rows integer;
    duplicate_targets integer;
BEGIN
    SELECT count(*) INTO seeded_rows FROM _sociology_theme_resource_seed;
    IF seeded_rows <> 18 THEN
        RAISE EXCEPTION 'Expected 18 canonical Sociology programme-reading rows; found %', seeded_rows;
    END IF;

    SELECT count(*) INTO duplicate_targets
    FROM (
        SELECT lower(target_name)
        FROM skillup_dev.career_learning_resources
        WHERE programme_id IN (
            SELECT id FROM skillup_dev.programmes WHERE lower(name) = 'sociology'
        )
          AND resource_type = 'programme_reading'
          AND lower(target_name) IN (SELECT lower(target_name) FROM _sociology_theme_resource_seed)
        GROUP BY lower(target_name)
        HAVING count(*) > 1
    ) AS duplicates;
    IF duplicate_targets > 0 THEN
        RAISE EXCEPTION 'Sociology contains % duplicate programme-reading identities; resolve them before applying this repair', duplicate_targets;
    END IF;
END $$;

UPDATE skillup_dev.career_learning_resources AS target
SET target_name = source.target_name, ownership_scope = source.ownership_scope, review_status = source.review_status, provider = source.provider, region = source.region, access_type = source.access_type, delivery = source.delivery, url = source.url, source_url = source.source_url, description = source.description, source_confidence = source.source_confidence, data_state = source.data_state, source_provenance = source.source_provenance
FROM _sociology_theme_resource_seed AS source
WHERE target.programme_id = source.programme_id
  AND target.resource_type = source.resource_type
  AND lower(target.target_name) = lower(source.target_name)
  AND target.domain_id IS NULL
  AND target.subgroup_id IS NULL
  AND target.role_id IS NULL;

INSERT INTO skillup_dev.career_learning_resources (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope, review_status, resource_type, target_name, provider, region, access_type, delivery, url, source_url, description, source_confidence, data_state, source_provenance)
SELECT id,programme_id,domain_id,subgroup_id,role_id,ownership_scope,review_status,resource_type,target_name,provider,region,access_type,delivery,url,source_url,description,source_confidence,data_state,source_provenance
FROM _sociology_theme_resource_seed AS source
WHERE NOT EXISTS (
    SELECT 1
    FROM skillup_dev.career_learning_resources AS target
    WHERE target.programme_id = source.programme_id
      AND target.resource_type = source.resource_type
      AND lower(target.target_name) = lower(source.target_name)
);

DO $$
DECLARE
    mapped_rows integer;
    mapped_themes integer;
BEGIN
    SELECT count(*) INTO mapped_rows
    FROM skillup_dev.career_learning_resources AS target
    JOIN _sociology_theme_resource_seed AS source
      ON target.programme_id = source.programme_id
     AND target.resource_type = source.resource_type
     AND lower(target.target_name) = lower(source.target_name)
    WHERE target.ownership_scope = 'programme'
      AND target.review_status = 'approved_guidance_v1'
      AND target.data_state = 'source_backed'
      AND target.source_provenance ->> 'guidance_layer' = 'sociology_programme_v1';

    SELECT count(DISTINCT theme_key) INTO mapped_themes
    FROM skillup_dev.career_learning_resources AS target
    JOIN _sociology_theme_resource_seed AS source
      ON target.programme_id = source.programme_id
     AND target.resource_type = source.resource_type
     AND lower(target.target_name) = lower(source.target_name)
    CROSS JOIN LATERAL jsonb_array_elements_text(
      CASE WHEN jsonb_typeof(target.source_provenance -> 'theme_keys') = 'array'
           THEN target.source_provenance -> 'theme_keys' ELSE '[]'::jsonb END
    ) AS theme_keys(theme_key)
    WHERE target.source_provenance ->> 'guidance_layer' = 'sociology_programme_v1';

    IF mapped_rows <> 18 THEN
        RAISE EXCEPTION 'Expected 18 reviewed Sociology resource rows after repair; found %', mapped_rows;
    END IF;
    IF mapped_themes <> 15 THEN
        RAISE EXCEPTION 'Expected mapped resources for all 15 active Sociology themes; found %', mapped_themes;
    END IF;
END $$;

COMMIT;
