# Global Thin-Domain Evidence Audit

This is a review artifact. It does not regenerate SQL or seed data.

- Thin-queue rows: 40
- Actual unpopulated gaps: 39
- Reconciliation rows: 1
- Existing repository role spines: 40
- Rows with additional thin overlays: 39
- Rows with taxonomy plus specialist framework evidence: 40
- Rows with taxonomy-only global evidence: 0
- Global source range per gap: 5 to 10

The count reconciliation matters: there are 42 rows in the current thin-gap file, but only 41 actual unpopulated gaps. D003 is not absent; it already has five source-backed role records, so it is reported as a reconciliation row rather than a missing gap.

| Domain | Global sources | Role rows | Specialist signal | Thin overlay | Evidence level | Status |
|---|---:|---:|---:|---:|---|---|
| D003 Artificial Intelligence | 5 | 5 | 0 | 0 | taxonomy_plus_specialist_framework | multi_source_role_spine_no_thin_overlay |
| D004 Cybersecurity | 6 | 17 | 5 | 5 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D005 Cloud Computing | 5 | 18 | 9 | 9 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D006 Internet of Things | 5 | 17 | 6 | 6 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D012 FinTech Engineering | 6 | 14 | 6 | 6 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D146 Building Services Engineering — Mechanical, Electrical | 5 | 13 | 10 | 10 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D147 Process Automation, SCADA, PLC | 6 | 15 | 9 | 9 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D156 Land Surveying, Cadastral Mapping | 5 | 11 | 5 | 5 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D067 Dentistry | 5 | 12 | 7 | 7 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D154 Exercise Science, Sports Therapy | 5 | 17 | 6 | 6 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D165 Wellness Coaching, Lifestyle Medicine | 5 | 15 | 3 | 3 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D130 Recruitment, Employment | 6 | 17 | 11 | 11 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D162 Immigration Law, Asylum | 5 | 13 | 8 | 8 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D149 Diplomacy, International Relations | 5 | 13 | 1 | 1 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D163 Intellectual Property Law, Patents | 5 | 8 | 6 | 6 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D065 Translation, Interpretation | 7 | 12 | 4 | 4 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D160 Fashion Styling, Image Consulting | 6 | 17 | 12 | 12 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D063 Economics | 5 | 17 | 6 | 6 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D150 Religious Ministry, Theology | 5 | 9 | 5 | 5 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D161 Humanitarian Aid, Emergency Response | 5 | 18 | 15 | 15 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D057 Digital Health | 6 | 14 | 2 | 2 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D059 Space Technology | 7 | 11 | 9 | 9 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D084 Payroll, Bookkeeping | 5 | 15 | 5 | 5 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D091 Driving Instruction | 6 | 7 | 1 | 1 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D096 Agricultural | 5 | 15 | 9 | 9 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D105 Handicraft, Basketry, Textile Craft | 6 | 15 | 2 | 2 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D123 Radiography, Medical Imaging | 6 | 13 | 4 | 4 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D125 Medical Secretarial | 5 | 10 | 3 | 3 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D126 Complementary, Alternative | 5 | 11 | 4 | 4 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D132 Space Science, Exploration | 6 | 8 | 7 | 7 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D166 Autonomous Vehicles, Self-Driving Systems | 6 | 14 | 5 | 5 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D135 Nuclear Engineering, Radiation Science | 5 | 15 | 11 | 11 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D137 Medical Physics, Radiation Therapy | 6 | 9 | 6 | 6 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D138 Biomedical Engineering | 6 | 15 | 7 | 7 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D144 Climate Science, Meteorology | 5 | 14 | 10 | 10 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D145 Neuroscience, Cognitive Science | 6 | 12 | 5 | 5 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D155 Nanotechnology, Advanced Materials | 5 | 16 | 7 | 7 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D141 Quantum Computing, Quantum Information | 7 | 19 | 19 | 7 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D167 XR & Immersive Technology | 7 | 13 | 13 | 7 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |
| D168 Esports & Creator Economy | 10 | 17 | 17 | 8 | taxonomy_plus_specialist_framework | multi_source_role_spine_and_thin_overlay |

## Reading the matrix

A domain is not considered complete merely because it has several global URLs. The matrix distinguishes generic taxonomies from specialist frameworks and keeps Nigerian licensing or certification claims source-bound.

See `global_thin_gap_evidence_audit.json` for the source URLs, role names, current domain skills/tools/certifications, Nigerian context, and the exact evidence state for every gap row.
