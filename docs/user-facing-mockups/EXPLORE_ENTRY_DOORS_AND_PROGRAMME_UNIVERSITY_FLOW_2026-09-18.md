# Explore entry-door contract (2026-09-18)

This document records the route contract for the three secondary/JAMB Explore
starting points and the separate undergraduate starting point. It applies to
the student Explore surface and to the same reusable admission screen inside
an administrator guidance workspace.

## I know what and where

This is a dedicated programme-and-university workspace. It must not dispatch
the user to the global career search engine.

1. The user enters the exact programme name.
2. The search returns distinct JAMB programme identities. A variant is not
   merged into another identity because its curriculum and university
   offerings may differ.
3. The screen explains why more than one identity may appear.
4. After the user selects one identity, the screen loads only the universities
   recorded as offering that identity.
5. The university area has its own search field, shows the full university name
   and address, and provides a selection tick.
6. Opening the selected university goes directly to the university-specific
   programme details and requirements. This route does not show the unselected
   programme preview first.

The university-specific screen owns the actual national requirement,
university requirement, exception note, programme teaching profile and
downstream domain guidance. The search workspace does not duplicate those
details.

## I know what, not where

This opens the programme-search-only workspace. It uses the same exact JAMB
identity disambiguation but stops at the selected programme's preview. The
preview then offers the university-offerings step. It must not show the mixed
“programme, university or subject plan” hub wording.

## I don't know yet

This opens the subject-matching-only workspace. It must establish user context
before showing the subject picker:

- SS1/SS2: choose class and stream, then use the O-level subject gate;
- SS3/JAMB: use the O-level and UTME combination; and
- the stream helps organise the starting suggestions but never replaces the
  subject eligibility rules.

The subject workspace must not expose a generic UTME/O-level switch before the
user context is known. It must enforce the existing minimum and maximum gates,
then show matched JAMB programme identities. Universities appear only after a
programme identity has been selected.

## I am studying this programme

An undergraduate is already attached to a university/programme context. They
must not see the secondary/JAMB doors above, including “I know what and where”,
“I know what, not where”, or the subject picker.

1. The Explore entry says “I’m studying this programme”.
2. It opens the university-first workspace (`mode=school` with the student
   journey context), where the student chooses or confirms the university.
3. The student chooses the programme from that university’s recorded offering
   list.
4. The selected offering opens its university-aware programme page and then
   continues into the programme’s connected domains, subgroups and roles.

The undergraduate route is programme-to-guidance, not admission discovery. It
does not ask the student to solve national subject matching again.

## Implementation boundary

The entry contract is carried in route-local parameters (`entry`, `mode`,
`user_type`, `class_name`, `stream`, and `exam_type`). It does not use the
global search query as a substitute for the guidance context. The same
programme, university, domain, subgroup and role components remain reusable;
only the entry context and next decision change.

No live Supabase data is fabricated by this flow. An empty offering or subject
result remains an honest data state and does not fall back to a generic route.
