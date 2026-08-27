# Nigerian entity population gate

SQL regeneration allowed: **YES**

| Check | Result |
|---|---|
| audit_and_ledger_keys_reconcile | PASS |
| every_row_has_complete_review_disposition | PASS |
| no_pending_or_unexpected_entity_states | PASS |
| every_entity_has_global_or_derived_global_evidence | PASS |
| every_entity_has_separate_nigerian_domain_context_or_explicit_gap | PASS |
| all_local_items_have_source_provenance | PASS |
| local_items_do_not_use_declared_non_nigerian_sources | PASS |
| all_domain_context_items_have_source_provenance | PASS |
| domain_context_items_do_not_use_declared_non_nigerian_sources | PASS |
| no_absence_claim_is_recorded | PASS |
| every_entity_has_bounded_search_record | PASS |
| no_final_negative_label_before_exhaustive_search | PASS |

- Audit entities: **5,696**
- Ledger entities: **5,696**
- Rows with follow-up trigger: **11**

Integrity passing means every row has a reviewed evidence disposition, separate Nigerian domain context, and provenance-safe separation. It does not mean every occupation has an exact Nigerian role match or Nigerian demand evidence.
