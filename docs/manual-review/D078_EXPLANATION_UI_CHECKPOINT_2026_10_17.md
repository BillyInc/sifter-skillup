# D078 Explanation UI Checkpoint — 2026-10-17

## Scope

Local work is continuing on the learner-facing explanation layer only. Do not
reopen tool/role inventory research, role fit, item ownership, or enrichment.
The two parallel review lanes (requirement disposition and dependency ordering)
are separate from this explanation implementation.

## Current explanation implementation

- `src/lib/studentExplanation.ts` splits combined contextual copy into
  meaning, task example, distinct output, and guardrail sections.
- `ContextualItemList`, `GuidedLearningTray`, and
  `AlternativeComparisonSheet` use the shared copy parser so internal markers
  do not appear as a jumbled sentence.
- The programme theme resource card distinguishes why a resource is attached
  from what it covers.
- Programme theme cards distinguish the short theme focus from the narration
  that explains how the grouped courses fit together; the narration is not
  repeated after expansion. Courses that do not sit under a named theme now
  receive neutral learner-facing copy rather than internal “not yet assigned
  to a reviewed theme” workflow language.
- The area/role orientation card presents existing work-context data as a
  separate “Work settings and conditions” section and avoids claiming that
  generic context fields identify collaborators.
- Existing corrections and tests are recorded in
  `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md`.

## Verification status

- Latest focused comparison-sheet tests: 4 passed.
- Latest programme-theme explanation tests: 8 passed, including the new
  ungrouped-course copy regression check.
- Latest scoped TypeScript check: passed.
- Combined relevant explanation UI verification: 53 passing tests across 8
  suites in one focused invocation using the actual test paths.
- The initial route-wide copy lint found 94 item-contexts/96 short-field flags
  in the current payload (14 programme themes, 53 domain items, 150 area
  items, 202 role-item instances across 19 owners). Each flag was reviewed
  with its adjacent definition, route context and expected output. Eleven
  terse definitions were expanded; 8 domain and 15 area task-use explanations
  were strengthened; and 62 recurring role-task contexts were rewritten as
  33 task-specific explanations, reused only for the same task wording.
- The refreshed audit now reports zero missing, short-copy or internal-phrase
  findings. A regression test checks this against the current runtime payload
  while retaining `human_review_required=true` and `auto_approval=false`. This
  closes the heuristic queue, not the full semantic review or rendered-user
  acceptance gate. The backend guided-content suite passes (36 tests); item-card
  and tray UI suites pass (27 tests across two suites).

## Still open

This checkpoint does not claim route-wide completion. The short-copy queue is
closed, but a semantic review remains for programme themes/outcomes,
domain/area/role overviews, item relationships, resource rationales and their
programme-to-role connections. Payload/seed verification and user-rendered
acceptance also remain. Any edits must preserve source meaning, distinguish
required from optional guidance, use plain but sufficiently explanatory
learner language, and avoid inventing missing facts.

## Copy leak corrected in this pass

The role item “Meet standards of practice in social services” exposed the
internal note “Essential priority is a candidate only.” The role response now
translates that into a learner-facing boundary: high priority in one role does
not make an item a shared foundation for every learner; it matters only when
the selected route uses it. The focused regression and all 35 tests in
`backend/tests/test_d078_guided_content.py` pass. This changes explanation
rendering only; the source disposition is untouched.

## Explanation UI continuation (2026-10-17)

This continuation remains limited to learner-facing explanations and their
presentation. It does not edit the tool/role inventory, role ownership,
placement decisions, source research, SQL or migration files.

- Collapsed item cards now show the item's explanatory meaning at 16 px with
  25 px line height. Opening the card replaces that preview with separately
  labelled details, so the definition is not repeated in the same open card.
- The role-item explanation adapter now gives the definition and role-specific
  use distinct copy. It also scopes programme, domain, area and role context to
  the item and its selected route instead of repeating generic role boilerplate.
