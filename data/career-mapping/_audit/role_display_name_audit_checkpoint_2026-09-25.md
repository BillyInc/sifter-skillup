# Active role display-name audit checkpoint — 2026-09-25

## Scope and inventory

Audited the active visible role catalogue against the existing role UI/guidance contract and the repository's occupational source records. The canonical inventory is assembled using the career-seed merge/deduplication key (`domain_id|role_name`) across `role_library_v3_cleaned.json`, `emerging_role_overlays.json`, and `thin_domain_role_overlays.json`, then excludes the eight hidden domains listed by the current domain audit. This reconciles to **5,089 active student-visible role keys** (5,205 merged unique keys before excluding 116 roles in hidden domains). The merge key, IDs, source names and official title fields were not changed.

Source checks used the checked-in ESCO English occupations export (`_tax_src/esco/occupations_en.csv`, including concept URI, ISCO code, preferred label, alternate labels and description), O*NET Occupation Data and Alternate Titles exports, and role-work-profile occupational codes. UI expectations were checked against `docs/PROGRAMME_TO_ROLE_GUIDANCE_CONTRACT.md` and `docs/GUIDANCE_FLOW_UI_UX_SPEC.md`: a role needs an intelligible student identity, with its work and evidence explained in the role detail; the display label is not a substitute for the role explanation.

## Results

- ESCO: 4,733 active deduplicated rows had resolvable ESCO codes. Canonical names matched their official preferred/alternate source labels except for the two high-confidence wording cases below. Existing source-backed `student_display_name` values (19 rows) were checked against the respective source labels/descriptions; all remain unchanged.
- O*NET: 304 active code-linked rows matched the official occupation or alternate-title records. No source/title mismatch was found.
- Other overlays: retain their source-backed names. Broad WEF future-job categories and specialist overlay titles are not rewritten absent item-specific evidence that the source intends a different occupation title.
- Twenty residual “All Other”/“not elsewhere classified” labels are official residual occupational groups, not evidence of a specific occupation. Keep them as source-defined categories; do not invent narrower titles.
- The WEF aggregate job-family titles and remaining compound/slash labels are retained for review where their source describes a group, composite duty set or emerging-work category rather than a single normalized occupation. No blanket title normalization was performed.

## Two supported display refinements

| Active role key | Source evidence | Student display label | Preserved source identity |
|---|---|---|---|
| `D023|doctors` | ESCO code `3256.1`, concept `0c041d1e-1841-4acb-b0a1-2c387a61bf65`; preferred label “doctors' surgery assistant”; description explicitly describes assistants supporting doctors during procedures and standardized diagnostic work. | `Doctors' Surgery Assistant` | `role_name` remains `doctors`; `role_key` remains `D023|doctors`. |
| `D045|special-interest groups` | ESCO code `1114.1`, concept `e9cf8b24-6b8b-47cc-9dd3-b601aa135960`; source label is “special-interest groups' official”; description says these officials represent and act on behalf of special-interest groups. | `Special-Interest Group Representative` | `role_name` remains `special-interest groups`; `role_key` remains `D045|special-interest groups`. |

The changes are separate `student_display_name` fields in the cleaned role source. No source/official role name, occupational code, domain membership, role number, or identifier was altered. No wording was added to the source fields.

## Retained for review; not renamed

1. Twenty residual “All Other”/NEC titles listed above: the source does not identify a narrower occupation.
2. WEF Future of Jobs Report 2025 aggregate titles: source-backed as published job-family categories, but their presentation as individual role cards versus category cards is a product-taxonomy question.
3. Remaining compound/slash names, including O*NET composite titles and specialist esports/XR overlays: keep exact source wording until a source supports a clearer singular title or the UI models them as role families.
4. Comma-bearing official titles: retained; the punctuation alone is not evidence of confusion or a bad source match.

## Materialization and transport status

The seed generator already selects `student_display_name` for student `role_name` output while retaining the canonical role key. The existing committed/working transport predates the current resolved D129 names, Life Scientists unassigned queue and the two display fields, so it is stale. No SQL was applied.

### Gate attempt and safe-stop

An isolated-copy run of `_apply_emerging_domain_structure.py` was attempted first. It stopped before writing because `role_library_v3_cleaned.json` is not valid JSON: parser error at line 47,750, column 254. The malformed row is `glove maker` (`ESCO 7533.3`): its `essential_skills` value ends `... sew protective worurce": "esco",` and is followed by another role's `onet_score`/occupational fields without a valid object boundary. The workspace file has this same parse error and was not repaired or rewritten because the shared role library may be under active mapping-agent ownership. Consequently `_build_source_backed_layers.py`, `_audit_role_completeness.py`, `validate_career_resource_seed_gate.py`, `_gen_career_seed.py`, and compressed transport generation have **not** been run successfully against the current source state.

The two display fields are present in the shared role file, but the file's invalid JSON means they are not yet safely materialized or seed-verified. Reapply/retain those two exact fields after the role-library owner repairs and validates the malformed row. Once the source parses, rerun the full required gate sequence in an isolated copy and regenerate the SQL transport. Until then the current SQL transport remains stale and must not be applied as current data.

### Follow-up repair attempt (2026-09-25)

Repaired the `glove maker` (`D075`, ESCO `7533.3`) row from the matching checked-in `HEAD` object: restored its exact ESCO `essential_skills` ending (`...sew protective workwear`) and its source `optional_skills`. This correction did not alter `role_name`, domain, role number, source code, or either student display label. The first JSON parse error is cleared.

Whole-file JSON validation now stops at a **separate** malformed splice on line 47,818, in the `pre-lasting operator` record: the `also_known_as` string ends with `... bevel cutting maills": "financial statements | ...`, showing another record's content fused into that value. This is outside the specifically authorized glove-maker repair, so it was not changed. The JSON remains invalid; materializer and seed gates remain blocked, and SQL transport still requires regeneration after the remaining source is repaired and gates pass.
