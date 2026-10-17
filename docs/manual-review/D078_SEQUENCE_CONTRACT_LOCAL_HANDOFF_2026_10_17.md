# D078 sequence contract local handoff ? 2026-10-17

## Handoff status

The D078 sequence repair is complete locally. Reconcile these changes against the current local branch before any further edits.

## Contract now implemented

- Programme context comes first.
- Three shared D078 foundations are compulsory and displayed in order:
  1. Research question design
  2. Evaluate evidence and limits
  3. Communicate evidence
- After them, the domain display is split into:
  - broad domain sequence;
  - safeguards and reproducibility;
  - method routes and alternatives;
  - advanced and specialist extensions;
  - supporting tools.
- Method, knowledge, competency and tool alternatives are all treated as choices where the record marks them as alternatives.
- complements, works_with and supports explain items that can be learned together; they do not block progression.
- Area pages inherit the domain path, then show area-owned additions, area tools and credentials.
- Role pages inherit domain and selected-area learning, then show role-owned capabilities and role tools.
- Domain-owned support remains domain-owned. Area-owned support remains area-owned.
- Only the three shared foundations have blocksProgression=true and skippable=false.
- All post-foundation domain items, area additions and role items are skippable and nonblocking.

## Counts

- Runtime domain items: 52
- Compulsory shared foundations: 3
- Post-foundation domain items: 49
- Canonical areas: 7
- Unique area graph items: 144
- Runtime area rows after reviewed tool enrichment: 150
- Role branches: 19
- Unique role graph nodes: 173
- Role branch references: 224
- Runtime role-owned rows including tools: 202
- Original graph relationship edges: 4,482
- Advisory display-order edges: 50
- Blocking graph edges: 0

## Files changed for this handoff

- backend/d078_guided_content.py
- src/types/career.ts
- src/components/careerIntelligence/ContextualItemList.tsx
- src/screens/careerIntelligence/DomainDetailScreen.tsx
- src/screens/careerIntelligence/SubgroupDetailScreen.tsx
- src/screens/careerIntelligence/RoleDetailScreen.tsx
- data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json
- data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json.gz

## Related checkpoint files

- D078_SEQUENCE_CONTRACT_REDESIGN_2026_10_17.md
- D078_DOMAIN_POST_FOUNDATION_DISPLAY_CONTRACT_2026_10_17.md

## Validation

- backend/d078_guided_content.py compiled successfully.
- Runtime assertions confirmed 3 compulsory foundations, 49 skippable domain additions, nonblocking area/role rows, and no blocking relationship edges.
- Graph JSON and gzip mirror match.
- Changed TypeScript and TSX files parsed successfully with Babel.
- Full TypeScript compiler validation remains unavailable because node_modules/.bin/tsc.cmd is absent.
- No SQL or migrations were changed.
