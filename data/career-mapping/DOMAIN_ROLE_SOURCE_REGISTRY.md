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

## Cross-domain rule

Roles are canonical records with a `domain_ids` array. They are not copied once per domain. Pick one `primary_domain_id` based on the role's principal work output, then attach secondary domains when their responsibilities are material.

For example, third-party cyber risk roles use:

- primary: `D004` Cybersecurity;
- secondary: `D034` Supply Chain Management, `D036` Procurement and `D038` Compliance, Regulation;
- aliases: third-party, vendor and supplier risk/assurance/security titles;
- global sources: NICE, ESCO, O*NET and ASCM;
- Nigerian sources: Jobberman, MyJobMag, CPN, CILT Nigeria and the Nigerian Bar Association where legal/compliance work is part of the posting.

This preserves the user's observation that supply-chain work can be explored inside Cybersecurity without implying that every supply-chain role is a cyber role.

## Sparse domains

`D086`, `D139`, `D141`, `D153`, `D167` and `D168` receive specialist overrides. Their evidence should be labelled as limited when Nigerian vacancy samples are small. A low count is not a zero-role conclusion: use global taxonomies, specialist industry sources and local vacancy searches together.

Run the coverage check from the repository root:

```text
python data/career-mapping/validate_domain_role_source_registry.py
```
