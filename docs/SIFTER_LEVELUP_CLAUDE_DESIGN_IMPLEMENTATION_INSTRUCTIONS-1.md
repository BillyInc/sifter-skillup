# Sifter LevelUp — Claude Design + Implementation Instruction

## ROLE

You are acting as the lead product designer, UX architect, UI designer, interaction designer, and senior frontend engineer for the Sifter LevelUp codebase.

Your job is not to create a disconnected concept.

Your job is to:

1. Read and audit the existing codebase.
2. Understand the actual product, data model, routes, components, states, and current UX.
3. Use the supplied reference mockups and product direction as design evidence.
4. Redesign the product experience where necessary.
5. Generate visual mockups before implementation.
6. Implement the approved redesign directly in the existing codebase.
7. Preserve and use the real content/data already present in the codebase.
8. Never invent product data merely to make a screen look complete.

The final result should feel like one coherent, production-ready product rather than a collection of copied mockup screens.

---

# 1. PRIMARY PRODUCT PRINCIPLE

The core product idea is:

> **Simple at the surface. Deep underneath.**

Sifter LevelUp should make complex education and career intelligence understandable to a secondary-school student while still supporting deep exploration.

The product connects:

**Subjects → Programmes → Domains → Roles → Skills → Opportunities**

The interface should hide unnecessary complexity until the user needs it.

The user should feel that Sifter LevelUp is helping them discover and make decisions, not filling out a government form or browsing a static school directory.

---

# 2. SOURCE MATERIAL YOU MUST USE

You have three sources of design direction.

## A. Initial mockups supplied by the product owner

These are the original Sifter LevelUp mockups.

They establish:

- Existing visual language
- Existing information architecture
- Mobile layouts
- Desktop layouts
- Explore
- Domain Explorer
- Domain Detail
- Programme Detail
- Schools and cut-offs
- Subject selection
- Onboarding
- Authentication
- Terms and conditions
- Opportunities
- Opportunity filtering
- Empty/locked states
- Design system
- Motion specifications

Treat these as important references, but NOT as immutable screens.

## B. Additional mockups generated during this design process

These extend the original design system with desktop equivalents and additional product surfaces such as:

- Desktop onboarding
- Desktop opportunity detail
- My World / Saved
- Desktop navigation
- Responsive breakpoints
- Design-system components
- Forms and input states
- Empty states
- Loading states
- Toasts
- Motion/interaction specifications
- Component examples

Use these to establish consistency between desktop and mobile.

## C. The original product/design brief

The product direction is:

- Modern career-intelligence product
- Education + career discovery
- Simple for students
- Powerful underneath
- Subjects → programmes → domains → roles → skills → opportunities
- Search-driven exploration
- Personalised matching
- Admission intelligence
- Career pathways
- Opportunity discovery
- Nigerian education/career context where supported by the actual codebase data

Do not blindly reproduce the mockups.

Use them to infer the intended design system, hierarchy, interaction patterns, and product philosophy.

---

# 3. NON-NEGOTIABLE DATA RULE

## ALL CONTENT MUST COME FROM THE CODEBASE

This is extremely important.

Do not fabricate:

- Universities
- Programmes
- Courses
- Cut-off scores
- JAMB information
- Subjects
- Careers
- Roles
- Skills
- Opportunities
- Companies
- Locations
- Salaries
- Dates
- Statistics
- Match percentages
- Demand percentages
- User information
- Testimonials
- Reviews
- Quotes
- Metrics

unless those values already exist in the codebase/data sources.

The mockups contain example content such as Nursing, Health & Biomedical, University of Ibadan, University of Lagos, Product Design Intern, etc.

These examples are DESIGN REFERENCES ONLY.

If the codebase contains different data, use the codebase data.

If the codebase does not contain a value, do not invent one.

Instead:

- Hide the section,
- use an honest empty state,
- use a neutral placeholder only where the UI structurally requires it,
- or derive the value from existing data using transparent logic.

