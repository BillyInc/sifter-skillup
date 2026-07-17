# LevelUp Extraction Session Log

**Created**: 2026-07-15
**Last Updated**: 2026-07-15
**Purpose**: Track all data extractions for the LevelUp career-intelligence platform

---

## Session Summary

This session extracted structured career-intelligence data from **8 source files** across **3 formats** (CSV, XLSX, PDF) into **8 separate JSON files**. All extractions use the LevelUp extraction prompt schema (roles, skills, salaries, market intelligence, Nigerian relevance).

---

## Extracted Files

| # | File | Source | Format | Size | Records | Status |
|---|------|--------|--------|------|---------|--------|
| 1 | `stackoverflow_survey_2024.json` | Stack Overflow Developer Survey 2024 (browser extract) | CSV | 77KB | 32 roles, 5327 responses | Done |
| 2 | `esco_occupations_skills.json` | ESCO v1.2.1 Classification (EN) | CSV | 14.9MB | 1,864 occupations, 13,939 skills | Done |
| 3 | `bls_oes_wages_2025.json` | BLS Occupational Employment & Wage Statistics May 2025 | XLSX | 34KB | 126 occupations | Done |
| 4 | `michael_page_switzerland_2026.json` | Michael Page Salary Guide 2026 Switzerland | PDF | 42KB | 247 roles, 14 industries | Done |
| 5 | `nigeria_nlfs_q1_2024.json` | Nigeria Labour Force Survey Q1 2024 | PDF | 3KB | 36 stat fields | Done |
| 6 | `nigeria_nlfs_q4_2022_q1_2023.json` | Nigeria Labour Force Survey Q4 2022 & Q1 2023 | PDF | 5KB | 2 quarters, demographics | Done |
| 7 | `nigeria_labour_force_methodology.json` | Nigeria Labour Force Survey Methodology | PDF | 3KB | 8 definitions, sample design | Done |
| 8 | `ilostat_api_reference.json` | ILOSTAT SDMX API Reference Guide v4.1 | PDF | 5KB | 11 indicators, API structure | Done |

**Total extracted data**: ~15.1MB across 8 files

---

## Source Details

### 1. Stack Overflow Developer Survey 2024
- **Input**: `docs/github_browser_extract.txt` (5327 rows, CSV)
- **Method**: Python CSV parser (column 12 = DevType, column 40 = Industry, etc.)
- **Key data**: Role counts, technologies used, salary by role+country, remote work preferences, career mobility, Nigerian responses (11 total)
- **Nigerian roles found**: Full-stack, Back-end, Front-end, Cybersecurity, Academic researcher, Project manager, Student
- **Extraction agent**: A1 (Role Extractor via Python script), A2 (Skills), A3 (Market Intel), A4 (Nigeria), A5 (Merger)

### 2. ESCO Dataset v1.2.1
- **Input**: `ESCO dataset - v1.2.1 - classification - en - csv.zip` (19 CSV files)
- **Key files used**: `occupations_en.csv`, `skills_en.csv`, `occupationSkillRelations_en.csv`, `ISCOGroups_en.csv`
- **Filtering**: Only ISCO levels 1-3 (Managers, Professionals, Technicians) - university-eligible career domains
- **Extraction agent**: ESCO Extractor task

### 3. BLS OES May 2025
- **Input**: `oesm25all.zip` → `all_data_M_2025.xlsx` (413,527 rows)
- **Filtering**: SOC codes 15-xxx (Computer/Math), 17-xxx (Engineering), 11-xxx (Management), 13-xxx (Business)
- **Key data**: SOC codes, employment counts, annual/hourly mean wages
- **Extraction agent**: OES Extractor task

### 4. Michael Page Salary Guide 2026 Switzerland
- **Input**: `20260205-Salary-Guide-2026-Michael-Page-Switzerland.pdf` (48 pages)
- **Method**: pypdf text extraction
- **Key data**: Salary ranges (min/avg/max in kCHF) across 14 industries (IT, Finance, Engineering, etc.)
- **Extraction agent**: PDF Extractor task

