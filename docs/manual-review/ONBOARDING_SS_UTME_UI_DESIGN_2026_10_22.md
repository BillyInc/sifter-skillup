# SS1, SS2, and SS3/UTME onboarding — Codex design

**Date:** 2026-10-22  
**Audience:** Codex, improving the existing student onboarding. Do not add a second onboarding tree.  
**Status:** Design only. Do not apply SQL. Do not invent universities, programmes, subjects, or requirement text.

This design starts from the screens that already exist and changes the order and the words. The search, the subject catalogue, the programme preview, the university list, and the Sociology → D078 route stay the ones already in the app.

## 1. What already exists

| Step | Current file | What it does now |
|---|---|---|
| Account type | `src/screens/onboarding/AccountTypeGate.tsx` | Six cards: SS1, SS2, SS3, JAMB candidate, Undergraduate, Educator |
| SS1 and SS2 setup | `src/components/onboarding/SeniorSecondaryExploreSetupForm.tsx` | School, then stream, then one of two intents |
| SS3 and JAMB setup | `src/components/onboarding/JambSetupForm.tsx` | Three doors: know both, know the programme, or find a programme from subjects |
| Subject list | `src/components/onboarding/LiveSubjectMultiSelect.tsx` and `src/lib/subjectCatalogOrdering.ts` | Stream **reorders** the live catalogue. It does not hide other subjects. SS1/SS2 search is off |
| After setup | `src/screens/OnboardingFlow.tsx` `nextHrefForStartingPoint` | A resolved programme id opens the programme preview. Subjects open the admission browser |
| Programme choice | `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx` | Choosing a programme opens its preview. Universities are not expanded on the search screen |
| Preview and universities | `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx` | Preview first. “View universities” opens the offering list. A selected university shows its own UTME and O-level text beside the general programme text. Two or more universities can be compared on that page |
| Downstream | `ProgrammeDomainTransition` in the same screen | Domain cards, including D078 when that link is on the programme, appear after a university is selected for secondary and JAMB journeys |
| Programme-to-programme compare | `src/screens/careerIntelligence/ProgrammeCompareScreen.tsx` | Compares up to four **programmes**, not universities. Do not use it as the university comparison |

Streams already stored in `src/lib/waecSubjects.ts`: Science, Commercial, Arts, Technical / vocational. The picker must keep using the live subject catalogue and its stream tags. Do not replace that catalogue with the static arrays in `waecSubjects.ts`.

One confirmed JAMB name in the local audit files is `Nursing/Nursing Science`. Do not add other nursing names in code. Any other variation must come from the live programme search for the words the student typed.

## 2. The journey

```text
Account type
  SS1 or SS2
    school → stream → subjects in that stream, plus an optional programme search
    → programmes those subjects can open, or the programme family they typed
    → programme preview
    → View universities
    → one university’s O-level and UTME requirements
    → downstream, including D078 when this programme links to it
  SS3 or JAMB
    school or tutorial centre
    → one of three doors
       I don’t know the programme
       I know the programme, not the university
       I know the programme and the university
    → the same preview, university, requirements, and downstream
```

SS1 and SS2 are preparing. They are not told they have already met a university’s admission rule. SS3 and JAMB are checking a nearer decision. The same programme page serves both. The class travels in the existing guidance context (`class_name`, `stream`, `userType`).

## 3. SS1 and SS2

Keep the school field first. Keep English Language and Mathematics fixed. Keep the minimum of five O-level subjects.

### Stream

After the school is chosen, the student chooses a stream. Changing the stream clears subjects that are not in the new stream and are not English or Mathematics.

The subject list shows:

1. English Language and Mathematics.
2. Catalogue subjects whose stream tags include the chosen stream.
3. A subject tagged for more than one stream stays visible in each of those streams. The existing `subjectStreamLabels` line can remain as small meta text.

Turn search on. Search filters this stream list. It does not search the whole catalogue until the student presses “Show subjects outside my stream”. That control is secondary, 44px, and off by default. Subjects chosen from outside the stream stay selected and are labelled “Outside your stream”.

Remove the current split between “Help me choose subjects” and “I already have a programme in mind”. Both actions sit on one screen:

- The subject picker is the main column.
- Under it, a compact programme field: “Or type a programme you are considering”. Placeholder: “Nursing, Law, Computer Science”.
- Continue is enabled when five stream subjects are selected, or when a programme identity has been chosen from the variation step below. If both are filled, keep both. Subjects still travel with the guidance context.

Helper under the subjects:

> Your stream shows the subjects usually taken on that path. A programme can still ask for a subject that is not in this list. We will show that when you open the programme.

### What the subjects open

Continue with subjects and no programme goes to the existing admission subject mode (`mode=subjects`, `exam_type=olevel`). The result list is the programmes whose stored O-level rules accept the selected subjects. Do not call a row a match until that check has run. Empty copy:

> None of the stored programme rules accept this subject combination. You can change a subject, or type a programme name above.

Each result is a compact row: programme name, one line of what it studies when that text exists, and a button “See this programme”. The button opens the preview. It does not open the university list.

### A typed programme, including Nursing

The programme field uses the existing admission programme search. It does not send the whole sentence “I want to study nursing” as a name. Strip a leading “I want to study”, “I want to do”, or “I am considering”, then search the remaining words. “Nursing” stays “Nursing”.

If the search returns one JAMB identity, select it and show its name under the field.

If it returns more than one identity whose name contains the typed words, do not pick one silently and do not jump to a preview. Show a variation step on the same screen:

> JAMB lists more than one programme under “{typed words}”. Choose the one you mean. Each one has its own subjects and its own universities.

Each variation is a compact card:

- Title: the official JAMB name, unchanged.
- Explanation: use a stored distinction, overview, or requirement summary if the programme payload has one. If it does not, show only: “This is a separate JAMB programme. Its O-level subjects, UTME subjects, and universities are its own.”
- Button: “Choose this programme”, 44px.

Do not write a reason such as “this nursing degree is for hospitals and that one is for science” unless that sentence is already stored on the record. The known stored name `Nursing/Nursing Science` is shown as that official string. It is not split into two invented programmes.

After one identity is chosen, Continue opens that programme’s preview. The selected subjects, if any, remain in the guidance context so the preview can say which of the student’s subjects the general rule uses. That note is not a university offer.

## 4. SS3 and JAMB

Keep the three doors in `JambSetupForm`. Change only the student-facing words.

| Door value | Title | What happens |
|---|---|---|
| `unsure` | I don’t know the programme yet | Stream, then O-level subjects, then UTME subjects. Continue opens the subject matcher |
| `know_what` | I know the programme, not the university | Programme field with the same variation step as SS1/SS2. Continue opens the preview. Universities come next |
| `know_where` | I know the programme and the university | Programme field with the variation step, then the university field. Continue opens that university’s page for that exact programme |

SS3 still asks for the secondary school. A JAMB candidate still chooses tutorial centre or self-taught. Stream still filters the subject list the same way as SS1/SS2. The unsure door still asks for at least five O-level subjects and four UTME subjects, with Use of English fixed.

On `know_what` and `know_where`, subjects are optional. A text button “Check my subjects against this programme” reveals the same subject pickers. It does not block Continue.

`know_where` with both ids keeps the current route: the programme page opened with `schoolId` and `resumeStage=university_context`. Do not send that student back through the national preview.

## 5. Programme preview, then universities

This screen is `ProgrammeDetailRefinedScreen`. Keep one page.

### Before a university is selected

Show, in this order:

1. Programme name.
2. “What this programme is about”, from the stored preview or curriculum teaser. SS1 and SS2 keep the short teaser. Do not render the full 14-theme Sociology contract here.
3. General UTME subjects and general O-level requirements, labelled “Before you choose a university”.
4. If the student brought subjects, one line: “Your subjects are kept. A university can add its own conditions.”
5. One primary button, “View universities”.

The sentence beside that button, for every secondary and JAMB class:

> Check the universities that offer this programme. Select one to see its O-level subjects, its UTME subjects, and what you can study after it. The general subjects above are not that university’s full requirement.

Do not show domain cards, D078, or role routes on this state.

### University list

Compact rows, not large essays. Each row shows the university name, the city and state when stored, and a 44px button “See this university’s requirements”.

A second 44px button, “Add to comparison”, is enabled from the second selection. “Compare selected universities” appears when two or more are selected, up to the number the page already allows. The comparison stays on this page. It shows, for each selected university:

- University name.
- Its UTME subjects.
- Its O-level requirements.
- Any stored note that its rule differs from the general programme rule.

If a field is empty, show the existing empty line for that field. Do not copy another university’s text into the gap.

`ProgrammeCompareScreen` stays a programme-to-programme tool. Do not route this university comparison there.

### One university

Heading: “Admission information for {university}”.

Two blocks, in this order:

1. “This university’s O-level requirements”.
2. “This university’s UTME subjects”.

Under them, the general programme subjects remain visible and labelled “General programme subjects, before this university’s own conditions”.

Then the downstream block:

> What this programme can lead to

That block is the existing `ProgrammeDomainTransition`. Open a domain only from here, after the university is selected. If the programme has a link to domain `D078`, that card is labelled with the domain’s stored name, Social Sciences & Behavioural Research, and the button “See how Sociology continues in this field”. The button uses the existing domain route and carries the programme id, university id, class, and stream.

