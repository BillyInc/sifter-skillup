# Manual review protocol

Use [manual-review-100.md](./manual-review-100.md) while running the platform.
The machine-readable version is [manual-review-100.json](./manual-review-100.json).

## How to run one case

1. Start with the account gate named in the case.
2. Enter the student type, class and stream exactly as shown.
3. Enter the listed UTME and/or O-level subjects. Do not add subjects unless
   the case is specifically testing a gap or a threshold.
4. Search for the listed JAMB programme and confirm the exact JAMB name.
5. Open the programme overview and compare the faculty, degree type, skills
   preview and requirement text.
6. Open the university list and confirm that the selected university is linked
   to the listed JAMB programme ID. Check the address state: an address may be
   unavailable because the current seed does not populate institution address
   fields; the UI must not invent one.
7. Open the current domain mapping, select the path shown in the case, and
   confirm the subgroup/role relationship from the live registry.
8. Save the guidance path, then print/download the report. Confirm that only
   the selected branch appears and that the report gate blocks incomplete paths.
9. For school-owner cases, manually create the student first, verify draft vs
   real-account behavior, claim-card data, context attachment, consent state,
   and report access before marking the case complete.

## Result recording

Use the checkboxes in the Markdown pack. For every failure, record:

- case ID;
- exact screen and action;
- expected value from the case;
- actual value shown;
- source ID(s);
- whether the problem is a UI label, flow state, live-data gap, wrong mapping,
  or source-data error;
- a screenshot or console/API response when available.

Do not mark a case as passed because the screen loaded. A pass requires the
displayed identity, requirement state, university offering, mapping branch and
report output to agree with the case's source IDs and rules.

## What 100 cases can prove

This is a stratified first gate: it exercises SS1, SS2, SS3, JAMB, undergraduate
and secondary-school-owner behavior, including positive matches, subject gaps,
programme search, university selection and report printing.

It cannot certify every current record. The repository currently contains 420
JAMB registry rows, 3,342 JAMB-domain links and 7,888 unique school/programme
offering pairs (7,889 seeded rows before one duplicate pair is collapsed).
After this pass, expand review around every failure cluster and run a separate
coverage audit for all remaining JAMB names, domain links and university
offerings.
