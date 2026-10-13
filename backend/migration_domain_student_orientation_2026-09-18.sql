-- Student-facing domain orientation contract.
--
-- This is an additive content patch. It does not replace the domain taxonomy,
-- role records, or programme-to-domain mappings. The orientation is derived
-- from the reviewed domain-owned and Sociology/CCMAS evidence for D078. Role
-- prevalence is deliberately not used to define the domain foundation.

BEGIN;

UPDATE skillup_dev.domains
SET name = 'Social Sciences & Behavioural Research',
    description = 'Social Sciences & Behavioural Research studies how people behave, how societies and institutions work, and how social, economic, political and environmental conditions affect people''s lives. Researchers use evidence and social-science methods to understand these issues and help inform policy.',
    source_provenance = COALESCE(source_provenance, '{}'::jsonb) || jsonb_build_object(
      'student_orientation', jsonb_build_object(
        'shortIntro', 'Social Sciences & Behavioural Research studies how people behave, how societies and institutions work, and how social, economic, political and environmental conditions affect people''s lives.',
        'whatItStudies', 'You may study people, families, communities, culture, institutions, inequality, crime, work, politics and social change. The field looks at everyday experience and the wider systems that shape it.',
        'whatPeopleDo', 'Depending on their work, people may study communities, institutions or social patterns; gather information through surveys, interviews, observation or records; analyse quantitative evidence (information expressed as numbers) or qualitative evidence (people’s words and explanations); and report what the evidence can and cannot show.',
        'questions', jsonb_build_array(
          'How do families, communities and institutions shape people’s lives?',
          'How do inequality, crime and other social problems develop, and how do people respond?',
          'How do cultures, organisations and societies change over time?',
          'What can evidence show about whether a policy or programme is working?',
          'What patterns in social information reveal relationships among people, groups and institutions?'
        ),
        'outputs', jsonb_build_array(
          'Research questions, proposals and study plans',
          'Survey, interview, observation or fieldwork information',
          'Organised data, comparisons and interpretations',
          'Research reports and explanations of findings',
          'Recommendations when the evidence supports them'
        ),
        'howWorkHappens', jsonb_build_array(
          'Begin with a question about people, groups, institutions or social change.',
          'Choose a suitable approach, such as surveys, interviews, observation or document study; quantitative and qualitative approaches answer different kinds of questions.',
          'Gather and handle information responsibly, considering consent, privacy, context and limitations.',
          'Analyse the evidence and explain what it supports, what it does not show and what could be studied next.'
        ),
        'whereProgrammeFits', 'In Nigeria’s NUC curriculum, Sociology is one programme within Social Sciences. Its curriculum covers social structure, culture, groups, institutions, inequality, crime, family, social problems, social change and research. Other Social Sciences programmes may examine overlapping questions from different perspectives.',
        'decisionGuide', 'This field may interest you if you like asking why people and communities behave differently, understanding how institutions affect lives, investigating real social problems, or using evidence to explain change. You do not need to choose a specialised area before understanding the foundation.',
        'relatedProgrammes', jsonb_build_array('Anthropology', 'Criminology', 'Economics', 'Geography', 'Political Science', 'Psychology', 'Sociology'),
        'sourceNote', 'This short description is supported by the cited Social Sciences CCMAS scope and ILO occupation-group descriptions. It describes the field, not a promise of employment or qualification.',
        'orientationFieldEvidence', jsonb_build_object(
          'whatItStudies', jsonb_build_object(
            'reviewState', 'approved',
            'claim', 'You may study people, families, communities, culture, institutions, inequality, crime, work, politics and social change. The field looks at everyday experience and the wider systems that shape it.',
            'sources', jsonb_build_array(
              jsonb_build_object('title', 'NUC, Social Sciences CCMAS 2023', 'shortLabel', 'NUC Social Sciences CCMAS · printed p. 17', 'url', 'https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf', 'locator', 'Preamble, printed p. 17: human behaviour, institutions, environment and their interactions; Sociology curriculum, printed pp. 333–338.', 'jurisdiction', 'Nigeria', 'supports', 'Social Sciences scope and Nigerian Sociology curriculum topics'),
              jsonb_build_object('title', 'UNESCO, Social science research', 'shortLabel', 'UNESCO · introductory definition', 'url', 'https://www.unesco.org/en/query-list/s/social-science-research', 'locator', 'Introductory definition of social-science research as systematic study of human behaviour and societal structures.', 'jurisdiction', 'Global introductory reference', 'supports', 'Broad description of the subject matter; not an official UNESCO policy statement')
            )
          ),
          'whatPeopleDo', jsonb_build_object(
            'reviewState', 'approved',
            'claim', 'Depending on their work, people may study communities, institutions or social patterns; gather information through surveys, interviews, observation or records; analyse quantitative evidence (information expressed as numbers) or qualitative evidence (people’s words and explanations); and report what the evidence can and cannot show.',
            'sources', jsonb_build_array(
              jsonb_build_object('title', 'ILO, ISCO-08 Volume I', 'shortLabel', 'ILO ISCO-08 · groups 2631–2633', 'url', 'https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf', 'locator', 'Unit groups 2631–2633, printed pp. 161–163: occupation definitions and tasks include research, monitoring or gathering data, analysis, reports and policy advice.', 'jurisdiction', 'International occupational classification', 'supports', 'Selected occupational examples only; not a complete list of Social Sciences work'),
              jsonb_build_object('title', 'NUC, Social Sciences CCMAS 2023', 'shortLabel', 'NUC Sociology CCMAS · printed pp. 333–338', 'url', 'https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf', 'locator', 'Sociology curriculum course descriptions, outcomes and research project records, printed pp. 333–338.', 'jurisdiction', 'Nigeria', 'supports', 'What this Nigerian Sociology programme teaches; not the whole global domain')
            )
          ),
          'questions', jsonb_build_object(
            'reviewState', 'approved',
            'claim', jsonb_build_array('How do families, communities and institutions shape people’s lives?', 'How do inequality, crime and other social problems develop, and how do people respond?', 'How do cultures, organisations and societies change over time?', 'What can evidence show about whether a policy or programme is working?', 'What patterns in social information reveal relationships among people, groups and institutions?'),
            'sources', jsonb_build_array(
              jsonb_build_object('title', 'NUC, Social Sciences CCMAS 2023', 'shortLabel', 'NUC Social Sciences CCMAS · printed p. 17', 'url', 'https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf', 'locator', 'Preamble, printed p. 17: human behaviour, institutions, social problems, policy and comparative analysis.', 'jurisdiction', 'Nigeria', 'supports', 'Illustrative questions derived from the stated subject matter and aims; not an exhaustive question list'),
              jsonb_build_object('title', 'ILO, ISCO-08 Volume I', 'shortLabel', 'ILO ISCO-08 · groups 2631–2633', 'url', 'https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf', 'locator', 'Unit groups 2631–2633, printed pp. 161–163: selected tasks involving research, social/economic patterns, evaluation and policy advice.', 'jurisdiction', 'International occupational classification', 'supports', 'Illustrative occupational questions; not universal tasks')
            )
          ),
          'outputs', jsonb_build_object(
            'reviewState', 'approved',
            'claim', jsonb_build_array('Research questions, proposals and study plans', 'Survey, interview, observation or fieldwork information', 'Organised data, comparisons and interpretations', 'Research reports and explanations of findings', 'Recommendations when the evidence supports them'),
            'sources', jsonb_build_array(
              jsonb_build_object('title', 'NUC, Social Sciences CCMAS 2023', 'shortLabel', 'NUC Sociology CCMAS · printed pp. 334–335, 337–338', 'url', 'https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf', 'locator', 'Research methods and project course outcomes and content, printed pp. 334–335, 337–338.', 'jurisdiction', 'Nigeria', 'supports', 'Programme-level examples of research plans, methods and reports'),
              jsonb_build_object('title', 'ILO, ISCO-08 Volume I', 'shortLabel', 'ILO ISCO-08 · groups 2631–2633', 'url', 'https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf', 'locator', 'Unit groups 2631–2633, printed pp. 161–163: selected occupations prepare scholarly papers, reports and policy advice.', 'jurisdiction', 'International occupational classification', 'supports', 'Examples of occupational outputs, not outputs required of every practitioner')
            )
          ),
          'howWorkHappens', jsonb_build_object(
            'reviewState', 'approved',
            'claim', jsonb_build_array('Begin with a question about people, groups, institutions or social change.', 'Choose a suitable approach, such as surveys, interviews, observation or document study; quantitative and qualitative approaches answer different kinds of questions.', 'Gather and handle information responsibly, considering consent, privacy, context and limitations.', 'Analyse the evidence and explain what it supports, what it does not show and what could be studied next.'),
            'sources', jsonb_build_array(
              jsonb_build_object('title', 'NUC, Social Sciences CCMAS 2023', 'shortLabel', 'NUC Sociology CCMAS · printed pp. 334–335, 337–338', 'url', 'https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf', 'locator', 'Research methods, statistics, research planning and project records, printed pp. 334–335, 337–338.', 'jurisdiction', 'Nigeria', 'supports', 'The Nigerian Sociology curriculum sample and its research-learning sequence'),
              jsonb_build_object('title', 'UNESCO, Social science research', 'shortLabel', 'UNESCO · introductory definition', 'url', 'https://www.unesco.org/en/query-list/s/social-science-research', 'locator', 'Introductory definition describing systematic study through varied methodologies, including qualitative and quantitative analysis.', 'jurisdiction', 'Global introductory reference', 'supports', 'Broad method framing; not an official UNESCO policy statement')
            )
          ),
          'whereProgrammeFits', jsonb_build_object(
            'reviewState', 'approved',
            'claim', 'In Nigeria’s NUC curriculum, Sociology is one programme within Social Sciences. Its curriculum covers social structure, culture, groups, institutions, inequality, crime, family, social problems, social change and research. Other Social Sciences programmes may examine overlapping questions from different perspectives.',
            'sources', jsonb_build_array(
              jsonb_build_object('title', 'NUC, Social Sciences CCMAS 2023', 'shortLabel', 'NUC Social Sciences CCMAS · printed p. 17 and pp. 333–338', 'url', 'https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf', 'locator', 'Preamble, printed p. 17, and Sociology programme curriculum/outcomes, printed pp. 333–338.', 'jurisdiction', 'Nigeria', 'supports', 'This programme’s place in the Nigerian Social Sciences curriculum; not a global taxonomy of all programmes')
            )
          )
        ),
        'domainDescriptionEvidence', jsonb_build_object(
          'reviewState', 'approved',
          'reviewedOn', '2026-10-08',
          'claim', 'Social Sciences & Behavioural Research studies how people behave, how societies and institutions work, and how social, economic, political and environmental conditions affect people''s lives. Researchers use evidence and social-science methods to understand these issues and help inform policy.',
          'sources', jsonb_build_array(
            jsonb_build_object(
              'sourceId', 'nuc_social_sciences_ccmas_2023',
              'shortLabel', 'NUC Social Sciences CCMAS · printed p. 17',
              'title', 'NUC, Social Sciences Core Curriculum and Minimum Academic Standards (CCMAS), 2023',
              'url', 'https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf',
              'locator', 'Preamble, printed p. 17: subject matter includes individual behaviour, institutions in society, human behaviour, environment and their interactions; methods and objectives include analysing socio-economic, political and environmental problems.',
              'supports', 'domain scope, subject matter and use of social-science methods',
              'jurisdiction', 'Nigeria'
            ),
            jsonb_build_object(
              'sourceId', 'ilo_isco08_social_science_groups',
              'shortLabel', 'ILO ISCO-08 · groups 2631–2633',
              'title', 'ILO, International Standard Classification of Occupations (ISCO-08), Volume I',
              'url', 'https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf',
              'locator', 'Unit groups 2631–2633, printed pp. 161–163: economists, sociologists/anthropologists and political scientists; definitions and tasks include research, analysis and policy advice.',
              'supports', 'bounded occupational examples of evidence use and policy-related work',
              'jurisdiction', 'International'
            )
          ),
          'limitation', 'The NUC source is Nigerian curriculum scope, while ISCO-08 describes selected occupations rather than the complete global Social Sciences domain. This description is a concise orientation, not an exhaustive boundary or job-readiness statement.'
        )
      )
    )
WHERE domain_key = 'D078';

COMMIT;
