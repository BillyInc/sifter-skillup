# Local reconciliation — DPT Physiotherapy PST 412–415

Source: NUC Allied Health Sciences CCMAS 2023, official PDF `https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf`, checked 2026-09-29.

- **PST 412:** removed only the page-footer spill from outcome 5; replaced the truncated 400-character summary with coverage through spinal disorders, connective-tissue conditions, joint replacement, post-operative care, soft-tissue injuries and fracture management. Structural values and all six outcomes are preserved.
- **PST 413:** set the table title, units 2 and PH 90; retained null LH for the source dash, five outcomes and full course coverage. The NUC table/detail title variation is explicitly recorded rather than silently collapsed.
- **PST 414:** completed the course summary. The official outcome word “patents” is preserved and explicitly marked as a source anomaly; no unsupported edit to the outcome was made.
- **PST 415:** completed the course summary and added provenance. The source phrase “Pain as a fifth vital signs” is documented; the concise summary paraphrases it without changing the original outcomes.

Regression coverage: `test_physiotherapy_pst412_415_repairs_2026_09_29.py`. The detailed source-audit checkpoints 024–027 remain append-only evidence of the pre-repair state.
