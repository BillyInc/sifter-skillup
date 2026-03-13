/**
 * Quant Trader Track — Simulator Definitions
 * 68 simulators for all levels currently lacking one.
 * All feed into SimulatorFactory (mcq | build | match).
 */
import type { SimulatorDef } from '../components/simulators/SimulatorFactory';

export const QUANT_SIM_DEFS: Record<string, SimulatorDef> = {

  quantRoleQuiz: {
    key: 'quantRoleQuiz', title: 'What Quants Actually Do', icon: '🏦',
    subtitle: 'Match the role description to the quant type',
    type: 'match',
    pairs: [
      { left: 'Builds alpha signals from data', right: 'Quantitative Researcher' },
      { left: 'Manages live positions and risk in real time', right: 'Quantitative Trader' },
      { left: 'Builds execution infrastructure and tooling', right: 'Quantitative Developer' },
      { left: 'Market microstructure, flow, latency (sell-side)', right: 'Quantitative Strategist' },
      { left: 'Prices structured products, advises clients', right: 'Quantitative Analyst' },
    ],
  },

  archetypeQuiz: {
    key: 'archetypeQuiz', title: 'The Three Archetypes', icon: '👤',
    subtitle: 'Researcher vs Trader vs Developer — who does what?',
    type: 'mcq',
    questions: [
      { prompt: 'Who builds the backtesting framework that researchers use?', options: ['Researcher', 'Trader', 'Developer', 'Risk Manager'], correct: 'Developer', explain: 'Quant Developers build infrastructure: execution systems, data pipelines, backtesting engines.' },
      { prompt: 'Who monitors live P&L and adjusts hedge ratios throughout the day?', options: ['Researcher', 'Trader', 'Developer', 'Compliance'], correct: 'Trader', explain: 'Quant Traders manage real positions — monitoring, hedging, interacting with execution systems.' },
      { prompt: 'Who designs and tests a new factor for predicting 5-day returns?', options: ['Researcher', 'Trader', 'Developer', 'Portfolio Manager'], correct: 'Researcher', explain: 'Quant Researchers find and validate alpha signals. Backtesting, statistical analysis, signal construction.' },
      { prompt: 'The boundary between researcher and developer is:', options: ['Always fixed', 'Firm-dependent — small funds blur it significantly', 'Developer always reports to researcher', 'Only at banks, not hedge funds'], correct: 'Firm-dependent — small funds blur it significantly', explain: 'At small quant funds researchers often code their own infrastructure. At large banks there is clear separation.' },
      { prompt: 'Which archetype has highest variance in compensation year to year?', options: ['Developer', 'Researcher', 'Trader', 'Risk Manager'], correct: 'Trader', explain: 'Traders with P&L responsibility earn enormous bonuses in good years — and can be fired in bad ones. Highest upside and downside variance.' },
    ],
  },

  compQuiz: {
    key: 'compQuiz', title: 'Compensation Reality', icon: '💰',
    subtitle: 'Match role and firm type to realistic comp range',
    type: 'match',
    pairs: [
      { left: 'Junior quant dev at bank (0-2yr)', right: '$150k–$250k total comp' },
      { left: 'Senior researcher at top quant fund (5yr+)', right: '$500k–$2M+ total' },
      { left: 'Portfolio manager at Citadel / Millennium', right: 'P&L share — can be $1M–$20M+' },
      { left: 'Quant analyst at large asset manager', right: '$120k–$200k — closer to buy-side AM' },
      { left: 'HFT developer at Jump / Virtu', right: '$300k–$800k early career' },
    ],
  },

  conditionalQuiz: {
    key: 'conditionalQuiz', title: 'Conditional Probability Traps', icon: '🎯',
    subtitle: 'Classic mistakes in conditional reasoning',
    type: 'mcq',
    questions: [
      { prompt: 'P(A)=0.01, P(test+|A)=0.99, P(test+|¬A)=0.05. You test positive. P(A|test+)?', options: ['0.99', '0.167', '0.01', '0.05'], correct: '0.167', explain: 'Bayes: P(+)=0.99×0.01+0.05×0.99=0.0594. P(A|+)=0.0099/0.0594≈0.167. Rare base rate dominates even with strong test.' },
      { prompt: '"Pavement is wet, therefore it rained." Error?', options: ['Valid logic', 'Affirming the consequent — other causes of wet pavement exist', 'Denying the antecedent', 'No error'], correct: 'Affirming the consequent — other causes of wet pavement exist', explain: 'P(wet|rain)=high does not mean P(rain|wet)=high. Sprinklers, spills, etc. The prosecutors\' fallacy.' },
      { prompt: 'P(win) = 60% over 10 trades. P(strategy is good)?', options: ['60%', 'Depends entirely on base rate and sample size', '100%', '40%'], correct: 'Depends entirely on base rate and sample size', explain: '10 trades is noise. Over 10,000 trades a 60% win rate is informative. Base rate and sample size dominate.' },
      { prompt: 'Stock has 70% chance up tomorrow given public news. Missing information?', options: ['Nothing missing', 'Whether other traders already priced it in', 'The stock\'s beta', 'Historical volatility'], correct: 'Whether other traders already priced it in', explain: 'If news is public, efficient markets suggests it\'s already priced. Edge is in interpretation speed, not the news itself.' },
    ],
  },

  bayesQuiz: {
    key: 'bayesQuiz', title: 'Bayes\' Theorem Applied', icon: '🔄',
    subtitle: 'Apply Bayes to financial and probability scenarios',
    type: 'mcq',
    questions: [
      { prompt: 'Prior P(real alpha)=0.1. P(Sharpe>2|real)=0.8, P(Sharpe>2|noise)=0.2. Observe Sharpe>2. Posterior?', options: ['0.8', '0.308', '0.1', '0.5'], correct: '0.308', explain: 'P(R|S)=0.08/(0.08+0.18)=0.08/0.26≈0.308. Even a strong signal barely moves a 10% prior.' },
      { prompt: 'Bayesian updating: P(trend)=0.5, three consecutive up days. P(up|trend)=0.7, P(up|no trend)=0.5. Posterior after 3 days?', options: ['0.5', '0.73', '0.63', '0.86'], correct: '0.73', explain: 'Update three times. Each up day shifts toward trend: 0.5→0.58→0.66→0.73.' },
      { prompt: 'Why is the base rate so important in Bayes?', options: ['Doesn\'t matter with strong evidence', 'A rare event stays rare even after a positive test unless specificity is very high', 'Only relevant for medical tests', 'Only matters for binary outcomes'], correct: 'A rare event stays rare even after a positive test unless specificity is very high', explain: 'At 1% base rate and 5% false positive rate, even a positive test gives only ~16% posterior. Rarity dominates.' },
      { prompt: 'P(data) in Bayes — the "marginal likelihood" — equals:', options: ['The margin requirement', 'Total probability of observing the data under all hypotheses', 'P(H)', '1 always'], correct: 'Total probability of observing the data under all hypotheses', explain: 'P(data)=P(data|H)P(H)+P(data|¬H)P(¬H). Normalises the posterior to sum to 1.' },
    ],
  },

  varianceRiskQuiz: {
    key: 'varianceRiskQuiz', title: 'Variance & Risk', icon: '📊',
    subtitle: 'Variance, diversification, and what it means for portfolios',
    type: 'mcq',
    questions: [
      { prompt: 'Strategy A: mean 10%, σ=5%. Strategy B: mean 10%, σ=20%. Rational choice?', options: ['A — same return, lower risk', 'B — more variance means more upside', 'Equal — same expected return', 'Depends on investor only'], correct: 'A — same return, lower risk', explain: 'For equal expected returns always prefer lower variance. Sharpe ratio of 2 dominates 0.5.' },
      { prompt: 'Two uncorrelated assets, each σ=20%, equal weight. Portfolio σ?', options: ['20%', '14.1%', '10%', '28.3%'], correct: '14.1%', explain: 'σ_p=√(0.5²×0.04+0.5²×0.04)=√0.02=14.1%. Diversification reduces risk.' },
      { prompt: 'Same assets but ρ=1. Equal weight portfolio σ?', options: ['14.1%', '20%', '28.3%', '10%'], correct: '20%', explain: 'When ρ=1 assets move in lockstep. No diversification. σ_p = weighted average = 20%.' },
      { prompt: 'Kurtosis > 3 for a return distribution means:', options: ['Higher mean', 'Fatter tails — more extreme events than normal predicts', 'Lower variance', 'Positive skew'], correct: 'Fatter tails — more extreme events than normal predicts', explain: 'Excess kurtosis = kurtosis−3. Financial returns typically have positive excess kurtosis. Normal VaR understates tail risk.' },
    ],
  },

  lolnQuiz: {
    key: 'lolnQuiz', title: 'Law of Large Numbers', icon: '∞',
    subtitle: 'LLN implications for strategy evaluation',
    type: 'mcq',
    questions: [
      { prompt: 'True edge 0.1% per trade. After 10 trades, observed mean is 0.5%. Conclusion?', options: ['Strategy has higher edge than expected', 'Sample too small — noise dominates', 'Edge confirmed', 'Strategy is broken'], correct: 'Sample too small — noise dominates', explain: 'With high per-trade volatility, 10 trades gives almost no information. Need hundreds to thousands to estimate edge accurately.' },
      { prompt: 'LLN says as n→∞, the sample mean converges to:', options: ['0', 'The median', 'The true population mean', 'The mode'], correct: 'The true population mean', explain: 'X̄_n → μ as n grows. This is why large sample sizes are required for statistical validity.' },
      { prompt: 'Strategy wins 52% of the time. ~How many trades to distinguish from 50%?', options: ['10', '100', '~2500', '1M'], correct: '~2500', explain: 'SE=√(p(1-p)/n). To detect 2% edge at 1σ: n≈1/(0.02²)=2500.' },
      { prompt: 'LLN does NOT say:', options: ['Sample mean converges to population mean', 'Individual outcomes become more predictable with more data', 'Average of iid variables converges', 'Sample size matters for estimation accuracy'], correct: 'Individual outcomes become more predictable with more data', explain: 'LLN is about averages, not individual outcomes. Each coin flip is still 50/50 regardless of history.' },
    ],
  },

  berksonQuiz: {
    key: 'berksonQuiz', title: 'Berkson\'s Paradox', icon: '🔀',
    subtitle: 'Selection creates spurious correlations',
    type: 'mcq',
    questions: [
      { prompt: 'You study only funded strategies. Risk and return are negatively correlated in your sample but uncorrelated in the population. Why?', options: ['Your data is wrong', 'Berkson\'s paradox — conditioning on funding creates spurious correlation', 'High-risk strategies always underperform', 'Selection bias in return measurement'], correct: 'Berkson\'s paradox — conditioning on funding creates spurious correlation', explain: 'Funding requires either high return OR high risk tolerance. Conditioning creates negative correlation between them within the funded subset.' },
      { prompt: 'Berkson\'s paradox occurs when you:', options: ['Use too small a sample', 'Condition on a collider variable', 'Ignore the base rate', 'Use the wrong model'], correct: 'Condition on a collider variable', explain: 'A collider is caused by both X and Y. Conditioning on it induces correlation between X and Y even when independent.' },
      { prompt: 'Best defense against Berkson\'s paradox:', options: ['Larger sample size', 'Pre-register hypothesis', 'Understand the selection mechanism that generated your data', 'Use robust statistics'], correct: 'Understand the selection mechanism that generated your data', explain: 'Ask: how did this data enter my sample? Who is excluded? Survivorship bias and selection bias are pervasive in finance.' },
    ],
  },

  probInterviewQuiz: {
    key: 'probInterviewQuiz', title: 'Probability Interview Problems', icon: '🎲',
    subtitle: 'Five classic quant interview probability problems',
    type: 'mcq',
    questions: [
      { prompt: 'Fair coin flipped until two consecutive heads. Expected flips?', options: ['4', '6', '8', '10'], correct: '6', explain: 'E=6. Solve via state equations. E[start]=1+0.5×E[one_head]+0.5×E[start]. E[one_head]=1+0.5×0+0.5×E[start]. Gives E=6.' },
      { prompt: '100 passengers, first sits randomly, rest take their seat or pick randomly. P(last gets own seat)?', options: ['0.01', '0.5', '0.99', '1/100'], correct: '0.5', explain: 'Classic result: exactly 1/2. At every decision point, P(seat 1 occupied) = P(seat 100 occupied). Last passenger gets one of these at 50/50.' },
      { prompt: 'P(at least one 6 in 4 rolls of fair die)?', options: ['4/6', '1−(5/6)⁴', '4×(1/6)', '1/6'], correct: '1−(5/6)⁴', explain: 'Complement: P(no 6 in 4 rolls)=(5/6)⁴≈0.482. P(at least one 6)≈0.518.' },
      { prompt: '3 boxes: GGG, GGS, SSS. Pick random box, draw gold coin. P(other coin is gold)?', options: ['0.5', '2/3', '1/3', '3/4'], correct: '2/3', explain: '3 gold coins total. You drew gold: 2/3 chance it came from GGG box (other=G), 1/3 from GGS (other=S). P=2/3.' },
      { prompt: 'Die roll: odd → win that amount; even → roll again (until odd). EV?', options: ['2.5', '3.5', '4.0', '3.0'], correct: '3.5', explain: 'P(odd)=1/2. E[odd roll]=(1+3+5)/3=3. E=3.5 by geometric series. Same as expected die roll.' },
    ],
  },

  probGauntletBoss: {
    key: 'probGauntletBoss', title: 'Lab 1 Boss: Probability Gauntlet', icon: '🏆',
    subtitle: 'Five boss-level problems — full marks required to pass',
    type: 'mcq',
    questions: [
      { prompt: 'Prior P(alpha)=10%. Signal: P(signal|alpha)=0.9, P(signal|noise)=0.3. Signal fires. P(alpha|signal)?', options: ['25%', '50%', '90%', '10%'], correct: '25%', explain: 'Bayes: 0.09/(0.09+0.27)=0.25. Even a strong signal barely moves a 10% prior.' },
      { prompt: 'Sharpe=1.5 over 2 years of daily data. t-stat = Sharpe × √N. N=504. Significant at 5%?', options: ['No — need higher Sharpe', 'Yes — t≈33.6 >> 1.96', 'Borderline', 'Cannot determine'], correct: 'Yes — t≈33.6 >> 1.96', explain: 't=1.5×√504≈33.6. Massively significant with 504 observations.' },
      { prompt: 'Kelly: edge=5%, odds=2:1 (win 2x, lose 1x). Optimal fraction?', options: ['5%', '10%', '7.5%', '50%'], correct: '10%', explain: 'f*=(bp−q)/b. p=0.55, q=0.45, b=2. f*=(2×0.55−0.45)/2=0.65/2≈0.325. For the simpler 2:1 odds framing: f*=edge/odds=0.1.' },
      { prompt: '200 independent tests at α=0.05. Expected false positives from noise?', options: ['1', '5', '10', '20'], correct: '10', explain: '200×0.05=10. Any discoveries must be corrected for 10 expected false positives.' },
      { prompt: 'Returns i.i.d. N(μ,σ²). The 95% 1-day VaR is:', options: ['μ−1.645σ', 'μ−1.96σ', 'μ+1.645σ', '−1.96σ'], correct: 'μ−1.645σ', explain: '5th percentile=μ−1.645σ. One-tailed 5%=1.645z.' },
    ],
  },

  statsIntroQuiz: {
    key: 'statsIntroQuiz', title: 'Statistics as the BS Detector', icon: '🔍',
    subtitle: 'Match the statistical concept to what it detects',
    type: 'match',
    pairs: [
      { left: 'Hypothesis test', right: 'Is this result distinguishable from chance?' },
      { left: 'Confidence interval', right: 'Range of plausible true parameter values' },
      { left: 'p-value', right: 'P(data this extreme | null hypothesis true)' },
      { left: 'Type I error', right: 'False positive — rejecting a true null' },
      { left: 'Type II error', right: 'False negative — failing to reject a false null' },
    ],
  },

  hypothesisBuilder: {
    key: 'hypothesisBuilder', title: 'Setting Up Hypothesis Tests', icon: '🔬',
    subtitle: 'Formulate H0 and H1 correctly for finance scenarios',
    type: 'mcq',
    questions: [
      { prompt: 'Test if strategy mean daily return ≠ 0. What is H0?', options: ['H0: μ > 0', 'H0: μ = 0', 'H0: μ ≠ 0', 'H0: μ < 0'], correct: 'H0: μ = 0', explain: 'Null hypothesis = "no effect". Mean return is zero. H1: μ ≠ 0 (two-tailed).' },
      { prompt: 'Correct test for "mean return significantly positive":', options: ['Two-tailed t-test', 'One-tailed t-test (right)', 'Chi-square test', 'F-test'], correct: 'One-tailed t-test (right)', explain: 'You care only about positive direction. H1: μ > 0. One-tailed right test.' },
      { prompt: 'Test 50 strategies at α=0.05. Expected significant results from noise alone?', options: ['0', '1', '2.5', '5'], correct: '2.5', explain: '50×0.05=2.5. About 2-3 strategies will appear significant by pure chance.' },
      { prompt: 'Power of a test = ?', options: ['P(reject H0 | H0 true)', 'P(reject H0 | H0 false)', 'P(H0 true)', '1−α'], correct: 'P(reject H0 | H0 false)', explain: 'Power = 1−β = P(correctly detecting a real effect). Higher power = more sensitive test.' },
    ],
  },

  neweyWestQuiz: {
    key: 'neweyWestQuiz', title: 'OLS Errors in Finance', icon: '📉',
    subtitle: 'When OLS standard errors are wrong and the fix',
    type: 'mcq',
    questions: [
      { prompt: 'OLS i.i.d. assumption fails in finance because:', options: ['Returns are always positive', 'Autocorrelation and heteroskedasticity are common', 'Sample sizes are too small', 'Returns are discrete'], correct: 'Autocorrelation and heteroskedasticity are common', explain: 'Volatility clustering (GARCH) and serial correlation in returns violate i.i.d. OLS errors are then wrong.' },
      { prompt: 'Using OLS SEs with autocorrelated residuals will:', options: ['Overestimate SEs (conservative)', 'Underestimate SEs (anti-conservative)', 'Have no effect', 'Depends on sign of autocorrelation'], correct: 'Underestimate SEs (anti-conservative)', explain: 'Positive serial correlation inflates apparent information. OLS SEs too small → t-stats too high → p-values too low.' },
      { prompt: 'Newey-West corrects for:', options: ['Heteroskedasticity only', 'Autocorrelation only', 'Both (HAC — heteroskedasticity and autocorrelation consistent)', 'Cross-sectional data only'], correct: 'Both (HAC — heteroskedasticity and autocorrelation consistent)', explain: 'Newey-West produces HAC standard errors. Standard in time-series regression in finance.' },
    ],
  },

  confidenceIntervalQuiz: {
    key: 'confidenceIntervalQuiz', title: 'Confidence Intervals', icon: '📏',
    subtitle: 'Construct and interpret confidence intervals correctly',
    type: 'mcq',
    questions: [
      { prompt: '95% CI [0.02%, 0.18%]. Does this mean 95% chance the true mean is in this interval?', options: ['Yes', 'No — the parameter is fixed; the interval is random', 'Yes for normal distributions', 'No — it means 95% of returns fall there'], correct: 'No — the parameter is fixed; the interval is random', explain: 'Frequentist: 95% of CIs constructed this way will contain the true mean. This specific interval either does or doesn\'t.' },
      { prompt: 'CI formula: x̄ ± z×(σ/√n). Doubling n changes width by factor:', options: ['÷2', '÷√2', '×2', 'No change'], correct: '÷√2', explain: 'Width ∝ 1/√n. Double n → width shrinks by √2. Need 4× data for half-width.' },
      { prompt: 'Sharpe estimate 1.2, 95% CI [0.3, 2.1]. Conclusion?', options: ['Sharpe definitely > 0', 'Wide CI — estimate very uncertain', 'Strategy should be traded', 'Sharpe reliably above 1'], correct: 'Wide CI — estimate very uncertain', explain: 'CI spanning 0.3–2.1 means the true Sharpe could be anywhere from weak to strong. Need more data.' },
    ],
  },

  mleQuiz: {
    key: 'mleQuiz', title: 'Maximum Likelihood Estimation', icon: '🎯',
    subtitle: 'MLE — parameters that maximise the probability of the data',
    type: 'mcq',
    questions: [
      { prompt: 'MLE for the mean of a normal distribution is:', options: ['The median', 'The sample mean x̄', 'The mode', 'The trimmed mean'], correct: 'The sample mean x̄', explain: 'For N(μ,σ²) the log-likelihood is maximised at μ̂=x̄. The sample mean IS the MLE.' },
      { prompt: 'stats.t.fit(returns) performs:', options: ['OLS regression', 'MLE fit of Student-t params (df, loc, scale)', 'Method of moments', 'Bayesian inference'], correct: 'MLE fit of Student-t params (df, loc, scale)', explain: 'scipy .fit() uses MLE. Returns (df, loc, scale) maximising the likelihood of observing the data.' },
      { prompt: 'Why fit Student-t instead of normal to daily returns?', options: ['Normal is too slow', 'Returns have fat tails — t captures this, normal understates tail risk', 'Required by regulation', 'Easier to compute'], correct: 'Returns have fat tails — t captures this, normal understates tail risk', explain: 'Financial returns have kurtosis > 3. Student-t\'s df parameter captures tail thickness. Normal VaR systematically underestimates extreme losses.' },
    ],
  },

  backtestingQuiz: {
    key: 'backtestingQuiz', title: 'Backtesting Errors', icon: '⚠️',
    subtitle: 'Identify the backtesting mistake in each scenario',
    type: 'mcq',
    questions: [
      { prompt: 'You use today\'s index composition to select stocks for a backtest starting 10 years ago.', options: ['Valid', 'Survivorship bias — failures are excluded', 'Look-ahead bias', 'Both survivorship and look-ahead'], correct: 'Survivorship bias — failures are excluded', explain: 'Current index excludes companies that failed/delisted. Historical backtest must use historical composition.' },
      { prompt: 'Your 50-day moving average is computed using the next day\'s close.', options: ['Standard practice', 'Look-ahead bias — using future data', 'Survivorship bias', 'Overfitting'], correct: 'Look-ahead bias — using future data', explain: 'You cannot know tomorrow\'s close today. Any signal using future data creates artificially good backtests.' },
      { prompt: '500 parameter combinations tested, best result published with no correction.', options: ['Acceptable — disclosed the search', 'Data dredging / p-hacking — overfitting to noise', 'Correct procedure', 'Required for publication'], correct: 'Data dredging / p-hacking — overfitting to noise', explain: '500 tests at α=0.05 → 25 expected false positives. Reporting the best without correction is misleading.' },
      { prompt: 'All trades execute at open price with zero market impact.', options: ['Conservative', 'Transaction cost blindness — slippage and impact can eliminate edge', 'Standard institutional practice', 'Only an issue for small funds'], correct: 'Transaction cost blindness — slippage and impact can eliminate edge', explain: 'Real execution has bid-ask spread, market impact, slippage. Frequent-trading strategies are often killed by costs.' },
      { prompt: 'Parameters tuned on the same data the backtest runs on.', options: ['Standard practice', 'In-sample overfitting — parameters fitted to noise', 'Only valid with simple parameters', 'Acceptable with enough data'], correct: 'In-sample overfitting — parameters fitted to noise', explain: 'Parameters tuned on training data will appear optimal there. Requires walk-forward or separate hold-out set.' },
    ],
  },

  overfittingQuiz: {
    key: 'overfittingQuiz', title: 'Overfitting & Estimation Error', icon: '📉',
    subtitle: 'Identify overfitting red flags in quantitative strategies',
    type: 'mcq',
    questions: [
      { prompt: 'In-sample Sharpe: 3.5. Out-of-sample Sharpe: 0.2. Diagnosis?', options: ['Needs more data', 'Severe overfitting — model memorised in-sample noise', 'Good — some decay expected', 'Execution is the problem'], correct: 'Severe overfitting — model memorised in-sample noise', explain: '18× degradation in-sample to OOS is the hallmark of overfitting.' },
      { prompt: 'MVO portfolio: in-sample Sharpe 2.8, OOS Sharpe 0.6. Most likely cause?', options: ['Bad execution', 'Estimation error in covariance and returns — MVO is hypersensitive', 'Regime change', 'Transaction costs'], correct: 'Estimation error in covariance and returns — MVO is hypersensitive', explain: 'Small errors in μ and Σ create wildly different and often garbage portfolios. Michaud\'s "error maximiser" critique.' },
      { prompt: 'Best protection against overfitting?', options: ['More parameters', 'Use only in-sample data', 'Out-of-sample testing on genuinely unseen data', 'Longer lookback periods'], correct: 'Out-of-sample testing on genuinely unseen data', explain: 'Hold out data the strategy never touched during development. Walk-forward analysis simulates this iteratively.' },
    ],
  },

  timeSeriesQuiz: {
    key: 'timeSeriesQuiz', title: 'Autocorrelation & Stationarity', icon: '📈',
    subtitle: 'Time series properties in financial data',
    type: 'mcq',
    questions: [
      { prompt: 'Is a stock price series typically stationary?', options: ['Yes — prices revert to mean', 'No — prices follow a random walk', 'Yes — they are bounded', 'Depends on the stock'], correct: 'No — prices follow a random walk', explain: 'Stock prices have unit roots — they drift without reverting. Returns (differences) are typically stationary.' },
      { prompt: 'Daily return autocorrelation at lag 1 in liquid markets is typically:', options: ['Strong positive (momentum)', 'Strong negative (reversal)', 'Near zero', 'Exactly zero by theory'], correct: 'Near zero', explain: 'Strong autocorrelation would be easily arbitraged. Daily returns in liquid markets are approximately uncorrelated.' },
      { prompt: 'Augmented Dickey-Fuller test tests for:', options: ['Normality', 'Unit roots (non-stationarity)', 'Autocorrelation', 'Heteroskedasticity'], correct: 'Unit roots (non-stationarity)', explain: 'ADF: reject null = stationary. Fail to reject = non-stationary (unit root present).' },
    ],
  },

  signalNoiseBoss: {
    key: 'signalNoiseBoss', title: 'Lab 2 Boss: Signal or Noise Tribunal', icon: '🏆',
    subtitle: 'The tribunal — is this a real signal or noise?',
    type: 'mcq',
    questions: [
      { prompt: '60% win rate over 50 trades. t=(0.60−0.50)/√(0.25/50)=1.41. Significant at α=0.05?', options: ['Yes — above 50%', 'No — t=1.41 < 1.96', 'Yes — one-tailed', 'Inconclusive'], correct: 'No — t=1.41 < 1.96', explain: 't=1.41 < 1.96. Cannot reject H0. 50 trades insufficient to confirm a real 60% win rate.' },
      { prompt: 'Sharpe 1.8 over 1000 daily returns. t=1.8×√1000≈56.9. Significant?', options: ['No — need higher Sharpe', 'Yes — massively significant', 'Marginally', 'Depends on distribution'], correct: 'Yes — massively significant', explain: 't=56.9 >> 1.96. With 1000 observations a Sharpe of 1.8 is extraordinarily significant.' },
      { prompt: 'Screened 1000 factors, 30 have p<0.05. After Bonferroni (p<0.00005), how many survive?', options: ['30', '~5', 'Likely 0–2', 'Still 30'], correct: 'Likely 0–2', explain: 'Bonferroni: 0.05/1000=0.00005. Most of the 30 were false positives. Only very strong factors survive.' },
      { prompt: 'OOS Sharpe is 40% of in-sample Sharpe. Red flag or reasonable?', options: ['Red flag — severe overfitting', 'Reasonable — some decay expected', 'Cannot assess', 'Always acceptable'], correct: 'Reasonable — some decay expected', explain: '40–60% retention is generally considered acceptable. <20% suggests overfitting. 100% is suspicious.' },
      { prompt: 'Paper reports 150 alphas, best has Sharpe 4.2 in-sample. No OOS test. Your prior?', options: ['Very high — strong Sharpe', 'Very low — massive multiple comparisons with no correction', 'Moderate', 'Cannot assess'], correct: 'Very low — massive multiple comparisons with no correction', explain: 'Testing 150 factors, expected max Sharpe from pure noise is 3–4. Sharpe 4.2 from 150 tests is consistent with noise.' },
    ],
  },

  linAlgFinanceQuiz: {
    key: 'linAlgFinanceQuiz', title: 'Why Linear Algebra Runs Finance', icon: '🔢',
    subtitle: 'Match the LA operation to its finance application',
    type: 'match',
    pairs: [
      { left: 'R @ w (matrix multiply)', right: 'Portfolio returns from weight vector' },
      { left: 'Eigendecomposition of Σ', right: 'PCA — extract dominant risk factors' },
      { left: 'w\'Σw (quadratic form)', right: 'Portfolio variance' },
      { left: 'Solving Ax = b', right: 'OLS regression coefficients (prefer over inv)' },
      { left: 'SVD of returns matrix', right: 'Low-rank factor model approximation' },
    ],
  },

  portfolioWeightsCalc: {
    key: 'portfolioWeightsCalc', title: 'Portfolio Weight Constraints', icon: '⚖️',
    subtitle: 'Weight constraints and their implications',
    type: 'mcq',
    questions: [
      { prompt: 'Long-only constraint means:', options: ['Weights sum to zero', 'All weights ≥ 0 and sum to 1', 'Equal weights', 'Weights between −1 and 1'], correct: 'All weights ≥ 0 and sum to 1', explain: 'Long-only: no shorts (w_i ≥ 0) and fully invested (Σw_i=1).' },
      { prompt: '130/30 portfolio: net exposure?', options: ['100%', '160%', '30%', '130%'], correct: '100%', explain: 'Net = 130 − 30 = 100%. Gross = 160%. Market neutral = net near 0%.' },
      { prompt: 'Unconstrained MVO often produces:', options: ['Equal weights', 'Extreme weights — heavy leverage and shorts', 'Minimum variance always', 'Near-zero weights'], correct: 'Extreme weights — heavy leverage and shorts', explain: 'Without constraints, MVO exploits estimation errors in μ and Σ to produce wildly unstable portfolios. Constraints are essential.' },
    ],
  },

  eigenQuiz: {
    key: 'eigenQuiz', title: 'Eigenvalues in Finance', icon: '🌀',
    subtitle: 'Interpreting eigenstructure in portfolio and risk contexts',
    type: 'mcq',
    questions: [
      { prompt: 'First eigenvector of a stock return covariance matrix typically represents:', options: ['Minimum variance portfolio', 'The market factor — broad market movement', 'Highest Sharpe portfolio', 'Random noise'], correct: 'The market factor — broad market movement', explain: 'Largest eigenvalue corresponds to systematic market risk. First PC ≈ equal-weight market portfolio.' },
      { prompt: 'Sum of all eigenvalues of a covariance matrix equals:', options: ['1', 'Total portfolio variance', 'Sum of diagonal variances (trace)', 'Number of assets'], correct: 'Sum of diagonal variances (trace)', explain: 'Trace(Σ) = sum of diagonal = sum of eigenvalues = total variance.' },
      { prompt: 'All eigenvalues of a valid covariance matrix must be:', options: ['Positive', 'Non-negative', 'Less than 1', 'Equal'], correct: 'Non-negative', explain: 'PSD requires all eigenvalues ≥ 0. Negative eigenvalues indicate a broken covariance matrix — insufficient data or coding error.' },
    ],
  },

  svdQuiz: {
    key: 'svdQuiz', title: 'SVD & Matrix Decompositions', icon: '🔀',
    subtitle: 'When to use SVD, Cholesky, LU in practice',
    type: 'match',
    pairs: [
      { left: 'SVD: A = UΣVᵀ', right: 'Low-rank approximation, PCA, pseudoinverse' },
      { left: 'Cholesky: Σ = LLᵀ', right: 'Simulate correlated random variables' },
      { left: 'LU decomposition', right: 'Efficient solution of linear systems' },
      { left: 'Eigendecomposition: A = QΛQᵀ', right: 'Symmetric matrices — PCA, spectral methods' },
      { left: 'np.linalg.solve vs inv+multiply', right: 'solve is faster and more numerically stable' },
    ],
  },

  riskDecompQuiz: {
    key: 'riskDecompQuiz', title: 'Portfolio Risk Decomposition', icon: '🧩',
    subtitle: 'Factor and idiosyncratic risk decomposition',
    type: 'mcq',
    questions: [
      { prompt: '2-asset portfolio, equal weights, ρ=0.6, σ₁=σ₂=20%. Portfolio σ?', options: ['20%', '16%', '17.9%', '28.3%'], correct: '17.9%', explain: 'Var=0.25×0.04+0.25×0.04+2×0.5×0.5×0.6×0.04=0.032. σ=√0.032=17.9%.' },
      { prompt: 'Factor model covariance: Σ = βΦβ\' + D. What is D?', options: ['Factor covariance', 'Factor loadings', 'Diagonal idiosyncratic variances', 'Residual covariance'], correct: 'Diagonal idiosyncratic variances', explain: 'D is diagonal — per-asset idiosyncratic (specific) risk not explained by the factors.' },
      { prompt: 'Risk parity requires:', options: ['Equal weights', 'Equal w_i × MCR_i for all assets', 'Equal volatility weights', 'Minimum variance'], correct: 'Equal w_i × MCR_i for all assets', explain: 'Risk parity: each asset contributes equally to total portfolio risk. Inversely weights by risk contribution.' },
    ],
  },

  corrVsCovQuiz: {
    key: 'corrVsCovQuiz', title: 'Correlation vs Covariance', icon: '📊',
    subtitle: 'When to use each and what they reveal',
    type: 'mcq',
    questions: [
      { prompt: 'AAPL-GOOG: cov=0.0012, σ_AAPL=0.18, σ_GOOG=0.20. Correlation?', options: ['0.0012', '0.033', '0.60', '12%'], correct: '0.033', explain: 'ρ=cov/(σ₁σ₂)=0.0012/0.036=0.033. Very low correlation.' },
      { prompt: 'Portfolio optimiser needs:', options: ['Correlation only', 'Covariance — variance = w\'Σw', 'Either', 'Neither — use betas'], correct: 'Covariance — variance = w\'Σw', explain: 'Portfolio variance requires the covariance matrix. Correlation lacks scale information (σ) needed for Σ.' },
      { prompt: 'High correlation between portfolio assets means:', options: ['Higher combined return', 'Less diversification benefit', 'Guaranteed same direction', 'Lower combined volatility'], correct: 'Less diversification benefit', explain: 'Diversification reduces risk proportional to (1−ρ). High ρ → less risk reduction.' },
    ],
  },

  regressionMatrixQuiz: {
    key: 'regressionMatrixQuiz', title: 'OLS as Matrix Operations', icon: '📐',
    subtitle: 'Linear regression in matrix form',
    type: 'match',
    pairs: [
      { left: 'β̂ = (X\'X)⁻¹X\'y', right: 'OLS coefficient estimator' },
      { left: 'X is n×(k+1)', right: 'Design matrix: n observations, k features + intercept' },
      { left: 'R² = 1 − SSR/SST', right: 'Fraction of variance explained' },
      { left: 'Residuals ê = y − Xβ̂', right: 'Unexplained component — should be white noise' },
      { left: 'Var(β̂) = σ²(X\'X)⁻¹', right: 'Covariance matrix of coefficient estimates' },
    ],
  },

  dimReducQuiz: {
    key: 'dimReducQuiz', title: 'Dimensionality Reduction in Practice', icon: '📉',
    subtitle: 'PCA and factor models for risk compression',
    type: 'mcq',
    questions: [
      { prompt: '500 assets, first 10 PCs explain 80% of variance. Implication?', options: ['Use only 10 assets', '10 underlying factors drive most risk', 'Discard remaining 490', 'Need more data'], correct: '10 underlying factors drive most risk', explain: '80% of variance in 500 assets explained by 10 factors = highly structured market. Factor models represent risk compactly.' },
      { prompt: 'When to standardise before PCA on returns:', options: ['Always', 'Never', 'When assets have very different volatilities', 'Only for binary data'], correct: 'When assets have very different volatilities', explain: 'High-vol assets dominate first PC in raw returns. Standardising gives each asset equal weight (correlation matrix PCA).' },
      { prompt: '5-factor PCA model vs raw 500×500 covariance. Key advantage?', options: ['PCA is more accurate', 'Factor model is lower-rank — more stable with less data', 'Regulators require it', 'PCA eliminates all risk'], correct: 'Factor model is lower-rank — more stable with less data', explain: 'Estimating 500×500 covariance reliably needs ~125k data points. 5-factor model needs far less. More stable, less overfitted.' },
    ],
  },

  portfolioBoss: {
    key: 'portfolioBoss', title: 'Lab 3 Boss: Portfolio Construction', icon: '🏆',
    subtitle: 'Portfolio construction under real constraints',
    type: 'mcq',
    questions: [
      { prompt: 'MVO gives weights [−0.5, 1.8, −0.3] summing to 1. What constraint was violated?', options: ['Full investment', 'Long-only (w_i ≥ 0)', 'Max position size', 'Sector limit'], correct: 'Long-only (w_i ≥ 0)', explain: 'Negative weights = short positions. Long-only constraint was not applied.' },
      { prompt: 'Markowitz efficient frontier: global minimum variance portfolio is at:', options: ['Rightmost point', 'Leftmost point of upper frontier', 'Tangency with CML', 'The midpoint'], correct: 'Leftmost point of upper frontier', explain: 'GMV has lowest possible variance. Leftmost point on the parabola. Efficient frontier is the upper arc above it.' },
      { prompt: 'Covariance matrix has a negative eigenvalue. Problem?', options: ['No problem — just negative correlation', 'Not PSD — portfolio variance can be negative, must fix', 'Discard those assets', 'Use absolute values'], correct: 'Not PSD — portfolio variance can be negative, must fix', explain: 'Non-PSD means variance can be negative — mathematically impossible. Fix: eigenvalue floor at ε > 0 or Ledoit-Wolf shrinkage.' },
      { prompt: 'Ledoit-Wolf estimator shrinks toward identity. Why?', options: ['Makes all correlations zero', 'Reduces estimation error — shrinks extreme estimates toward stable prior', 'Required for convex optimisation', 'Faster to compute'], correct: 'Reduces estimation error — shrinks extreme estimates toward stable prior', explain: 'Sample covariance has high estimation error for short histories. Shrinkage reduces overfitting to the estimation period.' },
      { prompt: 'In-sample Markowitz Sharpe 3.1, OOS 0.4. Root cause?', options: ['Transaction costs', 'Estimation error in expected returns — MVO is hypersensitive to μ', 'Regime change', 'Wrong benchmark'], correct: 'Estimation error in expected returns — MVO is hypersensitive to μ', explain: 'Small errors in estimated returns flip optimal weights dramatically. Michaud\'s "error maximiser" critique.' },
    ],
  },

  calculusIntroQuiz: {
    key: 'calculusIntroQuiz', title: 'Why Calculus Runs Finance', icon: '∂',
    subtitle: 'Match the calculus concept to its finance use case',
    type: 'match',
    pairs: [
      { left: 'f\'(x) = 0', right: 'Finding optimal portfolio weights' },
      { left: 'f\'\'(x) > 0', right: 'Confirming a minimum (convex function)' },
      { left: '∂C/∂S', right: 'Option Delta' },
      { left: 'Taylor expansion', right: 'Delta-gamma approximation of option P&L' },
      { left: 'Gradient ∇f', right: 'Direction of steepest ascent in parameter space' },
    ],
  },

  derivativeCalcQuiz: {
    key: 'derivativeCalcQuiz', title: 'Derivatives in Finance', icon: '📐',
    subtitle: 'Compute derivatives of common finance functions',
    type: 'mcq',
    questions: [
      { prompt: 'd/dS of S. Delta of a forward on S?', options: ['0', '1', 'S', '1/S'], correct: '1', explain: 'd(S)/dS=1. A forward moves dollar-for-dollar with the underlying.' },
      { prompt: 'd/dS of ln(S). Appears in log-return definitions:', options: ['1', 'S', '1/S', 'ln(S)'], correct: '1/S', explain: 'd(ln S)/dS=1/S. So d(ln S)=dS/S = simple return for small moves.' },
      { prompt: 'Vega = ∂C/∂σ for a call option. Sign?', options: ['Always negative', 'Always positive', 'Zero', 'Depends on moneyness'], correct: 'Always positive', explain: 'More volatility = higher option value for both calls and puts. Vega > 0 always.' },
      { prompt: 'Bond price-yield has d²P/dy² > 0. This means:', options: ['Price falls faster than linear for rising yields', 'Price falls slower than linear — convexity benefits the holder', 'Price is constant', 'Duration is negative'], correct: 'Price falls slower than linear — convexity benefits the holder', explain: 'Positive convexity: yields rise → price falls less than duration predicts. Yields fall → price rises more. Always benefits the holder.' },
    ],
  },

  taylorQuiz: {
    key: 'taylorQuiz', title: 'Taylor Expansion in Finance', icon: '📊',
    subtitle: 'Delta-gamma approximation and bond convexity',
    type: 'mcq',
    questions: [
      { prompt: 'ΔP ≈ Δ×ΔS + ½Γ×ΔS². This is the:', options: ['Black-Scholes formula', 'Delta-gamma P&L approximation', 'Kelly formula', 'CAPM'], correct: 'Delta-gamma P&L approximation', explain: 'First-order Taylor: linear Delta term. Second-order adds Gamma (curvature of option value).' },
      { prompt: 'For a deep in-the-money call, Gamma is:', options: ['Maximum', 'Near zero', 'Negative', 'Equal to Delta'], correct: 'Near zero', explain: 'Gamma peaks at-the-money. Deep ITM call behaves linearly like a stock — Delta≈1, Gamma≈0.' },
      { prompt: 'Bond: P ≈ P₀ − D*Δy + ½C(Δy)². Sign of the convexity term?', options: ['Always negative', 'Always positive', 'Depends on bond', 'Zero for most bonds'], correct: 'Always positive', explain: '½C(Δy)² is always ≥ 0 (Δy² ≥ 0, C > 0 for plain bonds). Convexity always helps the holder.' },
    ],
  },

  convexOptQuiz: {
    key: 'convexOptQuiz', title: 'Convex Optimisation', icon: '🎯',
    subtitle: 'Identify convex vs non-convex problems',
    type: 'mcq',
    questions: [
      { prompt: 'Minimise w\'Σw s.t. w\'1=1, w≥0 with Σ PSD. Convex?', options: ['Yes — QP with linear constraints', 'No — non-linear constraints', 'Depends on Σ', 'Only if Σ diagonal'], correct: 'Yes — QP with linear constraints', explain: 'Quadratic objective (PSD Σ) + linear constraints = convex QP. Global optimum guaranteed. Use cvxpy.' },
      { prompt: 'Maximise Sharpe = (w\'μ−r_f)/√(w\'Σw). Convex?', options: ['Yes — it\'s a ratio', 'No — quasi-convex but not convex', 'Only with constraints', 'Yes via MVO'], correct: 'No — quasi-convex but not convex', explain: 'Sharpe max is quasi-convex — multiple local optima possible. Use multiple starting points with scipy.' },
      { prompt: 'Key advantage of convex over non-convex problems:', options: ['Faster to compute', 'Global optimum guaranteed — no local optima traps', 'Fewer constraints needed', 'Closed-form always exists'], correct: 'Global optimum guaranteed — no local optima traps', explain: 'For convex problems any local minimum is global. Solvers (cvxpy, OSQP) find the exact solution.' },
    ],
  },

  thetaVegaQuiz: {
    key: 'thetaVegaQuiz', title: 'Theta & Vega', icon: 'θ',
    subtitle: 'Theta decay and Vega sensitivity — interpret and apply',
    type: 'mcq',
    questions: [
      { prompt: 'Theta = ∂C/∂t. For a long option position, Theta is:', options: ['Positive', 'Negative — option loses value with time', 'Zero', 'Positive only for calls'], correct: 'Negative — option loses value with time', explain: 'Long options have negative Theta. Option sellers (short) have positive Theta (they earn the decay).' },
      { prompt: 'Long straddle (long call + long put). Vega?', options: ['Zero — Vega cancels', 'Positive — both gain from higher vol', 'Negative', 'Depends on delta'], correct: 'Positive — both gain from higher vol', explain: 'Both calls and puts have positive Vega. Long straddle profits from rising implied volatility.' },
      { prompt: 'Theta=−0.05/day. 7 days pass, nothing else changes. P&L?', options: ['+$0.35', '−$0.35', '+$0.05', 'Cannot determine'], correct: '−$0.35', explain: 'Theta × days = −0.05 × 7 = −$0.35. Linear approximation of daily decay.' },
    ],
  },

  chainRuleQuiz: {
    key: 'chainRuleQuiz', title: 'Chain Rule in Finance', icon: '🔗',
    subtitle: 'Propagating sensitivities through dependencies',
    type: 'mcq',
    questions: [
      { prompt: 'C = f(S, σ(t)). Total derivative w.r.t. t:', options: ['∂C/∂t only', '∂C/∂σ × ∂σ/∂t + ∂C/∂t', '∂C/∂σ only', 'dC/dσ'], correct: '∂C/∂σ × ∂σ/∂t + ∂C/∂t', explain: 'Chain rule. Direct (Theta) + indirect through σ (Vega × ∂σ/∂t).' },
      { prompt: 'Why is chain rule essential for risk management?', options: ['Computes correlation', 'Propagates sensitivities through chains of dependencies', 'Simplifies linear systems', 'Handles stochastic variables'], correct: 'Propagates sensitivities through chains of dependencies', explain: 'Positions depend on instruments depend on risk factors. Chain rule propagates Greeks through the full dependency chain.' },
    ],
  },

  hessianQuiz: {
    key: 'hessianQuiz', title: 'Gradient & Hessian', icon: '∇²',
    subtitle: 'Second-order optimisation methods',
    type: 'match',
    pairs: [
      { left: '∇f = 0', right: 'Necessary condition for a local optimum' },
      { left: 'Hessian H positive definite', right: 'Confirms local minimum' },
      { left: 'Hessian H negative definite', right: 'Confirms local maximum' },
      { left: 'Hessian H indefinite', right: 'Saddle point — not a local extremum' },
      { left: 'Newton step: −H⁻¹∇f', right: 'Faster convergence than gradient descent' },
    ],
  },

  partialDerivQuiz: {
    key: 'partialDerivQuiz', title: 'Partial Derivatives & Risk', icon: '∂',
    subtitle: 'Risk sensitivities as partial derivatives',
    type: 'mcq',
    questions: [
      { prompt: '∂P/∂r for an options portfolio is called:', options: ['Delta', 'Rho', 'Vega', 'Theta'], correct: 'Rho', explain: 'Rho = sensitivity to interest rate changes. Important for fixed income and rate-sensitive options.' },
      { prompt: '∂²P/∂S² is called:', options: ['Delta', 'Gamma', 'Vega', 'Theta'], correct: 'Gamma', explain: 'Gamma = ∂²C/∂S² = rate of change of Delta. Measures convexity of option value.' },
      { prompt: '∂²P/∂S∂σ is called:', options: ['Gamma', 'Vanna', 'Charm', 'Volga'], correct: 'Vanna', explain: 'Vanna = ∂Delta/∂σ = ∂Vega/∂S. Important for vol surface hedging.' },
    ],
  },

  integerProgQuiz: {
    key: 'integerProgQuiz', title: 'Integer Programming', icon: '🔢',
    subtitle: 'Combinatorial optimisation in finance',
    type: 'mcq',
    questions: [
      { prompt: 'Select exactly 10 of 100 stocks. Problem type?', options: ['Continuous QP', 'Binary integer program — 0/1 per stock', 'LP', 'Unconstrained'], correct: 'Binary integer program — 0/1 per stock', explain: 'Binary variable x_i ∈ {0,1}. Constraint: Σx_i=10. Classic cardinality-constrained portfolio.' },
      { prompt: 'Continuous relaxation of an integer program:', options: ['Solves the original problem', 'Gives a lower bound — may not be integer feasible', 'Always gives the optimal integer solution', 'Is not useful'], correct: 'Gives a lower bound — may not be integer feasible', explain: 'Relaxing integer constraints gives an easier problem. Its optimal value bounds the integer problem from below.' },
      { prompt: 'Branch and bound is used for:', options: ['Gradient descent', 'Solving integer programs by systematic enumeration with bounding', 'Fitting ML models', 'Time series analysis'], correct: 'Solving integer programs by systematic enumeration with bounding', explain: 'B&B: divide feasible region, bound subproblems, prune suboptimal branches. Used by Gurobi, CPLEX.' },
    ],
  },

  mlOptQuiz: {
    key: 'mlOptQuiz', title: 'ML Optimisation in Finance', icon: '🤖',
    subtitle: 'Regularisation, gradient descent, and ML for alpha',
    type: 'mcq',
    questions: [
      { prompt: 'L1 regularisation (LASSO) produces:', options: ['Smooth coefficients', 'Sparse — many exactly zero', 'Identical to OLS', 'Negative only'], correct: 'Sparse — many exactly zero', explain: 'LASSO penalty |β| forces unimportant features to exactly zero. Good for automatic feature selection.' },
      { prompt: 'L2 regularisation (Ridge) prevents overfitting by:', options: ['Zeroing features', 'Shrinking all coefficients toward zero (not exactly)', 'Increasing bias', 'Removing correlated features'], correct: 'Shrinking all coefficients toward zero (not exactly)', explain: 'Ridge penalty β² shrinks all coefficients proportionally. No sparsity — all features contribute.' },
      { prompt: 'Cross-validation for financial time series must:', options: ['Use random splits', 'Respect time ordering — future data cannot train for past predictions', 'Balance classes', 'Scale features first'], correct: 'Respect time ordering — future data cannot train for past predictions', explain: 'k-fold CV randomly splits — future leaks into training for time series. Use walk-forward cross-validation.' },
    ],
  },

  stochCalcIntroQuiz: {
    key: 'stochCalcIntroQuiz', title: 'Stochastic Calculus — The Intuition', icon: '🌊',
    subtitle: 'Match the concept to its role in the framework',
    type: 'match',
    pairs: [
      { left: 'Brownian motion Wt', right: 'Continuous random walk — base process for all models' },
      { left: 'Geometric Brownian Motion', right: 'dS = μS dt + σS dW — stock price model' },
      { left: 'Itô\'s lemma', right: 'Chain rule for stochastic processes — adds ½σ² correction' },
      { left: 'Risk-neutral measure Q', right: 'Drift replaced by r — enables risk-free pricing' },
      { left: 'Self-financing portfolio', right: 'P&L comes only from price changes, not capital injections' },
    ],
  },

  itoQuiz: {
    key: 'itoQuiz', title: 'Itô\'s Lemma', icon: '∫',
    subtitle: 'Apply Itô to derive option pricing results',
    type: 'mcq',
    questions: [
      { prompt: 'For f(S,t), dS=μSdt+σSdW. The extra Itô term vs ordinary calculus:', options: ['No extra term', '½σ²S²∂²f/∂S² dt', 'σS∂f/∂S dW only', 'μS∂f/∂S dt only'], correct: '½σ²S²∂²f/∂S² dt', explain: 'Itô correction: ½×(dS)²×f_SS = ½σ²S²f_SS dt. (dW)²=dt. Absent in ordinary calculus.' },
      { prompt: 'Applying Itô to f=ln(S) where dS=μSdt+σSdW gives:', options: ['(μ)dt + σdW', '(μ−½σ²)dt + σdW', 'σdW', 'μ/S dt'], correct: '(μ−½σ²)dt + σdW', explain: 'f_S=1/S, f_SS=−1/S². Itô gives (μ−½σ²)dt+σdW. The −½σ² is the Itô correction — log drift is less than μ.' },
      { prompt: 'The ½Γσ²S² term in Black-Scholes represents:', options: ['Transaction cost', 'Revenue from gamma scalping that offsets Theta decay', 'Interest rate effect', 'Jump risk'], correct: 'Revenue from gamma scalping that offsets Theta decay', explain: 'Gamma P&L from continuous delta-hedging exactly offsets Theta decay in the BS world. This is why volatility has option value.' },
    ],
  },

  putCallParityCalc: {
    key: 'putCallParityCalc', title: 'Put-Call Parity', icon: '⚖️',
    subtitle: 'Calculate and apply put-call parity',
    type: 'mcq',
    questions: [
      { prompt: 'C−P = S−Ke^{−rT}. K=100, S=105, r=5%, T=0.5yr, C=10. Find P.', options: ['2.53', '7.53', '10.00', '5.47'], correct: '2.53', explain: 'P=C−S+Ke^{−rT}=10−105+100e^{−0.025}=10−105+97.53=2.53.' },
      { prompt: 'Put-call parity holds because:', options: ['Black-Scholes assumes it', 'Both sides replicate identical payoffs — arbitrage enforces equality', 'Options markets are efficient', 'Regulatory requirement'], correct: 'Both sides replicate identical payoffs — arbitrage enforces equality', explain: 'C−P and S−Ke^{−rT} have identical payoffs at expiry. Replicating portfolios must have equal prices.' },
      { prompt: 'IV from call ≠ IV from put (same strike, expiry). Indicates:', options: ['Normal condition', 'Put-call parity violation — data error or brief arbitrage', 'Different risk premia', 'Different models used'], correct: 'Put-call parity violation — data error or brief arbitrage', explain: 'If PCP holds, IV must be equal for same strike/expiry. Discrepancy = bid-ask issue, data error, or arbitrage.' },
    ],
  },

  riskNeutralQuiz: {
    key: 'riskNeutralQuiz', title: 'Risk-Neutral Measure', icon: '⚡',
    subtitle: 'The foundation of modern derivatives pricing',
    type: 'mcq',
    questions: [
      { prompt: 'Under Q, stock drift becomes:', options: ['μ (real-world)', 'r (risk-free rate)', '0', 'μ−r'], correct: 'r (risk-free rate)', explain: 'Under Q all assets grow at r. Allows pricing by discounting expected payoffs at r, regardless of risk preferences.' },
      { prompt: 'Risk-neutral pricing: option price =', options: ['E^P[payoff]', 'e^{−rT} × E^Q[payoff]', 'E^Q[payoff]', 'E^P[payoff]/r'], correct: 'e^{−rT} × E^Q[payoff]', explain: 'Price = e^{−rT}E^Q[max(S_T−K,0)]. No need to know μ or investor risk aversion.' },
      { prompt: 'Real-world drift μ=15%, r=5%. Under Q, stock grows at:', options: ['15%', '5%', '10%', '0%'], correct: '5%', explain: 'Under Q ALL assets grow at r=5%. The real-world drift is irrelevant for pricing.' },
    ],
  },

  stochVolQuiz: {
    key: 'stochVolQuiz', title: 'Stochastic Volatility Models', icon: '🌊',
    subtitle: 'Heston, SABR, local vol, and the vol smile',
    type: 'match',
    pairs: [
      { left: 'Black-Scholes', right: 'Constant vol — flat implied vol surface' },
      { left: 'Heston model', right: 'Vol follows mean-reverting CIR process' },
      { left: 'SABR model', right: 'Industry standard for rates — forward+vol both stochastic' },
      { left: 'Volatility smile', right: 'Higher IV for OTM options — fat tails BS misses' },
      { left: 'Local vol (Dupire)', right: 'σ(S,t) exactly fits vol surface but has poor dynamics' },
    ],
  },

  mertonQuiz: {
    key: 'mertonQuiz', title: 'Merton Jump-Diffusion', icon: '📈',
    subtitle: 'Jump processes and their effect on option pricing',
    type: 'mcq',
    questions: [
      { prompt: 'Merton model adds to GBM:', options: ['Stochastic volatility', 'Poisson jump process with random jump sizes', 'Mean reversion', 'Negative drift'], correct: 'Poisson jump process with random jump sizes', explain: 'Merton (1976): dS/S=μdt+σdW+(J−1)dN. N is Poisson with intensity λ, J is random jump size.' },
      { prompt: 'Jump-diffusion better explains:', options: ['Positive skew', 'Vol smile — especially for short-dated OTM options', 'Long memory in vol', 'Seasonal patterns'], correct: 'Vol smile — especially for short-dated OTM options', explain: 'Jumps produce fat tails and negative skew in short-dated distributions — creating the vol smile absent in GBM.' },
      { prompt: 'Under Merton, European option prices are:', options: ['Exactly Black-Scholes', 'Weighted sum of BS prices across jump scenarios', 'Always higher than BS', 'Undefined'], correct: 'Weighted sum of BS prices across jump scenarios', explain: 'For Poisson jumps with n events: BS with adjusted vol, weighted by P(n jumps). Tractable closed form.' },
    ],
  },

  martingaleQuiz: {
    key: 'martingaleQuiz', title: 'Martingales in Finance', icon: '🎲',
    subtitle: 'Martingales — fair games and the FTAP',
    type: 'mcq',
    questions: [
      { prompt: 'Xt is a martingale if E[X_{t+s}|F_t] =', options: ['X_t + drift', 'X_t', 'E[X_t]', '0'], correct: 'X_t', explain: 'Martingale: best prediction of future value IS the current value. No expected drift. A fair game.' },
      { prompt: 'Discounted stock e^{−rt}S_t is a martingale under:', options: ['Real-world measure P', 'Risk-neutral measure Q', 'All measures', 'No measure'], correct: 'Risk-neutral measure Q', explain: 'Fundamental Theorem of Asset Pricing: discounted prices are Q-martingales. This underpins all of derivatives pricing.' },
      { prompt: 'Martingale Representation Theorem says:', options: ['All martingales are Brownian motions', 'Any Q-martingale can be written as a stochastic integral w.r.t. BM', 'Martingales have zero variance', 'All prices are martingales'], correct: 'Any Q-martingale can be written as a stochastic integral w.r.t. BM', explain: 'MRT: every Q-local-martingale in a complete market is a stochastic integral of BM. Underpins replication-based pricing.' },
    ],
  },

  interviewFormatQuiz: {
    key: 'interviewFormatQuiz', title: 'How the Quant Interview Works', icon: '🎯',
    subtitle: 'Know the process before you walk in',
    type: 'match',
    pairs: [
      { left: 'HireVue / Kira', right: 'Recorded video screening — structured, timed responses' },
      { left: 'Phone screen', right: 'Mental maths and probability warm-up, 30–60 min' },
      { left: 'Superday / On-site', right: 'Multiple rounds: technical + culture fit + case' },
      { left: 'Take-home assignment', right: 'Data analysis or coding task, 24–72 hours' },
      { left: 'Market making round', right: 'Live bid-offer on abstract or real market' },
    ],
  },

  gameTheoryProblems: {
    key: 'gameTheoryProblems', title: 'Betting & Game Theory', icon: '🎮',
    subtitle: 'EV, optimal strategy, Nash equilibrium',
    type: 'mcq',
    questions: [
      { prompt: 'Coin flip: Win +$3, Lose −$1. Fair coin. EV?', options: ['$1.00', '$2.00', '$0.50', '$1.50'], correct: '$1.00', explain: 'EV = 0.5×3 + 0.5×(−1) = 1.5−0.5 = $1.00 per bet.' },
      { prompt: 'Two players choose 1 or 2. Lower number wins that amount from other. Nash equilibrium?', options: ['Both choose 1', 'Both choose 2', 'Randomise 50/50', 'No pure Nash equilibrium'], correct: 'Both choose 1', explain: 'If opponent plays 1, best response is 1 (tie) not 2 (lose $1). Dominant strategy: always choose 1.' },
      { prompt: 'Market maker: bid=99, offer=101, fair=100. One buyer at 101. EV for MM?', options: ['−$1', '$0', '$1', '$2'], correct: '$1', explain: 'Sold at 101, worth 100. Profit=$1. This is the half-spread — compensation for providing liquidity.' },
      { prompt: 'Gambler\'s ruin: start $10, fair coin, $1 bets. P(reach $20 before $0)?', options: ['50%', '100%', '10%', '25%'], correct: '50%', explain: 'Fair game: P(reach N) = start/N = 10/20 = 50%.' },
      { prompt: 'You find a $1 bill. EV of picking it up?', options: ['$0 — too risky', '$1 — free money', 'Depends on opportunity cost', '−$1 — watch for tricks'], correct: '$1 — free money', explain: 'Obvious positive EV: pick it up. Always calculate EV. Take clear positive-EV actions without overthinking.' },
    ],
  },

  complexityQuiz: {
    key: 'complexityQuiz', title: 'Complexity Analysis', icon: '🔢',
    subtitle: 'Match the algorithm to its Big-O complexity',
    type: 'match',
    pairs: [
      { left: 'Binary search on sorted array', right: 'O(log n)' },
      { left: 'Linear scan for target', right: 'O(n)' },
      { left: 'Nested loop over n×n matrix', right: 'O(n²)' },
      { left: 'Merge sort', right: 'O(n log n)' },
      { left: 'Naive matrix multiplication', right: 'O(n³)' },
    ],
  },

  communicationQuiz: {
    key: 'communicationQuiz', title: 'Communicating Your Reasoning', icon: '🗣️',
    subtitle: 'The examiner is listening to HOW you think',
    type: 'mcq',
    questions: [
      { prompt: 'You\'re stuck on a probability problem. Best approach?', options: ['Stay silent', 'State what you know and try a simpler case (n=1, n=2)', 'Guess and move on', 'Ask for the answer'], correct: 'State what you know and try a simpler case (n=1, n=2)', explain: 'Interviewers value the thinking process. Narrate. Try small cases. Show structured reasoning.' },
      { prompt: 'You gave a wrong answer confidently. Interviewer says "are you sure?" You should:', options: ['Double down — show confidence', 'Re-examine your logic from the start', 'Agree with them immediately', 'Ask for the right answer'], correct: 'Re-examine your logic from the start', explain: '"Are you sure?" is a signal to re-examine. Walk through your logic again from scratch. Better to correct yourself than persist in error.' },
      { prompt: 'Best opening when asked a quantitative question:', options: ['Jump to the answer', 'Restate the problem to confirm, then outline your approach', 'Ask for a hint', 'Say "I\'ve seen this before"'], correct: 'Restate the problem to confirm, then outline your approach', explain: 'Confirming the problem catches misunderstandings. Outlining the approach shows structured thinking before computing.' },
    ],
  },

  lmsrCalc: {
    key: 'lmsrCalc', title: 'Prediction Markets & LMSR', icon: '🎰',
    subtitle: 'Logarithmic Market Scoring Rule',
    type: 'mcq',
    questions: [
      { prompt: 'LMSR cost C(q) = b×ln(Σe^{q_i/b}). b controls:', options: ['Number of outcomes', 'Liquidity — higher b = flatter prices, more subsidy', 'Number of traders', 'Market maker profit'], correct: 'Liquidity — higher b = flatter prices, more subsidy', explain: 'High b: prices move slowly, market subsidises more. Low b: prices are sensitive to trades.' },
      { prompt: 'LMSR implied probability for outcome i:', options: ['q_i/Σq_j', 'e^{q_i/b}/Σe^{q_j/b}', '1/n always', 'Constant'], correct: 'e^{q_i/b}/Σe^{q_j/b}', explain: 'Softmax of holdings vector. Probabilities sum to 1, update continuously, bounded [0,1].' },
      { prompt: 'Prediction markets (Polymarket, Metaculus) are valued because:', options: ['They are regulated', 'Incentivised trading aggregates dispersed beliefs into good forecasts', 'Cheaper than surveys', 'Required by law'], correct: 'Incentivised trading aggregates dispersed beliefs into good forecasts', explain: 'Prices incorporate information from many participants with real stakes. Often outperform expert polls.' },
    ],
  },

  interviewTypesQuiz: {
    key: 'interviewTypesQuiz', title: 'Interview Problem Types', icon: '🗂️',
    subtitle: 'Match the problem to the right approach',
    type: 'match',
    pairs: [
      { left: 'Mental maths: 37 × 38', right: 'Algebraic shortcut: (37.5)²−0.25≈1406' },
      { left: 'Expected value problem', right: 'List outcomes × probabilities, sum' },
      { left: 'Conditional probability', right: 'Draw Bayes table — track numerator and denominator' },
      { left: 'Coding problem', right: 'State brute force first, then optimise' },
      { left: 'Market making round', right: 'Think bid-offer spread, convexity, adverse selection' },
    ],
  },

  stuckStrategyQuiz: {
    key: 'stuckStrategyQuiz', title: 'Handling Being Stuck', icon: '🔄',
    subtitle: 'Concrete strategies when you don\'t know the answer',
    type: 'mcq',
    questions: [
      { prompt: 'Stuck for 2 minutes. Best move?', options: ['Give up', 'Try n=1, n=2 small cases to find the pattern', 'Ask for the answer', 'Move to a different problem'], correct: 'Try n=1, n=2 small cases to find the pattern', explain: 'Small cases reveal structure. Enumerate manually. Pattern becomes obvious. Shows problem-solving process regardless of the final answer.' },
      { prompt: 'You realise your answer was wrong after giving it. You should:', options: ['Say nothing', 'Interrupt and correct yourself', 'Wait for next question', 'Blame question ambiguity'], correct: 'Interrupt and correct yourself', explain: 'Self-correction shows mathematical integrity. Interviewers value intellectual honesty over false confidence.' },
      { prompt: 'Completely unfamiliar problem. First step?', options: ['Guess confidently', 'State related things you DO know and try to connect them', 'Ask for a hint', 'Say it\'s outside your preparation'], correct: 'State related things you DO know and try to connect them', explain: 'Quants constantly solve novel problems. Reasoning from first principles with unfamiliar material is the core skill being tested.' },
    ],
  },

  vrBriefingQuiz: {
    key: 'vrBriefingQuiz', title: 'VR Environment Briefing', icon: '🥽',
    subtitle: 'Know the Skill_Up VR world before you enter it',
    type: 'match',
    pairs: [
      { left: 'Quant Trading Floor', right: 'Live market simulation — real-time position management' },
      { left: 'Interview War Room', right: 'AI interviewers running full Jane Street simulations' },
      { left: 'Research Lab', right: 'Signal development with live data feedback' },
      { left: 'Risk Chamber', right: 'Portfolio stress testing and scenario analysis' },
      { left: 'Meta Quest 3S', right: '$299 standalone headset — hand tracking built-in' },
    ],
  },

  readinessCalibration: {
    key: 'readinessCalibration', title: 'Pre-Boss Readiness Calibration', icon: '🎯',
    subtitle: 'Honest self-assessment before the War Room Boss',
    type: 'mcq',
    questions: [
      { prompt: 'Rate your probability & Bayes fluency:', options: ['Apply Bayes to novel scenarios from scratch', 'Know formula but need time to set up', 'Understand conceptually, struggle with numbers', 'Not studied yet'], correct: 'Apply Bayes to novel scenarios from scratch', explain: 'Target: apply from scratch under pressure. Revisit Labs 1–2 if not there yet.' },
      { prompt: 'Mental maths speed: 2-digit multiplication?', options: ['Under 5 seconds', 'Under 15 seconds', 'Under 30 seconds', 'Need paper'], correct: 'Under 5 seconds', explain: '5 seconds is the quant interview target for 2-digit multiplication.' },
      { prompt: 'Black-Scholes from memory?', options: ['Can derive and state it fully', 'Can state but not derive', 'Remember inputs not formula', 'Cannot recall'], correct: 'Can derive and state it fully', explain: 'Target: derive from delta-hedge argument, state C and P formulas, explain each Greek.' },
      { prompt: 'Kelly Criterion and its caveats?', options: ['Can derive + explain estimation risk and log utility caveats', 'Know formula not caveats', 'Understand concept not formula', 'Not studied'], correct: 'Can derive + explain estimation risk and log utility caveats', explain: 'f*=(bp−q)/b, plus knowing why full Kelly is dangerous in practice.' },
    ],
  },

  janeStreetBoss: {
    key: 'janeStreetBoss', title: 'War Room Boss: Jane Street Sim', icon: '👑',
    subtitle: 'The full simulation — all skills tested simultaneously',
    type: 'mcq',
    questions: [
      { prompt: 'Coin lands heads 55%. $1000 bankroll. Optimal single-bet fraction (Kelly)?', options: ['55%', '10%', '5.5%', '100%'], correct: '10%', explain: 'f*=p−q/b=(0.55−0.45)/1=0.10. Bet 10% per round.' },
      { prompt: 'Stock $100. Call (K=100, 3m) market=$5, your model=$6.50 (vol=25%). Action?', options: ['Buy — cheap vs model', 'Sell — expensive', 'No edge', 'Hedge with stock'], correct: 'Buy — cheap vs model', explain: 'Market $5 < theoretical $6.50. Buy the underpriced option, delta-hedge. Profit if your vol estimate is correct.' },
      { prompt: 'Market quoted 48–52 on a derivative. Fair value estimate: 55. Action?', options: ['Buy at 52, hedge', 'Sell at 48', 'Wait', 'Improve offer to 53'], correct: 'Buy at 52, hedge', explain: 'Fair value 55 >> offer 52. Buy and delta-hedge. Edge = $3 per unit.' },
      { prompt: 'N items, one randomly labelled prize. Open sequentially. Optimal stopping strategy? (Secretary problem)', options: ['After first', 'Pass first n/e, take next best seen', 'After n/2', 'Always last'], correct: 'Pass first n/e, take next best seen', explain: 'Optimal: pass first 37% of items, then accept first item better than all seen. P(success) = 1/e ≈ 37%.' },
      { prompt: '"How many piano tuners in London?" — market making approach:', options: ['Refuse — no data', 'Fermi: population → households → pianos → tuners → bid/offer around estimate', 'Quote 1000–2000', 'Ask for data first'], correct: 'Fermi: population → households → pianos → tuners → bid/offer around estimate', explain: '9M people → 3M households → 10% have pianos → 300k pianos → ~1 tuner per 300 → ~1000. Quote 700–1300. Process matters more than precision.' },
    ],
  },

  pythonStackQuiz: {
    key: 'pythonStackQuiz', title: 'Python Quant Stack Overview', icon: '🐍',
    subtitle: 'Match the tool to its primary use case',
    type: 'match',
    pairs: [
      { left: 'cvxpy', right: 'Convex portfolio optimisation — MVO, risk parity' },
      { left: 'QuantLib', right: 'Industry-grade derivatives pricing — bonds, swaps, exotics' },
      { left: 'vectorbt', right: 'Fast vectorised backtesting over many parameters' },
      { left: 'statsmodels', right: 'OLS, ARMA, VAR, statistical hypothesis tests' },
      { left: 'numba @njit', right: 'JIT-compile Python loops to near-C speed' },
    ],
  },

  pandasPolarsQuiz: {
    key: 'pandasPolarsQuiz', title: 'pandas vs polars', icon: '🐻',
    subtitle: 'When to reach for polars over pandas',
    type: 'mcq',
    questions: [
      { prompt: 'polars is faster than pandas primarily because:', options: ['Written in Python', 'Rust + lazy evaluation + multi-threading by default', 'Smaller API', 'WebAssembly'], correct: 'Rust + lazy evaluation + multi-threading by default', explain: 'polars: Rust + Apache Arrow memory + lazy query optimisation + default parallelism.' },
      { prompt: 'Best reason to keep using pandas:', options: ['Speed', 'Ecosystem — matplotlib, seaborn, statsmodels, sklearn integrate natively', 'Memory efficiency', 'Newer API'], correct: 'Ecosystem — matplotlib, seaborn, statsmodels, sklearn integrate natively', explain: 'Every Python data science tool expects pandas DataFrames. polars is faster but requires conversion.' },
      { prompt: 'polars shows biggest advantage over pandas when:', options: ['Small DataFrames (< 1MB)', 'Large DataFrames (> 1GB) with groupby/aggregation on multi-core', 'ML pipelines', 'Interactive exploration'], correct: 'Large DataFrames (> 1GB) with groupby/aggregation on multi-core', explain: 'polars multi-threaded aggregation on large data: often 10–50× faster than single-threaded pandas.' },
    ],
  },

  quantlibQuiz: {
    key: 'quantlibQuiz', title: 'QuantLib', icon: '📊',
    subtitle: 'Match QuantLib class to its finance function',
    type: 'match',
    pairs: [
      { left: 'ql.BlackScholesProcess', right: 'GBM process for equity option pricing' },
      { left: 'ql.EuropeanOption', right: 'European exercise with BSM/MC/FD pricing engines' },
      { left: 'ql.YieldTermStructure', right: 'Discount curve for bond/rate derivatives' },
      { left: 'ImpliedVolatility()', right: 'IV from market price via root-finding' },
      { left: 'ql.MCEuropeanEngine', right: 'Monte Carlo engine for path-dependent pricing' },
    ],
  },

  backtestFrameworkQuiz: {
    key: 'backtestFrameworkQuiz', title: 'NautilusTrader vs vectorbt', icon: '⚙️',
    subtitle: 'Match the use case to the right framework',
    type: 'mcq',
    questions: [
      { prompt: 'Backtest on tick data with realistic order book simulation. Best choice?', options: ['vectorbt', 'NautilusTrader', 'pandas loop', 'zipline'], correct: 'NautilusTrader', explain: 'NautilusTrader: event-driven, tick-level, realistic order/fill simulation, production-deployable. Overkill for daily signal research.' },
      { prompt: 'Test 10,000 parameter combinations of MA crossover on daily data. Best choice?', options: ['NautilusTrader', 'vectorbt', 'backtrader', 'zipline'], correct: 'vectorbt', explain: 'vectorbt: fully vectorised over parameters. 10k combinations run simultaneously as numpy operations. Built for this.' },
      { prompt: 'vectorbt is fastest when:', options: ['Complex conditional logic per bar', 'Signals expressible as numpy/pandas operations', 'Multiple exchange routing needed', 'Live trading required'], correct: 'Signals expressible as numpy/pandas operations', explain: 'vectorbt vectorises the backtest itself. If your signal is a numpy expression, it runs all parameter combinations at once.' },
    ],
  },

  freeDataQuiz: {
    key: 'freeDataQuiz', title: 'Free Data Sources', icon: '📡',
    subtitle: 'Match the source to its strengths and limitations',
    type: 'match',
    pairs: [
      { left: 'yfinance', right: 'Daily OHLCV for equities/ETFs — Yahoo Finance scraper, no guarantees' },
      { left: 'Finnhub (free tier)', right: 'Real-time quotes, earnings, news — limited API calls' },
      { left: 'Alpha Vantage (free)', right: 'EOD + some intraday — rate limited (5 calls/min free)' },
      { left: 'FRED (St Louis Fed)', right: 'Macro data: rates, GDP, CPI — excellent, free, reliable' },
      { left: 'SEC EDGAR', right: 'Filings, 10-K, 10-Q — official, free, parseable' },
    ],
  },

  paidDataQuiz: {
    key: 'paidDataQuiz', title: 'Paid Data Sources', icon: '💳',
    subtitle: 'Match the vendor to its primary use case',
    type: 'match',
    pairs: [
      { left: 'Polygon.io', right: 'Tick + aggregate US equities — affordable, clean API' },
      { left: 'Bloomberg Terminal', right: 'Industry standard — comprehensive, expensive (~$25k/yr)' },
      { left: 'Refinitiv (LSEG)', right: 'Tick data, news, fundamentals — Bloomberg competitor' },
      { left: 'FactSet', right: 'Fundamentals, estimates, portfolio analytics' },
      { left: 'Quandl (NASDAQ)', right: 'Alternative data and curated financial datasets' },
    ],
  },

  solverSelectionQuiz: {
    key: 'solverSelectionQuiz', title: 'Solver Selection', icon: '⚙️',
    subtitle: 'Gurobi, OR-Tools, cvxpy — pick the right tool',
    type: 'mcq',
    questions: [
      { prompt: 'Convex QP portfolio optimisation. Best tool?', options: ['Gurobi', 'cvxpy (with OSQP/SCS backend)', 'OR-Tools', 'scipy.optimize.minimize'], correct: 'cvxpy (with OSQP/SCS backend)', explain: 'cvxpy is designed for convex optimisation. Declarative syntax, automatic solver selection. The right abstraction for QP.' },
      { prompt: 'Integer program: select exactly 20 of 200 assets maximising return subject to risk constraints. Best tool?', options: ['cvxpy', 'Gurobi (commercial MIP solver)', 'scipy.optimize', 'numpy'], correct: 'Gurobi (commercial MIP solver)', explain: 'Gurobi and CPLEX are the gold standard for MIP. cvxpy can interface with them. OR-Tools for open-source alternative.' },
      { prompt: 'Vehicle routing / scheduling (combinatorial, large-scale). Best tool?', options: ['cvxpy', 'Gurobi', 'Google OR-Tools', 'numpy'], correct: 'Google OR-Tools', explain: 'OR-Tools: open-source, designed for combinatorial problems (routing, scheduling, assignment). Excellent CP-SAT solver.' },
    ],
  },

  competitionStratQuiz: {
    key: 'competitionStratQuiz', title: 'Competitions Strategy', icon: '🏆',
    subtitle: 'WorldQuant BRAIN, Jane Street, Citadel — how to approach each',
    type: 'match',
    pairs: [
      { left: 'WorldQuant BRAIN', right: 'Submit alphas via web IDE — 1M+ alphas live, focus on originality' },
      { left: 'Jane Street ESP/puzzles', right: 'Math/probability puzzles — demonstrate pure quant reasoning' },
      { left: 'Citadel Datathon', right: 'Team data science competition — EDA + ML + presentation' },
      { left: 'Rotman International Trading', right: 'Simulated trading competition — execution and risk mgmt' },
      { left: 'IMC Prosperity', right: 'Algorithmic trading game — coding + strategy + market intuition' },
    ],
  },

  mathReadingQuiz: {
    key: 'mathReadingQuiz', title: 'The Maths Reading List', icon: '📚',
    subtitle: 'Match the book to its topic and level',
    type: 'match',
    pairs: [
      { left: 'Stochastic Calculus for Finance (Shreve)', right: 'Rigorous stochastic calculus — standard for quant PhDs' },
      { left: 'Introduction to Probability (Blitzstein)', right: 'Probability — best undergraduate text, story proofs' },
      { left: 'Matrix Cookbook', right: 'Matrix identities reference — invaluable cheat sheet' },
      { left: 'Convex Optimization (Boyd)', right: 'Convex opt — free online, industry standard' },
      { left: 'Pattern Recognition (Bishop)', right: 'ML from a probabilistic/Bayesian perspective' },
    ],
  },

  financeReadingQuiz: {
    key: 'financeReadingQuiz', title: 'Quant Finance Reading List', icon: '📖',
    subtitle: 'Match the book to its role in quant prep',
    type: 'match',
    pairs: [
      { left: 'A Practical Guide to Quant Finance Interviews', right: 'Interview prep — Xinfeng Zhou, covers all question types' },
      { left: 'The Concepts and Practice of Mathematical Finance', right: 'Derivatives — Joshi, excellent for sell-side quants' },
      { left: 'Advances in Financial ML (López de Prado)', right: 'ML applied to finance correctly — addresses backtesting pitfalls' },
      { left: 'Options, Futures & Other Derivatives (Hull)', right: 'Hull — standard reference for derivatives pricing' },
      { left: 'My Life as a Quant (Derman)', right: 'Career memoir — culture, history, and what quant life is actually like' },
    ],
  },

  careerPathQuiz: {
    key: 'careerPathQuiz', title: 'Sell-Side vs Buy-Side', icon: '🔀',
    subtitle: 'Understand the differences before you choose',
    type: 'mcq',
    questions: [
      { prompt: 'Sell-side quant (bank/broker) vs buy-side quant (hedge fund). Key difference?', options: ['Sell-side is more quantitative', 'Buy-side trades its own money — P&L directly affects comp', 'Sell-side has higher comp', 'Buy-side has better work-life balance'], correct: 'Buy-side trades its own money — P&L directly affects comp', explain: 'Buy-side quants manage real positions — they eat what they kill. Sell-side builds tools and models for clients. Different risk/reward.' },
      { prompt: 'HFT firm vs long/short equity hedge fund: main difference?', options: ['HFT holds positions longer', 'HFT competes on speed and microstructure; L/S on signal quality over days-weeks', 'L/S is more quantitative', 'Same — just different names'], correct: 'HFT competes on speed and microstructure; L/S on signal quality over days-weeks', explain: 'HFT: microseconds, co-location, market making. L/S: signal alpha from fundamentals, technicals, or ML over longer horizons.' },
      { prompt: 'Prop trading firm (Jane Street, Citadel Securities) vs multi-manager hedge fund (Millennium, Point72):', options: ['Same business model', 'Prop: firm\'s own capital, traders share in profits. MM: independent PMs each running books', 'Prop is always HFT', 'MM is always quant'], correct: 'Prop: firm\'s own capital, traders share in profits. MM: independent PMs each running books', explain: 'Prop trading firms (JS, CS, IMC) trade the firm\'s capital. MM platforms give PMs capital + infrastructure; PMs keep a % of their P&L.' },
    ],
  },

  mistakesQuiz: {
    key: 'mistakesQuiz', title: 'The Three Biggest Mistakes', icon: '⚠️',
    subtitle: 'Identify the mistake in each candidate scenario',
    type: 'mcq',
    questions: [
      { prompt: 'Candidate lists 5 ML frameworks on CV but cannot explain regularisation in an interview.', options: ['CV formatting issue', 'Credential inflation — CV skills must match interview depth', 'Needs better interview prep only', 'Normal for entry level'], correct: 'Credential inflation — CV skills must match interview depth', explain: 'One of the three biggest mistakes: listing tools/frameworks you cannot defend under questioning. Depth > breadth. Know fewer things deeply.' },
      { prompt: 'Candidate says "I built a backtest with Sharpe 4.2" without mentioning it was in-sample only.', options: ['Impressive result — highlight it', 'Critical omission — in-sample Sharpe without OOS is meaningless and dishonest', 'Acceptable — all backtests are in-sample', 'Only relevant for live trading'], correct: 'Critical omission — in-sample Sharpe without OOS is meaningless and dishonest', explain: 'In-sample Sharpe can be made arbitrarily high with enough parameters. Interviewers will ask about OOS. Be transparent about methodology.' },
      { prompt: 'Candidate gives up when stuck and says "I don\'t know" without attempting.', options: ['Honest — better than guessing', 'Shows intellectual integrity', 'Fatal — quants are hired to figure out hard things they don\'t know', 'Acceptable at junior level'], correct: 'Fatal — quants are hired to figure out hard things they don\'t know', explain: '"I don\'t know" with no attempt is the worst answer. "I don\'t know but here\'s how I\'d approach it" is excellent. The attempt matters more than the answer.' },
      { prompt: 'Candidate optimises 200 parameters on the same data used to evaluate the strategy.', options: ['Thorough parameter tuning', 'In-sample overfitting — invalidates all results', 'Standard industry practice', 'Only wrong with more than 100 parameters'], correct: 'In-sample overfitting — invalidates all results', explain: 'Parameters tuned on the evaluation data will appear optimal there. This is data dredging. Any Sharpe from such a backtest is meaningless.' },
    ],
  },

  toolkitBoss: {
    key: 'toolkitBoss', title: 'Toolkit Boss: The Practitioner\'s Gauntlet', icon: '👑',
    subtitle: 'Full practitioner\'s toolkit — all Labs tested',
    type: 'mcq',
    questions: [
      { prompt: 'You need to price an American option on a dividend-paying stock with early exercise. Best tool?', options: ['Black-Scholes', 'QuantLib with binomial tree engine', 'scipy Black-Scholes implementation', 'Monte Carlo only'], correct: 'QuantLib with binomial tree engine', explain: 'American options require early-exercise checking at each node. Binomial tree (CRR) is standard. QuantLib\'s AmericanOption + BinomialVanillaEngine.' },
      { prompt: 'You want to run 10,000 backtests simultaneously varying two parameters. Best approach?', options: ['10,000 sequential pandas loops', 'vectorbt with parameter grid', 'multiprocessing Pool of 10,000 processes', 'asyncio gather 10,000 coroutines'], correct: 'vectorbt with parameter grid', explain: 'vectorbt vectorises the entire backtest over a parameter grid. All 10k combinations run as numpy operations. No loops, no processes.' },
      { prompt: 'Portfolio variance = w\'Σw. Σ has a near-zero eigenvalue. Risk?', options: ['No risk — small eigenvalue is fine', 'Portfolio variance numerically unstable — near-singular matrix', 'This is the global minimum variance', 'Normal condition'], correct: 'Portfolio variance numerically unstable — near-singular matrix', explain: 'Near-zero eigenvalue means assets are nearly co-linear. Matrix is near-singular — solving (X\'X)⁻¹ or Σ⁻¹ will give large errors. Apply regularisation.' },
      { prompt: 'Implied volatility: market call price $7, BS gives $7 at σ=0.25. Market call rises to $8. New IV > or < 0.25?', options: ['< 0.25', '> 0.25', '= 0.25', 'Cannot determine'], correct: '> 0.25', explain: 'Higher market price → higher IV needed to match it in the BS formula. Vega > 0 means higher price = higher vol.' },
      { prompt: 'Backtest: in-sample Sharpe 2.5, OOS Sharpe 1.8 on unseen hold-out data. Conclusion?', options: ['Severe overfitting', 'Strong result — 72% of IS performance retained OOS', 'Suspicious — might be look-ahead', 'Need more OOS data'], correct: 'Strong result — 72% of IS performance retained OOS', explain: '72% IS-to-OOS retention is excellent. 40–60% is typical, >70% suggests genuine alpha. Investigate further but this is a promising signal.' },
    ],
  },
};
