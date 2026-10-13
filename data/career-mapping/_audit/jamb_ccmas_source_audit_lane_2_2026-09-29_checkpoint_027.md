# Lane 2 source-audit checkpoint 027 — German CCMAS courses GST 212–GER 201

## Source and scope

Audited course ordinals 11–15 in CCMAS package index 080 (**Modern European Languages B.A (German)**) against the exact NUC Arts CCMAS 2023 blocks, printed pp. 474–477. Primary source: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

## Decisions sent to local reconciliation

- **GST 212:** Eight outcomes match, but the content summary is cut off and its remaining source content is appended to the eighth outcome. Restore the content field and remove only that spill.
- **GST 222:** Five outcomes match. The source says `2 Units C- LH 30`, while local data says status `C` and leaves LH blank. Its content is truncated and includes `New Arts 475`. Preserve the official `C-` and LH 30, and complete the source-backed content.
- **FAC 201:** Local extraction has put preceding German text, page spill, the FAC 201 material, and following text into one `skills_learned` string; its `content_summary` is null and LH is missing. Separately, the NUC itself labels the course Digital Humanities but gives outcomes 3–7 about B.A. German and German-language employment. This is an official-source anomaly, not a license to invent replacement outcomes.
- **FAC 202:** Local content is truncated, but all five outcomes match the official text. Outcomes 4–5 are German-language/language-lab outcomes under an Arts-and-Disciplines title; that mismatch is in the NUC source and needs explicit source-aware handling.
- **GER 201:** Metadata and content match. The local record merges two source outcomes and appends `New Arts 477`; split the outcomes and remove only the page marker.

No shared curriculum ledger was edited. The source-level FAC 201/FAC 202 mismatches are explicitly held from being treated as verified student requirements pending adjudication. Checkpoint JSON contains per-field evidence and exact source locators.

**Next cursor:** CCMAS package index 080, course ordinals 16–20; then JAMB identity row 144.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_027.py`.
