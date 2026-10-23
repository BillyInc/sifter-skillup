# D078 method-aware UI handoff - granular gap audit

Date: 2026-10-20  
Audited against: `docs/manual-review/D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md`  
Scope: numbered sections 0-14, current D078 journey code, focused frontend/backend tests, and the local D078 API check. This is an implementation audit, not student-facing approval. The handoff keeps graph promotion and SQL application out of scope.

## Executive result

> **Baseline status only:** the counts and gap lists below describe the initial audit before the later repair checkpoints in this document. Do not treat them as the current implementation state without reading the latest checkpoint at the end.

For the 14 numbered sections 1-14: **1 is fully implemented at the code/unit-test level, 12 are partial, and 1 is not implemented on the D078 method-aware screen.** Section 0, the governing rule, is also only partially satisfied. "Fully" does not mean rendered or live accepted.

The strongest completed part is the pure route projection: selection controls which areas, roles, items, and tools are eligible, and focused projection tests pass. The principal unresolved product gap is that the D078 journey renders its own `ItemCard`, which does not render the handoff's typed item relationships or comparison-sheet behavior. A local repair checkpoint below records subsequent tray and accessibility changes; those changes do not close the remaining relationship, snapshot/report, or rendered acceptance gaps.

Current verification:

- TypeScript: `node.exe node_modules/typescript/bin/tsc --noEmit -p tsconfig.guided-sequence-check.json` - **passed**.
- Focused UI/content tests: **6 suites passed, 1 failed; 49/50 tests passed**. Failure: the D078 tray summary contains a corrupted separator instead of the expected middle dot (U+00B7), so the expected `2 selected method/designs [middle dot] 2 added items` is absent.
- Snapshot/learning-plan tests: **2 suites passed, 1 failed; 31/33 tests passed**. The D078 snapshot tests expect invalid saved selections to survive normalization (a non-selectable combination component and a foundation stored as an added item); the contract says unsupported choices/items must be filtered. The tests need valid fixtures and a valid round-trip case before this gate is settled.
- Backend report tests: **18 passed, 2 failed** in `backend/tests/test_provisioning_guidance_resume.py`. One expects a combination label that the current report does not emit; the other finds `Python` in a report for a route whose saved area/role/item selection is unsupported. Check the canonical graph labels and filter report content against the selected projection; do not dismiss these as stale without that check.
- Live payload: `GET http://127.0.0.1:8000/api/career/domains/D078` timed out after 12 seconds. Approved-resource payload delivery is **not verified**.
- Rendered acceptance: **not performed**. Unit tests are not proof of navigation, focus, responsive layout, or browser rendering.

## Section-by-section disposition

| Handoff section | Status | Audit finding |
|---|---|---|
| 0. Governing method-aware rule | **Partial** | `d078RouteProjection` and `D078MethodAwareJourney` gate downstream visibility from selected methods/designs. However, the D078 item renderer omits typed relationships and comparison behavior that should explain why an item appears and what alternatives connect to it. The tray/output path is also not fully projection-faithful (see sections 7, 10, 13). |
| 1. Do not build | **Partial** | D078 branches away from generic domain/area/role rendering, so the unfiltered legacy area grid and generic tool/category sections are not mounted on the D078 domain branch. In the current local source, the tray label is `Sociology · Social Sciences` (not the internal D078 id), and the tray eyebrow is no longer uppercase. The remaining route-tree/legacy exclusion still needs rendered route confirmation. |
| 2. Identity join | **Partial** | Projection normalizes area IDs and tests the Computational/Digital area join. It uses exact graph role IDs in projection. Screen integration then resolves graph role labels to API roles by normalized name; no exhaustive test proves that all 19 graph roles resolve to the intended API role and area, or that every failed join is surfaced as the specified development warning. |
| 3. New projection module | **Fully implemented at unit-test level** | `src/lib/d078RouteProjection.ts` and its tests exist. Tests cover zero-selection catalogues, Interviews, Spatial, union behavior, named interview-and-observation, participatory expansion/removal, hidden roles, role-item gating, ID normalization, unknown IDs, and exclusion of aggregate counts. This is the strongest completed section; it does not establish rendered acceptance. |
| 4. Selection state | **Partial** | Method/design/area/role/item state is carried in URL/snapshot structures, and save/load helpers exist. But D078 snapshot tests currently fail because their fixture encodes invalid choices; no passing test proves a valid selection containing method + combination/component (where allowed) + area + role + added item survives save, exit, and reopen. Ensure foundations are not stored as learner-added items. |
| 5. On-screen states | **Partial** | State A has a no-selection explanation and does not show areas; State B projects selected routes. Field, area, and role components exist. Automated UI coverage does not render actual area and role navigation states, test all nine combination cards and their copy, or prove that every state has no unsupported/empty downstream card. |
| 6. Worked examples | **Partial** | Projection tests verify the main Interviews/Spatial/union and interview-observation examples. They do not exhaustively verify every combination's exact area/role union, all component-method combinations, or the displayed explanations and limits for those routes. |
| 7. Screen specification | **Partial** | Programme themes/carry-forward have focused content tests; D078 has distinct field/area/role experiences; cards separate several explanation sections. Material requirements remain: (a) D078 `ItemCard` does not display item programme/area/role context or graph relationships; (b) no D078 comparison sheet is wired to "Another way"; (c) a D078 print/download callback is now wired and requires a confirmed server save first, but report route filtering still needs Agent 2's repair; (d) share copy now names the selected methods/designs, foundations, area/role stop point, and added items, but it is still a text summary rather than a complete report/stack; (e) method-specific role items and full filtered area/role content need route-level verification. |
| 8. Behaviour/transitions | **Partial** | There is reduced-motion handling and a timed Undo state, and selecting/removing methods recomputes projections. The implementation animates the aggregate result block, but does not demonstrate the specified per-card stagger/removal, focus movement/return, picker scroll restoration, relationship-target scroll/return, or focus restoration after comparison-sheet close. The current "role loses support -> Undo restores role" test exercises pure helpers, not rendered navigation/Undo. |
| 9. Visual specification | **Partial** | Main D078 title/body/card styles use readable sizes and resource rows have a 44px Open control. `RouteButton` has an accent-colour 2px focus outline. Tray collapse, remove, reorder, add, compare, size, save/print/share, and external-link confirmation controls now use it; tray metadata/action copy was raised to handoff sizes. Component tests assert 44px targets for tray actions, resource rows, and external-link controls. A responsive shared shell is implemented: wide web uses the vertical sticky spine, 720px-max reading column, and sticky tray rail; narrow screens use a horizontal spine and mobile bottom sheet (fixed dock on mobile web). Remaining: rendered-browser verification, native dock persistence, and a full measured target-size audit across every screen control. |
| 10. Relationship behaviour | **Not implemented on D078 method-aware item cards** | The D078 `ItemCard` renders meaning, field context, use, output, limitations, and a resource, but does not render `prerequisite_for`, `builds_on`, `works_with`, alternatives, tool-for, or reveal relationships from the graph. It has no comparison sheet or hidden-target copy. Generic `ContextualItemList` has relationship behavior, but the D078 method-aware route uses its own `ItemCard`; generic capability does not satisfy this D078-specific requirement. |
| 11. Required files/order | **Partial** | Projection, journey, `MethodChoicePanel`, `RouteButton`, `CompactResourceRow`, and their focused tests now exist; `ExternalLinkGuard` also has coverage for confirmation, safe omission, and target size. The tests do not provide end-to-end coverage of navigation, all control variants/states, and method-to-resource/area/role behavior. |
| 12. Required tests | **Partial** | Many projection cases and focused component tests exist. Missing/insufficient: valid full snapshot round-trip; actual rendered area/role hidden gates; actual route removal and Undo navigation; all required controls at 44px; actual reduced-motion transition behavior (only a helper offset is tested); comparison/relationship cases; and the full picker/combination content. The broader run currently has the tray failure noted above. |
| 13. Acceptance | **Partial; not accepted** | Automated checks support zero-selection hiding, Interviews/Spatial projection, the union, one named combination, resource-row layout, and some programme content. The manual/rendered pass has not been done. The live D078 API request timed out. Route-level saving, reopening, role/area navigation, all controls, and print/share output are therefore not accepted. |
| 14. Student-facing words | **Partial** | Current source uses `Sociology · Social Sciences` rather than the internal D078 id, and the D078 count separator is repaired. Exact section 14 text has not been checked against every rendered method, combination, item, area, role, resource, empty, and error state. |

