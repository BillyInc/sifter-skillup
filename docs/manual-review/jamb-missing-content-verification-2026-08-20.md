# JAMB missing-content verification - 2026-08-20

This document records what was checked against the local JAMB brochure PDFs and how the notes added to `jamb-missing-content-2026-08-19.md` were interpreted. It is a source-review record, not a claim that every ambiguous brochure phrase is an eligibility rule.

## Source boundary

The source path is:

`original brochure PDFs -> local pdfplumber table extraction -> source audit -> inherited/multiple-source rule report -> generated SQL -> database`

The PDFs are not queried through Supabase. Supabase receives the processed rows after this local source work.

The audit currently covers:

- 420 JAMB programme names.
- 1,260 requirement layers: UTME, O-level, and Direct Entry for each name.
- 1,363 extracted requirement-table rows across the supplied brochure PDFs.
- Catalogue/index pages are excluded from requirement extraction.
- 2,706 source variants are preserved in the generated source table.

## Source-rule contract

1. A populated requirement cell is retained as an exact source variant.
2. A blank cell inherits only from the preceding populated requirement block in the same PDF table stream.
3. The inherited source location and the originating populated row are both retained.
4. Special-consideration/waiver prose remains university-scoped. It is not copied into a national requirement.
5. If the same JAMB name appears in multiple brochure PDFs or faculty blocks, every source variant is preserved.
6. Conflicting source variants are not silently merged into one national rule.
7. A source-row identity hit is different from a requirement being complete. A row can be found but still have a blank primary cell.

Current source-variant counts:

- `exact`: 988
- `inherited_shared`: 1,704
- `source_blank`: 14
- layers resolved from one safe source text: 680
- layers with multiple source texts preserved: 445
- layers with no source candidate after table extraction: 135, across 45 JAMB names

## Verification of the notes added to the missing-content file

| Item | Result | Evidence/interpretation |
|---|---|---|
| N001 Anthropology - O-level | Verified as multiple source variants | `Arts _ Humanities.pdf` p118/r4 is the Arts/Humanities candidate; `Sciences.pdf` p228/r6 is the biological candidate. Both are preserved. An empty waiver cell is not invented into a requirement. |
| N002 Archaeology - O-level | Verified | The Arts/Humanities Archaeology row is retained as the direct source. An empty waiver does not require a fabricated value. |
| N003 Accountancy and Forensic Studies - O-level | Verified as inherited/shared | The blank row is on `Administration.pdf` p6/r3. The inherited national block resolves to the Accounting requirement at p2/r3. Its special considerations remain separate. |
| N004 Accounting and Data Analytics - O-level | Verified as inherited/shared | Same Administration block as N003: p6/r3 inherits the Accounting block at p2/r3. |
| N005 Accounting and Finance - O-level | Verified as multiple sources | `Administration.pdf` p5/r3 and `Social Management Science.pdf` p3/r3 are retained as separate source variants. They are not treated as one silently merged PDF record. |
| N006 African and Asian Studies - UTME | Verified | `Arts _ Humanities.pdf` p77/r4 provides the Igbo and Arts/Social Sciences rule. |
| N007 Agricultural Engineering - O-level | Verified | `Engineering _ Enviromental _ Technology.pdf` p3/r3 is the populated Agricultural Engineering block. |
| N008 Agricultural and Bio-Resources Engineering - O-level | Verified as inherited/shared | The programme appears on `Engineering _ Enviromental _ Technology.pdf` p4/r3 and inherits the populated Agricultural Engineering block at p3/r3. The following engineering rows are not treated as independent blank national rules until a populated block changes. |
| N009 Animal Breeding and Genetics - UTME | Verified as inherited/shared | `Agriculture.pdf` p40/r3 identifies Animal Breeding and Genetics; its requirement inherits from Animal Science at p38/r4. |
| N010 Applied and Renewable Energy - O-level | Verified | `Sciences.pdf` p45/r4 contains the programme row. Its UTME/O-level values are direct there; its Direct Entry value is an inherited continuation from that block. |
| N011 Arabic Language and Literature Studies - O-level | Not yet source-resolved | The current source audit has no matching requirement-table identity. An index hit alone is not accepted as requirement evidence. |
| N012 Archaeology - UTME | Verified | `Arts _ Humanities.pdf` p8/r5 is retained as the direct source. |
| N013 Architecture - O-level | Verified as a continued block | The Architecture block begins at `Engineering _ Enviromental _ Technology.pdf` p79/r4. Continuation/source variants at p82/r3 and p83/r3 are retained; the canonical text is used only where the safe source resolution agrees. |

The user-added notes for N001, N003-N010, N012, and N013 therefore match the source evidence and the implemented inheritance contract. N011 remains open because the available index text does not prove the requirement cells.

## Current canonical corrections

