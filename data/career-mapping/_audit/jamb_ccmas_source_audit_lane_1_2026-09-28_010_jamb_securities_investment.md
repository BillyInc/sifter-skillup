# Lane 1 increment 010 — JAMB Securities and Investment occurrence

**Access date:** 2026-09-28 (Africa/Lagos)  
**Scope:** canonical JAMB identity 081, Administration source occurrence `570efed10b81e39e`.  
**Disposition:** `confirmed_match` for exact title and awarder sequence; visual table geometry remains unverified. No shared product data was edited.

## Primary-source comparison

Compared the current parsed offering with the official [JAMB IBASS Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf). The official indexed-PDF result returns the sequence `WELLSPRING — SECURITIES AND INVESTMENT — MOUNTAIN TOP — NASARAWA`; the repository extraction places `WELLSPRING` at line 652, the distinct `SECURITIES AND INVESTMENT` heading at lines 654–655, then `MOUNTAIN TOP` and `NASARAWA` at lines 656–657. The page break follows the printed page 56 footer, so the heading is located on printed p. 57 by page sequence; the extracted-text locator is retained to make that inference explicit.

The exact title row therefore has awarders **MOUNTAIN TOP** and **NASARAWA**. `WELLSPRING` is before the title heading and belongs to the preceding table context; it is not added to this occurrence. The local Administration offering at ordinal 34 contains the same title and awarder list. The source record previously had `source_text_confirmed` but no item locator/access date; this increment supplies lane evidence for that precise occurrence without modifying the shared record.

## Limits and next step

The official indexed PDF text and the repository’s extracted source text agree. I did not obtain a rendered PDF view, so this does not claim pixel-level confirmation of table-cell geometry. No source conflict was found in the observed title/awarder sequence. Continue with the uncovered or conflicting occurrences in identities 001–140; do not repeat this occurrence absent contradictory evidence.

Machine-readable details and the regression check are in the paired `.json` file and `test_jamb_ccmas_source_audit_lane_1_2026_09_28_010.py`.
