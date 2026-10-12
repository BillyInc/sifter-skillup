# Nigerian-context enrichment — D001–D056

Status: **complete_with_validation_limits**; cursor: **D056**; checkpoint **1**.

This lane enriches the already reconciled global areas without narrowing, renaming, replacing, or editing them. Nigerian claims are recorded at the scope actually supported by the source. A domain-level source is not silently treated as area-specific evidence.

## Counts

- Domains in lane: **56**
- Domains with Nigerian source anchors: **56**
- Global areas carried forward unchanged: **286**
- Evidence records: **1997** (**1396** domain-scope; **601** area-scope)
- Unique Nigerian sources used: **57**
- URLs freshly revalidated: **123**; reachable: **0**; needing manual revalidation: **123**

## Evidence-record contract

Every record in the JSON includes source ID, authoritative URL, source title, URL-level locator, exact local claim, scope, limitation, disposition, and a fresh URL-revalidation result. The current host blocked the batch process from reaching the URLs, so none is promoted to newly reachable; existing verified source-register anchors remain explicitly identified and are not silently treated as fresh HTTP proof. URL-level is reported honestly because the existing source register does not contain page/section locators for every source.

## Scope safeguards

- Global area labels and boundaries were carried forward unchanged.
- Area-scope records require substantive subject overlap between the local claim/source subject and the reconciled area; lexical overlap alone is not a canonical assignment.
- Nigerian sources establish local context, regulatory/training/sector signals, or professional pathways only within their stated limits; they do not imply universal licensing or hiring requirements.
- No canonical taxonomy, role assignment, seed, or global specialization file was edited.

## Domain summary

| Domain | Global areas | Nigerian sources | Domain records | Area records | Disposition |
|---|---:|---:|---:|---:|---|
| D001 Software Engineering | 6 | 4 | 12 | 0 | domain_context_recorded |
| D002 Data Engineering and Architecture | 4 | 4 | 18 | 6 | domain_context_recorded |
| D003 Artificial Intelligence and Machine Learning | 5 | 4 | 33 | 7 | domain_context_recorded |
| D004 Cybersecurity | 8 | 3 | 57 | 29 | domain_context_recorded |
| D005 Cloud Computing and DevOps | 4 | 5 | 28 | 4 | domain_context_recorded |
| D006 Internet of Things and Embedded Systems | 3 | 4 | 26 | 6 | domain_context_recorded |
| D007 User Interface and User Experience Design | 3 | 3 | 10 | 0 | domain_context_recorded |
| D008 Telecommunications and Network Engineering | 4 | 3 | 30 | 12 | domain_context_recorded |
| D009 Data Science | 4 | 4 | 70 | 26 | domain_context_recorded |
| D010 Business Intelligence and Analytics | 3 | 5 | 46 | 5 | domain_context_recorded |
| D011 Quantitative Finance and Financial Engineering | 3 | 8 | 54 | 16 | domain_context_recorded |
| D012 FinTech Engineering | 3 | 10 | 89 | 30 | domain_context_recorded |
| D013 Investment Analysis and Asset Management | 4 | 14 | 65 | 16 | domain_context_recorded |
| D014 Actuarial Science | 6 | 6 | 49 | 24 | domain_context_recorded |
| D015 Accounting | 6 | 4 | 53 | 14 | domain_context_recorded |
| D016 Electrical Engineering | 5 | 2 | 50 | 0 | domain_context_recorded |
| D017 Mechanical Engineering | 5 | 2 | 50 | 0 | domain_context_recorded |
| D018 Civil Engineering | 6 | 2 | 58 | 8 | domain_context_recorded |
| D019 Renewable Energy Engineering | 6 | 3 | 51 | 0 | domain_context_recorded |
| D020 Environmental Engineering | 5 | 4 | 57 | 4 | domain_context_recorded |
| D021 Architecture and Urban Planning | 3 | 1 | 6 | 2 | domain_context_recorded |
| D022 Mining and Geosciences | 4 | 3 | 79 | 19 | domain_context_recorded |
| D023 Medicine | 9 | 2 | 37 | 4 | domain_context_recorded |
| D024 Nursing | 6 | 2 | 117 | 84 | domain_context_recorded |
| D025 Pharmacy | 8 | 9 | 69 | 22 | domain_context_recorded |
| D026 Public Health | 9 | 3 | 64 | 28 | domain_context_recorded |
| D027 Biomedical Science | 9 | 4 | 98 | 51 | domain_context_recorded |
| D028 General Management | 4 | 5 | 20 | 0 | domain_context_recorded |
| D029 Human Resources | 11 | 2 | 5 | 0 | domain_context_recorded |
| D030 Marketing and Brand Management | 7 | 1 | 2 | 0 | domain_context_recorded |
| D031 Sales and Business Development | 6 | 1 | 2 | 0 | domain_context_recorded |
| D032 Project and Programme Management | 4 | 1 | 2 | 0 | domain_context_recorded |
| D033 Product Management | 4 | 3 | 8 | 2 | domain_context_recorded |
| D034 Supply Chain Management | 5 | 1 | 2 | 1 | domain_context_recorded |
| D035 Logistics and Transportation Operations | 4 | 1 | 1 | 0 | domain_context_recorded |
| D036 Procurement and Contract Management | 4 | 1 | 3 | 2 | domain_context_recorded |
| D037 Legal Practice | 7 | 2 | 28 | 18 | domain_context_recorded |
| D038 Compliance, Regulation and Governance | 4 | 4 | 47 | 4 | domain_context_recorded |
| D039 Higher Education and Academic Research | 4 | 4 | 46 | 30 | domain_context_recorded |
| D040 Vocational and Technical Training | 4 | 3 | 52 | 35 | domain_context_recorded |
| D041 Scientific Research | 6 | 3 | 29 | 11 | domain_context_recorded |
| D042 Media Production and Broadcasting | 6 | 4 | 14 | 5 | domain_context_recorded |
| D043 Journalism and Digital Publishing | 3 | 1 | 6 | 2 | domain_context_recorded |
| D044 Graphic Design | 5 | 3 | 6 | 0 | domain_context_recorded |
| D045 Public Administration and Policy | 4 | 2 | 4 | 0 | domain_context_recorded |
| D046 Social Work and Community Development | 3 | 2 | 7 | 2 | domain_context_recorded |
| D047 Agricultural Science | 4 | 3 | 17 | 11 | domain_context_recorded |
| D048 Food Science | 4 | 1 | 8 | 4 | domain_context_recorded |
| D049 Automotive Engineering | 5 | 3 | 78 | 20 | domain_context_recorded |
| D050 Industrial Automation | 4 | 3 | 72 | 16 | domain_context_recorded |
| D051 Real Estate | 5 | 1 | 4 | 0 | domain_context_recorded |
| D052 Construction Management | 3 | 2 | 6 | 0 | domain_context_recorded |
| D053 Hospitality Services and Management | 4 | 3 | 22 | 11 | domain_context_recorded |
| D054 Oil and Gas Operations | 7 | 3 | 64 | 4 | domain_context_recorded |
| D055 Chemical Engineering | 10 | 2 | 50 | 0 | domain_context_recorded |
| D056 Blockchain and Decentralised Systems | 4 | 3 | 16 | 6 | domain_context_recorded |

The machine-readable JSON is the complete evidence register; records are intentionally not duplicated in this summary.
