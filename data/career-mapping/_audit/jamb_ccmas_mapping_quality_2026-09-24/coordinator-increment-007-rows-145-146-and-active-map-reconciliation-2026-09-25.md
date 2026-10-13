# Coordinator increment 007 — rows 145–146 and stale active-map reconciliation

Audit date: 2026-09-25  
Scope: JAMB mapping rows 145–146; five pending combined-scope rows in the rows 141–280 tranche; exact saved-scope / canonical-inheritance / active-map reconciliation.  
Disposition: append-only evidence checkpoint. No canonical mappings, curriculum scopes, or seeds were edited by this increment.

## Row 145 — COMPUTER SCIENCE WITH ECONOMICS

### Identity and source context

- Canonical scope row 145 has `component_refs: ["Computing::Computer Science"]`; its saved selection has eight Computing courses and no Economics component or ECO course.
- `jamb/sciences_offerings.json` records the Sciences-faculty offering for CUAB, LCITY and OAU. The programme row’s parsed subject fields are null, so those nulls do not prove absence of subject or curriculum evidence.
- The JAMB Engineering/Environmental/Technology brochure separately prints **“Computer Science with (Economics) (Mathematics)”** in its printed programme catalogue on p. 336. That catalogue line supplies no institution association in the checked local Engineering offering extraction. It must remain a distinct source context until a primary table row joins it to institutions; it must not be merged into row 145 or row 146 by name similarity.
- JAMB’s Sciences brochure has different Computer Science compound entries and university/institution columns (printed p. 452 in the checked local extraction). The catalogue evidence alone does not determine each institution’s full course schedule.

### CCMAS course/outcome evidence

The eight selected Computer Science courses in the current scope are COS 101, COS 201, COS 202, IFT 212, SEN 201, CSC 322, CSC 401 and CSC 402, all attributed in the scope artifact to `computing.json` / `Computer Science`. Their course content supports computing foundations, programming, architecture, software lifecycle, algorithms and computing ethics. None is an Economics course or states the Economics learning outcomes.

The separate Social Sciences CCMAS Economics programme provides a substantive, bounded candidate component: ECO 101 covers scarcity, choice, supply/demand, elasticity, production and market structures; ECO 102 covers macroeconomic aggregates and policy topics; ECO 201 covers microeconomics; ECO 207 is Mathematics for Economists. The official CCMAS course table and outcomes are printed pp. 96–100 and 103–104. These make the missing Economics facet a confirmed scope-coverage defect, but do **not** automatically establish that all four courses, or all 38 Economics courses, belong to every institution-specific offering. The institution/source-context join and selected course slice still require adjudication.

### Existing domain links and disposition

Active `jamb_domain_map.json` currently exposes seven links. The saved scope anchors them as follows:

| Domain | Active tier | Current course anchor(s) | Audit disposition |
|---|---|---|---|
| D001 Software Engineering | direct | COS 201, COS 202, SEN 201 | Strongest supported destination; later role paths still need task-level narrowing. |
| D003 Artificial Intelligence | direct | COS 201, COS 202, CSC 401 | Not established by these anchors: the selected slice omits CSC 309, the CCMAS AI course. |
| D005 Cloud Computing | functional | COS 201, COS 202 | Not established: no selected cloud deployment, networking, distributed systems or operations outcomes. |
| D009 Data Science | functional | SEN 201 | Not established: this course anchor is software lifecycle, not statistics, data management or data analysis. |
| D033 Product Management | functional | CSC 322 | Weak/unsupported as a career route: innovation/business models do not establish product discovery, roadmap or delivery work. |
| D056 Blockchain | functional | COS 201, COS 202 | Not established: no distributed ledger, cryptography or consensus course outcome. |
| D140 Robotics Engineering, Systems Design | functional | SEN 201 | Not established: software lifecycle does not establish robotics, controls, electronics, sensors or integrated systems. |

The absent D063 Economics destination is a confirmed missing named facet. Do not add it until the specific JAMB source offering and bounded Economics slice are joined and reviewed. Do not treat the current `ready_partial` label as evidence that the programme name is fully represented.

## Row 146 — COMPUTER SCIENCE AND MATHEMATICS

### Identity and course evidence

