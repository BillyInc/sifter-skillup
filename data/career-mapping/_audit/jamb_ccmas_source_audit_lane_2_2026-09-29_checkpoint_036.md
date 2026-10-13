# Lane 2 cursor correction 036 — canonical JAMB row index

Checkpoint 035 audited **BIOTECHNOLOGY AND MOLECULAR BIOLOGY** correctly as a source occurrence, but assigned it the wrong canonical row number. I inferred it followed row 143 from nearby Sciences source text. Checking the canonical `programme_mapping.json` array shows that the ordering is different:

- canonical row **144** is **INFORMATION AND COMMUNICATION SCIENCE** (Sciences; maps to Computing::Information and Communication Technology);
- **BIOTECHNOLOGY AND MOLECULAR BIOLOGY** is canonical row **173**.

Therefore checkpoint 035's findings remain useful under row 173, but do not count as coverage of row 144. This correction is append-only; it does not alter either JAMB occurrence or any shared ledger. The lane now proceeds with the actual uncovered row 144.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_036.py`.
