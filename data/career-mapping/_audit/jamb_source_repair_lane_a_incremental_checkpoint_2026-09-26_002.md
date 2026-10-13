# Repair lane A — JAMB source/offering context incremental checkpoint 002

**Date:** 2026-09-26 (Africa/Lagos)  
**Status:** bounded source repairs applied; focused validation pending  
**Lane:** JAMB source/offering contexts only

## Current source repairs

### `data/career-mapping/jamb/social_management_offerings.json`

- `programmes[32]` / `Political Science / International Law and Diplomacy`:
  retained canonical display spelling and `BABCOCK`; recorded the authoritative
  source typo `INTERNTIONAL` as `source_original_title` and an alias with the
  official brochure URL and locator `Social Management Science.txt:3877-3880`.
- `programmes[48]` / `Sociology and Anthropology`:
  corrected the parsed `Anthroplogy` spelling, retained all 13 institutions,
  and recorded the parsed spelling as an audit alias. Added the exact source
  heading, official URL, access date and locator
  `Social Management Science.txt:4757-4772`.
- `programmes[50]` / `Sociology`: verified as already repaired before this
  increment; the institution array contains exactly one `UDU`. No rewrite was
  made.

### `data/career-mapping/jamb/engineering_offerings.json`

- `programmes[22]` / `Meteorology`: removed the adjacent-cell parser tokens
  `METEOROLOGY AND`, `CLIMATE CHANGE`, `MARITIME-UNI`, `NUTRITION`,
  `DIETETICS`, `LAUTECH`, and `WESLEYUNI`. The remaining awarder cell is
  exactly `FUTA`, `UMYUK`, `MINNA`, supported by
  `engineering.txt:6489-6493`; the next source heading begins at line 6494.
- `programmes[23]` / `Hotel Management and Tourism`: removed the wrapped
  heading fragment `AND TOURISM`, retaining the source-supported `WESLEYUNI`
  association and locator `engineering.txt:6542-6545`.

### `data/career-mapping/jamb/agriculture_offerings.json`

- `programmes[28]` / `Environmental Management and Technology`: preserved the
  canonical identity and `FUNAAB`/`KWASU` associations, and recorded the exact
  source heading `ENVIRONMENTAL MANAGEMENT AND TOXICOLOGY` with locator
  `agriculture.txt:2556-2571`. The nearby Pollution Control and Forestry
  headings remain separate source context and were not merged.

## Previously completed items verified without rewrite

- Sociology duplicate `UDU` repair, recorded in
  `jamb_sociology_duplicate_institution_repair_checkpoint_2026-09-26_001.md`.
- Sciences `Environmental Science and Technology` typo alias and
  `WESLEYUNI` source context.
- Sciences `INFORMATION AND MEDIA TECHNOLOGY` page-boundary source context.

## Validation and scope

A focused validation file will assert the repaired record arrays, aliases,
source locators, and the exact extracted source windows. No curriculum, mapping,
seed, SQL, UI, domain, subgroup, or role file is part of this repair.
