# JAMB offering/source-context incremental checkpoint 001

**Date:** 2026-09-26 (Africa/Lagos)  
**Mode:** audit-only, append-only checkpoint  
**Scope:** the 420 canonical JAMB identities and their offering/source-context records only.  
**Explicit exclusions:** no shared JAMB source, mapping, scope, seed, CCMAS, domain, subgroup, role, or main-register edits.

## Inputs read before this increment

- `jamb_ccmas_external_audit_inventory_2026-09-26.json` (joined 420/237 inventory)
- `jamb_offering_context_inventory_2026-09-25.json` and its Markdown summary
- `jamb_anomaly_inventory_2026-09-26.json`
- `jamb_ccmas_final_verification_crosscut_001_420_2026-09-26_001.md`
- the saved range/final-verification checkpoints for rows 001–420, including the 281–420 repair handoff register
- the parsed source files under `data/career-mapping/jamb/` and extracted JAMB text under `data/career-mapping/_jamb_txt/`

Earlier closed curriculum fixes were not repeated. This checkpoint only records offering-ledger inconsistencies and source-context leads that remain open.

## Coverage at this checkpoint

| Measure | Current count | Interpretation |
|---|---:|---|
| Canonical JAMB identities | 420 | Complete identity-key coverage |
| Parsed offering occurrences | 440 | Parsed source rows across nine offering files |
| Manually source-confirmed occurrences | 1 | Separate confirmation record |
| Total occurrence records | 441 | Distinct occurrence records, not name-collapsed |
| Official-PDF verified in the offering inventory | 3 | The inventory currently carries only three verified occurrence records |
| Identities with no exact parsed source name | 0 | Name coverage only; not offering-cell proof |
| Identities with multiple parsed faculty contexts | 19 | Must retain each context separately |
| Canonical mapping faculty absent from parsed contexts | 29 | Reconciliation leads, not automatically errors |

## New deterministic finding

### OCC-NEW-001 — faculty/header terms are stored as institution tokens

A cross-file scan found **100 incidences in 65 distinct parsed offering records** where an institution array contains a faculty/header-like term rather than a university token. The terms are `ARTS`, `EDUCATION`, `ENGINEERING`, `ENVIRONMENTAL`, `HEALTH`, `LAW`, `MANAGEMENT`, `SCIENCE`, and `TECHNOLOGY`. This is a parser/source-boundary contamination signal; it must not be promoted as an institution association without exact-cell verification.

Exact machine locators are the 1-based `programmes[row]` positions below. The official URLs identify the source brochure to inspect; printed page/cell locators still have to be recovered for each affected row before any token is removed or retained.

| Parsed file | Affected `programmes[row]` records and contaminated tokens | Official source to verify |
|---|---|---|
| `agriculture_offerings.json` | 1 Agriculture — ENVIRONMENTAL, MANAGEMENT, SCIENCE, TECHNOLOGY; 3 Horticulture — ENVIRONMENTAL; 4 Fisheries — MANAGEMENT, TECHNOLOGY; 6 Animal Production — MANAGEMENT, TECHNOLOGY; 9 Crop Production — MANAGEMENT, TECHNOLOGY; 10 Crop Science — SCIENCE; 11 Soil Science — ENVIRONMENTAL, MANAGEMENT; 12 Family, Nutrition and Consumer Sciences — ENVIRONMENTAL; 14 Forestry and Fisheries — ENVIRONMENTAL, TECHNOLOGY; 17 Home Economics — MANAGEMENT; 18 Hotel Management & Tourism — MANAGEMENT | [JAMB Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf) |
| `arts_hum_offerings.json` | 1 Arabic Studies — ARTS; 2 Arabic Language and Literature Studies — ARTS; 3 Archaeology — ARTS; 5 Christian Religious — ARTS; 7 Creative Arts — ARTS, ENVIRONMENTAL, SCIENCE; 8 Linguistics/Edo — ARTS; 9 English and Literary Studies — ARTS; 11 Literature in English — ARTS; 12 French — ARTS; 14 German — ARTS; 16 International Studies and — ARTS; 17 History — ARTS; 18 History and Strategic Studies — ARTS; 19 Economics — ARTS; 20 African and Asian Studies — ARTS; 21 Linguistics — ARTS; 23 Russian with French/German — ARTS; 24 Mass Communication — ARTS; 25 Music — ARTS; 27 Philosophy — ARTS; 28 Religious Studies — ARTS; 29 Theology — ARTS; 30 Yoruba — ARTS; 32 Fulfulde — ARTS; 34 Communication Arts — ARTS; 35 Political Science and Conflict — ARTS; 36 Sociology — ARTS | [JAMB Arts brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf) |
| `education_offerings.json` | 1 Vocational Education — EDUCATION, TECHNOLOGY; 2 Technology Education — EDUCATION, MANAGEMENT, TECHNOLOGY; 3 Home Economics and Hotel Management — ARTS, EDUCATION, MANAGEMENT; 4 Teacher Education — EDUCATION; 6 Library and Information Science — EDUCATION, MANAGEMENT, SCIENCE; 8 Business Education — EDUCATION; 9 Sport Science — EDUCATION, MANAGEMENT, TECHNOLOGY | [JAMB Education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf) |
| `engineering_offerings.json` | 1 Building — ENGINEERING; 2 Civil Engineering — ENGINEERING, ENVIRONMENTAL, MANAGEMENT; 3 Computer and Information Science — ENGINEERING; 4 Polymer and Textile Engineering — ENGINEERING, TECHNOLOGY; 5 Water Resources and Environmental Engr — ENGINEERING; 6 Petroleum and Gas Engineering — ENGINEERING; 7 Gas Engineering — ENGINEERING; 8 Computer Science — ENGINEERING, SCIENCE; 9 Systems Engineering — ENGINEERING; 11 Food Science and Engineering — ENGINEERING; 12 Food Technology — ENGINEERING; 15 Statistics — ENVIRONMENTAL, MANAGEMENT, TECHNOLOGY; 17 Geography — ENVIRONMENTAL, SCIENCE; 18 Urban and Regional Planning — MANAGEMENT, TECHNOLOGY; 19 Industrial Design — ARTS, TECHNOLOGY; 20 Estate Management — ENGINEERING, ENVIRONMENTAL, MANAGEMENT, TECHNOLOGY; 24 Home Economics and Food Management — ENGINEERING | [JAMB Engineering/Environmental/Technology brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf) |
| `law_offerings.json` | 1 Civil Law — LAW | [JAMB Law brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf) |
| `medical_offerings.json` | 7 Medical Rehabilitation — SCIENCE, TECHNOLOGY; 8 Public Health Technology — HEALTH, MANAGEMENT, SCIENCE, TECHNOLOGY | [JAMB Medical/Pharmaceutical/Health brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-medical.pdf) |

