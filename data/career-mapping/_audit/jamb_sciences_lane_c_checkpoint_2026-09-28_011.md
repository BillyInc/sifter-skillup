# JAMB Sciences lane C checkpoint 011

**Date:** 2026-09-28 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** final occurrences 181-187 dispositioned; 4 source-confirmed, 3 evidence holds  
**Previous checkpoint:** `jamb_sciences_lane_c_checkpoint_2026-09-28_010.md`  
**Official source:** [IBASS Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)  
**Source access date:** 2026-09-28

## Increment result

Only occurrences **181-187** were inspected. The official IBASS search-index
extracts exposed exact title/awarder context for four rows. Three other rows
remain held because the retrieved official extracts did not expose the exact
title-to-awarder cell. The source PDF URL opens as a JavaScript shell in the
available document viewer, and the local extracted `Sciences.txt` referenced
by earlier slice tests is absent from this checkout. Secondary pages and an
institution's own programme page were not substituted for JAMB source proof.

| Occurrence | Identity - institution | Disposition | Official-source locator/evidence |
|---:|---|---|---|
| 181 | Optometry - BENIN | Source-confirmed | Official IBASS indexed Sciences table; exact OPTOMETRY/BENIN row and adjacent BENIN waiver cell |
| 182 | Computer, Information and Communication Science - FED-DUTSINMA | Source-confirmed | Official IBASS indexed table, printed p. 623; title and awarder explicitly paired |
| 183 | Computer Science and Informatics - FED-OTUOKE | Source-confirmed | Official IBASS indexed table, printed p. 623; title and awarder explicitly paired |
| 184 | Computing and Artificial Intelligence - HUSTECH | Evidence hold | Exact title/awarder cell not exposed by retrieved official extract; adjacent DELSU waiver is not attribution evidence |
| 185 | Computer with Electronics - LCITY | Evidence hold | Exact title/awarder cell not exposed by retrieved official extract; secondary pages not substituted |
| 186 | Software Engineering and Digital Entrepreneurship - AVE-MARIA | Source-confirmed | Official IBASS indexed table, printed p. 627; title followed by AVE-MARIA in the same table block |
| 187 | Robotics (Artificial Intelligence) - WIGWE | Evidence hold | Official search surfaced both in wider context but not an exact pair excerpt; university page alone is insufficient JAMB evidence |

No requirements were altered, no adjacent waiver text was reassigned, and the
three holds remain out of the confirmed-source count.

## Verification and cumulative status

Focused regressions:

```text
python -m pytest data/career-mapping/_audit/test_jamb_sciences_lane_c_rows_181_187.py data/career-mapping/_audit/test_jamb_sciences_lane_c_rows_161_180.py -q
2 passed
```

| State | This increment | Sciences cumulative |
|---|---:|---:|
| Source-confirmed | **4** | **171** |
| Evidence holds | **3** | **16** |
| Unreviewed | **0** | **0** |
| Total occurrences | **7** | **187** |

The bounded 187-occurrence Sciences offering review is **closed as an audit
inventory**: every occurrence has either source confirmation or an explicit
evidence hold. It is **not** a claim that all 187 are confirmed; three remain
unresolved pending exact official table-cell evidence. Occurrences 001-180
were not re-reviewed in this increment. Only the final seven ledger entries,
their regression checks, and this append-only checkpoint were updated.
