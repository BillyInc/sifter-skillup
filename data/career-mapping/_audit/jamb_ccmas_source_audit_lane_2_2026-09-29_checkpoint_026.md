# Lane 2 reconciliation correction checkpoint 026 — JAMB locator coordinates

Checkpoint 024 overcorrected the Biochemistry finding by assuming LF-only line numbering was the sole convention. The current reconciliation and regression test use `str.splitlines()` numbering, which counts the form-feed page breaks in `Sciences.txt`. The same cell therefore appears at splitlines lines 419–423 and LF-only lines 411–416. The current local locator is 419–423 and now matches the exact heading plus DOU, HENSARD, and ZAMFARA; retain its current source URL/date/status. Do not repeat the stale-locator repair.

The Pure and Applied Mathematics issue in checkpoint 021 remains a false flag: its current locator 8004–8022 is correct against LF-only lines and contains the exact title and BENIN, LAUTECH, PHC, and PAUL. The earlier splitlines-based read shifted past it and incorrectly called it Microbiology.

Checkpoint 022 remains a separate local evidence-state mismatch: the official JAMB indexed table confirms Computer Science and Information Technology and its four awarders on printed pp. 623–624, but the local row still has `evidence_hold` and no promoted URL/locator. This is for local reconciliation; no shared ledger was changed in this checkpoint.

**Next cursor:** CCMAS package index 080, course ordinals 11–15, per checkpoint 025; after that, JAMB row 144. Regression coverage: checkpoint 026 assertions added to tests 021/023/024.
