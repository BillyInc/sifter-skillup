# Physiotherapy PST 321 source repair — 2026-09-29

Applied the confirmed fields from Lane 1 checkpoint 017 against the official NUC [Allied Health Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), global structure printed p. 587 and detailed course block printed pp. 610–611.

- Set **PH 45**, which the global row specifies; retained null LH because the source table shows a dash.
- Removed the page footer appended to learning outcome 4, preserving its meaning.
- Added a summary of the source-described practical demonstration and item-level source URL, locators and access date.
- Preserved the source's reference to **PST 318** as an explicit unresolved conflict: the detailed PST 321 description names it, but the same DPT 300-level table contains no PST 318 row. No course was invented and no code was silently substituted.

Guarded edit: `apply_ccmas_pst321_description_repair_2026_09_29.py`; regression test: `test_ccmas_pst321_description_repair_2026_09_29.py`. This closes only this course-row repair, not the package or lane.
