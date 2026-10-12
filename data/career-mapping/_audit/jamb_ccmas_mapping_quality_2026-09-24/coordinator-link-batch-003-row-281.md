# Coordinator link batch 003 - row 281, D039 Higher Education

**Date:** 2026-09-24  
**Boundary:** row 281 `English and Literary Studies` -> D039 `Higher Education`, third saved-scope link.  
**Status:** component outcomes and downstream role family checked; canonical mapping, saved scope and seed untouched.

## CCMAS evidence and link assessment

The current functional link cites ENG 202 `Entrepreneurial English`, ENG 203/204 `Introduction to General Phonetics and Phonology I/II`, and ENG 302 `Phonology of English`. The selected CCMAS scope has **32 courses** total; this decision checked the course-specific D039 anchors, not every course in the full scope.

- ENG 202 content includes English-as-a-foreign-language teaching and private tutoring; outcomes include copywriting/newsroom/publishing/web-content tasks.
- ENG 203 outcomes include applying phonological principles to teach Nigerian languages; its content says practical phonetics/phonology exercises use English teaching as the focus.
- ENG 204 covers practical language teaching application and phonetic/phonological principles in English-teaching contexts.
- ENG 302 outcomes explicitly include mastering language-teaching methods and displaying language pedagogy, alongside English phonology, writing and composition.

These course outcomes establish an English/language-teaching foundation. They support a **functional**, not direct-professional, association with teaching/language-education routes. The scope itself is English and Literary Studies rather than a teacher-education qualification and does not establish the full professional preparation, teaching practice, license or advanced research qualifications expected for every teaching role.

## Downstream fit and limits

`domain_structure.json` and `role_library_v3_cleaned.json` agree on 121 D039 role records across two subgroups: 11 `Deans & School Principals` and 110 `Lecturers & Vocational Teachers`. The current displayed role library includes language school teacher, linguistics lecturer, university literature lecturer, modern languages lecturer and higher education lecturer, as well as many unrelated subject-specific teaching roles and school-management roles.

**Disposition:** retain D039 as a functional *exploration* path only when downstream is constrained to relevant English/language/literature teaching roles and clearly marked as requiring further teacher preparation. The current domain-level fan-out to 121 roles is not student-validated: this English curriculum does not prepare a learner to teach medicine, engineering, mathematics or other unrelated fields, nor to become a school principal/dean. No claim is made that an English degree alone makes a learner eligible for any of these jobs.

## Verified next learning / professional steps (Nigeria context)

The CCMAS course anchors provide English-language subject matter and some language pedagogy, but not a complete professional teaching pathway. The Teachers Registration Council of Nigeria (TRCN) describes pedagogy, literacy, numeracy, ICT and safeguarding as core Professional Qualifying Examination curriculum areas; its registration information identifies recognized teaching qualifications and registration/licensing requirements. These are additional learning/professional steps to investigate for teaching pathways, not CCMAS course outcomes and not a certification automatically earned by this JAMB programme. The specific route depends on level and role; this checkpoint does not treat the TRCN material as a complete qualification determination for university lecturer appointments.

## Sources and locators (accessed 2026-09-24)

- Local CCMAS: `data/career-mapping/ccmas/arts.json` -> English Language and Literature -> ENG 202, ENG 203, ENG 204, ENG 302 -> `content_summary` and `skills_learned`.
- Saved link: `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` -> row 281 -> D039; selected course scope.
- Downstream: `data/career-mapping/domain_structure.json` -> D039 -> 2 subgroups/121 roles; `data/career-mapping/role_library_v3_cleaned.json` -> D039 role display records.
- TRCN, [Professional Qualifying Examination curriculum](https://trcn.gov.ng/pqe-curriculum): five core areas and curriculum guide.
- TRCN, [registration guidance for Nigerian-qualified teachers](https://trcn.gov.ng/qualified-in-nigeria): eligibility and registration information.
- TRCN, [official home/mandate](https://trcn.gov.ng/): teacher registration/licensing mandate; distinguish regulatory conditions from JAMB curriculum.

## Remaining queue

After three link dispositions, **832 of 835** rows-281-420 link occurrences remain for the systematic queue. Continue at row 281 -> D065 `Translation, Interpretation`. The full tranche still has 439 no-locator links; that count is not interchangeable with the remaining queue count.
