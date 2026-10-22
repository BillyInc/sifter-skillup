# D078 Agent 1 visual layout checkpoint

**Updated:** 2026-10-21
**Owner:** Agent 1 (current)
**Status:** Visual implementation complete; rendered browser verification pending (handoff received 2026-10-21).

## Coordination status for local

The visual implementation lane has been handed off. Its code and focused tests are complete; the listed files contain its changes. This checkpoint remains the evidence record for those changes. Rendered checks at current desktop, tablet, and mobile widths are still required before visual acceptance.

The remaining work is rendered visual verification. The separate browser-acceptance lane owns its harness and acceptance report; coordinate with that owner for captures and do not independently change its harness.

## Scope

Agent 1 is working on the student-facing visual hierarchy and responsive layout for the Sociology programme → Social Sciences → area → role journey, using:

- `D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md`
- `D078_METHOD_AWARE_UI_GAP_AUDIT_2026_10_20.md`

This lane covers headings and readable text sizes, separation of programme themes/curriculum/outcomes, context carried into the domain, clear learning-item sections, responsive page/card layout, and compact per-resource rows. It does not own graph/route data, route projection or selection logic, relationship behavior, saved-route/report behavior, My World, SQL, or migrations. Leave Guided Learning tray behavior to its owner.

## Work already in progress

- `DegreeSkills` presents programme themes and curriculum/outcomes in distinct sections and uses the handoff's typography and spacing hierarchy.
- `ProgrammeCurriculumCarryForward` carries programme context into the domain journey with distinct theme and detail groupings.
- The shared `DetailScaffold` and D078 journey styles provide clearer responsive content hierarchy and page/card spacing.
- D078 journey actions use responsive primary-button sizing; area/role actions fill narrow columns and use desktop sizing on wide layouts. Tray sheet sizing is capped on tablet widths as part of layout only.
- `CompactResourceRow` displays one resource per compact row, with a type chip beside its title and a visible, touch-sized Open action. The resource itself remains omitted unless it has an approved student resource URL.
- Focused component tests cover programme content hierarchy, responsive layout helpers, resource-row structure, and touch-target styling.

## Files currently owned by this lane

These files have visual/layout changes or focused tests in the shared worktree. **Please do not redo, overwrite, revert, or concurrently edit these same files as a separate implementation.** If a change is needed, coordinate with Agent 1 first.

- `src/screens/careerIntelligence/D078MethodAwareJourney.tsx`
- `src/screens/careerIntelligence/D078MethodAwareJourney.test.tsx`
- `src/components/careerIntelligence/CompactResourceRow.tsx`
- `src/components/careerIntelligence/CompactResourceRow.test.tsx`
- `src/components/careerIntelligence/DegreeSkills.tsx`
- `src/components/careerIntelligence/DegreeSkills.test.tsx`
- `src/components/careerIntelligence/ProgrammeCurriculumCarryForward.tsx`
- `src/components/careerIntelligence/ProgrammeCurriculumCarryForward.test.tsx`
- `src/components/careerIntelligence/DetailScaffold.tsx`
- `src/components/careerIntelligence/DetailScaffold.test.tsx`

The worktree contains many other modified and untracked files owned by other D078 tasks. Do not use a broad reset or clean operation. The current status of the files above was checked on 2026-10-20; this checkpoint itself is also a new file.

## Verification recorded so far

Command:

```powershell
node.exe node_modules/jest/bin/jest.js --runInBand src/screens/careerIntelligence/D078MethodAwareJourney.test.tsx src/components/careerIntelligence/CompactResourceRow.test.tsx src/components/careerIntelligence/DegreeSkills.test.tsx src/components/careerIntelligence/ProgrammeCurriculumCarryForward.test.tsx
```

Result: **4 suites passed, 37 tests passed.** Jest printed environment warnings from Expo constants/Privy setup and an icon `act(...)` warning; the run exited successfully.

The shared responsive scaffold test was run separately:

```powershell
node.exe node_modules/jest/bin/jest.js --runInBand src/components/careerIntelligence/DetailScaffold.test.tsx
```

Result: **1 suite passed, 2 tests passed.** Together, the current focused presentation checks are **5 suites and 39 tests passed**. The scaffold run had the same Expo/Privy and icon `act(...)` environment warnings.

TypeScript command:

```powershell
node.exe node_modules/typescript/bin/tsc --noEmit -p tsconfig.guided-sequence-check.json --pretty false
```

Result: **passed** (exit code 0).

`git diff --check` on the current visual-lane source/test files also passed; Git printed only its line-ending normalization notices for existing CRLF/LF worktree files.

## Typography audit follow-up

The handoff's type table specifies metadata at 13/18. A code audit found the D078 journey's shared `meta` style was still 14/20, even though title, section, body, summary, item type, resource chip, and button styles matched their specified roles. Changed `D078MethodAwareJourney.tsx` metadata to 13/18 and extended its existing item-card type-scale test to assert that value on the step metadata.

Fresh verification after that source change:

- `D078MethodAwareJourney.test.tsx`: **1 suite, 21 tests passed**.
- `tsc --noEmit -p tsconfig.guided-sequence-check.json --pretty false`: **passed**.
- Consolidated current presentation run, including the journey, resource row, programme themes, programme carry-forward, and shared scaffold: **5 suites, 39 tests passed**.

## Expanded-card spacing follow-up

Rechecked the compact-card specification: the collapsed card gap is 6px, while blocks inside the expanded card must be separated by 8px. The card shell already used 6px, but `detailSections` also used the 6px token. Changed only the expanded-block container to 8px and extended the D078 item-card test to locate and assert the outer expanded section container. The first test attempt selected the inner heading/body group; corrected the test to find the intended 8px container and reran it successfully.

Latest validation after the spacing change:

- `D078MethodAwareJourney.test.tsx`: **1 suite, 21 tests passed**.
- `tsc --noEmit -p tsconfig.guided-sequence-check.json --pretty false`: **passed**.
- `git diff --check` for the affected files: **passed**.

## Secondary-action width follow-up

The refreshed desktop captures showed the area/role “Back to…” secondary action stretching to the full reading-column width, contrary to the handoff rule that secondary buttons hug their content. Kept the shared `RouteButton` unchanged and added a D078-local `alignSelf: "flex-start"` style to standalone secondary actions in the area/role journey, route-context controls, Undo, and related-area navigation. The area screen test now asserts the resolved Back button style.

Verification for this specific follow-up:

- Focused area visual test: **1 passed** (`20` other journey tests skipped by the name filter).
- Guided-sequence TypeScript check: **passed**.
- The area and role tests assert that their standalone Back and “From your route” actions hug their labels.
- Full D078 journey suite after the local action-style changes: **1 suite, 21 tests passed**; TypeScript passed again.

## Responsive primary-action width follow-up

The rendered area capture also showed desktop “Open role” buttons filling the whole card. The wide helper previously set only `minWidth: 160`, so the button still stretched across the parent column. Updated `d078PrimaryActionStyle` so wide web primary actions align to the start with a 160px minimum; narrower layouts keep `width: "100%"`. The area component test supplies the projected role rows and checks every rendered Open role action fills the narrow column. The wide helper assertion checks the hug-content style.

Verification:

- Focused area responsive-action test: **1 passed** (the other 20 tests were filtered out).
- Full D078 journey suite after correcting the multi-role assertion: **1 suite, 21 tests passed**.
- Guided-sequence TypeScript check: **passed**.
- A first full run failed because the new test used `getByRole` despite multiple supported roles; changed it to assert every role action, then reran successfully.
- The desktop screenshots available when this fix was first recorded predated the primary-action change. New desktop captures have since appeared; their review is still outstanding. Mobile rendered acceptance is also outstanding.

The browser-acceptance artifact directory has since received desktop captures through 2026-10-20 19:32. The visual-layout lane has now reviewed the 19:25 area/role captures and the 19:31 programme themes capture. The desktop area/role view shows the spine, reading column, and plan rail together; Back/route-context secondary actions hug their content, and Open role actions are sized to their labels. The programme capture shows the theme and carry-forward sections in the current desktop layout. The browser-acceptance lane also recorded a failure artifact, so these captures are visual evidence for the states shown, not an all-points acceptance pass. At that checkpoint there was no mobile capture; an older 390px capture has since been found, but there is still no tablet capture or fresh mobile capture after the scroll-affordance change.