- The current saved scope selects eleven courses: eight Computing::Computer Science courses plus MTH 101, MTH 102 and MTH 201. These three MTH courses are explicitly present; it would be incorrect to report that Mathematics is absent.
- The scope attributes all three MTH courses to `computing.json` / **Computer Science**, and the row has only `Computing::Computer Science` in `component_refs`. Thus the seed records a real mathematics foundation within Computing, but it does not yet represent a separately selected `Sciences::Mathematics` component.
- This distinction matters because the official Sciences CCMAS has a standalone B.Sc. Mathematics programme. Its structure includes MTH 101, MTH 102 and MTH 201 **and** a broader progression: MTH 103, STA 112, MTH 202–210 (including differential equations, sets/logic/algebra, linear algebra, real analysis, numerical analysis and vector analysis), upper-level mathematics courses, project and industrial attachment. The current row’s three MTH courses therefore overlap with Mathematics but do not amount to that programme’s curriculum.
- The same MTH 101/102 appear in Computing’s Computer Science structure; MTH 201 appears in the recorded Computing Computer Science course list. These shared course codes/titles establish shared foundational study, not the exact offering-specific extent of a separately named Mathematics component.
- The Sciences brochure prints **Computer Science and Mathematics** with ADSU, NOVENA and PHC in its parsed entry and separately lists **Computer Science with Mathematics** for OAU. An exhaustive subject audit previously reports eight institution names for row 146, conflicting with that parsed three-name array. Resolve this against the original JAMB university/programme table before finalizing identity-to-offering associations. Do not transfer institution lists from the Engineering brochure’s parenthesized catalogue line.

### Existing domain links and disposition

The active seven links are identical to row 145. D001 Software Engineering is the strongest current curriculum bridge via programming and SEN 201. MTH 101/102/201 add mathematics foundations, but do not by themselves establish the other six paths; notably D009 Data Science still lacks cited statistical/data-analysis outcomes. The seven active tier labels require a fresh row-specific review after component scope is resolved; the shared CS map cannot substitute for it.

**Finding:** row 146 has mathematics evidence, but a separate Mathematics-component decision is unresolved. Compare the programme’s actual source contexts and full CCMAS Mathematics course/outcome sequence before deciding whether to model only the shared foundational mathematics or a bounded additional Mathematics slice. Do not duplicate courses merely because a second component is added.

## Why 78 links remain active for five pending combined scopes

The current artifacts disagree by generation layer:

| JAMB row | Identity | Saved scope state | Canonical inheritance state | Active `jamb_domain_map.json` |
|---:|---|---|---|---|
| 245 | Dentistry and Dental Technology | `combined_scope_review_required`, pending, 0 selected courses, 0 scoped links | `review_required`, 0 exposed links | `ready`, 20 links |
| 248 | Medical Rehabilitation | same | `review_required`, 0 exposed links | `ready`, 13 links |
| 266 | Forestry and Fisheries | same | `review_required`, 0 exposed links | `ready`, 16 links |
| 267 | Forestry, Wildlife & Fisheries | same | `review_required`, 0 exposed links | `ready`, 16 links |
| 279 | Creative Arts | same | `review_required`, 0 exposed links | `ready`, 13 links |
| **Total** | **5 identities** | **0 selected courses / 0 scoped links** | **0 exposed links** | **78 stale active links** |

The exact retained active-link IDs, display names and old tiers are:

- **245 Dentistry and Dental Technology (20):** D067 Dentistry [direct]; D123 Radiography, Medical Imaging; D122 Medical Laboratory Technology; D026 Public Health; D023 Medicine; D142 Bioinformatics, Computational Biology; D027 Biomedical; D145 Neuroscience, Cognitive Science; D041 Scientific Research; D074 Occupational Health, Safety; D124 Community Health Extension; D138 Biomedical Engineering; D024 Nursing; D143 Forensic Science, Digital Forensics; D109 Metal Processing, Foundry; D155 Nanotechnology, Advanced Materials; D098 Precision Engineering, Toolmaking; D103 Jewellery Making, Goldsmithing; D068 Allied Health; D104 Pottery, Ceramics, Glass [all remaining links functional].
- **248 Medical Rehabilitation (13):** D154 Exercise Science, Sports Therapy [direct]; D068 Allied Health [direct]; D123 Radiography, Medical Imaging; D137 Medical Physics, Radiation Therapy; D165 Wellness Coaching, Lifestyle Medicine; D145 Neuroscience, Cognitive Science; D064 Psychology, Counselling; D126 Complementary, Alternative; D023 Medicine; D024 Nursing; D071 Sports Management; D124 Community Health Extension; D025 Pharmacy [remaining links functional].
- **266 Forestry and Fisheries (16):** D121 Forestry, Wildlife Management [direct]; D120 Fisheries, Aquaculture [direct]; D041 Scientific Research; D063 Economics; D047 Agricultural Science; D119 Livestock, Poultry, Dairy; D118 Crop Production, Horticulture; D066 Veterinary Science; D030 Marketing, Brand; D072 Geospatial Science; D074 Occupational Health, Safety; D144 Climate Science, Meteorology; D031 Sales; D020 Environmental Engineering; D027 Biomedical; D048 Food Science [remaining links functional].
- **267 Forestry, Wildlife & Fisheries (16):** same 16 domain IDs and old tiers as row 266.
- **279 Creative Arts (13):** D070 Performing Arts & Entertainment [direct]; D042 Media Production [direct]; D030 Marketing, Brand; D043 Journalism; D153 Music Production; D168 Esports & Creator Economy; D007 UI/UX Design; D130 Recruitment, Employment; D031 Sales; D044 Graphic Design; D139 Game Design; D039 Higher Education; D040 Vocational [remaining links functional].

