/**
 * Sifter LevelUp — Feed Sources
 * Complete source registry for all 29 fields and every track.
 * RSS feeds, API endpoints, job boards, sentiment sources.
 *
 * HOW TO USE:
 *   feedAggregator.ts calls getSourcesForTrack(trackId, sectionId)
 *   to get the right sources array to pull from.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RSSSource {
  name: string;
  url: string;               // RSS/Atom feed URL
  description: string;
  type: 'news' | 'research' | 'community' | 'blog';
  quality: 'primary' | 'secondary';  // primary = top-tier, secondary = supplementary
}

export interface APISource {
  name: string;
  endpoint: string;
  docsUrl: string;
  section: string;
  requiresKey: boolean;
  keyEnvVar?: string;
}

export interface JobSource {
  name: string;
  url: string;              // direct RSS or job board URL
  rssUrl?: string;          // RSS feed if available
  type: 'rss' | 'scrape' | 'api';
}

export interface SentimentSource {
  name: string;
  url: string;
  apiEndpoint?: string;
  assetClass: 'crypto' | 'equities' | 'commodities' | 'general';
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 01 — CRYPTO / WEB3
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const CRYPTO_NEWS_RSS: RSSSource[] = [
  // Primary news
  { name: 'The Defiant',   url: 'https://thedefiant.io/feed',              description: 'Independent DeFi news and analysis',             type: 'news',     quality: 'primary'   },
  { name: 'Blockworks',    url: 'https://blockworks.co/feed',              description: 'Institutional-grade crypto news',                type: 'news',     quality: 'primary'   },
  { name: 'The Block',     url: 'https://www.theblock.co/rss.xml',        description: 'Investigative crypto journalism + data',         type: 'news',     quality: 'primary'   },
  { name: 'CoinDesk',      url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', description: 'Crypto news industry standard',       type: 'news',     quality: 'primary'   },
  { name: 'Decrypt',       url: 'https://decrypt.co/feed',                description: 'Web3 explanatory journalism',                    type: 'news',     quality: 'primary'   },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss',          description: 'Global crypto news coverage',                    type: 'news',     quality: 'secondary' },
  { name: 'Bankless',      url: 'https://banklesshq.com/rss/',            description: 'DeFi and Ethereum focused analysis',             type: 'blog',     quality: 'primary'   },
  { name: 'Messari',       url: 'https://messari.io/rss',                 description: 'Crypto research and intelligence',               type: 'research', quality: 'primary'   },
  { name: 'CryptoSlate',   url: 'https://cryptoslate.com/feed/',          description: 'News + project database + research',             type: 'news',     quality: 'secondary' },
];

export const STARKNET_ECOSYSTEM_RSS: RSSSource[] = [
  { name: 'Starknet Blog',   url: 'https://www.starknet.io/feed/',         description: 'Official Starknet announcements',               type: 'blog', quality: 'primary' },
  { name: 'StarkWare Blog',  url: 'https://starkware.co/feed/',            description: 'Core protocol updates from StarkWare',          type: 'blog', quality: 'primary' },
  { name: 'Argent Blog',     url: 'https://www.argent.xyz/blog/rss/',      description: 'Wallet + AA updates',                           type: 'blog', quality: 'primary' },
  { name: 'Ekubo Blog',      url: 'https://ekubo.org/blog/rss',            description: 'Concentrated liquidity DEX on Starknet',        type: 'blog', quality: 'primary' },
  { name: 'Vesu Blog',       url: 'https://vesu.xyz/blog/rss',             description: 'Lending protocol on Starknet',                  type: 'blog', quality: 'primary' },
  { name: 'AVNU Blog',       url: 'https://avnu.fi/blog/feed',             description: 'DEX aggregator on Starknet',                    type: 'blog', quality: 'primary' },
];

export const ONCHAIN_RESEARCH_RSS: RSSSource[] = [
  { name: 'Glassnode Insights', url: 'https://insights.glassnode.com/rss', description: 'On-chain market intelligence',                  type: 'research', quality: 'primary'   },
  { name: 'Chainalysis Blog',   url: 'https://chainalysis.com/blog/feed/', description: 'Blockchain data + compliance research',         type: 'research', quality: 'primary'   },
  { name: 'Nansen Research',    url: 'https://www.nansen.ai/research/feed',description: 'Smart money on-chain analysis',                 type: 'research', quality: 'primary'   },
  { name: 'Token Terminal',     url: 'https://tokenterminal.com/feed',     description: 'Protocol revenue and fundamentals',             type: 'research', quality: 'primary'   },
  { name: 'Dune Analytics',     url: 'https://dune.com/blog/rss',          description: 'Community on-chain dashboards',                 type: 'blog',     quality: 'secondary' },
];

export const CRYPTO_GOVERNANCE_APIS: APISource[] = [
  {
    name: 'Snapshot',
    endpoint: 'https://hub.snapshot.org/graphql',
    docsUrl: 'https://docs.snapshot.org/graphql-api',
    section: 'governance',
    requiresKey: false,
  },
  {
    name: 'Tally',
    endpoint: 'https://api.tally.xyz/query',
    docsUrl: 'https://docs.tally.xyz',
    section: 'governance',
    requiresKey: true,
    keyEnvVar: 'TALLY_API_KEY',
  },
];

export const DEFI_DATA_APIS: APISource[] = [
  {
    name: 'DeFiLlama',
    endpoint: 'https://api.llama.fi',
    docsUrl: 'https://defillama.com/docs/api',
    section: 'ecosystem_data',
    requiresKey: false,
  },
  {
    name: 'Token Terminal',
    endpoint: 'https://api.tokenterminal.com/v2',
    docsUrl: 'https://docs.tokenterminal.com',
    section: 'ecosystem_data',
    requiresKey: true,
    keyEnvVar: 'TOKEN_TERMINAL_API_KEY',
  },
  {
    name: 'Dune Analytics',
    endpoint: 'https://api.dune.com/api/v1',
    docsUrl: 'https://docs.dune.com/api-reference/overview/introduction',
    section: 'ecosystem_data',
    requiresKey: true,
    keyEnvVar: 'DUNE_API_KEY',
  },
  {
    name: 'Nansen',
    endpoint: 'https://api.nansen.ai/v1',
    docsUrl: 'https://docs.nansen.ai',
    section: 'ecosystem_data',
    requiresKey: true,
    keyEnvVar: 'NANSEN_API_KEY',
  },
];

export const CRYPTO_SENTIMENT: SentimentSource[] = [
  {
    name: 'Alternative.me Fear & Greed',
    url: 'https://alternative.me/crypto/fear-and-greed-index/',
    apiEndpoint: 'https://api.alternative.me/fng/',
    assetClass: 'crypto',
  },
  {
    name: 'CoinMarketCap Greed Index',
    url: 'https://coinmarketcap.com/charts/bitcoin/',
    assetClass: 'crypto',
  },
];

export const CRYPTO_JOBS: JobSource[] = [
  { name: 'Crypto Jobs List',    url: 'https://cryptojobslist.com',        rssUrl: 'https://cryptojobslist.com/rss.xml',       type: 'rss'   },
  { name: 'Web3 Career',         url: 'https://web3.career',               rssUrl: 'https://web3.career/feed',                 type: 'rss'   },
  { name: 'Cryptocurrency Jobs', url: 'https://cryptocurrencyjobs.co',     rssUrl: 'https://cryptocurrencyjobs.co/feed.rss',   type: 'rss'   },
  { name: 'Starknet Foundation', url: 'https://jobs.lever.co/starknet',    type: 'scrape'  },
  { name: 'Bankless Jobs',       url: 'https://bankless.substack.com/jobs',type: 'scrape'  },
  { name: 'Paradigm Jobs',       url: 'https://www.paradigm.xyz/opportunities', type: 'scrape' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 02 — QUANTITATIVE FINANCE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const QUANT_NEWS_RSS: RSSSource[] = [
  { name: 'Risk.net',         url: 'https://www.risk.net/feeds/rss',                  description: 'Derivatives, risk, quant finance news',         type: 'news',     quality: 'primary'   },
  { name: 'FT Markets',       url: 'https://www.ft.com/markets?format=rss',           description: 'Financial Times markets coverage',              type: 'news',     quality: 'primary'   },
  { name: 'WSJ Markets',      url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',  description: 'Wall Street Journal markets',                   type: 'news',     quality: 'primary'   },
  { name: 'Bloomberg Markets',url: 'https://feeds.bloomberg.com/markets/news.rss',    description: 'Bloomberg real-time markets news',              type: 'news',     quality: 'primary'   },
  { name: 'Reuters Finance',  url: 'https://feeds.reuters.com/reuters/businessNews',  description: 'Reuters business and finance',                  type: 'news',     quality: 'secondary' },
  { name: 'Macro Hive',       url: 'https://macrohive.com/feed/',                    description: 'Macro research + quant insights',               type: 'research', quality: 'primary'   },
  { name: 'Quantocracy',      url: 'https://quantocracy.com/feed/',                  description: 'Curated quant blog aggregator',                 type: 'blog',     quality: 'primary'   },
  { name: 'Wilmott',          url: 'https://www.wilmott.com/rss/',                   description: 'Quant finance community and research',          type: 'research', quality: 'primary'   },
];

export const QUANT_RESEARCH_RSS: RSSSource[] = [
  { name: 'arXiv q-fin',       url: 'https://rss.arxiv.org/rss/q-fin',              description: 'Preprints: quantitative finance',               type: 'research', quality: 'primary' },
  { name: 'SSRN Finance',      url: 'https://www.ssrn.com/en/rss/rss.cfm?abstractid=FIN', description: 'Social Science Research Network — finance', type: 'research', quality: 'primary' },
  { name: 'Journal of Finance',url: 'https://onlinelibrary.wiley.com/feed/15406261/most-recent', description: 'Top academic finance journal',      type: 'research', quality: 'primary' },
  { name: 'J. Financial Econ', url: 'https://www.sciencedirect.com/journal/journal-of-financial-economics/rss', description: 'JFE paper feed',    type: 'research', quality: 'primary' },
];

export const QUANT_MARKET_DATA_APIS: APISource[] = [
  {
    name: 'CBOE VIX',
    endpoint: 'https://cdn.cboe.com/api/global/delayed_quotes/charts/historical/_VIX.json',
    docsUrl: 'https://www.cboe.com/delayed_quotes/',
    section: 'market_data',
    requiresKey: false,
  },
  {
    name: 'Federal Reserve FRED',
    endpoint: 'https://api.stlouisfed.org/fred/series/observations',
    docsUrl: 'https://fred.stlouisfed.org/docs/api/fred/',
    section: 'market_data',
    requiresKey: true,
    keyEnvVar: 'FRED_API_KEY',
  },
  {
    name: 'Alpha Vantage',
    endpoint: 'https://www.alphavantage.co/query',
    docsUrl: 'https://www.alphavantage.co/documentation/',
    section: 'market_data',
    requiresKey: true,
    keyEnvVar: 'ALPHAVANTAGE_API_KEY',
  },
];

export const QUANT_SENTIMENT: SentimentSource[] = [
  {
    name: 'CNN Fear & Greed',
    url: 'https://www.cnn.com/markets/fear-and-greed',
    apiEndpoint: 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
    assetClass: 'equities',
  },
  {
    name: 'AAII Sentiment Survey',
    url: 'https://www.aaii.com/sentimentsurvey',
    assetClass: 'equities',
  },
  {
    name: 'CBOE VIX',
    url: 'https://www.cboe.com/tradable_products/vix/',
    assetClass: 'equities',
  },
];

export const QUANT_JOBS: JobSource[] = [
  { name: 'eFinancialCareers', url: 'https://www.efinancialcareers.com',  rssUrl: 'https://www.efinancialcareers.com/rss/jobs', type: 'rss'    },
  { name: 'Quantitative Finance Jobs', url: 'https://www.quantfinancejobs.com', type: 'scrape' },
  { name: 'Jane Street',       url: 'https://www.janestreet.com/join-jane-street/', type: 'scrape' },
  { name: 'Citadel',           url: 'https://www.citadel.com/careers/',   type: 'scrape' },
  { name: 'Two Sigma',         url: 'https://careers.twosigma.com',       type: 'scrape' },
  { name: 'DE Shaw',           url: 'https://www.deshaw.com/careers',     type: 'scrape' },
  { name: 'AQR Capital',       url: 'https://careers.aqr.com',            type: 'scrape' },
  { name: 'Quant Finance Jobs RSS', url: 'https://jobicy.com/feed/?job_categories=accounting-finance&search_keywords=quant', rssUrl: 'https://jobicy.com/feed/?job_categories=accounting-finance&search_keywords=quant', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 03 — AI & MACHINE LEARNING
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const AI_ML_NEWS_RSS: RSSSource[] = [
  { name: 'VentureBeat AI',        url: 'https://venturebeat.com/category/ai/feed/',         description: 'AI industry news + enterprise adoption',         type: 'news',     quality: 'primary'   },
  { name: 'MIT News AI',           url: 'https://news.mit.edu/rss/topic/artificial-intelligence', description: 'MIT research announcements',              type: 'research', quality: 'primary'   },
  { name: 'OpenAI Blog',           url: 'https://openai.com/blog/rss/',                      description: 'OpenAI model and research releases',             type: 'blog',     quality: 'primary'   },
  { name: 'Google AI Blog',        url: 'https://ai.googleblog.com/feeds/posts/default',     description: 'Google DeepMind and Google AI research',         type: 'blog',     quality: 'primary'   },
  { name: 'Anthropic Research',    url: 'https://www.anthropic.com/rss.xml',                 description: 'Anthropic safety and model research',            type: 'blog',     quality: 'primary'   },
  { name: 'Hugging Face Blog',     url: 'https://huggingface.co/blog/feed.xml',             description: 'Open source models, datasets, tools',            type: 'blog',     quality: 'primary'   },
  { name: 'Unite.AI',              url: 'https://unite.ai/feed',                             description: 'AI industry news and interviews',                type: 'news',     quality: 'secondary' },
  { name: 'AI Trends',             url: 'https://www.aitrends.com/feed/',                    description: 'Enterprise AI adoption stories',                 type: 'news',     quality: 'secondary' },
  { name: 'The Batch (deeplearning.ai)', url: 'https://read.deeplearning.ai/the-batch/feed/', description: 'Andrew Ng weekly AI digest',                  type: 'news',     quality: 'primary'   },
];

export const AI_ML_RESEARCH_RSS: RSSSource[] = [
  { name: 'arXiv cs.AI',    url: 'https://rss.arxiv.org/rss/cs.AI',   description: 'AI research preprints',          type: 'research', quality: 'primary' },
  { name: 'arXiv cs.LG',    url: 'https://rss.arxiv.org/rss/cs.LG',   description: 'Machine learning preprints',     type: 'research', quality: 'primary' },
  { name: 'arXiv cs.CV',    url: 'https://rss.arxiv.org/rss/cs.CV',   description: 'Computer vision preprints',      type: 'research', quality: 'primary' },
  { name: 'Papers With Code',url: 'https://paperswithcode.com/latest.rss', description: 'ML papers + implementation', type: 'research', quality: 'primary' },
  { name: 'BAIR Blog',      url: 'https://bair.berkeley.edu/blog/feed.xml', description: 'Berkeley AI research blog', type: 'research', quality: 'primary' },
  { name: 'DeepMind Blog',  url: 'https://deepmind.google/blog/rss.xml', description: 'DeepMind research breakthroughs', type: 'research', quality: 'primary' },
];

export const AI_ML_JOBS: JobSource[] = [
  { name: 'AI Jobs',          url: 'https://aijobs.net',        rssUrl: 'https://aijobs.net/feed/',       type: 'rss'    },
  { name: 'ML Jobs',          url: 'https://www.mljobs.com',    type: 'scrape'  },
  { name: 'Remote AI Jobs',   url: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=machine+learning', rssUrl: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=machine+learning', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 04 — SOFTWARE ENGINEERING
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const SOFTWARE_NEWS_RSS: RSSSource[] = [
  { name: 'Hacker News',      url: 'https://news.ycombinator.com/rss',              description: 'Tech community front page',                    type: 'news',     quality: 'primary'   },
  { name: 'The Pragmatic Eng',url: 'https://newsletter.pragmaticengineer.com/feed', description: 'Senior engineering insights + big tech news',  type: 'blog',     quality: 'primary'   },
  { name: 'InfoQ',            url: 'https://feed.infoq.com',                        description: 'Software engineering news and patterns',       type: 'news',     quality: 'primary'   },
  { name: 'GitHub Blog',      url: 'https://github.blog/feed/',                     description: 'GitHub product + engineering updates',         type: 'blog',     quality: 'primary'   },
  { name: 'DEV Community',    url: 'https://dev.to/feed',                           description: 'Developer community articles',                 type: 'community',quality: 'secondary' },
  { name: 'Smashing Magazine',url: 'https://www.smashingmagazine.com/feed/',        description: 'Web design and front-end engineering',         type: 'blog',     quality: 'secondary' },
  { name: 'CSS-Tricks',       url: 'https://css-tricks.com/feed/',                 description: 'Frontend techniques + React',                  type: 'blog',     quality: 'secondary' },
  { name: 'Vercel Blog',      url: 'https://vercel.com/blog/rss.xml',              description: 'Next.js + deployment + frontend',              type: 'blog',     quality: 'primary'   },
];

export const SOFTWARE_RESEARCH_RSS: RSSSource[] = [
  { name: 'ACM Queue',        url: 'https://queue.acm.org/rss/feeds/queuecontent.xml', description: 'Practitioner-focused CS research',        type: 'research', quality: 'primary' },
  { name: 'IEEE Software',    url: 'https://ieeexplore.ieee.org/rss/TOC18.XML',        description: 'IEEE software engineering journal',       type: 'research', quality: 'primary' },
];

export const SOFTWARE_JOBS: JobSource[] = [
  { name: 'We Work Remotely', url: 'https://weworkremotely.com',  rssUrl: 'https://weworkremotely.com/remote-jobs.rss', type: 'rss'   },
  { name: 'Remote OK',        url: 'https://remoteok.com',        rssUrl: 'https://remoteok.com/remote-dev-jobs.rss',  type: 'rss'   },
  { name: 'Jobicy Dev Jobs',  url: 'https://jobicy.com/feed/?job_categories=dev', rssUrl: 'https://jobicy.com/feed/?job_categories=dev', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 05 — CLOUD & DEVOPS
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const CLOUD_DEVOPS_RSS: RSSSource[] = [
  { name: 'AWS News Blog',       url: 'https://aws.amazon.com/blogs/aws/feed/',         description: 'AWS product launches and tutorials',        type: 'blog', quality: 'primary'   },
  { name: 'Google Cloud Blog',   url: 'https://cloud.google.com/blog/rss.xml',          description: 'GCP product and engineering updates',       type: 'blog', quality: 'primary'   },
  { name: 'Azure Updates',       url: 'https://azurecomcdn.azureedge.net/en-us/updates/feed/', description: 'Microsoft Azure product news',       type: 'blog', quality: 'primary'   },
  { name: 'HashiCorp Blog',      url: 'https://www.hashicorp.com/blog/feed.xml',        description: 'Terraform, Vault, infrastructure-as-code',  type: 'blog', quality: 'primary'   },
  { name: 'CNCF Blog',           url: 'https://www.cncf.io/feed/',                      description: 'Cloud Native Computing Foundation news',    type: 'blog', quality: 'primary'   },
  { name: 'KubeWeekly',          url: 'https://kubeweekly.io/rss/',                     description: 'Kubernetes weekly digest',                  type: 'news', quality: 'secondary' },
  { name: 'The New Stack',       url: 'https://thenewstack.io/feed/',                   description: 'Cloud native + DevOps news',                type: 'news', quality: 'primary'   },
];

export const CLOUD_DEVOPS_JOBS: JobSource[] = [
  { name: 'DevOps Jobs',   url: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=devops', rssUrl: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=devops', type: 'rss' },
  { name: 'Cloud Jobs',    url: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=cloud',  rssUrl: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=cloud',  type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 06 — CYBERSECURITY
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const CYBERSECURITY_RSS: RSSSource[] = [
  { name: 'Krebs on Security',  url: 'https://krebsonsecurity.com/feed/',               description: 'Investigative cybersecurity journalism',     type: 'news',     quality: 'primary'   },
  { name: 'Bleeping Computer',  url: 'https://www.bleepingcomputer.com/feed/',           description: 'Breaking cyber news + malware alerts',       type: 'news',     quality: 'primary'   },
  { name: 'SANS Internet Storm',url: 'https://isc.sans.edu/rssfeed.xml',                description: 'SANS daily threat intelligence',             type: 'news',     quality: 'primary'   },
  { name: 'CISA Alerts',        url: 'https://www.cisa.gov/uscert/ncas/alerts.xml',     description: 'US govt cybersecurity advisories',           type: 'news',     quality: 'primary'   },
  { name: 'Threatpost',         url: 'https://threatpost.com/feed/',                    description: 'Security news + vulnerability reports',      type: 'news',     quality: 'primary'   },
  { name: 'PortSwigger Research',url: 'https://portswigger.net/research/rss',           description: 'Web security + Burp Suite research',        type: 'research', quality: 'primary'   },
  { name: 'Offensive Security', url: 'https://www.offensive-security.com/feed/',        description: 'Pen test tools and techniques',             type: 'blog',     quality: 'primary'   },
  { name: 'Cyber Security Hub', url: 'https://www.cshub.com/rss-feeds',                description: 'CISO and enterprise security news',          type: 'news',     quality: 'secondary' },
];

export const CYBERSECURITY_JOBS: JobSource[] = [
  { name: 'CyberSecJobs',    url: 'https://www.cybersecjobs.com',      type: 'scrape' },
  { name: 'InfoSec Jobs',    url: 'https://infosec-jobs.com',          rssUrl: 'https://infosec-jobs.com/feed/', type: 'rss' },
  { name: 'Jobicy Security', url: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=security', rssUrl: 'https://jobicy.com/feed/?job_categories=dev&search_keywords=security', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 07 — DATA SCIENCE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const DATA_SCIENCE_RSS: RSSSource[] = [
  { name: 'Towards Data Science', url: 'https://towardsdatascience.com/feed',         description: 'Community-driven data science articles',      type: 'blog',     quality: 'primary'   },
  { name: 'KDnuggets',           url: 'https://www.kdnuggets.com/feed',               description: 'Data mining and analytics news',              type: 'news',     quality: 'primary'   },
  { name: 'Datanami',            url: 'https://www.datanami.com/feed/',               description: 'Big data and analytics industry news',        type: 'news',     quality: 'primary'   },
  { name: 'O\'Reilly Data',      url: 'https://www.oreilly.com/radar/topics/data/feed/', description: 'O\'Reilly data science insights',         type: 'blog',     quality: 'primary'   },
  { name: 'Data Elixir',         url: 'https://dataelixir.com/rss/',                 description: 'Weekly data science newsletter',              type: 'news',     quality: 'secondary' },
  { name: 'arXiv stat.ML',       url: 'https://rss.arxiv.org/rss/stat.ML',           description: 'Statistical machine learning preprints',      type: 'research', quality: 'primary'   },
];

export const DATA_SCIENCE_JOBS: JobSource[] = [
  { name: 'Data Science Jobs',   url: 'https://jobicy.com/feed/?job_categories=data-science', rssUrl: 'https://jobicy.com/feed/?job_categories=data-science', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 08 — DATA ANALYSIS & BI
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const DATA_BI_RSS: RSSSource[] = [
  { name: 'dbt Blog',            url: 'https://blog.getdbt.com/rss/',                  description: 'Analytics engineering community',             type: 'blog',     quality: 'primary'   },
  { name: 'Mode Analytics Blog', url: 'https://mode.com/blog/rss.xml',                 description: 'BI and analytics product insights',           type: 'blog',     quality: 'primary'   },
  { name: 'Power BI Blog',       url: 'https://powerbi.microsoft.com/en-us/blog/feed/',description: 'Microsoft Power BI product updates',          type: 'blog',     quality: 'primary'   },
  { name: 'Tableau Blog',        url: 'https://www.tableau.com/blog/rss.xml',          description: 'Tableau visualization techniques',            type: 'blog',     quality: 'secondary' },
  { name: 'Locally Optimistic',  url: 'https://locallyoptimistic.com/feed/',           description: 'Data teams and analytics leadership',         type: 'blog',     quality: 'primary'   },
];

export const DATA_BI_JOBS: JobSource[] = [
  { name: 'BI Analyst Jobs', url: 'https://jobicy.com/feed/?job_categories=data-science&search_keywords=analyst', rssUrl: 'https://jobicy.com/feed/?job_categories=data-science&search_keywords=analyst', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 09 — DATA ENGINEERING
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const DATA_ENGINEERING_RSS: RSSSource[] = [
  { name: 'Databricks Blog',    url: 'https://www.databricks.com/blog/feed',           description: 'Lakehouse, Spark, Delta Lake updates',        type: 'blog', quality: 'primary'   },
  { name: 'dbt Blog',          url: 'https://blog.getdbt.com/rss/',                   description: 'Analytics engineering + data modelling',      type: 'blog', quality: 'primary'   },
  { name: 'Airflow Blog',       url: 'https://airflow.apache.org/blog/feed.xml',       description: 'Apache Airflow orchestration updates',        type: 'blog', quality: 'primary'   },
  { name: 'Fivetran Blog',      url: 'https://www.fivetran.com/blog/feed',             description: 'ELT data integration news',                   type: 'blog', quality: 'secondary' },
  { name: 'Confluent Blog',     url: 'https://www.confluent.io/blog/feed/',            description: 'Apache Kafka + streaming data',               type: 'blog', quality: 'primary'   },
  { name: 'Seattle Data Guy',   url: 'https://seattledataguy.substack.com/feed',      description: 'Data engineering career + technical content', type: 'blog', quality: 'primary'   },
];

export const DATA_ENGINEERING_JOBS: JobSource[] = [
  { name: 'Data Engineer Jobs', url: 'https://jobicy.com/feed/?job_categories=data-science&search_keywords=data+engineer', rssUrl: 'https://jobicy.com/feed/?job_categories=data-science&search_keywords=data+engineer', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 10 — SUPPLY CHAIN & OPERATIONS
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const SUPPLY_CHAIN_RSS: RSSSource[] = [
  { name: 'Supply Chain Digital',   url: 'https://supplychaindigital.com/rss',             description: 'Global supply chain technology news',         type: 'news',     quality: 'primary'   },
  { name: 'Supply Chain Dive',      url: 'https://www.supplychaindive.com/feeds/news/',    description: 'Industry news + deep dives',                  type: 'news',     quality: 'primary'   },
  { name: 'Logistics Management',   url: 'https://www.logisticsmgmt.com/rss_feeds/',       description: 'Logistics and warehousing management',        type: 'news',     quality: 'primary'   },
  { name: 'Gartner Supply Chain',   url: 'https://www.gartner.com/en/rss/supply-chain',   description: 'Analyst research on supply chain tech',       type: 'research', quality: 'primary'   },
  { name: 'MIT SCM Research',       url: 'https://ctl.mit.edu/news/rss.xml',               description: 'MIT Center for Transportation + Logistics',   type: 'research', quality: 'primary'   },
  { name: 'FreightWaves',           url: 'https://www.freightwaves.com/news/feed',          description: 'Freight markets, rates, logistics data',      type: 'news',     quality: 'primary'   },
  { name: 'Spend Matters',          url: 'https://spendmatters.com/feed/',                  description: 'Procurement and sourcing intelligence',       type: 'news',     quality: 'primary'   },
];

export const SUPPLY_CHAIN_RESEARCH_RSS: RSSSource[] = [
  { name: 'J. of Supply Chain Mgmt',url: 'https://onlinelibrary.wiley.com/feed/1745493x/most-recent', description: 'Academic supply chain research',  type: 'research', quality: 'primary' },
  { name: 'Institute for SCM',      url: 'https://ctl.mit.edu/research/rss.xml',             description: 'MIT supply chain research papers',        type: 'research', quality: 'primary' },
];

export const SUPPLY_CHAIN_SENTIMENT: SentimentSource[] = [
  {
    name: 'ISM PMI',
    url: 'https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/',
    assetClass: 'general',
  },
  {
    name: 'Baltic Dry Index',
    url: 'https://www.balticsea.no/reports',
    assetClass: 'commodities',
  },
];

export const SUPPLY_CHAIN_JOBS: JobSource[] = [
  { name: 'APICS Jobs',         url: 'https://www.apics.org/career-resources/career-center',type: 'scrape' },
  { name: 'Supply Chain Jobs',  url: 'https://jobicy.com/feed/?search_keywords=supply+chain', rssUrl: 'https://jobicy.com/feed/?search_keywords=supply+chain', type: 'rss' },
  { name: 'Logistics Jobs',     url: 'https://jobicy.com/feed/?search_keywords=logistics',    rssUrl: 'https://jobicy.com/feed/?search_keywords=logistics',    type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 11 — PRODUCT & DESIGN
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const PRODUCT_DESIGN_RSS: RSSSource[] = [
  { name: 'Lenny\'s Newsletter',  url: 'https://www.lennysnewsletter.com/feed',         description: 'Product growth, metrics, hiring tactics',     type: 'blog',     quality: 'primary'   },
  { name: 'Mind the Product',     url: 'https://www.mindtheproduct.com/feed/',          description: 'Product management community',                type: 'news',     quality: 'primary'   },
  { name: 'Nielsen Norman Group', url: 'https://www.nngroup.com/feed/rss/',             description: 'UX research and design principles',           type: 'research', quality: 'primary'   },
  { name: 'UX Collective',        url: 'https://uxdesign.cc/feed',                      description: 'Design thinking and UX articles',             type: 'blog',     quality: 'secondary' },
  { name: 'Product Hunt',         url: 'https://www.producthunt.com/feed',              description: 'New product launches daily',                  type: 'news',     quality: 'secondary' },
  { name: 'Intercom Blog',        url: 'https://www.intercom.com/blog/feed/',           description: 'Product and customer experience',             type: 'blog',     quality: 'primary'   },
];

export const PRODUCT_DESIGN_JOBS: JobSource[] = [
  { name: 'Product Jobs',    url: 'https://jobicy.com/feed/?search_keywords=product+manager', rssUrl: 'https://jobicy.com/feed/?search_keywords=product+manager', type: 'rss' },
  { name: 'UX Jobs',         url: 'https://jobicy.com/feed/?job_categories=design-multimedia', rssUrl: 'https://jobicy.com/feed/?job_categories=design-multimedia', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 12 — DIGITAL MARKETING
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const DIGITAL_MARKETING_RSS: RSSSource[] = [
  { name: 'Search Engine Journal',   url: 'https://www.searchenginejournal.com/feed/',      description: 'SEO, SEM, social media marketing',           type: 'news',     quality: 'primary'   },
  { name: 'Moz Blog',                url: 'https://moz.com/blog/feed',                      description: 'SEO tactics and algorithm updates',           type: 'blog',     quality: 'primary'   },
  { name: 'Content Marketing Inst.', url: 'https://contentmarketinginstitute.com/feed/',    description: 'Content strategy and B2B marketing',         type: 'blog',     quality: 'primary'   },
  { name: 'Marketing Land',          url: 'https://martech.org/feed/',                      description: 'Marketing technology and data',               type: 'news',     quality: 'secondary' },
  { name: 'HubSpot Marketing Blog',  url: 'https://blog.hubspot.com/marketing/rss.xml',    description: 'Inbound marketing tactics + guides',          type: 'blog',     quality: 'secondary' },
];

export const DIGITAL_MARKETING_JOBS: JobSource[] = [
  { name: 'Marketing Jobs',   url: 'https://jobicy.com/feed/?job_categories=marketing', rssUrl: 'https://jobicy.com/feed/?job_categories=marketing', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 13 — FINTECH & BLOCKCHAIN (BROAD)
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const FINTECH_RSS: RSSSource[] = [
  { name: 'Fintech Nexus',       url: 'https://fintechnexus.com/feed/',                  description: 'Fintech industry news and events',            type: 'news',     quality: 'primary'   },
  { name: 'The Financial Brand', url: 'https://thefinancialbrand.com/feed/',             description: 'Banking and fintech strategy',                type: 'news',     quality: 'primary'   },
  { name: 'Finextra',            url: 'https://www.finextra.com/rss/channel.aspx',       description: 'Global fintech and payments news',            type: 'news',     quality: 'primary'   },
  { name: 'CB Insights Fintech', url: 'https://www.cbinsights.com/research/feed/',       description: 'Fintech funding + market analysis',           type: 'research', quality: 'primary'   },
  { name: 'Ledger Insights',     url: 'https://www.ledgerinsights.com/feed/',            description: 'Enterprise blockchain use cases',             type: 'news',     quality: 'primary'   },
];

export const FINTECH_JOBS: JobSource[] = [
  { name: 'Fintech Jobs',    url: 'https://jobicy.com/feed/?search_keywords=fintech', rssUrl: 'https://jobicy.com/feed/?search_keywords=fintech', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 14 — RENEWABLE ENERGY & ESG
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const ENERGY_ESG_RSS: RSSSource[] = [
  { name: 'BloombergNEF',        url: 'https://about.bnef.com/blog/feed/',              description: 'Energy transition research and data',         type: 'research', quality: 'primary'   },
  { name: 'CleanTechnica',       url: 'https://cleantechnica.com/feed/',                description: 'Clean energy news and EV coverage',           type: 'news',     quality: 'primary'   },
  { name: 'GreenBiz',            url: 'https://www.greenbiz.com/feeds/rss.xml',         description: 'Sustainable business and ESG',                type: 'news',     quality: 'primary'   },
  { name: 'S&P Global ESG',      url: 'https://www.spglobal.com/esg/news/rss',          description: 'ESG ratings and sustainability research',     type: 'research', quality: 'primary'   },
  { name: 'Energy Monitor',      url: 'https://www.energymonitor.ai/feed/',             description: 'Clean energy industry intelligence',          type: 'news',     quality: 'secondary' },
];

export const ENERGY_ESG_JOBS: JobSource[] = [
  { name: 'Green Jobs',    url: 'https://jobicy.com/feed/?search_keywords=sustainability', rssUrl: 'https://jobicy.com/feed/?search_keywords=sustainability', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 15 — PROJECT & PROGRAM MANAGEMENT
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const PROJECT_MGMT_RSS: RSSSource[] = [
  { name: 'PMI Blog',           url: 'https://www.pmi.org/learning/library/rss.xml',    description: 'Project Management Institute insights',       type: 'blog',     quality: 'primary'   },
  { name: 'Agile Alliance',     url: 'https://www.agilealliance.org/feed/',             description: 'Agile and scrum methodology news',            type: 'news',     quality: 'primary'   },
  { name: 'ProjectManagement.com', url: 'https://www.projectmanagement.com/rss/rss.cfm', description: 'PM tools, tips, and community',           type: 'news',     quality: 'secondary' },
];

export const PROJECT_MGMT_JOBS: JobSource[] = [
  { name: 'PM Jobs',    url: 'https://jobicy.com/feed/?search_keywords=project+manager', rssUrl: 'https://jobicy.com/feed/?search_keywords=project+manager', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 16 — HEALTHCARE (NON-CLINICAL)
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const HEALTHCARE_RSS: RSSSource[] = [
  { name: 'HIMSS News',         url: 'https://www.himss.org/news/rss',                 description: 'Healthcare IT and digital health',            type: 'news',     quality: 'primary'   },
  { name: 'Modern Healthcare',  url: 'https://www.modernhealthcare.com/rss/news.rss',  description: 'Healthcare business and operations',          type: 'news',     quality: 'primary'   },
  { name: 'Health IT Analytics',url: 'https://healthitanalytics.com/feed/',            description: 'Healthcare data and analytics',               type: 'news',     quality: 'primary'   },
];

export const HEALTHCARE_JOBS: JobSource[] = [
  { name: 'Healthcare Jobs', url: 'https://jobicy.com/feed/?job_categories=healthcare', rssUrl: 'https://jobicy.com/feed/?job_categories=healthcare', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 17 — LEGAL & COMPLIANCE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const LEGAL_COMPLIANCE_RSS: RSSSource[] = [
  { name: 'Compliance Week',    url: 'https://www.complianceweek.com/feed/',            description: 'Regulatory compliance news and analysis',     type: 'news',     quality: 'primary'   },
  { name: 'Law360',             url: 'https://www.law360.com/rss',                      description: 'Legal industry news',                         type: 'news',     quality: 'primary'   },
  { name: 'NIST News',          url: 'https://www.nist.gov/news-events/news/rss.xml',   description: 'Standards and cybersecurity frameworks',      type: 'news',     quality: 'primary'   },
];

export const LEGAL_COMPLIANCE_JOBS: JobSource[] = [
  { name: 'Legal Jobs',    url: 'https://jobicy.com/feed/?job_categories=legal', rssUrl: 'https://jobicy.com/feed/?job_categories=legal', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 18 — HUMAN RESOURCES
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const HR_RSS: RSSSource[] = [
  { name: 'SHRM News',       url: 'https://www.shrm.org/rss/pages/rss.aspx?feed=topics&id=&s=news', description: 'Society for HR Management news',      type: 'news',     quality: 'primary'   },
  { name: 'HR Dive',         url: 'https://www.hrdive.com/feeds/news/',                description: 'HR industry news and analysis',               type: 'news',     quality: 'primary'   },
  { name: 'Workday Blog',    url: 'https://blog.workday.com/en-us/rss.html',           description: 'HR technology and workforce trends',          type: 'blog',     quality: 'secondary' },
];

export const HR_JOBS: JobSource[] = [
  { name: 'HR Jobs',    url: 'https://jobicy.com/feed/?job_categories=hr', rssUrl: 'https://jobicy.com/feed/?job_categories=hr', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 19 — SALES & REVENUE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const SALES_RSS: RSSSource[] = [
  { name: 'HubSpot Sales Blog', url: 'https://blog.hubspot.com/sales/rss.xml',          description: 'Sales tactics and enablement',                type: 'blog',     quality: 'primary'   },
  { name: 'Salesforce Blog',    url: 'https://www.salesforce.com/blog/feed/',           description: 'CRM product + sales strategy',                type: 'blog',     quality: 'primary'   },
  { name: 'Sales Hacker',       url: 'https://www.saleshacker.com/feed/',               description: 'Modern B2B sales tactics',                    type: 'blog',     quality: 'primary'   },
];

export const SALES_JOBS: JobSource[] = [
  { name: 'Sales Jobs',    url: 'https://jobicy.com/feed/?job_categories=seller', rssUrl: 'https://jobicy.com/feed/?job_categories=seller', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 20 — WRITING & CONTENT
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const WRITING_CONTENT_RSS: RSSSource[] = [
  { name: 'Copyblogger',        url: 'https://copyblogger.com/feed/',                  description: 'Content marketing and copywriting',           type: 'blog',     quality: 'primary'   },
  { name: 'ProBlogger',         url: 'https://problogger.com/feed/',                   description: 'Blogging and content business',               type: 'blog',     quality: 'secondary' },
  { name: 'Contently',          url: 'https://contently.com/feed/',                    description: 'Content strategy and brand journalism',       type: 'blog',     quality: 'primary'   },
];

export const WRITING_JOBS: JobSource[] = [
  { name: 'Writing Jobs',    url: 'https://jobicy.com/feed/?job_categories=copywriting', rssUrl: 'https://jobicy.com/feed/?job_categories=copywriting', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 21 — CREATIVE & MEDIA
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const CREATIVE_MEDIA_RSS: RSSSource[] = [
  { name: 'Creative Bloq',      url: 'https://www.creativebloq.com/feeds.rss',         description: 'Graphic design and creative tools',           type: 'news',     quality: 'primary'   },
  { name: 'Awwwards Blog',      url: 'https://www.awwwards.com/blog/feed/',             description: 'Web design awards and trends',                type: 'news',     quality: 'secondary' },
  { name: 'Wired Design',       url: 'https://www.wired.com/tag/design/feed/',          description: 'Design and media culture',                    type: 'news',     quality: 'secondary' },
];

export const CREATIVE_JOBS: JobSource[] = [
  { name: 'Design Jobs',    url: 'https://jobicy.com/feed/?job_categories=design-multimedia', rssUrl: 'https://jobicy.com/feed/?job_categories=design-multimedia', type: 'rss' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELDS 22–29: SPECIALIZED / NICHE FEEDS
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

// Field 22: Specialized Engineering
export const SPECIALIZED_ENGINEERING_RSS: RSSSource[] = [
  { name: 'IEEE Spectrum',      url: 'https://spectrum.ieee.org/rss/fulltext',          description: 'IEEE engineering research and news',          type: 'research', quality: 'primary' },
  { name: 'Engineering.com',    url: 'https://www.engineering.com/rss/',               description: 'Engineering industry news',                   type: 'news',     quality: 'secondary' },
];

// Field 23: Real Estate & Construction
export const REAL_ESTATE_RSS: RSSSource[] = [
  { name: 'CoStar News',        url: 'https://www.costar.com/rss/news',                 description: 'Commercial real estate data and news',        type: 'news',     quality: 'primary' },
  { name: 'Bisnow',             url: 'https://www.bisnow.com/feed/',                    description: 'Commercial real estate industry',             type: 'news',     quality: 'secondary' },
  { name: 'Construction Dive',  url: 'https://www.constructiondive.com/feeds/news/',    description: 'Construction industry news',                  type: 'news',     quality: 'primary' },
];

// Field 24: Education Technology
export const EDTECH_RSS: RSSSource[] = [
  { name: 'EdSurge',            url: 'https://www.edsurge.com/rss',                     description: 'EdTech news and innovation',                  type: 'news',     quality: 'primary' },
  { name: 'EdTech Magazine',    url: 'https://edtechmagazine.com/higher/feed',           description: 'Higher ed technology',                       type: 'news',     quality: 'secondary' },
];

// Field 25: Logistics & Trade
export const LOGISTICS_TRADE_RSS: RSSSource[] = [
  { name: 'Journal of Commerce',url: 'https://www.joc.com/feed/',                       description: 'International trade and shipping',            type: 'news',     quality: 'primary' },
  { name: 'FreightWaves',       url: 'https://www.freightwaves.com/news/feed',           description: 'Freight markets and logistics data',          type: 'news',     quality: 'primary' },
];

// Field 26: Insurance & Actuarial
export const INSURANCE_RSS: RSSSource[] = [
  { name: 'Insurance Journal',  url: 'https://www.insurancejournal.com/feed/',           description: 'Insurance industry news',                     type: 'news',     quality: 'primary' },
  { name: 'The Actuary Magazine',url: 'https://www.theactuary.com/rss.xml',              description: 'Actuarial science and profession news',       type: 'news',     quality: 'primary' },
];

// Field 27: Public Sector & NGO
export const PUBLIC_SECTOR_RSS: RSSSource[] = [
  { name: 'Government Executive',url: 'https://www.govexec.com/rss/all/',               description: 'Federal government management',               type: 'news',     quality: 'primary' },
  { name: 'Devex',              url: 'https://www.devex.com/news/rss.xml',              description: 'International development and NGO news',      type: 'news',     quality: 'primary' },
];

// Field 28: Agriculture Technology
export const AGRITECH_RSS: RSSSource[] = [
  { name: 'AgFunder News',      url: 'https://agfundernews.com/feed/',                  description: 'Agri-food tech venture news',                 type: 'news',     quality: 'primary' },
  { name: 'AgWeb',              url: 'https://www.agweb.com/rss',                       description: 'Farm and agriculture industry news',          type: 'news',     quality: 'secondary' },
];

// Field 29: Computational Science
export const COMP_SCIENCE_RSS: RSSSource[] = [
  { name: 'Nature Comp Science',url: 'https://www.nature.com/natcomputsci.rss',         description: 'Nature computational science journal',        type: 'research', quality: 'primary' },
  { name: 'arXiv cs.NA',        url: 'https://rss.arxiv.org/rss/cs.NA',                description: 'Numerical analysis and scientific computing', type: 'research', quality: 'primary' },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// MARKET SENTIMENT — CROSS-FIELD
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const EQUITIES_SENTIMENT: SentimentSource[] = [
  { name: 'CNN Fear & Greed',     url: 'https://money.cnn.com/data/fear-and-greed/', apiEndpoint: 'https://production.dataviz.cnn.io/index/fearandgreed/graphdata', assetClass: 'equities'   },
  { name: 'AAII Sentiment Survey',url: 'https://www.aaii.com/sentimentsurvey',        assetClass: 'equities'   },
  { name: 'CBOE VIX',             url: 'https://www.cboe.com/tradable_products/vix/', assetClass: 'equities'   },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// LOOKUP TABLE: trackId → sources
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export type SourceBundle = {
  news:      RSSSource[];
  research:  RSSSource[];
  sentiment: SentimentSource[];
  jobs:      JobSource[];
  dataApis:  APISource[];
  govApis?:  APISource[];
  ecosystemRss?: RSSSource[];
};

export const TRACK_SOURCES: Record<string, SourceBundle> = {
  // ── Crypto
  'defi-research-analyst': {
    news:         STARKNET_ECOSYSTEM_RSS,
    research:     ONCHAIN_RESEARCH_RSS,
    sentiment:    CRYPTO_SENTIMENT,
    jobs:         CRYPTO_JOBS,
    dataApis:     DEFI_DATA_APIS,
    govApis:      CRYPTO_GOVERNANCE_APIS,
    ecosystemRss: CRYPTO_NEWS_RSS,
  },
  'onchain-analyst': {
    news:         CRYPTO_NEWS_RSS,
    research:     ONCHAIN_RESEARCH_RSS,
    sentiment:    CRYPTO_SENTIMENT,
    jobs:         CRYPTO_JOBS,
    dataApis:     DEFI_DATA_APIS,
    govApis:      CRYPTO_GOVERNANCE_APIS,
    ecosystemRss: STARKNET_ECOSYSTEM_RSS,
  },
  'smart-contract-developer': {
    news:         [...STARKNET_ECOSYSTEM_RSS, ...CRYPTO_NEWS_RSS.slice(0, 3)],
    research:     ONCHAIN_RESEARCH_RSS.slice(0, 2),
    sentiment:    CRYPTO_SENTIMENT,
    jobs:         CRYPTO_JOBS,
    dataApis:     [],
  },
  'blockchain-security-auditor': {
    news:         [...CYBERSECURITY_RSS.slice(0, 3), ...CRYPTO_NEWS_RSS.slice(0, 2)],
    research:     ONCHAIN_RESEARCH_RSS.slice(0, 2),
    sentiment:    CRYPTO_SENTIMENT,
    jobs:         [...CRYPTO_JOBS, ...CYBERSECURITY_JOBS],
    dataApis:     [],
  },
  'crypto-compliance-analyst': {
    news:         [...CRYPTO_NEWS_RSS.slice(0, 4), ...LEGAL_COMPLIANCE_RSS.slice(0, 2)],
    research:     ONCHAIN_RESEARCH_RSS.slice(0, 2),
    sentiment:    CRYPTO_SENTIMENT,
    jobs:         CRYPTO_JOBS,
    dataApis:     [],
  },
  'web3-product-manager': {
    news:         CRYPTO_NEWS_RSS,
    research:     [],
    sentiment:    CRYPTO_SENTIMENT,
    jobs:         CRYPTO_JOBS,
    dataApis:     [],
  },

  // ── Quant
  'quant-trader': {
    news:         QUANT_NEWS_RSS,
    research:     QUANT_RESEARCH_RSS,
    sentiment:    QUANT_SENTIMENT,
    jobs:         QUANT_JOBS,
    dataApis:     QUANT_MARKET_DATA_APIS,
  },
  'quant-developer': {
    news:         QUANT_NEWS_RSS.slice(0, 4),
    research:     QUANT_RESEARCH_RSS,
    sentiment:    QUANT_SENTIMENT,
    jobs:         QUANT_JOBS,
    dataApis:     QUANT_MARKET_DATA_APIS,
  },
  'quant-researcher': {
    news:         QUANT_NEWS_RSS.slice(0, 3),
    research:     QUANT_RESEARCH_RSS,
    sentiment:    QUANT_SENTIMENT,
    jobs:         QUANT_JOBS,
    dataApis:     QUANT_MARKET_DATA_APIS,
  },
  'financial-engineer': {
    news:         QUANT_NEWS_RSS,
    research:     QUANT_RESEARCH_RSS,
    sentiment:    QUANT_SENTIMENT,
    jobs:         QUANT_JOBS,
    dataApis:     QUANT_MARKET_DATA_APIS,
  },
  'risk-analyst-quant': {
    news:         QUANT_NEWS_RSS,
    research:     QUANT_RESEARCH_RSS,
    sentiment:    QUANT_SENTIMENT,
    jobs:         QUANT_JOBS,
    dataApis:     QUANT_MARKET_DATA_APIS,
  },

  // ── AI / ML
  'ai-engineer': {
    news:         AI_ML_NEWS_RSS,
    research:     AI_ML_RESEARCH_RSS,
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         AI_ML_JOBS,
    dataApis:     [],
  },
  'machine-learning-engineer': {
    news:         AI_ML_NEWS_RSS,
    research:     AI_ML_RESEARCH_RSS,
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         AI_ML_JOBS,
    dataApis:     [],
  },
  'llm-engineer': {
    news:         AI_ML_NEWS_RSS.slice(0, 5),
    research:     [...AI_ML_RESEARCH_RSS.slice(0, 3)],
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         AI_ML_JOBS,
    dataApis:     [],
  },
  'computer-vision-engineer': {
    news:         AI_ML_NEWS_RSS,
    research:     AI_ML_RESEARCH_RSS,
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         AI_ML_JOBS,
    dataApis:     [],
  },
  'mlops-engineer': {
    news:         [...AI_ML_NEWS_RSS.slice(0, 4), ...CLOUD_DEVOPS_RSS.slice(0, 3)],
    research:     AI_ML_RESEARCH_RSS.slice(0, 3),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         [...AI_ML_JOBS, ...CLOUD_DEVOPS_JOBS],
    dataApis:     [],
  },

  // ── Software Engineering
  'software-engineer': {
    news:         SOFTWARE_NEWS_RSS,
    research:     SOFTWARE_RESEARCH_RSS,
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         SOFTWARE_JOBS,
    dataApis:     [],
  },
  'frontend-engineer-react': {
    news:         SOFTWARE_NEWS_RSS,
    research:     SOFTWARE_RESEARCH_RSS.slice(0, 1),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         SOFTWARE_JOBS,
    dataApis:     [],
  },
  'backend-engineer-python': {
    news:         SOFTWARE_NEWS_RSS,
    research:     SOFTWARE_RESEARCH_RSS,
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         SOFTWARE_JOBS,
    dataApis:     [],
  },

  // ── Cloud & DevOps
  'cloud-devops': {
    news:         CLOUD_DEVOPS_RSS,
    research:     SOFTWARE_RESEARCH_RSS,
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         CLOUD_DEVOPS_JOBS,
    dataApis:     [],
  },

  // ── Cybersecurity
  'soc-analyst': {
    news:         CYBERSECURITY_RSS,
    research:     CYBERSECURITY_RSS.slice(4, 6),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         CYBERSECURITY_JOBS,
    dataApis:     [],
  },
  'penetration-tester': {
    news:         CYBERSECURITY_RSS,
    research:     CYBERSECURITY_RSS.slice(4, 6),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         CYBERSECURITY_JOBS,
    dataApis:     [],
  },
  'grc-analyst': {
    news:         [...CYBERSECURITY_RSS.slice(0, 3), ...LEGAL_COMPLIANCE_RSS],
    research:     CYBERSECURITY_RSS.slice(4, 6),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         [...CYBERSECURITY_JOBS, ...LEGAL_COMPLIANCE_JOBS],
    dataApis:     [],
  },

  // ── Data Science
  'data-scientist': {
    news:         DATA_SCIENCE_RSS,
    research:     [...AI_ML_RESEARCH_RSS.slice(0, 3)],
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         DATA_SCIENCE_JOBS,
    dataApis:     [],
  },

  // ── Data Analysis & BI
  'product-analyst': {
    news:         DATA_BI_RSS,
    research:     DATA_SCIENCE_RSS.slice(0, 3),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         DATA_BI_JOBS,
    dataApis:     [],
  },
  'bi-developer-power-bi': {
    news:         DATA_BI_RSS,
    research:     DATA_SCIENCE_RSS.slice(0, 2),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         DATA_BI_JOBS,
    dataApis:     [],
  },

  // ── Data Engineering
  'data-engineer': {
    news:         DATA_ENGINEERING_RSS,
    research:     DATA_SCIENCE_RSS.slice(0, 3),
    sentiment:    EQUITIES_SENTIMENT,
    jobs:         DATA_ENGINEERING_JOBS,
    dataApis:     [],
  },

  // ── Supply Chain
  'supply-chain-analyst': {
    news:         SUPPLY_CHAIN_RSS,
    research:     SUPPLY_CHAIN_RESEARCH_RSS,
    sentiment:    SUPPLY_CHAIN_SENTIMENT,
    jobs:         SUPPLY_CHAIN_JOBS,
    dataApis:     [],
  },
  'demand-planner': {
    news:         SUPPLY_CHAIN_RSS,
    research:     SUPPLY_CHAIN_RESEARCH_RSS,
    sentiment:    SUPPLY_CHAIN_SENTIMENT,
    jobs:         SUPPLY_CHAIN_JOBS,
    dataApis:     [],
  },
  'procurement-analyst': {
    news:         [...SUPPLY_CHAIN_RSS.slice(0, 3), ...SUPPLY_CHAIN_RSS.slice(6, 7)],
    research:     SUPPLY_CHAIN_RESEARCH_RSS,
    sentiment:    SUPPLY_CHAIN_SENTIMENT,
    jobs:         SUPPLY_CHAIN_JOBS,
    dataApis:     [],
  },
  'logistics-coordinator': {
    news:         [...SUPPLY_CHAIN_RSS.slice(0, 2), ...LOGISTICS_TRADE_RSS],
    research:     SUPPLY_CHAIN_RESEARCH_RSS,
    sentiment:    SUPPLY_CHAIN_SENTIMENT,
    jobs:         SUPPLY_CHAIN_JOBS,
    dataApis:     [],
  },
};

// ─── Lookup helper ────────────────────────────────────────────────────────────

export function getSourcesForTrack(trackId: string): SourceBundle | undefined {
  return TRACK_SOURCES[trackId];
}

export function getJobSourcesForTrack(trackId: string): JobSource[] {
  return TRACK_SOURCES[trackId]?.jobs ?? [];
}

export function getSentimentSourcesForTrack(trackId: string): SentimentSource[] {
  return TRACK_SOURCES[trackId]?.sentiment ?? EQUITIES_SENTIMENT;
}
