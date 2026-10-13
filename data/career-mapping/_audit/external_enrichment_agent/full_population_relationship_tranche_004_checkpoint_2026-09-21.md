# Full-population relationship enrichment — tranche 004 checkpoint

Selection is saved before web searching so the work is resumable.

Latest incremental checkpoint: **2026-09-21T14:07:30+01:00**.

- Prior relationship search records: **20**.
- Current tranche selected rows: **8**.
- Current tranche searched rows: **8**.
- Current tranche results: **0 linked**, **8 review_required**, **0 genuinely_unavailable**.
- Remaining selected rows: **0**.
- D078 rows selected: **0**; prior-tranche overlap: **0**.
- SQL, generated seed transport, catalogue, UI and browser-proof files: **untouched**.

First search batch: JavaScript and Jenkins CI under `D001|Software Quality
Assurance Analysts and Testers`. O*NET lists both as occupation-associated
software skills, and official Jenkins/MDN documentation establishes the
endpoints separately, but no authoritative source names a second typed
endpoint and an explicit same-context `works_with`/`builds_on` relationship.
Both rows remain `review_required`; no edge was promoted.

Second search batch: Linux and Microsoft Azure software under the same role.
Microsoft Learn explicitly documents Jenkins on Azure Linux VMs and Azure
CI/CD, while O*NET lists both technologies for the occupation. The evidence is
generic infrastructure/workflow material rather than an explicit typed edge in
the exact role context, so both rows remain `review_required` and no edge was
promoted.

Fourth search batch: XML and HTML under `D001|Computer Programmers`. W3C
explicitly describes XHTML as HTML 4 reformulated as an XML application, and
O*NET lists both technologies for Computer Programmers. This is a generic
standards relationship, not an explicit typed edge in the local role context;
both rows remain `review_required` and no edge was promoted.

Third search batch: C# and Cascading Style Sheets CSS under
`D001|Computer Programmers`. Microsoft’s official C# ASP.NET Core tutorial
shows CSS used in a C# web-application workflow, while W3C defines CSS and
O*NET lists both for Computer Programmers. The evidence does not state an
explicit typed edge in the exact local role context, so both rows remain
`review_required` and no edge was promoted.