## Detailed acceptance checklist (section 13)

| # | Requirement | Evidence and result |
|---:|---|---|
| 1 | Sociology opens; all 14 themes are reachable; continue into field | Programme component tests cover all-theme expansion and carry-forward content. Actual browser navigation remains unverified. |
| 2 | No area card before a method/design choice | D078 journey UI test passes at component/harness level. |
| 3 | Interviews shows exactly four areas; excludes Economics, Computational, Human Geography | Projection and journey tests support the set/exclusions. Actual navigation/rendered screen not tested. |
| 4 | Deselect Interviews removes its areas | Component test passes for results disappearing; animation/focus behavior is not accepted. |
| 5 | Spatial shows exactly two areas | Projection tests pass; visual screen acceptance not performed. |
| 6 | Interviews + Spatial shows union and still hides Economics | Projection test passes; screen test checks the union/exclusion. |
| 7 | Clear methods restores State A | Clear control exists; no dedicated test verifies its full state transition, announcement, and focus behavior. |
| 8 | Interview-and-observation shows five areas without toggling member methods | Projection test and journey test cover the key behavior. |
| 9 | Open area/role and hide roles from unsupported areas | Projection gates exist; actual role navigation and all role joins are not verified. |
| 10 | Deselect last supporting method while role is open returns to picker with Undo | Helper logic exists; test does not press through real route navigation. |
| 11 | Undo returns to the same role | Helper-level assertion only; rendered Undo navigation/focus remains unverified. |
| 12 | Save/leave/reopen restores method, area, and role | Snapshot plumbing exists, but snapshot tests fail on invalid fixtures and there is no valid end-to-end round-trip proof. |
| 13 | Every Select/Open/Back/Save/resource Open control is 44px | Component tests now assert 44px for method select/open, tray collapse/remove/reorder/add/compare/size/save/print/share, compact resource Open, and external-link confirmation. Back controls and measured rendered sizes across all screens remain unverified. |
| 14 | Resource is one compact type-chip/title row | `CompactResourceRow` tests pass; live D078 resource payload is unavailable due timeout. |
| 15 | Exact student copy; no internal D078/domain/route-node/shared-foundation/evidence-file language | Fails as written: D078 tray label is visible. Full exact-copy audit remains undone. |

## Initial baseline repair list (superseded by the latest checkpoint below)

Keep the graph JSON, migration, seed, and SQL unchanged. Close these implementation gaps against the handoff, then rerun the relevant tests:

1. **D078 relationships and alternatives:** extend the D078 item-card model/rendering to show only current-projection relationships with the handoff's exact semantics; implement the comparison sheet (`Use this` / `Close`, focus return) and hidden-target copy. Do not rely on generic `ContextualItemList` unless it is actually wired into the D078 method-aware screens.
2. **Tray/output:** remove internal `D078` from student copy; fix the corrupted separator; wire print/download to the full current D078 tray content; make share use the intended complete selected-path content, not only labels. Confirm field-only, area, and role stop points, including zero-method save, and filter stale selections before output.
3. **Valid saved-route/report contract:** replace invalid D078 fixtures with valid graph-supported selections; test valid snapshot round-trip with area, role, and added item; fix the two backend report failures by comparing to canonical graph labels and proving unsupported items/areas/roles/components never leak into HTML or DOCX.
4. **Transitions/accessibility:** add rendered tests for clearing the last method, route loss while area/role is open, Undo restoring the same stop, announcement/focus behavior, and reduced-motion transitions. Implement specified scroll/focus restoration and per-card entry/exit behavior where missing.
5. **Visual/actions:** use `RouteButton` consistently for journey actions; add the specified keyboard focus outline; verify responsive desktop/mobile tray/spine layout and all target sizes; remove uppercase eyebrow styling from this journey.
6. **Coverage and live acceptance:** add the missing `MethodChoicePanel.test.tsx`; cover all nine combinations and participatory components. Run the complete focused suite, TypeScript check, web build, a rendered route pass, and a live D078 payload/resource check. Record unavailable backend/browser checks explicitly rather than calling them passed.

## Non-blocking clarification

The two `d078Snapshot.test.ts` failures currently use an invalid fixture: they place a foundation in `addedItemIds` and attach a selectable component to a fixed combination. The sanitizer currently removes unsupported data, which aligns with projection guardrails. Update the fixture to valid user-selectable data and add a separate assertion that invalid saved entries are dropped. Do not change the sanitizer to preserve invalid selections just to satisfy an invalid expectation.

## Local repair checkpoint (2026-10-20)

Implemented after the initial audit:

- Fixed the D078 tray's mojibake count separator.
- Replaced tray mode controls and Save/Print/Share actions with `RouteButton`; mode targets are at least 44px.
- Added a theme-accented 2px focus outline to `RouteButton` using focus/blur state.
- Removed uppercase styling from the tray eyebrow.
- Wired D078 Print / download to save first and then request the authenticated student DOCX report. A locally queued/pending save does not proceed to report download, avoiding stale server output.
- Expanded share text to include the foundations, selected method/designs, area/role (including an explicit stop point), and added items with their requirement lane.
- Added tests for route-button size/selection/focus-style behavior and share-message content.

Verification since those edits: `GuidedLearningTray.test.tsx` and `RouteButton.test.tsx` pass (17 tests); the new D078 share-message test passes. `tsc --noEmit -p tsconfig.guided-sequence-check.json` passes. A broader `D078MethodAwareJourney.test.tsx` run still exposes the saved-selection sanitizer issue described above; that remains assigned to the snapshot/report lane. These results do not constitute browser-rendered or live API acceptance.

## Local integration and Agent 2 reconciliation checkpoint (2026-10-20, latest)

This checkpoint supersedes the initial baseline above where the same requirements are covered.

- Reconciled `D078_SAVED_ROUTE_REPORT_REPAIR_CHECKPOINT_2026_10_20.md`: its scope was snapshot restore, My World selection, and report output. It did not verify the D078 journey UI, live API payloads, or rendered-browser behavior.
- Wired the snapshot sanitizer into `savedD078Selection`; reopen now filters unsupported methods, components, area/role stops, and added-item IDs through the current graph. Updated journey fixtures so fixed combinations do not retain selectable components, and replaced the earlier invalid “Python is unsupported” assertion with an actually absent graph item.
- Integrated `D078RelationshipPanel` into expanded D078 item details. Relationship rows use the graph's typed edge list, current-stage projection, and resolved endpoints; alternatives open the comparison sheet and “Use this” feeds the existing selectable-item handler. Opening a related target exposes its explanation and a return-to-source control.
- Fixed two reconciliation defects found during integration: non-domain cards no longer treat area tools from other selected areas as current targets, and self-referential relationship edges are omitted (they had produced a comparison of NVivo with itself). Hidden-target copy remains the exact handoff wording.
- Fixed the relationship panel's invalid theme-token references (`surface.canvas`, `CompassFonts.headingLg`) to the existing app tokens.
- Verification at this checkpoint: the five focused UI/snapshot suites pass together: **61 tests across 5 suites** (`D078MethodAwareJourney`, `D078RelationshipPanel`, `GuidedLearningTray`, `MethodChoicePanel`, and `d078Snapshot`). Backend `test_provisioning_guidance_resume.py` passes **21 tests** (one existing pytest-cache warning). Focused `tsc --noEmit -p tsconfig.guided-sequence-check.json` emitted no errors.
- Rendered acceptance remains unverified: no browser/app window is available to the computer-use runtime after retry and reset. The frontend/backend endpoints on `127.0.0.1:5173` and `:8000` were unreachable. `npm.cmd run build:web` could not start because the local `vite` executable is absent (`'vite' is not recognized`); this is an environment/dependency blocker, not a successful build.

