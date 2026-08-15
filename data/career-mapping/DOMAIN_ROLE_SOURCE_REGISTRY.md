# Domain role-source registry

`domain_meta.json` remains the only authoritative input for the domain list. `domain_role_source_registry.json` supplies source families and resolves them in this order:

1. `default_sources`
2. the source IDs assigned to the domain's `cluster`
3. any `domain_overrides` for that domain ID

The validator confirms that all 168 domain IDs resolve to a global or global-proxy occupation source, `ng_jobberman`, and `ng_myjobmag`.

## How to interpret the sources

| Evidence type | Use | Do not infer |
|---|---|---|
| `occupation_taxonomy` / `international_occupation_standard` | Normalize role names, aliases, descriptions and crosswalks | Nigerian demand or local licensing |
| `live_vacancy_title_signal` | Observe Nigerian titles, employers, categories and current postings | A complete labour market or a role's quality |
| `professional_regulatory_context` | Validate local title, scope of practice, registration or licensing | Vacancy volume |
| `industry_role_profiles` / `professional_role_and_competency_framework` | Fill specialist role families and competency vocabulary | Local availability |
| `labour_market_context` | Add country/sector employment context | Role-level title evidence |

Current specialist framework overlays include TESDA game development, JFF XR,
ARM/Skills England robotics, British Esports/Pearson esports, and the Quantum
Flagship European Competence Framework for Quantum Technologies v3.0. These
frameworks provide role and competency ownership; they do not provide Nigerian
vacancy counts or local licensing.

## Cross-domain rule

Roles are canonical records with a `domain_ids` array. They are not copied once per domain. Pick one `primary_domain_id` based on the role's principal work output, then attach secondary domains when their responsibilities are material.

For example, third-party cyber risk roles use:

- primary: `D004` Cybersecurity;
- secondary: `D034` Supply Chain Management, `D036` Procurement and `D038` Compliance, Regulation;
- aliases: third-party, vendor and supplier risk/assurance/security titles;
- global sources: NICE, ESCO, O*NET and ASCM;
- Nigerian sources: Jobberman, MyJobMag, CPN, CILT Nigeria and the Nigerian Bar Association where legal/compliance work is part of the posting.

This preserves the user's observation that supply-chain work can be explored inside Cybersecurity without implying that every supply-chain role is a cyber role.

The generated `cross_domain_role_families.json` turns this policy into data. It
groups exact ESCO occupation-URI matches across domains and adds explicit
registry families where aliases carry the relationship. The API exposes these
families in role detail and public search.

## Nigerian and global professional enrichment without salary claims

Every visible domain, subgroup and role receives a `nigerian_context`
provenance object resolved from the domain's Nigerian source set. The
`actual_enrichment` section is populated only from the curated
`nigerian_global_professional_overlays.json` file and contains the local
skills, tools, competencies, credentials, regulatory context and role names
that are supported by the checked professional-body or regulator documents.
The generic source registry remains context only and is not counted as actual
local enrichment.

Global professional frameworks are stored in a separate `global_enrichment`
section. CFA, GARP and RICS material can enrich the guidance experience, but
it is never labelled Nigerian evidence and cannot satisfy the local coverage
count.

Each source is labelled `checked_in_extract`, `checked_in_source_document` or
`registry_reference`. A registry reference improves source routing but does
not prove a local role, demand, salary or licence. The overlay also reports
`no_direct_local_counterpart` when the checked documents do not establish a
Nigerian equivalent; global titles are not copied into that gap.

The generated coverage evidence is written to
`data/career-mapping/_audit/NIGERIAN_CONTEXT_COVERAGE_REPORT.md` and can be
regenerated with:

```text
python data/career-mapping/_audit_nigerian_context.py
```

This distinction matters for computational pathways. The taxonomy uses exact
ESCO/O*NET evidence for roles such as sociologist, demographer, statistician,
economist and bioinformatics scientist, while Nigerian sources provide local
context. The subgroup layer therefore describes quantitative/computational
work without claiming that a global occupation title is a Nigerian vacancy.

The actual overlay audit currently reports 160 visible domains, 323 subgroups
and 4,619 visible role records with valid provenance. It reports actual local
enrichment and global enrichment separately, including the list of roles and
groups for which a local counterpart is still missing:

```text
python data/career-mapping/_audit_nigerian_context.py
```

## Computational methods, knowledge and tools

The computational layer keeps three different claims separate:

- **Method knowledge:** ESCO records `social network analysis` and `game theory`
  as `skill_type: knowledge`. They can be shown as methods used in relevant
  roles, but that evidence does not demonstrate that a particular learner has
  mastered either method.
- **Demonstrated competence:** the career taxonomy does not infer this from an
  occupation-to-skill relationship. A learner must demonstrate competence in a
  later assessment or learning record before the product can make that claim.
- **Tools and libraries:** Python, pandas, NumPy, scikit-learn, PyTorch and
  TensorFlow are source-backed tools where the checked-in O*NET software/tool
  evidence names them. They are displayed as tools used in a role or domain,
  not as automatic competencies.

The requested methods `agent-based modelling` and `causal inference` currently
have no exact ESCO/O*NET mapping in the checked-in source extract. `CASEVO` does
appear in the repository, but only as an optional grant-proposal framework in
the SkillUp Starknet learning curriculum. It is therefore recorded as
`learning_content_only`, not as a Career Intelligence competency or method
mapping. These gaps must not be filled with invented skills. The generated
`computational_method_evidence.json` records the source-backed methods, the
learning-only CASEVO reference, and the unmapped requests. Exact O*NET title
fallbacks are allowed only against the official checked-in occupation table and
carry `global_onet` provenance; fuzzy title joins are not used.

## Sparse domains

`D086`, `D139`, `D141`, `D153`, `D167` and `D168` receive specialist overrides. D141 uses the Quantum Flagship CFQT v3.0 source and keeps its role mappings at medium confidence. Their evidence should be labelled as limited when Nigerian vacancy samples are small. A low count is not a zero-role conclusion: use global taxonomies, specialist industry sources and local vacancy searches together.

Run the coverage check from the repository root:

```text
python data/career-mapping/validate_domain_role_source_registry.py
```
