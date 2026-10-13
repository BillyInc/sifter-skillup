# Physiotherapy PST 320 source repair — 2026-09-29

Applied the confirmed row-level findings in Lane 1 checkpoint 016 against the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf): the Physiotherapy structure on printed p. 587 and PST 320 detail on printed p. 610.

- Restored **PH 45**, which is specified in both the global table and detailed course heading but absent locally.
- Replaced the 400-character truncated summary with a concise account of the complete source syllabus, including intensity/progression variables, therapeutic exercises for conditions, postural correction, strengthening equipment, relaxation and exercise-programme design.
- Preserved the title, other structured values and all eight verified outcomes; added URL, exact printed locators and access date.

Guarded edit: `apply_ccmas_pst320_content_hours_repair_2026_09_29.py`; regression test: `test_ccmas_pst320_content_hours_repair_2026_09_29.py`. This is one course-row repair, not closure of the Physiotherapy package or lane 1.
