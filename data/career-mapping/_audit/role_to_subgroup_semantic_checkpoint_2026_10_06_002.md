# Role → subgroup semantic audit checkpoint — 2026-10-06 run 002

The full active role→subgroup path set has been scanned for this run. This checkpoint is evidence of coverage, not a claim that every conditional row is semantically resolved.

- Register: `role_to_subgroup_semantic_register_2026_10_06_002.json`
- Merged role records: **3,919**
- Active subgroup paths: **394**
- Active role→subgroup records audited: **2,405**
- Deterministic exclusions: **0**
- Supported candidates: **460**
- Conditional/insufficient evidence: **1,945**

- Domain edge cases assessed: **73**
- Domains without visible subgroup: **73**
- Domains without active role mapping: **17**
- Domain route dispositions: `{"needs_role_enrichment_before_subgroup_decision": 1, "needs_supported_specialization_layer": 22, "unresolved_ownership_and_role_enrichment": 16, "unresolved_ownership_or_source_review": 34}`

Exact zero-visible-subgroup domain IDs:
D001, D002, D003, D004, D007, D016, D017, D018, D019, D020, D021, D023, D024, D030, D037, D038, D039, D040, D041, D043, D045, D049, D050, D052, D053, D054, D055, D056, D068, D071, D072, D075, D076, D079, D080, D082, D083, D084, D085, D087, D088, D089, D090, D091, D093, D094, D097, D100, D101, D104, D105, D106, D108, D109, D110, D112, D113, D114, D115, D116, D118, D119, D123, D124, D126, D132, D142, D144, D148, D153, D157, D159, D162

Exact zero-active-role domain IDs:
D037, D038, D039, D040, D045, D049, D050, D052, D053, D054, D071, D075, D076, D079, D080, D153, D157

Exact unresolved ownership/source-review domain IDs:
D003, D004, D007, D021, D023, D024, D030, D037, D038, D039, D040, D041, D043, D045, D049, D050, D052, D053, D054, D055, D056, D068, D072, D075, D076, D079, D080, D082, D083, D084, D100, D101, D104, D105, D106, D108, D109, D110, D112, D116, D124, D126, D132, D142, D144, D148, D153, D157, D159, D162


Canonical files changed: **no**.

Register SHA-256: `730109b6dcdec74908b399cfcf4d7286fa9a6381e98d3c47694e5dc2c284ce40`

Next gate: resolve the conditional/insufficient rows with subgroup-specific task evidence, then prepare a separately reviewed canonical correction set.