The current scope builder sets combined rows to pending review with empty links; the canonical inheritance audit consumes that scope and now records `review_required` with an empty exposed-link list. The active map still reports the older `combined_scope_evidenced` / `ready` state and link arrays. The materializer’s current code is explicitly fail-closed for canonical `review_required` rows, so this is stale materialization—not evidence that the five scopes were reviewed. It is also not fixed by changing only the saved scope JSON.

### Correct generation path (identified, not executed here)

1. Keep the source scope generated by `data/career-mapping/_build_jamb_curriculum_scopes.py`; do not manually patch its JSON output.
2. Regenerate the inheritance audit/canonical contract with `data/career-mapping/_audit_ccmas_jamb_inheritance.py`, which reads `_audit/jamb_curriculum_scopes_2026-08-17.json` and writes `_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`.
3. Run `data/career-mapping/_materialize_jamb_domain_map_from_canonical.py --replace` only after checking the canonical rows and any applicable Nigerian-reviewed overlay. This writes the derived snapshot and replaces the active `jamb_domain_map.json` (backing up its prior contents to `jamb_domain_map_legacy_2026-08-17.json` if absent).
4. Re-run coverage/materializer audits and verify rows 245/248/266/267/279 have no active links while pending. This checkpoint identifies the stale state; it does not perform this replacement or seed regeneration.

## Authoritative sources and locators (checked 2026-09-25)

- NUC, **Sciences CCMAS 2023**, official PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf — B.Sc. Mathematics overview and objectives, printed pp. 426–427; global structure, printed pp. 427–428; course outcomes following the structure. The broader sequence supports the distinction between common foundational courses and a standalone Mathematics curriculum.
- NUC, **Computing CCMAS 2023**, official PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf — B.Sc. Computer Science overview and objectives, printed pp. 27–28; Computer Science global structure, printed pp. 28–29; MTH 101/102 structure and outcomes, printed pp. 28–29 and 31–32.
- NUC, **Social Sciences CCMAS 2023**, official PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf — Economics course structure/outcomes, printed pp. 96–100 and 103–104; candidate course support for row 145, not a proof of institution-specific selection.
- NUC CCMAS official index: https://www.nuc.edu.ng/ccmas/ — directory for the national CCMAS source set.
- JAMB/IBASS, **Sciences brochure**: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf — printed catalogue/table area around p. 452; current checked search text shows distinct Computer Science and Mathematics / Computer Science with Mathematics names and institution column. Local extracted record: `data/career-mapping/jamb/sciences_offerings.json`. PDF text render is not a substitute for resolving the conflicting institution counts against the exact primary table.
- JAMB/IBASS, **Engineering/Environmental/Technology brochure**: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf — printed p. 336, parenthesized Computer Science with Economics/Mathematics catalogue entry; no verified institution join for this row in the local parsed offering record.
- Internal cross-checks: `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` (rows 145/146 and pending combined rows); `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`; `data/career-mapping/jamb_domain_map.json`; `data/career-mapping/ccmas/computing.json`; `data/career-mapping/ccmas/sciences.json`; `data/career-mapping/ccmas/social_sciences.json`; `data/career-mapping/jamb/sciences_offerings.json`; `data/career-mapping/jamb/engineering_offerings.json`; `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/agent-02-increment-003-rows-145-146-and-boundary.md`; and `agent-02-increment-006-rows-141-280-authoritative-component-recheck-2026-09-25.md`.

## Open work

1. Resolve row 145 institution-level JAMB source contexts, choose a bounded ECO course/outcome slice, and then re-grade the domain links and their downstream paths.
2. Resolve row 146’s three-versus-eight institution discrepancy and decide from offering-specific evidence whether a separate bounded Mathematics component is needed beyond common Computing MTH courses.
3. Regenerate the active map only through the checked pipeline after the source scope/canonical artifacts are finalized; separately audit the 78 links so stale classifications are not revived.
4. This is a focused tranche checkpoint, not completion of rows 141–280 or the full 420/237 catalogue audit.
