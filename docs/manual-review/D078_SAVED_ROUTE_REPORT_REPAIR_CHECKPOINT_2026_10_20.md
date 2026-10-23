# D078 Saved Route and Report Repair Checkpoint — 2026-10-20

## Scope

Implement only D078 saved-route validation/restore and My World/report output correctness. The 2026-10-19 method-aware graph and its student projection remain read-only. No journey UI, route projection, SQL, or migration edits are part of this pass.

## Evidence checked

- `docs/manual-review/D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md`
- `docs/manual-review/D078_METHOD_AWARE_UI_GAP_AUDIT_2026_10_20.md`
- `src/lib/d078Snapshot.ts` and `src/lib/d078Snapshot.test.ts`
- `src/lib/d078RouteProjection.ts` and `src/data/d078MethodAwareUiData.json`
- `src/screens/MyWorldScreen.tsx`
- `backend/services/report_gen.py`
- `backend/tests/test_provisioning_guidance_resume.py`

## Findings and current changes

- Snapshots already hold method IDs, combination IDs, component methods, area/role IDs, and added item IDs; My World can select an archived snapshot and passes its ID to report/export and edit flows.
- Existing snapshot fixtures incorrectly put a foundation into `addedItemIds` and attach a component to a fixed combination. Fixtures now use graph-valid choices; invalid values are separately tested as filtered.
- The report adapter previously rendered saved IDs without checking the selected method/combination route. A D078 report could therefore show a stale area, role, or item and also render generic domain/learning-plan content from a different path.
- `src/lib/d078Snapshot.ts` now filters methods, combinations, selectable components, area, role and learner-added items through the current graph projection. Fixed combinations reject component selections; foundations remain inherited and cannot be added as learner items. My World archive selection and share input use the validated snapshot selection.
- Archive restore resolves the D078 programme key from that snapshot's `reportPathContext` before falling back to the current path. Multiple D078 keys without a matching programme key fail closed instead of choosing the first. The backend report resolver applies the saved programme's JAMB/programme ID in the same precedence.
- The report renderer now derives selected areas/roles/items from current method and combination route rows, checks the selected area/role pair, filters unsupported IDs, and suppresses unrelated legacy stacks/domain paths for D078. Combination labels use canonical student-facing node labels; role labels display in title case.
- Focused tests cover full valid save/reopen state, field-only and area stop points, invalid IDs, ambiguous and selected programme keys, D078 share input, and HTML/DOCX selected and unsupported content.
- An initial accidental edit to `D078MethodAwareJourney.tsx` was reverted. That screen is outside this lane.

## Verification results

- `node node_modules/jest/bin/jest.js --runInBand src/lib/d078Snapshot.test.ts` — 5 passed.
- `python -m pytest backend/tests/test_provisioning_guidance_resume.py -q` — 21 passed (pytest emitted a cache-path permission warning for its existing cache directory).
- Focused TypeScript check for `d078Snapshot.ts`, its test, and `MyWorldScreen.tsx` — passed with temporary `tsconfig.d078-snapshot-check.tmp.json` (removed after the check).
- Whole-repository `tsc --noEmit` — not completed: the run hit Node's 2 GB heap limit. The focused changed-file check passed.
- HTML/DOCX outputs were exercised in unit tests. No rendered-browser or live-backend verification was performed.

## Remaining limitation

No rendered-browser or live-backend verification was performed. Whole-repository TypeScript checking exceeded the default Node heap; the focused changed-file check passed.

## Incremental checkpoint - route serialization and output verification

- Saving a route now stamps a fresh `createdAt`; an existing archive entry no longer carries its old timestamp into a new version.
- Route serialization is exercised through the save builder for three independent branches: a field-only Interviews route, a Sociology area/role route, and a Computational/Digital Social Science route. Their methods, areas, roles, and added items remain attached to their own route keys.
- Selecting a missing explicit archive ID now fails closed. My World keeps the archive visible for recovery, but blocks report/share/download/edit actions until a valid saved version is selected.
- Share and HTML/DOCX output label each route's stop point, including `Field only`, so an area-only/field-only branch is not presented as if it reached a role.
- A backend archive-version test verifies exporting one selected version does not include the other archived version.
- Verification update: focused Jest run covering `d078Snapshot`, `d078RouteStacks`, and `D078MethodAwareJourney` passed (3 suites, 30 tests). Backend `test_provisioning_guidance_resume.py` passed (24 tests; two environment warnings). `node.exe --max-old-space-size=8192 node_modules/typescript/bin/tsc --noEmit --pretty false -p tsconfig.guided-sequence-check.json` passed.
- No browser-rendered or live-backend verification was performed.
