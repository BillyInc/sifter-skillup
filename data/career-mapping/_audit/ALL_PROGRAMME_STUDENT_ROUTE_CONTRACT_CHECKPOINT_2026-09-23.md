# All-programme student route contract checkpoint (2026-09-23)

Incremental read-only checkpoint for the scaling lane. This records local
repository evidence gathered before the joined programme → university → domain
→ subgroup → role audit is added. No backend/frontend implementation, SQL
application, browser proof, URL fetch, or live-database claim is included.

## Current population counts

| Contract layer | Count | Local evidence |
| --- | ---: | --- |
| Parsed CCMAS programmes | 237 | `data/career-mapping/ccmas/*.json` |
| Generic programme contracts | 236 | `data/career-mapping/_audit/programme_curriculum_contract_2026-09-18.json` |
| Reviewed Sociology programme contract | 1 | `data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json` |
| JAMB identities | 420 | `docs/manual-review/university-programme-ccmas-domain-pipeline-2026-08-19.json` |
| University offerings | 9,130 | same university pipeline audit |
| Unique university/programme pairs | 9,130 | same university pipeline audit |
| Active programme→domain links | 1,344 | `programme_scaling_contract_2026-09-19.json` |
| Domain route instances | 1,344 | `DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json` |
| Subgroup route instances | 3,580 | same downstream route audit |
| Role route instances | 46,941 | same downstream route audit |
| Unique domain/subgroup/role contexts | 5,668 | same downstream route audit |

## Current fail-closed state counts

| Check | Current count | Interpretation |
| --- | ---: | --- |
| Programmes without active domain mapping | 0 | Existing local map covers all 237 programme keys. |
| Programmes with missing downstream routes | 0 | Existing route audit reports full downstream coverage for 237/237. |
| Contextual catalogue items | 121,377 | Canonical compressed student-scaling catalogue. |
| Contextual items `linked` | 5,253 | Explicit item-specific link state; not URL reachability proof. |
| Contextual items `no_link` | 116,116 | Honest item-specific no-link state; remains allowed to render only as an explicit unavailable state. |
| Contextual items `review_required` | 8 | Must remain blocked from student evidence. |
| Contextual items missing link state | 0 | Existing link-state audit. |
| Contextual items missing source locators | 0 | Existing link-state/scaling audits. |
| Ownership mismatches | 0 | `guidance_owner` matches context level in local catalogue. |
| Missing source references/locators | 0 | Local source contract is complete. |
| Role-aggregate leakage candidates | 0 | No role-aggregated foundation/tool rows pass the student boundary. |
| Unresolved/not-established relationships | 2,305 | Must remain fail-closed and non-student-visible. |
| Generic curriculum raw annotation rows | 0 | Student contract strips source annotations. |
| Curriculum legacy fallback risk | 0 | Student contract does not fall back to legacy profile arrays. |

## Progress

- Read `AGENTS.md` and the controlling product/route documents listed by the
  existing scaling acceptance matrix.
- Inspected the existing university→JAMB→CCMAS→domain audit, the all-programme
  downstream route audit, contextual link-state audit, student/admin boundary
  audit, route context helper, and Explore navigation helper.
- Confirmed the new audit must join the existing university offering evidence to
  the 237 CCMAS programme keys, rather than treating the three existing UI
  fixtures as population proof.
- Next: add a deterministic local audit/test with one record per CCMAS
  programme, university reachability and identity checks, downstream route
  counts, ownership/link-state counters, and explicit review-only blocking
  assertions.

## Evidence boundary

This checkpoint is local structural evidence only. SQL remains unapplied and
browser/runtime proof remains intentionally absent.

