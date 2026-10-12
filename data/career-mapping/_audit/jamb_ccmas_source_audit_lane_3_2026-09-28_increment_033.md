# Lane 3 CCMAS source increment 033 — Structural Engineering rows 1–5

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), schedule printed p.1161 and course details pp.1163–1167.  
**Progress:** First five of 47 Structural Engineering course occurrences source-compared.

## Findings

| Ordinal / course | Result |
|---|---|
| 1 — GST 111, Communication in English | Schedule and all 7 outcomes match. Local 400-character summary ends after 3RsQ; later reasoning, copyright/ethics, writing/editing, ICT, and public-speaking content is omitted. |
| 2 — GST 112, Nigerian Peoples and Culture | All 8 outcomes and metadata match. Schedule title is singular “Culture”; detail heading is plural “Cultures”. Summary truncates before several later syllabus topics. Keep the source variant visible. |
| 3 — GET 101, Engineers in Society | All 5 outcomes and schedule metadata match. Table says “Engineers”; detail heading says “Engineer”. Summary stops at “Safety”, before risk analysis, competencies and seminar content. |
| 4 — GET 102, Introduction to Engineering Graphics and Solid Modelling I | All 7 outcomes and metadata match; content summary cuts off before the rest of the modelling and CAD-tool syllabus. |
| 5 — CHM 101, General Chemistry I | Metadata/title match. Local has 9 outcome entries against 10 official outcomes: its last item concatenates outcomes 9 and 10. Summary also truncates at 400 characters. |

## Reconciliation handoff

Restore complete course contents for rows 1–4 from the exact Structural Engineering source block; do not treat the GST 112/GET 101 schedule-vs-detail title wording as a local error. Split CHM 101’s concatenated final outcome into official outcomes 9 and 10. The shared CCMAS ledger was not edited.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_033.py`.  
**Next cursor:** package 174, Structural Engineering, ordinal 6 — CHM 102. Rows 1–5 are covered.
