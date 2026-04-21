// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 4 — LENDING AND BORROWING · LESSONS 1–4
// Written to sim_instructions_v3 + Lab 11 standard
// Portfolio push: Lab 4 Phase 2 Boss

export const LAB4_LESSONS_1_TO_4 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — How Lending Protocols Work
// ─────────────────────────────────────────────────────────────
{
  id: 'how-lending-protocols-work',
  title: 'How Lending Protocols Work',
  explanation: `
In 2023, a small business owner in Lagos needed $50,000 to expand operations. She had $200,000 in assets — a house and a car — but no relationship with a bank willing to lend against them quickly. The loan process took four months and ultimately failed due to documentation requirements. DeFi lending on Starknet would have taken her twelve seconds.

A lending protocol is an autonomous code-based bank. It holds a pool of deposited tokens, lends them to borrowers who post collateral, charges borrowers interest, and distributes most of that interest to depositors. No human approves loans. No creditworthiness check. No waiting period. If you have collateral, you can borrow.

A pool has $10,000,000 deposited and $7,200,000 of that is currently borrowed. That 72% ratio — what fraction of deposited capital is actively lent out — is the utilisation rate. A pool with $10,000,000 deposited and $7,200,000 borrowed has 72% utilisation. Utilisation drives everything: it determines both the supply APY (what depositors earn) and the borrow APY (what borrowers pay).

At 30% utilisation, the protocol drops borrow rates — it is trying to attract borrowers to put idle capital to work. At 90% utilisation, rates spike sharply — the protocol is now trying to bring in new depositors and push existing borrowers to repay. This graduated response, slow-rising until a target level and then steep, is called the kink model. The target threshold — typically 80% — is the kink. This steep rise above the kink is what can cause borrow APY to spike from 8% to 35% or more during high-demand periods.

Vesu is Starknet's leading lending protocol. The supply APY and borrow APY you see on Vesu's dashboard are not fixed — they change continuously as utilisation fluctuates. Of every dollar of interest borrowers pay, a defined share goes to the protocol treasury before the rest reaches depositors. That share is the reserve factor — typically 10–20%.

Understanding utilisation is the single most important concept for a DeFi lender: when utilisation is very high, you may not be able to withdraw your deposits immediately, because most of your capital is currently borrowed.
  `.trim(),
  visualPrompt: 'Lending pool diagram: depositors flowing USDC into a pool on the left, borrowers taking USDC from the pool on the right with collateral flowing in. Utilisation bar in centre showing 72% borrowed. Below: interest rate curve showing slow rise to 80% kink then steep spike.',
  visualType: 'static',
  visualUrl: 'lending-pool-utilisation-model',
  examples: [
    {
      contextTag: '[Kink model in action, rates spike at high utilisation]',
      context: 'Vesu\'s USDC pool has a kink at 85% utilisation. Below 85%, borrow APY rises from 3% to 9%. Above 85%, borrow APY spikes to 35%+.',
      scenario: 'A large protocol moves $20,000,000 of USDC into Vesu for yield. Utilisation was 78% (borrow APY 8%). After the deposit, utilisation drops to 41% — there is now much more supply relative to demand.',
      outcome: 'Borrow APY falls to 4.2% because the new supply makes capital cheaper for borrowers. Supply APY falls from 6.1% to 3.1% because the same interest income from borrowers is now shared across a larger deposit base. The depositor who moved in $20M is now earning 3.1%, not 6.1%. Large deposits move rates — a useful property to understand before deploying significant capital.',
    },
    {
      contextTag: '[High utilisation, withdrawal blocked]',
      context: 'Elena deposited $30,000 USDC into a Vesu pool three months ago at 6% APY. She needs her funds urgently. Pool utilisation is currently 96%.',
      scenario: 'Elena calls withdrawMax() on Vesu. The pool has $5,000,000 total deposits and $4,800,000 borrowed (96% utilisation). Only $200,000 is currently available.',
      outcome: 'Elena can withdraw her proportional share of the available $200,000 — approximately $1,200 (her 0.6% share of the pool). The remaining $28,800 is locked until borrowers repay. Vesu\'s high borrow APY at 96% utilisation (approximately 28%) incentivises borrower repayment and new depositor entry, which will eventually free her capital. This is liquidity risk in action — DeFi lending is not a savings account with instant access.',
    },
    {
      contextTag: '[Reserve factor, who captures the spread]',
      context: 'A Vesu USDC pool has $8,000,000 deposited, $6,400,000 borrowed (80% utilisation), borrow APY 7.5%, reserve factor 15%.',
      scenario: 'An analyst calculates how interest is distributed between depositors and the protocol treasury.',
      outcome: 'Annual interest from borrowers: $6,400,000 × 7.5% = $480,000. Reserve factor: $480,000 × 15% = $72,000 to treasury. Remaining: $408,000 to depositors. Depositor APY: $408,000 / $8,000,000 = 5.1%. The protocol earns $72,000 per year from this pool through the reserve factor — this is Vesu\'s protocol revenue. Understanding the reserve factor explains why borrow APY is always higher than supply APY on the same asset.',
    },
  ],
  keyTakeaway: 'When most of a pool's deposits are currently borrowed, you may not be able to withdraw your funds immediately — this is the direct consequence of the high utilisation that also earns you a higher yield.',
  guidedPractice: [
    {
      question: 'A USDC pool has $5,000,000 deposited and $3,500,000 borrowed. What is the utilisation rate?',
      options: [
        'A. 30% — the amount not borrowed divided by total deposits',
        'B. 70% — the amount borrowed divided by total deposits',
        'C. 143% — the amount borrowed divided by the amount not borrowed',
        'D. 50% — the midpoint of borrowed and deposited',
      ],
      correct: 1,
      hint: 'Utilisation = amount currently borrowed / total amount deposited.',
      explanation: 'B is correct. Utilisation = $3,500,000 / $5,000,000 = 70%. This tells you 70% of all deposited USDC is currently lent to borrowers. The remaining 30% ($1,500,000) is available for immediate withdrawal.',
    },
    {
      question: 'Utilisation is at 92%, above the kink at 80%. What happens to borrow APY?',
      options: [
        'A. Borrow APY falls — high utilisation means more borrowers sharing costs',
        'B. Borrow APY spikes — the kink model deliberately raises rates steeply above 80% to attract new deposits and deter new borrowing',
        'C. Borrow APY stays the same — the kink only affects supply APY',
        'D. Borrow APY becomes zero — the protocol pauses borrowing above the kink',
      ],
      correct: 1,
      hint: 'The kink model\'s purpose is to create an incentive to restore utilisation to a healthy level. High rates do this how?',
      explanation: 'B is correct. The kink model deliberately spikes borrow rates above the target utilisation threshold. High borrow rates simultaneously: (1) discourage new borrowers from entering, (2) incentivise existing borrowers to repay early, and (3) attract new depositors seeking the higher supply APY that comes with high utilisation. All three effects push utilisation back below the kink.',
    },
    {
      question: 'Borrow APY is 8.5%. Reserve factor is 12%. Utilisation is 75%. What is the supply APY approximately?',
      options: [
        'A. 8.5% — supply APY equals borrow APY',
        'B. 5.61% — (8.5% × 75% utilisation × 88% after reserve factor)',
        'C. 7.48% — 8.5% minus the 12% reserve factor',
        'D. 10.2% — the protocol adds the reserve factor to supply APY',
      ],
      correct: 1,
      hint: 'Supply APY = borrow APY × utilisation rate × (1 - reserve factor). Only the borrowed portion generates interest.',
      explanation: 'B is correct. Only 75% of deposits are earning interest (the borrowed portion). Of the 8.5% borrow APY on that 75%, the protocol takes 12%. Supply APY = 8.5% × 0.75 × 0.88 = 5.61%. This formula explains why supply APY is always lower than borrow APY — two factors reduce it: utilisation (not all deposits are earning) and reserve factor (protocol takes a cut).',
    },
    {
      question: 'You deposit $40,000 USDC into a pool with 94% utilisation. You need the funds back in 48 hours. What risk are you taking?',
      options: [
        'A. No risk — Vesu guarantees instant withdrawal of any deposit amount',
        'B. Liquidity risk — at 94% utilisation, only 6% of deposits ($2,400 if pool is $40,000) are immediately available. Your $40,000 may not all be withdrawable within 48 hours.',
        'C. Interest rate risk — utilisation may change your APY',
        'D. Counterparty risk — the borrowers may default before you withdraw',
      ],
      correct: 1,
      hint: 'At 94% utilisation, what percentage of the pool is available for withdrawal right now?',
      explanation: 'B is correct. At 94% utilisation, only 6% of the total pool is not currently borrowed and therefore available for withdrawal. If the pool has $40,000 and you deposited 100% of it (unrealistic but for illustration), only $2,400 is immediately available. In reality, your proportional share of the available 6% may be far less than your deposit. Never deposit funds with a 48-hour liquidity requirement into a high-utilisation pool.',
    },
    {
      question: 'Why is borrow APY always higher than supply APY on the same asset in the same pool?',
      options: [
        'A. Borrow APY includes a risk premium charged to borrowers',
        'B. Two factors reduce supply APY below borrow APY: only the utilised portion earns interest (not all deposits), and the reserve factor removes a percentage before distributing to depositors',
        'C. The protocol subsidises depositors separately, making supply APY lower',
        'D. Borrowers pay APY on their collateral as well as their loan, doubling their effective cost',
      ],
      correct: 1,
      hint: 'Supply APY = borrow APY × utilisation × (1 - reserve factor). What does each factor do to reduce the rate?',
      explanation: 'B is correct. Two mechanisms ensure supply APY < borrow APY. First, if utilisation is 75%, only 75% of deposits are actually earning interest — the formula already reduces supply APY by the utilisation factor. Second, the reserve factor (say 15%) takes another cut before distribution. Together: a 10% borrow APY at 75% utilisation with 15% reserve factor becomes 10% × 0.75 × 0.85 = 6.375% supply APY.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Vesu USDC pool data: Total deposits $12,000,000. Total borrowed $9,840,000. Borrow APY 8.2%. Reserve factor 14%. Calculate: (1) utilisation rate, (2) annual interest income from borrowers, (3) annual protocol revenue, (4) annual income to depositors, (5) supply APY.',
      scoringCriteria: [
        'Utilisation: $9,840,000 / $12,000,000 = 82%',
        'Annual borrower interest: $9,840,000 × 8.2% = $807,480',
        'Protocol revenue: $807,480 × 14% = $113,047',
        'Depositor income: $807,480 - $113,047 = $694,433',
        'Supply APY: $694,433 / $12,000,000 = 5.79%',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You have $80,000 USDC. You want to lend $60,000 to Vesu for yield and keep $20,000 liquid. Pool A: 5.8% supply APY, 71% utilisation, $45M TVL, 18 months old, audited. Pool B: 7.4% supply APY, 89% utilisation, $8M TVL, 4 months old, audited. Assess the liquidity risk of each pool, calculate annual yield difference, and recommend an allocation.',
      scoringCriteria: [
        'Pool A: 71% utilisation means 29% available = $13.05M immediately withdrawable. Low liquidity risk.',
        'Pool B: 89% utilisation means 11% available = $880,000 immediately withdrawable. At $8M TVL, a large withdrawal event could block you.',
        'Annual yield difference: $60,000 × (7.4% - 5.8%) = $960/year extra from Pool B',
        'Recommendation: split or weight toward Pool A — $960/year does not compensate for liquidity risk at 89% utilisation. Consider Pool A for primary deposit, Pool B for smaller allocation if yield is important.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain how a DeFi lending protocol earns revenue without a human bank manager, loan officer, or credit department — in 4 sentences, using only concepts a small business owner who uses a bank would understand.',
      scoringCriteria: [
        'Correctly explains the deposit-borrow pool model in plain terms',
        'Explains that rates are set automatically by supply and demand, not by a person',
        'Explains the reserve factor as the protocol\'s fee — analogous to a bank\'s net interest margin',
        'Zero unexplained technical jargon throughout',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Supplying Assets and Earning Yield
// ─────────────────────────────────────────────────────────────
{
  id: 'supplying-assets-earning-yield',
  title: 'Supplying Assets: Earning Yield as a Lender',
  explanation: `
The safest DeFi yield available on Starknet is supplying USDC to a lending protocol. You start with dollars, you end with more dollars, and the risk profile is closer to a high-yield savings account than to most DeFi strategies — provided you understand the specific risks involved.

When you call wallet.lending().deposit({ token: USDC, amount: "10000" }), your USDC enters the Vesu pool. In return, the protocol issues you shares — an internal accounting mechanism representing your proportional claim on the pool. As interest accrues from borrowers, the total pool value grows, and your shares are worth more USDC over time. This share-based accounting means your yield compounds automatically — you do not need to claim and re-deposit interest.

Which assets to supply depends on three factors. Yield rate (the current supply APY), utilisation risk (can you withdraw when you want to?), and price risk (does the asset you supply fluctuate in value?).

USDC is the conservative choice: dollar-stable, high liquidity demand from borrowers, predictable yield. The primary risk is smart contract risk — the USDC is in Vesu's contract, not your wallet — and liquidity risk at very high utilisation.

Supplying volatile assets like ETH or STRK adds price exposure. If you supply 10 ETH and ETH falls 30%, you receive 10 ETH back (or USDC equivalent of fewer dollars). The supply yield (say 3.2% APY) does not compensate for a 30% price drop. Supplying volatile assets is most appropriate when you would hold the asset anyway — the yield is incremental income on your existing position, not a reason to hold the asset.

WithdrawMax() is the function that returns as much as possible given current pool liquidity. In normal conditions it returns your full balance. In high-utilisation conditions it returns only your share of available funds. Always check utilisation before a time-sensitive withdrawal.
  `.trim(),
  visualPrompt: 'Supply flow: USDC enters pool → shares issued → interest accrues → shares worth more USDC → withdraw more USDC than deposited. Side panel: asset comparison table (USDC vs ETH vs STRK) showing yield, liquidity, and price risk for each.',
  visualType: 'static',
  visualUrl: 'lending-supply-flow',
  examples: [
    {
      contextTag: '[Share-based accounting, automatic compounding]',
      context: 'A depositor puts $20,000 USDC into Vesu when 1 share = $1.00. He receives 20,000 shares. Over 8 months, interest accrues and 1 share is now worth $1.038.',
      scenario: 'Carlos calls getPosition() and checks his balance. He calculates his current position value.',
      outcome: '20,000 shares × $1.038 = $20,760 USDC. He earned $760 in 8 months without doing anything — the share mechanism compounded his yield automatically. Carlos did not need to claim and re-deposit interest; the shares appreciated in value as the pool grew. When he calls withdraw(), the protocol redeems his 20,000 shares at the current $1.038 rate.',
    },
    {
      contextTag: '[Volatile asset supply, incremental yield on a held position]',
      context: 'Maya holds 5 ETH and has no intention of selling in the next 12 months. She discovers Vesu offers 2.8% supply APY on ETH deposits.',
      scenario: 'Maya deposits her 5 ETH into Vesu. ETH price stays approximately flat over 12 months. She withdraws at the end of the year.',
      outcome: 'Maya receives 5.14 ETH (5 + 5 × 2.8%). She earned 0.14 ETH in yield — approximately $448 at $3,200/ETH — on assets she was holding regardless. The 2.8% yield is pure incremental income on her existing position. Had ETH fallen 30%, she would have 5.14 ETH worth $11,424 vs $11,200 if she had simply held — the yield provided a $224 buffer against the price decline, far short of full compensation.',
    },
    {
      contextTag: '[Withdrawal blocked by high utilisation]',
      context: 'A DeFi user deposited $50,000 USDC into a Vesu pool that has since grown to $3,000,000 total deposits with 93% utilisation.',
      scenario: 'The user calls withdrawMax() expecting $50,000 back. Their proportional share of the pool is 1.67%. Available funds: $3,000,000 × 7% = $210,000. Their share of available funds: $210,000 × 1.67% = $3,507.',
      outcome: 'They can only withdraw $3,507 immediately. The remaining $46,493+ is locked until borrowers repay. The pool\'s high borrow APY (approximately 25% at 93% utilisation) will incentivise repayments, gradually freeing liquidity. The user did not lose money — the USDC is safe in the protocol, earning yield — but they cannot access it when needed. This is why checking utilisation before depositing with a time horizon is essential.',
    },
  ],
  keyTakeaway: 'Share-based accounting in lending protocols compounds your yield automatically — you do not receive interest payments, your shares simply become worth more USDC as borrowers pay interest into the pool.',
  guidedPractice: [
    {
      question: 'You deposit $15,000 USDC and receive 15,000 shares at $1.00 per share. 6 months later, 1 share = $1.028. What is your position worth?',
      options: [
        'A. $15,000 — your principal is unchanged',
        'B. $15,420 — 15,000 shares × $1.028',
        'C. $15,028 — original $15,000 plus $28 interest',
        'D. $15,000 plus separately claimed interest that you must manually compound',
      ],
      correct: 1,
      hint: 'Shares appreciate as interest accrues. Your balance = shares × current share price.',
      explanation: 'B is correct. 15,000 × $1.028 = $15,420. You earned $420 automatically through share appreciation — no claiming, no manual compounding required. The share mechanism means your yield compounds as long as you stay in the pool. Option D describes the old non-share-based model that required manual reinvestment.',
    },
    {
      question: 'You supply 3 ETH to Vesu at 3.1% supply APY. ETH falls 25% over the next year. What is your net financial result?',
      options: [
        'A. You earned 3.1% APY so you are up slightly overall',
        'B. Net negative — you earn 0.093 ETH in yield (3.1%) but the ETH price decline (-25%) far outweighs the yield',
        'C. Neutral — the yield exactly offsets the price decline',
        'D. You keep 3 ETH regardless of price — lending does not expose you to price changes',
      ],
      correct: 1,
      hint: 'Calculate the yield in dollar terms and the price loss in dollar terms separately, then compare.',
      explanation: 'B is correct. Say ETH = $3,000 at deposit. Dollar value deposited: $9,000. After 1 year: 3.093 ETH × $2,250 (25% lower) = $6,959. Net loss: $9,000 - $6,959 = $2,041. The 0.093 ETH yield is worth $209 at the new price — far less than the $2,250 price loss. Supplying volatile assets does not protect against price declines — it adds a small yield cushion that does not cover major price moves.',
    },
    {
      question: 'At what supply APY does supplying USDC to Vesu have no price risk?',
      options: [
        'A. Never — DeFi lending always has price risk',
        'B. Always — USDC is a dollar-stable stablecoin, so the principal value does not change due to asset price movements',
        'C. Only at 0% APY — any yield adds complexity and therefore price risk',
        'D. At APYs above 10% — lower yields do not provide enough buffer',
      ],
      correct: 1,
      hint: 'What is USDC designed to do? What happens to the dollar value of $1 USDC over time in normal conditions?',
      explanation: 'B is correct. USDC is a dollar-pegged stablecoin — in normal market conditions, $10,000 USDC deposited returns approximately $10,000+ USDC (the plus being interest earned). There is no asset price risk because USDC does not fluctuate relative to dollars. The risks that remain are: smart contract risk (Vesu is hacked), stablecoin depeg risk (USDC loses its $1 peg), and liquidity risk (cannot withdraw at high utilisation).',
    },
    {
      question: 'Pool utilisation is 91%. You have $25,000 deposited in the pool, which has $2,000,000 total deposits. How much can you withdraw immediately?',
      options: [
        'A. $25,000 — your full deposit is always available',
        'B. $1,125 — your 1.25% share of the $90,000 immediately available ($2,000,000 × 9%)',
        'C. $2,250 — your share of the $180,000 available ($2,000,000 × 9% × 2)',
        'D. $0 — above 90% utilisation all withdrawals are blocked',
      ],
      correct: 1,
      hint: 'Available funds = total deposits × (1 - utilisation). Your share = your deposit / total deposits.',
      explanation: 'B is correct. Available funds: $2,000,000 × 9% = $180,000. Your share of the pool: $25,000 / $2,000,000 = 1.25%. Your available withdrawal: $180,000 × 1.25% = $2,250. Option D is wrong — withdrawals are not blocked, just limited by available liquidity.',
    },
    {
      question: 'Why does share-based accounting automatically compound your lending yield?',
      options: [
        'A. The protocol automatically re-deposits your interest every 24 hours',
        'B. As interest accrues to the pool, each share becomes worth more USDC — your fixed number of shares continuously grows in value without any action required',
        'C. The protocol issues you new shares proportional to earned interest',
        'D. Compounding only occurs if you call a special compound() function',
      ],
      correct: 1,
      hint: 'You hold a fixed number of shares. The pool value grows as interest accrues. What happens to the value of each share?',
      explanation: 'B is correct. You hold a fixed number of shares (say 15,000). As borrowers pay interest into the pool, the total pool value grows. The same 15,000 shares are now worth more USDC each — the appreciation is continuous and automatic. You do not receive new shares or need to trigger any transaction. When you withdraw, you redeem your shares at their appreciated value.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You deposited $30,000 USDC 9 months ago and received 30,000 shares at $1.00. Current share price: $1.041. Pool utilisation: 68%. You need $30,000 by end of next month. Calculate: (1) current position value, (2) yield earned in dollars and percentage, (3) whether you can withdraw $30,000 immediately given current utilisation, (4) your annualised APY based on actual returns.',
      scoringCriteria: [
        'Current value: 30,000 × $1.041 = $31,230',
        'Yield earned: $1,230 in 9 months, or 4.1% over 9 months',
        'Available for withdrawal: at 68% utilisation, 32% available. If pool is proportional, easily withdrawable.',
        'Annualised APY: 4.1% / 9 × 12 = 5.47% annualised',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Your colleague argues: "I should put my $50,000 emergency fund into Vesu at 5.5% APY instead of a savings account at 4.2%. It\'s basically the same thing but better yield." List the three specific ways DeFi lending differs from a traditional savings account in terms of risk, and state whether the 1.3% extra yield justifies each risk.',
      scoringCriteria: [
        'Risk 1: Smart contract risk — Vesu could be hacked. Traditional savings are FDIC/government insured. Emergency funds should not carry this risk.',
        'Risk 2: Liquidity risk — at high utilisation, withdrawal may be delayed. Emergency funds require instant access by definition.',
        'Risk 3: Stablecoin depeg risk — USDC could theoretically depeg. Traditional savings accounts hold native dollars.',
        'Conclusion: 1.3% extra yield ($650/year on $50,000) does not justify these risks for an emergency fund. DeFi lending is appropriate for non-emergency capital.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain share-based lending yield to someone who understands mutual funds. 3 sentences. Draw the parallel explicitly.',
      scoringCriteria: [
        'Correctly parallels shares in a lending pool to units/shares in a mutual fund',
        'Correctly explains that as the pool earns interest, each share appreciates — exactly like a bond mutual fund NAV increasing as it collects coupon payments',
        'Correctly notes the automatic compounding: holding shares means continuously benefiting from accumulated interest without action',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Collateral Mechanics and Health Factor
// ─────────────────────────────────────────────────────────────
{
  id: 'collateral-health-factor',
  title: 'Collateral Mechanics and the Health Factor',
  explanation: `
In traditional mortgage lending, a bank will lend you up to 80% of a property's value. If you default, they sell the property to recover their loan. They deliberately lend less than the full value — the 20% buffer protects them from price declines between default and sale. DeFi lending uses the same logic, enforced by code rather than a loan officer.

You deposit $6,000 of ETH into Vesu's smart contract as security. That ETH sits there — only you can withdraw it, and only if you repay what you owe. But if ETH price drops far enough, the protocol sells that ETH automatically to recover the loan. The locked ETH is your collateral.

How much you can borrow relative to what you lock up is the loan-to-value ratio, or LTV. An 80% LTV on $6,000 of collateral lets you borrow up to $4,800. An 80% LTV means you can borrow $800 worth of USDC against $1,000 worth of ETH collateral. You never borrow at the maximum — you leave a buffer.

The maximum borrow LTV and the liquidation threshold are different numbers. You can borrow up to 80% — but liquidation does not trigger until the effective LTV reaches 85%, giving a narrow buffer between the maximum borrow and forced selling. If the max LTV is 80% and the liquidation threshold is 85%, you have a small buffer between "you borrowed at maximum" and "liquidation occurs."

Your collateral is $6,000. Your debt is $3,000. The liquidation threshold is 83%. Multiply $6,000 × 0.83 = $4,980. Divide by $3,000. The result — 1.66 — is your health factor. Above 1.0 means safe. Below 1.0 means code will immediately sell your collateral to repay the debt. No phone call. No notice. The transaction executes in the same block the threshold is crossed.

The safe operating range is a health factor of 1.5 or higher. A health factor of 1.1 is dangerously close to liquidation — a 9% price drop in your collateral would trigger it. At 1.5, you need a 33% collateral price drop before liquidation. A simple rule: never borrow above 60% of your maximum borrowing power on volatile collateral.

wallet.lending().getHealth({ collateralToken: ETH, debtToken: USDC }) returns your current health factor as a real number. Monitor this regularly when you have an active borrow position.
  `.trim(),
  visualPrompt: 'Health factor dial from 0 to 3+: red zone below 1.0 (liquidation), amber 1.0–1.4 (danger), yellow 1.4–1.7 (caution), green 1.7+ (safe). Below: LTV bar showing: collateral value, max borrow LTV line, liquidation threshold line, and current debt level. Arrow showing how collateral price decline moves the debt closer to the threshold.',
  visualType: 'static',
  visualUrl: 'health-factor-diagram',
  examples: [
    {
      contextTag: '[Health factor calculation, safe position]',
      context: 'A borrower deposits 2 ETH ($6,000 at $3,000/ETH) as collateral on Vesu. Max LTV is 80%. Liquidation threshold is 85%. He borrows $3,000 USDC (50% LTV).',
      scenario: 'Sam calculates his health factor.',
      outcome: 'Health factor = (collateral value × liquidation threshold) / debt = ($6,000 × 0.85) / $3,000 = $5,100 / $3,000 = 1.70. Sam is safely above 1.5. To trigger liquidation, ETH would need to fall to: debt / (liquidation threshold) = $3,000 / 0.85 = $3,529 collateral value needed = $1,765/ETH. ETH is at $3,000 — he has a $1,235/ETH (41%) buffer before liquidation.',
    },
    {
      contextTag: '[Liquidation trigger, ETH price decline]',
      context: 'A borrower deposited 1 ETH ($3,200) and borrowed $2,400 USDC (75% LTV, close to the 80% maximum). Liquidation threshold is 83%. Health factor at deposit: ($3,200 × 0.83) / $2,400 = 1.11.',
      scenario: 'Over three days, ETH falls from $3,200 to $2,600 due to market conditions. The health factor recalculates automatically.',
      outcome: 'New health factor: ($2,600 × 0.83) / $2,400 = $2,158 / $2,400 = 0.899. Below 1.0 — liquidation triggers. A liquidator calls the Vesu liquidation function, repays Sarah\'s $2,400 USDC debt, and receives Sarah\'s 1 ETH collateral plus a liquidation bonus (typically 5–10%). Sarah loses her entire 1 ETH collateral and her $2,400 debt is cleared — net result: she loses the collateral and the debt is gone, but any equity above the debt is returned minus the penalty.',
    },
    {
      contextTag: '[Health factor management, adding collateral]',
      context: 'A borrower has 3 ETH ($9,000) as collateral and $5,000 USDC borrowed. ETH drops from $3,000 to $2,400. Health factor falls from a safe 1.53 to a dangerous 1.22.',
      scenario: 'The borrower wants to restore their health factor to above 1.5 without repaying their loan. They add more ETH as collateral.',
      outcome: 'Required collateral value for health factor 1.5: target = debt × 1.5 / liquidation threshold = $5,000 × 1.5 / 0.85 = $8,824. Current collateral: 3 ETH × $2,400 = $7,200. Gap: $1,624. They need to add $1,624 / $2,400 = 0.677 ETH to restore the health factor above 1.5. They deposit 0.7 ETH. New health factor: ($7,200 + $1,680) × 0.85 / $5,000 = $7,548 / $5,000 = 1.51.',
    },
  ],
  keyTakeaway: 'Your health factor can drop from safe to zero in a single day of volatile markets — and when it crosses below 1.0, a liquidation bot executes within seconds with no notice, no grace period, and no appeals process.',
  guidedPractice: [
    {
      question: 'You deposit $10,000 of ETH as collateral. Liquidation threshold is 82%. You borrow $5,000 USDC. What is your health factor?',
      options: [
        'A. 2.0 — $10,000 / $5,000',
        'B. 1.64 — ($10,000 × 0.82) / $5,000',
        'C. 0.61 — $5,000 / ($10,000 × 0.82)',
        'D. 1.0 — you are exactly at the liquidation threshold',
      ],
      correct: 1,
      hint: 'Health factor = (collateral × liquidation threshold) / debt.',
      explanation: 'B is correct. ($10,000 × 0.82) / $5,000 = $8,200 / $5,000 = 1.64. This is in the acceptable range (above 1.5 but below the ideal 1.7+). A 19% drop in ETH price would bring this to the liquidation threshold.',
    },
    {
      question: 'Your health factor is 1.08. ETH is $3,000. Your debt is $4,000 USDC. What is the approximate price of ETH at which liquidation triggers (assuming 83% liquidation threshold)?',
      options: [
        'A. ETH would need to reach $0 — health factor 1.08 is safe',
        'B. Approximately $2,887 — about 3.8% below current price',
        'C. Approximately $1,600 — 47% below current price',
        'D. Approximately $2,500 — 17% below current price',
      ],
      correct: 1,
      hint: 'Liquidation occurs when health factor = 1.0. Work backwards: debt / liquidation threshold = required collateral value. Divide by ETH quantity to find price.',
      explanation: 'B is correct. For health factor = 1.0: collateral value = debt / liquidation threshold = $4,000 / 0.83 = $4,819. Current collateral value at 1.08 health factor: $4,000 × 1.08 / 0.83 = $5,205. ETH quantity: $5,205 / $3,000 = 1.735 ETH. Liquidation price: $4,819 / 1.735 = $2,777. A health factor of 1.08 is dangerously close — only about 7% below current price.',
    },
    {
      question: 'Your health factor falls to 0.94. You call wallet.lending().getHealth() and confirm. What should you do immediately?',
      options: [
        'A. Wait and monitor — 0.94 is slightly below 1.0 but liquidation takes 24 hours to process',
        'B. Immediately repay some debt or add more collateral — 0.94 means liquidation can occur at any moment. The protocol does not wait.',
        'C. Close your entire position — partial actions are not possible once below 1.0',
        'D. Contact Vesu support to request a temporary hold on liquidation',
      ],
      correct: 1,
      hint: 'Health factor below 1.0 means liquidation is already enabled — any liquidator can trigger it right now.',
      explanation: 'B is correct. A health factor below 1.0 means the position is immediately liquidatable. Any participant (a liquidation bot, a human, an automated script) can call the liquidation function and collect a bonus for doing so. There is no 24-hour grace period. You must repay debt or add collateral immediately — every block that passes at 0.94 is a block where a bot could liquidate you.',
    },
    {
      question: 'Why should you never borrow at the maximum LTV on volatile collateral?',
      options: [
        'A. The protocol charges higher fees at maximum LTV',
        'B. Maximum LTV leaves zero buffer — a small price drop instantly pushes your health factor below the liquidation threshold, and volatile assets can move faster than you can respond',
        'C. Maximum LTV is reserved for institutional borrowers only',
        'D. The protocol automatically reduces your borrow limit if you reach maximum LTV',
      ],
      correct: 1,
      hint: 'If max LTV is 80% and liquidation threshold is 85%, what price drop triggers liquidation when borrowed at exactly 80%?',
      explanation: 'B is correct. If you borrow at exactly the maximum LTV (e.g., $800 against $1,000 ETH), your health factor is (1,000 × 0.85) / 800 = 1.0625 — already dangerously close to liquidation. A 6% drop in ETH price triggers liquidation. Volatile assets like ETH can move 6% in minutes. The 60% rule (borrow 60% of maximum) gives you a meaningful buffer against normal volatility.',
    },
    {
      question: 'You borrowed $6,000 USDC against 4 ETH ($12,000 at $3,000/ETH), liquidation threshold 83%. Health factor is 1.66. ETH falls to $2,100. Calculate the new health factor. Is liquidation triggered?',
      options: [
        'A. New health factor: 1.16. Not yet liquidated — above 1.0.',
        'B. New health factor: ($8,400 × 0.83) / $6,000 = 1.162. Not yet liquidated but dangerously close.',
        'C. New health factor: 0.91. Liquidation triggered.',
        'D. New health factor: 1.66 — health factor does not change with price.',
      ],
      correct: 1,
      hint: 'Recalculate with new ETH price: new collateral value = 4 × $2,100. Apply the formula.',
      explanation: 'B is correct. New collateral: 4 × $2,100 = $8,400. New health factor: ($8,400 × 0.83) / $6,000 = $6,972 / $6,000 = 1.162. Not yet liquidated (above 1.0) but critically close. A further 14% ETH decline from $2,100 to $1,806 would trigger liquidation. Immediate action is required — add collateral or repay debt.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Position: 5 STRK ($4,000 at $0.80) as collateral. Borrowed: $1,600 USDC (40% LTV). Liquidation threshold: 80%. Calculate: (1) current health factor, (2) STRK price at which liquidation triggers, (3) what percentage drop from current price that represents, (4) whether this position is safe given STRK\'s typical daily volatility of 5–8%.',
      scoringCriteria: [
        'Health factor: ($4,000 × 0.80) / $1,600 = $3,200 / $1,600 = 2.0',
        'Liquidation price: $1,600 / (5 STRK × 0.80) = $400 per STRK',
        'Drop percentage: ($0.80 - $0.40) / $0.80 = 50% decline needed',
        'Safety assessment: 50% buffer against 5-8% daily volatility is very comfortable — position is safe. Could even consider borrowing more if liquidity needed.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Three borrowers all use ETH as collateral at $3,000. Borrower A: $15,000 ETH, borrowed $10,000 (67% LTV), liquidation threshold 83%. Borrower B: $12,000 ETH, borrowed $9,600 (80% LTV, maximum), liquidation threshold 83%. Borrower C: $20,000 ETH, borrowed $8,000 (40% LTV), liquidation threshold 83%. Calculate each health factor. Rank by liquidation risk. At what ETH price does each trigger?',
      scoringCriteria: [
        'Borrower A: ($15,000 × 0.83) / $10,000 = 1.245. Liquidation at ETH = $10,000 / (5 ETH × 0.83) = $2,410.',
        'Borrower B: ($12,000 × 0.83) / $9,600 = 1.0375. Liquidation at ETH = $9,600 / (4 ETH × 0.83) = $2,892 — only 3.6% below current.',
        'Borrower C: ($20,000 × 0.83) / $8,000 = 2.075. Liquidation at ETH = $8,000 / (6.67 ETH × 0.83) = $1,445.',
        'Risk ranking: B most at risk, A second, C safest. B should repay debt or add collateral immediately.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain the health factor to a property investor who understands LTV ratios in mortgages. 3 sentences. Make the parallel explicit and state the one key difference between mortgage LTV enforcement and DeFi health factor enforcement.',
      scoringCriteria: [
        'Correctly parallels health factor to LTV ratio in mortgages — both measure debt relative to asset value',
        'Key difference correctly stated: mortgage LTV enforcement requires court proceedings, notice periods, and human action. DeFi health factor enforcement is instant and automatic — a smart contract executes liquidation the moment health factor < 1.0, no notice given.',
        'Practical implication stated: DeFi borrowers must monitor positions continuously; mortgage borrowers have weeks or months of warning before enforcement.',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Borrowing Strategies
// ─────────────────────────────────────────────────────────────
{
  id: 'borrowing-strategies',
  title: 'Borrowing Strategies: Why and How to Borrow',
  explanation: `
In 1981, a young Warren Buffett gave a talk at Columbia University where he described borrowing as "renting money." The key word: renting. You pay for the temporary use of capital you do not own. The reason to rent money rather than use your own is leverage — you can deploy borrowed capital alongside your existing capital to generate returns that would otherwise require more capital than you have.

The fundamental reason to borrow in DeFi is straightforward: you believe an asset will appreciate, you do not want to sell it, but you need liquidity now. The hold-and-borrow strategy — hold ETH, borrow USDC against it, use the USDC — lets you access capital without triggering a taxable sale of your ETH position (tax laws vary by jurisdiction — consult a professional).

Leveraged staking is a specific application. You deposit STRK, borrow USDC against it, swap the USDC back to STRK, and stake the new STRK. This increases your effective staking exposure. It is only profitable if the staking APY exceeds the borrow APY — and the spread must also cover your liquidation risk premium. If STRK staking yields 9% and USDC borrowing costs 5.5%, the net spread is 3.5% — potentially worthwhile, but any STRK price decline reduces your health factor and could force liquidation before the spread pays off.

Self-repaying loans are the most elegant DeFi borrowing application. If you supply USDC to Vesu (earning 5.2% supply APY) and borrow USDC against another collateral position, the supply yield slowly repays the borrow cost. Given enough time, a low-LTV position effectively repays itself from yield income.

The critical constraint that many first-time DeFi borrowers ignore: borrow APY is not fixed. It fluctuates with pool utilisation. A strategy that is profitable at 5.5% borrow APY can become unprofitable if borrow APY spikes to 18% during a high-demand period. Always assess your borrowing strategy under an adverse rate scenario — what happens if borrow APY triples?
  `.trim(),
  visualPrompt: 'Three strategy diagrams side by side: (1) Hold-and-borrow: ETH → collateral → USDC loan → liquidity. (2) Leveraged staking: STRK → collateral → USDC → buy STRK → stake. Numbers showing 9% staking APY minus 5.5% borrow APY = 3.5% spread. (3) Self-repaying: supply yield slowly reducing debt bar over time.',
  visualType: 'static',
  visualUrl: 'borrowing-strategies-diagram',
  examples: [
    {
      contextTag: '[Hold-and-borrow, startup operating expense]',
      context: 'A startup co-founder in the Starknet ecosystem He holds $120,000 of ETH he acquired at low cost — selling would trigger significant capital gains tax in his jurisdiction. He needs $30,000 for 6 months of operating expenses.',
      scenario: 'Tobias deposits $120,000 ETH into Vesu as collateral (80% max LTV). He borrows $30,000 USDC at 6.2% borrow APY. Health factor: ($120,000 × 0.83) / $30,000 = 3.32. Very safe.',
      outcome: 'Tobias has $30,000 USDC for operations. His ETH remains in Vesu — he did not sell, so no capital gains event occurred. After 6 months, his borrow cost: $30,000 × 6.2% / 2 = $930 interest. He repays $30,930 USDC total and retrieves his ETH. The alternative — selling $30,000 of ETH — would have triggered capital gains tax and permanently reduced his ETH position.',
    },
    {
      contextTag: '[Leveraged staking, spread analysis]',
      context: 'A DeFi user wants to amplify their STRK staking yield. They have 10,000 STRK ($8,000 at $0.80). They plan: deposit STRK as collateral, borrow $3,200 USDC (40% LTV for safety), swap USDC to 4,000 STRK, stake it.',
      scenario: 'They calculate the leveraged return. Staking APY: 8.8% gross, 5% commission. Borrow APY: 6.1%. Net staking APY: 8.36%.',
      outcome: 'Net spread: 8.36% - 6.1% = 2.26% on the leveraged amount. Annual extra yield: 4,000 STRK × 8.36% = 334 STRK earned, minus $3,200 × 6.1% = $195 borrow cost. At $0.80/STRK, 334 STRK = $267 minus $195 cost = $72 net profit from the leverage. The leverage adds only $72 annually while adding meaningful liquidation risk if STRK falls. The risk-reward is questionable at this spread — only pursue when spread exceeds 3%+ with meaningful margin of safety.',
    },
    {
      contextTag: '[Borrow APY spike, strategy becomes unprofitable]',
      context: 'An investor borrows $50,000 USDC at 5.8% APY to fund a yield strategy returning 8.2% APY — a 2.4% net spread. Two months later, USDC utilisation spikes to 91% and borrow APY rises to 22%.',
      scenario: 'The investor checks their position. Their yield strategy still returns 8.2% APY. Their borrow cost is now 22% APY.',
      outcome: 'Net spread: 8.2% - 22% = -13.8% — deeply negative. The strategy is now losing $6,900 per year ($50,000 × 13.8%). They immediately repay the loan and close the borrowing position. This illustrates why every borrowing strategy must be stress-tested against borrow APY spikes: what is the maximum borrow rate at which the strategy is still profitable, and how likely is that rate to be exceeded?',
    },
  ],
  keyTakeaway: 'The only time borrowing is rational is when the economic benefit of keeping your collateral asset — price appreciation, retained tax position, continued yield — exceeds the ongoing borrow interest you are paying.',
  guidedPractice: [
    {
      question: 'What is the primary reason to use hold-and-borrow rather than simply selling your collateral asset?',
      options: [
        'A. DeFi loans have no interest cost — selling has a transaction fee',
        'B. You maintain your collateral asset exposure (including potential price appreciation) and avoid triggering a taxable disposal event, at the cost of paying borrow interest',
        'C. DeFi loans are cheaper than selling because selling incurs a 10% fee',
        'D. Hold-and-borrow is only for large institutions, not individual users',
      ],
      correct: 1,
      hint: 'What two things do you preserve by borrowing instead of selling?',
      explanation: 'B is correct. By borrowing instead of selling: (1) you keep your collateral asset and benefit from any future appreciation, (2) you do not create a taxable sale event (tax laws vary — always consult a professional). The cost is borrow interest. The hold-and-borrow strategy is optimal when you believe the asset will appreciate and borrow interest is lower than expected appreciation.',
    },
    {
      question: 'Leveraged staking is profitable when:',
      options: [
        'A. STRK price is rising',
        'B. Net staking APY exceeds borrow APY by enough margin to justify the liquidation risk and rate volatility',
        'C. You stake more STRK than you borrowed USDC',
        'D. The validator commission is below 5%',
      ],
      correct: 1,
      hint: 'You earn staking APY on the leveraged STRK and pay borrow APY on the borrowed USDC. When does this produce a positive net result?',
      explanation: 'B is correct. Leveraged staking earns: net staking APY on additional staked STRK. Costs: borrow APY on borrowed USDC. Profitable when: net staking APY > borrow APY. But the margin must also cover the additional risk — STRK price volatility can trigger liquidation before the spread pays off, and borrow APY can spike. A spread of 1–2% is typically insufficient for the risk. 3–5%+ provides meaningful margin.',
    },
    {
      question: 'You borrow $20,000 USDC at 6.5% APY. Your yield strategy returns 9.1% APY. Three months later borrow APY rises to 11.5%. What should you do?',
      options: [
        'A. Hold the position — borrow APY will fall back to 6.5% soon',
        'B. Immediately assess net spread: 9.1% - 11.5% = -2.4%. The strategy is now losing money. Repay the loan unless you have specific reason to believe rates will fall within days.',
        'C. Add more collateral — this fixes the rate issue',
        'D. Switch to a different borrowing strategy while maintaining the loan',
      ],
      correct: 1,
      hint: 'Calculate the net spread at the new borrow rate. Is the strategy still profitable?',
      explanation: 'B is correct. Net spread: 9.1% - 11.5% = -2.4% per year. On $20,000 this loses $480/year. Every week you hold the losing position costs approximately $9.23. Repaying the loan is the correct action unless you have strong conviction that rates will fall within days and that conviction justifies the ongoing loss. "It will come back" is not a strategy — costs are real and accumulating.',
    },
    {
      question: 'A self-repaying loan works by:',
      options: [
        'A. The protocol automatically reduces your debt each month as a promotional offer',
        'B. Supply yield from a deposited asset slowly accrues to repay the borrow cost — at a low enough LTV, the yield can cover the interest without additional payments',
        'C. Staking rewards are automatically routed to debt repayment',
        'D. Self-repaying loans are not available in DeFi — all loans require manual repayment',
      ],
      correct: 1,
      hint: 'Think about what happens if you supply USDC earning 5.2% APY and borrow USDC costing 5.8% APY. How could supply yield eventually repay the debt?',
      explanation: 'B is correct. If you supply $100,000 USDC earning 5.2% APY and borrow $10,000 USDC at 5.8% APY against other collateral, your supply earns $5,200/year while your borrow costs $580/year. The supply yield more than covers the borrow cost — effectively making the loan self-repaying. Real self-repaying loan setups require careful structuring, but the concept is real and used by sophisticated DeFi participants.',
    },
    {
      question: 'You want to borrow $15,000 USDC. Current borrow APY is 7.2%. Your strategy returns 10.5% APY. What is the maximum borrow APY at which your strategy breaks even?',
      options: [
        'A. 7.2% — the current rate is your only concern',
        'B. 10.5% — the strategy breaks even when borrow APY equals your return',
        'C. 3.3% — the current spread',
        'D. 21% — twice the current borrow rate',
      ],
      correct: 1,
      hint: 'Break-even is when revenue equals cost. Your revenue rate is 10.5%. When does cost (borrow APY) equal revenue?',
      explanation: 'B is correct. The strategy breaks even when borrow APY = strategy return = 10.5%. Above 10.5%, the borrow costs more than you earn — the strategy loses money. Current borrow APY is 7.2%, giving a 3.3% margin of safety. If rates spike above 10.5%, close the position. Building this break-even into your analysis before entering any borrowing strategy is essential discipline.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Leveraged staking analysis: You have 5,000 STRK ($4,000 at $0.80). Plan: deposit all 5,000 STRK as collateral, borrow $1,600 USDC (40% LTV for safety), swap to 2,000 STRK, stake the 2,000 STRK. Staking gross APY 9.2%, validator commission 6%, borrow APY 6.8%. Calculate: (1) net staking APY, (2) annual staking income on 2,000 STRK, (3) annual borrow cost, (4) net dollar profit from leverage, (5) whether this justifies the liquidation risk.',
      scoringCriteria: [
        'Net staking APY: 9.2% × (1 - 0.06) = 8.648%',
        'Annual staking income: 2,000 × 8.648% = 172.96 STRK. At $0.80 = $138.37',
        'Annual borrow cost: $1,600 × 6.8% = $108.80',
        'Net profit: $138.37 - $108.80 = $29.57',
        'Conclusion: $29.57/year for adding liquidation risk on a $4,000 position is not compelling. Spread of 1.848% is too thin — not recommended at current rates.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user borrows $40,000 USDC against $100,000 ETH collateral (40% LTV, health factor 2.075 assuming 83% liquidation threshold). Their plan: lend the $40,000 USDC to Vesu at 6.1% APY. Borrow cost: 5.3% APY. They consider this "risk-free arbitrage." Identify three specific risks this strategy carries despite appearing risk-free.',
      scoringCriteria: [
        'Risk 1: ETH price decline reduces health factor — if ETH falls 52%, liquidation is triggered despite starting safely',
        'Risk 2: Borrow APY can spike above supply APY during high utilisation periods — turning the positive spread negative',
        'Risk 3: Smart contract risk at two levels — Vesu for the borrow AND Vesu for the supply deposit (or risk of the protocol being the same contract experiencing one failure that affects both)',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A colleague says: "I borrowed $50,000 at 7% APY and I\'m earning 9% on it. I have a 2% spread. This is basically free money." Explain in 3 sentences why this is not free money and what the two specific costs they are not accounting for are.',
      scoringCriteria: [
        'Cost 1: Interest rate risk — borrow APY is variable and can spike above 9%, eliminating or reversing the spread',
        'Cost 2: Liquidation risk — the borrowed position requires collateral that can be forcibly sold if the collateral asset drops in value',
        'Correctly reframes "free money" as compensated risk-taking — the 2% spread is payment for bearing these two risks',
      ],
    },
  ],
},

];  // end LAB4_LESSONS_1_TO_4
