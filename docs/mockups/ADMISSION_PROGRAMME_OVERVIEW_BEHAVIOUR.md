# Admission Programme Overview Behaviour Mockup

Status: product decision draft for refinement before broad UI implementation

This is a behaviour and hierarchy mockup. The codebase remains the source of
truth for names, entities, requirements, mappings, and available fields.

## 1. Programme search result

```text
Find a programme or university
[ Nursing                                           ]

PROGRAMME
Nursing
Health and Biomedical

University offerings
University of Lagos       Nursing
University of Ibadan      Nursing Science
University of Benin       Nursing

[Open programme overview]                         [Save]
```

Rules:

- The top title is the resolved student-facing JAMB programme name.
- University-specific names are shown as offerings, each beside its university.
- Do not render `Nursing/Nursing Science` as one title.
- Do not show CCMAS, canonical mapping labels, or internal discipline names in
  the student result.
- If the source cannot establish the relationship, show the available name and
  an honest explanation instead of merging names.

## 2. Programme overview

```text
< Back to results

Nursing
University offering: University of Lagos - Nursing

What this programme prepares you for
Plain-language summary from the programme learning data.

[Overview] [Requirements] [Universities] [Career mapping]

WHAT YOU WILL LEARN
Primary programme outcomes, explained for a student.

START WITH
The first source-backed skills and foundations.

THEN BUILD
Supplementary skills, tools, and certifications where available.

NEXT
[Review admission requirements] [Explore career mapping]
```

Rules:

- Overview is the default detail state and is independently reachable.
- The selected university remains visible in the context line.
- Missing data gets a plain-language empty state; it does not show parser or
  database wording.
- `Requirements` shows UTME, O-level, Direct Entry where applicable, source and
  freshness. It does not ask for subjects again unless the user chooses
  `Check my subjects`.
- `Universities` shows other school-specific offerings.
- `Career mapping` is available only after the programme/university context is
  resolved, and then continues to domains -> sub-groups -> roles.

## 3. Educator guidance workspace context

```text
Guidance workspace                         School: Country Heights

[Learner: Ada Okafor v] [Learner scope: SS2 Science v]

Current guidance session
SS2 Science -> O-level subjects -> programme options

[Start from subjects] [Start from programme] [Open learner profile]

Learner scope view
12 learners linked      8 setups started      5 programme choices
[Review cohort patterns] [Add learner]
```

Rules:

- Switching learner or learner scope clears the prior learner's unsaved programme,
  university, and subject state before loading the new context.
- Any aggregate learner pattern is a separate admin guidance signal, not an
  individual diagnosis. It is not the meaning of the sibling sections beside
  `Overview` on a student programme screen.
- The educator can skip provisioning and use the national catalogue, but the
  catalogue remains inside the admin shell and keeps the guidance context.
- University admins get a peer-comparison version for their university scope;
  school educators do not get university-management controls.

## 4. Report entry point

```text
Selected path: Nursing at University of Lagos

[Save] [Print report]

Report includes:
Academic choice | Requirements | University offering | Domain mapping
Sub-groups | Career roles | Skills | Tools | Certifications

Watermark: Sifter LevelUp
School: Country Heights
```

Rules:

- Save and print are independent actions.
- Guests see `Create account` before saving or printing.
- Reports are contextual and source-backed; no fake demand or Post-UTME data.
- Student school name is included when self-entered or institution-provisioned.
