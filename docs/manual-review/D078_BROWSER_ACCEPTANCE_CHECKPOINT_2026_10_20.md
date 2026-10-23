# D078 browser acceptance checkpoint — 2026-10-20

## Handoff status

**Active owner: this Codex goal (browser acceptance lane).** Rendered-browser acceptance is **in progress**, not complete. I am implementing and running the section-13/14 acceptance task in `D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md`, including the isolated CDP browser harness, desktop/mobile rendered evidence, and the 15-point checklist/report. Local work should not duplicate or overwrite this lane's harness, acceptance report/screenshots, or checkpoint; coordinate any needed shared-file edits first.

Scope is rendered verification and only browser-demonstrated visual/layout repairs. Do not change route logic, graph, SQL, taxonomy, learning content, requirements, or API contracts. Live authenticated/API verification remains outside this isolated fixture run and must be identified separately.

## Isolated learner context

The acceptance fixture displays the programme path for **Sociology at the University of Lagos**. It uses the synthetic student **Amina Okafor** with username **`amina.okafor`** (fixture email `amina.okafor@example.test`). These are test-only display details; no student account is created and no live university or student record is read or changed.

## Work done

- Built `scripts/d078BrowserAcceptance.cjs`, a CDP browser harness using the integrated Vite app and isolated API fixtures derived from the checked-in D078 graph and Sociology curriculum contract. No live account or database writes were used.
- Added `test:d078-browser-acceptance` in `package.json`.
- Updated `web/src/reactNative.ts` to provide `AccessibilityInfo.announceForAccessibility` through a polite live region; the integrated D078 route otherwise threw a runtime `TypeError` when entering the area flow.
- Fixed a browser-demonstrated overlap in the My World saved-route card by stacking the route label and method/item summary and allowing both to shrink/wrap in `src/screens/MyWorldScreen.tsx`.
- Captured the latest acceptance report and 18 screenshots under `artifacts/d078-browser-acceptance/`. The report lists only screenshots captured by its run; older/intermediate PNGs may remain in the folder.

## Latest browser results — 2026-10-21 10:39 UTC

Command: `node.exe scripts/d078BrowserAcceptance.cjs *> .tmp/d078-acceptance-final-complete.log`; child exit code 0. Edge 155 on `http://127.0.0.1:5174`. **12/15 numbered checks pass**; reduced-motion passes; the stricter mobile tray check fails. The report records the University of Lagos and synthetic student Amina Okafor (`amina.okafor`).

| # | Result | Evidence |
|---|---|---|
| 1. Open Sociology, reach all 14 themes, continue into field | PASS | `desktop-01-field-themes.png`; all 14 canonical themes visible after Continue. |
| 2. Confirm no area card before selection | PASS | Rendered area set empty; `desktop-01-field-themes.png`. |
| 3. Select Interviews; four exact areas, Economics/Computational/Human Geography absent | PASS | `desktop-02-interviews.png`; exact area set recorded in report. |
| 4. Deselect Interviews; four areas disappear | PASS | Empty set recorded; `desktop-02-interviews-deselected.png`. |
| 5. Select Spatial; two areas | PASS | `desktop-03-spatial.png`; exact two-area set recorded. |
| 6. Add Interviews beside Spatial; union, no Economics | PASS | `desktop-04-interviews-spatial-union.png`; six supported areas and no Economics. |
| 7. Clear methods; return to State A | PASS | Empty areas and picker state; `desktop-04-clear-to-no-selection.png`. |
| 8. Select Interview and observation; five declared areas, member toggles off | PASS | `desktop-05-interview-observation-combination.png`; exact five-area set and toggles recorded. |
| 9. Open visible area and role; unsupported hidden-area role absent | PASS | `desktop-06-sociology-area.png`, `desktop-07-sociologist-role.png`; Sociologist present, Statistician absent. |
| 10. Remove supporting method while on role; picker and Undo notice | FAIL | `desktop-08-undo-notice.png`; picker returns but Undo notice/button is absent. |
| 11. Press Undo; return to same role | FAIL | `desktop-09-role-route-after-undo-gap.png`; no Undo action rendered, so restore could not be exercised. |
| 12. Save, leave, reopen same path | FAIL | `desktop-10-my-world-saved-route.png`, `desktop-11-editable-copy-opened-from-my-world.png`, `desktop-12-saved-role-route-query-restored.png`. My World opens generic Pathways; direct route-query restoration does not prove the My World action works. |
| 13. Select/Open/Back/Save/resource Open controls are 44px buttons with keyboard focus | PASS | `desktop-02-interviews.png`, `desktop-06-sociology-area.png`, `desktop-07-sociologist-role.png`, `desktop-11-resource-row.png`; measured targets are at least 44×44 CSS px and focus is visible. |
| 14. Learning resource is a compact row with type chip beside title | PASS | `desktop-11-resource-row.png`; NVivo row is flex, 1019×58 CSS px, chip/title vertical positions differ by 2 px, Open control is 44 px high. |
| 15. Visible sentences follow section 14; internal IDs/status terms absent | PASS | Full rendered role-page text passes the forbidden-term scan; `desktop-07-sociologist-role.png`. |