Relationship target navigation is now implemented in the D078 field, area, and role journey: “See {target}” expands the actual projected target card; the shared detail scroll container positions it 20px below the viewport top and focuses its heading; “Back to {source}” restores the saved source offset and focus. Reduced-motion mode removes scroll animation while preserving focus movement. Regression coverage verifies the projected target opens and the source card is restored, plus the scroll-offset calculation. A ref-registration defect found during the implementation was corrected so the title ref no longer clears its card's scroll ref.

Still open from the handoff: rendered route and responsive/layout acceptance; complete keyboard/reduced-motion transition proof across the other specified transitions; and a full live D078 API/resource payload inspection. Do not reopen snapshot/report repairs or relationship-type semantics without new evidence; they now have current focused test coverage.

## Verification and route-boundary update (2026-10-20, after Agent 3 API handoff)

This is the latest state and supersedes earlier lines above that said the local endpoints were unreachable or that a web build had not succeeded.

- Reconciled `backend/D078_AGENT_3_API_HANDOFF_2026-10-20.md` without editing Agent 1's graph. The current graph has 26 area-to-role memberships and no direct domain-to-role edge; the D078 role API therefore requires an explicitly selected connected area and rejects both a missing area and an unrelated area. It does not infer the sole area for a role.
- Focused backend D078/API suite: **81 passed** across `test_d078_guided_areas.py`, `test_d078_api_identity.py`, `test_d078_guided_content.py`, `test_d078_role_tools.py`, `test_d078_role_item_contract_seed.py`, and `test_student_guidance_contract.py`.
- Local `GET /api/career/domains/D078` returned HTTP **200** twice in backend logs (about 24.7s and 28.6s). This confirms endpoint reachability only; nested counts and the exact approved resource payload were not inspected in those requests, so those remain unverified.
- The web production build succeeded using the installed Vite entry point directly: `node.exe node_modules/vite/bin/vite.js --config web/vite.config.mjs build`. The build emitted pre-existing duplicate-key and large-chunk warnings. The focused D078 TypeScript check also passed before this backend-only update.
- Rendered browser acceptance remains unavailable: the computer-use runtime could not connect to its native pipe after reset/retry. Do not equate the successful build or HTTP 200 with visual, keyboard, responsive, or end-to-end acceptance.
- Agent 1's graph rebuild is separate and pending. When it is handed over, rerun graph-count/projection and backend/API tests against that final graph; do not edit the graph as part of this UI/API reconciliation.
- Audited the other student-facing consumers of `domain.roles`. The guided field selector already uses `rolesForArea` for D078; the generic Pathways hub did not. It now shows no D078 role list until an area is selected, then uses only that area's `areaRoleOptions`, clears stale role selection when the area changes, and sends `area_id` with the role-detail request. `areaRoleOptions.test.ts` now verifies no role is available before area choice and that each selected area exposes only its own graph-linked roles.
- Verification after this frontend boundary fix: focused TypeScript check passed; `areaRoleOptions.test.ts` passed (3 tests); Vite production build passed in 38.72s. Build retains existing duplicate-key and oversized-chunk warnings outside this change. No rendered browser acceptance was claimed.

## Screen-entry and explicit role-area guard (2026-10-20)

- Closed the remaining D078 screen-entry bypass: `RoleDetailScreen` now sends
  every D078 role through `D078RoleRoute`, even when a generic link lacks the
  method-selection query. It therefore shows the method/area guidance fallback
  rather than rendering the legacy context-free role body. The API independently
  rejects a missing or non-member `area_id`. The current graph has no direct
  domain-to-role route, so this exception is not applicable to D078 today.
- Generic D078 role navigation without `areaId` now replaces the destination
  with the D078 field picker instead of opening a role URL. A manually entered
  D078 role URL without area context skips the role API request and renders the
  method-aware “Back to methods” guard. Regression tests cover both navigation
  helper behavior, the no-area method-aware fallback, the screen's no-fetch
  deep-link guard, and explicit-area query preservation. The screen test mocks
  the D078 route component; it proves no role fetch/no legacy body, not rendered
  browser acceptance.
- Added a D078 role-route resolver that returns a role only when the requested
  `areaId` is explicit and the selected method/design projection contains that
  role in that exact area. A role name or ID without an area no longer resolves
  into a role page. The no-area fallback returns to the field/method picker;
  it no longer constructs an empty subgroup URL.
- Added 240ms field/area/role screen-entry transitions (12px vertical entry
  for the field and role, 16px horizontal entry for an area). The transition
  uses the existing reduced-motion preference hook and focuses the destination
  heading. Destination headings are marked for assistive-technology heading
  navigation.
- Verification: D078 journey + screen-order tests pass (**12 tests**); focused
  TypeScript check passes. These are code-level checks only. The separate
  rendered browser acceptance, responsive layout check, and full transition
  choreography in section 8 remain open; this entry animation does not close
  those broader gates.
- The field picker now announces the number and names of newly available areas
  after a method/design selection and moves focus to the results heading after
  the specified reveal interval (immediately with reduced motion). Removing a
  choice while results remain announces the updated count; clearing all choices
  leaves focus on the clear control as specified. This is implemented in the
  screen state handler, but does not yet have a rendered interaction test.
- Role-loss Undo in the rendered route and focus behavior after every
  Back/Undo/compare-sheet action remain open.
  Field/area scroll restoration is now based on returning to the retained route
  instance, but still needs browser confirmation. Do not mark
  section 8 complete based on the screen-entry animation or current helper
  tests.

## Route return and hidden-route focus follow-up (2026-10-20)

- Field→area and area→role navigation now mark their origin. The corresponding
  Back controls return through the existing route stack only for those
  in-journey transitions, preserving the prior screen instance and its scroll
  position. Directly opened area/role URLs still use a deterministic parent
  route fallback instead of backing into an unrelated page.
- If an area/role becomes hidden after its last supporting method is removed,
  the replacement field route resets to the picker, announces that the route
  changed, and focuses “How you will investigate”; the ordinary screen-entry
  focus does not steal that focus afterward.
- Verification: the D078 journey and method-picker suites pass (**16 tests**)
  and focused TypeScript passes. Navigation-stack scroll preservation and
  focus are not proven until rendered browser acceptance; section 8 remains
  partial.
- Area-result cards now enter with the specified 220ms ease-out and 30ms
  stagger, and cards losing their last selected-route support fade/translate
  out over 160ms before unmounting. Their Open action is disabled while they
  exit; a card that becomes supported again cancels its exit and returns.
- The journey regression had assumed NVivo↔Thematic analysis was an
  alternative. The current checked-in relationship contract marks that pair
  complementary, so the test now verifies “Useful alongside” and leaves
  comparison to an actual `alternative_to` edge. No graph data was edited.
- Latest focused journey/order/method-picker suites pass (**19 tests**), the
  focused TypeScript check passes, and the Vite production build succeeds.
  The build still reports existing duplicate-key, mixed-import, and oversized-
  chunk warnings elsewhere in the app. These checks are not browser-rendered
  acceptance, so section 8 remains partial pending route-stack and motion QA.

## Local API payload spot-check (2026-10-20)

- Started the local backend and Vite frontend in foreground sessions for
  acceptance. The app/browser control bridge is unavailable in this session:
  its native pipe reports `The system cannot find the file specified`, and the
  browser inventory is empty. No browser interaction was performed.
- `GET /api/career/domains/D078` returned `success=true`, `status=real`, seven
  canonical area records, 19 role records, 14 domain-level resource rows with
  URLs, and 52 domain-owned contextual items. This proves the local endpoint
  serializes those records; it does not prove they render in the learner UI or
  that each role/task joins to its graph nodes.
- `GET /api/career/roles/D078%7Csociologist?area_id=D078%3Asociology-social-anthropology`
  returned `status=real`, the matching sociology area in `areaIds` and
  `areaRoutes`, 15 contextual records (5 tools, 7 knowledge items, 3 skills),
  and six area-owned tool options. The legacy top-level `tools` and `resources`
  arrays on that response were empty; the learner D078 screen consumes the
  typed `contextItems` and method-graph projection instead. This distinction
  still requires rendered confirmation, and the current live records have not
  been exhaustively matched against the Agent 1 graph rebuild.
