# Authoritative follow-up addendum — rows 007–009

Audit date: 2026-09-26 (Africa/Lagos). Append-only source and current-map review. No shared source, inventory, mapping, curriculum scope, code, seed, SQL, label, or role record was changed.

## JAMB source-cell verification

Official JAMB IBASS [Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf); PDF-derived text `data/career-mapping/_jamb_txt/Social Management Science.txt` preserves printed page footers and the table sequence.

| Row | Printed cell locator | Parsed institution comparison | Result |
|---:|---|---|---|
| 007 Criminology and Penology | Printed p. 613, immediately before the page footer: `CRIMINOLOGY AND PENOLOGY` — RSU, SALEM. | Exact match to occurrence `2980b53ae7ec073d`. | Verified. This corrects `_001.md`'s p. 617 locator; p. 617 is later requirements text, not the offering cell. |
| 008 Criminology | Printed p. 613, after the separate `CRIMINOLOGY` heading — BAYERO, CALEB, JEWEL, POL-ACAD. | Exact match to occurrence `3078528f4f2b768e`. | Verified. The occurrence is distinct from rows 007 and 009. |
| 009 Criminology and Security Studies | Separate heading begins on printed p. 613; institution block continues on pp. 614–615. | All 63/63 inventory tokens occur in that PDF-derived table-text region; none are absent. | Text-layer reconciliation complete; visual cell-boundary check remains open. Do not borrow JOS from the separate Law-faculty cell at Law brochure p. 430. |

## CCMAS evidence and active-link audit

Official source: NUC [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf). The course table lists CSS 204, CSS 205 and CSS 406 at printed pp. 26–27. Their detailed outcomes/content are at pp. 33–34 (CSS 204/205) and pp. 43–44 (CSS 406). The actual outcome text inspected in the official PDF establishes:

- CSS 204: criminology/security statistics, descriptive and inferential methods, hypothesis tests, correlation/regression, research-report interpretation, and statistical-software use. The course table calls it **Applied Statistics in Criminology and Security Studies**; the detailed course heading calls it **Applied Statistical Methods in Criminology and Security Studies**. Preserve this internal source title variation rather than treating the local title flag as missing evidence.
- CSS 205: human rights and criminal-justice administration, agencies, oversight, victims/suspects/offenders, and Nigerian legal instruments. This supports criminology/criminal-justice learning, not legal-practice qualification.
- CSS 406: national-security policy/strategy formulation, comparison, and its connection to development planning. This supports a bounded security-policy learning facet, not general public-administration or economics competence by itself.
- The programme objectives and course set describe criminology/security theory, research, practice, criminal justice, policing, forensic investigation and security policy; relevant primary locators include CSS 303 outcomes at p. 39 and CSS 403 at p. 41.

Current data snapshot (`jamb_curriculum_scopes_2026-08-17.json` and active `jamb_domain_map.json`) shows:

- Rows 007 and 008 expose six links: D151 Criminology/Criminal Justice and Corrections (direct), D077 Security Services (direct), plus D063 Economics and Policy Analysis, D078 Social Sciences, D037 Legal Practice, and D028 General Management (all functional). The selected courses support D151 and a bounded D077 security path. D063 is weakly supported at most by CSS 403 policy discussion; the scope contains no explicit economics analysis. D037's criminal-procedure/human-rights coursework is not legal-practice training. D028's two anchors (human-rights course and internship) do not establish general management. D078 has research/statistics anchors, but its broad domain and descendant roles require task-level evidence. These four functional links are **confirmed weak/overbroad candidates**, not changed here; the later role/task audit is still required before final rejection or tier decision.
- Row 009 currently has a full CCMAS scope but **zero active links and `review_required`**. Official CCMAS objectives/outcomes make D151 and D077 credible omitted-domain candidates; research/statistics D078 and the narrower CSS 406 security-policy facet are additional candidates. They are not promoted: exact course-slice and downstream task/role evidence remain required. A review hold is not evidence of unavailability.

## Boundary

Rows 007–009 now have verified JAMB text locators and source-backed curriculum findings, but no row is end-to-end closed: all exposed subgroup/role paths and learner-facing eligibility implications remain unaudited. This checkpoint does not resolve or edit the links.
