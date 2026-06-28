// ⚡ Sifter LevelUp — Base Ecosystem (Island 11, Levels 151–165)
// Part B of 2 — Levels 159–165

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';
import { BASE_LEVELS_A } from './baseLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 159 — Base vs Optimism vs Arbitrum: Choosing the Right L2
// ─────────────────────────────────────────────────────────────────────────────

const L159: IslandLevel = {
  id: 159, mechanic: 'match3', tier: 'pro',
  topic: 'Base vs Optimism vs Arbitrum — Choosing the Right L2',

  explanation: `
By 2024, three Ethereum L2s — Base, Optimism, and Arbitrum — had collectively accumulated over $40 billion in TVL. Each had differentiated enough that the choice between them was no longer arbitrary. For most users, one L2 fits better than the others based on their specific needs.

Arbitrum has the deepest DeFi ecosystem by TVL ($15B+ at peak). It has Stylus — a multi-language smart contract execution environment that allows Rust and C++ contracts alongside Solidity, enabling more performance-critical applications. GMX (perpetual trading), Radiant Capital (cross-chain lending), and Camelot (native DEX) are Arbitrum-native protocols with significant TVL. ARB governance gives token holders actual protocol decisions to vote on.

Optimism is the original OP Stack chain — Base is literally built on Optimism's code. The Superchain vision (multiple OP Stack chains sharing security and message passing) is Optimism-led. Optimism has RetroPGF — retroactive public goods funding that distributes millions in OP tokens to projects that created value for the ecosystem. For developers building public goods or wanting access to the broader Superchain ecosystem, Optimism is the centre of gravity.

Base has Coinbase's distribution — the strongest mainstream on-ramp of any L2. Its DeFi ecosystem (Aerodrome, Moonwell, Seamless) is substantial but narrower than Arbitrum's. Its strategic advantage is access to Coinbase's 100M users and institutional regulatory clarity.

The choice framework: deepest DeFi → Arbitrum. Superchain interoperability + public goods → Optimism. Mainstream on-ramp + regulatory clarity + consumer apps → Base.
  `.trim(),

  fact: 'Arbitrum: deepest DeFi TVL, Stylus multi-language contracts, ARB governance. Optimism: Superchain leader, RetroPGF public goods funding, OP governance. Base: Coinbase on-ramp, mainstream reach, institutional regulatory clarity. Different chains for different needs.',
  plain: 'Three major L2s: Arbitrum for serious DeFi depth, Optimism for public goods builders and Superchain access, Base for mainstream users and Coinbase integration. Pick based on what you actually need.',
  stars: [920, 1132, 1415], target: 1415, coins: 72,
  simulatorLesson: 'bridge',

  examples: [
    {
      contextTag: '[Serious DeFi trader choosing]',
      scenario: 'Marcus trades perpetual futures heavily. He evaluates all three L2s for the best perp trading ecosystem.',
      outcome: 'Arbitrum: GMX (the dominant on-chain perp platform, $500M+ open interest), Gains Network, MUX Protocol — the deepest perp ecosystem on any L2. Optimism: Synthetix perps exist but smaller. Base: no dominant perp platform yet. Decision: Arbitrum, clearly. The specific protocol quality matters more than the general L2 preference. He uses Arbitrum for perps while keeping his DeFi yield positions on Base (Moonwell, Aerodrome) due to Coinbase\'s familiar interface.',
    },
    {
      contextTag: '[Open-source developer, choosing ecosystem]',
      scenario: 'Keiko is building a public goods DeFi tool — a free, open-source portfolio tracker. She evaluates where to deploy for maximum ecosystem alignment and potential funding.',
      outcome: 'Optimism\'s RetroPGF has distributed $60M+ to public goods builders. Projects must be deployed on Optimism (or Superchain chains) to be eligible. She deploys on Optimism — not because it has the best DeFi depth, but because the funding mechanism (RetroPGF) directly rewards what she is building. Her tool gets funded retroactively based on actual usage. Base would give her more mainstream users; Optimism gives her access to the public goods funding ecosystem.',
    },
    {
      contextTag: '[Consumer app developer]',
      scenario: 'Amara is building a payments app for small businesses to accept crypto. Her target users are non-technical small business owners.',
      outcome: 'Arbitrum: technical but no mainstream on-ramp. Optimism: no compelling distribution advantage for small business owners. Base: Coinbase branding creates familiarity for US businesses, Smart Wallet enables no-seed-phrase onboarding, Coinbase\'s USDC focus aligns with stablecoin payments, one-tap from Coinbase means many businesses already have the on-ramp. She chooses Base. The protocol depth matters less than the distribution advantage for her specific use case.',
    },
  ],

  keyTakeaway: 'Choose L2 based on use case: Arbitrum for DeFi depth (GMX, deepest protocols), Optimism for Superchain interoperability and public goods funding, Base for Coinbase on-ramp and mainstream consumer reach. After EIP-4844, fees are similar across all three.',

  guidedPractice: [
    {
      question: 'What is Arbitrum Stylus and why does it matter for DeFi developers?',
      options: [
        'Stylus is Arbitrum\'s UI design system for DeFi protocol frontends',
        'Stylus allows smart contracts to be written in Rust and C++ in addition to Solidity — enabling more performance-intensive applications and access to a larger developer pool',
        'Stylus is Arbitrum\'s staking mechanism for ARB token holders',
        'Stylus is a bridge between Arbitrum and Optimism for cross-chain liquidity',
      ],
      correct: 1,
      hint: 'What limitation of Solidity does Stylus solve for performance-critical applications?',
      explanation: 'Solidity is EVM-specific and has performance limitations for computation-heavy applications. Stylus allows compiling Rust and C++ code to WASM (WebAssembly) running alongside the EVM — significantly more computation-efficient. For DeFi: complex financial calculations, on-chain order books, and performance-critical oracle aggregation become viable. Additionally, Rust and C++ have far larger existing developer communities than Solidity, lowering the talent barrier for building on Arbitrum.',
    },
    {
      question: 'What is Optimism\'s RetroPGF and why does it attract public goods developers?',
      options: [
        'RetroPGF is Optimism\'s retroactive airdrop to long-term OP token holders',
        'Retroactive Public Goods Funding — distributes OP tokens to projects that created verifiable value for the Optimism ecosystem, funded after the fact based on actual impact',
        'A protocol that provides matching funding for DeFi liquidity providers on Optimism',
        'Optimism\'s security bug bounty programme paying researchers retroactively',
      ],
      correct: 1,
      hint: '"Retroactive" means rewarding what already happened. Why is this better for public goods than grants?',
      explanation: 'Traditional grants (pay upfront) reward proposals — you get paid based on what you say you will build. RetroPGF rewards actual impact — you get paid based on what you built and the value it created. This inverts the incentive: instead of writing a good grant application, you must build something genuinely useful. For open-source public goods (which have no revenue model), RetroPGF provides the primary funding mechanism. Projects earn OP tokens proportional to their demonstrated impact, creating sustainable incentives for non-commercial infrastructure.',
    },
    {
      question: 'After EIP-4844 (March 2024), how do fees compare across Base, Optimism, and Arbitrum?',
      options: [
        'Arbitrum is still 10× cheaper than Base due to its more efficient rollup design',
        'Fees are now similar across all three (typically $0.01–$0.10 per transaction) — EIP-4844\'s blob data reduced L2 data posting costs by 80–90% for all OP Stack and Arbitrum chains',
        'Base remains 50% cheaper than Arbitrum due to Coinbase subsidising gas costs',
        'EIP-4844 only reduced fees on Ethereum mainnet, not on L2s',
      ],
      correct: 1,
      hint: 'What did EIP-4844 specifically do for all L2 chains that post data to Ethereum?',
      explanation: 'EIP-4844 introduced "blobs" — a dedicated cheaper data lane for L2 rollup data on Ethereum. Both OP Stack chains (Base, Optimism) and Arbitrum use blobs, reducing their data posting costs by 80–90%. The result: fees across all three major L2s dropped to the $0.01–$0.10 range — making transaction cost no longer a meaningful differentiator. The choice between L2s now hinges on protocol availability, on-ramp, ecosystem, and governance — not fees.',
    },
    {
      question: 'A developer wants maximum interoperability between their Base deployment and other OP Stack chains. What is the mechanism?',
      options: [
        'They must use a third-party bridge for every cross-chain interaction',
        'The Superchain message passing layer enables native communication between Base, Optimism, Zora, Mode, and other OP Stack chains without third-party bridges',
        'Base and Optimism share a single blockchain — cross-chain calls are just internal function calls',
        'Interoperability between OP Stack chains requires ARB governance approval',
      ],
      correct: 1,
      hint: 'What is the Superchain vision and what does shared infrastructure enable?',
      explanation: 'The Superchain is the collective of OP Stack chains — Base, Optimism, Zora, Mode, Cyber, Redstone — sharing a common security and messaging infrastructure. The planned Superchain interoperability protocol allows smart contracts on Base to natively call contracts on Optimism (and vice versa) without a third-party bridge. This native message passing enables composability across chains: a user on Base can interact with an Optimism protocol in one transaction. Base being part of the Superchain is a strategic advantage for cross-chain applications.',
    },
    {
      question: 'For a hedge fund exploring DeFi yield, which L2 would a compliance team most likely approve and why?',
      options: [
        'Optimism — it has the longest track record of all three',
        'Base — operated by Coinbase (NASDAQ-listed, SEC-regulated, existing compliance infrastructure), providing the closest equivalent to a regulated financial institution as a DeFi infrastructure partner',
        'Arbitrum — deepest TVL means most liquidity for large positions',
        'All three are equivalent for compliance purposes — none are regulated',
      ],
      correct: 1,
      hint: 'What does a compliance team look for in infrastructure partners? Who has the clearest regulatory status?',
      explanation: 'A hedge fund compliance team evaluates: regulated entity operating the infrastructure, insurance/asset protection, auditable records, established legal status, and government relationships. Coinbase is NASDAQ-listed, has existing SEC relationships, holds various money transmission licences, and operates under established US regulatory frameworks. No other L2 operator can match this profile. For institutional compliance, "built by a regulated public company" is significantly more defensible than "built by a non-profit foundation." This is Base\'s institutional moat.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 160 — The Superchain: OP Stack Ecosystem
// ─────────────────────────────────────────────────────────────────────────────

const L160: IslandLevel = {
  id: 160, mechanic: 'memory', tier: 'pro',
  topic: 'The Superchain — OP Stack Ecosystem',

  explanation: `
In 2024, Optimism's team articulated a vision that changes how we think about blockchain scaling. Instead of one fast chain or dozens of isolated chains, the Superchain is a network of OP Stack chains that share security, a communication layer, and governance — creating something like an internet of rollups rather than separate islands.

The OP Stack is the open-source framework underlying Optimism, Base, Zora, Mode, Cyber, Redstone, and many others. Any team can fork the OP Stack and deploy a new chain. These chains all share the Ethereum security base (each posts proofs to Ethereum). What differentiates the Superchain is the next layer: shared infrastructure that allows these chains to communicate natively.

The Superchain message passing protocol (in active development as of 2024) allows a smart contract on Base to call a smart contract on Optimism in a single user transaction — no third-party bridge, no manual bridging step, no trust in a bridge operator. The transaction is atomic: either the whole cross-chain action succeeds, or it reverts.

What this enables: a user on Base can interact with a lending protocol on Optimism using Base collateral. A DeFi protocol can deploy identical contracts on 10 Superchain chains and treat them as one unified liquidity layer. NFTs on Zora can be used in DeFi protocols on Base.

The governance layer — the Optimism Collective — maintains and upgrades the OP Stack shared code. Token holders (OP token) vote alongside "Citizen House" (selected individuals voting on public goods). Base participates in governance by contributing to protocol development and sharing sequencer revenue with the Optimism Collective.
  `.trim(),

  fact: 'The Superchain is Optimism\'s vision: OP Stack chains (Base, Optimism, Zora, Mode...) sharing security, native message passing, and governance. Enables atomic cross-chain transactions without bridges within the Superchain.',
  plain: 'The Superchain is multiple chains built on the same OP Stack framework that can talk to each other natively — no bridges needed between them. Base is part of this network, contributing revenue to Optimism\'s governance in exchange.',
  stars: [980, 1206, 1507], target: 1507, coins: 76,
  simulatorLesson: 'agentKitDemo',

  examples: [
    {
      contextTag: '[Developer, Superchain composability]',
      scenario: 'A DeFi protocol wants to deploy on multiple L2s but is frustrated that liquidity is fragmented — $1M on Base + $1M on Optimism cannot be combined without bridging.',
      outcome: 'With Superchain native message passing: the protocol deploys on both Base and Optimism, implementing the cross-chain messaging protocol. Users on Base can now access Optimism liquidity natively. A Base user provides collateral on Base → the protocol\'s cross-chain message → borrows from Optimism liquidity pool → receives funds on Base. One transaction, no bridge. Total accessible liquidity: $2M unified. This is what Superchain interoperability enables for DeFi.',
    },
    {
      contextTag: '[Base and Optimism relationship]',
      scenario: 'Priya asks: "Why does Base contribute revenue to Optimism? Aren\'t they competing?"',
      outcome: 'Base uses the OP Stack — Optimism\'s open-source framework. As part of the Superchain arrangement, Base shares a portion of its sequencer revenue with the Optimism Collective (which funds OP Stack development). In exchange, Base benefits from: continued OP Stack improvements developed by Optimism, shared security research, Superchain interoperability features, and the legitimacy of the broader OP ecosystem. It is a collaborative relationship, not a competitive one — like franchisees contributing to a shared brand and infrastructure.',
    },
    {
      contextTag: '[Atomic cross-chain transaction]',
      scenario: 'Marcus wants to collateralise his Base ETH to borrow Optimism USDC in one step, without manually bridging.',
      outcome: 'With Superchain messaging: a cross-chain lending protocol handles this natively. Marcus signs one transaction on Base: "deposit 1 ETH as collateral, borrow 2,000 USDC on Optimism." The Superchain messaging layer handles: lock ETH on Base, verify on Optimism, issue 2,000 USDC on Optimism to Marcus. If any step fails: entire transaction reverts. Marcus ends with either (ETH still on Base + 2,000 USDC on Optimism) or exactly what he started with. Atomic = no partial failure states.',
    },
  ],

  keyTakeaway: 'The Superchain is OP Stack chains sharing security, native message passing, and governance. Base participates by sharing sequencer revenue. The result: atomic cross-chain transactions within the Superchain without bridge trust assumptions.',

  guidedPractice: [
    {
      question: 'What makes Superchain message passing different from using a third-party bridge?',
      options: [
        'Superchain messages are faster than any bridge',
        'Superchain messaging is native to the OP Stack protocol — no third-party smart contract trust required, and cross-chain transactions can be atomic (all-or-nothing) rather than two separate transactions',
        'Superchain messaging is free, while bridges charge fees',
        'Third-party bridges cannot move assets between Base and Optimism',
      ],
      correct: 1,
      hint: 'What trust assumption does a third-party bridge require that Superchain messaging avoids?',
      explanation: 'Third-party bridges require trusting a separate protocol\'s smart contracts, liquidity pool solvency, and validator/oracle security. If the bridge protocol has a bug or is hacked, your funds are at risk. Superchain messaging uses the shared OP Stack infrastructure — the same layer that posts all OP Stack chain data to Ethereum. No additional trust required beyond what you already assume using Base or Optimism. Additionally, native messaging enables atomic transactions: the cross-chain action either fully succeeds or fully reverts, preventing partial failure states that bridges can create.',
    },
    {
      question: 'Why does Base share sequencer revenue with the Optimism Collective?',
      options: [
        'Ethereum requires all L2s to share revenue with L2 governance bodies',
        'As part of the Superchain arrangement, Base uses the OP Stack (built and maintained by Optimism) and contributes revenue in exchange for continued development, shared security research, and Superchain interoperability benefits',
        'The Optimism Collective owns Coinbase and receives revenue as shareholders',
        'Base shares revenue to prevent Optimism from launching a competing chain',
      ],
      correct: 1,
      hint: 'What does Base get from Optimism in exchange for sharing revenue?',
      explanation: 'The Superchain arrangement is a revenue-sharing partnership: Base uses Optimism\'s OP Stack codebase and benefits from ongoing development (including Superchain messaging, security research, and protocol improvements). In exchange, Base contributes a portion of sequencer revenue to the Optimism Collective, which funds this development. It is structured similarly to a franchise arrangement: Base benefits from shared infrastructure and brand, Optimism benefits from revenue from the most successful OP Stack chain.',
    },
    {
      question: 'What is the Optimism Collective governance model and how does it differ from typical token governance?',
      options: [
        'Optimism uses pure token voting — OP holders decide all protocol parameters',
        'The Optimism Collective has two houses: Token House (OP token holders voting on protocol upgrades) and Citizens\' House (selected individuals voting on public goods funding) — preventing pure token plutocracy',
        'Governance is controlled entirely by Optimism Foundation with no token voting',
        'Base controls Optimism governance as the largest revenue contributor',
      ],
      correct: 1,
      hint: 'What problem does having two separate voting bodies solve?',
      explanation: 'Pure token governance (one token = one vote) concentrates power in large holders who optimise for token price, not necessarily for ecosystem health. The two-house model separates concerns: Token House votes on protocol upgrades and economics (where token holders have legitimate interests). Citizens\' House votes on public goods funding (RetroPGF) using selected individuals focused on ecosystem impact rather than financial return. This prevents wealthy holders from capturing public goods funding while still giving token holders meaningful governance over protocol economics.',
    },
    {
      question: 'A project deploys on Zora (an OP Stack chain) and wants users to interact with it from Base. What enables this?',
      options: [
        'They must deploy a separate version on Base — OP Stack chains are independent',
        'Superchain native message passing allows Base users to interact with Zora contracts natively, as both chains share the OP Stack communication layer',
        'All OP Stack chains share the same address space — a Base wallet automatically works on Zora',
        'Coinbase handles the cross-chain routing automatically for all Superchain interactions',
      ],
      correct: 1,
      hint: 'What does "shared communication layer" mean for user interactions across Superchain chains?',
      explanation: 'The Superchain\'s native message passing protocol allows smart contracts on any OP Stack chain to send messages to contracts on any other OP Stack chain. A Base user can initiate a transaction that triggers contract execution on Zora — without manually bridging or using a third-party service. The OP Stack shared infrastructure handles the message verification and delivery. From the user\'s perspective: one signature on Base, execution happens on Zora, result returned to Base. Native cross-chain composability within the Superchain.',
    },
    {
      question: 'How does the Superchain model address the "liquidity fragmentation" problem of multiple isolated L2s?',
      options: [
        'It does not — each Superchain chain still has separate liquidity pools',
        'Native message passing allows DeFi protocols to aggregate liquidity across multiple Superchain chains — a user on Base can access Optimism liquidity in one atomic transaction, effectively pooling TVL across chains',
        'The Superchain maintains a single shared liquidity pool accessible from all chains',
        'Liquidity is automatically rebalanced between Superchain chains by the Optimism Foundation',
      ],
      correct: 1,
      hint: 'How does atomic cross-chain messaging change the effective liquidity available to a Base user?',
      explanation: 'Without Superchain: $500M Base TVL + $400M Optimism TVL = $900M total, but users on each chain can only access their own chain\'s portion. Large trades face high slippage because they are limited to one chain\'s liquidity depth. With Superchain native messaging: a DeFi protocol can route a Base user\'s swap across both liquidity pools in one transaction — effectively offering $900M depth for execution. Fragmented liquidity becomes unified depth when native cross-chain execution is atomic. This is the Superchain\'s primary DeFi value proposition.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 161 — Base Grants, Ecosystem Incentives and Developer Onboarding
// ─────────────────────────────────────────────────────────────────────────────

const L161: IslandLevel = {
  id: 161, mechanic: 'chain', tier: 'pro',
  topic: 'Base Grants and Ecosystem Incentives',

  explanation: `
In 2024, Base distributed over $10 million in grants to developers building on its ecosystem. Unlike Ethereum foundation grants (focused on protocol research) or Optimism's RetroPGF (retroactive and impact-based), Base grants are largely prospective — funding projects before they build, based on their potential to attract users to Base.

The Base Ecosystem Fund is Coinbase's primary grant mechanism. Applications are reviewed quarterly. Typical grant sizes range from $10,000–$500,000 depending on project scope. Priority sectors: consumer apps, DeFi infrastructure, developer tools, and applications with clear Coinbase user on-ramp alignment.

Optimism's RetroPGF is also accessible to Base projects, since Base is a Superchain member. Projects that build genuinely useful Base infrastructure can apply for retroactive funding based on demonstrated impact — measured by metrics like active users, transaction volume, and developer usage. This creates two complementary funding paths: prospective (Base grants) and retroactive (RetroPGF).

Base's developer infrastructure: Base Sepolia (testnet, free transactions for testing), official documentation at docs.base.org, a faucet for testnet ETH, Hardhat and Foundry support identical to Ethereum mainnet, and Coinbase's cloud engineering support for high-priority projects.

For independent developers: the most accessible path to Base grants is building applications that demonstrably bring new users to Base from Coinbase's existing base (pun intended). The evaluation criteria consistently weight user acquisition — how many non-crypto-native users does this product onboard? — above technical sophistication.
  `.trim(),

  fact: 'Base Ecosystem Fund: prospective grants $10K–$500K, quarterly review, priority on consumer apps bringing Coinbase users on-chain. RetroPGF also accessible to Base projects via Superchain membership. Base Sepolia provides free testnet infrastructure.',
  plain: 'Base pays developers to build on it — up to $500K per project. Priority goes to apps that bring regular Coinbase users into DeFi. Optimism\'s retroactive grants are also available. Testnet is free.',
  stars: [1040, 1280, 1600], target: 1600, coins: 80,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Grant application evaluation]',
      scenario: 'Two teams apply to the Base Ecosystem Fund. Team A: a new AMM DEX with novel bonding curve mathematics. Team B: a consumer budgeting app that lets non-crypto users save in USDC on Base via Coinbase.',
      outcome: 'Base\'s evaluation: Team A builds technical infrastructure but attracts DeFi-native users (already on Base). Team B brings new users — Coinbase\'s existing 100M-person audience — onto Base for the first time. Base\'s strategic priority is user growth from the Coinbase mainstream. Team B receives a larger grant. Technical sophistication matters less than user acquisition from non-crypto-native audiences in Base\'s grant evaluation framework.',
    },
    {
      contextTag: '[RetroPGF for Base builder]',
      scenario: 'Amara builds an open-source Base transaction monitoring tool used by 8,000 developers. She applies for Optimism RetroPGF.',
      outcome: 'Her tool helps developers building on Base — a Superchain chain. Optimism RetroPGF recognises value created for the broader OP Stack ecosystem, including Base. Her tool\'s metrics: 8,000 developer users, 2M daily API calls, open-source with 40 contributors. RetroPGF round distributes 85,000 OP tokens based on these impact metrics (~$85,000 at $1/OP). She received no grant upfront — the retroactive model rewarded demonstrated impact.',
    },
    {
      contextTag: '[Testnet development flow]',
      scenario: 'Marcus is building a new lending protocol on Base. He sets up his development environment.',
      outcome: 'Base Sepolia setup: add network to MetaMask (chainId: 84532, RPC: sepolia.base.org), get testnet ETH from faucet.quicknode.com/drip/base-sepolia. Deploy with Foundry: `forge create --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY`. Identical to Ethereum Sepolia workflow — no Base-specific tooling required. He tests his lending contract for 3 weeks on Sepolia. Cost: $0. When he mainnet-launches, his codebase requires zero changes for Base mainnet deployment.',
    },
  ],

  keyTakeaway: 'Base offers prospective grants ($10K–$500K) via the Base Ecosystem Fund with priority on consumer apps, plus access to Optimism\'s retroactive RetroPGF. Developer tooling is identical to Ethereum — no new learning curve for existing EVM developers.',

  guidedPractice: [
    {
      question: 'What is the primary evaluation criterion for Base Ecosystem Fund grants?',
      options: [
        'Technical novelty — projects must demonstrate innovations not possible on other chains',
        'User acquisition potential — priority goes to applications that bring Coinbase\'s existing non-crypto-native users onto Base for the first time',
        'TVL generation — projects must demonstrate how they will attract $10M+ in deposits',
        'Token economics — projects must issue a token on Base to qualify',
      ],
      correct: 1,
      hint: 'What is Base\'s strategic goal as Coinbase\'s L2? What kind of new user are they trying to onboard?',
      explanation: 'Base\'s strategic advantage is Coinbase\'s 100M user base — people with verified accounts and bank-linked crypto holdings who have not yet used DeFi. The Ecosystem Fund prioritises projects that create a bridge between Coinbase\'s mainstream users and on-chain experiences. A technically sophisticated DeFi protocol that only attracts existing DeFi users does not advance Base\'s strategic goal. An app that lets a Coinbase user passively earn yield without understanding wallets or gas advances it significantly.',
    },
    {
      question: 'Why can a Base project apply for both Base Ecosystem Fund grants AND Optimism RetroPGF?',
      options: [
        'Base and Optimism are the same company — their grants are interchangeable',
        'Base is a Superchain member — projects creating value for the Base ecosystem also create value for the broader OP Stack ecosystem that Optimism RetroPGF funds',
        'Optimism RetroPGF automatically distributes to all projects on any OP Stack chain',
        'The Coinbase Foundation administers both grant programmes simultaneously',
      ],
      correct: 1,
      hint: 'What is the Superchain relationship between Base and Optimism?',
      explanation: 'Base\'s Superchain membership means Base is part of the broader OP Stack ecosystem that Optimism\'s RetroPGF funds. Developer tools that help Base builders also help Optimism builders (and vice versa, given identical tooling). Infrastructure projects that improve the OP Stack benefit all Superchain chains. Optimism RetroPGF evaluates impact on the entire OP Stack ecosystem — Base projects demonstrating real-world usage and value creation are eligible regardless of which specific Superchain chain they operate on.',
    },
    {
      question: 'How does Base\'s development environment compare to Ethereum mainnet for an experienced Solidity developer?',
      options: [
        'Base requires a completely new toolset — Base SDK replaces Hardhat and Foundry',
        'Identical — Base uses the same Solidity, Hardhat, Foundry, Ethers.js tooling as Ethereum. The only change is the RPC endpoint and chain ID',
        'Base development requires Rust instead of Solidity for optimal performance',
        'Developers must use Coinbase\'s proprietary IDE for Base contract development',
      ],
      correct: 1,
      hint: 'What is Base built on? Does that change the development tools?',
      explanation: 'Base is EVM-compatible — it runs the Ethereum Virtual Machine. Solidity contracts compile identically, Hardhat and Foundry work without changes, Ethers.js and Viem connect identically, OpenZeppelin contracts deploy without modification. The only developer-visible changes: RPC URL (sepolia.base.org for testnet, mainnet.base.org for mainnet) and chain ID (84532 testnet, 8453 mainnet). An Ethereum developer can deploy to Base in 5 minutes with zero learning curve.',
    },
    {
      question: 'What is the difference between Base\'s prospective grants and Optimism\'s RetroPGF?',
      options: [
        'Base grants are in USDC; RetroPGF is in OP tokens — no other difference',
        'Base grants fund projects before they build based on potential (prospective). RetroPGF rewards demonstrated impact after the fact (retroactive) — requiring no upfront application, just evidence of real-world value created',
        'RetroPGF is only available to non-commercial open-source projects',
        'Base grants are interest-free loans; RetroPGF is non-repayable grants',
      ],
      correct: 1,
      hint: 'When does each funding mechanism pay out? What does each evaluate?',
      explanation: 'Prospective (Base grants): you apply before building, describe what you will create, receive funding upfront. Evaluation: proposal quality, team capability, strategic fit. Risk: you might not deliver or the market might not respond. Retroactive (RetroPGF): you build first, demonstrate impact with metrics, apply for retroactive funding. Evaluation: actual usage data, demonstrated value, real-world impact. The retroactive model has no application fraud risk — you cannot fake 8,000 daily active users. The prospective model enables earlier-stage projects. Both mechanisms complement each other.',
    },
    {
      question: 'A developer building on Base Sepolia testnet accidentally deploys a contract with a bug. What is the practical consequence?',
      options: [
        'They owe gas fees for the buggy deployment and must pay to fix it',
        'No financial consequence — testnet ETH is free and worthless. They simply redeploy the corrected contract and continue testing',
        'The bug is automatically reported to Coinbase\'s security team',
        'The contract is permanently deployed and cannot be corrected on testnet',
      ],
      correct: 1,
      hint: 'What is the value of testnet ETH? What does that mean for mistakes?',
      explanation: 'Testnet ETH has zero real value — it is acquired for free from faucets specifically for development testing. A buggy deployment on Base Sepolia: costs some testnet ETH (worthless) and requires redeployment (also free). The developer fixes the bug, deploys the corrected contract, and continues testing. This is precisely the purpose of testnets — a zero-cost environment to find and fix bugs before any real money is involved. Mainnet deployment of a buggy contract could result in permanent loss of user funds.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 162 — Advanced Base DeFi: Concentrated Liquidity on Aerodrome v3
// ─────────────────────────────────────────────────────────────────────────────

const L162: IslandLevel = {
  id: 162, mechanic: 'memory', tier: 'pro',
  topic: 'Advanced Base DeFi — Concentrated Liquidity on Aerodrome v3',

  explanation: `
In standard AMMs (like Aerodrome v2), your liquidity is spread across every possible price — from $0 to infinity. This means only a tiny fraction of your capital is actually working at any given time. If ETH is trading at $3,000, your $10,000 LP position might only have $200 actively earning fees near the current price. The rest is dormant.

Aerodrome v3 (a concentrated liquidity implementation) solves this by letting LPs specify a price range. You say: "I will provide liquidity only between $2,800 and $3,200 for ETH/USDC." All $10,000 of your capital is concentrated in that range — earning fees on every trade that happens between $2,800 and $3,200. If price stays in your range, you earn dramatically more fees than a standard LP with the same capital.

The trade-off: if ETH price moves outside your range ($3,200 or below $2,800), your position becomes 100% the cheaper asset — you hold all USDC if price goes above $3,200, or all ETH if price goes below $2,800 — and earns zero fees until price returns to your range. This "out-of-range" state is a form of severe impermanent loss.

Managing concentrated liquidity positions requires active attention: you must monitor price and either set wider ranges (less capital efficiency, more time in range) or actively rebalance (set new ranges, incurring gas costs). Automated range managers — Gamma Strategies integrated with Aerodrome — handle rebalancing automatically for a fee (0.5–2% of position value annually).

For USDC/USDT stable pools: concentrated liquidity makes extreme sense — price should always be between $0.999 and $1.001, so a very tight range captures maximum fees with no realistic out-of-range risk.
  `.trim(),

  fact: 'Concentrated liquidity (Aerodrome v3) lets LPs specify a price range — all capital earns fees within that range, earning significantly more than standard AMMs. If price exits the range: position becomes 100% one asset and earns zero fees.',
  plain: 'Put your liquidity in a price range instead of spreading it everywhere. Earn more fees when price is in your range. If price moves out: you hold only one token and earn nothing until it returns.',
  stars: [1100, 1354, 1692], target: 1692, coins: 84,
  simulatorLesson: 'aerodromeSwap',

  examples: [
    {
      contextTag: '[Range selection trade-off]',
      scenario: 'Marcus provides $10,000 to an ETH/USDC pool on Aerodrome v3. ETH is at $3,000. He compares two ranges: $2,500–$3,500 (wide) vs $2,900–$3,100 (narrow).',
      outcome: 'Wide range ($2,500–$3,500): 40% capital efficiency improvement vs v2. Lower fees per dollar. But price can move 17% before going out of range. Narrow range ($2,900–$3,100): 5× capital efficiency vs v2. Much higher fees per dollar. But price only needs to move 3.3% before going out of range. He chooses the wide range: higher chance of staying in range for the next 30 days, less monitoring required, reasonable fee improvement over v2.',
    },
    {
      contextTag: '[USDC/USDT tight range]',
      scenario: 'Amara provides $50,000 to an Aerodrome v3 USDC/USDT pool. She sets a range of $0.9990–$1.0010.',
      outcome: 'USDC and USDT should always trade within this 0.2% range — their stablecoin peg ensures it. Her $50,000 concentrated in a 0.2% range earns the same fees as $500,000 in a standard AMM. APY: ~25% from fees alone (the tight range means her capital is working 50× more efficiently). Out-of-range risk: negligible for established stablecoins. This is the ideal concentrated liquidity use case: correlated assets where the range is effectively guaranteed.',
    },
    {
      contextTag: '[Out-of-range consequence]',
      scenario: 'Keiko set a $2,800–$3,200 range for ETH/USDC with $20,000 at ETH = $3,050. ETH pumps to $3,400.',
      outcome: 'At $3,200 (her upper boundary), the position became 100% USDC. ETH\'s continued rise to $3,400 means she sold all her ETH at $3,200 average and now holds only USDC. She missed the $3,200→$3,400 ETH gain. To re-enter: she must decide whether to set a new higher range, reset at current prices, or wait for price to return to $3,200. Her position earns zero fees at $3,400. Out-of-range positions require active management — she should have set a wider range or used an automated range manager.',
    },
  ],

  keyTakeaway: 'Concentrated liquidity multiplies fee earnings by concentrating capital in a price range. Trade-off: out-of-range positions earn zero fees and become 100% the cheaper asset. Best for: stable pairs (tight range, guaranteed in-range), or managed with automated range managers for volatile pairs.',

  guidedPractice: [
    {
      question: 'Why does concentrated liquidity earn more fees than standard AMM liquidity for the same capital?',
      options: [
        'Concentrated LPs receive bonus AERO emissions for advanced participation',
        'All capital is active within the specified price range — instead of $200 working near the current price with $9,800 dormant, all $10,000 earns fees on every trade within the range',
        'Concentrated liquidity reduces gas costs, passing savings to LPs',
        'Aerodrome charges higher fees on concentrated pools to incentivise more sophisticated LPs',
      ],
      correct: 1,
      hint: 'In a standard AMM, what fraction of your capital is actually earning fees at any given price?',
      explanation: 'Standard AMM: liquidity spread from $0 to ∞. If ETH is at $3,000, only the tiny fraction of your LP near $3,000 is active. On a $10,000 position across a full range, perhaps $200 earns fees currently — 2% efficiency. Concentrated LP in $2,800–$3,200: all $10,000 is active while price is in that range — 100% efficiency within the range. Same total fees from trading volume, but distributed among 50× less capital in the range = 50× more fees per dollar of concentrated LP capital.',
    },
    {
      question: 'ETH is at $3,000. You set a concentrated LP range of $2,800–$3,200. ETH drops to $2,700. What happens to your position?',
      options: [
        'Your position continues earning fees — it just adjusts the ratio of ETH and USDC',
        'Your position becomes 100% ETH (you sold all USDC at $2,800 as price descended through your lower bound) and earns zero fees until price returns above $2,800',
        'Your position is liquidated and you receive ETH at the liquidation price',
        'The position automatically resets its range around the new $2,700 price',
      ],
      correct: 1,
      hint: 'What happens at the lower boundary of a concentrated liquidity range?',
      explanation: 'As ETH descends from $3,000 toward $2,800, the AMM continuously sells USDC and buys ETH to maintain the price curve. By the time price hits $2,800 (your lower boundary), the position is 100% ETH — you have sold all your USDC into the declining ETH. Below $2,800, you hold all ETH and earn zero fees. This is the concentrated liquidity equivalent of impermanent loss: instead of losing gradually, you are fully exposed to the cheaper asset at the boundary. If ETH continues dropping to $2,000, your "stablecoin + ETH" position is now all ETH worth $2,000 instead of your original mixed position.',
    },
    {
      question: 'For which asset pair is concentrated liquidity most risk-free and why?',
      options: [
        'ETH/BTC — both are blue chip assets with correlated price movements',
        'USDC/USDT — both are USD-pegged stablecoins that should always trade between $0.999–$1.001, making out-of-range risk essentially zero for established pegs',
        'ETH/SOL — both are layer-1 tokens with similar market cap growth',
        'cbBTC/WBTC — both represent 1 BTC, so price should always be equal',
      ],
      correct: 1,
      hint: 'For which pair is the price range guaranteed by an external mechanism (the stablecoin peg)?',
      explanation: 'USDC and USDT are both pegged to $1 by their respective issuers. In normal market conditions, they trade between $0.9990–$1.0010. A concentrated LP range of $0.998–$1.002 has near-zero probability of going out of range (unless a stablecoin depegs — a low probability but catastrophic tail risk). All capital earns fees continuously. Compare to ETH/USDC: ETH price can move 20% in 24 hours, frequently going out of any reasonable range and stopping fee accrual.',
    },
    {
      question: 'What do automated range managers like Gamma Strategies do for concentrated LP positions?',
      options: [
        'They guarantee your position always stays in range by locking ETH price',
        'They monitor price movements and automatically adjust (rebalance) your LP range to keep it centred around the current price, removing the need for active management',
        'They stake your LP tokens for additional AERO rewards',
        'They execute trades to reduce impermanent loss when positions go out of range',
      ],
      correct: 1,
      hint: 'What problem does a concentrated LP position require human intervention for?',
      explanation: 'The core challenge of concentrated liquidity: ranges must be actively monitored and adjusted when price moves significantly. If ETH moves from $3,000 to $3,500, your $2,800–$3,200 range is now out of range and earning zero fees. You must manually withdraw, set a new $3,300–$3,700 range, and redeposit — incurring gas costs. Automated range managers (Gamma, Arrakis, Charm) do this automatically: when price moves outside a threshold, they withdraw, rebalance, and re-enter a centred range. You pay a management fee (0.5–2% annually) and receive hands-free concentrated liquidity.',
    },
    {
      question: 'You set a very tight $2,990–$3,010 range for ETH/USDC to maximise fee income. What is the realistic risk for a 30-day period?',
      options: [
        'Low risk — the tight range will always earn maximum fees over 30 days',
        'High risk of going out of range — ETH rarely stays within a $20 band for 30 days. The position may earn high fees for hours then sit out-of-range for weeks, producing lower total fees than a wider range',
        'The tight range earns exactly the same as a wider range over 30 days',
        'Tight ranges are protected by Aerodrome\'s smart contract from going out of range',
      ],
      correct: 1,
      hint: 'How often does ETH price stay within a $20 range for an entire month?',
      explanation: 'ETH\'s typical daily volatility is 3–8%. A $20 range on a $3,000 price is 0.67% — ETH will exit this range multiple times per day. The position earns maximum fees for the hours it is in range, then earns nothing when out of range. Over 30 days, a $2,990–$3,010 range might be active only 5% of the time. A $2,700–$3,300 range might be active 60% of the time, earning less per active hour but far more total. The optimal range width balances capital efficiency (tighter = more per hour in range) with time in range (wider = more hours earning).',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 163 — Base Security Considerations
// ─────────────────────────────────────────────────────────────────────────────

const L163: IslandLevel = {
  id: 163, mechanic: 'chain', tier: 'pro',
  topic: 'Base Security Considerations',

  explanation: `
Base is often described as the "safest" L2 because Coinbase operates it. This framing is partially correct — and partially misleading. Understanding exactly what Coinbase's involvement secures and what it does not is essential for making informed decisions about where to hold significant value.

What Base inherits from Ethereum: the canonical security. Transaction validity is ultimately enforced by Ethereum's 900,000+ validator set. If Base's sequencer (operated by Coinbase) tried to post fraudulent state, fraud provers have 7 days to challenge it on Ethereum. The underlying funds cannot be stolen by the sequencer — they are secured by Ethereum.

What the centralised sequencer means: Coinbase's sequencer processes and orders transactions. It can theoretically: (1) censor specific addresses or transactions (refuse to include them), (2) extract MEV (reorder transactions to profit), and (3) experience downtime (if Coinbase's sequencer goes offline, Base stops processing new transactions). None of these threaten your funds directly — but they affect your ability to transact.

Smart contract risk on Base: identical to any EVM chain. Protocols on Base — Moonwell, Aerodrome, Seamless — have their own smart contract risks. An exploit in Moonwell loses Moonwell users' funds regardless of Coinbase's security infrastructure. Always evaluate each protocol's audit history, TVL age, and admin key structure independently.

The Coinbase-specific risk: regulatory action. If a US government authority ordered Coinbase to freeze addresses on Base, Coinbase has the infrastructure and legal obligation to comply. This is a real (if low-probability) risk for addresses that might be involved in regulatory actions.
  `.trim(),

  fact: 'Base security: Ethereum-secured transaction validity (cannot steal funds), centralised Coinbase sequencer (can censor, extract MEV, go offline), protocol-level smart contract risk (Moonwell/Aerodrome have independent risks), and Coinbase regulatory compliance risk.',
  plain: 'Base can\'t steal your funds — Ethereum secures that. But Coinbase\'s sequencer can censor your transactions, and US regulators can compel Coinbase to freeze addresses. Protocol risks (Moonwell bugs etc.) are separate from Base\'s security.',
  stars: [1160, 1427, 1784], target: 1784, coins: 88,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Sequencer downtime]',
      scenario: 'Coinbase\'s sequencer experiences a 4-hour outage. Marcus has an active position in Moonwell with a health factor of 1.15 — close to liquidation. ETH drops 8% during the outage.',
      outcome: 'During the outage, no new transactions can be submitted to Base. Marcus cannot add collateral or repay debt. ETH\'s 8% drop pushes his health factor below 1.0 — the Moonwell liquidation threshold. When the sequencer resumes, liquidation bots immediately process his position. He is liquidated, losing 5–10% of his collateral. The sequencer downtime did not steal his funds — but it prevented him from protecting his position. Lesson: maintain health factors well above 1.3 on any chain with sequencer centralisation risk.',
    },
    {
      contextTag: '[Smart contract risk is separate]',
      scenario: 'Amara believes Base is safe because Coinbase operates it. She deposits $40,000 into a new, unaudited Base DeFi protocol that claims 40% APY.',
      outcome: 'The new protocol has a reentrancy vulnerability. A hacker exploits it and drains $2M across all depositors, including Amara\'s $40,000. Coinbase\'s operation of Base provided zero protection for protocol-level smart contract vulnerabilities. This is not a Base security failure — it is an Amara security failure in not evaluating protocol-level risk independently. Base\'s security only covers transaction validity; it makes no guarantees about any individual protocol deployed on it.',
    },
    {
      contextTag: '[Regulatory compliance risk]',
      scenario: 'A government agency issues a legal order to Coinbase to freeze all transactions from a specific address on Base. The address is not Keiko\'s, but it is a protocol she has deposited into.',
      outcome: 'Coinbase complies with the legal order. The sequencer stops including transactions from the flagged address. If the flagged address is a protocol\'s admin wallet, the protocol\'s admin functions (emergency pause, upgrade) may be blocked. Keiko\'s own address is not flagged — she can still withdraw. This illustrates the realistic regulatory compliance risk: not mass seizure of user funds, but targeted operational interference with specific addresses that Coinbase is legally obligated to act on.',
    },
  ],

  keyTakeaway: 'Base\'s security layers: Ethereum secures transaction validity (cannot steal funds), but Coinbase\'s centralised sequencer can censor transactions, and regulatory orders can compel compliance actions. Protocol risks (smart contract bugs) are entirely separate and must be evaluated independently per protocol.',

  guidedPractice: [
    {
      question: 'Can Coinbase\'s sequencer steal funds held on Base?',
      options: [
        'Yes — as the sequencer operator, Coinbase has technical access to all Base funds',
        'No — the canonical state of Base is enforced by Ethereum. Even if the sequencer tried to post fraudulent state, Ethereum\'s fraud proof mechanism would catch it during the 7-day challenge period',
        'Only funds in Coinbase-operated protocols (like Moonwell) can be seized',
        'Sequencer theft is theoretically possible but insured by Coinbase',
      ],
      correct: 1,
      hint: 'What is the purpose of the 7-day fraud proof window in optimistic rollups?',
      explanation: 'The sequencer orders and publishes transactions but cannot create invalid state transitions. Ethereum\'s fraud proof mechanism: any honest validator can challenge an invalid state transition during the 7-day window. If the challenge succeeds (proves the state was fraudulent), the invalid state is rejected. This means the sequencer cannot fabricate transactions that steal funds — Ethereum\'s validators would reject the fraudulent state. The sequencer\'s power is limited to transaction ordering and inclusion — not to creating invalid transfers.',
    },
    {
      question: 'What is the practical risk of Coinbase\'s centralised sequencer for DeFi positions?',
      options: [
        'The sequencer can steal deposits from Moonwell and Aerodrome',
        'Sequencer downtime prevents transaction submission — during outages, users cannot protect margin positions, add collateral, or exit positions that approach liquidation thresholds',
        'The sequencer charges higher fees than decentralised alternatives',
        'Centralised sequencers cannot process smart contract interactions, only ETH transfers',
      ],
      correct: 1,
      hint: 'If you cannot submit transactions for 4 hours, what DeFi positions become dangerous?',
      explanation: 'Leveraged DeFi positions (borrowing near liquidation threshold) require active management — adding collateral when price moves against you. If the sequencer goes offline for hours and price moves significantly, you cannot protect positions that approach liquidation. This is the main practical risk: not fund theft, but inability to act during critical market moments. Risk mitigation: keep health factors well above liquidation thresholds (1.5+ rather than 1.1), avoid maximum leverage, set up automated liquidation alerts.',
    },
    {
      question: 'You deposit $20,000 to a Base DeFi protocol that has been live for 3 months with no audit. What risk does this carry that Base\'s Ethereum security does not cover?',
      options: [
        'No risk — Base\'s Ethereum security covers all protocol-level risks',
        'Smart contract vulnerability risk — if the protocol has a bug, your $20,000 can be drained regardless of Base\'s security layer. Ethereum secures transaction validity; it makes no guarantees about individual protocol code quality',
        'Regulatory risk — new protocols are not approved by Coinbase compliance',
        'Gas risk — unaudited protocols charge higher gas fees',
      ],
      correct: 1,
      hint: 'What does Ethereum security actually protect? What does it not protect?',
      explanation: 'Ethereum\'s security layer (enforced through Base) guarantees: valid transactions are included, invalid transfers cannot be fabricated, sequencer cannot steal funds by posting false state. It does NOT guarantee: the protocols deployed on Base are bug-free, the code does what it claims, admin keys are safe, or the protocol cannot be exploited through logic vulnerabilities. An unaudited 3-month-old protocol has unknown vulnerability risk that is entirely independent of Base\'s security architecture.',
    },
    {
      question: 'Under what circumstances might Coinbase comply with a government order related to Base addresses?',
      options: [
        'Never — Base is a decentralised protocol and Coinbase has no ability to comply',
        'If a US government authority issues a legal order, Coinbase as a regulated US entity is legally obligated to comply — which could include refusing to process transactions from specific flagged addresses via the sequencer',
        'Only if the order involves more than $1M in assets',
        'Only if the Base community DAO votes to comply via on-chain governance',
      ],
      correct: 1,
      hint: 'What is Coinbase\'s legal status? What obligations come with being a NASDAQ-listed US company?',
      explanation: 'Coinbase is a publicly listed US company subject to US law. OFAC sanctions, court orders, SEC enforcement actions, and FBI/DOJ subpoenas are legally binding on Coinbase. If ordered to freeze an address\'s ability to transact via the Base sequencer, Coinbase must comply — similar to how a bank must comply with account freeze orders. This does not mean Coinbase can steal funds (the Ethereum layer prevents that), but it can prevent specific addresses from submitting transactions through the centralised sequencer. This is a real, if low-probability, risk for users in regulatory grey areas.',
    },
    {
      question: 'How should you protect a leveraged Base DeFi position against sequencer downtime risk?',
      options: [
        'Move to a decentralised sequencer protocol — Base is planning this migration',
        'Maintain health factors significantly above liquidation thresholds (1.5+), set up automated liquidation alerts, and size leveraged positions conservatively enough to survive hours of inability to respond',
        'Only use Coinbase-operated protocols which have sequencer downtime protection built in',
        'Avoid all DeFi on Base — sequencer risk makes it fundamentally unsafe',
      ],
      correct: 1,
      hint: 'If you cannot submit transactions for 4 hours, what health factor is safe?',
      explanation: 'Risk mitigation for sequencer downtime: health factor 1.5+ gives you a 33% price buffer before liquidation — significant cushion even during a 4-hour outage with volatile markets. Automated alerts (Defisaver, Hal.finance) can trigger emergency actions but are also limited by sequencer availability. Conservative position sizing means a bad sequencer outage is painful but not catastrophic. Avoiding leverage entirely eliminates the risk. Base is planning sequencer decentralisation — but until that is live, centralised sequencer risk is real and must be managed.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 164 — Real-World Use Cases: Base for Consumer Applications
// ─────────────────────────────────────────────────────────────────────────────

const L164: IslandLevel = {
  id: 164, mechanic: 'match3', tier: 'pro',
  topic: 'Real-World Use Cases — Base for Consumer Applications',

  explanation: `
In October 2023, a social app called friend.tech launched on Base. Users bought "keys" (shares) in each other's accounts to access private chat. At peak, friend.tech processed 200,000 transactions per day — more social interactions on one Base app than all social apps on Ethereum had historically. It generated $50M in protocol fees in 60 days. The app felt like Twitter with a financial layer. This was Base's vision actualised.

Base is intentionally positioned for consumer applications — apps used by people who do not self-identify as crypto users. Three properties make Base particularly suited for this:

Low fees: at $0.01–$0.10 per transaction, actions that would be irrational on Ethereum mainnet ($5–$50 gas) become viable. Tipping $1 to a creator costs $0.02 in gas — 2% overhead vs 500% overhead. This enables micropayment applications that were economically impossible before.

Account abstraction (ERC-4337): Coinbase Smart Wallet enables seedless, passkey-based accounts. Users sign up with Face ID, not a seed phrase. Gas can be sponsored — users never see the "you need ETH for gas" barrier. Approve and execute can be batched into one tap. The UX becomes indistinguishable from a traditional app.

Coinbase distribution: developers building on Base can integrate with Coinbase Pay, Coinbase Wallet, and potentially reach Coinbase's 100M user base. This distribution advantage is unavailable on any other chain.

Emerging consumer categories on Base: social (friend.tech, Farcaster frames), creator monetisation (USDC tipping, NFT access passes), retail payment rails (stablecoin payments for goods and services), and loyalty programmes (tokenised rewards).
  `.trim(),

  fact: 'Base\'s consumer application advantages: $0.01–$0.10 fees (enabling micropayments), ERC-4337 Smart Wallet (seedless, passkey UX), and Coinbase distribution (100M user on-ramp). friend.tech generated $50M in fees in 60 days with 200K daily transactions.',
  plain: 'Base is built for apps regular people use without knowing it\'s crypto. Cheap transactions, no seed phrase with Smart Wallet, and Coinbase\'s massive user base make it the best chain for consumer apps.',
  stars: [1220, 1502, 1877], target: 1877, coins: 92,
  simulatorLesson: 'baseMemeculture',

  examples: [
    {
      contextTag: '[Creator monetisation app]',
      scenario: 'Priya builds an app where newsletter readers tip writers in USDC. Her readers are not crypto users. She evaluates which chain to build on.',
      outcome: 'She chooses Base + Coinbase Smart Wallet: readers sign up with email + Face ID (no seed phrase). Gas for each tip ($0.02–$0.05) is sponsored by the app (paymaster pays, users never see ETH). Reader sends $1 USDC tip: one tap, Face ID, done. Writer receives $0.97 (3% platform fee). The app feels like Venmo. Without Base\'s account abstraction and fee structure, this product is impossible: Ethereum mainnet gas ($5+) exceeds the tip value; MetaMask seed phrases scare away 99% of potential users.',
    },
    {
      contextTag: '[Loyalty programme on Base]',
      scenario: 'A major retail brand wants to replace their points system with on-chain tokens that customers can trade, combine with other brands, or redeem across a broader ecosystem.',
      outcome: 'They build on Base: issue loyalty tokens to customers via Coinbase Wallet (customers already have Coinbase accounts), use ERC-4337 so transactions are gasless for customers, partner with other Base-native brands for token interoperability. Customers receive loyalty tokens automatically after purchases — no app download, no seed phrase, just "you earned 500 BRAND tokens, view in your Coinbase Wallet." The blockchain backend is invisible. The customer experience is better than traditional points: tokens are tradeable, permanent, and composable.',
    },
    {
      contextTag: '[Social app economics]',
      scenario: 'Marcus asks: "Why did friend.tech process 200,000 transactions per day? Was this sustainable?"',
      outcome: 'friend.tech charged fees on every key buy/sell transaction — 5% protocol, 5% to the creator. At peak, $1M+ in daily transaction volume = $100,000 in daily fees. This was genuine revenue. However, the activity was speculative (buying keys of influencers hoping they increase in value) rather than social (actually communicating). When speculation died down, activity collapsed 90%+ within months. Lesson: economic activity on consumer apps can be genuine (communication, payments) or speculative (asset trading). Speculative activity is fragile; genuine utility activity is durable.',
    },
  ],

  keyTakeaway: 'Base enables consumer applications impossible on other chains: micropayments at $0.02 gas, seedless Smart Wallet onboarding, and Coinbase distribution to 100M users. The model works when the application has genuine utility — social, payments, loyalty — not primarily speculative.',

  guidedPractice: [
    {
      question: 'Why can a $1 USDC tip application work economically on Base but not on Ethereum mainnet?',
      options: [
        'Base uses a different USDC standard that reduces transfer costs',
        'At $0.02–$0.05 gas on Base, tipping $1 incurs 2–5% overhead. On Ethereum mainnet at $5 gas, the gas exceeds the tip value — making the application economically irrational',
        'Coinbase subsidises all USDC transfers on Base, making them free',
        'Base USDC tips are processed off-chain and settled weekly, avoiding gas costs',
      ],
      correct: 1,
      hint: 'Calculate the gas-to-tip ratio on each chain for a $1 transfer.',
      explanation: 'Base: $0.02 gas on $1 tip = 2% overhead — acceptable for a tipping application. Ethereum mainnet: $5 gas on $1 tip = 500% overhead — the transaction costs more than it delivers, making the application economically nonsensical. This fee structure makes entirely new application categories viable on Base: micropayments, content tipping, small loyalty rewards, in-game asset purchases. Ethereum mainnet\'s fee level effectively had a minimum economically rational transaction size of $50–$100. Base\'s fee level brings that minimum to $0.50–$1.',
    },
    {
      question: 'What makes Coinbase Smart Wallet\'s user experience different from MetaMask for a first-time crypto user?',
      options: [
        'Coinbase Smart Wallet has better price charts than MetaMask',
        'Smart Wallet uses biometric authentication (Face ID/fingerprint) instead of a seed phrase, supports gasless transactions via paymasters, and allows batched approvals — removing the three biggest friction points for non-crypto users',
        'Coinbase Smart Wallet does not support ERC-20 tokens — only ETH',
        'MetaMask requires KYC verification; Coinbase Smart Wallet does not',
      ],
      correct: 1,
      hint: 'What are the three things that confuse non-crypto users most about traditional wallets?',
      explanation: 'The three major MetaMask barriers for non-crypto users: (1) Seed phrase — 12 random words that must be stored safely; most people write them down wrong or lose them. (2) Gas — "why do I need ETH to send USDC?" is the most common confusion. (3) Two transactions — approve then execute for every token interaction. Smart Wallet eliminates all three: biometric auth (Face ID) replaces seed phrase, paymasters sponsor gas, batching combines approve+execute into one tap. The result is UX equivalent to Cash App or Venmo.',
    },
    {
      question: 'friend.tech generated $50M in fees in 60 days then collapsed 90%. What does this teach about consumer app sustainability on Base?',
      options: [
        'Consumer apps cannot generate sustainable revenue on blockchain',
        'Speculative activity (buying social tokens expecting price appreciation) can create explosive short-term volume but collapses when speculation ends. Genuine utility (communication, payments) creates more durable activity',
        'friend.tech collapsed because of a security exploit, not due to user behaviour',
        'Base cannot support high-volume applications — it should only host DeFi protocols',
      ],
      correct: 1,
      hint: 'What were people actually doing on friend.tech — communicating or speculating?',
      explanation: 'friend.tech\'s primary activity was speculation: buying "keys" of influencers hoping the price would increase. This created massive volume — but the behaviour was financial speculation layered on top of a social app. When speculation died (prices stopped rising), the activity rationale disappeared. Apps with genuine utility (actually sending messages, actually tipping creators, actually earning loyalty points) have activity driven by utility rather than speculation — much more durable. The lesson: volume from speculation is fragile; volume from genuine user actions is durable.',
    },
    {
      question: 'A retail brand wants to issue loyalty tokens on Base. What is the most important UX requirement for mainstream customer adoption?',
      options: [
        'Customers must understand blockchain technology to participate',
        'The experience must feel identical to traditional loyalty programmes — tokens appear automatically, no seed phrase, no gas confusion, accessible through familiar interfaces like Coinbase Wallet',
        'Tokens should be tradeable on Aerodrome from day one',
        'Customers must complete KYC before receiving tokens',
      ],
      correct: 1,
      hint: 'Why do 99% of people not use crypto apps? What must be removed to reach mainstream users?',
      explanation: 'Mainstream users have zero tolerance for crypto UX friction. "Download MetaMask, set up a seed phrase, get ETH for gas, approve, then receive your loyalty points" would be used by 0.1% of customers. "You made a purchase — 500 reward tokens added to your Coinbase Wallet" requires nothing new from the customer. Base + Coinbase Wallet + ERC-4337 (gasless) makes the second experience possible. The blockchain is invisible infrastructure. The customer experience must match what people expect from a Starbucks app or airline miles — automatic, frictionless, familiar.',
    },
    {
      question: 'What Coinbase distribution advantage do Base developers have that developers on other L2s lack?',
      options: [
        'Free advertising on Coinbase\'s social media channels',
        'The ability to integrate with Coinbase Pay, Coinbase Wallet, and potentially reach Coinbase\'s 100M verified users who already have bank-linked accounts — the most accessible on-ramp to any L2 ecosystem',
        'Priority listing of their tokens on Coinbase exchange',
        'Access to Coinbase\'s user data for targeted marketing',
      ],
      correct: 1,
      hint: 'What does Coinbase\'s 100M user base represent in terms of crypto on-ramp?',
      explanation: 'Coinbase\'s 100M users are verified with government ID, have linked bank accounts or credit cards, and already hold some crypto on the exchange. Getting these users onto Base requires one tap from the Coinbase app — no MetaMask, no separate wallet, no bridge. For a developer building a consumer app, this is an extraordinary distribution opportunity: their potential audience includes 100M people who are one tap away from being on-chain. Developers on Arbitrum or Optimism must convince users to go through the full bridging process — Base developers can offer a dramatically simpler path.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 165 — BOSS: The Complete Base Picture
// ─────────────────────────────────────────────────────────────────────────────

const L165: IslandLevel = {
  id: 165, mechanic: 'match3', tier: 'pro',
  topic: 'BOSS: The Complete Base Picture',
  isBoss: true,

  explanation: `
You have completed Base Ecosystem. Here is the synthesis before the boss challenge.

Base is Coinbase's OP Stack L2 — no native token, sequencer revenue in ETH, and the most accessible mainstream on-ramp in DeFi. Its strategic position: Coinbase's 100M users, regulatory clarity from a NASDAQ-listed operator, and ERC-4337 Smart Wallet for seedless consumer UX.

The DeFi stack: Aerodrome (ve(3,3) DEX, dominant by volume, stable + volatile pools, concentrated liquidity in v3), Moonwell (Compound fork, safest lending, most TVL), Seamless (Aave v3, isolated markets), ExtraFi (yield optimizer, highest APY, most complexity). cbBTC enables Bitcoin in Base DeFi with Coinbase custodial trust model.

On-ramp options: Coinbase direct (one tap), canonical bridge (Ethereum-secure, 7-day withdrawal), fast bridges (Across, Stargate, instant both ways). Match method to amount and urgency.

The Superchain: Base is part of the OP Stack network — sharing security and eventually native message passing with Optimism, Zora, Mode, and others. Base shares sequencer revenue with Optimism Collective.

Security layers: Ethereum secures transaction validity, centralised sequencer can censor (not steal), regulatory compliance risk is real, protocol risks (Moonwell/Aerodrome smart contracts) are independent. Never conflate chain security with protocol security.

Consumer applications: Base's fee structure ($0.01–$0.10) and Smart Wallet enable micropayments, creator monetisation, loyalty programmes, and social apps that are economically impossible on Ethereum mainnet.

AgentKit enables autonomous AI agents on Base — powerful for automation, dangerous without spending limits and kill switches.
  `.trim(),

  fact: 'Base mastery: OP Stack L2 (no token, ETH sequencer fees), Coinbase on-ramp, Aerodrome ve(3,3) + concentrated liquidity, Moonwell/Seamless lending, cbBTC, Superchain membership, consumer app infrastructure. Security: Ethereum-secured validity, centralised sequencer caveats.',
  plain: 'Base = Coinbase\'s L2. Best on-ramp for mainstream users. Aerodrome for swaps and LP. Moonwell for safe lending. cbBTC to use Bitcoin. Smart Wallet for apps without seed phrases. Know the sequencer centralisation caveats.',
  stars: [2210, 2720, 3400], target: 3400, coins: 100,
  simulatorLesson: 'baseBoss',

  examples: [
    {
      contextTag: '[Complete Base DeFi strategy]',
      scenario: 'A user bridges $10,000 from Coinbase to Base. They want: $5K earning yield safely, $3K in DeFi with higher returns, $2K for exploration. Design their strategy.',
      outcome: '$5,000 → Moonwell USDC supply (5.5% APY, safest, Compound heritage, most audited on Base). $3,000 → Aerodrome USDC/USDT concentrated liquidity position ($0.998–$1.002 range, ~20% APY, minimal out-of-range risk for stablecoins). $2,000 → cbBTC (1.5% of portfolio): 0.01 cbBTC deposited to Moonwell, borrow $1,000 USDC against it, deploy USDC into ExtraFi vault (11% APY). Total expected annual return: conservative ~$700–$900 on $10K deployed across three risk tiers. Strategy is layered by risk tolerance.',
    },
    {
      contextTag: '[cbBTC trust model evaluation]',
      scenario: 'A friend wants to put $80,000 of BTC into cbBTC on Base to earn yield. They ask you to evaluate all trust layers.',
      outcome: 'Layer 1 (cbBTC): Coinbase holds the underlying BTC. Trust: Coinbase is NASDAQ-listed, SOC 2 audited, US regulated — high institutional trust, but if Coinbase fails, suspends redemptions, or is seized by regulators, access is affected. Layer 2 (Base sequencer): Coinbase operates it. Censorship possible; downtime possible. Layer 3 (protocol): whichever DeFi protocol holds the cbBTC has smart contract risk. For $80,000: acceptable Layer 1 trust if Coinbase\'s regulatory standing is accepted. Meaningful Layer 3 risk — only use audited, established protocols. Health factor 1.7+ if using as collateral.',
    },
    {
      contextTag: '[AgentKit deployment decision]',
      scenario: 'James wants to use AgentKit to automatically harvest Aerodrome AERO rewards and reinvest them. He plans to give the agent full wallet access.',
      outcome: 'Full wallet access is the dangerous choice. Correct setup: (1) Create a dedicated agent wallet separate from main holdings. (2) Only deposit the AERO position into the agent wallet — agent cannot touch other assets. (3) Spending limit: max $500 per transaction. (4) Allowed operations: harvest AERO + swap AERO for USDC/ETH + reinvest in specific pool only. (5) Kill switch: one-command wallet permission revocation. (6) Test on Sepolia for 3 weeks. (7) Start with $1,000 before scaling to $50,000+. Constraints are not restrictions — they are safety.',
    },
  ],

  keyTakeaway: 'Base mastery means knowing when to use each tool: canonical bridge for large amounts, fast bridge for urgency, Moonwell for safety, Aerodrome for yield, cbBTC for Bitcoin DeFi exposure, Smart Wallet for consumer UX, AgentKit for automation with strict constraints. Always evaluate chain security and protocol security separately.',

  guidedPractice: [
    {
      question: 'You want to move $80,000 from Ethereum to Base for a 6-month DeFi deployment. Which bridge should you use and why?',
      options: [
        'Across Protocol — fastest, minimise time at risk during transit',
        'Canonical bridge at bridge.base.org — largest amounts justify the most secure path. $80K fee via Across (0.1% = $80) vs ~$20 canonical gas. 7-day withdrawal is acceptable for 6-month deployment',
        'Split across five fast bridges to reduce single bridge smart contract risk',
        'Coinbase direct — all $80K from exchange to Base in one tap',
      ],
      correct: 1,
      hint: 'What does 0.1% cost on $80,000? What does canonical bridge cost? Is 7-day withdrawal an issue for 6-month deployment?',
      explanation: 'Canonical bridge: ~$20–$30 in L1 gas, no protocol fee, Ethereum-secured. Fast bridge: 0.1% × $80,000 = $80 protocol fee + gas. Saving $50–$60 is meaningful at this size. More importantly: $80,000 concentrated in a fast bridge smart contract during transit is a non-trivial smart contract risk. The canonical bridge eliminates third-party protocol trust for a 6-month deployment, the 7-day withdrawal window is irrelevant — you are not planning to withdraw within the first 7 days anyway.',
    },
    {
      question: 'Aerodrome shows: stable pool USDC/USDT 22% APY, volatile pool ETH/USDC 18% APY (8% fees, 10% emissions). Which carries lower risk for a USDC holder and why?',
      options: [
        'Volatile pool — higher total APY means better risk-adjusted return',
        'Stable pool — USDC/USDT price correlation is near-perfect, eliminating practical out-of-range risk in concentrated liquidity. The volatile ETH/USDC pool carries impermanent loss and out-of-range risk',
        'Both pools are equivalent risk — both pay in AERO emissions',
        'Volatile pool is lower risk because it has a higher fee component and less emission dependency',
      ],
      correct: 1,
      hint: 'What is the out-of-range risk for USDC/USDT vs ETH/USDC in concentrated liquidity?',
      explanation: 'USDC/USDT stable pool: both tokens are USD-pegged stablecoins that should always trade between $0.999–$1.001. Concentrated liquidity in a tight range is virtually guaranteed to stay in-range. Impermanent loss is negligible (less than 0.01% even in depeg scenarios for established stablecoins). ETH/USDC volatile pool: ETH can move 5–15% per day. In concentrated liquidity, the position goes out of range frequently, earning zero fees and converting to 100% one asset. The 22% stable pool APY may be more durable than the 18% volatile pool APY because the stable pool consistently stays in-range.',
    },
    {
      question: 'What is the key security caveat that Coinbase operating Base\'s sequencer creates?',
      options: [
        'Coinbase can steal user funds from Base smart contracts',
        'Coinbase can censor specific addresses — preventing their transactions from being included — and could face regulatory orders requiring compliance actions. Neither threatens funds directly, but both affect transaction ability',
        'Coinbase\'s security audits are required for all Base protocols',
        'The centralised sequencer makes Base fundamentally less secure than Solana',
      ],
      correct: 1,
      hint: 'What can the sequencer do? What can it not do?',
      explanation: 'Sequencer power: include or exclude transactions (censorship). The sequencer can theoretically refuse to process transactions from specific addresses. If the US government orders Coinbase to freeze an address, the sequencer stops including its transactions. Sequencer limits: cannot fabricate invalid transactions (Ethereum fraud proofs would catch it), cannot steal funds from smart contracts, cannot change the canonical state. These are meaningful operational risks for certain use cases (censorship-sensitive applications) but do not constitute theft risk for ordinary DeFi users.',
    },
    {
      question: 'A friend asks: "Is Moonwell safe because Coinbase built Base?" How do you explain the relationship between Base security and Moonwell security?',
      options: [
        'Yes — Coinbase operates Base, which means all protocols on Base receive Coinbase\'s security backing',
        'No — Base security (Ethereum-enforced transaction validity) and Moonwell security (Moonwell\'s smart contract code quality) are completely independent. A Moonwell exploit loses user funds regardless of Base\'s security layer',
        'Partially — Coinbase audits all DeFi protocols before they can deploy on Base',
        'Yes — but only for protocols in Coinbase\'s official ecosystem fund portfolio',
      ],
      correct: 1,
      hint: 'Who is responsible for the code inside Moonwell\'s contracts?',
      explanation: 'These are categorically separate security concerns. Base\'s Ethereum-backed security guarantees: valid transactions are processed, invalid state transitions are caught, the sequencer cannot steal funds. Moonwell\'s smart contract security guarantees: nothing. Moonwell\'s code is written by the Moonwell team, audited by independent auditors, and could have bugs regardless of which chain it deploys on. An exploit in Moonwell would drain user funds on any EVM chain — Arbitrum, Base, or Ethereum mainnet. The chain\'s security layer does not protect against application-layer vulnerabilities.',
    },
    {
      question: 'Design an AgentKit agent that DCA\'s $200 of USDC into ETH every Monday. What safety constraints are mandatory?',
      options: [
        'No constraints needed — DCA is low risk by definition',
        'Maximum single transaction $300 (above intended amount as a safety buffer), only swap operation permitted (no bridge, no leverage, no LP), kill switch to revoke permissions immediately, testnet validation for 3+ weeks before mainnet, dedicated agent wallet separate from main holdings',
        'Only a spending limit — other constraints reduce the agent\'s DCA effectiveness',
        'Agent needs full wallet access to handle any unexpected USDC to ETH conversion scenario',
      ],
      correct: 1,
      hint: 'What can go wrong with an unconstrained DCA agent? What happens if the agent misinterprets "buy ETH"?',
      explanation: 'Mandatory constraints: (1) Spending limit above intended ($300 vs $200) — agent might convert slightly more due to rounding or timing. (2) Operation type: swap only — prevents agent from "diversifying" into bridging or leverage positions. (3) Kill switch — immediate human override capability. (4) Dedicated wallet — agent only has access to the DCA allocation, cannot touch other assets. (5) Testnet first — watch the agent execute 4 Mondays of simulated DCA before trusting it with real money. Even a "simple" DCA agent can misbehave in edge cases (what if USDC balance is $50 when it tries to buy $200?).',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part B (L159–165)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_LEVELS_B: Record<number, IslandLevel> = {
  159: L159,
  160: L160,
  161: L161,
  162: L162,
  163: L163,
  164: L164,
  165: L165,
};

export { BASE_LEVELS_B };

export const BASE_LEVELS: Record<number, IslandLevel> = {
  ...BASE_LEVELS_A,
  ...BASE_LEVELS_B,
};
