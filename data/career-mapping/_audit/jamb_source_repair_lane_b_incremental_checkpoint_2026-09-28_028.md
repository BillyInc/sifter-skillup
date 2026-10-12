# JAMB offering-source verification — Lane B checkpoint 028 (Arts identity adjudication)

Date: 2026-09-28  
Scope: adjudicate only title/context cases 2, 5, 15, 16, and 39 and revisit exact source-cell identity cases 42–43 from checkpoint 027. Audit-only: no JSON, aliases, institutions, mappings, or seed data edited. The eight source-confirmed cell discrepancies already recorded in checkpoint 027 are not repeated here.

## Sources and method

- Primary JAMB source: [IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. The official index identifies the listed programmes; the body cells and continuation boundaries were checked against the repository extraction `data/career-mapping/_jamb_txt/arts_hum.txt`. The web text endpoint remains JavaScript-gated, so the exact printed-page and extraction locators below are retained; search-index excerpts are not treated as proof of complete institution columns.
- External corroboration for the distinct Modern Languages and Translation programme: [University of Calabar, Department of Modern Languages and Translation Studies](https://www.unical.edu.ng/department_details.php?id=24), accessed 2026-09-28. This supports programme existence/name and undergraduate BA in Modern Languages & Translation, not the four institution codes currently assigned to Arts row 42.
- External corroboration for Geography and Environmental Studies: [Ignatius Ajuru University of Education, Registry](https://iaue.edu.ng/registry/) and [Department of Geography](https://iaue.edu.ng/geography-draft/), accessed 2026-09-28. These support B.Sc/B.Sc.Ed programmes with that name at IAUE; they do not prove that the separate JAMB `GEOGRAPHY` body cell's four awarders are awarders for the compound index identity.

## Title/context decisions

| Ledger row | Official evidence | Adjudication (no ledger edit) |
|---:|---|---|
| 2 | Arts index #5 is `Arabic Language and Literature`; body heading is `ARABIC LANGUAGE AND LITERATURE`, printed pp. 135–136, `arts_hum.txt:137–299`; exact body awarders are IBADAN, PAAU, UNIOSUN. | Identity is resolved to the index entry/body cell. The ledger label's trailing `Studies` is unsupported by this JAMB source, and its current institution tokens are contaminated. Preserve the source wording/locator for correction; do not interpret the extra word as a separate programme. |
| 5 | Index #8 is `Christian Religious Knowledge/Studies`; exact body heading `CHRISTIAN RELIGIOUS STUDIES`, printed pp. 139–140, `arts_hum.txt:385–530`; the complete institution cell matches this ledger's verified institution set. | Same occurrence is established by the index entry, body cell, and matching full awarder column. `Christian Religious` is a truncated local label; keep the index name as the canonical JAMB display identity and the body heading as its source title variant. |
| 15 | Index #28 is `French and German/Russian`; body heading `FRENCH WITH GERMAN/RUSSIAN: UNN`, printed p. 177, `arts_hum.txt:2261–2263`. | The index/body wording is a source-backed title variant for the UNN occurrence. The local institutions (`INTERNATIONAL`, `RELATIONS`, `BABCOCK`, `NOUN`) do not belong to this cell; the occurrence identity is resolved, but its ledger association requires correction. |
| 16 | Index #42 is `International Studies and Diplomacy`; exact body heading `INTERNATIONAL STUDIES AND DIPLOMACY`, awarders BENIN and BIU, printed pp. 197–198, `arts_hum.txt:3237–3241`. | The truncated local label resolves to the exact indexed programme. The local array is a multi-cell extraction and cannot stand for this offering; retain BENIN/BIU as the source-supported cell for correction. |
| 39 | Index #65 is `Psychology and Human Development`; exact Arts-body heading `PSYCHOLOGY`, awarders COVENANT, EVANGEL, MKAR, PLASU, printed p. 254, `arts_hum.txt:5933–5937`. | This is a real Arts-brochure Psychology cell, not the separate Creative Arts cell previously cited by stale metadata and not an inferred Social Sciences offering. The index/body title variant and the four-code list align; identity is resolved within this Arts source context. Retain that context explicitly. |

These five title/context questions are therefore adjudicated from the same JAMB brochure's index and exact body cells. Their canonical-ledger repairs remain out of scope for this audit-only increment.

## Exact source-cell cases revisited

| Ledger row | Strongest evidence found | Result |
|---:|---|---|
| 42 — Modern Language and Translation | The JAMB Arts index explicitly lists #59 `Modern Language and Translation`. The only nearby Arts body block is `B.A. (SINGLE AND COMBINED HONS) IN MODERN LANGUAGES`, with UNN French/German/Russian options (`arts_hum.txt:5701–5710`); it is not titled Modern Language and Translation and does not support the row's four-code list. UNICAL's official page confirms an undergraduate BA in Modern Languages & Translation, but that external fact does not establish a complete JAMB 2026 awarding-institution cell or validate KASU/LAGOS/UNIZIK/UNN for this identity. | Programme identity/existence is confirmed; exact JAMB body cell and complete awarder list remain unresolved. Do not attach the UNN modern-languages cell or the four local codes by name/topic similarity. Do not mark unavailable. |
| 43 — Geography and Environmental Studies | The JAMB Arts index explicitly lists #30 `Geography and Environmental Studies`. The nearby body cell is exactly `GEOGRAPHY`, with FED-KASHERE, FED-LAFIA, FED-LOKOJA, AEFUNA (printed p. 253; see checkpoint 019). IAUE's official pages confirm institution-level B.Sc/B.Sc.Ed programmes named Geography and Environmental Studies, but do not connect that identity to the local four-code JAMB cell. | Programme identity/existence is confirmed; exact JAMB body cell and complete awarder list remain unresolved. Keep the four-code standalone Geography cell separate; do not infer it is the compound identity. Do not mark unavailable. |

## Disposition and remaining work

- Five title/context decisions adjudicated: rows **2, 5, 15, 16, 39**. This confirms identity variants and source contexts, not that the current ledger values are correct; rows 2, 15, and 16 have clear institution-array defects already reported in checkpoint 027.
- Two exact awarder-cell associations remain unresolved: rows **42–43**. External evidence confirms both programme names are real, but not the complete JAMB awarder cells represented by the local arrays.
- No row was marked unavailable; no neighboring title, faculty, or awarder list was merged by inference.
- No data files were edited. Downstream/CCMAS mapping remains deferred.

## Verification

The unique regression test `test_jamb_source_repair_lane_b_arts_028.py` checks the seven-row scope, the evidence-based dispositions, both official and external source locators, and the audit-only boundary. It does not assert that the unresolved awarder lists are correct.
