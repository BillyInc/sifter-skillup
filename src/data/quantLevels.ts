// ⚡ Sifter Skill_Up — Quant Program: Trader Track Level Data
// 90 levels across 6 labs (1001–1090)
// Mechanic types reused from crypto: match3, memory, chain, governance, liquidation, trait, rugpull
// New mechanic: calibration (Bayesian probability scoring)

import type { Level } from './levels';

// Re-export Level type for convenience
export type { Level };

// ── Extended mechanic type includes 'calibration' ─────────────────────────
export type QuantMechanic =
  | 'match3'
  | 'memory'
  | 'chain'
  | 'governance'
  | 'liquidation'
  | 'trait'
  | 'rugpull'
  | 'calibration';

export interface QuantLevel extends Omit<Level, 'mechanic'> {
  mechanic: QuantMechanic;
  lab: number;                    // which lab this belongs to
  vrUnlock?: boolean;             // true for boss levels that unlock a VR scenario
  vrScenario?: string;            // VR scenario key
  interviewStyle?: boolean;       // true for War Room levels — uses interview-format UI
  calibrationData?: {             // for calibration mechanic
    scenario: string;             // what's happening in the market
    baseRate: number;             // prior probability (0–1)
    evidence: string;             // new information arriving
    correctPosterior: number;     // correct updated probability
    tolerance: number;            // acceptable error range
  };
}

