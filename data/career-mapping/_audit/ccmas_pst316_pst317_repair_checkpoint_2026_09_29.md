# Physiotherapy PST 316/317 source repair — 2026-09-29

Applied the two confirmed course-summary repairs from lane 1 checkpoints 014 and 015 against the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf). The DPT Physiotherapy structure on printed p. 587 and detailed course blocks on printed pp. 608–609 were checked.

- **PST 316 — Massage:** removed extracted footer text appended to outcome 7, restored the omitted massage applications, bandaging and effects in the course summary, and added item-level provenance.
- **PST 317 — Exercise Therapy I:** restored the truncated mechanics, exercise-therapy, breathing/chest-physiotherapy and patient-assessment topics. The existing title’s missing colon is punctuation-only, so it was left unchanged. The source table’s dash for practical hours remains represented as `null`; no zero was inferred.

The course identities, structured fields and verified outcome sets were preserved. Guarded edit: `apply_ccmas_pst316_pst317_content_repairs_2026_09_29.py`; regression test: `test_ccmas_pst316_pst317_content_repairs_2026_09_29.py`.

This repairs two course rows only; it does not close the 57-row Physiotherapy package or lane 1.
