// ⚡ Sifter Skill_Up — Quant Program: Lab / Environment Definitions
// Trader Track — Phase A
// Level IDs: 1001–1090 (separate namespace from crypto 1–270)
// Environment metaphor: Research Lab → Trading Floor → Interview Room

export type QuantTier = 'foundation' | 'intermediate' | 'advanced' | 'elite';

export interface QuantLab {
  id: number;
  tier: QuantTier;
  name: string;             // quant environment name
  subtitle: string;         // flavour — describes the "room" or "floor"
  description: string;
  icon: string;
  color: string;
  start: number;            // first level id
  end: number;              // last level id
  bossLevel: number;
  requiredLevel: number;    // 0 = unlocked from start, else last boss of prev lab
  vrScenario?: string;      // VR scenario unlocked after boss
}

export const QUANT_LABS: QuantLab[] = [
  {
    id: 0,
    tier: 'foundation',
    name: 'Numbers Room',
    subtitle: 'The Foundation You Actually Need',
    description:
      'Statistics and probability are the grammar of quantitative finance. Before you can talk about p-values, Sharpe ratios, or distributions, you need to know what a mean is, what standard deviation really means, why the normal distribution is shaped like a bell, and what the Central Limit Theorem does. This room covers all of it — from scratch, no assumed knowledge.',
    icon: '📐',
    color: '#14b8a6',
    start: 990,
    end: 999,
    bossLevel: 999,
    requiredLevel: 0,
  },
  {
    id: 1,
    tier: 'foundation',
    name: 'Probability Lab',
    subtitle: 'The Language of Uncertainty',
    description:
      'Every decision in quantitative finance reduces to one question: what are the odds, and are they in your favour? Before you can touch markets you must speak probability fluently — conditional thinking, Bayesian updating, expected value, and variance.',
    icon: '🎲',
    color: '#6366f1',
    start: 1001,
    end: 1015,
    bossLevel: 1015,
    requiredLevel: 999,
    vrScenario: 'bayesian_trading_floor_intro',
  },
  {
    id: 2,
    tier: 'foundation',
    name: 'Statistics Desk',
    subtitle: 'The BS Detector',
    description:
      'Most of what looks like signal is noise. The Statistics Desk teaches you to distinguish them — hypothesis testing, regression, MLE, the multiple comparisons problem, and why your first ten strategies will all be false positives.',
    icon: '📊',
    color: '#0ea5e9',
    start: 1016,
    end: 1030,
    bossLevel: 1030,
    requiredLevel: 1015,
    vrScenario: 'regression_desk_simulation',
  },
  {
    id: 3,
    tier: 'intermediate',
    name: 'Linear Algebra Floor',
    subtitle: 'The Matrix Engine',
    description:
      'Portfolio construction, PCA, covariance estimation, factor models — all of it runs on linear algebra. The first time eigendecomposition clicks, the whole financial world changes. This floor makes it click.',
    icon: '🔢',
    color: '#10b981',
    start: 1031,
    end: 1045,
    bossLevel: 1045,
    requiredLevel: 1030,
    vrScenario: 'portfolio_matrix_builder',
  },
  {
    id: 4,
    tier: 'intermediate',
    name: 'Calculus & Optimisation Suite',
    subtitle: 'The Language of Change',
    description:
      'Prices change. Volatilities change. The entire probability distribution shifts second by second. Calculus describes and exploits those changes. This suite covers derivatives, Taylor expansions, gradient descent, and convex optimisation.',
    icon: '∂',
    color: '#f59e0b',
    start: 1046,
    end: 1060,
    bossLevel: 1060,
    requiredLevel: 1045,
    vrScenario: 'delta_hedging_simulation',
  },
  {
    id: 5,
    tier: 'advanced',
    name: 'Stochastic Calculus Chamber',
    subtitle: 'Where Quants Are Made',
    description:
      'Before stochastic calculus you are a data scientist who likes finance. After it you are a quant. Brownian motion, Itô\'s lemma, Black-Scholes, the Greeks — derived from first principles. This is the hardest room. It is also the most valuable.',
    icon: 'σ',
    color: '#8b5cf6',
    start: 1061,
    end: 1075,
    bossLevel: 1075,
    requiredLevel: 1060,
    vrScenario: 'options_greeks_trading_floor',
  },
  {
    id: 6,
    tier: 'elite',
    name: 'Interview War Room',
    subtitle: 'Jane Street Ready',
    description:
      'Three problems. Ninety minutes. An interviewer watching how your brain works. The War Room runs you through the exact format of top-tier quant interviews — correlation matrices, conditional regression, dynamic programming, real-time probability puzzles. Pass the boss and you are ready.',
    icon: '⚔️',
    color: '#ef4444',
    start: 1076,
    end: 1090,
    bossLevel: 1090,
    requiredLevel: 1075,
    vrScenario: 'jane_street_interview_simulation',
  },
  {
    id: 7,
    tier: 'elite',
    name: "Practitioner's Toolkit",
    subtitle: 'From Theory to Production',
    description:
      'The math is the moat — but you still need tools. This lab covers the full Python quant stack: data ingestion, backtesting, optimisation, and ML for finance. Plus how to source real market data, which competitions accelerate your career, and the reading list that separates serious candidates from tourists. The bridge between knowing the theory and being hireable.',
    icon: '🛠️',
    color: '#0ea5e9',
    start: 1091,
    end: 1105,
    bossLevel: 1105,
    requiredLevel: 1090,
    vrScenario: null,
  },
];

export const getQuantLab        = (id: number) => QUANT_LABS.find(l => l.id === id);
export const getQuantLabForLevel = (lvl: number) => QUANT_LABS.find(l => lvl >= l.start && lvl <= l.end);
export const isQuantLabUnlocked  = (lab: QuantLab, completed: number[]) =>
  lab.requiredLevel === 0 || completed.includes(lab.requiredLevel);

// ── LAB 8: APPLIED QUANT PYTHON ──────────────────────────────────────────────
// Added after all math labs — implements everything from Labs 0-7 in real code
// Requires: completion of Lab 7 (level 1105) + Python chapters 1-5 (2001-2050)
// Level IDs: 1106–1125

export const LAB8: QuantLab = {
  id: 8,
  tier: 'elite',
  name: 'Applied Quant Python',
  subtitle: 'Build Everything You Learned',
  description:
    'You know the math. Now you write the code. This lab implements every concept from Labs 0–7 in real Python — Sharpe calculators, Bayesian updaters, Markowitz optimisers, Black-Scholes pricers, Fama-French regressions, Kelly optimisers, and a live backtesting pipeline. By the end you have a portfolio of working quant tools built from scratch.',
  icon: '🐍',
  color: '#16a34a',
  start: 1106,
  end: 1125,
  bossLevel: 1125,
  requiredLevel: 1105,
  vrScenario: 'live_coding_interview',
};

QUANT_LABS.push(LAB8);
