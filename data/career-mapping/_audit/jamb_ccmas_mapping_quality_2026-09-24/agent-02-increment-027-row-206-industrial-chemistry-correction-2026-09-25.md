# Partition 02 — increment 027: row 206 Industrial Chemistry correction

Recorded 2026-09-25 (Africa/Lagos). Append-only correction after issue register increment 026. This is a row-specific component correction, not closure of the row or partition. No seed, SQL, role record, UI, or API was changed.

## Evidence and decision

- Canonical row 206 is **Industrial Chemistry and Chemical Entrepreneurship**. The parsed JAMB Sciences offering record preserves this identity and associates it with `CCU`; its requirement fields are blank/shared. The exact institution-bearing row in the official JAMB PDF has not been visually verified, so the offering association remains open.
- The prior mapping selected Administration and Management `ENP` Entrepreneurship, and all 24 selected courses came from generic entrepreneurship/management. That omitted the named Industrial Chemistry component.
- The NUC [Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf) has a standalone **B.Sc. Industrial Chemistry** programme and a course structure with chemistry, analytical/process science, industrial chemistry and entrepreneurship coursework (printed pp. 296–299). It specifically includes **ICH 314 Entrepreneurial Skills in Industrial Chemistry** and **ICH 422 Entrepreneurship for Industrial Chemistry**; ICH 314 outcomes include entrepreneurial skills and identifying entrepreneurship opportunities (printed p. 313). ICH 453 course outcomes concern chemical processes, raw-material availability, industrial reactions and products (printed p. 319).
- The exact CCMAS match, plus industrial-chemistry-specific entrepreneurship courses inside that programme, supports replacing the generic ENP-only component with **Sciences::Industrial Chemistry**. This does not combine two curricula and does not infer the full CCU-specific curriculum from the JAMB title.
- Local extraction issue found during correction: `ccmas/sciences.json` contains 42 Industrial Chemistry course records but omits the official CCMAS course-structure entry ICH 422. The corrected scope explicitly records ICH 422 from the official PDF with a locator and flags its outcomes/local extraction for reconciliation.

## Row-specific update applied

Updated only row 206 in these four authoritative/current artifacts:

1. `data/career-mapping/programme_mapping.json`: CCMAS code `ICH`, discipline `Sciences`, name `Industrial Chemistry`.
2. `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`: component `Sciences::Industrial Chemistry`; 42 extracted component courses plus the PDF-located ICH 422; scope remains `partial_scope_review_required`.
3. `data/career-mapping/_audit/jamb_domain_map_ccmas_derived_2026-08-17.json`: row 206 points to the same CCMAS component, has no active links, and is `review_required`.
4. `data/career-mapping/jamb_domain_map.json`: matches the canonical row-206 component/status and has no active links.

The pre-change row values for all four artifacts are retained in [`row_206_industrial_chemistry_before_2026-09-25.json`](../row_206_industrial_chemistry_before_2026-09-25.json). The implementation is guarded by [`apply_row_206_industrial_chemistry_scope_correction_2026_09_25.py`](../apply_row_206_industrial_chemistry_scope_correction_2026_09_25.py); it refuses to run if the row identity/order or expected ENP baseline changes.

## Validation performed

- All four edited JSON artifacts parse after the row-specific update.
- Row 206 one-based identity, mapping, component reference, 43 unique course codes, 42+1 course provenance, canonical/active map component parity, review-required status and zero-link fail-closed state were checked.
- Existing focused regression tests: `python -m pytest -q data/career-mapping/_audit/test_jamb_ccmas_materializer.py data/career-mapping/_audit/test_jamb_manual_scope_review_holds.py` — **5 passed**.

## Still open; do not promote

- Visually verify the official JAMB Sciences PDF awarder-table cell and CCU association for this exact name.
- Reconcile ICH 422’s source course record/outcomes into the local CCMAS extraction; verify other ICH course extraction mismatches before calling the selected scope complete.
- Reassess each prospective Industrial Chemistry domain link from scoped course outcomes and the domain’s relevant subgroup/role tasks. None is confirmed by this increment, so active links remain empty.
- Confirm the institution-specific portion of the curriculum against available authoritative evidence; do not substitute an unverified university curriculum.
- Continue the 141–280 audit. Increment 026’s **0/140 full-closure** count remains unchanged; this row is corrected but still open.