- The focused UI suite was rerun after the route guard and passes: **5 suites,
  50 tests** (`D078MethodAwareJourney`, screen ordering, method picker,
  relationship panel, and snapshot). This does not close rendered acceptance,
  responsiveness, or screen-reader/focus choreography.
- The role endpoint’s missing/wrong-area rejection remains covered by the
  focused backend tests from the Agent 3 reconciliation (**81 passed**); the
  live check now also confirms both a request with no `area_id` and a request
  pairing Sociologist with Economics return `status=coming_soon`. The valid
  Sociology-area request returns `status=real`. This confirms the API boundary
  does not guess the sole area or accept an unrelated one.
- Reverification after this spot-check: focused backend suite **81 passed**;
  focused D078 TypeScript check completed with no errors. The five focused UI
  suites remain **50/50 passed**. No screenshot or DOM/rendered route evidence
  is available from this computer-use session.
- Frontend/backend local sessions are still running for the user’s manual
  inspection. The graph, SQL, and migrations were not changed.

## Role-route screen regression follow-up (2026-10-20)

- Added component-level tests that render `D078RoleRoute` directly. A role URL
  without an area renders the safe field-return state, and a role paired with
  a non-member area is not rendered. The same role renders only when the
  explicit area is both selected and connected in the current projection.
- Added an interaction test through the role page's learning-plan tray: removing
  the last supporting method navigates to the D078 field route and preserves
  the full previous selection—including area and role—in the Undo query.
  Pressing Undo on the field route reconstructs a role URL carrying that same
  selected area and role ID.
- Current focused verification after these tests: **5 UI suites, 53 tests
  passed**; focused D078 TypeScript check passed. The backend suite remains
  **81 passed**. These are component/API checks, not rendered browser proof.
- The native computer-use pipe and browser inventory remain unavailable, so
  visual layout, real browser history/scroll restoration, measured 44px target
  sizes, and assistive focus movement remain open for browser acceptance.

## Combination-copy regression follow-up (2026-10-20)

- Added an exhaustive `MethodChoicePanel` rendering test for all nine stored
  combination designs. For each design it checks the rendered rationale, how
  the methods work together, condition, limits, selection rule, selected state,
  and that component methods are not silently toggled on as independent
  choices.
- Verification: the focused D078 journey, screen-order, method-picker,
  relationship-panel, and snapshot suites pass (**5 suites, 54 tests**), and
  `tsc --noEmit -p tsconfig.guided-sequence-check.json` passes. This proves
  component-level copy/state rendering for those combinations; it does not
  prove their complete route projections, responsive presentation, or
  browser-level interactions. Those remain governed by the graph projection
  suite and the rendered acceptance pass.
- The layout gap remains unchanged and explicit: the handoff requires a
  persistent 240px desktop spine, a reading column capped at 720px, a right-rail
  tray from mid mode upward, and a mobile bottom-sheet tray. The shared shell
  now implements a 240px vertical desktop spine, 720px-max reading column,
  sticky 300px tray rail, mobile horizontal spine, and mobile modal bottom
  sheet. The small-screen web dock is viewport-fixed; the native dock remains
  at the end of the scroll content and needs a proper persistent placement.
- Verification after the responsive-shell change: focused D078 UI suites pass
  (**5 suites, 55 tests**); focused TypeScript passes; the Vite production build
  succeeds. The browser automation bridge is unavailable, so actual desktop and
  mobile rendering, sticky behavior, tray overlap/safe-area behavior, and
  keyboard/screen-reader focus remain unverified. Section 9 remains partial.

## Shared tray actions and guarded-resource follow-up (2026-10-20)

- Replaced remaining tray action touchables with `RouteButton`: item expand/
  collapse, reorder, remove, compare, add, tray collapse/open, and D078
  route/item removal. Resource destinations in the tray now use
  `ExternalLinkGuard` instead of opening third-party pages immediately; the
  learner sees the destination confirmation first.
- `ExternalLinkGuard` now accepts an optional icon and `hideUnavailable`
  policy, uses `RouteButton` for the destination trigger and Stay/Open
  confirmation actions, and gives those controls at least 44px targets. D078
  passes `hideUnavailable`, so an unusable destination does not leave a dead
  button or filler message. Confirmation copy and control text use sentence
  case and the handoff's readable body/button scale.
- Resource lists and evidence headings are filtered through the same student-
  safe HTTPS rule before rendering. If every destination is unsafe, the
  expanded item leaves those sections blank rather than showing an empty
  heading or a placeholder action.
- Raised tray metadata, layer labels, notices, and animation-pill copy to
  legible sizes; shared button labels use the 16/20 scale. The icon-only tray
  badge uses 13/16.
- Verification: four focused suites passed (**24 tests**):
  `GuidedLearningTray`, `RouteButton`, `ExternalLinkGuard`, and
  `D078LearningPathScreenOrder`. `tsc --noEmit -p
  tsconfig.guided-sequence-check.json` passed. These are component/type checks,
  not browser-rendered proof; section 9 remains partial and overall
  student-facing acceptance remains open.

## Current-state reconciliation against the implementation (2026-10-20)

This reconciliation supersedes contrary *current-state* claims in the initial
section table above. The initial audit remains as history; it is not the source
of truth for these items.

- Section 4: `src/lib/d078Snapshot.test.ts` now passes. It covers valid save and
  reopen data; the old statement that these snapshot tests are failing on
  invalid fixtures is stale.
- Sections 5, 7, 8, and 10: the current `D078MethodAwareJourney.tsx` item card
  renders typed relationship rows, relationship explanations, an item-to-item
  comparison sheet, opening a projected target, and a return-to-source action.
  Current UI tests exercise target opening/return, target scroll positioning,
  route loss while a role is open, and Undo restoration. These features are not
  “not implemented”; rendered-browser focus, navigation, and animation
  acceptance is still open.
- Role-area gate: the current journey test explicitly verifies that a D078 role
  is not resolved/opened until its area is selected, and that an area not
  containing that role is rejected. A direct domain-to-role exception is only
  valid if the route graph explicitly contains such a route; the current
  graph/API reconciliation recorded above reports no direct D078 role route.
  Focused rerun of the three role-gate/fallback cases passed (**3/3**).
- Section 6: `MethodChoicePanel.test.tsx` now checks the rationale, how methods
  work together, conditions, limitations, selection rules, and component
  selection for all nine named combination designs. This is component coverage,
  not full route/render acceptance.
- Combination route projection exposed one type-sensitive assertion in the old
  test: a tool can appear in a combination's `domain_downstream_item_ids` and
  must project to `toolIds`, not `domainItemIds`. The test now checks the
  destination lane from the graph node type. The projection test passes; the
  graph data itself was not edited.
- Current broad UI verification: the 11 current D078-focused suites reported
  **103/104 passing** after the projection assertion was corrected. The
  remaining failure is material, not dismissed as stale: the checked-in graph
  contains both `complements` and `alternative_to` edges for
  `domain-item:d078-nvivo-tool` →
  `area_enrichment_item:d078-soc-thematic-analysis`. The local resolution
  script `apply_d078_method_technique_resolution_2026_10_20.py` lists that pair
  under `REMOVE_FALSE_ALTERNATIVE_PAIRS`, but the generated UI graph still has
  the contradictory alternative row. The UI test correctly still fails on the
  comparison being offered. Do not patch around this in the renderer or alter
  the graph here; reconcile it with the pending graph rebuild, regenerate the
  UI graph artifact from its authoritative inputs, then rerun the complete
  focused suite.
- TypeScript passes, and the web production build succeeds. The build reports
  existing duplicate-key/style and large-chunk warnings outside this D078
  change. The browser automation inventory is still empty, so there is no
  rendered browser acceptance. Overall promotion remains open until the
  graph conflict is resolved, full route/API evidence is checked, and a manual
  rendered pass is completed.

## Non-graph role-entry follow-up (2026-10-20)

- `exploreNav.role` now redirects a D078 role link without `areaId` to the D078
  field picker. The D078 role screen also avoids the API request and renders
  the method-aware return guard when opened directly without `area_id`.
