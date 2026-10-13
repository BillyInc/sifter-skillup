# Lane 2 reconciliation correction checkpoint 024 — JAMB locator validation

## Why this correction is necessary

Checkpoints 021 and 023 interpreted line locators using Python `str.splitlines()`. That method treats form-feed page separators as line boundaries. The checked-in `Sciences.txt` locators and `rg -n` use LF-delimited lines, so the earlier source excerpts were shifted and the resulting “wrong locator” findings were false.

The corrected validation reads the CP1252 extraction and splits on LF only, leaving form-feed separators inside each line.

## Corrected JAMB decisions

- **Identity 141, Pure and Applied Mathematics:** `Sciences.txt:8004-8022` is the exact source cell. It contains the title and the four awarders BENIN, LAUTECH, PHC, and PAUL. Checkpoint 021's claim that this span was Microbiology is withdrawn. The local title, awarder list, locator, URL, and `source_text_confirmed` state agree with the extracted official JAMB brochure.
- **Identity 143, Biochemistry and Molecular Biology:** `Sciences.txt:411-416` is the exact source cell. It contains the title and DOU, HENSARD, and ZAMFARA. Checkpoint 023's claimed stale locator is withdrawn. The adjacent Biotechnology and Molecular Biology entry with FUHS-ILA remains a distinct programme.

## Separate issue retained

Checkpoint 022's source comparison for **Computer Science and Information Technology** remains valid: the official PDF indexed table confirms ACHIEVERS, BABCOCK, IGBINEDION, and OAUSTECH on printed pages 623–624, distinct from the next Computer Science and Information Science entry. The current local occurrence nevertheless remains `evidence_hold` with no URL or locator. That is a genuine local evidence-state defect for reconciliation, not an incorrect awarder-list finding.

## Reconciliation handoff and next cursor

These corrections are queued for local reconciliation; no shared product ledger was edited. Reconciliation should remove the false locator-defect flags for identities 141 and 143, while separately correcting identity 142's held state and missing evidence locator after the normal gate.

**Next audit cursor:** CCMAS package index 080, German course ordinals 6–10 (GER 104–108), then the next uncovered JAMB occurrence after importing exact checkpoints.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_024.py`.
