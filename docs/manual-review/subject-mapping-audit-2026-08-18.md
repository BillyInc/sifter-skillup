# Subject → programme → university mapping audit (2026-08-18)

This is a repository seed audit. It validates structural joins and the separate O-level/UTME layers; it does not replace a source review of brochure wording or a live database refresh.

## What is proven

- 384 structured options are attached to 420 JAMB programme rows.
- 384 options point to a known requirement row.
- 292 structured programmes have at least one seeded university offering.
- 92 programmes have both UTME and O-level structured options, so combined matching can intersect them by the same JAMB programme ID.
- University-specific confirmation still happens after a programme is selected, through its offering rows; the subject matcher must not imply that a national programme match is an offer from every university.

## Counts

- `jambProgrammes`: 420
- `requirements`: 420
- `schools`: 779
- `universityOfferings`: 7888
- `subjectCatalogue`: 46
- `structuredOptions`: 384
- `utmeOptions`: 271
- `olevelOptions`: 113
- `programmesWithUtmeAndOlevel`: 92

## Errors

- None found by the structural audit.

## Manual/source review warnings

- `declared_minimum_above_structured_minimum`: 45
- `structured_option_requirement_not_marked_parsed`: 21

## Interpretation boundary

O-level matching answers whether the selected O-level subjects satisfy a structured O-level option. UTME matching answers whether the selected UTME subjects satisfy a structured UTME option. Combined matching requires both layers for the same JAMB programme ID. None of those checks proves a university-specific admission decision; the selected university's offering and current published requirements remain the final confirmation surface.
