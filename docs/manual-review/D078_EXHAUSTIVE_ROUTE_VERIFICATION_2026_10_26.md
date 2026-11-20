# D078 Route Verification Checkpoint — 2026-10-26

## Result

The current local method-aware graph and its UI route projection pass the
structural route audit and focused backend/UI regression checks. This is local
verification of the checked-in graph contract and code; it is **not** rendered
browser acceptance, a live Supabase check, or student-facing approval.

## What was checked

- Exhaustively enumerated all **4,194,303 non-empty subsets** of the 22
  selectable methods. The audit verifies that only supported multi-method
  selections resolve to an explicitly named design; unsupported combinations
  remain gated instead of receiving an invented aggregate route.
- Checked all **116** declared method-to-area route rows, **421**
  method/area-to-role route rows, **31** named-combination area routes, and
  **66** declared combination-method contributions against the graph.
- Checked the **95** role-tool route records across all **19** roles. Each role
  has at least five route-owned, optional, source-backed tool choices. Tool
  routes stay attached to their selected role/area; they do not become role
  prerequisites or silently enter another role's route.
- Checked the graph's seven canonical areas, node/edge references, route
  explanations, tool resource references and selection eligibility. The
  exhaustive audit reported no structural errors.
- Model-checked item selection across **627** distinct single-method,
  named-design/component, area and role route contexts. The largest route offers
  **77** independent item choices, corresponding to `2^77` possible checkbox
  states for that route. The audit counted **12,371 route/item choice
  occurrences** and the exact sum of powersets across all route contexts:
  **195,511,703,271,159,370,548,304** possible selected-item states. A runtime
  property test exercised add and remove for every eligible item in every
  context and confirmed that selecting the whole set does not change route
  eligibility. Since eligibility is fixed by the selected method/design + area
  + role, all item subsets are reachable through independent toggles without
  materializing every state.
- Ran the graph projection tests (27/27), the full D078 journey UI test file
  (31/31), and backend guided-area tests (7/7).

## Work included in this pass

- Reconciled the current method graph with the already researched role-tool
  route contract rather than re-searching the same 95 role/tool assignments.
- Restored 15 tool nodes that were referenced by that contract but missing
  from the current graph artifact; added explicit role/tool and tool/task
  relationship records, per-role task context and route explanations.
- Kept role tools in the optional/useful lane and made them selectable only
  on their selected role route. Updated the projection and role screen to show
  task context, expected result, official product information and the
  associated learning link where supplied.
- Closed a selection propagation defect found during the deeper end-to-end
  contract review: role tools were selectable but were omitted from the tray's
  selected-item projection and filtered out of saved reports. The tray now
  classifies role tools as role-context selections, and report validation
  accepts each role tool only when its declared role and area are selected.
  Added regression coverage across all 95 role-tool routes.
- Updated three stale UI test interactions to expand the already-visible
  compact tray, and corrected the duplicate-card/tray assertion to check both
  expected appearances.

The external source check used official tool documentation for the examples
[Tropy](https://docs.tropy.org/), [Gramps](https://www.gramps-project.org/wiki/index.php/User_manual)
and [Zotero](https://www.zotero.org/support/quick_start_guide). Tropy's documentation describes it as free software
for organizing and describing photographs of research material and explicitly
distinguishes it from citation-management and research-writing software;
Gramps documents its genealogical-information database; Zotero documents its
source collection, organization and citation workflows. These boundaries
support the graph's task-specific use descriptions; they do not imply that any
tool is required for every role.

## Commands and outcomes

```text
python data/career-mapping/_audit/audit_d078_exhaustive_selection_space_2026_10_26.py
  passed=true; 4,194,303 method subsets; 627 item-selection route contexts;
  12,371 route/item occurrences; 77 choices maximum per route;
  95 role-tool routes; errors=[]

node_modules/.bin/jest.cmd src/lib/d078RouteProjection.test.ts --runInBand --no-cache
  27 passed (including route-local all-item add/remove sweep)

node_modules/.bin/jest.cmd src/screens/careerIntelligence/D078MethodAwareJourney.test.tsx --runInBand --no-cache --silent
  31 passed

python -m pytest backend/tests/test_provisioning_guidance_resume.py -q -p no:cacheprovider
  26 passed; includes all 95 role-tool report eligibility cases
```

`git diff --check` and Python syntax compilation for the three local audit/
integration scripts passed after the final adjustments (Git emitted only its
existing LF/CRLF normalization warnings).

## Explicit limits / next verification

- The method powerset was explicitly enumerated. Item checkbox powersets were
  model-checked symbolically, not materialized one state at a time: the largest
  contains `2^77` combinations, and the combined route-context count is about
  `195,511,703,271,159,370,548,304`. Every eligible item was exercised through add/remove on each
  context, and the implementation's route-local eligibility set is unchanged
  by item additions. This is an exhaustive verification of the independent
  toggle model, not a browser replay of every checkbox screen state.
- No running browser journey, real account, live backend/database, My World
  restore, or generated report file was exercised here. Those require the
  local services and a real browser/account workflow.
- The automated model covers every method subset and represents every
  independent item subset symbolically; the runtime property test adds and
  removes every eligible item in every declared route context. The saved-report
  regression checks every role-tool route. This is not a literal browser or
  database replay of every final checkbox subset; such a replay would require
  about 195.5 sextillion states. Correctness is checked through the route,
  toggle, tray, save-snapshot and report-filter rules that define those states.
- The whole-project TypeScript command first exceeded Node's default heap; a
  retry with a 4 GB heap reported existing whole-project errors in unrelated
  curriculum imports, tray fixtures, admin, Pathways and programme screens. A
  D078 key-field type error found in the changed role-tool render was corrected,
  but the repository-wide typecheck is not green.
- The graph still carries its existing global `student_visible: false` gate.
  This checkpoint does not change that gate or declare promotion approval.
- No SQL was applied or regenerated by this verification pass.
