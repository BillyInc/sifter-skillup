# Global source check: current 11 unresolved parent-domain role keys

Date: 2026-10-06. This note is research attached to the exact unresolved queue
in `../GLOBAL_CONTINUATION_2026_10_06/exact_role_fit_coverage_2026_10_06.json`.
It does **not** create a second disposition ledger or alter canonical data.

## Why these remain unresolved

The exact remaining rows have no task description in the canonical role record
(`task_evidence: null`). O*NET's official residual-category profiles explicitly
say that occupation-specific data are unavailable for these “All Other”
entries. The ILO's global method defines occupations using similarity of main
tasks and duties; it does not authorize treating a broad family label as task
evidence. Therefore this search strengthens the reason to keep these exact
keys unresolved; it does not justify changing them to supported, conditional,
or unsupported without a more specific occupation/task record.

| Exact role key | Global source check and limitation |
|---|---|
| `D007|Designers, All Other` | O*NET-SOC 27-1029.00 says “all designers not listed separately” and provides no task data. That does not establish digital-interface or UX work. [O*NET](https://www.onetonline.org/link/summary/27-1029.00) |
| `D009|Mathematical Science Occupations, All Other` | O*NET-SOC 15-2099.00 says all mathematical scientists not listed separately; it directs users to specific occupations such as bioinformatics technicians but provides no residual task profile. This does not establish Data Science work. [O*NET](https://www.onetonline.org/link/summary/15-2099.00) |
| `D010|Business Operations Specialists, All Other` | O*NET-SOC 13-1199.00 is a residual category with no occupation-specific task profile. Business operations alone cannot establish BI/analytics duties. [O*NET](https://www.onetonline.org/link/summary/13-1199.00) |
| `D010|Financial Specialists, All Other` | O*NET-SOC 13-2099.00 is a residual group; the exact row contains no task detail. Financial-sector membership cannot establish business-intelligence analysis. [O*NET](https://www.onetonline.org/link/summary/13-2099.00) |
| `D022|Extraction Workers, All Other` | O*NET-SOC 47-5099.00 says extraction workers not listed separately and offers no role-specific tasks; BLS SOC examples such as mine-milling and tailings workers do not establish a uniform task set for the whole residual. [O*NET](https://www.onetonline.org/link/summary/47-5099.00), [BLS SOC definitions](https://www.bls.gov/soc/2018/soc_2018_definitions.pdf) |
| `D041|Physical Scientists, All Other` | O*NET-SOC 19-2099.00 says all physical scientists not separately listed, with a pointer to remote-sensing scientists, but no residual task profile. The generic scientific label cannot establish the mapped domain's particular research scope. [O*NET](https://www.onetonline.org/link/summary/19-2099.00) |
| `D042|Media and Communication Workers, All Other` | O*NET-SOC 27-3099.00 says media/communication workers not separately listed and has no task data; it cannot distinguish production/broadcast duties from other communications work. [O*NET](https://www.onetonline.org/link/summary/27-3099.00) |
| `D122|Health Technologists and Technicians, All Other` | O*NET-SOC 29-2099.00 is a no-task residual and points to neurodiagnostic technologists, ophthalmic medical technologists, and patient representatives—examples that do not establish a common medical-laboratory task set. [O*NET](https://www.onetonline.org/link/summary/29-2099.00) |
| `D124|Healthcare Support Workers, All Other` | O*NET-SOC 31-9099.00 has no residual task profile and points to speech-language pathology assistants and endoscopy technicians. Those examples do not establish community-health-extension duties. [O*NET](https://www.onetonline.org/link/summary/31-9099.00) |
| `D126|Healthcare Diagnosing or Treating Practitioners, All Other` | O*NET-SOC 29-1299.00 has no residual task profile and points to naturopathic physicians and orthoptists. The examples have materially different relationships to complementary/alternative medicine, so the broad key cannot safely be closed as a whole. [O*NET](https://www.onetonline.org/link/summary/29-1299.00) |
| `D150|Religious Workers, All Other` | O*NET-SOC 21-2099.00 says religious workers not separately listed and provides no task data. It cannot establish that all included roles perform ministry, theology, or interfaith leadership tasks. [O*NET](https://www.onetonline.org/link/summary/21-2099.00) |

## Method source

The ILO defines an occupation by similarity of its main tasks and duties and
describes ISCO as a task-based classification. It is methodological authority,
not a role-specific task source: [ILO ISCO-08](https://isco.ilo.org/en/isco-08/).

## Reconciliation counts

- Canonical exact keys in the broader audit: **3,919**.
- Current terminal statuses in the broader reconciliation: **3,908**.
- Current unresolved exact keys: **11**, all listed above.
- Conflicting terminal statuses within the broader reconciliation: **0**.
- New dispositions created by this note: **0**.
- Canonical edits / Nigeria-specific research / role→specialization decisions: **none**.