- Verification: `exploreNav.guidance.test.ts` and the focused no-area journey
  tests pass; `RoleDetailScreen.d078.test.tsx` passes and asserts no role API
  call. Seven non-graph UI suites pass (**65 tests**), and the new screen test
  passes (**1 test**). Focused TypeScript check passes; production Vite build
  succeeds with existing unrelated duplicate-key/style and large-chunk
  warnings.
- The one known broad-suite failure remains the graph-source duplicate
  `complements`/`alternative_to` relationship documented above. No graph files
  were changed while Agent 1's handoff is pending.
- The local frontend/backend were not listening on ports 5173/8000 during this
  check, and the computer-use skill instructions are absent from this checkout;
  no rendered-browser claim is made. The production build is not a substitute
  for manually checking the live route.

## Non-graph relationship-action accessibility follow-up (2026-10-20)

- Converted the D078 relationship panel's “Compare options” and “See …” actions
  from raw `Pressable` controls to the shared `RouteButton`. This gives both
  actions the consistent 44px minimum target, focus styling, accessible button
  semantics and typography; the comparison trigger remains available for
  focus restoration after closing the sheet.
- Updated the interaction tests to inspect the `Pressable` style callback in
  the component tree, rather than the already-resolved accessibility host
  style. The focus outline is now verified through the actual focus/blur
  callbacks.
- Verification: eight non-graph UI suites pass (**65 tests**); focused
  TypeScript check passes; production Vite build succeeds. The build still
  reports existing duplicate-key/style and oversized-chunk warnings outside
  this change.
- The broader nine-suite run remains **80/81 passing**. Its one failure is the
  already-documented contradictory graph edge (`complements` and
  `alternative_to` on the same item pair). Per instruction, graph inputs and
  generated graph artifacts remain untouched pending Agent 1's handoff.
- Rendered browser acceptance is still not performed; passing unit tests,
  type-check and production build do not certify live visual behavior.

## Non-graph comparison-sheet motion follow-up (2026-10-20)

- Implemented the comparison/relationship sheet motion from handoff section 8:
  220ms ease-out entrance (24px upward travel with opacity), 180ms ease-in
  exit, and zero-duration motion when reduced motion is enabled. The modal
  remains mounted through its exit transition; controls are disabled while it
  closes, then focus returns to the invoking relationship button.
- The relationship-panel tests now run with reduced motion enabled and verify
  both `Use this` and `Close` complete the close/focus-return flow. The motion
  implementation itself is in the UI component; no graph records were read or
  changed for this repair.
- Verification after the motion change: eight non-graph UI suites pass (**65
  tests**), focused TypeScript passes, and the production Vite build succeeds.
  Existing unrelated duplicate-key/style, mixed-import, and large-chunk
  warnings remain.
- Re-ran the D078 saved-route/report backend suite from `backend/` using its
  project virtual environment: **21 passed**. This confirms the existing
  report filtering/restore repair at unit-test level, not live authenticated
  report delivery.
- Runtime spot-check: local Vite returned HTTP 200 and backend `/health`
  returned `status: ok`. The available computer-use session reports no apps or
  browser surfaces, and the listed computer-use skill file is missing, so no
  rendered screenshot/keyboard acceptance could be performed. Temporary local
  servers used for the reachability check were stopped.
- Re-ran `D078MethodAwareJourney.test.tsx` after the sheet-motion change:
  **14/16 passed**. The two failures depend on graph-projected relationship
  availability for NVivo ↔ thematic/framework analysis (one exposes the
  contradictory relationship classification; the other does not project the
  target into the selected route). They remain intentionally deferred until
  Agent 1's graph handoff; do not bypass the projection gate in the UI.
- The wider mixed run was **80/81** before that isolated rerun; its single
  failure is the same relationship conflict. No graph or SQL artifact was
  edited in this follow-up.

## Direct D078 role-link guard follow-up (2026-10-20)

- D078 roles require an explicit selected area. The API already rejects a
  missing or mismatched area, and `exploreNav.role` already sends internal
  D078 role links without an area back to the D078 field page. A direct/stale
  role URL still rendered the role-route guard shell in place, however, which
  could look like the app had opened a role out of sequence.
- `RoleDetailScreen` now redirects a D078 role URL with no `area_id` to the
  D078 field picker, preserving programme/guidance context and any serialized
  method selection. It does not fetch the role or infer an area. Role URLs
  carrying an area continue through the existing API and selected-route
  checks.
- Verification: `RoleDetailScreen.d078.test.tsx` and
  `exploreNav.guidance.test.ts` pass (**7 tests**); backend D078 API identity
  and area-route suites pass (**16 tests**). This changes navigation behavior
  only; graph data, route evidence, SQL and migrations remain untouched.
- This does not close graph-derived relationship failures or substitute for
  rendered-browser acceptance. Those remain pending the graph handoff and
  manual UI verification, respectively.

## Latest graph reconciliation and route-projection verification (2026-10-20)

This checkpoint supersedes earlier statements in this audit that Agent 1's
graph handoff was pending or that the graph conflict was still unresolved.
The received [`D078_GRAPH_AND_ROUTE_CONTRACT_HANDOFF_2026_10_20.md`](D078_GRAPH_AND_ROUTE_CONTRACT_HANDOFF_2026_10_20.md)
is the current graph/route authority. Its reported contract is 22 methods, 9
named combinations, 7 canonical areas, 19 roles, 116 method-to-area routes,
421 method-to-area-role routes, 53 combination-to-area routes, 195
combination-to-area-role routes, 1,559 nodes, and 566 ready visible typed
relationship edges. The handoff reports exhaustive route closure and zero
ready visible edges with unavailable endpoints.

Local integration now follows the handoff's named-combination boundary:

- A combination with explicit area routes projects those combination-owned
  items, tools, task families, and roles. It does not silently import every
  item from its member methods.
- A member method's own area/role items enter the projection only when that
  method is independently selected. This prevents a combination card from
  implying unreviewed method-specific additions or requirements.
- Regression tests cover combination-only projection and the separately
  selected-member-method case, as well as every declared combination route's
  item/tool IDs. Existing relationship tests ensure the target is navigable
  only while both endpoints are in the active projection.

The prior snapshot type-check defect was corrected by making the route-stack
ID predicate return a boolean. Current verification:

- Focused D078 frontend suite: **6 suites, 95 tests passed** (route projection,
  route stacks, snapshot sanitization, journey, tray, relationship panel).
- Focused backend saved-route/report suite:
  `backend/tests/test_provisioning_guidance_resume.py` — **22 passed**.
- `tsc --noEmit -p tsconfig.guided-sequence-check.json` — **passed**.
- Production Vite build — **passed** (1,388 modules transformed). It reported
  pre-existing duplicate-key/style warnings in unrelated simulator content,
  a mixed static/dynamic import warning, and large chunks, including the
  existing `DegreeSkills` chunk.

Not yet proven: browser-rendered acceptance across the 15 actions in handoff
section 13, responsive layout and real focus/scroll behavior, full authenticated
live D078 payload/report delivery, or manual approval of student-facing
promotion. Automated tests and a successful build are not substitutes for
those checks. These are the remaining acceptance gates; do not reopen the
completed graph route-closure audit or repeat its source review absent a
concrete mismatch.

## Relationship context follow-up (2026-10-20)

- `D078RelationshipPanel` now names both connected items, labels the current Sociology/area/role route, renders a plain-language relationship meaning, and separates an item-specific edge explanation into its own “Why this connection matters” block. It handles the supplied `requires` edge type as useful background and explicitly says it does not block the route; explicit selection remains the only action that adds an item.
- Contract gap: inspected all 566 `typed_relationship_edges` in `src/data/d078MethodAwareUiData.json`. **88** carry the generic “Canonical learning item(s) exist…” explanation instead of an item-specific rationale. The payload has `sourceId`, `targetId`, `relationship`, `explanation`, and route availability, but no route-specific rationale keyed to the selected domain/area/role. The panel suppresses that generic explanation and retains the supplied type meaning, connected-item labels, and route label; it does not invent a rationale. The graph/route owner must supply an item-specific explanation or a typed route-context rationale field before those 88 connections can explain their specific value in each narrower route.
- Verification: the focused relationship-panel suite passes. The combined relationship-panel/journey run reports **45 passing tests and two existing journey failures**: both expect the Thematic/framework analysis target to be projected for NVivo in a route where the current projection excludes it. The panel keeps that target unavailable under the endpoint-in-current-projection rule. Focused `tsc --noEmit -p tsconfig.guided-sequence-check.json` passes. No browser-rendered verification was performed.

