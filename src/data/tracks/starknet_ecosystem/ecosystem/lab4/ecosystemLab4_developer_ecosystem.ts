// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// JUNIOR · LAB 4 — DEVELOPER ECOSYSTEM AND TOOLING
// 5 Lessons + Aggregate Sims + Build Task + Boss Battle
//
// Lesson type classification:
//   L4.1 — TYPE A: ecosystem maturity analysis, conceptual comparison
//   L4.2 — TYPE C: build tool and testing framework — tool-first
//   L4.3 — TYPE C: SDK pipeline — navigating the SDK IS the mechanism
//   L4.4 — TYPE A: gaming ecosystem, adoption analysis, conceptual
//   L4.5 — TYPE A: grant process, policy, judgment
//
// Framing note (applied at every lesson): this lesson teaches you to
// evaluate tools from an ecosystem analysis perspective. You will not
// write any code in this lesson.
//
// Learner: zero DeFi knowledge. Plain English first, always.

// ─────────────────────────────────────────────────────────────
// L4.1 — Cairo Language Positioning
// TYPE A — Dominant concept: a programming language's ecosystem
// maturity has five measurable dimensions, and Cairo is 2–5 years
// behind the leader on each. This gap is Starknet's primary
// developer acquisition challenge.
// ─────────────────────────────────────────────────────────────