- `Criminology` no longer carries the Salem-specific sentence as its national UTME requirement. The national row inherits the shared Social Management Sciences block from p41/r1; Salem is represented as a university offering and a university-scoped UTME exception sourced to p48.
- `Criminology and Penology` inherits the shared block from p40/r1, where the programme is printed in the combined continuation row.
- `Criminology and Security Studies` preserves the Social Management Sciences, Arts/Humanities, and Law variants separately.
- `Criminology and Security Studies (printed under Law faculty block)` is treated as an explicit display alias of the same programme; its three source variants are preserved rather than treated as a new programme.
- `Agricultural and Bio-Resources Engineering` now resolves to the Agricultural Engineering block rather than remaining unmatched because the brochure prints the name without the repository hyphen.
- Enrichment files no longer overwrite a clean primary requirement solely because their filenames sort later. Three conflicting enrichment fields remain held for source review.
- Catalogue/index rows are excluded from inheritance, preventing programme-name lists from contaminating requirement text.

## Remaining source-review boundary

The following 45 JAMB names account for the 135 layers with no exact source-row candidate after catalogue pages and waiver-only prose were excluded:

- Applied Microbiology and Brewing / Applied Microbiology
- Arabic Language and Literature Studies
- BIOLOGICAL SCIENCE(S)
- Biology/Biotechnology
- Computer and Information Science
- Dentistry and Dental Technology
- Drama/Dramatic Arts/Performing Arts
- ENGINEERING PHYSICS
- Eco-Tourism and Wildlife Management
- Economics with/and Operation Research
- Electrical/Electronic Engineering
- Employment and Human Resource Management
- Environmental Management and Technology
- Environmental Science and Technology
- Farm Management & Agric. Extension
- Fine Art/Fine and Applied Arts
- Forestry and Fisheries
- French and German/Russian
- Geography and Environmental Studies
- Home Economics and Hotel Management
- Home Science & Management
- Hotel Management & Tourism
- ICT Engineering
- INFORMATION AND MEDIA TECHNOLOGY
- Industral Mathematics/Computer
- Industrial Relations / Industrial and Labour Relations
- Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management
- Islamic Law/Sharia Law
- Marine Science and Technology
- Mathematics and Economics / Mathematics with Economics
- Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics
- Medical Laboratory Technology/Science
- Medicine and Surgery (Human Medicine)
- Modern Language and Translation
- Office and Information Technology / Information Resource Management
- Pasture & Range Management
- Physical Sciences (with options in i. Industrial Physics, ii. Physics with Electronics)
- Physics with Computational Modeling
- Plant Breeding and Seed Technology
- Political Science / International Law and Diplomacy
- Political Science and Conflict
- Public and International Law
- Robotics (Artificial Intelligence)
- Sport Management (Education)
- Water Resources and Environmental Engr

These are not all claims that the brochure has no data. Some are printed-name variants, index-only hits, or programme headings whose requirement cells are located in a different continuation structure. They require an explicit source alias/page-row decision before their values can be called source-resolved.

## 375 quarantined programme-domain links

Every quarantined link was re-audited row by row against the current CCMAS curriculum, domain definition, original mapping source, exclusion reason, and source-state flags.

- Links checked: **375**
- Restore candidates: **0**
- Retained in quarantine: **375**
- 362 links have zero source-backed CCMAS course anchors.
- 13 links have one incidental/ambiguous anchor.

The restoration rule requires at least two source-backed CCMAS course anchors and no unresolved source blocker. Therefore no quarantined link is active guidance. The complete per-row evidence is in [programme-domain-unverified-link-audit-2026-08-19.md](programme-domain-unverified-link-audit-2026-08-19.md).

## Generated-data verification

The regenerated seed contains:

- 420 JAMB programmes and 420 requirement rows.
- 9,130 university programme offerings.
- 3,884 university exception records.
- 2,031 structured university subject-option records.
- 12,213 structured university subject items.
- 2,706 source-variant rows in `jamb_programme_requirement_sources`.
- 420/420 programme mappings linked.

The structural subject/programme/university audit found zero errors. Its warnings remain source-review warnings: 67 declared-minimum comparisons and 11 options whose parsed status needs review. They must not be presented as universal eligibility proof until the underlying source wording is approved.

The exhaustive subject-selection matrix found zero matcher mismatches and zero offering errors. Its UTME/O-level boundary cases, combined intersection, and six-subject closure checks completed successfully.

## Authoritative artifacts

- [Source-rule JSON](../../data/career-mapping/_audit/jamb_brochure_source_rules_2026-08-19.json)
- [Source-rule report](jamb-brochure-source-rules-2026-08-19.md)
- [Original missing-content notes](jamb-missing-content-2026-08-19.md)
- [Complete requirement classification](complete-subject-requirement-classification-2026-08-18.md)
- [Subject/programme/university audit](subject-programme-university-audit-2026-08-20.md)
- [Quarantined-link audit](programme-domain-unverified-link-audit-2026-08-19.md)
- [Generated career seed](../../backend/seed_career_pilot.sql)