## Source-recorded relationship explanation integration (2026-10-20, latest)

- Current workspace verification supersedes the earlier test totals above:
  the nine focused D078 suites pass **108/108 tests**. The saved-route/report
  backend suite passes **24/24 tests**.
- The latest graph handoff supplies 566 route-ready, non-blocking edges. A
  local audit found 33 ready relationship records with a specific explanation
  in their preserved `original_annotation.note`, while the matching canonical
  graph edges still contained generic route-resolution filler (or a generic
  target-crosswalk sentence).
- Updated
  `data/career-mapping/_audit/finalize_d078_relationship_route_contract_2026_10_20.py`
  to copy already-recorded notes onto their matching canonical edges and
  contextualize repeated template wording from each edge's reviewed type and
  the two linked items' reviewed descriptions/use cases. It preserves explicit
  item-specific rationales, records the basis for generated explanations, and
  does not infer prerequisites, route membership, or job-fit claims. The
  compact UI data was regenerated from that graph. No relationship type, route
  membership, requirement lane, ownership, visibility, SQL, or migration was
  changed.
- Regression tests verify the 33 graph-to-UI source-note joins, idempotence,
  and complete explanation coverage across all 566 ready edges.
  `audit_d078_method_route_closure_2026_10_20.py` remains green: 566 ready
  visible edges, zero unavailable endpoints, and 98/98 selectable techniques
  reachable.
- Coverage clarification: the compact UI projection contains all **566**
  route-ready edges, each with source, target, and relationship type. The 33
  source-recorded notes are a provenance subset, not an edge-count or
  visibility limit. **472 edges** that previously used generic repeated
  explanations now describe the exact linked items and relationship using
  their reviewed item context. The other **94** retain their existing specific
  explanations (including the 33 explicit source-recorded notes). The current
  graph and compact projection each contain 566 explanations, zero missing
  explanation fields, and zero recognized template placeholders. The older
  **88 generic** count above is a superseded pre-reconciliation checkpoint; do
  not use it as the current count.
- Still open: rendered-browser acceptance, live payload verification, and
  student-facing promotion. These are acceptance gates, not gaps in the
  relationship explanation field coverage.

## Full focused re-verification after relationship explanation repair (2026-10-20)

- The complete focused D078 frontend set passed: **10 suites, 111 tests**.
- The relationship explanation contract passed: **3 tests**. The focused
  relationship-panel suite passed **31 tests**. The guided-sequence TypeScript
  check passed.
- The production web bundle succeeded when invoked directly through the local
  Vite executable. The npm script itself could not locate the Vite shim; the
  direct build completed with pre-existing duplicate-key/style, mixed-import,
  and large-chunk warnings outside this repair.
- Local frontend `/` and backend `/health` both returned HTTP 200. This confirms
  local service reachability, not authenticated D078 payload completeness.
- Rendered acceptance remains unverified: the computer-use inventory returned
  no browser/app surfaces and the in-app browser was unavailable. The 15
  handoff actions in section 13 still need a real browser session; unit tests,
  HTTP health, and the production build do not substitute for that pass.

## Role-item meaning follow-up (2026-10-21)

- The current UI graph has ordinary role-item links on method-to-area-to-role
  and combination-to-area-to-role routes. The empty `method_specific_role_item_ids`
  arrays mean only that there are no additional items evidenced as specific to
  a method-role pair; they do **not** mean roles have no learning items or no
  supported paths through areas.
- Role cards now describe linked items as ways selected learning may apply to
  role-related work. The copy states that employer duties vary, the list is
  not a universal employer task checklist or job-readiness claim, and “Needed”
  / “Useful” are scoped to the selected learning route. The method-specific
  section appears only when the graph actually supplies such an item and is
  otherwise omitted.
- The updated role rendering regression passes (**1 test**), the explicit
  selected-role route test passes, and the guided-sequence TypeScript check
  passes. A broader run still has one separate presentation-test failure: it
  expects a `d078-spine-scroll-cue` test ID absent from the current spine
  rendering. This is not a role-item or route-projection failure.
- Save/reopen validation now also retains a method-specific role item only
  when its method/area/role route remains selected. A regression temporarily
  injects one such route-backed item into the in-memory graph, verifies it
  survives snapshot validation, then verifies it is removed when its
  supporting method is cleared. The checked-in graph itself remains unchanged
  and currently has no such item rows.

## Exhaustive route-projection follow-up (2026-10-21)

- Added graph-driven regressions across all 22 single-method routes and all 9
  named combinations. They compare projected areas and roles with the source
  route rows and check that declared tasks, items, tools and area-specific
  learning items reach the correct projection lane.
- That audit found a real omission: `area_enrichment_item:*` and
  `area_learning_item:*` records referenced from method/combination downstream
  item fields were being excluded from the projection instead of being placed
  under their owning area. The projector now includes them in that area's
  selectable items for both single-method and explicit-combination routes.
- Verification: the exhaustive route-projection suite now passes (**24 tests**).
  The latest combined route-projection, snapshot, method-specific-item
  persistence, and role-meaning run passes (**4 suites, 35 tests**). The latest
  guided-sequence TypeScript check is **not green**: it reports
  `CompactResourceRow.tsx(56,193): Property 'saveBelow' does not exist` in the
  active visual-layout lane. No graph or SQL data changed in this repair.
- Added an additional selection regression for method-routed area-enrichment
  and area-learning records: a learner can add and remove such an item, and it
  stays non-orphaned while its supporting method/area route is selected. That
  focused test passes. The route-projection suite now has 23 tests in total;
  the 22-test combined count above is the earlier run before this last test.
- A separate save/reopen regression now selects a real graph-declared
  method-routed area item and verifies `supportedD078Selection` retains it.
  The snapshot suite passes **2 tests**, including this area-item path and the
  evidence-gated method-specific role-item path.
- The participatory combination now has a graph-driven regression for all 16
  subsets (none through all four) of its selectable methods. Each projection
  must equal the union of the required participatory method and only the
  learner-selected component methods, including exact area and role sets.
  The focused regression passes; the route-projection suite now has 24 tests.
  The latest combined verification remains 4 suites / 35 passing tests.

## Current journey regression refresh (2026-10-21)

- The integrated D078 journey, layer-order assertions, method picker, and
  relationship panel were rerun together after the role-context copy change.
  Current result: **4 suites, 60 tests passed**.
- The screen-order test had retained the superseded heading â€œWhat this role
  addsâ€. Updated its assertion to the handoff-approved â€œHow your learning may
  apply in this roleâ€. This is a test expectation correction; no screen order
  or visual-layout behavior was changed.
- This is component/unit evidence only. It does not close browser-rendered
  acceptance, live API/report payload verification, or student-facing
  promotion. The known TypeScript issue in `CompactResourceRow.tsx` remains
  separately tracked in the active visual-layout lane and was not changed here.

## My World D078 resume-route repair (2026-10-21)

- The isolated browser acceptance report showed that “Open this version as an
  editable copy” sent a saved D078 route to generic Pathways. My World now
  builds a D078-specific URL from the selected archived snapshot and reopens at
  the saved stop point: field, area, or area-owned role. The URL carries the
  saved method/design and item selection, full route stacks and active stack,
  archive version, and programme/university context. An invalid D078 snapshot
  fails closed with a recovery notice rather than opening the generic path.
- The route builder keeps the snapshot programme key separate from the
  programme IDs passed to the screen, so a saved snapshot keyed by JAMB
  programme identity remains resolvable when it also stores a university
  programme UUID.
