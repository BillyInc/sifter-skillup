# D078 Report Export and Identity Handoff

**Date:** 2026-10-21  
**Scope:** Backend report/API code and focused tests only  
**Status:** Implemented and locally verified; no live-service or rendered/browser verification performed.

## Outcome

D078 report exports require a named institution attached to the student profile/report context, and reports include both the student's authenticated username and the attached institution. The institution is report context; it is not part of the Sociology learning route and is never inferred from the programme name.

If the D078 route has no attached institution, HTML and DOCX export return HTTP 409 with a clear message asking the student to attach a named institution to their profile. The route resolver is independently verified to leave both university and attached-institution fields empty when only Sociology is selected.

## Identity and saved-route behavior

- Export identity is read from the authenticated user's persisted row, not from request fields or `studentName` in saved path data.
- The rendered identity is labeled **Username**, so it is not presented as a verified real name.
- The optional `snapshot_id` selects a snapshot from the authenticated user's owner-scoped saved path. A different student's snapshot ID returns 404.
- D078 output follows the saved selection: selected method(s), selected area/role stop point, and allowed selected downstream items. Unselected method content is omitted.
- User-provided report text is escaped for HTML/XML output. DOCX filenames are sanitized for response headers.

## Files changed

- `backend/routes/student_pipeline_routes.py`
  - D078-specific named attached-institution export gate and clear 409 response.
  - Authenticated persisted username used and labeled in the report context.
  - Sanitized DOCX filename generation.
- `backend/services/report_gen.py`
  - Optional identity label rendered in HTML and DOCX.
  - Shared HTML/XML text sanitization, including removal of XML-forbidden control characters.
- `backend/tests/test_provisioning_guidance_resume.py`
  - Covers D078 with no attached institution, explicit institution profiles, and username labeling.
- `backend/tests/test_student_report_export_trust.py`
  - New endpoint-level tests for owner-scoped snapshot selection, authenticated username, attached institution, selected route fidelity, HTML/XML escaping, safe DOCX filename headers, and XML control characters.

## Validation

Command:

```powershell
python.exe -m pytest -p no:cacheprovider backend/tests/test_student_report_export_trust.py backend/tests/test_provisioning_guidance_resume.py -q
```

Result: **26 passed**.

`git diff --check` passed for the changed backend code and test files.

## Contract context and limitation

The existing report behavior documentation describes student identity and school/centre context when available, and confirmed programme/university reporting. It does not state a universal institution gate for every report type. The D078-specific requirement to attach an institution was clarified directly by the product owner; the code applies that requirement specifically to D078 exports. A Sociology programme selection alone does not supply an institution.

No live API/database export, HTML browser rendering, DOCX visual rendering, or PDF print was exercised. Tests use local fixtures and validate generated HTML/XML content and response behavior.

## Handoff boundary

This handoff covers backend report/API behavior and tests. No UI, browser harness, graph, SQL, or migration changes were made for this report-export task.
