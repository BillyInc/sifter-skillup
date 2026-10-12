# JAMB–CCMAS source-phase incremental checkpoint — 2026-09-26 (001)

Status: **saved and open**. This checkpoint records the current verified
inventory and issue queue before the next full-catalogue adjudication pass. It
does not edit shared JAMB/CCMAS source files, mapping files, scopes, seeds,
downstream domains/subgroups/roles, SQL, or UI.

## Exact artifacts

- Machine-readable queue:
  `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.json`
- Human-readable queue:
  `data/career-mapping/_audit/jamb_ccmas_source_issue_queue_2026-09-26_001.md`
- Builder:
  `data/career-mapping/_audit/build_jamb_ccmas_source_issue_queue_2026_09_26.py`
- Inputs read:
  `data/career-mapping/_audit/jamb_anomaly_inventory_2026-09-26.json`
  `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`
  `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`
  `data/career-mapping/_audit/ccmas_extraction_anomaly_inventory_2026-09-26.json`
  `data/career-mapping/_audit/jamb_ccmas_external_audit_inventory_2026-09-26.json`

## Verified coverage and counts

| Measure | Count |
|---|---:|
| Canonical JAMB identities represented | 420 |
| CCMAS programme packages represented | 237 |
| CCMAS course records represented | 9,854 |
| JAMB identity rows with an open source-phase issue | 420 |
| JAMB identity rows with no current issue detected | 0 |
| Identity issues classified as confirmed evidence gaps | 1,249 |
| Identity issues classified as semantic candidates | 44 |
| Catalogue candidate issues | 1,102 |
| Catalogue rows classified as source-authored repeats/no repair | 3 |
| Issue records containing at least one missing URL | 101 |

The missing-URL count is itself an open evidence gap, not a claim that no
authoritative source exists. Those records remain held until an item-specific
URL, locator, and access date are attached.

## Identity issue breakdown

| Issue type | Count | Classification |
|---|---:|---|
| `scope_evidence_missing` | 407 | confirmed gap |
| `offering_context_unverified` | 419 | confirmed gap |
| `selected_course_citation_incomplete` | 269 | confirmed gap |
| `selected_course_content_or_outcome_gap` | 122 | confirmed gap |
| `combined_scope_zero_courses` | 26 | confirmed gap |
| `scope_semantic_review_required` | 41 | candidate |
| `external_or_custom_evidence_contract` | 7 | gap/candidate by row |
| `named_facet_unrepresented` | 2 | confirmed gap |

## Catalogue queue breakdown

| Candidate class | Count | Current treatment |
|---|---:|---|
| Empty/placeholder content summary | 1,092 | candidate; source-boundary review required |
| Exact duplicate outcome text | 7 | 4 candidate; 3 classified source-authored/no repair |
| Page-header spill | 6 | candidate; exact PDF boundary check required |

Previously closed local repairs were not reopened: French CCMAS anchoring, the
Social/Management Film and Video Studies occurrence, recorded page-header
repairs, CAM 424 equipment spill, DTS 498/CSC 432 cross-reference spill, and
replacement-character normalization.

## Next pass

Continue the full source-phase adjudication from this queue. For every open
row, verify the exact JAMB offering context, each substantive title component,
selected CCMAS/external courses and outcomes, and item-level citations. Keep
confirmed student links closed until evidence supports them. Downstream domain,
subgroup, role, and role-naming work remains deferred.