### 5-7. Nigeria Labour Force Survey (3 PDFs)
- **Inputs**: NLFS Q1 2024 (29pp), NLFS Q4 2022/Q1 2023 (44pp), Methodology (27pp)
- **Method**: pypdf text extraction
- **Key data**: LFPR 77.3%, Unemployment 5.3%, Youth NEET 14.4%, Informal 92.7%, sector breakdowns
- **Extraction agent**: PDF Extractor task

### 8. ILOSTAT SDMX API Reference
- **Input**: `ILOSTAT-SDMX_Dissem API Ref Guide_V4.1-(ILO Style).pdf` (18 pages)
- **Key data**: API endpoints, available indicators, country coverage, query syntax
- **Extraction agent**: PDF Extractor task

---

## Processing Pipeline

```
Original Files (3 ZIPs + 5 PDFs + 1 CSV)
    │
    ├── CSV: github_browser_extract.txt
    │   └── Agent A1 (Roles) + A2 (Skills) + A3 (Market) + A4 (Nigeria) + A5 (Merger)
    │       └── stackoverflow_survey_2024.json
    │
    ├── ZIP: ESCO CSV
    │   └── Agent: ESCO Extractor
    │       └── esco_occupations_skills.json
    │
    ├── ZIP: OES XLSX
    │   └── Agent: OES Extractor
    │       └── bls_oes_wages_2025.json
    │
    └── PDFs (5 files)
        └── Agent: PDF Extractor (pypdf)
            ├── michael_page_switzerland_2026.json
            ├── nigeria_nlfs_q1_2024.json
            ├── nigeria_nlfs_q4_2022_q1_2023.json
            ├── nigeria_labour_force_methodology.json
            └── ilostat_api_reference.json
```

---

## Data Quality Notes

- All 8 JSON files validated as valid JSON with real data
- No hallucinated/empty data detected
- ESCO file is very large (14.9MB) - may be slow in some editors
- Nigeria NLFS files cross-reference correctly (unemployment 5.3% matches across reports)
- StackOverflow salary data is authentic (US full-stack median ~$145K)
- Michael Page data uses CHF currency, nested 3 levels deep by sector

---

## Key Insights from Extraction

### Nigerian Labour Market
- Unemployment: 5.3% (Q1 2024)
- Youth NEET: 14.4%
- Informal employment: 92.7%
- Labour force participation: 77.3%
- Coverage: 36 states + FCT, 35,520 households

### Global Tech Salaries (USD, Annual Mean)
- Software Developers: $135,980 median
- Software Architects: ~$150K+
- Data Scientists: ~$120K+
- DevOps Engineers: ~$130K+
- AI/ML Engineers: ~$140K+

### ESCO Coverage
- 1,864 university-eligible occupations
- 13,939 skills with descriptions
- 126,051 occupation-skill mappings
- Full ISCO hierarchy (levels 1-3)

---

## TODO / Next Steps

- [ ] Integrate extracted data into database schema
- [ ] Map ESCO occupations to LevelUp domains
- [ ] Cross-reference OES salary data with StackOverflow survey
- [ ] Use ILOSTAT API to pull additional Nigeria labour data
- [ ] Process any additional source documents
- [ ] Build automated extraction pipeline for recurring data updates

---

## Files Location

All files in: `C:\Users\USER\Documents\sifter-skillup-integrated\docs\`

```
docs/
├── EXTRACION_LOG.md                    # This file
├── stackoverflow_survey_2024.json      # 77KB - 32 roles
├── esco_occupations_skills.json        # 14.9MB - 1864 occupations
├── bls_oes_wages_2025.json             # 34KB - 126 occupations
├── michael_page_switzerland_2026.json  # 42KB - 247 roles
├── nigeria_nlfs_q1_2024.json           # 3KB - labour stats
├── nigeria_nlfs_q4_2022_q1_2023.json   # 5KB - trend data
├── nigeria_labour_force_methodology.json # 3KB - methodology
└── ilostat_api_reference.json          # 5KB - API docs
```