- Verification: `src/lib/d078Snapshot.test.ts` passed (**9 tests**), including
  field/area/role destinations, exact selection/stack preservation, archive
  identity, and distinct JAMB/internal programme IDs. The focused guided
  sequence TypeScript check passed, and `git diff --check` reported no
  whitespace errors (only the existing line-ending normalization notice).
- This verifies the URL construction and typed integration, not the rendered
  My World click path. A fresh isolated-browser run is still required. Undo
  notice/restore and mobile tray selection-count/sheet behavior also remain
  open for the journey owner; no claim of full browser acceptance is made.

## Reconciliation after visual and backend/API handoffs (2026-10-21)

This section supersedes the older baseline counts and any earlier checkpoint
that still says the visual or API lane is active. It reconciles current local
evidence; it does **not** grant student-facing approval.

### Handoff reconciliation

- **Visual implementation handoff received.** The visual agent reports the
  programme/theme hierarchy, carried curriculum context, responsive layout,
  resource rows, and typography completed. Local rerun confirms the five
  focused visual suites pass (**42 tests**). The guided-sequence TypeScript
  check and targeted diff check passed in the agent handoff. This closes the
  visual *implementation* lane, not rendered visual acceptance. The checkpoint
  was corrected to say implementation complete and browser verification
  pending.
- **Backend/API and report-export handoff received.** Local rerun of its exact
  backend suite passes (**97 tests**). It covers D078 domain/area/role payload
  ownership and route context, plus HTML/DOCX identity and institution gates.
  No SQL, migration, or database records changed. Port 8000 was unavailable, so
  live API/database behavior remains unverified. The newly added named-
  institution export gate is not specified in the method-aware handoff; verify
  it against the report contract and an undergraduate profile with no attached
  institution before treating it as an approved requirement.
- **Local My World route repair.** The saved D078 snapshot URL builder has
  focused coverage (**9 tests**) for field/area/role stops, selected methods,
  stacks, archive identity, and distinct programme IDs. A fresh isolated
  browser failure artifact dated 2026-10-21 12:58:53Z shows that clicking
  **Edit saved learning plan** reached `/explore/role/D078|sociologist` with the
  saved Sociology/Social Anthropology area, Sociologist role, and Interviews
  selection in both URL and rendered page text. The harness then timed out
  waiting for the field-only phrase “Choose the route from where you are”.
  Therefore the latest evidence contradicts the earlier claim that My World
  reopened generic Pathways; the harness assertion is stale for a saved role
  stop. Check 12 was not recorded in that run, so a corrected rerun is still
  required before calling the full save/reopen acceptance passed.

### Current section disposition

“Implemented/tested” below means focused local evidence exists. It is not the
same as rendered-browser or live-service acceptance.

| Handoff section | Current disposition | Remaining proof or repair |
|---|---|---|
| 0. Governing method-aware rule | Partial | Projection and route context exist; Undo and mobile tray behavior still fail or conflict in browser evidence. |
| 1. Do not build | Implemented in code; browser evidence partial | Re-run the route/forbidden-language checks against the current visual build. |
| 2. Identity join | Implemented and API-fixture tested | Live API is unavailable; keep role/area browser route checks in final acceptance. |
| 3. Projection module | Implemented and focused-tested | Keep its graph-driven method/combination regressions green during integration. |
| 4. Selection state | Partial | Save/reopen route URL now points to the saved role; correct and rerun acceptance. Undo must restore the exact prior role selection. |
| 5. On-screen states | Partial | Component and isolated fixture coverage exists; current browser pass across all required states is incomplete. |
| 6. Worked examples | Implemented at projection-test level | Browser-check representative single, combined, and multi-method routes; projection tests alone do not prove the displayed experience. |
| 7. Screen specification | Partial | Visual components and report export are implemented; relationship/detail/selection flows still need final rendered acceptance. |
| 8. Behaviour and transitions | Incomplete | Browser checks 10–11 previously failed: Undo notice absent and role restoration could not be exercised. Test and repair this behavior. |
| 9. Visual specification | Implementation complete; rendering pending | Re-render current typography, tray placement, tablet/native safe areas, and resource Save at mobile/desktop widths. |
| 10. Relationship behaviour | Implemented and focused-tested; rendered proof pending | Current compact graph has 566 explained route-ready edges and the relationship panel; verify opening, back/focus, alternatives, and comparisons in the live UI. |
| 11. Files and order | Implemented locally | Verify integrated route uses the intended D078 components and no legacy screen re-enters the path. |
| 12. Required tests | Partial overall | Local API (97), visual (42), and saved-snapshot (9) tests pass; browser Undo/mobile tray and full journey acceptance remain. |
| 13. Acceptance | Not accepted yet | The previous 12/15 report is stale for check 12; rerun after fixing the harness assertion and remaining behavior. |
| 14. Student-facing words | Partially verified | Prior fixture passed forbidden-term scan; capture and review the latest visual build, including item relationships and stop-point language. |

### Open work, in execution order

1. Repair the browser acceptance assertion for My World reopening: assert the
   saved stop point (field, area, or role) and its selected methods, not a
   field-only heading. Re-run and record check 12 from the actual My World
   action; do not claim success from URL construction alone.
2. Fix and verify the real Undo interaction: removing the last supporting
   method while inside a role must show Undo; pressing it must restore that
   same area and role. Preserve the six-second window, accessible announcement,
   and reduced-motion behavior.
3. Reproduce and resolve the mobile tray mismatch. The current tray count
   calculation includes both selected D078 methods/designs and added items;
   the report's “0 selected items” therefore needs a fresh current-state check
   to determine whether selection props are missing/stale or the harness read
   the wrong control. Verify opening the tray exposes the selected approach.
4. Perform the visual agent's pending rendered review at desktop, tablet, and
   mobile widths after current changes: typography, tray placement, safe areas,
   resource Save/Open, and 44px actions.
5. Confirm the report-export identity/institution preconditions against the
   controlling report contract. Test an undergraduate D078 learner whose
   profile has no attached institution; printing must not silently turn the
   university choice into a learning-route prerequisite. Keep any required
   report attribution explicit and source-backed.
6. Run the full 15-point acceptance checklist with current artifacts, reconcile
   the report and screenshots, and only then make a student-facing approval
   decision. Live API/database approval remains a separate proof gate.

### Explicit non-regressions and scope

- The API/report changes do not add university selection to the Sociology
  learning route. However, the export endpoint now requires a named attached
  institution (university, secondary school/school, or tutorial centre). That
  export gate is not stated in the D078 method-aware handoff and must be
  checked against the approved report contract—especially for an undergraduate
  profile with no institution attached—before it can be considered correct.
- The focused backend tests use controlled fixtures; no live API or database
  verification was possible. No SQL or migration was changed by either handoff.

### Local reconciliation update (2026-10-21)

- The browser harness correction for reopening a saved role route is present;
  the latest recorded acceptance artifact marks check 12 **PASS**. The prior
  statement that check 12 still needed a corrected rerun is superseded.
- Local Undo state now synchronizes against the full route-provided selection
  payload and clears when that query is removed. A regression covers a reused
  mounted journey receiving and then losing the Undo query. The focused
  `D078MethodAwareJourney.test.tsx` suite passes **24/24**.
- The recorded rendered-browser report still has Undo checks 10–11 **FAIL**
  and the mobile tray check **FAIL** (trigger reports zero selected items and
  the selected-approach sheet does not open). The attempted local harness
  rerun did not refresh its artifact timestamp, so it is not new browser proof.
- Therefore Undo is locally repaired and unit-tested but not yet browser
  accepted. The final full acceptance/reconciliation remains open; do not
  promote the route on the strength of component tests alone.
- The visual checkpoint's former “Agent 1 still active” coordination text is
  superseded by the completed visual handoff; browser rendering remains open.

### Agent handoff and browser failure reconciliation (2026-10-21)

- **Report/export lane:** `D078_REPORT_EXPORT_IDENTITY_HANDOFF_2026_10_21.md`
  records 26 passing focused tests. The product owner's D078-specific rule is
  to require a named institution attached to the profile for export and show a
  clear missing-institution message. This is a report-only requirement; the
  Sociology undergraduate learning route still does not require university
  selection, and the institution is never inferred from the programme. The
  report/export task is locally evidenced by tests; live API and rendered
  report proof remain unverified.
