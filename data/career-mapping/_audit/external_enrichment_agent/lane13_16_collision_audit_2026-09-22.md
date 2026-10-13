# Remediation lane 13–16 collision audit

Date: 2026-09-22

Lanes 13–16 were stopped after concurrent workers reused/appended lane-specific
artifact names. Their selections still describe 100-row batches, but their
claims/ledgers do not provide a clean one-selection-to-one-ledger reconciliation.

Disposition:

- Preserve the existing files for forensic review.
- Count **zero** lane 13–16 remediation records as valid completion evidence.
- Do not promote, merge, or overwrite any of the collided artifacts.
- The quality audit excludes lane 13–16 files until a manual reconciliation is
  completed.
- SQL, catalogue, relationship, seed, UI, and browser-proof surfaces were not
  changed by this recovery.

The valid remediation total therefore remains the separately reconciled
**1,000** records from lanes 2–4 and 6–12. Lane 5 remains an explicitly saved
but unfinished 100-row selection.
