# D078 area relationship dispositions: A06–A07

Status: local disposition ledger complete for the 13 references in the two
assigned areas. This is a hidden reconciliation artifact, not canonical data,
student copy, or sequence approval.

## Scope and result

This local slice covers only:

- A06 Social Research and Evaluation: 8 references.
- A07 Computational and Digital Social Science: 5 references.

All 13 are disposed: 11 resolve to an exact existing graph item, one is
retained as an explanatory annotation, and one identifies a distinct hidden
method candidate for later content-contract integration. No item was marked
unsupported. The JSON ledger contains every reference ID, source IDs, rationale,
target, limitation, and relationship-type correction where needed.

## Key semantic decisions

- Sampling/measurement, field/document method choice, theory of change,
  evaluation questions, and process/impact/value-for-money methods resolve to
  existing A06 items. The GOV.UK Magenta Book distinguishes process, impact,
  and value-for-money evaluation and treats the types as complementary in some
  contexts—not as a fixed bundle required for every study.
- “Manual coding with a codebook” is already a valid alternative in the A06
  qualitative-coding-options item. The inherited `complements` label is wrong:
  manual coding is an alternative to coding software, not another cumulative
  requirement. The disposition recommends changing this relationship to
  `alternative_to`.
- “Thematic/framework analysis” is not adequately represented by a software
  item. The Framework Method is a distinct qualitative analysis approach, so a
  hidden candidate is recorded rather than pretending that NVivo or Taguette is
  the method. The two terms in the inherited label must not be presented as
  synonyms; the eventual learner explanation must distinguish the approaches.
- Reflexive memoing and contradictory-case review remain an annotation attached
  to the qualitative-analysis candidate. They should not be represented as
  software features or universal steps before approach-specific evidence is
  checked.
- Data provenance, content analysis, and human-reviewed validation resolve to
  the exact existing A07 items. Python and R are alternative computational
  routes; Jupyter is a notebook environment, not a third programming language
  or a compulsory extra tool. Keep that option set non-cumulative.

## External sources checked

- [Magenta Book](https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html), evaluation scoping, theory of change, types, and method selection; accessed 2026-10-10. UK government guidance with wider methodological relevance, not Nigerian law.
- [Magenta Book Annex A](https://www.gov.uk/government/publications/the-magenta-book/magenta-book-annex-a-analytical-methods-for-use-within-an-evaluation-html), theory-based and value-for-money methods; accessed 2026-10-10.
- [National Centre for Social Research: Qualitative Data Analysis](https://natcen.ac.uk/qualitative-data-analysis), Framework approach overview, topics, and learning outcomes; accessed 2026-10-10. This is a professional training page, not a free course claim.
- [Gale et al., Using the Framework Method](https://doi.org/10.1186/1471-2288-13-117), open-access peer-reviewed method paper, Background and method description; accessed 2026-10-10.
- [BetterEvaluation: Framework Matrices](https://www.betterevaluation.org/methods-approaches/methods/framework-matrices), free explanatory resource on case-by-theme matrices; accessed 2026-10-10.

These sources validate method identity and scope; they do not independently
prove every inherited edge's direction. The graph's existing source IDs remain
item-level provenance unless a source directly supports the relationship
claim. Therefore this ledger does not authorize sequencing or student display.

## Next

Integrate the two agent ledgers and this local ledger only after each slice is
complete. Rebuild the graph, verify every reference has a disposition and exact
target/annotation/candidate outcome, validate relationship direction and
evidence scope, and then design the route sequence. Keep student visibility
and sequence approval false until those checks and the separate rendered UI
and content approval gates pass. No role-fit audit was reopened; the subject
matcher remains its own agent task.
