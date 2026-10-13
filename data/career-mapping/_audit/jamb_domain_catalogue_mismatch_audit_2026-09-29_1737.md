# JAMB downstream domain-catalogue mismatch audit — 2026-09-29 17:37 UTC

Append-only audit report. No generated seed, role name, domain record, mapping record, scope record, SQL file or downstream data was edited.

## Exact counts

- Total mismatch occurrences checked: **494**.
- Fully source-anchored repair candidates: **332**.
- Mixed current/stale anchors needing reconciliation: **75**.
- Stale-only anchors pointing outside the current selected scope: **15**.
- Genuinely unsupported with no scope anchor: **72**.
- At least one current selected-course anchor: **407**.
- No current selected-course anchor: **87** (16 stale-only + 72 genuinely unsupported).

## Component-score cross-check

- Target domain absent from every declared component score catalogue: **349**.
- Target domain present in a component score catalogue under a different label: **145**.

The 332 fully anchored records are repair candidates, not automatic confirmations: their match type still requires semantic review. The 72 no-anchor records are genuinely unsupported by the current scope evidence. The 15 stale-only records are currently unsupported but may be repairable if a valid selected-course anchor is restored.

## Representative records

### source_anchored_repairable

- `APPLIED BIOLOGY` → `D009 Data Science` (adjacent).
- Stored anchors: ['Biostatistics'].
- Matched current anchors: ['biostatistics']; unmatched: none.
- Component-score status: `domain_absent_from_component_score_catalogue`.
- Action: Reconcile the exact direct/functional/adjacent label against the selected-course evidence, then repair the catalogue link if that label is supported; do not auto-promote.

### mixed_anchor_review

- `Applied Physics` → `D041 Scientific Research` (functional).
- Stored anchors: ['General Physics I (Mechanics)', 'General Physics II (Electricity & Magnetism)', 'General Physics III (Behaviour of Matter)', 'General Physics IV (Vibration Waves and Optics)', 'General Practical Physics I', 'General physics V (Elementary Modern Physics)', 'General Physics VI (Waves and optics)', 'Thermal Physics', 'General Physics VII (Energy and Environment)', 'Classical Physics I'].
- Matched current anchors: ['general physics iii behaviour of matter', 'general physics iv vibration waves and optics', 'general practical physics i', 'general physics v elementary modern physics', 'general physics vi waves and optics', 'thermal physics', 'general physics vii energy and environment', 'classical physics i']; unmatched: ['general physics i mechanics', 'general physics ii electricity magnetism'].
- Component-score status: `domain_absent_from_component_score_catalogue`.
- Action: Keep the link out of confirmed promotion until stale anchors are removed or replaced with selected-course anchors and the semantic label is verified.

### stale_unselected_anchor_repair

- `Banking and Finance` → `D009 Data Science` (adjacent).
- Stored anchors: ['Research Project', 'Quantitative Finance'].
- Matched current anchors: none; unmatched: ['research project', 'quantitative finance'].
- Component-score status: `domain_absent_from_component_score_catalogue`.
- Action: Replace the stale anchor with a current selected-course anchor only if source evidence supports it; otherwise remove/hold the link.

### genuinely_unsupported_no_scope_anchor

- `Applied Geophysics` → `D072 Geospatial Science` (direct).
- Stored anchors: none.
- Matched current anchors: none; unmatched: none.
- Component-score status: `domain_present_under_different_match_type`.
- Action: Keep out of the confirmed student view; require an item-specific selected-course/domain evidence record before any repair or promotion.

## Full machine-readable register

The complete 494-record register is in `data\career-mapping\_audit\jamb_domain_catalogue_mismatch_audit_2026-09-29_1737.json`. Each record includes the JAMB identity, target domain, stored anchors, current-scope matches, component-score evidence, and proposed action.

## Guardrails

- This is classification only; it does not repair or delete links.
- Downstream domains, subgroups and roles were not renamed or edited.
- Generated seeds and SQL were not regenerated or changed.