- **Mobile tray lane:** the tray agent reports a focused regression test passes,
  but did not obtain rendered browser evidence because CUA reported no browser
  provider. The existing rendered harness artifact still shows selected count
  zero and the selected-approach sheet closed; the browser-visible tray is not
  accepted yet.
- **Local acceptance task:** the harness previously exited silently before
  writing current evidence because awaited browser/CDP operations had no
  timeout/close handling. Those operations are now bounded and failures write
  diagnostics. Fresh Chrome and Edge runs reach DevTools, then the GPU process
  crashes before page load with Windows `0xC0000022` (`ACCESS_DENIED`) and a
  GPU-cache access error. The browser sandbox was not disabled. Rendered
  acceptance remains unverified until a usable browser session or a machine
  environment that permits the browser GPU process is available.
- The two local work packages remain: (1) finish and browser-verify Undo
  restoration; (2) complete the 15-point acceptance and reconcile final
  results, incorporating agent changes without duplicating their work.

### Local verification and agent reconciliation (2026-10-21, final pass)

- The tray agent's reported selected-method fix is present in the current
  journey test: selecting Interviews updates the tray count to one and opens
  the selected-approach sheet. The focused journey suite passes **24/24**.
  Therefore the earlier mobile-tray failure in
  `artifacts/d078-browser-acceptance/acceptance-report.json` is historical
  evidence from its 13:33 UTC run, not proof that the current code still has
  that bug. A fresh rendered tray result is still required.
- The same current suite passes the Undo state-transition tests, including
  removing the last supporting method, restoring the same area/role, and
  synchronizing a mounted journey when its route query changes. This verifies
  the behavior at component level; it does not replace rendered browser
  acceptance for checklist items 10–11.
- Current checks pass: focused journey tests (**24/24**), guided-sequence
  TypeScript check, acceptance-script syntax check, and targeted
  `git diff --check`.
- The fresh rendered run still cannot reach the page. Edge starts DevTools but
  its GPU subprocess exits with Windows `0xC0000022` (`ACCESS_DENIED`), then
  reports that the GPU process is unusable. The harness records this in
  `artifacts/d078-browser-acceptance-local/acceptance-failure.json`; no
  current-page state was captured. This is an environment/browser launch
  blocker, not a new application failure, and the browser sandbox was not
  disabled.
- Final local disposition: **Undo implementation and tray selection behavior
  are code-level verified; neither is rendered-browser accepted.** The
  15-point browser acceptance remains incomplete (the last actual page run was
  13/15, with Undo checks 10–11 failing before the current Undo repair). To
  close the two local work packages, run the acceptance harness in a usable
  browser session/environment that can start its rendering process, then
  replace the stale acceptance report and inspect the fresh screenshots. Do
  not reinterpret the old 0-count tray screenshot or pre-fix Undo failures as
  current-state results.

### Supersession note for earlier status tables and open-work list

This final reconciliation supersedes the earlier section-disposition table,
open-work list, and first local-reconciliation note above. My World check 12 is
already PASS in the recorded browser report; its earlier assertion-repair task
is closed. The current focused journey tests pass both the selected-tray
count/sheet behavior and Undo restoration. Their previous browser failures are
pre-fix evidence, not confirmed current defects.

The only remaining local acceptance work is a current rendered run of all 15
checks, followed by review of fresh desktop/tablet/mobile evidence. That run
is presently blocked before page load by the browser GPU-process
`ACCESS_DENIED` failure documented above. Do not repeat implementation fixes
already covered by the current tests unless fresh browser evidence exposes a
regression.

The D078 report-export rule requiring a named profile-attached institution is
an explicit product requirement. It is separate from the undergraduate
Sociology route and does not add university selection to that route.

### Expanded local test evidence (2026-10-21)

After the supersession above, the graph projection, route stacks, saved
snapshot, learning tray, and relationship-panel suites were rerun together:
**86/86 tests passed across five suites**. Combined with the focused journey
suite (**24/24**), this is current component/data-flow evidence for selection,
route projection, tray open/count, relationship detail, snapshot persistence,
and Undo state changes. It does not supply the missing rendered-browser
evidence or change the 15-point acceptance status.

The consolidated rerun of those six suites also passes **110/110 tests**.

### Final browser-runtime fallback attempt (2026-10-21)

The acceptance harness was retried with a visible Edge window, then with its
experimental Dawn/Graphite renderer disabled. Both runs still closed the CDP
connection before page load and recorded Edge GPU-process exit
`-1073741790` / Windows `ACCESS_DENIED`; no checklist item or current screenshot
was produced. The optional `--headed` and `--disable-skia-graphite` switches
remain available for a future environment retry. Further renderer-flag changes
are not justified by this evidence; rendered acceptance now requires a working
desktop/browser runtime or a browser environment supplied by the operator.

### IDE-local reconciliation and rerun (2026-10-22)

This entry supersedes the 2026-10-21 browser-runtime conclusion above: headed
Edge is available in the IDE environment, and the harness can render the app.
The new run also exposed that the harness expected the former label
`Continue into Social Sciences`, while the current programme page uses
`See how Sociology continues in this field`. The harness was aligned to the
current label, and the programme-to-field card now has that exact accessible
button name for assistive technology and browser automation.

The earlier rendered report at
`artifacts/d078-browser-acceptance-resume-05/acceptance-report.json` recorded
16/17 checks passing. All 15 numbered desktop checks and reduced-motion passed;
the additional mobile check showed the selected Interviews route in the open
tray sheet but the collapsed floating trigger still said `0 selected items`.
That was a real stale-overlay defect: the dock renderer lived in the outer
detail scaffold, and changing a ref inside the journey did not make that owner
rerender. The dock now re-registers only when the serialized route-stack state
changes, and a regression test confirms its fixed mobile content updates from
zero to one selected item without an update loop.

Current local verification:

- Six focused D078 suites pass: **111/111 tests**.
- `tsc --noEmit -p tsconfig.guided-sequence-check.json` passes.
- Browser harness syntax check and targeted `git diff --check` pass.
- The latest headed browser attempt reached the current programme page and
  exercised the transition, method selection, method combination, and clear
  selection through the first eight desktop checks. It then timed out on a CDP
  evaluation after navigating to the selected area; the captured route showed
  an empty area shell (`Area` title, with no area details). The clean-server
  run did not reproduce the earlier `secondaryUniversityFlow` exception. The
  run did not reach role checks or the mobile tray, so the updated
  floating-trigger fix is test-verified but not yet browser-verified.
  Evidence is in `artifacts/d078-browser-acceptance-resume-10/acceptance-failure.json`
  and its screenshots.

At the time of this browser attempt, the role, save, undo, My World, and mobile
checks had not yet been rerun; this interim status is superseded by the final
local closeout below.

### Final local closeout (2026-10-22)

The remaining local fixes and verification are now complete:

- The mobile fixed tray dock updates its rendered content when the serialized
  D078 route-stack state changes. The stale `0 selected items` trigger is
  corrected; the test asserts the fixed overlay changes from zero to one after
  selection.
- The acceptance harness now targets the current accessible programme-to-field
  control, allows up to 30 seconds for graph-backed browser evaluation, retries
  one transient domain-route shell at the same URL, and waits for the mobile
  slide-up sheet to settle before checking its viewport placement.
- Latest headed Edge report:
  `artifacts/d078-browser-acceptance-resume-15/acceptance-report.json` —
  **17/17 checks passed**: all 15 numbered acceptance checks, mobile tray
  position/selection/overflow, and reduced-motion behavior. It captured 18
  screenshots. This is an isolated browser fixture backed by the checked-in
  graph and curriculum data; it is not live API/database verification.
- All six focused D078 suites pass: **111/111 tests**. The guided-sequence
  TypeScript check, browser harness syntax check, and targeted `git diff
  --check` pass.

This closes the two local work packages: Undo route restoration and the
rendered acceptance/checkpoint reconciliation. The acceptance report is
browser-fixture proof, not proof that the same content is currently seeded in
Supabase or that live backend responses match the fixture. No live API or SQL
write was made.

