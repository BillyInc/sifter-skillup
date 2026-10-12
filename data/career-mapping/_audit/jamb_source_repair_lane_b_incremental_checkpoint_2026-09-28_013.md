# JAMB offering-source verification — Lane B checkpoint 013

Date: 2026-09-28  
Status: Social/Management rows 34–41 checked; next sequential row is 42.

## Scope completed

Verified the next eight sequential Social/Management ledger records after
checkpoint 012 against the official JAMB IBASS Social Sciences brochure and
the checked-in brochure text extraction:

1. `Political Science and Public Administration` — AAU, BENIN, BIU,
   IGBINEDION, KWASU, RHEMA, WESTERN-DEL.
2. `Political and Administrative Studies` — PHC.
3. `Political Science and International Relations` — ABUJA, CRAWFORD, CUAB,
   GOUU, HENSARD, KWARARAFA, NILE, TSUJ, UNIOSUN.
4. `Political Science and International Studies` — CUAB.
5. `Political Science and Conflict Resolution` — AL-HIKMAH.
6. `Political Science and Defence Studies` — NDA.
7. `Peace Studies and Conflict Resolution` — 22 awarders, AL-ANSAR through
   UNIOSUN as listed in the ledger.
8. `Peace Strategic and Conflict Resolution` — AJAYI.

All eight entries now have the official item URL, a title/cell-specific table
locator, exact verified institution codes, and verification date. Distinct
titles and source contexts remain separate. This tranche verifies only the
programme-heading/awarder cells; it does not claim curriculum or downstream
mapping correctness.

## Source pagination caveat

The live IBASS PDF URL resolves to a JavaScript shell in direct retrieval, but
the official IBASS indexed document returns the current Social Sciences table
and the title/awarder sequence. The checked-in text extraction independently
shows the same sequence across its internal page labels 660–662. The official
indexed snippets expose page labels 666–669 for the same region. Because these
renderings disagree on pagination, each ledger locator identifies the exact
programme heading and adjacent awarder-cell boundary, and notes the page-label
conflict instead of treating either page number as settled. Source:
<https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf>.

## Changes deliberately not made

- No institution arrays, requirements, waivers, or canonical identities were
  changed; only source-verification metadata was added to rows 34–41.
- In particular, `Political Science and International Relations` was not
  merged with the separately listed `Political Science and International
  Studies` or `Political Science and Public Administration` offerings.
- The adjacent `Peace Strategic and Conflict Resolution` / AJAYI occurrence
  was not assumed to have the same curriculum as `Peace Studies and Conflict
  Resolution`.
- No additional title absent from the 420 canonical identities was added.
- No CCMAS scopes or downstream mappings were changed.

## Counts and next boundary

Social/Management ledger: 53 source-occurrence rows; 40 PDF-verified, 3 held,
9 not yet source-verified, and 1 legacy text-only confirmation. This is a
faculty-lane count, not completion of all 420 canonical JAMB identities.

Focused regression test:

```powershell
python -m pytest --basetemp .pytest-tmp-lane-b-012-20260928 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_012.py -q
```

The test checks the exact 34–41 boundary, title/institution lists, official
source metadata, shared-field preservation, and that row 42 (`Peace and
Conflict Studies`) remains untouched. Previous checkpoint 012's rows 26–33
remain outside this tranche.

Next: row 42, `Peace and Conflict Studies`.
