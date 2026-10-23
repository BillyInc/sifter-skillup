# D078 backend/API payload verification checkpoint — 2026-10-21

**Status:** Backend/API and report-export implementation handed off; focused verification passed locally. Live API/database verification remains unproven.

## Agent A follow-up checkpoint — report/API identity scope

**Starting status (2026-10-21):** Rechecking the report institution/name gate against the controlling D078/report requirements and adding focused HTML/DOCX tests where needed. The undergraduate Sociology learning route remains independent of university selection; this pass concerns report-export identity requirements only. No live API/database verification is claimed. Scope excludes journey UI, tray, My World, browser harness, graph, seeds, SQL and migrations.

## Completed lane

This goal owns the backend/API response contract and backend tests for the D078 domain, seven canonical area, and nineteen role endpoints, plus the student report export gate and identity/institution context requested during this goal. It verifies response context/ownership, student-readable item explanations, requirement lanes, supported typed relationships with rationale, available resources, and role-to-area scoping.

The D078 programme-to-role route does not require a university to display or resume. Report printing does require a named attached institution of type university, secondary school/school, or tutorial centre, and a real student name/username. Resolve identity from the authenticated user and institution from saved route/profile or existing attachment records; do not infer either from the programme.

Do not modify frontend code, the graph/projection, tray/Undo/My World behavior, SQL, migrations, taxonomy, or database records.

## Evidence collected before edits

- Required task instructions read from `C:\Users\USER\.codex\attachments\f76a8982-785f-4ff4-a194-8f9b1b026110\pasted-text-1.txt`.
- Domain handler: `backend/routes/career_routes.py::get_domain` (around line 2541).
- Area handler: `backend/routes/career_routes.py::get_subgroup` (around line 3242).
- Role handler: `backend/routes/career_routes.py::get_role` (around line 3286).
- Existing graph-derived D078 area/role helper and tests: `backend/d078_guided_areas.py`, `backend/tests/test_d078_guided_areas.py`.
- Existing student guidance ownership/relationship contract tests: `backend/tests/test_student_guidance_contract.py`.
- These backend files already had worktree modifications from prior work; preserve unrelated edits.

## Changes made

- In `backend/routes/career_routes.py`, D078 role responses now omit legacy essential/optional occupation skill arrays, merge reviewed D078 domain and selected-area learning items into parent context, and correctly unwrap the `get_domain` response envelope when carrying the Sociology programme connection into role context.
- `backend/tests/test_d078_api_identity.py` covers controlled-fixture domain/area ownership and explanations, Sociology programme context, inherited role items and resource filtering, programme context propagation, and all 19 graph roles under supported areas. The role loop resolves graph route keys to exact API keys before calling the endpoint.
- `backend/services/guidance_report.py` now resolves a named attached institution from saved institution context, university path context, starting-point institution fields, tutorial/secondary school profile fields, or existing provisioning/affiliation records. It preserves the institution type and a student-readable type label.
- `backend/routes/student_pipeline_routes.py` requires programme, named supported institution, and a real student name/username before HTML or DOCX report export. Accepted institution types are university, secondary school/school, and tutorial centre.
- `backend/services/report_gen.py` includes the attached institution name/type in HTML and DOCX and no longer says university selection is not needed for a D078 report without a university.
- `backend/tests/test_provisioning_guidance_resume.py` covers rejection without an attached institution, rejection without student name/username, acceptance and institution display for university/secondary school/tutorial centre, and student identity in both exports.
- No SQL, migrations, graph, or database records were changed.

## Endpoints and fields checked

- `GET /api/career/domains/D078?programme_id=...`: Sociology programme connection (`programmeId`, `programmeName`, direct relationship, reviewed course anchors/explanation), seven canonical areas, 19 graph role cards, area-to-role links, domain/area item ownership and student-readable rationale/meaning/use, relationship explanations, and reviewed resources.
- `GET /api/career/subgroups/{area_id}` for each canonical D078 area: area identity and role options, scoped context items, ownership/context keys, item rationale/plain meaning/contextual use, and supported typed relationships.
- `GET /api/career/roles/{role_id}?area_id=...&programme_id=...`: exact role identity and selected area, `areaRoutes`, inherited domain/area context, role-owned context items, reviewed role resources, programme connection, and empty legacy essential/optional skill arrays. Route logic returns `coming_soon` if the selected area is not connected.
- `GET /api/student/report.html` and `GET /api/student/report.docx` (handlers `get_my_guidance_report_html` and `get_my_guidance_report_docx`): selected D078 snapshot content, programme, authenticated username as student name, and `attachedInstitution` name/type. Exports now require a named programme, a student name/username, and an attached institution of type university, secondary school/school, or tutorial centre. A D078 report may use any of those types; the Sociology path does not itself require a university.

## Verification

- `python.exe -m pytest -p no:cacheprovider tests/test_d078_api_identity.py tests/test_d078_guided_content.py tests/test_student_guidance_contract.py tests/test_provisioning_guidance_resume.py -q` — **97 passed**.
- The report test asserts no-institution and no-username exports return 409; university, secondary school, and tutorial centre associations produce both HTML and DOCX containing the student name and institution type/name.
- `git diff --check -- backend/routes/career_routes.py backend/routes/student_pipeline_routes.py backend/services/guidance_report.py backend/services/report_gen.py backend/tests/test_d078_api_identity.py backend/tests/test_provisioning_guidance_resume.py` — passed; Git emitted only an existing LF/CRLF conversion warning for `career_routes.py`.
- `Test-NetConnection 127.0.0.1 -Port 8000` — `TcpTestSucceeded: False`; no local backend listener was available. Live API/database behavior remains unverified; the passing results are local controlled-fixture tests only.
- Report identity uses the authenticated student's stored `username` as the displayed student name and blocks export if it is absent. Report institution uses the saved/attached institution name and supported institution type; the D078 route itself still has no university requirement outside report printing.
