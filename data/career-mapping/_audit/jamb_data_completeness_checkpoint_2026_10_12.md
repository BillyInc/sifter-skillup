# JAMB canonical data completeness checkpoint — 2026-10-12

## Current generated scope

- Canonical JAMB identities: **420**.
- Parsed offering occurrences across nine faculty source files: **443**.
- Generated school–programme pairs: **8117**; national requirement rows: **420**.
- Preserved brochure requirement variants: **2715**.
- Institution-specific exception rows/options/items: **4011 / 1904 / 22163**.
- Parsed occurrences with exact PDF verification metadata: **268/443**; unresolved occurrence rows are in the machine ledger.

## Rule completeness and scope

The effective national fields are derived in generator order: first canonical offering occurrence, unambiguous `jamb/enrich` overlay, explicit `brochure_subject_overrides.json`, then safe unique `jamb_brochure_source_rules`. The row ledger keeps national UTME/O'Level/Direct Entry layers separate from school-scoped exception rows. Blank national fields stay gaps even where a school exception exists. Present-but-unparseable text stays a review gap.

Source-rule repairs applied by the current generator: **357**; enrichment applied/conflicted: **469 / 5**; explicit override records applied: **0**.
Exact institution-scoped source resolution artifact: **22** exact rows, **127** residual rows. This evidence is not promoted into national rules.

## Offerings integrity gates

Empty main institution lists: **0**; duplicate codes within an occurrence: **0**; duplicate institution–programme pairs across source occurrences: **2904**.
Cross-file duplicate identities are retained as separate faculty/source contexts. Unverified institution rosters are not counted complete based on a matching programme title. The auditor checks exact identity joins and duplicate pair risk; it does not claim that an institution offers a programme without a matching official source cell.

## Unresolved queue

The machine-readable ledger has **895** row-level gap/evidence records. It includes every blank national layer, every non-matchable UTME/O'Level national text layer, every source-rule-repaired national layer, and each offering occurrence without exact PDF cell verification metadata. Exact URLs, file/page/table locators and access dates are retained wherever present in the checked-in sources.

## Reproduction

```powershell
python data/career-mapping/_audit/audit_jamb_data_completeness_2026_10_12.py
# The audit invokes _gen_seed.py with CAREER_PILOT_SEED_OUTPUT_PATH pointed at a temporary file.
```

This is a local source/generated-artifact audit. It does not apply SQL, promote student-facing rules, or establish live deployment state.
