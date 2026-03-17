/**
 * Sifter Skill_Up — GitHub Screen
 *
 * Three modes depending on user state:
 *   1. NOT CONNECTED  → Explain what GitHub is + connect button
 *   2. CONNECTED      → Portfolio push + repo list + learn module
 *   3. LEARN MODULE   → Step-by-step Git concepts (what is a repo, commit, push, README)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Linking, ActivityIndicator,
  TextInput, Alert,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { API } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface GitHubStatus {
  connected: boolean;
  username: string | null;
  avatar: string | null;
}

interface Repo {
  name: string;
  url: string;
  description: string | null;
  stars: number;
  updated: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, Shadow.sm, style]}>{children}</View>;
}

function PrimaryBtn({ label, onPress, loading = false, icon = '' }: {
  label: string; onPress: () => void; loading?: boolean; icon?: string;
}) {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress} activeOpacity={0.85} disabled={loading}>
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.primaryBtnText}>{icon ? `${icon}  ` : ''}{label}</Text>
      }
    </TouchableOpacity>
  );
}

function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.ghostBtn}>
      <Text style={styles.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEARN MODULE — plain-English Git concepts
// ─────────────────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 'what',
    icon: '🐙',
    title: 'What is GitHub?',
    body: `GitHub is a website that stores your code online so you can:

• Share your work with employers and collaborators
• Track every change you've ever made (nothing is ever lost)
• Show off your projects as a portfolio

Think of it like Google Drive for code — except it also tracks the full history of every edit.

GitHub is free. Every quant, developer, and data scientist has a GitHub profile. Hiring managers look at it.`,
    quiz: {
      q: 'What is the main purpose of GitHub for a quant developer?',
      opts: ['Trading stocks online', 'Storing and sharing code as a portfolio', 'Running Python locally', 'Messaging teammates'],
      correct: 1,
    },
  },
  {
    id: 'repo',
    icon: '📁',
    title: 'What is a Repository?',
    body: `A repository (repo) is a folder for one project — your code, README, and full history all in one place.

Examples of what you'd put in a repo:
• Your Sharpe ratio calculator
• Your Markowitz optimiser
• Your pairs trading backtest
• Your Monte Carlo pricer

Each project gets its own repo. When someone visits your GitHub profile, they see all your repos. A strong portfolio has 5–10 well-documented projects.

Your GitHub URL looks like: github.com/yourname/your-project`,
    quiz: {
      q: 'A repository is:',
      opts: ['A type of database', 'A folder containing one project\'s code and history', 'A GitHub subscription', 'A Python package'],
      correct: 1,
    },
  },
  {
    id: 'commit',
    icon: '💾',
    title: 'What is a Commit?',
    body: `A commit is a saved snapshot of your code at a specific moment.

Every time you commit, you write a short message describing what changed:
  "Add Sharpe ratio function"
  "Fix Kelly fraction calculation"
  "Add Fama-French regression"

Your commit history is a timeline of your work. It shows:
• That you worked on the project over time (not just dumped it in one go)
• How you think about problems and structure solutions
• That you write clear, professional messages

Rule: commit often, with clear messages. "Fix bug" is bad. "Fix division-by-zero in max_drawdown when returns are constant" is good.`,
    quiz: {
      q: 'A good commit message is:',
      opts: ['"update"', '"fix"', '"Add Newey-West correction to OLS regression"', '"asdf"'],
      correct: 2,
    },
  },
  {
    id: 'push',
    icon: '🚀',
    title: 'What is a Push?',
    body: `Push = sending your local commits up to GitHub so the world can see them.

The flow is:
  1. You write code on your computer
  2. You commit (save a snapshot locally)
  3. You push (upload to GitHub)

Without pushing, nobody can see your work. With pushing, your portfolio is live.

From the command line:
  git add .                        # stage all changes
  git commit -m "Add Sharpe calc"  # save snapshot
  git push origin main             # upload to GitHub

From Sifter Skill_Up, we handle all of this for you — tap "Push to GitHub" and your project files go straight to your repo.`,
    quiz: {
      q: 'What does "push" do?',
      opts: ['Deletes your code', 'Uploads your commits from local to GitHub', 'Downloads someone else\'s code', 'Creates a new repo'],
      correct: 1,
    },
  },
  {
    id: 'readme',
    icon: '📄',
    title: 'What is a README?',
    body: `A README is a document (README.md) that explains what your project does.

Every serious repo has one. It's the first thing a recruiter or collaborator reads.

A good quant portfolio README includes:
  • What the project does (1–2 sentences)
  • What concepts it implements (Sharpe, Kelly, Black-Scholes, etc.)
  • How to run it
  • Example output

Bad README: empty or "this is my project"
Good README: "A Python implementation of the Markowitz minimum-variance optimiser using cvxpy. Inputs: daily returns DataFrame. Outputs: optimal weights, annual Sharpe, and risk contributions per asset."

Sifter Skill_Up auto-generates a README for each portfolio push.`,
    quiz: {
      q: 'Why does every serious repo need a README?',
      opts: ['GitHub requires it', 'It explains what the project does so recruiters and collaborators understand it instantly', 'It makes the code run faster', 'It\'s only needed for open-source projects'],
      correct: 1,
    },
  },
  {
    id: 'portfolio',
    icon: '🏆',
    title: 'Building a Quant Portfolio on GitHub',
    body: `A strong quant GitHub portfolio has 5–10 repos, each demonstrating a different skill:

Repo 1 — Statistics & Probability
  Bayesian updater, hypothesis testing, MLE

Repo 2 — Portfolio Construction  
  Markowitz optimiser, Kelly criterion, efficient frontier

Repo 3 — Risk Management
  VaR, CVaR, max drawdown, Sharpe, Calmar

Repo 4 — Options & Derivatives
  Black-Scholes pricer, all Greeks, Monte Carlo

Repo 5 — Factor Models
  Fama-French 3-factor, OLS with Newey-West, alpha attribution

Repo 6 — Strategy Research
  Cross-sectional momentum, pairs trading, walk-forward ML

Each repo proves you can implement — not just discuss — the concepts. That's what separates candidates who get quant interviews from those who don't.

Sifter generates these repos for you from your completed labs.`,
    quiz: {
      q: 'What makes a quant GitHub portfolio strong?',
      opts: ['Having 100+ repos', 'Having 5-10 well-documented repos each demonstrating implementation of a real concept', 'Forking other people\'s code', 'Keeping repos private'],
      correct: 1,
    },
  },
];

function LearnModule({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const lesson = LESSONS[idx];

  const handleAnswer = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    if (i === lesson.quiz.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx + 1 < LESSONS.length) {
      setIdx(i => i + 1);
      setAnswered(null);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎓 Git & GitHub</Text>
            <GhostBtn label="← Back" onPress={onClose} />
          </View>
          <Card>
            <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 12 }}>🏆</Text>
            <Text style={[styles.lessonTitle, { textAlign: 'center' }]}>Module Complete!</Text>
            <Text style={[styles.body, { textAlign: 'center', marginTop: 8 }]}>
              {score}/{LESSONS.length} correct
            </Text>
            <Text style={[styles.body, { textAlign: 'center', color: Colors.textSoft, marginTop: 8 }]}>
              {score === LESSONS.length
                ? "Perfect. You understand Git. Now connect your account and push your portfolio."
                : "Good start. Connect GitHub and your portfolio will make it concrete."}
            </Text>
          </Card>
          <PrimaryBtn label="Connect GitHub Now →" onPress={onClose} icon="🐙" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Progress bar */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📖 Learn Git</Text>
          <GhostBtn label="✕ Close" onPress={onClose} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((idx) / LESSONS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{idx + 1} of {LESSONS.length}</Text>

        {/* Lesson content */}
        <Card>
          <Text style={styles.lessonIcon}>{lesson.icon}</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.body}>{lesson.body}</Text>
        </Card>

        {/* Quiz */}
        <Card>
          <SectionLabel text="QUICK CHECK" />
          <Text style={[styles.body, { fontWeight: '700', marginBottom: 12 }]}>{lesson.quiz.q}</Text>
          {lesson.quiz.opts.map((opt, i) => {
            let bg = '#f1f5f9';
            let tc = Colors.text;
            if (answered !== null) {
              if (i === lesson.quiz.correct) { bg = '#d1fae5'; tc = '#065f46'; }
              else if (i === answered && i !== lesson.quiz.correct) { bg = '#fee2e2'; tc = '#7f1d1d'; }
            }
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleAnswer(i)}
                style={[styles.optionBtn, { backgroundColor: bg }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, { color: tc }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
          {answered !== null && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                {answered === lesson.quiz.correct ? '✅ Correct!' : `❌ The answer is: "${lesson.quiz.opts[lesson.quiz.correct]}"`}
              </Text>
            </View>
          )}
        </Card>

        {answered !== null && (
          <PrimaryBtn
            label={idx + 1 < LESSONS.length ? 'Next Lesson →' : 'Finish Module →'}
            onPress={handleNext}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOT CONNECTED — explain + connect button
// ─────────────────────────────────────────────────────────────────────────────
function NotConnectedView({
  onConnect,
  onLearn,
  loading,
}: {
  onConnect: () => void;
  onLearn: () => void;
  loading: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Hero */}
      <Card style={styles.heroCard}>
        <Text style={styles.heroIcon}>🐙</Text>
        <Text style={styles.heroTitle}>Build Your Portfolio on GitHub</Text>
        <Text style={styles.heroSub}>
          GitHub is where developers and quants show their work. Connect your account and push your Sifter projects as a portfolio that employers can see.
        </Text>
      </Card>

      {/* What you get */}
      <Card>
        <SectionLabel text="WHAT THIS DOES" />
        {[
          ['🗂️', 'Creates repos', 'Each completed lab becomes a clean GitHub repo with your implementations'],
          ['📄', 'Writes READMEs', 'Auto-generates professional documentation explaining what you built'],
          ['🚀', 'Pushes your code', 'One tap uploads your portfolio — no terminal needed'],
          ['🏆', 'Earns +500 points', 'First push awards a portfolio achievement and points'],
        ].map(([icon, title, desc]) => (
          <View key={title as string} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{title as string}</Text>
              <Text style={styles.featureDesc}>{desc as string}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Connect button */}
      <PrimaryBtn
        label="Connect GitHub Account"
        onPress={onConnect}
        loading={loading}
        icon="🐙"
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>New to GitHub?</Text>
        <View style={styles.dividerLine} />
      </View>

      <Card>
        <Text style={[styles.body, { textAlign: 'center', marginBottom: 12 }]}>
          No account needed to start. Learn what GitHub is first, then create a free account in 2 minutes.
        </Text>
        <GhostBtn label="📖 Learn Git & GitHub (6 lessons)" onPress={onLearn} />
        <GhostBtn label="Create free GitHub account →" onPress={() => Linking.openURL('https://github.com/signup')} />
      </Card>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTED — portfolio push + repo list
// ─────────────────────────────────────────────────────────────────────────────
function ConnectedView({
  status,
  onDisconnect,
  onLearn,
}: {
  status: GitHubStatus;
  onDisconnect: () => void;
  onLearn: () => void;
}) {
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);
  const [repoName, setRepoName] = useState('sifter-quant-portfolio');
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    API.githubRepos()
      .then(setRepos)
      .catch(() => setRepos([]))
      .finally(() => setLoadingRepos(false));
  }, []);

  const handlePush = async () => {
    if (!repoName.trim()) return;
    setPushing(true);
    setPushResult(null);
    try {
      const files = buildPortfolioFiles(user);
      const result = await API.pushPortfolio(repoName.trim(), files);
      setPushResult(`✅ Live at ${result.repo_url}\n\n${result.files_pushed.length} files pushed.`);
      // Refresh repos
      API.githubRepos().then(setRepos).catch(() => {});
    } catch (e: any) {
      setPushResult(`❌ ${e.message}`);
    } finally {
      setPushing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Connected badge */}
      <Card style={styles.connectedBadge}>
        <Text style={styles.ghAvatar}>🐙</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.connectedLabel}>✅ Connected</Text>
          <Text style={styles.connectedUser}>github.com/{status.username}</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(`https://github.com/${status.username}`)}>
          <Text style={styles.viewLink}>View →</Text>
        </TouchableOpacity>
      </Card>

      {/* Push portfolio */}
      <Card>
        <SectionLabel text="PUSH YOUR PORTFOLIO" />
        <Text style={styles.body}>
          This creates a public GitHub repo with your Sifter projects — implementations of Sharpe, Kelly, Markowitz, Black-Scholes, Fama-French, and more. Recruiters and hiring managers can see it directly.
        </Text>
        <Text style={styles.fieldLabel}>Repository name</Text>
        <TextInput
          style={styles.input}
          value={repoName}
          onChangeText={t => setRepoName(t.replace(/\s/g, '-').toLowerCase())}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="sifter-quant-portfolio"
        />
        <PrimaryBtn label="🚀  Push to GitHub" onPress={handlePush} loading={pushing} />
        {pushResult && (
          <View style={[styles.resultBox, { backgroundColor: pushResult.startsWith('✅') ? '#d1fae5' : '#fee2e2' }]}>
            <Text style={[styles.body, { color: pushResult.startsWith('✅') ? '#065f46' : '#7f1d1d' }]}>
              {pushResult}
            </Text>
            {pushResult.startsWith('✅') && (
              <TouchableOpacity onPress={() => Linking.openURL(`https://github.com/${status.username}/${repoName}`)}>
                <Text style={[styles.viewLink, { marginTop: 8 }]}>Open on GitHub →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>

      {/* What gets pushed */}
      <Card>
        <SectionLabel text="WHAT GETS PUSHED" />
        {[
          ['README.md', 'Overview of your quant portfolio with skills summary'],
          ['sharpe_and_risk.py', 'Sharpe ratio, max drawdown, Calmar, VaR, CVaR'],
          ['kelly_and_sizing.py', 'Kelly criterion, continuous and discrete versions'],
          ['markowitz.py', 'Min-variance portfolio via cvxpy with constraints'],
          ['black_scholes.py', 'Full BS pricer with all five Greeks'],
          ['monte_carlo.py', 'GBM simulator with VaR from simulation'],
          ['fama_french.py', 'FF3 regression with Newey-West correction'],
          ['backtester.py', 'Event-driven backtester from scratch'],
          ['momentum.py', 'Cross-sectional momentum signal (12-1 month)'],
          ['pairs_trading.py', 'Cointegration test and spread z-score signal'],
        ].map(([f, d]) => (
          <View key={f as string} style={styles.fileRow}>
            <Text style={styles.fileName}>{f as string}</Text>
            <Text style={styles.fileDesc}>{d as string}</Text>
          </View>
        ))}
      </Card>

      {/* Repos */}
      <Card>
        <SectionLabel text="YOUR REPOS" />
        {loadingRepos && <ActivityIndicator color={Colors.accent} style={{ marginVertical: 16 }} />}
        {!loadingRepos && repos.length === 0 && (
          <Text style={[styles.body, { color: Colors.textSoft }]}>No repos yet. Push your portfolio above to create your first one.</Text>
        )}
        {repos.map(repo => (
          <TouchableOpacity
            key={repo.name}
            style={styles.repoRow}
            onPress={() => Linking.openURL(repo.url)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.repoName}>{repo.name}</Text>
              {repo.description && <Text style={styles.repoDesc} numberOfLines={1}>{repo.description}</Text>}
            </View>
            <Text style={styles.repoMeta}>⭐ {repo.stars}</Text>
          </TouchableOpacity>
        ))}
      </Card>

      {/* Learn module link */}
      <Card>
        <SectionLabel text="LEARN MORE" />
        <GhostBtn label="📖 Git & GitHub lesson (6 lessons)" onPress={onLearn} />
      </Card>

      {/* Disconnect */}
      <GhostBtn label="Disconnect GitHub" onPress={onDisconnect} />
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio file builder — generates real Python files from user's progress
// ─────────────────────────────────────────────────────────────────────────────
function buildPortfolioFiles(user: any): Array<{ path: string; content: string }> {
  const name = user?.username ?? 'Sifter Learner';
  const date = new Date().toISOString().split('T')[0];

  const readme = `# Quant Finance Portfolio — ${name}

Built through [Sifter Skill_Up](https://sifter.app) · Generated ${date}

## About
This repository contains Python implementations of core quantitative finance concepts,
built as part of the Sifter Quant Trader curriculum (Labs 0–8).

## Contents

| File | Concepts |
|---|---|
| \`sharpe_and_risk.py\` | Sharpe ratio, max drawdown, Calmar, VaR, CVaR |
| \`kelly_and_sizing.py\` | Kelly criterion (continuous + discrete) |
| \`markowitz.py\` | Minimum-variance portfolio optimisation (cvxpy) |
| \`black_scholes.py\` | Black-Scholes pricer + all five Greeks |
| \`monte_carlo.py\` | GBM simulation, path generation, simulation VaR |
| \`fama_french.py\` | Fama-French 3-factor attribution with Newey-West |
| \`backtester.py\` | Event-driven backtester from scratch |
| \`momentum.py\` | Cross-sectional momentum (12-1 month, Jegadeesh-Titman) |
| \`pairs_trading.py\` | Cointegration + z-score signal |

## Requirements
\`\`\`
pip install numpy pandas scipy statsmodels cvxpy yfinance pandas-datareader
\`\`\`

## Track
Sifter Quant Trader · Labs 0–8 completed
`;

  const sharpe = `"""
Sharpe Ratio, Max Drawdown, Calmar, VaR, CVaR
Sifter Skill_Up — Lab 8: Applied Quant Python
"""
import numpy as np
import pandas as pd


def sharpe_ratio(returns: np.ndarray, risk_free_annual: float = 0.04) -> float:
    """Annualised Sharpe ratio from daily returns."""
    rf_daily = risk_free_annual / 252
    excess = returns - rf_daily
    if excess.std() == 0:
        return 0.0
    return (excess.mean() / excess.std()) * np.sqrt(252)


def max_drawdown(returns: np.ndarray) -> float:
    """Maximum peak-to-trough drawdown. Returns positive number (e.g. 0.23 = 23%)."""
    equity = (1 + returns).cumprod()
    rolling_max = equity.cummax()
    drawdown = (equity - rolling_max) / rolling_max
    return abs(drawdown.min())


def calmar_ratio(returns: np.ndarray, risk_free: float = 0.04) -> float:
    """Annual excess return divided by max drawdown."""
    ann_ret = (1 + returns.mean()) ** 252 - 1 - risk_free
    mdd = max_drawdown(returns)
    return ann_ret / mdd if mdd > 0 else np.inf


def historical_var(returns: np.ndarray, confidence: float = 0.05, horizon: int = 1) -> float:
    """Historical VaR at given confidence, scaled to horizon days."""
    return -np.percentile(returns, confidence * 100) * np.sqrt(horizon)


def cvar(returns: np.ndarray, confidence: float = 0.05) -> float:
    """Conditional VaR (Expected Shortfall) — mean loss beyond VaR."""
    cutoff = np.percentile(returns, confidence * 100)
    tail = returns[returns <= cutoff]
    return -tail.mean() if len(tail) > 0 else 0.0


if __name__ == "__main__":
    np.random.seed(42)
    daily_returns = np.random.normal(0.0005, 0.012, 252)
    print(f"Sharpe:        {sharpe_ratio(daily_returns):.3f}")
    print(f"Max Drawdown:  {max_drawdown(daily_returns):.1%}")
    print(f"Calmar:        {calmar_ratio(daily_returns):.3f}")
    print(f"1-day 95% VaR: {historical_var(daily_returns):.2%}")
    print(f"CVaR:          {cvar(daily_returns):.2%}")
`;

  const kelly = `"""
Kelly Criterion — Optimal Position Sizing
Sifter Skill_Up — Lab 8: Applied Quant Python
"""
import numpy as np


def kelly_continuous(returns: np.ndarray, fraction: float = 0.5) -> float:
    """
    Kelly fraction for continuous returns: f* = μ / σ²
    fraction: use fractional Kelly (0.5 recommended) to account for estimation error.
    Returns fraction of capital to deploy (positive = long, negative = short).
    """
    mu = returns.mean()
    sigma2 = returns.var()
    if sigma2 == 0:
        return 0.0
    return fraction * (mu / sigma2)


def kelly_discrete(p_win: float, win_mult: float, loss_frac: float = 1.0) -> float:
    """
    Kelly for discrete bets.
    p_win:    probability of winning
    win_mult: multiplier on win (e.g. 2.0 means double your stake)
    loss_frac: fraction of stake lost on loss (1.0 = lose everything)
    """
    p_loss = 1 - p_win
    b = win_mult - 1
    return (p_win * b - p_loss * loss_frac) / b


if __name__ == "__main__":
    np.random.seed(42)
    returns = np.random.normal(0.001, 0.015, 252)
    fk = kelly_continuous(returns, fraction=1.0)
    hk = kelly_continuous(returns, fraction=0.5)
    print(f"Full Kelly:    {fk:.1%} of capital")
    print(f"Half Kelly:    {hk:.1%} of capital  ← recommended")
    print()
    # Coin flip with 2:1 odds
    dk = kelly_discrete(p_win=0.6, win_mult=2.0)
    print(f"Discrete Kelly (60% win, 2:1 odds): {dk:.1%}")
`;

  const markowitz = `"""
Markowitz Minimum-Variance Portfolio
Sifter Skill_Up — Lab 8: Applied Quant Python
"""
import numpy as np
import pandas as pd
import cvxpy as cp


def minimum_variance_portfolio(
    returns_df: pd.DataFrame,
    max_weight: float = 0.30,
    allow_short: bool = False,
) -> dict:
    """
    Minimum variance portfolio via convex optimisation.

    returns_df: daily returns, columns = asset tickers
    max_weight: maximum allocation to any single asset
    allow_short: if True, weights can be negative (short selling allowed)
    """
    mu = returns_df.mean().values
    Sigma = returns_df.cov().values
    n = len(mu)

    w = cp.Variable(n)
    risk = cp.quad_form(w, Sigma)   # wᵀΣw

    constraints = [cp.sum(w) == 1]
    if not allow_short:
        constraints.append(w >= 0)
    constraints.append(w <= max_weight)

    prob = cp.Problem(cp.Minimize(risk), constraints)
    prob.solve(solver=cp.CLARABEL)

    if prob.status not in ('optimal', 'optimal_inaccurate'):
        raise ValueError(f"Optimisation failed: {prob.status}")

    weights = w.value
    port_return = float(mu @ weights) * 252
    port_vol    = float(np.sqrt(weights @ Sigma @ weights)) * np.sqrt(252)
    port_sharpe = port_return / port_vol if port_vol > 0 else 0.0

    return {
        'weights':       dict(zip(returns_df.columns, weights.round(4))),
        'annual_return': round(port_return, 4),
        'annual_vol':    round(port_vol, 4),
        'sharpe':        round(port_sharpe, 4),
    }


if __name__ == "__main__":
    np.random.seed(42)
    tickers = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOG']
    fake_returns = pd.DataFrame(
        np.random.multivariate_normal(
            [0.0008, 0.0007, 0.0012, 0.0006, 0.0007],
            np.diag([0.015, 0.013, 0.022, 0.016, 0.014]) ** 2,
            500,
        ),
        columns=tickers,
    )
    result = minimum_variance_portfolio(fake_returns)
    print("Optimal weights:")
    for ticker, w in result['weights'].items():
        print(f"  {ticker}: {w:.1%}")
    print(f"Annual return: {result['annual_return']:.1%}")
    print(f"Annual vol:    {result['annual_vol']:.1%}")
    print(f"Sharpe:        {result['sharpe']:.3f}")
`;

  const bs = `"""
Black-Scholes Option Pricer + Greeks
Sifter Skill_Up — Lab 8: Applied Quant Python
"""
import numpy as np
from scipy.stats import norm


def black_scholes(
    S: float, K: float, T: float, r: float, sigma: float,
    option_type: str = 'call',
) -> dict:
    """
    Black-Scholes price and Greeks.

    S:           current spot price
    K:           strike price
    T:           time to expiry in years (e.g. 0.25 = 3 months)
    r:           continuous risk-free rate (e.g. 0.04 = 4%)
    sigma:       implied volatility (e.g. 0.20 = 20%)
    option_type: 'call' or 'put'

    Returns dict with price, delta, gamma, vega, theta, rho.
    """
    if T <= 0:
        intrinsic = max(S - K, 0) if option_type == 'call' else max(K - S, 0)
        return {'price': intrinsic, 'delta': float(S > K), 'gamma': 0, 'vega': 0, 'theta': 0, 'rho': 0}

    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)

    if option_type == 'call':
        price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
        delta = norm.cdf(d1)
        rho   = K * T * np.exp(-r * T) * norm.cdf(d2) / 100
    else:
        price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        delta = -norm.cdf(-d1)
        rho   = -K * T * np.exp(-r * T) * norm.cdf(-d2) / 100

    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
    vega  = S * norm.pdf(d1) * np.sqrt(T) / 100
    theta = (
        -(S * norm.pdf(d1) * sigma) / (2 * np.sqrt(T))
        - r * K * np.exp(-r * T) * (norm.cdf(d2) if option_type == 'call' else norm.cdf(-d2))
    ) / 365

    return {
        'price': round(price, 6), 'delta': round(delta, 6),
        'gamma': round(gamma, 6), 'vega':  round(vega, 6),
        'theta': round(theta, 6), 'rho':   round(rho, 6),
    }


if __name__ == "__main__":
    result = black_scholes(S=100, K=100, T=0.25, r=0.04, sigma=0.20, option_type='call')
    print("ATM Call Option:")
    for k, v in result.items():
        print(f"  {k:8s}: {v}")
`;

  const mc = `"""
Monte Carlo GBM Simulation
Sifter Skill_Up — Lab 8: Applied Quant Python
"""
import numpy as np


def simulate_gbm(
    S0: float, mu: float, sigma: float,
    T: float, dt: float = 1/252, n_paths: int = 1000,
    seed: int = None,
) -> np.ndarray:
    """
    Simulate Geometric Brownian Motion price paths.

    S0:      initial price
    mu:      annual drift (e.g. 0.08 = 8%)
    sigma:   annual volatility (e.g. 0.20 = 20%)
    T:       time horizon in years
    dt:      time step (1/252 = daily)
    n_paths: number of simulation paths

    Returns array of shape (n_steps+1, n_paths).
    Note: drift uses (mu - 0.5*sigma²)*dt — the Itô correction is essential.
    """
    if seed is not None:
        np.random.seed(seed)
    n_steps = int(T / dt)
    drift     = (mu - 0.5 * sigma ** 2) * dt
    diffusion = sigma * np.sqrt(dt)
    Z = np.random.standard_normal((n_steps, n_paths))
    log_returns = drift + diffusion * Z
    paths = S0 * np.exp(
        np.vstack([np.zeros(n_paths), log_returns.cumsum(axis=0)])
    )
    return paths


def simulation_var(paths: np.ndarray, confidence: float = 0.05) -> float:
    """VaR from final simulated prices: loss at given confidence percentile."""
    S0 = paths[0, 0]
    final = paths[-1, :]
    returns = (final - S0) / S0
    return -np.percentile(returns, confidence * 100)


if __name__ == "__main__":
    paths = simulate_gbm(S0=100, mu=0.08, sigma=0.20, T=1.0, n_paths=5000, seed=42)
    final = paths[-1]
    print(f"1-year GBM simulation (5,000 paths):")
    print(f"  Mean final price:   ${final.mean():.2f}")
    print(f"  Median final price: ${np.median(final):.2f}")
    print(f"  5th percentile:     ${np.percentile(final, 5):.2f}")
    print(f"  95th percentile:    ${np.percentile(final, 95):.2f}")
    print(f"  Simulation VaR 95%: {simulation_var(paths):.1%}")
`;

  const ff = `"""
Fama-French 3-Factor Attribution
Sifter Skill_Up — Lab 8: Applied Quant Python
"""
import pandas as pd
import numpy as np
import statsmodels.api as sm
import DisclaimerFooter from '../components/DisclaimerFooter';
try:
    import pandas_datareader.data as web
    HAS_DATAREADER = True
except ImportError:
    HAS_DATAREADER = False


def fama_french_attribution(
    returns: pd.Series,
    start: str,
    end: str,
    newey_west_lags: int = 5,
) -> dict:
    """
    Run Fama-French 3-factor regression with Newey-West HAC standard errors.

    returns:          daily asset/portfolio returns (pd.Series with date index)
    start, end:       date strings for factor data download
    newey_west_lags:  HAC lag parameter (rule of thumb: T^0.25)

    Interpretation:
      alpha > 0 and significant → genuine excess return above factor exposure
      high R²              → return mostly explained by factors (no novel alpha)
    """
    if not HAS_DATAREADER:
        raise ImportError("pip install pandas-datareader")

    ff = web.DataReader('F-F_Research_Data_Factors_daily', 'famafrench', start, end)[0] / 100
    data = pd.concat([returns.rename('asset'), ff], axis=1).dropna()
    data['excess'] = data['asset'] - data['RF']

    y = data['excess']
    X = sm.add_constant(data[['Mkt-RF', 'SMB', 'HML']])
    result = sm.OLS(y, X).fit(cov_type='HAC', cov_kwds={'maxlags': newey_west_lags})

    return {
        'alpha_daily':      result.params['const'],
        'alpha_annual':     result.params['const'] * 252,
        'alpha_tstat':      result.tvalues['const'],
        'alpha_pvalue':     result.pvalues['const'],
        'alpha_significant': result.pvalues['const'] < 0.05,
        'market_beta':      result.params['Mkt-RF'],
        'smb_beta':         result.params['SMB'],
        'hml_beta':         result.params['HML'],
        'r_squared':        result.rsquared,
        'n_obs':            int(result.nobs),
    }


if __name__ == "__main__":
    print("Fama-French Attribution")
    print("Usage: fama_french_attribution(my_returns_series, '2018-01-01', '2024-01-01')")
    print("Requires: pandas_datareader, statsmodels")
`;

  return [
    { path: 'README.md', content: readme },
    { path: 'sharpe_and_risk.py', content: sharpe },
    { path: 'kelly_and_sizing.py', content: kelly },
    { path: 'markowitz.py', content: markowitz },
    { path: 'black_scholes.py', content: bs },
    { path: 'monte_carlo.py', content: mc },
    { path: 'fama_french.py', content: ff },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function GitHubScreen() {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [showLearn, setShowLearn] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const s = await API.githubStatus();
      setStatus(s);
    } catch {
      setStatus({ connected: false, username: null, avatar: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleConnect = async () => {
    setConnectLoading(true);
    try {
      const { url } = await API.githubAuthUrl();
      await Linking.openURL(url);
      // Poll for connection after returning from browser
      setTimeout(loadStatus, 3000);
      setTimeout(loadStatus, 8000);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect GitHub', 'Remove GitHub connection from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect', style: 'destructive',
        onPress: async () => {
          await API.githubDisconnect();
          setStatus({ connected: false, username: null, avatar: null });
        },
      },
    ]);
  };

  if (showLearn) {
    return <LearnModule onClose={() => setShowLearn(false)} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🐙 GitHub</Text>
          <Text style={styles.headerSub}>Portfolio · Connect · Learn</Text>
        </View>
        {status?.connected && (
          <TouchableOpacity onPress={() => setShowLearn(true)}>
            <Text style={styles.learnLink}>📖 Learn Git</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      )}

      {!loading && !status?.connected && (
        <NotConnectedView
          onConnect={handleConnect}
          onLearn={() => setShowLearn(true)}
          loading={connectLoading}
        />
      )}

      {!loading && status?.connected && (
        <ConnectedView
          status={status}
          onDisconnect={handleDisconnect}
          onLearn={() => setShowLearn(true)}
        />
      )}
          <DisclaimerFooter />
      </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: Colors.bg },
  scroll:          { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:     { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub:       { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  learnLink:       { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
  card:            { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.sm },
  heroCard:        { alignItems: 'center', paddingVertical: Spacing.xl },
  heroIcon:        { fontSize: 64, marginBottom: 12 },
  heroTitle:       { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  heroSub:         { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 22 },
  sectionLabel:    { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  body:            { fontSize: FontSize.sm, color: Colors.text, lineHeight: 21 },
  fieldLabel:      { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSoft, marginTop: 8, marginBottom: 4, textTransform: 'uppercase' },
  input:           { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, backgroundColor: '#f8fafc', marginBottom: Spacing.sm },
  primaryBtn:      { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center' },
  primaryBtnText:  { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
  ghostBtn:        { alignItems: 'center', paddingVertical: Spacing.md },
  ghostBtnText:    { color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' },
  divider:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dividerLine:     { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText:     { fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '600' },
  featureRow:      { flexDirection: 'row', gap: 12, paddingVertical: 8, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: Colors.border },
  featureIcon:     { fontSize: 24, width: 36, textAlign: 'center' },
  featureTitle:    { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  featureDesc:     { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2, lineHeight: 17 },
  connectedBadge:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ghAvatar:        { fontSize: 40 },
  connectedLabel:  { fontSize: FontSize.sm, fontWeight: '800', color: '#16a34a' },
  connectedUser:   { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  viewLink:        { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
  resultBox:       { borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm },
  fileRow:         { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  fileName:        { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, fontFamily: 'monospace' },
  fileDesc:        { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  repoRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8 },
  repoName:        { fontSize: FontSize.sm, fontWeight: '800', color: Colors.accent },
  repoDesc:        { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  repoMeta:        { fontSize: FontSize.xs, color: Colors.textSoft },
  progressTrack:   { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginHorizontal: Spacing.md, marginBottom: 4 },
  progressFill:    { height: 6, backgroundColor: Colors.accent, borderRadius: 3 },
  progressLabel:   { fontSize: FontSize.xs, color: Colors.textSoft, textAlign: 'center', marginBottom: Spacing.md },
  lessonIcon:      { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  lessonTitle:     { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  optionBtn:       { borderRadius: Radius.md, padding: Spacing.md, marginBottom: 8 },
  optionText:      { fontSize: FontSize.sm, fontWeight: '700' },
  explanationBox:  { backgroundColor: '#f0f4ff', borderRadius: Radius.md, padding: Spacing.md, marginTop: 4 },
  explanationText: { fontSize: FontSize.sm, color: '#1e3a8a', fontWeight: '600' },
});