Never present fabricated information as real.

---

# 4. FIRST TASK: AUDIT THE CODEBASE

Before changing implementation, inspect the entire codebase.

Do not immediately start coding.

Create an internal understanding of:

## Architecture

Identify:

- Framework
- Routing
- Entry points
- Pages
- Layouts
- Components
- Shared components
- Hooks
- Utilities
- Services
- API/data layer
- State management
- Authentication
- Persistence
- Styling system
- Design tokens
- Assets
- Icons
- Fonts
- Responsive strategy
- Existing animation libraries

## Product structure

Map:

- Home
- Explore
- Domains
- Sub-groups
- Roles
- Programmes
- Schools
- Cut-offs
- Subjects
- Onboarding
- Authentication
- Opportunities
- Saved/My World
- Profile
- Any other existing product surfaces

## Data structure

Determine where the actual data comes from.

Identify:

- Static data
- JSON
- APIs
- Database calls
- Mock services
- Fixtures
- CMS data
- User data
- Calculated values

Understand relationships between:

**subjects → programmes → domains → roles → skills → opportunities**

Do not assume the relationships. Read the implementation.

## Current UX

Audit:

- User journeys
- Navigation
- Search
- Filters
- Forms
- Selection states
- Error states
- Loading states
- Empty states
- Authentication
- Mobile behavior
- Desktop behavior
- Accessibility
- Responsive behavior
- Transitions
- Animation
- Back navigation
- Deep links
- State persistence

---

# 5. CREATE A UX AUDIT BEFORE IMPLEMENTATION

After inspecting the codebase, produce a concise audit.

Organise findings into:

### Critical

Problems that prevent users from completing important tasks.

### High

Major usability, information architecture, interaction, or consistency problems.

### Medium

Visual, interaction, or content hierarchy improvements.

### Low

Polish opportunities.

For every important issue explain:

- Current behavior
- Why it is a problem
- Recommended solution
- Which reference mockup/pattern supports the recommendation
- Which code area is likely affected

Do not redesign something merely because it looks different from the mockups.

Prioritise actual usability.

---

# 6. REDESIGN THE USER JOURNEYS

Audit and redesign the core journeys.

At minimum inspect:

## New user

Landing → onboarding → account/guest → setup → subjects → goals → programme/career exploration → recommendations.

## Programme discovery

Explore → search → programme → requirements → schools → cut-offs → careers → pathways.

## Domain discovery

Explore → domain → sub-groups → roles → skills → programmes → opportunities.

## Career discovery

Explore → role → skills → programmes → opportunities.

## Opportunities

Opportunities → search/filter → result → opportunity detail → save/apply.

## Saved / My World

Discover → save → My World → review → continue exploring.

## Returning user

Login → personalised home/explore → recommendations → saved items → opportunities.

If the existing codebase has additional journeys, include them.

---

# 7. INFORMATION ARCHITECTURE

Use the following conceptual hierarchy where it fits the actual data model:

**Subjects**

↓

**Programmes**

↓

**Domains / Sub-groups**

↓

**Roles**

↓

**Skills**

↓

**Opportunities**

But do not force this structure where the codebase has a better or more accurate relationship.

The UI should make these relationships discoverable.

A student should be able to understand:

> “If I like these subjects, what programmes could I study?”

then:

> “What domains does this programme lead into?”

then:

> “What careers/roles can I pursue?”

then:

> “What skills will I need?”

then:

> “What opportunities can I eventually access?”

---

# 8. DESIGN DIRECTION

Use the strongest patterns from the supplied mockups.

## Visual language

Prefer:

- White/light backgrounds
- Orange primary action
- Dark navy/charcoal text
- Green for positive/high-match states
- Blue for information
- Amber for warnings/medium states
- Red for errors
- Thin borders
- Very subtle shadows
- Moderate corner radius
- Generous whitespace
- Inter-style typography
- Clear hierarchy
- Compact chips
- Strong search
- Clean navigation