export const QUANT_LEVELS: Record<number, QuantLevel> = {

  // ══════════════════════════════════════════════════════════════════════════
  // LAB 1 — PROBABILITY LAB (1001–1015)
  // ══════════════════════════════════════════════════════════════════════════

  1001: {
    simulatorLesson: 'quantRoleQuiz',
    id: 1001, lab: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'What Quants Actually Do',
    fact: 'A quant is a mathematician embedded in a financial firm. Every day: maths, statistics, algorithms applied to the hardest problems in finance. Quants are not stock pickers. They find statistical relationships, pricing inefficiencies, and structural edges that exist because markets are complex systems run by humans who make systematic errors.',
    plain: 'Imagine a chess engine — not guessing moves, but calculating the precise probability that each move leads to a win. Quants apply that same systematic thinking to financial markets.',
    stars: [400, 500, 620], target: 620, coins: 35,
  },

  1002: {
    id: 1002, simulatorLesson: 'archetypeQuiz', lab: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'The Three Quant Archetypes',
    fact: 'Quant Researcher: finds patterns in data, builds predictive models, designs strategies — needs PhD-level maths/stats/ML. Quant Developer: builds trading platforms, execution engines, real-time data pipelines — needs production C++/Rust/Python. Quant Trader: runs capital, manages risk, makes real-time decisions — highest compensation variance.',
    plain: 'Think of it like a Formula One team. The researcher designs the car. The developer builds and maintains it. The trader drives it at 200mph under pressure.',
    stars: [420, 520, 650], target: 650, coins: 37,
  },

  1003: {
    id: 1003, simulatorLesson: 'compQuiz', lab: 1, mechanic: 'memory', tier: 'beginner',
    topic: 'The Compensation Reality',
    fact: 'Entry-level quants at top firms (Jane Street, Citadel, HRT) earned $300K–$500K+ total compensation in 2025. Mid-career (3–7 years): $550K–$950K. Senior (8+ years): $1M–$3M+. Star traders and PMs: $3M–$30M+. AI/ML hiring in finance grew 88% year-over-year in 2025.',
    plain: 'The maths is the moat. AI can write code. AI cannot yet derive why Itô\'s lemma has an extra term or prove that discounted prices are martingales. That mathematical fluency is what the compensation reflects.',
    stars: [440, 540, 680], target: 680, coins: 40,
  },

  1004: {
    id: 1004, simulatorLesson: 'conditionalQuiz', lab: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'Thinking in Conditionals',
    fact: 'Quants think in conditionals, not absolutes. Most people ask "will this happen?" Quants ask "given what I know, how likely is this?" A stock goes up 60% of days — that is the base rate, noisy BS. On days when volume is above average it goes up 75% of the time — that is the conditional probability, a real edge.',
    plain: 'The raw percentage is just weather. The conditional percentage is a forecast. Learning to always ask "given what condition?" is the first real shift in quant thinking.',
    stars: [460, 565, 705], target: 705, coins: 42,
  },

  1005: {
    id: 1005, lab: 1, mechanic: 'calibration', tier: 'beginner',
    topic: 'Base Rates and Conditional Probability',
    fact: 'P(A|B) = P(A and B) / P(B). The probability of A given B equals the probability of both happening divided by the probability of B. This is the foundation of every edge in quantitative trading — conditional thinking turns noisy base rates into real signals.',
    plain: 'If it rains 30% of days and your umbrella is wet 90% of rainy days but only 10% of dry days, seeing a wet umbrella dramatically updates your estimate of rain. Same logic applies to every market signal.',
    stars: [480, 590, 735], target: 735, coins: 45,
    simulatorLesson: 'conditionalProb',
    calibrationData: {
      scenario: 'A stock rises 55% of all trading days. On days when pre-market volume is 2x average, it has historically risen 72% of the time. Pre-market volume is 2x average today.',
      baseRate: 0.55,
      evidence: 'Pre-market volume is 2x average',
      correctPosterior: 0.72,
      tolerance: 0.08,
    },
  },

  1006: {
    id: 1006, simulatorLesson: 'bayesQuiz', lab: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'Bayes\' Theorem',
    fact: 'Bayes\' theorem: updated belief = (likelihood of seeing this data if hypothesis is true × prior belief) / (total probability of seeing this data under any hypothesis). In practice: a model says a stock is worth $50. Earnings come out 3% above estimate. Bayesian posterior shifts upward. The traders who update fastest and most accurately win.',
    plain: 'Your prior is your starting estimate. Evidence arrives. Your posterior is your updated estimate. Bayes is the formula for how rational people — and profitable algorithms — change their minds.',
    stars: [500, 615, 770], target: 770, coins: 48,
  },

  1007: {
    id: 1007, lab: 1, mechanic: 'calibration', tier: 'beginner',
    topic: 'Bayesian Updating in Practice',
    fact: 'Bayesian updating is how you revise conviction in real time. Prior: your belief before evidence. Likelihood: how probable is this evidence if your hypothesis is true? Posterior: your new belief. In markets, each piece of information shifts your probability estimate. Overconfident updating is as dangerous as underconfident updating.',
    plain: 'A doctor\'s prior for a rare disease is 1%. A positive test with 90% accuracy updates the probability — but only to around 8%, not 90%. Bayesian arithmetic protects you from overreacting to data.',
    stars: [520, 640, 800], target: 800, coins: 51,
    simulatorLesson: 'bayesianUpdater',
    calibrationData: {
      scenario: 'Your model has a 40% prior that this token will outperform the market this week. Breaking news: the protocol just announced a major partnership. Historically, partnership announcements are followed by outperformance 70% of the time, and 25% of non-outperformers also announce partnerships.',
      baseRate: 0.40,
      evidence: 'Major partnership announcement',
      correctPosterior: 0.65,
      tolerance: 0.10,
    },
  },

  1008: {
    id: 1008, lab: 1, mechanic: 'memory', tier: 'beginner',
    topic: 'Expected Value',
    fact: 'Expected value (EV) = sum of (outcome × probability of outcome). EV is your conviction — the average result if you repeat a bet infinitely. A trade with EV of +$50 means on average you profit $50 per trade. Negative EV trades, no matter how they feel, lose money in the long run. Every quant decision starts with EV.',
    plain: 'If a coin flip pays you $150 on heads but costs you $100 on tails, your EV is +$25 per flip (0.5 × $150 + 0.5 × -$100). Do this 1,000 times and probability guarantees a profit. This is the entire logic of systematic trading.',
    stars: [540, 665, 830], target: 830, coins: 54,
    simulatorLesson: 'expectedValue',
  },

  1009: {
    id: 1009, simulatorLesson: 'varianceRiskQuiz', lab: 1, mechanic: 'match3', tier: 'beginner',
    topic: 'Variance and Risk',
    fact: 'Variance measures how spread out outcomes are from the expected value. High variance means big wins and big losses — high risk. Low variance means consistent small outcomes — low risk. If your strategy has positive expected value and you can survive the variance, you will make money. Most traders fail not because EV is wrong but because variance kills them before the law of large numbers pays out.',
    plain: 'A strategy that profits $5 every day is better for most people than one that profits $500 once a month and loses $495 three times a month — even if both have the same EV. Variance is the cost of reaching the expected value.',
    stars: [560, 690, 860], target: 860, coins: 57,
  },

  1010: {
    id: 1010, lab: 1, mechanic: 'calibration', tier: 'intermediate',
    topic: 'The Kelly Criterion',
    fact: 'Kelly Criterion: optimal bet fraction = edge / odds = (p × b - q) / b, where p = probability of winning, q = 1 - p, b = net odds. Kelly maximises long-run growth rate. Full Kelly is mathematically optimal but psychologically brutal — most practitioners use half-Kelly or quarter-Kelly to reduce variance. Over-betting Kelly leads to ruin even with positive EV.',
    plain: 'If you have a 60% edge on a coin flip paying even money, Kelly says bet 20% of your bankroll. Bet more and expected growth falls. Bet 100% and ruin is certain if you ever lose — which you eventually will.',
    stars: [580, 715, 895], target: 895, coins: 60,
    simulatorLesson: 'kellyCriterion',
    calibrationData: {
      scenario: 'You have a strategy with 58% win rate. Each trade risks $1 to make $1.20. What fraction of your capital does Kelly say to risk per trade?',
      baseRate: 0.58,
      evidence: 'Win probability: 58%, odds: 1.2:1',
      correctPosterior: 0.22,
      tolerance: 0.05,
    },
  },

  1011: {
    id: 1011, simulatorLesson: 'lolnQuiz', lab: 1, mechanic: 'memory', tier: 'intermediate',
    topic: 'Law of Large Numbers',
    fact: 'The law of large numbers states that as the number of trials increases, the sample average converges to the true expected value. With 10 coin flips, getting 8 heads is plausible. With 10,000 flips, getting 8,000 heads (80%) is essentially impossible. This is why positive-EV strategies need volume, and why quant strategies are tested on thousands of data points — never on ten trades.',
    plain: 'A casino that wins 52% of hands on a $5 blackjack table needs millions of hands per year to guarantee profit. Your edge only expresses itself at scale. This is the deep reason quant strategies are systematic and high-frequency rather than discretionary and occasional.',
    stars: [600, 740, 925], target: 925, coins: 63,
  },

  1012: {
    id: 1012, lab: 1, mechanic: 'chain', tier: 'intermediate',
    topic: 'Monte Carlo Simulation',
    fact: 'Monte Carlo simulation: (1) Define the probability distribution of inputs — e.g. daily returns as normally distributed with mean μ and standard deviation σ. (2) Sample randomly from the distribution thousands of times. (3) Run the model on each sample. (4) Analyse the distribution of outputs. (5) Derive estimates with confidence intervals. Used for option pricing, portfolio risk, strategy robustness testing.',
    plain: 'Instead of solving a complex equation analytically, you simulate it 100,000 times with random inputs and observe what usually happens. Brute force replaces elegance — and it works.',
    stars: [620, 765, 955], target: 955, coins: 66,
    simulatorLesson: 'monteCarlo',
  },

  1013: {
    simulatorLesson: 'berksonQuiz',
    id: 1013, lab: 1, mechanic: 'match3', tier: 'intermediate',
    topic: 'Berkson\'s Paradox',
    fact: 'Berkson\'s paradox: conditioning on a shared consequence of two independent variables makes them appear correlated. X and Y are independent. Both affect Z. If you condition on Z, X and Y become negatively correlated — because knowing X tells you something about Z, which tells you something about Y. In finance: conditioning on any selection criterion creates spurious correlations in the selected sample.',
    plain: 'Hospital patients admitted for any reason showed disease A and disease B as negatively correlated — only because hospitalisation was caused by both. Survivors in backtests look better than they were. The selection criterion created the illusion.',
    stars: [640, 790, 985], target: 985, coins: 69,
  },

  1014: {
    simulatorLesson: 'probInterviewQuiz',
    id: 1014, lab: 1, mechanic: 'governance', tier: 'intermediate',
    topic: 'Probability Interview Problems',
    fact: 'Jane Street interview style — probability problems test how you think, not whether you recall formulas. Key types: (1) Counting and combinatorics — how many ways can this happen? (2) Conditional probability — given X, what is P(Y)? (3) Expected value calculations — what is the average outcome? (4) Bayesian updating — how does evidence change your estimate? (5) Betting games — what is the correct strategy?',
    plain: 'Every probability problem at a quant interview is really asking: can you build a model of uncertainty, condition on what you know, and calculate what matters — under time pressure, out loud, with someone watching?',
    stars: [660, 815, 1015], target: 1015, coins: 72,
  },

  1015: {
    simulatorLesson: 'probGauntletBoss',
    id: 1015, lab: 1, mechanic: 'calibration', tier: 'intermediate',
    topic: 'Lab 1 Boss: Probability Gauntlet',
    fact: 'BOSS LEVEL. You are a junior quant analyst. Three signals arrive in sequence. After each signal you must update your probability estimate for a trade. Signal 1: Historical win rate is 52%. Signal 2: Today\'s pre-market volume is 3x average — historically this increases win rate by 12 percentage points. Signal 3: The sector ETF is down 1.5% pre-market — historically this reduces win rate by 8 percentage points. Final decision: take the trade or pass?',
    plain: 'Real quant decisions are sequential Bayesian updates. Each new piece of information revises your estimate. The skill is in the updating, not in the initial guess.',
    stars: [700, 860, 1075], target: 1075, coins: 80,
    isBoss: true, vrUnlock: true, vrScenario: 'bayesian_trading_floor_intro',
    calibrationData: {
      scenario: 'Base win rate 52%. +12pp from volume signal. -8pp from sector signal. What is your final probability estimate?',
      baseRate: 0.52,
      evidence: 'Volume 3x average (+12pp), sector ETF -1.5% (-8pp)',
      correctPosterior: 0.56,
      tolerance: 0.06,
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LAB 2 — STATISTICS DESK (1016–1030)
  // ══════════════════════════════════════════════════════════════════════════

  1016: {
    id: 1016, simulatorLesson: 'statsIntroQuiz', lab: 2, mechanic: 'match3', tier: 'intermediate',
    topic: 'Statistics as the BS Detector',
    fact: 'The number one lesson statistics teaches is that most of what looks like signal is noise. A strategy that backtests at 15% annual return sounds real. But if you tested 1,000 random strategies, roughly 50 of them would show p-values below 0.05 purely by chance — even if all 1,000 had zero true edge. This is the multiple comparisons problem and it is the graveyard of beginner quants.',
    plain: 'If you flip 1,000 coins and show me only the ones that came up heads 7+ times out of 10, I will think they are biased. The selection process created the illusion of edge. Every single beginner massively overestimates how much signal they have found.',
    stars: [560, 690, 860], target: 860, coins: 57,
  },

  1017: {
    id: 1017, simulatorLesson: 'hypothesisBuilder', lab: 2, mechanic: 'memory', tier: 'intermediate',
    topic: 'Hypothesis Testing',
    fact: 'Hypothesis test for a trading strategy: H₀ (null hypothesis): the strategy has zero expected return. Compute a test statistic from the return data. Calculate the p-value — the probability of seeing returns this good if H₀ were true. If p < 0.05, reject H₀ and claim significance. But remember the multiple comparisons trap: 5% of truly worthless strategies will pass this test by chance.',
    plain: 'The p-value is not the probability your strategy works. It is the probability you would see this data if the strategy does NOT work. A low p-value is evidence against the null hypothesis — not proof of edge.',
    stars: [580, 715, 895], target: 895, coins: 60,
  },

  1018: {
    id: 1018, lab: 2, mechanic: 'match3', tier: 'intermediate',
    topic: 'The Multiple Comparisons Problem',
    fact: 'If you test 100 strategies at 5% significance level, you expect 5 false positives — strategies that look significant but have no real edge. Fix: Bonferroni correction — divide your significance threshold by the number of tests (0.05 / 100 = 0.0005). Or use Benjamini-Hochberg for false discovery rate control. In crypto, with thousands of possible parameter combinations, this problem is catastrophic if ignored.',
    plain: 'Test enough random strategies and one will look brilliant. That is not discovery. That is data mining. Professional quants test on out-of-sample data and apply statistical corrections to prevent themselves from fooling themselves.',
    stars: [600, 740, 925], target: 925, coins: 63,
    simulatorLesson: 'multipleComparisons',
  },

  1019: {
    id: 1019, lab: 2, mechanic: 'memory', tier: 'intermediate',
    topic: 'Linear Regression and Alpha',
    fact: 'Linear regression: y = Xβ + ε. In finance, regress your strategy\'s returns against known risk factors. The intercept α (alpha) is the return that cannot be explained by known factors. If α is zero after accounting for market exposure, your "edge" is just disguised beta. The slope coefficients β measure factor exposures. OLS estimator: β = (XᵀX)⁻¹Xᵀy.',
    plain: 'A strategy that goes up when the whole market goes up has no alpha — it is just long the market. Real alpha survives after you control for market risk, sector risk, size, and momentum. Most strategies that feel like alpha are just hidden beta.',
    stars: [620, 765, 955], target: 955, coins: 66,
    simulatorLesson: 'alphaRegression',
  },

  1020: {
    simulatorLesson: 'neweyWestQuiz',
    id: 1020, lab: 2, mechanic: 'match3', tier: 'intermediate',
    topic: 'Why OLS Standard Errors Are Wrong in Finance',
    fact: 'Default OLS standard errors assume independent, identically distributed errors. Financial return data violates this in two ways: autocorrelation (today\'s return is correlated with yesterday\'s) and heteroskedasticity (volatility changes over time). Using default OLS standard errors is like driving with a cracked windshield. Fix: Newey-West standard errors correct for both.',
    plain: 'If your regression model does not account for the fact that market volatility clusters — calm periods followed by calm periods, volatile periods followed by volatile periods — your statistical tests will be wrong, your significance levels will be wrong, and your confidence in your edge will be wrong.',
    stars: [640, 790, 985], target: 985, coins: 69,
  },

  1021: {
    id: 1021, simulatorLesson: 'confidenceIntervalQuiz', lab: 2, mechanic: 'calibration', tier: 'intermediate',
    topic: 'Confidence Intervals',
    fact: 'A 95% confidence interval does not mean there is a 95% probability the true value is in this interval. It means: if you repeated this experiment 100 times, approximately 95 of the resulting intervals would contain the true value. This is a subtle but critical distinction. In trading, a wide confidence interval on your alpha estimate means your edge is uncertain — not nonexistent but uncertain.',
    plain: 'Misinterpreting confidence intervals leads to overconfidence. A backtest showing 15% annual returns with a wide CI might have a true expected return anywhere from -2% to +32%. Position size accordingly.',
    stars: [660, 815, 1015], target: 1015, coins: 72,
    calibrationData: {
      scenario: 'A strategy backtests at 12% annual return with a 95% CI of [2%, 22%]. What is the probability the strategy has positive expected return?',
      baseRate: 0.5,
      evidence: '95% CI is [2%, 22%] — entire CI is above zero',
      correctPosterior: 0.975,
      tolerance: 0.05,
    },
  },

  1022: {
    id: 1022, simulatorLesson: 'mleQuiz', lab: 2, mechanic: 'memory', tier: 'intermediate',
    topic: 'Maximum Likelihood Estimation',
    fact: 'MLE: given data x₁,...,xₙ from a model with parameter θ, find θ that maximises the likelihood function L(θ) = P(x₁,...,xₙ | θ). In finance: calibrate a GARCH model to volatility, estimate jump-diffusion parameters, fit option pricing to market quotes. MLE is asymptotically efficient — for large samples, no consistent estimator has lower variance. When someone says they are "calibrating" a model, they almost always mean MLE.',
    plain: 'What parameters make this data most likely to have happened? That is MLE in one sentence. You try different parameter values and pick the ones that give your observed data the highest probability.',
    stars: [680, 840, 1050], target: 1050, coins: 75,
  },

  1023: {
    id: 1023, lab: 2, mechanic: 'match3', tier: 'intermediate',
    topic: 'Fat Tails and the Failure of Normality',
    fact: 'Financial returns are not normally distributed. They have fat tails — extreme events (crashes, short squeezes, flash crashes) occur far more often than a normal distribution predicts. The t-distribution with low degrees of freedom models fat tails better. Fitting a Gaussian to return data and then pricing tail risk is one of the most dangerous mistakes in quantitative finance. Long-Term Capital Management collapsed for exactly this reason.',
    plain: 'Normal distribution says a 10-sigma event should happen once in the entire lifetime of the universe. Markets have had multiple 10-sigma events in the past 30 years. The tails are fat. Your risk model must know this.',
    stars: [700, 860, 1075], target: 1075, coins: 78,
    simulatorLesson: 'fatTails',
  },

  1024: {
    id: 1024, simulatorLesson: 'backtestingQuiz', lab: 2, mechanic: 'chain', tier: 'intermediate',
    topic: 'Backtesting: The Correct Process',
    fact: 'A rigorous backtest: (1) Form a hypothesis before looking at the data. (2) Split data — training set, validation set, out-of-sample test set. (3) Develop the strategy on training data only. (4) Tune parameters on validation set only. (5) Test once on out-of-sample data. (6) Apply Bonferroni correction for any parameter combinations tested. (7) Evaluate: is the performance explainable by known risk factors, or is there genuine alpha?',
    plain: 'The cardinal sin of backtesting is peeking at the test data while building the strategy. Your out-of-sample data must stay sealed until you are done. Contamination is invisible and fatal.',
    stars: [720, 885, 1105], target: 1105, coins: 81,
  },

  1025: {
    id: 1025, lab: 2, mechanic: 'memory', tier: 'intermediate',
    topic: 'Sharpe Ratio',
    fact: 'Sharpe ratio = (strategy return − risk-free rate) / standard deviation of returns. Measures risk-adjusted return. A Sharpe of 1.0 is acceptable, 2.0 is good, 3.0+ is excellent. Critical caveat: Sharpe uses standard deviation which assumes symmetric, normally distributed returns. A strategy with a fat left tail (occasional catastrophic losses) can show a high Sharpe while hiding disastrous true risk.',
    plain: 'A strategy that makes 1% every day for a year then loses 50% in one day has a high Sharpe ratio. Until the disaster day. Sharpe tells you about the mean return relative to typical volatility. It does not protect you from rare catastrophes.',
    stars: [740, 910, 1135], target: 1135, coins: 84,
    simulatorLesson: 'sharpeRatio',
  },

  1026: {
    id: 1026, simulatorLesson: 'overfittingQuiz', lab: 2, mechanic: 'match3', tier: 'advanced',
    topic: 'Overfitting and Estimation Error',
    fact: 'Estimation error is the real enemy of quantitative trading. Full Kelly betting, unconstrained Markowitz, ML models with too many features — they all fail for the same reason: overfitting noise in parameter estimates. The math works perfectly with true parameters. You never have true parameters. You have noisy sample estimates. The gap between theory and practice is always estimation error, and the best quants are the ones who respect it.',
    plain: 'A model fitted to 100 data points and using 99 parameters will fit the data perfectly and predict nothing. You have fit the noise, not the signal. Regularisation, cross-validation, and simpler models are not weaknesses — they are disciplines that survive contact with reality.',
    stars: [760, 935, 1165], target: 1165, coins: 87,
  },

  1027: {
    id: 1027, lab: 2, mechanic: 'calibration', tier: 'advanced',
    topic: 'The Permutation Test',
    fact: 'Permutation test for strategy significance: shuffle the return dates randomly 10,000 times. Each shuffle creates a "random strategy" using the same signals but with randomised timing. If your real strategy outperforms 95% of random permutations, p < 0.05 without assuming any distribution. This is distribution-free hypothesis testing — more honest than parametric tests for non-normal financial data.',
    plain: 'Could a random monkey have produced these returns? Shuffle the dates 10,000 times and see how often the monkey beats you. If the monkey beats you 20% of the time, your edge is not significant.',
    stars: [780, 960, 1195], target: 1195, coins: 90,
    simulatorLesson: 'permutationTest',
    calibrationData: {
      scenario: 'A strategy shows 14% annual return. A permutation test runs 10,000 shuffles. 450 of the shuffles beat the strategy. What is the p-value?',
      baseRate: 0.5,
      evidence: '450 out of 10,000 random shuffles beat the strategy',
      correctPosterior: 0.045,
      tolerance: 0.01,
    },
  },

  1028: {
    id: 1028, simulatorLesson: 'timeSeriesQuiz', lab: 2, mechanic: 'memory', tier: 'advanced',
    topic: 'Time Series: Autocorrelation and Stationarity',
    fact: 'A time series is stationary if its statistical properties — mean, variance, autocorrelation — do not change over time. Most financial prices are non-stationary (trending). Returns are typically stationary. Autocorrelation measures how much today\'s value correlates with past values. ACF (autocorrelation function) plots this across lags. For a truly random series (white noise), all autocorrelations are near zero.',
    plain: 'If you regress a non-stationary time series on another non-stationary time series, you will almost always find a significant relationship — even if they are completely unrelated. This spurious regression is the most common mistake in amateur financial analysis.',
    stars: [800, 985, 1225], target: 1225, coins: 93,
  },

  1029: {
    id: 1029, lab: 2, mechanic: 'match3', tier: 'advanced',
    topic: 'Fama-French Factor Model',
    fact: 'Fama-French 3-Factor Model: return = α + β₁(Market) + β₂(SMB) + β₃(HML) + ε. SMB (Small Minus Big): small-cap stocks have historically outperformed large-cap. HML (High Minus Low): value stocks (high book-to-market) have historically outperformed growth stocks. These are risk premia, not free lunch — they compensate for bearing specific types of risk.',
    plain: 'A portfolio that looks like it has 12% annual alpha might actually just be heavily loaded on small-cap value stocks. After accounting for the SMB and HML factors, true alpha might be zero. Factor models strip away the explainable return to reveal what is genuinely unexplained.',
    stars: [820, 1010, 1260], target: 1260, coins: 96,
    simulatorLesson: 'famaFrench',
  },

  1030: {
    simulatorLesson: 'signalNoiseBoss',
    id: 1030, lab: 2, mechanic: 'calibration', tier: 'advanced',
    topic: 'Lab 2 Boss: The Signal or Noise Tribunal',
    fact: 'BOSS LEVEL. You receive a strategy report from a junior analyst: "I tested a momentum strategy on crypto data from 2020–2024. It returned 34% annually with a Sharpe of 1.8. P-value is 0.03." Identify: Is this strategy significant? What questions must you ask before trusting this result? What corrections are needed? Your verdict determines whether the firm allocates capital.',
    plain: 'The answer depends entirely on: how many strategies were tested before this one, whether the test period was cherry-picked, whether the significance is robust to Bonferroni correction, and whether the return survives factor adjustment.',
    stars: [860, 1060, 1320], target: 1320, coins: 105,
    isBoss: true, vrUnlock: true, vrScenario: 'regression_desk_simulation',
    calibrationData: {
      scenario: 'Strategy: 34% annual return, Sharpe 1.8, p=0.03. The analyst tested 40 parameter combinations before selecting this one. Apply Bonferroni correction. Is the strategy significant at the 5% level?',
      baseRate: 0.5,
      evidence: 'p=0.03, but 40 strategies tested — Bonferroni threshold is 0.05/40 = 0.00125',
      correctPosterior: 0.08,
      tolerance: 0.05,
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LAB 3 — LINEAR ALGEBRA FLOOR (1031–1045)
  // ══════════════════════════════════════════════════════════════════════════

  1031: {
    id: 1031, simulatorLesson: 'linAlgFinanceQuiz', lab: 3, mechanic: 'match3', tier: 'intermediate',
    topic: 'Why Linear Algebra Runs Finance',
    fact: 'Linear algebra is the machinery that runs everything in quantitative finance: portfolio construction, PCA, neural networks, covariance estimation, factor models, option pricing. A covariance matrix Σ captures how every asset moves relative to every other asset. For 500 stocks, Σ is 500×500 with 125,250 unique entries. Portfolio variance collapses to a single quadratic form: σ²_p = wᵀΣw.',
    plain: 'Every time you compute how a portfolio behaves, you are doing matrix multiplication. Every time a neural network processes data, it is doing matrix multiplication. Matrices are the language finance and machine learning share.',
    stars: [560, 690, 860], target: 860, coins: 57,
  },

  1032: {
    id: 1032, simulatorLesson: 'portfolioWeightsCalc', lab: 3, mechanic: 'memory', tier: 'intermediate',
    topic: 'Vectors and Portfolio Weights',
    fact: 'A portfolio of n assets can be represented as a weight vector w = [w₁, w₂, ..., wₙ] where Σwᵢ = 1. Expected portfolio return: μ_p = wᵀμ = Σwᵢμᵢ. Portfolio variance: σ²_p = wᵀΣw. The dot product wᵀμ compresses n individual return expectations into a single number. This is why linear algebra notation is not just academic — it compresses the maths of hundreds of assets into a few symbols.',
    plain: 'A portfolio with 10% in each of 10 assets is the vector [0.1, 0.1, ..., 0.1]. The expected return is this vector dotted with the expected returns vector. One operation, any number of assets.',
    stars: [580, 715, 895], target: 895, coins: 60,
  },

  1033: {
    id: 1033, lab: 3, mechanic: 'match3', tier: 'intermediate',
    topic: 'The Covariance Matrix',
    fact: 'The covariance matrix Σ is symmetric and positive semi-definite. Entry Σᵢⱼ = covariance between asset i and asset j. Diagonal entries Σᵢᵢ = variance of asset i. It encodes how all assets move together. A portfolio\'s variance σ²_p = wᵀΣw uses the full covariance structure — not just individual variances. Ignoring covariance and summing individual variances is a common and dangerous mistake.',
    plain: 'Two assets each with 20% volatility might have a portfolio with 5% volatility if they are negatively correlated. Or 35% volatility if they are perfectly positively correlated. The correlation between assets is everything — and the covariance matrix contains all of it.',
    stars: [600, 740, 925], target: 925, coins: 63,
    simulatorLesson: 'covarianceMatrix',
  },

  1034: {
    id: 1034, lab: 3, mechanic: 'chain', tier: 'intermediate',
    topic: 'Markowitz Mean-Variance Optimisation',
    fact: 'Markowitz optimisation: (1) Estimate expected returns μ for each asset. (2) Estimate covariance matrix Σ. (3) Define the objective — minimise σ²_p = wᵀΣw subject to wᵀμ ≥ target_return, wᵀ1 = 1 (fully invested), and any position constraints. (4) Solve as a quadratic programme (cvxpy in Python). (5) The set of solutions across all target returns traces the efficient frontier.',
    plain: 'The efficient frontier is the set of portfolios that maximise expected return for each level of risk. Any portfolio below the frontier is throwing away return for no reason. Any portfolio above is impossible. This is the geometry of rational portfolio construction.',
    stars: [620, 765, 955], target: 955, coins: 66,
    simulatorLesson: 'markowitzOptimiser',
  },

  1035: {
    id: 1035, simulatorLesson: 'eigenQuiz', lab: 3, mechanic: 'memory', tier: 'intermediate',
    topic: 'Eigenvalues and Eigenvectors',
    fact: 'If Av = λv, then v is an eigenvector of matrix A with eigenvalue λ. For a covariance matrix, eigenvectors point in directions of maximum variance. The first eigenvector points in the direction of greatest variance in the data. The second eigenvector (orthogonal to the first) points in the direction of second greatest variance. Eigenvalues tell you how much variance each direction captures.',
    plain: 'Imagine a cloud of data points shaped like an elongated ellipse. The first eigenvector points along the long axis. The second points along the short axis. Eigendecomposition finds the natural axes of your data.',
    stars: [640, 790, 985], target: 985, coins: 69,
  },

  1036: {
    id: 1036, lab: 3, mechanic: 'match3', tier: 'intermediate',
    topic: 'Principal Component Analysis',
    fact: 'PCA applies eigendecomposition to the covariance matrix of returns. For a 500-stock universe, the first 5 eigenvectors (principal components) typically explain 60–70% of all variance. Everything else is noise. In practice, these principal components often correspond to interpretable factors: market beta, sector exposure, size, momentum. PCA is dimensionality reduction — 500 assets compressed into 5 drivers.',
    plain: 'The first principal component of US stock returns is basically the market index — stocks move together. The second is often a growth vs value factor. PCA reveals the hidden structure driving seemingly complex data.',
    stars: [660, 815, 1015], target: 1015, coins: 72,
    simulatorLesson: 'pcaAnalysis',
  },

  1037: {
    id: 1037, simulatorLesson: 'svdQuiz', lab: 3, mechanic: 'memory', tier: 'intermediate',
    topic: 'Matrix Decomposition Methods',
    fact: 'Key matrix decompositions in quant finance: (1) Eigendecomposition: A = QΛQᵀ — used for PCA and covariance analysis. (2) Cholesky decomposition: Σ = LLᵀ — used for simulating correlated random variables (Monte Carlo). (3) SVD (Singular Value Decomposition): A = UΣVᵀ — used for dimensionality reduction and noise filtering. Each has different computational properties and use cases.',
    plain: 'Cholesky is how you generate 500 correlated stock returns in a Monte Carlo simulation without violating the covariance structure. Without it you would simulate each stock independently and throw away all correlation information.',
    stars: [680, 840, 1050], target: 1050, coins: 75,
  },

  1038: {
    id: 1038, lab: 3, mechanic: 'match3', tier: 'intermediate',
    topic: 'Positive Semi-Definiteness',
    fact: 'A covariance matrix must be positive semi-definite (PSD): for any vector v, vᵀΣv ≥ 0. This ensures portfolio variance is never negative. An equicorrelation matrix (all pairwise correlations equal to ρ) has eigenvalues λ₁ = 1 + (n-1)ρ and λ₂ = 1 - ρ. For PSD: ρ ≥ -1/(n-1). With 3 assets the minimum valid correlation is -0.5. With 100 assets it is -0.0101.',
    plain: 'This is exactly the Jane Street Problem 1. You cannot have all assets equally negatively correlated beyond a certain bound — the geometry of probability space forbids it. More assets, tighter floor on negative correlation.',
    stars: [700, 860, 1075], target: 1075, coins: 78,
    simulatorLesson: 'psdMatrix',
  },

  1039: {
    id: 1039, simulatorLesson: 'riskDecompQuiz', lab: 3, mechanic: 'governance', tier: 'advanced',
    topic: 'Portfolio Risk Decomposition',
    fact: 'Portfolio risk attribution: (1) Compute portfolio weights w and covariance matrix Σ. (2) Portfolio variance σ²_p = wᵀΣw. (3) Marginal contribution of asset i: MCᵢ = (Σw)ᵢ. (4) Risk contribution of asset i: RCᵢ = wᵢ × MCᵢ. (5) Percentage risk contribution: wᵢ(Σw)ᵢ / σ²_p. (6) A risk parity portfolio sets all RCᵢ equal — each asset contributes the same risk regardless of weight.',
    plain: 'A 60/40 stock-bond portfolio is about 90% risk from stocks and 10% from bonds by risk contribution — because stocks are far more volatile. Risk parity balances contributions, not dollar allocations.',
    stars: [720, 885, 1105], target: 1105, coins: 81,
  },

  1040: {
    id: 1040, lab: 3, mechanic: 'match3', tier: 'advanced',
    topic: 'Factor Models and Risk Attribution',
    fact: 'A factor model decomposes returns into systematic and idiosyncratic components: rᵢ = αᵢ + Σβᵢₖfₖ + εᵢ. Factors fₖ capture systematic risk (market, sector, size, value, momentum). βᵢₖ are factor loadings — how much of factor k drives asset i. εᵢ is idiosyncratic (specific) risk. Portfolio construction targets factor exposure and controls specific risk. Barra risk models are the industry standard.',
    plain: 'If your portfolio makes 12% and the market makes 10%, and you have beta 1.2, your factor-adjusted return is 12% - 1.2×10% = 0%. All your apparent performance was just market exposure amplified by leverage.',
    stars: [740, 910, 1135], target: 1135, coins: 84,
    simulatorLesson: 'factorModel',
  },

  1041: {
    id: 1041, simulatorLesson: 'corrVsCovQuiz', lab: 3, mechanic: 'memory', tier: 'advanced',
    topic: 'Correlation vs Covariance',
    fact: 'Covariance = E[(X - μₓ)(Y - μᵧ)]. Correlation ρ = Cov(X,Y) / (σₓ σᵧ). Correlation is normalised to [-1, 1]. Covariance depends on units. For portfolio maths, covariance is needed (in the matrix Σ). For interpreting relationships, correlation is more intuitive. A key fact: even uncorrelated assets can have non-zero tail correlation during a crisis — correlations are not stable under stress.',
    plain: 'In 2008, assets that had low correlation in normal times suddenly all crashed together. Correlation is a linear measure and misses non-linear dependence. In a crisis, diversification through correlation often fails precisely when you need it most.',
    stars: [760, 935, 1165], target: 1165, coins: 87,
  },

  1042: {
    id: 1042, lab: 3, mechanic: 'calibration', tier: 'advanced',
    topic: 'The Correlation Matrix Problem',
    fact: 'Jane Street Interview Problem 1: n random variables where any two have the same pairwise correlation ρ. The equicorrelation matrix A = (1 - ρ)I + ρ11ᵀ has eigenvalues λ₁ = 1 + (n-1)ρ and λ₂ = 1 - ρ. For positive semi-definiteness: ρ ≥ -1/(n-1). With n=2: range is [-1,1]. With n=3: minimum is -0.5. With n=10: minimum is approximately -0.111.',
    plain: 'The insight: variance is always non-negative. Any linear combination of the variables must have non-negative variance. This geometric constraint is what imposes the floor on ρ. The key is asking what property of the matrix you are enforcing — not jumping to calculation.',
    stars: [780, 960, 1195], target: 1195, coins: 90,
    simulatorLesson: 'correlationMatrix',
    interviewStyle: true,
    calibrationData: {
      scenario: 'For n=5 assets with equal pairwise correlation ρ, what is the minimum valid value of ρ?',
      baseRate: 0.5,
      evidence: 'Eigenvalue λ₂ = 1 - ρ must be ≥ 0. For n=5: minimum ρ = -1/(n-1) = -1/4 = -0.25',
      correctPosterior: -0.25,
      tolerance: 0.02,
    },
  },

  1043: {
    simulatorLesson: 'regressionMatrixQuiz',
    id: 1043, lab: 3, mechanic: 'match3', tier: 'advanced',
    topic: 'Linear Regression as Matrix Operations',
    fact: 'OLS regression in matrix form: minimise ||y - Xβ||². Solution: β̂ = (XᵀX)⁻¹Xᵀy. Geometric interpretation: the estimated coefficients project y onto the column space of X. The residuals e = y - Xβ̂ are orthogonal to X (by construction). Prediction: ŷ = Xβ̂ = X(XᵀX)⁻¹Xᵀy = Hy where H is the hat matrix (projection matrix).',
    plain: 'OLS is not just a formula. It is a geometric projection. You are finding the point in the space spanned by your features that is closest to your target. The residuals are the perpendicular distance from target to that space.',
    stars: [800, 985, 1225], target: 1225, coins: 93,
  },

  1044: {
    simulatorLesson: 'dimReducQuiz',
    id: 1044, lab: 3, mechanic: 'memory', tier: 'advanced',
    topic: 'Dimensionality Reduction in Practice',
    fact: 'Curse of dimensionality: as the number of features grows, the data becomes increasingly sparse and distance metrics lose meaning. In a 100-dimensional space, almost all data points are equidistant from each other. Techniques: PCA (linear, maximises variance), t-SNE (non-linear, preserves local structure), UMAP (non-linear, preserves global and local structure). In quant research, reducing 500 stock features to 10 principal components is standard before feeding ML models.',
    plain: 'With 500 features and 1,000 data points, any model can perfectly memorise the training data. It has more parameters than data. PCA forces you to work in a lower-dimensional space where meaningful patterns can actually be found.',
    stars: [820, 1010, 1260], target: 1260, coins: 96,
  },

  1045: {
    simulatorLesson: 'portfolioBoss',
    id: 1045, lab: 3, mechanic: 'governance', tier: 'advanced',
    topic: 'Lab 3 Boss: Portfolio Construction Under Constraints',
    fact: 'BOSS LEVEL. You are building a 20-asset portfolio. Constraints: (1) Each position between -10% and +30%. (2) Net exposure = 100% (fully invested). (3) Minimum target return of 8% per year. (4) Maximise Sharpe ratio. Additional constraint: no single sector exceeds 30% of portfolio. Process: estimate μ and Σ from 2 years of daily returns, apply PCA to reduce noise in Σ, then solve the quadratic optimisation programme.',
    plain: 'Real portfolio construction is constrained optimisation. The unconstrained Markowitz optimiser produces extreme, unstable allocations. Constraints represent investment guidelines, risk limits, and operational realities.',
    stars: [860, 1060, 1320], target: 1320, coins: 105,
    isBoss: true, vrUnlock: true, vrScenario: 'portfolio_matrix_builder',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LAB 4 — CALCULUS & OPTIMISATION SUITE (1046–1060)
  // ══════════════════════════════════════════════════════════════════════════

  1046: {
    id: 1046, simulatorLesson: 'calculusIntroQuiz', lab: 4, mechanic: 'match3', tier: 'intermediate',
    topic: 'Why Calculus Runs Finance',
    fact: 'Calculus is the language of change. Prices change. Volatilities change. Every risk metric — delta, gamma, vega — is a derivative in the calculus sense: the rate of change of one quantity with respect to another. Without calculus you can describe what happened. With it you can compute what happens next and how to hedge it.',
    plain: 'Delta hedging an options book requires recomputing how the portfolio value changes as the stock price changes. That rate of change is a partial derivative. Every time an options market maker hedges, they are doing applied calculus.',
    stars: [560, 690, 860], target: 860, coins: 57,
  },

  1047: {
    id: 1047, simulatorLesson: 'derivativeCalcQuiz', lab: 4, mechanic: 'memory', tier: 'intermediate',
    topic: 'Derivatives and Rates of Change',
    fact: 'The derivative f\'(x) measures the instantaneous rate of change of f at x. In finance: if V is option value and S is stock price, ∂V/∂S = Δ (delta) measures how much the option moves per $1 move in the stock. ∂²V/∂S² = Γ (gamma) measures how fast delta changes. ∂V/∂t = Θ (theta) measures time decay. ∂V/∂σ = ν (vega) measures sensitivity to volatility.',
    plain: 'Every option Greek is a partial derivative. Delta tells you your hedge ratio. Gamma tells you how often to re-hedge. Theta is the cost of carrying the position. Vega is where the real money is made and lost on vol desks.',
    stars: [580, 715, 895], target: 895, coins: 60,
  },

  1048: {
    id: 1048, simulatorLesson: 'taylorQuiz', lab: 4, mechanic: 'match3', tier: 'intermediate',
    topic: 'Taylor Expansion in Finance',
    fact: 'Taylor expansion approximates a function near a point: f(x + δ) ≈ f(x) + f\'(x)δ + ½f\'\'(x)δ² + ... In options: ΔV ≈ Δ·ΔS + ½Γ·(ΔS)². The first-order term is delta hedging. The second-order term is the gamma correction. Delta hedging is the first-order approximation. Gamma hedging adds the second-order correction. The reason Itô calculus differs from ordinary calculus is precisely because the second-order Taylor term does not vanish for random processes.',
    plain: 'In normal calculus you can ignore (Δx)² because it is infinitesimally small. For a random walk, (ΔW)² = Δt is first order — it cannot be ignored. This single fact is the foundation of all stochastic calculus.',
    stars: [600, 740, 925], target: 925, coins: 63,
  },

  1049: {
    id: 1049, lab: 4, mechanic: 'memory', tier: 'intermediate',
    topic: 'Gradient Descent',
    fact: 'Gradient descent minimises a function f(θ) by iteratively stepping in the direction of steepest descent: θₙ₊₁ = θₙ - α∇f(θₙ), where α is the learning rate. Used in: calibrating model parameters, training neural networks, portfolio optimisation, maximum likelihood estimation. Variants: SGD (stochastic — one sample at a time), Adam (adaptive learning rate), L-BFGS (second-order, faster for small problems).',
    plain: 'Imagine you are blindfolded on a hill and want to reach the bottom. Gradient descent says: feel the slope under your feet and take one step in the steepest downhill direction. Repeat until flat. Learning rate determines step size — too big and you overshoot, too small and it takes forever.',
    stars: [620, 765, 955], target: 955, coins: 66,
    simulatorLesson: 'gradientDescent',
  },

  1050: {
    id: 1050, simulatorLesson: 'convexOptQuiz', lab: 4, mechanic: 'chain', tier: 'intermediate',
    topic: 'Convex Optimisation',
    fact: 'A function is convex if the line segment between any two points on the graph lies above the graph. Convex optimisation: (1) Identify if the problem is convex — objective function convex, feasible set convex. (2) Convex problems have a single global minimum — no local minima to get trapped in. (3) The KKT conditions characterise the optimal solution. (4) Solve with interior-point methods or cvxpy. (5) Non-convex problems require global solvers (much harder) or approximations.',
    plain: 'Markowitz optimisation is convex because variance is a convex function of weights. This is why it has a unique global solution. If the problem were non-convex, gradient descent might find a local minimum that is not the global optimum.',
    stars: [640, 790, 985], target: 985, coins: 69,
  },

  1051: {
    id: 1051, lab: 4, mechanic: 'match3', tier: 'intermediate',
    topic: 'The Greeks: Delta and Gamma',
    fact: 'Delta (Δ = ∂V/∂S): measures option price sensitivity to underlying price. Call delta ranges 0 to 1. Put delta ranges -1 to 0. At-the-money option has delta ≈ 0.5. Gamma (Γ = ∂²V/∂S² = ∂Δ/∂S): measures how fast delta changes. High gamma near expiry for at-the-money options. Long options have positive gamma. Short options have negative gamma. Gamma tells you how often you need to re-hedge your delta.',
    plain: 'Delta is the first derivative of the option price. Gamma is the second derivative. A high-gamma position is like driving on ice — the steering wheel (delta) keeps changing as conditions change. You have to re-hedge constantly.',
    stars: [660, 815, 1015], target: 1015, coins: 72,
    simulatorLesson: 'deltaGamma',
  },

  1052: {
    id: 1052, simulatorLesson: 'thetaVegaQuiz', lab: 4, mechanic: 'memory', tier: 'intermediate',
    topic: 'The Greeks: Theta and Vega',
    fact: 'Theta (Θ = ∂V/∂t): time decay. Typically negative for long options — they lose value as time passes, all else equal. Theta is the cost of holding an option. Vega (ν = ∂V/∂σ): sensitivity to implied volatility. Long options have positive vega — they gain value when volatility increases. Volatility trading desks primarily trade vega. Rho (ρ = ∂V/∂r): sensitivity to interest rates — usually small except for very long-dated options.',
    plain: 'Theta and vega have a natural tension. Short options collect theta decay but face vega risk if volatility spikes. Long options pay theta but profit from volatility increases. Most options strategies are fundamentally bets on realised vs implied volatility.',
    stars: [680, 840, 1050], target: 1050, coins: 75,
  },

  1053: {
    id: 1053, simulatorLesson: 'chainRuleQuiz', lab: 4, mechanic: 'match3', tier: 'intermediate',
    topic: 'The Chain Rule in Finance',
    fact: 'Chain rule: d/dx[f(g(x))] = f\'(g(x)) · g\'(x). In finance: the sensitivity of a portfolio to an underlying factor is the product of sensitivities along the chain. Portfolio P contains option V which depends on stock S which depends on index F: ∂P/∂F = (∂P/∂V)(∂V/∂S)(∂S/∂F) = quantity × delta × beta. This chain rule application is how factor risk is propagated through complex portfolios.',
    plain: 'Risk travels through a portfolio like a chain. Each link multiplies the sensitivity. A portfolio of options on stocks that all track the same index has index risk = sum of (quantity × delta × beta) for each position. Chain rule is how you compute it.',
    stars: [700, 860, 1075], target: 1075, coins: 78,
  },

  1054: {
    id: 1054, simulatorLesson: 'hessianQuiz', lab: 4, mechanic: 'chain', tier: 'advanced',
    topic: 'Gradient and Hessian',
    fact: 'For a multivariate function f(x₁,...,xₙ): Gradient ∇f is the vector of partial derivatives — the direction of steepest ascent. Hessian H is the matrix of second partial derivatives — captures curvature. For optimisation: gradient descent uses only ∇f (first order). Newton\'s method uses both ∇f and H⁻¹ (second order) — converges faster but requires computing and inverting the Hessian. In portfolio optimisation, the Hessian of the objective function is proportional to the covariance matrix Σ.',
    plain: 'Gradient descent uses only slope. Newton\'s method also uses curvature — it knows not just which direction to step but how big a step to take based on how curved the surface is. This is why it converges in far fewer iterations.',
    stars: [720, 885, 1105], target: 1105, coins: 81,
  },

  1055: {
    id: 1055, lab: 4, mechanic: 'memory', tier: 'advanced',
    topic: 'Lagrange Multipliers and Constrained Optimisation',
    fact: 'To optimise f(x) subject to constraint g(x) = 0: form the Lagrangian L(x,λ) = f(x) - λg(x) and solve ∇L = 0. λ is the Lagrange multiplier — it measures the sensitivity of the optimal value to changes in the constraint. In portfolio optimisation: maximise expected return subject to constant variance. The Lagrange multiplier on the variance constraint is proportional to the market price of risk (Sharpe ratio of the tangency portfolio).',
    plain: 'You cannot run faster than your lungs allow. The Lagrange multiplier measures exactly how much faster you could run if your lungs were 1% better. In finance, it measures how much return you gain per unit of additional risk you accept.',
    stars: [740, 910, 1135], target: 1135, coins: 84,
    simulatorLesson: 'lagrangeOpt',
  },

  1056: {
    id: 1056, simulatorLesson: 'partialDerivQuiz', lab: 4, mechanic: 'match3', tier: 'advanced',
    topic: 'Partial Derivatives and Risk Management',
    fact: 'DV01 (dollar value of a basis point): the change in bond price for a 1 basis point (0.01%) change in yield. DV01 = -∂P/∂y × 0.0001. Duration is the percentage change per unit change in yield. Convexity is the second derivative — analogous to gamma. For options: the entire risk management framework (delta hedging, gamma hedging, vega hedging) is applied calculus. Risk managers compute portfolio sensitivities to all factors — essentially computing a giant gradient vector.',
    plain: 'Every "sensitivity" in finance is a partial derivative. Interest rate risk, credit spread risk, equity risk, FX risk — all expressed as first (and sometimes second) derivatives of portfolio value with respect to the relevant risk factor.',
    stars: [760, 935, 1165], target: 1165, coins: 87,
  },

  1057: {
    id: 1057, simulatorLesson: 'integerProgQuiz', lab: 4, mechanic: 'governance', tier: 'advanced',
    topic: 'Integer Programming and Combinatorial Optimisation',
    fact: 'Integer programming optimises over discrete (integer) variables rather than continuous ones. In finance: optimal lot sizing (must trade integer shares), index tracking with a limited number of stocks, combinatorial arbitrage across binary outcome markets. Gurobi is the fastest commercial solver. Google OR-Tools is the strongest free solver. Key technique: branch-and-bound. The LMSR prediction market cost function uses the softmax function — the same function powering every neural network classifier.',
    plain: 'Markowitz says hold 4.73% of stock X. But you can only hold whole shares. Integer programming finds the closest feasible portfolio. At scale across thousands of assets, this is a genuinely hard computational problem.',
    stars: [780, 960, 1195], target: 1195, coins: 90,
  },

  1058: {
    id: 1058, lab: 4, mechanic: 'memory', tier: 'advanced',
    topic: 'Numerical Methods: When Closed Forms Fail',
    fact: 'Most real financial problems have no closed-form solution. Numerical methods: (1) Finite difference methods — discretise the PDE and solve on a grid (used for American options). (2) Binomial tree — discrete approximation to continuous price processes. (3) Monte Carlo — simulate many paths and average (used for path-dependent options). (4) Newton-Raphson — for solving implied volatility from observed option prices (one of the most common operations in options trading).',
    plain: 'Implied volatility has no closed-form inverse. Given an option price, you must numerically solve for the volatility that would produce that price. Newton-Raphson does this in 4–5 iterations to machine precision. Every options terminal does this calculation thousands of times per second.',
    stars: [800, 985, 1225], target: 1225, coins: 93,
    simulatorLesson: 'impliedVol',
  },

  1059: {
    id: 1059, simulatorLesson: 'mlOptQuiz', lab: 4, mechanic: 'match3', tier: 'advanced',
    topic: 'Optimisation in Machine Learning for Finance',
    fact: 'ML model training is an optimisation problem: minimise the loss function L(θ) over model parameters θ. For neural networks: backpropagation computes ∂L/∂θ via the chain rule, then gradient descent updates θ. Regularisation (L1: adds |θ|, L2: adds θ²) prevents overfitting by penalising large parameter values. Cross-entropy loss for classification. MSE for regression. L-BFGS for small models. Adam for deep networks.',
    plain: 'Training a neural network is 10,000 applications of gradient descent. Each forward pass computes the loss. Each backward pass (backpropagation) computes the gradient. The chain rule makes this tractable even for networks with millions of parameters.',
    stars: [820, 1010, 1260], target: 1260, coins: 96,
  },

  1060: {
    id: 1060, lab: 4, mechanic: 'calibration', tier: 'advanced',
    topic: 'Lab 4 Boss: The Delta-Hedging Gauntlet',
    fact: 'BOSS LEVEL. You hold a call option position: long 100 calls, strike $100, current stock price $98, delta = 0.45, gamma = 0.08, vega = 0.12. Market moves: Stock rises $3. Delta is now approximately 0.69. How many shares do you need to buy or sell to re-establish a delta-neutral hedge? What is your P&L from the gamma? What is your vega exposure if implied volatility drops 2 points?',
    plain: 'Delta hedging is continuous applied calculus. Every time the stock moves, delta changes (because gamma). You must re-hedge. Each re-hedge costs money. The question is whether your gamma gains exceed the hedging costs — that is the P&L of a long options position.',
    stars: [860, 1060, 1320], target: 1320, coins: 105,
    isBoss: true, vrUnlock: true, vrScenario: 'delta_hedging_simulation',
    simulatorLesson: 'deltaHedgingBoss',
    calibrationData: {
      scenario: 'Stock moves from $98 to $101 (+$3). Initial delta = 0.45 on 100 calls. New delta ≈ 0.45 + 0.08×3 = 0.69. To hedge 100 calls at new delta, how many shares do you need short?',
      baseRate: 0.45,
      evidence: 'Gamma = 0.08, stock moved +$3, new delta = 0.45 + 0.24 = 0.69',
      correctPosterior: 69,
      tolerance: 3,
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LAB 5 — STOCHASTIC CALCULUS CHAMBER (1061–1075)
  // ══════════════════════════════════════════════════════════════════════════

  1061: {
    id: 1061, simulatorLesson: 'stochCalcIntroQuiz', lab: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'What Stochastic Calculus Does',
    fact: 'Before stochastic calculus, you are a data scientist who likes finance. After it, you are a quant. Stochastic calculus models how quantities evolve when they are driven by randomness — prices, interest rates, volatility. It provides the mathematical language for deriving option pricing formulas, constructing hedges, and understanding why the drift of a stock disappears from option prices. It is the hardest content in this programme and the most valuable.',
    plain: 'Regular calculus handles smooth functions. Stochastic calculus handles functions driven by noise — paths that are continuous but nowhere differentiable. You need different rules because noise at every infinitesimal timescale accumulates in unexpected ways.',
    stars: [600, 740, 925], target: 925, coins: 63,
  },

  1062: {
    id: 1062, lab: 5, mechanic: 'memory', tier: 'advanced',
    topic: 'Brownian Motion',
    fact: 'A standard Brownian motion Wₜ (Wiener process) satisfies: W₀ = 0; increments Wₜ - Wₛ ~ N(0, t-s) for t > s; non-overlapping increments are independent; paths are continuous but nowhere differentiable. The critical insight: dWₜ has "size" √dt, meaning (dWₜ)² = dt exactly. This is not a technicality — it is the single most important fact in quantitative finance. Normal calculus drops (dx)². Stochastic calculus cannot.',
    plain: 'Imagine a particle buffeted by random forces at every instant. Its path is continuous — no teleporting — but has no tangent at any point — infinitely jagged. The variance of its position grows linearly with time: E[Wₜ²] = t.',
    stars: [620, 765, 955], target: 955, coins: 66,
    simulatorLesson: 'brownianMotion',
  },

  1063: {
    id: 1063, lab: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'Geometric Brownian Motion',
    fact: 'Geometric Brownian Motion models stock prices: dSₜ = μSₜdt + σSₜdWₜ. The percentage drift is constant (μ). The percentage volatility is constant (σ). Solution: Sₜ = S₀ exp((μ - σ²/2)t + σWₜ). Key insight: the exponent contains μ - σ²/2, not μ — the "Itô correction" subtracts half the variance. Without this correction, the model overestimates the expected log return. This is the first place where (dWₜ)² = dt matters in practice.',
    plain: 'Stock prices cannot go negative (unlike arithmetic Brownian motion). GBM ensures positivity by modelling percentage changes rather than absolute changes. The log-normal distribution of prices under GBM is the foundation of the Black-Scholes world.',
    stars: [640, 790, 985], target: 985, coins: 69,
    simulatorLesson: 'gbmSimulator',
  },

  1064: {
    id: 1064, simulatorLesson: 'itoQuiz', lab: 5, mechanic: 'chain', tier: 'advanced',
    topic: 'Itô\'s Lemma',
    fact: 'Itô\'s lemma: for f(Xₜ, t) where dXₜ = μdt + σdWₜ: df = (∂f/∂t + μ∂f/∂X + ½σ²∂²f/∂X²)dt + σ∂f/∂X dWₜ. The extra term ½σ²∂²f/∂X² is the Itô correction — it arises because (dXₜ)² = σ²dt is first order. In ordinary calculus you would drop it. You cannot drop it here. Applying Itô\'s lemma to f(S) = ln(S) gives d(ln S) = (μ - σ²/2)dt + σdWₜ — the drift of log-price.',
    plain: 'Itô\'s lemma is the stochastic chain rule. It tells you how a function of a random process changes. The extra term is the price of randomness — it alters the drift of every transformation of a stochastic process.',
    stars: [660, 815, 1015], target: 1015, coins: 72,
  },

  1065: {
    id: 1065, lab: 5, mechanic: 'memory', tier: 'advanced',
    topic: 'Deriving Black-Scholes: The Delta-Hedge Argument',
    fact: 'Black-Scholes derivation: (1) Let V(S,t) be an option price on stock S following GBM. Apply Itô\'s lemma. (2) Construct a delta-hedged portfolio Π = V - ΔS where Δ = ∂V/∂S. Compute dΠ. (3) The dWₜ terms cancel — the portfolio is locally riskless. (4) A riskless portfolio earns the risk-free rate r: dΠ = rΠdt. (5) Substitute and rearrange to get the Black-Scholes PDE: ∂V/∂t + ½σ²S²∂²V/∂S² + rS∂V/∂S - rV = 0.',
    plain: 'The drift μ vanishes completely from the Black-Scholes PDE. The option price does not depend on the expected return of the stock. Only σ, r, S, K, t matter. This is the risk-neutral pricing insight — you can price options as if everyone is risk-neutral, even in a world where they are not.',
    stars: [680, 840, 1050], target: 1050, coins: 75,
    simulatorLesson: 'blackScholesDerivation',
    interviewStyle: true,
  },

  1066: {
    id: 1066, lab: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'The Black-Scholes Formula',
    fact: 'Black-Scholes call price: C = S·N(d₁) - K·e⁻ʳᵀ·N(d₂). Where: d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T); d₂ = d₁ - σ√T. N() is the standard normal CDF. Interpretation: S·N(d₁) is the expected value of stock price if the option finishes in the money. K·e⁻ʳᵀ·N(d₂) is the present value of the strike payment, weighted by probability of exercise.',
    plain: 'N(d₂) is the risk-neutral probability the option ends in the money. N(d₁) is the delta — how much the option moves per dollar move in the stock. The formula says the call is worth the expected stock receipt minus the expected strike payment, both risk-neutrally discounted.',
    stars: [700, 860, 1075], target: 1075, coins: 78,
    simulatorLesson: 'blackScholesCalc',
  },

  1067: {
    id: 1067, simulatorLesson: 'putCallParityCalc', lab: 5, mechanic: 'calibration', tier: 'advanced',
    topic: 'Put-Call Parity',
    fact: 'Put-call parity: C - P = S - K·e⁻ʳᵀ. A long call and short put at the same strike is equivalent to a long forward. This must hold by no-arbitrage — if it breaks, you can lock in a riskless profit. Consequence: knowing the call price determines the put price (and vice versa) for the same strike and expiry. Violations of put-call parity are arbitrage opportunities and are exploited within milliseconds in liquid markets.',
    plain: 'Two portfolios with the same payoff must have the same price. Portfolio A: long call, short put. Portfolio B: long stock, borrow K·e⁻ʳᵀ. Both pay S - K at expiry for any S. Therefore C - P = S - Ke⁻ʳᵀ. This is pure no-arbitrage logic.',
    stars: [720, 885, 1105], target: 1105, coins: 81,
    calibrationData: {
      scenario: 'Stock = $100, Strike = $100, r = 5%, T = 1 year, Call = $10. Using put-call parity, what is the put price? (K·e⁻ʳᵀ ≈ $95.12)',
      baseRate: 0.5,
      evidence: 'C - P = S - Ke⁻ʳᵀ = 100 - 95.12 = 4.88. P = C - 4.88 = 10 - 4.88 = 5.12',
      correctPosterior: 5.12,
      tolerance: 0.20,
    },
  },

  1068: {
    id: 1068, lab: 5, mechanic: 'memory', tier: 'advanced',
    topic: 'Implied Volatility and the Volatility Surface',
    fact: 'Implied volatility (IV) is the value of σ you must plug into Black-Scholes to match the observed market price. Black-Scholes assumes constant σ but the market implies different σ for different strikes and expiries — the volatility surface. The volatility smile: options with lower strikes (puts) trade at higher IV than at-the-money options, reflecting crash risk. The term structure of volatility: IV typically rises then falls across expiries.',
    plain: 'If Black-Scholes were exactly right, all options on the same stock would have the same implied volatility. They do not. The volatility surface is the market\'s correction of the model\'s simplifications. Trading the surface is the bread and butter of vol desks.',
    stars: [740, 910, 1135], target: 1135, coins: 84,
    simulatorLesson: 'volSurface',
  },

  1069: {
    id: 1069, simulatorLesson: 'riskNeutralQuiz', lab: 5, mechanic: 'match3', tier: 'advanced',
    topic: 'Risk-Neutral Measure',
    fact: 'Under the physical measure P, stocks drift at μ. Under the risk-neutral measure Q, stocks drift at r (risk-free rate). Option prices are expectations under Q: V = e⁻ʳᵀ E^Q[payoff at T]. Changing from P to Q is a change of probability measure (Girsanov\'s theorem). Under Q, the market price of risk vanishes — everyone is indifferent to risk. This is not a description of the real world. It is a mathematical device that makes pricing tractable.',
    plain: 'Risk-neutral pricing does not assume investors are risk-neutral. It says: there exists a probability measure under which discounted prices are martingales, and option prices are expectations under that measure. This is the fundamental theorem of asset pricing.',
    stars: [760, 935, 1165], target: 1165, coins: 87,
  },

  1070: {
    id: 1070, lab: 5, mechanic: 'chain', tier: 'advanced',
    topic: 'Monte Carlo Option Pricing',
    fact: 'Monte Carlo under risk-neutral measure: (1) Simulate N paths of Sₜ = S₀·exp((r - σ²/2)T + σ√T·Z) where Z ~ N(0,1). (2) Compute payoff for each path: max(Sₜ - K, 0) for a call. (3) Average the payoffs. (4) Discount to present: price = e⁻ʳᵀ × average payoff. Error decreases as 1/√N — 100x more simulations gives 10x smaller error. Variance reduction techniques (antithetic variates, control variates) reduce error without more simulations.',
    plain: 'With 500,000 simulations, Monte Carlo converges to within cents of Black-Scholes for vanilla options. For exotic options with no closed-form solution (barrier options, Asian options, lookback options), Monte Carlo is often the only tractable pricing method.',
    stars: [780, 960, 1195], target: 1195, coins: 90,
    simulatorLesson: 'monteCarloOptions',
  },

  1071: {
    id: 1071, simulatorLesson: 'stochVolQuiz', lab: 5, mechanic: 'memory', tier: 'elite',
    topic: 'Stochastic Volatility Models',
    fact: 'Black-Scholes assumes constant volatility — wrong. Stochastic volatility models: Heston model: dSₜ = rSₜdt + √vₜSₜdW¹ₜ; dvₜ = κ(θ - vₜ)dt + ξ√vₜdW²ₜ, with dW¹dW² = ρdt. v is variance, κ is mean-reversion speed, θ is long-run variance, ξ is vol of vol. The Heston model can produce volatility smiles. Calibration: find κ, θ, ξ, ρ, v₀ to fit the observed volatility surface via MLE or least squares.',
    plain: 'Volatility is not constant. It mean-reverts, spikes during crises, and is correlated with returns (leverage effect — stocks fall and volatility rises simultaneously, hence ρ < 0). The Heston model captures all of this at the cost of mathematical complexity.',
    stars: [800, 985, 1225], target: 1225, coins: 93,
  },

  1072: {
    id: 1072, simulatorLesson: 'mertonQuiz', lab: 5, mechanic: 'match3', tier: 'elite',
    topic: 'Jump-Diffusion: Merton Model',
    fact: 'Merton\'s jump-diffusion model adds discrete jumps to GBM: dSₜ/Sₜ = (μ - λk̄)dt + σdWₜ + JdNₜ. Nₜ is a Poisson process with intensity λ (average jumps per year). J is the jump size. k̄ is the expected jump size. Jumps capture sudden crashes that Brownian motion cannot. Consequence: option prices under jump-diffusion are higher (especially out-of-the-money puts) because crashes can happen suddenly, not just gradually.',
    plain: 'GBM says stock prices move smoothly. Real prices jump — September 11, 2001; the 2008 crash; the March 2020 COVID crash. Jump-diffusion models this by adding a random Poisson process that fires occasionally and makes the stock price leap.',
    stars: [820, 1010, 1260], target: 1260, coins: 96,
  },

  1073: {
    id: 1073, simulatorLesson: 'martingaleQuiz', lab: 5, mechanic: 'memory', tier: 'elite',
    topic: 'Martingales in Finance',
    fact: 'A process Xₜ is a martingale if E[Xₜ | Fₛ] = Xₛ for all s < t — the best forecast of the future value is the current value. Under the risk-neutral measure Q, discounted stock prices are martingales: E^Q[e⁻ʳᵀSₜ] = Sₛe⁻ʳˢ. The martingale representation theorem: any Q-martingale can be written as a stochastic integral — this is the theoretical foundation for replication and hedging. No-arbitrage is equivalent to the existence of a martingale measure.',
    plain: 'If discounted prices were not martingales, there would be a predictable pattern — and that pattern would be an arbitrage. No-arbitrage forces discounted prices to be martingales. The entire modern theory of derivatives pricing rests on this.',
    stars: [840, 1035, 1290], target: 1290, coins: 99,
  },

  1074: {
    id: 1074, lab: 5, mechanic: 'calibration', tier: 'elite',
    topic: 'GARCH Models for Volatility Forecasting',
    fact: 'GARCH(1,1): σ²ₜ = ω + α·ε²ₜ₋₁ + β·σ²ₜ₋₁. ω is baseline variance. α (ARCH term) captures how much last period\'s shock increases current volatility. β (GARCH term) captures volatility persistence. α + β < 1 ensures mean reversion. Typical fitted values: α ≈ 0.1, β ≈ 0.85. Volatility clustering: high volatility tends to be followed by high volatility — GARCH captures this autocorrelation in squared returns.',
    plain: 'Volatility is forecastable even though returns are not. Yesterday\'s big market move predicts higher volatility today. GARCH quantifies this: σ²ₜ = 0.05% + 0.1 × yesterday\'s squared return + 0.85 × yesterday\'s variance. This is how risk management systems estimate tomorrow\'s VaR.',
    stars: [860, 1060, 1320], target: 1320, coins: 102,
    simulatorLesson: 'garchModel',
    calibrationData: {
      scenario: 'GARCH(1,1) parameters: ω=0.00001, α=0.08, β=0.90. Yesterday\'s return was -3% (ε²=0.0009). Yesterday\'s variance was σ²=0.0004. What is today\'s variance forecast?',
      baseRate: 0.5,
      evidence: 'σ²ₜ = 0.00001 + 0.08×0.0009 + 0.90×0.0004 = 0.00001 + 0.000072 + 0.00036 = 0.000442',
      correctPosterior: 0.000442,
      tolerance: 0.00003,
    },
  },

  1075: {
    id: 1075, lab: 5, mechanic: 'calibration', tier: 'elite',
    topic: 'Lab 5 Boss: Black-Scholes Under Pressure',
    fact: 'BOSS LEVEL. Live scenario: S = $105, K = $100, T = 0.5 years, r = 4%, σ = 25%. Compute: (1) d₁ and d₂. (2) Black-Scholes call price. (3) Delta. (4) You hold 200 long calls. How many shares do you need short to be delta-neutral? (5) Stock drops to $98. Estimate new delta using gamma = 0.038. How many shares do you trade to re-hedge? (6) If implied volatility rises from 25% to 30%, what happens to your vega P&L if vega per option = 0.18?',
    plain: 'This is a live options risk management problem. Every options trader can solve this under time pressure. This is the floor, not the ceiling. If you cannot do this fluently, you will not pass the first round of a quant interview.',
    stars: [900, 1110, 1385], target: 1385, coins: 115,
    isBoss: true, vrUnlock: true, vrScenario: 'options_greeks_trading_floor',
    simulatorLesson: 'bossBlackScholes',
    interviewStyle: true,
    calibrationData: {
      scenario: 'S=$105, K=$100, T=0.5, r=0.04, σ=0.25. Compute d₁ = [ln(105/100) + (0.04+0.03125)×0.5] / (0.25×0.707) = [0.04879 + 0.03563] / 0.17678 = 0.4775. Delta = N(0.4775) ≈ ?',
      baseRate: 0.5,
      evidence: 'd₁ ≈ 0.4775, N(0.4775) ≈ 0.6834',
      correctPosterior: 0.683,
      tolerance: 0.02,
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LAB 6 — INTERVIEW WAR ROOM (1076–1090)
  // ══════════════════════════════════════════════════════════════════════════

  1076: {
    id: 1076, simulatorLesson: 'interviewFormatQuiz', lab: 6, mechanic: 'match3', tier: 'elite',
    topic: 'How the Quant Interview Actually Works',
    fact: 'Top quant firm interview process: Resume screen → Online assessment (mental maths via Zetamac — target 50+, logic puzzles) → Phone screen (probability problems, betting games) → Superday (3–5 back-to-back interviews: mock trading, coding, whiteboard derivations). Jane Street gives problems intentionally too hard to solve alone — they test how you use hints and collaborate. Over two-thirds of their intern class studied CS; over a third studied maths. Finance knowledge is generally not required.',
    plain: 'You are not being tested on what you know. You are being tested on how you think. A candidate who gets halfway to the answer with clear reasoning is more useful than one who gets the right answer silently and cannot explain it.',
    stars: [600, 740, 925], target: 925, coins: 63,
    interviewStyle: true,
  },

  1077: {
    id: 1077, lab: 6, mechanic: 'memory', tier: 'elite',
    topic: 'Mental Maths at Quant Speed',
    fact: 'Zetamac benchmark: top quant candidates score 50+ correct answers in 2 minutes. Core skills: fast multiplication (split into friendly numbers: 17×13 = 17×10 + 17×3 = 170 + 51 = 221). Fast percentage calculation (7% of 340 = 7×3.4 = 23.8). Approximations for exp and ln (ln(1.1) ≈ 0.095, e^0.1 ≈ 1.105). Fraction simplification. Order-of-magnitude estimation. These are not tricks — they are fluency, built through daily deliberate practice.',
    plain: 'An interviewer who has to wait 30 seconds for you to multiply 23×14 has already mentally moved on. Mental maths is infrastructure. Everything interesting in the interview happens on top of it.',
    stars: [620, 765, 955], target: 955, coins: 66,
    simulatorLesson: 'mentalMaths',
    interviewStyle: true,
  },

  1078: {
    id: 1078, simulatorLesson: 'gameTheoryProblems', lab: 6, mechanic: 'calibration', tier: 'elite',
    topic: 'Betting and Game Theory Problems',
    fact: 'Classic betting game problems: "I flip a coin. If heads I pay you $2, if tails you pay me $1. How much would you pay to play?" (EV = 0.5×$2 - 0.5×$1 = +$0.50 per flip). "A dice game: you win the face value on 4, 5, 6 but lose $3.50 on 1, 2, 3. Play?" (EV = (4+5+6-3.5×3)/6 = (15-10.5)/6 = +$0.75). These test whether you can compute EV quickly and whether you understand variance as a separate consideration from EV.',
    plain: 'Always separate the two questions: (1) Is this positive EV? (2) Given the variance, does the EV justify the risk? An interview answer that addresses only EV without discussing variance is incomplete.',
    stars: [640, 790, 985], target: 985, coins: 69,
    interviewStyle: true,
    calibrationData: {
      scenario: 'You are offered a game: flip a fair coin. Heads: you win $3. Tails: you lose $1. What is the EV per flip? You play 100 times with a starting bankroll of $50. What is the probability of ruin?',
      baseRate: 0.5,
      evidence: 'EV = 0.5×3 + 0.5×(-1) = 1.50 - 0.50 = +$1.00 per flip. Positive EV, but negative tails outcomes create ruin risk with small bankroll.',
      correctPosterior: 1.0,
      tolerance: 0.05,
    },
  },

  1079: {
    id: 1079, lab: 6, mechanic: 'chain', tier: 'elite',
    topic: 'Solving the Conditional Regression Problem',
    fact: 'Jane Street Problem 2: X and Y are IID uniform on [0,1]. Find β in regression of Y on X given X+Y>1. Process: (1) Recognise the geometric constraint — condition restricts joint distribution to upper-right triangle. (2) Conditional density = 2 on the triangle. (3) Compute E[X], E[X²], E[XY] under the conditional distribution. (4) β = Cov(X,Y)/Var(X). Faster method: E[Y|X=x, X+Y>1] = (1-x+1)/2 = 1 - x/2. The coefficient on x is -1/2.',
    plain: 'The interview tests whether you can step back from computation. The elegant solution (conditional expectation approach) takes two lines. The brute force approach (computing all moments) takes a page. Show the interviewer you found the elegant path — then offer to verify with brute force.',
    stars: [660, 815, 1015], target: 1015, coins: 72,
    interviewStyle: true,
    simulatorLesson: 'conditionalRegression',
  },

  1080: {
    id: 1080, lab: 6, mechanic: 'match3', tier: 'elite',
    topic: 'Dynamic Programming: The Framework',
    fact: 'Dynamic programming solves problems by breaking them into overlapping subproblems and caching results (memoisation). Two conditions: (1) Optimal substructure — optimal solution contains optimal solutions to subproblems. (2) Overlapping subproblems — same subproblems arise repeatedly. Template: define state, write recursive relation, add memoisation, convert to bottom-up if needed. Time complexity typically O(n×k) where k is the range of the state variable.',
    plain: 'Without memoisation, recursive solutions recompute the same subproblem exponentially many times. With memoisation, each unique state is computed exactly once. This converts exponential to polynomial time — the difference between "impossible" and "instant".',
    stars: [680, 840, 1050], target: 1050, coins: 75,
    simulatorLesson: 'dynamicProgramming',
    interviewStyle: true,
  },

  1081: {
    id: 1081, lab: 6, mechanic: 'memory', tier: 'elite',
    topic: 'The Target Sum Problem (Jane Street Coding)',
    fact: 'Jane Street coding problem: given an array of integers and a target, count the number of ways to assign + or − to each element so the total equals the target. Brute force: depth-first search, O(2ⁿ) — fails for large inputs (TLE on 141 test cases). Fix: memoisation on state (index, running_sum) → O(n×T). Key insight: many branches reach the same (index, running_sum) through different paths — this redundancy is the inefficiency. Naming it "overlapping subproblems" and implementing the cache is the solution.',
    plain: 'The brute force failing 69/141 test cases is not failure — it demonstrates correct logic. The failure would be not knowing why it is slow. Recognising redundant subproblems, naming the fix, and implementing it cleanly: that sequence is what the interview tests.',
    stars: [700, 860, 1075], target: 1075, coins: 78,
    simulatorLesson: 'targetSum',
    interviewStyle: true,
  },

  1082: {
    simulatorLesson: 'complexityQuiz',
    id: 1082, lab: 6, mechanic: 'match3', tier: 'elite',
    topic: 'Complexity Analysis',
    fact: 'Time complexity — how runtime grows with input size. O(1) = constant. O(log n) = logarithmic (binary search). O(n) = linear. O(n log n) = linearithmic (merge sort). O(n²) = quadratic (nested loops). O(2ⁿ) = exponential (brute force combinatorics). Space complexity — how memory usage grows. Amortised complexity — average cost over many operations. For quant interviews: know not just the big-O but why it is that complexity and what the constant factors are.',
    plain: 'O(2ⁿ) with n=40 is 10¹². O(n²) with n=40 is 1,600. O(n×T) with n=40 and T=1000 is 40,000. The memoised solution fits easily in memory and runs instantly. The brute force solution would take longer than the age of the universe. Knowing why is what the interviewer wants.',
    stars: [720, 885, 1105], target: 1105, coins: 81,
    interviewStyle: true,
  },

  1083: {
    simulatorLesson: 'communicationQuiz',
    id: 1083, lab: 6, mechanic: 'calibration', tier: 'elite',
    topic: 'Communicating Your Reasoning',
    fact: 'The interview criterion that separates candidates most: how you explain your thinking. Before writing anything, explain your logic. "This is a conditional probability problem. I want to find P(Y|X=x) where the conditioning event is X+Y>1." Talking through your logic before writing is the primary signal. A candidate who gets the right answer silently is less useful than one who gets halfway there with clear reasoning.',
    plain: 'Quants work in teams. They communicate models to traders, to risk managers, to regulators. An interviewer hiring for Jane Street is also asking: "Can this person explain a complex idea clearly under pressure?" Silence is failure even when the maths is right.',
    stars: [740, 910, 1135], target: 1135, coins: 84,
    interviewStyle: true,
    calibrationData: {
      scenario: 'You are solving a problem and get stuck after 3 minutes. The interviewer says "you can ask for a hint." What should you communicate before asking?',
      baseRate: 0.5,
      evidence: 'Say what you have tried, where you are stuck, and what your next instinct is — then ask for a hint about that specific obstacle.',
      correctPosterior: 0.95,
      tolerance: 0.1,
    },
  },

  1084: {
    id: 1084, simulatorLesson: 'lmsrCalc', lab: 6, mechanic: 'match3', tier: 'elite',
    topic: 'Prediction Markets and LMSR',
    fact: 'The Logarithmic Market Scoring Rule (LMSR) powers automated prediction markets. Cost function for n outcomes: C(q) = b·ln(Σexp(qᵢ/b)). Price of outcome i: pᵢ = exp(qᵢ/b) / Σexp(qⱼ/b). This is the softmax function — the same function powering every neural network classifier. Prices always sum to 1, lie in (0,1), and the market maker\'s maximum loss is bounded at b·ln(n). Polymarket uses this mechanism.',
    plain: 'A prediction market is a Bayesian aggregation mechanism. Every trade reveals information. The LMSR ensures the market always has liquidity at a bounded loss to the market maker. The price at any moment is the market\'s best estimate of the probability.',
    stars: [760, 935, 1165], target: 1165, coins: 87,
    interviewStyle: true,
  },

  1085: {
    id: 1085, simulatorLesson: 'interviewTypesQuiz', lab: 6, mechanic: 'memory', tier: 'elite',
    topic: 'The Interview Toolkit: Problem Types',
    fact: 'Jane Street problem categories: (1) Probability and combinatorics — conditional probability, EV, counting. (2) Statistics — hypothesis testing, regression, estimators. (3) Linear algebra — matrix properties, eigenvalues, PSD conditions. (4) Calculus — derivatives, optimisation, stochastic calculus concepts. (5) Coding — data structures, dynamic programming, complexity. (6) Betting games — Kelly, EV, variance analysis. (7) Market structure — order books, arbitrage, market making.',
    plain: 'The Green Book (Zhou\'s Practical Guide) covers categories 1, 2, 6. LeetCode covers category 5. Strang covers category 3. This programme covers all of them. There are no mystery categories. The content is known. What separates candidates is fluency and composure under time pressure.',
    stars: [780, 960, 1195], target: 1195, coins: 90,
    interviewStyle: true,
  },

  1086: {
    id: 1086, lab: 6, mechanic: 'chain', tier: 'elite',
    topic: 'The Market Making Interview Problem',
    fact: 'Classic market making problem: "Make me a market on the number of piano tuners in Chicago." Process: (1) Estimate Chicago population ≈ 2.7M people. (2) Estimate average household size ≈ 2.5, giving ≈ 1.1M households. (3) Estimate fraction owning pianos ≈ 10%, giving ≈ 110K pianos. (4) Each piano tuned once per year. (5) Tuner works 8h/day, takes 2h per piano, so ≈ 4 pianos/day × 250 days = 1,000 pianos/year. (6) Answer: 110K / 1,000 ≈ 110 tuners. Bid: 80. Offer: 150.',
    plain: 'Fermi estimation is applied probability: decompose an uncertain quantity into multiplied estimates, each of which you can bound. The width of your market reflects your uncertainty. Overconfident narrow markets invite adversarial trading. Appropriately wide markets protect you while maintaining two-sided liquidity.',
    stars: [800, 985, 1225], target: 1225, coins: 93,
    interviewStyle: true,
    simulatorLesson: 'marketMaking',
  },

  1087: {
    simulatorLesson: 'stuckStrategyQuiz',
    id: 1087, lab: 6, mechanic: 'match3', tier: 'elite',
    topic: 'Handling Being Stuck',
    fact: 'When stuck in a quant interview: do not stop and say "I don\'t know." The interviewer has said explicitly: asking for a hint is acceptable, stopping is not. Correct response when stuck: (1) Verbalise what you have tried and why it is not working. (2) Identify the specific step you are stuck on. (3) Try a different approach and say what it is. (4) After genuine effort — maybe 2 minutes of visible work — ask for a hint about the specific obstacle. (5) With the hint, incorporate it cleanly and keep going.',
    plain: 'The gap between people who pass and people who do not is rarely raw mathematical ability. It is whether they can show their thinking clearly, adapt when pushed, and stay composed when the first approach fails. These are coachable skills, not innate traits.',
    stars: [820, 1010, 1260], target: 1260, coins: 96,
    interviewStyle: true,
  },

  1088: {
    simulatorLesson: 'vrBriefingQuiz',
    id: 1088, lab: 6, mechanic: 'match3', tier: 'elite',
    topic: 'The VR Simulation Briefing',
    fact: 'The Jane Street VR Interview Simulation in this programme replicates the exact format: 90 minutes, 3 problems, real-time AI feedback on reasoning quality. Problem 1 will be a probability or linear algebra problem requiring structural insight before calculation. Problem 2 will require conditional reasoning and a faster elegant solution. Problem 3 will be a coding problem with a brute force phase and an optimisation phase. Your score reflects reasoning process, not just correct answers.',
    plain: 'This is the capstone of the Trader Track. You have built every tool the interview requires. The simulation tests whether the tools have become fluency.',
    stars: [840, 1035, 1290], target: 1290, coins: 99,
    interviewStyle: true,
    vrUnlock: true, vrScenario: 'jane_street_interview_simulation',
  },

  1089: {
    simulatorLesson: 'readinessCalibration',
    id: 1089, lab: 6, mechanic: 'calibration', tier: 'elite',
    topic: 'Pre-Boss Calibration: Am I Ready?',
    fact: 'Self-assessment before the boss: Can you compute Black-Scholes delta in your head to two decimal places? Can you state Itô\'s lemma from memory and explain why the extra term exists? Can you solve a conditional probability problem using both the brute-force and elegant approaches? Can you write memoised DFS in under 10 minutes? Can you explain your reasoning out loud throughout? Can you ask good questions when stuck? If yes to all: you are ready.',
    plain: 'The boss is not a test of whether you can produce the answer in isolation. It is a test of whether you can produce the answer while communicating your reasoning under time pressure. The content is the same. The conditions are not.',
    stars: [860, 1060, 1320], target: 1320, coins: 102,
    interviewStyle: true,
    calibrationData: {
      scenario: 'On a scale of 0 to 1, how confident are you that you can pass a Jane Street phone screen right now? Be honest — calibration matters here.',
      baseRate: 0.5,
      evidence: 'Honest self-assessment. If you completed all labs: 0.6–0.8 is appropriate. Perfect confidence (1.0) after one programme is overconfidence.',
      correctPosterior: 0.70,
      tolerance: 0.20,
    },
  },

  1090: {
    simulatorLesson: 'janeStreetBoss',
    id: 1090, lab: 6, mechanic: 'calibration', tier: 'elite',
    topic: 'War Room Boss: The Jane Street Simulation',
    fact: 'BOSS LEVEL — FINAL. Three problems, one session. Problem 1: n random variables, equal pairwise correlation ρ. Find the valid range of ρ. Explain your reasoning before writing anything. Problem 2: X and Y are IID uniform on [0,1]. Find E[Y | X=x, X+Y>1]. Find β in the regression of Y on X conditional on X+Y>1. Show the fast path. Problem 3: Given array nums and target, count assignments of +/- to reach target. Write the brute force first. Identify the bottleneck. Implement the memoised solution. Analyse complexity.',
    plain: 'This is the floor of what a Jane Street interview asks. Not the ceiling — the warm-up problems. If you pass this boss, you are interview-ready. If you unlock the VR simulation, you train under the full pressure conditions. The programme is complete.',
    stars: [1000, 1250, 1550], target: 1550, coins: 150,
    isBoss: true, isFinalBoss: true, vrUnlock: true, vrScenario: 'jane_street_interview_simulation',
    interviewStyle: true,
    calibrationData: {
      scenario: 'For the correlation matrix problem with n=10, what is the minimum valid value of ρ? Show your reasoning using eigenvalue analysis.',
      baseRate: 0.5,
      evidence: 'Equicorrelation matrix eigenvalues: λ₁ = 1+(n-1)ρ, λ₂ = 1-ρ. PSD requires λ₂ ≥ 0 → ρ ≤ 1 and λ₁ ≥ 0 → ρ ≥ -1/(n-1). With n=10: min ρ = -1/9 ≈ -0.111.',
      correctPosterior: -0.111,
      tolerance: 0.01,
    },
  },
};

// ── Accessors ─────────────────────────────────────────────────
export const getQuantLevel = (id: number): QuantLevel | undefined => QUANT_LEVELS[id];
export const getQuantLevelsForLab = (labId: number): QuantLevel[] =>
  Object.values(QUANT_LEVELS).filter(l => l.lab === labId);
export const getAllQuantLevels = (): QuantLevel[] => Object.values(QUANT_LEVELS);

// Adapt QuantLevel to the Level interface expected by LessonScreen / useLessonEngine
export const quantLevelToLevel = (ql: QuantLevel): import('./levels').Level => ({
  id: ql.id,
  mechanic: (ql.mechanic === 'calibration' ? 'memory' : ql.mechanic) as import('./levels').Mechanic,
  tier: ql.tier === 'elite' ? 'pro' : ql.tier === 'foundation' ? 'beginner' : ql.tier as import('./levels').Tier,
  topic: ql.topic,
  fact: ql.fact,
  plain: ql.plain,
  stars: ql.stars,
  target: ql.target,
  coins: ql.coins,
  isBoss: ql.isBoss,
  isFinalBoss: ql.isFinalBoss,
  simulatorLesson: ql.simulatorLesson,
  links: ql.links,
  glossaryWord: ql.glossaryWord,
});

// ══════════════════════════════════════════════════════════════════════════
// LAB 0 — NUMBERS ROOM (990–999)
// Pre-requisite foundation: descriptive stats, distributions, CLT
// No assumed knowledge. Fully beginner. Finance examples throughout.
// ══════════════════════════════════════════════════════════════════════════

const LAB0_LEVELS: Record<number, QuantLevel> = {

  990: {
    id: 990, lab: 0, mechanic: 'match3', tier: 'beginner',
    topic: 'What Is Data? What Is a Dataset?',
    fact: 'A dataset is a collection of measured values. Each value is one observation. In finance, a common dataset is daily returns — the percentage gain or loss each day for a stock or strategy. Example: Bitcoin\'s last 7 daily returns: [+2.1%, -0.8%, +3.4%, -1.2%, +0.5%, -2.9%, +1.1%]. Each number is one observation. The whole list is the dataset. Before you can do any statistics, you need to see your data as a list of measurements — not a single answer, but a whole distribution of outcomes.',
    plain: 'Think of a dataset like a scoreboard after 100 basketball games. Each game\'s score is one observation. You need all 100 scores to say anything meaningful about the team\'s performance. One game tells you almost nothing. The collection is where the information lives.',
    stars: [300, 400, 500], target: 500, coins: 25,
  },

  991: {
    id: 991, lab: 0, mechanic: 'memory', tier: 'beginner',
    topic: 'Mean: The Centre of the Data',
    fact: 'The mean (average) is the sum of all values divided by the number of values. Formula: μ = (x₁ + x₂ + ... + xₙ) / n. For Bitcoin\'s 7 returns [+2.1, -0.8, +3.4, -1.2, +0.5, -2.9, +1.1]: sum = 2.2, mean = 2.2 / 7 = +0.31% per day. The mean is the balance point of the data — if you placed weights at each value on a number line, the mean is where the line would balance. In finance, the mean daily return is the expected value of one day\'s outcome.',
    plain: 'The mean answers: "If I had to guess one number that represents all of these, what would it be?" It is the centre of gravity. A strategy with a positive mean return is profitable on average — but average alone tells you nothing about risk. That\'s what the next concept is for.',
    stars: [320, 420, 520], target: 520, coins: 27,
    simulatorLesson: 'meanCalculator',
  },

  992: {
    id: 992, lab: 0, mechanic: 'memory', tier: 'beginner',
    topic: 'Variance and Standard Deviation: How Spread Out Is the Data?',
    fact: 'Variance measures how far each value is from the mean, on average (squared). Formula: σ² = Σ(xᵢ − μ)² / n. Standard deviation σ = √variance. It is in the same units as the original data. For the 7 returns above (mean = 0.31%): each return\'s squared distance from 0.31% is calculated, averaged, and square-rooted. Result ≈ 2.1%. This means returns typically deviate from the mean by about ±2.1 percentage points per day. Low σ = consistent. High σ = volatile.',
    plain: 'Mean tells you where the centre is. Standard deviation tells you how wide the spread is. Two strategies can have the same mean return of 1% per day — but one swings between -5% and +7%, the other between +0.5% and +1.5%. They are completely different risks. Standard deviation captures that difference. In finance, σ is synonymous with volatility.',
    stars: [340, 440, 550], target: 550, coins: 30,
    simulatorLesson: 'stdDevCalculator',
  },

  993: {
    id: 993, lab: 0, mechanic: 'match3', tier: 'beginner',
    topic: 'What Is a Distribution?',
    fact: 'A distribution describes all the possible values a variable can take and how likely each one is. Instead of a single number, a distribution is a shape. X-axis: the possible values. Y-axis: how often each value occurs (frequency or probability). You can see the centre (where it peaks), the spread (how wide it is), the skew (whether it leans left or right), and the tails (how often extreme values occur). Every random variable — a stock return, a coin flip outcome, a weather reading — has a distribution.',
    plain: 'Imagine plotting all 252 daily returns for a stock across one year as a histogram. Some returns cluster near 0%. A few are very positive or very negative. The shape of that histogram is the distribution. It tells you not just what typically happens, but how likely the extremes are.',
    stars: [360, 460, 575], target: 575, coins: 32,
    simulatorLesson: 'distributionShape',
  },

  994: {
    id: 994, lab: 0, mechanic: 'memory', tier: 'beginner',
    topic: 'The Normal Distribution',
    fact: 'The normal distribution (Gaussian) is a bell-shaped, symmetric distribution fully described by two numbers: mean μ (centre of the bell) and standard deviation σ (width of the bell). Properties: 68% of values fall within 1σ of the mean. 95% within 2σ. 99.7% within 3σ. These are called the 68-95-99.7 rule. Example: if daily stock returns are normal with μ=0% and σ=1%, then 95% of days have returns between -2% and +2%. A 5-sigma event (return outside ±5%) should happen roughly once in 3.5 million days.',
    plain: 'The bell curve is the most famous shape in statistics because it naturally emerges when many independent random things add together. It is symmetric, meaning gains and losses are equally likely around the centre. The standard deviation is the "ruler" of the bell — it tells you exactly what fraction of outcomes fall within any given distance of the mean.',
    stars: [380, 480, 600], target: 600, coins: 35,
    simulatorLesson: 'normalDistribution',
  },

  995: {
    id: 995, lab: 0, mechanic: 'match3', tier: 'beginner',
    topic: 'Z-Scores: How Unusual Is This Number?',
    fact: 'A z-score measures how many standard deviations a value is from the mean: z = (x − μ) / σ. A z-score of 0 means the value equals the mean. A z-score of +2 means the value is 2 standard deviations above the mean — unusual but not extreme. A z-score of +5 means 5 standard deviations above — extremely rare under normality. In finance: if a strategy\'s Sharpe ratio is the z-score of its return relative to its volatility (roughly), then a Sharpe of 2 means the strategy is 2 standard deviations better than zero return.',
    plain: 'Z-scores put everything on the same scale. A return of +4% might be ordinary for a volatile crypto asset (z=0.5) but extraordinary for a government bond (z=8.0). Z-scores let you compare apples to oranges by asking the same question about both: how unusual is this, relative to normal variation?',
    stars: [400, 500, 625], target: 625, coins: 37,
  },

  996: {
    id: 996, lab: 0, mechanic: 'match3', tier: 'beginner',
    topic: 'What Is Correlation?',
    fact: 'Correlation ρ measures how two variables move together, on a scale of -1 to +1. ρ = +1: perfect positive correlation — when X goes up, Y always goes up by a proportional amount. ρ = -1: perfect negative correlation — when X goes up, Y always goes down. ρ = 0: no linear relationship. Example: Bitcoin and Ethereum have ρ ≈ 0.9 — they tend to move together strongly. Gold and stocks have ρ ≈ -0.1 — mostly independent, slight tendency to move opposite. Correlation is about the relationship between two variables, not causation.',
    plain: 'Correlation answers: if X rises, does Y tend to rise too? And by how much, relatively speaking? It is the number that tells you whether two assets are "the same bet in disguise" (ρ near +1), true diversifiers (ρ near 0 or -1), or something in between. Portfolio construction depends entirely on getting correlation right.',
    stars: [420, 520, 650], target: 650, coins: 40,
    simulatorLesson: 'correlationIntuition',
  },

  997: {
    id: 997, lab: 0, mechanic: 'chain', tier: 'beginner',
    topic: 'Samples vs Populations: The Core Inference Problem',
    fact: 'A population is the complete set of all possible observations — e.g. every daily return Bitcoin will ever have. A sample is the subset you actually observe — e.g. the last 3 years of returns. You can never observe the population. You can only infer it from samples. This creates estimation error: your sample mean and sample standard deviation are estimates of the true (population) mean and std dev. With more data, estimates improve. With less data, estimates are noisy. Virtually every statistical conclusion in finance is an inference from a sample to a population.',
    plain: 'You test a trading strategy on 2 years of data. You find it returns 15% per year. Is that the true edge, or did you just happen to test it during a lucky period? This is the sample vs population problem. Statistics gives you tools to quantify how confident you should be that your sample reflects the true underlying distribution.',
    stars: [440, 540, 675], target: 675, coins: 42,
  },

  998: {
    id: 998, lab: 0, mechanic: 'memory', tier: 'beginner',
    topic: 'The Central Limit Theorem',
    fact: 'The Central Limit Theorem (CLT): if you take a large enough sample from any distribution (regardless of its shape) and compute the sample mean, the distribution of those sample means will be approximately normal. Specifically: the sampling distribution of the mean has μ_x̄ = μ (same centre) and σ_x̄ = σ / √n (standard error — shrinks with more data). This is why the normal distribution appears everywhere in statistics even when individual data points are not normally distributed.',
    plain: 'Individual stock returns might be fat-tailed, skewed, and non-normal. But if you average 100 days of returns, that average is approximately normally distributed. The CLT is why hypothesis tests work, why confidence intervals have their formulas, and why p-values are based on the normal distribution even for messy real-world data. It is arguably the most important theorem in applied statistics.',
    stars: [460, 560, 700], target: 700, coins: 45,
    simulatorLesson: 'centralLimitTheorem',
  },

  999: {
    id: 999, lab: 0, mechanic: 'calibration', tier: 'beginner',
    topic: 'Numbers Room Boss: Putting It All Together',
    fact: 'BOSS LEVEL. A trading strategy produces daily returns. You observe 252 days of data: sample mean = +0.08% per day, sample standard deviation = 1.2% per day. Questions: (1) What is the annualised mean return? (approx. 0.08% × 252). (2) What is the annualised standard deviation? (1.2% × √252). (3) What is the Sharpe ratio (assume risk-free rate ≈ 0)? (4) A return of -4.8% occurs. What is the z-score? Is this unusual? (5) How confident should you be that the true mean is positive? The CLT tells you the standard error of your mean estimate is σ / √n = 1.2% / √252 ≈ 0.076% per day.',
    plain: 'This is what statistics actually does in finance: it takes raw data, describes it (mean, std dev), asks how reliable those descriptions are (standard error, CLT), and quantifies confidence. Every single concept in this boss — mean, standard deviation, z-score, CLT, standard error — you will use every day as a quant.',
    stars: [500, 620, 775], target: 775, coins: 55,
    isBoss: true,
    calibrationData: {
      scenario: 'Mean = +0.08%/day, σ = 1.2%/day, n = 252 days. A day with -4.8% return occurs. What is the z-score?',
      baseRate: 0,
      evidence: 'z = (x - μ) / σ = (-4.8% - 0.08%) / 1.2% = -4.88% / 1.2% ≈ -4.07',
      correctPosterior: -4.07,
      tolerance: 0.3,
    },
  },
};

// ─── LAB 7: PRACTITIONER'S TOOLKIT (1091–1105) ────────────────────────────────
const LAB7_LEVELS: Record<number, QuantLevel> = {

  1091: {
    id: 1091, simulatorLesson: 'pythonStackQuiz', lab: 7, mechanic: 'match3', tier: 'elite',
    topic: 'The Python Quant Stack: Overview',
    fact: 'Every quant researcher needs a core Python stack. Data layer: pandas (tabular data), polars (10–50× faster on large datasets). Numerics: numpy, scipy. Statistics: statsmodels. Optimisation: cvxpy (convex problems), scipy.optimize (general). ML tabular: xgboost, lightgbm, catboost. ML deep: pytorch. Derivatives: QuantLib (industry-grade C++ backend). Backtesting: NautilusTrader (production-grade), vectorbt (fast research). Quant research: Microsoft Qlib (17K+ stars, AI-oriented). RL for trading: FinRL (10K+ stars). You do not need all of these immediately. You need to know what each one does and when to reach for it.',
    plain: 'Think of this stack like a kitchen. pandas and polars are your cutting board and knife — you use them every day. cvxpy is your oven — powerful but you only need it for specific jobs. QuantLib is your specialist equipment — industrial grade, steep learning curve, non-negotiable for derivatives work. Know what each tool does before you need it.',
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1092: {
    id: 1092, simulatorLesson: 'pandasPolarsQuiz', lab: 7, mechanic: 'memory', tier: 'elite',
    topic: 'pandas vs polars: When to Use Each',
    fact: 'pandas is the industry standard. Every quant knows it. Its API is familiar, its documentation is extensive, and it integrates with everything. polars is 10–50× faster on large datasets because it is written in Rust and uses columnar memory format (Apache Arrow). Use pandas when: datasets fit comfortably in memory (<1GB), you need maximum ecosystem compatibility, you are doing exploratory work. Use polars when: large datasets (1GB+), performance-critical pipelines, parallel computation needed. In practice: most quant researchers use pandas for research and prototyping; production pipelines increasingly use polars. Both produce identical results — polars just does it faster.',
    plain: 'pandas is a reliable family car. polars is a sports car. For a trip to the shops (most research tasks), either works. For a 1,000-mile road trip under time pressure (production data pipelines), the sports car wins. Learn pandas first — the ecosystem demands it. Add polars when you hit performance walls.',
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1093: {
    id: 1093, lab: 7, mechanic: 'match3', tier: 'elite',
    topic: 'cvxpy: Portfolio Optimisation in Code',
    fact: 'cvxpy is a Python library for convex optimisation. For Markowitz portfolio construction: define weights w as a cvxpy Variable. Objective: Minimize(quad_form(w, cov_matrix)). Constraints: [mu @ w >= target_return, sum(w) == 1, w >= -0.1, w <= 0.3]. prob = Problem(objective, constraints). prob.solve(). The solution w.value gives optimal weights. cvxpy handles the mathematical heavy lifting — you specify what you want (objective + constraints) and it finds the solution. Key insight: you must verify your problem is convex for cvxpy to work. Minimising portfolio variance is convex. Maximising Sharpe ratio directly is not (it is quasi-convex — requires a different approach).',
    plain: 'cvxpy lets you write portfolio optimisation in near-mathematical notation. You say "minimise this, subject to these rules" and it solves it. Without cvxpy you would implement a quadratic programming solver from scratch — weeks of work. With cvxpy it is 10 lines of code. This is what gemchanger means when he says tools have democratised access. The edge is no longer in building the solver. The edge is in knowing what problem to solve.',
    stars: [520, 640, 800], target: 800, coins: 58,
    simulatorLesson: 'markowitzOptimiser',
  },

  1094: {
    simulatorLesson: 'quantlibQuiz',
    id: 1094, lab: 7, mechanic: 'memory', tier: 'elite',
    topic: 'QuantLib: The Industry-Grade Derivatives Library',
    fact: 'QuantLib is the open-source gold standard for quantitative finance — used at banks, hedge funds, and central banks globally. Written in C++ with Python bindings. What it does: price virtually any derivative instrument (options, bonds, swaps, exotics), bootstrap yield curves, model interest rate term structure, compute Greeks analytically and numerically, calibrate models (Heston, Hull-White, SABR) to market data. Why it matters: if you work on a derivatives desk or in risk management, you will interact with QuantLib or systems built on it. Learning it demonstrates serious commitment. The learning curve is steep — the documentation assumes you already know the theory. That is why the math labs come first.',
    plain: 'QuantLib is the financial industry\'s most-used open-source library. It is not beginner-friendly — it assumes you understand what you are pricing before you try to price it. But if you can price a barrier option in QuantLib, you have demonstrated both mathematical understanding and practical skill. That combination is rare and valuable.',
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1095: {
    id: 1095, simulatorLesson: 'backtestFrameworkQuiz', lab: 7, mechanic: 'chain', tier: 'elite',
    topic: 'Backtesting: NautilusTrader vs vectorbt',
    fact: 'Two dominant open-source backtesting frameworks serve different needs. vectorbt: built on numpy/pandas, designed for speed on vectorised strategies. Runs thousands of parameter combinations in seconds. Best for: research, strategy scanning, parameter optimisation. Simpler API, faster iteration. NautilusTrader: production-grade, event-driven, Rust core with Python API. Handles real order book simulation, realistic fill modelling, multiple instruments. Best for: strategies that require precise execution modelling, near-production testing. The critical backtesting mistakes that inflate results: look-ahead bias (using future data in signals), survivorship bias (testing only on assets that survived), ignoring transaction costs, overfitting to the test period. A strategy that looks great in backtest but fails live has almost always committed at least one of these errors.',
    plain: 'vectorbt is for scanning — you test 10,000 parameter combinations in an afternoon. NautilusTrader is for validation — you take your best candidate strategy and stress-test it against realistic market microstructure. Use vectorbt to find candidates. Use NautilusTrader to trust them.',
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1096: {
    id: 1096, simulatorLesson: 'freeDataQuiz', lab: 7, mechanic: 'match3', tier: 'elite',
    topic: 'Free Data Sources: yfinance, Finnhub, Alpha Vantage',
    fact: 'yfinance: pulls historical OHLCV data from Yahoo Finance. Free, easy, widely used for research. Limitations: delayed data, occasional gaps, no tick data. Usage: yf.download("AAPL", start="2020-01-01"). Finnhub: free tier gives 60 API calls/minute. Covers stocks, forex, crypto. Has fundamental data, earnings, and news. Alpha Vantage: free tier with API key. Daily/weekly/monthly OHLCV, technical indicators, forex, crypto. Limitation: 5 requests/minute on free tier. For crypto specifically: Alchemy provides free tier with archive access to Ethereum node data — essential for on-chain strategy research. Reality check: free data is good enough for learning and initial research. Production trading requires paid data. Do not assume free data has the same quality as Bloomberg.',
    plain: 'Free data sources are training wheels. They teach you how to work with financial data without billing you. But they have survivorship bias, missing data, and corporate action errors that will silently corrupt your backtest if you are not careful. Start with yfinance. Graduate to paid sources when your strategy is worth paying for data.',
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1097: {
    id: 1097, simulatorLesson: 'paidDataQuiz', lab: 7, mechanic: 'memory', tier: 'elite',
    topic: 'Paid Data: Polygon.io, Bloomberg, Refinitiv',
    fact: 'Polygon.io: $199/month for sub-20ms latency US equities data. Tick data, options data, news. The sweet spot for serious independent researchers and small funds. Tiingo: cheaper than Polygon, good for daily data and fundamental data. Bloomberg Terminal: ~$32,000/year. Industry standard at banks and large funds. Not realistic for individuals but you will use it on desks. Refinitiv (formerly Reuters): comparable to Bloomberg. FactSet: strong on fundamentals and earnings data. The data hierarchy matters: if you are competing against firms with Bloomberg-grade data using yfinance, you are at a structural disadvantage on strategies that depend on data quality. However: for math-heavy strategies (vol arbitrage, statistical arb, derivatives pricing), the data quality gap is less important than the model quality gap. Sharpen your math first.',
    plain: 'Bloomberg is the gold standard and $32K/year keeps most individuals out. Polygon.io at $199/month is the realistic entry point for serious research. But the honest truth is: the strategies where data quality creates the most edge are also the strategies where the largest funds have the most advantage. Focus on strategies where your math and model quality creates edge — that is more democratically accessible.',
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1098: {
    id: 1098, lab: 7, mechanic: 'match3', tier: 'elite',
    topic: 'ML for Finance: xgboost, PyTorch, and Microsoft Qlib',
    fact: 'Tree-based models (xgboost, lightgbm, catboost) dominate tabular financial data. Why: they handle mixed feature types, missing data, nonlinear relationships, and do not require feature scaling. They also give feature importance, which is interpretable. xgboost is the default — if you do not have a reason to use something else, start here. PyTorch is the deep learning framework of choice in quant research (over TensorFlow). Used for: time series models (LSTMs, transformers), alternative data processing (NLP on earnings calls, image recognition on satellite data), reinforcement learning. Microsoft Qlib is an AI-oriented quantitative investment platform — it handles data pipeline, alpha factor library, backtesting, and model training in a unified framework. 17K+ GitHub stars. FinRL is a framework specifically for reinforcement learning for trading, built on top of OpenAI Gym. The warning: ML models in finance are particularly prone to overfitting. Financial data has low signal-to-noise ratio, limited samples relative to features, and non-stationarity. A model that fits historical data perfectly is almost certainly overfit.',
    plain: 'xgboost is your hammer — reach for it first on any tabular prediction task. PyTorch is your power tool — necessary for deep learning but requires more setup. Qlib is your workshop — it pre-builds the infrastructure so you can focus on the models. The most important ML skill in finance is not building complex models. It is detecting overfitting before you deploy capital.',
    stars: [520, 640, 800], target: 800, coins: 58,
    simulatorLesson: 'pythonToolSelector',
  },

  1099: {
    simulatorLesson: 'solverSelectionQuiz',
    id: 1099, lab: 7, mechanic: 'memory', tier: 'elite',
    topic: 'Solvers: Gurobi, OR-Tools, and Combinatorial Optimisation',
    fact: 'Some optimisation problems in finance are not convex and cannot be solved by cvxpy. Combinatorial problems — integer programming, mixed-integer programming (MIP) — require specialised solvers. Gurobi: the fastest commercial MIP solver available. Free academic license (requires .edu email or academic affiliation). Essential for: combinatorial arbitrage across thousands of instruments, portfolio construction with integer constraints (minimum lot sizes), execution optimisation. Google OR-Tools: strongest free solver without academic restriction. Slower than Gurobi but freely usable in commercial settings. PuLP and Pyomo: Python modelling interfaces that can call either Gurobi or OR-Tools as the backend. When you need them: if your portfolio construction involves "hold exactly N assets" or "minimum position of $10,000 or zero", these are integer constraints and you need a MIP solver.',
    plain: 'Most portfolio problems are continuous — weights can be any fraction. Real trading adds integer constraints: you cannot hold 0.7 of a share. The moment you add "hold N lots minimum or nothing" to your constraints, you leave the world of cvxpy and enter the world of Gurobi. Get the academic license while you are in school — it is free and the commercial license costs tens of thousands.',
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1100: {
    simulatorLesson: 'competitionStratQuiz',
    id: 1100, lab: 7, mechanic: 'chain', tier: 'elite',
    topic: 'Competitions: WorldQuant BRAIN, Jane Street, Citadel',
    fact: 'Three competitions worth your time as a quant candidate. WorldQuant BRAIN: 100,000+ users globally. You submit alpha signals (predictive factors) against real market data. WorldQuant pays for alphas that generate real returns after going live. Best way to build a verifiable track record before your first job — you can point to live alpha performance. Jane Street Kaggle: $100K prize. Prestigious. Being a finalist is a resume line that gets you past resume screens at every top fund. Jane Street monthly puzzles: above interview difficulty, posted on their website. Solving them is not expected but demonstrates serious engagement. Citadel Datathon: fast-track to employment for participants. Citadel runs these specifically to identify candidates. Entry-level offers come directly out of Datathons. The competitions are not just prizes — they are the best alternative to a PhD for demonstrating capability to firms that normally filter by education.',
    plain: 'WorldQuant BRAIN is the most underrated career accelerator for quant candidates who did not go to MIT or Oxford. You can have live alpha performance verified by a real fund before your first interview. That is a different conversation than "I built this backtest." Judges can verify. Interviewers cannot fake it away.',
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1101: {
    simulatorLesson: 'mathReadingQuiz',
    id: 1101, lab: 7, mechanic: 'match3', tier: 'elite',
    topic: 'The Reading List: Mathematics',
    fact: 'In order of priority for a quant trader. (1) Blitzstein & Hwang — Introduction to Probability (free PDF from Harvard). Every problem in Chapters 1–6. The best probability textbook written. (2) Wasserman — All of Statistics, Chapters 1–13. Rigorous but readable. (3) Strang — Introduction to Linear Algebra + MIT 18.06 lectures (free on YouTube). Non-negotiable. Watch all lectures. (4) Boyd & Vandenberghe — Convex Optimization (free PDF from Stanford). Chapters 1–5 are sufficient for most quant applications. (5) Shreve — Stochastic Calculus for Finance I & II. The gold standard. Hardest on the list. Read it after you understand the concepts from Lab 5 — the app teaches intuition, Shreve provides the formal proofs. Alternative to Shreve: Arguin — A First Course in Stochastic Calculus (newer, more accessible). All five of the foundational math textbooks are free in PDF form from their university authors.',
    plain: 'These five books are the curriculum gemchanger is describing, formalised. The app gives you the intuition and the simulators build the procedural skill. The books give you the rigour that lets you prove things to interviewers rather than just stating them. You do not need to read all five before your first interview — but you should have started Blitzstein.',
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1102: {
    simulatorLesson: 'financeReadingQuiz',
    id: 1102, lab: 7, mechanic: 'memory', tier: 'elite',
    topic: 'The Reading List: Quant Finance and Interview Prep',
    fact: 'Quant finance books (in order of relevance for traders): Hull — Options, Futures, and Other Derivatives. The standard reference for derivatives. Every term on a derivatives desk uses Hull. Natenberg — Option Volatility and Pricing. More practical than Hull for options traders specifically. López de Prado — Advances in Financial Machine Learning. The definitive book on ML applied rigorously to finance. Read this after completing the statistics and ML labs. Ernest Chan — Quantitative Trading. Practical guide to systematic trading for individuals. Interview prep books: Zhou — Practical Guide to Quantitative Finance Interviews (the Green Book). 200+ real problems. Most commonly cited resource across all quant job boards. Do every problem. Crack — Heard on the Street. Classic interview prep for sell-side quant roles. Joshi — Quant Job Interview Questions. Good for derivatives-focused roles. Mosteller — Fifty Challenging Problems in Probability. Older but the problems are still used in interviews.',
    plain: 'If you only buy one book for interview prep, buy the Green Book (Zhou). Every quant candidate who got a top offer has a copy. The problems are organised by topic and difficulty. Work through it systematically after completing Labs 1–6. Treat each problem like a boss level — solve it completely before checking the answer.',
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1103: {
    simulatorLesson: 'careerPathQuiz',
    id: 1103, lab: 7, mechanic: 'match3', tier: 'elite',
    topic: 'Sell-Side vs Buy-Side: Choosing Your Path',
    fact: 'Two distinct quant worlds with different cultures, compensation, and skill requirements. Sell-side (banks: Goldman, JPMorgan, Barclays): price derivatives, manage risk, validate models, regulatory compliance. Heavier on Itô calculus and PDEs. More structured career path. More predictable hours. Compensation: $150K–$350K at junior levels, slower to reach $500K+. Buy-side (hedge funds: Jane Street, Citadel, Two Sigma, DE Shaw): generate alpha, build trading strategies, exploit edges. Heavier on statistics, ML, and market microstructure. Higher variance in outcomes. Best performers earn 10–100× sell-side peers. Compensation: $300K–$500K new grad at top funds, $3M–$30M+ for star traders. The emerging hybrid role: AI/ML Quant — signal generation using deep learning, fastest-growing role in the industry (88% hiring growth in 2025). Sits at the buy-side culture but requires sell-side mathematical depth.',
    plain: 'Sell-side is a steady well-paid career. Buy-side is a high-variance bet on your own ability. The best quant traders at Jane Street earn more than most CEOs — but most people who try for buy-side roles do not get them. Know which world you are targeting before you optimise your skill stack, because the interview prep, the tools, and the books differ.',
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1104: {
    simulatorLesson: 'mistakesQuiz',
    id: 1104, lab: 7, mechanic: 'memory', tier: 'elite',
    topic: 'The Three Biggest Mistakes Quant Candidates Make',
    fact: 'Mistake 1 — Estimation error blindness. Full Kelly betting, unconstrained Markowitz, ML models with too many features all fail for the same reason: overfitting noisy parameter estimates. The math works perfectly with true parameters. You never have true parameters. The best quants are those who respect this gap most. Mistake 2 — Confusing tool access with edge. Anyone can install QuantLib, Polygon.io, and PyTorch. Technology is necessary but not sufficient. Edge lives in unique data, unique models, or unique execution — not better pip installs. Mistake 3 — Showing answers silently. In interviews, the candidate who gets the right answer without explaining their reasoning is less valuable than the candidate who gets halfway there with clear logic. Quants work in teams. They communicate models to traders and risk managers. Your verbal reasoning is being evaluated alongside your mathematics.',
    plain: 'These three mistakes come directly from gemchanger and Phosphen\'s articles. Estimation error is the silent killer of strategies that look great on paper. Tool democratisation means your alpha has to come from thinking, not software. And the interview data shows that communication of reasoning matters as much as correctness — because firms are hiring people to work with other people, not just to solve problems alone.',
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1105: {
    simulatorLesson: 'toolkitBoss',
    id: 1105, lab: 7, mechanic: 'calibration', tier: 'elite',
    topic: "Toolkit Boss: The Practitioner's Gauntlet",
    fact: "BOSS LEVEL. You are a junior quant researcher at a mid-tier fund. Your PM gives you three tasks: (1) Download 5 years of daily returns for the S&P 500 top 100 stocks using yfinance. Test whether returns are normally distributed. Fit a Student-t distribution via MLE. Report the degrees of freedom. (2) Run a Fama-French 3-factor regression on a portfolio of your choice. Report alpha, beta to market, and whether the alpha is statistically significant after Newey-West correction. (3) Construct a minimum-variance portfolio using cvxpy. Constraints: fully invested, maximum 10% in any single stock, no short positions. Compare Sharpe ratio to equal-weighted portfolio. Tools you will reach for: yfinance (data), pandas (manipulation), scipy.stats (MLE), statsmodels (regression + Newey-West), cvxpy (optimisation). These are not toy exercises. This is what a first week on a research desk looks like.",
    plain: 'The boss is not testing whether you have memorised syntax. It is testing whether you know which tool to reach for at each step and why. That judgment — knowing what problem you are solving before you open a library — is what separates a quant who can do the work from one who needs to be supervised doing it.',
    stars: [550, 680, 850], target: 850, coins: 65,
    isBoss: true,
    calibrationData: {
      scenario: 'A strategy returns 18% annually with σ=12%. The risk-free rate is 4%. You tested 200 parameter combinations. Your reported p-value is 0.03. Is this result statistically significant?',
      baseRate: 0.03,
      evidence: 'After Bonferroni correction for 200 tests: threshold = 0.05/200 = 0.00025. p=0.03 >> 0.00025. Result is NOT significant — this is almost certainly a false discovery from multiple comparisons.',
      correctPosterior: 0,
      tolerance: 0.1,
    },
  },
};

// Merge Lab 0 into the main QUANT_LEVELS export
Object.assign(QUANT_LEVELS, LAB0_LEVELS);

// Merge Lab 7 into the main QUANT_LEVELS export
Object.assign(QUANT_LEVELS, LAB7_LEVELS);

// ═══════════════════════════════════════════════════════════════════════════════
// LAB 8 — APPLIED QUANT PYTHON (1106–1125)
// Implements every math concept from Labs 0–7 in real working Python code.
// Assumes Python chapters 1–5 completed (user knows syntax).
// Each level: concept recap → write the actual implementation.
// ═══════════════════════════════════════════════════════════════════════════════

const LAB8_LEVELS: Record<number, QuantLevel> = {

  1106: {
    simulatorLesson: 'returnsImplementation',
    id: 1106, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'Returns: Simple, Log, and Annualised — in Code',
    fact: `From Lab 0 you know what a return is. Now you write the functions every quant uses every day.

Simple return: r = (P_t - P_{t-1}) / P_{t-1}
Log return: r = ln(P_t / P_{t-1})
Annualised return from daily: (1 + r_daily)^252 - 1

In pandas:
  prices = pd.Series([100, 102, 99, 104, 101])
  simple_returns = prices.pct_change().dropna()
  log_returns = np.log(prices / prices.shift(1)).dropna()
  ann_return = (1 + simple_returns.mean()) ** 252 - 1

Why log returns? They are additive across time: log(P_T/P_0) = sum of daily log returns. Simple returns compound multiplicatively. Log returns are better for statistical analysis; simple returns are correct for P&L calculations.

The sign error trap: pct_change() gives (current - previous) / previous. Never accidentally divide by the wrong price.`,
    plain: `Every quant codebase starts here. The pct_change() and np.log(prices/prices.shift(1)) patterns appear in every strategy, every backtest, every risk report. Get them exactly right once and use them forever.`,
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1107: {
    simulatorLesson: 'sharpeImplementation',
    id: 1107, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Sharpe Ratio: Write It from Scratch',
    fact: `Sharpe ratio = (mean_return - risk_free_rate) / std_return, annualised.

Full implementation:
  import numpy as np

  def sharpe_ratio(returns: np.ndarray, risk_free_annual: float = 0.04) -> float:
      """
      returns: daily log or simple returns as numpy array
      risk_free_annual: annual risk-free rate (e.g. 0.04 for 4%)
      """
      rf_daily = risk_free_annual / 252
      excess = returns - rf_daily
      if excess.std() == 0:
          return 0.0
      return (excess.mean() / excess.std()) * np.sqrt(252)

Critical details:
1. Annualisation: multiply by sqrt(252) for daily, sqrt(52) for weekly, sqrt(12) for monthly
2. Risk-free rate must be in the same frequency as returns before subtracting
3. If std is zero (all identical returns), return 0 not NaN
4. Sharpe > 1.0: good. > 2.0: very good. > 3.0: exceptional or overfit.
5. Negative Sharpe is not the same as negative returns — a high-volatility positive return can have Sharpe < 0 if it underperforms the risk-free rate.`,
    plain: `The one function every quant hiring manager expects you to write without hesitation. sqrt(252) is the annualisation constant for daily data — 252 trading days per year. If you write sqrt(365) you will be corrected.`,
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1108: {
    simulatorLesson: 'maxDrawdownImplementation',
    id: 1108, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'Maximum Drawdown: The Risk Metric Traders Actually Use',
    fact: `Maximum drawdown = largest peak-to-trough decline in the equity curve.

Implementation:
  def max_drawdown(returns: np.ndarray) -> float:
      """Returns max drawdown as a positive number (e.g. 0.23 = 23% drawdown)."""
      equity = (1 + returns).cumprod()
      rolling_max = equity.cummax()
      drawdown = (equity - rolling_max) / rolling_max
      return abs(drawdown.min())

  def calmar_ratio(returns: np.ndarray, risk_free: float = 0.04) -> float:
      """Annual return divided by max drawdown."""
      ann_ret = (1 + returns.mean()) ** 252 - 1 - risk_free
      mdd = max_drawdown(returns)
      return ann_ret / mdd if mdd > 0 else np.inf

Step by step:
1. cumprod() converts daily returns to equity curve starting at 1.0
2. cummax() tracks the running peak
3. (equity - peak) / peak gives percentage decline from peak at each point
4. min() finds the worst point — this is max drawdown

Typical benchmarks: < 10% = low risk strategy. 10-20% = moderate. > 30% = most investors will not tolerate. The 2020 COVID crash caused 34% drawdown in the S&P 500.`,
    plain: `Sharpe tells you return per unit of volatility. Max drawdown tells you the worst experience a real investor would have lived through. A strategy with Sharpe 2.0 but 40% drawdown is undeployable — no fund can survive the redemptions. Always report both.`,
    stars: [500, 620, 775], target: 775, coins: 55,
  },

  1109: {
    simulatorLesson: 'bayesianUpdaterCode',
    id: 1109, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Bayesian Updater: Implement Bayes from Lab 1',
    fact: `In Lab 1 you learned P(H|E) = P(E|H) * P(H) / P(E). Now you write the class.

  class BayesianUpdater:
      def __init__(self, prior: float):
          """prior: initial probability of hypothesis (0 to 1)"""
          if not 0 < prior < 1:
              raise ValueError("Prior must be strictly between 0 and 1")
          self.belief = prior

      def update(self, likelihood_given_true: float, likelihood_given_false: float) -> float:
          """
          Update belief given new evidence.
          likelihood_given_true: P(evidence | hypothesis is true)
          likelihood_given_false: P(evidence | hypothesis is false)
          Returns updated probability.
          """
          p_evidence = (likelihood_given_true * self.belief +
                        likelihood_given_false * (1 - self.belief))
          self.belief = (likelihood_given_true * self.belief) / p_evidence
          return self.belief

      def reset(self, new_prior: float):
          self.belief = new_prior

Usage — testing whether a fund has real alpha:
  b = BayesianUpdater(prior=0.10)  # 10% prior: most funds have no alpha
  b.update(0.70, 0.30)  # positive quarter: more likely if alpha exists
  b.update(0.65, 0.40)  # another positive quarter
  print(f"Updated belief: {b.belief:.1%}")`,
    plain: `The Bayesian updater is the mathematical engine underneath every signal validation workflow. When a new data point comes in, you multiply and normalise. This exact pattern appears in particle filters, Kalman filters, and every sequential estimation problem in quant finance.`,
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1110: {
    simulatorLesson: 'kellyImplementation',
    id: 1110, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'Kelly Criterion: Optimal Bet Sizing in Code',
    fact: `Kelly fraction = (p * b - q) / b where p = win probability, q = 1-p, b = net odds (win/loss ratio).

For continuous returns (what you actually use in trading):
  Kelly fraction = mean_return / variance_of_returns

Full implementation with fractional Kelly:
  def kelly_fraction(returns: np.ndarray, fraction: float = 0.5) -> float:
      """
      Compute Kelly-optimal position size.
      fraction: use fractional Kelly (0.5 = half-Kelly) for safety.
      Returns: fraction of capital to deploy (can be > 1 = leverage).
      """
      mu = returns.mean()
      sigma2 = returns.var()
      if sigma2 == 0:
          return 0.0
      full_kelly = mu / sigma2
      return fraction * full_kelly

  def kelly_discrete(p_win: float, win_mult: float, loss_mult: float) -> float:
      """
      Kelly for discrete bets.
      p_win: probability of winning
      win_mult: return on win (e.g. 2.0 = double your money)
      loss_mult: fraction lost on loss (e.g. 1.0 = lose everything)
      """
      p_loss = 1 - p_win
      b = win_mult - 1
      return (p_win * b - p_loss) / b

Why half-Kelly: estimation error in mu and sigma2 is enormous. Full Kelly with estimated parameters destroys accounts. Half-Kelly gives ~75% of the growth rate with much lower ruin probability.`,
    plain: `Kelly tells you the maximum fraction of capital to bet for maximum long-run geometric growth. The formula is simple. The trap is in the inputs — noisy estimates of mean and variance lead to catastrophic overbetting. Every serious quant uses fractional Kelly (typically 0.25 to 0.5) as a consequence.`,
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1111: {
    simulatorLesson: 'markowitzImplementation',
    id: 1111, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Markowitz Portfolio Optimisation: Build the Efficient Frontier',
    fact: `From Lab 4 you know the maths. Now you build it.

  import numpy as np
  import cvxpy as cp
  import pandas as pd

  def minimum_variance_portfolio(returns_df: pd.DataFrame) -> dict:
      """
      Finds the minimum variance portfolio.
      returns_df: columns = assets, rows = daily returns
      """
      mu = returns_df.mean().values          # expected returns
      Sigma = returns_df.cov().values        # covariance matrix
      n = len(mu)

      w = cp.Variable(n)
      risk = cp.quad_form(w, Sigma)          # portfolio variance = wᵀΣw

      constraints = [
          cp.sum(w) == 1,                    # fully invested
          w >= 0,                            # no short selling
          w <= 0.30,                         # max 30% in any asset
      ]

      prob = cp.Problem(cp.Minimize(risk), constraints)
      prob.solve()

      if prob.status != 'optimal':
          raise ValueError(f"Optimisation failed: {prob.status}")

      weights = w.value
      port_return = mu @ weights * 252       # annualised
      port_vol = np.sqrt(weights @ Sigma @ weights) * np.sqrt(252)
      port_sharpe = port_return / port_vol

      return {
          'weights': dict(zip(returns_df.columns, weights)),
          'annual_return': port_return,
          'annual_vol': port_vol,
          'sharpe': port_sharpe,
      }

Common failure modes: Sigma is not positive definite (use returns_df.cov() not custom estimates), weights don't sum to 1 (check constraint), optimiser status is 'infeasible' (constraints are contradictory).`,
    plain: `This is the code that runs portfolio construction at every major asset manager. The quad_form(w, Sigma) is cvxpy notation for wᵀΣw. The rest is just expressing the finance problem as a convex optimisation — specify what you want, let the solver find it.`,
    stars: [550, 680, 850], target: 850, coins: 62,
  },

  1112: {
    simulatorLesson: 'regressionImplementation',
    id: 1112, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'OLS Regression and Newey-West: From Lab 2 to statsmodels',
    fact: `Lab 2 taught you what OLS regression does. Now you run it on financial data.

  import statsmodels.api as sm
  import pandas as pd

  def run_ols_with_newey_west(y: pd.Series, X: pd.DataFrame, lags: int = 5) -> dict:
      """
      OLS regression with Newey-West HAC standard errors.
      y: dependent variable (e.g. portfolio returns)
      X: independent variables (e.g. Fama-French factors)
      lags: Newey-West lag parameter (rule of thumb: T^0.25)
      """
      X_const = sm.add_constant(X)           # add intercept (alpha)
      model = sm.OLS(y, X_const)
      results = model.fit(cov_type='HAC', cov_kwds={'maxlags': lags})

      return {
          'alpha': results.params['const'],
          'alpha_tstat': results.tvalues['const'],
          'alpha_pvalue': results.pvalues['const'],
          'betas': results.params.drop('const').to_dict(),
          'r_squared': results.rsquared,
          'summary': results.summary(),
      }

Why Newey-West: financial returns are autocorrelated and heteroskedastic. OLS assumes neither. Newey-West corrects the standard errors for both — without it, t-statistics are inflated and you will falsely conclude significance.

The alpha interpretation: if alpha is statistically significant (p < 0.05 after correction), the portfolio earns returns not explained by the factors. That is the definition of real edge.`,
    plain: `Any time you regress portfolio returns on a factor model — Fama-French, CAPM, or your own factors — this is the code. The cov_type='HAC' argument is the critical line. Without it your p-values are wrong. With it you get robust inference.`,
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1113: {
    simulatorLesson: 'famaFrenchImplementation',
    id: 1113, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Fama-French 3-Factor Model: Full Implementation',
    fact: `The Fama-French model decomposes returns into market, size (SMB), and value (HML) factors.
R_p - R_f = α + β_MKT(R_m - R_f) + β_SMB(SMB) + β_HML(HML) + ε

Full pipeline:

  import pandas_datareader.data as web
  import yfinance as yf
  import pandas as pd
  import statsmodels.api as sm

  def fama_french_analysis(ticker: str, start: str, end: str) -> dict:
      # Step 1: Download factor data from Ken French's data library
      ff_factors = web.DataReader('F-F_Research_Data_Factors_daily', 'famafrench', start, end)[0]
      ff_factors = ff_factors / 100  # convert from percent to decimal

      # Step 2: Download asset returns
      prices = yf.download(ticker, start=start, end=end)['Adj Close']
      returns = prices.pct_change().dropna()

      # Step 3: Align dates and compute excess returns
      data = pd.concat([returns, ff_factors], axis=1).dropna()
      data.columns = ['asset', 'MKT-RF', 'SMB', 'HML', 'RF']
      data['excess_return'] = data['asset'] - data['RF']

      # Step 4: Run regression with Newey-West
      y = data['excess_return']
      X = data[['MKT-RF', 'SMB', 'HML']]
      X_const = sm.add_constant(X)
      result = sm.OLS(y, X_const).fit(cov_type='HAC', cov_kwds={'maxlags': 5})

      return {
          'alpha_annual': result.params['const'] * 252,
          'alpha_significant': result.pvalues['const'] < 0.05,
          'market_beta': result.params['MKT-RF'],
          'smb_beta': result.params['SMB'],
          'hml_beta': result.params['HML'],
          'r_squared': result.rsquared,
      }

Required packages: pandas_datareader, yfinance, statsmodels. The factor data comes directly from Kenneth French's website via pandas_datareader — you are using the same factors every academic paper uses.`,
    plain: `Every time a hedge fund says "our alpha is uncorrelated with known factors" — this is how they prove it. A positive, statistically significant alpha after Fama-French attribution is genuinely rare and genuinely valuable. Most strategies have alpha that disappears once you control for size and value exposure.`,
    stars: [550, 680, 850], target: 850, coins: 62,
  },

  1114: {
    simulatorLesson: 'monteCarloImplementation',
    id: 1114, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'Monte Carlo Simulation: GBM Price Paths in Code',
    fact: `From Lab 5 you know GBM: dS = μS dt + σS dW. Now you simulate it.

  import numpy as np
  import pandas as pd

  def simulate_gbm(S0: float, mu: float, sigma: float,
                   T: float, dt: float, n_paths: int = 1000) -> np.ndarray:
      """
      Simulate Geometric Brownian Motion paths.
      S0: initial price
      mu: annual drift (e.g. 0.08 for 8%)
      sigma: annual volatility (e.g. 0.20 for 20%)
      T: time horizon in years (e.g. 1.0 for 1 year)
      dt: time step in years (e.g. 1/252 for daily)
      n_paths: number of simulation paths
      Returns: array of shape (n_steps+1, n_paths)
      """
      n_steps = int(T / dt)
      # Log-normal increments: exact discretisation of GBM
      drift = (mu - 0.5 * sigma**2) * dt
      diffusion = sigma * np.sqrt(dt)

      # Random shocks: shape (n_steps, n_paths)
      Z = np.random.standard_normal((n_steps, n_paths))
      log_returns = drift + diffusion * Z

      # Cumulative product to get price paths
      paths = S0 * np.exp(np.vstack([np.zeros(n_paths), log_returns.cumsum(axis=0)]))
      return paths

  # Value at Risk from simulation
  def var_from_simulation(paths: np.ndarray, confidence: float = 0.05) -> float:
      """5th percentile of final prices = 95% VaR."""
      final_prices = paths[-1, :]
      return np.percentile(final_prices, confidence * 100)

Critical: use (mu - 0.5*sigma²)*dt not mu*dt. The 0.5*sigma² term is the Itô correction — without it your simulation drifts upward incorrectly.`,
    plain: `The GBM simulator is what lies underneath every options pricer, every VaR model, every stress test. The Itô correction term (0.5*sigma²) is where Lab 5 pays off — it is the direct consequence of Itô's lemma. Without the theory, the formula looks arbitrary. With it, every term has a derivation.`,
    stars: [550, 680, 850], target: 850, coins: 62,
  },

  1115: {
    simulatorLesson: 'blackScholesImplementation',
    id: 1115, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Black-Scholes Pricer and Greeks: From Formula to Code',
    fact: `Full Black-Scholes implementation with all five Greeks:

  import numpy as np
  from scipy.stats import norm

  def black_scholes(S: float, K: float, T: float, r: float, sigma: float,
                    option_type: str = 'call') -> dict:
      """
      S: current stock price
      K: strike price
      T: time to expiry in years
      r: risk-free rate (annual, continuous)
      sigma: implied volatility (annual)
      option_type: 'call' or 'put'
      """
      if T <= 0:
          intrinsic = max(S - K, 0) if option_type == 'call' else max(K - S, 0)
          return {'price': intrinsic, 'delta': 1.0 if S > K else 0.0}

      d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
      d2 = d1 - sigma * np.sqrt(T)

      if option_type == 'call':
          price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
          delta = norm.cdf(d1)
      else:
          price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
          delta = -norm.cdf(-d1)

      gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
      vega  = S * norm.pdf(d1) * np.sqrt(T) / 100   # per 1% vol change
      theta = (-(S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T))
               - r * K * np.exp(-r * T) * norm.cdf(d2 if option_type=='call' else -d2)) / 365
      rho   = (K * T * np.exp(-r * T) * norm.cdf(d2 if option_type=='call' else -d2)) / 100

      return {'price': price, 'delta': delta, 'gamma': gamma,
              'vega': vega, 'theta': theta, 'rho': rho}`,
    plain: `The Black-Scholes implementation is the canonical quant coding interview question. Know d1, d2, and why norm.cdf appears (because under GBM the risk-neutral probability of exercise is N(d2)). The Greeks are partial derivatives of the price formula — delta with respect to S, gamma is second derivative, vega with respect to sigma, theta with respect to T.`,
    stars: [550, 680, 850], target: 850, coins: 62,
  },

  1116: {
    simulatorLesson: 'backtestImplementation',
    id: 1116, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'Event-Driven Backtester: Build One from Scratch',
    fact: `A minimal but correct backtester — no vectorbt, no library. Written from scratch so you understand what every backtest framework does under the hood.

  import pandas as pd
  import numpy as np

  class SimpleBacktester:
      def __init__(self, initial_capital: float = 100_000):
          self.capital = initial_capital
          self.positions: dict = {}   # ticker -> shares held
          self.portfolio_values = []
          self.trades = []

      def run(self, prices: pd.DataFrame, signals: pd.DataFrame,
              transaction_cost: float = 0.001) -> dict:
          """
          prices: DataFrame, columns=tickers, rows=dates
          signals: DataFrame, same shape, values in {-1, 0, 1}
          transaction_cost: fraction of trade value charged each way
          """
          for date in prices.index:
              # 1. Mark-to-market current positions
              port_value = self.capital
              for ticker, shares in self.positions.items():
                  if ticker in prices.columns:
                      port_value += shares * prices.loc[date, ticker]
              self.portfolio_values.append({'date': date, 'value': port_value})

              # 2. Execute signals
              for ticker in prices.columns:
                  signal = signals.loc[date, ticker]
                  price = prices.loc[date, ticker]
                  current_pos = self.positions.get(ticker, 0)

                  if signal == 1 and current_pos == 0:
                      # Buy: allocate equal weight per signal
                      n_active = (signals.loc[date] == 1).sum()
                      alloc = port_value / max(n_active, 1)
                      shares = int(alloc / price)
                      cost = shares * price * (1 + transaction_cost)
                      if cost <= self.capital:
                          self.capital -= cost
                          self.positions[ticker] = shares
                          self.trades.append({'date': date, 'ticker': ticker,
                                             'action': 'buy', 'shares': shares, 'price': price})
                  elif signal == -1 and current_pos > 0:
                      # Sell
                      proceeds = current_pos * price * (1 - transaction_cost)
                      self.capital += proceeds
                      del self.positions[ticker]
                      self.trades.append({'date': date, 'ticker': ticker,
                                         'action': 'sell', 'shares': current_pos, 'price': price})

          pv = pd.DataFrame(self.portfolio_values).set_index('date')['value']
          returns = pv.pct_change().dropna()
          return {
              'final_value': pv.iloc[-1],
              'total_return': (pv.iloc[-1] / pv.iloc[0]) - 1,
              'sharpe': (returns.mean() / returns.std()) * np.sqrt(252),
              'max_drawdown': ((pv - pv.cummax()) / pv.cummax()).min(),
              'n_trades': len(self.trades),
              'equity_curve': pv,
          }`,
    plain: `Writing a backtester from scratch teaches you every assumption that vectorbt makes invisibly. The mark-to-market loop, the capital accounting, the transaction cost deduction, the equal-weight allocation — each line is a decision that affects results. Every production backtesting framework is this loop made faster and more realistic.`,
    stars: [550, 680, 850], target: 850, coins: 65,
  },

  1117: {
    simulatorLesson: 'momentumSignalCode',
    id: 1117, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Cross-Sectional Momentum Signal: A Complete Strategy',
    fact: `Cross-sectional momentum: buy the top decile of 12-1 month returners, short the bottom decile. The most replicated factor in academic finance.

  import pandas as pd
  import numpy as np

  def cross_sectional_momentum(prices: pd.DataFrame,
                                lookback: int = 252,
                                skip: int = 21,
                                n_long: int = 10,
                                n_short: int = 10) -> pd.DataFrame:
      """
      prices: DataFrame, columns=tickers, rows=dates (daily)
      lookback: formation period in days (252 = 12 months)
      skip: skip most recent month to avoid short-term reversal
      n_long: number of top performers to go long
      n_short: number of bottom performers to go short
      Returns: signal DataFrame, 1=long, -1=short, 0=no position
      """
      # Formation period return: (t-lookback) to (t-skip)
      formation_return = prices.shift(skip) / prices.shift(lookback) - 1

      signals = pd.DataFrame(0, index=prices.index, columns=prices.columns)

      for date in prices.index[lookback:]:
          row = formation_return.loc[date].dropna()
          if len(row) < n_long + n_short:
              continue
          ranked = row.rank(ascending=False)
          longs = ranked[ranked <= n_long].index
          shorts = ranked[ranked > len(row) - n_short].index
          signals.loc[date, longs] = 1
          signals.loc[date, shorts] = -1

      return signals

Why skip=21 (1 month): the most recent month shows mean reversion, not momentum. The formation period deliberately excludes it. This is the Jegadeesh-Titman skip-month correction and it matters — including the skip month reduces the Sharpe ratio by roughly 30%.`,
    plain: `This is a complete, researchable strategy — not a toy. Cross-sectional momentum has been live at real funds for decades. The code is simple; the insight is in the skip month and the formation period. When you backtest this on real data, you will find it works and understand why.`,
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1118: {
    simulatorLesson: 'pairsTradeCode',
    id: 1118, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'Pairs Trading: Cointegration to Live Signal',
    fact: `Pairs trading: find two cointegrated assets, trade the spread when it deviates from equilibrium.

  import pandas as pd
  import numpy as np
  from statsmodels.tsa.stattools import coint
  import statsmodels.api as sm

  def find_cointegrated_pairs(prices: pd.DataFrame,
                               significance: float = 0.05) -> list:
      """Return list of (ticker1, ticker2, pvalue) for cointegrated pairs."""
      tickers = prices.columns
      pairs = []
      for i in range(len(tickers)):
          for j in range(i+1, len(tickers)):
              _, pvalue, _ = coint(prices[tickers[i]], prices[tickers[j]])
              if pvalue < significance:
                  pairs.append((tickers[i], tickers[j], pvalue))
      return sorted(pairs, key=lambda x: x[2])  # lowest pvalue first

  def pairs_trading_signal(price_a: pd.Series, price_b: pd.Series,
                            entry_z: float = 2.0,
                            exit_z: float = 0.5) -> pd.Series:
      """
      Compute z-score of spread and generate signals.
      Returns: +1 (long A short B), -1 (short A long B), 0 (no position)
      """
      # Estimate hedge ratio via OLS
      model = sm.OLS(price_a, sm.add_constant(price_b)).fit()
      hedge_ratio = model.params[price_b.name]
      spread = price_a - hedge_ratio * price_b

      # Rolling z-score (60-day window)
      mu = spread.rolling(60).mean()
      sigma = spread.rolling(60).std()
      z_score = (spread - mu) / sigma

      signal = pd.Series(0, index=price_a.index)
      in_position = 0

      for date in z_score.index:
          z = z_score[date]
          if np.isnan(z):
              continue
          if in_position == 0:
              if z > entry_z:   signal[date] = -1; in_position = -1
              elif z < -entry_z: signal[date] = 1;  in_position = 1
          else:
              if abs(z) < exit_z:
                  signal[date] = 0; in_position = 0
              else:
                  signal[date] = in_position

      return signal`,
    plain: `Pairs trading is statistical arbitrage in its simplest form. The cointegration test tells you whether the spread is stationary (mean-reverting). The hedge ratio from OLS tells you how many units of B to trade per unit of A. The z-score tells you when the spread is wide enough to trade profitably.`,
    stars: [550, 680, 850], target: 850, coins: 62,
  },

  1119: {
    simulatorLesson: 'mlSignalCode',
    id: 1119, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'ML Signal with Proper Walk-Forward Validation',
    fact: `The most common mistake in ML for finance: training and testing on overlapping data. Here is the correct pattern.

  import pandas as pd
  import numpy as np
  from sklearn.ensemble import GradientBoostingClassifier
  from sklearn.preprocessing import StandardScaler

  def walk_forward_ml(features: pd.DataFrame, target: pd.Series,
                       train_window: int = 504,   # 2 years of daily data
                       test_window: int = 63,     # 1 quarter
                       embargo: int = 21) -> pd.Series:
      """
      Walk-forward validation: train on past data, predict future, never look ahead.
      embargo: gap between train and test to prevent leakage from autocorrelation
      Returns: out-of-sample predictions only
      """
      predictions = pd.Series(index=target.index, dtype=float)

      for start in range(train_window, len(features) - test_window, test_window):
          train_end = start
          train_start = start - train_window
          test_start = start + embargo
          test_end = min(test_start + test_window, len(features))

          X_train = features.iloc[train_start:train_end]
          y_train = target.iloc[train_start:train_end]
          X_test  = features.iloc[test_start:test_end]

          scaler = StandardScaler()
          X_train_sc = scaler.fit_transform(X_train)
          X_test_sc  = scaler.transform(X_test)

          model = GradientBoostingClassifier(n_estimators=100, max_depth=3)
          model.fit(X_train_sc, y_train)
          preds = model.predict_proba(X_test_sc)[:, 1]
          predictions.iloc[test_start:test_end] = preds

      return predictions.dropna()

The embargo period is critical: if today's features use 20-day rolling windows, the last 20 days of training data are correlated with the first 20 days of test data. Excluding them as an embargo prevents this leakage from inflating out-of-sample performance.`,
    plain: `Most ML-in-finance backtests are invalidated by data leakage. The walk-forward pattern with embargo is the standard that survives scrutiny. Each test window is predicted using only information that would have been available at that time. If your backtest uses this pattern and still looks good, it is worth taking seriously.`,
    stars: [550, 680, 850], target: 850, coins: 62,
  },

  1120: {
    simulatorLesson: 'riskSystemCode',
    id: 1120, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'Portfolio Risk System: VaR, CVaR, and Correlation Monitor',
    fact: `A production-grade risk monitoring module:

  import numpy as np
  import pandas as pd

  class PortfolioRiskMonitor:
      def __init__(self, returns: pd.DataFrame, weights: dict):
          self.returns = returns
          self.weights = pd.Series(weights)
          self.weights = self.weights / self.weights.sum()  # normalise

      @property
      def portfolio_returns(self) -> pd.Series:
          aligned = self.returns[self.weights.index]
          return aligned.dot(self.weights)

      def var(self, confidence: float = 0.05, horizon_days: int = 1) -> float:
          """Historical VaR at given confidence level."""
          r = self.portfolio_returns
          return -np.percentile(r, confidence * 100) * np.sqrt(horizon_days)

      def cvar(self, confidence: float = 0.05) -> float:
          """Conditional VaR (Expected Shortfall) — average loss beyond VaR."""
          r = self.portfolio_returns
          cutoff = np.percentile(r, confidence * 100)
          return -r[r <= cutoff].mean()

      def correlation_matrix(self) -> pd.DataFrame:
          return self.returns[self.weights.index].corr()

      def risk_contribution(self) -> pd.Series:
          """Marginal risk contribution of each asset."""
          cov = self.returns[self.weights.index].cov() * 252
          w = self.weights.values
          port_vol = np.sqrt(w @ cov.values @ w)
          marginal = cov.values @ w / port_vol
          contrib = w * marginal
          return pd.Series(contrib / contrib.sum(),
                          index=self.weights.index, name='risk_contribution')

      def concentration_warning(self, threshold: float = 0.30) -> list:
          rc = self.risk_contribution()
          return list(rc[rc > threshold].index)

Usage:
  monitor = PortfolioRiskMonitor(returns_df, weights={'AAPL': 0.3, 'MSFT': 0.4, 'NVDA': 0.3})
  print(f"1-day 95% VaR: {monitor.var():.2%}")
  print(f"CVaR: {monitor.cvar():.2%}")
  print(f"Risk contributions: {monitor.risk_contribution()}")`,
    plain: `Risk monitoring is what keeps the fund alive when strategies underperform. VaR tells you the threshold you will breach 5% of days. CVaR tells you how bad it gets when you do breach it. Risk contribution tells you which asset is driving portfolio volatility — the answer is almost never what you expect from position size alone.`,
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1121: {
    simulatorLesson: 'dataIngestionCode',
    id: 1121, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Data Ingestion Pipeline: yfinance to Clean Returns',
    fact: `The complete data pipeline from raw download to clean, research-ready returns:

  import yfinance as yf
  import pandas as pd
  import numpy as np

  def build_returns_dataset(tickers: list, start: str, end: str,
                             min_history: float = 0.95) -> pd.DataFrame:
      """
      Download, clean, and return daily log returns.
      min_history: drop tickers with less than this fraction of trading days.
      """
      # Step 1: Download adjusted close prices
      raw = yf.download(tickers, start=start, end=end, auto_adjust=True)['Close']

      if isinstance(raw, pd.Series):
          raw = raw.to_frame(tickers[0])

      # Step 2: Remove tickers with insufficient history
      min_obs = int(len(raw) * min_history)
      prices = raw.dropna(axis=1, thresh=min_obs)
      dropped = set(tickers) - set(prices.columns)
      if dropped:
          print(f"Dropped due to insufficient history: {dropped}")

      # Step 3: Forward-fill gaps (weekends already excluded, handle holidays)
      prices = prices.ffill()

      # Step 4: Remove any remaining NaN rows
      prices = prices.dropna()

      # Step 5: Compute log returns
      log_returns = np.log(prices / prices.shift(1)).dropna()

      # Step 6: Winsorise extreme returns (likely data errors)
      lower = log_returns.quantile(0.001)
      upper = log_returns.quantile(0.999)
      log_returns = log_returns.clip(lower=lower, upper=upper, axis=1)

      # Step 7: Report
      print(f"Dataset: {len(prices.columns)} assets, {len(log_returns)} trading days")
      print(f"Date range: {log_returns.index[0].date()} to {log_returns.index[-1].date()}")

      return log_returns

Common data quality issues this handles:
- Survivorship bias: yfinance only has historical data for tickers that existed (be aware)
- Delisted stocks: dropped by min_history filter
- Dividend/split discontinuities: handled by auto_adjust=True
- Outlier returns (data errors): removed by winsorisation at 0.1% tails`,
    plain: `Real quant research starts with a data pipeline that handles all the messy reality of financial data. The winsorisation step removes a 50% return in a single day that is almost certainly a data error, not a real event. The min_history filter removes assets with insufficient data to estimate reliable parameters.`,
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1122: {
    simulatorLesson: 'vectorbtBacktest',
    id: 1122, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'vectorbt: Production-Speed Backtesting',
    fact: `After writing a backtester from scratch (level 1116), use vectorbt for real research speed.

  import vectorbt as vbt
  import yfinance as yf
  import pandas as pd
  import numpy as np

  # Download data
  prices = yf.download(['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL'],
                        start='2018-01-01', end='2024-01-01', auto_adjust=True)['Close']

  # Moving average crossover signal
  fast = prices.rolling(20).mean()
  slow = prices.rolling(50).mean()
  entries = fast > slow        # True when fast crosses above slow
  exits   = fast < slow        # True when fast crosses below slow

  # Run backtest across all assets simultaneously
  portfolio = vbt.Portfolio.from_signals(
      prices,
      entries=entries,
      exits=exits,
      freq='1D',
      init_cash=100_000,
      fees=0.001,              # 0.1% per trade
      slippage=0.001,          # 0.1% slippage
  )

  # Access results
  stats = portfolio.stats()
  print(stats[['Total Return [%]', 'Sharpe Ratio', 'Max Drawdown [%]', 'Win Rate [%]']])

  # Parameter sweep — test all combinations of fast/slow window
  fast_windows = np.arange(5, 50, 5)
  slow_windows = np.arange(20, 200, 20)

  results = {}
  for fw in fast_windows:
      for sw in slow_windows:
          if fw >= sw: continue
          f = prices.rolling(fw).mean()
          s = prices.rolling(sw).mean()
          pf = vbt.Portfolio.from_signals(prices, f > s, f < s,
                                          freq='1D', init_cash=100_000, fees=0.001)
          results[(fw, sw)] = pf.sharpe_ratio()

  best = max(results, key=results.get)
  print(f"Best params: fast={best[0]}, slow={best[1]}, Sharpe={results[best]:.2f}")
  # WARNING: This is in-sample optimisation. Apply walk-forward validation from level 1119.`,
    plain: `vectorbt runs thousands of parameter combinations in seconds because it vectorises everything with numpy under the hood. The parameter sweep that would take hours with your scratch backtester takes seconds here. The warning at the bottom is real — the best in-sample parameters are almost always overfit. Use walk-forward validation.`,
    stars: [520, 640, 800], target: 800, coins: 58,
  },

  1123: {
    simulatorLesson: 'interviewCodeChallenge',
    id: 1123, lab: 8, mechanic: 'memory', tier: 'elite',
    topic: 'Live Coding Interview Problems: The Actual Questions',
    fact: `These are real quant developer/researcher interview problems. Write clean solutions.

PROBLEM 1 — Rolling Sharpe (Jane Street style):
"Given a pandas Series of daily returns, compute the rolling 252-day Sharpe ratio."
  def rolling_sharpe(returns: pd.Series, window: int = 252, rf: float = 0.04) -> pd.Series:
      rf_daily = rf / 252
      excess = returns - rf_daily
      return (excess.rolling(window).mean() / excess.rolling(window).std()) * np.sqrt(252)

PROBLEM 2 — Maximum Profit (Citadel style, O(n) solution required):
"Given a list of prices, find the maximum profit from one buy and one sell."
  def max_profit(prices: list) -> float:
      if len(prices) < 2: return 0
      min_price = prices[0]
      max_profit = 0
      for price in prices[1:]:
          max_profit = max(max_profit, price - min_price)
          min_price  = min(min_price, price)
      return max_profit

PROBLEM 3 — Weighted Moving Average (Two Sigma style):
"Implement an exponentially weighted moving average without using pandas ewm()."
  def ewma(values: list, alpha: float = 0.1) -> list:
      result = [values[0]]
      for v in values[1:]:
          result.append(alpha * v + (1 - alpha) * result[-1])
      return result

PROBLEM 4 — Running VaR Update (real-time trading system):
"Efficiently update a 252-day historical VaR as each new return arrives."
  from collections import deque
  class RunningVaR:
      def __init__(self, window: int = 252, confidence: float = 0.05):
          self.window = window; self.confidence = confidence
          self.buffer = deque(maxlen=window)
      def update(self, new_return: float) -> float:
          self.buffer.append(new_return)
          if len(self.buffer) < self.window: return None
          return -np.percentile(list(self.buffer), self.confidence * 100)`,
    plain: `Every one of these has been asked at a top quant firm in the last three years. The O(n) constraint on max profit eliminates candidates who write O(n²) nested loops. The running VaR with a deque shows you understand the efficiency constraint of real-time systems. Clean, readable code matters as much as correctness.`,
    stars: [550, 680, 850], target: 850, coins: 62,
  },

  1124: {
    simulatorLesson: 'completeQuantPipeline',
    id: 1124, lab: 8, mechanic: 'match3', tier: 'elite',
    topic: 'The Complete Research Pipeline: End to End',
    fact: `Putting it all together — a complete alpha research workflow:

  # PHASE 1: Data
  returns = build_returns_dataset(['SPY', 'QQQ', 'IWM', 'GLD', 'TLT'],
                                   start='2015-01-01', end='2024-01-01')

  # PHASE 2: Feature engineering
  features = pd.DataFrame(index=returns.index)
  features['momentum_1m']  = returns.rolling(21).sum().shift(1)   # avoid look-ahead
  features['momentum_3m']  = returns.rolling(63).sum().shift(1)
  features['volatility']   = returns.rolling(21).std().shift(1)
  features['mean_reversion'] = (returns - returns.rolling(10).mean()).shift(1)
  features = features.dropna()

  # PHASE 3: Signal generation (walk-forward ML)
  target = (returns['SPY'].shift(-1) > 0).astype(int)  # next-day direction
  target = target[features.index]
  predictions = walk_forward_ml(features, target)

  # PHASE 4: Portfolio construction
  weights = {'SPY': 0.4, 'QQQ': 0.3, 'IWM': 0.15, 'GLD': 0.1, 'TLT': 0.05}
  optimised = minimum_variance_portfolio(returns)

  # PHASE 5: Risk monitoring
  monitor = PortfolioRiskMonitor(returns, weights)
  print(f"Daily VaR (95%): {monitor.var():.2%}")
  print(f"CVaR: {monitor.cvar():.2%}")
  risk_contributions = monitor.risk_contribution()

  # PHASE 6: Attribution
  ff_results = fama_french_analysis('SPY', '2015-01-01', '2024-01-01')
  print(f"Annual alpha: {ff_results['alpha_annual']:.2%}")
  print(f"Significant: {ff_results['alpha_significant']}")

  # PHASE 7: Reporting
  sharpe  = sharpe_ratio(returns['SPY'].values)
  mdd     = max_drawdown(returns['SPY'].values)
  print(f"Sharpe: {sharpe:.2f} | Max Drawdown: {mdd:.1%}")

Each phase uses code you built in this lab. The entire pipeline — from raw data download to risk-attributed performance report — is 50 lines of readable, modular Python.`,
    plain: `This is what a first-week deliverable at a quant research fund looks like. Not a toy. Not a tutorial. A real seven-phase pipeline connecting data → features → signals → portfolio → risk → attribution → reporting. Every function was built from scratch in this lab. Every concept was learned in Labs 0–7.`,
    stars: [550, 680, 850], target: 850, coins: 65,
  },

  1125: {
    simulatorLesson: 'lab8Boss',
    id: 1125, lab: 8, mechanic: 'calibration', tier: 'elite',
    topic: 'Lab 8 Boss: The Full Stack Quant Challenge',
    fact: `BOSS LEVEL. You have 90 minutes and a Python environment. Three tasks, all graded.

TASK 1 — Strategy Research (30 min):
Download 5 years of daily returns for 20 S&P 500 stocks using yfinance. Construct a cross-sectional momentum signal (12-1 month, skip 1 month). Backtest using your scratch backtester with 0.1% transaction costs. Report Sharpe, max drawdown, and number of trades. Verify there is no look-ahead bias.

TASK 2 — Risk Attribution (30 min):
Take the strategy's daily P&L series. Run Fama-French 3-factor attribution. Is the alpha statistically significant after Newey-West correction? What fraction of variance is explained by market beta? Build a PortfolioRiskMonitor. Report 95% VaR and CVaR. Identify the asset contributing most to portfolio risk.

TASK 3 — Optimisation (30 min):
Construct a minimum-variance portfolio from the same 20 stocks using cvxpy. Constraints: fully invested, no short selling, max 10% per stock. Compare Sharpe to equal-weighted. Use Kelly criterion to size the strategy allocation within a larger portfolio assuming 60% of capital in this strategy.

Grading: correct code = pass. Clean, readable, modular code = distinction. Fast execution and correct interpretation of results = exceptional.`,
    plain: 'This boss is the capstone of the entire quant trader curriculum. It integrates every lab: the probability intuition from Lab 1, the statistical rigour from Lab 2, the linear algebra from Lab 3, the optimisation from Lab 4, the stochastic framework from Lab 5, the interview-readiness from Lab 6, the tooling from Lab 7, and the implementation from Lab 8. Pass this and you have built everything a junior quant researcher needs on day one.',
    stars: [600, 750, 950], target: 950, coins: 75,
    isBoss: true,
    calibrationData: {
      scenario: 'Your momentum strategy shows Sharpe 1.8 in backtest. After Fama-French attribution, alpha is 0.04% per day (p=0.08). The strategy tested 50 parameter combinations. Is this a real edge?',
      baseRate: 0.15,
      evidence: 'p=0.08 > 0.05 threshold. After Bonferroni for 50 tests: threshold = 0.001. p=0.08 >> 0.001. Alpha is NOT statistically significant. The Sharpe of 1.8 is likely overfitted. Probability of real edge is very low.',
      correctPosterior: 0.08,
      tolerance: 0.12,
    },
  },
};

Object.assign(QUANT_LEVELS, LAB8_LEVELS);
