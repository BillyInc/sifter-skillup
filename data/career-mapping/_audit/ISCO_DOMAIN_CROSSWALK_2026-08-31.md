# ISCO domain-code reconciliation — 2026-08-31

> **Superseded:** This historical report is not the current disposition. A fresh official ILO search source-closed all eight values. See [ISCO_DOMAIN_CODE_SOURCE_CLOSURE_2026-09-04.md](ISCO_DOMAIN_CODE_SOURCE_CLOSURE_2026-09-04.md); it records zero records left pending.

The domain-definition library contained eight four-digit values absent from the supplied ISCO-08 workbook. This historical report preserves the raw values and the earlier conservative candidates. Use the source-closed report above for the current result.

- Missing raw codes: **8**.
- Affected domains: **4**.

| Raw library code | Disposition | Valid parent | Valid sibling unit groups | Affected domains |
|---|---|---|---|---|
| `2121` | `invalid_code_candidate_only`; The supplied ISCO-08 workbook contains 2120, not 2121. 2120 is the only valid child of parent 212, but the source library gives no title or meaning proving that 2121 is a transcription of 2120. | 212 — Mathematicians, Actuaries and Statisticians | 2120 — Mathematicians, Actuaries and Statisticians | D003 Artificial Intelligence |
| `2213` | `invalid_code_parent_anchor_only`; The supplied ISCO-08 workbook contains 2211 and 2212 under parent 221, not 2213–2216. The valid parent is retained as the safe structural anchor; no specialist child is inferred. | 221 — Medical Doctors | 2211 — Generalist Medical Practitioners, 2212 — Specialist Medical Practitioners | D023 Medicine |
| `2214` | `invalid_code_parent_anchor_only`; The supplied ISCO-08 workbook contains 2211 and 2212 under parent 221, not 2213–2216. The valid parent is retained as the safe structural anchor; no specialist child is inferred. | 221 — Medical Doctors | 2211 — Generalist Medical Practitioners, 2212 — Specialist Medical Practitioners | D023 Medicine |
| `2215` | `invalid_code_parent_anchor_only`; The supplied ISCO-08 workbook contains 2211 and 2212 under parent 221, not 2213–2216. The valid parent is retained as the safe structural anchor; no specialist child is inferred. | 221 — Medical Doctors | 2211 — Generalist Medical Practitioners, 2212 — Specialist Medical Practitioners | D023 Medicine |
| `2216` | `invalid_code_parent_anchor_only`; The supplied ISCO-08 workbook contains 2211 and 2212 under parent 221, not 2213–2216. The valid parent is retained as the safe structural anchor; no specialist child is inferred. | 221 — Medical Doctors | 2211 — Generalist Medical Practitioners, 2212 — Specialist Medical Practitioners | D023 Medicine |
| `2311` | `invalid_code_candidate_only`; The supplied ISCO-08 workbook contains 2310, not 2311. 2310 is a possible transcription candidate, but it is not promoted without source-meaning confirmation. | 231 — University and Higher Education Teachers | 2310 — University and Higher Education Teachers | D039 Higher Education |
| `2321` | `invalid_code_candidate_only`; The supplied ISCO-08 workbook contains 2320, not 2321. 2320 is a possible transcription candidate, but it is not promoted without source-meaning confirmation. | 232 — Vocational education teachers | 2320 — Vocational Education Teachers | D039 Higher Education |
| `3330` | `invalid_code_parent_anchor_only`; The supplied ISCO-08 workbook contains parent 333 and child groups 3331–3334/3339, not 3330. The generic parent is retained; no child is selected without role meaning. | 333 — Business Services Agents | 3331 — Clearing and Forwarding Aents, 3332 — Conference and Event Planners, 3333 — Employment agents and contractors, 3334 — Real Estate Agents and Property Managers, 3339 — Business Services Agents Not Elsewhere Classified | D040 Vocational |

## Decision boundary

A missing four-digit code is a source/provenance defect, not proof that the associated domain is invalid. The parent and sibling groups identify where the intended occupation may sit in ISCO-08, but none is an exact replacement unless the original source meaning supports it. The raw value, disposition, and limitation must remain visible until that review occurs.

## Reproducibility

```text
python data/career-mapping/_build_isco_domain_crosswalk.py
```
