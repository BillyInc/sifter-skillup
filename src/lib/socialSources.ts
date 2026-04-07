/**
 * Sifter Skill_Up — Social Sources
 * Verified social handles and accounts for every field and track.
 * Covers: Twitter/X, Instagram, Facebook, Medium, and independent blogs.
 *
 * PLATFORM NOTES:
 *   Twitter/X  → backend fetches via Twitter API v2 (bearer token required)
 *                env: TWITTER_BEARER_TOKEN
 *   Instagram  → backend fetches via Facebook Graph API
 *                env: INSTAGRAM_ACCESS_TOKEN
 *   Facebook   → backend fetches via Graph API
 *                env: FACEBOOK_PAGE_ACCESS_TOKEN
 *   Medium     → public RSS available at medium.com/feed/@handle or
 *                medium.com/feed/publication-name — fetched directly
 *   Blogs      → public RSS — fetched directly
 *
 * HANDLE FORMAT:
 *   Twitter/X:  handle WITHOUT @  (e.g. "VitalikButerin")
 *   Instagram:  handle WITHOUT @
 *   Facebook:   page slug or numeric page ID
 *   Medium:     @handle or publication slug
 *   Blog URL:   full RSS URL
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'medium' | 'blog';

export type SocialAccountRole =
  | 'founder'
  | 'team'
  | 'opinion_leader'
  | 'researcher'
  | 'educator'
  | 'protocol_official'
  | 'media'
  | 'community';

export interface SocialAccount {
  name: string;
  platform: SocialPlatform;
  handle: string;           // Twitter handle, IG handle, FB page slug, Medium @handle
  rssUrl?: string;          // For medium and blogs: direct RSS URL
  role: SocialAccountRole;
  description: string;
  fields: string[];         // which field IDs this person is relevant to
  tracks: string[];         // specific track IDs (empty = all tracks in the field)
  verified: boolean;        // notable/verified account
}

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 01 — CRYPTO / WEB3
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const CRYPTO_SOCIAL: SocialAccount[] = [

  // ── Founders / Protocol Leads (Twitter/X) ────────────────────────────────

  { name: 'Vitalik Buterin',  platform: 'twitter', handle: 'VitalikButerin',
    role: 'founder',          description: 'Ethereum co-founder. Philosophy, scaling, ZK proofs.',
    fields: ['crypto'],       tracks: [],       verified: true },

  { name: 'Eli Ben-Sasson',   platform: 'twitter', handle: 'EliBenSasson',
    role: 'founder',          description: 'StarkWare CEO & co-founder. STARK cryptography, Starknet architecture.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','onchain-analyst','smart-contract-developer'], verified: true },

  { name: 'Uri Kolodny',      platform: 'twitter', handle: 'ukolodny',
    role: 'founder',          description: 'StarkWare co-founder & CEO. Ethereum L2 strategy.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','smart-contract-developer'], verified: true },

  { name: 'Hayden Adams',     platform: 'twitter', handle: 'haydenzadams',
    role: 'founder',          description: 'Uniswap creator. DEX mechanics, liquidity design.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Stani Kulechov',   platform: 'twitter', handle: 'StaniKulechov',
    role: 'founder',          description: 'Aave founder. Lending markets, DeFi primitives.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Itamar Lesuisse',  platform: 'twitter', handle: 'itamarl',
    role: 'founder',          description: 'Argent co-founder. Account abstraction, wallet UX.',
    fields: ['crypto'],       tracks: ['smart-contract-developer','defi-research-analyst'], verified: true },

  // ── Protocol Official Accounts (Twitter/X) ────────────────────────────────

  { name: 'Starknet',         platform: 'twitter', handle: 'Starknet',
    role: 'protocol_official',description: 'Official Starknet ecosystem announcements.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','onchain-analyst','smart-contract-developer'], verified: true },

  { name: 'StarkWare',        platform: 'twitter', handle: 'StarkWareLtd',
    role: 'protocol_official',description: 'StarkWare official — core protocol updates.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','smart-contract-developer'], verified: true },

  { name: 'Argent',           platform: 'twitter', handle: 'argentHQ',
    role: 'protocol_official',description: 'Argent wallet — AA and wallet news.',
    fields: ['crypto'],       tracks: ['smart-contract-developer','defi-research-analyst'], verified: true },

  { name: 'AVNU',             platform: 'twitter', handle: 'avnu_fi',
    role: 'protocol_official',description: 'AVNU DEX aggregator on Starknet.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Ekubo Protocol',   platform: 'twitter', handle: 'ekubo_protocol',
    role: 'protocol_official',description: 'Ekubo concentrated liquidity DEX on Starknet.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Vesu',             platform: 'twitter', handle: 'vesuxyz',
    role: 'protocol_official',description: 'Vesu lending protocol on Starknet.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Braavos Wallet',   platform: 'twitter', handle: 'myBraavos',
    role: 'protocol_official',description: 'Braavos — smart wallet on Starknet.',
    fields: ['crypto'],       tracks: ['smart-contract-developer'], verified: true },

  // ── Opinion Leaders / Researchers (Twitter/X) ────────────────────────────

  { name: 'Camila Russo',     platform: 'twitter', handle: 'CamilaRustop',
    role: 'media',            description: 'Founder of The Defiant. DeFi journalist and author.',
    fields: ['crypto'],       tracks: [],       verified: true },

  { name: 'Ignas | DeFi Research', platform: 'twitter', handle: 'ignas_defi',
    role: 'researcher',       description: 'Independent DeFi researcher. Yield strategies, protocol analysis.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Willy Woo',        platform: 'twitter', handle: 'woonomic',
    role: 'opinion_leader',   description: 'On-chain analyst. Bitcoin market cycle analysis.',
    fields: ['crypto'],       tracks: ['onchain-analyst'], verified: true },

  { name: 'Tascha',           platform: 'twitter', handle: 'TaschaLabs',
    role: 'researcher',       description: 'Crypto and macro researcher. Token economics analysis.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','onchain-analyst'], verified: true },

  { name: 'Arthur Hayes',     platform: 'twitter', handle: 'CryptoHayes',
    role: 'opinion_leader',   description: 'BitMEX co-founder. Macro × crypto analysis.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Hasu',             platform: 'twitter', handle: 'hasufl',
    role: 'researcher',       description: 'Strategic lead Flashbots. MEV, protocol economics.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','onchain-analyst'], verified: true },

  { name: 'Dan Robinson',     platform: 'twitter', handle: 'danrobinson',
    role: 'researcher',       description: 'Paradigm researcher. AMM theory, DeFi primitives.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'banteg',           platform: 'twitter', handle: 'bantg',
    role: 'team',             description: 'Yearn Finance core dev. DeFi protocol internals.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','smart-contract-developer'], verified: true },

  { name: 'Glassnode',        platform: 'twitter', handle: 'glassnode',
    role: 'media',            description: 'On-chain analytics platform.',
    fields: ['crypto'],       tracks: ['onchain-analyst','defi-research-analyst'], verified: true },

  { name: 'Token Terminal',   platform: 'twitter', handle: 'tokenterminal',
    role: 'media',            description: 'Protocol fundamentals and revenue data.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','onchain-analyst'], verified: true },

  // ── Facebook pages ────────────────────────────────────────────────────────

  { name: 'Starknet Foundation', platform: 'facebook', handle: 'StarknetFoundation',
    role: 'protocol_official',description: 'Official Starknet Foundation Facebook page.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','smart-contract-developer'], verified: true },

  { name: 'Ethereum Foundation', platform: 'facebook', handle: 'ethereumproject',
    role: 'protocol_official',description: 'Ethereum Foundation announcements and updates.',
    fields: ['crypto'],       tracks: [],       verified: true },

  { name: 'The Defiant',      platform: 'facebook', handle: 'thedefiantmedia',
    role: 'media',            description: 'The Defiant DeFi news — Facebook distribution.',
    fields: ['crypto'],       tracks: [],       verified: true },

  // ── Instagram ─────────────────────────────────────────────────────────────

  { name: 'Bankless',         platform: 'instagram', handle: 'banklesshq',
    role: 'media',            description: 'Bankless — DeFi education and culture.',
    fields: ['crypto'],       tracks: [],       verified: true },

  { name: 'Decrypt',          platform: 'instagram', handle: 'decryptmedia',
    role: 'media',            description: 'Decrypt crypto news on Instagram.',
    fields: ['crypto'],       tracks: [],       verified: true },

  { name: 'Cointelegraph',    platform: 'instagram', handle: 'cointelegraph',
    role: 'media',            description: 'Cointelegraph crypto news.',
    fields: ['crypto'],       tracks: [],       verified: true },

  // ── Medium publications ───────────────────────────────────────────────────

  { name: 'StarkWare Blog',   platform: 'medium', handle: 'starkware',
    rssUrl: 'https://medium.com/feed/starkware',
    role: 'protocol_official',description: 'StarkWare engineering and research posts.',
    fields: ['crypto'],       tracks: ['smart-contract-developer','defi-research-analyst'], verified: true },

  { name: 'Paradigm Research',platform: 'medium', handle: 'paradigm-xyz',
    rssUrl: 'https://medium.com/feed/paradigm-research',
    role: 'researcher',       description: 'Paradigm crypto research publication.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  { name: 'Messari',          platform: 'medium', handle: 'messari-io',
    rssUrl: 'https://medium.com/feed/messari-io',
    role: 'researcher',       description: 'Messari crypto research and intelligence.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','onchain-analyst'], verified: true },

  { name: 'Delphi Digital',   platform: 'medium', handle: 'delphi-digital',
    rssUrl: 'https://medium.com/feed/delphi-digital',
    role: 'researcher',       description: 'Delphi Digital research on DeFi and crypto markets.',
    fields: ['crypto'],       tracks: ['defi-research-analyst'], verified: true },

  // ── Independent blogs (RSS) ───────────────────────────────────────────────

  { name: 'Vitalik Buterin\'s Blog', platform: 'blog', handle: 'vitalik-blog',
    rssUrl: 'https://vitalik.eth.limo/feed.xml',
    role: 'founder',          description: 'Vitalik\'s long-form essays on crypto, governance, ZK.',
    fields: ['crypto'],       tracks: [],       verified: true },

  { name: 'Hasu\'s Research', platform: 'blog', handle: 'hasu-blog',
    rssUrl: 'https://uncommoncore.co/feed/',
    role: 'researcher',       description: 'MEV, protocol economics, crypto strategy research.',
    fields: ['crypto'],       tracks: ['defi-research-analyst','onchain-analyst'], verified: true },

  { name: 'The Defiant',      platform: 'blog', handle: 'thedefiant-blog',
    rssUrl: 'https://thedefiant.io/feed/',
    role: 'media',            description: 'The Defiant independent DeFi journalism.',
    fields: ['crypto'],       tracks: [],       verified: true },

  { name: 'Bankless Blog',    platform: 'blog', handle: 'bankless-blog',
    rssUrl: 'https://banklesshq.com/rss/',
    role: 'media',            description: 'Bankless — going bankless with DeFi.',
    fields: ['crypto'],       tracks: [],       verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 02 — QUANTITATIVE FINANCE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const QUANT_SOCIAL: SocialAccount[] = [

  // ── Twitter/X — Opinion Leaders ────────────────────────────────────────

  { name: 'Nassim Nicholas Taleb', platform: 'twitter', handle: 'nntaleb',
    role: 'opinion_leader',   description: 'Author of Black Swan. Risk, probability, quant finance philosophy.',
    fields: ['quant'],        tracks: ['quant-researcher','quant-trader','risk-analyst-quant'], verified: true },

  { name: 'Mohamed El-Erian',platform: 'twitter', handle: 'elerianm',
    role: 'opinion_leader',   description: 'Allianz Chief Economic Advisor. Macro economics, rates, Fed.',
    fields: ['quant'],        tracks: ['quant-trader','quant-researcher'], verified: true },

  { name: 'Barry Ritholtz',  platform: 'twitter', handle: 'ritholtz',
    role: 'opinion_leader',   description: 'Ritholtz Wealth Management. Market analysis, behavioral finance.',
    fields: ['quant'],        tracks: ['quant-trader'], verified: true },

  { name: 'Nouriel Roubini',  platform: 'twitter', handle: 'Nouriel',
    role: 'opinion_leader',   description: '"Dr. Doom". Global macro, risk, crisis analysis.',
    fields: ['quant'],        tracks: ['quant-researcher','risk-analyst-quant'], verified: true },

  { name: 'Peter L Brandt',  platform: 'twitter', handle: 'PeterLBrandt',
    role: 'opinion_leader',   description: '40+ years trading. Classical chart patterns, commodities.',
    fields: ['quant'],        tracks: ['quant-trader'], verified: true },

  { name: 'Morgan Housel',   platform: 'twitter', handle: 'morganhousel',
    role: 'opinion_leader',   description: 'Author of Psychology of Money. Behavioral finance, long-term investing.',
    fields: ['quant'],        tracks: ['quant-researcher','quant-trader'], verified: true },

  { name: 'Jim Bianco',      platform: 'twitter', handle: 'biancoresearch',
    role: 'researcher',       description: 'Bianco Research president. Fixed income, macro research.',
    fields: ['quant'],        tracks: ['quant-researcher','quant-trader'], verified: true },

  { name: 'ZeroHedge',       platform: 'twitter', handle: 'zerohedge',
    role: 'media',            description: 'Contrarian financial news and market analysis.',
    fields: ['quant'],        tracks: ['quant-trader'], verified: true },

  { name: 'AQR Capital',     platform: 'twitter', handle: 'AQRCapital',
    role: 'protocol_official',description: 'AQR — factor investing, systematic strategies.',
    fields: ['quant'],        tracks: ['quant-trader','quant-researcher','quant-developer'], verified: true },

  { name: 'Quantocracy',     platform: 'twitter', handle: 'quantocracy',
    role: 'community',        description: 'Curated quant blog aggregator. Best quant posts daily.',
    fields: ['quant'],        tracks: ['quant-trader','quant-developer','quant-researcher'], verified: true },

  { name: 'Cliff Asness',    platform: 'twitter', handle: 'CliffordAsness',
    role: 'founder',          description: 'AQR Capital co-founder. Factor investing, quant strategies.',
    fields: ['quant'],        tracks: ['quant-researcher','quant-trader'], verified: true },

  { name: 'Emanuel Derman',  platform: 'twitter', handle: 'EmanuelDerman',
    role: 'researcher',       description: 'Former Goldman quant. Author of My Life as a Quant.',
    fields: ['quant'],        tracks: ['financial-engineer','quant-researcher'], verified: true },

  { name: 'Two Sigma',       platform: 'twitter', handle: 'TwoSigma',
    role: 'protocol_official',description: 'Two Sigma — systematic trading and research.',
    fields: ['quant'],        tracks: ['quant-developer','quant-trader'], verified: true },

  { name: 'Linda Raschke',   platform: 'twitter', handle: 'LindaRaschke',
    role: 'opinion_leader',   description: '40+ years in futures. Technical analysis, trading systems.',
    fields: ['quant'],        tracks: ['quant-trader'], verified: true },

  // ── Instagram ─────────────────────────────────────────────────────────────

  { name: 'Bloomberg Markets',platform: 'instagram', handle: 'bloombergbusiness',
    role: 'media',            description: 'Bloomberg business and markets news.',
    fields: ['quant'],        tracks: [],       verified: true },

  { name: 'The Economist',   platform: 'instagram', handle: 'theeconomist',
    role: 'media',            description: 'The Economist global economic coverage.',
    fields: ['quant'],        tracks: [],       verified: true },

  // ── Facebook ──────────────────────────────────────────────────────────────

  { name: 'Bloomberg',       platform: 'facebook', handle: 'bloomberg',
    role: 'media',            description: 'Bloomberg official Facebook page.',
    fields: ['quant'],        tracks: [],       verified: true },

  { name: 'Financial Times', platform: 'facebook', handle: 'financialtimes',
    role: 'media',            description: 'FT news and analysis.',
    fields: ['quant'],        tracks: [],       verified: true },

  // ── Medium ────────────────────────────────────────────────────────────────

  { name: 'Quantopian Blog',  platform: 'medium', handle: 'quantopian',
    rssUrl: 'https://medium.com/feed/quantopian',
    role: 'community',        description: 'Quantopian — quant finance education and community.',
    fields: ['quant'],        tracks: ['quant-trader','quant-developer'], verified: true },

  { name: 'Towards Data Science (Finance)', platform: 'medium', handle: 'towards-data-science',
    rssUrl: 'https://towardsdatascience.com/tagged/quantitative-finance/feed',
    role: 'community',        description: 'Quant finance articles on Towards Data Science.',
    fields: ['quant'],        tracks: ['quant-developer','quant-researcher'], verified: true },

  // ── Blogs ─────────────────────────────────────────────────────────────────

  { name: 'Quantocracy',     platform: 'blog', handle: 'quantocracy-blog',
    rssUrl: 'https://quantocracy.com/feed/',
    role: 'community',        description: 'Curated quant blog posts — best of quant Twitter.',
    fields: ['quant'],        tracks: ['quant-trader','quant-developer','quant-researcher'], verified: true },

  { name: 'Marcos Lopez de Prado', platform: 'blog', handle: 'mlfinlab-blog',
    rssUrl: 'https://mlfinlab.readthedocs.io/en/latest/',
    role: 'researcher',       description: 'Advances in Financial ML author. Research blog.',
    fields: ['quant'],        tracks: ['quant-researcher','quant-developer'], verified: true },

  { name: 'Ernie Chan Blog',  platform: 'blog', handle: 'ernie-chan',
    rssUrl: 'https://epchan.blogspot.com/feeds/posts/default',
    role: 'researcher',       description: 'Ernest Chan — systematic trading, mean reversion.',
    fields: ['quant'],        tracks: ['quant-trader','quant-developer'], verified: true },

  { name: 'Jonathan Kinlay', platform: 'blog', handle: 'systematic-strategies',
    rssUrl: 'https://jonathankinlay.com/feed/',
    role: 'researcher',       description: 'Systematic trading strategies and research.',
    fields: ['quant'],        tracks: ['quant-trader','quant-developer'], verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 03 — AI & MACHINE LEARNING
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const AI_ML_SOCIAL: SocialAccount[] = [

  // ── Twitter/X — Founders / Key Researchers ────────────────────────────────

  { name: 'Yann LeCun',      platform: 'twitter', handle: 'ylecun',
    role: 'researcher',       description: 'Meta AI Chief Scientist. Deep learning pioneer. Turing Award.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer','llm-engineer'], verified: true },

  { name: 'Sam Altman',      platform: 'twitter', handle: 'sama',
    role: 'founder',          description: 'OpenAI CEO. AGI development, AI policy.',
    fields: ['ai-ml'],        tracks: ['ai-engineer','llm-engineer'], verified: true },

  { name: 'Andrew Ng',       platform: 'twitter', handle: 'AndrewYNg',
    role: 'educator',         description: 'deeplearning.ai founder. AI education democratization.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  { name: 'Andrej Karpathy', platform: 'twitter', handle: 'karpathy',
    role: 'researcher',       description: 'ex-Tesla AI / OpenAI. Neural nets, LLMs, education.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','llm-engineer','ai-engineer'], verified: true },

  { name: 'Greg Brockman',   platform: 'twitter', handle: 'gdb',
    role: 'founder',          description: 'OpenAI co-founder and president.',
    fields: ['ai-ml'],        tracks: ['ai-engineer','llm-engineer'], verified: true },

  { name: 'Demis Hassabis',  platform: 'twitter', handle: 'demishassabis',
    role: 'founder',          description: 'Google DeepMind CEO. AGI, AlphaFold, game-playing AI.',
    fields: ['ai-ml'],        tracks: ['ai-engineer','machine-learning-engineer'], verified: true },

  { name: 'Lex Fridman',     platform: 'twitter', handle: 'lexfridman',
    role: 'educator',         description: 'MIT AI researcher and podcaster. Deep learning, robotics.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  { name: 'François Chollet',platform: 'twitter', handle: 'fchollet',
    role: 'researcher',       description: 'Keras creator, Google. Intelligence, deep learning theory.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  { name: 'Ian Goodfellow',  platform: 'twitter', handle: 'goodfellow_ian',
    role: 'researcher',       description: 'GAN inventor, former Google Brain. Deep learning.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  { name: 'Jeff Dean',       platform: 'twitter', handle: 'JeffDean',
    role: 'researcher',       description: 'Google AI Chief Scientist. TensorFlow, deep learning systems.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','mlops-engineer'], verified: true },

  { name: 'Hugging Face',    platform: 'twitter', handle: 'huggingface',
    role: 'protocol_official',description: 'Hugging Face — open source ML models and datasets.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','llm-engineer','ai-engineer'], verified: true },

  { name: 'OpenAI',          platform: 'twitter', handle: 'OpenAI',
    role: 'protocol_official',description: 'OpenAI official. GPT, DALL-E, API announcements.',
    fields: ['ai-ml'],        tracks: ['ai-engineer','llm-engineer'], verified: true },

  { name: 'Google DeepMind', platform: 'twitter', handle: 'GoogleDeepMind',
    role: 'protocol_official',description: 'Google DeepMind research and product announcements.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  { name: 'Sebastian Raschka',platform: 'twitter', handle: 'rasbt',
    role: 'educator',         description: 'ML/AI researcher. Python ML book author. Practical tutorials.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer'], verified: true },

  { name: 'Santiago',        platform: 'twitter', handle: 'svpino',
    role: 'educator',         description: 'ML educator and engineer. AI for practitioners.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  // ── Instagram ────────────────────────────────────────────────────────────

  { name: 'OpenAI',          platform: 'instagram', handle: 'openai',
    role: 'protocol_official',description: 'OpenAI on Instagram — demos, product launches.',
    fields: ['ai-ml'],        tracks: [],       verified: true },

  { name: 'Google AI',       platform: 'instagram', handle: 'googleai',
    role: 'protocol_official',description: 'Google AI research and products on Instagram.',
    fields: ['ai-ml'],        tracks: [],       verified: true },

  // ── Facebook ─────────────────────────────────────────────────────────────

  { name: 'Meta AI',         platform: 'facebook', handle: 'MetaAI',
    role: 'protocol_official',description: 'Meta AI — LLaMA, FAIR research.',
    fields: ['ai-ml'],        tracks: ['llm-engineer','machine-learning-engineer'], verified: true },

  { name: 'MIT CSAIL',       platform: 'facebook', handle: 'MITCSAIL',
    role: 'researcher',       description: 'MIT Computer Science and AI Lab.',
    fields: ['ai-ml'],        tracks: [],       verified: true },

  // ── Medium ────────────────────────────────────────────────────────────────

  { name: 'Towards Data Science', platform: 'medium', handle: 'towards-data-science',
    rssUrl: 'https://towardsdatascience.com/feed',
    role: 'community',        description: 'Top ML/DS community publication on Medium.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  { name: 'OpenAI Blog',     platform: 'medium', handle: 'openai',
    rssUrl: 'https://openai.com/blog/rss.xml',
    role: 'protocol_official',description: 'OpenAI research blog (also via Medium).',
    fields: ['ai-ml'],        tracks: ['ai-engineer','llm-engineer'], verified: true },

  { name: 'Google AI Blog',  platform: 'blog', handle: 'google-ai-blog',
    rssUrl: 'https://ai.googleblog.com/feeds/posts/default',
    role: 'protocol_official',description: 'Google AI and DeepMind research announcements.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','ai-engineer'], verified: true },

  // ── Blogs ─────────────────────────────────────────────────────────────────

  { name: 'Andrej Karpathy Blog', platform: 'blog', handle: 'karpathy-blog',
    rssUrl: 'https://karpathy.github.io/feed.xml',
    role: 'researcher',       description: 'Deep neural nets, LLMs, education.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer','llm-engineer'], verified: true },

  { name: 'Chip Huyen Blog', platform: 'blog', handle: 'chip-huyen',
    rssUrl: 'https://huyenchip.com/feed',
    role: 'researcher',       description: 'ML systems engineering, MLOps, career.',
    fields: ['ai-ml'],        tracks: ['mlops-engineer','machine-learning-engineer'], verified: true },

  { name: 'Hugging Face Blog',platform: 'blog', handle: 'huggingface-blog',
    rssUrl: 'https://huggingface.co/blog/feed.xml',
    role: 'protocol_official',description: 'Hugging Face open source AI updates.',
    fields: ['ai-ml'],        tracks: ['llm-engineer','machine-learning-engineer'], verified: true },

  { name: 'Sebastian Raschka Blog', platform: 'blog', handle: 'rasbt-blog',
    rssUrl: 'https://sebastianraschka.com/rss_feed.xml',
    role: 'educator',         description: 'Practical ML tutorials and LLM research.',
    fields: ['ai-ml'],        tracks: ['machine-learning-engineer'], verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 04 — SOFTWARE ENGINEERING
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const SOFTWARE_SOCIAL: SocialAccount[] = [

  { name: 'DHH',             platform: 'twitter', handle: 'dhh',
    role: 'founder',          description: 'Rails creator, Basecamp co-founder. Opinionated engineering.',
    fields: ['software'],     tracks: ['backend-engineer-python','software-engineer'], verified: true },

  { name: 'Dan Abramov',     platform: 'twitter', handle: 'dan_abramov',
    role: 'team',             description: 'React core team. Redux creator. Frontend philosophy.',
    fields: ['software'],     tracks: ['frontend-engineer-react','software-engineer'], verified: true },

  { name: 'Kelsey Hightower',platform: 'twitter', handle: 'kelseyhightower',
    role: 'opinion_leader',   description: 'Google Staff Engineer. Kubernetes, cloud, DevOps advocacy.',
    fields: ['software','cloud-devops'], tracks: ['software-engineer','cloud-devops'], verified: true },

  { name: 'Kent C. Dodds',   platform: 'twitter', handle: 'kentcdodds',
    role: 'educator',         description: 'React testing and patterns educator.',
    fields: ['software'],     tracks: ['frontend-engineer-react'], verified: true },

  { name: 'Shawn Wang (swyx)',platform: 'twitter', handle: 'swyx',
    role: 'educator',         description: 'AI engineer and writer. Learning in public.',
    fields: ['software','ai-ml'], tracks: ['software-engineer','ai-engineer'], verified: true },

  { name: 'Simon Willison',  platform: 'twitter', handle: 'simonw',
    role: 'opinion_leader',   description: 'Django co-creator. Data journalism, LLM tooling.',
    fields: ['software'],     tracks: ['backend-engineer-python'], verified: true },

  { name: 'The Pragmatic Engineer', platform: 'twitter', handle: 'GergelyOrosz',
    role: 'media',            description: 'Big tech engineering, compensation, career insights.',
    fields: ['software'],     tracks: ['software-engineer'], verified: true },

  { name: 'GitHub',          platform: 'twitter', handle: 'github',
    role: 'protocol_official',description: 'GitHub — product launches and developer community.',
    fields: ['software'],     tracks: [],       verified: true },

  // ── Instagram ────────────────────────────────────────────────────────────

  { name: 'GitHub',          platform: 'instagram', handle: 'github',
    role: 'protocol_official',description: 'GitHub on Instagram — developer culture.',
    fields: ['software'],     tracks: [],       verified: true },

  // ── Medium ────────────────────────────────────────────────────────────────

  { name: 'Better Programming', platform: 'medium', handle: 'better-programming',
    rssUrl: 'https://medium.com/feed/better-programming',
    role: 'community',        description: 'Software engineering articles for practitioners.',
    fields: ['software'],     tracks: ['software-engineer','backend-engineer-python','frontend-engineer-react'], verified: true },

  { name: 'The Startup (Eng)',platform: 'medium', handle: 'swlh',
    rssUrl: 'https://medium.com/feed/swlh',
    role: 'community',        description: 'Engineering and product from The Startup.',
    fields: ['software'],     tracks: ['software-engineer'], verified: true },

  // ── Blogs ─────────────────────────────────────────────────────────────────

  { name: 'The Pragmatic Engineer Blog', platform: 'blog', handle: 'pragmatic-engineer-blog',
    rssUrl: 'https://newsletter.pragmaticengineer.com/feed',
    role: 'media',            description: 'Big tech software engineering deep-dives.',
    fields: ['software'],     tracks: ['software-engineer'], verified: true },

  { name: 'DHH Blog',        platform: 'blog', handle: 'dhh-blog',
    rssUrl: 'https://world.hey.com/dhh/feed.atom',
    role: 'founder',          description: 'DHH on software, work, and the industry.',
    fields: ['software'],     tracks: ['backend-engineer-python','software-engineer'], verified: true },

  { name: 'Simon Willison Blog', platform: 'blog', handle: 'simonw-blog',
    rssUrl: 'https://simonwillison.net/atom/everything/',
    role: 'opinion_leader',   description: 'Daily notes on code, AI, data tools.',
    fields: ['software'],     tracks: ['backend-engineer-python','ai-engineer'], verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 06 — CYBERSECURITY
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const CYBERSECURITY_SOCIAL: SocialAccount[] = [

  { name: 'Brian Krebs',     platform: 'twitter', handle: 'briankrebs',
    role: 'media',            description: 'Krebs on Security. Investigative cybersecurity journalism.',
    fields: ['cybersecurity'], tracks: [],      verified: true },

  { name: 'Nicole Perlroth', platform: 'twitter', handle: 'nicoleperlroth',
    role: 'media',            description: 'ex-NYT cyber reporter. Author of This Is How They Tell Me the World Ends.',
    fields: ['cybersecurity'], tracks: [],      verified: true },

  { name: 'Katie Moussouris', platform: 'twitter', handle: 'k8em0',
    role: 'opinion_leader',   description: 'Luta Security CEO. Bug bounty, vulnerability disclosure policy.',
    fields: ['cybersecurity'], tracks: ['penetration-tester','soc-analyst'], verified: true },

  { name: 'Jobert Abma',     platform: 'twitter', handle: 'jobertabma',
    role: 'founder',          description: 'HackerOne co-founder. Bug bounty, ethical hacking.',
    fields: ['cybersecurity'], tracks: ['penetration-tester'], verified: true },

  { name: 'SwiftOnSecurity', platform: 'twitter', handle: 'SwiftOnSecurity',
    role: 'community',        description: 'Popular anonymous security account. Practical infosec.',
    fields: ['cybersecurity'], tracks: ['soc-analyst','grc-analyst'], verified: true },

  { name: 'Marcus Hutchins',  platform: 'twitter', handle: 'MalwareTechBlog',
    role: 'researcher',       description: 'Malware researcher. Stopped WannaCry. Security education.',
    fields: ['cybersecurity'], tracks: ['soc-analyst','penetration-tester'], verified: true },

  { name: 'Tavis Ormandy',   platform: 'twitter', handle: 'taviso',
    role: 'researcher',       description: 'Google Project Zero. Vulnerability research.',
    fields: ['cybersecurity'], tracks: ['penetration-tester'], verified: true },

  { name: 'Dmitri Alperovitch', platform: 'twitter', handle: 'DAlperovitch',
    role: 'founder',          description: 'CrowdStrike co-founder, Silverado Policy Accelerator.',
    fields: ['cybersecurity'], tracks: ['soc-analyst','grc-analyst'], verified: true },

  { name: 'Heath Adams',     platform: 'twitter', handle: 'thecybermentor',
    role: 'educator',         description: 'TCM Security founder. Ethical hacking education.',
    fields: ['cybersecurity'], tracks: ['penetration-tester','soc-analyst'], verified: true },

  { name: 'SANS Institute',  platform: 'twitter', handle: 'SANSInstitute',
    role: 'educator',         description: 'SANS — cybersecurity training and research.',
    fields: ['cybersecurity'], tracks: ['soc-analyst','grc-analyst','penetration-tester'], verified: true },

  // ── Instagram ─────────────────────────────────────────────────────────────

  { name: 'SANS Institute',  platform: 'instagram', handle: 'sansinstitute',
    role: 'educator',         description: 'SANS training and certification content.',
    fields: ['cybersecurity'], tracks: [],      verified: true },

  // ── Medium ────────────────────────────────────────────────────────────────

  { name: 'InfoSec Write-ups',platform: 'medium', handle: 'infosec-writeups',
    rssUrl: 'https://medium.com/feed/bugbountywriteup',
    role: 'community',        description: 'Bug bounty write-ups and penetration testing.',
    fields: ['cybersecurity'], tracks: ['penetration-tester'], verified: true },

  // ── Blogs ─────────────────────────────────────────────────────────────────

  { name: 'Krebs on Security', platform: 'blog', handle: 'krebs-blog',
    rssUrl: 'https://krebsonsecurity.com/feed/',
    role: 'media',            description: 'Investigative cybersecurity journalism.',
    fields: ['cybersecurity'], tracks: ['soc-analyst','grc-analyst'], verified: true },

  { name: 'Troy Hunt Blog',  platform: 'blog', handle: 'troyhunt-blog',
    rssUrl: 'https://www.troyhunt.com/rss/',
    role: 'researcher',       description: 'haveibeenpwned creator. Web security, data breaches.',
    fields: ['cybersecurity'], tracks: ['soc-analyst','grc-analyst'], verified: true },

  { name: 'PortSwigger Research', platform: 'blog', handle: 'portswigger-blog',
    rssUrl: 'https://portswigger.net/research/rss',
    role: 'researcher',       description: 'Web security research from the Burp Suite team.',
    fields: ['cybersecurity'], tracks: ['penetration-tester'], verified: true },

  { name: 'Daniel Miessler', platform: 'blog', handle: 'danielmiessler-blog',
    rssUrl: 'https://danielmiessler.com/feed/',
    role: 'opinion_leader',   description: 'Security philosophy, tech, and society.',
    fields: ['cybersecurity'], tracks: ['grc-analyst','soc-analyst'], verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// FIELD 10 — SUPPLY CHAIN & OPERATIONS
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const SUPPLY_CHAIN_SOCIAL: SocialAccount[] = [

  { name: 'Supply Chain Dive',platform: 'twitter', handle: 'supplychaindive',
    role: 'media',            description: 'Supply chain news and analysis.',
    fields: ['supply-chain'], tracks: [],       verified: true },

  { name: 'Gartner Supply Chain', platform: 'twitter', handle: 'Gartner_SC',
    role: 'researcher',       description: 'Gartner supply chain research and rankings.',
    fields: ['supply-chain'], tracks: [],       verified: true },

  { name: 'MIT CTL',         platform: 'twitter', handle: 'mit_ctl',
    role: 'researcher',       description: 'MIT Center for Transportation and Logistics research.',
    fields: ['supply-chain'], tracks: [],       verified: true },

  { name: 'FreightWaves',    platform: 'twitter', handle: 'FreightWaves',
    role: 'media',            description: 'Freight markets and logistics data.',
    fields: ['supply-chain'], tracks: [],       verified: true },

  { name: 'Yossi Sheffi',    platform: 'twitter', handle: 'YossiSheffi',
    role: 'researcher',       description: 'MIT Engineering Systems Professor. Supply chain resilience.',
    fields: ['supply-chain'], tracks: ['supply-chain-analyst','demand-planner'], verified: true },

  // ── LinkedIn (primary for supply chain) ──────────────────────────────────
  // Note: LinkedIn doesn't have public RSS — backend uses LinkedIn API

  { name: 'Radu Palamariu',  platform: 'blog', handle: 'radu-palamariu-linkedin',
    rssUrl: 'https://www.linkedin.com/in/raduPalamariu/', // backend scrapes via LinkedIn API
    role: 'opinion_leader',   description: 'Alcott Global MD. Supply chain and logistics thought leader.',
    fields: ['supply-chain'], tracks: ['supply-chain-analyst'], verified: true },

  // ── Instagram ─────────────────────────────────────────────────────────────

  { name: 'Supply Chain Digital', platform: 'instagram', handle: 'supplychaindigital',
    role: 'media',            description: 'Supply chain digital transformation content.',
    fields: ['supply-chain'], tracks: [],       verified: true },

  // ── Medium ────────────────────────────────────────────────────────────────

  { name: 'Supply Chain Today', platform: 'medium', handle: 'supply-chain-today',
    rssUrl: 'https://medium.com/feed/supply-chain-today',
    role: 'community',        description: 'Supply chain articles and trends on Medium.',
    fields: ['supply-chain'], tracks: ['supply-chain-analyst'], verified: false },

  // ── Blogs ─────────────────────────────────────────────────────────────────

  { name: 'Supply Chain Quarterly', platform: 'blog', handle: 'scq-blog',
    rssUrl: 'https://www.supplychainquarterly.com/rss',
    role: 'media',            description: 'In-depth supply chain management articles.',
    fields: ['supply-chain'], tracks: ['supply-chain-analyst','procurement-analyst'], verified: true },

  { name: 'MIT SCM Blog',    platform: 'blog', handle: 'mit-scm-blog',
    rssUrl: 'https://ctl.mit.edu/news/rss.xml',
    role: 'researcher',       description: 'MIT Supply Chain Management research.',
    fields: ['supply-chain'], tracks: ['supply-chain-analyst','demand-planner'], verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// DATA SCIENCE / DATA ENGINEERING / BI
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const DATA_SOCIAL: SocialAccount[] = [

  { name: 'Vicki Boykis',    platform: 'twitter', handle: 'vboykis',
    role: 'opinion_leader',   description: 'Staff ML Engineer. Data science, systems, career.',
    fields: ['data-science','data-engineering'], tracks: ['data-scientist'], verified: true },

  { name: 'Cassie Kozyrkov', platform: 'twitter', handle: 'quaesita',
    role: 'researcher',       description: 'ex-Google Chief Decision Scientist. Statistics, ML.',
    fields: ['data-science'], tracks: ['data-scientist','product-analyst'], verified: true },

  { name: 'Randy Au',        platform: 'twitter', handle: 'randy_au',
    role: 'educator',         description: 'Quantitative UX researcher. Data quality, product analytics.',
    fields: ['data-science'], tracks: ['product-analyst'], verified: true },

  { name: 'dbt Labs',        platform: 'twitter', handle: 'dbt_labs',
    role: 'protocol_official',description: 'dbt — analytics engineering platform.',
    fields: ['data-engineering','data-analysis'], tracks: ['data-engineer','bi-developer-power-bi'], verified: true },

  { name: 'Towards Data Science', platform: 'twitter', handle: 'TDataScience',
    role: 'media',            description: 'Top data science publication on Medium.',
    fields: ['data-science','ai-ml'], tracks: [],  verified: true },

  // ── Medium ────────────────────────────────────────────────────────────────

  { name: 'Towards Data Science', platform: 'medium', handle: 'towards-data-science',
    rssUrl: 'https://towardsdatascience.com/feed',
    role: 'community',        description: 'Best data science and ML articles on Medium.',
    fields: ['data-science','data-engineering','data-analysis'], tracks: [], verified: true },

  { name: 'The Sequence',    platform: 'medium', handle: 'the-sequence',
    rssUrl: 'https://thesequence.substack.com/feed',
    role: 'media',            description: 'AI and ML research digest.',
    fields: ['data-science','ai-ml'], tracks: ['data-scientist'], verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// CLOUD & DEVOPS
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

export const CLOUD_DEVOPS_SOCIAL: SocialAccount[] = [

  { name: 'Kelsey Hightower',platform: 'twitter', handle: 'kelseyhightower',
    role: 'opinion_leader',   description: 'Google Staff Engineer. Kubernetes author and advocate.',
    fields: ['cloud-devops'], tracks: ['cloud-devops'], verified: true },

  { name: 'Charity Majors',  platform: 'twitter', handle: 'mipsytipsy',
    role: 'founder',          description: 'Honeycomb.io CTO. Observability, production engineering.',
    fields: ['cloud-devops'], tracks: ['cloud-devops'], verified: true },

  { name: 'Corey Quinn',     platform: 'twitter', handle: 'QuinnyPig',
    role: 'opinion_leader',   description: 'AWS cost optimization and cloud strategy.',
    fields: ['cloud-devops'], tracks: ['cloud-devops'], verified: true },

  { name: 'CNCF',            platform: 'twitter', handle: 'CloudNativeFdn',
    role: 'protocol_official',description: 'Cloud Native Computing Foundation — Kubernetes, Helm, etc.',
    fields: ['cloud-devops'], tracks: ['cloud-devops'], verified: true },

  { name: 'HashiCorp',       platform: 'twitter', handle: 'HashiCorp',
    role: 'protocol_official',description: 'HashiCorp — Terraform, Vault, infrastructure-as-code.',
    fields: ['cloud-devops'], tracks: ['cloud-devops'], verified: true },

  { name: 'The New Stack',   platform: 'twitter', handle: 'thenewstack',
    role: 'media',            description: 'Cloud native and DevOps news and analysis.',
    fields: ['cloud-devops'], tracks: ['cloud-devops'], verified: true },

  // ── Blogs ─────────────────────────────────────────────────────────────────

  { name: 'Charity Majors Blog', platform: 'blog', handle: 'charity-blog',
    rssUrl: 'https://charity.wtf/feed/',
    role: 'founder',          description: 'Observability, on-call, production philosophy.',
    fields: ['cloud-devops'], tracks: ['cloud-devops'], verified: true },
];

// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────
// MASTER LOOKUP TABLE
// ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ────

/**
 * All social accounts combined — source of truth.
 */