Avoid:

- Excessive gradients
- Excessive shadows
- Excessive rounded containers
- Too many competing badges
- Card-inside-card-inside-card layouts
- Dense dashboard clutter
- Generic school-portal aesthetics

The target feeling is:

> **Modern career intelligence platform + education product + professional SaaS simplicity.**

Think:

**simple at the surface, powerful underneath.**

---

# 9. INFORMATION DENSITY

The product contains a lot of information.

Do not expose everything at once.

Use progressive disclosure.

Above the fold should answer the user's immediate question.

For example, a domain page should initially answer:

### What is this?

Short explanation.

### Where can it take me?

Important roles/programmes.

### Why might it fit me?

Personalised match/explanation where supported by actual data.

Then allow deeper exploration.

---

# 10. SEARCH-FIRST EXPLORATION

Search should be a major interaction pattern.

Users should be able to search where appropriate across:

- Programmes
- Domains
- Sub-groups
- Roles
- Skills
- Opportunities
- Schools
- Subjects

Use contextual search placeholders based on the actual screen.

Do not create fake search results.

Search should have:

- Clear focus state
- Keyboard accessibility
- Loading state
- Empty state
- Error state
- Clear/reset behavior
- Useful result hierarchy

---

# 11. SUBJECT SELECTION

The subject-selection experience is especially important.

Do NOT use five separate dropdowns.

Use:

**Search + selectable chips/grid + selected count + Continue**

Example structure:

### Subjects you're strongest in or enjoy

Choose up to the allowed number.

Search subjects...

Then selectable subject chips/grid.

Selected state should be visually obvious.

Show:

**X of Y selected**

Then:

**Continue →**

The exact subjects and maximum selection count must come from the codebase.

If the codebase does not define a maximum, inspect existing product logic before choosing one.

---

# 12. GOAL SELECTION

If the codebase supports multiple onboarding goals, prefer selectable cards over simple radio buttons.

Examples from the reference design:

- Help me choose the right subject mix
- I have a programme/course in mind
- Explore career options
- I'm not sure yet

But these are examples only.

Use the actual supported goals/content from the codebase.

Each selectable card should communicate:

- Title
- Short explanation
- Clear selected state
- Optional icon
- Continue action

---

# 13. MATCH SCORES

If the codebase has matching logic, make match scores meaningful.

Never show a percentage without explanation.

Preferred structure:

**92% match**

✓ Strong subject alignment

✓ Strong interest match

✓ Fits your goals

Only show reasons supported by the actual matching data.

If matching logic is not implemented, do not fabricate percentages.

Instead design the component so the real matching system can populate it later.

---

# 14. OPPORTUNITIES

Opportunity cards should remain scannable.

Prioritise:

**What? Where? Type? Match?**

Use the actual data available.

Filters should support the actual opportunity model.

On mobile, use a bottom-sheet filter pattern where appropriate.

Include:

- Search
- Scope
- Type
- Relevant classification
- Active filter chips
- Clear/reset
- Apply filters

Do not create filter categories that don't exist in the data model.

---

# 15. DESKTOP UX

Desktop is NOT simply mobile stretched wider.

Use the desktop mockups as reference.

Desktop should generally support:

- Persistent sidebar navigation
- Wider content areas
- Multi-column layouts
- Contextual secondary panels
- Tables where information density benefits from them
- Search/filter toolbars
- Larger comparison surfaces
- Side-by-side information
- More visible relationship/context information

But retain the same hierarchy and visual language as mobile.

---

# 16. MOBILE UX

Mobile should prioritise:

- Bottom navigation
- Search
- Thumb-friendly controls
- Stacked content
- Bottom-sheet filters
- Clear page titles
- Compact cards
- Progressive disclosure

Do not simply shrink desktop components.

---

# 17. RESPONSIVE SYSTEM

Define clear responsive behavior based on the existing project.

