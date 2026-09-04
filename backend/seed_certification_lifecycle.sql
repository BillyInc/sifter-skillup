-- SIFTER LEVELUP — EVERGREEN CERTIFICATION LIFECYCLE OVERLAY
-- Run after the career seed and after migration_certification_lifecycle.sql.
-- This is intentionally small and repeatable. It preserves records when a
-- provider pauses, closes, retires, or replaces a route.

UPDATE skillup_dev.domain_certifications
SET credential_type = 'certification_or_qualification',
    availability_status = 'temporarily_unavailable',
    current_recommendation = false,
    retain_in_catalogue = true,
    reopen_possible = true,
    availability_note = 'The provider has closed the exam while evaluating the next step. Existing credentials remain valid for three years from the date passed. Check the provider for a future route.',
    official_url = 'https://www.tensorflow.org/certificate',
    status_source_url = 'https://www.tensorflow.org/certificate',
    status_checked_at = DATE '2026-09-04',
    replacement_name = NULL,
    replacement_url = NULL
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') = 'tensorflow developer certificate';

UPDATE skillup_dev.domain_certifications
SET credential_type = 'certification_or_qualification',
    availability_status = 'retired',
    current_recommendation = false,
    retain_in_catalogue = true,
    reopen_possible = false,
    availability_note = 'AWS retired this exam on 31 March 2026. Existing certifications remain active for three years from the date earned. New learners should consider AWS Certified Machine Learning Engineer - Associate.',
    official_url = 'https://aws.amazon.com/certification/certified-machine-learning-specialty/',
    status_source_url = 'https://aws.amazon.com/certification/certified-machine-learning-specialty/',
    status_checked_at = DATE '2026-09-04',
    replacement_name = 'AWS Certified Machine Learning Engineer - Associate',
    replacement_url = 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/'
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') = 'aws certified machine learning specialty';

UPDATE skillup_dev.domain_certifications
SET credential_type = 'certification_or_qualification',
    availability_status = 'retired',
    current_recommendation = false,
    retain_in_catalogue = true,
    reopen_possible = false,
    availability_note = 'Microsoft retired this certification and its renewal assessment on 31 March 2025. Existing badges may remain valid until their individual expiry, but new learners should use the current Microsoft Fabric data-engineering route.',
    official_url = 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/',
    status_source_url = 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/',
    status_checked_at = DATE '2026-09-04',
    replacement_name = 'Microsoft Certified: Fabric Data Engineer Associate',
    replacement_url = 'https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/'
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') = 'microsoft certified azure data engineer associate';

UPDATE skillup_dev.domain_certifications
SET credential_type = 'certification_or_qualification',
    availability_status = 'retired',
    current_recommendation = false,
    retain_in_catalogue = true,
    reopen_possible = false,
    availability_note = 'Microsoft retired this certification on 30 June 2026. Existing credentials follow Microsoft''s retirement and expiry rules; new learners should use the current Azure AI applications and agents route.',
    official_url = 'https://learn.microsoft.com/en-us/credentials/support/credential-retirement',
    status_source_url = 'https://learn.microsoft.com/en-us/credentials/support/credential-retirement',
    status_checked_at = DATE '2026-09-04',
    replacement_name = 'Microsoft Certified: Azure AI Apps and Agents Developer Associate',
    replacement_url = 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate'
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') = 'microsoft certified azure ai engineer associate';

UPDATE skillup_dev.domain_certifications
SET credential_type = 'certification_or_qualification',
    availability_status = 'retired',
    current_recommendation = false,
    retain_in_catalogue = true,
    reopen_possible = false,
    availability_note = 'Microsoft retired this certification on 31 July 2026. Existing credentials follow Microsoft''s retirement and expiry rules; new learners should use the current Azure AI cloud developer route where it matches their goal.',
    official_url = 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/',
    status_source_url = 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/',
    status_checked_at = DATE '2026-09-04',
    replacement_name = 'Microsoft Certified: Azure AI Cloud Developer Associate',
    replacement_url = 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/'
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') = 'microsoft certified azure developer associate';

