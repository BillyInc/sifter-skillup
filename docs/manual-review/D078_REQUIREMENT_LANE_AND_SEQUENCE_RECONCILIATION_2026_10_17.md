# D078 requirement lanes and conditional sequence reconciliation — 2026-10-17

## Result

Reconciled 499 distinct learner item/context records from the current approved runtime contracts across the domain, seven canonical Areas of Specialization, and 19 role contexts.

- Runtime item/context population by owner: {'domain': 52, 'subgroup': 150, 'role': 297}; this is distinct from the 501 review-disposition records.
- Lane totals: needed 3, optional 180, useful 316.
- The separate requirement-disposition ledger contains 501 records; lane totals: choose_one_alternative 98, conditional 261, needed 4, unapproved 4, useful_optional 134.
- All 501 disposition records joined exactly to graph targets by context-specific keys: {'domain': 53, 'area': 144, 'area_inherited': 36, 'role_item': 173, 'role_tool': 95}.
- Approved conditional ordering edges: 3; each is scoped to its stated route condition and has `blocking_policy=never`.
- Graph nodes annotated from runtime item contracts: 223; role-item candidates with a requirement disposition: 173.
- Approved domain/area items missing from the former graph were added as explicit runtime nodes: 0; 95 role-tool decisions classify 199 related graph edges as selectable tool choices.
- Unique non-role runtime identities mapped into graph nodes: 223; all mapped: True.
- A general domain/area/role view does not make every card compulsory. No lane was inferred from item type, student-visibility flags, or legacy `priority_snapshot` values.
- The three shared research/evidence foundations are conditionally needed only when the selected area/role task calls for them; outside that scope they remain useful and skippable. Their 1–3 order is pedagogical, not a hard dependency.
- Conditional, useful and alternative items remain selectable alongside the core route; they are not auto-added and do not block progression. Alternatives are not cumulative.

## Area coverage

- D078:computational-digital-social-science: 15 learner item/context records
- D078:economics-applied-analysis: 25 learner item/context records
- D078:human-geography-population: 13 learner item/context records
- D078:politics-governance-public-policy: 26 learner item/context records
- D078:psychology-social-behaviour: 31 learner item/context records
- D078:social-research-evaluation: 11 learner item/context records
- D078:sociology-social-anthropology: 29 learner item/context records

## Files

- Lane ledger: `data/career-mapping/_audit/D078_REQUIREMENT_LANE_AND_SEQUENCE_RECONCILIATION_2026_10_17.json`
- Reconciled graph: `data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json` and its deterministic gzip mirror.
- Seed generators persist the requirement scope independently of the base `requirement_level`; apply `migration_d078_requirement_lanes_2026-10-17.sql` before D078 domain/area and role-tool seeds, and after the path-target and role-item-contract schema migrations.

This is local generated data, not a live Supabase deployment or a blanket student-release approval.
