# Sociology theme abilities and readings — Codex design

**Date:** 2026-10-22  
**Audience:** Codex, changing the existing Sociology programme reading screen.  
**Status:** Design only. Do not apply SQL. Do not invent universities, programmes, subjects, tools, or outcome claims.

The student surface is the theme. An outcome answers “what will I be able to do in this theme?” Course codes stay in the source record. Readings sit on the same card, small, with the reading type beside the title.

## 1. Decision

Keep outcomes inside the theme. Do not add a second section, a second page, or a list headed by course codes.

Each theme card has three student parts:

1. **What this part of the degree is about** — the stored theme narration already in `DegreeSkills`.
2. **What you will be able to do** — a short set of ability lines that together cover every source-backed outcome in that theme.
3. **Reading** — every reading the Sociology theme layer already attaches to that theme, visible on the card. The attachment list is `docs/manual-review/SOCIOLOGY_PROGRAMME_THEME_RESOURCE_MATRIX_2026_10_08.md`. All 14 active themes have at least one reading there.

The 14 theme names, the course-to-theme map in `programmeCurriculumThemes.ts`, and the stored narration stay as they are. Section 4 is the card. Abilities share that card with the theme. They are not a second stack under it.

## 2. What the screen does now

`DegreeSkills` in `src/components/careerIntelligence/DegreeSkills.tsx` is the reading screen on `ProgrammeDetailRefinedScreen`.

- Themes are presentation groups. `programmeThemeForCourse` assigns each course once. The student-facing titles are already “Ideas and foundations”, “People, groups and society”, and the other twelve. They are not course codes.
- “What you will be able to do” then rebuilds the theme as course cards. Each card’s heading is the course title, and every outcome is a full sentence (`abilitySentence`).
- The local contract has **34 courses and 236 source-backed outcomes**. Average student sentence length is about 115 characters. The largest themes are Ideas (41 outcomes, 32 distinct sentences), People (40), Research (27), African and Nigerian societies (24), and Inequality, gender and social problems (24).
- Ideas repeats the same sentences under more than one course. SOC 101 and SOC 105 share outcome wording, so the open list shows those sentences twice, once under each course title.
- A resource button is rendered only when `resourcesForTheme` returns a row. An empty theme shows nothing.
- `resourcesForTheme` keeps a row when `isStudentResource` passes, `resourceType` is `programme_reading`, a URL is present, and `sourceProvenance.theme_keys` contains the theme key. A target name that equals a course code or course title is the only other match.
- Programme-level rows reach the screen through `_student_guidance_resources` in `backend/routes/career_routes.py`: `ownershipScope` `programme`, `reviewStatus` `approved_guidance_v1`, `dataState` `source_backed`.

## 3. Ability lines

### What the student sees

The label on the ability list is:

> You will be able to

On a wide card the list sits in the right column, level with the title. On a narrow card it follows the reading band. Section 4 is the order. Up to **four** ability lines show. Each line is one or two sentences, 14px. A text button appears when the theme has more than four lines:

> See the rest of what you will be able to do

That control reveals the remaining ability lines for this theme. It does not reveal course codes, course titles, or the raw outcome list.

A quiet line under the abilities, 13px, muted:

> These abilities are drawn from the programme record for this theme.

### How a line is allowed

Add a checked-in ledger:

`data/career-mapping/_audit/sociology_theme_student_abilities_2026_10_22.json`

Each record:

```json
{
  "themeKey": "ideas",
  "lineId": "ideas-founding",
  "studentLine": "You will learn how Sociology emerged and who its early thinkers were.",
  "outcomeIds": ["SOC 101:2", "SOC 105:2"]
}
```

Rules for every line:

- `themeKey` is one of the 14 keys already on the card.
- `studentLine` is a shortening or a join of the stored `studentText` values for `outcomeIds`. It uses words those outcomes already use.
- Every source-backed outcome whose course maps to the theme appears in exactly one line. A repeated sentence across two courses is one line and lists both outcome ids.
- A line may not name a tool, method, job, or place that none of its outcomes name.
- Largest themes may have up to eight lines. Smaller themes should land at four or fewer. Four lines show before the “See the rest” control.
- Until a theme’s ledger covers every one of its outcomes, that theme shows its **distinct stored sentences**, still without course codes or course titles, four at a time. Distinct means the same `studentText` appears once inside the theme.

The ledger is the synthesis. The client does not paraphrase with a model at read time.

## 4. Card layout

The current card is a theme essay with a second stack of bordered course cards underneath it. The abilities read as an appendix, and the readings sit behind a button that is omitted when the matcher returns nothing. Rebuild the same card as one surface with two jobs: what this theme is, and what the student will be able to do. Readings stay in that surface.

Remove the inner course card, the inner outcome card, and the “View learning resources” button. Remove the accessibility string “course outcomes for {theme}”.

### Closed card

The grid stays. A closed card is one tap target, min height 72px, padding 12px, one border.