The strongest examples are `Civil Law → LAW`, `Education` rows containing `EDUCATION`, and the repeated `ARTS`/`ENGINEERING`/`MANAGEMENT` terms. They are not being deleted here because the official PDF cell must be checked first; the finding is that the current parsed institution arrays are not safe evidence.

## Remaining omitted source-context finding

### OCC-CARRY-001 — Social/Management Sciences Film and Video Studies occurrence is absent from the offering inventory

The extracted official-source text contains a distinct Social/Management Sciences table block:

- `data/career-mapping/_jamb_txt/Social Management Science.txt:3289–3291`
- `FILM AND VIDEO STUDIES` followed by `WESTERN-DEL`
- official source: [JAMB Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf)

The current offering inventory contains only the Administration occurrence for canonical `Film and Video Studies`. This is a **confirmed inventory omission still open**, not permission to merge the two faculty contexts. The exact Social Sciences table cell, requirements, and institution boundary must be verified and then represented as a separate occurrence. The local extracted page marker around this block is printed p. 641; the prior range checkpoint cites the corresponding official table as p. 647, so the printed locator must be reconciled before promotion.

## Stale offering-verification state

The inventory currently reports **419 of 441 occurrence records as not PDF-verified**. Several existing range checkpoints already record exact JAMB source-cell evidence, but those facts are not normalized into occurrence IDs in the offering inventory. This is a state-reconciliation defect, not evidence that the cited cells are wrong. Examples requiring occurrence-level reconciliation are:

- `Industrial Mathematics and Computer Science` — JAMB Sciences brochure, printed p. 493; inventory occurrence remains `offering_row_verified_against_pdf=false`.
- `PORTUGUESE/ENGLISH — LASU` (canonical row 285) — JAMB Arts brochure, printed p. 171; inventory occurrence remains unverified.
- `Communication and Digital Media Studies — WIGWE` (row 371) — JAMB Sciences brochure, printed p. 637; inventory occurrence remains unverified.
- `Sport Science — ABUAD` (row 388) — JAMB Sciences brochure, printed p. 589; inventory occurrence remains unverified.
- `Film and Video Studies — WESTERN-DEL` — Administration evidence is recorded in the existing checkpoint, while the separate Social/Management source occurrence is missing from the inventory entirely.

No status was flipped in this checkpoint. Each example needs a stable occurrence ID, exact brochure locator, source URL, verification date, and a note distinguishing exact-cell evidence from catalogue/index evidence.

## Exact remaining work

1. Reconcile the 65 contaminated parsed records against their exact JAMB PDF cells; split institution tokens from faculty/header text and retain only institution associations supported by the cell.
2. Recover and add the missing Social/Management Sciences `Film and Video Studies` occurrence as a separate context after exact-cell verification; do not alter the Administration occurrence.
3. Build an occurrence-ID reconciliation table from the existing checkpoint citations so verified cells update the ledger consistently; do not infer verification from a programme index or a parsed token list.
4. Repeat the raw-text versus parsed-offering comparison after the above reconciliation to find any further omitted contexts; report only source-table blocks, not catalogue-name or requirements-text mentions.
5. Re-run the 420-row offering anomaly inventory and preserve an append-only delta. Only after this offering/source-context lane is closed should the CCMAS/external curriculum and later downstream work proceed.

## Agent status

No agent result is included in this checkpoint. The three attempted agent delegations returned the account usage-limit error before producing a checkpoint. The local lane therefore records only the deterministic findings above; it does not claim that the three-agent audit is complete.
