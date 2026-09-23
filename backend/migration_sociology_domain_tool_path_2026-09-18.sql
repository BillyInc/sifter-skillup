-- Reviewed D078 domain tool pathway.
-- Run after migration_guidance_ownership_and_sociology_resources_2026-09-11.sql
-- and before migration_guidance_global_2026-09-11.sql.
--
-- The existing D078 inventory is role-derived. This additive overlay promotes
-- only repeatedly evidenced, named tools into an optional domain pathway. It
-- does not turn role frequency into a requirement or a ranking. The frontend
-- groups these tools by their source-purpose category and asks the student to
-- choose a purpose before choosing a tool.

BEGIN;

ALTER TABLE skillup_dev.domain_tools
    ADD COLUMN IF NOT EXISTS purpose_key TEXT,
    ADD COLUMN IF NOT EXISTS purpose_label TEXT,
    ADD COLUMN IF NOT EXISTS purpose_description TEXT,
    ADD COLUMN IF NOT EXISTS purpose_source JSONB NOT NULL DEFAULT '{}'::jsonb;

WITH parent AS (
    SELECT id
    FROM skillup_dev.domains
    WHERE domain_key = 'D078'
), promoted(tool_name, element_name, tool_url, purpose_key, purpose_label, purpose_description) AS (
    VALUES
        ('Microsoft Excel', 'Spreadsheet software', 'https://support.microsoft.com/en-us/excel', 'organise', 'Organise and inspect information', 'Prepare, sort and inspect tabular information before or alongside analysis.'),
        ('IBM SPSS Statistics', 'Analytical or scientific software', 'https://www.ibm.com/products/spss-statistics', 'analyse', 'Analyse evidence', 'Examine quantitative evidence through a guided statistical workflow.'),
        ('Python', 'Object or component oriented development software', 'https://www.python.org/about/gettingstarted/', 'compute', 'Compute and automate', 'Use programming when the work needs calculation, repeatable workflows or scale.'),
        ('R', 'Object or component oriented development software', 'https://r4ds.hadley.nz/', 'analyse', 'Analyse and visualise evidence', 'Analyse and visualise data through a reproducible statistical workflow.'),
        ('SAS', 'Analytical or scientific software', 'https://www.sas.com/sas/training/forms/roles/sas-programming-course.html', 'analyse', 'Analyse evidence', 'Carry out statistical programming when the project or workplace uses SAS.'),
        ('Structured query language SQL', 'Data base user interface and query software', 'https://sqlbolt.com/', 'organise', 'Organise and query information', 'Find, filter and combine structured information stored in a database.'),
        ('Microsoft Power BI', 'Business intelligence and data analysis software', 'https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/', 'communicate', 'Explain and present findings', 'Turn analysed information into visual explanations and dashboards.'),
        ('Tableau', 'Business intelligence and data analysis software', 'https://www.tableau.com/learn/training', 'communicate', 'Explain and present findings', 'Create visual explanations of patterns for other people to understand.'),
        ('ESRI ArcGIS software', 'Geographic information system', 'https://learn.arcgis.com/en/', 'map', 'Study place and space', 'Connect social questions to locations, communities and geographic patterns.'),
        ('Microsoft Access', 'Data base user interface and query software', 'https://support.microsoft.com/en-us/access', 'organise', 'Organise and query information', 'Store and query smaller structured datasets.')
)
-- The old D078 inventory also contains browsers, email/presentation tools,
-- generic Office labels and role-derived software categories. Keep those rows
-- for staff audit, but do not allow them to masquerade as Social Sciences
-- domain tools in the student view.
UPDATE skillup_dev.domain_tools t
SET guidance_owner = 'review_only',
    data_state = 'review_only',
    source_provenance = COALESCE(t.source_provenance, '{}'::jsonb) || jsonb_build_object(
        'student_visibility', 'review_only',
        'review_reason', 'Not a reviewed Social Sciences domain-owned purpose-first tool; retained for audit.'
    )
FROM parent
WHERE t.domain_id = parent.id
  AND t.scope = 'domain'
  AND lower(t.tool_name) NOT IN (
      SELECT lower(tool_name) FROM promoted
  );

