# Lane 2 source-audit checkpoint 013 — corrected German package reconciliation

## Correction to checkpoints 006–012

The previous increments inspected the wrong JSON properties when deciding whether course outcomes and contact hours were present. In the current CCMAS data, outcomes are stored in `skills_learned`, lecture hours in `lh`, and practical hours in `ph`. The earlier increments queried nonexistent `learning_outcomes`, `lecture_hours`, and `practical_hours` properties; they therefore incorrectly described many populated local fields as missing. Their PDF source comparisons and locators remain in the audit trail, but their local-field conclusions are superseded here.

## Corrected result

Reconciled all 36 package-080 local rows 6–41 against the actual local keys and the previously opened NUC Arts CCMAS course blocks (official PDF, accessed 2026-09-28, printed pp. 471–488). The per-row outcome counts, local hours, source counts/hours, remaining count mismatches and content issues are in the JSON. This is a complete *row screen*, not a complete item-by-item transcription audit of every outcome statement.

The corrected findings include:

- Many outcomes and contact hours are already present locally; they are not missing. Several arrays have the right count but merge separate source outcomes or include page-boundary text.
- Confirmed outcome-count differences include GER 106 (7 local / 8 source), GER 201 (5/6), GER 203 (6/7), FAC 201 (1/7, with unrelated German-programme text in its one composite entry), GER 207 (6/7), GER 209 (4/5), GER 301 (4/5), GER 307 (2/3), GER 303 and GER 304 (no local representation of source cross-reference outcomes), GER 401 (0/6), GER 402 (2/3), GER 404 (2/3), GER 405 (no local representation of the source cross-reference), and GER 406 (8/6 because two GER 407 outcomes were merged into GER 406).
- Verified hour/metadata gaps are narrower than previously reported: GST 222 and FAC 201 lack source LH 30; GER 204 lacks source PH 90; GER 209 lacks source PH 90; ENT 312 lacks source PH 45; GER 401 lacks source PH 90; GER 402 lacks source units 2 and PH 90. Other checked rows carry the source-stated hours locally.
- Content defects remain: several summaries are truncated; FAC 201 has no content summary and a contaminated composite outcome; FAC 302's content field crosses source-field boundaries; GER 209's source content statement is stored in `skills_learned` while `content_summary` is null; GER 406 contains GER 407 and minimum-equipment material. These source-extraction defects are distinct from outcome/hour presence.
- German CCMAS source-internal title/code/structure conflicts remain open exactly as checkpoint 005 records. GER 407 is still a confirmed missing course row; checkpoint 005 remains the controlling source citation for that omission and its LH/PH conflict.

## Coverage vs sign-off

The actual-field row screen now covers **41/41 local package-080 rows**. Outcome-by-outcome textual reconciliation, source-conflict adjudication, and repair remain open. The 5 confirmed defects and 5 source conflicts in checkpoint 005 remain; this correction adds the accurate field-level differences and contamination findings. Do not interpret completed row screening as a completed source audit, clean package, or approved student data. No CCMAS source JSON, mapping, or seed was edited in this audit pass.

## Next step

Use this corrected ledger plus checkpoint 005 to perform item-by-item outcome reconciliation and confirm the GER 101/103 repairs before closing package 080. Then continue at package 081. The 140 JAMB identities 141–280 all have prior row notes, but exact source-cell closure remains a separate residual-reconciliation task (checkpoint 010).
