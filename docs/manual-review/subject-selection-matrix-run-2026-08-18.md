# Subject selection matrix audit (2026-08-20)

This run builds valid synthetic selections from every generated UTME and O-level option, compares the application matcher with an independent evaluator, checks the combined intersection, and verifies university offerings.

## Result

- `layerMatcherMatchesIndependentEvaluator`: PASS
- `allReturnedProgrammesHaveUniversityOfferings`: PASS
- `technicalTradeOnlyCodesExcludedFromUtme`: PASS
- `combinedUsesSameProgrammeIdIntersection`: PASS
- `allUtmePickerCombinationsEnumerated`: PASS
- `allMinimumOlevelCombinationsEnumerated`: PASS
- `allExactSixOlevelCombinationsEnumerated`: PASS
- `largerOlevelSelectionsCoveredByMonotonicity`: PASS
- `apiDefaultLimitCoversAllEnumeratedResultSets`: PASS

## Counts

- `subjectCatalogue`: 46
- `utmeOptions`: 406
- `olevelOptions`: 334
- `programmeSelectionCases`: 740
- `combinedSelectionCases`: 329
- `universityOfferingRows`: 9130
- `universityOfferingPairsWithKnownSchoolAndProgramme`: 9130

## Exhaustive picker coverage

- `utmeExactPickerSelections`: 2024 selections; max 145 programmes; SHA-256 `d3015654e75e1a44b72f3fafb7052dc19db8450fde2f066632a7c1df01cb861e`.
- `olevelExactFiveSelections`: 1370754 selections; max 235 programmes; SHA-256 `7f9399b74d6a3e746ce005710a317c9745ef852c062495fba5518b00a85f839f`.
- `olevelPartialSelectionsForCombined`: 1370754 selections; max 334 programmes; SHA-256 `aec75add91dd4d41ec6c0f83066151d1c7df86e9d78112313ff2a6d4176cb664`.
- `olevelLargerSelectionClosure`: 9366819 exact-six selections; max 252 programmes; SHA-256 `b382c23c06ffc0837309d2e5ac640786cae96757ccb95a5dc9251f396ae3436f`.
- `combinedUniqueResultSetPairs`: 3946200 unique layer-result pairs; max 124 programmes; SHA-256 `4034a5e4ae98c15985555e72109e7abab34bc4b82f228bc462d60f413126d79e`.
- Larger O-level selections covered: `57754662670` possible selections by monotonicity of the stored predicates.

## Layer behavior

- O-level-only selections are evaluated only against O-level options.
- UTME selections are evaluated only against UTME options.
- Combined selections intersect UTME and O-level programme IDs; subjects are not flattened into one exam list.
- University rows are joined by the same JAMB programme ID after programme matching.

## Mismatches

- None found.

## Source boundary

A PASS proves the generated rule and join behavior. It does not convert brochure text marked `needs_review` into an exact rule; those records remain a manual/source-review boundary.