WITH parent AS (
    SELECT id
    FROM skillup_dev.domains
    WHERE domain_key = 'D078'
), promoted(tool_name, element_name, tool_url, purpose_key, purpose_label, purpose_description) AS (
    VALUES
        ('Microsoft Excel', 'Spreadsheet software', 'https://support.microsoft.com/en-us/excel', 'organise', 'Organise and inspect information', 'Prepare, sort and inspect tabular information before or alongside analysis.'),
        ('IBM SPSS Statistics', 'Analytical or scientific software', 'https://www.ibm.com/products/spss-statistics', 'analyse', 'Analyse evidence', 'Examine quantitative evidence through a guided statistical workflow.'),
        ('Python', 'Object or component oriented development software', 'https://www.python.org/about/gettingstarted/', 'compute', 'Compute and automate', 'Use programming when the work needs calculation, repeatable workflows or scale.'),
        ('R', 'Object or component oriented development software', 'https://r4ds.hadley.nz/', 'analyse', 'Analyse and visualise evidence', 'Analyse and visualise data through a reproducible statistical workflow.'),
        ('SAS', 'Analytical or scientific software', 'https://www.sas.com/sas/training/forms/roles/sas-programming-course.html', 'analyse', 'Analyse evidence', 'Carry out statistical programming when the project or workplace uses SAS.'),
        ('Structured query language SQL', 'Data base user interface and query software', 'https://sqlbolt.com/', 'organise', 'Organise and query information', 'Find, filter and combine structured information stored in a database.'),
        ('Microsoft Power BI', 'Business intelligence and data analysis software', 'https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/', 'communicate', 'Explain and present findings', 'Turn analysed information into visual explanations and dashboards.'),
        ('Tableau', 'Business intelligence and data analysis software', 'https://www.tableau.com/learn/training', 'communicate', 'Explain and present findings', 'Create visual explanations of patterns for other people to understand.'),
        ('ESRI ArcGIS software', 'Geographic information system', 'https://learn.arcgis.com/en/', 'map', 'Study place and space', 'Connect social questions to locations, communities and geographic patterns.'),
        ('Microsoft Access', 'Data base user interface and query software', 'https://support.microsoft.com/en-us/access', 'organise', 'Organise and query information', 'Store and query smaller structured datasets.')
)
UPDATE skillup_dev.domain_tools t
SET guidance_owner = 'domain',
    tool_group = 'common',
    element_name = promoted.element_name,
    tool_url = promoted.tool_url,
    purpose_key = promoted.purpose_key,
    purpose_label = promoted.purpose_label,
    purpose_description = promoted.purpose_description,
    purpose_source = jsonb_build_object(
        'source_category', promoted.element_name,
        'promotion_basis', 'repeated named D078 role evidence',
        'student_rule', 'purpose first; choose one starting option; alternatives are not a checklist'
    ),
    source_confidence = COALESCE(t.source_confidence, 'high'),
    data_state = 'source_backed',
    source_provenance = COALESCE(t.source_provenance, '{}'::jsonb) || jsonb_build_object(
        'guidance_layer', 'social_sciences_domain_tool_path_v1',
        'ownership', 'domain_owned_optional',
        'promotion_basis', 'named source-backed tool repeated across at least five reviewed D078 role records',
        'student_rule', 'purpose first; alternatives are options, not requirements',
        'role_frequency_is_not_demand', true
    )
FROM parent, promoted
WHERE t.domain_id = parent.id
  AND t.scope = 'domain'
  AND t.tool_name = promoted.tool_name
  AND COALESCE(t.role_freq, 0) >= 5;

-- These promoted tools are covered by the relationship audit, but the source
-- records do not establish a universal tool -> skill/certification dependency.
-- Store that honestly instead of manufacturing a connection from proximity.
INSERT INTO skillup_dev.career_item_relationships
    (context_level, context_key, domain_key, from_item_type, from_item_key,
     from_name, relationship_type, relationship_status, source_ids,
     source_references, evidence_limitations, source_confidence, data_state,
     guidance_owner, verified_at)
SELECT
    'domain', 'D078', 'D078', 'tool',
    trim(both '-' from lower(regexp_replace(t.tool_name, '[^a-zA-Z0-9]+', '-', 'g'))),
    t.tool_name, 'not_established', 'not_established',
    ARRAY['D078_domain_tool_promotion'], '[]'::jsonb,
    '["The reviewed role evidence establishes use across the domain pathway, but not a universal dependency on a particular skill, competency or certification."]'::jsonb,
    'high', 'not_established', 'domain', '2026-09-18'
