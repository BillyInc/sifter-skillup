# D078 journey UI repair handoff

Date: 2026-10-20

## Scope completed

Implemented the D078 method-aware journey interactions against
`D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md`, sections 11–14. Work covers the
journey routes, compact resource row, link accessibility-label support, and
focused D078 tests. No graph JSON, taxonomy, `MyWorldScreen`, backend report
code, SQL seed, or migration was edited for this repair.

## Changes

- Method and combination selection continues to project areas and roles from
  `projectD078Route`; combination selection does not select its member methods.
- Removing the last selected route supporting an open area or role returns to
  the field picker. The prior complete selection is carried into an Undo notice
  with a six-second lifetime. Undo routes back to the prior area or role.
- Guidance-path persistence keeps the two response contracts explicit:
  provisioned students return `{ path }`; self-service returns
  `DataState<GuidanceReportPath | null>`. The route snapshot is rehydrated from
  the correct response payload.
- Item cards resolve a resource only from approved records with an allowed
  owner for the current layer. The compact row uses the resource type chip,
  one-line title, and 44px Open control. Missing, unapproved, wrong-owner, or
  linkless resources do not produce an empty Open button.
- The Open control’s accessible label includes resource type, title, provider,
  and access terms while its visible label remains “Open”.
- Focused coverage includes empty selection, Interviews, Spatial, their union,
  interview-and-observation, deselection, hidden-area roles, role return/Undo,
  44px controls, reduced-motion offset, resource approval, and saved-route
  rehydration.

## Validation

Focused command:

```text
node.exe node_modules/jest/bin/jest.js --runInBand src/lib/d078RouteProjection.test.ts src/screens/careerIntelligence/D078LearningPathScreenOrder.test.ts src/screens/careerIntelligence/D078MethodAwareJourney.test.tsx src/components/careerIntelligence/CompactResourceRow.test.tsx
```

Result: **4 test suites passed; 21 tests passed**.

TypeScript command:

```text
node.exe --max-old-space-size=8192 node_modules/typescript/bin/tsc --noEmit --pretty false --skipLibCheck --incremental --tsBuildInfoFile "$env:TEMP\sifter-d078-typecheck.tsbuildinfo"
```

Result: exit code 1 from the existing out-of-scope error at
`src/screens/admin/AdminExplorePage.tsx:253`: `"status"` is not assignable to
`AccessibilityRole`. The check reported no D078 errors.

`git diff --check` reported no whitespace errors. Git did emit existing line
ending conversion warnings for some tracked screen files.

## Still requires manual/rendered review

Unit tests do not prove rendered acceptance. On the app, verify the field
picker focus and announcement after return, Undo navigation to the same role,
responsive compact-resource layout, and reduced-motion transitions. Confirm
the live payload contains approved resources for the visible D078 owners before
calling resource rendering accepted.

The working tree also contains unrelated dirty/untracked migration, seed, and
D078 graph-data artifacts. They were not edited as part of this UI repair and
were left untouched.