These are unit/component checks, not rendered acceptance. CUA exposed no browser or app surface in this session. A separate in-progress browser harness checkpoint exists at `D078_BROWSER_ACCEPTANCE_CHECKPOINT_2026_10_20.md`; its rendered checks, screenshots, and outstanding harness issues belong to that browser-acceptance task. Coordinate with that owner and do not duplicate or alter its harness as part of this visual lane.

## Read-only screenshot review

Inspected the existing `desktop-01-field-themes.png`, `desktop-06-sociology-area.png`, and `desktop-07-sociologist-role.png` captures in `artifacts/d078-browser-acceptance/`. The desktop captures show the programme themes in a scrollable content column, the area and role content between the journey spine and learning-plan rail, and distinct item/role cards. They are useful visual evidence for desktop structure only; they do not prove exact type measurements, mobile wrapping, touch behavior, or tray placement on mobile. No mobile capture or completed `acceptance-report.json` is present in the artifact directory.

The refreshed desktop area/role captures dated 2026-10-20 19:21 were generated after the D078 secondary-action style change. Visual review confirms the area/role Back and “From your route” buttons now hug their content. They predate the later wide primary-action alignment change, so the wide “Open role” sizing still needs a fresh capture.

The latest read-only review found desktop captures from 2026-10-21 09:49 in `artifacts/d078-browser-acceptance/`. They show the programme theme and carry-forward presentation and confirm the area/role primary and secondary action sizing. The report also includes a mobile placement check and separate reduced-motion result. These artifacts do not establish tablet/native safe-area behavior or a full all-points acceptance pass; the harness and report remain with the browser-acceptance lane.

The fresh 2026-10-21 10:21 mobile captures are 390px wide. `mobile-01-field.png` confirms the one-column view, collapsed learning-plan dock, and no horizontal page overflow. It renders the theme-colored right-chevron added to make the step spine's horizontal continuation visible. The capture also reveals the cue overlaps the visible edge of the "An area" label, so I reserved the cue's 28px width beside the scroller. That spacing fix was made after the capture and still needs rendered review.

`mobile-02-learning-tray.png` visibly shows the learning plan opening as a bottom sheet over a dimmed page. The browser report records a 390x844 viewport, zero horizontal overflow, a 52x52 collapsed dock, `modalOpened: true`, and a PASS for mobile placement/overflow. The sheet remains within the viewport with plan-size controls visible. This verifies the shown mobile Edge emulation state, but not tablet or native safe areas.

On the earlier continuation, `cua.getState()` returned no browser/app surfaces and `cua.createBrowserTab("iab", "http://127.0.0.1:5174/", { visible: true })` returned `Browser is not available: iab`. The separate Edge/CDP acceptance harness is assigned to its browser-acceptance lane, so it was not launched or modified here.

## Focused re-verification (2026-10-21)

Reran the five presentation suites after reviewing the current artifacts:

```powershell
node.exe node_modules/jest/bin/jest.js --runInBand src/screens/careerIntelligence/D078MethodAwareJourney.test.tsx src/components/careerIntelligence/CompactResourceRow.test.tsx src/components/careerIntelligence/DegreeSkills.test.tsx src/components/careerIntelligence/ProgrammeCurriculumCarryForward.test.tsx src/components/careerIntelligence/DetailScaffold.test.tsx
```

Result: **5 suites passed, 39 tests passed**. Jest emitted existing non-fatal Expo Constants/Privy setup and icon `act(...)` warnings.

```powershell
node.exe node_modules/typescript/bin/tsc --noEmit -p tsconfig.guided-sequence-check.json --pretty false
```

Result: **passed (exit code 0)**. `git diff --check` on the visual-lane source, test, and checkpoint files also passed; Git only reported its existing LF-to-CRLF normalization notices.

## Mobile spine affordance follow-up (2026-10-21)

- Based on the 390px capture where the platform did not visibly show a scrollbar, added a theme-colored right-edge chevron on narrow layouts. The 10:21 mobile capture confirms that the chevron is visible. It also showed it masking part of the next step label, so the scroller now reserves 28px beside the cue.
- The horizontal indicator remains enabled; assistive technology receives the label "Learning journey steps" and hint "Scroll horizontally to see all five steps." The focused D078 test renders at 390px and checks the cue and 28px reservation.
- Focused D078 journey suite after the spacing adjustment: **1 suite, 21 tests passed**. Guided-sequence TypeScript check passed (exit code 0), and `git diff --check` passed. Non-fatal Expo Constants/Privy and icon `act(...)` warnings remain.
- The 10:21 mobile captures and 10:22 acceptance report confirm the tray-open bottom sheet and no horizontal page overflow, but were generated before the 28px reservation. A new mobile capture is needed to review the corrected spine label. No tablet or native safe-area capture is present.