FROM skillup_dev.domain_tools t
JOIN skillup_dev.domains d ON d.id = t.domain_id
WHERE d.domain_key = 'D078'
  AND t.scope = 'domain'
  AND t.guidance_owner = 'domain'
  AND COALESCE(t.role_freq, 0) >= 5
  AND NOT EXISTS (
      SELECT 1
      FROM skillup_dev.career_item_relationships e
      WHERE e.context_level = 'domain'
        AND e.context_key = 'D078'
        AND e.from_item_type = 'tool'
        AND e.from_item_key = trim(both '-' from lower(regexp_replace(t.tool_name, '[^a-zA-Z0-9]+', '-', 'g')))
  );

WITH parent AS (
    SELECT id
    FROM skillup_dev.domains
    WHERE domain_key = 'D078'
)
DELETE FROM skillup_dev.career_learning_resources r
USING parent
WHERE r.domain_id = parent.id
  AND r.ownership_scope = 'domain'
  AND r.source_provenance ->> 'guidance_layer' = 'social_sciences_domain_tool_path_v1';

WITH parent AS (
    SELECT id
    FROM skillup_dev.domains
    WHERE domain_key = 'D078'
)
INSERT INTO skillup_dev.career_learning_resources
    (id, programme_id, domain_id, subgroup_id, role_id, ownership_scope,
     review_status, resource_type, target_name, provider, region, access_type,
     delivery, url, source_url, description, source_confidence, data_state,
     source_provenance)
SELECT
    gen_random_uuid(), NULL, parent.id, NULL, NULL, 'domain',
    'approved_guidance_v1', 'tool_learning', rows.target_name, rows.provider,
    'global', rows.access_type, rows.delivery, rows.url, rows.url,
    rows.description, 'high', 'source_backed',
    jsonb_build_object(
        'guidance_layer', 'social_sciences_domain_tool_path_v1',
        'ownership', 'domain_owned',
        'purpose_first', true,
        'student_rule', 'one starting option is enough; alternatives are not a checklist'
    )
FROM parent
CROSS JOIN (VALUES
    ('Microsoft Excel', 'Microsoft', 'free documentation and training', 'official documentation', 'https://support.microsoft.com/en-us/excel', 'Organise and inspect tabular information. Excel is one starting option, not the only way to prepare data.'),
    ('IBM SPSS Statistics', 'IBM', 'official product information', 'official product information', 'https://www.ibm.com/products/spss-statistics', 'Analyse quantitative evidence through a guided statistical workflow. Use it as one analysis option.'),
    ('Python', 'Python Software Foundation', 'free getting-started guide', 'official documentation', 'https://www.python.org/about/gettingstarted/', 'Compute, automate and extend analysis when a project needs programming. It is not required for every Social Sciences route.'),
    ('R', 'R for Data Science', 'free online book', 'open online book', 'https://r4ds.hadley.nz/', 'Analyse and visualise data through a reproducible workflow. R is an alternative to other analysis tools.'),
    ('SAS', 'SAS', 'free programming course', 'self-paced course', 'https://www.sas.com/sas/training/forms/roles/sas-programming-course.html', 'Carry out statistical programming where the project or workplace uses SAS.'),
    ('Structured query language SQL', 'SQLBolt', 'free interactive lessons', 'interactive lessons', 'https://sqlbolt.com/', 'Query structured data. SQL complements analysis tools when information is stored in a database.'),
    ('Microsoft Power BI', 'Microsoft Learn', 'free fundamentals module', 'learning module', 'https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/', 'Turn analysed information into visual explanations and dashboards.'),
    ('Tableau', 'Tableau', 'free training resources', 'training resources', 'https://www.tableau.com/learn/training', 'Create visual explanations of patterns. Tableau is an alternative to other visualisation tools.'),
    ('ESRI ArcGIS software', 'Esri', 'free public lessons', 'public lessons', 'https://learn.arcgis.com/en/', 'Study how social questions vary by place. Some lessons may require product access.'),
    ('Microsoft Access', 'Microsoft', 'free documentation and training', 'official documentation', 'https://support.microsoft.com/en-us/access', 'Store and query smaller structured datasets. Access is one database option, not a universal requirement.')
) AS rows(target_name, provider, access_type, delivery, url, description);

COMMIT;
