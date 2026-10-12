# D060–D064 role-coverage checkpoint

Date: 2026-10-06  
Status: batch checkpoint saved; candidate inventory only. Canonical taxonomy, parent fit decisions, and subgroup/specialization links are unchanged.

## Rebuilt active counts and dispositions

Counts were reread from current `domain_structure.json` and cross-checked against the exact D045–D084 role-fit worklist. `role_library_v3.json` remains a distinct, unpromoted candidate pool and is not treated as active student role coverage.

| Domain | Current active roles | Evidence-led disposition |
|---|---:|---|
| D060 Banking and Credit Services | 21 | Coverage spans branch service, lending, credit analysis/risk and back office. Banking compliance/financial-crime compliance is a candidate family supported by Basel guidance; title and overlap with security/risk roles need review. |
| D061 Insurance | 20 | Operational coverage is broad. Insurance actuarial pricing/reserving/capital work is not visibly represented as a distinct actuary role; compare with insurance rating analyst and risk consultant before adding. |
| D062 Trading | 29 | Broad coverage exists. Quantitative investment research/analysis is a candidate specialist family supported by CFA Institute material; compare against financial/investment/data analyst and risk roles. |
| D063 Economics and Policy Analysis | 17 | First-pass coverage already includes economists, economic research, multiple policy functions and economic teaching. No additional distinct role family is justified from this source screen; name-case variants/duplication are an identity-quality issue, not a missing-role proposal. |
| D064 Psychology and Counselling | 20 | Existing paths include clinical, educational and health psychologists, counsellors, psychotherapists and mental-health support roles. Counseling psychology is recognized as a professional specialty, but evidence does not justify a duplicate role record absent distinct task and credential boundaries. |

The five domains total 107 active mappings. D045–D064 now have explicit coverage dispositions for 20 domains and 264 active mappings. This does not change the separate completed fit lane's total of 563 mappings.

## Evidence notes

- Basel Committee/BIS guidance establishes the bank compliance function's responsibilities: identify/manage compliance risk, advise on regulatory requirements, monitor compliance and address financial-crime risks. It also states organizational arrangements and titles vary by jurisdiction and institution. No Nigeria-specific variant is asserted.
- IFoA general-insurance materials describe actuarial pricing, reserving and capital modelling. IAIS notes insurer actuary roles/responsibilities differ across jurisdictions; the register therefore uses the global profession/family and does not infer Nigerian statutory title requirements.
- CFA Institute describes quantitative researcher/analyst paths in investment analysis and quantitative investing. This is an established specialist job-title family, not a regulated occupation; exact title prevalence and overlap with current analyst roles need validation.
- OECD/ILO occupational material and the domain's current role list together support an explicit “no new role family proposed in this pass” disposition for D063. Existing duplicate/case variants should be handled as exact-key identity reconciliation, separately.
- APA recognizes counseling psychology as a professional specialty. ILO provides a broader psychologist occupational group; these sources support recording counseling psychology as a specialty candidate rather than automatically adding a near-duplicate role to the active taxonomy. Protected titles/licensing vary by country.

Candidate tasks, fit rationales, title status, source references and Nigeria-specific-evidence status are in `role_coverage_candidate_register.json`. No country variant was asserted without direct Nigerian source evidence.

## Validation

The register tests check exact domain keys through D064, active counts against canonical data and the completed role-fit worklist, duplicate candidate keys, candidate source coverage, and no subgroup assignment/canonical mutation. Tests pass:

```powershell
python -m unittest data.career-mapping._audit.role_coverage_lanes_2026_10_05.D045_D084.test_role_coverage_candidate_register -v
```

## Next batch

Continue with D065–D069. D065–D084 (20 domain IDs) remain to receive explicit coverage dispositions. Keep D084's four unsupported role-link proposals separate and unapplied. Role→specialization mapping remains deferred until the specialization audit is complete.