At minimum account for:

- Mobile
- Tablet
- Desktop
- Large desktop

Do not arbitrarily choose breakpoints if the existing codebase already has a responsive system.

Preserve consistency with the project's framework conventions.

---

# 18. MOTION AND TRANSITIONS

Motion should communicate hierarchy and state, not decorate the UI.

Use subtle motion.

Preferred patterns from the reference system:

### Page transition

Fade + slight slide up.

Approximately:

200–300ms

Ease-out.

### Card appearance

Small scale/fade.

Approximately:

150–250ms.

### Button press

Small scale reduction + slight opacity change.

Approximately:

100ms.

### Input focus

Border transition + subtle glow.

### Error

Short field shake + helper text.

### Success

Toast slides/fades in from the top.

### Carousel

Fade + slide.

Keep motion restrained and accessible.

Respect:

`prefers-reduced-motion`.

Do not introduce animation everywhere.

---

# 19. INTERACTION PRINCIPLES

Every interaction should have an understandable state.

Audit and implement:

- Default
- Hover
- Focus
- Pressed
- Disabled
- Loading
- Success
- Error
- Empty
- Selected
- Saved
- Locked

Do not leave dead-looking controls.

If something cannot currently be completed, communicate why.

---

# 20. EMPTY AND LOCKED STATES

Empty states should explain:

1. What happened.
2. What the user can do next.

Locked states should explain:

1. What is locked.
2. Why it is locked.
3. What unlocks it.

Do not make empty states feel like errors.

---

# 21. ACCESSIBILITY

Audit the implementation for:

- Semantic HTML
- Keyboard navigation
- Visible focus
- Accessible labels
- Contrast
- Touch target size
- Screen-reader context
- Form errors
- Error recovery
- Reduced motion
- Appropriate heading hierarchy

Do not sacrifice accessibility for visual similarity to a mockup.

---

# 22. VISUAL MOCKUPS BEFORE IMPLEMENTATION

Before implementing major redesigned screens, generate visual mockups.

The mockups should be based on:

1. The actual codebase.
2. Actual routes.
3. Actual data.
4. The supplied Sifter LevelUp references.
5. The redesigned UX architecture.

Do not create generic fake screens.

For every major flow, create a visual representation of:

- Current state/problem
- Proposed state
- Key interaction states
- Desktop
- Mobile where relevant

Prioritise the core flows first.

---

# 23. MOCKUP REVIEW CHECKPOINT

Before implementing a major redesign, compare the proposed design against:

- Existing code
- Existing data
- Original mockups
- Generated reference mockups
- UX audit
- Product principles

Ask:

> Does this improve the user's ability to understand and complete the task?

If not, revise.

Do not copy visual patterns merely because they appear in the references.

---

# 24. IMPLEMENTATION

After the UX/design direction is established, implement it directly in the existing codebase.

Do not create a separate demo app.

Do not create parallel duplicate routes unless technically necessary.

Prefer:

- Existing components
- Existing data layer
- Existing routing
- Existing state management
- Existing utilities
- Existing API calls

Refactor when needed.

Create reusable components when a pattern appears more than once.

---

# 25. COMPONENT SYSTEM

Create or improve a coherent component system.

At minimum consider:

- Button
- IconButton
- Input
- SearchInput
- Select
- MultiSelect
- Chip
- Badge
- Card
- DomainCard
- ProgrammeCard
- OpportunityCard
- SchoolCard
- MatchScore
- ProgressIndicator
- Tabs
- BottomSheet
- Modal
- Toast
- EmptyState
- LockedState
- LoadingState
- Sidebar
- BottomNavigation
- FilterBar
- FilterSheet

Do not create components unnecessarily.

Follow the project's existing architecture.

---

# 26. DESIGN TOKENS

Centralise visual decisions where the codebase supports it.

Define/reuse tokens for:

- Primary
- Primary light
- Primary dark
- Success
- Info
- Warning
- Error
- Text
- Muted text
- Border
- Background
- Surface
- Radius
- Shadows
- Spacing
- Typography
- Motion durations
- Easing

Do not scatter hard-coded values throughout the application.

---

# 27. DATA INTEGRITY

Never change business logic simply to make the UI appear correct.

If you discover:

- Incorrect data
- Missing data
- Broken relationships
- Incorrect matching
- Incorrect filtering
- Incorrect school information

identify it separately.

Do not silently fabricate or alter the underlying truth.

---

# 28. PRESERVE FUNCTIONALITY

A visual redesign must not break existing functionality.

Before considering a flow complete, verify:

- Navigation
- Search
- Filters
- Forms
- Authentication
- Saving
- Selection
- Back navigation
- Deep links
- Responsive behavior
- Data loading
- Error handling

---

# 29. TESTING

After implementation:

### Functional

Test important user journeys end-to-end.

### Visual

Check:

- Desktop
- Tablet
- Mobile
- Different content lengths
- Empty states
- Loading states
- Errors
- Selected states
- Long names
- Long programme titles
- Large datasets

### Accessibility

Check keyboard navigation, focus, labels and reduced motion.

### Performance

Avoid unnecessary animation, rendering, large bundles, and duplicated data fetching.

---

# 30. DO NOT OVERWRITE THE PRODUCT WITH THE MOCKUPS

The mockups are references.

The codebase is the source of truth for:

- Actual functionality
- Actual data
- Actual routes
- Actual business rules
- Actual capabilities

The mockups are the source of truth for:

- Design direction
- Visual hierarchy
- Interaction inspiration
- Information presentation
- Responsive patterns
- Motion philosophy

When these conflict:

1. Preserve correct business/data behavior.
2. Preserve useful existing functionality.
3. Improve UX.
4. Adapt the visual design around reality.

---

# 31. DO NOT USE PLACEHOLDER CONTENT AS REAL CONTENT

Avoid generic filler such as:

- Lorem ipsum
- Fake universities
- Fake programmes
- Fake job listings
- Fake salaries
- Fake statistics
- Fake testimonials
- Fake percentages

If the UI needs a missing data state, design a proper empty state.

---

# 32. CONTENT TONE

Content should feel:

- Clear
- Helpful
- Confident
- Student-friendly
- Professional
- Nigerian-context aware when supported by the actual data

Avoid corporate jargon.

Avoid overly academic language.

Prefer short explanations.

For example:

Instead of:

> “Utilise our multidimensional programme compatibility assessment…”

Use:

> “See how well this programme fits your subjects and goals.”

Only use copy that is appropriate to the actual functionality.

---

# 33. FINAL PRODUCT EXPERIENCE

The completed experience should make the user feel:

> “I know where to start.”

Then:

> “I understand my options.”

Then:

> “I understand why these options fit me.”

Then:

> “I can see what I can do next.”

The product should progressively move the user from uncertainty to clarity.

---

# 34. REQUIRED DELIVERABLES

When finished, provide:

## 1. UX audit

Summarise:

- Problems found
- Severity
- Recommended changes

## 2. UX architecture

Document the redesigned:

- Navigation
- Information architecture
- User journeys
- Major transitions

## 3. Visual mockups

Provide redesigned mockups for the major flows before/alongside implementation.

## 4. Implemented UI

Implement the redesign in the actual codebase.

## 5. Interaction/motion system

Document:

- Page transitions
- Component transitions
- Loading
- Errors
- Success
- Reduced-motion behavior

## 6. Component/design system

Document or implement reusable components and tokens.

## 7. Verification

Report:

- What was tested
- What works
- What remains blocked
- Any assumptions
- Any data limitations

---

# 35. WORKING ORDER

Follow this order unless the codebase requires a different sequence:

### Phase 1 — Discover

Read the codebase.

### Phase 2 — Audit

Map architecture, data, routes and UX.

### Phase 3 — Plan

