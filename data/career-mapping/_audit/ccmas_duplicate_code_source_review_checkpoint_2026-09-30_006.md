# CCMAS duplicate-code and repeated-outcome source review — 2026-09-30

Checkpoint: `ccmas_duplicate_code_source_review_checkpoint_2026-09-30_006.json`. Status: **reviewed_source_matches_and_conflicts_checkpointed**.

- Duplicate-code groups inspected: **16**
- Repeated-outcome records inspected: **4**
- Source-proven package patches prepared: **0**
- Source-proven duplicate-record removals prepared: **0**
- Repeated-outcome changes: **0**

## Prepared, not applied

Guarded patch: `ccmas_duplicate_code_repair_patch_2026-09-30.json`. The default run never edits package JSON. Apply only after the full summary/outcome reconciliation is complete.

## Repeated outcomes

- `allied_health.json::Dental Therapy::DTH 521` — **source_authored_repetition_preserve**; The original course block prints the repeated patient-management outcome twice.
- `arts.json::Folklore Studies::FLS 202` — **newly_detected_source_authored_repetition_preserve**; The original FLS 202 learning-outcomes block prints this verbal-folklore outcome twice.
- `basic_medical.json::Human Anatomy::ANA 341` — **source_authored_repetition_preserve**; The original course block prints the repeated gene-structure outcome twice.
- `education.json::Music::EDU 403` — **source_published_numbering_anomaly_preserve_pending_authoritative_erratum**; The original page itself splits outcome text with numbered standalone 'education' entries (items 4 and 10). This is not an extractor-only duplicate; no source correction is inferred.

## Duplicate-code groups

- `administration_management.json::Hospitality and Tourism Management::HTM 403` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `administration_management.json::Taxation::TAX 311` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Pharmacology::PHA 201` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Pharmacology::PHA 301` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 5.
- `allied_health.json::Pharmacology::PHA 302` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Pharmacology::PHA 312` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 3.
- `allied_health.json::Physiotherapy::PST 201` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Physiotherapy::PST 202` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Physiotherapy::PST 311` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 3.
- `allied_health.json::Physiotherapy::PST 313` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 3.
- `allied_health.json::Physiotherapy::PST 411` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Audiology::AUD 312` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Audiology::AUD 409` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Nursing Sciences::NSC 406` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `allied_health.json::Complementary and Alternative Medicine::CAM 302` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.
- `arts.json::Modern European Languages (Russian)::RUS 361` — **code_and_title_source_hits_found_context_still_checked**; source member rows: 2.

## Prepared repair operations


The JSON checkpoint contains page-index hits, record preimage hashes, and source paths for every group.