UPDATE skillup_dev.domain_certifications
SET credential_type = 'certification_or_qualification',
    availability_status = 'superseded',
    current_recommendation = false,
    retain_in_catalogue = true,
    reopen_possible = false,
    availability_note = 'Salesforce now presents this entry-level route as Salesforce Certified Platform Foundations. The older Associate name is retained as historical identity, while new learners should follow the current Platform Foundations route.',
    official_url = 'https://trailhead.salesforce.com/en/credentials/associate',
    status_source_url = 'https://trailhead.salesforce.com/en/credentials/associate',
    status_checked_at = DATE '2026-09-04',
    replacement_name = 'Salesforce Certified Platform Foundations',
    replacement_url = 'https://trailhead.salesforce.com/en/credentials/associate'
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') = 'salesforce certified associate retail crm adjacent';

-- Role-owned copies receive the same lifecycle truth. This prevents a retired
-- credential from looking current merely because it appears on a role row.
UPDATE skillup_dev.role_certifications
SET credential_type = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'certification_or_qualification'
        WHEN 'aws certified machine learning specialty' THEN 'certification_or_qualification'
        WHEN 'microsoft certified azure data engineer associate' THEN 'certification_or_qualification'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'certification_or_qualification'
        WHEN 'microsoft certified azure developer associate' THEN 'certification_or_qualification'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'certification_or_qualification'
        ELSE credential_type
    END,
    availability_status = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'temporarily_unavailable'
        WHEN 'aws certified machine learning specialty' THEN 'retired'
        WHEN 'microsoft certified azure data engineer associate' THEN 'retired'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'retired'
        WHEN 'microsoft certified azure developer associate' THEN 'retired'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'superseded'
        ELSE availability_status
    END,
    current_recommendation = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN false
        WHEN 'aws certified machine learning specialty' THEN false
        WHEN 'microsoft certified azure data engineer associate' THEN false
        WHEN 'microsoft certified azure ai engineer associate' THEN false
        WHEN 'microsoft certified azure developer associate' THEN false
        WHEN 'salesforce certified associate retail crm adjacent' THEN false
        ELSE current_recommendation
    END,
    retain_in_catalogue = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN true
        WHEN 'aws certified machine learning specialty' THEN true
        WHEN 'microsoft certified azure data engineer associate' THEN true
        WHEN 'microsoft certified azure ai engineer associate' THEN true
        WHEN 'microsoft certified azure developer associate' THEN true
        WHEN 'salesforce certified associate retail crm adjacent' THEN true
        ELSE retain_in_catalogue
    END,
    reopen_possible = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN true
        WHEN 'aws certified machine learning specialty' THEN false
        WHEN 'microsoft certified azure data engineer associate' THEN false
        WHEN 'microsoft certified azure ai engineer associate' THEN false
        WHEN 'microsoft certified azure developer associate' THEN false
        WHEN 'salesforce certified associate retail crm adjacent' THEN false
        ELSE reopen_possible
    END,
    availability_note = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'The provider has closed the exam while evaluating the next step. Existing credentials remain valid for three years from the date passed. Check the provider for a future route.'
        WHEN 'aws certified machine learning specialty' THEN 'AWS retired this exam on 31 March 2026. Existing certifications remain active for three years from the date earned. New learners should consider AWS Certified Machine Learning Engineer - Associate.'
        WHEN 'microsoft certified azure data engineer associate' THEN 'Microsoft retired this certification and its renewal assessment on 31 March 2025. Existing badges may remain valid until their individual expiry, but new learners should use the current Microsoft Fabric data-engineering route.'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'Microsoft retired this certification on 30 June 2026. Existing credentials follow Microsoft''s retirement and expiry rules; new learners should use the current Azure AI applications and agents route.'
        WHEN 'microsoft certified azure developer associate' THEN 'Microsoft retired this certification on 31 July 2026. Existing credentials follow Microsoft''s retirement and expiry rules; new learners should use the current Azure AI cloud developer route where it matches their goal.'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'Salesforce now presents this entry-level route as Salesforce Certified Platform Foundations. The older Associate name is retained as historical identity, while new learners should follow the current Platform Foundations route.'
        ELSE availability_note
    END,
    official_url = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'https://www.tensorflow.org/certificate'
        WHEN 'aws certified machine learning specialty' THEN 'https://aws.amazon.com/certification/certified-machine-learning-specialty/'
        WHEN 'microsoft certified azure data engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/support/credential-retirement'
        WHEN 'microsoft certified azure developer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'https://trailhead.salesforce.com/en/credentials/associate'
        ELSE official_url
    END,
    status_source_url = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'https://www.tensorflow.org/certificate'
        WHEN 'aws certified machine learning specialty' THEN 'https://aws.amazon.com/certification/certified-machine-learning-specialty/'
        WHEN 'microsoft certified azure data engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/support/credential-retirement'
        WHEN 'microsoft certified azure developer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'https://trailhead.salesforce.com/en/credentials/associate'
        ELSE status_source_url
    END,
    status_checked_at = CASE WHEN regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') IN (
        'tensorflow developer certificate',
        'aws certified machine learning specialty',
        'microsoft certified azure data engineer associate',
        'microsoft certified azure ai engineer associate',
        'microsoft certified azure developer associate',
        'salesforce certified associate retail crm adjacent'
    ) THEN DATE '2026-09-04' ELSE status_checked_at END,
    replacement_name = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'aws certified machine learning specialty' THEN 'AWS Certified Machine Learning Engineer - Associate'
        WHEN 'microsoft certified azure data engineer associate' THEN 'Microsoft Certified: Fabric Data Engineer Associate'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'Microsoft Certified: Azure AI Apps and Agents Developer Associate'
        WHEN 'microsoft certified azure developer associate' THEN 'Microsoft Certified: Azure AI Cloud Developer Associate'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'Salesforce Certified Platform Foundations'
        ELSE NULL
    END,
    replacement_url = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'aws certified machine learning specialty' THEN 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/'
        WHEN 'microsoft certified azure data engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/fabric-data-engineer-associate/'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate'
        WHEN 'microsoft certified azure developer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'https://trailhead.salesforce.com/en/credentials/associate'
        ELSE NULL
    END
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') IN (
    'tensorflow developer certificate',
    'aws certified machine learning specialty',
    'microsoft certified azure data engineer associate',
    'microsoft certified azure ai engineer associate',
    'microsoft certified azure developer associate',
    'salesforce certified associate retail crm adjacent'
);

