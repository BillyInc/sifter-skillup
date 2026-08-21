# Subject → programme → university mapping audit (2026-08-17)

This is a repository seed audit. It validates structural joins and the separate O-level/UTME layers; it does not replace a source review of brochure wording or a live database refresh.

## What is proven

- 506 structured options are attached to 420 JAMB programme rows.
- 506 options point to a known requirement row.
- 321 structured programmes have at least one seeded university offering.
- 185 programmes have both UTME and O-level structured options, so combined matching can intersect them by the same JAMB programme ID.
- University-specific confirmation still happens after a programme is selected, through its offering rows; the subject matcher must not imply that a national programme match is an offer from every university.

## Counts

- `jambProgrammes`: 420
- `requirements`: 420
- `schools`: 779
- `universityOfferings`: 7888
- `subjectCatalogue`: 44
- `structuredOptions`: 506
- `utmeOptions`: 321
- `olevelOptions`: 185
- `programmesWithUtmeAndOlevel`: 185

## Errors

- `declared_minimum_below_structured_minimum`: optionId=c18fc0cf-864a-505d-a7a4-3964670f629d, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=263caa64-7fdb-5266-9619-0beff16285bc, examType=olevel, declaredMinimum=5, structuredMinimum=7
- `declared_minimum_below_structured_minimum`: optionId=bf1223e2-9db0-5970-bf50-1cffae0f8c42, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=2cb8512b-8cdd-51b9-b5cd-8a6c283ff393, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=879dbda5-69cd-56f7-9140-142617e25d4d, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=4bc4cec5-391d-5562-9997-8f627f67e465, examType=olevel, declaredMinimum=5, structuredMinimum=7
- `declared_minimum_below_structured_minimum`: optionId=e678ec98-715e-5179-90bf-5f8adea70f47, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=7362084e-3061-5f29-b0c3-9a1f31d63794, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `option_has_no_subject_items`: optionId=39b8145b-b00f-5d9e-894a-7ab9a7a676fb
- `declared_minimum_below_structured_minimum`: optionId=f80c1740-ed0b-5ef9-af24-58b30dc1a8e9, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=a1c663ee-adf5-59da-9a4a-c06e3a92d480, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=c51f6c33-ae6e-51f8-9c01-21e3c5f64f9b, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=2fbc1c31-ecbd-5dc1-b8ef-113407429f1a, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=61fa3d1f-df0e-58ef-8cc1-c52500c46d28, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `option_has_no_subject_items`: optionId=df1cc575-77e2-54d5-b5ec-0b41124935e6
- `declared_minimum_below_structured_minimum`: optionId=ba9b6f4e-69c3-54dd-b197-381b37d70664, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=55c654b4-db79-5c3b-afbe-bbe2de30f477, examType=olevel, declaredMinimum=5, structuredMinimum=9
- `declared_minimum_below_structured_minimum`: optionId=a39c6cd6-e6ac-507e-a80c-779745800fb3, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=2482d36a-3d63-511c-b617-1feb2d635c32, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=1e7f622d-2948-5088-8349-3f43c8268706, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=3cb1c152-ba59-593c-a196-71016475394c, examType=olevel, declaredMinimum=5, structuredMinimum=6
- `declared_minimum_below_structured_minimum`: optionId=899a34d2-f291-58be-b52d-6caf8662551c, examType=olevel, declaredMinimum=5, structuredMinimum=12

## Manual/source review warnings

- `declared_minimum_above_structured_minimum`: 127

## Interpretation boundary

O-level matching answers whether the selected O-level subjects satisfy a structured O-level option. UTME matching answers whether the selected UTME subjects satisfy a structured UTME option. Combined matching requires both layers for the same JAMB programme ID. None of those checks proves a university-specific admission decision; the selected university's offering and current published requirements remain the final confirmation surface.