- Title, 16px semibold.
- The stored one-line `description` from `THEME_META`, 14px, two lines at most.
- A quiet fact line, 13px: “{ability count} abilities · {reading count} readings”. Both counts come from the lines and readings this design attaches to the theme. The reading count is on the closed card, so an attached reading is visible before the card opens.

### Open card

One border. No card inside the card. Abilities are a list, not boxes.

**Wide, when the open card is at least 560px across** — two columns inside the card, aligned to the top, gap 16px:

| Left, about 42% | Right, about 58% |
|---|---|
| Title | Label “You will be able to” |
| Narration, two lines, then “See more” for the rest of the stored paragraph | Up to four ability lines |
| Reading band | “See the rest of what you will be able to do” when more lines exist |

The ability list shares the card’s top with the title. It sits beside the theme, in the same surface.

**Narrow, under 560px** — one column, in this order:

1. Title.
2. Narration, two lines, then “See more”.
3. Reading band.
4. Label “You will be able to”, then the ability lines.

On a phone the reading band comes before the ability list, so a long list cannot push the attached readings below the fold. The abilities still follow the theme sentence directly. They are the body of the card.

Ability lines use a hanging indent and a 13px gap. Body text is 14px / 20px. There is no border, no course title, and no course code on a line. The first four lines show; the rest open in the same list.

### Reading band

Label: “Reading”.

Render every row the matcher attaches to this theme. The band is part of the open card. It is not a disclosure, and it is not omitted when the count is greater than zero.

Each row is one line, min height 44px:

- Type chip, then the title, then “Open”.
- Chip words stay the stored scope labels: “Open foundation reading”, “Recommended reading”, “Nigerian courseware reference”, and the other values from `programmeReadingLabel`.
- Title is `targetName`. A theme-guidance row uses its stored `learningLabel`.
- “Open” uses the theme-specific URL (`programmeReadingUrl` or the guidance `learningUrl`).
- The row has no second card. “Why it is included” opens from the row, using the stored `theme_rationales` and `theme_descriptions` for that theme.

A theme with several attached readings shows all of them in this band. African and Nigerian societies, People, and Research are the longer bands. Compact rows keep that list short.

The closed-card fact line uses the same count the open band renders.

### Ideas and connections

“Explore the ideas and connections” remains the place for the worked example, the limitation notes, and the relationship sentence. A guidance item that already has a learning link also appears in the Reading band, so the link is on the card. The longer explanation stays behind the existing control.

## 5. Show the readings already attached to each theme

The Sociology theme readings are stored. The local coverage audit records zero active themes missing a migration URL. The screen’s job is to show those attachments.

Source of the attachment:

- `backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql`, provenance `guidance_layer = sociology_programme_v1`.
- `theme_keys` names the themes. The same file stores `theme_urls`, `theme_descriptions`, and `theme_rationales` per theme.
- The student-facing list of what each theme supports is the matrix cited above.

`resourcesForTheme` must treat a row as attached when any of these is true:

- `theme_keys` is an array containing the theme key.
- `theme_keys` is a JSON string of that array. Parse it, then match. A seed that stores `"[\"research\"]"` as one string currently fails the array check and the whole button disappears.
- `theme_urls` or `theme_descriptions` has a key equal to the theme key.
- A visible `themeGuidance` or `themeRelationships` row for this `themeKey` has a learning URL. Research carries three of these (evidence types, method choice, ethics) in `backend/seed_sociology_programme_theme_guidance_2026-10-08.sql`.

Match keys without case sensitivity. Deduplicate by the theme-specific URL. Use that URL on “Open”, so Ideas opens the theory section and People opens the culture section of the same book.

Rows that name no theme stay off the theme cards. Giddens and Sutton is associated only with Ideas and foundations: the stored ninth-edition ISBN is `978-1-5095-3922-2`, and Wiley's matching product page identifies chapter 3 as “Theories and Perspectives.” The optional theme note must not imply that the book is prescribed or covers every Ideas outcome. `NUC CCMAS: Sociology` from `backend/migration_guidance_all_programmes_2026-09-12.sql` has no `theme_keys` and remains off the theme cards. Giddens stays off every theme other than Ideas and foundations.

If the programme payload contains `sociology_programme_v1` rows and the band is empty, the matcher is wrong. Fix the parser and render the band. A read-only count can confirm the rows: Sociology resources whose `guidance_layer` is `sociology_programme_v1` and whose `theme_keys` are non-empty. Do not apply SQL from this task. Do not drop a themed row because a later seed also inserted the CCMAS hub page.

## 6. Behaviour

### Reconciliation update — 2026-10-22

The stored ninth-edition record (ISBN `978-1-5095-3922-2`) is mapped only to **Ideas and foundations**, based on Wiley's matching product page and its chapter 3 locator, “Theories and Perspectives.” The reading remains optional and is not claimed as a prescribed course text. `NUC CCMAS: Sociology` remains unthemed. See `SOCIOLOGY_MAIN_READINGS_HANDOFF_2026_10_22.md` and `migration_sociology_giddens_ideas_theme_2026-10-22.sql` for the reconciliation and apply order.

