# JAMB offering-source verification — Lane B checkpoint 015

Date: 2026-09-28  
Scope: Education offering ledger, rows 1–12. This bounded tranche follows the completed Social/Management source review in checkpoint 014. No downstream mapping work or CCMAS data edits.

## Education index/title review

All 12 current ledger names were checked against the official JAMB Education
brochure index/listing (printed pp. 199–201) and the checked-in text
extraction. The index confirms these as Education-faculty listing contexts:

1. Vocational Education
2. Technology Education
3. Home Economics and Hotel Management
4. Teacher Education
5. Library Science
6. Library and Information Science
7. Education and Business Administration
8. Business Education
9. Sport Science
10. Statistics Education
11. Sport Management (the source index title; the ledger’s parenthetical
    “(Education)” is a local disambiguator, not printed title text)
12. Transport Planning and Management (TPM)

Official source: [JAMB IBASS Education degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf), accessed 2026-09-28. Search-indexed official brochure text returns the faculty index and named offerings. The PDF endpoint itself serves a JavaScript shell in direct text retrieval.

## Awarder-cell disposition: held, not promoted

The index confirms programme titles and faculty, but it is not proof of the
awarders for each detailed body row. The Education ledger’s parsed institution
arrays mix likely institution codes with course/option headings and other
non-awarder text (e.g. `EDUCATION`, `INDUSTRIAL TECHNICAL`,
`TECHNOLOGY/INTRODUCTORY`, and nested option names). This is especially
material for Vocational Education: the official body begins a “with options
in” block and lays out Agricultural Technical Education and Home Economics
in parallel columns, so an extracted union cannot be safely treated as one
flat awarder list.

Disposition: 12/12 titles/faculty reviewed; 0/12 exact awarder cells accepted
in this tranche; 12/12 remain awarder-evidence-held. No institution arrays,
admission requirements, aliases, or CCMAS scopes were rewritten. No
JAMB–CCMAS mismatch is declared solely from the malformed/ambiguous array;
the source context must be resolved before any curriculum linkage can be
judged.

## Lane-B cumulative checkpoint

Assigned Lane-B ledgers: 87 source-occurrence rows — Social/Management 53,
Education 12, Law 6, Medical 16. Current source state:

- Social/Management: 49 source-cell confirmed, 4 held, 0 unmarked.
- Education: 12 index title/faculty checks complete; 12 awarder cells held.
- Law: 6 rows still need this pass’s exact title/faculty/awarder review.
- Medical: 16 rows still need exact title/faculty/awarder review; the official
  index also contains source-list titles not represented by these ledger rows,
  documented in checkpoint 014.

Next bounded tranche: Law row 1, `Civil Law`. Do not repeat Social/Management
rows 1–41 or Arts rows 1–43. Do not start the queued 88-programme CCMAS
source audit until Lane-B JAMB source-context checks are finished.

## Focused test

```powershell
python -m pytest --basetemp .pytest-tmp-lane-b-education-015 `
  data/career-mapping/_audit/test_jamb_source_repair_lane_b_education_015.py -q
```

Result: `1 passed` (recorded after execution).
