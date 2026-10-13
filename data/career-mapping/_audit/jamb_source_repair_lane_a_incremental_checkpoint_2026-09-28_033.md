# Repair lane A — JAMB Agriculture/Engineering held-cell audit checkpoint 033

**Date/access date:** 2026-09-28 (Africa/Lagos)  
**Mode:** source audit and documentation only; no offering/source data edits  
**Resume point:** checkpoints 031–032  
**Scope:** the 23 current Agriculture/Engineering `evidence_hold` offering contexts only. The two Administration identity holds are excluded. No already established exact source cell was searched again.

## Current ledger reconciliation

The current ledgers contain exactly 23 in-scope held contexts: 8 Agriculture and
15 Engineering. The unchanged title list is checked by the companion regression
test. The 23-vs-24 discrepancy in earlier checkpoint prose was reconciled in
032 as a reporting/counting error; no offering row disappeared or changed state.

The earlier exact-cell evidence was reused without repeating those searches:
Crop Production (7 institutions) and Food Engineering (3) have complete visible
official cells, but their current local arrays contain extra adjacent-title
fragments. They remain correction holds. Earlier evidence also established a
Plant Science title/context mismatch, but not a standalone Plant Science awarder
cell, and confirmed the Computer and Information Science index title without
retrieving its complete awarder cell.

## New official-source evidence in this increment

Direct opening of both official brochure URLs still returns only the IBASS
JavaScript shell in the available reader. Exact-title searches restricted to
the official PDFs produced these additional usable results:

| Identity | Official printed locator | Source evidence | Local comparison and disposition |
|---|---|---|---|
| Fisheries | Agriculture brochure, detailed table printed p. 86 | Under the exact `FISHERIES` heading, the indexed cell lists BENIN, CALABAR, CRUTECH, DELSU, EKSU, IBADAN, KSUSTA, KWASU, LAPAI, LASU, MAIDUGURI, MAUTY, NDU, NASARAWA, OOU, OAUSTECH, PHC, and UDU; the preceding `FISHERIES MANAGEMENT — RSU` is separately headed. The next visible text begins `WATER RESOURCES`, establishing the boundary after UDU. | The local 30-entry list includes title fragments such as `MANAGEMENT`, `TECHNOLOGY`, `AGRIC. COOPERATIVE`, and `FISHERIES AND ...`; it does not equal the 18-name cell. Keep held for correction. |
| Systems Engineering | Engineering brochure, detailed table printed p. 395 | Exact heading followed by the complete visible awarder cell `AUN; HUSTECH; LAGOS`; the next heading is `MECHANICAL/PRODUCTION ENGINEERING`. | Local list has 65 entries and includes unrelated title fragments such as `DELSUT` and `MECHATRONI...`. It does not equal the three-name cell. Keep held for correction. |
| Building | Engineering brochure, detailed table printed p. 345 | The source clearly separates `BUILDING TECHNOLOGY` from `BUILDING`; the latter begins `AAU; ABUJA; ABU; BAZE; CALEB`, but the excerpt ends before the complete cell. | Local list has 80 entries. Prefix is useful mismatch evidence, not a complete roster. Keep held. |
| Quantity Surveying | Engineering brochure, detailed table printed p. 412 | Exact heading and a visible prefix through `ESUTECH`; excerpt ends before the complete institution roster and continuation boundary. | Local list has 73 entries. Partial source is insufficient to reconcile. Keep held. |

The Fisheries source excerpt's 18-item sequence is internally bounded by the
separate preceding `FISHERIES MANAGEMENT` row and subsequent `WATER RESOURCES`
text. It establishes an exact current brochure cell but not whether older or
other JAMB publications list additional offerings; this checkpoint audits the
specified current official source only.

## Exact-title search coverage and remaining dispositions

Every one of the 23 held names was included in an exact-title query against its
official faculty PDF during checkpoints 031–032 or this increment. A search
result was counted as a full cell only when it exposed a bounded complete
awarder sequence; a title index, truncated excerpt, adjacent-row fragment, or
reader shell did not qualify.

| Faculty | Held identities | Audit disposition after 033 |
|---|---|---|
| Agriculture (8) | Agriculture; Biotechnology; Fisheries; Crop Production; Forestry and Fisheries; Plant Breeding and Seed Technology; Plant Science; Farm Management & Agric. Extension | Two exact cells established previously (Crop Production, 7, mismatching local data; Fisheries, 18, mismatching local data). Agriculture remains partial. Plant Science has a confirmed title/context mismatch but no standalone exact cell. The other five names remain without a complete exact cell in the retrieved evidence. |
| Engineering (15) | Building; Civil Engineering; Computer and Information Science; Polymer and Textile Engineering; Computer Science; Systems Engineering; Food Engineering; Architecture; Quantity Surveying; Statistics; Economics; Geography; Urban and Regional Planning; Industrial Design; Estate Management | Two exact cells established (Systems Engineering, 3, mismatching local data; Food Engineering, 3, mismatching local data). Building and Quantity Surveying remain partial. Computer and Information Science is confirmed in the index but its roster is not. The other ten remain without a complete exact cell in the retrieved evidence. |

Accordingly, **4 of 23 held contexts have complete exact awarder-cell evidence**
(Crop Production, Fisheries, Food Engineering, Systems Engineering). This is
not a count of corrected rows: all four remain held because their current local
arrays do not match the source. The current increment adds **2** fully sourced
cells and establishes **0** newly corrected offering rows. The other **19** do
not yet have a complete exact source cell, including the four partial/title-only
cases noted above. No identity is marked unavailable.

## Search and evidence limitations

- Queried every listed Agriculture title against
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf`;
  queried every listed Engineering title against
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf`.
- Search queries used exact programme titles and, where useful, institution
  anchors from the current held row to locate the correct table entry and
  distinguish adjacent titles.
- `Crop Production` was inadvertently included in one batched exact-title
  query although its complete cell was already established in 031. That result
  exposed only the programme index; the prior cell evidence was reused without
  re-auditing or counting it as new.
- The available reader did not render the PDF itself. Search-indexed excerpts
  were used only for bounded full cells or to document partial evidence; no
  mirror or inferred continuation was used.
- Several current local arrays contain non-institution strings or title
  fragments, but incomplete snippets cannot establish the full intended roster.
  Do not silently clean, replace, or promote those rows in this audit-only
  increment.

No offering JSON, mappings, curriculum, or seed was changed. The two official
brochure sources were accessed on 2026-09-28. Continue by obtaining complete
official rendered table continuations for the 19 contexts without a complete
cell, while preserving the four complete-source mismatch holds for a later
correction pass.
