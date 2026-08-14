# Guidance Report Behaviour

Status: implementation contract

## Purpose

The report is the durable output of the complete guidance journey. It is not a
short recommendation card and it is not a database export. It must preserve the
full path that the student or educator actually resolved:

`academic context -> subjects -> programme -> university -> requirements -> selected domains -> selected sub-groups -> selected roles -> skills/tools/certifications`

The report must never silently add every domain, sub-group, or role available in
the catalogue. A programme can have many mapped domains, but only domains the
student opened and selected for the report belong in the selected-path section.
The same rule applies to sub-groups and roles.

## Selection contract

The current guidance path is saved per learner account. It contains:

- student type, class, stream, school or tutorial-centre context;
- selected O-level subjects and, where relevant, UTME subjects;
- the selected university and the exact university programme offering;
- the published O-level and UTME requirements used for the decision;
- selected domain branches, each with its source domain key and match type;
- selected sub-groups under those domains;
- selected career roles under those sub-groups;
- the route source, such as onboarding, Explore, or educator guidance.

IDs are used to resolve current source data. Display labels are retained as a
snapshot so a later rename does not make an old report unreadable.

## Report sections

Sections are conditional, but no selected information is removed to force a
page count:

1. **Path header**: learner name, student type/class/stream, school or centre,
   date, and Sifter LevelUp watermark.
2. **What you selected**: the exact discovery door and selected subjects.
3. **Programme and university**: the university-specific programme name and
   the university details available in the source data.
4. **Admission requirements**: O-level credits, UTME subjects, known gaps or
   review states, and source/qualification notes. Do not show Post-UTME or
   unsupported score claims.
5. **Selected domain map**: each selected domain, its relationship to the
   programme (direct, functional, or adjacent), and its explanation.
6. **Selected sub-groups**: only sub-groups the learner selected, with each
   sub-group's own description, skills, tools, and certifications.
7. **Selected roles**: only roles the learner selected, with role-specific
   skills, tools, certifications, and related context. Role skills are not
   interchangeable with domain or subgroup skills. Role tools and
   certifications must come from role-owned records when those records exist.
8. **What to focus on next**: source-backed primary items first, then
   supplementary items. If priority is unavailable in the source data, explain
   use and scope instead of inventing a ranking.
9. **Data notes**: clear explanations for unavailable or unparsed source data.

## Length and readability

The report may be longer than a single page when the learner selected several
branches. Length is controlled by hierarchy and progressive detail, not by
dropping information. Each selected entity gets one clearly labelled block;
repeated programme and domain metadata is shown once and referenced thereafter.
The HTML and DOCX exports must use page breaks, headings, short explanations,
and readable lists so a full report remains legible rather than becoming a raw
table dump.

## Bookmarking and printing

Bookmarking is independent from printing. A signed-in learner can print the
current confirmed path without bookmarking first. Saving a domain, subgroup, or
role is a separate action and does not automatically add it to the report.
The report action must use the current route/path context and must not redirect
to Community, Forgot Password, a legacy learning route, or generic Home.

Guests can preview the same public discovery data, but saving and printing
requires account creation. The UI must say why without claiming that a guest
report was saved.

## Educator and admin reports

An educator guidance session uses the same selection contract with a separate
learner ID and creator/access context. The report contains the learner's school
or tutorial-centre name when available, applies the same selected-branch rule,
and is only printable when the administrator has access to that learner.
Admin reports use the same student-facing language and source-backed content;
they do not substitute national aggregates or admin-only metrics for the
learner's actual guidance path.

## Surface states

- **No confirmed path**: explain that the learner must choose a programme and
  university before printing.
- **Programme confirmed, no domain selected**: show the programme and
  requirements; explain that domain mapping can be added from Explore.
- **Domain selected, no subgroup/role selected**: show the selected domain and
  its own details; do not invent a role choice.
- **Source incomplete**: show the available source-backed fields and a plain
  explanation of what is unavailable. Never display a domain or subgroup tool
  as if it were owned by a role simply because the role has no enrichment row.
- **Guest**: show Create account for save/print actions.