-- Certification resource rows are historical catalogue entries too. Point
-- them to the provider's status page and explain the replacement instead of
-- leaving a stale generic registration link that looks actionable.
UPDATE skillup_dev.career_learning_resources
SET url = CASE regexp_replace(lower(target_name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'https://www.tensorflow.org/certificate'
        WHEN 'aws certified machine learning specialty' THEN 'https://aws.amazon.com/certification/certified-machine-learning-specialty/'
        WHEN 'microsoft certified azure data engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/support/credential-retirement'
        WHEN 'microsoft certified azure developer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'https://trailhead.salesforce.com/en/credentials/associate'
        ELSE url
    END,
    source_url = CASE regexp_replace(lower(target_name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'https://www.tensorflow.org/certificate'
        WHEN 'aws certified machine learning specialty' THEN 'https://aws.amazon.com/certification/certified-machine-learning-specialty/'
        WHEN 'microsoft certified azure data engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/support/credential-retirement'
        WHEN 'microsoft certified azure developer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'https://trailhead.salesforce.com/en/credentials/associate'
        ELSE source_url
    END,
    description = CASE regexp_replace(lower(target_name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'tensorflow developer certificate' THEN 'The provider has closed this exam while evaluating the next step. Existing credentials remain valid for three years from the date passed. This link is for status checking, not a current exam registration.'
        WHEN 'aws certified machine learning specialty' THEN 'AWS retired this exam on 31 March 2026. Existing certifications remain active for three years from the date earned. New learners should review AWS Certified Machine Learning Engineer - Associate.'
        WHEN 'microsoft certified azure data engineer associate' THEN 'Microsoft retired this certification and its renewal assessment on 31 March 2025. New learners should review Microsoft Certified: Fabric Data Engineer Associate.'
        WHEN 'microsoft certified azure ai engineer associate' THEN 'Microsoft retired this certification on 30 June 2026. New learners should review Microsoft Certified: Azure AI Apps and Agents Developer Associate.'
        WHEN 'microsoft certified azure developer associate' THEN 'Microsoft retired this certification on 31 July 2026. New learners should review Microsoft Certified: Azure AI Cloud Developer Associate where it matches their goal.'
        WHEN 'salesforce certified associate retail crm adjacent' THEN 'Salesforce now presents this entry-level route as Salesforce Certified Platform Foundations. Follow the current name and route on the provider page.'
        ELSE description
    END,
    source_confidence = CASE WHEN regexp_replace(lower(target_name), '[^a-z0-9]+', ' ', 'g') IN (
        'tensorflow developer certificate',
        'aws certified machine learning specialty',
        'microsoft certified azure data engineer associate',
        'microsoft certified azure ai engineer associate',
        'microsoft certified azure developer associate',
        'salesforce certified associate retail crm adjacent'
    ) THEN 'high' ELSE source_confidence END,
    data_state = CASE WHEN regexp_replace(lower(target_name), '[^a-z0-9]+', ' ', 'g') IN (
        'tensorflow developer certificate',
        'aws certified machine learning specialty',
        'microsoft certified azure data engineer associate',
        'microsoft certified azure ai engineer associate',
        'microsoft certified azure developer associate',
        'salesforce certified associate retail crm adjacent'
    ) THEN 'source_backed' ELSE data_state END,
    source_provenance = source_provenance || jsonb_build_object(
        'lifecycle_status_checked_at', '2026-09-04',
        'lifecycle_status_source', CASE regexp_replace(lower(target_name), '[^a-z0-9]+', ' ', 'g')
            WHEN 'tensorflow developer certificate' THEN 'https://www.tensorflow.org/certificate'
            WHEN 'aws certified machine learning specialty' THEN 'https://aws.amazon.com/certification/certified-machine-learning-specialty/'
            WHEN 'microsoft certified azure data engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/renew/'
            WHEN 'microsoft certified azure ai engineer associate' THEN 'https://learn.microsoft.com/en-us/credentials/support/credential-retirement'
            WHEN 'microsoft certified azure developer associate' THEN 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/renew/'
            WHEN 'salesforce certified associate retail crm adjacent' THEN 'https://trailhead.salesforce.com/en/credentials/associate'
            ELSE NULL
        END
    )
WHERE resource_type = 'certification_exam'
  AND regexp_replace(lower(target_name), '[^a-z0-9]+', ' ', 'g') IN (
      'tensorflow developer certificate',
      'aws certified machine learning specialty',
      'microsoft certified azure data engineer associate',
      'microsoft certified azure ai engineer associate',
      'microsoft certified azure developer associate',
      'salesforce certified associate retail crm adjacent'
  );

UPDATE skillup_dev.domain_certifications
SET credential_type = 'training_or_course',
    official_url = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'bbc academy journalism training' THEN 'https://www.bbc.co.uk/academy'
        WHEN 'google news initiative training / gni certificate' THEN 'https://newsinitiative.withgoogle.com/resources/trainings/'
        WHEN 'irex media / journalism training programmes' THEN 'https://www.irex.org/'
        ELSE official_url
    END
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') IN (
    'bbc academy journalism training',
    'google news initiative training / gni certificate',
    'irex media / journalism training programmes'
);

UPDATE skillup_dev.domain_certifications
SET credential_type = 'membership_or_accreditation',
    official_url = CASE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g')
        WHEN 'cipd associate membership' THEN 'https://www.cipd.org/en/membership/'
        WHEN 'nigeria union of journalists (nuj) membership/accreditation' THEN 'https://www.nuj.org.ng/'
        ELSE official_url
    END
WHERE regexp_replace(lower(name), '[^a-z0-9]+', ' ', 'g') IN (
    'cipd associate membership',
    'nigeria union of journalists nuj membership accreditation'
);
