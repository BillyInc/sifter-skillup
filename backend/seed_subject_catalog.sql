-- ============================================================
-- SIFTER LEVELUP — SUBJECT CATALOG SEED
-- Schema: skillup_dev   Table: subject_catalog
-- Run AFTER migration_student_pipeline_live.sql
--
-- Source: current JAMB UTME subject layer (25 rows in this catalogue)
--         + common WAEC/NECO O-level subjects referenced by programme
--         requirements in the brochure extracts (jamb/*_offerings.json).
-- Aliases include the exact strings used by the frontend pickers
-- (SeniorSecondaryExploreSetupForm / JambSetupForm) so free-text and
-- legacy choices resolve to catalog rows.
-- Idempotent: upsert on code.
-- ============================================================

INSERT INTO skillup_dev.subject_catalog (code, name, aliases, exam_types, category, stream_tags) VALUES
-- ── Compulsory / general ──────────────────────────────────────
('ENG',  'English Language',            ARRAY['English','Use of English'],                                   ARRAY['utme','olevel'], 'general',    ARRAY['science','commercial','art']),
('MATH', 'Mathematics',                 ARRAY['General Mathematics','Maths'],                                ARRAY['utme','olevel'], 'general',    ARRAY['science','commercial','art']),
('CIV',  'Civic Education',             ARRAY['Civics'],                                                     ARRAY['olevel'],        'general',    ARRAY['science','commercial','art']),

-- ── Sciences ──────────────────────────────────────────────────
('PHY',  'Physics',                     ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'science',    ARRAY['science']),
('CHEM', 'Chemistry',                   ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'science',    ARRAY['science']),
('BIO',  'Biology',                     ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'science',    ARRAY['science']),
('AGR',  'Agricultural Science',        ARRAY['Agric','Agriculture','Agric Science','Agric. Science'],        ARRAY['utme','olevel'], 'science',    ARRAY['science']),
('FMATH','Further Mathematics',         ARRAY['Additional Mathematics','Further Maths'],                     ARRAY['olevel'],        'science',    ARRAY['science']),
('HSC',  'Health Science',              ARRAY['Health Education'],                                           ARRAY['olevel'],        'science',    ARRAY['science']),
('PHE',  'Physical and Health Education', ARRAY['PHE','Physical Education'],                                 ARRAY['utme','olevel'], 'science',    ARRAY['science']),
('ANH',  'Animal Husbandry',            ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'science',    ARRAY['science']),
('FSN',  'Food and Nutrition',          ARRAY['Foods and Nutrition'],                                        ARRAY['olevel'],        'science',    ARRAY['science','art']),
('CSC',  'Computer Studies',            ARRAY['Computer Science','ICT','Data Processing'],                   ARRAY['utme','olevel'], 'technical',  ARRAY['science','commercial']),

-- ── Commercial ────────────────────────────────────────────────
('ECON', 'Economics',                   ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'commercial', ARRAY['commercial','science','art']),
('COMM', 'Commerce',                    ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'commercial', ARRAY['commercial']),
('ACC',  'Principles of Accounts',      ARRAY['Accounting','Accounts','Financial Accounting','Accounting/Financial Accounting','Book Keeping','Bookkeeping'], ARRAY['utme','olevel'], 'commercial', ARRAY['commercial']),
('MKT',  'Marketing',                   ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('INS',  'Insurance',                   ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('OFP',  'Office Practice',             ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('STORE','Store Management',            ARRAY['Store Keeping'],                                              ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('BMETHOD','Business Methods',           ARRAY['Business Method'],                                            ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('STAT', 'Statistics',                   ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial','science']),

-- ── Arts / humanities ─────────────────────────────────────────
('GOV',  'Government',                  ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['art','commercial']),
('LIT',  'Literature in English',       ARRAY['Literature-in-English','English Literature'],                 ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('GEO',  'Geography',                   ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['science','art','commercial']),
('HIS',  'History',                     ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('CRS',  'Christian Religious Studies', ARRAY['CRS','CRK','Christian Religious Knowledge','CRS/IRS'],        ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('IRS',  'Islamic Religious Studies',   ARRAY['IRS','IRK','Islamic Studies'],                                ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('SOS',  'Social Studies',              ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'art',        ARRAY['art','commercial']),

-- ── Languages ─────────────────────────────────────────────────
('YOR',  'Yoruba',                      ARRAY['Yoruba/Hausa/Igbo'],                                          ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('HAU',  'Hausa',                       ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('IGB',  'Igbo',                        ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('FRE',  'French',                      ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('ARA',  'Arabic',                      ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'language',   ARRAY['art']),

-- ── Creative / technical / vocational ─────────────────────────
('MUS',  'Music',                       ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('ART',  'Fine Art',                    ARRAY['Visual Arts','Visual Art','Fine Arts','Creative Arts'],       ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('HEC',  'Home Economics',              ARRAY['Home Management'],                                            ARRAY['utme','olevel'], 'technical',  ARRAY['art','science']),
('TD',   'Technical Drawing',           ARRAY['Building/Engineering Drawing'],                              ARRAY['olevel'],        'technical',  ARRAY['science']),
('BLD',  'Building Construction',       ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('WWK',  'Woodwork',                    ARRAY['General Wood Work'],                                         ARRAY['olevel'],        'technical',  ARRAY['science']),
('MWK',  'Metalwork',                   ARRAY['metal work','General Metal Work'],                           ARRAY['olevel'],        'technical',  ARRAY['science']),
('ELEC', 'Basic Electricity',           ARRAY['Electricity'],                                                ARRAY['olevel'],        'technical',  ARRAY['science']),
('AUTO', 'Auto Mechanics',              ARRAY['Motor Vehicle Mechanics'],                                    ARRAY['olevel'],        'technical',  ARRAY['science']),
('GMT',  'Garment Making',              ARRAY['Clothing and Textiles','Dress Making','Textile','Spinning','Weaving','Surface Design and Printing','Bleaching','Dyeing and Finishing','Men Garment Construction and Finishing','Ladies Garment Construction and Finishing'], ARRAY['olevel'], 'technical', ARRAY['art']),
('CAT',  'Catering Craft Practice',     ARRAY['Catering','Basic Catering and Food Services','Bakery and Confectioneries'], ARRAY['olevel'], 'technical', ARRAY['art','commercial']),
('TOU',  'Tourism',                     ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial','art'])
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  aliases = EXCLUDED.aliases,
  exam_types = EXCLUDED.exam_types,
  category = EXCLUDED.category,
  stream_tags = EXCLUDED.stream_tags,
  active = true;

-- sanity: SELECT count(*) FROM skillup_dev.subject_catalog;  -- expect 46
