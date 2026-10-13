# Global role → parent-domain audit continuation — checkpoint 003

Date: 2026-10-06  
Scope: exact canonical role key → parent domain only; global evidence only.  
Explicit exclusions: no Nigeria-specific context, no role → specialization review, no canonical taxonomy edits.

## Exact-key coverage

The audit reconciles all **3,919 canonical role keys** from `domain_subgroup_role_taxonomy_inventory_2026_10_03.json`. The earlier 44-key headline was recomputed from exact keys and the lane-specific statuses normalized before any new decisions were added.

| Current disposition | Exact keys |
|---|---:|
| Supported | 2,348 |
| Conditional | 1,017 |
| Unsupported | 543 |
| Unresolved | 11 |
| Conflicting terminal decisions | 0 |
| Total | 3,919 |

The former unresolved queue contained 44 exact keys. This continuation now has an explicit, evidence-documented disposition for **all 44**: 33 received supported/conditional outcomes, while **11 remain explicitly unresolved**. The remaining 11 are catch-all “All Other” occupational groups whose stored task text does not identify the actual work to compare against the parent domain. Their unresolved status is deliberate: neither the catch-all label nor a parent/subgroup classification proves domain fit. Increment 004 documents task evidence, rationale, source references and limitations for each of those 11 exact keys.

## This increment

Increment 003 adds 17 exact-key dispositions. It resolves or conditionally scopes:

- AI/ML specialists, IoT specialists, and FinTech engineers;
- financial/investment advisers and risk-management specialists;
- electrotechnology engineers and systems engineers;
- architects/surveyors and mining/petroleum/extraction workers;
- surgeons and nursing professionals;
- media/communication workers and garment/assembly trades;
- three road-driver categories.

The decisions use task descriptions and domain scope. Conditional decisions explicitly restrict broad labels to the task branch that fits; they do not treat a broad title as blanket evidence. Sources include ILO ISCO-08 task definitions, ITU/NIST technical scope, International Actuarial Association material, and global financial-infrastructure employer task descriptions. US-scoped O*NET evidence is separately caveated where used in earlier increments.

## Remaining exact keys

| Exact role key | Why still unresolved |
|---|---|
| `D007|Designers, All Other` | The source defines only a residual designer group; it does not say whether the work is UI/UX or digital-interface design. |
| `D009|Mathematical Science Occupations, All Other` | The catch-all does not identify whether the work is data science, statistics, or another mathematical-science activity. |
| `D010|Business Operations Specialists, All Other` | No task profile distinguishes BI/process-analysis work from other business operations. |
| `D010|Financial Specialists, All Other` | No task profile establishes business analytics/quantitative analysis versus other financial work. |
| `D022|Extraction Workers, All Other` | The residual group does not identify the extracted material or activity; fit to mining/geosciences cannot be established. |
| `D041|Physical Scientists, All Other` | No specific scientific activity is present in the task record. |
| `D042|Media and Communication Workers, All Other` | No task profile distinguishes production/broadcast work from unrelated communications work. |
| `D122|Health Technologists and Technicians, All Other` | The record does not establish medical laboratory or specimen-testing duties. |
| `D124|Healthcare Support Workers, All Other` | The record does not identify community/frontline health-extension duties rather than other support work. |
| `D126|Healthcare Diagnosing or Treating Practitioners, All Other` | The residual title does not identify a complementary, alternative, or traditional therapy. |
| `D150|Religious Workers, All Other` | The residual title has no task evidence tying the work to ministry, theology, or interfaith leadership. |

For these rows, a specific job title plus its actual tasks (or a recognized occupation-specific task definition) is the missing evidence. Do not turn them into conditional mappings unless such task evidence narrows the category; otherwise preserve unresolved.

## Artifacts and verification

- `role_domain_fit_dispositions_increment_001.json` — first 9 decisions.
- `role_domain_fit_dispositions_increment_002.json` — next 7 decisions.
- `role_domain_fit_dispositions_increment_003.json` — current 17 decisions.
- `role_domain_fit_dispositions_increment_004.json` — explicit evidence-based unresolved dispositions for the 11 remaining catch-all role keys.
- `exact_role_fit_coverage_2026_10_06.json` — regenerated exact-key reconciliation.
- `reconcile_exact_role_fit_coverage.py` — deterministic scanner; excludes old snapshots and uses only per-domain decision artifacts, D119 ledger, and this continuation's incremental decisions.
- `test_reconcile_exact_role_fit_coverage.py` — exact-key, evidence completeness, no-conflict, and total-count tests.

Validation run:

```text
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_CONTINUATION_2026_10_06/reconcile_exact_role_fit_coverage.py
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_CONTINUATION_2026_10_06.test_reconcile_exact_role_fit_coverage
```

The JSON reconciliation reported 3,919 canonical keys, 3,919 distinct keys with reviewed artifacts, status counts above, and **0 conflicting terminal statuses**. Five unit tests pass. No canonical taxonomy file was edited.

## Key source limitations

- [ILO ISCO-08 overview and method](https://isco.ilo.org/en/isco-08/) says occupation classification is based on jobs' main tasks and duties; group membership is not itself proof of a specific domain fit.
- [ILO ISCO-08 Volume I](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf) provides global group definitions and task examples, but is a statistical classification, not a credentialing or licensing standard.
- [ITU IoT Global Standards Initiative](https://www.itu.int/en/ITU-T/gsi/iot/pages/default.aspx) and [NISTIR 8259A](https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8259A.pdf) define IoT/system capabilities, not a universal job-title taxonomy.
- [International Actuarial Association Risk Book](https://actuaries.org/publications/iaa-risk-book/) supplies global professional context for actuarial risk, but does not define every generic “Risk Management Specialist” job.
- [LSEG engineering](https://www.lseg.com/en/careers/engineering/the-future) and [BlackRock software engineering](https://careers.blackrock.com/students-and-graduates-functions-software-engineering) are globally operating employer examples, not universal occupational standards; hence the FinTech disposition remains conditional.