- Regression coverage checks all 202 approved role-item instances for distinct
  meaning/use and item-specific route context. The definitions for osteology,
  palaeography, social sciences, urban planning and other affected concepts are
  expressed in plain language; ambiguous company-policy scope is explicitly
  bounded rather than presented as a universal tax-policy duty.
- Typography remains as recorded in gap-audit finding 24: the code/tests enforce
  readable body/detail text and larger section labels with separate cards and
  spacing. This is local implementation evidence, not rendered visual approval.

Verification for this continuation: 40/40 backend guided-content tests;
46/46 focused UI tests across six suites; the scoped TypeScript check passes;
the current copy heuristic reports zero flags across 14 programme themes, 53
domain items, 150 area items and 202 role-item instances. The heuristic keeps
`human_review_required=true` and `auto_approval=false`. Semantic review of all
programme/theme/outcome and overview narration, relationship/resource rationale,
authenticated payloads and the user's rendered acceptance remain open.

### Role-output explanation repair (2026-10-17)

The explanation audit found 41 role-item instances using the same generic
work-product fallback even where their reviewed task context described a
bounded example. Added role-and-item-specific learner output explanations to
the display adapter, preserving conditions and professional limits (for
example, company-policy work is only described when a named policy is relevant;
genealogical transcription names a source-linked transcript and marks uncertain
readings). This changes display narration only; it does not alter role records,
task ownership, placement, or evidence decisions.

Verification after this repair: 41/41 backend guided-content tests pass, and
the copy heuristic reports zero findings across 14 programme themes, 53 domain
items, 150 area items, and 202 role-item instances. This closes the identified
generic-output-copy defect, not the broader semantic or rendered review. Keep
`human_review_required=true` and `auto_approval=false` until those reviews are
completed.

Four explanation-interaction UI suites also pass after the adapter change:
39/39 tests covering item-card summaries/details, the tray, relationship
details, and alternative comparison. The test environment still emits its
existing Expo icon/motion `act(...)` warnings; they did not fail these tests.

### Learning-resource rationale clarification (2026-10-17)

The card already kept the resource rationale separate from the item meaning,
route use and exact source locator, but short rationales such as “question-writing
learning” did not explain the item's connection in student-facing language.
`ContextualItemList` now expands only terse rationales by combining that existing
reason with the same item's reviewed route-use explanation and, when present,
its exact resource locator. It also states that a learning link is not proof of
competence. Longer rationales are preserved unchanged; no source, role, item,
placement or requirement record is modified, and no new claim is inferred.

Verification: the focused `ContextualItemList.test.tsx` suite passes 22/22,
including the short-rationale, route-use, exact-locator and long-copy-preservation
checks. Existing Expo icon/native-module and `act(...)` warnings are non-failing.

### Programme course-outline presentation repair (2026-10-17)

The theme screen was rendering long, compressed CCMAS `courseSummary` and
original outcome wording inline beside learner-friendly outcomes. Original
course and outcome wording is now hidden by default and available through a
per-course “View original course outline” disclosure, explicitly labelled as
source wording that may be technical or compressed. Learner-friendly outcomes
remain the default course explanation; source text is preserved unchanged.

Verification: `DegreeSkills.test.tsx` passes 9/9 tests, including the source
outline disclosure regression; the scoped TypeScript check passes. This fixes
the default presentation of raw outline text, not the full semantic review of
all course outcomes or rendered acceptance.

### Requirement lanes in the saved learning tray (2026-10-17)

The selected tray previously rendered compulsory items and selected useful
edges together as one numbered route-order list. That made an optional edge
look like another required step even though the item carried an optional
label. The tray now separates the selected plan into a numbered
**Compulsory learning path** and a distinct **Optional useful edges you chose**
section. The optional section explicitly says those items are additional,
skippable, and not part of the compulsory path. Reorder controls only move
items within their own requirement lane. Programme learning carried into the
plan is labelled as context, not as a new domain/area/role requirement.

The item definition, route use, programme/domain/area/role connection,
relationships, limits and resource explanations remain expandable within
either lane. No inventory, item disposition, explanation content, role
ownership, graph, or SQL was changed in this UI fix.

