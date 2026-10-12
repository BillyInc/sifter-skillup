# Repair lane A — JAMB source/offering context incremental checkpoint 003

**Date:** 2026-09-26 (Africa/Lagos)  
**Status:** bounded lane complete for this time-box; focused validation passed  
**Lane:** JAMB source/offering contexts only

## Completed repairs

Changed only these occurrence records:

- `data/career-mapping/jamb/social_management_offerings.json`
  - `programmes[32]`: preserved `BABCOCK` and canonical display spelling;
    recorded the source heading typo `INTERNTIONAL` as source alias metadata.
  - `programmes[48]`: corrected `Sociology and Anthroplogy` to
    `Sociology and Anthropology`, retained all 13 institutions, and preserved
    the parsed spelling as an audit alias.
- `data/career-mapping/jamb/engineering_offerings.json`
  - `programmes[22]`: reduced `Meteorology` institutions to the exact source
    awarder cell `FUTA`, `UMYUK`, `MINNA`; removed adjacent programme/header
    tokens and added the source locator.
  - `programmes[23]`: reduced `Hotel Management and Tourism` to its exact
    source awarder `WESLEYUNI`; removed the wrapped heading token `AND TOURISM`
    and added the source locator.
- `data/career-mapping/jamb/agriculture_offerings.json`
  - `programmes[28]`: retained `FUNAAB` and `KWASU`, and recorded the exact
    source heading `ENVIRONMENTAL MANAGEMENT AND TOXICOLOGY` and locator.

## Verified without rewrite

- Sociology `programmes[50]` contains one `UDU`, matching the prior duplicate
  repair checkpoint.
- Sciences `Environmental Science and Technology` retains `WESLEYUNI` and the
  `ENVRIONMENTAL` source alias.
- Sciences `INFORMATION AND MEDIA TECHNOLOGY` retains `MINNA` and its page-break
  source locator.

## Focused validation

Added:
`data/career-mapping/_audit/test_jamb_source_offering_repairs.py`

Command and result:

```text
python -m pytest --basetemp .pytest-tmp-jamb-source-repair-20260926 data/career-mapping/_audit/test_jamb_source_offering_repairs.py -q
4 passed in 0.53s
```

The validator reads the extracted brochure files as Windows-1252 and preserves
form-feed page markers so the existing line locators are checked correctly.

## Stop boundary

No additional source edit is justified from the bounded evidence reviewed in
this lane. The remaining 419 `offering_context_unverified` records are evidence
state, not confirmed parser corrections, and were not broadly rescanned. No
programme mapping, curriculum scope, skills, seed, SQL, UI, domain, subgroup,
or role file was edited.
