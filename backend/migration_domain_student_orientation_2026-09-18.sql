-- Student-facing domain orientation contract.
--
-- This is an additive content patch. It does not replace the domain taxonomy,
-- role records, or programme-to-domain mappings. The orientation is derived
-- from the reviewed domain-owned and Sociology/CCMAS evidence for D078. Role
-- prevalence is deliberately not used to define the domain foundation.

BEGIN;

UPDATE skillup_dev.domains
SET description = 'Social Sciences helps you understand how people live together, how groups and institutions shape everyday life, and how societies change. It connects questions about culture, family, work, inequality, crime, policy and community life to evidence gathered through research.',
    source_provenance = COALESCE(source_provenance, '{}'::jsonb) || jsonb_build_object(
      'student_orientation', jsonb_build_object(
        'shortIntro', 'Social Sciences helps you understand how people live together, how groups and institutions shape everyday life, and how societies change.',
        'whatItStudies', 'You may study people, families, communities, culture, organisations, institutions, inequality, crime, work, politics and social change. The field is interested in both everyday experience and the larger systems that influence it.',
        'whatPeopleDo', 'People in this field turn questions about society into investigations. Depending on the area, they may compare communities, study records, interview or survey people, observe social settings, analyse quantitative or qualitative evidence, and explain what the findings mean for research, policy, education, organisations or communities.',
        'questions', jsonb_build_array(
          'How do families, communities and institutions shape people''s lives?',
          'Why do inequality, crime and other social problems develop, and how do people respond to them?',
          'How do cultures, organisations and societies change over time?',
          'How can evidence help us understand whether a policy, programme or intervention is working?',
          'What patterns in social information reveal relationships between people, groups and institutions?'
        ),
        'outputs', jsonb_build_array(
          'research questions, proposals and study plans',
          'interview, survey, observation or fieldwork records',
          'organised data, comparisons and interpretations of evidence',
          'research reports, presentations and explanations for different audiences',
          'policy, programme or community recommendations where the evidence supports them'
        ),
        'howWorkHappens', jsonb_build_array(
          'Start with a question about people, groups, institutions or social change.',
          'Choose a suitable approach, such as interviews, observation, surveys, document study, qualitative analysis or quantitative analysis.',
          'Gather and handle information ethically, with attention to consent, privacy, context and limitations.',
          'Compare and analyse the evidence instead of treating an opinion as a conclusion.',
          'Communicate what the evidence shows, what it does not show and what could be investigated next.'
        ),
        'whereProgrammeFits', 'Sociology is one programme within Social Sciences. It focuses especially on social structure, culture, socialisation, groups, institutions, inequality, crime, family, social problems, social change and research. Other programmes may study the same field from a different centre, such as economics, politics, psychology, geography, anthropology or criminology.',
        'decisionGuide', 'This field may interest you if you like asking why people and communities behave differently, understanding how institutions affect lives, investigating real social problems, or using evidence to explain change. You do not need to choose a specialised area before understanding the foundation.',
        'relatedProgrammes', jsonb_build_array('Anthropology', 'Criminology', 'Economics', 'Geography', 'Political Science', 'Psychology', 'Sociology'),
        'sourceNote', 'Student explanation synthesized from the reviewed Social Sciences domain record, Sociology CCMAS curriculum contract, programme-domain evidence and reviewed Nigerian research context. It is not a demand, salary, licensing or employment promise.'
      )
    )
WHERE domain_key = 'D078';

COMMIT;
