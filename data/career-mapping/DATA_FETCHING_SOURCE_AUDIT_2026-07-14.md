# Data Fetching Source Audit - 2026-07-14

Scope: reviewed the data-fetching part of `PLAN new.md` and `PHASE2_DATA_FETCHING_AUDIT.md`, inspected `drive-download-20260714T135724Z-1-001.zip`, ignored `LedgerLens_Product_Spec.md.docx`, checked current web sources, downloaded what was feasible, and extracted structured data where local tooling allowed.

## Already In Codebase Before This Pass

- ESCO source CSVs and normalized taxonomy outputs:
  - `data/career-mapping/_tax_src/esco/`
  - `data/career-mapping/taxonomies/esco_occupations.json`
  - `data/career-mapping/taxonomies/esco_isco_groups.json`
  - `data/career-mapping/taxonomies/occupation_graph.json`
- O*NET partial source files and Bright Outlook snapshots:
  - `data/career-mapping/_tax_src/onet/`
  - `data/career-mapping/_tax_src/onet_bright_*.html`
  - `data/career-mapping/taxonomies/onet_bright_outlook.json`
- WEF 2025 roles extracted:
  - `data/career-mapping/taxonomies/wef_2025_roles.json`
- ENISA ECSF and NICE v1 professional-body files:
  - `data/career-mapping/_prof_bodies/ENISA_ECSF_Role_Profiles.pdf`
  - `data/career-mapping/_prof_bodies/ENISA_ECSF_User_Manual.pdf`
  - `data/career-mapping/_prof_bodies/NICE_Framework_Components_v1.0.0.xlsx`
- Tool-demand seed outputs:
  - `data/career-mapping/domain_tools.json`
  - `data/career-mapping/_enrichment/tools_demand.csv`

## Imported From The Provided Zip

Copied into `data/career-mapping/_prof_bodies/`, skipping LedgerLens:

- `career-skills-framework-2022-static_copy.pdf`
- `Print - Workforce Framework for Cybersecurity (NICE Framework) Version 1.0.0.pdf`
- `cprt_SP_800_181_2_1_0_07-14-2026.json`
- `business-analysis-competency-model-v4-preview-edition_copy.pdf`
- `SFIA 9 Summary Development Operations Change.pdf`
- `sfia-9_current-standard_en_260521.xlsx`
- `SFIA_9_2025-02-27.ttl`
- `SFIA_9_cloud_computing_skills_with_LoR.pdf`
- `SFIA 9 Summary Chart v9.0.sfiasummary.us-en.250305.pdf`
- `SFIA_9_cybersecurity_skills_with_LoR.pdf`
- `SFIA 9 Summary Chart v9.0.sfiasummary.en.250305.pdf`
- `spe_csp11_description.pdf`
- `European Cybersecurity Skills Framework Role Profiles_copy.pdf`
- `CIPM_BoK_EBP_FINAL_03Dec25_copy.pdf`
- `NICE Framework Components v2.2.0.xlsx`
- `about_sfia_241028_copy.pdf`
- `full-standards-download-a4-updaterefreshnov2025_copy.pdf`
- `sfia_9_framework_reference_250129_copy.pdf`

## Downloaded In This Pass

Stored in `data/career-mapping/_source_downloads/`:

- `taxonomy/onet_30_3_database.zip`
  - Source: https://www.onetcenter.org/database.html
  - Status: downloaded.
  - Why: current O*NET 30.3 full database for occupation, skill, software, job-zone, and emerging-task updates.
- `market/github_innovationgraph_main.zip`
  - Source: https://github.com/github/innovationgraph
  - Status: downloaded.
  - Why: CC0 country/economy software activity, including Nigeria, with languages/topics/developers repositories by quarter.
- `market/myjobmag_feeds.html`
  - Source: https://www.myjobmag.com/feeds
  - Status: downloaded.
  - Why: confirms live Nigerian job-feed endpoints.
