# D078 A04–A05 Typed Area-Relationship Dispositions

Reviewed: 2026-10-12  
Status: all 61 references in this assigned slice have a disposition; none is student-visible or sequence-approved.

## Scope and governing decision

This handoff covers only the unresolved typed relationship references declared by:

- A04 — Social Behaviour and Interaction (`D078:psychology-social-behaviour`)
- A05 — Human Geography and Population Studies (`D078:human-geography-population`)

It does not review or modify Sociology, Economics, Politics/Governance, Social Research/Evaluation, or Computational/Digital Social Science. The graph, builder, canonical records, and other handoff files were not changed.

The complete reference-by-reference register is in the companion [JSON handoff](../../data/career-mapping/_audit/d078_area_relationship_dispositions_A04_A05_2026_10_10.json). For each of the 61 source-graph reference IDs, it preserves the original label and relationship type, declaring item, final disposition, exact existing target ID(s) when applicable, rationale, inherited source IDs, additional external source IDs, source URL registry, and limitation. The JSON is the machine-readable record of record; the source checks below explain how to interpret its evidence.

## Reconciled counts

| Measure | Count |
|---|---:|
| A04 references | 57 |
| A05 references | 4 |
| Total references dispositioned | 61 |
| Resolved to existing graph-node references | 24 |
| Retained as non-item annotations | 35 |
| References pointing to a new hidden candidate | 2 |
| Unique new hidden candidate | 1 |
| Unsupported/hidden | 0 |
| Still unresolved after inventory and source review | 0 |
| Student-visible or sequence-approved | 0 |

The two candidate references point to one conditional method candidate: measurement comparability across groups (measurement invariance / differential item functioning). It remains hidden and is not a graph node or sequence approval. Existing-node resolutions describe semantic targets only; they do not create prerequisite order. Bundled methods remain alternatives where the rationale says so.

Relationship types in the 61-reference slice: 54 `complements`, 3 `requires`, 2 `uses`, 1 `alternative_to`, and 1 `precedes`.

## Evidence handling

The A04 source IDs attached to these relationship records are inherited from the declaring item’s evidence ledger. Their presence does not, by itself, prove the target relationship. The JSON therefore distinguishes inherited item evidence from supplemental web evidence. It maps 37 unique inherited source IDs to URLs; source IDs and exact source metadata/locators already in the A04 source registries remain available in the linked checkpoint and extended-enrichment artifacts. Web searches were added where those inherited records did not establish source identity, task meaning, or why the relationship belongs.

All four A05 relationship references had no attached evidence-source IDs. Their fit was checked against the A05 inventory and supplemented with global methods guidance and Nigerian context where available. A Nigerian citation is contextual support, not a gate: globally relevant methods remain valid without a Nigerian source. A05’s NPC page fetch and the NBS Migration Survey PDF fetch timed out; those sources are clearly marked as search-result-only and are not relied on for a substantive claim that could not be checked.

## Web source checks

The table below is the preliminary search log. Its verification descriptions are superseded by the bounded direct-source check appended at the end of this document. Current exact locators, claims, scope, and statuses are in `external_verification.followup_source_verification.checked_claims` in the JSON.

