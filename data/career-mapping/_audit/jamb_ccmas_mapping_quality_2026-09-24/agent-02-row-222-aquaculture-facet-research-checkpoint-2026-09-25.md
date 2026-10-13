# Row 222 — Zoology and Aquaculture: Aquaculture-facet research checkpoint

Recorded 2026-09-25 (Africa/Lagos). Research/checkpoint-only lane. **No shared JAMB mapping, scope, canonical, derived/active JSON, seed, or role data was edited.** This is a new distinct checkpoint; the earlier rows 221–230 coordinator checkpoint remains unchanged.

## Confirmed evidence

### JAMB identity and offering context

- Canonical identity row 222 is **Zoology and Aquaculture**, Sciences, `B_granular`.
- The local parsed JAMB source occurrence is one Sciences row, ordinal 161 in `jamb/sciences_offerings.json`, with institution token `CALEB`. The separate occurrence inventory had not marked it PDF-verified.
- The official JAMB-hosted [Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf) search extraction shows the table entry **ZOOLOGY AND AQUACULTURE — CALEB**. This confirms the programme/institution pairing from the official JAMB source. A rendered-page locator and captured page image are still missing from the local inventory; add those before treating the evidence ledger itself as fully closed.

### CCMAS component and course/outcome support

The NUC [Agriculture CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf) contains a distinct **Fisheries and Aquaculture (FAA)** programme. This is separate from the existing primary **Sciences::Zoology (ZOO)** component. The official CCMAS course table lists FAA courses at printed p.251; their titles and outcomes directly support a bounded Aquaculture facet:

| Proposed course | Why it belongs in a bounded named-facet slice |
|---|---|
| `FAA 301` Fisheries Biology | Fish biology, fisheries-resource management and biological measures; a foundation bridging the Zoology and Aquaculture facets. |
| `FAA 302` Fish Nutrition | Outcomes cover fish nutrition, aquaculture feed sensitivity, fish diet/health/growth and feed-use efficiency (printed pp.265–266). |
| `FAA 306` Fisheries Ecology | Outcomes address aquatic ecosystems, species distribution/abundance and fisheries ecology (printed pp.267–268). |
| `FAA 307` Principles of Aquaculture | Direct course-title and outcome match: aquaculture practices/operations, feeding and water evaluation, species selection/stocking, farm design and harvesting (printed pp.268–269). |
| `FAA 403` Pond Construction and Management; Fish Gear Design… | Outcomes/content cover pond survey, construction, maintenance and water-holding structures for fish/shellfish (printed pp.269–270). |
| `FAA 404` Fish Fry/Fingerling Production; Hatchery Management… | Outcomes directly cover hatchery practices, fingerling production, stocking, feeding and fish growth (printed pp.270–271). |
| `FAA 407` Aquatic Environment Survey; Climate Change in Fisheries and Aquaculture | Outcomes include aquatic-environment description, fishing-ground challenges, fish/shellfish stock, sustainable aquatic-resource management and climate effects (printed pp.272–273). |

The checked-in source `ccmas/agricultural_science.json` contains parsed outcome text for all seven proposed courses. The selected set is **7 of 41 FAA courses**, not a union of the full Fisheries and Aquaculture curriculum. It intentionally excludes courses such as fisheries marketing, ICT/value chains, stock assessment and processing until their relevance to this named degree and any downstream task is separately established. The current six-course Zoology scope remains as the Zoology facet; the proposed combined scope would have 13 unique selected courses.

The NUC CCMAS evidence is sufficient to confirm that the existing ZOO-only course scope misses the named Aquaculture facet. It supports including a bounded FAA course slice as curriculum evidence; it does **not** prove Caleb University uses every national minimum course unchanged, because the CCMAS allows institution-level curriculum variation.

## Unresolved evidence and guardrails

- A rendered JAMB PDF page/row locator and archived screenshot are absent from the local occurrence record, even though the official JAMB source extraction confirms the CALEB row.
- Caleb-specific course selection/sequence and any institution-specific curriculum variation have not been verified. The NUC CCMAS is national minimum-standard evidence, not the university’s delivered timetable.
- The current row has three active inherited links: `D142` Bioinformatics/Computational Biology, `D027` Biomedical, and `D047` Agricultural Science. The six ZOO courses alone do not establish those broad paths. Keep them unconfirmed; do not surface them as student routes based on the proposed scope alone.
- The taxonomy’s `D120` domain is named **Fisheries, Aquaculture**, but its metadata says `institution_type: [polytechnic, technical_college]` and describes a trade-heavy role population. Course outcomes make it a plausible domain candidate, but this metadata mismatch must be reviewed before connecting a university degree offering to that domain or its descendants. Do not activate D120 on name similarity alone.
- No role-level conclusions were made; role records and names remain explicitly out of scope.

## Proposed row-only change set (not applied)

1. Keep `Sciences::Zoology (ZOO)` as the primary CCMAS component; add `Agricultural Science::Fisheries and Aquaculture (FAA)` as a supporting component for the JAMB-named Aquaculture facet.
2. Retain the six selected ZOO courses and add only the seven FAA courses above. Mark the combined partial scope `review_required`, not fully reviewed, pending institution-specific scope confirmation and downstream review.
3. In the canonical bridge, represent the FAA course codes and component as supporting evidence. Preserve the old three domain links as audit candidates, not active links.
4. In derived and active maps, set active links to zero and status to `review_required` until each candidate is reassessed against the combined course outcomes and the intended student domain/subgroup. Do not promote D120 without resolving its institution-type/taxonomy mismatch.
5. Keep mapping, scope, canonical, derived and active artifacts in parity if/when this proposed row-only correction is authorized in a later edit lane. No global file writer or seed generation is proposed.

## Read-only integrity observation

At checkpoint time, all five shared JSON artifacts parsed successfully: `programme_mapping.json`, `jamb_curriculum_scopes_2026-08-17.json`, `jamb_ccmas_inheritance_canonical_2026-08-17.json`, `jamb_domain_map_ccmas_derived_2026-08-17.json`, and `jamb_domain_map.json`. This checkpoint did not write to them.

## Source locators

- JAMB: [official IBASS Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), extracted table entry “ZOOLOGY AND AQUACULTURE — CALEB”; local rendered page locator still to be captured.
- NUC: [Agriculture CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf), course table at printed p.251; FAA 302 pp.265–266; FAA 306 pp.267–268; FAA 307 pp.268–269; FAA 403 pp.269–270; FAA 404 pp.270–271; FAA 407 pp.272–273.
- Local source records: `data/career-mapping/ccmas/agricultural_science.json`, `data/career-mapping/ccmas/sciences.json`, `data/career-mapping/jamb/sciences_offerings.json`, and `_audit/jamb_offering_context_inventory_2026-09-25.json`.
