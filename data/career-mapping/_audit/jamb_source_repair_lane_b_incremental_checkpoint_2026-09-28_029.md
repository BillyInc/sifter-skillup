# JAMB offering-source verification — Lane B checkpoint 029 (Arts unresolved-cell search and index gap)

Date: 2026-09-28  
Scope: continue from checkpoint 028. Recheck Arts ledger rows 42–43 for a complete exact JAMB body awarder cell, then identify the next Arts index occurrence not represented by an exact-name record in the parsed offering ledgers. Audit-only: no offering JSON, mappings, aliases, institutions, CCMAS records, or seeds edited.

## Rows 42–43: exact-cell search result

Primary source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. The official index is searchable, but opening the IBASS PDF through the web text interface returns only “You need to enable JavaScript to run this app.” The repository extraction `data/career-mapping/_jamb_txt/arts_hum.txt` was searched across its full contents; exact printed-page/body locations were checked against checkpoints 019 and 028. Targeted official-domain queries used the complete indexed titles and awarder-cell terms. These searches returned the official index listing, not a complete official body awarder column for either held identity. Search snippets are not treated as proof of an awarder set.

| Arts ledger row | Evidence searched and found | What remains missing |
|---:|---|---|
| 42 — Modern Language and Translation | The official index lists the exact programme at #59 (printed p. 130). In the body extraction, the nearby later block is `B.A. (SINGLE AND COMBINED HONS) IN MODERN LANGUAGES`, UNN, with French/German/Russian options (`arts_hum.txt:5701–5710`, printed p. 248); it is a different title/structure. The following body title is `CHINESE STUDIES` (`arts_hum.txt:5714` onward), not Modern Language and Translation. Targeted official JAMB searches for the exact title plus awarding-institution wording surfaced the index but no complete title-specific body cell. UNICAL’s official Modern Languages and Translation page cited in checkpoint 028 verifies that a similarly named degree exists, not the complete JAMB 2026 awarder cell or the local four institution codes. | No body cell with the exact indexed title and complete awarder list was located in the official brochure/extraction or official-domain search results. The institution array must remain unverified; the UNN Modern Languages options and external programme existence do not establish it. |
| 43 — Geography and Environmental Studies | The official index lists the exact programme at #30 (printed p. 130). Full extraction search finds the body title `GEOGRAPHY` and its four-code cell—FED-KASHERE, FED-LAFIA, FED-LOKOJA, AEFUNA—at `arts_hum.txt:5759–5764` (printed p. 253). It does not find a body heading `GEOGRAPHY AND ENVIRONMENTAL STUDIES`. Targeted official JAMB searches for the exact compound title plus awarding-institution wording surfaced the index, not a complete compound-title body cell. IAUE sources cited in checkpoint 028 establish a similarly named institutional degree but do not connect it to this JAMB occurrence. | No exact compound-title body cell or complete awarder list was located. The standalone Geography four-code cell cannot be reassigned to the indexed compound identity without an explicit source cross-reference. Keep the local association held; do not call it unavailable. |

Thus **0/2** held rows gained a complete exact awarder cell in this increment. This is a documented search outcome, not a claim that no such JAMB evidence exists elsewhere or that either programme is unavailable.

## Next Arts occurrence found: Arts (Combined)

The official index lists `Arts (Combined)` as entry #7 (printed p. 130). The Arts body contains a separate `ARTS (COMBINED HONOURS)` table with the awarder `UNN` at `arts_hum.txt:56–61` (printed p. 132). An exact-name cross-check of the nine checked-in `*_offerings.json` files (443 parsed offering rows) found no `Arts (Combined)` identity. This is a source-confirmed Arts occurrence absent under that exact display name from the parsed offering ledgers; it is a **candidate inventory/canonical-identity omission**, not yet a confirmed defect in the 420 canonical identities. It must next be reconciled against the authoritative 420-identity registry and any approved title aliases before adding or changing data. Do not infer combined subject components from the title or from UNN’s institution entry.

## Broader Arts-index coverage queue

The official Arts index contains **76** entries; `arts_hum_offerings.json` contains **43** rows. A literal normalized-name scan across all nine parsed offering files found **36 index titles without an exact-name counterpart**. Some are likely title variants or aliases (for example, index/body wording differences already adjudicated in checkpoints 027–028); this count is a candidate queue, **not 36 confirmed missing programmes**. The next source-context pass must resolve each against the 420 canonical identities and existing aliases before deciding whether it is an omission, a variant, or outside the canonical scope.

Candidate exact-name gaps, in index order:

1. Arabic Language and Literature
2. Arabic and IS
3. Arts (Combined) — source occurrence documented above
4. Christian Religious Knowledge/Studies
5. Communication and Language Arts
6. Comparative Religious Studies
7. Counselling and Psychology
8. Drama/Dramatic Arts/Performing Arts/Theatres Arts
9. English Language
10. English Language and Literature
11. English and International Studies
12. Foreign Language and Literature
13. French and International Relations
14. History and Archaeology
15. History/International Studies
16. History and Diplomacy
17. History and Diplomatic Studies
18. History and Political Studies
19. Igbo/Linguistics
20. IS
21. Kiswahili
22. Languages
23. Languages Arts
24. Languages Arts and Yoruba
25. Language and Linguistics
26. Language and Literature
27. Linguistics/Yoruba
28. Linguistics/Urhobo
29. Modern European Languages
30. Philosophy and Religious Studies
31. Psychology and Human Development
32. Portuguese
33. Religion and Philosophy
34. Religion and Science
35. Religious Studies/Theology
36. Yoruba and Communication

This exact-name screen is deliberately conservative: it does not normalize away substantive words or combine different brochure titles. Existing parsed offerings for Economics, Mass Communication, Anthropology, Sociology, and Psychology were also observed in other faculty ledgers; those occurrences remain separate contexts and are not treated as Arts-cell proof.

## Disposition and next action

- Rows 42–43 remain held for lack of exact complete JAMB awarder cells after the official index/body extraction and targeted official-domain search; neither is marked unavailable.
- Arts (Combined) is the next concrete Arts index/body occurrence to reconcile to the canonical 420 set; its body awarder is UNN, but no exact-name offering record exists in the nine parsed files.
- The remaining 35 literal-name gaps are a deduplicated review queue only. Resolve aliases and canonical identity membership before treating any as defects.
- No offering or mapping data changed. CCMAS and downstream mapping remain deferred.

## Verification

The focused regression test is `test_jamb_source_repair_lane_b_arts_029.py`. It checks the unresolved 42–43 search disposition, the Arts (Combined) source occurrence/candidate status, the 76/43/36 inventory counts, and that rows 42–43 remain unchanged in the ledger.
