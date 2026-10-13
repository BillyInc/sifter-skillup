# Guided Experience Data Inventory

Date: 2026-10-08  
Scope: Local source and generated guidance inventory. No SQL is applied and no canonical taxonomy data is changed.

## Current source footprint

- CCMAS source files: **17**
- Programme packages: **237**
- Course rows: **9823**
- Course outcome entries: **10212**
- Canonical domains: **168**; areas of specialization: **557**; deduplicated roles: **3969**.
- Current domain item audit covers **160** domains.

## Current contextual-guidance generator output

- Rebuilt item rows: **89135** across {"domain": 136, "subgroup": 3678, "role": 85321}.
- Rebuilt types: {"skill": 59614, "tool": 29521}.
- Rebuilt relationships: **89135** across {"not_established:not_established": 89135}.
- Link states: {"no_link": 85178, "linked": 3955, "review_required": 2}.
- Claim-review states: {"review_required": 89135}; approved: **0**.
- Items with a linked URL and access date: **3955**; items meeting both the approved-claim and link gate: **0**.
- Owner matches context on **89135 / 89135** rows.
- Non-empty explanation/provenance fields: {"plain_meaning": 89135, "contextual_use": 89135, "expected_output": 89135, "priority_reason": 89135, "source_references": 89135, "source_locators": 89135}.
- Rows using the generator’s generic meaning templates: **88999**.
- Most common expected-output strings:
  - 55800: A role-related analysis, decision, report, dataset, presentation or other work product.
  - 29521: A tool-supported analysis, record, model, visualisation, query or report.
  - 3678: An area-specific analysis, method, dataset, report or other work product.
  - 6: A small, field-relevant work sample showing how you apply computer programming.
  - 6: A small, field-relevant work sample showing how you apply statistics.
  - 6: A small, field-relevant work sample showing how you apply mathematical modelling.
  - 6: A small, field-relevant work sample showing how you apply quantitative analysis.
  - 4: A small, field-relevant work sample showing how you apply digital data processing.

## Stored snapshot comparison

The stored manifest says it was verified **2026-09-12** and records **121377** items / **408163** relationships across 160 domains, 472 areas and 5036 roles.
The compressed snapshot contains **121377** items / **408163** relationships with item types {"skill": 80926, "competency": 480, "certification": 220, "tool": 39751}.
The manifest/snapshot and current-source rebuild are different artifacts. Treat their count difference as a regeneration/parity issue; do not call either count a live database count.

## Contract gaps and quality findings

- Context-item types allowed by the prepared additive contract: skill, competency, tool, certification, method, knowledge, resource.
- The prepared additive migration introduces a separate claim-review state/evidence object and link metadata. Existing records remain review-required; source_backed ownership or a populated URL does not auto-approve student display.
- The current-source rebuild emits only the types shown above. It emits no programme-owned context items in this builder; programme curriculum contract data is a separate source and must be joined by explicit curriculum-to-item evidence.
- The current builder has not populated the new claim evidence, link-type, learner-level, language, access or duration fields. These need checkpoint-level curation before any rows can pass the student gate.
- The earlier builder derived subgroup and role skill `prerequisites`/`related_items` from neighboring positions in ordered skill lists and tool prerequisites from the first role skills. The current local rebuild now clears those inferred arrays and emits only `not_established` relationship-coverage rows; it does not yet ingest an explicit relationship evidence ledger.
- A populated `plain_meaning`, `contextual_use` or `expected_output` field is not by itself proof of learner-friendly explanation. The pilot must replace generic text with concrete, route-specific explanations and examples.
- A link marked linked is not sufficient by itself: its destination must be relevant, externally verified, correctly labelled as learning/reference, and attached to an item with approved checkpoint claims. The UI now fails closed for items lacking either gate.

## Implementation consequence

The expanded typed item/link contract and fail-closed student gate are now prepared locally. Reconcile the stored snapshot with a deterministic current-source build, curate a pilot's claim-evidence ledger and verified learning links, then test the end-to-end programme route before scaling. Relationship edges still require explicit source-backed endpoint evidence.

## Reproduction

```powershell
python data/career-mapping/_audit/build_guided_experience_inventory_2026_10_08.py
```

The JSON companion includes exact counts, counters and SHA-256 fingerprints for the main source artifacts.
