# Market Intelligence Backfill Sources - 2026-07-15

Scope: sources for populating the market intelligence board now across `global`, `ng_remote`, and `ng_local`.

Important terminology:

- `global`: broad international demand, wages, tool/cert trends, and role currency.
- `ng_remote`: jobs a Nigerian learner can plausibly access remotely; not necessarily Nigerian employers.
- `ng_local`: Nigerian local job market, Nigerian employers, Nigerian salary/context, Nigerian regulator/professional-body naming.

Polling is not the core requirement. Initial backfill can be done now, then refreshed quarterly or annually depending on source cadence.

## What We Already Have

| Source | Lens | Local file/status | Use now |
|---|---:|---|---|
| O*NET 30.3 database | global | `data/career-mapping/_source_downloads/taxonomy/onet_30_3_database.zip`; extracted to `_source_extracts/onet_30_3/` | Role currency, skills, tools/software, job zones, emerging tasks |
| ESCO source/normalized outputs | global | Existing `_tax_src/esco/`, `taxonomies/esco_*.json`, `occupation_graph.json` | Occupation/skill spine and ESCO skill normalization |
| Existing ESCO-O*NET crosswalk | global | `data/career-mapping/_tax_src/esco_onet_crosswalk.csv` | Role graph bridge |
| GitHub Innovation Graph | global, ng_local tech signal | Downloaded/extracted in `_source_extracts/github_innovationgraph/` | Nigeria software activity, language/topic trend, tech ecosystem signal |
| MyJobMag feeds | ng_local | Downloaded XML and CSV samples in `_source_downloads/market/` and `_source_extracts/` | Nigerian job-title/employer/category sample and future counts |
| RemoteOK API sample | ng_remote | Downloaded/extracted in `_source_downloads/remote_market/remoteok_sample.json` and `_source_extracts/remote_market/remoteok_sample.csv` | Remote role postings, tags, salary min/max where present |
| Remotive API sample | ng_remote | Downloaded/extracted in `_source_downloads/remote_market/remotive_sample.json` and `_source_extracts/remote_market/remotive_sample.csv` | Remote roles, tags, category, candidate-location requirements |
| Arbeitnow API sample | global, ng_remote | Downloaded/extracted in `_source_downloads/remote_market/arbeitnow_sample.json` and `_source_extracts/remote_market/arbeitnow_sample.csv` | Global/remote job titles, tags, locations |
| The Muse public jobs API sample | global | Downloaded/extracted in `_source_downloads/remote_market/themuse_sample.json` and `_source_extracts/remote_market/themuse_sample.csv` | Global roles, categories, levels, company/location metadata |
| WEF 2025 extracted roles | global | `data/career-mapping/taxonomies/wef_2025_roles.json` | Emerging/declining role labels |
| Domain tools output | global | `data/career-mapping/domain_tools.json` and `_enrichment/tools_demand.csv` | Tool layer seed |

## Best Backfill Stack

Use this stack to populate the board now, without waiting for a long polling history.

### Global

| Data needed | Primary source | Access | Cadence | Notes |
|---|---|---:|---:|---|
| Role universe and skill spine | ESCO + O*NET | Already partly local | Annual/version bump | Use ESCO for skills; O*NET for alt titles, software/tools, essential skills |
| Role currency/emerging signal | O*NET emerging tasks, O*NET Bright Outlook, WEF Future of Jobs 2025 | Already partly local | Annual | Combine into `currency_status` and `emerging_signal` |
| Global salary/value anchor | BLS OEWS May 2025 all data | Manual download needed | Annual | Best redistributable wage anchor; US proxy for global/remote value |
| Tech/tool trends | Stack Overflow Developer Survey 2025 | Manual download recommended | Annual | 134 MB CSV; useful for tool demand by developer roles |
| Developer ecosystem trend | GitHub Innovation Graph | Already local | Quarterly | Includes country/economy rows, including Nigeria |
| Broad current postings | The Muse API, Arbeitnow API, Careerjet/Adzuna if keys available | The Muse/Arbeitnow local samples; Careerjet/Adzuna need keys | Quarterly | Store aggregate counts and derived metrics, not job descriptions |

### Nigeria-Accessible Remote (`ng_remote`)

