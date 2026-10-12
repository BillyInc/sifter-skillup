# Repair lane A — JAMB source/offering context incremental checkpoint 015

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Administration occurrences 24–33 rechecked; next increment bounded  
**Lane:** JAMB source/offering contexts only

## Completed increment

Checked only Administration ledger occurrences **24–33**, continuing from
checkpoint 014. Engineering is complete; this slice ends at Administration
occurrence 33 (`Finance and Investment`). Rows 34 onward were not modified.

The ten exact ledger rows are Accounting and Finance; Cooperative and Rural
Development; Logistics and Supply Chain Management; Development and
Communication Studies; Public Relations and Advertising; Transport and
Logistics Management; Insurance and Actuarial Science; Office and Information
Technology / Information Resource Management; Accountancy and Forensic Studies;
and Finance and Investment.

- **Eight source-confirmed rows:** Accounting and Finance (Administration),
  Cooperative and Rural Development, Logistics and Supply Chain Management,
  Development and Communication Studies, Transport and Logistics Management,
  Insurance and Actuarial Science, Accountancy and Forensic Studies, and
  Finance and Investment. Existing institution arrays were checked against
  exact title/awarder cells in the official IBASS Administration brochure; no
  institution changes were justified in these rows.
- **Accounting and Finance context preserved:** the Administration brochure's
  distinct `ACCOUNTING AND FINANCE` row on printed p. 48 lists **BCU** only;
  the preceding standalone `ACCOUNTING` awarder sequence ends with UYO,
  VISION-UNI, WELLSPRING and WESTERN-DEL. The separate Social Sciences
  brochure has its own `ACCOUNTING AND FINANCE` row for **FEDOTUOKE** (the
  brochure's institution code for the FUOTUOKE offering). The
  Administration record remains separate and does not decide a curriculum
  union.
- **Two identity-grouping holds documented, not falsely promoted:** on printed
  p. 92, `PUBLIC RELATIONS AND ADVERTISING` lists IGBINEDION, while separate
  `PUBLIC RELATION` and `ADVERTISING` headings each list ABUJA, IMSU and BSU.
  On printed p. 87, `OFFICE AND INFORMATION TECHNOLOGY` lists LASUSTECH and
  `INFORMATION RESOURCE MANAGEMENT` lists BABCOCK and LCITY. Both records now
  retain item-specific, source-faculty-aware `source_offering_contexts` with
  verified title-to-institution associations. The slash/grouped canonical
  identity relationship remains held pending the canonical-identity
  adjudication; those exact source cells are not merged or discarded.
- Blank UTME/direct-entry/waiver cells remain blank where the exact programme
  row supplies no such content; neighboring programme requirements were not
  copied into them.

## Boundary and validation

This increment covers exactly **10 of 10 requested occurrences (24–33)**.
Administration occurrence 34 is `Securities and Investment`; it is the next
boundary and was not touched. Focused regression tests verify the row order,
faculty separation, exact split source contexts, and extracted source windows.

Changed files: `jamb/administration_offerings.json`, this checkpoint, and
`test_jamb_source_repair_lane_a_administration_024_033.py`. The official source
is the [IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf);
the distinct FUOTUOKE context is in the [IBASS Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf).
No CCMAS, downstream mapping, domain/subgroup naming, role naming, seed or SQL
files were changed.
