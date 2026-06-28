// ⚡ Sifter LevelUp — Coinbase Deep Dive (Island 13, Levels 181–195)
// Part B of 2 — Levels 189–195

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';
import { COINBASE_LEVELS_A } from './coinbaseLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 189 — Coinbase Ventures: The Ecosystem Investment Portfolio
// ─────────────────────────────────────────────────────────────────────────────

const L189: IslandLevel = {
  id: 189, mechanic: 'match3', tier: 'pro',
  topic: 'Coinbase Ventures — Ecosystem Investment Signal',

  explanation: `
Coinbase Ventures has invested in over 300 crypto companies since 2018, making it one of the most active and strategically important crypto VCs. Its portfolio reads like a map of the current DeFi and crypto infrastructure landscape: Optimism, Compound, Uniswap, dYdX, The Graph, OpenSea (early stages), Etherscan, and dozens more.

The investment strategy is not pure financial return maximisation. Coinbase Ventures invests in protocols that drive on-chain activity — because every additional transaction on protocols Coinbase supports potentially generates Coinbase revenue through increased user activity, staking, and custody demand. It is a flywheel: invest in protocol → protocol drives user activity → users come to Coinbase → Coinbase revenue grows.

This creates a predictable signal for informed observers: when Coinbase Ventures announces an investment, it implies Coinbase believes that protocol will see meaningful adoption. The signal is imperfect (portfolio companies still fail) but statistically meaningful — Coinbase has seen the deals and teams that others haven't.

Key portfolio patterns to recognise: Coinbase Ventures consistently invests early in L2 infrastructure (Optimism was a portfolio company before Base launched on the OP Stack), DeFi primitives (Compound, Uniswap), and data/indexing infrastructure (The Graph). These investment themes reveal what Coinbase believes will be the on-chain rails of the future.

The practical implication for developers: if your project aligns with Coinbase Ventures' investment thesis (Base ecosystem, institutional DeFi access, compliance-friendly infrastructure), Coinbase Ventures is a natural funding target. They are explicitly strategic investors looking for synergy, not just financial return.
  `.trim(),

  fact: 'Coinbase Ventures: 300+ portfolio companies including Optimism, Uniswap, Compound, dYdX, The Graph. Strategy: invest in protocols that drive on-chain activity → increases Coinbase revenue. Portfolio = roadmap of Coinbase\'s ecosystem bets.',
  plain: 'Coinbase invests in crypto projects that will bring more users onto blockchain — because more users means more Coinbase revenue. Their investment portfolio is a signal of which protocols they think will win.',
  stars: [920, 1132, 1415], target: 1415, coins: 72,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Investment thesis alignment]',
      scenario: 'Priya is building a compliance layer for DeFi — a protocol that allows institutions to interact with DEXes while maintaining KYC/AML records. She evaluates funding sources.',
      outcome: "Coinbase Ventures fits her thesis perfectly: compliance infrastructure bridges institutional demand (Coinbase Prime clients) with DeFi. Coinbase benefits directly if her protocol enables institutional capital to flow through DeFi on Base. She pitches: \"Every institutional client who can now use DeFi through our compliance layer is a potential Coinbase Prime client.\" Coinbase Ventures' strategic interest aligns with her business model — they are investing for ecosystem reasons, not just return.",
    },
    {
      contextTag: '[Portfolio as signal]',
      scenario: 'Marcus notices Coinbase Ventures announces investments in three Layer 2 infrastructure projects in Q3 2023 — all OP Stack-based.',
      outcome: 'Reading the signal: Coinbase is building Base on the OP Stack and strategically backing the OP Stack ecosystem broadly. These investments indicate Coinbase expects the Superchain narrative to succeed and is positioning its venture portfolio accordingly. As an investor or developer: this signals Coinbase has conviction in OP Stack infrastructure. The same pattern preceded Base\'s launch — Coinbase invested in Optimism before Base existed, revealing their architectural preference.',
    },
    {
      contextTag: '[Portfolio company risk]',
      scenario: 'Keiko considers investing in a protocol because Coinbase Ventures backed it in 2021. She asks if this guarantees quality.',
      outcome: 'Coinbase Ventures backing is a positive signal, not a guarantee. The venture portfolio includes protocols that failed (some early DeFi experiments), protocols that succeeded but were delisted from Coinbase due to regulatory concerns, and protocols that thrived. The signal value: Coinbase saw the team, evaluated the product, and believed it aligned with their ecosystem vision. This is a higher bar than zero due diligence, but not a guarantee of success. She treats it as one factor in her evaluation, not a sufficient condition.',
    },
  ],

  keyTakeaway: 'Coinbase Ventures\' 300+ portfolio companies reflect a strategic map of what Coinbase believes will drive crypto adoption. Investment announcements signal ecosystem conviction — useful for developers seeking funding and investors identifying ecosystem bets. Not a guarantee, but a meaningful signal.',

  guidedPractice: [
    {
      question: 'Why does Coinbase Ventures invest in DeFi protocols when Coinbase\'s primary business is a centralised exchange?',
      options: [
        'Coinbase Ventures is a separate company with no strategic alignment to Coinbase exchange',
        'DeFi protocol adoption drives on-chain activity which increases demand for Coinbase\'s custody, staking, and Base-related services — the investments are strategically aligned with Coinbase\'s revenue flywheel',
        'Coinbase is required to invest in DeFi protocols as part of its SEC registration',
        'DeFi investments provide Coinbase with unlimited access to protocol liquidity',
      ],
      correct: 1,
      hint: 'If Uniswap has more users, what happens to Coinbase\'s potential user base?',
      explanation: 'The Coinbase flywheel: more DeFi users → more crypto users overall → larger addressable market for Coinbase services. Specifically: Compound users learn about DeFi → some move to Coinbase for fiat on-ramp. Optimism users discover L2 → Base becomes natural destination. The Graph improves DeFi data access → better user experiences → more adoption. Each portfolio company expands the crypto ecosystem, which expands Coinbase\'s potential market. This strategic alignment means Coinbase Ventures is genuinely willing to invest in protocols that compete with Coinbase in some areas if they grow the overall pie.',
    },
    {
      question: 'Coinbase Ventures invested in Optimism before Base launched on the OP Stack. What did this signal?',
      options: [
        'Coinbase was planning to acquire Optimism and wanted an ownership stake',
        'Coinbase had already decided to build Base on the OP Stack — the Optimism investment revealed architectural conviction before the public announcement',
        'Coinbase invested in all major L2s simultaneously without preference',
        'The investment was purely financial with no strategic implications for Coinbase\'s roadmap',
      ],
      correct: 1,
      hint: 'If you were going to build on a framework, would you also invest in its creator?',
      explanation: 'The Optimism investment was a strategic signal. Building a major L2 on someone\'s framework creates deep alignment — you want that framework to succeed, you benefit from its improvements, and you share governance in the resulting ecosystem. Coinbase Ventures\' early Optimism investment preceded Base by years, indicating Coinbase had already evaluated the OP Stack and committed to building on it. For savvy observers, the Ventures portfolio revealed Coinbase\'s architectural direction before official announcements.',
    },
    {
      question: 'How should a developer use Coinbase Ventures\' investment history in their own project research?',
      options: [
        'Automatically invest in any protocol Coinbase Ventures has backed',
        'Use it as one signal among many — CV backing indicates team quality and ecosystem alignment, but does not guarantee success. Projects in the portfolio that failed despite backing demonstrate its limitations',
        'Avoid Coinbase Ventures-backed projects to prevent Coinbase-centric ecosystem lock-in',
        'CV portfolio companies are guaranteed Coinbase exchange listings, making them lower-risk investments',
      ],
      correct: 1,
      hint: 'What does VC backing tell you? What does it not tell you?',
      explanation: 'Coinbase Ventures backing provides: team evaluation signal (CV did due diligence), ecosystem alignment signal (Coinbase believes this fits their strategy), and follow-on support signal (CV portfolio companies often get ecosystem support like Base grants, listing consideration). It does not provide: execution guarantee (teams fail regardless of investor quality), market timing signal (good protocols can fail in bad market cycles), or technical correctness guarantee. Use as one data point in a multi-factor evaluation.',
    },
    {
      question: 'What pattern in Coinbase Ventures\' portfolio reveals the infrastructure layers Coinbase thinks will win?',
      options: [
        'Coinbase Ventures only invests in consumer applications with 1M+ users',
        'Consistent early investment in L2 infrastructure, DeFi primitives (AMMs, lending), and data/indexing layer reveals Coinbase\'s belief in an on-chain future where these are the essential rails',
        'The portfolio is random — VC investing is unpredictable and no pattern exists',
        'Coinbase Ventures only invests in USD-denominated stablecoin projects',
      ],
      correct: 1,
      hint: 'If you look at Optimism, Compound, Uniswap, The Graph — what infrastructure layer do they each represent?',
      explanation: 'The portfolio layers reveal a thesis: L2 execution (Optimism, Base) → DeFi protocols running on L2 (Compound, Uniswap, dYdX) → data indexing for those protocols (The Graph) → secondary markets for assets created by those protocols (OpenSea). Each investment fills a role in the complete on-chain application stack. Coinbase is not just picking winners — they are backing the entire infrastructure required for mainstream on-chain adoption, which is also the infrastructure required for Coinbase\'s Base ecosystem to succeed.',
    },
    {
      question: 'A developer building on Base approaches Coinbase Ventures for funding. What makes their pitch most compelling to a strategic investor?',
      options: [
        'Demonstrate the highest possible revenue projections regardless of strategic fit',
        'Show how the product increases on-chain activity on Base specifically — more users, more transactions, more Coinbase revenue — aligning with Coinbase Ventures\' strategic flywheel rather than just financial return',
        'Offer Coinbase Ventures a majority stake to align financial incentives',
        'Demonstrate that the project does not compete with any existing Coinbase product',
      ],
      correct: 1,
      hint: 'What does Coinbase Ventures get from a strategic investment beyond financial return?',
      explanation: 'Strategic investor pitch framework: "Our protocol will bring X new users to Base, generating Y transactions per month, which drives Z in Coinbase sequencer revenue." This makes the ROI calculation include strategic ecosystem value, not just financial return. Coinbase Ventures can justify lower financial returns on investments that grow their ecosystem. A developer who understands this frames their pitch as "we grow Base" rather than "we generate returns" — and that framing opens the strategic investor\'s motivation to invest even when pure financial return is uncertain.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 190 — Regulatory Navigation: Coinbase vs SEC
// ─────────────────────────────────────────────────────────────────────────────

const L190: IslandLevel = {
  id: 190, mechanic: 'memory', tier: 'pro',
  topic: 'Regulatory Navigation — Coinbase vs SEC',

  explanation: `
In June 2023, the SEC sued Coinbase — alleging it operated as an unregistered securities exchange, broker, and clearing agency. The suit named 13 crypto assets it claimed were unregistered securities including SOL, ADA, MATIC, and others. Coinbase's response was to fight, not settle — calling the SEC's approach "regulation by enforcement" and filing for a writ of mandamus demanding courts compel the SEC to provide clear rulemaking.

This legal battle is the most consequential regulatory conflict in US crypto history. The outcome will define whether tokens can be sold on US exchanges and what compliance infrastructure crypto companies need to build.

The Howey Test is the legal framework at issue. A security requires: (1) investment of money, (2) in a common enterprise, (3) with expectation of profits, (4) primarily from the efforts of others. Coinbase argues that secondary market trading of tokens (buying ETH on an exchange from another user) does not meet the Howey test — there is no "common enterprise" receiving the investment money. The SEC argues the token itself meets Howey regardless of where it trades.

The practical impact on Coinbase users: Coinbase has delisted assets under regulatory pressure (XRP, various smaller tokens during SEC Wells notice periods). As the litigation proceeds, the list of "safe" assets narrows to those with clear non-security status (BTC, ETH) or explicit regulatory clarity. Users who hold assets the SEC targets may find them removed from Coinbase with short notice.

The legislative pathway: Coinbase's parallel lobbying strategy has produced bipartisan crypto legislation proposals — the FIT21 Act passed the House in 2024. If signed into law, this would create a statutory framework that supersedes SEC enforcement action and provide the legal clarity Coinbase needs.
  `.trim(),

  fact: 'SEC sued Coinbase June 2023 alleging unregistered securities exchange. Coinbase fighting — not settling. The Howey Test determines what is a security. FIT21 Act (passed House 2024) could provide legislative resolution. Outcome sets US crypto precedent.',
  plain: 'The SEC is suing Coinbase for listing tokens it calls securities. Coinbase is fighting back in court and in Congress. This legal battle will determine what tokens US exchanges can list and how they must operate.',
  stars: [980, 1206, 1507], target: 1507, coins: 76,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Howey Test applied]',
      scenario: 'Marcus asks: "Why does the SEC think SOL is a security but not Bitcoin?"',
      outcome: 'The SEC\'s reasoning: SOL was sold in a 2017 ICO by Solana Labs — investors gave money to Solana Labs with expectation of profit from Solana Labs\' development efforts (classic Howey). Bitcoin: no ICO, Satoshi created it pseudonymously and disappeared, no ongoing "efforts of others" from any identifiable organisation. The SEC distinguishes: tokens sold to fund a centralised team\'s development efforts meet Howey. Assets with sufficiently decentralised origins and governance may not. ETH navigated this by demonstrating progressive decentralisation — the SEC has not sued ETH as a security after initially questioning it.',
    },
    {
      contextTag: '[User impact — delisting]',
      scenario: 'Amara holds SOL on Coinbase when the SEC names SOL as a security in its June 2023 lawsuit.',
      outcome: 'Coinbase does not immediately delist SOL — it continues trading while the case proceeds. But the risk is clear: if courts confirm SOL meets the Howey test, Coinbase must delist to avoid operating as an unlicensed securities exchange. Amara\'s options: (1) hold on Coinbase and accept the risk of forced conversion to USD at an inopportune moment, (2) move SOL to a self-custody wallet (Phantom) and use offshore exchanges if needed, (3) sell at current prices to eliminate the regulatory risk. She moves to Phantom — self-custody eliminates exchange delisting risk.',
    },
    {
      contextTag: '[FIT21 Act implications]',
      scenario: 'Keiko asks what the FIT21 Act would mean for Coinbase if signed into law.',
      outcome: 'FIT21 (Financial Innovation and Technology for the 21st Century Act): creates a statutory framework distinguishing "digital commodities" (governed by CFTC, not SEC) from "digital securities" (SEC jurisdiction). Provides a pathway for tokens to transition from security to commodity classification as their networks decentralise. For Coinbase: clear listing criteria — tokens meeting commodity definition can be listed without SEC securities registration. Eliminates the current grey area where Coinbase lists tokens the SEC claims are unregistered securities. The lawsuit becomes moot if the law supersedes SEC\'s enforcement authority.',
    },
  ],

  keyTakeaway: 'The SEC-Coinbase lawsuit applies the Howey Test to determine which tokens are securities. The outcome sets US crypto precedent for exchange operations and token listings. Users holding SEC-targeted assets on Coinbase face delisting risk — self-custody eliminates this. FIT21 legislation offers a statutory resolution.',

  guidedPractice: [
    {
      question: 'What is the Howey Test and why is it central to the SEC-Coinbase lawsuit?',
      options: [
        'A test for whether a company has registered correctly with the SEC',
        'A four-part legal test determining whether an asset is a security: investment of money, common enterprise, expectation of profits, from the efforts of others. The SEC claims many crypto tokens meet all four parts',
        'A procedure for testing whether crypto exchanges comply with anti-money-laundering laws',
        'A technical test for whether a blockchain is sufficiently decentralised',
      ],
      correct: 1,
      hint: 'What 1946 Supreme Court case established the definition of a security that still applies today?',
      explanation: 'The Howey Test comes from SEC v. W.J. Howey Co. (1946) — about orange grove investments. The Court said investment contracts (securities) require: money invested, in a common enterprise, with expectation of profit, primarily from others\' efforts. The SEC applies this to crypto: investors bought tokens (money) from a company (common enterprise) expecting price appreciation (profit) from the team\'s development work (others\' efforts). If all four prongs are met: the token is a security and must be registered with the SEC. Coinbase disputes whether secondary market trading (user-to-user) meets prong 2 and 4.',
    },
    {
      question: 'Why did Coinbase choose to fight the SEC\'s lawsuit rather than settle?',
      options: [
        'Coinbase believed it would definitely win and settlement was unnecessary',
        'Settling would imply Coinbase operated illegally and require restructuring its business. Fighting creates legal clarity through court decisions that benefit the entire industry — a court ruling that secondary market crypto trading is not a securities exchange service removes the legal ambiguity for all US crypto companies',
        'The SEC did not offer Coinbase a settlement option',
        'Coinbase\'s lawyers advised that settlement costs would exceed litigation costs',
      ],
      correct: 1,
      hint: 'What precedent does a court decision set that a settlement cannot?',
      explanation: 'Settlements admit no liability and create no precedent — they cost money and restrict operations but do not resolve the underlying legal question. A court ruling that Coinbase did not operate as an unregistered securities exchange would set binding precedent: the entire US crypto industry could cite the case. If Coinbase wins: the SEC\'s "regulation by enforcement" approach is legally constrained. If Coinbase loses: at least the legal framework is clear and the industry can build compliant structures. Settlement perpetuates ambiguity — which the SEC has weaponised for years. Fighting is Coinbase\'s way of forcing clarity.',
    },
    {
      question: 'Why might a US Coinbase user hold SOL on Coinbase rather than in a self-custody wallet during SEC litigation?',
      options: [
        'Coinbase offers insurance on all assets held on the exchange during litigation',
        'They have not assessed the delisting risk or prefer the exchange convenience — but this exposes them to forced liquidation at an inopportune moment if Coinbase delists SOL under regulatory pressure',
        'Self-custody of SOL is technically impossible',
        'SEC litigation protects assets from market volatility',
      ],
      correct: 1,
      hint: 'What risk does keeping an asset on a regulated exchange create when regulators target that asset?',
      explanation: 'Holding SEC-targeted assets on a US-regulated exchange creates regulatory risk: if a court confirms SOL is a security, Coinbase must delist or face operating as an unlicensed securities exchange. Delisting often happens with short notice (days) and converts positions to USD at market price — potentially at an inopportune moment. Self-custody (Phantom wallet) eliminates exchange delisting risk entirely — you control your SOL regardless of what Coinbase does. The choice is regulatory risk (Coinbase) vs custody responsibility (Phantom). For assets under active SEC investigation, self-custody is the risk-minimising choice.',
    },
    {
      question: 'What would the FIT21 Act accomplish for US crypto exchanges if enacted?',
      options: [
        'It would give the SEC expanded authority over all crypto assets',
        'It would create a statutory framework distinguishing digital commodities (CFTC jurisdiction) from digital securities (SEC jurisdiction) — providing exchanges like Coinbase with clear listing criteria and resolving the regulatory ambiguity',
        'FIT21 would ban all crypto exchanges from operating in the US',
        'It would require all crypto tokens to register as securities within 90 days',
      ],
      correct: 1,
      hint: 'What is currently ambiguous that FIT21 would resolve?',
      explanation: 'Currently: no clear statutory definition of when a crypto asset is a commodity vs security. The SEC claims broad authority under existing securities laws. The CFTC claims authority for crypto commodities. Coinbase operates in grey area. FIT21 resolves this: creates specific statutory definitions, establishes a commodity-to-security classification pathway based on decentralisation, and gives CFTC clear authority over decentralised digital commodities. For exchanges: you know which assets need SEC registration and which can be listed as commodities. The current "regulation by enforcement" grey area disappears.',
    },
    {
      question: 'The SEC named SOL, ADA, and MATIC as securities in its Coinbase lawsuit. Why has Bitcoin not been classified as a security?',
      options: [
        'Bitcoin was specifically exempted from the Securities Act of 1933',
        'Bitcoin\'s origin (pseudonymous creator who disappeared, no ICO, no ongoing development organisation receiving investor funds) means it fails at least the "common enterprise" and "efforts of others" Howey prongs — no investors gave money to a team that then developed it',
        'The SEC lacks jurisdiction over assets traded on international exchanges',
        'Bitcoin was declared a commodity by the CFTC before the SEC could claim jurisdiction',
      ],
      correct: 1,
      hint: 'Who received the investment money in Bitcoin\'s "launch"? What development team does Bitcoin\'s price depend on?',
      explanation: 'Howey requires money invested in a common enterprise with profit from others\' efforts. Bitcoin: no ICO (no money raised by any company), Satoshi (creator) disappeared in 2010 (no ongoing "efforts of others" from an identifiable party), and the Bitcoin network is maintained by a decentralised developer community with no controlling organisation. The SEC cannot identify a "common enterprise" receiving investment money or an organisation whose "efforts" Bitcoin investors rely on for returns. SOL, ADA, MATIC all had structured sales to investors and identified development teams — making the Howey analysis more favourable to the SEC.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 191 — Coinbase vs Competitors: Binance, Kraken, Gemini
// ─────────────────────────────────────────────────────────────────────────────

const L191: IslandLevel = {
  id: 191, mechanic: 'chain', tier: 'pro',
  topic: 'Coinbase vs Competitors — Binance, Kraken, Gemini',

  explanation: `
The choice of exchange is one of the most consequential decisions a crypto user makes — affecting asset availability, fees, security, and regulatory exposure. In 2024, four exchanges dominate different segments of the global crypto market: Coinbase, Binance, Kraken, and Gemini.

Coinbase: US-focused, most regulated, NASDAQ-listed, highest retail fees (0.60%), most institutional infrastructure (Prime), strongest base integration, deepest compliance commitment. Weaker on: altcoin selection (regulatory caution limits listings), fee competitiveness for retail users, and global availability (restricted in many jurisdictions).

Binance: global market share leader, deepest liquidity across the widest altcoin selection (600+ tokens), lowest fees (0.10% taker, VIP tiers to 0.00%), strongest derivatives platform (Binance Futures). Weaker on: regulatory standing (DOJ settlement 2023, $4.3B fine, CEO Changpeng Zhao resigned and pled guilty to money laundering charges), US presence restricted (Binance.US is a separate, lower-liquidity entity), and institutional trust.

Kraken: strong European regulatory standing, SOC 2 audited, BaFin licensed in Germany, Bundesbank licensed, strong Proof of Reserves. Competitive fees. Derivatives available in non-US jurisdictions. Weaker on: US institutional services, Base integration, and consumer-friendly onboarding.

Gemini: New York-based, SOC 2 Type 2 audited, NYDFS licensed (the most demanding US state crypto regulator), insurance on custodied assets, strong institutional custody via Gemini Custody. Weaker on: altcoin selection, global availability, and consumer DeFi integration.

The selection framework: US institutional compliance → Gemini or Coinbase Prime. US retail → Coinbase (convenience) or Kraken (better fees). Global retail/active trader → Binance (liquidity and fees, accept regulatory risk). European institutional → Kraken.
  `.trim(),

  fact: 'Exchange comparison: Coinbase (US-regulated, highest fees, best institutional); Binance (deepest liquidity, lowest fees, regulatory issues post-2023 DOJ settlement); Kraken (EU-regulated, competitive fees, strong security); Gemini (NYDFS-licensed, SOC2, institutional-grade US custody).',
  plain: 'Four major exchanges: Coinbase (safest for US users, most expensive), Binance (cheapest, most coins, regulatory problems), Kraken (best for Europe, solid security), Gemini (most regulated US, institutional grade). Choose based on what matters most to you.',
  stars: [1040, 1280, 1600], target: 1600, coins: 80,
  simulatorLesson: 'advancedTrade',

  examples: [
    {
      contextTag: '[US retail user choosing]',
      scenario: 'James is a US retail user who trades $2,000/month in BTC and ETH, wants the simplest experience, and prioritises regulatory safety. He asks which exchange.',
      outcome: 'Coinbase fits: US-regulated, NASDAQ-listed, simple interface, USDC yield available, Base on-ramp for DeFi. Fee cost: $2,000 × 0.60% = $12/month on basic interface. If he uses Advanced Trade with limit orders: $2,000 × 0.40% = $8/month. Compared to Kraken (0.26% taker): $5.20/month. Fee difference: $2.80–$6.80/month. For simplicity and regulatory peace of mind, Coinbase is worth the small premium. If he were trading $20,000/month, the fee difference ($56–$68/month) would justify switching to Kraken or Advanced Trade optimisation.',
    },
    {
      contextTag: '[Active altcoin trader]',
      scenario: 'Amara actively trades altcoins and needs access to 200+ tokens, lowest fees, and a strong derivatives platform. She evaluates her options.',
      outcome: 'Binance dominates on her criteria: 600+ tokens (Coinbase has ~200), 0.10% taker fee vs Coinbase\'s 0.60%, comprehensive futures/options platform. The trade-off she must consciously accept: Binance\'s 2023 DOJ settlement (CZ pleaded guilty, $4.3B fine), US regulatory restrictions (Binance.US has lower liquidity), and the reputational risk of the exchange. She decides: use Binance for altcoin trading while keeping her BTC/ETH holdings on Coinbase. Asset diversification across exchanges reduces single-exchange failure risk.',
    },
    {
      contextTag: '[European DeFi developer]',
      scenario: 'Keiko is a German DeFi developer who needs an exchange for converting between EUR and crypto. She evaluates Kraken and Coinbase.',
      outcome: 'Kraken wins for her use case: BaFin licensed in Germany (her local regulator), Bundesbank licensed for payments, strong EUR pairs, competitive fees for EUR-crypto conversion (no "spread" on advanced interface). Coinbase operates in Germany but lacks the same depth of local regulatory integration. For EUR-denominated users, Kraken\'s European regulatory infrastructure is more relevant than Coinbase\'s US-centric compliance. She uses Kraken for EUR on-ramp and Coinbase for Base DeFi access.',
    },
  ],

  keyTakeaway: 'Exchange selection depends on regulatory jurisdiction, fee tolerance, altcoin needs, and institutional requirements. US regulatory compliance: Coinbase or Gemini. Fee minimisation and altcoin selection: Binance (accept regulatory risk). European compliance: Kraken. Never hold more than needed on any single exchange.',

  guidedPractice: [
    {
      question: 'Why did Binance\'s 2023 DOJ settlement matter for users holding funds there?',
      options: [
        'The settlement had no operational impact — Binance continued normally',
        'The $4.3B fine, CEO resignation/guilty plea for money laundering violations, and enhanced compliance requirements revealed that Binance had operated outside US legal frameworks for years — creating both historical risk and ongoing regulatory scrutiny that affects user confidence and potential future restrictions',
        'The settlement means Binance is now the most regulated exchange globally',
        'Users who held funds during the settlement period received compensation',
      ],
      correct: 1,
      hint: 'What does a money laundering plea from a CEO tell you about historical compliance culture?',
      explanation: 'CZ\'s money laundering guilty plea revealed that Binance knowingly processed transactions for sanctioned entities and lacked required AML controls for years. For users: this raises questions about historical compliance failures, whether regulatory restrictions might increase, and whether the new compliance culture is genuinely reformed or performative. The settlement also required enhanced monitoring — Binance now operates under DOJ oversight. Users holding large amounts on Binance should weigh this regulatory history against the platform\'s liquidity and fee advantages.',
    },
    {
      question: 'A US-based institutional investor wants to hold $10M in crypto within their existing compliance framework. Which exchange custody is most appropriate?',
      options: [
        'Binance — deepest liquidity and lowest fees for institutional trading',
        'Gemini or Coinbase Prime — both hold NYDFS or equivalent regulatory standing, SOC 2 certification, qualified custodian status, and crime insurance that fits institutional compliance frameworks',
        'Kraken — strongest security reputation globally',
        'Any major exchange is equivalent for institutional compliance purposes',
      ],
      correct: 1,
      hint: 'What regulatory criteria do US institutional compliance teams require for custodians?',
      explanation: 'US institutional compliance requirements: qualified custodian status (like a trust company or bank), SOC 2 Type 2 audit certification, crime insurance, regulatory registration. Gemini Custody: NYDFS-licensed trust company, SOC 2 Type 2 certified, insurance on custodied assets. Coinbase Prime: qualified custodian infrastructure, SOC 2 certified, up to $250M crime insurance, SEC-registered investment adviser for some services. Both meet institutional requirements. Binance (post-DOJ settlement) and Kraken (strong security but US institutional services less developed) are less suitable for this specific use case.',
    },
    {
      question: 'What is Gemini\'s primary competitive advantage over Coinbase for US institutional clients?',
      options: [
        'Gemini offers lower trading fees than Coinbase for all account sizes',
        'Gemini holds an NYDFS trust company charter — the most demanding US state crypto licence — providing regulatory standing comparable to a traditional bank custodian',
        'Gemini supports more crypto assets than Coinbase',
        'Gemini has a better consumer mobile app than Coinbase',
      ],
      correct: 1,
      hint: 'What makes NYDFS (New York Department of Financial Services) licensing significant?',
      explanation: 'NYDFS is considered the most rigorous state crypto regulator in the US — it requires comprehensive compliance infrastructure, capital requirements, cybersecurity standards, and ongoing examination. Gemini\'s NYDFS trust company charter puts it in the same regulatory category as traditional bank custodians. For New York-based institutions or those subject to NYDFS oversight, using an NYDFS-licensed custodian may be required rather than preferred. Coinbase\'s federal regulatory standing is strong but different — Gemini\'s NYDFS charter is the gold standard for New York institutional crypto custody.',
    },
    {
      question: 'Why is diversifying assets across multiple exchanges a risk management practice?',
      options: [
        'Multiple exchanges provide better trading opportunities through price arbitrage',
        'No single exchange has zero failure probability — spreading holdings across Coinbase, Kraken, and self-custody reduces the impact of any single exchange failure, hack, or regulatory action',
        'Diversifying across exchanges qualifies you for better fee tiers on each',
        'Exchange diversification is legally required for holdings above $50,000',
      ],
      correct: 1,
      hint: 'What happened to FTX users who held all their assets on a single exchange?',
      explanation: 'FTX\'s collapse demonstrated that even large, reputable-appearing exchanges can fail catastrophically. Users with all assets on FTX lost access to everything simultaneously. Exchange failure risk is low for Coinbase, Binance, Kraken, and Gemini — but not zero. Regulatory action could freeze accounts (Binance has been restricted in multiple jurisdictions). Hacks, while rare for major exchanges, do occur. Spreading holdings: $X on Coinbase (regulatory compliance), $Y on Kraken (Europe operations), $Z in self-custody (hardware wallet) means any single failure affects only one portion of holdings.',
    },
    {
      question: 'A global active trader needs: 500+ altcoins, lowest possible fees, strong derivatives. They accept higher regulatory risk. Which exchange fits?',
      options: [
        'Gemini — best regulated exchange globally',
        'Binance — despite regulatory history, offers 600+ tokens, 0.10% fees (0.00% with BNB), comprehensive derivatives including futures and options',
        'Coinbase — highest regulatory trust for active traders',
        'Kraken — best derivatives platform globally',
      ],
      correct: 1,
      hint: 'Which exchange has the deepest altcoin selection and lowest fees at the cost of regulatory concerns?',
      explanation: 'For this specific requirement set (volume/altcoins/derivatives, accepting regulatory risk), Binance is the objective match: 600+ tokens (Coinbase has ~200, Kraken ~200), 0.10% taker fee standard (reducible with BNB to 0.075%), comprehensive Binance Futures platform with deep liquidity. The regulatory risk is explicit and must be consciously accepted: DOJ history, US restrictions, enhanced monitoring. The trader who fits this profile: international, large volume, sophisticated, and has independently evaluated the regulatory risk and accepts it for the operational advantages.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 192 — Base as Coinbase's Long-Term Revenue Strategy
// ─────────────────────────────────────────────────────────────────────────────

const L192: IslandLevel = {
  id: 192, mechanic: 'memory', tier: 'pro',
  topic: 'Base as Coinbase\'s Long-Term Revenue Strategy',

  explanation: `
In Q2 2024, Coinbase reported that Base had generated $56 million in sequencer revenue in a single quarter — more than many standalone blockchain projects earn in a year. This was not from token speculation; it was from a business model that grows with on-chain activity.

Coinbase earns sequencer fees on every Base transaction — approximately $0.01 per transaction after paying Ethereum for data posting costs. At 1 million daily transactions (Base's approximate volume in 2024), that is ~$10,000/day or ~$3.6 million/year in net sequencer revenue. At Ethereum mainnet's volume of 1 million+ transactions per day on L2, the revenue potential is orders of magnitude larger.

The strategic significance for COIN stock: Coinbase's traditional revenue is highly cyclical — trading fees collapse when crypto prices and volumes fall (Q4 2022: Coinbase revenue fell 75% year-over-year). Base sequencer revenue is structural — it grows with on-chain activity and is less correlated with price speculation. As Base TVL and transaction volume grow, a larger fraction of Coinbase's revenue is structural rather than speculative-cycle-dependent.

For investors: buying COIN stock gives exposure to Base adoption without directly holding crypto. Every Base transaction — DeFi, NFT, consumer app — generates Coinbase sequencer revenue. Institutional investors who cannot hold crypto directly can gain Base adoption exposure through COIN shares.

The long-term projection: if Base reaches Ethereum mainnet's transaction volume within 5 years, sequencer revenue alone could generate $500M–$1B annually. This projection makes Base the most valuable asset Coinbase has built — potentially exceeding their exchange business in long-term value.
  `.trim(),

  fact: 'Base generated $56M in sequencer revenue in Q2 2024. Revenue model: ~$0.01 net per transaction. At scale, sequencer revenue could exceed exchange trading fee revenue. COIN stock gives regulated investors Base adoption exposure without holding crypto directly.',
  plain: 'Base makes Coinbase money every time anyone uses it — not from token speculation but from transaction fees. This is more stable than trading fee revenue. COIN stock = bet on Base growing, which institutions can buy without holding crypto.',
  stars: [1100, 1354, 1692], target: 1692, coins: 84,
  simulatorLesson: 'bridge',

  examples: [
    {
      contextTag: '[Revenue model calculation]',
      scenario: 'Marcus asks: "If Base processes 2 million transactions per day, what is the annual sequencer revenue?" He wants to understand the business case.',
      outcome: '2M transactions/day × $0.01 net sequencer revenue = $20,000/day. $20,000 × 365 = $7.3M/year. Ethereum L2 costs (blobs) are variable — at higher Base volumes, Coinbase posts data to Ethereum more frequently but per-transaction costs are lower. The real-world Q2 2024 figure ($56M/quarter = $224M annualised at that volume) confirms the structural revenue model. At Ethereum mainnet\'s transaction volume on L2, projections reach $500M+ annually.',
    },
    {
      contextTag: '[COIN as institutional proxy]',
      scenario: 'A pension fund wants exposure to crypto adoption but cannot hold digital assets directly per their investment policy. Their advisor evaluates COIN stock.',
      outcome: 'COIN provides: exposure to crypto trading volumes (cyclical), Base sequencer revenue growth (structural), Coinbase Prime institutional adoption (growing), staking revenue (partially structural). For a pension fund: COIN is regulated equity (standard institutional asset class), provides diversified crypto exposure without direct asset holding, and benefits from both crypto adoption and Coinbase\'s regulatory moat. Risk: still highly correlated with crypto price cycles. The fund allocates 1% of portfolio to COIN as a diversified crypto-adjacent position.',
    },
    {
      contextTag: '[Revenue diversification value]',
      scenario: 'Keiko is evaluating COIN stock for investment. She checks Coinbase\'s Q4 2022 (crypto bear market) vs Q1 2024 (bull market) revenue.',
      outcome: 'Q4 2022: $629M revenue (mostly trading fees, decimated by bear market). Q1 2024: $1.6B revenue (trading fees recovered + subscription/services grew). The subscription and services category — which includes Base sequencer revenue, staking, custody fees — grew from 10% of revenue in bear market to 25% in the recovery period. This growing non-trading-fee revenue component is precisely the Base sequencer revenue and staking revenue that make COIN less cyclical. The investment thesis: COIN is increasingly a structural infrastructure business, less a purely speculative trading business.',
    },
  ],

  keyTakeaway: 'Base sequencer revenue is structural — growing with on-chain activity rather than crypto price cycles. At scale, it could match or exceed Coinbase\'s exchange revenue. COIN stock provides regulated institutional access to Base adoption exposure without direct crypto holding.',

  guidedPractice: [
    {
      question: 'Why is Base sequencer revenue less cyclical than Coinbase\'s exchange trading fee revenue?',
      options: [
        'Sequencer revenue is fixed regardless of market conditions',
        'Sequencer revenue grows with on-chain activity (DeFi, consumer apps, NFTs) which has broader drivers than speculative crypto price cycles. Even in bear markets, builders deploy and DeFi operates — generating transactions that produce sequencer revenue',
        'The SEC regulates sequencer revenue differently from trading fees',
        'Coinbase sets sequencer fees dynamically to smooth revenue cycles',
      ],
      correct: 1,
      hint: 'What drives exchange trading volume vs what drives Base transaction volume?',
      explanation: 'Exchange trading fees: driven primarily by speculative buying/selling — collapses in bear markets when retail exits. Base sequencer fees: driven by all on-chain activity — DeFi positions being managed (exist in bear markets), consumer apps running (independent of price cycles), builders deploying contracts (countercyclical — builders build more in bear markets), NFT transfers, and institutional operations. Even in the deepest bear market, DeFi protocols continue operating and generating transactions. The activity base for sequencer revenue is broader and less correlated with speculative price cycles.',
    },
    {
      question: 'Base generated $56M in sequencer revenue in Q2 2024. If transaction volume doubles, what is the approximate annual revenue?',
      options: [
        '$56M annually', '$224M annually', '$448M annually', '$112M annually'],
      correct: 2,
      hint: 'Q2 = 3 months. At double volume: Q2 doubles to $112M, × 4 quarters.',
      explanation: '$56M in one quarter = $224M annualised at Q2 2024 volume. If transaction volume doubles: $112M per quarter × 4 quarters = $448M annually. This is a linear relationship — sequencer revenue scales directly with transaction count. At Ethereum mainnet-level transaction volume on Base, the revenue potential climbs significantly higher. The Q2 2024 figure already exceeded many expectations — and Base was still a relatively young chain at that point.',
    },
    {
      question: 'Why might an institutional investor prefer COIN stock over direct crypto holdings for Base adoption exposure?',
      options: [
        'COIN stock always outperforms direct crypto holdings',
        'COIN is regulated equity that fits existing institutional portfolio frameworks, custody requirements, and compliance processes — whereas direct crypto requires new custody infrastructure, regulatory approval, and novel compliance procedures',
        'COIN stock is covered by FDIC insurance unlike direct crypto',
        'Buying COIN gives you higher returns than Base tokens would',
      ],
      correct: 1,
      hint: 'What does an institution need to hold a new asset class? How does this compare to equities?',
      explanation: 'Adding crypto to an institutional portfolio requires: new custody solution (qualified custodian for crypto), investment policy amendment, board approval, audit firm sign-off on asset classification, new compliance procedures. Adding COIN stock: it goes in the equity allocation, existing prime broker holds it, existing compliance framework covers it. No new infrastructure needed. The regulatory arbitrage: institutions get crypto adoption exposure (COIN revenue correlates with crypto activity) through a familiar instrument (NYSE-listed equity) without crypto-specific operational overhead.',
    },
    {
      question: 'What is the long-term revenue potential of Base that makes it Coinbase\'s most strategically important product?',
      options: [
        'Base will eventually issue a BASE token that generates fee revenue for Coinbase',
        'If Base reaches Ethereum mainnet-level transaction volume, sequencer revenue could generate $500M–$1B annually — potentially exceeding Coinbase\'s exchange trading revenue in stable market conditions',
        'Base generates unlimited revenue because Coinbase controls all fees',
        'The strategic importance is brand recognition, not direct revenue',
      ],
      correct: 1,
      hint: 'Compare Base\'s transaction revenue per transaction to Ethereum mainnet\'s total daily transactions.',
      explanation: 'Ethereum mainnet processes 1M+ transactions daily. At even $0.005 net revenue per transaction (conservative after Ethereum data costs): $5,000/day = $1.8M/year. But Coinbase builds for scale: if Base processes 10M transactions/day (Visa-scale payments): $50,000/day = $18M/year. At $0.01 net and 10M daily transactions: $36.5M/year. Q2 2024 already showed $56M/quarter at much lower volumes. The structural revenue ceiling at global transaction scale is enormous — and unlike exchange fees, it grows with genuine utility rather than speculative cycles.',
    },
    {
      question: 'Coinbase does not issue a BASE token. How does this affect the revenue model compared to Optimism (which has OP token) or Arbitrum (ARB token)?',
      options: [
        'Without a token, Coinbase earns no revenue from Base operations',
        'Without a token, Coinbase avoids SEC security classification risk while earning 100% of sequencer revenue directly in ETH — no token distribution costs, no regulatory exposure',
        'The lack of a token means Base users have no governance rights, which reduces adoption',
        'Coinbase earns less than Optimism because OP token appreciation adds to Optimism\'s revenue',
      ],
      correct: 1,
      hint: 'What costs do Optimism and Arbitrum incur that Coinbase avoids? What regulatory risk do they face?',
      explanation: 'Token governance tokens (OP, ARB) create: ongoing token distribution costs (grants, incentives reduce treasury), regulatory classification risk (SEC attention), and value leakage to token holders rather than the company. Coinbase\'s no-token model: 100% of sequencer revenue goes to Coinbase directly (no token holder dilution), no SEC security classification risk for the token, and all value accrues to COIN shareholders. The trade-off: Coinbase cannot use token incentives to bootstrap ecosystem growth. But Coinbase has Coinbase\'s 100M users as the bootstrapping mechanism — making token incentives less necessary.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 193 — Coinbase Security Practices for Users
// ─────────────────────────────────────────────────────────────────────────────

const L193: IslandLevel = {
  id: 193, mechanic: 'chain', tier: 'pro',
  topic: 'Coinbase Security Practices for Users',

  explanation: `
In 2021, Coinbase disclosed that approximately 6,000 customers had their accounts compromised through an SMS phishing campaign. The attackers exploited a weakness in Coinbase's SMS multi-factor authentication to bypass account security. The lesson was clear: SMS-based 2FA is vulnerable to social engineering attacks regardless of Coinbase's own security infrastructure.

Coinbase-specific security practices separate users who lose funds from those who don't. The most important upgrades are accessible and free.

Replace SMS 2FA with a hardware security key: SMS 2FA can be bypassed via SIM swap attacks (convincing your carrier to transfer your number to the attacker's SIM). A hardware security key (YubiKey) plugs into your device — there is no phone number to steal, no OTP to phish, and no remote exploit possible. This single upgrade eliminates the most common account compromise vector.

Enable passkeys for Coinbase login: Coinbase now supports passkey-based authentication (Face ID/Touch ID). Passkeys are phishing-resistant — they are tied to the specific domain (coinbase.com), so a phishing site (coinbase-secure.com) cannot use your passkey. This is a significant upgrade over password-based login even with 2FA.

API key security for traders: Coinbase API keys (for algorithmic trading or portfolio tracking) should have the minimum permissions necessary. Use IP allowlists — limit the API key to only your server's IP address. Rotate keys every 90 days. Never commit API keys to GitHub (automated scanners immediately find and exploit exposed keys).

Account recovery: unlike self-custody, Coinbase can recover your account via KYC verification. This is a feature (recovery possible) and a risk (social engineering of Coinbase support is possible). Enable maximum verification steps for any account recovery request.
  `.trim(),

  fact: 'Coinbase 2021: 6,000 accounts compromised via SMS 2FA bypass. Security upgrades: hardware security key (YubiKey replaces SMS 2FA), passkeys (phishing-resistant login), API key IP allowlists, minimum-permission API keys.',
  plain: 'Protect your Coinbase: use a YubiKey instead of SMS codes (SIM swaps defeat SMS), enable passkeys, and restrict API key permissions. The 2021 hack affected 6,000 users who relied on SMS 2FA.',
  stars: [1160, 1427, 1784], target: 1784, coins: 88,
  simulatorLesson: 'approvalRevoke',

  examples: [
    {
      contextTag: '[SIM swap attack prevention]',
      scenario: 'Marcus receives a text: "Coinbase security alert — verify your identity to prevent account lock." He calls his carrier and discovers his number was transferred to someone else\'s SIM an hour ago.',
      outcome: 'He had SMS 2FA on Coinbase. The attacker successfully convinced his carrier to transfer his number. They used the transferred number to receive the SMS 2FA code and accessed his account. He had a YubiKey sitting unused in a drawer. Lesson: SMS 2FA is only as secure as your phone carrier\'s social engineering resistance — which is low. A physical YubiKey requires the attacker to have physical possession of the key. There is no phone number to steal.',
    },
    {
      contextTag: '[Passkey phishing resistance]',
      scenario: 'Priya receives an email: "Coinbase Security: your account needs verification. Click here." The link goes to coinbase-account-verify.com. She clicks it and sees a realistic Coinbase login page.',
      outcome: 'She uses a passkey for Coinbase login. The passkey authentication flow begins on the fake site, but her browser/device checks: "Is this domain coinbase.com?" The answer is no — it is coinbase-account-verify.com. The passkey authentication fails at the device level. She cannot be phished through a fake site because her device rejects the authentication request for any domain that is not the registered passkey domain (coinbase.com). The attacker has nothing. With a password + SMS 2FA, she would have entered her credentials and the attacker would have had them.',
    },
    {
      contextTag: '[API key exposure]',
      scenario: 'A developer pushes their trading bot code to a public GitHub repository. The Coinbase API key is in the code. Within 4 minutes, an automated scanner finds it.',
      outcome: 'GitHub security bots and malicious scanners continuously scan public repositories for API keys. Coinbase API keys with "withdrawal" permissions allow the attacker to drain the account. If the key has only "portfolio read" permission and no IP allowlist, the attacker can read positions but cannot steal funds. If the key has full permissions: funds are at risk. Minimum necessary permissions + IP allowlist + environment variables (never hardcoded) prevent this. The developer who used a read-only key with IP allowlist: zero loss. The developer who used a full-permission key with no IP allowlist: potentially lost everything.',
    },
  ],

  keyTakeaway: 'Coinbase account security hierarchy: hardware security key (YubiKey) > passkeys > authenticator app > SMS 2FA. API keys: minimum permissions, IP allowlist, never in code repositories. The 2021 6,000-account breach was entirely preventable with hardware 2FA.',

  guidedPractice: [
    {
      question: 'What is a SIM swap attack and why does it defeat SMS 2FA?',
      options: [
        'An attacker physically swaps the SIM card from your phone while you sleep',
        'An attacker convinces your mobile carrier to transfer your phone number to their SIM — after which they receive your SMS verification codes, bypassing any SMS-based 2FA',
        'An attack that swaps your real SIM with a fake one containing malware',
        'A technical exploit that intercepts SMS messages in transit through carrier infrastructure',
      ],
      correct: 1,
      hint: 'Mobile carriers provide a "number transfer" service. What can an attacker do if they convince the carrier your number belongs to them?',
      explanation: 'SIM swap: the attacker calls your carrier, impersonates you using available personal information (often found from data breaches or social media), and requests a number transfer to their new SIM. The carrier, fooled by the social engineering, transfers your number. Now all calls and SMS to your number go to the attacker. SMS 2FA codes sent to "your number" go to the attacker. They then use your password (often obtained from phishing or data breaches) + your SMS code to access your account. A hardware key or passkey has no phone number — there is nothing for the carrier to transfer.',
    },
    {
      question: 'Why are passkeys phishing-resistant in a way that passwords are not?',
      options: [
        'Passkeys are stored on Coinbase\'s servers, making them impossible to phish',
        'Passkeys are cryptographically bound to a specific domain (coinbase.com) — your device refuses to authenticate for any other domain, even if it looks identical. Passwords can be entered on any domain',
        'Passkeys require biometric authentication that cannot be replicated',
        'Passkeys automatically detect phishing sites using AI analysis',
      ],
      correct: 1,
      hint: 'What does your browser check when a passkey authentication is requested?',
      explanation: 'When you created your Coinbase passkey, it was bound to coinbase.com at the cryptographic level. When coinbase-fake.com presents a login page and requests passkey authentication, your device checks: "Is this domain exactly coinbase.com?" It is not — authentication fails. The attacker receives nothing. With a password: you type it into any domain that looks legitimate — the domain is not checked by you, just by your eyes. Passkeys are phishing-proof by design because domain verification is cryptographic, not visual.',
    },
    {
      question: 'You create a Coinbase API key for your portfolio tracking app. What permissions should it have?',
      options: [
        'All permissions — ensures the app works correctly in all future scenarios',
        'Read-only permissions only (view balances, transaction history) — no trading, no withdrawal, no transfer permissions. If the key is compromised, attackers can see but not steal',
        'Trading permissions but no withdrawal — allows the app to place orders',
        'Standard permissions as Coinbase recommends for most use cases',
      ],
      correct: 1,
      hint: 'What does your portfolio tracking app actually need to do? What is the consequence of unnecessary permissions?',
      explanation: 'Minimum necessary permissions: a portfolio tracker needs only to read balances and transaction history. No trading, no withdrawal, no transfer. If this read-only key is compromised: the attacker sees your portfolio. Valuable information, but no direct loss of funds possible. If you gave full permissions "in case the app ever needs them": a compromised key can now drain your account. Every permission you grant is a risk you accept — only grant what the specific application requires for its specific function.',
    },
    {
      question: 'What does an API key IP allowlist do and why does it reduce risk?',
      options: [
        'It prevents the API key from being used on any IP address',
        'It restricts API key usage to only specified IP addresses — if the key is stolen, it is useless unless the attacker is on an allowlisted IP (typically your server\'s fixed IP)',
        'It monitors API key usage and alerts Coinbase security teams',
        'IP allowlists automatically rotate the API key when suspicious activity is detected',
      ],
      correct: 1,
      hint: 'If your key can only be used from your server\'s IP address, what must an attacker have in addition to the key?',
      explanation: 'An IP allowlist means Coinbase rejects any API request from the key if it does not originate from an allowlisted IP. The attacker who steals your key must also be at your IP address — meaning they would need to compromise your server directly, not just the key. For a leaked key on GitHub: the attacker\'s IP is not in your allowlist → Coinbase rejects the request → zero theft. Without an allowlist: any attacker who finds your key can make API calls from anywhere. IP allowlisting converts a stolen-key risk into a server-compromise risk — a much harder attack.',
    },
    {
      question: 'Coinbase can recover your account via KYC if you lose access. Why is this both a feature and a risk?',
      options: [
        'It is purely a feature — account recovery is always beneficial with no downsides',
        'Feature: you can recover access after losing credentials (unlike self-custody). Risk: social engineering of Coinbase support staff could allow an attacker to take over your account via the same recovery process',
        'It is purely a risk — account recovery undermines security for all users',
        'KYC recovery only works if you call Coinbase from your registered phone number',
      ],
      correct: 1,
      hint: 'How did the attackers in the 2021 breach exploit the SMS recovery system?',
      explanation: 'Coinbase\'s account recovery via KYC is the centralised safety net: forget your password, verify your identity, regain access. For legitimate users: valuable. For attackers: the same process is a social engineering target. If an attacker can convince Coinbase support that they are you (using information from data breaches, social media, or previous phishing), they can use the recovery process to take over your account. The 2021 Coinbase breach involved exploiting the SMS-based account recovery flow. Mitigation: request maximum account security verification steps, use withdrawal address allowlists, and enable Coinbase\'s account activity alerts.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 194 — Earning Yield on Coinbase: Staking, USDC Yield, and Earn
// ─────────────────────────────────────────────────────────────────────────────

const L194: IslandLevel = {
  id: 194, mechanic: 'memory', tier: 'pro',
  topic: 'Earning Yield on Coinbase — Staking, USDC Yield, Earn',

  explanation: `
Coinbase offers three yield mechanisms — liquid staking, USDC yield, and Coinbase Earn educational rewards. Each has a different risk profile, yield level, and appropriate user. Understanding which to use and what you give up is the practical question.

cbETH liquid staking: Coinbase stakes your ETH and gives you cbETH — a liquid token representing your staked ETH plus accrued rewards. cbETH earns approximately 3.5–4% APY (currently). You can sell cbETH anytime, unlike natively staked ETH which has an unstaking queue. Coinbase takes approximately 25% of staking rewards as a commission — you earn roughly 75% of the native ETH staking rate. Risk: Coinbase custody of the underlying staked ETH, cbETH price may deviate slightly from ETH during market stress.

USDC yield product: Coinbase offers 4–5% APY on USDC held in the yield product. The mechanism: Coinbase passes through interest earned from USDC reserves (Circle holds T-bills) plus additional yield from institutional lending. This is custodial yield — you hold USDC at Coinbase and they pay you interest. Risk: Coinbase counterparty (similar to holding in a savings account). Yield level: competitive with traditional savings accounts, below DeFi yields.

Coinbase Earn: small token rewards (typically $1–$10) for completing educational quizzes about new crypto projects. These are partnership arrangements — projects pay Coinbase to distribute tokens to users who complete educational content about their protocol. Risk: very low (quiz answers do not require wallet connections), but tax implications apply (received tokens are taxable income).

The honest comparison to DeFi: Coinbase yields are lower than comparable DeFi yields but carry no smart contract risk. Aave USDC: 5–8% with smart contract risk. Coinbase USDC yield: 4–5% with Coinbase counterparty risk. For non-DeFi users, Coinbase yield products are the appropriate entry point to earning on crypto.
  `.trim(),

  fact: 'Coinbase yield products: cbETH liquid staking (3.5–4% APY, 25% commission taken), USDC yield (4–5% APY, custodial), Coinbase Earn (small educational token rewards). Lower yields than DeFi but no smart contract risk — appropriate for non-DeFi users.',
  plain: 'Coinbase lets you earn on your crypto: liquid ETH staking (4% APY), USDC interest (4–5%), and small rewards for completing quizzes. Yields are below DeFi but much simpler and safer for beginners.',
  stars: [1220, 1502, 1877], target: 1877, coins: 92,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[cbETH vs native staking comparison]',
      scenario: 'Amara has 5 ETH and evaluates Coinbase cbETH staking vs solo staking vs a decentralised liquid staking protocol (Lido stETH).',
      outcome: 'Solo staking: 4% APY, full non-custodial, requires 32 ETH minimum and technical setup. Not available to her. Lido stETH: ~3.8% APY (10% commission), decentralised validator set, smart contract risk, easily tradeable. Coinbase cbETH: ~3.6% APY (25% commission, higher than Lido), Coinbase custody risk, easily tradeable, integrates with Base DeFi. For 5 ETH with no technical capability: Lido (lower commission) or cbETH (higher convenience, Base integration). She chooses cbETH because she plans to use it in Moonwell on Base — the native Coinbase integration provides access to cbETH DeFi opportunities.',
    },
    {
      contextTag: '[USDC yield vs DeFi comparison]',
      scenario: 'Marcus has $20,000 USDC and evaluates Coinbase yield product (4.5% APY) vs Aave Base USDC (6.2% APY) vs Aerodrome USDC/USDT (11% APY).',
      outcome: 'Coinbase yield: $20,000 × 4.5% = $900/year. Zero friction, no wallet, no gas, no smart contract risk. Aave Base: $20,000 × 6.2% = $1,240/year. Requires Base wallet, gas costs (~$20/year), Aave smart contract risk. Aerodrome: $20,000 × 11% = $2,200/year. Requires LP position management, Aerodrome smart contract risk, IL risk, emission variability. For Marcus who has 10 minutes to invest and does not want to think about it: Coinbase yield at $900/year. For Marcus willing to spend 2 hours setting up and monitoring: Aerodrome at $2,200/year. Yields reflect the effort and risk differential.',
    },
    {
      contextTag: '[Coinbase Earn tax implication]',
      scenario: 'Keiko completes 5 Coinbase Earn quizzes and receives various tokens worth $35 total. She asks about tax.',
      outcome: 'Coinbase Earn tokens are taxable income at receipt. $35 total received = $35 ordinary income, reportable in the tax year received. Coinbase generates a 1099-MISC for this. Her cost basis for future disposal: $35 (the receipt value). If she holds the tokens and sells them later: any gain/loss is calculated against the $35 basis. For small amounts, the tax complication is minimal — but multiply by many users doing many quizzes and it becomes a material tax consideration.',
    },
  ],

  keyTakeaway: 'Coinbase yield products (cbETH 3.5–4%, USDC yield 4–5%, Earn small token rewards) are lower than DeFi yields but require no smart contract interaction — appropriate for non-DeFi users. All received token rewards (including Earn) are taxable income at receipt.',

  guidedPractice: [
    {
      question: 'Coinbase takes 25% of cbETH staking rewards. What APY does a user receive if Ethereum staking yields 4.5% natively?',
      options: ['4.5%', '3.375%', '1.125%', '4.0%'],
      correct: 1,
      hint: 'User receives 75% of native yield. 4.5% × 75% = ?',
      explanation: '4.5% native staking yield × 75% (user share, Coinbase takes 25%) = 3.375% APY for the user. Lido takes 10% commission → user receives 4.05%. Rocket Pool takes 14% → user receives 3.87%. Coinbase\'s 25% commission is the highest among major liquid staking providers, which is the trade-off for Coinbase brand recognition, custodial simplicity, and Base DeFi integration. Users willing to use Lido stETH or rETH earn meaningfully higher yields for comparable liquidity.',
    },
    {
      question: 'What risk distinguishes Coinbase\'s USDC yield product from Aave\'s USDC supply?',
      options: [
        'Coinbase yield is insured by FDIC while Aave is not — Coinbase is safer',
        'Coinbase yield: custodial counterparty risk (Coinbase insolvency/mismanagement). Aave: smart contract vulnerability risk. Both are real; neither is zero; they are different risk types requiring different assessments',
        'Aave yield is higher due to higher risk — but the risk type is identical to Coinbase',
        'Coinbase yield is regulated while Aave yield violates securities law',
      ],
      correct: 1,
      hint: 'Who holds your USDC in each case? What can go wrong with each holder?',
      explanation: 'Coinbase USDC yield: Coinbase holds your USDC and pays you interest. Risk: Coinbase insolvency (FTX-type event), regulatory freeze of accounts, operational failure. These are centralised counterparty risks. Aave USDC: smart contracts hold your USDC autonomously. Risk: code vulnerability exploited, oracle manipulation causing incorrect liquidations, governance attack. These are decentralised protocol risks. Neither is zero; the Coinbase risk is lower-probability but operationally similar to bank risk; Aave risk is low-probability but existential if it occurs. Neither is FDIC insured.',
    },
    {
      question: 'What are Coinbase Earn rewards and what tax obligation do they create?',
      options: [
        'Cashback rewards for trading that are exempt from taxation',
        'Small token amounts received for completing educational quizzes about crypto projects. They are taxable as ordinary income at their fair market value on the date received',
        'Staking rewards that are taxed at long-term capital gains rates',
        'Promotional credits that are applied to future trading fees, not taxable as income',
      ],
      correct: 1,
      hint: 'When you receive something of value in exchange for a task, what category does that create?',
      explanation: 'Coinbase Earn: you complete a quiz → receive tokens. This is income in exchange for an activity (the quiz) — taxable as ordinary income at receipt. Coinbase generates a 1099-MISC for amounts over $600 (though all amounts are technically taxable). The receipt value becomes your cost basis. If you hold the earned tokens and they appreciate: you owe capital gains on the appreciation when you sell (above the original income basis). Small amounts individually, but they require proper tracking — Koinly or CoinTracker auto-imports Coinbase 1099s.',
    },
    {
      question: 'You hold 3 ETH and want liquid staking. Why might you choose cbETH over Lido stETH despite the higher commission?',
      options: [
        'cbETH has no commission — Coinbase takes fees from trading instead',
        'cbETH integrates natively into Base DeFi protocols (Moonwell collateral, Aerodrome pools) — the Base ecosystem access may offset the commission difference if you actively use cbETH in DeFi',
        'cbETH has better insurance coverage than stETH',
        'The commission difference is negligible — both products are identical',
      ],
      correct: 1,
      hint: 'Where can you use cbETH that stETH is not available?',
      explanation: 'Lido stETH has lower commission (10% vs Coinbase\'s 25%) — a meaningful yield difference. But cbETH is native to the Coinbase/Base ecosystem: accepted as collateral on Moonwell (earn 1–2% supply APY on top of staking yield), available in Aerodrome cbETH/ETH pools (earn LP fees), and integrates with Coinbase\'s own DeFi products. If you plan to use your staked ETH in Base DeFi, cbETH\'s ecosystem integration may generate additional yield that partially or fully offsets the higher commission. If you just want to stake and hold: Lido stETH earns more.',
    },
    {
      question: 'A user earns 4.5% APY on $10,000 USDC in Coinbase\'s yield product. Their DeFi friend earns 9% on $10,000 in Aerodrome. What are they each actually trading off?',
      options: [
        'Nothing — yield is yield. Higher is always better.',
        'Coinbase user: $450/year with Coinbase counterparty risk and zero operational effort. DeFi user: $900/year with smart contract risk + Aerodrome protocol risk + emission variability + gas costs (~$50/year) + time to manage. The $450 difference is the price of simplicity and risk type preference',
        'The DeFi user takes more risk for no benefit since Aerodrome is fully audited',
        'Both users face identical risks — blockchain is blockchain regardless of the interface',
      ],
      correct: 1,
      hint: 'What does each user have to do to earn their yield? What could go wrong with each?',
      explanation: 'Coinbase yield user: deposit USDC → earn 4.5% → done. No setup, no monitoring, no gas. Risk: Coinbase. DeFi user: set up Base wallet ($5 gas), bridge USDC ($1 gas), provide Aerodrome LP ($2 gas), monitor weekly for range management, harvest AERO rewards ($1/week gas), reinvest ($1/week gas). Annual gas: ~$60. Net DeFi yield: (9% × $10K) − $60 = $840. Net Coinbase yield: $450. DeFi premium: $390/year. The $390 compensates for: setup time (2–4 hours), ongoing monitoring (30 min/week), smart contract risk, and emission variability. Whether that trade-off is worth it is a personal decision based on time value and risk tolerance.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 195 — BOSS: The Complete Coinbase Picture
// ─────────────────────────────────────────────────────────────────────────────

const L195: IslandLevel = {
  id: 195, mechanic: 'match3', tier: 'pro',
  topic: 'BOSS: The Complete Coinbase Picture',
  isBoss: true,

  explanation: `
You have completed the Coinbase Deep Dive. Here is the synthesis before the boss challenge.

Coinbase is not just an exchange. It is a publicly listed financial infrastructure company building the regulated on-ramp to the on-chain economy. Understanding its full product suite reveals a coherent strategic vision: every product connects Coinbase's 100M users to the on-chain world while maintaining regulatory clarity.

The product stack:
- Trading: basic interface (0.60%, simple) → Advanced Trade (0.00–0.40%, professional)
- Bitcoin: cbBTC (Coinbase-custodied, 1:1 backed, monthly attestations) → CDP (borrow against cbBTC without selling)
- Stablecoins: USDC (Circle-issued, regulated, CCTP cross-chain) → USDC yield (4–5% custodial)
- Self-custody: Coinbase Wallet (seed phrase) → Smart Wallet (ERC-4337, passkey, seedless)
- Automation: AgentKit (single agent DCA) → Multi-agent DeFi systems (separation of concerns, circuit breakers)
- Institutional: Prime custody ($250M insurance, qualified custodian) → OTC desk → DeFi yield management
- Ecosystem: Base (sequencer revenue, consumer apps) → Ventures (300+ portfolio companies)
- Regulation: SEC litigation → FIT21 lobbying → Advanced Trade fee structure compliance

Security non-negotiables: hardware security key replacing SMS 2FA, passkeys for phishing resistance, API keys with minimum permissions and IP allowlists.

The Coinbase thesis: as crypto becomes regulated infrastructure, the company that built the compliant bridge between traditional finance and on-chain will capture enormous value. Base sequencer revenue, staking commissions, custody fees, and trading fees together represent a diversified infrastructure revenue model that grows with crypto adoption.
  `.trim(),

  fact: 'Coinbase mastery: Advanced Trade fees, cbBTC/CDP mechanics, USDC/CCTP, Smart Wallet ERC-4337, AgentKit security architecture, Prime institutional services, Base as revenue engine, SEC regulatory strategy. The regulated on-ramp to the on-chain economy.',
  plain: 'Coinbase built the regulated bridge between traditional finance and crypto. Advanced Trade for fees, cbBTC for Bitcoin DeFi, USDC for regulated stablecoins, Smart Wallet for mainstream UX, Prime for institutions, Base for structural revenue.',
  stars: [2210, 2720, 3400], target: 3400, coins: 100,
  simulatorLesson: 'coinbaseBoss',

  examples: [
    {
      contextTag: '[Three user persona design]',
      scenario: 'Design the optimal Coinbase product mix for: (A) a 65-year-old first-time crypto buyer, (B) an active Base DeFi user, (C) a crypto hedge fund.',
      outcome: 'A (65-year-old): Coinbase exchange basic interface (familiar app-like UX), BTC or ETH only (regulatory clarity), USDC yield for stablecoin savings (no DeFi complexity), Coinbase Smart Wallet if they want to try DeFi later (Face ID, no seed phrase), hardware security key for 2FA. B (DeFi user): Coinbase Advanced Trade (low fees), Coinbase Wallet (seed phrase for full DeFi access), cbBTC for Bitcoin DeFi exposure, AgentKit for yield automation with proper constraints. C (Hedge fund): Coinbase Prime custody (qualified custodian, $250M insurance), OTC desk for block trades, DeFi yield management service, API access with IP allowlists and minimum permissions.',
    },
    {
      contextTag: '[Is Coinbase safer than a bank?]',
      scenario: 'A friend asks: "Is my money safer on Coinbase than in a bank?" Walk through the honest comparison.',
      outcome: 'Bank advantages: FDIC insurance ($250K guaranteed), hundreds of years of regulatory framework, government backstop in systemic crises (2008, 2023 SVB). Coinbase advantages: more transparent (publicly listed, quarterly reports), no fractional reserve (crypto is held 1:1, not lent out 10:1), self-custody option available. Honest answer: for amounts under $250K, FDIC insurance makes bank strictly safer against Coinbase insolvency. For amounts over $250K, both have uninsured risk. Coinbase crypto-specific risk: no FDIC, exchange insolvency treatment as unsecured creditor (FTX precedent). Self-custody eliminates exchange risk entirely but introduces custody responsibility. It is not strictly better or worse — it is a different risk profile.',
    },
    {
      contextTag: '[Interpreting earnings data]',
      scenario: 'Keiko reads Coinbase\'s Q1 2024 earnings: Trading volume $312B, Net revenue $1.6B, Subscription revenue $511M (growing 90% YoY). She asks what this implies.',
      outcome: 'Subscription revenue (staking, Base sequencer, custody fees) growing 90% YoY while total revenue grew from bear-market lows — this shows the structural revenue thesis is working. At 32% of total revenue and growing faster than trading fees, subscription revenue is progressively de-risking Coinbase from pure speculative cycle dependence. If the trend continues: in 3–5 years, subscription revenue (Base + staking + custody) may equal trading fees in a bear market — creating the first truly cycle-resistant large crypto company. This is the long-term investment thesis for COIN stock.',
    },
  ],

  keyTakeaway: 'Coinbase is building the regulated financial infrastructure layer of the on-chain economy — spanning exchange (Advanced Trade), Bitcoin DeFi (cbBTC/CDP), stablecoins (USDC/CCTP), consumer wallets (Smart Wallet), institutional services (Prime), and Base (structural sequencer revenue). Each product reinforces the others.',

  guidedPractice: [
    {
      question: 'A first-time crypto buyer aged 68 asks you to set up their Coinbase account securely. What are the three most important steps?',
      options: [
        'Enable 2FA via SMS, buy a diverse portfolio of altcoins, connect to DeFi immediately',
        'Replace SMS 2FA with a hardware security key or passkeys (phishing and SIM swap protection), limit holdings to BTC/ETH (regulatory clarity), and enable account activity alerts (early detection of unauthorised access)',
        'Create a self-custody wallet, buy cbBTC, and provide liquidity on Aerodrome',
        'Enable all advanced features immediately to ensure full platform access',
      ],
      correct: 1,
      hint: 'What security and asset selection decisions are most consequential for a non-technical first-time user?',
      explanation: 'First-time user security priorities: (1) Hardware key/passkey — eliminates the most common attack vectors (SIM swap, phishing) that a non-technical user is most vulnerable to. SMS 2FA is the weakest 2FA. (2) BTC/ETH only — these have the clearest regulatory status and longest track records. Altcoins introduce regulatory uncertainty, higher volatility, and more complex evaluation requirements inappropriate for a first-time buyer. (3) Activity alerts — provides early warning without requiring active monitoring, appropriate for a user who is not checking Coinbase daily.',
    },
    {
      question: 'An active DeFi user wants to earn yield on 2 BTC without selling. Design their Coinbase-based strategy.',
      options: [
        'Sell BTC, buy USDC, deposit in Coinbase USDC yield product',
        'Convert 2 BTC to cbBTC → deposit in Moonwell (2.5% supply APY) → borrow $40,000 USDC at 50% LTV → deploy USDC to Aerodrome USDC/USDT pool (8% APY) → net: BTC exposure maintained, ~$5,200/year additional yield',
        'Stake BTC directly on Coinbase for staking rewards',
        'Hold on Coinbase Prime custody and earn custody-based APY',
      ],
      correct: 1,
      hint: 'What Coinbase products allow Bitcoin holders to generate DeFi yield without selling?',
      explanation: 'The complete strategy: cbBTC conversion (1:1, no tax event) → Moonwell collateral (supply APY on BTC exposure = ~$3,500/year at 2.5% on $140K) → borrow USDC at 50% LTV ($70,000) → Aerodrome stable pool ($70,000 × 8% = $5,600/year minus gas). Total yield: ~$9,100/year on $140K of BTC exposure while maintaining full BTC price appreciation. The borrow cost (Moonwell interest rate, typically 3–5%): $70,000 × 4% = $2,800/year. Net yield: ~$6,300/year. Liquidation risk: BTC must drop 37%+ from current price. At 50% LTV this is manageable for a long-term BTC holder.',
    },
    {
      question: 'A hedge fund uses Coinbase Prime for custody but wants to access DeFi yields. What service bridge exists?',
      options: [
        'Hedge funds cannot access DeFi through Coinbase due to regulatory restrictions',
        'Coinbase Prime\'s DeFi yield management service: Prime deploys client capital to curated DeFi protocols (Moonwell, Aave) on the client\'s behalf, acting as a regulated intermediary. Clients get DeFi yields through a Prime account — no direct smart contract interaction required',
        'Hedge funds must set up their own Coinbase Wallet and interact directly with DeFi',
        'Coinbase Ventures portfolio protocols give Prime clients automatic DeFi access',
      ],
      correct: 1,
      hint: 'What institutional service intermediates between Prime custody and DeFi protocols?',
      explanation: 'Coinbase Prime\'s DeFi yield management: Prime acts as a managed DeFi portfolio operator. The hedge fund allocates capital to Prime → Prime deploys to approved DeFi protocols → the fund receives yield minus management fee. From a compliance perspective: the fund\'s counterparty is Coinbase Prime (a regulated entity), not DeFi smart contracts directly. Investment policy statements that prohibit direct smart contract interaction can often accommodate Prime\'s managed DeFi service because the intermediary is a regulated qualified custodian. This bridge enables institutional capital to access DeFi yields within existing compliance frameworks.',
    },
    {
      question: 'Coinbase Advanced Trade charges 0.40% maker fee at entry volume. A trader does $15,000/month. What annual fee saving vs basic interface?',
      options: ['$360/year', '$720/year', '$432/year', '$288/year'],
      correct: 2,
      hint: 'Basic: 0.60% × $15,000 × 12. Advanced maker: 0.40% × $15,000 × 12. Difference.',
      explanation: 'Basic: $15,000 × 0.60% = $90/month × 12 = $1,080/year. Advanced maker: $15,000 × 0.40% = $60/month × 12 = $720/year. Saving: $1,080 − $720 = $360/year. At $50,000/month volume: Advanced maker rate drops to 0.15% → $75/month × 12 = $900/year vs basic $3,600/year = $2,700/year saving. The savings compound with volume — the most active traders have the most to gain from learning Advanced Trade.',
    },
    {
      question: 'What is the complete chain of trust for a user holding cbBTC in Moonwell on Base?',
      options: [
        'Only one trust: Coinbase holds the BTC',
        'Three layered trusts: (1) Coinbase holds the underlying BTC backing cbBTC, (2) Base\'s Coinbase sequencer processes cbBTC transactions on Base, (3) Moonwell\'s smart contract code correctly handles cbBTC as collateral. Each layer is independently trustworthy but the combination requires all three',
        'No trust required — blockchain is trustless by design',
        'Two trusts: Coinbase and Base, since Moonwell is open-source',
      ],
      correct: 1,
      hint: 'Who holds the Bitcoin? Who processes the transactions? Whose code manages your position?',
      explanation: 'The trust stack for cbBTC in Moonwell on Base: (1) Coinbase institutional custody — holds the real Bitcoin, publishes monthly attestations. (2) Base sequencer — processes your transaction adding cbBTC to Moonwell. Coinbase operates this; censorship possible but funds cannot be stolen. (3) Moonwell smart contracts — Compound-fork code managing your collateral, setting collateral ratios, executing liquidations. These are separate trust assumptions. Coinbase failing affects (1) and (2); a Moonwell exploit affects (3) independently of Coinbase\'s standing. Understanding layered trust enables accurate risk assessment — not "is it safe?" but "which layer could fail and with what consequence?"',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part B (L189–195)
// ─────────────────────────────────────────────────────────────────────────────

const COINBASE_LEVELS_B: Record<number, IslandLevel> = {
  189: L189,
  190: L190,
  191: L191,
  192: L192,
  193: L193,
  194: L194,
  195: L195,
};

export { COINBASE_LEVELS_B };

export const COINBASE_LEVELS: Record<number, IslandLevel> = {
  ...COINBASE_LEVELS_A,
  ...COINBASE_LEVELS_B,
};
