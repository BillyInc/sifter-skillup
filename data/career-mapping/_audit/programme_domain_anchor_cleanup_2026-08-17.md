# CCMAS programme → domain named-anchor cleanup

Audit date: 2026-08-17

## Method

For high-fanout domains, a programme-domain link must have at least one named curriculum anchor in the CCMAS programme evidence. The anchor must refer to the target domain’s actual practice, not merely a generic word such as “management”, “research”, “people”, “public”, “health”, or “analysis”.

The cleanup applied this rule to:

- D078 Social Sciences
- D149 Diplomacy, International Relations
- D128 Social Welfare, Youth Services
- D039 Higher Education
- D058 EdTech
- D029 Human Resources
- D041 Scientific Research
- D026 Public Health
- D010 Business Intelligence
- D046 Social Work
- D011 Quantitative Finance

## Result

112 links with no named target-domain curriculum anchor were removed. This includes generic links from unrelated administration, arts, education, allied-health, engineering, science, and social-science programmes into specialised domains such as diplomacy, EdTech, quantitative finance, business intelligence, and social work.

The current mapping contains 236 programme records and 2,342 links:

| Tier | Links |
|---|---:|
| Direct | 227 |
| Functional | 1,993 |
| Adjacent | 122 |

No stale `direct_source` provenance remains on non-Direct links.

## Boundary

This is an evidence gate, not a claim that every remaining Functional link is correct. The remaining links have at least one named anchor under the domain-specific rules, but still require semantic review for cases where a shared anchor is insufficient—for example, a law course versus legal practice, a health course versus digital health, or a statistics course versus data science.