- `market/myjobmag_jobsxml.xml`
  - Source: https://www.myjobmag.com/jobsxml.xml
  - Status: downloaded.
  - Why: sample live Nigerian job feed.
- `market/myjobmag_jobsxml_by_categories.xml`
  - Source: https://www.myjobmag.com/jobsxml_by_categories.xml
  - Status: downloaded.
  - Why: sample live Nigerian category feed.

## Extracted Structured Data

Stored in `data/career-mapping/_source_extracts/`:

- `onet_30_3/`
  - Extracted tables:
    - `Occupation Data.txt` - 1,017 rows including header.
    - `Essential Skills.txt` - 17,881 rows including header.
    - `Software Skills.txt` - 31,822 rows including header.
    - `Emerging Tasks.txt` - 329 rows including header.
    - `Job Zones.txt` - 924 rows including header.
    - `Job Zone Reference.txt` - 5 rows including header.
  - Summary: `onet_30_3_summary.json`
- `github_innovationgraph/`
  - Extracted CSVs:
    - `developers.csv`
    - `economy_collaborators.csv`
    - `git_pushes.csv`
    - `languages.csv`
    - `licenses.csv`
    - `organizations.csv`
    - `repositories.csv`
    - `topics.csv`
  - Summary: `github_innovationgraph_summary.json`
- MyJobMag XML converted to CSV:
  - `myjobmag_jobsxml.csv` - 100 items in the current feed sample.
  - `myjobmag_jobsxml_by_categories.csv`
  - Summaries include fields and samples.
- Professional-body XLSX light extraction:
  - `NICE Framework Components v2.2.0_shared_strings.txt`
  - `NICE_Framework_Components_v1.0.0_shared_strings.txt`
  - `sfia-9_current-standard_en_260521_shared_strings.txt`
  - Summary: `prof_body_xlsx_summary.json`

## Verified Web Facts / Corrections

- ESCO v1.2.1 is current, last update 2025-12-10, and supports CSV/ODS/RDF/TTL/XML/JSON-LD export.
  - Source: https://esco.ec.europa.eu/en/use-esco/download
  - Caveat: ESCO now requires the download-package flow with privacy/email steps, so command-line direct download was not available.
- O*NET 30.3 is current and includes updated software skills, hot/in-demand technologies, essential skills, and quarterly update cadence.
  - Source: https://www.onetcenter.org/database.html
- Stack Overflow 2025 Developer Survey exists and exposes a 134 MB CSV.
  - Source page: https://survey.stackoverflow.co/
  - Direct CSV: https://github.com/StackExchange/Survey/raw/refs/heads/main/packages/archive/2025/results.csv
- BLS OEWS May 2025 tables are live, including an "All data" XLSX/TXT option.
  - Source: https://www.bls.gov/oes/tables.htm
  - Caveat: BLS returned 403 to command-line download in this environment.
- GitHub Innovation Graph repository is current and CC0.
  - Source: https://github.com/github/innovationgraph
- MyJobMag feeds are live and expose:
  - `https://www.myjobmag.com/jobsxml.xml`
  - `https://www.myjobmag.com/jobsxml_by_categories.xml`
  - `https://www.myjobmag.com/aggregate_feed.xml`
  - `https://www.myjobmag.com/aggregate_feed2.xml`
  - `https://www.myjobmag.com/blogfeed.xml`

## Manual Downloads Still Needed

These are not in the provided zip and were not successfully fetched by command-line download.

- ESCO v1.2.1 full English CSV package
  - Use: taxonomy spine refresh.
  - URL: https://esco.ec.europa.eu/en/use-esco/download
  - Reason manual: ESCO download flow requires package selection, privacy acceptance, and email/download link.
  - Priority: medium because v1.2.0/older ESCO source CSVs already exist locally; high if we want a truly current rebuild.
- WEF Future of Jobs Report 2025 PDF
  - Use: emerging-role evidence/provenance.
  - URL: https://www.weforum.org/publications/the-future-of-jobs-report-2025/
  - Reason manual: PDF endpoint timed out with 504 from command-line; report page and download link are live.
  - Priority: low/medium because `wef_2025_roles.json` already exists locally.
