# Product-wide scaling acceptance matrix (2026-09-19)

This is a read-only coordinator report for the local scaling phase. It compares
full-population contract evidence with the smaller route/UI smoke fixtures. It
does not apply SQL, fetch external URLs, invent missing relationships, or
approve live exposure.

## Decision

**Local scaling verification: PARTIAL — not accepted for live exposure.**

The checked-in contracts cover all 237 parsed programmes and retain source
fields in curriculum, contextual items, and relationship rows. Complete product
acceptance is not proven: unresolved/not-established relationships, incomplete
all-programme resource enrichment,
missing browser render proof, incomplete full-population admin route proof
(including the all-programme admin render), and deferred live SQL verification
remain open.

## Evidence boundary

| Evidence class | Full-population evidence | Smoke/fixture evidence | Interpretation |
| --- | --- | --- | --- |
| Programme population | 237 parsed programmes: 236 generic + 1 Sociology | Sociology, Nursing, Accounting fixtures | The local population is complete; three fixtures are not 237 rendered routes. |
| Programme/domain context | 1,344 active programme-domain evidence rows; all 237 programmes have an active mapping | Route helper preserves programme, JAMB programme, university and user context | Mapping data exists, but helper output is not browser proof. |
| Curriculum | 81,429 parsed course-outcome rows; 237 contract records; 0 locator gaps; 0 state gaps; 0 count mismatches; 0 raw student annotations | Generic curriculum theme smoke plus Sociology contract smoke | Structural source contract passes; rendered routes and URL reachability are not proven. |
| Contextual items | 121,377 item rows across 5,668 contexts; ownership/state/reference/locator gaps 0; role-aggregate candidates 0 | Sociology: 725 rows, 27 approved item-resource matches, 698 honest no-link states | Source metadata and explicit link-state coverage are structurally present; item-specific external enrichment remains incomplete. |
| Relationships | 408,163 catalogue rows; duplicate edges 0; missing source-reference rows 0 | Sociology: 2,519 resolved source-backed edges | 2,305 catalogue rows remain unresolved/not-established; expanded programme view reports 21,235 unresolved and 21,235 not-established rows. |
| Resources | No complete 237-programme approved-resource inventory is evidenced | Sociology reviewed migration: 51 URLs; 27 exact item matches | Coverage is partial; missing exact links remain honest no-link states and URL reachability was not tested. |
| Admin/institution | Ownership/review boundary is specified; no full 237-programme admin render matrix | Local institution/subject tests and admin checkpoints | Admin acceptance is not proven product-wide. |

## Acceptance matrix

Status meanings: PASS = local structural gate met; PARTIAL = lower-level or
smoke gate only; OPEN = known review/data backlog; DEFERRED = intentionally
left for the final phase; BLOCKED = required environment proof unavailable.

| Area | Required acceptance | Full-population proof | Smoke/fixture proof | Status | Remaining proof |
| --- | --- | --- | --- | --- | --- |
| Population inventory | Every parsed programme represented once | 237 records; 236 generic + Sociology | Three named fixtures | PASS (data) | Render/API acceptance for all 237. |
| Programme curriculum | Outcomes stay programme/course-owned, with state and locators | 81,429 rows; all curriculum gap counters 0; Sociology quality failures 0 | Generic/Sociology UI grouping smoke | PASS (contract) | Browser rendering and source-page reachability. |
| Programme-to-domain explanation | Active edges and programme-specific evidence available | 1,344 active evidence rows; all 237 programmes mapped | No full route render | PARTIAL | Verify downstream explanations in browser and live payloads. |
| Preview to university offerings | Dedicated preview and same-programme offering route preserve identity | Population data exists; no browser-wide capture | 3 fixtures x 5 transitions = 15 route-helper transitions; no replace navigation | PARTIAL | Browser proof for all entry variants and offering payloads. |
| Selected-university overview | Requirements, identity, curriculum entry, and downstream context | Local contract only; live payload unavailable | Included in 15 helper transitions | PARTIAL | Live payload and rendered Back/context behavior. |
| Curriculum learning view | Synthesized cards; no raw outcome wall or legacy fallback | 237 contracts; legacy fallback risk 0 | Generic curriculum UI smoke; Sociology contract smoke | PARTIAL | Full route render and staff/student text review. |
| Domain to subgroup to role | Ownership and hierarchy separate; no flat role list | 5,668 contexts; ownership mismatch 0; role aggregate candidates 0 | 3 fixtures cover helper transitions | PARTIAL | Browser proof and full-programme traversal. |
| Items/methods/certifications | Only typed, owned, source-backed items render | 121,377 typed rows; ownership/state/reference/locator gaps 0; 220 certification catalogue rows | Sociology emits 0 certifications and keeps generic signals audit-only | PARTIAL | Record-level review of every student-visible item and qualification. |
| Item resources/no-link | Exact item link or explicit honest no-link state | 121,377 catalogue rows have explicit link-state fields; complete external item search is still open | Sociology has 27 exact links and 698 honest no-link states | OPEN | Continue authoritative item-specific enrichment and retain URLs/locators. |
| Relationships | Resolved same-context typed endpoints, source-backed status, retained references | 408,163 rows; source-reference gaps 0; 2,305 unresolved/not-established; expanded view 21,235 + 21,235 | Sociology has 2,519 resolved source-backed edges | OPEN | Search authoritative sources, promote only verified endpoints, retain URLs/locators. |
| Guidance/report | Review gates print/download/share; changes relock route | No live report dataset | Local report smoke passed before/after review, relock, and reopen | PARTIAL | Browser and live Supabase report E2E. |
| Student entry variants | JAMB, SS1/SS2/SS3, undergraduate, and Explore doors preserve context | Mockup contracts cover variants; no full runtime matrix | Current smoke covers three programme fixtures | PARTIAL | Browser/API acceptance per entry variant across population. |
| Admin/institution boundary | Admin may inspect provenance/review rows; student payloads exclude them | Policy/checkpoints documented; no 237-route admin matrix | Local institution/subject tests and admin checkpoints | PARTIAL | Full admin render audit, student-leak negatives, selected-student report route. |
| SQL/deployment | Live schema/seed counts match local contract before approval | Not applied; local generation is not deployment evidence | None | DEFERRED | Apply documented SQL manually, then read-only preflight and count comparison. |
| Browser verification | Rendered routes and Back behavior observed | Not available | Build/type/helper smokes are not browser evidence | BLOCKED | Browser surface/dev-server access and route capture. |

