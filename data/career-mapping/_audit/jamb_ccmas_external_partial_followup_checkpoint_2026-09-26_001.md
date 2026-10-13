# JAMB–CCMAS/external partial-scope follow-up checkpoint — 2026-09-26 (001)

Status: **incremental and open**. This checkpoint records the focused local
follow-up only. It does not edit shared source mappings, generated scopes, the
main findings register, SQL, or downstream domain/subgroup/role data.

## Scope and coverage

The joined local artifacts were read before this pass:

- `jamb_ccmas_external_audit_inventory_2026-09-26.json`
- `jamb_anomaly_inventory_2026-09-26.json`
- `ccmas_extraction_anomaly_inventory_2026-09-26.json`
- the existing row-range crosswalk/source checkpoints under
  `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/`
- `jamb_ccmas_final_verification_crosscut_001_420_2026-09-26_001.md`
- `jamb_ccmas_repair_handoff_register_rows_281_420_2026-09-26_001.md`

| Measure | Count | Meaning |
|---|---:|---|
| Canonical JAMB identities in the deterministic inventory | 420/420 | Inventory coverage, not semantic closure |
| CCMAS programme packages | 237/237 | Package inventory coverage |
| CCMAS course records | 9,855 | Current parsed course-record universe |
| Focused identities meeting the requested lane rule | 274/420 | External, custom/unanchored, partial, or unrepresented-facet scope |
| Focused identities source-rechecked in this checkpoint | 7/274 | Five external/custom rows plus the two currently flagged unrepresented-facet rows |
| Focused identities not yet rechecked in this lane | 267/274 | Must be handled in later incremental checkpoints |

The 274-row focused queue is not additive by label: its overlaps are preserved.
The current status distribution is 261 `partial_scope_reviewed`, 7
`external_scope_evidenced`, 4 `partial_scope_review_required`, and 2
`combined_scope_review_required` rows. Globally, 273/274 focused rows still
have an unverified offering-cell flag and 270/274 have incomplete selected-course
citation coverage.

## New findings from this pass

### 1. The joined external/unanchored inventory under-counts custom identities

`jamb_ccmas_external_audit_inventory_2026-09-26.json` reports only **5**
`external_or_unanchored_scope_rows`. The canonical anomaly inventory identifies
**8** identities with an empty component reference or an explicit
`__custom__::...` component:

1. Intelligence and Security Studies
2. Social Justice
3. Sociology and Anthroplogy
4. French
5. Environmental Science and Technology
6. Anthropology
7. Sport Science
8. Sport Management (Education)

The three omitted identities are **Intelligence and Security Studies, Social
Justice, and Sociology and Anthroplogy**. The join builder currently detects
custom rows mainly through selected-course rows lacking
`source_ccmas_programme` or through empty `component_refs`; it therefore does
not reliably preserve every explicit custom component as an external/unanchored
join record. This is an inventory defect, not a curriculum approval. The join
logic must be repaired and rerun before this lane can claim complete external
coverage.

### 2. Anthropology has a CCMAS course-level anchor that the custom scope omits

The official NUC Social Sciences CCMAS contains `SOC 102: Introduction to
African Social Anthropology`, including outcomes covering anthropological
perspectives and methods, the relationship between anthropology and other
social sciences, human origins/cultural achievement, and contemporary
relevance. It does **not** establish a standalone Anthropology degree package.

Therefore the correct interpretation is: retain external, provider-specific
Anthropology evidence for the Anthropology facet, but also preserve the
Social Sciences/Sociology CCMAS course as a clearly labelled supporting anchor.
The current `Anthropology` custom scope has 21 external rows and no selected
CCMAS source programme, so it does not currently carry that supporting anchor.
The combined `Sociology and Anthroplogy` row remains a separate unresolved
offering-context problem; this checkpoint does not merge the two identities.

Source: NUC, *Social Sciences CCMAS 2023*, printed pp. 323–324,
`SOC 102: Introduction to African Social Anthropology`,
<https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf>,
accessed 2026-09-26. The source supports the course-level anchor and its
outcomes; it does not support importing a full Sociology curriculum as a full
Anthropology curriculum.

### 3. French’s earlier “no French CCMAS” premise is conclusively contradicted

