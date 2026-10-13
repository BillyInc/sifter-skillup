# Lane 2 source-audit checkpoint 023 - JAMB identity 143: Biochemistry and Molecular Biology

## Source decision

The exact JAMB body entry is present in the full Sciences brochure extraction at `Sciences.txt:419-423`: the heading **BIOCHEMISTRY AND MOLECULAR BIOLOGY** occupies lines 419-420 and is followed by awarders **DOU**, **HENSARD**, and **ZAMFARA** at lines 421-423. The next heading, **BIOTECHNOLOGY AND MOLECULAR BIOLOGY**, begins at line 425 and has the separate awarder **FUHS-ILA**. These are distinct entries and were not combined.

Primary source: [JAMB IBASS Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), accessed 2026-09-29. The exact source locator is the checked-in extraction `data/career-mapping/_jamb_txt/Sciences.txt:419-423`.

## Comparison to the current occurrence

The current `sciences_offerings.json` correctly contains the exact title and the three source-supported institution tokens. Its recorded locator, `Sciences.txt:411-416`, points to preceding material and does not identify this heading or awarder block. Thus the source status and values are supported, but the item-specific locator must be corrected when the audit findings are reconciled into the shared ledger.

## Result

- Exact JAMB body cell confirmed; DOU, HENSARD, and ZAMFARA all match.
- Locator defect confirmed; correction is limited to the item-specific source locator/access evidence.
- The distinct Biotechnology and Molecular Biology occurrence is not part of this cell.
- No shared JAMB offering, CCMAS, mapping, or seed data was edited.

`test_jamb_ccmas_source_audit_lane_2_checkpoint_023.py` protects the source boundary, exact institution set, and audit-only constraint.