Additional task gates: desktop right rail is visible in `desktop-07-sociologist-role.png`. Mobile has no horizontal overflow, but Interviews is selected while the tray trigger still says “0 selected items”; selected approaches do not open in the sheet (`mobile-01-field.png`, `mobile-02-learning-tray.png`). Reduced-motion passes (`desktop-11-reduced-motion.png`; no active route-transition animation under `prefers-reduced-motion: reduce`).

Report: [acceptance-report.json](../../artifacts/d078-browser-acceptance/acceptance-report.json). The report lists screenshots captured by this run; earlier PNGs can remain in the folder. This is isolated fixture evidence only: `liveApiVerified: false`, `accountCreated: false`; no live account or database was touched.

## Superseded initial-run notes

Earlier runs had interim startup and test-selector failures. They are retained only in the failure artifacts; use the latest acceptance report and checklist above.

## Resume instructions

1. Keep the remaining failures reported. If any are addressed, stay within the browser acceptance lane and only make a visual/layout change when the browser evidence demonstrates that defect; do not alter journey/resume logic in this lane.
2. Check syntax with `node.exe --check scripts/d078BrowserAcceptance.cjs` before changing the harness.
3. Reuse the isolated browser only after verifying current processes/ports. Vite for this task used port 5174; a separate Vite on 5173 is unrelated.
4. Run `node.exe scripts/d078BrowserAcceptance.cjs` in PowerShell and inspect the generated report and desktop/mobile images. Do not claim live API or full acceptance from the isolated harness.
5. The remaining failures require the local journey/My World owner: fix Undo notice reinitialization on web route replacement, make My World editable-copy reopen the saved D078 route, and reconcile the selected Interviews state with the mobile tray's zero-selection counter. Do not solve these in this browser-acceptance lane by changing route or tray behavior.

## Known modified files

- `scripts/d078BrowserAcceptance.cjs` (new harness)
- `package.json` (test script)
- `src/screens/MyWorldScreen.tsx` (browser-demonstrated saved-route summary wrapping fix)
- `web/src/reactNative.ts` (web accessibility adapter runtime fix)
- `artifacts/d078-browser-acceptance/` (acceptance report, captured screenshots, isolated saved-path fixture)
- This checkpoint

The worktree contains many pre-existing/unrelated modifications. Do not revert or overwrite them; inspect `git status --short` before making further changes.

## Local-agent coordination

This document is the current progress handoff for the active rendered-browser acceptance goal. Leave its files and generated evidence intact while this lane is running. The active files owned by this lane are the browser harness, its `package.json` command, the web accessibility adapter fix needed for the integrated journey to render, the My World wrapping repair demonstrated by the browser, acceptance artifacts, and this checkpoint. Other D078 work can continue in separate files, but should not reimplement or replace the browser acceptance/report work described here.
