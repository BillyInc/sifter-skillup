# Taxonomy naming final verification checkpoint — 2026-09-25

Read-only verification of the current naming-resolution pass. No source, taxonomy, role, generator, or generated seed file was edited for this checkpoint. This report is the only new file.

## Scope and evidence

Compared the current `data/career-mapping/domain_meta.json`, `domain_structure.json`, and `role_library_v3_cleaned.json` with:

- `domain_subgroup_label_checkpoint_2026-09-25.json` (558 domain+ISCO pairs);
- `domain_subgroup_source_naming_audit_2026-09-25.json` (168 domains and 558 subgroup pairs);
- `domain_display_label_uncertain_investigation_final_2026-09-25.md` (all 11 uncertain domain labels);
- `domain_subgroup_uncertain_pairs_review_2026-09-25.md` and checkpoint 002 (all 8 uncertain pairs);
- `_apply_emerging_domain_structure.py`, including its label tables and the current computational-layer manifest.

Role-name continuity was compared with the repository’s `HEAD` version of `role_library_v3_cleaned.json`; the current role inventory was also checked with the materializer’s overlay loader. This comparison verifies unchanged names for records that remain; it does not prove role-to-domain suitability beyond the cited pair audit.

## Full-coverage result

- Domains: **168/168 present**. Every current domain name matches the audited snapshot or a reviewed refinement/resolution. No unaccounted domain-name mismatch was found.
- Subgroups: the audited 558-pair set reconciles exactly after the documented corrections: replace D129 pairs `11/21/31` with `01/02/03`, and remove D143/21. The current structure has **557** pairs, exactly the expected set; no other pair is missing or extra.
- Prior reviewed refinements: all 20 domain names and all 9 subgroup names are present in the current source files.
- Uncertain domain labels: all 11 outcomes match the investigation report—six supported renames and five supported keeps. D086’s source cluster is also restored to `Retail, Sales & Commerce`.
- Uncertain subgroup outcomes: D107/31 and D111/72, /75, /81 have the reviewed labels; D129’s codes are zero-prefixed; D143/21 is absent.
- Active role-count reconciliation: all 557 current subgroup counts match the deduplicated current role-plus-overlay inventory, including D129 counts of 12/4/5. The four removed D143/21 records are not counted as current subgroup members.

## Findings requiring correction or follow-up

### 1. D129 codes are repaired, but three labels do not match the audit’s exact ILO-title recommendation

The current role records use string unit-group codes `0110`, `0210`, and `0310`. Their first two characters now correctly produce sub-major codes `01`, `02`, and `03`, and `domain_structure.json` contains those three keys with the expected 12/4/5 role counts. This fixes the leading-zero loss.

The current labels in both `domain_structure.json` and `_apply_emerging_domain_structure.py` are close paraphrases, not the canonical titles explicitly recommended in the uncertain-pair report:

| Code | Current label | Recommended source-aligned label |
|---|---|---|
| D129/01 | Commissioned Military Officers | **Commissioned Armed Forces Officers** |
| D129/02 | Non-commissioned Military Officers | **Non-commissioned Armed Forces Officers** |
| D129/03 | Other Military Ranks: Combat and Technical Roles | **Armed Forces Occupations, Other Ranks** |

