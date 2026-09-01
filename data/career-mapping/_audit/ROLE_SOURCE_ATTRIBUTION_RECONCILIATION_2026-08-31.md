# Role source-attribution reconciliation — 2026-08-31

This audit explains historical per-domain role counts and source headings. It does not change the taxonomy or seed.

## Counts

- Historical role rows: **7736**.
- Current deduplicated role rows: **5209**.
- Historical ESCO label matches: **{'exact_label': 6644, 'none': 1072, 'alternative_label': 20}**.
- Historical assignments: **{'retained_same_domain': 4733, 'reallocated_or_relabelled': 1874, 'source_backed_missing_current_record': 1060, 'historical_row_without_local_taxonomy_match': 69}**.
- Current source classes: **{'esco_exact_code': 4739, 'wef': 27, 'onet': 325, 'specialist_framework': 36, 'other:esco/o*net': 50, 'other:tesda psf game development': 2, 'other:microsoft, ubisoft and nigerian game-developer vacancy evidence': 1, 'other:microsoft, skillsfuture and nigerian game-development vacancy evidence': 1, 'other:arm roboticscareer': 3, 'other:skills england robotics engineer': 1, 'other:skills england advanced robotics engineer': 1, 'other:british esports and pearson btec': 9, 'other:mqa performing arts standard': 6, 'other:skills england live event technician': 1, 'unlabelled': 7}**.

## D001 example

The historical D001 file contains **50** role rows; the current D001 role layer contains **37** rows.
The difference is recorded row by row below rather than being treated as missing ESCO data.

| Historical role | Assignment | Current domain/source |
|---|---|---|
| software analyst | retained_same_domain | D001 software analyst (esco_exact_code) |
| search engine optimisation expert | reallocated_or_relabelled | D007 search engine optimisation expert (esco_exact_code) |
| ICT test analyst | retained_same_domain | D001 ICT test analyst (esco_exact_code) |
| ICT disaster recovery analyst | retained_same_domain | D001 ICT disaster recovery analyst (esco_exact_code) |
| software tester | retained_same_domain | D001 software tester (esco_exact_code) |
| mobile application developer | retained_same_domain | D001 mobile application developer (esco_exact_code) |
| cloud architect | retained_same_domain | D001 cloud architect (esco_exact_code) |
| cloud engineer | retained_same_domain | D001 cloud engineer (esco_exact_code) |
| ICT change and configuration manager | retained_same_domain | D001 ICT change and configuration manager (esco_exact_code) |
| ICT application configurator | retained_same_domain | D001 ICT application configurator (esco_exact_code) |
| ICT accessibility tester | retained_same_domain | D001 ICT accessibility tester (esco_exact_code) |
| ICT system tester | retained_same_domain | D001 ICT system tester (esco_exact_code) |
| embedded systems software developer | retained_same_domain | D001 embedded systems software developer (esco_exact_code) |
| ICT usability tester | retained_same_domain | D001 ICT usability tester (esco_exact_code) |
| IoT developer | retained_same_domain | D001 IoT developer (esco_exact_code) |
| numerical tool and process control programmer | reallocated_or_relabelled | D147 numerical tool and process control programmer (esco_exact_code) |
| data quality specialist | reallocated_or_relabelled | D002 data quality specialist (esco_exact_code); D009 data quality specialist (esco_exact_code); D010 data quality specialist (esco_exact_code) |
| ICT integration tester | retained_same_domain | D001 ICT integration tester (esco_exact_code) |
| ICT auditor manager | source_backed_missing_current_record | not found in current library |
| cloud software developer | retained_same_domain | D001 cloud software developer (esco_exact_code) |
| user interface developer | retained_same_domain | D001 user interface developer (esco_exact_code) |
| user interface designer | retained_same_domain | D001 user interface designer (esco_exact_code) |
| digital games developer | retained_same_domain | D001 digital games developer (esco_exact_code) |
| ICT quality assurance manager | retained_same_domain | D001 ICT quality assurance manager (esco_exact_code) |
| web content manager | retained_same_domain | D001 web content manager (esco_exact_code) |
| industrial mobile devices software developer | retained_same_domain | D001 industrial mobile devices software developer (esco_exact_code) |
| ICT application developer | retained_same_domain | D001 ICT application developer (esco_exact_code) |
| web developer | retained_same_domain | D001 web developer (esco_exact_code) |
| cloud identity manager | retained_same_domain | D001 cloud identity manager (esco_exact_code) |
| cloud DevOps engineer | retained_same_domain | D001 cloud DevOps engineer (esco_exact_code) |
| software architect | retained_same_domain | D001 software architect (esco_exact_code) |
| software developer | retained_same_domain | D001 software developer (esco_exact_code) |
| Software and Applications Developers | retained_same_domain | D001 Software and Applications Developers (wef) |
| Full Stack Engineers | retained_same_domain | D001 Full Stack Engineers (wef) |
| Software Quality Assurance Analysts and Testers | retained_same_domain | D001 Software Quality Assurance Analysts and Testers (onet) |
| Computer Network Support Specialists | reallocated_or_relabelled | D005 Computer Network Support Specialists (onet) |
| Database Architects | reallocated_or_relabelled | D002 Database Architects (wef) |
| Data Warehousing Specialists | reallocated_or_relabelled | D002 Data Warehousing Specialists (wef) |
| Computer Programmers | retained_same_domain | D001 Computer Programmers (onet) |
| Web and Digital Interface Designers | retained_same_domain | D001 Web and Digital Interface Designers (onet) |
| Video Game Designers | retained_same_domain | D001 Video Game Designers (onet) |
| Web Administrators | source_backed_missing_current_record | not found in current library |
| Geographic Information Systems Technologists and Technicians | source_backed_missing_current_record | not found in current library |
| Document Management Specialists | source_backed_missing_current_record | not found in current library |
| Penetration Testers | reallocated_or_relabelled | D004 Penetration Testers (onet) |
| Information Security Engineers | reallocated_or_relabelled | D004 Information Security Engineers (onet) |
| Digital Forensics Analysts | reallocated_or_relabelled | D004 Digital Forensics Analysts (onet); D151 Digital Forensics Analysts (onet) |
| Blockchain Engineers | retained_same_domain | D001 Blockchain Engineers (onet) |
| Computer Systems Engineers/Architects | retained_same_domain | D001 Computer Systems Engineers/Architects (onet) |
| Information Technology Project Managers | retained_same_domain | D001 Information Technology Project Managers (onet) |

## Required downstream rule

Do not regenerate the role seed from the historical ESCO heading. Use the current role record's exact ESCO code, O*NET/framework source, ISCO group, and reassignment history. Any role that cannot be matched must remain an explicit review row.

Regenerate with:

```text
python data/career-mapping/_audit_role_attribution_reconciliation.py
```
