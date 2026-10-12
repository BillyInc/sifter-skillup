# CCMAS duplicate-code ownership/context resolution — 2026-09-30

Original PDF and extracted-page hashes verified against the checked-in source manifest.
Only source-proven owner/context fields and parent programme arrays were changed. No course row was deleted; summaries and outcomes were not edited.
Moved to source owner: **0**; source conflicts explicitly preserved: **2**.

## Reassigned occurrences
- `allied_health.json::Pharmacology::PHA 201::General Pharmacology::1u` → **Audiology** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 34, 47; Audiology course structure and detail
- `allied_health.json::Pharmacology::PHA 201::General Pharmacology::2u` → **Complementary and Alternative Medicine** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 79, 91; CAM global course structure and detail
- `allied_health.json::Pharmacology::PHA 312::Introductory Pharmacology::1u` → **Audiology** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 35, 56; Audiology course structure and detail
- `allied_health.json::Pharmacology::PHA 301::Basic Pharmacology and Toxicology:::Noneu` → **Medical Laboratory Science** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 331, 355; Medical Laboratory Science table and detail
- `allied_health.json::Pharmacology::PHA 301::Pharmacodynamics and Chemotherapy I::2u` → **Nursing Sciences** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 371, 390; Nursing Sciences course table and detail
- `allied_health.json::Pharmacology::PHA 301::General Principles of Pharmacology::2u` → **Dental Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 145, 160; Dental Therapy course table and detail
- `allied_health.json::Pharmacology::PHA 301::General Principles of Pharmacology::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 737, 756; Speech-Language Therapy course table and detail
- `allied_health.json::Pharmacology::PHA 302::Pharmacodynamics and Chemotherapy II::2u` → **Nursing Sciences** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 371, 396; Nursing Sciences course table and detail
- `allied_health.json::Pharmacology::PHA 312::Pharmacology for Medical Rehabilitation Professionals::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 737, 756; Speech-Language Therapy course table and detail
- `allied_health.json::Physiotherapy::PST 201::Rehabilitation Physics/Biophysics::1u` → **Audiology** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 34, 47; Audiology course structure and detail
- `allied_health.json::Physiotherapy::PST 201::Rehabilitative Physics::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 737, 745; Speech-Language Therapy course table and detail
- `allied_health.json::Physiotherapy::PST 202::Introduction to Medical Rehabilitation::1u` → **Audiology** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 34, 48; Audiology course structure and detail
- `allied_health.json::Physiotherapy::PST 202::Introduction to Medical Rehabilitation::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 737, 747; Speech-Language Therapy course table and detail
- `allied_health.json::Physiotherapy::PST 311::Programming for Rehabilitation::1u` → **Audiology** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 35, 55; Audiology course structure and detail
- `allied_health.json::Physiotherapy::PST 311::Programming for Rehabilitation Professionals::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 737, 754-756; Speech-Language Therapy course table and detail
- `allied_health.json::Physiotherapy::PST 313::Introductory Pathology::1u` → **Audiology** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 35, 56-57; Audiology course structure and detail
- `allied_health.json::Physiotherapy::PST 313::Pathology for Rehabilitation Professionals::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 737, 757-758; Speech-Language Therapy course table and detail
- `allied_health.json::Physiotherapy::PST 411::Research Methods in Medical Rehabilitation::Noneu` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 738, 760-761; Speech-Language Therapy course table and detail
- `allied_health.json::Audiology::AUD 312::Basic Procedures in Audiology::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 737, 756-757; Speech-Language Therapy course table and detail
- `allied_health.json::Audiology::AUD 409::Aural Rehabilitation::2u` → **Speech-Language Therapy** (already_applied); Allied-Health-Sciences-2023.pdf, printed pp. 738, 763; Speech-Language Therapy course table and detail

## Same-programme contexts retained
- `administration_management.json::Hospitality and Tourism Management::HTM 403::Tourism and Foodservice Management`; Hospitality and Tourism Management standard course structure
- `administration_management.json::Hospitality and Tourism Management::HTM 403::Foodservice and Tourism Management`; Tourism Management Option
- `administration_management.json::Taxation::TAX 311::Revenue Law and practice`; same programme; source locator attached
- `administration_management.json::Taxation::TAX 311::Entrepreneurship in Taxation`; same programme; source locator attached
- `allied_health.json::Complementary and Alternative Medicine::CAM 302::Introduction to Osteopathy`; same programme; source locator attached
- `allied_health.json::Complementary and Alternative Medicine::CAM 302::Naturopathy II`; same programme; source locator attached
- `allied_health.json::Nursing Sciences::NSC 406::Curriculum Development and Teaching Methodology`; same programme; source locator attached
- `allied_health.json::Nursing Sciences::NSC 406::Mental Health Nursing II`; same programme; source locator attached
- `arts.json::Modern European Languages (Russian)::RUS 361::Oral Expression and comprehension in Russian`; same programme; source locator attached
- `arts.json::Modern European Languages (Russian)::RUS 361::Advanced Studies in Russian Phonetics`; same programme; source locator attached

## Source conflicts retained without guessing
- `allied_health.json::Nursing Sciences::NSC 406::Mental Health Nursing II` — owner_resolved_code_conflict_preserved: The Nursing course table and detailed block assign different NSC codes, and NSC 405 is already used by another detailed course. Do not re-key either course without authoritative clarification.
- `arts.json::Modern European Languages (Russian)::RUS 361::Oral Expression and comprehension in Russian` — owner_resolved_table_detail_identity_conflict_preserved: The source places both blocks in the Russian curriculum but the global course table supports only Advanced Studies in Russian Phonetics under RUS 361. The other block is not assigned a different code by the source table, so it remains preserved but not silently re-keyed or counted as a verified separate course.

## Remaining same-code groups and their source context
- `administration_management.json::Hospitality and Tourism Management::HTM 403` — Two source table occurrences: one standard HTM structure and one explicitly labelled Tourism Management Option; both retained and individually annotated.
- `administration_management.json::Taxation::TAX 311` — Two distinct Taxation courses are explicitly listed with the same code in the same 300 Level table and have separate detail blocks; both retained.
- `allied_health.json::Complementary and Alternative Medicine::CAM 302` — Both distinct CAM detail blocks are retained under CAM. The source does not explicitly label them as separate options, so no option name is inferred.
- `allied_health.json::Nursing Sciences::NSC 406` — Both blocks belong to Nursing; the source table/detail code disagreement for Mental Health Nursing II is documented and neither course is re-keyed.
- `arts.json::Modern European Languages (Russian)::RUS 361` — Both detail blocks are in the Russian section, but only Advanced Studies in Russian Phonetics is supported by the global RUS 361 table row; the second identity conflict is preserved, not promoted as a separate verified course.

Changed package files: none.