| Data needed | Primary source | Access | Cadence | Notes |
|---|---|---:|---:|---|
| Remote role counts and tags | RemoteOK API | Already sampled locally | Quarterly/monthly | Good no-key source; salary fields sometimes available |
| Remote role categories and location restrictions | Remotive API | Already sampled locally | Quarterly/monthly | Good for "Worldwide", "EMEA", "Anywhere" filters |
| Additional global/remote postings | Arbeitnow API | Already sampled locally | Quarterly/monthly | Has remote boolean/tags |
| Salary/value spot checks | RemoteOK salary fields, JSearch, Levels.fyi reference-only | RemoteOK local; JSearch key needed | Quarterly | Keep reference-only salary sources out of redistributable raw data |
| Tool demand for remote tech roles | Stack Overflow + O*NET software skills + GitHub topics | O*NET/GitHub local; StackOverflow manual | Annual/quarterly | Strong enough for tech-heavy remote pathway cards |

### Nigerian Local Job Market (`ng_local`)

| Data needed | Primary source | Access | Cadence | Notes |
|---|---|---:|---:|---|
| Nigerian job-title/employer/category feed | MyJobMag XML feeds | Already local samples | Quarterly/monthly | Best immediate no-key Nigerian source |
| Nigerian aggregate job counts | Careerjet Nigeria locale, Jooble Nigeria | API key needed | Quarterly | Better for aggregate counts than scraping job pages |
| Nigerian salary anchors | Robert Walters Africa Salary Survey, local salary guides, MySalaryScale/Glassdoor/Payscale reference-only | Manual/reference | Annual | Use derived bands and cite provenance; do not republish restricted raw data |
| Nigerian public-sector/pay context | NSIWC and relevant public pay circulars | Manual | Annual | Useful for education, health, government, public-service roles |
| Nigerian labour context | NBS labour force reports, ILOSTAT, World Bank | Manual/API | Annual/quarterly | Context overlay, not role-level demand |
| Nigerian regulator/professional naming | Nigerian professional bodies listed in the professional-body registry | Mostly manual/web | Annual | Important for role aliases, required licences, and local credibility |

## Sources To Add Next

These are the highest-value gaps after the current downloads.

| Source | Lens | Why it matters | Access |
|---|---:|---|---|
| BLS OEWS May 2025 all data | global | Salary/value baseline for almost every role | Manual browser download; command-line got 403 |
| Stack Overflow Developer Survey 2025 CSV | global, ng_remote | Tool/tech popularity and recency for tech roles | Manual or long download |
| Careerjet API | global, ng_local | Aggregate counts via `hits`, including locale searches | API partner key |
| Jooble API | global, ng_local | Aggregate counts and Nigeria searches | API key |
| JSearch/RapidAPI | global, ng_remote, ng_local sample | Salary and posting spot checks | API key |
| Robert Walters Africa Salary Survey | ng_local | Nigeria/Africa salary bands by professional role | Manual PDF/reference-only |
| ILOSTAT / World Bank | ng_local context | Country labour and macro context | Public API/manual |
| National Bureau of Statistics Nigeria | ng_local context | Nigerian labour-market context | Manual reports |

## Recommended Refresh Cadence

| Source type | Initial backfill | Refresh |
|---|---:|---:|
| Professional-body/regulator documents | Now | Annual |
| O*NET / ESCO / WEF | Now | Annual or version bump |
| GitHub Innovation Graph | Now | Quarterly |
| Stack Overflow survey | Manual now | Annual |
| Remote job APIs | Now | Quarterly unless you want live vacancy UX |
| Nigerian job feeds/APIs | Now | Quarterly for intelligence; monthly if you want trend lines |
| Salary guides | Now | Annual |
| BLS OEWS | Now | Annual |
| NBS/ILOSTAT/World Bank | Now | Quarterly/annual depending on dataset |

## Board Population Model

For each domain and role, compute separate records for each lens:

- `posting_volume_score`
- `value_score`
- `growth_or_recency_score`
- `remote_access_score`
- `employer_diversity_score`
- `top_tools`
- `top_certifications`
- `top_employers`
- `source_confidence`
- `redistributable`
- `last_refreshed_at`

Then derive labels:

- high volume + high value: `Broad demand, strong upside`
- high volume + low value: `Broad entry, lower ceiling`
- low volume + high value: `Elite pathway, selective entry`
- low volume + low value: `Limited signal, investigate carefully`
- high growth but low current volume: `Growing fast, still forming`

The elite-domain problem is solved by the label and scoring model: low volume should not bury high-value roles.

## Immediate Next Data Extraction

1. Normalize every existing role to O*NET/ESCO/SFIA/NICE where possible.
2. Create query aliases per role, including Nigerian aliases from professional bodies.
3. For each role alias, query:
   - MyJobMag for `ng_local`
   - RemoteOK/Remotive/Arbeitnow for `ng_remote`
   - The Muse/Careerjet/Adzuna/JSearch for `global`, depending on access
4. Store aggregate counts and derived signals, not raw restricted postings.
5. Use BLS/OEWS + salary guides for value bands.
6. Roll role metrics up to subgroup/domain metrics.