| Source | Exact locator | What it supports and scope |
|---|---|---|
| [APA Psychology Major Guidelines 3.0](https://www.apa.org/ed/precollege/undergraduate-major) | Overview; Goal 2 (Scientific Inquiry and Critical Thinking), Goal 3 (Values in Psychological Science), Goal 4 (Communication, Psychological Literacy, and Technology Skills) | Global psychology-education expectations support A04’s empirical inquiry, ethical and communication framing. They are not Nigerian curriculum, clinical licensure, or proof of each individual complement. Official APA page; identity and goals confirmed in web search. |
| [ITC Test Adaptation Guidelines, second edition](https://www.intestcom.org/files/guideline_test_adaptation_2ed.pdf) | Recommendations grouped under Pre-Condition, Test Development, Confirmation, Administration, Scoring and Interpretation, and Documentation | International professional guidance supports treating measure adaptation, cognitive pretesting, translation review, and comparability checks as conditional evidence-led work—not universal prerequisites. Official ITC PDF identified; headings and 18-recommendation count confirmed from search result. |
| [APS: Testing for Measurement Invariance](https://www.psychologicalscience.org/observer/testing-for-measurement-invariance) | “Measurement Invariance Testing: Multigroup Confirmatory Factor Analysis”; configural, metric, and scalar invariance sections | Explanatory support for the one hidden candidate: multigroup CFA tests cross-group measurement comparability, and scalar invariance bears on comparing group means. Professional-society explainer, not a full technical standard; page was indexed but not separately fetched in this run. |
| [lavaan multiple-groups tutorial](https://lavaan.ugent.be/tutorial/groups.html) | Multiple-group analysis / measurement-invariance tutorial section | Official package documentation gives a task-specific implementation route for multigroup CFA; it does not establish that a dataset or question warrants the analysis. Exact section was not independently opened in this run. |
| [Nigeria Data Protection Act 2023](https://ndpc.gov.ng/download/nigeria-data-protection-act-2023) | Part V, §§24–31; Part VII, §§39–40 | Nigerian legal context for processing principles, lawful basis, consent, sensitive data, security and confidentiality. It supports privacy/legal review for personal-data research; it does not alone determine ethics-committee approval. Official NDPC download endpoint identified. |
| [UN Principles and Recommendations for Population and Housing Censuses, Rev. 3](https://unstats.un.org/unsd/demographic-social/Standards-and-Methods/files/Principles_and_Recommendations/Population-and-Housing-Censuses/Series_M67rev3-E.pdf) | Chapter III, ¶¶3.58–3.63 | Global census guidance supports explicit geographic classifications, units, hierarchy, boundaries and formal databases for interpreting population information. Official UNSD PDF; relevant paragraph text surfaced in search. |
| [UN Handbook on Geospatial Infrastructure in Support of Census Activities](https://unstats.un.org/unsd/demographic/standmeth/handbooks/series_f103en.pdf) | Chapter III, §F “Metadata development” (contents p.73); Chapter IV; Chapter VI on aggregation/dissemination units | Global official-statistics guidance supports metadata, geographic provenance, scale, and careful aggregation/dissemination. UNSD PDF contents and chapter summary surfaced in search. |
| [Nigeria NPC Enumeration Area Demarcation](https://www.nationalpopulation.gov.ng/EAD) | “What is EAD?” and “EAD methodology” | Search-result text describes GIS-based Nigerian census enumeration areas and spatial datasets. Nigeria-specific context only; direct page open timed out, so do not treat as fully fetched or as proof that all outputs are public/current. |
| [NPC 2023 Census methodology](https://nationalpopulation.gov.ng/2023-census) | “Census Methodology” numbered workflow | Official Nigerian context for enumeration-area assignment, validation, processing, analysis and dissemination stages. Page open timed out; used only to identify local workflow context, not to claim census results were released. |
| [UN Recommendations on Statistics of International Migration and Temporary Mobility](https://unstats.un.org/go/migrrec) | Annex D, “Glossary of Terms”; population bases and international migration/mobility definitions | Global statistical definitions support the A05 migration concepts link and the need to state residence and reference period. They are for statistical comparability, not Nigerian legal definitions. Official UNSD page and glossary excerpt surfaced in search. |
| [NBS Migration Survey Report 2023](https://nigerianstat.gov.ng/pdfuploads/MIGRATION%20SURVEY%20REPORT%202023.pdf) | Report title only; exact chapter/table not verified | Identifies a potentially useful Nigerian official migration source, but no substantive statistic is claimed. Search result identified the PDF; direct fetch timed out, so it is not counted as evidence of a specific finding. |
| [UN World Population Prospects 2024 Methodology](https://population.un.org/wpp/assets/Files/WPP2024_Methodology.pdf) | Projection-scenario and probabilistic-projection/uncertainty-interval sections | Global population-estimation guidance supports uncertainty communication for estimates and projections—not a requirement to attach projection intervals to every descriptive count. Methodology summary surfaced in official search result. |
| [Rutgers Human Geography: Space, Place, and Location](https://geography.rutgers.edu/academics/undergraduate-program/geography/undergraduate-courses/course-details/334-01-450-103-human-geography-space-place-and-location) | Course description | University course example connects people/place, spatial relations, local-to-global scales, migration and power; supports keeping “relevant theory” contextual to the question rather than inventing one universal theory node. Global course example, not Nigerian curriculum or exhaustive theory list. |

## Limitations and next integration guardrails

- This is a target-disposition handoff, not graph integration. No edges were rewritten, no new node was added, and no item was made visible.
- Do not turn `complements`, `alternative_to`, or `uses` into required learning or prerequisites by default. Preserve method choice and alternatives.
- The measurement-comparability candidate needs its own complete student-facing contract, prerequisites, alternatives, limits, external learning resources, and evidence review before it can enter the graph.
- Nigerian NPC/NBS references help localize A05, but the search-result-only checks must be revisited before those pages or any specific local claim are shown to students.
- Rebuild or approve sequence only after the separate owner integrates this handoff with the other area slices and validates every target against the controlling graph contract.

## Bounded source-verification follow-up (2026-10-12)

This pass inspected **9** pages/PDFs, found **2** sources only in search results, and found **2** inaccessible endpoints. Search snippets are not treated as inspected evidence. No A04/A05 disposition changed. The complete machine-readable source log, including exact URL, issuer, locator, claim, scope and status, is `external_verification.followup_source_verification.checked_claims` in the companion JSON.

| Source and issuer | Exact locator | Claim supported and scope | Status |
|---|---|---|---|
| [APA Psychology Major Guidelines 3.0](https://www.apa.org/about/policy/undergraduate-psychology-major.pdf) — American Psychological Association | PDF p.7, Goals 2–4; pp.17–18, Goal 4 overview | Supports A04’s broad research, ethics, sociocultural and communication framing; not Nigerian curriculum or proof of every edge. | Page inspected |
| [ITC Test Adaptation Guidelines, second edition](https://www.intestcom.org/files/guideline_test_adaptation_2ed.pdf) — International Test Commission | PDF p.2; pp.7–10; p.13 | Supports staged, conditional test adaptation and cognitive interviewing as one possible method; not a universal prerequisite. | Page inspected |
| [APS: Testing for Measurement Invariance](https://www.psychologicalscience.org/observer/testing-for-measurement-invariance) — Association for Psychological Science | “Measurement Invariance Testing”; configural, metric and scalar sections, lines 25–45 | Supports the hidden optional cross-group comparability candidate, including why scalar invariance matters for comparing latent means. Explanatory article, not a technical standard. | Page inspected |
| [lavaan Multiple Groups tutorial](https://www.lavaan.ugent.be/tutorial/groups.html) — lavaan project, Ghent University | “Multiple groups” lines 41–49; “Measurement invariance testing” lines 522–560 | Supports a task-specific implementation resource for multigroup CFA; does not determine whether a particular study should use it. | Page inspected |
| [Nigeria Data Protection Act 2023](https://ndpc.gov.ng/download/nigeria-data-protection-act-2023) — Nigeria Data Protection Commission | Intended Part V §§24–31 and Part VII §§39–40; exact text not inspected | No section-specific legal claim is counted as verified. Official endpoint returned 403 Forbidden. | Inaccessible |
| [UN Principles and Recommendations for Population and Housing Censuses, Rev. 3](https://unstats.un.org/unsd/demographic-social/Standards-and-Methods/files/Principles_and_Recommendations/Population-and-Housing-Censuses/Series_M67rev3-E.pdf) — UNSD | Chapter III ¶3.58 (PDF p.102), ¶3.62 (p.103), ¶3.67 (p.104) | Supports geographic classification’s effect on data collection/dissemination geography and attention to compatible/coded enumeration units. Global census guidance. | Page inspected |
| [UN Handbook on Geospatial Infrastructure in Support of Census Activities](https://unstats.un.org/unsd/demographic/standmeth/handbooks/series_f103en.pdf) — UNSD | Chapter III §F, ¶¶3.158 onward (PDF pp.85–87); Chapter VI §§6.1–6.4 (p.125) | Supports metadata/provenance and aggregation to statistical units. Global census-geospatial guidance. | Page inspected |
| [NPC Enumeration Area Demarcation](https://2023census.gov.ng/pages/EAD) — National Population Commission, Nigeria | Search listing only; page body not fetched | Search result identifies EAD as Nigerian census mapping/delineation; methodology details are not verified or relied on. | Search-result only |
| [NPC 2023 Census Methodology](https://nationalpopulation.gov.ng/2023-census) — National Population Commission, Nigeria | Exact page workflow not inspected | Potential Nigerian context only; no workflow claim is counted as verified. Direct page fetch timed out. | Search-result only |
| [UN Recommendations on Statistics of International Migration and Temporary Mobility](https://unstats.un.org/go/migrrec) — UNSD | Annex D glossary (PDF p.82); residence/duration (pp.82–83); migration vs temporary mobility (p.15, pp.75–76) | Supports explicit population base/residence period and distinction between migration and temporary mobility. Global statistical definitions, not Nigerian law. | Page inspected |
| [NBS Migration Survey Report 2023](https://nigerianstat.gov.ng/pdfuploads/MIGRATION%20SURVEY%20REPORT%202023.pdf) — National Bureau of Statistics, Nigeria | No chapter/table inspected | No survey finding is verified or relied upon; potential Nigerian context lead only. Direct PDF fetch timed out. | Inaccessible |
| [UN World Population Prospects 2024 Methodology](https://population.un.org/wpp/assets/Files/WPP2024_Methodology-Report_Final.pdf) — UN DESA Population Division | PDF pp.16, 39–40 and 45 | Supports uncertainty intervals for specified estimates/projections, not a requirement to attach intervals to every descriptive count. Prior URL returned 404; this is the inspected official replacement. | Page inspected |
| [Rutgers Human Geography: Space, Place, and Location](https://geography.rutgers.edu/academics/undergraduate-program/geography/undergraduate-courses/course-details/334-01-450-103-human-geography-space-place-and-location) — Rutgers University, Department of Geography | Course title and description, lines 103–110 | Supports the example that human geography studies people/place, spatial organization, multiple scales, migration and power. One global university-course example, not Nigerian curriculum or an exhaustive theory list. | Page inspected |

Corrections: APA now links to the inspected official Guidelines 3.0 PDF; the WPP link was corrected after the prior URL returned 404. The NDPC statutory locator and detailed NPC/NBS local claims remain evidence gaps, explicitly not treated as verified. The 37 inherited A04 source IDs were not each reopened individually in this bounded pass; their presence remains declaring-item provenance, not relationship-level verification. Global UNSD methods sources independently support the relevant A05 concepts; lack of a Nigerian citation does not disqualify globally relevant work.