Verification: the learning-plan, adapter and tray suites pass (3 suites / 42
tests); the scoped TypeScript check passes. Authenticated rendered acceptance
remains open.

### Consolidated local verification (2026-10-17)

After the lane-separated tray change, reran the focused explanation and route
presentation suite together: 11 Jest suites / 106 tests passed. After the
comparison-label and role-overview de-duplication fixes, reran the expanded
focused suite: 13 Jest suites / 111 tests pass. Re-ran
`audit_d078_student_explanation_copy_2026_10_17.py` against the current runtime
payload: 14 programme themes, 53 domain items, 150 area items and 202 role-item
instances across 19 role owners; zero heuristic copy flags. The audit explicitly
retains `human_review_required=true` and `auto_approval=false`, so this result
closes only missing/short/internal-phrase checks. It does not certify that every
explanation is semantically accurate or sufficiently clear, and it does not
verify the seeded API response or rendered page. The scoped guided-sequence
TypeScript check also passes after the latest UI changes.

Remaining for the explanation pass: semantic review of programme/theme/outcome
narration, domain/area/role overviews, relationship and alternative meaning,
resource rationales, and the programme-to-role explanations as experienced in
their actual route context. Correct only demonstrated content/UI defects, then
record one explicit review result. Live seeded-payload verification and the
user's rendered acceptance remain later, separate gates.

### Comparison explanation labels (2026-10-17)

The alternative-comparison sheet used the same heading, "Evidence context," for
both an item's geographic scope and the regions represented by its source
references. Renamed the source-reference row to "Source coverage" so learners
can tell whether a statement describes where guidance applies or where its
supporting sources come from. The comparison-sheet regression suite passes
(6/6). This is a bounded presentation correction; it does not close the
route-wide semantic review.

### Role overview de-duplication (2026-10-17)

The role page showed its short introduction and title in a compact hero, then
repeated the role title and a closely related overview in the following
"Understand this role" card. Removed the duplicate hero and routed the short
introduction into the single structured orientation card, which continues to
show distinct focus, activities, outputs, relationships and context where
available. The page-order and orientation regressions pass (11/11 tests across
three suites). This consolidates the explanation rather than deleting its
content; actual route-specific rendering still needs the later browser check.

### Explanations for secondary learning links (2026-10-17)

The main item link already had a route-aware "why attached" explanation, but
other approved links on the same card could appear without a clear reason for
the learner to open them. Added a separate "Why this link may help" explanation
for each secondary verified resource and checked guide. When the link has no
own rationale, the copy explains that it is an additional place to learn or
read about this item, connects it to the reviewed task, and avoids claiming
that the link proves competence. A recorded locator remains separately labelled
as "Start at." The ContextualItemList suite passes (25/25), including links
with and without descriptions/rationales. This closes the display gap, not the
semantic verification of each link's underlying resource record.
The consolidated explanation/route suite was rerun after this change: 13
suites / 111 tests pass.

### Honest fallback for missing item-specific limits (2026-10-17)

Contract coverage found 335 of 405 current domain/area/role item instances with
an item-specific `evidenceLimitations` entry; the other 70 would omit the
"What it cannot prove or replace" section in item details. Added one explicit,
carefully bounded fallback across item cards, the saved tray and alternative
comparison: it says no item-specific limitation is recorded, that inclusion in
a learning path does not prove mastery, and that the learning item does not
replace any qualification, permission or supervision required for the work.
Existing reviewed item-specific limits remain unchanged. Regression tests cover
both present and missing limitation data.
The consolidated explanation/route suite now passes 13 suites / 112 tests;
the scoped TypeScript project check passes as well.

### Semantic review tranche: programme theme introductions (2026-10-17)

Reviewed all 14 runtime Sociology theme summaries and narrations together, not
only for length: checked that each explains the courses' shared subject,
preserves distinctions between Sociology, Anthropology and Psychology where
they meet, avoids implying professional qualification, and does not turn a
theme into an additional selectable requirement. No unsupported claim or
meaning-changing edit was identified in this tranche. Checked the source text
for Unicode replacement characters as well; none are present (the console's
rendering of curly punctuation is a code-page artifact, not corrupted copy).