| Action | Result |
|---|---|
| Look at a closed theme card | Title, one-line description, ability count, resource count, and a visible `View N resources` action when approved theme resources exist |
| Open the card on a wide screen | Narration on the left, ability list on the right, reading band on the left under the narration |
| Open the card on a narrow screen | Narration, then every attached reading, then the ability list |
| See the rest of what you will be able to do | Remaining ability lines in the same list |
| See more | The rest of the stored narration |
| View N resources | Expands that theme and reveals its approved resource rows; no resource action is rendered when the theme has none |
| Open | The theme-specific URL, through the existing external-link guard |
| Explore the ideas and connections | Example, limitations, and relationship copy. The learning link is already in the Reading band |
| See all 14 learning areas | Unchanged |

Reduced motion removes height animation. Opening a card moves focus to its title.

## 7. Theme-resource action and live-data contract

The closed theme card exposes a separate `View N resources` action when at least one approved, student-safe row is explicitly mapped to that theme. Activating it opens the theme card and shows the resource links, their scope, and the item-specific reason for inclusion. If no mapped resource is present, render no resource button and no “not available” placeholder. Do not assign a general book to a theme merely to fill the space.

### Reconciliation — 2026-10-23

- The student UI now exposes the resource action on the closed theme card rather than requiring the learner to guess that opening the whole card will reveal links.
- The local resource audit passes for 14 active themes and 25 mapped URLs in `backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql`.
- A read-only live programme API check returned four approved Sociology `programme_reading` rows, but their `sourceProvenance` was empty, so none had the theme keys required for safe placement. This confirms a live payload/data-migration gap, not a reason to weaken the theme matcher. The API was reached after allowing the local backend to make its normal read-only database request; no SQL was applied.
- Do not rerun the 2026-09-11 migration blindly: its Sociology resource insert is not an idempotent upsert and the live database already contains matching resource names. The scoped repair is generated by `data/career-mapping/_audit/generate_sociology_theme_resource_repair_2026_10_23.py` into `backend/migration_sociology_theme_resource_repair_2026-10-23.sql`. It updates the exact 18 canonical Sociology programme-reading identities, inserts only missing identities, rejects duplicates, and checks approved source-backed coverage of all 14 active themes. Run it after the 2026-09-11 ownership/resource migration and the 2026-10-22 exact-edition Giddens correction; it does not change curriculum records or apply itself. After manual application, re-read the Sociology programme payload and confirm non-empty theme keys before calling the live display complete.

A theme whose attachment list is empty after the matcher in section 5 shows one muted line in the band: “No reviewed reading is stored for this theme yet.” The 14 Sociology themes in the matrix are not that case. Their attached readings render.

## 8. Files

Edit:

- `src/components/careerIntelligence/DegreeSkills.tsx` — one-surface card, ability list beside the theme on wide screens, reading band for every attached theme row, `theme_keys` parsing.
- `src/components/careerIntelligence/DegreeSkills.test.tsx` — course-code headings absent; ledger coverage; every matrix attachment visible; string `theme_keys`.
- `data/career-mapping/_audit/sociology_theme_student_abilities_2026_10_22.json` — the reviewed lines. Ship a theme only when its outcome ids are complete.

Do not edit:

- `programmeCurriculumThemes.ts` course-to-theme map.
- The D078 graph or `d078MethodAwareUiData.json`.
- Matcher rules.
- Existing broad SQL seeds/migrations; use the scoped generated repair above rather than replaying the 2026-09-11 insert-only migration.

## 9. Tests

- A closed card shows the ability count and the reading count.
- An open wide card places the ability list beside the narration. An open narrow card places the reading band before the ability list.
- People, groups and society renders ability lines and does not render `SOC 102`, `SOC 104`, or any other course code. The open card contains no nested outcome card.
- A sentence shared by SOC 101 and SOC 105 appears once.
- A theme whose ledger misses an outcome id falls back to distinct stored sentences and still leaves course codes in the source record only.
- Research and evidence shows each attached reading: OpenStax research sections, the Haralambos methodology reference, NOUN research methodology, and NOUN social-science statistics, each with its type chip. The three research guidance links are in the same band.
- A resource with `theme_keys: "[\"research\"]"` shows on that theme.
- Ideas and foundations shows the OpenStax theory section, the Haralambos theory reference, and the optional Giddens/Sutton ninth-edition chapter 3 association, with its edition-specific “Why included?” rationale.
- `NUC CCMAS: Sociology` stays off theme bands; Giddens/Sutton stays off every theme other than Ideas and foundations.
- The first paint still shows five themes and “See all 14 learning areas” when fourteen themes have courses.

## 10. Acceptance

A reviewer on Sociology can:

1. See a reading count on a closed theme card, then open the card and see every reading that matrix attaches to the theme, with the type beside the title.
2. On a wide window, read the theme on the left and the ability lines on the right, inside one card, with no course code and no box around each ability.
3. On a narrow window, see the readings before the ability list.
4. Open a reading and land on that theme’s stored URL.
5. Open the rest of the abilities and still see no course titles.
