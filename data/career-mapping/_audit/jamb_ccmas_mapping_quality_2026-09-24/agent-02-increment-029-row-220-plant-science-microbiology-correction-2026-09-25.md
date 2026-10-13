# Partition 02 — increment 029: row 220 named-facet scope correction

Recorded 2026-09-25 (Africa/Lagos). Append-only checkpoint continuing increment 028. This is a row-specific curriculum-scope repair only; no roles, global seed, SQL, or whole-file regeneration was performed.

## Exact JAMB occurrence and source limits

- Canonical row 220 is **Plant Science and Microbiology**, faculty Sciences, `B_granular`.
- The local source occurrence inventory identifies exactly one parsed Sciences occurrence: `Sciences.pdf`, parsed row ordinal 155, source name `Plant Science and Microbiology`, institution token `WESTERN-DEL`. The local JAMB excerpt is in `jamb/sciences_offerings.json` and describes the programme as a subheading sharing the Botany requirement block.
- A publicly indexed brochure copy also places **PLANT SCIENCE AND MICROBIOLOGY — WESTERN-DEL** in the Sciences degree-awarding-institution table ([brochure extract](https://jamb-gov.org/wp-content/uploads/2025/01/sciences.pdf)). The official JAMB-hosted [Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf) is the primary locator, but the current browser extraction exposed only the IBASS JavaScript shell. Therefore the awarder cell has **not** been independently verified against the JAMB-hosted PDF itself; row 220 remains held rather than promoted.

## CCMAS comparison and bounded correction

The NUC Sciences CCMAS contains separate B.Sc. Botany and B.Sc. Microbiology components in its official [2023 Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf). The Botany section defines plant-science learning and includes distinct plant courses; the course structure includes Botany foundations, plant taxonomy, anatomy, physiology, ecology, breeding and conservation (printed pp. 132–135; PDF pp. 131–134). Botany course outcomes include plant identification/taxonomic keys, plant tissue and habitat adaptations, photosynthesis and plant water relations, plant communities, and breeding/conservation capabilities. The Microbiology section separately covers microbial concepts/techniques, food and environmental microbiology, microbial ecology/genetics, pathogenic and industrial microbiology (printed pp. 536–540; PDF pp. 535–539).

This proves that the prior MCB-only mapping omitted a named Plant Science facet. It does **not** justify unioning every course in the complete Botany curriculum. The row now keeps Microbiology as primary and adds Botany as a supporting named-facet component, with a bounded 10-course Botany slice: `BOT 102`, `BOT 202`, `BOT 203`, `BOT 301`, `BOT 302`, `BOT 303`, `BOT 304`, `BOT 306`, `BOT 312`, and `BOT 409`. These have parsed outcome text in the checked-in NUC-derived `ccmas/sciences.json`. The pre-existing Microbiology scope is retained; the combined scope has 24 unique course codes total.

## Changes and safety disposition

Updated row 220 consistently in:

1. `programme_mapping.json` — retains MCB primary and explicitly records Botany as a supporting component for the named Plant Science facet.
2. `jamb_curriculum_scopes_2026-08-17.json` — records both CCMAS references, the bounded courses, and `review_required` scope approval.
3. `jamb_ccmas_inheritance_canonical_2026-08-17.json` — adds Botany as supporting, records matching course codes, and sets `mapping_status: review_required`.
4. `jamb_domain_map_ccmas_derived_2026-08-17.json` and `jamb_domain_map.json` — both now have zero active links and `review_required` status.

The six former Microbiology-only links are retained in canonical/scope/map candidate fields as **audit-only**, not active student paths. No link is confirmed by this scope correction. The before-state of row 220 across all five artifacts is saved in [`row_220_plant_science_microbiology_before_2026-09-25.json`](../row_220_plant_science_microbiology_before_2026-09-25.json); the guarded row-only script is [`reconcile_row_220_plant_science_microbiology_2026_09_25.py`](../reconcile_row_220_plant_science_microbiology_2026_09_25.py).

## Invariants and tests

- Row 220 component references match across mapping, scope, canonical, derived, and active artifacts: `Sciences::Microbiology` + `Sciences::Botany`.
- All five artifacts reflect review-required/held status; active domain links are zero; the six prior links are audit candidates only.
- The 24 selected course codes are unique and agree across the curriculum scope and both maps.
- The 10 added Botany courses resolve to the Botany component and have parsed outcome text.
- Relevant regression tests: `python -m pytest -q data/career-mapping/_audit/test_jamb_ccmas_materializer.py data/career-mapping/_audit/test_jamb_manual_scope_review_holds.py` — **5 passed**.

## Still open / continuation

The official JAMB-hosted awarder-row confirmation, possible university-specific 30% course variation, exact downstream domain/subgroup/role relationships, and final item-level source review remain open. This does not close row 220 or rows 141–280. The existing coordinator checkpoint for rows 221–230 has been inspected; it records the same one-occurrence/awarders-unverified boundary and flags row 222's missing aquaculture facet. Continue canonical rows 221 onward using occurrence-specific evidence and avoid importing full components solely because of a compound programme name. Role names and records remain out of scope.