Fix recommendation: use the recommended canonical labels in the subgroup `label` field and in the generator’s `SUBGROUP_LABELS` entries. If the product needs the more explanatory current phrases, retain them as separately described student-facing copy rather than substituting them for the canonical source title. Keep codes as strings and preserve all role names and membership. ILO defines 01/02/03 and unit groups 0110/0210/0310 with these titles ([ILO ISCO-08 overview](https://isco.ilo.org/en/isco-08/), [ILO ISCO-08 Volume I](https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40dgreports/%40dcomm/%40publ/documents/publication/wcms_172572.pdf)).

### 2. D143/21 path is removed, but one role name was deleted instead of preserved outside that path

The current D143 structure has no subgroup 21; neither the cleaned role records nor their loaded overlays currently produce a D143/21 member. Three of the four role names recorded in the audit—`astronomer`, `cosmologist`, and `physicist`—remain in the role inventory under D041 with ISCO 2111. The fourth, **`Life Scientists, All Other`**, is absent from the current cleaned inventory and the current raw `role_library_v3.json`; its D143 record existed in the prior `HEAD` cleaned file. Thus the forbidden forensic subgroup path is gone, but the audit’s instruction to preserve role identities/global classifications is not fully satisfied.

Fix recommendation: preserve the exact role name and its source record outside D143/21; do not put it back under the forensic domain. The cited O*NET record defines “Life Scientists, All Other” as a residual life-scientist category (“all life scientists not listed separately”), not as forensic science ([O*NET 19-1099.00](https://www.onetonline.org/link/details/19-1099.00)). Restore the role identity to the appropriate life-science/global role inventory only with its source-supported occupational code and ownership; if no defensible domain owner is established, retain it as unassigned/review-only rather than deleting it or forcing a forensic link. Keep the three physical-science names unchanged; ISCO 2111 is “Physicists and Astronomers” under sub-major group 21 ([ILO ISCO-08 Volume I](https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40dgreports/%40dcomm/%40publ/documents/publication/wcms_172572.pdf)).

Role-name diff result: **zero renamed role names among common role keys** compared with `HEAD`; four D143-scoped rows are absent. Three have unchanged-name records elsewhere as stated above; `Life Scientists, All Other` has no current record. This is a deletion/membership issue, not a role-title rewrite.

### 3. Eight uncertain-domain descriptions are still missing

The 11 labels are resolved, but `domain_meta.json` has no description for D086, D087, D088, D089, D100, D101, D108, or D113. The domain-label investigation expressly recommends recovering these from the original domain-definition source, not inferring prose from the display name or occupational code. D086’s cluster mismatch is already fixed. D133’s current description now reflects the specialist transport-interiors scope and no longer contains the conflicting general luxury-craft scope.

Fix recommendation: restore the eight descriptions from the original source record (or a reviewed exact extract) and keep the already verified names/clusters. Do not synthesize definitions from titles or adjacent domains. This is a source-content follow-up, not a failed label disposition.

## Materializer survival check

This check was simulated in memory from the current materializer constants, computational manifest, current structure and current role/overlay inventory; `_apply_emerging_domain_structure.py` was **not run** because it writes source data.

- Domain labels: the materializer does not write `domain_meta.json`, so all 20+11 domain name outcomes remain untouched by this script.
- Subgroup labels: all 9 previously reviewed refinements and all currently applied uncertain subgroup labels survive the materializer’s existing-label/explicit-label behavior.
- D129: the materializer slices the string `isco_group` to its first two characters, so `0110/0210/0310` continue to resolve to `01/02/03`; it will preserve the current D129 labels because they are explicit entries in `SUBGROUP_LABELS`. The recommended canonical replacements will survive only after those three constants are updated to the canonical strings.
- D143/21: no current D143 role or overlay has an ISCO code beginning `21`; the materializer therefore will not synthesize D143/21. Its current absence survives.

## Superseding verification note — current source state (2026-09-25)

The findings above in sections 1–2 are a stale snapshot and are superseded for the specific D129 and Life Scientists dispositions below. This addendum preserves the original checkpoint rather than rewriting its history.

- **D129:** `domain_structure.json` now has the exact source titles **Commissioned Armed Forces Officers**, **Non-commissioned Armed Forces Officers**, and **Armed Forces Occupations, Other Ranks**, with role counts 12/4/5. `_apply_emerging_domain_structure.py` contains those same exact labels in `SUBGROUP_LABELS`. The role occupational-code strings remain zero-prefixed `0110`, `0210`, `0310`; the materializer's first-two-character derivation therefore preserves keys `01`, `02`, `03` and these labels. The earlier recommendation to change the titles is completed; no role names or memberships were changed by this correction.
- **Life Scientists, All Other:** the exact O*NET residual category is retained in `data/career-mapping/_audit/unassigned_role_review_queue_2026-09-25.json`, with source code `19-1099.00`, source URL and description, prior D143 association, and `unassigned_review_only` disposition. It is intentionally not an active student role and is not restored under forensic science; this satisfies the conservative fallback recommended above without inventing a domain owner.
- **D143/21:** remains absent. The three physical-science role identities noted earlier remain under D041; the Life Scientists residual remains separately retained in the unassigned queue.


**Correction to the gate status after the authorized scoped repair:** the D075 `glove maker` row was restored from `HEAD`/ESCO, clearing the original line-47,750 parse failure. Full JSON validation then exposed a second malformed splice at line 47,818 in `pre-lasting operator`. No further repair was made because the authorization was limited to the glove-maker row. The file still does not parse, so the source-backed layer, completeness/resource gates, seed, and transport regeneration remain blocked. Current SQL transport remains stale; regenerate only after all malformed source content is repaired and gates pass. No database action is implied.

## Summary

The 168-domain naming reconciliation and 557 active subgroup-key reconciliation pass. The main D129 structural defect and D143/21 path are corrected. Before calling the uncertain-name work fully source-aligned, update the three D129 titles to the exact ILO labels and preserve `Life Scientists, All Other` outside the forensic path. Separately restore the eight missing definitions from their original source. No role title was rewritten in the current diff.
