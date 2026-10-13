# Aggregate JAMB offering/source-context audit checkpoint

**Date:** 2026-09-26 (Africa/Lagos)  
**Status:** local deterministic offering/source-context audit complete; source-cell verification and repair remain explicitly open where marked below  
**Lane:** JAMB offering identity/source-context integrity only  
**Scope:** all 420 canonical JAMB identities and all current offering occurrences  
**Access date for cited source locators:** 2026-09-26  
**Restrictions honoured:** no shared source, mapping, seed, downstream taxonomy, role, role-naming, or UI file was edited.

## Aggregate coverage

The audit covered the complete current catalogue, not a sample.

| Measure | Final local count |
|---|---:|
| Canonical JAMB identities | **420/420** |
| Parsed offering occurrences | **441/441** |
| Separately retained manual source-confirmed occurrences | **1** |
| Total source-offering occurrence records | **442** |
| Parsed source files | **9** |
| Canonical identities without an exact source name | **0** |
| Source names without an exact canonical identity | **0** |
| Identities with multiple source-faculty contexts | **20** |
| Identity rows with at least one unverified occurrence | **419** |
| Current occurrence records carrying PDF verification metadata | **3** |
| Current parsed rows carrying PDF verification metadata | **2** |
| Mapping-faculty contexts absent from parsed faculty contexts | **29** |

### Parsed source files included

- `data/career-mapping/jamb/administration_offerings.json` — 60 records
- `data/career-mapping/jamb/agriculture_offerings.json` — 28 records
- `data/career-mapping/jamb/arts_hum_offerings.json` — 43 records
- `data/career-mapping/jamb/education_offerings.json` — 12 records
- `data/career-mapping/jamb/engineering_offerings.json` — 37 records
- `data/career-mapping/jamb/law_offerings.json` — 6 records
- `data/career-mapping/jamb/medical_offerings.json` — 16 records
- `data/career-mapping/jamb/sciences_offerings.json` — 187 records
- `data/career-mapping/jamb/social_management_offerings.json` — 52 records

The extracted source evidence files inspected were the corresponding nine files
under `data/career-mapping/_jamb_txt/`. The official source URL is the matching
JAMB IBASS degree brochure for each faculty; the exact URLs and local line
locators are retained in the incremental checkpoints below.

## Work recorded in the append-only checkpoints

The full-catalogue deterministic scans and bounded source windows are recorded
in these append-only files:

- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_001.md`
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_002.md`
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_003.md`
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_004.md`
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_005.md` — bounded identities 001-020
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_006.md` — bounded identities 021-040
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_007.md` — bounded identities 041-060
- **This aggregate:** `data/career-mapping/_audit/jamb_offering_source_context_aggregate_checkpoint_2026-09-26_final.md`

The completed catalogue-wide checks were:

- all 441 parsed occurrences compared with the prior source-audit catalogue;
- normalized full-text scan of all 441 parsed records: 338 direct hits and 103
  wrapped/alias/typo/cell-boundary review-queue records;
- prior source-audit join: 419 direct catalogue corroborations, 14 declared
  alias corroborations, and 8 no-same-faculty-source-audit-hit records;
- exact canonical/source-name inventory comparison: zero canonical gaps and zero
  unowned source names;
- institution-array integrity scan: one duplicate institution-token record and
  100 existing header/faculty-token incidences across 65 records;
- display-name/source-faculty collision scan across all 420 identities;
- bounded detailed source-window review for identities 001-060, with exact
  parsed file, row ordinal, local locator, source faculty, institution count,
  status, and recommendation recorded in checkpoints 005-007.

The 061-080 structural scan was also read-only and found no duplicate or header
token in that increment, but the aggregate completion claim rests on the
catalogue-wide deterministic scan and the existing full-catalogue artifacts;
it does not pretend that every occurrence has visual PDF-cell verification.

## Confirmed issues and exact repair recommendations

“Confirmed” below means the discrepancy is present in the current local parsed
record and/or extracted source text. It does not mean that the repair has been
applied.

### Confirmed source/context issues

1. **Duplicate institution token — Sociology**
   - Record: `data/career-mapping/jamb/social_management_offerings.json`,
     `programmes[50]` (1-based).
   - Evidence: official [JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf),
     `data/career-mapping/_jamb_txt/Social Management Science.txt:4909-5042`,
     accessed 2026-09-26.
   - Finding: `UDU` occurs twice in the parsed institution array.
   - Repair: remove only the duplicate after exact source-cell repair; retain one
     source-supported `UDU` association and a stable occurrence locator.

2. **Source spelling anomaly — Environmental Science and Technology**
   - Record: `data/career-mapping/jamb/sciences_offerings.json`,
     `programmes[165]` (1-based).
   - Evidence: official [JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf),
     `data/career-mapping/_jamb_txt/Sciences.txt:5491-5505`, accessed
     2026-09-26.
   - Finding: source text has `ENVRIONMENTAL / SCIENCE AND / TECHNOLOGY /
     WESLEYUNI`; the canonical identity is correctly normalized as
     `Environmental Science and Technology`.
   - Repair: retain the corrected canonical display name, preserve the
     source-original typo as an audit alias/locator, and keep `WESLEYUNI` on this
     occurrence. Do not merge it with Environmental Management offerings.

3. **Wrapped source cell — Information and Media Technology**
   - Record: `sciences_offerings.json`, `programmes[95]` (1-based).
   - Evidence: official [JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf),
     `Sciences.txt:9441-9479`, accessed 2026-09-26.
   - Finding: the source cell is split across the extracted page boundary as
     `INFORMATION AND` then `MEDIA TECHNOLOGY / MINNA`; adjacent rows are distinct.
   - Repair: retain a distinct Sciences occurrence for `MINNA` and store the
     page-boundary locator. Do not merge it with another Information Technology
     name without an exact awarder cell.

4. **Source spelling anomaly — Political Science / International Law and Diplomacy**
   - Record: `social_management_offerings.json`, `programmes[32]` (1-based),
     institution `BABCOCK`.
   - Evidence: official [JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf),
     `Social Management Science.txt:3957-3960`, accessed 2026-09-26.
   - Finding: source heading spells `INTERNTIONAL`.
   - Repair: keep the corrected canonical display name, retain the source typo as
     an audit alias/locator, verify the exact PDF cell, and keep `BABCOCK`
     scoped to this occurrence. This same source typo is also present in the
     older subject-requirements audit; it is not counted twice as a new global
     issue.

5. **Parsed/source spelling discrepancy — Sociology and Anthropology**
   - Record: `social_management_offerings.json`, `programmes[48]` (1-based),
     currently named `Sociology and Anthroplogy`.
   - Evidence: official [JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf),
     `Social Management Science.txt:4854-4871`, accessed 2026-09-26.
   - Finding: extracted source heading is `SOCIOLOGY AND ANTHROPOLOGY`, while
     the parsed record says `Anthroplogy`.
   - Repair: use `Sociology and Anthropology` as the corrected canonical display
     identity after PDF-cell confirmation; retain the parsed spelling as an
     audit alias and preserve the 13 institution associations. Do not merge with
     standalone Anthropology.

6. **Adjacent-programme contamination lead — Meteorology**
   - Record: `data/career-mapping/jamb/engineering_offerings.json`,
     `programmes[22]` (1-based).
   - Evidence: official [JAMB Engineering brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf),
     `engineering.txt:6489-6545`, accessed 2026-09-26.
   - Finding: the extracted window interleaves Meteorology, Meteorology and
     Climate Change, Nutrition and Dietetics, and Hotel Management and Tourism.
   - Repair: recover exact PDF cells and split institution lists before changing
     the occurrence. This remains an evidence/repair lead, not permission to
     delete institutions now.

7. **Wording collision — Environmental Management and Technology**
   - Record: `data/career-mapping/jamb/agriculture_offerings.json`,
     `programmes[28]` (1-based).
   - Evidence: official [JAMB Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf),
     `agriculture.txt:2568-2577`, accessed 2026-09-26.
   - Finding: the source window shows Environmental Management and Toxicology and
     Environmental Management and Pollution Control around the canonical name;
     the exact awarder cell is not yet closed.
   - Repair: recover the exact source cell and institution boundary before
     changing the canonical occurrence; do not merge the two named programmes.

## Candidate/open issues requiring source-cell closure

These are not promoted as confirmed repairs until the item-specific source cell
is captured.

1. **Eight older source-audit no-hit joins:**
   - Environmental Management and Technology — Agriculture;
   - Anthropology — Arts/Humanities;
   - Meteorology — Engineering;
   - Information and Media Technology — Sciences;
   - Environmental Science and Technology — Sciences;
   - LIBRARY SCIENCE — Social/Management Sciences;
   - LIBRARY AND INFORMATION SCIENCE — Social/Management Sciences;
   - LIBRARY AND INFORMATION SCIENCE — Sciences.
   These are source-audit join gaps, not proof that the programmes do not exist.
   Repair recommendation: capture the exact JAMB offering cell or record a
   source-unavailable result with URL, locator, date, and reason; do not mark the
   JAMB identity unavailable merely from a failed normalized join.

2. **103 wrapped/alias/typo/cell-boundary records:** the deterministic scan
   identified these for exact source-window adjudication. The 100
   header/faculty-token incidences in 65 records are included in this queue.
   Repair recommendation: split genuine institutions from faculty/table headers,
   preserve source-original spelling as aliases, and leave an occurrence
   unchanged when the exact source cell cannot yet distinguish the boundary.

3. **Candidate canonical/source-heading variant:** `Public and International
   Law` versus extracted source heading `PUBLIC AND PRIVATE INTERNATIONAL LAW:`
   (`Law.txt:495-499`, official JAMB Law brochure, accessed 2026-09-26).
   Repair recommendation: confirm the PDF cell; preserve the canonical display
   identity plus the source-original heading alias, and keep `AAUA` and
   `MAIDUGURI (Pub)` scoped to this occurrence.

4. **Source occurrence records still lacking item-specific PDF verification:**
   419 identity rows have at least one unverified occurrence in the current
   inventory. This is an evidence-state issue, not a finding that all 419 are
   absent or wrong. Repair recommendation: verify each occurrence against the
   exact JAMB cell or explicitly record why authoritative item-specific evidence
   is unavailable; do not silently promote unverified rows.

## Confirmed distinct multi-faculty contexts

These are confirmed source-context distinctions, not defects. They must remain
separate in any later repair:

- 021 International Relations — Administration; Social/Management Sciences
- 025 International Studies and Diplomacy — Administration; Social/Management Sciences
- 045 Psychology — Arts and Humanities; Social/Management Sciences
- 046 Public Administration — Administration; Social/Management Sciences
- 047 Public Administration and Local Govt — Administration; Social/Management Sciences
- 072 Accounting and Finance — Administration; Social/Management Sciences
- 101 Computer Science — Engineering/Environmental/Technology; Sciences
- 108 Statistics — Engineering/Environmental/Technology; Sciences
- 109 Software Engineering — Engineering/Environmental/Technology; Sciences
- 119 Biotechnology — Agriculture; Sciences
- 139 Plant Science — Agriculture; Sciences
- 256 Fisheries — Agriculture; Sciences
- 291 Economics — Administration; Arts and Humanities; Engineering/Environmental/Technology; Social/Management Sciences
- 296 Mass Communication — Administration; Arts and Humanities
- 307 Sociology — Arts and Humanities; Social/Management Sciences
- 321 Geography — Engineering/Environmental/Technology; Sciences
- 344 Optometry — Medical/Pharmaceutical/Health; Sciences
- 350 Film and Video Studies — Administration; Social/Management Sciences
- 379 LIBRARY AND INFORMATION SCIENCE — Sciences; Social/Management Sciences
- 388 Sport Science — Education; Sciences

Repair recommendation: retain separate occurrence IDs, institution lists, source
faculty, source URL, exact locator, and access date. Do not collapse by display
name or infer that the curricula are identical.

## Files and artifacts affected by this audit

### Read-only source/mapping artifacts inspected

- `data/career-mapping/programme_mapping.json`
- `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
- `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_brochure_source_audit_2026-08-17.json`
- the nine `data/career-mapping/jamb/*_offerings.json` files listed above
- the nine extracted text files under `data/career-mapping/_jamb_txt/`
- existing manual/source confirmation artifacts referenced by the inventory

### Append-only artifacts written

- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_005.md`
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_006.md`
- `data/career-mapping/_audit/jamb_offering_source_context_incremental_checkpoint_2026-09-26_007.md`
- `data/career-mapping/_audit/jamb_offering_source_context_aggregate_checkpoint_2026-09-26_final.md`

No shared source/mapping/seed/downstream file was edited by this finalization.
The aggregate is an audit artifact only; it does not alter the JAMB catalogue,
create SQL, reseed a database, or change student/admin availability.

## Final disposition

The **complete local catalogue audit is recorded for all 420 identities and 442
occurrence records**. Confirmed discrepancies and candidate/open evidence queues
are enumerated above with source URLs, local locators, access date, and repair
recommendations. The audit is therefore complete as an inventory and issue
register, but the source-evidence gate is not falsely marked closed: the
unverified occurrence rows, exact cell boundaries, and candidate no-hit records
still require their own authoritative source-cell adjudication before any later
repair or promotion.
