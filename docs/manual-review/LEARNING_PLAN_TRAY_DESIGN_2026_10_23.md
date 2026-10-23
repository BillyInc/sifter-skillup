# Learning plan tray — Codex design

**Date:** 2026-10-23
**Status:** Design only. Do not apply SQL. Do not invent programmes, fields, areas, roles, or learning items.
**File to change first:** `src/components/careerIntelligence/GuidedLearningTray.tsx`
**Selection control to share:** a new checkbox used by the tray and by the programme and domain select controls on the page.

The tray stays docked to the bottom of the page. The page above it remains visible and usable. What changes is the control and the order inside the tray.

## 1. What is wrong now

The open tray lists a route title, then “Your selected approaches”, then foundations, then a mixed block called “Your selected learning, by route level”. Programme and domain are a context line, not checked rows. Domain content, area content, and role content are not nested in that order.

On the page, programme and domain selection is a circle plus a word:

- `GuidedFieldSelectionScreen.tsx` `DomainStepRefined` draws Feather `circle` when off and `check` when on, next to the words “Add secondary” and “Remove”.
- `MethodChoicePanel.tsx` and `D078MethodAwareJourney.tsx` use a `RouteButton` whose visible label is “Select”, “Selected”, “Add this”, or “Added”.
- University rows in `ProgrammeDetailRefinedScreen.tsx` use Feather `circle` / `check-circle` plus the word “Selected”.

A check is a square. A circle is a radio. The word “Selected” is not the control.

## 2. Samples used