This closes only the theme-introduction tranche. It does not yet establish
semantic approval for the underlying course outcomes, theme-to-domain
connections, domain/area/role overviews, item relationships, or resource
rationales; those remain in the explanation review queue.

### Course-outcome copy repair tranche (2026-10-17)

Screened all 236 source-backed Sociology course outcomes and closely reviewed
the problematic-copy candidates. Corrected 30 learner-facing outcomes whose
wording was visibly incomplete, jargon-heavy,
unbounded or confusing without explanation. The overrides preserve each
original `sourceText` and locator; only the student explanation changes. They
clarify the Industrial/Political Revolution reference, Psychology and Social
Anthropology scope, anthropology's racist/colonial history, research-method
and theory language, cultural examples, and the impossible-to-meet claim of
"total understanding" of Nigerian/African peoples. The copy stays within the
course summaries and avoids implying professional qualification or treating
one community as universal.

The builder now removes a source-list continuation such as a trailing `; and`
from student copy without altering the recorded source wording. After rebuild,
all 236 outcomes retain course locators, no student outcome ends in a dangling
"and", and no learner-facing outcome retains the vague phrase "many others".
The focused regression tests pass (3/3), and contract generation retains 34
courses, 236 outcomes, seven programme abilities and the existing quality
gates. This is a copy-repair tranche, not sign-off of all 236 meanings or the
programme-to-domain handoff; those still need semantic review.

### Relationship explanation closure (2026-10-17)

The visible D078 payload contained 114 relationship records. Twenty-six
learner explanations were still audit-style fragments such as "Not cumulative"
or "Tool choice follows method and project constraints." The shared payload
sanitiser now expands those reviewed notes with the actual relationship: what
the connected item contributes, when the learner should use it, and whether it
is an alternative, complement or prerequisite. The target item's name is kept
in the explanation so the connection is understandable in domain, area and
role cards. This does not promote an optional item or change the graph edge.

The regression suite now checks every visible relationship for a sufficiently
explanatory learner sentence and rejects the old short internal shortcuts.
Focused verification after this repair: 60 Python tests passed, including the
relationship closure, programme theme, course-outcome and D078 guided-content
suites. The copy heuristic remains at zero flags across 14 themes, 53 domain
items, 150 area items and 202 role-item instances. The remaining work is the
semantic review of route overviews, resource rationales and programme-to-role
connections, plus seeded-payload/rendered acceptance; it is not a missing
relationship-copy queue.

### Programme-to-domain explanation wording (2026-10-17)

The no-exact-outcome-match branch used the technical phrase "exact
course-outcome link" without explaining it. Reworded the explanation to tell
the learner that the reviewed evidence does not point to a particular course
outcome showing the theme's connection to the field; the theme remains visible
as programme context, but is not represented as proof of an existing field
skill or as an extra domain requirement. The matched branch remains distinct
and continues to show the specific supporting course/outcome evidence. The
focused carry-forward suite passes (2/2).

### Area-overview explanation closure (2026-10-17)

The seven canonical D078 Areas of Specialization were source-backed, but their
student cards were still receiving one-sentence boundary descriptions. Added a
separate learner-facing explanation for each area. Each now explains what the
area studies, what kind of work or question it supports, and the relevant
boundary or limitation. The explanations preserve the existing area keys,
source references and role routes; they do not promote an item or revive the
retired legacy subgroup labels. The computational area explicitly explains
that Python, R and notebooks are ways to carry out a social-science task, not
universal requirements.

The focused D078 area, guided-content and relationship tests pass (60 Python
tests). The route copy audit remains at zero heuristic flags. This closes the
known area-overview copy gap; seeded API verification and rendered acceptance
remain separate deployment checks.

### Migration copy-preservation repair (2026-10-17)

The documented migration order had a stale overwrite: the later Sociology
guidance migration replaced the richer D078 student orientation with a short
fallback object. Its update now preserves the existing reviewed
`student_orientation` when the domain-orientation migration has already run,
and uses the shorter object only when no orientation exists. This prevents a
successful reseed from silently bringing back the old compressed domain copy.
The migration remains prepared locally; it has not been claimed as applied to
Supabase.

