-- ============================================================
-- SIFTER LEVELUP — SUBJECT CATALOG SEED
-- Schema: skillup_dev   Table: subject_catalog
-- Run AFTER migration_student_pipeline_live.sql
--
-- Source: current live IBASS eligibility picker (23 selectable UTME subjects)
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
('AGR',  'Agricultural Science',        ARRAY['Agric','Agric Science','Agric. Science','Agric. Sc.','Agric. Sc','Agric Sc.','Agric Sc','Agriculture Science'], ARRAY['olevel'], 'science', ARRAY['science']),
('AGRIC','Agriculture',                 ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'science',    ARRAY['science','commercial','art']),
('FMATH','Further Mathematics',         ARRAY['Additional Mathematics','Further Maths','Additional/Further Mathematics'], ARRAY['olevel'], 'science', ARRAY['science']),
('HSC',  'Health Science',              ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'science',    ARRAY['science']),
('HED',  'Health Education',            ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('PE',   'Physical Education',           ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science','art']),
('PHE',  'Physical and Health Education', ARRAY['PHE'],                                                       ARRAY['olevel'],        'science',    ARRAY['science']),
('ANH',  'Animal Husbandry',            ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'science',    ARRAY['science']),
('FSN',  'Food and Nutrition',          ARRAY['Foods and Nutrition','Food & Nutrition'],                    ARRAY['olevel'],        'science',    ARRAY['science','art']),
('CSC',  'Computer Studies',            ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science','commercial']),
('DPR',  'Data Processing',             ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science','commercial']),
('ENVS', 'Environmental Science',       ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'science',    ARRAY['science']),
('IT',   'Information Technology',      ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science','commercial']),

-- ── Commercial ────────────────────────────────────────────────
('ECON', 'Economics',                   ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'commercial', ARRAY['commercial','science','art']),
('COMM', 'Commerce',                    ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'commercial', ARRAY['commercial']),
('ACC',  'Principles of Accounts',      ARRAY['Accounting','Accounts','Account','Principles of Accounting','Financial Accounting','Accounting/Financial Accounting'], ARRAY['utme','olevel'], 'commercial', ARRAY['commercial']),
('BOOKKEEP','Book Keeping',             ARRAY['Bookkeeping'],                                                ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('MKT',  'Marketing',                   ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('INS',  'Insurance',                   ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('OFP',  'Office Practice',             ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('STORE','Store Management',            ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('STOREKEEP','Store Keeping',           ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('BMETHOD','Business Methods',           ARRAY['Business Method'],                                            ARRAY['olevel'],        'commercial', ARRAY['commercial']),
('STAT', 'Statistics',                   ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial','science']),

-- ── Arts / humanities ─────────────────────────────────────────
('GOV',  'Government',                  ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['art','commercial']),
('LIT',  'Literature in English',       ARRAY['Literature-in-English','English Literature','Literature'], ARRAY['utme','olevel'], 'art', ARRAY['art']),
('GEO',  'Geography',                   ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['science','art','commercial']),
('HIS',  'History',                     ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('CRS',  'Christian Religious Studies', ARRAY['CRS','CRK','Christian Religious Knowledge','Bible Knowledge'], ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('IRS',  'Islamic Religious Studies',   ARRAY['IRS','IRK','Islamic Studies'],                                ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('SOS',  'Social Studies',              ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'art',        ARRAY['art','commercial']),

-- ── Languages ─────────────────────────────────────────────────
('YOR',  'Yoruba',                      ARRAY['Yoruba Language'],                                            ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('HAU',  'Hausa',                       ARRAY['Hausa Language'],                                            ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('IGB',  'Igbo',                        ARRAY['Igbo Language'],                                             ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('FRE',  'French',                      ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'language',   ARRAY['art']),
('ARA',  'Arabic',                      ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'language',   ARRAY['art']),

-- ── Creative / technical / vocational ─────────────────────────
('MUS',  'Music',                       ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('ART',  'Fine Art',                    ARRAY['Art','Visual Arts','Visual Art','Fine Arts'],                 ARRAY['utme','olevel'], 'art',        ARRAY['art']),
('HEC',  'Home Economics',              ARRAY[]::TEXT[],                                                     ARRAY['utme','olevel'], 'technical',  ARRAY['art','science']),
('HMG',  'Home Management',             ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['art','science']),
('TD',   'Technical Drawing',           ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('BLD',  'Building Construction',       ARRAY['Introduction to Building Construction'],                    ARRAY['olevel'],        'technical',  ARRAY['science']),
('WWK',  'Woodwork',                    ARRAY['Wood Work','General Wood Work'],                             ARRAY['olevel'],        'technical',  ARRAY['science']),
('BRICK','Bricklaying and Block Laying', ARRAY['Bricklaying','Block Laying','Bricklaying/Block Laying'],     ARRAY['olevel'],        'technical',  ARRAY['science']),
('CONC', 'Concreting',                  ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('WALL_FIN','Wall, Floor and Ceiling Finishing', ARRAY['Wall/Floor/Ceiling Finishing'],                       ARRAY['olevel'],        'technical',  ARRAY['science']),
('JOIN', 'Joinery',                     ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('CARP', 'Carpentry',                   ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('DEC_PAINT','Decorative Painting',     ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('LINING','Lining',                     ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('SIGN_DES','Sign and Design',          ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('WALL_HANG','Wall Hanging',            ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('COLOR_GLAZE','Colour Mixing/Matching and Glazing', ARRAY['Colour Mixing and Glazing'],                      ARRAY['olevel'],        'technical',  ARRAY['science']),
('CERAM','Ceramics',                    ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('GRAPH_DES','Graphics Design',         ARRAY['Graphic Design'],                                            ARRAY['olevel'],        'technical',  ARRAY['science']),
('GRAPH_PRINT','Graphic Printing',      ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('MWK',  'Metalwork',                   ARRAY['metal work','General Metal Work'],                           ARRAY['olevel'],        'technical',  ARRAY['science']),
('ELEC', 'Basic Electricity',           ARRAY['Electricity'],                                                ARRAY['olevel'],        'technical',  ARRAY['science']),
('AUTO', 'Auto Mechanics',              ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('GMT',  'Garment Making',              ARRAY['Fashion Design and Garment Making','Garment Construction and Finishing'], ARRAY['olevel'], 'technical', ARRAY['art']),
('CLT',  'Clothing and Textile',         ARRAY['Clothing & Textile'],                                          ARRAY['olevel'],        'technical',  ARRAY['art']),
('TXT',  'Textiles',                    ARRAY['Textile'],                                                     ARRAY['olevel'],        'technical',  ARRAY['art']),
('DYEB', 'Dyeing and Bleaching',        ARRAY['Dyeing & Bleaching','Dyeing Bleaching'],                       ARRAY['olevel'],        'technical',  ARRAY['art']),
('DYE_FIN','Dyeing and Finishing',      ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['art']),
('BLEACH','Bleaching',                  ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['art']),
('MEN_GARM','Men Garment Construction and Finishing', ARRAY[]::TEXT[],                                        ARRAY['olevel'],        'technical',  ARRAY['art']),
('LADY_GARM','Ladies Garment Construction and Finishing', ARRAY[]::TEXT[],                                     ARRAY['olevel'],        'technical',  ARRAY['art']),
('SPIN', 'Spinning',                    ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['art']),
('WEAVE','Weaving',                     ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['art']),
('SURFACE','Surface Design and Printing', ARRAY[]::TEXT[],                                                   ARRAY['olevel'],        'technical',  ARRAY['art']),
('NUTR','Nutrition',                    ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'science',    ARRAY['science','art']),
('CONSTR','Construction',               ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['science']),
('BCFS','Basic Catering and Food Services', ARRAY[]::TEXT[],                                                   ARRAY['olevel'],        'technical',  ARRAY['art','commercial']),
('BAKERY','Bakery and Confectioneries',  ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['art','commercial']),
('CAT',  'Catering Craft Practice',     ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'technical',  ARRAY['art','commercial']),
('TOU',  'Tourism',                     ARRAY[]::TEXT[],                                                     ARRAY['olevel'],        'commercial', ARRAY['commercial','art'])
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  aliases = EXCLUDED.aliases,
  exam_types = EXCLUDED.exam_types,
  category = EXCLUDED.category,
  stream_tags = EXCLUDED.stream_tags,
  active = true;

-- Stream selection is an availability filter, while category describes the
-- subject's usual family. Every technical/vocational catalogue row must also
-- be visible when the learner selects the Technical/vocational stream. Core
-- subjects remain available in every stream, including Technical/vocational.
UPDATE skillup_dev.subject_catalog
SET stream_tags = CASE
  WHEN 'technical' = ANY(stream_tags) THEN stream_tags
  ELSE array_append(stream_tags, 'technical')
END
WHERE category = 'technical';

UPDATE skillup_dev.subject_catalog
SET stream_tags = CASE
  WHEN 'technical' = ANY(stream_tags) THEN stream_tags
  ELSE array_append(stream_tags, 'technical')
END
WHERE code IN ('ENG', 'MATH', 'CIV');

-- sanity: SELECT count(*) FROM skillup_dev.subject_catalog;  -- expect 82
