# Subject → programme → university mapping audit (2026-08-20)

This is a repository seed audit. It validates structural joins and the separate O-level/UTME layers; it does not replace a source review of brochure wording or a live database refresh.

## What is proven

- 740 structured options are attached to 420 JAMB programme rows.
- 740 options point to a known requirement row.
- 411 structured programmes have at least one seeded university offering.
- 329 programmes have both UTME and O-level structured options, so combined matching can intersect them by the same JAMB programme ID.
- 3884 raw university-specific exception records are preserved and linked to known offering/programme rows; 2031 exact local subject rules are structured beneath them.
- University-specific confirmation still happens after a programme is selected, through its offering rows; the subject matcher must not imply that a national programme match is an offer from every university.

## Counts

- `jambProgrammes`: 420
- `requirements`: 420
- `schools`: 862
- `universityOfferings`: 9130
- `subjectCatalogue`: 46
- `structuredOptions`: 740
- `utmeOptions`: 406
- `olevelOptions`: 334
- `programmesWithUtmeAndOlevel`: 329
- `universityRequirementExceptions`: 3884
- `structuredUniversitySubjectOptions`: 2031
- `structuredUniversitySubjectItems`: 12213

## Errors

- None found by the structural audit.

## Manual/source review warnings

- `declared_minimum_above_structured_minimum`: 78
- `structured_option_requirement_not_marked_parsed`: 5

## Interpretation boundary

O-level matching answers whether the selected O-level subjects satisfy a structured O-level option. UTME matching answers whether the selected UTME subjects satisfy a structured UTME option. Combined matching requires both layers for the same JAMB programme ID. Exact university rules are evaluated only against their own school-programme offering; partial rules are conditions, not complete eligibility proofs. Ambiguous university prose remains `needs_review`, and the selected university's current published notice remains the final confirmation surface.
