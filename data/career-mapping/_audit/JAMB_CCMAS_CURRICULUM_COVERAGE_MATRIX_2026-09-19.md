# JAMB/CCMAS curriculum coverage matrix

Generated from the checked-in inheritance, programme-mapping, and curriculum-scope audit artifacts. This is a local audit only; it does not apply SQL or change student exposure.

Denominator: **420** unique JAMB names. Stored states: **86 `review_required`**, **0 `unavailable`**.

## Coverage

| Case | JAMB rows | Share | Review-required | Unavailable | Evidence / handling |
| --- | ---: | ---: | ---: | ---: | --- |
| Partial CCMAS curriculum scope | 273 | 65.0% | 0 | 0 | Reviewed course-scoped CCMAS slices; only anchored domain links may be exposed. |
| Combined CCMAS components | 28 | 6.7% | 0 | 0 | Explicit primary plus supporting component references; links are the reviewed component union. |
| No CCMAS standard / external evidence required | 6 | 1.4% | 0 | 0 | D_custom rows with external scope; no unscoped CCMAS fan-out is permitted. |
| Single full CCMAS curriculum (baseline) | 113 | 26.9% | 86 | 0 | One resolved CCMAS programme inherited in full; this is the comparison baseline. |

## Multi-discipline and split checks

- Combined rows: **28**; **10** span two or more named CCMAS disciplines, **1** include a custom/external component, and **18** do not span two or more named CCMAS disciplines.
- Split/fan-out review queue: **83** CCMAS components are referenced by **346** overlapping JAMB rows. These rows are not an additional category and are not automatically promoted to full curriculum coverage.
- Fan-out states: `{"ready": 48, "ready_external": 1, "ready_partial": 233, "review_required": 64}`; review-required rows: **64**; unavailable rows: **0**.

## Guardrails

- Partial rows expose only their recorded course-scoped evidence.
- No-CCMAS rows remain external-source cases; missing evidence must remain `review_required` or `unavailable`.
- Combined rows retain component references and are not collapsed into a single discipline.
- Fan-out is a review queue for source enrichment, not a claim that every JAMB label has an independent CCMAS curriculum.

The machine-readable matrix and focused regression test sit beside this report.
