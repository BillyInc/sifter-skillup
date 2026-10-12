# Lane 2 source-audit checkpoint 037 — JAMB identity 144: Information and Communication Science

## Exact JAMB source cell

The official-source extraction has **INFORMATION AND COMMUNICATION SCIENCE** at `Sciences.txt:9111-9113`, followed by the awarders **FED-GASHUA** (9115), **HALLMARK** (9117) and **ILORIN** (9119). **INFORMATION SYSTEMS** begins at line 9121 and is a distinct programme. The current occurrence already has the exact three institutions, official brochure URL and locator. The direct IBASS URL returned the JavaScript gate when checked today, so I am not claiming a fresh rendered-PDF or printed-page verification; the source-cell comparison is against the checked-in official brochure extraction.

Primary source: [JAMB IBASS Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf).

## Existing CCMAS audit evidence carried forward

The previous whole-range audit already recorded that the mapped partial scope is Computing::Information and Communication Technology, with 10 selected courses and 10 outcome arrays; seven rows have no local `content_summary`: GST 111, COS 101, ICT 201, ICT 301, ICT 305, ICT 309 and CSC 308. It also explicitly leaves open whether the scope proves both information and communication facets. I have not repeated that course audit here.

The selected courses and four functional domain links (Artificial Intelligence, Cloud Computing, Telecommunications and Robotics Engineering) still require course-level revalidation after those missing source contents are checked. The stored scope has empty source-context/facet evidence fields, so its `partial_scope_reviewed` label alone does not close the question.

No shared JAMB, CCMAS or mapping ledger was changed. JAMB source-cell audit is closed; CCMAS scope and downstream audit are not.

**Next:** Checkpoint the seven source-content gaps in bounded groups against the NUC Computing CCMAS; then return to the next uncovered JAMB identity.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_037.py`.