The D078 page then uses the method-aware journey already backed by `src/data/d078MethodAwareUiData.json`. This onboarding design does not redraw that journey. It only makes the door explicit and places it after the university requirement.

If D078 is not linked to the selected programme, show only the domains that are linked. Do not add a Sociology card.

A programme with no domain links shows:

> No reviewed field path is stored for this programme yet. You can still read this university’s subject requirements.

## 6. Words

| Place | Student sees |
|---|---|
| SS1 / SS2 title | Plan your {SS1 or SS2} subjects |
| Stream | Your subject stream |
| Subjects | Subjects in {Science, Commercial, Arts, or Technical / vocational} |
| Outside control | Show subjects outside my stream |
| Programme field | Or type a programme you are considering |
| Several JAMB names | JAMB lists more than one programme under “{words}” |
| No stored distinction | This is a separate JAMB programme. Its O-level subjects, UTME subjects, and universities are its own. |
| Preview button | View universities |
| Preview note | Select one to see its O-level subjects, its UTME subjects, and what you can study after it. |
| University button | See this university’s requirements |
| Compare | Compare selected universities |
| Downstream | What this programme can lead to |
| D078 action | See how Sociology continues in this field |
| SS3 unsure | I don’t know the programme yet |
| SS3 programme only | I know the programme, not the university |
| SS3 both | I know the programme and the university |

Buttons are `RouteButton` or `SifterButton` at 44px height. Cards use 12px padding, a 16px title, and a 14px explanation of at most two lines. A learning resource, if the preview already has one, stays a compact row with its type beside the title.

## 7. Behaviour

| Action | Result |
|---|---|
| Change stream | Clear subjects that are outside the new stream. Keep English and Mathematics |
| Search subjects | Filter the current stream list |
| Show subjects outside my stream | Add the rest of the catalogue under a second heading |
| Type “I want to study nursing” | Search “nursing”. If several identities return, show the variation cards. Do not open a preview yet |
| Choose one variation | Store `intendedJambProgrammeId` and the official name |
| Continue from subjects only | Admission browser, O-level subject mode, then preview on “See this programme” |
| Continue from a chosen programme without a university | Programme preview. No domain cards |
| View universities | University list on the same programme page |
| Select one university | Its O-level and UTME blocks, then downstream |
| Select two universities and compare | Side-by-side requirements. Choosing “See this university’s requirements” from a column sets that university as the selected one |
| Know both, SS3 or JAMB | Skip the national preview and open the university page |
| Open D078 | Method-aware journey with the programme and university context |
| Back from universities | Return to the preview, keep the programme, clear the selected university |
| Back from a variation | Return to the typed words, clear the programme id |

Reduced motion removes slide transitions. Focus moves to the new heading. A failed search keeps the typed text and says “Could not load programmes. Try again.”

## 8. Files

Edit:

- `src/components/onboarding/SeniorSecondaryExploreSetupForm.tsx`
- `src/components/onboarding/JambSetupForm.tsx`
- `src/components/onboarding/LiveSubjectMultiSelect.tsx`
- `src/screens/OnboardingFlow.tsx` only if the programme-family pause needs a query flag. Prefer finishing the variation choice before Continue, so the existing preview route stays valid.
- `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx` for the requirement order, the explicit sentence, and the D078 button label.
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx` only to keep programme rows from opening universities directly.

Do not edit:

- The subject matcher rules.
- `ProgrammeCompareScreen.tsx`, except a link back if a student lands there by mistake.
- The D078 graph or `d078MethodAwareUiData.json`.
- SQL seeds.

## 9. Tests

- Science stream does not show a subject tagged only as Arts until “Show subjects outside my stream” is on.
- A subject tagged Science and Commercial is visible in both.
- Changing stream drops an outside subject and keeps English Language.
- “I want to study nursing” with two returned identities renders two cards and does not navigate.
- One returned identity stores that id.
- SS1 continue with subjects opens subject mode and not a university list.
- Preview renders “View universities” and no D078 card.
- After a university is selected, its O-level and UTME headings are present.
- A programme linked to D078 shows “See how Sociology continues in this field” only in that state.
- `know_where` with both ids opens the programme route with `schoolId`.
- Two selected universities show their own requirement strings, not each other’s.

## 10. Acceptance

A reviewer can:

1. Choose SS1, Science, five subjects, and see only Science-tagged subjects plus English and Mathematics.
2. Type “nursing”, see every returned JAMB identity as its own card, and choose one without a guessed explanation.
3. Land on the programme preview, read the general subjects, and press “View universities”.
4. Open one university and see its O-level and UTME text, then the downstream cards.
5. If that programme links to D078, open Social Sciences from that card.
6. Repeat the three SS3 doors: subjects, programme only, and programme plus university.
7. Compare two universities on the programme page and see each one’s own requirements.