### D078 tool and credential display repair (2026-10-17)

The active domain and area screens contained stale D078-only conditions that
hid the reviewed tool and credential panels, even though the approved
contextual-item records were already passed into the screens. Those conditions
are removed. The existing student evidence filters remain active, including
context ownership, approved claim review, linked learning evidence and
non-actionable-tool filtering. This exposes approved records without reviving
legacy aggregates or promoting unreviewed rows. Area-linked tools keep their
reviewed area/role route explanation; role tools continue through the role's
contextual item cards and selected-area options.

Focused verification after this repair: the available focused UI suites pass
(6 suites / 61 tests), the guided TypeScript check passed, and the D078 copy audit still reports zero
heuristic findings across the current programme/domain/area/role payload.
Live seed/API state and authenticated rendered acceptance remain the only
deployment-level checks; no live promotion is claimed here.

### Tool-card explanation depth repair (2026-10-17)

The tool-card preview previously described a tool mainly through its purpose or
attached resource, and labelled every tool as an optional choice. It now leads
with the reviewed meaning and contextual use, derives the displayed
needed/useful/optional label from the item's requirement contract, and keeps
the output, preparation notes, route connections, relationship explanations,
limitations and resource rationale in separate learner-facing sections. Raw
requirement values and source-audit wording are not shown. This is a display
copy repair; it does not alter tool ownership, evidence, placement or
sequencing.

The guided TypeScript check and the available focused UI suites (61 tests) pass, and
the explanation audit remains at zero heuristic findings across the current
14-theme, 53-domain-item, 150-area-item and 202-role-item payload. Live API
payload and authenticated rendered acceptance remain separate checks.

### Remaining display-copy sweep (2026-10-17)

The final explanation-only sweep checked the secondary student-facing paths
that were not covered by the main contextual-item cards. Certification cards
now explain what the credential is, how it is used, what it can demonstrate,
why it appears in the route, what may help the learner prepare, what it cannot
prove, and why its information link is attached. Foundation-skill cards and
role item details now use the same separated meaning, use and output sections,
and route evidence is cleaned before display. Relationship labels now use
learner-facing wording such as “What this builds on” and “What it may be used
alongside.”

Verification after this sweep: the guided TypeScript check passes; the two
D078 guided-content backend suites pass (50 tests); the focused UI command
passes 6 available suites / 61 tests; and the copy audit remains at zero
heuristic findings across 14 themes, 53 domain items, 150 area items and 202
role-item instances. This pass changed display copy only; it did not reopen
inventory, placement, enrichment or SQL work. Live seeded API payload and
authenticated rendered acceptance remain separate checks.

### Final local explanation closure (2026-10-17)

The last wording regression removed a hardcoded “three” and “D078” from the
compulsory-lane caption. The lane now explains the rule generically: items
marked as needed belong to the selected field route and follow the displayed
order; the useful-edge section contains optional route choices that can be
skipped. This keeps the requirement-led design valid when a route has a
different number of compulsory items. Foundation cards no longer truncate the
meaning text to three lines, and their evidence note is explicitly labelled so
it cannot be mistaken for the definition or the route use.

Current local verification:

- 46/46 focused explanation, relationship, tray and programme-carry-forward
  UI tests pass.
- The broader component/library run passes 26 suites and 161 tests. One
  unrelated auth test cannot start because the declared `starkzap` package is
  absent from this checkout's `node_modules`; it is not an explanation or
  learning-path failure and no package installation was performed in this
  explanation-only pass.
- The guided TypeScript check passes.
- The D078 explanation audit reports zero findings across 14 programme themes,
  53 domain items, 150 area items and 202 role-item instances.

There is no remaining local explanation-copy implementation gap identified by
the current audit. The only remaining checks are seeded API payload verification
and authenticated rendered acceptance; they must not be converted into another
content-research or explanation rewrite loop.