This is recorded as a source recheck, not a duplicate closure claim. The
official NUC Arts CCMAS lists `B.A. Modern European Languages B.A (French)`
and a French course/outcome section. The local `arts.json` also contains the
`Modern European Languages B.A (French)` package with 40 course records.
The current JAMB `French` mapping remains `D_custom` with 59 external rows,
so its component attribution is still wrong/open: Arts French should be the
CCMAS base, with external provider-specific material retained only where a
real gap is demonstrated. `Education::French` must remain separate.

Source: NUC, *Arts CCMAS 2023*, printed programme listing around p. 22 / PDF
section around p. 394, French course/outcome section printed pp. 437–464,
<https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf>,
accessed 2026-09-26. The source directly supports the French CCMAS component
and course evidence; it does not authorize carrying all 59 external rows into
the JAMB scope.

### 4. Sport external scopes are source-led but not item-proven

The official University of Nigeria, Nsukka Human Kinetics page supports the
course families used by `Sport Science` and `Sport Management (Education)`,
including HKS 243/245, HKS 440/442, HKS 447 and their course descriptions.
However, the selected scope rows still carry null item-level URL, locator and
access-date fields. The external source is therefore a valid source lead, not
yet an item-complete curriculum contract. The local Education CCMAS also has a
distinct `Human Kinetics/Physical Education` package; it must remain a
supporting CCMAS context and must not be silently treated as an identical
Sport Science or Sport Management degree.

Source: University of Nigeria, Department of Human Kinetics and Health
Education, course table and course descriptions (HKS 243, HKS 245, HKS 440,
HKS 442, HKS 447),
<https://humankinetics.unn.edu.ng/course-modules/>, accessed 2026-09-26.
The page supports the named course content and sequence; it is institution-
specific and does not prove a JAMB-wide schedule for every provider.

### 5. Environmental Science and Technology remains an evidence gap, not an unavailable programme

The current row has no CCMAS component, no selected courses and no
student-facing domain links. The NUC accreditation records located for Wesley
list an Environmental Science category containing Estate Management and Urban
and Regional Planning, but do not establish an exact Wesley curriculum for
the JAMB title `Environmental Science and Technology`. Nearby CCMAS titles
such as Environmental Management, Environmental Standards, or Environmental
Health Science must not be substituted by name similarity.

Source: NUC, *Results of Accreditation of Undergraduate Academic Programmes
... July 2023*, Wesley University section, Environmental Science heading and
programme rows,
<https://www.nuc.edu.ng/wp-content/uploads/2024/06/ACCREDITATTION-RESULTS-General.pdf>,
accessed 2026-09-26. This supports the negative/context boundary only; it is
not an exact curriculum source and does not justify marking the JAMB programme
unavailable.

## Existing findings deliberately not repeated as new

The following were found in the prior checkpoints and remain open rather than
being recounted as new discoveries: Social Justice’s ABUAD/CLIFFORD
provider-specific curriculum mismatch; Intelligence and Security Studies’
18-row constructed blend; the separate Arts/FED-OTUOKE Sociology and
Anthroplogy occurrence; Portuguese/English’s missing Portuguese facet; and
Industrial Physics with Electronics and IT Application’s thin IT facet. The
existing reports remain the source of those findings; this checkpoint only
keeps them in the 274-row queue and does not reopen their conclusions.

## Exact remaining work

1. Repair and rerun the joined-inventory logic so all 8 custom/unanchored
   identities are represented, then reconcile the 5-vs-8 count in a new
   machine-readable checkpoint.
2. For the 267 focused identities not rechecked here, read the matching prior
   range/crosswalk report first and audit only unresolved source gaps. Preserve
   each JAMB faculty/institution occurrence; do not deduplicate by display name.
3. Attach item-specific source URL, locator and access date to every retained
   external/custom course. The current focused queue has 270 identities with
   incomplete selected-course citation coverage.
4. Rebuild Anthropology as a bounded external facet plus the explicit SOC 102
   supporting anchor; do not create a standalone Anthropology CCMAS package.
5. Reconcile French against the Arts CCMAS French component and keep
   Education French separate; do not promote the existing 59-row external
   union without course-level comparison.
6. Obtain provider-specific curriculum evidence for Environmental Science and
   Technology, or leave it held with a documented search trail; do not mark it
   unavailable from the missing local seed alone.
7. Keep all partial/combined/unrepresented rows out of confirmed student
   routes until selected courses, outcomes and offering context are closed.
8. Do not begin downstream domain/subgroup/role auditing or fixes in this
   checkpoint.

No shared mapping, source, generated scope, seed, SQL, UI, or main-register
file was edited.
