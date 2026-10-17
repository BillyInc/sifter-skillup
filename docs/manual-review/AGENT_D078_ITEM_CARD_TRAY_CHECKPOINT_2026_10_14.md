# D078 Item Card and Tray UI Checkpoint — 2026-10-14

## Scope

This lane is limited to the reusable learning-item card/selection/tray affordance in `ContextualItemList` and its directly related component/test files. It does not include programme, domain, area or role screen layout work. No SQL, staging or commit actions are in scope.

## Initial inspection

- Read `src/components/careerIntelligence/ContextualItemList.tsx` and its focused test file.
- Read the controlling implementation-plan requirements for plain-language item explanations, exact-checkpoint evidence, item relationships, learning links, and reversible preference-setting.
- Read the D078 full-route learning-item audit as context; it is an audit artifact, not authority to expose unapproved content.
- The component filters items to source-backed, same-owner, approved, linked items with a student learning URL before rendering them.
- Cards currently combine item type and requirement level in a compact header and expose a generic “Details and connections” expansion.
- The include control navigates toward the guided plan with `openTray: true`, but the current focused tests need to verify the actual add/remove/reveal behavior and ensure no selected-state dead end.

## Work plan

1. Trace `GuidanceReportButton` and focused tests to determine how selection state and tray reveal are actually wired.
2. Audit the expanded card fields and relationship components for student-safe labels and separation of purpose, route fit, dependencies/complements/alternatives, limits, evidence and learning-resource rationale.
3. Make focused, accessible UI changes only in this component lane, preserving fail-closed review gates and keeping selection as preference rather than mastery.
4. Add/adjust focused tests for reversible selection, tray reveal affordance, field separation, and omission of internal route/audit language.
5. Run the focused test suite and append results, changed files and any remaining integration dependency to this checkpoint.

## Status

### Incremental UI pass in progress

Files edited so far:

- `src/components/careerIntelligence/ContextualItemList.tsx`
  - Scrubs internal task/guardrail/route-note markers before rendering fragments.
  - Separates item type and route importance into distinct visual badges.
  - Adds a larger item heading and accessible, explicit “What this means and how it connects” disclosure control.
  - Places route-fit rationale once, with its destination and applicable limitations, instead of repeating a second downstream-path list.
  - Stops treating a generic resource description as a verified item-to-resource rationale.
  - Uses larger section spacing and clearer heading/body typography.
- `src/components/careerIntelligence/ContextRelationshipSheet.tsx`
  - Replaces raw internal requirement-level/status wording with learner-readable route contribution and evidence/order explanations.
- `src/components/careerIntelligence/ContextualItemList.test.tsx`
  - Updated the fixture to exercise internal `Route note`, `Task`, and `Guardrail` markers. Assertions are not yet updated.

No other screen files have been edited. A test-file replacement attempt failed without changing the file. Tests have not yet been run. Remaining: update focused assertions, add an interaction test for add → tray affordance → remove, run focused tests/typecheck, and append verified results. No SQL, staging or commit actions.