export const LAB4_LESSON_1 = {
  id: 'l4-1-cairo-language-positioning',
  title: 'Cairo Language Positioning',
  trackType: 'A',
  lessonNumber: 1,
  evaluationNote: 'This lesson teaches you to evaluate Cairo from an ecosystem analysis perspective — what it is, why developers choose it, what its adoption signals about Starknet\'s maturity, and where the gaps remain. You will not write any code.',

  explanation: `
In 2009, Apple launched the App Store. At that point, there were only a few thousand apps available. Developers were interested but cautious — building for a new platform meant learning new tools, with no guarantee the platform would succeed or the users would show up. By 2012, three years later, there were 700,000 apps and 40 billion downloads. The platform had reached critical mass.

What changed was not the quality of the platform — the iPhone in 2012 was only marginally better than the iPhone in 2009. What changed was the ecosystem around it: documentation improved, third-party tools were built, Stack Overflow was full of answers to common problems, bootcamps started teaching iOS development, and companies started hiring iOS developers. The language (Objective-C, later Swift) became worth learning because the ecosystem made it possible to build, to ship, and to get hired.

Cairo — the programming language all Starknet contracts are written in — is at the equivalent of the App Store's early days. The platform exists. The use case is compelling. The question analysts must answer is: how mature is the ecosystem around the language, and how quickly is it developing?

FIVE DIMENSIONS OF LANGUAGE ECOSYSTEM MATURITY

A programming language does not live or die by its syntax. It lives or dies by the five things that surround it.

DIMENSION 1 — ACTIVE DEVELOPERS

The most direct measure: how many people are actively writing code in this language right now? GitHub repositories are a reasonable proxy — the number of Cairo repositories reflects how many active projects are being built.

Ethereum's Solidity: approximately 150,000 active developers globally. Solidity has been around since 2015 and has benefited from 10 years of developer investment, tutorials, bootcamps, and university courses.

Cairo: approximately 3,000 active developers as of current data. Cairo is 3–4 years old in its modern form (Cairo 1.0, the current version, launched in 2023).

The ratio is roughly 1:50. For every Cairo developer, there are 50 Solidity developers. This matters for: protocol hiring (small talent pool = higher salaries, longer searches), audit availability (fewer Cairo-experienced auditors), and open-source contributions (fewer people fixing bugs or building libraries).

DIMENSION 2 — DOCUMENTATION AND LEARNING RESOURCES

The Book of Cairo — Cairo's primary documentation resource — is well-written and regularly updated. However:

Solidity has 10 years of accumulated documentation, YouTube tutorials, Udemy courses, bootcamp curricula, university coursework, and one of the largest developer communities on Stack Overflow.

Cairo has the official book and a growing but smaller set of supplementary resources. Questions on Stack Overflow remain sparse — a developer hitting a Cairo-specific problem is far more likely to have to dig into GitHub Issues or Discord than to find an existing answer.

Quality of documentation: comparable to Solidity's early 2017 state. Adequate for determined learners; not yet at the level that makes self-learning frictionless.

DIMENSION 3 — AVAILABLE LIBRARIES (PACKAGES)

In the Primer Module (L0.3), you learned that a package is pre-written code solving a specific problem, shared so developers don't have to solve it again. Library availability is a force multiplier: a developer building a lending protocol on Ethereum can import OpenZeppelin's battle-tested security libraries and implement access control in one line. A developer building the equivalent on Starknet must write more from scratch.

Ethereum's ecosystem: thousands of packages. OpenZeppelin alone covers the most common security patterns. npm and GitHub host a deep library of DeFi primitives.

Cairo's ecosystem: OpenZeppelin has released Cairo equivalents of its core libraries. The selection is growing but is narrower. A developer building a complex protocol on Starknet will find fewer ready-made components and will need to write more custom code — both slowing development and increasing audit complexity (more custom code = more surface area for bugs).

DIMENSION 4 — TOOLING SUPPORT

IDE support (integrated development environments — the software developers write code in) matters for developer productivity. Visual Studio Code has a Cairo extension. The extension has syntax highlighting and basic error detection.

Comparison: Solidity's VS Code tooling is more mature — better error messages, deeper integration with compilation, more comprehensive debug output.

The gap here is narrowing quickly. StarkWare and community contributors actively invest in tooling. But a developer moving from Ethereum to Starknet today will find the IDE experience meaningfully rougher.

DIMENSION 5 — JOB MARKET DEMAND

For a developer choosing which language to invest in, job market demand is a practical signal of long-term value. More job postings = more employers see value = more reason to learn.

Solidity: thousands of job postings globally on LinkedIn, Crypto Jobs List, and Web3 jobs boards at any given time.

Cairo: job postings exist but are significantly less numerous. Most Cairo developer jobs are at StarkWare itself or at well-funded Starknet ecosystem projects. This will grow as the ecosystem grows — but today's Cairo developer faces a narrower job market than their Solidity equivalent.

THE MATURITY GAP IN ONE SENTENCE

Cairo is roughly 2–5 years behind Solidity on every ecosystem maturity dimension. This is not a statement about Cairo's quality as a language — it is a statement about the surrounding infrastructure that makes learning and using a language practical. That infrastructure takes time to build, and it is being built actively.

FOR ECOSYSTEM ANALYSIS

When assessing any Starknet protocol: the developer pool they can hire from is approximately 3,000 people globally. Their audit options are limited — Cairo auditors are scarce. Their ability to import battle-tested libraries is constrained. These are real operational costs that manifest as:
— Higher developer salaries
— Longer time-to-hire
— More custom code = more audit cost and complexity
— More bugs from writing things from scratch that Ethereum protocols import as proven libraries

Understanding this gives you analytical language to assess developer ecosystem risk at any Starknet protocol, not just the ecosystem overall.
  `.trim(),

  keyTakeaway: `Cairo's ecosystem is 2–5 years behind Solidity across all five maturity dimensions — active developers (~3,000 vs ~150,000), documentation, library availability, tooling, and job market — and this gap creates measurable operational costs for any protocol building on Starknet today.`,

  visualPrompt: `A five-row radar chart comparing Cairo and Solidity. Each row is one dimension: Active Developers, Documentation, Libraries, Tooling, Job Market. Solidity fills the outer ring (maturity = 5/5 on each). Cairo fills an inner ring (maturity = 1.5–2.5/5 on each). The gap between the two rings is clearly visible and labelled "2–5 year maturity gap." Below the chart: a single callout box — "Cairo developer pool: ~3,000. Solidity developer pool: ~150,000. Ratio: 1:50."`,
  visualType: 'static',
  visualUrl: 'cairo-vs-solidity-ecosystem-maturity',

  examples: [
    {
      contextTag: '[Protocol hiring Cairo developers]',
      context: 'A funded Starknet DeFi protocol needs to hire 3 senior Cairo developers to build its lending protocol. The team budgets 8 weeks for hiring.',
      scenario: 'They post on Crypto Jobs List, Web3 jobs boards, and StarkWare\'s community Discord. After 4 weeks: 12 applications received. Of those, 4 have production Cairo experience. Of those 4, 2 are already employed at well-funded projects with competitive salaries. They extend offers to the other 2.',
      outcome: 'Total time: 6 weeks. Salaries: 25% above what equivalent Solidity developers at Ethereum protocols earn in the same city. The small talent pool created both timeline pressure and salary inflation. The hiring friction is a direct consequence of the 1:50 developer ratio. Their competitor building on Ethereum had 47 qualified applicants for a comparable role in the same period.',
    },
    {
      contextTag: '[Library gap increasing audit complexity]',
      context: 'A Starknet protocol builds an ERC-20-like token standard from scratch in Cairo because the available OpenZeppelin Cairo equivalent is a newer release they are unsure of. Their custom implementation is 380 lines of Cairo code.',
      scenario: 'The protocol goes to audit. The audit firm charges by time — more custom code means more time needed. The audit takes 6 weeks and costs $85,000. An equivalent Ethereum protocol using OpenZeppelin\'s battle-tested ERC-20 (2 lines of import code covering the same functionality) went to audit in 3 weeks for $40,000 — the auditor only needed to check the custom logic, not the standard library.',
      outcome: 'The Cairo protocol paid twice the audit cost and time for functionality that Ethereum developers get for free from a trusted library. This is the library gap made concrete: not just a developer experience issue, but a real cost measured in dollars and weeks.',
    },
    {
      contextTag: '[Cairo maturity trajectory as positive signal]',
      context: 'An analyst is comparing Cairo\'s 2022 state to its 2024 state for a research report on Starknet\'s developer ecosystem progress.',
      scenario: 'In 2022 (Cairo 0): limited tooling, no VS Code extension, no package manager, ~500 developers. In 2024 (Cairo 1.0+): VS Code extension available, Scarb package manager released, OpenZeppelin Cairo library available, approximately 3,000 developers, multiple bootcamps and video courses, job postings at 15+ major Starknet ecosystem projects.',
      outcome: 'Cairo\'s developer ecosystem grew 6× in active developers in 2 years and went from no package manager to a functional one. The analyst notes: "The trajectory is more important than the current absolute level. Cairo is growing faster than Solidity did at the equivalent stage of its development. The question is whether it grows fast enough before EVM-compatible ZK rollups commoditise ZK development for Ethereum\'s existing developer base."',
    },
  ],

  guidedPractice: [
    {
      question: 'Starknet has approximately 3,000 active Cairo developers. Ethereum has approximately 150,000 active Solidity developers. A protocol is evaluating security audit options for a new Starknet DeFi contract. What specific risk does the 1:50 developer ratio create for audit availability?',
      options: [
        'A. No risk — auditing is a universal skill that does not depend on language expertise',
        'B. Fewer Cairo-experienced auditors exist globally, meaning fewer audit firms offer Cairo audits, wait times are longer, and prices are higher due to constrained supply of qualified reviewers',
        'C. The risk only applies to the protocol if they cannot hire Cairo developers internally',
        'D. Cairo contracts cannot be audited — they must be formally verified instead',
      ],
      correct: 1,
      hint: 'Auditors must read and understand the code language they are reviewing. What does a small developer pool mean for the pool of qualified auditors?',
      explanation: 'B is correct. Security auditors for smart contracts must be expert in the language — a Solidity auditor cannot audit Cairo code they cannot read. With ~3,000 Cairo developers globally vs ~150,000 Solidity developers, the pool of Cairo-qualified auditors is proportionally smaller. Fewer qualified auditors = higher prices, longer wait times, and potential backlog. This is a real operational cost for any Starknet protocol. Option A incorrectly treats auditing as language-agnostic.',
    },
    {
      question: 'A developer asks: "Why does the number of Cairo packages matter? Can\'t I just write everything from scratch?" What is the correct answer from an ecosystem analysis perspective?',
      options: [
        'A. Writing from scratch is always better — custom code is more optimised than libraries',
        'B. Writing from scratch increases development time, increases audit complexity (more lines to review), and introduces more surface area for bugs — libraries represent code that has been tested, reviewed, and battle-hardened by many users. Fewer libraries = more from-scratch code = higher cost and risk per protocol.',
        'C. Package count only matters for large teams — small teams are unaffected',
        'D. Cairo does not support packages, so this is not a relevant question',
      ],
      correct: 1,
      hint: 'Think about what libraries provide: not just convenience, but tested, reviewed, community-validated code. What happens when you replace that with custom code?',
      explanation: 'B is correct. Libraries represent accumulated, tested solutions. When a developer writes from scratch what they could import as a proven library: (1) development takes longer, (2) the audit must cover more custom code (more time, more cost), (3) bugs can appear in code that a library would have already had patched over years of use. The library gap in Cairo is not just a convenience issue — it is a direct cost in development time, audit expense, and security risk. Option A incorrectly frames from-scratch as universally preferable.',
    },
    {
      question: 'Cairo is approximately 3–4 years old in its modern form (Cairo 1.0). Solidity is 10+ years old. On the job market dimension of ecosystem maturity, what is the practical implication of this age gap for a developer deciding whether to invest in learning Cairo?',
      options: [
        'A. Age gap is irrelevant — newer languages always have better job markets',
        'B. Cairo has fewer job postings than Solidity because fewer employers have Cairo-based products — a developer learning Cairo takes on career risk if the Starknet ecosystem does not grow enough to sustain a broad Cairo job market',
        'C. A developer who learns Cairo today will have zero job prospects',
        'D. The job market for Cairo is equal to Solidity because blockchain jobs pay more',
      ],
      correct: 1,
      hint: 'More protocols on Ethereum = more Solidity jobs. Fewer protocols on Starknet = fewer Cairo jobs. What risk does this create for a developer committing to Cairo?',
      explanation: 'B is correct. Job market depth is a function of how many employers need the skill. With ~150,000 Solidity developers and a massive Ethereum ecosystem, Solidity job listings are abundant. Cairo\'s job market is narrower today — most positions are at StarkWare itself or well-funded Starknet projects. A developer learning Cairo is making a directional bet that the Starknet ecosystem grows. If it does, early Cairo fluency becomes valuable. If it does not, the career risk is real. This is an honest analysis the lesson requires — not dismissal of Cairo, but clear-eyed assessment.',
    },
    {
      question: 'An ecosystem report claims: "Cairo\'s documentation is good enough — the Book of Cairo is clear and updated regularly." What dimension of ecosystem maturity does this statement address, and what important context does it miss?',
      options: [
        'A. It addresses tooling — missing context: the VS Code extension is incomplete',
        'B. It addresses documentation quality — but misses volume and discoverability. Having one good official source is not equivalent to having 10 years of tutorials, YouTube videos, bootcamp curricula, and thousands of Stack Overflow answers that Solidity has accumulated.',
        'C. It addresses library availability — missing context: the Book does not contain any libraries',
        'D. The statement is complete — documentation quality is all that matters',
      ],
      correct: 1,
      hint: 'Documentation has two dimensions: quality of the official source and volume/discoverability of supplementary material. Which does the statement address?',
      explanation: 'B is correct. The statement accurately describes the official Book of Cairo as clear and updated — that is documentation quality. But ecosystem documentation maturity is about volume and discoverability: when a developer is stuck at 11pm and searches their specific Cairo error message, do they find answers? With Solidity, they almost certainly do — 10 years of accumulated Q&A, blog posts, and tutorials. With Cairo, they are far more likely to end up in GitHub Issues or Discord, which is slower and less reliable. The statement is true but incomplete.',
    },
    {
      question: 'A protocol team is evaluating whether to build on Starknet (Cairo required) or ZKSync Era (Solidity accepted). They have 4 experienced Solidity developers and no Cairo experience. What is the Cairo language risk they must account for in their planning?',
      options: [
        'A. No risk — developers can learn Cairo in a weekend',
        'B. A Solidity-to-Cairo transition involves a learning curve of several months to productive Cairo development, reduced initial code velocity, potential need to hire Cairo expertise, and the risk of writing unsafe code during the learning period before full Cairo fluency is achieved',
        'C. Cairo is identical to Solidity — no transition cost',
        'D. The risk only matters if they plan to deploy within one week',
      ],
      correct: 1,
      hint: 'Cairo has different syntax, different mental models for ZK-native programming, and different tooling from Solidity. What does transitioning a team to a new language cost?',
      explanation: 'B is correct. A language transition for a professional development team has measurable costs: weeks to months of reduced productivity during the learning period, the risk of writing code that works functionally but has security implications that the developers would have avoided in their native language, and likely the need to hire or contract a Cairo expert to guide the transition. Cairo is similar to Rust in some respects (which helps teams with Rust experience), but it has ZK-specific concepts with no direct Solidity equivalent. This is a genuine operational risk that must be factored into the deployment chain decision.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'GitHub data for Cairo ecosystem: 1,200 public Cairo repositories, approximately 3,000 active Cairo developers, 47 packages published to Scarb (Cairo\'s package manager). Equivalent Solidity data: 180,000 public repositories, 150,000 active developers, 4,200+ npm packages in the Ethereum ecosystem. Calculate the Cairo-to-Solidity ratio for each of the three metrics. Identify the two dimensions where the gap is widest and state what each gap implies for a protocol building on Starknet today.',
      scoringCriteria: [
        'Repositories ratio correctly calculated: 1,200 ÷ 180,000 = 0.67% (1:150 ratio)',
        'Developer ratio correctly calculated: 3,000 ÷ 150,000 = 2% (1:50 ratio)',
        'Package ratio correctly calculated: 47 ÷ 4,200 = 1.1% (1:89 ratio)',
        'Correctly identifies packages (1:89) and repositories (1:150) as widest gaps. Package gap implies more from-scratch development and higher audit costs. Repository gap implies fewer open-source examples and less community code to reference.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A Starknet protocol wants to hire 5 Cairo developers within 3 months. They are based in London. Their budget is £95,000–£120,000 per year per developer. Identify three specific talent market risks they face and one concrete strategy that addresses each risk.',
      scoringCriteria: [
        'Risk 1: Small global pool (3,000 developers) means fewer London-based candidates. Strategy: open to remote globally, not just London-based hires — expanding the search to the full global Cairo pool increases candidate count significantly.',
        'Risk 2: Most experienced Cairo developers are already employed at well-funded projects. Strategy: engage developer relations — sponsor hackathons, contribute to Cairo open source, establish brand presence in the community before recruiting to build inbound interest.',
        'Risk 3: 3-month timeline is tight for 5 hires from a small pool. Strategy: consider hiring 2–3 experienced Cairo developers and training 2–3 strong Rust developers into Cairo — Cairo\'s Rust-like syntax means the transition curve for Rust developers is shorter than for most other backgrounds.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A developer community manager asks: "Why should a Solidity developer invest the time to learn Cairo? Be honest about the trade-offs." Write a two-paragraph honest pitch. Paragraph 1 should cover the genuine advantages. Paragraph 2 should honestly acknowledge the trade-offs and who should consider making the switch.',
      scoringCriteria: [
        'Paragraph 1 correctly identifies genuine advantages: native ZK-proof generation (Cairo is the only language designed from the ground up for STARK proofs), Account Abstraction built into every contract by default, early-mover advantage in a growing ecosystem, and the intellectual novelty of building the most ZK-native smart contracts possible',
        'Paragraph 2 honestly acknowledges trade-offs: smaller job market today (fewer postings than Solidity), steeper learning curve (ZK-specific concepts with no direct Solidity equivalent), smaller library ecosystem (more from-scratch code), and the career risk if the Starknet ecosystem does not grow to match the investment. Correctly identifies who should consider it: developers already comfortable in Rust, those with a long-term view on ZK technology, and those building specifically for Starknet',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L4.2 — Scarb and Starknet Foundry
// TYPE C — Tool-first. Evaluating Scarb and Starknet Foundry
// from the analyst perspective: what each tool does in the
// pipeline, what adoption signals matter, and what the gaps
// relative to Ethereum equivalents tell you about ecosystem
// maturity.
// ─────────────────────────────────────────────────────────────

export const LAB4_LESSON_2 = {
  id: 'l4-2-scarb-starknet-foundry',
  title: 'Scarb and Starknet Foundry',
  trackType: 'C',
  lessonNumber: 2,
  evaluationNote: 'This lesson teaches you to evaluate Scarb and Starknet Foundry from an ecosystem analysis perspective. You will not write any code.',

  explanation: `
LAYER 1 — WHAT YOU ARE BUILDING TOWARD

By the end of this lesson, you can look at adoption data for Scarb (Starknet's build tool) and Starknet Foundry (Starknet's testing framework) and produce a specific, evidence-based maturity assessment. You can tell a protocol team, a VC, or a Foundation reviewer exactly where these tools lead and where they lag — and why that matters for the Starknet ecosystem.

This lesson evaluates two specific tools in the developer pipeline (steps 1–3 and steps 4–5 from Primer L0.3). It does not teach you to use them — it teaches you to assess their quality as an analyst.

LAYER 2 — THE TWO TOOLS

SCARB — STARKNET'S BUILD TOOL
What it does: Scarb is Cairo's build tool and package manager. It manages the entire project environment: creates a project structure, handles the Scarb.toml configuration file (which declares dependencies and project settings), downloads required packages, and compiles Cairo code into the Sierra and CASM formats that Starknet executes.

For non-coders, the relevant analogy is npm for JavaScript or Cargo for Rust. When a JavaScript developer starts a new project, they type npm install to set up their dependencies. When a Cairo developer starts a new Starknet project, they use Scarb to do the equivalent.

What adoption signals tell you:
— GitHub stars: the community's endorsement signal. More stars = more developers found the tool valuable enough to bookmark.
— Contributor count: how many developers have improved the tool. Low contributor count signals dependence on a small core team — a key-person risk.
— Issue resolution time: how quickly reported bugs are fixed. Slow resolution time signals understaffing or deprioritisation.
— Version release frequency: a tool actively adding features and fixing bugs signals a healthy development pace.

Current Scarb data (approximate): several thousand GitHub stars, regular release cadence, core team at StarkWare with growing community contributors.

Ethereum comparison: npm (used for JavaScript/Ethereum tooling) has millions of users and decades of development. Cargo (Rust's equivalent, which Scarb draws inspiration from) has similar scale. Scarb is younger and smaller but is architecturally sound and actively developed.

Key analyst finding: Scarb is functional and sufficient for current Starknet development. Its most meaningful gap is the package ecosystem it manages — there are far fewer packages available than npm or Cargo manage, meaning developers use Scarb to manage a smaller selection of Cairo libraries.

STARKNET FOUNDRY (SNFORGE) — STARKNET'S TESTING FRAMEWORK
What it does: Starknet Foundry (command: snforge) lets developers write and run tests against their Cairo contracts before deployment. It simulates the Cairo VM locally — meaning tests run in an environment that mimics exactly how the code will behave on Starknet. This lets developers catch bugs before real money is at stake.

The relevant analogy: Ethereum Foundry (a well-established testing framework for Solidity contracts). Starknet Foundry deliberately mirrors Ethereum Foundry's design philosophy and command-line interface — reducing the learning curve for developers familiar with the Ethereum version.

What adoption signals tell you (same framework as Scarb):
— GitHub stars: Starknet Foundry has approximately 800 stars. Ethereum Foundry has approximately 8,000 stars. The ratio is 1:10.
— Issue resolution time: Starknet Foundry issues are resolved within a similar timeframe to Ethereum Foundry for common bugs. Edge cases take longer — the community is smaller and fewer people are affected by uncommon bugs, so they attract less attention.
— Documentation: Starknet Foundry has clear official documentation and an active book. Coverage of advanced testing patterns is thinner than Ethereum Foundry's extensive community documentation.
— "Good first issue" labels: GitHub shows 12 open issues labelled "good first issue" on Starknet Foundry — a positive signal that the core team is actively inviting community contribution. This labels the bottleneck as talent, not direction.

Where Starknet Foundry leads its Ethereum equivalent:
— Native Cairo test syntax: tests are written in Cairo itself, not in a separate language. This produces a cleaner, more integrated test writing experience.
— Direct Cairo VM execution: tests run directly on the Cairo VM, so behaviour in tests exactly matches behaviour on Starknet — no translation layer between test environment and production.

Where Starknet Foundry lags:
— Plugin ecosystem: Ethereum Foundry has many third-party plugins for specific testing scenarios (gas optimisation, fuzzing configurations, coverage reporting). Starknet Foundry has fewer.
— Stack Overflow and forum coverage: a developer hitting an unusual Starknet Foundry bug is likely to find little help outside official channels. Ethereum Foundry problems have extensive forum coverage.
— Community size: fewer developers using the tool means fewer people contributing edge case fixes and niche features.

LAYER 3 — THE CONSTRAINT

This is called tooling health assessment. The constraint: a tool's quality cannot be assessed by its existence alone. The questions that matter are adoption velocity (is the community growing?), maintenance health (are bugs fixed promptly?), and comparative maturity (how does it compare to the benchmark in the same category?). A tool that exists but is unmaintained or has critical gaps is not a healthy tool — it is a liability for protocols that depend on it.

The specific risk: a protocol using an outdated version of its core tooling is exposed to known vulnerabilities that the updated version has patched. A 2024 audit of Starknet projects found that a meaningful percentage used Scarb versions that were several months behind the current release — a pattern that signals either poor dependency management practices or lack of awareness of the update cadence.

LAYER 4 — WHERE THIS SITS IN THE TRACK

Scarb and Starknet Foundry assessments feed directly into: Lab 4 Build Task (developer onboarding friction analysis or SDK comparison, both of which reference tooling health), Lab 6 (protocol research methodology, where tooling reliability affects how quickly a protocol can respond to security findings), and Lab 9 (grant evaluation, where "does the team use current tooling?" is a proxy for development rigour).
  `.trim(),

  keyTakeaway: `Scarb (build tool) and Starknet Foundry (testing framework) are both functional and actively developed, but each has approximately 10× fewer GitHub stars than their Ethereum equivalents — a gap that reflects ecosystem size, not tool quality, and narrows as more Cairo developers contribute and discover them.`,

  visualPrompt: `A two-column comparison table. Left column header: "Starknet Tooling." Right column header: "Ethereum Equivalent." Row 1: Build tool — "Scarb (Cairo)" vs "Cargo (Rust-like) / npm (JS)". Row 2: Testing framework — "Starknet Foundry / snforge" vs "Ethereum Foundry / Hardhat". Row 3: GitHub stars — "Scarb: ~3,000 / Foundry: ~800" vs "Cargo: millions / Eth Foundry: ~8,000". Row 4: Package ecosystem — "47 Cairo packages" vs "4,200+ npm packages". Row 5: Leads in — "Native Cairo test syntax, direct Cairo VM execution" vs "Plugin ecosystem, community coverage, Stack Overflow depth". Each row has a colour band: green for Starknet leads, amber for Starknet lags, grey for neutral.`,
  visualType: 'static',
  visualUrl: 'scarb-foundry-tooling-comparison',

  examples: [
    {
      contextTag: '[Analyst reading GitHub data to assess ecosystem health]',
      context: 'A researcher is writing the developer tooling section of a Starknet quarterly ecosystem report. She pulls current GitHub data for Starknet Foundry: 800 stars, last commit 3 days ago, 45 open issues (12 labelled "good first issue"), 6 contributors in the last month.',
      scenario: 'She compares to Ethereum Foundry: 8,000 stars, last commit yesterday, 200 open issues, 40+ contributors in the last month. She notes that the 1:10 star ratio suggests Starknet Foundry has a much smaller active community. But she also notes: last commit 3 days ago signals active maintenance, and 12 "good first issue" labels signal the team is actively growing contributors.',
      outcome: 'Her assessment: "Starknet Foundry is actively maintained and architecturally sound, with a 10× smaller community than Ethereum Foundry. The active maintenance signal (recent commits, responsive issues) is positive. The bottleneck is community size, not code quality. As the Cairo developer pool grows, Foundry community size should grow proportionally. Current risk: sparse Stack Overflow coverage means developer debugging time is longer than on Ethereum Foundry."',
    },
    {
      contextTag: '[Protocol using outdated Scarb version]',
      context: 'A protocol audit submission uses Scarb version 2.4.0 (6 months old). The current version is 2.8.0. Three security-relevant bug fixes were applied between 2.4.0 and 2.8.0.',
      scenario: 'The auditor flags the outdated version. The protocol team explains they "didn\'t know there were updates." The auditor notes that two of the three security fixes in the intervening versions are relevant to patterns used in this protocol\'s code.',
      outcome: 'The audit scope expands to cover vulnerabilities that the 2.4.0 version left unpatched. The audit cost increases by approximately $15,000 and 2 weeks. The team updates to 2.8.0, but the audit must be partially re-run on the updated code. The outdated tooling created direct financial and timeline cost. This is the constraint from the lesson: a protocol\'s tooling version is a proxy for their development rigour — and for auditors, it is a red flag.',
    },
    {
      contextTag: '[Ethereum developer evaluating Starknet Foundry as a Cairo testing option]',
      context: 'An Ethereum developer who uses Ethereum Foundry daily considers evaluating Starknet. She asks: "How similar is Starknet Foundry to what I already know?"',
      scenario: 'She reads the Starknet Foundry documentation. She finds: the command structure is intentionally similar to Ethereum Foundry (snforge test runs tests, similar to forge test). The configuration file format is analogous. But tests are written in Cairo, not in Solidity, which requires learning Cairo syntax. Advanced features like fuzzing have fewer configuration options than Ethereum Foundry\'s mature fuzzer.',
      outcome: 'Her assessment: "The API design is familiar enough to reduce the Foundry-specific learning curve. The Cairo syntax for tests is a new requirement — not impossible but meaningful work. Advanced fuzzing coverage is thinner. For my use case (building a new protocol from scratch on Starknet), Starknet Foundry is adequate. For porting a complex Ethereum protocol with advanced test requirements, I would budget extra time for the tooling transition."',
    },
  ],

  guidedPractice: [
    {
      question: 'Starknet Foundry has 800 GitHub stars. Ethereum Foundry has 8,000. Which of the following is the correct interpretation of this 1:10 ratio?',
      options: [
        'A. Starknet Foundry is 10× lower quality than Ethereum Foundry',
        'B. Starknet Foundry has a 10× smaller community of users who have found and bookmarked it — a reflection of the smaller Cairo developer pool, not necessarily of tool quality',
        'C. Starknet Foundry is unmaintained — no developer uses it',
        'D. The comparison is invalid — GitHub stars cannot be compared across different languages',
      ],
      correct: 1,
      hint: 'GitHub stars measure community endorsement, not code quality. What does the size of the surrounding developer ecosystem determine?',
      explanation: 'B is correct. GitHub stars reflect how many developers found the tool useful enough to bookmark — a proxy for community size and awareness. Starknet has ~3,000 Cairo developers vs ~150,000 Solidity developers. A 1:10 star ratio on testing frameworks for a 1:50 developer ratio actually suggests Starknet Foundry is disproportionately well-adopted within its community. Stars measure community size, not tool quality. A 2-person team\'s tool used by 100 people can be excellent; a massive ecosystem\'s tool used by millions may have accumulated stars from casual observers.',
    },
    {
      question: 'An audit of Starknet projects finds 40% are using a Scarb version that is 6 months behind the current release. What specific risk does this create?',
      options: [
        'A. No risk — older versions are often more stable than newer ones',
        'B. Known security bugs fixed in the 6-month period between the old and current version may remain unpatched in projects using the old version — creating vulnerabilities that are public knowledge but unaddressed in affected protocols',
        'C. The risk is cosmetic only — outdated tooling produces slower compilation but no security issues',
        'D. The risk only applies if the protocol has not been audited',
      ],
      correct: 1,
      hint: 'If a bug was fixed in a newer version of a tool, what happens to protocols using the older version?',
      explanation: 'B is correct. Software updates often include security patches. A protocol using a 6-month-old version of Scarb has not received any security fixes applied in that period. More dangerously: those fixes are typically public (described in release notes), meaning attackers know about the vulnerability even if the protocol team does not. This is the "known vulnerability" risk: the attack path is documented, but the target has not patched it. Option A is incorrect — stability is a separate property from security. Option D is wrong — audits check code logic, not tooling version security.',
    },
    {
      question: 'What specific advantage does Starknet Foundry have over Ethereum Foundry in terms of test fidelity?',
      options: [
        'A. Starknet Foundry runs tests faster because Cairo is a faster language',
        'B. Starknet Foundry executes tests directly on the Cairo VM — so the environment in which tests run is identical to the environment in which production code runs. There is no translation layer that could create false positives or false negatives.',
        'C. Starknet Foundry has more test plugins than Ethereum Foundry',
        'D. Starknet Foundry tests can be written in both Cairo and Solidity',
      ],
      correct: 1,
      hint: 'What is the significance of using the actual execution environment (Cairo VM) for running tests rather than a simulated version of it?',
      explanation: 'B is correct. Starknet Foundry\'s primary technical advantage is that tests execute on the actual Cairo VM — not a simulated version of it. This means every behaviour observed in tests is guaranteed to match behaviour on Starknet itself. Ethereum Foundry uses a local EVM simulation (Foundry\'s own implementation) which is highly accurate but not byte-for-byte identical to Ethereum\'s EVM in all edge cases. For Cairo, the test environment and production environment are the same VM. Option C is wrong — Starknet Foundry has fewer plugins, not more.',
    },
    {
      question: 'A Starknet Foundry GitHub issue has been open for 8 months with no resolution. The issue describes an edge case in how contract events are captured during testing. What does this signal to an ecosystem analyst?',
      options: [
        'A. The tool is abandoned — the team has stopped maintaining it',
        'B. Edge case issues in smaller ecosystems typically take longer to resolve because fewer developers are affected and fewer contributors have capacity to investigate. This is a community size constraint, not necessarily a maintenance failure — check recent commit history to distinguish the two.',
        'C. The edge case is unfixable — it is a fundamental Cairo VM limitation',
        'D. All Starknet projects using event testing are vulnerable to a security exploit',
      ],
      correct: 1,
      hint: 'What determines how quickly an issue is resolved? Is it only the team\'s effort, or also how many community members are affected and able to contribute?',
      explanation: 'B is correct. Issue resolution speed depends on: how many developers encounter the bug (more affected = faster triage), whether a contributor with the relevant expertise has capacity to work on it, and whether it is a priority for the core team. An edge case affecting a small percentage of use cases in a small ecosystem can sit open for months without indicating abandonment. The correct check: recent commits and releases — if the tool has had active commits in the last 2 weeks, it is not abandoned; the specific edge case is just lower priority than other work. Option A makes the abandonment claim without evidence.',
    },
    {
      question: 'A protocol audit report describes Scarb as "the equivalent of npm for Cairo." What does this analogy tell a non-technical stakeholder about what Scarb does?',
      options: [
        'A. Scarb is a social network for Cairo developers',
        'B. Like npm manages JavaScript packages, dependencies, and project setup, Scarb manages Cairo packages, project configuration, and the compilation process — it is the tool that sits between a developer\'s idea and a deployable Cairo contract',
        'C. Scarb is a competitor to npm — developers choose one or the other',
        'D. Scarb is a Cairo coding assistant that helps developers write code faster',
      ],
      correct: 1,
      hint: 'What does npm do for JavaScript developers? Apply that role to Cairo.',
      explanation: 'B is correct. npm (Node Package Manager) is the tool JavaScript developers use to install dependencies, manage project configuration, and run scripts. Scarb fills exactly this role for Cairo: it creates project structures, manages the Scarb.toml dependency file, downloads packages, and triggers compilation. A non-technical stakeholder who understands npm\'s role in JavaScript development immediately understands Scarb\'s role in Cairo development through this analogy.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Starknet Foundry GitHub data: 800 stars, last commit 3 days ago, 45 open issues (12 "good first issue"), 6 active contributors last month, 4 releases in past 6 months. Ethereum Foundry: 8,000 stars, last commit yesterday, 200 open issues, 42 active contributors last month, 8 releases in past 6 months. Calculate: (1) stars ratio, (2) contributors ratio, (3) releases ratio. Identify where Starknet Foundry\'s gap is smallest relative to its community size and what this implies about tool health.',
      scoringCriteria: [
        'Stars ratio: 800/8,000 = 1:10. Contributors ratio: 6/42 = 1:7. Releases ratio: 4/8 = 1:2.',
        'Correctly identifies that releases (1:2) is the smallest gap — Starknet Foundry releases at half the frequency of Ethereum Foundry despite having 10× fewer community stars and 7× fewer contributors',
        'Correctly interprets: the releases ratio is a positive signal — the core team is shipping at a pace that outperforms its community size. The bottleneck is community contributors (1:7 ratio vs 1:50 developer pool), not team effort.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol auditor reviews a submission and finds: Scarb version 2.4.0 (current: 2.8.0), last updated 7 months ago. Release notes for versions 2.5.0, 2.6.0, 2.7.0, and 2.8.0 list: 2 critical bug fixes, 4 high severity fixes, 8 medium fixes. The protocol has not yet deployed to mainnet. Identify: (1) the specific risk created by the version gap, (2) whether the pre-deployment timing changes the risk level, (3) what the protocol team should do before the audit proceeds.',
      scoringCriteria: [
        'Risk: 2 critical and 4 high severity fixes in the gap period may apply to this protocol\'s code patterns. Vulnerabilities are publicly known (in release notes) and unpatched in the submitted code.',
        'Pre-deployment timing reduces but does not eliminate risk: the code is not yet live with user funds, which means there is time to update. However, the audit scope must cover the old version\'s known issues — expanding audit cost.',
        'Protocol team should update to Scarb 2.8.0, recompile, run their own tests, and resubmit — allowing the audit to proceed against the patched version, reducing both cost and vulnerability surface area.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A CTO whose team has been using Ethereum Foundry for 3 years asks: "If we move to Starknet, what specifically changes about our testing workflow and where will our team struggle?" Write a response that is specific about which tools map to what they know and where the genuine gaps are. Use no jargon without definition.',
      scoringCriteria: [
        'Correctly maps Ethereum Foundry to Starknet Foundry: the command interface is intentionally similar (snforge test mirrors forge test), configuration file structure is analogous, and the overall workflow is recognisable — this reduces the tooling-specific learning curve',
        'Correctly identifies genuine gaps: tests must be written in Cairo (new language), advanced fuzzing options are fewer, Stack Overflow coverage for edge cases is thin (debugging requires Discord/GitHub Issues instead of public forums), and the plugin ecosystem for coverage and gas analysis is less developed',
        'Gives a concrete estimate: an experienced Foundry team would spend approximately 2–4 weeks getting comfortable with Starknet Foundry specifically (excluding Cairo language learning time), with the biggest friction being Cairo syntax and the thinner community resources for debugging unusual issues',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L4.3 — Starkzap SDK and Frontend Developer Adoption
// TYPE C — Tool-first. The SDK chain (SDK → app → users) IS
// the mechanism. Lower friction = more apps = more users =
// deeper liquidity = more protocol value.
// ─────────────────────────────────────────────────────────────

export const LAB4_LESSON_3 = {
  id: 'l4-3-starkzap-sdk',
  title: 'Starkzap SDK and Frontend Developer Adoption',
  trackType: 'C',
  lessonNumber: 3,
  evaluationNote: 'This lesson teaches you to evaluate the Starkzap SDK from an ecosystem analysis perspective. You will not write any code.',

  explanation: `
LAYER 1 — WHAT YOU ARE BUILDING TOWARD

By the end of this lesson, you can evaluate any blockchain SDK using three specific analyst questions: friction (how hard is it to build with?), adoption (how many apps are using it in production?), and risk (what happens if the SDK team disappears?). You will apply these to the Starkzap SDK specifically and understand why the SDK layer is the direct link between developer tooling quality and user count.

This lesson evaluates the final step of the developer pipeline from Primer L0.3 — the connector between deployed contracts and the users who interact with them. Not how to use the SDK, but how to assess it.

LAYER 2 — THE SDK AND ITS CHAIN OF CONSEQUENCES

WHY THE SDK LAYER MATTERS MORE THAN IT APPEARS

A deployed smart contract sitting at a Starknet address is like a service existing in a building with no front door. The service is real. The capability is real. But no one can reach it without an interface.

The SDK is that front door. It provides the functions that frontend developers — the people who build websites and mobile apps — use to connect user wallets, submit transactions, read contract state, and display results to users. Without an SDK, every frontend developer would have to build these connection functions from scratch. That is months of work before the first user ever sees the product.

The chain of consequences:

Better SDK → less code to write → faster app development → more apps built → more users reach DeFi → deeper protocol liquidity → higher protocol revenue → stronger token economics → more investment → more apps built.

Every link in this chain depends on the previous one. The SDK quality directly determines how fast the Starknet application layer can grow. This is not a peripheral developer convenience — it is an ecosystem growth multiplier.

THE STARKZAP SDK — THREE ANALYST QUESTIONS

QUESTION 1 — FRICTION: HOW HARD IS IT TO USE?

The specific metrics an analyst uses:

Lines of code to execute a gasless swap: 3 lines. (This is a specific, verifiable claim in the SDK documentation. The equivalent in raw Starknet.js — the alternative library — requires approximately 15–20 lines for the same operation, including manual paymaster configuration.)

Time from zero to first working Sepolia transaction using the quickstart guide: under 30 minutes for a developer who already knows JavaScript/TypeScript. This is measured by timing new developer onboarding sessions.

Documentation clarity: the Starkzap SDK quickstart guide is consistently cited by developers in the Starknet community as the fastest path to a working Starknet integration. This is a qualitative signal from developer community surveys.

QUESTION 2 — ADOPTION: HOW MANY PRODUCTION APPS USE IT?

npm download counts are the standard proxy for SDK adoption: Starkzap SDK npm downloads approximately 12,000/month. Starknet.js (the older, lower-level alternative) downloads approximately 80,000/month.

The interpretation is nuanced: Starknet.js has higher absolute downloads but serves a different use case — it is the low-level library that developers use when they need direct access to Starknet's full API. Starkzap SDK is the higher-level abstraction layer designed for faster app development with simpler code. The two are complementary, not pure competitors.

What the 12,000/month figure tells you: Starkzap SDK is being actively used in production by a meaningful portion of Starknet's frontend developer community. It is not a toy project — it is an actively-maintained production library.

A more meaningful signal than raw downloads: known production apps built on Starkzap SDK. AVNU's mobile interface, several Starknet gaming applications via Cartridge Controller, and multiple DeFi dashboards use the SDK in production. These are concrete adoption signals that downloads alone cannot capture.

QUESTION 3 — RISK: WHAT HAPPENS IF THE TEAM DISAPPEARS?

The Starkzap SDK is maintained by a small team (approximately 3 core contributors). This is the primary risk factor for any startup building on it as their sole connection layer.

The risk is not that the SDK will become malicious — it is that bug fixes slow down, new Starknet protocol integrations are delayed, and compatibility updates with Starknet's own upgrades fall behind. A startup that builds its entire DeFi app on the Starkzap SDK with no fallback or internal SDK capability is entirely dependent on that small team's continued engagement.

Mitigation strategies an analyst should flag:
— Maintain an internal Starknet.js integration as a fallback layer (more code, less convenient, but independent of the Starkzap SDK)
— Contribute to the SDK open-source repository (builds internal familiarity and reduces key-person risk)
— Monitor SDK release cadence — if commits slow for more than 30 days, investigate

LAYER 3 — THE CONSTRAINT

This is called SDK dependency risk. The constraint: an application is only as reliable as its most critical dependency. If the Starkzap SDK is the sole path for user transactions, its reliability, security update cadence, and API stability are not optional considerations for an app built on it — they are existential dependencies. An analyst reviewing any Starknet app should ask: "What is your SDK dependency strategy if your primary SDK stops being maintained?"

LAYER 4 — WHERE THIS SITS IN THE TRACK

The SDK friction analysis feeds directly into the Lab 4 Build Task Option A (developer onboarding friction analysis includes SDK friction as a component) and Option B (SDK comparison report). In Lab 6 (protocol research methodology), SDK adoption is a proxy for developer ecosystem health. In Lab 9 (grant proposals), an applicant's SDK strategy is evaluated as part of technical feasibility.
  `.trim(),

  keyTakeaway: `The Starkzap SDK reduces gasless swap execution from ~20 lines of code to 3, with time-to-first-transaction under 30 minutes — SDK friction directly determines how fast the application layer grows, and the 3-person maintenance team is the primary risk for any production app depending solely on it.`,

  visualPrompt: `A three-section diagram. Section 1 (Friction): two code blocks side by side — "Starkzap SDK: 3 lines" (green background, minimal) vs "Starknet.js raw: 15-20 lines" (amber background, more code). Label: "Time-to-first-transaction: <30 min." Section 2 (Adoption): bar chart showing npm downloads — Starkzap SDK 12K/month vs Starknet.js 80K/month. Below: note "Complementary, not competitive — different abstraction levels." Section 3 (Risk): a dependency chain diagram showing "App → Starkzap SDK → Starknet → Users" with a red highlight on "Starkzap SDK: 3 core contributors" and a dotted fallback arrow labelled "Starknet.js fallback layer (recommended)."`,
  visualType: 'static',
  visualUrl: 'starkzap-sdk-friction-adoption-risk',

  examples: [
    {
      contextTag: '[Developer choosing between Starkzap SDK and Starknet.js]',
      context: 'A frontend developer is building a Starknet DeFi dashboard. She needs to connect wallets, read contract state, and execute swaps. She is evaluating whether to use Starkzap SDK or Starknet.js.',
      scenario: 'She reads both quickstart guides. Starkzap SDK: one npm install command, 3 lines to execute a gasless swap, built-in AVNU Paymaster integration, 30-minute path to a working demo. Starknet.js: more flexible API access, but requires manually configuring the paymaster, more lines per operation, and a steeper initial setup for the specific features she needs.',
      outcome: 'She chooses Starkzap SDK for speed-to-market: her startup needs a demo in 2 weeks. She also adds a Starknet.js integration for contract reads as a fallback, acknowledging the SDK dependency risk. Her decision correctly balances friction (Starkzap wins) against risk (Starknet.js as partial fallback). This is the rational choice for most early-stage Starknet apps.',
    },
    {
      contextTag: '[Analyst interpreting npm download ratio]',
      context: 'An analyst is comparing Starkzap SDK (12,000/month npm downloads) to Starknet.js (80,000/month) and must characterise whether Starkzap SDK has "weak adoption."',
      scenario: 'She researches the use case difference: Starknet.js is the base library — it is used by developers who need direct API access, by protocol teams building internal tooling, and as the dependency layer that Starkzap SDK itself uses internally. Starkzap SDK is the higher-level abstraction for building user-facing applications faster.',
      outcome: 'Her report states: "The 12,000 vs 80,000 download comparison is misleading as a competitive comparison — Starkzap SDK and Starknet.js serve different abstraction levels. The more meaningful signal is production apps using Starkzap SDK, which includes AVNU\'s mobile interface and multiple gaming applications — concrete proof of production viability. Starkzap SDK adoption is appropriate for its positioning as a high-level application SDK."',
    },
    {
      contextTag: '[Startup assessing SDK dependency risk]',
      context: 'A 4-person startup is building a Starknet mobile DeFi app. They plan to use Starkzap SDK exclusively for all Starknet interactions. Their technical lead notes the SDK is maintained by 3 core contributors.',
      scenario: 'Their analyst flags the key-person risk: if 2 of the 3 core contributors move to other projects, update frequency could drop. The analyst recommends: (1) contribute one engineer as an open-source contributor to Starkzap SDK — building internal expertise and partial key-person mitigation, (2) implement critical read operations using Starknet.js directly as a fallback.',
      outcome: 'The startup adopts both recommendations. Six months later, one of the 3 Starkzap SDK contributors does transition to a new project. Because the startup has an engineer who is now familiar with the codebase and has made contributions, they can maintain the critical functions they depend on independently for 2–3 months while the SDK governance transitions. The mitigation worked.',
    },
  ],

  guidedPractice: [
    {
      question: 'Starkzap SDK npm downloads are 12,000/month. Starknet.js downloads are 80,000/month. An analyst concludes "Starkzap SDK has only 15% of Starknet.js adoption — it is not widely used." What is wrong with this conclusion?',
      options: [
        'A. The conclusion is correct — 15% adoption is very low',
        'B. The comparison treats two tools serving different abstraction levels as direct competitors. Starknet.js is a lower-level base library used across many contexts; Starkzap SDK is a higher-level application layer. A more relevant measure is production apps built on each.',
        'C. npm downloads are not a valid measure of adoption for any library',
        'D. The analyst should use GitHub stars instead of downloads for comparison',
      ],
      correct: 1,
      hint: 'What does Starknet.js do that the Starkzap SDK does not, and vice versa? Are they truly substitutes?',
      explanation: 'B is correct. Starknet.js is the foundational library — protocol teams, automated infrastructure, data indexers, and the Starkzap SDK itself all use Starknet.js as a dependency. Starkzap SDK is a higher-level tool for building user-facing applications with minimal boilerplate. Comparing their download counts is like comparing a car engine\'s production volume to a finished car\'s sales count — the engine appears in many more products because it is a foundational component, not because cars are less valuable.',
    },
    {
      question: 'A startup uses Starkzap SDK exclusively as their sole Starknet connection layer. The SDK is maintained by 3 core contributors. What is the specific risk this creates and what is the correct mitigation?',
      options: [
        'A. No risk — open-source tools are maintained indefinitely by the community',
        'B. If the core contributors reduce engagement, bug fixes and compatibility updates slow. The startup\'s app becomes vulnerable to unresolved bugs and incompatibility with Starknet upgrades. Mitigation: add Starknet.js as a direct fallback for critical operations and contribute to the SDK to build internal expertise.',
        'C. The risk is legal — open-source tools can change their license without notice',
        'D. The risk is that competitors will copy the startup\'s app if they also use the same SDK',
      ],
      correct: 1,
      hint: 'What happens to an app if its key dependency stops receiving updates? What reduces this risk?',
      explanation: 'B is correct. A 3-person core team creates key-person risk: if engagement drops, the SDK\'s update cadence slows. Starknet upgrades its own protocol periodically — if the SDK does not update to match, apps built on it break. Mitigations: (1) use Starknet.js for critical read operations directly (independent of SDK), (2) contribute an engineer to the SDK codebase (builds familiarity and partial in-house ownership of critical functions). Option A is wrong — open-source does not guarantee perpetual maintenance.',
    },
    {
      question: 'The Starkzap SDK allows a gasless swap in 3 lines of code. Starknet.js requires approximately 15–20 lines for the same operation. Why does this friction difference matter for ecosystem growth?',
      options: [
        'A. It only matters for beginner developers — experienced developers can write 20 lines as fast as 3',
        'B. Lower friction means faster development cycles, more apps built per developer-hour, faster time-to-market for startups, and lower barriers for less experienced frontend developers — all of which expand the pool of people who can build on Starknet.',
        'C. The difference is cosmetic — both produce the same result so there is no real difference',
        'D. Higher line count means better security — more lines means more places to validate input',
      ],
      correct: 1,
      hint: 'Think about the chain of consequences: friction reduction → ? → ? → more users. Fill in the chain.',
      explanation: 'B is correct. SDK friction is not just about developer convenience — it is a growth multiplier. Lower friction means: startups hit demos faster (faster fundraising), hackathon developers build working prototypes in hours rather than days (more Starknet projects at hackathons), less experienced developers can build functional apps (wider developer pool), and time-to-market compresses. Each of these directly increases the number of Starknet apps that reach users. More apps = more users = deeper liquidity = stronger ecosystem. Option C is wrong — the result is the same functionality, but the cost to produce it differs dramatically.',
    },
    {
      question: 'Why is "time from zero to first working Sepolia transaction" a useful metric for evaluating an SDK, even though it measures only one specific outcome?',
      options: [
        'A. It is not useful — the only relevant metric is production app count',
        'B. It is an end-to-end integration test: it measures whether documentation is clear, dependencies install without errors, the SDK handles wallet connection correctly, and the transaction actually works on the test network — capturing multiple failure points in a single measurable outcome',
        'C. It is useful only for developers who have never used any SDK before',
        'D. It measures how fast Starknet processes transactions, which is useful for performance analysis',
      ],
      correct: 1,
      hint: 'What must go right for a developer to achieve their first working transaction? How many potential failure points does the metric capture?',
      explanation: 'B is correct. First-working-transaction time is a useful composite metric because many things can go wrong: unclear documentation (developer gets stuck on step 3), dependency conflicts (installation fails), wallet connection errors (SDK and wallet are incompatible), test network configuration issues, or actual transaction failure. If a developer completes their first transaction in under 30 minutes, documentation is clear, installation works, wallet integration is smooth, and the basic happy path is functional — multiple quality dimensions captured in one number. If it takes 4 hours, something is broken somewhere in that chain.',
    },
    {
      question: 'AVNU\'s mobile DeFi interface uses Starkzap SDK in production. Why is this a stronger adoption signal than npm download count alone?',
      options: [
        'A. AVNU is a larger company so their opinion matters more than the data',
        'B. A production app serving real users with real money at stake is evidence that the SDK handles edge cases, maintains reliability under load, and is trusted by a protocol team with reputation on the line — downloads can include test installations and evaluation copies that do not reflect real production use',
        'C. npm downloads are always inflated by bots — production app use is the only reliable metric',
        'D. AVNU being on Starknet means the SDK is automatically verified by StarkWare',
      ],
      correct: 1,
      hint: 'What is the difference between downloading an SDK to try it and deploying it in an app that real users send real money through?',
      explanation: 'B is correct. npm downloads include developers evaluating the SDK, testing it in toy projects, or downloading it as a transitive dependency. Production use in a protocol serving real users means: the SDK has been integrated, tested, and validated to work correctly under real conditions. A protocol team like AVNU, with reputation and user funds at stake, would not use an unreliable SDK. This is a qualitative signal that downloads cannot replicate — it is the difference between someone tasting a restaurant\'s food and a Michelin inspector certifying it.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'SDK comparison data: Starkzap SDK — 12,000 npm downloads/month, 3 core contributors, last commit 4 days ago, 5 known production apps, time-to-first-transaction 28 minutes. Starknet.js — 80,000 downloads/month, 14 contributors, last commit yesterday, 40+ known production integrations, time-to-first-transaction 55 minutes. Calculate the download ratio. Identify which SDK is more appropriate for (a) a startup wanting fastest time-to-demo, and (b) a protocol team building custom Starknet infrastructure tooling. Justify each.',
      scoringCriteria: [
        'Download ratio correctly calculated: 12,000/80,000 = 15% or 1:6.7',
        '(a) Startup fastest time-to-demo: Starkzap SDK — 28 minute integration time vs 55 minutes, fewer lines of code, built-in paymaster — lower friction is the primary criterion for a demo timeline',
        '(b) Protocol team building infrastructure: Starknet.js — more contributors (more maintained), broader API coverage, used by 40+ integrations meaning more community resources and edge case documentation — infrastructure requires reliability and flexibility over speed',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A startup has built their entire Starknet DeFi app using only Starkzap SDK. They have 3,000 daily active users and $800,000 in protocol TVL. Starknet announces a protocol upgrade in 45 days that changes how transaction fee calculation works. The Starkzap SDK team acknowledges the change but says they need 60 days to update the SDK. Identify the specific risk this creates and the two options the startup has.',
      scoringCriteria: [
        'Risk: the protocol upgrade happens in 45 days. The SDK update is promised in 60 days. For 15 days after the upgrade, transactions submitted through the unupdated SDK may calculate fees incorrectly or fail entirely — creating a period of potential service disruption for 3,000 daily users.',
        'Option 1: Fork the relevant Starkzap SDK code, apply the fee calculation patch internally, and run the patched version for the 15-day gap. Requires internal Cairo/TypeScript expertise.',
        'Option 2: Implement the transaction submission layer directly in Starknet.js (which is updated faster due to more contributors and being the base layer) as a temporary fallback for the upgrade window, then migrate back to Starkzap SDK when it updates.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write the "developer onboarding" section of a Starknet ecosystem report (150 words maximum). Include: (1) time-to-first-transaction benchmark for Starkzap SDK, (2) the two main SDK options and their respective use cases, (3) one specific friction point that remains despite SDK improvements. Use no jargon without definition.',
      scoringCriteria: [
        'Correctly states the time-to-first-transaction benchmark: under 30 minutes using Starkzap SDK quickstart for developers with JavaScript experience',
        'Correctly distinguishes the two options: Starkzap SDK (higher-level, fewer lines, built-in paymaster — for apps wanting fastest integration) and Starknet.js (lower-level, full API access — for infrastructure and custom integrations)',
        'Identifies a real remaining friction point: either (a) wallet connection on mobile requires Cartridge Controller or Braavos — not all existing mobile wallets are compatible, creating user onboarding friction, or (b) debugging failed transactions requires understanding Starknet error messages which are less developer-friendly than Ethereum\'s',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L4.4 — Dojo Game Engine and Gaming Ecosystem
// TYPE A — Dominant concept: Dojo enables on-chain games where
// state and ownership are permanent and verifiable. Adoption
// signals (DAU, games shipped, studio growth) determine whether
// the gaming thesis is materialising.
// ─────────────────────────────────────────────────────────────

export const LAB4_LESSON_4 = {
  id: 'l4-4-dojo-gaming',
  title: 'Dojo Game Engine and Gaming Ecosystem',
  trackType: 'A',
  lessonNumber: 4,
  evaluationNote: 'This lesson evaluates Dojo and Starknet gaming from an ecosystem analysis perspective.',

  explanation: `
In 2021, Axie Infinity — a blockchain game built on Ronin, an Ethereum sidechain — reached 2.7 million daily active players. Players earned real income by playing: they could breed, battle, and sell digital creatures for tokens that converted to real money. In the Philippines, some players were earning more from Axie than from traditional employment. The game demonstrated that blockchain gaming had genuine, mainstream user potential — not just speculative interest.

By 2022, Axie's player count had fallen 95%. The tokenomics that funded player earnings had collapsed. The game's "play-to-earn" model turned out to be economically unsustainable at scale — it required constant new player investment to maintain existing player earnings. The model broke.

Starknet's gaming ecosystem represents a different approach. Rather than "play-to-earn" incentives funded by tokenomics, Starknet gaming is built on a different premise: games whose rules, state, and ownership are permanent and provably correct — not because a company says so, but because they live on-chain.

WHAT DOJO IS

Dojo is a game engine built specifically for on-chain games on Starknet. A game engine is the technical framework that developers use to build a game — it handles the underlying systems (physics, entity management, state updates) so developers can focus on gameplay.

What makes Dojo different from traditional game engines like Unity or Unreal: Dojo is designed so that every game action is a blockchain transaction. Every move a player makes is recorded on-chain, immutable, and provably correct. The game state lives on Starknet, not on a company's server. If the game studio shuts down tomorrow, the game continues to exist and run as long as Starknet runs.

Dojo uses an architecture called ECS — Entity Component System. For non-coders, this means: every element of the game world (entities = characters, items, locations) has properties (components = health, speed, inventory) that can be changed by actions (systems = attack, move, craft). The ECS model maps naturally to blockchain transactions because each action is a discrete, verifiable state change.

WHAT ADOPTION SIGNALS MATTER

For gaming, TVL is not the relevant metric. Gaming ecosystems are measured by:

Daily Active Users (DAU): how many unique wallets interact with the game each day. This is the gaming equivalent of TVL — the primary usage metric.

Games shipped: how many games have gone to production (not just to testnet or demo). The number of shipped games indicates whether the engine is mature enough for teams to commit to it.

Studio growth: how many game studios are actively building on Dojo. Studios represent demand for the platform. A growing studio count precedes game launches.

Retention: do users come back? A game with 8,000 DAU but 1% day-7 retention is not functioning as a game — it is a one-time curiosity. A game with 1,000 DAU and 40% day-7 retention has a sustainable player base.

CURRENT STATE OF STARKNET GAMING

Approximately 3 games have reached above 1,000 daily active users as of current data. Loot Survivor 2 and Ponziland are two of the most active. The total gaming DAU across the Starknet ecosystem is in the tens of thousands — meaningful but far below Axie's peak or major Web2 gaming titles.

The studio pipeline — teams using Dojo to build games that have not yet launched — is more encouraging. The Dojo ecosystem has attracted several funded studios, and the tooling quality has improved significantly in 2023–2024.

COMPARISON TO IMMUTABLE X

Immutable X is an Ethereum Layer 2 built specifically for gaming and NFTs. It uses a different model: ZK proofs for scalable NFT transfers and minting, with EVM compatibility, and a focus on existing game studios (it powers Gods Unchained, Illuvium, and Guild of Guardians).

The key difference: Immutable X targets existing gaming studios that want to add NFT ownership to conventional games. Starknet + Dojo targets games built entirely on-chain — where the game logic itself lives on the blockchain, not just the ownership layer.

Two different bets on the future of gaming: Immutable X bets that existing game formats will adopt blockchain ownership. Dojo/Starknet bets that a new category of games — games that only make sense on-chain, where provable fairness and permanent state are features, not add-ons — will emerge and grow.

Both are plausible. They are not competing for the same games or the same players today.
  `.trim(),

  keyTakeaway: `Dojo enables permanently on-chain games with verifiable game logic through ECS architecture — the correct metrics are DAU, games shipped, and player retention (not TVL) — and Starknet gaming's thesis (on-chain-native games) is distinct from Immutable X's thesis (blockchain ownership layered onto conventional games).`,

  visualPrompt: `A two-part comparison diagram. Part 1 (left): "Traditional game" — flow shows game state stored on company server (fragile, deletable, company-controlled). Part 2 (right): "Dojo on-chain game" — flow shows game state stored on Starknet (permanent, verifiable, runs as long as Starknet runs). Below both: a metrics comparison table — "Traditional: DAU from analytics platform, state lost on shutdown." vs "Dojo: DAU from on-chain wallet interactions, state permanent." Second section: side-by-side comparison of Immutable X thesis ("NFT ownership on top of conventional games") vs Dojo/Starknet thesis ("games native to blockchain — logic itself on-chain"). Different target audiences, different timelines.`,
  visualType: 'static',
  visualUrl: 'dojo-gaming-ecosystem-comparison',

  examples: [
    {
      contextTag: '[Analyst interpreting gaming DAU gap]',
      context: 'Loot Survivor 2 on Starknet has 8,000 daily active users. Axie Infinity at peak had 2.7 million. An analyst is asked whether this gap means Starknet gaming has failed.',
      scenario: 'The analyst researches context. Axie Infinity launched in 2018 and took 3 years to reach 2.7M DAU, peaking in August 2021 with significant marketing spend and the economic incentive of real income for Filipino players. Loot Survivor 2 launched in 2023 — a different era with different dynamics, targeting a crypto-native audience, with no "play-to-earn" income model (intentionally).',
      outcome: 'Her report states: "The 8,000 vs 2.7M comparison is contextually inappropriate — they represent different gaming models, different development timelines, and different target audiences. The more relevant comparison is: Starknet gaming has 3 games above 1,000 DAU within 18 months of Dojo\'s first production-ready release, with a growing studio pipeline. The absolute DAU gap is real; characterising it as failure ignores the stage of development."',
    },
    {
      contextTag: '[Game studio choosing between platforms]',
      context: 'A 6-person game studio has 18 months of runway and wants to launch a blockchain game. They are evaluating Unity (Web2), Immutable X (Ethereum gaming L2), and Starknet + Dojo.',
      scenario: 'Unity analysis: developer familiarity (their team knows Unity), fastest time-to-market (no blockchain learning curve), largest existing player base, but no on-chain ownership. Immutable X: EVM-compatible (their backend developer knows Solidity), NFT ownership features, existing studio relationships, faster launch than Cairo, but conventional game model. Starknet + Dojo: requires Cairo learning curve (estimate 4 months for team), permanent on-chain game state, provably fair mechanics, but smallest existing player base.',
      outcome: 'They choose Immutable X: 18 months of runway makes the Cairo learning curve on Starknet too risky. A 4-month learning investment on a game that might take 14 months to build leaves zero buffer. Immutable X lets them ship faster with existing skills. The Starknet thesis (on-chain native games) is compelling for their next game if Immutable X succeeds. The decision is rational given their runway — not a verdict on which platform is better.',
    },
    {
      contextTag: '[Why player retention matters more than DAU peak]',
      context: 'A new Dojo game launches and gets 15,000 DAU in week 1 (driven by airdrop incentives for playing). By week 4, DAU has fallen to 800.',
      scenario: 'An analyst is asked to characterise the game\'s performance. She focuses on retention: 800 week-4 users / 15,000 week-1 users = 5.3% day-28 retention. Industry benchmarks for gaming: 40% day-7 retention is considered strong, 10–20% is average. 5.3% at day-28 is within expected range if day-7 retention was ~15–20%.',
      outcome: 'Her analysis: "The week-1 spike was airdrop-driven, not organic. The more meaningful metric is whether the 800 week-4 players are genuine engaged players. If week-5, 6, 7 retain 600–700 of those 800, the game has a sustainable core. A 15,000 → 800 headline looks like failure but the retained 800 could be the foundation of a healthy player community. Monitor week-4 to week-8 retention rather than comparing week-1 peak to week-4."',
    },
  ],

  guidedPractice: [
    {
      question: 'Why is TVL not the primary metric for evaluating Starknet\'s gaming ecosystem?',
      options: [
        'A. TVL is the primary metric for gaming — games with more value locked are always more successful',
        'B. Gaming ecosystem health is measured by DAU, games shipped, and player retention — TVL measures financial deposits, which is not the core activity in gaming. A game with 50,000 DAU and zero TVL is more successful as a game than one with $5M TVL and 100 DAU.',
        'C. TVL cannot be measured on-chain for gaming protocols',
        'D. Gaming protocols do not use tokens, so TVL is zero by definition',
      ],
      correct: 1,
      hint: 'What is the core activity that defines gaming success? Is it depositing money or playing?',
      explanation: 'B is correct. TVL measures tokens deposited into smart contracts — a measure of financial participation appropriate for lending protocols and DEXs. A game\'s success is measured by whether people play it (DAU), whether it ships (games launched), and whether people keep playing (retention). A game with high TVL but low DAU has attracted capital but not players — a misaligned signal for gaming. The relevant metrics for gaming are player-centric, not capital-centric.',
    },
    {
      question: 'What is the core difference between Immutable X\'s gaming thesis and Dojo/Starknet\'s gaming thesis?',
      options: [
        'A. Immutable X uses ZK proofs and Starknet does not',
        'B. Immutable X adds NFT ownership on top of conventional games (the game logic lives on a studio\'s server). Dojo/Starknet puts the game logic itself on-chain — the rules and state are on Starknet, permanent and provably correct.',
        'C. Dojo is for mobile games and Immutable X is for PC games',
        'D. Immutable X is more expensive for users and Starknet is cheaper',
      ],
      correct: 1,
      hint: 'Where does the game logic (the rules of the game) live in each model?',
      explanation: 'B is correct. Immutable X targets existing game developers who want to add NFT-based ownership to their existing game structure — the gameplay itself still runs on the studio\'s servers. Dojo/Starknet targets games where the game logic lives on the blockchain — every move is a transaction, the rules are code that runs on Starknet, and the game cannot be shut down by any company. These are different bets on what form blockchain gaming will take: Immutable X bets on adoption by existing studios; Dojo bets on a new category of native blockchain games.',
    },
    {
      question: 'A Dojo game launches with 12,000 DAU in week 1 (driven by token incentives) and falls to 900 DAU by week 4. How should an analyst characterise this performance?',
      options: [
        'A. Complete failure — 92% user drop is not recoverable',
        'B. Token-incentive-driven launches typically see large initial spikes that normalise to organic retention. The key question is whether week-4 to week-8 retention remains stable — 900 retained players who return without incentives represents a viable organic base to evaluate further.',
        'C. Strong success — 900 daily active users is above industry average for blockchain games',
        'D. The data is insufficient — cannot characterise performance without knowing the game\'s marketing budget',
      ],
      correct: 1,
      hint: 'What is the difference between token-incentivised players and organic players? What does the week-4 number represent?',
      explanation: 'B is correct. Token-incentivised DAU spikes are not the same as organic player interest — many "players" in week 1 are wallet farmers who claim rewards and leave. Week-4 DAU, after incentives normalise, is the first meaningful organic signal. 900 organic players who return because they enjoy the game is the base to evaluate. If weeks 5–8 retain 700–800 of those 900, the game has a stable organic player community. The performance characterisation should focus on the post-incentive retention trend, not the incentive spike.',
    },
    {
      question: 'A game studio with 18 months of runway is evaluating Starknet + Dojo. Their team knows Unity but no Cairo. An analyst estimates the Cairo learning curve at 4 months. Should they build on Starknet + Dojo?',
      options: [
        'A. Yes — Starknet is technically superior and worth the learning investment',
        'B. The decision depends on runway risk: 4 months of learning + game development time must fit within 18 months. For a complex game requiring 10–12 months to build, 4 months of learning leaves 2–4 months of buffer — very thin. For a simpler game buildable in 8 months, 4 months of learning leaves 6 months of buffer — more manageable. The answer is runway-dependent, not technology-dependent.',
        'C. No — a team that does not know Cairo cannot build on Starknet',
        'D. Yes — Cairo can be learned in 2 weeks with the right tutorials',
      ],
      correct: 1,
      hint: 'What is the total time budget: 18 months. What does the 4-month learning curve consume? What is left for development and buffer?',
      explanation: 'B is correct. This is a runway math problem. 18 months total − 4 months Cairo learning = 14 months for game development and buffer. Whether this is viable depends on game complexity. A simple roguelike might need 8 months to build (6 months buffer — viable). A complex multiplayer RPG might need 14 months to build (0 months buffer — not viable). The analyst\'s answer is not "yes" or "no" but "it depends on the game scope relative to the remaining runway after the learning investment." Option A makes the decision based on technology quality alone, ignoring the business constraint.',
    },
    {
      question: 'Loot Survivor 2 has 8,000 DAU. Axie Infinity at peak had 2.7 million DAU. A report says "Starknet gaming is 337× behind Axie — it has clearly failed to gain traction." What is missing from this comparison?',
      options: [
        'A. Nothing — DAU comparison is the only relevant metric',
        'B. The comparison ignores development stage, model difference, and market timing. Axie took 3 years to peak with significant marketing and "play-to-earn" income incentives. Starknet gaming is 1–2 years into Dojo\'s first production release, targeting a different model (on-chain native games, not income-incentivised play). Absolute peak DAU comparisons across different stages, models, and incentive structures do not produce actionable insights.',
        'C. The comparison should use TVL instead of DAU',
        'D. Loot Survivor 2 will surpass Axie within 6 months given the growth trajectory',
      ],
      correct: 1,
      hint: 'Axie reached 2.7M DAU in August 2021 after 3 years, a unique economic environment, and play-to-earn incentives that are not present in Starknet gaming. What context does the comparison ignore?',
      explanation: 'B is correct. The comparison ignores multiple confounding factors: development age (Axie peaked 3 years post-launch; Dojo games are 1–2 years post-release), model difference (Axie used real income incentives; Starknet gaming does not), market timing (2021 was a peak crypto cycle; the comparison may cross market cycles), and target audience (Axie targeted mainstream players in developing economies; Dojo targets crypto-native gamers). A valid comparison would compare Starknet gaming\'s DAU trajectory to Axie\'s DAU trajectory at the equivalent stage of development — not to Axie\'s all-time peak.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Starknet gaming data: 3 games above 1,000 DAU, total gaming DAU across ecosystem approximately 28,000, 12 studios actively building with Dojo (not yet launched), Dojo GitHub: 2,100 stars, last major release 6 weeks ago. Axie Infinity on Ronin: peak 2.7M DAU in 2021, current DAU approximately 35,000. Immutable X ecosystem: 8 games above 1,000 DAU, total gaming DAU approximately 180,000. Using these three data points, characterise Starknet gaming\'s current stage and its most significant gap relative to Immutable X.',
      scoringCriteria: [
        'Correctly characterises Starknet gaming as early-stage: 3 games above 1,000 DAU, 12 studios building but not yet launched, smaller total DAU than Immutable X (28K vs 180K)',
        'Correctly identifies the most significant gap relative to Immutable X: games above 1,000 DAU (3 vs 8) and total ecosystem DAU (28K vs 180K) — the pipeline of 12 studios is encouraging but not yet materialised into shipped games',
        'Notes the Dojo GitHub activity (last major release 6 weeks ago) as a positive signal — the engine is actively developed — and contextualises the gaming DAU gap against the different thesis (on-chain native games vs NFT ownership) rather than treating it as a simple loss',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A game studio is choosing between Unity (Web2), Immutable X (Ethereum gaming L2), and Starknet + Dojo. They have 18 months of runway, a team of 5 developers (all Unity-experienced, no blockchain experience), and their game design is a multiplayer card game where provably fair card dealing (no cheating) is a core feature. Map the trade-offs for each platform on three dimensions: developer familiarity, time to market, and alignment with the core feature (provably fair dealing).',
      scoringCriteria: [
        'Unity: developer familiarity = high (their team knows it), time to market = fastest (no blockchain learning), provably fair dealing = not achievable (server-side RNG is not provably fair)',
        'Immutable X: developer familiarity = medium (EVM/Solidity required — 2–3 month learning curve), time to market = medium, provably fair dealing = partially achievable (NFT ownership is on-chain; game logic is not unless specifically built on-chain)',
        'Starknet + Dojo: developer familiarity = low (Cairo required — 4+ month learning curve), time to market = slowest, provably fair dealing = fully achievable (game logic on-chain means card dealing is transparent, verifiable, and cheat-proof by architecture). Correctly recommends Starknet + Dojo as the only platform where the core feature (provably fair dealing) is a native architectural property, not an add-on — provided the team can manage the runway risk of the Cairo learning curve.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a two-paragraph summary of Starknet gaming\'s current state and 12-month outlook for a Starknet ecosystem report. Paragraph 1: current state (use specific numbers). Paragraph 2: 12-month outlook (be specific about what would need to happen for the gaming thesis to progress). Do not overclaim — the outlook must acknowledge real uncertainties.',
      scoringCriteria: [
        'Paragraph 1 uses specific numbers: correctly states approximately 3 games above 1,000 DAU, 28,000 total ecosystem gaming DAU, 12 studios in pipeline, Dojo actively maintained with recent release',
        'Paragraph 2 identifies specific conditions for thesis progression: (a) 3+ of the 12 pipeline studios must ship to production within 12 months, (b) at least one shipped game must achieve 5,000+ organic DAU (post-incentive), (c) Dojo must continue shipping updates that reduce the Cairo learning curve for new studios. Acknowledges uncertainty: the studio pipeline is a leading indicator, but conversion from pipeline to shipped games is not guaranteed, and the on-chain native gaming thesis has not yet produced a blockbuster-scale game.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L4.5 — Grant and Funding Landscape
// TYPE A — Dominant concept: Foundation grants are evaluated on
// four specific criteria — specific product, team credibility,
// milestone outcomes (not activities), and honest risk assessment.
// Vague milestones fail; outcome-based milestones succeed.
// ─────────────────────────────────────────────────────────────

export const LAB4_LESSON_5 = {
  id: 'l4-5-grant-funding-landscape',
  title: 'Grant and Funding Landscape',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
In 2021, a Web3 protocol applied for a $500,000 grant from a major blockchain foundation. Their application read: "Milestone 1: We will build the smart contracts. Milestone 2: We will launch a beta. Milestone 3: We will achieve significant user adoption." The foundation rejected the application in three minutes. Not because the idea was bad — but because every milestone was an activity description, not a measurable outcome. "We will build" tells a reviewer nothing about whether the project succeeded.

Grant applications that win foundation funding share one characteristic: they describe outcomes that anyone can verify, with specific numbers attached to timelines. "500 unique wallets interact with our lending protocol within 60 days of deployment" is verifiable. "We will deploy a lending protocol" is not.

Understanding how ecosystem grants work — what the Foundation evaluates, what signals strength, and what signals weakness — is a practical skill that applies to your own grant writing (Lab 9) and to your ecosystem analysis of grant-funded projects.

THE STARKNET FOUNDATION FUNDING LANDSCAPE

The Starknet Foundation operates two grant programs, which you encountered in L1.5:

SEED Grants ($10,000–$150,000): for early-stage teams with an idea and evidence of ability. Typical uses: initial development, proof-of-concept, hackathon winners seeking development funding. Review cycle: faster, lighter evaluation. Outcome requirement: lower bar — prototype deliverables or initial user numbers.

Growth Grants (up to $1,000,000): for teams with demonstrated traction — shipped code, active users, evidence the product works. Review cycle: rigorous, multiple rounds. Outcome requirement: high bar — specific metrics, team track record, detailed milestone plans.

After one year of a $50M+ Foundation ecosystem fund, approximately $8–12M had been distributed across 20–30 projects. Average grant: $300,000–$400,000. Distribution pace: slower than the fund size might suggest — the Foundation prioritised rigour over speed, preferring fewer well-evaluated grants over many poorly-evaluated ones.

THE FOUR EVALUATION CRITERIA

CRITERION 1 — SPECIFIC PRODUCT (NOT "WE WILL BUILD X")

The Foundation evaluates whether the application describes a specific product in sufficient detail that a third party could verify its completion. The test: can a reviewer who has no prior knowledge of the team confirm whether Milestone 1 was achieved by reading on-chain data or testing the product?

Wrong: "Milestone 1: We will build a yield aggregator protocol."
Right: "Milestone 1 (Day 30): A Cairo smart contract deployed to Starknet Sepolia testnet. Measurable outcome: contract accepts USDC deposits and routes them to Vesu lending pool. Verifiable via Voyager contract interactions."

CRITERION 2 — TEAM CREDIBILITY

Prior shipped products: has the team built and deployed something real before? A team of three with no previous deployments requesting $500K is a much weaker application than a team with two deployed projects on other chains.

Relevant background: is the team's background related to what they are building? A team of Cairo developers applying for a developer tooling grant is credible. A team of marketers applying for the same grant needs stronger technical evidence.

The Foundation can look up: GitHub history, previous on-chain deployments, team members' public professional profiles. They do look.

CRITERION 3 — MILESTONE SPECIFICITY (OUTCOMES NOT ACTIVITIES)

Every milestone must be: measurable (a number), time-bounded (a date), and verifiable (on-chain or externally checkable).

Activity milestone (wrong): "Month 2: Complete backend development."
Outcome milestone (right): "Month 2 (Day 60): Backend capable of processing 100 concurrent transactions per second, verified by load test results provided to Foundation reviewer."

CRITERION 4 — HONEST RISK ASSESSMENT

A grant application that says "our main risk is market conditions" has failed this criterion. Every project has specific technical, team, and market risks. The Foundation wants to see: "Our most likely failure mode is [specific risk]. Our mitigation is [specific action]. If the mitigation fails, we will [specific contingency or decision point]."

Honest risk assessment signals that the team has genuinely thought through the project — not just marketed it. Applications that present only upside tell reviewers that the team does not know their own weak points.

RED FLAGS THAT CAUSE REJECTIONS

Vague milestones: "launch" is not a milestone. "1,000 unique users complete a DCA order within 60 days of launch" is.
No team track record: a team with zero prior deployments applying for $500K without exceptional compensating evidence.
Unrealistic user projections: "100,000 users in month 3" from a team with no existing user base or marketing plan.
Generic risk disclosure: "we might face regulatory risk" applied to a DeFi protocol. Every DeFi protocol faces regulatory risk — the question is: which specific regulatory risk and what is your specific response?
  `.trim(),

  keyTakeaway: `Foundation grants are evaluated on four criteria — specific product (verifiable what), team credibility (have they shipped before), milestone outcomes not activities (numbers and dates), and honest risk assessment (specific failure modes, not generic disclaimers) — and vague milestones are the most common reason for rejection.`,

  visualPrompt: `A four-criteria grant evaluation checklist. Criterion 1 "Specific Product": two examples side by side — red X on "We will build a yield aggregator" and green tick on "Contract accepts USDC deposits to Vesu by Day 30 (verifiable on Voyager)." Criterion 2 "Team Credibility": two boxes — "Prior shipped products" and "Relevant background." Each with a magnifying glass labelled "Foundation will check GitHub." Criterion 3 "Milestone Specificity": conversion diagram — activity statement (red) "Complete backend development" → outcome statement (green) "100 tx/sec at Day 60, verified by load test." Criterion 4 "Risk Assessment": wrong (red) "Market conditions" → right (green) "[Specific risk] mitigated by [specific action], contingency: [decision point]."`,
  visualType: 'static',
  visualUrl: 'foundation-grant-evaluation-four-criteria',

  examples: [
    {
      contextTag: '[Grant application passing all four criteria]',
      context: 'A team of two Cairo developers applies for a $120,000 SEED grant for a Starknet DCA (dollar-cost averaging) protocol.',
      scenario: 'Their application: Criterion 1 — specific product: "A Cairo smart contract enabling automated weekly STRK purchases using AVNU routing, deployed to Sepolia testnet." Criterion 2 — team: "Lead developer: 2 years Cairo experience, previously deployed snCash lending module. Co-founder: 5 years Solidity, contributed to 3 audited Ethereum DeFi protocols." Criterion 3 — milestones: "Day 30: Testnet deployment with 50 test orders executed. Day 60: Mainnet deployment with 200 unique users. Day 90: 500 users with $50,000 cumulative order volume." Criterion 4 — risk: "Primary risk: Starknet testnet instability during development. Mitigation: parallel development on local Starknet fork. Contingency: if testnet delays exceed 2 weeks, request 2-week extension from Foundation."',
      outcome: 'Application approved after one review cycle. The Foundation noted: "This is an example of a well-scoped SEED application — specific deliverables, verifiable milestones, credible team with relevant experience, and honest risk framing. Approved at $110,000 (slightly below request pending milestone 2 delivery, at which point the remaining tranche is released)."',
    },
    {
      contextTag: '[Grant application failing criterion 3]',
      context: 'A team of three applies for $400,000 to build a cross-protocol yield aggregator on Starknet.',
      scenario: 'Their milestones: "Month 1: Complete smart contract architecture design. Month 2: Deploy to testnet. Month 3: Launch mainnet beta. Month 4: Scale to significant TVL." The Foundation reviewer annotates: "Month 1 — activity, not verifiable. Month 2 — deploy what? What functionality? What\'s the test criteria? Month 3 — \'launch\' is not a milestone. Month 4 — \'significant TVL\' is unmeasurable. REJECT: milestone specificity fails on all four milestones."',
      outcome: 'Rejected. The team resubmits 3 weeks later with rewritten milestones — outcome-based, specific, with dollar amounts and user counts. The resubmission is approved at $350,000. The original idea was sound. The original application did not demonstrate that the team could execute against measurable objectives — which is the Foundation\'s actual evaluation concern.',
    },
    {
      contextTag: '[Package install simulator — developer empathy]',
      context: 'An ecosystem analyst goes through the starkzap-package-install simulator to understand what developers experience when onboarding to Starknet tooling.',
      scenario: 'She follows the guided walkthrough: run npm install starkzap-native, watch the dependency tree resolve (12 packages, 45 seconds), observe that one package has a deprecation warning requiring a version flag, and complete the install. The simulator shows her what a developer sees in the terminal — the actual commands and the actual output.',
      outcome: 'She notes in her ecosystem report: "The install process for Starkzap SDK is straightforward for developers familiar with npm. One deprecation warning during install (addressable with a --legacy-peer-deps flag) adds a small friction point for developers who are not familiar with npm dependency warnings. This specific friction point is addressable but requires documentation improvement — a developer unfamiliar with npm may interpret the warning as a failure." This is developer empathy built without writing code.',
    },
  ],

  guidedPractice: [
    {
      question: 'A grant application Milestone 2 reads: "Month 2: Complete backend development and prepare for launch." According to the Foundation\'s evaluation criteria, what is wrong with this milestone?',
      options: [
        'A. Nothing — "complete backend development" is a clear deliverable',
        'B. It is an activity description ("complete development"), not an outcome. There is no measurable number, no verification method, and no specific deliverable that a third party could confirm was achieved.',
        'C. The timeline of 2 months is too short',
        'D. "Prepare for launch" is too ambitious for a mid-point milestone',
      ],
      correct: 1,
      hint: 'Apply the three criteria for a valid milestone: measurable (a number), time-bounded (a date), and verifiable (on-chain or externally checkable). Which does this milestone fail?',
      explanation: 'B is correct. "Complete backend development" is an activity (something the team does) rather than an outcome (something that exists in a verifiable state). A Foundation reviewer cannot confirm whether "backend development is complete" without extensive technical review. A correct version: "Month 2 (Day 60): Backend processes 50 concurrent DCA orders per minute on Sepolia testnet, verified by load test report submitted to Foundation." This is measurable (50 orders/minute), time-bounded (Day 60), and verifiable (load test report).',
    },
    {
      question: 'A grant application\'s risk section states: "Our main risks are market volatility and regulatory uncertainty." Why would a Foundation reviewer flag this?',
      options: [
        'A. Market volatility and regulatory uncertainty are not real risks',
        'B. These are generic risks that apply to every DeFi protocol — the application has not identified any project-specific risks. A genuine risk assessment names the specific failure mode most likely for this particular project, with a specific mitigation.',
        'C. Foundation grants are only rejected for technical failures, not risk disclosure quality',
        'D. Risk disclosure is optional for SEED grants — only Growth grants require it',
      ],
      correct: 1,
      hint: 'What does a generic risk disclosure signal about whether the team has genuinely thought through their specific project?',
      explanation: 'B is correct. "Market volatility and regulatory uncertainty" are true of every DeFi protocol in existence. Listing them as risks without specifying how they apply to this particular project signals that the team copy-pasted a generic risk section. The Foundation wants to see: "Our most likely failure mode is [specific to our product — e.g., Pragma oracle latency affecting our real-time rebalancing] — mitigation: [specific action — e.g., implement a 60-second circuit breaker if oracle update is delayed]. This demonstrates genuine technical thinking about the project\'s actual risk profile.',
    },
    {
      question: 'The Foundation distributed $8M across 23 projects in 12 months from a $50M+ fund. Average grant: $348K. What does this distribution pace tell you about the Foundation\'s grant strategy?',
      options: [
        'A. The Foundation is underfunding the ecosystem — $8M from $50M is only 16%',
        'B. The Foundation prioritises rigour over speed — slow distribution at $348K average signals careful evaluation of each application rather than bulk distribution. This prevents grants going to under-qualified teams but may slow ecosystem development.',
        'C. The Foundation is hoarding money — only 16% distributed after 12 months is evidence of mismanagement',
        'D. Average grant of $348K is too large — the Foundation should give more, smaller grants',
      ],
      correct: 1,
      hint: 'Is slow distribution a problem or a strategy? What does careful evaluation of grant applications signal about the Foundation\'s priority?',
      explanation: 'B is correct. A foundation that distributes $50M in one year by accepting most applications is optimising for speed but risks funding weak teams that waste ecosystem capital. A foundation that distributes $8M after rigorous evaluation is optimising for quality over quantity. $348K average suggests a mix of SEED and Growth grants, with Growth grants pulling the average up. The slower pace is a strategy signal — the Foundation is willing to trade distribution speed for application quality. Whether this is the right trade-off is a valid debate, but it is a deliberate choice, not mismanagement.',
    },
    {
      question: 'A grant application reads: "Milestone 1: Deploy smart contracts to Sepolia." A reviewer rejects it for criterion 1. Why, and how should it be rewritten?',
      options: [
        'A. Deploying to Sepolia is a valid milestone — nothing needs to change',
        'B. "Deploy smart contracts" is an activity with no specified functionality or verification criteria. Rewrite: "Milestone 1 (Day 30): USDC deposit contract deployed to Sepolia testnet. Verifiable via Voyager: contract accepts test USDC deposits and emits Deposit events. 10 test deposits executed and confirmed by Foundation reviewer."',
        'C. The milestone fails because Sepolia testnet is not sufficient — mainnet is required',
        'D. The milestone is too large for a single milestone — it should be split into 5 sub-milestones',
      ],
      correct: 1,
      hint: 'What functionality should the deployed contracts have? What can the reviewer verify?',
      explanation: 'B is correct. "Deploy smart contracts" tells a reviewer nothing about what the contracts do, whether they work, or how they can be verified. A valid Milestone 1 specifies: what contract (USDC deposit contract), what network (Sepolia), what measurable outcome (accepts test deposits, emits events), and how to verify (Voyager link, Foundation reviewer test). The rewrite passes all three criteria: measurable (10 test deposits), time-bounded (Day 30), and verifiable (Voyager + reviewer confirmation).',
    },
    {
      question: 'A team with no prior blockchain deployments applies for a $450,000 Foundation Growth Grant. Their technical idea is innovative. Should the Foundation approve it?',
      options: [
        'A. Yes — innovative ideas should always be funded regardless of team track record',
        'B. No — Growth Grants are for teams with demonstrated traction. A team with no prior deployments applying for the largest grant tier signals either misunderstanding of the grant tier structure or overconfidence in unproven capability. The Foundation should direct them to the SEED grant tier with a smaller scope.',
        'C. Yes — the Foundation exists to support new teams and should take risks on innovation',
        'D. No — any team with no blockchain experience should be rejected from any grant program',
      ],
      correct: 1,
      hint: 'Match the application to the grant tier. What evidence does a Growth Grant specifically require?',
      explanation: 'B is correct. Growth Grants are specifically designed for teams with demonstrated traction — shipped code, active users, evidence the product concept works. A team with no prior deployments has not demonstrated traction by definition. The Foundation should either reject and suggest a SEED Grant application (smaller scope, lower bar, appropriate for early-stage teams) or request a proof-of-concept submission before advancing to Growth Grant consideration. Option A ignores the practical reality that funding unproven teams with $450K creates significant waste risk. Option D is too absolute — SEED Grants exist for early-stage teams.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-package-install',
      scenario: 'Open the Package Install simulator. Follow the guided walkthrough to install the Starknet toolchain: (1) run npm install starkzap-native and observe the dependency tree resolve, (2) note any warnings in the output and identify what they mean, (3) observe the install completion message. Record: (a) how many packages were installed as dependencies, (b) what the deprecation warning says and whether it blocks the install, (c) estimated time a developer unfamiliar with npm would spend resolving the warning. State one specific improvement to the install documentation that would eliminate the warning friction.',
      scoringCriteria: [
        'Correctly reads package count from the simulator output (approximately 12 packages)',
        'Correctly identifies the deprecation warning as non-blocking but potentially confusing for npm-inexperienced developers — it requires a --legacy-peer-deps flag or version pinning',
        'Provides a specific documentation improvement: add a "Known Warning" callout box to the quickstart immediately after the install command with the exact flag to use, eliminating the need for developers to search for the resolution independently',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A grant application says: "Milestone 1: We will deploy our smart contracts to Sepolia." Apply the activity-vs-outcome framework. Rewrite this milestone as a proper outcome-based milestone for a DCA (dollar-cost averaging) protocol that automatically buys STRK weekly using USDC. The milestone must be: measurable, time-bounded, and verifiable by the Foundation.',
      scoringCriteria: [
        'Correctly identifies the original milestone as activity-based (action the team takes) not outcome-based (state that can be verified)',
        'Rewritten milestone includes: specific contract (DCA Cairo contract), specific network (Starknet Sepolia), specific functionality (accepts USDC, executes weekly STRK purchase via AVNU), specific measurable outcome (e.g. 20 test DCA orders executed successfully), specific date (e.g. Day 30), and specific verification method (Voyager contract interactions viewable at [address] or Foundation reviewer test)',
        'Rewritten milestone could be verified by a third party with no prior knowledge of the project — the test: would someone reading this know exactly what to check to confirm it was achieved?',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'You are reviewing grant applications for the Foundation. Application X: strong technical idea (a Cairo-native yield aggregator), team of 2 with no prior blockchain deployments, all milestones are activity-based ("we will complete X"), risk section says "regulatory uncertainty", requesting $380,000 (Growth Grant tier). Write a two-sentence rejection note that is honest about the specific reasons but constructive about what they should do next.',
      scoringCriteria: [
        'Honestly identifies the specific rejection reasons: no prior deployment track record for a Growth Grant tier, all milestones are activity-based rather than outcome-based, risk section is generic rather than project-specific',
        'Constructively states the path forward: recommend they apply for a SEED Grant with a smaller, sharper scope (proof-of-concept deliverable, 60-day timeline, one specific measurable outcome) and rewrite milestones as verifiable outcomes before resubmitting',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 4 — AGGREGATE SIMS, BUILD TASK, BOSS
// ─────────────────────────────────────────────────────────────

export const LAB4_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: [
    'starkzap-ecosystem-read',
    'starkzap-package-install',
    'judgment-dataInterpret',
    'judgment-riskAssess',
    'judgment-communication',
  ],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  difficultyRange: 'lesson-sim-2-equivalent',
  description: 'Random draw from all 5 Lab 4 lessons. Tests Cairo maturity assessment, Scarb/Foundry evaluation, SDK friction/adoption/risk analysis, gaming DAU interpretation, and grant milestone quality. No lesson labels. No hints.',
};

export const LAB4_BUILD_TASK = {
  id: 'ecosystem-lab-4-build',
  title: 'Developer Ecosystem Research — Choose Your Focus',
  labProgressionNumber: 4,
  selectionMode: 'user-choice-2',
  type: 'research-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–90 minutes',

  availableTasks: [
    {
      id: 'build-4a-onboarding',
      title: 'Option A: Developer Onboarding Friction Analysis',
      estimatedMinutes: 75,
      description: `Document the step-by-step path from "I want to build on Starknet" to "I have a working Sepolia transaction." For each step: state what the developer must do, what tool they use, and what friction (if any) exists at this step. Compare to the equivalent step for Ethereum. Identify the three highest-friction points in the Starknet path and propose one specific improvement for each. Output: dev-onboarding-analysis.md`,
      scoringCriteria: [
        'All six pipeline steps covered with specific tool names and friction points identified',
        'Each friction point has a specific improvement proposal (not "improve documentation" but "add a Known Warning callout for the npm deprecation warning in the Scarb quickstart")',
        'Ethereum comparison is step-by-step — matching equivalent steps, not just overall impressions',
      ],
    },
    {
      id: 'build-4b-sdk-comparison',
      title: 'Option B: SDK Adoption Report',
      estimatedMinutes: 80,
      description: `Compare three Starknet developer tools: Starkzap SDK, Starknet.js, and OpenZeppelin Starknet Cairo contracts. For each: document quality, example availability, community support (GitHub stars, contributor count, issue resolution pace), and production adoption evidence. Conclude with: which tool is most appropriate for which use case, and which has the highest dependency risk. Output: sdk-comparison-report.md`,
      scoringCriteria: [
        'All three tools assessed across all four dimensions with specific data cited',
        'Use case recommendation is specific — not "it depends" but "Starkzap SDK for [specific use case], Starknet.js for [specific use case]"',
        'Dependency risk is quantified where possible — contributor counts, recent activity signals',
      ],
    },
  ],

  outputType: 'written-document',
  outputFormat: 'markdown',
  outputPath: '/junior/lab-04-developer-ecosystem/',
};

export const LAB4_BOSS = {
  phase1: {
    id: 'ecosystem-lab-4-boss-phase1',
    title: 'Lab 4 Boss — Phase 1: Developer Ecosystem Gauntlet',
    description: 'Unlimited attempts. Hints available. 8 tasks from pool of 20. Pass 80% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,
    taskPool: { totalTasks: 20, drawPerAttempt: 8, passMark: 0.80 },
  },

  phase2: {
    id: 'ecosystem-lab-4-boss-phase2',
    title: 'Lab 4 Boss — Phase 2: Developer Ecosystem Certification',
    description: 'No hints. Portfolio push on 100% pass. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are producing a developer ecosystem assessment for a Foundation grant committee reviewing applications for a $2M developer tooling initiative.

TASK 1 — Ecosystem Maturity Assessment
Score Cairo's ecosystem on all five maturity dimensions (active developers, documentation, libraries, tooling, job market) using a 1–5 scale where 5 = Solidity-equivalent maturity. For each dimension: state the score, cite one specific data point, and state one action that would most improve the score.

TASK 2 — Tooling Health Report
Assess Starknet Foundry and Scarb on the tooling health framework (GitHub stars, contributor count, issue resolution, version cadence). State: which tool has the healthiest adoption trajectory and why. State: which specific gap, if addressed, would most improve developer retention past the testing step.

TASK 3 — Grant Milestone Rewrite
The following grant milestone was submitted: "Month 3: Complete integration with Vesu and AVNU protocols." Rewrite this as a proper outcome-based milestone for a DCA protocol. Apply all three criteria: measurable, time-bounded, verifiable.
    `.trim(),

    scoringCriteria: [
      'Task 1: All five dimensions rated 1–5 with specific data cited. Active developers: 1–2 (3,000 vs 150,000). Documentation: 2 (good quality, limited volume). Libraries: 1–2 (47 vs 4,200+). Tooling: 2 (functional, narrower than Ethereum). Job market: 1–2 (narrow but growing). Each improvement action is specific to the dimension.',
      'Task 2: Starknet Foundry vs Scarb comparison uses adoption data. Starknet Foundry\'s Stack Overflow coverage gap correctly identified as the highest-impact fix for developer retention past the testing step (currently requires Discord/GitHub Issues debugging vs instant Stack Overflow answers on Ethereum).',
      'Task 3: Rewritten milestone includes: specific date (Day 90), specific measurable outcome (e.g. 100 DCA orders executed through AVNU routing with Vesu USDC supply as the funding source), specific verification method (Voyager transaction records, Foundation reviewer walkthrough). All three criteria met.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/junior/lab-04-developer-ecosystem/',
      files: [{ filename: 'developer-ecosystem-assessment.md', type: 'narrative' }],
      commitMessage: 'Passed Lab 4 Developer Ecosystem — Junior Ecosystem Deep Dive',
      badgeEarned: 'Developer Ecosystem Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const LAB4_META = {
  id: 'ecosystem-junior-lab-4',
  title: 'Developer Ecosystem and Tooling',
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'junior' as const,
  labNumber: 4,
  estimatedHours: 5,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Labs 1–3 complete',
  description: 'Cairo ecosystem maturity across five dimensions, Scarb and Starknet Foundry tooling health, Starkzap SDK friction/adoption/risk, Dojo gaming ecosystem, and Foundation grant evaluation criteria.',
  nextLab: 'Lab 5 — Starknet\'s ZK Vision and Roadmap',
};
