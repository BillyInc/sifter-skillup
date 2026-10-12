# Lane 2 source-audit checkpoint 022 - JAMB identity 142: Computer Science and Information Technology

## Source decision

The official JAMB IBASS Sciences brochure's indexed body table resolves this exact offering cell across a page break. On printed p. 623, the heading **COMPUTER SCIENCE AND INFORMATION TECHNOLOGY** is followed by **ACHIEVERS** and **BABCOCK**. The cell continues on p. 624 with **IGBINEDION** and **OAUSTECH**; the next programme heading is **COMPUTER SCIENCE AND INFORMATION SCIENCE**, followed by BINGHAM and LCITY. This page-boundary evidence distinguishes the two identities and prevents attaching the neighboring awards to the wrong programme.

Primary source: [JAMB IBASS Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), accessed 2026-09-29, printed pp. 623-624. The official IBASS browser viewer is JavaScript-gated, so this decision relies on the indexed text for the official PDF, searched using the exact programme heading and institution names. The table sequence and continuation were independently returned by focused official-domain queries.

## Comparison to the current occurrence

The current `sciences_offerings.json` row lists exactly ACHIEVERS, BABCOCK, IGBINEDION, and OAUSTECH, so its institution values match the confirmed JAMB cell. However, it remains `evidence_hold`, has no source URL/locator, and says the exact cell was not found. That is a stale false-negative evidence state. The original hold was understandable from the local text search, whose nearby lines do not contain the exact heading, but the official indexed PDF provides the missing continuation evidence.

This increment does not edit the shared offering ledger. The repair handoff is to attach the official source URL, printed pp. 623-624 locator, and access date to this Sciences occurrence, then replace the hold state. Do not merge the neighboring **Computer Science and Information Science** entry or its BINGHAM/LCITY awarders.

## Result

- Exact JAMB cell confirmed; all four local institution tokens match.
- Source occurrence closed for JAMB cell identity and awarders; curriculum/component and downstream checks remain outside this source-cell disposition.
- No shared JAMB, CCMAS, mapping, or seed file changed.

`test_jamb_ccmas_source_audit_lane_2_checkpoint_022.py` protects the exact identity boundary and confirms this remains an audit-only change.
