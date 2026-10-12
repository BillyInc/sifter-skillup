# Accounting and Finance JAMB source-locator repair — 2026-09-28

The official JAMB source-context audit in
`jamb_accounting_finance_offering_context_audit_2026-09-28_001.md` confirms two
distinct occurrences with the same display title:

- Administration brochure: **Accounting and Finance — BCU**, printed p. 48.
- Social Sciences brochure: **Accounting and Finance — FEDOTUOKE**, printed
  p. 576.

The Social/Management Sciences source row previously cited printed p. 577. The
official IBASS body text and checked-in extraction place the exact
`ACCOUNTING AND FINANCE — FEDOTUOKE` title/awarder cell on p. 576; p. 577 is a
continuation page, not the exact cell locator. Updated only the locator and
verification date in `data/career-mapping/jamb/social_management_offerings.json`.
The programme title, faculty, institution token, requirements, and distinct
offering context remain unchanged. No CCMAS scope or downstream mapping was
modified.

Focused regression test:

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_accounting_finance_offering_context_audit.py -q
```

The test asserts both offering records stay distinct and that the corrected
Social Sciences locator is p. 576.
