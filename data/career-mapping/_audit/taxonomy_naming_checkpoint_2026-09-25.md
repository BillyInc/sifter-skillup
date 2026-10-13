# Taxonomy naming checkpoint — 2026-09-25

Append-only, conservative naming pass. Stable IDs and all ownership, relationships, descriptions and technical meaning are preserved. This does not alter JAMB mappings, endpoints, SQL or the database.

Inventory: 168 domains; 558 subgroup labels; 4703 canonical role labels.

## Safe domain display-name changes

| ID | Before | After |
|---|---|---|
| D011 | Quantitative Finance | Quantitative Finance and Financial Engineering |
| D007 | UI/UX Design | User Interface and User Experience Design |
| D016 | Electrical | Electrical Engineering |
| D017 | Mechanical | Mechanical Engineering |
| D018 | Civil | Civil Engineering |
| D030 | Marketing, Brand | Marketing and Brand Management |
| D054 | Oil | Oil and Gas Operations |
| D060 | Banking, Credit | Banking and Credit Services |
| D064 | Psychology, Counselling | Psychology and Counselling |
| D074 | Occupational Health, Safety | Occupational Health and Safety |
| D079 | Customs, Trade | Customs and International Trade |
| D140 | Robotics Engineering, Systems Design | Robotics Engineering and Systems Design |
| D146 | Building Services Engineering — Mechanical, Electrical | Building Services Engineering (Mechanical and Electrical Systems) |
| D147 | Process Automation, SCADA, PLC | Industrial Process Automation (SCADA and PLC Systems) |
| D156 | Land Surveying, Cadastral Mapping | Land Surveying and Cadastral Mapping |
| D158 | Corporate Finance, Investment Banking | Corporate Finance and Investment Banking |
| D159 | Credit Analysis, Structured Finance | Credit Analysis and Structured Finance |
| D162 | Immigration Law, Asylum | Immigration Law and Asylum |
| D163 | Intellectual Property Law, Patents | Intellectual Property Law and Patent Practice |
| D164 | Urban Mobility, Smart City Systems | Urban Mobility and Smart City Systems |
| D115 | Road Transport Operations (Drivers | Road Transport and Driving Operations |
| D027 | Biomedical | Biomedical Science |
| D040 | Vocational | Vocational and Technical Training |
| D073 | Library, Archive | Libraries, Archives and Information Management |
| D086 | Gaming, Betting & Lottery | Gaming, Betting and Lottery Operations |
| D089 | Funeral | Funeral and Mortuary Services |
| D096 | Agricultural | Agricultural Machinery and Farm Operations |
| D108 | Printing Technology, Pre-press | Printing Technology, Pre-press and Print Finishing |
| D110 | Chemical, Rubber | Chemical, Rubber and Plastics Plant Operations |
| D113 | Glass, Ceramics, Building Materials | Glass, Ceramics, Building Materials and Boiler Plant Operations |
| D136 | Aeronautical | Aeronautical and Aerospace Engineering |
| D151 | Criminology, Criminal Justice | Criminology, Criminal Justice and Corrections |

These are grounded in each domain's existing `domain_meta.json` description. The particularly unclear labels called out by the user are now **Marketing and Brand Management** and **Banking and Credit Services**. `D146` encoding and `D115` unmatched-parenthesis defects are also corrected.

Three subgroup labels were corrected against official ISCO-08 titles/scope: D151/code 25 placeholder, and D100/D101 code 71 missing the qualifier excluding electricians. Codes, role membership and edges were not changed; D151's generic description remains an unresolved content issue.

## Source-backed student role display labels

Nineteen legacy gendered/slash titles now have plain student-facing display names grounded in the existing role descriptions. Canonical `role_name` stays unchanged as the role-key input, preserving role UUIDs and edges.

| Domain | Canonical source title | Student display name |
|---|---|---|
| D069 | steward/stewardess | Travel Service Attendant |
| D042 | actor/actress | Actor |
| D042 | prop master/prop mistress | Props Master |
| D047 | groundsman/groundswoman | Groundskeeper |
| D053 | head waiter/head waitress | Food and Beverage Service Supervisor |
| D053 | steward/stewardess | Travel Service Attendant |
| D053 | ship steward/ship stewardess | Ship Passenger Service Attendant |
| D053 | restaurant host/restaurant hostess | Restaurant Host |
| D053 | waiter/waitress | Restaurant Server |
| D081 | postman/postwoman | Postal Delivery Worker |
| D083 | steward/stewardess | Travel Service Attendant |
| D083 | ship steward/ship stewardess | Ship Passenger Service Attendant |
| D083 | ground steward/ground stewardess | Rail Passenger Service Attendant |
| D083 | host/hostess | Visitor and Event Host |
| D088 | masseur/masseuse | Massage Practitioner |
| D092 | head waiter/head waitress | Food and Beverage Service Supervisor |
| D092 | restaurant host/restaurant hostess | Restaurant Host |
| D092 | waiter/waitress | Restaurant Server |
| D118 | groundsman/groundswoman | Groundskeeper |

## Unresolved inventory

The companion JSON is the exhaustive label-level inventory, with IDs/source pointers and triage flags for every domain, subgroup and role. Counts below are candidate labels, not confirmed defects:

- Domains: 70 flagged; unflagged names were not otherwise rewritten.
- Subgroups: 558 flagged. Imported ISCO class titles are retained as unresolved where they may be standing in for a subgroup; changing a label without first validating its role membership could conceal a structural mismatch.
Example to clarify the risk: Robotics Engineering (`D140`) currently has subgroup labels such as `Teaching professionals` and `Assemblers`. A prettier label alone would not tell us whether the actual roles under those headings belong there; we must inspect those memberships before renaming or restructuring them.
- Roles: 4414 flagged by conservative triage. Nineteen supported student display labels are listed in the source-backed role section; other punctuation/source-title flags are not treated as defects without evidence.

## Source layer and regeneration

`domain_meta.json`, `domain_structure.json` and `role_library_v3_cleaned.json` are the source inputs. This checkpoint is an interim naming snapshot; see the append-only execution update for the verified local seed/transport status. No SQL was applied.

The unresolved label inventory is intentionally retained in `taxonomy_naming_checkpoint_2026-09-25.json`; punctuation heuristics are triage only and do not establish a defect. Seed regeneration status is superseded by the append-only execution checkpoint.