## Still in progress

Agent 1 is continuing the visual audit against the handoff and gap-audit checkpoints. Desktop structure and the fresh 390px Edge emulation are reviewed; the latter confirms one-column flow, no horizontal overflow, collapsed dock, and opened bottom sheet. The chevron is visible, and a follow-up spacing fix to keep it clear of step labels still needs rendered review. Tablet and native safe-area behavior remain unverified. The 2026-10-21 10:22 acceptance report is **incomplete**: checks 1-9 and 15 pass; checks 10-14 fail; separate mobile placement and reduced-motion checks pass. The report uses isolated fixture data and is not live API verification. It also could not render a learning-resource target row, so rendered resource layout remains unverified despite component tests. Coordinate with the browser-acceptance owner and preserve its harness while continuing this visual lane.

## D078 scaffold Back-control sizing follow-up (2026-10-21)

- The shared `DetailScaffold` breadcrumb Back control remained 28px high with 9px text on D078 screens, even though the D078 handoff requires 44px Back controls and 16/20 button labels. D078 screens still use `DetailScaffold` for this outer navigation control while the journey body supplies its own route-level Back action.
- Applied a D078-only style when `wideContent` is enabled: 44px minimum height and 16/20 label. Generic screens retain their previous breadcrumb styling.
- Added a focused regression to `DetailScaffold.test.tsx` for the target size and label typography.
- Verification: `DetailScaffold.test.tsx` passed (**1 suite, 3 tests**); the guided-sequence TypeScript check passed (exit code 0). Existing non-fatal Expo/Privy and icon `act(...)` warnings appeared in Jest.
- This is unit/component evidence. The available browser screenshots predate this style adjustment; rendered confirmation remains with the browser-acceptance lane. Tablet and native safe-area review, and a fresh mobile capture after the spine cue spacing change, remain open.

## Compact resource Save placement follow-up (2026-10-21)

- The handoff allows Save beside the compact resource title only when the row has enough width; otherwise Save belongs on the next row. `CompactResourceRow` previously always put Save inline.
- Added a measured-width layout rule: below 500px, Save renders beneath the chip/title/Open row; at 500px or wider, it remains inline. The resource title stays at 14/18 in both cases and Open/Save retain their 44px targets.
- Added a component regression that sends narrow (390px) and wide (560px) layout measurements and checks the Save placement.
- Verification after the final style change: `CompactResourceRow.test.tsx` and `DetailScaffold.test.tsx` passed (**2 suites, 6 tests**); the guided-sequence TypeScript check passed (exit code 0). Jest printed existing Expo Constants/Privy setup and icon `act(...)` warnings.
- Rendered verification remains open. The existing resource-row capture predates the measured-width Save behavior, and no capture with an actual Save action at mobile and desktop widths is recorded.
- A fresh computer-use inventory returned no available apps or browsers, so Agent 1 could not capture the post-change layout in this session. The separate browser-acceptance lane retains ownership of its harness and screenshots.

## Programme heading hierarchy follow-up (2026-10-21)