## Downstream route coverage boundary

The downstream audit is product-wide, not Sociology-only. Required route shape:

entry door -> programme identity/preview -> university offerings or
university-first selection -> selected-university overview -> programme
learning/curriculum -> relationship-grouped domain -> domain items ->
subgroup/methods -> role/items/resources -> Review -> report actions.

The variant documents also require JAMB known-choice, programme-only,
subject-match, SS1, SS2, SS3, undergraduate, Explore, secondary-school owner,
and admin contexts to preserve route-local programme/university/student
identity. The local 15-transition smoke validates navigation shape for three
fixtures only; it does not claim all 237 programmes or all entry variants
rendered successfully.

## Source-enrichment boundary

External enrichment applies to curriculum, programme/domain evidence, resources,
contextual items, and relationships. This checkpoint audits retained source
fields only. It does not perform web research or promote a name-similar
relationship. Unresolved rows remain not-established/review-state. A future
research pass must retain the authoritative URL and locator, record scope and
evidence limitations, and leave a no-link/review state when the source does not
establish a relationship.

## Admin/student boundary

Admin/institution surfaces may expose raw wording, provenance, review state, and
audit evidence within permission boundaries. Student surfaces must receive only
context-owned, source-backed rows with a specific link or honest no-link state.
Role aggregates, unresolved relationships, review-only rows, and generic source
categories are not student evidence. This report records the boundary; it does
not treat local admin tests as proof of a full 237-programme admin render.

## Deferred gates

- SQL was not applied and no live deployment is claimed.
- External URLs were not fetched; HTTPS syntax/source fields are not
  reachability checks.
- Browser proof was unavailable; build/type checks and helper smokes are not
  rendered-route proof.
- Focused test: data/career-mapping/_audit/test_scaling_acceptance_matrix.py.
- Machine-readable evidence: data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json.
- Existing smokes: scripts/programmeGuidanceScaleSmoke.cjs and
  scripts/programmeCurriculumUiScaleSmoke.cjs.

## Controlling documents read

- docs/GOAL_RESUME_STATUS_AND_AGENT_HANDOFF_2026-09-18.md
- docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md
- docs/user-facing-mockups/EXPLORE_ENTRY_DOORS_AND_PROGRAMME_UNIVERSITY_FLOW_2026-09-18.md
- docs/user-facing-mockups/jamb-candidate-flow.md
- docs/user-facing-mockups/secondary-school-owner-flow.md
- docs/user-facing-mockups/ss1-refinements.md
- docs/user-facing-mockups/ss1-student-flow.md
- docs/user-facing-mockups/ss2-student-flow.md
- docs/user-facing-mockups/ss3-student-flow.md
- docs/user-facing-mockups/undergraduate-student-flow.md
- docs/user-facing-mockups/SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md
- docs/user-facing-mockups/SOCIOLOGY_TOP_DOWN_AUDIT_AND_CLOSURE_PLAN_2026-09-17.md
- docs/user-facing-mockups/programme-domain-subgroup-role-guidance-corrections-2026-09-17.md

Generated from existing local artifacts. No implementation or SQL file was
changed by this pass.
