# JAMB offering-source verification — Lane B checkpoint 014

Date: 2026-09-28  
Scope: resume after Social/Management row 41 (checkpoint 013); continue source-context audit only. No domain, subgroup, role, or other downstream mapping edits.

## Social/Management rows 42–53 reconciled

The existing ledger already had metadata for rows 42–49, but the prior tranche
test did not prove the advertised cells: its broad title-prefix anchors could
match a different entry, and its “next row untouched” assumptions were stale.
Rechecked the source text against the official IBASS Social Sciences brochure
and corrected the evidence state rather than preserving unsupported
confirmation:

- Row 42, `Peace and Conflict Studies`: official index title/faculty confirmed
  (printed p. 575), but no exact body awarder cell was located. The detailed
  source has a separate `Peace Studies and Conflict Resolution` row; it is not
  interchangeable. Marked the awarder evidence held and cleared the list of
  codes represented as verified. Existing candidate institutions were not
  deleted or promoted.
- Rows 43–46: `Psychology`, `Public Administration`, `Public Administration
  and Local Govt`, and `Public Administration and Policy Studies` retain their
  row-specific evidence. The latter two are distinct body headings at printed
  p. 587, with UNN and MIVA/TANSIAN respectively.
- Row 47, `Government and Public Administration`: index title/faculty confirmed
  (printed p. 574), but no corresponding exact body title/awarder cell was
  located. Marked held; ABSU/BAZE remain unverified candidates.
- Rows 48–49: `Sociology and Anthropology` and `Social Work` remain distinct
  body offerings and are not merged into Sociology.
- Rows 50–52 now carry item-specific official source evidence: `Sociology`
  (printed pp. 675–678; 94 awarders), `Film and Video Studies` (p. 642;
  WESTERN-DEL), and `Sociology and Social Studies` (p. 678; DOU). Film and
  Video Studies is preserved separately from the same-named Administration
  offering and from `Film Studies and Production` / KWASU. Requirements for
  these rows were not copied from neighboring titles.
- Row 53, the separately captured PAN-ATLANTIC `Information Science and Media
  Studies` source occurrence, was already verified in checkpoint 012 and was
  not repeated or merged with the Sciences occurrence.

Current Social/Management ledger status: 53 occurrence rows; 49 have
`verified_against_pdf=true`, 4 are explicitly held, and none are unmarked.
These are source-occurrence counts, not unique JAMB identities. The two
index-only cases above are intentionally not considered verified awarder
cells.

## Education, Law, and Medical ledger triage

The current files contain 12 Education, 6 Law, and 16 Medical occurrence
records. Official brochure index/title/faculty material and the repository
extractions were checked to establish the next exact-cell audit boundaries;
the awarder cells for these three ledgers are **not yet fully verified** and
none is promoted by this checkpoint.

- Education index: printed pp. 199–201. The 12 ledger names are represented in
  the Education index/listing. The parsed institution arrays are not reliable
  as awarder evidence in several rows: examples include course/heading text
  embedded as institution values in Vocational Education, Technology
  Education, Home Economics and Hotel Management, and Library and Information
  Science. Reconstruct and verify these against each exact body title cell
  before marking a row source-confirmed; do not use the contaminated lists as
  CCMAS linkage evidence.
- Law index: printed p. 418. It lists eight name variations while the body
  ledger has six source headings. In particular, body `PUBLIC AND PRIVATE
  INTERNATIONAL LAW` is not a verbatim body heading for index `Public and
  International Law`; index `International Law and Jurisprudence` and
  `Private and Islamic Law` have no separate body heading in the current
  extraction. The `Criminology and Security Studies` / JOS occurrence is under
  the Law faculty and must remain a separate source context from its Social
  Sciences occurrence. The Civil Law institution array also includes `LAW`,
  which needs exact source-cell review before being treated as an awarding
  institution.
- Medical index: printed p. 428; body starts p. 429. The index has 18 listed
  entries (including both `Prosthesis and Orthopaedic Technology` and
  `Veterinary Medicine`); the current Medical offering ledger has 16 and
  lacks those two source-list entries. The brochure itself repeats number 15
  for Prosthesis and Public Health Technology. These two names are not in the
  current canonical 420 JAMB identity map, so this checkpoint records them as
  source-census gaps only; it does not create identities or CCMAS mappings.
  Exact awarder cells for the 16 current ledger rows remain unverified.

This phase has therefore **not closed Lane B**. It records the source-backed
title/faculty anomalies and the remaining exact awarder-cell work. Only
JAMB↔CCMAS identity/scope issues are in scope; no downstream domain,
subgroup, or role work was done. No CCMAS data was written.

## Sources

- [Official JAMB IBASS Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf) — printed pp. 574–575, 587, 642, 675–678.
- [Official JAMB IBASS Education degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf) — printed pp. 199–201 and programme-body sections.
- [Official JAMB IBASS Law degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf) — printed p. 418 index and body headings.
- [Official JAMB IBASS Medical degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf) — printed p. 428 index and body beginning p. 429.

Official-source access/verification date: 2026-09-28. JAMB's PDF URLs return a
JavaScript shell to the text browser, so the title/cell locators were checked
against the official indexed brochure content and checked-in brochure text
extractions. Where the exact offering cell was not recoverable, the record is
explicitly held rather than represented as confirmed.

## Tests

Focused checks:

```powershell
python -m pytest --basetemp .pytest-tmp-lane-b-social-014 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_011.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_012.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_013.py `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_remaining_social_014.py -q
```

Result: `4 passed` (see completion checkpoint after rerun).

Resume: exact awarder-cell audit for Education, Law, and Medical; do not start
the queued 88-package CCMAS source audit until Lane B source-context checks
are finished.
