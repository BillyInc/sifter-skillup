# Agent 01 queue-state reconciliation — 2026-09-25

This append-only checkpoint records a source-state change observed while continuing the row 1–140 missing-locator lane. It does **not** modify mappings, curriculum scopes, seeds, or SQL.

## Completed evidence batch

`agent-01-links-increment-015.md` records occurrence positions 199–223 (25 links) from the previous checkpoint's ordered 435-link queue. The source package and offering-context evidence were checked against NUC CCMAS and JAMB IBASS sources. Its course findings remain usable; its “212/435 remain” statement is valid only against that previous queue snapshot.

## Worktree drift found immediately afterward

The checked-in working copy of `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` no longer matches the queue baseline in increments 001–014. A fresh read now finds, for rows 1–140:

- 617 scope `domain_links` total, versus the prior documented 1,383;
- 79 non-combined domain links without `scope_course_titles`, versus the prior documented 435;
- 19 combined rows are now labeled `combined_scope_review_required` (rather than `combined_scope_evidenced`), so filtering by status text alone would misclassify the combined queue. The structural discriminator is `inheritance_type=combined_ccmas_curriculum`.
- The current `jamb_domain_map.json` still has 1,382 links for these 140 identities. 781 canonical `(identity, domain_id)` pairs have no counterpart in the current saved-scope `domain_links`; this is not equivalent to 781 missing course locators.
- Example: current Transport Management scope row has zero `domain_links`, while its current canonical JAMB map still contains 12 links. Its saved-scope queue occurrences therefore cannot be reproduced from the current scope file.

The scope artifact is already dirty in this worktree and its last-write timestamp was 2026-09-25 09:33 local. I did not modify it. Because the user's instruction is specifically to continue the **current 237/435 queue** and to leave canonical data unchanged, no further positions were consumed after this discrepancy: advancing by the old position counter against the changed file would silently skip or duplicate items. Reconcile which existing worktree state is the intended audit baseline, then regenerate the deterministic queue from that agreed snapshot and resume at its exact next identity/link.

## Verification commands and exact current counts

Read-only checks against the worktree on 2026-09-25:

```text
rows: 420
rows 1–140: scope links=617; non-combined rows with no link locator=79
rows 1–140: canonical jamb_domain_map links=1,382; links lacking a saved-scope identity/domain pair=781
```

This is a queue-integrity warning, not a conclusion that the 781 relationships are false or that curriculum evidence is absent. No SQL or seed was run. No canonical mapping/scope change was made by this lane.
