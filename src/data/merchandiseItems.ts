/**
 * Sifter Skill_Up — Merchandise Items
 * 28 field-specific apparel lines, one hoodie + tee per field minimum.
 * technical_embedding = the equation/symbol printed on the item.
 * shopify_product_id is blank until Shopify Plus is live.
 *
 * Pricing: ~$45 tee / $85 hoodie retail
 * Merch credits: 1000 credits = $50 max discount (50% cap per item)
 */

import type { MerchandiseItem } from '../types/social';

export const merchandiseItems: MerchandiseItem[] = [

  // ── 01. Crypto / Web3 ──────────────────────────────────────────────────────
  {
    id: 'crypto-hoodie-01', name: 'The Yield Islands Hoodie', field_id: 'crypto',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: 'AMM constant product: x·y = k',
    description: 'Heavy-weight pullover. Front: Sifter wordmark. Back: x·y = k in StarkWare gold.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'defi-research-analyst', description: 'Complete DeFi Research Analyst track' },
  },
  {
    id: 'crypto-tee-01', name: 'On-Chain Tee', field_id: 'crypto',
    category: 'tee', tier: 'core', price_usd: 45, merch_credits_cost: 900,
    technical_embedding: 'STARK proof: C(x, w) ∈ L',
    description: 'Premium cotton tee. Chest: STARK proof equation. Sleeve: "Trust the math."',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'xp_stage', xp_stage: 2, description: 'Reach Stage 2 (Junior Analyst)' },
  },

  // ── 02. Quantitative Finance ───────────────────────────────────────────────
  {
    id: 'quant-hoodie-01', name: 'The Black-Scholes Hoodie', field_id: 'quant',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: 'Black-Scholes: ∂V/∂t + ½σ²S²∂²V/∂S² + rS·∂V/∂S − rV = 0',
    description: 'The equation every quant knows by heart — across the back in white on black.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'quant-trader', description: 'Complete Quant Trader track' },
  },
  {
    id: 'quant-tee-01', name: 'Sharpe Ratio Tee', field_id: 'quant',
    category: 'tee', tier: 'core', price_usd: 45, merch_credits_cost: 900,
    technical_embedding: 'S = (Rp − Rf) / σp',
    description: 'Chest print: Sharpe ratio formula. A badge of honour for risk-adjusted thinkers.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'xp_stage', xp_stage: 2, description: 'Reach Stage 2' },
  },

  // ── 03. AI & Machine Learning ──────────────────────────────────────────────
  {
    id: 'ai-hoodie-01', name: 'The Attention Hoodie', field_id: 'ai-ml',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: 'Attention: softmax(QKᵀ/√d_k)V',
    description: 'Transformer attention mechanism across the back. "Attention is all you need."',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'machine-learning-engineer', description: 'Complete ML Engineer track' },
  },
  {
    id: 'ai-tee-01', name: 'Gradient Descent Tee', field_id: 'ai-ml',
    category: 'tee', tier: 'core', price_usd: 45, merch_credits_cost: 900,
    technical_embedding: 'θ := θ − α∇J(θ)',
    description: 'Gradient descent update rule. The foundation of every model.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'xp_stage', xp_stage: 2, description: 'Reach Stage 2' },
  },

  // ── 04. Software Engineering ───────────────────────────────────────────────
  {
    id: 'software-hoodie-01', name: 'The O(log n) Hoodie', field_id: 'software',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: 'Binary search: O(log n)',
    description: 'Big-O notation back print. "We don\'t do O(n²) here."',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'software-engineer', description: 'Complete Software Engineer track' },
  },
  {
    id: 'software-tee-01', name: 'Recursion Tee', field_id: 'software',
    category: 'tee', tier: 'core', price_usd: 45, merch_credits_cost: 900,
    technical_embedding: 'f(n) = n · f(n−1), f(0) = 1',
    description: 'Fibonacci recursion base case. Front chest print.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'xp_stage', xp_stage: 2, description: 'Reach Stage 2' },
  },

  // ── 05. Cloud & DevOps ─────────────────────────────────────────────────────
  {
    id: 'cloud-hoodie-01', name: 'The 99.99% Uptime Hoodie', field_id: 'cloud-devops',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: 'SLA: 99.99% = 52.6 min/year downtime',
    description: 'For SREs who know the maths behind the nines.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'devops-engineer', description: 'Complete DevOps Engineer track' },
  },

  // ── 06. Cybersecurity ──────────────────────────────────────────────────────
  {
    id: 'cyber-hoodie-01', name: 'The Zero Trust Hoodie', field_id: 'cybersecurity',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: 'Never trust. Always verify.',
    description: 'Zero trust principle on the back. Lock icon embroidered on chest.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'soc-analyst', description: 'Complete SOC Analyst track' },
  },

  // ── 07. Data Science ───────────────────────────────────────────────────────
  {
    id: 'data-hoodie-01', name: 'The Bayes Hoodie', field_id: 'data-science',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: "Bayes' theorem: P(A|B) = P(B|A)·P(A) / P(B)",
    description: 'Bayes equation across the back. For those who update their priors.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'data-scientist', description: 'Complete Data Scientist track' },
  },

  // ── 08–09. Data Analysis & Engineering ─────────────────────────────────────
  {
    id: 'dataeng-tee-01', name: 'The Pipeline Tee', field_id: 'data-engineering',
    category: 'tee', tier: 'core', price_usd: 45, merch_credits_cost: 900,
    technical_embedding: 'ETL: Extract → Transform → Load',
    description: 'Data pipeline flow diagram on chest.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'data-engineer', description: 'Complete Data Engineer track' },
  },

  // ── 10. Supply Chain ───────────────────────────────────────────────────────
  {
    id: 'supplychain-hoodie-01', name: 'The EOQ Hoodie', field_id: 'supply-chain',
    category: 'hoodie', tier: 'expert', price_usd: 85, merch_credits_cost: 1700,
    technical_embedding: 'Economic Order Quantity: EOQ = √(2DS/H)',
    description: 'EOQ formula across the back. For optimisers.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'track_complete', track_id: 'supply-chain-analyst', description: 'Complete Supply Chain Analyst track' },
  },

  // ── Open items (available to all) ─────────────────────────────────────────
  {
    id: 'sifter-cap-01', name: 'Sifter Cap', field_id: 'crypto',
    category: 'cap', tier: 'foundation', price_usd: 35, merch_credits_cost: 700,
    technical_embedding: '⚡ Sifter',
    description: '5-panel cap. Embroidered ⚡ Sifter on front.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'open', description: 'Available to all learners' },
  },
  {
    id: 'sifter-tee-foundation', name: 'Sifter Foundation Tee', field_id: 'crypto',
    category: 'tee', tier: 'foundation', price_usd: 45, merch_credits_cost: 900,
    technical_embedding: '⚡ Learning is compounding.',
    description: 'The entry-level Sifter tee. Front: ⚡ logo. Back: "Learning is compounding."',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'open', description: 'Available to all learners' },
  },
  {
    id: 'sifter-runner-01', name: 'Sifter Runner Sneakers', field_id: 'crypto',
    category: 'footwear', tier: 'foundation', price_usd: 95, merch_credits_cost: 1900,
    technical_embedding: 'Progress compounds daily.',
    description: 'Low-profile trainers with Sifter detailing for learners who want the merch line to extend beyond apparel.',
    image_url: '', shopify_product_id: '', available: true,
    unlock_condition: { type: 'open', description: 'Available to all learners' },
  },
];
