# D078 unsupported role paths — disposition checkpoint (2026-10-09)

## Result

The current canonical cleaned role registry already excludes all three requested D078 paths from student data. Each record is retained internally for source provenance and audit, with `student_path_status: excluded`, `domain_fit_review_status: unsupported`, `role_domain_reconciliation_status: remove_link_only`, and no area routes. The seed builder omits excluded rows. No additional canonical mutation was needed in this pass.

| Role | D078 student path | Existing destination path(s) | Disposition |
| --- | --- | --- | --- |
| Mathematician | Excluded | D009 Data Science; D010 Business Intelligence; D011 Quantitative Finance; D014 Actuarial Science | Preserve existing reviewed parent links. Their stored fit notes scope the match to data/model, business decision, financial, or actuarial applications; D011 and D014 area routes remain conditional. No new link added. |
| Historian | Excluded | None in the cleaned role registry | Do not invent a transfer. The reviewed record cites the historical-source task and UNESCO field classification; the current domain catalogue has no History/Humanities parent route for this exact role. |
| Biometrician | Excluded | D009 Data Science | Preserve the existing reviewed D009 path and its statistical/data-analysis scope. No new link added. |

## Evidence and interpretation

- The D078 role rows use their ESCO occupation records as source evidence: [Historian (ESCO)](http://data.europa.eu/esco/occupation/0cd729a6-ed11-4338-ac4b-d4b924390128), [Mathematician (ESCO)](http://data.europa.eu/esco/occupation/72628f3a-fd49-499a-9741-870b0a1fcef2), and [Biometrician (ESCO)](http://data.europa.eu/esco/occupation/b0f3f595-4965-4f13-ba5c-f6049b62469f).
- The ILO's [ISCO-08 unit group 2633](https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf) groups philosophers, historians and political scientists and describes historical research through primary and secondary sources. This classification alone does not justify routing a historian into a social-science domain; the D078 disposition also relies on the reviewed field-boundary evidence stored on the role row.
- ISCO-08 group 2120 is Mathematicians, Actuaries and Statisticians, under Science and Engineering Professionals—not proof that every such occupation fits any quantitative domain. Existing destination role rows therefore remain only with their stored domain-specific fit notes and source references.
- The D078 Biometrician exclusion is consistent with its ESCO work description (physical biometric identifiers for medical/industrial use), while the existing D009 Data Science record cites O*NET Biostatisticians as task evidence and explicitly limits the route to statistical/computational data-analysis work. It is not treated as a general D078 social-research role.

## Counts and scope

- Before this checkpoint, the cleaned role registry contained 24 D078 role rows, of which 20 were active and 4 excluded.
- The three requested roles were already excluded; the student-facing D078 count therefore remains 20 before → 20 after this checkpoint. Targeted active D078 paths remain 0 before → 0 after.
- No other D078 roles, global occupation records, area structures, API/UI, SQL, matcher data, or subject data were changed.
- No Historian destination was added because no destination path is already supported in the current canonical role registry. Revisit only if the catalogue later establishes an appropriate Humanities/History domain and evidence-backed route.

## Verification

Run:

```powershell
python -m unittest data.career-mapping._audit.test_d078_unsupported_role_routes_2026_10_09
```

The test verifies D078 exclusion metadata, preservation of the five already-supported destination records, absence of an unsupported Historian transfer, and the seed builder's excluded-row filter.
