# D001-D056 Role Reconciliation — 2026-10-07

Review-only lane. No canonical role or taxonomy file was edited.

## Method

Every active role in D001-D056 was evaluated using role task/work-activity text, domain scope, area boundary, source provenance/date, scope conditions, multiple-route checks and negative checks. Role names and ISCO membership were used only for discovery and corroboration, never as proof of fit.

Local evidence used: current role records, local ESCO occupation descriptions/skills, O*NET occupation descriptions/tasks, WEF role list, and ESCO/ISCO group descriptions. Existing reviewed routes were retained only where task text and traceable source evidence were present.

## Counts

- Current role records evaluated: **1788**
- Student-path active records: **1488**; excluded legacy records retained for audit: **300**
- Domains covered: **56**
- Parent-domain dispositions: {"supported": 1488, "unsupported": 293, "conditional": 6, "external/source review": 1}
- Area-route dispositions (route count, not unique-role count): {"supported": 1878, "supported secondary route": 1433, "conditional": 1114, "unsupported": 939}
- Roles with a proposed disposition change: **1362**
- Roles with a negative cross-domain signal requiring inspection: **1119**
- Raw role candidates absent by exact current key: **934**
- Raw candidates classified as alias/duplicate: **9**

## Safety

- Canonical files edited: **no**.
- No route is promoted solely from a role title, ISCO group, or subgroup membership.
- Secondary routes are explicit and do not replace the primary route.
- Conditional routes carry an explicit scope condition.
- Full row-level records and proposed keys are in the JSON artifact.

## Proposed-change summary

- area-fit-status: **514**
- missing-area-route: **480**
- parent-domain-status: **52**
- primary-area-route: **509**
- secondary-area-route: **1027**

## D001-D056 coverage

| Domain | Roles | Supported parent | Conditional | Unsupported | External review | Area supported/secondary | Area conditional/review |
|---|---:|---:|---:|---:|---:|---:|---:|
| D001 Software Engineering | 37 | 32 | 0 | 5 | 0 | 93 | 18 |
| D002 Data Engineering and Architecture | 25 | 17 | 0 | 8 | 0 | 37 | 38 |
| D003 Artificial Intelligence and Machine Learning | 5 | 5 | 0 | 0 | 0 | 13 | 2 |
| D004 Cybersecurity | 17 | 15 | 0 | 2 | 0 | 35 | 16 |
| D005 Cloud Computing and DevOps | 17 | 15 | 0 | 2 | 0 | 35 | 16 |
| D006 Internet of Things and Embedded Systems | 17 | 17 | 0 | 0 | 0 | 26 | 25 |
| D007 User Interface and User Experience Design | 26 | 21 | 0 | 5 | 0 | 41 | 37 |
| D008 Telecommunications and Network Engineering | 15 | 13 | 0 | 2 | 0 | 27 | 18 |
| D009 Data Science | 38 | 25 | 0 | 13 | 0 | 61 | 53 |
| D010 Business Intelligence and Analytics | 39 | 28 | 0 | 11 | 0 | 58 | 59 |
| D011 Quantitative Finance and Financial Engineering | 28 | 28 | 0 | 0 | 0 | 67 | 17 |
| D012 FinTech Engineering | 14 | 10 | 0 | 4 | 0 | 15 | 27 |
| D013 Investment Analysis and Asset Management | 36 | 32 | 0 | 4 | 0 | 76 | 32 |
| D014 Actuarial Science | 16 | 14 | 0 | 2 | 0 | 35 | 13 |
| D015 Accounting | 22 | 21 | 0 | 1 | 0 | 60 | 6 |
| D016 Electrical Engineering | 38 | 38 | 0 | 0 | 0 | 84 | 30 |
| D017 Mechanical Engineering | 45 | 40 | 0 | 5 | 0 | 77 | 58 |
| D018 Civil Engineering | 67 | 61 | 0 | 6 | 0 | 154 | 47 |
| D019 Renewable Energy Engineering | 20 | 20 | 0 | 0 | 0 | 51 | 9 |
| D020 Environmental Engineering | 25 | 25 | 0 | 0 | 0 | 53 | 22 |
| D021 Architecture and Urban Planning | 23 | 23 | 0 | 0 | 0 | 42 | 27 |
| D022 Mining and Geosciences | 62 | 61 | 0 | 1 | 0 | 100 | 86 |
| D023 Medicine | 49 | 46 | 1 | 2 | 0 | 115 | 32 |
| D024 Nursing | 38 | 37 | 1 | 0 | 0 | 102 | 12 |
| D025 Pharmacy | 20 | 16 | 3 | 1 | 0 | 33 | 27 |
| D026 Public Health | 26 | 26 | 0 | 0 | 0 | 59 | 19 |
| D027 Biomedical Science | 46 | 26 | 0 | 20 | 0 | 69 | 69 |
| D028 General Management | 45 | 38 | 0 | 7 | 0 | 73 | 62 |
| D029 Human Resources | 16 | 16 | 0 | 0 | 0 | 41 | 7 |
| D030 Marketing and Brand Management | 47 | 44 | 0 | 3 | 0 | 122 | 19 |
| D031 Sales and Business Development | 124 | 109 | 0 | 15 | 0 | 294 | 78 |
| D032 Project and Programme Management | 40 | 31 | 0 | 8 | 1 | 53 | 67 |
| D033 Product Management | 51 | 27 | 0 | 24 | 0 | 61 | 92 |
| D034 Supply Chain Management | 158 | 133 | 0 | 25 | 0 | 300 | 174 |
| D035 Logistics and Transportation Operations | 144 | 137 | 0 | 7 | 0 | 187 | 245 |
| D036 Procurement and Contract Management | 49 | 18 | 0 | 31 | 0 | 42 | 105 |
| D037 Legal Practice | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D038 Compliance, Regulation and Governance | 1 | 1 | 0 | 0 | 0 | 3 | 0 |
| D039 Higher Education and Academic Research | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D040 Vocational and Technical Training | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D041 Scientific Research | 12 | 10 | 0 | 2 | 0 | 27 | 9 |
| D042 Media Production and Broadcasting | 103 | 97 | 0 | 6 | 0 | 226 | 83 |
| D043 Journalism and Digital Publishing | 62 | 36 | 0 | 26 | 0 | 67 | 119 |
| D044 Graphic Design | 12 | 4 | 0 | 8 | 0 | 11 | 25 |
| D045 Public Administration and Policy | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D046 Social Work and Community Development | 12 | 10 | 0 | 2 | 0 | 21 | 15 |
| D047 Agricultural Science | 21 | 18 | 1 | 2 | 0 | 34 | 29 |
| D048 Food Science | 44 | 40 | 0 | 4 | 0 | 114 | 18 |
| D049 Automotive Engineering | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D050 Industrial Automation | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D051 Real Estate | 8 | 2 | 0 | 6 | 0 | 5 | 19 |
| D052 Construction Management | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D053 Hospitality Services and Management | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D054 Oil and Gas Operations | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| D055 Chemical Engineering | 3 | 3 | 0 | 0 | 0 | 7 | 2 |
| D056 Blockchain and Decentralised Systems | 25 | 2 | 0 | 23 | 0 | 5 | 70 |

The JSON contains `role_records`, `raw_dropped_or_absent_candidates`, `proposed_keys`, source evidence and every scoring component needed for local reconciliation.
