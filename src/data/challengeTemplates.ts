/**
 * Sifter Skill_Up — Challenge Templates
 * FIELD_SUBMISSION_TYPES maps every field to its primary/secondary submission format.
 * CHALLENGE_TEMPLATES are seeded challenges — admins copy/adapt these.
 */

import type { SubmissionType } from '../theme/rewards';

// ─── Field → submission type mapping (spec §4.5) ─────────────────────────────

export const FIELD_SUBMISSION_TYPES: Record<string, {
  primary:   SubmissionType;
  secondary: SubmissionType;
}> = {
  crypto:             { primary: 'written_plus_link',  secondary: 'portfolio_artifact'  },
  quant:              { primary: 'trade_writeup',       secondary: 'data_analysis'       },
  'ai-ml':            { primary: 'code_repo',           secondary: 'portfolio_artifact'  },
  software:           { primary: 'code_repo',           secondary: 'written_plus_link'   },
  'cloud-devops':     { primary: 'code_repo',           secondary: 'written_plus_link'   },
  cybersecurity:      { primary: 'audit_report',        secondary: 'written_plus_link'   },
  'data-science':     { primary: 'data_analysis',       secondary: 'portfolio_artifact'  },
  'data-analysis':    { primary: 'data_analysis',       secondary: 'portfolio_artifact'  },
  'data-engineering': { primary: 'data_analysis',       secondary: 'portfolio_artifact'  },
  'supply-chain':     { primary: 'written_plus_link',   secondary: 'data_analysis'       },
  'product-design':   { primary: 'design_file',         secondary: 'portfolio_artifact'  },
  'digital-marketing':{ primary: 'portfolio_artifact',  secondary: 'written_plus_link'   },
  creative:           { primary: 'video_presentation',  secondary: 'portfolio_artifact'  },
  writing:            { primary: 'written',             secondary: 'portfolio_artifact'  },
  'fintech-blockchain':{ primary: 'written_plus_link',  secondary: 'portfolio_artifact'  },
  'energy-esg':       { primary: 'written_plus_link',   secondary: 'data_analysis'       },
  healthcare:         { primary: 'written_plus_link',   secondary: 'portfolio_artifact'  },
  'legal-compliance': { primary: 'written_plus_link',   secondary: 'portfolio_artifact'  },
  hr:                 { primary: 'written_plus_link',   secondary: 'portfolio_artifact'  },
  sales:              { primary: 'written_plus_link',   secondary: 'portfolio_artifact'  },
  'spec-engineering': { primary: 'written_plus_link',   secondary: 'portfolio_artifact'  },
  'real-estate':      { primary: 'written_plus_link',   secondary: 'data_analysis'       },
  edtech:             { primary: 'design_file',         secondary: 'portfolio_artifact'  },
  'logistics-trade':  { primary: 'written_plus_link',   secondary: 'data_analysis'       },
  insurance:          { primary: 'data_analysis',       secondary: 'written_plus_link'   },
  'public-sector':    { primary: 'written_plus_link',   secondary: 'portfolio_artifact'  },
  agritech:           { primary: 'written_plus_link',   secondary: 'data_analysis'       },
  'comp-science':     { primary: 'code_repo',           secondary: 'portfolio_artifact'  },
};

// ─── Seed challenge templates ─────────────────────────────────────────────────

export const CHALLENGE_TEMPLATES = [
  {
    id:               'defi-research-001',
    title:            'Starknet Protocol Deep Dive',
    field_id:         'crypto',
    track_ids:        ['defi-research-analyst'],
    brief:            `Analyse one Starknet DeFi protocol. Your submission should cover:
1. Protocol mechanics (how does it work?)
2. TVL trend over 30 days with your interpretation
3. Key risks (smart contract, liquidity, economic)
4. Your verdict: bullish, neutral, or bearish — and why

Use DeFiLlama, Dune Analytics, and official docs as sources.`,
    submission_type:  'written_plus_link',
    reward: {
      xp: 200, badge_id: 'challenge_participant', winner_badge_id: 'challenge_winner',
      merch_credits: 50, token_amount: 0, token_currency: 'platform_points',
      cash_cents: 0, cash_currency: 'USD', sponsor_provided: false,
    },
  },
  {
    id:               'quant-backtest-001',
    title:            'Momentum Strategy Backtest',
    field_id:         'quant',
    track_ids:        ['quant-trader', 'quant-developer'],
    brief:            `Build and document a momentum trading strategy backtest. Requirements:
1. Define entry/exit rules clearly
2. Run on at least 2 years of data (any market)
3. Report: Sharpe ratio, max drawdown, win rate
4. Explain what you'd improve with more time

Submit as a write-up with your results table and code repo link (optional).`,
    submission_type:  'trade_writeup',
    reward: {
      xp: 200, badge_id: 'challenge_participant', winner_badge_id: 'challenge_winner',
      merch_credits: 50, token_amount: 0, token_currency: 'platform_points',
      cash_cents: 0, cash_currency: 'USD', sponsor_provided: false,
    },
  },
  {
    id:               'ai-agent-001',
    title:            'Build a Simple AI Agent',
    field_id:         'ai-ml',
    track_ids:        ['ai-engineer', 'llm-engineer'],
    brief:            `Build a minimal AI agent that can complete a defined task. Requirements:
1. Define the task clearly (what does the agent do?)
2. Use any LLM API (OpenAI, Anthropic, etc.)
3. Show it working with 3 example inputs
4. Document limitations and failure modes

Submit via GitHub repo with a README and a brief write-up.`,
    submission_type:  'code_repo',
    reward: {
      xp: 200, badge_id: 'challenge_participant', winner_badge_id: 'challenge_winner',
      merch_credits: 50, token_amount: 0, token_currency: 'platform_points',
      cash_cents: 0, cash_currency: 'USD', sponsor_provided: false,
    },
  },
  {
    id:               'supply-chain-risk-001',
    title:            'Supply Chain Disruption Analysis',
    field_id:         'supply-chain',
    track_ids:        ['supply-chain-analyst', 'supply-chain-risk-analyst'],
    brief:            `Analyse a real supply chain disruption from the last 12 months. Cover:
1. What happened and why
2. Which industries and companies were most affected
3. How companies adapted (or failed to)
4. 3 lessons supply chain professionals should take away

Use real data sources. Cite them in your submission.`,
    submission_type:  'written_plus_link',
    reward: {
      xp: 200, badge_id: 'challenge_participant', winner_badge_id: 'challenge_winner',
      merch_credits: 50, token_amount: 0, token_currency: 'platform_points',
      cash_cents: 0, cash_currency: 'USD', sponsor_provided: false,
    },
  },
];