- Reviewing the latest rendered D078 screenshots showed that `DegreeSkills` and the programme-to-field carry-forward still used the shared `SectionLabel` treatment (10px, uppercase) for major programme-content headings. Replaced those usages with sentence-case 20/26 headings and semantic heading roles, limited to these programme learning components.
- Added focused style assertions for the programme curriculum and the carry-forward/area-role context headings.
- Verification: `DegreeSkills.test.tsx` and `ProgrammeCurriculumCarryForward.test.tsx` passed (**2 suites, 14 tests**); guided-sequence TypeScript passed. Existing Expo Constants and icon `act(...)` warnings remain.
- The latest browser-acceptance artifacts were generated after the earlier Back/resource-row changes. Read-only review of the 11:17–11:21 captures confirms the horizontal spine cue no longer covers the visible step label, the 390px page has no horizontal overflow, and the learning-plan panel opens as a viewport-anchored bottom sheet. Desktop captures show the spine, reading column, and plan rail; the browser report measures the resource row at 1019×58px with the title visible and its 44px Open control. The rendered target-size and compact-row checks now pass (#13 and #14); mobile placement and reduced-motion checks pass.
- The latest isolated-fixture browser report still fails #10–12 (Undo and saved-route restoration), which are interaction/persistence work outside Agent 1's presentation lane. Live API verification is not implied by the fixture. The new 20/26 programme heading styles were applied after these screenshots and still need a fresh rendered capture. Tablet/native safe-area behavior and a resource row with Save shown at mobile and desktop widths also remain open.


## Latest browser report reconciliation and resource-row width follow-up (2026-10-21)

- The newest browser-acceptance report/artifacts were written at 11:37–11:39, before the 12:00 programme-heading edits. Its #13 target-size and #14 compact-resource checks pass; its mobile check is marked **FAIL** with `trayPanel: null`, `modalOpened: false`, and selected-approach text not visible.
- The paired `mobile-02-learning-tray.png` visibly shows the learning-plan panel open over the dimmed field page. The screenshot and report disagree, so this is recorded as conflicting evidence rather than a tray pass. Tray behavior and its harness remain outside this lane.
- The report's rendered resource row is 1019×58px, with a visible title and 44px Open action. It does not exercise Save. Set the compact row itself to `width: 100%` so its measured-width Save layout uses the available card-column width. Added the width assertion; the component test passes narrow (390px) and wide (560px) placements.
- Verification after this width adjustment: `CompactResourceRow.test.tsx` **1 suite, 3 tests passed**; the guided-sequence TypeScript check passed. The preceding programme-heading tests passed **2 suites, 14 tests**.
- A fresh rendered capture is still needed after the 20/26 programme-heading edits. Save placement with a real resource on mobile/desktop and tablet/native safe-area behavior remain unverified.

## Programme typography alignment follow-up (2026-10-21)

- Aligned the programme theme, course/outcome, ability, detail, and action-label text in `DegreeSkills` and `ProgrammeCurriculumCarryForward` with the D078 handoff scale: 20/26 for major section headings, 16/22 for card/course titles, 16/24 for body copy, and 16/20 for action labels.
- Updated focused style assertions for the theme headings and supporting copy.
- Verification on the current worktree: `DegreeSkills.test.tsx` and `ProgrammeCurriculumCarryForward.test.tsx` passed (**2 suites, 14 tests**); `tsc --noEmit -p tsconfig.guided-sequence-check.json --pretty false` passed (exit code 0). Existing non-fatal Expo Constants and icon `act(...)` warnings appeared in Jest.
- The newest available rendered report remains `artifacts/d078-browser-acceptance/acceptance-report.json` from 2026-10-21 11:39. It is older than these typography edits. Its mobile tray screenshot and report disagree about whether the panel opened, so tray visibility is not claimed as verified; tray interaction/harness remains with its owner. A fresh rendered capture of the updated typography and tray placement is still needed, along with tablet/native safe-area review.

## Current focused presentation re-verification (2026-10-21)

- Re-ran the full focused D078 visual presentation set against the current worktree: journey, compact resource row, programme themes, programme carry-forward, and detail scaffold. Result: **5 suites, 41 tests passed**.
- The guided-sequence TypeScript check passed: `node.exe node_modules/typescript/bin/tsc --noEmit -p tsconfig.guided-sequence-check.json --pretty false` (exit code 0).
- A direct rendered review could not be started because CUA returned `Browser is not available: edge`. The newest saved browser report remains older than the latest typography edits; tray screenshot/report disagreement, tablet/native safe-area behavior, and rendered resource Save placement remain open. Unit tests do not close those checks.

## Carried programme course title scale (2026-10-21)

- The course-title label in the field's programme-to-domain carry-forward was 16/23, one pixel above the handoff's 16/22 card-title scale. Aligned it to 16/22 and added a D078 component assertion using a graph-matched Sociology outcome.
- Verification: the focused regression passed; the full five-suite visual set passed (**5 suites, 42 tests**); guided-sequence TypeScript passed (exit code 0); targeted `git diff --check` passed.
- Attempted a fresh local render: the web app responds at `/`, but CUA cannot connect to Edge. A headless Edge capture only reached the welcome/login page and is not D078 rendered evidence. The browser acceptance harness and its fixture data were left untouched. Tray rendering, tablet/native safe areas, and post-typography screenshots remain for browser review.
