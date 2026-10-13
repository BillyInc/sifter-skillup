# Role -> subgroup semantic reconciliation — 2026-10-06 run 010

This append-only continuation starts from `role_to_subgroup_semantic_register_2026_10_06_009.json`. It reconciles the **1,577** conditional rows with role task evidence and domain/subgroup scope. It does not edit canonical taxonomy or role files.

The input state is the post-504-exclusion, post-45-reclassification, post-19-route-gate inventory. The 504/45 figures are prior-run context; the hashed inventory and route-gate files are the authoritative inputs for this continuation.

## Classification counts

- Conditional role rows: `{"conditional": 1315, "direct-domain-role": 119, "supported": 79, "wrong subgroup": 64}`
- Domain route rows: `{"conditional": 41, "missing specialization/role": 39}`
- Gated target route rows: `{"conditional": 15, "missing specialization/role": 4}`

`supported` means the recorded task evidence has multiple distinguishing anchors to the selected or available subgroup scope. `wrong subgroup` means another visible subgroup is materially better supported by the task evidence. `direct-domain-role` means the task evidence supports the parent scope while no subgroup scope is supported. `missing specialization/role` is reserved for a missing route layer or a domain route with no active role. Everything else remains `conditional`.

## Priority coverage

- Zero-visible-subgroup domains recorded: **80**.
- No-active-role domains recorded: **16**.
- Gated target routes recorded: **19**.

Zero-visible-subgroup domains:

D001, D002, D003, D004, D007, D016, D017, D018, D019, D020, D021, D023, D024, D030, D037, D038, D039, D040, D041, D043, D044, D045, D049, D050, D052, D053, D054, D055, D056, D068, D071, D072, D075, D076, D079, D080, D082, D083, D084, D085, D087, D088, D089, D090, D091, D093, D094, D095, D097, D099, D100, D101, D104, D105, D106, D108, D109, D110, D112, D113, D114, D115, D116, D118, D119, D123, D124, D126, D131, D132, D142, D144, D148, D149, D153, D156, D157, D159, D162, D164

No-active-role domains:

D037, D039, D040, D045, D049, D050, D052, D053, D054, D071, D075, D076, D079, D080, D153, D157

Gated target route role keys:

D030|search engine optimisation expert, D032|Information Technology Project Managers, D035|logistics engineer, D036|bid manager, D036|procurement department manager, D042|costume buyer, D042|set buyer, D060|bank treasurer, D062|investment clerk, D083|destination manager, D083|tourism product manager, D098|Ophthalmic Laboratory Technicians, D118|curator of horticulture, D118|viticulture adviser, D119|animal feed nutritionist, D120|aquaculture environmental analyst, D120|aquaculture quality supervisor, D120|aquaculture site supervisor, D158|corporate treasurer

## Evidence boundary

The JSON records full task text, parent scope overlap, every same-domain subgroup scope score, the classification reason, and explicit false flags for role-title evidence, ISCO fit proof, subgroup-membership proof, and semantic sign-off. Conditional cases remain available for later source review.

Machine-readable register: `role_to_subgroup_semantic_reconciliation_2026_10_06_010.json`.