Create redesigned IA and user flows.

### Phase 4 — Visualise

Generate visual mockups using actual application data.

### Phase 5 — Review

Compare against the supplied references and product principles.

### Phase 6 — Implement

Build the redesigned experience in the existing codebase.

### Phase 7 — Refine

Fix responsive behavior, accessibility, visual consistency and interaction states.

### Phase 8 — Verify

Test core journeys and report results.

---

# 36. MOST IMPORTANT INSTRUCTION

Do not treat this as a request to "make the website look like the screenshots."

Treat it as:

> **Redesign Sifter LevelUp into the best possible version of the product represented by the codebase, using the supplied mockups as the visual and UX reference system.**

The goal is not screenshot duplication.

The goal is a coherent, usable, scalable, responsive, accessible and production-quality Sifter LevelUp experience.

**Read first. Audit second. Design third. Mock up fourth. Implement fifth. Verify last.**

Never skip the audit.

Never fabricate data.

Never create a disconnected prototype when the task is to improve the real codebase.

---

# 37. CRITICAL: MOCKUPS ARE NOT THE PRODUCT BEHAVIOR

A visual mockup only describes what a screen looks like at a moment in time.

Sifter LevelUp requires much more than visual implementation.

For every screen, component, control, form, search field, card, modal, sheet, navigation item, and CTA, determine:

1. What state is it in?
2. What can the user do with it?
3. What happens when the user interacts with it?
4. What data changes?
5. What other components react?
6. What happens if the action succeeds?
7. What happens if it fails?
8. What happens if there is no data?
9. What happens if the data is partially available?
10. What happens if the user leaves and comes back?
11. What happens on mobile versus desktop?
12. What happens during loading?
13. What happens when the user presses Back?
14. What happens if the user repeats the action?
15. What happens if the user changes their mind?
16. What happens if the user has not completed the required setup?
17. What happens if an API/data request fails, where applicable?

Treat every screen as a **stateful interactive system**, not a static screenshot.

---

# 38. BEHAVIOR-FIRST DESIGN PROCESS

For every major screen, perform this sequence:

### A. Screen inventory

Identify:

- Page
- Route
- Purpose
- Entry points
- Exit points
- Parent screen
- Child screens
- Components
- Data sources
- User actions

### B. Component inventory

For every component identify:

- Name
- Purpose
- Inputs/props
- Data dependency
- Local state
- Shared state
- Possible states
- User events
- Side effects
- Navigation effects
- Persistence effects

### C. Behavior map

Describe:

**User action → system response → state change → UI response → next available action**

### D. State machine

Where a component has meaningful state, explicitly model it.

Example:

**School search**

`idle` → `focused` → `typing` → `searching` → `results` → `no results` → `add school` → `school selected` → `saved` → `continue`

Also handle:

`search error`, `save error`, `duplicate`, `cancel`, `edit`, `back`.

### E. Acceptance criteria

Define observable behavior that can be tested.

Only then implement.

---

# 39. EXAMPLE: SCHOOL SEARCH / ADD SCHOOL FLOW

This is the required level of behavioral thinking.

Suppose onboarding contains:

**Your secondary school**

with:

**Search school name**

The behavior must NOT stop at displaying the input.

Inspect the existing school data model and determine how school selection currently works.

If the database/search API returns matching schools:

- Show matching schools.
- Allow selection.
- Commit the selected school to the parent onboarding state.
- Collapse/hide the search interface when appropriate.
- Keep the selected school visibly present.
- Allow editing/changing the selection.

If there are **no matching schools**, do not trap the user at “No results”. Provide an appropriate action such as:

**School not found? Add it**

Use wording consistent with the actual product.

When the user adds a school:

1. Validate the name.
2. Prevent blank submission.
3. Check duplicates if supported by the data model.
4. Create/add it through the appropriate existing data mechanism.
5. Show loading.
6. Handle success.
7. Handle failure.
8. Preserve entered text if creation fails.
9. On success, hide/collapse the search field.
10. Keep the school name visible before Continue.
11. Store the school in the appropriate onboarding state.
12. Ensure unrelated UI updates do not lose it.
13. Continue must use the actual selected/created school.
14. The user must not have to search again.
15. Editing should reopen the selection interaction.
16. Back/navigation should preserve state according to existing persistence rules.
17. Repeated submission must not create duplicates where duplicate detection is supported.

Required states to inspect:

- Empty
- Focused
- Typing
- Loading
- Results
- Selected
- No results
- Add school
- Adding
- Added successfully
- Add failed
- Duplicate
- Editing selected school

The mockup should communicate important states. The implementation must support the entire interaction.

---

# 40. EVERY FORM MUST HAVE A BEHAVIOR CONTRACT

For every form determine:

### Input

- Allowed values
- Required/optional
- Validation
- Character limits
- Formatting
- Search behavior

### Interaction

- Focus
- Blur
- Keyboard behavior
- Selection
- Clear
- Edit

### Submission

- Disabled conditions
- Loading
- Success
- Failure
- Retry
- Persistence

### Navigation

- What happens after Continue?
- What happens on Back?
- What happens if the user leaves halfway?
- Is progress preserved?

### Error recovery

The user must understand:

- What went wrong
- What needs to change
- Whether their input was preserved
- How to retry

---

# 41. COMPONENT BEHAVIOR MATRIX

For important interactive components, create a matrix such as:

| Component | State | Trigger | Result | Persistence |
|---|---|---|---|---|
| School Search | Empty | Focus | Search becomes active | No |
| School Search | Typing | User enters text | Query updates | Local |
| School Search | Searching | Query submitted | Loading indicator | No |
| School Search | Results | Result selected | School selected | On continue/save |
| School Search | No results | Search completes | Add option shown | No |
| School Search | No results | Add clicked | Add flow opens | No |
| School Search | Adding | Submit | Loading | No |
| School Search | Added | Success | Search collapses, school remains | Yes |
| School Search | Error | Request fails | Error + retry | Preserve input |

Do this for important interactive components.

---

# 42. SCREEN CONTRACT

For every redesigned screen document:

## Screen
Name.

## Purpose
What user problem does it solve?

## Entry conditions
How can the user arrive here?

## Data required
Which real data does it need?

## Components
List major components.

## Initial state
What appears first?

## User actions
List important actions.

## State transitions
Describe what changes after each action.

## Success states
What does success look like?

## Failure states
What does failure look like?

## Empty states
What does no data look like?

## Loading states
What happens while waiting?

## Exit conditions
Where can the user go next?

## Persistence
What survives navigation/reload/session changes?

## Responsive behavior
What changes on mobile/tablet/desktop?

## Accessibility
Keyboard, focus, labels, reduced motion.

---

# 43. COMPONENT RELATIONSHIPS

Do not design components in isolation.

Determine how they behave together.

For example:

**Search Input** → updates query

**Search Results** → receives query results

**Result Item** → commits selected entity

**Selected Entity** → updates parent form state

**Continue Button** → validates parent form state

**Onboarding State** → persists completed data

**Dashboard** → consumes completed onboarding data

The system should behave as one connected flow.

Avoid local UI states that contradict the application's real state.

---

# 44. DATA FLOW AUDIT

For every important user action, trace the data.

Example:

**User enters school**

↓

Search state

↓

Search service/API/data source

↓

Results

↓

User selects/adds school

↓

Entity/state update

↓

Onboarding state

↓

Persistence

↓

Continue

↓

Dashboard

Use the existing architecture where possible.

Do not create a second source of truth.

Do not duplicate important state unnecessarily.

---

# 45. BEHAVIORAL EDGE CASES

For every major flow deliberately test where applicable:

- No results
- One result
- Many results
- Duplicate result
- Very long text
- Special characters
- Empty input
- Invalid input
- Slow response
- Failed response
- Retry
- Double click
- Back
- Cancel
- Refresh
- Navigation away
- Returning to the page
- Partial completion
- Existing saved state
- Mobile keyboard
- Small screen
- Large screen

The design and implementation should account for these cases.

---

# 46. MOCKUPS MUST REPRESENT BEHAVIORAL STATES

Do not generate only ideal/default screens.

For important interactions generate relevant states.

### Search

- Default
- Focused
- Results
- No results
- Add option
- Selected
- Error

### Forms

- Default
- Filled
- Validation error
- Loading
- Success

### Data pages

- Loading
- Populated
- Empty
- Error

### Opportunities

- Default
- Filtered
- No results
- Saved
- Locked if applicable

The visual design should communicate how the interface behaves.

---

# 47. IMPLEMENTATION MUST FOLLOW BEHAVIORAL ACCEPTANCE CRITERIA

Do not mark a screen implemented because it visually resembles a mockup.

A screen is implemented only when:

- Visual hierarchy is correct.
- Data is real.
- Interactions work.
- State changes work.
- Navigation works.
- Errors work.
- Loading works.
- Empty states work.
- Persistence works where required.
- Responsive behavior works.
- Accessibility works.
- The screen works correctly with the rest of the product.

---

# 48. UX IMPROVEMENT AUTHORITY

You are expected to improve behavior beyond what is explicitly visible in the mockups.

If a mockup shows:

**Search school**

but the codebase reveals that users can encounter schools not present in the database, design the missing behavior.

If a flow has an obvious dead end, fix it.

If a selection can be accidentally lost, preserve it.

If a user cannot recover from an error, add recovery.

If a CTA becomes valid only after required data exists, reflect that state.

If a modal/sheet is unnecessary, simplify it.

The goal is the best possible UX, not literal screenshot reproduction.

---

# 49. UX HEURISTICS

When the mockups do not specify behavior, use established usability principles:

- Visibility of system status
- Clear affordances
- Immediate feedback
- Consistency
- Recognition over recall
- Error prevention
- Easy recovery
- User control
- Progressive disclosure
- Clear information hierarchy
- Minimal cognitive load

For every proposed behavior ask:

> What will the user expect to happen next?

Then make the interface behave accordingly.

---

# 50. IMPLEMENTATION LOOP

For each major feature:

### Step 1
Inspect existing implementation.

### Step 2
Identify the data flow.

### Step 3
Identify current states.

### Step 4
Identify missing states and edge cases.

### Step 5
Create UX flow.

### Step 6
Create component/state specification.

### Step 7
Generate visual mockups.

### Step 8
Implement.

### Step 9
Run the flow.

### Step 10
Compare actual behavior against the specification.

### Step 11
Fix inconsistencies.

### Step 12
Move to the next feature only when the current flow is coherent.

Do not generate dozens of screens first and discover later that their interactions do not work together.

---

# 51. FINAL BEHAVIORAL DELIVERABLE

In addition to visual mockups, produce a **Behavior & Interaction Map**.

For every major screen include:

**Screen → Components → States → Events → Data → Side effects → Navigation → Persistence → Error recovery**

For every major user journey include:

**Start → Action → State → Result → Next action → Completion**

This should be detailed enough that another engineer could understand intended product behavior without seeing the mockup.

---

# 52. FINAL STANDARD

The final product must not be:

> “A beautiful implementation of some screenshots.”

It must be:

> **A coherent interactive product whose visual design, component behavior, data flow, navigation, state management, error handling, feedback, transitions, accessibility, and real product behavior all support the same user experience.**

Visual design is only one layer.

The implementation must align:

**UX**

↓

**UI**

↓

**Components**

↓

**State**

↓

**Data**

↓

**Navigation**

↓

**Persistence**

↓

**Feedback**

↓

**Motion**

↓

**Accessibility**

↓

**Real product behavior**

That is the standard for completion.