- Stack Overflow Developer Survey 2025 CSV
  - Use: tech/tool demand re-rank.
  - Direct URL: https://github.com/StackExchange/Survey/raw/refs/heads/main/packages/archive/2025/results.csv
  - Reason manual: file is 134 MB and command-line transfer was projecting 30+ minutes at the observed speed.
  - Priority: medium; useful for tool popularity but not required to unlock taxonomy.
- BLS OEWS May 2025 all data
  - Use: redistributable US wage anchor / remote salary proxy.
  - URL: https://www.bls.gov/oes/tables.htm
  - Reason manual: BLS returned 403 to command-line download.
  - Priority: high for salary/value scoring.
- SFIA account-gated docs not in zip, if deeper SFIA coverage is needed.
  - Use: richer tech/cloud/cyber role-skill coverage.
  - URL: https://sfia-online.org/en/sfia-9
  - Reason manual: free registration/login.
  - Priority: low/medium because the zip already includes SFIA 9 XLSX, TTL, reference, and summaries.
- API-key sources: Jooble, Careerjet, JSearch, Adzuna, Lightcast/Open Skills.
  - Use: live aggregate counts, salary samples, and richer skill/cert/tool taxonomy.
  - Reason manual: requires API key/trial/commercial access.
  - Priority: optional for v1 except Careerjet/Jooble if monthly polling is planned now.

## Extraction Limits

- PDF-only files were stored but not text-extracted because this environment lacks PDF extraction tools (`pdftotext`, `pypdf`, `pdfplumber`).
- XLSX files were partially extracted through shared strings without `openpyxl`; enough to confirm content and recover terms, but not enough for a clean relational import.
- The NICE v2.2 XLSX and SFIA 9 XLSX should be parsed later with `openpyxl` or a small Node XLSX parser.

## Source Enrichment Recommendations

The plan is strong for tech, cyber, finance, and professional/regulated roles, but not comprehensive enough for creative, vocational, agriculture, public sector, and Nigeria-local salary/context.

Add these source families:

- ILOSTAT and World Bank DataBank for Nigeria labour context, unemployment, sector employment, and macro overlays.
- Nigerian public-sector compensation / NSIWC references for public-sector salary anchors.
- NBS Nigeria reports for labour force and sector trends.
- NBTE curricula for polytechnic/vocational programmes.
- NCCE minimum standards for NCE/college-of-education pathways.
- Nursing and Midwifery Council of Nigeria curriculum/professional standards for nursing pathways.
- MDCN, PCN, MLSCN, Radiographers Registration Board, Medical Rehabilitation Therapists Board, EHORECON, and CHPRBN for Nigerian health-profession regulation.
- COREN, NSE, ARCON, QSRBN, SURCON, TOPREC, and ESVARBON for Nigerian engineering/built-environment regulation.
- ICAN, ANAN, CIBN, CITN, Chartered Institute of Stockbrokers, and Nigerian Institute of Management for Nigeria-local business/finance credentials.
- CIPM Nigeria, NIM, CILSCM, and procurement/supply-chain Nigerian bodies for HR/management/supply-chain localization.
- ScreenSkills, IFPI/creative-industry role maps, game/esports job taxonomies, and live posting samples for creative/media/game domains where professional-body coverage is thin.
- FAO, WOAH, Codex Alimentarius, CGIAR/IAEA agriculture knowledge resources, and Nigerian agriculture/veterinary regulators for agri/vet/food/environment gaps.

## Next Implementation Step

Build an ingest registry table or JSON file with:

- `source_id`
- `source_name`
- `slot`
- `domain_keys`
- `local_path`
- `source_url`
- `license_class`
- `redistributable`
- `access_type`
- `extraction_status`
- `manual_download_required`
- `last_checked_at`
- `notes`

Then wire only redistributable structured extracts into the enrichment pipeline. Keep API-key/reference-only sources as aggregate metrics or provenance notes, not republished content.
