# Lane 2 checkpoint 040 — JAMB row 144 facet, domain and provenance reconciliation

Date: 2026-09-29  
JAMB identity: row 144, **INFORMATION AND COMMUNICATION SCIENCE** (the exact JAMB title/awarders are closed in checkpoint 037)  
CCMAS component: Computing — Information and Communication Technology  
This checkpoint uses the course-by-course NUC comparisons in checkpoints 038-039 and checks the selected-course scope, its four current domain links and the source/provenance metadata. It does not edit shared ledgers.

## Facets

Both named facets have suitable evidence inside the single CCMAS ICT component:

- **Information:** COS 101 and ICT 201 cover computing devices, software, information processing, data/memory, networks, applications and Internet use; the NUC states the programme is Information and Communication Technology (printed pp. 119–120 and 123–124; ICT 201 at pp. 131–132).
- **Communication:** ICT 301 (satellite), ICT 305 (data/network communication), ICT 309 (mobile/cellular) and IFT 442 (wireless communication) provide technical communication evidence.

That supports this JAMB title without importing all Computer Science or Communication and Media Studies courses. The existing reviewed partial-scope row nevertheless has empty `scope_evidence`, `source_contexts`, and `unrepresented_facets`; its review state is not backed by a persisted explanation of the selected 10-course slice.

## Domain links

- **D008 Telecommunications — supported as functional.** ICT 309 and IFT 442 explicitly cover mobile/cellular and wireless communication, networks, protocols/standards and deployment. Keep the functional relationship distinct from claiming the programme is a full Telecommunications Engineering degree.
- **D003 Artificial Intelligence — not established by its current anchor.** The declared anchor is CSC 432 Distributed Computing Systems; its official outcomes are about distributed systems, concurrency, transactions, replication, consistency, fault tolerance and distributed filesystems, not AI. The ICT CCMAS mentions AI among emerging-technology examples in an entrepreneurship passage, not as an AI learning outcome.
- **D005 Cloud Computing — not established by its current anchor.** The declared anchor is IFT 203 Web Technologies; its outcomes teach web development and HTTP/WWW, not cloud architecture or services. The ICT entrepreneurship passage merely names cloud computing as one example of emerging technology.
- **D140 Robotics Engineering and Systems Design — not established by its current anchors.** ICT 201 and CSC 432 do not teach robotics. NUC robotics hits located in separate Computer Science/Cybersecurity sections cannot be borrowed into the ICT-only JAMB component without an explicit multi-component mapping.

## Additional defects and conflicts for reconciliation

1. Current scope/domain artifacts enumerate **4** active links, while `component_domain_evidence` reports **7 reviewed links**. Three counted links are not enumerated there; reconcile the derived count.
2. Selected-course provenance in the JAMB scope ledger is blank: source URL, course locator and access date are null, despite available NUC evidence. Persist these per course.
3. The NUC ICT tables and detailed course blocks disagree internally on contact hours/units for GST 111, ICT 201, CSC 432 and IFT 442. Keep the conflicting source values visible until resolved; do not quietly choose one.
4. Local ICT-package CSC 432 contains **27** outcomes, while the ICT-specific NUC block contains **5** distributed-systems outcomes. The local list is contaminated with project-management, mathematics, calculus, statistics and entrepreneurship material. Reconcile against the exact source block and do not discard displaced outcomes from their own verified rows.
5. Local CSC 432 provenance says printed pp. 143–144; the official course block/footer spans pp. 144–145. Recheck and correct the locator.

## Sources and next cursor

The primary source is the official [NUC Computing CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), with exact course-specific printed-page/PDF-line locators recorded in the JSON checkpoint and the preceding 038-039 checkpoints. The JAMB brochure occurrence is linked and located in checkpoint 037.

Row 144’s two facets and four current links are adjudicated. Before selecting another identity, inspect existing checkpoints for canonical JAMB row 145 and its exact name so no covered audit work is repeated.
