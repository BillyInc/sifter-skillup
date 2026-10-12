# D078 Area and Role Resolution — 2026-10-08

**Current area-label correction:** the stable key `D078:psychology-social-behaviour` is now displayed as **Social Behaviour and Interaction**. The older label appears in the historical route listings below so the prior checkpoint remains traceable; it must not be read as ownership of clinical psychology, counselling or psychotherapy, which remain under D064 Psychology and Counselling.

Implemented locally for D078 only from the saved reconciliation and D078 role-domain review. The 19 D078 workflow items remain outside this task.

## Scope and safety

- Seven D078 areas were reconciled and applied as local canonical source data.
- The two legacy subgroup records remain only as hidden historical/provenance records: computational was merged into the computational/digital area; the broad social/cultural/economic label was retired as a standalone area.
- Role routes were adjudicated against both the D078 boundary and the specific area boundary using task/work-activity evidence. Conditional routes remain available with explicit scope conditions; unsupported routes remain hidden.
- Nigerian enrichment was not applied; global scope remains primary and a separate overlay marker is retained.
- No other domain, matcher, SQL, API or UI file was changed.

## Counts

- Areas: 7 → 7 (visible 0 → 7)
- D078 roles: 24 → 24
- Area routes: 20 → 26 (supported 1 → 18; review-required 0 → 0)
- Student-visible area routes: 0 → 26
- Other-domain rows modified: 0

## Role dispositions

- **criminologist** — `supported` — D078:psychology-social-behaviour (supported, primary), D078:sociology-social-anthropology (supported, secondary)
- **historian** — `unsupported` — none; direct/hidden domain route preserved
- **sociologist** — `supported` — D078:sociology-social-anthropology (supported, primary)
- **business economics researcher** — `supported` — D078:economics-applied-analysis (supported, primary)
- **media scientist** — `supported` — D078:sociology-social-anthropology (supported, primary)
- **archaeologist** — `conditional` — D078:sociology-social-anthropology (conditional, candidate)
- **economic policy officer** — `supported` — D078:economics-applied-analysis (supported, primary), D078:politics-governance-public-policy (supported, secondary)
- **social work researcher** — `supported` — D078:social-research-evaluation (supported, primary)
- **behavioural scientist** — `supported` — D078:psychology-social-behaviour (supported, primary)
- **political scientist** — `supported` — D078:politics-governance-public-policy (supported, primary)
- **economic adviser** — `supported` — D078:economics-applied-analysis (supported, primary)
- **genealogist** — `conditional` — D078:sociology-social-anthropology (conditional, candidate), D078:human-geography-population (conditional, candidate)
- **communication scientist** — `direct_domain_role` — none; direct/hidden domain route preserved
- **mathematician** — `unsupported` — none; direct/hidden domain route preserved
- **thanatology researcher** — `conditional` — D078:psychology-social-behaviour (conditional, candidate), D078:sociology-social-anthropology (conditional, candidate)
- **economist** — `supported` — D078:economics-applied-analysis (supported, primary)
- **economic development coordinator** — `supported` — D078:economics-applied-analysis (supported, primary), D078:politics-governance-public-policy (supported, secondary)
- **statistician** — `conditional` — D078:social-research-evaluation (conditional, candidate), D078:computational-digital-social-science (conditional, candidate)
- **anthropologist** — `supported` — D078:sociology-social-anthropology (supported, primary)
- **biometrician** — `unsupported` — none; direct/hidden domain route preserved
- **tax policy analyst** — `supported` — D078:economics-applied-analysis (supported, primary), D078:politics-governance-public-policy (supported, secondary)
- **geographer** — `conditional` — D078:human-geography-population (conditional, candidate)
- **philosopher** — `unsupported` — none; direct/hidden domain route preserved
- **demographer** — `supported` — D078:human-geography-population (supported, primary)

## Provenance and validation

Area evidence is retained with URL, locator, global jurisdiction, access date and review date. Role evidence retains the reviewed ESCO/O*NET/UNESCO/UN source URLs and records positive task evidence plus negative neighbouring checks on every route object.

Validation: **passed**.

Machine-readable checkpoint: `data/career-mapping/_audit/d078_area_role_resolution_checkpoint_2026_10_08.json`.