- [Material 3 bottom sheets](https://m3.material.io/components/bottom-sheets/overview): a surface attached to the bottom, a drag handle, a peek height, and a taller height. The page behind stays in place.
- [Material 3 lists](https://m3.material.io/components/lists/guidelines): one row is a leading control, a title, and supporting text. The row is the hit target.
- [Apple sheets](https://developer.apple.com/design/human-interface-guidelines/sheets): two or three resting heights. Dragging between them does not replace the page.
- Material checkbox, not radio: 18–24px square, 2px corner radius, empty when off, filled with a tick when on. No circular outline. No word inside the box.

## 3. Placement

Keep the current dock.

| State | Height | What the student sees |
|---|---|---|
| Icon | 54px, right side | Folder icon, “Learning plan”, count badge |
| Peek | about 168px | Handle, title, programme check, domain check |
| Half | about 46% of the viewport, max 420px | Peek, plus domain content and area rows |
| Tall | about 78% of the viewport | The full tree, including role content, and Save / Print |

The page is never covered completely. A dim layer is not used. Tapping the page does not close the tray.

The drag handle is a 32×4px rounded bar, centered, 8px from the top of the tray. Drag up one step. Drag down one step. A downward flick from Peek returns to the icon. Reduced motion jumps between heights with no spring.

Existing mode names may stay in code (`icon`, `compact`, `mid`, `full`). The visible labels become Peek, Half, and Tall. Remove the three word-buttons that currently switch size. The handle is the size control. Keep the minimize icon (44×44) that returns to the icon state.

## 4. The check

One component, `PlanCheck`, used on the page and in the tray.

- Box 22×22, radius 4, 2px border.
- Off: empty box, border `colors.borderRole.strong`.
- On: fill `colors.accentRole.action`, white tick, Feather `check` at 14px.
- Pressed: 44×44 hit area, the box stays 22px.
- The accessible name is “Add {name} to your learning plan” or “Remove {name} from your learning plan”. `accessibilityRole="checkbox"`. `accessibilityState.checked` matches the box.
- The visible row does not say “Select”, “Selected”, “Add this”, “Added”, “Add secondary”, or “Remove”.

Replace these visible controls with `PlanCheck`:

- Programme add control on the programme page, when the page offers adding the programme to the plan.
- Domain row in `DomainStepRefined` (the circle at the end of the card).
- Domain “Add this” / “Added” buttons on `DomainDetailScreen` and `D078MethodAwareJourney`.
- Area and role add controls on the area page, the role page, and `SubgroupStepRefined` / `RoleStepRefined`.
- Each learning-item add control in `ContextualItemList` and the tray’s “Add to this route” button.

“View domain”, “View area”, and “Open” stay as text buttons. They are navigation, not selection.

University choice stays a single choice. That control may remain a circle because only one university is open at a time. This document does not change it.

## 5. Order inside the tray

One route is one tree. The order is fixed.

1. **Programme** — check, then the programme name.
2. **Domain** — check, indented 16px under the programme, then the domain name.
3. **Domain content** — indented 16px under the domain check. Methods of research, foundations, and domain learning items.
4. **Area** — check, indented 32px, then the area name.
5. **Area content** — indented under that area check.
6. **Role** — check, indented 48px under its area, then the role name.
7. **Role content** — indented under that role check.

Repeat 4–7 for each area the route actually has. A role is drawn under the area it belongs to, never in a separate “Role learning” bucket above the areas.

```
[x] Sociology
    [x] Social Sciences
        Methods of research
        · Surveys and statistics
        Foundations
        · Frame a researchable social question
        Domain learning
        [x] Explain evidence and its limits
    [x] Social Research and Evaluation
        Area learning
        [x] Compare a survey and an interview
        [x] Research analyst
            Role learning
            [x] Write a short findings note
```

Names in that sketch are shape only. Render the names already on the route. If a level is absent, skip it. Do not invent a programme, domain, area, role, method, or item to fill a gap.

### Programme row

- Check.
- Title, 15px semibold, one line, then ellipsis.
- Supporting line, 13px, muted: the university or school name when the route has one. No second line when it does not.
- Checking the programme keeps the route. Unchecking it asks “Remove this programme and everything under it?” Confirm removes the route. Cancel leaves the check on.

### Domain row

- Same check.
- Title is the domain name.
- Supporting line, 13px: “What you carry from the programme into this field.”
- Unchecking the domain removes the domain, its areas, and its roles from this route after the same confirm. The programme check stays on.

### Domain content

Three blocks, in this order, only when that route has rows for them.

| Block | Icon | Rows |
|---|---|---|
| Methods of research | `compass` | Each selected method or design. Check on the right of the row. |
| Foundations | `book-open` | The foundation labels already carried on the route. No check. These stay while the domain is checked. |
| Domain learning | `layers` | Each item whose context level is domain. Check on the row. |

A method row’s supporting line is the stored student meaning, two lines, then ellipsis. Domain learning uses the item label and its lane (“Needed”, “Useful”, “Optional”) as the supporting line.

### Area

- Check and area name.
- Supporting line: “Learning added for this area.”
- Area content lists only items whose context level is area.
- Icon for an area item: `git-branch`.

### Role

- Check and role name, under its area.
- Supporting line: “Learning added for this role.”
- Role content lists only items whose context level is role.
- Icon for a role item: `briefcase`.

Unchecking an area removes that area, its items, and its roles. Unchecking a role removes that role and its items. The domain and programme checks stay on.

## 6. Row anatomy

Every checked row is one horizontal line, min height 48px.

| Slot | Size | Content |
|---|---|---|
| Check | 22px | `PlanCheck` |
| Icon | 18px | Feather icon for the level, `colors.accentRole.action` |
| Text | flex | Title 15/20 semibold. Support 13/18, `colors.textRole.secondary` |
| Remove | 44px | Only on a learning item or method, Feather `x`, quiet. The check already removes the level. Do not also show “Remove”. |

Level icons:

| Level | Icon |
|---|---|
| Programme | `book` |
| Domain | `compass` |
| Area | `grid` |
| Role | `user` |
| Method | `search` |
| Foundation | `book-open` |
| Domain item | `layers` |
| Area item | `git-branch` |
| Role item | `briefcase` |

Type color is `colors.textRole.primary` for titles and `colors.textRole.secondary` for support. Do not use `FontSize.xs` or `FontSize.sm` for these sentences. Eyebrow “Learning plan” is 13px bold, muted.

The tray surface is `colors.surface.raised`, 1px `colors.borderRole.strong`, radius `Radius.xl` (14) on the top corners only, shadow `Shadow.md`. Sections inside the tree have no extra cards. A 1px `colors.borderRole.subtle` rule separates programme, domain content, and each area. Indent is the only nesting cue.

## 7. Peek, half, and tall

**Peek.** Handle, “Learning plan”, the route count, the programme row, the domain row. If there is no programme name yet, the programme row reads “Choose a programme on the page”. If there is no domain yet, the domain row reads “Choose a field on the page”. Those two lines are not checks.

**Half.** Peek, then domain content and the area rows. Area content and roles are one line each: “{n} items” and “{n} roles”, with the area check. They open in Tall.

**Tall.** The whole tree. Area content and role content are expanded. Bottom action row, sticky: Save, Print / download, Share summary, Build a separate route. Show a button only when that callback already exists. Buttons are 44px tall, labels 15px. Save is the filled action. The others are quiet.

The icon state is unchanged: folder, “Learning plan”, count. The count is the number of checked rows, not a mix of route fragments.

## 8. Behavior

### Instant check

Pressing the check for a programme, field, area, or role updates two things in the same turn, before any network call:

- the square on the page turns on
- the matching row is checked in the tray, and Peek opens

The name and id used for that row are already on the page. The tray does not wait for `saveGuidancePath`, `getProgramme`, `getDomain`, `getRole`, or the area request.

These must not appear as a gate in front of the check:

- “Saving your route…” in `D078MethodAwareJourney` (`saving` is set only inside Save and Print today, and the notice replaces the tray message while it is true)
- the `ActivityIndicator` in `GuidedFieldSelectionScreen` that renders whenever `persist` sets `saving`
- “Opening...” on a programme selection
- “Loading area details...” or “Loading role details...” as a reason to hide the new tray row

Opening an area or a role may still navigate. The selection travels in the route query and in the local plan state, so the destination tray paints the checked row on its first frame. The page body may keep its own loading state for the detail text. That spinner stays in the page body. It does not cover the tray and it does not delay the check.

The save runs after the check is visible. A failed save leaves the check on. A quiet line may say “Held on this device. It will save when you are online.” Save and Print keep their own status. That status never replaces the tree and never has to finish before a check is drawn.

| Action | Result |
|---|---|
| Check on the page | The same row appears checked in the tray in the same turn. Peek opens. No spinner and no “Saving…” before that row. |
| Uncheck in the tray | The page control for that same id turns off. |
| Uncheck on the page | The tray row turns off. |
| Confirm remove of programme or domain | Child rows leave with the parent. |
| Drag handle | Next height. |
| Minimize | Icon state. The plan is kept. |
| Empty plan | The current empty bar: folder, “Your learning plan is empty”. No tree. |
| Two routes | A 13px line above the tree: “Route 2 of 2”. Text buttons “Previous route” and “Next route”. Only the active route is editable. The inactive route is summary-only until the student switches. |
| Several routes | The existing warning stays: routes remain separate in the saved report. |
| Reduced motion | No spring. The “Added” pill appears and disappears without travel. |

Do not reorder rows by drag. The tree order is the product order. The up/down arrows inside the current tray go away.

Foundations have no check. They are context carried by the checked domain.

## 9. Copy

Use these labels. Do not add a second heading that repeats them.

- Learning plan
- Programme
- Field
- Methods of research
- Foundations
- Domain learning
- Area
- Area learning
- Role
- Role learning
- Save
- Print / download
- Share summary
- Build a separate route
- Remove this programme and everything under it?
- Remove this field and everything under it?

“Domain” may remain the code id. The student word on the row is “Field” only in the supporting line “Choose a field on the page”. The checked row itself uses the domain’s stored name, not the word “Domain”.

## 10. Files

Edit:

- `src/components/careerIntelligence/GuidedLearningTray.tsx` — tree, heights, handle, remove arrows and size word-buttons.
- `src/components/guidance/PlanCheck.tsx` — the square check. New file.
- `src/screens/careerIntelligence/GuidedFieldSelectionScreen.tsx` — `DomainStepRefined`, `SubgroupStepRefined`, `RoleStepRefined`. Replace the circle and the select words with `PlanCheck`.
- `src/components/careerIntelligence/MethodChoicePanel.tsx` — method row check. The visible “Select” / “Selected” label goes away.
- `src/screens/careerIntelligence/D078MethodAwareJourney.tsx` — “Add this” / “Added” becomes `PlanCheck` on domain, area, and role items.
- `src/components/careerIntelligence/ContextualItemList.tsx` — item add control becomes `PlanCheck`. The type icon (`layers`, `tool`, `award`) stays as the row icon, separate from the check.

Do not edit the D078 graph, the theme ledger, or SQL.

## 11. Tests

- Programme row is above the domain row. Domain content is above the first area row. A role row is below its area, not in a top-level role bucket.
- A programme, field, area, or role check updates the page box and the tray row before any save promise resolves. The test uses a save that does not resolve. The row is still checked. No “Saving your route…” and no tray spinner are present.
- Off state has no Feather `circle` and no visible “Selected” or “Add this” on programme and domain rows.
- On state exposes `accessibilityRole="checkbox"` and `checked: true`.
- Unchecking the domain in the tray calls the existing remove for that domain and does not remove the programme.
- Peek does not render role content.
- A route with no area renders programme, domain, and domain content only.
- `GuidedLearningTray.test.tsx` and `MethodChoicePanel.test.tsx` updated to the new labels.

## 12. Acceptance

A reviewer can:

1. Leave the tray at the bottom and still scroll the page.
2. See a square check, not a circle and not the word “Selected”, on the programme and on the field.
3. Open the tray and read programme, then field, then field content, then each area and its content, then each role and its content.
4. Turn a check off in the tray and see the same item turn off on the page.
5. Check a programme, field, area, or role and see it in the tray immediately, while a slow save is still running.
6. Drag the handle from Peek to Half to Tall without the page disappearing.
