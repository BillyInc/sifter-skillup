# Lane 2 source-audit checkpoint 025 — German CCMAS courses GER 104–108

## Source and scope

Audited course ordinals 6–10 in CCMAS package index 080, **Modern European Languages B.A (German)**, against the exact course blocks in the official NUC Arts CCMAS 2023 PDF. Source: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29; printed pages 471–474.

## Decisions

- **GER 104 — confirmed extraction artifact:** Metadata, content, and seven outcomes agree, except outcome 5 has the non-source suffix `New Arts 472`. Remove only that suffix during reconciliation.
- **GER 105 — confirmed match:** Metadata, content, and all seven outcomes match the detailed source block.
- **GER 106 — confirmed merged outcome + extraction artifact:** NUC has eight outcomes, while the local record has seven. Source outcomes 6 and 7 (social/economic reading and translation/interpretation) are merged together with the page spill `New Arts 473`. Split them at the source boundary and remove only the spill; retain source outcome 8 as the final facilitator outcome.
- **GER 107 — confirmed match:** Metadata, content, and all seven outcomes match.
- **GER 108 — confirmed content truncation:** Metadata and seven outcomes match, but the content summary ends at `Learn how to`. NUC continues with conjugation by person and noun declension by gender and number. Restore only the source-backed continuation.

No internal source conflict was found in these five detailed course blocks. No shared product ledger was edited. The three verified repair findings are sent to the local reconciliation queue in the machine-readable checkpoint.

**Next cursor:** CCMAS package index 080, course ordinals 11–15; then JAMB identity row 144 after importing existing decisions.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_025.py`.
