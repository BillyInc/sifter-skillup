# JAMB offering-source verification — Lane B checkpoint 016

Date: 2026-09-28  
Scope: Law offering ledger, rows 1–6. No downstream mapping work or CCMAS data edits.

## Law title/body reconciliation

Compared the six source rows with the official JAMB Law brochure (index
printed p. 418; body pages 419–430) and the repository extraction. The index
lists eight programme-name variations; the body has six distinct headings.

- **Four body rows confirmed:** `Islamic Law/Sharia Law` — ABU, KHAIRUN,
  MAIDUGURI, PAAU, PRU; `Common and Islamic Law` — 10 awarders in the body
  cell; `Criminology and Security Studies` — JOS; and `Common Law` — ILORIN,
  KWASU. Criminology and Security Studies under Law is kept separate from its
  Social Sciences source occurrence.
- **Two rows held:** `Civil Law` has a ledger institution token `LAW` that is
  not supported as an awarder by the exact body cell and appears also as a
  separate name in the brochure index. The current source cell needs a clean
  institution-only reconciliation before it is promoted. `Public and
  International Law` is an index label, while the body heading is `Public and
  Private International Law`; AAUA and `MAIDUGURI (Pub)` are not promoted as
  the exact awarder cell for the index identity until that title discrepancy
  is resolved.
- The index-only variations `International Law and Jurisprudence` and
  `Private and Islamic Law` have no separate body heading in the current
  official extraction. They were not silently added as new canonical
  identities or mapped to a neighboring Law row.

Counts: 6/6 Law ledger rows title/faculty/body reviewed; 4 exact body title and
awarder cells confirmed; 2 held for source-context/title reconciliation. No
Law source fields or JAMB–CCMAS mappings were changed.

Source: [Official JAMB IBASS Law degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf), accessed 2026-09-28. Direct text retrieval resolves to a JavaScript shell; page/title/cell checks use the official indexed PDF and the checked-in extraction.

## Lane-B status and next boundary

Across assigned source files: 87 source-occurrence rows. Social/Management
remains 49 confirmed / 4 held; Education has 12 title/faculty checks with
awarders held; Law is 4 confirmed / 2 held; Medical has 16 exact source-cell
checks still open. Lane B is not closed, and the queued CCMAS package audit
has not started.

Next bounded tranche: Medical row 1, `Anatomy`. Do not repeat Social rows
1–41 or Arts rows 1–43.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-lane-b-law-016 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_law_016.py -q
```

Result: `1 passed` (after execution).
