# External item quality remediation — lane 37

- Batch: `quality_remediation_lane_37_20260922`
- Selection: `quality_remediation_lane_37_20260922_selection.json`
- Pre-search checkpoint: `quality_remediation_lane_37_20260922_pre_search_checkpoint.json`
- Append-only ledger: `quality_remediation_lane_37_20260922_append_only_ledger.jsonl`
- Records reviewed: **100**
- Selection↔ledger reconciliation: **100/100 exact**
- Evidence records: **300**
- Decisions: **0 promoted**, **100 review_required**, **0 genuinely unavailable**

Each record was searched using item-name + context queries and checked against item-specific O*NET and ESCO search routes. The supplied broad/shared candidate URLs were retained only as audit inputs. No exact item/type/context ownership gate was established, so every record remains `review_required`.

Guardrails: relationships, catalogue data, SQL, seeds, UI, browser proof, other lanes, and prior ledgers were not changed.

