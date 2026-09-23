# External Enrichment Stratified Sample — 2026-09-23

## Scope

- 20 item records: 10 previously linked and 10 review-required, sampled across role, domain and subgroup contexts and multiple item types.
- 20 relationship records: unresolved relationship rows sampled across the current role-level relationship ledgers.
- Live verification used authoritative item/role documentation for representative records, including Microsoft Support/Learn, Adobe, W3C, O*NET, AWS and NIST.
- No catalogue, SQL, student-facing or admin-facing data was changed.

## Results

| Sample | Result | Interpretation |
|---|---:|---|
| Linked items | 10/10 retain substantive item-identity evidence | The original item search did produce valid item-level sources for specific labels such as Access, Outlook, Acrobat, XML and Git. |
| Review-required items | 10/10 remain review-required | The sources either describe a broad umbrella label, a related concept, or the item without proving the exact local context or role requirement. Microsoft Office software is in this group: Microsoft confirms the suite, but not the specific Software Analyst association. |
| Relationships | 20/20 remain not-established | The sources identify the role/from-item or describe the two technologies separately, but do not establish both typed endpoints plus an exact approved `builds_on`/`works_with` edge in the selected context. |

## Decision

The evidence does not justify a blanket rerun of the enrichment queues. The relationship enrichment is behaving correctly and conservatively. The item enrichment was not empty or pointless: it correctly linked specific item identities, while broad or context-ambiguous labels were retained for review. Remaining work should be targeted at records where a stronger item-specific/context-specific source may exist; it should not blindly repeat all 9k+ items or all relationships.

## Representative live checks

- Microsoft Access help identifies Access and its database, query, form and report functions: <https://support.microsoft.com/en-us/access/>.
- Microsoft Outlook documentation identifies Outlook and its email, calendar, contacts and task functions: <https://support.microsoft.com/en-us/outlook/basic-tasks-in-outlook>.
- Microsoft 365 documentation confirms the product family and included applications, but does not prove a Software Analyst requirement: <https://learn.microsoft.com/en-us/microsoft-365-apps/deploy/about-microsoft-365-apps>.
- O*NET confirms role/tool co-occurrence for Blockchain Engineers; AWS documentation confirms AWS blockchain concepts, but neither supplies the missing local two-endpoint relationship: <https://www.onetonline.org/link/details/15-1299.07> and <https://docs.aws.amazon.com/managed-blockchain/latest/ethereum-dev/ethereum-concepts.html>.