export const ALL_SOCIAL_SOURCES: SocialAccount[] = [
  ...CRYPTO_SOCIAL,
  ...QUANT_SOCIAL,
  ...AI_ML_SOCIAL,
  ...SOFTWARE_SOCIAL,
  ...CYBERSECURITY_SOCIAL,
  ...SUPPLY_CHAIN_SOCIAL,
  ...DATA_SOCIAL,
  ...CLOUD_DEVOPS_SOCIAL,
];

/**
 * Get social sources for a specific track.
 * Returns accounts relevant to that track, prioritised:
 *   1. Track-specific (tracks[] contains the trackId)
 *   2. Field-wide (tracks[] is empty = all tracks in field)
 */
export function getSocialSourcesForTrack(
  trackId: string,
  fieldId: string,
  platform?: SocialPlatform,
): SocialAccount[] {
  return ALL_SOCIAL_SOURCES.filter(s => {
    const fieldMatch = s.fields.includes(fieldId);
    if (!fieldMatch) return false;
    const trackMatch = s.tracks.length === 0 || s.tracks.includes(trackId);
    if (!trackMatch) return false;
    if (platform && s.platform !== platform) return false;
    return true;
  });
}

/**
 * Get all Medium RSS URLs for a field.
 * These can be fetched directly without backend proxy.
 */
