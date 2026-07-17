# Claude Code Prompt: Market Intelligence Backfill

Use this prompt in Claude Code from the repo root.

```text
You are working in the sifter-skillup-integrated repo. Build the market intelligence backfill described in data/career-mapping/MARKET_INTELLIGENCE_BACKFILL_SOURCES_2026-07-15.md.

Important: do not print API keys. Load credentials from .env and backend/.env only. Expected env names include CAREERJET_AFFID, CAREERJET_API_KEY, JOOBLE_API_KEY, JOBBLE_API_KEY, RAPIDAPI_KEY, JSEARCH_RAPIDAPI_KEY, JSEARCH_RAPIDAPI_HOST, OPENWEBNINJA_API_KEY, and MARKET_INTELLIGENCE_LLM_API_KEY.

Goal:
Create a reproducible data pipeline that produces role/domain market-intelligence records for three lenses:
- global
- ng_remote
- ng_local

For each role/domain/lens, extract or derive:
- posting_volume_score
- value_score
- growth_or_recency_score
- remote_access_score
- employer_diversity_score
- top_tools
- top_certifications
- top_employers
- salary_min
- salary_max
- salary_median_or_midpoint
- salary_currency
- salary_period
- seniority_level
- location_scope
- source_confidence
- redistributable
- provenance/source_url
- evidence_window_start
- evidence_window_end
- last_refreshed_at
- notes_on_limitations

Sources to use:
1. Existing local taxonomy and market samples already in data/career-mapping:
   - O*NET 30.3
   - ESCO
   - ESCO-O*NET crosswalk
   - WEF 2025 roles
   - GitHub Innovation Graph
   - RemoteOK, Remotive, Arbeitnow, The Muse samples
   - MyJobMag downloaded feeds/samples
2. Live/API sources where keys exist:
   - JSearch/RapidAPI for current job details, salary spot checks, remote flags, employer, location, required technologies where provided
   - Careerjet for Nigeria/global aggregate vacancy counts
   - Jooble for Nigeria/global aggregate vacancy counts
   - OpenWeb Ninja Job Salary Data API for salary estimates by title/location
3. Public/no-key sources:
   - MyJobMag pages and XML/feed surfaces for Nigerian local listings and salary-blog tables
   - MyJobMag annual report pages for 2024/2025 comparison where available
   - RemoteOK public API
   - Remotive public API
   - Arbeitnow public API
   - The Muse public API
   - ILOSTAT/World Bank/NBS/BLS/OEWS/manual downloaded datasets for macro and annual context

Implementation requirements:
- First inspect existing schemas, scripts, and outputs before coding.
- Store raw allowed API responses under data/career-mapping/_source_downloads/market_intelligence/ with provider/date subfolders.
- Store normalized extracts under data/career-mapping/_source_extracts/market_intelligence/.
- Do not store raw restricted job descriptions unless the provider terms allow it. Prefer aggregate counts, derived fields, and short provenance references.
- Respect provider rate limits and cache all successful responses.
- For job boards without APIs, scrape politely: identify sitemap/feed/search pages first, use delays, set a clear user agent, and collect only public pages.
- Build query aliases per role from ESCO/O*NET titles, Nigerian aliases, and domain-specific synonyms.
- Separate current signals from historical signals. Current APIs are not automatically historical unless the response includes posting dates or the provider supports date filters.
- Produce confidence labels: high, medium, low, with the reason.
- Produce a final summary report explaining source coverage, gaps, and which fields are safe to show in-product.

Outputs:
1. A runnable script or scripts for ingestion/normalization.
2. A normalized JSONL or CSV dataset ready for backend import.
3. A source coverage report.
4. A short README explaining how to refresh quarterly and annually.

Validation:
- Run a small sample first: 10 roles across ICT, accounting/finance, healthcare, engineering, education, logistics, sales, HR, legal, and product/design.
- Verify that each sample role has separate global, ng_remote, and ng_local records where evidence exists.
- Verify env loading without printing secrets.
- Verify that no generated output contains API keys.
```
