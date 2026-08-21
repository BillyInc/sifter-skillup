# Subject layers and university exceptions

This is the contract between the subject picker, JAMB programme matching and
career guidance.

## 1. Subject catalogue

`subject_catalog` is a union of exam layers, not a single 46-subject exam.

- The current seed has 25 UTME subjects.
- The current seed has 46 O-level subjects.
- Technical and trade rows are O-level choices unless a source-backed rule
  explicitly marks a subject as UTME-valid.
- Stream tags only change ordering in the picker. They never hide a valid
  subject or change eligibility.
- Requirement aliases such as `General Wood Work` → `Woodwork` are normalized
  to a canonical selectable subject. Direct-entry-only qualifications remain
  in the official text and are not turned into ordinary UTME choices.

## 2. National programme matching

The brochure parser produces separate structured options:

```text
selected UTME subjects  -> JAMB programme UTME option
selected O-level subjects -> same JAMB programme O-level option
both layers              -> intersection by jamb_programme_id
```

Required subjects, alternatives and total credit minimums are separate pieces
of the rule. For example, “English, Mathematics, Economics and any two of six”
requires the three named subjects, two alternatives and five selected O-level
subjects in total.

An unparseable layer keeps its official source text and is marked for review;
it is never silently emitted as an exact structured rule.

## 3. University-specific requirements

The national match identifies the JAMB programme. The university offering is
loaded next from `school_programmes` / its offering view. Its `remarks`, local
UTME/O-level text and direct-entry text are attached only to that
school–programme pair. Every raw waiver/exception is also preserved in
`school_programme_requirement_exceptions`, with its exam scope, source label
and parse status.

The app therefore shows:

1. the national programme requirement;
2. the selected university, address and university-specific admission note;
3. a clear message that the note applies to that university only;
4. `needs_confirmation` when the university exception is still raw prose and
   has not passed structured rule review; exact parsed rules are evaluated only
   for that university offering.

Raw university prose is not treated as a universal rule. The seed preserves
3,883 scoped exception records, with 1,820 structured local subject options
(698 UTME and 1,122 O-level; 787 full rules and 1,033 partial conditions,
including condition-only and inherited cross-reference options). A condition-only
option records an exact waiver, exclusion, grade or sitting condition but has
no subject items, so it cannot pass the university eligibility matcher by itself.
The remaining genuinely ambiguous prose stays `needs_review`; direct-entry notes
remain a separate admission route. A partial rule is displayed as a local
condition, not as proof that the complete admission combination has been
satisfied.

## 4. Career mapping boundary

Subject matching does not map directly to a domain or role. The downstream
chain remains:

```text
subjects -> JAMB programme -> selected university offering
         -> CCMAS programme mapping -> domain -> subgroup -> role
```

An admission exception does not rewrite CCMAS inheritance or domain/role
relationships. A separate curriculum mapping review is needed only if evidence
shows that a university's programme is a genuinely different programme
identity, rather than the same programme with different admission conditions.

## 5. User-type behavior

- SS1/SS2: O-level subject guidance and early programme exploration.
- SS3/JAMB: O-level and UTME subject matching when the student requests it.
- Undergraduate: university and the university's programme list; no subject
  matcher by default.
- Admin guidance: the admin must choose the student class/type and, where
  applicable, stream before subject guidance is shown.