export function getMediumRSSForField(fieldId: string): string[] {
  return ALL_SOCIAL_SOURCES
    .filter(s => s.fields.includes(fieldId) && (s.platform === 'medium' || s.platform === 'blog') && s.rssUrl)
    .map(s => s.rssUrl!);
}

/**
 * Get Twitter handles for a track — passed to backend API for timeline fetch.
 */
export function getTwitterHandlesForTrack(trackId: string, fieldId: string): string[] {
  return getSocialSourcesForTrack(trackId, fieldId, 'twitter').map(s => s.handle);
}

/**
 * Get Instagram handles for a field.
 */
export function getInstagramHandlesForField(fieldId: string): string[] {
  return ALL_SOCIAL_SOURCES
    .filter(s => s.fields.includes(fieldId) && s.platform === 'instagram')
    .map(s => s.handle);
}

/**
 * Get Facebook page slugs for a field.
 */
export function getFacebookPagesForField(fieldId: string): string[] {
  return ALL_SOCIAL_SOURCES
    .filter(s => s.fields.includes(fieldId) && s.platform === 'facebook')
    .map(s => s.handle);
}

// ─── Field ID mapping (track → field) ────────────────────────────────────────

export const TRACK_TO_FIELD: Record<string, string> = {
  'defi-research-analyst': 'crypto',
  'onchain-analyst': 'crypto',
  'smart-contract-developer': 'crypto',
  'blockchain-security-auditor': 'crypto',
  'crypto-compliance-analyst': 'crypto',
  'web3-product-manager': 'crypto',

  'quant-trader': 'quant',
  'quant-developer': 'quant',
  'quant-researcher': 'quant',
  'financial-engineer': 'quant',
  'risk-analyst-quant': 'quant',

  'ai-engineer': 'ai-ml',
  'machine-learning-engineer': 'ai-ml',
  'llm-engineer': 'ai-ml',
  'computer-vision-engineer': 'ai-ml',
  'mlops-engineer': 'ai-ml',

  'software-engineer': 'software',
  'frontend-engineer-react': 'software',
  'backend-engineer-python': 'software',

  'cloud-devops': 'cloud-devops',

  'soc-analyst': 'cybersecurity',
  'penetration-tester': 'cybersecurity',
  'grc-analyst': 'cybersecurity',

  'data-scientist': 'data-science',
  'product-analyst': 'data-analysis',
  'bi-developer-power-bi': 'data-analysis',
  'data-engineer': 'data-engineering',

  'supply-chain-analyst': 'supply-chain',
  'demand-planner': 'supply-chain',
  'procurement-analyst': 'supply-chain',
  'logistics-coordinator': 'supply-chain',
};
